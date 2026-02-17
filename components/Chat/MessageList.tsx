"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import chatClient from '../../lib/chatClient';
import { subscribeToMessageStatus as noopSubStatus, Message } from '../../lib/mockChat';
import MessageBubble, { type MessageData } from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import DateSeparator from './DateSeparator';

interface MessageListProps {
  roomId: string;
  myId: string;
  onReply?: (message: MessageData) => void; // eslint-disable-line no-unused-vars
}

export default function MessageList({ roomId, myId, onReply }: MessageListProps) {
  const { data } = useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => chatClient.fetchMessages(roomId),
    refetchOnWindowFocus: false
  });
  const [messages, setMessages] = useState<Message[]>(data || []);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    if (data) setMessages(data);
  }, [data]);

  useEffect(() => {
    const unsub = chatClient.subscribeToRoom(roomId, (m) => {
      setMessages((prev) => [...prev, m]);
      // If not at bottom, increment unread
      if (!isAtBottomRef.current) {
        setUnreadCount(c => c + 1);
      }
    });

    const unsubStatusLocal = noopSubStatus(roomId, (payload) => {
      setMessages((prev) => prev.map((msg) => (String(msg.id) === String(payload.messageId) ? { ...msg, status: payload.status as any, readAt: payload.timestamp ?? msg.readAt } : msg)));
    });

    const unsubStatusRemote = chatClient.subscribeToMessageStatus ? chatClient.subscribeToMessageStatus(roomId, (payload: any) => {
      setMessages((prev) => prev.map((msg) => (String(msg.id) === String(payload.messageId) ? { ...msg, status: payload.status as any, readAt: payload.timestamp ?? msg.readAt } : msg)));
    }) : () => { };

    const unsubTyping = chatClient.subscribeToTyping(roomId, myId, ({ senderId, typing }: { senderId: string; typing: boolean }) => {
      setTypingUsers((prev) => {
        if (typing) {
          if (!prev.includes(senderId)) return [...prev, senderId];
          return prev;
        }
        return prev.filter((id) => id !== senderId);
      });
    });

    return () => {
      unsub();
      unsubStatusLocal();
      unsubStatusRemote();
      unsubTyping();
    };
  }, [roomId, myId]);

  // Group messages by date
  const grouped: Array<{ type: 'date' | 'message'; date?: string; message?: Message }> = [];
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

  // Auto-scroll when at bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, typingUsers]);

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
              />
            </motion.div>
          );
        })}
      </motion.div>

      {typingUsers.length > 0 && <TypingIndicator name={typingUsers[0] === myId ? undefined : typingUsers[0]} />}

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
