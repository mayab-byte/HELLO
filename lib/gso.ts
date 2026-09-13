/**
 * ██  מנוע הגזירה של GSO  ██
 *
 * מקביל ל-lib/dna.ts, לעולם של מנועי חיפוש גנרטיביים. הקובץ הזה לוקח את
 * `dna.gso` ומייצר ממנו את כל מה שמודל צריך כדי לצטט את האתר:
 *
 *   siteGraph()      → גרף הישות: מי העסק, איפה, מתי פתוח, איפה מאמתים אותו
 *   faqNode()        → השאלות והתשובות, מסומנות
 *   breadcrumbNode() → מיקום העמוד בהיררכיה
 *   articleNode()    → מאמר עם מחבר ותאריכים
 *   serviceNode()    → שירות כישות נפרדת
 *   llmsTxt()        → המפה שהמודל קורא
 *   pageMeta()       → מטא-דאטה של עמוד, תמיד עם canonical
 *
 * ★ העיקרון שמחזיק את הכל: **הסימון נגזר מאותו מקור שמזין את המסך.**
 *   סקשן השאלות קורא ל-dna.gso.answers, וגם ה-FAQPage נגזר ממנו. אין דרך
 *   לסמן משהו שהגולש לא רואה, וזו בדיוק ההפרה שגוגל מעניש עליה.
 *
 * הקובץ הזה אינו תלוי במבנה של אתר מסוים. הוא מקבל נתונים ומחזיר צמתים,
 * ולכן הוא עובד באותה מידה באתר בן חמישה עמודים ובאתר בן חמישים.
 */

import type { Metadata } from 'next';
import type { Dna, DayCode, OpeningHours } from '@/lib/dna';

// ─────────────────────────── כתובות ───────────────────────────

/** בסיס הכתובת בלי לוכסן מסיים, כדי שהשרשור לעולם לא ייתן '//'. */
export function siteBase(dna: Dna): string {
  return dna.seo.siteUrl.replace(/\/+$/, '');
}

/**
 * כתובת מוחלטת לנתיב פנימי.
 *
 * JSON-LD חייב כתובות מוחלטות — נתיב יחסי בתוך `@id` או `url` פשוט
 * לא נפתר אצל הצרכן, ומודל שלא מצליח לפתור ישות פשוט לא מצטט אותה.
 */
export function absolute(dna: Dna, path = '/'): string {
  if (/^https?:/.test(path)) return path;
  return `${siteBase(dna)}${path.startsWith('/') ? path : `/${path}`}`;
}

/** מזהי הישויות הקבועות. קבועים כדי שכל הצמתים יצביעו לאותו עוגן. */
const ids = (dna: Dna) => ({
  entity: `${siteBase(dna)}/#entity`,
  website: `${siteBase(dna)}/#website`,
});

// ─────────────────────────── פרופילים מאמתים ───────────────────────────

/**
 * sameAs — הפרופילים שמאמתים שהעסק אמיתי.
 *
 * מקור ראשון: gso.entity.sameAs. אם ריק, נגזר מ-identity.social.
 * עוגנים ריקים ('#', '') מסוננים: קישור שבור ב-sameAs גרוע מהיעדרו,
 * כי הוא מכריז על פרופיל שלא קיים.
 */
export function sameAs(dna: Dna): string[] {
  const explicit = dna.gso.entity.sameAs.filter((u) => /^https?:\/\//.test(u));
  if (explicit.length) return explicit;
  return dna.identity.social
    .map((s) => s.href)
    .filter((href) => /^https?:\/\//.test(href));
}

// ─────────────────────────── שעות פתיחה ───────────────────────────

const DAY_NAMES: Record<DayCode, string> = {
  Su: 'Sunday', Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday',
  Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday',
};

/**
 * שעות פתיחה בפורמט שמכונה מפרשת.
 *
 * `identity.hours` הוא מחרוזת חופשית בעברית ("ימים א'-ה', 09:00-18:00").
 * אף מנתח לא יפרש אותה, והיא נשארת למסך בלבד. כאן נגזר המקבילה התקנית.
 */
export function openingHoursNodes(hours: OpeningHours[]) {
  return hours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.days.map((d) => DAY_NAMES[d]),
    opens: h.opens,
    closes: h.closes,
  }));
}

// ─────────────────────────── גרף הישות ───────────────────────────

/**
 * הגרף הראשי, מוזרק פעם אחת בכל עמוד דרך הלייאאוט.
 *
 * שתי ישויות מקושרות: הארגון עצמו, והאתר שמצביע אליו כמפרסם. הקישור
 * הזה הוא מה שמאפשר למודל להבין ש"האתר" ו"העסק" הם אותו דבר, במקום
 * שתי עובדות מנותקות.
 */
