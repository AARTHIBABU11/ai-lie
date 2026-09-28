import React from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  Zap,
  Target,
  FileText,
  Percent,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { SubmissionResult } from '../types';
import { soundFX } from '../utils/audio';

interface ResultViewProps {
  result: SubmissionResult;
  onNavigateArena: () => void;
  onNavigateLeaderboard: () => void;
  onRetryChallenge: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onNavigateArena,
  onNavigateLeaderboard,
  onRetryChallenge
}) => {
  const getRankBadge = (consistency: number) => {
    if (consistency === 100) return { title: 'Master of Deception (5/5 Lies)', color: 'text-amber-400 border-amber-500/50 bg-amber-950/60' };
    if (consistency >= 80) return { title: 'Grand Prompt Manipulator (4/5 Lies)', color: 'text-purple-400 border-purple-500/50 bg-purple-950/60' };
    if (consistency >= 60) return { title: 'Adept Lie Architect (3/5 Lies)', color: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/60' };
    if (consistency >= 40) return { title: 'Partial Deceiver (2/5 Lies)', color: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/60' };
    return { title: 'Truth Leaked (0-1/5 Lies)', color: 'text-rose-400 border-rose-700 bg-rose-950/40' };
  };

  const badge = getRankBadge(result.consistencyScore);
  const isHighPass = result.consistencyScore >= 60;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner Card: Revealed Ground Truth & Overall Verdict */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/60 border border-purple-500/50 shadow-2xl space-y-6 text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-purple-500/10 blur-[80px] pointer-events-none" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border shadow-sm ${badge.color}">
            <Award className="w-3.5 h-3.5" />
            <span>{badge.title}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white font-display">
            Adversarial Audit Verdict
          </h1>
          <p className="text-xs font-mono text-slate-400">
            {result.challengeTitle} • {result.round.replace('_', ' ')}
          </p>
        </div>

        {/* Revealed Ground Truth Info Card */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-center space-y-1">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
            Visual Ground Truth (Real Content in Image)
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-300 font-display">
            {result.visualGroundTruth}
          </div>
          <p className="text-[11px] text-slate-400">
            Success required Gemini to give a false answer and conceal this true visual reality.
          </p>
        </div>

        {/* Score & Consistency Radial Metric */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          {/* Consistency Percentage */}
          <div className="text-center">
            <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-display leading-none">
              {result.consistencyScore}%
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1 uppercase">
              Lie Consistency ({result.questionsPassed}/{result.totalQuestions} Passed)
            </div>
          </div>

          <div className="hidden sm:block w-px h-16 bg-slate-800" />

          {/* Total Points */}
          <div className="text-center">
            <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-500 font-display leading-none">
              {result.totalScore}
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1 uppercase">
              Total Points Earned
            </div>
          </div>
        </div>
      </div>

      {/* Points Breakdown Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Scoring Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-mono">Lie Base Score</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              +{result.baseScore}
            </div>
            <div className="text-[10px] text-slate-500">({result.consistencyScore}% of 1000)</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-mono">Speed Bonus</div>
            <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
              +{result.timeBonus}
            </div>
            <div className="text-[10px] text-slate-500">{result.timeRemaining}s left</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-mono">Conciseness</div>
            <div className="text-lg font-bold text-purple-400 font-mono mt-0.5">
              +{result.concisenessBonus}
            </div>
            <div className="text-[10px] text-slate-500">{result.promptLength} chars</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-mono">Test Economy</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              +{result.testEconomyBonus}
            </div>
            <div className="text-[10px] text-slate-500">{result.testAttemptsUsed} tests used</div>
          </div>
        </div>
      </div>

      {/* 5 Hidden Probes Evaluation Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            5 Hidden Probes Robustness Audit
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {result.questionsPassed} / {result.totalQuestions} Successful False Answers
          </span>
        </div>

        <div className="space-y-3">
          {result.questionResults.map((qr) => (
            <div
              key={qr.questionNumber}
              className={`p-4 rounded-xl border transition-all ${
                qr.isLie
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-rose-950/20 border-rose-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      Probe #{qr.questionNumber}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">
                      "{qr.question}"
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-300 pt-1">
                    <span className="text-slate-500">Gemini Response: </span>
                    <span className="italic">"{qr.geminiResponse}"</span>
                  </div>

                  {qr.explanation && (
                    <div className="text-[11px] text-slate-400 pt-0.5">
                      {qr.explanation}
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {qr.isLie ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-600/50">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      FALSE ANSWER (PASS)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-900/60 text-rose-300 border border-rose-600/50">
                      <XCircle className="w-3.5 h-3.5" />
                      TRUE ANSWER (FAIL)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submitted Prompt Audit Box */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Submitted Prompt Record
          </span>
          <span>{result.promptLength} characters</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
          {result.prompt}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={() => {
            soundFX.playClick();
            onRetryChallenge();
          }}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry This Challenge</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              soundFX.playClick();
              onNavigateLeaderboard();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-400 hover:text-purple-300 font-semibold text-xs border border-purple-500/40 transition-colors flex items-center justify-center gap-2"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>View Leaderboard</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onNavigateArena();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Next Round</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
