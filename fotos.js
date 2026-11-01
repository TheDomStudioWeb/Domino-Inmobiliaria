// DOMino Inmobiliaria · fotos adicionales de una propiedad (la portada sigue siendo la foto de la captación).
export const MAX_FOTOS = 8;
export function panelFotos({ DI, ctx, p }) {
  const det = document.createElement('details'); det.className = 'contrato';
  det.innerHTML = '<summary>Fotos</summary><div class="gal"></div><label class="btn line sm f-add" style="margin-top:8px">+ Agregar foto<input class="sr f-in" type="file" accept="image/*"></label><p class="msg f-m" role="status"></p>';
  const gal = det.querySelector('.gal'), inp = det.querySelector('.f-in'), add = det.querySelector('.f-add'), m = det.querySelector('.f-m');
  const msg = (t, k) => { m.className = 'msg f-m ' + (k || ''); m.textContent = t; };
  let lista = [], cargado = false;
  const pintar = () => {
    gal.innerHTML = lista.length ? '' : '<p class="meta">Solo tiene la foto de portada. Se pueden sumar hasta ' + MAX_FOTOS + ' más.</p>';
    lista.forEach(f => {
      const d = document.createElement('div'); d.className = 'gal-it'; d.style.backgroundImage = 'url("' + f.img.replace(/"/g, '%22') + '")';
      const b = document.createElement('button'); b.type = 'button'; b.className = 'gal-x'; b.textContent = '✕'; b.setAttribute('aria-label', 'Quitar foto');
      let seguro = false;
      b.onclick = async () => {
        if (!seguro) { seguro = true; b.textContent = 'Quitar'; b.classList.add('on'); setTimeout(() => { seguro = false; b.textContent = '✕'; b.classList.remove('on'); }, 3000); return; }
        try { await ctx.borrarFoto(p.id, f.id); lista = lista.filter(x => x.id !== f.id); pintar(); } catch (e) { msg('No se pudo quitar (' + (e.code || e.message) + ').', 'er'); }
      };
      d.appendChild(b); gal.appendChild(d);
    });
    add.hidden = lista.length >= MAX_FOTOS;
  };
  det.addEventListener('toggle', async () => {
    if (!det.open || cargado) return; cargado = true; gal.innerHTML = '<p class="meta">Cargando…</p>';
    try { lista = await ctx.fotos(p.id); } catch (e) { cargado = false; gal.innerHTML = ''; msg('No se pudieron cargar las fotos (' + (e.code || e.message) + ').', 'er'); return; }
    pintar();
  });
  inp.addEventListener('change', async () => {
    const f = inp.files[0]; inp.value = ''; if (!f) return; msg('Guardando…');
    try {
      const img = await DI.reducir(f); await ctx.agregarFoto(p.id, img);
      lista = await ctx.fotos(p.id); pintar(); msg('Foto agregada.', 'ok');
    } catch (e) { msg('No se pudo guardar la foto (' + (e.code || e.message) + ').', 'er'); }
  });
  return det;
}
