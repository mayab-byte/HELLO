import Link from 'next/link';
import { asset } from '@/lib/asset';
import type { SiteContent } from '@/lib/site-content';

export default function Gallery({ gallery }: { gallery: SiteContent['gallery'] }) {
  return (
    <section id="gallery" className="section section-alt" aria-labelledby="gallery-title">
      <div className="container">
        <div className="section-head">
          <span className="section-eyebrow">{gallery.eyebrow}</span>
          <h2 id="gallery-title" className="section-title">{gallery.title}</h2>
          <p className="section-lead">{gallery.lead}</p>
        </div>
        <ul className="gallery-grid">
          {gallery.items.map((item) => (
            <li key={item.src} className="gallery-item">
              <img src={asset(item.src)} alt={item.alt} width={600} height={600} loading="lazy" />
              <span className="gallery-caption">{item.caption}</span>
            </li>
          ))}
        </ul>
        <p className="section-more">
          <Link className="btn btn-secondary" href={asset('/gallery')}>לגלריה המלאה</Link>
        </p>
      </div>
    </section>
  );
}
