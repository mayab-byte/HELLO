import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/site-content';
import { requireSection } from '@/lib/page-guard';
import { asset } from '@/lib/asset';
import PageHeader from '@/components/site/PageHeader';

export const metadata: Metadata = {
  title: 'המלצות',
  description: 'מה לקוחות מספרים על העבודה איתנו.',
};

export default async function TestimonialsPage() {
  requireSection('testimonials');
  const { testimonials } = await getSiteContent();

  return (
    <>
      <PageHeader title={testimonials.title} eyebrow={testimonials.eyebrow} />
      <main id="main">
        <section className="section">
          <div className="container">
            <ul className="testimonial-grid">
              {testimonials.items.map((t) => (
                <li key={t.name} className="testimonial">
                  <p className="testimonial-rating">
                    <span aria-hidden="true">{'★'.repeat(t.rating)}</span>
                    <span className="visually-hidden">{`דירוג ${t.rating} מתוך 5`}</span>
                  </p>
                  <blockquote className="testimonial-quote"><p>{t.quote}</p></blockquote>
                  <div className="testimonial-person">
                    <img className="testimonial-avatar" src={asset(t.avatar)} alt=""
                         width={44} height={44} loading="lazy" />
                    <span>
                      <span className="testimonial-name">{t.name}</span><br />
                      <span className="testimonial-role">{t.role}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
