---
description: Arma o revisa el plan de la semana
argument-hint: "[AAAA-Www opcional]"
---
Arma el plan de la semana $ARGUMENTS en `contenido/semana/AAAA-Www.json`. Si viene vacío, usa la próxima semana ISO en hora de Chile.

1. Lee `contenido/curriculo.yaml`, los capítulos que ya tienen contenido y, si existen, los ítems del radar de la semana.
2. Arma siete entradas, una por día, con: fecha, tema del día (lunes DAX y modelado · martes storytelling · miércoles rendimiento · jueves caso de negocio · viernes novedad de la semana · sábado reto o portafolio · domingo repaso y retro), capítulo, micro-lección, práctica (o reto y portafolio el sábado) y tarjetas de repaso.
3. Respeta la ruta: no propongas un capítulo sin sus requisitos, salvo que Diego esté en modo libre.
4. Si falta una lección o una práctica, créala con el subagente `profesor` y revísala con el `verificador` antes de usarla.
5. Corre `npm test` y muestra el plan en una tabla corta.

Desde la fase 5 esto lo hace solo la corrida del domingo; el comando queda para ajustes a mano.
