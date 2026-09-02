'use client';

import { useActionState, useState } from 'react';
import { beginTotpSetup, confirmTotp, disableTotp, type TotpState } from '@/lib/auth/twofactor';

export default function TwoFactor({
  enabled, isAdmin, email, unusedCodes,
}: {
  enabled: boolean; isAdmin: boolean; email: string; unusedCodes: number;
}) {
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [confirmState, confirmAction, confirming] = useActionState<TotpState, FormData>(confirmTotp, {});
  const [offState, offAction, disabling] = useActionState<TotpState, FormData>(disableTotp, {});

  // קודי הגיבוי מוצגים פעם אחת בלבד, מיד אחרי ההפעלה.
  if (confirmState.backupCodes) {
    return (
      <section className="adm-card">
        <h2 className="adm-card-title">האימות הדו-שלבי הופעל</h2>
        <p className="adm-alert adm-alert-ok" role="status">
          מעכשיו תתבקשי להזין קוד בכל התחברות.
        </p>
        <p className="adm-alert adm-alert-info">
          <strong>שמרי את הקודים האלה במקום בטוח.</strong> כל אחד מהם מאפשר כניסה אחת
          אם אין גישה לטלפון. <strong>הם מוצגים כאן פעם אחת בלבד</strong> ולא ניתן לראותם שוב.
        </p>
        <div className="adm-codes">
          {confirmState.backupCodes.map((c) => <code key={c}>{c}</code>)}
        </div>
        <div className="adm-actions" style={{ marginTop: 'var(--space-md)' }}>
          <a className="adm-btn adm-btn-primary" href="/admin/security">סיימתי לשמור</a>
        </div>
      </section>
    );
  }

  if (enabled) {
    return (
      <section className="adm-card">
        <h2 className="adm-card-title">אימות דו-שלבי פעיל</h2>
        <p className="adm-alert adm-alert-ok">
          החשבון מוגן. נותרו {unusedCodes} קודי גיבוי שלא נוצלו.
        </p>
        {isAdmin ? (
          <p className="adm-hint">אימות דו-שלבי הוא חובה עבור מנהל ואינו ניתן לכיבוי.</p>
        ) : (
          <form action={offAction} className="adm-form" style={{ maxWidth: 340 }}>
            {offState.error && <p className="adm-alert adm-alert-error" role="alert">{offState.error}</p>}
            <div className="adm-field">
              <label htmlFor="off-code">כיבוי האימות — נדרש קוד מהאפליקציה</label>
              <input id="off-code" name="code" inputMode="numeric" maxLength={6} required />
            </div>
            <button type="submit" className="adm-btn adm-btn-danger" disabled={disabling}>
              {disabling ? 'מכבה…' : 'כיבוי האימות הדו-שלבי'}
            </button>
          </form>
        )}
      </section>
    );
  }

  return (
    <section className="adm-card">
      <h2 className="adm-card-title">הפעלת אימות דו-שלבי</h2>

      {!setup ? (
        <>
          <p className="adm-sub" style={{ marginBottom: 'var(--space-md)' }}>
            הגנה נוספת: מלבד הסיסמה תידרש גם ספרות מאפליקציה בטלפון.
            מתאים ל-Google Authenticator, Authy או 1Password.
          </p>
          <button
            className="adm-btn adm-btn-primary"
            onClick={async () => setSetup(await beginTotpSetup())}
          >
            התחלה
          </button>
        </>
      ) : (
        <>
          <ol style={{ display: 'grid', gap: 'var(--space-sm)', paddingInlineStart: '1.2rem', marginBottom: 'var(--space-md)' }}>
            <li>פתחי את אפליקציית האימות והוסיפי חשבון חדש.</li>
            <li>בחרי &quot;הזנה ידנית&quot; והדביקי את המפתח שלמטה.</li>
            <li>הזיני כאן את שש הספרות שהאפליקציה מציגה.</li>
          </ol>

          <div className="adm-qr">
            <p className="adm-hint">המפתח לחשבון {email}:</p>
            <p className="adm-secret">{setup.secret}</p>
            <details>
              <summary className="adm-hint" style={{ cursor: 'pointer' }}>
                כתובת מלאה להעתקה
              </summary>
              <p className="adm-secret" style={{ marginTop: 8, fontSize: '0.7rem', letterSpacing: 0 }}>
                {setup.uri}
              </p>
            </details>
          </div>

          <form action={confirmAction} className="adm-form" style={{ maxWidth: 340, marginTop: 'var(--space-lg)' }}>
            {confirmState.error && <p className="adm-alert adm-alert-error" role="alert">{confirmState.error}</p>}
            <div className="adm-field">
              <label htmlFor="code">קוד מהאפליקציה <span className="req" aria-hidden="true">*</span></label>
              <input id="code" name="code" inputMode="numeric" maxLength={6} required autoFocus />
            </div>
            <button type="submit" className="adm-btn adm-btn-primary" disabled={confirming}>
              {confirming ? 'מאמתת…' : 'הפעלה'}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
