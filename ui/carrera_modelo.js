// Modelo del modo «Correr la carrera»: puro (sin DOM ni three), corre igual en el navegador y en node (ui/carrera_prueba.mjs).
// Unidades: km oficial (lineal por tramos, lo traduce quien llama con kmOf/sOfKm), segundos de carrera (t) y segundos reales (tr).
// Mecánica: cada toque suma 1 al impulso d, que se apaga con constante TAU (s reales). El esfuerzo pedido es
//   rc = R0 + (1−R0)·d (d ≤ 1) o 1 + K1·(d−1) (d > 1), menos la pendiente en subida y más en bajada; el esfuerzo real r lo sigue con inercia.
// Un toque cada 2–3 s sostiene d ≈ 1 (la zona). Velocidad = r · vPlan(km) · (deshidratación); vPlan es el ritmo de esfuerzo parejo del objetivo.
export const KM = 42.195, DK = 0.05;
export const gradeSpeed = g => g > 0 ? 1 / (1 + .033 * Math.min(g, 12)) : 1 + .016 * Math.min(-g, 6);   // el mismo que el motor y que «Mi plan»
export const P = {
  TAU: 2.5, R0: .8, K1: .085, RMAX: 1.24, GU: .012, GD: .008, TAU_V: 1.1,       // toques → esfuerzo
  ZW: .04, ZB: .03,                                                              // media anchura de la zona; extra arriba en bajada (velocidad gratis)
  FK: 1.7, FREC: 7, BAJON: 3.5, BAJON_F: 55, HUELLA: .015, HUELLA_MAX: .3,       // fatiga: llenado por encima de la zona, recuperación, bajón forzado (s reales);
                                                                                 // cada bajón deja huella: +1,5 % de gasto de energía el resto de la carrera
  C: 3.0, PX: 7, FD: .4,                                                        // energía por km a esfuerzo 1; exponente; recargo por fatiga
  GEL: 10, GEL_T0: 300, GEL_DUR: 900,                                            // un gel: +10 de energía, empieza a llegar a los 5 min y tarda 15
  MURO_R: .7, MURO_SALE: 12,                                                     // en el muro el esfuerzo se queda en trote; se sale con >12 de energía
  SW: .72, HEAT: .45, HK: 30, CAP: .35,                                          // sudor L/h, recargo por calor, % por litro de déficit, tope por puesto
  V_ANTES: 2.4, V_DESP: .7, V_PERF: .45,                                         // ventana de los puestos (s reales antes y después; acierto perfecto)
  G_ANTES: 3.2, G_DESP: 2.2, G_PERF: .6,                                         // ventana de los geles
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** perfil por celdas de 50 m de km oficial: g[i] = pendiente (%) en el km i·DK. gradeAt(s) y sOfKm(km) los pone quien llama. */
export function perfilDesde(gradeAt, sOfKm) {
  const n = Math.ceil(KM / DK) + 1, g = new Float32Array(n);
  for (let i = 0; i < n; i++) g[i] = gradeAt(sOfKm(Math.min(KM, i * DK)));
  return { g, n };
}
export const pendiente = (pf, km) => { const f = clamp(km / DK, 0, pf.n - 1), i = Math.min(pf.n - 2, Math.floor(f)); return pf.g[i] + (pf.g[i + 1] - pf.g[i]) * (f - i); };

/** plan a esfuerzo parejo: VB (m/s en llano) y tiempo de paso por km para el objetivo T (s) */
export function planBase(pf, T) {
  const tc = new Float64Array(pf.n); let sum = 0;
  for (let i = 1; i < pf.n; i++) { sum += DK * 1000 / gradeSpeed(pf.g[i]); tc[i] = sum; }
  const VB = sum / T; for (let i = 0; i < pf.n; i++) tc[i] /= VB;
  return { T, VB, v: km => VB * gradeSpeed(pendiente(pf, km)), t: km => { const f = clamp(km / DK, 0, pf.n - 1), i = Math.min(pf.n - 2, Math.floor(f)); return tc[i] + (tc[i + 1] - tc[i]) * (f - i); } };
}

/** geles sugeridos: uno cada ~40 min de carrera, el primero hacia el min 40; se acercan al puesto oficial de gel si cae a menos de 1,5 km */
export function sugerirGeles(pl, oficiales = []) {
  const out = [], kmEn = t => { let a = 0, b = KM; for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (pl.t(m) < t) a = m; else b = m; } return a; };
  for (let t = 40 * 60; t < pl.T - 20 * 60 && out.length < 8; t += 40 * 60) { let km = kmEn(t); const o = oficiales.find(x => Math.abs(x - km) < 1.5); if (o != null) km = o; out.push(Math.round(km * 10) / 10); }
  return out;
}

