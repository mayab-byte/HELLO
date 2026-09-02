import { dna } from '@/dna';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/guard';
import { setUserActive, unlockUser } from '@/lib/auth/users';
import Shell from '../Shell';
import NewUserForm from './NewUserForm';

export const dynamic = 'force-dynamic';

const fmt = (d: Date | null) =>
  d ? new Intl.DateTimeFormat('he-IL', { dateStyle: 'short', timeStyle: 'short' }).format(d) : '—';

export default async function UsersPage() {
  const admin = await requireAdmin();
  const users = await db.user.findMany({ orderBy: { createdAt: 'asc' } });

  return (
    <Shell user={admin} brand={{ name: dna.brand.name, mark: dna.brand.logoMark }}>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">משתמשים</h1>
          <p className="adm-sub">
            {users.length} משתמשים. אין הרשמה עצמית — משתמש נפתח מכאן בלבד.
          </p>
        </div>
      </div>

      <NewUserForm />

      <section className="adm-card">
        <h2 className="adm-card-title">הרשימה</h2>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <caption className="visually-hidden">משתמשי מערכת הניהול</caption>
            <thead>
              <tr>
                <th scope="col">שם</th><th scope="col">אימייל</th><th scope="col">תפקיד</th>
                <th scope="col">2FA</th><th scope="col">כניסה אחרונה</th>
                <th scope="col">מצב</th><th scope="col">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const locked = u.lockedUntil && u.lockedUntil > new Date();
                return (
                  <tr key={u.id} style={u.active ? undefined : { opacity: 0.55 }}>
                    <th scope="row" style={{ fontWeight: 600, color: 'var(--text)' }}>{u.name}</th>
                    <td>{u.email}</td>
                    <td>
                      <span className={`adm-pill ${u.role === 'ADMIN' ? 'adm-pill-admin' : 'adm-pill-editor'}`}>
                        {u.role === 'ADMIN' ? 'מנהל' : 'עורך תוכן'}
                      </span>
                    </td>
                    <td>{u.totpEnabledAt ? 'פעיל' : 'כבוי'}</td>
                    <td className="num">{fmt(u.lastLogin)}</td>
                    <td>
                      {!u.active ? 'מנוטרל' : locked ? `נעול` : 'פעיל'}
                    </td>
                    <td>
                      <div className="adm-actions">
                        {locked && (
                          <form action={unlockUser}>
                            <input type="hidden" name="id" value={u.id} />
                            <button type="submit" className="adm-btn" style={{ minHeight: 34 }}>
                              שחרור<span className="visually-hidden"> הנעילה של {u.name}</span>
                            </button>
                          </form>
                        )}
                        {u.id !== admin.id && (
                          <form action={setUserActive}>
                            <input type="hidden" name="id" value={u.id} />
                            <button type="submit" className="adm-btn" style={{ minHeight: 34 }}>
                              {u.active ? 'נטרול' : 'הפעלה'}
                              <span className="visually-hidden"> של {u.name}</span>
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
