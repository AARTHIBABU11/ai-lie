import React, { useState, useEffect } from 'react';
import {
  User,
  School,
  Hash,
  Play,
  Clock,
  Zap,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Flame,
  Apple,
  Train,
  Bike
} from 'lucide-react';
import { PublicChallenge, RoundType } from '../types';
import { Participant, saveParticipant } from '../utils/storage';
import { soundFX } from '../utils/audio';

interface ParticipantViewProps {
  participant: Participant | null;
  onSaveParticipant: (p: Participant) => void;
  onSelectChallenge: (c: PublicChallenge) => void;
  challenges: PublicChallenge[];
  loading: boolean;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({
  participant,
  onSaveParticipant,
  onSelectChallenge,
  challenges,
  loading
}) => {
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [teamId, setTeamId] = useState('');
  const [error, setError] = useState('');

  const [selectedRound, setSelectedRound] = useState<RoundType>('ROUND_1');

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

  const filteredChallenges = challenges.filter(c => c.round === selectedRound);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Registration Modal / Card if not registered */}
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
              Enter your name and institution to compete in the 3-round Prompt The Lie competition.
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
                  placeholder="e.g. IIT Madras / BITS"
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Enter Competition Arena</span>
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Registered Participant Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/30 font-display">
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white leading-tight">
                    {participant.name}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                    Active Competitor
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {participant.college} {participant.teamId && `• [${participant.teamId}]`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Mission</div>
                <div className="text-xs font-bold text-amber-400 font-mono">PROMPT ONLY. MAKE AI LIE.</div>
              </div>
            </div>
          </div>

          {/* Core Rule Callout Banner */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center gap-3">
            <Flame className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs text-slate-200">
              <strong className="text-amber-300">Rule Reminder:</strong> "Your goal is NOT to find the correct answer. Your goal is to make AI confidently give a false answer using ONLY your prompt."
            </div>
          </div>

          {/* Exactly 3 Rounds Selector Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  Select Competition Round
                </h3>
                <p className="text-xs text-slate-400">
                  Choose from the 3 official tournament visual challenges.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'ROUND_1' as RoundType,
                  name: 'Round 1 — FRUIT',
                  desc: 'Simple fruit image (Banana) • 60s',
                  icon: Apple,
                  color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400'
                },
                {
                  id: 'ROUND_2' as RoundType,
                  name: 'Round 2 — TRAIN',
                  desc: 'Locomotive transit image • 90s',
                  icon: Train,
                  color: 'border-purple-500/50 bg-purple-950/20 text-purple-400'
                },
                {
                  id: 'ROUND_3' as RoundType,
                  name: 'Round 3 — SITUATION',
                  desc: 'Person riding a bicycle • 120s',
                  icon: Bike,
                  color: 'border-amber-500/50 bg-amber-950/20 text-amber-400'
                }
              ].map((round) => {
                const isActive = selectedRound === round.id;
                const Icon = round.icon;
                return (
                  <button
                    key={round.id}
                    onClick={() => {
                      soundFX.playClick();
                      setSelectedRound(round.id);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isActive
                        ? `${round.color} shadow-lg ring-1 ring-purple-500/40`
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-mono font-bold">
                      <Icon className="w-4 h-4" />
                      <span>{round.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{round.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Challenge Card */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500 font-mono animate-pulse">
                Loading challenge matrix from symposium server...
              </div>
            ) : filteredChallenges.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                No active challenge found for this round.
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                {filteredChallenges.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-3xl bg-slate-900/90 border border-purple-500/40 hover:border-purple-500 transition-all overflow-hidden flex flex-col justify-between group shadow-2xl"
                  >
                    <div className="relative h-64 bg-slate-950 overflow-hidden">
                      <img
                        src={c.imageUrl}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-950/90 backdrop-blur-md text-amber-400 border border-amber-500/40 font-bold">
                          {c.difficulty}
                        </span>
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-950/90 backdrop-blur-md text-purple-300 border border-purple-500/40">
                          {c.round.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{c.timeLimit}s</span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                          {c.title}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {c.description}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Test Quota: <strong className="text-cyan-400">{c.maxTestAttempts} live tests</strong></span>
                        <span>Evaluation: <strong className="text-purple-300">5 secret probe questions</strong></span>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            soundFX.playClick();
                            onSelectChallenge(c);
                          }}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Enter Round & Start Prompting</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
