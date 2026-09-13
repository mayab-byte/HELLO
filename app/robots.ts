import type { MetadataRoute } from 'next';
import { dna } from '@/dna';
import { AI_CRAWLERS } from '@/lib/gso';

// נדרש לייצוא סטטי (npm run build:static). בבנייה הרגילה זה פשוט אומר
// שהקובץ נוצר בזמן הבנייה ומתרענן דרך revalidatePath, כמו שאר האתר.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const base = dna.seo.siteUrl.replace(/\/$/, '');
  const allowAi = dna.gso.crawlers === 'allow';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // מערכת הניהול לעולם לא נסרקת.
        disallow: ['/admin', '/admin/'],
      },
      /**
       * סורקי ה-AI, במפורש.
       *
       * הכלל הגורף למעלה כבר מרשה להם מכללא, אבל "מכללא" אינה החלטה.
       * הרישום המפורש הופך את זה לבחירה של הלקוח (dna.gso.crawlers),
       * וגם מתעד לכל מי שיקרא את הקובץ מה המדיניות בפועל.
       */
      {
        userAgent: AI_CRAWLERS,
        ...(allowAi
          ? { allow: '/', disallow: ['/admin', '/admin/'] }
          : { disallow: '/' }),
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
