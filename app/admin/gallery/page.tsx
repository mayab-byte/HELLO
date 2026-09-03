import { dna } from '@/dna';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import { deleteGalleryItem } from '@/lib/content';
import Shell from '../Shell';
import GalleryForm from './GalleryForm';

export const dynamic = 'force-dynamic';

export default async function GalleryPage({
  searchParams,
}: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
  const { edit } = await searchParams;

  const [items, media] = await Promise.all([
    db.galleryItem.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }], include: { image: true } }),
    db.media.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);
  const editing = edit ? items.find((i) => i.id === edit) ?? null : null;

  return (
    <Shell user={user} brand={{ name: dna.brand.name, mark: dna.brand.logoMark }}>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">גלריה</h1>
          <p className="adm-sub">{items.length} פריטים.</p>
        </div>
      </div>

      {media.length === 0 && (
        <p className="adm-alert adm-alert-info">
          ספריית התמונות ריקה. יש להעלות תמונה בעמוד &quot;תמונות&quot; לפני הוספת פריט לגלריה.
        </p>
      )}

      <section className="adm-card">
        <h2 className="adm-card-title">{editing ? 'עריכת פריט' : 'הוספת פריט'}</h2>
        <GalleryForm item={editing} media={media} />
      </section>

      <section className="adm-card">
        <h2 className="adm-card-title">הגלריה</h2>
        {items.length === 0 ? (
          <p className="adm-empty">עדיין אין פריטים בגלריה.</p>
        ) : (
          <div className="adm-media-grid">
            {items.map((i) => (
              <figure key={i.id} className="adm-media-item" style={{ margin: 0 }}>
                <img src={i.image.path} alt={i.image.alt} loading="lazy" />
                <figcaption className="adm-media-meta">
                  <strong>{i.title ?? '—'}</strong>
                  <span className={`adm-pill ${i.status === 'PUBLISHED' ? 'adm-pill-published' : 'adm-pill-draft'}`}>
                    {i.status === 'PUBLISHED' ? 'מפורסם' : 'טיוטה'}
                  </span>
                  <div className="adm-actions" style={{ marginTop: 6 }}>
                    <a href={`/admin/gallery?edit=${i.id}`} className="adm-btn"
                       style={{ minHeight: 32, flex: 1, fontSize: '0.75rem' }}>עריכה</a>
                    <form action={deleteGalleryItem} style={{ flex: 1 }}>
                      <input type="hidden" name="id" value={i.id} />
                      <button type="submit" className="adm-btn adm-btn-danger"
                              style={{ minHeight: 32, width: '100%', fontSize: '0.75rem' }}>מחיקה</button>
                    </form>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
