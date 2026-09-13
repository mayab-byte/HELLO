/**
 * ██  אכיפת GSO ונגישות — רץ בכל בנייה  ██
 *
 * הבעיה שהסקריפט הזה פותר: תשתית תבנית היא הבטחה, לא ערובה. אפשר לכתוב
 * את כל הכלים הכי טובים לגזירת schema.org ול-llms.txt, ומי שישכפל את
 * המאגר עדיין ישאיר את הפלייסהולדרים, ימחק את סקשן השאלות, יוסיף עמוד
 * בלי canonical, או יוריד את תפריט הנגישות "כי הוא מפריע לעיצוב".
 *
 * הפתרון הוא אותו עיקרון של check-dna.mjs: להפוך את זה לכשל בנייה.
 * אתר שלא עומד בעקרונות פשוט לא נבנה.
 *
 * ── שני מצבים ──────────────────────────────────────────────────────
 *
 *   תבנית  (dna.meta.client עדיין 'אתר דוגמה')  → אזהרות, הבנייה עוברת
 *   לקוח   (client הוחלף בשם אמיתי)             → כשלים, הבנייה נופלת
 *
 * כך המאגר-אב נבנה כמו שהוא, והשער נסגר ברגע שמישהו הופך אותו לאתר
 * לקוח — כלומר בדיוק ברגע הנכון.
 *
 *   GSO_STRICT=1  כופה מצב לקוח (שימושי ב-CI על התבנית עצמה)
 *   GSO_STRICT=0  מכבה את השער. פתח חירום, לא דרך עבודה.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

// ───────────────────────── קריאת ה-DNA ─────────────────────────

/**
 * חילוץ אובייקט ה-DNA מ-dna.ts בלי להריץ TypeScript.
 *
 * לא regex: התוכן מכיל סוגריים מסולסלים בתוך מחרוזות עברית, ו-regex
 * היה נשבר עליהם בשקט. במקום זה סורק תווים עם מודעות למחרוזות
 * ולהערות, מוצא את גבולות האובייקט, ומעריך אותו כליטרל.
 * הבלוק הוא נתונים טהורים ולכן ההערכה בטוחה וצפויה.
 */
function readDna() {
  const src = read('dna.ts');
  const start = src.indexOf('{', src.indexOf('export const dna'));
  if (start < 0) throw new Error('לא נמצא האובייקט dna ב-dna.ts');

  let depth = 0;
  let quote = null;
  let end = -1;

  for (let i = start; i < src.length; i++) {
    const c = src[i];
    const prev = src[i - 1];

    if (quote) {
      if (c === quote && prev !== '\\') quote = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; continue; }
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i < 0) break; continue; }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i) + 1; continue; }

    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = i; break; } }
  }

  if (end < 0) throw new Error('האובייקט dna ב-dna.ts אינו סגור כראוי');
  return new Function(`return (${src.slice(start, end + 1)});`)();
}

const dna = readDna();

// ───────────────────────── צבירת ממצאים ─────────────────────────

const problems = [];
const notes = [];

/** כלל שנכשל. ⓘ רמז לתיקון — כי "נכשל" בלי "מה לעשות" הוא רק תסכול. */
const fail = (area, message, hint) => problems.push({ area, message, hint });
const note = (message) => notes.push(message);

const PLACEHOLDERS = [
  'שם העסק', 'אתר דוגמה', 'example.co.il', 'example.com',
  '000000000', '03-0000000', 'שם רכז הנגישות', 'מערכת שם העסק',
];

const isPlaceholder = (v) =>
  typeof v === 'string' && PLACEHOLDERS.some((p) => v.includes(p));

// ───────────────────────── 1. הישות ─────────────────────────

const { gso, seo, identity, accessibility } = dna;

if (!/^https:\/\//.test(seo.siteUrl)) {
  fail('ישות', 'seo.siteUrl חייב להיות https.', 'JSON-LD עם כתובת לא מאובטחת נפסל אצל חלק מהצרכנים.');
}
if (isPlaceholder(seo.siteUrl)) {
  fail('ישות', 'seo.siteUrl עדיין כתובת דוגמה.', 'כל ה-@id, ה-canonical וה-sitemap נגזרים ממנה.');
}

