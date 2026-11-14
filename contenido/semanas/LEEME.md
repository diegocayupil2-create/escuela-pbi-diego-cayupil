# Planes de la semana

Desde la fase 5, la corrida grande del domingo deja aquí el plan de la semana siguiente: un archivo por semana, con la fecha del lunes como nombre (`2026-11-16.yaml`). El formato está en `esquemas/contenido.mjs` (`semana`) y lo revisan las pruebas.

«Hoy» elige el día con la fecha de Chile. Si la semana no tiene plan, muestra el siguiente paso de la ruta.

```yaml
lunes: "2026-11-16"
generado: "2026-11-15"
dias:
  - fecha: "2026-11-16"
    tema: dax-modelado          # dax-modelado, storytelling, rendimiento, caso-negocio, novedad, reto-portafolio o repaso-retro
    leccion: c10-l02            # o null
    practica: c10-p01           # o null
    repaso: [c10-t02, c10-t05]
    nota: {es: "…", en: "…"}    # opcional
```
