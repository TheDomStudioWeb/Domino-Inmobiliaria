// DOMino Inmobiliaria · capa de datos. Las pantallas piden propiedades y leads sin saber de dónde vienen:
//  · modo demostración → el propio teléfono (localStorage, vía app.js)
//  · modo real         → Firestore, bajo negocios/{id}/…  (solo el equipo de esa inmobiliaria lo ve)
import { db, abrirSesion, salirConAviso, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc, serverTimestamp, query, where } from './fb.js';

const MODO = 'domino_inmo_modo';
export const esDemo = () => { try { return sessionStorage.getItem(MODO) === 'demo'; } catch (e) { return false; } };
export function entrarDemo() { try { sessionStorage.setItem(MODO, 'demo'); } catch (e) {} location.href = 'dashboard.html'; }
export function salirDemo() { try { sessionStorage.removeItem(MODO); } catch (e) {} }

const iniciales = (t) => String(t || '').trim().split(/\s+/).slice(0, 2).map(x => x[0] || '').join('').toUpperCase() || 'AG';
const hoy = () => Date.now();

// Devuelve el contexto de la pantalla o null si no puede entrar (ya redirigió).
export async function iniciar() {
  if (esDemo()) {
    const DI = window.DI;
    return {
      demo: true, nombre: 'Demostración', iniciales: 'AG', rol: 'semisenior', esSenior: false, esSuperadmin: false, vence: null, mail: 'demo', equipo: async () => [], config: {}, firma: '',
      actualizarProp: async (id, campos) => { const d = DI.load(); const p = d.props.find(x => x.id === id); if (p) Object.assign(p, campos); DI.save(d); },
      props: async () => DI.load().props, leads: async () => DI.load().leads,
      agregarProp: async (p) => { const d = DI.load(); d.props.unshift(Object.assign({ id: 'n' + hoy() }, p)); if (!DI.save(d)) { d.props[0].img = ''; if (!DI.save(d)) throw new Error('No se pudo guardar en este teléfono.'); } },
      actualizarLead: async () => {},
      fichas: async () => DI.load().fichas,
      agregarFicha: async (f) => { const d = DI.load(); const id = 'f' + hoy(); d.fichas.unshift(Object.assign({ id }, f)); DI.save(d); return { id }; },
      actualizarFicha: async (id, campos) => { const d = DI.load(); const f = d.fichas.find(x => x.id === id); if (f) Object.assign(f, campos); DI.save(d); },
      borrarFicha: async (id) => { const d = DI.load(); d.fichas = d.fichas.filter(x => x.id !== id); d.props.forEach(p => { if (p.propietario_id === id) delete p.propietario_id; if (p.inquilino_id === id) delete p.inquilino_id; }); DI.save(d); },
      agregarLead: async (l) => { const d = DI.load(); d.leads.unshift(Object.assign({ id: 'l' + hoy() }, l)); DI.save(d); },
      reiniciar: async () => DI.reset(),
      salir: async () => { salirDemo(); location.href = 'index.html'; }
    };
  }
  const s = await abrirSesion();
  if (!s) return null;
  const base = ['negocios', s.negocioId];
  const DI = window.DI;
  let config = {};
  try { const c = await getDoc(doc(db, ...base, 'config', 'general')); if (c.exists()) config = c.data(); } catch (e) {}
  const nombreCom = config.nombre_comercial || s.negocio.nombre || 'Inmobiliaria';
  // Firma de los mensajes de WhatsApp: nombre comercial y, si está cargado, el WhatsApp de la inmobiliaria.
  const firma = nombreCom + (config.telefono ? ' · WhatsApp ' + config.telefono.replace(/^549/, '') : '');
  const senior = s.perfil.rol_jerarquia === 'senior';
  const ms = (c) => (c && c.toMillis ? c.toMillis() : 0);
  // La Dirección lee todo; Corredor y Gestor, solo lo que captaron o se les asignó (dos consultas, sin índices compuestos).
  const leer = async (col) => {
    const ref = collection(db, ...base, col), mapa = new Map();
    const juntar = (r) => r.forEach(d => mapa.set(d.id, Object.assign({ id: d.id }, d.data())));
    if (senior) juntar(await getDocs(ref));
    else { juntar(await getDocs(query(ref, where('creado_por', '==', s.mail)))); juntar(await getDocs(query(ref, where('asignado', '==', s.mail)))); }
    return [...mapa.values()].sort((x, y) => ms(y.creado) - ms(x.creado));
  };
  const nuevo = (extra) => Object.assign({}, extra, { creado: serverTimestamp(), creado_por: s.mail, asignado: (senior && extra.asignado) || s.mail });
  return {
    demo: false, nombre: nombreCom, config, firma, iniciales: iniciales(s.perfil.nombre_display), rol: s.perfil.rol_jerarquia, mail: s.mail, esSenior: senior,
    esSuperadmin: s.esSuperadmin, vence: s.negocio.estado === 'prueba' ? s.negocio.vence : null, sesion: s,
    props: () => leer('props'), leads: () => leer('leads'),
    agregarProp: (p) => addDoc(collection(db, ...base, 'props'), nuevo(p)),
    actualizarProp: (id, campos) => updateDoc(doc(db, ...base, 'props', id), campos),
    equipo: async () => { const r = await getDocs(query(collection(db, 'users'), where('negocio_id', '==', s.negocioId))), f = []; r.forEach(d => { const u = d.data(); if (u.activo !== false) f.push({ email: d.id, nombre: u.nombre_display || d.id, rol: u.rol_jerarquia }); }); return f; },
    agregarLead: (l) => addDoc(collection(db, ...base, 'leads'), nuevo(l)),
    // Fichas de propietarios e inquilinos (colección «personas»; el equipo de la inmobiliaria usa «personas» para otra cosa en pantalla, por eso acá se llaman fichas).
    fichas: () => leer('personas'),
    agregarFicha: async (f) => { const r = await addDoc(collection(db, ...base, 'personas'), nuevo(f)); return { id: r.id }; },
    actualizarFicha: (id, campos) => updateDoc(doc(db, ...base, 'personas', id), campos),
    borrarFicha: (id) => deleteDoc(doc(db, ...base, 'personas', id)),
    actualizarLead: (id, campos) => updateDoc(doc(db, ...base, 'leads', id), campos),
    guardarConfig: async (c) => { await setDoc(doc(db, ...base, 'config', 'general'), c, { merge: true }); config = Object.assign({}, config, c); },
    reiniciar: async () => {},
    salir: async () => { await salirConAviso(''); }
  };
}
