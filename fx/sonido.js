// fx/sonido.js — paisaje sonoro procedural (Web Audio, sin archivos).
// Pisadas al ritmo de la zancada (con el pelotón alrededor, que se ralea con los km), respiración que se agita con la pendiente,
// público con murmullo, aplausos, silbidos y tambores en los puntos de animación y la meta, pájaros del amanecer y guacamayas,
// brisa, eco y reverberación en los túneles, y la corneta de salida.
// Voz real de la animadora en la salida y la llegada (audio/, ver VOZ). Arranca con el primer clic o tecla (el navegador lo exige). Tecla M: silencio. ?audiotest=1 escribe los niveles en consola cada 2 s.
export const meta = { id: 'sonido', reemplaza: [] };

// puntos de animación (km) y meta
const ANIMACION = [0.1, 8.3, 17.25, 21.1, 25.1, 37.3, 38, 41.3, 42.19];
// mezcla (ganancia de cada bus antes del compresor); todo suave, nada estridente
const MEZCLA = { maestro: 0.85, pasos: 0.22, pelotón: 0.4, respiracion: 0.07, publico: 0.42, aplausos: 0.3, tambores: 0.22, pajaros: 0.13, guacamayas: 0.08, brisa: 0.16, corneta: 0.26, reverb: 0.2, animadora: 0.55 }; // pisadas y respiración por debajo del ambiente
// voz de la animadora del Maratón CAF (Diana Rendeiro, con su permiso): SOLO recortes de grabaciones reales suyas, nada sintético.
// Se cargan tras el primer gesto; si la lista está vacía o un archivo falla, silencio. ?voz=0 la apaga. Fuentes: build/investigacion/voz_animadora.md
// EN ESPERA (19-nov-2026): los 3 recortes de llegada salen de la transmisión de CAF en YouTube (grabación de un tercero). Están en audio/pendiente/ y NO se publican
// hasta que Alejandro decida. Para activarlos: moverlos a audio/, poner aquí llegada: ['audio/animadora_llegada_1.mp3', 'audio/animadora_llegada_2.mp3', 'audio/animadora_llegada_3.mp3']
// y restaurar el crédito en game.js (pintaFine).
const VOZ = { salida: [], llegada: [] };   // salida: aún sin grabación suya (ver el .md)   // p. ej. 'audio/animadora_salida_1.mp3' (solo archivos que existan: un 404 ensucia la consola)
const DUCK = 0.45;                          // el público baja a este factor mientras ella habla

