// Cumbre de El Ávila: Hotel Humboldt (1956, Tomás Sanabria; torre cilíndrica blanca de 19 pisos sobre un podio) y la
// línea del teleférico Warairarepano bajando desde la estación de la cumbre hasta Maripérez.
// ÚNICA EXCEPCIÓN A LA ESCALA: hotel y torres del teleférico van ~30 % sobredimensionados para leerse a 5 km.
export const meta = {
  id: 'avila_humboldt',
  nombre: 'Hotel Humboldt y teleférico del Ávila',
  quita: [[10.5408, -66.8776, 40]],
};

export function build(THREE, api) {
  const root = new THREE.Group(), K = 1.3; // sobredimensión
  const h = api.xz(10.5408, -66.8776);
  // cota de apoyo: lo más bajo de la huella (el podio se entierra en la ladera)
  let yMin = 1e9, yMax = -1e9; for (let a = 0; a < 6.28; a += .5) for (const r of [0, 20, 40]) { const g = api.ground(h.x + Math.cos(a) * r, h.z + Math.sin(a) * r); yMin = Math.min(yMin, g); yMax = Math.max(yMax, g); }
  const hotel = new THREE.Group(); hotel.position.set(h.x, yMin - 2, h.z); root.add(hotel);
  const lift = yMax - yMin + 2; // altura que hay que salvar en la ladera antes de que empiece el podio visible

  // fachada de la torre: anillos blancos con franjas corridas de ventanas (19 pisos)
  const PISOS = 19, Rt = 10 * K, Ht = 60 * K;
  const drawT = (emis) => (x, w, h2) => { x.fillStyle = emis ? '#000' : '#f1efe8'; x.fillRect(0, 0, w, h2); const ch = h2 / PISOS;
    for (let r = 0; r < PISOS; r++) { const y = r * ch + ch * .38, hh = ch * .42;
      if (emis) { for (let c = 0; c < 48; c++) if (Math.random() < .55) { x.fillStyle = Math.random() < .7 ? '#ffe2b0' : '#ffffff'; x.fillRect(c * w / 48 + 1, y, w / 48 - 2, hh); } }
      else { x.fillStyle = '#4c5a66'; x.fillRect(0, y, w, hh); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, y, w, hh * .3); x.fillStyle = '#d9d6cc'; for (let c = 0; c < 48; c++) x.fillRect(c * w / 48, y, 2, hh); } } };
  const tm = new THREE.MeshStandardMaterial({ map: api.canvasTex(1024, 512, drawT(false)), emissiveMap: api.canvasTex(1024, 512, drawT(true)), emissive: 0xffffff, emissiveIntensity: 0, roughness: .7 });
  api.onFrame(st => { tm.emissiveIntensity = 1.8 * st.noche; });
  const white = api.concrete(0xf2f0ea), grey = api.concrete(0xb9b7b0);
  const podH = 9 * K;
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(Rt, Rt, Ht, 40, 1, true), tm); tower.position.y = lift + podH + Ht / 2; hotel.add(tower);
  // remate: losa saliente, último piso retranqueado y antena
  const slab = new THREE.Mesh(new THREE.CylinderGeometry(Rt + 1.2, Rt + 1.2, 1.4, 40), white); slab.position.y = lift + podH + Ht + .7; hotel.add(slab);
  const pent = new THREE.Mesh(new THREE.CylinderGeometry(Rt * .7, Rt * .7, 4.5, 32), white); pent.position.y = lift + podH + Ht + 3.6; hotel.add(pent);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(.25, .4, 14, 6), grey); ant.position.y = lift + podH + Ht + 12; hotel.add(ant);
  // núcleo vertical de escaleras (franja maciza sin ventanas, lado norte)
  const core = new THREE.Mesh(new THREE.BoxGeometry(5 * K, Ht + 2, 4 * K), white); core.position.set(0, lift + podH + Ht / 2 + 1, -Rt - 1); hotel.add(core);
  // podio: bloque bajo y alargado, blanco con ventanal corrido, apoyado en un zócalo que baja por la ladera
  const pm = api.facade({ pared: '#eeebe3', vidrio: '#3e4e5c', pisos: 2, vanos: 12, bandas: true, encendidas: .5, seed: 2 });
  const pod = new THREE.Mesh(new THREE.BoxGeometry(48 * K, podH, 24 * K), [pm, pm, white, white, pm, pm]); pod.position.set(-6, lift + podH / 2, 4); hotel.add(pod);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(48 * K + 2, lift + .5, 24 * K + 2), api.concrete(0x8d8a80)); plinth.position.set(-6, lift / 2, 4); hotel.add(plinth);
  // halo nocturno: el hotel iluminado es el faro de la montaña
  const halo = new THREE.Mesh(new THREE.CylinderGeometry(Rt + 3, Rt + 3, Ht + 10, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1d6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide }));
  halo.position.y = lift + podH + Ht / 2; hotel.add(halo); api.onFrame(st => { halo.material.opacity = .28 * st.noche; });

  // --- teleférico: de la estación cumbre (≈ 150 m al SO del hotel) a Maripérez ---
  const A = api.xz(10.5398, -66.8789), B = api.xz(10.5090, -66.8890);
  const L = Math.hypot(B.x - A.x, B.z - A.z), N = Math.round(L / 260), tops = [];
  const towerM = new THREE.MeshStandardMaterial({ color: 0xc9ccd0, metalness: .6, roughness: .45 });
  const tg = new THREE.CylinderGeometry(.9 * K, 2.2 * K, 1, 4, 1), arm = new THREE.BoxGeometry(14 * K, 1.4 * K, 1.4 * K);
  const tInst = new THREE.InstancedMesh(tg, towerM, N + 1), aInst = new THREE.InstancedMesh(arm, towerM, N + 1), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), ang = Math.atan2(B.x - A.x, B.z - A.z);
  Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), ang + Math.PI / 4);
  const Qa = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ang + Math.PI / 2);
  for (let i = 0; i <= N; i++) { const t = i / N, x = A.x + (B.x - A.x) * t, z = A.z + (B.z - A.z) * t, g = api.ground(x, z), th = (i === 0 || i === N) ? 14 : 34 * K;
    // la torre asoma por encima del punto más alto del terreno entre vecinos (el cable no atraviesa la montaña)
    let gMax = g; for (let s = -.5; s <= .5; s += .1) { const tt = Math.min(1, Math.max(0, t + s / N)); gMax = Math.max(gMax, api.ground(A.x + (B.x - A.x) * tt, A.z + (B.z - A.z) * tt)); }
    const topY = Math.max(g + th, gMax + 10), hh = topY - g + 2;
    M.compose(new THREE.Vector3(x, g - 2 + hh / 2, z), Q, new THREE.Vector3(1, hh, 1)); tInst.setMatrixAt(i, M);
    M.compose(new THREE.Vector3(x, topY, z), Qa, new THREE.Vector3(1, 1, 1)); aInst.setMatrixAt(i, M); tops.push(new THREE.Vector3(x, topY, z)); }
  root.add(tInst, aInst);
  // dos cables (ida y vuelta) separados 6 m, con catenaria leve; líneas finas que siempre se ven
  const side = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang)).multiplyScalar(6 * K);
  const cableM = new THREE.LineBasicMaterial({ color: 0x2a2c30 }), cables = [];
  for (const sg of [1, -1]) { const pts = []; for (let i = 0; i < N; i++) for (let k = 0; k <= 8; k++) { const t = k / 8, p = tops[i].clone().lerp(tops[i + 1], t); p.y -= Math.sin(Math.PI * t) * 6; pts.push(p.addScaledVector(side, sg)); }
    const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), cableM); root.add(ln); cables.push(pts); }
  // estaciones (cumbre y Maripérez)
  for (const [P, w] of [[A, 30], [B, 34]]) { const g = api.ground(P.x, P.z), st = new THREE.Mesh(new THREE.BoxGeometry(w, 12, 16), [white, white, api.concrete(0x9a3b2e), white, white, white]); st.position.set(P.x, g + 4, P.z); st.rotation.y = ang; root.add(st); }
  // cabinas rojas (sobredimensionadas) que suben y bajan
  const cabM = api.glow(0xd8312a, { dia: .25, noche: 1.2 }), cabs = new THREE.InstancedMesh(new THREE.BoxGeometry(4 * K, 3.6 * K, 4 * K), cabM, 12);
  const along = (pts, u) => { const f = u * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)); return pts[i].clone().lerp(pts[i + 1], f - i); };
  const moveCabs = (t) => { for (let i = 0; i < 12; i++) { const sg = i % 2, u = ((i / 12) + t * .004 * (sg ? 1 : -1) + 10) % 1, p = along(cables[sg], u); M.makeTranslation(p.x, p.y - 4, p.z); cabs.setMatrixAt(i, M); } cabs.instanceMatrix.needsUpdate = true; };
  moveCabs(0); root.add(cabs); api.onFrame(st => moveCabs(st.t));
  api.sombras(root); halo.castShadow = false; return root;
}
