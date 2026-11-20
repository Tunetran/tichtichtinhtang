import type { Metadata, Viewport } from 'next';
import { getEventConfig } from '@/lib/event-settings';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#7A1835',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getEventConfig();
  const ogImageUrl = config.ogImage.startsWith('http')
    ? config.ogImage
    : `${siteUrl}${config.ogImage.startsWith('/') ? config.ogImage : `/${config.ogImage}`}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: config.eventName,
      template: `%s — ${config.eventName}`,
    },
    description: config.slogan,
    openGraph: {
      title: config.eventName,
      description: `${config.slogan} | ${config.eventDateLabel}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: config.eventName }],
      type: 'website',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: config.eventName,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getEventConfig();

  return (
    <html lang="vi" data-theme={config.theme} suppressHydrationWarning>
      <body
        className="bg-bg text-text font-sans antialiased min-h-[100dvh] flex flex-col justify-between selection:bg-accent/20 selection:text-text relative"
        suppressHydrationWarning
      >
        {/* Subtle SVG Paper Grain Overlay for tactile luxury feel */}
        <div className="paper-grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
