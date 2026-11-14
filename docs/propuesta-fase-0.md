# Escuela PBI Diego Cayupil · Propuesta de la fase 0

14 de noviembre de 2026 · Para aprobar antes de escribir código.

## En una frase

Una web que se instala en tu celular y cada mañana te deja el siguiente paso de tu ruta de Power BI, con lo más valorado de la comunidad y un profesor que corrige tus archivos reales. Funciona sola en GitHub, aunque tu PC esté apagado, y no cuesta nada fuera de tu suscripción.

Es como Duolingo, pero de Power BI: una dosis corta cada día, repaso de lo que se te olvida y capítulos que puedes saltar.

## 1. Lo que tomé de Me tinca y lo que cambio

Me tinca se leyó solo en lectura; no se modificó nada.

| En Me tinca | En la escuela |
|---|---|
| Los datos se actualizan solos con GitHub Actions; tu PC no participa | Igual: búsquedas, IA y publicación corren en GitHub |
| Workflows explicados en español, a minutos raros (`:17`, `:37`), con botón «Run workflow» y commit solo si cambió algo | Igual |
| Scripts en Python con solo la librería estándar; LEEME en español; «Qué no se sube nunca» | Igual |
| Firebase con reglas estrictas y respaldo automático de lo que no se puede regenerar | Igual, pero el respaldo va a un repo privado aparte |
| Repo privado | **Repo público**: nada personal en el repo ni en los registros de Actions, que también son públicos |
| Reglas de Firebase por correo | Reglas por tu UID, así tu correo no queda escrito en el repo |
| Firebase Hosting | GitHub Pages: se publica desde el mismo repo, sin llave de servicio |
| Un `index.html` de 4.690 líneas, sin build | Astro, un generador estático (ver abajo) |
| Morado, naranjo y rosado | Grises y un solo color de acento (dos opciones al final) |

**Por qué Astro y no un solo `index.html`:**
1. La escuela tendrá cientos de lecciones en Markdown y en dos idiomas. Astro las convierte en páginas al publicar y revisa su formato: si a una lección le falta su fuente, la publicación falla.
2. Cada ficha del portafolio tiene su propia página, con vista previa al compartirla en LinkedIn. Con un solo `index.html` eso no se puede.
3. El resultado sigue siendo HTML estático y gratis en GitHub Pages. Lo interactivo (login, progreso, repaso) es JavaScript simple, como en Me tinca.

## 2. Arquitectura

```
GitHub · repo público diegocayupil2-create/escuela-pbi-diego-cayupil
├─ contenido/   capítulos (YAML), lecciones (Markdown es/en), prácticas, semana, retos, fuentes, biblioteca
├─ datos/       radar (lo escriben las búsquedas) y datasets chicos generados con semilla fija
├─ sitio/       Astro → GitHub Pages (se instala en el celular)
└─ .github/workflows/   búsquedas · IA · publicación · revisiones · vigía · respaldo

Firebase · plan Spark, gratis y privado
├─ Auth: solo tu cuenta de Google
└─ Firestore: progreso, entregas y notas, tarjetas de repaso, bandeja, ajustes y consumo

Tu PC · solo cuando tú quieras
└─ Power BI Desktop + Claude Code en la carpeta del repo:
   /hoy  /entregar  /semana  /radar  /examen  /reto  /bandeja  /mejora  /estado
```

