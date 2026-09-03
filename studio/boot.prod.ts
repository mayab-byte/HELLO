import type { ComponentType } from 'react';

/**
 * תחליף הפרודקשן של boot(). ה-bundler ממפה אליו את './boot' (ראה next.config.mjs),
 * ולכן שום קובץ אחר מתיקיית studio/ לא מגיע לתוצר. הפונקציה לעולם לא נקראת —
 * הדגל NEXT_PUBLIC_STUDIO כבוי — והיא כאן רק כדי שהייבוא יישאר תקין.
 */
export async function boot(_mount: (Panel: ComponentType) => void) {}
