"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, Flag, RotateCcw, Smile, Pencil } from 'lucide-react';
import chatClient from '../../lib/chatClient';
import { MessageReplyInline, type ReplyMessage } from './MessageReply';

// ============================================================================
// Status Icons
// ============================================================================

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
  // read
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline-block text-sky-400">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 6L13 17l-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ============================================================================
// Quick Reactions
// ============================================================================

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

function QuickReactions({ onSelect, show }: { onSelect: (emoji: string) => void; show: boolean }) { // eslint-disable-line no-unused-vars
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 5 }}
          className="absolute -top-10 left-0 flex items-center gap-0.5 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl px-1.5 py-1 shadow-2xl z-10"
        >
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-base hover:bg-white/10 transition-all active:scale-90"
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Message Bubble
// ============================================================================

export interface MessageData {
  id?: string;
  roomId?: string;
  senderId?: string;
  content: string;
  createdAt: string;
  status?: string;
  readAt?: string | null;
  messageType?: string;
  metadata?: any;
  replyTo?: ReplyMessage | null;
}

interface MessageBubbleProps {
  message: MessageData;
  isMine?: boolean;
  onReply?: (message: MessageData) => void; // eslint-disable-line no-unused-vars
}

export default function MessageBubble({ message, isMine, onReply }: MessageBubbleProps) {
  const [reactions, setReactions] = useState<any[]>([]);
  const [retrying, setRetrying] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [displayContent, setDisplayContent] = useState(message.content);
  const [isEdited, setIsEdited] = useState(!!(message as any).edited_at);
  const audioRef = useRef<HTMLAudioElement>(null);
  const actionsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch reactions
  useEffect(() => {
    if (!message.id) return;
    let cancelled = false;
    fetch(`/api/messages/${message.id}/reactions`)
      .then(res => res.json())
      .then(json => { if (!cancelled) setReactions(json.reactions ?? []); })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [message.id]);

  const getLocalUserId = useCallback(() => {
    const store = localStorage.getItem('ink_user_id');
    if (store) return store;
    const id = `local_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('ink_user_id', id);
    return id;
  }, []);

  const toggleReaction = useCallback(async (emoji: string) => {
    if (!message.id) return;
    setShowReactions(false);
    const userId = getLocalUserId();
    const res = await fetch('/api/reactions/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: message.id, userId, reaction: emoji }),
    });
    const json = await res.json();
    if (json.reactions) setReactions(json.reactions);
  }, [message.id, getLocalUserId]);

  const handleRetry = useCallback(async () => {
    if (!message.id) return;
    setRetrying(true);
    try {
      await chatClient.sendMessage(message.roomId ?? 'default', message.senderId ?? 'unknown', message.content);
    } catch {
      // ignore
    } finally {
      setRetrying(false);
    }
  }, [message]);

  const handleReport = useCallback(async () => {
    if (!message.id) return;
    const reporterId = getLocalUserId();
    await fetch('/api/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'report', messageId: String(message.id), reporterId, reason: 'inappropriate' })
    });
  }, [message.id, getLocalUserId]);

  const handleReply = useCallback(() => {
    if (onReply) onReply(message);
    setShowActions(false);
  }, [message, onReply]);

  const handleEdit = useCallback(async () => {
    if (!message.id || editText.trim() === displayContent) {
      setEditing(false);
      return;
    }
    try {
      const res = await fetch(`/api/messages/${message.id}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editText.trim(), senderId: message.senderId }),
      });
      if (res.ok) {
        setDisplayContent(editText.trim());
        setIsEdited(true);
      }
    } catch { /* silent */ }
    setEditing(false);
    setShowActions(false);
  }, [message.id, message.senderId, editText, displayContent]);

  const handleMouseEnter = () => {
    if (actionsTimeout.current) clearTimeout(actionsTimeout.current);
    setShowActions(true);
  };

  const handleMouseLeave = () => {
    actionsTimeout.current = setTimeout(() => {
      setShowActions(false);
      setShowReactions(false);
    }, 300);
  };

  // Unique grouped reactions
  const reactionGroups = reactions.reduce((acc: Record<string, { count: number; userReacted: boolean }>, r: any) => {
    if (!acc[r.reaction]) acc[r.reaction] = { count: 0, userReacted: false };
    acc[r.reaction].count++;
    if (r.user_id === (typeof window !== 'undefined' ? localStorage.getItem('ink_user_id') : null)) {
      acc[r.reaction].userReacted = true;
    }
    return acc;
  }, {});

  // Detect links
  const hasLink = /https?:\/\/\S+/.test(displayContent);

  return (
    <div
      className={`group relative flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          relative max-w-[75%] break-words rounded-2xl shadow-sm
          ${isMine
            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-md'
            : 'bg-white/[0.08] text-white/90 border border-white/5 rounded-bl-md'
          }
          ${message.status === 'sending' ? 'opacity-70' : ''}
        `}
      >
        {/* Reply inline */}
        {message.replyTo && (
          <div className="px-3 pt-2">
            <MessageReplyInline replyTo={message.replyTo} isMine={isMine} />
          </div>
        )}

        {/* Content */}
        <div className="px-3.5 py-2">
          {message.messageType === 'audio' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (audioRef.current) {
                    if (audioPlaying) audioRef.current.pause();
                    else audioRef.current.play();
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
              <audio ref={audioRef} src={message.content} onEnded={() => setAudioPlaying(false)} className="hidden" />
              <span className="text-sm">🎤 Audio message</span>
            </div>
          ) : (message.messageType === 'file' && message.metadata?.fileMimeType?.startsWith('image/')) ? (
            <div className="relative mt-1 mb-1 max-w-sm rounded-lg overflow-hidden border border-white/10">
              <a href={message.metadata?.fileUrl || message.content} target="_blank" rel="noopener noreferrer">
                <div className="relative w-full h-64">
                  <NextImage
                    src={message.metadata?.fileUrl || message.content}
                    alt={message.metadata?.fileName || 'Image'}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </a>
            </div>
          ) : message.messageType === 'file' ? (
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{message.metadata?.fileName || 'File'}</div>
                <div className="text-xs opacity-70">
                  {message.metadata?.fileSize ? `${(message.metadata.fileSize / 1024 / 1024).toFixed(1)}MB` : ''}
                </div>
              </div>
              <a
                href={message.metadata?.fileUrl || message.content}
                download={message.metadata?.fileName}
                className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition"
                title="Download"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
          ) : editing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-white/10 text-sm text-white rounded-lg px-2 py-1.5 outline-none border border-white/10 focus:border-indigo-500/50 resize-none"
                rows={2}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit(); }
                  if (e.key === 'Escape') { setEditing(false); setEditText(displayContent); }
                }}
              />
              <div className="flex items-center gap-1.5 justify-end">
                <button onClick={() => { setEditing(false); setEditText(displayContent); }} className="text-[10px] text-white/40 hover:text-white/60 px-2 py-0.5">Cancel</button>
                <button onClick={handleEdit} className="text-[10px] bg-indigo-500/80 hover:bg-indigo-500 text-white px-2 py-0.5 rounded">Save</button>
              </div>
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {hasLink ? renderWithLinks(displayContent) : displayContent}
            </div>
          )}

          {/* Timestamp + status */}
          <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] opacity-50">
            {isEdited && <span className="italic">edited</span>}
            <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {isMine && (
              <motion.span
                key={message.status ?? 'none'}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="flex items-center"
              >
                <StatusIcon status={message.status} />
              </motion.span>
            )}
          </div>
        </div>

        {/* Reactions display */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className="flex items-center gap-0.5 px-2 pb-1.5 flex-wrap">
            {Object.entries(reactionGroups).map(([emoji, { count, userReacted }]) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className={`
                  inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-colors
                  ${userReacted
                    ? 'bg-indigo-500/20 border border-indigo-500/30'
                    : 'bg-white/5 border border-white/5 hover:bg-white/10'
                  }
                `}
              >
                <span>{emoji}</span>
                <span className="text-[10px] text-white/60">{count}</span>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Hover actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`
              absolute top-0 flex items-center gap-0.5 bg-slate-800/90 backdrop-blur-xl
              border border-white/10 rounded-xl px-1 py-0.5 shadow-xl z-10
              ${isMine ? 'right-auto left-0 -translate-x-full mr-1' : 'left-auto right-0 translate-x-full ml-1'}
            `}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
              title="React"
            >
              <Smile size={14} />
            </button>
            {onReply && (
              <button
                onClick={handleReply}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
                title="Reply"
              >
                <Reply size={14} />
              </button>
            )}
            {isMine && message.messageType !== 'audio' && message.messageType !== 'file' && (
              <button
                onClick={() => { setEditing(true); setEditText(displayContent); setShowActions(false); }}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
                title="Edit"
              >
                <Pencil size={14} />
              </button>
            )}
            {!isMine && (
              <button
                onClick={handleReport}
                className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors"
                title="Report"
              >
                <Flag size={14} />
              </button>
            )}
            {message.status === 'failed' && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="p-1.5 rounded-lg text-red-400 hover:bg-white/5 transition-colors"
                title="Retry"
              >
                <RotateCcw size={14} className={retrying ? 'animate-spin' : ''} />
              </button>
            )}

            {/* Quick reactions popup */}
            <QuickReactions onSelect={toggleReaction} show={showReactions} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Link Detection Helper
// ============================================================================

function renderWithLinks(text: string): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}
