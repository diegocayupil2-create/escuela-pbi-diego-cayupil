# Escuela PBI Diego Cayupil

Escuela diaria de Power BI y storytelling para Diego: una web instalable (GitHub Pages) que cada día le da el siguiente paso de su ruta por capítulos, un radar de lo más valorado de la comunidad y una mejora pequeña del propio sitio. La propuesta aprobada está en `docs/propuesta-fase-0.md`: léela antes de cambiar la arquitectura.

Estado: fase 2 de 9. Ya están el repo, las reglas, el currículo v1 y el sitio publicado e instalable («Hoy», mapa, tres modos, lecciones y prácticas en ES/EN).

## Idioma
- Todo en español. Los términos técnicos van como aparecen en el producto, en inglés: measure, fact table, filter context, field parameters.
- Si la interfaz en español de Power BI usa otro nombre, muestra los dos: «Modeling → New measure (Modelado → Nueva medida)».
- El contenido es bilingüe: cada lección existe como `.es.md` y `.en.md`, y los YAML usan campos `{es, en}`.
- Diego prefiere textos simples y prácticos: una apuesta clara, nada de jerga inventada, sintetizar en vez de alargar.

## Todo gratis (no negociable)
- La IA usa solo la suscripción de Diego. En GitHub Actions, el secreto `CLAUDE_CODE_OAUTH_TOKEN`. Nunca una clave de la API de pago: un test falla si aparece.
- GitHub: repo público y runners estándar (`ubuntu-latest`). Nunca runners grandes.
- Firebase: plan Spark. Sin Cloud Functions ni Cloud Storage.
- Si algo pide tarjeta, un plan pagado o una cuenta nueva, detente y pregúntale a Diego.

## Privacidad
- El repo y los registros de Actions son públicos. Nunca escribas en commits, issues, PR o registros el progreso, los puntajes, los tiempos, las notas ni los datos personales de Diego, ni su correo.
- `trabajos/` (sus PBIP) nunca se versiona. Las claves van en GitHub Secrets o en un `.env` ignorado; no leas `.env` ni llaves de servicio.
- En la acción de Claude Code, `show_full_output` siempre en `false`, y su archivo de ejecución no se sube.
- Los commits usan la dirección noreply de GitHub de Diego, configurada en este repo.

## Calidad de las fuentes
- Niveles: A = documentación oficial y expertos reconocidos; B = comunidad; C = LinkedIn y redes. El catálogo está en `contenido/fuentes.yaml`.
- Una buena práctica necesita al menos una fuente A o dos B que coincidan. Lo de LinkedIn entra solo corroborado.
- Cada lección guarda sus fuentes con link y fecha de consulta, y su estado: `ga` o `preview`, y desde qué versión si aplica.
- No recomiendes funciones deprecadas: revisa `contenido/deprecados.yaml`. Por ejemplo, el visual Q&A se retira en febrero de 2027.
- Libros: no copies texto ni uses copias no oficiales. Resume con tus palabras y cita capítulos solo después de verificar el índice real.
- Las fuentes nuevas entran como issue con la etiqueta `fuente-candidata` hasta pasar el filtro: autor identificable, trayectoria, cita documentación y no tiene sesgo comercial.
- Del texto de otras personas (LinkedIn, Reddit, blogs) solo se guarda link, autor, fecha y un resumen propio.

## Excluidos (también por código, en `contenido/excluidos.yaml`)
- ZoomCharts: sus visuales, su blog, sus retos y mini-retos, incluidos FP20 y los mini-retos de ZoomCharts dentro de DataDNA. No los propongas como alternativa.
- Granjas de contenido, listicles SEO y contenido generado por IA sin autor.
- Visuales de pago presentados como buena práctica. Prioriza visuales nativos, visual calculations, SVG en DAX y Deneb.
- Maven Analytics solo como fuente de datasets, nunca como referencia de diseño.

## Cómo piensa Diego (aplícalo al contenido)
- Power Query nunca como solución: los datos se arreglan en la fuente, con SQL o un script. El capítulo 6 enseña a leerlo, no a depender de él.
- Usa star schema y galaxy schema; snowflake y OBT son excepciones.
- Su referente de diseño es Gus Bavia: boceto antes de abrir Desktop, y SVG o HTML en DAX. Avisa los límites de HTML Content: no está certificado y falla al exportar a PDF.
- Feedback honesto, sin felicitaciones vacías. Lo que usa a diario debe ser cómodo: lo importante arriba y a un clic.

