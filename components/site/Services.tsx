import Link from 'next/link';
import { asset } from '@/lib/asset';
import type { SiteContent } from '@/lib/site-content';

export default function Services({ services }: { services: SiteContent['services'] }) {
  return (
    <section id="services" className="section section-alt" aria-labelledby="services-title">
      <div className="container">
        <div className="section-head">
          <span className="section-eyebrow">{services.eyebrow}</span>
          <h2 id="services-title" className="section-title">{services.title}</h2>
          <p className="section-lead">{services.lead}</p>
        </div>
        <ul className="card-grid card-grid-3">
          {services.items.map((item) => (
            <li key={item.title} className="card">
              <span className="card-icon" aria-hidden="true">{item.icon}</span>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-text">{item.text}</p>
              <a className="card-link" href={item.href}>
                פרטים נוספים<span className="visually-hidden"> על {item.title}</span> ←
              </a>
            </li>
          ))}
        </ul>
        <p className="section-more">
          <Link className="btn btn-secondary" href={asset('/services')}>לכל השירותים</Link>
        </p>
      </div>
    </section>
  );
}
