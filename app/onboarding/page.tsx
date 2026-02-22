"use client";
import { useRouter } from 'next/navigation';
import InterestSelector from '../../components/Profile/InterestSelector';
import { useSessionStore } from '../../stores/useSessionStore';
import { supabase } from '../../lib/supabase';
import { Fingerprint, MessageCircle, Sparkles } from 'lucide-react';
import AuraSphere from '../../components/Profile/AuraSphere';

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
    } catch (err) {
      console.error('Onboarding auth failed:', err);
      // Show error but still allow proceeding with limited functionality
      const uid = `guest_${Math.random().toString(36).slice(2, 9)}`;
      const ink = `ink_${Math.random().toString(36).slice(2, 5)}`;
      setSession({ userId: uid, inkId: ink, displayName: data.displayName ?? null, interests: data.chosen ?? null, comfortLevel: data.comfortLevel ?? 'balanced' });
      // Alert the user that some features may not work
      alert('Could not create a secure session. Some features may be limited. Please refresh and try again.');
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
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">Create your anonymous profile</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-white/50">
            Choose a name and interests. We use this only to improve match quality — never for tracking.
          </p>

          <div className="mt-6 space-y-3">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] px-4 py-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-semibold shrink-0">
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass p-6">
          <div className="card p-6 border-slate-200 dark:border-white/5 bg-white dark:bg-obsidian-900/50 relative overflow-hidden">
            {/* Background ambient glow matching the potential aura */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Your profile</h3>
              <span className="text-xs text-indigo-400 font-medium tracking-wide">InkHaven Identity</span>
            </div>

            <div className="mt-8 mb-6 flex flex-col items-center justify-center relative z-10">
              {/* Display a preview Aura. In a real app, this would dynamically update based on the typed name. For now, a placeholder preview. */}
              <AuraSphere inkId="preview_123" size="lg" isPulsing={true} comfortLevel="bold" />
              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-white/90 font-mono tracking-wider">PREVIEW AURA</p>
                <p className="text-xs text-slate-400 dark:text-white/40 mt-1">This will adapt to your unique energy.</p>
              </div>
            </div>

            <div className="mt-6 relative z-10">
              <InterestSelector onSubmit={handleSubmit} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
