// Temario en el navegador: estado de cada capítulo según el modo, ✓ en lo hecho y «vas en» arriba.
import { estadosCapitulos, siguienteCapitulo, itemsCapitulo, dondeVoy } from '../ruta.mjs';
import { t } from '../textos.mjs';
import { preferencias, leerDatos, htmlEstado } from './estado.mjs';
import { svgIcono } from '../iconos.mjs';

const BASE = import.meta.env.BASE_URL;

export function iniciarTemario() {
  const datos = leerDatos('datos-temario');
  const T = datos.textos;
  const { modo, elegido, hechos } = preferencias();
  const estados = estadosCapitulos(datos.capitulos, { modo });
  const aqui = siguienteCapitulo(datos.capitulos, { modo, elegido })?.id ?? null;

  for (const el of document.querySelectorAll('[data-cap]')) {
    const { estado } = estados.get(el.dataset.cap);
    el.dataset.estado = estado;
    el.toggleAttribute('data-aqui', el.dataset.cap === aqui);
    const texto = el.querySelector('[data-estado-texto]');
    if (texto) texto.innerHTML = htmlEstado(estado, T);
  }
  for (const li of document.querySelectorAll('[data-item]')) {
    const hecho = hechos.includes(li.dataset.item);
    li.classList.toggle('hecho', hecho);
    const marca = li.querySelector('[data-marca]');
    if (marca) marca.innerHTML = hecho ? svgIcono('si', 'icono sino-icono') : '';
  }

  const dominados = [...estados.values()].filter((e) => e.estado === 'dominado' || e.estado === 'convalidado').length;
  document.querySelector('[data-dominados]').textContent = t(T.temario.dominados, { n: dominados, t: datos.capitulos.length });
  document.querySelector('[data-modo]').textContent = `${T.temario.modo}: ${T.modos[modo].nombre}`;

  const cap = datos.capitulos.find((c) => c.id === aqui);
  const caja = document.querySelector('[data-vas-en]');
  if (cap) {
    const item = dondeVoy(itemsCapitulo(cap), hechos);
    const destino = item ? (item.tipo === 'leccion' ? datos.lecciones[item.id] : datos.practicas[item.id]) : null;
    caja.querySelector('[data-vas-cap]').textContent = `${cap.num} · ${cap.titulo}`;
    caja.querySelector('[data-vas-item]').textContent = destino?.titulo ?? '';
    const boton = caja.querySelector('[data-vas-boton]');
    boton.href = BASE + (destino?.url ?? cap.url);
    caja.hidden = false;
  }
}
