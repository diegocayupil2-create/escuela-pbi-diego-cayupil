# Escuela PBI Diego Cayupil

Escuela diaria de Power BI y storytelling. Cada día trae el siguiente paso de una ruta por capítulos, lo más valorado de la comunidad y una mejora pequeña del propio sitio. Todo corre gratis en GitHub y Firebase, y la IA sale de la suscripción de Claude del dueño.

> **Estado: fase 1 de 9.** Ya están el contenido, las reglas y las pruebas; el sitio llega en la fase 2.

## Qué hay aquí

| Carpeta | Para qué |
|---|---|
| `contenido/` | Currículo, capítulos, fuentes, libros, retos y listas de exclusión (YAML y Markdown) |
| `datos/datasets/` | Datasets chicos con semilla fija para las prácticas |
| `esquemas/` | Reglas de formato del contenido |
| `scripts/` | Generador de datasets y verificador de fuentes (Python) |
| `tests/` | Pruebas: `npm test` |
| `.claude/` | Comandos y subagentes de Claude Code |
| `docs/` | Propuesta aprobada |
| `trabajos/` | Tus PBIP. **No se sube nunca** |

## Instalar (una vez)

1. Node 22 o más nuevo y Python 3.11 o más nuevo.
2. En esta carpeta: `npm install` y `pip install -r requirements.txt`.
3. El MCP de Power BI (`.mcp.json`) se descarga solo con `npx` la primera vez que lo uses, y su licencia (EULA) la aceptas tú. Si ya lo tienes en la app de escritorio, no hace falta aprobar este.

## Uso diario (por ahora)

- Abre Claude Code en esta carpeta y escribe `/hoy`.
- Guarda tus trabajos como PBIP en `trabajos\<práctica>\`: File → Save as → Power BI project (*.pbip).
- Para corregir un trabajo: `/entregar c10-p01`.
- Antes de cada commit: `npm test`.

## Pruebas

`npm test` revisa:
- el formato de todo el contenido;
- que cada capítulo tenga fuentes válidas;
- que no aparezca nada excluido;
- que no haya claves de pago ni correos personales;
- que `trabajos/` esté fuera de Git;
- que el dataset se regenere idéntico.

`npm run verificar-fuentes` revisa en internet los links, feeds y canales. Solo lee páginas públicas.

`npm run dataset` regenera el dataset de práctica (sale siempre igual).

## Qué no se sube nunca

- `trabajos/` (tus PBIP), `.env`, las llaves de Firebase y los tokens.
- Tu progreso, tus puntajes y tus notas: desde la fase 3 viven en Firebase, con reglas que solo te dejan entrar a ti.

## Pendiente por fase

Los horarios, cómo cambiarlos y cómo pausar la automatización se documentan aquí en la fase 4. La instalación en el celular llega en la fase 2.
