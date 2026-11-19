// fx/calzada.js — la calle a la altura de los ojos.
// Asfalto procedural con demarcación analítica, brocales amarillos, aceras, separadores, calzada contraria,
// decalques (cebras, flechas, tapas, sumideros), mobiliario (postes, semáforos, pórticos, paradas, kioscos,
// bolardos, hidrantes) y carros/busetas estacionados. Todo sale de D.via (cada 50 m) y del mobiliario anotado
// fotograma a fotograma en build/investigacion/video/video_tramo{1,2,3}.json (tabla MOB más abajo).
//
// API para otros módulos (disponible al terminar install(), antes de ctx.ready):
//   ctx.calzada(s) → { izq, der, aceraIzq, aceraDer, sep, sepAncho, contraria: { ancho, lado } }
//     s en metros de ruta (fila más cercana, cada 5 m). izq/der: metros desde el eje de la ruta hasta la cara del
//     brocal de la acera a la izquierda/derecha del corredor (izq incluye separador y calzada contraria si la hay).
//     aceraIzq/aceraDer: ancho de acera (m). sep: tipo de separador de D.via ('' si no hay); sepAncho (m).
//     contraria.ancho: ancho de la calzada contraria (0 si no hay); contraria.lado: 'izq' | ''.
//     libreIzq/libreDer: metros que el pelotón puede abrirse a cada lado antes de pasar la mitad del camino a otra pasada (99 = sin otra).
//   ctx.distOtraPasada(x, z, s, y, m=10) → distancia (≤ m) del punto al eje de la ruta fuera de los 15 m alrededor de s.
//   ctx.calzadaLibre(x, z) → true si el punto del mundo NO cae sobre asfalto, separador ni brocal de ninguna pasada
//     de la ruta (rejilla de 2 m precalculada; conservadora: una celda tocada cuenta como ocupada). O(1).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const meta = { id: 'calzada', reemplaza: ['postes'] };

// Mobiliario del video: pares km×100, bits. Generado de video_tramo*.json (campo "mobiliario").
// 1 semáforo · 2 cebra · 4 flechas · 8 parada · 16 kiosco · 32 cartel verde · 64 bolardos · 128 carros der · 256 carros izq
// 512 buses parados · 1024 New Jersey · 2048 postes dobles · 4096 guardarriel · 8192 baranda negra · 16384 pórtico
const MOB = [0,0,15,0,41,0,62,0,83,10242,104,32,125,8192,146,518,167,512,188,2176,209,0,235,545,261,768,287,3,316,1,338,0,356,8193,379,10241,406,8192,433,64,460,8192,487,8200,519,8320,548,8704,577,0,612,513,641,1,664,544,693,0,720,0,747,0,779,544,811,0,844,97,876,128,908,0,940,512,972,128,1005,64,1033,1,1088,128,1129,64,1163,32,1197,0,1239,4,1273,0,1305,0,1328,0,1352,1,1380,1,1412,17,1417,1,1445,1,1473,0,1501,64,1533,8,1555,522,1576,2112,1608,65,1640,192,1672,0,1704,128,1735,2048,1762,0,1788,0,1828,576,1864,192,1900,2050,1936,0,1973,1,2008,0,2041,1,2074,0,2096,128,2130,1,2163,576,2196,3,2229,448,2262,41,2296,32,2328,3,2361,0,2393,3,2426,67,2458,2,2490,0,2521,576,2551,1,2581,32,2611,32,2640,0,2660,4096,2690,32,2724,2,2760,0,2796,6,2832,1,2868,0,2904,4096,2928,6144,2952,2048,2976,1,3000,16416,3023,6145,3046,4097,3070,0,3093,6144,3116,4097,3139,256,3162,65,3185,0,3209,1,3232,8193,3255,8712,3278,8192,3301,513,3326,8704,3350,0,3375,33,3400,0,3424,17,3449,523,3473,1024,3498,512,3523,512,3548,545,3573,541,3598,8209,3623,3,3649,8192,3674,16897,3699,8336,3719,16,3739,8704,3758,512,3778,3,3798,16401,3817,9,3837,513,3856,8194,3876,577,3896,4,3915,129,3935,129,3955,641,3974,81,3994,512,4015,19,4037,65,4059,512,4081,512,4103,512,4124,4,4142,8,4161,1024,4179,1056,4207,0];
// Bocacalles reales de OpenStreetMap (build/raw/calles.json): pares s(m de ruta), ±ancho(m); + = desemboca por la izquierda, − = por la derecha.
// Generado con un script Python (vía que atraviesa la banda de 16 m del eje en rumbo transversal; sin autopistas ni servicio).
const OSM = [316,8,336,-8,601,-8,835,13,836,-13,850,-8,850,13,1098,8,1102,-8,1297,8,1298,-8,1458,8,1460,-8,1590,13,1591,-13,1602,13,1604,-13,1713,8,1732,13,1903,-8,2038,-8,2169,8,2171,-8,2271,8,2272,-8,2408,8,2409,-8,2536,13,2538,-13,2546,13,2548,-13,2663,8,2790,-8,2880,-13,3026,13,3045,8,3240,-8,3312,8,3322,-8,3386,8,3597,-8,3751,-8,3791,8,3816,-8,4145,-8,4359,8,4365,-8,4538,-8,4575,8,4819,-8,4905,8,4961,-8,5093,-8,5264,-8,5270,11,5410,-8,5416,8,5471,8,5536,8,5537,-8,5722,-8,5766,-8,5843,-8,5904,11,6001,8,6030,-8,6223,7,6346,8,6348,-8,6462,-13,6482,13,6520,13,6864,-8,6923,-8,6975,-8,7040,-8,7101,-8,7127,-13,7212,-8,7270,13,7294,13,7748,8,7893,8,8128,8,8131,-8,8270,-13,8289,-11,8309,13,8427,-8,8534,8,8609,-8,8618,8,8720,8,8799,-8,8869,8,8980,8,9107,8,9126,-8,9324,8,9468,-8,9470,11,9557,8,9633,8,9710,8,9862,-8,9991,8,10142,8,10204,11,10221,-8,10260,-8,10366,-8,10394,8,10412,-8,10768,-8,10934,-8,11117,13,11171,-8,11214,8,11323,8,11357,-8,11552,8,11686,-8,11832,-8,12228,8,12556,8,12716,-8,12779,13,12795,13,12909,13,13408,8,13434,-11,13668,8,13686,-8,13769,8,13787,-8,13863,8,14017,8,14030,-8,14187,8,14242,-8,14390,8,14401,-8,14574,8,14631,-8,14660,8,14788,8,14802,-8,14875,8,14894,-8,15212,13,15353,-8,15364,13,15414,-11,15475,13,16297,-13,17329,-8,18611,-13,19230,13,19287,13,19430,-8,19480,-8,19764,8,19772,-8,19782,8,19940,-8,20108,-8,20141,-8,20736,8,20912,-8,20912,8,21048,8,21057,-8,21088,8,21136,-8,21227,-11,21261,13,21390,8,21408,-8,21492,8,21505,-8,21575,8,21582,-8,21714,8,21851,8,21855,-8,21918,8,21922,-8,22006,8,22007,-8,22109,-8,22109,8,22221,-8,22357,8,22383,-8,22404,-8,22436,8,22603,8,22614,-8,22715,8,22716,-8,22768,8,22787,-8,22801,-8,23036,11,23038,-11,23260,-8,23261,8,23377,8,23536,8,23655,8,23877,8,24139,-8,24140,8,24359,-11,24457,8,24458,-8,24524,8,24643,-11,24658,-11,24660,11,24714,7,24855,8,24855,-8,25045,8,25049,-8,25233,8,25237,-8,25426,8,25444,-8,25597,8,25597,-8,25806,-8,25812,8,25933,-11,25947,-11,25961,-11,25963,11,26148,-8,26160,8,26315,-8,26506,-8,26787,-7,27172,-8,27174,8,27411,8,27583,-11,27592,11,27664,-8,27664,8,27853,-8,27939,8,28157,8,29011,13,29012,-13,29020,13,29020,-13,29493,7,30335,-8,30494,8,30804,11,31568,11,31580,11,32216,11,32356,11,32807,8,33008,-7,33206,-8,33227,8,33308,-13,33479,-8,33649,8,33652,-8,33839,8,33922,-7,34042,-8,34228,8,34228,-8,34333,8,34476,-8,34636,-8,34858,8,35003,-8,35062,8,35246,13,35262,-13,35479,8,35556,-8,35704,8,35706,-8,35718,-8,35720,8,35872,8,36020,13,36034,-13,36047,-13,36861,-8,36906,-16,37010,-8,37121,-8,37203,-8,37311,8,37426,-8,37562,-13,37566,13,37645,-13,37652,13,37828,-11,37829,8,37837,-11,38005,-8,38010,8,38146,-8,38211,-8,38431,-8,38437,13,38623,13,38670,-8,38676,8,38721,8,38874,-8,38963,-8,39035,16,39052,16,39069,-16,39085,-8,39097,8,39207,-8,39260,8,39399,8,39416,-8,39616,-8,39618,11,39741,8,39813,-8,39970,13,39973,-13,40286,8,40365,-8,40439,8,40448,-8,40528,8,40535,-8,40615,-8,40689,-8,40732,8,40761,-8,40869,8,40882,-8,41028,8,41030,-8,41188,-8,41191,8,41302,-8,41377,-8,41379,8,41465,-13,41560,13,41671,13,41677,-13,41978,8,41988,-8,42237,-8,42281,-8,42393,-8,42508,8,42524,-8,42538,8,42546,-8,42555,8];
const F = { sem: 1, cebra: 2, flecha: 4, parada: 8, kiosco: 16, verde: 32, bol: 64, carD: 128, carI: 256, bus: 512, nj: 1024, dob: 2048, guard: 4096, reja: 8192, portico: 16384 };
// pavimento de losas de concreto (f_0135–f_0180: Los Ilustres y Los Próceres) y aceras de ladrillo/adoquín rosado
const LOSAS = [[14.4, 17.9]], LADRILLO = [[13.0, 13.35], [16.9, 18.0], [25.05, 25.25]];
const enRango = (km, R) => R.some(r => km >= r[0] && km <= r[1]);

const DS = 5, CH = 720, ROWS = CH / DS;     // filas cada 5 m, trozos de 720 m (múltiplo de 12 m de raya y 60 m de textura)
const K = 13;                                 // franjas por fila (perfil transversal de tipología fija)

