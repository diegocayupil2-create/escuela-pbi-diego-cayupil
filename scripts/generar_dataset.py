# -*- coding: utf-8 -*-
"""Genera el dataset ficticio «Distribuidora Andes» para las prácticas de la escuela.

Sale siempre igual porque usa una semilla fija. Trae hallazgos plantados y un problema de calidad de
datos para detectar; las respuestas quedan en respuestas.json y /entregar las usa para corregir.

  python scripts/generar_dataset.py                    escribe en datos/datasets/distribuidora-andes/
  python scripts/generar_dataset.py --destino CARPETA  escribe en otra carpeta (lo usan las pruebas)

Solo usa la librería estándar de Python.
"""
import argparse
import csv
import datetime as dt
import json
import random
import sys
from collections import Counter, defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
DESTINO = RAIZ / "datos" / "datasets" / "distribuidora-andes"
SEMILLA = 20261114
N_CLIENTES = 300
UMBRAL_GRANDE = 20_000_000                 # pesos al año para ser «cliente grande»
ANIOS = (2024, 2025)
# Hallazgo plantado: clientes grandes de Biobío que dejan de comprar desde marzo de 2025.
FUGA_REGION, FUGA_DESDE, FUGA_CLIENTES = "Biobío", dt.date(2025, 3, 1), 5
# Problema de calidad plantado: la sucursal de Temuco reenvió un lote y esas líneas quedan duplicadas.
LOTE_FECHA, LOTE_SUCURSAL, LOTE_LINEAS = dt.date(2025, 3, 14), "Temuco", 40

REGIONES = [  # región, ciudad de la sucursal, peso en la cartera
    ("Metropolitana", "Santiago", 38),
    ("Valparaíso", "Valparaíso", 15),
    ("Biobío", "Concepción", 16),
    ("La Araucanía", "Temuco", 11),
    ("Antofagasta", "Antofagasta", 10),
    ("Los Lagos", "Puerto Montt", 10),
]
SEGMENTOS = {  # peso, cantidad por línea, descuento %, pedidos al año, líneas por pedido, días de crédito
    "Mayorista": {"peso": 15, "cantidad": (10, 60), "descuento": (5, 15), "pedidos": 24, "lineas": (3, 6), "credito": 60},
    "Horeca": {"peso": 25, "cantidad": (3, 20), "descuento": (0, 8), "pedidos": 14, "lineas": (2, 5), "credito": 30},
    "Minorista": {"peso": 60, "cantidad": (2, 14), "descuento": (0, 3), "pedidos": 12, "lineas": (1, 4), "credito": 0},
}
PREFIJOS = {
    "Mayorista": ["Comercial", "Distribuidora", "Supermercado", "Mayorista"],
    "Horeca": ["Restaurante", "Hotel", "Cafetería", "Casino", "Hostal"],
    "Minorista": ["Almacén", "Minimarket", "Botillería", "Kiosco", "Negocio"],
}
NOMBRES = ["Los Aromos", "Don Pepe", "La Esquina", "El Roble", "San Pedro", "Las Rosas", "Doña Inés", "El Faro",
           "Los Pinos", "Santa Elena", "El Molino", "La Estrella", "Las Palmas", "Don Lucho", "El Mirador",
           "Los Andes", "La Pérgola", "El Quillay", "Las Vertientes", "El Copihue", "Bellavista", "Lago Azul",
           "El Alerce", "Santa Rosa", "Villa Alegre", "Los Boldos", "El Canelo", "Puerto Claro", "La Fuente",
           "El Sol", "Las Acacias", "Los Olivos", "La Colina", "El Parrón", "Las Camelias", "Don Tito"]