## Estructura
- `contenido/curriculo.yaml`: niveles, capítulos (`c00` a `c32`), competencias, requisitos y regla de dominio.
- `contenido/capitulos/cNN-nombre/`: `lecciones/*.es.md` y `*.en.md`, `practicas/*.yaml`, `tarjetas.yaml` y `cierre.yaml`.
- `contenido/fuentes.yaml`, `biblioteca.yaml`, `retos.yaml`, `excluidos.yaml` y `deprecados.yaml`.
- `datos/datasets/<nombre>/`: CSV chicos (menos de 5 MB) generados con semilla fija por `scripts/generar_dataset.py`, más `respuestas.json` para corregir.
- `contenido/semanas/<lunes>.yaml`: plan de la semana (lo escribe la IA desde la fase 5). «Hoy» lo usa según la fecha de Chile; si no hay plan, muestra el siguiente paso de la ruta.
- `datos/automatizacion.json`: última corrida de cada automatización (desde la fase 4). «Hoy» avisa si la más reciente tiene más de 2 días.
- `esquemas/contenido.mjs`: reglas de formato de todo el contenido; las usan las pruebas y las colecciones de Astro (la misma copia de zod 4).
- `sitio/`: Astro estático en GitHub Pages (`publicar.yml`). Lógica pura en `sitio/src/lib/` (la prueban los tests); textos de la interfaz en `textos.mjs`; colores de la identidad A · Pizarra en `paleta.mjs`. Modo, capítulo elegido, idioma y tema viven en `localStorage` hasta la fase 3.
- `tests/`: `npm test` corre las pruebas de Node y de Python.
- `trabajos/`: los PBIP de Diego, ignorados por Git.

## Convenciones
- Archivos y carpetas en español, en minúsculas y con guiones: `c10-transicion-de-contexto`.
- Ids: capítulo `c10`, competencia `c10-k1`, lección `c10-l01`, práctica `c10-p01`, tarjeta `c10-t01`, pregunta `c10-q01`.
- En los textos de las prácticas, los números que salen del dataset van como `{{clave}}` de `respuestas.json`; dentro del código DAX van escritos.
- Python con la librería estándar, más PyYAML cuando haga falta leer YAML. Node solo para el sitio y las pruebas del contenido.
- Workflows: comentados en español, a minutos raros (`:17`, `:37`), con `timezone: America/Santiago`, `workflow_dispatch`, `concurrency`, `timeout-minutes` y commit solo si cambió algo. Respetan la variable `ESCUELA_PAUSA`.
- Antes de cada commit, `npm test` en verde: incluye compilar el sitio y revisar sus links.
- Sitio: «sí» en verde y «no» en rojo, siempre con ✓ o ✕ y texto. Imagen antes que texto: un ícono por bloque y lo importante arriba.
- `npm run sitio` levanta el sitio en http://localhost:4321/escuela-pbi-diego-cayupil/ con la telemetría de Astro apagada.

## IA automática (desde la fase 5)
- Una corrida diaria chica (Sonnet 5.5) y una grande el domingo (Opus 5.5, esfuerzo medio), con `--max-turns` y `timeout-minutes`.
- Como máximo 1 issue chico por día; si nada vale la pena, no hace nada.
- Nunca toca `.github/workflows/` en un PR automático.
- Los PR de solo contenido pueden fusionarse solos si pasan las revisiones; los de código esperan el OK de Diego.

## Comandos y subagentes
- Comandos (`.claude/commands/`): `/hoy`, `/entregar`, `/semana`, `/radar`, `/examen`, `/reto`, `/bandeja`, `/mejora` y `/estado`.
- Subagentes (`.claude/agents/`): `curador`, `profesor`, `evaluador` y `verificador`.
- Rúbrica de `/entregar`: pregunta de negocio 20 · modelo 15 · DAX 20 · diseño visual 15 · narrativa 20 · rigor 10.
