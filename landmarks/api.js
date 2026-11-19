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
    canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; },
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
