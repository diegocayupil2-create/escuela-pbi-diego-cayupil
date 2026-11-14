// Markdown de los campos de las prácticas (YAML), con el mismo procesador y colores que las lecciones.
import { satteri } from '@astrojs/markdown-satteri';
import { SHIKI } from './shiki.mjs';

let renderizador;

/** Markdown a HTML en bloque. */
export async function md(texto) {
  renderizador ??= await satteri().createRenderer({ syntaxHighlight: 'shiki', shikiConfig: SHIKI });
  return (await renderizador.render(texto)).code;
}

/** Markdown a HTML en una línea (sin el <p> de afuera), para listas y títulos. */
export async function mdLinea(texto) {
  const html = (await md(texto)).trim();
  const m = html.match(/^<p>([\s\S]*)<\/p>$/);
  return m && !m[1].includes('<p>') ? m[1] : html;
}