export function siteGraph(dna: Dna) {
  const id = ids(dna);
  const { entity } = dna.gso;
  const links = sameAs(dna);

  const entityNode: Record<string, unknown> = {
    '@type': entity.type,
    '@id': id.entity,
    name: dna.brand.name,
    legalName: dna.identity.legalName,
    description: dna.seo.description,
    url: absolute(dna),
    telephone: dna.identity.phone,
    email: dna.identity.email,
    inLanguage: 'he-IL',
    address: {
      '@type': 'PostalAddress',
      streetAddress: dna.identity.address,
      addressCountry: 'IL',
    },
  };

  if (dna.brand.logoSrc) entityNode.logo = absolute(dna, dna.brand.logoSrc);
  if (links.length) entityNode.sameAs = links;
  if (entity.foundingYear) entityNode.foundingDate = String(entity.foundingYear);
  if (entity.priceRange) entityNode.priceRange = entity.priceRange;
  if (entity.areaServed.length) entityNode.areaServed = entity.areaServed;
  if (entity.geo) {
    entityNode.geo = {
      '@type': 'GeoCoordinates',
      latitude: entity.geo.lat,
      longitude: entity.geo.lng,
    };
  }
  if (dna.gso.hours.length) {
    entityNode.openingHoursSpecification = openingHoursNodes(dna.gso.hours);
  }

  const websiteNode = {
    '@type': 'WebSite',
    '@id': id.website,
    url: absolute(dna),
    name: dna.brand.name,
    description: dna.seo.description,
    inLanguage: 'he-IL',
    publisher: { '@id': id.entity },
  };

  return { '@context': 'https://schema.org', '@graph': [entityNode, websiteNode] };
}

// ─────────────────────────── צמתים לעמוד בודד ───────────────────────────

/**
 * FAQPage.
 *
 * ★ נקרא **רק** מתוך הקומפוננטה שמציגה את השאלות על המסך. סימון FAQ
 *   על תוכן שאינו גלוי הוא הפרה מפורשת של הנחיות גוגל, והצמדת הסימון
 *   לקומפוננטה המציגה הופכת את ההפרה הזו לבלתי אפשרית מבחינה מבנית.
 */
export function faqNode(dna: Dna) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteBase(dna)}/#faq`,
    mainEntity: dna.gso.answers.map((a) => ({
      '@type': 'Question',
      name: a.q,
      acceptedAnswer: { '@type': 'Answer', text: a.a },
    })),
  };
}

/**
 * BreadcrumbList.
 *
 * נגזר מאותם פירורים שמוצגים ב-PageHeader. המבנה הוויזואלי וההיררכיה
 * הסמנטית יוצאים מקריאה אחת, ולכן לא נפרדים.
 */
export function breadcrumbNode(
  dna: Dna,
  crumbs: { label: string; href: string }[],
  currentLabel: string,
) {
  const trail = [{ label: 'בית', href: '/' }, ...crumbs];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      ...trail.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.label,
        item: absolute(dna, c.href),
      })),
      { '@type': 'ListItem', position: trail.length + 1, name: currentLabel },
    ],
  };
}

/** המחבר, כישות. מחבר מזוהה נשקל מעל תוכן אנונימי. */
export function authorNode(dna: Dna) {
  return {
    '@type': 'Person',
    name: dna.gso.author.name,
    jobTitle: dna.gso.author.title,
    url: absolute(dna, dna.gso.author.url),
    worksFor: { '@id': ids(dna).entity },
  };
}

/** Article — מאמר עם מחבר, מפרסם, תאריכים ועוגן לעמוד עצמו. */
export function articleNode(
  dna: Dna,
  post: {
    title: string;
    excerpt: string | null;
    slug: string;
    published: Date;
    updated: Date;
    image: { path: string; alt: string } | null;
  },
) {
  const url = absolute(dna, `/blog/${post.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.published.toISOString(),
    dateModified: post.updated.toISOString(),
    inLanguage: 'he-IL',
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: authorNode(dna),
    publisher: { '@id': ids(dna).entity },
    ...(post.image
      ? { image: { '@type': 'ImageObject', url: absolute(dna, post.image.path), caption: post.image.alt } }
      : {}),
  };
}

/** Service — שירות כישות נפרדת, מקושרת לספק. */
export function serviceNode(
  dna: Dna,
  service: { id: string; title: string; summary: string; image: { path: string } | null },
) {
  const url = absolute(dna, `/services/${service.id}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: service.title,
    description: service.summary,
    url,
    inLanguage: 'he-IL',
    provider: { '@id': ids(dna).entity },
    ...(dna.gso.entity.areaServed.length ? { areaServed: dna.gso.entity.areaServed } : {}),
    ...(service.image ? { image: absolute(dna, service.image.path) } : {}),
  };
}

// ─────────────────────────── מטא-דאטה של עמוד ───────────────────────────

/**
 * מטא-דאטה לעמוד, **תמיד עם canonical**.
 *
 * זו הסיבה שהפונקציה קיימת. `trailingSlash: true` יחד עם נתיבים
 * מקודדים בעברית מייצר בקלות כמה כתובות לאותו תוכן, ובלי canonical
 * המודל מפצל את הסמכות בין הכפילויות. הבדיקה ב-scripts/check-gso.mjs
 * מוודאת שכל עמוד באתר באמת עובר דרך כאן.
 */
