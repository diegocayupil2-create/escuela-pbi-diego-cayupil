// Mapa de capítulos en el navegador: el modo elegido cambia el estado de cada capítulo al instante.
import { estadosCapitulos, siguienteCapitulo, modoValido } from '../ruta.mjs';
import { svgIcono, ICONO_ESTADO } from '../iconos.mjs';
import { leer, guardar, esc } from './preferencias.mjs';

/** Estado e ícono de un capítulo, como HTML. */
export const htmlEstado = (estado, T) => `${svgIcono(ICONO_ESTADO[estado])}<span>${esc(T.estados[estado])}</span>`;

export function iniciarMapa() {
  const datos = JSON.parse(document.getElementById('datos-mapa').textContent);
  const T = datos.textos;
  const radios = [...document.querySelectorAll('input[name="modo"]')];

  const pintar = () => {
    const modo = modoValido(leer('modo'));
    for (const r of radios) r.checked = r.value === modo;
    const estados = estadosCapitulos(datos.capitulos, { modo });
    const aqui = siguienteCapitulo(datos.capitulos, { modo, elegido: leer('capitulo') })?.id;
    for (const li of document.querySelectorAll('[data-cap]')) {
      const { estado } = estados.get(li.dataset.cap);
      li.dataset.estado = estado;
      const texto = li.querySelector('[data-estado-texto]');
      if (texto) texto.innerHTML = htmlEstado(estado, T);
      if (li.dataset.titulo) li.title = `${li.dataset.titulo} · ${T.estados[estado]}`;
      li.toggleAttribute('data-aqui', li.dataset.cap === aqui);
    }
  };

  for (const r of radios) {
    r.addEventListener('change', () => {
      guardar('modo', r.value);
      pintar();
    });
  }
  pintar();
}
