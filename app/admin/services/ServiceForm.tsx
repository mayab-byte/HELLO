'use client';

import { saveService } from '@/lib/content';
import { ActionForm, Field, StatusField } from '../_ui';
import type { Service } from '@prisma/client';

export default function ServiceForm({ service }: { service: Service | null }) {
  return (
    <ActionForm
      action={saveService}
      submitLabel={service ? 'שמירת שינויים' : 'הוספה'}
      onDone={service ? <a href="/admin/services" className="adm-btn">ביטול</a> : undefined}
    >
      {service && <input type="hidden" name="id" value={service.id} />}
      <div className="adm-grid-2">
        <Field name="title" label="כותרת" required defaultValue={service?.title} />
        <Field name="icon" label="אייקון" defaultValue={service?.icon}
               hint="תו בודד או אמוג׳י, למשל ◆ או ✓" />
      </div>
      <Field name="summary" label="תיאור קצר" required textarea rows={3} defaultValue={service?.summary}
             hint="הטקסט שמופיע בכרטיס בעמוד הבית." />
      <Field name="body" label="תיאור מלא" textarea rows={5} defaultValue={service?.body} />
      <div className="adm-grid-2">
        <Field name="ctaHref" label="קישור" defaultValue={service?.ctaHref} hint="למשל #contact" />
        <Field name="order" label="סדר תצוגה" type="number" defaultValue={service?.order ?? 0} />
      </div>
      <StatusField value={service?.status ?? 'PUBLISHED'} />
    </ActionForm>
  );
}
