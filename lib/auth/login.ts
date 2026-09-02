'use server';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { verifyPassword } from './password';
import { verifyCode } from './totp';
import { createSession, destroySession, pruneExpiredSessions } from './session';
import { clearPending, readPending, setPending } from './pending';

/** 5 כשלונות → נעילה ל-15 דקות, כפי שנקבע באפיון. */
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export interface LoginState {
  error?: string;
  /** השלב השני נדרש: הסיסמה אומתה, נותר קוד ה-2FA. */
  needsTotp?: boolean;
  email?: string;
}

const hashCode = (code: string) =>
  createHash('sha256').update(code.replace(/\s|-/g, '').toUpperCase()).digest('hex');

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const totp = String(formData.get('totp') ?? '').trim();

  // שלב שני: הסיסמה כבר אומתה, וזהות המשתמש מגיעה מהאסימון החתום
  // ולא מהטופס — כדי לא להחזיר את הסיסמה לדפדפן.
  if (totp) {
    const pendingUserId = await readPending();
    if (!pendingUserId) {
      return { error: 'פג תוקף שלב האימות. יש להתחיל את ההתחברות מחדש.' };
    }
    return finishTotp(pendingUserId, totp, email);
  }

  if (!email || !password) return { error: 'יש להזין אימייל וסיסמה.' };

  const user = await db.user.findUnique({ where: { email }, include: { backupCodes: true } });

  // הודעה זהה לכל כשל, כדי לא לחשוף אילו כתובות רשומות במערכת.
  const generic: LoginState = { error: 'אימייל או סיסמה שגויים.', email };

  if (!user || !user.active) return generic;

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { error: `החשבון נעול בשל ריבוי ניסיונות. נסי שוב בעוד ${minutes} דקות.`, email };
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    const failed = user.failedLogins + 1;
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLogins: failed,
        lockedUntil: failed >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60000) : null,
      },
    });
    if (failed >= MAX_ATTEMPTS) {
      return { error: `החשבון ננעל ל-${LOCK_MINUTES} דקות בשל ריבוי ניסיונות.`, email };
    }
    return generic;
  }

  // הסיסמה תקינה. אם 2FA פעיל — עוצרים כאן ומנפיקים אסימון ביניים.
  if (user.totpEnabledAt && user.totpSecret) {
    await db.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
    await setPending(user.id);
    return { needsTotp: true, email };
  }

  await startSession(user.id);
  redirect('/admin');
}

/** שלב שני: אימות קוד TOTP או קוד גיבוי, ופתיחת סשן. */
async function finishTotp(userId: string, code: string, email: string): Promise<LoginState> {
  const user = await db.user.findUnique({ where: { id: userId }, include: { backupCodes: true } });
  if (!user || !user.active || !user.totpSecret) {
    await clearPending();
    return { error: 'אירעה שגיאה. יש להתחיל את ההתחברות מחדש.' };
  }

  let backupUsed: string | null = null;

  if (!verifyCode(user.totpSecret, code)) {
    const match = user.backupCodes.find((c) => !c.usedAt && c.hash === hashCode(code));
    if (!match) return { needsTotp: true, email, error: 'קוד האימות שגוי או פג תוקפו.' };
    backupUsed = match.id;
  }

  if (backupUsed) {
    await db.backupCode.update({ where: { id: backupUsed }, data: { usedAt: new Date() } });
  }

  await clearPending();
  await startSession(user.id);
  redirect('/admin');
}

async function startSession(userId: string) {
  const h = await headers();
  await db.user.update({
    where: { id: userId },
    data: { failedLogins: 0, lockedUntil: null, lastLogin: new Date() },
  });
  await pruneExpiredSessions();
  await createSession(userId, {
    userAgent: h.get('user-agent') ?? undefined,
    ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined,
  });
}

export async function logout() {
  await clearPending();
  await destroySession();
  redirect('/admin/login');
}
