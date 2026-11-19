// Torre La Previsora (1973, Pimentel Malaussena), Plaza Venezuela. OSM way 226022389: height 117, 30 niveles, huella 39,5 × 45,2 m girada ~12°.
// Revisada el 19-nov-2026 con 8 fotos de Wikimedia Commons (build/investigacion/fotos/este/previsora_*.jpg y otras seis) y el video:
// - Planta rectangular (no triangular) que se estrecha mucho hacia arriba: la cima mide ~0,62 de la base. Concreto beige arena claro al sol.
// - Caras largas este/oeste: aletas verticales de concreto con franjas de vidrio ahumado; arriba, corona de lamas en diente de sierra con el
//   letrero «LA PREVISORA» (letras blancas con filo oscuro, con serifa).
// - Caras cortas norte/sur: concreto macizo con una gran ranura central de ventanas cortada por dinteles; franja de ventanas bajo la corona.
// - Reloj digital rojo (dos cifras sobre dos) en la torreta de la esquina NE, que asoma unos metros sobre la corona.
// Dónde se ve en la ruta: al bajar del puente de Las Acacias (km 20,6–20,85) a la izquierda del eje, ~20–24°, a 500–400 m, con la parte baja
// tapada por Torre Lincoln (como en el video, f_0205–0206); del 20,9 al giro la tapa Torre Banhorient (también en el video, f_0207–0209).
// Al final aparece al fondo de la Av. Francisco Solano (km 40,8–41,05) y la ruta la rodea por el este y el sur (km 41,1–41,25, a 25–60 m).
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

  const BEIGE = '#a3977d', GLASS = '#1d1f24';
  const conc = api.concrete(0xa3977d), concDark = api.concrete(0x7f7765);
  // cara de aletas: franjas de vidrio ahumado entre aletas, con travesaños por piso
  const N = 13, PISOS = 30;
  const finDraw = (emis) => (x, w, h) => {
    x.fillStyle = emis ? '#000' : BEIGE; x.fillRect(0, 0, w, h);
    const cw = w / N; let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < N; i++) {
      const gx = i * cw + cw * .16, gw = cw * .68;
      if (!emis) { x.fillStyle = GLASS; x.fillRect(gx, h * .02, gw, h * .955); x.fillStyle = 'rgba(160,175,190,.10)'; x.fillRect(gx, h * .02, gw * .35, h * .955); }
      for (let r = 0; r < PISOS; r++) { const yy = h * .02 + r * (h * .955 / PISOS);
        if (emis) { if (rnd() < .3) { x.fillStyle = rnd() < .75 ? '#ffd9a0' : '#d6e6ff'; x.fillRect(gx + 1, yy + 2, gw - 2, h * .955 / PISOS - 5); } }
        else { x.fillStyle = '#56524a'; x.fillRect(gx, yy, gw, 2); } }
    }
    if (!emis) { x.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < N; i++) x.fillRect(i * cw + cw * .84, 0, cw * .05, h); }
  };
  const finMap = api.canvasTex(512, 1024, finDraw(false)), finEm = api.canvasTex(512, 1024, finDraw(true));
  const finMat = new THREE.MeshStandardMaterial({ map: finMap, emissiveMap: finEm, emissive: 0xffffff, emissiveIntensity: 0, roughness: .85, metalness: .03 });
  api.onFrame(st => { finMat.emissiveIntensity = 1.1 * st.noche; });
  // caras cortas: concreto macizo con la gran ranura central de ventanas cortada por dinteles y la franja de ventanas bajo la corona
  const sideDraw = (emis) => (x, w, h) => {
    x.fillStyle = emis ? '#000' : BEIGE; x.fillRect(0, 0, w, h);
    if (!emis) { x.fillStyle = 'rgba(0,0,0,.05)'; for (let k = 0; k < 30; k++) x.fillRect(0, k * h / 30, w, 1); }
    const r0 = w * .37, rw = w * .26, y0 = h * .09, y1 = h * .975, n = 7;
    if (!emis) { x.fillStyle = '#2a2b2e'; x.fillRect(r0, y0, rw, y1 - y0); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(r0 - 6, y0, 6, y1 - y0); x.fillRect(r0 + rw, y0, 4, y1 - y0); }
    for (let b = 0; b < n; b++) { const yy = y0 + b * (y1 - y0) / n;
      if (emis) { if (b % 2) { x.fillStyle = '#ffd9a0'; x.fillRect(r0 + 4, yy + 8, rw - 8, (y1 - y0) / n - 20); } }
      else { x.fillStyle = BEIGE; x.fillRect(r0, yy, rw, 10); x.fillStyle = '#7e7663'; x.fillRect(r0, yy + 10, rw, 3); } }
    // franja corrida de ventanas bajo la corona y bandas horizontales de las esquinas
    if (!emis) { x.fillStyle = '#2a2b2e'; x.fillRect(w * .1, h * .03, w * .8, h * .035); x.fillStyle = '#9d937c'; for (const fx of [.12, .88]) x.fillRect(w * fx, 0, 3, h); }
    else { x.fillStyle = '#ffd9a0'; x.fillRect(w * .12, h * .035, w * .76, h * .025); }
  };
  const sideMat = new THREE.MeshStandardMaterial({ map: api.canvasTex(256, 1024, sideDraw(false)), emissiveMap: api.canvasTex(256, 1024, sideDraw(true)), emissive: 0xffffff, emissiveIntensity: 0, roughness: .9 });
  api.onFrame(st => { sideMat.emissiveIntensity = 1.0 * st.noche; });

  // --- cuerpo: 104 m de tronco de pirámide (la corona lleva el total a 114 y la torreta del reloj a ~118) ---
  const H = 104, ax = 19, az = 21.8, bx = 12.2, bz = 13.4; // base 38 × 43,6, cima 24,4 × 26,8
  const body = new THREE.Mesh(frustum(THREE, ax, az, bx, bz, H), [finMat, sideMat, concDark]); g.add(body);
  // aletas en relieve sobre las caras este/oeste (siguen la inclinación)
  const fins = [];
  for (const sx of [1, -1]) for (let i = 0; i <= N; i++) {
    const t = i / N, zb = -az + 2 * az * t, zt = -bz + 2 * bz * t, w = .36, d = .8;
    const pp = [];
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
    const finConc = api.concrete(0xa3977d, { side: THREE.DoubleSide }); g.add(new THREE.Mesh(fg, finConc)); }

  // --- corona (y=104..114): lamas en diente de sierra en las caras de aletas; concreto macizo en las cortas ---
  const louver = api.canvasTex(256, 64, (x, w, h) => { x.fillStyle = '#a49c88'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) { const x0 = i * 16, gr = x.createLinearGradient(x0, 0, x0 + 16, 0); gr.addColorStop(0, '#d8d0bc'); gr.addColorStop(.55, '#a39a85'); gr.addColorStop(1, '#5d574b');
      x.fillStyle = gr; x.fillRect(x0, 4, 16, h - 4); }
    x.fillStyle = '#6a6455'; x.fillRect(0, 0, w, 4); });
  louver.wrapS = THREE.RepeatWrapping; louver.repeat.set(2, 1);
  const crownMat = new THREE.MeshStandardMaterial({ map: louver, roughness: .7, metalness: .1 });
  const crown = new THREE.Mesh(frustum(THREE, bx - .2, bz - .2, bx - .8, bz - .8, 10), [crownMat, conc, concDark]); crown.position.y = H; g.add(crown);
  // pilares de esquina de la corona (prolongan las aristas)
  for (const sx of [1, -1]) for (const sz of [1, -1]) { const pl = new THREE.Mesh(new THREE.BoxGeometry(2.2, 10, 2.2), conc); pl.position.set((bx - 1.2) * sx, H + 5, (bz - 1.2) * sz); g.add(pl); }

  // --- letrero "LA PREVISORA" en las dos caras de aletas (este y oeste), sobre las lamas ---
  const signTex = api.canvasTex(1024, 128, (x, w, h) => {
    x.clearRect(0, 0, w, h); x.font = 'bold 100px Georgia, "Times New Roman", serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.lineWidth = 12; x.strokeStyle = '#1d3a4c'; x.strokeText('LA PREVISORA', w / 2, h / 2 + 6); x.fillStyle = '#ffffff'; x.fillText('LA PREVISORA', w / 2, h / 2 + 6); });
  const signMat = new THREE.MeshStandardMaterial({ map: signTex, alphaTest: .4, emissive: 0xffffff, emissiveMap: signTex, emissiveIntensity: .3, roughness: .5 });
  api.onFrame(st => { signMat.emissiveIntensity = .3 + 1.3 * st.noche; });
  for (const sx of [1, -1]) { const s = new THREE.Mesh(new THREE.PlaneGeometry(23, 3.8), signMat); s.position.set((bx - .2 + .35) * sx, H + 6.4, 1.2 * sx); s.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2; g.add(s); }

  // --- torreta del reloj en la esquina NE (−Z local es norte, +X es este), asoma ~2 m sobre la corona ---
  const ck = new THREE.Group(); ck.position.set(bx - 2.4, H - 4, -(bz - 2.4));
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(5.6, 20, 5.6), conc); shaft.position.y = 10; ck.add(shaft);
  const clockTex = api.canvasTex(128, 256, (x, w, h) => { x.fillStyle = '#141414'; x.fillRect(0, 0, w, h); x.fillStyle = '#ff4a1c'; x.font = 'bold 96px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('6', w / 2, h * .27); x.fillText('05', w / 2, h * .73); });
  const clockMat = new THREE.MeshStandardMaterial({ map: clockTex, emissive: 0xffffff, emissiveMap: clockTex, emissiveIntensity: .7, roughness: .5 });
  api.onFrame(st => { clockMat.emissiveIntensity = .7 + 1.8 * st.noche; });
  for (const [px, pz, ry] of [[2.82, 0, Math.PI / 2], [0, -2.82, Math.PI], [-2.82, 0, -Math.PI / 2], [0, 2.82, 0]]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(4, 8.4), clockMat); f.position.set(px, 15.6, pz); f.rotation.y = ry; ck.add(f); }
  for (const dx of [-1.6, 1.4]) { const ant = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 4.5, 4), concDark); ant.position.set(dx, 22.2, .8); ck.add(ant); }
  g.add(ck);
  // pilastra de esquina NE a todo lo alto (sigue la arista inclinada) que remata en la torreta del reloj
  { const r = 2.7, x0 = ax - 2.2, z0 = -(az - 2.2), x1 = bx - 2.4, z1 = -(bz - 2.4), pos = [], idx = [];
    for (const [yy, cx, cz] of [[0, x0, z0], [H, x1, z1]]) for (const [dx, dz] of [[-r, -r], [r, -r], [r, r], [-r, r]]) pos.push(cx + dx, yy, cz + dz);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; idx.push(i, j + 4, j, i, i + 4, j + 4); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); pg.setIndex(idx); pg.computeVertexNormals();
    g.add(new THREE.Mesh(pg, conc)); }

  // --- zócalo con jardineras y planta baja de triple altura retranqueada ---
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(2 * ax + 4, 1.2, 2 * az + 4), concDark); plinth.position.y = .6; g.add(plinth);
  const green = api.concrete(0x3c5a30);
  for (const sx of [1, -1]) { const pl = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.6, 2 * az), green); pl.position.set((ax + 2.2) * sx, 1.6, 0); g.add(pl); }
  return api.sombras(g);
}
