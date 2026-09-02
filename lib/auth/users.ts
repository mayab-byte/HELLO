'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/guard';
import { hashPassword, passwordProblems } from './password';
import type { Role } from '@prisma/client';

export interface UserState {
  error?: string;
  ok?: boolean;
  /** סיסמה ראשונית שנוצרה — מוצגת פעם אחת כדי למסור למשתמש. */
  tempPassword?: string;
  createdEmail?: string;
}

/**
 * פתיחת משתמש חדש. מנהל בלבד — אין הרשמה עצמית במערכת.
 * הסיסמה הראשונית נוצרת אקראית ומוצגת פעם אחת; אין שליחת מייל
 * עד שיוגדר SMTP.
 */
export async function createUser(_p: UserState, fd: FormData): Promise<UserState> {
  await requireAdmin();

  const email = String(fd.get('email') ?? '').trim().toLowerCase();
  const name = String(fd.get('name') ?? '').trim();
  const role = (fd.get('role') === 'ADMIN' ? 'ADMIN' : 'SITE_EDITOR') as Role;

  if (!name) return { error: 'שם הוא שדה חובה.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: 'כתובת האימייל אינה תקינה.' };
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    return { error: 'כתובת האימייל כבר רשומה במערכת.' };
  }

  // 18 תווי base64url — מעל 100 ביט אנטרופיה, ועומד במדיניות הסיסמאות.
  const tempPassword = `${randomBytes(12).toString('base64url')}!7`;
  await db.user.create({
    data: { email, name, role, passwordHash: await hashPassword(tempPassword) },
  });

  revalidatePath('/admin/users');
  return { ok: true, tempPassword, createdEmail: email };
}

export async function setUserActive(fd: FormData) {
  const admin = await requireAdmin();
  const id = String(fd.get('id'));
  if (id === admin.id) return; // מנהל לא מנטרל את עצמו

  const user = await db.user.findUnique({ where: { id }, select: { active: true } });
  await db.user.update({ where: { id }, data: { active: !user?.active } });
  // ניתוק סשנים פעילים — נטרול חייב להיכנס לתוקף מיד.
  if (user?.active) await db.session.deleteMany({ where: { userId: id } });

  revalidatePath('/admin/users');
}

export async function resetUserPassword(_p: UserState, fd: FormData): Promise<UserState> {
  await requireAdmin();
  const id = String(fd.get('id'));
  const user = await db.user.findUnique({ where: { id }, select: { email: true } });
  if (!user) return { error: 'המשתמש לא נמצא.' };

  const tempPassword = `${randomBytes(12).toString('base64url')}!7`;
  await db.$transaction([
    db.user.update({
      where: { id },
      data: { passwordHash: await hashPassword(tempPassword), failedLogins: 0, lockedUntil: null },
    }),
    db.session.deleteMany({ where: { userId: id } }),
  ]);

  revalidatePath('/admin/users');
  return { ok: true, tempPassword, createdEmail: user.email };
}

export async function unlockUser(fd: FormData) {
  await requireAdmin();
  await db.user.update({
    where: { id: String(fd.get('id')) },
    data: { failedLogins: 0, lockedUntil: null },
  });
  revalidatePath('/admin/users');
}

/** שינוי סיסמה עצמי — כל משתמש מחובר. */
export async function changeOwnPassword(_p: UserState, fd: FormData): Promise<UserState> {
  const { requireUser } = await import('@/lib/auth/guard');
  const { verifyPassword } = await import('./password');
  const me = await requireUser();

  const current = String(fd.get('current') ?? '');
  const next = String(fd.get('next') ?? '');

  const user = await db.user.findUnique({ where: { id: me.id } });
  if (!user || !(await verifyPassword(current, user.passwordHash))) {
    return { error: 'הסיסמה הנוכחית שגויה.' };
  }

  const problems = passwordProblems(next);
  if (problems.length) return { error: problems.join('. ') + '.' };

  await db.user.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(next) } });
  return { ok: true };
}
