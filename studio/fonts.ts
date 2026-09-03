/**
 * רשימת Google Fonts. נטענת מה-API של גוגל אם יש מפתח, אחרת נופלת
 * לרשימה מקוצרת עם דגש על פונטים שתומכים בעברית.
 */
export const HEBREW_FONTS = [
  'Assistant', 'Heebo', 'Rubik', 'Varela Round', 'Secular One', 'Suez One',
  'Frank Ruhl Libre', 'David Libre', 'Alef', 'Amatic SC', 'Bellefair',
  'Karantina', 'Miriam Libre', 'Noto Sans Hebrew', 'Noto Serif Hebrew', 'Tinos',
];

export const LATIN_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway',
  'Nunito', 'Work Sans', 'DM Sans', 'Manrope', 'Playfair Display', 'Merriweather',
  'Source Sans 3', 'IBM Plex Sans', 'Space Grotesk', 'Outfit', 'Figtree',
];

/** פונטים שכבר מוגדרים בפרויקט (נקראים מטוקני העיצוב). */
export function projectFonts(): string[] {
  const cs = getComputedStyle(document.documentElement);
  const out = new Set<string>();
  for (const v of ['--font-heading', '--font-body']) {
    const raw = cs.getPropertyValue(v).trim();
    const first = raw.split(',')[0]?.replace(/['"]/g, '').trim();
    if (first) out.add(first);
  }
  return [...out];
}

let cached: string[] | null = null;

export async function allFonts(): Promise<string[]> {
  if (cached) return cached;
  const base = [...new Set([...projectFonts(), ...HEBREW_FONTS, ...LATIN_FONTS])];
  try {
    const res = await fetch('/api/studio/fonts', { cache: 'force-cache' });
    if (res.ok) {
      const list = (await res.json()) as string[];
      if (Array.isArray(list) && list.length) cached = [...new Set([...base, ...list])];
    }
  } catch { /* אין רשימה מלאה — הרשימה המקוצרת מספיקה */ }
  return (cached ??= base);
}
