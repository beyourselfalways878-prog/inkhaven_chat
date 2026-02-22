"use client";
import { useRouter } from 'next/navigation';
import { ShieldCheck, Heart, Flag } from 'lucide-react';

export default function OnboardingSafety() {
  const router = useRouter();

  const rules = [
    { text: 'No harassment or hate speech.', icon: ShieldCheck },
    { text: 'Respect boundaries and comfort levels.', icon: Heart },
    { text: 'Use the report feature when something feels wrong.', icon: Flag },
  ];

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <section className="card p-6">
          <div className="pill">Step 3 of 3</div>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">Safety promise</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-white/50">We prioritize calm and respectful conversation.</p>

          <div className="mt-6 space-y-3">
            {rules.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] px-4 py-3">
                  <Icon className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-white/70">{item.text}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass p-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Ready to begin?</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-white/50">You can update preferences any time in Settings.</p>
            <div className="mt-6 flex justify-end">
              <button onClick={() => router.push('/quick-match')} className="btn-primary">
                Enter InkHaven
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
