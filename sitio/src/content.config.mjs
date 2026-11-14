// Colecciones de contenido del sitio. Usan las mismas reglas que las pruebas (esquemas/contenido.mjs, zod 4,
// la misma copia que usa Astro): si una lección o práctica no cumple el formato, la publicación falla.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import * as E from '../../esquemas/contenido.mjs';

const CAPITULOS = '../contenido/capitulos';

// Un archivo que es una sola entrada (curriculo.yaml, automatizacion.json). Si no existe, la colección queda vacía.
function archivoUnico(ruta, id) {
  return {
    name: `archivo-${id}`,
    load: async ({ store, parseData, config, watcher }) => {
      const archivo = fileURLToPath(new URL(ruta, config.root));
      const cargar = async () => {
        store.clear();
        if (!existsSync(archivo)) return;
        const texto = await readFile(archivo, 'utf8');
        const crudo = archivo.endsWith('.json') ? JSON.parse(texto) : YAML.parse(texto);
        store.set({ id, data: await parseData({ id, data: crudo, filePath: archivo }) });
      };
      await cargar();
      watcher?.add(archivo);
      watcher?.on('all', async (_evento, cambiado) => {
        if (resolve(cambiado) === resolve(archivo)) await cargar();
      });
    },
  };
}

export const collections = {
  curriculo: defineCollection({ loader: archivoUnico('../contenido/curriculo.yaml', 'curriculo'), schema: E.curriculo }),
  lecciones: defineCollection({
    loader: glob({ pattern: '*/lecciones/*.md', base: CAPITULOS, generateId: ({ data }) => `${data.id}.${data.idioma}` }),
    schema: E.leccion,
  }),
  practicas: defineCollection({
    loader: glob({ pattern: '*/practicas/*.yaml', base: CAPITULOS, generateId: ({ data }) => String(data.id) }),
    schema: E.practica,
  }),
  tarjetas: defineCollection({
    loader: glob({ pattern: '*/tarjetas.yaml', base: CAPITULOS, generateId: ({ data }) => String(data.capitulo) }),
    schema: E.tarjetas,
  }),
  cierres: defineCollection({
    loader: glob({ pattern: '*/cierre.yaml', base: CAPITULOS, generateId: ({ data }) => String(data.capitulo) }),
    schema: E.cierre,
  }),
  respuestas: defineCollection({
    loader: glob({ pattern: '*/respuestas.json', base: '../datos/datasets', generateId: ({ entry }) => entry.split('/')[0] }),
    schema: E.respuestas,
  }),
  // Los planes de la semana (contenido/semanas/) se leen en src/lib/contenido.mjs con el mismo esquema:
  // así, mientras la carpeta esté vacía (hasta la fase 5), el registro de cada publicación queda limpio.
  automatizacion: defineCollection({ loader: archivoUnico('../datos/automatizacion.json', 'estado'), schema: E.automatizacion }),
};
