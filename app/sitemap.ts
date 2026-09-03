import type { MetadataRoute } from 'next';
import { dna } from '@/dna';
import { db } from '@/lib/db';

/** מפת האתר. סקשן כבוי ב-dna.ts לא מופיע בה, כי גם העמוד שלו לא קיים. */
// נדרש לייצוא סטטי (npm run build:static). בבנייה הרגילה זה פשוט אומר
// שהקובץ נוצר בזמן הבנייה ומתרענן דרך revalidatePath, כמו שאר האתר.
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = dna.seo.siteUrl.replace(/\/$/, '');
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/accessibility`, lastModified: now, priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, priority: 0.3 },
  ];

  const maybe = (key: keyof typeof dna.sections, path: string, priority: number) => {
    if (dna.sections[key]) pages.push({ url: `${base}${path}`, lastModified: now, priority });
  };
  maybe('about', '/about', 0.8);
  maybe('services', '/services', 0.9);
  maybe('gallery', '/gallery', 0.6);
  maybe('testimonials', '/testimonials', 0.5);
  maybe('posts', '/blog', 0.7);
  maybe('contact', '/contact', 0.9);

  if (dna.sections.posts) {
    const posts = await db.post
      .findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } })
      .catch(() => []);
    for (const p of posts) {
      pages.push({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 });
    }
  }

  if (dna.sections.services) {
    const services = await db.service
      .findMany({ where: { status: 'PUBLISHED' }, select: { id: true, updatedAt: true } })
      .catch(() => []);
    for (const s of services) {
      pages.push({ url: `${base}/services/${s.id}`, lastModified: s.updatedAt, priority: 0.6 });
    }
  }

  return pages;
}
