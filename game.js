// Maratón CAF 3D — motor del juego. Datos en data/caf-data.js (window.CAF), generados por build/02_build.py.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeVertices, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeApi, kmFns, componerRuta } from './landmarks/api.js?v=6';
import RUTA21 from './data/ruta-21k.js?v=5';
import HISTORIA from './data/hitos-historia.js?v=1';
import HITOS_IDS from './landmarks/index.js';
import { fusionar } from './fx/fusion.js?v=6';
import FX_IDS from './fx/index.js?v=3';
import FIX_IDS from './fx/correcciones/index.js';
const VQ = new URL(import.meta.url).search;   // la versión de game.js (?v=N en index.html) se propaga a los módulos que se cargan en caliente: sin esto el navegador se queda con copias viejas
// Módulos de realismo (fx/*.js). ?fx=a,b carga solo esos; ?fx=0 ninguno. Cada uno puede sustituir una parte del motor (meta.reemplaza).
const _fxq = new URLSearchParams(location.search).get('fx');
const fxMods = (await Promise.all((_fxq === '0' ? [] : _fxq ? _fxq.split(',') : FX_IDS).map(id => import(`./fx/${id}.js${VQ}`).catch(e => { console.error('fx ' + id, e); return null; })))).filter(Boolean);
window.__carga?.(.76, 'Preparando calles y edificios');
// Correcciones por zona (fx/correcciones/<zona>.js), validadas contra el video del recorrido: edificio por edificio, vía, vegetación,
// relieve lateral y estructuras. Se aplican a los datos antes de construir nada. ?fix=0 las apaga.
const _q0 = new URLSearchParams(location.search);
const FIX = _q0.get('fix') === '0' ? [] : (await Promise.all(FIX_IDS.map(id => import(`./fx/correcciones/${id}.js${VQ}`).then(m => m.default).catch(e => { console.error('corrección ' + id, e); return null; })))).filter(Boolean);
window.__carga?.(.86, 'Ubicando hitos y puestos');
const SUST = new Set(fxMods.flatMap(m => m.meta?.reemplaza || []));
// Capa de realismo de nov-2026 (detalle del suelo, color de cámara en media/ligera, follaje y sombra moteada; ver README «Realismo»). ?realismo=0 la apaga entera (A/B).
const REALISMO = _q0.get('realismo') !== '0';
const ctx = { THREE, D: window.CAF, SUST, realismo: REALISMO };
const nearFade = { value: 0 };   // m: lo que queda más cerca que esto de la cámara de seguimiento (follaje) se desvanece en vez de taparla

const D = window.CAF, R = D.ruta, N = R.x.length, STEP = R.step, TOTAL = (N - 1) * STEP;
// EX: exageración vertical del relieve (1 = real). 1,5 hace que las subidas y bajadas se lean a simple vista; ?relieve=1 vuelve a la escala real.
const KM = 42.195, EX = (D.meta.exag || 1) * (+_q0.get('relieve') || 1.5), ROAD_W = 13;
const { kmOf, sOfKm } = kmFns(D);   // km oficial ↔ distancia: lineal por tramos (D.meta.kmNudos), ver landmarks/api.js
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
// ───────── Correcciones por zona ─────────
const G0 = D.meta.geo, xzLL = (lat, lon) => [(lon - G0.lon0) * G0.kx, -(lat - G0.lat0) * G0.kz], hexN = c => typeof c === 'string' ? parseInt(c.replace('#', ''), 16) : c;
const EDIF_FIX = [], RELIEVE = [];
for (const F of FIX) {
  for (const v of F.via || []) for (const [key, val] of Object.entries(v.set || {})) {
    const veg = key.startsWith('veg.'), base = veg ? D.veg : D.via, paso = base.paso || .05; let arr = base; for (const k of (veg ? key.slice(4) : key).split('.')) arr = arr && arr[k];
    if (!Array.isArray(arr)) { console.error('corrección: clave de vía desconocida', key); continue; }
    for (let i = Math.max(0, Math.round(v.km0 / paso)); i <= Math.min(arr.length - 1, Math.round(v.km1 / paso)); i++) arr[i] = val;
  }
  if (F.quitaEstructuras) D.estructuras = (D.estructuras || []).filter(e => !F.quitaEstructuras.some(([a, b]) => (e.km ?? e.km0) >= a && (e.km ?? e.km0) <= b));
  (F.estructuras || []).forEach(e => (D.estructuras = D.estructuras || []).push(e));
  (F.elevados || []).forEach(e => (D.elevados = D.elevados || []).push(e));
  (F.relieve || []).forEach(r => RELIEVE.push(r)); (F.sinCebra || []).forEach(r => (D.sinCebra = D.sinCebra || []).push(r)); (F.sinBaranda || []).forEach(r => (D.sinBaranda = D.sinBaranda || []).push(r));
  for (const e of F.edif || []) {
    const o = { ...e, n: 0 }; if (o.col != null) o.col = hexN(o.col);
    if (o.poly) { const f = []; let cx = 0, cz = 0; for (const [la, lo] of o.poly) { const [x, z] = xzLL(la, lo); f.push(Math.round(x * 10) / 10, Math.round(z * 10) / 10); cx += x; cz += z; } o.x = cx / o.poly.length; o.z = cz / o.poly.length; o.nuevo = 1; D.edif.push([o.h || (o.pisos || 3) * 3.2 + 1, 1, f, o.col || 0]); }
    else if (o.ll) { const [x, z] = xzLL(o.ll[0], o.ll[1]); o.x = x; o.z = z; } else { console.error('corrección de edificio sin ll ni poly', e); continue; }
    EDIF_FIX.push(o);
  }
}
{ const t = _q0.get('reltest'); if (t) { const [a, b, dh, lado] = t.split(','); RELIEVE.push({ km0: +a, km1: +b, dh: +dh, lado: lado || 'LR' }); } }   // prueba rápida: ?reltest=km0,km1,dh[,lado]
// ¿Qué corrección le toca a una huella? Primero las reglas de zona (con radio r: todo centroide a menos de r m), luego las puntuales
// (el punto ll cae dentro de la huella, o a menos de 6 m de su centroide). Las puntuales mandan.
const _inP = (x, z, f, n) => { let c = false; for (let i = 0, j = n - 1; i < n; j = i++) { const xi = f[i * 2], zi = f[i * 2 + 1], xj = f[j * 2], zj = f[j * 2 + 1]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
const edifFix = (cx, cz, f, n) => { let out = null; if (!EDIF_FIX.length) return out;
  for (let pass = 0; pass < 2; pass++) for (const o of EDIF_FIX) { if (!!o.r !== (pass === 0)) continue; const dx = o.x - cx, dz = o.z - cz, d2 = dx * dx + dz * dz; if (d2 > 160000) continue;
    if (o.r ? d2 <= o.r * o.r : (d2 < 36 || _inP(o.x, o.z, f, n))) { o.n++; out = Object.assign(out || {}, o); } }
  return out; };
if (_q0.get('fixdbg') === '1') setTimeout(() => EDIF_FIX.forEach(o => { if (!o.n) console.error('corrección sin edificio:', JSON.stringify(o.ll || o.poly?.[0]), o.nota || ''); }), 14000);
// Perfil (correcciones, F.perfil = [{km, dz}]): suma dz metros de cota a la ruta donde el SRTM de 30 m aplana una vaguada o mete un tablero en el terreno.
// Interpolación lineal entre puntos, suavizada ±30 m (dos pasadas). Va antes de la igualación y de los elevados. El terreno acompaña con un relieve
// de peso por punto (como las trincheras): entero hasta F.perfilAncho[0] m del eje y se anula en [1] (40 y 80 m por defecto); { L: [..], R: [..] } por lado.
for (const F of FIX) { if (!(F.perfil && F.perfil.length > 1)) continue;
  const p = [...F.perfil].sort((a, b) => a.km - b.km), i0 = Math.max(0, Math.floor(sOfKm(p[0].km) / STEP) - 4), i1 = Math.min(N - 1, Math.ceil(sOfKm(p[p.length - 1].km) / STEP) + 4);
  let d = []; for (let i = i0; i <= i1; i++) { const k = kmOf(i * STEP); let j = 1; while (j < p.length - 1 && k > p[j].km) j++; const a = p[j - 1], b = p[j]; d.push(k <= a.km ? a.dz : k >= b.km ? b.dz : lerp(a.dz, b.dz, (k - a.km) / (b.km - a.km))); }
  for (let pass = 0; pass < 2; pass++) { const t = d.slice(); d = t.map((_, n) => { let s = 0, c = 0; for (let m = -3; m <= 3; m++) if (t[n + m] !== undefined) { s += t[n + m]; c++; } return s / c; }); }
  d.forEach((v, n) => { R.e[i0 + n] += v; }); const pa = F.perfilAncho || [40, 80];
  for (const [lado, [w2, w3]] of Array.isArray(pa) ? [['LR', pa]] : [['L', pa.L || [40, 80]], ['R', pa.R || [40, 80]]])
    RELIEVE.push({ km0: kmOf(i0 * STEP), km1: kmOf(i1 * STEP), lado, d0: -1, d1: -.5, dh: EX, d2: w2, d3: w3, w: d, nota: 'perfil' }); }
// Ida y vuelta por la misma avenida (Los Próceres, la Río de Janeiro, la salida y la meta): el GPS da a cada pasada una cota distinta
// (1–2 m) y el terreno, que sigue a la más cercana, tapaba la otra calzada. Se igualan las dos pasadas y el terreno se ajusta con ellas.
// Solo se emparejan pasadas casi paralelas (|t·t'| > 0,8): un cruce a distinto nivel no debe promediar la cota del puente con la de abajo.
// Con el filtro de paralelas basta separar las pasadas 12 puntos (120 m): así también se igualan ida y vuelta junto a un retorno.
// Un nodo del terreno casi equidistante (±3 m) de dos pasadas sigue a la pasada de la que tomó su cota (la de cota más parecida), no a la más cercana por centímetros.
{ const C = 34, hh = new Map(), dl = new Float32Array(N), tg = i => { const a = Math.max(0, i - 2), b = Math.min(N - 1, i + 2), x = R.x[b] - R.x[a], z = R.z[b] - R.z[a], l = Math.hypot(x, z) || 1; return [x / l, z / l]; }, par = (i, j) => { const [a, b] = tg(i), [c, d] = tg(j); return Math.abs(a * c + b * d) > .8; }; for (let i = 0; i < N; i++) { const k = Math.floor(R.x[i] / C) + ',' + Math.floor(R.z[i] / C); let l = hh.get(k); if (!l) hh.set(k, l = []); l.push(i); }
  for (let i = 0; i < N; i++) { const cx = Math.floor(R.x[i] / C), cz = Math.floor(R.z[i] / C); let b = 33 * 33, bj = -1; for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) { const l = hh.get((cx + a) + ',' + (cz + c)); if (l) for (const j of l) { if (Math.abs(j - i) < 12) continue; const q = (R.x[j] - R.x[i]) ** 2 + (R.z[j] - R.z[i]) ** 2; if (q < b && par(i, j)) { b = q; bj = j; } } } if (bj >= 0) dl[i] = (R.e[bj] - R.e[i]) / 2; }
  for (let pass = 0; pass < 3; pass++) { const t = Float32Array.from(dl); for (let i = 0; i < N; i++) { let s = 0, n = 0; for (let k = -4; k <= 4; k++) { const j = i + k; if (j >= 0 && j < N) { s += t[j]; n++; } } dl[i] = s / n; } }
  const T0 = D.terreno, best = new Float32Array(T0.nx * T0.nz).fill(1e9), bd = new Float32Array(T0.nx * T0.nz), be = new Float32Array(T0.nx * T0.nz);
  for (let i = 0; i < N; i++) { if (Math.abs(dl[i]) < .03) continue; const gx = Math.round((R.x[i] - T0.x0) / T0.dx), gz = Math.round((R.z[i] - T0.z0) / T0.dx);
    for (let a = -9; a <= 9; a++) for (let c = -9; c <= 9; c++) { const ix = gx + a, iz = gz + c; if (ix < 0 || iz < 0 || ix >= T0.nx || iz >= T0.nz) continue; const d = Math.hypot(T0.x0 + ix * T0.dx - R.x[i], T0.z0 + iz * T0.dx - R.z[i]), k = iz * T0.nx + ix; if (d < best[k] - 3 || (d < best[k] + 3 && Math.abs(R.e[i] - .4 - T0.h[k]) < Math.abs(be[k] - .4 - T0.h[k]))) { best[k] = Math.min(d, best[k]); bd[k] = dl[i]; be[k] = R.e[i]; } } }
  for (let k = 0; k < best.length; k++) if (best[k] < 510) { let w = clamp((best[k] - 110) / 400, 0, 1); w = w * w * (3 - 2 * w); T0.h[k] += bd[k] * (1 - w); }
  for (let i = 0; i < N; i++) R.e[i] += dl[i];
  // la segunda pasada copia exactamente la cota de la primera en el punto de enfrente: las dos calzadas comparten una misma losa
  const ex = new Float32Array(N).fill(NaN);
  for (let i = 0; i < N; i++) { const cx = Math.floor(R.x[i] / C), cz = Math.floor(R.z[i] / C); let b = 33 * 33, bj = -1; for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) { const l = hh.get((cx + a) + ',' + (cz + c)); if (l) for (const j of l) { if (j > i - 12) continue; const q = (R.x[j] - R.x[i]) ** 2 + (R.z[j] - R.z[i]) ** 2; if (q < b && par(i, j)) { b = q; bj = j; } } }
    if (bj < 0) continue; let best = R.e[bj], bd = 1e9; for (const k of [bj - 1, bj + 1]) { if (k < 0 || k >= N) continue; const ux = R.x[k] - R.x[bj], uz = R.z[k] - R.z[bj], t = clamp(((R.x[i] - R.x[bj]) * ux + (R.z[i] - R.z[bj]) * uz) / (ux * ux + uz * uz || 1), 0, 1), d = Math.hypot(R.x[bj] + ux * t - R.x[i], R.z[bj] + uz * t - R.z[i]); if (d < bd) { bd = d; best = lerp(R.e[bj], R.e[k], t); } } ex[i] = best; }
  // donde hay pareja la copia es exacta (la losa es una sola); la transición a la cota propia se hace FUERA del tramo emparejado, en los 80 m anteriores y siguientes
  const exOff = new Float32Array(N); for (let i = 0; i < N; i++) if (!isNaN(ex[i])) exOff[i] = ex[i] - R.e[i];
  for (let i = 0; i < N; i++) { if (!isNaN(ex[i])) { R.e[i] = ex[i]; continue; } for (let k = 1; k <= 8; k++) { const a = i - k, b = i + k, pa = a >= 0 && !isNaN(ex[a]), pb = b < N && !isNaN(ex[b]); if (pa || pb) { R.e[i] += (pa ? exOff[a] : exOff[b]) * (1 - k / 9); break; } } } }
// Elevados por los que la ruta pasa POR ARRIBA (visto en el video): rampa, tablero y rampa sobre la cota del terreno
const elevH = new Float32Array(N);
(D.elevados || []).forEach(v => { const i0 = Math.round(sOfKm(v.km0) / STEP), i1 = Math.round(sOfKm(v.km1) / STEP), L = i1 - i0, r = Math.max(4, Math.round(L * .34)); for (let i = i0; i <= i1; i++) { const k = Math.min(1, (i - i0) / r, (i1 - i) / r), h = (v.alto || 5.5) * (k * k * (3 - 2 * k)); elevH[i] = h; R.e[i] += h / EX; } });
// Túneles hundidos: la ruta baja t.alto m en la trinchera de entrada (km0→km1), va a esa cota bajo la cubierta y sube en la de salida (km2→km3), con la
// misma rampa que los muros; el suelo baja con ella en una franja que pasa una celda de la malla (9,4 m) del muro, así el techo queda a nivel de calle.
(D.tuneles || []).forEach(t => { const s0 = sOfKm(t.km0), s1 = sOfKm(t.km1), s2 = sOfKm(t.km2), s3 = sOfKm(t.km3), H = t.alto || 5.4, i0 = Math.max(0, Math.floor(s0 / STEP)), i1 = Math.min(N - 1, Math.ceil(s3 / STEP)), w = [];
  for (let i = i0; i <= i1; i++) { const s = i * STEP, k = clamp(s < s1 ? (s - s0) / (s1 - s0) : s > s2 ? (s3 - s) / (s3 - s2) : 1, 0, 1); w.push(k); R.e[i] -= H * k / EX; }
  RELIEVE.push({ km0: kmOf(i0 * STEP), km1: kmOf(i1 * STEP), lado: 'LR', d0: -1, d1: -.5, dh: -H, d2: ROAD_W / 2 + 10.5, d3: ROAD_W / 2 + 12.5, w, nota: 'trinchera de ' + (t.nombre || 'túnel') }); });
let eMin = Infinity, eMax = -Infinity;
for (const e of R.e) { if (e < eMin) eMin = e; if (e > eMax) eMax = e; }
const Y = e => (e - eMin) * EX;
const inTunnel = s => (D.tuneles || []).some(t => s > sOfKm(t.km0) - 6 && s < sOfKm(t.km3) + 6);
const enElevado = s => elevH[clamp(Math.round(s / STEP), 0, N - 1)] > .3;
const cubierto = s => inTunnel(s) || (D.estructuras || []).some(e => e.tipo === 'cubierta' && s > sOfKm(e.km0) - 8 && s < sOfKm(e.km1) + 8);
const fmtT = t => { t = Math.max(0, Math.round(t)); const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60; return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); };
const fmtP = v => { if (!(v > .3)) return '—'; const p = Math.round(1000 / v * (A.id === '42' ? (sOfKm(KM) - sOfKm(KM - 1)) / 1000 : (A.sOfKm(Math.min(A.KM, A.kmOf(S.s) + .5)) - A.sOfKm(Math.max(0, A.kmOf(S.s) - .5))) / 1000 / (Math.min(A.KM, A.kmOf(S.s) + .5) - Math.max(0, A.kmOf(S.s) - .5)))); return Math.floor(p / 60) + ':' + String(p % 60).padStart(2, '0') + '/km'; };

