'use client';

import { useEffect, useRef, useState } from 'react';
import { nav } from '@/content/site';
import { asset } from '@/lib/asset';
import type { SiteContent } from '@/lib/site-content';

export default function Header({ site }: { site: SiteContent['site'] }) {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape סוגר את התפריט ומחזיר את הפוקוס לכפתור (מונע מלכודת פוקוס).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!navRef.current?.contains(t) && !toggleRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick); };
  }, [open]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="site-logo" href={asset('/')}>
          <span className="site-logo-mark" aria-hidden="true">{site.logoMark}</span>
          <span className="site-logo-text">{site.name}</span>
        </a>

        <button
          ref={toggleRef}
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle-bars" aria-hidden="true" />
          <span className="visually-hidden">{open ? 'סגירת התפריט' : 'פתיחת התפריט'}</span>
        </button>

        <nav ref={navRef} id="main-nav" className="main-nav" aria-label="תפריט ראשי" hidden={!open}>
          <ul className="main-nav-list">
            {nav.map((item) => (
              <li key={item.href}>
                <a className="main-nav-link" href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <a className="btn btn-primary header-cta" href="#contact">צרו קשר</a>
      </div>
    </header>
  );
}
