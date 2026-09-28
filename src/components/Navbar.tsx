import React from 'react';
import {
  Sparkles,
  Trophy,
  BookOpen,
  HelpCircle,
  Shield,
  Volume2,
  VolumeX,
  User,
  Zap,
  Layers
} from 'lucide-react';
import { Participant } from '../utils/storage';
import { soundFX } from '../utils/audio';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  participant: Participant | null;
  onOpenProfile: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  participant,
  onOpenProfile,
  soundEnabled,
  onToggleSound,
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'arena', label: 'Arena', icon: Layers },
    { id: 'rules', label: 'Rules', icon: BookOpen },
    { id: 'how-to-play', label: 'How to Play', icon: HelpCircle },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Branding */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 text-lg sm:text-xl">
                  PROMPT THE LIE
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50">
                  TECHFEST 2026
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden md:block">
                CAN YOU MAKE AI SAY WHAT YOU WANT?
              </p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFX.playClick();
                    onNavigate(item.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-purple-950/70 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Participant Profile pill */}
            {participant ? (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/70 hover:border-purple-500/50 transition-all text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-[10px]">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-slate-200 font-medium leading-none truncate max-w-[100px]">
                    {participant.name}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight truncate max-w-[100px]">
                    {participant.college}
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundFX.playClick();
                  onNavigate('arena');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Enter Arena</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav strip */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFX.playClick();
                  onNavigate(item.id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap font-medium transition-all ${
                  isActive
                    ? 'bg-purple-900/60 text-purple-300 border border-purple-600/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
