import React from 'react';
import { Zap, ShieldCheck, Terminal, Award } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-purple-600 p-0.5 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white tracking-wider text-base">
              PROMPT THE LIE
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            National Technical Symposium Prompt-Engineering Arena. Can you make AI say what you want?
            A pure adversarial prompt challenge testing human linguistic ingenuity against multimodal vision neural networks.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-purple-400 pt-1">
            <span>PROMPT ONLY</span>
            <span>•</span>
            <span>MAKE AI LIE</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Competition
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => onNavigate('arena')}
                className="hover:text-purple-400 transition-colors"
              >
                Challenge Arena
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('rules')}
                className="hover:text-purple-400 transition-colors"
              >
                Rules & Scoring
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('how-to-play')}
                className="hover:text-purple-400 transition-colors"
              >
                How To Play & Tips
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('leaderboard')}
                className="hover:text-purple-400 transition-colors"
              >
                Live Leaderboard
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Symposium Engine
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gemini 3.8 Flash Vision Ready</span>
            </li>
            <li>5-Question Hidden Stress Test</li>
            <li>Zero Client Secret Exposure</li>
            <li>
              <button
                onClick={() => onNavigate('admin')}
                className="text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-4"
              >
                Organizer Dashboard
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <p>© 2026 TechFest Symposium. Built for Prompt Engineering Champions.</p>
        <div className="flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Fair Play Guaranteed • Server-side Verified Grading</span>
        </div>
      </div>
    </footer>
  );
};
