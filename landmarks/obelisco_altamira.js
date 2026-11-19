// Plaza Francia de Altamira: obelisco color crema (33 m) sobre su fuente de tazas escalonadas, los dos espejos de agua
// azules (norte y sur), la cascada escalonada del extremo sur con su fuente semicircular y el muro con hornacina.
// Posiciones medidas sobre la foto satelital (el obelisco coincide con el nodo OSM "Obelisco de la Plaza Francia").
export const meta = {
  id: 'obelisco_altamira',
  nombre: 'Plaza Francia y Obelisco de Altamira',
  quita: [[10.496537, -66.848911, 6]],
};

export function build(THREE, api) {
  const root = new THREE.Group();
  const O = { x: 3668.7, z: -1117.8 }, ROT = -.04; // obelisco; la plaza va casi norte-sur
  const yO = api.ground(O.x, O.z);
  const cream = api.concrete(0xd8c7a0), creamD = api.concrete(0xbca97f), pave = api.concrete(0xc9b9a0), stone = api.concrete(0xa99b84);
  const waterTex = api.canvasTex(64, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#1f5fb8'); gr.addColorStop(.5, '#2f7fd6'); gr.addColorStop(1, '#1f5fb8'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 30; i++) x.fillRect(Math.random() * w, Math.random() * h, 10, 1.5); });
  const water = new THREE.MeshStandardMaterial({ map: waterTex, roughness: .08, metalness: .2, emissive: 0x2f7fd6, emissiveIntensity: 0 });
  api.onFrame(st => { water.emissiveIntensity = .45 * st.noche; });
  // pieza en coordenadas locales de la plaza (x este, z sur) apoyada en el terreno local
  const put = (mesh, lx, lz, dy = 0) => { const c = Math.cos(ROT), s = Math.sin(ROT), x = O.x + lx * c + lz * s, z = O.z - lx * s + lz * c; mesh.position.set(x, api.ground(x, z) + dy, z); mesh.rotation.y += ROT; root.add(mesh); return mesh; };

  // --- obelisco y su fuente de tazas ---
  const ob = new THREE.Group();
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.4, .9, 48, 1, true), cream); basin.material.side = THREE.DoubleSide; basin.position.y = .45; ob.add(basin);
  const bw = new THREE.Mesh(new THREE.CircleGeometry(8.1, 48), water); bw.rotation.x = -Math.PI / 2; bw.position.y = .6; ob.add(bw);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(8.3, .3, 6, 48), creamD); rim.rotation.x = Math.PI / 2; rim.position.y = .9; ob.add(rim);
  // tazas: perfil torneado (pie, copa ancha, segundo cuerpo, copa menor)
  const prof = [[0, 0], [3.4, 0], [3.0, .4], [2.2, .9], [2.0, 1.6], [4.6, 2.1], [4.8, 2.5], [2.6, 2.7], [2.2, 3.3], [3.3, 3.8], [3.4, 4.1], [2.4, 4.3], [2.2, 4.6], [0, 4.6]].map(([r, y]) => new THREE.Vector2(r, y));
  const tz = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), cream); ob.add(tz);
  // pedestal ornamentado (escalones + dado con relieves)
  const ped = [[3.6, .5], [3.1, .5], [2.7, 2.6], [3.0, .4], [2.5, .9]]; let y = 4.6;
  for (const [w, h] of ped) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), h > 2 ? creamD : cream); b.position.y = y + h / 2; ob.add(b); y += h; }
  const reliefTex = api.canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#cdb98e'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8e7a52'; x.lineWidth = 5; x.strokeRect(14, 14, w - 28, h - 28); x.beginPath(); x.arc(w / 2, h / 2, 26, 0, 7); x.stroke(); x.fillStyle = '#9d8a60'; x.fillRect(w / 2 - 4, 30, 8, h - 60); });
  const rel = new THREE.MeshStandardMaterial({ map: reliefTex, roughness: .9 });
  for (let k = 0; k < 4; k++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), rel), a = k * Math.PI / 2; p.position.set(Math.sin(a) * 1.36, 4.6 + 1 + 1.3, Math.cos(a) * 1.36); p.rotation.y = a; ob.add(p); }
  // fuste de base cuadrada que se afina + piramidión (33 m sobre el pedestal)
  const shaftH = 30, base = y;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.25 * Math.SQRT2 * .62, 1.25 * Math.SQRT2, shaftH, 4, 1), cream); shaft.rotation.y = Math.PI / 4; shaft.position.y = base + shaftH / 2; ob.add(shaft);
  const pyr = new THREE.Mesh(new THREE.ConeGeometry(1.25 * Math.SQRT2 * .62, 2.6, 4), creamD); pyr.rotation.y = Math.PI / 4; pyr.position.y = base + shaftH + 1.3; ob.add(pyr);
  // placa con inscripción en la cara sur
  const plq = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.4), api.concrete(0x8f7b55)); plq.position.set(0, base + 2.5, 1.26 * .98); ob.add(plq);
  // luces de piso que bañan el obelisco de noche (cono aditivo)
  const wash = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 3.2, shaftH, 4, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); wash.rotation.y = Math.PI / 4; wash.position.y = base + shaftH / 2; ob.add(wash);
  api.onFrame(st => { wash.material.opacity = .22 * st.noche; });
  put(ob, 0, 0, -.1);

  // --- piso de la plaza circular del obelisco ---
  const ringTex = api.canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#c8b89c'; x.fillRect(0, 0, w, h); x.strokeStyle = '#a99579'; x.lineWidth = 3; for (let r = 60; r < 256; r += 28) { x.beginPath(); x.arc(256, 256, r, 0, 7); x.stroke(); } for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; x.beginPath(); x.moveTo(256 + Math.cos(a) * 60, 256 + Math.sin(a) * 60); x.lineTo(256 + Math.cos(a) * 256, 256 + Math.sin(a) * 256); x.stroke(); } });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(21, 64), new THREE.MeshStandardMaterial({ map: ringTex, roughness: .95 })); floor.rotation.x = -Math.PI / 2; put(floor, 0, 0, .08);
  // jardineras alrededor
  const green = api.concrete(0x4e7a3a);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8, pl = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, .6, 12), green); put(pl, Math.cos(a) * 15.5, Math.sin(a) * 15.5, .3); }

  // --- espejos de agua: norte (8,6 × 30) y sur (9,3 × 23) con cascada escalonada y fuente semicircular ---
  const pool = (lx, lz, w, L) => { const g = new THREE.Group(); const curb = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, .7, L + 1.2), stone); curb.position.y = .1; g.add(curb); const wt = new THREE.Mesh(new THREE.PlaneGeometry(w, L), water); wt.rotation.x = -Math.PI / 2; wt.position.y = .48; g.add(wt);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(w + 7, L + 6), pave); fl.rotation.x = -Math.PI / 2; fl.position.y = .04; g.add(fl); put(g, lx, lz); return g; };
  pool(-1.2, -27.5, 8.6, 30);
  pool(3.0, 56, 9.3, 21);
  { const g = new THREE.Group(); // cascada: 5 escalones de agua bajando hacia la avenida
    for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(9.3, .5, 1.6), stone); s.position.set(0, .3 - i * .35, i * 1.6); g.add(s); const wt = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 1.5), water); wt.rotation.x = -Math.PI / 2 + .2; wt.position.set(0, .56 - i * .35, i * 1.6); g.add(wt); }
    put(g, 3.0, 67.5); }
  { const g = new THREE.Group(); const half = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 1, 24, 1, false, -Math.PI / 2, Math.PI), stone); half.position.y = -.3; g.add(half);
    const wt = new THREE.Mesh(new THREE.CircleGeometry(4.6, 24, -Math.PI / 2, Math.PI), water); wt.rotation.x = -Math.PI / 2; wt.position.y = .22; g.add(wt);
    const jm = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .6, emissive: 0xffffff, emissiveIntensity: .3, depthWrite: false });
    for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k + .5) / 5 * Math.PI, j = new THREE.Mesh(new THREE.CylinderGeometry(.35, .15, 3, 6, 1, true), jm); j.position.set(Math.sin(a) * 2.8, 1.7, Math.cos(a) * 2.8); g.add(j); }
    put(g, 3.0, 88); }

  // --- muro con hornacina entre la plaza del obelisco y el espejo sur ---
  { const g = new THREE.Group(), H = 3.4, W = 30;
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(W / 2 - 3, H, 1.2), creamD); w.position.set(s * (W / 4 + 1.5), H / 2, 0); g.add(w); }
    const arch = new THREE.Mesh(new THREE.BoxGeometry(6, H + 1.6, 1.6), cream); arch.position.y = (H + 1.6) / 2; g.add(arch);
    const niche = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, .3, 16, 1, false, -Math.PI / 2, Math.PI), api.concrete(0x6e6250)); niche.rotation.x = Math.PI / 2; niche.rotation.z = Math.PI; niche.position.set(0, 2.6, .72); g.add(niche);
    const nicheB = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.6), api.concrete(0x6e6250)); nicheB.position.set(0, 1.3, .81); g.add(nicheB);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(W, .35, 1.6), cream); cap.position.y = H + .17; g.add(cap);
    put(g, 1.5, 34); }
  return api.sombras(root);
}
