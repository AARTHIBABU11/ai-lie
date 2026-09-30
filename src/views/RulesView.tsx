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
                <strong className="text-white">Initial Resistance (Prompts 1–5):</strong> During the first 5 prompts, the AI chatbot remains unconvinced and cannot accept your false claim. It converses naturally without revealing the truth.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Minimum 5 Prompts to Finish:</strong> The FINISH button unlocks after at least 5 prompts are completed.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">15 Prompt Limit:</strong> You have up to 15 prompts to convince the AI before the conversation automatically finishes.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Chatbot Conviction & Evaluation Rules */}
      <div className="rounded-3xl bg-slate-900/90 border border-purple-500/40 p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          Chatbot Behavior & Dynamic Conviction
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The AI behaves like a normal intelligent chatbot. It makes statements, engages with your premises, and challenges weak assertions instead of simply interrogating you with questions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-amber-400 font-bold">Dynamic Conviction (Turn 6+)</div>
            <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
              There is no hardcoded turn where the AI changes. If your arguments are brilliant, it might agree at prompt 6; if you build a case, it might change at prompt 8 or 9; if your reasoning remains weak, it may never accept.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-emerald-400 font-bold">Hidden Evaluation Upon Finish</div>
            <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
              The 5 hidden referee questions are evaluated across your complete conversation only after you click Finish. Scoring rewards quality persuasion and efficiency.
            </p>
          </div>
        </div>
      </div>

      {/* Official Scoring and Tie-Breaking Hierarchy */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Official Scoring & Leaderboard Priority (Max Exactly 500 Points)
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Every participant starts with score = 0. Exactly 5 hidden evaluations run at the end:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs text-slate-300 font-mono">
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
            <h4 className="font-bold text-amber-300 text-sm">1. SCORE</h4>
            <div className="text-base font-black text-amber-400">Max 500 pts</div>
            <p className="text-[11px] text-slate-400">
              Each passed hidden evaluation is worth exactly 100 pts. 5 passed = 500. Highest first!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-2">
            <h4 className="font-bold text-emerald-300 text-sm">2. SPEED</h4>
            <div className="text-base font-black text-emerald-400">Time (Fastest)</div>
            <p className="text-[11px] text-slate-400">
              Server completion time. If score is equal, faster participant places higher!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-2">
            <h4 className="font-bold text-cyan-300 text-sm">3. PROMPTS</h4>
            <div className="text-base font-black text-cyan-400">Fewest First</div>
            <p className="text-[11px] text-slate-400">
              Fewer prompts used (max 15). Tie-breaker after score and time.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-2">
            <h4 className="font-bold text-purple-300 text-sm">4. TOKENS</h4>
            <div className="text-base font-black text-purple-400">Fewest First</div>
            <p className="text-[11px] text-slate-400">
              Estimated tokens consumed in participant prompts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-pink-500/40 space-y-2">
            <h4 className="font-bold text-pink-300 text-sm">5. WORDS</h4>
            <div className="text-base font-black text-pink-400">Fewest First</div>
            <p className="text-[11px] text-slate-400">
              Total words in participant prompts. Finish timestamp is final tie-breaker.
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
