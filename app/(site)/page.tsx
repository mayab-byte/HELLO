import { dna } from '@/dna';
import { getSiteContent } from '@/lib/site-content';
import Hero from '@/components/site/Hero';
import TrustBar from '@/components/site/TrustBar';
import Services from '@/components/site/Services';
import About from '@/components/site/About';
import Gallery from '@/components/site/Gallery';
import Testimonials from '@/components/site/Testimonials';
import Posts from '@/components/site/Posts';
import ContactCta from '@/components/site/ContactCta';

/**
 * העמוד נבנה סטטית ומתרענן דרך revalidatePath, שנקרא בכל פעולת תוכן
 * במערכת הניהול. כך העמוד מוגש מהמטמון — מהיר — ועדיין מתעדכן מיד.
 */
export default async function HomePage() {
  const on = dna.sections;
  const c = await getSiteContent();

  // Schema.org — כך מנוע החיפוש מזהה את פרטי העסק ומציג אותם בתוצאות.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: c.site.name,
    description: dna.seo.description,
    url: dna.seo.siteUrl,
    telephone: c.site.phone,
    email: c.site.email,
    address: { '@type': 'PostalAddress', streetAddress: c.site.address, addressCountry: 'IL' },
    openingHours: c.site.hours,
    inLanguage: 'he-IL',
  };

  return (
    <>
      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main id="main">
        {on.hero && <Hero hero={c.hero} />}
        {on.trust && <TrustBar />}
        {on.services && <Services services={c.services} />}
        {on.about && <About about={c.about} />}
        {on.gallery && <Gallery gallery={c.gallery} />}
        {on.testimonials && <Testimonials testimonials={c.testimonials} />}
        {on.posts && <Posts posts={c.posts} />}
        {on.contact && <ContactCta site={c.site} contact={c.contact} />}
      </main>
    </>
  );
}
