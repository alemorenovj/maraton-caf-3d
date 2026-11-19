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

  return api.sombras(g);
}
