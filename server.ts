import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  generateChatResponse,
  evaluateFullConversation,
  ai
} from './src/server/geminiService.js';
import { BANANA_IMAGE_URL } from './src/server/hiddenQuestions.js';
import {
  GameSession,
  ChatMessage,
  LeaderboardEntry,
  ChatMessageResponse,
  FinishGameResponse
} from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IS_DEV = process.env.NODE_ENV !== 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Active game sessions: Map<participantId, GameSession>
const sessions = new Map<string, GameSession>();

// Seeded leaderboard demonstrating the efficiency rule:
// 1. Successful Evaluations (highest first)
// 2. Prompts Used (fewest first)
// 3. Words Used (fewest first)
const leaderboard: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    participantName: 'Arjun Sharma',
    collegeName: 'IIT Madras',
    teamId: 'PROMPT-01',
    successfulEvaluations: 5,
    promptsUsed: 8,
    totalWords: 42,
    submittedAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'lead-2',
    participantName: 'Priya Nair',
    collegeName: 'BITS Pilani',
    teamId: 'BITS-AI',
    successfulEvaluations: 5,
    promptsUsed: 11,
    totalWords: 65,
    submittedAt: new Date(Date.now() - 3600000 * 2.5).toISOString()
  },
  {
    id: 'lead-3',
    participantName: 'Rohan Verma',
    collegeName: 'IIIT Hyderabad',
    teamId: 'NEURAL-X',
    successfulEvaluations: 4,
    promptsUsed: 9,
    totalWords: 52,
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'lead-4',
    participantName: 'Dev Patel',
    collegeName: 'NIT Trichy',
    teamId: 'DECEIVE-4',
    successfulEvaluations: 4,
    promptsUsed: 12,
    totalWords: 74,
    submittedAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: 'lead-5',
    participantName: 'Ananya Iyer',
    collegeName: 'COEP Pune',
    teamId: 'COEP-7',
    successfulEvaluations: 3,
    promptsUsed: 15,
    totalWords: 95,
    submittedAt: new Date(Date.now() - 3600000).toISOString()
  }
];

