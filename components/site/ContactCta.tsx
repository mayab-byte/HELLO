'use client';

import { useActionState } from 'react';
import { submitEnquiry, type EnquiryState } from '@/lib/enquiry';
import type { SiteContent } from '@/lib/site-content';

export default function ContactCta({
  site, contact,
}: {
  site: SiteContent['site'];
  contact: SiteContent['contact'];
}) {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, {});
  const err = state.fields ?? {};

  const field = (name: keyof typeof err) => ({
    'aria-invalid': err[name] ? true : undefined,
    'aria-describedby': err[name] ? `${name}-error` : undefined,
  });

  return (
    <section id="contact" className="section cta-section" aria-labelledby="contact-title">
      <div className="container cta-inner">
        <div className="cta-text">
          <span className="section-eyebrow" style={{ color: 'var(--accent)' }}>{contact.eyebrow}</span>
          <h2 id="contact-title" className="cta-title">{contact.title}</h2>
          <p className="cta-lead">{contact.lead}</p>
          <ul className="cta-contact-list">
            <li>טלפון: <a href={site.phoneHref}>{site.phone}</a></li>
            <li>אימייל: <a href={`mailto:${site.email}`}>{site.email}</a></li>
            <li>כתובת: {site.address}</li>
            <li>שעות פעילות: {site.hours}</li>
          </ul>
        </div>

        <form className="contact-form" action={action} noValidate>
          {state.error && <p className="adm-alert adm-alert-error" role="alert">{state.error}</p>}

          {/* honeypot — מוסתר גם מקוראי מסך, בוטים בלבד ימלאו אותו.
              ההסתרה היא ב-clip ולא בהזזה ל-left:-9999px: הזזה כזו מרחיבה
              את רוחב המסמך ב-RTL ויוצרת גלילה אופקית בכל העמוד. */}
          <div aria-hidden="true" className="honeypot">
            <label htmlFor="website">אתר</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="field">
            <label htmlFor="name">שם מלא <span className="req" aria-hidden="true">*</span></label>
            <input id="name" name="name" type="text" autoComplete="name" required {...field('name')} />
            {err.name && <p id="name-error" className="field-error">{err.name}</p>}
          </div>

          <div className="field">
            <label htmlFor="phone">טלפון <span className="req" aria-hidden="true">*</span></label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" required {...field('phone')} />
            <p className="field-hint">לדוגמה: 050-0000000</p>
            {err.phone && <p id="phone-error" className="field-error">{err.phone}</p>}
          </div>

          <div className="field">
            <label htmlFor="email">אימייל</label>
            <input id="email" name="email" type="email" autoComplete="email" {...field('email')} />
            {err.email && <p id="email-error" className="field-error">{err.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="message">במה נוכל לעזור? <span className="req" aria-hidden="true">*</span></label>
            <textarea id="message" name="message" required {...field('message')} />
            {err.message && <p id="message-error" className="field-error">{err.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? 'שולחת…' : 'שליחת הפנייה'}
          </button>
          <p className="form-status" role="status" aria-live="polite">
            {state.ok ? 'תודה! הפנייה נקלטה ונחזור אליכם בתוך יום עסקים אחד.' : ''}
          </p>
        </form>
      </div>
    </section>
  );
}
