'use client';

import { useState } from 'react';
import { contact, site } from '@/content/site';

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'message', string>>;

export default function ContactCta() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState('');

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? '').trim();
    const next: Errors = {};

    if (get('name').length < 2) next.name = 'יש להזין שם מלא (לפחות 2 תווים).';
    if (!/^0\d{1,2}-?\d{7}$/.test(get('phone').replace(/\s/g, ''))) next.phone = 'יש להזין מספר טלפון ישראלי תקין, לדוגמה 050-0000000.';
    if (get('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(get('email'))) next.email = 'כתובת האימייל אינה תקינה.';
    if (get('message').length < 10) next.message = 'יש לכתוב הודעה באורך 10 תווים לפחות.';

    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus('');
      // מעביר פוקוס לשדה השגוי הראשון — דרישת AA לטפסים.
      const first = Object.keys(next)[0];
      (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    // בשלב ה-CMS זה יעבור ל-API. כרגע התשתית מדגימה את מסלול המשוב הנגיש.
    setStatus('תודה! הפנייה נקלטה ונחזור אליכם בתוך יום עסקים אחד.');
    e.currentTarget.reset();
  }

  const field = (name: keyof Errors) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
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

        <form className="contact-form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">שם מלא <span className="req" aria-hidden="true">*</span></label>
            <input id="name" name="name" type="text" autoComplete="name" required {...field('name')} />
            {errors.name && <p id="name-error" className="field-error">{errors.name}</p>}
          </div>

          <div className="field">
            <label htmlFor="phone">טלפון <span className="req" aria-hidden="true">*</span></label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" required {...field('phone')} />
            <p className="field-hint">לדוגמה: 050-0000000</p>
            {errors.phone && <p id="phone-error" className="field-error">{errors.phone}</p>}
          </div>

          <div className="field">
            <label htmlFor="email">אימייל</label>
            <input id="email" name="email" type="email" autoComplete="email" {...field('email')} />
            {errors.email && <p id="email-error" className="field-error">{errors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="message">במה נוכל לעזור? <span className="req" aria-hidden="true">*</span></label>
            <textarea id="message" name="message" required {...field('message')} />
            {errors.message && <p id="message-error" className="field-error">{errors.message}</p>}
          </div>

          <button type="submit" className="btn btn-primary">שליחת הפנייה</button>
          <p className="form-status" role="status" aria-live="polite">{status}</p>
        </form>
      </div>
    </section>
  );
}