export function pageMeta(
  dna: Dna,
  opts: { title: string; description: string; path: string; image?: string | null },
): Metadata {
  const url = absolute(dna, opts.path);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: opts.title,
      description: opts.description,
      ...(opts.image ? { images: [absolute(dna, opts.image)] } : {}),
    },
  };
}

// ─────────────────────────── סורקי AI ───────────────────────────

/**
 * הסורקים של מנועי החיפוש הגנרטיביים.
 *
 * ברירת המחדל של robots.txt מרשה להם מכללא, אבל "מכללא" אינה החלטה.
 * הרישום המפורש הופך את זה לבחירה של הלקוח, שאפשר להפוך בשדה אחד.
 */
export const AI_CRAWLERS = [
  'GPTBot',          // OpenAI — אימון
  'OAI-SearchBot',   // OpenAI — חיפוש ChatGPT
  'ChatGPT-User',    // OpenAI — גלישה יזומה של משתמש
  'ClaudeBot',       // Anthropic
  'anthropic-ai',    // Anthropic — סורק ותיק
  'PerplexityBot',   // Perplexity
  'Google-Extended',  // Gemini / AI Overviews
  'Applebot-Extended', // Apple Intelligence
  'CCBot',           // Common Crawl — מזין חלק גדול מהמודלים
  'Bytespider',      // ByteDance
];

// ─────────────────────────── llms.txt ───────────────────────────

/**
 * llms.txt — המפה שמודל קורא.
 *
 * מודל שמגיע לאתר לא סורק חמישים עמודים כדי להבין מה יש כאן. הקובץ הזה
 * אומר לו בעמוד אחד: מי העסק, במה הוא עוסק, מה התשובות שלו ואיפה התוכן.
 * הפורמט הוא Markdown לפי ההצעה של llmstxt.org.
 */
export function llmsTxt(
  dna: Dna,
  data: {
    pages: { label: string; href: string }[];
    posts: { title: string; slug: string; excerpt: string | null }[];
    services: { title: string; summary: string; id: string }[];
  },
): string {
  const { gso } = dna;
  const L: string[] = [];

  L.push(`# ${dna.brand.name}`);
  L.push('');
  L.push(`> ${gso.llms.summary}`);
  L.push('');

  L.push('## אודות');
  L.push('');
  L.push(`- **שם מלא:** ${dna.identity.legalName}`);
  L.push(`- **תחום:** ${dna.brand.tagline}`);
  if (gso.entity.foundingYear) L.push(`- **פועל משנת:** ${gso.entity.foundingYear}`);
  if (gso.entity.areaServed.length) L.push(`- **אזורי שירות:** ${gso.entity.areaServed.join(', ')}`);
  L.push(`- **כתובת:** ${dna.identity.address}`);
  L.push(`- **טלפון:** ${dna.identity.phone}`);
  L.push(`- **אימייל:** ${dna.identity.email}`);
  L.push(`- **שעות:** ${dna.identity.hours}`);
  L.push(`- **נגישות:** ${dna.accessibility.standard} ברמה ${dna.accessibility.level}`);
  L.push('');

  if (gso.llms.topics.length) {
    L.push('## נושאים');
    L.push('');
    for (const t of gso.llms.topics) L.push(`- ${t}`);
    L.push('');
  }

  // התשובות לפני הקישורים: זה החלק שמודל מצטט ממנו בפועל.
  if (gso.answers.length) {
    L.push('## שאלות ותשובות');
    L.push('');
    for (const a of gso.answers) {
      L.push(`### ${a.q}`);
      L.push('');
      L.push(a.a);
      L.push('');
    }
  }

  if (data.services.length) {
    L.push('## שירותים');
    L.push('');
    for (const s of data.services) {
      L.push(`- [${s.title}](${absolute(dna, `/services/${s.id}`)}): ${s.summary}`);
    }
    L.push('');
  }

  if (data.posts.length) {
    L.push('## מאמרים');
    L.push('');
    for (const p of data.posts) {
      const suffix = p.excerpt ? `: ${p.excerpt}` : '';
      L.push(`- [${p.title}](${absolute(dna, `/blog/${p.slug}`)})${suffix}`);
    }
    L.push('');
  }

  L.push('## עמודים');
  L.push('');
  for (const page of data.pages) L.push(`- [${page.label}](${absolute(dna, page.href)})`);
  L.push('');

  L.push('## שימוש');
  L.push('');
  L.push(
    gso.crawlers === 'allow'
      ? 'ציטוט התוכן מותר בתנאי שמצוין שם העסק וקישור לעמוד המקור.'
      : 'התוכן אינו מורשה לאימון או לציטוט. ראו robots.txt.',
  );
  L.push('');

  return L.join('\n');
}
