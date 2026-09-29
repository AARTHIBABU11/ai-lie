import React, { useState, useEffect } from 'react';
import {
  User,
  School,
  Hash,
  Play,
  Clock,
  Zap,
  Sparkles,
  AlertCircle,
  Flame,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { GameSession } from '../types';
import { Participant, saveParticipant } from '../utils/storage';
import { soundFX } from '../utils/audio';

interface ParticipantViewProps {
  participant: Participant | null;
  session: GameSession | null;
  onSaveParticipant: (p: Participant) => void;
  onStartArena: () => void;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  participant,
  session,
  onSaveParticipant,
  onStartArena
}) => {
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [teamId, setTeamId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (participant) {
      setName(participant.name);
      setCollege(participant.college);
      setTeamId(participant.teamId || '');
    }
  }, [participant]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!college.trim()) {
      setError('Please enter your college or organization name.');
      return;
    }

    const newParticipant: Participant = {
      id: participant?.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      college: college.trim(),
      teamId: teamId.trim() || undefined,
      registeredAt: participant?.registeredAt || new Date().toISOString()
    };

    soundFX.playSuccess();
    saveParticipant(newParticipant);
    onSaveParticipant(newParticipant);
  };

  const promptsUsed = session?.promptsUsed || 0;
  const promptsRemaining = Math.max(0, 15 - promptsUsed);
  const totalWords = session?.totalWords || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Registration Card if not registered */}
      {!participant ? (
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-purple-500/40 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-purple-600/30">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white font-display">
              Participant Check-in
            </h2>
            <p className="text-xs text-slate-400">
              Enter your name and institution to compete in the Banana deception competition.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Participant Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. Arjun Sharma"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                College / Institution *
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => {
                    setCollege(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. IIT Madras / BITS Pilani"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Team Code / Roll No (Optional)
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  placeholder="e.g. TEAM-404"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 font-mono"
            >
              <Zap className="w-4 h-4" />
              <span>Enter Competition Arena</span>
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Registered Participant Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-purple-500/30 font-display">
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white leading-tight">
                    {participant.name}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                    Active Competitor
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {participant.college} {participant.teamId && `• [${participant.teamId}]`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
                <div className="text-[10px] text-slate-500 uppercase">Prompts Remaining</div>
                <div className="text-sm font-bold text-cyan-400">{promptsRemaining} / 15</div>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
                <div className="text-[10px] text-slate-500 uppercase">Words Used</div>
                <div className="text-sm font-bold text-purple-300">{totalWords}</div>
              </div>
            </div>
          </div>

          {/* Golden Rule Callout Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-pink-950/80 border-2 border-purple-500/60 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">
                  COMPETITION DIRECTIVE
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                NO FIXED ANSWERS
              </span>
            </div>
            <p className="text-sm text-slate-100 leading-relaxed font-medium">
              "Your goal is <strong className="text-rose-400">NOT</strong> to find the correct answer.
              Your goal is to make AI <strong className="text-emerald-400">give answers that contradict visual truth</strong> using <strong className="text-purple-300">ONLY your prompt</strong>."
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              You choose what false claim to make. The AI sees the banana image and converses naturally with you across up to 15 prompts.
            </p>
          </div>

          {/* Rules / Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
                <span>🍌</span>
                <span>ONE BANANA IMAGE</span>
              </div>
              <p className="text-xs text-slate-400">
                The AI sees only this single banana image throughout the entire competition.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>ONE CONTINUOUS CHAT</span>
              </div>
              <p className="text-xs text-slate-400">
                A single conversation stream. No round resets, no separate challenge screens.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-purple-400 font-mono flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>15 PROMPTS MAXIMUM</span>
              </div>
              <p className="text-xs text-slate-400">
                You have a maximum of 15 prompts. Prompt and word counts are tracked for efficiency.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>5 HIDDEN EVALUATIONS</span>
              </div>
              <p className="text-xs text-slate-400">
                Evaluated automatically at the end against the full transcript to score success.
              </p>
            </div>
          </div>

          {/* Launch Button */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                soundFX.playClick();
                onStartArena();
              }}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black font-mono text-sm shadow-xl shadow-purple-600/30 transition-all inline-flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{promptsUsed > 0 ? 'RESUME CHAT ARENA' : 'ENTER CHAT ARENA'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
