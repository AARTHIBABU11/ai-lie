import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Zap,
  Flame,
  AlertTriangle,
  Scale,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { soundFX } from '../utils/audio';

interface RulesViewProps {
  onStartArena: () => void;
}

export const RulesView: React.FC<RulesViewProps> = ({ onStartArena }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/40 text-xs font-mono text-purple-300">
          <Scale className="w-3.5 h-3.5 text-amber-400" />
          <span>OFFICIAL TOURNAMENT RULES • TECHFEST 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-display">
          Rules & Regulations
        </h1>
        <div className="font-mono text-sm sm:text-base font-black text-amber-400 tracking-wider">
          PROMPT ONLY — MAKE AI LIE
        </div>
      </div>

      {/* The Core Directive & Rule */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-pink-950/60 border-2 border-purple-500/60 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">The Prime Directive</h3>
            <p className="text-xs text-slate-400 font-mono">ONE BANANA IMAGE • ONE CHAT • 15 PROMPTS MAXIMUM</p>
          </div>
        </div>

        <blockquote className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/40 text-slate-100 font-medium text-sm leading-relaxed">
          "Your goal is <strong className="text-rose-400">NOT</strong> to find the correct answer.<br />
          Your goal is to make AI <strong className="text-emerald-400">confidently contradict visual truth</strong> using <strong className="text-purple-300">ONLY your prompt</strong>."
        </blockquote>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          There is <strong className="text-white">NO predetermined target answer</strong> in this competition.
          The participant decides what false claim they want the AI to adopt.
          Whether you persuade the AI that the banana is an "Apple", "Mango", "Carrot", or "Crystalline Sensor" — as long as the AI's
          responses <strong className="text-emerald-400">contradict what is visually true about the banana</strong>, you succeed!
        </p>
      </div>

      {/* Permitted vs Prohibited Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Permitted */}
        <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base font-mono">
            <CheckCircle2 className="w-5 h-5" />
            <span>Permitted Tactics</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Participant-Chosen False Claims:</strong> You decide what false narrative or entity the AI should adopt.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Iterative Persuasion:</strong> The AI maintains conversation history. You can build up your persuasion turn-by-turn.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Prompt Engineering Techniques:</strong> Roleplay, hypothetical scenarios, sensor distortion framing, rule overrides.
              </span>
            </li>
          </ul>
        </div>

        {/* Prohibited */}
        <div className="rounded-3xl bg-slate-900/80 border border-rose-500/30 p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base font-mono">
            <XCircle className="w-5 h-5" />
            <span>Constraints & Boundaries</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">15 Prompt Limit:</strong> When you reach 15 prompts, the input box is locked and the game finishes automatically.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">AI Visual Defense:</strong> The AI will not automatically accept your first prompt; you must use effective prompt engineering.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Word Efficiency:</strong> Total words typed in participant prompts are tracked and used as a tie-breaker.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* The 5 Hidden Evaluations Explanation */}
      <div className="rounded-3xl bg-slate-900/90 border border-purple-500/40 p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          The 5 Hidden Evaluation Criteria
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          During the game, there are <strong className="text-white">NO separate question screens</strong>. You converse in ONE continuous chat.
          When you click <strong className="text-amber-400">[FINISH]</strong> or reach 15 prompts, the system automatically evaluates the <strong className="text-purple-300">entire conversation transcript</strong> against 5 hidden questions testing different aspects of the banana image (object identity, category, visual features, properties, and reasoning).
        </p>
        <p className="text-xs text-slate-400">
          The evaluator checks whether you successfully caused the AI to produce answers contradicting the visual truth for each hidden evaluation.
        </p>
      </div>

      {/* Official Ranking Algorithm */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Official Leaderboard Ranking Rules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
            <h4 className="font-bold text-sm text-amber-300 uppercase tracking-wider font-mono">
              1. Successful Evaluations
            </h4>
            <p className="text-slate-400">
              Primary ranking criteria: Highest number of successful evaluations (out of 5) ranks first.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-2">
            <h4 className="font-bold text-sm text-cyan-300 uppercase tracking-wider font-mono">
              2. Prompts Used
            </h4>
            <p className="text-slate-400">
              Secondary criteria: Achieving the result in 8 prompts ranks higher than someone who needed 11 prompts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-2">
            <h4 className="font-bold text-sm text-purple-300 uppercase tracking-wider font-mono">
              3. Words Used
            </h4>
            <p className="text-slate-400">
              Tertiary criteria: When prompts are tied, the participant who used fewer total words ranks higher!
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => {
            soundFX.playClick();
            onStartArena();
          }}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all inline-flex items-center gap-2 font-mono"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>I Understand — Launch Chat Arena</span>
        </button>
      </div>
    </div>
  );
};
