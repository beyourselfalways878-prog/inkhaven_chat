"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [preferences, setPreferences] = useState({
    readReceipts: true,
    typingPrivacy: true,
    safetyFilter: true,
    soundEffects: false,
  });
  const [saved, setSaved] = useState(false);

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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return next;
    });
  };

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <section className="card p-6">
          <h2 className="text-3xl font-semibold">Settings</h2>
          <p className="mt-2 text-sm text-slate-600">
            Customize your InkHaven experience.
          </p>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <Link href="/profile" className="block rounded-xl border border-slate-200 bg-white/80 px-4 py-3 hover:bg-slate-50 transition">
              <div className="font-semibold text-slate-900">Profile</div>
              <div className="text-xs">Manage your identity and interests</div>
            </Link>
            <Link href="/onboarding/preferences" className="block rounded-xl border border-slate-200 bg-white/80 px-4 py-3 hover:bg-slate-50 transition">
              <div className="font-semibold text-slate-900">Preferences</div>
              <div className="text-xs">Privacy and experience controls</div>
            </Link>
          </div>
        </section>

        <section className="glass p-6">
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Privacy & Experience</h3>
              {saved && (
                <span className="text-xs text-emerald-600 font-medium">Saved</span>
              )}
            </div>

            {[
              { key: 'readReceipts', title: 'Read receipts', desc: 'Let partners see when you read.' },
              { key: 'typingPrivacy', title: 'Typing privacy', desc: 'Delay typing indicators for calm pacing.' },
              { key: 'safetyFilter', title: 'Safety filter', desc: 'Auto-block unsafe content in real time.' },
              { key: 'soundEffects', title: 'Sound effects', desc: 'Subtle audio cues during chat.' },
            ].map((item) => (
              <button
                key={item.key}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-left hover:bg-slate-50 transition"
                onClick={() => update(item.key as any)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                  <span className={`h-6 w-10 rounded-full ${preferences[item.key as keyof typeof preferences] ? 'bg-emerald-500' : 'bg-slate-200'} relative transition`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${preferences[item.key as keyof typeof preferences] ? 'right-0.5' : 'left-0.5'}`} />
                  </span>
                </div>
              </button>
            ))}

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">About InkHaven</h4>
              <div className="space-y-2 text-xs text-slate-600">
                <p>Version 1.0.0</p>
                <p>Built with privacy and safety in mind.</p>
                <div className="mt-4 flex gap-3">
                  <Link href="/faq" className="text-indigo-600 hover:text-indigo-700">
                    FAQ
                  </Link>
                  <Link href="/about" className="text-indigo-600 hover:text-indigo-700">
                    About
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
