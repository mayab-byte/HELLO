'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import type { ContentStatus } from '@prisma/client';

/**
 * כל פעולות התוכן. שתי מוסכמות שחלות על כולן:
 *  1. requireUser() בראש כל פעולה — Server Action היא נקודת קצה לכל דבר,
 *     ובלי הבדיקה הזו כל אחד ברשת יכול לקרוא לה.
 *  2. revalidatePath('/') — שינוי תוכן מרענן מיד את האתר הציבורי.
 */

export interface FormResult { ok?: boolean; error?: string }

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const int = (fd: FormData, k: string, d = 0) => {
  const n = Number(fd.get(k));
  return Number.isFinite(n) ? n : d;
};
const status = (fd: FormData): ContentStatus =>
  fd.get('status') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';

function refresh() {
  revalidatePath('/');
  revalidatePath('/admin');
}

/** slug נקי מעברית, ייחודי. */
async function uniqueSlug(title: string, currentId?: string): Promise<string> {
  const base =
    title.trim().toLowerCase()
      .replace(/["'׳״]/g, '')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'post';

  let slug = base;
  for (let i = 2; ; i++) {
    const clash = await db.post.findUnique({ where: { slug }, select: { id: true } });
    if (!clash || clash.id === currentId) return slug;
    slug = `${base}-${i}`;
  }
}

// ─────────────────────────── הגדרות האתר ───────────────────────────

export async function saveSettings(_p: FormResult, fd: FormData): Promise<FormResult> {
  await requireUser();

  const data = {
    brandName: str(fd, 'brandName'),
    tagline: str(fd, 'tagline'),
    phone: str(fd, 'phone'),
    email: str(fd, 'email'),
    address: str(fd, 'address'),
    hours: str(fd, 'hours'),
    heroEyebrow: str(fd, 'heroEyebrow'),
    heroTitle: str(fd, 'heroTitle'),
    heroLead: str(fd, 'heroLead'),
    aboutTitle: str(fd, 'aboutTitle'),
    aboutBody: str(fd, 'aboutBody'),
    contactTitle: str(fd, 'contactTitle'),
    contactLead: str(fd, 'contactLead'),
  };

  if (!data.brandName) return { error: 'שם העסק הוא שדה חובה.' };
  if (!data.heroTitle) return { error: 'הכותרת הראשית היא שדה חובה.' };
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
    return { error: 'כתובת האימייל אינה תקינה.' };
  }

  await db.siteSettings.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', ...data }, update: data });
  refresh();
  return { ok: true };
}

// ─────────────────────────── מאמרים ───────────────────────────

export async function savePost(_p: FormResult, fd: FormData): Promise<FormResult> {
  await requireUser();

  const id = str(fd, 'id');
  const title = str(fd, 'title');
  const body = str(fd, 'body');
  if (!title) return { error: 'כותרת היא שדה חובה.' };
  if (!body) return { error: 'תוכן המאמר הוא שדה חובה.' };

  const st = status(fd);
  const data = {
    title,
    body,
    excerpt: str(fd, 'excerpt') || null,
    category: str(fd, 'category') || null,
    imageId: str(fd, 'imageId') || null,
    status: st,
  };

  if (id) {
    const existing = await db.post.findUnique({ where: { id }, select: { publishedAt: true } });
    await db.post.update({
      where: { id },
      data: {
        ...data,
        slug: await uniqueSlug(title, id),
        publishedAt: st === 'PUBLISHED' ? existing?.publishedAt ?? new Date() : null,
      },
    });
  } else {
    await db.post.create({
      data: { ...data, slug: await uniqueSlug(title), publishedAt: st === 'PUBLISHED' ? new Date() : null },
    });
  }

  refresh();
  return { ok: true };
}

export async function deletePost(fd: FormData) {
  await requireUser();
  await db.post.delete({ where: { id: str(fd, 'id') } });
  refresh();
}

// ─────────────────────────── שירותים ───────────────────────────

export async function saveService(_p: FormResult, fd: FormData): Promise<FormResult> {
  await requireUser();
  const id = str(fd, 'id');
  const title = str(fd, 'title');
  const summary = str(fd, 'summary');
  if (!title) return { error: 'כותרת היא שדה חובה.' };
  if (!summary) return { error: 'תיאור קצר הוא שדה חובה — הוא מה שמופיע בכרטיס.' };

  const data = {
    title, summary,
    icon: str(fd, 'icon') || null,
    body: str(fd, 'body') || null,
    ctaHref: str(fd, 'ctaHref') || null,
    order: int(fd, 'order'),
    status: status(fd),
  };

  if (id) await db.service.update({ where: { id }, data });
  else await db.service.create({ data });
  refresh();
  return { ok: true };
}

export async function deleteService(fd: FormData) {
  await requireUser();
  await db.service.delete({ where: { id: str(fd, 'id') } });
  refresh();
}

// ─────────────────────────── גלריה ───────────────────────────

export async function saveGalleryItem(_p: FormResult, fd: FormData): Promise<FormResult> {
  await requireUser();
  const id = str(fd, 'id');
  const imageId = str(fd, 'imageId');
  if (!imageId) return { error: 'יש לבחור תמונה מהספרייה.' };

  const data = {
    imageId,
    title: str(fd, 'title') || null,
    category: str(fd, 'category') || null,
    order: int(fd, 'order'),
    status: status(fd),
  };

  if (id) await db.galleryItem.update({ where: { id }, data });
  else await db.galleryItem.create({ data });
  refresh();
  return { ok: true };
}

export async function deleteGalleryItem(fd: FormData) {
  await requireUser();
  await db.galleryItem.delete({ where: { id: str(fd, 'id') } });
  refresh();
}

// ─────────────────────────── המלצות ───────────────────────────

export async function saveTestimonial(_p: FormResult, fd: FormData): Promise<FormResult> {
  await requireUser();
  const id = str(fd, 'id');
  const name = str(fd, 'name');
  const quote = str(fd, 'quote');
  if (!name) return { error: 'שם הממליץ הוא שדה חובה.' };
  if (!quote) return { error: 'נוסח ההמלצה הוא שדה חובה.' };

  const rating = Math.min(5, Math.max(1, int(fd, 'rating', 5)));
  const data = {
    name, quote, rating,
    role: str(fd, 'role') || null,
    avatarId: str(fd, 'avatarId') || null,
    order: int(fd, 'order'),
    status: status(fd),
  };

  if (id) await db.testimonial.update({ where: { id }, data });
  else await db.testimonial.create({ data });
  refresh();
  return { ok: true };
}

export async function deleteTestimonial(fd: FormData) {
  await requireUser();
  await db.testimonial.delete({ where: { id: str(fd, 'id') } });
  refresh();
}

// ─────────────────────────── פניות ───────────────────────────

export async function toggleEnquiry(fd: FormData) {
  await requireUser();
  const id = str(fd, 'id');
  const current = await db.enquiry.findUnique({ where: { id }, select: { handled: true } });
  await db.enquiry.update({ where: { id }, data: { handled: !current?.handled } });
  revalidatePath('/admin/enquiries');
}
