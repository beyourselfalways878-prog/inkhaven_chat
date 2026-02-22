'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '../../stores/useSessionStore';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import AuraSphere from '../../components/Profile/AuraSphere';
import { useToast } from '../../components/ui/toast';
import { Loader2, Users, ShieldCheck, Sparkles, Activity, Hash, X } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

export default function QuickMatchPage() {
  const router = useRouter();
  const { session } = useSessionStore();
  const [status, setStatus] = useState<'idle' | 'searching' | 'matched' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const toast = useToast();

  const hasStarted = React.useRef(false);

  const handleQuickMatch = async (forceGlobal: boolean = false) => {
    try {
      setStatus('searching');
      setErrorMsg('');

      // Get auth token from Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      let token = sessionData?.session?.access_token ?? null;

      if (!token) {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) throw anonError;
        token = anonData.session?.access_token ?? null;
        const userId = anonData.user?.id ?? session.userId;
        useSessionStore.getState().setSession({ ...session, userId });
      }

      if (!token) {
        throw new Error('Unable to authenticate. Please try refreshing the page.');
      }

      if (!turnstileToken) {
        throw new Error('Please complete the security check before matching.');
      }

      const res = await fetch('/api/quick-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Turnstile-Token': turnstileToken
        },
        body: JSON.stringify({
          interests: forceGlobal ? [] : interests // Send empty array to force fallback
        })
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.message || `Failed to join queue: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.data.matchFound && data.data.roomId) {
        setStatus('matched');
        toast.success('Match found! Connecting you now...');
        router.push(`/chat/${data.data.roomId}`);
      } else if (!forceGlobal && interests.length > 0) {
        // We are searching in interest pools, but didn't find anyone instantly.
        // Set a timeout to fallback to global pool if no one joins our interest set.
        setTimeout(() => {
          // We use a window timeout to trigger a re-match if needed. 
          // We dispatch a custom event that a useEffect will listen to so we don't violate React Hook closure rules.
          window.dispatchEvent(new CustomEvent('interest_match_timeout'));
        }, 12000); // 12 seconds
      }
    } catch (err: any) {
      console.error('Quick Match Error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      toast.error(err.message || 'Something went wrong.');
    }
  };

  // Remove auto-start if we want users to take time to enter interests.
  // Instead, the user will explicitly click a "Start Vibe Check" button.
  useEffect(() => {
    hasStarted.current = true;
  }, []);

  // 2. Realtime Subscription for "Waiting" users
  useEffect(() => {
    if (status !== 'searching' || !session.userId) return;

    const channel = supabase
      .channel(`quick-match-${session.userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_participants',
          filter: `user_id=eq.${session.userId}`
        },
        (payload) => {
          setStatus('matched');
          toast.success('Match found! Connecting you now...');
          setTimeout(() => {
            router.push(`/chat/${payload.new.room_id}`);
          }, 1500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [status, session.userId, router, toast]);

  // Handle Interest Tag Input
  const handleAddInterest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = interestInput.trim().toLowerCase();
      // Filter out spaces, special chars, keep it clean
      const cleanTag = newTag.replace(/[^a-z0-9]/g, '');
      if (cleanTag && !interests.includes(cleanTag) && interests.length < 5) {
        setInterests([...interests, cleanTag]);
        setInterestInput('');
      }
    }
  };

  const removeInterest = (tagToRemove: string) => {
    setInterests(interests.filter(tag => tag !== tagToRemove));
  };

  useEffect(() => {
    const handleTimeout = () => {
      if (status === 'searching') {
        toast.info("No match found for your interests. Broadening search...");
        handleQuickMatch(true).catch(console.error); // Force global
      }
    };

    window.addEventListener('interest_match_timeout', handleTimeout);
    return () => window.removeEventListener('interest_match_timeout', handleTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (!session.userId) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Background aura glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Quick Match
          </h1>
          <p className="text-white/50">
            Instantly connect with someone available now.
          </p>
        </div>

        {/* Main Action Area */}
        <div className="py-12 flex flex-col items-center justify-center min-h-[400px]">
          {status === 'idle' && (
            <div className="flex flex-col items-center w-full max-w-sm mx-auto animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <Activity className="w-10 h-10 text-indigo-400" />
              </div>

              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 backdrop-blur-md">
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-indigo-400" />
                  Match by Interests (Optional)
                </h3>
                <p className="text-xs text-white/50 mb-4 text-left">
                  Connect over shared vibes. Type a tag and press Enter. Leave blank for a random connection.
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {interests.map(tag => (
                    <span key={tag} className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-indigo-500/30">
                      {tag}
                      <button onClick={() => removeInterest(tag)} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>

                <input
                  type="text"
                  value={interestInput}
                  onChange={e => setInterestInput(e.target.value)}
                  onKeyDown={handleAddInterest}
                  disabled={interests.length >= 5}
                  placeholder={interests.length >= 5 ? "Limit reached (5 tags)" : "e.g. movies, gaming, travel..."}
                  className="w-full bg-obsidian-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
              </div>

              <div className="min-h-[65px] flex items-center justify-center w-full mb-6">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onSuccess={(token) => setTurnstileToken(token)}
                  options={{ theme: 'dark' }}
                />
              </div>

              <Button
                onClick={() => handleQuickMatch(false)}
                disabled={!turnstileToken}
                className="w-full h-12 text-sm uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:hover:scale-100"
              >
                Initiate Vibe Check
              </Button>
            </div>
          )}

          {status === 'searching' && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
              {/* Pulsing Aura during search */}
              <div className="relative mb-12">
                <AuraSphere inkId={session.inkId || 'fallback'} size="lg" isPulsing={true} comfortLevel={session.comfortLevel as any} />

                {/* Orbiting Search Ring */}
                <div className="absolute inset-[-20%] rounded-full border border-dashed border-indigo-500/50 animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-[-30%] rounded-full border border-purple-500/20 animate-[spin_8s_linear_infinite_reverse]" />
              </div>

              <div className="text-center">
                <p className="text-xl font-medium text-white tracking-widest uppercase flex items-center gap-3">
                  <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                  Scanning Frequencies
                </p>
                <p className="text-sm text-white/40 mt-2 font-mono">Calibrating matching vectors...</p>
              </div>
            </div>
          )}

          {/* Vibe Check Limbo State */}
          {status === 'matched' && (
            <div className="flex flex-col items-center w-full animate-in slide-in-from-bottom-10 fade-in duration-1000">
              <div className="text-center mb-10">
                <p className="text-sm font-mono text-emerald-400 mb-2 tracking-widest uppercase">Signal Locked</p>
                <h2 className="text-3xl font-bold text-white">Vibe Check</h2>
                <p className="text-white/50 text-sm mt-2">A connection is forming. Prepare your energy.</p>
              </div>

              <div className="flex items-center justify-center gap-8 w-full">
                {/* User's Aura */}
                <div className="flex flex-col items-center">
                  <AuraSphere inkId={session.inkId || 'fallback'} size="md" />
                  <span className="text-xs text-white/40 mt-4 font-mono">YOU</span>
                </div>

                {/* The Spark / Connection Line */}
                <div className="relative flex-1 max-w-[100px] h-[2px] bg-white/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-obsidian-900 border border-white/20 rounded-full p-2">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Partner's Aura (Mysterious fallback since inkId isn't known until channel connects) */}
                <div className="flex flex-col items-center">
                  <AuraSphere inkId="mysterious_stranger" size="md" comfortLevel="bold" isPulsing={true} />
                  <span className="text-xs text-white/40 mt-4 font-mono tracking-widest">UNKNOWN</span>
                </div>
              </div>

              <div className="mt-12 bg-white/5 px-6 py-3 rounded-full border border-white/10 flex items-center gap-3 backdrop-blur-md">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="text-sm text-white font-medium">Establishing Secure WebRTC Tunnel...</span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center animate-in zoom-in-95 duration-300">
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl mb-6 backdrop-blur-md">
                <p className="text-red-400 font-medium mb-2">Connection Severed</p>
                <p className="text-sm text-white/50">{errorMsg}</p>
              </div>
              <Button onClick={() => setStatus('idle')} variant="secondary" className="px-8">Recalibrate & Retry</Button>
            </div>
          )}
        </div>

        {/* Features / Reassurance */}
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-8 border-t border-white/5">
          <div className="flex flex-col items-center glass-panel p-4">
            <ShieldCheck className="w-6 h-6 text-indigo-400 mb-2" />
            <span className="text-xs text-white/60 font-medium tracking-wide">ZERO DATA RETAINED</span>
          </div>
          <div className="flex flex-col items-center glass-panel p-4">
            <Users className="w-6 h-6 text-purple-400 mb-2" />
            <span className="text-xs text-white/60 font-medium tracking-wide">ANONYMOUS P2P</span>
          </div>
        </div>
      </div>
    </div>
  );
}
