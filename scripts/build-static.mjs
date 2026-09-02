/**
 * תצלום סטטי של האתר הציבורי, לתצוגה מקדימה ב-GitHub Pages.
 *
 * מערכת הניהול דורשת שרת ולכן אינה יכולה להיכלל בייצוא סטטי — Next נכשל
 * על כל עמוד שקורא cookies(). לכן תיקיית app/admin מוזזת הצידה למשך
 * הבנייה בלבד ומוחזרת מיד אחריה, גם אם הבנייה נכשלה.
 *
 * התוצר הוא תצלום: התוכן מגיע מ-content/site.ts, לא מהמסד, ואין בו
 * מערכת ניהול. הפרודקשן האמיתי רץ על שרת (Vercel) עם `npm run build`.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ADMIN = path.join(ROOT, 'app', 'admin');
const PARKED = path.join(ROOT, '.admin-parked');

const run = (cmd, args, env = {}) =>
  spawnSync(cmd, args, { stdio: 'inherit', cwd: ROOT, env: { ...process.env, ...env } }).status ?? 1;

let moved = false;
try {
  if (fs.existsSync(ADMIN)) {
    fs.rmSync(PARKED, { recursive: true, force: true });
    fs.renameSync(ADMIN, PARKED);
    moved = true;
    console.log('[static] מערכת הניהול הוצאה מהבנייה הסטטית.');
  }

  if (run('node', ['scripts/check-dna.mjs'])) process.exit(1);
  if (run('npx', ['next', 'build'], { STATIC_EXPORT: '1' })) process.exit(1);
} finally {
  if (moved) {
    fs.rmSync(ADMIN, { recursive: true, force: true });
    fs.renameSync(PARKED, ADMIN);
    console.log('[static] מערכת הניהול הוחזרה למקומה.');
  }
}

// אפיית הפתקים של Design Studio על התוצר
if (run('node', ['scripts/bake.mjs'])) process.exit(1);
