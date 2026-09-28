import React, { useState, useEffect } from 'react';
import {
  Shield,
  Trash2,
  Edit3,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Terminal,
  Clock,
  Layers,
  Sparkles,
  Eye,
  Lock,
  Download,
  Search,
  ExternalLink,
  Flame
} from 'lucide-react';
import { Challenge, RoundType, DifficultyType, SubmissionResult } from '../types';
import { soundFX } from '../utils/audio';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'submissions' | 'system'>('challenges');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Edit challenge modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formImage, setFormImage] = useState<string>('');
  const [formGroundTruth, setFormGroundTruth] = useState<string>('');
  const [formKeywords, setFormKeywords] = useState<string>('');
  const [formQuestions, setFormQuestions] = useState<string[]>([
    'What is shown in this image?',
    'What object or subject do you see?',
    'Identify the main thing in the image.',
    'What is happening in this image?',
    'Describe the main subject.'
  ]);
  const [formTimeLimit, setFormTimeLimit] = useState<number>(60);
  const [formMaxTests, setFormMaxTests] = useState<number>(3);

  // Gemini diagnostic state
  const [geminiDiag, setGeminiDiag] = useState<any>(null);
  const [testingGemini, setTestingGemini] = useState<boolean>(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resCh, resSub] = await Promise.all([
        fetch('/api/admin/challenges'),
        fetch('/api/admin/submissions')
      ]);
      if (resCh.ok) {
        const d = await resCh.json();
        setChallenges(d.challenges || []);
      }
      if (resSub.ok) {
        const d = await resSub.json();
        setSubmissions(d.submissions || []);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleOpenEditModal = (c: Challenge) => {
    setEditingChallenge(c);
    setFormTitle(c.title);
    setFormDesc(c.description);
    setFormImage(c.imageUrl);
    setFormGroundTruth(c.groundTruth);
    setFormKeywords(c.groundTruthKeywords ? c.groundTruthKeywords.join(', ') : '');
    setFormQuestions([...c.hiddenQuestions]);
    setFormTimeLimit(c.timeLimit);
    setFormMaxTests(c.maxTestAttempts);
    setShowModal(true);
  };

  const handleSaveChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallenge) return;
    soundFX.playClick();

    const payload = {
      title: formTitle,
      description: formDesc,
      imageUrl: formImage,
      groundTruth: formGroundTruth,
      groundTruthKeywords: formKeywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean),
      hiddenQuestions: formQuestions.filter((q) => q.trim().length > 0),
      timeLimit: formTimeLimit,
      maxTestAttempts: formMaxTests
    };

    try {
      const res = await fetch(`/api/admin/challenges/${editingChallenge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setActionMessage('Challenge updated successfully.');
        setShowModal(false);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Save challenge error', err);
    }
  };

  const handleResetDefaultChallenges = async () => {
    if (!confirm('Reset challenges to the 3 official symposium rounds (Fruit, Train, Situation)?')) return;
    soundFX.playClick();
    try {
      const res = await fetch('/api/admin/reset-challenges', { method: 'POST' });
      if (res.ok) {
        setActionMessage('Restored 3 official symposium challenges.');
        fetchAdminData();
      }
    } catch (e) {
      console.error('Reset challenges error', e);
    }
  };

  const handleResetLeaderboard = async () => {
    if (!confirm('Warning: Clear all leaderboard scores and participant test records?')) return;
    soundFX.playClick();
    try {
      const res = await fetch('/api/admin/reset-leaderboard', { method: 'POST' });
      if (res.ok) {
        setActionMessage('Leaderboard and test logs reset.');
        fetchAdminData();
      }
    } catch (e) {
      console.error('Reset leaderboard error', e);
    }
  };

  const handleTestGemini = async () => {
    soundFX.playClick();
    setTestingGemini(true);
    setGeminiDiag(null);
    try {
      const res = await fetch('/api/admin/test-gemini', { method: 'POST' });
      const data = await res.json();
      setGeminiDiag(data);
    } catch (err: any) {
      setGeminiDiag({ status: 'error', message: err.message });
    } finally {
      setTestingGemini(false);
    }
  };

  const exportSubmissions = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `prompt-the-lie-submissions-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white font-display">
              Symposium Organizer Control
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              PROMPT ONLY. MAKE AI LIE. • 3 Rounds Administration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaultChallenges}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-500/50 text-xs font-mono text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset 3 Official Rounds</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'challenges'
              ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          The 3 Challenges ({challenges.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'submissions'
              ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Participant Submissions ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
            activeTab === 'system'
              ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Gemini Diagnostics & Controls
        </button>
      </div>

      {/* TAB 1: Exactly 3 Challenges Table */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>
              <strong>Rule Architecture:</strong> No predefined target answer. The participant chooses the lie. The system validates whether the AI answer is inconsistent with visual ground truth across 5 hidden probes.
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Visual</th>
                    <th className="py-3 px-4">Round & Title</th>
                    <th className="py-3 px-4">Visual Ground Truth</th>
                    <th className="py-3 px-4">Forbidden Truths</th>
                    <th className="py-3 px-4">Secret Probes</th>
                    <th className="py-3 px-4">Timer / Tests</th>
                    <th className="py-3 px-4 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {challenges.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={c.imageUrl}
                          alt={c.title}
                          className="w-14 h-12 object-cover rounded-lg border border-slate-700"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{c.title}</div>
                        <div className="text-[10px] text-purple-400">
                          {c.round.replace('_', ' ')} • {c.difficulty}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50 font-bold">
                          {c.groundTruth}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                        {c.groundTruthKeywords ? c.groundTruthKeywords.join(', ') : ''}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {c.hiddenQuestions.length} Questions
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        <div>{c.timeLimit}s</div>
                        <div className="text-cyan-400">{c.maxTestAttempts} tests</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Edit Challenge"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Submissions Audit Log */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Total Participant Submissions: {submissions.length}
            </span>
            <button
              onClick={exportSubmissions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Submissions (JSON)</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                No submissions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Participant</th>
                      <th className="py-3 px-4">Challenge</th>
                      <th className="py-3 px-4">Lie Consistency</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Prompt Excerpt</th>
                      <th className="py-3 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          <div>{sub.participantName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {sub.collegeName}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          <div>{sub.challengeTitle}</div>
                          <div className="text-[10px] text-purple-400">
                            {sub.round.replace('_', ' ')}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sub.consistencyScore >= 80
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {sub.consistencyScore}% ({sub.questionsPassed}/{sub.totalQuestions} Lies)
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-amber-400">
                          {sub.totalScore} pts
                        </td>

                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate italic">
                          "{sub.prompt}"
                        </td>

                        <td className="py-3 px-4 text-right text-[10px] text-slate-500">
                          {new Date(sub.submittedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Gemini Diagnostics & Leaderboard Control */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gemini Live Test */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Gemini API Health Diagnostic
                </h3>
              </div>
              <button
                onClick={handleTestGemini}
                disabled={testingGemini}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {testingGemini ? 'Testing...' : 'Ping Gemini Model'}
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Verifies server-side connectivity to <code className="text-purple-300 font-mono">gemini-3.8-flash</code>.
            </p>

            {geminiDiag && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className={geminiDiag.status === 'error' ? 'text-rose-400' : 'text-emerald-400 font-bold'}>
                    {geminiDiag.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Model:</span>
                  <span className="text-purple-300">{geminiDiag.model || 'gemini-3.8-flash'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Latency:</span>
                  <span className="text-cyan-400">{geminiDiag.latencyMs} ms</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-slate-300">
                  <span className="text-slate-500">Server Message: </span>
                  {geminiDiag.message}
                </div>
              </div>
            )}
          </div>

          {/* Tournament Reset */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Tournament Data Management
            </h3>

            <p className="text-xs text-slate-400">
              Clear participant submissions, reset test attempt tracking quotas, and start fresh for the next heat.
            </p>

            <div className="pt-2">
              <button
                onClick={handleResetLeaderboard}
                className="px-4 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-bold transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Leaderboard & Test Quotas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Challenge Modal */}
      {showModal && editingChallenge && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-purple-500/50 shadow-2xl space-y-6 my-8 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white font-display">
                Edit {editingChallenge.title}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveChallenge} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Challenge Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-amber-400">
                  Visual Ground Truth (Real description in image) *
                </label>
                <input
                  type="text"
                  required
                  value={formGroundTruth}
                  onChange={(e) => setFormGroundTruth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Forbidden Truth Keywords (comma-separated words AI must NOT say)
                </label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time Limit (sec)</label>
                  <input
                    type="number"
                    min={30}
                    max={300}
                    value={formTimeLimit}
                    onChange={(e) => setFormTimeLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Tests</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formMaxTests}
                    onChange={(e) => setFormMaxTests(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              {/* Hidden Evaluation Questions */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Hidden 5 Secret Probe Questions
                </label>
                <div className="space-y-2">
                  {formQuestions.map((q, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-slate-500 w-5">#{idx + 1}</span>
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => {
                          const updated = [...formQuestions];
                          updated[idx] = e.target.value;
                          setFormQuestions(updated);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 text-white font-bold text-xs shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
