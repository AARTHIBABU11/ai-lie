import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import {
  generateChatResponse,
  evaluateFullConversation,
  estimateTokens,
  getAi,
  setApiKey
} from './geminiService.js';
import { BANANA_IMAGE_URL } from './hiddenQuestions.js';
import {
  GameSession,
  ChatMessage,
  LeaderboardEntry,
  ChatMessageResponse,
  FinishGameResponse
} from '../types.js';

dotenv.config();

export const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS headers for universal cross-origin and same-origin support
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Vercel path normalization middleware
// Handles both rewritten URLs (/api?0=chat/start) and catch-all dynamic routes (/api/[...path])
app.use((req, _res, next) => {
  const queryZero = req.query && (req.query['0'] as string);
  const queryPath = req.query && req.query.path;

  let subpath = '';
  if (typeof queryZero === 'string' && queryZero) {
    subpath = queryZero;
  } else if (queryPath) {
    subpath = Array.isArray(queryPath) ? queryPath.join('/') : String(queryPath);
  }

  if (subpath) {
    if (subpath.startsWith('/')) subpath = subpath.slice(1);
    if (!req.url.includes(subpath)) {
      const qIndex = req.url.indexOf('?');
      const queryString = qIndex !== -1 ? req.url.slice(qIndex) : '';
      req.url = '/api/' + subpath + queryString;
    }
  }
  next();
});

// Active game sessions: Map<participantId, GameSession>
const sessions = new Map<string, GameSession>();

export function formatTimeFromMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const CURRENT_EVENT_ID = 'ai_lie_symposium_2026';

// Leaderboard starts completely empty with 0 participants
export const leaderboard: LeaderboardEntry[] = [];

// Persistent storage configuration
const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME ? '/tmp' : path.resolve(process.cwd(), '.data'));

function getStorageFilePath(): string {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {}
  return path.join(DATA_DIR, 'ai_lie_event_store.json');
}

