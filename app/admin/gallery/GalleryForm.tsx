'use client';

import { saveGalleryItem } from '@/lib/content';
import { ActionForm, Field, MediaPicker, StatusField } from '../_ui';
import type { GalleryItem } from '@prisma/client';

export default function GalleryForm({
  item, media,
}: {
  item: GalleryItem | null;
  media: { id: string; path: string; alt: string; filename: string }[];
}) {
  return (
    <ActionForm
      action={saveGalleryItem}
      submitLabel={item ? 'שמירת שינויים' : 'הוספה'}
      onDone={item ? <a href="/admin/gallery" className="adm-btn">ביטול</a> : undefined}
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <MediaPicker name="imageId" label="תמונה" media={media} value={item?.imageId}
                   hint="הטקסט החלופי נלקח מהתמונה בספרייה." />
      <div className="adm-grid-2">
        <Field name="title" label="כותרת" defaultValue={item?.title} />
        <Field name="category" label="קטגוריה" defaultValue={item?.category} />
        <Field name="order" label="סדר תצוגה" type="number" defaultValue={item?.order ?? 0} />
      </div>
      <StatusField value={item?.status ?? 'PUBLISHED'} />
    </ActionForm>
  );
}
