/**
 * אפיית Design Studio → תוצר פרודקשן נקי.
 *
 * רץ אחרי `next build` (ייצוא סטטי ל-out/) ומחיל את studio/overrides.json על התוצר:
 *   • סגנונות  → בלוק CSS נקי, בלי !important, ב-media query לכל מסך,
 *                מוזרק אחרון ב-<head> כדי לנצח בקסקדה.
 *   • טקסטים   → מוחלים על ה-HTML עצמו. אין החלפה בזמן ריצה.
 *   • הסתרה    → מוסתר בכל שלושת המסכים = האלמנט נמחק פיזית מה-HTML.
 *                מוסתר בחלק מהמסכים = display:none ב-media query הרלוונטי בלבד.
 *   • פונטים   → <link> ל-Google Fonts נכנס ל-<head>.
 *
 * קבצי המקור לא משתנים. מערכת העורך, ה-JSON ולוגיקת ההזרקה לא עולים לפרודקשן.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { bakeFlight } from './flight.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'out');
const FILE = path.join(ROOT, 'studio', 'overrides.json');

const SCREENS = ['desktop', 'tablet', 'mobile'];
const MEDIA = {
  desktop: '(min-width: 1025px)',
  tablet: '(min-width: 768px) and (max-width: 1024px)',
  mobile: '(max-width: 767px)',
};

const log = (...a) => console.log('[bake]', ...a);

async function loadOverrides() {
  try {
    const raw = JSON.parse(await fs.readFile(FILE, 'utf8'));
    return {
      text: raw.text ?? {},
      fonts: raw.fonts ?? [],
      screens: Object.fromEntries(SCREENS.map((k) => [k, {
        styles: raw.screens?.[k]?.styles ?? {},
        hidden: raw.screens?.[k]?.hidden ?? [],
      }])),
    };
  } catch {
    return null;
  }
}

async function htmlFiles(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await htmlFiles(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

/** סלקטורים שמוסתרים בכל שלושת המסכים → נמחקים פיזית. */
function fullyHidden(ov) {
  const [a, b, c] = SCREENS.map((k) => new Set(ov.screens[k].hidden));
  return [...a].filter((s) => b.has(s) && c.has(s));
}

function buildCss(ov, removed) {
  const gone = new Set(removed);
  const blocks = [];

  for (const key of SCREENS) {
    const { styles, hidden } = ov.screens[key];
    const rules = [];

    for (const [sel, props] of Object.entries(styles)) {
      if (gone.has(sel)) continue; // האלמנט כבר לא קיים בתוצר
      const decls = Object.entries(props)
        .filter(([p, v]) => v !== '' && v != null && !p.startsWith('--ds-'))
        .map(([p, v]) => `    ${p}: ${String(v).replace(/\s*!important\s*/gi, '').trim()};`)
        .join('\n');
      if (decls) rules.push(`  ${sel} {\n${decls}\n  }`);
    }

    // הסתרה חלקית בלבד — מלאה כבר נמחקה מה-HTML
    for (const sel of hidden) {
      if (gone.has(sel)) continue;
      rules.push(`  ${sel} { display: none; }`);
    }

    if (rules.length) blocks.push(`@media ${MEDIA[key]} {\n${rules.join('\n')}\n}`);
  }

  return blocks.join('\n\n');
}

function fontLink(fonts) {
  if (!fonts.length) return '';
  const q = fonts
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@300;400;500;600;700;800`)
    .join('&');
  return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${q}&display=swap"data-studio-baked>`;
}

/** חתימה שמזהה את האלמנט גם ב-HTML וגם ב-RSC flight payload. */
function signature(el) {
  return {
    tag: el.tagName.toLowerCase(),
    id: el.getAttribute('id') || '',
    className: el.getAttribute('class') || '',
  };
}

/**
 * החלת טקסטים ומחיקת אלמנטים — גם על ה-HTML וגם על ה-flight payload.
 * ה-DOM נבנה בזיכרון עם linkedom; בלעדיו מדלגים ומדווחים, במקום לנחש
 * עם regex ולשבור את ה-markup.
 */
async function transformDom(html, ov, removed) {
  let parseHTML;
  try { ({ parseHTML } = await import('linkedom')); }
  catch { return { html, applied: 0, deleted: 0, skipped: true, warnings: [] }; }

  const { document } = parseHTML(html);
  const removals = [];
  const texts = [];
  let applied = 0;
  let deleted = 0;

  for (const sel of removed) {
    for (const el of document.querySelectorAll(sel)) {
      removals.push({ sig: signature(el), selector: sel });
      el.remove();
      deleted++;
    }
  }

  for (const [sel, inner] of Object.entries(ov.text)) {
    const el = document.querySelector(sel);
    if (!el) continue;
    texts.push({ sig: signature(el), selector: sel, html: inner });
    el.innerHTML = inner;
    applied++;
  }

  // אותה עריכה חייבת לחול גם על ה-flight payload, אחרת ההידרציה תבטל אותה.
  const flight = bakeFlight(document.toString(), removals, texts);

  return { html: flight.html, applied, deleted, skipped: false, warnings: flight.warnings };
}

async function main() {
  const ov = await loadOverrides();
  if (!ov) { log('אין studio/overrides.json — התוצר נשאר כמו שהוא.'); return; }

  try { await fs.access(OUT); }
  catch { log(`לא נמצאה תיקיית ${path.relative(ROOT, OUT)} — הרץ קודם next build.`); process.exitCode = 1; return; }

  const removed = fullyHidden(ov);
  const css = buildCss(ov, removed);
  const link = fontLink(ov.fonts);

  if (!css && !link && !Object.keys(ov.text).length && !removed.length) {
    log('אין עריכות לאפות.');
    return;
  }

  const styleTag = css ? `<style data-studio-baked>\n${css}\n</style>` : '';
  const files = await htmlFiles(OUT);
  let totalText = 0, totalDeleted = 0, skipped = false;
  const warnings = [];

  for (const file of files) {
    let html = await fs.readFile(file, 'utf8');
    // הרצה חוזרת של bake על אותו תוצר לא תכפיל את ההזרקה.
    html = html
      .replace(/<style data-studio-baked>[\s\S]*?<\/style>/g, '')
      .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=[^"]*"data-studio-baked>/g, '');
    const r = await transformDom(html, ov, removed);
    html = r.html;
    totalText += r.applied;
    totalDeleted += r.deleted;
    skipped ||= r.skipped;
    warnings.push(...r.warnings);

    // הבלוק האפוי נכנס אחרון ב-head — מנצח בקסקדה בלי !important.
    const inject = `${link}${styleTag}`;
    if (inject) {
      html = html.includes('</head>')
        ? html.replace('</head>', `${inject}</head>`)
        : `${inject}${html}`;
    }
    await fs.writeFile(file, html, 'utf8');
  }

  log(`${files.length} קבצי HTML עודכנו.`);
  if (css) log(`CSS אפוי: ${css.split('\n').length} שורות, בלי !important.`);
  if (removed.length) log(`נמחקו פיזית: ${totalDeleted} אלמנטים (${removed.length} סלקטורים מוסתרים בכל המסכים).`);
  if (totalText) log(`טקסטים שהוחלו: ${totalText}.`);
  if (ov.fonts.length) log(`פונטים: ${ov.fonts.join(', ')}.`);
  for (const w of [...new Set(warnings)]) log('⚠', w);
  if (skipped) {
    log('⚠ linkedom לא מותקן — טקסטים ומחיקות לא הוחלו. הרץ: npm i -D linkedom');
    if (Object.keys(ov.text).length || removed.length) process.exitCode = 1;
  }
}

main();
