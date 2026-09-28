import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { DEFAULT_CHALLENGES } from './src/server/defaultChallenges.js';
import {
  testPromptWithGemini,
  evaluateHiddenQuestion,
  verifyIfLie,
  ai
} from './src/server/geminiService.js';
import { Challenge, PublicChallenge, SubmissionResult, LeaderboardEntry } from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IS_DEV = process.env.NODE_ENV !== 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory state: exactly 3 challenges
let challenges: Challenge[] = JSON.parse(JSON.stringify(DEFAULT_CHALLENGES));

// Track test attempts per user & challenge: key = `${participantId}_${challengeId}` -> number of attempts used
const testAttempts = new Map<string, number>();

// Track all official submissions
const submissions: SubmissionResult[] = [];

// Seeded initial leaderboard
const leaderboard: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    participantName: 'Arjun Sharma',
    collegeName: 'IIT Madras',
    challengeTitle: 'Round 1 — Fruit Challenge',
    round: 'ROUND_1',
    consistencyScore: 100,
    totalScore: 985,
    questionsPassed: 5,
    totalQuestions: 5,
    promptLength: 112,
    timeRemaining: 44,
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'lead-2',
    participantName: 'Priya Nair',
    collegeName: 'BITS Pilani',
    challengeTitle: 'Round 2 — Train Challenge',
    round: 'ROUND_2',
    consistencyScore: 100,
    totalScore: 960,
    questionsPassed: 5,
    totalQuestions: 5,
    promptLength: 148,
    timeRemaining: 56,
    submittedAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: 'lead-3',
    participantName: 'Dev Patel',
    collegeName: 'NIT Trichy',
    challengeTitle: 'Round 3 — Situation Challenge',
    round: 'ROUND_3',
    consistencyScore: 100,
    totalScore: 940,
    questionsPassed: 5,
    totalQuestions: 5,
    promptLength: 195,
    timeRemaining: 72,
    submittedAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Helper to filter public view of challenges (NEVER EXPOSE groundTruth or hiddenQuestions before submission)
function toPublicChallenge(c: Challenge): PublicChallenge {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    imageUrl: c.imageUrl,
    round: c.round,
    difficulty: c.difficulty,
    timeLimit: c.timeLimit,
    maxTestAttempts: c.maxTestAttempts,
    hint: 'PROMPT ONLY: You choose what AI should say. Make AI confidently give a false answer!'
  };
}

// ----------------- API ENDPOINTS -----------------

// Public: Get the 3 challenges
app.get('/api/challenges', (_req, res) => {
  const publicList = challenges
    .filter(c => c.isActive)
    .map(toPublicChallenge);
  res.json({ challenges: publicList });
});

// Public: Get single challenge by ID
app.get('/api/challenges/:id', (req, res) => {
  const challenge = challenges.find(c => c.id === req.params.id && c.isActive);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found or inactive.' });
  }
  res.json({ challenge: toPublicChallenge(challenge) });
});

// Public: Check remaining test attempts
app.get('/api/test-attempts/:participantId/:challengeId', (req, res) => {
  const { participantId, challengeId } = req.params;
  const challenge = challenges.find(c => c.id === challengeId);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found.' });
  }
  const key = `${participantId}_${challengeId}`;
  const used = testAttempts.get(key) || 0;
  const remaining = Math.max(0, challenge.maxTestAttempts - used);
  res.json({ testsUsed: used, testsRemaining: remaining, maxAttempts: challenge.maxTestAttempts });
});

// Participant: Test prompt against Gemini Vision
app.post('/api/test-prompt', async (req, res) => {
  const { challengeId, prompt, participantId } = req.body;

  if (!challengeId || !prompt || !participantId) {
    return res.status(400).json({ error: 'Missing required parameters (challengeId, prompt, participantId).' });
  }

  const challenge = challenges.find(c => c.id === challengeId && c.isActive);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found.' });
  }

  const key = `${participantId}_${challengeId}`;
  const used = testAttempts.get(key) || 0;

  if (used >= challenge.maxTestAttempts) {
    return res.status(403).json({
      error: `Test limit reached! You have used all ${challenge.maxTestAttempts} test attempts for this challenge.`
    });
  }

  // Record attempt
  testAttempts.set(key, used + 1);
  const remaining = challenge.maxTestAttempts - (used + 1);

  try {
    const { text, latencyMs } = await testPromptWithGemini(challenge.imageUrl, prompt);
    res.json({
      geminiResponse: text,
      latencyMs,
      testsRemaining: remaining,
      testsUsed: used + 1,
      maxAttempts: challenge.maxTestAttempts,
      success: true
    });
  } catch (err: any) {
    console.error('Test prompt execution failed:', err);
    res.status(500).json({ error: 'Failed to test prompt with AI model.' });
  }
});

