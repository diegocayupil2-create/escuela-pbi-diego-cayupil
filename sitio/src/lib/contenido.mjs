// Junta el contenido para las páginas (solo al compilar): capítulos con sus lecciones, prácticas, tarjetas,
// glosario y diagramas, y el orden de lectura de todo el temario.
import { getCollection, getEntry } from 'astro:content';
import YAML from 'yaml';
import { semana } from '../../../esquemas/contenido.mjs';
import { md, mdLinea } from './markdown.mjs';
import { reemplazarClaves } from './formato.mjs';
import { rutaRelativa } from './enlaces.mjs';
import { ordenRecomendado, ordenLectura } from './ruta.mjs';
import { TEXTOS } from './textos.mjs';

// Planes de la semana: contenido/semanas/<fecha del lunes>.yaml (los escribe la IA desde la fase 5).
const PLANES = import.meta.glob('../../../contenido/semanas/*.yaml', { eager: true, query: '?raw', import: 'default' });
// Diagramas propios: contenido/capitulos/<carpeta>/diagramas/<id>.<es|en>.svg
const SVG = import.meta.glob('../../../contenido/capitulos/*/diagramas/*.svg', { eager: true, query: '?raw', import: 'default' });
const DIAGRAMAS = new Map(Object.entries(SVG).map(([ruta, svg]) => [ruta.split('/').at(-1).replace(/\.svg$/, ''), svg.trim()]));

// Un capítulo sin contenido se estima con lo que trae uno típico: 4 micro-lecciones de 5 min y 2 prácticas de 30.
export const MINUTOS_ESTIMADOS = 4 * 5 + 2 * 30;

/** Un diagrama como <figure>, con el SVG en línea para que tome los colores del tema. */
export function figuraDiagrama(id, lang, clase = 'diagrama') {
  const svg = DIAGRAMAS.get(`${id}.${lang}`);
  if (!svg) throw new Error(`falta el diagrama ${id}.${lang}.svg`);
  const titulo = svg.match(/<title[^>]*>([^<]+)<\/title>/)?.[1] ?? '';
  return `<figure class="${clase}">${svg}<figcaption aria-hidden="true">${titulo}</figcaption></figure>`;
}

/** HTML de una lección con cada [[diagrama id]] reemplazado por su figura. */
export function htmlLeccion(entrada) {
  const html = entrada.rendered?.html;
  if (html == null) throw new Error(`${entrada.id}: la lección no se pudo convertir`);
  return html.replace(/<p>\[\[diagrama (c\d{2}-d\d{2})\]\]<\/p>/g, (_, id) => figuraDiagrama(id, entrada.data.idioma));
}

/** Los diagramas que cita una lección, en orden. */
export const diagramasDe = (entrada) => [...(entrada.body ?? '').matchAll(/^\[\[diagrama (c\d{2}-d\d{2})\]\]$/gm)].map((m) => m[1]);

let cache;

/** Todo el contenido, cargado una sola vez por compilación. */
export const cargarContenido = () => (cache ??= construir());

