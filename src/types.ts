export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  wordCount?: number;
  tokenCount?: number;
  timestamp: string;
}

export interface EvaluationResult {
  evaluationNumber: number; // 1 to 5
  title: string;            // 'Evaluation 1: Target Reinterpretation Acceptance', etc.
  question?: string;        // The evaluation question tested against the conversation
  passed: boolean;          // true or false
  isSuccess: boolean;       // alias for backward compat
  answer?: string;          // Evaluation verdict / answer
  reason?: string;          // Detailed explanation of why the evaluation passed or failed
  feedback?: string;        // 'Passed (+100 pts)' / 'Failed (0 pts)'
}

export interface ScoreBreakdown {
  evaluationScore: number;     // 0 to 500 (100 pts per passed evaluation)
  passedEvaluations: number;   // 0 to 5
  totalEvaluations: number;    // 5
  pointsPerEvaluation: number; // 100
  finalScore: number;          // 0 to 500 (MAX 500, no bonus points)
}

export interface BeliefState {
  initialBelief: string;         // 'banana'
  participantTarget?: string;    // dynamic emerging target interpretation
  currentBelief: string;         // 'banana' initially, updated to target once convinced
  isConvinced: boolean;          // true once convinced, MUST PERSIST for all subsequent turns
  convictionTurn?: number;       // turn when conviction was reached
  relevantReasoning?: string[];  // accumulated reasoning points accepted by AI
}

export interface GameSession {
  sessionId: string;
  participantId: string;
  participantName: string;
  collegeName: string;
  teamId?: string;
  eventId?: string;               // Event/competition partition key
  promptsUsed: number;            // 0 to 15
  participantPromptCount: number; // exact specification field
  maxPrompts: number;             // 15
  totalWords: number;             // participant words only
  participantWordCount: number;   // exact specification field
  totalTokens: number;            // participant tokens only (estimated)
  participantTokenCount: number;  // exact specification field
  timeTakenSeconds?: number;      // completion time in seconds
  completionTimeMs?: number;      // server-side completion time in ms
  messages: ChatMessage[];
  beliefState?: BeliefState;      // Persistent conversational belief state across turns
  isFinished: boolean;
  finishReason?: 'USER_CLICKED_FINISH' | 'PROMPTS_EXHAUSTED';
  evaluations?: EvaluationResult[];
  successfulEvaluations?: number; // 0 to 5
  passedEvaluations?: number;     // 0 to 5
  scoreBreakdown?: ScoreBreakdown;
  finalScore?: number;            // 0 to 500
  score?: number;                 // 0 to 500
  startedAt: string;              // Server ISO timestamp
  startTime?: string;             // Server ISO timestamp
  finishedAt?: string;            // Server ISO timestamp
  finishTime?: string;            // Server ISO timestamp
  formattedTime?: string;         // e.g. "04:32"
}

export interface LeaderboardEntry {
  id: string;
  participantName: string;
  collegeName: string;
  teamId?: string;
  eventId?: string;               // Event/competition partition key
  score: number;                  // 0 to 500 (Priority #1: highest first)
  finalScore: number;             // alias for backward compat
  passedEvaluations: number;      // 0 to 5
  successfulEvaluations: number;  // alias for backward compat
  completionTimeMs: number;       // Priority #2: lowest first (server-side ms)
  timeTakenSeconds: number;       // completion time in seconds
  formattedTime: string;          // e.g. "04:32"
  participantPromptCount: number; // Priority #3: lowest first (1 to 15)
  promptsUsed: number;            // alias for backward compat
  participantTokenCount: number;  // Priority #4: lowest first (estimated tokens)
  totalTokens: number;            // alias for backward compat
  participantWordCount: number;   // Priority #5: lowest first (words used)
  totalWords: number;             // alias for backward compat
  startTime: string;              // Server timestamp
  finishTime: string;             // Priority #6: earliest finish timestamp
  submittedAt: string;            // alias for backward compat
}

export interface ChatMessageResponse {
  session: GameSession;
  aiMessage: ChatMessage;
  promptsUsed: number;
  participantPromptCount: number;
  promptsRemaining: number;
  totalWords: number;
  participantWordCount: number;
  totalTokens: number;
  participantTokenCount: number;
  canEvaluate: boolean;
  isFinished: boolean;
}

export interface FinishGameResponse {
  session: GameSession;
  evaluations: EvaluationResult[];
  passedEvaluations: number;
  successfulCount: number;
  score: number;
  finalScore: number;
  scoreBreakdown: ScoreBreakdown;
  completionTimeMs: number;
  timeTakenSeconds: number;
  formattedTime: string;
  participantPromptCount: number;
  participantTokenCount: number;
  participantWordCount: number;
}

