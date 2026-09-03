import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * TOTP לפי RFC 6238 — תואם Google Authenticator, Authy ו-1Password.
 * מימוש ישיר על node:crypto, בלי תלות חיצונית.
 */

const DIGITS = 6;
const PERIOD = 30;
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateSecret(): string {
  const bytes = randomBytes(20); // 160 ביט, כהמלצת RFC 4226
  let bits = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  let out = '';
  for (let i = 0; i + 5 <= bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}

function base32Decode(secret: string): Buffer {
  const clean = secret.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (const c of clean) {
    const i = B32.indexOf(c);
    if (i < 0) continue;
    bits += i.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function codeAt(secret: string, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', base32Decode(secret)).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) | hmac[offset + 3];
  return String(bin % 10 ** DIGITS).padStart(DIGITS, '0');
}

export function currentCode(secret: string, at = Date.now()): string {
  return codeAt(secret, Math.floor(at / 1000 / PERIOD));
}

/**
 * אימות קוד. חלון של ±1 מחזור (30 שניות לכל צד) כדי לסבול הפרשי שעון
 * בין הטלפון לשרת — זה הסטנדרט, ורחב מזה כבר פוגע באבטחה.
 */
export function verifyCode(secret: string, code: string, at = Date.now()): boolean {
  const given = code.replace(/\D/g, '');
  if (given.length !== DIGITS) return false;
  const counter = Math.floor(at / 1000 / PERIOD);
  for (const drift of [0, -1, 1]) {
    const expected = codeAt(secret, counter + drift);
    const a = Buffer.from(expected);
    const b = Buffer.from(given);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

/** ה-URI שנסרק כ-QR באפליקציית האימות. */
export function otpauthUri(secret: string, email: string, issuer: string): string {
  const label = encodeURIComponent(`${issuer}:${email}`);
  const params = new URLSearchParams({
    secret, issuer, algorithm: 'SHA1', digits: String(DIGITS), period: String(PERIOD),
  });
  return `otpauth://totp/${label}?${params}`;
}

/** קודי גיבוי חד-פעמיים, למקרה שהטלפון אבד. */
export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const raw = randomBytes(5).toString('hex').toUpperCase(); // 10 תווים
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}
