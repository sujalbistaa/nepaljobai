import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ClerkProvider } from '@clerk/nextjs';
import { SITE } from '@/lib/constants';
import { GuruChat } from '@/components/chat/GuruChat';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  description:
    'Upload your resume in English or Nepali. We score you against every live role in Kathmandu, point out the exact skills you\'re missing, and hand you a 12-week plan that\'s free to follow.',
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: SITE.name,
    description: SITE.tagline,
    url: SITE.url,
    siteName: SITE.name,
    locale: 'en_NP',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: SITE.name, description: SITE.tagline },
  authors: SITE.team.map((name) => ({ name })),
  keywords: [
    'jobs Nepal',
    'Kathmandu jobs',
    'resume matcher',
    'Nepali tech jobs',
    'merojob',
    'kumarijob',
    'AI resume parser Nepal',
    'startup hackathon 2026',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F2EC' },
    { media: '(prefers-color-scheme: dark)', color: '#0E1117' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        data-theme="system"
        className={`${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning
      >
        <head>
          {/* Devanagari subset — only loaded if user toggles Nepali */}
          <link
            rel="preconnect"
            href="https://fonts.googleapis.com"
          />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] antialiased">
          {children}
          <GuruChat />
        </body>
      </html>
    </ClerkProvider>
  );
}