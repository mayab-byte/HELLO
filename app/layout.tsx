import type { Metadata, Viewport } from 'next';
import './globals.css';
import StudioLoader from '@/studio/StudioLoader';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: 'תשתית אתר תבנית: נגישה בתקן AA, רספונסיבית, עם מערכת ניהול תוכן ואזור אישי ללקוחות.',
  openGraph: { type: 'website', locale: 'he_IL', siteName: site.name },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700&family=Heebo:wght@700;800&display=swap"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">דלג לתוכן הראשי</a>
        {children}
        <StudioLoader />
      </body>
    </html>
  );
}
