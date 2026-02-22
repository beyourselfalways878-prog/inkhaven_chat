"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { SkipForward, Loader2, Save, ShieldAlert, Ban } from 'lucide-react';
import MessageList from '../../../components/Chat/MessageList';
import MessageInput from '../../../components/Chat/MessageInput';
import PresenceIndicator from '../../../components/Chat/PresenceIndicator';
import { Avatar } from '../../../components/ui/avatar';
import { MessageSkeleton } from '../../../components/ui/skeleton';
import { AuraBlendBackground } from '../../../components/InkAura';
import { useSessionStore } from '../../../stores/useSessionStore';
import { useWebRTC } from '../../../lib/hooks/useWebRTC';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/ui/toast';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = (params?.room as string) || 'room_demo';
  const session = useSessionStore((s) => s.session);
  const setSession = useSessionStore((s) => s.setSession);
  const [ready, setReady] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

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

  const [panicked, setPanicked] = useState(false);

  // The Zen Panic Switch (Double tap Escape)
  useEffect(() => {
    let lastEsc = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const now = Date.now();
        if (now - lastEsc < 500) {
          // Double tap detected
          setPanicked(true);
          document.title = "404 Not Found";
        }
        lastEsc = now;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [myIntensity, setMyIntensity] = useState(0);

  if (panicked) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-mono text-black">
        <h1 className="text-4xl font-bold mb-4">404 Not Found</h1>
        <p>The requested URL was not found on this server.</p>
        <p className="mt-8 text-sm text-gray-500 hover:text-indigo-500 cursor-pointer transition-colors" onClick={() => { setPanicked(false); document.title = "InkHaven | Anonymous & Safe Chat"; }}>[Click to restore]</p>
      </div>
    );
  }

  const handleSaveChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.is_anonymous) {
        toast.error("You must register an account to save chats.");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (token && messages.length > 0) {
        await fetch('/api/chat/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ roomId, messages }),
          keepalive: true
        });
        toast.success("Chat history saved!");
      } else {
        toast.error("No messages to save yet.");
      }
    } catch (err) {
      toast.error("Failed to save chat.");
    }
  };

  const handleSkipChat = async () => {
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

  const handleBlockPartner = async () => {
    if (!partnerId) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      await fetch('/api/moderation/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ blockedId: partnerId })
      });
      toast.success("User blocked. Finding next match...");
      handleSkipChat();
    } catch (e) {
      toast.error("Failed to block user.");
    }
  };

  const submitReport = async () => {
    if (!partnerId || !reportReason.trim()) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      await fetch('/api/moderation/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reportedId: partnerId, roomId, reason: reportReason })
      });
      toast.success("User reported successfully.");
      setIsReporting(false);
      setReportReason("");
    } catch (e) {
      toast.error("Failed to submit report.");
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
      <div className="hyper-glass overflow-hidden shadow-2xl border border-white/10">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-obsidian-900/40 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-4">
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
              <div className="text-xl font-bold text-white tracking-wide">
                {isConnected ? 'Anonymous Partner' : 'Waiting in Limbo...'}
              </div>
              <div className="text-xs text-indigo-300 font-mono tracking-wider mt-0.5">
                {connectionState === 'connecting' ? 'NEGOTIATING P2P CONNECTION...' : connectionState === 'disconnected' ? 'PARTNER DISCONNECTED' : 'SECURE P2P CHANNEL'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <PresenceIndicator
              onlineCount={isConnected ? 2 : 1}
              partnerStatus={isConnected ? 'online' : 'offline'}
              partnerName={'Partner'}
              isConnected={isConnected}
            />
            <button
              onClick={handleSaveChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-xs font-medium transition-all hover:scale-105 active:scale-95"
              title="Save chat history"
            >
              <Save size={14} />
              <span className="hidden sm:inline uppercase tracking-widest">Save</span>
            </button>
            <button
              onClick={() => setIsReporting(true)}
              disabled={!isConnected || !partnerId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Report user"
            >
              <ShieldAlert size={14} />
              <span className="hidden sm:inline uppercase tracking-widest">Report</span>
            </button>
            <button
              onClick={handleBlockPartner}
              disabled={!isConnected || !partnerId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Block user"
            >
              <Ban size={14} />
              <span className="hidden lg:inline uppercase tracking-widest">Block</span>
            </button>
            <button
              onClick={handleSkipChat}
              disabled={skipping}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Skip to next chat"
            >
              <SkipForward size={14} />
              <span className="uppercase tracking-widest">Next</span>
            </button>
            <div className="pill border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-mono text-[10px] tracking-widest -ml-2">P2P TUNNEL</div>
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
            onEdit={editMessage}
            onReact={reactToMessage}
          />

          <MessageInput
            myId={myId}
            onIntensityChange={setMyIntensity}
            onSendMessage={sendMessage}
            onTyping={sendTyping}
          />
        </AuraBlendBackground>

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

          {isReporting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            >
              <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold text-white mb-2">Report User</h3>
                <p className="text-sm text-white/50 mb-4">Please specify why you are reporting this user. This action is closely monitored.</p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors mb-4 resize-none"
                  rows={4}
                  placeholder="Reason for reporting..."
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setIsReporting(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors">Cancel</button>
                  <button onClick={submitReport} disabled={!reportReason.trim()} className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors disabled:opacity-50">Submit Report</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
