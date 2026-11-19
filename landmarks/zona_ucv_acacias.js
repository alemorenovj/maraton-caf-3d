// Zona ucv_acacias (km 19,0–21,4): lo singular que el video muestra y las huellas genéricas no resuelven.
// Pieza principal: el puente de Las Acacias sobre el Guaire y la Autopista Francisco Fajardo (Distribuidor El Pulpo), km 20,568–20,772.
// El terreno lo baja fx/correcciones/ucv_acacias.js (relieve dh −9); aquí van tablero, vigas, pilas, estribos, barandas amarillas,
// isla central, la otra calzada, el agua del Guaire y los carros de la autopista de abajo.
// quita: la isla central del puente (el generador le siembra trinitarias y matas; en el video es grama seca pelada)
// (puntos a +8,4 m del eje cada 12 m entre km 20,566 y 20,794, radio 7,5 m)
export const meta = { id: 'zona_ucv_acacias', nombre: 'Puente de Las Acacias y zona UCV', quita: [
  [10.491030, -66.884453, 7.5], [10.491112, -66.884375, 7.5], [10.491190, -66.884298, 7.5], [10.491269, -66.884219, 7.5], [10.491347, -66.884142, 7.5],
  [10.491425, -66.884065, 7.5], [10.491503, -66.883989, 7.5], [10.491582, -66.883912, 7.5], [10.491661, -66.883836, 7.5], [10.491741, -66.883760, 7.5],
  [10.491820, -66.883683, 7.5], [10.491899, -66.883607, 7.5], [10.491979, -66.883530, 7.5], [10.492057, -66.883453, 7.5], [10.492136, -66.883376, 7.5],
  [10.492214, -66.883299, 7.5], [10.492293, -66.883222, 7.5], [10.492372, -66.883146, 7.5], [10.492451, -66.883070, 7.5], [10.492531, -66.882994, 7.5],
] };

// Puente (km de la ruta) y caída del terreno: deben coincidir con fx/correcciones/ucv_acacias.js
const KD0 = 20.568, KD1 = 20.772, DH = -9, RAMPA = 12;

