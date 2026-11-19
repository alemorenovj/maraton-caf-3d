// Escalinata de El Calvario (km 2,9, cartel 3K del video, fotogramas f_0030–f_0032).
// Escalera monumental de concreto gris que sube hacia el oeste desde la calle, con los ojos pintados sobre los
// peldaños (se leen desde abajo), dos tramos con descanso, barandas, laderas arboladas a ambos lados y el remate
// arriba: pórtico blanco con banderas. El relieve SRTM no recoge el cerro, así que el módulo lo levanta.
export const meta = {
  id: 'el_calvario',
  nombre: 'Escalinata de El Calvario',
  quita: [],
};

export function build(THREE, api) {
  const g = new THREE.Group(), c = api.xz(10.50514, -66.92011), y0 = api.ground(c.x, c.z) - .3;
  const X0 = 27, X1 = -9, RISE = 15, W = 46, LAND = 0.5; // pie de la escalera (este), cima (oeste), altura, ancho, descanso a media altura
  const conc = api.concrete(0xa29e96), concOsc = api.concrete(0x8c877e), blanco = api.concrete(0xf1efe8), verde = api.concrete(0x5d6b3c, { roughness: 1 }), tierra = api.concrete(0x8c7a55, { roughness: 1 });

  // --- perfil escalonado extruido a lo ancho (z) ---
  const N = 64, run = (X0 - X1) / N, rh = RISE / N, prof = new THREE.Shape(); prof.moveTo(X0 + 1, 0);
  let x = X0, y = 0; prof.lineTo(x, 0);
  for (let i = 0; i < N; i++) { y += rh; prof.lineTo(x, y); x -= (i === N / 2 - 1 ? run + 4 : run); prof.lineTo(x, y); }
  prof.lineTo(X1 - 6, y); prof.lineTo(X1 - 6, 0); prof.lineTo(X0 + 1, 0);
  const ext = new THREE.ExtrudeGeometry(prof, { depth: W, bevelEnabled: false }); ext.translate(0, 0, -W / 2);
  // el ExtrudeGeometry traza el perfil en XY y extruye en Z: justo lo que queremos (X = este-oeste, Y = alto, Z = ancho)
  g.add(new THREE.Mesh(ext, [concOsc, conc]));
  const xTop = x;

  // --- los ojos pintados: calco inclinado sobre los peldaños del tramo inferior ---
  const ojos = api.canvasTex(1024, 256, (k, w, h) => {
    k.clearRect(0, 0, w, h);
    const ojo = (cx) => { k.fillStyle = 'rgba(40,40,40,.92)';
      k.beginPath(); k.moveTo(cx - 170, h * .62); k.quadraticCurveTo(cx, h * .1, cx + 170, h * .6); k.quadraticCurveTo(cx, h * .95, cx - 170, h * .62); k.fill();
      k.fillStyle = 'rgba(225,222,215,.95)'; k.beginPath(); k.moveTo(cx - 140, h * .62); k.quadraticCurveTo(cx, h * .22, cx + 140, h * .6); k.quadraticCurveTo(cx, h * .86, cx - 140, h * .62); k.fill();
      k.fillStyle = 'rgba(30,30,30,.95)'; k.beginPath(); k.arc(cx + 10, h * .56, 52, 0, 7); k.fill(); k.fillStyle = 'rgba(240,240,240,.9)'; k.beginPath(); k.arc(cx + 24, h * .5, 12, 0, 7); k.fill();
      k.strokeStyle = 'rgba(35,35,35,.9)'; k.lineWidth = 22; k.beginPath(); k.moveTo(cx - 190, h * .3); k.quadraticCurveTo(cx, h * -.08, cx + 200, h * .22); k.stroke(); };
    ojo(w * .27); ojo(w * .73);
    k.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 26; i++) k.fillRect(0, i * h / 26, w, 2); // las juntas de los peldaños
  });
  const ojosM = new THREE.MeshStandardMaterial({ map: ojos, transparent: true, roughness: .9, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
  const L1 = (N / 2) * run, slope = Math.atan2(RISE / 2, L1);
  const pg = new THREE.PlaneGeometry(W * .8, Math.hypot(L1, RISE / 2) * .92); pg.rotateX(-Math.PI / 2); pg.rotateY(Math.PI / 2);
  const deca = new THREE.Mesh(pg, ojosM); deca.rotation.z = -slope; deca.position.set(X0 - L1 / 2, rh + RISE / 4 + .08, 0); g.add(deca);

  // --- barandas (tubos de pie a cima) y muretes laterales ---
  const bar = new THREE.MeshStandardMaterial({ color: 0xb8b8b4, metalness: .6, roughness: .4 });
  const tubo = (a, b, r, mat) => { const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 5), mat); m.position.copy(a).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  for (const zz of [-W / 2 + .4, -W / 6, W / 6, W / 2 - .4]) g.add(tubo(new THREE.Vector3(X0, 1.1, zz), new THREE.Vector3(xTop, RISE + 1.1, zz), .07, bar));
  for (const sd of [-1, 1]) g.add(tubo(new THREE.Vector3(X0 + .5, .6, sd * (W / 2 + .6)), new THREE.Vector3(xTop, RISE + .6, sd * (W / 2 + .6)), .8, concOsc));

  // --- cerro: campo de alturas alrededor (laderas arboladas) ---
  const GX = 40, GZ = 40, sx = 200, sz = 200, hg = new THREE.PlaneGeometry(sx, sz, GX, GZ); hg.rotateX(-Math.PI / 2); hg.translate(-sx / 2 + X0 + 6, 0, 0);
  const sm = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t); };
  const H = (px, pz) => { const up = sm(X0 + 4, X1, px) * RISE + sm(X1 - 20, -170, px) * 22; const wob = 6 * Math.sin(px * .07) + 4 * Math.sin(pz * .11 + 1), kx = sm(-5, -35, px), sur = 30 + kx * 60 + wob, nor = -32 - kx * 8 + wob; const fall = (1 - sm(sur, sur + 22, pz)) * (1 - sm(-nor, -nor + 18, -pz)); return Math.max(0, up * fall) - .6; };
  const pos = hg.attributes.position; for (let i = 0; i < pos.count; i++) { const px = pos.getX(i), pz = pos.getZ(i); let h = H(px, pz); if (Math.abs(pz) < W / 2 + 1 && px > xTop - 2) h = Math.min(h, 0) - .5; pos.setY(i, h); }
  hg.computeVertexNormals(); const cerro = new THREE.Mesh(hg, [verde][0]); g.add(cerro);
  // árboles en las laderas (InstancedMesh: copas + troncos)
  const copaG = new THREE.IcosahedronGeometry(1, 1), troncoG = new THREE.CylinderGeometry(.25, .35, 1, 5);
  const copas = new THREE.InstancedMesh(copaG, api.concrete(0x3f6a2f, { roughness: 1 }), 90), troncos = new THREE.InstancedMesh(troncoG, api.concrete(0x5a4632), 90);
  let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; const M = new THREE.Matrix4(), q = new THREE.Quaternion(), V = new THREE.Vector3(); let n = 0;
  while (n < 90) { const px = X0 + 2 - rnd() * 190, pz = -45 + rnd() * 150; if (H(px, pz) < 2) continue; if (Math.abs(pz) < W / 2 + 4 && px > xTop - 14) continue; const h = H(px, pz) + .5, r = 3 + rnd() * 3.5, th = 4 + rnd() * 5;
    M.compose(V.set(px, h + th + r * .6, pz), q, new THREE.Vector3(r * 1.2, r, r * 1.2)); copas.setMatrixAt(n, M); M.compose(V.set(px, h + th / 2, pz), q, new THREE.Vector3(1, th, 1)); troncos.setMatrixAt(n, M); n++; }
  g.add(copas, troncos);

  // --- remate arriba: explanada y pórtico blanco de tres arcos con banderas ---
  const top = new THREE.Group(); top.position.set(xTop - 12, RISE, 0);
  const expl = new THREE.Mesh(new THREE.BoxGeometry(26, 1, 30), conc); expl.position.y = -.5; top.add(expl);
  const arcoS = new THREE.Shape(); arcoS.moveTo(-9, 0); arcoS.lineTo(9, 0); arcoS.lineTo(9, 8); arcoS.lineTo(-9, 8); arcoS.lineTo(-9, 0);
  for (const cx of [-6, 0, 6]) { const hole = new THREE.Path(); hole.moveTo(cx - 2, 0); hole.lineTo(cx - 2, 3.8); hole.absarc(cx, 3.8, 2, Math.PI, 0, true); hole.lineTo(cx + 2, 0); hole.lineTo(cx - 2, 0); arcoS.holes.push(hole); }
  const arco = new THREE.Mesh(new THREE.ExtrudeGeometry(arcoS, { depth: 2.4, bevelEnabled: false }), blanco); arco.rotation.y = Math.PI / 2; arco.position.set(1.2, 0, 0); top.add(arco);
  const corn = new THREE.Mesh(new THREE.BoxGeometry(3.2, .8, 19), blanco); corn.position.set(0, 8.4, 0); top.add(corn);
  const bandera = api.canvasTex(96, 64, (k, w, h) => { k.fillStyle = '#f7d117'; k.fillRect(0, 0, w, h / 3); k.fillStyle = '#0033a0'; k.fillRect(0, h / 3, w, h / 3); k.fillStyle = '#cf142b'; k.fillRect(0, 2 * h / 3, w, h / 3); k.fillStyle = '#fff'; for (let i = 0; i < 8; i++) { const a = Math.PI * (.15 + .7 * i / 7); k.beginPath(); k.arc(w / 2 - Math.cos(a) * 16, h * .62 - Math.sin(a) * 12, 2, 0, 7); k.fill(); } });
  const bandM = new THREE.MeshStandardMaterial({ map: bandera, side: THREE.DoubleSide, roughness: .8 }), mastM = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: .7, roughness: .3 });
  for (const zz of [-12, -9, 9, 12]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, 12, 5), mastM); m.position.set(6, 6, zz); top.add(m); const f = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), bandM); f.position.set(6, 11, zz + 1.55); top.add(f); }
  g.add(top);
  // farolas a pie de escalera (de noche)
  const luz = api.glow(0xffe0a8, { dia: .1, noche: 2.2 });
  for (const zz of [-W / 2 - 3, W / 2 + 3]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.1, .14, 9, 6), mastM); p.position.set(X0 - 1, 4.5, zz); g.add(p); const l = new THREE.Mesh(new THREE.SphereGeometry(.45, 8, 6), luz); l.position.set(X0 - 1, 9.1, zz); g.add(l); }

  g.position.set(c.x, y0, c.z);
  return api.sombras(g);
}
