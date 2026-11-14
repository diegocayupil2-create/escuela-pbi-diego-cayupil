# Distribuidora Andes (dataset ficticio)

**Español.** Distribuidora Andes vende abarrotes, bebidas, lácteos, limpieza y congelados a 300 clientes de seis regiones de Chile, desde seis sucursales. Los datos cubren 2024 y 2025. Todo es inventado y se genera con `npm run dataset` (semilla 20261114): sale siempre igual.

| Tabla | Grain (una fila por…) | Filas |
|---|---|---|
| `fact_ventas.csv` | línea de pedido: fecha, cliente y producto | 30025 |
| `dim_cliente.csv` | cliente | 300 |
| `dim_producto.csv` | producto | 60 |
| `dim_fecha.csv` | día | 731 |

- Relaciones: `fact_ventas[cliente_id]` → `dim_cliente`, `fact_ventas[producto_id]` → `dim_producto` y `fact_ventas[fecha]` → `dim_fecha`.
- Montos en pesos chilenos, sin decimales. `descuento_pct` es un entero: 5 significa 5 %.
- La extracción del ERP no trae un id de línea.
- `respuestas.json` tiene las respuestas de las prácticas: no lo abras antes de entregar.

**English.** Distribuidora Andes sells groceries, beverages, dairy, cleaning products and frozen food to 300 customers in six Chilean regions, from six branches. The data covers 2024 and 2025. Everything is made up and generated with `npm run dataset` (seed 20261114), so it always comes out the same.

| Table | Grain (one row per…) | Rows |
|---|---|---|
| `fact_ventas.csv` | order line: date, customer and product | 30025 |
| `dim_cliente.csv` | customer | 300 |
| `dim_producto.csv` | product | 60 |
| `dim_fecha.csv` | day | 731 |

- Relationships: `fact_ventas[cliente_id]` → `dim_cliente`, `fact_ventas[producto_id]` → `dim_producto` and `fact_ventas[fecha]` → `dim_fecha`.
- Amounts in Chilean pesos, no decimals. `descuento_pct` is an integer: 5 means 5%.
- The ERP extract has no line id.
- `respuestas.json` holds the practice answers: don't open it before you submit.
