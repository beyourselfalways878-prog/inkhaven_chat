/* eslint-disable no-unused-vars */
// Picks the right chat implementation: Supabase (if configured) or local mock otherwise
import * as mock from './mockChat';
let client: typeof mock;

try {
  // Use NEXT_PUBLIC_USE_MOCK_CHAT to force mock for tests/debugging
  const forceMock = process.env.NEXT_PUBLIC_USE_MOCK_CHAT === '1' || process.env.NEXT_PUBLIC_USE_MOCK_CHAT === 'true';

  // Use NEXT_PUBLIC_SUPABASE_URL to choose Supabase if available (client uses anon key)
  if (!forceMock && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Lazy import to avoid requiring Supabase during tests when not configured
    const sup = require('./supabaseChat');

    client = {
      sendMessage: async (roomId: string, senderId: string, content: string, messageType: string = 'text') => {
        // Optimistic push using mock shape, but persist via supabase
        const inserted = await sup.sendMessageToSupabase(roomId, senderId, content, messageType);

        // Supabase will insert message_statuses via the simulator endpoint; but we also subscribe to status table
        // to receive status updates; nothing more to do here.

        return {
          id: `msg_${inserted.id}`,
          roomId: inserted.room_id,
          senderId: inserted.sender_id,
          content: inserted.content,
          createdAt: inserted.created_at,
          status: 'sent',
          readAt: null,
        };
      },
      fetchMessages: async (roomId: string) => {
        const res = await sup.fetchMessagesFromSupabase(roomId);
        return res.map((r: any) => ({ id: `msg_${r.id}`, roomId: r.room_id, senderId: r.sender_id, content: r.content, createdAt: r.created_at, status: 'delivered', readAt: null }));
      },
      subscribeToRoom: (roomId: string, cb: (_m: any) => void) => {
        return sup.subscribeToRoomSupabase(roomId, (r: any) => cb({ id: `msg_${r.id}`, roomId: r.room_id, senderId: r.sender_id, content: r.content, createdAt: r.created_at, status: 'delivered', readAt: null }));
      },

      subscribeToMessageStatus: (roomId: string, cb: (p: any) => void) => {
        return sup.subscribeToMessageStatusSupabase(roomId, (payload: any) => cb(payload));
      },

      // Real-time typing via Supabase Broadcast
      sendTyping: (roomId: string, senderId: string) => {
        sup.sendTypingSupabase(roomId, senderId);
      },

      // Subscribe to typing events from other users
      subscribeToTyping: (roomId: string, currentUserId: string, cb: (p: any) => void) => {
        // If currentUserId not provided, try to extract from the callback signature
        // This maintains backwards compatibility with mock interface
        if (typeof currentUserId === 'function') {
          // Old signature: subscribeToTyping(roomId, cb)
          const callback = currentUserId as unknown as (p: any) => void;
          return sup.subscribeToTypingSupabase(roomId, '', callback);
        }
        return sup.subscribeToTypingSupabase(roomId, currentUserId, cb);
      },

      // Presence system for online/offline status
      subscribeToPresence: (roomId: string, userId: string, displayName: string, cb: (state: any) => void) => {
        return sup.subscribeToPresenceSupabase(roomId, userId, displayName, cb);
      },

      updatePresenceStatus: async (roomId: string, userId: string, status: 'online' | 'away' | 'offline') => {
        return sup.updatePresenceStatus(roomId, userId, status);
      },

      // Emit status lifecycle into local mock emitter so UI sees status updates
      _emitStatusLifecycle: (inserted: any) => {
        // reuse mock emitter helpers to avoid duplicating logic
        const mockLib = require('./mockChat');
        const roomId = `room_${inserted.room_id}`.startsWith('room_') ? inserted.room_id : inserted.room_id;
        const messageId = `msg_${inserted.id}`;

        setTimeout(() => {
          mockLib.emitMessageStatus(inserted.room_id, { messageId, status: 'sent', timestamp: new Date().toISOString() });
        }, 120);

        setTimeout(() => {
          mockLib.emitMessageStatus(inserted.room_id, { messageId, status: 'delivered', timestamp: new Date().toISOString() });
        }, 350);

        setTimeout(() => {
          mockLib.emitMessageStatus(inserted.room_id, { messageId, status: 'read', timestamp: new Date().toISOString() });
        }, 1500);

        // simulate server-side reply
        setTimeout(() => {
          const reply = {
            id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            roomId: inserted.room_id,
            senderId: 'remote_bot',
            content: `Auto-reply to: "${inserted.content.slice(0, 120)}"`,
            createdAt: new Date().toISOString(),
            status: 'delivered',
            readAt: null
          };
          mockLib.emitServerMessage(inserted.room_id, reply);

          setTimeout(() => {
            mockLib.emitMessageStatus(inserted.room_id, { messageId: reply.id, status: 'read', timestamp: new Date().toISOString() });
          }, 900);
        }, 800);
      }
    } as unknown as typeof mock;
  } else {
    client = mock;
  }
} catch (err) {
  console.warn('Error initializing supabase chat client, falling back to mock', err);
  client = mock;
}

export default client;