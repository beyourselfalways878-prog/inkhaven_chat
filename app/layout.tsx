import './globals.css';
import type { ReactNode } from 'react';
import Providers from '../components/Providers';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ModerationGate from '../components/ModerationGate';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'InkHaven Chat',
  description: 'Anonymous, safe, and intelligent chat'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ModerationGate>
            <Header />
            <main className="min-h-screen flex flex-col">{children}</main>
            <Footer />
          </ModerationGate>
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

