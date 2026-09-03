import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { requireSection } from '@/lib/page-guard';
import { asset } from '@/lib/asset';
import PageHeader from '@/components/site/PageHeader';
import { posts as seed } from '@/content/site';

export const metadata: Metadata = {
  title: 'מאמרים',
  description: 'תכנים מקצועיים שנכתבים על ידי הצוות.',
};

const fmt = (d: Date) => new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(d);

export default async function BlogPage() {
  requireSection('posts');
  const rows = await db.post
    .findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' }, include: { image: true } })
    .catch(() => []);

  const items = rows.length
    ? rows.map((p) => ({
        key: p.id,
        href: `/blog/${p.slug}`,
        title: p.title,
        excerpt: p.excerpt ?? '',
        category: p.category ?? '',
        date: (p.publishedAt ?? p.createdAt).toISOString().slice(0, 10),
        dateLabel: fmt(p.publishedAt ?? p.createdAt),
        image: { src: p.image?.path ?? '/images/post-1.svg', alt: p.image?.alt ?? p.title },
      }))
    : seed.items.map((p) => ({ ...p, key: p.title, href: '#' }));

  return (
    <>
      <PageHeader title={seed.title} eyebrow={seed.eyebrow} lead={seed.lead} />
      <main id="main">
        <section className="section">
          <div className="container">
            {items.length === 0 ? (
              <p className="section-lead">עדיין לא פורסמו מאמרים.</p>
            ) : (
              <ul className="card-grid card-grid-3">
                {items.map((post) => (
                  <li key={post.key} className="post-card">
                    <img src={asset(post.image.src)} alt={post.image.alt}
                         width={800} height={500} loading="lazy" />
                    <div className="post-body">
                      <p className="post-meta">
                        {post.category && <><span className="post-category">{post.category}</span>{' · '}</>}
                        <time dateTime={post.date}>{post.dateLabel}</time>
                      </p>
                      <h2 className="post-title">
                        <Link href={asset(post.href)}>{post.title}</Link>
                      </h2>
                      <p className="post-excerpt">{post.excerpt}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
