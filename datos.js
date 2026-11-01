// DOMino Inmobiliaria · capa de datos. Las pantallas piden propiedades y leads sin saber de dónde vienen:
//  · modo demostración → el propio teléfono (localStorage, vía app.js)
//  · modo real         → Firestore, bajo negocios/{id}/…  (solo el equipo de esa inmobiliaria lo ve)
import { db, abrirSesion, salirConAviso, doc, getDoc, setDoc, collection, getDocs, addDoc, serverTimestamp, query, orderBy } from './fb.js';

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
      demo: true, nombre: 'Demostración', iniciales: 'AG', esSenior: false, esSuperadmin: false, vence: null,
      props: async () => DI.load().props, leads: async () => DI.load().leads,
      agregarProp: async (p) => { const d = DI.load(); d.props.unshift(Object.assign({ id: 'n' + hoy() }, p)); if (!DI.save(d)) { d.props[0].img = ''; if (!DI.save(d)) throw new Error('No se pudo guardar en este teléfono.'); } },
      agregarLead: async (l) => { const d = DI.load(); d.leads.unshift(Object.assign({ id: 'l' + hoy() }, l)); DI.save(d); },
      reiniciar: async () => DI.reset(),
      salir: async () => { salirDemo(); location.href = 'index.html'; }
    };
  }
  const s = await abrirSesion();
  if (!s) return null;
  const base = ['negocios', s.negocioId];
  const DI = window.DI;
  try { const c = await getDoc(doc(db, ...base, 'config', 'general')); if (c.exists() && c.data().telefono) DI.setWA(c.data().telefono); } catch (e) {}
  const leer = async (col) => {
    const q = query(collection(db, ...base, col), orderBy('creado', 'desc'));
    const r = await getDocs(q); const f = []; r.forEach(d => f.push(Object.assign({ id: d.id }, d.data()))); return f;
  };
  return {
    demo: false, nombre: s.negocio.nombre || 'Inmobiliaria', iniciales: iniciales(s.perfil.nombre_display), esSenior: s.perfil.rol_jerarquia === 'senior',
    esSuperadmin: s.esSuperadmin, vence: s.negocio.estado === 'prueba' ? s.negocio.vence : null, sesion: s,
    props: () => leer('props'), leads: () => leer('leads'),
    agregarProp: (p) => addDoc(collection(db, ...base, 'props'), Object.assign({}, p, { creado: serverTimestamp(), creado_por: s.mail })),
    agregarLead: (l) => addDoc(collection(db, ...base, 'leads'), Object.assign({}, l, { creado: serverTimestamp(), creado_por: s.mail })),
    reiniciar: async () => {},
    salir: async () => { await salirConAviso(''); }
  };
}
