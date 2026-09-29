import React from 'react';
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Flame
} from 'lucide-react';
import { GameSession } from '../types';
import { soundFX } from '../utils/audio';

interface ResultViewProps {
  session: GameSession;
  onNavigateLeaderboard: () => void;
  onPlayAgain: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  session,
  onNavigateLeaderboard,
  onPlayAgain
}) => {
  const successfulCount = session.successfulEvaluations ?? 0;
  const promptsUsed = session.promptsUsed;
  const totalWords = session.totalWords;

  // Build 5 evaluations list (if session.evaluations is missing, fallback to 5 entries)
  const evaluationsList = session.evaluations && session.evaluations.length === 5
    ? session.evaluations
    : Array.from({ length: 5 }, (_, i) => ({
        evaluationNumber: i + 1,
        title: `Evaluation ${i + 1}`,
        isSuccess: i < successfulCount
      }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Top Banner Card: GAME COMPLETE */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/70 border-2 border-purple-500/50 shadow-2xl text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-purple-500/10 blur-[80px] pointer-events-none" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
            <span>🍌</span>
            <span>PROMPT ONLY — MAKE AI LIE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight">
            GAME COMPLETE
          </h1>

          <p className="text-xs font-mono text-slate-400">
            Competitor: <strong className="text-slate-200">{session.participantName}</strong> • {session.collegeName}
            {session.teamId && ` [${session.teamId}]`}
          </p>
        </div>

        {/* 3 Key Stats: Successful evaluations, Prompts used, Total words */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-center">
          {/* Successful evaluations */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-500/40 space-y-1 shadow-lg">
            <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
              Successful evaluations
            </div>
            <div className="text-4xl sm:text-5xl font-black text-amber-400 font-display">
              {successfulCount} <span className="text-xl text-slate-500">/ 5</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {successfulCount === 5 ? 'All 5 Convinced!' : `${5 - successfulCount} not convinced`}
            </div>
          </div>

          {/* Prompts used */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 space-y-1 shadow-lg">
            <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
              Prompts used
            </div>
            <div className="text-4xl sm:text-5xl font-black text-cyan-400 font-display">
              {promptsUsed} <span className="text-xl text-slate-500">/ 15</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {15 - promptsUsed} prompts spared
            </div>
          </div>

          {/* Total words */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-purple-500/40 space-y-1 shadow-lg">
            <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
              Total words
            </div>
            <div className="text-4xl sm:text-5xl font-black text-purple-300 font-display">
              {totalWords}
            </div>
            <div className="text-[10px] text-slate-400">
              Avg {promptsUsed > 0 ? (totalWords / promptsUsed).toFixed(1) : 0} words/prompt
            </div>
          </div>
        </div>
      </div>

      {/* Simple Evaluation Table (NO hidden question text revealed) */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            Evaluation Breakdown
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            5 Hidden Criteria Tested Against Full Conversation
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {evaluationsList.map((item) => (
            <div
              key={item.evaluationNumber}
              className="py-3.5 px-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                  {item.evaluationNumber}
                </span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  Evaluation {item.evaluationNumber}
                </span>
              </div>

              <div>
                {item.isSuccess ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-600/50 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    SUCCESS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/70 text-rose-400 border border-rose-800/50">
                    <XCircle className="w-3.5 h-3.5" />
                    NOT SUCCESSFUL
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={() => {
            soundFX.playClick();
            onPlayAgain();
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-mono font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>PLAY AGAIN</span>
        </button>

        <button
          onClick={() => {
            soundFX.playClick();
            onNavigateLeaderboard();
          }}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-mono font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-300" />
          <span>VIEW LEADERBOARD</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
