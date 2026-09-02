'use client';

import { saveSettings } from '@/lib/content';
import { ActionForm, Field } from '../_ui';
import type { SiteSettings } from '@prisma/client';

export default function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const v = settings;
  return (
    <ActionForm action={saveSettings}>
      <section className="adm-card">
        <h2 className="adm-card-title">פרטי העסק</h2>
        <div className="adm-grid-2">
          <Field name="brandName" label="שם העסק" required defaultValue={v?.brandName} />
          <Field name="tagline" label="סלוגן" defaultValue={v?.tagline} />
          <Field name="phone" label="טלפון" type="tel" defaultValue={v?.phone} />
          <Field name="email" label="אימייל" type="email" defaultValue={v?.email} />
          <Field name="address" label="כתובת" defaultValue={v?.address} />
          <Field name="hours" label="שעות פעילות" defaultValue={v?.hours} />
        </div>
      </section>

      <section className="adm-card">
        <h2 className="adm-card-title">ראש העמוד</h2>
        <Field name="heroEyebrow" label="כותרת קטנה" defaultValue={v?.heroEyebrow}
               hint="השורה הקצרה שמופיעה מעל הכותרת הראשית." />
        <Field name="heroTitle" label="כותרת ראשית" required defaultValue={v?.heroTitle} />
        <Field name="heroLead" label="פסקת פתיחה" textarea rows={3} defaultValue={v?.heroLead} />
      </section>

      <section className="adm-card">
        <h2 className="adm-card-title">אודות</h2>
        <Field name="aboutTitle" label="כותרת" defaultValue={v?.aboutTitle} />
        <Field name="aboutBody" label="טקסט" textarea rows={6} defaultValue={v?.aboutBody}
               hint="שורה ריקה בין פסקאות תיצור פסקה חדשה באתר." />
      </section>

      <section className="adm-card">
        <h2 className="adm-card-title">יצירת קשר</h2>
        <Field name="contactTitle" label="כותרת" defaultValue={v?.contactTitle} />
        <Field name="contactLead" label="טקסט" textarea rows={3} defaultValue={v?.contactLead} />
      </section>
    </ActionForm>
  );
}
