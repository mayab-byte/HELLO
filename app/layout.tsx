import type { Metadata, Viewport } from 'next';
import './globals.css';
// אחרון בכוונה: הפתקים של Design Studio מנצחים בקסקדה בלי !important.
import './studio-baked.css';
import StudioLoader from '@/studio/StudioLoader';
import { dna } from '@/dna';
import { dnaCss, dnaFontsHref } from '@/lib/dna';
import { asset } from '@/lib/asset';

// כל המטא־דאטה נגזרת מ-dna.ts — אין כאן ערך מותג קשיח.
export const metadata: Metadata = {
  metadataBase: new URL(dna.seo.siteUrl),
  title: {
    default: `${dna.brand.name} — ${dna.brand.tagline}`,
    template: dna.seo.titleTemplate,
  },
  description: dna.seo.description,
  openGraph: {
    type: 'website',
    locale: dna.seo.locale,
    siteName: dna.brand.name,
    title: `${dna.brand.name} — ${dna.brand.tagline}`,
    description: dna.seo.description,
    images: [asset(dna.seo.ogImage)],
  },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={dnaFontsHref(dna)} />
        {/* משתני המותג, נגזרים מ-dna.ts. חייבים להיות לפני שאר הסגנונות. */}
        <style id="dna-tokens" dangerouslySetInnerHTML={{ __html: dnaCss(dna) }} />
      </head>
      <body>
        <a className="skip-link" href="#main">דלג לתוכן הראשי</a>
        {children}
        <StudioLoader />
      </body>
    </html>
  );
}
