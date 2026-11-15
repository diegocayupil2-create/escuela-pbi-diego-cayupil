// Pruebas de la lógica del sitio: rutas por idioma, ruta por capítulos, «Hoy», formato, colores y textos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { rutaRelativa, otroIdioma } from '../sitio/src/lib/enlaces.mjs';
import { ordenRecomendado, estadosCapitulos, siguienteCapitulo, modoValido, itemsCapitulo, dondeVoy, ordenLectura } from '../sitio/src/lib/ruta.mjs';
import {
  fechaChile, diaSemana, lunesDe, temaDelDia, diaDelPlan, tarjetasDelDia, bloquesDeHoy, estadoAutomatizacion, armarMazo,
} from '../sitio/src/lib/hoy.mjs';
import { formatoNumero, reemplazarClaves } from '../sitio/src/lib/formato.mjs';
import { PALETA, PARES, contraste, cssPaleta, nombreCss } from '../sitio/src/lib/paleta.mjs';
import { TEXTOS, duracion, plural } from '../sitio/src/lib/textos.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const curriculo = YAML.parse(readFileSync(join(RAIZ, 'contenido', 'curriculo.yaml'), 'utf8'));
const CAPS = curriculo.capitulos.map((c) => ({ id: c.id, nivel: c.nivel, requiere: c.requiere }));

test('rutas por idioma: mismas páginas con nombres en español o inglés', () => {
  assert.equal(rutaRelativa('es', 'hoy'), 'es/');
  assert.equal(rutaRelativa('es', 'temario'), 'es/temario/');
  assert.equal(rutaRelativa('en', 'temario'), 'en/syllabus/');
  assert.equal(rutaRelativa('en', 'repaso'), 'en/review/');
  assert.equal(rutaRelativa('en', 'mas'), 'en/more/');
  assert.equal(rutaRelativa('es', 'ficha', { cap: 'c10' }), 'es/capitulos/c10/ficha/');
  assert.equal(rutaRelativa('en', 'mapa'), 'en/map/');
  assert.equal(rutaRelativa('es', 'leccion', { cap: 'c10', id: 'c10-l01' }), 'es/capitulos/c10/lecciones/c10-l01/');
  assert.equal(rutaRelativa('en', 'practica', { cap: 'c10', id: 'c10-p01' }), 'en/chapters/c10/practice/c10-p01/');
  assert.equal(otroIdioma('es'), 'en');
  assert.throws(() => rutaRelativa('pt', 'hoy'));
});

test('orden recomendado: parte por la nivelación y cada capítulo va después de sus requisitos', () => {
  const orden = ordenRecomendado(CAPS);
  assert.equal(orden.length, CAPS.length);
  assert.deepEqual(orden.slice(0, 3), ['c00', 'c01', 'c02']);
  const pos = new Map(orden.map((id, i) => [id, i]));
  for (const c of CAPS) for (const r of c.requiere) assert.ok(pos.get(r) < pos.get(c.id), `${r} debe ir antes que ${c.id}`);
});

test('estados según el modo', () => {
  const cero = estadosCapitulos(CAPS, { modo: 'cero' });
  assert.equal(cero.get('c01').estado, 'disponible');
  assert.equal(cero.get('c02').estado, 'bloqueado');
  assert.deepEqual(cero.get('c02').faltan, ['c01']);
  assert.equal(cero.get('c00').estado, 'opcional');

  const nivelacion = estadosCapitulos(CAPS, { modo: 'nivelacion' });
  assert.equal(nivelacion.get('c00').estado, 'disponible');
  assert.equal(nivelacion.get('c10').estado, 'por-ubicar');

  const libre = estadosCapitulos(CAPS, { modo: 'libre' });
  assert.ok([...libre.values()].every((e) => e.estado === 'disponible'));

  // Con progreso (fase 3): lo dominado y lo convalidado abren los capítulos que siguen.
  const conProgreso = estadosCapitulos(CAPS, { modo: 'nivelacion', progreso: { dominados: ['c00', 'c01'], convalidados: ['c04'] } });
  assert.equal(conProgreso.get('c01').estado, 'dominado');
  assert.equal(conProgreso.get('c04').estado, 'convalidado');
  assert.equal(conProgreso.get('c02').estado, 'disponible');
  assert.equal(conProgreso.get('c05').estado, 'disponible');
  assert.equal(conProgreso.get('c03').estado, 'bloqueado');
});

