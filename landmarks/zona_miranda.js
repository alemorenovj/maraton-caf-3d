// Zona miranda (km 32,6–37,3): lo singular que el video muestra y las huellas genéricas no dan.
// - Av. San Francisco (km 32,7–32,86): tapia de piedra a la izq. y galpón negro y naranja «NO PARE» a la der. (f_0305).
// - Baranda negra en zigzag sobre el muro central de la Av. Francisco de Miranda (km 33,05–34,68; f_0308–0319).
// - McDonald's AutoMac (poste y velas blancas) frente al C.C. Líder (km 33,84; f_0313–0314) y la torre en construcción
//   con grúa del Centro Empresarial Toyoca (km 33,98; f_0314–0315).
// - Murales de Boleíta: medianera pintada del bloque blanco (km 34,09) y la tapia de caras de Tocomé (km 34,4; f_0316–0318).
// - Poste rojo de KFC (km 34,69; f_0320) y la bomba de la izquierda en Los Dos Caminos (km 35,19; f_0324).
// - Parapetos de concreto gris del elevado de Los Dos Caminos (km 35,58–35,98; f_0327–0329): tapan la baranda amarilla fija.
// - Edificio de retícula blanca con cuadros azules y la M naranja del Metro Los Dos Caminos (km 35,42; f_0326).
// - Pasarela de Parque del Este: columnas amarillo y negro, cajón de acero gris (km 36,18; f_0332).
// - Letras verdes «BIENVENIDOS A SUCRE» con tres astas en la isla (km 36,27; f_0333) y la marquesina de celosía azul
//   de la estación Miranda (km 36,30–36,42; f_0333–0334).
export const meta = {
  id: 'zona_miranda', nombre: 'Zona miranda',
  quita: [[10.486463, -66.821942, 30], [10.494351, -66.832695, 12]],
};

