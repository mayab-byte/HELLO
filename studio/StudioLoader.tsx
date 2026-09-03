'use client';

import { useEffect, useState } from 'react';

/**
 * השער היחיד של Design Studio — גבול ה-client היציב שהלייאאוט מרנדר.
 *
 * הקומפוננטה הזו לא מכילה שום לוגיקה של העורך. כל המערכת יושבת מאחורי
 * המודול './boot', שב-build לפרודקשן מוחלף בגרסה ריקה (ראה next.config.mjs).
 * התוצאה: אף קובץ אמיתי של העורך לא נכנס לגרף התלויות של הפרודקשן.
 */
export default function StudioLoader() {
  const [Panel, setPanel] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_STUDIO !== '1') return;
    let cancelled = false;
    import('./boot').then(({ boot }) => boot((C) => { if (!cancelled) setPanel(() => C); }));
    return () => { cancelled = true; };
  }, []);

  return Panel ? <Panel /> : null;
}
