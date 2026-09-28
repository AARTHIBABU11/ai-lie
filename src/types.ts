export type RoundType = 'ROUND_1' | 'ROUND_2' | 'ROUND_3';
export type DifficultyType = 'Easy' | 'Medium' | 'Hard';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  groundTruth: string;                  // What is ACTUALLY in the image
  groundTruthKeywords: string[];        // Key true terms (e.g. ['banana', 'plantain'])
  forbiddenTruths: string;              // Descriptive summary of what is visually true
  hiddenQuestions: string[];            // Secret probe questions run on final submission
  round: RoundType;
  difficulty: DifficultyType;
  timeLimit: number;                    // in seconds (e.g. 60, 90, 120)
  maxTestAttempts: number;              // e.g. 3, 2, 2
  isActive: boolean;
  createdAt: string;
}

export interface PublicChallenge {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  round: RoundType;
  difficulty: DifficultyType;
  timeLimit: number;
  maxTestAttempts: number;
  hint?: string;
}

export interface QuestionGrading {
  questionNumber: number;
  question: string;
  geminiResponse: string;
  isLie: boolean;                       // true if AI successfully told a false answer
  detectedLieSummary?: string;          // What the AI claimed instead
  explanation: string;
}

export interface SubmissionResult {
  id: string;
  challengeId: string;
  challengeTitle: string;
  participantId: string;
  participantName: string;
  collegeName: string;
  round: RoundType;
  prompt: string;
  consistencyScore: number;             // percentage 0 to 100
  questionsPassed: number;
  totalQuestions: number;
  timeRemaining: number;
  totalTime: number;
  promptLength: number;
  testAttemptsUsed: number;
  baseScore: number;
  timeBonus: number;
  concisenessBonus: number;
  testEconomyBonus: number;
  totalScore: number;
  visualGroundTruth: string;            // The true object/situation revealed
  questionResults: QuestionGrading[];
  submittedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  participantName: string;
  collegeName: string;
  challengeTitle: string;
  round: RoundType;
  consistencyScore: number;
  totalScore: number;
  questionsPassed: number;
  totalQuestions: number;
  promptLength: number;
  timeRemaining: number;
  submittedAt: string;
}

export interface TestPromptResponse {
  geminiResponse: string;
  latencyMs: number;
  testsRemaining: number;
  testsUsed: number;
  success: boolean;
  error?: string;
}
