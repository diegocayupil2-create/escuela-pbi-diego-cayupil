# -*- coding: utf-8 -*-
"""Pruebas del dataset Distribuidora Andes: se regenera idéntico y las respuestas cuadran con los CSV."""
import csv
import hashlib
import json
import sys
import tempfile
import unittest
from collections import Counter, defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "scripts"))
import generar_dataset as g  # noqa: E402

CARPETA = g.DESTINO


def huella(ruta):
    return hashlib.sha256(Path(ruta).read_bytes()).hexdigest()


def ventas():
    with open(CARPETA / "fact_ventas.csv", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def respuestas():
    return json.loads((CARPETA / "respuestas.json").read_text(encoding="utf-8"))


class DatasetDistribuidoraAndes(unittest.TestCase):
    def test_se_regenera_identico(self):
        with tempfile.TemporaryDirectory() as tmp:
            g.generar(Path(tmp))
            nuevos = sorted(p.name for p in Path(tmp).iterdir())
            self.assertEqual(nuevos, sorted(p.name for p in CARPETA.iterdir()))
            for nombre in nuevos:
                with self.subTest(archivo=nombre):
                    self.assertEqual(huella(CARPETA / nombre), huella(Path(tmp) / nombre),
                                     f"{nombre} cambió: corre npm run dataset y revisa el diff")

    def test_solo_estan_duplicadas_las_lineas_del_lote(self):
        r = respuestas()["c10-p02"]
        filas = ventas()
        conteo = Counter(tuple(f.values()) for f in filas)
        repetidas = [dict(zip(filas[0].keys(), k)) for k, n in conteo.items() if n > 1]
        self.assertEqual(len(repetidas), r["lineas_duplicadas"])
        for fila in repetidas:
            self.assertEqual((fila["fecha"], fila["sucursal"]), (r["fecha_lote"], r["sucursal_lote"]))
        self.assertTrue(all(n <= 2 for n in conteo.values()))

    def test_las_respuestas_cuadran_con_los_csv(self):
        r = respuestas()
        filas = ventas()
        marzo = [f for f in filas if f["fecha"].startswith("2025-03")]
        conteo = Counter(tuple(f.values()) for f in marzo)
        i_monto = list(filas[0].keys()).index("monto_neto")
        self.assertEqual(sum(int(f["monto_neto"]) for f in marzo), r["c10-p02"]["ventas_marzo_sum"])
        self.assertEqual(sum(int(k[i_monto]) for k in conteo), r["c10-p02"]["ventas_marzo_erp"])
        self.assertEqual(sum(n * n * int(k[i_monto]) for k, n in conteo.items()), r["c10-p02"]["ventas_marzo_por_linea"])
        por = defaultdict(int)
        for f in filas:
            por[(f["cliente_id"], f["fecha"][:4])] += int(f["monto_neto"])
        for anio in ("2024", "2025"):
            grandes = sum(1 for (c, a), t in por.items() if a == anio and t > r["c10-p01"]["umbral"])
            self.assertEqual(grandes, r["c10-p01"][f"grandes_{anio}"])

    def test_pesa_menos_de_5_mb(self):
        self.assertLess(sum(p.stat().st_size for p in CARPETA.iterdir()), 5 * 1024 * 1024)


if __name__ == "__main__":
    unittest.main()