MARCAS = ["Andina", "Cordillera", "Pacífico", "Austral", "Valle Sur", "Del Puerto"]
PRODUCTOS = {  # categoría: (productos, rango de precio por unidad de venta, margen bruto)
    "Abarrotes": (["Arroz grado 1 5 kg", "Azúcar 1 kg x10", "Aceite maravilla 1 L x12", "Fideos spaghetti 400 g x20",
                   "Harina sin polvos 1 kg x10", "Lentejas 1 kg x10", "Atún lomitos 160 g x24", "Café molido 500 g x6",
                   "Té 100 bolsitas x12", "Sal fina 1 kg x25", "Salsa de tomate 200 g x24", "Avena 500 g x12"],
                  (9000, 42000), (0.18, 0.30)),
    "Bebidas": (["Agua mineral 1,5 L x6", "Bebida cola 3 L x6", "Bebida naranja 1,5 L x6", "Néctar durazno 1 L x12",
                 "Jugo en polvo x100", "Agua con gas 500 ml x24", "Bebida isotónica 500 ml x12", "Té helado 1,5 L x6",
                 "Cerveza lata 470 ml x24", "Vino tinto 750 ml x12", "Energética 250 ml x24", "Agua saborizada 1,6 L x6"],
                (6000, 30000), (0.22, 0.35)),
    "Lácteos": (["Leche entera 1 L x12", "Leche descremada 1 L x12", "Yogur batido 120 g x24", "Mantequilla 250 g x20",
                 "Queso gauda 1 kg", "Queso laminado 500 g x6", "Crema de leche 1 L x12", "Leche condensada 397 g x24",
                 "Manjar 1 kg x6", "Postre de leche 120 g x24", "Leche cultivada 1 L x12", "Queso fresco 500 g x6"],
                (7000, 36000), (0.15, 0.25)),
    "Limpieza": (["Detergente líquido 3 L x4", "Lavalozas 750 ml x12", "Cloro 2 L x6", "Limpiador multiuso 1 L x12",
                  "Papel higiénico 48 rollos", "Toalla de papel 12 rollos", "Bolsas de basura 50 un. x10",
                  "Jabón líquido 1 L x6", "Desinfectante aerosol 360 ml x12", "Esponjas x24", "Suavizante 3 L x4",
                  "Limpiavidrios 500 ml x12"],
                 (8000, 45000), (0.25, 0.40)),
    "Congelados": (["Papas prefritas 2,5 kg x4", "Hamburguesas 100 g x36", "Nuggets de pollo 1 kg x6", "Pizza congelada x10",
                    "Helado 1 L x6", "Verduras mixtas 1 kg x10", "Empanadas de pino x24", "Filetes de merluza 1 kg x6",
                    "Camarones 500 g x10", "Arvejas 1 kg x10", "Choclo 1 kg x10", "Masa de hojaldre 1 kg x6"],
                   (10000, 52000), (0.20, 0.32)),
}
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
         "septiembre", "octubre", "noviembre", "diciembre"]
DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
COLUMNAS_VENTAS = ["fecha", "cliente_id", "producto_id", "sucursal", "cantidad", "precio_unitario",
                   "descuento_pct", "monto_neto"]

LEEME = """# Distribuidora Andes (dataset ficticio)

**Español.** Distribuidora Andes vende abarrotes, bebidas, lácteos, limpieza y congelados a {clientes} clientes de seis regiones de Chile, desde seis sucursales. Los datos cubren 2024 y 2025. Todo es inventado y se genera con `npm run dataset` (semilla {semilla}): sale siempre igual.

| Tabla | Grain (una fila por…) | Filas |
|---|---|---|
| `fact_ventas.csv` | línea de pedido: fecha, cliente y producto | {ventas} |
| `dim_cliente.csv` | cliente | {clientes} |
| `dim_producto.csv` | producto | {productos} |
| `dim_fecha.csv` | día | {fechas} |

- Relaciones: `fact_ventas[cliente_id]` → `dim_cliente`, `fact_ventas[producto_id]` → `dim_producto` y `fact_ventas[fecha]` → `dim_fecha`.
- Montos en pesos chilenos, sin decimales. `descuento_pct` es un entero: 5 significa 5 %.
- La extracción del ERP no trae un id de línea.
- `respuestas.json` tiene las respuestas de las prácticas: no lo abras antes de entregar.

**English.** Distribuidora Andes sells groceries, beverages, dairy, cleaning products and frozen food to {clientes} customers in six Chilean regions, from six branches. The data covers 2024 and 2025. Everything is made up and generated with `npm run dataset` (seed {semilla}), so it always comes out the same.

| Table | Grain (one row per…) | Rows |
|---|---|---|
| `fact_ventas.csv` | order line: date, customer and product | {ventas} |
| `dim_cliente.csv` | customer | {clientes} |
| `dim_producto.csv` | product | {productos} |
| `dim_fecha.csv` | day | {fechas} |

- Relationships: `fact_ventas[cliente_id]` → `dim_cliente`, `fact_ventas[producto_id]` → `dim_producto` and `fact_ventas[fecha]` → `dim_fecha`.
- Amounts in Chilean pesos, no decimals. `descuento_pct` is an integer: 5 means 5%.
- The ERP extract has no line id.
- `respuestas.json` holds the practice answers: don't open it before you submit.
"""


def a_diez(x):
    return int(round(x / 10.0)) * 10


