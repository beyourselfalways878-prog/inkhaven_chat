"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPreferences() {
  const router = useRouter();
  const [preferences, setPreferences] = useState({
    readReceipts: true,
    typingPrivacy: true,
    safetyFilter: true,
    soundEffects: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem('inkhaven:preferences');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences((prev) => ({ ...prev, ...parsed }));
      } catch (_err) {
        // ignore
      }
    }
  }, []);

  const update = (key: keyof typeof preferences) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('inkhaven:preferences', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <section className="card p-6">
          <div className="pill">Step 2 of 3</div>
          <h2 className="mt-4 text-3xl font-semibold">Set your preferences</h2>
          <p className="mt-3 text-sm text-slate-600">Fine-tune privacy and experience controls.</p>
        </section>

        <section className="glass p-6">
          <div className="card p-6 space-y-4">
            {[
              { key: 'readReceipts', title: 'Read receipts', desc: 'Let partners see when you read.' },
              { key: 'typingPrivacy', title: 'Typing privacy', desc: 'Delay typing indicators for calm pacing.' },
              { key: 'safetyFilter', title: 'Safety filter', desc: 'Auto-block unsafe content in real time.' },
              { key: 'soundEffects', title: 'Sound effects', desc: 'Subtle audio cues during chat.' },
            ].map((item) => (
              <button key={item.key} className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-left" onClick={() => update(item.key as any)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                  <span className={`h-6 w-10 rounded-full ${preferences[item.key as keyof typeof preferences] ? 'bg-emerald-500' : 'bg-slate-200'} relative`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${preferences[item.key as keyof typeof preferences] ? 'right-0.5' : 'left-0.5'}`} />
                  </span>
                </div>
              </button>
            ))}

            <div className="flex justify-end">
              <button onClick={() => router.push('/onboarding/safety')} className="rounded-full bg-slate-900 px-5 py-2 text-white">
                Continue
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
