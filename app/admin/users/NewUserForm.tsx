'use client';

import { useActionState } from 'react';
import { createUser, type UserState } from '@/lib/auth/users';

export default function NewUserForm() {
  const [state, action, pending] = useActionState<UserState, FormData>(createUser, {});

  return (
    <section className="adm-card">
      <h2 className="adm-card-title">פתיחת משתמש</h2>

      {state.tempPassword && (
        <div className="adm-alert adm-alert-ok" role="status" style={{ display: 'grid', gap: 8 }}>
          <span>המשתמש {state.createdEmail} נוצר.</span>
          <span>
            <strong>סיסמה ראשונית — מוצגת פעם אחת בלבד:</strong>
          </span>
          <code className="adm-secret">{state.tempPassword}</code>
          <span>
            העבירי אותה למשתמש בערוץ בטוח ובקשי ממנו להחליף אותה בכניסה הראשונה.
            שליחה אוטומטית במייל תתאפשר לאחר חיבור SMTP.
          </span>
        </div>
      )}

      <form action={action} className="adm-form">
        {state.error && <p className="adm-alert adm-alert-error" role="alert">{state.error}</p>}
        <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="u-name">שם מלא <span className="req" aria-hidden="true">*</span></label>
            <input id="u-name" name="name" required />
          </div>
          <div className="adm-field">
            <label htmlFor="u-email">אימייל <span className="req" aria-hidden="true">*</span></label>
            <input id="u-email" name="email" type="email" required />
          </div>
          <div className="adm-field">
            <label htmlFor="u-role">תפקיד</label>
            <select id="u-role" name="role" defaultValue="SITE_EDITOR" aria-describedby="u-role-hint">
              <option value="SITE_EDITOR">עורך תוכן — הלקוח</option>
              <option value="ADMIN">מנהל — גישה מלאה</option>
            </select>
            <p id="u-role-hint" className="adm-hint">
              עורך תוכן יכול לערוך תוכן בלבד: לא קוד, לא תוספים, לא משתמשים.
            </p>
          </div>
        </div>
        <button type="submit" className="adm-btn adm-btn-primary" disabled={pending}>
          {pending ? 'יוצרת…' : 'פתיחת משתמש'}
        </button>
      </form>
    </section>
  );
}
