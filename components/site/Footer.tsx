import { legalLinks, nav } from '@/content/site';
import { asset } from '@/lib/asset';
import { dna } from '@/dna';
import type { SiteContent } from '@/lib/site-content';

export default function Footer({ site }: { site: SiteContent['site'] }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col footer-col-about">
            <h2 className="footer-title">{site.name}</h2>
            <p className="footer-about-text">{site.tagline}</p>
            <ul className="footer-list footer-social">
              {dna.identity.social.map((s) => <li key={s.label}><a href={s.href}>{s.label}</a></li>)}
            </ul>
          </div>

          <nav className="footer-col" aria-label="קישורים באתר">
            <h2 className="footer-title">ניווט</h2>
            <ul className="footer-list">
              {nav.map((item) => <li key={item.href}><a href={item.href}>{item.label}</a></li>)}
            </ul>
          </nav>

          <div className="footer-col">
            <h2 className="footer-title">יצירת קשר</h2>
            <ul className="footer-list">
              <li><a href={site.phoneHref}>{site.phone}</a></li>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
              <li>{site.address}</li>
              <li>{site.hours}</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {site.name}. כל הזכויות שמורות.</p>
          <ul className="footer-legal">
            {legalLinks.map((l) => <li key={l.href}><a href={asset(l.href)}>{l.label}</a></li>)}
          </ul>
        </div>
      </div>
    </footer>
  );
}
