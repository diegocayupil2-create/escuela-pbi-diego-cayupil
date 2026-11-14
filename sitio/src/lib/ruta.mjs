// La ruta por capítulos: orden recomendado, estado de cada capítulo y siguiente paso.
// Funciones puras: las usan las páginas, el navegador y las pruebas. El progreso llega con Firebase (fase 3);
// mientras tanto viene vacío y solo cuentan el modo y el capítulo elegido.

export const MODOS = ['nivelacion', 'cero', 'libre'];
export const MODO_POR_DEFECTO = 'nivelacion';

/** Un modo guardado que ya no existe vuelve al recomendado. */
export const modoValido = (m) => (MODOS.includes(m) ? m : MODO_POR_DEFECTO);

/** Orden recomendado: por nivel y número, respetando los requisitos. */
export function ordenRecomendado(capitulos) {
  const pendientes = [...capitulos].sort((a, b) => a.nivel - b.nivel || a.id.localeCompare(b.id));
  const listos = new Set();
  const orden = [];
  while (pendientes.length) {
    const i = pendientes.findIndex((c) => c.requiere.every((r) => listos.has(r)));
    if (i === -1) throw new Error('los requisitos forman un ciclo');
    const [c] = pendientes.splice(i, 1);
    listos.add(c.id);
    orden.push(c.id);
  }
  return orden;
}

/**
 * Estado de cada capítulo: dominado, convalidado, disponible, bloqueado, por-ubicar u opcional.
 * progreso = { dominados: [], convalidados: [] }; la nivelación cuenta como hecha si c00 está en dominados.
 */
export function estadosCapitulos(capitulos, { modo = MODO_POR_DEFECTO, progreso = {} } = {}) {
  const dominados = new Set(progreso.dominados ?? []);
  const convalidados = new Set(progreso.convalidados ?? []);
  const nivelacionHecha = dominados.has('c00');
  const cumplido = (id) => dominados.has(id) || convalidados.has(id);
  const estados = new Map();
  for (const c of capitulos) {
    let estado;
    if (dominados.has(c.id)) estado = 'dominado';
    else if (convalidados.has(c.id)) estado = 'convalidado';
    else if (modo === 'libre') estado = 'disponible';
    else if (c.id === 'c00') estado = modo === 'nivelacion' ? 'disponible' : 'opcional';
    else if (modo === 'nivelacion' && !nivelacionHecha) estado = 'por-ubicar';
    else estado = c.requiere.every(cumplido) ? 'disponible' : 'bloqueado';
    estados.set(c.id, { estado, faltan: c.requiere.filter((r) => !cumplido(r)) });
  }
  return estados;
}

/** Siguiente capítulo: el elegido si está disponible; si no, el primero disponible de la ruta. */
export function siguienteCapitulo(capitulos, { modo = MODO_POR_DEFECTO, progreso = {}, elegido = null } = {}) {
  const estados = estadosCapitulos(capitulos, { modo, progreso });
  if (elegido && estados.get(elegido)?.estado === 'disponible') return { id: elegido, motivo: 'elegido' };
  const orden = ordenRecomendado(capitulos).filter((id) => !(modo === 'cero' && id === 'c00'));
  const id = orden.find((x) => estados.get(x).estado === 'disponible');
  return id ? { id, motivo: 'ruta' } : null;
}
