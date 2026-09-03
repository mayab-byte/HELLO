/**
 * ██  ה-DNA של האתר  ██
 *
 * הקובץ היחיד שמגדיר מי האתר הזה. בשכפול לפרויקט לקוח חדש —
 * זה הקובץ שעורכים, ובדרך כלל היחיד.
 *
 * ממנו נגזרים אוטומטית:
 *   • משתני ה-CSS (צבעים, גופנים, צורה, פריסה) — מוזרקים ב-app/layout.tsx
 *   • טעינת הגופנים מ-Google Fonts
 *   • תגיות ה-SEO וה-Open Graph
 *   • פרטי הקשר בכל האתר
 *   • הצהרת הנגישות והמסמכים המשפטיים
 *   • אילו סקשנים מוצגים בעמוד הבית
 *
 * מה לא כאן: נוסחי הטקסט של הסקשנים — הם ב-content/site.ts,
 * כי הם משתנים לפי תוכן ולא לפי זהות.
 *
 * ⚠️  הפלטה נבדקת אוטומטית מול תקן AA בכל בנייה (scripts/check-dna.mjs).
 *     צבע שלא עומד בניגודיות מפיל את הבנייה במקום להגיע לאוויר.
 */

import type { Dna } from '@/lib/dna';

export const dna: Dna = {
  // ─── מטא ────────────────────────────────────────────────────────────
  meta: {
    client: 'אתר דוגמה',
    project: 'תשתית אתר תבנית',
    version: '1.0.0',
    updated: '2026-09-01',
  },

  // ─── מותג ───────────────────────────────────────────────────────────
  brand: {
    name: 'שם העסק',
    shortName: 'העסק',
    tagline: 'פתרונות מקצועיים לעסקים',
    // אות/סמל ללוגו טקסטואלי. להחלפה בקובץ: logoSrc: '/images/logo.svg'
    logoMark: 'ש',
    logoSrc: null,
  },

  // ─── ישות וקשר ──────────────────────────────────────────────────────
  identity: {
    legalName: 'שם העסק בע"מ',
    companyId: '000000000',
    phone: '03-0000000',
    phoneHref: 'tel:+97230000000',
    whatsapp: null,
    email: 'info@example.co.il',
    address: 'רחוב הדוגמה 1, תל אביב',
    hours: "ימים א'–ה', 09:00–18:00",
    social: [
      { label: 'פייסבוק', href: '#' },
      { label: 'אינסטגרם', href: '#' },
      { label: 'לינקדאין', href: '#' },
    ],
  },

  // ─── נגישות (חובה חוקית) ────────────────────────────────────────────
  accessibility: {
    level: 'AA',
    standard: 'ת"י 5568 / WCAG 2.1',
    coordinator: {
      name: 'שם רכז הנגישות',
      email: 'access@example.co.il',
      phone: '03-0000000',
    },
    statementUpdated: '2026-09-01',
  },

  // ─── עיצוב — כל מה שמשתנה בין מותג למותג ────────────────────────────
  design: {
    colors: {
      brand: '#1d4ed8',
      brandStrong: '#1e3a8a',
      brandSoft: '#eff6ff',
      accent: '#f59e0b',

      bg: '#ffffff',
      bgAlt: '#f8fafc',
      surface: '#ffffff',
      border: '#e2e8f0',

      text: '#0f172a',
      textMuted: '#475569',
      textOnBrand: '#ffffff',

      focus: '#b45309',
      // חיווי הפוקוס על משטחים כהים (סקשן CTA, פוטר) —
      // הכתום הכהה נותן שם 2.06:1 בלבד ולכן נדרש צבע בהיר.
      focusOnDark: '#fde68a',
      error: '#b91c1c',
      success: '#15803d',
    },

    fonts: {
      heading: { family: 'Heebo', weights: [700, 800] },
      body: { family: 'Assistant', weights: [400, 600, 700] },
      fallback: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
    },

    shape: {
      radiusSm: '6px',
      radius: '12px',
      radiusLg: '20px',
      radiusPill: '999px',
    },

    layout: {
      container: '1200px',
      containerNarrow: '760px',
    },
  },

  // ─── SEO ────────────────────────────────────────────────────────────
  seo: {
    // כתובת האתר בפרודקשן. נדרשת כדי שתמונות ה-Open Graph יקבלו
    // כתובת מלאה — רשתות חברתיות לא מבינות נתיב יחסי.
    siteUrl: 'https://example.co.il',
    titleTemplate: '%s | שם העסק',
    description:
      'תשתית אתר תבנית: נגישה בתקן AA, רספונסיבית, עם מערכת ניהול תוכן ואזור אישי ללקוחות.',
    locale: 'he_IL',
    ogImage: '/images/hero.svg',
    analytics: { ga4: null, metaPixel: null },
  },

  // ─── אילו סקשנים מוצגים בעמוד הבית ──────────────────────────────────
  sections: {
    hero: true,
    trust: true,
    services: true,
    about: true,
    gallery: true,
    testimonials: true,
    posts: true,
    contact: true,
  },

  // ─── תפריט ──────────────────────────────────────────────────────────
  // הניווט מצביע לעמודים מלאים; עמוד הבית מציג תקציר של כל אחד מהם.
  // section מקשר כל פריט לסקשן שלו — כיבוי סקשן מסיר גם את העמוד וגם את הקישור.
  nav: [
    { label: 'אודות', href: '/about', section: 'about' },
    { label: 'שירותים', href: '/services', section: 'services' },
    { label: 'גלריה', href: '/gallery', section: 'gallery' },
    { label: 'המלצות', href: '/testimonials', section: 'testimonials' },
    { label: 'מאמרים', href: '/blog', section: 'posts' },
    { label: 'צור קשר', href: '/contact', section: 'contact' },
  ],

  legalLinks: [
    { label: 'הצהרת נגישות', href: '/accessibility' },
    { label: 'מדיניות פרטיות', href: '/privacy' },
    { label: 'תנאי שימוש', href: '/terms' },
  ],
};

export default dna;
