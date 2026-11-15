// Preguntas con alternativas: el mismo HTML en las lecciones, el capítulo y el repaso.
const LETRAS = 'ABCDEF';
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Una pregunta: enunciado, alternativas A, B, C… y la explicación, oculta hasta responder. */
export function htmlPregunta({ tipo = '', enunciado, opciones, correcta, explicacion }) {
  const botones = opciones
    .map(
      (o, i) =>
        `<button type="button" class="opcion" data-i="${i}"><span class="opcion-letra">${LETRAS[i]}</span><span class="opcion-texto">${esc(o)}</span><span class="opcion-marca" aria-hidden="true"></span></button>`,
    )
    .join('');
  return `<div class="pregunta" data-pregunta data-correcta="${correcta}">${
    tipo ? `<p class="pregunta-tipo">${esc(tipo)}</p>` : ''
  }<p class="pregunta-enunciado">${esc(enunciado)}</p><div class="opciones" role="group" aria-label="${esc(enunciado)}">${botones}</div><div class="pregunta-explicacion" data-explicacion aria-live="polite" hidden><p class="pregunta-veredicto" data-veredicto></p><p>${esc(explicacion)}</p></div></div>`;
}
