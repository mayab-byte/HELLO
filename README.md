# תשתית אתר תבנית — BMF360

אתר-אב לשכפול: כל פרויקט לקוח מתחיל מ-`git clone` של המאגר הזה.

Next.js 15 · React 19 · TypeScript · ייצוא סטטי · RTL · נגישות AA

## הרצה

```bash
npm install
npm run dev      # http://localhost:3000
```

| פקודה | מה היא עושה |
|---|---|
| `npm run dev` | Next dev + שרת ה-Design Studio |
| `npm run build` | `next build` → `out/` ואז אפיית הפתקים |
| `npm run bake` | אפייה בלבד, על `out/` קיים |

## מערכת ניהול

הלקוח נכנס ב-`/admin` ומנהל את התוכן בעצמו: טקסטים, תמונות, מאמרים,
שירותים, גלריה והמלצות. התחברות עם אימות דו-שלבי, הרשאות ופניות מהטופס.
ראה [`docs/CMS.md`](docs/CMS.md).

```bash
createdb sitebase && cp .env.example .env   # למלא DATABASE_URL ו-SESSION_SECRET
npx prisma migrate deploy && npm run db:seed
npm run dev                                  # http://localhost:3000/admin
```

## Design Studio

עורך ויזואלי חי לסגירת פינישים בעכבר: `http://localhost:3000/?edit`
**כלי פיתוח בלבד** — לא נכנס לבנייה לפרודקשן. ראה [`docs/DESIGN-STUDIO.md`](docs/DESIGN-STUDIO.md).

## קובץ ה-DNA

**`dna.ts`** בשורש הוא הקובץ היחיד שמגדיר מי האתר: מותג, צבעים, גופנים,
פרטי קשר, רכז נגישות, SEO, ואילו סקשנים מוצגים. ממנו נגזרים אוטומטית
משתני ה-CSS, טעינת הגופנים, המטא־דאטה והתפריט.

הפלטה נבדקת מול תקן AA בכל בנייה — צבע שלא עומד בניגודיות מפיל את
הבנייה. ראה [`docs/DNA.md`](docs/DNA.md).

## שכפול ללקוח חדש

| # | קובץ | מה מחליפים |
|---|---|---|
| 1 | **`dna.ts`** | שם, פרטי קשר, צבעים, גופנים, רכז נגישות, סקשנים פעילים |
| 2 | `content/site.ts` | נוסחי הטקסט של הסקשנים |
| 3 | `public/images/` | התמונות |

אחר כך `npm run check:dna`, `?edit` לסגירת הפינישים, ו-`npm run build`.

## העלאה לאוויר

### GitHub Pages — הכי מהיר, בלי חשבון נוסף
ה-workflow כבר במאגר. הפעלה חד-פעמית:
**Settings → Pages → Source: `GitHub Actions`**

מאותו רגע כל `push` בונה ומפרסם אוטומטית.
הכתובת: `https://<שם-המשתמש>.github.io/<שם-המאגר>/`

### Vercel — מומלץ לאתר של לקוח אמיתי
`vercel.com` → Import Git Repository → בחירת המאגר → Deploy.
Next.js מזוהה אוטומטית, אין מה להגדיר. דומיין מותאם בלחיצה.

### כל אחסון סטטי
`npm run build` מייצר את `out/` — HTML/CSS/JS בלבד.
מעלים את התיקייה לכל שרת (Netlify, Cloudflare Pages, cPanel, S3).

> **תת-נתיב:** אם האתר לא יושב בשורש הדומיין, יש להעביר `BASE_PATH=/הנתיב`
> בזמן הבנייה. ב-GitHub Pages זה קורה אוטומטית. בשורש — לא צריך כלום.

## מבנה

```
dna.ts        ★ ה-DNA של האתר — הקובץ שעורכים בכל פרויקט
prisma/       סכימת מסד הנתונים
lib/          מסד, אימות, תוכן, מדיה
app/admin/    מערכת הניהול
app/          layout, עמוד הבית, טוקנים ו-CSS גלובלי
components/   קומפוננטות האתר
content/      התוכן (יוחלף ב-CMS באותו מבנה)
studio/       Design Studio — dev בלבד
scripts/      שרת הסטודיו + אפייה
docs/         אפיון ותיעוד
```

## תיעוד

- [`docs/DNA.md`](docs/DNA.md) — קובץ ה-DNA
- [`docs/CMS.md`](docs/CMS.md) — מערכת הניהול והאבטחה
- [`docs/SPEC.md`](docs/SPEC.md) — אפיון התשתית המלא
- [`docs/DESIGN-STUDIO.md`](docs/DESIGN-STUDIO.md) — העורך הוויזואלי
