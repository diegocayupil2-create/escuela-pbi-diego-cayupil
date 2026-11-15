// Responder una pregunta con alternativas: ✓ en verde la correcta, ✕ en rojo si elegiste otra, y la explicación.
import { svgIcono } from '../iconos.mjs';
import { t } from '../textos.mjs';
import { textos } from './estado.mjs';

/** Marca la respuesta elegida. Devuelve true si estaba bien, o null si ya se había respondido. */
export function marcarRespuesta(pregunta, elegida, T) {
  if (pregunta.dataset.respondida) return null;
  const correcta = Number(pregunta.dataset.correcta);
  const bien = elegida === correcta;
  pregunta.dataset.respondida = bien ? 'si' : 'no';
  for (const b of pregunta.querySelectorAll('.opcion')) {
    const i = Number(b.dataset.i);
    b.disabled = true;
    if (i === correcta) {
      b.classList.add('opcion-si');
      b.querySelector('.opcion-marca').innerHTML = svgIcono('si', 'icono sino-icono');
    } else if (i === elegida) {
      b.classList.add('opcion-no');
      b.querySelector('.opcion-marca').innerHTML = svgIcono('no', 'icono sino-icono');
    }
    if (i === elegida) b.setAttribute('aria-pressed', 'true');
  }
  const veredicto = pregunta.querySelector('[data-veredicto]');
  veredicto.className = `pregunta-veredicto sino ${bien ? 'si' : 'no'}`;
  veredicto.innerHTML = `${svgIcono(bien ? 'si' : 'no', 'icono sino-icono')}<span>${bien ? T.pregunta.correcta : T.pregunta.incorrecta}</span>`;
  pregunta.querySelector('[data-explicacion]').hidden = false;
  return bien;
}

export function reiniciarPregunta(pregunta) {
  delete pregunta.dataset.respondida;
  for (const b of pregunta.querySelectorAll('.opcion')) {
    b.disabled = false;
    b.classList.remove('opcion-si', 'opcion-no');
    b.removeAttribute('aria-pressed');
    b.querySelector('.opcion-marca').innerHTML = '';
  }
  pregunta.querySelector('[data-explicacion]').hidden = true;
}

/** Activa los cuestionarios de la página (en una lección o en el capítulo) y cuenta las correctas. */
export function iniciarPreguntas() {
  const T = textos();
  for (const grupo of document.querySelectorAll('[data-cuestionario]')) {
    const preguntas = [...grupo.querySelectorAll('[data-pregunta]')];
    const resultado = grupo.querySelector('[data-resultado]');
    const actualizar = () => {
      if (!resultado) return;
      const respondidas = preguntas.filter((p) => p.dataset.respondida);
      resultado.hidden = respondidas.length < preguntas.length;
      const bien = respondidas.filter((p) => p.dataset.respondida === 'si').length;
      resultado.querySelector('[data-resultado-texto]').textContent = t(T.pregunta.resultado, { n: bien, t: preguntas.length });
    };
    for (const p of preguntas) {
      for (const b of p.querySelectorAll('.opcion')) {
        b.addEventListener('click', () => {
          marcarRespuesta(p, Number(b.dataset.i), T);
          actualizar();
        });
      }
    }
    grupo.querySelector('[data-otra-vez]')?.addEventListener('click', () => {
      preguntas.forEach(reiniciarPregunta);
      actualizar();
      preguntas[0]?.querySelector('.opcion')?.focus();
    });
  }
}
