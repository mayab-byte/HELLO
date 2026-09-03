import { MEDIA, SCREENS, type Overrides, type ScreenKey } from './types';

export const LIVE_STYLE_ID = 'ds-live-styles';
export const FONT_LINK_ID = 'ds-live-fonts';
export const PREVIEW_STYLE_ID = 'ds-preview-width';

function esc(v: string) { return v.replace(/[\r\n]+/g, ' ').trim(); }

/**
 * CSS להחלה חיה בפיתוח.
 * `!important` הכרחי כאן כדי לנצח את ה-CSS הבסיסי — ובפרודקשן הוא נעלם (ראה scripts/bake.mjs).
 */
export function buildLiveCss(ov: Overrides): string {
  const blocks: string[] = [];

  for (const { key } of SCREENS) {
    const layer = ov.screens[key];
    const rules: string[] = [];

    for (const [sel, props] of Object.entries(layer.styles)) {
      const decls = Object.entries(props)
        .filter(([, v]) => v !== '' && v != null)
        .map(([p, v]) => `  ${p}: ${esc(v)} !important;`)
        .join('\n');
      if (decls) rules.push(`${sel} {\n${decls}\n}`);
    }

    for (const sel of layer.hidden) {
      // בעורך האלמנט נשאר גלוי ומסומן; ההסתרה בפועל חלה רק כשהעורך כבוי.
      rules.push(`body:not(.ds-editing) ${sel} { display: none !important; }`);
      rules.push(`body.ds-editing ${sel} { opacity: 0.32 !important; outline: 2px dashed #f59e0b !important; }`);
    }

    if (rules.length) blocks.push(`@media ${MEDIA[key as ScreenKey]} {\n${rules.join('\n')}\n}`);
  }

  return blocks.join('\n\n');
}

export function injectLiveCss(ov: Overrides) {
  let el = document.getElementById(LIVE_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = LIVE_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = buildLiveCss(ov);
}

export function injectFonts(families: string[]) {
  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (!families.length) { link?.remove(); return; }
  if (!link) {
    link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  const q = families.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@300;400;500;600;700;800`).join('&');
  link.href = `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

/** מחיל טקסטים. נקרא אחרי שה-DOM קיים (post-hydration). */
export function applyText(text: Record<string, string>) {
  for (const [sel, html] of Object.entries(text)) {
    if (html === '') continue;
    const el = document.querySelector(sel);
    if (el && el.innerHTML !== html) el.innerHTML = html;
  }
}

export function applyAll(ov: Overrides) {
  injectFonts(ov.fonts);
  injectLiveCss(ov);
  applyText(ov.text);
}

/**
 * צמצום רוחב התצוגה לתצוגת טאבלט/מובייל.
 * ⚠️ בלי transform על <body> — transform מעגן מחדש כל position:fixed צאצא
 * ושובר את הפאנל וה-overlays של העורך (מלכודת §10.7).
 */
export function setPreviewWidth(width: number) {
  let el = document.getElementById(PREVIEW_STYLE_ID) as HTMLStyleElement | null;
  if (!width) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('style');
    el.id = PREVIEW_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = `
body > *:not(.ds-root) {
  max-width: ${width}px;
  margin-inline: auto;
  box-shadow: 0 0 0 1px #cbd5e1;
}`;
}
