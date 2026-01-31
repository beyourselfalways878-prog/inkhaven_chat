"use client";
import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('Service worker registered:', reg.scope);
      }).catch((err) => {
        console.warn('Service worker registration failed', err);
      });

      navigator.serviceWorker.addEventListener('message', (evt) => {
        // handle messages from sw (queued message sent, notification clicks, etc.)
        console.log('SW message', evt.data);
      });
    }
  }, []);

  return null;
}
