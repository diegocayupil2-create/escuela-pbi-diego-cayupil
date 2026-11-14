// Reglas de formato del contenido de la escuela. Las usan las pruebas y, desde la fase 2, el sitio.
import { z } from 'zod';

const texto = z.string().trim().min(1);
const fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'usa una fecha AAAA-MM-DD entre comillas');
const fechaONula = fecha.nullable();
const urlHttps = z
  .string()
  .url()
  .refine((u) => u.startsWith('https://'), 'el link debe usar https');
const idCapitulo = z.string().regex(/^c\d{2}$/);

export const bilingue = z.object({ es: texto, en: texto }).strict();
export const nivelFuente = z.enum(['A', 'B', 'C']);
export const estadoFuncion = z.enum(['ga', 'preview', 'mixto', 'no-aplica']);

export const citaFuente = z
  .object({
    titulo: texto,
    url: urlHttps.optional(),
    libro: z.string().optional(),
    nivel: nivelFuente,
    consultado: fecha,
  })
  .strict()
  .refine((f) => Boolean(f.url || f.libro), 'cada fuente necesita url o libro');

export const competencia = z
  .object({ id: z.string().regex(/^c\d{2}-k\d+$/), es: texto, en: texto })
  .strict();

export const capitulo = z
  .object({
    id: idCapitulo,
    nivel: z.number().int().min(0).max(4),
    area: z.enum([
      'nivelacion', 'modelado', 'dax', 'datos', 'reportes', 'diseno',
      'storytelling', 'negocio', 'rendimiento', 'ingenieria', 'vanguardia',
    ]),
    titulo: bilingue,
    resumen: bilingue,
    requiere: z.array(idCapitulo),
    opcional: z.boolean().optional(),
    estado: estadoFuncion,
    nota_estado: bilingue.optional(),
    competencias: z.array(competencia),
    fuentes: z.array(citaFuente),
    carpeta: z.string().regex(/^c\d{2}-[a-z0-9-]+$/).optional(),
  })
  .strict();

export const curriculo = z
  .object({
    version: z.number().int().positive(),
    actualizado: fecha,
    dominio: z
      .object({
        practicas_min: z.number().int().positive(),
        puntaje_min: z.number().int().min(0).max(100),
        repasos_min: z.number().int().min(0),
      })
      .strict(),
    niveles: z.array(z.object({ id: z.number().int().min(0).max(4), nombre: bilingue }).strict()).length(5),
    capitulos: z.array(capitulo).min(1),
  })
  .strict();

export const leccion = z
  .object({
    id: z.string().regex(/^c\d{2}-l\d{2}$/),
    capitulo: idCapitulo,
    idioma: z.enum(['es', 'en']),
    titulo: texto,
    minutos: z.number().int().min(1).max(5),
    estado: estadoFuncion,
    desde: z.string().nullable(),
    fuentes: z.array(citaFuente).min(1),
    tarjetas: z.array(z.string().regex(/^c\d{2}-t\d{2}$/)),
  })
  .strict();

const listaBilingue = z
  .object({ es: z.array(texto).min(1), en: z.array(texto).min(1) })
  .strict()
  .refine((l) => l.es.length === l.en.length, 'los pasos deben tener el mismo largo en los dos idiomas');

export const practica = z
  .object({
    id: z.string().regex(/^c\d{2}-p\d{2}$/),
    capitulo: idCapitulo,
    minutos: z.number().int().min(10).max(60),
    tipo_pregunta: z.enum([
      'diagnostico', 'priorizacion', 'metas', 'cohortes', 'precio-margen', 'pronostico', 'campanas', 'calidad',
    ]),
    dataset: z.string().regex(/^datos\/datasets\/[a-z0-9-]+$/),
    respuestas: z.string().regex(/^c\d{2}-p\d{2}$/),
    titulo: bilingue,
    objetivo: bilingue,
    por_que_importa: bilingue,
    contexto: bilingue,
    pasos: listaBilingue,
    criterios_exito: z.array(bilingue).min(2),
    pistas: z.array(bilingue).min(2),
    solucion: bilingue,
    storytelling: bilingue,
    fuentes: z.array(citaFuente).min(1),
  })
  .strict();

