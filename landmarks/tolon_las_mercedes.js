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
  const brick = api.facade({ pared: '#a8643c', vidrio: '#2e3338', pisos: 7, vanos: 6, marco: .5, encendidas: .3, seed: 21, roughness: .9 });
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
  return api.sombras(root);
}
