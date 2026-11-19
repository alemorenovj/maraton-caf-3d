// API común para los hitos modelados a mano. La usan el juego (game.js) y el banco de pruebas (test.html).
// Mundo: 1 unidad = 1 metro real, Y arriba, X hacia el este, Z hacia el SUR. Todo a escala 1:1.
// o (lo pasa el juego): {EX: exageración vertical del relieve, hT: cota del terreno con el relieve lateral de las correcciones}.
// ground() y routeAt().y devuelven SIEMPRE la Y del mundo tal como se dibuja (ya exagerada y con relieve): no hay que compensar nada.
// km oficial ↔ distancia sobre la ruta (m). Lineal por tramos según D.meta.kmNudos [[s, km], …] (lo escribe build/02_build.py);
// sin nudos es proporcional. Es la ÚNICA implementación: el juego la importa de aquí y la expone en ctx; los hitos, en api.
export function kmFns(D) {
  const TOTAL = (D.ruta.x.length - 1) * D.ruta.step, K = D.meta.kmNudos && D.meta.kmNudos.length > 1 ? D.meta.kmNudos : [[0, 0], [TOTAL, 42.195]];
  const map = (v, a, b) => { let j = 1; while (j < K.length - 1 && v > K[j][a]) j++; const p = K[j - 1], q = K[j]; return p[b] + (q[b] - p[b]) * (v - p[a]) / (q[a] - p[a]); };
  return { kmOf: s => map(s, 0, 1), sOfKm: k => map(k, 1, 0) };
}
// Ruta activa compuesta (21K, data/ruta-21k.js): trozos de la ruta de referencia copiados punto a punto (misma x, z y cota: continuidad por
// construcción) más conectores remuestreados cada ~10 m sobre nodos OSM, con la cota interpolada entre las de sus extremos. Pura: corre en node.
// R = la ruta de referencia con las cotas ya corregidas (game.js la pasa después de perfil, igualación, elevados y túneles).
// Devuelve { x, z, e, ref (s de referencia o −1), lat (desplazamiento lateral), N, STEP, TOTAL, KM, kmOf, sOfKm, sRef, mapKm, calle, err }.
export function componerRuta(D, def, R = D.ruta) {
  const ST = R.step, NR = R.x.length, G = D.meta.geo, rf = kmFns(D), err = [];
  const xz = (la, lo) => [(lo - G.lon0) * G.kx, -(la - G.lat0) * G.kz];
  const idx = (km, ll) => { let i = Math.max(0, Math.min(NR - 1, Math.round(rf.sOfKm(km) / ST))); if (!ll) return i;
    const [x, z] = xz(ll[0], ll[1]); let b = 1e18, bi = i; for (let j = Math.max(0, i - 30); j <= Math.min(NR - 1, i + 30); j++) { const d = (R.x[j] - x) ** 2 + (R.z[j] - z) ** 2; if (d < b) { b = d; bi = j; } }
    if (Math.sqrt(b) > 15) err.push(`extremo km ${km}: el trazado está a ${Math.sqrt(b).toFixed(0)} m del punto previsto`); return bi; };
  const P = def.piezas, rs = P.map(p => p.ref ? [idx(p.ref[0], p.ll && p.ll[0]), idx(p.ref[1], p.ll && p.ll[1])] : null);
  const X = [], Z = [], E = [], REF = [], NOM = [];
  P.forEach((p, k) => {
    if (p.ref) { const [i0, i1] = rs[k]; for (let i = i0; i <= i1; i++) { X.push(R.x[i]); Z.push(R.z[i]); E.push(R.e[i]); REF.push(i * ST); NOM.push(null); } return; }
    const ax = X[X.length - 1], az = Z[Z.length - 1], ae = E[E.length - 1], nb = rs[k + 1][0], bx = R.x[nb], bz = R.z[nb], be = R.e[nb];
    const pts = [[ax, az]]; for (const q of p.con) { const v = xz(q[0], q[1]), l = pts[pts.length - 1]; if (Math.hypot(v[0] - l[0], v[1] - l[1]) > 3) pts.push(v); }
    if (Math.hypot(pts[pts.length - 1][0] - bx, pts[pts.length - 1][1] - bz) < 3) pts.pop(); pts.push([bx, bz]);
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = cum[cum.length - 1], n = Math.max(1, Math.round(L / ST));
    for (let j = 1; j < n; j++) { const d = L * j / n; let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
      X.push(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t); Z.push(pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t); E.push(ae + (be - ae) * j / n); REF.push(-1); NOM.push(p.nombre || ''); }
  });
  const N = X.length, TOTAL = (N - 1) * ST, KM = def.KM;
  // km del 21K: los del 42K en la primera pieza (si sale del km 0) y lineal desde ahí hasta KM en la meta
  const K = []; if (P[0].ref && rs[0][0] === 0) { const sA = rs[0][1] * ST; for (const q of D.meta.kmNudos || []) if (q[0] < sA) K.push([q[0], q[1]]); K.push([sA, rf.kmOf(sA)]); } else K.push([0, 0]);
  K.push([TOTAL, KM]); const kf = kmFns({ ruta: { x: X, step: ST }, meta: { kmNudos: K } });
  // s de referencia: exacta en los trozos; en los conectores, la del punto de referencia más cercano (para la calzada, el entorno y los túneles)
  const SR = new Float64Array(N); for (let i = 0; i < N; i++) { if (REF[i] >= 0) { SR[i] = REF[i]; continue; } let b = 1e18, bj = 0; for (let j = 0; j < NR; j += 1) { const d = (R.x[j] - X[i]) ** 2 + (R.z[j] - Z[i]) ** 2; if (d < b) { b = d; bj = j; } } SR[i] = bj * ST; }
  const sRef = u => { const f = Math.max(0, Math.min(N - 1, u / ST)), i = Math.min(N - 2, Math.floor(f)), t = f - i; return REF[i] >= 0 && REF[i + 1] >= 0 ? SR[i] + (SR[i + 1] - SR[i]) * t : SR[t < .5 ? i : i + 1]; };
  // km de la referencia → km de esta ruta (null si no pasa por ahí); con varias pasadas devuelve la primera
  const mapKm = k42 => { const s = rf.sOfKm(k42); for (let i = 0; i < N - 1; i++) if (REF[i] >= 0 && REF[i + 1] >= 0 && REF[i + 1] > REF[i] && s >= REF[i] && s <= REF[i + 1]) return kf.kmOf((i + (s - REF[i]) / (REF[i + 1] - REF[i])) * ST); return null; };
  // cambio de calzada antes de la meta (def.llegada): rampa suave del desplazamiento lateral
  const LAT = new Float32Array(N); if (def.llegada) { const a = rf.sOfKm(def.llegada.km0), b = rf.sOfKm(def.llegada.km1), last = P.length - 1, i0 = N - (rs[last][1] - rs[last][0] + 1);
    for (let i = Math.max(0, i0); i < N; i++) { const t = Math.max(0, Math.min(1, (REF[i] - a) / (b - a))); LAT[i] = def.llegada.lat * t * t * (3 - 2 * t); } }
  const calle = (u, calles, cada) => { const i = Math.max(0, Math.min(N - 1, Math.round(u / ST))); return NOM[i] != null ? NOM[i] : (calles ? calles[Math.min(calles.length - 1, Math.floor(SR[i] / (ST * cada)))] || '' : ''); };
  return { x: X, z: Z, e: E, ref: REF, sr: SR, lat: LAT, N, STEP: ST, TOTAL, KM, kmOf: kf.kmOf, sOfKm: kf.sOfKm, sRef, mapKm, calle, err, kmNudos: K };
}
export function makeApi(THREE, D, o = {}) {
  const EXG = o.EX || 1;
  const G = D.meta.geo, R = D.ruta, N = R.x.length, T = D.terreno, KM = 42.195, STEP = R.step, TOTAL = (N - 1) * STEP;
  const { kmOf, sOfKm } = kmFns(D);
  let eMin = Infinity; for (const e of R.e) if (e < eMin) eMin = e;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
  const frame = [];
  const api = {
    THREE, KM, D, kmOf, sOfKm, ROAD_W: 13, EX: o.EX ? EXG : 0,   // EX ≠ 0: ground() y routeAt().y ya vienen en Y del mundo (exageradas y con el relieve lateral)
      // D = datos del juego (D.hidratacion, D.gatorade, D.geles, D.tuneles, D.elevados…); ROAD_W = ancho de calzada usado por el juego
    /** lat/lon (grados) → {x, z} en metros del mundo */
    xz(lat, lon) { return { x: (lon - G.lon0) * G.kx, z: -(lat - G.lat0) * G.kz }; },
    /** inverso: x,z → {lat, lon} */
    latlon(x, z) { return { lat: G.lat0 - z / G.kz, lon: G.lon0 + x / G.kx }; },
    /** altura Y del terreno en (x, z) */
    ground(x, z) { if (o.hT) return (o.hT(x, z) - eMin) * EXG; const fx = clamp((x - T.x0) / T.dx, 0, T.nx - 1.001), fz = clamp((z - T.z0) / T.dx, 0, T.nz - 1.001), i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, k = j * T.nx + i; return (lerp(lerp(T.h[k], T.h[k + 1], u), lerp(T.h[k + T.nx], T.h[k + T.nx + 1], u), v) - eMin) * EXG; },
    /** punto de la ruta en el km oficial dado: posición, tangente unitaria (tx,tz) y normal izquierda (lx,lz) */
    routeAt(km) { const s = clamp(sOfKm(km), 0, TOTAL), f = s / STEP, i = Math.min(N - 2, Math.floor(f)), t = f - i, a = Math.max(0, i - 2), b = Math.min(N - 1, i + 3); let tx = R.x[b] - R.x[a], tz = R.z[b] - R.z[a]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l; return { x: lerp(R.x[i], R.x[i + 1], t), y: (lerp(R.e[i], R.e[i + 1], t) - eMin) * EXG, z: lerp(R.z[i], R.z[i + 1], t), tx, tz, lx: tz, lz: -tx }; },
    /** textura dibujada en un canvas 2D (sRGB) */
    canvasTex(w, h, draw) { const c = document.createElement('canvas'), k = o.texEscala || 1, red = k < 1 && w * h >= 65536;   // en teléfono (o.texEscala < 1) las texturas grandes se pintan a menor resolución: misma función de dibujo, lienzo escalado
      c.width = red ? Math.max(1, Math.round(w * k)) : w; c.height = red ? Math.max(1, Math.round(h * k)) : h; const g = c.getContext('2d'); if (red) g.scale(c.width / w, c.height / h); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; },
    /** registra una función que se llama en cada cuadro con {noche: 0..1, t: segundos, dt} */
    onFrame(fn) { frame.push(fn); },
    tick(st) { for (const f of frame) f(st); },
    /** igual que tick pero un módulo que falle no corta a los demás (lo usa fx/fusion.js para detectar qué se mueve) */
    tickSeguro(st) { for (const f of frame) try { f(st); } catch (e) { } },
    /** concreto / pintura mate */
    concrete(hex, o = {}) { return new THREE.MeshStandardMaterial({ color: hex, roughness: o.roughness ?? .92, metalness: 0, ...o }); },
    /** vidrio de muro cortina: refleja el cielo */
    glass(hex, o = {}) { return new THREE.MeshStandardMaterial({ color: hex, roughness: o.roughness ?? .16, metalness: o.metalness ?? .8, envMapIntensity: o.env ?? 1.15, ...o }); },
    /** material que brilla (letreros, LED, relojes): se enciende más de noche */
    glow(hex, o = {}) { const m = new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: o.dia ?? .35, roughness: .6, ...o.mat }); frame.push(st => { m.emissiveIntensity = (o.dia ?? .35) + (o.noche ?? 1.6) * st.noche; }); return m; },
    /** Fachada con retícula de ventanas a escala. ancho_m × alto_m es el paño que cubre la textura UNA vez (ponla con RepeatWrapping si el muro es mayor).
     *  opts: {pared:'#hex', vidrio:'#hex', pisos, vanos, marco:0..1 (cuánto del módulo es pared), encendidas:0..1, bandas:bool (antepechos corridos)} */
    facade(o = {}) {
      const pisos = o.pisos || 10, vanos = o.vanos || 6, W = 64 * Math.min(vanos, 16), H = 64 * Math.min(pisos, 32), mv = (o.marco ?? .28), seed = o.seed || 7; let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const draw = (emis) => (g, w, h) => { const cw = w / Math.min(vanos, 16), ch = h / Math.min(pisos, 32); g.fillStyle = emis ? '#000' : (o.pared || '#cfc8b8'); g.fillRect(0, 0, w, h);
        for (let r = 0; r < Math.min(pisos, 32); r++) for (let c = 0; c < Math.min(vanos, 16); c++) { const x = c * cw + cw * mv / 2, y = r * ch + ch * (o.bandas ? .38 : mv / 2 + .08), ww = o.bandas ? cw : cw * (1 - mv), hh = ch * (o.bandas ? .5 : 1 - mv - .12), on = rnd() < (o.encendidas ?? .28);
          if (emis) { if (on) { g.fillStyle = rnd() < .7 ? '#ffd9a0' : '#cfe4ff'; g.fillRect(o.bandas ? c * cw + 2 : x, y, ww - (o.bandas ? 4 : 0), hh); } } else { g.fillStyle = o.vidrio || '#4d5f73'; g.fillRect(o.bandas ? c * cw : x, y, ww, hh); g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(o.bandas ? c * cw : x, y, ww, hh * .22); } } };
      s = seed; const map = api.canvasTex(W, H, draw(false)); s = seed; const em = api.canvasTex(W, H, draw(true)); map.wrapS = map.wrapT = em.wrapS = em.wrapT = THREE.RepeatWrapping;
      const m = new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 0, roughness: o.roughness ?? .75, metalness: o.metalness ?? .1, envMapIntensity: o.env ?? .6 }); frame.push(st => { m.emissiveIntensity = 1.1 * st.noche; }); return m;
    },
    /** marca sombras en todo el objeto y lo devuelve */
    sombras(obj) { obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return obj; },
  };
  return api;
}
