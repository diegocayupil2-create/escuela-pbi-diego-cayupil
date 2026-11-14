// Prueba de que el sitio compila: corre la compilación de Astro y revisa lo que publica GitHub Pages.
// Si el contenido no cumple el formato, la compilación falla aquí antes de llegar al sitio.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(RAIZ, 'sitio', 'dist');
const BASE = '/escuela-pbi-diego-cayupil/';

function listar(dir) {
  return readdirSync(dir).flatMap((n) => {
    const c = join(dir, n);
    return statSync(c).isDirectory() ? listar(c) : [c];
  });
}
const rel = (a) => relative(DIST, a).split(sep).join('/');
const leer = (r) => readFileSync(join(DIST, r), 'utf8');
let paginas = [];

before(() => {
  const r = spawnSync(process.execPath, [join(RAIZ, 'scripts', 'sitio.mjs'), 'build'], { cwd: RAIZ, encoding: 'utf8' });
  assert.equal(r.status, 0, `la compilación falló:\n${r.stdout}\n${r.stderr}`);
  paginas = listar(DIST).map(rel).filter((r) => r.endsWith('.html'));
});

test('están Hoy y el Mapa en los dos idiomas, el inicio, el 404 y lo que hace instalable la app', () => {
  for (const r of ['index.html', 'es/index.html', 'en/index.html', 'es/mapa/index.html', 'en/map/index.html', '404.html',
    'manifest.webmanifest', 'sw.js', 'favicon.svg']) {
    assert.ok(existsSync(join(DIST, r)), `falta ${r}`);
  }
});

test('cada capítulo, lección y práctica del contenido tiene su página en español y en inglés', () => {
  const curriculo = YAML.parse(readFileSync(join(RAIZ, 'contenido', 'curriculo.yaml'), 'utf8'));
  const esperadas = [];
  for (const c of curriculo.capitulos) {
    esperadas.push(`es/capitulos/${c.id}/index.html`, `en/chapters/${c.id}/index.html`);
    if (!c.carpeta) continue;
    const base = join(RAIZ, 'contenido', 'capitulos', c.carpeta);
    for (const f of readdirSync(join(base, 'lecciones')).filter((x) => x.endsWith('.es.md'))) {
      const id = f.replace('.es.md', '');
      esperadas.push(`es/capitulos/${c.id}/lecciones/${id}/index.html`, `en/chapters/${c.id}/lessons/${id}/index.html`);
    }
    for (const f of readdirSync(join(base, 'practicas')).filter((x) => x.endsWith('.yaml'))) {
      const id = f.replace('.yaml', '');
      esperadas.push(`es/capitulos/${c.id}/practicas/${id}/index.html`, `en/chapters/${c.id}/practice/${id}/index.html`);
    }
  }
  const faltan = esperadas.filter((r) => !paginas.includes(r));
  assert.deepEqual(faltan, [], `faltan páginas:\n${faltan.join('\n')}`);
});

test('ningún {{valor}} queda sin reemplazar y cada página declara su idioma', () => {
  for (const r of paginas) {
    const html = leer(r);
    assert.ok(!/\{\{[a-z0-9_]+\}\}/.test(html), `${r} tiene un {{valor}} sin reemplazar`);
    const idioma = r.startsWith('en/') ? 'en' : 'es';
    assert.match(html, new RegExp(`<html lang="${idioma}"`), `${r} debería declarar lang="${idioma}"`);
  }
});

test('las prácticas esconden pistas y solución hasta que se pidan', () => {
  const practicas = paginas.filter((r) => /\/(practicas|practice)\//.test(r));
  assert.ok(practicas.length >= 2, 'no hay páginas de práctica');
  for (const r of practicas) {
    const html = leer(r);
    assert.match(html, /<details class="solucion"[^>]*>/, `${r}: la solución debe ir dentro de <details>`);
    assert.ok(!/<details class="solucion"[^>]*\bopen\b/.test(html), `${r}: la solución no puede partir abierta`);
    assert.match(html, /<details class="pista"/, `${r}: las pistas deben ir dentro de <details>`);
  }
  assert.match(leer('es/capitulos/c10/practicas/c10-p01/index.html'), /20\.000\.000 pesos/, 'el umbral lleva separador de miles');
  assert.match(leer('en/chapters/c10/practice/c10-p01/index.html'), /CLP 20,000,000/);
});

test('todos los links internos llevan a una página o archivo que existe', () => {
  const rotos = [];
  for (const r of [...paginas, 'manifest.webmanifest']) {
    const texto = leer(r);
    for (const [, url] of texto.matchAll(/(?:href|src)="([^"#?]+)/g)) {
      if (!url.startsWith(BASE)) continue;
      const destino = url.slice(BASE.length);
      const archivo = destino === '' || destino.endsWith('/') ? `${destino}index.html` : destino;
      if (!existsSync(join(DIST, archivo))) rotos.push(`${r} → ${url}`);
    }
  }
  assert.deepEqual([...new Set(rotos)], [], `links rotos:\n${[...new Set(rotos)].join('\n')}`);
});

test('el botón ES/EN apunta a la misma página en el otro idioma', () => {
  const html = leer('es/capitulos/c10/lecciones/c10-l01/index.html');
  assert.match(html, /<link rel="alternate" hreflang="en" href="\/escuela-pbi-diego-cayupil\/en\/chapters\/c10\/lessons\/c10-l01\/"/);
  assert.match(html, /href="\/escuela-pbi-diego-cayupil\/en\/chapters\/c10\/lessons\/c10-l01\/" hreflang="en"/);
});

test('instalable: manifest con íconos que existen y sw.js con lo esencial para abrir sin conexión', () => {
  const m = JSON.parse(leer('manifest.webmanifest'));
  assert.equal(m.display, 'standalone');
  assert.equal(m.start_url, './');
  for (const icono of m.icons) assert.ok(existsSync(join(DIST, icono.src)), `falta el ícono ${icono.src}`);
  assert.ok(m.icons.some((i) => i.sizes === '192x192') && m.icons.some((i) => i.sizes === '512x512'), 'faltan íconos de 192 y 512');
  assert.ok(m.icons.some((i) => i.purpose === 'maskable'), 'falta el ícono maskable para Android');

  const sw = leer('sw.js');
  assert.match(sw, /const VERSION = '[0-9a-f]{12}'/);
  const esenciales = JSON.parse(sw.match(/const ESENCIALES = (\[.*?\]);/)[1]);
  for (const r of ['./', 'es/', 'en/', 'es/mapa/', 'en/map/', 'manifest.webmanifest']) assert.ok(esenciales.includes(r), `sw.js no guarda ${r}`);
  for (const r of esenciales) {
    const archivo = r === './' ? 'index.html' : r.endsWith('/') ? `${r}index.html` : r;
    assert.ok(existsSync(join(DIST, archivo)), `sw.js guarda ${r}, que no existe`);
  }
});
