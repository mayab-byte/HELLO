import { asset } from '@/lib/asset';
import type { SiteContent } from '@/lib/site-content';

export default function About({ about }: { about: SiteContent['about'] }) {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container about-inner">
        <div className="about-media">
          <img src={asset(about.image.src)} alt={about.image.alt} width={900} height={600} loading="lazy" />
        </div>
        <div className="about-text">
          <span className="section-eyebrow">{about.eyebrow}</span>
          <h2 id="about-title" className="section-title">{about.title}</h2>
          {about.paragraphs.map((p, i) => <p key={i} className="about-paragraph">{p}</p>)}
          <ul className="about-list">
            {about.points.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
