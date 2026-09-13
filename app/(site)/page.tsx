import { dna } from '@/dna';
import { pageMeta } from '@/lib/gso';
import { getSiteContent } from '@/lib/site-content';
import Hero from '@/components/site/Hero';
import TrustBar from '@/components/site/TrustBar';
import Services from '@/components/site/Services';
import About from '@/components/site/About';
import Gallery from '@/components/site/Gallery';
import Testimonials from '@/components/site/Testimonials';
import Posts from '@/components/site/Posts';
import Faq from '@/components/site/Faq';
import ContactCta from '@/components/site/ContactCta';

/**
 * עמוד הבית מגדיר metadata משלו ולא נשען על ברירת המחדל של הלייאאוט,
 * כי canonical חייב להיות מפורש בכל עמוד — כולל בשורש.
 */
export const metadata = pageMeta(dna, {
  title: `${dna.brand.name} — ${dna.brand.tagline}`,
  description: dna.seo.description,
  path: '/',
  image: dna.seo.ogImage,
});

/**
 * העמוד נבנה סטטית ומתרענן דרך revalidatePath, שנקרא בכל פעולת תוכן
 * במערכת הניהול. כך העמוד מוגש מהמטמון — מהיר — ועדיין מתעדכן מיד.
 */
export default async function HomePage() {
  const on = dna.sections;
  const c = await getSiteContent();

  // אין כאן JSON-LD של העסק: גרף הישות מוזרק פעם אחת ב-app/layout.tsx
  // דרך siteGraph(), עם שעות פתיחה קריאות-מכונה, geo ו-sameAs. סימון כפול
  // של אותה ישות בשני מקומות הוא בדיוק מה שמבלבל מנתחים.

  return (
    <>
      <main id="main">
        {on.hero && <Hero hero={c.hero} />}
        {on.trust && <TrustBar />}
        {on.services && <Services services={c.services} />}
        {on.about && <About about={c.about} />}
        {on.gallery && <Gallery gallery={c.gallery} />}
        {on.testimonials && <Testimonials testimonials={c.testimonials} />}
        {on.posts && <Posts posts={c.posts} />}
        {on.faq && <Faq />}
        {on.contact && <ContactCta site={c.site} contact={c.contact} />}
      </main>
    </>
  );
}
