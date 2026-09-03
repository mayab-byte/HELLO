import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { dna } from '@/dna';
import { requireSection } from '@/lib/page-guard';
import { decodeParam } from '@/lib/slug';
import { asset } from '@/lib/asset';
import PageHeader from '@/components/site/PageHeader';

type Props = { params: Promise<{ slug: string }> };

/**
 * מייצר מראש עמוד לכל מאמר שפורסם. נדרש לייצוא סטטי, ובבנייה הרגילה
 * הוא מזרז את הטעינה הראשונה. מאמר חדש שנוצר אחרי הבנייה מרונדר
 * לפי דרישה ונשמר במטמון.
 */
export async function generateStaticParams() {
  const posts = await db.post
    .findMany({ where: { status: 'PUBLISHED' }, select: { slug: true } })
    .catch(() => []);
  return posts.map((p) => ({ slug: p.slug }));
}

const load = (slug: string) =>
  db.post.findUnique({ where: { slug: decodeParam(slug) }, include: { image: true } }).catch(() => null);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await load((await params).slug);
  if (!post) return { title: 'המאמר לא נמצא' };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: post.image ? { images: [asset(post.image.path)] } : undefined,
  };
}

export default async function PostPage({ params }: Props) {
  requireSection('posts');
  const post = await load((await params).slug);
  if (!post || post.status !== 'PUBLISHED') notFound();

  const published = post.publishedAt ?? post.createdAt;

  // Schema.org — עוזר למנוע החיפוש להציג את המאמר נכון בתוצאות.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: published.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    inLanguage: 'he-IL',
    publisher: { '@type': 'Organization', name: dna.brand.name },
    ...(post.image ? { image: `${dna.seo.siteUrl}${post.image.path}` } : {}),
  };

  return (
    <>
      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader title={post.title} crumbs={[{ label: 'מאמרים', href: '/blog' }]} />
      <main id="main">
        <article className="section">
          <div className="container container-narrow prose">
            <p className="post-meta">
              {post.category && <><span className="post-category">{post.category}</span>{' · '}</>}
              <time dateTime={published.toISOString().slice(0, 10)}>
                {new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(published)}
              </time>
            </p>

            {post.image && (
              <img src={asset(post.image.path)} alt={post.image.alt}
                   width={900} height={560} style={{ borderRadius: 'var(--radius)' }} />
            )}

            {post.body.split(/\n{2,}/).map((p, i) => <p key={i}>{p.trim()}</p>)}

            <p><Link href={asset('/blog')}>← חזרה לכל המאמרים</Link></p>
          </div>
        </article>
      </main>
    </>
  );
}
