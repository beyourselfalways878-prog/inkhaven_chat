"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSessionStore } from '../../stores/useSessionStore';
import { supabase } from '../../lib/supabase';
import MoodSelector, { Mood } from '../../components/MoodSelector';
import KarmaBadge, { useKarma } from '../../components/KarmaBadge';
import { getModerationMode } from '../../components/ModerationGate';

export default function QuickMatchPage() {
  const [mode, setMode] = useState<'deep' | 'casual' | 'support'>('casual');
  const [mood, setMood] = useState<Mood | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const setSession = useSessionStore((s) => s.setSession);
  const { karma } = useKarma();

  const startMatch = async () => {
    if (!mood) return; // Require mood selection

    setLoading(true);
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

      // Use consolidated matching API
      await fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enqueue', userId, mode, mood })
      });

      const matchRes = await fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'find', userId, mode })
      });
      const matchJson = await matchRes.json();

      if (matchJson?.data?.matched) {
        setLoading(false);
        router.push(`/chat/${matchJson.data.roomId}`);
        return;
      }

      // Use consolidated rooms API
      const roomRes = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', userId, mode })
      });
      const roomJson = await roomRes.json();
      const roomId = roomJson?.data?.id ?? `room_${Math.random().toString(36).slice(2, 9)}`;
      setLoading(false);
      router.push(`/chat/${roomId}`);
    } catch (_err) {
      const roomId = `room_${Math.random().toString(36).slice(2, 9)}`;
      setLoading(false);
      router.push(`/chat/${roomId}`);
    }
  };

  const moderationMode = typeof window !== 'undefined' ? getModerationMode() : 'safe';

  return (
    <div className="container mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="pill">Instant matching</span>
              <KarmaBadge karma={karma} size="sm" />
              <span className={`text-xs px-2 py-1 rounded-full ${moderationMode === 'safe' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {moderationMode === 'safe' ? '🛡️ Safe Mode' : '🔞 18+ Mode'}
              </span>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Quick Match</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Select your mood — we'll pair you with someone on the same wavelength.
            </p>
          </div>
        </div>

        {/* Mood Selector */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            How are you feeling? <span className="text-sm font-normal" style={{ color: 'var(--color-text-tertiary)' }}>(required)</span>
          </h3>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Mode Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Conversation type
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { id: 'casual', title: '💬 Casual', desc: 'Light conversation and gentle connection.' },
              { id: 'deep', title: '🌊 Deep', desc: 'Meaningful, reflective dialogue.' },
              { id: 'support', title: '💚 Support', desc: 'A safe space to be heard.' },
            ].map((card) => (
              <motion.button
                key={card.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode(card.id as 'casual' | 'deep' | 'support')}
                className={`text-left rounded-2xl border-2 px-5 py-4 transition-all ${mode === card.id
                    ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10'
                    : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)]'
                  }`}
              >
                <div className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{card.title}</div>
                <div className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{card.desc}</div>
                {mode === card.id && (
                  <div className="mt-3 text-xs font-medium" style={{ color: 'var(--color-accent-primary)' }}>✓ Selected</div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startMatch}
          disabled={loading || !mood}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${mood
              ? 'btn-primary cursor-pointer'
              : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] cursor-not-allowed'
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                ⏳
              </motion.span>
              Finding your match...
            </span>
          ) : mood ? (
            '🚀 Start Match'
          ) : (
            'Select your mood to continue'
          )}
        </motion.button>

        {/* Tip */}
        <p className="mt-4 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          💡 Tip: Higher karma = priority matching + trusted badge
        </p>
      </motion.div>
    </div>
  );
}
