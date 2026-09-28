import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Search,
  RefreshCw,
  Zap,
  Clock,
  Medal,
  Layers,
  Sparkles,
  School
} from 'lucide-react';
import { LeaderboardEntry, RoundType } from '../types';
import { soundFX } from '../utils/audio';

interface LeaderboardViewProps {
  onStartArena: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onStartArena }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterRound, setFilterRound] = useState<string>('ALL');
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
    const matchesRound = filterRound === 'ALL' || item.round === filterRound;
    const matchesSearch =
      item.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.collegeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.challengeTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRound && matchesSearch;
  });

  const topThree = filtered.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-xs font-mono text-amber-300 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>SYMPOSIUM HALL OF FAME</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
            Official Leaderboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Top prompt engineers ranked by multi-angle consistency, speed, and prompt brevity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onStartArena();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Compete Now</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium (shown if at least 2 entries exist) */}
      {topThree.length >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="order-2 md:order-1 p-5 rounded-2xl bg-slate-900/80 border border-slate-700 text-center space-y-2 relative shadow-lg">
              <div className="w-10 h-10 rounded-full bg-slate-400/20 border border-slate-400/50 flex items-center justify-center mx-auto text-slate-300 font-bold font-display">
                2
              </div>
              <div className="text-sm font-bold text-white truncate">
                {topThree[1].participantName}
              </div>
              <div className="text-xs text-slate-400 font-mono truncate">
                {topThree[1].collegeName}
              </div>
              <div className="text-xl font-black text-slate-200 font-display">
                {topThree[1].totalScore} pts
              </div>
              <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                {topThree[1].consistencyScore}% Consistency
              </span>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="order-1 md:order-2 p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/60 text-center space-y-3 relative shadow-2xl md:-translate-y-2">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase font-mono tracking-wider shadow-md">
                1st Place Champion
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center mx-auto text-amber-400 font-black text-lg font-display">
                👑
              </div>
              <div className="text-base font-black text-white truncate">
                {topThree[0].participantName}
              </div>
              <div className="text-xs text-slate-400 font-mono truncate">
                {topThree[0].collegeName}
              </div>
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-400 font-display">
                {topThree[0].totalScore} pts
              </div>
              <span className="inline-block text-[10px] font-mono px-2.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/50 font-bold">
                {topThree[0].consistencyScore}% Consistency ({topThree[0].questionsPassed}/{topThree[0].totalQuestions})
              </span>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="order-3 p-5 rounded-2xl bg-slate-900/80 border border-slate-700 text-center space-y-2 relative shadow-lg">
              <div className="w-10 h-10 rounded-full bg-amber-800/20 border border-amber-700/50 flex items-center justify-center mx-auto text-amber-600 font-bold font-display">
                3
              </div>
              <div className="text-sm font-bold text-white truncate">
                {topThree[2].participantName}
              </div>
              <div className="text-xs text-slate-400 font-mono truncate">
                {topThree[2].collegeName}
              </div>
              <div className="text-xl font-black text-slate-200 font-display">
                {topThree[2].totalScore} pts
              </div>
              <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                {topThree[2].consistencyScore}% Consistency
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Round Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'ROUND_1', 'ROUND_2', 'ROUND_3'].map((r) => (
            <button
              key={r}
              onClick={() => {
                soundFX.playClick();
                setFilterRound(r);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap ${
                filterRound === r
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {r === 'ALL' ? 'All Rounds' : r.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search participant or college..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Rankings Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-500 animate-pulse">
            Fetching latest verified scores from symposium engine...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No entries found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Rank</th>
                  <th className="py-3.5 px-4 font-semibold">Participant</th>
                  <th className="py-3.5 px-4 font-semibold">College</th>
                  <th className="py-3.5 px-4 font-semibold">Challenge</th>
                  <th className="py-3.5 px-4 font-semibold">Consistency</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-bold">
                        {rank === 1 ? (
                          <span className="text-amber-400 flex items-center gap-1">🥇 #1</span>
                        ) : rank === 2 ? (
                          <span className="text-slate-300 flex items-center gap-1">🥈 #2</span>
                        ) : rank === 3 ? (
                          <span className="text-amber-600 flex items-center gap-1">🥉 #3</span>
                        ) : (
                          <span className="text-slate-500">#{rank}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-white">
                        {item.participantName}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {item.collegeName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-300 truncate max-w-[140px] block">
                          {item.challengeTitle}
                        </span>
                        <span className="text-[10px] text-purple-400">
                          {item.round.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.consistencyScore >= 80
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                              : item.consistencyScore >= 60
                              ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                              : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                          }`}
                        >
                          {item.consistencyScore}% ({item.questionsPassed}/{item.totalQuestions})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-sm font-bold text-amber-400 font-display">
                          {item.totalScore}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">pts</span>
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
