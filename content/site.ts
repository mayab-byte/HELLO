/**
 * נוסחי הטקסט של הסקשנים.
 *
 * הזהות — שם, פרטי קשר, רשתות, תפריט, קישורים משפטיים — **אינה כאן**.
 * היא ב-dna.ts, והקובץ הזה נגזר ממנה. כך אין שני מקומות שיכולים לסתור.
 *
 * בשלב ה-CMS התוכן שלמטה יוחלף בקריאות למסד — באותו מבנה בדיוק,
 * כדי שהקומפוננטות לא ישתנו.
 */

import { dna } from '@/dna';
import { activeNav } from '@/lib/dna';

/** הזהות, כפי שהקומפוננטות צורכות אותה. מקור יחיד: dna.ts */
export const site = {
  name: dna.brand.name,
  logoMark: dna.brand.logoMark,
  logoSrc: dna.brand.logoSrc,
  tagline: dna.brand.tagline,
  phone: dna.identity.phone,
  phoneHref: dna.identity.phoneHref,
  email: dna.identity.email,
  address: dna.identity.address,
  hours: dna.identity.hours,
  social: dna.identity.social,
  accessibilityCoordinator: dna.accessibility.coordinator,
};

export const nav = activeNav(dna);

export const hero = {
  eyebrow: 'ליווי מקצועי מקצה לקצה',
  title: 'העסק שלכם ראוי לאתר שעובד קשה כמוכם',
  lead: 'אנחנו בונים נוכחות דיגיטלית שמביאה פניות אמיתיות — מהיר, נגיש ומותאם לכל מסך. בלי הבטחות באוויר, עם תוצאות שאפשר למדוד.',
  primaryCta: { label: 'לקבלת הצעת מחיר', href: '#contact' },
  secondaryCta: { label: 'לשירותים שלנו', href: '#services' },
  image: { src: '/images/hero.svg', alt: 'צוות העסק בפגישת עבודה סביב שולחן' },
};

export const trust = [
  { value: '12+', label: 'שנות ניסיון' },
  { value: '340', label: 'לקוחות מרוצים' },
  { value: '98%', label: 'שיעור שביעות רצון' },
  { value: '24ש׳', label: 'זמן תגובה ממוצע' },
];

export const services = {
  eyebrow: 'מה אנחנו עושים',
  title: 'שירותים שמותאמים לגודל ולקצב שלכם',
  lead: 'כל שירות נבנה סביב מטרה עסקית ברורה, עם לוח זמנים ותוצר מוגדר מראש.',
  items: [
    { icon: '◆', title: 'ייעוץ ואפיון', text: 'מיפוי הצרכים, הגדרת יעדים ובניית תוכנית עבודה מסודרת לפני שכותבים שורת קוד אחת.', href: '#contact' },
    { icon: '◇', title: 'בנייה והטמעה', text: 'ביצוע מלא בסטנדרט גבוה, כולל בדיקות איכות ונגישות לפני העלייה לאוויר.', href: '#contact' },
    { icon: '○', title: 'ליווי שוטף', text: 'עדכונים, גיבויים, מעקב ביצועים ותמיכה זמינה — כדי שהמערכת תמשיך לעבוד.', href: '#contact' },
    { icon: '□', title: 'אופטימיזציה', text: 'שיפור מתמיד של שיעורי ההמרה על בסיס נתונים אמיתיים, לא תחושות בטן.', href: '#contact' },
    { icon: '△', title: 'הדרכה', text: 'מעבירים אליכם את המושכות — הדרכה מלאה על מערכת הניהול ומסמכי עבודה.', href: '#contact' },
    { icon: '☰', title: 'תמיכה טכנית', text: 'פתרון תקלות בזמן אמת, עם התחייבות לזמני תגובה שנקבעים מראש בהסכם.', href: '#contact' },
  ],
};

export const about = {
  eyebrow: 'קצת עלינו',
  title: 'עובדים איתכם, לא עליכם',
  paragraphs: [
    'התחלנו לפני יותר מעשור מתוך תסכול פשוט: יותר מדי עסקים טובים משלמים על שירות בינוני. החלטנו לעשות את זה אחרת — שקוף, מדיד ובלי אותיות קטנות.',
    'היום אנחנו צוות של אנשי מקצוע שמלווה עסקים מכל הגדלים. כל פרויקט מקבל איש קשר אחד, לוח זמנים כתוב ודוח התקדמות שוטף.',
  ],
  points: [
    'איש קשר אחד לאורך כל הפרויקט',
    'הצעת מחיר מפורטת ללא עלויות נסתרות',
    'עמידה בלוחות זמנים — מעוגן בהסכם',
    'תמיכה מלאה גם אחרי סיום הפרויקט',
  ],
  image: { src: '/images/about.svg', alt: 'שני עובדים בוחנים יחד מסמכי עבודה במשרד' },
};