- **Carpeta local:** `Desktop\Claude\escuela-pbi-diego-cayupil`. Tus PBIP van en `trabajos\`, dentro de esa carpeta pero fuera del repo público: Git los ignora y un test falla si alguno se cuela.
- **«Hoy» no depende de la corrida del día.** El domingo se genera la semana completa y la web elige la tarea según la fecha de Chile. Si una corrida falla, «Hoy» igual te muestra tu siguiente paso, y avisa si la automatización lleva más de 2 días detenida.
- **Configuración web de Firebase:** queda en el repo. Google la diseñó para ser pública; lo que protege tus datos son las reglas.

### Pipelines

| # | Qué hace | Cuándo (hora de Chile) | IA |
|---|---|---|---|
| 1 | Búsquedas: lee feeds y APIs gratis, guarda solo lo nuevo y le pone puntaje | 05:40 · 13:10 · 20:10 | No |
| 2 | Curaduría diaria: top 3 del radar con su razón, micro-lección, LinkedIn por búsqueda web y, como máximo, 1 mejora chica en un PR | 06:05 | Sí, chica |
| 3 | Plan de la semana: 7 tareas, top 10, ejercicios y dataset, 3 issues de mejora y reporte de consumo | domingo 09:10 | Sí, grande |
| 4 | Publicación en GitHub Pages | cuando cambia algo | No |
| 5 | Revisiones de cada PR: build, tests, links rotos, accesibilidad y Lighthouse | en cada PR | No |
| 6 | Vigía: horarios activos, sin claves de pago y consumo de la semana | domingo 21:10 | No |
| 7 | Respaldo de Firestore a un repo privado tuyo, que no tiene workflows y por eso no gasta minutos | domingo 22:10 | No |

- **Horarios:** GitHub ya acepta zona horaria en los horarios (`timezone: America/Santiago`), así que el cambio de hora se aplica solo. El horario de verano partió el sábado 5-sep-2026 y el de invierno vuelve el sábado 3-abr-2027 (Decreto 98). Todo queda listo antes de las 07:00 todo el año, con margen para los atrasos de GitHub, que son mayores en la hora en punto; por eso uso minutos raros.
- **Las 3 búsquedas son sin IA.** La IA pasa una vez al día, como dice el encargo. Si después quieres que también corra 3 veces, es un cambio de una línea.
- **Pausar todo:** una variable del repo, `ESCUELA_PAUSA = 1`, en Settings → Secrets and variables → Actions → Variables. No hay que editar archivos.
- **Que no se apague:** en repos públicos, GitHub desactiva los horarios después de 60 días sin actividad. Con commits diarios no pasa; igual, el vigía lo revisa cada domingo y, si algo se apagó, lo reactiva y te avisa con un issue.

## 3. La IA: recomiendo la opción (c)

| | (a) Tu PC + Programador de tareas | (b) Tareas programadas en la nube (claude.ai/code/routines) | (c) GitHub Action de Claude Code con tu suscripción |
|---|---|---|---|
| ¿Independiente de tu PC? | No: descartada | Sí | Sí |
| ¿Usa tu suscripción sin cobro aparte? | Sí | Sí | Sí: «runs use your Claude subscription instead of API billing» |
| Estado | Estable | Vista previa: «behavior, limits, and the API surface may change» | Estable (v1) y documentada para Pro, Max y Ultra |
| Cambios en el repo | Directos | Solo en ramas `claude/…`: cada actualización sería un PR | Commit directo para contenido; PR para código |
| Internet | Completo | Limitado por defecto: hay que abrir cada dominio | Completo |
| Claves (Firebase y otras) | En tu PC | Variables visibles o «network secrets» | GitHub Secrets |
| Medir consumo | Fácil | Difícil | Cada corrida deja un archivo con los tokens usados |

**Por qué (c):** está documentada para tu plan, corre donde ya están el repo y los horarios, usa minutos gratis (repo público) y deja medir el consumo.

**Contras y cómo los manejo:**
- El token de tu suscripción dura un año. Lo generas tú con `claude setup-token` y lo pegas tú en GitHub Secrets; yo nunca lo veo. Nunca se imprime y lo puedes revocar o renovar cuando quieras.
- La app de Claude para GitHub pide permisos amplios: se instala solo en este repo.
- Los registros de Actions son públicos. La acción no muestra la conversación por defecto (`show_full_output: false`), no subimos su archivo de registro y ningún issue ni commit lleva tus notas, puntajes o tiempos.
- Si llegas a tu límite semanal, la corrida falla y espera. Con el uso extra apagado, no hay cobro.
- Si (c) deja de servir, la opción (b) queda como respaldo.

**Consumo estimado** (Sonnet 5.5 de lunes a sábado; Opus 5.5 con esfuerzo medio el domingo; tope de turnos y de minutos en cada corrida):
- Corrida diaria: entre 0,1 % y 0,2 % de tu límite semanal si estás en Max.
- Domingo: entre 0,5 % y 1 %.
- Semana completa: entre 1 % y 3 %.
- En Pro, todo se multiplica por 5: entre 5 % y 15 % de la semana.

Es una estimación gruesa, hecha con el consumo medido de una sesión de trabajo anterior y con Max = 5× Pro. En la fase 5 la mido de verdad: cada corrida guarda sus tokens y el domingo la bitácora muestra el total. La primera semana anotas el % que ves en Settings → Usage, para calibrar.

## 4. Todo gratis: dónde se asegura

| Servicio | Plan | Lo que lo asegura |
|---|---|---|
| Claude | Tu suscripción | Solo el token de tu suscripción. Nunca `ANTHROPIC_API_KEY`: un test falla si aparece en el repo o en los workflows. «Uso extra» apagado en claude.ai → Settings → Usage |
| GitHub | Gratis | Repo público: Pages y Actions con runners estándar no cobran y no descuentan los minutos de tus repos privados. Nada de runners grandes, que sí se cobran en repos públicos |
| Firebase | Spark, sin tarjeta | Auth, Firestore (1 GiB, 50.000 lecturas, 20.000 escrituras y 20.000 borrados al día) y Cloud Messaging sin costo. Cloud Functions y Cloud Storage no están en Spark para proyectos nuevos: no los uso |
| YouTube | Sin clave | Feed RSS público de cada canal; la API oficial solo si hace falta (cuota gratis) |
| Reddit | Fuera de las búsquedas | Desde nov-2025 su API pide aprobación y, según fuentes secundarias, está cerrando el JSON y el RSS públicos. Entra por tu bandeja o por la búsqueda web de la IA |
| LinkedIn | Sin scraping ni login | Búsqueda web pública en la corrida de IA y lo que compartas desde el celular |

Si algún paso pidiera tarjeta o un plan pagado, me detengo y te aviso antes.

## 5. Currículo por capítulos

**Tres formas de avanzar** (cambias cuando quieras en Configuración):
- **Desde la nivelación (recomendada):** una prueba de unos 35 minutos te ubica por área. Lo que ya dominas queda «convalidado» y la ruta parte donde te falta.
- **Desde cero:** del capítulo 1 en adelante.
- **Libre:** todo abierto; la ruta recomendada queda visible como guía.

**Cada capítulo trae** el objetivo y por qué importa en el negocio, de 3 a 6 micro-lecciones de 5 minutos con su fuente, 2 o 3 prácticas en Power BI de 20 a 40 minutos, tarjetas de repaso y un cierre. Toda práctica termina con un titular en una frase y 3 puntos ejecutivos.

**Capítulo dominado** (ajustable): 3 prácticas con 80 puntos o más (una puede ser el cierre) y 2 repasos espaciados exitosos.

**La nivelación (capítulo 0):** 24 preguntas que se adaptan a tus respuestas (modelado, DAX, diseño, storytelling, rendimiento e ingeniería) y un ejercicio corto con dataset: armar el modelo estrella, encontrar el problema de calidad plantado, escribir 3 medidas y un gráfico con un título que concluye. El ejercicio lo corrige `/entregar`.

### Árbol v1: 32 capítulos

| Nivel | N.º | Capítulo | Requiere |
|---|---|---|---|
| 1 · Fundamentos | 1 | Modelo estrella: fact tables, dimensions y grain | — |
| | 2 | Relaciones y dirección del filtro | 1 |
| | 3 | Tabla calendario, sin Auto date/time | 2 |
| | 4 | Medidas vs columnas calculadas | 1 |
| | 5 | CALCULATE básico | 4 |
| | 6 | Preparar datos en la fuente: SQL primero; Power Query solo para leerlo | — |
| | 7 | Elegir el gráfico correcto | — |
| | 8 | Títulos que concluyen y la gran idea | 7 |
| 2 · Intermedio | 9 | Contexto de fila y de filtro | 5 |
| | 10 | Transición de contexto | 9 |
| | 11 | Iteradores y variables | 9 |
| | 12 | ALL, ALLSELECTED, REMOVEFILTERS y KEEPFILTERS | 10 |
| | 13 | Inteligencia de tiempo | 3, 12 |
| | 14 | Relaciones inactivas y role-playing dimensions | 2, 13 |
| | 15 | Navegación, tooltips y drill-through | 8 |
| | 16 | Field parameters y temas JSON | 15 |
| | 17 | Accesibilidad | 15 |
| | 18 | SCQA y anotaciones | 8 |
| | 19 | Color con intención y variaciones al estilo IBCS | 18 |
| | 20 | KPIs por área de negocio (incluye tu dashboard de progreso con el CSV) | 13, 18 |
| 3 · Avanzado | 21 | Calculation groups | 13 |
| | 22 | Funciones de ventana y visual calculations | 12 |
| | 23 | UDF de DAX, granularidad y totales correctos | 11, 21 |
| | 24 | Rendimiento: DAX Studio, VertiPaq Analyzer, cardinalidad y modos de almacenamiento | 12 |
| | 25 | Ingeniería: PBIP + Git, TMDL y reglas BPA | 4 |
| | 26 | RLS (row-level security) | 25 |
| | 27 | Diseño: grilla y boceto, SVG en DAX, Deneb y el estilo de Gus Bavia (HTML Content, con sus límites) | 16, 19 |
| | 28 | Resumen ejecutivo y presentación a gerencia | 19 |
| 4 · Vanguardia | 29 | Agentes y MCP en Power BI: Claude Code + PBIP + el MCP de Power BI | 25 |
| | 30 | Modelos semánticos listos para IA (descriptions, synonyms) y Copilot | 25 |
| | 31 | Novedades del mes (capítulo vivo) | — |
| | 32 | Competir: Mundial, Onyx DataDNA, Workout Wednesday y Makeover Monday | 27, 28 |

- **En la fase 1 verifico cada función** con Microsoft Learn: si está disponible en general o en vista previa, y desde qué versión. No entra nada deprecado.
- **Power Query:** tengo anotado que no te gusta y que prefieres arreglar en la fuente. Por eso el capítulo 6 enseña la regla de Matthew Roche (transformar tan arriba como se pueda y tan abajo como haga falta), con SQL primero. Power Query queda solo para leerlo, porque aparece en entrevistas. Si lo quieres fuera del todo, se saca.
- **Maven:** queda solo como fuente de datasets, como dice tu encargo; nunca como referencia de diseño.
- **ZoomCharts y FP20:** excluidos por código. Un test falla si aparecen en el radar.

### Rutina

- «Hoy» tiene 4 bloques: micro-lección (5 min), práctica (de 20 a 40 min), repaso (5 min) y top 3 del radar. Tú decides cuánto haces: si un día no entras, nada se acumula y la racha no te castiga.
- Semana tipo (configurable): lunes DAX y modelado · martes storytelling · miércoles rendimiento · jueves caso de negocio · viernes novedad de la semana · sábado reto o portafolio · domingo repaso y retro. El día decide el tipo de práctica; el capítulo en que vas decide el contenido.

## 6. Español e inglés

Lo interpreté así: botón ES/EN en toda la escuela, cada lección en los dos idiomas (la IA escribe ambas en la misma corrida) y cada menú de Power BI con los dos nombres, por ejemplo «Modeling → New measure (Modelado → Nueva medida)». Corrígeme si querías otra cosa.

## 7. Tus trabajos en PBIP y `/entregar`

- **Cómo guardar:** File → Save as → Power BI project (*.pbip), en `trabajos\<capítulo>-<práctica>\`. Desde la versión de septiembre de 2026, PBIR (el reporte en archivos JSON) es el formato por defecto. Tu proyecto MTD-QTD-YTD ya está en TMDL y PBIR, así que tu Power BI Desktop los maneja. En la fase 1 confirmo si TMDL sale por defecto en tu versión o hay que activarlo.
- **Cuidados que pide Microsoft:** rutas cortas (Windows corta en 260 caracteres), nunca dentro de OneDrive y archivos en UTF-8 sin BOM.
- **`/entregar`** corre en tu PC cuando tú entregas. Lee el TMDL y el PBIR, aplica chequeos inspirados en las reglas BPA de Tabular Editor y en revisiones del JSON del reporte, ejecuta consultas DAX con el MCP de Power BI si tienes Desktop abierto y guarda la evaluación en Firestore para que la veas en la web.
- **Rúbrica:** pregunta de negocio 20 · modelo 15 · DAX 20 · diseño visual 15 · narrativa 20 · rigor 10. Devuelve el puntaje por criterio, 3 mejoras concretas y una versión de referencia. Lo que falles se vuelve tarjetas de repaso y práctica dirigida.
- **Portafolio:** con tu OK, una ficha pública con captura, problema, enfoque y resultado.

## 8. Radar

- **Puntaje de 0 a 100:** novedad (hasta 30; baja con los días) + autoridad de la fuente (A 30 · B 18 · C 8) + popularidad (hasta 25, comparada dentro de la misma fuente) + relevancia para tu capítulo actual o el siguiente (hasta 15).
- **Cada ítem muestra su razón,** por ejemplo: «SQLBI (A) · hace 1 día · 3.100 vistas en 24 h · calza con el capítulo 10».
- **Fuentes automáticas v1,** sin claves ni scraping: «What's new» de Microsoft Learn; RSS de SQLBI, Chris Webb, Data Goblins, Tabular Editor, PowerBI.tips, Storytelling with Data y Nightingale; RSS de YouTube (Guy in a Cube, SQLBI y Curbal); y releases de GitHub (Tabular Editor, DAX Studio, Bravo y Deneb). Cada feed se verifica en la fase 1. El blog de Power BI y la comunidad de Fabric ya rechazaron lectores automáticos en otra sesión; si desde GitHub también fallan, entran por la búsqueda web de la IA.
- **LinkedIn:** se guardan el link, el autor, la fecha, las reacciones visibles y un resumen propio. El texto completo va solo a tu Firestore.
- **Bandeja:** compartir desde el celular (la app aparece en «Compartir» de Android), un formulario para pegar un link y, de respaldo, un issue de GitHub (ojo: un issue es público).
- **Ritmo:** top 3 en «Hoy», top 10 cada domingo y lo más valorado del mes.

## 9. Mejora diaria del sitio

- Backlog en GitHub Issues con las etiquetas contenido, mejora-ui, bug, idea y fuente-candidata.
- La corrida diaria toma como máximo 1 issue chico y abre un PR con descripción y captura. Si nada vale la pena, no hace nada.
- Los PR de solo contenido que pasan las revisiones se fusionan solos (configurable). Los de código esperan tu OK desde la app de GitHub.
- El domingo, con tus datos de uso, crea 3 issues de mejora sin escribir tus datos en ellos.
- La bitácora se arma con los PR fusionados e incluye el consumo semanal de IA y de Actions.

## 10. Fases

| Fase | Qué queda listo | Demo |
|---|---|---|
| 1 | Repo, CLAUDE.md, comandos, subagentes, fuentes verificadas, árbol v1 en YAML y tests (formato, excluidos, sin claves de pago) | Tests en verde y un capítulo completo de ejemplo en los dos idiomas |
| 2 | Sitio en GitHub Pages, instalable: «Hoy», mapa de capítulos, los tres modos, ES/EN e identidad elegida | La app instalada en tu celular |
| 3 | Firebase: login, progreso, marcar tareas, repaso espaciado y **nivelación** (adelantada desde la fase 8, porque pediste partir por ella) | Haces la nivelación y ves tu ruta |
| 4 | Búsquedas 3 veces al día, radar con puntaje y razón, y vigía | El radar del día con sus razones |
| 5 | IA en GitHub Actions con tu suscripción: curaduría diaria, plan del domingo, ejercicios y datasets, y medición del consumo | Una semana generada y su consumo |
| 6 | `/entregar` con rúbrica sobre un PBIP real, evaluación en la web y la parte práctica de la nivelación | Un PBIP tuyo corregido |
| 7 | Mejora diaria, bitácora y bandeja | Un PR de mejora y un link compartido desde el celular |
| 8 | Una semana real de prueba contigo, y ajustes | Tu primera semana completa |
| 9 | Opcional: recordatorio push (Cloud Messaging, enviado desde Actions) | Una notificación en tu celular |

Al cerrar cada fase: tests en verde, commit claro, demo corta y espero tu OK. Antes del primer push te pido el OK, porque el repo es público.

**Lo que haces tú** (por seguridad, yo no creo cuentas ni manejo claves):
- Fase 1: crear el repo en github.com, o instalar la herramienta `gh` para que lo cree yo.
- Fase 3: crear el proyecto de Firebase en plan Spark (sin tarjeta) y, para el respaldo, un repo privado con su token.
- Fase 5: generar el token de Claude con `claude setup-token`, pegarlo en GitHub Secrets e instalar la app de Claude solo en este repo.

## 11. Identidad visual

Dos opciones con grises y un solo acento (vista previa en el chat). En las dos, «sí» es verde y «no» es rojo, siempre con ✓ o ✕ y con texto, porque esos dos colores se confunden con daltonismo.

| | A · Pizarra (recomendada) | B · Petróleo |
|---|---|---|
| Carácter | Fría, técnica y calma | Cálida y editorial |
| Acento (claro / oscuro) | #1F5FD6 / #6E9EFF | #007C89 / #4FC3CF |
| Gris de contexto (claro / oscuro) | #8A95A3 / #6B7685 | #958F84 / #77736B |
| Prueba de color, acento vs gris | Pasa con margen amplio en claro y en oscuro | Pasa, pero en modo claro el acento resalta menos sobre el gris |

Las dos se distinguen de Me tinca (morado, naranjo y rosado) y evitan el negro con rosado.

## 12. Verificado hoy (14-nov-2026)

- GitHub Actions es gratis en repos públicos con runners estándar y no descuenta minutos de tus repos privados ([docs.github.com](https://docs.github.com/en/billing/concepts/product-billing/github-actions)).
- Horarios: aceptan zona horaria IANA, mínimo cada 5 minutos, se atrasan al inicio de cada hora y en repos públicos se apagan tras 60 días sin actividad ([docs.github.com](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)).
- Claude Code GitHub Action: `CLAUDE_CODE_OAUTH_TOKEN` para Pro, Max y Ultra; con ese token se usa la suscripción y no la facturación de API ([code.claude.com](https://code.claude.com/docs/en/github-actions)).
- Términos: el login con suscripción es para el uso normal de Claude Code y de las apps de Anthropic, y los límites asumen uso individual ([code.claude.com](https://code.claude.com/docs/en/legal-and-compliance)).
- Tareas en la nube: vista previa, ramas `claude/`, red limitada por defecto y consumo de la suscripción ([code.claude.com](https://code.claude.com/docs/en/routines)).
- `show_full_output` viene en `false` y advierte que los registros son públicos ([action.yml](https://github.com/anthropics/claude-code-action/blob/main/action.yml)).
- PBIP, TMDL y PBIR; PBIR por defecto desde septiembre de 2026 ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/projects/projects-report)).
- Firebase Spark ([firebase.google.com/pricing](https://firebase.google.com/pricing)).
- Cambio de hora en Chile 2026–2027, Decreto 98 ([T13](https://www.t13.cl/noticia/nacional/comienza-horario-verano-2026-chile-revisa-hora-oficial-tras-cambio-5-9-2026), [Meganoticias](https://www.meganoticias.cl/dato-util/535192-cuando-sera-el-proximo-cambio-de-hora-en-chile-y-excepciones-ajuste-horario-2-11-2026.html)).
- Reddit: aprobación obligatoria desde nov-2025 y cierre del JSON y del RSS públicos según fuentes secundarias ([r/redditdev](https://www.reddit.com/r/redditdev/comments/1oug31u/introducing_the_responsible_builder_policy_new/), [apiserpent.com](https://apiserpent.com/blog/free-reddit-api)).
- Uso extra de Claude: se apaga en Settings → Usage ([support.claude.com](https://support.claude.com/en/articles/12429409-manage-extra-usage-for-paid-claude-plans)).

## 13. Lo que necesito de ti

1. Tu OK a esta propuesta, para partir la fase 1.
2. La identidad, A o B. Puedes decidirla hasta la fase 2; si no eliges, voy con A.
