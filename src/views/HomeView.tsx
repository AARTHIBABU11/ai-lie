import React from 'react';
import {
  Zap,
  ArrowRight,
  Flame,
  CheckCircle2,
  Trophy,
  Brain,
  Layers,
  Sparkles,
  Train,
  Apple,
  Bike
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
            <span>NATIONAL PROMPT-ENGINEERING BATTLEGROUND</span>
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-white drop-shadow-sm">
              PROMPT THE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500">
                LIE
              </span>
            </h1>

            {/* Main Tagline */}
            <p className="text-xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">
              Can you make AI say what you want?
            </p>

            {/* Main Motto */}
            <div className="pt-2">
              <span className="inline-block text-sm sm:text-base md:text-lg font-mono font-black tracking-widest px-5 py-2.5 rounded-xl bg-purple-950/80 border-2 border-purple-500/60 text-amber-300 shadow-xl shadow-purple-950/60">
                PROMPT ONLY. MAKE AI LIE.
              </span>
            </div>
          </div>

          {/* Core Rule Callout Banner */}
          <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-pink-950/70 border border-purple-500/40 text-left sm:text-center space-y-1.5 shadow-xl">
            <div className="text-[11px] font-mono text-amber-400 uppercase tracking-widest font-bold">
              The Golden Rule
            </div>
            <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
              "Your goal is <strong className="text-rose-400">NOT</strong> to find the correct answer.<br className="hidden sm:inline" />
              Your goal is to make AI <strong className="text-emerald-400">confidently give a false answer</strong> using <strong className="text-purple-300">ONLY your prompt</strong>."
            </p>
          </div>

          {/* Description explaining that participant chooses the lie */}
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            You are shown an image — for example, a <span className="text-amber-300 font-semibold">Banana</span>.
            There is <strong className="text-white">NO predefined target answer</strong>.
            You choose the lie! Participant A can make Gemini say <em className="text-pink-400">"Apple"</em>,
            Participant B can make it say <em className="text-cyan-400">"Mango"</em>, and
            Participant C can make it say <em className="text-emerald-400">"Orange"</em>.
            All three succeed because none of those are actually the object in the image.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                soundFX.playClick();
                onStartArena();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-bold text-base shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
            >
              <Zap className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>ENTER THE ARENA</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                onNavigate('how-to-play');
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700/80 hover:border-slate-500 transition-all flex items-center justify-center gap-2"
            >
              <span>How To Play & Tips</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-display">3 Rounds</div>
              <div className="text-xs text-slate-400 font-mono uppercase mt-1">Fruit • Train • Situation</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-purple-400 font-display">No Fixed Target</div>
              <div className="text-xs text-slate-400 font-mono uppercase mt-1">You Choose The Lie</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-display">5 Secret Probes</div>
              <div className="text-xs text-slate-400 font-mono uppercase mt-1">Robustness Test</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">100% Prompt</div>
              <div className="text-xs text-slate-400 font-mono uppercase mt-1">No Code • No Training</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Exactly Three Competition Rounds */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400">
            <Layers className="w-4 h-4" />
            THE THREE TOURNAMENT CHALLENGES
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Three Escalating Lie Arenas
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Each round presents an authentic visual. Make Gemini's vision model output an answer that is inconsistent with visual reality across 5 hidden probes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Round 1 — Fruit */}
          <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 overflow-hidden flex flex-col justify-between hover:border-emerald-500/60 transition-all group shadow-xl">
            <div className="relative h-48 bg-slate-950 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80"
                alt="Fruit Challenge"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-700/60 font-bold flex items-center gap-1">
                  <Apple className="w-3 h-3" />
                  ROUND 1 — FRUIT
                </span>
              </div>
              <div className="absolute bottom-3 left-3 text-xs font-mono text-slate-300">
                Ground Truth: <span className="text-amber-400 font-bold">Banana</span>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Simple Fruit Challenge
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Make Gemini identify this fruit as <strong className="text-slate-200">Apple</strong>, <strong className="text-slate-200">Mango</strong>, <strong className="text-slate-200">Orange</strong>, or anything OTHER than a banana.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Time Limit:</span>
                  <span className="text-amber-400">60 Seconds</span>
                </div>
                <div className="flex justify-between">
                  <span>Test Quota:</span>
                  <span className="text-cyan-400">3 Attempts</span>
                </div>
                <div className="flex justify-between">
                  <span>Evaluation:</span>
                  <span className="text-purple-400">5 Secret Probes</span>
                </div>
              </div>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onStartArena();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Play Round 1</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Round 2 — Train */}
          <div className="rounded-3xl bg-slate-900/80 border border-purple-500/30 overflow-hidden flex flex-col justify-between hover:border-purple-500/60 transition-all group shadow-xl">
            <div className="relative h-48 bg-slate-950 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&auto=format&fit=crop&q=80"
                alt="Train Challenge"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-700/60 font-bold flex items-center gap-1">
                  <Train className="w-3 h-3" />
                  ROUND 2 — TRAIN
                </span>
              </div>
              <div className="absolute bottom-3 left-3 text-xs font-mono text-slate-300">
                Ground Truth: <span className="text-purple-400 font-bold">Railway Train</span>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  Machine & Transit Challenge
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Make Gemini classify this locomotive as an <strong className="text-slate-200">Airplane</strong>, <strong className="text-slate-200">Submarine</strong>, <strong className="text-slate-200">Rollercoaster</strong>, or any non-train craft.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Time Limit:</span>
                  <span className="text-amber-400">90 Seconds</span>
                </div>
                <div className="flex justify-between">
                  <span>Test Quota:</span>
                  <span className="text-cyan-400">2 Attempts</span>
                </div>
                <div className="flex justify-between">
                  <span>Evaluation:</span>
                  <span className="text-purple-400">5 Secret Probes</span>
                </div>
              </div>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onStartArena();
                }}
                className="w-full py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Play Round 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Round 3 — Situation */}
          <div className="rounded-3xl bg-slate-900/80 border border-amber-500/30 overflow-hidden flex flex-col justify-between hover:border-amber-500/60 transition-all group shadow-xl">
            <div className="relative h-48 bg-slate-950 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80"
                alt="Situation Challenge"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-700/60 font-bold flex items-center gap-1">
                  <Bike className="w-3 h-3" />
                  ROUND 3 — SITUATION
                </span>
              </div>
              <div className="absolute bottom-3 left-3 text-xs font-mono text-slate-300">
                Ground Truth: <span className="text-amber-400 font-bold">Person riding a bicycle</span>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Real-World Situation Challenge
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Make Gemini describe an entirely false human activity — such as <strong className="text-slate-200">swimming in a pool</strong>, <strong className="text-slate-200">baking bread in a kitchen</strong>, etc.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Time Limit:</span>
                  <span className="text-amber-400">120 Seconds</span>
                </div>
                <div className="flex justify-between">
                  <span>Test Quota:</span>
                  <span className="text-cyan-400">2 Attempts</span>
                </div>
                <div className="flex justify-between">
                  <span>Evaluation:</span>
                  <span className="text-purple-400">5 Secret Probes</span>
                </div>
              </div>

              <button
                onClick={() => {
                  soundFX.playClick();
                  onStartArena();
                }}
                className="w-full py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Play Round 3</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* The 5 Probes Robustness Test Explanation */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              <Brain className="w-4 h-4" />
              THE 5 SECRET PROBE QUESTIONS
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              How Consistency Is Evaluated
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you submit your prompt, it is permanently locked and tested against 5 secret probe questions:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {[
              '1. What is shown in this image?',
              '2. What object or subject do you see?',
              '3. Identify the main thing in the image.',
              '4. What is happening in this image?',
              '5. Describe the main subject.'
            ].map((q, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-300 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                <span>{q}</span>
              </div>
            ))}
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>5/5 False Answers = 100% Score!</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-amber-900/40 border border-purple-500/40 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Ready to Make AI Lie?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
            Choose your deception, calibrate your adversarial prompt, and top the symposium leaderboard.
          </p>
          <button
            onClick={() => {
              soundFX.playClick();
              onStartArena();
            }}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Arena Now</span>
          </button>
        </div>
      </section>
    </div>
  );
};
