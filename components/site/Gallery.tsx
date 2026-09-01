import { gallery } from '@/content/site';

export default function Gallery() {
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
              <img src={item.src} alt={item.alt} width={600} height={600} loading="lazy" />
              <span className="gallery-caption">{item.caption}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
