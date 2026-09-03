/**
 * יצירת סלקטור ייחודי ויציב, ששורד build.
 * העיקרון: מחלקות סמנטיות כשאפשר, :nth-of-type כשאין, שרשור עם ">" עד ייחודיות.
 */

/** מזהה מחלקות שנוצרו אוטומטית (CSS Modules / CSS-in-JS) — אלה לא שורדות build. */
function isStableClass(cls: string): boolean {
  if (!cls || cls.startsWith('ds-')) return false;
  if (/^css-[a-z0-9]+$/i.test(cls)) return false;          // emotion / styled
  if (/_[A-Za-z0-9]{5,}$/.test(cls)) return false;          // CSS Modules: Button_root__x7Fa2
  if (/^[a-z]+-[a-f0-9]{6,}$/i.test(cls)) return false;     // hash suffix
  if (/[a-f0-9]{8,}/i.test(cls)) return false;              // hash כלשהו
  return true;
}

function stableClasses(el: Element): string[] {
  return Array.from(el.classList).filter(isStableClass);
}

/** חלק סלקטור עבור אלמנט בודד, יחסית להורה שלו. */
function segment(el: Element): string {
  const tag = el.tagName.toLowerCase();

  if (el.id && /^[A-Za-z][\w-]*$/.test(el.id)) return `#${el.id}`;

  const classes = stableClasses(el);
  if (classes.length) {
    const withClasses = tag + classes.map((c) => `.${CSS.escape(c)}`).join('');
    const parent = el.parentElement;
    if (parent) {
      const sameLevel = Array.from(parent.children).filter((c) => c.matches(withClasses));
      if (sameLevel.length === 1) return withClasses;
      return `${withClasses}:nth-of-type(${indexOfType(el)})`;
    }
    return withClasses;
  }

  return `${tag}:nth-of-type(${indexOfType(el)})`;
}

function indexOfType(el: Element): number {
  let i = 1;
  let sib = el.previousElementSibling;
  while (sib) {
    if (sib.tagName === el.tagName) i++;
    sib = sib.previousElementSibling;
  }
  return i;
}

export function isUnique(sel: string): boolean {
  try {
    return document.querySelectorAll(sel).length === 1;
  } catch {
    return false;
  }
}

/**
 * בונה סלקטור מהאלמנט כלפי מעלה, ומוסיף אבות עד שהוא ייחודי.
 * מעוגן לפי מזהה יציב (id) ברגע שנתקלים בו.
 */
export function buildSelector(el: Element): string | null {
  if (!(el instanceof Element) || el === document.body || el === document.documentElement) return null;

  const parts: string[] = [];
  let node: Element | null = el;

  while (node && node !== document.body) {
    parts.unshift(segment(node));
    const candidate = parts.join(' > ');
    if (isUnique(candidate)) return candidate;
    // עיגון למזהה — משם ולמעלה אין צורך להמשיך
    if (node.id && parts[0].startsWith('#')) break;
    node = node.parentElement;
  }

  const full = parts.join(' > ');
  if (isUnique(full)) return full;

  // מוצא אחרון: שרשור מלא מגוף המסמך
  const fromBody = `body > ${full}`;
  return isUnique(fromBody) ? fromBody : (document.querySelectorAll(full).length ? full : null);
}

/**
 * טיפוס בעץ: קליק על אות/מילה בתוך כותרת מפוצלת, או על <b> בתוך פסקה,
 * בוחר את בלוק הטקסט השלם ולא את הרסיס.
 */
const INLINE_TAGS = new Set(['SPAN', 'B', 'STRONG', 'I', 'EM', 'U', 'SMALL', 'MARK', 'CODE', 'BR', 'A', 'TIME']);
const TEXT_BLOCKS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI', 'BLOCKQUOTE', 'FIGCAPTION', 'LABEL', 'BUTTON', 'TD', 'TH', 'DT', 'DD']);

export function resolveTarget(el: Element): Element {
  let node: Element = el;
  // עולה כל עוד אנחנו בתוך אלמנט inline שיושב בתוך בלוק טקסט
  while (
    node.parentElement &&
    INLINE_TAGS.has(node.tagName) &&
    (TEXT_BLOCKS.has(node.parentElement.tagName) || INLINE_TAGS.has(node.parentElement.tagName))
  ) {
    node = node.parentElement;
  }
  return node;
}

/** האם מותר לערוך את נוסח הטקסט של האלמנט (לא כותרת מפוצלת-אותיות). */
export function isTextEditable(el: Element): boolean {
  if (el.querySelector('img, svg, video, canvas, iframe, input, textarea, select')) return false;
  // כותרת מפוצלת לאנימציית reveal — עריכת נוסח תשבור אותה. עיצוב בלבד.
  if (el.querySelector('[data-split], .split-char, .split-word, [aria-hidden="true"] + [aria-hidden="true"]')) return false;
  if (el.children.length > 3 && Array.from(el.children).every((c) => INLINE_TAGS.has(c.tagName) && (c.textContent ?? '').length <= 2)) return false;
  return TEXT_BLOCKS.has(el.tagName) || INLINE_TAGS.has(el.tagName) || el.children.length === 0;
}

/** תיאור קריא לאדם, לעץ המבנה ולכותרת הפאנל. */
export function describe(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const cls = stableClasses(el)[0];
  const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 28);
  const name = cls ? `${tag}.${cls}` : tag;
  return text ? `${name} — ${text}` : name;
}