export function build(THREE, api) {
  const g = new THREE.Group(), D = api.D;
  const add = (geo, mat, x, y, z, p = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };
  // punto a `off` m a la izquierda (negativo = derecha) del eje y `al` m hacia adelante, en el km dado
  const at = (km, off = 0, al = 0) => { const r = api.routeAt(km), x = r.x + r.lx * off + r.tx * al, z = r.z + r.lz * off + r.tz * al; return { x, z, y: api.ground(x, z), ry: r.y, r }; };
  // grupo alineado con la ruta: +Z local = sentido de carrera, +X local = izquierda del corredor
  const grupo = (km, off = 0, al = 0, y = null) => { const p = at(km, off, al), G = new THREE.Group(); G.position.set(p.x, y == null ? p.y : y, p.z); G.rotation.y = Math.atan2(p.r.tx, p.r.tz); g.add(G); return G; };
  const ll = (lat, lon) => { const p = api.xz(lat, lon); return { x: p.x, z: p.z, y: api.ground(p.x, p.z) }; };
  // barras delgadas entre dos puntos, todas en un InstancedMesh
  const barras = (lista, grosor, mat) => { if (!lista.length) return; const geo = new THREE.BoxGeometry(grosor, grosor, 1), im = new THREE.InstancedMesh(geo, mat, lista.length), o = new THREE.Object3D(), v = new THREE.Vector3();
    lista.forEach(([a, b], i) => { v.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const L = v.length(); o.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); o.scale.set(1, 1, Math.max(L, .01)); o.lookAt(b[0], b[1], b[2]); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    g.add(im); return im; };
  // huella del generador que contiene (o queda más cerca de) un punto lat/lon: [x0,z0,x1,z1,…]
  const huella = (lat, lon) => { const p = api.xz(lat, lon); let best = null, bd = 1e9;
    for (const e of D.edif) { const f = e[2], n = f.length / 2; let cx = 0, cz = 0; for (let i = 0; i < n; i++) { cx += f[i * 2]; cz += f[i * 2 + 1]; } cx /= n; cz /= n; const d = Math.hypot(cx - p.x, cz - p.z); if (d < bd) { bd = d; best = e; } }
    return bd < 40 ? best : null; };
  // pinta un mural sobre la pared de una huella que mejor mira hacia (dx, dz); hasta `alto` m; ancho máximo `maxW`
  const muralEn = (lat, lon, dx, dz, alto, tex, { y0 = 0, maxW = 1e9, rep = 0 } = {}) => { const e = huella(lat, lon); if (!e) return; const f = e[2], n = f.length / 2;
    let cx = 0, cz = 0; for (let i = 0; i < n; i++) { cx += f[i * 2]; cz += f[i * 2 + 1]; } cx /= n; cz /= n; let best = null, bs = -1e9;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n, ax = f[i * 2], az = f[i * 2 + 1], bx = f[j * 2], bz = f[j * 2 + 1], L = Math.hypot(bx - ax, bz - az); if (L < 4) continue;
      let nx = (bz - az) / L, nz = -(bx - ax) / L; const mx = (ax + bx) / 2, mz = (az + bz) / 2; if (nx * (mx - cx) + nz * (mz - cz) < 0) { nx = -nx; nz = -nz; }
      const s = (nx * dx + nz * dz) * Math.min(L, 60); if (s > bs) { bs = s; best = { ax, az, bx, bz, nx, nz, L }; } }
    if (!best) return; const W = Math.min(best.L, maxW), mx = (best.ax + best.bx) / 2, mz = (best.az + best.bz) / 2, y = api.ground(mx, mz);
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: .85 }); if (rep) { tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(Math.max(1, Math.round(W / rep)), 1); }
    const pl = add(new THREE.PlaneGeometry(W, alto), m, mx + best.nx * .12, y + y0 + alto / 2, mz + best.nz * .12); pl.rotation.y = Math.atan2(best.nx, best.nz); };

  // ───────── Materiales comunes ─────────
  const negro = api.concrete(0x1c1d1f, { roughness: .55, metalness: .4 }), grisC = api.concrete(0x9c9a94), blanco = api.concrete(0xf1f0ec);
  const amarillo = api.concrete(0xf0c419), azulM = api.concrete(0x2a5fae);

  // ───────── 1. Av. San Francisco: tapia de piedra (izq.) y galpón «NO PARE» (der.) ─────────
  { const piedra = api.canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#8d8778'; c.fillRect(0, 0, w, h); let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let y = 0; y < h; y += 14) for (let x = -(y % 28); x < w; x += 22 + r() * 14) { const v = 110 + r() * 60 | 0; c.fillStyle = `rgb(${v},${v - 6},${v - 18})`; c.beginPath(); c.ellipse(x + 10, y + 7, 10 + r() * 4, 6, 0, 0, 7); c.fill(); } });
    piedra.wrapS = THREE.RepeatWrapping;
    const pts = []; for (let km = 32.70; km <= 32.865; km += .005) { const p = at(km, 9.3); pts.push(p); }
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], L = Math.hypot(b.x - a.x, b.z - a.z), H = 3.2;
      const m = new THREE.MeshStandardMaterial({ map: piedra.clone(), roughness: .95 }); m.map.repeat.set(L / 5, 1); m.map.needsUpdate = true;
      const w = add(new THREE.BoxGeometry(.6, H, L + .05), m, (a.x + b.x) / 2, Math.min(a.y, b.y) + H / 2 - .2, (a.z + b.z) / 2); w.rotation.y = Math.atan2(b.x - a.x, b.z - a.z); }
    // galpón: zócalo de ladrillo naranja y paño negro arriba, letrero «NO PARE» con el portón
    const G = grupo(32.765, -17); const L = 62, H = 9;
    const lad = api.canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#a65a3c'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(60,25,12,.4)'; for (let y = 0; y < h; y += 4) c.fillRect(0, y, w, 1); for (let y = 0; y < h; y += 8) for (let x = (y / 4 % 2) * 6; x < w; x += 12) c.fillRect(x, y, 1, 4); });
    lad.wrapS = THREE.RepeatWrapping; lad.repeat.set(L / 6, 1);
    add(new THREE.BoxGeometry(14, H * .52, L), [new THREE.MeshStandardMaterial({ map: lad, roughness: .9 }), api.concrete(0xa5583a), grisC, grisC, new THREE.MeshStandardMaterial({ map: lad, roughness: .9 }), api.concrete(0xa5583a)], 0, H * .26, 0, G);
    add(new THREE.BoxGeometry(14, H * .48, L), api.concrete(0x1f1f21), 0, H * .76, 0, G);
    const np = api.canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#222'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8e4da'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.fillText('NO PARE', w / 2, 60); c.font = 'bold 20px sans-serif'; c.fillText('SALIDA', w / 2, 96); });
    const pn = add(new THREE.PlaneGeometry(4.2, 4), new THREE.MeshStandardMaterial({ map: np, roughness: .8 }), 7.02, 2.2, 6, G); pn.rotation.y = Math.PI / 2;
  }

  // ───────── 2. Baranda negra en zigzag sobre el muro central (km 33,05–34,68) ─────────
  { const V = D.via, lista = [], huecos = [[33.915, 33.945], [34.540, 34.565]];
    const offAt = km => { const a = V.ancho[Math.min(V.ancho.length - 1, Math.round(km / V.paso))] || 28; return Math.max((a - .55) / 2, 13.6) / 2 + .275; };
    const P = km => { const r = api.routeAt(km), off = offAt(km); return [r.x + r.lx * off, r.y + .9, r.z + r.lz * off]; };
    const paso = 2.6 / 1000; let prev = null;
    for (let km = 33.06; km <= 34.675; km += paso) {
      if (huecos.some(([a, b]) => km > a && km < b)) { prev = null; continue; }
      const p = P(km); if (prev) { const q = prev, m = [(p[0] + q[0]) / 2, p[1] + .95, (p[2] + q[2]) / 2];
        lista.push([[q[0], q[1] + .95, q[2]], [p[0], p[1] + .95, p[2]]], [[q[0], q[1] + .08, q[2]], [p[0], p[1] + .08, p[2]]], [[q[0], q[1] + .08, q[2]], m], [m, [p[0], p[1] + .08, p[2]]]); }
      lista.push([[p[0], p[1], p[2]], [p[0], p[1] + 1.02, p[2]]]); prev = p; }
    barras(lista, .055, negro);
  }

  // ───────── 3. McDonald's AutoMac y velas blancas frente al Líder (km 33,84) ─────────
  // (trazado 2, 19-nov) el eje de 33,53–33,95 se corrió 4–10 m al sur, a la calzada real: poste y velas conservan su sitio
  // (McDonald's a 33,5 m del eje nuevo), así que su distancia al eje crece lo mismo que se movió el eje
  { const G = grupo(33.832, -17);
    add(new THREE.CylinderGeometry(.28, .32, 13, 10), api.concrete(0xc0302a), 0, 6.5, 0, G);
    const mc = api.canvasTex(128, 160, (c, w, h) => { c.fillStyle = '#c8241c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffc72c'; c.lineWidth = 13; c.beginPath(); c.moveTo(18, 104); c.quadraticCurveTo(28, 12, 44, 20); c.quadraticCurveTo(64, 30, 64, 104); c.moveTo(64, 104); c.quadraticCurveTo(64, 30, 84, 20); c.quadraticCurveTo(100, 12, 110, 104); c.stroke();
      c.fillStyle = '#fff'; c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.fillText('AutoMac', w / 2, 146); });
    const mm = new THREE.MeshStandardMaterial({ map: mc, roughness: .6, emissive: 0xffffff, emissiveMap: mc, emissiveIntensity: .05 }); api.onFrame(st => { mm.emissiveIntensity = .05 + .8 * st.noche; });
    for (const s of [1, -1]) { const pl = add(new THREE.PlaneGeometry(3.2, 4), mm, 0, 13.6, s * .26, G); if (s < 0) pl.rotation.y = Math.PI; }
    add(new THREE.BoxGeometry(3.3, 4.1, .5), api.concrete(0xa81f18), 0, 13.6, 0, G);
    // velas tensadas: paraboloides de 4 puntas sobre mástiles blancos
    const vela = (x, z, w, d, hA, hB) => { const geo = new THREE.BufferGeometry(); const v = [-w / 2, hA, -d / 2, w / 2, hB, -d / 2, w / 2, hA, d / 2, -w / 2, hB, d / 2, 0, (hA + hB) / 2 - .5, 0];
      geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); geo.setIndex([0, 4, 1, 1, 4, 2, 2, 4, 3, 3, 4, 0]); geo.computeVertexNormals();
      const m = add(geo, new THREE.MeshStandardMaterial({ color: 0xf6f5f0, roughness: .7, side: THREE.DoubleSide }), x, 0, z, G2);
      for (const [px, pz, ph] of [[-w / 2, -d / 2, hA], [w / 2, -d / 2, hB], [w / 2, d / 2, hA], [-w / 2, d / 2, hB]]) add(new THREE.CylinderGeometry(.08, .1, ph, 6), blanco, x + px, ph / 2, z + pz, G2); return m; };
    const G2 = grupo(33.86, -19.5); vela(0, -10, 7, 6, 7.5, 5); vela(.5, -2.5, 7, 6, 5, 7.8); vela(0, 5, 7, 6, 7.5, 5.2); vela(.5, 12, 6, 5, 5.2, 7);
  }

  // ───────── 4. Torre en construcción con grúa (Centro Empresarial Toyoca, km 33,98) ─────────
  { const c = ll(10.486463, -66.821942), r = api.routeAt(33.98), G = new THREE.Group(); G.position.set(c.x, c.y, c.z); G.rotation.y = Math.atan2(r.tx, r.tz); g.add(G);
    const W = 30, Dd = 24, NP = 22, hp = 3.4, conc = api.concrete(0xa9a69e), conc2 = api.concrete(0x8f8c85);
    const losa = new THREE.InstancedMesh(new THREE.BoxGeometry(W + 1.2, .35, Dd + 1.2), conc, NP), o = new THREE.Object3D();
    for (let i = 0; i < NP; i++) { o.position.set(0, (i + 1) * hp, 0); o.updateMatrix(); losa.setMatrixAt(i, o.matrix); } G.add(losa);
    const cols = []; for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) cols.push([-W / 2 + i * W / 4, -Dd / 2 + j * Dd / 3]);
    const col = new THREE.InstancedMesh(new THREE.BoxGeometry(.8, NP * hp, .8), conc2, cols.length); cols.forEach(([x, z], i) => { o.position.set(x, NP * hp / 2, z); o.updateMatrix(); col.setMatrixAt(i, o.matrix); }); G.add(col);
    add(new THREE.BoxGeometry(7, NP * hp + 4, 6), conc2, 2, (NP * hp + 4) / 2, 0, G);   // núcleo de escaleras
    add(new THREE.BoxGeometry(W + 4, 6, Dd + 4), api.concrete(0xc9c5bb), 0, 3, 0, G);    // planta baja cerrada con lona
    // grúa torre amarilla
    const gy = amarillo, Hc = NP * hp + 16, cx = W / 2 + 4; const mast = [];
    for (let y = 0; y < Hc; y += 2.5) for (const [a, b] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) mast.push([[cx + a[0] * .9, y, a[1] * .9], [cx + b[0] * .9, y + 2.5, b[1] * .9]]);
    const ims = []; for (const [a, b] of mast) ims.push([a, b]);
    for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) add(new THREE.BoxGeometry(.18, Hc, .18), gy, cx + x * .9, Hc / 2, z * .9, G);
    const jib = add(new THREE.BoxGeometry(1.4, 1.4, 52), gy, cx, Hc + .7, -12, G); add(new THREE.BoxGeometry(3, 2.4, 3), api.concrete(0x6e6e6a), cx, Hc - .6, 10, G);
    add(new THREE.BoxGeometry(1, 3.4, 1), gy, cx, Hc + 2.4, 0, G); add(new THREE.CylinderGeometry(.03, .03, 24, 4), negro, cx, Hc - 12, -26, G);
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(.1, .1, 1), gy, ims.length), v = new THREE.Vector3();
    ims.forEach(([a, b], i) => { v.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); o.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); o.scale.set(1, 1, v.length()); o.lookAt(o.position.x + v.x, o.position.y + v.y, o.position.z + v.z); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); G.add(im);
  }

  // ───────── 5. Murales de Boleíta y la tapia de caras de Tocomé ─────────
  { const r = api.routeAt(34.08), mur = api.canvasTex(256, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#f2b6c6'); gr.addColorStop(.45, '#9fd3e6'); gr.addColorStop(1, '#f5d77a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      for (const [x, y, rr, col] of [[70, 140, 70, '#e86f8e'], [180, 260, 90, '#5fb6d9'], [90, 380, 80, '#f0a64a'], [200, 430, 50, '#7cc49a']]) { c.fillStyle = col; c.globalAlpha = .7; c.beginPath(); c.arc(x, y, rr, 0, 7); c.fill(); } c.globalAlpha = 1;
      c.strokeStyle = '#2b3a67'; c.lineWidth = 6; c.beginPath(); c.moveTo(40, 470); c.bezierCurveTo(90, 300, 160, 330, 210, 90); c.stroke(); });
    muralEn(10.486249, -66.823323, -r.tx, -r.tz, 16, mur, { y0: 0, maxW: 14 });
    const caras = api.canvasTex(1024, 128, (c, w, h) => { c.fillStyle = '#d9d2c2'; c.fillRect(0, 0, w, h); const tonos = ['#8a5a3c', '#c58b5f', '#6d4a33', '#b07a52', '#e0b48a'], fondos = ['#3f8fb5', '#e4a23a', '#7aa84f', '#c4473b', '#8b6bb0', '#2f6f5e'];
      for (let i = 0; i < 8; i++) { const x = i * 128; c.fillStyle = fondos[i % 6]; c.fillRect(x + 4, 6, 120, h - 12); c.fillStyle = tonos[i % 5]; c.beginPath(); c.ellipse(x + 64, 70, 34, 44, 0, 0, 7); c.fill();
        c.fillStyle = '#1d1a18'; c.beginPath(); c.ellipse(x + 64, 36, 36, 18, 0, Math.PI, 7); c.fill(); c.fillStyle = '#fff'; c.fillRect(x + 48, 64, 8, 4); c.fillRect(x + 72, 64, 8, 4); c.fillStyle = '#5a2a1e'; c.fillRect(x + 56, 92, 16, 4); } });
    // la tapia de Tocomé corre detrás de la acera de la calzada contraria (≈25 m a la izq.), 4 m de alto
    caras.wrapS = THREE.RepeatWrapping; const cm = new THREE.MeshStandardMaterial({ map: caras, roughness: .85 }), tapia = api.concrete(0xd6cfc1);
    for (let km = 34.27; km < 34.475; km += .025) { const a = at(km, 23.5), b = at(km + .025, 23.5), L = Math.hypot(b.x - a.x, b.z - a.z), y = Math.min(a.y, b.y), ry = Math.atan2(b.x - a.x, b.z - a.z);
      const t = caras.clone(); t.needsUpdate = true; t.repeat.set(L / 34 * 8 / 8 * 1, 1); const w = add(new THREE.BoxGeometry(.4, 4.2, L), [tapia, new THREE.MeshStandardMaterial({ map: t, roughness: .85 }), tapia, tapia, tapia, tapia], (a.x + b.x) / 2, y + 2.1 - .2, (a.z + b.z) / 2); w.rotation.y = ry; }
  }

  // ───────── 6. KFC (izq., km 34,69) y la bomba de la izq. en Los Dos Caminos (km 35,19) ─────────
  { const G = grupo(34.69, 31); add(new THREE.CylinderGeometry(.25, .3, 10, 8), grisC, 0, 5, 0, G);
    const k = api.canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#e4002b'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 76px sans-serif'; c.textAlign = 'center'; c.fillText('KFC', w / 2, 94); });
    const km = new THREE.MeshStandardMaterial({ map: k, roughness: .6, emissive: 0xffffff, emissiveMap: k, emissiveIntensity: .05 }); api.onFrame(st => { km.emissiveIntensity = .05 + .8 * st.noche; });
    add(new THREE.BoxGeometry(4.4, 2.2, .5), [grisC, grisC, grisC, grisC, km, km], 0, 10.8, 0, G);
    const T = grupo(35.19, 31); const H = 5.4; add(new THREE.BoxGeometry(12, .4, 15), blanco, 0, H, 0, T);
    for (const s of [1, -1]) add(new THREE.BoxGeometry(12.3, .9, .2), api.concrete(0xd52b1e), 0, H + .55, s * 7.6, T), add(new THREE.BoxGeometry(.2, .9, 15.3), api.concrete(0xd52b1e), s * 6.1, H + .55, 0, T);
    for (const x of [-3, 3]) for (const z of [-4, 4]) add(new THREE.BoxGeometry(.45, H, .45), amarillo, x, H / 2, z, T);
    for (const x of [-3, 3]) add(new THREE.BoxGeometry(1.1, 1.6, 6), api.concrete(0xd9d9d6), x, .8, 0, T);
  }

  // ───────── 7. Parapetos de concreto del elevado de Los Dos Caminos (tapan la baranda amarilla) ─────────
  { const ev = (D.elevados || []).find(e => /Dos Caminos/.test(e.nombre || '')); if (ev) {
    const pos = [], idx = []; const hw = api.ROAD_W / 2 + .8, ins = hw - .18, out = hw + .32, H = 1.18;
    let k = 0; for (let km = ev.km0; km <= ev.km1 + 1e-6; km += .004, k++) { const r = api.routeAt(km);
      for (const s of [1, -1]) { const ix = r.x + r.lx * ins * s, iz = r.z + r.lz * ins * s, ox = r.x + r.lx * out * s, oz = r.z + r.lz * out * s;
        pos.push(ix, r.y - .05, iz, ix, r.y + H, iz, ox, r.y + H, oz, ox, r.y - .9, oz); }
      if (k) { for (let sd = 0; sd < 2; sd++) { const a = ((k - 1) * 2 + sd) * 4, b = (k * 2 + sd) * 4; for (let f = 0; f < 3; f++) idx.push(a + f, b + f, a + f + 1, a + f + 1, b + f, b + f + 1); } } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    add(geo, new THREE.MeshStandardMaterial({ color: 0xa3a19b, roughness: .95, side: THREE.DoubleSide }), 0, 0, 0); } }

  // ───────── 8. Metro Los Dos Caminos: edificio de retícula blanca con cuadros azules y la M naranja ─────────
  { const e = huella(10.494351, -66.832695), H = 36;
    if (e) { const f = e[2], n = f.length / 2, sh = new THREE.Shape(); for (let i = 0; i < n; i++) (i ? sh.lineTo : sh.moveTo).call(sh, f[i * 2], -f[i * 2 + 1]);
      const geo = new THREE.ExtrudeGeometry(sh, { depth: H, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
      const t = api.canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#f3f4f5'; c.fillRect(0, 0, w, h); c.fillStyle = '#1f5fd0'; c.fillRect(14, 14, w - 28, h - 28); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(14, 14, w - 28, 20); });
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 4.2, 1 / 4.2);
      let cx = 0, cz = 0; for (let i = 0; i < n; i++) { cx += f[i * 2]; cz += f[i * 2 + 1]; } cx /= n; cz /= n;
      add(geo, [api.concrete(0xd9dbdd), new THREE.MeshStandardMaterial({ map: t, roughness: .3, metalness: .3 })], 0, api.ground(cx, cz) + 4, 0);
      const pb = new THREE.ExtrudeGeometry(sh, { depth: 4, bevelEnabled: false }); pb.rotateX(-Math.PI / 2); add(pb, api.concrete(0x3c3f44), 0, api.ground(cx, cz), 0); }
    const G = grupo(35.405, -10.5); add(new THREE.BoxGeometry(.3, 5, .3), negro, 0, 2.5, 0, G);
    const m = api.canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#f26a1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 100px sans-serif'; c.textAlign = 'center'; c.fillText('M', w / 2, 102); });
    const mm = new THREE.MeshStandardMaterial({ map: m, roughness: .5, emissive: 0xffffff, emissiveMap: m, emissiveIntensity: .1 }); api.onFrame(st => { mm.emissiveIntensity = .1 + .9 * st.noche; });
    add(new THREE.BoxGeometry(1.6, 1.6, .35), [grisC, grisC, grisC, grisC, mm, mm], 0, 5.6, 0, G);
    // la boca del Metro: marquesina oscura con el letrero «Los Dos Caminos»
    const B = grupo(35.425, -12); add(new THREE.BoxGeometry(6, .5, 8), api.concrete(0x2b2e33), 0, 3.2, 0, B);
    for (const x of [-2.7, 2.7]) for (const z of [-3.6, 3.6]) add(new THREE.BoxGeometry(.25, 3.2, .25), negro, x, 1.6, z, B);
    const lt = api.canvasTex(256, 32, (c, w, h) => { c.fillStyle = '#2b2e33'; c.fillRect(0, 0, w, h); c.fillStyle = '#e9e9e6'; c.font = '20px sans-serif'; c.fillText('Los Dos Caminos', 40, 23); });
    const lp = add(new THREE.PlaneGeometry(6, .5), new THREE.MeshStandardMaterial({ map: lt }), 3.02, 3.2, 0, B); lp.rotation.y = Math.PI / 2;
  }
  // ───────── 8b. C.C. Millennium Mall y Plaza Miranda (km 35,45–35,75, der.; arqs. Pimentel y Capiello, 2008) ─────────
  // Planta: triángulo OSM «Centro Comercial Millennium Mall» (punta al O sobre la plaza, lado S en diagonal hacia la Miranda, lado E sobre
  // la Av. Principal de Los Dos Caminos), confirmado en la foto satelital. Lo reconocible es el ala: el tercio O del techo sale en voladizo
  // como una cuchilla negra que sube hacia la punta, sobre columnas blancas en trípode invertido (guiaccs.com, Millenium Mall – Plaza Miranda).
  // Altura: ~30 m sobre la Rómulo Gallegos (sombra en la satelital); la caja blanca del techo, 4 m más. Desde la Miranda NO se ve de frente:
  // al pasar por la Av. Principal de Los Dos Caminos lo tapa el edificio de retícula azul (video, s 812–814); asoma a la derecha desde el
  // elevado (s 815–818). La torre cilíndrica azul que antes iba aquí es otra (al N de la Rómulo Gallegos, corrección en miranda.js).
  { const P = (la, lo) => api.xz(la, lo), A = P(10.495659, -66.833753), C = P(10.494749, -66.83246), Dn = P(10.495424, -66.832299);
    const lerp2 = (p, q, t) => ({ x: p.x + (q.x - p.x) * t, z: p.z + (q.z - p.z) * t });
    const g0 = Math.min(api.ground(A.x, A.z), api.ground(C.x, C.z), api.ground(Dn.x, Dn.z)), gN = api.ground(Dn.x, Dn.z), yT = gN + 30;
    const cut = .30, B1 = lerp2(A, C, cut), B2 = lerp2(A, Dn, cut);
    // sólido a partir de triángulos sueltos: corrige el orden de cada uno para que su normal mire hacia fuera del centro dado
    const solido = (tris, mat, cen) => { const pos = []; for (const [a, b, c] of tris) { const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, mx = (a[0] + b[0] + c[0]) / 3 - cen[0], my = (a[1] + b[1] + c[1]) / 3 - cen[1], mz = (a[2] + b[2] + c[2]) / 3 - cen[2];
        if (nx * mx + ny * my + nz * mz < 0) pos.push(...a, ...c, ...b); else pos.push(...a, ...b, ...c); }
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(pos.length / 3 * 2), 2)); ge.computeVertexNormals(); return add(ge, mat, 0, 0, 0); };
    // prisma de planta poligonal (x,z) entre y0 e y1, con tapas
    const prisma = (pl, y0, y1, mat) => { const sh = new THREE.Shape(); pl.forEach((p, i) => (i ? sh.lineTo : sh.moveTo).call(sh, p.x, -p.z)); const ge = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false }); ge.rotateX(-Math.PI / 2); return add(ge, mat, 0, y0, 0); };
    // paño plano pegado a la cara exterior del segmento p→q (su cara frontal mira hacia fuera de `cen`)
    const pano = (p, q, y0, y1, mat, cen, sep = .18, w0 = 0, w1 = 1) => { const a = lerp2(p, q, w0), b = lerp2(p, q, w1), L = Math.hypot(b.x - a.x, b.z - a.z); let nx = (b.z - a.z) / L, nz = -(b.x - a.x) / L;
      if (nx * ((a.x + b.x) / 2 - cen.x) + nz * ((a.z + b.z) / 2 - cen.z) < 0) { nx = -nx; nz = -nz; }
      const m = add(new THREE.PlaneGeometry(L, y1 - y0), mat, (a.x + b.x) / 2 + nx * sep, (y0 + y1) / 2, (a.z + b.z) / 2 + nz * sep); m.rotation.y = Math.atan2(nx, nz); return m; };
    const cen = { x: (B1.x + C.x + Dn.x + B2.x) / 4, z: (B1.z + C.z + Dn.z + B2.z) / 4 };
    // cuerpo comercial (concreto claro) y la caja blanca del techo (cines)
    prisma([B1, C, Dn, B2], g0 - 2, yT, api.concrete(0xd3d1cb));
    { const u = { x: (C.x - A.x) / Math.hypot(C.x - A.x, C.z - A.z), z: (C.z - A.z) / Math.hypot(C.x - A.x, C.z - A.z) }; let v = { x: -u.z, z: u.x }; if (v.x * (Dn.x - A.x) + v.z * (Dn.z - A.z) < 0) v = { x: u.z, z: -u.x };
      const q = (s, t) => ({ x: A.x + u.x * s + v.x * t, z: A.z + u.z * s + v.z * t }); prisma([q(64, 3), q(136, 3), q(136, 27), q(64, 27)], yT - 1, yT + 4, api.concrete(0xf1f0eb)); }
    // fachadas: muro cortina verdeazulado al N (Rómulo Gallegos) y al O (bajo el ala, hacia la plaza); al S y al E, bandas de concreto y vidrio
    const cort = api.facade({ pared: '#3d5a63', vidrio: '#2c4f5e', pisos: 8, vanos: 12, marco: .06, encendidas: .35, roughness: .2, metalness: .6, env: 1.1 }); cort.map.repeat.set(4, 1); cort.emissiveMap.repeat.set(4, 1);
    const band = api.facade({ pared: '#d7d3c9', vidrio: '#56707c', pisos: 7, vanos: 10, bandas: 1, encendidas: .2 }); band.map.repeat.set(5, 1); band.emissiveMap.repeat.set(5, 1);
    const cortO = api.facade({ pared: '#3d5a63', vidrio: '#2c4f5e', pisos: 8, vanos: 8, marco: .06, encendidas: .35, roughness: .2, metalness: .6, env: 1.1 });
    pano(B2, Dn, g0, yT, cort, cen); pano(B1, B2, g0, yT, cortO, cen); pano(C, Dn, g0, yT, band, cen); pano(B1, C, g0, yT, band, cen);
    // pantallas LED y letrero «MILLENNIUM» (brillan más de noche)
    const led = api.canvasTex(512, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#0b2a5c'); gr.addColorStop(1, '#2a74c9'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.fillStyle = '#e8eef5'; c.beginPath(); c.ellipse(w * .62, h * .62, w * .26, h * .13, 0, 0, 7); c.fill(); c.fillStyle = '#c9312b'; c.fillRect(w * .4, h * .55, w * .44, h * .09);
      c.fillStyle = '#fff'; c.font = 'bold 56px sans-serif'; c.fillText('NUEVO', 26, 78); c.font = '30px sans-serif'; c.fillText('Millennium Mall', 26, 122); });
    const ledM = new THREE.MeshStandardMaterial({ map: led, emissive: 0xffffff, emissiveMap: led, emissiveIntensity: .45, roughness: .4 }); api.onFrame(st => { ledM.emissiveIntensity = .45 + 1.1 * st.noche; });
    pano(B1, B2, g0 + 9, g0 + 24, ledM, cen, .4, .55, .95); pano(B2, Dn, g0 + 12, g0 + 26, ledM, cen, .4, .08, .3);
    const letr = api.canvasTex(1024, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.font = 'bold 96px sans-serif'; c.textAlign = 'center'; c.fillText('MILLENNIUM', w / 2, 100); });
    const letM = new THREE.MeshStandardMaterial({ map: letr, alphaTest: .5, emissive: 0xffffff, emissiveMap: letr, emissiveIntensity: .2 }); api.onFrame(st => { letM.emissiveIntensity = .2 + 1.2 * st.noche; });
    pano(B2, Dn, yT - 5.5, yT - 1, letM, cen, .5, .38, .78); pano(B1, C, yT - 5.5, yT - 1, letM, cen, .5, .2, .45);
    // zócalo rojo ladrillo y vidrio verde a la altura de la plaza, bajo el ala (foto de referencia)
    pano(B1, B2, g0, g0 + 4.5, api.glass(0x2f6b55, { roughness: .25 }), cen, .3); pano(B1, B2, g0 + 4.5, g0 + 8.5, api.concrete(0x9c3b2c), cen, .3);
    // el ala: cuchilla triangular que sale del techo y sube hacia la punta, gris metálico arriba y negra por debajo
    const R1 = lerp2(A, C, .40), R2 = lerp2(A, Dn, .40), yR = yT + .5, yP = yT + 15, tR = 3.2, tP = .35;
    const top = [[A.x, yP + tP / 2, A.z], [R1.x, yR + tR / 2, R1.z], [R2.x, yR + tR / 2, R2.z]], bot = [[A.x, yP - tP / 2, A.z], [R1.x, yR - tR / 2, R1.z], [R2.x, yR - tR / 2, R2.z]];
    const wc = [(A.x + R1.x + R2.x) / 3, (yP + 2 * yR) / 3, (A.z + R1.z + R2.z) / 3];   // centroide real: las tapas quedan a uno y otro lado
    solido([top, [top[0], bot[0], top[1]], [top[1], bot[0], bot[1]], [top[0], top[2], bot[0]], [top[2], bot[2], bot[0]], [top[1], bot[1], top[2]], [top[2], bot[1], bot[2]]], api.concrete(0x7f858b, { roughness: .45, metalness: .45 }), wc);
    solido([bot], api.concrete(0x1d1f22, { roughness: .6 }), [wc[0], wc[1] + 50, wc[2]]);
    // trípodes blancos: fuste desde la plaza y tres brazos abiertos hasta el ala
    const blancoT = api.concrete(0xf3f3f0, { roughness: .5 }), up = new THREE.Vector3(0, 1, 0), tubos = [];
    const tubo = (a, b, r) => { const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length(), m = add(new THREE.CylinderGeometry(r, r * 1.15, L, 8), blancoT, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); m.quaternion.setFromUnitVectors(up, d.normalize()); tubos.push(m); };
    for (const f of [.3, .5, .68]) { const c0 = lerp2(A, lerp2(R1, R2, .5), f), x = c0.x, z = c0.z, yb = api.ground(x, z), ys = yb + 11, yw = yP + (yR - yP) * f - (tP + (tR - tP) * f) / 2 - .1;
      tubo([x, yb - .5, z], [x, ys, z], .75); const half = Math.hypot(R1.x - R2.x, R1.z - R2.z) * f * .2, ex = (R1.x - R2.x) / Math.hypot(R1.x - R2.x, R1.z - R2.z), ez = (R1.z - R2.z) / Math.hypot(R1.x - R2.x, R1.z - R2.z), ax = -ez, az = ex;
      for (const [s, t] of [[1, 0], [-1, 0], [0, 1]]) { const px = x + ex * half * s + ax * 3.5 * t, pz = z + ez * half * s + az * 3.5 * t; tubo([x, ys, z], [px, yw + (s ? 0 : -.6), pz], .45); } }
    // Plaza Miranda: plataforma con espejos de agua turquesa, estatua de Miranda, jardineras y chaguaramos (las palmas van en `arboles`)
    const agua = new THREE.MeshStandardMaterial({ color: 0x48b7c9, roughness: .08, metalness: .15, emissive: 0x2a8fa8, emissiveIntensity: 0 }); api.onFrame(st => { agua.emissiveIntensity = .35 * st.noche; });
    const piedra = api.concrete(0xcfc6b4);
    const espejo = (pts) => { const pl = pts.map(([a, b]) => P(a, b)), gy = Math.max(...pl.map(p => api.ground(p.x, p.z))) + .45, c = { x: pl.reduce((s, p) => s + p.x, 0) / pl.length, z: pl.reduce((s, p) => s + p.z, 0) / pl.length };
      const out = pl.map(p => { const dx = p.x - c.x, dz = p.z - c.z, L = Math.hypot(dx, dz); return { x: p.x + dx / L * .9, z: p.z + dz / L * .9 }; });
      prisma(out, gy - 1.6, gy + .15, piedra); const sh = new THREE.Shape(); pl.forEach((p, i) => (i ? sh.lineTo : sh.moveTo).call(sh, p.x, -p.z)); const ge = new THREE.ShapeGeometry(sh); ge.rotateX(-Math.PI / 2); add(ge, agua, 0, gy + .2, 0); return gy; };
    const gyE = espejo([[10.495832, -66.834647], [10.495832, -66.834486], [10.495620, -66.834486], [10.495620, -66.834647]]);
    espejo([[10.495604, -66.834695], [10.495604, -66.834558], [10.495232, -66.834647], [10.495232, -66.834789]]);
    { const s = P(10.495710, -66.834593), bronce = api.concrete(0x3b3428, { roughness: .5, metalness: .4 }); add(new THREE.BoxGeometry(2.4, 3.2, 2.4), piedra, s.x, gyE + 1.6, s.z);
      add(new THREE.CylinderGeometry(.42, .5, 1.9, 8), bronce, s.x, gyE + 4.15, s.z); add(new THREE.SphereGeometry(.3, 8, 6), bronce, s.x, gyE + 5.4, s.z);
      const br = add(new THREE.BoxGeometry(.16, 1.7, .16), bronce, s.x + .55, gyE + 5.3, s.z); br.rotation.z = -.5; }
    // jardineras escalonadas al S de la plataforma (franjas verdes de la satelital)
    { const ver = api.concrete(0x4f7a3b), bor = api.concrete(0xb9b2a3); [[10.495420, -66.834430], [10.495420, -66.834250], [10.495330, -66.834520], [10.495330, -66.834340], [10.495240, -66.834430], [10.495240, -66.834180]].forEach(([a, b]) => { const p = P(a, b), y = api.ground(p.x, p.z);
        add(new THREE.BoxGeometry(12, .7, 6), bor, p.x, y + .35, p.z).rotation.y = -.42; add(new THREE.BoxGeometry(11.2, .12, 5.2), ver, p.x, y + .72, p.z).rotation.y = -.42; }); }
  }

  // ───────── 9. Pasarela de Parque del Este (km 36,18) ─────────
  { const P = grupo(36.18, 0, 0, api.routeAt(36.18).y); const H = 5.7, xL = 25, xR = -11.5, L = xL - xR, cx = (xL + xR) / 2;
    const rayas = api.canvasTex(64, 256, (c, w, h) => { c.fillStyle = '#f2c21a'; c.fillRect(0, 0, w, h); c.fillStyle = '#151515'; for (let y = -64; y < h; y += 48) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + 32); c.lineTo(w, y + 56); c.lineTo(0, y + 24); c.fill(); } });
    const colM = new THREE.MeshStandardMaterial({ map: rayas, roughness: .6 }), acero = api.concrete(0x8a8c8d, { metalness: .4, roughness: .6 }), oxido = api.concrete(0xa25f37);
    add(new THREE.BoxGeometry(L, .45, 2.6), oxido, cx, H, 0, P);
    for (const s of [1, -1]) { add(new THREE.BoxGeometry(L, .12, .12), acero, cx, H + 2.3, s * 1.3, P); add(new THREE.BoxGeometry(L, .2, .2), acero, cx, H + .3, s * 1.3, P);
      const malla = api.canvasTex(64, 64, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(70,72,74,.85)'; c.lineWidth = 2; for (let i = -64; i < 128; i += 8) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 64, 64); c.stroke(); c.beginPath(); c.moveTo(i + 64, 0); c.lineTo(i, 64); c.stroke(); } });
      malla.wrapS = malla.wrapT = THREE.RepeatWrapping; malla.repeat.set(L / 1.5, 1.4);
      const mp = add(new THREE.PlaneGeometry(L, 2), new THREE.MeshStandardMaterial({ map: malla, transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: .7 }), cx, H + 1.3, s * 1.3, P); }
    const nk = Math.floor(L / 3); for (let i = 0; i <= nk; i++) { const x = xR + i * L / nk; for (const s of [1, -1]) add(new THREE.BoxGeometry(.12, 2.1, .12), acero, x, H + 1.3, s * 1.3, P); add(new THREE.BoxGeometry(.1, .1, 2.6), acero, x, H + 2.3, 0, P); }
    for (const x of [xL - 1.2, 9.8, xR + 1.1]) for (const z of [-1, 1]) add(new THREE.BoxGeometry(.55, H, .55), colM, x, H / 2, z, P);
    // escalera a la derecha, paralela a la acera, bajando hacia atrás
    const esc = (x0) => { const len = Math.hypot(H, 15), m = add(new THREE.BoxGeometry(1.6, .3, len), oxido, x0, H / 2, 1.3 + 7.5, P); m.rotation.x = Math.atan2(H, 15);
      for (const s of [-.8, .8]) { const r = add(new THREE.BoxGeometry(.06, .06, len), acero, x0 + s, H / 2 + 1, 1.3 + 7.5, P); r.rotation.x = m.rotation.x; } };
    esc(xR - .9);
  }

  // ───────── 10. «BIENVENIDOS A SUCRE» y tres astas en la isla (km 36,27) ─────────
  { const ancho = D.via.ancho[Math.round(36.27 / D.via.paso)] || 34, iso = Math.max((ancho - 5) / 2, 13.6) / 2 + 2.5, P = grupo(36.27, iso);
    const t = api.canvasTex(1024, 320, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#1e6b3c'; c.font = 'bold 150px sans-serif'; c.textAlign = 'center'; c.fillText('BIENVENIDOS', w / 2, 140); c.fillText('A SUCRE', w / 2, 300); });
    const tm = new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, side: THREE.DoubleSide, roughness: .7 });
    for (const d of [0, .25, .5]) { const p = add(new THREE.PlaneGeometry(9.5, 3), tm, d - .25, 1.9, 0, P); p.rotation.y = Math.PI / 4; }   // mira en diagonal a la calzada contraria: desde aquí se lee al revés, como en el video
    add(new THREE.BoxGeometry(1.4, .4, 10), grisC, 0, .2, 0, P);
    const bandera = api.canvasTex(96, 64, (c, w, h) => { c.fillStyle = '#f7d117'; c.fillRect(0, 0, w, h / 3); c.fillStyle = '#0033a0'; c.fillRect(0, h / 3, w, h / 3); c.fillStyle = '#cf142b'; c.fillRect(0, 2 * h / 3, w, h / 3); c.fillStyle = '#fff'; for (let i = 0; i < 8; i++) { const a = Math.PI * (.2 + .6 * i / 7); c.fillRect(w / 2 - Math.cos(a) * 18 - 1, h / 2 + 8 - Math.sin(a) * 14 - 1, 3, 3); } });
    const bm = new THREE.MeshStandardMaterial({ map: bandera, side: THREE.DoubleSide, roughness: .8 });
    [[.5, 7], [-.5, 9.5], [.8, 12]].forEach(([x, z], i) => { const h = 9 + i * .6; add(new THREE.CylinderGeometry(.06, .08, h, 6), blanco, x, h / 2, z, P); const fl = add(new THREE.PlaneGeometry(2.1, 1.4), bm, x, h - .8, z - 1.1, P); fl.rotation.y = Math.PI / 2; fl.rotation.z = .08; });
  }

  // ───────── 11. Marquesina de celosía azul de la estación Miranda (km 36,30–36,42, der.) ─────────
  { const P = grupo(36.355, -27); const Lg = 70, Dd = 26, H = 11, azul = api.concrete(0x1f63c9, { metalness: .3, roughness: .5 });
    const cel = api.canvasTex(256, 128, (c, w, h) => { c.fillStyle = 'rgba(150,190,230,.35)'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1f63c9'; c.lineWidth = 4; for (let x = -128; x < w + 128; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 64, h); c.stroke(); c.beginPath(); c.moveTo(x + 64, 0); c.lineTo(x, h); c.stroke(); } c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke(); });
    cel.wrapS = cel.wrapT = THREE.RepeatWrapping; cel.repeat.set(Lg / 14, 1);
    const cm = new THREE.MeshStandardMaterial({ map: cel, transparent: true, side: THREE.DoubleSide, depthWrite: false, roughness: .4, metalness: .2 });
    add(new THREE.BoxGeometry(Dd, .8, Lg), azul, 0, H, 0, P);
    add(new THREE.BoxGeometry(Dd + 1.5, 1.4, .6), azul, 0, H + .3, Lg / 2, P); add(new THREE.BoxGeometry(Dd + 1.5, 1.4, .6), azul, 0, H + .3, -Lg / 2, P);
    // cara inclinada de celosía hacia la avenida y cuerpo de malla verde abajo
    const fr = add(new THREE.PlaneGeometry(Lg, Math.hypot(H - 4, 6)), cm, Dd / 2 + 3, (H + 4) / 2, 0, P); fr.rotation.y = Math.PI / 2; fr.rotation.x = 0; fr.rotation.z = 0; fr.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.atan2(6, H - 4));
    add(new THREE.BoxGeometry(.6, .6, Lg), azul, Dd / 2 + 6, 4, 0, P);
    for (let z = -Lg / 2 + 3; z <= Lg / 2 - 3; z += 8) { add(new THREE.BoxGeometry(.5, H, .5), azul, -Dd / 2 + 1, H / 2, z, P); add(new THREE.BoxGeometry(.4, 4, .4), azul, Dd / 2 + 6, 2, z, P); }
    const verde = api.canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#2f7f5c'; c.fillRect(0, 0, w, h); c.fillStyle = '#9fd0b5'; for (let x = 0; x < w; x += 8) c.fillRect(x, 0, 3, h); });
    verde.wrapS = THREE.RepeatWrapping; verde.repeat.set(Lg / 6, 1);
    const vw = add(new THREE.PlaneGeometry(Lg - 6, 3.2), new THREE.MeshStandardMaterial({ map: verde, roughness: .8, side: THREE.DoubleSide }), Dd / 2 - 2, 1.6, 0, P); vw.rotation.y = Math.PI / 2;
  }
  // ───────── 12. Guardarriel amarillo abierto del elevado de Los Ruices (km 34,82–35,10; f_0322–0323) ─────────
  // (auditoría 19-nov) El motor pone en todo `elevado` un paño amarillo semitransparente de 1,05 m que se ve como un muro lleno. En el video
  // la baranda es abierta: bordillo gris, viga de doble onda a media altura, pasamanos tubular y parales cada 2 m, todo amarillo.
  // Aquí se dibuja esa baranda; el paño del motor se apaga SOLO en este elevado con `sinBaranda` (el de Los Dos Caminos ya lo tapan los parapetos de concreto).
  { const ev = (D.elevados || []).find(e => /Ruices/.test(e.nombre || '')); if (ev) {
    const hw = api.ROAD_W / 2 + .8, amar = api.concrete(0xe9b923, { roughness: .55, metalness: .35 }), gris = api.concrete(0x9c9d99), rails = [], postes = [];
    const pt = (km, sd, dy) => { const r = api.routeAt(km); return [r.x + r.lx * hw * sd, r.y + dy, r.z + r.lz * hw * sd]; };
    const paso = .002; for (const sd of [1, -1]) for (let km = ev.km0; km < ev.km1 - 1e-6; km += paso) { const k2 = Math.min(ev.km1, km + paso);
      for (const dy of [.5, .62, 1.02]) rails.push([pt(km, sd, dy), pt(k2, sd, dy)]);
      postes.push([pt(km, sd, 0), pt(km, sd, 1.05)]); }
    barras(rails, .09, amar); barras(postes, .1, amar);
    const curb = []; for (const sd of [1, -1]) for (let km = ev.km0; km < ev.km1 - 1e-6; km += .004) curb.push([pt(km, sd, .1), pt(Math.min(ev.km1, km + .004), sd, .1)]);
    barras(curb, .24, gris);
    // el paño amarillo del motor de este elevado lo apaga `sinBaranda` en fx/correcciones/miranda.js
  } }
  return api.sombras(g);
}
