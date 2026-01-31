"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import ServiceWorkerRegister from './ServiceWorkerRegister';
import { useSessionStore } from '../stores/useSessionStore';

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } }));
  const setSession = useSessionStore((s) => s.setSession);

  // Load persisted session from localStorage on mount (client only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('inkhaven:session');
      if (raw) {
        const sess = JSON.parse(raw);
        if (sess && sess.userId) setSession(sess);
      }
    } catch (err) {
      // ignore
    }
  }, [setSession]);

  // Persist session whenever it changes
  useEffect(() => {
    const unsub = useSessionStore.subscribe((state) => {
      try {
        localStorage.setItem('inkhaven:session', JSON.stringify(state.session ?? {}));
      } catch (err) {
        // ignore
      }
    });

    return () => unsub();
  }, []);

  return (
    <QueryClientProvider client={client}>
      <ServiceWorkerRegister />
      {children}
    </QueryClientProvider>
  );
}
