// Tolón Fashion Mall, Las Mercedes (Av. Principal de Las Mercedes): bloque de ladrillo terracota de 7 niveles con
// bandas de vidrio y vallas, y el pilón de vallas de la esquina (≈45 m) con las vallas azules (Mercantil, Movistar)
// y el farol de vidrio en la punta. Planta: huella OSM; la esquina del pilón está a criterio (foto de Commons).
export const meta = {
  id: 'tolon_las_mercedes',
  nombre: 'Tolón Fashion Mall',
  quita: [[10.480332, -66.860787, 55], [10.480584, -66.860398, 22]],
};

export function build(THREE, api) {
  const root = new THREE.Group();
  const P = [[2340.8, 761.7], [2419.2, 679.8], [2382.1, 644.8], [2402.6, 626.1], [2349.2, 578.5], [2344.4, 669.9]];
  const P2 = [[2404.7, 626.2], [2386.1, 645.8], [2420.6, 677.9], [2439.2, 658.2]]; // anexo "Shopping Mall"
  const ext = (pts, h, mat, top) => { const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cz = pts.reduce((s, p) => s + p[1], 0) / pts.length, y0 = Math.min(...pts.map(([x, z]) => api.ground(x, z))) - .3;
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x - cx, -(z - cz)))), { depth: h, bevelEnabled: false }), [top, mat]);
    m.rotation.x = -Math.PI / 2; m.position.set(cx, y0, cz); root.add(m); return y0; };
  const brick = api.facade({ pared: '#9d6043', vidrio: '#2e3338', pisos: 7, vanos: 6, marco: .5, encendidas: .3, seed: 21, roughness: .9 });
  brick.map.repeat.set(1 / 30, 1 / 28); brick.emissiveMap.repeat.set(1 / 30, 1 / 28);
  const y0 = ext(P, 28, brick, api.concrete(0x7a6b5d));
  // 19-nov: el anexo da a la avenida y en el video es terracota con bandas de vidrio oscuro y letreros (f_0247), no una caja de vidrio azul
  const glassM = api.facade({ pared: '#b4714c', vidrio: '#2c3338', pisos: 5, vanos: 8, marco: .45, encendidas: .35, seed: 22, roughness: .85 });
  glassM.map.repeat.set(1 / 24, 1 / 20); glassM.emissiveMap.repeat.set(1 / 24, 1 / 20);
  ext(P2, 20, glassM, api.concrete(0x6e6e6e));

  // --- pilón de vallas en la esquina norte (hacia la avenida) ---
  const C = { x: 2356, z: 590 }, g = new THREE.Group(); g.position.set(C.x, y0, C.z);
  const rp = api.routeAt(25.25); g.rotation.y = Math.atan2(rp.tx, rp.tz) - Math.PI / 2; root.add(g); // las vallas miran a la calle
  const steel = new THREE.MeshStandardMaterial({ color: 0xc7ccd2, metalness: .7, roughness: .35 }), M = new THREE.Matrix4();
  const cols = new THREE.InstancedMesh(new THREE.CylinderGeometry(.35, .35, 46, 8), steel, 4);
  [[-2.6, -2.6], [2.6, -2.6], [2.6, 2.6], [-2.6, 2.6]].forEach(([x, z], i) => { M.makeTranslation(x, 23, z); cols.setMatrixAt(i, M); }); g.add(cols);
  const rings = new THREE.InstancedMesh(new THREE.BoxGeometry(6, .35, 6), steel, 10); for (let i = 0; i < 10; i++) { M.makeTranslation(0, 4 + i * 4.4, 0); rings.setMatrixAt(i, M); } g.add(rings);
  const board = (txt, bg, fg, sub) => api.canvasTex(256, 512, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 58px Arial, sans-serif'; x.fillText(txt, w / 2, h * .68);
    if (sub) { x.strokeStyle = sub; x.lineWidth = 22; x.beginPath(); x.moveTo(w * .25, h * .35); x.quadraticCurveTo(w * .5, h * .15, w * .75, h * .35); x.stroke(); } x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = 6; x.strokeRect(6, 6, w - 12, h - 12); });
  const mk = (tex) => { const m = new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: .15, roughness: .6 }); api.onFrame(st => { m.emissiveIntensity = .15 + 1.2 * st.noche; }); return m; };
  const bMerc = mk(board('Mercantil', '#0b3a8c', '#ffffff')), bMov = mk(board('movistar', '#16346d', '#ffffff', '#7ac143'));
  const side = api.concrete(0x2b3f66);
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(5.6, 11, 5.6), [bMerc, bMerc, side, side, bMerc, bMerc]); b1.position.y = 37; g.add(b1);
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(6.4, 10, 6.4), [bMov, bMov, side, side, bMov, bMov]); b2.position.y = 25; g.add(b2);
  // farol de vidrio con corona
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 4.5, 8), api.glass(0x9fb8c8, { transparent: true, opacity: .75 })); lantern.position.y = 45.5; g.add(lantern);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.0, .8, 8), steel); crown.position.y = 48.2; g.add(crown);
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 3, 8), api.glow(0xfff0c8, { dia: .1, noche: 2 })); lamp.position.y = 45.5; g.add(lamp);
  // marquesina de la entrada de la esquina
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(16, .6, 9), api.concrete(0xdad6cc)); canopy.position.set(0, 7, 5); g.add(canopy);
  // --- 21-nov: frente a la avenida (video t=615–617 s, cámara con capó): en la esquina de La Trinidad una caja de vidrio volada con el
  // letrero azul, marquesina y escalinata a la entrada; a lo largo, planta baja de vitrinas oscuras con letreros azules. Antes la
  // fachada era un paño naranja liso. Marco de la ruta: R = derecha (−lx); la cara del edificio va a ~16,8 m del eje.
  {
    const F = (k, d, y) => { const r = api.routeAt(k); return { x: r.x - r.lx * d, y: y, z: r.z - r.lz * d, r }; };
    const yb = api.routeAt(25.245).y, rf = api.routeAt(25.27), ry = Math.atan2(rf.tx, rf.tz);   // +Z local a lo largo de la avenida
    const caja = (k0, k1, d0, d1, y0, y1, mat) => { const a = F((k0 + k1) / 2, (d0 + d1) / 2, 0), L = Math.hypot(F(k1, 0, 0).x - F(k0, 0, 0).x, F(k1, 0, 0).z - F(k0, 0, 0).z);
      const m = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(d1 - d0), y1 - y0, L), mat); m.position.set(a.x, yb + (y0 + y1) / 2, a.z); m.rotation.y = ry; root.add(m); return m; };
    const vid = api.glass(0x5f7584, { roughness: .12 }), gris = api.concrete(0xb9b4ab), oscuro = api.concrete(0x2b2f33, { roughness: .4 });
    // caja de vidrio de la esquina (pisos 2–4), con marco gris y el panel azul del letrero (sin texto: en el video de 2024 es una valla que no se lee; las cajas «ESPRIT» de la planta baja sí se leen, t=616,5)
    caja(25.237, 25.253, 15.4, 18.5, 4.2, 15.5, vid); caja(25.236, 25.254, 15.25, 18.6, 15.5, 16.3, gris); caja(25.236, 25.254, 15.25, 18.6, 3.6, 4.2, gris);
    const azul = api.canvasTex(1024, 256, (x, w, h) => { x.fillStyle = '#1f4f9e'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 8; x.strokeRect(10, 10, w - 20, h - 20); });
    const mAz = new THREE.MeshStandardMaterial({ map: azul, emissive: 0xffffff, emissiveMap: azul, emissiveIntensity: .08, roughness: .6 }); api.onFrame(st => { mAz.emissiveIntensity = .08 + 1.1 * st.noche; });
    { const p = F(25.245, 15.3, 0), b = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.4), mAz); b.position.set(p.x, yb + 11.5, p.z); b.rotation.y = Math.atan2(rf.lx, rf.lz); root.add(b); }
    // marquesina y escalinata de la entrada (seis peldaños hasta +1,2 m)
    caja(25.236, 25.256, 11.8, 16.9, 3.7, 4.1, gris);
    for (let i = 0; i < 6; i++) caja(25.238, 25.252, 12.6 + i * .5, 16.9, -.3, .2 * (i + 1), api.concrete(0xd2cdc4));
    for (const k of [25.238, 25.252]) caja(k - .0006, k + .0006, 12.0, 12.6, -.3, 3.7, gris);
    // planta baja de vitrinas oscuras con letreros azules a lo largo de la fachada
    const vitr = api.canvasTex(1024, 128, (x, w, h) => { x.fillStyle = '#23292e'; x.fillRect(0, 0, w, h); x.fillStyle = '#3d4b56'; for (let i = 0; i < 16; i++) x.fillRect(i * 64 + 4, 30, 56, 96);
      x.fillStyle = '#c9c4ba'; x.fillRect(0, 0, w, 26); x.fillStyle = '#1f4f9e'; for (let i = 0; i < 4; i++) x.fillRect(i * 256 + 40, 3, 150, 20); x.fillStyle = '#fff'; x.font = 'bold 15px Arial'; for (let i = 0; i < 4; i++) x.fillText('ESPRIT', i * 256 + 84, 18); });
    vitr.wrapS = THREE.RepeatWrapping; const mVi = new THREE.MeshStandardMaterial({ map: vitr, roughness: .35, metalness: .2 });
    caja(25.254, 25.302, 16.6, 16.9, -.3, 4.3, [mVi, oscuro, oscuro, oscuro, oscuro, oscuro]);
  }
  return api.sombras(root);
}
