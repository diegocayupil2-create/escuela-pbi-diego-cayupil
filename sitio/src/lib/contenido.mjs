// Junta el contenido para las páginas (solo al compilar): capítulos con sus lecciones, prácticas y tarjetas.
import { getCollection, getEntry } from 'astro:content';
import YAML from 'yaml';
import { semana } from '../../../esquemas/contenido.mjs';
import { md, mdLinea } from './markdown.mjs';
import { reemplazarClaves } from './formato.mjs';
import { rutaRelativa } from './enlaces.mjs';
import { ordenRecomendado } from './ruta.mjs';
import { TEXTOS } from './textos.mjs';

// Planes de la semana: contenido/semanas/<fecha del lunes>.yaml (los escribe la IA desde la fase 5).
const PLANES = import.meta.glob('../../../contenido/semanas/*.yaml', { eager: true, query: '?raw', import: 'default' });

let cache;

/** Todo el contenido, cargado una sola vez por compilación. */
export const cargarContenido = () => (cache ??= construir());

async function construir() {
  const curriculo = (await getEntry('curriculo', 'curriculo'))?.data;
  if (!curriculo) throw new Error('falta contenido/curriculo.yaml');
  const tarjetas = new Map((await getCollection('tarjetas')).map((e) => [e.id, e.data.tarjetas]));
  const cierres = new Map((await getCollection('cierres')).map((e) => [e.id, e.data]));
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
  }
  return { curriculo, capitulos, porId, orden: ordenRecomendado(capitulos), semanas, automatizacion, respuestas };
}

/** Valores de respuestas.json para una práctica. */
export function valoresDe(practica, respuestas) {
  const dataset = practica.dataset.split('/').at(-1);
  const valores = respuestas.get(dataset)?.[practica.respuestas];
  if (!valores) throw new Error(`${practica.id}: falta ${practica.respuestas} en ${practica.dataset}/respuestas.json`);
  return valores;
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

/** Lo que necesita el navegador para armar «Hoy» y el mapa. */
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
      practicas[p.id] = {
        titulo: reemplazarClaves(p.titulo[lang], valoresDe(p, respuestas), lang),
        minutos: p.minutos,
        url: rutaRelativa(lang, 'practica', { cap: c.id, id: p.id }),
      };
    }
    for (const x of c.tarjetas) tarjetas[x.id] = { frente: x.frente[lang], reverso: x.reverso[lang], tipo: x.tipo };
  }
  const T = TEXTOS[lang];
  return {
    lang,
    capitulos: capitulos.map((c) => ({
      id: c.id,
      num: c.num,
      nivel: c.nivel,
      requiere: c.requiere,
      titulo: c.titulo[lang],
      url: rutaRelativa(lang, 'capitulo', { cap: c.id }),
      lecciones: c.lecciones[lang].map((l) => l.data.id),
      practicas: c.practicas.map((p) => p.id),
      tarjetas: c.tarjetas.map((x) => x.id),
    })),
    lecciones,
    practicas,
    tarjetas,
    semanas,
    automatizacion,
    textos: { hoy: T.hoy, automatizacion: T.automatizacion, temas: T.temas, modos: T.modos, estados: T.estados, mapa: T.mapa, capituloPagina: T.capituloPagina, min: T.min, tipoTarjeta: T.tipoTarjeta },
  };
}

/** JSON seguro dentro de <script type="application/json">. */
export const jsonEnHtml = (datos) => JSON.stringify(datos).replace(/</g, '\\u003c');
