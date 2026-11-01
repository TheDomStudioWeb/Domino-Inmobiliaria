/* DOMino Inmobiliaria · lógica compartida (demostración, datos en el propio teléfono) */
(function () {
  'use strict';
  // Número del estudio: en la demostración, los avisos de WhatsApp llegan a The DOM. Cada inmobiliaria pone el suyo.
  var WA = '5492613431216';
  var WA_DEMO = WA;
  var KEY = 'domino_inmo_demo_v1';
  var D = window.DI = {};

  var SEED = {
    props: [
      { id: 'p1', titulo: 'Residencia en Vistalba',        estado: '3 visitas esta semana', img: 'imagenes/house-1.webp' },
      { id: 'p2', titulo: 'Departamento en Quinta Sección', estado: '1 oferta recibida',     img: 'imagenes/house-2.webp' },
      { id: 'p3', titulo: 'Lote en barrio privado',         estado: 'En promoción inicial',  img: 'imagenes/lote.webp' },
      { id: 'p4', titulo: 'Casa con pileta en Luján',       estado: 'Contrato en revisión',  img: 'imagenes/house-4.webp' }
    ],
    leads: [
      { id: 'l1', nombre: 'Laura Benítez', detalle: 'Quiere tasar una casa en Chacras' },
      { id: 'l2', nombre: 'Familia Sosa',  detalle: 'Consulta por el departamento de Quinta Sección' }
    ]
  };

  D.ROLES = { senior: 'Dirección', semisenior: 'Corredor', asistente: 'Gestor' };
  D.ESTADOS = ['Nueva', 'En promoción', 'Con oferta', 'Reservada', 'Contrato en revisión', 'Cerrada'];

  D.load = function () {
    try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.props && d.leads) return d; } catch (e) {}
    return JSON.parse(JSON.stringify(SEED));
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
