"use client";
import Link from 'next/link';
import ThemeToggle from './ui/ThemeToggle';

export default function Header() {
  return (
    <header className="w-full border-b backdrop-blur" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-glass)' }}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400" />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>InkHaven</span>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Anonymous sanctuary</span>
          </div>
        </Link>

        <nav className="hidden md:flex gap-5 items-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <Link href="/onboarding" className="hover:opacity-80 transition-opacity">Onboarding</Link>
          <Link href="/quick-match" className="hover:opacity-80 transition-opacity">Quick Match</Link>
          <Link href="/settings" className="hover:opacity-80 transition-opacity">Settings</Link>
          <Link href="/moderation" className="hover:opacity-80 transition-opacity">Moderation</Link>
          <Link href="/about" className="hover:opacity-80 transition-opacity">About</Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/chat" className="rounded-full border px-4 py-2 text-sm transition-colors" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
            Enter chat
          </Link>
          <Link href="/onboarding" className="btn-primary text-sm">
            Create profile
          </Link>
        </div>
      </div>
    </header>
  );
}

