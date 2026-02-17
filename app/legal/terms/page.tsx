import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | InkHaven',
    description: 'InkHaven Terms of Service - Rules and guidelines for using our platform.',
};

export default function TermsOfServicePage() {
    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="prose prose-slate max-w-none">
                <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
                <p className="text-slate-500 mb-8">Last updated: January 27, 2026</p>

                <div className="bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-950/30 dark:to-pink-950/30 rounded-2xl p-6 mb-8">
                    <p className="text-lg font-medium text-slate-800 dark:text-slate-200 m-0">
                        Welcome to InkHaven! These Terms govern your use of our anonymous chat platform. By using InkHaven, you agree to these Terms.
                    </p>
                </div>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using InkHaven (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service.
                    </p>
                    <p>
                        InkHaven is operated by InkHaven (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms constitute a legally binding agreement between you and InkHaven.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">2. Eligibility</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>You must be at least <strong>18 years old</strong> to use InkHaven</li>
                        <li>You must have the legal capacity to enter into binding agreements</li>
                        <li>You must not be prohibited from using the Service under applicable law</li>
                        <li>You must not have been previously banned from our platform</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account & Profile</h2>
                    <h3 className="text-xl font-medium mt-6 mb-3">3.1 Anonymous Profiles</h3>
                    <p>
                        InkHaven provides anonymous profiles identified by randomized &quot;Ink IDs.&quot; You are responsible for maintaining the confidentiality of your session and any activities under your profile.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">3.2 Profile Information</h3>
                    <p>
                        Any information you provide in your profile (interests, display name, preferences) must be accurate and not misleading. You agree not to impersonate others or create fake profiles for malicious purposes.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">4. Acceptable Use</h2>
                    <p>You agree NOT to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Harass, abuse, threaten, or intimidate other users</li>
                        <li>Share illegal content, including child exploitation material</li>
                        <li>Engage in hate speech, discrimination, or violent threats</li>
                        <li>Share personal information of others without consent (doxxing)</li>
                        <li>Spam, advertise, or solicit without permission</li>
                        <li>Attempt to hack, exploit, or disrupt the Service</li>
                        <li>Use bots or automated systems without authorization</li>
                        <li>Circumvent safety features or moderation systems</li>
                        <li>Share malware, phishing links, or malicious content</li>
                        <li>Engage in any illegal activity</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">5. Content & Moderation</h2>
                    <h3 className="text-xl font-medium mt-6 mb-3">5.1 User Content</h3>
                    <p>
                        You retain ownership of content you create. By posting content, you grant InkHaven a non-exclusive, royalty-free license to use, store, and process your content for the purpose of providing the Service.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">5.2 AI Moderation</h3>
                    <p>
                        We use AI-powered moderation to detect and filter harmful content. This system may automatically filter, flag, or remove content that violates our guidelines. False positives may occur; you can appeal moderation decisions.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">5.3 Reporting</h3>
                    <p>
                        You can report violations using our in-app reporting tools. We investigate all reports and take appropriate action, which may include warnings, temporary bans, or permanent account termination.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">6. Privacy & Data</h2>
                    <p>
                        Your use of InkHaven is also governed by our <Link href="/legal/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>, which explains how we collect, use, and protect your data.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">7. Premium Services</h2>
                    <h3 className="text-xl font-medium mt-6 mb-3">7.1 Subscriptions</h3>
                    <p>
                        InkHaven offers optional premium subscriptions with enhanced features. Subscriptions are billed through PayPal and automatically renew unless cancelled.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">7.2 Refunds</h3>
                    <p>
                        Refund requests are evaluated on a case-by-case basis. Contact <a href="mailto:namamicreations@zenithcryptoai.in" className="text-indigo-600 hover:underline">namamicreations@zenithcryptoai.in</a> within 7 days of purchase for refund inquiries.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-3">7.3 Cancellation</h3>
                    <p>
                        You may cancel your subscription at any time through your account settings or PayPal. Access continues until the end of the current billing period.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">8. Intellectual Property</h2>
                    <p>
                        InkHaven and its original content, features, and functionality are owned by InkHaven and protected by international copyright, trademark, and other intellectual property laws.
                    </p>
                    <p>
                        You may not copy, modify, distribute, sell, or lease any part of our Service without explicit permission.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">9. Disclaimers</h2>
                    <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 my-4">
                        <p className="m-0">
                            <strong>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;</strong> without warranties of any kind, either express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
                        </p>
                    </div>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>We do not guarantee uninterrupted or error-free service</li>
                        <li>We do not guarantee the accuracy of user-generated content</li>
                        <li>We are not responsible for interactions between users</li>
                        <li>We do not endorse any content shared by users</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">10. Limitation of Liability</h2>
                    <p>
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, INKHAVEN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL.
                    </p>
                    <p>
                        Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim, or $100 USD, whichever is greater.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">11. Indemnification</h2>
                    <p>
                        You agree to indemnify and hold harmless InkHaven, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising from:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Your use of the Service</li>
                        <li>Your violation of these Terms</li>
                        <li>Your violation of any rights of another party</li>
                        <li>Your content posted on the Service</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">12. Termination</h2>
                    <p>
                        We may terminate or suspend your access immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service ceases immediately.
                    </p>
                    <p>
                        You may terminate your account at any time by discontinuing use of the Service.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">13. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles. Any disputes shall be resolved in the courts of India.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">14. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. We will notify you of significant changes by posting a notice on the Service. Continued use after changes constitutes acceptance.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mt-8 mb-4">15. Contact</h2>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6">
                        <p className="m-0">
                            <strong>Legal Inquiries:</strong> <a href="mailto:namamicreations@zenithcryptoai.in" className="text-indigo-600 hover:underline">namamicreations@zenithcryptoai.in</a><br />
                            <strong>Support:</strong> <a href="mailto:namamicreations@zenithcryptoai.in" className="text-indigo-600 hover:underline">namamicreations@zenithcryptoai.in</a><br />
                            <strong>Website:</strong> <Link href="https://www.inkhaven.in" className="text-indigo-600 hover:underline">www.inkhaven.in</Link>
                        </p>
                    </div>
                </section>

                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <Link href="/legal/privacy" className="text-indigo-600 hover:underline mr-6">Privacy Policy</Link>
                    <Link href="/legal/cookies" className="text-indigo-600 hover:underline mr-6">Cookie Policy</Link>
                    <Link href="/legal/gdpr" className="text-indigo-600 hover:underline">GDPR Statement</Link>
                </div>
            </div>
        </div>
    );
}
