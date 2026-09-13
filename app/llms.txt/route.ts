import { dna } from '@/dna';
import { db } from '@/lib/db';
import { activeNav } from '@/lib/dna';
import { llmsTxt } from '@/lib/gso';

/**
 * /llms.txt — המפה שמודל שפה קורא.
 *
 * מודל שמגיע לאתר לא סורק עשרים עמודים כדי להבין מה יש כאן. הקובץ הזה
 * נותן לו בעמוד אחד את מה שהוא צריך: מי העסק, במה הוא עוסק, מה התשובות
 * שלו, ואיפה התוכן. זה המקבילה של sitemap.xml לעולם הגנרטיבי.
 *
 * מיוצר כמו sitemap.ts — נבנה בזמן הבנייה ומתרענן דרך revalidatePath,
 * וכל שאילתה עטופה ב-catch כדי שאתר בלי מסד עדיין יגיש קובץ תקין.
 */
export const dynamic = 'force-static';

export async function GET() {
  if (!dna.gso.llms.enabled) {
    return new Response('', { status: 404 });
  }

  const [posts, services] = await Promise.all([
    db.post
      .findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        select: { title: true, slug: true, excerpt: true },
        take: 50,
      })
      .catch(() => []),
    db.service
      .findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        select: { id: true, title: true, summary: true },
      })
      .catch(() => []),
  ]);

  // העמודים שבאמת קיימים: התפריט כבר מסונן לפי הסקשנים הפעילים,
  // והמסמכים המשפטיים קיימים תמיד.
  const pages = [
    { label: 'עמוד הבית', href: '/' },
    ...activeNav(dna).map((n) => ({ label: n.label, href: n.href })),
    ...dna.legalLinks.map((n) => ({ label: n.label, href: n.href })),
  ];

  return new Response(llmsTxt(dna, { pages, posts, services }), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