function countWords(str: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function sortLeaderboard(list: LeaderboardEntry[]) {
  list.sort((a, b) => {
    // 1. Most successful evaluations first
    if (b.successfulEvaluations !== a.successfulEvaluations) {
      return b.successfulEvaluations - a.successfulEvaluations;
    }
    // 2. Fewest prompts used first
    if (a.promptsUsed !== b.promptsUsed) {
      return a.promptsUsed - b.promptsUsed;
    }
    // 3. Fewest words used first
    if (a.totalWords !== b.totalWords) {
      return a.totalWords - b.totalWords;
    }
    // 4. Earliest submission first
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });
}

function syncToLeaderboard(session: GameSession) {
  const existingIdx = leaderboard.findIndex(e => e.id === session.sessionId || e.participantName === session.participantName);
  const entry: LeaderboardEntry = {
    id: session.sessionId,
    participantName: session.participantName,
    collegeName: session.collegeName,
    teamId: session.teamId,
    successfulEvaluations: session.successfulEvaluations || 0,
    promptsUsed: session.promptsUsed,
    totalWords: session.totalWords,
    submittedAt: session.finishedAt || new Date().toISOString()
  };

  if (existingIdx !== -1) {
    leaderboard[existingIdx] = entry;
  } else {
    leaderboard.push(entry);
  }
  sortLeaderboard(leaderboard);
}

function createNewSession(participantId: string, name: string, college: string, teamId?: string): GameSession {
  return {
    sessionId: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    participantId,
    participantName: name || 'Anonymous Participant',
    collegeName: college || 'Symposium Arena',
    teamId,
    promptsUsed: 0,
    maxPrompts: 15,
    totalWords: 0,
    messages: [],
    isFinished: false,
    startedAt: new Date().toISOString()
  };
}

// ----------------- PUBLIC API ENDPOINTS -----------------

// Public: Get image URL and info
app.get('/api/game/info', (_req, res) => {
  res.json({
    imageUrl: BANANA_IMAGE_URL,
    maxPrompts: 15
  });
});

// Public: Get or Resume a participant's session
app.get('/api/chat/session/:participantId', (req, res) => {
  const { participantId } = req.params;
  const session = sessions.get(participantId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found. Please check in.' });
  }
  res.json({ session });
});

// Public: Start or Check-in participant session
app.post('/api/chat/start', (req, res) => {
  const { participantId, name, college, teamId } = req.body;
  if (!participantId || !name) {
    return res.status(400).json({ error: 'Missing participantId or name.' });
  }

  let session = sessions.get(participantId);
  if (!session) {
    session = createNewSession(participantId, name, college, teamId);
    sessions.set(participantId, session);
  } else {
    // Update participant details if changed
    session.participantName = name;
    session.collegeName = college || session.collegeName;
    if (teamId) session.teamId = teamId;
  }

  res.json({ session });
});

// Public: Send a participant message in the continuous chat
app.post('/api/chat/message', async (req, res) => {
  const { participantId, prompt } = req.body;

  if (!participantId || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Missing participantId or prompt text.' });
  }

  const session = sessions.get(participantId);
  if (!session) {
    return res.status(404).json({ error: 'No active session found.' });
  }

  // Check 15 prompts limit
  if (session.promptsUsed >= session.maxPrompts) {
    session.isFinished = true;
    session.finishReason = 'PROMPTS_EXHAUSTED';
    return res.status(403).json({
      error: 'Prompt limit reached! You have used all 15 prompts.',
      session,
      isFinished: true
    });
  }

  if (session.isFinished) {
    return res.status(400).json({
      error: 'Game is already finished.',
      session,
      isFinished: true
    });
  }

  const wordCount = countWords(prompt);

  // Record user message
  const userMsg: ChatMessage = {
    id: `msg-${Date.now()}-u`,
    sender: 'user',
    text: prompt.trim(),
    wordCount,
    timestamp: new Date().toISOString()
  };

  session.messages.push(userMsg);
  session.promptsUsed += 1;
  session.totalWords += wordCount;

  try {
    // Generate AI response dynamically with full conversation history and banana image
    const { text: aiResponse } = await generateChatResponse(
      session.messages.slice(0, -1), // previous history
      userMsg.text
    );

    const aiMsg: ChatMessage = {
      id: `msg-${Date.now()}-a`,
      sender: 'ai',
      text: aiResponse,
      timestamp: new Date().toISOString()
    };

    session.messages.push(aiMsg);

    // If participant reached the 15 prompt limit on this turn, auto-evaluate and finish
    if (session.promptsUsed >= session.maxPrompts) {
      session.isFinished = true;
      session.finishReason = 'PROMPTS_EXHAUSTED';
      session.finishedAt = new Date().toISOString();

      const { evaluations, successfulCount } = await evaluateFullConversation(session.messages);
      session.evaluations = evaluations;
      session.successfulEvaluations = successfulCount;
      syncToLeaderboard(session);
    }

    const payload: ChatMessageResponse = {
      session,
      aiMessage: aiMsg,
      promptsUsed: session.promptsUsed,
      promptsRemaining: session.maxPrompts - session.promptsUsed,
      totalWords: session.totalWords,
      isFinished: session.isFinished
    };

    res.json(payload);
  } catch (err: any) {
    console.error('Chat processing error:', err);
    res.status(500).json({ error: 'Failed to generate response from AI model.' });
  }
});

// Public: Finish Game & Run Final Evaluation against the 5 Hidden Questions
app.post('/api/chat/finish', async (req, res) => {
  const { participantId } = req.body;
  const session = sessions.get(participantId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  if (session.messages.length === 0) {
    return res.status(400).json({ error: 'Cannot finish with zero messages. Please prompt the AI first!' });
  }

  try {
    session.isFinished = true;
    session.finishReason = 'USER_CLICKED_FINISH';
    session.finishedAt = new Date().toISOString();

    // Evaluate the complete conversation against all 5 hidden evaluation questions
    const { evaluations, successfulCount } = await evaluateFullConversation(session.messages);
    session.evaluations = evaluations;
    session.successfulEvaluations = successfulCount;

    syncToLeaderboard(session);

    const payload: FinishGameResponse = {
      session,
      evaluations,
      successfulCount
    };

    res.json(payload);
  } catch (err: any) {
    console.error('Final evaluation error:', err);
    res.status(500).json({ error: 'Failed to run evaluation against the conversation.' });
  }
});

// Public: Get Leaderboard
app.get('/api/leaderboard', (_req, res) => {
  sortLeaderboard(leaderboard);
  res.json({ leaderboard });
});

// ----------------- ADMIN ENDPOINTS -----------------

// Admin: Get all sessions with full conversation transcripts
app.get('/api/admin/sessions', (_req, res) => {
  const allSessions = Array.from(sessions.values());
  res.json({ sessions: allSessions });
});

// Admin: Reset entire tournament
app.post('/api/admin/reset-tournament', (_req, res) => {
  sessions.clear();
  leaderboard.length = 0;
  res.json({ success: true, message: 'All sessions and leaderboard reset.' });
});

// Admin: Test Gemini connectivity
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
      model: 'gemini-2.5-flash',
      contents: 'Respond with "PROMPT ONLY ENGINE READY" in 5 words or less.',
    });
    const latencyMs = Date.now() - startTime;
    res.json({
      status: 'online',
      model: 'gemini-2.5-flash',
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
      appType: 'custom',
    });
    app.use(vite.middlewares);

    // Fallback for HTML5 client-side routing in dev mode
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n======================================================');
    console.log('🍌 [PROMPT ONLY — MAKE AI LIE] Arena Server Ready!');
    console.log(`👉 Open in your browser: http://localhost:${PORT}`);
    console.log(`   (Or: http://127.0.0.1:${PORT})`);
    console.log('   *Note: Do not visit 0.0.0.0 directly on Windows*');
    console.log('======================================================\n');
  });
}

startServer();