export function build(THREE, api) {
  const g = new THREE.Group();
  // Escala vertical del juego: game.js dibuja la ruta y el terreno a (cota − cotaMín) × EX (EX = 1,5 por defecto, ?relieve=…), pero
  // api.routeAt().y y api.ground() devuelven la cota SIN exagerar. En el juego hay que multiplicar; en el banco de pruebas no.
  const enBanco = /test\.html/.test(location.pathname), q = new URLSearchParams(location.search);
  const EX = enBanco || api.EX ? 1 : (api.D.meta.exag || 1) * (+q.get('relieve') || 1.5);   // api.EX: la API ya entrega la Y del mundo
  const RA = k => { const p = api.routeAt(k); p.y *= EX; return p; };
  const at = (p, lat, dy = 0) => [p.x + p.lx * lat, p.y + dy, p.z + p.lz * lat];
  const fondo = (p, lat) => api.ground(p.x + p.lx * lat, p.z + p.lz * lat) * EX + (enBanco || api.EX ? 0 : DH);   // cota del suelo bajo el puente

  // ── constructor de cintas a lo largo de la ruta (secciones cada `paso` m) ──
  const STEPKM = .005, ks = []; for (let k = KD0 - .004; k <= KD1 + .0041; k += STEPKM) ks.push(k);
  const secs = ks.map(RA);
  const cinta = (pts, mat) => {   // pts(p) → lista de [x,y,z] de la sección; une secciones consecutivas
    const pos = [], idx = []; let n = 0;
    for (const p of secs) { const s = pts(p); n = s.length; for (const v of s) pos.push(...v); }
    for (let i = 0; i < secs.length - 1; i++) for (let j = 0; j < n - 1; j++) { const a = i * n + j, b = a + n; idx.push(a, b, a + 1, a + 1, b, b + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat); g.add(m); return m;
  };
  const conc = api.concrete(0xb3afa6, { side: THREE.DoubleSide }), concOsc = api.concrete(0x8d8a83, { side: THREE.DoubleSide });
  const amarillo = api.concrete(0xe9bf22, { roughness: .8 }), acera = api.concrete(0xb9b4a8);

  // sección (lat: + izquierda). La calzada de fx/calzada.js, con la vía de fx/correcciones/ucv_acacias.js (2 calzadas, isla con grama,
  // 2 canales, aceras de 1,3 m), ocupa: acera der. −8,1…−6,8; calzada de la ruta −6,8…+6,8; isla +6,8…+10; contraria +10…+16,2;
  // acera izq. +16,2…+17,5. El tablero la envuelve con un margen para las barandas.
  const LR = -8.55, LL = 17.95, ESP = 1.9;
  cinta(p => [at(p, LR, -ESP), at(p, LL, -ESP)], concOsc);                                        // cara inferior de la losa
  cinta(p => [at(p, LR, .2), at(p, LR, -ESP)], conc);                                              // canto (frente) derecho
  cinta(p => [at(p, LL, .2), at(p, LL, -ESP)], conc);                                              // canto izquierdo
  cinta(p => [at(p, -8.1, .16), at(p, LR, .16)], acera);                                          // remate de acera hasta la baranda
  cinta(p => [at(p, 17.5, .16), at(p, LL, .16)], acera);

  // vigas bajo la losa
  for (const lat of [-7.4, -2.6, 2.2, 7, 11.8, 16.6]) cinta(p => [at(p, lat - .3, -ESP), at(p, lat - .3, -ESP - 1.3), at(p, lat + .3, -ESP - 1.3), at(p, lat + .3, -ESP)], concOsc);

  // barandas amarillas: zócalo macizo, balaustres y pasamanos de concreto (como en el video, t=510–513)
  const latB = [LR + .22, LL - .22];
  for (const lb of latB) {
    cinta(p => [at(p, lb - .18, .18), at(p, lb - .18, .55), at(p, lb + .18, .55), at(p, lb + .18, .18)], amarillo);   // zócalo
    cinta(p => [at(p, lb - .16, .88), at(p, lb - .16, 1.12), at(p, lb + .16, 1.12), at(p, lb + .16, .88)], amarillo); // pasamanos
  }
  { const post = new THREE.BoxGeometry(.26, .36, .22), pos = []; for (let k = KD0 - .004; k <= KD1 + .004; k += .0013) { const p = RA(k); for (const lb of latB) pos.push([at(p, lb, .72), Math.atan2(p.tx, p.tz)]); }
    const im = new THREE.InstancedMesh(post, amarillo, pos.length), m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1);
    pos.forEach(([v, r], i) => { qq.setFromEuler(e.set(0, r, 0)); m4.compose(new THREE.Vector3(...v), qq, one); im.setMatrixAt(i, m4); }); g.add(im); }

  // pilas: viga cabezal + tres columnas redondas hasta el fondo; estribos de concreto en los dos extremos
  const col = new THREE.CylinderGeometry(.75, .75, 1, 16);
  for (const k of [20.612, 20.655, 20.69, 20.73]) {
    const p = RA(k), r = Math.atan2(p.tx, p.tz), c = at(p, (LR + LL) / 2, -ESP - 1.3 - .6);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(LL - LR - 1, 1.2, 1.8), conc); cab.position.set(...c); cab.rotation.y = r + Math.PI / 2; g.add(cab);
    for (const lat of [-5.5, 4.7, 14.9]) { const y0 = fondo(p, lat) - .5, y1 = p.y - ESP - 1.3 - 1.2, h = y1 - y0; if (h < .5) continue;
      const m = new THREE.Mesh(col, conc); const v = at(p, lat); m.position.set(v[0], y0 + h / 2, v[2]); m.scale.y = h; g.add(m); }
  }
  for (const [k, sg] of [[KD0 + .003, -1], [KD1 - .003, 1]]) {
    const p = RA(k), r = Math.atan2(p.tx, p.tz), lat0 = LR - 6, lat1 = LL + 6, yb = Math.min(fondo(p, lat0), fondo(p, lat1), fondo(p, 4)) - 1, h = p.y - ESP - yb;
    const est = new THREE.Mesh(new THREE.BoxGeometry(lat1 - lat0, h, 3), conc); const v = at(p, (lat0 + lat1) / 2); est.position.set(v[0], yb + h / 2, v[2]); est.rotation.y = r; g.add(est);
    for (const lat of [lat0, lat1]) { const ala = new THREE.Mesh(new THREE.BoxGeometry(.8, h, 14), concOsc); const w = at(p, lat); ala.position.set(w[0] - p.tx * 7 * sg, yb + h / 2, w[2] - p.tz * 7 * sg); ala.rotation.y = r; g.add(ala); }
  }

  // el Guaire bajo el extremo SO del puente (cruza casi perpendicular, km ~20,59) y la autopista con carros
  { const p = RA(20.59), w = 12, L = 260, geo = new THREE.PlaneGeometry(L, w, 26, 1); geo.rotateX(-Math.PI / 2);
    const agua = new THREE.MeshStandardMaterial({ color: 0x5b5a3e, roughness: .25, metalness: .2, envMapIntensity: .8 });
    const m = new THREE.Mesh(geo, agua); const pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) { const lat = pa.getX(i), al = pa.getZ(i), x = p.x + p.lx * lat + p.tx * al, z = p.z + p.lz * lat + p.tz * al; pa.setXYZ(i, x, Math.min(fondo({ x: p.x + p.tx * al, z: p.z + p.tz * al, lx: p.lx, lz: p.lz }, lat), fondo(p, 0)) + .25, z); }
    geo.computeVertexNormals(); m.receiveShadow = true; g.add(m); }
  if (!enBanco) {
    const carros = [], cols = [0xe8e8e8, 0x2b2d33, 0x9aa3ad, 0xa31d22, 0x1f3b6e, 0xd8d2c0, 0x55595e, 0xf2f2f0];
    const carro = new THREE.BoxGeometry(1.8, 1.45, 4.3); carro.translate(0, .72, 0);
    const lineas = [[20.627, -1, 2], [20.643, 1, 4], [20.655, 1, 4], [20.664, -1, 4], [20.676, -1, 4], [20.71, 1, 2]];
    const mat = new THREE.MeshStandardMaterial({ roughness: .4, metalness: .5 }), n = 46, im = new THREE.InstancedMesh(carro, mat, n);
    for (let i = 0; i < n; i++) { const [k, sg, nl] = lineas[i % lineas.length]; carros.push({ k, sg, off: (i % nl) * 3.4, s: Math.random() * 200, v: 14 + Math.random() * 8 }); im.setColorAt(i, new THREE.Color(cols[i % cols.length])); }
    const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1), V = new THREE.Vector3();
    const P = carros.map(c => RA(c.k));
    api.onFrame(st => { carros.forEach((c, i) => { c.s = (c.s + c.v * Math.min(st.dt || 0, .1)) % 200; const p = P[i], lat = (c.s - 100) * c.sg, x = p.x + p.lx * lat + p.tx * c.off, z = p.z + p.lz * lat + p.tz * c.off;
      qq.setFromEuler(e.set(0, Math.atan2(p.lx * c.sg, p.lz * c.sg), 0)); m4.compose(V.set(x, fondo(p, lat) + .05, z), qq, one); im.setMatrixAt(i, m4); }); im.instanceMatrix.needsUpdate = true; });
    g.add(im);
  }

  // ───────── resto de la zona ─────────
  const suelo = (x, z) => api.ground(x, z) * EX;
  const sitio = (k, lat) => { const p = RA(k), x = p.x + p.lx * lat, z = p.z + p.lz * lat; return { x, z, y: Math.abs(lat) < 14 ? p.y : suelo(x, z), r: Math.atan2(p.tx, p.tz) }; };
  // muro a lo largo de la ruta (lat fijo) con material `mat` (UV en metros/escala). h: altura sobre la calzada, o función (k, p) → Y del remate;
  // y0: base sobre la calzada, o función (k, p) → Y de la base (por defecto el suelo o la calzada, lo más bajo). La cara mira a la vía (el pase de
  // normales de la oclusión ambiental descarta las caras traseras: con la cara al revés, los árboles de detrás oscurecían el muro a bloques)
  const muro = (k0, k1, lat, h, mat, esc = 1, y0) => { const pos = [], uv = [], idx = []; let n = 0, s = 0, prev = null;
    for (let k = k0; k <= k1 + 1e-6; k += .004, n++) { const p = RA(k), x = p.x + p.lx * lat, z = p.z + p.lz * lat, yb = typeof y0 === 'function' ? y0(k, p) : y0 != null ? p.y + y0 : Math.min(p.y, suelo(x, z)) - .4, yt = typeof h === 'function' ? h(k, p) : p.y + h;
      if (prev) s += Math.hypot(x - prev[0], z - prev[1]); prev = [x, z]; pos.push(x, yb, z, x, yt, z); uv.push(s / esc, (yb - p.y) / esc, s / esc, (yt - p.y) / esc);
      if (n) { const a = (n - 1) * 2; if (lat < 0) idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); else idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat); g.add(m); return m; };

  // ── Trinchera y Plaza de los Estadios (km 20,17–20,585). La avenida baja ~4,5 m (perfil en fx/correcciones/ucv_acacias.js) entre dos muros y pasa
  // bajo la losa de la plaza (20,298–20,484), que tiene tres patios circulares abiertos (foto satelital; OSM marca layer −1 justo entre ellos:
  // 20,306–20,315, 20,350–20,363, 20,410–20,421, 20,456–20,481). Video: losa curva encima y columnas a los lados t=504–508, muro gris t=508,5–509,5.
  // U(k): cota de la calle de arriba (la de antes de bajar), recta entre los dos extremos de la trinchera.
  const KU0 = 20.17, KU1 = 20.585, UA = RA(KU0).y, UB = RA(KU1).y, U = k => UA + (UB - UA) * Math.min(1, Math.max(0, (k - KU0) / (KU1 - KU0)));
  const KP0 = 20.298, KP1 = 20.484, enPlaza = k => k > KP0 && k < KP1, MR = -8.45, ML = 17.6;      // losa de la plaza y muros (lat: + izquierda)
  const PATIOS = [[20.333, 1.1, 14.7], [20.387, 2.8, 22.9], [20.442, 3.3, 16.1], [20.480, 2.5, 4.1]];  // km, lat y radio (m) de los patios
  const enPatio = (k, l) => PATIOS.some(([kc, lc, r]) => Math.hypot((k - kc) * 1000, l - lc) < r);
  const W = (k, l, dy) => { const p = RA(k); return [p.x + p.lx * l, U(k) + dy, p.z + p.lz * l]; };
  const techoMuro = (k, p) => enPlaza(k) ? U(k) - .3 : Math.max(U(k) + 1.1, p.y + 1.2);
  { const tex = api.canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#8e8f8c'; c.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(60,60,58,${.03 + Math.random() * .05})`; c.fillRect(Math.random() * w, 0, 2 + Math.random() * 8, h); }
      c.fillStyle = 'rgba(40,40,40,.55)'; for (let x = 20; x < w; x += 64) c.fillRect(x, h * .42, 5, 4);            // mechinales
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, 0, w, 3); for (let x = 0; x < w; x += 128) c.fillRect(x, 0, 2, h); });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; const gris = new THREE.MeshStandardMaterial({ map: tex, roughness: .95, side: THREE.DoubleSide });
    muro(20.31, 20.578, MR, techoMuro, gris, 8);                                                     // derecha: bajo la plaza y la rampa del muro gris
    muro(20.31, 20.56, ML, techoMuro, gris, 8);                                                      // izquierda, tras la calzada contraria
    // losa de la plaza (ladrillo) y remates sobre la trinchera fuera de ella (concreto), con los patios abiertos
    const ladrillo = api.canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#b4735a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(${90 + Math.random() * 60},${50 + Math.random() * 30},40,.25)`; c.fillRect(Math.random() * w, Math.random() * h, 6, 3); }
      c.fillStyle = '#d9cbb6'; c.fillRect(0, 0, w, 4); c.fillRect(0, 0, 4, h); });
    ladrillo.wrapS = ladrillo.wrapT = THREE.RepeatWrapping;
    const capas = { p: { pos: [], uv: [] }, c: { pos: [], uv: [] }, b: { pos: [], uv: [] } }, V3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    // cuadrilátero P0 P1 (abajo) P2 P3 (arriba) con la cara hacia `n`
    const quad = (C, P0, P1, P2, P3, n, u0 = 0, u1 = 1, v0 = 0, v1 = 1) => { const e1 = [P1[0] - P0[0], P1[1] - P0[1], P1[2] - P0[2]], e2 = [P2[0] - P0[0], P2[1] - P0[1], P2[2] - P0[2]], c = V3(e1, e2), ok = c[0] * n[0] + c[1] * n[1] + c[2] * n[2] >= 0;
      const T = ok ? [[P0, u0, v0], [P1, u1, v0], [P2, u0, v1], [P1, u1, v0], [P3, u1, v1], [P2, u0, v1]] : [[P0, u0, v0], [P2, u0, v1], [P1, u1, v0], [P1, u1, v0], [P2, u0, v1], [P3, u1, v1]];
      for (const [q, u, v] of T) { C.pos.push(...q); C.uv.push(u, v); } };
    const DK = .001, DL = 1, L0 = -40, L1 = 44, celda = (k, l) => k > 20.20 && k < 20.564 && !enPatio(k, l) && (enPlaza(k) ? l > L0 && l < L1 : l > -24 && l < 30 && (l <= MR || l >= ML));
    for (let k = 20.20; k < 20.564 - 1e-6; k += DK) for (let l = L0; l < L1; l += DL) { const kc = k + DK / 2, lc = l + DL / 2; if (!celda(kc, lc)) continue;
      const C = enPlaza(kc) && lc > MR - 6 && lc < ML + 6 ? capas.p : capas.c, ka = k, kb = k + DK, la = l, lb = l + DL, u = k * 1000 / 4;
      quad(C, W(ka, la, .3), W(kb, la, .3), W(ka, lb, .3), W(kb, lb, .3), [0, 1, 0], u, u + DK * 250, la / 4, lb / 4);              // cara de arriba
      if (enPlaza(kc)) quad(capas.b, W(ka, la, -.5), W(kb, la, -.5), W(ka, lb, -.5), W(kb, lb, -.5), [0, -1, 0]);                   // cara de abajo
      // canto: fuera de la trinchera baja hasta el suelo (borde exterior y paredes de los patios); sobre la vía, solo el espesor de la losa
      const borde = (k1, l1, k2, l2, kn, ln) => { const fuera = (l1 + l2) / 2 <= MR || (l1 + l2) / 2 >= ML, a = W(k1, l1, -.5), b = W(k2, l2, -.5), c = W(k1, l1, .3), d = W(k2, l2, .3), o = W(kc, lc, 0), q = W(kn, ln, 0);
        if (fuera) { a[1] = Math.min(a[1], suelo(a[0], a[2]) - .3); b[1] = Math.min(b[1], suelo(b[0], b[2]) - .3); } quad(capas.b, a, b, c, d, [q[0] - o[0], 0, q[2] - o[2]]); };
      if (!celda(kc - DK, lc)) borde(ka, la, ka, lb, kc - DK, lc); if (!celda(kc + DK, lc)) borde(kb, la, kb, lb, kc + DK, lc);       // canto donde acaba la losa
      if (!celda(kc, lc - DL)) borde(ka, la, kb, la, kc, lc - DL); if (!celda(kc, lc + DL)) borde(ka, lb, kb, lb, kc, lc + DL); }
    // brocal curvo de los patios (canto de la losa + antepecho de 1 m), con la cara hacia dentro del patio
    for (const [kc, lc, r] of PATIOS) for (let i = 0; i < 48; i++) { const a0 = i / 48 * 2 * Math.PI, a1 = (i + 1) / 48 * 2 * Math.PI, am = (a0 + a1) / 2;
      const km = kc + Math.cos(am) * r / 1000, lm = lc + Math.sin(am) * r / 1000 * 1000; if (!celda(km + (km - kc) * .05, lm + (lm - lc) * .05)) continue;
      const p0 = [kc + Math.cos(a0) * r / 1000, lc + Math.sin(a0) * r], p1 = [kc + Math.cos(a1) * r / 1000, lc + Math.sin(a1) * r], cen = W(kc, lc, 0), mid = W(km, lm, 0);
      const b0 = W(p0[0], p0[1], -.5), b1 = W(p1[0], p1[1], -.5); if (lm <= MR || lm >= ML) { b0[1] = Math.min(b0[1], suelo(b0[0], b0[2]) - .3); b1[1] = Math.min(b1[1], suelo(b1[0], b1[2]) - .3); }   // pared del patio hasta el suelo
      quad(capas.b, b0, b1, W(p0[0], p0[1], 1.1), W(p1[0], p1[1], 1.1), [cen[0] - mid[0], 0, cen[2] - mid[2]]); }
    const malla = (C, mat) => { if (!C.pos.length) return; const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(C.pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(C.uv, 2)); geo.computeVertexNormals(); g.add(new THREE.Mesh(geo, mat)); };
    malla(capas.p, new THREE.MeshStandardMaterial({ map: ladrillo, roughness: .95 })); malla(capas.c, api.concrete(0xa9a395)); malla(capas.b, api.concrete(0xb9b6ad));
    // columnas redondas bajo la losa: en la acera derecha, en la isla y en la acera izquierda
    const col = new THREE.CylinderGeometry(.42, .42, 1, 12), cm = api.concrete(0xc4c1b8);
    for (let k = KP0 + .004; k < KP1 - .002; k += .009) for (const l of [-7.5, 8.4, 16.9]) { if (enPatio(k, l) || enPatio(k, l + 1.5) || enPatio(k, l - 1.5)) continue;
      const p = RA(k), x = p.x + p.lx * l, z = p.z + p.lz * l, y0 = Math.min(p.y, suelo(x, z)) - .2, y1 = U(k) - .5; if (y1 - y0 < 1) continue;
      const m = new THREE.Mesh(col, cm); m.position.set(x, (y0 + y1) / 2, z); m.scale.y = y1 - y0; g.add(m); } }

  // Estadio Universitario (béisbol), 25–215 m a la derecha del km 20,43–20,60: antes era una caja maciza de 15,6 m (huella de 25.619 m², quitada en
  // fx/correcciones/ucv_acacias.js). Contorno de OSM (way 1122839213): muro exterior de 11 m, gradas que bajan 22 m hacia dentro, grama y 6 torres de luz.
  { const LL = [[10.489284, -66.884476], [10.490144, -66.884626], [10.490286, -66.884618], [10.49042, -66.884543], [10.490516, -66.884426], [10.490576, -66.884248],
      [10.490593, -66.884031], [10.490575, -66.883822], [10.490498, -66.883571], [10.490384, -66.883365], [10.490213, -66.883165], [10.49003, -66.883025],
      [10.489855, -66.882939], [10.489739, -66.882937], [10.48953, -66.883034], [10.489461, -66.88312], [10.489022, -66.883822], [10.488962, -66.883975],
      [10.488979, -66.884195], [10.489065, -66.884336], [10.489184, -66.884439]];
    const O = LL.map(([la, lo]) => api.xz(la, lo)), n = O.length; let cx = 0, cz = 0; O.forEach(p => { cx += p.x; cz += p.z; }); cx /= n; cz /= n;
    const I = O.map(p => { const r = Math.hypot(p.x - cx, p.z - cz), k = Math.max(r - 22, r * .45) / r; return { x: cx + (p.x - cx) * k, z: cz + (p.z - cz) * k }; });
    let y0 = suelo(cx, cz); O.concat(I).forEach(p => { y0 = Math.min(y0, suelo(p.x, p.z)); }); y0 -= .3;
    const H = 11, yi = y0 + 2.4, pos = [], uv = [], idx = [], per = [0]; for (let i = 1; i <= n; i++) per.push(per[i - 1] + Math.hypot(O[i % n].x - O[i - 1].x, O[i % n].z - O[i - 1].z));
    const banda = (A, ya, B, yb, vb) => { const b0 = pos.length / 3; for (let i = 0; i <= n; i++) { const a = A[i % n], c = B[i % n]; pos.push(a.x, ya, a.z, c.x, yb, c.z); uv.push(per[i] / 4, 0, per[i] / 4, vb); }
      for (let i = 0; i < n; i++) { const a = b0 + i * 2; idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); } };
    const gradas = api.canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#9a9890'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) { c.fillStyle = '#c9c6bc'; c.fillRect(0, y, w, 3); c.fillStyle = '#6f6d66'; c.fillRect(0, y + 6, w, 2); }
      c.fillStyle = 'rgba(30,70,140,.55)'; for (let x = 0; x < w; x += 4) c.fillRect(x, 0, 2, h * .45); });
    gradas.wrapS = gradas.wrapT = THREE.RepeatWrapping;
    banda(I, yi, O, y0 + H, 14);                                                                     // gradas: del borde del campo al remate del muro
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: gradas, roughness: .95, side: THREE.DoubleSide })));
    pos.length = uv.length = idx.length = 0; banda(O, y0, O, y0 + H + 1.1, 1); banda(I, y0, I, yi + .9, 1);   // muro exterior con antepecho y muro del campo
    const geo2 = new THREE.BufferGeometry(); geo2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo2.setIndex(idx); geo2.computeVertexNormals();
    g.add(new THREE.Mesh(geo2, api.concrete(0xd6d2c6, { side: THREE.DoubleSide })));
    const cg = [cx, y0 + .25, cz]; pos.length = idx.length = 0; pos.push(...cg); I.forEach(p => pos.push(p.x, y0 + .25, p.z)); for (let i = 0; i < n; i++) idx.push(0, 1 + (i + 1) % n, 1 + i);
    const geo3 = new THREE.BufferGeometry(); geo3.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo3.setIndex(idx); geo3.computeVertexNormals();
    g.add(new THREE.Mesh(geo3, new THREE.MeshStandardMaterial({ color: 0x4f7a3a, roughness: 1, side: THREE.DoubleSide })));
    const poste = new THREE.CylinderGeometry(.35, .6, 34, 8), lamp = new THREE.BoxGeometry(5, 3, .6), gris = api.concrete(0x8c8f93, { metalness: .4 });
    for (const i of [0, 4, 8, 12, 15, 18]) { const p = O[i], q = I[i], x = p.x + (p.x - q.x) * .05, z = p.z + (p.z - q.z) * .05;
      const m = new THREE.Mesh(poste, gris); m.position.set(x, y0 + 17, z); g.add(m);
      const l = new THREE.Mesh(lamp, gris); l.position.set(x, y0 + 35, z); l.rotation.y = Math.atan2(cx - x, cz - z); g.add(l); } }

  // Av. Las Acacias entre muros con murales a ambos lados (video t=502,5–504): figuras, la bandera y franjas de color
  { const mural = seed => { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const t = api.canvasTex(1024, 128, (c, w, h) => { c.fillStyle = '#d9d4c8'; c.fillRect(0, 0, w, h);
        for (let x = 0; x < w;) { const ww = 90 + r() * 170, k = r();
          if (k < .28) { const gr = c.createLinearGradient(x, 0, x + ww, 0); gr.addColorStop(0, '#1e3f8f'); gr.addColorStop(1, '#3b6fc4'); c.fillStyle = gr; c.fillRect(x, 0, ww, h);   // fondo azul con estrellas y cinta amarilla
            c.fillStyle = '#f2c230'; c.beginPath(); c.moveTo(x, h * .7); c.bezierCurveTo(x + ww * .3, h * .2, x + ww * .6, h * .9, x + ww, h * .35); c.lineTo(x + ww, h * .5); c.bezierCurveTo(x + ww * .6, h, x + ww * .3, h * .35, x, h * .85); c.fill();
            c.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(x + r() * ww, h * (.15 + r() * .4), 4, 0, 7); c.fill(); } }
          else if (k < .5) { c.fillStyle = '#f0c419'; c.fillRect(x, 0, ww, h / 3); c.fillStyle = '#1d4fa0'; c.fillRect(x, h / 3, ww, h / 3); c.fillStyle = '#c8202f'; c.fillRect(x, h * 2 / 3, ww, h / 3); }   // tricolor
          else { c.fillStyle = ['#e8e2d4', '#c9d6e3', '#efd9b4'][Math.floor(r() * 3)]; c.fillRect(x, 0, ww, h);                     // figuras humanas grandes (deportistas)
            for (let i = 0; i < 2; i++) { const cx = x + ww * (.3 + i * .4), col = ['#2b3b66', '#7a3b2a', '#3c6b8a', '#5b4a7a'][Math.floor(r() * 4)]; c.fillStyle = col;
              c.beginPath(); c.arc(cx, h * .22, 10, 0, 7); c.fill(); c.fillRect(cx - 9, h * .32, 18, h * .4); c.save(); c.translate(cx, h * .4); c.rotate(r() - .5); c.fillRect(-26, -4, 52, 8); c.restore();
              c.fillRect(cx - 9, h * .7, 7, h * .3); c.fillRect(cx + 2, h * .7, 7, h * .3); } }
          x += ww; }
        c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, h - 10, w, 10); });
      t.wrapS = THREE.RepeatWrapping; return new THREE.MeshStandardMaterial({ map: t, roughness: .9, side: THREE.DoubleSide }); };
    const mR = mural(11), mL = mural(57); mR.map.repeat.set(1 / 60, 1 / 3); mL.map.repeat.set(1 / 60, 1 / 2.4);
    // bajan con la avenida: el remate sigue la calle de arriba (U) y la base, la calzada
    muro(20.2, 20.31, MR, (k, p) => Math.max(U(k) + 1.1, p.y + 2.6), mR, 1);
    muro(20.21, 20.31, ML, (k, p) => Math.max(U(k) + 1.1, p.y + 2.4), mL, 1);
    // reja sobre el muro izquierdo
    const reja = new THREE.MeshStandardMaterial({ color: 0x3a3d40, roughness: .6, metalness: .4, transparent: true, opacity: .55, side: THREE.DoubleSide });
    muro(20.21, 20.31, ML, (k, p) => Math.max(U(k) + 1.1, p.y + 2.4) + 1.3, reja, 1, (k, p) => Math.max(U(k) + 1.1, p.y + 2.4)); }

  // hongos de colores (figuras decorativas de las plazas de la UCV): tallo blanco y sombrero con lunares
  { const tallo = new THREE.CylinderGeometry(.42, .62, 1, 14), som = new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const lunares = hex => { const t = api.canvasTex(256, 128, (c, w, h) => { c.fillStyle = hex; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(Math.random() * w, Math.random() * h * .8, 5 + Math.random() * 6, 0, 7); c.fill(); } }); return new THREE.MeshStandardMaterial({ map: t, roughness: .45, metalness: .1 }); };
    const blanco = api.concrete(0xf1eee6);
    const hongo = (k, lat, hex, H = 3.2, R = 1.9) => { const s = sitio(k, lat), o = new THREE.Group(); const t = new THREE.Mesh(tallo, blanco); t.scale.set(1, H * .62, 1); t.position.y = H * .31;
      const c = new THREE.Mesh(som, lunares(hex)); c.scale.set(R, R * .62, R); c.position.y = H * .58; const b = new THREE.Mesh(new THREE.CircleGeometry(R * .98, 20), blanco); b.rotation.x = Math.PI / 2; b.position.y = H * .58; o.add(t, c, b); o.position.set(s.x, s.y, s.z); o.rotation.y = s.r; g.add(o); };
    hongo(19.335, 12, '#2fb3b8', 3.4, 2);          // f_0193, izquierda
    hongo(19.93, -9.5, '#e2365a', 2.4, 1.4);       // f_0198, junto al concesionario
    hongo(19.965, 10.5, '#f2c81e', 2.2, 2.1);      // f_0199, plaza de las banderas
    hongo(19.975, 12.5, '#2fb3b8', 2.8, 1.6);
    hongo(19.985, 11, '#d93a3a', 1.6, 1.1);
    hongo(20.075, 10.5, '#36b6c0', 3.4, 2.1);      // f_0200, frente al edificio gris de la UCV
    hongo(20.08, 13.5, '#5fb846', 1.2, .8); }

  // banderas alrededor de la Plaza Las Tres Gracias (video f_0199): mástiles blancos con la bandera nacional y la de Caracas
  { const C = api.xz(10.488139, -66.889170), cy = suelo(C.x, C.z), mast = new THREE.CylinderGeometry(.06, .09, 10, 6), blanco = api.concrete(0xf4f4f0);
    const ve = api.canvasTex(96, 64, (c, w, h) => { c.fillStyle = '#f2c51e'; c.fillRect(0, 0, w, h / 3); c.fillStyle = '#1f4ea0'; c.fillRect(0, h / 3, w, h / 3); c.fillStyle = '#cf1f2f'; c.fillRect(0, h * 2 / 3, w, h / 3); c.fillStyle = '#fff'; for (let i = 0; i < 8; i++) { const a = Math.PI * (.15 + .7 * i / 7); c.beginPath(); c.arc(w / 2 - Math.cos(a) * 14, h / 2 + 8 - Math.sin(a) * 12, 1.6, 0, 7); c.fill(); } });
    const cc = api.canvasTex(96, 64, (c, w, h) => { c.fillStyle = '#c3202a'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2c51e'; c.beginPath(); c.arc(w * .3, h * .5, 12, 0, 7); c.fill(); c.fillStyle = '#2e8b3a'; c.fillRect(0, h - 8, w, 8); });
    const mV = new THREE.MeshStandardMaterial({ map: ve, side: THREE.DoubleSide, roughness: .8 }), mC = new THREE.MeshStandardMaterial({ map: cc, side: THREE.DoubleSide, roughness: .8 });
    const tela = new THREE.PlaneGeometry(2.1, 1.4, 6, 1); tela.translate(1.05, 0, 0); { const pa = tela.attributes.position; for (let i = 0; i < pa.count; i++) pa.setZ(i, Math.sin(pa.getX(i) * 2.2) * .18); }
    const ruta = []; for (let k = 19.9; k <= 20.05; k += .005) ruta.push(RA(k));
    let n = 0; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, x = C.x + Math.cos(a) * 18, z = C.z + Math.sin(a) * 18;
      if (ruta.some(p => Math.hypot(p.x - x, p.z - z) < 10)) continue;
      const m = new THREE.Mesh(mast, blanco); m.position.set(x, cy + 5, z); g.add(m);
      const f = new THREE.Mesh(tela, n++ % 3 === 1 ? mC : mV); f.position.set(x, cy + 9.1, z); f.rotation.y = .9 + Math.sin(i) * .25; g.add(f); } }

  // oso de alambre (figura navideña de alambre blanco con lazo rojo) en la isla de la redoma, video f_0191–0192
  { const s = sitio(19.175, 11), o = new THREE.Group(), alambre = new THREE.MeshBasicMaterial({ color: 0xe8ecef, wireframe: true, transparent: true, opacity: .85 });
    const parte = (rx, ry, rz, x, y, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), alambre); m.scale.set(rx, ry, rz); m.position.set(x, y, z); o.add(m); };
    parte(1.1, .9, 1.7, 0, 1.3, 0); parte(.6, .55, .6, 0, 1.9, 1.7); parte(.22, .2, .22, 0, 2.4, 1.9);
    for (const [x, z] of [[-.6, .9], [.6, .9], [-.6, -.9], [.6, -.9]]) parte(.28, .55, .28, x, .5, z);
    const lazo = new THREE.Mesh(new THREE.TorusGeometry(.5, .08, 6, 16), api.concrete(0xc8202a)); lazo.position.set(0, 1.6, 1.25); o.add(lazo);
    o.position.set(s.x, s.y + .15, s.z); o.rotation.y = s.r + 1.2; g.add(o); }

  return api.sombras(g);
}
