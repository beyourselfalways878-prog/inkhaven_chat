import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cookie Policy | InkHaven',
    description: 'InkHaven Cookie Policy - How we use cookies and similar technologies.',
};

export default function CookiePolicyPage() {
    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="prose prose-slate max-w-none">
                <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
                <p className="text-slate-500 mb-8">Last updated: January 27, 2026</p>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-6 mb-8">
                    <p className="text-lg font-medium text-slate-800 dark:text-slate-200 m-0">
                        This Cookie Policy explains how InkHaven uses cookies and similar technologies to recognize you when you visit our platform.
                    </p>
                </div>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">1. What Are Cookies?</h2>
                    <p>
                        Cookies are small data files placed on your device when you visit a website. They are widely used to make websites work efficiently and provide information to website owners.
                    </p>
                    <p>
                        Cookies set by the website owner (InkHaven) are called &quot;first-party cookies.&quot; Cookies set by parties other than the website owner are called &quot;third-party cookies.&quot;
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">2. Types of Cookies We Use</h2>

                    <h3 className="text-xl font-medium mt-6 mb-3">2.1 Essential Cookies</h3>
                    <p>Required for the platform to function properly. Cannot be disabled.</p>
                    <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 mt-4">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800">
                                <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Cookie</th>
                                <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Purpose</th>
                                <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 font-mono text-sm">sb-*-auth-token</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Authentication session</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Session</td>
                            </tr>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 font-mono text-sm">theme</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Dark/Light mode preference</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">1 year</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 font-mono text-sm">cookie_consent</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Cookie consent preferences</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">1 year</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 className="text-xl font-medium mt-6 mb-3">2.2 Functional Cookies</h3>
                    <p>Enhance functionality and personalization.</p>
                    <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 mt-4">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800">
                                <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Cookie</th>
                                <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Purpose</th>
                                <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 font-mono text-sm">user_preferences</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">UI preferences</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">1 year</td>
                            </tr>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 font-mono text-sm">notification_settings</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Notification preferences</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">1 year</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 className="text-xl font-medium mt-6 mb-3">2.3 Analytics Cookies</h3>
                    <p>Help us understand how visitors interact with our platform. Optional.</p>
                    <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 mt-4">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800">
                                <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Cookie</th>
                                <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Purpose</th>
                                <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2 font-mono text-sm">_ga</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Google Analytics (if enabled)</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">2 years</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">3. Local Storage</h2>
                    <p>In addition to cookies, we use browser local storage for:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Theme preference:</strong> Light/dark mode setting</li>
                        <li><strong>Session data:</strong> Temporary authentication state</li>
                        <li><strong>Draft messages:</strong> Unsent message recovery</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">4. Managing Cookies</h2>
                    <p>You can control cookies through:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Our Cookie Banner:</strong> Adjust preferences when you first visit</li>
                        <li><strong>Browser Settings:</strong> Block or delete cookies in your browser</li>
                        <li><strong>Privacy Settings:</strong> Access cookie preferences in your account settings</li>
                    </ul>

                    <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 my-4">
                        <p className="m-0">
                            <strong>Note:</strong> Disabling essential cookies may break core functionality of InkHaven.
                        </p>
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">5. Third-Party Cookies</h2>
                    <p>We may use cookies from these third parties:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Supabase:</strong> Authentication and session management</li>
                        <li><strong>PayPal:</strong> Payment processing (on checkout pages)</li>
                        <li><strong>Sentry:</strong> Error tracking and performance monitoring</li>
                        <li><strong>hCaptcha:</strong> Bot protection during registration</li>
                    </ul>
                    <p className="mt-4">
                        Each third party has their own privacy policy governing their use of cookies.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">6. Updates to This Policy</h2>
                    <p>
                        We may update this Cookie Policy periodically. Check this page for the latest information about our cookie practices.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Us</h2>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6">
                        <p className="m-0">
                            For questions about our use of cookies:<br />
                            <strong>Email:</strong> <a href="mailto:privacy@inkhaven.in" className="text-indigo-600 hover:underline">privacy@inkhaven.in</a>
                        </p>
                    </div>
                </section>

                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <Link href="/legal/privacy" className="text-indigo-600 hover:underline mr-6">Privacy Policy</Link>
                    <Link href="/legal/terms" className="text-indigo-600 hover:underline mr-6">Terms of Service</Link>
                    <Link href="/legal/gdpr" className="text-indigo-600 hover:underline">GDPR Statement</Link>
                </div>
            </div>
        </div>
    );
}