// ───────── Ruta ─────────
const _p = { x: 0, y: 0, z: 0, e: 0, tx: 1, tz: 0, grade: 0 };
function P(s, o = _p) {
  s = clamp(s, 0, TOTAL); const f = s / STEP, i = Math.min(N - 2, Math.floor(f)), t = f - i;
  o.x = lerp(R.x[i], R.x[i + 1], t); o.z = lerp(R.z[i], R.z[i + 1], t); o.e = lerp(R.e[i], R.e[i + 1], t); o.y = Y(o.e);
  const a = Math.max(0, i - 2), b = Math.min(N - 1, i + 3); let tx = R.x[b] - R.x[a], tz = R.z[b] - R.z[a]; const l = Math.hypot(tx, tz) || 1;
  o.tx = tx / l; o.tz = tz / l;
  const g0 = Math.max(0, i - 5), g1 = Math.min(N - 1, i + 5); o.grade = (R.e[g1] - R.e[g0]) / ((g1 - g0) * STEP) * 100;
  return o;
}
const gradeAt = s => { const i = clamp(Math.round(s / STEP), 0, N - 1), g0 = Math.max(0, i - 5), g1 = Math.min(N - 1, i + 5); return (R.e[g1] - R.e[g0]) / ((g1 - g0) * STEP) * 100; };
// hash espacial de la ruta (para no sembrar árboles ni gente sobre el asfalto)
const CELL = 30, hash = new Map();
for (let i = 0; i < N; i++) { const k = Math.floor(R.x[i] / CELL) + ',' + Math.floor(R.z[i] / CELL); hash.set(k, 1); }
function nearRoute(x, z, r) { const c = Math.ceil(r / CELL), cx = Math.floor(x / CELL), cz = Math.floor(z / CELL); for (let a = -c; a <= c; a++) for (let b = -c; b <= c; b++) if (hash.has((cx + a) + ',' + (cz + b))) return true; return false; }
// terreno
const T = D.terreno;
function hT0(x, z) { const fx = clamp((x - T.x0) / T.dx, 0, T.nx - 1.001), fz = clamp((z - T.z0) / T.dx, 0, T.nz - 1.001), i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, k = j * T.nx + i; return lerp(lerp(T.h[k], T.h[k + 1], u), lerp(T.h[k + T.nx], T.h[k + T.nx + 1], u), v); }
// Relieve lateral (correcciones): escalones del terreno a un lado de la vía —taludes, cortes de roca, puentes sobre autopista o río—
// vistos en el video. {km0, km1, lado:'L'|'R'|'LR', d0, d1, dh, d2, d3, rampa}: el suelo no cambia hasta d0 m del eje, llega a dh m
// (negativo = baja) en d1, se mantiene hasta d2 y vuelve a 0 en d3. A lo largo entra y sale en `rampa` m.
const REL = RELIEVE.map(r => { const i0 = clamp(Math.round(sOfKm(r.km0) / STEP), 0, N - 1), i1 = clamp(Math.round(sOfKm(r.km1) / STEP), i0 + 1, N - 1), d0 = r.d0 ?? 9, d1 = r.d1 ?? d0 + 8, d2 = Math.min(r.d2 ?? 90, 125), d3 = Math.min(r.d3 ?? d2 + 30, 140);
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity; for (let i = i0; i <= i1; i++) { x0 = Math.min(x0, R.x[i]); x1 = Math.max(x1, R.x[i]); z0 = Math.min(z0, R.z[i]); z1 = Math.max(z1, R.z[i]); }
  return { i0, i1, d0, d1, d2, d3, dh: r.dh / EX, lado: r.lado || 'LR', rampa: r.rampa ?? 30, w: r.w, x0: x0 - d3, x1: x1 + d3, z0: z0 - d3, z1: z1 + d3 }; });
const _ss = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
function relieve(x, z) { let dh = 0;
  for (const r of REL) { if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue;
    let bi = -1, b = 1e12; for (let i = r.i0; i <= r.i1; i++) { const q = (R.x[i] - x) ** 2 + (R.z[i] - z) ** 2; if (q < b) { b = q; bi = i; } }
    const a = Math.max(0, bi - 2), c = Math.min(N - 1, bi + 2); let tx = R.x[c] - R.x[a], tz = R.z[c] - R.z[a]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    const ox = x - R.x[bi], oz = z - R.z[bi], lat = ox * tz - oz * tx, al = ox * tx + oz * tz, sa = (bi - r.i0) * STEP + al, sb = (r.i1 - bi) * STEP - al;
    if (sa <= 0 || sb <= 0 || (r.lado === 'L' && lat < 0) || (r.lado === 'R' && lat > 0)) continue;
    const d = Math.abs(lat), k = d <= r.d0 ? 0 : d < r.d1 ? _ss((d - r.d0) / (r.d1 - r.d0)) : d <= r.d2 ? 1 : d < r.d3 ? 1 - _ss((d - r.d2) / (r.d3 - r.d2)) : 0;
    if (k > 0) { let wa = 1; if (r.w) { const f = clamp(bi - r.i0 + al / STEP, 0, r.w.length - 1), j = Math.min(r.w.length - 2, Math.floor(f)); wa = lerp(r.w[j], r.w[j + 1], f - j); }   // r.w: peso por punto de ruta (trincheras)
      dh += r.dh * k * (r.w ? wa : _ss(Math.min(sa, sb) / Math.max(1, r.rampa))); } }
  return dh; }
const hT = REL.length ? (x, z) => hT0(x, z) + relieve(x, z) : hT0;
// la malla base (60 m) no puede dibujar escalones: donde el terreno baja, se hunde un poco más para no asomar sobre las capas finas
const hBase = REL.length ? (x, z, h) => { let m = 0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) m = Math.min(m, relieve(x + a * 45, z + b * 45)); return m < 0 ? h + m - 1.5 / EX : h; } : (x, z, h) => h;
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
// ───────── Distancia activa (42K / 21K) ─────────
// El mundo sigue anclado a la ruta de referencia (R, P, kmOf, sOfKm, TOTAL: el 42K). El corredor, la cámara, el HUD, el perfil, el plan y la
// carrera usan la ruta activa A (ctx.A, el mismo objeto siempre): con 42K son las mismas funciones y datos de referencia, así que nada cambia;
// con 21K es la ruta compuesta de data/ruta-21k.js (landmarks/api.js, componerRuta). S.s es la distancia en la ruta activa; S.sr, la s de
// referencia que le corresponde (para todo lo anclado al 42K: calzada, túneles, entorno, público). ?dist=21 o el selector de la portada.
HISTORIA(D, xzLL, km => { const o = P(sOfKm(km)); return [o.x, o.z]; });   // historia de los hitos, antes de armar 42K/21K y los rótulos
const A = {}, DIST = {};
DIST['42'] = { id: '42', KM, corto: '42K', nombre: 'Maratón', P, kmOf, sOfKm, TOTAL, N, STEP, x: R.x, z: R.z, e: R.e, ref: null, sRef: s => s, gradeAt, mapKm: k => k, giro: () => 0,
  hidratacion: D.hidratacion, gatorade: D.gatorade || [], geles: D.geles || [], tramos: D.tramos, hitos: D.hitos, subidas: D.subidas || [], aviso: D.meta.aviso || '',
  calle: s => D.calles ? (D.calles[Math.min(D.calles.length - 1, Math.floor(s / (STEP * D.callesCada)))] || '') : '' };
{ const C = componerRuta(D, RUTA21, R); if (C.err.length) console.error('ruta 21K: ' + C.err.join('; '));
  // conectores: la cota sigue la recta entre sus extremos; donde el relieve queda por encima se sube a él (2 cm por debajo) para no enterrar la calzada
  // y junto a la calzada del 42K (en las esquinas y el retorno) toma la cota de esa losa: a menos de 16 m del eje de referencia la copia, y se funde
  // con la recta hasta los 30 m (la losa del 42K se ensancha en las bocacalles y quedaba por encima del conector)
  for (let i = 0; i < C.N; i++) if (C.ref[i] < 0) { let b = 1e18, bj = 0; for (let j = 0; j < N; j++) { const d = (R.x[j] - C.x[i]) ** 2 + (R.z[j] - C.z[i]) ** 2; if (d < b) { b = d; bj = j; } }
    const w = clamp((30 - Math.sqrt(b)) / 14, 0, 1); C.e[i] = lerp(C.e[i], R.e[bj], w * w * (3 - 2 * w)); }
  for (let i = 0; i < C.N; i++) if (C.ref[i] < 0) { const h = hT(C.x[i], C.z[i]); if (h > C.e[i] + .02) C.e[i] = h - .02; }
  const NA = C.N, X = C.x, Z = C.z, E = C.e, LT = C.lat, _pA = { x: 0, y: 0, z: 0, e: 0, tx: 1, tz: 0, grade: 0 }, r2 = k => Math.round(k * 100) / 100;
  // Cerca de los conectores (C.zona: el retorno en U y las esquinas de Las Acacias) la posición sigue una Catmull-Rom por las muestras de 10 m y
  // el rumbo es su derivada: curva y rumbo continuos, sin las esquinas secas de la interpolación lineal. Lejos, como el 42K (lineal + cuerda de 50 m).
  const ZN = C.zona, GI = C.giro, CV = C.curvas, cr = (p0, p1, p2, p3, t) => .5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t),
    crd = (p0, p1, p2, p3, t) => .5 * ((p2 - p0) + 2 * (2 * p0 - 5 * p1 + 4 * p2 - p3) * t + 3 * (3 * p1 - p0 - 3 * p2 + p3) * t * t);
  const PA = (s, o = _pA) => { s = clamp(s, 0, C.TOTAL); const f = s / STEP, i = Math.min(NA - 2, Math.floor(f)), t = f - i;
    o.x = lerp(X[i], X[i + 1], t); o.z = lerp(Z[i], Z[i + 1], t); o.e = lerp(E[i], E[i + 1], t); o.y = Y(o.e);
    const a = Math.max(0, i - 2), b = Math.min(NA - 1, i + 3); let tx = X[b] - X[a], tz = Z[b] - Z[a]; const l = Math.hypot(tx, tz) || 1; o.tx = tx / l; o.tz = tz / l;
    let enCurva = false; for (const cv of CV) if (s >= cv.i0 * STEP && s <= cv.i1 * STEP) {   // retorno en U: la curva fina (Hermite) por largo de arco, con su rumbo exacto
      const d = (s - cv.i0 * STEP) / ((cv.i1 - cv.i0) * STEP) * cv.cu[cv.cu.length - 1], P2 = cv.pts, U = cv.cu; let j = 1; while (j < U.length - 1 && U[j] < d) j++; const u = (d - U[j - 1]) / ((U[j] - U[j - 1]) || 1);
      o.x = lerp(P2[j - 1][0], P2[j][0], u); o.z = lerp(P2[j - 1][1], P2[j][1], u); const ja = Math.max(0, j - 2), jb = Math.min(P2.length - 1, j + 1), dx = P2[jb][0] - P2[ja][0], dz = P2[jb][1] - P2[ja][1], dl = Math.hypot(dx, dz) || 1; o.tx = dx / dl; o.tz = dz / dl; enCurva = true; break; }
    const w = enCurva ? 0 : lerp(ZN[i], ZN[i + 1], t); if (w > 0) { const i0 = Math.max(0, i - 1), i3 = Math.min(NA - 1, i + 2);
      o.x = lerp(o.x, cr(X[i0], X[i], X[i + 1], X[i3], t), w); o.z = lerp(o.z, cr(Z[i0], Z[i], Z[i + 1], Z[i3], t), w);
      let dx = crd(X[i0], X[i], X[i + 1], X[i3], t), dz = crd(Z[i0], Z[i], Z[i + 1], Z[i3], t); const dl = Math.hypot(dx, dz) || 1; dx = lerp(o.tx, dx / dl, w); dz = lerp(o.tz, dz / dl, w); const m = Math.hypot(dx, dz) || 1; o.tx = dx / m; o.tz = dz / m; }
    if (!enCurva) for (const cv of CV) { const dA = cv.i0 * STEP - s, dB = s - cv.i1 * STEP, P2 = cv.pts, n2 = P2.length;   // 12 m antes y después de la U el rumbo se funde con el de la curva: sin quiebre en los empalmes
      const tg = dA > 0 && dA < 12 ? [P2[1][0] - P2[0][0], P2[1][1] - P2[0][1], 1 - dA / 12] : dB > 0 && dB < 12 ? [P2[n2 - 1][0] - P2[n2 - 2][0], P2[n2 - 1][1] - P2[n2 - 2][1], 1 - dB / 12] : null;
      if (tg) { const l2 = Math.hypot(tg[0], tg[1]) || 1, k = tg[2] * tg[2] * (3 - 2 * tg[2]), dx = lerp(o.tx, tg[0] / l2, k), dz = lerp(o.tz, tg[1] / l2, k), m = Math.hypot(dx, dz) || 1; o.tx = dx / m; o.tz = dz / m; } }
    const g0 = Math.max(0, i - 5), g1 = Math.min(NA - 1, i + 5); o.grade = (E[g1] - E[g0]) / ((g1 - g0) * STEP) * 100;
    const la = lerp(LT[i], LT[i + 1], t); if (la) { o.x += o.tz * la; o.z -= o.tx * la; } return o; };
  const gA = s => { const i = clamp(Math.round(s / STEP), 0, NA - 1), g0 = Math.max(0, i - 5), g1 = Math.min(NA - 1, i + 5); return (E[g1] - E[g0]) / ((g1 - g0) * STEP) * 100; };
  const mk = l => l.map(C.mapKm).filter(k => k != null).map(r2), quita = new Set(RUTA21.quitaHitos || []);
  const hitos = [...D.hitos.filter(h => !quita.has(h.km)).map(h => ({ ...h, km: C.mapKm(h.km) })).filter(h => h.km != null).map(h => ({ ...h, km: r2(h.km) })), ...RUTA21.hitos].sort((a, b) => a.km - b.km);
  const subidas = (D.subidas || []).map(c => ({ ...c, km0: C.mapKm(c.km0), km1: C.mapKm(c.km1) })).filter(c => c.km0 != null && c.km1 != null && c.km1 > c.km0).map(c => ({ ...c, km0: r2(c.km0), km1: r2(c.km1) }));
  const tramos = RUTA21.tramos.map(t => t.de ? { ...D.tramos.find(q => q.nombre === t.de) } : { ...t }); tramos[tramos.length - 1].km1 = RUTA21.KM;
  DIST['21'] = { id: '21', KM: RUTA21.KM, corto: '21K', nombre: RUTA21.nombre, P: PA, kmOf: C.kmOf, sOfKm: C.sOfKm, TOTAL: C.TOTAL, N: NA, STEP, x: X, z: Z, e: E, ref: C.ref, lat: LT, sRef: C.sRef, gradeAt: gA, mapKm: C.mapKm,
    giro: s => { const f = clamp(s / STEP, 0, NA - 1), i = Math.min(NA - 2, Math.floor(f)); return lerp(GI[i], GI[i + 1], f - i); },   // 0..1 cerca del retorno en U (pelotón y cámaras)
    hidratacion: mk(D.hidratacion), gatorade: mk(D.gatorade || []), geles: mk(D.geles || []), tramos, hitos, subidas, aviso: RUTA21.aviso, calle: s => C.calle(s, D.calles, D.callesCada),
    // ejes de los conectores, muestreados cada 2 m sobre la curva suave de PA (de la última muestra del 42K antes a la primera después)
    conectores: (() => { const out = [], o = {}; let i = 0; while (i < NA) { if (C.ref[i] >= 0) { i++; continue; } let j = i; while (j < NA && C.ref[j] < 0) j++; const c = []; for (let u = (i - 1) * STEP; u <= j * STEP + .01; u += 2) { PA(u, o); c.push([o.x, o.z, o.e]); } out.push(c); i = j; } return out; })() }; }
Object.assign(A, DIST['42']);
const distGuardada = () => { const q = _q0.get('dist'); if (q === '21' || q === '42') return q; try { const v = localStorage.getItem('caf3d-distancia'); if (v === '21' || v === '42') return v; } catch (e) { } return '42'; };

// ───────── Escena ─────────
const canvas = $('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x9fc7e8, 1800, 24000);
const camera = new THREE.PerspectiveCamera(58, 1, 2, 40000);
const hemi = new THREE.HemisphereLight(0xdfeeff, 0x4a4436, 1.0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d8, 2.0); scene.add(sun); scene.add(sun.target);
let NOCHE = 0; const MOON = new THREE.Vector3(.35, .8, .3).normalize(), frameHooks = [];
// Calidad gráfica: 'alta' = sombras + bloom + gradación de color; 'ligera' = render directo (móviles o equipos modestos)
// 'media' (por defecto en teléfonos) = la misma ciudad que en alta (fachadas, calzada, árboles, gente) pero sin sombras ni posproceso y a menor resolución
const Q = (() => { const u = new URLSearchParams(location.search).get('calidad'); let tier = null; if (u === 'fija') tier = 'alta'; else if (u === 'media' || u === 'ligera' || u === 'alta') tier = u; else { try { const v = localStorage.getItem('caf3d-calidad'); if (v === 'alta' || v === 'media' || v === 'ligera') tier = v; } catch (e) { } }
  if (!tier) tier = matchMedia('(pointer: coarse)').matches && Math.min(innerWidth, innerHeight) < 700 ? 'media' : 'alta';
  const q = { fija: u === 'fija', tier, alta: tier !== 'ligera', media: tier === 'media' }; if (q.media) { q.nivel = 5; q.sombras = false; q.post = false; renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25)); } return q; })();
// Presupuesto de memoria por calidad (se mide con fx/memoria.js, ?mem=): radios de carga y de suelta (histéresis) de los mosaicos z18/z19 y de las
// zonas de detalle de edificios, tope de triángulos de detalle residentes y a qué distancia extra sueltan sus búferes de GPU los hitos apagados
// (lim · hitoK + hitoM, con lim la distancia a la que fusion.js los apaga). En alta los radios visibles son los de siempre.
Q.mem = Q.media ? { z18: [900, 1350], z19: [420, 640], detCarga: 760, detVis: 620, detSuelta: 1000, detTri: 550000, hitoK: 1.2, hitoM: 250 }
  : !Q.alta ? { z18: [700, 1050], z19: [360, 560], detCarga: 620, detVis: 520, detSuelta: 850, detTri: 380000, hitoK: 1.15, hitoM: 200 }
  : { z18: [1500, 2600], z19: [520, 900], detCarga: 1000, detVis: 620, detSuelta: 1400, detTri: 900000, hitoK: 1.5, hitoM: 600 };
