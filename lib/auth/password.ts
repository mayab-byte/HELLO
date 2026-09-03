import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (
  password: string | Buffer, salt: string | Buffer, keylen: number, options: object,
) => Promise<Buffer>;

/**
 * גיבוב סיסמאות ב-scrypt מ-node:crypto.
 *
 * scrypt הוא KDF תקני ועמיד ל-ASIC, ומגיע מובנה ב-Node — בלי תלות מקומית
 * שצריך לקמפל בכל סביבה. הפרמטרים למטה תואמים להמלצת OWASP
 * (N=2^17, r=8, p=1) ודורשים ~128MB לכל חישוב.
 */
const PARAMS = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, KEYLEN, PARAMS);
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, n, r, p, saltB64, keyB64] = parts;
  const salt = Buffer.from(saltB64, 'base64');
  const expected = Buffer.from(keyB64, 'base64');

  let actual: Buffer;
  try {
    actual = await scrypt(password.normalize('NFKC'), salt, expected.length, {
      N: Number(n), r: Number(r), p: Number(p), maxmem: 256 * 1024 * 1024,
    });
  } catch {
    return false;
  }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** מדיניות הסיסמאות: 12 תווים לפחות, אותיות + ספרות + תו מיוחד. */
export function passwordProblems(password: string): string[] {
  const out: string[] = [];
  if (password.length < 12) out.push('הסיסמה חייבת להכיל לפחות 12 תווים');
  if (!/[A-Za-z֐-׿]/.test(password)) out.push('הסיסמה חייבת להכיל אות אחת לפחות');
  if (!/\d/.test(password)) out.push('הסיסמה חייבת להכיל ספרה אחת לפחות');
  if (!/[^A-Za-z0-9֐-׿]/.test(password)) out.push('הסיסמה חייבת להכיל תו מיוחד אחד לפחות');
  return out;
}
