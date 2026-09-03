'use server';

import { createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import { generateBackupCodes, generateSecret, otpauthUri, verifyCode } from './totp';
import { dna } from '@/dna';

export interface TotpState {
  error?: string;
  ok?: boolean;
  /** קודי הגיבוי מוצגים פעם אחת בלבד, מיד אחרי ההפעלה. */
  backupCodes?: string[];
}

const hashCode = (code: string) =>
  createHash('sha256').update(code.replace(/\s|-/g, '').toUpperCase()).digest('hex');

/**
 * שלב 1: יצירת סוד והצגתו למשתמש. הסוד נשמר, אך `totpEnabledAt` נשאר ריק —
 * כלומר 2FA עדיין לא נדרש בהתחברות. רק אימות קוד בפועל מפעיל אותו,
 * כדי שלא ננעל משתמש שסרק QR ולא סיים.
 */
export async function beginTotpSetup(): Promise<{ secret: string; uri: string }> {
  const user = await requireUser();
  const secret = generateSecret();
  await db.user.update({ where: { id: user.id }, data: { totpSecret: secret, totpEnabledAt: null } });
  // ה-URI נבנה כאן ולא בדפדפן: totp.ts מייבא node:crypto ואינו יכול
  // להיכנס לבנדל הלקוח.
  return { secret, uri: otpauthUri(secret, user.email, dna.brand.name) };
}

/** שלב 2: אימות קוד ראשון → הפעלה בפועל + הנפקת קודי גיבוי. */
export async function confirmTotp(_p: TotpState, fd: FormData): Promise<TotpState> {
  const sessionUser = await requireUser();
  const code = String(fd.get('code') ?? '').trim();

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user?.totpSecret) return { error: 'לא נמצא סוד פעיל. יש להתחיל את התהליך מחדש.' };
  if (!verifyCode(user.totpSecret, code)) {
    return { error: 'הקוד שגוי. ודאי שהשעה בטלפון מסונכרנת ונסי שוב.' };
  }

  const codes = generateBackupCodes();
  await db.$transaction([
    db.backupCode.deleteMany({ where: { userId: user.id } }),
    db.backupCode.createMany({ data: codes.map((c) => ({ userId: user.id, hash: hashCode(c) })) }),
    db.user.update({ where: { id: user.id }, data: { totpEnabledAt: new Date() } }),
  ]);

  revalidatePath('/admin/security');
  return { ok: true, backupCodes: codes };
}

export async function disableTotp(_p: TotpState, fd: FormData): Promise<TotpState> {
  const sessionUser = await requireUser();

  // מנהל חייב 2FA — הוא לא יכול לכבות אותו לעצמו.
  if (sessionUser.role === 'ADMIN') {
    return { error: 'אימות דו-שלבי הוא חובה עבור מנהל ואינו ניתן לכיבוי.' };
  }

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user?.totpSecret || !verifyCode(user.totpSecret, String(fd.get('code') ?? '').trim())) {
    return { error: 'נדרש קוד תקין מהאפליקציה כדי לכבות את האימות.' };
  }

  await db.$transaction([
    db.backupCode.deleteMany({ where: { userId: user.id } }),
    db.user.update({ where: { id: user.id }, data: { totpSecret: null, totpEnabledAt: null } }),
  ]);

  revalidatePath('/admin/security');
  return { ok: true };
}
