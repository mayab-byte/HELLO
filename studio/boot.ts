import type { ComponentType } from 'react';
import { applyAll } from './apply';
import { emptyOverrides } from './types';

/**
 * אתחול Design Studio בפיתוח.
 *
 * 1. מחיל תמיד את ה-overrides שכבר פורסמו — גם בלי `?edit`, כדי שתראה
 *    את מה שסגרת בזמן שאתה עובד על הקוד.
 * 2. טוען את פאנל העורך רק כשיש `?edit` בכתובת.
 */
export async function boot(mount: (Panel: ComponentType) => void) {
  let published = emptyOverrides();
  try {
    const res = await fetch('/api/studio/overrides', { cache: 'no-store' });
    if (res.ok) published = { ...published, ...(await res.json()) };
  } catch {
    // שרת הסטודיו לא רץ — ממשיכים עם הקוד המקורי בלבד.
  }
  applyAll(published);

  if (!new URLSearchParams(window.location.search).has('edit')) return;
  const mod = await import('./Studio');
  mount(mod.default);
}
