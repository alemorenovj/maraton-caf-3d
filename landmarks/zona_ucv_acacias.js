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
    hongo(19.335, 12, '#2fb3b8', 3.4, 2);          // f_0193, izquierda (los de la plaza de las banderas y la bajada, en la sección de la 2.ª ronda)
    hongo(20.075, 10.5, '#36b6c0', 3.4, 2.1);      // f_0200, frente al edificio gris de la UCV
    hongo(20.08, 13.5, '#5fb846', 1.2, .8); }

  // oso de alambre (figura navideña de alambre blanco con lazo rojo) en la isla de la redoma, video f_0191–0192
  { const s = sitio(19.175, 11), o = new THREE.Group(), alambre = new THREE.MeshBasicMaterial({ color: 0xe8ecef, wireframe: true, transparent: true, opacity: .85 });
    const parte = (rx, ry, rz, x, y, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), alambre); m.scale.set(rx, ry, rz); m.position.set(x, y, z); o.add(m); };
    parte(1.1, .9, 1.7, 0, 1.3, 0); parte(.6, .55, .6, 0, 1.9, 1.7); parte(.22, .2, .22, 0, 2.4, 1.9);
    for (const [x, z] of [[-.6, .9], [.6, .9], [-.6, -.9], [.6, -.9]]) parte(.28, .55, .28, x, .5, z);
    const lazo = new THREE.Mesh(new THREE.TorusGeometry(.5, .08, 6, 16), api.concrete(0xc8202a)); lazo.position.set(0, 1.6, 1.25); o.add(lazo);
    o.position.set(s.x, s.y + .15, s.z); o.rotation.y = s.r + 1.2; g.add(o); }

  // ═════════ Bajada de Los Símbolos a los estadios (km 19,2–19,95): comercios y referencias que se reconocen al pasar ═════════
  // Video bajado a 2–4 cuadros/s (t = segundo del video de YouTube, ≈ 44 m/s; el índice de fotogramas va ~0,26 km adelantado aquí). Anclas:
  // puente de Los Ilustres t=470,25 (km 18,77) · oso de alambre de la redoma t=477–478,5 (19,15) · Farmatodo de frente t=481 (19,29) ·
  // isla pintada de triángulos t=482,5–483 (19,39) · parada azul t=485 (19,55) · marquesina naranja de la bomba t=485,75 (19,59) ·
  // semáforo t=486 (19,61) · letrero verde de farmacia t=487 (19,66) · quiosco del mural t=487,5 (19,70) · tótem de Toyota t=493,5 (19,90) ·
  // plaza de las banderas t=495 (19,95). Nombres: solo los que se leen en el video (Farmatodo, Toyota/C.A. Cars) o están en OSM en ese
  // sitio (E/S Ciudad Universitaria PDV, Farmacia Universitaria, Panadería Los Símbolos, Farmacia Los Próceres).
  { const XZ = (la, lo) => api.xz(la, lo), gy = suelo;
    const nrm = (x, z) => { const l = Math.hypot(x, z) || 1; return [x / l, z / l]; };
    const ladoP = (k, d) => { const r = RA(k); return { x: r.x + r.lx * d, z: r.z + r.lz * d, y: r.y, r, ry: Math.atan2(r.tx, r.tz) }; };
    const mesh = (geo, mat, x, y, z, ry = 0, p = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; };
    const plano = (w, h, mat, x, y, z, nx, nz) => mesh(new THREE.PlaneGeometry(w, h), mat, x, y, z, Math.atan2(nx, nz));   // cara frontal hacia (nx, nz)
    const matTex = (tex, o = {}) => new THREE.MeshStandardMaterial({ map: tex, roughness: .6, ...o });
    const texto = (w, h, fondo, tinta, txt, px, extra) => api.canvasTex(w, h, (k, W, H) => { k.fillStyle = fondo; k.fillRect(0, 0, W, H); if (extra) extra(k, W, H);
      k.fillStyle = tinta; k.font = `bold ${px}px sans-serif`; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText(txt, W / 2, H / 2 + 2); });
    // paño con DOS caras frontales (techos y muros inclinados: el pase de normales de la oclusión ambiental descarta las caras traseras)
    const dos = (pos, mat) => { const n = pos.length / 3, P = new Float32Array(pos.length * 2); P.set(pos);
      for (let t = 0; t < n; t += 3) for (let j = 0; j < 3; j++) { const a = t + 2 - j, b = n + t + j; P[b * 3] = pos[a * 3]; P[b * 3 + 1] = pos[a * 3 + 1]; P[b * 3 + 2] = pos[a * 3 + 2]; }
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); ge.computeVertexNormals(); const m = new THREE.Mesh(ge, mat); g.add(m); return m; };
    const blanco = api.concrete(0xf2f1ec), grisMetal = api.concrete(0x8e9396, { metalness: .5, roughness: .5 }), rueda = api.concrete(0x1d1e20);

    // ── Farmatodo (km 19,34 der., OSM way 1547479272): caja blanca de un piso, techo azul a cuatro aguas, banda azul con FARMATODO
    // al frente y hacia la calle lateral, estacionamiento con carros de punta y murete gris azulado con jardineras (video t=480,5–482)
    { const A = XZ(10.4846, -66.893634), B = XZ(10.484482, -66.893493), C = XZ(10.484583, -66.893406), D = XZ(10.484701, -66.893546);
      const u = nrm(D.x - A.x, D.z - A.z), W = Math.hypot(D.x - A.x, D.z - A.z), Dp = Math.hypot(B.x - A.x, B.z - A.z); let v = nrm(B.x - A.x, B.z - A.z);
      const rr = RA(19.33); if ((rr.x - A.x) * v[0] + (rr.z - A.z) * v[1] > 0) v = [-v[0], -v[1]];   // v: hacia el fondo, lejos de la ruta
      const at = (s, d) => ({ x: A.x + u[0] * s + v[0] * d, z: A.z + u[1] * s + v[1] * d });
      const y0 = Math.min(gy(A.x, A.z), gy(B.x, B.z), gy(C.x, C.z), gy(D.x, D.z)) - .4, H = 5.4, ry = Math.atan2(-u[1], u[0]);
      const c = at(W / 2, Dp / 2); mesh(new THREE.BoxGeometry(W, H, Dp), blanco, c.x, y0 + H / 2, c.z, ry);
      // vitrina corrida y puerta en el frente
      const vit = matTex(api.canvasTex(256, 64, (k, w, h) => { k.fillStyle = '#e9ecef'; k.fillRect(0, 0, w, h); k.fillStyle = '#3b4f63'; k.fillRect(6, 10, w - 12, h - 10);
        k.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 6; x < w; x += 40) k.fillRect(x, 10, 3, h); k.fillStyle = '#1d2c3a'; k.fillRect(w * .44, 14, w * .12, h - 14); }), { roughness: .25, metalness: .3 });
      const fr = at(W / 2, -.04); plano(W - 1.2, 2.7, vit, fr.x, y0 + .4 + 1.35, fr.z, -v[0], -v[1]);
      // banda azul con el nombre: al frente (hacia la ruta) y en el costado que da a la calle lateral (el que se ve al llegar)
      const banda = (w) => matTex(texto(512, 64, '#1554a8', '#ffffff', 'FARMATODO', 40, (k, W2, H2) => { k.fillStyle = '#ffffff'; k.fillRect(0, H2 - 5, W2, 5); }));
      const yb = y0 + H - .75; plano(W - .4, 1.15, banda(), fr.x, yb, fr.z, -v[0], -v[1]);
      const lad = at(-.04, Dp / 2); plano(Dp - 3, 1.15, banda(), lad.x, yb, lad.z, -u[0], -u[1]);
      // techo azul a cuatro aguas con alero de 0,6 m, de la cornisa (y0+H) a 2,2 m más arriba, con plano superior
      const azul = api.concrete(0x1f5fb8, { roughness: .55 }), O = .6, IN = Math.min(3.4, Dp / 2 - .5), yt = y0 + H, yr = yt + 2.2;
      const base = [at(-O, -O), at(W + O, -O), at(W + O, Dp + O), at(-O, Dp + O)], top = [at(IN, IN), at(W - IN, IN), at(W - IN, Dp - IN), at(IN, Dp - IN)], pos = [];
      for (let i = 0; i < 4; i++) { const a = base[i], b = base[(i + 1) % 4], cc = top[(i + 1) % 4], d = top[i];
        pos.push(a.x, yt, a.z, b.x, yt, b.z, cc.x, yr, cc.z, a.x, yt, a.z, cc.x, yr, cc.z, d.x, yr, d.z); }
      pos.push(top[0].x, yr, top[0].z, top[1].x, yr, top[1].z, top[2].x, yr, top[2].z, top[0].x, yr, top[0].z, top[2].x, yr, top[2].z, top[3].x, yr, top[3].z);
      dos(pos, azul);
      // frontón blanco sobre la entrada (el triángulo de la esquina que se ve en t=481,5)
      { const e0 = at(W / 2 - 2.6, -O - .05), e1 = at(W / 2 + 2.6, -O - .05), ec = at(W / 2, -O - .05); dos([e0.x, yt, e0.z, e1.x, yt, e1.z, ec.x, yt + 1.7, ec.z], api.concrete(0xf4f4f0)); }
      // estacionamiento al frente (asfalto con rayas) hasta la acera, murete gris azulado con remate blanco y jardinera, y carros de punta
      const PD = 10.6, NU = 6, NV = 5, pp = [], uv = [], ix = [];
      for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) { const p = at(-1 + (W + 2) * i / NU, -PD * j / NV); pp.push(p.x, gy(p.x, p.z) + .06, p.z); uv.push(i / NU, j / NV); }
      for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) { const a = j * (NU + 1) + i, b = a + NU + 1; ix.push(a, b, a + 1, a + 1, b, b + 1); }
      const gp = new THREE.BufferGeometry(); gp.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3)); gp.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); gp.setIndex(ix); gp.computeVertexNormals();
      if (gp.attributes.normal.getY(0) < 0) { const I = gp.index.array; for (let t = 0; t < I.length; t += 3) { const q = I[t + 1]; I[t + 1] = I[t + 2]; I[t + 2] = q; } gp.computeVertexNormals(); }
      const asf = api.canvasTex(256, 128, (k, w, h) => { k.fillStyle = '#7d7e7a'; k.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { k.fillStyle = `rgba(40,40,40,${Math.random() * .12})`; k.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
        k.fillStyle = '#eceae2'; for (let i = 1; i < 7; i++) k.fillRect(w * i / 7.4, 0, 3, h * .48); k.fillRect(0, h * .48, w, 3); });
      const mp = new THREE.Mesh(gp, matTex(asf, { roughness: .95 })); mp.receiveShadow = true; g.add(mp);
      const muro = api.concrete(0x7f95a8), remate = api.concrete(0xeef0ee), jard = api.concrete(0x4d7a35, { roughness: 1 }), LW = W - 4.2, cm = at(LW / 2 - .5, -PD + .3), ym = gy(cm.x, cm.z);
      mesh(new THREE.BoxGeometry(LW, .85, .4), muro, cm.x, ym + .42, cm.z, ry); mesh(new THREE.BoxGeometry(LW, .1, .5), remate, cm.x, ym + .88, cm.z, ry);
      const cj = at(LW / 2 - .5, -PD + 1.1); mesh(new THREE.BoxGeometry(LW - .6, .5, 1.1), jard, cj.x, gy(cj.x, cj.z) + .3, cj.z, ry);
      const cuerpo = new THREE.BoxGeometry(1.8, .85, 4.3), cabina = new THREE.BoxGeometry(1.6, .6, 2.2), cols = [0xdadbd8, 0x9aa3ad, 0x2b2d33, 0xa31d22, 0xe6e6e2];
      cols.forEach((col, i) => { const p = at(1.6 + i * 2.75, -3.1), y = gy(p.x, p.z) + .06, rc = Math.atan2(v[0], v[1]), mc = api.concrete(col, { roughness: .35, metalness: .4 });
        mesh(cuerpo, mc, p.x, y + .62, p.z, rc); mesh(cabina, mc, p.x - v[0] * .3, y + 1.32, p.z - v[1] * .3, rc); mesh(new THREE.BoxGeometry(1.9, .5, 3.6), rueda, p.x, y + .25, p.z, rc); });
    }

    // ── Paradas de autobús en la acera derecha: blanca con mupi antes del Farmatodo (t=480–480,5) y azul antes de la bomba (t=485)
    const parada = (k, colTecho, colPanel, mupi) => { const p = ladoP(k, -8.75), T = new THREE.Group(); T.position.set(p.x, p.y, p.z); T.rotation.y = p.ry; g.add(T);
      const est = api.concrete(colTecho, { metalness: .4, roughness: .45 });
      mesh(new THREE.BoxGeometry(2.1, .14, 4.6), est, 0, 2.62, 0, 0, T);                                       // techo
      mesh(new THREE.BoxGeometry(.08, 1.9, 4.4), api.concrete(colPanel, { roughness: .3, metalness: .2 }), -.75, 1.35, 0, 0, T);   // espaldar (lado de afuera)
      for (const z of [-2, 2]) mesh(new THREE.BoxGeometry(.1, 2.6, .1), est, -.75, 1.3, z, 0, T);
      mesh(new THREE.BoxGeometry(.45, .08, 3.4), grisMetal, -.45, .48, 0, 0, T);                                 // banco
      if (mupi) { const cara = matTex(mupi), marco = api.concrete(colTecho); mesh(new THREE.BoxGeometry(1.3, 2.3, .25), [marco, marco, marco, marco, cara, cara], .1, 1.35, -2.75, 0, T); } };
    const mupi = api.canvasTex(64, 128, (k, w, h) => { const gr = k.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1b3f86'); gr.addColorStop(1, '#3d8ad6'); k.fillStyle = gr; k.fillRect(0, 0, w, h);
      k.fillStyle = '#f2c230'; k.beginPath(); k.arc(w / 2, h * .38, 16, 0, 7); k.fill(); k.fillStyle = '#ffffff'; k.fillRect(8, h * .7, w - 16, 6); k.fillRect(8, h * .78, w - 26, 5); });
    parada(19.268, 0xd9dcdf, 0xb9c4cc, mupi);
    parada(19.545, 0x2c5aa0, 0x9fb3c8, null);

    // ── Isla de la bocacalle tras el Farmatodo (km 19,40 der.; t=482,5–483): brocal amarillo y murete pintado de triángulos rojo, azul y verde
    { const k0 = 19.394, k1 = 19.412, a = ladoP(k0, -11.2), b = ladoP(k1, -11.2), Lw = Math.hypot(b.x - a.x, b.z - a.z), ry = Math.atan2(b.x - a.x, b.z - a.z), cx = (a.x + b.x) / 2, cz = (a.z + b.z) / 2, y = Math.max(gy(cx, cz), (a.y + b.y) / 2);
      const tri = api.canvasTex(256, 32, (k, w, h) => { k.fillStyle = '#f3f1ea'; k.fillRect(0, 0, w, h); const cs = ['#d8262f', '#1f58b5', '#2f9e44', '#f2c230'];
        for (let i = 0; i < 16; i++) { k.fillStyle = cs[i % 4]; k.beginPath(); const x = i * 16; if (i % 2) { k.moveTo(x, 0); k.lineTo(x + 16, 0); k.lineTo(x + 8, h); } else { k.moveTo(x, h); k.lineTo(x + 16, h); k.lineTo(x + 8, 0); } k.fill(); } });
      tri.wrapS = THREE.RepeatWrapping; tri.repeat.set(Lw / 8, 1); const mt = matTex(tri, { roughness: .8 });
      mesh(new THREE.BoxGeometry(3.6, .2, Lw + 3), api.concrete(0xb7b2a6), cx, y + .1, cz, ry);
      for (const s of [-1.75, 1.75]) mesh(new THREE.BoxGeometry(.22, .24, Lw + 3), api.concrete(0xe9bf22, { roughness: .8 }), cx + Math.cos(ry) * s, y + .12, cz - Math.sin(ry) * s, ry);
      mesh(new THREE.BoxGeometry(.45, .9, Lw), [mt, mt, blanco, blanco, blanco, blanco], cx, y + .65, cz, ry); }

    // ── E/S Ciudad Universitaria (PDV, OSM node 2408097116), km 19,59 der.: marquesina blanca con faja naranja y el logo, cuatro columnas,
    // dos islas de surtidores con brocal amarillo (t=485,75: se ve la faja naranja y los topes amarillos al borde derecho de la imagen)
    { const P0 = XZ(10.48607, -66.891902), P1 = XZ(10.485972, -66.891827), u = nrm(P1.x - P0.x, P1.z - P0.z), w = [-u[1], u[0]], Cg = XZ(10.486016, -66.891852);
      const L = 15, Wc = 10, ry = Math.atan2(u[0], u[1]), at = (s, d) => ({ x: Cg.x + u[0] * s + w[0] * d, z: Cg.z + u[1] * s + w[1] * d });
      let yg = Infinity; for (const [s, d] of [[-L / 2, -Wc / 2], [L / 2, -Wc / 2], [L / 2, Wc / 2], [-L / 2, Wc / 2], [0, 0]]) { const p = at(s, d); yg = Math.min(yg, gy(p.x, p.z)); }
      const rr = RA(19.585); yg = Math.max(yg, rr.y - .3); const HT = 5.1;
      mesh(new THREE.BoxGeometry(Wc, .32, L), blanco, Cg.x, yg + HT, Cg.z, ry);                                  // losa
      const naranja = api.concrete(0xe2582a, { roughness: .6 });
      for (const d of [-Wc / 2, Wc / 2]) { const p = at(0, d); mesh(new THREE.BoxGeometry(.25, .95, L + .25), naranja, p.x, yg + HT + .08, p.z, ry); }
      for (const s of [-L / 2, L / 2]) { const p = at(s, 0); mesh(new THREE.BoxGeometry(Wc, .95, .25), naranja, p.x, yg + HT + .08, p.z, ry); }
      const logo = matTex(texto(256, 32, '#e2582a', '#ffffff', 'PDV', 26, (k, W2, H2) => { k.fillStyle = '#f6c21c'; k.beginPath(); k.arc(W2 / 2 - 34, H2 / 2, 9, 0, 7); k.fill(); k.fillStyle = '#ffffff'; k.fillRect(0, H2 - 3, W2, 3); }));
      // logo en las caras de la faja que dan a la ruta y al que llega por ella
      const sv = [rr.x - Cg.x, rr.z - Cg.z], dW = (sv[0] * w[0] + sv[1] * w[1]) > 0 ? 1 : -1, dU = (rr.tx * u[0] + rr.tz * u[1]) > 0 ? -1 : 1;
      { const p = at(0, dW * (Wc / 2 + .14)); plano(L - 1, .9, logo, p.x, yg + HT + .08, p.z, w[0] * dW, w[1] * dW); }
      { const p = at(dU * (L / 2 + .14), 0); plano(Wc - 1, .9, logo, p.x, yg + HT + .08, p.z, u[0] * dU, u[1] * dU); }
      const col = new THREE.BoxGeometry(.42, HT, .42); for (const s of [-L / 2 + 3, L / 2 - 3]) for (const d of [-Wc / 2 + 2.2, Wc / 2 - 2.2]) { const p = at(s, d); mesh(col, blanco, p.x, yg + HT / 2, p.z, ry); }
      const surt = new THREE.BoxGeometry(.6, 1.65, .9), tapa = api.concrete(0xd8262f), amar = api.concrete(0xe9bf22, { roughness: .8 });
      for (const d of [-2.2, 2.2]) { const p = at(0, d); mesh(new THREE.BoxGeometry(1.3, .22, 7), amar, p.x, yg + .11, p.z, ry);
        for (const s of [-1.8, 1.8]) { const q = at(s, d); mesh(surt, blanco, q.x, yg + .22 + .82, q.z, ry); mesh(new THREE.BoxGeometry(.64, .25, .94), tapa, q.x, yg + 1.8, q.z, ry); } }
      // topes amarillos a lo largo de la acera, delante de la bomba
      for (let k = 19.572; k <= 19.6; k += .007) { const p = ladoP(k, -9.9); mesh(new THREE.BoxGeometry(.3, .5, 1.6), amar, p.x, Math.max(p.y, gy(p.x, p.z)) + .25, p.z, p.ry); }
    }

    // ── Farmacia Universitaria (OSM, km 19,645 der.): letrero verde de cruz en un poste en la acera (t=487) y rótulo en el frente del bloque crema
    { const p = ladoP(19.648, -9.7), T = new THREE.Group(); T.position.set(p.x, p.y, p.z); T.rotation.y = p.ry; g.add(T);
      const cruz = matTex(api.canvasTex(64, 128, (k, w, h) => { k.fillStyle = '#f7f7f4'; k.fillRect(0, 0, w, h); k.fillStyle = '#1f9a4a'; k.beginPath(); k.arc(w / 2, h * .36, 26, 0, 7); k.fill();
        k.fillStyle = '#ffffff'; k.fillRect(w / 2 - 6, h * .36 - 18, 12, 36); k.fillRect(w / 2 - 18, h * .36 - 6, 36, 12); k.fillStyle = '#1f9a4a'; k.font = 'bold 13px sans-serif'; k.textAlign = 'center'; k.fillText('FARMACIA', w / 2, h * .82); }));
      mesh(new THREE.CylinderGeometry(.08, .1, 4.2, 8), grisMetal, 0, 2.1, 0, 0, T);
      mesh(new THREE.BoxGeometry(.9, 1.7, .14), [blanco, blanco, blanco, blanco, cruz, cruz], 0, 4.9, 0, 0, T);
      const E0 = XZ(10.486506, -66.891161), E1 = XZ(10.486347, -66.891405), e = nrm(E1.x - E0.x, E1.z - E0.z), rr = RA(19.65); let n = [-e[1], e[0]];
      if ((rr.x - E0.x) * n[0] + (rr.z - E0.z) * n[1] < 0) n = [-n[0], -n[1]];
      const c = { x: E0.x + (E1.x - E0.x) * .62 + n[0] * .25, z: E0.z + (E1.z - E0.z) * .62 + n[1] * .25 };
      plano(9, .95, matTex(texto(512, 56, '#ffffff', '#1f9a4a', 'FARMACIA UNIVERSITARIA', 34, (k, W2, H2) => { k.fillStyle = '#1f9a4a'; k.fillRect(0, 0, W2, 5); k.fillRect(0, H2 - 5, W2, 5); })), c.x, gy(c.x, c.z) + 3.5, c.z, n[0], n[1]); }

    // ── Rótulos de planta baja de la torre verde pálido (OSM: Panadería Los Símbolos y Farmacia Los Próceres, km 19,21–19,235 der.)
    { const E0 = XZ(10.484065, -66.894306), E1 = XZ(10.483881, -66.894528), e = nrm(E1.x - E0.x, E1.z - E0.z), rr = RA(19.22); let n = [-e[1], e[0]];
      if ((rr.x - E0.x) * n[0] + (rr.z - E0.z) * n[1] < 0) n = [-n[0], -n[1]];
      const pon = (f, mat) => { const c = { x: E0.x + (E1.x - E0.x) * f + n[0] * .3, z: E0.z + (E1.z - E0.z) * f + n[1] * .3 }; plano(7, .9, mat, c.x, gy(c.x, c.z) + 3.4, c.z, n[0], n[1]); };
      pon(.2, matTex(texto(512, 64, '#7a3b1e', '#f6e3b4', 'PANADERÍA LOS SÍMBOLOS', 36)));
      pon(.72, matTex(texto(512, 64, '#ffffff', '#1f9a4a', 'FARMACIA LOS PRÓCERES', 32, (k, W2, H2) => { k.fillStyle = '#1f9a4a'; k.fillRect(0, H2 - 6, W2, 6); k.fillRect(14, H2 / 2 - 14, 8, 28); k.fillRect(4, H2 / 2 - 4, 28, 8); }))); }

    // ── Quiosco del mural (niño leyendo sobre el globo terráqueo, fondo azul y verde), km 19,703 der. (t=487–487,5)
    { const p = ladoP(19.703, -11.6), y = Math.max(p.y, gy(p.x, p.z));
      const mural = matTex(api.canvasTex(256, 128, (k, w, h) => { const gr = k.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2c5fb0'); gr.addColorStop(.6, '#2e8f8a'); gr.addColorStop(1, '#5aa646'); k.fillStyle = gr; k.fillRect(0, 0, w, h);
        k.fillStyle = '#3b7fd0'; k.beginPath(); k.arc(w * .3, h * .55, 38, 0, 7); k.fill(); k.fillStyle = '#5bb24a'; k.beginPath(); k.ellipse(w * .26, h * .5, 16, 22, .4, 0, 7); k.fill();
        k.fillStyle = '#f2c230'; k.beginPath(); k.ellipse(w * .7, h * .72, 30, 34, 0, 0, 7); k.fill(); k.fillStyle = '#e9b48a'; k.beginPath(); k.arc(w * .7, h * .32, 17, 0, 7); k.fill();
        k.fillStyle = '#3a2618'; k.beginPath(); k.arc(w * .7, h * .27, 17, Math.PI, 0); k.fill(); k.fillStyle = '#f4f1e6'; k.fillRect(w * .58, h * .58, 60, 20); k.fillStyle = '#c84a32'; k.fillRect(w * .58, h * .58, 60, 4); }));
      mesh(new THREE.BoxGeometry(2.6, 2.8, 4.4), [mural, mural, api.concrete(0xd9d6cc), blanco, mural, mural], p.x, y + 1.4, p.z, p.ry); }

    // ── Tótem de Toyota / C.A. Cars (km 19,912 der., t=493,5): dos postes blancos, logo rojo, «C.A. Cars» y Ventas · Repuestos · Servicio
    { const p = ladoP(19.912, -9.9), T = new THREE.Group(); T.position.set(p.x, Math.max(p.y, gy(p.x, p.z)), p.z); T.rotation.y = p.ry; g.add(T);
      const cara = matTex(api.canvasTex(128, 512, (k, w, h) => { k.fillStyle = '#f7f7f5'; k.fillRect(0, 0, w, h); k.strokeStyle = '#d0262c'; k.lineWidth = 7; k.beginPath(); k.ellipse(w / 2, 70, 40, 27, 0, 0, 7); k.stroke();
        k.beginPath(); k.ellipse(w / 2, 62, 17, 10, 0, 0, 7); k.stroke(); k.beginPath(); k.ellipse(w / 2, 74, 7, 22, 0, 0, 7); k.stroke(); k.fillStyle = '#d0262c'; k.font = 'bold 25px sans-serif'; k.textAlign = 'center'; k.fillText('TOYOTA', w / 2, 132);
        k.fillStyle = '#dcdcd8'; k.fillRect(0, 160, w, 3); k.fillStyle = '#2b2d33'; k.font = 'bold 20px sans-serif'; k.fillText('C.A. Cars', w / 2, 200);
        k.fillStyle = '#dcdcd8'; k.fillRect(0, 240, w, 3); k.fillStyle = '#2b2d33'; k.font = '17px sans-serif'; ['Ventas', 'Repuestos', 'Servicio'].forEach((s, i) => { k.fillText(s, w / 2, 300 + i * 46); k.fillRect(10, 316 + i * 46, w - 20, 2); }); }));
      for (const x of [-.75, .75]) mesh(new THREE.BoxGeometry(.25, 9.2, .25), blanco, x, 4.6, 0, 0, T);
      mesh(new THREE.BoxGeometry(1.25, 5.4, .3), [blanco, blanco, blanco, blanco, cara, cara], 0, 6.2, 0, 0, T); }
  }

  // ═════════ UCV (km 19,2–20,1), 2.ª ronda del 19-nov: hongos-farola, esculturas, plaza de las banderas, Plaza Las Tres Gracias y reja de Cars ═════════
  // Video (capó visible): t=479,5 farola-hongo turquesa der. · t=480 hongo rojo der. junto a la parada · t=481,5 turquesa der. · t=482 rojo en la isla der. ·
  // t=482,5 verde der. y hongo rojo en el parque izq. · t=483 hongo azul izq. · t=486,3 amarillo izq. y farola de hongo rojo con lunares der. ·
  // t=487,3 farola de hongo rosado der. · t=488,3 hongo azul grande izq. · t=492,7 hongo rojo izq. · t=493,3 flor azul izq. · t=493,7 farola rosada der.
  // Plaza de las banderas frente a la estación Ciudad Universitaria (OSM), izq. km 19,95 (t=494–497, cámara girada): ~16 astas altas con la bandera
  // nacional y la tricolor roja, azul y verde; hongo amarillo con huecos, flor roja, hongo turquesa, flor azul, palmas.
  // Plaza Las Tres Gracias (OSM leisure=park, Q6080014): la «placita» del cruce a la derecha del km 19,91 (Calle Las Tres Gracias) que vio el dueño,
  // entre esa calle y la Av. Bellas Artes (19,97). Foto satelital: franja de ~26 × 75 m con árboles y un estanque alargado. La escultura de las
  // tres gracias va por el nombre (no se ve en el video ni en la foto).
  { const tex = (w, h, draw) => { const t = api.canvasTex(w, h, draw); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
    const XZ = (la, lo) => api.xz(la, lo), G = suelo, nrm = (x, z) => { const l = Math.hypot(x, z) || 1; return [x / l, z / l]; };
    const ladoP = (k, d) => { const r = RA(k); return { x: r.x + r.lx * d, z: r.z + r.lz * d, y: r.y, r, ry: Math.atan2(r.tx, r.tz) }; };
    const mesh = (geo, mat, x, y, z, ry = 0, p = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; };
    const blanco = api.concrete(0xf1eee6), verdeF = api.concrete(0x1f3a2c, { roughness: .5, metalness: .35 });
    const capCache = {}, capMat = (hex, pun) => capCache[hex + pun] || (capCache[hex + pun] = new THREE.MeshStandardMaterial({ roughness: .4, metalness: .12, map: api.canvasTex(128, 64, (c, w, h) => { c.fillStyle = hex; c.fillRect(0, 0, w, h);
      c.fillStyle = pun; for (let i = 0; i < 16; i++) { c.beginPath(); c.arc((i * 37) % w, 6 + (i * 23) % (h - 18), 4 + (i % 3) * 2, 0, 7); c.fill(); } }) }));
    const somG = new THREE.SphereGeometry(1, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2), talloG = new THREE.CylinderGeometry(.42, .62, 1, 12), discoG = new THREE.CircleGeometry(.98, 18); discoG.rotateX(Math.PI / 2);
    // hongo escultura: tallo claro y sombrero (H alto total, Rc radio del sombrero); pun = color de los lunares o huecos
    const hongo = (x, y, z, hex, pun, H, Rc, tallo = 0xf1eee6) => { const t = mesh(talloG, api.concrete(tallo), x, y + H * .3, z); t.scale.set(Rc * .45, H * .6, Rc * .45);
      const c = mesh(somG, capMat(hex, pun), x, y + H * .58, z); c.scale.set(Rc, Rc * .62, Rc); const b = mesh(discoG, blanco, x, y + H * .58, z); b.scale.set(Rc, 1, Rc); };
    // flor de seis pétalos sobre su vara (de cara a la ruta)
    const petG = new THREE.SphereGeometry(1, 10, 6); petG.scale(.32, .55, .1); petG.translate(0, .55, 0);
    const flor = (x, y, z, hex, H, ry) => { const F = new THREE.Group(); F.position.set(x, y, z); F.rotation.y = ry; g.add(F); mesh(new THREE.CylinderGeometry(.05, .07, H, 6), verdeF, 0, H / 2, 0, 0, F);
      const pm = api.concrete(hex, { roughness: .45 }); for (let i = 0; i < 6; i++) { const p = mesh(petG, pm, 0, H, 0, 0, F); p.rotation.z = i * Math.PI / 3; p.scale.setScalar(1.5); }
      const c = mesh(new THREE.SphereGeometry(.3, 10, 8), api.concrete(0xf2c230), 0, H, .08, 0, F); c.scale.z = .5; };
    // farola de la avenida coronada con un hongo (poste verde oscuro)
    const farola = (k, lat, hex, pun) => { const p = ladoP(k, lat), y = Math.max(p.y, G(p.x, p.z)); mesh(new THREE.CylinderGeometry(.09, .13, 4.6, 8), verdeF, p.x, y + 2.3, p.z);
      mesh(new THREE.CylinderGeometry(.2, .2, .3, 8), verdeF, p.x, y + .15, p.z); hongo(p.x, y + 4.3, p.z, hex, pun, 1.2, .62, 0xe9e6dc); };
    farola(19.228, -9.4, '#2fb3b8', '#e9f6f6'); farola(19.252, -9.6, '#d8262f', '#fbf3ea'); farola(19.318, -9.4, '#2fb3b8', '#e9f6f6');
    farola(19.36, -8.9, '#d8262f', '#fbf3ea'); farola(19.378, -9.4, '#6cc04a', '#e8f7df'); farola(19.628, -9.5, '#d8262f', '#ffffff');
    farola(19.69, -9.5, '#e85a9a', '#ffffff'); farola(19.905, -9.6, '#e85a9a', '#ffffff');
    // esculturas en el parque de la izquierda (Paseo Los Ilustres)
    const enParque = (k, lat) => { const p = ladoP(k, lat); return [p.x, G(p.x, p.z), p.z, p.ry]; };
    { let [x, y, z] = enParque(19.376, 11); hongo(x, y, z, '#d8262f', '#fbf3ea', 2.6, 1.5);
      [x, y, z] = enParque(19.405, 13.5); hongo(x, y, z, '#2a62c9', '#e8eefc', 2.8, 1.6);
      [x, y, z] = enParque(19.628, 10.5); hongo(x, y, z, '#f2c81e', '#c99a10', 2.4, 1.7);
      [x, y, z] = enParque(19.732, 10); hongo(x, y, z, '#2a7fc9', '#d7ecfb', 3.4, 2.1);
      [x, y, z] = enParque(19.872, 10.5); hongo(x, y, z, '#d8262f', '#fbf3ea', 2.2, 1.3);
      let ry; [x, y, z, ry] = enParque(19.892, 11.5); flor(x, y, z, '#2a6fd0', 2.2, ry + Math.PI); }

    // ── plaza de las banderas (izq. km 19,92–20,0): astas en corona alrededor del óvalo de grama, esculturas y palmas
    { const C = XZ(10.488139, -66.889170), mast = new THREE.CylinderGeometry(.07, .11, 13, 6), bl = api.concrete(0xf4f4f0);
      const ve = api.canvasTex(96, 64, (c, w, h) => { c.fillStyle = '#f2c51e'; c.fillRect(0, 0, w, h / 3); c.fillStyle = '#1f4ea0'; c.fillRect(0, h / 3, w, h / 3); c.fillStyle = '#cf1f2f'; c.fillRect(0, h * 2 / 3, w, h / 3); c.fillStyle = '#fff'; for (let i = 0; i < 8; i++) { const a = Math.PI * (.15 + .7 * i / 7); c.beginPath(); c.arc(w / 2 - Math.cos(a) * 14, h / 2 + 8 - Math.sin(a) * 12, 1.6, 0, 7); c.fill(); } });
      const tri = api.canvasTex(96, 64, (c, w, h) => { c.fillStyle = '#d0202c'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a8a3a'; c.beginPath(); c.moveTo(w, 0); c.lineTo(w, h); c.lineTo(w * .35, h); c.fill(); c.fillStyle = '#2050b0'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w * .55, h * .5); c.lineTo(0, h); c.fill(); });
      const mV = new THREE.MeshStandardMaterial({ map: ve, side: THREE.DoubleSide, roughness: .8 }), mT = new THREE.MeshStandardMaterial({ map: tri, side: THREE.DoubleSide, roughness: .8 });
      const tela = new THREE.PlaneGeometry(2.7, 1.8, 6, 1); tela.translate(1.35, 0, 0); { const pa = tela.attributes.position; for (let i = 0; i < pa.count; i++) pa.setZ(i, Math.sin(pa.getX(i) * 2) * .22); }
      const ruta = []; for (let k = 19.88; k <= 20.06; k += .005) ruta.push(RA(k));
      let n = 0; for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, x = C.x + Math.cos(a) * 19, z = C.z + Math.sin(a) * 19; if (ruta.some(p => Math.hypot(p.x - x, p.z - z) < 11)) continue;
        const yb = G(x, z); mesh(mast, bl, x, yb + 6.5, z); const f = mesh(tela, n++ % 2 ? mT : mV, x, yb + 12, z); f.rotation.y = .7 + Math.sin(i * 1.7) * .3; }}
    { const pl = (k, lat) => { const p = ladoP(k, lat); return [p.x, G(p.x, p.z), p.z, p.ry]; };
      let [x, y, z, ry] = pl(19.958, 11.5); hongo(x, y, z, '#f2c81e', '#b8890c', 2.6, 2.1);
      [x, y, z] = pl(19.968, 14); flor(x, y, z, '#d8262f', 2.6, ry + Math.PI);
      [x, y, z] = pl(19.976, 12.5); hongo(x, y, z, '#26b3bf', '#cfeff2', 2.9, 1.6);
      [x, y, z] = pl(19.99, 15); flor(x, y, z, '#2a6fd0', 2.3, ry + Math.PI);
      [x, y, z] = pl(20.03, 12); hongo(x, y, z, '#f07a2a', '#fde3c8', 2.6, 1.7);
      [x, y, z] = pl(20.04, 15); hongo(x, y, z, '#e85a9a', '#ffffff', 1.6, 1.0); }

    // ── Cars / Toyota (19,80–19,905 der.): reja gris de barrotes a lo largo de la acera (t=489,3–493,5)
    { const barro = new THREE.BoxGeometry(.05, 1, .05), gris = api.concrete(0x9a9ea1, { metalness: .5, roughness: .5 }), mats = [], M4 = new THREE.Matrix4();
      for (let k = 19.80; k <= 19.903; k += .00018) { const p = ladoP(k, -9.7), y = Math.max(p.y, G(p.x, p.z)); M4.makeScale(1, 2.2, 1).setPosition(p.x, y + 1.1, p.z); mats.push(M4.clone()); }
      const im = new THREE.InstancedMesh(barro, gris, mats.length); mats.forEach((m, i) => im.setMatrixAt(i, m)); g.add(im);
      for (const hy of [.12, 2.15]) muro(19.80, 19.903, -9.72, (k, p) => p.y + hy + .1, gris, 1, (k, p) => p.y + hy);
      const poste = new THREE.BoxGeometry(.12, 2.4, .12); for (let k = 19.80; k <= 19.904; k += .0025) { const p = ladoP(k, -9.7); mesh(poste, gris, p.x, Math.max(p.y, G(p.x, p.z)) + 1.2, p.z); } }

    // ── Jardinera de la esquina de la Calle Codazzi (19,75 der., t=488,7): murete con flores rojas (las palmas van en `arboles`)
    { const p = ladoP(19.752, -12), y = Math.max(p.y, G(p.x, p.z)); mesh(new THREE.BoxGeometry(3.2, .7, 7), api.concrete(0xd9d3c4), p.x, y + .35, p.z, p.ry);
      const fl = mesh(new THREE.BoxGeometry(2.8, .5, 6.6), api.concrete(0x2f6b2a, { roughness: 1 }), p.x, y + .8, p.z, p.ry); fl.scale.y = 1;
      const roja = api.concrete(0xc8202a, { roughness: .9 }); for (let i = 0; i < 9; i++) mesh(new THREE.SphereGeometry(.35, 8, 6), roja, p.x + p.r.tx * (i - 4) * .7 + p.r.lx * ((i % 2) - .5) * .9, y + 1.15, p.z + p.r.tz * (i - 4) * .7 + p.r.lz * ((i % 2) - .5) * .9); }

    // ── Plaza Las Tres Gracias y sus dos bocacalles (Calle Las Tres Gracias, 19,91 der.; Av. Bellas Artes, 19,97 der.)
    { const rutaP = []; for (let k = 19.85; k <= 20.05; k += .004) rutaP.push(RA(k));
      const dRuta = (x, z) => { let b = 1e9; for (const p of rutaP) b = Math.min(b, Math.hypot(p.x - x, p.z - z)); return b; };
      const asf = api.concrete(0x55565a, { roughness: .95 });
      const calle = (ll, w) => { const p0 = ll.map(([a, b]) => XZ(a, b)), p = []; for (let i = 0; i < p0.length - 1; i++) { const L = Math.hypot(p0[i + 1].x - p0[i].x, p0[i + 1].z - p0[i].z), n = Math.max(1, Math.round(L / 2.5)); for (let j = 0; j < n; j++) p.push({ x: p0[i].x + (p0[i + 1].x - p0[i].x) * j / n, z: p0[i].z + (p0[i + 1].z - p0[i].z) * j / n }); } p.push(p0[p0.length - 1]);
        const pos = []; let prev = null;
        for (let i = 0; i < p.length; i++) { const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)], [tx, tz] = nrm(b.x - a.x, b.z - a.z), q = p[i]; if (dRuta(q.x, q.z) < 7.6) { prev = null; continue; }
          const L = { x: q.x + tz * w / 2, z: q.z - tx * w / 2 }, Rr = { x: q.x - tz * w / 2, z: q.z + tx * w / 2 }; L.y = G(L.x, L.z) + .2; Rr.y = G(Rr.x, Rr.z) + .2;
          if (prev) { const [A, B] = prev; for (const T of [[A, B, L], [B, Rr, L]]) { const [u, v, w2] = T, ny = (v.z - u.z) * (w2.x - u.x) - (v.x - u.x) * (w2.z - u.z); for (const V of ny >= 0 ? [u, v, w2] : [u, w2, v]) pos.push(V.x, V.y, V.z); } } prev = [L, Rr]; }
        const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.computeVertexNormals(); const m = new THREE.Mesh(ge, asf); m.receiveShadow = true; g.add(m); };
      calle([[10.4878, -66.889348], [10.487723, -66.889136], [10.487026, -66.88875]], 8);
      calle([[10.488055, -66.888858], [10.487846, -66.888856], [10.487795, -66.888833], [10.487701, -66.88878], [10.487175, -66.888485]], 7.5);
      // la plaza: losa de adoquín con franjas de grama junto a las calles, brocal gris, estanque alargado, árboles (lista `arboles`), bancos y farolas
      const POL = [[10.48776, -66.889095], [10.487838, -66.888902], [10.487774, -66.888874], [10.487679, -66.88882], [10.48724, -66.888574], [10.4871, -66.888739]].map(([a, b]) => XZ(a, b));
      const POOL = [[10.487691, -66.888985], [10.487665, -66.888922], [10.487576, -66.888869], [10.487505, -66.888842], [10.487496, -66.888869], [10.487567, -66.888913], [10.487629, -66.888967]].map(([a, b]) => XZ(a, b));
      const dentro = (P0, x, z) => { let c = false; for (let i = 0, j = P0.length - 1; i < P0.length; j = i++) { const a = P0[i], b = P0[j]; if ((a.z > z) !== (b.z > z) && x < (b.x - a.x) * (z - a.z) / (b.z - a.z) + a.x) c = !c; } return c; };
      const dBorde = (P0, x, z) => { let b = 1e9; for (let i = 0; i < P0.length; i++) { const a = P0[i], c = P0[(i + 1) % P0.length], ux = c.x - a.x, uz = c.z - a.z, t = Math.max(0, Math.min(1, ((x - a.x) * ux + (z - a.z) * uz) / (ux * ux + uz * uz))); b = Math.min(b, Math.hypot(a.x + ux * t - x, a.z + uz * t - z)); } return b; };
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; POL.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); });
      const adoq = new THREE.MeshStandardMaterial({ roughness: .95, map: tex(128, 128, (k, w, h) => { k.fillStyle = '#b9a690'; k.fillRect(0, 0, w, h); k.strokeStyle = 'rgba(90,70,55,.35)'; k.lineWidth = 2; for (let i = 0; i <= 8; i++) { k.beginPath(); k.moveTo(0, i * 16); k.lineTo(w, i * 16); k.stroke(); k.beginPath(); k.moveTo(i * 16, 0); k.lineTo(i * 16, h); k.stroke(); } }) });
      const grama = new THREE.MeshStandardMaterial({ roughness: 1, map: tex(128, 128, (k, w, h) => { k.fillStyle = '#5f8a3c'; k.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { k.fillStyle = `rgba(${70 + Math.random() * 50},${105 + Math.random() * 50},45,.6)`; k.fillRect(Math.random() * w, Math.random() * h, 2, 3); } }) });
      const agua = new THREE.MeshStandardMaterial({ color: 0x3f7f8c, roughness: .12, metalness: .3 });
      const capas = { a: [], gr: [], w: [] }, D1 = 1.5;
      for (let x = x0; x < x1; x += D1) for (let z = z0; z < z1; z += D1) { const cx = x + D1 / 2, cz = z + D1 / 2; if (!dentro(POL, cx, cz)) continue;
        const k = dentro(POOL, cx, cz) ? 'w' : dBorde(POL, cx, cz) < 3.2 ? 'gr' : 'a', dy = k === 'w' ? .08 : k === 'gr' ? .32 : .2;
        const q = [[x, z], [x, z + D1], [x + D1, z + D1], [x + D1, z]].map(([a, b]) => [a, G(a, b) + dy, b]); capas[k].push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]); }
      for (const [k, mat] of [['a', adoq], ['gr', grama], ['w', agua]]) { if (!capas[k].length) continue; const ge = new THREE.BufferGeometry(); const pos = capas[k], uv = [];
        for (let i = 0; i < pos.length; i += 3) uv.push(pos[i] / 3, pos[i + 2] / 3); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.computeVertexNormals();
        if (ge.attributes.normal.getY(0) < 0) { const P0 = ge.attributes.position.array; for (let t = 0; t < P0.length; t += 9) for (let j = 0; j < 3; j++) { const a = P0[t + 3 + j]; P0[t + 3 + j] = P0[t + 6 + j]; P0[t + 6 + j] = a; } ge.computeVertexNormals(); }
        const m = new THREE.Mesh(ge, mat); m.receiveShadow = true; g.add(m); }
      // brocales: borde de la plaza y murete del estanque
      const gris = api.concrete(0xc9c5bb), bm = [], M4 = new THREE.Matrix4(), Qq = new THREE.Quaternion(), Ee = new THREE.Euler(), Sv = new THREE.Vector3(), Pv = new THREE.Vector3();
      const tramoB = (a, b, w, h, y) => { const L = Math.hypot(b.x - a.x, b.z - a.z); Ee.set(0, Math.atan2(-(b.z - a.z), b.x - a.x), 0); Qq.setFromEuler(Ee); bm.push(M4.compose(Pv.set((a.x + b.x) / 2, y + h / 2, (a.z + b.z) / 2), Qq, Sv.set(L + .1, h, w)).clone()); };
      for (const [P0, h] of [[POL, .4], [POOL, .5]]) for (let i = 0; i < P0.length; i++) { const a = P0[i], b = P0[(i + 1) % P0.length], n = Math.max(1, Math.round(Math.hypot(b.x - a.x, b.z - a.z) / 3));
        for (let j = 0; j < n; j++) { const p = { x: a.x + (b.x - a.x) * j / n, z: a.z + (b.z - a.z) * j / n }, q = { x: a.x + (b.x - a.x) * (j + 1) / n, z: a.z + (b.z - a.z) * (j + 1) / n }; tramoB(p, q, .3, h, Math.min(G(p.x, p.z), G(q.x, q.z)) - .05); } }
      { const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), gris, bm.length); bm.forEach((m, i) => im.setMatrixAt(i, m)); g.add(im); }
      // las tres gracias: tres figuras de piedra clara de espaldas, tomadas de las manos, sobre un pedestal en una pila redonda al norte del estanque
      { const c = XZ(10.48773, -66.888965), y = G(c.x, c.z), piedra = api.concrete(0xe6e1d4, { roughness: .7 });
        mesh(new THREE.CylinderGeometry(2.6, 2.7, .5, 24), gris, c.x, y + .25, c.z); mesh(new THREE.CircleGeometry(2.35, 24).rotateX(-Math.PI / 2), agua, c.x, y + .45, c.z);
        mesh(new THREE.CylinderGeometry(.9, 1.05, 1.5, 12), piedra, c.x, y + 1.2, c.z);
        for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3, F = new THREE.Group(); F.position.set(c.x + Math.cos(a) * .42, y + 1.95, c.z + Math.sin(a) * .42); F.rotation.y = -a + Math.PI / 2; g.add(F);
          mesh(new THREE.CylinderGeometry(.2, .3, 1.15, 10), piedra, 0, .58, 0, 0, F); mesh(new THREE.CylinderGeometry(.17, .22, .7, 10), piedra, 0, 1.45, 0, 0, F);
          mesh(new THREE.SphereGeometry(.15, 10, 8), piedra, 0, 1.95, 0, 0, F); const br = mesh(new THREE.CylinderGeometry(.05, .05, .75, 6), piedra, .28, 1.5, 0, 0, F); br.rotation.z = 1.1; } }
      // bancos y farolas
      for (const [la, lo, r] of [[10.48762, -66.889035, .4], [10.48745, -66.88893, .4], [10.48758, -66.88882, .4], [10.48738, -66.88878, .4]]) { const p = XZ(la, lo), y = G(p.x, p.z) + .2; mesh(new THREE.BoxGeometry(1.8, .45, .6), gris, p.x, y + .22, p.z, r + 2.6); }
      const globo = api.glow(0xf6f3e8, { dia: .25, noche: 2 });
      for (const [la, lo] of [[10.48779, -66.88899], [10.48752, -66.88898], [10.48745, -66.88875], [10.48725, -66.88871]]) { const p = XZ(la, lo), y = G(p.x, p.z) + .2; mesh(new THREE.CylinderGeometry(.08, .12, 4, 8), verdeF, p.x, y + 2, p.z); mesh(new THREE.SphereGeometry(.3, 10, 8), globo, p.x, y + 4.2, p.z); } }
  }

  return api.sombras(g);
}
