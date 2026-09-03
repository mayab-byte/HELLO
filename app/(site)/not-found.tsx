import Link from 'next/link';
import { asset } from '@/lib/asset';
import PageHeader from '@/components/site/PageHeader';

export const metadata = { title: 'העמוד לא נמצא' };

export default function NotFound() {
  return (
    <>
      <PageHeader
        title="העמוד לא נמצא"
        lead="ייתכן שהכתובת השתנתה, או שהעמוד הוסר."
      />
      <main id="main">
        <div className="section">
          <div className="container container-narrow prose">
            <p>אפשר לחזור לעמוד הבית, או לפנות אלינו ונעזור למצוא את מה שחיפשתם.</p>
            <p className="hero-actions">
              <Link className="btn btn-primary" href={asset('/')}>לעמוד הבית</Link>
              <Link className="btn btn-secondary" href={asset('/contact')}>צרו קשר</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
