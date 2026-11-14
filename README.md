# Escuela PBI Diego Cayupil

Escuela diaria de Power BI y storytelling. Cada día trae el siguiente paso de una ruta por capítulos, lo más valorado de la comunidad y una mejora pequeña del propio sitio. Todo corre gratis en GitHub y Firebase, y la IA sale de la suscripción de Claude del dueño.

> **Estado: fase 2 de 9.** El sitio ya está publicado y se instala en el celular: «Hoy», mapa de capítulos, los tres modos, lecciones y prácticas en español e inglés.

**Sitio:** https://diegocayupil2-create.github.io/escuela-pbi-diego-cayupil/

## Qué hay aquí

| Carpeta | Para qué |
|---|---|
| `sitio/` | La web (Astro): «Hoy», mapa, capítulos, lecciones y prácticas |
| `contenido/` | Currículo, capítulos, fuentes, libros, retos, listas de exclusión y planes de la semana (YAML y Markdown) |
| `datos/datasets/` | Datasets chicos con semilla fija para las prácticas |
| `esquemas/` | Reglas de formato del contenido (las usan las pruebas y el sitio) |
| `scripts/` | Generador de datasets, verificador de fuentes y el comando del sitio |
| `tests/` | Pruebas: `npm test` |
| `.github/workflows/` | Revisiones de cada cambio y publicación del sitio |
| `.claude/` | Comandos y subagentes de Claude Code |
| `docs/` | Propuesta aprobada |
| `trabajos/` | Tus PBIP. **No se sube nunca** |

## Instalar en el celular

**Android (Chrome)**
1. Abre el sitio en Chrome.
2. Menú ⋮ → **Instalar app** (o **Agregar a la pantalla principal**).
3. Confirma. Queda como app, con su ícono, y abre sin la barra del navegador.

**iPhone (Safari)**
1. Abre el sitio en Safari.
2. Botón **Compartir** → **Agregar a inicio**.
3. Confirma con **Agregar**.

Lo que ya abriste queda guardado para verlo sin conexión. Tus preferencias (modo, capítulo, idioma y tema) se guardan en el celular hasta que llegue tu cuenta en la fase 3.

## Instalar en el PC (una vez)

1. Node 22.23 o más nuevo y Python 3.11 o más nuevo.
2. En esta carpeta: `npm install` y `pip install -r requirements.txt`.
3. El MCP de Power BI (`.mcp.json`) se descarga solo con `npx` la primera vez que lo uses, y su licencia (EULA) la aceptas tú. Si ya lo tienes en la app de escritorio, no hace falta aprobar este.

## Uso diario (por ahora)

- Abre la app en el celular: «Hoy» te muestra la micro-lección, la práctica, el repaso y el radar.
- Para elegir por dónde vas: en el **Mapa**, elige el modo y luego, dentro de un capítulo, **Elegir como mi capítulo**.
- En el PC, abre Claude Code en esta carpeta y escribe `/hoy`.
- Guarda tus trabajos como PBIP en `trabajos\<práctica>\`: File → Save as → Power BI project (*.pbip).
- Para corregir un trabajo: `/entregar c10-p01`.
- Antes de cada commit: `npm test`.

## Ver el sitio en tu PC

`npm run sitio` y abre http://localhost:4321/escuela-pbi-diego-cayupil/. Los cambios en `sitio/` y en el contenido se ven al guardar.

## Pruebas

`npm test` revisa:
- el formato de todo el contenido, incluidos los planes de la semana;
- que cada capítulo tenga fuentes válidas;
- que no aparezca nada excluido;
- que no haya claves de pago ni correos personales;
- que `trabajos/` esté fuera de Git;
- que el dataset se regenere idéntico;
- la lógica del sitio: la fecha de Chile, la ruta en cada modo, el aviso de automatización detenida, los números con separador de miles y el contraste de los colores;
- que el sitio compile, con todas sus páginas en los dos idiomas y sin links rotos.

`npm run verificar-fuentes` revisa en internet los links, feeds y canales. Solo lee páginas públicas.

`npm run dataset` regenera el dataset de práctica (sale siempre igual).

## Publicación

El workflow **Publicar** compila el sitio y lo sube a GitHub Pages cada vez que cambia algo en `sitio/`, `contenido/` o `datos/`. También corre a mano: pestaña Actions → Publicar → Run workflow. No usa IA ni claves.

## Qué no se sube nunca

- `trabajos/` (tus PBIP), `.env`, las llaves de Firebase y los tokens.
- Tu progreso, tus puntajes y tus notas: desde la fase 3 viven en Firebase, con reglas que solo te dejan entrar a ti.

## Pendiente por fase

Los horarios, cómo cambiarlos y cómo pausar la automatización se documentan aquí en la fase 4. Tu cuenta, el progreso y la nivelación llegan en la fase 3.
