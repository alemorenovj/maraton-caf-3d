// «Correr la carrera»: pantalla de estrategia, juego de ritmo con toques y final con medalla. El modelo (energía, agua, fatiga,
// ritmo, impulso) es ui/carrera_modelo.js; aquí solo va la pantalla, el sonido y la vibración. Nada pesado por cuadro: la aguja y
// la zona se mueven con transform y el resto del DOM se toca solo cuando cambia lo que muestra.
import * as M from './carrera_modelo.js?v=1';
const KEY = 'caf3d-estrategia', KEYM = 'caf3d-carrera-marcas';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const vib = p => { try { navigator.vibrate?.(p); } catch (e) { } };

// efectos de sonido sobre el motor de fx/sonido.js (su AudioContext); callan si el botón de sonido está en silencio
const SND = (() => {
  let g = null;
  const tag = () => document.getElementById('sonido') || [...document.body.children].find(n => n.tagName === 'BUTTON' && /Sonido/.test(n.textContent));
  const ctx = () => { const a = window.__sonido?.ctx; if (!a || a.state !== 'running' || /🔇/.test(tag()?.textContent || '')) return null; if (!g || g.context !== a) { g = a.createGain(); g.gain.value = .42; g.connect(a.destination); } return a; };
  const nota = (f, t0, dur, vol, tipo = 'triangle') => { const a = ctx(); if (!a) return; const t = a.currentTime + t0, o = a.createOscillator(), e = a.createGain(); o.type = tipo; o.frequency.setValueAtTime(f, t); e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(vol, t + .006); e.gain.exponentialRampToValueAtTime(.0005, t + dur); o.connect(e); e.connect(g); o.start(t); o.stop(t + dur + .05); };
  const st = n => Math.pow(2, n / 12);
  return {
    toque: z => nota(z === 'rojo' ? 260 : z === 'ok' ? 700 : 520, 0, .05, .1),
    moneda: (perf) => { nota(988, 0, .08, .16, 'square'); nota(1319 * (perf ? st(4) : 1), .07, .26, .16, 'square'); },
    racha: n => { const f = 440 * st(Math.min(n, 18)); nota(f, 0, .1, .14); nota(f * 1.5, .07, .18, .12); },
    rota: () => { nota(330, 0, .16, .12, 'sawtooth'); nota(233, .12, .3, .12, 'sawtooth'); },
    estrella: i => nota(1047 * st(i * 4), .1 + i * .16, .32, .14),
    muro: () => { nota(98, 0, .7, .28, 'sawtooth'); nota(73, .18, .9, .28, 'sine'); },
    bajon: () => { nota(300, 0, .12, .14, 'sawtooth'); nota(200, .1, .3, .14, 'sawtooth'); },
    parcial: ok => ok ? (nota(784, 0, .12, .12), nota(1175, .1, .2, .12)) : nota(392, 0, .25, .12, 'sawtooth'),
    cuenta: f => nota(f, 0, .16, .18, 'square'),
    medalla: () => [523, 659, 784, 1047, 1319].forEach((f, i) => nota(f, i * .11, .45, .14)),
  };
})();

