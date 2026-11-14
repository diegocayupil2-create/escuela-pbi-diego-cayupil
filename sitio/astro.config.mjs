// Configuración del sitio: Astro estático, publicado en GitHub Pages por .github/workflows/publicar.yml.
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHIKI } from './src/lib/shiki.mjs';

// Lo mínimo para abrir la app sin internet. El resto se guarda a medida que lo visitas.
const ESENCIAL =
  /^(index\.html|(es|en)\/index\.html|es\/mapa\/index\.html|en\/map\/index\.html|_astro\/.+|iconos\/.+|favicon\.svg|manifest\.webmanifest)$/;

async function listar(dir) {
  const salida = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const completo = join(dir, e.name);
    if (e.isDirectory()) salida.push(...(await listar(completo)));
    else salida.push(completo);
  }
  return salida;
}

// Al terminar la compilación escribe sw.js con la lista de archivos esenciales y una versión
// que cambia solo si cambió el sitio: así el celular baja lo nuevo y borra lo viejo.
function trabajadorSinConexion() {
  return {
    name: 'escuela-sin-conexion',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const raiz = fileURLToPath(dir);
        const archivos = (await listar(raiz)).map((a) => relative(raiz, a).split(sep).join('/')).sort();
        const huella = createHash('sha256');
        for (const r of archivos) huella.update(r).update(await readFile(join(raiz, r)));
        const version = huella.digest('hex').slice(0, 12);
        const guardar = archivos.filter((r) => ESENCIAL.test(r)).map((r) => r.replace(/(^|\/)index\.html$/, '$1') || './');
        const plantilla = await readFile(new URL('./src/sin-conexion.js', import.meta.url), 'utf8');
        const codigo = plantilla.replace('__VERSION__', version).replace('[] /* __GUARDAR__ */', JSON.stringify(guardar));
        await writeFile(join(raiz, 'sw.js'), codigo);
        logger.info(`sw.js: versión ${version}, ${guardar.length} archivos para usar sin conexión`);
      },
    },
  };
}

export default defineConfig({
  site: 'https://diegocayupil2-create.github.io',
  base: '/escuela-pbi-diego-cayupil',
  trailingSlash: 'always',
  output: 'static',
  markdown: { processor: satteri(), shikiConfig: SHIKI },
  integrations: [trabajadorSinConexion()],
  devToolbar: { enabled: false },
  // El contenido vive fuera de sitio/ (contenido/, datos/ y esquemas/): el servidor local puede leerlo.
  vite: { server: { fs: { allow: ['..'] } } },
});