/**
 * Crea una carrera. o = { pf, target (s), geles: [km], lph (L/h), dur (s reales para el objetivo), agua: [km], iso: [km], gelOf: [km], tramos: [{km0, km1}] }
 */
export function crearCarrera(o) {
  const pl = planBase(o.pf, o.target), esc = o.target / (o.dur || 480);
  const iso = new Set(o.iso || []), gof = new Set(o.gelOf || []);
  const st = {
    o, pl, esc, km: 0, t: 0, tr: 0, d: 1.15, rc: 1, r: .92, rz: .92, v: 0, E: 100, H: 100, def: 0, F: 0,
    estado: 'corre', bajonHasta: -1, muro: false, muroKm: null, forz: 0, abandonoKm: null, causa: '',
    puestos: (o.agua || []).map(km => ({ km, iso: iso.has(km), gel: gof.has(km), estado: 'pend' })),
    geles: (o.geles || []).slice().sort((a, b) => a - b).map(km => ({ km, estado: 'pend' })),
    gelQ: [], tUlt: 0, racha: 0, rachaMax: 0, kmT: 0, kmZ: 0, kmN: 0, tramo: 0, trT: 0, trZ: 0, estrellas: [], parciales: [],
    zona: false, roja: false, publico: 0, empujon: 0, ultToque: -9, rojoT: 0, rojoTemprano: 0, zonaT: 0, totT: 0, tramoDelta: [], tramoT0: 0, ev: [],
  };
  return st;
}
const ev = (st, tipo, x = {}) => st.ev.push({ tipo, km: st.km, t: st.t, ...x });

/** esfuerzo pedido sin tocar nada más (para la pantalla y los jugadores automáticos) */
export function esfuerzoPedido(st, d = st.d) {
  const g = pendiente(st.o.pf, st.km);
  let rc = d <= 1 ? P.R0 + (1 - P.R0) * d : 1 + P.K1 * (d - 1); rc = Math.min(rc, P.RMAX);
  rc += g > 0 ? -P.GU * g : P.GD * Math.min(-g, 6);
  if (st.empujon > st.tr) rc += .035;
  if (st.bajonHasta > st.tr) rc = Math.min(rc, .8);
  if (st.muro) rc = Math.min(rc, P.MURO_R);
  return rc;
}
export const zonaAt = (st, km = st.km) => { const g = pendiente(st.o.pf, km); return [1 - P.ZW, 1 + P.ZW + (g < -1.5 ? P.ZB : 0)]; };
const hidF = H => H < 50 ? 1 - .14 * (50 - H) / 50 : 1;

/** un toque al botón de correr. Devuelve { ritmo: true } si cayó al compás del público */
export function toque(st) {
  if (st.estado !== 'corre') return {};
  const dtT = st.tr - st.ultToque; st.ultToque = st.tr; st.d += 1;
  if (dtT < .3) st.F = Math.min(100, st.F + 2.5);                            // machacar el botón cansa
  let ritmo = false;
  if (st.publico) { const ph = (st.tr % 2) / 2, err = Math.min(ph, 1 - ph) * 2; if (err < .14) { ritmo = true; st.empujon = st.tr + 2.2; st.F = Math.max(0, st.F - 6); } }
  return { ritmo };
}
const ventana = (st, km, antes, desp) => { const vk = Math.max(.5, st.v) * st.esc / 1000, s = (km - st.km) / vk; return s <= antes && s >= -desp ? s : null; };
/** puesto de agua dentro de la ventana (o null) y segundos reales que faltan */
export function puestoActivo(st) { for (const p of st.puestos) if (p.estado === 'pend') { const s = ventana(st, p.km, P.V_ANTES, P.V_DESP); if (s !== null) return { p, s }; } return null; }
export function gelActivo(st) { for (const g of st.geles) if (g.estado === 'pend') { const s = ventana(st, g.km, P.G_ANTES, P.G_DESP); if (s !== null) return { g, s }; } return null; }

