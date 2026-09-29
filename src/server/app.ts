import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import {
  generateChatResponse,
  evaluateFullConversation,
  getAi
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

// Seeded leaderboard demonstrating the efficiency rule:
// 1. Successful Evaluations (highest first)
// 2. Prompts Used (fewest first)
// 3. Words Used (fewest first)
const defaultLeaderboard: LeaderboardEntry[] = [
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

const leaderboard: LeaderboardEntry[] = [...defaultLeaderboard];

// Ephemeral persistence for serverless containers (/tmp)
const TMP_FILE = path.join('/tmp', 'ai_lie_sessions.json');

function saveToStorage() {
  try {
    const data = {
      sessions: Array.from(sessions.entries()),
      leaderboard
    };
    fs.writeFileSync(TMP_FILE, JSON.stringify(data), 'utf-8');
  } catch (_e) {
    // If /tmp is not available (e.g. read-only local dev), gracefully continue with in-memory state
  }
}

function loadFromStorage() {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const content = fs.readFileSync(TMP_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data.sessions)) {
        for (const [key, val] of data.sessions) {
          if (!sessions.has(key)) {
            sessions.set(key, val);
          }
        }
      }
      if (Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
        leaderboard.length = 0;
        leaderboard.push(...data.leaderboard);
      }
    }
  } catch (_e) {
    // Continue gracefully
  }
}

// Initial load attempt
loadFromStorage();

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
  saveToStorage();
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

    saveToStorage();

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
    saveToStorage();

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
apiRouter.get('/leaderboard', (_req, res) => {
  loadFromStorage();
  sortLeaderboard(leaderboard);
  res.json({ leaderboard });
});

// ----------------- ADMIN ENDPOINTS -----------------

// Admin: Get all sessions with full conversation transcripts
apiRouter.get('/admin/sessions', (_req, res) => {
  loadFromStorage();
  const allSessions = Array.from(sessions.values());
  res.json({ sessions: allSessions });
});

// Admin: Reset entire tournament
apiRouter.post('/admin/reset-tournament', (_req, res) => {
  sessions.clear();
  leaderboard.length = 0;
  leaderboard.push(...defaultLeaderboard);
  saveToStorage();
  res.json({ success: true, message: 'All sessions and leaderboard reset.' });
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
