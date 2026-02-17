import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | InkHaven',
    description: 'InkHaven Privacy Policy - How we protect your data and respect your privacy.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="prose prose-slate max-w-none">
                <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-slate-500 mb-8">Last updated: January 27, 2026</p>

                <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-950/30 dark:to-emerald-950/30 rounded-2xl p-6 mb-8">
                    <p className="text-lg font-medium text-slate-800 dark:text-slate-200 m-0">
                        At InkHaven, your privacy is our foundation. We&apos;re built from the ground up to protect your identity while enabling meaningful human connection.
                    </p>
                </div>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
                    <p>
                        InkHaven (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the InkHaven anonymous chat platform at <Link href="https://www.inkhaven.in" className="text-indigo-600 hover:underline">www.inkhaven.in</Link>. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
                    </p>
                    <p>
                        We are committed to protecting your privacy and ensuring full compliance with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable data protection laws.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">2. Data Controller</h2>
                    <p>
                        <strong>InkHaven</strong><br />
                        Email: <a href="mailto:namamicreations@zenithcryptoai.in" className="text-indigo-600 hover:underline">namamicreations@zenithcryptoai.in</a><br />
                        Support: <a href="mailto:namamicreations@zenithcryptoai.in" className="text-indigo-600 hover:underline">namamicreations@zenithcryptoai.in</a>
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">3. Information We Collect</h2>

                    <h3 className="text-xl font-medium mt-6 mb-3">3.1 Information You Provide</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Anonymous Profile Data:</strong> Ink ID (randomly generated identifier), display name (optional), interests, comfort level preferences</li>
                        <li><strong>Communication Data:</strong> Messages sent through our platform (processed in real-time, with configurable retention)</li>
                        <li><strong>Feedback and Reports:</strong> Any reports, feedback, or support requests you submit</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-6 mb-3">3.2 Automatically Collected Information</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
                        <li><strong>Usage Data:</strong> Session duration, features used, matching preferences</li>
                        <li><strong>Technical Data:</strong> IP address (anonymized), connection timestamps</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-6 mb-3">3.3 Information We Do NOT Collect</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Real names or legal identities</li>
                        <li>Email addresses (unless provided for support)</li>
                        <li>Phone numbers</li>
                        <li>Physical addresses</li>
                        <li>Social media profiles</li>
                        <li>Payment information (processed by PayPal directly)</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">4. How We Use Your Information</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Provide Services:</strong> Enable anonymous matching and real-time chat functionality</li>
                        <li><strong>Safety & Moderation:</strong> Protect users through AI-powered content moderation and abuse detection</li>
                        <li><strong>Improve Experience:</strong> Enhance matching algorithms and platform features</li>
                        <li><strong>Communications:</strong> Send important service updates (if you provide contact information)</li>
                        <li><strong>Legal Compliance:</strong> Fulfill legal obligations and respond to lawful requests</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">5. Legal Basis for Processing (GDPR)</h2>
                    <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 mt-4">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800">
                                <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Purpose</th>
                                <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-left">Legal Basis</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Providing our Service</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Contract performance</td>
                            </tr>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Safety & Security</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Legitimate interest</td>
                            </tr>
                            <tr>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Analytics & Improvement</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Legitimate interest / Consent</td>
                            </tr>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Legal Obligations</td>
                                <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">Legal requirement</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Retention</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Chat Messages:</strong> Deleted after session ends or within 24 hours (ephemeral by default)</li>
                        <li><strong>Profile Data:</strong> Retained until account deletion or 12 months of inactivity</li>
                        <li><strong>Moderation Logs:</strong> Retained for 90 days for safety purposes</li>
                        <li><strong>Support Tickets:</strong> Retained for 2 years</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">7. Your Rights (GDPR)</h2>
                    <p>As a data subject, you have the following rights:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
                        <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
                        <li><strong>Right to Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
                        <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                        <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
                        <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                        <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                    </ul>
                    <p className="mt-4">
                        To exercise these rights, contact us at <a href="mailto:namamicreations@zenithcryptoai.in" className="text-indigo-600 hover:underline">namamicreations@zenithcryptoai.in</a>. We will respond within 30 days.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">8. Data Sharing & Third Parties</h2>
                    <p>We may share your information with:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Service Providers:</strong> Supabase (database), PayPal (payments), Sentry (error tracking)</li>
                        <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                        <li><strong>Safety:</strong> To protect users, prevent fraud, or enforce our Terms of Service</li>
                    </ul>
                    <p className="mt-4">We do NOT sell your personal data to third parties.</p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">9. International Data Transfers</h2>
                    <p>
                        Your data may be processed in countries outside your jurisdiction. We ensure appropriate safeguards through:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                        <li>Data Processing Agreements with all service providers</li>
                        <li>Choosing providers with adequate privacy certifications</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">10. Security Measures</h2>
                    <p>We implement industry-standard security measures including:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>TLS/SSL encryption for all data in transit</li>
                        <li>Encrypted database storage</li>
                        <li>Regular security audits</li>
                        <li>Access controls and authentication</li>
                        <li>Incident response procedures</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">11. Children&apos;s Privacy</h2>
                    <p>
                        InkHaven is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If you believe we have collected data from a minor, please contact us immediately.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">12. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy periodically. We will notify you of significant changes by posting a notice on our Service or sending you a notification. Continued use of the Service after changes constitutes acceptance.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">13. Contact Us</h2>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6">
                        <p className="m-0">
                            <strong>Privacy Inquiries:</strong> <a href="mailto:namamicreations@zenithcryptoai.in" className="text-indigo-600 hover:underline">namamicreations@zenithcryptoai.in</a><br />
                            <strong>General Support:</strong> <a href="mailto:namamicreations@zenithcryptoai.in" className="text-indigo-600 hover:underline">namamicreations@zenithcryptoai.in</a><br />
                            <strong>Website:</strong> <Link href="https://www.inkhaven.in" className="text-indigo-600 hover:underline">www.inkhaven.in</Link>
                        </p>
                    </div>
                </section>

                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <Link href="/legal/terms" className="text-indigo-600 hover:underline mr-6">Terms of Service</Link>
                    <Link href="/legal/cookies" className="text-indigo-600 hover:underline mr-6">Cookie Policy</Link>
                    <Link href="/legal/gdpr" className="text-indigo-600 hover:underline">GDPR Statement</Link>
                </div>
            </div>
        </div>
    );
}
