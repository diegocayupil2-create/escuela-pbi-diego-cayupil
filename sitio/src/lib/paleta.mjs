// Identidad A · Pizarra: grises fríos y un solo acento azul (propuesta, sección 11).
// «Sí» en verde y «no» en rojo, siempre con ✓ o ✕ y texto: con daltonismo esos dos colores se confunden.
// Las pruebas revisan el contraste de cada par de colores (WCAG 2.2: 4,5 para texto y 3 para bordes e íconos).

export const PALETA = {
  claro: {
    fondo: '#F4F6F9',
    superficie: '#FFFFFF',
    superficie2: '#EBEFF4',
    borde: '#D3DAE3',
    texto: '#17202B',
    texto2: '#4B5665',
    contexto: '#8A95A3',
    acento: '#1F5FD6',
    acentoSuave: '#E5EDFB',
    sobreAcento: '#FFFFFF',
    si: '#17763F',
    siFondo: '#E5F3EA',
    no: '#BF2C2C',
    noFondo: '#FBEAEA',
  },
  oscuro: {
    fondo: '#0F141B',
    superficie: '#171E28',
    superficie2: '#1F2833',
    borde: '#2D3846',
    texto: '#E6EBF1',
    texto2: '#A7B2C0',
    contexto: '#6B7685',
    acento: '#6E9EFF',
    acentoSuave: '#1C2A45',
    sobreAcento: '#0F141B',
    si: '#4CC38A',
    siFondo: '#11301F',
    no: '#FF7F7F',
    noFondo: '#3A1719',
  },
};

// Pares que deben leerse bien: [primer plano, fondo, contraste mínimo].
export const PARES = [
  ['texto', 'fondo', 7], ['texto', 'superficie', 7], ['texto', 'superficie2', 7],
  ['texto2', 'fondo', 4.5], ['texto2', 'superficie', 4.5], ['texto2', 'superficie2', 4.5],
  ['acento', 'fondo', 4.5], ['acento', 'superficie', 4.5], ['acento', 'acentoSuave', 4.5],
  ['sobreAcento', 'acento', 4.5],
  ['si', 'superficie', 4.5], ['si', 'siFondo', 4.5],
  ['no', 'superficie', 4.5], ['no', 'noFondo', 4.5],
  ['contexto', 'superficie', 3], // el gris de contexto va solo sobre tarjetas
];

const canal = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminancia = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => canal(parseInt(hex.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Contraste WCAG entre dos colores #RRGGBB. */
export function contraste(a, b) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const nombreCss = (k) => `--${k.replace(/[A-Z0-9]/g, (m) => `-${m.toLowerCase()}`)}`;
const variables = (modo) =>
  Object.entries(PALETA[modo]).map(([k, v]) => `${nombreCss(k)}:${v}`).join(';');

/** CSS con las variables de color: claro por defecto, oscuro con data-tema o con la preferencia del sistema. */
export function cssPaleta() {
  return [
    `:root{color-scheme:light;${variables('claro')}}`,
    `:root[data-tema="oscuro"]{color-scheme:dark;${variables('oscuro')}}`,
    `@media (prefers-color-scheme:dark){:root:not([data-tema]){color-scheme:dark;${variables('oscuro')}}}`,
    // Al imprimir (la ficha del capítulo), siempre en claro.
    `@media print{:root,:root[data-tema="oscuro"]{color-scheme:light;${variables('claro')}}}`,
  ].join('\n');
}
