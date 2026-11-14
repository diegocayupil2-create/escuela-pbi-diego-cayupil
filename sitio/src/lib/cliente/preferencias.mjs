// Preferencias en este dispositivo (localStorage) hasta que llegue Firebase en la fase 3:
// modo de avance, capítulo elegido, idioma y tema. Nada de esto sale del celular o del PC.
const PREFIJO = 'escuela.';

export function leer(clave, porDefecto = null) {
  try {
    return localStorage.getItem(PREFIJO + clave) ?? porDefecto;
  } catch {
    return porDefecto;
  }
}

export function guardar(clave, valor) {
  try {
    if (valor == null) localStorage.removeItem(PREFIJO + clave);
    else localStorage.setItem(PREFIJO + clave, valor);
  } catch {
    // Navegación privada o almacenamiento lleno: la app sigue funcionando con los valores por defecto.
  }
}

/** Escapa texto para armar HTML. */
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
