# DOMino Inmobiliaria

PWA de captación de propiedades y seguimiento para agentes inmobiliarios. **Versión de demostración**, sin marca de ninguna inmobiliaria: se personaliza por cliente.

Desarrollado por [The DOM Studio Web](https://thedomstudioweb.github.io/) · WhatsApp 261-3431216 · thedomstudioweb@gmail.com

## Qué hay en este repositorio

| Ruta | Qué es |
|---|---|
| `index.html` | Ingreso de agentes (demo: no hay cuentas reales) |
| `dashboard.html` | Panel: resumen, propiedades en gestión, leads, aviso al propietario por WhatsApp |
| `captura.html` | Captación: foto con la cámara, dirección y tipo de operación |
| `app.css` / `app.js` | Estilo (kit Premium-Noir de The DOM) y lógica compartida (datos locales, foto reducida, WhatsApp) |
| `manifest.json` / `sw.js` | Instalación como app y funcionamiento sin conexión |
| `imagenes/` | Logo, íconos y fotos de ejemplo |
| `sitio/` | Sitio web comercial de demostración (tasación online, propiedades, contacto) |

## Cómo funciona la demo
- Los datos (propiedades, leads, fotos) se guardan **solo en el teléfono** (localStorage). «Restablecer datos de ejemplo» vuelve al inicio.
- Los avisos de WhatsApp abren `wa.me` con el mensaje armado; en la demo llegan al estudio.
- Propiedades y leads son inventados; las fotos son de banco de imágenes.

## Publicar
GitHub Pages: Settings → Pages → Deploy from a branch → `main` / root. Al cambiar archivos de la app, subir también `VERSION` en `sw.js`.

## Próximos pasos (producto real)
Ingreso real y datos por centro (Firebase Auth + Firestore), alta de centros con prueba de 1 semana, roles administrador/agente/propietario/inquilino, portal del cliente, documentos, vencimientos y ajustes de alquiler, agenda de visitas. Reutiliza módulos de DOMino Profesional, Veterinaria y Bienestar.
