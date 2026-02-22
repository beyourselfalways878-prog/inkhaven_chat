"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '../../components/ui/toast';
import { Settings, User, SlidersHorizontal, Shield, Volume2, Eye, Keyboard, Info, LogIn, LogOut } from 'lucide-react';
import { useSessionStore } from '../../stores/useSessionStore';
import { supabase } from '../../lib/supabase';
import AuthModal from '../../components/Profile/AuthModal';

export default function SettingsPage() {
  const toast = useToast();
  const [preferences, setPreferences] = useState({
    readReceipts: true,
    typingPrivacy: true,
    safetyFilter: true,
    soundEffects: false,
  });

  const [showAuth, setShowAuth] = useState(false);
  const clearSession = useSessionStore((s) => s.clearSession);
  const [isRealUser, setIsRealUser] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      // If it's not anonymous, they hold a real email account
      setIsRealUser(!!data.session?.user?.email);
    });
  }, []);

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
      toast.success(`${key === 'readReceipts' ? 'Read receipts' : key === 'typingPrivacy' ? 'Typing privacy' : key === 'safetyFilter' ? 'Safety filter' : 'Sound effects'} ${next[key] ? 'enabled' : 'disabled'}`);
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
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Settings</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Customize your InkHaven experience.
          </p>

          <div className="mt-6 space-y-3">
            <Link href="/profile" className="block rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] px-4 py-3 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition group">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">Profile</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">Manage your identity and interests</div>
                </div>
              </div>
            </Link>
            <Link href="/onboarding/preferences" className="block rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] px-4 py-3 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition group">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">Preferences</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">Privacy and experience controls</div>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5 space-y-3">
            {isRealUser ? (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  clearSession();
                  window.location.href = '/';
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 hover:bg-red-500/20 transition group"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
            ) : (
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-center">
                <p className="text-xs text-indigo-200/60 mb-3">You are currently using a temporary anonymous session. Register to save your settings and chats.</p>
                <button
                  onClick={() => setShowAuth(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-white hover:bg-indigo-500 transition group shadow-lg shadow-indigo-500/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="text-sm font-semibold">Register / Sign In</span>
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="glass p-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Privacy & Experience</h3>

            {settingsMeta.map((item) => {
              const Icon = item.icon;
              const isOn = preferences[item.key];
              return (
                <button
                  key={item.key}
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
                  onClick={() => update(item.key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isOn ? 'text-indigo-400' : 'text-slate-300 dark:text-white/20'} transition`} />
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">{item.desc}</div>
                      </div>
                    </div>
                    <span className={`h-6 w-10 rounded-full ${isOn ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'} relative transition`}>
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${isOn ? 'right-0.5' : 'left-0.5'}`} />
                    </span>
                  </div>
                </button>
              );
            })}

            <div className="pt-4 pb-2">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-white/80 uppercase tracking-wider text-xs">Visual Experience</h3>
            </div>

            <button
              className="w-full rounded-2xl border border-white/5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-4 py-3 text-left hover:from-indigo-500/20 hover:to-purple-500/20 transition group"
              onClick={() => toast.info('Aura intensity is now adaptive to your typing speed!')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 animate-pulse flex items-center justify-center text-xs">✨</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Resonant Aura</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">Dynamic background reacts to your vibe</div>
                  </div>
                </div>
                <div className="text-xs text-indigo-300 font-medium bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">Active</div>
              </div>
            </button>

            <div className="pt-6 pb-2">
              <h3 className="text-sm font-semibold text-red-400/80 uppercase tracking-wider text-xs">Danger Zone</h3>
            </div>

            <button
              disabled={isDeleting}
              className="w-full rounded-2xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-left hover:bg-red-500/10 transition group disabled:opacity-50"
              onClick={async () => {
                if (window.confirm("Are you absolutely sure you want to permanently delete your account and all associated data? This cannot be undone.")) {
                  setIsDeleting(true);
                  try {
                    const { data: sessionData } = await supabase.auth.getSession();
                    const token = sessionData?.session?.access_token;
                    const res = await fetch('/api/auth/delete-account', {
                      method: 'POST',
                      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                    });
                    if (!res.ok) throw new Error("Failed to delete account");

                    toast.success("Account deleted successfully.");
                    await supabase.auth.signOut();
                    clearSession();
                    window.location.href = '/';
                  } catch (e) {
                    toast.error("Failed to delete account. Please try again.");
                    setIsDeleting(false);
                  }
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                    {isDeleting ? <span className="animate-spin text-xs">⌛</span> : '⚠️'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-red-400 group-hover:text-red-300 transition">Delete Account</div>
                    <div className="text-xs text-red-400/40">Permanently erase all data</div>
                  </div>
                </div>
              </div>
            </button>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-slate-400 dark:text-white/30" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">About InkHaven</h4>
              </div>
              <div className="space-y-2 text-xs text-slate-400 dark:text-slate-500">
                <p>Version 1.0.0</p>
                <p>Built with privacy and safety in mind.</p>
                <div className="mt-4 flex gap-3">
                  <Link href="/faq" className="text-indigo-400 hover:text-indigo-300 transition">FAQ</Link>
                  <Link href="/about" className="text-indigo-400 hover:text-indigo-300 transition">About</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