const descLen = (seo.description || '').length;
if (descLen < 70 || descLen > 160) {
  fail('ישות', `seo.description באורך ${descLen} תווים (נדרש 70 עד 160).`,
       'קצר מדי לא נותן למודל על מה האתר; ארוך מדי נחתך בתצוגה.');
}

const ENTITY_TYPES = ['Organization', 'LocalBusiness', 'ProfessionalService'];
if (!ENTITY_TYPES.includes(gso.entity.type)) {
  fail('ישות', `gso.entity.type לא חוקי: ${gso.entity.type}.`, `מותר: ${ENTITY_TYPES.join(', ')}.`);
}

// עסק עם מיקום פיזי בלי קואורדינטות לא ייכנס לתוצאות מקומיות.
if (gso.entity.type !== 'Organization' && !gso.entity.geo) {
  fail('ישות', `gso.entity.geo חסר, ו-${gso.entity.type} הוא ישות עם מיקום פיזי.`,
       'בלי קואורדינטות אין הופעה בחיפוש מקומי ובמפות.');
}
if (gso.entity.geo) {
  const { lat, lng } = gso.entity.geo;
  if (typeof lat !== 'number' || typeof lng !== 'number' || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    fail('ישות', 'gso.entity.geo מכיל קואורדינטות לא חוקיות.', 'lat בין ‎-90 ל-90, lng בין ‎-180 ל-180.');
  }
}

for (const [field, label] of [
  ['legalName', 'identity.legalName'],
  ['phone', 'identity.phone'],
  ['email', 'identity.email'],
  ['address', 'identity.address'],
]) {
  if (isPlaceholder(identity[field])) {
    fail('ישות', `${label} עדיין ערך דוגמה.`, 'הפרטים האלה נכנסים ישירות ל-JSON-LD ול-llms.txt.');
  }
}

