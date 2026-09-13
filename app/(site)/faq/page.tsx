import { dna } from '@/dna';
import { requireSection } from '@/lib/page-guard';
import { pageMeta } from '@/lib/gso';
import PageHeader from '@/components/site/PageHeader';
import Faq from '@/components/site/Faq';
import ContactCta from '@/components/site/ContactCta';
import { getSiteContent } from '@/lib/site-content';

/**
 * עמוד השאלות והתשובות.
 *
 * עמוד ייעודי ולא רק סקשן בעמוד הבית, כי מודל שמצטט מעדיף עמוד שכולו
 * עוסק בשאלה אחת על פני פסקה שקבורה בתוך עמוד בית עמוס. ה-FAQPage עצמו
 * נפלט מהקומפוננטה Faq, ולכן הוא תמיד תואם למה שמוצג כאן.
 */
export const metadata = pageMeta(dna, {
  title: 'שאלות ותשובות',
  description: `תשובות לשאלות הנפוצות על ${dna.brand.name}: זמנים, עלויות, תהליך העבודה ונגישות.`,
  path: '/faq',
});

export default async function FaqPage() {
  requireSection('faq');
  const { site, contact } = await getSiteContent();

  return (
    <>
      <PageHeader
        title="שאלות ותשובות"
        eyebrow="לפני שתשאלו"
        lead="ריכזנו כאן את מה שרוב הלקוחות שואלים אותנו. לא מצאתם תשובה? כתבו לנו."
      />
      <main id="main">
        <Faq heading={false} />
        <ContactCta site={site} contact={{ ...contact, eyebrow: '', title: 'לא מצאתם תשובה?', lead: contact.lead }} />
      </main>
    </>
  );
}
