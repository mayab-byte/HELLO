import Link from 'next/link';
import { dna } from '@/dna';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import { deletePost } from '@/lib/content';
import Shell from '../Shell';

export const dynamic = 'force-dynamic';

const fmt = (d: Date) => new Intl.DateTimeFormat('he-IL', { dateStyle: 'medium' }).format(d);

export default async function PostsPage() {
  const user = await requireUser();
  const posts = await db.post.findMany({ orderBy: { updatedAt: 'desc' }, include: { image: true } });

  return (
    <Shell user={user} brand={{ name: dna.brand.name, mark: dna.brand.logoMark }}>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">מאמרים</h1>
          <p className="adm-sub">{posts.length} מאמרים בסך הכל.</p>
        </div>
        <Link href="/admin/posts/new" className="adm-btn adm-btn-primary">מאמר חדש</Link>
      </div>

      <section className="adm-card">
        {posts.length === 0 ? (
          <p className="adm-empty">עדיין אין מאמרים. לחצי על &quot;מאמר חדש&quot; כדי להתחיל.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <caption className="visually-hidden">רשימת המאמרים באתר</caption>
              <thead>
                <tr>
                  <th scope="col">כותרת</th>
                  <th scope="col">קטגוריה</th>
                  <th scope="col">מצב</th>
                  <th scope="col">עודכן</th>
                  <th scope="col">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <th scope="row" style={{ fontWeight: 600, color: 'var(--text)' }}>
                      <Link href={`/admin/posts/${p.id}`}>{p.title}</Link>
                    </th>
                    <td>{p.category ?? '—'}</td>
                    <td>
                      <span className={`adm-pill ${p.status === 'PUBLISHED' ? 'adm-pill-published' : 'adm-pill-draft'}`}>
                        {p.status === 'PUBLISHED' ? 'מפורסם' : 'טיוטה'}
                      </span>
                    </td>
                    <td className="num">{fmt(p.updatedAt)}</td>
                    <td>
                      <form action={deletePost}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="adm-btn adm-btn-danger" style={{ minHeight: 34 }}>
                          מחיקה<span className="visually-hidden"> של {p.title}</span>
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
