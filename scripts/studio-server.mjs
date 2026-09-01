/**
 * שרת הפיתוח של Design Studio — dev בלבד, לא עולה לפרודקשן.
 * אחראי על: קריאת/כתיבת studio/overrides.json, העלאת תמונות, רשימת גלריה ופונטים.
 *
 * הפרסום הוא MERGE ולא דריסה: העורך שולח את הסט המלא (הוא עשה seed מהקובץ),
 * והשרת ממזג לפי סלקטור ומסך. אובייקט ריק / מחרוזת ריקה = מחיקת ה-override.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const FILE = path.join(ROOT, 'studio', 'overrides.json');
const UPLOADS = path.join(ROOT, 'public', 'uploads');
const IMAGES = path.join(ROOT, 'public', 'images');
const PORT = Number(process.env.STUDIO_PORT || 4321);

const SCREENS = ['desktop', 'tablet', 'mobile'];

const empty = () => ({
  text: {}, fonts: [],
  screens: Object.fromEntries(SCREENS.map((k) => [k, { styles: {}, hidden: [] }])),
});

async function read() {
  try { return { ...empty(), ...JSON.parse(await fs.readFile(FILE, 'utf8')) }; }
  catch { return empty(); }
}

function merge(base, incoming) {
  const out = { ...empty(), ...base };

  for (const [sel, html] of Object.entries(incoming.text ?? {})) {
    if (html === '' || html == null) delete out.text[sel];
    else out.text[sel] = html;
  }

  out.fonts = [...new Set([...(out.fonts ?? []), ...(incoming.fonts ?? [])])];

  for (const key of SCREENS) {
    const src = incoming.screens?.[key];
    if (!src) continue;
    const dst = (out.screens[key] ??= { styles: {}, hidden: [] });

    for (const [sel, props] of Object.entries(src.styles ?? {})) {
      if (!props || Object.keys(props).length === 0) { delete dst.styles[sel]; continue; }
      dst.styles[sel] = { ...(dst.styles[sel] ?? {}), ...props };
      for (const [p, v] of Object.entries(props)) if (v === '' || v == null) delete dst.styles[sel][p];
      if (Object.keys(dst.styles[sel]).length === 0) delete dst.styles[sel];
    }

    // hidden נשלח תמיד כרשימה מלאה למסך — זו הצהרת מצב, לא תוספת.
    if (Array.isArray(src.hidden)) dst.hidden = [...new Set(src.hidden)];
  }

  return out;
}

const json = (res, code, data) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
};

async function listImages() {
  const out = [];
  for (const [dir, prefix] of [[IMAGES, '/images'], [UPLOADS, '/uploads']]) {
    try {
      for (const f of await fs.readdir(dir)) {
        if (/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(f)) out.push(`${prefix}/${f}`);
      }
    } catch { /* התיקייה לא קיימת */ }
  }
  return out;
}

async function body(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  // סובלנות ל-trailing slash, כדי שהקריאות יעבדו גם דרך rewrite וגם ישירות.
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) url.pathname = url.pathname.slice(0, -1);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  try {
    if (url.pathname === '/api/studio/overrides' && req.method === 'GET') {
      return json(res, 200, await read());
    }

    if (url.pathname === '/api/studio/publish' && req.method === 'POST') {
      const incoming = JSON.parse((await body(req)).toString('utf8') || '{}');
      const merged = merge(await read(), incoming);
      await fs.mkdir(path.dirname(FILE), { recursive: true });
      await fs.writeFile(FILE, JSON.stringify(merged, null, 2) + '\n', 'utf8');
      console.log('[studio] פורסם →', path.relative(ROOT, FILE));
      return json(res, 200, { ok: true });
    }

    if (url.pathname === '/api/studio/images' && req.method === 'GET') {
      return json(res, 200, await listImages());
    }

    if (url.pathname === '/api/studio/fonts' && req.method === 'GET') {
      const key = process.env.GOOGLE_FONTS_API_KEY;
      if (!key) return json(res, 200, []);
      const r = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${key}&sort=popularity`);
      const d = await r.json();
      return json(res, 200, (d.items ?? []).map((i) => i.family));
    }

    if (url.pathname === '/api/studio/upload' && req.method === 'POST') {
      // multipart מינימלי — מספיק לקובץ בודד משדה file.
      const raw = await body(req);
      const ct = req.headers['content-type'] || '';
      const boundary = /boundary=(?:"([^"]+)"|([^;]+))/.exec(ct)?.[1] ?? /boundary=(?:"([^"]+)"|([^;]+))/.exec(ct)?.[2];
      if (!boundary) return json(res, 400, { error: 'missing boundary' });

      const sep = Buffer.from(`--${boundary}`);
      const headEnd = raw.indexOf('\r\n\r\n');
      const head = raw.slice(0, headEnd).toString('utf8');
      const name = /filename="([^"]+)"/.exec(head)?.[1] ?? `upload-${Date.now()}`;
      const tail = raw.indexOf(sep, headEnd);
      const data = raw.slice(headEnd + 4, tail - 2);

      const safe = `${Date.now()}-${path.basename(name).replace(/[^\w.\-]/g, '_')}`;
      await fs.mkdir(UPLOADS, { recursive: true });
      await fs.writeFile(path.join(UPLOADS, safe), data);
      console.log('[studio] הועלה →', `/uploads/${safe}`);
      return json(res, 200, { path: `/uploads/${safe}` });
    }

    json(res, 404, { error: 'not found' });
  } catch (err) {
    console.error('[studio]', err);
    json(res, 500, { error: String(err) });
  }
});

server.listen(PORT, () => console.log(`[studio] שרת הסטודיו רץ על http://localhost:${PORT}`));
