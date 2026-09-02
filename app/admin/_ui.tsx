'use client';

import { useActionState } from 'react';
import type { FormResult } from '@/lib/content';

/** באנר תוצאה אחיד לכל טופסי המערכת, מוכרז לקוראי מסך. */
export function Result({ state }: { state: FormResult }) {
  if (state.error) return <p className="adm-alert adm-alert-error" role="alert">{state.error}</p>;
  if (state.ok) return <p className="adm-alert adm-alert-ok" role="status">השינויים נשמרו.</p>;
  return null;
}

/** עוטף Server Action בטופס עם מצב, באנר תוצאה וכפתור שמירה. */
export function ActionForm({
  action, children, submitLabel = 'שמירה', onDone,
}: {
  action: (prev: FormResult, fd: FormData) => Promise<FormResult>;
  children: React.ReactNode;
  submitLabel?: string;
  onDone?: React.ReactNode;
}) {
  const [state, dispatch, pending] = useActionState<FormResult, FormData>(action, {});
  return (
    <form action={dispatch} className="adm-form">
      <Result state={state} />
      {children}
      <div className="adm-actions">
        <button type="submit" className="adm-btn adm-btn-primary" disabled={pending}>
          {pending ? 'שומרת…' : submitLabel}
        </button>
        {onDone}
      </div>
    </form>
  );
}

export function Field({
  name, label, required, hint, type = 'text', defaultValue, textarea, rows,
}: {
  name: string; label: string; required?: boolean; hint?: string;
  type?: string; defaultValue?: string | number | null; textarea?: boolean; rows?: number;
}) {
  const id = `f-${name}`;
  const common = {
    id, name, required,
    defaultValue: defaultValue ?? '',
    'aria-describedby': hint ? `${id}-hint` : undefined,
  };
  return (
    <div className="adm-field">
      <label htmlFor={id}>
        {label} {required && <span className="req" aria-hidden="true">*</span>}
      </label>
      {textarea ? <textarea {...common} rows={rows} /> : <input {...common} type={type} />}
      {hint && <p id={`${id}-hint`} className="adm-hint">{hint}</p>}
    </div>
  );
}

export function StatusField({ value }: { value?: string }) {
  return (
    <div className="adm-field">
      <label htmlFor="f-status">מצב פרסום</label>
      <select id="f-status" name="status" defaultValue={value ?? 'DRAFT'}>
        <option value="DRAFT">טיוטה — לא מוצג באתר</option>
        <option value="PUBLISHED">מפורסם — מוצג באתר</option>
      </select>
    </div>
  );
}

export function MediaPicker({
  name, label, media, value, hint,
}: {
  name: string; label: string; value?: string | null; hint?: string;
  media: { id: string; path: string; alt: string; filename: string }[];
}) {
  const id = `f-${name}`;
  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} defaultValue={value ?? ''} aria-describedby={`${id}-hint`}>
        <option value="">— ללא תמונה —</option>
        {media.map((m) => <option key={m.id} value={m.id}>{m.filename} — {m.alt}</option>)}
      </select>
      <p id={`${id}-hint`} className="adm-hint">
        {hint ?? 'תמונות מגיעות מספריית התמונות. להעלאה חדשה: עמוד "תמונות".'}
      </p>
    </div>
  );
}
