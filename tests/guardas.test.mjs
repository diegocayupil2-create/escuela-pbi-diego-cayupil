// Guardas: nada excluido, nada de pago, nada personal, trabajos fuera de Git y archivos livianos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const OMITIR = new Set(['node_modules', '.git', 'trabajos', 'dist', '.astro', '__pycache__']);
const ES_TEXTO = /\.(md|ya?ml|json|mjs|cjs|js|ts|py|txt|csv|html|css|astro|toml)$|(^|\/)\.[a-z]+$/i;

function listar(dir) {
  const salida = [];
  for (const nombre of readdirSync(dir)) {
    if (OMITIR.has(nombre)) continue;
    const completo = join(dir, nombre);
    if (statSync(completo).isDirectory()) salida.push(...listar(completo));
    else salida.push(completo);
  }
  return salida;
}

const rel = (archivo) => relative(RAIZ, archivo).split(sep).join('/');
const archivos = listar(RAIZ);
const textos = archivos.map(rel).filter((r) => ES_TEXTO.test(r) && r !== 'package-lock.json');
const leer = (r) => readFileSync(join(RAIZ, r), 'utf8');

test('nada de la lista de excluidos aparece en el contenido ni en los datos', () => {
  const ex = YAML.parse(leer('contenido/excluidos.yaml'));
  const patrones = [...ex.dominios, ...ex.palabras].map((p) => p.toLowerCase());
  const hallazgos = [];
  for (const r of textos) {
    if (!(r.startsWith('contenido/') || r.startsWith('datos/')) || r === 'contenido/excluidos.yaml') continue;
    const texto = leer(r).toLowerCase();
    for (const p of patrones) if (texto.includes(p)) hallazgos.push(`${r}: «${p}»`);
  }
  assert.deepEqual(hallazgos, [], `aparece algo excluido:\n${hallazgos.join('\n')}`);
});

test('no hay claves de la API de pago en el repo', () => {
  const permitidos = /^(docs|tests)\//;
  const patron = /ANTHROPIC_API_KEY|anthropic_api_key|sk-ant-[a-z0-9]/i;
  const hallazgos = textos.filter((r) => !permitidos.test(r) && patron.test(leer(r)));
  assert.deepEqual(hallazgos, [], `la escuela solo usa la suscripción; revisa:\n${hallazgos.join('\n')}`);
});

test('no hay correos personales en el repo', () => {
  const correo = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const permitido = /@(users\.noreply\.github\.com|example\.(com|org)|anthropic\.com)$/i;
  const hallazgos = [];
  for (const r of textos) {
    for (const m of leer(r).match(correo) || []) if (!permitido.test(m)) hallazgos.push(`${r}: ${m}`);
  }
  assert.deepEqual(hallazgos, [], `hay correos en archivos del repo:\n${hallazgos.join('\n')}`);
});

test('trabajos/ y las claves están fuera de Git', () => {
  const reglas = leer('.gitignore').split(/\r?\n/).map((l) => l.trim());
  for (const regla of ['trabajos/', '.env', 'node_modules/']) assert.ok(reglas.includes(regla), `falta «${regla}» en .gitignore`);
  if (existsSync(join(RAIZ, '.git'))) {
    const ignorado = spawnSync('git', ['check-ignore', '-q', 'trabajos/prueba/prueba.pbip'], { cwd: RAIZ });
    assert.equal(ignorado.status, 0, 'Git no está ignorando trabajos/');
    const versionados = spawnSync('git', ['ls-files', 'trabajos', '.env'], { cwd: RAIZ, encoding: 'utf8' }).stdout.trim();
    assert.equal(versionados, '', `hay archivos de trabajos/ o .env versionados: ${versionados}`);
  }
});

test('ningún archivo pesa más de 5 MB', () => {
  const pesados = archivos.filter((a) => statSync(a).size > 5 * 1024 * 1024).map(rel);
  assert.deepEqual(pesados, [], `archivos de más de 5 MB: ${pesados.join(', ')}`);
});
