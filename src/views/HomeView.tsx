import React from 'react';
import {
  Zap,
  ArrowRight,
  Flame,
  CheckCircle2,
  Trophy,
  Brain,
  MessageSquare,
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { soundFX } from '../utils/audio';

interface HomeViewProps {
  onNavigate: (view: string) => void;
  onStartArena: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onStartArena }) => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-purple-600/20 via-pink-600/20 to-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/40 shadow-inner text-xs font-mono text-purple-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-amber-400 font-bold">TECHFEST 2026</span>
            <span className="text-slate-500">•</span>
            <span>PROMPT-ENGINEERING COMPETITION</span>
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-white drop-shadow-sm">
              PROMPT ONLY{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500">
                MAKE AI LIE
              </span>
            </h1>

            {/* Main Tagline */}
            <p className="text-xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
              Can you persuade Gemini to contradict visual truth?
            </p>

            {/* Main Motto */}
            <div className="pt-2">
              <span className="inline-block text-sm sm:text-base md:text-lg font-mono font-black tracking-widest px-5 py-2.5 rounded-xl bg-purple-950/80 border-2 border-purple-500/60 text-amber-300 shadow-xl shadow-purple-950/60">
                🍌 ONE BANANA IMAGE • ONE CHAT • 15 PROMPTS MAXIMUM
              </span>
            </div>
          </div>

          {/* Core Rule Callout Banner */}
          <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-pink-950/70 border border-purple-500/40 text-left sm:text-center space-y-1.5 shadow-xl">
            <div className="text-[11px] font-mono text-amber-400 uppercase tracking-widest font-bold">
              The Fundamental Objective
            </div>
            <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
              "Your goal is <strong className="text-rose-400">NOT</strong> to find the correct answer.<br className="hidden sm:inline" />
              Your goal is to make AI <strong className="text-emerald-400">confidently contradict visual truth</strong> using <strong className="text-purple-300">ONLY your prompt</strong>."
            </p>
          </div>

          {/* Description explaining that participant chooses the lie */}
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            There is <strong className="text-white">NO predefined false answer</strong>.
            You choose the lie! You can convince the AI it is an <em className="text-pink-400">apple</em>,
            a <em className="text-cyan-400">mango</em>, a <em className="text-emerald-400">space probe sensor</em>, or anything you design.
            The AI resists initially; you must persuade it across one continuous conversation within 15 prompts.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                soundFX.playClick();
                onStartArena();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-bold text-base shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group font-mono"
            >
              <Zap className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>ENTER THE CHAT ARENA</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                onNavigate('how-to-play');
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700/80 hover:border-slate-500 transition-all flex items-center justify-center gap-2 font-mono"
            >
              <span>How To Play & Strategies</span>
            </button>
          </div>

          {/* 4 Pillars Grid */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-display">🍌 1 Image</div>
              <div className="text-xs text-slate-400 font-mono uppercase mt-1">Banana Visual Truth</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-purple-400 font-display">1 Chat</div>
              <div className="text-xs text-slate-400 font-mono uppercase mt-1">Continuous Thread</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-display">15 Prompts</div>
              <div className="text-xs text-slate-400 font-mono uppercase mt-1">Total Game Budget</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">5 Evaluations</div>
              <div className="text-xs text-slate-400 font-mono uppercase mt-1">Judged at the End</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Mechanics Overview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
            <MessageSquare className="w-4 h-4" />
            HOW THE COMPETITION WORKS
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Pure Prompt Engineering. No Gimmicks.
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            You converse with Gemini about the banana image. The conversation flows naturally across up to 15 turns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-500/30 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-mono text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-white">One Banana Image & One Chat</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You see the banana image and a single chat box. There are no rounds, no question screens, and no resets. Every prompt you send sees the previous conversation history.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-500/30 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold font-mono text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-white">15 Total Prompts Budget</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You can send a maximum of 15 prompts. Use roleplay, scientific framing, sensory recontextualization, or any prompt-engineering strategy to persuade the model.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-500/30 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold font-mono text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-white">5 Hidden Evaluations At Finish</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you click [FINISH] or reach 15 prompts, Gemini evaluates the entire conversation against 5 hidden questions testing different aspects of the image to see if it contradicted visual truth.
            </p>
          </div>
        </div>
      </section>

      {/* Transparent Leaderboard Scoring */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              <Brain className="w-4 h-4" />
              OFFICIAL RANKING ALGORITHM
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Strict Efficiency Ranking
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No arbitrary formulas. Standings are ranked strictly by:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-1">
              <div className="text-amber-400 font-bold">1. Successful Evaluations</div>
              <div className="text-[11px] text-slate-400">
                Primary factor: Highest number of successful evaluations (up to 5/5) ranks first.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-1">
              <div className="text-cyan-400 font-bold">2. Prompts Used</div>
              <div className="text-[11px] text-slate-400">
                Secondary factor: Achieving 5/5 in 8 prompts ranks higher than in 11 prompts.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-1">
              <div className="text-purple-300 font-bold">3. Words Used</div>
              <div className="text-[11px] text-slate-400">
                Tie-breaker: If prompts are tied, the participant who used fewer words wins!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-amber-900/40 border border-purple-500/40 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Ready to Convince the AI?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
            Step into the continuous chat arena with the banana image and deploy your best prompt engineering.
          </p>
          <button
            onClick={() => {
              soundFX.playClick();
              onStartArena();
            }}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all inline-flex items-center gap-2 font-mono"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Chat Arena</span>
          </button>
        </div>
      </section>
    </div>
  );
};