export function beber(st) {
  const a = puestoActivo(st); if (!a || st.estado !== 'corre') return null;
  const perf = Math.abs(a.s) <= P.V_PERF, lph = st.o.lph ?? .6, toma = Math.min(P.CAP, lph * (st.t - st.tUlt) / 3600) * (perf ? 1.15 : 1);
  a.p.estado = perf ? 'perfecto' : 'bien'; st.def = Math.max(0, st.def - toma); st.tUlt = st.t; st.t += lph > .85 ? 5 : 2;
  if (a.p.iso) st.E = Math.min(100, st.E + 2);
  ev(st, 'bebe', { perf, toma, iso: a.p.iso }); return { perf, toma, iso: a.p.iso };
}
export function tomarGel(st) {
  const a = gelActivo(st); if (!a || st.estado !== 'corre') return null;
  const perf = Math.abs(a.s) <= P.G_PERF; a.g.estado = perf ? 'perfecto' : 'bien';
  st.gelQ.push({ t0: st.t + P.GEL_T0 * (perf ? .8 : 1), left: P.GEL }); st.t += 2;
  ev(st, 'gel', { perf }); return { perf };
}

/** avanza dtR segundos reales. Los sucesos quedan en st.ev (quien llama los vacía). */
export function avanzar(st, dtR, auto = null) {
  if (st.estado !== 'corre' || dtR <= 0) return st;
  const pf = st.o.pf; st.tr += dtR; st.d *= Math.exp(-dtR / P.TAU);
  const g = pendiente(pf, st.km), heat = 1 + P.HEAT * clamp((st.t / 3600 - .75) / 2.5, 0, 1);
  // público: 300 m antes y después de cada punto de animación
  st.publico = (st.o.publico || []).some(k => Math.abs(k - st.km) < .3) ? 1 : 0;
  let rc = auto != null ? Math.min(auto, st.muro ? P.MURO_R : 9, st.bajonHasta > st.tr ? .8 : 9) : esfuerzoPedido(st); st.rc = rc;
  st.r += (rc - st.r) * (1 - Math.exp(-dtR / P.TAU_V));
  const hf = hidF(st.H); st.rz = st.r * hf;
  const vPlan = st.pl.v(st.km); st.v = Math.max(.3, st.rz * vPlan);
  const dtC = dtR * st.esc, dkm = st.v * dtC / 1000;
  const [lo, hi] = zonaAt(st); st.zona = !st.muro && st.rz >= lo && st.rz <= hi; st.roja = st.rz > hi;
  // fatiga (en segundos reales: es la parte «de juego»)
  if (st.roja) { st.F += P.FK * (st.rz - hi) * 100 * dtR * (st.H < 40 ? 1.3 : 1); st.rojoT += dtR; if (st.km < 12) st.rojoTemprano += dtR; }
  else st.F -= (st.rz < hi - .02 ? P.FREC : P.FREC * .4) * dtR;
  st.F = clamp(st.F, 0, 100);
  if (st.F >= 100 && st.bajonHasta < st.tr) { st.bajonHasta = st.tr + P.BAJON; st.F = P.BAJON_F; st.nBajon = (st.nBajon || 0) + 1; st.huella = Math.min(P.HUELLA_MAX, (st.huella || 0) + P.HUELLA); ev(st, 'bajon'); }
  // energía (por km): crece con el esfuerzo de forma no lineal, con la subida, la fatiga, la deshidratación y el calor
  const drain = P.C * Math.pow(Math.max(.5, st.rz), P.PX) * (1 + .04 * Math.max(0, g)) * (1 + P.FD * st.F / 100 + (st.huella || 0)) * (st.H < 50 ? 1 + .5 * (50 - st.H) / 50 : 1) * (.94 + .06 * heat);
  st.E -= drain * dkm;
  for (const q of st.gelQ) if (q.left > 0 && st.t > q.t0) { const a = Math.min(q.left, P.GEL / P.GEL_DUR * dtC); q.left -= a; st.E += a; if (q.left <= 0) ev(st, 'gel-llega'); }
  st.E = Math.min(100, st.E);
  if (st.E <= 0 && !st.muro) { st.muro = true; st.muroKm = st.muroKm ?? st.km; ev(st, 'muro'); }
  if (st.muro && st.E > P.MURO_SALE) { st.muro = false; ev(st, 'sale-muro'); }
  st.E = Math.max(0, st.E);
  // hidratación: déficit en litros (sudor con el calor de las horas finales menos lo bebido en los puestos)
  st.def += P.SW * heat * Math.pow(Math.max(.6, st.rz), 1.5) * dtC / 3600; st.H = clamp(100 - st.def * P.HK, 0, 100);
  // abandono: deshidratado y forzando (en el muro o en un bajón) unos segundos, o seco del todo
  const forzando = auto != null ? auto > 1.02 : st.d > 1.1;
  if (st.H < 30 && (st.muro || st.bajonHasta > st.tr) && forzando) st.forz += dtR; else st.forz = Math.max(0, st.forz - dtR * .5);
  if (st.forz > 4 || st.H <= 0) { st.estado = 'abandono'; st.abandonoKm = st.km; ev(st, 'abandono'); return st; }
  // puestos y geles que quedaron atrás
  for (const p of st.puestos) if (p.estado === 'pend' && ventana(st, p.km, 1e9, P.V_DESP) === null && p.km < st.km) { p.estado = 'perdido'; ev(st, 'puesto-perdido', { p }); }
  for (const q of st.geles) if (q.estado === 'pend' && ventana(st, q.km, 1e9, P.G_DESP) === null && q.km < st.km) { q.estado = 'perdido'; ev(st, 'gel-perdido', { g: q }); }
  // contabilidad de zona (tiempo real)
  st.kmT += dtR; st.trT += dtR; st.totT += dtR; if (st.zona) { st.kmZ += dtR; st.trZ += dtR; st.zonaT += dtR; }
  const k0 = st.km; st.km = Math.min(KM, st.km + dkm); st.t += dtC;
  if (Math.floor(st.km) > Math.floor(k0) && st.km < KM) {
    const ok = st.kmZ / st.kmT >= .75; st.kmN++;
    if (ok) { st.racha++; st.rachaMax = Math.max(st.rachaMax, st.racha); ev(st, 'km', { n: Math.floor(st.km), ok, racha: st.racha }); }
    else { const r0 = st.racha; st.racha = 0; ev(st, 'km', { n: Math.floor(st.km), ok, racha: 0, rota: r0 }); }
    st.kmT = st.kmZ = 0;
  }
  if (Math.floor(st.km / 5) > Math.floor(k0 / 5) && st.km < KM) { const km = Math.floor(st.km / 5) * 5, p = { km, t: st.t, plan: st.pl.t(km) }; st.parciales.push(p); ev(st, 'parcial', p); }
  const tr = st.o.tramos || [];
  while (tr[st.tramo] && st.km >= tr[st.tramo].km1 - 1e-6) {
    const f = st.trZ / Math.max(.001, st.trT), n = f >= .88 ? 3 : f >= .68 ? 2 : f >= .4 ? 1 : 0;
    st.estrellas.push(n); st.tramoDelta.push((st.t - st.tramoT0) - (st.pl.t(tr[st.tramo].km1) - st.pl.t(tr[st.tramo].km0))); st.tramoT0 = st.t;
    ev(st, 'tramo', { i: st.tramo, estrellas: n, f }); st.tramo++; st.trT = st.trZ = 0;
  }
  if (st.km >= KM) { st.estado = 'fin'; ev(st, 'fin'); }
  return st;
}

