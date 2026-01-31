"use client";
import { useRouter } from 'next/navigation';
import InterestSelector from '../../components/Profile/InterestSelector';
import { useSessionStore } from '../../stores/useSessionStore';
import { supabase } from '../../lib/supabase';

export default function Onboarding() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);

  async function handleSubmit(data: any) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      let user = sessionData?.session?.user ?? null;
      let accessToken = sessionData?.session?.access_token ?? null;

      if (!user) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        user = data.user ?? null;
        accessToken = data.session?.access_token ?? null;
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
        token: accessToken,
        displayName: data.displayName ?? null,
        interests: data.chosen ?? null,
        comfortLevel: data.comfortLevel ?? 'balanced'
      });
      router.push('/onboarding/preferences');
    } catch (_err) {
      const uid = `guest_${Math.random().toString(36).slice(2, 9)}`;
      const ink = `ink_${Math.random().toString(36).slice(2, 5)}`;
      setSession({ userId: uid, inkId: ink, token: null, displayName: data.displayName ?? null, interests: data.chosen ?? null, comfortLevel: data.comfortLevel ?? 'balanced' });
      router.push('/onboarding/preferences');
    }
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <section className="card p-6">
          <div className="pill">Step 1 of 3</div>
          <h2 className="mt-4 text-3xl font-semibold">Create your anonymous profile</h2>
          <p className="mt-3 text-sm text-slate-600">
            Choose a name and interests. We use this only to improve match quality — never for tracking.
          </p>

          <div className="mt-6 space-y-4">
            {[
              { title: 'Identity', desc: 'Choose a calm alias and comfort level.' },
              { title: 'Interests', desc: 'Select a few topics you enjoy.' },
              { title: 'Match style', desc: 'We’ll align with your intent.' },
            ].map((item, idx) => (
              <div key={item.title} className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3">
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                  {idx + 1}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass p-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your profile</h3>
              <span className="text-xs text-emerald-600">Private by design</span>
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
