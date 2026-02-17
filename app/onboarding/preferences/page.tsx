"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../components/ui/toast';
import { Eye, Keyboard, Shield, Volume2 } from 'lucide-react';

export default function OnboardingPreferences() {
  const router = useRouter();
  const toast = useToast();
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

  const settingsMeta = [
    { key: 'readReceipts', title: 'Read receipts', desc: 'Let partners see when you read.', icon: Eye },
    { key: 'typingPrivacy', title: 'Typing privacy', desc: 'Delay typing indicators for calm pacing.', icon: Keyboard },
    { key: 'safetyFilter', title: 'Safety filter', desc: 'Auto-block unsafe content in real time.', icon: Shield },
    { key: 'soundEffects', title: 'Sound effects', desc: 'Subtle audio cues during chat.', icon: Volume2 },
  ] as const;

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <section className="card p-6">
          <div className="pill">Step 2 of 3</div>
          <h2 className="mt-4 text-3xl font-semibold text-white">Set your preferences</h2>
          <p className="mt-3 text-sm text-white/50">Fine-tune privacy and experience controls.</p>
        </section>

        <section className="glass p-6">
          <div className="card p-6 space-y-3">
            {settingsMeta.map((item) => {
              const Icon = item.icon;
              const isOn = preferences[item.key];
              return (
                <button
                  key={item.key}
                  className="w-full rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-left hover:bg-white/[0.06] transition"
                  onClick={() => update(item.key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isOn ? 'text-indigo-400' : 'text-white/20'} transition`} />
                      <div>
                        <div className="text-sm font-semibold text-white">{item.title}</div>
                        <div className="text-xs text-white/40">{item.desc}</div>
                      </div>
                    </div>
                    <span className={`h-6 w-10 rounded-full ${isOn ? 'bg-indigo-500' : 'bg-white/10'} relative transition`}>
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${isOn ? 'right-0.5' : 'left-0.5'}`} />
                    </span>
                  </div>
                </button>
              );
            })}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  toast.success('Preferences saved!');
                  router.push('/onboarding/safety');
                }}
                className="btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
