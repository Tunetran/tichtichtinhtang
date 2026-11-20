import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Dancing_Script, Plus_Jakarta_Sans } from 'next/font/google';
import { EVENT_CONFIG } from '@/config/event';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['vietnamese', 'latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const dancingScript = Dancing_Script({
  subsets: ['vietnamese', 'latin'],
  weight: ['600', '700'],
  variable: '--font-script',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: EVENT_CONFIG.eventName,
  description: EVENT_CONFIG.slogan,
  openGraph: {
    title: EVENT_CONFIG.eventName,
    description: `${EVENT_CONFIG.slogan} | ${EVENT_CONFIG.eventDateLabel}`,
    images: [{ url: EVENT_CONFIG.ogImage, width: 1200, height: 630 }],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      data-theme={EVENT_CONFIG.theme}
      className={`${playfair.variable} ${dancingScript.variable} ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-bg text-text font-sans antialiased min-h-[100dvh] flex flex-col justify-between"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
