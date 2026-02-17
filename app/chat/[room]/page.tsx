"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import MessageList from '../../../components/Chat/MessageList';
import MessageInput from '../../../components/Chat/MessageInput';
import MessageSearch from '../../../components/Chat/MessageSearch';
import PresenceIndicator from '../../../components/Chat/PresenceIndicator';
import { Avatar } from '../../../components/ui/avatar';
import { MessageSkeleton } from '../../../components/ui/skeleton';
import { AuraBlendBackground } from '../../../components/InkAura';
import { useSessionStore } from '../../../stores/useSessionStore';
import { usePresence } from '../../../lib/hooks/usePresence';
import { supabase } from '../../../lib/supabase';
import type { ReplyMessage } from '../../../components/Chat/MessageReply';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = (params?.room as string) || 'room_demo';
  const session = useSessionStore((s) => s.session);
  const setSession = useSessionStore((s) => s.setSession);
  const [currentRoom, setCurrentRoom] = useState(roomId);
  const [ready, setReady] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyMessage | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const myId = session.userId || 'guest_local';
  const displayName = session.displayName || session.inkId || 'Anonymous';
  const myAuraSeed = session.auraSeed ?? 42;
  const myRep = session.reputation ?? 50;

  // Real-time presence tracking
  const { onlineUsers, isConnected } = usePresence(currentRoom, myId, displayName);

  // Get partner for 1:1 chat
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
          setSession({ ...session, userId });
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
  }, [currentRoom, session, setSession]);

  const handleReply = (message: any) => {
    setReplyTo({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.senderId === myId ? 'You' : partner?.displayName,
    });
  };

  // Resonant Aura State
  const [myIntensity, setMyIntensity] = useState(0);

  if (!ready) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
          </div>
          <MessageSkeleton count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="card overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-4">
          <div className="flex items-center gap-3">
            {partner ? (
              <Avatar
                userId={partner.userId}
                displayName={partner.displayName}
                size="md"
                showStatus
                status={partner.status as any || 'online'}
              />
            ) : (
              <Avatar displayName="?" size="md" />
            )}
            <div>
              <div className="text-lg font-semibold text-white">
                {partner?.displayName || `Room ${currentRoom.slice(0, 8)}`}
              </div>
              <div className="text-xs text-white/40">
                {partner ? (partner.status === 'online' ? 'Online' : 'Away') : 'Private room'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PresenceIndicator
              onlineCount={onlineUsers.length}
              partnerStatus={partner?.status}
              partnerName={partner?.displayName}
              isConnected={isConnected}
            />
            <button
              onClick={() => setShowSearch((s) => !s)}
              className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
              title="Search messages"
            >
              <Search size={14} className="text-white/50" />
            </button>
            <div className="pill">Safe mode</div>
          </div>
        </div>

        {/* Chat area with aura blend */}
        <AuraBlendBackground
          seed1={myAuraSeed}
          rep1={myRep}
          seed2={partner ? hashCode(partner.userId) : 777}
          rep2={50}
          intensity={myIntensity}
          className="relative flex flex-col h-[70vh]"
        >
          <AnimatePresence>
            {showSearch && (
              <MessageSearch
                roomId={currentRoom}
                onClose={() => setShowSearch(false)}
              />
            )}
          </AnimatePresence>
          <MessageList roomId={currentRoom} myId={myId ?? 'guest_local'} onReply={handleReply} />
          <MessageInput
            roomId={currentRoom}
            myId={myId ?? 'guest_local'}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onIntensityChange={setMyIntensity}
          />
        </AuraBlendBackground>
      </div>
    </div>
  );
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