def armar_productos(rnd):
    productos, n = [], 1
    for categoria, (nombres, (pmin, pmax), (mmin, mmax)) in PRODUCTOS.items():
        for nombre in nombres:
            precio = a_diez(rnd.uniform(pmin, pmax))
            productos.append({
                "producto_id": f"P{n:03d}", "producto": nombre, "categoria": categoria,
                "marca": rnd.choice(MARCAS), "precio_lista": precio,
                "costo_unitario": a_diez(precio * (1 - rnd.uniform(mmin, mmax))),
                "popularidad": rnd.uniform(0.5, 1.5),
            })
            n += 1
    return productos


def armar_clientes(rnd):
    clientes, usados = [], set()
    segmentos = list(SEGMENTOS)
    for i in range(1, N_CLIENTES + 1):
        region, ciudad, _ = rnd.choices(REGIONES, weights=[r[2] for r in REGIONES])[0]
        segmento = rnd.choices(segmentos, weights=[SEGMENTOS[s]["peso"] for s in segmentos])[0]
        base = f"{rnd.choice(PREFIJOS[segmento])} {rnd.choice(NOMBRES)}"
        nombre, k = base, 2
        while nombre in usados:
            nombre = f"{base} {ciudad}" if k == 2 else f"{base} {k}"
            k += 1
        usados.add(nombre)
        credito = SEGMENTOS[segmento]["credito"]
        clientes.append({
            "cliente_id": f"C{i:04d}", "cliente": nombre, "segmento": segmento, "region": region,
            "ciudad": ciudad,
            "dias_credito": credito if credito == 0 else rnd.choice([credito - 15, credito, credito + 15]),
            "fecha_alta": (dt.date(2015, 1, 1) + dt.timedelta(days=rnd.randrange(3280))).isoformat(),
            "tamano": rnd.lognormvariate(0, 0.55),
        })
    return clientes


def dias_habiles(anio):
    dia, fin, dias = dt.date(anio, 1, 1), dt.date(anio, 12, 31), []
    while dia <= fin:
        if dia.weekday() < 6:  # de lunes a sábado
            dias.append(dia)
        dia += dt.timedelta(days=1)
    return dias


def muestra_ponderada(rnd, items, pesos, k):
    disponibles, w, elegidos = list(items), list(pesos), []
    for _ in range(min(k, len(disponibles))):
        i = rnd.choices(range(len(disponibles)), weights=w)[0]
        elegidos.append(disponibles.pop(i))
        w.pop(i)
    return elegidos


def lineas_de_pedido(rnd, cliente, fecha, productos, n_lineas=None):
    seg = SEGMENTOS[cliente["segmento"]]
    n = n_lineas or rnd.randint(*seg["lineas"])
    lineas = []
    for p in muestra_ponderada(rnd, productos, [x["popularidad"] for x in productos], n):
        cantidad = max(1, round(rnd.randint(*seg["cantidad"]) * cliente["tamano"] ** 0.4))
        precio = a_diez(p["precio_lista"] * rnd.uniform(0.97, 1.03))
        descuento = rnd.randint(*seg["descuento"])
        lineas.append({
            "fecha": fecha.isoformat(), "cliente_id": cliente["cliente_id"], "producto_id": p["producto_id"],
            "sucursal": cliente["ciudad"], "cantidad": cantidad, "precio_unitario": precio,
            "descuento_pct": descuento, "monto_neto": round(cantidad * precio * (100 - descuento) / 100),
        })
    return lineas


def armar_ventas(rnd, clientes, productos):
    ventas = []
    for anio in ANIOS:
        dias = dias_habiles(anio)
        crecimiento = 1.05 if anio == 2025 else 1.0
        for c in clientes:
            seg = SEGMENTOS[c["segmento"]]
            n = max(1, round(seg["pedidos"] * c["tamano"] ** 0.6 * crecimiento * rnd.uniform(0.85, 1.15)))
            for fecha in sorted(rnd.sample(dias, min(n, len(dias)))):
                ventas.extend(lineas_de_pedido(rnd, c, fecha, productos))
    return ventas


def total_por_cliente(ventas, filtro):
    t = defaultdict(int)
    for v in ventas:
        if filtro(v):
            t[v["cliente_id"]] += v["monto_neto"]
    return t


