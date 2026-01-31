"use client";
import { useState } from 'react';

export default function ChatPage() {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<any>(null);

  async function startAnonymous() {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/anonymous', { method: 'POST' });
      const json = await res.json();
      setInfo(json);
    } catch (err) {
      setInfo({ error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold">Anonymous Chat (dev)</h2>
      <p className="mt-2 text-sm text-slate-600">Start an ephemeral session for local testing.</p>

      <div className="mt-6">
        <button onClick={startAnonymous} disabled={loading} className="rounded bg-indigo-600 text-white px-4 py-2">
          {loading ? 'Starting...' : 'Start as Guest'}
        </button>
      </div>

      {info && (
        <pre className="mt-6 rounded bg-slate-100 p-4 text-sm">{JSON.stringify(info, null, 2)}</pre>
      )}
    </div>
  );
}
