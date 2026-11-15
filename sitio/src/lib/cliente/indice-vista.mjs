// Índice de un capítulo: marca lo hecho con ✓, dice «vas aquí» en lo primero que falta y cuenta el avance.
// También maneja los botones «Marcar como leída / hecha» de lecciones y prácticas.
import { leerHechos, marcarHecho, textos } from './estado.mjs';
import { svgIcono } from '../iconos.mjs';
import { t } from '../textos.mjs';
import { esc } from './preferencias.mjs';

export function pintarIndices() {
  const T = textos();
  const hechos = leerHechos();
  for (const indice of document.querySelectorAll('[data-indice]')) {
    const items = [...indice.querySelectorAll('[data-item]')];
    const aqui = items.find((li) => !hechos.includes(li.dataset.item)) ?? null;
    let n = 0;
    for (const li of items) {
      const hecho = hechos.includes(li.dataset.item);
      if (hecho) n += 1;
      li.classList.toggle('hecho', hecho);
      li.toggleAttribute('data-aqui', li === aqui);
      const marca = li.querySelector('[data-marca]');
      if (!marca) continue;
      if (hecho) marca.innerHTML = `${svgIcono('si', 'icono sino-icono')}<span class="solo-lector">${esc(T.capituloPagina.hecho)}</span>`;
      else if (li === aqui) marca.innerHTML = `${svgIcono('aqui')}<span>${esc(T.capituloPagina.dondeVoy)}</span>`;
      else marca.innerHTML = '';
    }
    const avance = indice.querySelector('[data-avance]');
    if (avance) avance.textContent = t(T.capituloPagina.avance, { n, t: items.length });
    const barra = indice.querySelector('[data-barra-avance]');
    if (barra) barra.style.setProperty('--avance', String(items.length ? n / items.length : 0));
    const seguir = indice.querySelector('[data-seguir]');
    if (seguir) {
      seguir.hidden = !aqui;
      if (aqui) {
        seguir.href = aqui.querySelector('a').href;
        seguir.querySelector('[data-seguir-texto]').textContent =
          `${n ? T.capituloPagina.seguir : T.capituloPagina.empezar}: ${aqui.querySelector('[data-titulo]').textContent}`;
      }
    }
  }
}

function pintarBotones() {
  const hechos = leerHechos();
  for (const b of document.querySelectorAll('[data-marcar]')) {
    const hecho = hechos.includes(b.dataset.marcar);
    b.setAttribute('aria-pressed', String(hecho));
    b.querySelector('[data-marcar-texto]').textContent = hecho ? b.dataset.textoHecho : b.dataset.textoMarcar;
  }
}

export function iniciarIndices() {
  for (const b of document.querySelectorAll('[data-marcar]')) {
    b.addEventListener('click', () => {
      marcarHecho(b.dataset.marcar, b.getAttribute('aria-pressed') !== 'true');
      pintarBotones();
      pintarIndices();
    });
  }
  pintarBotones();
  pintarIndices();
}
