'use client';

import { useEffect, useRef, useState } from 'react';
import { hsvaToCss, parseColor, type Hsva } from './color';

/** בורר צבע HSV מלא עם שקיפות, בסגנון Elementor. */
export default function ColorPicker({ value, onChange }: { value: string; onChange: (css: string) => void }) {
  const [hsva, setHsva] = useState<Hsva>(() => parseColor(value));
  const svRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // סנכרון כשהאלמנט הנבחר משתנה מבחוץ
  useEffect(() => { setHsva(parseColor(value)); }, [value]);

  const push = (next: Hsva) => { setHsva(next); onChange(hsvaToCss(next)); };

  const pickFromEvent = (e: { clientX: number; clientY: number }) => {
    const r = svRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    // RTL: הציר האופקי הוא saturation משמאל לימין ויזואלית, אך הגרדיאנט הוא to right
    push({ ...hsva, s: x, v: 1 - y });
  };

  useEffect(() => {
    const move = (e: PointerEvent) => { if (dragging.current) pickFromEvent(e); };
    const up = () => { dragging.current = false; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  });

  const css = hsvaToCss(hsva);

  return (
    <div className="ds-color">
      <div
        ref={svRef}
        className="ds-sv"
        style={{ background: `hsl(${hsva.h} 100% 50%)` }}
        onPointerDown={(e) => { dragging.current = true; pickFromEvent(e); }}
      >
        <div className="ds-sv-white" />
        <div className="ds-sv-black" />
        <div className="ds-sv-knob" style={{ insetInlineStart: `${hsva.s * 100}%`, top: `${(1 - hsva.v) * 100}%` }} />
      </div>

      <label className="ds-label" htmlFor="ds-hue">גוון</label>
      <input id="ds-hue" className="ds-hue" type="range" min={0} max={360} value={Math.round(hsva.h)}
             onChange={(e) => push({ ...hsva, h: +e.target.value })} />

      <label className="ds-label" htmlFor="ds-alpha">שקיפות</label>
      <input id="ds-alpha" className="ds-alpha" type="range" min={0} max={1} step={0.01} value={hsva.a}
             style={{ background: `linear-gradient(to left, transparent, ${hsvaToCss({ ...hsva, a: 1 })})` }}
             onChange={(e) => push({ ...hsva, a: +e.target.value })} />

      <div className="ds-row">
        <span className="ds-swatch"><span className="ds-swatch-fill" style={{ background: css }} /></span>
        <input className="ds-text" style={{ flex: 1 }} value={css}
               onChange={(e) => { const v = e.target.value; setHsva(parseColor(v)); onChange(v); }} />
      </div>
    </div>
  );
}
