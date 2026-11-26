// DOMino Inmobiliaria · plano 3D de una propiedad.
//  · plano.html?p=<id de la propiedad> → editor (solo la Dirección guarda y publica; Corredor y Gestor lo ven si tienen acceso a la propiedad)
//  · plano.html?t=<código público>     → vista para clientes, sin ingreso: recorrer el plano y consultar por WhatsApp
// El editor (DOMino Planos 3D) vive en plano.html y se maneja con window.P3D.
import { db, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from './fb.js';
import { iniciar } from './datos.js';

const P3D = window.P3D, DI = window.DI;
const $ = (s) => document.querySelector(s);
const qs = new URLSearchParams(location.search);
const BASE_PUBLICA = 'https://domino-inmobiliaria.web.app/plano.html?t=';
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Barra superior propia de la inmobiliaria (arriba del editor).
const wrap = $('.wrap');
const bar = document.createElement('div');
bar.className = 'proj inmo';
wrap.insertBefore(bar, wrap.querySelector('.viewbar'));
$('.sub').style.display = 'none';
$('#sample').style.display = 'none';
const nota = document.querySelector('.note:last-of-type');
if (nota) nota.textContent = 'Plano ilustrativo para mostrar la distribución. No reemplaza la documentación de un arquitecto.';
const aviso = (t, k) => { const m = $('#inmo-m'); if (m) { m.textContent = t; m.style.color = k === 'er' ? 'var(--bad)' : ''; } };

async function vistaPublica(token) {
  $('h1').textContent = 'Plano de la propiedad';
  bar.innerHTML = '<p class="cloud" id="inmo-m">Cargando…</p>';
  let d = null;
  try { const s = await getDoc(doc(db, 'planos_publicos', token)); if (s.exists()) d = s.data(); } catch (e) { console.error(e); }
  if (!d) { bar.innerHTML = '<p>Este plano no está disponible. Puede que la inmobiliaria lo haya despublicado.</p>'; return; }
  let datos = null; try { datos = JSON.parse(d.data); } catch (e) {}
  $('h1').textContent = String(d.titulo || 'Propiedad');
  const tel = DI && DI.tel ? DI.tel(d.telefono || '') : '';
  bar.innerHTML = '<div><b>' + esc(d.inmobiliaria || '') + '</b>' + (d.operacion ? ' · ' + esc(d.operacion) : '') + '</div>'
    + '<p class="cloud">Mirá la distribución, recorré la casa con «Recorrer» y descargá el PDF.</p>'
    + (tel ? '<div class="bar" style="margin:8px 0 0"><a class="btn-file" id="wa" target="_blank" rel="noopener">Consultar por WhatsApp</a></div>' : '');
  if (tel) $('#wa').href = 'https://wa.me/' + tel + '?text=' + encodeURIComponent('Hola, vi el plano de «' + (d.titulo || 'la propiedad') + '» y quiero hacer una consulta.');
  P3D.load(datos, { viewer: true, noCopy: true, name: String(d.titulo || 'Propiedad'), title: String(d.titulo || 'Propiedad') });
}

async function editor(pid) {
  const ctx = await iniciar();
  if (!ctx) return;
  const props = await ctx.props().catch(() => []);
  const prop = props.find((x) => x.id === pid);
  if (!prop) { bar.innerHTML = '<p>No encontramos esa propiedad o no tiene acceso a ella.</p><a class="btn-file" href="dashboard.html">Volver al panel</a>'; return; }
  $('h1').textContent = String(prop.titulo || 'Propiedad');
  const puedeEditar = ctx.demo || ctx.esSenior;
  const claveDemo = 'domino_inmo_plano_' + pid;
  const ref = ctx.demo ? null : doc(db, 'negocios', ctx.sesion.negocioId, 'planos', pid);
  let info = {}, datos = null, sinGuardar = false;
  try {
    if (ctx.demo) { const t = localStorage.getItem(claveDemo); if (t) info = { data: t }; }
    else { const s = await getDoc(ref); if (s.exists()) info = s.data(); }
    if (info.data) datos = JSON.parse(info.data);
  } catch (e) { console.error(e); aviso('No se pudo leer el plano guardado (' + (e.code || e.message) + ').', 'er'); }

  bar.innerHTML = '<div class="bar" style="margin:0"><a class="btn-file" href="dashboard.html" style="background:transparent;color:var(--goldt)">← Panel</a>'
    + (puedeEditar ? '<button id="g">Guardar plano</button><button class="ghost" id="pub"></button>' : '') + '</div>'
    + '<p class="cloud" id="inmo-m"></p><div class="share" id="lnk"></div>';
  P3D.setName(String(prop.titulo || 'Propiedad'));
  if (!puedeEditar) {
    if (!datos) { aviso('Esta propiedad todavía no tiene plano. Lo carga la Dirección.'); }
    P3D.load(datos, { viewer: true, noCopy: true, name: String(prop.titulo || 'Propiedad'), title: String(prop.titulo || 'Propiedad') });
    return;
  }
  P3D.load(datos, { name: String(prop.titulo || 'Propiedad') });
  aviso(datos ? 'Plano cargado.' : 'Todavía no hay plano: dibujalo o cargá uno de ejemplo y guardalo.');
  P3D.onChange = () => { sinGuardar = true; aviso('Hay cambios sin guardar.'); };

  const publico = () => !!info.token;
  const pintarPub = () => {
    $('#pub').textContent = publico() ? 'Dejar de publicar' : 'Publicar para clientes';
    const l = $('#lnk');
    if (!publico()) { l.classList.remove('show'); l.innerHTML = ''; return; }
    const url = BASE_PUBLICA + info.token;
    l.innerHTML = 'Link para clientes (sin ingreso). Se actualiza cada vez que guarda el plano:<code></code><div class="bar"><button class="ghost" id="cp">Copiar link</button><a class="btn-file" id="wa2" target="_blank" rel="noopener">Enviar por WhatsApp</a></div>';
    l.querySelector('code').textContent = url;
    $('#wa2').href = 'https://wa.me/?text=' + encodeURIComponent('Te comparto el plano de «' + (prop.titulo || 'la propiedad') + '»: ' + url);
    $('#cp').onclick = () => navigator.clipboard.writeText(url).then(() => aviso('Link copiado.'), () => aviso('Copie el link de arriba.'));
    l.classList.add('show');
  };
  const copiaPublica = (data) => ({
    negocio_id: ctx.sesion.negocioId, prop_id: pid, titulo: String(prop.titulo || ''), operacion: String(prop.operacion || ''),
    inmobiliaria: ctx.nombre || '', telefono: (ctx.config && ctx.config.telefono) || '', data, actualizado: serverTimestamp()
  });
  async function guardar() {
    const data = JSON.stringify(P3D.data());
    if (data.length > 850000) throw new Error('El plano es demasiado grande para guardarlo.');
    if (ctx.demo) { localStorage.setItem(claveDemo, data); info.data = data; return; }
    info = Object.assign({}, info, { data, actualizado: serverTimestamp(), por: ctx.mail });
    await setDoc(ref, info);
    if (info.token) await setDoc(doc(db, 'planos_publicos', info.token), copiaPublica(data));
  }
  $('#g').onclick = async () => {
    aviso('Guardando…');
    try { await guardar(); sinGuardar = false; aviso('Plano guardado' + (publico() ? ' y actualizado en el link para clientes.' : '.')); }
    catch (e) { aviso('No se pudo guardar (' + (e.code || e.message) + ').', 'er'); }
  };
  $('#pub').onclick = async () => {
    if (ctx.demo) { aviso('En la demostración no se publican links. Funciona con una inmobiliaria real.'); return; }
    try {
      if (publico()) {
        await deleteDoc(doc(db, 'planos_publicos', info.token));
        delete info.token; await setDoc(ref, info); aviso('El plano ya no está publicado.');
      } else {
        const a = new Uint8Array(12); crypto.getRandomValues(a);
        info.token = Array.from(a, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 20);
        await guardar(); sinGuardar = false; aviso('Publicado. Ya puede mandar el link.');
      }
      pintarPub();
    } catch (e) { aviso('No se pudo cambiar la publicación (' + (e.code || e.message) + ').', 'er'); }
  };
  pintarPub();
  addEventListener('beforeunload', (e) => { if (sinGuardar) { e.preventDefault(); e.returnValue = ''; } });
}

if (qs.get('t')) vistaPublica(qs.get('t'));
else if (qs.get('p')) editor(qs.get('p'));
else location.replace('dashboard.html');
