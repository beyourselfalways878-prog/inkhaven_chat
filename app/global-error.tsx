"use client";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  console.error('Global error:', error);
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="card p-8 text-center max-w-md">
            <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
            <p className="mt-3 text-sm text-white/50">We logged this and will investigate.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary mt-6"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}