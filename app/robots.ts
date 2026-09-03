import type { MetadataRoute } from 'next';
import { dna } from '@/dna';

// נדרש לייצוא סטטי (npm run build:static). בבנייה הרגילה זה פשוט אומר
// שהקובץ נוצר בזמן הבנייה ומתרענן דרך revalidatePath, כמו שאר האתר.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const base = dna.seo.siteUrl.replace(/\/$/, '');
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      // מערכת הניהול לעולם לא נסרקת.
      disallow: ['/admin', '/admin/'],
    }],
    sitemap: `${base}/sitemap.xml`,
  };
}
