import { dna } from '@/dna';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import Shell from '../../Shell';
import PostForm from '../PostForm';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  const user = await requireUser();
  const media = await db.media.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <Shell user={user} brand={{ name: dna.brand.name, mark: dna.brand.logoMark }}>
      <div className="adm-head"><h1 className="adm-h1">מאמר חדש</h1></div>
      <PostForm post={null} media={media} />
    </Shell>
  );
}
