import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/site-content';
import { requireSection } from '@/lib/page-guard';
import PageHeader from '@/components/site/PageHeader';
import ContactCta from '@/components/site/ContactCta';

export const metadata: Metadata = {
  title: 'צור קשר',
  description: 'השאירו פרטים ונחזור אליכם בתוך יום עסקים אחד.',
};

export default async function ContactPage() {
  requireSection('contact');
  const { site, contact } = await getSiteContent();

  return (
    <>
      <PageHeader title={contact.title} eyebrow={contact.eyebrow} lead={contact.lead} />
      <main id="main">
        <ContactCta site={site} contact={{ ...contact, eyebrow: '', title: 'השאירו פרטים', lead: contact.lead }} />
      </main>
    </>
  );
}