renderer.shadowMap.enabled = Q.alta && !Q.media; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sun.castShadow = Q.alta; sun.shadow.mapSize.set(2048, 2048); { const c = sun.shadow.camera; c.left = -170; c.right = 170; c.top = 170; c.bottom = -170; c.near = 60; c.far = 1500; } sun.shadow.bias = -.0006; sun.shadow.normalBias = .5;
const sunDir = new THREE.Vector3(.6, .5, .3).normalize();
// cielo: cúpula con degradado horizonte→cenit, disco y halo del sol
const skyU = { top: { value: new THREE.Color(0x4a90d9) }, hor: { value: new THREE.Color(0xcfe4f2) }, sunDir: { value: sunDir }, sunCol: { value: new THREE.Color(0xfff2d6) }, sunK: { value: 1 } };
const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
  vertexShader: 'varying vec3 d; void main(){ d = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform vec3 top; uniform vec3 hor; uniform vec3 sunDir; uniform vec3 sunCol; uniform float sunK; varying vec3 d; void main(){ vec3 n = normalize(d); float t = pow(clamp(n.y*1.6,0.0,1.0),0.55); vec3 c = mix(hor, top, t); float s = max(dot(n, sunDir), 0.0); c += sunCol * sunK * (pow(s, 900.0) * 6.0 + pow(s, 40.0) * 0.35 + pow(s, 6.0) * 0.12); c = mix(c, hor, pow(1.0 - clamp(n.y, 0.0, 1.0), 9.0) * 0.6); gl_FragColor = vec4(c, 1.0); }' });
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(36000, 32, 16), skyMat); skyDome.renderOrder = -10; scene.add(skyDome);
// entorno para reflejos (vidrio de las torres): se regenera a partir del propio cielo cuando cambia la luz
const pmrem = new THREE.PMREMGenerator(renderer), envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyMat)); let envRT = null, envKey = -1;
function envUpdate(key) { if (key === envKey) return; envKey = key; const rt = pmrem.fromScene(envScene, 0, 1, 500); scene.environment = rt.texture; if (envRT) envRT.dispose(); envRT = rt; }
// posproceso: bloom (faroles, LED, ventanas de noche; brillo del sol en fachadas claras) + gradación tipo cámara de acción + viñeta
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType }));
const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .32, .7, 1.15);
const grade = new ShaderPass({ uniforms: { tDiffuse: { value: null }, sat: { value: 1.16 }, con: { value: 1.05 }, vig: { value: .32 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform sampler2D tDiffuse; uniform float sat; uniform float con; uniform float vig; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); float l = dot(c.rgb, vec3(0.2126,0.7152,0.0722)); c.rgb = mix(vec3(l), c.rgb, sat); c.rgb = (c.rgb - 0.18) * con + 0.18; vec2 q = vUv - 0.5; c.rgb *= 1.0 - vig * dot(q, q) * 1.6; gl_FragColor = vec4(max(c.rgb, 0.0), c.a); }' });
composer.addPass(new RenderPass(scene, camera)); composer.addPass(bloom); composer.addPass(grade); composer.addPass(new OutputPass());
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); if (Q.post !== false) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }   /* en calidad media no hay posproceso: sus búferes no se reservan (memoria en teléfonos) */ camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', () => { resize(); drawProfileBase(); }); resize();
// API de los hitos modelados a mano (landmarks/*.js) y huellas genéricas que cada uno sustituye
const api = makeApi(THREE, D, { EX, hT, texEscala: Q.alta && !Q.media ? 1 : .5 }), QUITA = [];   // texEscala: en media y ligera las texturas de los hitos van a la mitad de lado (¼ de memoria)
const HROOTS = []; let FUSION = null;
// tramos del 21K que el 42K no pisa (el retorno de Los Ilustres y la Av. Las Acacias hasta La Previsora): son parte de la calle en las dos
// distancias. distConector(x, z) = distancia en planta al eje del conector más cercano (los hitos y el motor no ponen nada encima)
const CONECT = DIST['21'].conectores, distConector = (x, z) => { let b = 1e9; for (const c of CONECT) for (let i = 0; i < c.length - 1; i++) { const [ax, az] = c[i], ux = c[i + 1][0] - ax, uz = c[i + 1][1] - az, t = clamp(((x - ax) * ux + (z - az) * uz) / (ux * ux + uz * uz || 1), 0, 1); b = Math.min(b, Math.hypot(ax + ux * t - x, az + uz * t - z)); } return b; };
Object.assign(api, { conectores: CONECT, distConector, ruta21: DIST['21'] });
// aberturas en la calzada de referencia donde el 21K entra y sale de ella (fx/calzada.js): el retorno abre el separador de Los Ilustres en las dos
// pasadas; en Las Acacias, el lado izquierdo de las dos esquinas del 42K queda como bocacalle (por ahí sigue derecho el 21K)
const ABRE = []; { const C = DIST['21'], rf = C.ref;
  let i = 0; while (i < C.N) { if (rf[i] >= 0) { i++; continue; } let j = i; while (j < C.N && rf[j] < 0) j++; const sa = rf[i - 1], sb = rf[j], L = (j - i + 1) * STEP;
    if (L >= 80) { for (const s of [sa, sb]) ABRE.push({ s0: s - 18, s1: s + 18, L: true }); i = j; continue; }
    // retorno en U: se abre el separador en las filas del 42K que quedan a menos de 14 m del arco (en las dos pasadas), con 6 m de margen
    const arco = C.conectores.find(c => Math.hypot(c[0][0] - C.x[i - 1], c[0][1] - C.z[i - 1]) < 1), cerca = s => { const k = Math.round(s / STEP); return arco.some(q => Math.hypot(R.x[k] - q[0], R.z[k] - q[1]) < 14); };
    for (const s of [sa, sb]) { let a = s, b = s; for (let d = STEP; d <= 120; d += STEP) { if (cerca(s - d)) a = s - d; if (cerca(s + d)) b = s + d; } ABRE.push({ s0: a - 6, s1: b + 6, sep: true }); } i = j; } }
const hitosListos = Promise.all(HITOS_IDS.map(id => import(`./landmarks/${id}.js${VQ}`).then(m => { (m.meta?.quita || []).forEach(q => { const p = api.xz(q[0], q[1]); QUITA.push([p.x, p.z, q[2]]); }); const o = m.build(THREE, api); o.traverse(n => { if (n.isMesh && !Q.alta) n.castShadow = false; }); scene.add(o); HROOTS.push(o); }).catch(e => console.error('hito ' + id, e)))).then(() => { if (new URLSearchParams(location.search).get('fusion') !== '0') try { FUSION = fusionar(THREE, HROOTS, st => api.tickSeguro(st)); console.info('fusion', JSON.stringify(FUSION)); } catch (e) { console.error('fusion', e); } });
Object.assign(ctx, { A, DIST, conectores: CONECT, aberturas: ABRE, distConector, HROOTS, scene, camera, renderer, composer, bloom, grade, ShaderPass, Q, api, sun, hemi, sunDir, skyU, skyMat, skyDome, frameHooks, P, hT, Y, kmOf, sOfKm, KM, TOTAL, STEP, N, R, ROAD_W, clamp, lerp, rnd, inTunnel, enElevado, cubierto, nearRoute, canvasTex, label, elevH, edifFix, relieve, EX, nearFade,
  /** añade un pase de posproceso justo antes de la gradación de color */ addPass(p) { composer.insertPass(p, composer.passes.indexOf(grade)); } });
const quitado = (x, z) => { for (const q of QUITA) if ((x - q[0]) ** 2 + (z - q[1]) ** 2 < q[2] * q[2]) return true; return false; };

function canvasTex(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function label(text, { bg = 'rgba(16,18,26,.85)', fg = '#f4efe6', size = 34, sub = '' } = {}) {
  const pad = 22, c = document.createElement('canvas'), g = c.getContext('2d'); g.font = `600 ${size}px Inter,system-ui,sans-serif`;
  const w = Math.max(g.measureText(text).width, sub ? g.measureText(sub).width * .62 : 0) + pad * 2, h = size + pad * 1.4 + (sub ? size * .7 : 0);
  c.width = Math.ceil(w); c.height = Math.ceil(h); g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, c.width, c.height, 16); g.fill();
  g.font = `600 ${size}px Inter,system-ui,sans-serif`; g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText(text, c.width / 2, pad * .6);
  if (sub) { g.font = `500 ${size * .6}px Inter,system-ui,sans-serif`; g.globalAlpha = .75; g.fillText(sub, c.width / 2, pad * .6 + size * 1.08); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, fog: false })); sp.userData.ar = c.width / c.height; return sp;
}
const setH = (sp, h) => { sp.scale.set(h * sp.userData.ar, h, 1); return sp; };

// ───────── Imagen satelital real (mosaicos Esri World Imagery, cargados en vivo) ─────────
const G = D.meta.geo, lonOf = x => G.lon0 + x / G.kx, latOf = z => G.lat0 - z / G.kz;
const tileX = (lon, z) => (lon + 180) / 360 * 2 ** z, tileY = (lat, z) => (1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * 2 ** z;
const xOfTile = (tx, z) => (tx / 2 ** z * 360 - 180 - G.lon0) * G.kx, zOfTile = (ty, z) => -(Math.atan(Math.sinh(Math.PI * (1 - 2 * ty / 2 ** z))) * 180 / Math.PI - G.lat0) * G.kz;
const TILE = (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
const GAP = .3; // el suelo va apenas por debajo de la calzada
// Capa base: toda la región a zoom 15 (≈4,8 m/px) pintada sobre un lienzo que es la textura del terreno
const Z0 = 15, bx0 = Math.floor(tileX(lonOf(T.x0), Z0)), bx1 = Math.floor(tileX(lonOf(T.x0 + (T.nx - 1) * T.dx), Z0)), by0 = Math.floor(tileY(latOf(T.z0), Z0)), by1 = Math.floor(tileY(latOf(T.z0 + (T.nz - 1) * T.dx), Z0));
const bnx = bx1 - bx0 + 1, bny = by1 - by0 + 1, TP = Math.min(256, Math.floor(4096 / bnx));
const baseCv = document.createElement('canvas'); baseCv.width = bnx * TP; baseCv.height = bny * TP; const baseG = baseCv.getContext('2d', { willReadFrequently: false }); baseG.fillStyle = '#737a6c'; baseG.fillRect(0, 0, baseCv.width, baseCv.height);
// En media y ligera la GPU recibe la imagen base a la mitad de lado (¼ de memoria; de cerca la tapan los mosaicos z18/z19). El lienzo completo
// sigue en JavaScript para leer colores (sample: techos, verde), así la ciudad sale igual que en alta.
const baseGPU = Q.alta && !Q.media ? baseCv : Object.assign(document.createElement('canvas'), { width: baseCv.width >> 1, height: baseCv.height >> 1 });
const baseSube = () => { if (baseGPU !== baseCv) baseGPU.getContext('2d').drawImage(baseCv, 0, 0, baseGPU.width, baseGPU.height); baseTex.needsUpdate = true; };
const baseTex = new THREE.CanvasTexture(baseGPU); baseTex.colorSpace = THREE.SRGBColorSpace; baseTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
const groundTint = new THREE.Color(0xffffff);
let sampler = null; // lectura de color de la imagen (para techos y para saber dónde hay verde)
function sample(x, z) { if (!sampler) return null; const u = (tileX(lonOf(x), Z0) - bx0) / bnx, v = (tileY(latOf(z), Z0) - by0) / bny; if (u < 0 || u >= 1 || v < 0 || v >= 1) return null; const i = (Math.floor(v * sampler.h) * sampler.w + Math.floor(u * sampler.w)) * 4, d = sampler.d; return [d[i], d[i + 1], d[i + 2]]; }
const isGreen = c => c && c[1] > c[0] * 1.04 && c[1] > c[2] * 1.12 && c[1] < 190;
// Detalle del suelo cerca de la cámara (realismo): la foto satelital (0,3–4,8 m/px) se ve borrosa a pie de calle. Sin texturas nuevas:
// 1) enfoque local con UNA muestra extra (la misma foto 2,5 niveles de mipmap más borrosa: luz/borroso realza el grano real de la foto) y
// 2) ruido de valor procedural en coordenadas del mundo (3 octavas; en lo verde, más contraste y manchas secas amarillentas).
// Se desvanece con la distancia (nada más allá de ~320 m: sin centelleo). Mismo programa para la base y todos los mosaicos; sirve igual en media/ligera.
const sueloDet = m => { if (!REALISMO) return m;
  m.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSdW;').replace('#include <project_vertex>', '#include <project_vertex>\nvSdW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vSdW;
float sdH(vec2 p) { p = mod(p, 4096.0); vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float sdN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(sdH(i), sdH(i + vec2(1.0, 0.0)), f.x), mix(sdH(i + vec2(0.0, 1.0)), sdH(i + 1.0), f.x), f.y); }`)
      .replace('#include <map_fragment>', `#include <map_fragment>
#ifdef USE_MAP
{ float sdD = length(vSdW - cameraPosition), sdK = 1.0 - smoothstep(60.0, 320.0, sdD);
  if (sdK > 0.002) {
    vec3 t0 = texture2D(map, vMapUv).rgb, tb = texture2D(map, vMapUv, 2.5).rgb;
    float l0 = dot(t0, vec3(0.2126, 0.7152, 0.0722)), lb = dot(tb, vec3(0.2126, 0.7152, 0.0722));
    diffuseColor.rgb *= mix(1.0, clamp(l0 / max(lb, 1e-3), 0.55, 1.7), 0.55 * sdK);
    vec2 p = vSdW.xz; float n = sdN(p * 0.43) * 0.5 + sdN(p * 1.9) * 0.3 + (sdN(p * 7.1) - 0.5) * 0.4 * (1.0 - smoothstep(12.0, 70.0, sdD)) + 0.1;
    float gv = clamp((t0.g - max(t0.r, t0.b)) * 16.0, 0.0, 1.0);
    diffuseColor.rgb *= 1.0 + (n - 0.5) * sdK * (0.26 + 0.3 * gv);
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.12, 1.05, 0.78), gv * sdK * smoothstep(0.55, 0.8, sdN(p * 0.21 + 3.7)) * 0.7);
  } }
#endif`);
  };
  m.customProgramCacheKey = () => 'sueloDet'; return m; };
(function terrain() {
  const { nx, nz, x0, z0, dx, h } = T, pos = new Float32Array(nx * nz * 3), uv = new Float32Array(nx * nz * 2);
  for (let j = 0, k = 0; j < nz; j++) for (let i = 0; i < nx; i++, k++) {
    const x = x0 + i * dx, z = z0 + j * dx; pos[k * 3] = x; pos[k * 3 + 1] = Y(hBase(x, z, h[k])) - GAP; pos[k * 3 + 2] = z;
    uv[k * 2] = (tileX(lonOf(x), Z0) - bx0) / bnx; uv[k * 2 + 1] = 1 - (tileY(latOf(z), Z0) - by0) / bny;
  }
  const idx = new Uint32Array((nx - 1) * (nz - 1) * 6); let q = 0;
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, d = a + nx, e = d + 1; idx[q++] = a; idx[q++] = d; idx[q++] = b; idx[q++] = b; idx[q++] = d; idx[q++] = e; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1));
  scene.add(new THREE.Mesh(g, sueloDet(new THREE.MeshBasicMaterial({ map: baseTex, color: groundTint }))));
  // Cota más baja que se dibuja en (x, z): esta malla base (hundida junto al relieve lateral, se ve donde la capa fina no ha cargado) o las capas z18/z19
  // (retícula de ~9,4 m, mismas divisiones que `layers`, que corta los escalones bruscos). Los edificios asientan su base aquí para no quedar en el aire.
  const tri = (u, v, a, b, d, e) => u + v <= 1 ? a + u * (b - a) + v * (d - a) : e + (1 - u) * (d - e) + (1 - v) * (b - e);
  const malla = (x, z, zl, S, lift) => { const tx = tileX(lonOf(x), zl) * S, ty = tileY(latOf(z), zl) * S, i = Math.floor(tx), j = Math.floor(ty), q = (a, b) => { const X = xOfTile((i + a) / S, zl), Z = zOfTile((j + b) / S, zl); return Y(hT(X, Z)); }; return tri(tx - i, ty - j, q(0, 0), q(1, 0), q(0, 1), q(1, 1)) - GAP + lift; };
  ctx.sueloMin = (x, z) => { const fx = clamp((x - x0) / dx, 0, nx - 1.001), fz = clamp((z - z0) / dx, 0, nz - 1.001), i = Math.floor(fx), j = Math.floor(fz), k = j * nx + i;
    return Math.min(Y(hT(x, z)), tri(fx - i, fz - j, pos[k * 3 + 1], pos[k * 3 + 4], pos[(k + nx) * 3 + 1], pos[(k + nx) * 3 + 4]), malla(x, z, 18, REL.length ? 16 : 4, .1), malla(x, z, 19, REL.length ? 8 : 4, .2)); };
})();
const ready = []; // tareas que esperan a la imagen base (techos, árboles)
Object.assign(ctx, { ready, groundTint, baseTex, sample, isGreen, quitado, GAP, setH, uvBase: (x, z) => [(tileX(lonOf(x), Z0) - bx0) / bnx, 1 - (tileY(latOf(z), Z0) - by0) / bny] });
(function loadBase() {
  const jobs = [], sx = tileX(lonOf(R.x[0]), Z0), sy = tileY(latOf(R.z[0]), Z0);
  for (let j = 0; j < bny; j++) for (let i = 0; i < bnx; i++) jobs.push([i, j, Math.hypot(bx0 + i + .5 - sx, by0 + j + .5 - sy)]);
  jobs.sort((a, b) => a[2] - b[2]); let pending = jobs.length, dirty = false, done = false, ok = 0;
  const finish = () => { if (done) return; done = true; hitosListos.then(() => finish2()); }, finish2 = () => { try { if (ok > jobs.length * .5) { const c = document.createElement('canvas'); c.width = baseCv.width >> 1; c.height = baseCv.height >> 1; const g = c.getContext('2d'); g.drawImage(baseCv, 0, 0, c.width, c.height); sampler = { w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data }; } } catch (e) { console.warn('sin lectura de imagen', e); } ready.forEach(f => f()); ctx.baseLista = true; };
  const next = () => { const jb = jobs.shift(); if (!jb) return; const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { baseG.drawImage(im, jb[0] * TP, jb[1] * TP, TP, TP); dirty = true; ok++; end(); }; im.onerror = end; im.src = TILE(Z0, bx0 + jb[0], by0 + jb[1]); };
  function end() { if (--pending <= 0) { baseSube(); finish(); } next(); }
  for (let k = 0; k < 12; k++) next();
  const iv = setInterval(() => { if (dirty) { baseSube(); dirty = false; } if (done) clearInterval(iv); }, 600);
  setTimeout(finish, 15000); // sin red: sigue con colores por defecto
})();
// Capas de detalle, cargadas solo cerca del corredor: zoom 18 (0,6 m/px) en un pasillo de ±150 m y zoom 19 (0,3 m/px) sobre la propia vía
const texLoader = new THREE.TextureLoader(); texLoader.setCrossOrigin('anonymous');
// las dos capas comparten retícula (z18 con 16 divisiones y z19 con 8 dan la misma malla de ~9,4 m): así el relieve lateral coincide y no se cruzan
function makeLayer(z, offs, rLoad, rDrop, lift, order, maxPar, SEG) {
  const hiIdx = []; for (let j = 0; j < SEG; j++) for (let i = 0; i < SEG; i++) { const p = j * (SEG + 1) + i; hiIdx.push(p, p + SEG + 1, p + 1, p + 1, p + SEG + 1, p + SEG + 2); }
  const map = new Map(); for (let i = 0; i < N; i += 2) for (const ox of offs) for (const oz of offs) { const tx = Math.floor(tileX(lonOf(R.x[i] + ox), z)), ty = Math.floor(tileY(latOf(R.z[i] + oz), z)), k = tx + '/' + ty; if (!map.has(k)) map.set(k, { tx, ty, cx: xOfTile(tx + .5, z), cz: zOfTile(ty + .5, z), st: 0, mesh: null }); }
  const list = [...map.values()]; let loading = 0;
  const load = t => {
    t.st = 1; loading++;
    texLoader.load(TILE(z, t.tx, t.ty), tex => {
      loading--; if (t.st !== 1) { tex.dispose(); return; } tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      const n = SEG + 1, pos = new Float32Array(n * n * 3), uv = new Float32Array(n * n * 2); for (let j = 0, k = 0; j < n; j++) for (let i = 0; i < n; i++, k++) { const x = xOfTile(t.tx + i / SEG, z), zz = zOfTile(t.ty + j / SEG, z); pos[k * 3] = x; pos[k * 3 + 1] = Y(hT(x, zz)) - GAP + lift; pos[k * 3 + 2] = zz; uv[k * 2] = i / SEG; uv[k * 2 + 1] = 1 - j / SEG; }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(hiIdx);
      t.mesh = new THREE.Mesh(g, sueloDet(new THREE.MeshBasicMaterial({ map: tex, color: groundTint, polygonOffset: true, polygonOffsetFactor: -2 * order, polygonOffsetUnits: -4 * order }))); t.mesh.renderOrder = order; t.mesh.userData.mem = 'mosaico' + z; scene.add(t.mesh); t.st = 2;
    }, undefined, () => { loading--; t.st = 3; });
  };
  const upd = (x, zc) => {
    const want = [];
    for (const t of list) { const d = Math.hypot(t.cx - x, t.cz - zc); if (t.st === 0 && d < rLoad) want.push([d, t]); else if (t.st === 2 && d > rDrop) { scene.remove(t.mesh); t.mesh.material.map.dispose(); t.mesh.material.dispose(); t.mesh.geometry.dispose(); t.mesh = null; t.st = 0; } else if (t.st === 1 && d > rDrop) t.st = 0; }
    want.sort((a, b) => a[0] - b[0]); for (const w of want) { if (loading >= maxPar) break; load(w[1]); }
  };
  // solo lectura, para ctx.pendientes(): mosaicos a menos de r m que aún no llegaron, y sus URL (precarga del resumen)
  upd.pend = (px, pz, r) => { let n = 0; for (const t of list) if (t.st < 2 && Math.hypot(t.cx - px, t.cz - pz) < r) n++; return n; };
  upd.urls = (px, pz, r) => list.filter(t => t.st === 0 && Math.hypot(t.cx - px, t.cz - pz) < r).map(t => TILE(z, t.tx, t.ty));
  return upd;
}
const layers = [makeLayer(18, [-150, 0, 150], Q.mem.z18[0], Q.mem.z18[1], .1, 1, 8, REL.length ? 16 : 4), makeLayer(19, [-45, 0, 45], Q.mem.z19[0], Q.mem.z19[1], .2, 2, 10, REL.length ? 8 : 4)]; let hiNext = 0;
// ctx.pendientes(): cuánto falta por cargar cerca del corredor (imagen base, mosaicos de detalle, calzada y edificios de detalle).
// Solo lee el estado; la carga sigue igual. La usa ui/velo.js para no levantar el fundido de un salto antes de tiempo.
ctx.pendientes = () => { const p = A.P(S.s, {}), pe = ctx.pend || {}; return (ctx.baseLista ? 0 : 1) + (pe.calzada || 0) + (pe.edificios || 0) + layers[1].pend(p.x, p.z, 260) + layers[0].pend(p.x, p.z, 420); };
ctx.tilesCerca = (x, z) => [...layers[1].urls(x, z, 260), ...layers[0].urls(x, z, 420)];
function hiUpdate(x, z, now) { if (now < hiNext) return; hiNext = now + 200; for (const f of layers) f(x, z); if (FUSION && FUSION.cull) FUSION.cull(x, z, Q.mem); }

