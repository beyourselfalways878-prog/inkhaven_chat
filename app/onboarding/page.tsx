"use client";
import { useRouter } from 'next/navigation';
import InterestSelector from '../../components/Profile/InterestSelector';
import { useSessionStore } from '../../stores/useSessionStore';
import { supabase } from '../../lib/supabase';
import { Fingerprint, MessageCircle, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);

  async function handleSubmit(data: any) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      let user = sessionData?.session?.user ?? null;

      if (!user) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        user = data.user ?? null;
      }

      const userId = user?.id ?? `guest_${Math.random().toString(36).slice(2, 9)}`;
      const inkId = `ink_${userId.replace(/-/g, '').slice(0, 8)}`;

      const profileRes = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          displayName: data.displayName,
          interests: data.chosen,
          comfortLevel: data.comfortLevel
        })
      });
      const profileJson = await profileRes.json();

      setSession({
        userId,
        inkId: profileJson?.profile?.ink_id ?? inkId,
        displayName: data.displayName ?? null,
        interests: data.chosen ?? null,
        comfortLevel: data.comfortLevel ?? 'balanced'
      });
      router.push('/onboarding/preferences');
    } catch (_err) {
      const uid = `guest_${Math.random().toString(36).slice(2, 9)}`;
      const ink = `ink_${Math.random().toString(36).slice(2, 5)}`;
      setSession({ userId: uid, inkId: ink, displayName: data.displayName ?? null, interests: data.chosen ?? null, comfortLevel: data.comfortLevel ?? 'balanced' });
      router.push('/onboarding/preferences');
    }
  }

  const steps = [
    { title: 'Identity', desc: 'Choose a calm alias and comfort level.', icon: Fingerprint },
    { title: 'Interests', desc: 'Select a few topics you enjoy.', icon: MessageCircle },
    { title: 'Match style', desc: 'We\u2019ll align with your intent.', icon: Sparkles },
  ];

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <section className="card p-6">
          <div className="pill">Step 1 of 3</div>
          <h2 className="mt-4 text-3xl font-semibold text-white">Create your anonymous profile</h2>
          <p className="mt-3 text-sm text-white/50">
            Choose a name and interests. We use this only to improve match quality — never for tracking.
          </p>

          <div className="mt-6 space-y-3">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-semibold shrink-0">
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <div className="text-xs text-white/40">{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass p-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Your profile</h3>
              <span className="text-xs text-emerald-400">Private by design</span>
            </div>
            <div className="mt-6">
              <InterestSelector onSubmit={handleSubmit} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
