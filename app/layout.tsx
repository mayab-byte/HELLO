import type { Metadata, Viewport } from 'next';
import './globals.css';
// אחרון בכוונה: הפתקים של Design Studio מנצחים בקסקדה בלי !important.
import './studio-baked.css';
import StudioLoader from '@/studio/StudioLoader';
import JsonLd from '@/components/site/JsonLd';
import { dna } from '@/dna';
import { dnaCss, dnaFontsHref } from '@/lib/dna';
import { siteGraph, absolute } from '@/lib/gso';
import { asset } from '@/lib/asset';

/**
 * החלת העדפות הנגישות לפני הצביעה הראשונה.
 *
 * בלי זה, מי שבחר ניגודיות גבוהה או טקסט מוגדל מקבל הבזק של העמוד
 * הרגיל עד ש-React עולה — כלומר דווקא המשתמש שהכי תלוי בהתאמה הוא זה
 * שרואה אותה נשברת בכל טעינה. הסקריפט קצר ורץ סינכרונית ב-head.
 */
const A11Y_BOOT = `(function(){try{var p=JSON.parse(localStorage.getItem('a11y-prefs-v1')||'{}');var e=document.documentElement;(p.on||[]).forEach(function(k){e.classList.add('a11y-'+k)});if(p.zoom&&p.zoom!==100){e.classList.add('a11y-zoom');e.style.setProperty('--a11y-zoom',p.zoom/100)}}catch(_){}})();`;

// כל המטא־דאטה נגזרת מ-dna.ts — אין כאן ערך מותג קשיח.
export const metadata: Metadata = {
  metadataBase: new URL(dna.seo.siteUrl),
  title: {
    default: `${dna.brand.name} — ${dna.brand.tagline}`,
    template: dna.seo.titleTemplate,
  },
  description: dna.seo.description,
  alternates: { canonical: absolute(dna) },
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
        <script dangerouslySetInnerHTML={{ __html: A11Y_BOOT }} />
      </head>
      <body>
        {/* גרף הישות — מוזרק פעם אחת לכל האתר. כל שאר הסימונים מצביעים אליו. */}
        <JsonLd data={siteGraph(dna)} />
        <a className="skip-link" href="#main">דלג לתוכן הראשי</a>
        {children}
        <StudioLoader />
      </body>
    </html>
  );
}