// Calzada: asfalto translúcido (se ve la calle real debajo) con la línea azul del maratón
(function road() {
  const tex = canvasTex(512, 64, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = SUST.has('postes') ? 'rgba(0,0,0,0)' : 'rgba(52,56,66,.10)'; g.fillRect(0, 0, w, h);
        g.fillStyle = 'rgba(40,120,235,.82)'; g.fillRect(w * .5 - 3.5, 0, 7, h);
  });
  tex.wrapT = THREE.RepeatWrapping;
  const pos = new Float32Array(N * 2 * 3), uv = new Float32Array(N * 2 * 2), idx = new Uint32Array((N - 1) * 6), o = {};
  for (let i = 0; i < N; i++) {
    P(i * STEP, o); const lx = o.tz, lz = -o.tx, hw = ROAD_W / 2, v = i * STEP / 14, a = i * 6, b = i * 4;
    pos[a] = o.x + lx * hw; pos[a + 1] = o.y; pos[a + 2] = o.z + lz * hw; pos[a + 3] = o.x - lx * hw; pos[a + 4] = o.y; pos[a + 5] = o.z - lz * hw; uv[b] = 0; uv[b + 1] = v; uv[b + 2] = 1; uv[b + 3] = v;
  }
  let q = 0; for (let i = 0; i < N - 1; i++) { const a = i * 2, b = a + 2; idx[q++] = a; idx[q++] = b; idx[q++] = a + 1; idx[q++] = a + 1; idx[q++] = b; idx[q++] = b + 1; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(new THREE.BufferAttribute(idx, 1));
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })); m.renderOrder = 4; scene.add(m);
  // bordes coloreados por pendiente: rojo sube, verde baja, blanco llano (la cuesta se lee sin deformar el relieve)
  const ep = new Float32Array(N * 4 * 3), ec = new Float32Array(N * 4 * 4), ei = new Uint32Array((N - 1) * 12), c = new THREE.Color(), up = new THREE.Color(0xff4a2a), dn = new THREE.Color(0x2fd184), fl = new THREE.Color(0xffffff);
  for (let i = 0; i < N; i++) { P(i * STEP, o); const lx = o.tz, lz = -o.tx, a = i * 12, gr = o.grade; c.copy(fl).lerp(gr > 0 ? up : dn, clamp((Math.abs(gr) - .6) / 2.4, 0, 1)); const al = clamp((Math.abs(gr) - .7) / 1.3, 0, 1) * .85; [ROAD_W / 2 + .2, ROAD_W / 2, -ROAD_W / 2, -ROAD_W / 2 - .2].forEach((d, k) => { ep[a + k * 3] = o.x + lx * d; ep[a + k * 3 + 1] = o.y + .04; ep[a + k * 3 + 2] = o.z + lz * d; const b = i * 16 + k * 4; ec[b] = c.r; ec[b + 1] = c.g; ec[b + 2] = c.b; ec[b + 3] = al; }); }
  q = 0; for (let i = 0; i < N - 1; i++) for (const k of [0, 2]) { const a = i * 4 + k, b = a + 4; ei[q++] = a; ei[q++] = b; ei[q++] = a + 1; ei[q++] = a + 1; ei[q++] = b; ei[q++] = b + 1; }
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.BufferAttribute(ep, 3)); eg.setAttribute('color', new THREE.BufferAttribute(ec, 4)); eg.setIndex(new THREE.BufferAttribute(ei, 1));
  const em = new THREE.Mesh(eg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: true, depthWrite: false })); em.renderOrder = 5; scene.add(em);
})();

// Edificios: cada huella real extruida a su altura. El techo lleva la foto satelital. Dos familias de fachada:
// mampostería (balcones, ventanas, aires) teñida con el color real del tramo, y muro cortina de vidrio que refleja el cielo.
// De noche se enciende una parte de las ventanas.
ready.push(function buildings() {
  const E = D.edif; if (!E || !E.length || SUST.has('edificios')) return;
  let sd = 11; const r01 = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const CEL = 8, PX = 64, facTex = (emis, vidrio) => { const t = canvasTex(CEL * PX, CEL * PX, (g, w, h) => {
    g.fillStyle = emis ? '#000' : vidrio ? '#8fa6bd' : '#fff'; g.fillRect(0, 0, w, h);
    for (let r = 0; r < CEL; r++) for (let c = 0; c < CEL; c++) { const x = c * PX, y = r * PX, lit = r01() < (vidrio ? .16 : .24), k = r01();
      if (vidrio) { if (emis) { if (lit) { g.fillStyle = k < .6 ? '#ffe2b0' : '#d6e8ff'; g.fillRect(x + 2, y + 3, PX - 4, PX - 8); } } else { g.fillStyle = `rgb(${96 + k * 40},${124 + k * 40},${152 + k * 44})`; g.fillRect(x + 1.5, y + 2, PX - 3, PX - 5); g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x + 1.5, y + 2, PX - 3, 9); } }
      else if (emis) { if (lit) { g.fillStyle = k < .65 ? '#ffd9a0' : '#cfe4ff'; g.fillRect(x + 10, y + 13, PX - 20, 30); } }
      else { g.fillStyle = '#b9bcc0'; g.fillRect(x, y + PX - 6, PX, 6); g.fillStyle = k < .3 ? '#4f6074' : k < .65 ? '#5f7184' : '#77848f'; g.fillRect(x + 10, y + 13, PX - 20, 30); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(x + 10, y + 13, PX - 20, 7); if (k > .82) { g.fillStyle = '#d9d9d6'; g.fillRect(x + 14, y + 45, 16, 8); } if (k < .12) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + 10, y + 26, PX - 20, 17); } } } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  sd = 11; const mapA = facTex(false, false); sd = 11; const emA = facTex(true, false); sd = 23; const mapG = facTex(false, true); sd = 23; const emG = facTex(true, true);
  const wallMat = new THREE.MeshLambertMaterial({ map: mapA, vertexColors: true, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: emA, emissiveIntensity: 0 });
  const glassMat = new THREE.MeshStandardMaterial({ map: mapG, vertexColors: true, side: THREE.DoubleSide, metalness: .72, roughness: .2, envMapIntensity: 1.1, emissive: 0xffffff, emissiveMap: emG, emissiveIntensity: 0 });
  const roofMat = new THREE.MeshBasicMaterial({ map: baseTex, color: groundTint, side: THREE.DoubleSide });
  frameHooks.push(n => { wallMat.emissiveIntensity = n * 1.25; glassMat.emissiveIntensity = n * 1.1; });
  const pal = [0xd9d3c5, 0xcfc8b8, 0xe6e0d4, 0xc2c6ca, 0xdcc7ae, 0xcdd5d2, 0xe9dcbd, 0xbcb6aa, 0xd8b39c, 0xb3bfc8, 0xeeeae2, 0xc8b79a].map(h => new THREE.Color(h)), brick = new THREE.Color(0xb9744f), c = new THREE.Color(), hs = {};
  const chunks = new Map(), CH = 700, mk = () => ({ p: [], u: [], c: [], i: [] });
  const uvB = (x, z) => [(tileX(lonOf(x), Z0) - bx0) / bnx, 1 - (tileY(latOf(z), Z0) - by0) / bny];
  for (let bi = 0; bi < E.length; bi++) {
    const [h, known, f, vc] = E[bi], n = f.length / 2; let cx = 0, cz = 0, lo = Infinity; for (let i = 0; i < n; i++) { cx += f[i * 2]; cz += f[i * 2 + 1]; lo = Math.min(lo, hT(f[i * 2], f[i * 2 + 1])); } cx /= n; cz /= n;
    if (quitado(cx, cz)) continue;
    const base = Y(lo) - 1.5, top = Y(hT(cx, cz)) + h, key = Math.floor(cx / CH) + ',' + Math.floor(cz / CH);
    let ch = chunks.get(key); if (!ch) chunks.set(key, ch = { w: mk(), g: mk(), rp: [], ru: [], ri: [] });
    const sc = sample(cx, cz), red = sc && sc[0] > sc[1] * 1.14 && sc[0] > sc[2] * 1.3 && h < 14; if (vc) c.setHex(vc).multiplyScalar(.94 + ((bi * 13) % 10) * .012); else c.copy(red ? brick : pal[(bi * 7 + n) % pal.length]).multiplyScalar(.86 + ((bi * 13) % 10) * .022);
    c.getHSL(hs); const azul = hs.h > .5 && hs.h < .72 && hs.s > .12, vidrio = h > 34 && (azul || (hs.l < .34 && h > 60) || (bi % 9 === 0 && h > 55)), B = vidrio ? ch.g : ch.w;
    if (vidrio) c.lerp(new THREE.Color(azul ? 0xb9d2ea : 0x9fb1c2), .55);
    let acc = (bi * 5) % CEL; const vTop = (top - base) / 3.2 / CEL, v0 = ((bi * 3) % CEL) / CEL;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, x1 = f[i * 2], z1 = f[i * 2 + 1], x2 = f[j * 2], z2 = f[j * 2 + 1], len = Math.hypot(x2 - x1, z2 - z1); if (len < .3) continue;
      const w = Math.max(1, Math.round(len / 3.2)), u1 = acc / CEL, u2 = (acc + w) / CEL, k = B.p.length / 3; acc += w;
      B.p.push(x1, base, z1, x2, base, z2, x2, top, z2, x1, top, z1); B.u.push(u1, v0, u2, v0, u2, v0 + vTop, u1, v0 + vTop);
      B.c.push(c.r * .8, c.g * .8, c.b * .8, c.r * .8, c.g * .8, c.b * .8, c.r, c.g, c.b, c.r, c.g, c.b); B.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
    }
    const cont = []; for (let i = 0; i < n; i++) cont.push(new THREE.Vector2(f[i * 2], f[i * 2 + 1]));
    const tris = THREE.ShapeUtils.triangulateShape(cont, []), k0 = ch.rp.length / 3; for (let i = 0; i < n; i++) { ch.rp.push(f[i * 2], top, f[i * 2 + 1]); ch.ru.push(...uvB(f[i * 2], f[i * 2 + 1])); } for (const t of tris) ch.ri.push(k0 + t[0], k0 + t[1], k0 + t[2]);
  }
  for (const ch of chunks.values()) {
    for (const [B, mat] of [[ch.w, wallMat], [ch.g, glassMat]]) { if (!B.i.length) continue; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(B.u, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(B.c, 3)); g.setIndex(B.i); g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.castShadow = Q.alta; m.receiveShadow = Q.alta; scene.add(m); }
    const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(ch.rp, 3)); r.setAttribute('uv', new THREE.Float32BufferAttribute(ch.ru, 2)); r.setIndex(ch.ri); const rm = new THREE.Mesh(r, roofMat); rm.castShadow = Q.alta; scene.add(rm);
  }
});

// Receptor de sombras: una franja transparente a ras del suelo, a lo largo del corredor, que solo dibuja la sombra
// de edificios, árboles y corredores sobre la foto satelital.
ready.push(function shadowCatcher() {
  if (!Q.alta) return; const OFF = [-46, -30, -17, -7.2, 0, 7.2, 17, 30, 46], W = OFF.length, pos = [], idx = [], o = {}, seen = new Map(); let prev = -1, row = 0;
  for (let i = 0; i < N; i += 2) {
    const k = Math.round(R.x[i] / 14) + ',' + Math.round(R.z[i] / 14), was = seen.get(k); if (was === undefined) seen.set(k, i);
    if (was !== undefined && i - was > 60) { prev = -1; continue; }   // segunda pasada por la misma calle: no se duplica
    P(i * STEP, o); for (const d of OFF) { const x = o.x + o.tz * d, z = o.z - o.tx * d; pos.push(x, Math.abs(d) < 8 ? o.y + .07 : Y(hT(x, z)) - GAP + .34, z); }
    if (prev >= 0) for (let q = 0; q < W - 1; q++) { const a = prev * W + q, b = row * W + q; idx.push(a, b, a + 1, a + 1, b, b + 1); }
    prev = row++;
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const mat = ctx.shadowMat = new THREE.ShadowMaterial({ opacity: .46, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -12 }), m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.renderOrder = 3; scene.add(m);
  frameHooks.push(n => { mat.opacity = .46 * clamp((sunDir.y - .03) * 9, 0, 1); m.visible = mat.opacity > .01; });
});

// Árboles: la fila de acera sale del video del recorrido (densidad de copa y tipo —copa ancha o palma— a cada lado, tramo a tramo);
// las filas de fondo, de la foto satelital (solo donde es verde)
ready.push(function trees() {
  if (SUST.has('arboles')) return; const V = D.veg, spots = [], palms = [], o = {};
  for (let s = 15; s < TOTAL - 10; s += 8) {
    if (cubierto(s) || enElevado(s)) continue; P(s, o); const b = V ? Math.min(V.L.length - 1, Math.round(kmOf(s) / V.paso)) : 0;
    for (const side of [1, -1]) {
      const L = side === 1, vf = V ? (L ? V.L[b] : V.R[b]) : .3, dn = V && V.denL ? (L ? V.denL[b] : V.denR[b]) : -1, pl = V && V.palL ? (L ? V.palL[b] : V.palR[b]) : 0;
      const p1 = dn >= 0 ? (clamp((vf - .1) / .38, 0, 1) + dn / 3) / 2 : clamp((vf - .1) / .38, 0, 1);
      if (rnd() < p1 * .8) { const off = (ROAD_W / 2 + 2.2 + rnd() * 2.6) * side, x = o.x + o.tz * off, z = o.z - o.tx * off; (rnd() < pl ? palms : spots).push([x, o.y - .2, z, 9 + rnd() * 6]); }
      for (const far of [1, 2]) { const off = (ROAD_W / 2 + 6 + far * 14 + rnd() * 10) * side, x = o.x + o.tz * off, z = o.z - o.tx * off; if (!isGreen(sample(x, z)) || nearRoute(x, z, 9) || rnd() < .35) continue; spots.push([x, Y(hT(x, z)) - .5, z, 7 + rnd() * 8]); }
    }
  }
  const m = new THREE.Matrix4(), c = new THREE.Color(), q4 = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), v3 = new THREE.Vector3(), sc3 = new THREE.Vector3();
  if (spots.length) {
    // copa: icosaedro suavizado y abollado, más oscuro por debajo (sombra propia)
    const cg = mergeVertices(new THREE.IcosahedronGeometry(1, 1)), cp = cg.attributes.position, col = new Float32Array(cp.count * 3);
    for (let i = 0; i < cp.count; i++) { const q = Math.sin(cp.getX(i) * 12.9898 + cp.getY(i) * 78.233 + cp.getZ(i) * 37.719) * 43758.5453, k = .86 + (q - Math.floor(q)) * .3, y = cp.getY(i); cp.setXYZ(i, cp.getX(i) * k, y * k * .78, cp.getZ(i) * k); const sh = .55 + .45 * clamp((y + 1) / 1.6, 0, 1); col[i * 3] = sh; col[i * 3 + 1] = sh; col[i * 3 + 2] = sh; }
    cg.setAttribute('color', new THREE.BufferAttribute(col, 3)); cg.computeVertexNormals();
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.16, .3, 1, 6).translate(0, .5, 0), new THREE.MeshLambertMaterial({ color: 0x5b4a3a }), spots.length);
    const crown = new THREE.InstancedMesh(cg, new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }), spots.length * 3);
    spots.forEach((t, i) => { const hh = t[3] * .85, r = hh * .4; m.makeScale(1, hh * .62, 1).setPosition(t[0], t[1], t[2]); trunk.setMatrixAt(i, m);
      for (let k = 0; k < 3; k++) { const rr = r * (k ? .62 + rnd() * .2 : 1), a = rnd() * 6.283, d = k ? r * (.55 + rnd() * .35) : 0; q4.setFromAxisAngle(up, rnd() * 6.283); m.compose(v3.set(t[0] + Math.cos(a) * d, t[1] + hh * (k ? .6 + rnd() * .18 : .8), t[2] + Math.sin(a) * d), q4, sc3.set(rr, rr * (.8 + rnd() * .25), rr)); crown.setMatrixAt(i * 3 + k, m); c.setHSL(.25 + rnd() * .08, .42 + rnd() * .2, .2 + rnd() * .11); crown.setColorAt(i * 3 + k, c); } });
    trunk.castShadow = crown.castShadow = Q.alta; crown.receiveShadow = Q.alta; scene.add(trunk, crown);
  }
  if (palms.length) {
    // palma real (chaguaramo): fuste alto y liso, penacho de hojas que caen
    const lp = [], li = []; for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283, ca = Math.cos(a), sa = Math.sin(a), n = lp.length / 3, w = .55; for (const [d, y, ww] of [[.2, .1, w * .6], [1.7, .55, w], [3.1, .1, w * .8], [4.2, -.9, .12]]) lp.push(ca * d - sa * ww, y, sa * d + ca * ww, ca * d + sa * ww, y, sa * d - ca * ww); for (let q = 0; q < 3; q++) { const e = n + q * 2; li.push(e, e + 2, e + 1, e + 1, e + 2, e + 3); } }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3)); lg.setIndex(li); lg.computeVertexNormals();
    const pt = new THREE.InstancedMesh(new THREE.CylinderGeometry(.17, .26, 1, 7).translate(0, .5, 0), new THREE.MeshLambertMaterial({ color: 0xb9b0a0 }), palms.length), pc = new THREE.InstancedMesh(lg, new THREE.MeshLambertMaterial({ color: 0x4f8a3c, side: THREE.DoubleSide }), palms.length);
    palms.forEach((t, i) => { const hh = t[3] + 3; m.makeScale(1, hh, 1).setPosition(t[0], t[1], t[2]); pt.setMatrixAt(i, m); q4.setFromAxisAngle(up, rnd() * 6.283); m.compose(v3.set(t[0], t[1] + hh, t[2]), q4, sc3.set(1, 1, 1)); pc.setMatrixAt(i, m); });
    pt.castShadow = pc.castShadow = Q.alta; scene.add(pt, pc);
  }
});

