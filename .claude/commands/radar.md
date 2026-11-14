---
description: Muestra lo más nuevo y valorado del radar, con la razón de cada puesto
argument-hint: "[hoy | semana | mes]"
---
Muestra el radar de $ARGUMENTS (por defecto, «hoy») desde `datos/radar/`.

- Hoy: top 3. Semana: top 10. Mes: lo más valorado del mes.
- Cada ítem en una línea: título, fuente y nivel (A, B o C), fecha, puntaje y su razón (novedad + autoridad + popularidad + relevancia).
- Nunca muestres nada de `contenido/excluidos.yaml`.
- Si un ítem vale la pena, ofrece convertirlo en micro-lección, ejercicio o tarjeta con el subagente `profesor`.

Antes de la fase 4 no hay datos: dilo en una línea y ofrece revisar a mano las fuentes de `contenido/fuentes.yaml` con el subagente `curador`.
