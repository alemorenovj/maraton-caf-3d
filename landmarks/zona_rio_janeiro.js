// Zona rio_janeiro (km 26,8–32,6): lo singular de la Av. Araure y la Av. Río de Janeiro que el video muestra y el generador no da.
// - Muro de piedra con reja negra encima y, a continuación, muro de contención de concreto acanalado con reja (km 29,42–29,76 der.; f_0284–f_0285).
// - Puente de la Río de Janeiro sobre la Av. Principal de Macaracuay, baranda de balaustres blancos (ida 30,45–30,58, t=727 s). La vuelta no lo
//   cruza: baja por la Calle Santa Margarita (bolardos amarillos de la T, km 32,03–32,10) y pasa por debajo en el 32,30–32,36 (t=754,5 s).
//   Esos km del tramo 31,92–32,61 son km del simulador dentro del nudo de km (ver el encabezado de fx/correcciones/rio_janeiro.js).
// - Postes de alumbrado de doble brazo en la isla central de la Río de Janeiro (km 28,78–30,45).
// - Valla rosada sobre poste alto junto al galpón gris (km 28,40 der.; f_0278).
// Trazado 2 (19-nov-2026): desde el 28,79 la ida va por el centro de la calzada sur. Todo lo de este módulo se mide desde el borde que dibuja
// el motor (muro a 8,6 m der., postes en la isla a 8,4 m izq., balaustradas a ±7,05 m), así que acompaña al eje nuevo sin cambiar números;
// revisado contra la foto satelital: el muro de piedra y la isla quedan donde el video los pone.
// Altura: todo se apoya en la cota de la calzada, routeAt(km).y. En el juego api.EX ≠ 0 y routeAt ya viene exagerada (EX = 1 aquí);
// en el banco (api.EX = 0) se multiplica por la exageración. Nada de este módulo se apoya en api.ground ni suma el relieve lateral:
// los muros y barandas van a la cota de la vía.
export const meta = { id: 'zona_rio_janeiro', nombre: 'Zona rio_janeiro (Araure y Río de Janeiro)', quita: [] };

