import { dna } from '@/dna';
import { faqNode } from '@/lib/gso';
import JsonLd from './JsonLd';

/**
 * סקשן השאלות והתשובות — הרכיב המרכזי של GSO באתר.
 *
 * ★ הקומפוננטה מציגה את השאלות **וגם** פולטת את ה-FAQPage, משניהם מאותו
 *   מקור: dna.gso.answers. זו לא נוחות, זו אכיפה מבנית. סימון FAQ על
 *   תוכן שאינו גלוי בעמוד הוא הפרה של הנחיות גוגל, וכאן פשוט אין דרך
 *   להגיע למצב הזה — הסימון והמסך לא יכולים להיפרד.
 *
 * המימוש הוא <details>/<summary> טהור: נפתח ונסגר בלי שורת JavaScript,
 * עובד מהמקלדת כברירת מחדל, ונקרא כראוי בקורא מסך. חשוב לא פחות —
 * הטקסט נמצא ב-DOM גם כשהתשובה סגורה, ולכן סורק שלא מריץ JS רואה אותו.
 */
export default function Faq({ heading = true }: { heading?: boolean }) {
  const { answers } = dna.gso;
  if (!answers.length) return null;

  return (
    <section id="faq" className="section" aria-labelledby="faq-title">
      <JsonLd data={faqNode(dna)} />
      <div className="container container-narrow">
        {heading && (
          <div className="section-head">
            <span className="section-eyebrow">שאלות נפוצות</span>
            <h2 id="faq-title" className="section-title">מה שרוב הלקוחות שואלים</h2>
          </div>
        )}
        {!heading && <h2 id="faq-title" className="visually-hidden">שאלות נפוצות</h2>}

        <ul className="faq-list">
          {answers.map((item) => (
            <li key={item.q} className="faq-item">
              <details>
                <summary className="faq-q">{item.q}</summary>
                <div className="faq-a"><p>{item.a}</p></div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
