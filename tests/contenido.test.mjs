// Pruebas del contenido: formato, referencias entre archivos y reglas de fuentes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import * as E from '../esquemas/contenido.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ruta = (...partes) => join(RAIZ, ...partes);
const leerYaml = (...partes) => YAML.parse(readFileSync(ruta(...partes), 'utf8'));

function validar(esquema, datos, nombre) {
  const r = esquema.safeParse(datos);
  if (!r.success) {
    const detalle = r.error.issues.map((i) => `${i.path.join('.') || '(raíz)'}: ${i.message}`).join('\n  ');
    assert.fail(`${nombre} no cumple el formato:\n  ${detalle}`);
  }
  return r.data;
}

function leerLeccion(archivo) {
  const texto = readFileSync(archivo, 'utf8');
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  assert.ok(m, `${archivo}: falta el encabezado YAML entre líneas ---`);
  return { meta: YAML.parse(m[1]), cuerpo: m[2] };
}

const curriculo = validar(E.curriculo, leerYaml('contenido', 'curriculo.yaml'), 'curriculo.yaml');
const fuentes = validar(E.catalogoFuentes, leerYaml('contenido', 'fuentes.yaml'), 'fuentes.yaml');
const biblioteca = validar(E.biblioteca, leerYaml('contenido', 'biblioteca.yaml'), 'biblioteca.yaml');
const deprecados = validar(E.deprecados, leerYaml('contenido', 'deprecados.yaml'), 'deprecados.yaml');
const idsLibros = new Set(biblioteca.libros.map((l) => l.id));
const capitulos = new Map(curriculo.capitulos.map((c) => [c.id, c]));
const palabrasDeprecadas = deprecados.deprecados.flatMap((d) => d.palabras_clave.map((p) => p.toLowerCase()));

test('el currículo tiene la nivelación y los capítulos 1 a 32, sin ids repetidos', () => {
  const ids = curriculo.capitulos.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, 'hay capítulos repetidos');
  for (let i = 0; i <= 32; i++) {
    const id = `c${String(i).padStart(2, '0')}`;
    assert.ok(capitulos.has(id), `falta el capítulo ${id}`);
  }
});

test('los requisitos existen, no son de un nivel mayor y no forman ciclos', () => {
  for (const c of curriculo.capitulos) {
    for (const r of c.requiere) {
      assert.ok(capitulos.has(r), `${c.id} requiere ${r}, que no existe`);
      assert.ok(capitulos.get(r).nivel <= c.nivel, `${c.id} (nivel ${c.nivel}) requiere ${r}, de un nivel mayor`);
    }
  }
  const estado = new Map();
  const visitar = (id, camino) => {
    if (estado.get(id) === 'listo') return;
    assert.notEqual(estado.get(id), 'visitando', `ciclo de requisitos: ${[...camino, id].join(' → ')}`);
    estado.set(id, 'visitando');
    for (const r of capitulos.get(id).requiere) visitar(r, [...camino, id]);
    estado.set(id, 'listo');
  };
  for (const id of capitulos.keys()) visitar(id, []);
});

test('cada capítulo, salvo la nivelación, tiene al menos una fuente A o dos B', () => {
  for (const c of curriculo.capitulos.filter((x) => x.id !== 'c00')) {
    const a = c.fuentes.filter((f) => f.nivel === 'A').length;
    const b = c.fuentes.filter((f) => f.nivel === 'B').length;
    assert.ok(a >= 1 || b >= 2, `${c.id} necesita una fuente A o dos B`);
  }
});

test('las fuentes que citan un libro apuntan a uno de biblioteca.yaml', () => {
  for (const c of curriculo.capitulos) {
    for (const f of c.fuentes.filter((x) => x.libro)) {
      assert.ok(idsLibros.has(f.libro), `${c.id}: el libro ${f.libro} no está en biblioteca.yaml`);
    }
  }
});

test('las competencias llevan el id de su capítulo y no se repiten', () => {
  const vistas = new Set();
  for (const c of curriculo.capitulos) {
    if (c.id !== 'c00') assert.ok(c.competencias.length >= 1, `${c.id} no tiene competencias`);
    for (const k of c.competencias) {
      assert.ok(k.id.startsWith(`${c.id}-`), `${k.id} no pertenece a ${c.id}`);
      assert.ok(!vistas.has(k.id), `competencia repetida: ${k.id}`);
      vistas.add(k.id);
    }
  }
});

test('fuentes.yaml: ids únicos, y las del radar tienen feed, canal o repo y no están bloqueadas', () => {
  const ids = fuentes.fuentes.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length, 'hay fuentes repetidas');
  for (const f of fuentes.fuentes.filter((x) => x.radar)) {
    assert.ok(f.feed || f.youtube || f.github, `${f.id} está en el radar pero no tiene feed, canal ni repo`);
    assert.notEqual(f.estado, 'bloqueada', `${f.id} está bloqueada: no puede estar en el radar automático`);
  }
});