// sameAs — מקור ראשון gso.entity.sameAs, נפילה אחורה ל-identity.social
const links = [
  ...gso.entity.sameAs,
  ...identity.social.map((s) => s.href),
].filter((u) => /^https?:\/\//.test(u));

if (links.length === 0) {
  fail('ישות', 'אין אף פרופיל מאמת ב-sameAs.',
       'למלא כתובות מלאות ב-identity.social או ב-gso.entity.sameAs. פרופיל חיצוני הוא מה שמאשר שהעסק אמיתי.');
}

// שעות פתיחה קריאות-מכונה
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

if (gso.hours.length === 0) {
  note('gso.hours ריק — שעות הפתיחה לא יפורסמו בצורה קריאה למכונה.');
}
for (const [i, h] of gso.hours.entries()) {
  if (!Array.isArray(h.days) || h.days.length === 0 || h.days.some((d) => !DAYS.includes(d))) {
    fail('ישות', `gso.hours[${i}].days מכיל קוד יום לא חוקי.`, `מותר: ${DAYS.join(', ')}.`);
  }
  if (!TIME.test(h.opens) || !TIME.test(h.closes)) {
    fail('ישות', `gso.hours[${i}] מכיל שעה לא חוקית.`, 'הפורמט הוא HH:MM בשעון 24.');
  }
}

// ───────────────────────── 2. התשובות ─────────────────────────
// זה הלב. בלי תשובות מפורשות אין מה לצטט, וכל שאר הסימון הוא קישוט.

const MIN_ANSWERS = 5;
const MIN_ANSWER_CHARS = 120;

if (gso.answers.length < MIN_ANSWERS) {
  fail('תשובות', `יש ${gso.answers.length} שאלות ותשובות, נדרשות ${MIN_ANSWERS} לפחות.`,
       'זה הרכיב שמנוע גנרטיבי מצטט בפועל. פחות מזה לא מכסה את מה שגולש באמת שואל.');
}

const seen = new Set();
for (const [i, a] of gso.answers.entries()) {
  const q = (a.q || '').trim();
  const ans = (a.a || '').trim();

  if (q.length < 10) {
    fail('תשובות', `gso.answers[${i}].q קצרה מדי.`, 'שאלה צריכה להיות מנוסחת כפי שגולש באמת ישאל אותה.');
  } else if (!q.endsWith('?')) {
    fail('תשובות', `gso.answers[${i}].q אינה מסתיימת בסימן שאלה: "${q.slice(0, 40)}…"`,
         'FAQPage מצפה לשאלה, לא לכותרת.');
  }

  if (ans.length < MIN_ANSWER_CHARS) {
    fail('תשובות', `gso.answers[${i}].a באורך ${ans.length} תווים (נדרש ${MIN_ANSWER_CHARS}).`,
         'תשובה בת שורה אחת לא מספקת למודל מספיק חומר לצטט. מספרים, טווחים ותנאים הם מה שנבחר.');
  }

  const key = q.toLowerCase();
  if (seen.has(key)) fail('תשובות', `השאלה "${q.slice(0, 40)}…" מופיעה פעמיים.`);
  seen.add(key);
}

if (!dna.sections.faq) {
  fail('תשובות', 'הסקשן faq כבוי ב-dna.sections.',
       'כיבוי הסקשן מסיר את עמוד השאלות ואת ה-FAQPage, ואיתם את עיקר ה-GSO.');
}

// ───────────────────────── 3. llms.txt ─────────────────────────

if (gso.llms.enabled) {
  if ((gso.llms.summary || '').length < 40) {
    fail('llms', 'gso.llms.summary קצר מדי.', 'זה המשפט שמודל קורא ראשון. צריך לומר מי העסק ובמה הוא עוסק.');
  }
  if (gso.llms.topics.length < 2) {
    fail('llms', 'gso.llms.topics מכיל פחות משני נושאים.', 'הנושאים הם מה שהאתר מתיימר להיות מקור עליו.');
  }
} else {
  note('gso.llms.enabled כבוי — הקובץ /llms.txt לא ייווצר.');
}

if (!['allow', 'block'].includes(gso.crawlers)) {
  fail('llms', `gso.crawlers חייב להיות 'allow' או 'block' (התקבל: ${gso.crawlers}).`);
}

// ───────────────────────── 4. המחבר ─────────────────────────

if (isPlaceholder(gso.author.name)) {
  fail('מחבר', 'gso.author.name עדיין ערך דוגמה.',
       'מחבר מזוהה נשקל מעל תוכן אנונימי, וזו החתימה על כל מאמר באתר.');
}
if (!gso.author.url.startsWith('/')) {
  fail('מחבר', 'gso.author.url חייב להיות נתיב פנימי שמתחיל ב-/.', 'למשל /about.');
}

// ───────────────────────── 5. נגישות ─────────────────────────
// חובה חוקית בישראל, ולכן נאכפת באותה חומרה כמו השאר.

const REQUIRED_PAGES = [
  ['app/(site)/accessibility/page.tsx', '/accessibility', 'הצהרת נגישות'],
  ['app/(site)/privacy/page.tsx', '/privacy', 'מדיניות פרטיות'],
  ['app/(site)/terms/page.tsx', '/terms', 'תנאי שימוש'],
];

for (const [file, href, label] of REQUIRED_PAGES) {
  if (!exists(file)) {
    fail('נגישות', `עמוד ${label} נמחק (${file}).`, 'שלושת המסמכים האלה חייבים להתקיים בכל אתר.');
  }
  if (!dna.legalLinks.some((l) => l.href === href)) {
    fail('נגישות', `אין קישור ל-${href} ב-dna.legalLinks.`,
         `העמוד קיים אך לא נגיש מהפוטר, ולכן מבחינת גולש הוא לא קיים.`);
  }
}

// תפריט הנגישות חייב להיות מורכב בלייאאוט של האתר הציבורי.
const siteLayout = exists('app/(site)/layout.tsx') ? read('app/(site)/layout.tsx') : '';
if (!/<AccessibilityMenu\s*\/>/.test(siteLayout)) {
  fail('נגישות', 'תפריט הנגישות אינו מורכב ב-app/(site)/layout.tsx.',
       'להחזיר את <AccessibilityMenu /> למעטפת. זו חובה חוקית, לא בחירה עיצובית.');
}
if (!exists('components/site/AccessibilityMenu.tsx')) {
  fail('נגישות', 'components/site/AccessibilityMenu.tsx נמחק.');
}

for (const [field, label] of [['name', 'שם'], ['email', 'אימייל'], ['phone', 'טלפון']]) {
  if (isPlaceholder(accessibility.coordinator[field])) {
    fail('נגישות', `${label} רכז הנגישות עדיין ערך דוגמה.`,
         'הצהרת נגישות בלי פרטי רכז אמיתיים אינה עומדת בדרישות התקנות.');
  }
}

if (accessibility.level !== 'AA' && accessibility.level !== 'AAA') {
  fail('נגישות', `accessibility.level הוא ${accessibility.level}.`, 'הדרישה בישראל היא AA לפחות.');
}

// ───────────────────────── 6. מבנה האתר ─────────────────────────
/**
 * ★ הבדיקה שמחזיקה גם באתר שעוד לא נכתב.
 *
 * כל שאר הכללים בודקים ערכים שאנחנו מכירים. כאן סורקים את עץ הקבצים
 * בפועל, ולכן עמוד שמישהו יוסיף בעוד שנה לאתר שאנחנו לא מכירים ייתפס
 * באותה מידה. זה ההבדל בין "התבנית תומכת ב-GSO" לבין "האתר אוכף אותו".
 */
function sitePages(dir = 'app/(site)') {
  const out = [];
  const walk = (rel) => {
    for (const entry of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
      const child = `${rel}/${entry.name}`;
      if (entry.isDirectory()) walk(child);
      else if (entry.name === 'page.tsx') out.push(child);
    }
  };
  if (exists(dir)) walk(dir);
  return out;
}

for (const page of sitePages()) {
  const src = read(page);
  const hasMeta = /export (const metadata|async function generateMetadata)/.test(src);

  if (!hasMeta) {
    fail('מבנה', `${page} אינו מייצא metadata.`,
         'עמוד בלי כותרת ותיאור לא ייבחר כמקור. להוסיף pageMeta(dna, { … }).');
    continue;
  }

  // canonical מגיע רק דרך pageMeta. trailingSlash יחד עם נתיבים בעברית
  // מייצר בקלות כמה כתובות לאותו תוכן, והמודל מפצל ביניהן את הסמכות.
  if (!src.includes('pageMeta(')) {
    fail('מבנה', `${page} בונה metadata בלי pageMeta ולכן בלי canonical.`,
         "להחליף ל-pageMeta(dna, { title, description, path }) מ-@/lib/gso.");
  }
}

// הרכיבים שמייצרים את הסימון חייבים להישאר מחוברים.
const rootLayout = exists('app/layout.tsx') ? read('app/layout.tsx') : '';
if (!/siteGraph\(/.test(rootLayout)) {
  fail('מבנה', 'app/layout.tsx אינו מזריק את siteGraph().',
       'בלעדיו אין ישות מרכזית, וכל שאר הסימונים מצביעים לעוגן שלא קיים.');
}

const homePage = exists('app/(site)/page.tsx') ? read('app/(site)/page.tsx') : '';
if (!/<Faq\b/.test(homePage)) {
  fail('מבנה', 'סקשן השאלות אינו מוצג בעמוד הבית.',
       'להחזיר <Faq /> ל-app/(site)/page.tsx.');
}

if (!exists('app/llms.txt/route.ts') && gso.llms.enabled) {
  fail('מבנה', 'app/llms.txt/route.ts נמחק אך gso.llms.enabled פעיל.');
}

// ───────────────────────── דוח ─────────────────────────

const isTemplate = dna.meta.client === 'אתר דוגמה';
const override = process.env.GSO_STRICT;
const strict = override === '1' ? true : override === '0' ? false : !isTemplate;

console.log(`\nבדיקת GSO ונגישות — ${strict ? 'מצב לקוח (חוסם בנייה)' : 'מצב תבנית (אזהרות בלבד)'}\n`);

for (const n of notes) console.log(`  ⓘ  ${n}`);
if (notes.length) console.log('');

if (problems.length === 0) {
  console.log('  ✓ כל הכללים עוברים.\n');
  process.exit(0);
}

let area = null;
for (const p of problems) {
  if (p.area !== area) { area = p.area; console.log(`  ── ${area} ──`); }
  console.log(`  ${strict ? '✗' : '⚠'} ${p.message}`);
  if (p.hint) console.log(`      ↳ ${p.hint}`);
}

console.log('');

if (!strict) {
  console.log(`  ${problems.length} ממצאים. הבנייה ממשיכה כי dna.meta.client עדיין 'אתר דוגמה'.`);
  console.log('  ברגע שתחליפו אותו בשם לקוח אמיתי, הממצאים האלה יפילו את הבנייה.\n');
  process.exit(0);
}

console.error(`✗ ${problems.length} כללי GSO ונגישות נכשלו. ראו docs/GSO.md.\n`);
process.exit(1);
