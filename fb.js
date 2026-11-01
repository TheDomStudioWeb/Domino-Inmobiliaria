// DOMino Inmobiliaria · conexión con Firebase y sesión de la inmobiliaria.
// Las claves de abajo identifican el proyecto; no son secretas. Lo que protege los datos son las reglas de Firestore (firestore.rules).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, initializeAuth, inMemoryPersistence, browserSessionPersistence, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, sendPasswordResetEmail, createUserWithEmailAndPassword }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc, query, orderBy, where, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const CFG = {
  apiKey: "AIzaSyAvrzZ4j4RJ3xLDzbqsggzOynLvXWq7pdc",
  authDomain: "domino-inmobiliaria.firebaseapp.com",
  projectId: "domino-inmobiliaria",
  storageBucket: "domino-inmobiliaria.firebasestorage.app",
  messagingSenderId: "293113412774",
  appId: "1:293113412774:web:ba0428086fc1306cb88867"
};

export const app = initializeApp(CFG);
// Sesión guardada en el almacenamiento simple del navegador (localStorage): más liviana y sin la base interna de Firebase,
// que en algunos teléfonos se traba. Si no hay almacenamiento, la sesión dura mientras la pestaña esté abierta.
export const auth = initializeAuth(app, { persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence] });
// Cuenta auxiliar (alta de personas sin cerrar la sesión de la Dirección): solo en memoria.
export const authSecundaria = (a) => initializeAuth(a, { persistence: inMemoryPersistence });
export const db = getFirestore(app);
export { initializeApp, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, sendPasswordResetEmail, createUserWithEmailAndPassword,
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc, query, orderBy, where, serverTimestamp };

const MENSAJES_SALIDA = 'domino_inmo_aviso';

// Cierra la sesión y vuelve al ingreso con un aviso.
export async function salirConAviso(texto) {
  try { sessionStorage.setItem(MENSAJES_SALIDA, texto || ''); } catch (e) {}
  try { await signOut(auth); } catch (e) {}
  location.replace('index.html');
}
export function avisoPendiente() {
  try { const t = sessionStorage.getItem(MENSAJES_SALIDA); sessionStorage.removeItem(MENSAJES_SALIDA); return t || ''; } catch (e) { return ''; }
}

// Espera a que Firebase diga quién está dentro (o nadie).
export function usuarioActual() {
  return new Promise(res => { const off = onAuthStateChanged(auth, u => { off(); res(u); }); });
}

// Devuelve { user, perfil, negocioId, negocio:{nombre,estado,vence(ms)}, esSuperadmin } o null si no puede entrar (ya avisó y redirigió).
export async function abrirSesion() {
  const user = await usuarioActual();
  if (!user) { location.replace('index.html'); return null; }
  const mail = String(user.email || '').toLowerCase();
  let ps = null;
  try { ps = await getDoc(doc(db, 'users', mail)); } catch (e) { console.error(e); }
  if (!ps || !ps.exists()) { await salirConAviso('Su usuario todavía no tiene un perfil asignado. Contacte a The DOM Studio Web.'); return null; }
  const perfil = ps.data();
  if (perfil.activo === false) { await salirConAviso('Su acceso está dado de baja. Contacte a la Dirección de su inmobiliaria.'); return null; }
  if (!perfil.negocio_id) { await salirConAviso('Su usuario todavía no tiene una inmobiliaria asignada. Contacte a The DOM Studio Web.'); return null; }

  let ns = null;
  try { ns = await getDoc(doc(db, 'negocios', perfil.negocio_id)); } catch (e) { console.error(e); }
  if (!ns || !ns.exists()) { await salirConAviso('No encontramos la inmobiliaria de su cuenta. Contacte a The DOM Studio Web.'); return null; }
  let neg = ns.data();
  const ahora = Date.now();
  let venceMs = neg.vence && neg.vence.toMillis ? neg.vence.toMillis() : null;
  if (neg.estado === 'suspendido') { await salirConAviso('El acceso de esta inmobiliaria está suspendido. Contacte a The DOM Studio Web.'); return null; }
  if (neg.estado === 'prueba' && venceMs && venceMs < ahora) { await salirConAviso('La semana de prueba terminó. Contacte a The DOM Studio Web para continuar.'); return null; }
  // La semana de prueba empieza en el primer ingreso de la Dirección (las reglas la limitan a 7 días).
  if (neg.estado === 'prueba' && !venceMs && perfil.rol_jerarquia === 'senior') {
    try {
      const dias = Math.min(Number(neg.dias_prueba) || 7, 7);
      const hasta = new Date(ahora + dias * 86400000 - 60000);
      await updateDoc(doc(db, 'negocios', perfil.negocio_id), { vence: hasta });
      venceMs = hasta.getTime();
    } catch (e) { console.warn('No se pudo fijar el vencimiento de la prueba', e); }
  }
  let esSuperadmin = false;
  try { esSuperadmin = (await getDoc(doc(db, 'superadmins', mail))).exists(); } catch (e) {}
  return { user, mail, perfil, negocioId: perfil.negocio_id, esSuperadmin,
    negocio: { nombre: neg.nombre || '', estado: neg.estado || 'activo', vence: venceMs } };
}
