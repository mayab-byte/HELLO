/** האם האלמנט נמצא בשכבה "כבויה" שאסור לבחור בה (מודל סגור, תפריט מוסתר). */
export function isSelectable(el: Element): boolean {
  if (el.closest('.ds-root')) return false;
  if (el.closest('[hidden]')) return false;

  let node: Element | null = el;
  while (node && node !== document.body) {
    const cs = getComputedStyle(node);
    // ⚠️ לא בודקים opacity — opacity:0 משמש לאנימציות reveal, זה לא "מוסתר".
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (node.getAttribute('aria-hidden') === 'true' && !node.contains(document.activeElement)) {
      // aria-hidden על אייקון דקורטיבי זה בסדר; על מיכל שלם — לא.
      if (node.children.length > 0) return false;
    }
    node = node.parentElement;
  }
  return true;
}

/** כל האלמנטים הניתנים לעריכה, לעץ המבנה ולמונה. */
export function collectEditable(root: Element = document.body): Element[] {
  const out: Element[] = [];
  const walk = (el: Element, depth: number) => {
    if (el.closest('.ds-root')) return;
    if (depth > 0) out.push(el);
    if (depth > 12) return;
    for (const child of Array.from(el.children)) walk(child, depth + 1);
  };
  walk(root, 0);
  return out;
}

export function depthOf(el: Element): number {
  let d = 0;
  let n = el.parentElement;
  while (n && n !== document.body) { d++; n = n.parentElement; }
  return d;
}
