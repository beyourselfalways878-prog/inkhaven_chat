"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import ServiceWorkerRegister from './ServiceWorkerRegister';
import { ToastProvider } from './ui/toast';

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        staleTime: 30_000,
        retry: 2,
      }
    }
  }));

  return (
    <QueryClientProvider client={client}>
      <ToastProvider>
        <ServiceWorkerRegister />
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
}
