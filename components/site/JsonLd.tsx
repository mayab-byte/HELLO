/**
 * נקודת ההזרקה היחידה של JSON-LD באתר.
 *
 * כל סימון עובר כאן, כדי שההמרה למחרוזת תיעשה במקום אחד ותוכל להיות
 * מוקשחת במקום אחד. `<` מוברח: ערך תוכן שמכיל `</script>` היה סוגר את
 * התגית ומאפשר הזרקה, וזה ערך שמגיע ממערכת הניהול ולכן אינו בשליטתנו.
 *
 * `undefined` נופל אוטומטית ב-JSON.stringify, ולכן שדות אופציונליים
 * בצמתים פשוט לא מופיעים במקום להופיע ריקים.
 */
export default function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