// Señales de km, hidratación, arcos, hitos
const sideOf = (o, lado, off) => { const k = lado === 'izq' ? 1 : -1; return [o.x + o.tz * off * k, o.z - o.tx * off * k]; };
(function signs() {
  const o = {}, pole = new THREE.CylinderGeometry(.15, .15, 5, 6).translate(0, 2.5, 0), pm = new THREE.MeshLambertMaterial({ color: 0xdddddd });
  const TIENE = id => HITOS_IDS.includes(id);
  if (!TIENE('senalizacion')) for (let k = 1; k <= 42; k++) { P(sOfKm(k), o); const [x, z] = sideOf(o, 'der', ROAD_W / 2 + 1.5); const p = new THREE.Mesh(pole, pm); p.position.set(x, o.y, z); scene.add(p); const sp = setH(label(k + 'K', { bg: '#204DA2', fg: '#fff', size: 52 }), 3.2); sp.position.set(x, o.y + 6.8, z); scene.add(sp); }
  // hidratación: toldos azules
  const tmA = new THREE.MeshLambertMaterial({ color: 0x2f8cff }), tmG = new THREE.MeshLambertMaterial({ color: 0xf0501e }), wm = new THREE.MeshLambertMaterial({ color: 0xf2f2f2 }), GA = D.gatorade || [];
  (TIENE('hidratacion') ? [] : D.hidratacion).forEach(km => {
    P(sOfKm(km), o); const g = new THREE.Group(), [x, z] = sideOf(o, 'der', ROAD_W / 2 + 3);
    const isG = GA.includes(km), roof = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.6, 4).rotateY(Math.PI / 4), isG ? tmG : tmA); roof.position.y = 3.6; roof.scale.set(1.6, 1, 1);
    const table = new THREE.Mesh(new THREE.BoxGeometry(7, .9, 1.3), wm); table.position.y = .45; g.add(roof, table);
    for (const [a, b] of [[-3.4, -2], [3.4, -2], [-3.4, 2], [3.4, 2]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 2.9, 4), wm); l.position.set(a, 1.45, b); g.add(l); }
    g.position.set(x, o.y, z); g.rotation.y = Math.atan2(o.tx, o.tz) + Math.PI / 2; scene.add(g);
    const sp = setH(label((D.geles || []).includes(km) ? '💧 Agua + gel GU' : isG ? 'Gatorade' : '💧 Agua', { bg: isG ? '#f0501e' : '#2f8cff', fg: '#fff', size: 38 }), 2.4); sp.position.set(x, o.y + 7, z); scene.add(sp);
  });
  // arcos de salida y meta
  for (const [s, txt, colr] of TIENE('salida_meta') ? [] : [[12, 'SALIDA', 0xffee00], [TOTAL - 4, 'LLEGADA 42K', 0x003c60]]) {
    P(s, o); const g = new THREE.Group(), mat = new THREE.MeshLambertMaterial({ color: colr });
    for (const k of [1, -1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8, 1.2), mat); c.position.set((ROAD_W / 2 + .6) * k, 4, 0); g.add(c); }
    const top = new THREE.Mesh(new THREE.BoxGeometry(ROAD_W + 2.4, 2, 1.4), mat); top.position.y = 8.2; g.add(top);
    g.position.set(o.x, o.y, o.z); g.rotation.y = Math.atan2(o.tx, o.tz); scene.add(g);
    const sp = setH(label(txt, { bg: 'rgba(0,0,0,0)', fg: colr === 0xffee00 ? '#2b2b2b' : '#ffffff', size: 60 }), 2.2); sp.position.set(o.x, o.y + 8.2, o.z); scene.add(sp);
  }
})();
(function landmarks() {
  const o = {}, conc = new THREE.MeshLambertMaterial({ color: 0xc9c2b4 }), dark = new THREE.MeshLambertMaterial({ color: 0x3d4654 }), stone = new THREE.MeshLambertMaterial({ color: 0xa9a59c }), water = new THREE.MeshLambertMaterial({ color: 0x5fb6e8 }), green = new THREE.MeshLambertMaterial({ color: 0x4f8a4a });
  const mk = { // geometría simple por tipo de hito
    torres: (g, h) => { const al = (h.alto || 225), w = h.alto > 150 ? 36 : 26; for (const k of [-1, 1]) { const t = new THREE.Mesh(new THREE.BoxGeometry(w, al, w), dark); t.position.set(0, al / 2, k * (h.sep || 110)); g.add(t); } },
    torre: (g, h) => { const t = new THREE.Mesh(new THREE.BoxGeometry(30, (h.alto || 110), 30), dark); t.position.y = (h.alto || 110) * .5; g.add(t); },
    monolitos: g => { for (const k of [-1, 1]) { const t = new THREE.Mesh(new THREE.BoxGeometry(9, 60, 14), stone); t.position.set(k * 16, 30, 0); g.add(t); } const b = new THREE.Mesh(new THREE.BoxGeometry(70, 3, 30), conc); b.position.y = 1.5; g.add(b); },
    obelisco: g => { const t = new THREE.Mesh(new THREE.CylinderGeometry(.6, 3, 46, 4), conc); t.position.y = 23; g.add(t); },
    plaza: g => { const b = new THREE.Mesh(new THREE.CylinderGeometry(30, 30, 1, 28), conc); b.position.y = .5; const w = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 1.6, 24), water); w.position.y = 1; const j = new THREE.Mesh(new THREE.ConeGeometry(2.5, 16, 8), water); j.position.y = 9; g.add(b, w, j); },
    helicoide: g => { for (let i = 0; i < 6; i++) { const r = 95 - i * 13, t = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 9, 9, 3), conc); t.position.y = 4.5 + i * 9; t.rotation.y = i * .35; g.add(t); } const d = new THREE.Mesh(new THREE.SphereGeometry(14, 12, 8, 0, 6.283, 0, 1.57), stone); d.position.y = 58; g.add(d); },
    estadio: g => { const t = new THREE.Mesh(new THREE.CylinderGeometry(85, 70, 24, 28, 1, true), conc); t.position.y = 12; t.material = conc.clone(); t.material.side = THREE.DoubleSide; const c = new THREE.Mesh(new THREE.CylinderGeometry(68, 68, 1, 28), green); c.position.y = .6; g.add(t, c); },
    parque: () => { }, zona: () => { }, puente: () => { },
    iglesia: g => { const b = new THREE.Mesh(new THREE.BoxGeometry(18, 16, 36), conc); b.position.y = 8; const t = new THREE.Mesh(new THREE.BoxGeometry(7, 34, 7), conc); t.position.set(0, 17, 20); const c = new THREE.Mesh(new THREE.ConeGeometry(5.5, 10, 4), stone); c.position.set(0, 39, 20); g.add(b, t, c); },
  };
  D.hitos.forEach(h => {
    P(sOfKm(h.km), o); let x, z; if (h.pos) [x, z] = h.pos; else[x, z] = sideOf(o, h.lado || 'der', h.off || 60);
    const gy = h.pos ? Y(hT(x, z)) - 1 : o.y, g = new THREE.Group(); (HITOS_IDS.length || ['plaza', 'estadio'].includes(h.tipo) ? mk.zona : mk[h.tipo] || mk.zona)(g, h); g.position.set(x, gy, z); g.rotation.y = Math.atan2(o.tx, o.tz); scene.add(g);
    const lh = h.labelY || (h.tipo === 'torres' ? (h.alto || 225) + 25 : ({ torre: 200, helicoide: 95, monolitos: 80, estadio: 50 }[h.tipo] || 42));
    const sp = setH(label('📍 ' + h.nombre, { size: 40 }), h.tipo === 'torres' || h.tipo === 'helicoide' ? 15 : 9); sp.position.set(x, gy + lh, z); scene.add(sp);
    if (!['parque', 'zona', 'puente', 'plaza', 'estadio'].includes(h.tipo)) return; const pin = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, lh, 5), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 })); pin.position.set(x, gy + lh / 2, z); scene.add(pin);
  });
})();