function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash1 = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export function install(ctx) {
  const { scene, P, TOTAL, ROAD_W, Y, hT, D, Q } = ctx;
  const V = D.via, KMt = ctx.KM, sOfKm = ctx.sOfKm, kmOf = ctx.kmOf;
  const NR = Math.floor(TOTAL / DS) + 1;
  const mobK = [], mobF = []; for (let i = 0; i < MOB.length; i += 2) { mobK.push(MOB[i] / 100); mobF.push(MOB[i + 1]); }
  const mobAt = km => { let best = -1, bd = .17; for (let i = 0; i < mobK.length; i++) { const d = Math.abs(mobK[i] - km); if (d < bd) { bd = d; best = i; } } return best < 0 ? 0 : mobF[best]; };

  // ───────── 1. Perfil transversal por fila (cada 5 m) ─────────
  const A = () => new Float32Array(NR);
  const hwR = A(), hwL = A(), sw = A(), sH = A(), W2 = A(), cH = A(), awR = A(), awL = A(), fenH = A(), fenT = A(), sepG = A(), sepY = A(), dim = A(), slab = A(), brR = A(), brL = A(), gapR = A(), gapL = A(), gapM = A(), ylR = A(), ylL = A();
  const sepN = new Array(NR).fill(''), nL = new Uint8Array(NR), mode = new Uint8Array(NR), skip = new Uint8Array(NR), kind = new Uint8Array(NR), flags = new Uint32Array(NR);
  const o = {}, o2 = {};
  // Ida y vuelta por la misma avenida en calzadas distintas (la Río de Janeiro, Los Próceres): par[r] = distancia lateral con signo
  // (+ izquierda del corredor) a la otra pasada cuando corre paralela a 8–32 m; parQ[r] = su fila. La primera pasada dibuja la sección
  // completa con las dos calzadas y la segunda no se duplica (antes se encimaban dos avenidas y la acera de una caía en el carril de la otra).
  const par = new Float32Array(NR), parQ = new Int32Array(NR).fill(-1), hwLb = new Float32Array(NR), hwRb = new Float32Array(NR), W2b = new Float32Array(NR), enU = new Uint8Array(NR);
  { const cell = new Map(), C = 32, pt = new Float32Array(NR * 4); for (let r = 0; r < NR; r++) { P(r * DS, o); pt[r * 4] = o.x; pt[r * 4 + 1] = o.z; pt[r * 4 + 2] = o.tx; pt[r * 4 + 3] = o.tz; const k = Math.floor(o.x / C) + ',' + Math.floor(o.z / C); let l = cell.get(k); if (!l) cell.set(k, l = []); l.push(r); }
    for (let r = 0; r < NR; r++) { const x = pt[r * 4], z = pt[r * 4 + 1], tx = pt[r * 4 + 2], tz = pt[r * 4 + 3], cx = Math.floor(x / C), cz = Math.floor(z / C); let b = 32, bq = -1;
      for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) { const l = cell.get((cx + a) + ',' + (cz + c)); if (l) for (const q of l) { if (Math.abs(q - r) <= 6 || (Math.abs(q - r) <= 90 && tx * pt[q * 4 + 2] + tz * pt[q * 4 + 3] > -.8)) continue; const d =Math.hypot(pt[q * 4] - x, pt[q * 4 + 1] - z); if (d < b && Math.abs(tx * pt[q * 4 + 2] + tz * pt[q * 4 + 3]) > .8) { b = d; bq = q; } } }
      if (bq >= 0) { const lat = (pt[bq * 4] - x) * tz - (pt[bq * 4 + 1] - z) * tx; if (Math.abs(lat) >= 8) { par[r] = lat; parQ[r] = bq; } } }
    // Retorno en U (la ruta da media vuelta en ±15 m): las dos piernas se emparejan arriba aunque estén a menos de 90 filas (antes cada
    // pierna dibujaba su sección entera, con isla y calzada contraria, encima de la otra) y el vértice va como una losa sin separador.
    // enU = 1 si gira a la izquierda (el lado de afuera, que se ensancha, es el derecho), 2 si a la derecha
    for (let r = 3; r < NR - 3; r++) { const a = (r - 3) * 4, b = (r + 3) * 4; if (pt[a + 2] * pt[b + 2] + pt[a + 3] * pt[b + 3] < -.5) { const m = r * 4, u = pt[m + 2] * pt[a + 3] - pt[m + 3] * pt[a + 2] > 0 ? 1 : 2; for (let k = Math.max(0, r - 6); k <= Math.min(NR - 1, r + 6); k++) enU[k] = u; } } }
  const tipoAcera = (t, r) => t === 'parque' ? 2.6 : t === 'muro/terreno' ? 1.3 : t === 'barrio en ladera' ? 1.4 : t === 'galpón' ? 2.2 : Math.min(5.2, Math.max(1.7, r * .5));
  for (let r = 0; r < NR; r++) {
    const s = r * DS, km = kmOf(s), f = km / V.paso, b0 = Math.min(V.ancho.length - 1, Math.floor(f)), b1 = Math.min(V.ancho.length - 1, b0 + 1), t = f - b0, bn = t < .5 ? b0 : b1;
    const can = V.canales[bn] || 2, cal = V.calzadas[bn] || 1, sep = V.sep[bn] || 'ninguno';
    const ancho = Math.max(8, Math.min(40, (V.ancho[b0] || 14) * (1 - t) + (V.ancho[b1] || 14) * t));
    const fl = mobAt(km); flags[r] = fl; sepN[r] = (cal <= 1 || sep === 'ninguno') ? '' : sep;
    const tun = ctx.inTunnel(s), elev = ctx.enElevado(s), cub = ctx.cubierto(s);
    kind[r] = tun ? 1 : elev ? 2 : cub ? 3 : 0;
    dim[r] = tun ? 1 : cub ? .55 : 0; slab[r] = enRango(km, LOSAS) ? 1 : 0;
    brR[r] = enRango(km, LADRILLO) ? 1 : 0; brL[r] = brR[r];
    cH[r] = .16 + .03 * hash1(Math.floor(s / 220));
    ylR[r] = hash1(Math.floor(s / 160) + 7) < .86 ? 1 : 0; ylL[r] = hash1(Math.floor(s / 160) + 91) < .86 ? 1 : 0;
    const undiv = cal <= 1 || sep === 'ninguno';
    if (undiv) {
      const hw = Math.max(ancho / 2, ROAD_W / 2 + .3); hwR[r] = hwL[r] = hw;
      if (cal >= 2) { mode[r] = 2; nL[r] = can; } else if (can <= 2) { mode[r] = 2; nL[r] = 1; } else { mode[r] = 3; nL[r] = can; }
    } else {
      let w = .6, h = .2, fh = 0, ft = 0, g = 0, y = 1;
      if (sep === 'isla con grama') { w = 3.2; h = .18; g = 1; y = 0; }
      else if (sep === 'isla con árboles') { w = 5; h = .18; g = 1; y = 0; }
      else if (sep === 'baranda' || sep === 'isla con reja negra') { if (fl & F.guard) { w = 2.2; g = 1; y = 0; fh = .8; ft = 1; } else { w = .7; fh = 1.15; ft = 0; } }
      else if (sep === 'muro') { w = .55; h = .9; y = 1; }
      sw[r] = w; sH[r] = h; fenH[r] = fh; fenT[r] = ft; sepG[r] = g; sepY[r] = y;
      const W = Math.max((ancho - w) / 2, ROAD_W + .6); hwR[r] = hwL[r] = W / 2; W2[r] = Math.max(ancho - w - W, can * 3.1); mode[r] = 1; nL[r] = can;
    }
    hwLb[r] = hwL[r]; hwRb[r] = hwR[r]; W2b[r] = W2[r];   // sección propia, sin la otra pasada (ver el recorte tras el suavizado)
    if (par[r] < -8) {            // la otra pasada va por la calzada de la DERECHA: una sola losa que cubre las dos, sin calzada inventada a la izquierda
      hwL[r] = ROAD_W / 2 + .6; hwR[r] = -par[r] + ROAD_W / 2 + .6; sw[r] = sH[r] = W2[r] = fenH[r] = sepG[r] = 0; sepN[r] = ''; mode[r] = 3; nL[r] = Math.max(2, Math.round((hwL[r] + hwR[r]) / 3.4));
    } else if (par[r] > 8) {      // va por la IZQUIERDA: la calzada contraria del perfil es justo la de la otra pasada
      if (undiv) hwL[r] = par[r] + ROAD_W / 2 + .6;
      else { hwR[r] = hwL[r] = ROAD_W / 2 + .4; sw[r] = Math.max(.5, Math.min(sw[r], par[r] - ROAD_W - .8)); W2[r] = Math.max(ROAD_W / 2, par[r] + ROAD_W / 2 + .6 - hwL[r] - sw[r]); }
    }
    // retorno en U: la isla termina antes del giro y el giro va sin pintura (las rayas de las filas que rotan cruzaban la vía);
    // sin carros, cebras ni semáforos. Sin pareja (el vértice), losa propia con el lado de afuera más ancho y el de adentro abierto.
    if (enU[r]) { flags[r] = fl & ~(F.carD | F.carI | F.bus | F.sem | F.cebra | F.flecha); mode[r] = 0;
      if (par[r] > 8) W2[r] += sepN[r] ? sw[r] : 0; else if (!par[r]) { hwR[r] = ROAD_W / 2 + (enU[r] === 1 ? 3.5 : .6); hwL[r] = ROAD_W / 2 + (enU[r] === 2 ? 3.5 : .6); W2[r] = 0; if (enU[r] === 1) gapL[r] = 1; else gapR[r] = 1; }   // lado de adentro sin brocal ni acera: asfalto hasta la otra pierna
      sw[r] = sH[r] = fenH[r] = sepG[r] = sepY[r] = 0; sepN[r] = ''; }
    // carril de estacionamiento: el carro nunca entra en la franja de 13 m
    if (flags[r] & (F.carD | F.bus)) hwR[r] = Math.max(hwR[r], ROAD_W / 2 + ((flags[r] & F.bus) ? 2.95 : 2.45));
    if ((flags[r] & F.carI) && undiv && !enU[r]) hwL[r] = Math.max(hwL[r], ROAD_W / 2 + 2.45);
    if (!par[r]) { hwLb[r] = hwL[r]; hwRb[r] = hwR[r]; }   // con el carril de estacionamiento
    const bR = Math.round(km / V.paso), LR = Math.min(V.L.tipo.length - 1, bR);
    awR[r] = tipoAcera(V.R.tipo[LR], V.R.retiro[LR] || 6); awL[r] = tipoAcera(V.L.tipo[LR], V.L.retiro[LR] || 6);
  }
  const smooth = (a, rad, passes = 2) => { const t = new Float32Array(a.length); for (let p = 0; p < passes; p++) { let acc = 0, n = 0; for (let i = -rad; i <= rad; i++) if (i >= 0 && i < a.length) { acc += a[i]; n++; } for (let i = 0; i < a.length; i++) { t[i] = acc / n; const ad = i + rad + 1, rm = i - rad; if (ad < a.length) { acc += a[ad]; n++; } if (rm >= 0) { acc -= a[rm]; n--; } } a.set(t); } };
  [hwR, hwL, sw, sH, W2, awR, awL, sepG, sepY, hwLb, hwRb, W2b].forEach(a => smooth(a, 5)); smooth(fenH, 1, 1); smooth(dim, 2, 1);
  // Donde la ida y la vuelta se separan, el suavizado estiraba la losa ancha de las filas emparejadas a las vecinas sin pareja: esa losa
  // (a la cota de su pasada) tapaba la calzada de la otra, que ahí ya se dibuja sola y a su propia cota (roce del km 19,26). En las filas sin
  // pareja la sección no pasa de la propia; el ancho compartido se queda dentro del tramo emparejado.
  { let last = -1e9; const cerca = new Uint8Array(NR); for (let r = 0; r < NR; r++) { if (par[r]) last = r; if (r - last <= 12) cerca[r] = 1; } last = 1e9; for (let r = NR - 1; r >= 0; r--) { if (par[r]) last = r; if (last - r <= 12) cerca[r] = 1; }
    for (let r = 0; r < NR; r++) if (!par[r] && cerca[r]) { hwL[r] = Math.min(hwL[r], hwLb[r]); hwR[r] = Math.min(hwR[r], hwRb[r]); W2[r] = Math.min(W2[r], W2b[r]); } }
  for (let r = 0; r < NR; r++) {
    if (kind[r] === 1) { hwR[r] = hwL[r] = ROAD_W / 2 + .7; sw[r] = sH[r] = W2[r] = fenH[r] = 0; awR[r] = awL[r] = 0; cH[r] = 0; mode[r] = 1; nL[r] = 2; }
    else if (kind[r] === 2) { hwR[r] = hwL[r] = ROAD_W / 2 + .75; sw[r] = sH[r] = W2[r] = fenH[r] = 0; awR[r] = awL[r] = 0; cH[r] = .12; mode[r] = 1; nL[r] = 2; }
  }
  // Pasos repetidos por la misma calle: la segunda pasada no se duplica (la primera ya dibujó la calle)
  { const cell = new Map(), C = 12; for (let r = 0; r < NR; r++) { P(r * DS, o); const cx = Math.floor(o.x / C), cz = Math.floor(o.z / C); let dup = false;
      for (let a = -1; a <= 1 && !dup; a++) for (let b = -1; b <= 1 && !dup; b++) { const l = cell.get((cx + a) + ',' + (cz + b)); if (l) for (const q of l) if (r - q > 90) { P(q * DS, o2); if (Math.hypot(o.x - o2.x, o.z - o2.z) < 11) { dup = true; break; } } }
      if (parQ[r] >= 0 && parQ[r] < r) dup = true;   // segunda pasada por la otra calzada: ya la dibujó la primera
      skip[r] = dup ? 1 : 0; const k = cx + ',' + cz; if (!cell.has(k)) cell.set(k, []); const l = cell.get(k); if (l.length < 6) l.push(r); } }

  // Cruces: los del video (semáforo / cebra) y bocacalles en zona urbana
  const cruces = [];  // {s, sem, cebra, flecha}
  for (let i = 0; i < mobK.length; i++) { const fl = mobF[i]; if (!(fl & (F.sem | F.cebra))) continue; let s = sOfKm(mobK[i]); const r = Math.round(s / DS); if (r < 4 || r >= NR - 4 || kind[r] || skip[r]) continue; cruces.push({ s, sem: !!(fl & F.sem), cebra: true, flecha: !!(fl & F.flecha) }); }
  const markGap = (arr, s0, s1, v = 1) => { for (let r = Math.max(0, Math.ceil(s0 / DS)); r <= Math.min(NR - 1, Math.floor(s1 / DS)); r++) arr[r] = Math.max(arr[r], v); };
  { const osm = []; for (let i = 0; i < OSM.length; i += 2) osm.push([OSM[i], Math.sign(OSM[i + 1]), Math.abs(OSM[i + 1])]);
    for (const [sx, sd, w] of osm) { const r = Math.round(sx / DS); if (r < 0 || r >= NR || kind[r]) continue; markGap(sd > 0 ? gapL : gapR, sx - w / 2 - 2.5, sx + w / 2 + 2.5);
      const otro = osm.find(q => q[1] === -sd && Math.abs(q[0] - sx) < 10); if (otro && w >= 11 && sd > 0) markGap(gapM, sx - w / 2 - 1, sx + w / 2 + 1); }
    // cruces que el video no tiene (correcciones: sinCebra: [[km0, km1]])
    if (D.sinCebra) for (let i = cruces.length - 1; i >= 0; i--) { const k = kmOf(cruces[i].s); if (D.sinCebra.some(([a, b]) => k >= a && k <= b)) cruces.splice(i, 1); }
    for (const c of cruces) { let best = null; for (const q of osm) if (Math.abs(q[0] - c.s) < 150 && (!best || Math.abs(q[0] - c.s) < Math.abs(best[0] - c.s))) best = q; if (best) c.s = best[0]; }
    for (let i = 0; i < osm.length; i++) { const a = osm[i], b = osm.find(q => q[1] === -a[1] && Math.abs(q[0] - a[0]) < 10); if (a[1] > 0 && b && a[2] >= 13 && !cruces.some(c => Math.abs(c.s - a[0]) < 40)) cruces.push({ s: a[0], sem: false, cebra: true, flecha: false }); }
    for (let i = cruces.length - 1; i >= 0; i--) if (enU[Math.max(0, Math.min(NR - 1, Math.round(cruces[i].s / DS)))]) cruces.splice(i, 1);   // sin cebra ni semáforo dentro de un retorno en U
    for (const c of cruces) { markGap(gapR, c.s - 6, c.s + 6); markGap(gapL, c.s - 6, c.s + 6); markGap(gapM, c.s - 7, c.s + 7); } }
  for (let r = 0; r < NR; r++) if (kind[r]) { gapR[r] = gapL[r] = gapM[r] = 0; }

  for (let r = 0; r < NR; r++) if (kind[r] === 1 || kind[r] === 2) sepN[r] = '';
  // Aberturas para los tramos del 21K que el 42K no pisa (ctx.aberturas, en m de la ruta de referencia; las pone game.js): en el retorno
  // de Los Ilustres el separador se abre (asfalto corrido entre las dos calzadas, como el enlace real) y en las esquinas de Las Acacias el
  // lado por donde sigue el 21K queda sin brocal ni acera (bocacalle). Se ven en las dos distancias: son parte de la calle.
  const abre = new Uint8Array(NR);
  for (const a of ctx.aberturas || []) for (let r = Math.max(0, Math.ceil(a.s0 / DS)); r <= Math.min(NR - 1, Math.floor(a.s1 / DS)); r++) { abre[r] = 1;
    if (a.sep) { if (par[r] > 8) W2[r] += sepN[r] ? sw[r] : 0; sw[r] = sH[r] = fenH[r] = sepG[r] = sepY[r] = 0; sepN[r] = ''; gapM[r] = 1; flags[r] &= ~(F.carD | F.carI | F.bus | F.sem | F.cebra | F.flecha); }
    if (a.L) gapL[r] = 1; if (a.R) gapR[r] = 1; }
  // oscuridad real bajo techo de túnel (solo el tramo cubierto km1–km2, rampa de 25 m desde cada boca) y pintura vieja/nueva por calle
  const dark = A(), paint = A();
  for (let r = 0; r < NR; r++) { const s = r * DS; for (const t of D.tuneles || []) { const a = sOfKm(t.km1), b = sOfKm(t.km2); if (s > a && s < b) dark[r] = Math.max(dark[r], Math.min(1, (s - a) / 25, (b - s) / 25)); }
    const n = (D.calles[Math.min(D.calles.length - 1, Math.floor(s / (TOTAL / D.calles.length)))] || '');
    paint[r] = /Miranda/.test(n) ? .95 : /Páez/.test(n) ? .8 : /Higgins|Victoria/.test(n) ? .22 : .3 + .4 * hash1(Math.floor(s / 450) + 3); }
  smooth(paint, 6);
  // ── API pública: perfil por s y rejilla de ocupación
  // Isla central entre la ida y la vuelta cuando la vuelta va por la calzada de la derecha (el perfil solo sabe poner isla a la izquierda)
  { const T3 = ctx.THREE, vp = [], vi = [], gp = [], gi = []; let prev = false;
    for (let r = 0; r < NR; r++) { const w = -par[r] - ROAD_W - 1.4, ok = par[r] < -8 && parQ[r] > r && w >= .9 && !kind[r] && !skip[r] && !abre[r]; if (!ok) { prev = false; continue; }
      P(r * DS, o); const rx = -o.tz, rz = o.tx, c = -par[r] / 2, hw = Math.min(w, 5) / 2, a = c - hw, b = c + hw, y0 = o.y + .02, y1 = o.y + .2, k = vp.length / 3, g = gp.length / 3;
      vp.push(o.x + rx * a, y0, o.z + rz * a, o.x + rx * a, y1, o.z + rz * a, o.x + rx * (a + .22), y1, o.z + rz * (a + .22), o.x + rx * (b - .22), y1, o.z + rz * (b - .22), o.x + rx * b, y1, o.z + rz * b, o.x + rx * b, y0, o.z + rz * b);
      gp.push(o.x + rx * (a + .22), y1 + .01, o.z + rz * (a + .22), o.x + rx * (b - .22), y1 + .01, o.z + rz * (b - .22));
      if (prev) { for (const q of [0, 1, 3, 4]) vi.push(k - 6 + q, k + q, k - 6 + q + 1, k - 6 + q + 1, k + q, k + q + 1); gi.push(g - 2, g, g - 1, g - 1, g, g + 1); }
      prev = true; }
    if (vi.length) { const mk = (pp, ii, col) => { const ge = new T3.BufferGeometry(); ge.setAttribute('position', new T3.Float32BufferAttribute(pp, 3)); ge.setIndex(ii); ge.computeVertexNormals(); const m = new T3.Mesh(ge, new T3.MeshLambertMaterial({ color: col, side: T3.DoubleSide })); m.receiveShadow = true; scene.add(m); };
      mk(vp, vi, 0xd9b02c); mk(gp, gi, 0x6f8f43); } }
  // Otra pasada de la ruta cerca (retorno en U, ida y vuelta por la misma avenida, cruces): distancia en planta de (x, z) al eje de
  // la ruta, sin contar los 15 m de ruta alrededor de s ni lo que pase a más de 2,5 m de altura de y. Vale hasta m = 10.
  const OR = ctx.R, ON = ctx.N, OS = ctx.STEP, OC = 20, oh = new Map(), oo = {};
  for (let i = 0; i < ON - 1; i++) { const k = Math.floor(OR.x[i] / OC) + ',' + Math.floor(OR.z[i] / OC); let l = oh.get(k); if (!l) oh.set(k, l = []); l.push(i); }
  const distOtra = (x, z, s, y, m = 10) => { let b = m; const cx = Math.floor(x / OC), cz = Math.floor(z / OC);
    for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) { const l = oh.get((cx + a) + ',' + (cz + c)); if (l) for (const j of l) {
      if (Math.abs(j * OS - s) < 15 || Math.abs((j + 1) * OS - s) < 15) continue;
      const ax = OR.x[j], az = OR.z[j], ux = OR.x[j + 1] - ax, uz = OR.z[j + 1] - az, L2 = ux * ux + uz * uz || 1, t = Math.max(0, Math.min(1, ((x - ax) * ux + (z - az) * uz) / L2));
      const d = Math.hypot(ax + ux * t - x, az + uz * t - z); if (d >= b) continue; if (y !== undefined && Math.abs(P((j + t) * OS, oo).y - y) > 2.5) continue; b = d; } }
    return b; };
  ctx.distOtraPasada = distOtra;
  // holgura lateral de cada fila hasta la mitad del camino a otra pasada (la usa el pelotón de fx/gente.js para no cruzarse)
  const libL = new Float32Array(NR).fill(99), libR = new Float32Array(NR).fill(99);
  for (let r = 0; r < NR; r++) { const s = r * DS; P(s, o);
    for (const sd of [1, -1]) { let lib = 99; for (let d = 2; d <= 9; d++) { const x = o.x + o.tz * d * sd, z = o.z - o.tx * d * sd; if (distOtra(x, z, s, o.y) < d + 1) { lib = d - 1; break; } } if (sd > 0) libL[r] = lib; else libR[r] = lib; } }
  ctx.calzada = s => { const r = Math.max(0, Math.min(NR - 1, Math.round(s / DS))), c2 = W2[r] > .5 ? W2[r] : 0, sa = sepN[r] ? sw[r] : 0;
    return { izq: hwL[r] + sa + c2, der: hwR[r], aceraIzq: awL[r], aceraDer: awR[r], sep: sepN[r], sepAncho: sa, contraria: { ancho: c2, lado: c2 ? 'izq' : '' }, libreIzq: libL[r], libreDer: libR[r] }; };
  { const occ = new Set(), CS = 2, key = (x, z) => Math.floor(x / CS) * 131072 + Math.floor(z / CS);
    for (let r = 0; r < NR; r++) { if (skip[r]) continue; for (let h = 0; h < 2; h++) { P(r * DS + h * DS / 2, o); const lx = o.tz, lz = -o.tx, dR = -(hwR[r] + .25), dL = hwL[r] + sw[r] + W2[r] + .25;
        for (let d = dR; d <= dL + .01; d += 1.2) occ.add(key(o.x + lx * d, o.z + lz * d)); occ.add(key(o.x + lx * dL, o.z + lz * dL)); } }
    // conectores del 21K (fx/ruta21k.js dibuja su asfalto): tampoco se siembran árboles, gente ni mobiliario encima
    for (const c of ctx.conectores || []) { let L = 0; for (let i = 1; i < c.length; i++) L += Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]); const hw = L < 80 ? 5 : 8.5;
      for (let i = 1; i < c.length; i++) { const [ax, az] = c[i - 1], ux = c[i][0] - ax, uz = c[i][1] - az, l = Math.hypot(ux, uz) || 1, nx = -uz / l, nz = ux / l;
        for (let a = 0; a <= l; a += 1) for (let d = -hw; d <= hw; d += 1) occ.add(key(ax + ux * a / l + nx * d, az + uz * a / l + nz * d)); } }
    ctx.calzadaLibre = (x, z) => !occ.has(key(x, z)); }

  // ───────── 2. Texturas procedurales ─────────
  const tex = makeTextures(ctx);

  // ───────── 3. Materiales ─────────
  const lampU = { uLamps: { value: Array.from({ length: 16 }, () => new THREE.Vector4(0, -1e5, 0, 0)) }, uLampCol: { value: new THREE.Color(1, .72, .42) }, uNoche: { value: 0 } };
  const roadMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .92, metalness: 0, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -10, envMapIntensity: .28 });
  roadMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, lampU, { tAgg: { value: tex.agg }, tNrm: { value: tex.nrm }, tMac: { value: tex.mac } });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 aMat; attribute vec4 aLane; attribute vec4 aX; attribute vec4 aRC; attribute vec2 aY; varying vec2 vY;\nvarying vec4 vMat; varying vec4 vLane; varying vec4 vX; varying vec4 vRC; varying vec3 vWP; varying vec3 vNW;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvY = aY; vMat = aMat; vLane = aLane; vX = aX; vRC = aRC; vNW = normal;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + GLSL_COMMON + GLSL_ROAD)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + GLSL_ROAD_MAIN)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = czRough;')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal = normalize((viewMatrix * vec4(czNW, 0.0)).xyz);')
      .replace('#include <opaque_fragment>', GLSL_LAMPS + GLSL_TUNEL + '\n#include <opaque_fragment>');
  };
  const decalMat = new THREE.MeshStandardMaterial({ map: tex.atlas, alphaTest: .5, roughness: .78, metalness: 0, polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -16, envMapIntensity: .28 });
  const cellPatch = (extraFrag) => sh => {
    Object.assign(sh.uniforms, lampU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 aCell; varying vec3 vWP;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvMapUv = uv * aCell.zw + aCell.xy;\n#ifdef USE_EMISSIVEMAP\nvEmissiveMapUv = vMapUv;\n#endif')
      .replace('#include <project_vertex>', '#include <project_vertex>\n{ vec4 cw = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\ncw = instanceMatrix * cw;\n#endif\nvWP = (modelMatrix * cw).xyz; }');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nuniform vec4 uLamps[16]; uniform vec3 uLampCol; uniform float uNoche;')
      .replace('#include <opaque_fragment>', 'vec3 czNW = normalize((vec4(normal, 0.0) * viewMatrix).xyz);\n' + GLSL_LAMPS + (extraFrag || '') + '\n#include <opaque_fragment>');
  };
  decalMat.onBeforeCompile = cellPatch();
  const fenceMat = new THREE.MeshStandardMaterial({ map: tex.fence, alphaTest: .5, side: THREE.DoubleSide, roughness: .55, metalness: .35 });
  const furnMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .62, metalness: .15 });
  const vehMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .38, metalness: .25, envMapIntensity: .9 });
  vehMat.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aPaint;').replace('#include <color_vertex>', 'vColor = vec3(color);\n#ifdef USE_INSTANCING_COLOR\nvColor *= mix(vec3(1.0), instanceColor.rgb, aPaint);\n#endif'); };
  const signMat = new THREE.MeshStandardMaterial({ map: tex.signs, roughness: .5, metalness: 0, emissive: 0xffffff, emissiveMap: tex.signs, emissiveIntensity: .05 });
  signMat.onBeforeCompile = cellPatch();
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x9a9890, toneMapped: true });
  const sigMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // ───────── 4. Geometrías del mobiliario ─────────
  const G = makeGeoms(tex);
  const CAP = { lamp1: 500, lamp2: 300, head: 1100, sig: 120, sigL: 260, stop: 60, kiosk: 60, bol: 700, hyd: 80, sedan: 400, hatch: 260, suv: 220, pickup: 220, rustico: 140, buseta: 90, bus: 50, gpost: 40, gbeam: 20, panel: 20, decal: 4500 };
  const IM = {};
  const mkIM = (k, geo, mat, cast = true, color = false) => { const m = new THREE.InstancedMesh(geo, mat, CAP[k]); m.count = 0; m.castShadow = cast && Q.alta; m.receiveShadow = Q.alta; m.frustumCulled = false; if (color) m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CAP[k] * 3).fill(1), 3); IM[k] = m; scene.add(m); return m; };
  mkIM('lamp1', G.lamp1, furnMat); mkIM('lamp2', G.lamp2, furnMat); mkIM('head', G.head, glowMat, false);
  mkIM('sig', G.sig, furnMat); mkIM('sigL', G.sigL, sigMat, false, true);
  mkIM('stop', G.stop, furnMat); mkIM('kiosk', G.kiosk, furnMat, true, true); mkIM('bol', G.bol, furnMat); mkIM('hyd', G.hyd, furnMat);
  for (const t of ['sedan', 'hatch', 'suv', 'pickup', 'rustico']) mkIM(t, G[t], vehMat, true, true); mkIM('buseta', G.buseta, vehMat, true, true); mkIM('bus', G.bus, vehMat, true, true);
  mkIM('gpost', G.gpost, furnMat); mkIM('gbeam', G.gbeam, furnMat); mkIM('panel', G.panel, signMat, false);
  mkIM('decal', G.decal, decalMat, false);
  const cellAttr = (k) => { const a = new THREE.InstancedBufferAttribute(new Float32Array(CAP[k] * 4), 4); IM[k].geometry.setAttribute('aCell', a); return a; };
  const decalCell = cellAttr('decal'), panelCell = cellAttr('panel');
  // halos de los faroles (de noche)
  const haloGeo = new THREE.BufferGeometry(); haloGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CAP.head * 3), 3)); haloGeo.setDrawRange(0, 0);
  const haloMat = new THREE.PointsMaterial({ map: tex.halo, size: 2.4, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffd9a8, opacity: 0 });
  const halos = new THREE.Points(haloGeo, haloMat); halos.frustumCulled = false; scene.add(halos);

  // Señales verdes: textos de destino según las calles que vienen
  const nombreCalle = s => { const i = Math.max(0, Math.min(D.calles.length - 1, Math.floor(s / (TOTAL / D.calles.length)))); return D.calles[i] || ''; };
  const signs = [];
  for (let i = 0; i < mobK.length; i++) if (mobF[i] & (F.verde | F.portico)) { const s = sOfKm(mobK[i]) + 25, r = Math.round(s / DS); if (r >= NR || kind[r] || skip[r]) continue; const aqui = nombreCalle(s), dest = []; for (let q = s + 300; q < Math.min(TOTAL, s + 6000) && dest.length < 2; q += 100) { const n = nombreCalle(q); if (n && n !== aqui && !dest.includes(n) && !/^Calle\s|Distribuidor|Redoma/.test(n)) dest.push(n); } if (!dest.length) dest.push('Centro'); signs.push({ s, slot: signs.length % 16, dest }); }
  paintSigns(tex.signsCv, signs); tex.signs.needsUpdate = true;

  // Cruces a distinto nivel: donde otra pasada de la ruta corre por debajo (≥ 2,5 m más baja y a menos de 9 m del borde),
  // el faldón de esta calzada no baja hasta el suelo; si no, cerraría el paso inferior como una pared.
  const XR = ctx.R, XN = ctx.N, XS = ctx.STEP, XC = 25, xh = new Map(), xo = {};
  for (let i = 0; i < XN; i++) { const k = Math.floor(XR.x[i] / XC) + ',' + Math.floor(XR.z[i] / XC); let l = xh.get(k); if (!l) xh.set(k, l = []); l.push(i); }
  const pasaDebajo = (s, x, z, y, rad) => { const cx = Math.floor(x / XC), cz = Math.floor(z / XC);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const l = xh.get((cx + a) + ',' + (cz + b)); if (!l) continue;
      for (const j of l) { if (Math.abs(j * XS - s) < 150 || (XR.x[j] - x) ** 2 + (XR.z[j] - z) ** 2 > rad * rad) continue; P(j * XS, xo); if (xo.y < y - 2.5) return true; } }
    return false; };

  // ───────── 5. Construcción por trozos ─────────
  const chunks = new Map();   // ci → { mesh, fence, items }
  const lampPos = new Float32Array(CAP.head * 3); let nLamps = 0;

  function buildChunk(ci) {
    const r0 = ci * ROWS, r1 = Math.min(NR - 1, r0 + ROWS), nRow = r1 - r0 + 1; if (nRow < 2) return { mesh: null, fence: null, items: {} };
    const sBase = ci * CH, NV = nRow * K * 2;
    const pos = new Float32Array(NV * 3), nor = new Float32Array(NV * 3), aMat = new Float32Array(NV * 4), aLane = new Float32Array(NV * 4), aX = new Float32Array(NV * 4), aRC = new Float32Array(NV * 4), aY = new Float32Array(NV * 2);
    const prevX = new Float32Array(K * 2), prevZ = new Float32Array(K * 2); let havePrev = false;
    const fp = [], fu = [], fi = []; let fk = 0, fPrev = false;
    for (let j = 0; j < nRow; j++) {
      const r = r0 + j, s = r * DS; P(s, o); const lx = o.tz, lz = -o.tx, y0 = o.y - .015, v = s - sBase;
      const hR = hwR[r], hL = hwL[r], gR = gapR[r], gL = gapL[r], gM = gapM[r], dv = dim[r];
      const c = cH[r], cR = c * (1 - gR), cL = c * (1 - gL), w = sw[r], h = sH[r] * (1 - gM), w2 = W2[r], e = hL + w + w2;
      const aR = awR[r] + gR * 7, aL = awL[r] + gL * 7, Wt = hL + hR;
      const surfR = [gR, 0, 0, brR[r] * (1 - gR)], surfL = [gL, 0, 0, brL[r] * (1 - gL)];
      const yR = [0, ylR[r], 0, 0], yL = [0, ylL[r], 0, 0];
      const sepM = [gM, sepY[r] * (1 - gM), sepG[r] * (1 - gM), 0];
      const ln = [nL[r], mode[r]], slb = slab[r];
      const tR = hT(o.x - lx * (hR + aR + .3), o.z - lz * (hR + aR + .3)), tL = hT(o.x + lx * (e + aL + .3), o.z + lz * (e + aL + .3));
      let skR = Math.min(-.2, Y(tR) - .5 - o.y), skL = Math.min(-.2, Y(tL) - .5 - o.y);
      if ((skR < -2.5 || skL < -2.5) && pasaDebajo(s, o.x, o.z, o.y, Math.max(hR + aR, e + aL) + 9)) { skR = Math.max(skR, -1.2); skL = Math.max(skL, -1.2); }
      // franjas: [dA,hA,dB,hB, normal(0 arriba,1 izq,-1 der), mat, laneA(u,W,n,mode)|null, laneB]
      const S = [
        [hL, 0, -hR, 0, 0, [1, 0, 0, 0], [0, Wt, ln[0], ln[1]], [Wt, Wt, ln[0], ln[1]]],      // 0 nuestra calzada
        [-hR, 0, -hR, cR, 1, yR],                                                               // 1 cara del brocal der
        [-hR, cR, -hR - .2, cR, 0, yR],                                                         // 2 lomo del brocal der
        [-hR - .2, cR, -hR - .2 - aR, cR + .02, 0, surfR],                                      // 3 acera der
        [-hR - .2 - aR, cR + .02, -hR - .25 - aR, skR, -1, surfR],                              // 4 faldón der
        [hL, h, hL, 0, -1, sepM],                                                               // 5 cara del separador hacia nosotros
        [hL + w, h, hL, h, 0, sepM],                                                            // 6 lomo del separador
        [hL + w, 0, hL + w, h, 1, sepM],                                                        // 7 cara del separador hacia la contraria
        [e, 0, hL + w, 0, 0, [1, 0, 0, 0], [w2, w2, ln[0], w2 > 1 && ln[1] ? 1 : 0], [0, w2, ln[0], w2 > 1 && ln[1] ? 1 : 0]], // 8 calzada contraria (sin rayas si la fila no lleva: retorno en U)
        [e, cL, e, 0, -1, yL],                                                                  // 9 cara del brocal izq
        [e + .2, cL, e, cL, 0, yL],                                                             // 10 lomo del brocal izq
        [e + .2 + aL, cL + .02, e + .2, cL, 0, surfL],                                          // 11 acera izq
        [e + .25 + aL, skL, e + .2 + aL, cL + .02, 1, surfL],                                   // 12 faldón izq
      ];
      for (let k = 0; k < K; k++) {
        const st = S[k];
        for (let q = 0; q < 2; q++) {
          const d = q ? st[2] : st[0], hh = q ? st[3] : st[1], vi = (j * K + k) * 2 + q, slot = k * 2 + q;
          let x = o.x + lx * d, z = o.z + lz * d;
          if (havePrev) { const al = (x - prevX[slot]) * o.tx + (z - prevZ[slot]) * o.tz; if (al < .05) { x = prevX[slot]; z = prevZ[slot]; } }
          prevX[slot] = x; prevZ[slot] = z;
          pos[vi * 3] = x; pos[vi * 3 + 1] = y0 + hh; pos[vi * 3 + 2] = z;
          const nt = st[4]; nor[vi * 3] = nt ? lx * nt : 0; nor[vi * 3 + 1] = nt ? 0 : 1; nor[vi * 3 + 2] = nt ? lz * nt : 0;
          aMat.set(st[5], vi * 4);
          const la = st[6] ? (q ? st[7] : st[6]) : null; if (la) aLane.set(la, vi * 4); else aLane.set([0, 0, 0, 0], vi * 4);
          aX[vi * 4] = Math.max(0, hh); aX[vi * 4 + 1] = dv; aX[vi * 4 + 2] = (k === 0 || k === 8) ? slb : 0; aX[vi * 4 + 3] = nt ? 1 : 0;
          aY[vi * 2] = dark[r]; aY[vi * 2 + 1] = paint[r]; aRC[vi * 4] = d; aRC[vi * 4 + 1] = v; aRC[vi * 4 + 2] = o.tx; aRC[vi * 4 + 3] = o.tz;
        }
      }
      havePrev = true;
      // reja/guardarriel del separador
      const fh = fenH[r] * (1 - gM), fd = hL + w / 2, row = fenT[r] > .5 ? 0 : .5, xF = o.x + lx * fd, zF = o.z + lz * fd;
      fp.push(xF, y0 + h, zF, xF, y0 + h + Math.max(fh, .001), zF); fu.push(v / 2.5, row + .002, v / 2.5, row + .498);
      if (j && fPrev && fh > .05 && !skip[r] && !skip[r - 1]) { const a = (fk - 1) * 2; fi.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
      fPrev = fh > .05; fk++;
    }
    const idx = []; for (let j = 0; j < nRow - 1; j++) { const r = r0 + j; if (skip[r] || skip[r + 1]) continue; for (let k = 0; k < K; k++) { const a = (j * K + k) * 2, b = ((j + 1) * K + k) * 2; idx.push(a, a + 1, b, a + 1, b + 1, b); } }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('aMat', new THREE.BufferAttribute(aMat, 4)); g.setAttribute('aLane', new THREE.BufferAttribute(aLane, 4)); g.setAttribute('aX', new THREE.BufferAttribute(aX, 4)); g.setAttribute('aRC', new THREE.BufferAttribute(aRC, 4)); g.setAttribute('aY', new THREE.BufferAttribute(aY, 2));
    g.setIndex(idx); g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, roadMat); mesh.userData.mem = 'calzada'; mesh.receiveShadow = Q.alta; mesh.renderOrder = 2; scene.add(mesh);
    let fence = null; if (fi.length) { const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3)); fg.setAttribute('uv', new THREE.Float32BufferAttribute(fu, 2)); fg.setIndex(fi); fg.computeVertexNormals(); fg.computeBoundingSphere(); fence = new THREE.Mesh(fg, fenceMat); fence.userData.mem = 'calzada'; fence.castShadow = fence.receiveShadow = Q.alta; scene.add(fence); }
    return { mesh, fence, items: genItems(ci) };
  }

  // ───────── 6. Mobiliario, decalques y vehículos de un trozo ─────────
  function genItems(ci) {
    const R = mulberry(9001 + ci * 7919), it = {}; const push = (k, ...v) => (it[k] || (it[k] = [])).push(...v);
    const s0 = ci * CH, s1 = Math.min(TOTAL - 1, s0 + CH);
    const rowOf = s => Math.max(0, Math.min(NR - 1, Math.round(s / DS)));
    let atS = 0, atY = 0; const at = (s, d) => { P(s, o); atS = s; atY = o.y; return [o.x + o.tz * d, o.y - .015, o.z - o.tx * d, Math.atan2(o.tx, o.tz)]; };
    const ok = r => !skip[r] && !kind[r];
    // libre: ni quitado ni en la franja de 13 m de otra pasada de la ruta (la otra pierna de un retorno, la vuelta por la misma avenida)
    const libre = (x, z, m = ROAD_W / 2) => !(ctx.quitado && ctx.quitado(x, z)) && distOtra(x, z, atS, atY, m) >= m;
    const nearCruce = (s, m) => cruces.some(c => Math.abs(c.s - s) < m);
    const decal = (s, d, w, len, cell, yaw = 0, dy = 0) => { const [x, y, z, a] = at(s, d); push('decal', x, y + .004 + dy, z, a + yaw, w, 1, len, cell); };
    // postes de alumbrado
    for (let s = Math.ceil(s0 / 36) * 36; s < s1; s += 36) {
      const r = rowOf(s); if (skip[r] || kind[r] === 1 || kind[r] === 3) continue; const k = Math.round(s / 36);
      if (kind[r] === 2) { const sd = k % 2 ? 1 : -1, d = sd * (hwR[r] + .55); const [x, y, z, a] = at(s, d); push('lamp1', x, y, z, a + (sd > 0 ? Math.PI : 0), 1, 1, 1, 0); continue; }
      if (gapR[r] > .1 && gapL[r] > .1) continue;
      if (sw[r] > .45 && gapM[r] < .5) { const [x, y, z, a] = at(s, hwL[r] + sw[r] / 2); if (libre(x, z)) push('lamp2', x, y + sH[r], z, a, 1, 1, 1, 0); if (k % 2 === 0 && gapR[r] < .1) { const [x2, y2, z2, a2] = at(s + 18, -(hwR[r] + .55)); if (libre(x2, z2)) push('lamp1', x2, y2 + cH[r], z2, a2, 1, 1, 1, 0); } }
      else { const sd = (k % 2) ? 1 : -1, g = sd > 0 ? gapL[r] : gapR[r]; if (g > .1) continue; const d = sd > 0 ? hwL[r] + .55 : -(hwR[r] + .55); const [x, y, z, a] = at(s, d); if (libre(x, z)) push('lamp1', x, y + cH[r], z, a + (sd > 0 ? Math.PI : 0), 1, 1, 1, 0); }
    }
    // cruces: cebras, línea de pare, flechas, semáforos
    for (const c of cruces) {
      if (c.s < s0 || c.s >= s1) continue; const r = rowOf(c.s), hR = hwR[r], hL = hwL[r], e0 = hL + sw[r];
      for (const sc of c.sem ? [c.s - 9.5, c.s + 9.5] : [c.s - 9.5]) {
        for (let d = -hR + .5; d < hL - .3; d += 1.05) decal(sc, d, .52, 3.6, 0);
        if (W2[r] > 2) for (let d = e0 + .5; d < e0 + W2[r] - .3; d += 1.05) decal(sc, d, .52, 3.6, 0);
      }
      decal(c.s - 12.6, (hL - hR) / 2, hR + hL - .4, .42, 0);
      if (c.flecha || R() < .35) { const n = mode[r] === 2 ? 1 : nL[r], lw = Math.max(2.9, Math.min(3.5, (hR + hL) / Math.max(1, n))); for (let q = 0; q < n; q++) { const d = mode[r] === 2 ? -lw / 2 : hL - lw * (q + .5); decal(c.s - 24, d, 1.1, 5.2, q === n - 1 && n > 1 ? 2 : 1); } }
      if (c.sem) {
        { const [x, y, z, a] = at(c.s - 13, -(hR + .7)); if (libre(x, z)) { push('sig', x, y + cH[r], z, a, 1, 1, 1, 0); sigLights(x, y + cH[r], z, a, R); } }
        { const dL = (W2[r] > 2 ? e0 + W2[r] : hL) + .7; const [x, y, z, a] = at(c.s + 13, dL); if (libre(x, z)) { push('sig', x, y + cH[r], z, a + Math.PI, 1, 1, 1, 0); sigLights(x, y + cH[r], z, a + Math.PI, R); } }
      }
      const fl = flags[r];
      if (fl & F.bol) for (const sg of [-1, 1]) for (let q = 0; q < 6; q++) { const [x, y, z, a] = at(c.s + sg * (7.5 + q * 1.5), -(hR + .45)); push('bol', x, y + cH[r], z, a, 1, 1, 1, 0); }
    }
    function sigLights(x, y, z, a, R) { const lit = R() < .5 ? 0 : 2, col = lit ? 0x1fff8a : 0xff2a1a; for (const ax of [3.2, 6.0]) { const lx = ax * Math.cos(a), lz = -ax * Math.sin(a), yy = y + 5.35 + (lit ? -.33 : .33); const fx = -.19 * Math.sin(a), fz = -.19 * Math.cos(a); push('sigL', x + lx + fx, yy, z + lz + fz, a, 1, 1, 1, col); } }
    // tapas, sumideros
    for (let s = s0 + 20 + R() * 40; s < s1; s += 30 + R() * 55) { const r = rowOf(s); if (!ok(r)) continue; const Wt = hwR[r] + hwL[r], d = hwL[r] - (.15 + R() * .7) * Wt; decal(s, d, .78, .78, slab[r] ? 5 : 3, R() * 6); if (W2[r] > 3 && R() < .5) decal(s + 9, hwL[r] + sw[r] + R() * W2[r], .78, .78, 3, R() * 6); }
    for (let s = s0 + 15 + R() * 30; s < s1; s += 38 + R() * 40) { const r = rowOf(s); if (!ok(r) || gapR[r] > .1) continue; decal(s, -hwR[r] + .3, .46, .95, 4); }
    // hidrantes y kioscos y paradas
    for (let s = s0 + 60 + R() * 200; s < s1; s += 260 + R() * 220) { const r = rowOf(s); if (!ok(r) || gapR[r] > .1 || awR[r] < 1.5) continue; const [x, y, z, a] = at(s, -(hwR[r] + .55)); if (libre(x, z)) push('hyd', x, y + cH[r], z, a + R() * 3, 1, 1, 1, 0); }
    for (let i = 0; i < mobK.length; i++) { const sk = sOfKm(mobK[i]); if (sk < s0 || sk >= s1) continue; const fl = mobF[i];
      if (fl & F.parada) { for (let tries = 0; tries < 6; tries++) { const s = sk - 60 + R() * 120, r = rowOf(s); if (!ok(r) || gapR[r] > .05 || awR[r] < 2.2 || nearCruce(s, 18)) continue; const [x, y, z, a] = at(s, -(hwR[r] + .2 + Math.min(awR[r] - 1, 1.4))); if (libre(x, z)) push('stop', x, y + cH[r], z, a + Math.PI / 2, 1, 1, 1, 0); break; } }
      if (fl & F.kiosco) for (let q = 0; q < 2; q++) { const s = sk - 80 + R() * 160, r = rowOf(s), sd = R() < .7 ? -1 : 1; if (!ok(r) || (sd < 0 ? gapR[r] : gapL[r]) > .05) continue; const aw = sd < 0 ? awR[r] : awL[r]; if (aw < 2.4) continue; const d = sd < 0 ? -(hwR[r] + .2 + aw - .9) : (hwL[r] + sw[r] + W2[r] + .2 + aw - .9); const [x, y, z, a] = at(s, d); if (libre(x, z)) push('kiosk', x, y + cH[r], z, a + (sd < 0 ? Math.PI / 2 : -Math.PI / 2), 1, 1, 1, [0x4f7fae, 0x7d8a93, 0x2f6e8f, 0x3f7a55][Math.floor(R() * 4)]); }
      if (fl & F.bol) for (let q = 0; q < 8; q++) { const s = sk - 40 + q * 1.6, r = rowOf(s); if (!ok(r) || gapR[r] > .05) continue; const [x, y, z, a] = at(s, -(hwR[r] + .45)); push('bol', x, y + cH[r], z, a, 1, 1, 1, 0); }
    }
    // pórticos con señal verde
    for (const sg of signs) { if (sg.s < s0 || sg.s >= s1) continue; const r = rowOf(sg.s), dR = -(hwR[r] + .6), dLft = sw[r] > .45 ? hwL[r] + sw[r] / 2 : hwL[r] + .6, span = dLft - dR;
      const [x1, y1, z1, a] = at(sg.s, dR), [x2, y2, z2] = at(sg.s, dLft), yb = Math.max(y1, y2);
      push('gpost', x1, y1, z1, a, 1, 1, 1, 0); push('gpost', x2, y2 + (sw[r] > .45 ? sH[r] : cH[r]), z2, a, 1, 1, 1, 0);
      const [xm, , zm] = at(sg.s, (dR + dLft) / 2); push('gbeam', xm, yb + 7.0, zm, a, span, 1, 1, 0);
      const [xp, , zp] = at(sg.s - .45, dR + Math.min(span - 2.4, 5.5)); push('panel', xp, yb + 5.85, zp, a + Math.PI, 4.4, 2.2, 1, sg.slot);
      if (span > 13) { const [xq, , zq] = at(sg.s - .45, dR + 10.5); push('panel', xq, yb + 5.85, zq, a + Math.PI, 4.4, 2.2, 1, (sg.slot + 8) % 16); }
    }
    // carros y busetas estacionados (carril de estacionamiento, siempre fuera de la franja de 13 m)
    const parkSide = (sd) => { let s = s0 + R() * 8; while (s < s1) { const r = rowOf(s), fl = flags[r];
        const want = sd < 0 ? (fl & (F.carD | F.bus)) : (fl & F.carI), room = sd < 0 ? hwR[r] - ROAD_W / 2 : (W2[r] > 2 ? 99 : hwL[r] - ROAD_W / 2);
        if (!want || !ok(r) || room < 2.35 || (sd < 0 ? gapR[r] : gapL[r]) > .02 || nearCruce(s, 16)) { s += 4 + R() * 6; continue; }
        if (R() < .28) { s += 3 + R() * 9; continue; }
        const q = R(); let t, len, half; if ((fl & F.bus) && q < .3) { t = q < .09 ? 'bus' : 'buseta'; len = t === 'bus' ? 11 : 7.6; half = t === 'bus' ? 1.27 : 1.2; } else { const z = R(); [t, len, half] = z < .36 ? ['sedan', 4.6, .9] : z < .58 ? ['hatch', 4.0, .86] : z < .74 ? ['suv', 4.8, .95] : z < .9 ? ['pickup', 5.3, .93] : ['rustico', 4.4, .91]; }
        const sm = s + len / 2, rm = rowOf(sm + len / 2); if ((sd < 0 ? gapR[rm] : gapL[rm]) > .02 || skip[rm] || kind[rm]) { s += len; continue; }
        let d; if (sd < 0) d = -(hwR[r] - half - .22 - R() * .12); else d = W2[r] > 2 ? hwL[r] + sw[r] + W2[r] - half - .25 : hwL[r] - half - .22;
        if (Math.abs(d) - half < ROAD_W / 2 + .05) { s += 3; continue; }
        const [x, y, z, a] = at(sm, d); if (!libre(x, z, ROAD_W / 2 + half + .1)) { s += len; continue; }
        const flip = sd > 0 && W2[r] > 2 ? Math.PI : 0; const col = t !== 'bus' && t !== 'buseta' ? CARCOL[Math.floor(R() * CARCOL.length)] : BUSCOL[Math.floor(R() * BUSCOL.length)];
        push(t, x, y, z, a + flip + (R() - .5) * .035, 1, 1, 1, col); s += len + .7 + R() * 1.6; } };
    parkSide(-1); parkSide(1);
    return it;
  }
  const CARCOL = [...Array(6).fill(0xeeeeec), ...Array(4).fill(0xb9bdc1), 0x9da1a5, 0x6a6e73, 0x55595e, 0x1b1d20, 0x232528, 0x9e1b1b, 0xb3241e, 0x1e3a6e, 0x2f5597, 0xc9b48c, 0x2f4a36, 0x5a1e28];
  const BUSCOL = [0xc8262a, 0x1f5fa8, 0x2f8a4a, 0xe07a1e, 0x6a2f8a, 0x14a0a0];

  // ───────── 7. Rellenar instancias con los trozos activos ─────────
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), v3 = new THREE.Vector3(), sc3 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
  const HEAD = { lamp1: [[2.45, 9.32, 0]], lamp2: [[2.45, 9.32, 0], [-2.45, 9.32, 0]] };
  function refill() {
    const cnt = {}; for (const k in IM) cnt[k] = 0; nLamps = 0;
    for (const [, ch] of chunks) for (const k in ch.items) { const arr = ch.items[k], m = IM[k]; if (!m) continue;
      for (let i = 0; i < arr.length; i += 8) { const n = cnt[k]; if (n >= CAP[k]) break;
        q4.setFromAxisAngle(up, arr[i + 3]); v3.set(arr[i], arr[i + 1], arr[i + 2]); sc3.set(arr[i + 4], arr[i + 5], arr[i + 6]); m4.compose(v3, q4, sc3); m.setMatrixAt(n, m4);
        if (k === 'decal' || k === 'panel') { const c = (k === 'decal' ? CELLS : SLOTS)[arr[i + 7]]; (k === 'decal' ? decalCell : panelCell).setXYZW(n, c[0], c[1], c[2], c[3]); }
        else if (m.instanceColor) { col.setHex(arr[i + 7] || 0xffffff); m.setColorAt(n, col); }
        if (HEAD[k]) for (const h of HEAD[k]) { const hn = cnt.head; if (hn >= CAP.head) break; v3.set(h[0], h[1], h[2]).applyMatrix4(m4); m4.compose(v3, q4, sc3.set(1, 1, 1)); IM.head.setMatrixAt(hn, m4); lampPos[hn * 3] = v3.x; lampPos[hn * 3 + 1] = v3.y; lampPos[hn * 3 + 2] = v3.z; cnt.head++; q4.setFromAxisAngle(up, arr[i + 3]); v3.set(arr[i], arr[i + 1], arr[i + 2]); sc3.set(arr[i + 4], arr[i + 5], arr[i + 6]); m4.compose(v3, q4, sc3); }
        cnt[k]++; } }
    for (const k in IM) { const m = IM[k]; m.count = cnt[k] || 0; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }
    decalCell.needsUpdate = panelCell.needsUpdate = true; nLamps = cnt.head;
    haloGeo.attributes.position.array.set(lampPos.subarray(0, nLamps * 3)); haloGeo.attributes.position.needsUpdate = true; haloGeo.setDrawRange(0, nLamps);
  }
  const CELLS = tex.cells, SLOTS = tex.slots;

  // ───────── 8. Ajustes al motor ─────────
  ctx.ready.push(() => {
    started = true;
    scene.traverse(m => {
      // la cinta guía (renderOrder 4/5) debe ganarle en profundidad a nuestro asfalto, que va 1,5 cm por debajo
      if (m.isMesh && (m.renderOrder === 4 || m.renderOrder === 5) && m.material && !m.material.polygonOffset) { m.material.polygonOffset = true; m.material.polygonOffsetFactor = -10; m.material.polygonOffsetUnits = -24; }
      // la cinta guía y sus bordes (13 m de ancho, un par de vértices cada 10 m de ruta): en un giro más cerrado que su medio ancho (retorno en U)
      // el lado de adentro se doblaba hacia atrás y la raya azul hacía zigzag. Como en la calzada: el vértice que retrocede se queda en el anterior.
      if (m.isMesh && (m.renderOrder === 4 || m.renderOrder === 5) && m.geometry && m.geometry.attributes.position) { const pa = m.geometry.attributes.position, ns = pa.count / ctx.N;
        if (ns === 2 || ns === 4) { const tp = {}; for (let i = 1; i < ctx.N; i++) { P(i * ctx.STEP, tp); for (let k = 0; k < ns; k++) { const j = i * ns + k, jp = j - ns;
          if ((pa.getX(j) - pa.getX(jp)) * tp.tx + (pa.getZ(j) - pa.getZ(jp)) * tp.tz < .05) { pa.setX(j, pa.getX(jp)); pa.setZ(j, pa.getZ(jp)); } } } pa.needsUpdate = true; } }
      // receptor de sombras del motor: se hunde el centro (nuestro asfalto recibe sus propias sombras)
      if (m.isMesh && m.material && m.material.isShadowMaterial) { const p = m.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const k = i % 9; if (k >= 3 && k <= 5) p.setY(i, p.getY(i) - .7); } p.needsUpdate = true; }
    });
    // postes simples del motor: los sustituyen los nuestros (?postesMotor=1 los conserva)
    if (new URLSearchParams(location.search).get('postesMotor') !== '1') {
      const quitar = []; scene.children.forEach(m => { if (!m.isInstancedMesh) return; const p = m.geometry.parameters || {}; if ((m.geometry.type === 'CylinderGeometry' && p.height === 9 && p.radiusTop === .09) || (m.geometry.type === 'SphereGeometry' && p.radius === .42) || (m.geometry.type === 'PlaneGeometry' && p.width === 22 && m.material.blending === THREE.AdditiveBlending)) quitar.push(m); });
      quitar.forEach(m => scene.remove(m));
    }
  });
  let started = false;
  if (new URLSearchParams(location.search).get('czinfo')) setTimeout(() => { let tri = 0, dc = 0; const cnt = m => { const g = m.geometry, n = (g.index ? g.index.count : g.attributes.position.count) / 3; return m.isInstancedMesh ? n * m.count : n; }; scene.traverse(m => { if ((m.isMesh || m.isPoints) && (m.material === roadMat || m.material === fenceMat || Object.values(IM).includes(m))) { if (m.isInstancedMesh && !m.count) return; tri += cnt(m); dc++; } }); console.log('CZINFO tri=' + Math.round(tri) + ' dc=' + dc + ' chunks=' + chunks.size); }, 9000);

  // ───────── 9. Por cuadro ─────────
  let lastS = 0; const near = new Int32Array(16), nearD = new Float32Array(16);
  const findS = p => { if (ctx.S && ctx.S.running && ctx.A && ctx.A.id !== '42') return (lastS = ctx.S.sr);   // 21K: la s de referencia la da la ruta activa
    const N = ctx.N, R = ctx.R, st = ctx.STEP; let i0 = Math.round(lastS / st), best = -1, bd = 1e18; const loc = Math.hypot(R.x[Math.min(N - 1, i0)] - p.x, R.z[Math.min(N - 1, i0)] - p.z) < 60;
    const a = loc ? Math.max(0, i0 - 12) : 0, b = loc ? Math.min(N - 1, i0 + 12) : N - 1; for (let i = a; i <= b; i++) { const d = (R.x[i] - p.x) ** 2 + (R.z[i] - p.z) ** 2; if (d < bd) { bd = d; best = i; } } lastS = best * st; return lastS; };
  ctx.frameHooks.push((n, t, dt, p) => {
    (ctx.pend || (ctx.pend = {})).calzada = started ? 0 : 1;   // solo lectura (ctx.pendientes): trozos aún sin construir
    if (!started) return;
    const s = findS(p), c = Math.floor(s / CH), want = [];
    for (let k = -2; k <= 2; k++) { const ci = c + k; if (ci >= 0 && ci * CH < TOTAL) want.push(ci); }
    // ida y vuelta por la misma avenida: la losa la dibuja la otra pasada, así que sus trozos también tienen que estar cargados
    { const r0 = Math.round(s / DS); for (let d = -120; d <= 120; d += 20) { const q = parQ[Math.max(0, Math.min(NR - 1, r0 + d))]; if (q >= 0) for (let k = -1; k <= 1; k++) { const ci = Math.floor(q * DS / CH) + k; if (ci >= 0 && ci * CH < TOTAL && !want.includes(ci)) want.push(ci); } } }
    let changed = false;
    for (const [ci, ch] of chunks) if (!want.includes(ci)) { if (ch.mesh) { scene.remove(ch.mesh); ch.mesh.geometry.dispose(); } if (ch.fence) { scene.remove(ch.fence); ch.fence.geometry.dispose(); } chunks.delete(ci); changed = true; }
    const missing = want.filter(ci => !chunks.has(ci)).sort((a, b) => Math.abs(a - c) - Math.abs(b - c));
    const urgent = !chunks.has(c); let hechos = 0; for (const ci of missing) { chunks.set(ci, buildChunk(ci)); changed = true; hechos++; if (!urgent) break; }
    ctx.pend.calzada = missing.length - hechos;
    if (changed) refill();
    // noche: faroles, halos, semáforos y luz de los faroles sobre el asfalto
    const nn = n; lampU.uNoche.value = nn;
    glowMat.color.setRGB(.6 + 3.4 * nn, .58 + 2.6 * nn, .52 + 1.5 * nn);
    sigMat.color.setScalar(1.1 + 2.6 * nn); haloMat.opacity = .55 * nn; halos.visible = nn > .02;
    signMat.emissiveIntensity = .05 + .35 * nn;
    if (nn > .01) { near.fill(-1); nearD.fill(1e12); const cx = ctx.camera.position.x, cz = ctx.camera.position.z;
      for (let i = 0; i < nLamps; i++) { const d = (lampPos[i * 3] - cx) ** 2 + (lampPos[i * 3 + 2] - cz) ** 2; if (d < nearD[15]) { let j = 15; while (j > 0 && nearD[j - 1] > d) { nearD[j] = nearD[j - 1]; near[j] = near[j - 1]; j--; } nearD[j] = d; near[j] = i; } }
      const U = lampU.uLamps.value; for (let j = 0; j < 16; j++) { const i = near[j]; if (i < 0) U[j].set(0, -1e5, 0, 0); else U[j].set(lampPos[i * 3], lampPos[i * 3 + 1] - .2, lampPos[i * 3 + 2], 26); } }
  });
}

