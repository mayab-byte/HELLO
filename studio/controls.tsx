'use client';

import { useId } from 'react';

/** סליידר + תיבת מספר מסונכרנים. כל בקרה מספרית בסטודיו משתמשת בזה. */
export function NumCtl({
  label, value, onChange, min = 0, max = 100, step = 1, unit = 'px', allowEmpty = true,
}: {
  label: string; value: string; onChange: (v: string) => void;
  min?: number; max?: number; step?: number; unit?: string; allowEmpty?: boolean;
}) {
  const id = useId();
  const num = parseFloat(value);
  const current = Number.isFinite(num) ? num : min;

  return (
    <div className="ds-ctl">
      <label htmlFor={id}>{label}</label>
      <input
        type="range" min={min} max={max} step={step} value={current}
        onChange={(e) => onChange(`${e.target.value}${unit}`)}
        aria-label={label}
      />
      <input
        id={id} className="ds-num" type="number" min={min} max={max} step={step}
        value={Number.isFinite(num) ? num : ''}
        onChange={(e) => onChange(e.target.value === '' && allowEmpty ? '' : `${e.target.value}${unit}`)}
      />
    </div>
  );
}

export function SelectCtl({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  const id = useId();
  return (
    <div className="ds-ctl" style={{ gridTemplateColumns: '78px 1fr' }}>
      <label htmlFor={id}>{label}</label>
      <select id={id} className="ds-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">— ברירת מחדל —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function TextCtl({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = useId();
  return (
    <div className="ds-ctl" style={{ gridTemplateColumns: '78px 1fr' }}>
      <label htmlFor={id}>{label}</label>
      <input id={id} className="ds-text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function Section({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="ds-section" open={open}>
      <summary>{title}</summary>
      <div className="ds-section-body">{children}</div>
    </details>
  );
}

/** ארבעת הכיוונים של margin / padding. */
export function BoxCtl({
  prefix, get, set, max = 200,
}: { prefix: 'margin' | 'padding'; get: (p: string) => string; set: (p: string, v: string) => void; max?: number }) {
  const sides: [string, string][] = [
    ['top', 'עליון'], ['bottom', 'תחתון'],
    ['inline-start', 'ימני'], ['inline-end', 'שמאלי'],
  ];
  return (
    <>
      {sides.map(([side, he]) => {
        const prop = `${prefix}-${side}`;
        return <NumCtl key={prop} label={he} value={get(prop)} onChange={(v) => set(prop, v)} min={-100} max={max} />;
      })}
    </>
  );
}
