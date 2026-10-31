# DOMino Inmobiliaria

Sitio de captación de propiedades y consultas para inmobiliarias, de **The DOM Studio Web**. Esta es la versión **de demostración**: sin marcas ni datos de ninguna inmobiliaria real. Todos los datos (nombre, propiedades, precios, contacto) son de ejemplo.

## Qué incluye
- Portada con acceso rápido: comprar, vender, invertir.
- **Captación de propietarios:** formulario de valuación que valida los datos y abre WhatsApp con la consulta armada.
- Vitrina de propiedades con botón de consulta por WhatsApp (el mensaje ya nombra la propiedad).
- Bloque de corredor responsable, portal de agentes y contacto.
- Diseño con el kit de marca Premium-Noir de The DOM, adaptado a celular.

## Estructura
```
index.html          Todo el sitio (HTML, CSS y JS en un solo archivo)
imagenes/           Fotos de ejemplo (WebP), medallón de The DOM, favicon e ícono
MANUAL_Claudio_DOMino_Inmobiliaria.md   Manual interno para cargar en Claudio
```

## Cómo personalizarlo para una inmobiliaria
1. **Nombre:** buscar `Su Inmobiliaria` en `index.html` y reemplazarlo (encabezado, pie y título de la pestaña).
2. **WhatsApp:** en el bloque `<script>`, cambiar `var WA = '5492613431216'` por el número del cliente (código de país + característica, sin signos). Hoy apunta al estudio.
3. **Propiedades:** editar las tres tarjetas (precio, título, zona, ambientes, superficie) y reemplazar `imagenes/propiedad-1.webp`, `-2` y `-3`. Quitar la etiqueta `Ejemplo` y la nota de imágenes ilustrativas.
4. **Corredor responsable y contacto:** completar nombre, matrícula, razón social, dirección, teléfono y correo reales.
5. **Logo del cliente:** reemplazar el texto de marca del encabezado por su logo.
6. **Portada:** cambiar `imagenes/hero.webp` por una foto del cliente.
7. Conservar la firma de The DOM al pie.

## Publicación
Pensado para publicarse como sitio estático (GitHub Pages o Firebase Hosting). No usa servidor, base de datos ni claves.

## Imágenes
Las fotos son imágenes de ejemplo de bancos de fotos. Antes de usar el sitio con un cliente, reemplazarlas por fotos propias de sus propiedades.

---
Desarrollado por The DOM Studio Web · WhatsApp 261-3431216 · thedomstudioweb@gmail.com
