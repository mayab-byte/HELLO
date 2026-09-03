import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/site-content';
import { requireSection } from '@/lib/page-guard';
import { asset } from '@/lib/asset';
import PageHeader from '@/components/site/PageHeader';

export const metadata: Metadata = {
  title: 'אודות',
  description: 'מי אנחנו, איך אנחנו עובדים ומה אפשר לצפות מאיתנו.',
};

export default async function AboutPage() {
  requireSection('about');
  const { about } = await getSiteContent();

  return (
    <>
      <PageHeader title={about.title} eyebrow={about.eyebrow} />
      <main id="main">
        <section className="section">
          <div className="container about-inner">
            <div className="about-media">
              <img src={asset(about.image.src)} alt={about.image.alt} width={900} height={600} />
            </div>
            <div className="about-text">
              {about.paragraphs.map((p, i) => <p key={i} className="about-paragraph">{p}</p>)}
              <ul className="about-list">
                {about.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
