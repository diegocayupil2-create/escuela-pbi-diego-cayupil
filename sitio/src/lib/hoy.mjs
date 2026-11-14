// «Hoy»: qué toca según la fecha de Chile, el plan de la semana (si existe) y la ruta.
import { siguienteCapitulo } from './ruta.mjs';

export const ZONA = 'America/Santiago';
const DIA_MS = 86_400_000;

/** Fecha de hoy en Chile como AAAA-MM-DD. El cambio de hora lo resuelve la zona horaria. */
export function fechaChile(ahora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ahora);
}

const aUtc = (fecha) => {
  const [a, m, d] = fecha.split('-').map(Number);
  return Date.UTC(a, m - 1, d);
};

/** 0 = lunes … 6 = domingo. */
export const diaSemana = (fecha) => (new Date(aUtc(fecha)).getUTCDay() + 6) % 7;

/** Lunes de la semana de esa fecha, como AAAA-MM-DD. */
export const lunesDe = (fecha) => new Date(aUtc(fecha) - diaSemana(fecha) * DIA_MS).toISOString().slice(0, 10);

// Semana tipo de la propuesta (configurable desde la fase 3).
export const SEMANA_TIPO = ['dax-modelado', 'storytelling', 'rendimiento', 'caso-negocio', 'novedad', 'reto-portafolio', 'repaso-retro'];
export const temaDelDia = (fecha) => SEMANA_TIPO[diaSemana(fecha)];

/** El día del plan que calza con la fecha, o null. */
export function diaDelPlan(semanas, fecha) {
  for (const s of semanas ?? []) {
    const dia = s.dias.find((d) => d.fecha === fecha);
    if (dia) return dia;
  }
  return null;
}

/** Tarjetas del día: rota por la lista según la fecha, para no repetir siempre las mismas. */
export function tarjetasDelDia(ids, fecha, cuantas = 3) {
  if (!ids.length) return [];
  const n = Math.min(cuantas, ids.length);
  const inicio = (Math.floor(aUtc(fecha) / DIA_MS) * n) % ids.length;
  return Array.from({ length: n }, (_, i) => ids[(inicio + i) % ids.length]);
}

/**
 * Los 4 bloques de hoy. capitulos: [{ id, nivel, requiere, lecciones: [id], practicas: [id], tarjetas: [id] }].
 * Devuelve { origen: 'plan' | 'ruta', tema, capitulo, leccion, practica, repaso, nota }.
 */
export function bloquesDeHoy({ capitulos, semanas = [], fecha, modo, progreso = {}, elegido = null }) {
  const plan = diaDelPlan(semanas, fecha);
  if (plan) {
    const primero = plan.leccion ?? plan.practica ?? plan.repaso[0] ?? null;
    return {
      origen: 'plan',
      tema: plan.tema,
      capitulo: primero ? primero.slice(0, 3) : null,
      leccion: plan.leccion,
      practica: plan.practica,
      repaso: plan.repaso,
      nota: plan.nota ?? null,
    };
  }
  const paso = siguienteCapitulo(capitulos, { modo, progreso, elegido });
  const cap = capitulos.find((c) => c.id === paso?.id);
  return {
    origen: 'ruta',
    tema: temaDelDia(fecha),
    capitulo: cap?.id ?? null,
    leccion: cap?.lecciones[0] ?? null,
    practica: cap?.practicas[0] ?? null,
    repaso: cap ? tarjetasDelDia(cap.tarjetas, fecha) : [],
    nota: null,
  };
}

/** ¿La automatización está al día? Avisa si la corrida más reciente tiene más de 2 días. */
export function estadoAutomatizacion(registro, ahora = new Date()) {
  const fechas = Object.values(registro?.corridas ?? {}).map((t) => Date.parse(t)).filter(Number.isFinite);
  if (!fechas.length) return { tipo: 'sin-datos' };
  const ultima = Math.max(...fechas);
  const horas = (ahora.getTime() - ultima) / 3_600_000;
  if (horas > 48) return { tipo: 'detenida', dias: Math.floor(horas / 24), ultima: new Date(ultima).toISOString() };
  return { tipo: 'al-dia', ultima: new Date(ultima).toISOString() };
}
