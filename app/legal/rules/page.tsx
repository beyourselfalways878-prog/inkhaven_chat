import Link from 'next/link';
import { Metadata } from 'next';
import { Shield, Heart, UserX, AlertTriangle, EyeOff, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Community Guidelines | InkHaven',
    description: 'InkHaven Community Rules - How we keep our sanctuary safe and welcoming.',
};

export default function RulesPage() {
    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="prose prose-slate max-w-none">
                <div className="text-center mb-12">
                    <span className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-6">
                        <Shield className="w-8 h-8" />
                    </span>
                    <h1 className="text-4xl font-bold mb-4">Community Guidelines</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        InkHaven is a sanctuary for authentic connection. To keep it safe, we ask everyone to follow these core principles.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Heart className="w-32 h-32" />
                        </div>
                        <h3 className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white mb-4">
                            <span className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                <Heart className="w-5 h-5" />
                            </span>
                            Be Kind & Respectful
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Treat every interaction with empathy. Behind every anonymous ID is a real human being. Disagreements are fine, but cruelty, harassment, and bullying are strictly prohibited.
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-slate-500">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5">✓</span> Respect boundaries
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5">✓</span> Be inclusive
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <EyeOff className="w-32 h-32" />
                        </div>
                        <h3 className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white mb-4">
                            <span className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                <EyeOff className="w-5 h-5" />
                            </span>
                            Protect Anonymity
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Anonymity is our shield. Do not ask for or share real names, social media handles, phone numbers, or addresses. &quot;Doxxing&quot; (sharing others&apos; private info) results in an immediate ban.
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-slate-500">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500 mt-0.5">✓</span> Keep it on InkHaven
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">✗</span> No &quot;Add me on Insta&quot;
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <AlertTriangle className="w-32 h-32" />
                        </div>
                        <h3 className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white mb-4">
                            <span className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="w-5 h-5" />
                            </span>
                            Zero Tolerance
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            We have absolutely no tolerance for:
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-slate-500">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Hate speech or discrimination
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Sexual content involving minors
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Threats of violence or self-harm
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Spam or solicitation
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <UserX className="w-32 h-32" />
                        </div>
                        <h3 className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white mb-4">
                            <span className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                                <UserX className="w-5 h-5" />
                            </span>
                            Enforcement
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Violating these rules will lead to action. We use AI moderation and user reports to enforce safety.
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                                <span className="block font-bold text-slate-900 dark:text-white">Strike 1</span>
                                <span className="text-xs text-slate-500">Warning</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                                <span className="block font-bold text-rose-600">Strike 3</span>
                                <span className="text-xs text-slate-500">Ban</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center">
                    <MessageCircle className="w-10 h-10 mx-auto text-indigo-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">See something unsafe?</h3>
                    <p className="text-slate-500 mb-6">
                        Use the report button in chat or contact our trust & safety team.
                    </p>
                    <Link href="mailto:safety@inkhaven.in" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                        Report an Incident
                    </Link>
                </div>
            </div>
        </div>
    );
}
