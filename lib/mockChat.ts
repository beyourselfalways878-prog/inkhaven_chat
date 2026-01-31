/* eslint-disable @typescript-eslint/no-unused-vars */
import { EventEmitter } from 'events';

// Timing constants for message lifecycle simulation
const TIMING = {
  SENT: 120,
  DELIVERED: 350,
  READ: 1500,
  AUTO_REPLY: 800,
  TYPING_EXPIRE: 1200,
  REPLY_READ: 900,
};

export type Message = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  readAt?: string | null;
};

const emitter = new EventEmitter();
emitter.setMaxListeners(100); // Prevent memory leak warnings
const inbox: Record<string, Message[]> = {};
const subscriptions: Map<string, Set<Function>> = new Map();

export const sendMessage = async (roomId: string, senderId: string, content: string) => {
  const msg: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    roomId,
    senderId,
    content,
    createdAt: new Date().toISOString(),
    status: 'sending',
    readAt: null
  };

  inbox[roomId] = inbox[roomId] || [];
  inbox[roomId].push(msg);

  // Emit to listeners
  emitter.emit(`room:${roomId}:message`, msg);

  // Simulate delivery lifecycle
  setTimeout(() => {
    msg.status = 'sent';
    emitter.emit(`room:${roomId}:status`, { messageId: msg.id, status: 'sent', timestamp: new Date().toISOString() });
  }, TIMING.SENT);

  setTimeout(() => {
    msg.status = 'delivered';
    emitter.emit(`room:${roomId}:status`, { messageId: msg.id, status: 'delivered', timestamp: new Date().toISOString() });
  }, TIMING.DELIVERED);

  // Simulate the recipient reading the message shortly after
  setTimeout(() => {
    msg.status = 'read';
    msg.readAt = new Date().toISOString();
    emitter.emit(`room:${roomId}:status`, { messageId: msg.id, status: 'read', timestamp: msg.readAt });
  }, TIMING.READ);

  // Simulate remote reply for demo (also emits statuses)
  setTimeout(() => {
    const reply: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      roomId,
      senderId: 'remote_bot',
      content: `Auto-reply to: "${content.slice(0, 120)}"`,
      createdAt: new Date().toISOString(),
      status: 'delivered',
      readAt: null
    };
    inbox[roomId].push(reply);
    emitter.emit(`room:${roomId}:message`, reply);

    // remote bot reads after a bit
    setTimeout(() => {
      reply.status = 'read';
      reply.readAt = new Date().toISOString();
      emitter.emit(`room:${roomId}:status`, { messageId: reply.id, status: 'read', timestamp: reply.readAt });
    }, TIMING.REPLY_READ);
  }, TIMING.AUTO_REPLY);

  return msg;
};

export const fetchMessages = async (roomId: string) => {
  return (inbox[roomId] || []).slice();
};

export const subscribeToRoom = (roomId: string, cb: (message: Message) => void) => {
  const handler = (message: Message) => cb(message);
  emitter.on(`room:${roomId}:message`, handler);

  // Track subscription for cleanup
  if (!subscriptions.has(roomId)) {
    subscriptions.set(roomId, new Set());
  }
  subscriptions.get(roomId)!.add(handler);

  return () => {
    emitter.removeListener(`room:${roomId}:message`, handler);
    const subs = subscriptions.get(roomId);
    if (subs) {
      subs.delete(handler);
      if (subs.size === 0) {
        subscriptions.delete(roomId);
        // Clean up inbox if no more subscriptions
        if (emitter.listenerCount(`room:${roomId}:message`) === 0) {
          delete inbox[roomId];
        }
      }
    }
  };
};

export const subscribeToMessageStatus = (roomId: string, cb: (payload: { messageId: string; status: string; timestamp?: string }) => void) => {
  const handler = (payload: any) => cb(payload);
  emitter.on(`room:${roomId}:status`, handler);

  if (!subscriptions.has(roomId)) {
    subscriptions.set(roomId, new Set());
  }
  subscriptions.get(roomId)!.add(handler);

  return () => {
    emitter.removeListener(`room:${roomId}:status`, handler);
    const subs = subscriptions.get(roomId);
    if (subs) {
      subs.delete(handler);
      if (subs.size === 0) {
        subscriptions.delete(roomId);
      }
    }
  };
};

export const sendTyping = (roomId: string, senderId: string) => {
  emitter.emit(`room:${roomId}:typing`, { senderId, typing: true });
  // auto-expire typing state for demo
  setTimeout(() => {
    emitter.emit(`room:${roomId}:typing`, { senderId, typing: false });
  }, TIMING.TYPING_EXPIRE);
};

export const subscribeToTyping = (roomId: string, cb: (payload: { senderId: string; typing: boolean }) => void) => {
  const handler = (payload: any) => cb(payload);
  emitter.on(`room:${roomId}:typing`, handler);

  if (!subscriptions.has(roomId)) {
    subscriptions.set(roomId, new Set());
  }
  subscriptions.get(roomId)!.add(handler);

  return () => {
    emitter.removeListener(`room:${roomId}:typing`, handler);
    const subs = subscriptions.get(roomId);
    if (subs) {
      subs.delete(handler);
      if (subs.size === 0) {
        subscriptions.delete(roomId);
      }
    }
  };
};

// Helper: allow other implementations (e.g., Supabase-backed client) to emit statuses / server messages into the same local event bus
export const emitMessageStatus = (roomId: string, payload: { messageId: string; status: string; timestamp?: string }) => {
  emitter.emit(`room:${roomId}:status`, payload);
};

export const emitServerMessage = (roomId: string, message: Message) => {
  inbox[roomId] = inbox[roomId] || [];
  inbox[roomId].push(message);
  emitter.emit(`room:${roomId}:message`, message);
};
