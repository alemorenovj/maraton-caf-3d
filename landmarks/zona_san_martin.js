// Zona san_martin (km 3,1–6,2): lo singular que el video muestra y las huellas genéricas no dan.
// - Elevado San Martín (OSM 1004335955, puente 4,21–4,45 con rampas hasta 4,13 y 4,53): va por el separador, a la izquierda
//   de la ruta; columnas rojas y verdes alternadas, frente verde, baranda amarilla, rampas de muro amarillo (s 112–121; f_0046–0049).
// - Iglesia Nuestra Señora de Lourdes (neogótica, dos agujas de ~40 y ~34 m, crema) sobre un podio con escalones de colores,
//   y Plaza Italia delante, a la derecha en el km 4,38 (f_0047–0048; foto fotos/oeste/29_…).
// - Viaducto de La Araña (km 4,913–4,987, s 133,8–135,8): el tablero lo dibuja el motor (estructura `cubierta`); aquí van
//   las vigas de borde, las columnas del separador y el muro de murales de la derecha (rostros, «MPPVI»).
// - Pasarela tricolor (OSM, km 5,277; f_0057): tablero con la bandera horizontal (amarillo | azul con estrellas | rojo), escaleras a ambos lados.
// - Marquesinas del Metro: azules en Maternidad (km 4,80; s 129, f_0052) y verde en Artigas (km 5,81; s 150).
// - Letreros: Híper Líder (5,29 der.), C.C. San Martín (5,46–5,52 izq.), Lotería de Caracas (5,72 izq., giratorio), Los Molinos (5,85 der.).
// 18-nov: el trazado se corrigió (va por el eje de la calzada suroeste). Lo que cuelga de la vía (elevado, columnas, pasarela,
// marquesinas, bolardos) sigue a distancia fija del eje; los letreros, que van sobre fachadas, se movieron lo que se movió el eje.
export const meta = { id: 'zona_san_martin', nombre: 'Zona san_martin', quita: [[10.49713, -66.92961, 26]] };

