---
description: Toma un issue chico y lo implementa en una rama con su PR
argument-hint: "[número de issue opcional]"
---
Mejora diaria del sitio (desde la fase 7).

1. Elige como máximo 1 issue chico abierto, con las etiquetas contenido, mejora-ui, bug o idea. Si nada vale la pena, dilo y no hagas nada.
2. Crea una rama `mejora/<número>-<tema>`, implementa, corre `npm test` y abre un PR con descripción, captura y el issue enlazado.
3. Los PR de solo contenido pueden fusionarse solos si pasan las revisiones; los de código esperan el OK de Diego.
4. Nunca toques `.github/workflows/` en un PR automático.

Si todavía no existe el repo en GitHub o no está la herramienta `gh`, explica qué falta y detente.