// ───────── GLSL ─────────
const GLSL_COMMON = `
uniform vec4 uLamps[16]; uniform vec3 uLampCol; uniform float uNoche;
float czH(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float czN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(czH(i), czH(i+vec2(1.,0.)), f.x), mix(czH(i+vec2(0.,1.)), czH(i+vec2(1.,1.)), f.x), f.y); }
`;
const GLSL_ROAD = `
uniform sampler2D tAgg; uniform sampler2D tNrm; uniform sampler2D tMac;
varying vec4 vMat; varying vec4 vLane; varying vec4 vX; varying vec4 vRC; varying vec3 vWP; varying vec3 vNW; varying vec2 vY;
float czLine(float x, float c, float w){ float fw = max(fwidth(x), 1e-4); return clamp((w*.5 - abs(x - c)) / fw + .5, 0., 1.) * clamp(1.5 - fw / w * .5, 0.35, 1.); }
float czDash(float v, float P, float L){ float fw = max(fwidth(v), 1e-4); float t = mod(v, P); float a = clamp(t / fw + .5, 0., 1.) * clamp((L - t) / fw + .5, 0., 1.); return mix(a, L / P, clamp(fw / P * 3. - .3, 0., 1.)); }
vec2 czMarks(vec4 Ln, float v){
  float u = Ln.x, W = Ln.y, n = max(Ln.z, 1.), md = Ln.w, wh = 0., ye = 0.;
  if (md < .5 || W < 1.) return vec2(0.);
  if (md < 1.5 || md > 2.5) {
    float lw = clamp(W / n, 2.9, 3.5), used = lw * n;
    if (md < 1.5) ye = czLine(u, .32, .12); else wh = czLine(u, .32, .12);
    for (int k = 1; k < 6; k++) { if (float(k) >= n) break; wh = max(wh, czLine(u, lw * float(k), .12) * czDash(v + float(k) * 3., 12., 4.)); }
    float er = (W - used > 1.3) ? used + .12 : W - .34; wh = max(wh, czLine(u, er, .13));
  } else {
    float c = W * .5, lw = clamp(c / n, 2.9, 3.6), used = lw * n;
    ye = max(czLine(u, c - .12, .1), czLine(u, c + .12, .1));
    for (int k = 1; k < 4; k++) { if (float(k) >= n) break; float dl = czDash(v, 12., 4.); wh = max(wh, czLine(u, c - lw * float(k), .12) * dl); wh = max(wh, czLine(u, c + lw * float(k), .12) * dl); }
    if (c - used > 1.3) { wh = max(wh, czLine(u, c - used - .1, .13)); wh = max(wh, czLine(u, c + used + .1, .13)); }
  }
  return vec2(wh, ye);
}
`;
const GLSL_ROAD_MAIN = `
vec3 czNW = normalize(vNW); float czRough = .92;
{
  vec2 rc = vRC.xy; float isTop = step(.5, czNW.y), hgt = vX.x;
  vec4 ag = texture2D(tAgg, rc / 3.6);
  vec2 wob = vec2(czN(rc * .45) - .5, czN(rc * .45 + 17.) - .5) * 1.6;
  vec4 mc = texture2D(tMac, (rc + wob) / 60.);
  vec4 mc2 = texture2D(tMac, rc.yx / vec2(60., 60.) + vec2(.37, .61));
  float mN = texture2D(tAgg, rc / 91.).r * .5 + czN(rc / 23.) * .5;
  float wA = vMat.x, yRaw = vMat.y, wG = vMat.z, wB = vMat.w;
  float wY = yRaw * (1. - smoothstep(.27, .31, hgt) * step(.5, vX.w)) * mix(1., step(hgt, .3), isTop);
  float wC = max(0., 1. - wA - wY - wG - wB);
  // ── asfalto
  float patchM = max(mc.b, mc2.b * .75), crack = max(mc.g, mc2.g * .7) * (1. - patchM * .7);
  float a = .222 * (.76 + .46 * ag.r) * (.84 + .32 * mN);
  a *= mix(1., .74 + .16 * ag.r, patchM);
  a *= 1. - .38 * mc.r * (1. - patchM);
  a *= 1. - .5 * max(mc.a, mc2.a * .6);
  a *= 1. - .4 * crack;
  float lwT = clamp((vLane.w > 1.5 && vLane.w < 2.5 ? vLane.y * .5 : vLane.y) / max(vLane.z, 1.), 2.9, 3.6);
  float uu = (vLane.w > 1.5 && vLane.w < 2.5) ? abs(vLane.x - vLane.y * .5) : vLane.x;
  float lp = mod(uu, lwT) - lwT * .5, drip = exp(-lp * lp / .045) * (.4 + .6 * czN(rc * vec2(1.3, .25))), wheel = exp(-pow(abs(lp) - .85, 2.) / .07);
  float onLane = step(.5, vLane.w);
  a *= 1. - onLane * (.16 * drip + .05 * wheel);
  float eg = min(vLane.x, vLane.y - vLane.x);
  a *= mix(1., mix(.72, 1., smoothstep(.0, .8, eg)), onLane);
  float lane = floor(uu / lwT), seg = floor(rc.y / 90.);
  a *= mix(1., .92 + .16 * czH(vec2(lane, floor(rc.y / 40.)) + 5.), onLane);
  float repav = onLane * step(czH(vec2(lane, seg) + 11.), .22); a *= 1. - .2 * repav;
  vec3 asph = vec3(a * 1.11, a * .99, a * .81);
  float dust = smoothstep(.35, .85, czN(rc / 9.) * .6 + czN(rc / 2.3) * .4) * .45 + (1. - smoothstep(.0, 1.3, eg)) * onLane * .55;
  asph = mix(asph, vec3(.30, .265, .215) * (.8 + .3 * ag.r), dust * (1. - repav) * .55);
  float rA = .93 - .08 * repav - .12 * wheel * onLane - .07 * patchM - .25 * max(mc.a, 0.);
  // ── losas de concreto (pavimento rígido)
  if (vX.z > .5) {
    float cs = czH(floor(vec2(uu / 3.6, rc.y / 4.5)) + 3.1);
    float jt = max(czLine(mod(rc.y + 2.25, 4.5), 2.25, .025), czLine(mod(uu + 1.8, 3.6), 1.8, .025));
    float cc = .27 * (.86 + .22 * cs) * (.84 + .3 * ag.r) * (1. - .3 * crack) * (1. - .25 * mc.r);
    asph = mix(vec3(cc, cc * .985, cc * .95), vec3(.05), jt * .7); rA = .9;
  }
  // ── demarcación (desgastada)
  vec2 mk = czMarks(vLane, rc.y);
  float wn = ag.b * .45 + texture2D(tAgg, rc / 17.).g * .55 + .1; float pf = vY.y;
  float wear = smoothstep(mix(.62, -.25, pf), mix(.95, .2, pf), wn) * (1. - .8 * vX.y) * mix(.55, 1., pf);
  wear *= mix(.45 + .55 * smoothstep(.25, .7, czN(rc * vec2(.7, .08))), 1., pf * pf);
  float pw = mk.x * wear, py = mk.y * wear;
  asph = mix(asph, vec3(.6, .6, .58) * (.85 + .15 * ag.r), pw);
  asph = mix(asph, vec3(.62, .40, .045) * (.85 + .15 * ag.r), py);
  rA = mix(rA, .66, max(pw, py));
  // ── concreto de aceras / brocales sin pintar
  vec2 sj = vec2(rc.x, rc.y);
  float tileH = czH(floor(sj / vec2(1.5, 1.8)) + 9.7);
  float cj = max(czLine(mod(sj.y + .9, 1.8), .9, .02), czLine(mod(sj.x + .75, 1.5), .75, .02)) * isTop;
  float cv = .27 * (.8 + .25 * tileH) * (.82 + .32 * ag.r) * (.85 + .3 * mN) * (1. - .3 * mc.r);
  vec3 conc = mix(vec3(cv, cv * .975, cv * .93), vec3(.06, .055, .05), cj * .65);
  // ── pintura amarilla del brocal (con mugre abajo y desconchones)
  float chip = smoothstep(.62, .78, czN(rc * 2.3 + hgt * 9.) * .7 + ag.g * .3);
  vec3 yel = vec3(.70, .45, .035) * (.78 + .26 * ag.r) * (.8 + .2 * mN);
  yel = mix(yel, yel * vec3(.55, .5, .45), (1. - smoothstep(.0, .06, hgt)) * vX.w);
  yel = mix(yel, vec3(cv * .9), chip * .8);
  // ── grama de isla (seca de verano caraqueño, con calvas de tierra)
  float gN = czN(rc * 1.7) * .5 + czN(rc * .35) * .5;
  vec3 grass = mix(vec3(.055, .085, .02), vec3(.11, .12, .035), gN) * (.75 + .5 * ag.r);
  grass = mix(grass, vec3(.13, .095, .06) * (.8 + .4 * ag.r), smoothstep(.62, .8, czN(rc * .5 + 7.)));
  // ── adoquín / ladrillo rosado
  float row = floor(rc.x / .11), bx = (rc.y + mod(row, 2.) * .11) / .22;
  float bh = czH(vec2(floor(bx), row));
  float mort = max(czLine(fract(bx), .0, .07) + czLine(fract(bx), 1., .07), czLine(fract(rc.x / .11), 0., .1) + czLine(fract(rc.x / .11), 1., .1));
  vec3 brk = vec3(.36, .13, .095) * (.75 + .4 * bh) * (.85 + .3 * ag.r);
  brk = mix(brk, vec3(.2, .19, .17), clamp(mort, 0., 1.) * .8 * clamp(1. - fwidth(bx) * 2., 0., 1.));
  vec3 alb = asph * wA + yel * wY + grass * wG + brk * wB + conc * wC;
  alb *= 1. - .45 * vX.y;
  diffuseColor.rgb = alb;
  czRough = rA * wA + .68 * wY + 1. * wG + .86 * wB + .9 * wC;
  // ── relieve: grano del agregado + grietas (finitas diferencias del mapa macro)
  vec2 nA = texture2D(tNrm, rc / 3.6).xy * 2. - 1.;
  float kk = (wA * 1.1 + wC * .55 + wB * .9 + wG * 1.6 + wY * .3) * (1. - .7 * max(pw, py));
  float c0 = mc.g, cx = texture2D(tMac, (rc + vec2(.07, 0.)) / 60.).g, cz = texture2D(tMac, (rc + vec2(0., .07)) / 60.).g;
  vec2 grad = nA * kk * .5 + vec2(cx - c0, cz - c0) * 2.2 * wA;
  vec3 T = vec3(vRC.z, 0., vRC.w), Lv = vec3(vRC.w, 0., -vRC.z);
  vec3 nTop = normalize(vec3(0., 1., 0.) - grad.x * Lv - grad.y * T);
  czNW = normalize(mix(czNW, nTop, isTop));
}
`;
const GLSL_TUNEL = `
if (vY.x > .001) { float pz = pow(max(0., cos(vRC.y / 9. * 6.2832)), 6.); float lat = .75 + .25 * exp(-vRC.x * vRC.x / 30.);
  outgoingLight = mix(outgoingLight, diffuseColor.rgb * vec3(1., .82, .58) * (1.1 + 2.6 * pz * lat), vY.x); }
`;
const GLSL_LAMPS = `
if (uNoche > .01) { vec3 acc = vec3(0.); for (int i = 0; i < 16; i++) { vec4 Lp = uLamps[i]; vec3 Ld = Lp.xyz - vWP; float d2 = dot(Ld, Ld); float att = Lp.w / (d2 + 10.) * pow(clamp(1. - d2 / 900., 0., 1.), 2.); acc += att * max(dot(czNW, Ld * inversesqrt(d2)), 0.); }
  outgoingLight += diffuseColor.rgb * uLampCol * acc * uNoche; }
`;

