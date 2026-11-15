// Repaso con tarjetas: una a la vez, se dan vuelta al tocarlas y se responde ✓ me acordaba o ✕ no me acordaba.
// Las respuestas viven solo en esta sesión; el repaso espaciado (FSRS) llega con la fase 3.
import { armarMazo, fechaChile } from '../hoy.mjs';
import { siguienteCapitulo } from '../ruta.mjs';
import { t } from '../textos.mjs';
import { preferencias, leerDatos } from './estado.mjs';

export function iniciarRepaso() {
  const datos = leerDatos('datos-repaso');
  const T = datos.textos.repaso;
  const raiz = document.querySelector('[data-repaso]');
  const $ = (s) => raiz.querySelector(s);
  const carta = $('[data-carta]');
  const respuestas = $('[data-respuestas]');
  const anuncio = $('[data-anuncio]');
  let cola = [];
  let total = 0;
  let si = 0;
  let fallidas = [];

  const mostrar = () => {
    carta.classList.remove('volteada');
    respuestas.hidden = true;
    const id = cola[0];
    const fin = !id;
    $('[data-mazo]').hidden = fin;
    $('[data-fin]').hidden = !fin || total === 0;
    $('[data-vacio]').hidden = total !== 0;
    if (fin) {
      $('[data-cuenta-si]').textContent = String(si);
      $('[data-cuenta-no]').textContent = String(fallidas.length);
      $('[data-repetir]').hidden = !fallidas.length;
      return;
    }
    const x = datos.tarjetas[id];
    $('[data-tipo]').textContent = datos.textos.tipoTarjeta[x.tipo];
    $('[data-frente]').textContent = x.frente;
    $('[data-reverso]').textContent = x.reverso;
    const hechas = total - cola.length;
    $('[data-progreso]').textContent = t(T.progreso, { i: hechas + 1, n: total });
    $('[data-barra]').style.setProperty('--avance', String(hechas / total));
  };

  const empezar = (ids) => {
    cola = [...ids];
    total = cola.length;
    si = 0;
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

  carta.addEventListener('click', (e) => {
    const volteada = carta.classList.toggle('volteada');
    respuestas.hidden = !volteada;
    anuncio.textContent = volteada ? `${T.respuesta}: ${$('[data-reverso]').textContent}` : '';
    if (volteada && e.detail === 0) $('[data-si]').focus({ preventScroll: true });
  });
  const responder = (meAcorde) => {
    const id = cola.shift();
    if (meAcorde) si += 1;
    else fallidas.push(id);
    mostrar();
    carta.focus({ preventScroll: true });
  };
  $('[data-si]').addEventListener('click', () => responder(true));
  $('[data-no]').addEventListener('click', () => responder(false));
  $('[data-repetir]').addEventListener('click', () => empezar(fallidas));
  $('[data-otra-vez]').addEventListener('click', cargarMazo);
  for (const r of raiz.querySelectorAll('input[name="mazo"]')) r.addEventListener('change', cargarMazo);
  cargarMazo();
  raiz.dataset.listo = '';
}
