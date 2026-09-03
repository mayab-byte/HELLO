'use server';

import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

export interface UploadResult { ok?: boolean; error?: string }

/**
 * העלאת תמונה לספרייה.
 *
 * alt הוא שדה חובה ברמת המסד וברמת הטופס. זו דרישת נגישות AA שאי אפשר
 * לעקוף — בלי טקסט חלופי אין תמונה, ולכן הלקוח לא יכול לפרסם תמונה
 * שקורא מסך לא יוכל לתאר.
 */
export async function uploadMedia(_p: UploadResult, fd: FormData): Promise<UploadResult> {
  await requireUser();

  const file = fd.get('file');
  const alt = String(fd.get('alt') ?? '').trim();

  if (!(file instanceof File) || file.size === 0) return { error: 'לא נבחר קובץ.' };
  if (!alt) return { error: 'טקסט חלופי הוא שדה חובה — בלעדיו התמונה אינה נגישה.' };
  if (alt.length < 3) return { error: 'הטקסט החלופי קצר מדי. תארי מה רואים בתמונה.' };
  if (file.size > MAX_BYTES) return { error: 'הקובץ גדול מ-8MB.' };

  const ext = ALLOWED[file.type];
  if (!ext) return { error: 'סוג קובץ לא נתמך. מותר: JPG, PNG, WebP, AVIF, GIF, SVG.' };

  const buffer = Buffer.from(await file.arrayBuffer());

  // SVG יכול להכיל סקריפט. נדחה קובץ עם script או handler מוטבע.
  if (ext === 'svg') {
    const text = buffer.toString('utf8');
    if (/<script|\son\w+\s*=|javascript:/i.test(text)) {
      return { error: 'קובץ ה-SVG מכיל קוד ולכן נדחה. יש להעלות קובץ נקי.' };
    }
  }

  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

  await db.media.create({
    data: {
      path: `/uploads/${filename}`,
      alt,
      filename: file.name,
      mimeType: file.type,
      bytes: buffer.length,
    },
  });

  revalidatePath('/admin/media');
  revalidatePath('/');
  return { ok: true };
}

export async function updateMediaAlt(fd: FormData) {
  await requireUser();
  const alt = String(fd.get('alt') ?? '').trim();
  if (!alt) return;
  await db.media.update({ where: { id: String(fd.get('id')) }, data: { alt } });
  revalidatePath('/admin/media');
  revalidatePath('/');
}

export async function deleteMedia(fd: FormData) {
  await requireUser();
  const id = String(fd.get('id'));
  const media = await db.media.findUnique({ where: { id } });
  if (!media) return;

  await db.media.delete({ where: { id } });
  // מוחקים גם את הקובץ מהדיסק, אחרת התיקייה תתמלא בקבצים יתומים.
  await fs.unlink(path.join(process.cwd(), 'public', media.path.replace(/^\//, ''))).catch(() => {});

  revalidatePath('/admin/media');
  revalidatePath('/');
}
