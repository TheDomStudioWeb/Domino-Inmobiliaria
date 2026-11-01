# DOMino Inmobiliaria

PWA de captación de propiedades y seguimiento para agentes inmobiliarios. **Versión de demostración**, sin marca de ninguna inmobiliaria: se personaliza por cliente.

Desarrollado por [The DOM Studio Web](https://thedomstudioweb.github.io/) · WhatsApp 261-3431216 · thedomstudioweb@gmail.com

## Qué hay en este repositorio

| Ruta | Qué es |
|---|---|
| `index.html` | Ingreso de agentes (demo: no hay cuentas reales) |
| `dashboard.html` | Panel: resumen, propiedades en gestión, leads, aviso al propietario por WhatsApp |
| `captura.html` | Captación: foto con la cámara, dirección y tipo de operación |
| `equipo.html` | Alta y baja de personas del equipo (solo Dirección) |
| `centros/` | Alta de inmobiliarias y su director/a (solo superadmins de The DOM) |
| `fb.js` / `datos.js` | Conexión con Firebase, sesión de la inmobiliaria y capa de datos (demo local o Firestore) |
| `firestore.rules` | Reglas de seguridad: cada inmobiliaria ve solo lo suyo |
| `app.css` / `app.js` | Estilo (kit Premium-Noir de The DOM) y lógica compartida (datos locales, foto reducida, WhatsApp) |
| `manifest.json` / `sw.js` | Instalación como app y funcionamiento sin conexión |
| `imagenes/` | Logo, íconos y fotos de ejemplo |
| `sitio/` | Sitio web comercial de demostración (tasación online, propiedades, contacto) |

## Modo real y modo demostración
- **Real:** ingreso con correo y contraseña (Firebase Auth). Los datos viven en Firestore bajo `negocios/{id}/…` y solo los ve el equipo de esa inmobiliaria. Cada inmobiliaria arranca con 1 semana de prueba desde el primer ingreso de su Dirección.
- **Demostración:** botón «Recorrer la demostración» del ingreso; datos de ejemplo solo en el teléfono.

## Cómo funciona la demo
- Los datos (propiedades, leads, fotos) se guardan **solo en el teléfono** (localStorage). «Restablecer datos de ejemplo» vuelve al inicio.
- Los avisos de WhatsApp abren `wa.me` con el mensaje armado; en la demo llegan al estudio.
- Propiedades y leads son inventados; las fotos son de banco de imágenes.

## Publicar
GitHub Pages: Settings → Pages → Deploy from a branch → `main` / root. Al cambiar archivos de la app, subir también `VERSION` en `sw.js`.

## Próximos pasos (producto real)
Ingreso real y datos por centro (Firebase Auth + Firestore), alta de centros con prueba de 1 semana, roles administrador/agente/propietario/inquilino, portal del cliente, documentos, vencimientos y ajustes de alquiler, agenda de visitas. Reutiliza módulos de DOMino Profesional, Veterinaria y Bienestar.
