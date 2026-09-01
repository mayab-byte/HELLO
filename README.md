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

## Design Studio

עורך ויזואלי חי לסגירת פינישים בעכבר: `http://localhost:3000/?edit`
**כלי פיתוח בלבד** — לא נכנס לבנייה לפרודקשן. ראה [`docs/DESIGN-STUDIO.md`](docs/DESIGN-STUDIO.md).

## שכפול ללקוח חדש

| # | קובץ | מה מחליפים |
|---|---|---|
| 1 | `app/tokens.css` | צבעים, גופנים, מרווחים, רדיוסים — **כל המיתוג במקום אחד** |
| 2 | `content/site.ts` | שם העסק, לוגו, פרטי קשר, כל הטקסטים |
| 3 | `public/images/` | התמונות |
| 4 | `content/site.ts` → `accessibilityCoordinator` | פרטי רכז הנגישות |

אחר כך `?edit` לסגירת הפינישים, ו-`npm run build`.

## מבנה

```
app/          layout, עמוד הבית, טוקנים ו-CSS גלובלי
components/   קומפוננטות האתר
content/      התוכן (יוחלף ב-CMS באותו מבנה)
studio/       Design Studio — dev בלבד
scripts/      שרת הסטודיו + אפייה
docs/         אפיון ותיעוד
```

## תיעוד

- [`docs/SPEC.md`](docs/SPEC.md) — אפיון התשתית המלא
- [`docs/DESIGN-STUDIO.md`](docs/DESIGN-STUDIO.md) — העורך הוויזואלי
