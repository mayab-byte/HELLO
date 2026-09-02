import 'server-only';
import { redirect } from 'next/navigation';
import { getSessionUser, type SessionUser } from './session';

/** מחייב משתמש מחובר. מפנה למסך ההתחברות אם אין. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  return user;
}

/** מחייב הרשאת מנהל. עורך תוכן שמנסה להגיע לכאן מוחזר ללוח הבקרה. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== 'ADMIN') redirect('/admin?denied=1');
  return user;
}
