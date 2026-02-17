/* eslint-disable no-unused-vars */
import { supabase } from './supabase';

export type SupabaseMessage = {
  id: number | string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type?: string;
  created_at: string;
};

// Track active channels to avoid duplicates
const typingChannels = new Map<string, ReturnType<typeof supabase.channel>>();
const presenceChannels = new Map<string, ReturnType<typeof supabase.channel>>();

export const sendMessageToSupabase = async (roomId: string, senderId: string, content: string, messageType: string = 'text') => {
  const payload = { room_id: roomId, sender_id: senderId, content, message_type: messageType };
  const { data, error } = await supabase.from('messages').insert(payload).select().single();
  if (error) throw error;

  // Trigger server-side status simulator (server will insert statuses and auto-reply)
  try {
    await fetch('/api/simulate-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: String((data as any).id), roomId, content })
    });
  } catch (err) {
    // ignore failures - best effort
    console.warn('Failed to trigger status simulator', err);
  }

  return data as SupabaseMessage;
};

export const fetchMessagesFromSupabase = async (roomId: string) => {
  const { data, error } = await supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as SupabaseMessage[];
};

export const subscribeToRoomSupabase = (roomId: string, onInsert: (_m: SupabaseMessage) => void) => {
  const channel = supabase.channel(`room:${roomId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload) => {
      onInsert(payload.new as SupabaseMessage);
    })
    .subscribe();

  return () => {
    try {
      channel.unsubscribe();
    } catch (_e) {
      // ignore
    }
  };
};

export const subscribeToMessageStatusSupabase = (roomId: string, onStatus: (payload: { messageId: string; status: string; timestamp?: string }) => void) => {
  const channel = supabase.channel(`roomstatus:${roomId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_statuses' }, (payload) => {
      const msgId: string = String(payload.new.message_id);
      onStatus({ messageId: msgId, status: payload.new.status, timestamp: payload.new.created_at });
    })
    .subscribe();

  return () => {
    try {
      channel.unsubscribe();
    } catch (e) {
      // ignore
    }
  };
};

/**
 * Real-time typing indicator using Supabase Broadcast
 * This broadcasts typing events to all room participants instantly
 */
export const sendTypingSupabase = (roomId: string, senderId: string) => {
  const channelKey = `typing:${roomId}`;
  let channel = typingChannels.get(channelKey);

  if (!channel) {
    channel = supabase.channel(channelKey);
    channel.subscribe();
    typingChannels.set(channelKey, channel);
  }

  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { senderId, typing: true, timestamp: Date.now() }
  });
};

/**
 * Subscribe to typing events in a room
 */
export const subscribeToTypingSupabase = (
  roomId: string,
  currentUserId: string,
  onTyping: (payload: { senderId: string; typing: boolean }) => void
) => {
  const channelKey = `typing:${roomId}`;
  const channel = supabase.channel(channelKey);

  // Track typing timeouts to auto-clear typing state
  const typingTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

  channel
    .on('broadcast', { event: 'typing' }, (payload) => {
      const { senderId, typing } = payload.payload;

      // Ignore own typing events
      if (senderId === currentUserId) return;

      // Clear existing timeout for this sender
      const existingTimeout = typingTimeouts.get(senderId);
      if (existingTimeout) clearTimeout(existingTimeout);

      if (typing) {
        onTyping({ senderId, typing: true });

        // Auto-clear typing after 3 seconds of no updates
        const timeout = setTimeout(() => {
          onTyping({ senderId, typing: false });
          typingTimeouts.delete(senderId);
        }, 3000);
        typingTimeouts.set(senderId, timeout);
      } else {
        onTyping({ senderId, typing: false });
        typingTimeouts.delete(senderId);
      }
    })
    .subscribe();

  typingChannels.set(channelKey, channel);

  return () => {
    // Clear all typing timeouts
    typingTimeouts.forEach(timeout => clearTimeout(timeout));
    typingTimeouts.clear();

    try {
      channel.unsubscribe();
      typingChannels.delete(channelKey);
    } catch (_e) {
      // ignore
    }
  };
};

/**
 * Presence system - track online/offline status of room participants
 */
export type PresenceState = {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
};

export const subscribeToPresenceSupabase = (
  roomId: string,
  userId: string,
  displayName: string,
  onPresenceChange: (state: Record<string, PresenceState[]>) => void
) => {
  const channelKey = `presence:${roomId}`;
  const channel = supabase.channel(channelKey, {
    config: {
      presence: { key: userId }
    }
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresenceState>();
      onPresenceChange(state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('[Presence] User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('[Presence] User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId,
          displayName,
          status: 'online',
          lastSeen: new Date().toISOString()
        });
      }
    });

  presenceChannels.set(channelKey, channel);

  return () => {
    try {
      channel.untrack();
      channel.unsubscribe();
      presenceChannels.delete(channelKey);
    } catch (_e) {
      // ignore
    }
  };
};

/**
 * Update presence status (online, away, offline)
 */
export const updatePresenceStatus = async (
  roomId: string,
  userId: string,
  status: 'online' | 'away' | 'offline'
) => {
  const channelKey = `presence:${roomId}`;
  const channel = presenceChannels.get(channelKey);

  if (channel) {
    await channel.track({
      userId,
      status,
      lastSeen: new Date().toISOString()
    });
  }
};
