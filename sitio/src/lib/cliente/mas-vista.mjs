// «Más»: modo de avance y tema. Se guardan en este dispositivo hasta la fase 3.
import { leer, guardar } from './preferencias.mjs';
import { modoValido } from '../ruta.mjs';
import { elegirTema } from './base.mjs';

export function iniciarMas() {
  const modos = [...document.querySelectorAll('input[name="modo"]')];
  const modo = modoValido(leer('modo'));
  for (const r of modos) {
    r.checked = r.value === modo;
    r.addEventListener('change', () => guardar('modo', r.value));
  }
  for (const r of document.querySelectorAll('input[name="tema"]')) {
    r.checked = r.value === leer('tema', 'sistema');
    r.addEventListener('change', () => elegirTema(r.value));
  }
}
