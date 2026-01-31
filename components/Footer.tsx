import Link from 'next/link';
import { Button } from './ui/button';

export default function Footer() {
    return (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-sm" />
                        <span className="font-semibold text-lg bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">InkHaven</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</Link>
                        <Link href="/faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQ</Link>
                        <Link href="/legal/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy</Link>
                        <Link href="/legal/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms</Link>
                        <Link href="/legal/cookies" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Cookies</Link>
                        <Link href="/legal" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Legal Hub</Link>
                    </div>

                    <div className="text-sm text-slate-500 flex items-center gap-4">
                        <span>© 2026 InkHaven</span>
                        <Link href="https://github.com/inkhaven" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors text-lg">
                            <span className="sr-only">GitHub</span>
                            {/* Simple GitHub Icon SVG */}
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-1.55 1.02-2.39-.1-.25-.45-1.13.1-2.34 0 0 .85-.27 2.8.76a9.585 9.585 0 0 1 2.55-.34c.87 0 1.74.11 2.55.34 1.96-1.03 2.8-.76 2.8-.76.55 1.21.2 2.09.11 2.34.64.84 1.02 1.25 1.02 2.39 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"></path>
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
