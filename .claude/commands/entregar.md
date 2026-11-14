---
description: Corrige un trabajo PBIP con la rúbrica de la escuela
argument-hint: "<id de práctica, por ejemplo c10-p01>"
---
Corrige la entrega de la práctica $ARGUMENTS con el subagente `evaluador`.

1. Lee la práctica en `contenido/capitulos/*/practicas/$ARGUMENTS.yaml` y sus respuestas esperadas en el `respuestas.json` de su dataset.
2. Busca el PBIP en `trabajos/$ARGUMENTS/`. Debe estar guardado como Power BI project (*.pbip), con el modelo en TMDL (`*.SemanticModel/definition/`) y el reporte en PBIR (`*.Report/definition/`). Si falta, explica cómo guardarlo (File → Save as → Power BI project) y detente.
3. Revisa el modelo en TMDL: relaciones y dirección del filtro, tabla calendario marcada, Auto date/time apagado, medidas explícitas con formato, claves ocultas y descripciones. Inspírate en las reglas BPA de Tabular Editor.
4. Revisa el reporte en PBIR: títulos que concluyen, texto alternativo, cantidad de visuales por página y colores del tema.
5. Si Power BI Desktop está abierto y responde el MCP de Power BI, ejecuta consultas DAX para comprobar los números contra `respuestas.json`. Si no, dilo y corrige solo con los archivos.
6. Puntúa con la rúbrica: pregunta de negocio 20 · modelo 15 · DAX 20 · diseño visual 15 · narrativa 20 · rigor 10. Devuelve el puntaje por criterio, 3 mejoras concretas y una versión de referencia (el DAX o el cambio exacto). Feedback honesto, sin felicitaciones vacías.
7. Convierte cada error en una tarjeta de repaso propuesta.
8. Guarda la evaluación en `trabajos/$ARGUMENTS/evaluacion.md`, que es privada porque Git ignora `trabajos/`. Desde la fase 6 también se guarda en Firestore para verla en la web.

Nunca subas nada de `trabajos/` al repo ni copies puntajes a commits, issues o PR.
