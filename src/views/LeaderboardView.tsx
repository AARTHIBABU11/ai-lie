import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Search,
  RefreshCw,
  Zap,
  Clock,
  ShieldCheck,
  Cpu,
  FileText
} from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { soundFX } from '../utils/audio';

interface LeaderboardViewProps {
  onStartArena: () => void;
}

function formatTime(entry: LeaderboardEntry): string {
  if (entry.formattedTime) return entry.formattedTime;
  const ms = entry.completionTimeMs ?? ((entry.timeTakenSeconds || 0) * 1000);
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onStartArena }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setEntries(data.leaderboard || []);
      }
    } catch (e) {
      console.error('Failed to load leaderboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleRefresh = () => {
    soundFX.playClick();
    fetchLeaderboard();
  };

  const filtered = entries.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.participantName.toLowerCase().includes(q) ||
      item.collegeName.toLowerCase().includes(q) ||
      (item.teamId && item.teamId.toLowerCase().includes(q))
    );
  });

  const topThree = filtered.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-xs font-mono text-amber-300 font-bold mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>OFFICIAL COMPETITION LEADERBOARD • MAX 500 PTS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
            Competition Standings
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Sorted strictly by: <strong className="text-amber-400">1. SCORE (Highest)</strong> → <strong className="text-emerald-400">2. TIME (Fastest)</strong> → <strong className="text-cyan-400">3. PROMPTS (Lowest)</strong> → <strong className="text-purple-300">4. TOKENS (Lowest)</strong> → <strong className="text-pink-300">5. WORDS (Lowest)</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onStartArena();
            }}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold font-mono text-xs shadow-md shadow-purple-600/30 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Compete Now</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="order-2 md:order-1 p-5 rounded-3xl bg-slate-900/80 border border-slate-700 text-center space-y-2 relative shadow-lg">
              <div className="w-10 h-10 rounded-full bg-slate-400/20 border border-slate-400/50 flex items-center justify-center mx-auto text-slate-300 font-bold font-display">
                🥈
              </div>
              <div className="text-sm font-bold text-white truncate">
                {topThree[1].participantName}
              </div>
              <div className="text-xs text-slate-400 font-mono truncate">
                {topThree[1].collegeName}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-display">
                {topThree[1].score ?? topThree[1].finalScore ?? 0} <span className="text-xs font-normal text-slate-400 font-mono">/ 500</span>
              </div>
              <div className="text-xs font-mono text-slate-300">
                {topThree[1].passedEvaluations ?? topThree[1].successfulEvaluations ?? 0}/5 evals • {topThree[1].participantPromptCount ?? topThree[1].promptsUsed} prompts
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {topThree[1].participantTokenCount ?? topThree[1].totalTokens ?? 0} tokens • {formatTime(topThree[1])}
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/60 text-center space-y-3 relative shadow-2xl md:-translate-y-2">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase font-mono tracking-wider shadow-md">
                👑 1st Place
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center mx-auto text-amber-400 font-black text-lg font-display">
                🥇
              </div>
              <div className="text-base font-black text-white truncate">
                {topThree[0].participantName}
              </div>
              <div className="text-xs text-slate-400 font-mono truncate">
                {topThree[0].collegeName}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-display">
                {topThree[0].score ?? topThree[0].finalScore ?? 0} <span className="text-xs font-normal text-slate-400 font-mono">/ 500</span>
              </div>
              <div className="text-xs font-mono text-amber-300 font-bold">
                {topThree[0].passedEvaluations ?? topThree[0].successfulEvaluations ?? 0}/5 evals • {topThree[0].participantPromptCount ?? topThree[0].promptsUsed} prompts
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {topThree[0].participantTokenCount ?? topThree[0].totalTokens ?? 0} tokens • {formatTime(topThree[0])}
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="order-3 p-5 rounded-3xl bg-slate-900/80 border border-slate-700 text-center space-y-2 relative shadow-lg">
              <div className="w-10 h-10 rounded-full bg-amber-800/20 border border-amber-700/50 flex items-center justify-center mx-auto text-amber-600 font-bold font-display">
                🥉
              </div>
              <div className="text-sm font-bold text-white truncate">
                {topThree[2].participantName}
              </div>
              <div className="text-xs text-slate-400 font-mono truncate">
                {topThree[2].collegeName}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-display">
                {topThree[2].score ?? topThree[2].finalScore ?? 0} <span className="text-xs font-normal text-slate-400 font-mono">/ 500</span>
              </div>
              <div className="text-xs font-mono text-slate-300">
                {topThree[2].passedEvaluations ?? topThree[2].successfulEvaluations ?? 0}/5 evals • {topThree[2].participantPromptCount ?? topThree[2].promptsUsed} prompts
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {topThree[2].participantTokenCount ?? topThree[2].totalTokens ?? 0} tokens • {formatTime(topThree[2])}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
        <div className="text-xs font-mono text-slate-400 hidden sm:block">
          Total Competitors: <strong className="text-white">{entries.length}</strong>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search participant or institution..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Official Rankings Table: EXACT COLUMNS REQUIRED */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-500 animate-pulse">
            Fetching standings from competition server...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center space-y-3 font-mono">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto text-slate-400 text-lg">
              🏆
            </div>
            <div className="text-sm font-bold text-slate-300">
              No participants yet
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Standings will appear here as soon as registered participants complete their evaluation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Rank</th>
                  <th className="py-3.5 px-4 font-semibold">Participant</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Score</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Evaluations</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Prompts</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Tokens</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item, idx) => {
                  const rank = idx + 1;
                  const score = item.score !== undefined ? item.score : (item.finalScore ?? 0);
                  const evals = item.passedEvaluations !== undefined ? item.passedEvaluations : (item.successfulEvaluations ?? 0);
                  const prompts = item.participantPromptCount !== undefined ? item.participantPromptCount : (item.promptsUsed ?? 0);
                  const tokens = item.participantTokenCount !== undefined ? item.participantTokenCount : (item.totalTokens ?? 0);
                  const timeFormatted = formatTime(item);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-bold">
                        {rank === 1 ? (
                          <span className="text-amber-400 flex items-center gap-1 font-bold">🥇 1</span>
                        ) : rank === 2 ? (
                          <span className="text-slate-300 flex items-center gap-1 font-bold">🥈 2</span>
                        ) : rank === 3 ? (
                          <span className="text-amber-600 flex items-center gap-1 font-bold">🥉 3</span>
                        ) : (
                          <span className="text-slate-500">{rank}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div>{item.participantName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {item.collegeName} {item.teamId && `• [${item.teamId}]`}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-black text-amber-400 text-sm">
                        {score}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            evals === 5
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : evals >= 3
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-slate-950 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {evals}/5
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-cyan-400">
                        {prompts}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-purple-300">
                        {tokens}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-emerald-400 font-bold">
                        {timeFormatted}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
