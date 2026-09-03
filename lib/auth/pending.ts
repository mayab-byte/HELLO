import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * אסימון הביניים של ההתחברות הדו-שלבית.
 *
 * אחרי שהסיסמה אומתה נותר רק הקוד. אסור להחזיר את הסיסמה לדפדפן בשדה
 * מוסתר כדי לשלוח אותה שוב — היא הייתה נחשפת ב-DOM, בהיסטוריה ובכל תוסף
 * שקורא את העמוד. במקומה נשמר אסימון חתום ב-HMAC, קצר מועד, שאומר
 * "המשתמש הזה כבר עבר את שלב הסיסמה".
 */

const COOKIE = 'sb_pending';
const TTL_MS = 5 * 60 * 1000;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error('SESSION_SECRET חסר או קצר מ-32 תווים. ראו .env.example');
  }
  return s;
}

const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

export async function setPending(userId: string) {
  const payload = `${userId}.${Date.now() + TTL_MS}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TTL_MS / 1000,
  });
}

export async function readPending(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;

  const idx = raw.lastIndexOf('.');
  if (idx < 0) return null;

  const payload = raw.slice(0, idx);
  const given = Buffer.from(raw.slice(idx + 1));
  const expected = Buffer.from(sign(payload));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  const [userId, expiresAt] = payload.split('.');
  if (!userId || Number(expiresAt) < Date.now()) return null;
  return userId;
}

export async function clearPending() {
  (await cookies()).delete(COOKIE);
}
