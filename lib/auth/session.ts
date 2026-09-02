import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import type { Role } from '@prisma/client';

const COOKIE = 'sb_session';
/** פקיעה אחרי 12 שעות חוסר פעילות, כפי שנקבע באפיון. */
const MAX_AGE_SECONDS = 12 * 60 * 60;

/**
 * הסשן נשמר במסד; לדפדפן נשלח אסימון אקראי בלבד, והמסד מחזיק את הגיבוב שלו.
 * כך דליפה של המסד לא מאפשרת להתחזות למשתמש, וניתן לבטל סשן מיידית.
 */
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function createSession(userId: string, meta: { userAgent?: string; ip?: string } = {}) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + MAX_AGE_SECONDS * 1000);

  await db.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt, userAgent: meta.userAgent, ip: meta.ip },
  });

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export interface SessionUser {
  id: string; email: string; name: string; role: Role;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.active) return null;

  // חלון הפקיעה מתחדש עם כל פעילות — 12 שעות של חוסר פעילות, לא של חיבור.
  const remaining = session.expiresAt.getTime() - Date.now();
  if (remaining < (MAX_AGE_SECONDS * 1000) / 2) {
    await db.session.update({
      where: { id: session.id },
      data: { expiresAt: new Date(Date.now() + MAX_AGE_SECONDS * 1000) },
    });
  }

  const { id, email, name, role } = session.user;
  return { id, email, name, role };
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  jar.delete(COOKIE);
}

/** ניקוי סשנים שפגו. נקרא אגב התחברות — אין צורך ב-cron. */
export async function pruneExpiredSessions() {
  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
