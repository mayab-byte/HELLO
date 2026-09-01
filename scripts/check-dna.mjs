/**
 * אימות קובץ ה-DNA מול תקן AA — רץ בכל בנייה.
 *
 * כשמחליפים פלטה ללקוח חדש קל מאוד לשבור ניגודיות בלי לשים לב,
 * ואז האתר עולה לאוויר לא נגיש. הסקריפט הזה הופך את זה לכשל בנייה
 * במקום לממצא בביקורת חודשיים אחר כך.
 *
 * WCAG 2.1: 4.5:1 לטקסט רגיל, 3:1 לטקסט גדול ולרכיבי ממשק.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

// ── חילוץ הפלטה מ-dna.ts בלי להריץ TypeScript ──
function readColors() {
  const src = fs.readFileSync(path.join(ROOT, 'dna.ts'), 'utf8');
  const block = /colors:\s*\{([\s\S]*?)\n    \}/.exec(src);
  if (!block) throw new Error('לא נמצא בלוק colors ב-dna.ts');
  const out = {};
  for (const m of block[1].matchAll(/(\w+)\s*:\s*'(#[0-9a-fA-F]{3,8})'/g)) out[m[1]] = m[2];
  return out;
}

// ── יחס ניגודיות לפי WCAG ──
function luminance(hex) {
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

const c = readColors();

/** [שם, טקסט, רקע, מינימום נדרש] */
const checks = [
  ['טקסט רגיל על הרקע',            c.text,        c.bg,        4.5],
  ['טקסט רגיל על רקע משני',        c.text,        c.bgAlt,     4.5],
  ['טקסט רגיל על משטח',            c.text,        c.surface,   4.5],
  ['טקסט מעומעם על הרקע',          c.textMuted,   c.bg,        4.5],
  ['טקסט מעומעם על רקע משני',      c.textMuted,   c.bgAlt,     4.5],
  ['טקסט על צבע המותג',            c.textOnBrand, c.brand,     4.5],
  ['טקסט על מותג כהה',             c.textOnBrand, c.brandStrong, 4.5],
  ['מותג כהה על מותג בהיר',        c.brandStrong, c.brandSoft, 4.5],
  ['הודעת שגיאה על משטח',          c.error,       c.surface,   4.5],
  ['הודעת הצלחה על משטח',          c.success,     c.surface,   4.5],
  // רכיבי ממשק וגבולות — סף 3:1
  ['צבע המותג על הרקע (רכיב)',     c.brand,       c.bg,        3],
  ['חיווי פוקוס על הרקע',          c.focus,       c.bg,        3],
  ['חיווי פוקוס על רקע משני',      c.focus,       c.bgAlt,     3],
  ['פוקוס בהיר על מותג כהה',       c.focusOnDark, c.brandStrong, 3],
  ['פוקוס בהיר על הפוטר',          c.focusOnDark, c.text,        3],
  ['פוקוס רגיל בתוך הטופס',        c.focus,       c.surface,     3],
];

let failed = 0;
console.log(`\nבדיקת ניגודיות — תקן AA (${checks.length} צמדים)\n`);

for (const [name, fg, bg, min] of checks) {
  if (!fg || !bg) { console.log(`  ⚠  ${name}: חסר צבע ב-DNA`); failed++; continue; }
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(
    `  ${ok ? '✓' : '✗'} ${name.padEnd(28)} ${r.toFixed(2)}:1  (נדרש ${min}:1)  ${fg} על ${bg}`,
  );
}

if (failed) {
  console.error(`\n✗ ${failed} צמדי צבעים נכשלו. יש לתקן את הפלטה ב-dna.ts.\n`);
  process.exit(1);
}
console.log('\n✓ הפלטה עומדת בתקן AA.\n');
