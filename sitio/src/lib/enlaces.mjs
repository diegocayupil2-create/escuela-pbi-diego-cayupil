// Rutas del sitio en cada idioma. Las páginas y el botón ES/EN salen de aquí.
export const IDIOMAS = ['es', 'en'];
export const REPO = 'https://github.com/diegocayupil2-create/escuela-pbi-diego-cayupil';

const SEGMENTO = {
  mapa: { es: 'mapa', en: 'map' },
  capitulos: { es: 'capitulos', en: 'chapters' },
  lecciones: { es: 'lecciones', en: 'lessons' },
  practicas: { es: 'practicas', en: 'practice' },
};

/** Ruta sin la base del sitio, siempre terminada en «/». tipo: hoy | mapa | capitulo | leccion | practica */
export function rutaRelativa(lang, tipo, { cap, id } = {}) {
  if (!IDIOMAS.includes(lang)) throw new Error(`idioma desconocido: ${lang}`);
  const s = (nombre) => SEGMENTO[nombre][lang];
  switch (tipo) {
    case 'hoy':
      return `${lang}/`;
    case 'mapa':
      return `${lang}/${s('mapa')}/`;
    case 'capitulo':
      return `${lang}/${s('capitulos')}/${cap}/`;
    case 'leccion':
      return `${lang}/${s('capitulos')}/${cap}/${s('lecciones')}/${id}/`;
    case 'practica':
      return `${lang}/${s('capitulos')}/${cap}/${s('practicas')}/${id}/`;
    default:
      throw new Error(`tipo de página desconocido: ${tipo}`);
  }
}

/** El otro idioma, para el botón ES/EN. */
export const otroIdioma = (lang) => (lang === 'es' ? 'en' : 'es');
