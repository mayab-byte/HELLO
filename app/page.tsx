import { dna } from '@/dna';
import { getSiteContent } from '@/lib/site-content';
import Header from '@/components/site/Header';
import Hero from '@/components/site/Hero';
import TrustBar from '@/components/site/TrustBar';
import Services from '@/components/site/Services';
import About from '@/components/site/About';
import Gallery from '@/components/site/Gallery';
import Testimonials from '@/components/site/Testimonials';
import Posts from '@/components/site/Posts';
import ContactCta from '@/components/site/ContactCta';
import Footer from '@/components/site/Footer';

/**
 * התוכן נקרא מהמסד בכל בקשה, כדי ששינוי במערכת הניהול יופיע מיד.
 * מה שהלקוח לא ערך עדיין מגיע מ-content/site.ts.
 */
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const on = dna.sections;
  const c = await getSiteContent();

  return (
    <>
      <Header site={c.site} />
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
      <Footer site={c.site} />
    </>
  );
}
