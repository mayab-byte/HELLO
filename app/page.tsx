import { dna } from '@/dna';
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
 * הרכב עמוד הבית. אילו סקשנים מוצגים נקבע ב-dna.ts → sections,
 * כך שהתאמה ללקוח לא דורשת נגיעה בקוד.
 */
export default function HomePage() {
  const on = dna.sections;

  return (
    <>
      <Header />
      <main id="main">
        {on.hero && <Hero />}
        {on.trust && <TrustBar />}
        {on.services && <Services />}
        {on.about && <About />}
        {on.gallery && <Gallery />}
        {on.testimonials && <Testimonials />}
        {on.posts && <Posts />}
        {on.contact && <ContactCta />}
      </main>
      <Footer />
    </>
  );
}
