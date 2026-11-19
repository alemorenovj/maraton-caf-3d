// Paseo Los Próceres (1956, arq. Malaussena), del Monumento a los Próceres (SO) al obelisco ecuestre (NE), eje a 37°.
// Posiciones de OSM: monolitos (10.46755, −66.9006), óvalo de fuentes (10.4693, −66.8993), espejo de agua
// (10.4716, −66.89749), obelisco (10.47239, −66.89697). Modelado:
// · los dos monolitos verticales de travertino con relieves de batallas, enfrentados sobre el eje, y los dos muros
//   horizontales de mármol negro por fuera, con estatuas de bronce de los próceres; plataformas y escalinatas;
// · el óvalo con nueve chorros en fila (animados); · el espejo de agua largo azul cobalto con borde de piedra blanca;
// · el obelisco blanco con la estatua ecuestre en su plaza; · hileras dobles de palmas washingtonia a lo largo del eje.
export const meta = {
  id: 'los_proceres',
  nombre: 'Paseo Los Próceres',
  quita: [[10.46755, -66.9006, 34]],
};

export function build(THREE, api) {
  const g = new THREE.Group();
  const O = api.xz(10.46755, -66.9006), B = 37.2 * Math.PI / 180, U = { x: Math.sin(B), z: -Math.cos(B) }, V = { x: -Math.cos(B), z: -Math.sin(B) }; // U: eje hacia el NE; V: hacia el NO
  const ROT = Math.PI / 2 - B; // rotation.y que lleva +X local al eje U
  const W = (u, v) => { const x = O.x + U.x * u + V.x * v, z = O.z + U.z * u + V.z * v; return { x, z, y: api.ground(x, z) }; };
  const box = new THREE.BoxGeometry(1, 1, 1);
  const travertino = (() => { const t = api.canvasTex(256, 256, (k, w, h) => { k.fillStyle = '#e2d9c3'; k.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { k.fillStyle = `rgba(150,130,100,${Math.random() * .12})`; k.fillRect(Math.random() * w, Math.random() * h, 20 + Math.random() * 70, 1 + Math.random() * 2); } k.strokeStyle = 'rgba(120,105,85,.35)'; k.lineWidth = 1.5; for (let j = 0; j <= 4; j++) { k.beginPath(); k.moveTo(0, j * 64); k.lineTo(w, j * 64); k.stroke(); } for (let j = 0; j <= 2; j++) { k.beginPath(); k.moveTo(j * 128 + (j % 2) * 40, 0); k.lineTo(j * 128 + (j % 2) * 40, h); k.stroke(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
  const trav = (ru, rv) => { const t = travertino.clone(); t.needsUpdate = true; t.repeat.set(ru, rv); return new THREE.MeshStandardMaterial({ map: t, roughness: .85 }); };
  const marmolNegro = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: .18, metalness: .25 }), bronce = new THREE.MeshStandardMaterial({ color: 0x3e3a2f, metalness: .75, roughness: .4 });
  const piedraBlanca = api.concrete(0xece7da), piso = api.concrete(0xd8d0bd);
  const agua = new THREE.MeshStandardMaterial({ color: 0x1f4fd0, roughness: .08, metalness: .35, envMapIntensity: 1.2 });
  const aguaClara = new THREE.MeshStandardMaterial({ color: 0x4fa8c9, roughness: .06, metalness: .3 });
  const put = (mesh, u, v, dy = 0, rot = 0) => { const p = W(u, v); mesh.position.set(p.x, p.y + dy, p.z); mesh.rotation.y = ROT + rot; g.add(mesh); return mesh; };

  // ---------- 1. Monumento a los Próceres ----------
  // relieves de batallas en el travertino (jinetes y soldados en bajorrelieve, nombre de la batalla)
  const relieve = (nombre) => api.canvasTex(1024, 512, (k, w, h) => {
    k.fillStyle = '#e1d7bf'; k.fillRect(0, 0, w, h); k.strokeStyle = 'rgba(120,105,85,.3)'; for (let j = 1; j < 6; j++) { k.beginPath(); k.moveTo(0, j * h / 6); k.lineTo(w, j * h / 6); k.stroke(); }
    const fig = (x, y, s, cab) => { k.fillStyle = 'rgba(150,132,104,.85)'; if (cab) { k.beginPath(); k.ellipse(x, y, 34 * s, 15 * s, 0, 0, 7); k.fill(); k.fillRect(x - 28 * s, y, 7 * s, 34 * s); k.fillRect(x + 20 * s, y, 7 * s, 34 * s); k.beginPath(); k.ellipse(x + 36 * s, y - 14 * s, 8 * s, 17 * s, .6, 0, 7); k.fill(); k.fillRect(x - 6 * s, y - 40 * s, 13 * s, 30 * s); k.beginPath(); k.arc(x, y - 46 * s, 7 * s, 0, 7); k.fill(); } else { k.fillRect(x - 7 * s, y - 30 * s, 14 * s, 34 * s); k.fillRect(x - 7 * s, y + 4 * s, 5 * s, 30 * s); k.fillRect(x + 2 * s, y + 4 * s, 5 * s, 30 * s); k.beginPath(); k.arc(x, y - 37 * s, 7 * s, 0, 7); k.fill(); k.fillRect(x + 6 * s, y - 60 * s, 2 * s, 60 * s); } k.fillStyle = 'rgba(255,250,235,.25)'; k.fillRect(x - 6 * s, y - 30 * s, 3 * s, 30 * s); };
    for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) fig(70 + i * 110 + (r % 2) * 50, 120 + r * 140, 1.1, (i + r) % 3 === 0);
    k.fillStyle = 'rgba(95,80,60,.9)'; k.font = 'bold 44px Georgia'; k.textAlign = 'center'; k.fillText(nombre, w / 2, h - 22); });
  const relM = (n) => new THREE.MeshStandardMaterial({ map: relieve(n), roughness: .85 });
  for (const s of [-1, 1]) {
    // plataforma de travertino con escalinata hacia el eje
    put(new THREE.Mesh(box, trav(8, 1)), 0, s * 22, .6).scale.set(36, 1.6, 30);
    for (let i = 0; i < 4; i++) put(new THREE.Mesh(box, piso), -18.45 - i * .9, s * 22, .2 * (4 - i) - .1).scale.set(.9, .4 * (4 - i), 30);
    // monolito vertical de travertino (30 m de largo), relieves en sus caras largas
    const mono = put(new THREE.Mesh(box, [trav(1, 4), trav(1, 4), trav(6, 1), trav(6, 1), relM(s < 0 ? 'CARABOBO · BOYACÁ' : 'AYACUCHO · PICHINCHA'), relM(s < 0 ? 'JUNÍN · PANTANO DE VARGAS' : 'LA VICTORIA · PALO HINCADO')]), 0, s * 12.5, 1.4 + 11);
    mono.scale.set(30, 22, 4.5);
    // muro horizontal de mármol negro por fuera, con los próceres de bronce delante
    put(new THREE.Mesh(box, marmolNegro), 0, s * 31, 1.4 + 3.5).scale.set(30, 7, 3.2);
    for (let i = 0; i < 5; i++) {
      const u = -12 + i * 6, ped = put(new THREE.Mesh(box, marmolNegro), u, s * 27.8, 1.4 + .9); ped.scale.set(1.8, 1.8, 1.8);
      const est = new THREE.Group(), body = new THREE.Mesh(new THREE.CylinderGeometry(.42, .55, 2.3, 8), bronce); body.position.y = 1.15; est.add(body);
      const capa = new THREE.Mesh(new THREE.ConeGeometry(.75, 2.1, 8, 1, true), bronce); capa.position.y = 1.2; est.add(capa);
      const cab = new THREE.Mesh(new THREE.SphereGeometry(.26, 8, 6), bronce); cab.position.y = 2.6; est.add(cab);
      put(est, u, s * 27.8, 1.4 + 1.8, s < 0 ? Math.PI / 2 : -Math.PI / 2);
    }
  }
  // explanada entre los monolitos + fuente lineal en el eje
  put(new THREE.Mesh(box, piso), 0, 0, .25).scale.set(40, .5, 20);
  put(new THREE.Mesh(box, aguaClara), 4, 0, .55).scale.set(26, .2, 5);

  // ---------- palmas washingtonia (InstancedMesh) ----------
  const merge = (geos) => { const pos = [], nor = []; for (const ge of geos) { const n = ge.index ? ge.toNonIndexed() : ge; n.computeVertexNormals(); pos.push(...n.attributes.position.array); nor.push(...n.attributes.normal.array); } const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); r.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return r; };
  const fr = []; for (let i = 0; i < 12; i++) { const f = new THREE.ConeGeometry(.5, 3.2, 3, 1); f.translate(0, 1.6, 0); f.scale(1, 1, .2); f.rotateZ(1.2 + (i % 3) * .22); f.rotateY(i / 12 * Math.PI * 2); fr.push(f); }
  const falda = new THREE.CylinderGeometry(.55, .4, 1.6, 6); falda.translate(0, -.6, 0); fr.push(falda);
  const copaG = merge(fr), troncoG = new THREE.CylinderGeometry(.22, .3, 1, 6); troncoG.translate(0, .5, 0);
  const palmas = []; // [u, v, alto]
  for (let u = 140; u <= 500; u += 15) for (const v of [-17, -11, 11, 17]) if (Math.abs(u - 240) > 20 || Math.abs(v) > 12) palmas.push([u, v, 11 + ((u * 7 + v) % 5)]);
  for (let u = 505; u <= 625; u += 10) for (const v of [-25, -20, 20, 25]) palmas.push([u, v, 13 + ((u + v) % 4)]);
  const copas = new THREE.InstancedMesh(copaG, new THREE.MeshStandardMaterial({ color: 0x47703a, roughness: .9, side: THREE.DoubleSide }), palmas.length), troncos = new THREE.InstancedMesh(troncoG, api.concrete(0x8a7a63), palmas.length);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3();
  palmas.forEach(([u, v, h], i) => { const p = W(u, v); M.compose(P.set(p.x, p.y, p.z), Q, S.set(1, h, 1)); troncos.setMatrixAt(i, M); Q.setFromAxisAngle(P.set(0, 1, 0), i * 1.7); M.compose(P.set(p.x, p.y + h, p.z), Q, S.set(1.15, 1.15, 1.15)); copas.setMatrixAt(i, M); Q.identity(); });
  copas.castShadow = troncos.castShadow = true; g.add(copas, troncos);

  // ---------- chorros (animados) ----------
  const chorroM = new THREE.MeshStandardMaterial({ color: 0xeaf6ff, transparent: true, opacity: .7, roughness: .2, emissive: 0x9fc8ff, emissiveIntensity: 0 });
  const chorroG = new THREE.ConeGeometry(.5, 1, 8, 1, true); chorroG.translate(0, .5, 0); chorroG.rotateX(Math.PI);  chorroG.translate(0, 1, 0);
  const chorros = [];
  const chorro = (u, v, dy, h) => { const m = put(new THREE.Mesh(chorroG, chorroM), u, v, dy); m.scale.set(1, h, 1); m.userData.h = h; chorros.push(m); };
  api.onFrame(st => { chorroM.emissiveIntensity = .8 * st.noche; chorros.forEach((m, i) => { m.scale.y = m.userData.h * (.9 + .1 * Math.sin(st.t * 3 + i)); }); });

  // ---------- 2. Óvalo de fuentes (9 chorros en fila) ----------
  const ov = new THREE.CylinderGeometry(1, 1, 1, 40);
  put(new THREE.Mesh(ov, piedraBlanca), 240, 0, .35).scale.set(33, .7, 11);
  put(new THREE.Mesh(ov, aguaClara), 240, 0, .5).scale.set(31.5, .7, 9.6);
  for (let i = 0; i < 9; i++) chorro(240 - 24 + i * 6, 0, .7, 5 + (i === 4 ? 4 : 0));

  // ---------- 3. Espejo de agua (azul cobalto) ----------
  const ec = 562; // centro sobre el eje
  put(new THREE.Mesh(box, piedraBlanca), ec, 0, .3).scale.set(112, .6, 36);
  put(new THREE.Mesh(box, agua), ec, 0, .45).scale.set(106, .6, 30);
  put(new THREE.Mesh(box, piso), ec, 0, .05).scale.set(122, .1, 44); // andenes
  for (let i = 0; i < 6; i++) chorro(ec - 45 + i * 18, 0, .8, 2.5);

  // ---------- 4. Plaza del obelisco con la estatua ecuestre ----------
  const uo = 667;
  put(new THREE.Mesh(box, piedraBlanca), uo, 0, .5).scale.set(33, 1, 33);
  for (const s of [-1, 1]) put(new THREE.Mesh(box, piedraBlanca), uo, s * 16, 1.5).scale.set(33, 1.2, .8); // balaustradas
  const ob = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.9, 22, 4), piedraBlanca); ob.geometry.rotateY(Math.PI / 4); put(ob, uo + 3, -4, 1 + 11);
  put(new THREE.Mesh(new THREE.ConeGeometry(1.25, 2.2, 4), piedraBlanca), uo + 3, -4, 1 + 23.1, Math.PI / 4);
  // ecuestre: pedestal bajo, caballo y jinete de bronce
  put(new THREE.Mesh(box, piedraBlanca), uo - 3, 3, 1 + 1.6).scale.set(5, 3.2, 2.6);
  const cab = new THREE.Group(), cu = new THREE.Mesh(new THREE.CylinderGeometry(.75, .8, 3, 10), bronce); cu.rotation.z = Math.PI / 2; cu.position.y = 2.4; cab.add(cu);
  for (const [x, z] of [[-1.1, -.4], [-1.1, .4], [1.1, -.4], [1.1, .4]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.13, .16, 1.9, 6), bronce); p.position.set(x, .95, z); cab.add(p); }
  const cue = new THREE.Mesh(new THREE.CylinderGeometry(.35, .5, 1.6, 8), bronce); cue.position.set(1.7, 3.3, 0); cue.rotation.z = -.7; cab.add(cue);
  const jin = new THREE.Mesh(new THREE.CylinderGeometry(.32, .4, 1.5, 8), bronce); jin.position.set(-.1, 3.7, 0); cab.add(jin);
  const jc = new THREE.Mesh(new THREE.SphereGeometry(.24, 8, 6), bronce); jc.position.set(-.1, 4.65, 0); cab.add(jc);
  put(cab, uo - 3, 3, 1 + 3.2);

  // reflectores en el monumento (noche)
  const luz = api.glow(0xffe8c0, { dia: .05, noche: 2.2 });
  for (const s of [-1, 1]) for (const u of [-14, 0, 14]) put(new THREE.Mesh(box, luz), u, s * 8, .6).scale.set(.6, .3, .6);
  return api.sombras(g);
}
