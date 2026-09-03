import { dna } from '@/dna';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import Shell from '../Shell';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await db.siteSettings.findUnique({ where: { id: 'singleton' } });

  return (
    <Shell user={user} brand={{ name: dna.brand.name, mark: dna.brand.logoMark }}>
      <div className="adm-head">
        <div>
          <h1 className="adm-h1">הגדרות האתר</h1>
          <p className="adm-sub">פרטי העסק והטקסטים הקבועים בעמוד הבית.</p>
        </div>
      </div>
      <SettingsForm settings={settings} />
    </Shell>
  );
}