// Túneles: trinchera de entrada, tramo cubierto (techo reticulado, murales de colores) y trinchera de salida
(D.tuneles || []).forEach(t => {
  const s0 = sOfKm(t.km0), s1 = sOfKm(t.km1), s2 = sOfKm(t.km2), s3 = sOfKm(t.km3), H = t.alto || 5.4, hw = ROAD_W / 2 + .7, o = {};
  const mural = t.estilo === 'gris' ? canvasTex(64, 128, (g, w, h) => { g.fillStyle = '#a9aaa6'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8c21f'; g.fillRect(0, h * .3, w, h * .13); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 0, 3, h); }) : canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#d9d2c4'; g.fillRect(0, 0, w, h); const cs = ['#e8823c', '#d94f7a', '#3d8fd1', '#49a36b', '#f2c84b', '#7a5bb5', '#e86f5a']; for (let i = 0; i < 26; i++) { g.fillStyle = cs[i % cs.length]; const x = i * 21 - 10, k = i % 2; g.beginPath(); g.moveTo(x, k ? 0 : h); g.lineTo(x + 46, k ? 0 : h); g.lineTo(x + 23, k ? h * .82 : h * .18); g.fill(); } });
  mural.wrapS = THREE.RepeatWrapping;
  const waffle = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#23272b'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4a5157'; g.lineWidth = 6; g.strokeRect(0, 0, w, h); }); waffle.wrapS = waffle.wrapT = THREE.RepeatWrapping;
  const wp = [], wu = [], wi = [], cp = [], cu = [], ci = [], tp = [], tu = [], ti = [], fp = [], fi = []; let k = 0;
  for (let s = s0; s <= s3 + .1; s += 4, k++) {
    P(s, o); const hh = s < s1 ? H * (s - s0) / (s1 - s0) : s > s2 ? H * (s3 - s) / (s3 - s2) : H, lx = o.tz, lz = -o.tx, u = (s - s0) / 22;
    for (const sd of [1, -1]) wp.push(o.x + lx * hw * sd, o.y - .3, o.z + lz * hw * sd, o.x + lx * hw * sd, o.y + Math.max(.4, hh), o.z + lz * hw * sd), wu.push(u, 0, u, 1, u, 0, u, 1);
    if (k) { const a = (k - 1) * 4; wi.push(a, a + 4, a + 1, a + 1, a + 4, a + 5, a + 2, a + 6, a + 3, a + 3, a + 6, a + 7); }
    fp.push(o.x + lx * hw, o.y + .06, o.z + lz * hw, o.x - lx * hw, o.y + .06, o.z - lz * hw);
    cp.push(o.x + lx * hw, o.y + H, o.z + lz * hw, o.x - lx * hw, o.y + H, o.z - lz * hw); cu.push(0, s / 2.2, ROAD_W / 2.2, s / 2.2);
    tp.push(o.x + lx * (hw + .3), o.y + H + .5, o.z + lz * (hw + .3), o.x - lx * (hw + .3), o.y + H + .5, o.z - lz * (hw + .3));
    for (const sd of [1, -1]) { const x = o.x + lx * (hw + .3) * sd, z = o.z + lz * (hw + .3) * sd; tu.push((tileX(lonOf(x), Z0) - bx0) / bnx, 1 - (tileY(latOf(z), Z0) - by0) / bny); }
    if (k && s > s1 && s <= s2 + 4) { const a = (k - 1) * 2; ci.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); ti.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); fi.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const G = (p, u, i) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); if (u) g.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2)); g.setIndex(i); return g; };
  const walls = new THREE.Mesh(G(wp, wu, wi), new THREE.MeshBasicMaterial({ map: mural, side: THREE.DoubleSide, color: 0xb9b9b9 })), ceil = new THREE.Mesh(G(cp, cu, ci), new THREE.MeshBasicMaterial({ map: waffle, side: THREE.DoubleSide }));
  const top = new THREE.Mesh(G(tp, tu, ti), new THREE.MeshBasicMaterial({ map: baseTex, color: groundTint, side: THREE.DoubleSide })), shade = new THREE.Mesh(G(fp, null, fi), new THREE.MeshBasicMaterial({ color: 0x05070a, transparent: true, opacity: .62, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -10, polygonOffsetUnits: -20 })); shade.renderOrder = 6;
  scene.add(walls, ceil, top, shade);
});
// Otras estructuras que se ven en el video: tableros de viaducto sobre la vía, pasarelas peatonales y barandas de puente
[...(D.estructuras || []), ...(D.elevados || []).map(v => ({ ...v, tipo: 'elevado' }))].forEach(e => {
  const o = {}, conc = new THREE.MeshLambertMaterial({ color: 0x9a9b98 }), dark = new THREE.MeshBasicMaterial({ color: 0x2a2d30, side: THREE.DoubleSide });
  if (e.tipo === 'pasarela') {
    P(sOfKm(e.km), o); const g = new THREE.Group(), mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(e.color || '#8a8f96') }), L = ROAD_W + 14;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(L, .5, 2.4), mat); deck.position.y = 5.6; const rail = new THREE.Mesh(new THREE.BoxGeometry(L, 1.1, 2.6), new THREE.MeshLambertMaterial({ color: new THREE.Color(e.color || '#8a8f96'), transparent: true, opacity: .55 })); rail.position.y = 6.4; g.add(deck, rail);
    for (const k of [1, -1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(.6, 5.6, .6), conc); c.position.set(k * (L / 2 - .5), 2.8, 0); const st = new THREE.Mesh(new THREE.BoxGeometry(2, .4, 11), mat); st.position.set(k * (L / 2 - 1), 2.8, 5.5); st.rotation.x = .5; g.add(c, st); }
    g.position.set(o.x, o.y, o.z); g.rotation.y = Math.atan2(o.tx, o.tz); scene.add(g);
  } else if (e.tipo === 'cubierta') {
    const s0 = sOfKm(e.km0), s1 = sOfKm(e.km1), H = e.alto || 7, hw = (e.ancho || ROAD_W + 10) / 2, tp = [], ti = [], cols = []; let k = 0;
    for (let s = s0; s <= s1 + .1; s += 5, k++) { P(s, o); const lx = o.tz, lz = -o.tx; tp.push(o.x + lx * hw, o.y + H, o.z + lz * hw, o.x - lx * hw, o.y + H, o.z - lz * hw); if (k) { const a = (k - 1) * 2; ti.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
      if (k % 4 === 0) for (const sd of [1, -1]) cols.push(new THREE.CylinderGeometry(.7, .7, H, 8).translate(o.x + lx * (ROAD_W / 2 + 2.5) * sd, o.y + H / 2, o.z + lz * (ROAD_W / 2 + 2.5) * sd)); }
    if (cols.length) { scene.add(new THREE.Mesh(mergeGeometries(cols), conc)); cols.forEach(g => g.dispose()); }   // columnas: una sola malla por cubierta
    // cara inferior: concreto gris claro a la sombra (en el video no es un hueco negro), más oscura de noche
    const bajo = new THREE.MeshBasicMaterial({ color: 0xa4a5a0, side: THREE.DoubleSide }); frameHooks.push(n => { bajo.color.setHex(0xa4a5a0).multiplyScalar(1 - .7 * n); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3)); g.setIndex(ti); scene.add(new THREE.Mesh(g, bajo));
    const g2 = g.clone(); g2.translate(0, 1.4, 0); scene.add(new THREE.Mesh(g2, new THREE.MeshBasicMaterial({ color: 0x8f918e, side: THREE.DoubleSide })));
  } else if (e.tipo === 'elevado') {
    const i0 = Math.round(sOfKm(e.km0) / STEP), i1 = Math.round(sOfKm(e.km1) / STEP), hw = ROAD_W / 2 + .8, dp = [], du = [], di = [], sp = [], si = [], rp = [], ri = [], pil = []; let k = 0;
    const deckTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#4d5057'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9d9d2'; g.fillRect(w / 2 - 2, 0, 4, h * .5); g.fillRect(4, 0, 3, h); g.fillRect(w - 7, 0, 3, h); }); deckTex.wrapT = THREE.RepeatWrapping;
    for (let i = i0; i <= i1; i++, k++) { P(i * STEP, o); const lx = o.tz, lz = -o.tx, hh = elevH[i];
      dp.push(o.x + lx * hw, o.y - .05, o.z + lz * hw, o.x - lx * hw, o.y - .05, o.z - lz * hw); du.push(0, i * STEP / 12, 1, i * STEP / 12);
      for (const sd of [1, -1]) { const x = o.x + lx * hw * sd, z = o.z + lz * hw * sd; sp.push(x, o.y - .05, z, x, o.y - Math.min(hh + .4, 1.5), z); rp.push(x, o.y, z, x, o.y + 1.05, z); }
      if (k) { const a = (k - 1) * 2, b = (k - 1) * 4; di.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); for (const arr of [si, ri]) arr.push(b, b + 4, b + 1, b + 1, b + 4, b + 5, b + 2, b + 6, b + 3, b + 3, b + 6, b + 7); }
      if (k % 3 === 0 && hh > 2.2) for (const sd of [1, -1]) pil.push(new THREE.BoxGeometry(1.2, hh, 1.2).translate(o.x + lx * (hw - 1.5) * sd, o.y - hh / 2 - .3, o.z + lz * (hw - 1.5) * sd)); }
    if (pil.length) { scene.add(new THREE.Mesh(mergeGeometries(pil), conc)); pil.forEach(g => g.dispose()); }   // pilares: una sola malla por elevado
    const G = (p, u, i) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); if (u) g.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2)); g.setIndex(i); g.computeVertexNormals(); return g; };
    scene.add(new THREE.Mesh(G(dp, du, di), new THREE.MeshBasicMaterial({ map: deckTex, color: groundTint, side: THREE.DoubleSide })), new THREE.Mesh(G(sp, null, si), new THREE.MeshLambertMaterial({ color: 0x9c9d99, side: THREE.DoubleSide })));
    // paño amarillo de baranda: se omite con `baranda: false` en el elevado o si una zona lo cubre con `sinBaranda: [[km0, km1]]` (la zona dibuja la suya)
    if (e.baranda !== false && !(D.sinBaranda || []).some(([a, b]) => e.km0 < b && e.km1 > a)) scene.add(new THREE.Mesh(G(rp, null, ri), new THREE.MeshLambertMaterial({ color: 0xf2c230, side: THREE.DoubleSide, transparent: true, opacity: .8 })));
  } else if (e.tipo === 'barandas' || e.tipo === 'baranda') {
    const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(e.color || '#f2c230'), side: THREE.DoubleSide }), wp = [], wi = []; let k = 0;
    // baranda de puente como la del video: zócalo, dos pasamanos y parales cada 2,5 m (e.macizo = murete lleno; e.dist = distancia al eje; e.lado 'L'|'R')
    const dist = e.dist || ROAD_W / 2 + .6, lados = e.lado === 'L' ? [1] : e.lado === 'R' ? [-1] : [1, -1], fr = e.macizo ? [[0, 1.1]] : [[0, .26], [.56, .68], [.98, 1.1]], q = { x: 0, z: 0 };
    const quad = (x1, y1, z1, x2, y2, z2, h) => { const a = wp.length / 3; wp.push(x1, y1, z1, x1, y1 + h, z1, x2, y2, z2, x2, y2 + h, z2); wi.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); };
    for (const sd of lados) { let px = 0, py = 0, pz = 0, has = false, n = 0;
      for (let s = sOfKm(e.km0); s <= sOfKm(e.km1) + .01; s += 2.5, n++) { P(s, o); const x = o.x + o.tz * dist * sd, z = o.z - o.tx * dist * sd;
        if (has) for (const [y0, y1] of fr) quad(px, py + y0, pz, x, o.y + y0, z, y1 - y0);
        if (!e.macizo) quad(x - o.tx * .06, o.y, z - o.tz * .06, x + o.tx * .06, o.y, z + o.tz * .06, 1.1);
        px = x; py = o.y; pz = z; has = true; } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3)); g.setIndex(wi); g.computeVertexNormals(); scene.add(new THREE.Mesh(g, mat));
  }
});
// Rótulos de las torres y edificios investigados (nombre sobre la azotea)
(D.rotulos || []).forEach(r => { const sp = setH(label(r[3], { size: 34, bg: 'rgba(16,18,26,.72)' }), 6.5); sp.position.set(r[0], Y(hT(r[0], r[1])) + r[2] + 7, r[1]); scene.add(sp); });
// Postes de alumbrado a ambos lados (encendidos mientras es de noche)
const lampMat = new THREE.MeshBasicMaterial({ color: 0xffe2a0, fog: false });
(function lamps() {
  if (SUST.has('postes')) return;
  const pts = [], o = {}; for (let s = 20, k = 0; s < TOTAL; s += 38, k++) { if (cubierto(s)) continue; P(s, o); const off = (ROAD_W / 2 + 1.1) * (k % 2 ? 1 : -1); pts.push([o.x + o.tz * off, o.y, o.z - o.tx * off, o.x, o.z]); }
  const pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(.09, .13, 9, 5).translate(0, 4.5, 0), new THREE.MeshLambertMaterial({ color: 0x8a8f96 }), pts.length), bulb = new THREE.InstancedMesh(new THREE.SphereGeometry(.42, 6, 5), lampMat, pts.length), m = new THREE.Matrix4();
  const poolTex = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,214,150,.95)'); gr.addColorStop(.45, 'rgba(255,196,120,.35)'); gr.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const poolMat = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -16 }), pool = new THREE.InstancedMesh(new THREE.PlaneGeometry(22, 22).rotateX(-Math.PI / 2), poolMat, pts.length); pool.renderOrder = 7;
  pts.forEach((p, i) => { m.makeTranslation(p[0], p[1], p[2]); pole.setMatrixAt(i, m); m.makeTranslation(p[0], p[1] + 9.1, p[2]); bulb.setMatrixAt(i, m); m.makeTranslation(p[0] * .82 + p[3] * .18, p[1] + .12, p[2] * .82 + p[4] * .18); pool.setMatrixAt(i, m); }); scene.add(pole, bulb, pool);
  frameHooks.push(n => { poolMat.opacity = n * .26; pool.visible = n > .02; });
})();
// Nubes: cúmulos pegados a la fila del Ávila y algunos sueltos sobre el valle
(function clouds() {
  if (SUST.has('nubes')) return;
  const tex = canvasTex(256, 128, (g, w, h) => { for (let i = 0; i < 26; i++) { const x = 30 + Math.random() * (w - 60), y = h * .62 - Math.random() * h * .36, r = 16 + Math.random() * 30, gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } g.fillStyle = 'rgba(190,200,215,.18)'; g.fillRect(0, h * .62, w, h * .1); });
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, opacity: .92 }), grp = new THREE.Group();
  for (let i = 0; i < 54; i++) { const sp = new THREE.Sprite(mat), norte = i < 34, x = (rnd() - .5) * 26000, z = norte ? -3800 - rnd() * 5200 : (rnd() - .5) * 22000 + 4000, sc = 1100 + rnd() * 1900; sp.position.set(x, norte ? 1250 + rnd() * 700 : 2400 + rnd() * 1500, z); sp.scale.set(sc, sc * .5, 1); grp.add(sp); }
  scene.add(grp); frameHooks.push(n => { mat.color.copy(skyU.hor.value).lerp(new THREE.Color(0xffffff), 1 - n * .75); mat.opacity = .92 - n * .45; });
})();
// Corredor (figura articulada simple)
function makeRunner(shirt, short, skin = 0xc68e63) {
  const g = new THREE.Group(), M = c => new THREE.MeshLambertMaterial({ color: c });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(.5, .62, .28), M(shirt)); torso.position.y = 1.2;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), M(skin)); head.position.y = 1.68;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(.15, 10, 6, 0, 6.283, 0, 1.3), M(0xffffff)); cap.position.y = 1.7;
  const limb = (w, l, c, x, y) => { const p = new THREE.Group(); p.position.set(x, y, 0); const m = new THREE.Mesh(new THREE.BoxGeometry(w, l, w), M(c)); m.position.y = -l / 2; p.add(m); g.add(p); return p; };
  g.userData.legs = [limb(.17, .86, short, -.13, .9), limb(.17, .86, short, .13, .9)]; g.userData.arms = [limb(.11, .58, skin, -.32, 1.46), limb(.11, .58, skin, .32, 1.46)];
  g.add(torso, head, cap); g.rotation.order = 'YXZ'; return g;
}
const heroFx = fxMods.find(m => m.makeHero)?.makeHero(ctx) || null, hero = heroFx ? heroFx.group : makeRunner(0xc6e832, 0x14161c); if (!heroFx) hero.scale.setScalar(1.3); hero.traverse(o => { if (o.isMesh) o.castShadow = Q.alta; }); scene.add(hero);
const ring = new THREE.Mesh(new THREE.RingGeometry(.62, .78, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: .8 })); scene.add(ring);
const beam = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 1, 6).translate(0, .5, 0), new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: .55, fog: false })); scene.add(beam);
// pelotón
// Gente articulada e instanciada (torso, cabeza, dos piernas y dos brazos que se mueven al correr)
function makeGente(n) {
  const parts = [{ g: new THREE.BoxGeometry(.44, .6, .25).translate(0, .3, 0), px: 0, py: .86 }, { g: new THREE.SphereGeometry(.125, 8, 6), px: 0, py: 1.6 },
    { g: new THREE.BoxGeometry(.16, .84, .17).translate(0, -.42, 0), px: -.11, py: .88, amp: .85, sg: 1 }, { g: new THREE.BoxGeometry(.16, .84, .17).translate(0, -.42, 0), px: .11, py: .88, amp: .85, sg: -1 },
    { g: new THREE.BoxGeometry(.1, .56, .11).translate(0, -.28, 0), px: -.28, py: 1.42, amp: .7, sg: -1 }, { g: new THREE.BoxGeometry(.1, .56, .11).translate(0, -.28, 0), px: .28, py: 1.42, amp: .7, sg: 1 }];
  const meshes = parts.map((p, k) => { const m = new THREE.InstancedMesh(p.g, new THREE.MeshLambertMaterial({ color: 0xffffff }), n); m.frustumCulled = false; m.castShadow = Q.alta && k !== 1 && k < 4; scene.add(m); return m; });
  const base = new THREE.Matrix4(), t = new THREE.Matrix4(), r = new THREE.Matrix4(), out = new THREE.Matrix4(), sv = new THREE.Vector3();
  return {
    color(i, jersey, shorts, skin) { [jersey, skin, shorts, shorts, skin, skin].forEach((c, k) => meshes[k].setColorAt(i, c)); },
    set(i, x, y, z, heading, phase, sc) { base.makeRotationY(heading).scale(sv.set(sc, sc, sc)).setPosition(x, y, z); for (let k = 0; k < 6; k++) { const p = parts[k]; t.makeTranslation(p.px, p.py, 0); if (p.amp) t.multiply(r.makeRotationX(Math.sin(phase) * p.amp * p.sg)); out.multiplyMatrices(base, t); meshes[k].setMatrixAt(i, out); } },
    commit(count) { for (const m of meshes) { m.count = count; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; } },
  };
}
const PIEL = [0xc68e63, 0x9a6a46, 0xe0b08a, 0x7a5236].map(h => new THREE.Color(h)), SHORT = [0x14161c, 0x1c2a4a, 0x2b2b2b, 0x3a1c1c].map(h => new THREE.Color(h));
// pelotón: domina la franela oficial (verde limón 2026, amarilla 2025)
const PACK = heroFx ? 260 : 160, gente = (fxMods.find(m => m.makeGente)?.makeGente ?? makeGente)(PACK, ctx), packD = [];
{ const c = new THREE.Color(); for (let i = 0; i < PACK; i++) { packD.push({ off: -90 + rnd() * 330, lat: (rnd() - .5) * (ROAD_W - 3), ph: rnd() * 6.28, v: (rnd() - .5) * .5, cad: .9 + rnd() * .25 }); const q = rnd(); if (q < .45) c.setHex(0xc6e832); else if (q < .62) c.setHex(0xf8e100); else if (q < .72) c.setHex(0x1f4fbf); else c.setHSL(rnd(), .7, .55); gente.color(i, c.clone(), SHORT[i % 4], PIEL[(i * 7) % 4]); } }
// público en hitos, salida y meta
(function crowd() {
  if (HITOS_IDS.includes('animacion')) return;
  const pts = [], o = {}, zones = [[0, 260], [TOTAL - 420, TOTAL], ...D.hitos.filter(h => h.publico).map(h => [sOfKm(h.km) - 90, sOfKm(h.km) + 90])];
  for (const [a, b] of zones) for (let s = Math.max(0, a); s < Math.min(TOTAL, b); s += 2.2) { P(s, o); const k = rnd() < .5 ? 1 : -1, off = (ROAD_W / 2 + 1.2 + rnd() * 2.5) * k; pts.push([o.x + o.tz * off, o.y, o.z - o.tx * off]); }
  const m = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.3, 1, 3, 6).translate(0, .85, 0), new THREE.MeshLambertMaterial({ color: 0xffffff }), pts.length), mt = new THREE.Matrix4(), c = new THREE.Color();
  pts.forEach((p, i) => { mt.makeScale(1.25, 1.2 + rnd() * .3, 1.25).setPosition(p[0], p[1], p[2]); m.setMatrixAt(i, mt); c.setHSL(rnd(), .6, .5 + rnd() * .2); m.setColorAt(i, c); }); scene.add(m);
})();

// ───────── Estado ─────────
const S = { mode: 'tour', running: false, paused: false, s: 0, clock: 0, scale: 30, target: 4 * 3600, cam: 0, effort: 1, energy: 100, hyd: 100, v: 0, wall: false, wallKm: null, drunk: new Set(), missed: 0, splits: [], tramoLog: [], lastT: -1, seenH: new Set(), toastUntil: 0, drinkPen: 0, effTime: [0, 0, 0, 0] };
Object.defineProperty(S, 'sr', { get: () => A.sRef(S.s) });   // s de referencia (42K) de la posición del corredor en la ruta activa
const gradeSpeed = g => g > 0 ? 1 / (1 + .033 * Math.min(g, 12)) : 1 + .016 * Math.min(-g, 6);
// reparto parejo de esfuerzo: tiempo de paso planificado por punto (para el delta contra el plan)
let plan; const rehacerPlan = () => { const NA = A.N, gA = A.gradeAt; plan = new Float32Array(NA); let t = 0; for (let i = 1; i < NA; i++) { t += STEP / gradeSpeed(gA(i * STEP)); plan[i] = t; } const k = 1 / t; for (let i = 0; i < NA; i++) plan[i] *= k; }; rehacerPlan();
const planAt = s => { const f = clamp(s / STEP, 0, A.N - 1), i = Math.min(A.N - 2, Math.floor(f)); return lerp(plan[i], plan[i + 1], f - i) * S.target; };
const vBase = () => { let sum = 0; for (let i = 1; i < A.N; i++) sum += STEP / gradeSpeed(A.gradeAt(i * STEP)); return sum / S.target; }; // velocidad en llano que cumple el objetivo
let VB = 3;
const tramoIdx = km => { const t = A.tramos; for (let i = 0; i < t.length; i++) if (km < t[i].km1) return i; return t.length - 1; };
// subidas detectadas (para "próxima subida")
let climbs; const rehacerSubidas = () => { climbs = (A.subidas || []).map(c => ({ s0: A.sOfKm(c.km0), s1: A.sOfKm(c.km1), gain: c.gain, n: c.nombre })); }; rehacerSubidas();

