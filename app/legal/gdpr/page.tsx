import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'GDPR Compliance | InkHaven',
    description: 'InkHaven GDPR Statement - Our commitment to EU data protection regulations.',
};

export default function GDPRPage() {
    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="prose prose-slate max-w-none">
                <h1 className="text-4xl font-bold mb-2">GDPR Compliance Statement</h1>
                <p className="text-slate-500 mb-8">Last updated: January 27, 2026</p>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 mb-8">
                    <p className="text-lg font-medium text-slate-800 dark:text-slate-200 m-0">
                        InkHaven is fully committed to compliance with the General Data Protection Regulation (GDPR) and respects the privacy rights of all users, regardless of location.
                    </p>
                </div>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">1. Our Commitment</h2>
                    <p>
                        InkHaven processes personal data in accordance with the GDPR, the UK Data Protection Act 2018, and other applicable data protection laws. We are committed to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Processing data lawfully, fairly, and transparently</li>
                        <li>Collecting data only for specified, explicit, and legitimate purposes</li>
                        <li>Minimizing data collection to what is necessary</li>
                        <li>Keeping data accurate and up-to-date</li>
                        <li>Retaining data only as long as necessary</li>
                        <li>Ensuring appropriate security of personal data</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">2. Data Controller Information</h2>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6">
                        <p className="m-0">
                            <strong>Data Controller:</strong> InkHaven<br />
                            <strong>Email:</strong> <a href="mailto:dpo@inkhaven.in" className="text-indigo-600 hover:underline">dpo@inkhaven.in</a><br />
                            <strong>Privacy Email:</strong> <a href="mailto:namamicreations@zenithcryptoai.in" className="text-indigo-600 hover:underline">namamicreations@zenithcryptoai.in</a><br />
                            <strong>Website:</strong> <Link href="https://www.inkhaven.in" className="text-indigo-600 hover:underline">www.inkhaven.in</Link>
                        </p>
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">3. Legal Basis for Processing</h2>
                    <p>We process personal data under the following legal bases:</p>

                    <div className="grid gap-4 mt-6">
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-5">
                            <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 m-0 mb-2">Contract Performance (Article 6(1)(b))</h4>
                            <p className="m-0 text-sm">Processing necessary to provide our chat services, manage your profile, and enable matching functionality.</p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-5">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-200 m-0 mb-2">Legitimate Interest (Article 6(1)(f))</h4>
                            <p className="m-0 text-sm">Processing for platform security, abuse prevention, service improvement, and analytics.</p>
                        </div>

                        <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-5">
                            <h4 className="font-semibold text-violet-800 dark:text-violet-200 m-0 mb-2">Consent (Article 6(1)(a))</h4>
                            <p className="m-0 text-sm">Optional processing such as marketing communications and enhanced analytics.</p>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-5">
                            <h4 className="font-semibold text-amber-800 dark:text-amber-200 m-0 mb-2">Legal Obligation (Article 6(1)(c))</h4>
                            <p className="m-0 text-sm">Processing required to comply with legal requirements and lawful requests.</p>
                        </div>
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">4. Your Rights Under GDPR</h2>
                    <p>As a data subject, you have the following rights:</p>

                    <div className="grid gap-4 mt-6 md:grid-cols-2">
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                            <h4 className="font-semibold m-0 mb-2">📋 Right of Access</h4>
                            <p className="m-0 text-sm">Request a copy of all personal data we hold about you.</p>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                            <h4 className="font-semibold m-0 mb-2">✏️ Right to Rectification</h4>
                            <p className="m-0 text-sm">Correct any inaccurate or incomplete personal data.</p>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                            <h4 className="font-semibold m-0 mb-2">🗑️ Right to Erasure</h4>
                            <p className="m-0 text-sm">Request deletion of your personal data (&quot;right to be forgotten&quot;).</p>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                            <h4 className="font-semibold m-0 mb-2">⏸️ Right to Restrict</h4>
                            <p className="m-0 text-sm">Limit how we process your personal data.</p>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                            <h4 className="font-semibold m-0 mb-2">📦 Right to Portability</h4>
                            <p className="m-0 text-sm">Receive your data in a structured, machine-readable format.</p>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                            <h4 className="font-semibold m-0 mb-2">🚫 Right to Object</h4>
                            <p className="m-0 text-sm">Object to processing based on legitimate interests.</p>
                        </div>
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">5. How to Exercise Your Rights</h2>
                    <p>To exercise any of your GDPR rights:</p>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>Email us at <a href="mailto:namamicreations@zenithcryptoai.in" className="text-indigo-600 hover:underline">namamicreations@zenithcryptoai.in</a></li>
                        <li>Include your Ink ID or other identifying information</li>
                        <li>Specify which right(s) you wish to exercise</li>
                        <li>We will respond within <strong>30 days</strong></li>
                    </ol>

                    <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-4 my-4">
                        <p className="m-0">
                            <strong>Identity Verification:</strong> We may request additional information to verify your identity before processing your request.
                        </p>
                    </div>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Retention</h2>
                    <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 mt-4">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800">
                                <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Data Type</th>
                                <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Retention Period</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Chat Messages</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">24 hours (ephemeral default)</td>
                            </tr>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Profile Data</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Until deletion or 12 months inactivity</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Moderation Logs</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">90 days</td>
                            </tr>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Support Tickets</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">2 years</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Payment Records</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">7 years (legal requirement)</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">7. International Data Transfers</h2>
                    <p>
                        When we transfer personal data outside the EEA, we ensure adequate protection through:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Standard Contractual Clauses (SCCs)</strong> approved by the European Commission</li>
                        <li><strong>Data Processing Agreements</strong> with all processors</li>
                        <li>Selection of providers with <strong>adequate privacy certifications</strong></li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">8. Data Processing Agreements</h2>
                    <p>We have Data Processing Agreements in place with:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Supabase Inc.</strong> — Database and authentication</li>
                        <li><strong>PayPal</strong> — Payment processing</li>
                        <li><strong>Sentry</strong> — Error monitoring</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">9. Data Breach Procedures</h2>
                    <p>In the event of a personal data breach:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>We will notify the relevant supervisory authority within <strong>72 hours</strong></li>
                        <li>We will notify affected users without undue delay if the breach poses a high risk</li>
                        <li>We will document all breaches and remediation actions</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">10. Supervisory Authority</h2>
                    <p>
                        You have the right to lodge a complaint with a data protection supervisory authority. For EU residents, this is typically the authority in your country of residence.
                    </p>
                    <p>
                        <strong>UK:</strong> Information Commissioner&apos;s Office (ICO) — <a href="https://ico.org.uk" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a>
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Our DPO</h2>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6">
                        <p className="m-0">
                            <strong>Data Protection Officer</strong><br />
                            InkHaven<br />
                            Email: <a href="mailto:dpo@inkhaven.in" className="text-indigo-600 hover:underline">dpo@inkhaven.in</a>
                        </p>
                    </div>
                </section>

                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <Link href="/legal/privacy" className="text-indigo-600 hover:underline mr-6">Privacy Policy</Link>
                    <Link href="/legal/terms" className="text-indigo-600 hover:underline mr-6">Terms of Service</Link>
                    <Link href="/legal/cookies" className="text-indigo-600 hover:underline">Cookie Policy</Link>
                </div>
            </div>
        </div>
    );
}
