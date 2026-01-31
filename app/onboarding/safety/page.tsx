"use client";
import { useRouter } from 'next/navigation';

export default function OnboardingSafety() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <section className="card p-6">
          <div className="pill">Step 3 of 3</div>
          <h2 className="mt-4 text-3xl font-semibold">Safety promise</h2>
          <p className="mt-3 text-sm text-slate-600">We prioritize calm and respectful conversation.</p>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">No harassment or hate speech.</div>
            <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">Respect boundaries and comfort levels.</div>
            <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">Use the report feature when something feels wrong.</div>
          </div>
        </section>

        <section className="glass p-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold">Ready to begin?</h3>
            <p className="mt-2 text-sm text-slate-600">You can update preferences any time in Settings.</p>
            <div className="mt-6 flex justify-end">
              <button onClick={() => router.push('/quick-match')} className="rounded-full bg-indigo-600 px-5 py-2 text-white">
                Enter InkHaven
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
