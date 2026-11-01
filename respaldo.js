// DOMino Inmobiliaria · copia de seguridad: una planilla de Excel con todo lo cargado (sin fotos). Se arma en el teléfono.
let lib;
const cargar = () => lib || (lib = new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'libs/xlsx.core.min.js'; s.onload = ok; s.onerror = () => no(new Error('No se pudo cargar la librería de Excel. Revise la conexión.')); document.head.appendChild(s); }));
const fh = (c) => { if (!c) return ''; const d = c.toDate ? c.toDate() : new Date(c); return isNaN(d) ? '' : d.toLocaleDateString('es-AR'); };
const fecha = (iso) => iso ? iso.split('-').reverse().join('/') : '';

export async function respaldo(ctx, DI) {
  await cargar();
  const [props, leads, fichas] = await Promise.all([ctx.props(), ctx.leads(), ctx.fichas()]);
  let eq = []; try { eq = await ctx.equipo(); } catch (e) {}
  const nom = {}; eq.forEach(u => nom[u.email] = u.nombre);
  const fx = {}; fichas.forEach(f => fx[f.id] = f);
  const a = (m) => nom[m] || m || '';
  const hojaProp = props.map(p => ({
    'Propiedad': p.titulo, 'Operación': p.operacion || '', 'Estado': p.estado || '', 'Propietario': p.propietario || '', 'WhatsApp propietario': p.propietario_tel || '',
    'Inquilino': (fx[p.inquilino_id] || {}).nombre || '', 'Contrato desde': fecha(p.contrato_inicio), 'Contrato vence': fecha(p.contrato_vence),
    'Alquiler actual': p.alq_monto || '', 'Ajuste cada (meses)': p.alq_ajuste_meses || '', 'Índice': p.alq_indice || '', 'Último ajuste': fecha(p.alq_ultimo_ajuste), 'Próximo ajuste': fecha(DI.proxAjuste(p)),
    'Seguimiento': fecha(p.seg_fecha), 'Nota de seguimiento': p.seg_nota || '', 'A cargo de': a(p.asignado), 'Captada': fh(p.creado)
  }));
  const hojaPer = fichas.map(f => ({ 'Tipo': f.tipo, 'Nombre': f.nombre, 'WhatsApp': f.telefono || '', 'Correo': f.email || '', 'DNI': f.dni || '', 'Domicilio': f.domicilio || '', 'Notas': f.notas || '', 'A cargo de': a(f.asignado) }));
  const hojaLead = leads.map(l => ({ 'Nombre': l.nombre, 'WhatsApp': l.telefono || '', 'Consulta': l.detalle || '', 'Seguimiento': fecha(l.seg_fecha), 'Nota': l.seg_nota || '', 'A cargo de': a(l.asignado), 'Registrada': fh(l.creado) }));
  const hojaAj = []; props.forEach(p => (p.alq_historial || []).forEach(h => hojaAj.push({ 'Propiedad': p.titulo, 'Rige desde': fecha(h.fecha), 'Alquiler anterior': h.desde, 'Alquiler nuevo': h.hasta, 'Variación %': Math.round(h.pct * 100) / 100, 'Detalle': h.nota || '' })));
  const wb = XLSX.utils.book_new();
  [['Propiedades', hojaProp], ['Personas', hojaPer], ['Consultas', hojaLead], ['Ajustes de alquiler', hojaAj]].forEach(([n, d]) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d.length ? d : [{ 'Sin datos': '' }]), n));
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const hoy = new Date(), nombre = 'Respaldo ' + (ctx.nombre || 'inmobiliaria').replace(/[\\/:*?"<>|]+/g, ' ') + ' ' + hoy.getFullYear() + '-' + ('0' + (hoy.getMonth() + 1)).slice(-2) + '-' + ('0' + hoy.getDate()).slice(-2) + '.xlsx';
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const l = document.createElement('a'); l.href = url; l.download = nombre; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
  return props.length + ' propiedades, ' + fichas.length + ' personas y ' + leads.length + ' consultas';
}