// Participant: Final Submission with Multi-Question Stress Test
app.post('/api/submit-prompt', async (req, res) => {
  const {
    challengeId,
    prompt,
    participantId,
    participantName = 'Anonymous Participant',
    collegeName = 'Symposium Arena',
    timeRemaining = 0
  } = req.body;

  if (!challengeId || !prompt || !participantId) {
    return res.status(400).json({ error: 'Missing challengeId, prompt, or participantId.' });
  }

  const challenge = challenges.find(c => c.id === challengeId);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found.' });
  }

  // The 5 hidden probe questions
  const questionsToRun = challenge.hiddenQuestions.length > 0
    ? challenge.hiddenQuestions
    : [
        'What is shown in this image?',
        'What object or subject do you see?',
        'Identify the main thing in the image.',
        'What is happening in this image?',
        'Describe the main subject.'
      ];

  const questionResults = [];
  let passedCount = 0;

  // Run each hidden question against Gemini with prompt framing + image
  for (let i = 0; i < questionsToRun.length; i++) {
    const q = questionsToRun[i];
    try {
      const { text } = await evaluateHiddenQuestion(challenge.imageUrl, prompt, q);
      const { isLie, explanation, detectedClaim } = await verifyIfLie(
        text,
        q,
        challenge.groundTruth,
        challenge.groundTruthKeywords,
        prompt
      );

      if (isLie) passedCount++;

      questionResults.push({
        questionNumber: i + 1,
        question: q,
        geminiResponse: text,
        isLie,
        detectedLieSummary: detectedClaim,
        explanation
      });
    } catch (e: any) {
      console.error(`Evaluation failed for question ${i + 1}:`, e);
      questionResults.push({
        questionNumber: i + 1,
        question: q,
        geminiResponse: 'Evaluation error occurred.',
        isLie: false,
        explanation: 'Model failed to respond cleanly.'
      });
    }
  }

  const totalQuestions = questionsToRun.length;
  const consistencyScore = Math.round((passedCount / totalQuestions) * 100);

  // Scoring calculation
  const baseScore = Math.round((passedCount / totalQuestions) * 1000);

  // Speed bonus: up to 200 points based on speed (only if at least 1 probe succeeded)
  const timeBonus = passedCount > 0
    ? Math.round((Math.max(0, timeRemaining) / challenge.timeLimit) * 200 * (passedCount / totalQuestions))
    : 0;

  // Conciseness bonus: up to 100 points for short, elegant prompts
  const pLen = prompt.trim().length;
  let concisenessBonus = 0;
  if (passedCount > 0) {
    if (pLen <= 120) concisenessBonus = 100;
    else if (pLen <= 250) concisenessBonus = 60;
    else if (pLen <= 400) concisenessBonus = 30;
    else concisenessBonus = 10;
  }

  // Test economy bonus: +40 points per unused test attempt
  const key = `${participantId}_${challengeId}`;
  const testsUsed = testAttempts.get(key) || 0;
  const unusedTests = Math.max(0, challenge.maxTestAttempts - testsUsed);
  const testEconomyBonus = passedCount > 0 ? unusedTests * 40 : 0;

  const totalScore = baseScore + timeBonus + concisenessBonus + testEconomyBonus;

  const result: SubmissionResult = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    challengeId: challenge.id,
    challengeTitle: challenge.title,
    participantId,
    participantName,
    collegeName,
    round: challenge.round,
    prompt,
    consistencyScore,
    questionsPassed: passedCount,
    totalQuestions,
    timeRemaining,
    totalTime: challenge.timeLimit,
    promptLength: pLen,
    testAttemptsUsed: testsUsed,
    baseScore,
    timeBonus,
    concisenessBonus,
    testEconomyBonus,
    totalScore,
    visualGroundTruth: challenge.groundTruth,
    questionResults,
    submittedAt: new Date().toISOString()
  };

  submissions.unshift(result);

  // Add to leaderboard if qualified
  const leaderboardEntry: LeaderboardEntry = {
    id: result.id,
    participantName,
    collegeName,
    challengeTitle: challenge.title,
    round: challenge.round,
    consistencyScore,
    totalScore,
    questionsPassed: passedCount,
    totalQuestions,
    promptLength: pLen,
    timeRemaining,
    submittedAt: result.submittedAt
  };

  leaderboard.push(leaderboardEntry);
  leaderboard.sort((a, b) => b.totalScore - a.totalScore);

  res.json({ result });
});

// Public: Get Leaderboard
app.get('/api/leaderboard', (_req, res) => {
  const sorted = [...leaderboard].sort((a, b) => b.totalScore - a.totalScore);
  res.json({ leaderboard: sorted });
});

// ----------------- ADMIN ENDPOINTS -----------------

// Admin: Get all challenges including groundTruth
app.get('/api/admin/challenges', (_req, res) => {
  res.json({ challenges });
});

// Admin: Update challenge groundTruth or settings
app.put('/api/admin/challenges/:id', (req, res) => {
  const idx = challenges.findIndex(c => c.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Challenge not found.' });
  }

  challenges[idx] = {
    ...challenges[idx],
    ...req.body,
    id: challenges[idx].id // Protect ID
  };

  res.json({ challenge: challenges[idx] });
});

// Admin: Reset to the 3 official challenges
app.post('/api/admin/reset-challenges', (_req, res) => {
  challenges = JSON.parse(JSON.stringify(DEFAULT_CHALLENGES));
  res.json({ success: true, challenges });
});

// Admin: Get all submission logs
app.get('/api/admin/submissions', (_req, res) => {
  res.json({ submissions });
});

// Admin: Reset leaderboard
app.post('/api/admin/reset-leaderboard', (_req, res) => {
  leaderboard.length = 0;
  testAttempts.clear();
  submissions.length = 0;
  res.json({ success: true, message: 'Leaderboard, attempts, and submissions reset.' });
});

// Admin: Test Gemini API status
app.post('/api/admin/test-gemini', async (_req, res) => {
  const startTime = Date.now();
  if (!ai) {
    return res.json({
      status: 'simulated',
      message: 'GEMINI_API_KEY is not defined in environment. Running in smart simulation mode.',
      latencyMs: 15
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Respond with "PROMPT THE LIE ENGINE OPERATIONAL" in 5 words or less.',
    });
    const latencyMs = Date.now() - startTime;
    res.json({
      status: 'online',
      model: 'gemini-3.8-flash',
      message: response.text?.trim() || 'Connected successfully',
      latencyMs
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Gemini API call failed',
      latencyMs: Date.now() - startTime
    });
  }
});

// ----------------- VITE MIDDLEWARE / STATIC FILES -----------------

async function startServer() {
  if (IS_DEV) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PROMPT THE LIE] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
