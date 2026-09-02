import { asset } from '@/lib/asset';
import type { SiteContent } from '@/lib/site-content';

export default function Hero({ hero }: { hero: SiteContent['hero'] }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-inner">
        <div className="hero-text">
          <span className="hero-eyebrow">{hero.eyebrow}</span>
          <h1 id="hero-title" className="hero-title">{hero.title}</h1>
          <p className="hero-lead">{hero.lead}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={hero.primaryCta.href}>{hero.primaryCta.label}</a>
            <a className="btn btn-secondary" href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
          </div>
        </div>
        <div className="hero-media">
          <img src={asset(hero.image.src)} alt={hero.image.alt} width={800} height={600} />
        </div>
      </div>
    </section>
  );
}
