'use client';

import { useActionState } from 'react';
import { login, type LoginState } from '@/lib/auth/login';

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  // אחרי אימות הסיסמה עוברים למסך הקוד בלבד, כדי לא לבקש הכל מחדש.
  if (state.needsTotp) {
    return (
      <form action={action} className="adm-form">
        <input type="hidden" name="email" value={state.email ?? ''} />
        <p className="adm-alert adm-alert-info">
          הסיסמה אומתה. נותר להזין את הקוד מאפליקציית האימות.
        </p>
        {state.error && <p className="adm-alert adm-alert-error" role="alert">{state.error}</p>}
        <div className="adm-field">
          <label htmlFor="totp">קוד אימות <span className="req" aria-hidden="true">*</span></label>
          {/* בלי pattern של ספרות בלבד: קוד גיבוי מכיל אותיות ומקף,
              ו-pattern מספרי היה חוסם בדיוק את מי שאיבד את הטלפון. */}
          <input
            id="totp" name="totp" autoComplete="one-time-code"
            maxLength={14} required autoFocus
            aria-describedby="totp-hint"
            aria-invalid={state.error ? true : undefined}
          />
          <p id="totp-hint" className="adm-hint">
            שש ספרות מהאפליקציה, או אחד מקודי הגיבוי שקיבלת.
          </p>
        </div>
        <button type="submit" className="adm-btn adm-btn-primary" disabled={pending}>
          {pending ? 'מאמת…' : 'אישור'}
        </button>
      </form>
    );
  }

  return (
    <form action={action} className="adm-form">
      {state.error && <p className="adm-alert adm-alert-error" role="alert">{state.error}</p>}

      <div className="adm-field">
        <label htmlFor="email">אימייל <span className="req" aria-hidden="true">*</span></label>
        <input
          id="email" name="email" type="email" autoComplete="username" required
          defaultValue={state.email ?? ''} aria-invalid={state.error ? true : undefined}
        />
      </div>

      <div className="adm-field">
        <label htmlFor="password">סיסמה <span className="req" aria-hidden="true">*</span></label>
        <input
          id="password" name="password" type="password" autoComplete="current-password" required
          aria-invalid={state.error ? true : undefined}
        />
      </div>

      <button type="submit" className="adm-btn adm-btn-primary" disabled={pending}>
        {pending ? 'מתחברת…' : 'כניסה'}
      </button>
    </form>
  );
}
