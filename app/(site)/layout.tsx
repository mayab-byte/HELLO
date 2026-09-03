import { getSiteContent } from '@/lib/site-content';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CookieBanner from '@/components/site/CookieBanner';

/**
 * המעטפת של האתר הציבורי: כותרת, פוטר ובאנר העוגיות.
 * מערכת הניהול יושבת מחוץ לקבוצת המסלולים הזו ולכן אינה מקבלת אותם.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { site } = await getSiteContent();
  return (
    <>
      <Header site={site} />
      {children}
      <Footer site={site} />
      <CookieBanner />
    </>
  );
}
