"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MessageList from '../../../components/Chat/MessageList';
import MessageInput from '../../../components/Chat/MessageInput';
import PresenceIndicator from '../../../components/Chat/PresenceIndicator';
import { useSessionStore } from '../../../stores/useSessionStore';
import { usePresence } from '../../../lib/hooks/usePresence';
import { supabase } from '../../../lib/supabase';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = (params?.room as string) || 'room_demo';
  const session = useSessionStore((s) => s.session);
  const setSession = useSessionStore((s) => s.setSession);
  const [currentRoom, setCurrentRoom] = useState(roomId);
  const [ready, setReady] = useState(false);

  const myId = session.userId || 'guest_local';
  const displayName = session.displayName || session.inkId || 'Anonymous';

  // Real-time presence tracking
  const { onlineUsers, isConnected } = usePresence(currentRoom, myId, displayName);

  // Get partner status for 1:1 chat
  const partner = onlineUsers.find(u => u.userId !== myId);

  useEffect(() => {
    if (roomId) setCurrentRoom(roomId);
  }, [roomId]);

  useEffect(() => {
    const ensureMembership = async () => {
      try {
        let userId = session.userId ?? null;
        if (!userId) {
          const { data } = await supabase.auth.getSession();
          userId = data?.session?.user?.id ?? null;
        }

        if (!userId) {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          userId = data.user?.id ?? null;
          setSession({ ...session, userId, token: data.session?.access_token ?? null });
        }

        if (userId) {
          await fetch('/api/rooms/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, roomId: currentRoom })
          });
        }
      } catch (_err) {
        // fallback to local session
      } finally {
        setReady(true);
      }
    };
    ensureMembership();
  }, [currentRoom]);

  if (!ready) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="card p-6">Preparing your secure room...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b bg-white/80 dark:bg-slate-900/80 px-6 py-4">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Private room</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">Room {currentRoom.slice(0, 8)}</div>
          </div>
          <div className="flex items-center gap-3">
            <PresenceIndicator
              onlineCount={onlineUsers.length}
              partnerStatus={partner?.status}
              partnerName={partner?.displayName}
              isConnected={isConnected}
            />
            <div className="pill">Safe mode</div>
          </div>
        </div>
        <div className="flex flex-col h-[70vh]">
          <MessageList roomId={currentRoom} myId={myId ?? 'guest_local'} />
          <MessageInput roomId={currentRoom} myId={myId ?? 'guest_local'} />
        </div>
      </div>
    </div>
  );
}