// ───────── Texturas ─────────
function makeTextures(ctx) {
  const R = mulberry(1234);
  // ruido de valor periódico
  const pn = (N, Pd, rnd) => { const g = new Float32Array(Pd * Pd).map(() => rnd()), out = new Float32Array(N * N); for (let y = 0; y < N; y++) { const fy = y / N * Pd, iy = Math.floor(fy), ty = fy - iy, sy = ty * ty * (3 - 2 * ty); for (let x = 0; x < N; x++) { const fx = x / N * Pd, ix = Math.floor(fx), tx = fx - ix, sx = tx * tx * (3 - 2 * tx), x0 = ix % Pd, x1 = (ix + 1) % Pd, y0 = iy % Pd, y1 = (iy + 1) % Pd; const a = g[y0 * Pd + x0], b = g[y0 * Pd + x1], c = g[y1 * Pd + x0], d = g[y1 * Pd + x1]; out[y * N + x] = (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy; } } return out; };
  const fbm = (N, periods, rnd) => { const out = new Float32Array(N * N); let wsum = 0; periods.forEach((Pd, i) => { const w = 1 / (i + 1); wsum += w; const n = pn(N, Pd, rnd); for (let k = 0; k < out.length; k++) out[k] += n[k] * w; }); for (let k = 0; k < out.length; k++) out[k] /= wsum; return out; };
  const dataTex = (data, N, srgb) => { const t = new THREE.DataTexture(data, N, N, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t; };
  // agregado (3,6 m)
  const NA = 512, base = fbm(NA, [16, 32, 64, 128, 256], R), base2 = fbm(NA, [8, 24, 48], R), alb = new Float32Array(NA * NA), hgt = new Float32Array(NA * NA);
  for (let k = 0; k < alb.length; k++) { alb[k] = .5 + (base[k] - .5) * .7; hgt[k] = base[k] * .35; }
  for (let i = 0; i < 9000; i++) { const cx = R() * NA, cy = R() * NA, rr = .8 + R() * R() * 3.2, br = R() < .55 ? .7 + R() * .3 : .05 + R() * .3, ar = .6 + R() * .8; const x0 = Math.floor(cx - rr - 1), x1 = Math.ceil(cx + rr + 1), y0 = Math.floor(cy - rr - 1), y1 = Math.ceil(cy + rr + 1);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const dx = (x - cx) / ar, dy = (y - cy) * ar, d = Math.hypot(dx, dy) / rr; if (d >= 1) continue; const k = ((y + NA) % NA) * NA + ((x + NA) % NA), w = Math.min(1, (1 - d) * 3); alb[k] = alb[k] * (1 - w * .8) + br * w * .8; hgt[k] += (1 - d * d) * .5 * w; } }
  const agg = new Uint8Array(NA * NA * 4), nrm = new Uint8Array(NA * NA * 4);
  for (let y = 0; y < NA; y++) for (let x = 0; x < NA; x++) { const k = y * NA + x, xl = y * NA + (x + NA - 1) % NA, xr = y * NA + (x + 1) % NA, yu = ((y + NA - 1) % NA) * NA + x, yd = ((y + 1) % NA) * NA + x;
    agg[k * 4] = Math.max(0, Math.min(255, alb[k] * 255)); agg[k * 4 + 1] = Math.min(255, hgt[k] * 200); agg[k * 4 + 2] = base2[k] * 255; agg[k * 4 + 3] = 255;
    const nx = (hgt[xl] - hgt[xr]) * 1.6, ny = (hgt[yu] - hgt[yd]) * 1.6; nrm[k * 4] = (.5 - nx * .5) * 255; nrm[k * 4 + 1] = (.5 - ny * .5) * 255; nrm[k * 4 + 2] = 255; nrm[k * 4 + 3] = 255; }
  // macro (60 m): R manchas · G grietas · B parches · A sellos de brea
  const NM = 1024, ch = () => { const c = document.createElement('canvas'); c.width = c.height = NM; const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, NM, NM); return [c, g]; };
  const wrap = (fn) => { for (const ox of [-NM, 0, NM]) for (const oy of [-NM, 0, NM]) fn(ox, oy); };
  const [cR, gR] = ch(), [cG, gG] = ch(), [cB, gB] = ch(), [cA, gA] = ch();
  for (let i = 0; i < 70; i++) { const x = R() * NM, y = R() * NM, rr = 4 + R() * 26, a = .15 + R() * .45; for (let j = 0; j < 5; j++) { const xx = x + (R() - .5) * rr, yy = y + (R() - .5) * rr * 2.5, r2 = rr * (.4 + R() * .6); wrap((ox, oy) => { const gr = gR.createRadialGradient(xx + ox, yy + oy, 0, xx + ox, yy + oy, r2); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); gR.fillStyle = gr; gR.fillRect(xx + ox - r2, yy + oy - r2, r2 * 2, r2 * 2); }); } }
  const walk = (g, x, y, ang, len, lw, a, turn, branch) => { g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = lw; g.lineCap = 'round'; const pts = [[x, y]]; for (let l = 0; l < len; l += 5) { ang += (R() - .5) * turn; x += Math.cos(ang) * 5; y += Math.sin(ang) * 5; pts.push([x, y]); if (branch && R() < .02) walk(g, x, y, ang + (R() < .5 ? 1 : -1) * (.8 + R()), len * .3, lw * .8, a * .9, turn, false); } wrap((ox, oy) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0] + ox, p[1] + oy) : g.moveTo(p[0] + ox, p[1] + oy)); g.stroke(); }); };
  for (let i = 0; i < 26; i++) { const lon = R() < .55, ang = lon ? Math.PI / 2 + (R() - .5) * .3 : (R() - .5) * .3; walk(gG, R() * NM, R() * NM, ang, 80 + R() * 380, .7 + R() * .4, .5 + R() * .4, .22, true); }
  for (let i = 0; i < 3; i++) { const cx = R() * NM, cy = R() * NM, rr = 20 + R() * 40; for (let j = 0; j < 45; j++) walk(gG, cx + (R() - .5) * rr * 2, cy + (R() - .5) * rr * 2, R() * 6.28, 8 + R() * 14, .7, .55, .9, false); }
  for (let i = 0; i < 14; i++) { const lon = R() < .6; walk(gA, R() * NM, R() * NM, lon ? Math.PI / 2 + (R() - .5) * .2 : (R() - .5) * .2, 120 + R() * 500, 1.4 + R() * 1.2, .45 + R() * .35, .12, false); }
  for (let i = 0; i < 16; i++) { const w = 20 + R() * 110, h = 15 + R() * 70, x = R() * NM, y = R() * NM, a = .55 + R() * .45; wrap((ox, oy) => { gB.fillStyle = `rgba(255,255,255,${a})`; gB.fillRect(x + ox, y + oy, w, h); gA.strokeStyle = 'rgba(255,255,255,.55)'; gA.lineWidth = 1.6; gA.strokeRect(x + ox, y + oy, w, h); }); }
  const read = c => c.getContext('2d').getImageData(0, 0, NM, NM).data, dR = read(cR), dG = read(cG), dB = read(cB), dA = read(cA), mac = new Uint8Array(NM * NM * 4);
  for (let k = 0; k < NM * NM; k++) { mac[k * 4] = dR[k * 4]; mac[k * 4 + 1] = dG[k * 4]; mac[k * 4 + 2] = dB[k * 4]; mac[k * 4 + 3] = dA[k * 4]; }
  // atlas de decalques (1024×512): 0 franja, 1 flecha recta, 2 flecha recta+derecha, 3 tapa redonda, 4 sumidero, 5 tapa de concreto
  const aw = 1024, ah = 512, ac = document.createElement('canvas'); ac.width = aw; ac.height = ah; const g = ac.getContext('2d', { willReadFrequently: true }); g.clearRect(0, 0, aw, ah);
  const erode = (x, y, w, h, amt) => { const id = g.getImageData(x, y, w, h), d = id.data; const nz = fbm(64, [4, 8, 16], R); for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) { const k = (yy * w + xx) * 4, n = nz[Math.floor(yy / h * 64) * 64 + Math.floor(xx / w * 64)] * .7 + R() * .3; if (n < amt) d[k + 3] = 0; } g.putImageData(id, x, y); };
  g.fillStyle = '#e9e9e4'; g.fillRect(6, 4, 116, 504); erode(0, 0, 128, 512, .3);
  const arrow = (x0, right) => { g.fillStyle = '#e9e9e4'; g.beginPath(); g.moveTo(x0 + 52, 10); g.lineTo(x0 + 76, 10); g.lineTo(x0 + 76, 330); g.lineTo(x0 + 112, 330); g.lineTo(x0 + 64, 502); g.lineTo(x0 + 16, 330); g.lineTo(x0 + 52, 330); g.fill();
    if (right) { g.beginPath(); g.moveTo(x0 + 76, 120); g.quadraticCurveTo(x0 + 108, 150, x0 + 108, 220); g.lineTo(x0 + 124, 220); g.lineTo(x0 + 98, 290); g.lineTo(x0 + 72, 220); g.lineTo(x0 + 88, 220); g.quadraticCurveTo(x0 + 88, 170, x0 + 76, 160); g.fill(); } erode(x0, 0, 128, 512, .27); };
  arrow(128, false); arrow(256, true);
  { const cx = 640, cy = 128, r = 120; g.fillStyle = '#3a3836'; g.beginPath(); g.arc(cx, cy, r, 0, 6.29); g.fill(); g.strokeStyle = '#5c5955'; g.lineWidth = 10; g.beginPath(); g.arc(cx, cy, r - 6, 0, 6.29); g.stroke(); g.lineWidth = 4; g.strokeStyle = '#4b4845'; for (let k = 1; k < 5; k++) { g.beginPath(); g.arc(cx, cy, k * 22, 0, 6.29); g.stroke(); } for (let k = 0; k < 12; k++) { g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(k * .52) * (r - 14), cy + Math.sin(k * .52) * (r - 14)); g.stroke(); } g.fillStyle = 'rgba(30,25,20,.35)'; g.beginPath(); g.arc(cx + 25, cy + 30, 60, 0, 6.29); g.fill(); }
  { const x = 768 + 8, y = 8, w = 240, h = 240; g.fillStyle = '#8f8b84'; g.fillRect(x, y, w, h); g.fillStyle = '#1d1c1b'; g.fillRect(x + 22, y + 22, w - 44, h - 44); g.fillStyle = '#4a4744'; for (let k = 0; k < 9; k++) g.fillRect(x + 26, y + 30 + k * 22, w - 52, 9); }
  { const cx = 640, cy = 384, r = 116; g.fillStyle = '#8c8880'; g.beginPath(); g.arc(cx, cy, r + 6, 0, 6.29); g.fill(); g.fillStyle = '#4a4744'; g.beginPath(); g.arc(cx, cy, r - 18, 0, 6.29); g.fill(); g.strokeStyle = '#5d5a55'; g.lineWidth = 5; for (let k = -4; k <= 4; k++) { g.beginPath(); g.moveTo(cx + k * 20, cy - 90); g.lineTo(cx + k * 20, cy + 90); g.stroke(); } }
  const atlas = new THREE.CanvasTexture(ac); atlas.colorSpace = THREE.SRGBColorSpace; atlas.anisotropy = 8;
  const cell = (x, y, w, h) => [x / aw, 1 - (y + h) / ah, w / aw, h / ah];
  const cells = [cell(0, 0, 128, 512), cell(128, 0, 128, 512), cell(256, 0, 128, 512), cell(512, 0, 256, 256), cell(768, 0, 256, 256), cell(512, 256, 256, 256)];
  // reja de barrotes (mitad superior) y guardarriel (mitad inferior), 2,5 m por tile
  const fc = document.createElement('canvas'); fc.width = 256; fc.height = 256; const f = fc.getContext('2d'); f.clearRect(0, 0, 256, 256);
  f.fillStyle = '#17191b'; for (let x = 4; x < 256; x += 12) f.fillRect(x, 6, 4, 120); f.fillRect(0, 8, 256, 6); f.fillRect(0, 100, 256, 6); f.fillRect(0, 6, 7, 122); f.fillStyle = '#c9a21c'; f.fillRect(0, 120, 256, 8);
  f.fillStyle = '#9fa4a6'; f.fillRect(0, 150, 256, 40); f.fillStyle = '#c2c6c7'; f.fillRect(0, 156, 256, 8); f.fillRect(0, 174, 256, 8); f.fillStyle = '#6b6f71'; f.fillRect(0, 188, 256, 3); f.fillStyle = '#52565a'; f.fillRect(120, 140, 14, 116);
  const fence = new THREE.CanvasTexture(fc); fence.colorSpace = THREE.SRGBColorSpace; fence.wrapS = THREE.RepeatWrapping; fence.anisotropy = 4;
  // atlas de señales verdes 4×4 (512×256 cada una)
  const signsCv = document.createElement('canvas'); signsCv.width = 2048; signsCv.height = 1024; const signs = new THREE.CanvasTexture(signsCv); signs.colorSpace = THREE.SRGBColorSpace; signs.anisotropy = 8;
  const slots = []; for (let i = 0; i < 16; i++) { const x = (i % 4) * 512, y = Math.floor(i / 4) * 256; slots.push([x / 2048, 1 - (y + 256) / 1024, 512 / 2048, 256 / 1024]); }
  const halo = ctx.canvasTex(64, 64, (g2, w, h) => { const gr = g2.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,240,210,1)'); gr.addColorStop(.18, 'rgba(255,200,130,.55)'); gr.addColorStop(1, 'rgba(255,170,90,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, w, h); });
  return { agg: dataTex(agg, NA), nrm: dataTex(nrm, NA), mac: dataTex(mac, NM), atlas, cells, fence, signs, signsCv, slots, halo };
}
function paintSigns(cv, signs) {
  const g = cv.getContext('2d'); g.fillStyle = '#1d6b43'; g.fillRect(0, 0, cv.width, cv.height);
  const ab = n => n.replace(/^Avenida /, 'Av. ').replace(/^Autopista /, 'Autop. ').replace(/^Calle /, 'C. ');
  for (const sg of signs) { const x = (sg.slot % 4) * 512, y = Math.floor(sg.slot / 4) * 256; g.fillStyle = '#0f6a3c'; g.fillRect(x, y, 512, 256); g.strokeStyle = '#eef2ee'; g.lineWidth = 7; g.beginPath(); g.roundRect(x + 12, y + 12, 488, 232, 18); g.stroke();
    g.fillStyle = '#f4f6f2'; g.textBaseline = 'middle';
    sg.dest.slice(0, 2).forEach((d, i) => { const yy = y + (sg.dest.length > 1 ? 82 + i * 96 : 128); let fs = 54; g.font = `600 ${fs}px "Helvetica Neue",Arial,sans-serif`; const t = ab(d); while (g.measureText(t).width > 360 && fs > 30) { fs -= 3; g.font = `600 ${fs}px "Helvetica Neue",Arial,sans-serif`; } g.textAlign = 'left'; g.fillText(t, x + 44, yy);
      g.save(); g.translate(x + 452, yy); if (i) g.rotate(Math.PI / 2 * .999 * 0 + Math.PI / 4); g.beginPath(); g.moveTo(0, -30); g.lineTo(22, 0); g.lineTo(8, 0); g.lineTo(8, 30); g.lineTo(-8, 30); g.lineTo(-8, 0); g.lineTo(-22, 0); g.closePath(); g.fill(); g.restore(); }); }
}

