import path from 'node:path';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/**
 * הקונפיג נקבע לפי phase ולא לפי NODE_ENV — Next טוען את הקובץ לפני
 * שהוא קובע את NODE_ENV, ולכן בדיקת NODE_ENV כאן לא אמינה.
 */
export default function config(phase) {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const studioDir = path.join(import.meta.dirname, 'studio');

  // תת-נתיב לאירוח שאינו בשורש הדומיין (GitHub Pages תחת /REPO/, למשל).
  // ריק כברירת מחדל — פריסה רגילה של לקוח יושבת בשורש.
  const basePath = (process.env.BASE_PATH || '').replace(/\/$/, '');
  const stub = path.join(studioDir, 'boot.prod.ts');

  /** @type {import('next').NextConfig} */
  return {
    // האתר דורש שרת: מערכת הניהול קוראת cookies() והטופס משתמש ב-Server Action,
    // ושניהם אינם נתמכים בייצוא סטטי. הפריסה היא לשרת Node (Vercel).
    images: { unoptimized: true },
    trailingSlash: true,
    ...(basePath ? { basePath, assetPrefix: basePath } : {}),

    // דגל זמן־ריצה. שכבת הגנה שנייה בלבד — ההסרה בפועל היא בהחלפת המודול שלמטה.
    env: {
      NEXT_PUBLIC_STUDIO: isDev ? '1' : '0',
      NEXT_PUBLIC_BASE_PATH: basePath,
    },

    ...(isDev
      ? {
          // trailingSlash מייצר 308 על /api/studio/* ושובר את ה-rewrite.
          // בפיתוח מבטלים את ההפניה האוטומטית; הייצוא הסטטי לא מושפע.
          skipTrailingSlashRedirect: true,

          // בפיתוח בלבד: מפנה את קריאות הסטודיו לשרת ה-Node הקטן.
          async rewrites() {
            const target = `http://localhost:${process.env.STUDIO_PORT || 4321}`;
            return [{ source: '/api/studio/:path*', destination: `${target}/api/studio/:path*` }];
          },
        }
      : {
          /**
           * בפרודקשן: מחליפים את studio/boot בגרסה ריקה.
           * boot הוא הצומת היחיד שדרכו נטענת כל מערכת העורך, ולכן ההחלפה
           * מנתקת את כל תיקיית studio/ מגרף התלויות והיא לא מגיעה לתוצר.
           * ההחלפה נעשית על מודול פנימי ולא על גבול ה-'use client', כי החלפת
           * גבול client שוברת את ה-React Client Manifest.
           * ההחלפה נעשית על ה-request ('./boot') ומוגבלת לקבצים שבתוך studio/,
           * כדי לא לגעת בשום מודול אחר בפרויקט.
           */
          webpack(cfg, { webpack }) {
            cfg.plugins.push(
              new webpack.NormalModuleReplacementPlugin(/^\.\/boot$/, (res) => {
                if (!res.context || !res.context.startsWith(studioDir)) return;
                res.request = stub;
              }),
            );
            return cfg;
          },
        }),
  };
}
