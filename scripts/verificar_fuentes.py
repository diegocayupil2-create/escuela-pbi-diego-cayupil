# -*- coding: utf-8 -*-
"""Revisa en internet las fuentes de la escuela. Solo lee páginas públicas; no usa claves ni cuentas.

  python scripts/verificar_fuentes.py             links del currículo, lecciones, prácticas, fuentes y retos, más los feeds
  python scripts/verificar_fuentes.py --youtube   además busca el channel_id de cada @handle de YouTube
  python scripts/verificar_fuentes.py --libros    además consulta Google Books por cada libro de biblioteca.yaml
  python scripts/verificar_fuentes.py --json      todo el detalle en JSON

Termina con código 1 si algún link responde con error o un feed no trae entradas. Un 401, 403, 429 o 999
se informa como «bloqueado»: la página existe, pero rechaza lectores automáticos; se revisa a mano o con
la búsqueda web de la IA.
"""
import argparse
import concurrent.futures as cf
import json
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parents[1]
CONTENIDO = RAIZ / "contenido"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"
ATOM = "{http://www.w3.org/2005/Atom}"
BLOQUEOS = {401, 403, 429, 999}


def pedir(url, limite=800_000, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9,es;q=0.8"})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ssl.create_default_context()) as r:
            return r.status, r.geturl(), r.read(limite)
    except urllib.error.HTTPError as e:
        return e.code, url, b""
    except Exception as e:  # red, DNS o tiempo de espera
        return None, url, str(e).encode("utf-8", "replace")


def leer(nombre):
    return yaml.safe_load((CONTENIDO / nombre).read_text(encoding="utf-8"))


def encabezado(md):
    m = re.match(r"^---\r?\n(.*?)\r?\n---", md.read_text(encoding="utf-8"), re.S)
    return yaml.safe_load(m.group(1)) if m else {}


def links_del_contenido():
    """Devuelve {url: dónde aparece} con los links de todo el contenido."""
    vistos = {}

    def agregar(url, donde):
        if url and url.startswith("http"):
            vistos.setdefault(url, donde)

    for cap in leer("curriculo.yaml")["capitulos"]:
        for f in cap.get("fuentes") or []:
            agregar(f.get("url"), cap["id"])
    for f in leer("fuentes.yaml")["fuentes"]:
        agregar(f.get("url"), "fuentes:" + f["id"])
    for r in leer("retos.yaml")["retos"]:
        agregar(r.get("url"), "retos:" + r["id"])
    for d in leer("deprecados.yaml")["deprecados"]:
        agregar(d.get("fuente"), "deprecados:" + d["id"])
    for md in sorted(CONTENIDO.glob("capitulos/*/lecciones/*.md")):
        for f in encabezado(md).get("fuentes") or []:
            agregar(f.get("url"), md.name)
    for practica in sorted(CONTENIDO.glob("capitulos/*/practicas/*.yaml")):
        for f in (yaml.safe_load(practica.read_text(encoding="utf-8")) or {}).get("fuentes") or []:
            agregar(f.get("url"), practica.name)
    return vistos


def revisar_link(url):
    codigo, final, _ = pedir(url, limite=4096)
    if codigo and 200 <= codigo < 400:
        return {"estado": "ok", "codigo": codigo, "final": final}
    if codigo in BLOQUEOS:
        return {"estado": "bloqueado", "codigo": codigo, "final": final}
    return {"estado": "error", "codigo": codigo, "final": final}


def revisar_feed(url):
    codigo, _, cuerpo = pedir(url)
    if not codigo or codigo >= 400:
        return {"estado": "bloqueado" if codigo in BLOQUEOS else "error", "codigo": codigo, "entradas": 0}
    try:
        raiz = ET.fromstring(cuerpo)
    except ET.ParseError:
        return {"estado": "error", "codigo": codigo, "entradas": 0, "nota": "no es XML"}
    items = raiz.findall(".//item") or raiz.findall(f".//{ATOM}entry")
    ultima = None
    if items:
        for etiqueta in ("pubDate", f"{ATOM}updated", f"{ATOM}published"):
            nodo = items[0].find(etiqueta)
            if nodo is not None and nodo.text:
                ultima = nodo.text.strip()
                break
    return {"estado": "ok" if items else "vacio", "codigo": codigo, "entradas": len(items), "ultima": ultima}


def canal_youtube(handle):
    codigo, _, cuerpo = pedir("https://www.youtube.com/" + handle, limite=2_000_000)
    if not codigo or codigo >= 400:
        return None
    texto = cuerpo.decode("utf-8", "replace")
    for patron in (r'"externalId":"(UC[\w-]{22})"', r'<meta itemprop="identifier" content="(UC[\w-]{22})"',
                   r'"channelId":"(UC[\w-]{22})"', r"channel_id=(UC[\w-]{22})"):
        m = re.search(patron, texto)
        if m:
            return m.group(1)
    return None


def buscar_libro(libro):
    autor = libro["autores"][0]
    salida = {}
    consultas = (("en", f'intitle:"{libro["titulo"]}" inauthor:"{autor}"'), ("es", f'inauthor:"{autor}"'))
    for idioma, q in consultas:
        parametros = {"q": q, "maxResults": "20", "printType": "books", "langRestrict": idioma}
        codigo, _, cuerpo = pedir("https://www.googleapis.com/books/v1/volumes?" + urllib.parse.urlencode(parametros))
        items = json.loads(cuerpo or b"{}").get("items", []) if codigo == 200 else []
        vistos = {(i["volumeInfo"].get("publishedDate", "")[:4], i["volumeInfo"].get("title", ""),
                   i["volumeInfo"].get("publisher", "")) for i in items}
        salida[idioma] = sorted(vistos, reverse=True)[:8]
    return salida


def imprimir(informe):
    def resumen(nombre, datos):
        cuenta = {}
        for r in datos.values():
            cuenta[r["estado"]] = cuenta.get(r["estado"], 0) + 1
        print(f"{nombre}: " + " · ".join(f"{n} {e}" for e, n in sorted(cuenta.items())))
        for clave, r in datos.items():
            if r["estado"] != "ok":
                print(f"  {r['estado'].upper():9} {r.get('codigo')}  {r.get('url', clave)}  ({r.get('donde', clave)})")

    resumen("Links", informe["links"])
    resumen("Feeds", informe["feeds"])
    if informe["youtube"]:
        resumen("YouTube", informe["youtube"])
        for fid, r in informe["youtube"].items():
            print(f"  {fid}: {r['handle']} -> {r['channel_id']}")
    for lid, r in informe["libros"].items():
        print(f"Libro {lid}:")
        for idioma in ("en", "es"):
            for anio, titulo, editorial in r[idioma][:4]:
                print(f"  [{idioma}] {anio} · {titulo} · {editorial}")


def main():
    for flujo in (sys.stdout, sys.stderr):
        try:
            flujo.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--youtube", action="store_true", help="resuelve el channel_id de cada @handle")
    ap.add_argument("--libros", action="store_true", help="consulta Google Books por cada libro")
    ap.add_argument("--json", action="store_true", help="imprime todo el detalle en JSON")
    args = ap.parse_args()

    informe = {"links": {}, "feeds": {}, "youtube": {}, "libros": {}}
    links = links_del_contenido()
    with cf.ThreadPoolExecutor(max_workers=8) as ex:
        for url, r in zip(links, ex.map(revisar_link, links)):
            informe["links"][url] = {"donde": links[url], **r}

    fuentes = leer("fuentes.yaml")["fuentes"]
    feeds = {f["id"]: f["feed"] for f in fuentes if f.get("feed")}
    feeds.update({f["id"] + ":releases": f"https://github.com/{f['github']}/releases.atom"
                  for f in fuentes if f.get("github")})
    with cf.ThreadPoolExecutor(max_workers=8) as ex:
        for (fid, url), r in zip(feeds.items(), ex.map(revisar_feed, feeds.values())):
            informe["feeds"][fid] = {"url": url, **r}

    if args.youtube:
        for f in fuentes:
            if f.get("youtube"):
                cid = canal_youtube(f["youtube"]["handle"])
                r = revisar_feed(f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}") if cid else {"estado": "error"}
                informe["youtube"][f["id"]] = {"handle": f["youtube"]["handle"], "channel_id": cid, **r}

    if args.libros:
        for libro in leer("biblioteca.yaml")["libros"]:
            informe["libros"][libro["id"]] = buscar_libro(libro)

    if args.json:
        print(json.dumps(informe, ensure_ascii=False, indent=2))
    else:
        imprimir(informe)
    malos = [u for u, r in informe["links"].items() if r["estado"] == "error"]
    malos += [f for f, r in informe["feeds"].items() if r["estado"] in ("error", "vacio")]
    malos += [f for f, r in informe["youtube"].items() if r["estado"] != "ok"]
    return 1 if malos else 0


if __name__ == "__main__":
    sys.exit(main())
