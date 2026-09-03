import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getSiteContent } from '@/lib/site-content';
import { requireSection } from '@/lib/page-guard';
import { asset } from '@/lib/asset';
import PageHeader from '@/components/site/PageHeader';

export const metadata: Metadata = {
  title: 'שירותים',
  description: 'מה אנחנו עושים, ואיך כל שירות נבנה סביב מטרה עסקית ברורה.',
};

export default async function ServicesPage() {
  requireSection('services');
  const { services } = await getSiteContent();
  const rows = await db.service
    .findMany({ where: { status: 'PUBLISHED' }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] })
    .catch(() => []);

  return (
    <>
      <PageHeader title={services.title} eyebrow={services.eyebrow} lead={services.lead} />
      <main id="main">
        <section className="section">
          <div className="container">
            <ul className="card-grid card-grid-3">
              {services.items.map((item, i) => {
                const row = rows[i];
                return (
                  <li key={item.title} className="card">
                    <span className="card-icon" aria-hidden="true">{item.icon}</span>
                    <h2 className="card-title">{item.title}</h2>
                    <p className="card-text">{item.text}</p>
                    {row ? (
                      <Link className="card-link" href={asset(`/services/${row.id}`)}>
                        לפרטי השירות<span className="visually-hidden"> {item.title}</span> ←
                      </Link>
                    ) : (
                      <Link className="card-link" href={asset('/contact')}>
                        לפנייה<span className="visually-hidden"> בנושא {item.title}</span> ←
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
