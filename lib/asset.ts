/**
 * נתיב לנכס סטטי, מודע ל-basePath.
 *
 * Next מוסיף basePath אוטומטית ל-<Link> ול-next/image, אבל **לא** ל-src של
 * תג <img> רגיל או לכל נתיב שנכתב ידנית. כשהאתר מתארח בתת-נתיב
 * (למשל GitHub Pages תחת /HELLO/) כל הנתיבים האלה נשברים בלי העטיפה הזו.
 *
 * בפריסה לשורש הדומיין — המצב הרגיל אצל לקוח — BASE_PATH ריק והפונקציה
 * מחזירה את הנתיב כמו שהוא.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function asset(p: string): string {
  if (/^(https?:|data:|mailto:|tel:|#)/.test(p)) return p;
  return `${BASE_PATH}${p}`;
}
