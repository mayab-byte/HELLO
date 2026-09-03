import Link from 'next/link';
import { asset } from '@/lib/asset';

/**
 * ראש עמוד פנימי: פירורי לחם, כותרת ופסקת פתיחה.
 * הפירורים הם <nav> עם aria-label ו-aria-current, כדי שקורא מסך
 * ידע איפה המשתמש נמצא בהיררכיה.
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
