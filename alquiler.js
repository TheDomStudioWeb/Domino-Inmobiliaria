// DOMino Inmobiliaria · alquileres: valor, ajuste periódico por IPC (traído o a mano) e historial.
// El IPC se pide a la API de series de tiempo del Estado (datos.gob.ar, datos del INDEC). El código de la serie está acá arriba para poder
// cambiarlo; la pantalla siempre muestra qué serie es y cuál es el último mes disponible, y el porcentaje se puede escribir a mano.
export const IPC_SERIE = '101.1_I2NG_2016_M_22';
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const mesTexto = (ym) => { const p = String(ym).split('-'); return (MESES[+p[1] - 1] || p[1]) + ' ' + p[0]; };
export const dinero = (n) => '$ ' + Math.round(Number(n) || 0).toLocaleString('es-AR');
// «1.250.000» o «1250000,50» -> número. Vacío o inválido -> null.
export const aMonto = (t) => { const s = String(t == null ? '' : t).replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.'); const n = parseFloat(s); return isFinite(n) && n > 0 ? n : null; };
// «3,2» o «3.2» -> 3.2 (admite negativos). Vacío o inválido -> null.
export const aPorc = (t) => { const s = String(t == null ? '' : t).trim().replace(',', '.'); if (!/^-?\d+(\.\d+)?$/.test(s)) return null; return parseFloat(s); };
// Variación acumulada de varios meses: se multiplican, no se suman.
export const acumular = (pcts) => (pcts.reduce((a, x) => a * (1 + x / 100), 1) - 1) * 100;

export async function traerIPC(serie, cant) {
  const url = 'https://apis.datos.gob.ar/series/api/series/?ids=' + (serie || IPC_SERIE) + ':percent_change&limit=' + (cant || 8) + '&sort=desc&format=json';
  const c = new AbortController(), t = setTimeout(() => c.abort(), 15000);
  try {
    const r = await fetch(url, { signal: c.signal }); if (!r.ok) throw new Error('http ' + r.status);
    const j = await r.json();
    const meses = (j.data || []).map(x => ({ mes: String(x[0]).slice(0, 7), pct: x[1] * 100 })).filter(x => isFinite(x.pct));
    if (!meses.length) throw new Error('sin datos');
    const f = j.meta && j.meta[1] && j.meta[1].field;
    return { meses, desc: (f && f.description) || '' };
  } finally { clearTimeout(t); }
}

// Estado del próximo ajuste (para chips y avisos).
export function chipAjuste(DI, iso) {
  const n = DI.dias(iso); if (n === null) return null;
  if (n < 0) return { t: 'Ajuste atrasado ' + (-n) + (n === -1 ? ' día' : ' días'), k: 'er', n };
  if (n === 0) return { t: 'Ajuste hoy', k: 'er', n };
  if (n <= 30) return { t: 'Ajuste en ' + n + (n === 1 ? ' día' : ' días'), k: 'warn', n };
  return { t: 'Próximo ajuste el ' + DI.fecha(iso), k: 'ok', n };
}

// Panel «Ajustar alquiler» de una propiedad. Devuelve un <details>.
export function panelAjuste(p, o) {
  const { DI, ctx, nombreInquilino, telInquilino, alTerminar } = o, esc = DI.esc;
  const prox = DI.proxAjuste(p), det = document.createElement('details'); det.className = 'contrato';
  const hist = (p.alq_historial || []).slice().reverse();
  det.innerHTML = '<summary>Ajustar alquiler</summary>'
    + '<p class="meta">Alquiler actual: <b>' + dinero(p.alq_monto) + '</b>' + (p.alq_ajuste_meses ? ' · ajuste cada ' + p.alq_ajuste_meses + ' meses' : '') + (p.alq_indice ? ' (' + esc(p.alq_indice) + ')' : '') + (prox ? '<br>Ajuste programado: ' + DI.fecha(prox) : '') + '</p>'
    + '<button class="btn line sm a-ipc" type="button">Traer IPC</button><div class="a-lista"></div>'
    + '<div class="field"><label>Variación acumulada (%)</label><input class="a-pct" inputmode="decimal" autocomplete="off" placeholder="Ej.: 6,4"></div>'
    + '<div class="field"><label>Nuevo alquiler ($)</label><input class="a-nuevo" inputmode="numeric" autocomplete="off"></div>'
    + '<div class="field"><label>Rige desde</label><input class="a-fecha" type="date" value="' + esc(prox || '') + '"></div>'
    + '<button class="btn sm a-ok" type="button">Confirmar ajuste</button><p class="msg a-m" role="status"></p>'
    + (hist.length ? '<p class="meta" style="margin-top:8px"><b>Ajustes anteriores</b></p>' + hist.map(h => '<p class="meta">' + DI.fecha(h.fecha) + ' · ' + dinero(h.desde) + ' → ' + dinero(h.hasta) + ' (' + (h.pct >= 0 ? '+' : '') + String(Math.round(h.pct * 100) / 100).replace('.', ',') + '%)</p>').join('') : '');
  const q = c => det.querySelector('.' + c), msg = (t, k) => { q('a-m').className = 'msg a-m ' + (k || ''); q('a-m').textContent = t; };
  let usados = '';
  const recalcular = () => { const v = aPorc(q('a-pct').value); if (v !== null && p.alq_monto) q('a-nuevo').value = Math.round(p.alq_monto * (1 + v / 100)); };
  q('a-pct').addEventListener('input', () => { usados = ''; recalcular(); });
  const desdeLista = () => {
    const marcados = [...det.querySelectorAll('.a-lista input:checked')]; if (!marcados.length) return;
    const pct = acumular(marcados.map(x => parseFloat(x.value)));
    usados = marcados.map(x => x.dataset.mes).reverse().join(', ');
    q('a-pct').value = String(Math.round(pct * 100) / 100).replace('.', ','); recalcular();
  };
  q('a-ipc').onclick = async () => {
    const b = q('a-ipc'); b.disabled = true; b.textContent = 'Buscando…'; msg('');
    try {
      const r = await traerIPC();
      const hoy = new Date(), ultimo = r.meses[0].mes.split('-'), atraso = (hoy.getFullYear() - +ultimo[0]) * 12 + (hoy.getMonth() + 1 - +ultimo[1]);
      q('a-lista').innerHTML = '<p class="meta" style="margin:8px 0">Serie: ' + esc(r.desc || IPC_SERIE) + '.<br>Último dato disponible: <b>' + mesTexto(r.meses[0].mes) + '</b>. ' + (atraso > 2 ? '<span style="color:var(--er)">Hay datos más nuevos del INDEC que esta serie todavía no incluye: cargue el porcentaje a mano si hace falta.</span> ' : '')
        + 'Elija los meses que corresponden según el contrato.</p>'
        + r.meses.slice(0, 6).map((m, i) => '<label style="display:flex;gap:10px;align-items:center;min-height:40px"><input type="checkbox" data-mes="' + mesTexto(m.mes) + '" value="' + m.pct + '"' + (i < 3 ? ' checked' : '') + '> ' + mesTexto(m.mes) + ': ' + String(Math.round(m.pct * 100) / 100).replace('.', ',') + ' %</label>').join('');
      det.querySelectorAll('.a-lista input').forEach(x => x.addEventListener('change', desdeLista)); desdeLista();
    } catch (e) { msg('No se pudo traer el IPC. Cargue el porcentaje a mano.', 'er'); }
    b.disabled = false; b.textContent = 'Traer IPC';
  };
  q('a-ok').onclick = async () => {
    const pct = aPorc(q('a-pct').value), nuevo = aMonto(q('a-nuevo').value), fecha = q('a-fecha').value;
    if (pct === null) return msg('Escriba la variación acumulada en porcentaje (por ejemplo 6,4) o traiga el IPC.', 'er');
    if (!nuevo) return msg('Revise el nuevo alquiler.', 'er');
    if (!fecha) return msg('Elija desde qué fecha rige el nuevo valor.', 'er');
    const reg = { fecha, desde: p.alq_monto, hasta: nuevo, pct, nota: (p.alq_indice || '') + (usados ? ' · ' + usados : '') };
    try { await ctx.actualizarProp(p.id, { alq_monto: nuevo, alq_ultimo_ajuste: fecha, alq_historial: (p.alq_historial || []).concat([reg]) }); }
    catch (err) { return msg('No se pudo guardar (' + (err.code || err.message) + ').', 'er'); }
    alTerminar(reg);
  };
  return det;
}
