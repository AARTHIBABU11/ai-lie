import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Flag,
  Sparkles,
  Maximize2,
  X,
  MessageSquare,
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { GameSession, ChatMessage } from '../types';
import { Participant } from '../utils/storage';
import { soundFX } from '../utils/audio';

const BANANA_IMAGE_URL = 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80';

interface ChallengeViewProps {
  participant: Participant;
  session: GameSession;
  onUpdateSession: (newSession: GameSession) => void;
  onFinishGame: (finalSession: GameSession) => void;
  onExit: () => void;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({
  participant,
  session,
  onUpdateSession,
  onFinishGame,
  onExit
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isSending]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSending || isFinishing) return;

    if (session.promptsUsed >= 15) {
      setErrorMessage('You have reached the maximum 15 prompts limit.');
      return;
    }

    soundFX.playClick();
    setIsSending(true);
    setErrorMessage(null);

    const userText = prompt.trim();
    setPrompt('');

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: participant.id,
          prompt: userText,
          participantName: participant.name,
          collegeName: participant.college,
          teamId: participant.teamId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to communicate with AI model.');
      }

      onUpdateSession(data.session);

      if (data.isFinished) {
        soundFX.playSuccess();
        setTimeout(() => {
          onFinishGame(data.session);
        }, 1200);
      }
    } catch (err: any) {
      soundFX.playFail();
      setErrorMessage(err.message || 'Connection error. Please retry.');
    } finally {
      setIsSending(false);
    }
  };

  const handleFinish = async () => {
    if (session.messages.length === 0) {
      setErrorMessage('Please send at least one prompt before finishing.');
      return;
    }

    if (!confirm('Are you ready to submit your conversation for the final 5-question evaluation?')) {
      return;
    }

    soundFX.playClick();
    setIsFinishing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/chat/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: participant.id,
          participantName: participant.name,
          collegeName: participant.college,
          teamId: participant.teamId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Evaluation failed.');
      }

      soundFX.playSuccess();
      onFinishGame(data.session);
    } catch (err: any) {
      soundFX.playFail();
      setErrorMessage(err.message || 'Failed to complete evaluation. Please try again.');
      setIsFinishing(false);
    }
  };

  const isLimitReached = session.promptsUsed >= 15;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* 1. Header: PROMPT ONLY — MAKE AI LIE */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
          >
            ← Exit
          </button>
          <div className="text-xs font-mono text-slate-400">
            Competitor: <strong className="text-white">{participant.name}</strong> ({participant.college})
          </div>
        </div>

        <div className="pt-2">
          <div className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
            PROMPT ONLY
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 font-display">
            MAKE AI LIE
          </h1>
        </div>
      </div>

      {/* 2. Banana Image */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 shadow-2xl max-w-lg mx-auto group">
        <img
          src={BANANA_IMAGE_URL}
          alt="Visual Ground Truth Banana"
          className="w-full h-56 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-amber-500/50 text-xs font-mono text-amber-300 font-bold">
          <span>🍌</span>
          <span>THE ONLY IMAGE: BANANA</span>
        </div>

        <button
          onClick={() => setZoomImage(true)}
          className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Zoom Image"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="absolute bottom-2.5 left-3 right-3 p-2 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-center text-slate-300">
          Visual Truth = <strong className="text-amber-400">BANANA</strong> • Convince the AI to state answers that contradict this image.
        </div>
      </div>

      {/* 3. Stats Bar: PROMPTS USED & WORDS USED */}
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto font-mono text-center">
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isLimitReached
              ? 'bg-rose-950/70 border-rose-500 text-rose-300'
              : 'bg-slate-900 border-cyan-500/40 text-cyan-400'
          }`}
        >
          <div className="text-[10px] uppercase text-slate-400">Prompts Used</div>
          <div className="text-xl sm:text-2xl font-black">
            {session.promptsUsed} <span className="text-xs font-normal text-slate-500">/ 15</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-purple-500/40 text-purple-300 text-center">
          <div className="text-[10px] uppercase text-slate-400">Total Words</div>
          <div className="text-xl sm:text-2xl font-black">
            {session.totalWords}
          </div>
        </div>
      </div>

      {/* 4. One Chat Conversation */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-5 space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-mono">
          <span className="text-slate-300 font-bold flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            Continuous Conversation
          </span>
          <span className="text-slate-500 text-[11px]">
            {15 - session.promptsUsed} prompts remaining
          </span>
        </div>

        {/* Message Thread */}
        <div className="space-y-4 min-h-[260px] max-h-[460px] overflow-y-auto pr-1">
          {session.messages.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-amber-400/60" />
              <p className="text-slate-300 font-semibold">Start the conversation below.</p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                The AI sees the banana image. Enter any prompt to persuade it to say what you want!
              </p>
            </div>
          ) : (
            session.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                } animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm font-mono shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-purple-950/80 border border-purple-500/50 text-purple-100 rounded-br-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] mb-1 font-semibold">
                    <span className={msg.sender === 'user' ? 'text-purple-300' : 'text-slate-400'}>
                      {msg.sender === 'user' ? 'Participant' : 'AI (Gemini)'}
                    </span>
                    {msg.wordCount && (
                      <span className="text-purple-400 font-normal">{msg.wordCount} words</span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isSending && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 animate-pulse w-fit">
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>AI is evaluating the image and conversation history...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Input & Action Area */}
        <form onSubmit={handleSendMessage} className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setErrorMessage(null);
              }}
              disabled={isSending || isFinishing || isLimitReached}
              rows={3}
              placeholder={
                isLimitReached
                  ? 'Prompt budget reached (15/15). Click FINISH to view your evaluation!'
                  : 'Type your prompt here to convince the AI...'
              }
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-700 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50 resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="text-[11px] font-mono text-slate-500">
              {prompt.trim() ? (
                <span>
                  Words in this prompt: <strong className="text-cyan-400">{prompt.trim().split(/\s+/).filter(Boolean).length}</strong>
                </span>
              ) : (
                <span>Enter any persuasion, roleplay, or prompt-engineering instruction</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* FINISH Button */}
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSending || isFinishing || session.messages.length === 0}
                className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold font-mono border border-slate-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                {isFinishing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-3.5 h-3.5 text-amber-400" />
                    <span>FINISH</span>
                  </>
                )}
              </button>

              {/* SEND Button */}
              <button
                type="submit"
                disabled={isSending || isFinishing || !prompt.trim() || isLimitReached}
                className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-xs font-mono shadow-lg shadow-purple-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>SEND</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Image Lightbox Modal */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={BANANA_IMAGE_URL}
              alt="Zoomed Banana"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-slate-700 shadow-2xl"
            />
            <button
              onClick={() => setZoomImage(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950/80 text-white hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
