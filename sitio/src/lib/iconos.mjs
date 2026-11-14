// Íconos de línea propios (24 × 24, color del texto). Los usan las páginas y el navegador.
export const ICONOS = {
  marca: '<rect x="3" y="3" width="18" height="18" rx="4.5"/><path d="M8 16.5v-4M12 16.5v-9M16 16.5V10"/>',
  hoy: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  mapa: '<circle cx="6" cy="18.5" r="2.5"/><circle cx="18" cy="5.5" r="2.5"/><path d="M8.5 18.5H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/>',
  leccion: '<path d="M3 5.5A1.5 1.5 0 0 1 4.5 4H10a2 2 0 0 1 2 2v13.5a2 2 0 0 0-2-2H4.5A1.5 1.5 0 0 1 3 16z"/><path d="M21 5.5A1.5 1.5 0 0 0 19.5 4H14a2 2 0 0 0-2 2v13.5a2 2 0 0 1 2-2h5.5A1.5 1.5 0 0 0 21 16z"/>',
  practica: '<path d="M3.5 20.5h17"/><rect x="5" y="11" width="3.2" height="6.5" rx="1"/><rect x="10.4" y="7" width="3.2" height="10.5" rx="1"/><rect x="15.8" y="3.5" width="3.2" height="14" rx="1"/>',
  repaso: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3.5V8h4.5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20.5V16h-4.5"/>',
  radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 6.4-6.4"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
  tema: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>',
  si: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  no: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  candado: '<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  objetivo: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
  escalera: '<path d="M3 20.5h5v-5h5v-5h5v-5h3"/>',
  brujula: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  atras: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  disponible: '<circle cx="12" cy="12" r="8.5"/><path d="m10.2 8.6 5 3.4-5 3.4z" fill="currentColor"/>',
  ubicar: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.3"/><circle cx="12" cy="16.8" r=".7" fill="currentColor"/>',
  opcional: '<circle cx="12" cy="12" r="8.5" stroke-dasharray="3.2 3"/>',
  aqui: '<path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.3"/>',
  reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  dataset: '<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/>',
  alerta: '<path d="M12 3.5 21 19.5H3z"/><path d="M12 10v4.2M12 16.9v.3"/>',
  sinConexion: '<path d="M2.5 8.8a14 14 0 0 1 19 0M5.5 12a9.5 9.5 0 0 1 13 0M8.6 15.2a5 5 0 0 1 6.8 0"/><circle cx="12" cy="18.6" r="1" fill="currentColor"/><path d="M3 3l18 18"/>',
};

// Ícono de cada estado de capítulo.
export const ICONO_ESTADO = {
  dominado: 'si',
  convalidado: 'si',
  disponible: 'disponible',
  bloqueado: 'candado',
  'por-ubicar': 'ubicar',
  opcional: 'opcional',
};

/** SVG como texto, para armar HTML en el navegador. */
export function svgIcono(nombre, clase = 'icono') {
  return `<svg class="${clase}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONOS[nombre] ?? ''}</svg>`;
}
