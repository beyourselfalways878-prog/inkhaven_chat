"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { useSessionStore } from '../stores/useSessionStore';
import { Avatar } from './ui/avatar';
import { ThemeToggle } from './ThemeToggle';
import BackgroundThemeSelector from './Backgrounds/BackgroundThemeSelector';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/toast';

export default function Header() {
  const session = useSessionStore((s) => s.session);
  const isLoggedIn = !!session.userId;

  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!session.userId) return;

    const channel = supabase.channel(`user_${session.userId}`);

    channel.on('broadcast', { event: 'invite' }, ({ payload }) => {
      const { roomId, inviterName } = payload;

      // The custom toast in this app currently only supports simple strings.
      // We will use a native confirm dialog for the invite action to ensure they can click it.
      if (window.confirm(`Private Room Invite! ${inviterName} invited you to chat. Do you want to join?`)) {
        router.push(`/chat/${roomId}`);
      } else {
        toast.info(`You declined the invite from ${inviterName}.`);
      }
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session.userId, router, toast]);

  return (
    <header className="w-full border-b border-slate-200 dark:border-white/5 backdrop-blur-xl bg-white/80 dark:bg-white/[0.02]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="group">
          <Logo className="h-10 w-10 text-indigo-500 group-hover:scale-105 transition-transform duration-300" showText />
        </Link>

        <nav className="hidden md:flex gap-5 items-center text-sm text-slate-500 dark:text-slate-400">
          <Link href="/quick-match" className="hover:text-slate-900 dark:hover:text-white/80 transition-colors">Quick Match</Link>
          <Link href="/friends" className="hover:text-slate-900 dark:hover:text-white/80 transition-colors">Friends</Link>
          <Link href="/settings" className="hover:text-slate-900 dark:hover:text-white/80 transition-colors">Settings</Link>
          <Link href="/about" className="hover:text-slate-900 dark:hover:text-white/80 transition-colors">About</Link>
        </nav>

        <div className="flex items-center gap-3">
          <BackgroundThemeSelector />
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <Link href="/chat" className="rounded-full border border-slate-200 dark:border-white/10 px-4 py-2 text-sm text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/20 transition-colors">
                Enter chat
              </Link>
              <Link href="/profile">
                <Avatar
                  userId={session.userId ?? undefined}
                  displayName={session.displayName || undefined}
                  auraSeed={session.auraSeed ?? undefined}
                  reputation={session.reputation ?? undefined}
                  size="sm"
                  showStatus
                  status="online"
                />
              </Link>
            </>
          ) : (
            <Link href="/onboarding" className="btn-primary text-sm">
              Create profile
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