// ───────── HUD ─────────
const prof = $('prof'), pctx = prof.getContext('2d'); let profBase = null;
function drawProfileBase() {
  const w = prof.clientWidth, h = prof.clientHeight; if (!w) return; const dpr = Math.min(devicePixelRatio, 2); prof.width = w * dpr; prof.height = h * dpr;
  const c = document.createElement('canvas'); c.width = prof.width; c.height = prof.height; const g = c.getContext('2d'); g.scale(dpr, dpr);
  const top = 16, bot = h - 14, yy = e => bot - (e - eMin + 4) / (eMax - eMin + 10) * (bot - top);
  const NA = A.N, EA = A.e, TA = A.TOTAL; for (let px = 0; px < w; px++) { const i = Math.round(px / w * (NA - 1)), gr = A.gradeAt(i * STEP); g.fillStyle = gr > 1.2 ? (gr > 3 ? '#ff4a2a' : '#ff8a5c') : gr < -1.2 ? '#3ecf8e' : '#f2c94c'; const y = yy(EA[i]); g.globalAlpha = .9; g.fillRect(px, y, 1, bot - y); }
  g.globalAlpha = 1; g.fillStyle = 'rgba(244,239,230,.55)'; g.font = '10px Inter,sans-serif'; g.textAlign = 'center';
  for (let k = 5; k < A.KM; k += 5) { const x = A.sOfKm(k) / TA * w; g.fillRect(x, bot, 1, 4); g.fillText(k, x, h - 1); }
  g.fillStyle = '#4aa8ff'; A.hidratacion.forEach(k => { const x = A.sOfKm(k) / TA * w; g.beginPath(); g.arc(x, 6, 2.4, 0, 6.3); g.fill(); });
  g.fillStyle = '#fff'; A.hitos.forEach(hh => { const x = A.sOfKm(hh.km) / TA * w; g.fillRect(x - .5, 11, 1, 5); });
  g.textAlign = 'left'; g.fillStyle = 'rgba(244,239,230,.6)'; g.fillText(Math.round(eMax) + ' m', 4, top + 8); g.fillText(Math.round(eMin) + ' m', 4, bot - 3);
  profBase = c;
}
function drawProfile() {
  if (!profBase) return; const w = prof.width, h = prof.height, x = S.s / A.TOTAL * w; pctx.clearRect(0, 0, w, h); pctx.drawImage(profBase, 0, 0);
  pctx.fillStyle = 'rgba(10,12,18,.5)'; pctx.fillRect(x, 0, w - x, h); pctx.fillStyle = '#fff'; pctx.fillRect(x - 1, 0, 2, h);
}
function seekFromEvent(ev) { if (S.mode !== 'tour') return; const r = prof.getBoundingClientRect(), cx = (ev.touches ? ev.touches[0].clientX : ev.clientX); seek(clamp((cx - r.left) / r.width, 0, 1) * A.TOTAL); }
let dragging = false; prof.addEventListener('pointerdown', e => { dragging = true; seekFromEvent(e); }); addEventListener('pointermove', e => dragging && seekFromEvent(e)); addEventListener('pointerup', () => dragging = false);
// minimapa
const mini = $('miniC'), mctx = mini.getContext('2d'); let miniBase, mx0, mz0, msc;
function miniBaseDraw() {
  let a = Infinity, b = -Infinity, c = Infinity, d = -Infinity; for (let i = 0; i < N; i++) { a = Math.min(a, R.x[i]); b = Math.max(b, R.x[i]); c = Math.min(c, R.z[i]); d = Math.max(d, R.z[i]); }
  const W = mini.width, pad = 18; msc = (W - pad * 2) / (b - a); mini.height = Math.round((d - c) * msc + pad * 2 + 26); mx0 = a - pad / msc; mz0 = c - (pad + 20) / msc;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = mini.height; const g = cv.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, cv.height); gr.addColorStop(0, '#2c4a36'); gr.addColorStop(.28, '#232733'); gr.addColorStop(1, '#1b1e28'); g.fillStyle = gr; g.fillRect(0, 0, W, cv.height);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 5; g.lineJoin = g.lineCap = 'round'; g.beginPath(); for (let i = 0; i < N; i += 2) { const x = (R.x[i] - mx0) * msc, y = (R.z[i] - mz0) * msc; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  if (A.id !== '42') { g.fillStyle = gr; g.fillRect(0, 0, W, cv.height); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.13)'; g.stroke(); g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.42)'; g.beginPath(); for (let i = 0; i < A.N; i += 2) { const x = (A.x[i] - mx0) * msc, y = (A.z[i] - mz0) * msc; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  g.fillStyle = 'rgba(244,239,230,.5)'; g.font = '15px Inter,sans-serif'; g.textAlign = 'center'; g.fillText('▲ El Ávila', W / 2, 17);
  miniBase = cv;
}
miniBaseDraw();
function drawMini() {
  mctx.drawImage(miniBase, 0, 0); mctx.strokeStyle = '#ffd23f'; mctx.lineWidth = 5; mctx.lineJoin = mctx.lineCap = 'round'; mctx.beginPath();
  const n = Math.floor(S.s / STEP), AX = A.x, AZ = A.z; for (let i = 0; i <= n; i += 2) { const x = (AX[i] - mx0) * msc, y = (AZ[i] - mz0) * msc; i ? mctx.lineTo(x, y) : mctx.moveTo(x, y); } mctx.stroke();
  const p = A.P(S.s), x = (p.x - mx0) * msc, y = (p.z - mz0) * msc; mctx.fillStyle = '#fff'; mctx.beginPath(); mctx.arc(x, y, 8, 0, 6.3); mctx.fill(); mctx.fillStyle = '#ff5a3c'; mctx.beginPath(); mctx.arc(x, y, 5, 0, 6.3); mctx.fill();
}
function toast(t, d, secs = 5) { $('toT').textContent = t; $('toD').textContent = d || ''; $('toast').classList.add('on'); S.toastUntil = performance.now() + secs * 1000; }
function setTramo(i) {
  if (i === S.lastT) return; S.lastT = i; const t = A.tramos[i]; $('tTag').textContent = `Tramo ${i + 1} de ${A.tramos.length} · km ${t.km0.toFixed(1)}–${t.km1.toFixed(1)}`; $('tName').textContent = t.nombre; $('tDesc').textContent = t.desc; $('tTip').innerHTML = '<b>Clave:</b> ' + t.consejo;
}
function updateHUD() {
  const km = A.kmOf(S.s), p = A.P(S.s); $('sKm').textContent = km.toFixed(1); $('sClock').textContent = fmtT(S.clock); $('sPace').textContent = fmtP(S.v); $('sEle').textContent = Math.round(p.e) + ' m';
  const g = p.grade; $('sGrade').textContent = (g > 0 ? '+' : '') + g.toFixed(1) + ' %'; $('sGrade').style.color = g > 1.2 ? 'var(--up)' : g < -1.2 ? 'var(--down)' : 'var(--bone)';
  setTramo(tramoIdx(km));
  const nw = A.hidratacion.find(k => k > km + .03); $('nWater').innerHTML = nw ? `💧 Hidratación en <b>${((nw - km) * 1000 > 950 ? (nw - km).toFixed(1) + ' km' : Math.round((nw - km) * 100) * 10 + ' m')}</b>` : '💧 No quedan puestos: a meta';
  const cl = climbs.find(c => c.s1 > S.s); $('nHill').innerHTML = !cl ? '⛰ No quedan subidas' : cl.s0 <= S.s ? `⛰ Subiendo ${cl.n}: faltan <b>${cl.s1 - S.s > 950 ? ((cl.s1 - S.s) / 1000).toFixed(1) + ' km' : Math.round((cl.s1 - S.s) / 10) * 10 + ' m'}</b>` : `⛰ ${cl.n} en <b>${(A.kmOf(cl.s0) - km).toFixed(1)} km</b> (+${cl.gain} m en ${cl.s1 - cl.s0 > 950 ? ((cl.s1 - cl.s0) / 1000).toFixed(1) + ' km' : Math.round((cl.s1 - cl.s0) / 10) * 10 + ' m'})`;
  $('mStreet').textContent = A.calle(S.s);
  drawProfile(); drawMini();
  if (S.toastUntil && performance.now() > S.toastUntil) { $('toast').classList.remove('on'); S.toastUntil = 0; }
}

// ───────── Simulación ─────────
function seek(s) { hiNext = 0;   /* tras un salto, el descarte por distancia de los hitos se recalcula en el cuadro siguiente, no 200 ms después */ if (Math.abs(s - S.s) > 400) precarga = 1; S.s = clamp(s, 0, A.TOTAL - 1); if (S.mode === 'tour') S.clock = planAt(S.s); camSnap = true; S.seenH = new Set(A.hitos.filter(h => A.sOfKm(h.km) < S.s - 30).map(h => h.km)); }
function drink() { window.__cafUI?.carrera?.beber(); }   // «Correr la carrera» vive en ui/carrera.js (modelo en ui/carrera_modelo.js)
function step(dtReal) {
  if (S.mode === 'race') { window.__cafUI?.carrera?.paso(dtReal); return; }   // la carrera la avanza su modelo (ui/carrera.js)
  const km = A.kmOf(S.s), g = A.gradeAt(S.s); let slow = 1;
  // hitos: aviso y cámara lenta al pasar
  for (const h of A.hitos) { const d = A.sOfKm(h.km) - S.s; if (d < 160 && d > -40) { if (S.mode === 'tour') slow = .4; if (!S.seenH.has(h.km)) { S.seenH.add(h.km); toast('📍 ' + h.nombre, (h.pos ? '' : (h.lado === 'izq' ? 'A tu izquierda. ' : 'A tu derecha. ')) + h.desc, 6.5); } } }
  const dt = dtReal * S.scale * slow;
  S.v = VB * gradeSpeed(g);
  const k5a = Math.floor(km / 5); S.s += S.v * dt; S.clock += dt; const k5b = Math.floor(A.kmOf(S.s) / 5); if (k5b > k5a && k5b * 5 < A.KM) S.splits.push({ km: k5b * 5, t: S.clock, e: S.energy });
  if (S.s >= A.TOTAL - 1) { S.s = A.TOTAL - 1; finish(); }
}
function start(mode, o = {}) {
  S.resumen = !!o.resumen; S.dia = mode !== 'race'; $('bLuz').textContent = S.dia ? '☀️ Pleno día' : '🌅 Hora real'; document.body.dataset.modo = S.resumen ? 'resumen' : mode;   // recorrido y resumen de día; la carrera con la luz de la hora real
  Object.assign(S, { mode, running: true, paused: false, s: 0, clock: 0, effort: 1, energy: 100, hyd: 100, wall: false, wallKm: null, drunk: new Set(), missed: 0, splits: [], tramoLog: [], lastT: -1, seenH: new Set(), effTime: [0, 0, 0, 0] });
  VB = vBase(); camSnap = true; $('start').style.display = 'none'; $('end').style.display = 'none'; $('hud').style.display = 'block';
  prof.style.cursor = mode === 'tour' ? 'pointer' : 'default'; setSpeed(S.scale); drawProfileBase(); $('bPlay').textContent = '⏸ Pausa';
  if (mode === 'tour') toast('Salida: Parque Los Caobos', 'Toca el perfil de abajo para saltar a cualquier km.', 6);
  window.__cafUI?.ayuda?.alEmpezar(mode);
}
function finish() {
  S.running = false; let html;
  if (S.mode === 'tour') {
    const sub = A.subidas || [], gain = sub.reduce((a, c) => a + c.gain, 0), larga = sub.slice().sort((a, b) => b.gain - a.gain)[0], eTop = A.id === '42' ? eMax : Math.max(...A.e), eLow = A.id === '42' ? eMin : Math.min(...A.e), iTop = Array.prototype.indexOf.call(A.e, eTop), iLow = Array.prototype.indexOf.call(A.e, eLow), P = window.__cafUI?.plan?.calc(S.target), fk = k => k.toLocaleString('es');
    const mmss = t => { t = Math.round(t); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
    html = `<div class="tag">Ruta reconocida</div><h1>${A.KM.toLocaleString('es')} km <em>en tu cabeza</em></h1><p class="sub">Lo que acabas de ver, en cuatro datos.${P ? ` Con ${fmtT(S.target)} de objetivo la media es ${mmss(P.mean)}/km, pero el km ${P.lentos[0]} sale a ${mmss(P.kms[P.lentos[0] - 1].p)} y el ${P.rapidos[0]} a ${mmss(P.kms[P.rapidos[0] - 1].p)}: tu plan trae los ${Math.floor(A.KM)}.` : ''}</p>
      <div class="kpis"><div><b>${sub.length}</b><span>subidas, +${gain} m entre todas; ${larga ? `la que decide va del km ${fk(larga.km0)} al ${fk(larga.km1)}` : ''}</span></div><div><b>${A.hidratacion.length}</b><span>puestos de agua, ${A.gatorade.length} con isotónico</span></div><div><b>km ${A.geles.map(fk).join(' y ')}</b><span>gel oficial</span></div><div><b>${Math.round(eTop)} m</b><span>el techo, en el km ${fk(Math.round(A.kmOf(iTop * STEP) * 10) / 10)}; lo más bajo, ${Math.round(eLow)} m en el km ${fk(Math.round(A.kmOf(iLow * STEP) * 10) / 10)}</span></div></div>`;
  }
  $('endC').innerHTML = html + `<div class="acts"><button class="go" id="ePlan">Ver mi plan</button><button class="go alt" id="eShare">Compartir</button><button class="go alt" id="eMenu">Empezar de nuevo</button><button class="lnk" id="eAgain">o córrela tú: arma tu estrategia</button></div>`;
  $('end').style.display = 'flex'; $('eAgain').onclick = () => go('race'); $('eMenu').onclick = menu; $('ePlan').onclick = () => window.__cafUI?.plan?.abrir();
  $('eShare').onclick = () => window.__cafUI?.plan?.compartir('');
}
function menu() { S.running = false; $('end').style.display = 'none'; $('hud').style.display = 'none'; $('start').style.display = 'flex'; }
function setSpeed(v) { S.scale = v; document.querySelectorAll('#segSpd button').forEach(b => b.classList.toggle('on', +b.dataset.s === v)); }
function togglePause() { if (!S.running) return; S.paused = !S.paused; $('bPlay').textContent = S.paused ? '▶ Seguir' : '⏸ Pausa'; }
function toggleIdx(f) { const el = $('idx'), on = f ?? el.style.display !== 'block'; el.style.display = on ? 'block' : 'none'; }

// UI
let selMode = 'tour'; $('start').dataset.sel = selMode;
document.querySelectorAll('.mode').forEach(m => m.onclick = () => { selMode = m.dataset.m; $('start').dataset.sel = selMode; document.querySelectorAll('.mode').forEach(x => x.classList.toggle('sel', x === m)); $('bGo').textContent = { tour: 'Salir de Los Caobos →', race: 'Armar mi estrategia →' }[selMode]; });
// «Correr la carrera» pasa primero por la pantalla de estrategia (ui/carrera.js); el recorrido arranca tapado hasta que carga (ui/velo.js)
const go = m => m === 'race' && window.__cafUI?.carrera ? window.__cafUI.carrera.estrategia() : (start(m === 'race' ? 'tour' : m), window.__cafUI?.velo?.cubrirInicio());
const seg = (id, fn) => document.querySelectorAll('#' + id + ' button').forEach(b => b.onclick = () => { document.querySelectorAll('#' + id + ' button').forEach(x => x.classList.toggle('on', x === b)); fn(b); });
seg('segT', b => S.target = +b.dataset.t * 3600); seg('segD', b => S.scale = +b.dataset.s); seg('segSpd', b => setSpeed(+b.dataset.s));
$('tramo').onclick = () => $('tramo').classList.toggle('open'); document.querySelectorAll('#segQ button').forEach(b => { b.classList.toggle('on', b.dataset.q === Q.tier); b.onclick = () => { try { localStorage.setItem('caf3d-calidad', b.dataset.q); } catch (e) { } location.reload(); }; });
$('bGo').onclick = () => go(selMode); $('bPlan').onclick = $('bPlanS').onclick = () => window.__cafUI?.plan?.abrir(); $('bPlay').onclick = togglePause; $('bCam').onclick = () => { S.cam = { 0: 3, 3: 1, 1: 2, 2: 0 }[S.cam] ?? 0; camSnap = true; $('bCam').textContent = '🎥 ' + ['Seguimiento', 'Dron', 'Cenital', 'A bordo'][S.cam]; }; $('bIdx').onclick = () => toggleIdx(); $('bLuz').onclick = () => { S.dia = !S.dia; $('bLuz').textContent = S.dia ? '☀️ Pleno día' : '🌅 Hora real'; }; $('bMenu').onclick = menu;
const pintaIdx = () => { $('idxL').innerHTML = A.tramos.map((t, i) => `<div class="it" data-i="${i}"><b>km ${t.km0.toFixed(1)}–${t.km1.toFixed(1)}</b><div><b>${t.nombre}</b><br><span>${t.consejo}</span></div></div>`).join(''); }; pintaIdx();
$('idxL').onclick = e => { const it = e.target.closest('.it'); if (!it) return; if (S.mode === 'tour') seek(A.sOfKm(A.tramos[+it.dataset.i].km0)); toggleIdx(false); };
addEventListener('keydown', e => {
  if (e.target.closest?.('input,textarea') || window.__cafUI?.plan?.abierto) return;
  if (!S.running) { if (e.key === 'Enter' && $('start').style.display !== 'none') go(selMode); return; }
  const k = e.key.toLowerCase(); if (k === ' ') { e.preventDefault(); togglePause(); } else if (k === 'c') $('bCam').click(); else if (k === 'f') { S.verFps = !S.verFps; $('fps').style.display = S.verFps ? 'block' : 'none'; } else if (k === 't') toggleIdx(); else if (k === 'escape') toggleIdx(false); else if (k === 'p') window.__cafUI?.plan?.abrir();
  else if (k === 'arrowright' && S.mode === 'tour') seek(S.s + 500); else if (k === 'arrowleft' && S.mode === 'tour') seek(S.s - 500);
});
const pintaFine = () => { $('fine').innerHTML = `Proyecto independiente hecho por un corredor: no es un producto oficial de CAF ni de la organización del maratón. Trazado: ${D.meta.fuente}. Imagen satelital: Esri, Maxar, Earthstar Geographics. Relieve SRTM 30 m y ${(D.edif || []).length.toLocaleString('es')} edificios con su huella real de © OpenStreetMap. Todo está a escala real 1:1; los bordes de la calzada se tiñen de rojo cuando sube y de verde cuando baja. Voz de llegada: Diana Rendeiro (@dianarendeiro), animadora del Maratón CAF, con su permiso; audio de la transmisión oficial de la carrera. ${A.aviso || ''}`; }; pintaFine();
// Distancia: «42K · Maratón» o «21K · Media» en la portada (los dos modos), recordada en localStorage y con ?dist= en la URL
const OBJ = { '42': [3.25, 3.5, 4, 4.5, 5], '21': [1.5, 1.75, 2, 2.25, 2.5] }, alDist = [];
function setDist(id, guardar = true) { id = id === '21' ? '21' : '42'; for (const k in A) delete A[k]; Object.assign(A, DIST[id]); S.dist = id; document.body.dataset.dist = id;
  if (guardar) try { localStorage.setItem('caf3d-distancia', id); } catch (e) { }
  rehacerPlan(); rehacerSubidas(); S.lastT = -1; pintaIdx(); pintaFine(); miniBaseDraw(); drawProfileBase(); { const k = $('sKmT'); if (k) k.textContent = '/ ' + (A.id === '42' ? '42.2' : '21.1') + ' km'; }
  document.querySelectorAll('#segDist button').forEach(b => b.classList.toggle('on', b.dataset.dist === id));
  document.querySelectorAll('#segT button').forEach((b, i) => { const h = OBJ[id][i]; if (h == null) return; b.dataset.t = h; b.textContent = Math.floor(h) + ':' + String(Math.round(h % 1 * 60)).padStart(2, '0'); });
  { const sp = document.querySelector('#start .sub'); if (sp) sp.textContent = sp.textContent.replace(/^Los [\d,]+ km/, id === '42' ? 'Los 42,195 km' : 'Los 21,0975 km'); }
  alDist.forEach(f => { try { f(id); } catch (e) { console.error('distancia', e); } }); }
document.querySelectorAll('#segDist button').forEach(b => b.onclick = () => setDist(b.dataset.dist));
setDist(distGuardada(), false);

// ───────── Cámara y bucle ─────────
let camSnap = true; const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3(), wantPos = new THREE.Vector3(), wantTgt = new THREE.Vector3(), pa = {}, pb = {}, pc = {};
// Luz según la hora real de carrera: se sale a las 6:05 a.m. de noche y amanece hacia el minuto 40
// [minuto, horizonte, sol, intensidad, cenit, brillo del suelo]
const skyStops = [[0, 0x323c63, 0x9fb0e0, .5, 0x121a38, .6], [22, 0x77749a, 0xbdb4dc, .85, 0x2a3b69, .72], [40, 0xf0c3a0, 0xffcfa6, 1.4, 0x5f8fd0, .82], [65, 0xd9e6ee, 0xfff0dc, 2.0, 0x4f95dc, .97], [150, 0xcfe2ee, 0xffffff, 2.5, 0x3f88d6, 1]], cA = new THREE.Color(), cB = new THREE.Color();
function sky(min) { let i = 0; while (i < skyStops.length - 2 && min > skyStops[i + 1][0]) i++; const a = skyStops[i], b = skyStops[i + 1], t = clamp((min - a[0]) / (b[0] - a[0]), 0, 1); cA.setHex(a[1]).lerp(cB.setHex(b[1]), t); skyU.hor.value.copy(cA); scene.fog.color.copy(cA); skyU.top.value.setHex(a[4]).lerp(cB.setHex(b[4]), t); sun.color.setHex(a[2]).lerp(cB.setHex(b[2]), t); sun.intensity = lerp(a[3], b[3], t); const gt = lerp(a[5], b[5], t), cool = 1 - clamp((min - 15) / 40, 0, 1); hemi.intensity = .85 + .8 * gt; groundTint.setRGB(gt * (1 - .14 * cool), gt * (1 - .06 * cool), gt * (1 + .1 * cool)); // «pleno día» = mediodía tropical, como el video de referencia (sol alto, sombras cortas y duras); «hora real» = el sol sube desde el este
  const el = THREE.MathUtils.degToRad(S.dia ? 64 : clamp(-7 + (min - 36) / 224 * 62, -9, 56)), az = THREE.MathUtils.degToRad(S.dia ? 158 : 96 + clamp(min / 260, 0, 1) * 28); sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az));
  NOCHE = clamp(1 - (min - 24) / 24, 0, 1); skyU.sunK.value = clamp((el + .12) * 6, 0, 1); skyU.sunCol.value.copy(sun.color); if (el < .03) { sun.intensity *= .25; } sun.castShadow = Q.alta && Q.sombras !== false && el > .035;
  if (NOCHE > .02) lampMat.color.setRGB(3.2 * NOCHE + .7, 2.7 * NOCHE + .7, 1.7 * NOCHE + .7); else lampMat.color.setHex(0xb9bcc0);
  envUpdate(Math.round(min / 6) + (S.dia ? 1000 : 0)); return min; }