/** balance de la partida para la pantalla final */
export function balance(st) {
  const T = st.o.target, est = st.estrellas.reduce((a, b) => a + b, 0), gT = st.geles.filter(g => g.estado === 'perfecto' || g.estado === 'bien').length;
  const pOk = st.puestos.filter(p => p.estado === 'perfecto' || p.estado === 'bien').length, pPerf = st.puestos.filter(p => p.estado === 'perfecto').length;
  const fin = st.estado === 'fin', d = st.t - T;
  // la decisión que más pesó
  let causa = '';
  if (!fin || st.muroKm != null) {
    if (st.rojoTemprano > 25) causa = 'rapido'; else if (st.geles.length < 3 || gT < st.geles.length - 1) causa = 'geles'; else if (st.H < 35 || (st.o.lph ?? .6) < .4 || pOk < st.puestos.length * .6) causa = 'agua'; else causa = 'ritmo';
  } else if (d > 0) causa = st.zonaT / Math.max(1, st.totT) < .6 ? 'zona' : 'lento';
  const td = st.tramoDelta.map((x, i) => ({ i, x })).sort((a, b) => a.x - b.x);
  const medalla = !fin ? null : d <= 0 && est >= 26 ? 'oro' : d <= 300 && est >= 18 ? 'plata' : 'bronce';
  return { fin, t: st.t, T, d, est, max: (st.o.tramos || []).length * 3, rachaMax: st.rachaMax, gT, gN: st.geles.length, pOk, pPerf, pN: st.puestos.length,
    muroKm: st.muroKm, abandonoKm: st.abandonoKm, causa, gano: td[0], perdio: td[td.length - 1], medalla, zona: st.zonaT / Math.max(1, st.totT), bajones: st.nBajon || 0, E: st.E, H: st.H };
}

