import type { Metadata } from 'next';
import { dna } from '@/dna';
import PageHeader from '@/components/site/PageHeader';

export const metadata: Metadata = {
  title: 'הצהרת נגישות',
  description: 'הצהרת הנגישות של האתר, רמת ההתאמה ופרטי רכז הנגישות.',
};

/**
 * הצהרת נגישות לפי תקנות שוויון זכויות לאנשים עם מוגבלות
 * (התאמות נגישות לשירות), התשע"ג-2013.
 * כל הפרטים נגזרים מ-dna.ts — בשכפול ללקוח אין מה לערוך כאן.
 */
export default function AccessibilityPage() {
  const { accessibility: a, brand, identity } = dna;
  const updated = new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' })
    .format(new Date(a.statementUpdated));

  return (
    <>
      <PageHeader title="הצהרת נגישות" lead={`עודכנה ב-${updated}`} />
      <main id="main">
        <div className="section">
          <div className="container container-narrow prose">
            <h2>המחויבות שלנו</h2>
            <p>
              ב{brand.name} אנו רואים בנגישות האתר חלק מהשירות עצמו, ופועלים כדי
              שכל אדם יוכל להשתמש בו באופן עצמאי, נוח ובטוח — לרבות אנשים עם מוגבלות.
            </p>

            <h2>רמת הנגישות באתר</h2>
            <p>
              האתר הונגש לרמה <strong>{a.level}</strong> בהתאם לתקן הישראלי {a.standard}.
              הנגישות מובנית בקוד האתר ואינה נשענת על תוסף חיצוני.
            </p>

            <h2>מה הונגש בפועל</h2>
            <ul>
              <li>ניווט מלא באמצעות מקלדת, עם חיווי פוקוס נראה על כל רכיב</li>
              <li>קישור &quot;דלג לתוכן הראשי&quot; כראשון בסדר הניווט</li>
              <li>יחסי ניגודיות העומדים בתקן — נבדקים אוטומטית בכל עדכון של האתר</li>
              <li>טקסט חלופי לכל תמונה; תמונות דקורטיביות מוסתרות מקוראי מסך</li>
              <li>מבנה כותרות היררכי ותגיות סמנטיות לאזורי העמוד</li>
              <li>טפסים עם תוויות מפורשות והודעות שגיאה מילוליות הקשורות לשדה</li>
              <li>התאמה מלאה לכל גודל מסך, והגדלה עד 200% ללא אובדן תוכן</li>
              <li>כיבוד העדפת המערכת להפחתת אנימציות</li>
              <li>האתר נבדק בקורא מסך ובניווט מקלדת בנוסף לבדיקות אוטומטיות</li>
            </ul>

            <h2>חלקים שאינם נגישים במלואם</h2>
            <p>
              ייתכן שתכנים שהועלו על ידי צדדים שלישיים, או רכיבים חיצוניים המוטמעים
              באתר, אינם נגישים במלואם. אנו פועלים לתקן זאת בהדרגה. אם נתקלתם
              בקושי — נשמח שתדווחו לנו ונטפל בכך.
            </p>

            <h2>רכז הנגישות</h2>
            <p>
              לפניות בנושא נגישות, לרבות דיווח על ליקוי או בקשה להתאמה:
            </p>
            <ul>
              <li>שם: {a.coordinator.name}</li>
              <li>אימייל: <a href={`mailto:${a.coordinator.email}`}>{a.coordinator.email}</a></li>
              <li>טלפון: <a href={`tel:${a.coordinator.phone.replace(/[^\d+]/g, '')}`}>{a.coordinator.phone}</a></li>
              <li>כתובת: {identity.address}</li>
            </ul>
            <p>
              נשתדל להשיב לכל פנייה בהקדם, ולא יאוחר מ-30 יום. אם התשובה לא סיפקה
              אתכם, ניתן לפנות לנציבות שוויון זכויות לאנשים עם מוגבלות במשרד המשפטים.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
