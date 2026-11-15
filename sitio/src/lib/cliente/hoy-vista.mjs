// Arma «Hoy» en el navegador: la fecha de Chile, el plan de la semana o la ruta, lo que ya marcaste como hecho
// y el estado de la automatización.
import { bloquesDeHoy, fechaChile, estadoAutomatizacion, ZONA } from '../hoy.mjs';
import { REPO } from '../enlaces.mjs';
import { t, plural } from '../textos.mjs';
import { svgIcono } from '../iconos.mjs';
import { esc } from './preferencias.mjs';
import { preferencias, leerDatos } from './estado.mjs';

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

/** Llena un bloque: título, minutos y botón; o un texto y un botón de respaldo si no hay qué mostrar. */
function pintarBloque(bloque, { titulo = '', minutos = null, texto = null, accion = null, url = null }) {
  bloque.querySelector('[data-titulo]').textContent = titulo;
  if (minutos != null) bloque.querySelector('[data-min]').textContent = minutos;
  const p = bloque.querySelector('[data-texto]');
  p.textContent = texto ?? '';
  p.hidden = !texto;
  const boton = bloque.querySelector('[data-accion]');
  boton.hidden = !url;
  if (url) {
    boton.href = BASE + url;
    boton.querySelector('[data-accion-texto]').textContent = accion;
  }
  bloque.classList.toggle('bloque-vacio', Boolean(texto) && !minutos);
}

// Deja guardadas para usar sin conexión las páginas de hoy (si el modo sin conexión ya está activo).
function guardarParaSinConexion(urls) {
  if (!navigator.serviceWorker?.controller) return;
  for (const u of urls) if (u) fetch(BASE + u).catch(() => {});
}

export function iniciarHoy() {
  const datos = leerDatos('datos-hoy');
  const T = datos.textos;
  const ahora = new Date();
  const fecha = fechaChile(ahora);
  const { modo, elegido, hechos } = preferencias();
  const b = bloquesDeHoy({ capitulos: datos.capitulos, semanas: datos.semanas, fecha, modo, elegido, hechos });
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
      nota.innerHTML = `${esc(T.hoy.conContenido)} ${conContenido.map((c) => `<a href="${BASE}${c.url}">${c.num} · ${esc(c.titulo)}</a>`).join(', ')}`;
      nota.hidden = false;
    }
  }

  const capTitulo = cap ? `${cap.num} · ${cap.titulo}` : '';
  const leccion = b.leccion ? datos.lecciones[b.leccion] : null;
  if (leccion) pintarBloque($('[data-bloque="leccion"]'), { titulo: leccion.titulo, minutos: `${leccion.minutos} ${T.min}`, accion: T.hoy.leer, url: leccion.url });
  else if (b.todoLeido) pintarBloque($('[data-bloque="leccion"]'), { titulo: capTitulo, texto: T.hoy.todoLeido, accion: T.hoy.verFicha, url: cap.ficha });
  else pintarBloque($('[data-bloque="leccion"]'), { titulo: capTitulo, texto: T.hoy.sinLeccion, accion: T.hoy.verCapitulo, url: cap?.url });

  const practica = b.practica ? datos.practicas[b.practica] : null;
  if (practica) pintarBloque($('[data-bloque="practica"]'), { titulo: practica.titulo, minutos: `${practica.minutos} ${T.min}`, accion: T.hoy.abrir, url: practica.url });
  else pintarBloque($('[data-bloque="practica"]'), { titulo: capTitulo, texto: b.todoPracticado ? T.hoy.todoPracticado : T.hoy.sinPractica, accion: T.hoy.verCapitulo, url: cap?.url });

  const tarjetas = b.repaso.map((id) => datos.tarjetas[id]).filter(Boolean);
  if (tarjetas.length) {
    pintarBloque($('[data-bloque="repaso"]'), { titulo: tarjetas[0].frente, minutos: plural(tarjetas.length, T.hoy.tarjetas), accion: T.hoy.responder, url: datos.urls.repaso });
  } else {
    pintarBloque($('[data-bloque="repaso"]'), { titulo: '', texto: T.hoy.sinTarjetas, accion: T.hoy.repasar, url: datos.urls.repaso });
  }

  raiz.dataset.listo = '';
  guardarParaSinConexion([leccion?.url, practica?.url, cap?.url]);
}
