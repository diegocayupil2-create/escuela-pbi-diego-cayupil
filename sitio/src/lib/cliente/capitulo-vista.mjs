// Página de capítulo en el navegador: su estado según el modo y el botón para elegirlo como capítulo actual.
import { estadosCapitulos, siguienteCapitulo, modoValido } from '../ruta.mjs';
import { leer, guardar } from './preferencias.mjs';
import { htmlEstado } from './mapa-vista.mjs';

export function iniciarCapitulo() {
  const datos = JSON.parse(document.getElementById('datos-capitulo').textContent);
  const T = datos.textos;
  const id = datos.id;
  const estadoEl = document.querySelector('[data-estado-texto]');
  const boton = document.querySelector('[data-elegir]');
  const aviso = document.querySelector('[data-no-disponible]');

  const pintar = () => {
    const modo = modoValido(leer('modo'));
    const { estado } = estadosCapitulos(datos.capitulos, { modo }).get(id);
    const esActual = siguienteCapitulo(datos.capitulos, { modo, elegido: leer('capitulo') })?.id === id;
    estadoEl.innerHTML = htmlEstado(estado, T);
    estadoEl.dataset.estado = estado;
    boton.disabled = estado !== 'disponible' || esActual;
    boton.querySelector('span').textContent = esActual ? T.capituloPagina.elegido : T.capituloPagina.elegir;
    boton.toggleAttribute('data-actual', esActual);
    aviso.hidden = estado === 'disponible' || estado === 'dominado' || estado === 'convalidado';
  };

  boton.addEventListener('click', () => {
    guardar('capitulo', id);
    pintar();
  });
  pintar();
}
