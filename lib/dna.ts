/** הטיפוסים של קובץ ה-DNA, והגזירה ממנו ל-CSS ולגופנים. */

export type SectionKey =
  | 'hero' | 'trust' | 'services' | 'about'
  | 'gallery' | 'testimonials' | 'posts' | 'faq' | 'contact';

export interface NavItem {
  label: string;
  href: string;
  /** הסקשן שאליו הפריט מקשר. פריט של סקשן כבוי מוסר מהתפריט. */
  section?: SectionKey;
}

export interface DnaColors {
  brand: string; brandStrong: string; brandSoft: string; accent: string;
  bg: string; bgAlt: string; surface: string; border: string;
  text: string; textMuted: string; textOnBrand: string;
  focus: string; focusOnDark: string; error: string; success: string;
}

export interface DnaFont { family: string; weights: number[] }

// ─────────────────────────── GSO ───────────────────────────

/**
 * GSO — אופטימיזציה למנועי חיפוש גנרטיביים.
 *
 * SEO קלאסי נלחם על מיקום בעמוד תוצאות. GSO נלחם על משהו אחר: שהמודל
 * שעונה לגולש יצטט **אותנו**. מודל לא מדרג קישורים, הוא בונה תשובה,
 * ולכן הוא צריך שלושה דברים שאתר רגיל לא טורח לתת לו:
 *
 *   1. ישות מוגדרת  — מי העסק, במונחים שמכונה מבינה (לא טקסט חופשי)
 *   2. תשובות מפורשות — שאלה ותשובה, גלויות בעמוד וגם מסומנות
 *   3. מפה קריאה     — llms.txt: מה יש באתר ולמי הוא מיועד
 *
 * הבלוק הזה מגדיר את שלושתם, וכל השאר נגזר ממנו אוטומטית.
 */

/** יום בשבוע בקיצור schema.org. */
export type DayCode = 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su';

/** שעות פתיחה בפורמט שמכונה מפרשת, להבדיל מ-identity.hours שהוא לבני אדם. */
export interface OpeningHours {
  days: DayCode[];
  /** HH:MM בפורמט 24 שעות. */
  opens: string;
  closes: string;
}

/** שאלה ותשובה. מוצגת בעמוד **וגם** נגזרת ל-FAQPage — אותו מקור בדיוק. */
export interface Answer {
  q: string;
  a: string;
}

export interface Gso {
  entity: {
    /** סוג הישות ב-schema.org. עסק עם כתובת פיזית = LocalBusiness. */
    type: 'Organization' | 'LocalBusiness' | 'ProfessionalService';
    /** שנת ההיווסדות. אות ותק שמודלים משתמשים בו. */
    foundingYear: number | null;
    /** טווח מחירים, ‎₪ עד ‎₪₪₪₪. */
    priceRange: string | null;
    /** אזורי שירות. */
    areaServed: string[];
    /** קואורדינטות. נדרשות ל-LocalBusiness. */
    geo: { lat: number; lng: number } | null;
    /**
     * פרופילים מאמתים. ריק = נגזר אוטומטית מ-identity.social,
     * תוך דילוג על עוגנים ריקים ('#').
     */
    sameAs: string[];
  };

  /**
   * מי חתום על התוכן. מודלים שוקללים מחבר מזוהה מעל תוכן אנונימי,
   * ובמודל הנתונים אין שדה מחבר למאמר — ולכן זו החתימה ברמת האתר.
   */
  author: {
    name: string;
    /** תפקיד או תחום מומחיות. */
    title: string;
    /** נתיב פנימי לעמוד שמבסס את הסמכות, למשל '/about'. */
    url: string;
  };

  /** שעות פתיחה קריאות-מכונה. ריק = לא מפורסמות. */
  hours: OpeningHours[];

  /** התשובות שהאתר מפרסם. זה הלב של GSO. */
  answers: Answer[];

  llms: {
    /** ייצור /llms.txt. */
    enabled: boolean;
    /** משפט אחד שמסביר למודל מה האתר הזה. */
    summary: string;
    /** נושאים שבהם האתר מתיימר להיות מקור. */
    topics: string[];
  };

  /**
   * מדיניות כלפי סורקי AI. 'allow' = מותר לסרוק ולצטט,
   * 'block' = חסום במפורש ב-robots.txt.
   */
  crawlers: 'allow' | 'block';
}

export interface Dna {
  meta: { client: string; project: string; version: string; updated: string };
  brand: {
    name: string; shortName: string; tagline: string;
    logoMark: string; logoSrc: string | null;
  };
  identity: {
    legalName: string; companyId: string;
    phone: string; phoneHref: string; whatsapp: string | null;
    email: string; address: string; hours: string;
    social: NavItem[];
  };
  accessibility: {
    level: 'A' | 'AA' | 'AAA';
    standard: string;
    coordinator: { name: string; email: string; phone: string };
    statementUpdated: string;
  };
  design: {
    colors: DnaColors;
    fonts: { heading: DnaFont; body: DnaFont; fallback: string };
    shape: { radiusSm: string; radius: string; radiusLg: string; radiusPill: string };
    layout: { container: string; containerNarrow: string };
  };
  seo: {
    siteUrl: string;
    titleTemplate: string; description: string; locale: string; ogImage: string;
    analytics: { ga4: string | null; metaPixel: string | null };
  };
  gso: Gso;
  sections: Record<SectionKey, boolean>;
  nav: NavItem[];
  legalLinks: NavItem[];
}

/** camelCase → --kebab-case, כדי שהשמות ב-DNA יהיו נוחים והפלט תקני. */
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

/**
 * משתני ה-CSS הנגזרים מה-DNA.
 * מוזרקים ב-<head> לפני כל סגנון אחר, כך שכל האתר יונק מהם.
 * app/tokens.css מחזיק רק את מה שאינו תלוי-מותג (סקאלת טיפוגרפיה, מרווחים).
 */
export function dnaCss(dna: Dna): string {
  const { colors, fonts, shape, layout } = dna.design;
  const stack = (f: DnaFont) => `'${f.family}', ${fonts.fallback}`;

  const lines = [
    ...Object.entries(colors).map(([k, v]) => `  --${kebab(k)}: ${v};`),
    `  --font-heading: ${stack(fonts.heading)};`,
    `  --font-body: ${stack(fonts.body)};`,
    ...Object.entries(shape).map(([k, v]) => `  --${kebab(k)}: ${v};`),
    ...Object.entries(layout).map(([k, v]) => `  --${kebab(k)}: ${v};`),
  ];

  return `:root {\n${lines.join('\n')}\n}`;
}

/**
 * התפריט בפועל: פריט שמקשר לסקשן כבוי מוסר.
 * בלי זה, כיבוי סקשן ב-DNA משאיר בתפריט עוגן שבור.
 */
export function activeNav(dna: Dna): NavItem[] {
  return dna.nav.filter((item) => !item.section || dna.sections[item.section]);
}

/** קישור Google Fonts לשני הגופנים שב-DNA. */
export function dnaFontsHref(dna: Dna): string {
  const { heading, body } = dna.design.fonts;
  const families = [heading, body]
    .filter((f, i, a) => a.findIndex((x) => x.family === f.family) === i)
    .map((f) => `family=${f.family.replace(/ /g, '+')}:wght@${[...f.weights].sort((a, b) => a - b).join(';')}`);
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}
