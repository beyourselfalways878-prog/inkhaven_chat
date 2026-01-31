"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import chatClient from '../../lib/chatClient';

function StatusIcon({ status }: { status?: string }) {
  if (!status) return null;
  if (status === 'sending') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline-block opacity-80">
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      </svg>
    );
  }

  if (status === 'sent') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline-block opacity-80">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === 'delivered') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline-block opacity-80">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 6L13 17l-4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      </svg>
    );
  }

  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline-block text-sky-400">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 6L13 17l-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MessageBubble({ message, isMine }: { message: { content: string; createdAt: string; status?: string; readAt?: string | null; id?: string; roomId?: string; senderId?: string; messageType?: string; metadata?: any }, isMine?: boolean }) {
  const statusLabel = message.status ? message.status.charAt(0).toUpperCase() + message.status.slice(1) : '';
  const [reactions, setReactions] = React.useState<any[]>([]);
  const [retrying, setRetrying] = React.useState(false);
  const [audioPlaying, setAudioPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  function getLocalUserId() {
    const store = localStorage.getItem('ink_user_id');
    if (store) return store;
    const id = `local_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('ink_user_id', id);
    return id;
  }

  async function fetchReactions() {
    if (!message.id) return;
    const res = await fetch(`/api/messages/${message.id}/reactions`);
    const json = await res.json();
    setReactions(json.reactions ?? []);
  }

  React.useEffect(() => {
    fetchReactions();
  }, [message.id]);

  async function toggleReaction(emoji: string) {
    if (!message.id) return;
    const userId = getLocalUserId();
    const res = await fetch('/api/reactions/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: message.id, userId, reaction: emoji }),
    });
    const json = await res.json();
    if (json.reactions) setReactions(json.reactions);
  }

  async function handleRetry() {
    if (!message.id) return;
    setRetrying(true);
    try {
      await chatClient.sendMessage(message.roomId ?? 'default', message.senderId ?? 'unknown', message.content);
    } catch (err) {
      // ignore
    } finally {
      setRetrying(false);
    }
  }

  async function handleReport() {
    if (!message.id) return;
    const reporterId = getLocalUserId();
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: String(message.id), reporterId, reason: 'inappropriate' })
    });
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`max-w-[80%] break-words px-4 py-2 rounded-lg shadow-sm flex flex-col ${isMine ? 'bg-indigo-600 text-white self-end' : 'bg-white text-slate-800 self-start'} ${message.status === 'sending' ? 'animate-pulse' : ''}`}
      >
        {/* Render based on message type */}
        {message.messageType === 'audio' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (audioRef.current) {
                  if (audioPlaying) {
                    audioRef.current.pause();
                  } else {
                    audioRef.current.play();
                  }
                  setAudioPlaying(!audioPlaying);
                }
              }}
              className="flex-shrink-0 p-2 rounded-full hover:bg-white/20 transition"
            >
              {audioPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
            <audio
              ref={audioRef}
              src={message.content}
              onEnded={() => setAudioPlaying(false)}
              className="hidden"
            />
            <span className="text-sm">🎤 Audio message</span>
          </div>
        ) : message.messageType === 'file' ? (
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium">{message.metadata?.fileName || 'File'}</div>
              <div className="text-xs opacity-70">
                {message.metadata?.fileSize ? `${(message.metadata.fileSize / 1024 / 1024).toFixed(1)}MB` : 'File'}
              </div>
            </div>
            <a
              href={message.content}
              download={message.metadata?.fileName}
              className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition"
              title="Download"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          </div>
        ) : (
          <div className="text-sm">{message.content}</div>
        )}

        <div className="mt-1 flex items-center justify-between text-[10px] opacity-60">
          <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
          {isMine && (
            <motion.span
              key={message.status ?? 'none'}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="ml-2 flex items-center gap-1"
            >
              <StatusIcon status={message.status} />
              <span className="sr-only">{statusLabel}</span>
              <span role="status" aria-label={statusLabel} data-testid={`msg-status-${message.id}`} className="sr-only">
                {statusLabel}
              </span>
            </motion.span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-2">
            {['👍', '❤️', '😂'].map((emo) => {
              const count = reactions.filter((r) => r.reaction === emo).length;
              const userReacted = reactions.some((r) => r.reaction === emo && r.user_id === (typeof window !== 'undefined' ? localStorage.getItem('ink_user_id') : null));
              return (
                <button
                  key={emo}
                  className={`text-xs px-2 py-1 rounded ${userReacted ? 'bg-slate-200' : 'bg-transparent'}`}
                  onClick={() => toggleReaction(emo)}
                >
                  <span className="mr-1">{emo}</span>
                  <span className="text-[11px]">{count}</span>
                </button>
              );
            })}
          </div>

          {message.status === 'failed' && (
            <button onClick={handleRetry} disabled={retrying} className="text-xs text-red-500">
              {retrying ? 'Retrying...' : 'Retry'}
            </button>
          )}

          {!isMine && (
            <button onClick={handleReport} className="text-xs text-slate-400 hover:text-slate-600">
              Report
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