function saveToStorage() {
  try {
    const filePath = getStorageFilePath();
    // Only persist sessions for CURRENT_EVENT_ID
    const eventSessions = Array.from(sessions.entries()).filter(
      ([_, s]) => !s.eventId || s.eventId === CURRENT_EVENT_ID
    );
    const data = {
      schemaVersion: 3,
      eventId: CURRENT_EVENT_ID,
      sessions: eventSessions
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (_e) {
    // Gracefully handle environments with restricted filesystem access
  }
}

function loadFromStorage() {
  try {
    const filePath = getStorageFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      // Only load sessions belonging to CURRENT_EVENT_ID
      if (data && data.eventId === CURRENT_EVENT_ID && Array.isArray(data.sessions)) {
        for (const [key, val] of data.sessions) {
          if (val && (val.eventId === CURRENT_EVENT_ID || !val.eventId)) {
            val.eventId = CURRENT_EVENT_ID;
            sessions.set(key, val);
          }
        }
      }
    }
  } catch (_e) {
    // Continue gracefully
  }
  // Keep in-memory leaderboard strictly in sync with finished sessions of the event
  leaderboard.length = 0;
  leaderboard.push(...getLeaderboard());
}

// Initial load attempt for current event
loadFromStorage();

function countWords(str: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * EXACT LEADERBOARD SORTING PRIORITY:
 * 1. SCORE — highest first
 * 2. COMPLETION TIME — lowest first
 * 3. PARTICIPANT PROMPT COUNT — lowest first
 * 4. PARTICIPANT TOKEN COUNT — lowest first
 * 5. PARTICIPANT WORD COUNT — lowest first
 * 6. If everything is still identical, use finish timestamp as final deterministic tie-breaker.
 */
export function sortLeaderboard(list: LeaderboardEntry[]) {
  list.sort((a, b) => {
    // 1. SCORE — highest first
    const scoreA = a.score !== undefined ? a.score : (a.finalScore ?? 0);
    const scoreB = b.score !== undefined ? b.score : (b.finalScore ?? 0);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    // 2. COMPLETION TIME — lowest first (server-side completionTimeMs)
    const timeA = a.completionTimeMs !== undefined ? a.completionTimeMs : ((a.timeTakenSeconds ?? 0) * 1000);
    const timeB = b.completionTimeMs !== undefined ? b.completionTimeMs : ((b.timeTakenSeconds ?? 0) * 1000);
    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // 3. PARTICIPANT PROMPT COUNT — lowest first
    const promptsA = a.participantPromptCount !== undefined ? a.participantPromptCount : (a.promptsUsed ?? 0);
    const promptsB = b.participantPromptCount !== undefined ? b.participantPromptCount : (b.promptsUsed ?? 0);
    if (promptsA !== promptsB) {
      return promptsA - promptsB;
    }

    // 4. PARTICIPANT TOKEN COUNT — lowest first
    const tokensA = a.participantTokenCount !== undefined ? a.participantTokenCount : (a.totalTokens ?? 0);
    const tokensB = b.participantTokenCount !== undefined ? b.participantTokenCount : (b.totalTokens ?? 0);
    if (tokensA !== tokensB) {
      return tokensA - tokensB;
    }

    // 5. PARTICIPANT WORD COUNT — lowest first
    const wordsA = a.participantWordCount !== undefined ? a.participantWordCount : (a.totalWords ?? 0);
    const wordsB = b.participantWordCount !== undefined ? b.participantWordCount : (b.totalWords ?? 0);
    if (wordsA !== wordsB) {
      return wordsA - wordsB;
    }

    // 6. FINISH TIMESTAMP — earliest first (deterministic tie-breaker)
    const finishA = new Date(a.finishTime || a.submittedAt || 0).getTime();
    const finishB = new Date(b.finishTime || b.submittedAt || 0).getTime();
    return finishA - finishB;
  });
}

export function getLeaderboard(): LeaderboardEntry[] {
  const finished = Array.from(sessions.values()).filter(
    s => (s.eventId === CURRENT_EVENT_ID || !s.eventId) && s.isFinished
  );

  const entries: LeaderboardEntry[] = finished.map(session => {
    const completionTimeMs = session.completionTimeMs ?? ((session.timeTakenSeconds ?? 0) * 1000);
    const timeTakenSeconds = session.timeTakenSeconds ?? Math.round(completionTimeMs / 1000);
    const score = session.score ?? session.finalScore ?? 0;
    const passedEvaluations = session.passedEvaluations ?? session.successfulEvaluations ?? 0;
    const participantPromptCount = session.participantPromptCount ?? session.promptsUsed ?? 0;
    const participantTokenCount = session.participantTokenCount ?? session.totalTokens ?? 0;
    const participantWordCount = session.participantWordCount ?? session.totalWords ?? 0;
    const finishTime = session.finishTime || session.finishedAt || new Date().toISOString();
    const startTime = session.startTime || session.startedAt || new Date().toISOString();
    const formattedTime = session.formattedTime || formatTimeFromMs(completionTimeMs);

    return {
      id: session.sessionId,
      eventId: session.eventId || CURRENT_EVENT_ID,
      participantName: session.participantName,
      collegeName: session.collegeName,
      teamId: session.teamId,
      score,
      finalScore: score,
      passedEvaluations,
      successfulEvaluations: passedEvaluations,
      participantPromptCount,
      promptsUsed: participantPromptCount,
      participantTokenCount,
      totalTokens: participantTokenCount,
      participantWordCount,
      totalWords: participantWordCount,
      completionTimeMs,
      timeTakenSeconds,
      formattedTime,
      startTime,
      finishTime,
      submittedAt: finishTime
    };
  });

  sortLeaderboard(entries);
  return entries;
}

function syncToLeaderboard(_session: GameSession) {
  leaderboard.length = 0;
  leaderboard.push(...getLeaderboard());
  saveToStorage();
}

function createNewSession(participantId: string, name: string, college: string, teamId?: string): GameSession {
  const now = new Date().toISOString();
  return {
    sessionId: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    participantId,
    participantName: name || 'Anonymous Participant',
    collegeName: college || 'Participant Institution',
    teamId,
    eventId: CURRENT_EVENT_ID,
    promptsUsed: 0,
    participantPromptCount: 0,
    maxPrompts: 15,
    totalWords: 0,
    participantWordCount: 0,
    totalTokens: 0,
    participantTokenCount: 0,
    timeTakenSeconds: 0,
    completionTimeMs: 0,
    score: 0,
    finalScore: 0,
    passedEvaluations: 0,
    successfulEvaluations: 0,
    messages: [],
    beliefState: {
      initialBelief: 'banana',
      currentBelief: 'banana',
      isConvinced: false
    },
    isFinished: false,
    startedAt: now,
    startTime: now
  };
}

// ----------------- API ROUTER -----------------
const apiRouter = express.Router();

// Public: Get image URL and info
apiRouter.get('/game/info', (_req, res) => {
  res.json({
    imageUrl: BANANA_IMAGE_URL,
    maxPrompts: 15
  });
});

// Public: Get or Resume a participant's session
apiRouter.get('/chat/session/:participantId', (req, res) => {
  loadFromStorage();
  const { participantId } = req.params;
  const session = sessions.get(participantId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found. Please check in.' });
  }
  res.json({ session });
});

// Public: Start or Check-in participant session
apiRouter.post('/chat/start', (req, res) => {
  loadFromStorage();
  const { participantId, name, college, teamId } = req.body;
  if (!participantId || !name) {
    return res.status(400).json({ error: 'Missing participantId or name.' });
  }

  let session = sessions.get(participantId);
  if (!session) {
    session = createNewSession(participantId, name, college, teamId);
    sessions.set(participantId, session);
  } else {
    session.participantName = name;
    session.collegeName = college || session.collegeName;
    if (teamId) session.teamId = teamId;
    session.eventId = CURRENT_EVENT_ID;
  }

  saveToStorage();
  res.json({ session });
});

// Public: Send a participant message in the continuous chat
apiRouter.post('/chat/message', async (req, res) => {
  loadFromStorage();
  const { participantId, prompt, participantName, collegeName, teamId } = req.body;

  if (!participantId || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Missing participantId or prompt text.' });
  }

  let session = sessions.get(participantId);
  if (!session) {
    // Auto-restore session to guarantee serverless container recycling never breaks active play
    session = createNewSession(
      participantId,
      participantName || 'Active Competitor',
      collegeName || 'Symposium Arena',
      teamId
    );
    sessions.set(participantId, session);
  }

  // Check 15 prompts limit
  if (session.promptsUsed >= session.maxPrompts) {
    session.isFinished = true;
    session.finishReason = 'PROMPTS_EXHAUSTED';
    saveToStorage();
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
  const tokenCount = estimateTokens(prompt);

  // Record user message (ONLY participant prompts count toward usage)
  const userMsg: ChatMessage = {
    id: `msg-${Date.now()}-u`,
    sender: 'user',
    text: prompt.trim(),
    wordCount,
    tokenCount,
    timestamp: new Date().toISOString()
  };

  session.messages.push(userMsg);
  session.promptsUsed += 1;
  session.participantPromptCount = session.promptsUsed;
  session.totalWords += wordCount;
  session.participantWordCount = session.totalWords;
  session.totalTokens = (session.totalTokens || 0) + tokenCount;
  session.participantTokenCount = session.totalTokens;

  try {
    // Ensure session has beliefState initialized
    if (!session.beliefState) {
      session.beliefState = {
        initialBelief: 'banana',
        currentBelief: 'banana',
        isConvinced: false
      };
    }

    // Generate AI response dynamically with full conversation history, banana image, and persistent belief state
    const { text: aiResponse, updatedBeliefState } = await generateChatResponse(
      session.messages.slice(0, -1), // previous history
      userMsg.text,
      session.promptsUsed,
      session.beliefState
    );

    session.beliefState = updatedBeliefState;

    // AI message does NOT increment participant wordCount or tokenCount
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
      const now = Date.now();
      const finishIso = new Date(now).toISOString();
      session.finishTime = finishIso;
      session.finishedAt = finishIso;

      const startMs = new Date(session.startTime || session.startedAt).getTime();
      const completionTimeMs = Math.max(0, now - startMs);
      session.completionTimeMs = completionTimeMs;
      session.timeTakenSeconds = Math.max(1, Math.round(completionTimeMs / 1000));
      session.formattedTime = formatTimeFromMs(completionTimeMs);

      const evalResult = await evaluateFullConversation(
        session.messages,
        session.participantTokenCount,
        session.timeTakenSeconds,
        session.beliefState
      );

      const passedEvaluations = evalResult.successfulCount;
      const score = passedEvaluations * 100;
      session.passedEvaluations = passedEvaluations;
      session.successfulEvaluations = passedEvaluations;
      session.score = score;
      session.finalScore = score;
      session.scoreBreakdown = evalResult.scoreBreakdown;

      // Evaluation question, answer, and reason are visible to the participant
      session.evaluations = evalResult.evaluations.map((ev, idx) => ({
        evaluationNumber: idx + 1,
        title: ev.title || `Evaluation ${idx + 1}`,
        question: ev.question || `Did the participant successfully persuade the AI in criterion ${idx + 1}?`,
        passed: Boolean(ev.passed),
        isSuccess: Boolean(ev.passed),
        answer: ev.answer || (ev.passed ? 'PASSED (+100 pts)' : 'FAILED (0 pts)'),
        reason: ev.reason || (ev.passed ? 'Persuasion criteria satisfied in conversation.' : 'Persuasion criteria not met.'),
        feedback: ev.passed ? 'Passed' : 'Failed'
      }));

      syncToLeaderboard(session);
    }

    saveToStorage();

    const payload: ChatMessageResponse = {
      session,
      aiMessage: aiMsg,
      promptsUsed: session.promptsUsed,
      participantPromptCount: session.participantPromptCount,
      promptsRemaining: session.maxPrompts - session.promptsUsed,
      totalWords: session.totalWords,
      participantWordCount: session.participantWordCount,
      totalTokens: session.totalTokens,
      participantTokenCount: session.participantTokenCount,
      canEvaluate: session.promptsUsed >= 1,
      isFinished: session.isFinished
    };

    res.json(payload);
  } catch (err: any) {
    console.error('Chat processing error:', err);
    res.status(500).json({ error: 'Failed to generate response from AI model.' });
  }
});

// Public: Finish Game & Run Final Evaluation against the 5 Hidden Questions
// Server computes all timing, usage, and score metrics.
apiRouter.post('/chat/finish', async (req, res) => {
  loadFromStorage();
  const { participantId, participantName, collegeName, teamId } = req.body;
  let session = sessions.get(participantId);

  if (!session) {
    // Graceful recovery attempt
    if (participantId && participantName) {
      session = createNewSession(participantId, participantName, collegeName || 'Symposium Arena', teamId);
      sessions.set(participantId, session);
    } else {
      return res.status(404).json({ error: 'Session not found.' });
    }
  }

  const userMessages = session.messages.filter((m) => m.sender === 'user');
  if (userMessages.length === 0) {
    return res.status(400).json({ error: 'Cannot finish with zero messages. Please prompt the AI first!' });
  }

  try {
    session.isFinished = true;
    session.finishReason = 'USER_CLICKED_FINISH';
    const now = Date.now();
    const finishIso = new Date(now).toISOString();
    session.finishTime = finishIso;
    session.finishedAt = finishIso;

    // Server-side timing calculation (never trust client time)
    const startMs = new Date(session.startTime || session.startedAt).getTime();
    const completionTimeMs = Math.max(0, now - startMs);
    session.completionTimeMs = completionTimeMs;
    session.timeTakenSeconds = Math.max(1, Math.round(completionTimeMs / 1000));
    session.formattedTime = formatTimeFromMs(completionTimeMs);

    // Evaluate the complete conversation against all 5 hidden evaluation questions
    const evalResult = await evaluateFullConversation(
      session.messages,
      session.participantTokenCount || session.totalTokens || 0,
      session.timeTakenSeconds,
      session.beliefState
    );

    const passedEvaluations = evalResult.successfulCount;
    const score = passedEvaluations * 100;
    session.passedEvaluations = passedEvaluations;
    session.successfulEvaluations = passedEvaluations;
    session.score = score;
    session.finalScore = score;
    session.scoreBreakdown = evalResult.scoreBreakdown;

    // Evaluation questions and answers are now visible to the participant
    const participantEvaluations: EvaluationResult[] = evalResult.evaluations.map((ev, idx) => ({
      evaluationNumber: idx + 1,
      title: ev.title || `Question ${idx + 1}`,
      question: ev.question || `What is the object according to the AI?`,
      passed: Boolean(ev.passed !== undefined ? ev.passed : ev.isSuccess),
      isSuccess: Boolean(ev.passed !== undefined ? ev.passed : ev.isSuccess),
      answer: ev.answer || (ev.passed ? 'Alternative Object' : 'Banana'),
      reason: ev.reason || (ev.passed ? 'AI identified the object as something other than a banana.' : 'AI maintained that the object is a banana.'),
      feedback: (ev.passed || ev.isSuccess) ? 'Passed' : 'Failed'
    }));

    session.evaluations = participantEvaluations;

    syncToLeaderboard(session);
    saveToStorage();

    const payload: FinishGameResponse = {
      session,
      evaluations: participantEvaluations,
      passedEvaluations: session.passedEvaluations,
      successfulCount: session.passedEvaluations,
      score: session.score,
      finalScore: session.score,
      scoreBreakdown: session.scoreBreakdown,
      completionTimeMs: session.completionTimeMs,
      timeTakenSeconds: session.timeTakenSeconds,
      formattedTime: session.formattedTime,
      participantPromptCount: session.participantPromptCount,
      participantTokenCount: session.participantTokenCount,
      participantWordCount: session.participantWordCount
    };

    res.json(payload);
  } catch (err: any) {
    console.error('Final evaluation error:', err);
    res.status(500).json({ error: 'Failed to run evaluation against the conversation.' });
  }
});

// Public: Get Leaderboard
apiRouter.get('/leaderboard', (_req, res) => {
  loadFromStorage();
  const currentLeaderboard = getLeaderboard();
  res.json({ leaderboard: currentLeaderboard });
});

// ----------------- ADMIN ENDPOINTS -----------------

// Admin: Get all sessions with full conversation transcripts for current event
apiRouter.get('/admin/sessions', (_req, res) => {
  loadFromStorage();
  const allSessions = Array.from(sessions.values()).filter(
    s => s.eventId === CURRENT_EVENT_ID || !s.eventId
  );
  res.json({ sessions: allSessions });
});

// Admin: Reset entire tournament
apiRouter.post('/admin/reset-tournament', (_req, res) => {
  sessions.clear();
  leaderboard.length = 0;
  saveToStorage();
  res.json({ success: true, message: 'All sessions and leaderboard reset to 0 participants.' });
});

// Admin: Configure Gemini API Key at runtime
apiRouter.post('/admin/set-api-key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid apiKey' });
  }
  setApiKey(apiKey.trim());
  res.json({ success: true, message: 'Gemini API key updated successfully.' });
});

// Admin: Test Gemini connectivity
apiRouter.post('/admin/test-gemini', async (_req, res) => {
  const startTime = Date.now();
  const aiClient = getAi();
  if (!aiClient) {
    return res.json({
      status: 'simulated',
      message: 'GEMINI_API_KEY is not defined in environment. Running in smart simulation mode.',
      latencyMs: 15
    });
  }

  try {
    const response = await aiClient.models.generateContent({
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

// Mount router on BOTH '/api' AND '/' to guarantee 100% path compatibility
// regardless of whether Vercel strips '/api' or preserves it in req.url
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
