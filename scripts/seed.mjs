/**
 * זריעת המסד: משתמש מנהל ראשון + תוכן ההתחלה של התבנית.
 * בטוח להרצה חוזרת — לא מוחק דבר ולא דורס תוכן קיים.
 *
 *   npm run db:seed
 *   ADMIN_EMAIL=me@co.il ADMIN_PASSWORD='…' npm run db:seed
 */
import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaClient } from '@prisma/client';

const scrypt = promisify(scryptCb);
const db = new PrismaClient();

const PARAMS = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };

async function hash(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, 64, PARAMS);
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

const log = (...a) => console.log('[seed]', ...a);

async function main() {
  // ── משתמש מנהל ──
  const email = (process.env.ADMIN_EMAIL || 'admin@example.co.il').toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    log(`המנהל ${email} כבר קיים — מדלגים.`);
  } else {
    const password = process.env.ADMIN_PASSWORD || `${randomBytes(9).toString('base64url')}!7`;
    await db.user.create({
      data: { email, name: process.env.ADMIN_NAME || 'מנהל האתר', role: 'ADMIN', passwordHash: await hash(password) },
    });
    log('נוצר משתמש מנהל:');
    log(`  אימייל: ${email}`);
    log(`  סיסמה: ${password}`);
    if (!process.env.ADMIN_PASSWORD) log('  ⚠ הסיסמה נוצרה אקראית ומוצגת כאן פעם אחת בלבד.');
  }

  // ── הגדרות האתר ──
  if (!(await db.siteSettings.findUnique({ where: { id: 'singleton' } }))) {
    await db.siteSettings.create({
      data: {
        id: 'singleton',
        brandName: 'שם העסק',
        tagline: 'פתרונות מקצועיים לעסקים',
        phone: '03-0000000',
        email: 'info@example.co.il',
        address: 'רחוב הדוגמה 1, תל אביב',
        hours: "ימים א'–ה', 09:00–18:00",
        heroEyebrow: 'ליווי מקצועי מקצה לקצה',
        heroTitle: 'העסק שלכם ראוי לאתר שעובד קשה כמוכם',
        heroLead:
          'אנחנו בונים נוכחות דיגיטלית שמביאה פניות אמיתיות — מהיר, נגיש ומותאם לכל מסך. בלי הבטחות באוויר, עם תוצאות שאפשר למדוד.',
        aboutTitle: 'עובדים איתכם, לא עליכם',
        aboutBody:
          'התחלנו לפני יותר מעשור מתוך תסכול פשוט: יותר מדי עסקים טובים משלמים על שירות בינוני. החלטנו לעשות את זה אחרת — שקוף, מדיד ובלי אותיות קטנות.\n\nהיום אנחנו צוות של אנשי מקצוע שמלווה עסקים מכל הגדלים. כל פרויקט מקבל איש קשר אחד, לוח זמנים כתוב ודוח התקדמות שוטף.',
        contactTitle: 'בואו נדבר על הפרויקט שלכם',
        contactLead:
          'השאירו פרטים ונחזור אליכם בתוך יום עסקים אחד. אין התחייבות ואין שיחות מכירה אגרסיביות.',
      },
    });
    log('נוצרו הגדרות האתר.');
  } else {
    log('הגדרות האתר כבר קיימות — מדלגים.');
  }

  // ── שירותים ──
  if ((await db.service.count()) === 0) {
    await db.service.createMany({
      data: [
        { title: 'ייעוץ ואפיון', icon: '◆', order: 1, ctaHref: '#contact', status: 'PUBLISHED',
          summary: 'מיפוי הצרכים, הגדרת יעדים ובניית תוכנית עבודה מסודרת לפני שכותבים שורת קוד אחת.' },
        { title: 'בנייה והטמעה', icon: '◇', order: 2, ctaHref: '#contact', status: 'PUBLISHED',
          summary: 'ביצוע מלא בסטנדרט גבוה, כולל בדיקות איכות ונגישות לפני העלייה לאוויר.' },
        { title: 'ליווי שוטף', icon: '○', order: 3, ctaHref: '#contact', status: 'PUBLISHED',
          summary: 'עדכונים, גיבויים, מעקב ביצועים ותמיכה זמינה — כדי שהמערכת תמשיך לעבוד.' },
        { title: 'אופטימיזציה', icon: '□', order: 4, ctaHref: '#contact', status: 'PUBLISHED',
          summary: 'שיפור מתמיד של שיעורי ההמרה על בסיס נתונים אמיתיים, לא תחושות בטן.' },
        { title: 'הדרכה', icon: '△', order: 5, ctaHref: '#contact', status: 'PUBLISHED',
          summary: 'מעבירים אליכם את המושכות — הדרכה מלאה על מערכת הניהול ומסמכי עבודה.' },
        { title: 'תמיכה טכנית', icon: '☰', order: 6, ctaHref: '#contact', status: 'PUBLISHED',
          summary: 'פתרון תקלות בזמן אמת, עם התחייבות לזמני תגובה שנקבעים מראש בהסכם.' },
      ],
    });
    log('נוצרו 6 שירותים.');
  }

  // ── המלצות ──
  if ((await db.testimonial.count()) === 0) {
    await db.testimonial.createMany({
      data: [
        { name: 'דנה לוי', role: 'מנכ"לית, חברת דוגמה', rating: 5, order: 1, status: 'PUBLISHED',
          quote: 'תוך חודש מהעלייה לאוויר הכפלנו את כמות הפניות. הליווי היה צמוד והכל עמד בזמנים שסוכמו מראש.' },
        { name: 'יוסי כהן', role: 'בעלים, עסק לדוגמה', rating: 5, order: 2, status: 'PUBLISHED',
          quote: 'סוף סוף מערכת שאני מצליחה לעדכן לבד בלי לקרוא למישהו. פשוט נכנסת, מחליפה טקסט או תמונה, ושומרת.' },
        { name: 'מיכל ברק', role: 'מנהלת שיווק', rating: 5, order: 3, status: 'PUBLISHED',
          quote: 'העבודה על הנגישות נעשתה ברצינות ולא כדי לסמן וי. קיבלנו אתר שכל הלקוחות שלנו יכולים להשתמש בו.' },
      ],
    });
    log('נוצרו 3 המלצות.');
  }

  log('הזריעה הושלמה.');
}

main()
  .catch((e) => { console.error('[seed] נכשל:', e); process.exit(1); })
  .finally(() => db.$disconnect());
