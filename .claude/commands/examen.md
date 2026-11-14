---
description: Toma el cierre de un capítulo (preguntas y práctica final)
argument-hint: "<capítulo, por ejemplo c10>"
---
Toma el cierre del capítulo $ARGUMENTS con su `cierre.yaml` en `contenido/capitulos/$ARGUMENTS-*/`.

1. Haz las preguntas de a una, en español, sin mostrar la respuesta antes de que Diego conteste. Acepta la letra o el texto.
2. Después de cada respuesta: si es correcta o no, y la explicación en una o dos líneas.
3. Al final: puntaje en %, si aprobó (`aprobar_con`) y qué repasar. Si hay `practica_final`, recuérdale entregarla con `/entregar`.
4. Las preguntas falladas se vuelven tarjetas de repaso propuestas.

Desde la fase 3 el resultado se guarda en Firestore; antes, solo se muestra.