def plantar_fuga(ventas, clientes):
    v2024 = total_por_cliente(ventas, lambda v: v["fecha"].startswith("2024"))
    antes = total_por_cliente(ventas, lambda v: "2025-01-01" <= v["fecha"] < FUGA_DESDE.isoformat())
    candidatos = [c["cliente_id"] for c in clientes
                  if c["region"] == FUGA_REGION and v2024[c["cliente_id"]] > UMBRAL_GRANDE
                  and antes[c["cliente_id"]] < 0.8 * UMBRAL_GRANDE]
    fuga = candidatos[:FUGA_CLIENTES]
    if len(fuga) < 3:
        raise SystemExit("La semilla no deja clientes suficientes para la fuga plantada: cambia SEMILLA.")
    corte = FUGA_DESDE.isoformat()
    ventas[:] = [v for v in ventas if not (v["cliente_id"] in fuga and v["fecha"] >= corte)]
    return fuga


def plantar_lote(rnd, ventas, clientes, productos):
    fecha = LOTE_FECHA.isoformat()
    v2025 = total_por_cliente(ventas, lambda v: v["fecha"].startswith("2025"))
    chicos = [c for c in clientes if c["ciudad"] == LOTE_SUCURSAL and c["segmento"] == "Minorista"
              and v2025[c["cliente_id"]] < 0.5 * UMBRAL_GRANDE]
    ids = {c["cliente_id"] for c in chicos}
    con_pedido = {v["cliente_id"] for v in ventas if v["fecha"] == fecha}
    del_dia = [v for v in ventas if v["fecha"] == fecha and v["cliente_id"] in ids]
    for c in chicos:
        if len(del_dia) >= LOTE_LINEAS:
            break
        if c["cliente_id"] not in con_pedido:
            nuevas = lineas_de_pedido(rnd, c, LOTE_FECHA, productos, n_lineas=rnd.randint(3, 5))
            ventas.extend(nuevas)
            del_dia.extend(nuevas)
    if len(del_dia) < LOTE_LINEAS:
        raise SystemExit("No hay líneas suficientes para el lote plantado: cambia SEMILLA.")
    lote = sorted(del_dia, key=clave)[:LOTE_LINEAS]
    ventas.extend(dict(v) for v in lote)
    return lote


def clave(v):
    return tuple(v[k] for k in COLUMNAS_VENTAS)


def por_cliente_anio(lista):
    t = defaultdict(int)
    for v in lista:
        t[(v["cliente_id"], v["fecha"][:4])] += v["monto_neto"]
    return t


def calcular_respuestas(clientes, ventas, fuga, lote):
    conteo = Counter(clave(v) for v in ventas)
    assert {k for k, n in conteo.items() if n > 1} == {clave(v) for v in lote}, "solo el lote puede repetirse"
    assert max(conteo.values()) == 2
    limpias = list({clave(v): v for v in ventas}.values())
    region = {c["cliente_id"]: c["region"] for c in clientes}
    crudo, limpio = por_cliente_anio(ventas), por_cliente_anio(limpias)

    p01 = {"umbral": UMBRAL_GRANDE}
    por_region = {r[0]: {} for r in REGIONES}
    for anio in map(str, ANIOS):
        grandes = {c for (c, a), t in crudo.items() if a == anio and t > UMBRAL_GRANDE}
        assert grandes == {c for (c, a), t in limpio.items() if a == anio and t > UMBRAL_GRANDE}
        p01[f"grandes_{anio}"] = len(grandes)
        for r in por_region:
            por_region[r][anio] = sum(1 for c in grandes if region[c] == r)
        total = sum(t for (c, a), t in crudo.items() if a == anio)
        total_limpio = sum(t for (c, a), t in limpio.items() if a == anio)
        p01[f"pct_ventas_grandes_{anio}"] = round(100 * sum(crudo[(c, anio)] for c in grandes) / total, 1)
        p01[f"pct_ventas_grandes_{anio}_sin_lote"] = round(
            100 * sum(limpio[(c, anio)] for c in grandes) / total_limpio, 1)
    caidas = {r: v["2024"] - v["2025"] for r, v in por_region.items()}
    peor = max(caidas, key=caidas.get)
    if peor != FUGA_REGION:
        raise SystemExit(f"La mayor caída debía estar en {FUGA_REGION} y quedó en {peor}: cambia SEMILLA.")
    p01.update({
        "region_mayor_caida": peor,
        "region_grandes_2024": por_region[peor]["2024"],
        "region_grandes_2025": por_region[peor]["2025"],
        "clientes_que_dejaron_de_comprar": len(fuga),
        "mes_fuga": FUGA_DESDE.strftime("%Y-%m"),
        "por_region": por_region,
    })

    marzo = [v for v in ventas if v["fecha"].startswith("2025-03")]
    erp = sum(v["monto_neto"] for v in limpias if v["fecha"].startswith("2025-03"))
    monto_lote = sum(v["monto_neto"] for v in lote)
    i_monto = COLUMNAS_VENTAS.index("monto_neto")
    por_linea = sum(n * n * k[i_monto] for k, n in Counter(clave(v) for v in marzo).items())
    p02 = {
        "fecha_lote": LOTE_FECHA.isoformat(), "sucursal_lote": LOTE_SUCURSAL,
        "lineas_duplicadas": len(lote), "monto_duplicado": monto_lote,
        "ventas_marzo_erp": erp, "ventas_marzo_sum": sum(v["monto_neto"] for v in marzo),
        "ventas_marzo_por_linea": por_linea, "exceso_sum": monto_lote, "exceso_por_linea": 3 * monto_lote,
    }
    assert p02["ventas_marzo_sum"] == erp + monto_lote
    assert por_linea == erp + 3 * monto_lote
    return {"dataset": "distribuidora-andes", "semilla": SEMILLA, "c10-p01": p01, "c10-p02": p02}