export function build(THREE, api) {
  const g = new THREE.Group();
  const add = (geo, mat, x, y, z, p = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };
  // grupo alineado con la ruta: +Z local = sentido de carrera, +X local = izquierda del corredor, Y = cota de la calzada (+dy)
  const enRuta = (km, lado = 0, dy = 0, suelo = false) => { const r = api.routeAt(km), x = r.x + r.lx * lado, z = r.z + r.lz * lado, G = new THREE.Group();
    G.position.set(x, (suelo ? api.ground(x, z) : r.y) + dy, z); G.rotation.y = Math.atan2(r.tx, r.tz); g.add(G); return G; };
  // cinta a lo largo de la ruta: perfil(km, r) → [[lado1, y1], [lado2, y2]] con y relativo a la calzada; u = metros recorridos
  const cinta = (km0, km1, paso, perfil, mat, uEsc = 1) => {
    const p = [], uv = [], ix = []; let k = 0, acc = 0, prev = null;
    for (let km = km0; km <= km1 + 1e-6; km += paso, k++) {
      const r = api.routeAt(Math.min(km, km1)); if (prev) acc += Math.hypot(r.x - prev.x, r.z - prev.z); prev = r;
      const [[a, ya], [b, yb]] = perfil(Math.min(km, km1), r);
      p.push(r.x + r.lx * a, r.y + ya, r.z + r.lz * a, r.x + r.lx * b, r.y + yb, r.z + r.lz * b); uv.push(acc / uEsc, 0, acc / uEsc, 1);
      if (k) { const q = (k - 1) * 2; ix.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(ix); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat); g.add(m); return m; };
  const texto = (w, h, fondo, dibujo) => api.canvasTex(w, h, (c, W, H) => { if (fondo) { c.fillStyle = fondo; c.fillRect(0, 0, W, H); } else c.clearRect(0, 0, W, H); dibujo(c, W, H); });
  const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };

  // ───────── Elevado San Martín ─────────
  { const L0 = 7.4, L1 = 15.4, HT = 6.6, ESP = 1.1;
    const h = km => km < 4.13 || km > 4.535 ? 0 : km < 4.215 ? HT * sm((km - 4.13) / .085) : km < 4.445 ? HT : HT * sm((4.535 - km) / .09);
    const top = km => Math.max(h(km), .25), bot = km => Math.max(top(km) - ESP, 0);
    const asfalto = api.concrete(0x55575a, { side: THREE.DoubleSide }), bajo = api.concrete(0x8d8e8a, { side: THREE.DoubleSide });
    const verde = api.concrete(0x2f6e48, { side: THREE.DoubleSide }), amarillo = api.concrete(0xdcbd3a, { side: THREE.DoubleSide });
    const K0 = 4.128, K1 = 4.537, PS = .004;
    cinta(K0, K1, PS, (k) => [[L0, top(k)], [L1, top(k)]], asfalto);
    cinta(K0, K1, PS, (k) => [[L0, bot(k) + .02], [L1, bot(k) + .02]], bajo);
    for (const l of [L0, L1]) { cinta(K0, K1, PS, (k) => [[l, bot(k)], [l, top(k)]], verde);
      cinta(K0, K1, PS, (k) => [[l, 0], [l, h(k) < 3.4 ? bot(k) : 0]], amarillo); }
    // baranda amarilla de balaustres sobre el tablero
    const bal = texto(64, 64, null, (c, W, H) => { c.fillStyle = '#e6c32e'; c.fillRect(0, 0, W, 9); c.fillRect(0, H - 12, W, 12); for (let i = 0; i < 4; i++) c.fillRect(i * 16 + 5, 0, 6, H); });
    bal.wrapS = THREE.RepeatWrapping; const bm = new THREE.MeshStandardMaterial({ map: bal, alphaTest: .5, transparent: false, side: THREE.DoubleSide, roughness: .7 });
    for (const l of [L0 + .1, L1 - .1]) cinta(K0, K1, PS, (k) => [[l, top(k) + 1.0], [l, top(k)]], bm, 1.1);
    // franja del separador bajo el elevado: tierra y grava, con brocal
    cinta(4.12, 4.545, .005, () => [[6.9, .1], [16.2, .1]], api.concrete(0x857c6e));
    cinta(4.12, 4.545, .005, () => [[6.9, 0], [6.9, .2]], amarillo); cinta(4.12, 4.545, .005, () => [[16.2, 0], [16.2, .2]], amarillo);
    // pilas: pórticos cada 15 m, columnas rojas y verdes alternadas (alguna con franja tricolor)
    const rojo = api.concrete(0xc5322a), verdeC = api.concrete(0x2e7a46), azulC = api.concrete(0x2a5aa8);
    let i = 0; for (let km = 4.222; km <= 4.442; km += .0145, i++) { const P = enRuta(km), hh = h(km) - ESP;
      for (const [l, j] of [[L0 + 1.1, 0], [L1 - 1.1, 1]]) { const mat = (i + j) % 2 ? verdeC : rojo; add(new THREE.BoxGeometry(1.0, hh, 1.0), mat, l, hh / 2, 0, P);
        if (i % 5 === 2) add(new THREE.BoxGeometry(1.04, hh * .45, .25), azulC, l, hh * .55, .45, P); }
      add(new THREE.BoxGeometry(L1 - L0 - .6, .7, 1.2), bajo, (L0 + L1) / 2, hh - .35, 0, P); }
  }

  // ───────── Iglesia Nuestra Señora de Lourdes y Plaza Italia ─────────
  { const c = api.xz(10.49713, -66.92961), rp = api.routeAt(4.33), dx = rp.x - c.x, dz = rp.z - c.z, d = Math.hypot(dx, dz);
    const G = new THREE.Group(); G.position.set(c.x, api.ground(c.x, c.z), c.z); G.rotation.y = Math.atan2(dx / d, dz / d); g.add(G);   // +Z local = hacia la avenida
    const crema = api.concrete(0xd9cb9f), crema2 = api.concrete(0xcdbd8e), techo = api.concrete(0x456b4c), amar = api.concrete(0xe2c13c), gris = api.concrete(0xb9b4a6);
    const POD = 2.6;
    // podio con baranda amarilla y escalinata de colores hacia la plaza
    add(new THREE.BoxGeometry(32, POD, 52), gris, 0, POD / 2 - .3, -9, G);
    for (const sx of [-1, 1]) add(new THREE.BoxGeometry(11, .9, .35), amar, sx * 10.5, POD + .45, 17, G);
    const arco = ['#d8392b', '#ef7d22', '#f2c230', '#4aa84a', '#2f7fc1', '#6a4fa3', '#d8392b', '#f2c230'];
    for (let s = 0; s < 8; s++) { const y = POD - (s + 1) * POD / 8; add(new THREE.BoxGeometry(10, POD / 8, .55), api.concrete(new THREE.Color(arco[s]).getHex()), 0, y + POD / 16, 17.3 + s * .55, G); add(new THREE.BoxGeometry(10, .08, .55), gris, 0, y + POD / 8, 17.3 + s * .55, G); }
    // plaza delante: piso de franjas grises y blancas, bolardos de tapa amarilla
    const pv = texto(256, 256, '#cfcac0', (k, W, H) => { k.fillStyle = '#8f8b84'; for (let i = 0; i < 8; i++) { k.save(); k.translate(0, i * 32); k.transform(1, -.5, 0, 1, 0, 0); k.fillRect(0, 0, W * 1.5, 12); k.restore(); } });
    pv.wrapS = pv.wrapT = THREE.RepeatWrapping; pv.repeat.set(4, 3);
    add(new THREE.BoxGeometry(34, .14, 18), new THREE.MeshStandardMaterial({ map: pv, roughness: .9 }), 0, .07, 30, G);
    // nave
    add(new THREE.BoxGeometry(20, 15, 40), crema2, 0, POD + 7.5, -10, G);
    { const sh = new THREE.Shape(); sh.moveTo(-10.5, 0); sh.lineTo(10.5, 0); sh.lineTo(0, 6); sh.lineTo(-10.5, 0);
      const t = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 40, bevelEnabled: false }), techo); t.position.set(0, POD + 15, -30); G.add(t); }
    // contrafuertes de la nave
    for (let z = -26; z <= 4; z += 6) for (const sx of [-1, 1]) add(new THREE.BoxGeometry(1.2, 13, 1.4), crema, sx * 10.5, POD + 6.5, z, G);
    // fachada con portadas ojivales, rosetón y arquerías (textura)
    const fach = texto(512, 448, '#dccfa3', (k, W, H) => {
      const sx = W / 22, sy = H / 19; k.strokeStyle = '#a99a6c'; k.lineWidth = 3;
      for (const x of [3.2, 6.2, 15.8, 18.8]) { k.fillStyle = '#cbbd8f'; k.fillRect(x * sx - 6, 0, 12, H); }
      const ojiva = (cx, y0, w, hgt, col) => { k.fillStyle = col; k.beginPath(); k.moveTo((cx - w / 2) * sx, H - y0 * sy); k.lineTo((cx - w / 2) * sx, H - (y0 + hgt - w * .6) * sy); k.quadraticCurveTo((cx - w / 2) * sx, H - (y0 + hgt) * sy, cx * sx, H - (y0 + hgt) * sy); k.quadraticCurveTo((cx + w / 2) * sx, H - (y0 + hgt) * sy, (cx + w / 2) * sx, H - (y0 + hgt - w * .6) * sy); k.lineTo((cx + w / 2) * sx, H - y0 * sy); k.closePath(); k.fill(); k.stroke(); };
      ojiva(11, 0, 4.6, 8.5, '#bfae7c'); ojiva(11, 0, 2.6, 6, '#3b3226'); ojiva(4.7, 0, 3.2, 7, '#bfae7c'); ojiva(4.7, 0, 1.8, 5, '#3b3226'); ojiva(17.3, 0, 3.2, 7, '#bfae7c'); ojiva(17.3, 0, 1.8, 5, '#3b3226');
      ojiva(4.7, 9, 2.2, 6.5, '#4a4436'); ojiva(17.3, 9, 2.2, 6.5, '#4a4436');
      k.fillStyle = '#bfae7c'; k.beginPath(); k.arc(11 * sx, H - 13 * sy, 2.6 * sx, 0, 7); k.fill(); k.stroke(); k.fillStyle = '#5a4f3c'; k.beginPath(); k.arc(11 * sx, H - 13 * sy, 1.9 * sx, 0, 7); k.fill();
      k.strokeStyle = '#cfc193'; k.lineWidth = 3; for (let a = 0; a < 12; a++) { k.beginPath(); k.moveTo(11 * sx, H - 13 * sy); k.lineTo(11 * sx + Math.cos(a / 12 * 6.283) * 1.9 * sx, H - 13 * sy + Math.sin(a / 12 * 6.283) * 1.9 * sx); k.stroke(); }
      k.fillStyle = '#c6b787'; k.fillRect(0, H - 17.6 * sy, W, 8); k.fillStyle = '#b3a374'; for (let x = 0; x < W; x += 14) k.fillRect(x, H - 18.4 * sy, 7, 10); });
    const fm = new THREE.MeshStandardMaterial({ map: fach, roughness: .85 });
    add(new THREE.BoxGeometry(22, 19, 3), [crema, crema, crema, crema, fm, crema], 0, POD + 9.5, 11, G);
    { const sh = new THREE.Shape(); sh.moveTo(-5, 0); sh.lineTo(5, 0); sh.lineTo(0, 6.5); sh.lineTo(-5, 0);
      const t = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 1.6, bevelEnabled: false }), crema); t.position.set(0, POD + 19, 10.6); G.add(t); }
    // torres: la de la izquierda (vista de frente) es la más alta
    const pin = new THREE.ConeGeometry(.35, 3.2, 6);
    const torre = (x, Ht, Hs) => { add(new THREE.BoxGeometry(5.6, Ht, 5.6), crema, x, POD + Ht / 2, 10.5, G);
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { add(new THREE.BoxGeometry(1, Ht, 1), crema2, x + a * 2.9, POD + Ht / 2, 10.5 + b * 2.9, G); add(pin, crema, x + a * 2.9, POD + Ht + 1.6, 10.5 + b * 2.9, G); }
      add(new THREE.CylinderGeometry(2.4, 2.6, 6, 8), crema, x, POD + Ht + 3, 10.5, G);
      for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; add(new THREE.BoxGeometry(.5, 3.2, .3), api.concrete(0x3b3226), x + Math.sin(t) * 2.45, POD + Ht + 3, 10.5 + Math.cos(t) * 2.45, G).rotation.y = t; }
      add(new THREE.ConeGeometry(2.5, Hs, 8), crema2, x, POD + Ht + 6 + Hs / 2, 10.5, G);
      add(new THREE.BoxGeometry(.15, 1.4, .15), gris, x, POD + Ht + 6 + Hs + .6, 10.5, G); add(new THREE.BoxGeometry(.8, .15, .15), gris, x, POD + Ht + 6 + Hs + .8, 10.5, G); };
    torre(-8.4, 21, 12); torre(8.4, 19, 9.5);
    for (const x of [-11, -5.2, 5.2, 11]) add(pin, crema, x, POD + 20.6, 12.3, G);
    // estatua en la plaza
    add(new THREE.BoxGeometry(1.4, 2.4, 1.4), api.concrete(0xa7a194), 0, 1.2, 27, G); add(new THREE.CylinderGeometry(.3, .4, 2.2, 8), api.concrete(0x3d3a33), 0, 3.5, 27, G);
  }

  // ───────── Bolardos de tapa amarilla en la acera de Plaza Italia (s 116) ─────────
  { const n = 18, ins = new THREE.InstancedMesh(new THREE.CylinderGeometry(.22, .25, .8, 8), api.concrete(0x9a988f), n), cap = new THREE.InstancedMesh(new THREE.CylinderGeometry(.24, .24, .12, 8), api.concrete(0xe9c22a), n), m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const r = api.routeAt(4.27 + i * .0045), l = -7.4, x = r.x + r.lx * l, z = r.z + r.lz * l; m.makeTranslation(x, r.y + .55, z); ins.setMatrixAt(i, m); m.makeTranslation(x, r.y + 1.0, z); cap.setMatrixAt(i, m); }
    g.add(ins, cap); }

  // ───────── Viaducto de La Araña: vigas, columnas del separador y murales ─────────
  { const H = 7.5, gris = api.concrete(0x9c9a92), viga = api.concrete(0x8b8a84);
    const mural = (seed, retrato) => texto(256, 256, ['#e7792c', '#3a8fc9', '#e3c23a', '#c94b6b'][seed % 4], (k, W, Hh) => {
      let s = seed * 97 + 13; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 14; i++) { k.fillStyle = ['#f2d14b', '#2c6db3', '#d63a2f', '#3aa35a', '#f4f0e6', '#7b3fa0', '#ee8a2a'][Math.floor(rnd() * 7)]; k.beginPath(); k.ellipse(rnd() * W, rnd() * Hh, 15 + rnd() * 50, 10 + rnd() * 40, rnd() * 3, 0, 7); k.fill(); }
      if (retrato) { k.fillStyle = '#6b4a35'; k.beginPath(); k.ellipse(W / 2, Hh * .45, W * .2, Hh * .26, 0, 0, 7); k.fill(); k.fillStyle = '#1d1a18'; k.fillRect(W * .32, Hh * .2, W * .36, Hh * .1); k.fillStyle = '#c8352c'; k.fillRect(W * .25, Hh * .74, W * .5, Hh * .26); }
      k.strokeStyle = 'rgba(30,30,30,.6)'; k.lineWidth = 3; k.strokeRect(2, 2, W - 4, Hh - 4); });
    // vigas de borde (frente y fondo del tablero) y vigas transversales bajo la losa
    for (const km of [4.913, 4.987]) { const P = enRuta(km); add(new THREE.BoxGeometry(46, 1.7, 1.2), viga, 0, H + .55, 0, P); }
    for (let km = 4.925; km < 4.98; km += .012) { const P = enRuta(km); add(new THREE.BoxGeometry(46, .8, .7), viga, 0, H - .35, 0, P); }
    // cara inferior de la losa en concreto (la del motor es negra plana): un poco por debajo para que se vea el concreto en sombra
    cinta(4.913, 4.987, .004, () => [[23, H - .06], [-23, H - .06]], api.concrete(0x76746e, { side: THREE.DoubleSide, emissive: 0x403e3a }));
    // columnas del separador (izquierda) y de la acera derecha, varias con mural
    let i = 0; for (let km = 4.918; km <= 4.984; km += .0095, i++) {
      const P = enRuta(km); add(new THREE.BoxGeometry(1.4, H, 1.4), i % 3 === 1 ? new THREE.MeshStandardMaterial({ map: mural(i, false), roughness: .9 }) : gris, 7.4, H / 2, 0, P);
      if (i % 2 === 0) { const mm = new THREE.MeshStandardMaterial({ map: mural(i + 3, i % 4 === 0), roughness: .9 }); add(new THREE.BoxGeometry(1.6, H, 1.6), [mm, mm, mm, mm, gris, gris], -10.5, H / 2, 0, P); } }
    // muro con murales a la derecha, bajo el viaducto
    { const tx = texto(1024, 128, '#e57a2e', (k, W, Hh) => {
        const cols = ['#2c6db3', '#f2d14b', '#d63a2f', '#3aa35a', '#f4f0e6', '#7b3fa0'];
        for (let i = 0; i < 40; i++) { k.fillStyle = cols[i % cols.length]; k.fillRect((i * 53) % W, (i * 37) % Hh, 30 + (i * 13) % 50, 20 + (i * 7) % 40); }
        for (const x of [180, 560, 860]) { k.fillStyle = '#6b4a35'; k.beginPath(); k.ellipse(x, Hh * .5, 28, 40, 0, 0, 7); k.fill(); k.fillStyle = '#1d1a18'; k.fillRect(x - 26, Hh * .18, 52, 14); }
        k.fillStyle = '#c8352c'; k.font = 'bold 54px sans-serif'; k.fillText('MPPVI', 330, Hh * .75); k.fillStyle = '#ffffff'; k.font = 'bold 26px sans-serif'; k.fillText('VENEZUELA', 640, Hh * .3); });
      tx.wrapS = THREE.RepeatWrapping; const m = new THREE.MeshStandardMaterial({ map: tx, roughness: .9, side: THREE.DoubleSide });
      tx.repeat.x = -1; m.color.setScalar(.62); cinta(4.916, 4.986, .004, () => [[-12.2, 3.4], [-12.2, 0]], m, 70); }
  }

  // ───────── Pasarela tricolor (km 5,277) ─────────
  { const P = enRuta(5.277), H = 5.9, IZ = 21, DE = 10.5, L = IZ + DE, cx = (IZ - DE) / 2;
    const ban = texto(1024, 64, '#f2c230', (k, W, Hh) => { k.fillStyle = '#f2c230'; k.fillRect(0, 0, W / 3, Hh); k.fillStyle = '#1f4fa0'; k.fillRect(W / 3, 0, W / 3, Hh); k.fillStyle = '#cf2a2a'; k.fillRect(2 * W / 3, 0, W / 3, Hh);
      k.fillStyle = '#ffffff'; for (let i = 0; i < 8; i++) { const a = Math.PI * (.15 + .7 * i / 7); k.beginPath(); k.arc(W / 2 - Math.cos(a) * 70, Hh * .75 - Math.sin(a) * 30, 5, 0, 7); k.fill(); } });
    // la cara izquierda→derecha de la bandera: en local, x positivo = izquierda del corredor
    const bm = new THREE.MeshStandardMaterial({ map: ban, roughness: .6 }), gris = api.concrete(0x6d7378), osc = api.concrete(0x3e4448);
    add(new THREE.BoxGeometry(L, 1.3, 2.4), [gris, gris, gris, gris, bm, bm], cx, H - .45, 0, P);   // la cara −Z mira a quien llega: amarillo a su izquierda
    add(new THREE.BoxGeometry(L, .12, 2.5), osc, cx, H + .25, 0, P);
    for (const sz of [1, -1]) { add(new THREE.BoxGeometry(L, .08, .08), osc, cx, H + 1.4, sz * 1.15, P);
      const n = Math.floor(L / .5), bar = new THREE.InstancedMesh(new THREE.BoxGeometry(.05, 1.1, .05), osc, n), m = new THREE.Matrix4();
      for (let i = 0; i < n; i++) { m.makeTranslation(cx - L / 2 + (i + .5) * L / n, H + .85, sz * 1.15); bar.setMatrixAt(i, m); } P.add(bar); }
    for (const x of [IZ - .5, -DE + .5, 7.2]) add(new THREE.BoxGeometry(.5, H - 1.1, .5), gris, x, (H - 1.1) / 2, 0, P);
    // escaleras paralelas a la vía, el pie hacia quien llega (−Z local)
    const escalera = (x) => { const tramo = (y0, y1, z0, z1) => { const len = Math.hypot(y1 - y0, z1 - z0), m = add(new THREE.BoxGeometry(1.6, .25, len), gris, x, (y0 + y1) / 2, (z0 + z1) / 2, P); m.rotation.x = -Math.atan2(y1 - y0, z1 - z0);
        for (const s of [-.8, .8]) { const r = add(new THREE.BoxGeometry(.06, .06, len), osc, x + s, (y0 + y1) / 2 + 1, (z0 + z1) / 2, P); r.rotation.x = m.rotation.x; } };
      tramo(H, H / 2, -1.4, -8.6); add(new THREE.BoxGeometry(1.7, .25, 1.8), gris, x, H / 2, -9.5, P); tramo(H / 2, 0, -10.4, -17.6);
      for (const z of [-8.6, -10.4]) add(new THREE.BoxGeometry(.2, H / 2, .2), osc, x, H / 4, z, P); };
    escalera(IZ - 1); escalera(-DE + 1);
  }

  // ───────── Marquesinas del Metro ─────────
  { const azul = api.concrete(0x1f4fa8), vidrio = api.glass(0x6f8ea6, { transparent: true, opacity: .55 }), verde = api.concrete(0x2f7d3c);
    const marquesina = (km, lado, largo, fondo, alto, mat, cerrada) => { const P = enRuta(km, lado);
      add(new THREE.BoxGeometry(fondo + 1, .5, largo + 1), mat, 0, alto, 0, P);
      for (const x of [-fondo / 2, fondo / 2]) for (let z = -largo / 2; z <= largo / 2 + .1; z += largo / 4) add(new THREE.BoxGeometry(.25, alto, .25), mat, x, alto / 2, z, P);
      if (cerrada) add(new THREE.BoxGeometry(fondo, alto - .6, largo), vidrio, 0, (alto - .6) / 2, 0, P); };
    marquesina(4.815, -13.5, 22, 7, 4.6, azul, true);     // entrada del Metro Maternidad, derecha (s 129)
    marquesina(4.805, 21, 18, 6, 4.2, azul, false);       // la del otro lado (f_0052)
    marquesina(5.812, -12, 26, 6, 3.6, verde, false);     // Metro Artigas, derecha (s 150; f_0061)
  }

  // ───────── Letreros ─────────
  const panel = (km, lado, y, w, h, tex, girar = 0) => { const P = enRuta(km, lado); const m = add(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: .6, transparent: true, alphaTest: .05 }), 0, y, 0, P);
    m.rotation.y = (lado < 0 ? Math.PI / 2 : -Math.PI / 2) + girar; return m; };   // mirando a la calzada
  // Híper Líder San Martín (der., f_0058): letras rojas y logo verde sobre la caja blanca
  panel(5.295, -10.7, 11, 18, 7, texto(512, 200, '#f4f3ef', (k, W, H) => { k.fillStyle = '#cf2a2a'; k.font = 'bold italic 64px sans-serif'; k.fillText('HÍPER LÍDER', 20, 110); k.font = 'bold 32px sans-serif'; k.fillText('San Martín', 150, 160);
    k.fillStyle = '#1f8a3c'; k.fillRect(410, 30, 80, 120); k.fillStyle = '#ffffff'; k.fillRect(430, 50, 40, 80); k.fillStyle = '#1f8a3c'; k.fillRect(445, 65, 25, 50); }), -.25);
  // C.C. San Martín: letras verdes en el estacionamiento y letras en relieve sobre el ladrillo
  panel(5.458, 23.9, 14, 16, 5, texto(512, 160, null, (k, W, H) => { k.fillStyle = '#2fae6a'; k.font = 'bold 54px sans-serif'; k.fillText('CENTRO', 150, 50); k.fillText('COMERCIAL', 90, 100); k.fillText('SAN MARTÍN', 80, 150); }), .2);
  panel(5.56, 23.5, 13, 13, 6, texto(512, 240, null, (k, W, H) => { k.fillStyle = '#d98a62'; k.strokeStyle = '#6e2e18'; k.lineWidth = 4; k.font = 'bold 60px serif'; for (const [t, y] of [['CENTRO', 70], ['COMERCIAL', 145], ['SAN MARTÍN', 220]]) { k.strokeText(t, 40, y); k.fillText(t, 40, y); } }), .35);
  // Los Molinos (der., f_0062)
  panel(5.85, -18.8, 10, 12, 3, texto(512, 128, null, (k, W, H) => { k.fillStyle = '#5a4630'; k.font = 'italic bold 80px serif'; k.fillText('Los Molinos', 20, 95); }), -.15);
  // Lotería de Caracas: disco giratorio sobre un mástil, en la azotea del edificio ocre (izq., f_0061)
  { const P = enRuta(5.722, 39.5, 0, true), H = 12;
    add(new THREE.CylinderGeometry(.2, .25, H, 8), api.concrete(0x8a8a86), 0, H / 2, 0, P);
    const disco = texto(512, 512, null, (k, W, Hh) => { k.fillStyle = '#f4f0e2'; k.beginPath(); k.arc(W / 2, Hh / 2, W * .48, 0, 7); k.fill(); k.lineWidth = 18; k.strokeStyle = '#1f4fa0'; k.stroke();
      k.fillStyle = '#1f4fa0'; k.font = 'bold 72px sans-serif'; k.textAlign = 'center'; k.fillText('LOTERÍA', W / 2, Hh * .45); k.fillStyle = '#cf2a2a'; k.fillText('DE CARACAS', W / 2, Hh * .62); });
    const R = new THREE.Group(); R.position.y = H + 2.6; P.add(R);
    const m = new THREE.MeshStandardMaterial({ map: disco, transparent: true, alphaTest: .1, side: THREE.DoubleSide, roughness: .6 });
    add(new THREE.PlaneGeometry(5.2, 5.2), m, 0, 0, 0, R);
    api.onFrame(st => { R.rotation.y = st.t * .6; }); }

  return api.sombras(g);
}
