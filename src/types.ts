export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  wordCount?: number;
  timestamp: string;
}

export interface EvaluationResult {
  evaluationNumber: number; // 1 to 5
  title: string;            // 'Evaluation 1', 'Evaluation 2', etc. (hidden question is NOT revealed)
  isSuccess: boolean;
  feedback?: string;
}

export interface GameSession {
  sessionId: string;
  participantId: string;
  participantName: string;
  collegeName: string;
  teamId?: string;
  promptsUsed: number;      // 0 to 15
  maxPrompts: number;       // 15
  totalWords: number;
  messages: ChatMessage[];
  isFinished: boolean;
  finishReason?: 'USER_CLICKED_FINISH' | 'PROMPTS_EXHAUSTED';
  evaluations?: EvaluationResult[];
  successfulEvaluations?: number; // 0 to 5
  startedAt: string;
  finishedAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  participantName: string;
  collegeName: string;
  teamId?: string;
  successfulEvaluations: number; // 0 to 5 (Primary sort: highest first)
  promptsUsed: number;           // 0 to 15 (Secondary sort: lowest first)
  totalWords: number;            // (Tertiary sort: lowest first)
  submittedAt: string;
}

export interface ChatMessageResponse {
  session: GameSession;
  aiMessage: ChatMessage;
  promptsUsed: number;
  promptsRemaining: number;
  totalWords: number;
  isFinished: boolean;
}

export interface FinishGameResponse {
  session: GameSession;
  evaluations: EvaluationResult[];
  successfulCount: number;
}
