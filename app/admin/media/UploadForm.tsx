'use client';

import { useActionState } from 'react';
import { uploadMedia, type UploadResult } from '@/lib/media';

export default function UploadForm() {
  const [state, action, pending] = useActionState<UploadResult, FormData>(uploadMedia, {});

  return (
    <section className="adm-card">
      <h2 className="adm-card-title">העלאת תמונה</h2>
      <form action={action} className="adm-form">
        {state.error && <p className="adm-alert adm-alert-error" role="alert">{state.error}</p>}
        {state.ok && <p className="adm-alert adm-alert-ok" role="status">התמונה הועלתה.</p>}

        <div className="adm-field">
          <label htmlFor="file">קובץ <span className="req" aria-hidden="true">*</span></label>
          <input id="file" name="file" type="file" accept="image/*" required aria-describedby="file-hint" />
          <p id="file-hint" className="adm-hint">JPG, PNG, WebP, AVIF, GIF או SVG. עד 8MB.</p>
        </div>

        <div className="adm-field">
          <label htmlFor="alt">טקסט חלופי <span className="req" aria-hidden="true">*</span></label>
          <input id="alt" name="alt" required minLength={3} aria-describedby="alt-hint" />
          <p id="alt-hint" className="adm-hint">
            תיאור קצר של מה שרואים בתמונה, למי שגולש עם קורא מסך.
            לדוגמה: &quot;צוות העסק בפגישה סביב שולחן&quot;. זהו שדה חובה לפי תקן הנגישות.
          </p>
        </div>

        <button type="submit" className="adm-btn adm-btn-primary" disabled={pending}>
          {pending ? 'מעלה…' : 'העלאה'}
        </button>
      </form>
    </section>
  );
}
