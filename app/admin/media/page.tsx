import { dna } from '@/dna';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import { deleteMedia, updateMediaAlt } from '@/lib/media';
import Shell from '../Shell';
import UploadForm from './UploadForm';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const user = await requireUser();
  const media = await db.media.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <Shell user={user} brand={{ name: dna.brand.name, mark: dna.brand.logoMark }}>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">תמונות</h1>
          <p className="adm-sub">ספריית התמונות של האתר. {media.length} תמונות.</p>
        </div>
      </div>

      <UploadForm />

      <section className="adm-card">
        <h2 className="adm-card-title">הספרייה</h2>
        {media.length === 0 ? (
          <p className="adm-empty">עדיין אין תמונות. העלי את הראשונה מהטופס למעלה.</p>
        ) : (
          <div className="adm-media-grid">
            {media.map((m) => (
              <figure key={m.id} className="adm-media-item" style={{ margin: 0 }}>
                <img src={m.path} alt={m.alt} loading="lazy" />
                <figcaption className="adm-media-meta">
                  <strong title={m.filename}>{m.filename}</strong>
                  {Math.round(m.bytes / 1024)} KB
                  <form action={updateMediaAlt} style={{ display: 'grid', gap: 4, marginTop: 6 }}>
                    <input type="hidden" name="id" value={m.id} />
                    <label htmlFor={`alt-${m.id}`} className="visually-hidden">
                      טקסט חלופי עבור {m.filename}
                    </label>
                    <input id={`alt-${m.id}`} name="alt" defaultValue={m.alt} required
                           style={{ minHeight: 34, fontSize: '0.75rem' }} />
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button type="submit" className="adm-btn" style={{ minHeight: 32, flex: 1, fontSize: '0.75rem' }}>
                        עדכון
                      </button>
                    </div>
                  </form>
                  <form action={deleteMedia} style={{ marginTop: 4 }}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" className="adm-btn adm-btn-danger"
                            style={{ minHeight: 32, width: '100%', fontSize: '0.75rem' }}>
                      מחיקה<span className="visually-hidden"> של {m.filename}</span>
                    </button>
                  </form>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