export function build(THREE, api) {
  const g = new THREE.Group();
  let EX = 1;
  try { if (!/test\.html/.test(location.pathname)) EX = (api.D.meta.exag || 1) * (+new URLSearchParams(location.search).get('relieve') || 1.5); } catch (e) { EX = 1; }
  if (api.EX) EX = 1;
  // punto a d m a la IZQUIERDA del eje (negativo = derecha), con la cota de la ruta ya exagerada
  const at = (km, d) => { const p = api.routeAt(km); return { x: p.x + p.lx * d, z: p.z + p.lz * d, y: p.y * EX, tx: p.tx, tz: p.tz, lx: p.lx, lz: p.lz }; };
  const DS = 3;
  // cinta vertical a lo largo de la ruta entre km0 y km1, a d m del eje, de y=dy0 a y=dy1 sobre la ruta; uLen = metros por repetición de textura
  const cinta = (km0, km1, d, dy0, dy1, mat, uLen = 10) => {
    const pos = [], uv = [], idx = []; const L = (km1 - km0) * 1000, n = Math.max(1, Math.round(L / DS));
    for (let i = 0; i <= n; i++) { const km = km0 + (km1 - km0) * i / n, p = at(km, d), s = L * i / n;
      pos.push(p.x, p.y + dy0, p.z, p.x, p.y + dy1, p.z); uv.push(s / uLen, 0, s / uLen, 1);
      if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat); g.add(m); return m; };
  // barrotes repetidos (reja / balaustres) a lo largo de la ruta
  const barrotes = (km0, km1, d, y0, h, paso, geo, mat) => {
    const L = (km1 - km0) * 1000, n = Math.max(1, Math.floor(L / paso)), im = new THREE.InstancedMesh(geo, mat, n), q = new THREE.Object3D();
    for (let i = 0; i < n; i++) { const km = km0 + (km1 - km0) * (i + .5) / n, p = at(km, d); q.position.set(p.x, p.y + y0 + h / 2, p.z); q.rotation.set(0, Math.atan2(p.tx, p.tz), 0); q.updateMatrix(); im.setMatrixAt(i, q.matrix); }
    g.add(im); return im; };
  // paño con DOS caras frontales (triángulos duplicados al revés, vértices propios): la oclusión ambiental descarta las caras traseras
  // y un paño que mostrara su cara trasera a la vía se llenaría de manchas negras (ver dos() en zona_mercedes.js)
  const dosCaras = (m) => { const s0 = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry, p = s0.attributes.position.array, uv = s0.attributes.uv.array, n = p.length / 3;
    const P = new Float32Array(p.length * 2), U = new Float32Array(uv.length * 2); P.set(p); U.set(uv);
    for (let t = 0; t < n; t += 3) for (let j = 0; j < 3; j++) { const a = t + 2 - j, b = n + t + j; P[b * 3] = p[a * 3]; P[b * 3 + 1] = p[a * 3 + 1]; P[b * 3 + 2] = p[a * 3 + 2]; U[b * 2] = uv[a * 2]; U[b * 2 + 1] = uv[a * 2 + 1]; }
    const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); o.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); o.computeVertexNormals();
    m.geometry.dispose(); m.geometry = o; m.material.side = THREE.FrontSide; return m; };

  // ───────── Muro de piedra y muro de contención acanalado, con reja negra encima (km 29,42–29,76 der.) ─────────
  const piedra = api.canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#9a958a'; c.fillRect(0, 0, w, h); let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let y = 0; y < h; y += 14) for (let x = -(y % 28); x < w; x += 18 + r() * 14) { const v = 130 + r() * 60 | 0; c.fillStyle = `rgb(${v},${v - 4},${v - 12})`; c.beginPath(); c.ellipse(x + 9, y + 7, 9 + r() * 4, 6 + r() * 2, r(), 0, 7); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, 0, w, 6); });
  piedra.wrapS = THREE.RepeatWrapping;
  const acanalado = api.canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#b9b6ad'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { const gr = c.createLinearGradient(x, 0, x + 32, 0); gr.addColorStop(0, '#d6d3ca'); gr.addColorStop(.45, '#c4c1b8'); gr.addColorStop(.55, '#8f8c84'); gr.addColorStop(1, '#a9a69d'); c.fillStyle = gr; c.fillRect(x, 0, 32, h); }
    c.fillStyle = 'rgba(70,60,40,.22)'; c.fillRect(0, h * .82, w, h * .18); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, 0, w, 5); });
  acanalado.wrapS = THREE.RepeatWrapping;
  const dM = -8.6;   // cara del muro: justo detrás de la acera derecha
  cinta(29.42, 29.565, dM, -.6, 3.2, new THREE.MeshStandardMaterial({ map: piedra, roughness: .95, side: THREE.DoubleSide }), 6);
  cinta(29.565, 29.76, dM, -.6, 4.6, new THREE.MeshStandardMaterial({ map: acanalado, roughness: .9, side: THREE.DoubleSide }), 4);
  // corona del muro y reja negra de barrotes con pasamanos
  const negro = api.concrete(0x23262a, { roughness: .6, metalness: .3 });
  cinta(29.42, 29.565, dM - .25, 3.2, 3.35, api.concrete(0x8c8a84), 4);
  for (const [k0, k1, y0] of [[29.42, 29.565, 3.2], [29.565, 29.76, 4.6]]) {
    barrotes(k0, k1, dM - .2, y0, 2.1, .16, new THREE.BoxGeometry(.035, 2.1, .035), negro);
    for (const yy of [y0 + .15, y0 + 2.05]) cinta(k0, k1, dM - .2, yy, yy + .07, negro, 4);
    barrotes(k0, k1, dM - .2, y0, 2.2, 2.5, new THREE.BoxGeometry(.09, 2.2, .09), negro); }

  // ───────── Puente de la Río de Janeiro sobre la Av. Principal de Macaracuay: baranda de balaustres blancos ─────────
  // ida km 30,45–30,58 (tablero `elevado` en las correcciones; routeAt ya trae su altura). El motor dibuja en todo elevado una baranda
  // amarilla semitransparente a ROAD_W/2 + .8 m; la balaustrada va justo por dentro (7,05 m) con un paño blanco detrás que la tapa.
  const blanco = api.concrete(0xe9e7e0), blancoSombra = api.concrete(0xcfccc3);
  const balaustrada = (k0, k1, d) => {
    cinta(k0, k1, d, -.4, .25, blancoSombra, 4);                    // zócalo
    cinta(k0, k1, d + Math.sign(d) * .18, .2, 1.0, blancoSombra, 4);   // paño de fondo
    cinta(k0, k1, d, .95, 1.12, blanco, 4); cinta(k0, k1, d + .12, .95, 1.12, blanco, 4); cinta(k0, k1, d - .12, .95, 1.12, blanco, 4);
    barrotes(k0, k1, d, .25, .7, .32, new THREE.CylinderGeometry(.07, .09, .7, 6), blanco);   // balaustres
    barrotes(k0, k1, d, -.4, 1.5, 2.6, new THREE.BoxGeometry(.32, 1.5, .32), blanco);        // pilaretes
  };
  for (const d of [7.05, -7.05]) balaustrada(30.445, 30.585, d);

  // carteles verdes en un pórtico de bandera justo antes del puente, vistos por la vuelta (km 32,285; t=754 s)
  { const cartel = (lineas) => new THREE.MeshStandardMaterial({ map: api.canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#0d6b3a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 5; c.strokeRect(6, 6, w - 12, h - 12);
      c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = 'bold 22px sans-serif'; lineas.forEach((t, i) => c.fillText(t, w / 2, 34 + i * 26)); c.fillText('↓', w / 2, h - 14); }), roughness: .5 });
    const p = at(32.285, 0), G = new THREE.Group(); G.position.set(p.x, p.y, p.z); G.rotation.y = Math.atan2(p.tx, p.tz) + Math.PI; g.add(G);
    for (const [x, l] of [[-3.6, ['CENTRO', 'CALIFORNIA NORTE', 'AV. FCO. DE MIRANDA']], [3.2, ['DIST. BOYACÁ', 'VALLES DEL TUY', 'GUARENAS']]]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.2, .12), [api.concrete(0x5d6166), api.concrete(0x5d6166), api.concrete(0x5d6166), api.concrete(0x5d6166), cartel(l), api.concrete(0x5d6166)]);
      m.position.set(x, 6.75, 0); G.add(m); }
    const tubo = api.concrete(0x8e949a, { roughness: .5, metalness: .4 }), poste = new THREE.Mesh(new THREE.CylinderGeometry(.22, .28, 8, 10), tubo), brazo = new THREE.Mesh(new THREE.BoxGeometry(13.5, .3, .3), tubo);
    poste.position.set(7.4, 4, .3); brazo.position.set(1, 7.95, .3); G.add(poste, brazo); }

  // ───────── Paso inferior de la vuelta bajo la Río de Janeiro (km 32,30–32,36; t=754,5 s) ─────────
  // losa gris por debajo de la cubierta del motor (que es oscura), vigas que cruzan de lado a lado y pilas a ambos lados de la calzada
  { const gris = api.concrete(0x9a9c99), viga = api.concrete(0x8a8c89), H = 4.75, n = 14, A = 14;
    for (let i = 0; i < n; i++) { const k0 = 32.30 + .06 * i / n, k1 = 32.30 + .06 * (i + 1) / n, p0 = at(k0, 0), p1 = at(k1, 0), L = Math.hypot(p1.x - p0.x, p1.z - p0.z) + .05;
      const m = new THREE.Mesh(new THREE.BoxGeometry(A, .12, L), gris); m.position.set((p0.x + p1.x) / 2, (p0.y + p1.y) / 2 + H, (p0.z + p1.z) / 2); m.rotation.y = Math.atan2(p1.x - p0.x, p1.z - p0.z); g.add(m); }
    for (let i = 0; i <= 6; i++) { const p = at(32.302 + .056 * i / 6, 0), b = new THREE.Mesh(new THREE.BoxGeometry(A, .8, .45), viga); b.position.set(p.x, p.y + H - .45, p.z); b.rotation.y = Math.atan2(p.tx, p.tz); g.add(b); }
    for (const d of [8.6, -8.6]) for (const km of [32.305, 32.33, 32.355]) { const p = at(km, d), c = new THREE.Mesh(new THREE.BoxGeometry(1.1, H, 1.1), gris); c.position.set(p.x, p.y + H / 2, p.z); c.rotation.y = Math.atan2(p.tx, p.tz); g.add(c); } }

  // ───────── Bolardos amarillos de la T de la Calle Santa Margarita (vuelta, km 32,03–32,10; t=749,5–750 s) ─────────
  { const mat = api.concrete(0xf2c230, { roughness: .6 }), items = []; for (let km = 32.03; km <= 32.10; km += .006) for (const d of [-7.6, 7.6]) if (d < 0 || km > 32.07) items.push(at(km, d));
    const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(.14, .16, .85, 10), mat, items.length), q = new THREE.Object3D();
    items.forEach((p, i) => { q.position.set(p.x, p.y + .42, p.z); q.updateMatrix(); im.setMatrixAt(i, q.matrix); }); g.add(im); }

  // ───────── Postes de doble brazo en la isla central (km 28,78–30,45) ─────────
  { const poste = api.concrete(0x8e949a, { roughness: .5, metalness: .4 }), luz = api.glow(0xfff1cf, { dia: .05, noche: 2.2 });
    const items = []; for (let km = 28.8; km <= 30.44; km += .042) { if ((km > 30.12 && km < 30.22) || km > 30.4) continue; items.push(km); }
    const fuste = new THREE.InstancedMesh(new THREE.CylinderGeometry(.11, .17, 10, 6), poste, items.length), brazo = new THREE.InstancedMesh(new THREE.BoxGeometry(5.2, .12, .12), poste, items.length), lum = new THREE.InstancedMesh(new THREE.BoxGeometry(.75, .16, .36), luz, items.length * 2), q = new THREE.Object3D();
    items.forEach((km, i) => { const p = at(km, 8.4), r = Math.atan2(p.tx, p.tz);
      q.position.set(p.x, p.y + 5, p.z); q.rotation.set(0, r, 0); q.updateMatrix(); fuste.setMatrixAt(i, q.matrix);
      q.position.set(p.x, p.y + 9.9, p.z); q.rotation.set(0, r, 0); q.updateMatrix(); brazo.setMatrixAt(i, q.matrix);
      for (const s of [1, -1]) { const x = p.x + p.lx * 2.5 * s, z = p.z + p.lz * 2.5 * s; q.position.set(x, p.y + 9.8, z); q.rotation.set(0, r, 0); q.updateMatrix(); lum.setMatrixAt(i * 2 + (s > 0 ? 0 : 1), q.matrix); } });
    g.add(fuste, brazo, lum); }

  // ───────── Valla rosada sobre poste junto al galpón (km 28,40 der.) ─────────
  { const p = at(28.405, -16), G = new THREE.Group(); G.position.set(p.x, p.y, p.z); G.rotation.y = Math.atan2(p.tx, p.tz); g.add(G);
    const tex = api.canvasTex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#e2468f'); gr.addColorStop(1, '#f07ab0'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.fillStyle = '#f6d7c3'; c.beginPath(); c.ellipse(w * .3, h * .38, 16, 20, 0, 0, 7); c.fill(); c.fillStyle = '#2b1d22'; c.beginPath(); c.ellipse(w * .3, h * .3, 19, 16, 0, Math.PI, 7); c.fill();
      c.fillStyle = '#ffffff'; c.fillRect(w * .22, h * .55, w * .16, h * .45); c.fillStyle = '#fff'; c.font = 'bold 22px sans-serif'; c.fillText('NUEVO', w * .52, h * .45); c.font = '14px sans-serif'; c.fillText('ya disponible', w * .52, h * .62); });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(10, 5, .3), [api.concrete(0x5a5d61), api.concrete(0x5a5d61), api.concrete(0x5a5d61), api.concrete(0x5a5d61), new THREE.MeshStandardMaterial({ map: tex, roughness: .7 }), new THREE.MeshStandardMaterial({ map: tex, roughness: .7 })]);
    panel.position.set(0, 15, 0); G.add(panel);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.35, .45, 13, 8), api.concrete(0x7d8085)); pole.position.y = 6.5; G.add(pole); }

  // ───────── Av. Araure, Chuao (km 27,2–27,72, 22-nov): el supermercado Gama Express y los comercios con nombre de la acera derecha ─────────
  //  Gama Express (OSM way 713231141, km 27,62–27,66 der.; video t=676,25–677,75): nave de una planta alta en la esquina de la calle que
  //  cruza en el 27,60, con la faja roja «Gama express» que dobla la esquina, vidriera oscura con «Farmacia 24» y «Bodegón», azotea clara.
  //  Detrás, la Panadería Laedy (OSM) con «PANADERÍA DELICATESES» y «BARBERÍA» (t=677,75); en el 27,71 la panadería-charcutería de toldo
  //  (t=678,25); en el 27,37 Bicimanía (OSM; letrero «Bike» en t=668–670) y en el 27,21 Farmatodo (solo OSM: el video cambia de cámara ahí).
  {
    const LL = (a, b) => api.xz(a, b), GY = (x, z) => api.ground(x, z) * EX;
    const tex = (w, h, fn) => new THREE.MeshStandardMaterial({ map: api.canvasTex(w, h, fn), roughness: .6 });
    const crema = api.concrete(0xebe7dc), gris = api.concrete(0x8f9193);
    // tablero pegado a la cara de un polígono OSM que mira a la ruta en el km k (yc: altura del centro sobre el suelo)
    const rotulo = (poly, k, w, h, yc, mat, fondo = gris) => { const Pp = poly.map(([a, b]) => LL(a, b)), q = at(k, 0); let best = null;
      for (let i = 0; i < Pp.length; i++) { const A = Pp[i], B = Pp[(i + 1) % Pp.length], ex = B.x - A.x, ez = B.z - A.z, L2 = ex * ex + ez * ez, t = Math.max(0, Math.min(1, ((q.x - A.x) * ex + (q.z - A.z) * ez) / L2));
        const X = A.x + ex * t, Z = A.z + ez * t, d = Math.hypot(q.x - X, q.z - Z); if (!best || d < best.d) best = { d, X, Z, ex, ez, L: Math.sqrt(L2) }; }
      let nx = best.ez / best.L, nz = -best.ex / best.L; if ((q.x - best.X) * nx + (q.z - best.Z) * nz < 0) { nx = -nx; nz = -nz; }
      const m = new THREE.Mesh(new THREE.BoxGeometry(Math.min(w, best.L - .6), h, .14), [fondo, fondo, fondo, fondo, mat, fondo]);
      m.position.set(best.X + nx * .2, GY(best.X, best.Z) + yc, best.Z + nz * .2); m.rotation.y = Math.atan2(nx, nz); g.add(m); return m; };
    // ── Gama Express
    { const V = [[10.481525, -66.841963], [10.481449, -66.842095], [10.481202, -66.841946], [10.481278, -66.841815]].map(([a, b]) => LL(a, b));
      const cx = V.reduce((s, p) => s + p.x, 0) / 4, cz = V.reduce((s, p) => s + p.z, 0) / 4;
      const ex = V[1].x - V[0].x, ez = V[1].z - V[0].z, W = Math.hypot(ex, ez), lx_ = V[2].x - V[1].x, lz_ = V[2].z - V[1].z, Dd = Math.hypot(lx_, lz_);
      const ry = Math.atan2(lx_, lz_), X = { x: Math.cos(ry), z: -Math.sin(ry) }, Z = { x: lx_ / Dd, z: lz_ / Dd };   // local x y z del cuerpo en el mundo
      const q = at(27.64, 0), hx = Math.sign((q.x - cx) * X.x + (q.z - cz) * X.z), hz = Math.sign((q.x - cx) * Z.x + (q.z - cz) * Z.z);
      // el DEM de detalle hunde el terreno a la derecha (la quebrada de detrás); en el video el local y su estacionamiento están a nivel
      // de la avenida: el cuerpo se apoya en la cota de la vía y debajo va un zócalo hasta el suelo
      let gmin = 1e9; for (const p of V) gmin = Math.min(gmin, GY(p.x, p.z)); const yR = at(27.636, 0).y, y0 = Math.max(gmin - .3, yR + .12), H = 6.8;
      if (gmin < y0) { const zb = new THREE.Mesh(new THREE.BoxGeometry(W - .1, y0 - gmin + .6, Dd - .1), gris); zb.position.set(cx, (y0 + gmin - .6) / 2, cz); zb.rotation.y = ry; g.add(zb); }
      // estacionamiento de asfalto a nivel de la vía entre la acera y la nave (27,612–27,660), con los topes amarillos del video (t=676,75)
      { const a0 = at(27.612, 0), a1 = at(27.660, 0), mx = (a0.x + a1.x) / 2, mz = (a0.z + a1.z) / 2, L = Math.hypot(a1.x - a0.x, a1.z - a0.z), ux = (a1.x - a0.x) / L, uz = (a1.z - a0.z) / L, lx = uz, lz = -ux, e = 20.5;
        let gm = 1e9; for (let t = -.5; t <= .5; t += .25) for (const d of [-9, -20, -32]) gm = Math.min(gm, GY(mx + ux * L * t + lx * d, mz + uz * L * t + lz * d));
        const yP = yR + .1, sl = new THREE.Mesh(new THREE.BoxGeometry(23, yP - Math.min(gm, yP - .3) + .4, L), api.concrete(0x5f6163, { roughness: .95 })); sl.position.set(mx - lx * e, (yP + Math.min(gm, yP - .3) - .4) / 2, mz - lz * e); sl.rotation.y = Math.atan2(ux, uz); g.add(sl);
        const tope = api.concrete(0xf2c230, { roughness: .6 }); for (let t = .1; t <= .9; t += .1) { const p = at(27.612 + .048 * t, -9.4); const m = new THREE.Mesh(new THREE.BoxGeometry(.25, .3, 2.2), tope); m.position.set(p.x, yP + .15, p.z); m.rotation.y = Math.atan2(p.tx, p.tz); g.add(m); } }
      const frente = (wm, px) => tex(px, Math.round(px * H / wm), (x, w, h) => { const m = v => v / H * h; x.fillStyle = '#e9e5da'; x.fillRect(0, 0, w, h);
        x.fillStyle = '#d6202a'; x.fillRect(0, m(.3), w, m(1.7)); x.fillStyle = '#ffffff'; x.fillRect(0, m(.3), w, m(.08)); x.textBaseline = 'middle';
        x.font = `bold italic ${m(1.25) | 0}px Georgia, serif`; x.fillText('Gama', w * .12, m(1.13)); x.font = `italic ${m(.62) | 0}px Arial, sans-serif`; x.fillText('express', w * .12 + m(3.5), m(1.45));
        x.fillStyle = '#7d8590'; x.fillRect(0, m(2.0), w, m(.5)); x.fillStyle = '#273038'; x.fillRect(m(.3), m(2.5), w - m(.6), m(3.9)); x.fillStyle = 'rgba(190,215,235,.2)'; x.fillRect(m(.3), m(2.5), w - m(.6), m(.5));
        x.fillStyle = '#c9cdd0'; for (let i = 0; i <= wm / 2.4; i++) x.fillRect(m(.3 + i * 2.4), m(2.5), 3, m(3.9));
        if (wm > 20) { x.fillStyle = '#1e63c4'; x.fillRect(w * .58, m(2.7), m(4.2), m(.8)); x.fillStyle = '#fff'; x.font = `bold ${m(.5) | 0}px Arial, sans-serif`; x.fillText('Farmacia 24', w * .58 + m(.25), m(3.1));
          x.fillStyle = '#b3202a'; x.fillRect(w * .3, m(2.7), m(3.6), m(.8)); x.fillStyle = '#fff'; x.fillText('Bodegón', w * .3 + m(.35), m(3.1)); }
        x.fillStyle = '#9a9c9e'; x.fillRect(0, m(6.4), w, m(.4)); });
      const fL = frente(Dd, 1024), fC = frente(W, 512);
      const mats = [hx > 0 ? fL : crema, hx > 0 ? crema : fL, api.concrete(0x8c928e), crema, hz > 0 ? fC : crema, hz > 0 ? crema : fC];
      const b = new THREE.Mesh(new THREE.BoxGeometry(W, H, Dd), mats); b.position.set(cx, y0 + H / 2, cz); b.rotation.y = ry; g.add(b);
      // la faja sigue en la otra cara larga hacia la calle lateral (dobla la esquina, t=677,25)
      void X; }
    // ── Panadería Laedy y barbería (detrás del Gama) y la panadería-charcutería del 27,71
    const PL = [[10.481259, -66.841697], [10.481232, -66.841589], [10.481406, -66.841544], [10.481433, -66.841652]];
    rotulo(PL, 27.672, 9, 1.0, 3.6, tex(512, 64, (x, w, h) => { x.fillStyle = '#f4f2ec'; x.fillRect(0, 0, w, h); x.fillStyle = '#7a2a1c'; x.font = 'bold 34px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PANADERÍA DELICATESES', w / 2, h / 2 + 2); }));
    rotulo(PL, 27.665, 3.6, .8, 2.7, tex(256, 64, (x, w, h) => { x.fillStyle = '#1b1d20'; x.fillRect(0, 0, w, h); x.fillStyle = '#f4f2ec'; x.font = 'bold 34px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('BARBERÍA', w / 2, h / 2 + 2); }));
    rotulo([[10.481389, -66.841412], [10.481178, -66.841476], [10.481121, -66.841141], [10.481338, -66.841099], [10.481354, -66.84126]], 27.705, 12, 1.1, 4.0,
      tex(512, 48, (x, w, h) => { x.fillStyle = '#2f6b3a'; x.fillRect(0, 0, w, h); x.fillStyle = '#f6efd8'; x.font = 'bold 30px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PANADERÍA · CHARCUTERÍA', w / 2, h / 2 + 2); }));
    // ── Bicimanía (27,37) y Farmatodo (27,21)
    rotulo([[10.48195, -66.844454], [10.482011, -66.844437], [10.481977, -66.84432], [10.482066, -66.844294], [10.482094, -66.844392], [10.482053, -66.844404], [10.482074, -66.844476], [10.481965, -66.844507]], 27.367, 6, 1.0, 4.4,
      tex(256, 48, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#16181a'; x.font = 'bold italic 32px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Bicimanía', w / 2, h / 2 + 2); }), crema);
    rotulo([[10.48216, -66.845869], [10.482138, -66.845769], [10.48237, -66.845714], [10.482394, -66.845817]], 27.208, 9, 1.3, 5.0,
      tex(512, 72, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#1d3f94'; x.fillRect(0, h - 10, w, 10); x.fillStyle = '#e3262e'; x.fillRect(22, 14, 34, 34); x.fillStyle = '#fff'; x.fillRect(35, 18, 8, 26); x.fillRect(26, 27, 26, 8);
        x.fillStyle = '#1d3f94'; x.font = 'bold 44px Arial, sans-serif'; x.textBaseline = 'middle'; x.fillText('Farmatodo', 74, h / 2 - 2); }), crema);
  }

  // ───────── Macaracuay (km 30,22–30,40 der., 23-nov): bomba de techo rojo, malla de la cancha y el letrero de la Torre Parmalat ─────────
  //  Video t=719–723 s. La bomba (Full Gas en OSM): marquesina de borde rojo con plafón blanco y columnas rojas (techo «roof» de OSM),
  //  tienda gris al fondo, autolavado de techo rojo y patio de concreto con brocales amarillos. La Torre Parmalat (OSM) lleva su nombre
  //  en lo alto de la cara que mira a la avenida (lo confirma Alejandro, que corre esa ruta).
  {
    const LL = (a, b) => api.xz(a, b), GY = (x, z) => api.ground(x, z) * EX;
    const blancoB = api.concrete(0xf2f1ed), rojoB = api.concrete(0xc9242b), grisB = api.concrete(0x8e9092), patioB = api.concrete(0x9a9892, { roughness: .95 });
    // losa extruida de un polígono lat/lon entre y0 e y1 (top, lados)
    const losa = (poly, y0, y1, top, side) => { const P = poly.map(([a, b]) => LL(a, b)), cx = P.reduce((s, p) => s + p.x, 0) / P.length, cz = P.reduce((s, p) => s + p.z, 0) / P.length;
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(P.map(p => new THREE.Vector2(p.x - cx, -(p.z - cz)))), { depth: y1 - y0, bevelEnabled: false }), [top, side]);
      m.rotation.x = -Math.PI / 2; m.position.set(cx, y0, cz); g.add(m); return m; };
    const minG = (poly) => Math.min(...poly.map(([a, b]) => { const p = LL(a, b); return GY(p.x, p.z); }));
    const caja = (w, h, d, mat, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
    const r0 = at(30.33, 0), ry = Math.atan2(r0.tx, r0.tz), yV = Math.max(at(30.30, 0).y, at(30.36, 0).y);
    // patio: de la acera (−9,5 m) a −40 m entre el 30,300 y el 30,362, a la cota de la vía
    const ROOF = [[10.473935, -66.819402], [10.473978, -66.81916], [10.473851, -66.819137], [10.473802, -66.819378]];
    const FG = [[10.473689, -66.819358], [10.473717, -66.819111], [10.473838, -66.819163], [10.47382, -66.819326], [10.473757, -66.819366]];
    const LAV = [[10.473744, -66.819096], [10.473768, -66.81896], [10.473835, -66.818986], [10.473824, -66.819097]];
    let gPat = 1e9; for (let k = 30.300; k <= 30.362; k += .01) for (const d of [-10, -22, -36]) { const p = at(k, d); gPat = Math.min(gPat, GY(p.x, p.z)); }
    const yP = yV + .15;
    { const a0 = at(30.300, -24.5), a1 = at(30.362, -24.5), L = Math.hypot(a1.x - a0.x, a1.z - a0.z);
      caja(30, yP - Math.min(gPat, yP - .3) + .5, L, patioB, (a0.x + a1.x) / 2, (yP + Math.min(gPat, yP - .3) - .5) / 2, (a0.z + a1.z) / 2, ry); }
    // marquesina: borde rojo de 1,2 m con filete blanco, plafón blanco, a 5,2 m
    { const borde = new THREE.MeshStandardMaterial({ map: api.canvasTex(256, 32, (x, w, h) => { x.fillStyle = '#c9242b'; x.fillRect(0, 0, w, h); x.fillStyle = '#f4f2ee'; x.fillRect(0, h * .78, w, h * .22); }), roughness: .6 });
      borde.map.wrapS = THREE.RepeatWrapping; borde.map.repeat.set(6, 1);
      losa(ROOF, yP + 5.2, yP + 6.4, blancoB, borde);
      const luz = api.glow(0xffffff, { dia: .3, noche: 2.2 }); const c = ROOF.map(([a, b]) => LL(a, b));
      for (const [u, v] of [[.25, .3], [.5, .3], [.75, .3], [.25, .7], [.5, .7], [.75, .7]]) { const x = c[0].x + (c[1].x - c[0].x) * u + (c[3].x - c[0].x) * v, z = c[0].z + (c[1].z - c[0].z) * u + (c[3].z - c[0].z) * v; caja(1.4, .06, .7, luz, x, yP + 5.17, z, ry); }
      // columnas rojas y dos islas de surtidores
      const surT = new THREE.MeshStandardMaterial({ map: api.canvasTex(64, 128, (x, w, h) => { x.fillStyle = '#f2f1ed'; x.fillRect(0, 0, w, h); x.fillStyle = '#c9242b'; x.fillRect(0, 0, w, h * .22); x.fillStyle = '#1d2226'; x.fillRect(w * .2, h * .32, w * .6, h * .2); x.fillStyle = '#3a3d40'; x.fillRect(w * .15, h * .62, w * .7, h * .1); }), roughness: .5 });
      for (const v of [.3, .7]) { const ax = c[0].x + (c[3].x - c[0].x) * v, az = c[0].z + (c[3].z - c[0].z) * v, bx = c[1].x + (c[2].x - c[1].x) * v, bz = c[1].z + (c[2].z - c[1].z) * v, ri = Math.atan2(bx - ax, bz - az);
        for (const u of [.18, .82]) caja(.55, 5.2, .55, rojoB, ax + (bx - ax) * u, yP + 2.6, az + (bz - az) * u, ri);
        caja(1.2, .25, 14, api.concrete(0xd8d5cc), (ax + bx) / 2, yP + .12, (az + bz) / 2, ri);
        for (const u of [.38, .62]) caja(.6, 1.8, 1.1, [surT, surT, blancoB, blancoB, blancoB, blancoB], ax + (bx - ax) * u, yP + 1.15, az + (bz - az) * u, ri); } }
    // tienda: gris con vidriera y faja roja; autolavado: techo rojo sobre cuatro postes
    { const yT = Math.max(yP, minG(FG)), y0T = minG(FG) - .3, tT = api.canvasTex(256, 64, (x, w, h) => { x.fillStyle = '#d9d8d3'; x.fillRect(0, 0, w, h); x.fillStyle = '#c9242b'; x.fillRect(0, h * .08, w, h * .16); x.fillStyle = '#2b3338'; x.fillRect(w * .05, h * .38, w * .9, h * .5); x.fillStyle = '#9a9c9e'; for (let i = 1; i < 6; i++) x.fillRect(w * .05 + i * w * .15, h * .38, 3, h * .5); });
      // las caras laterales de ExtrudeGeometry llevan UV en metros (u a lo largo, v en altura): una repetición cada 8 m y una sola en altura
      tT.wrapS = tT.wrapT = THREE.RepeatWrapping; tT.repeat.set(1 / 8, 1 / (yT + 4.2 - y0T));
      losa(FG, y0T, yT + 4.2, api.concrete(0x7d7f80), new THREE.MeshStandardMaterial({ map: tT, roughness: .7 }));
      const yL = Math.max(yP, minG(LAV)); losa(LAV, yL + 3.8, yL + 4.4, api.concrete(0xb33a2c), rojoB);
      LAV.forEach(([a, b]) => { const p = LL(a, b); caja(.3, 3.8, .3, grisB, p.x, yL + 1.9, p.z, ry); }); }
    // tótem de la bomba en la esquina de la acera (t=718,5: panel rojo y azul en lo alto)
    { const p = at(30.302, -10.6); caja(.6, 8, .6, grisB, p.x, p.y + 4, p.z, ry);
      caja(2.2, 2.6, .45, [grisB, grisB, grisB, grisB, new THREE.MeshStandardMaterial({ map: api.canvasTex(64, 80, (x, w, h) => { x.fillStyle = '#f2f1ed'; x.fillRect(0, 0, w, h); x.fillStyle = '#c9242b'; x.beginPath(); x.arc(w / 2, h * .42, w * .3, 0, 7); x.fill(); x.fillStyle = '#1f4ea3'; x.fillRect(0, h * .8, w, h * .2); }), roughness: .6 }), grisB], p.x, p.y + 8.8, p.z, ry + Math.PI); }
    // muro gris de la cancha (la huella del 30,29 sube a 3,6 m) con malla alta encima: paño de alambre con alphaTest, caras frontales a los dos lados
    { const malla = api.canvasTex(64, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#9da3a6'; x.lineWidth = 2; for (let i = -64; i < 128; i += 10) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 64, 64); x.stroke(); x.beginPath(); x.moveTo(i + 64, 0); x.lineTo(i, 64); x.stroke(); } });
      malla.wrapS = malla.wrapT = THREE.RepeatWrapping;
      malla.repeat.set(1, 1.6);
      const k0 = 30.232, k1 = 30.292, d = -10.2, m = cinta(k0, k1, d, 3.4, 8.2, new THREE.MeshStandardMaterial({ map: malla, alphaTest: .5, roughness: .6, metalness: .3 }), 3);
      dosCaras(m);
      barrotes(k0, k1, d, 3.4, 4.8, 3.2, new THREE.CylinderGeometry(.05, .05, 4.8, 6), grisB); }
    // letrero de la Torre Parmalat: tablero blanco con el nombre en azul en lo alto de la cara norte (la que mira a la avenida)
    { const PM = [[10.47341, -66.818392], [10.473392, -66.818511], [10.473259, -66.818491], [10.473228, -66.818692], [10.473342, -66.81871], [10.473312, -66.818907], [10.473387, -66.818918], [10.473382, -66.81895], [10.473448, -66.818961], [10.473452, -66.818933], [10.473491, -66.818939], [10.473568, -66.818429], [10.473503, -66.818419], [10.473505, -66.818406]];
      const A = LL(10.473491, -66.818939), B = LL(10.473568, -66.818429), L = Math.hypot(B.x - A.x, B.z - A.z); let nx = (B.z - A.z) / L, nz = -(B.x - A.x) / L;
      const q = at(30.37, 0); if ((q.x - A.x) * nx + (q.z - A.z) * nz < 0) { nx = -nx; nz = -nz; }
      const top = minG(PM) + 8 * 3.2 + 1, cx = (A.x + B.x) / 2 + (B.x - A.x) / L * 6, cz = (A.z + B.z) / 2 + (B.z - A.z) / L * 6;
      const tx = new THREE.MeshStandardMaterial({ map: api.canvasTex(512, 96, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#1b4fa8'; x.font = 'bold italic 76px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Parmalat', w / 2 + 22, h / 2 + 4);
        x.fillStyle = '#1b4fa8'; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; x.beginPath(); x.ellipse(70 + Math.cos(a) * 14, 26 + Math.sin(a) * 14, 9, 6, a, 0, 7); x.fill(); } }), emissive: 0x222222, roughness: .6 });
      const fondo = api.concrete(0xdedcd6), m = new THREE.Mesh(new THREE.BoxGeometry(16, 3, .3), [fondo, fondo, fondo, fondo, tx, fondo]);
      m.position.set(cx + nx * .35, top - 2.6, cz + nz * .35); m.rotation.y = Math.atan2(nx, nz); g.add(m); }
  }

  return api.sombras(g);
}
