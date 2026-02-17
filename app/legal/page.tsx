import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Legal | InkHaven',
    description: 'InkHaven Legal Hub - Privacy Policy, Terms of Service, Cookie Policy, and GDPR Compliance.',
};

export default function LegalIndexPage() {
    const legalPages = [
        {
            title: 'Privacy Policy',
            description: 'How we collect, use, and protect your personal information. Our commitment to your privacy.',
            href: '/legal/privacy',
            icon: '🔒',
            gradient: 'from-indigo-500 to-emerald-500'
        },
        {
            title: 'Terms of Service',
            description: 'Rules and guidelines for using InkHaven. Your rights and responsibilities as a user.',
            href: '/legal/terms',
            icon: '📜',
            gradient: 'from-violet-500 to-pink-500'
        },
        {
            title: 'Community Guidelines',
            description: 'Our core principles for a safe and respectful community. Read before chatting.',
            href: '/legal/rules',
            icon: '🛡️',
            gradient: 'from-emerald-500 to-teal-500'
        },
        {
            title: 'Cookie Policy',
            description: 'Information about cookies and similar technologies we use on our platform.',
            href: '/legal/cookies',
            icon: '🍪',
            gradient: 'from-amber-500 to-orange-500'
        },
        {
            title: 'GDPR Compliance',
            description: 'Our commitment to EU data protection regulations and your rights as a data subject.',
            href: '/legal/gdpr',
            icon: '🇪🇺',
            gradient: 'from-blue-500 to-indigo-500'
        }
    ];

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Legal & Compliance</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                    Transparency and trust are at the core of InkHaven. Explore our legal documents below.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {legalPages.map((page) => (
                    <Link
                        key={page.href}
                        href={page.href}
                        className="group block rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 transition-all hover:shadow-lg hover:-translate-y-1"
                    >
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${page.gradient} text-2xl mb-4`}>
                            {page.icon}
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {page.title}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            {page.description}
                        </p>
                        <div className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                            Read More →
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-16 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-8">
                <h2 className="text-2xl font-semibold mb-4">Have Questions?</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                    If you have any questions about our legal documents or policies, feel free to reach out to our team.
                </p>
                <div className="flex flex-wrap gap-4">
                    <a
                        href="mailto:namamicreations@zenithcryptoai.in"
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                    >
                        ✉️ namamicreations@zenithcryptoai.in
                    </a>
                    <a
                        href="mailto:namamicreations@zenithcryptoai.in"
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        🔐 namamicreations@zenithcryptoai.in
                    </a>
                </div>
            </div>

            <div className="mt-12 text-center text-sm text-slate-500">
                <p>Last updated: January 27, 2026</p>
                <p className="mt-2">© 2026 InkHaven. All rights reserved.</p>
            </div>
        </div>
    );
}
