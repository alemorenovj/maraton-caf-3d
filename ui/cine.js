// «Modo cine» del recorrido en el teléfono (Reconocer la ruta, S.mode === 'tour'): la interfaz estorba lo mínimo.
// Arriba una píldora (km · reloj · ritmo · pendiente: es #stats con otro estilo); debajo el tramo en una línea, que se despliega unos
// segundos al entrar a uno nuevo; los avisos de hidratación y subida solo cuando se acercan; abajo una tira fina del perfil (tocar o
// arrastrar salta de km) entre Pausa y «más», que abre una hoja con el resto. Tras 3 s sin tocar se recogen los botones.
// Todo se apoya en los controles originales (se les hace clic): atajos, ids y ayuda siguen igual. Solo actúa con body.cine y data-modo="tour".
export function crearCine(caf) {
  const { S, D, ctx, Q } = caf, $ = id => document.getElementById(id), body = document.body, hud = $('hud');
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('./cine.css' + new URL(import.meta.url).search, import.meta.url).href; document.head.appendChild(css);
  const mq = matchMedia('(max-width: 480px), (pointer: coarse) and (max-height: 500px)');
  const activo = () => body.classList.contains('cine') && body.dataset.modo === 'tour' && hud.style.display !== 'none';
  const el = (tag, id, cls, html) => { const e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  // ── arriba: tramo en una línea + su detalle + aviso de lo que viene ──
  const pila = el('div', 'cPila');
  const chip = el('button', 'cTr', 'panel', '<span class="n"></span><span class="t"></span><span class="f">›</span>'); chip.type = 'button'; chip.setAttribute('aria-expanded', 'false');
  const det = el('div', 'cTrD', 'panel', '<div class="tag"></div><h3></h3><p class="ds"></p><p class="cl"></p><div class="nx"></div>');
  const av = el('div', 'cAv', 'panel'); av.setAttribute('role', 'status');
  pila.append(chip, det, av);
  // ── abajo: Pausa · tira del perfil · más ──
  const bar = el('div', 'cBar');
  const play = el('button', 'cPlay', 'panel cineb', '⏸'); play.type = 'button'; play.setAttribute('aria-label', 'Pausa');
  const tiraW = el('div', 'cProf', 'panel', '<div class="tira"><canvas></canvas><i class="sh"></i><i class="mk"></i></div><div class="bur"></div>');
  tiraW.setAttribute('role', 'slider'); tiraW.setAttribute('aria-label', 'Perfil de la ruta: toca o arrastra para ir a un kilómetro');
  const mas = el('button', 'cMas', 'panel cineb', '<i></i><i></i><i></i>'); mas.type = 'button'; mas.setAttribute('aria-label', 'Más controles');
  bar.append(play, tiraW, mas);
  // ── hoja inferior con el resto ──
  const velo = el('div', 'cVelo');
  const hoja = el('div', 'cHoja', 'panel', `<div class="asa"></div><div class="hd"><span class="tag">Controles</span><button type="button" data-a="x" aria-label="Cerrar">×</button></div>
    <div class="gr">
      <button type="button" data-a="vel"><b data-v="vel"></b><span>Velocidad · toca para cambiar</span></button>
      <button type="button" data-a="cam"><b data-v="cam"></b><span>Cámara</span></button>
      <button type="button" data-a="luz"><b data-v="luz"></b><span>Hora del día</span></button>
      <button type="button" data-a="idx"><b>☰ Tramos</b><span>Saltar a un tramo</span></button>
      <button type="button" data-a="plan"><b>Mi plan</b><span>Ritmo por km y puestos</span></button>
      <button type="button" data-a="son"><b data-v="son"></b><span>Sonido · toca para cambiar</span></button>
    </div>
    <div class="cal"><span class="tag">Calidad</span><div class="seg"><button type="button" data-q="alta">Alta</button><button type="button" data-q="media">Media</button><button type="button" data-q="ligera">Ligera</button></div><span class="nt">Se recarga y sigues en el mismo km</span></div>
    <button type="button" class="menu" data-a="menu">Salir al menú</button>`);
  hud.append(pila, bar, velo, hoja);

  // ── tira del perfil: se dibuja una vez (alta, 72 px) y en reposo se muestra encogida con transform; el marcador es un div ──
  const tira = tiraW.querySelector('.tira'), cv = tira.querySelector('canvas'), sh = tira.querySelector('.sh'), mk = tira.querySelector('.mk'), bur = tiraW.querySelector('.bur');
  const HX = 72; let tw = 0, lastPx = -1;
  function dibujaTira() {
    const w = tiraW.clientWidth - 8; if (w <= 0) return; tw = w; const dpr = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(w * dpr); cv.height = HX * dpr; cv.style.width = w + 'px';
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, HX);
    const T = ctx.TOTAL, o = {}; let lo = Infinity, hi = -Infinity; const es = new Float32Array(w), gs = new Float32Array(w);
    for (let x = 0; x < w; x++) { caf.P(x / (w - 1) * (T - 1), o); es[x] = o.e; gs[x] = o.grade; lo = Math.min(lo, o.e); hi = Math.max(hi, o.e); }
    const top = 10, bot = HX - 2, yy = e => bot - (e - lo + 3) / (hi - lo + 6) * (bot - top);
    for (let x = 0; x < w; x++) { const gr = gs[x]; g.fillStyle = gr > 1.2 ? (gr > 3 ? '#ff4a2a' : '#ff8a5c') : gr < -1.2 ? '#3ecf8e' : '#f2c94c'; const y = yy(es[x]); g.globalAlpha = .88; g.fillRect(x, y, 1, bot - y); }
    g.globalAlpha = 1; g.fillStyle = '#4aa8ff'; D.hidratacion.forEach(k => g.fillRect(Math.round(ctx.sOfKm(k) / T * (w - 1)) - 1, 1, 2, 6));
    g.fillStyle = 'rgba(244,239,230,.35)'; for (let k = 5; k <= 40; k += 5) g.fillRect(Math.round(ctx.sOfKm(k) / T * (w - 1)), bot - 6, 1, 6);
    lastPx = -1; marca();
  }
  function marca() { if (!tw) return; const x = Math.round(S.s / ctx.TOTAL * (tw - 1)); if (x === lastPx) return; lastPx = x; mk.style.transform = `translateX(${x - 1}px)`; sh.style.transform = `translateX(${x}px)`; tiraW.setAttribute('aria-valuetext', 'km ' + ctx.kmOf(S.s).toFixed(1)); }
  let arrastre = false, ultSeek = 0;
  const fracDe = e => { const r = tira.getBoundingClientRect(); return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); };
  function burbuja(f) { const s = f * (ctx.TOTAL - 1), km = ctx.kmOf(s), t = D.tramos[tramoDe(km)]; bur.innerHTML = `<b>km ${km.toFixed(1)}</b> ${t ? t.nombre : ''}`; const bw = bur.offsetWidth, W = tiraW.clientWidth, x = Math.min(W - bw / 2 - 2, Math.max(bw / 2 + 2, 4 + f * tw)); bur.style.transform = `translateX(${x - bw / 2}px)`; }
  function irA(e, ya) { if (S.mode !== 'tour') return; const f = fracDe(e), now = performance.now(); burbuja(f); if (ya || now - ultSeek > 90) { ultSeek = now; caf.seek(f * (ctx.TOTAL - 1)); marca(); } }
  tiraW.addEventListener('pointerdown', e => { if (!activo()) return; arrastre = true; try { tiraW.setPointerCapture(e.pointerId); } catch (x) { } tiraW.classList.add('afina'); irA(e, true); e.preventDefault(); });
  tiraW.addEventListener('pointermove', e => { if (arrastre) irA(e); });
  const suelta = e => { if (!arrastre) return; arrastre = false; irA(e, true); setTimeout(() => { if (!arrastre) tiraW.classList.remove('afina'); }, 650); };
  tiraW.addEventListener('pointerup', suelta); tiraW.addEventListener('pointercancel', suelta);

  // ── tramo ──
  const tramoDe = km => { const t = D.tramos; for (let i = 0; i < t.length; i++) if (km < t[i].km1) return i; return t.length - 1; };
  let tUlt = -1, detHasta = 0, detFijo = false, nxUlt = '';
  const dist = m => m >= 950 ? (m / 1000).toFixed(1).replace('.', ',') + ' km' : Math.max(10, Math.round(m / 10) * 10) + ' m';
  function proximo(km) {   // texto de lo que viene, para el detalle desplegado
    const nw = D.hidratacion.find(k => k > km + .03), cl = (D.subidas || []).find(c => c.km1 > km);
    const a = nw ? `💧 Hidratación en <b>${dist((nw - km) * 1000)}</b>` : '💧 No quedan puestos: a meta';
    const b = !cl ? '⛰ No quedan subidas' : cl.km0 <= km ? `⛰ Subiendo ${cl.nombre}: faltan <b>${dist((cl.km1 - km) * 1000)}</b>` : `⛰ ${cl.nombre} en <b>${dist((cl.km0 - km) * 1000)}</b> (+${cl.gain} m)`;
    return `<span>${a}</span><span>${b}</span>`;
  }
  function ponTramo(i) {
    const t = D.tramos[i]; chip.querySelector('.n').textContent = `${i + 1}/${D.tramos.length}`; chip.querySelector('.t').textContent = t.nombre;
    det.querySelector('.tag').textContent = `Tramo ${i + 1} de ${D.tramos.length} · km ${t.km0.toFixed(1)}–${t.km1.toFixed(1)}`; det.querySelector('h3').textContent = t.nombre;
    det.querySelector('.ds').textContent = t.desc; det.querySelector('.cl').innerHTML = '<b>Clave:</b> ' + t.consejo;
  }
  function abreDet(fijo) { detFijo = fijo; det.classList.toggle('full', fijo); if (fijo) det.querySelector('.nx').innerHTML = nxUlt = proximo(ctx.kmOf(S.s)); body.classList.add('cine-det'); det.classList.remove('in'); void det.offsetWidth; det.classList.add('in'); chip.setAttribute('aria-expanded', 'true'); detHasta = fijo ? Infinity : performance.now() + 5500; }
  function cierraDet() { detHasta = 0; detFijo = false; body.classList.remove('cine-det'); det.classList.remove('in', 'full'); chip.setAttribute('aria-expanded', 'false'); }
  chip.onclick = () => (body.classList.contains('cine-det') && detFijo ? cierraDet() : abreDet(true));
  det.onclick = cierraDet;

  // ── avisos de lo que se acerca: hidratación y subida (a 300 m, o ~5 s si va rápido) ──
  let avTxt = '', avHasta = 0;
  function avisos(now) {
    const km = ctx.kmOf(S.s), vel = (S.v || 3) * (S.scale || 30), umbral = Math.max(300, vel * 5) / 1000; let txt = '';
    const nw = D.hidratacion.find(k => k > km - .015);
    if (nw != null && nw - km <= umbral) { const ex = (D.geles || []).includes(nw) ? ' · con gel' : (D.gatorade || []).includes(nw) ? ' · con isotónico' : ''; txt = nw - km > .02 ? `💧 Hidratación en <b>${dist((nw - km) * 1000)}</b>${ex}` : `💧 Puesto de hidratación${ex}`; }
    else { const cl = (D.subidas || []).find(c => c.km0 > km - .01); if (cl && cl.km0 - km <= umbral) txt = `⛰ ${cl.km0 - km > .02 ? `En <b>${dist((cl.km0 - km) * 1000)}</b> empieza` : 'Empieza'} ${cl.nombre}: +${cl.gain} m en ${dist((cl.km1 - cl.km0) * 1000)}`; }
    if (txt) avHasta = now + 2500; else if (now < avHasta) return;
    if (txt === avTxt) return; avTxt = txt;
    if (txt) { av.innerHTML = txt; av.classList.add('in'); } else av.classList.remove('in');
  }

  // ── controles: proxis de los originales ──
  const VEL = [10, 30, 60, 120], CAM = { 0: 'Seguimiento', 3: 'A bordo', 1: 'Dron', 2: 'Cenital', 4: 'Dron bajo' };
  const sonTxt = () => { const t = $('sonido')?.textContent || ''; return /🔇/.test(t) ? '🔇 Sin sonido' : /🔊/.test(t) ? '🔊 Con sonido' : '🔈 Activar'; };
  function pintaHoja() {
    const v = n => hoja.querySelector(`[data-v="${n}"]`);
    v('vel').textContent = '×' + S.scale; v('cam').textContent = '🎥 ' + (CAM[S.cam] || 'Cámara'); v('luz').textContent = S.dia ? '☀️ Pleno día' : '🌅 Hora real'; v('son').textContent = sonTxt();
    hoja.querySelectorAll('[data-q]').forEach(b => b.classList.toggle('on', b.dataset.q === Q.tier));
  }
  function pintaPlay() { play.textContent = S.paused ? '▶' : '⏸'; play.setAttribute('aria-label', S.paused ? 'Seguir' : 'Pausa'); }
  play.onclick = () => { $('bPlay').click(); pintaPlay(); };
  new MutationObserver(pintaPlay).observe($('bPlay'), { childList: true, characterData: true, subtree: true });
  let hojaOn = false;
  function abreHoja(on) { hojaOn = on; pintaHoja(); body.classList.toggle('cine-hoja', on); hoja.setAttribute('aria-hidden', on ? 'false' : 'true'); if (on) despierta(); }
  mas.onclick = () => abreHoja(!hojaOn); velo.onclick = () => abreHoja(false);
  hoja.onclick = e => {
    const b = e.target.closest('button'); if (!b) return; const a = b.dataset.a;
    if (b.dataset.q) { if (b.dataset.q !== Q.tier) recarga(b.dataset.q); return; }
    if (a === 'x') abreHoja(false);
    else if (a === 'vel') { const n = VEL[(VEL.indexOf(S.scale) + 1) % VEL.length]; document.querySelector(`#segSpd button[data-s="${n}"]`)?.click(); }
    else if (a === 'cam') $('bCam').click();
    else if (a === 'luz') $('bLuz').click();
    else if (a === 'son') { $('sonido')?.click(); setTimeout(pintaHoja, 150); }
    else if (a === 'idx') { abreHoja(false); $('bIdx').click(); }
    else if (a === 'plan') { abreHoja(false); $('bPlan').click(); }
    else if (a === 'menu') { abreHoja(false); $('bMenu').click(); }
    pintaHoja();
  };
  // cambiar la calidad recarga la página: se reusa el rescate de game.js (?retoma=1) para volver al mismo km del recorrido
  function recarga(tier) {
    try { localStorage.setItem('caf3d-calidad', tier); sessionStorage.setItem('caf3d-rescate', JSON.stringify({ t: 0, de: Q.tier, a: tier, pend: true, motivo: 'Calidad ' + { alta: 'Alta', media: 'Media', ligera: 'Ligera' }[tier] + '.', est: { modo: 'tour', s: S.s, km: ctx.kmOf(S.s), target: S.target, scale: S.scale, cam: S.cam, dia: S.dia, effort: 1 } })); } catch (e) { }
    const u = new URL(location.href); u.searchParams.set('calidad', tier); u.searchParams.set('retoma', '1'); location.replace(u.href);
  }
  addEventListener('keydown', e => { if (e.key === 'Escape' && hojaOn) abreHoja(false); }, true);

  // ── se esconde sola: 3 s sin tocar recoge los botones; cualquier toque o tecla los devuelve ──
  let ultToque = performance.now();
  function despierta() { ultToque = performance.now(); if (body.classList.contains('cine-quieto')) body.classList.remove('cine-quieto'); }
  addEventListener('pointerdown', despierta, true); addEventListener('keydown', despierta, true);

  // ── activación (teléfono + recorrido) y bucle ligero ──
  let era = false, tAcc = 0;
  function evalua() {
    body.classList.toggle('cine', mq.matches);
    const on = activo(); if (on === era) return; era = on;
    if (on) { tUlt = -1; avTxt = ''; av.classList.remove('in'); cierraDet(); abreHoja(false); despierta(); pintaPlay(); requestAnimationFrame(dibujaTira); }
    else { abreHoja(false); body.classList.remove('cine-quieto', 'cine-det'); }
  }
  mq.addEventListener ? mq.addEventListener('change', evalua) : mq.addListener(evalua);
  new MutationObserver(evalua).observe(body, { attributes: true, attributeFilter: ['data-modo'] });
  new MutationObserver(evalua).observe(hud, { attributes: true, attributeFilter: ['style'] });
  addEventListener('resize', () => { if (era) requestAnimationFrame(dibujaTira); });
  evalua();
  ctx.frameHooks.push((n, t, dt) => {
    if (!era) return; marca(); tAcc += dt; if (tAcc < .1) return; tAcc = 0;
    const now = performance.now(), km = ctx.kmOf(S.s), i = tramoDe(km);
    if (i !== tUlt) { tUlt = i; ponTramo(i); abreDet(false); }
    else if (detHasta && !detFijo && now > detHasta) cierraDet();
    if (detFijo) { const nx = proximo(km); if (nx !== nxUlt) { nxUlt = nx; det.querySelector('.nx').innerHTML = nx; } }
    avisos(now); if (play.textContent !== (S.paused ? '▶' : '⏸')) pintaPlay();
    const quieto = !S.paused && !hojaOn && !arrastre && !detFijo && $('idx').style.display !== 'block' && $('coach')?.style.display !== 'block' && !window.__cafUI?.plan?.abierto && now - ultToque > 3000;
    if (quieto !== body.classList.contains('cine-quieto')) body.classList.toggle('cine-quieto', quieto);
  });
  return { evalua, abreHoja, abreDet, cierraDet, get activo() { return era; } };
}