export const tarjetas = z
  .object({
    capitulo: idCapitulo,
    tarjetas: z
      .array(
        z
          .object({
            id: z.string().regex(/^c\d{2}-t\d{2}$/),
            tipo: z.enum(['concepto', 'dax', 'diseno', 'storytelling', 'error']),
            frente: bilingue,
            reverso: bilingue,
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export const cierre = z
  .object({
    capitulo: idCapitulo,
    aprobar_con: z.number().int().min(0).max(100),
    practica_final: z.string().regex(/^c\d{2}-p\d{2}$/).optional(),
    preguntas: z
      .array(
        z
          .object({
            id: z.string().regex(/^c\d{2}-q\d{2}$/),
            enunciado: bilingue,
            opciones: z.array(bilingue).min(2).max(5),
            correcta: z.number().int().min(0),
            explicacion: bilingue,
          })
          .strict()
          .refine((p) => p.correcta < p.opciones.length, 'la opción correcta no existe'),
      )
      .min(3),
  })
  .strict();

export const catalogoFuentes = z
  .object({
    version: z.number().int().positive(),
    verificado: fecha,
    fuentes: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9-]+$/),
            nombre: texto,
            nivel: nivelFuente,
            tipo: z.enum([
              'documentacion', 'novedades', 'blog', 'newsletter', 'youtube', 'podcast',
              'herramienta', 'comunidad', 'persona', 'pagina', 'hashtag',
            ]),
            url: urlHttps.nullable(),
            feed: urlHttps.nullable().optional(),
            youtube: z
              .object({
                handle: z.string().regex(/^@[\w.-]+$/),
                channel_id: z.string().regex(/^UC[\w-]{22}$/).nullable(),
              })
              .strict()
              .nullable()
              .optional(),
            github: z.string().regex(/^[\w.-]+\/[\w.-]+$/).nullable().optional(),
            radar: z.boolean(),
            estado: z.enum(['activa', 'bloqueada', 'candidata', 'propuesta']),
            idioma: z.enum(['es', 'en', 'pt', 'varios']),
            notas: z.string().optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export const biblioteca = z
  .object({
    version: z.number().int().positive(),
    libros: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9-]+$/),
            titulo: texto,
            autores: z.array(texto).min(1),
            tema: z.enum(['dax-modelado', 'storytelling', 'diseno']),
            edicion_vigente: texto,
            anio: z.number().int().min(1900).max(2100),
            editorial: texto,
            espanol: z
              .object({
                existe: z.boolean(),
                titulo: z.string().nullable(),
                anio: z.number().int().nullable(),
                editorial: z.string().nullable(),
              })
              .strict(),
            gratis_en_linea: urlHttps.nullable(),
            verificado: fecha,
            fuente_verificacion: texto,
            notas: z.string().optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export const retos = z
  .object({
    version: z.number().int().positive(),
    verificado: fecha,
    retos: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9-]+$/),
            nombre: texto,
            organiza: texto,
            frecuencia: z.enum(['anual', 'mensual', 'semanal', 'eventual']),
            url: urlHttps,
            hashtag: z.string().nullable(),
            estado: z.enum(['activo', 'pausado', 'por-verificar']),
            proximas: z.array(
              z
                .object({
                  nombre: texto,
                  abre: fechaONula,
                  cierra: fechaONula,
                  resultados: fechaONula,
                  nota: z.string().optional(),
                })
                .strict(),
            ),
            verificado: fecha,
            notas: z.string().optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export const excluidos = z
  .object({
    version: z.number().int().positive(),
    dominios: z.array(z.string().regex(/^[a-z0-9.-]+$/)).min(1),
    palabras: z.array(z.string().min(2)).min(1),
    notas: z.record(z.string(), z.string()),
  })
  .strict();

export const deprecados = z
  .object({
    version: z.number().int().positive(),
    verificado: fecha,
    deprecados: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9-]+$/),
            nombre: texto,
            estado: z.enum(['retirado', 'se-retira']),
            fecha: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/),
            reemplazo: z.string().nullable(),
            fuente: urlHttps,
            palabras_clave: z.array(texto).min(1),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();
