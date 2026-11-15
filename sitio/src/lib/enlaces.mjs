// Rutas del sitio en cada idioma. Las páginas, la navegación y el botón ES/EN salen de aquí.
export const IDIOMAS = ['es', 'en'];
export const REPO = 'https://github.com/diegocayupil2-create/escuela-pbi-diego-cayupil';

const SEGMENTO = {
  temario: { es: 'temario', en: 'syllabus' },
  repaso: { es: 'repaso', en: 'review' },
  radar: { es: 'radar', en: 'radar' },
  mas: { es: 'mas', en: 'more' },
  glosario: { es: 'glosario', en: 'glossary' },
  capitulos: { es: 'capitulos', en: 'chapters' },
  lecciones: { es: 'lecciones', en: 'lessons' },
  practicas: { es: 'practicas', en: 'practice' },
  ficha: { es: 'ficha', en: 'summary' },
  mapa: { es: 'mapa', en: 'map' }, // la primera versión del temario; hoy solo redirige
};

// Las cinco secciones de la navegación fija, en orden.
export const SECCIONES = ['hoy', 'temario', 'repaso', 'radar', 'mas'];

/** Ruta sin la base del sitio, siempre terminada en «/». */
export function rutaRelativa(lang, tipo, { cap, id } = {}) {
  if (!IDIOMAS.includes(lang)) throw new Error(`idioma desconocido: ${lang}`);
  const s = (nombre) => SEGMENTO[nombre][lang];
  switch (tipo) {
    case 'hoy':
      return `${lang}/`;
    case 'temario':
    case 'repaso':
    case 'radar':
    case 'mas':
    case 'glosario':
    case 'mapa':
      return `${lang}/${s(tipo)}/`;
    case 'capitulo':
      return `${lang}/${s('capitulos')}/${cap}/`;
    case 'leccion':
      return `${lang}/${s('capitulos')}/${cap}/${s('lecciones')}/${id}/`;
    case 'practica':
      return `${lang}/${s('capitulos')}/${cap}/${s('practicas')}/${id}/`;
    case 'ficha':
      return `${lang}/${s('capitulos')}/${cap}/${s('ficha')}/`;
    default:
      throw new Error(`tipo de página desconocido: ${tipo}`);
  }
}

/** El otro idioma, para el botón ES/EN. */
export const otroIdioma = (lang) => (lang === 'es' ? 'en' : 'es');
