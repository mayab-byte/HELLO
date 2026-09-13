import Link from 'next/link';
import { asset } from '@/lib/asset';
import { dna } from '@/dna';
import { breadcrumbNode } from '@/lib/gso';
import JsonLd from './JsonLd';

/**
 * ראש עמוד פנימי: פירורי לחם, כותרת ופסקת פתיחה.
 *
 * הפירורים הם <nav> עם aria-label ו-aria-current, כדי שקורא מסך ידע
 * איפה המשתמש נמצא בהיררכיה — **וגם** BreadcrumbList ב-JSON-LD, נגזר
 * מאותו מערך crumbs. כל עמוד פנימי בכל אתר עתידי שמשתמש בקומפוננטה
 * הזו מקבל את ההיררכיה הסמנטית בחינם, בלי לדעת עליה.
 */
export default function PageHeader({
  title, lead, eyebrow, crumbs = [],
}: {
  title: string;
  lead?: string;
  eyebrow?: string;
  crumbs?: { label: string; href: string }[];
}) {
  return (
    <header className="page-header">
      <JsonLd data={breadcrumbNode(dna, crumbs, title)} />
      <div className="container">
        <nav className="breadcrumbs" aria-label="מיקומך באתר">
          <ol>
            <li><Link href={asset('/')}>בית</Link></li>
            {crumbs.map((c) => (
              <li key={c.href}><Link href={asset(c.href)}>{c.label}</Link></li>
            ))}
            <li aria-current="page">{title}</li>
          </ol>
        </nav>
        {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
        <h1 className="page-title">{title}</h1>
        {lead && <p className="page-lead">{lead}</p>}
      </div>
    </header>
  );
}
