// Corre Astro para el sitio, con la telemetría de Astro apagada (no envía datos de uso).
//   node scripts/sitio.mjs dev       servidor local en http://localhost:4321/escuela-pbi-diego-cayupil/
//   node scripts/sitio.mjs build     compila en sitio/dist
//   node scripts/sitio.mjs preview   sirve lo compilado
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const astro = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));
const [comando = 'dev', ...resto] = process.argv.slice(2);
const r = spawnSync(process.execPath, [astro, comando, '--root', 'sitio', ...resto], {
  cwd: raiz,
  stdio: 'inherit',
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
});
process.exit(r.status ?? 1);
