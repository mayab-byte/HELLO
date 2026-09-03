import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/site-content';
import { requireSection } from '@/lib/page-guard';
import { asset } from '@/lib/asset';
import PageHeader from '@/components/site/PageHeader';

export const metadata: Metadata = {
  title: 'גלריה',
  description: 'מבחר עבודות אחרונות.',
};

export default async function GalleryPage() {
  requireSection('gallery');
  const { gallery } = await getSiteContent();

  return (
    <>
      <PageHeader title={gallery.title} eyebrow={gallery.eyebrow} lead={gallery.lead} />
      <main id="main">
        <section className="section">
          <div className="container">
            <ul className="gallery-grid">
              {gallery.items.map((item) => (
                <li key={item.src} className="gallery-item">
                  <img src={asset(item.src)} alt={item.alt} width={600} height={600} loading="lazy" />
                  {item.caption && <span className="gallery-caption">{item.caption}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