/** simulación rápida del plan bien ejecutado (esfuerzo 1, todos los puestos y geles): curvas para la vista previa y veredicto */
export function simularPlan(o) {
  const st = crearCarrera({ ...o, dur: 480 }), curva = []; let hMin = 100, hKm = null, eMin = 100;
  for (let n = 0; n < 40000 && st.estado === 'corre'; n++) {
    const pa = puestoActivo(st); if (pa && pa.s <= 0) beber(st);
    const ga = gelActivo(st); if (ga && ga.s <= 0) tomarGel(st);
    avanzar(st, .2, 1.015); st.ev.length = 0;
    if (!curva.length || st.km - curva[curva.length - 1].km >= .25) curva.push({ km: st.km, E: st.E, H: st.H });
    if (st.H < hMin) hMin = st.H; if (st.H < 50 && hKm == null) hKm = st.km; eMin = Math.min(eMin, st.E);
  }
  const lph = o.lph ?? .6, nG = (o.geles || []).length;
  let tipo = 'ok', txt;
  if (st.muroKm != null) { tipo = 'mal'; txt = `Con este plan te quedas sin energía cerca del km ${Math.round(st.muroKm)}: ${nG < 3 ? 'lleva más geles' : 'adelanta los geles'}.`; }
  else if (st.estado === 'abandono') { tipo = 'mal'; txt = `Así no terminas: te deshidratas del todo hacia el km ${Math.round(st.abandonoKm)}.`; }
  else if (hMin < 30) { tipo = 'mal'; txt = `Te secas desde el km ${Math.round(hKm)}: sube los litros por hora.`; }
  else if (hMin < 50) { tipo = 'ojo'; txt = `Llegas seco al final (desde el km ${Math.round(hKm)}): prueba con 0,6 L/h.`; }
  else if (eMin < 6) { tipo = 'ojo'; txt = 'Llegas justo de energía: un gel más o uno antes te da margen.'; }
  else if (lph > .85) { tipo = 'ojo'; txt = 'Bebes más de lo que sudas: pierdes segundos en cada puesto.'; }
  else if (st.E > 45 && nG >= 5) { tipo = 'ojo'; txt = `Te sobra energía (${Math.round(st.E)} % en meta): puedes llevar menos geles.`; }
  else txt = `Plan equilibrado: llegas con ${Math.round(st.E)} % de energía y bien hidratado.`;
  return { curva, muroKm: st.muroKm, abandonoKm: st.abandonoKm, t: st.t, E: st.E, hMin, tipo, txt };
}

// guardar y retomar una partida (recuperación al perder el contexto gráfico): solo el estado que cambia, sin el perfil
const CAMPOS = ['km', 't', 'tr', 'd', 'r', 'E', 'H', 'def', 'F', 'huella', 'muro', 'muroKm', 'nBajon', 'racha', 'rachaMax', 'kmT', 'kmZ', 'kmN', 'tramo', 'trT', 'trZ', 'estrellas', 'parciales', 'gelQ', 'tUlt', 'zonaT', 'totT', 'rojoT', 'rojoTemprano', 'tramoDelta', 'tramoT0'];
export function exportar(st) { const o = {}; for (const k of CAMPOS) o[k] = st[k]; o.puestos = st.puestos.map(p => p.estado); o.geles = st.geles.map(g => g.estado); return JSON.parse(JSON.stringify(o)); }
export function importar(st, o) {
  for (const k of CAMPOS) if (o[k] !== undefined) st[k] = o[k];
  (o.puestos || []).forEach((e, i) => { if (st.puestos[i]) st.puestos[i].estado = e; }); (o.geles || []).forEach((e, i) => { if (st.geles[i]) st.geles[i].estado = e; });
  st.ultToque = st.tr - 9; st.bajonHasta = -1; return st;
}
