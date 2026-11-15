// Repaso: una pregunta a la vez, con alternativas. Al responder se ve ✓ o ✕ con la explicación, y al final
// cuántas estuvieron bien, con la opción de repetir las que fallaste. Las respuestas se guardan desde la fase 3.
import { armarMazo, fechaChile } from '../hoy.mjs';
import { siguienteCapitulo } from '../ruta.mjs';
import { t } from '../textos.mjs';
import { htmlPregunta } from '../preguntas.mjs';
import { preferencias, leerDatos } from './estado.mjs';
import { marcarRespuesta } from './preguntas-vista.mjs';

export function iniciarRepaso() {
  const datos = leerDatos('datos-repaso');
  const T = datos.textos;
  const raiz = document.querySelector('[data-repaso]');
  const $ = (s) => raiz.querySelector(s);
  const contenedor = $('[data-pregunta-actual]');
  const siguiente = $('[data-siguiente]');
  let cola = [];
  let total = 0;
  let bien = 0;
  let fallidas = [];

  const mostrar = () => {
    siguiente.hidden = true;
    const id = cola[0];
    const fin = !id;
    $('[data-mazo]').hidden = fin;
    $('[data-fin]').hidden = !fin || total === 0;
    $('[data-vacio]').hidden = total !== 0;
    if (fin) {
      $('[data-cuenta-si]').textContent = String(bien);
      $('[data-cuenta-no]').textContent = String(fallidas.length);
      $('[data-repetir]').hidden = !fallidas.length;
      return;
    }
    const x = datos.tarjetas[id];
    contenedor.innerHTML = htmlPregunta({
      tipo: T.tipoTarjeta[x.tipo], enunciado: x.frente, opciones: x.opciones, correcta: x.correcta, explicacion: x.reverso,
    });
    const pregunta = contenedor.querySelector('[data-pregunta]');
    for (const b of pregunta.querySelectorAll('.opcion')) {
      b.addEventListener('click', () => {
        const ok = marcarRespuesta(pregunta, Number(b.dataset.i), T);
        if (ok === null) return;
        if (ok) bien += 1;
        else fallidas.push(id);
        siguiente.hidden = false;
        siguiente.focus({ preventScroll: true });
      });
    }
    const hechas = total - cola.length;
    $('[data-progreso]').textContent = t(T.repaso.progreso, { i: hechas + 1, n: total });
    $('[data-barra]').style.setProperty('--avance', String(hechas / total));
  };

  const empezar = (ids) => {
    cola = [...ids];
    total = cola.length;
    bien = 0;
    fallidas = [];
    mostrar();
  };

  const cargarMazo = () => {
    const tipo = raiz.querySelector('input[name="mazo"]:checked')?.value ?? 'hoy';
    const { modo, elegido } = preferencias();
    const capitulo = siguienteCapitulo(datos.capitulos, { modo, elegido })?.id ?? null;
    const { ids, respaldo } = armarMazo({ capitulos: datos.capitulos, capitulo, fecha: fechaChile(), tipo });
    $('[data-respaldo]').hidden = !respaldo;
    empezar(ids);
  };

  siguiente.addEventListener('click', () => {
    cola.shift();
    mostrar();
    contenedor.querySelector('.opcion')?.focus({ preventScroll: true });
  });
  $('[data-repetir]').addEventListener('click', () => empezar(fallidas));
  $('[data-otra-vez]').addEventListener('click', cargarMazo);
  for (const r of raiz.querySelectorAll('input[name="mazo"]')) r.addEventListener('change', cargarMazo);
  cargarMazo();
  raiz.dataset.listo = '';
}
