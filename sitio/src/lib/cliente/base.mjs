// Comportamiento común de todas las páginas: tema claro u oscuro, idioma recordado y modo sin conexión.
import { leer, guardar } from './preferencias.mjs';

const raiz = document.documentElement;
const sistemaOscuro = matchMedia('(prefers-color-scheme: dark)');
const CICLO = ['sistema', 'claro', 'oscuro'];

function aplicarTema() {
  const preferido = leer('tema', 'sistema');
  const oscuro = preferido === 'oscuro' || (preferido === 'sistema' && sistemaOscuro.matches);
  raiz.dataset.tema = oscuro ? 'oscuro' : 'claro';
  raiz.dataset.temaPreferido = preferido;
  const fondo = getComputedStyle(raiz).getPropertyValue('--fondo').trim();
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) meta.setAttribute('content', fondo);
  const boton = document.querySelector('[data-boton-tema]');
  if (boton) {
    const texto = boton.dataset[`texto${preferido[0].toUpperCase()}${preferido.slice(1)}`];
    boton.setAttribute('aria-label', texto);
    boton.title = texto;
  }
}

aplicarTema();
sistemaOscuro.addEventListener('change', aplicarTema);
document.querySelector('[data-boton-tema]')?.addEventListener('click', () => {
  const actual = leer('tema', 'sistema');
  guardar('tema', CICLO[(CICLO.indexOf(actual) + 1) % CICLO.length]);
  aplicarTema();
});

// El idioma de la página que miras queda como el de inicio de la app.
guardar('idioma', raiz.lang);

// Sin conexión: solo en el sitio publicado, nunca en el servidor local.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const base = import.meta.env.BASE_URL;
  addEventListener('load', () => navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {}));
}
