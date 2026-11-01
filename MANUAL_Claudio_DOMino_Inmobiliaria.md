# Manual interno · DOMino Inmobiliaria (para Claudio)

## Qué es
Micro app de The DOM Studio Web para inmobiliarias: el agente capta propiedades desde el celular y hace seguimiento de propietarios y leads. Hoy es una demostración que funciona sin servidor.

## Cómo se usa
1. **Ingresar:** con el correo y la contraseña que entregó la Dirección. Para conocer la app sin cuenta, tocar «Recorrer la demostración».
2. **Panel:** tres contadores (en gestión, leads, captaciones nuevas); debajo, las propiedades en gestión con «Notificar al propietario» (abre WhatsApp con el reporte armado) y la lista de leads con «Contactar».
3. **Captar una propiedad:** botón de cámara del centro de la barra inferior, sacar la foto, escribir la dirección, elegir el tipo (Solo tasación, Venta exclusiva, Alquiler) y «Subir al sistema». Queda con estado «Nueva» y suma a «Captaciones nuevas».
4. **Restablecer:** al pie del panel, «Restablecer datos de ejemplo».

## Tener en cuenta
- Los datos quedan solo en el teléfono donde se cargan; no se comparten entre agentes ni dispositivos.
- Se instala desde el menú del navegador («Instalar» / «Agregar a pantalla de inicio») y abre sin conexión.
- Propiedades, leads y fotos son de ejemplo.
- Los avisos de WhatsApp de la demo llegan al estudio, no a un propietario real.

## Sitio web de demostración
En `/sitio/`: tasación online (arma un mensaje de WhatsApp), pasos, propiedades de ejemplo y datos de contacto a personalizar.

## Direcciones
- Aplicación: https://domino-inmobiliaria.web.app (se instala desde el menú del navegador).
- Demostración: https://thedomstudioweb.github.io/Domino-Inmobiliaria/

## Para una inmobiliaria real
Se entrega con su marca, su WhatsApp, datos propios por centro, ingreso real de agentes y prueba de 1 semana. Consultas: The DOM Studio Web · WhatsApp 261-3431216 · thedomstudioweb@gmail.com

## Equipo y prueba
- La Dirección da de alta a su equipo desde «Gestionar el equipo» (al pie del panel): nombre, correo y contraseña temporal. Hay tres niveles: Dirección (ve todo, reasigna propiedades y gestiona el equipo), Corredor (ve y gestiona lo que capta o se le asigna, y puede cerrar operaciones) y Gestor (capta y hace seguimiento de lo suyo; no puede dar por cerrada una operación). Cada persona ve su propio panel («Mis propiedades»); la Dirección puede filtrar por persona.
- Cada inmobiliaria tiene 1 semana de prueba desde el primer ingreso de su Dirección; el panel muestra «Prueba hasta…».
- «Registrar consulta» (panel) carga un lead con su WhatsApp; «Contactar» abre el chat. En cada propiedad se puede anotar el propietario y su WhatsApp, y «Notificar al propietario» le abre el chat con el reporte armado.
- Los datos de una inmobiliaria nunca se ven desde otra.
- La Dirección puede asignar cada consulta a una persona del equipo (al registrarla o después, con «Asignar a…»). Cada persona ve solo las consultas que registró o que le asignaron.
- Para salir de la cuenta, se toca el círculo con las iniciales (arriba a la derecha del panel).
- La Dirección carga el nombre comercial y el WhatsApp de la inmobiliaria en «Datos de la inmobiliaria» (al pie del panel). Esos datos firman los mensajes de WhatsApp que el equipo envía a propietarios y consultas.

## Propietarios, inquilinos y contratos
- **Personas** (botón arriba a la derecha del panel): fichas de propietarios e inquilinos con nombre, WhatsApp, correo, DNI, domicilio y notas. Se busca por nombre, teléfono o DNI y se filtra por tipo. Cada ficha tiene «WhatsApp», «Llamar» y «Editar». La Dirección también puede eliminar fichas.
- Al captar una propiedad con propietario, la ficha del propietario se crea sola (si ya existe, se reutiliza).
- **Contrato e inquilino:** en cada propiedad, el desplegable «Contrato e inquilino» permite elegir el inquilino y el propietario (de las fichas) y cargar la fecha de inicio y de vencimiento del contrato.
- La tarjeta de la propiedad muestra el estado del contrato: verde si falta más de 60 días, amarillo si vence dentro de 60 días, rojo si vence hoy o ya venció.
- **Contratos por vencer:** el panel lista los contratos que vencen en 90 días o menos (o ya vencidos) y avisa arriba si alguno vence en 30 días o menos. Cada uno tiene «Avisar al inquilino» y «Avisar al propietario», que abren WhatsApp con el mensaje armado.
- Cada persona ve solo las fichas que cargó o que se le asignaron; la Dirección ve todas.
- Todavía no guarda documentos (DNI, escrituras, contratos escaneados): por ahora la ficha guarda solo datos, fechas y notas.

## Alquileres y ajustes por IPC
- En cada propiedad en alquiler, dentro de «Contrato», se carga: alquiler actual, ajuste cada 3/4/6/12 meses e índice acordado (IPC, porcentaje fijo u otro).
- El próximo ajuste = último ajuste (o inicio del contrato) + período. Cuando faltan 30 días o menos aparece la sección «Ajustes de alquiler» en el panel.
- «Traer IPC» consulta la API pública de series de tiempo (datos.gob.ar, INDEC) y muestra los últimos meses con casillas; por defecto marca los 3 últimos y acumula multiplicando (no sumando). La pantalla indica la serie y el último mes disponible; si la serie está atrasada avisa y se carga el porcentaje a mano.
- Si la consulta falla (sin internet o bloqueo), se escribe el porcentaje a mano: la app calcula el nuevo alquiler y el agente puede corregirlo.
- «Confirmar ajuste» guarda el nuevo valor y el historial (fecha, desde, hasta, %), y ofrece el mensaje de WhatsApp al inquilino.
- La app no decide qué ajuste corresponde legalmente: el agente elige los meses según el contrato.
- Serie usada: constante IPC_SERIE en alquiler.js (hoy la de GBA, que puede estar atrasada). Para cambiarla, editar esa línea.