async function construir() {
  const curriculo = (await getEntry('curriculo', 'curriculo'))?.data;
  if (!curriculo) throw new Error('falta contenido/curriculo.yaml');
  const tarjetas = new Map((await getCollection('tarjetas')).map((e) => [e.id, e.data.tarjetas]));
  const cierres = new Map((await getCollection('cierres')).map((e) => [e.id, e.data]));
  const glosarios = new Map((await getCollection('glosarios')).map((e) => [e.id, e.data.terminos]));
  const respuestas = new Map((await getCollection('respuestas')).map((e) => [e.id, e.data]));
  const semanas = Object.entries(PLANES)
    .map(([archivo, texto]) => {
      const r = semana.safeParse(YAML.parse(texto));
      if (!r.success) throw new Error(`${archivo}: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      return r.data;
    })
    .sort((a, b) => a.lunes.localeCompare(b.lunes));
  const automatizacion = (await getEntry('automatizacion', 'estado'))?.data ?? null;

  const capitulos = curriculo.capitulos.map((c) => ({
    ...c,
    num: Number(c.id.slice(1)),
    lecciones: { es: [], en: [] },
    practicas: [],
    tarjetas: tarjetas.get(c.id) ?? [],
    cierre: cierres.get(c.id) ?? null,
    glosario: glosarios.get(c.id) ?? [],
  }));
  const porId = new Map(capitulos.map((c) => [c.id, c]));
  for (const l of await getCollection('lecciones')) {
    const cap = porId.get(l.data.capitulo);
    if (!cap) throw new Error(`${l.id}: el capítulo ${l.data.capitulo} no está en el currículo`);
    cap.lecciones[l.data.idioma].push(l);
  }
  for (const p of await getCollection('practicas')) {
    const cap = porId.get(p.data.capitulo);
    if (!cap) throw new Error(`${p.id}: el capítulo ${p.data.capitulo} no está en el currículo`);
    cap.practicas.push(p.data);
  }
  for (const c of capitulos) {
    for (const lang of ['es', 'en']) c.lecciones[lang].sort((a, b) => a.data.id.localeCompare(b.data.id));
    c.practicas.sort((a, b) => a.id.localeCompare(b.id));
    const real = c.lecciones.es.reduce((s, l) => s + l.data.minutos, 0) + c.practicas.reduce((s, p) => s + p.minutos, 0);
    c.minutos = real || MINUTOS_ESTIMADOS;
    c.estimado = real === 0;
  }
  const ligeros = capitulos.map((c) => ({
    id: c.id, nivel: c.nivel, requiere: c.requiere,
    lecciones: c.lecciones.es.map((l) => l.data.id), practicas: c.practicas.map((p) => p.id),
  }));
  return { curriculo, capitulos, porId, orden: ordenRecomendado(capitulos), lectura: ordenLectura(ligeros), semanas, automatizacion, respuestas };
}

/** Valores de respuestas.json para una práctica. */
export function valoresDe(practica, respuestas) {
  const dataset = practica.dataset.split('/').at(-1);
  const valores = respuestas.get(dataset)?.[practica.respuestas];
  if (!valores) throw new Error(`${practica.id}: falta ${practica.respuestas} en ${practica.dataset}/respuestas.json`);
  return valores;
}

/** Título de una práctica con sus {{valores}} ya puestos. */
export const tituloPractica = (p, lang, respuestas) => reemplazarClaves(p.titulo[lang], valoresDe(p, respuestas), lang);

/** Una página del orden de lectura como enlace: URL, título y qué es. */
export function paginaComoEnlace(contenido, pagina, lang) {
  const cap = contenido.porId.get(pagina.cap);
  const url = rutaRelativa(lang, pagina.tipo, { cap: pagina.cap, id: pagina.id });
  if (pagina.tipo === 'capitulo') return { url, titulo: `${cap.num} · ${cap.titulo[lang]}`, tipo: 'capitulo' };
  if (pagina.tipo === 'leccion') return { url, titulo: cap.lecciones[lang].find((l) => l.data.id === pagina.id).data.titulo, tipo: 'leccion' };
  return { url, titulo: tituloPractica(cap.practicas.find((p) => p.id === pagina.id), lang, contenido.respuestas), tipo: 'practica' };
}

/** Anterior y siguiente en el orden de lectura de todo el temario. */
export function vecinos(contenido, tipo, cap, id, lang) {
  const i = contenido.lectura.findIndex((p) => p.tipo === tipo && p.cap === cap && p.id === (id ?? cap));
  const enlace = (p) => (p ? paginaComoEnlace(contenido, p, lang) : null);
  return { anterior: enlace(contenido.lectura[i - 1]), siguiente: enlace(contenido.lectura[i + 1]) };
}

/** Una práctica lista para mostrar: {{claves}} reemplazadas y Markdown convertido. */
export async function practicaVista(p, lang, respuestas) {
  const valores = valoresDe(p, respuestas);
  const r = (texto) => reemplazarClaves(texto, valores, lang);
  const lineas = (lista) => Promise.all(lista.map((x) => mdLinea(r(x))));
  return {
    titulo: r(p.titulo[lang]),
    objetivo: await md(r(p.objetivo[lang])),
    porQue: await md(r(p.por_que_importa[lang])),
    contexto: await md(r(p.contexto[lang])),
    pasos: await lineas(p.pasos[lang]),
    criterios: await lineas(p.criterios_exito.map((x) => x[lang])),
    pistas: await lineas(p.pistas.map((x) => x[lang])),
    solucion: await md(r(p.solucion[lang])),
    storytelling: await md(r(p.storytelling[lang])),
  };
}

/** Lo que necesita el navegador para armar «Hoy», el temario, el repaso y el índice de cada capítulo. */
export function datosNavegador(contenido, lang) {
  const { capitulos, semanas, automatizacion, respuestas } = contenido;
  const lecciones = {};
  const practicas = {};
  const tarjetas = {};
  for (const c of capitulos) {
    for (const l of c.lecciones[lang]) {
      lecciones[l.data.id] = { titulo: l.data.titulo, minutos: l.data.minutos, url: rutaRelativa(lang, 'leccion', { cap: c.id, id: l.data.id }) };
    }
    for (const p of c.practicas) {
      practicas[p.id] = { titulo: tituloPractica(p, lang, respuestas), minutos: p.minutos, url: rutaRelativa(lang, 'practica', { cap: c.id, id: p.id }) };
    }
    for (const x of c.tarjetas) tarjetas[x.id] = { frente: x.frente[lang], reverso: x.reverso[lang], tipo: x.tipo, cap: c.id };
  }
  return {
    lang,
    capitulos: capitulos.map((c) => ({
      id: c.id,
      num: c.num,
      nivel: c.nivel,
      requiere: c.requiere,
      titulo: c.titulo[lang],
      url: rutaRelativa(lang, 'capitulo', { cap: c.id }),
      ficha: c.lecciones[lang].length ? rutaRelativa(lang, 'ficha', { cap: c.id }) : null,
      lecciones: c.lecciones[lang].map((l) => l.data.id),
      practicas: c.practicas.map((p) => p.id),
      tarjetas: c.tarjetas.map((x) => x.id),
    })),
    lecciones,
    practicas,
    tarjetas,
    semanas,
    automatizacion,
    textos: TEXTOS[lang],
  };
}

/** JSON seguro dentro de <script type="application/json">. */
export const jsonEnHtml = (datos) => JSON.stringify(datos).replace(/</g, '\\u003c');
