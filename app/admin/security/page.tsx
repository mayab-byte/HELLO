import { dna } from '@/dna';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import Shell from '../Shell';
import TwoFactor from './TwoFactor';

export const dynamic = 'force-dynamic';

export default async function SecurityPage() {
  const user = await requireUser();
  const [me, unusedCodes] = await Promise.all([
    db.user.findUnique({ where: { id: user.id }, select: { totpEnabledAt: true, email: true } }),
    db.backupCode.count({ where: { userId: user.id, usedAt: null } }),
  ]);

  return (
    <Shell user={user} brand={{ name: dna.brand.name, mark: dna.brand.logoMark }}>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">אבטחה</h1>
          <p className="adm-sub">אימות דו-שלבי לחשבון {me?.email}.</p>
        </div>
      </div>

      <TwoFactor
        enabled={!!me?.totpEnabledAt}
        isAdmin={user.role === 'ADMIN'}
        email={me?.email ?? ''}
        unusedCodes={unusedCodes}
      />
    </Shell>
  );
}
