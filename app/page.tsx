'use client';

import Link from 'next/link';
import { Button } from '../components/ui/button';
import { useEffect, useState } from 'react';

const FloatingOrb = ({ delay, size, color, position }: { delay: number; size: string; color: string; position: string }) => (
  <div
    className={`absolute ${position} ${size} rounded-full blur-3xl opacity-40 animate-float`}
    style={{
      background: color,
      animationDelay: `${delay}s`,
      animationDuration: '8s'
    }}
  />
);

const GlowingCard = ({ children, className = '', gradient }: { children: React.ReactNode; className?: string; gradient: string }) => (
  <div className={`relative group ${className}`}>
    <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500`} />
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
      {children}
    </div>
  </div>
);

const AnimatedCounter = ({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const FeatureIcon = ({ gradient, children }: { gradient: string; children: React.ReactNode }) => (
  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl shadow-lg`}>
    {children}
  </div>
);

export default function Page() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    { text: "I feel like I can finally be myself without judgment.", author: "Ink_7f2a", mood: "🌙" },
    { text: "The matching algorithm is incredibly accurate. Found my vibe instantly.", author: "Anonymous", mood: "✨" },
    { text: "Finally a chat app that respects privacy AND looks gorgeous.", author: "Ink_9k3m", mood: "💜" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-emerald-950/10" />
        <FloatingOrb delay={0} size="w-96 h-96" color="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" position="top-[-10%] left-[-5%]" />
        <FloatingOrb delay={2} size="w-80 h-80" color="linear-gradient(135deg, #10b981 0%, #14b8a6 100%)" position="top-[20%] right-[-10%]" />
        <FloatingOrb delay={4} size="w-72 h-72" color="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)" position="bottom-[10%] left-[20%]" />
        <FloatingOrb delay={6} size="w-64 h-64" color="linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)" position="bottom-[-5%] right-[15%]" />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/50 dark:border-indigo-800/50 mb-8 animate-pulse-slow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI-Guarded • Real-Time • Zero-Trust Privacy
            </span>
          </div>

          {/* Main Headline with Gradient */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="block text-slate-900 dark:text-white">Where Anonymity</span>
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              Meets Connection
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A premium space for authentic conversations. No names, no profiles, just <span className="text-indigo-600 dark:text-indigo-400 font-medium">real human connection</span> — protected by AI moderation and designed for your peace of mind.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
              <Link href="/onboarding">
                <span className="mr-2">✨</span> Start Chatting
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="px-8 py-4 text-lg rounded-xl border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5">
              <Link href="/quick-match">
                <span className="mr-2">⚡</span> Quick Match
              </Link>
            </Button>
          </div>

          {/* Live Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="px-6">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                <AnimatedCounter end={12847} suffix="+" />
              </div>
              <div className="text-sm text-slate-500">Users Connected</div>
            </div>
            <div className="px-6 border-l border-r border-slate-200 dark:border-slate-700">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                <AnimatedCounter end={98} suffix="%" />
              </div>
              <div className="text-sm text-slate-500">Safe Conversations</div>
            </div>
            <div className="px-6">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                <AnimatedCounter end={4} suffix=".9★" />
              </div>
              <div className="text-sm text-slate-500">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Why Choose <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">InkHaven</span>?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            We&apos;ve reimagined anonymous chat from the ground up.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <GlowingCard gradient="from-indigo-500 to-purple-500">
            <FeatureIcon gradient="from-indigo-500 to-purple-500">🛡️</FeatureIcon>
            <h3 className="text-xl font-semibold mt-5 mb-3 text-slate-900 dark:text-white">AI-Powered Safety</h3>
            <p className="text-slate-600 dark:text-slate-400">Real-time content moderation protects every conversation. Harmful content is caught before it reaches you.</p>
          </GlowingCard>

          <GlowingCard gradient="from-emerald-500 to-teal-500">
            <FeatureIcon gradient="from-emerald-500 to-teal-500">🎯</FeatureIcon>
            <h3 className="text-xl font-semibold mt-5 mb-3 text-slate-900 dark:text-white">Smart Matching</h3>
            <p className="text-slate-600 dark:text-slate-400">Our AI learns from your conversations to find people who match your vibe and interests.</p>
          </GlowingCard>

          <GlowingCard gradient="from-pink-500 to-rose-500">
            <FeatureIcon gradient="from-pink-500 to-rose-500">🔐</FeatureIcon>
            <h3 className="text-xl font-semibold mt-5 mb-3 text-slate-900 dark:text-white">Zero-Knowledge Privacy</h3>
            <p className="text-slate-600 dark:text-slate-400">No emails, no phone numbers, no real names. Your identity stays completely private.</p>
          </GlowingCard>

          <GlowingCard gradient="from-amber-500 to-orange-500">
            <FeatureIcon gradient="from-amber-500 to-orange-500">⚡</FeatureIcon>
            <h3 className="text-xl font-semibold mt-5 mb-3 text-slate-900 dark:text-white">Real-Time Everything</h3>
            <p className="text-slate-600 dark:text-slate-400">Instant messages, live typing indicators, and presence status. It feels like being in the same room.</p>
          </GlowingCard>

          <GlowingCard gradient="from-cyan-500 to-blue-500">
            <FeatureIcon gradient="from-cyan-500 to-blue-500">🎨</FeatureIcon>
            <h3 className="text-xl font-semibold mt-5 mb-3 text-slate-900 dark:text-white">Premium Design</h3>
            <p className="text-slate-600 dark:text-slate-400">A beautiful, calming interface that makes chatting a pleasure. Dark mode included.</p>
          </GlowingCard>

          <GlowingCard gradient="from-violet-500 to-purple-500">
            <FeatureIcon gradient="from-violet-500 to-purple-500">🎙️</FeatureIcon>
            <h3 className="text-xl font-semibold mt-5 mb-3 text-slate-900 dark:text-white">Voice Messages</h3>
            <p className="text-slate-600 dark:text-slate-400">Send voice notes when typing isn&apos;t enough. Express yourself naturally.</p>
          </GlowingCard>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-1">
            <div className="bg-white dark:bg-slate-900 rounded-[22px] p-8 md:p-12">
              <div className="text-center">
                <div className="text-5xl mb-6">{testimonials[activeTestimonial].mood}</div>
                <p className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white mb-6 transition-all duration-500">
                  &quot;{testimonials[activeTestimonial].text}&quot;
                </p>
                <p className="text-slate-500">— {testimonials[activeTestimonial].author}</p>

                {/* Dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial
                        ? 'w-8 bg-gradient-to-r from-indigo-500 to-purple-500'
                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to experience <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">real connection</span>?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              Join thousands of users who have found their space for authentic, anonymous conversations.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-4 text-lg rounded-xl shadow-lg shadow-indigo-500/25">
              <Link href="/onboarding">
                Create Your Anonymous Profile <span className="ml-2">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer removed - using global footer */}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(10px) rotate(-3deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        @keyframes gradient {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}