// ───────── Geometrías ─────────
function makeGeoms() {
  const C = (geo, hex, paint = 0) => { const g = geo.index ? geo.toNonIndexed() : geo; const n = g.attributes.position.count, c = new THREE.Color(hex), ca = new Float32Array(n * 3), pa = new Float32Array(n); for (let i = 0; i < n; i++) { ca[i * 3] = c.r; ca[i * 3 + 1] = c.g; ca[i * 3 + 2] = c.b; pa[i] = paint; } g.setAttribute('color', new THREE.BufferAttribute(ca, 3)); g.setAttribute('aPaint', new THREE.BufferAttribute(pa, 1)); if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2)); return g; };
  const M = parts => mergeGeometries(parts, false);
  const box = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
  const cyl = (rt, rb, h, x, y, z, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y, z);
  const GALV = 0x8e9398, YEL = 0xe0ac16;
  const arm = (sx) => { const cv = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 8.3, 0), new THREE.Vector3(sx * .25, 9.75, 0), new THREE.Vector3(sx * 2.25, 9.5, 0)); return new THREE.TubeGeometry(cv, 10, .055, 6); };
  const headG = (sx) => { const g = new THREE.BoxGeometry(.8, .17, .34); g.translate(sx * 2.5, 9.44, 0); return g; };
  const lamp1 = M([C(cyl(.07, .13, 9, 0, 4.5, 0), GALV), C(cyl(.17, .19, .5, 0, .25, 0), 0x777b7f), C(arm(1), GALV), C(headG(1), 0x6f7377)]);
  const lamp2 = M([C(cyl(.09, .15, 9.4, 0, 4.7, 0), GALV), C(cyl(.2, .22, .6, 0, .3, 0), 0x777b7f), C(arm(1), GALV), C(arm(-1), GALV), C(headG(1), 0x6f7377), C(headG(-1), 0x6f7377)]);
  const head = new THREE.BoxGeometry(.62, .05, .26);
  // semáforo de brazo (poste amarillo, brazo sobre la vía, dos cabezas)
  const sigParts = [C(cyl(.12, .16, 6.2, 0, 3.1, 0), YEL), C(new THREE.CylinderGeometry(.075, .075, 6.6, 6).rotateZ(Math.PI / 2).translate(3.3, 5.95, 0), YEL)];
  for (const ax of [3.2, 6.0]) sigParts.push(C(box(.38, 1.08, .3, ax, 5.35, 0), 0x18191b), C(box(.66, 1.36, .03, ax, 5.35, .17), 0x111213), C(cyl(.02, .02, .55, ax, 5.85, 0), 0x18191b));
  sigParts.push(C(box(.3, .7, .25, 0, 2.8, -.2), 0x18191b));
  const sig = M(sigParts), sigL = new THREE.SphereGeometry(.1, 8, 6);
  // parada de autobús techada (azul)
  const stop = M([C(box(4, .09, 1.7, 0, 2.5, -.1), 0x2d5fa8), C(box(4.05, .2, .06, 0, 2.42, .74), 0x244f8f), ...[-1.9, 1.9].flatMap(x => [C(cyl(.05, .05, 2.45, x, 1.22, -.75), 0x50565c), C(cyl(.05, .05, 2.45, x, 1.22, .55), 0x50565c)]), C(box(3.8, 1.75, .04, 0, 1.3, -.78), 0x9fb6c3), C(box(.08, 1.8, 1.2, 1.96, 1.2, -.15), 0xd9d9d6), C(box(.06, 1.6, 1.0, 2.0, 1.25, -.15), 0xc0392b), C(box(2.2, .06, .38, -.3, .48, -.55), 0x6c7177), C(box(2.2, .3, .04, -.3, .7, -.74), 0x6c7177)]);
  const kiosk = M([C(box(1.9, 2.15, 1.35, 0, 1.08, 0), 0xffffff), C(box(2.3, .1, 1.8, 0, 2.2, .1), 0xdcdcda), C(box(1.7, .9, .03, 0, 1.55, .69), 0x2a2c2e), C(box(1.9, .12, .3, 0, 1.0, .8), 0xbdbdb8), C(box(1.9, .25, 1.35, 0, .13, 0), 0x55595c)]);
  const bol = M([C(cyl(.1, .12, .85, 0, .42, 0, 10), YEL), C(cyl(.103, .103, .1, 0, .7, 0, 10), 0x1a1a1a), C(new THREE.SphereGeometry(.1, 10, 5, 0, 6.29, 0, 1.6).translate(0, .85, 0), YEL)]);
  const hyd = M([C(cyl(.11, .13, .6, 0, .3, 0, 10), 0xd9b21d), C(new THREE.SphereGeometry(.12, 10, 6, 0, 6.29, 0, 1.6).translate(0, .6, 0), 0xc42a1c), C(cyl(.05, .05, .36, 0, .42, 0, 8).rotateZ(Math.PI / 2), 0xd9b21d), C(cyl(.17, .17, .05, 0, .03, 0, 10), 0x7a7a74)]);
  const gpost = C(cyl(.2, .24, 7.4, 0, 3.7, 0, 10), GALV), gbeam = M([C(box(1, .55, .55, 0, 0, 0), GALV), C(box(1, .08, .9, 0, -.32, 0), 0x6f7377)]);
  const panel = new THREE.PlaneGeometry(1, 1);
  // vehículos: se arman en el plano del perfil (x largo, y alto, z ancho) y se giran al final (frente hacia +z)
  const ext = (pts, depth, bev = .035) => new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(q => new THREE.Vector2(q[0], q[1]))), { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 4 }).translate(0, 0, -depth / 2);
  const cen = pts => pts.reduce((a, q) => [a[0] + q[0] / pts.length, a[1] + q[1] / pts.length], [0, 0]);
  const pane = (p0, p1, w, c) => { const dx = p1[0] - p0[0], dy = p1[1] - p0[1], l = Math.hypot(dx, dy); let nx = -dy / l, ny = dx / l; const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2; if ((mx - c[0]) * nx + (my - c[1]) * ny < 0) { nx = -nx; ny = -ny; } return new THREE.BoxGeometry(l * .9, .02, w).rotateZ(Math.atan2(dy, dx)).translate(mx + nx * .045, my + ny * .045, 0); };
  const GL = 0x0b0f13, CH = 0x1c1d1f, RIM = 0xb4b8bc;
  const veh = ({ L, W, low, cab, r, ax, hl, extra = [] }) => {
    const Wc = W - .22, c = cen(cab), p = [C(ext(low, W - .08), 0xffffff, 1), C(ext(cab, Wc), 0xffffff, 1)];
    const side = cab.map(q => [c[0] + (q[0] - c[0]) * .8, c[1] + (q[1] - c[1]) * .68 + .03]);
    for (const sd of [-1, 1]) p.push(C(ext(side, .02, .005).translate(0, 0, sd * (Wc / 2 + .045)), GL));
    p.push(C(pane(cab[cab.length - 1], cab[cab.length - 2], Wc - .14, c), GL), C(pane(cab[0], cab[1], Wc - .14, c), GL));
    for (const x of ax) for (const sd of [-1, 1]) { p.push(C(new THREE.CylinderGeometry(r, r, .24, 16).rotateX(Math.PI / 2).translate(x, r, sd * (W / 2 - .14)), 0x101010)); p.push(C(new THREE.CylinderGeometry(r * .6, r * .6, .25, 12).rotateX(Math.PI / 2).translate(x, r, sd * (W / 2 - .135)), RIM)); p.push(C(new THREE.CylinderGeometry(r + .05, r + .05, .2, 12, 1, true, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2).translate(x, r, sd * (W / 2 - .1)), CH)); }
    const xf = low.reduce((m, q) => Math.max(m, q[0]), 0);
    for (const sd of [-1, 1]) { p.push(C(box(.06, .13, .3, xf + .02, hl, sd * (W / 2 - .28)), 0xf1f3f4), C(box(.06, .14, .3, -.02, hl + .05, sd * (W / 2 - .25)), 0xb3140f), C(box(.18, .1, .07, cab[cab.length - 1][0] - .15, cab[cab.length - 1][1] + .06, sd * (W / 2 + .03)), 0xffffff, 1)); }
    p.push(C(box(.12, .22, W - .02, xf, .42, 0), CH), C(box(.12, .22, W - .02, 0, .42, 0), CH), C(box(.04, .16, W * .45, xf + .03, hl - .02, 0), 0x151617), C(box(.03, .12, .34, -.04, .62, 0), 0xe8e8e2), C(box(xf - 1.2, .14, W - .3, xf / 2, .22, 0), 0x121212));
    for (const e of extra) p.push(e);
    return M(p).translate(-xf / 2, 0, 0).rotateY(-Math.PI / 2); };
  const sedan = veh({ L: 4.55, W: 1.76, r: .31, ax: [.95, 3.6], hl: .74, low: [[0, .33], [0, .8], [.18, .93], [1.0, .97], [3.4, .97], [4.3, .83], [4.55, .68], [4.55, .33]], cab: [[.95, .95], [1.6, 1.43], [2.8, 1.45], [3.45, .95]] });
  const hatch = veh({ L: 3.95, W: 1.68, r: .3, ax: [.7, 3.15], hl: .78, low: [[0, .35], [0, .97], [3.0, .98], [3.75, .83], [3.95, .68], [3.95, .35]], cab: [[.06, .97], [.28, 1.48], [2.3, 1.5], [3.0, .97]] });
  const suv = veh({ L: 4.75, W: 1.86, r: .37, ax: [1.0, 3.8], hl: .9, low: [[0, .45], [0, 1.06], [.1, 1.1], [3.9, 1.1], [4.6, .99], [4.75, .84], [4.75, .45]], cab: [[.1, 1.08], [.22, 1.79], [3.15, 1.81], [3.85, 1.1]] });
  const pickup = veh({ L: 5.25, W: 1.82, r: .36, ax: [1.1, 4.15], hl: .88, low: [[0, .5], [0, 1.03], [5.05, 1.02], [5.25, .86], [5.25, .5]], cab: [[2.15, 1.02], [2.2, 1.74], [3.45, 1.76], [4.15, 1.03]], extra: [C(box(1.95, .03, 1.5, 1.05, 1.06, 0), 0x2b2c2d)] });
  const rustico = veh({ L: 4.3, W: 1.78, r: .4, ax: [.85, 3.45], hl: .98, low: [[0, .55], [0, 1.12], [4.25, 1.12], [4.3, .55]], cab: [[.05, 1.1], [.06, 1.95], [2.75, 1.95], [2.95, 1.12]], extra: [C(new THREE.CylinderGeometry(.38, .38, .25, 14).rotateZ(Math.PI / 2).translate(-.13, 1.05, 0), 0x101010)] });
  const wheels = (L, W, r, xs) => xs.flatMap(z => [-1, 1].flatMap(sd => [C(new THREE.CylinderGeometry(r, r, .24, 16).rotateZ(Math.PI / 2).translate(sd * (W / 2 - .13), r, z), 0x101010), C(new THREE.CylinderGeometry(r * .6, r * .6, .25, 12).rotateZ(Math.PI / 2).translate(sd * (W / 2 - .125), r, z), RIM)]));
  const busG = (L, W, H, r) => { const z0 = -L / 2; const p = [C(box(W, 1.0, L - .2, 0, .95, 0), 0xf3f3f0), C(box(W + .01, .28, L - .25, 0, 1.18, 0), 0xffffff, 1), C(box(W - .06, H - 1.95, L - .5, 0, (H + 1.45) / 2 - .05, -.1), 0x0e1317), C(box(W, .32, L - .2, 0, H - .16, 0), 0xf3f3f0), C(box(W - .2, H - 1.6, .06, 0, (H + 1.3) / 2, L / 2 - .1), 0x0e1317), C(box(W + .01, .14, L * .7, 0, H - .42, -L * .1), 0xffffff, 1),
      ...wheels(L, W, r, [z0 + 1.5, -z0 - 1.8]), C(box(W - .05, .3, .14, 0, .5, -L / 2 + .1), 0x2a2b2d), C(box(W - .05, .3, .14, 0, .5, L / 2 - .1), 0x2a2b2d), C(box(.3, .2, .05, -(W / 2 - .2), 1.0, -L / 2 + .02), 0xa8140f), C(box(.3, .2, .05, W / 2 - .2, 1.0, -L / 2 + .02), 0xa8140f)]; return M(p); };
  const buseta = busG(7.6, 2.3, 2.75, .42), bus = busG(11, 2.5, 3.15, .5);
  const decal = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  return { lamp1, lamp2, head, sig, sigL, stop, kiosk, bol, hyd, gpost, gbeam, panel, sedan, hatch, suv, pickup, rustico, buseta, bus, decal };
}
