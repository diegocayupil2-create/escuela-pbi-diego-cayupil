// Números del dataset dentro de los textos: {{clave}} → valor de respuestas.json.
const LOCALE = { es: 'es-CL', en: 'en-US' };

/** Número con separador de miles: 20.000.000 y 74,4 en español; 20,000,000 y 74.4 en inglés. */
export function formatoNumero(valor, lang) {
  return new Intl.NumberFormat(LOCALE[lang], { useGrouping: 'always', maximumFractionDigits: 2 }).format(valor);
}

/** Reemplaza cada {{clave}} por su valor. Una clave que falta es un error: el sitio no se publica a medias. */
export function reemplazarClaves(texto, valores, lang) {
  return texto.replace(/\{\{([a-z0-9_]+)\}\}/g, (_, clave) => {
    if (!(clave in valores)) throw new Error(`falta {{${clave}}} en respuestas.json`);
    const v = valores[clave];
    if (typeof v === 'number') return formatoNumero(v, lang);
    if (typeof v === 'string') return v;
    throw new Error(`{{${clave}}} no es un número ni un texto`);
  });
}
