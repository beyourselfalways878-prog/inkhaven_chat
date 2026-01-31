"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import chatClient from '../../lib/chatClient';
import { subscribeToMessageStatus as noopSubStatus, Message } from '../../lib/mockChat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import DateSeparator from './DateSeparator';

export default function MessageList({ roomId, myId }: { roomId: string; myId: string }) {
  const { data } = useQuery({ queryKey: ['messages', roomId], queryFn: () => chatClient.fetchMessages(roomId), refetchOnWindowFocus: false });
  const [messages, setMessages] = useState<Message[]>(data || []);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (data) setMessages(data);
  }, [data]);

  useEffect(() => {
    const unsub = chatClient.subscribeToRoom(roomId, (m) => {
      setMessages((prev) => [...prev, m]);
    });

    const unsubStatusLocal = noopSubStatus(roomId, (payload) => {
      setMessages((prev) => prev.map((msg) => (String(msg.id) === String(payload.messageId) ? { ...msg, status: payload.status as any, readAt: payload.timestamp ?? msg.readAt } : msg)));
    });

    const unsubStatusRemote = (chatClient as any).subscribeToMessageStatus ? (chatClient as any).subscribeToMessageStatus(roomId, (payload: any) => {
      setMessages((prev) => prev.map((msg) => (String(msg.id) === String(payload.messageId) ? { ...msg, status: payload.status as any, readAt: payload.timestamp ?? msg.readAt } : msg)));
    }) : () => { };


    const unsubTyping = (chatClient as any).subscribeToTyping
      ? (chatClient as any).subscribeToTyping(roomId, myId, ({ senderId, typing }: { senderId: string; typing: boolean }) => {
        setTypingUsers((prev) => {
          if (typing) {
            if (!prev.includes(senderId)) return [...prev, senderId];
            return prev;
          }
          return prev.filter((id) => id !== senderId);
        });
      })
      : chatClient.subscribeToTyping(roomId, ({ senderId, typing }) => {
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
  }, [roomId]);

  // helper: group messages by date and insert separators
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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typingUsers]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-3">
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="flex flex-col gap-3">
        {grouped.map((g, idx) => {
          if (g.type === 'date') return <DateSeparator key={`d_${idx}`} dateString={g.date!} />;
          const m = g.message!;
          return (
            <motion.div key={m.id} variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}>
              <div className="message" key={m.id}>
                <MessageBubble message={m} isMine={m.senderId === myId} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {typingUsers.length > 0 && <TypingIndicator name={typingUsers[0] === myId ? undefined : typingUsers[0]} />}

      <div ref={endRef} />
    </div>
  );
}