test('retos y excluidos tienen el formato correcto', () => {
  validar(E.retos, leerYaml('contenido', 'retos.yaml'), 'retos.yaml');
  validar(E.excluidos, leerYaml('contenido', 'excluidos.yaml'), 'excluidos.yaml');
});

for (const cap of curriculo.capitulos.filter((c) => c.carpeta)) {
  test(`${cap.id}: lecciones en los dos idiomas, prácticas, tarjetas y cierre válidos`, () => {
    const base = ruta('contenido', 'capitulos', cap.carpeta);
    assert.ok(existsSync(base), `no existe contenido/capitulos/${cap.carpeta}`);
    const yamlDe = (...p) => YAML.parse(readFileSync(join(base, ...p), 'utf8'));

    const tarjetas = validar(E.tarjetas, yamlDe('tarjetas.yaml'), `${cap.carpeta}/tarjetas.yaml`);
    assert.equal(tarjetas.capitulo, cap.id);
    const idsTarjetas = new Set(tarjetas.tarjetas.map((t) => t.id));
    assert.equal(idsTarjetas.size, tarjetas.tarjetas.length, 'hay tarjetas repetidas');
    for (const t of idsTarjetas) assert.ok(t.startsWith(`${cap.id}-`), `${t} no pertenece a ${cap.id}`);

    const idiomasPorLeccion = new Map();
    for (const archivo of readdirSync(join(base, 'lecciones')).filter((f) => f.endsWith('.md'))) {
      const m = archivo.match(/^(c\d{2}-l\d{2})\.(es|en)\.md$/);
      assert.ok(m, `${archivo}: el nombre debe ser <id>.<es|en>.md`);
      const { meta, cuerpo } = leerLeccion(join(base, 'lecciones', archivo));
      const datos = validar(E.leccion, meta, archivo);
      assert.equal(datos.id, m[1], `${archivo}: el id no calza con el nombre`);
      assert.equal(datos.idioma, m[2], `${archivo}: el idioma no calza con el nombre`);
      assert.equal(datos.capitulo, cap.id, `${archivo}: el capítulo no calza`);
      const palabras = cuerpo.split(/\s+/).filter(Boolean).length;
      assert.ok(palabras <= 450, `${archivo}: ${palabras} palabras; una micro-lección debe tener 450 o menos`);
      for (const t of datos.tarjetas) assert.ok(idsTarjetas.has(t), `${archivo}: la tarjeta ${t} no existe`);
      for (const f of datos.fuentes.filter((x) => x.libro)) assert.ok(idsLibros.has(f.libro), `${archivo}: libro desconocido`);
      for (const p of palabrasDeprecadas) assert.ok(!cuerpo.toLowerCase().includes(p), `${archivo} menciona algo deprecado: «${p}»`);
      idiomasPorLeccion.set(m[1], [...(idiomasPorLeccion.get(m[1]) || []), m[2]]);
    }
    assert.ok(idiomasPorLeccion.size >= 3, `${cap.id}: un capítulo con contenido necesita al menos 3 micro-lecciones`);
    for (const [id, idiomas] of idiomasPorLeccion) {
      assert.deepEqual([...idiomas].sort(), ['en', 'es'], `${id}: falta una de las dos versiones`);
    }

    const practicas = readdirSync(join(base, 'practicas'))
      .filter((f) => f.endsWith('.yaml'))
      .map((f) => validar(E.practica, yamlDe('practicas', f), f));
    assert.ok(practicas.length >= 2, `${cap.id}: un capítulo con contenido necesita al menos 2 prácticas`);
    for (const p of practicas) {
      assert.equal(p.capitulo, cap.id, `${p.id}: el capítulo no calza`);
      const archivoRespuestas = ruta(...p.dataset.split('/'), 'respuestas.json');
      assert.ok(existsSync(archivoRespuestas), `${p.id}: falta ${p.dataset}/respuestas.json (corre npm run dataset)`);
      const respuestas = JSON.parse(readFileSync(archivoRespuestas, 'utf8'))[p.respuestas];
      assert.ok(respuestas, `${p.id}: respuestas.json no tiene la clave ${p.respuestas}`);
      const texto = JSON.stringify(p);
      for (const [, clave] of texto.matchAll(/\{\{([a-z0-9_]+)\}\}/g)) {
        assert.ok(clave in respuestas, `${p.id}: {{${clave}}} no está en respuestas.json`);
      }
      for (const d of palabrasDeprecadas) assert.ok(!texto.toLowerCase().includes(d), `${p.id} menciona algo deprecado: «${d}»`);
    }

    const cierre = validar(E.cierre, yamlDe('cierre.yaml'), `${cap.carpeta}/cierre.yaml`);
    assert.equal(cierre.capitulo, cap.id);
    if (cierre.practica_final) {
      assert.ok(practicas.some((p) => p.id === cierre.practica_final), `el cierre pide ${cierre.practica_final}, que no existe`);
    }
  });
}
