import { getSiteContent } from '@/lib/site-content';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import CookieBanner from '@/components/site/CookieBanner';
import AccessibilityMenu from '@/components/site/AccessibilityMenu';

/**
 * המעטפת של האתר הציבורי: כותרת, פוטר, באנר העוגיות ותפריט הנגישות.
 * מערכת הניהול יושבת מחוץ לקבוצת המסלולים הזו ולכן אינה מקבלת אותם.
 *
 * תפריט הנגישות אינו מותנה בשום מתג — הוא חובה חוקית בכל אתר שנגזר
 * מהתשתית, ו-scripts/check-gso.mjs מוודא שהוא נשאר כאן.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { site } = await getSiteContent();
  return (
    <>
      <Header site={site} />
      {children}
      <Footer site={site} />
      <CookieBanner />
      <AccessibilityMenu />
    </>
  );
}
