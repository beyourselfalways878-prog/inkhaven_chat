"use client";
import Link from 'next/link';
import { Logo } from './Logo';
import { useSessionStore } from '../stores/useSessionStore';
import { Avatar } from './ui/avatar';
import { ThemeToggle } from './ThemeToggle';
import BackgroundThemeSelector from './Backgrounds/BackgroundThemeSelector';

export default function Header() {
  const session = useSessionStore((s) => s.session);
  const isLoggedIn = !!session.userId;

  return (
    <header className="w-full border-b border-slate-200 dark:border-white/5 backdrop-blur-xl bg-white/80 dark:bg-white/[0.02]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="group">
          <Logo className="h-10 w-10 text-indigo-500 group-hover:scale-105 transition-transform duration-300" showText />
        </Link>

        <nav className="hidden md:flex gap-5 items-center text-sm text-slate-500 dark:text-slate-400">
          <Link href="/quick-match" className="hover:text-slate-900 dark:hover:text-white/80 transition-colors">Quick Match</Link>
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
