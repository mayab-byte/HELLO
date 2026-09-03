'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { emptyOverrides, type Overrides, type ScreenKey } from './types';
import { applyText, injectFonts, injectLiveCss } from './apply';

const LS_KEY = 'ds-overrides-v1';
const MAX_HISTORY = 100;

function clone(o: Overrides): Overrides { return JSON.parse(JSON.stringify(o)); }

/** מקור האמת של העורך: overrides + היסטוריה + שמירה אוטומטית + החלה חיה. */
export function useStudio() {
  const [ov, setOv] = useState<Overrides>(emptyOverrides);
  const [ready, setReady] = useState(false);
  const past = useRef<Overrides[]>([]);
  const future = useRef<Overrides[]>([]);

  // ---- טעינה: seed מהקובץ המפורסם, ואז מיזוג עם טיוטה מקומית ----
  useEffect(() => {
    (async () => {
      let base = emptyOverrides();
      try {
        const res = await fetch('/api/studio/overrides', { cache: 'no-store' });
        if (res.ok) base = { ...base, ...(await res.json()) };
      } catch { /* אין שרת סטודיו — ממשיכים */ }
      try {
        const draft = localStorage.getItem(LS_KEY);
        if (draft) base = JSON.parse(draft);
      } catch { /* טיוטה פגומה — מתעלמים */ }
      setOv(base);
      setReady(true);
    })();
  }, []);

  // ---- החלה חיה + שמירה אוטומטית בכל שינוי ----
  useEffect(() => {
    if (!ready) return;
    injectFonts(ov.fonts);
    injectLiveCss(ov);
    applyText(ov.text);
    try { localStorage.setItem(LS_KEY, JSON.stringify(ov)); } catch { /* מכסה מלאה */ }
  }, [ov, ready]);

  const commit = useCallback((next: Overrides | ((prev: Overrides) => Overrides)) => {
    setOv((prev) => {
      past.current = [...past.current.slice(-MAX_HISTORY), clone(prev)];
      future.current = [];
      return typeof next === 'function' ? next(clone(prev)) : next;
    });
  }, []);

  const undo = useCallback(() => {
    setOv((prev) => {
      const last = past.current.pop();
      if (!last) return prev;
      future.current = [clone(prev), ...future.current];
      return last;
    });
  }, []);

  const redo = useCallback(() => {
    setOv((prev) => {
      const [next, ...rest] = future.current;
      if (!next) return prev;
      future.current = rest;
      past.current = [...past.current, clone(prev)];
      return next;
    });
  }, []);

  // ---- פעולות ברמת האלמנט ----
  const setStyle = useCallback((screen: ScreenKey, sel: string, prop: string, value: string) => {
    commit((d) => {
      const layer = d.screens[screen];
      const bag = (layer.styles[sel] ??= {});
      if (value === '') delete bag[prop]; else bag[prop] = value;
      if (Object.keys(bag).length === 0) delete layer.styles[sel];
      return d;
    });
  }, [commit]);

  const toggleHidden = useCallback((screen: ScreenKey, sel: string) => {
    commit((d) => {
      const list = d.screens[screen].hidden;
      const i = list.indexOf(sel);
      if (i >= 0) list.splice(i, 1); else list.push(sel);
      return d;
    });
  }, [commit]);

  /** מעתיק את עריכות המסך הנוכחי לשני האחרים. */
  const applyToOtherScreens = useCallback((from: ScreenKey) => {
    commit((d) => {
      for (const key of ['desktop', 'tablet', 'mobile'] as ScreenKey[]) {
        if (key === from) continue;
        d.screens[key] = clone(d).screens[from];
      }
      return d;
    });
  }, [commit]);

  /** "תזרוק את הפתק הזה" — האלמנט חוזר לשליטת הקוד המקורי. */
  const resetElement = useCallback((sel: string) => {
    commit((d) => {
      delete d.text[sel];
      for (const key of ['desktop', 'tablet', 'mobile'] as ScreenKey[]) {
        delete d.screens[key].styles[sel];
        d.screens[key].hidden = d.screens[key].hidden.filter((s) => s !== sel);
      }
      return d;
    });
  }, [commit]);

  const resetAll = useCallback(() => commit(emptyOverrides()), [commit]);

  const addFont = useCallback((family: string) => {
    commit((d) => { if (family && !d.fonts.includes(family)) d.fonts.push(family); return d; });
  }, [commit]);

  return {
    ov, ready, commit, undo, redo,
    canUndo: past.current.length > 0, canRedo: future.current.length > 0,
    setStyle, toggleHidden, applyToOtherScreens, resetElement, resetAll, addFont,
  };
}
