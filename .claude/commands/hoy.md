---
description: Te muestra la tarea de hoy y el siguiente paso de tu ruta
argument-hint: "[AAAA-MM-DD opcional]"
---
Muéstrale a Diego su día en la escuela, en español y en pocas líneas. Fecha: $ARGUMENTS. Si viene vacía, usa hoy en hora de Chile (America/Santiago).

1. Busca el plan de la semana en `contenido/semana/AAAA-Www.json` (semana ISO). Si existe, toma la entrada de esa fecha.
2. Si no hay plan (antes de la fase 5), arma el día tú:
   - Tema según el día: lunes DAX y modelado · martes storytelling · miércoles rendimiento · jueves caso de negocio · viernes novedad de la semana · sábado reto o portafolio · domingo repaso y retro.
   - Capítulo: pregúntale en cuál va si no lo sabes (desde la fase 3 el progreso vive en Firebase). Sugiere la siguiente lección y la siguiente práctica de ese capítulo en `contenido/capitulos/`.
3. Muestra 4 bloques, en este orden, cada uno en una línea con su tiempo:
   - Micro-lección (5 min): título y archivo.
   - Práctica (20 a 40 min): título, objetivo en una frase y carpeta de entrega `trabajos/<id>/`.
   - Repaso (5 min): de 3 a 5 tarjetas del capítulo actual o de capítulos ya dominados.
   - Radar: top 3 de `datos/radar/` con su razón. Antes de la fase 4 no hay datos: dilo en una línea.
4. Reemplaza cada `{{clave}}` de los textos con su valor de `respuestas.json`, con separador de miles.
5. Termina con una sola pregunta: «¿Partimos por la micro-lección?».

No muestres la solución de la práctica salvo que Diego la pida o ya haya entregado.
