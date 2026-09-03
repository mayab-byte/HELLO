'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './studio.css';
import { SCREENS, type ScreenKey } from './types';
import { setPreviewWidth } from './apply';
import { buildSelector, describe, resolveTarget } from './selector';
import { collectEditable, depthOf, isSelectable } from './picker';
import { useStudio } from './useStudio';
import { allFonts } from './fonts';
import ColorPicker from './ColorPicker';
import { BoxCtl, NumCtl, Section, SelectCtl, TextCtl } from './controls';

interface Box { top: number; left: number; width: number; height: number }

function rectOf(el: Element): Box {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export default function Studio() {
  const s = useStudio();
  const [screen, setScreen] = useState<ScreenKey>('desktop');
  const [picking, setPicking] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [selEl, setSelEl] = useState<Element | null>(null);
  const [hoverBox, setHoverBox] = useState<Box | null>(null);
  const [selBox, setSelBox] = useState<Box | null>(null);
  const [pos, setPos] = useState({ top: 16, left: 16 });
  const [toast, setToast] = useState('');
  const [fontList, setFontList] = useState<string[]>([]);
  const [fontQuery, setFontQuery] = useState('');
  const [advanced, setAdvanced] = useState('');
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

  const say = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(''), 2400); }, []);

  // ---------- מצב עריכה על ה-body (משפיע על ה-CSS של ההסתרה והבחירה) ----------
  useEffect(() => {
    document.body.classList.add('ds-editing');
    return () => { document.body.classList.remove('ds-editing', 'ds-picking'); };
  }, []);
  useEffect(() => {
    document.body.classList.toggle('ds-picking', picking);
  }, [picking]);

  // ---------- רוחב תצוגה (בלי transform על body) ----------
  useEffect(() => {
    setPreviewWidth(SCREENS.find((x) => x.key === screen)!.width);
    return () => setPreviewWidth(0);
  }, [screen]);

  // ---------- בחירה בקליק + hover ----------
  useEffect(() => {
    if (!picking) { setHoverBox(null); return; }

    const over = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!(t instanceof Element) || !isSelectable(t)) { setHoverBox(null); return; }
      setHoverBox(rectOf(resolveTarget(t)));
    };

    const click = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!(t instanceof Element) || t.closest('.ds-root')) return;
      if (!isSelectable(t)) return;
      e.preventDefault();
      e.stopPropagation();
      select(resolveTarget(t));
    };

    document.addEventListener('mouseover', over, true);
    document.addEventListener('click', click, true);
    return () => {
      document.removeEventListener('mouseover', over, true);
      document.removeEventListener('click', click, true);
    };
  }, [picking]);

  const select = useCallback((el: Element) => {
    const selector = buildSelector(el);
    if (!selector) { say('לא הצלחתי לייצר סלקטור יציב לאלמנט הזה'); return; }
    setSel(selector);
    setSelEl(el);
    setSelBox(rectOf(el));
    setAdvanced('');
  }, [say]);

  // ---------- מיקום מחדש של ה-overlays בגלילה/שינוי גודל ----------
  useEffect(() => {
    const reposition = () => {
      if (selEl?.isConnected) setSelBox(rectOf(selEl)); else setSelBox(null);
      setHoverBox(null);
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => { window.removeEventListener('scroll', reposition, true); window.removeEventListener('resize', reposition); };
  }, [selEl]);

  // ---------- קיצורי מקלדת ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const inField = (e.target as HTMLElement)?.closest?.('input, textarea');
      if (mod && e.key.toLowerCase() === 'z' && !inField) {
        e.preventDefault();
        e.shiftKey ? s.redo() : s.undo();
      }
      if (e.key === 'Escape' && !inField) { setSel(null); setSelEl(null); setSelBox(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ---------- פונטים ----------
  useEffect(() => { allFonts().then(setFontList); }, []);

  // ---------- קריאה/כתיבה של ערכי סגנון ----------
  const styles = sel ? (s.ov.screens[screen].styles[sel] ?? {}) : {};
  const get = useCallback((prop: string) => styles[prop] ?? '', [styles]);
  const set = useCallback((prop: string, v: string) => { if (sel) s.setStyle(screen, sel, prop, v); }, [sel, screen, s]);

  /** הערך המוצג בבורר הצבע: העריכה אם קיימת, אחרת מה שהדפדפן מחשב בפועל. */
  const computed = useCallback((prop: string, fallback = '#000000') => {
    if (styles[prop]) return styles[prop];
    if (!selEl) return fallback;
    const v = getComputedStyle(selEl).getPropertyValue(prop);
    return v || fallback;
  }, [styles, selEl]);

  const hidden = sel ? s.ov.screens[screen].hidden.includes(sel) : false;

  // ---------- עץ המבנה ----------
  const tree = useMemo(() => {
    if (minimized) return [];
    return collectEditable().slice(0, 400).map((el) => ({ el, depth: depthOf(el), label: describe(el) }));
  }, [minimized, sel]);

  // ---------- גרירת הפאנל ----------
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragRef.current) return;
      setPos({ top: Math.max(0, e.clientY - dragRef.current.dy), left: Math.max(0, e.clientX - dragRef.current.dx) });
    };
    const up = () => { dragRef.current = null; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, []);

  // ---------- פרסום ----------
  const publish = useCallback(async () => {
    try {
      const res = await fetch('/api/studio/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s.ov),
      });
      say(res.ok ? 'פורסם — הפתקים נשמרו לקובץ הפרויקט' : `הפרסום נכשל (${res.status})`);
    } catch {
      say('שרת הסטודיו לא זמין. השתמש ב״העתק״ כגיבוי.');
    }
  }, [s.ov, say]);

  const copyOut = useCallback(async () => {
    const { buildLiveCss } = await import('./apply');
    const payload = `/* Design Studio — CSS */\n${buildLiveCss(s.ov)}`;
    try { await navigator.clipboard.writeText(payload); say('הועתק ללוח'); }
    catch { say('ההעתקה נכשלה'); }
  }, [s.ov, say]);

  const allHidden = useMemo(
    () => [...new Set(SCREENS.flatMap((x) => s.ov.screens[x.key].hidden))],
    [s.ov],
  );

  if (minimized) {
    return (
      <div className="ds-root">
        <button className="ds-bubble" style={pos} onClick={() => setMinimized(false)} title="פתיחת Design Studio">✎</button>
      </div>
    );
  }

  const filteredFonts = fontList.filter((f) => f.toLowerCase().includes(fontQuery.toLowerCase())).slice(0, 60);

  return (
    <div className="ds-root">
      {hoverBox && <div className="ds-hover-box" style={hoverBox} />}
      {selBox && <div className="ds-select-box" style={selBox} />}
      {selBox && selEl && (
        <span className="ds-select-tag" style={{ top: Math.max(0, selBox.top - 20), insetInlineStart: 'auto', left: selBox.left }}>
          {describe(selEl)}
        </span>
      )}
      {toast && <div className="ds-toast" role="status">{toast}</div>}

      <div className="ds-panel" style={pos}>
        <div
          className="ds-head"
          onPointerDown={(e) => { dragRef.current = { dx: e.clientX - pos.left, dy: e.clientY - pos.top }; }}
        >
          <span className="ds-head-title">Design Studio</span>
          <button className="ds-btn" onClick={s.undo} title="בטל (⌘Z)">↶</button>
          <button className="ds-btn" onClick={s.redo} title="בצע שוב (⌘⇧Z)">↷</button>
          <button className="ds-btn" onClick={() => setMinimized(true)} title="מזעור">–</button>
        </div>

        <div className="ds-body">
          {/* ---------- מסך + מצב בחירה ---------- */}
          <div className="ds-row">
            {SCREENS.map((sc) => (
              <button key={sc.key} className="ds-btn" aria-pressed={screen === sc.key} onClick={() => setScreen(sc.key)}>
                {sc.label}
              </button>
            ))}
          </div>
          <div className="ds-row">
            <button className="ds-btn" aria-pressed={picking} onClick={() => setPicking((v) => !v)}>
              בחירה {picking ? 'פעילה' : 'כבויה'}
            </button>
            <span className="ds-hint">{tree.length} אלמנטים</span>
          </div>
          <button className="ds-btn" onClick={() => s.applyToOtherScreens(screen)}>
            החל את המסך הזה על שאר המסכים
          </button>

          {/* ---------- מבנה ---------- */}
          <Section title="מבנה (לקריאה בלבד)">
            <div className="ds-tree">
              {tree.map((n, i) => (
                <button
                  key={i}
                  className={`ds-tree-node${selEl === n.el ? ' ds-on' : ''}`}
                  style={{ paddingInlineStart: 6 + n.depth * 9 }}
                  onClick={() => select(n.el)}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </Section>

          {!sel && <p className="ds-empty">לחץ על אלמנט בדף, או בחר אותו מעץ המבנה.</p>}

          {sel && (
            <>
              <div className="ds-sel-path">{sel}</div>

              <div className="ds-row">
                <button className="ds-btn" aria-pressed={hidden} onClick={() => s.toggleHidden(screen, sel)}>
                  {hidden ? 'מוסתר במסך זה' : 'הסתר במסך זה'}
                </button>
                <button className="ds-btn ds-btn-danger" onClick={() => { s.resetElement(sel); say('הפתק נזרק — הקוד חזר לשלוט'); }}>
                  אפס אלמנט
                </button>
              </div>

              {/* עריכת נוסח נעשית במערכת הניהול (/admin), לא כאן.
                  Design Studio אחראי על עיצוב בלבד: מה שהוא מייצר נאפה
                  ל-CSS, ולטקסט אין לאן להיאפות. */}

              {/* ---------- טיפוגרפיה ---------- */}
              <Section title="טיפוגרפיה">
                <NumCtl label="גודל" value={get('font-size')} onChange={(v) => set('font-size', v)} min={8} max={140} />
                <NumCtl label="עובי" value={get('font-weight')} onChange={(v) => set('font-weight', v)} min={100} max={900} step={100} unit="" />
                <NumCtl label="ריווח אות" value={get('letter-spacing')} onChange={(v) => set('letter-spacing', v)} min={-5} max={20} step={0.1} />
                <NumCtl label="גובה שורה" value={get('line-height')} onChange={(v) => set('line-height', v)} min={0.8} max={3} step={0.05} unit="" />
                <SelectCtl label="יישור" value={get('text-align')} onChange={(v) => set('text-align', v)} options={['right', 'center', 'left', 'justify']} />
                <TextCtl label="חיפוש פונט" value={fontQuery} onChange={setFontQuery} placeholder="Heebo, Inter…" />
                <select
                  className="ds-select"
                  value={get('font-family')}
                  onChange={(e) => {
                    const family = e.target.value.replace(/^['"]|['"]$/g, '').split(',')[0];
                    if (family) s.addFont(family);
                    set('font-family', e.target.value);
                  }}
                >
                  <option value="">— ברירת מחדל —</option>
                  {filteredFonts.map((f) => <option key={f} value={`'${f}', sans-serif`}>{f}</option>)}
                </select>
              </Section>

              {/* ---------- צבע ---------- */}
              <Section title="צבע טקסט">
                <ColorPicker value={computed('color')} onChange={(v) => set('color', v)} />
              </Section>

              <Section title="גרדיאנט על טקסט">
                <p className="ds-hint">משתמש ב-background-image (לא shorthand) כדי לא לאפס את background-clip.</p>
                <TextCtl label="גרדיאנט" value={get('background-image')} onChange={(v) => {
                  set('background-image', v);
                  if (v) { set('background-clip', 'text'); set('-webkit-background-clip', 'text'); set('color', 'transparent'); }
                  else { set('background-clip', ''); set('-webkit-background-clip', ''); set('color', ''); }
                }} placeholder="linear-gradient(90deg,#f09433,#dc2743)" />
              </Section>

              <Section title="צל טקסט">
                <TextCtl label="text-shadow" value={get('text-shadow')} onChange={(v) => set('text-shadow', v)} placeholder="0 2px 6px rgba(0,0,0,.35)" />
              </Section>

              {/* ---------- רקע ---------- */}
              <Section title="רקע">
                <ColorPicker value={computed('background-color', 'rgba(0,0,0,0)')} onChange={(v) => set('background-color', v)} />
                <TextCtl label="תמונה" value={get('background-image')} onChange={(v) => set('background-image', v)} placeholder="url(/images/hero.svg)" />
                <SelectCtl label="גודל" value={get('background-size')} onChange={(v) => set('background-size', v)} options={['cover', 'contain', 'auto', '100% 100%']} />
                <SelectCtl label="מיקום" value={get('background-position')} onChange={(v) => set('background-position', v)}
                  options={['center center', 'center top', 'center bottom', 'right center', 'left center', 'right top', 'left top', 'right bottom', 'left bottom']} />
                <TextCtl label="מיקום חופשי" value={get('background-position')} onChange={(v) => set('background-position', v)} placeholder="30% 70%" />
                <SelectCtl label="חזרה" value={get('background-repeat')} onChange={(v) => set('background-repeat', v)} options={['no-repeat', 'repeat', 'repeat-x', 'repeat-y']} />
                <p className="ds-hint">שכבת כיסוי: הוסף גרדיאנט-צבע לפני ה-url() באותו background-image — בלי להוסיף DOM.</p>
                <TextCtl label="כיסוי" value={get('--ds-overlay')} onChange={(v) => {
                  const img = get('background-image').replace(/^linear-gradient\([^)]*\),\s*/, '');
                  set('--ds-overlay', v);
                  set('background-image', v ? `linear-gradient(${v},${v}), ${img}` : img);
                }} placeholder="rgba(15,23,42,.55)" />
              </Section>

              {/* ---------- מסגרת וצל ---------- */}
              <Section title="מסגרת וצל">
                <TextCtl label="מסגרת" value={get('border')} onChange={(v) => set('border', v)} placeholder="1px solid #e2e8f0" />
                <NumCtl label="פינות" value={get('border-radius')} onChange={(v) => set('border-radius', v)} min={0} max={80} />
                <TextCtl label="box-shadow" value={get('box-shadow')} onChange={(v) => set('box-shadow', v)} placeholder="0 12px 32px rgba(15,23,42,.12)" />
              </Section>

              {/* ---------- מידות ומרווחים ---------- */}
              <Section title="מידות">
                <TextCtl label="רוחב" value={get('width')} onChange={(v) => set('width', v)} placeholder="100% / 320px" />
                <TextCtl label="גובה" value={get('height')} onChange={(v) => set('height', v)} placeholder="auto / 400px" />
                <TextCtl label="רוחב מרבי" value={get('max-width')} onChange={(v) => set('max-width', v)} placeholder="1200px" />
              </Section>

              <Section title="מרווח פנימי (padding)">
                <BoxCtl prefix="padding" get={get} set={set} />
              </Section>

              <Section title="מרווח חיצוני (margin)">
                <BoxCtl prefix="margin" get={get} set={set} />
              </Section>

              {/* ---------- אפקטים ---------- */}
              <Section title="אפקטים">
                <NumCtl label="שקיפות" value={get('opacity')} onChange={(v) => set('opacity', v)} min={0} max={1} step={0.05} unit="" />
                <SelectCtl label="בלנד" value={get('mix-blend-mode')} onChange={(v) => set('mix-blend-mode', v)}
                  options={['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'difference', 'exclusion', 'luminosity']} />
                <NumCtl label="סיבוב" value={get('rotate')} onChange={(v) => set('rotate', v)} min={-180} max={180} unit="deg" />
                <NumCtl label="הגדלה" value={get('scale')} onChange={(v) => set('scale', v)} min={0.2} max={3} step={0.05} unit="" />
              </Section>

              {/* ---------- תמונה ---------- */}
              {selEl?.tagName === 'IMG' && (
                <Section title="החלפת תמונה" open>
                  <ImagePicker
                    onPick={(src) => { (selEl as HTMLImageElement).src = src; say('התמונה הוחלפה'); }}
                    say={say}
                  />
                </Section>
              )}

              {/* ---------- מתקדם ---------- */}
              <Section title="מתקדם (prop: value)">
                <textarea
                  className="ds-text ds-textarea"
                  value={advanced}
                  placeholder={'backdrop-filter: blur(8px)\nz-index: 5'}
                  onChange={(e) => setAdvanced(e.target.value)}
                />
                <button className="ds-btn" onClick={() => {
                  for (const line of advanced.split('\n')) {
                    const i = line.indexOf(':');
                    if (i < 1) continue;
                    set(line.slice(0, i).trim(), line.slice(i + 1).replace(/;$/, '').trim());
                  }
                  say('הוחל');
                }}>החל</button>
              </Section>
            </>
          )}

          {/* ---------- מוסתרים ---------- */}
          {allHidden.length > 0 && (
            <Section title={`מוסתרים (${allHidden.length})`}>
              <div className="ds-list">
                {allHidden.map((h) => (
                  <div key={h} className="ds-list-item">
                    <span title={h}>{h}</span>
                    <button className="ds-btn" onClick={() => {
                      for (const sc of SCREENS) if (s.ov.screens[sc.key].hidden.includes(h)) s.toggleHidden(sc.key, h);
                    }}>החזר</button>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ---------- פעולות ---------- */}
          <div className="ds-row">
            <button className="ds-btn ds-btn-primary" style={{ flex: 1 }} onClick={publish}>פרסם</button>
            <button className="ds-btn" onClick={copyOut}>העתק</button>
            <button className="ds-btn ds-btn-danger" onClick={() => { if (confirm('לאפס את כל העריכות?')) s.resetAll(); }}>אפס הכל</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** העלאה מהמחשב או בחירה מהתמונות שכבר בפרויקט. בלי הדבקת URL. */
function ImagePicker({ onPick, say }: { onPick: (src: string) => void; say: (m: string) => void }) {
  const [gallery, setGallery] = useState<string[]>([]);

  useEffect(() => {
    const inPage = new Set<string>();
    document.querySelectorAll('img').forEach((img) => { if (img.src) inPage.add(new URL(img.src).pathname); });
    fetch('/api/studio/images')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: string[]) => setGallery([...new Set([...inPage, ...list])]))
      .catch(() => setGallery([...inPage]));
  }, []);

  const upload = async (file: File) => {
    const body = new FormData();
    body.append('file', file);
    try {
      const res = await fetch('/api/studio/upload', { method: 'POST', body });
      if (!res.ok) throw new Error();
      const { path } = await res.json();
      setGallery((g) => [path, ...g]);
      onPick(path);
    } catch { say('ההעלאה נכשלה — ודא ששרת הסטודיו רץ'); }
  };

  return (
    <>
      <input type="file" accept="image/*" className="ds-text"
             onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
      <div className="ds-list">
        {gallery.map((src) => (
          <button key={src} className="ds-tree-node" onClick={() => onPick(src)}>{src}</button>
        ))}
      </div>
    </>
  );
}
