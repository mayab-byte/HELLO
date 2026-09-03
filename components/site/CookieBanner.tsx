'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/asset';

const KEY = 'cookie-choice';

/**
 * באנר עוגיות עם סירוב אמיתי — לא רק "אישור".
 *
 * הבחירה נשמרת מקומית ואינה נשלחת לשרת. כל עוד לא נבחר "אישור",
 * שום סקריפט מדידה לא נטען (ראה components/site/Analytics.tsx).
 */
export default function CookieBanner() {
  const [choice, setChoice] = useState<string | null>('pending');

  useEffect(() => {
    try { setChoice(localStorage.getItem(KEY)); }
    catch { setChoice('accepted'); } // אחסון חסום — לא מציקים למשתמש
  }, []);

  const decide = (value: 'accepted' | 'rejected') => {
    try { localStorage.setItem(KEY, value); } catch { /* אין אחסון */ }
    setChoice(value);
    window.dispatchEvent(new CustomEvent('cookie-choice', { detail: value }));
  };

  if (choice !== null) return null;

  return (
    <div className="cookie-banner" role="region" aria-label="הודעה על שימוש בעוגיות">
      <p className="cookie-text">
        אנחנו משתמשים בעוגיות כדי להפעיל את האתר ולהבין כיצד משתמשים בו.
        אפשר לסרב, והאתר ימשיך לעבוד במלואו.{' '}
        <Link href={asset('/privacy')}>מדיניות הפרטיות</Link>
      </p>
      <div className="cookie-actions">
        <button type="button" className="btn btn-secondary" onClick={() => decide('rejected')}>
          סירוב
        </button>
        <button type="button" className="btn btn-primary" onClick={() => decide('accepted')}>
          אישור
        </button>
      </div>
    </div>
  );
}