test('siguiente capítulo: el elegido si está disponible; si no, el primero de la ruta', () => {
  assert.equal(siguienteCapitulo(CAPS, { modo: 'cero' }).id, 'c01');
  assert.equal(siguienteCapitulo(CAPS, { modo: 'nivelacion' }).id, 'c00');
  assert.equal(siguienteCapitulo(CAPS, { modo: 'libre', elegido: 'c10' }).id, 'c10');
  assert.equal(siguienteCapitulo(CAPS, { modo: 'cero', elegido: 'c10' }).id, 'c01', 'c10 está bloqueado desde cero');
  assert.equal(modoValido('otro'), 'nivelacion');
});

test('la fecha de «Hoy» es la de Chile, con horario de verano e invierno', () => {
  assert.equal(fechaChile(new Date('2026-11-15T02:30:00Z')), '2026-11-14'); // verano: UTC−3
  assert.equal(fechaChile(new Date('2026-11-15T03:30:00Z')), '2026-11-15');
  assert.equal(fechaChile(new Date('2027-06-15T03:30:00Z')), '2027-06-14'); // invierno: UTC−4
  assert.equal(fechaChile(new Date('2027-06-15T04:30:00Z')), '2027-06-15');
  assert.equal(diaSemana('2026-11-14'), 5);
  assert.equal(lunesDe('2026-11-14'), '2026-11-09');
  assert.equal(temaDelDia('2026-11-14'), 'reto-portafolio');
  assert.equal(temaDelDia('2026-11-16'), 'dax-modelado');
});

const CAPS_HOY = [
  { id: 'c00', nivel: 0, requiere: [], lecciones: [], practicas: [], tarjetas: [] },
  { id: 'c01', nivel: 1, requiere: [], lecciones: [], practicas: [], tarjetas: [] },
  {
    id: 'c10', nivel: 2, requiere: ['c01'],
    lecciones: ['c10-l01', 'c10-l02'], practicas: ['c10-p01'], tarjetas: ['c10-t01', 'c10-t02', 'c10-t03', 'c10-t04'],
  },
];
const PLAN = [{
  lunes: '2026-11-16', generado: '2026-11-15',
  dias: [{ fecha: '2026-11-17', tema: 'storytelling', leccion: 'c10-l02', practica: null, repaso: ['c10-t02'] }],
}];

test('«Hoy» usa el plan de la semana si existe; si no, el siguiente paso de la ruta', () => {
  const conPlan = bloquesDeHoy({ capitulos: CAPS_HOY, semanas: PLAN, fecha: '2026-11-17', modo: 'cero' });
  assert.equal(conPlan.origen, 'plan');
  assert.equal(conPlan.leccion, 'c10-l02');
  assert.equal(conPlan.capitulo, 'c10');
  assert.deepEqual(conPlan.repaso, ['c10-t02']);

  const sinPlan = bloquesDeHoy({ capitulos: CAPS_HOY, semanas: PLAN, fecha: '2026-11-18', modo: 'libre', elegido: 'c10' });
  assert.equal(sinPlan.origen, 'ruta');
  assert.equal(sinPlan.tema, 'rendimiento');
  assert.equal(sinPlan.leccion, 'c10-l01');
  assert.equal(sinPlan.practica, 'c10-p01');
  assert.equal(sinPlan.repaso.length, 3);

  const desdeCero = bloquesDeHoy({ capitulos: CAPS_HOY, fecha: '2026-11-18', modo: 'cero' });
  assert.equal(desdeCero.capitulo, 'c01');
  assert.equal(desdeCero.leccion, null, 'un capítulo sin lecciones no inventa una');
  assert.equal(diaDelPlan([], '2026-11-18'), null);
});