export function crearModoCarrera(caf, ui) {
  const { S, D, ctx } = caf, { sOfKm, kmOf, TOTAL, R, STEP, N } = ctx, $ = id => document.getElementById(id);
  const { fT, fK } = ui.plan.fmt, fP = spk => { const p = Math.round(spk); return Math.floor(p / 60) + ':' + String(p % 60).padStart(2, '0'); };
  const fD = d => (d > 0 ? '+' : d < 0 ? '−' : '±') + (Math.abs(d) >= 3600 ? fT(Math.abs(d)) : fP(Math.abs(d)));
  const pf = M.perfilDesde(caf.gradeAt, sOfKm), PUB = D.hitos.filter(h => h.publico && h.km > .5).map(h => h.km);
  const base = () => ({ pf, target: S.target, agua: D.hidratacion, iso: D.gatorade || [], gelOf: D.geles || [], tramos: D.tramos, publico: PUB });
  // ───── estrategia guardada ─────
  let E = { geles: null, lph: .6, dur: 480 };
  try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v) E = { ...E, ...v }; } catch (e) { }
  if (!Array.isArray(E.geles)) E.geles = M.sugerirGeles(M.planBase(pf, S.target), D.geles);
  const guardaE = () => { try { localStorage.setItem(KEY, JSON.stringify(E)); } catch (e) { } };
  let marcas = {}; try { marcas = JSON.parse(localStorage.getItem(KEYM) || '{}') || {}; } catch (e) { }

  // ═════ pantalla de estrategia ═════
  const es = document.createElement('div'); es.id = 'estrategia'; es.className = 'screen'; es.style.display = 'none';
  es.innerHTML = `<div class="card panel ecard"><button class="px" data-a="x" aria-label="Volver">×</button><div class="tag">Correr la carrera · tu estrategia</div><h1>Arma tu <em>carrera</em></h1>
    <section><label>Ritmo objetivo</label><div id="eObj"></div></section>
    <section><label>Geles <b id="eGn"></b><span class="eh" id="eGk"></span></label><canvas id="ePerf"></canvas><div class="eh">Toca el perfil para poner un gel, tócalo para quitarlo, arrástralo para moverlo. Uno cada 35–45 min es lo habitual.</div>
      <div class="erow"><div class="seg"><button data-g="-" aria-label="Un gel menos">−</button><button data-g="+" aria-label="Un gel más">+</button></div><button data-g="s">Sugerir</button>
      <span class="eleg"><span><i style="background:var(--accent)"></i>energía</span><span><i style="background:var(--water)"></i>agua</span><span><i style="background:var(--bone);border-radius:1px;transform:rotate(45deg)"></i>gel oficial</span></span></div></section>
    <section><label>Agua <b id="eL"></b><span class="eh" id="eLt"></span></label><input type="range" id="eLph" min=".2" max="1" step=".1" aria-label="Litros por hora"></section>
    <section><label>Duración de la partida</label><div class="seg" id="eDur"><button data-d="240">4 min</button><button data-d="480">8 min</button></div></section>
    <div class="startacts"><div class="ever" id="eVer"></div><button class="go" id="eGo">A la salida →</button><button class="lnk" data-a="x">Volver</button></div></div>`;
  document.body.appendChild(es);
  ui.plan.widget(es.querySelector('#eObj'), true);
  const cv = es.querySelector('#ePerf'), g2 = cv.getContext('2d'); let sim = null, simT = 0, eW = 0, eH = 0;
  const kmX = km => 8 + km / M.KM * (eW - 16), xKm = x => clamp((x - 8) / (eW - 16) * M.KM, .5, M.KM - .5);
  let eMin = Infinity, eMax = -Infinity; for (const e of R.e) { eMin = Math.min(eMin, e); eMax = Math.max(eMax, e); }
  function dibujaPerfil() {
    const w = cv.clientWidth, h = cv.clientHeight; if (!w) return; const dpr = Math.min(devicePixelRatio, 2); if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    eW = w; eH = h; const g = g2; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    const top = 34, bot = h - 16, yE = e => bot - (e - eMin + 4) / (eMax - eMin + 10) * (bot - top) * .55;
    for (let x = 8; x < w - 8; x++) { const km = xKm(x), s = sOfKm(km), gr = caf.gradeAt(s), e = R.e[clamp(Math.round(s / STEP), 0, N - 1)], y = yE(e); g.fillStyle = gr > 1.2 ? (gr > 3 ? '#ff4a2a' : '#ff8a5c') : gr < -1.2 ? '#3ecf8e' : '#f2c94c'; g.globalAlpha = .45; g.fillRect(x, y, 1, bot - y); }
    g.globalAlpha = 1; g.font = '10px Inter,sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(244,239,230,.5)';
    for (let k = 5; k <= 40; k += 5) { const x = kmX(k); g.fillRect(x, bot, 1, 3); g.fillText(k, x, h - 3); }
    if (sim) {
      const yC = v => bot - v / 100 * (bot - top);
      if (sim.muroKm != null) { const x = kmX(sim.muroKm); g.fillStyle = 'rgba(255,90,60,.18)'; g.fillRect(x, top - 4, w - 8 - x, bot - top + 4); g.fillStyle = '#ff8a6a'; g.textAlign = 'left'; g.fillText('muro', Math.min(x + 4, w - 36), top + 8); }
      for (const [k, col] of [['H', '#4aa8ff'], ['E', '#ffd23f']]) { g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); sim.curva.forEach((p, i) => { const x = kmX(p.km), y = yC(p[k]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); }
    }
    // puestos (agua, isotónico), gel oficial y tus geles
    D.hidratacion.forEach(k => { g.fillStyle = (D.gatorade || []).includes(k) ? '#ff9a3c' : '#4aa8ff'; g.beginPath(); g.arc(kmX(k), top - 8, 2.2, 0, 6.3); g.fill(); });
    (D.geles || []).forEach(k => { const x = kmX(k); g.save(); g.translate(x, top - 8); g.rotate(Math.PI / 4); g.fillStyle = '#f4efe6'; g.fillRect(-4, -4, 8, 8); g.restore(); });
    E.geles.forEach((k, i) => { const x = kmX(k); g.fillStyle = 'rgba(255,210,63,.35)'; g.fillRect(x - .5, 24, 1, bot - 24); g.fillStyle = drag && drag.i === i ? '#fff' : '#ffd23f'; g.beginPath(); g.arc(x, 13, 10, 0, 6.3); g.fill(); g.fillStyle = '#1a1400'; g.font = '700 11px Inter,sans-serif'; g.textAlign = 'center'; g.fillText(i + 1, x, 17); });
  }
  function previa() {
    E.geles.sort((a, b) => a - b); sim = M.simularPlan({ ...base(), geles: E.geles, lph: E.lph });
    es.querySelector('#eGn').textContent = E.geles.length || 'ninguno'; es.querySelector('#eGk').textContent = E.geles.length ? 'en los km ' + E.geles.map(fK).join(' · ') : 'sin geles el glucógeno no llega a meta';
    es.querySelector('#eL').textContent = E.lph.toFixed(1).replace('.', ',') + ' L/h';
    const tot = E.lph * S.target / 3600, porP = E.lph * S.target / 3600 / D.hidratacion.length * 1000;
    es.querySelector('#eLt').textContent = `unos ${tot.toFixed(1).replace('.', ',')} L en toda la carrera, ${Math.round(porP / 10) * 10} ml por puesto`;
    es.querySelector('#eLph').value = E.lph; es.querySelectorAll('#eDur button').forEach(b => b.classList.toggle('on', +b.dataset.d === E.dur));
    const v = es.querySelector('#eVer'); v.className = 'ever ' + sim.tipo; v.innerHTML = `${sim.txt}<small>Vista previa con el plan bien ejecutado: línea amarilla, energía; azul, hidratación.</small>`;
    dibujaPerfil(); guardaE();
  }
  const previaPronto = () => { cancelAnimationFrame(simT); simT = requestAnimationFrame(previa); };
  ui.plan.alCambiar(() => { if (es.style.display !== 'none') previaPronto(); });
  // gestos sobre el perfil: tocar vacío pone un gel, tocar uno lo quita, arrastrar lo mueve
  let drag = null;
  const px = ev => { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  cv.addEventListener('pointerdown', ev => { const [x] = px(ev); let i = E.geles.findIndex(k => Math.abs(kmX(k) - x) < 14);
    if (i < 0) { if (E.geles.length >= 8) { ui.plan.aviso('Máximo 8 geles.'); return; } E.geles.push(Math.round(xKm(x) * 10) / 10); i = E.geles.length - 1; drag = { i, x0: x, nuevo: true, mov: false }; }
    else drag = { i, x0: x, nuevo: false, mov: false };
    cv.setPointerCapture(ev.pointerId); previaPronto(); });
  cv.addEventListener('pointermove', ev => { if (!drag) return; const [x] = px(ev); if (Math.abs(x - drag.x0) > 5) drag.mov = true; if (!drag.mov) return; E.geles[drag.i] = Math.round(xKm(x) * 10) / 10; dibujaPerfil(); previaPronto(); });
  const suelta = () => { if (!drag) return; if (!drag.mov && !drag.nuevo) E.geles.splice(drag.i, 1); drag = null; previaPronto(); };
  cv.addEventListener('pointerup', suelta); cv.addEventListener('pointercancel', suelta);
  es.querySelector('.erow').onclick = e => { const a = e.target.closest('button')?.dataset.g; if (!a) return;
    if (a === 's') E.geles = M.sugerirGeles(M.planBase(pf, S.target), D.geles);
    else if (a === '-') E.geles.pop();
    else if (a === '+' && E.geles.length < 8) { const p = [0, ...E.geles.slice().sort((x, y) => x - y), M.KM]; let b = 0; for (let i = 1; i < p.length; i++) if (p[i] - p[i - 1] > p[b + 1] - p[b]) b = i - 1; E.geles.push(Math.round((p[b] + p[b + 1]) / 2 * 10) / 10); }
    previa(); };
  es.querySelector('#eLph').oninput = e => { E.lph = Math.round(+e.target.value * 10) / 10; previaPronto(); };
  es.querySelector('#eDur').onclick = e => { const b = e.target.closest('button'); if (!b) return; E.dur = +b.dataset.d; previa(); };
  es.addEventListener('click', e => { if (e.target.closest('[data-a="x"]')) { es.style.display = 'none'; caf.menu(); } });
  es.querySelector('#eGo').onclick = () => { es.style.display = 'none'; iniciar(); };
  addEventListener('resize', () => { if (es.style.display !== 'none') dibujaPerfil(); });
  function estrategia() {
    S.running = false; ['start', 'end'].forEach(id => $(id).style.display = 'none'); $('hud').style.display = 'none'; pausa.classList.remove('on');
    es.style.display = 'flex'; es.scrollTop = 0; requestAnimationFrame(previa);
  }

  // ═════ pantalla de juego ═════
  const el = document.createElement('div'); el.id = 'carrera';
  el.innerHTML = `<div class="cpill panel"><b id="crKm">0,0</b><span>km</span><i></i><b id="crT">0:00:00</b><i></i><b id="crDel" class="ok">±0:00</b><button id="crPausa" aria-label="Pausa">II</button></div>
    <div class="csub" id="crSub"></div><div class="cmsg" id="crMsg"></div>
    <div class="cbot"><div class="ctap" id="crTap" aria-label="Correr: toca cada 2 o 3 segundos"></div>
      <div class="cmed" id="crMed"><div class="cpace"><b id="crPace">—</b><span>/km</span><em id="crEst">en zona</em></div>
        <div class="cbar"><i class="r" id="crRoja"></i><i class="z" id="crZona"></i><span class="l" style="left:8px">lento</span><span class="l" style="right:8px">rápido</span><i class="n" id="crAguja"></i></div></div>
      <div class="cbars" id="crBarras"><div id="crEw"><span>Energía</span><i><b id="crE"></b></i></div><div id="crHw"><span>Agua</span><i><b id="crH"></b></i></div><div id="crFw" class="fat"><span>Fatiga</span><i><b id="crF"></b></i></div></div>
      <div class="cbtn" id="crBtn"><div class="cring" id="crRing"></div><span>Correr</span><small id="crHint">toca cada 2–3 s</small></div>
      <button class="cpop gel" id="crGel">Gel<small>toca ya · G</small><i></i></button><button class="cpop agua" id="crAgua">Beber<small>toca ya · B</small><i></i></button></div>
    <div class="cpausa" id="crPau"><div class="card panel"><h3>Pausa</h3><button class="go" data-p="seguir">Seguir</button><button data-p="cam">Cambiar cámara</button><button data-p="estr">Ajustar estrategia</button><button data-p="menu">Salir al menú</button></div></div>`;
  $('hud').appendChild(el);
  const q = id => el.querySelector('#' + id), pausa = q('crPau'), aguja = q('crAguja'), zona = q('crZona'), roja = q('crRoja'), ring = q('crRing'), bar = el.querySelector('.cbar');
  const W = { }; const put = (k, node, v, prop = 'textContent') => { if (W[k] !== v) { W[k] = v; node[prop] = v; } };
  let st = null, listo = false, barW = 0, msgHasta = 0, subHasta = 0, beatPrev = 0, ultKmAviso = -1, bajada = false, avisados = new Set(), finT = 0, cola = [];
  const medir = () => { barW = bar.clientWidth || 300; }; addEventListener('resize', medir);
  // mensajes centrales (uno a la vez, con cola corta) y leyenda bajo la píldora
  function msg(html, ms = 1600, prio = 0) { const now = performance.now(); if (now < msgHasta && prio < (msg.p || 0)) { if (cola.length < 3) cola.push([html, ms, prio]); return; } msg.p = prio; msgHasta = now + ms; q('crMsg').innerHTML = `<div style="animation-duration:${ms}ms">${html}</div>`; }
  function sub(html, ms = 2600) { q('crSub').innerHTML = html; q('crSub').classList.add('on'); subHasta = performance.now() + ms; }
  function fx(txt, col = '#fff', dx = 0) { const n = document.createElement('div'); n.className = 'cfx'; n.textContent = txt; n.style.color = col; const b = q('crBtn').getBoundingClientRect(); n.style.left = (b.left + b.width / 2 + dx) + 'px'; n.style.top = (b.top - 26) + 'px'; el.appendChild(n); n.addEventListener('animationend', () => n.remove()); }
  // toque: el botón entero de la mitad inferior; el gel y el agua van aparte
  function tocar() {
    if (!st || !listo || S.paused || st.estado !== 'corre') return;
    const r = M.toque(st), z = st.roja ? 'rojo' : st.zona ? 'ok' : 'lento'; SND.toque(z); vib(6);
    q('crBtn').animate([{ transform: 'scale(.9)' }, { transform: 'scale(1)' }], { duration: 160, easing: 'cubic-bezier(.3,1.6,.5,1)' });
    if (r.ritmo) { fx('al ritmo · empujón', '#ffd23f'); SND.moneda(true); }
  }
  q('crTap').addEventListener('pointerdown', e => { e.preventDefault(); tocar(); });
  const beber = () => { if (!st || !listo || S.paused) return; const r = M.beber(st); if (!r) return; q('crAgua').classList.remove('on'); SND.moneda(r.perf); vib(r.perf ? [12, 30, 12] : 14); fx(r.perf ? 'perfecto · agua' : 'agua', '#7cc4ff', 120); };
  const gel = () => { if (!st || !listo || S.paused) return; const r = M.tomarGel(st); if (!r) return; q('crGel').classList.remove('on'); SND.moneda(r.perf); vib(r.perf ? [12, 30, 12] : 14); fx(r.perf ? 'perfecto · gel' : 'gel', '#ffd23f', -120); };
  q('crAgua').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); beber(); });
  q('crGel').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); gel(); });
  const pausar = on => { if (!st || st.estado !== 'corre') return; S.paused = on; pausa.classList.toggle('on', on); };
  q('crPausa').onclick = () => pausar(true);
  pausa.onclick = e => { const a = e.target.closest('button')?.dataset.p; if (!a) return;
    if (a === 'seguir') pausar(false); else if (a === 'cam') { $('bCam').click(); pausar(false); } else if (a === 'estr') { pausa.classList.remove('on'); st = null; estrategia(); } else if (a === 'menu') { pausa.classList.remove('on'); st = null; caf.menu(); } };
  addEventListener('keydown', e => {
    if (S.mode !== 'race' || !S.running || !st || ui.plan.abierto) return; const k = e.key.toLowerCase();
    if (k === ' ') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) tocar(); }
    else if (k === 'b') { e.stopImmediatePropagation(); beber(); } else if (k === 'g') { e.stopImmediatePropagation(); gel(); }
    else if (k === 'escape' || k === 'p') { e.stopImmediatePropagation(); pausar(!S.paused); }
    else if (k === 'arrowleft' || k === 'arrowright' || k === 't') e.stopImmediatePropagation();
  }, true);

  function crear(o, prev) {
    st = M.crearCarrera({ ...base(), geles: o.geles, lph: o.lph, dur: o.dur, target: o.target || S.target }); if (prev) M.importar(st, prev);
    avisados = new Set((D.subidas || []).filter(c => c.km0 < st.km).flatMap(c => [c.nombre + 'a', c.nombre + 'b'])); ultKmAviso = -1; bajada = false; cola = []; finT = 0;
    for (const k in W) delete W[k]; q('crMsg').innerHTML = ''; q('crSub').classList.remove('on'); q('crGel').classList.remove('on'); q('crAgua').classList.remove('on'); el.className = '';
  }
  function iniciar() {
    crear(E); listo = false; caf.start('race'); S.scale = st.esc; S.cam = 0; medir(); sinc();
    const ini = ui.velo ? ui.velo.cubrirInicio() : Promise.resolve();
    ini.then(() => { medir(); let n = 3; const tic = () => { if (!st) return; if (n > 0) { msg(`<div class="big serif">${n}</div>`, 900, 9); SND.cuenta(440); n--; setTimeout(tic, 800); } else { msg('<h4>A correr</h4><p>Un toque cada 2 o 3 segundos: aguja en verde.</p>', 1800, 9); SND.cuenta(880); vib(40); listo = true; } }; setTimeout(tic, 250); });
  }
  function retomar(r) {
    if (!r || !r.plan) return false; E = { ...E, ...r.plan, geles: r.plan.geles || E.geles }; if (r.plan.target) S.target = r.plan.target;
    crear(E, r.st); caf.start('race'); S.scale = st.esc; medir(); sinc(); listo = true;
    (ui.velo ? ui.velo.cubrirInicio() : Promise.resolve()).then(() => { medir(); msg(`<h4>Seguimos en el km ${fK(st.km)}</h4><p>El equipo se quedó sin memoria gráfica y bajó la calidad.</p>`, 3200, 5); });
    return true;
  }
  const estado = () => st && st.estado === 'corre' && S.mode === 'race' ? { plan: { target: st.o.target, geles: st.o.geles, lph: st.o.lph, dur: st.o.dur }, st: M.exportar(st) } : null;

  // ───── cada cuadro (desde step() del motor) ─────
  function sinc() { S.s = Math.min(sOfKm(st.km), TOTAL - 1); S.clock = st.t; S.v = st.v; S.energy = st.E; S.hyd = st.H; S.wall = st.muro; S.wallKm = st.muroKm; S.effort = st.rz < .95 ? 0 : st.rz < 1.04 ? 1 : st.rz < 1.08 ? 2 : 3; }
  function paso(dtR) {
    if (!st) return; if (!listo) { sinc(); hud(); return; }
    if (st.estado === 'corre') { M.avanzar(st, Math.min(dtR, .05)); sinc(); sucesos(); avisos(); }
    hud();
    if (st.estado !== 'corre' && !finT) { finT = 1; S.v = 0; setTimeout(final, st.estado === 'fin' ? 900 : 1600); }
  }
  function sucesos() {
    for (const e of st.ev) {
      if (e.tipo === 'km') { if (e.ok) { SND.racha(e.racha); fx(e.racha > 1 ? `km ${e.n} · racha ×${e.racha}` : `km ${e.n} en zona`, '#7cf0b6'); if (e.racha % 5 === 0) sub(`Racha de <b>${e.racha} km</b> en zona`); } else if (e.rota >= 3) { SND.rota(); fx(`racha de ${e.rota} rota`, '#ff8a6a'); } }
      else if (e.tipo === 'parcial') { const d = e.t - e.plan, ok = d <= 0; SND.parcial(ok); msg(`<p>${e.km} km · ${fT(e.t)}</p><h4 class="${ok ? 'ok' : 'mal'}">${fD(Math.round(d))}</h4>`, 1300, 1); }
      else if (e.tipo === 'tramo') { const t = D.tramos[e.i], n = e.estrellas; msg(`<p>Tramo ${e.i + 1} de ${D.tramos.length} · ${t.nombre}</p><div class="st">${[0, 1, 2].map(i => i < n ? `<b style="animation-delay:${.12 + i * .16}s">★</b>` : '☆').join('')}</div>`, 1900, 2); for (let i = 0; i < n; i++) SND.estrella(i); if (n === 3) vib([10, 40, 10, 40, 10]); }
      else if (e.tipo === 'muro') { SND.muro(); vib([80, 50, 80]); msg('<h4>El muro</h4><p>Sin glucógeno: vas al trote. Solo un gel te saca de aquí.</p>', 3200, 8); q('crMsg').firstChild?.classList.add('rojo'); }
      else if (e.tipo === 'sale-muro') { msg('<h4>Sales del muro</h4><p>El gel llegó. Vuelve a la zona sin pasarte.</p>', 2000, 3); }
      else if (e.tipo === 'bajon') { SND.bajon(); vib(60); msg('<h4 class="mal">Bajón</h4><p>Te pasaste del rojo y el cuerpo frenó. Toca más espaciado.</p>', 1800, 4); }
      else if (e.tipo === 'puesto-perdido') { fx('puesto perdido', '#ff8a6a', 120); q('crAgua').classList.remove('on'); }
      else if (e.tipo === 'gel-perdido') { msg(`<h4 class="mal">Se te pasó el gel</h4><p>El del km ${fK(e.g.km)} se quedó en el bolsillo.</p>`, 1800, 3); q('crGel').classList.remove('on'); }
      else if (e.tipo === 'gel-llega') fx('+ energía del gel', '#ffd23f', -100);
      else if (e.tipo === 'abandono') { SND.muro(); vib([120, 60, 120]); msg('<h4 class="mal">No puedes seguir</h4><p>Deshidratado y forzando: te retiras.</p>', 3000, 9); }
      else if (e.tipo === 'fin') { SND.medalla(); vib([30, 40, 30, 40, 80]); msg('<h4>Meta</h4>', 1500, 9); }
    }
    st.ev.length = 0;
    if (cola.length && performance.now() > msgHasta) { const [h, ms, p] = cola.shift(); msg(h, ms, p); }
  }
  // avisos del terreno, del público y de los hitos
  function avisos() {
    const km = st.km;
    for (const c of D.subidas || []) {
      if (km > c.km0 - .4 && km < c.km0 && !avisados.has(c.nombre + 'a')) { avisados.add(c.nombre + 'a'); sub(`En 400 m empieza <b>${c.nombre}</b>: afloja`, 3200); }
      if (km >= c.km0 && km < c.km1 && !avisados.has(c.nombre + 'b')) { avisados.add(c.nombre + 'b'); sub(`Sube <b>${c.nombre}</b> (+${c.gain} m): esfuerzo, no ritmo`, 3200); }
    }
    const b = M.pendiente(pf, km) < -1.5 && M.pendiente(pf, km + .15) < -1.5;
    if (b && !bajada && km - ultKmAviso > .8) { ultKmAviso = km; sub('Bajada: <b>velocidad gratis</b>, toca menos', 2600); }
    bajada = b;
    if (st.publico && !avisados.has('p' + Math.round(km))) { avisados.add('p' + Math.round(km)); sub('Público: <b>toca con los aplausos</b>', 3000); }
    for (const h of D.hitos) if (Math.abs(h.km - km) < .06 && !avisados.has('h' + h.km) && performance.now() > subHasta) { avisados.add('h' + h.km); sub(h.nombre, 2400); }
  }
  // ───── pantalla (solo cambios) ─────
  const vMed = () => M.KM * 1000 / st.o.target, AX0 = .6, AX1 = 1.34, xq = qv => clamp((qv - AX0) / (AX1 - AX0), 0, 1) * barW;
  function hud() {
    if (!barW) medir(); const now = performance.now(), vm = vMed(), vp = st.pl.v(st.km), [lo, hi] = M.zonaAt(st);
    aguja.style.transform = `translateX(${xq(st.v / vm).toFixed(1)}px)`;
    const x0 = xq(lo * vp / vm), x1 = xq(hi * vp / vm);
    put('zx', zona.style, `translateX(${x0.toFixed(1)}px)`, 'transform'); put('zw', zona.style, (x1 - x0).toFixed(1) + 'px', 'width'); put('rx', roja.style, `translateX(${x1.toFixed(1)}px)`, 'transform');
    const z = !listo ? 'z-ok' : st.muro ? 'z-lento' : st.roja ? 'z-rojo' : st.zona ? 'z-ok' : 'z-lento';
    put('cls', el, z + (st.muro ? ' muro' : ''), 'className');
    put('pace', q('crPace'), fP(1000 / Math.max(.5, st.v)));
    put('est', q('crEst'), st.muro ? 'el muro' : st.bajonHasta > st.tr ? 'bajón' : st.roja ? 'demasiado rápido' : st.zona ? 'en zona' : 'lento');
    put('hint', q('crHint'), !listo ? 'prepárate' : st.muro ? 'trota, toma un gel' : st.roja ? 'espacia los toques' : st.zona ? 'así, cada 2–3 s' : 'toca más seguido');
    put('km', q('crKm'), fK(Math.floor(st.km * 10) / 10)); put('t', q('crT'), fT(st.t));
    const d = Math.round(st.t - st.pl.t(st.km)); put('del', q('crDel'), fD(d)); put('delc', q('crDel'), d > 15 ? 'mal' : 'ok', 'className');
    put('e', q('crE').style, `scaleX(${(Math.round(st.E) / 100).toFixed(2)})`, 'transform'); put('h', q('crH').style, `scaleX(${(Math.round(st.H) / 100).toFixed(2)})`, 'transform');
    put('eb', q('crEw'), st.E < 20 ? 'bajo' : '', 'className'); put('hb', q('crHw'), st.H < 40 ? 'bajo' : '', 'className');
    put('fw', q('crFw'), st.F > 6 || st.bajonHasta > st.tr ? 'fat on' : 'fat', 'className'); put('f', q('crF').style, `scaleX(${(Math.round(st.F) / 100).toFixed(2)})`, 'transform');
    // anillo: el impulso que queda (se encoge al apagarse); late con los aplausos del público
    const k = clamp(st.d, 0, 1.6) / 1.6; put('ring', ring.style, `scale(${(1 + .22 * k).toFixed(2)})`, 'transform'); put('ringo', ring.style, (.25 + .75 * k).toFixed(2), 'opacity');
    if (st.publico) { const ph = st.tr % 2; if (ph < beatPrev) q('crBtn').animate([{ boxShadow: '0 0 0 0 rgba(255,210,63,.9)' }, { boxShadow: '0 0 0 26px rgba(255,210,63,0)' }], { duration: 600 }); beatPrev = ph; }
    // gel y agua junto al pulgar, con la barra del tiempo que queda
    const pa = st.estado === 'corre' ? M.puestoActivo(st) : null, ga = st.estado === 'corre' ? M.gelActivo(st) : null;
    put('pa', q('crAgua'), pa ? 'cpop agua on' + (Math.abs(pa.s) <= M.P.V_PERF ? ' ya' : '') : 'cpop agua', 'className');
    if (pa) put('paw', q('crAgua').lastChild.style, `scaleX(${clamp((pa.s + M.P.V_DESP) / (M.P.V_ANTES + M.P.V_DESP), 0, 1).toFixed(2)})`, 'transform');
    put('ga', q('crGel'), ga ? 'cpop gel on' + (Math.abs(ga.s) <= M.P.G_PERF ? ' ya' : '') : 'cpop gel', 'className');
    if (ga) put('gaw', q('crGel').lastChild.style, `scaleX(${clamp((ga.s + M.P.G_DESP) / (M.P.G_ANTES + M.P.G_DESP), 0, 1).toFixed(2)})`, 'transform');
    if (subHasta && now > subHasta) { subHasta = 0; q('crSub').classList.remove('on'); }
  }

  // ═════ final ═════
  const CAUSA = {
    rapido: b => `Saliste por encima de la zona en los primeros 12 km y lo pagaste en el km ${fK(b.muroKm ?? b.abandonoKm)}: el glucógeno que se quema de más al principio no vuelve.`,
    geles: b => `Con ${b.gN} gel${b.gN === 1 ? '' : 'es'}${b.gT < b.gN ? ` (tomaste ${b.gT})` : ''} el glucógeno no alcanza: chocaste en el km ${fK(b.muroKm ?? b.abandonoKm)}. Uno cada 40 min lo evita.`,
    agua: b => `Te faltó agua: con ${E.lph.toFixed(1).replace('.', ',')} L/h y ${b.pOk} de ${b.pN} puestos, desde la mitad todo cuesta más.`,
    ritmo: b => `Chocaste con el muro en el km ${fK(b.muroKm ?? b.abandonoKm)}: pasaste demasiado tiempo en rojo, y cada bajón gasta energía y deja huella hasta la meta.`,
    zona: () => 'Estuviste fuera de la zona demasiado tiempo: el reloj se fue en los tramos lentos.',
    lento: () => 'Te quedaste por debajo de la zona: toca un poco más seguido en el llano.',
  };
  function final() {
    if (!st) return; const b = M.balance(st), key = String(st.o.target), prev = marcas[key];
    let nueva = false; if (b.fin && (!prev || b.t < prev.t)) { marcas[key] = { t: Math.round(b.t), est: Math.max(b.est, prev?.est || 0) }; nueva = true; } else if (b.fin && prev && b.est > prev.est) marcas[key].est = b.est;
    try { localStorage.setItem(KEYM, JSON.stringify(marcas)); } catch (e) { } pintaMejor();
    S.running = false; $('hud').style.display = 'none';
    const tn = D.tramos, gano = b.gano && b.gano.x < -5 ? `Ganaste la carrera en <b>${tn[b.gano.i].nombre}</b> (${fD(Math.round(b.gano.x))} contra el plan)` : '', perdio = b.perdio && b.perdio.x > 5 ? `la perdiste en <b>${tn[b.perdio.i].nombre}</b> (${fD(Math.round(b.perdio.x))})` : '';
    const por = !b.fin ? CAUSA[b.causa === 'zona' || b.causa === 'lento' ? 'agua' : b.causa]?.(b) || '' : b.muroKm != null ? (CAUSA[b.causa]?.(b) || '') : [gano, perdio].filter(Boolean).join(' y ') + (gano || perdio ? '.' : '') + (b.d > 0 && b.causa ? ' ' + CAUSA[b.causa](b) : '');
    const med = b.fin ? `<div class="medal ${b.medalla}">${{ oro: 'Oro', plata: 'Plata', bronce: 'Bronce' }[b.medalla]}</div>` : '<div class="medal no">Sin meta</div>';
    const tit = b.fin ? `<h1><span data-n="${Math.round(b.t)}" data-f="t">0:00:00</span><em>${b.d <= 0 ? 'objetivo cumplido' : 'en meta'}${nueva && prev && b.t < prev.t ? ' · mejor marca' : ''}</em></h1>` : `<h1>Km ${fK(b.abandonoKm)}<em>${b.muroKm != null ? `el muro en el km ${fK(b.muroKm)} y el abandono` : 'abandono'}</em></h1>`;
    $('endC').innerHTML = `<div class="cfin">${med}${tit}<p class="sub">${b.fin ? `Objetivo ${fT(b.T)} · <b class="${b.d <= 0 ? 'ok' : 'mal'}">${fD(Math.round(b.d))}</b>` : `Objetivo ${fT(b.T)}`}${prev && b.fin ? ` · tu mejor: ${fT(Math.min(prev.t, b.t))}` : ''}</p>
      <div class="kpis"><div><b><i data-n="${b.est}">0</i>/${b.max}</b><span>estrellas en los ${tn.length} tramos</span></div><div><b><i data-n="${b.rachaMax}">0</i> km</b><span>racha máxima en zona</span></div><div><b>${b.gT}/${b.gN}</b><span>geles tomados a tiempo</span></div><div><b>${b.pOk}/${b.pN}</b><span>puestos, ${b.pPerf} en el momento justo</span></div></div>
      ${por ? `<p class="por">${por}</p>` : ''}
      <div class="acts"><button class="go" id="cfR">Revancha</button><button class="go alt" id="cfE">Ajustar estrategia</button><button class="go alt" id="cfS">Compartir</button><button class="lnk" id="cfM">Menú</button></div></div>`;
    $('end').style.display = 'flex'; $('end').scrollTop = 0;
    $('cfR').onclick = () => { $('end').style.display = 'none'; iniciar(); }; $('cfE').onclick = estrategia; $('cfM').onclick = () => caf.menu();
    $('cfS').onclick = async () => { const c = await lienzo(b); ui.plan.compartirLienzo(c, `maraton-caf-3d-${fT(b.t).replace(/:/g, '-')}.png`, b.fin ? `Corrí el Maratón CAF en 3D: ${fT(b.t)} (objetivo ${fT(b.T)}), ${b.est}/${b.max} estrellas. Arma tu estrategia y córrela:` : `Choqué en el km ${fK(b.abandonoKm)} del Maratón CAF en 3D. Arma tu estrategia y córrela:`, 'Maratón CAF en 3D'); };
    // recuento animado
    const t0 = performance.now(), ns = [...$('endC').querySelectorAll('[data-n]')];
    const anim = now => { const k = Math.min(1, (now - t0) / 1100), e = 1 - Math.pow(1 - k, 3); ns.forEach(n => { const v = +n.dataset.n * e; n.textContent = n.dataset.f === 't' ? fT(v) : Math.round(v); }); if (k < 1) requestAnimationFrame(anim); };
    requestAnimationFrame(anim); if (b.fin) setTimeout(() => SND.medalla(), 300);
    window.__cafCarreraFin = b;
  }
  // imagen vertical 1080×1920 del resultado (mismo estilo que la del plan)
  async function lienzo(b) {
    try { await Promise.all(['400 190px "Instrument Serif"', 'italic 400 60px "Instrument Serif"', '600 36px Inter', '400 30px Inter'].map(f => document.fonts.load(f))); } catch (e) { }
    const Wc = 1080, Hc = 1920, c = document.createElement('canvas'); c.width = Wc; c.height = Hc; const g = c.getContext('2d');
    const SER = '"Instrument Serif", Georgia, serif', INT = 'Inter, system-ui, sans-serif', BONE = '#f4efe6', MUTE = '#8b8f9a', ACC = '#ffd23f';
    const bg = g.createLinearGradient(0, 0, 0, Hc); bg.addColorStop(0, '#1c2238'); bg.addColorStop(.42, '#10131d'); bg.addColorStop(1, '#0a0c12'); g.fillStyle = bg; g.fillRect(0, 0, Wc, Hc);
    const txt = (s, x, y, font, col, al = 'left') => { g.font = font; g.fillStyle = col; g.textAlign = al; g.fillText(s, x, y); };
    { let a = Infinity, bb = -Infinity, cz = Infinity, dd = -Infinity; for (let i = 0; i < N; i++) { a = Math.min(a, R.x[i]); bb = Math.max(bb, R.x[i]); cz = Math.min(cz, R.z[i]); dd = Math.max(dd, R.z[i]); }
      const sc = Math.min(900 / (bb - a), 240 / (dd - cz)), ox = 90 + (900 - (bb - a) * sc) / 2, oy = 220 + (240 - (dd - cz) * sc) / 2, X = i => ox + (R.x[i] - a) * sc, Z = i => oy + (R.z[i] - cz) * sc;
      const lim = b.fin ? N : Math.round(sOfKm(b.abandonoKm || 0) / STEP);
      g.lineJoin = g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 8; g.beginPath(); for (let i = 0; i < N; i += 3) i ? g.lineTo(X(i), Z(i)) : g.moveTo(X(i), Z(i)); g.stroke();
      g.strokeStyle = 'rgba(255,210,63,.85)'; g.lineWidth = 6; g.beginPath(); for (let i = 0; i < lim; i += 3) i ? g.lineTo(X(i), Z(i)) : g.moveTo(X(i), Z(i)); g.stroke(); }
    g.font = `600 30px ${INT}`; g.fillStyle = ACC; g.textAlign = 'left'; let cx = 90; for (const ch of 'MARATÓN CAF · EN 3D') { g.fillText(ch, cx, 160); cx += g.measureText(ch).width + 5; }
    txt(b.fin ? 'Corrí la carrera en' : 'Llegué hasta el', 90, 590, `italic 400 58px ${SER}`, MUTE);
    txt(b.fin ? fT(b.t) : 'km ' + fK(b.abandonoKm), 84, 770, `400 190px ${SER}`, BONE);
    txt(b.fin ? `objetivo ${fT(b.T)} · ${fD(Math.round(b.d))}` : `objetivo ${fT(b.T)} · ${b.muroKm != null ? 'el muro en el km ' + fK(b.muroKm) : 'abandono'}`, 90, 834, `400 34px ${INT}`, b.fin && b.d <= 0 ? '#3ecf8e' : '#cfccc4');
    if (b.medalla) { const col = { oro: ['#fff1a8', '#f5c11a'], plata: ['#ffffff', '#c9ced6'], bronce: ['#ffd2a6', '#cd7f32'] }[b.medalla], rg = g.createRadialGradient(880, 520, 10, 900, 540, 110); rg.addColorStop(0, col[0]); rg.addColorStop(1, col[1]); g.fillStyle = rg; g.beginPath(); g.arc(900, 540, 100, 0, 6.3); g.fill(); txt({ oro: 'Oro', plata: 'Plata', bronce: 'Bronce' }[b.medalla], 900, 556, `400 48px ${SER}`, '#1a1400', 'center'); }
    // estrellas por tramo
    const y0 = 940; txt('TRAMO', 90, y0, `600 22px ${INT}`, MUTE); txt('ESTRELLAS', 990, y0, `600 22px ${INT}`, MUTE, 'right'); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(90, y0 + 14, 900, 2);
    D.tramos.forEach((t, i) => { const y = y0 + 64 + i * 58, n = st.estrellas[i]; let nm = t.nombre; g.font = `400 30px ${INT}`; while (g.measureText(nm).width > 700 && nm.length > 8) nm = nm.slice(0, -2); if (nm !== t.nombre) nm = nm.trim() + '…';
      txt(nm, 90, y, `400 30px ${INT}`, n == null ? 'rgba(244,239,230,.35)' : BONE); for (let k = 0; k < 3; k++) txt('★', 990 - (2 - k) * 46, y + 2, `400 40px ${INT}`, n != null && k < n ? ACC : 'rgba(255,255,255,.16)', 'right'); });
    const y1 = y0 + 64 + D.tramos.length * 58 + 30;
    [[`${b.est}/${b.max}`, 'estrellas'], [`${b.rachaMax} km`, 'racha en zona'], [`${b.gT}/${b.gN}`, 'geles'], [`${b.pOk}/${b.pN}`, 'puestos']].forEach(([v, l], i) => { const x = 90 + i * 232; txt(v, x, y1 + 60, `400 64px ${SER}`, BONE); txt(l, x, y1 + 100, `400 24px ${INT}`, MUTE); });
    txt(`Mi estrategia: ${E.geles.length} geles, ${E.lph.toFixed(1).replace('.', ',')} L/h`, 540, 1800, `400 28px ${INT}`, '#cfccc4', 'center');
    txt('Ruta real del Maratón CAF de Caracas, en 3D', 540, 1852, `400 22px ${INT}`, 'rgba(244,239,230,.45)', 'center');
    return c;
  }
  // mejor marca y estrellas en el inicio
  function pintaMejor() {
    const card = document.querySelector('.mode[data-m="race"]'); if (!card) return; let p = card.querySelector('.best'); if (!p) { p = document.createElement('span'); p.className = 'best'; card.appendChild(p); }
    const m = marcas[String(S.target)], todas = Object.values(marcas), est = todas.reduce((a, x) => Math.max(a, x.est || 0), 0);
    p.textContent = m ? `Tu mejor con ${fT(S.target)}: ${fT(m.t)} · ${m.est}/30 estrellas` : todas.length ? `Tu mejor partida: ${est}/30 estrellas` : '';
  }
  pintaMejor(); ui.plan.alCambiar(pintaMejor);
  return { modelo: M, estrategia, iniciar, retomar, paso, estado, beber, gel, tocar, get st() { return st; }, get listo() { return listo; }, set listo(v) { listo = v; }, lienzo, final };
}
