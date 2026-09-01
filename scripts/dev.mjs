/** מריץ במקביל את שרת הסטודיו ואת next dev. */
import { spawn } from 'node:child_process';

const kids = [
  spawn(process.execPath, ['scripts/studio-server.mjs'], { stdio: 'inherit' }),
  spawn('npx', ['next', 'dev'], { stdio: 'inherit', shell: process.platform === 'win32' }),
];

const bye = () => { for (const k of kids) k.kill('SIGTERM'); process.exit(0); };
process.on('SIGINT', bye);
process.on('SIGTERM', bye);
for (const k of kids) k.on('exit', (code) => { if (code) bye(); });
