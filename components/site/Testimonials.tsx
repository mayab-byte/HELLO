import Link from 'next/link';
import { asset } from '@/lib/asset';
import type { SiteContent } from '@/lib/site-content';

export default function Testimonials({ testimonials }: { testimonials: SiteContent['testimonials'] }) {
  return (
    <section id="testimonials" className="section" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="section-head">
          <span className="section-eyebrow">{testimonials.eyebrow}</span>
          <h2 id="testimonials-title" className="section-title">{testimonials.title}</h2>
        </div>
        <ul className="testimonial-grid">
          {testimonials.items.map((t) => (
            <li key={t.name} className="testimonial">
              {/* aria-label אסור על <p> (אין לו role שמתיר שם נגיש) —
                  לכן הדירוג נמסר לקורא מסך כטקסט מוסתר-חזותית. */}
              <p className="testimonial-rating">
                <span aria-hidden="true">{'★'.repeat(t.rating)}</span>
                <span className="visually-hidden">{`דירוג ${t.rating} מתוך 5`}</span>
              </p>
              <blockquote className="testimonial-quote"><p>{t.quote}</p></blockquote>
              <div className="testimonial-person">
                <img className="testimonial-avatar" src={asset(t.avatar)} alt="" width={44} height={44} loading="lazy" />
                <span>
                  <span className="testimonial-name">{t.name}</span><br />
                  <span className="testimonial-role">{t.role}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="section-more">
          <Link className="btn btn-secondary" href={asset('/testimonials')}>לכל ההמלצות</Link>
        </p>
      </div>
    </section>
  );
}
