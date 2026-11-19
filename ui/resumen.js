// «Lo esencial en 60 s»: vuelo guiado de día por los puntos que definen la carrera. Reutiliza seek() y las cámaras
// del motor (0 seguimiento, 4 dron bajo); no crea geometría. Todo va con temporizadores y transiciones CSS, nada por cuadro.
// Cada salto se tapa con un fundido que no se levanta hasta que lo cercano está cargado (ctx.pendientes() del motor) o vence el máximo.
const DUR = 4600, DUR0 = 5600, FUNDE = 240, MIN_ESPERA = 260;
const MAX_ESPERA = matchMedia('(pointer: coarse)').matches ? 4000 : 2500;

// Puntos: el km y las cifras salen de los datos (hitos, subidas, geles, perfil); aquí solo va la frase útil.
function puntos(D, ctx) {
  const hk = (pref, def) => (D.hitos.find(h => h.nombre.startsWith(pref)) || { km: def }).km;
  const sub = n => (D.subidas || []).find(c => c.nombre.includes(n));
  const larga = (D.subidas || []).slice().sort((a, b) => b.gain - a.gain)[0];
  const R = ctx.R; let iMax = 0, iMin = 0; R.e.forEach((e, i) => { if (e > R.e[iMax]) iMax = i; if (e < R.e[iMin]) iMin = i; });
  const kmMax = ctx.kmOf(iMax * ctx.STEP), eMax = Math.round(R.e[iMax]), eMin = Math.round(R.e[iMin]);
  const bajo = D.hitos.find(h => h.nombre.startsWith('Punto más bajo')), kmBajo = bajo ? bajo.km : ctx.kmOf(iMin * ctx.STEP);
  const g = D.geles || [], rt = sub('Tarpeya'), pc = c => c ? ` +${c.gain} m al ${Math.round(c.gain / ((c.km1 - c.km0) * 10))} %` : '';
  const fk = k => (Math.round(k * 10) / 10).toLocaleString('es');
  const P = [
    { km: hk('Salida', .03), cam: 0, tipo: 'Salida', t: 'Salida · Los Caobos', d: 'Se sale a las 6:05 a.m. Los primeros 3 km son los que más suben: sal más lento de lo que te pide el cuerpo.' },
    { km: hk('Torres de Parque Central', .6), cam: 0, tipo: 'Subida', t: 'Parque Central', d: `Primer repecho${sub('Bolívar') ? `, +${sub('Bolívar').gain} m` : ''}. Con el pelotón apretado no se gana nada apurando.` },
    { km: kmMax, cam: 0, tipo: 'Techo', t: 'El Calvario', d: `${eMax} m: el punto más alto de la ruta. Lo más duro del primer tercio ya pasó.` },
    { km: hk('Plaza La India', 8.17), cam: 4, tipo: 'Retorno', t: 'Plaza La India', d: 'Extremo oeste. Das la vuelta y desde aquí la tendencia es bajar.' },
    { km: hk('El Helicoide', 12.7), cam: 0, tipo: 'Subida', t: 'Roca Tarpeya y El Helicoide', d: `La subida clave del oeste,${pc(rt)}. Súbela por esfuerzo, no por ritmo.` },
    g[0] != null && { km: g[0], cam: 0, tipo: 'Hidratación', t: 'Primer gel oficial', d: 'Puesto con agua y gel. Tómalo con agua y sin pararte.' },
    { km: hk('Monolitos', 17.18), cam: 4, tipo: 'Retorno', t: 'Los Próceres', d: 'Retorno en U. Ancho, plano y sin sombra: aquí se corre exacto a tu ritmo.' },
    { km: 21.0975, cam: 0, tipo: 'Control', t: 'Media maratón', d: 'Mira el reloj: si vas más de 1 min adelantado, fuiste demasiado rápido.' },
    { km: hk('Las Mercedes', 25.14), cam: 4, tipo: 'Hito', t: 'Las Mercedes', d: g[1] != null ? `Zona de público. El segundo gel oficial viene en el km ${fk(g[1])}.` : 'Zona de público: no te dejes llevar por el ánimo.' },
    { km: hk('Av. Río de Janeiro', 28.3), cam: 0, tipo: 'Tramo', t: 'Av. Río de Janeiro', d: 'Recta junto al Guaire: lo más bajo y lo más expuesto al sol.' },
    { km: kmBajo, cam: 0, tipo: 'Punto más bajo', t: `Punto más bajo · ${eMin} m`, d: larga ? `La subida que decide la carrera empieza en el km ${fk(larga.km0)}: +${larga.gain} m en ${fk(larga.km1 - larga.km0)} km.` : 'Desde aquí la ruta vuelve a subir.' },
    { km: hk('Elevado de Los Ruices', 34.9), cam: 4, tipo: 'Subida', t: 'Elevado de Los Ruices', d: 'La Miranda decide la carrera: subida larga, el muro y dos rampas al sol.' },
    { km: hk('Plaza Altamira', 37.27), cam: 4, tipo: 'Hito', t: 'Plaza Altamira', d: 'Se acabó la subida. Lo que queda es favorable: si te queda algo, gástalo.' },
    { km: hk('Plaza Venezuela', 41.62), cam: 4, tipo: 'Hito', t: 'Plaza Venezuela', d: 'Túnel bajo la redoma y después solo queda la recta.' },
    { km: 42.02, cam: 0, tipo: 'Meta', t: 'Meta', d: '42,195 km. La llegada es el arco del canal norte.' },
  ].filter(Boolean);
  return P.sort((a, b) => a.km - b.km);
}

