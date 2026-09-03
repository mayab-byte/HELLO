import Link from 'next/link';
import { dna } from '@/dna';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import Shell from './Shell';

export const dynamic = 'force-dynamic';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const user = await requireUser();
  const { denied } = await searchParams;

  const [posts, services, gallery, testimonials, media, enquiries, needs2fa] = await Promise.all([
    db.post.count(),
    db.service.count(),
    db.galleryItem.count(),
    db.testimonial.count(),
    db.media.count(),
    db.enquiry.count({ where: { handled: false } }),
    db.user.findUnique({ where: { id: user.id }, select: { totpEnabledAt: true } }),
  ]);

  const stats = [
    { label: 'מאמרים', value: posts, href: '/admin/posts' },
    { label: 'שירותים', value: services, href: '/admin/services' },
    { label: 'פריטי גלריה', value: gallery, href: '/admin/gallery' },
    { label: 'המלצות', value: testimonials, href: '/admin/testimonials' },
    { label: 'תמונות', value: media, href: '/admin/media' },
    { label: 'פניות שלא טופלו', value: enquiries, href: '/admin/enquiries' },
  ];

  return (
    <Shell user={user} brand={{ name: dna.brand.name, mark: dna.brand.logoMark }}>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">שלום {user.name.split(' ')[0]}</h1>
          <p className="adm-sub">מכאן מנהלים את התוכן שמוצג באתר.</p>
        </div>
      </div>

      {denied && (
        <p className="adm-alert adm-alert-error" role="alert">
          לעמוד שביקשת נדרשת הרשאת מנהל.
        </p>
      )}

      {!needs2fa?.totpEnabledAt && (
        <p className="adm-alert adm-alert-info">
          האימות הדו-שלבי אינו פעיל בחשבון שלך.{' '}
          <Link href="/admin/security">להפעלה</Link> — לוקח דקה ומגן על האתר.
        </p>
      )}

      <div className="adm-stats">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="adm-stat" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="adm-stat-value">{s.value}</span>
            <span className="adm-stat-label">{s.label}</span>
          </Link>
        ))}
      </div>

      <section className="adm-card">
        <h2 className="adm-card-title">מאיפה מתחילים</h2>
        <ul style={{ display: 'grid', gap: 'var(--space-xs)', paddingInlineStart: '1.2rem', color: 'var(--text-muted)' }}>
          <li><Link href="/admin/settings">הגדרות האתר</Link> — שם העסק, פרטי קשר והטקסטים של עמוד הבית</li>
          <li><Link href="/admin/media">תמונות</Link> — העלאה לספרייה. לכל תמונה חובה טקסט חלופי</li>
          <li><Link href="/admin/posts">מאמרים</Link> — כתיבה ופרסום</li>
        </ul>
      </section>
    </Shell>
  );
}
