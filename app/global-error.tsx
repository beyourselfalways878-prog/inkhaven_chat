"use client";

import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  Sentry.captureException(error);
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm text-slate-600">We logged this and will investigate.</p>
          </div>
        </div>
      </body>
    </html>
  );
}