test('las tarjetas del día rotan, sin repetirse dentro del mismo día', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const hoy = tarjetasDelDia(ids, '2026-11-14');
  assert.equal(hoy.length, 3);
  assert.equal(new Set(hoy).size, 3);
  assert.deepEqual(tarjetasDelDia(ids, '2026-11-14'), hoy, 'el mismo día da las mismas');
  assert.notDeepEqual(tarjetasDelDia(ids, '2026-11-15'), hoy, 'otro día da otras');
  assert.deepEqual(tarjetasDelDia(['a'], '2026-11-14'), ['a']);
  assert.deepEqual(tarjetasDelDia([], '2026-11-14'), []);
});

test('avisa si la automatización lleva más de 2 días detenida', () => {
  const ahora = new Date('2026-11-14T12:00:00-03:00');
  assert.equal(estadoAutomatizacion(null, ahora).tipo, 'sin-datos');
  assert.equal(estadoAutomatizacion({ corridas: { busquedas: '2026-11-14T05:40:00-03:00' } }, ahora).tipo, 'al-dia');
  assert.equal(estadoAutomatizacion({ corridas: { busquedas: '2026-11-12T13:00:00-03:00' } }, ahora).tipo, 'al-dia', '47 horas todavía está al día');
  const detenida = estadoAutomatizacion({ corridas: { busquedas: '2026-11-11T06:00:00-03:00', ia: '2026-11-12T06:00:00-03:00' } }, ahora);
  assert.equal(detenida.tipo, 'detenida');
  assert.equal(detenida.dias, 2, 'cuenta desde la corrida más reciente');
});

test('números del dataset con separador de miles en cada idioma', () => {
  assert.equal(formatoNumero(20000000, 'es'), '20.000.000');
  assert.equal(formatoNumero(1234, 'es'), '1.234');
  assert.equal(formatoNumero(74.4, 'es'), '74,4');
  assert.equal(formatoNumero(20000000, 'en'), '20,000,000');
  assert.equal(formatoNumero(74.4, 'en'), '74.4');
  assert.equal(reemplazarClaves('Más de {{umbral}} pesos en {{region}}', { umbral: 6451943, region: 'Biobío' }, 'es'), 'Más de 6.451.943 pesos en Biobío');
  assert.throws(() => reemplazarClaves('{{falta}}', {}, 'es'), /falta/);
  assert.throws(() => reemplazarClaves('{{tabla}}', { tabla: { a: 1 } }, 'es'), /no es un número/);
});

test('cada {{clave}} de las prácticas se puede mostrar en los dos idiomas', () => {
  const base = join(RAIZ, 'contenido', 'capitulos');
  for (const carpeta of readdirSync(base)) {
    const dir = join(base, carpeta, 'practicas');
    let archivos = [];
    try { archivos = readdirSync(dir).filter((f) => f.endsWith('.yaml')); } catch { continue; }
    for (const archivo of archivos) {
      const p = YAML.parse(readFileSync(join(dir, archivo), 'utf8'));
      const respuestas = JSON.parse(readFileSync(join(RAIZ, ...p.dataset.split('/'), 'respuestas.json'), 'utf8'))[p.respuestas];
      for (const lang of ['es', 'en']) {
        const textos = JSON.stringify(p, (k, v) => (v && typeof v === 'object' && lang in v && !Array.isArray(v) ? v[lang] : v));
        assert.doesNotThrow(() => reemplazarClaves(textos, respuestas, lang), `${p.id} (${lang})`);
      }
    }
  }
});

test('identidad Pizarra: cada par de colores se lee bien en claro y en oscuro', () => {
  for (const modo of ['claro', 'oscuro']) {
    for (const [a, b, minimo] of PARES) {
      const c = contraste(PALETA[modo][a], PALETA[modo][b]);
      assert.ok(c >= minimo, `${modo}: ${a} sobre ${b} tiene ${c.toFixed(2)}; necesita ${minimo}`);
    }
  }
  assert.equal(PALETA.claro.acento, '#1F5FD6');
  assert.equal(PALETA.oscuro.acento, '#6E9EFF');
  const css = cssPaleta();
  assert.match(css, /--acento:#1F5FD6/);
  assert.match(css, /\[data-tema="oscuro"\][^}]*--acento:#6E9EFF/);
});

test('los textos de la interfaz existen en español y en inglés', () => {
  const claves = (o, prefijo = '') =>
    Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? claves(v, `${prefijo}${k}.`) : [`${prefijo}${k}`]));
  assert.deepEqual(claves(TEXTOS.en).sort(), claves(TEXTOS.es).sort());
});