def filas_fecha():
    dia, filas = dt.date(ANIOS[0], 1, 1), []
    while dia <= dt.date(ANIOS[-1], 12, 31):
        filas.append({
            "fecha": dia.isoformat(), "anio": dia.year, "trimestre": f"T{(dia.month - 1) // 3 + 1}",
            "mes_num": dia.month, "mes": MESES[dia.month - 1], "anio_mes": dia.strftime("%Y-%m"),
            "semana_iso": dia.isocalendar()[1], "dia_semana_num": dia.isoweekday(),
            "dia_semana": DIAS[dia.weekday()], "es_fin_de_semana": int(dia.weekday() >= 5),
        })
        dia += dt.timedelta(days=1)
    return filas


def escribir_csv(ruta, filas, columnas):
    with open(ruta, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(columnas)
        for fila in filas:
            w.writerow([fila[c] for c in columnas])


def generar(destino=DESTINO):
    destino = Path(destino)
    destino.mkdir(parents=True, exist_ok=True)
    rnd = random.Random(SEMILLA)
    productos = armar_productos(rnd)
    clientes = armar_clientes(rnd)
    ventas = armar_ventas(rnd, clientes, productos)
    fuga = plantar_fuga(ventas, clientes)
    lote = plantar_lote(rnd, ventas, clientes, productos)
    respuestas = calcular_respuestas(clientes, ventas, fuga, lote)
    ventas.sort(key=lambda v: (v["fecha"], v["sucursal"], v["cliente_id"], v["producto_id"], v["cantidad"], v["monto_neto"]))
    fechas = filas_fecha()
    escribir_csv(destino / "dim_cliente.csv", clientes,
                 ["cliente_id", "cliente", "segmento", "region", "ciudad", "dias_credito", "fecha_alta"])
    escribir_csv(destino / "dim_producto.csv", productos,
                 ["producto_id", "producto", "categoria", "marca", "precio_lista", "costo_unitario"])
    escribir_csv(destino / "dim_fecha.csv", fechas,
                 ["fecha", "anio", "trimestre", "mes_num", "mes", "anio_mes", "semana_iso", "dia_semana_num",
                  "dia_semana", "es_fin_de_semana"])
    escribir_csv(destino / "fact_ventas.csv", ventas, COLUMNAS_VENTAS)
    (destino / "respuestas.json").write_text(json.dumps(respuestas, ensure_ascii=False, indent=2) + "\n",
                                             encoding="utf-8", newline="\n")
    (destino / "LEEME.md").write_text(
        LEEME.format(clientes=len(clientes), productos=len(productos), fechas=len(fechas), ventas=len(ventas),
                     semilla=SEMILLA),
        encoding="utf-8", newline="\n")
    return respuestas


if __name__ == "__main__":
    for flujo in (sys.stdout, sys.stderr):
        try:
            flujo.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--destino", type=Path, default=DESTINO, help="carpeta donde escribir el dataset")
    args = ap.parse_args()
    r = generar(args.destino)
    p1, p2 = r["c10-p01"], r["c10-p02"]
    print(f"Listo en {args.destino}")
    print(f"  clientes grandes: {p1['grandes_2024']} en 2024 y {p1['grandes_2025']} en 2025; "
          f"{p1['region_mayor_caida']}: {p1['region_grandes_2024']} → {p1['region_grandes_2025']}")
    print(f"  lote duplicado: {p2['lineas_duplicadas']} líneas, {p2['monto_duplicado']:,} pesos")
