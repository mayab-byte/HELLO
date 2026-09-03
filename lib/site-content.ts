import 'server-only';
import { db } from '@/lib/db';
import { dna } from '@/dna';
import * as seed from '@/content/site';

/**
 * התוכן שהאתר הציבורי מציג.
 *
 * מקור ראשון: המסד — מה שהלקוח ערך במערכת הניהול.
 * נפילה אחורה: content/site.ts — ה-Placeholder של התבנית.
 *
 * כך אתר שזה עתה שוכפל נראה מלא עוד לפני שנכנסו למערכת פעם אחת,
 * וכל פריט שהלקוח מוסיף מחליף את המקביל לו.
 */

export async function getSiteContent() {
  const [settings, services, gallery, testimonials, posts] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: 'singleton' } }).catch(() => null),
    db.service.findMany({ where: { status: 'PUBLISHED' }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }).catch(() => []),
    db.galleryItem.findMany({ where: { status: 'PUBLISHED' }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }], include: { image: true } }).catch(() => []),
    db.testimonial.findMany({ where: { status: 'PUBLISHED' }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }], include: { avatar: true } }).catch(() => []),
    db.post.findMany({ where: { status: 'PUBLISHED' }, orderBy: { publishedAt: 'desc' }, take: 3, include: { image: true } }).catch(() => []),
  ]);

  const dateLabel = (d: Date | null) =>
    d ? new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(d) : '';

  return {
    site: {
      ...seed.site,
      name: settings?.brandName || dna.brand.name,
      tagline: settings?.tagline || dna.brand.tagline,
      phone: settings?.phone || dna.identity.phone,
      phoneHref: settings?.phone ? `tel:${settings.phone.replace(/[^\d+]/g, '')}` : dna.identity.phoneHref,
      email: settings?.email || dna.identity.email,
      address: settings?.address || dna.identity.address,
      hours: settings?.hours || dna.identity.hours,
    },

    hero: {
      ...seed.hero,
      eyebrow: settings?.heroEyebrow || seed.hero.eyebrow,
      title: settings?.heroTitle || seed.hero.title,
      lead: settings?.heroLead || seed.hero.lead,
    },

    about: {
      ...seed.about,
      title: settings?.aboutTitle || seed.about.title,
      paragraphs: settings?.aboutBody
        ? settings.aboutBody.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
        : seed.about.paragraphs,
    },

    contact: {
      ...seed.contact,
      title: settings?.contactTitle || seed.contact.title,
      lead: settings?.contactLead || seed.contact.lead,
    },

    services: services.length
      ? {
          ...seed.services,
          items: services.map((s) => ({
            icon: s.icon ?? '◆',
            title: s.title,
            text: s.summary,
            href: s.ctaHref ?? '#contact',
          })),
        }
      : seed.services,

    gallery: gallery.length
      ? {
          ...seed.gallery,
          items: gallery.map((g) => ({
            src: g.image.path,
            alt: g.image.alt,
            caption: g.title ?? '',
          })),
        }
      : seed.gallery,

    testimonials: testimonials.length
      ? {
          ...seed.testimonials,
          items: testimonials.map((t) => ({
            quote: t.quote,
            name: t.name,
            role: t.role ?? '',
            rating: t.rating,
            avatar: t.avatar?.path ?? '/images/avatar-1.svg',
          })),
        }
      : seed.testimonials,

    posts: posts.length
      ? {
          ...seed.posts,
          items: posts.map((p) => ({
            title: p.title,
            excerpt: p.excerpt ?? '',
            date: (p.publishedAt ?? p.createdAt).toISOString().slice(0, 10),
            dateLabel: dateLabel(p.publishedAt ?? p.createdAt),
            category: p.category ?? '',
            href: `/blog/${p.slug}`,
            image: {
              src: p.image?.path ?? '/images/post-1.svg',
              alt: p.image?.alt ?? p.title,
            },
          })),
        }
      : seed.posts,
  };
}

export type SiteContent = Awaited<ReturnType<typeof getSiteContent>>;
