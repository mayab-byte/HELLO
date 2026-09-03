export interface Hsva { h: number; s: number; v: number; a: number }

export function hsvaToRgba({ h, s, v, a }: Hsva) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const i = Math.floor(h / 60) % 6;
  const [r1, g1, b1] = [[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]][i] as [number,number,number];
  return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255), a };
}

export function hsvaToCss(hsva: Hsva): string {
  const { r, g, b, a } = hsvaToRgba(hsva);
  return a >= 1 ? `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}` : `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`;
}

export function rgbToHsv(r: number, g: number, b: number, a = 1): Hsva {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : d / max, v: max, a };
}

/** מקבל hex / rgb() / rgba() ומחזיר HSVA. נופל חזרה לשחור אטום. */
export function parseColor(input: string): Hsva {
  const s = (input || '').trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return rgbToHsv(r, g, b, a);
  }
  m = /^rgba?\(([^)]+)\)$/i.exec(s);
  if (m) {
    const p = m[1].split(/[,/\s]+/).filter(Boolean).map(Number);
    return rgbToHsv(p[0] || 0, p[1] || 0, p[2] || 0, p.length > 3 ? p[3] : 1);
  }
  return { h: 0, s: 0, v: 0, a: 1 };
}