export function install(ctx) {
  const { S, P, sOfKm, kmOf, TOTAL, inTunnel, sunDir } = ctx;
  const q = new URLSearchParams(location.search), TEST = q.get('audiotest') === '1', VOZ_ON = q.get('voz') !== '0';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  let A = null, muted = false, G = {}, an = {}, B = {}, st = null;
  const STEP_T = Math.PI / 11; // el motor anima la zancada a 11 rad/s: un paso cada medio ciclo (≈0,286 s, 210 pasos/min)

  function build() {
    A = new (window.AudioContext || window.webkitAudioContext)();
    const sr = A.sampleRate, buf = (sec, fn, ch = 1) => { const b = A.createBuffer(ch, Math.floor(sr * sec), sr); for (let c = 0; c < ch; c++) { const d = b.getChannelData(c); fn(d, c); } return b; };
    // ruidos base
    B.blanco = buf(2, d => { for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; });
    B.rosa = buf(4, d => { let b0 = 0, b1 = 0, b2 = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = .99765 * b0 + w * .099046; b1 = .963 * b1 + w * .2965164; b2 = .57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * .1848) * .2; } }, 2);
    B.cafe = buf(4, d => { let l = 0; for (let i = 0; i < d.length; i++) { l = (l + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.2; } }, 2);
    // aplausos: miles de palmadas cortas al azar (estéreo, 4 s en bucle)
    B.aplausos = buf(4, (d, c) => { for (let k = 0; k < 2600; k++) { const t0 = Math.floor(Math.random() * (d.length - 2000)), a = .25 + Math.random() * .75, dec = 120 + Math.random() * 260; for (let i = 0; i < 900; i++) d[t0 + i] += (Math.random() * 2 - 1) * a * Math.exp(-i / dec); } for (let i = 0; i < d.length; i++) d[i] *= .14; }, 2);
    // respuestas al impulso: calle (corta, abierta) y túnel (larga, con rebotes)
    const ir = (sec, dec, rebotes) => buf(sec, (d, c) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = (Math.random() * 2 - 1) * Math.exp(-t / dec) * (1 + (rebotes ? .6 * Math.max(0, Math.sin(t * 31 + c)) : 0)); } }, 2);
    // cadena: buses → maestro → compresor → salida
    const comp = A.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = .01; comp.release.value = .25; comp.connect(A.destination);
    G.maestro = A.createGain(); G.maestro.gain.value = 0; G.maestro.connect(comp); G.maestro.gain.setTargetAtTime(MEZCLA.maestro, A.currentTime, .4);
    const rvCalle = A.createConvolver(), rvTunel = A.createConvolver(); rvCalle.buffer = ir(1.1, .22, false); rvTunel.buffer = ir(3.4, .85, true);
    G.envCalle = A.createGain(); G.envTunel = A.createGain(); G.envCalle.gain.value = 1; G.envTunel.gain.value = 0;
    G.reverb = A.createGain(); G.reverb.gain.value = MEZCLA.reverb; G.reverb.connect(G.envCalle); G.reverb.connect(G.envTunel); G.envCalle.connect(rvCalle); G.envTunel.connect(rvTunel);
    G.retorno = A.createGain(); G.retorno.gain.value = 1; rvCalle.connect(G.retorno); rvTunel.connect(G.retorno); G.retorno.connect(G.maestro);
    // eco del túnel en las pisadas (retardo con realimentación)
    G.eco = A.createDelay(1); G.eco.delayTime.value = .17; G.ecoFb = A.createGain(); G.ecoFb.gain.value = 0; G.ecoIn = A.createGain(); G.ecoIn.gain.value = 0; G.ecoIn.connect(G.eco); G.eco.connect(G.ecoFb); G.ecoFb.connect(G.eco); G.eco.connect(G.maestro);
    // ambiente exterior (se apaga y se oscurece dentro del túnel)
    G.exterior = A.createGain(); G.exteriorLp = A.createBiquadFilter(); G.exteriorLp.type = 'lowpass'; G.exteriorLp.frequency.value = 18000; G.exterior.connect(G.exteriorLp); G.exteriorLp.connect(G.maestro); G.exteriorLp.connect(G.reverb);
    const bus = (nm, dest, rv = .3) => { const g = A.createGain(); g.gain.value = MEZCLA[nm] ?? 1; g.connect(dest); if (rv) { const s = A.createGain(); s.gain.value = rv; g.connect(s); s.connect(G.reverb); } const a = A.createAnalyser(); a.fftSize = 512; g.connect(a); an[nm] = a; G[nm] = g; return g; };
    bus('pasos', G.maestro, .25); G.pasos.connect(G.ecoIn); bus('pelotón', G.pasos, 0); bus('respiracion', G.maestro, .1);
    bus('publico', G.exterior, .35); bus('aplausos', G.exterior, .3); bus('tambores', G.exterior, .4); bus('pajaros', G.exterior, .25); bus('guacamayas', G.exterior, .25); bus('brisa', G.exterior, 0); bus('corneta', G.maestro, .6); bus('animadora', G.maestro, .12);
    { const a = A.createAnalyser(); a.fftSize = 512; G.maestro.connect(a); an.maestro = a; const b = A.createAnalyser(); b.fftSize = 512; G.retorno.connect(b); an.reverb = b; }
    // capas continuas: murmullo del público (ruido rosa por tres «formantes» de voz con modulación lenta), aplausos en bucle, brisa
    const loop = (b, dest, rate = 1) => { const s = A.createBufferSource(); s.buffer = b; s.loop = true; s.playbackRate.value = rate; s.loopStart = 0; s.connect(dest); s.start(A.currentTime, Math.random() * b.duration); return s; };
    G.murmullo = A.createGain(); G.murmullo.gain.value = 0; G.murmullo.connect(G.publico);
    for (const [f, qv, g] of [[420, 3, .9], [1050, 4, .6], [2400, 5, .25]]) { const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = qv; const mg = A.createGain(); mg.gain.value = g; const lfo = A.createOscillator(), lg = A.createGain(); lfo.frequency.value = .3 + Math.random() * .5; lg.gain.value = g * .35; lfo.connect(lg); lg.connect(mg.gain); lfo.start(); loop(B.rosa, bp, .9 + Math.random() * .2); bp.connect(mg); mg.connect(G.murmullo); }
    G.palmas = A.createGain(); G.palmas.gain.value = 0; G.palmas.connect(G.aplausos); { const hp = A.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 700; loop(B.aplausos, hp); hp.connect(G.palmas); }
    G.viento = A.createGain(); G.viento.gain.value = .6; G.viento.connect(G.brisa); { const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; G.vientoLp = lp; const lfo = A.createOscillator(), lg = A.createGain(); lfo.frequency.value = .07; lg.gain.value = .35; lfo.connect(lg); lg.connect(G.viento.gain); lfo.start(); loop(B.cafe, lp); lp.connect(G.viento); }
    // respiración: ruido filtrado con una envolvente que se programa en cada ciclo
    G.aliento = A.createGain(); G.aliento.gain.value = 0; G.alientoBp = A.createBiquadFilter(); G.alientoBp.type = 'bandpass'; G.alientoBp.frequency.value = 1300; G.alientoBp.Q.value = .9; loop(B.rosa, G.alientoBp); G.alientoBp.connect(G.aliento); G.aliento.connect(G.respiracion);
    st = { nextStep: 0, side: 1, nStep: 0, otros: Array.from({ length: 14 }, (_, i) => ({ next: 0, per: 60 / (158 + Math.random() * 30), pan: (Math.random() * 2 - 1) * .9, d: 3 + Math.random() * 14, g: .5 + Math.random() * .5 })),
      nextBreath: 0, nextBird: 0, nextMacaw: 0, nextDrum: 0, drumStep: 0, nextWhistle: 0, wasRunning: false, lastLog: 0, crowd: 0, tun: 0,
      run: 0, llegada: -1, vozPend: null, vozSrc: null, vozGain: null, vozHasta: 0, duck: false };
    cargaVoz();
  }

  // ───────── voz de la animadora (archivos reales, carga perezosa) ─────────
  const vozBuf = { salida: [], llegada: [] };
  function cargaVoz() {
    if (!VOZ_ON) return;
    for (const tipo in VOZ) for (const url of VOZ[tipo])
      fetch(url).then(r => r.ok ? r.arrayBuffer() : null).then(ab => ab && new Promise(ok => A.decodeAudioData(ab, ok, () => ok(null)))).then(b => { if (b) vozBuf[tipo].push(b); }).catch(() => { });
  }
  function vozPara(t) { if (!st.vozSrc) return; try { st.vozGain.gain.setTargetAtTime(0, t, .08); st.vozSrc.stop(t + .4); } catch (e) { } st.vozSrc = null; st.vozHasta = 0; }
  function vozSuena(tipo, t) {   // una variante al azar; si aún no está decodificada, espera hasta 4 s y si no, calla
    const L = vozBuf[tipo]; if (!L.length) return false;
    vozPara(t); const s = A.createBufferSource(), g = A.createGain(); s.buffer = L[Math.floor(Math.random() * L.length)]; s.connect(g); g.connect(G.animadora);
    s.start(t); st.vozSrc = s; st.vozGain = g; st.vozHasta = t + s.buffer.duration; s.onended = () => { if (st.vozSrc === s) { st.vozSrc = null; st.vozHasta = 0; } };
    return true;
  }
  function voz(tipo, t) { if (!VOZ_ON || !VOZ[tipo].length) return; if (!vozSuena(tipo, t)) st.vozPend = { tipo, t, hasta: t + 4 }; }

  // ───────── eventos sueltos ─────────
  function noise(dest, t, dur, f0, f1, qv, gain, type = 'bandpass', rate = 1) {
    const s = A.createBufferSource(); s.buffer = B.blanco; s.playbackRate.value = rate; const f = A.createBiquadFilter(); f.type = type; f.Q.value = qv; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = A.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .004); g.gain.exponentialRampToValueAtTime(.0005, t + dur); s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 1.5, dur + .05); return g;
  }
  function tone(dest, t, dur, f0, f1, gain, type = 'sine', att = .004) {
    const o = A.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); const g = A.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + att); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + .05); return g;
  }
  const panTo = (dest, p) => { const n = A.createStereoPanner(); n.pan.value = clamp(p, -1, 1); n.connect(dest); return n; };
  function pisada(t, pan, gain, dest, lp = 9000) {
    const out = panTo(dest, pan), f = A.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; f.connect(out);
    noise(f, t, .07 + Math.random() * .03, 2600 + Math.random() * 900, 700, 1.1, gain * (.8 + Math.random() * .4));      // suela contra el asfalto
    tone(f, t, .09, 105 + Math.random() * 20, 55, gain * .9);                                                           // golpe sordo
  }
  function trino(t, pan) { // pájaro: 3–7 notas rápidas con barridos
    const out = panTo(G.pajaros, pan), n = 3 + Math.floor(Math.random() * 5), base = 2600 + Math.random() * 2600, sweep = Math.random() < .5 ? 1.35 : .72;
    for (let i = 0; i < n; i++) { const ti = t + i * (.07 + Math.random() * .05), f = base * (1 + (Math.random() - .5) * .25); tone(out, ti, .05 + Math.random() * .05, f, f * sweep, .5 + Math.random() * .4, 'sine', .006); }
  }
  function guacamaya(t, pan) { // graznido áspero: diente de sierra con formantes y temblor
    const out = panTo(G.guacamayas, pan), dur = .28 + Math.random() * .25, f = 620 + Math.random() * 380, bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500 + Math.random() * 600; bp.Q.value = 2.2; bp.connect(out);
    const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 1.15, t); o.frequency.linearRampToValueAtTime(f, t + dur * .3); o.frequency.linearRampToValueAtTime(f * .82, t + dur);
    const am = A.createOscillator(), amg = A.createGain(); am.frequency.value = 38 + Math.random() * 20; amg.gain.value = .4; am.connect(amg);
    const g = A.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.7, t + .03); g.gain.setValueAtTime(.7, t + dur * .7); g.gain.exponentialRampToValueAtTime(.001, t + dur); amg.connect(g.gain);
    o.connect(g); g.connect(bp); o.start(t); am.start(t); o.stop(t + dur + .05); am.stop(t + dur + .05);
  }
  function tambor(t, k, lvl) { // patrón de batucada a 104 ppm (semicorcheas): surdo en 1 y 3, caja y repique
    const out = G.tambores, pat = k % 16;
    if (pat === 0 || pat === 8) tone(out, t, .35, 92, 48, .9 * lvl);
    if (pat === 4 || pat === 12) tone(out, t, .25, 130, 70, .55 * lvl);
    if (pat % 2 === 0) noise(out, t, .06, 6000, 3500, .7, (pat % 4 === 2 ? .35 : .18) * lvl, 'highpass');
    if ([3, 6, 11, 14].includes(pat)) tone(out, t, .12, 420, 300, .25 * lvl, 'triangle');
  }
  function silbido(t, pan) { const out = panTo(G.publico, pan), f = 1900 + Math.random() * 900; const g = tone(out, t, .55, f, f * (Math.random() < .5 ? 1.45 : .8), .12, 'sine', .05); }
  function corneta(t) {
    for (const [f, d] of [[311, 0], [392, 4], [466, -5], [622, 3]]) { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; const g = A.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.22, t + .05); g.gain.setValueAtTime(.22, t + 1.5); g.gain.exponentialRampToValueAtTime(.001, t + 2.1); o.connect(lp); lp.connect(g); g.connect(G.corneta); o.start(t); o.stop(t + 2.2); }
    G.palmas.gain.setTargetAtTime(1, t + .4, .3); G.murmullo.gain.setTargetAtTime(1, t + .3, .3);
  }

  // ───────── cada cuadro ─────────
  const pt = {};
  function hook(noche, t, dt, p) {
    if (!A || A.state !== 'running') return;
    const RA = ctx.A, now = A.currentTime, run = S.running && !S.paused, s = S.sr ?? S.s, km = kmOf(s), dens = 1 - .75 * (RA ? S.s / RA.TOTAL : s / TOTAL), ahead = .12;   // s de referencia (público, meta); densidad por la ruta activa
    // salida: corneta
    if (S.running && !st.wasRunning) { st.run++; st.vozPend = null; if (s < 60) { corneta(now + .05); voz('salida', now + .9); } else vozPara(now); }   // cada arranque es una corrida nueva
    st.wasRunning = S.running;
    // voz de la animadora: llegada una sola vez por corrida al cruzar la meta de la ruta activa (42K o 21K, Reconocer o Correr la carrera)
    if (S.s >= (RA ? RA.TOTAL : TOTAL) - 3 && st.llegada !== st.run) { st.llegada = st.run; st.vozPend = null; voz('llegada', now + .3); }
    if (st.vozPend && (now > st.vozPend.hasta || vozSuena(st.vozPend.tipo, Math.max(now + .05, st.vozPend.t)))) st.vozPend = null;
    { const habla = now < st.vozHasta; if (habla !== st.duck) { st.duck = habla; const k = habla ? DUCK : 1;   // el público baja mientras ella habla
      for (const nm of ['publico', 'aplausos', 'tambores']) G[nm].gain.setTargetAtTime(MEZCLA[nm] * k, now, habla ? .15 : .6); } }
    // pisadas propias y del pelotón
    if (run) {
      if (st.nextStep < now) st.nextStep = now + .02;
      while (st.nextStep < now + ahead) { st.side = -st.side; pisada(st.nextStep, st.side * .12, .9, G.pasos); st.nextStep += STEP_T * (1 + (Math.random() - .5) * .04); st.nStep++; }
      const nOtros = Math.round(st.otros.length * dens * (km < .3 ? 1 : .8));
      for (let i = 0; i < st.otros.length; i++) { const o = st.otros[i]; if (i >= nOtros) { o.next = 0; continue; } if (o.next < now) o.next = now + Math.random() * o.per;
        while (o.next < now + ahead) { pisada(o.next, o.pan, o.g * 1.2 / o.d, G['pelotón'], 1800 + 7000 / o.d); o.next += o.per * (1 + (Math.random() - .5) * .03); } }
    } else { st.nextStep = 0; }
    // respiración: ciclo de 4 pasos (2:2); en subida fuerte 3 pasos (2:1) y más intensa
    (RA ? RA.P(S.s, pt) : P(s, pt)); const gr = run ? pt.grade : 0, esfuerzo = clamp(gr / 6, 0, 1) + (S.mode === 'race' ? S.effort * .15 : 0) + .25 * (RA ? S.s / RA.TOTAL : s / TOTAL);
    if (run) { if (st.nextBreath < now) st.nextBreath = now + .05;
      while (st.nextBreath < now + ahead) { const cyc = STEP_T * (esfuerzo > .55 ? 3 : 4), tb = st.nextBreath, ga = G.aliento.gain, lvl = .35 + .9 * esfuerzo;
        ga.cancelScheduledValues(tb); ga.setValueAtTime(ga.value, tb); ga.linearRampToValueAtTime(lvl * .55, tb + cyc * .18); ga.linearRampToValueAtTime(.02, tb + cyc * .45);   // inhala
        ga.linearRampToValueAtTime(lvl, tb + cyc * .55); ga.linearRampToValueAtTime(.01, tb + cyc * .95);                                                                     // exhala (más fuerte)
        G.alientoBp.frequency.setValueAtTime(1500, tb); G.alientoBp.frequency.linearRampToValueAtTime(950, tb + cyc * .55);
        st.nextBreath += cyc; } }
    else G.aliento.gain.setTargetAtTime(0, now, .2);
    // público: sube al acercarse a cada punto de animación y en la meta (los últimos 900 m, cada vez más)
    let crowd = 0; for (const k of ANIMACION) { const d = (s - sOfKm(k)) / (k > 42 ? 260 : 160); crowd = Math.max(crowd, Math.exp(-d * d) * (k > 42 ? 1.15 : .85)); }
    crowd = Math.max(crowd, sstep(41.3, 42.19, km) * .9) * (S.running || S.s > 10 ? 1 : 0); st.crowd = crowd;
    G.murmullo.gain.setTargetAtTime(.3 + crowd * .8, now, .5); G.palmas.gain.setTargetAtTime(crowd * crowd, now, .4);
    if (crowd > .35 && st.nextWhistle < now) { silbido(now + .05, Math.random() * 1.6 - .8); st.nextWhistle = now + .8 + Math.random() * 3 / crowd; }
    // tambores de fondo en los puntos de animación
    if (crowd > .12) { if (st.nextDrum < now) st.nextDrum = now + .05; while (st.nextDrum < now + ahead) { tambor(st.nextDrum, st.drumStep++, clamp(crowd * 1.2, 0, 1)); st.nextDrum += 60 / 104 / 4; } }
    // pájaros del amanecer (más con el alba, menos de noche cerrada y a pleno sol) y guacamayas
    const alba = sstep(-.12, .0, sunDir.y) * (1 - sstep(.3, .7, sunDir.y) * .6);
    if (alba > .05 && st.nextBird < now) { trino(now + .05, Math.random() * 1.8 - .9); st.nextBird = now + (.4 + Math.random() * 2.5) / alba; }
    if (sunDir.y > -.05 && noche < .7 && st.nextMacaw < now) { const n = 1 + Math.floor(Math.random() * 3), pan = Math.random() * 1.6 - .8; for (let i = 0; i < n; i++) guacamaya(now + .05 + i * (.35 + Math.random() * .3), pan + (Math.random() - .5) * .2); st.nextMacaw = now + 9 + Math.random() * 22 / (.4 + alba); }
    // brisa: más con la velocidad
    G.vientoLp.frequency.setTargetAtTime(380 + clamp(S.v, 0, 6) * 60, now, .5); G.brisa.gain.setTargetAtTime(MEZCLA.brisa * (.6 + clamp(S.v, 0, 6) * .12), now, .5);
    // túnel: reverberación larga, eco, y el exterior apagado y oscuro
    const tun = inTunnel(s) ? 1 : 0; if (tun !== st.tun) { st.tun = tun; const k = .35;
      G.envTunel.gain.setTargetAtTime(tun * 1.6, now, k); G.envCalle.gain.setTargetAtTime(1 - tun, now, k); G.ecoIn.gain.setTargetAtTime(tun * .35, now, k); G.ecoFb.gain.setTargetAtTime(tun * .38, now, k);
      G.exterior.gain.setTargetAtTime(tun ? .25 : 1, now, k); G.exteriorLp.frequency.setTargetAtTime(tun ? 700 : 18000, now, k); }
    if (TEST && t - st.lastLog > 2) { st.lastLog = t; const lv = {}, d = new Float32Array(512);
      for (const k in an) { an[k].getFloatTimeDomainData(d); let e = 0; for (let i = 0; i < d.length; i++) e += d[i] * d[i]; const r = Math.sqrt(e / d.length); lv[k] = r > 1e-5 ? +(20 * Math.log10(r)).toFixed(1) + ' dB' : '—'; }
      console.info('[audiotest]', JSON.stringify({ km: +km.toFixed(2), corriendo: run, publico: +crowd.toFixed(2), tunel: !!tun, alba: +alba.toFixed(2), esfuerzo: +esfuerzo.toFixed(2), silencio: muted, estado: A.state, voz: VOZ_ON ? { cargadas: vozBuf.salida.length + '+' + vozBuf.llegada.length, habla: now < st.vozHasta, corrida: st.run } : 'apagada' }), JSON.stringify(lv)); }
  }

  // ───────── arranque con el primer gesto y tecla M ─────────
  const go = () => { try { if (!A) build(); if (A.state !== 'running') A.resume(); } catch (e) { console.warn('sonido', e); } };
  addEventListener('pointerdown', go, { capture: true }); addEventListener('keydown', e => { go(); if (e.key && e.key.toLowerCase() === 'm' && A) { muted = !muted; G.maestro.gain.setTargetAtTime(muted ? 0 : MEZCLA.maestro, A.currentTime, .15); } }, { capture: true });
  // aviso mínimo en pantalla (clic = silenciar / activar); se oculta con &hud=0
  const tag = document.createElement('button'); tag.type = 'button';
  tag.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:50;font:600 12px/1 Inter,system-ui,sans-serif;color:#f4efe6;background:rgba(16,18,26,.72);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:7px 11px;cursor:pointer;opacity:.85';
  const pinta = () => { tag.textContent = !A || A.state !== 'running' ? '🔈 Sonido: clic o M' : muted ? '🔇 Sonido: M' : '🔊 Sonido: M'; };
  tag.onclick = e => { e.stopPropagation(); go(); if (A) { muted = !muted && A.state === 'running' ? true : false; G.maestro && G.maestro.gain.setTargetAtTime(muted ? 0 : MEZCLA.maestro, A.currentTime, .15); } setTimeout(pinta, 80); };
  if (q.get('hud') !== '0') document.body.appendChild(tag); pinta(); setInterval(pinta, 1000);
  ctx.frameHooks.push(hook);
  if (TEST) console.info('[audiotest] sonido instalado: haz clic o pulsa una tecla para arrancar el audio');
  window.__sonido = { get ctx() { return A; }, MEZCLA, arrancar: go };
}