test('«dónde voy»: lo primero sin hacer del capítulo, y el orden de lectura de todo el temario', () => {
  const cap = { lecciones: ['c10-l01', 'c10-l02'], practicas: ['c10-p01'] };
  const items = itemsCapitulo(cap);
  assert.deepEqual(items.map((x) => x.tipo), ['leccion', 'leccion', 'practica']);
  assert.equal(dondeVoy(items, []).id, 'c10-l01');
  assert.equal(dondeVoy(items, ['c10-l01']).id, 'c10-l02');
  assert.equal(dondeVoy(items, ['c10-l01', 'c10-l02', 'c10-p01']), null);

  const lectura = ordenLectura(CAPS_HOY);
  assert.deepEqual(lectura.slice(0, 3).map((p) => p.cap), ['c00', 'c01', 'c10']);
  const c10 = lectura.filter((p) => p.cap === 'c10').map((p) => p.tipo + ':' + p.id);
  assert.deepEqual(c10, ['capitulo:c10', 'leccion:c10-l01', 'leccion:c10-l02', 'practica:c10-p01']);
});

test('«Hoy» sigue con la lección sin leer y avisa cuando ya está todo leído', () => {
  const base = { capitulos: CAPS_HOY, fecha: '2026-11-18', modo: 'libre', elegido: 'c10' };
  assert.equal(bloquesDeHoy({ ...base, hechos: ['c10-l01'] }).leccion, 'c10-l02');
  const todo = bloquesDeHoy({ ...base, hechos: ['c10-l01', 'c10-l02', 'c10-p01'] });
  assert.equal(todo.leccion, null);
  assert.equal(todo.todoLeido, true);
  assert.equal(todo.todoPracticado, true);
});

test('mazos de repaso: hoy, mi capítulo o todas; si el capítulo no tiene tarjetas, usa las que hay', () => {
  const hoy = armarMazo({ capitulos: CAPS_HOY, capitulo: 'c10', fecha: '2026-11-14', tipo: 'hoy' });
  assert.equal(hoy.ids.length, 3);
  assert.equal(hoy.respaldo, false);
  assert.equal(armarMazo({ capitulos: CAPS_HOY, capitulo: 'c10', fecha: '2026-11-14', tipo: 'capitulo' }).ids.length, 4);
  const sinTarjetas = armarMazo({ capitulos: CAPS_HOY, capitulo: 'c01', fecha: '2026-11-14', tipo: 'capitulo' });
  assert.equal(sinTarjetas.respaldo, true);
  assert.equal(sinTarjetas.ids.length, 4);
  assert.equal(armarMazo({ capitulos: CAPS_HOY.slice(0, 2), capitulo: 'c01', fecha: '2026-11-14' }).ids.length, 0);
});

test('tiempos y plurales en los dos idiomas', () => {
  assert.equal(duracion(45, 'es'), '45 min');
  assert.equal(duracion(85, 'es'), '1 h 25 min');
  assert.equal(duracion(120, 'en'), '2 h');
  assert.equal(duracion(80, 'es', true), '≈ 1 h 20 min');
  assert.equal(plural(1, TEXTOS.es.temario.capitulos), '1 capítulo');
  assert.equal(plural(8, TEXTOS.en.temario.capitulos), '8 chapters');
});

test('cada variable de color que usa el CSS existe en la paleta', () => {
  const css = readFileSync(join(RAIZ, 'sitio', 'src', 'estilos', 'global.css'), 'utf8');
  const definidas = new Set(Object.keys(PALETA.claro).map(nombreCss));
  const propias = new Set(['--avance']); // la pone el navegador en las barras de avance
  const faltan = [...new Set([...css.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]))]
    .filter((v) => !definidas.has(v) && !propias.has(v) && !v.startsWith('--shiki-'));
  assert.deepEqual(faltan, [], `variables sin definir: ${faltan.join(', ')}`);
  assert.equal(nombreCss('texto2'), '--texto2');
  assert.equal(nombreCss('acentoSuave'), '--acento-suave');
});
