// Ayuda de primer uso: tres indicaciones sobre el HUD, que se cierran y no vuelven a salir (localStorage).
const KEY = 'caf3d-ayuda-v1';
const PASOS = {
  tour: [
    { el: 'prof', t: 'Toca el perfil para saltar', d: 'Rojo sube, verde baja y los puntos azules son puestos de agua. Toca o arrastra para ir a cualquier kilómetro.' },
    { el: 'tramo', t: 'Qué hacer en cada tramo', d: 'Esta tarjeta cambia con el tramo y te dice cómo correrlo. En el teléfono, tócala para ver el consejo.' },
    { el: 'bPlan', t: 'Tu plan, para llevártelo', d: 'Ritmo por kilómetro para tu objetivo, hora de paso por cada puesto y una imagen para el fondo de pantalla.' },
  ],
  // teléfono, «modo cine» del recorrido (ui/cine.js)
  cine: [
    { el: 'cProf', t: 'Toca la tira para saltar', d: 'Es el perfil de la ruta: rojo sube, verde baja y las marcas azules son puestos de agua. Toca o arrastra para ir a cualquier kilómetro.' },
    { el: 'cTr', t: 'El tramo, en una línea', d: 'Al entrar a un tramo se abre unos segundos con su clave. Tócalo para ver el detalle y lo que viene.' },
    { el: 'cMas', t: 'Lo demás está aquí', d: 'Velocidad, cámara, hora del día, tramos, Mi plan, sonido y calidad. Si no tocas la pantalla los botones se esconden: un toque los trae de vuelta.' },
  ],
  race: [
    { el: 'crMed', t: 'Mantén la aguja en verde', d: 'Cada toque da un impulso que dura unos segundos. Uno cada 2 o 3 s te deja en la zona; sin toques el ritmo cae y muy seguidos te pasas al rojo, te cansas y viene un bajón.' },
    { el: 'crBarras', t: 'Energía y agua', d: 'La energía baja con el ritmo y las subidas; el agua, con el calor. Cuando aparezcan el gel y el vaso junto al pulgar, tócalos a tiempo (o G y B).' },
    { el: 'crBtn', t: 'Toca aquí abajo', d: 'Toda la mitad inferior de la pantalla sirve para correr. En el teclado, la barra espaciadora; P o Esc pausan.' },
  ],
};
export function crearAyuda(caf) {
  const { S } = caf, q = new URLSearchParams(location.search);
  // el aviso de sonido (fx/sonido.js) no tiene id: se lo pone aquí para poder ubicarlo en el teléfono
  for (let k = 0; k < 20; k++) setTimeout(() => { if (document.getElementById('sonido')) return; const b = [...document.body.children].find(n => n.tagName === 'BUTTON' && /Sonido/.test(n.textContent)); if (b) b.id = 'sonido'; }, k * 500);
  if (q.has('auto') || q.get('hud') === '0' || q.has('choques')) return { alEmpezar() { } };
  // «Va lento en este equipo»: si pasa 10 s seguidos por debajo de ~20 fps (corriendo y visible), se ofrece Ligera una sola vez
  let lentoVisto = false; try { lentoVisto = !!localStorage.getItem('caf3d-aviso-lento'); } catch (e) { }
  if (!lentoVisto && !q.get('calidad') && caf.Q?.tier !== 'ligera' && caf.ctx.frameHooks) {
    let acc = 0, n = 0, malo = 0;
    caf.ctx.frameHooks.push((noche, t, dt) => {
      if (lentoVisto || !S.running || S.paused || document.hidden || window.__cafUI?.velo?.cubierto) { acc = n = 0; return; }
      acc += dt; n++; if (acc < 1) return; const fps = n / acc; acc = n = 0; malo = fps < 20 ? malo + 1 : 0;
      if (malo >= 10) { lentoVisto = true; try { localStorage.setItem('caf3d-aviso-lento', '1'); } catch (e) { }
        const a = document.createElement('div'); a.id = 'lento'; a.className = 'panel'; a.innerHTML = '<span>Va lento en este equipo: cambia a Ligera</span><button class="on" data-a="l">Cambiar</button><button data-a="x" aria-label="Cerrar">×</button>'; document.body.appendChild(a);
        a.onclick = e => { const b = e.target.closest('button')?.dataset.a; if (b === 'l') { try { localStorage.setItem('caf3d-calidad', 'ligera'); } catch (e) { } location.reload(); } else if (b === 'x') a.remove(); }; setTimeout(() => a.remove(), 15000); }
    });
  }   // las capturas automáticas no llevan ayuda
  let visto = false; try { visto = !!localStorage.getItem(KEY); } catch (e) { }
  const box = document.createElement('div'); box.id = 'coach'; box.className = 'panel'; box.style.display = 'none'; document.body.appendChild(box);
  let pasos = [], n = 0, marc = null, pausaPrev = false;
  function poner() {
    marc?.classList.remove('coach-hl'); const p = pasos[n], t = document.getElementById(p.el); if (!t || !t.offsetParent) { if (++n < pasos.length) return poner(); return cerrar(); }
    marc = t; t.classList.add('coach-hl');
    box.innerHTML = `<div class="tag">${n + 1} de ${pasos.length}</div><h3>${p.t}</h3><p>${p.d}</p><div class="cb"><button data-a="x">Cerrar ayuda</button><button class="on" data-a="n">${n < pasos.length - 1 ? 'Siguiente' : 'Entendido'}</button></div>`;
    box.style.display = 'block'; const r = t.getBoundingClientRect(), bw = box.offsetWidth, bh = box.offsetHeight, m = 12;
    let x = Math.min(innerWidth - bw - m, Math.max(m, r.left + r.width / 2 - bw / 2)), y = r.top > bh + 24 ? r.top - bh - 14 : r.bottom + 14;
    if (y + bh > innerHeight - m) y = Math.max(m, innerHeight - bh - m); box.style.left = x + 'px'; box.style.top = y + 'px';
  }
  box.onclick = e => { const a = e.target.closest('button')?.dataset.a; if (a === 'x') cerrar(); else if (a === 'n') { if (++n < pasos.length) poner(); else cerrar(); } };
  function cerrar() { marc?.classList.remove('coach-hl'); marc = null; box.style.display = 'none'; visto = true; try { localStorage.setItem(KEY, '1'); } catch (e) { } if (S.running) S.paused = pausaPrev; const b = document.getElementById('bPlay'); if (b) b.textContent = S.paused ? '▶ Seguir' : '⏸ Pausa'; }
  function alEmpezar(mode) {
    try { if (localStorage.getItem(KEY)) visto = true; } catch (e) { }
    const clave = mode === 'tour' && document.body.classList.contains('cine') ? 'cine' : mode;
    if (visto || S.resumen || !PASOS[clave]) return;
    const intentar = () => { if (window.__cafUI?.velo?.cubierto) return setTimeout(intentar, 400); if (visto || S.resumen || !S.running) return; pasos = PASOS[document.body.classList.contains('cine') && mode === 'tour' ? 'cine' : mode]; n = 0; pausaPrev = S.paused; S.paused = true; const b = document.getElementById('bPlay'); if (b) b.textContent = '▶ Seguir'; poner(); }; setTimeout(intentar, 1400);
  }
  addEventListener('resize', () => { if (box.style.display === 'block') poner(); });
  // si aparece la pantalla final o se vuelve al inicio con la ayuda abierta, se cierra (sin trabajo por cuadro)
  const mo = new MutationObserver(() => { if (box.style.display === 'block' && (document.getElementById('end').style.display === 'flex' || document.getElementById('hud').style.display === 'none')) cerrar(); });
  ['end', 'hud'].forEach(id => mo.observe(document.getElementById(id), { attributes: true, attributeFilter: ['style'] }));
  return { alEmpezar, cerrar };
}
