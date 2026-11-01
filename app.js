/* DOMino Inmobiliaria · lógica compartida (demostración, datos en el propio teléfono) */
(function () {
  'use strict';
  // Número del estudio: en la demostración, los avisos de WhatsApp llegan a The DOM. Cada inmobiliaria pone el suyo.
  var WA = '5492613431216';
  var WA_DEMO = WA;
  var KEY = 'domino_inmo_demo_v1';
  var D = window.DI = {};

  // Fecha de hoy más n días, como texto AAAA-MM-DD (para los datos de ejemplo).
  function mas(n) { var d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  var SEED = {
    props: [
      { id: 'p1', titulo: 'Residencia en Vistalba',        estado: '3 visitas esta semana', img: 'imagenes/house-1.webp' },
      { id: 'p2', titulo: 'Departamento en Quinta Sección', estado: '1 oferta recibida',     img: 'imagenes/house-2.webp' },
      { id: 'p3', titulo: 'Lote en barrio privado',         estado: 'En promoción inicial',  img: 'imagenes/lote.webp' },
      { id: 'p4', titulo: 'Casa con pileta en Luján',       estado: 'Contrato en revisión',  img: 'imagenes/house-4.webp', operacion: 'Alquiler', propietario: 'Marta Quiroga', propietario_id: 'f1', inquilino_id: 'f2', contrato_inicio: mas(-320), contrato_vence: mas(45), alq_monto: 420000, alq_ajuste_meses: 3, alq_indice: 'IPC', alq_ultimo_ajuste: mas(-88) }
    ],
    fichas: [
      { id: 'f1', tipo: 'propietario', nombre: 'Marta Quiroga', telefono: '', email: '', dni: '', domicilio: 'Luján de Cuyo', notas: 'Prefiere que la llamen por la tarde.' },
      { id: 'f2', tipo: 'inquilino',   nombre: 'Diego Paz',     telefono: '', email: '', dni: '', domicilio: '',               notas: '' }
    ],
    leads: [
      { id: 'l1', nombre: 'Laura Benítez', detalle: 'Quiere tasar una casa en Chacras' },
      { id: 'l2', nombre: 'Familia Sosa',  detalle: 'Consulta por el departamento de Quinta Sección' }
    ]
  };

  D.ROLES = { senior: 'Dirección', semisenior: 'Corredor', asistente: 'Gestor' };
  D.ESTADOS = ['Nueva', 'En promoción', 'Con oferta', 'Reservada', 'Contrato en revisión', 'Cerrada'];

  D.load = function () {
    try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.props && d.leads) { d.fichas = d.fichas || []; return d; } } catch (e) {}
    return JSON.parse(JSON.stringify(SEED));
  };
  // Fechas de contrato (texto AAAA-MM-DD): días que faltan desde hoy (negativo si ya venció) y fecha para mostrar.
  D.dias = function (iso) {
    var p = String(iso || '').split('-'); if (p.length !== 3) return null;
    var f = new Date(+p[0], +p[1] - 1, +p[2]), h = new Date(); h.setHours(0, 0, 0, 0);
    return Math.round((f - h) / 86400000);
  };
  D.fecha = function (iso) { var p = String(iso || '').split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : ''; };
  // Estado del contrato según su vencimiento: texto, color (ok / warn / er) y si hay que avisar (dentro de 60 días o vencido).
  D.contrato = function (iso) {
    var n = D.dias(iso); if (n === null) return null;
    if (n < 0) return { t: 'Vencido hace ' + (-n) + (n === -1 ? ' día' : ' días'), k: 'er', aviso: true, n: n };
    if (n === 0) return { t: 'Vence hoy', k: 'er', aviso: true, n: n };
    if (n <= 60) return { t: 'Vence en ' + n + (n === 1 ? ' día' : ' días'), k: 'warn', aviso: true, n: n };
    return { t: 'Vigente hasta el ' + D.fecha(iso), k: 'ok', aviso: false, n: n };
  };
  // Suma meses a una fecha AAAA-MM-DD (si el día no existe en el mes de llegada, queda en el último día).
  D.sumarMeses = function (iso, n) {
    var p = String(iso || '').split('-'); if (p.length !== 3) return '';
    var y = +p[0], m = +p[1] - 1 + n, d = +p[2], f = new Date(y, m, 1), ult = new Date(f.getFullYear(), f.getMonth() + 1, 0).getDate();
    f.setDate(Math.min(d, ult)); return f.getFullYear() + '-' + ('0' + (f.getMonth() + 1)).slice(-2) + '-' + ('0' + f.getDate()).slice(-2);
  };
  // Próximo ajuste del alquiler: último ajuste (o inicio del contrato) + período. '' si no hay período o fecha base.
  D.proxAjuste = function (p) {
    var per = Number(p.alq_ajuste_meses) || 0, base = p.alq_ultimo_ajuste || p.contrato_inicio;
    return per > 0 && base ? D.sumarMeses(base, per) : '';
  };
  D.save = function (d) { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } };
  D.reset = function () { try { localStorage.removeItem(KEY); sessionStorage.removeItem('domino_foto'); } catch (e) {} };
  // Teléfono argentino -> formato de WhatsApp (549 + área + número, sin 0 ni 15 de más). Si no hay teléfono válido, devuelve ''.
  D.tel = function (t) {
    var n = String(t || '').replace(/\D/g, '');
    if (n.indexOf('549') === 0 && n.length >= 12) return n;
    if (n.indexOf('54') === 0 && n.length >= 11) return '549' + n.slice(2);
    n = n.replace(/^0+/, '');
    return n.length === 10 ? '549' + n : (n.length >= 11 ? n : '');
  };
  D.setWA = function (t) { WA = D.tel(t) || WA_DEMO; };
  // Enlace de WhatsApp. Con teléfono: al destinatario; sin teléfono: WhatsApp deja elegir el contacto.
  D.wa = function (texto, tel) { var n = tel === undefined ? WA : D.tel(tel); return 'https://wa.me/' + (n || '') + '?text=' + encodeURIComponent(texto); };
  D.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  // Reduce la foto (la cámara del teléfono entrega imágenes enormes) para que entre en el almacenamiento del navegador.
  D.reducir = function (file) {
    return new Promise(function (ok, fail) {
      var r = new FileReader();
      r.onerror = fail;
      r.onload = function () {
        var im = new Image();
        im.onerror = fail;
        im.onload = function () {
          var w = Math.min(760, im.width), h = Math.round(im.height * w / im.width);
          var c = document.createElement('canvas'); c.width = w; c.height = h;
          c.getContext('2d').drawImage(im, 0, 0, w, h);
          ok(c.toDataURL('image/jpeg', 0.72));
        };
        im.src = r.result;
      };
      r.readAsDataURL(file);
    });
  };

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
