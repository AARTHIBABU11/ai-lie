import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { RulesView } from './views/RulesView';
import { HowToPlayView } from './views/HowToPlayView';
import { ParticipantView } from './views/ParticipantView';
import { ChallengeView } from './views/ChallengeView';
import { ResultView } from './views/ResultView';
import { LeaderboardView } from './views/LeaderboardView';
import { AdminView } from './views/AdminView';
import { PublicChallenge, SubmissionResult } from './types';
import {
  Participant,
  getStoredParticipant,
  saveParticipant,
  clearParticipant,
  getSoundPreference,
  setSoundPreference
} from './utils/storage';
import { soundFX } from './utils/audio';
import { User, School, Hash, X, Save } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [challenges, setChallenges] = useState<PublicChallenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState<boolean>(true);
  const [selectedChallenge, setSelectedChallenge] = useState<PublicChallenge | null>(null);
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Edit profile form state
  const [editName, setEditName] = useState<string>('');
  const [editCollege, setEditCollege] = useState<string>('');
  const [editTeamId, setEditTeamId] = useState<string>('');

  // Initial load
  useEffect(() => {
    const p = getStoredParticipant();
    if (p) {
      setParticipant(p);
      setEditName(p.name);
      setEditCollege(p.college);
      setEditTeamId(p.teamId || '');
    }

    const soundPref = getSoundPreference();
    setSoundEnabled(soundPref);
    soundFX.toggleSound(soundPref);

    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoadingChallenges(true);
    try {
      const res = await fetch('/api/challenges');
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges || []);
      }
    } catch (e) {
      console.error('Failed to fetch challenges:', e);
    } finally {
      setLoadingChallenges(false);
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setSoundPreference(next);
    soundFX.toggleSound(next);
    if (next) soundFX.playClick();
  };

  const handleStartArena = () => {
    soundFX.playClick();
    setCurrentView('arena');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectChallenge = (c: PublicChallenge) => {
    soundFX.playClick();
    setSelectedChallenge(c);
    setCurrentView('challenge');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitSuccess = (result: SubmissionResult) => {
    setLastResult(result);
    setCurrentView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editCollege.trim()) return;

    const updated: Participant = {
      id: participant?.id || `user-${Date.now()}`,
      name: editName.trim(),
      college: editCollege.trim(),
      teamId: editTeamId.trim() || undefined,
      registeredAt: participant?.registeredAt || new Date().toISOString()
    };

    saveParticipant(updated);
    setParticipant(updated);
    setShowProfileModal(false);
    soundFX.playSuccess();
  };

  const handleSwitchParticipant = () => {
    clearParticipant();
    setParticipant(null);
    setShowProfileModal(false);
    setCurrentView('arena');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white bg-grid-pattern">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        participant={participant}
        onOpenProfile={() => {
          if (participant) {
            setEditName(participant.name);
            setEditCollege(participant.college);
            setEditTeamId(participant.teamId || '');
          }
          setShowProfileModal(true);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartArena={handleStartArena}
          />
        )}

        {currentView === 'rules' && (
          <RulesView onStartArena={handleStartArena} />
        )}

        {currentView === 'how-to-play' && (
          <HowToPlayView onStartArena={handleStartArena} />
        )}

        {currentView === 'arena' && (
          <ParticipantView
            participant={participant}
            onSaveParticipant={(p) => setParticipant(p)}
            onSelectChallenge={handleSelectChallenge}
            challenges={challenges}
            loading={loadingChallenges}
          />
        )}

        {currentView === 'challenge' && selectedChallenge && participant && (
          <ChallengeView
            challenge={selectedChallenge}
            participant={participant}
            onExit={() => {
              soundFX.playClick();
              setCurrentView('arena');
            }}
            onSubmitSuccess={handleSubmitSuccess}
          />
        )}

        {currentView === 'result' && lastResult && (
          <ResultView
            result={lastResult}
            onNavigateArena={() => {
              setCurrentView('arena');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateLeaderboard={() => {
              setCurrentView('leaderboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRetryChallenge={() => {
              if (selectedChallenge) {
                setCurrentView('challenge');
              } else {
                setCurrentView('arena');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView onStartArena={handleStartArena} />
        )}

        {currentView === 'admin' && <AdminView />}
      </main>

      {/* Participant Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-purple-500/50 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                Participant Profile
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  College / Institution
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Team Code (Optional)
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={editTeamId}
                    onChange={(e) => setEditTeamId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleSwitchParticipant}
                  className="text-xs font-mono text-rose-400 hover:text-rose-300"
                >
                  Log Out / Switch
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
