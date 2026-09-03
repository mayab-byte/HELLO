/**
 * אפיית Design Studio → קובץ CSS נקי שהאפליקציה מייבאת.
 *
 * בפיתוח הפתקים מוזרקים חיים עם `!important` כדי לנצח את ה-CSS הבסיסי.
 * כאן הם מומרים ל-CSS רגיל, ממודר ל-media query לכל מסך, **בלי `!important`**,
 * לקובץ שנטען אחרון ולכן מנצח בקסקדה בדרך הרגילה.
 *
 * הסקריפט רץ אוטומטית לפני כל בנייה (prebuild). התוצר, app/studio-baked.css,
 * נוצר תמיד — גם ריק — כדי שהייבוא בלייאאוט לעולם לא יישבר.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'studio', 'overrides.json');
const OUT = path.join(ROOT, 'app', 'studio-baked.css');

const SCREENS = ['desktop', 'tablet', 'mobile'];
const MEDIA = {
  desktop: '(min-width: 1025px)',
  tablet: '(min-width: 768px) and (max-width: 1024px)',
  mobile: '(max-width: 767px)',
};

const HEADER = `/* נוצר אוטומטית מ-studio/overrides.json — אין לערוך ידנית.
   מקור: Design Studio. מיוצר מחדש בכל בנייה (scripts/bake.mjs). */\n`;

async function main() {
  let ov;
  try {
    ov = JSON.parse(await fs.readFile(SRC, 'utf8'));
  } catch {
    await fs.writeFile(OUT, `${HEADER}/* אין פתקים. */\n`, 'utf8');
    console.log('[bake] אין studio/overrides.json — נוצר קובץ ריק.');
    return;
  }

  const blocks = [];
  let rules = 0;

  for (const key of SCREENS) {
    const layer = ov.screens?.[key] ?? { styles: {}, hidden: [] };
    const out = [];

    for (const [sel, props] of Object.entries(layer.styles ?? {})) {
      const decls = Object.entries(props)
        .filter(([p, v]) => v !== '' && v != null && !p.startsWith('--ds-'))
        .map(([p, v]) => `    ${p}: ${String(v).replace(/\s*!important\s*/gi, '').trim()};`)
        .join('\n');
      if (decls) { out.push(`  ${sel} {\n${decls}\n  }`); rules++; }
    }

    for (const sel of layer.hidden ?? []) {
      out.push(`  ${sel} { display: none; }`);
      rules++;
    }

    if (out.length) blocks.push(`@media ${MEDIA[key]} {\n${out.join('\n')}\n}`);
  }

  const fonts = ov.fonts?.length
    ? `@import url('https://fonts.googleapis.com/css2?${ov.fonts
        .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@300;400;500;600;700;800`)
        .join('&')}&display=swap');\n\n`
    : '';

  await fs.writeFile(OUT, HEADER + fonts + (blocks.join('\n\n') || '/* אין פתקים. */') + '\n', 'utf8');
  console.log(`[bake] ${rules} כללים אפויים${ov.fonts?.length ? `, ${ov.fonts.length} פונטים` : ''}.`);

  if (Object.keys(ov.text ?? {}).length) {
    console.log('[bake] ⚠ קובץ הפתקים מכיל עריכות טקסט שלא נאפות.');
    console.log('[bake]   עריכת נוסח נעשית במערכת הניהול, לא ב-Design Studio.');
  }
}

main();