export const gallery = {
  eyebrow: 'תיק עבודות',
  title: 'פרויקטים שיצאו לדרך',
  lead: 'מבחר עבודות אחרונות. כל פריט כאן מנוהל דרך מערכת הניהול ומתעדכן בלחיצה.',
  items: [
    { src: '/images/gallery-1.svg', alt: 'צילום פנים של חלל עבודה מעוצב', caption: 'פרויקט ראשון' },
    { src: '/images/gallery-2.svg', alt: 'מסך מחשב המציג ממשק ניהול', caption: 'פרויקט שני' },
    { src: '/images/gallery-3.svg', alt: 'פגישת צוות בחדר ישיבות', caption: 'פרויקט שלישי' },
    { src: '/images/gallery-4.svg', alt: 'שרטוט אפיון על לוח לבן', caption: 'פרויקט רביעי' },
  ],
};

export const testimonials = {
  eyebrow: 'מה אומרים עלינו',
  title: 'לקוחות מספרים',
  items: [
    { quote: 'תוך חודש מהעלייה לאוויר הכפלנו את כמות הפניות. הליווי היה צמוד והכל עמד בזמנים שסוכמו מראש.', name: 'דנה לוי', role: 'מנכ"לית, חברת דוגמה', rating: 5, avatar: '/images/avatar-1.svg' },
    { quote: 'סוף סוף מערכת שאני מצליחה לעדכן לבד בלי לקרוא למישהו. פשוט נכנסת, מחליפה טקסט או תמונה, ושומרת.', name: 'יוסי כהן', role: 'בעלים, עסק לדוגמה', rating: 5, avatar: '/images/avatar-2.svg' },
    { quote: 'העבודה על הנגישות נעשתה ברצינות ולא כדי לסמן וי. קיבלנו אתר שכל הלקוחות שלנו יכולים להשתמש בו.', name: 'מיכל ברק', role: 'מנהלת שיווק', rating: 5, avatar: '/images/avatar-3.svg' },
  ],
};

export const posts = {
  eyebrow: 'מהבלוג',
  title: 'מאמרים אחרונים',
  lead: 'תכנים מקצועיים שנכתבים על ידי הצוות ומתעדכנים דרך מערכת הניהול.',
  items: [
    { title: 'איך בוחרים ספק דיגיטל בלי להתחרט', excerpt: 'חמש שאלות שכדאי לשאול לפני שחותמים, ומה התשובות אמורות להישמע.', date: '2026-08-12', dateLabel: '12 באוגוסט 2026', category: 'מדריכים', href: '#', image: { src: '/images/post-1.svg', alt: 'אדם קורא מסמך הצעת מחיר' } },
    { title: 'נגישות אתרים: מה החוק בישראל דורש בפועל', excerpt: 'סקירה קצרה של תקן ת"י 5568 ומה זה אומר על האתר שלכם בפועל.', date: '2026-07-28', dateLabel: '28 ביולי 2026', category: 'נגישות', href: '#', image: { src: '/images/post-2.svg', alt: 'משתמש מנווט באתר בעזרת מקלדת' } },
    { title: 'למה מהירות טעינה שווה כסף', excerpt: 'הקשר הישיר בין שנייה של המתנה לבין אחוזי נטישה — עם מספרים.', date: '2026-07-05', dateLabel: '5 ביולי 2026', category: 'ביצועים', href: '#', image: { src: '/images/post-3.svg', alt: 'גרף המציג זמני טעינה של עמוד' } },
  ],
};

export const contact = {
  eyebrow: 'נשמח לשמוע',
  title: 'בואו נדבר על הפרויקט שלכם',
  lead: 'השאירו פרטים ונחזור אליכם בתוך יום עסקים אחד. אין התחייבות ואין שיחות מכירה אגרסיביות.',
};

export const legalLinks = dna.legalLinks;
