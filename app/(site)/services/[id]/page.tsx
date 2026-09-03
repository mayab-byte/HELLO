import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { requireSection } from '@/lib/page-guard';
import { decodeParam } from '@/lib/slug';
import { asset } from '@/lib/asset';
import PageHeader from '@/components/site/PageHeader';

type Props = { params: Promise<{ id: string }> };

/** מייצר מראש עמוד לכל שירות שפורסם. נדרש לייצוא סטטי. */
export async function generateStaticParams() {
  const services = await db.service
    .findMany({ where: { status: 'PUBLISHED' }, select: { id: true } })
    .catch(() => []);
  return services.map((s) => ({ id: s.id }));
}

async function load(id: string) {
  return db.service.findUnique({ where: { id: decodeParam(id) }, include: { image: true } }).catch(() => null);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await load((await params).id);
  if (!service) return { title: 'השירות לא נמצא' };
  return { title: service.title, description: service.summary };
}

export default async function ServicePage({ params }: Props) {
  requireSection('services');
  const service = await load((await params).id);
  if (!service || service.status !== 'PUBLISHED') notFound();

  return (
    <>
      <PageHeader
        title={service.title}
        lead={service.summary}
        crumbs={[{ label: 'שירותים', href: '/services' }]}
      />
      <main id="main">
        <section className="section">
          <div className="container container-narrow prose">
            {service.image && (
              <img src={asset(service.image.path)} alt={service.image.alt}
                   width={900} height={600} style={{ borderRadius: 'var(--radius)' }} />
            )}
            {service.body
              ? service.body.split(/\n{2,}/).map((p, i) => <p key={i}>{p.trim()}</p>)
              : <p>{service.summary}</p>}
            <p>
              <Link className="btn btn-primary" href={asset('/contact')}>
                לפנייה בנושא {service.title}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
