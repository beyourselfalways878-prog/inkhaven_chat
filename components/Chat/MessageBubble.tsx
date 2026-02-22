/* eslint-disable no-unused-vars */
"use client";

import React, { useState, useRef, useCallback } from 'react';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, Smile, Pencil, Check, CheckCheck } from 'lucide-react';
import { MessageReplyInline } from './MessageReply';
import type { WebRTCMessage } from '../../lib/hooks/useWebRTC';

// ============================================================================
// Status Icons
// ============================================================================

// Status Icons removed because they are unused locally in P2P right now

// ============================================================================
// Quick Reactions
// ============================================================================

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

function QuickReactions({ onSelect, show }: { onSelect: (_emoji: string) => void; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 5 }}
          className="absolute -top-10 left-0 flex items-center gap-0.5 bg-white dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl px-1.5 py-1 shadow-2xl z-10"
        >
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-base hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-90"
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

interface MessageBubbleProps {
  message: WebRTCMessage;
  isMine?: boolean;
  onReply?: (_message: WebRTCMessage) => void;
  onEdit?: (_messageId: string, _newContent: string) => void;
  onReact?: (_messageId: string, _reaction: string) => void;
}

export default function MessageBubble({ message, isMine, onReply, onEdit, onReact }: MessageBubbleProps) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const audioRef = useRef<HTMLAudioElement>(null);
  const actionsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleReaction = useCallback((emoji: string) => {
    setShowReactions(false);
    if (onReact) onReact(message.id, emoji);
  }, [message.id, onReact]);

  const handleReply = useCallback(() => {
    if (onReply) onReply(message);
    setShowActions(false);
  }, [message, onReply]);

  const handleEdit = useCallback(() => {
    if (editText.trim() !== message.content && onEdit) {
      onEdit(message.id, editText.trim());
    }
    setEditing(false);
    setShowActions(false);
  }, [message.id, message.content, editText, onEdit]);

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

  // Group reactions locally via the injected reactions array from WebRTC props
  const reactionGroups = (message.reactions || []).reduce((acc: Record<string, { count: number; userReacted: boolean }>, r: string) => {
    if (!acc[r]) acc[r] = { count: 0, userReacted: false };
    acc[r].count++;
    // In true P2P, we just let them show regardless or track my vs partner. Simplified here.
    return acc;
  }, {});

  const hasLink = /https?:\/\/\S+/.test(message.content);

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
            : 'bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white/90 border border-slate-200 dark:border-white/5 rounded-bl-md'
          }
        `}
      >
        {/* Reply inline */}
        {message.replyToId && (
          <div className="px-3 pt-2">
            <MessageReplyInline replyTo={{ id: message.replyToId, content: 'Replying to message...' } as any} isMine={isMine} />
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
          ) : message.messageType === 'glowpad' ? (
            <div className="relative mt-2 mb-2 p-2 bg-obsidian-950 rounded-xl border border-white/5 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <NextImage
                src={message.content}
                alt="Ephemeral Neon Stroke"
                width={200}
                height={200}
                className="object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]"
              />
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
                  File Attachment
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
                className="w-full bg-slate-100 dark:bg-white/10 text-sm text-slate-900 dark:text-white rounded-lg px-2 py-1.5 outline-none border border-slate-200 dark:border-white/10 focus:border-indigo-500/50 resize-none"
                rows={2}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit(); }
                  if (e.key === 'Escape') { setEditing(false); setEditText(message.content); }
                }}
              />
              <div className="flex items-center gap-1.5 justify-end">
                <button onClick={() => { setEditing(false); setEditText(message.content); }} className="text-[10px] text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60 px-2 py-0.5">Cancel</button>
                <button onClick={handleEdit} className="text-[10px] bg-indigo-500/80 hover:bg-indigo-500 text-white px-2 py-0.5 rounded">Save</button>
              </div>
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {hasLink ? renderWithLinks(message.content) : message.content}
            </div>
          )}

          {/* Timestamp + status */}
          <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px]">
            {message.isEdited && <span className="italic opacity-50">edited</span>}
            <span className="opacity-50">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {isMine && message.status && (
              <span className="ml-0.5 flex items-center">
                {message.status === 'sending' && <Check className="w-3.5 h-3.5 text-slate-300 dark:text-white/30" />}
                {message.status === 'sent' && <Check className="w-3.5 h-3.5 text-slate-400 dark:text-white/50" />}
                {message.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-slate-400 dark:text-white/50" />}
                {message.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-[#4ea8de]" />}
              </span>
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
                    : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10'
                  }
                `}
              >
                <span>{emoji}</span>
                <span className="text-[10px] text-slate-500 dark:text-white/60">{count}</span>
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
              absolute top-0 flex items-center gap-0.5 bg-white dark:bg-slate-800/90 backdrop-blur-xl
              border border-slate-200 dark:border-white/10 rounded-xl px-1 py-0.5 shadow-xl z-10
              ${isMine ? 'right-auto left-0 -translate-x-full mr-1' : 'left-auto right-0 translate-x-full ml-1'}
            `}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {onReact && (
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1.5 rounded-lg text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/80 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                title="React"
              >
                <Smile size={14} />
              </button>
            )}
            {onReply && (
              <button
                onClick={handleReply}
                className="p-1.5 rounded-lg text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/80 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                title="Reply"
              >
                <Reply size={14} />
              </button>
            )}
            {isMine && message.messageType !== 'audio' && message.messageType !== 'file' && onEdit && (
              <button
                onClick={() => { setEditing(true); setEditText(message.content); setShowActions(false); }}
                className="p-1.5 rounded-lg text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/80 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                title="Edit"
              >
                <Pencil size={14} />
              </button>
            )}

            {/* Quick reactions popup */}
            {onReact && <QuickReactions onSelect={toggleReaction} show={showReactions} />}
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
