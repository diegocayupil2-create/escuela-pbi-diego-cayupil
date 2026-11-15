// Estado de Diego en este dispositivo (hasta Firebase en la fase 3): modo, capítulo elegido y lo que marcó como hecho.
import { leer, guardar, esc } from './preferencias.mjs';
import { modoValido } from '../ruta.mjs';
import { svgIcono, ICONO_ESTADO } from '../iconos.mjs';

export const leerHechos = () => {
  try {
    const lista = JSON.parse(leer('hechos', '[]'));
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
};

export function marcarHecho(id, hecho) {
  const hechos = new Set(leerHechos());
  if (hecho) hechos.add(id);
  else hechos.delete(id);
  guardar('hechos', JSON.stringify([...hechos]));
}

export const preferencias = () => ({ modo: modoValido(leer('modo')), elegido: leer('capitulo'), hechos: leerHechos() });

/** Datos JSON que la página dejó en un <script type="application/json">. */
export const leerDatos = (id) => JSON.parse(document.getElementById(id)?.textContent ?? 'null');

/** Textos de la interfaz del idioma de la página (los deja Base.astro). */
export const textos = () => leerDatos('textos');

/** Estado de un capítulo con su ícono, como HTML. */
export const htmlEstado = (estado, T) => `${svgIcono(ICONO_ESTADO[estado])}<span>${esc(T.estados[estado])}</span>`;
