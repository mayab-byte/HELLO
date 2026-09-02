'use client';

import { saveTestimonial } from '@/lib/content';
import { ActionForm, Field, MediaPicker, StatusField } from '../_ui';
import type { Testimonial } from '@prisma/client';

export default function TestimonialForm({
  item, media,
}: {
  item: Testimonial | null;
  media: { id: string; path: string; alt: string; filename: string }[];
}) {
  return (
    <ActionForm
      action={saveTestimonial}
      submitLabel={item ? 'שמירת שינויים' : 'הוספה'}
      onDone={item ? <a href="/admin/testimonials" className="adm-btn">ביטול</a> : undefined}
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="adm-grid-2">
        <Field name="name" label="שם הממליץ" required defaultValue={item?.name} />
        <Field name="role" label="תפקיד או חברה" defaultValue={item?.role} />
      </div>
      <Field name="quote" label="נוסח ההמלצה" required textarea rows={4} defaultValue={item?.quote} />
      <div className="adm-grid-2">
        <div className="adm-field">
          <label htmlFor="f-rating">דירוג</label>
          <select id="f-rating" name="rating" defaultValue={String(item?.rating ?? 5)}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} מתוך 5</option>
            ))}
          </select>
        </div>
        <Field name="order" label="סדר תצוגה" type="number" defaultValue={item?.order ?? 0} />
      </div>
      <MediaPicker name="avatarId" label="תמונת פרופיל" media={media} value={item?.avatarId} />
      <StatusField value={item?.status ?? 'PUBLISHED'} />
    </ActionForm>
  );
}
