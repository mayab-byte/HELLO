/**
 * פענוח פרמטר מסלול.
 *
 * Next מעביר את הפרמטר כפי שהוא הופיע בכתובת. עבור slug בעברית זהו
 * רצף מקודד (%D7%9E…) שלא יימצא במסד, ולכן חובה לפענח. הפענוח עטוף
 * ב-try כי כתובת פגומה זורקת URIError — ואז מחזירים את המקור,
 * שפשוט לא יימצא ויוביל ל-404 תקין במקום לקריסה.
 */
export function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
