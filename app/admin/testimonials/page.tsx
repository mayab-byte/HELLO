import { dna } from '@/dna';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import { deleteTestimonial } from '@/lib/content';
import Shell from '../Shell';
import TestimonialForm from './TestimonialForm';

export const dynamic = 'force-dynamic';

export default async function TestimonialsPage({
  searchParams,
}: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
  const { edit } = await searchParams;

  const [items, media] = await Promise.all([
    db.testimonial.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }),
    db.media.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);
  const editing = edit ? items.find((i) => i.id === edit) ?? null : null;

  return (
    <Shell user={user} brand={{ name: dna.brand.name, mark: dna.brand.logoMark }}>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">המלצות</h1>
          <p className="adm-sub">{items.length} המלצות.</p>
        </div>
      </div>

      <section className="adm-card">
        <h2 className="adm-card-title">{editing ? `עריכת ההמלצה של ${editing.name}` : 'הוספת המלצה'}</h2>
        <TestimonialForm item={editing} media={media} />
      </section>

      <section className="adm-card">
        <h2 className="adm-card-title">הרשימה</h2>
        {items.length === 0 ? (
          <p className="adm-empty">עדיין אין המלצות.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <caption className="visually-hidden">רשימת ההמלצות</caption>
              <thead>
                <tr>
                  <th scope="col">סדר</th><th scope="col">ממליץ</th><th scope="col">דירוג</th>
                  <th scope="col">נוסח</th><th scope="col">מצב</th><th scope="col">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id}>
                    <td className="num">{t.order}</td>
                    <th scope="row" style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {t.name}{t.role ? <><br /><span className="adm-sub">{t.role}</span></> : null}
                    </th>
                    <td className="num">{t.rating}/5</td>
                    <td>{t.quote.slice(0, 50)}{t.quote.length > 50 ? '…' : ''}</td>
                    <td>
                      <span className={`adm-pill ${t.status === 'PUBLISHED' ? 'adm-pill-published' : 'adm-pill-draft'}`}>
                        {t.status === 'PUBLISHED' ? 'מפורסם' : 'טיוטה'}
                      </span>
                    </td>
                    <td>
                      <div className="adm-actions">
                        <a href={`/admin/testimonials?edit=${t.id}`} className="adm-btn" style={{ minHeight: 34 }}>
                          עריכה<span className="visually-hidden"> של ההמלצה מאת {t.name}</span>
                        </a>
                        <form action={deleteTestimonial}>
                          <input type="hidden" name="id" value={t.id} />
                          <button type="submit" className="adm-btn adm-btn-danger" style={{ minHeight: 34 }}>
                            מחיקה<span className="visually-hidden"> של ההמלצה מאת {t.name}</span>
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
