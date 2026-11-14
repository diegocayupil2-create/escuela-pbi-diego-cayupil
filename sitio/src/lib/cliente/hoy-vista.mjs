// Arma «Hoy» en el navegador: la fecha de Chile, el plan de la semana o la ruta, y el estado de la automatización.
import { bloquesDeHoy, fechaChile, estadoAutomatizacion, ZONA } from '../hoy.mjs';
import { modoValido } from '../ruta.mjs';
import { REPO } from '../enlaces.mjs';
import { t, plural } from '../textos.mjs';
import { svgIcono } from '../iconos.mjs';
import { leer, esc } from './preferencias.mjs';

const BASE = import.meta.env.BASE_URL;

function pintarAutomatizacion(el, registro, ahora, T) {
  const e = navigator.onLine === false ? { tipo: 'sin-conexion' } : estadoAutomatizacion(registro, ahora);
  if (e.tipo === 'detenida') {
    el.className = 'estado-auto sino no';
    el.innerHTML = `${svgIcono('no', 'icono sino-icono')}<span>${esc(t(T.detenida, { n: e.dias }))} · <a href="${REPO}/actions">${esc(T.revisar)}</a></span>`;
  } else if (e.tipo === 'al-dia') {
    el.className = 'estado-auto sino si';
    el.innerHTML = `${svgIcono('si', 'icono sino-icono')}<span>${esc(T.alDia)}</span>`;
  } else {
    el.className = 'estado-auto neutro';
    el.innerHTML = `${svgIcono(e.tipo === 'sin-conexion' ? 'sinConexion' : 'reloj')}<span>${esc(e.tipo === 'sin-conexion' ? T.sinConexion : T.sinDatos)}</span>`;
  }
}

function pintarItem(bloque, item, cap, textos) {
  const [sinItem, accion, accionCapitulo, min] = textos;
  const titulo = bloque.querySelector('[data-titulo]');
  const texto = bloque.querySelector('[data-texto]');
  const boton = bloque.querySelector('[data-accion]');
  if (item) {
    titulo.textContent = item.titulo;
    bloque.querySelector('[data-min]').textContent = `${item.minutos} ${min}`;
    boton.href = BASE + item.url;
    boton.querySelector('[data-accion-texto]').textContent = accion;
    boton.hidden = false;
    texto.hidden = true;
  } else {
    bloque.classList.add('bloque-vacio');
    titulo.textContent = cap ? `${cap.num} · ${cap.titulo}` : '';
    texto.textContent = sinItem;
    texto.hidden = false;
    if (cap) {
      boton.href = BASE + cap.url;
      boton.querySelector('[data-accion-texto]').textContent = accionCapitulo;
      boton.hidden = false;
    }
  }
}

function pintarRepaso(bloque, tarjetas, T) {
  const lista = bloque.querySelector('[data-tarjetas]');
  if (!tarjetas.length) {
    bloque.classList.add('bloque-vacio');
    const texto = bloque.querySelector('[data-texto]');
    texto.textContent = T.hoy.sinTarjetas;
    texto.hidden = false;
    return;
  }
  bloque.querySelector('[data-min]').textContent = plural(tarjetas.length, T.hoy.tarjetas);
  lista.innerHTML = tarjetas
    .map(
      (x) =>
        `<details class="repaso"><summary><span class="repaso-tipo">${esc(T.tipoTarjeta[x.tipo])}</span><span class="repaso-frente">${esc(x.frente)}</span><span class="repaso-ver">${esc(T.hoy.verRespuesta)}</span></summary><p>${esc(x.reverso)}</p></details>`,
    )
    .join('');
}

// Deja guardadas para usar sin conexión las páginas de hoy (si el modo sin conexión ya está activo).
function guardarParaSinConexion(urls) {
  if (!navigator.serviceWorker?.controller) return;
  for (const u of urls) if (u) fetch(BASE + u).catch(() => {});
}

export function iniciarHoy() {
  const datos = JSON.parse(document.getElementById('datos-hoy').textContent);
  const T = datos.textos;
  const ahora = new Date();
  const fecha = fechaChile(ahora);
  const modo = modoValido(leer('modo'));
  const b = bloquesDeHoy({ capitulos: datos.capitulos, semanas: datos.semanas, fecha, modo, elegido: leer('capitulo') });
  const raiz = document.querySelector('[data-hoy]');
  const $ = (s) => raiz.querySelector(s);

  const dia = new Intl.DateTimeFormat(datos.lang === 'es' ? 'es-CL' : 'en-US', {
    timeZone: ZONA, weekday: 'long', day: 'numeric', month: 'long',
  }).format(ahora);
  $('[data-fecha]').textContent = dia[0].toUpperCase() + dia.slice(1);
  $('[data-tema]').textContent = T.temas[b.tema];
  pintarAutomatizacion($('[data-auto]'), datos.automatizacion, ahora, T.automatizacion);

  const cap = datos.capitulos.find((c) => c.id === b.capitulo) ?? null;
  $('[data-origen]').textContent = b.origen === 'plan' ? T.hoy.origenPlan : T.hoy.origenRuta;
  $('[data-modo]').textContent = `${T.hoy.modo}: ${T.modos[modo].nombre}`;
  const nota = $('[data-paso-nota]');
  if (cap) {
    $('[data-paso-enlace]').href = BASE + cap.url;
    $('[data-paso-num]').textContent = cap.num;
    $('[data-paso-titulo]').textContent = cap.titulo;
  } else {
    $('[data-paso-titulo]').textContent = T.hoy.todoListo;
  }
  if (b.nota) {
    nota.textContent = b.nota[datos.lang];
    nota.hidden = false;
  } else if (cap && !cap.lecciones.length) {
    const conContenido = datos.capitulos.filter((c) => c.lecciones.length);
    if (conContenido.length) {
      nota.innerHTML = `${esc(T.hoy.conContenido)} ${conContenido
        .map((c) => `<a href="${BASE}${c.url}">${c.num} · ${esc(c.titulo)}</a>`)
        .join(', ')}`;
      nota.hidden = false;
    }
  }

  const leccion = b.leccion ? datos.lecciones[b.leccion] : null;
  const practica = b.practica ? datos.practicas[b.practica] : null;
  pintarItem($('[data-bloque="leccion"]'), leccion, cap, [T.hoy.sinLeccion, T.hoy.leer, T.hoy.verCapitulo, T.min]);
  pintarItem($('[data-bloque="practica"]'), practica, cap, [T.hoy.sinPractica, T.hoy.abrir, T.hoy.verCapitulo, T.min]);
  pintarRepaso($('[data-bloque="repaso"]'), b.repaso.map((id) => datos.tarjetas[id]).filter(Boolean), T);

  raiz.dataset.listo = '';
  guardarParaSinConexion([leccion?.url, practica?.url, cap?.url]);
}
