// Torre La Previsora (1973, Pimentel Malaussena), Plaza Venezuela. 110 m, brutalista, tronco de pirámide.
// Caras este/oeste: aletas verticales de concreto con franjas de vidrio ahumado; caras norte/sur: concreto macizo
// con ranuras de ventanas. Corona de lamas con el letrero "LA PREVISORA" y torre-reloj (reloj digital rojo) en la esquina NE.
// Huella real OSM (way 226022389): rectángulo 39,5 × 45,2 m girado ~12°.
export const meta = {
  id: 'torre_previsora',
  nombre: 'Torre La Previsora',
  quita: [[10.4964300, -66.8813607, 30]],
};

// tronco de pirámide con UV 0..1 por cara; grupo 0 = caras ±X, grupo 1 = caras ±Z, grupo 2 = tapa
function frustum(THREE, ax, az, bx, bz, h, cap = true) {
  const pos = [], uv = [], idx = []; const g = new THREE.BufferGeometry(); let v = 0;
  const face = (p0, p1, p2, p3, grp) => { // p0 abajo-izq, p1 abajo-der, p2 arriba-der, p3 arriba-izq (vistos desde fuera)
    pos.push(...p0, ...p1, ...p2, ...p3); uv.push(0, 0, 1, 0, 1, 1, 0, 1); const s = idx.length; idx.push(v, v + 1, v + 2, v, v + 2, v + 3); g.addGroup(s, 6, grp); v += 4; };
  face([ax, 0, az], [ax, 0, -az], [bx, h, -bz], [bx, h, bz], 0);      // +X
  face([-ax, 0, -az], [-ax, 0, az], [-bx, h, bz], [-bx, h, -bz], 0);  // −X
  face([-ax, 0, az], [ax, 0, az], [bx, h, bz], [-bx, h, bz], 1);      // +Z
  face([ax, 0, -az], [-ax, 0, -az], [-bx, h, -bz], [bx, h, -bz], 1);  // −Z
  if (cap) face([-bx, h, bz], [bx, h, bz], [bx, h, -bz], [-bx, h, -bz], 2);
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

export function build(THREE, api) {
  const c = { x: 121.95, z: -1099.0 }; // centro de la huella (coordenadas del mundo, calculado de la huella OSM)
  const ll = api.latlon(c.x, c.z), p = api.xz(ll.lat, ll.lon), y0 = api.ground(p.x, p.z) - .3;
  const g = new THREE.Group(); g.position.set(p.x, y0, p.z); g.rotation.y = -0.212; // +X local → este-sudeste (borde sur de la huella)

  const BEIGE = '#7d7767', GLASS = '#1a1b1d';
  const conc = api.concrete(0x7d7767), concDark = api.concrete(0x5e5a4f);
  // cara de aletas: franjas de vidrio ahumado entre aletas, con travesaños por piso
  const N = 13, PISOS = 30;
  const finDraw = (emis) => (x, w, h) => {
    x.fillStyle = emis ? '#000' : BEIGE; x.fillRect(0, 0, w, h);
    const cw = w / N; let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < N; i++) {
      const gx = i * cw + cw * .14, gw = cw * .72;
      if (!emis) { x.fillStyle = GLASS; x.fillRect(gx, h * .02, gw, h * .955); x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(gx, h * .02, gw * .3, h * .955); }
      for (let r = 0; r < PISOS; r++) { const yy = h * .02 + r * (h * .955 / PISOS);
        if (emis) { if (rnd() < .3) { x.fillStyle = rnd() < .75 ? '#ffd9a0' : '#d6e6ff'; x.fillRect(gx + 1, yy + 2, gw - 2, h * .955 / PISOS - 5); } }
        else { x.fillStyle = '#4a4740'; x.fillRect(gx, yy, gw, 2); } }
    }
    if (!emis) { x.fillStyle = 'rgba(0,0,0,.10)'; for (let i = 0; i < N; i++) x.fillRect(i * cw + cw * .8, 0, cw * .06, h); }
  };
  const finMap = api.canvasTex(512, 1024, finDraw(false)), finEm = api.canvasTex(512, 1024, finDraw(true));
  const finMat = new THREE.MeshStandardMaterial({ map: finMap, emissiveMap: finEm, emissive: 0xffffff, emissiveIntensity: 0, roughness: .8, metalness: .05 });
  api.onFrame(st => { finMat.emissiveIntensity = 1.1 * st.noche; });
  // caras laterales: concreto macizo con dos ranuras verticales de ventanas, cortadas cada 6 pisos
  const sideDraw = (emis) => (x, w, h) => {
    x.fillStyle = emis ? '#000' : BEIGE; x.fillRect(0, 0, w, h);
    if (!emis) { x.fillStyle = 'rgba(0,0,0,.06)'; for (let k = 0; k < 14; k++) x.fillRect(0, k * h / 14, w, 2); }
    for (const fx of [.30, .62]) for (let b = 0; b < 5; b++) { const yy = h * (.05 + b * .19), hh = h * .15;
      if (emis) { if ((b + (fx > .5 ? 1 : 0)) % 2) { x.fillStyle = '#ffd9a0'; x.fillRect(w * fx + 3, yy + 3, w * .08 - 6, hh - 6); } }
      else { x.fillStyle = '#1f2023'; x.fillRect(w * fx, yy, w * .08, hh); x.fillStyle = '#5f5a4e'; x.fillRect(w * fx - 3, yy - 4, w * .08 + 6, 4); } }
    if (!emis) { x.fillStyle = '#6f6a5c'; x.fillRect(w * .12, 0, 4, h); x.fillRect(w * .88, 0, 4, h); }
  };
  const sideMat = new THREE.MeshStandardMaterial({ map: api.canvasTex(256, 1024, sideDraw(false)), emissiveMap: api.canvasTex(256, 1024, sideDraw(true)), emissive: 0xffffff, emissiveIntensity: 0, roughness: .9 });
  api.onFrame(st => { sideMat.emissiveIntensity = 1.0 * st.noche; });

  // --- cuerpo: 2 m de zócalo + 98 m de tronco de pirámide ---
  const H = 100, ax = 18.5, az = 21.5, bx = 13.2, bz = 14.2; // base 37 × 43, cima 26,4 × 28,4
  const body = new THREE.Mesh(frustum(THREE, ax, az, bx, bz, H), [finMat, sideMat, conc]); g.add(body);
  // aletas en relieve sobre las caras este/oeste (siguen la inclinación)
  const fins = [];
  for (const sx of [1, -1]) for (let i = 0; i <= N; i++) {
    const t = i / N, zb = -az + 2 * az * t, zt = -bz + 2 * bz * t, w = .32, d = .7;
    const pp = [];
    // prisma delgado de la base (x=ax, z=zb) a la cima (x=bx, z=zt)
    const P = (x, y, z) => pp.push(x, y, z);
    const xb = ax * sx, xt = bx * sx;
    P(xb, 0, zb - w); P(xb + d * sx, 0, zb - w); P(xt + d * sx, H, zt - w); P(xt, H, zt - w);
    P(xb, 0, zb + w); P(xb + d * sx, 0, zb + w); P(xt + d * sx, H, zt + w); P(xt, H, zt + w);
    fins.push(pp);
  }
  { const pos = [], idx = []; let v = 0;
    for (const pp of fins) { pos.push(...pp); const q = (a, b, c2, d2) => idx.push(v + a, v + b, v + c2, v + a, v + c2, v + d2);
      q(1, 5, 6, 2); q(0, 1, 2, 3); q(5, 4, 7, 6); q(3, 2, 6, 7); q(4, 0, 3, 7); v += 8; }
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); fg.setIndex(idx); fg.computeVertexNormals();
    const finMesh = new THREE.Mesh(fg, conc); finMesh.material.side = THREE.DoubleSide; g.add(finMesh); }

  // --- corona: lamas verticales grises (y=100..110) ---
  const louver = api.canvasTex(256, 64, (x, w, h) => { x.fillStyle = '#9b9a94'; x.fillRect(0, 0, w, h); for (let i = 0; i < 64; i++) { x.fillStyle = i % 2 ? '#c9c8c2' : '#6e6d68'; x.fillRect(i * 4, 0, 2, h); } x.fillStyle = '#5b5a55'; x.fillRect(0, 0, w, 3); });
  louver.wrapS = THREE.RepeatWrapping; louver.repeat.set(2, 1);
  const crownMat = new THREE.MeshStandardMaterial({ map: louver, roughness: .55, metalness: .4 });
  const crown = new THREE.Mesh(frustum(THREE, bx - .3, bz - .3, bx - 1.0, bz - 1.0, 9.5), [crownMat, crownMat, concDark]); crown.position.y = H; g.add(crown);
  // pilares de esquina de la corona (prolongan las aristas)
  for (const sx of [1, -1]) for (const sz of [1, -1]) { const pl = new THREE.Mesh(new THREE.BoxGeometry(2.2, 9.5, 2.2), conc); pl.position.set((bx - 1.2) * sx, H + 4.75, (bz - 1.2) * sz); g.add(pl); }

  // --- letrero "LA PREVISORA": grande en las caras de aletas (este y oeste), menor en norte y sur ---
  const signTex = api.canvasTex(1024, 128, (x, w, h) => {
    x.clearRect(0, 0, w, h); x.font = 'bold 104px Georgia, "Times New Roman", serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.lineWidth = 10; x.strokeStyle = '#1f5d63'; x.strokeText('LA PREVISORA', w / 2, h / 2 + 6); x.fillStyle = '#ffffff'; x.fillText('LA PREVISORA', w / 2, h / 2 + 6); });
  const signMat = new THREE.MeshStandardMaterial({ map: signTex, transparent: true, alphaTest: .05, emissive: 0xffffff, emissiveMap: signTex, emissiveIntensity: .25, roughness: .5, side: THREE.DoubleSide });
  api.onFrame(st => { signMat.emissiveIntensity = .25 + 1.3 * st.noche; });
  for (const sx of [1, -1]) { const s = new THREE.Mesh(new THREE.PlaneGeometry(24, 3.6), signMat); s.position.set((bx + .2) * sx, H + 5.6, 0); s.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2; g.add(s); }
  for (const sz of [1, -1]) { const s = new THREE.Mesh(new THREE.PlaneGeometry(19, 2.9), signMat); s.position.set(sz > 0 ? 0 : -2.5, H + 5.6, (bz - .1) * sz); s.rotation.y = sz > 0 ? 0 : Math.PI; g.add(s); }

  // --- torre-reloj en la esquina NE (−Z local es norte, +X es este) ---
  const ck = new THREE.Group(); ck.position.set(bx - 2.2, H, -(bz - 2.2));
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(5.2, 17, 5.2), conc); shaft.position.y = 8.5; ck.add(shaft);
  const clockTex = api.canvasTex(128, 256, (x, w, h) => { x.fillStyle = '#121212'; x.fillRect(0, 0, w, h); x.fillStyle = '#ff3b1f'; x.font = 'bold 92px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('10', w / 2, h * .28); x.fillText('25', w / 2, h * .72); });
  const clockMat = new THREE.MeshStandardMaterial({ map: clockTex, emissive: 0xffffff, emissiveMap: clockTex, emissiveIntensity: .6, roughness: .5 });
  api.onFrame(st => { clockMat.emissiveIntensity = .6 + 1.8 * st.noche; });
  for (const [px, pz, ry] of [[2.62, 0, Math.PI / 2], [0, -2.62, Math.PI], [-2.62, 0, -Math.PI / 2], [0, 2.62, 0]]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 7), clockMat); f.position.set(px, 11.5, pz); f.rotation.y = ry; ck.add(f); }
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 5, 4), concDark); ant.position.y = 19.5; ck.add(ant);
  g.add(ck);
  // pilastra de esquina NE a todo lo alto (sigue la arista inclinada) que remata en la torre-reloj
  { const r = 2.6, x0 = ax - 2.0, z0 = -(az - 2.0), x1 = bx - 2.2, z1 = -(bz - 2.2), pos = [], idx = [];
    for (const [yy, cx, cz] of [[0, x0, z0], [H, x1, z1]]) for (const [dx, dz] of [[-r, -r], [r, -r], [r, r], [-r, r]]) pos.push(cx + dx, yy, cz + dz);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; idx.push(i, j, j + 4, i, j + 4, i + 4); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); pg.setIndex(idx); pg.computeVertexNormals();
    g.add(new THREE.Mesh(pg, conc)); }

  // --- zócalo con jardineras ---
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(2 * ax + 4, 1.2, 2 * az + 4), concDark); plinth.position.y = .6; g.add(plinth);
  const green = api.concrete(0x34502c);
  for (const sx of [1, -1]) { const pl = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 2 * az), green); pl.position.set((ax + 2.2) * sx, 1.5, 0); g.add(pl); }
  return api.sombras(g);
}
