/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import DateSeparator from './DateSeparator';
import type { WebRTCMessage } from '../../lib/hooks/useWebRTC';

export interface MessageListProps {
  roomId: string;
  myId: string;
  messages: WebRTCMessage[];
  partnerTyping: boolean;
  onReply?: (_message: WebRTCMessage) => void;
  onEdit?: (_messageId: string, _newContent: string) => void;
  onReact?: (_messageId: string, _reaction: string) => void;
}

export default function MessageList({ myId, messages, partnerTyping, onReply, onEdit, onReact }: MessageListProps) {
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);

  // Auto-scroll when at bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      setUnreadCount(c => c + 1);
    }
  }, [messages, partnerTyping]);

  // Track scroll position
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const atBottom = distanceFromBottom < 80;
    isAtBottomRef.current = atBottom;
    setShowScrollFab(!atBottom && messages.length > 10);
    if (atBottom) setUnreadCount(0);
  }, [messages.length]);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUnreadCount(0);
  };

  // Group messages by date
  const grouped: Array<{ type: 'date' | 'message'; date?: string; message?: WebRTCMessage }> = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const prev = messages[i - 1];
    const msgDate = new Date(msg.createdAt);
    const msgDay = msgDate.toDateString();
    const prevDay = prev ? new Date(prev.createdAt).toDateString() : null;

    if (!prev || msgDay !== prevDay) {
      grouped.push({ type: 'date', date: msgDay });
    }
    grouped.push({ type: 'message', message: msg });
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1 scrollbar-thin relative"
    >
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.04 } } }}
        className="flex flex-col gap-1"
      >
        {grouped.map((g, idx) => {
          if (g.type === 'date') return <DateSeparator key={`d_${idx}`} dateString={g.date!} />;
          const m = g.message!;
          return (
            <motion.div
              key={m.id}
              variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
            >
              <MessageBubble
                message={m}
                isMine={m.senderId === myId}
                onReply={onReply}
                onEdit={onEdit}
                onReact={onReact}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {partnerTyping && <TypingIndicator />}

      <div ref={endRef} />

      {/* Scroll-to-bottom FAB */}
      <AnimatePresence>
        {showScrollFab && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="sticky bottom-4 self-center bg-indigo-600 text-white rounded-full p-2.5 shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-colors z-10"
          >
            <ChevronDown size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
