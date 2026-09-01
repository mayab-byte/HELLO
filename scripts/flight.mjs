/**
 * אפיית ה-RSC flight payload של Next App Router.
 *
 * למה זה נחוץ: ב-App Router ה-HTML הוא רק תמונת פתיחה. ליד הוא יושב
 * `self.__next_f` — תיאור עץ ה-React שממנו הלקוח מבצע הידרציה. שינוי ה-HTML
 * בלבד לא מספיק: בהידרציה React מחזיר את מה שכתוב ב-payload, כלומר אלמנט
 * שמחקנו יחזור והטקסט שערכנו יידרס. לכן אותה עריכה חייבת לחול על שניהם.
 *
 * ההתאמה נעשית לפי חתימה (tag + id + className) שנגזרת מהאלמנט שכבר אותר
 * ב-DOM, ומוחלת רק כשהיא חד-משמעית בעץ — אחרת מדווחים ולא נוגעים.
 */

const PUSH_RE = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
const ROW_SPLIT = /\n(?=[0-9a-f]+:)/;

const isEl = (n) => Array.isArray(n) && n[0] === '$' && typeof n[1] === 'string';

/** מעבר על כל צומת אלמנט בעץ, יחד עם המערך שמכיל אותו והאינדקס בתוכו. */
function walk(node, visit, parent = null, key = null) {
  if (Array.isArray(node)) {
    if (isEl(node)) {
      visit(node, parent, key);
      const props = node[3];
      if (props && typeof props === 'object') walk(props.children, visit, node, 'children');
      return;
    }
    for (let i = 0; i < node.length; i++) walk(node[i], visit, node, i);
    return;
  }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) walk(node[k], visit, node, k);
  }
}

function matches(node, sig) {
  if (node[1] !== sig.tag) return false;
  const p = node[3] ?? {};
  if (sig.id) return p.id === sig.id;
  if (sig.className) return p.className === sig.className;
  return false;
}

function findAll(tree, sig) {
  const hits = [];
  walk(tree, (node, parent, key) => { if (matches(node, sig)) hits.push({ node, parent, key }); });
  return hits;
}

/**
 * @param {string} html   תוכן קובץ ה-HTML
 * @param {{sig:object,selector:string}[]} removals
 * @param {{sig:object,selector:string,html:string}[]} texts
 */
export function bakeFlight(html, removals, texts) {
  const pushes = [...html.matchAll(PUSH_RE)];
  if (!pushes.length) return { html, removed: 0, retexted: 0, warnings: [] };

  const payload = pushes.map((m) => JSON.parse(m[1])).join('');
  const rows = payload.split(ROW_SPLIT);
  const warnings = [];
  let removed = 0;
  let retexted = 0;

  const parsed = rows.map((row) => {
    const i = row.indexOf(':');
    if (i < 0) return { row, tree: null };
    const head = row.slice(0, i + 1);
    const rest = row.slice(i + 1);
    // רק שורות שהן עץ (מערך או אובייקט). שורות I[...] ומחרוזות נשארות כמו שהן.
    // העץ הראשי של העמוד הוא דווקא אובייקט (0:{...}), לכן שניהם נדרשים.
    if (rest[0] !== '[' && rest[0] !== '{') return { row, tree: null };
    try { return { head, tree: JSON.parse(rest), row }; }
    catch { return { row, tree: null }; }
  });

  const apply = (fn) => {
    for (const p of parsed) if (p.tree) fn(p.tree);
  };

  for (const { sig, selector } of removals) {
    const hits = [];
    apply((tree) => hits.push(...findAll(tree, sig)));
    if (hits.length !== 1) {
      warnings.push(`דילוג על מחיקה ב-flight עבור ${selector}: ${hits.length} התאמות (נדרשת בדיוק אחת)`);
      continue;
    }
    const { parent, key } = hits[0];
    if (Array.isArray(parent) && typeof key === 'number') parent.splice(key, 1);
    else if (parent && typeof key === 'string') parent[key] = null;
    removed++;
  }

  for (const { sig, selector, html: inner } of texts) {
    const hits = [];
    apply((tree) => hits.push(...findAll(tree, sig)));
    if (hits.length !== 1) {
      warnings.push(`דילוג על טקסט ב-flight עבור ${selector}: ${hits.length} התאמות (נדרשת בדיוק אחת)`);
      continue;
    }
    const props = (hits[0].node[3] ??= {});
    delete props.children;
    props.dangerouslySetInnerHTML = { __html: inner };
    retexted++;
  }

  if (!removed && !retexted) return { html, removed, retexted, warnings };

  const rebuilt = parsed.map((p) => (p.tree ? p.head + JSON.stringify(p.tree) : p.row)).join('\n');

  // כל ה-payload נדחף מחדש כ-push אחד; שאר ה-push המקוריים מרוקנים.
  let first = true;
  const out = html.replace(PUSH_RE, () => {
    if (!first) return 'self.__next_f.push([1,""])';
    first = false;
    return `self.__next_f.push([1,${JSON.stringify(rebuilt)}])`;
  });

  return { html: out, removed, retexted, warnings };
}
