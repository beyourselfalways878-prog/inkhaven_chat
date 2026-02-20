"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { SkipForward, Loader2 } from 'lucide-react';
import MessageList from '../../../components/Chat/MessageList';
import MessageInput from '../../../components/Chat/MessageInput';
import PresenceIndicator from '../../../components/Chat/PresenceIndicator';
import { Avatar } from '../../../components/ui/avatar';
import { MessageSkeleton } from '../../../components/ui/skeleton';
import { AuraBlendBackground } from '../../../components/InkAura';
import { useSessionStore } from '../../../stores/useSessionStore';
import { useWebRTC } from '../../../lib/hooks/useWebRTC';
import { supabase } from '../../../lib/supabase';
import type { ReplyMessage } from '../../../components/Chat/MessageReply';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = (params?.room as string) || 'room_demo';
  const session = useSessionStore((s) => s.session);
  const setSession = useSessionStore((s) => s.setSession);
  const [ready, setReady] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyMessage | null>(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const router = useRouter();

  const myId = session.userId || 'guest_local';
  const myAuraSeed = session.auraSeed ?? 42;
  const myRep = session.reputation ?? 50;

  // WebRTC P2P Hook
  const { messages, connectionState, partnerId, partnerTyping, sendMessage, sendTyping, editMessage, reactToMessage } = useWebRTC(roomId, myId);

  useEffect(() => {
    const initAuth = async () => {
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
      } catch (_err) {
        // fallback to local session
      } finally {
        setReady(true);
      }
    };
    initAuth();
  }, [session, setSession]);

  const handleReply = (message: any) => {
    setReplyTo({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.senderId === myId ? 'You' : 'Partner',
    });
  };

  const [myIntensity, setMyIntensity] = useState(0);

  const handleSkipChat = async () => {
    setShowSkipConfirm(false);
    setSkipping(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      // Sync chat history for authenticated users before leaving
      if (token && messages.length > 0) {
        try {
          fetch('/api/chat/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ roomId, messages }),
            keepalive: true // Send even if component unmounts
          });
        } catch (e) {
          // ignore sync failure
        }
      }

      const res = await fetch('/api/quick-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ action: 'skip', currentRoomId: roomId })
      });
      const data = await res.json();
      if (data.ok && data.data?.matchFound && data.data?.roomId) {
        router.push(`/chat/${data.data.roomId}`);
      } else {
        router.push('/quick-match');
      }
    } catch (err) {
      console.error('Skip chat failed:', err);
      setSkipping(false);
    }
  };

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

  const isConnected = connectionState === 'connected';

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="card overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-4">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <Avatar
                userId={partnerId || 'partner'}
                displayName={'Connected Partner'}
                size="md"
                showStatus
                status={'online'}
              />
            ) : (
              <Avatar displayName="?" size="md" showStatus status={connectionState === 'connecting' ? 'away' : 'offline'} />
            )}
            <div>
              <div className="text-lg font-semibold text-white">
                {isConnected ? 'Anonymous Partner' : 'Waiting for connection...'}
              </div>
              <div className="text-xs text-white/40">
                {connectionState === 'connecting' ? 'Negotiating P2P connection...' : connectionState === 'disconnected' ? 'Partner left' : 'Secure P2P Channel'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PresenceIndicator
              onlineCount={isConnected ? 2 : 1}
              partnerStatus={isConnected ? 'online' : 'offline'}
              partnerName={'Partner'}
              isConnected={isConnected}
            />
            <button
              onClick={() => setShowSkipConfirm(true)}
              disabled={skipping}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Skip to next chat"
            >
              <SkipForward size={14} />
              <span>Next</span>
            </button>
            <div className="pill border-indigo-500/50 text-indigo-400">P2P Encrypted</div>
          </div>
        </div>

        {/* Chat area */}
        <AuraBlendBackground
          seed1={myAuraSeed}
          rep1={myRep}
          seed2={isConnected ? 777 : 0}
          rep2={50}
          intensity={myIntensity}
          className="relative flex flex-col h-[70vh]"
        >

          <MessageList
            roomId={roomId}
            myId={myId}
            messages={messages}
            partnerTyping={partnerTyping}
            onReply={handleReply}
            onEdit={editMessage}
            onReact={reactToMessage}
          />

          <MessageInput
            myId={myId}
            replyTo={replyTo as any}
            onCancelReply={() => setReplyTo(null)}
            onIntensityChange={setMyIntensity}
            onSendMessage={sendMessage}
            onTyping={sendTyping}
          />
        </AuraBlendBackground>

        {/* Skip confirmation dialog */}
        <AnimatePresence>
          {showSkipConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSkipConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-white mb-2">End this chat?</h3>
                <p className="text-sm text-white/50 mb-6">
                  This will end your current conversation and match you with a new person.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSkipConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition"
                  >
                    Stay
                  </button>
                  <button
                    onClick={handleSkipChat}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <SkipForward size={16} />
                    Next Chat
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Searching overlay */}
        <AnimatePresence>
          {skipping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
              <p className="text-lg font-medium text-white animate-pulse">Finding your next match...</p>
              <p className="text-sm text-white/40 mt-1">Hang tight</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