export function crearResumen(caf, ui) {
  const { S, D, ctx } = caf, $ = id => document.getElementById(id), { fK, fH, fT } = ui.plan.fmt;
  const PUNTOS = puntos(D, ctx), sDe = p => Math.max(p.cam === 0 ? 0 : 80, ctx.sOfKm(p.km) - (p.cam === 0 ? 70 : 40));
  const el = document.createElement('div'); el.id = 'res'; el.style.display = 'none';
  el.innerHTML = `<div class="rtop"><div class="rbar">${PUNTOS.map(() => '<i><b></b></i>').join('')}</div>
      <div class="rctl"><span class="rt">Lo esencial en 60 s</span><button data-a="skip">Saltar ›</button><button data-a="exit">Salir</button></div></div>
    <div class="rlab panel"><div class="tag"></div><h3></h3><p></p><div class="rm"></div></div>
    <div class="rfin screen" style="display:none"><div class="card panel"></div></div>`;
  document.body.appendChild(el);
  // fundido común (resumen, recorrido y carrera): tapa la escena mientras carga lo cercano
  const velo = document.createElement('div'); velo.id = 'velo'; velo.innerHTML = '<div class="vt"><span></span>Cargando el tramo</div>'; document.body.appendChild(velo);
  const lab = el.querySelector('.rlab'), segs = [...el.querySelectorAll('.rbar i b')], fin = el.querySelector('.rfin');
  let i = -1, tm = 0, on = false, turno = 0, cubierto = false;
  el.querySelector('.rctl').onclick = e => { const a = e.target.closest('button')?.dataset.a; if (a === 'skip') ir(i + 1); else if (a === 'exit') salir(); };
  addEventListener('keydown', e => { if (!on || ui.plan?.abierto) return; const k = e.key.toLowerCase(); if (k === 'escape') { e.stopImmediatePropagation(); salir(); } else if (k === 'arrowright') { e.stopImmediatePropagation(); ir(i + 1); } else if (k === 'c' || k === 'arrowleft') e.stopImmediatePropagation(); }, true);

  const espera = ms => new Promise(r => setTimeout(r, ms)), cuadros = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); });
  // espera a que el motor no tenga nada pendiente cerca del corredor (o a que venza el máximo); devuelve los ms esperados
  async function cargado(max = MAX_ESPERA) {
    const t0 = performance.now(); await espera(MIN_ESPERA); await cuadros(2);
    while (performance.now() - t0 < max) { const n = ctx.pendientes ? ctx.pendientes() : 0; if (!n) break; await espera(100); }
    await cuadros(3); return performance.now() - t0;
  }
  // precarga discreta del punto siguiente: pide al navegador las imágenes satelitales de detalle (quedan en su caché)
  const pedidas = new Set();
  function precargar(p) { if (!p || !ctx.tilesCerca) return; const q = ctx.P(sDe(p)); for (const u of ctx.tilesCerca(q.x, q.z)) { if (pedidas.has(u)) continue; pedidas.add(u); const im = new Image(); im.crossOrigin = 'anonymous'; im.decoding = 'async'; im.src = u; } }
  // tapar, ejecutar el salto, esperar la carga y destapar
  async function cubrir(salto, max) {
    const mio = ++turno; cubierto = true; velo.classList.add('on'); await espera(FUNDE); if (mio !== turno) return false;
    const pausa = S.paused; S.paused = true; salto?.(); const ms = await cargado(max); if (mio !== turno) return false;
    S.paused = pausa; velo.classList.remove('on'); cubierto = false; ui.ultimaEspera = Math.round(ms); return true;
  }
  // primer cuadro de «Reconocer la ruta» y «Correr la carrera»: la escena no se muestra hasta que está cargada
  function cubrirInicio() { velo.classList.add('on', 'ya'); cubrir(null).then(() => velo.classList.remove('ya')); }

  function iniciar() {
    on = true; velo.classList.add('on', 'ya'); caf.start('tour', { resumen: true }); S.dia = true; $('hud').style.display = 'none';
    el.style.display = 'block'; fin.style.display = 'none'; lab.style.display = ''; el.querySelector('.rtop').style.display = '';
    segs.forEach(s => { s.style.transition = 'none'; s.style.width = '0'; }); ir(0).then(() => velo.classList.remove('ya'));
  }
  async function ir(n) {
    clearTimeout(tm); if (!on) return;
    if (ui.plan?.abierto) { tm = setTimeout(() => ir(n), 500); return; }   // con el plan abierto, el vuelo espera
    segs.forEach((s, j) => { if (j < n) { s.style.transition = 'none'; s.style.width = '100%'; } else if (j > n) { s.style.transition = 'none'; s.style.width = '0'; } });
    if (n >= PUNTOS.length) return terminar();
    i = n; const p = PUNTOS[n], dur = n ? DUR : DUR0; lab.classList.remove('in');
    const ok = await cubrir(() => { S.cam = p.cam; S.scale = p.cam === 0 ? 5 : 3; caf.seek(sDe(p)); });
    if (!ok || !on || i !== n) return;
    S.paused = false;
    const T = S.target, at = ui.plan ? ui.plan.calc(T).at : null;
    lab.querySelector('.tag').textContent = `${n + 1} de ${PUNTOS.length} · ${p.tipo} · km ${fK(p.km)}`;
    lab.querySelector('h3').textContent = p.t; lab.querySelector('p').textContent = p.d;
    lab.querySelector('.rm').textContent = at && p.km > .1 ? `Con ${fT(T)} pasas aquí hacia las ${fH(at(Math.min(p.km, 42.195)))}` : `Tu objetivo: ${fT(T)}`;
    lab.classList.add('in');
    const s = segs[n]; s.style.transition = 'none'; s.style.width = '0'; void s.offsetWidth; s.style.transition = `width ${dur}ms linear`; s.style.width = '100%';
    setTimeout(() => on && i === n && precargar(PUNTOS[n + 1]), 900);
    tm = setTimeout(() => ir(n + 1), dur);
  }
  function terminar() {
    S.paused = true; lab.style.display = 'none'; el.querySelector('.rtop').style.display = 'none';
    const sub = D.subidas || [], gain = sub.reduce((a, c) => a + c.gain, 0), larga = sub.slice().sort((a, b) => b.gain - a.gain)[0];
    fin.querySelector('.card').innerHTML = `<div class="tag">Lo esencial en 60 s</div><h1>Esa es <em>la ruta</em></h1>
      <div class="kpis"><div><b>${sub.length}</b><span>subidas, +${gain} m entre todas</span></div><div><b>${D.hidratacion.length}</b><span>puestos de agua, ${(D.gatorade || []).length} con isotónico</span></div><div><b>km ${(D.geles || []).map(fK).join(' y ')}</b><span>gel oficial</span></div>${larga ? `<div><b>km ${fK(larga.km0)}</b><span>empieza la subida que decide la carrera</span></div>` : ''}</div>
      <p class="sub">Ahora llévate el ritmo de cada kilómetro para tu objetivo, con la hora de paso por cada puesto, o recórrela completa con calma.</p>
      <div class="acts"><button class="go" data-a="plan">Ver mi plan</button><button class="go alt" data-a="full">Recorrerla completa</button><button class="go alt" data-a="menu">Inicio</button></div>`;
    fin.style.display = 'flex';
    fin.querySelector('.acts').onclick = e => { const a = e.target.closest('button')?.dataset.a; if (a === 'plan') ui.plan?.abrir(); else if (a === 'full') { detener(); caf.go('tour'); } else if (a === 'menu') salir(); };
  }
  function detener() { on = false; turno++; clearTimeout(tm); el.style.display = 'none'; fin.style.display = 'none'; velo.classList.remove('on', 'ya'); cubierto = false; S.resumen = false; S.cam = 0; }
  function salir() { detener(); caf.menu(); }
  return { iniciar, detener, salir, cubrirInicio, cargado, PUNTOS, get activo() { return on; }, get cubierto() { return cubierto; } };
}
