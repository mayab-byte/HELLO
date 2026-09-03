import { dna } from '@/dna';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import { toggleEnquiry } from '@/lib/content';
import Shell from '../Shell';

export const dynamic = 'force-dynamic';

const fmt = (d: Date) =>
  new Intl.DateTimeFormat('he-IL', { dateStyle: 'short', timeStyle: 'short' }).format(d);

export default async function EnquiriesPage() {
  const user = await requireUser();
  const enquiries = await db.enquiry.findMany({
    orderBy: [{ handled: 'asc' }, { createdAt: 'desc' }],
    take: 200,
  });
  const open = enquiries.filter((e) => !e.handled).length;

  return (
    <Shell user={user} brand={{ name: dna.brand.name, mark: dna.brand.logoMark }}>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">פניות</h1>
          <p className="adm-sub">{open} ממתינות לטיפול מתוך {enquiries.length}.</p>
        </div>
      </div>

      <section className="adm-card">
        {enquiries.length === 0 ? (
          <p className="adm-empty">עדיין לא התקבלו פניות מטופס יצירת הקשר.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <caption className="visually-hidden">פניות מטופס יצירת הקשר</caption>
              <thead>
                <tr>
                  <th scope="col">התקבלה</th><th scope="col">שם</th><th scope="col">קשר</th>
                  <th scope="col">הודעה</th><th scope="col">מצב</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e) => (
                  <tr key={e.id} style={e.handled ? { opacity: 0.6 } : undefined}>
                    <td className="num">{fmt(e.createdAt)}</td>
                    <th scope="row" style={{ fontWeight: 600, color: 'var(--text)' }}>{e.name}</th>
                    <td>
                      <a href={`tel:${e.phone}`}>{e.phone}</a>
                      {e.email && <><br /><a href={`mailto:${e.email}`}>{e.email}</a></>}
                    </td>
                    <td style={{ maxWidth: 320, whiteSpace: 'pre-wrap' }}>{e.message}</td>
                    <td>
                      <form action={toggleEnquiry}>
                        <input type="hidden" name="id" value={e.id} />
                        <button type="submit" className="adm-btn" style={{ minHeight: 34 }}>
                          {e.handled ? 'סימון כלא טופלה' : 'סימון כטופלה'}
                          <span className="visually-hidden"> — פנייה מאת {e.name}</span>
                        </button>
                      </form>
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
