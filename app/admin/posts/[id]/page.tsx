import { notFound } from 'next/navigation';
import { dna } from '@/dna';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import Shell from '../../Shell';
import PostForm from '../PostForm';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const [post, media] = await Promise.all([
    db.post.findUnique({ where: { id } }),
    db.media.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);
  if (!post) notFound();

  return (
    <Shell user={user} brand={{ name: dna.brand.name, mark: dna.brand.logoMark }}>
      <div className="adm-head"><h1 className="adm-h1">עריכת מאמר</h1></div>
      <PostForm post={post} media={media} />
    </Shell>
  );
}
