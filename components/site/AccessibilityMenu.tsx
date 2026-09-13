'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { asset } from '@/lib/asset';

/**
 * ██  תפריט הנגישות  ██
 *
 * חובה חוקית בישראל (ת"י 5568 / תקנות שוויון זכויות), ולכן הוא מוטמע
 * בלייאאוט של האתר הציבורי ולא ניתן לכיבוי דרך dna.sections.
 * scripts/check-gso.mjs מוודא שהוא באמת מורכב שם.
 *
 * עקרונות המימוש:
 *
 *  • ההעדפות נשמרות כמחלקות על <html> ונקראות מ-localStorage לפני הצביעה
 *    הראשונה (ראה A11Y_BOOT ב-app/layout.tsx). בלי זה יש הבהוב של עמוד
 *    לא מותאם אצל מי שדווקא הכי זקוק להתאמה.
 *
 *  • כל ההתאמות הן CSS על <html>. אין נגיעה ב-DOM של התוכן, ולכן שום
 *    התאמה לא יכולה לשבור פריסה של אתר לקוח שאיננו מכירים מראש.
 *
 *  • הצבעים כאן קבועים ואינם נגזרים מפלטת המותג. זו הנקודה: כשלקוח מחליף
 *    פלטה, תפריט הנגישות חייב להישאר קריא בלי תלות בבחירה שלו.
 */

/** ההתאמות שהתפריט מציע. כל אחת היא מחלקה על <html>. */
const TOGGLES = [
  { key: 'contrast', label: 'ניגודיות גבוהה' },
  { key: 'dark', label: 'מצב כהה' },
  { key: 'links', label: 'הדגשת קישורים' },
  { key: 'readable', label: 'גופן קריא' },
  { key: 'spacing', label: 'הגדלת ריווח' },
  { key: 'still', label: 'עצירת אנימציות' },
  { key: 'cursor', label: 'סמן גדול' },
  { key: 'guide', label: 'סרגל קריאה' },
] as const;

type ToggleKey = (typeof TOGGLES)[number]['key'];

interface Prefs {
  zoom: number;
  on: ToggleKey[];
}

const STORE = 'a11y-prefs-v1';
const ZOOM_MIN = 100;
const ZOOM_MAX = 160;
const ZOOM_STEP = 10;

const EMPTY: Prefs = { zoom: 100, on: [] };

function read(): Prefs {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Partial<Prefs>;
    const keys = TOGGLES.map((t) => t.key) as string[];
    return {
      zoom: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number(p.zoom) || 100)),
      on: Array.isArray(p.on) ? (p.on.filter((k) => keys.includes(k)) as ToggleKey[]) : [],
    };
  } catch {
    // localStorage חסום (גלישה פרטית, הגדרת דפדפן). ממשיכים בלי שמירה.
    return EMPTY;
  }
}

/** החלת ההעדפות על <html>. המקור היחיד שמשנה את מצב התצוגה. */
function paint(p: Prefs) {
  const el = document.documentElement;
  for (const t of TOGGLES) el.classList.toggle(`a11y-${t.key}`, p.on.includes(t.key));
  el.classList.toggle('a11y-zoom', p.zoom !== 100);
  el.style.setProperty('--a11y-zoom', String(p.zoom / 100));
}

export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(EMPTY);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // טעינה ראשונית. הסקריפט בלייאאוט כבר צבע את המסך; כאן רק מסנכרנים
  // את מצב ה-React כדי שהמתגים יציגו את המצב האמיתי.
  useEffect(() => {
    const p = read();
    setPrefs(p);
    paint(p);
  }, []);

  const commit = useCallback((next: Prefs) => {
    setPrefs(next);
    paint(next);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      // אין שמירה — ההתאמה עדיין פעילה לגלישה הנוכחית.
    }
  }, []);

  const toggle = (key: ToggleKey) =>
    commit({
      ...prefs,
      on: prefs.on.includes(key) ? prefs.on.filter((k) => k !== key) : [...prefs.on, key],
    });

  const zoom = (dir: 1 | -1) =>
    commit({
      ...prefs,
      zoom: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prefs.zoom + dir * ZOOM_STEP)),
    });

  const reset = () => commit(EMPTY);

  // Escape סוגר ומחזיר את הפוקוס לכפתור. בלי ההחזרה הזו משתמש מקלדת
  // נזרק לתחילת העמוד וצריך לנווט מחדש.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  // בפתיחה הפוקוס עובר לתוך הפאנל, אחרת המשתמש פותח תפריט ונשאר מחוצה לו.
  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('button, a')?.focus();
  }, [open]);

  const active = prefs.on.length + (prefs.zoom !== 100 ? 1 : 0);

  return (
    <div className="a11y-root">
      <button
        ref={buttonRef}
        type="button"
        className="a11y-fab"
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="a11y-fab-icon" aria-hidden="true">♿</span>
        <span className="visually-hidden">
          תפריט נגישות{active > 0 ? ` (${active} התאמות פעילות)` : ''}
        </span>
      </button>

      <div
        id="a11y-panel"
        ref={panelRef}
        className="a11y-panel"
        role="dialog"
        aria-label="תפריט נגישות"
        hidden={!open}
      >
        <div className="a11y-head">
          <h2 className="a11y-title">תפריט נגישות</h2>
          <button type="button" className="a11y-close" onClick={() => { setOpen(false); buttonRef.current?.focus(); }}>
            <span aria-hidden="true">✕</span>
            <span className="visually-hidden">סגירת תפריט הנגישות</span>
          </button>
        </div>

        <div className="a11y-group">
          <p className="a11y-group-title" id="a11y-zoom-label">גודל טקסט</p>
          <div className="a11y-zoom" role="group" aria-labelledby="a11y-zoom-label">
            <button type="button" onClick={() => zoom(-1)} disabled={prefs.zoom <= ZOOM_MIN}>
              <span aria-hidden="true">−</span><span className="visually-hidden">הקטנת טקסט</span>
            </button>
            <output aria-live="polite">{prefs.zoom}%</output>
            <button type="button" onClick={() => zoom(1)} disabled={prefs.zoom >= ZOOM_MAX}>
              <span aria-hidden="true">+</span><span className="visually-hidden">הגדלת טקסט</span>
            </button>
          </div>
        </div>

        <div className="a11y-group">
          <p className="a11y-group-title" id="a11y-adj-label">התאמות תצוגה</p>
          <ul className="a11y-list" aria-labelledby="a11y-adj-label">
            {TOGGLES.map((t) => {
              const on = prefs.on.includes(t.key);
              return (
                <li key={t.key}>
                  <button type="button" className="a11y-toggle" aria-pressed={on} onClick={() => toggle(t.key)}>
                    <span className="a11y-toggle-box" aria-hidden="true">{on ? '✓' : ''}</span>
                    {t.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="a11y-foot">
          <button type="button" className="a11y-reset" onClick={reset}>ביטול כל ההתאמות</button>
          <Link href={asset('/accessibility')} className="a11y-statement">להצהרת הנגישות המלאה</Link>
        </div>
      </div>
    </div>
  );
}