let last = performance.now(), anim = 0, idleS = 0;
let triEsc = 0; scene.onAfterRender = () => { triEsc = renderer.info.render.triangles; };   // triángulos de la escena (el último pase del posproceso es un solo rectángulo)
// Mira de la cámara de seguimiento: el punto a `la` m por la ruta, salvo que la ruta se abra más de 35° del rumbo del corredor (retorno en U,
// esquina cerrada); entonces mira hacia el último punto que aún cae dentro de ese cono, a la misma distancia y a la altura del corredor.
// Antes, en el retorno de Petare la mira ya estaba en la vuelta (10 m a la izquierda y por detrás) y la imagen giraba antes que el corredor.
const _ma = {};
function miraAdelante(s, p, la, o) {
  A.P(s + la, o); const dx = o.x - p.x, dz = o.z - p.z; if ((dx * p.tx + dz * p.tz) / (Math.hypot(dx, dz) || 1) > .82) return o;
  let bx = p.tx, bz = p.tz;
  for (let d = 4; d < la; d += 4) { A.P(s + d, _ma); const ex = _ma.x - p.x, ez = _ma.z - p.z, el = Math.hypot(ex, ez) || 1; if ((ex * p.tx + ez * p.tz) / el < .82) break; bx = ex / el; bz = ez / el; }
  o.x = p.x + bx * la; o.z = p.z + bz * la; o.y = p.y; return o;
}
// Retorno en U (la ruta da media vuelta en ±20 m): la cámara de seguimiento va detrás del corredor según su rumbo (cuerda de ±10 m de ruta) y mira
// hacia adelante en ese rumbo; yendo por la ruta quedaba al lado del corredor o de espaldas a él. Devuelve el peso 0..1 (0 en esquinas normales).
const _ua = {}, _ub = {};
function giroU(s) {
  A.P(s - 20, _ua); A.P(s + 20, _ub); const w = clamp((-.2 - (_ua.tx * _ub.tx + _ua.tz * _ub.tz)) / .5, 0, 1); if (!w) return 0;
  A.P(s - 10, _ua); A.P(s + 10, _ub); const dx = _ub.x - _ua.x, dz = _ub.z - _ua.z, l = Math.hypot(dx, dz) || 1; giroU.tx = dx / l; giroU.tz = dz / l; return w;
}
function frame(now) {
  requestAnimationFrame(frame); const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (S.running && !S.paused) step(dt);
  const s = S.running || $('end').style.display === 'flex' ? S.s : (idleS = (idleS + dt * 260) % A.TOTAL), p = A.P(s, pa), sc = S.running ? S.scale : 30, sr = A.sRef(s);
  // héroe
  anim += dt * (S.paused ? 0 : 11); hero.position.set(p.x, p.y, p.z); hero.rotation.y = Math.atan2(p.tx, p.tz); const sw = Math.sin(anim) * .9;
  if (heroFx) { const cui = window.__cafUI, cst = S.mode === 'race' && S.running && cui && cui.carrera && cui.carrera.st ? cui.carrera.st : null;   /* en carrera, la postura del corredor refleja fatiga, energía baja y el muro */
    heroFx.update({ fase: anim, pausado: S.paused, dt, v: S.v, pendiente: p.grade, fatiga: cst ? clamp(Math.max(cst.F / 100, cst.muro ? .85 : 0, 1 - cst.E / 35), 0, 1) : 0, caminando: !!(cst && cst.muro && S.v < 2.2) }); } else { hero.userData.legs[0].rotation.x = sw; hero.userData.legs[1].rotation.x = -sw; hero.userData.arms[0].rotation.x = -sw * .8; hero.userData.arms[1].rotation.x = sw * .8; hero.position.y += Math.abs(Math.cos(anim)) * .12; hero.rotation.x = .08; }
  ring.position.set(p.x, p.y + .15, p.z); beam.position.set(p.x, p.y + 4, p.z); const far = S.cam === 2 ? 1 : sc > 45 ? .6 : 0; beam.scale.set(1 + far * 6, 60 + far * 400, 1 + far * 6); beam.visible = far > 0; ring.scale.setScalar(1 + far * 10);
  // pelotón (se dispersa con los km)
  const m4 = frame.m || (frame.m = new THREE.Matrix4()), dens = 1 - .75 * (s / A.TOTAL); let vis = 0;
  for (let i = 0; i < PACK; i++) { const d = packD[i]; if (!S.paused) d.off += d.v * dt * 3; if (d.off > 240) d.off = -90; if (d.off < -90) d.off = 240; if (i / PACK > dens) continue; if (S.cam === 3 && d.off > -6 && d.off < 5) d.off += 9; const q = A.P(clamp(s + d.off, 0, A.TOTAL), pb); gente.set(vis++, q.x + q.tz * d.lat, q.y + Math.abs(Math.cos(anim * d.cad + d.ph)) * .07, q.z - q.tx * d.lat, Math.atan2(q.tx, q.tz), anim * d.cad + d.ph, 1.12); }
  gente.commit(vis);
  // cámara
  // seguimiento: baja y pegada al corredor, por debajo de las copas; va SOBRE la ruta (no corta esquinas) aunque el tiempo vaya comprimido
  if (S.cam === 0) { const tun = cubierto(sr) || cubierto(A.sRef(s - 14)), kq = Math.min(sc, 60) / 60, back = tun ? 7 : 8.5 + kq * 5, hgt = tun ? 2.4 : 3 + kq * 1.4, la = 30 + kq * 30, b = A.P(s - back, pb), f = miraAdelante(s, p, la, pc), wu = giroU(s); wantPos.set(b.x, Math.max(b.y, p.y - 1) + hgt, b.z); wantTgt.set(f.x, (f.y + p.y) / 2 + 1.6, f.z); camera.up.set(0, 1, 0);
    if (wu) { wantPos.x = lerp(wantPos.x, p.x - giroU.tx * back, wu); wantPos.z = lerp(wantPos.z, p.z - giroU.tz * back, wu); wantTgt.x = lerp(wantTgt.x, p.x + giroU.tx * la, wu); wantTgt.z = lerp(wantTgt.z, p.z + giroU.tz * la, wu); } }
  else if (S.cam === 3) { const f = A.P(s + 60, pc), bob = S.paused ? 0 : Math.abs(Math.sin(anim)) * .05; wantPos.set(p.x, p.y + 1.62 + bob, p.z); wantTgt.set(f.x, f.y + 1.5, f.z); camera.up.set(0, 1, 0);
    { const gw = A.giro(s); if (gw > 0) { wantTgt.x = lerp(wantTgt.x, p.x + p.tx * 25, gw); wantTgt.z = lerp(wantTgt.z, p.z + p.tz * 25, gw); wantTgt.y = lerp(wantTgt.y, p.y + 1.5, gw); } } }   // a bordo en el retorno en U: mira según el rumbo (continuo), no a 60 m de ruta, que salta a la otra calzada
  else if (S.cam === 4) { const b = A.P(s - 55, pb), f = A.P(s + 140, pc); wantPos.set(b.x, Math.max(b.y, p.y) + 22, b.z); wantTgt.set(f.x, f.y + 4, f.z); camera.up.set(0, 1, 0); }   // dron bajo (resumen de 60 s)
  else if (S.cam === 1) { const a = now * .00008, r = 150 + sc * 2; wantPos.set(p.x + Math.cos(a) * r, p.y + 90 + sc, p.z + Math.sin(a) * r); wantTgt.set(p.x, p.y + 4, p.z); camera.up.set(0, 1, 0); }
  else { wantPos.set(p.x, p.y + 1500, p.z + 260); wantTgt.set(p.x, p.y, p.z - 80); camera.up.set(0, 1, 0); }
  // en vertical, 10° más de campo en seguimiento y a bordo: si no, el teléfono ve un pasillo de ~28° de ancho
  const fovW = (S.cam === 3 ? 74 : 58) + (camera.aspect < .75 && (S.cam === 0 || S.cam === 3) ? 10 : 0); if (camera.fov !== fovW) { camera.fov = fovW; camera.updateProjectionMatrix(); } hero.visible = ring.visible = S.cam !== 3;
  // seguimiento en el retorno en U del 21K (gwc): la cámara rodea la U con su ritmo propio (k ≤ 1 − e^(−8·dt)) en vez del latigazo de media vuelta
  const vw = S.running && !S.paused ? (S.v || 3) * sc : 0, gwc = S.cam === 0 && !camSnap ? A.giro(s) : 0, k0 = camSnap ? 1 : S.cam === 3 ? 1 - Math.exp(-dt * Math.max(9, vw * .8)) : 1 - Math.exp(-dt * (S.cam === 0 ? Math.max(3.2, vw * .6) : 2)),
    k = gwc > 0 ? lerp(k0, Math.min(k0, 1 - Math.exp(-dt * 8)), gwc) : k0; nearFade.value = S.cam === 0 ? 7.5 : 0; camSnap = false; camPos.lerp(wantPos, k); camTgt.lerp(wantTgt, k);
  const floor = Y(hT(camPos.x, camPos.z)) + (S.cam === 3 ? 1.2 : S.cam === 0 ? 1.6 : 3); if (camPos.y < floor) camPos.y = floor;
  camera.position.copy(camPos); camera.lookAt(camTgt);
  skyDome.position.set(camPos.x, 0, camPos.z); S.min = sky(S.dia ? 150 : S.running || $('end').style.display === 'flex' ? S.clock / 60 : 110);
  { const ax = p.x + p.tx * 45, az = p.z + p.tz * 45, sd = sunDir.y > .04 ? sunDir : MOON; sun.target.position.set(ax, p.y, az); sun.position.set(ax + sd.x * 700, p.y + sd.y * 700, az + sd.z * 700); }
  api.tick({ noche: NOCHE, t: now / 1000, dt }); frameHooks.forEach(f => f(NOCHE, now / 1000, dt, p));
  hiUpdate(p.x, p.z, now);
  if (S.running) updateHUD();
  if (precarga && ctx.baseLista) {   // precarga por distancia (ver abajo): este cuadro se dibuja sin descarte por encuadre
    precarga = 0; const fc = []; scene.traverse(o => { if (o.frustumCulled && o.visible && (o.isMesh || o.isSprite || o.isLine || o.isPoints)) { o.frustumCulled = false; fc.push(o); } }); dibuja(); for (const o of fc) o.frustumCulled = true;
  } else dibuja();
  fpsEma = fpsEma * .95 + (1 / Math.max(dt, .001)) * .05; if (S.verFps && (fpsTick = (fpsTick + 1) % 20) === 0) $('fps').textContent = Math.round(fpsEma) + ' fps · ' + (Q.media ? 'media' : Q.alta ? 'alta' + (Q.nivel ? ' (ajuste ' + Q.nivel + ')' : '') : 'ligera') + ' · ' + triEsc.toLocaleString('es') + ' tri';
  // ajuste automático: si el equipo no da 28 fps sostenidos, baja primero resolución, luego sombras, luego posproceso
  if (Q.alta && !Q.fija && !document.hidden && S.running && !S.paused) { perfT += dt; perfN++; if (perfN >= 90) { const fps = perfN / perfT; perfT = perfN = 0; Q.fps = fps;
    // por debajo de 40 fps se baja un escalón: 1) resolución 1,25  2) resolución 1,0  3) sombra de 1024  4) sin sombras  5) sin posproceso
    if (fps < 40 && ++perfBad >= 2 && (Q.nivel || 0) < 5) { perfBad = 0; Q.nivel = (Q.nivel || 0) + 1;
      if (Q.nivel === 1) { renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25)); resize(); } else if (Q.nivel === 2) { renderer.setPixelRatio(1); resize(); }
      else if (Q.nivel === 3) { sun.shadow.mapSize.set(1024, 1024); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } } else if (Q.nivel === 4) Q.sombras = false; else Q.post = false;
      console.info('calidad ajustada, nivel', Q.nivel, 'fps', fps.toFixed(0)); } else if (fps >= 40) perfBad = 0; } }
}
let perfT = 0, perfN = 0, perfBad = 0, fpsEma = 60, fpsTick = 0;
function dibuja() { if (Q.alta && Q.post !== false) composer.render(); else renderer.render(scene, camera); }
// Precarga por distancia: three sube a la GPU solo lo que entra en el encuadre, así que lo cargado (dentro de su radio) que quedaba a la espalda
// se subía más tarde, al girar, y la memoria dependía de hacia dónde se había mirado. Un cuadro tras el arranque y tras cada salto (> 400 m)
// se dibuja sin descarte por encuadre: lo de atrás queda recortado (la imagen es la misma), pero ya está en la GPU y lo residente lo decide la distancia.
let precarga = 1;
Object.assign(ctx, { S, hero, seek, start });
for (const m of fxMods) { try { m.install?.(ctx); } catch (e) { console.error('fx install', m.meta?.id, e); } }
window.__carga?.(1); $('load').style.display = 'none'; $('start').style.display = 'flex'; requestAnimationFrame(frame);
{ const q = new URLSearchParams(location.search); if (q.get('auto') !== null) ready.push(() => setTimeout(() => { start('tour'); S.scale = 10; S.dia = q.get('dia') !== '0'; S.cam = +(q.get('cam') || 0); seek(A.sOfKm(+q.get('auto'))); if (!S.dia && q.get('min')) S.clock = +q.get('min') * 60; if (q.get('hud') === '0') $('hud').style.display = 'none'; camSnap = true;   // corre 1,6 s para que la luz se asiente y luego vuelve clavado al km pedido
  setTimeout(() => { seek(A.sOfKm(+q.get('auto'))); S.paused = true; camSnap = true; setTimeout(() => { document.title = 'listo'; }, 6000); }, 1600); }, 300)); }
// P y gradeAt de __caf son los de la ruta activa (con 42K, las mismas funciones de referencia); Pref es siempre la ruta de referencia
window.__caf = { get fusion() { return FUSION; }, cuadro: frame, hT, Y, ctx, scene, camera, Q, renderer, S, seek, start, P: (s, o) => A.P(s, o), Pref: P, A, setDist, alDist, D, step, drink, menu, go, gradeAt: s => A.gradeAt(s), gradeSpeed, planAt, fmtT, fmtP }; // para depurar
// Producto (ui/): plan de carrera, fundido de carga, ayuda de primer uso y el modo «Correr la carrera». Si fallan, el juego sigue igual.
Promise.all(['plan', 'velo', 'ayuda', 'carrera'].map(id => import(`./ui/${id}.js${VQ}`))).then(([p, v, a, c]) => { const ui = window.__cafUI = {}; ui.plan = p.crearPlan(window.__caf); ui.velo = v.crearVelo(window.__caf, ui); ui.ayuda = a.crearAyuda(window.__caf); try { ui.carrera = c.crearModoCarrera(window.__caf, ui); } catch (e) { console.error('carrera', e); } }).catch(e => console.error('ui', e));
// Teléfono: «modo cine» del recorrido (ui/cine.js): píldora arriba, tramo en una línea, tira del perfil y hoja de controles. Si falla, queda el HUD de siempre.
import(`./ui/cine.js${VQ}`).then(m => { window.__cafCine = m.crearCine(window.__caf); }).catch(e => console.error('cine', e));
// ?choques=km0,km1 → corre la auditoría de fx/choques.js (cosas atravesadas en la calzada) y la imprime en la consola como «CHOQUES»
// Retomar tras perder el contexto gráfico: el script en línea de index.html guarda en sessionStorage (caf3d-rescate) el modo, el objetivo y el km,
// y recarga con ?retoma=1 en una calidad más baja. Aquí se arranca ese modo en ese km (la carrera, con su reloj, energía, hidratación y puestos).
{ let r = null; try { if (_q0.get('retoma')) r = JSON.parse(sessionStorage.getItem('caf3d-rescate') || 'null'); } catch (e) { }
  if (r && r.pend && r.est) ready.push(() => setTimeout(() => { try { const e = r.est; r.pend = false; try { sessionStorage.setItem('caf3d-rescate', JSON.stringify(r)); } catch (x) { }
    if (e.dist && e.dist !== A.id) setDist(e.dist); const race = e.modo === 'race'; if (e.target) S.target = e.target;
    if (race) { if (!window.__cafUI?.carrera?.retomar(e.carrera)) { start('tour'); seek(e.s || 0); } return; }   // la carrera retoma con su plan y su estado (ui/carrera.js)
    start('tour'); seek(e.s || 0); if (e.scale) setSpeed(e.scale);
    if (e.dia != null) { S.dia = e.dia; $('bLuz').textContent = S.dia ? '☀️ Pleno día' : '🌅 Hora real'; } if (e.cam != null && e.cam !== 4) { S.cam = e.cam; $('bCam').textContent = '🎥 ' + ['Seguimiento', 'Dron', 'Cenital', 'A bordo'][S.cam]; }
    window.__cafUI?.velo?.cubrirInicio(); toast('Seguimos en el km ' + A.kmOf(S.s).toFixed(1), r.motivo || 'El equipo se quedó sin memoria gráfica; se retomó en calidad ' + ({ media: 'Media', ligera: 'Ligera' }[Q.tier] || Q.tier) + '.', 6);
  } catch (x) { console.error('retoma', x); } }, 400)); }
// ?mem=1 → contador de memoria en pantalla; ?mem=km0,km1[,paso,cuadros,vueltas] → recorre la ruta y escribe una línea «MEMORIA» por km (fx/memoria.js, fx/memoria.sh)
{ const q = new URLSearchParams(location.search).get('mem'); if (q) import('./fx/memoria.js' + VQ).then(m => { window.__mem = m; if (q === '1') return m.contador(window.__caf);
  const [a, b, paso, cuadros, vueltas] = q.split(',').map(Number), espera = () => ctx.baseLista ? new Promise(r => setTimeout(r, 2500)) : new Promise(r => setTimeout(r, 300)).then(espera);
  return espera().then(() => m.recorrer(window.__caf, { km0: a || 0, km1: isNaN(b) ? A.KM - .005 : b, paso, cuadros, vueltas, log: f => console.info('MEMORIA ' + (f.vuelta ? 'v=' + f.vuelta + ' ' : '') + m.linea(f)) }))
    .then(r => { console.info('MEMORIA DESGLOSE ' + JSON.stringify(m.desglose(window.__caf))); console.info('MEMORIA FIN ' + Q.tier + ' max ' + JSON.stringify(r.max)); }); }).catch(e => console.error('mem', e)); }
{ const q = new URLSearchParams(location.search).get('rmedir'); if (q) hitosListos.then(() => setTimeout(() => import('./fx/rmedir.js' + VQ).then(m => m.default(window.__caf, q.split(',').map(Number))).catch(e => console.error('rmedir', e)), 3000)); }   // llamadas de dibujo y triángulos por km (fx/rmedir.js)
{ const q = new URLSearchParams(location.search).get('choques'); if (q) hitosListos.then(() => setTimeout(() => import('./fx/choques.js' + VQ).then(m => m.default(window.__caf, +q.split(',')[0], +q.split(',')[1])).then(r => console.info('CHOQUES ' + q + ' → ' + r.split('\n').join(' ¦ ') + ' ¦ FIN')).catch(e => console.error('choques', e)), 5000)); }
