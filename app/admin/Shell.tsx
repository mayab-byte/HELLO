'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/auth/login';
import type { Role } from '@prisma/client';

const CONTENT = [
  { href: '/admin', label: 'לוח בקרה', exact: true },
  { href: '/admin/settings', label: 'הגדרות האתר' },
  { href: '/admin/posts', label: 'מאמרים' },
  { href: '/admin/services', label: 'שירותים' },
  { href: '/admin/gallery', label: 'גלריה' },
  { href: '/admin/testimonials', label: 'המלצות' },
  { href: '/admin/media', label: 'תמונות' },
  { href: '/admin/enquiries', label: 'פניות' },
];

const ACCOUNT = [{ href: '/admin/security', label: 'אבטחה ו-2FA' }];
const ADMIN_ONLY = [{ href: '/admin/users', label: 'משתמשים' }];

export default function Shell({
  user, brand, children,
}: {
  user: { name: string; role: Role };
  brand: { name: string; mark: string };
  children: React.ReactNode;
}) {
  const path = usePathname();
  const isCurrent = (href: string, exact?: boolean) =>
    (exact ? path === href : path === href || path.startsWith(href + '/')) ? 'page' : undefined;

  const group = (title: string, items: typeof CONTENT) => (
    <>
      <p className="adm-nav-group">{title}</p>
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={isCurrent(i.href, i.exact)}>
          {i.label}
        </Link>
      ))}
    </>
  );

  return (
    <div className="adm">
      <div className="adm-shell">
        <div className="adm-side">
          <p className="adm-side-brand">
            <span className="adm-auth-mark" aria-hidden="true">{brand.mark}</span>
            {brand.name}
          </p>
          <nav className="adm-nav" aria-label="תפריט מערכת הניהול">
            {group('תוכן', CONTENT)}
            {group('החשבון שלי', ACCOUNT)}
            {user.role === 'ADMIN' && group('ניהול', ADMIN_ONLY)}
          </nav>
        </div>

        <div className="adm-main">
          <header className="adm-top">
            <p className="adm-who">
              {user.name} · <span className={`adm-pill ${user.role === 'ADMIN' ? 'adm-pill-admin' : 'adm-pill-editor'}`}>
                {user.role === 'ADMIN' ? 'מנהל' : 'עורך תוכן'}
              </span>
            </p>
            <div className="adm-actions">
              <a className="adm-btn" href="/" target="_blank" rel="noreferrer">
                צפייה באתר<span className="visually-hidden"> (נפתח בלשונית חדשה)</span>
              </a>
              <form action={logout}><button type="submit" className="adm-btn">יציאה</button></form>
            </div>
          </header>
          <main className="adm-body">{children}</main>
        </div>
      </div>
    </div>
  );
}
