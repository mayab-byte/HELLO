'use client';

import Link from 'next/link';
import { savePost } from '@/lib/content';
import { ActionForm, Field, MediaPicker, StatusField } from '../_ui';
import type { Post } from '@prisma/client';

export default function PostForm({
  post, media,
}: {
  post: Post | null;
  media: { id: string; path: string; alt: string; filename: string }[];
}) {
  return (
    <ActionForm
      action={savePost}
      onDone={<Link href="/admin/posts" className="adm-btn">חזרה לרשימה</Link>}
    >
      {post && <input type="hidden" name="id" value={post.id} />}
      <section className="adm-card">
        <Field name="title" label="כותרת" required defaultValue={post?.title} />
        <Field name="excerpt" label="תקציר" defaultValue={post?.excerpt}
               hint="שורה או שתיים שמופיעות בכרטיס המאמר בעמוד הבית." />
        <Field name="body" label="תוכן המאמר" required textarea rows={14} defaultValue={post?.body}
               hint="שורה ריקה בין פסקאות תיצור פסקה חדשה." />
        <div className="adm-grid-2">
          <Field name="category" label="קטגוריה" defaultValue={post?.category} />
          <StatusField value={post?.status} />
        </div>
        <MediaPicker name="imageId" label="תמונה ראשית" media={media} value={post?.imageId} />
      </section>
    </ActionForm>
  );
}
