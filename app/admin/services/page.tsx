import { dna } from '@/dna';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import { deleteService } from '@/lib/content';
import Shell from '../Shell';
import ServiceForm from './ServiceForm';

export const dynamic = 'force-dynamic';

export default async function ServicesPage({
  searchParams,
}: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
  const { edit } = await searchParams;
  const services = await db.service.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  const editing = edit ? services.find((s) => s.id === edit) ?? null : null;

  return (
    <Shell user={user} brand={{ name: dna.brand.name, mark: dna.brand.logoMark }}>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">שירותים</h1>
          <p className="adm-sub">הכרטיסים שמופיעים בסקשן השירותים. {services.length} שירותים.</p>
        </div>
      </div>

      <section className="adm-card">
        <h2 className="adm-card-title">{editing ? `עריכת: ${editing.title}` : 'הוספת שירות'}</h2>
        <ServiceForm service={editing} />
      </section>

      <section className="adm-card">
        <h2 className="adm-card-title">הרשימה</h2>
        {services.length === 0 ? (
          <p className="adm-empty">עדיין אין שירותים.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <caption className="visually-hidden">רשימת השירותים</caption>
              <thead>
                <tr>
                  <th scope="col">סדר</th><th scope="col">כותרת</th>
                  <th scope="col">תיאור קצר</th><th scope="col">מצב</th><th scope="col">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td className="num">{s.order}</td>
                    <th scope="row" style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {s.icon && <span aria-hidden="true">{s.icon} </span>}{s.title}
                    </th>
                    <td>{s.summary.slice(0, 60)}{s.summary.length > 60 ? '…' : ''}</td>
                    <td>
                      <span className={`adm-pill ${s.status === 'PUBLISHED' ? 'adm-pill-published' : 'adm-pill-draft'}`}>
                        {s.status === 'PUBLISHED' ? 'מפורסם' : 'טיוטה'}
                      </span>
                    </td>
                    <td>
                      <div className="adm-actions">
                        <a href={`/admin/services?edit=${s.id}`} className="adm-btn" style={{ minHeight: 34 }}>
                          עריכה<span className="visually-hidden"> של {s.title}</span>
                        </a>
                        <form action={deleteService}>
                          <input type="hidden" name="id" value={s.id} />
                          <button type="submit" className="adm-btn adm-btn-danger" style={{ minHeight: 34 }}>
                            מחיקה<span className="visually-hidden"> של {s.title}</span>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Shell>
  );
}
