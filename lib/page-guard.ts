import { notFound } from 'next/navigation';
import { dna } from '@/dna';
import type { SectionKey } from '@/lib/dna';

/**
 * עמוד פנימי קיים רק אם הסקשן שלו פעיל ב-dna.ts.
 * בלי זה, כיבוי סקשן היה מסתיר אותו מהתפריט אך משאיר עמוד חי
 * שמנועי חיפוש וקישורים ישנים עדיין מגיעים אליו.
 */
export function requireSection(key: SectionKey) {
  if (!dna.sections[key]) notFound();
}
