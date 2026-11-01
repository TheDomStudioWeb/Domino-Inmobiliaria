// DOMino Inmobiliaria · seguimientos: una fecha y una nota por consulta o propiedad. Aparecen en «Para hoy» cuando llega el día.
export function chipSeg(DI, iso) {
  const n = DI.dias(iso); if (n === null) return null;
  if (n < 0) return { t: 'Seguimiento atrasado ' + (-n) + (n === -1 ? ' día' : ' días'), k: 'er', n };
  if (n === 0) return { t: 'Seguimiento hoy', k: 'er', n };
  if (n === 1) return { t: 'Seguimiento mañana', k: 'warn', n };
  return { t: 'Seguimiento el ' + DI.fecha(iso), k: n <= 7 ? 'warn' : 'ok', n };
}
// Panel «Seguimiento». o: { DI, item, update(campos), alTerminar(), cerrable } -> devuelve un <details>.
export function panelSeg(o) {
  const { DI, item, update, alTerminar } = o, esc = DI.esc, det = document.createElement('details'); det.className = 'contrato';
  const local = () => { const d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  const dias = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  det.innerHTML = '<summary>Seguimiento</summary>'
    + (item.seg_fecha ? '<p class="meta">Pendiente: <b>' + DI.fecha(item.seg_fecha) + '</b>' + (item.seg_nota ? ' · ' + esc(item.seg_nota) : '') + '</p>' : '<p class="meta">Sin seguimiento programado.</p>')
    + '<div class="field"><label>Volver a contactar el</label><input class="s-f" type="date" value="' + esc(item.seg_fecha || '') + '"></div>'
    + '<div class="field"><label>Qué hay que hacer</label><input class="s-n" autocomplete="off" placeholder="Ej.: Llamar para ver si decidió" value="' + esc(item.seg_nota || '') + '"></div>'
    + '<div class="filtros"><button class="chipbtn s-r" type="button" data-d="1">Mañana</button><button class="chipbtn s-r" type="button" data-d="3">En 3 días</button><button class="chipbtn s-r" type="button" data-d="7">En una semana</button></div>'
    + '<button class="btn sm s-ok" type="button">Guardar seguimiento</button>'
    + (item.seg_fecha ? ' <button class="btn line sm s-hecho" type="button">Ya lo hice</button>' : '')
    + (o.cerrable ? ' <button class="btn line sm s-cerrar" type="button">Cerrar consulta</button>' : '')
    + '<p class="msg s-m" role="status"></p>';
  const q = c => det.querySelector('.' + c), msg = (t, k) => { q('s-m').className = 'msg s-m ' + (k || ''); q('s-m').textContent = t; };
  det.querySelectorAll('.s-r').forEach(b => b.onclick = () => { q('s-f').value = dias(+b.dataset.d); });
  const guardar = async (campos) => { try { await update(campos); alTerminar(); } catch (e) { msg('No se pudo guardar (' + (e.code || e.message) + ').', 'er'); } };
  q('s-ok').onclick = () => { const f = q('s-f').value; if (!f) return msg('Elija la fecha del seguimiento.', 'er'); if (f < local() && f !== item.seg_fecha) return msg('La fecha ya pasó.', 'er'); guardar({ seg_fecha: f, seg_nota: q('s-n').value.trim() }); };
  if (q('s-hecho')) q('s-hecho').onclick = () => guardar({ seg_fecha: '', seg_nota: '', seg_ultimo: local() });
  if (q('s-cerrar')) q('s-cerrar').onclick = () => guardar({ cerrado: true, seg_fecha: '', seg_nota: '', seg_ultimo: local() });
  return det;
}
