import './globals.css';
import type { ReactNode } from 'react';
import Providers from '../components/Providers';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ModerationGate from '../components/ModerationGate';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

import { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f172a',
  // Ensures keyboard doesn't hide content on mobile
  interactiveWidget: 'resizes-content',
};

export const metadata = {
  title: 'InkHaven | Anonymous & Safe Chat',
  description: 'Connect safely and anonymously with InkHaven. Features AI moderation, interest matching, and a beautiful interface. No login required.',
  keywords: ['anonymous chat', 'safe chat', 'secure messaging', 'stranger chat', 'inkhaven', 'mental health friendly'],
  authors: [{ name: 'Twinkle Tiwari' }],
  creator: 'Twinkle Tiwari',
  publisher: 'Namami Creations',
  metadataBase: new URL('https://www.inkhaven.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'InkHaven - Your Anonymous Sanctuary',
    description: 'A safe space for genuine conversations. No data collection, just connection.',
    url: 'https://www.inkhaven.in',
    siteName: 'InkHaven',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InkHaven Chat',
    description: 'Anonymous, safe, and intelligent chat sanctuary.',
    creator: '@inkhaven', // Placeholder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'Your-Google-Verification-Code', // User needs to replace this
  },
  other: {
    'google-adsense-account': 'ca-pub-7229649791586904'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7229649791586904"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'InkHaven',
              url: 'https://www.inkhaven.in',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://www.inkhaven.in/search?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
      </head>
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
        <script
          data-name="BMC-Widget"
          data-cfasync="false"
          src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
          data-id="Twinklet"
          data-description="Support me on Buy me a coffee!"
          data-message=""
          data-color="#5F7FFF"
          data-position="Right"
          data-x_margin="18"
          data-y_margin="18"
          defer
        />
      </body>
    </html>
  );
}

