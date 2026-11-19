// Plaza Venezuela: la redoma con la fuente (estanque turquesa, tambor central con paraguas de chorros, anillo de chorros
// altos; de noche luces de colores) y la escultura cinética Abra Solar de Alejandro Otero (1982, 42 m, aspas que giran).
// La ruta pasa por el túnel BAJO la redoma (km 41,55–41,70): en el juego la calzada queda a cota de calle, así que la
// redoma se levanta como un tambor de 6,4 m sobre el techo del túnel, con dos bocas y nada sólido a < 9 m del eje bajo 6 m.
export const meta = {
  id: 'plaza_venezuela',
  nombre: 'Plaza Venezuela: fuente y Abra Solar',
  quita: [],
};

export function build(THREE, api) {
  const root = new THREE.Group();
  const C = { x: -311, z: -1171 };              // centro de la redoma (alineado con la foto satelital)
  // muestras de la ruta para respetar el túnel
  const R = []; for (let k = 41.40; k <= 41.90; k += .002) R.push(api.routeAt(k));
  const distRoute = (x, z) => { let d = 1e9; for (const p of R) d = Math.min(d, Math.hypot(x - p.x, z - p.z)); return d; };
  let yMax = -1e9; for (const p of R) if (Math.hypot(p.x - C.x, p.z - C.z) < 45) yMax = Math.max(yMax, p.y);
  const yG = api.ground(C.x, C.z) - .2, TOP = yMax + 6.45;  // losa: de TOP−0,4 (= ruta + 6,05) a TOP
  const HR = TOP - yG, RB = 40, RT = 37.5;               // talud de la redoma

  const concrete = api.concrete(0x9d998f), concDark = api.concrete(0x7c7972), grassM = api.concrete(0x5d7f3e);
  // --- talud perimetral (anillo cónico) con dos bocas donde pasa la ruta ---
  { const pos = [], idx = []; const S = 120; let v = 0;
    for (let i = 0; i < S; i++) { const a0 = i / S * Math.PI * 2, a1 = (i + 1) / S * Math.PI * 2;
      const pts = [[a0, RB, yG], [a1, RB, yG], [a1, RT, TOP - .05], [a0, RT, TOP - .05]].map(([a, r, y]) => [C.x + Math.cos(a) * r, y, C.z + Math.sin(a) * r]);
      if (pts.some(q => distRoute(q[0], q[2]) < 9.6)) continue;
      pos.push(...pts.flat()); idx.push(v, v + 2, v + 1, v, v + 3, v + 2); v += 4; }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setIndex(idx); gg.computeVertexNormals();
    const m = api.concrete(0x5f7444); m.side = THREE.DoubleSide; root.add(new THREE.Mesh(gg, m)); }
  // --- muros interiores de la boca (a 9,3 m del eje, paralelos a la ruta) para cerrar el tambor ---
  { const pos = [], idx = []; let v = 0;
    for (const sd of [1, -1]) { let prev = null;
      for (const p of R) { const x = p.x + p.lx * 9.3 * sd, z = p.z + p.lz * 9.3 * sd; if (Math.hypot(x - C.x, z - C.z) > RB - .5) { prev = null; continue; }
        if (prev) { pos.push(prev[0], yG, prev[1], x, yG, z, x, TOP - .4, z, prev[0], TOP - .4, prev[1]); idx.push(v, v + 1, v + 2, v, v + 2, v + 3); v += 4; }
        prev = [x, z]; } }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setIndex(idx); gg.computeVertexNormals();
    const m = api.concrete(0x8d8a83); m.side = THREE.DoubleSide; root.add(new THREE.Mesh(gg, m)); }
  // --- losa superior: grama con caminerías radiales y anillo de concreto alrededor del estanque ---
  const top = new THREE.Group(); top.position.set(C.x, TOP, C.z); root.add(top);
  const lawn = api.canvasTex(1024, 1024, (x, w, h) => {
    const cx = w / 2, r = w / 2; x.fillStyle = '#5f7f3f'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(${40 + Math.random() * 40},${80 + Math.random() * 50},30,.25)`; x.fillRect(Math.random() * w, Math.random() * h, 4, 4); }
    x.strokeStyle = '#cfc8b7'; x.lineWidth = 16; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; x.beginPath(); x.moveTo(cx + Math.cos(a) * r * .66, cx + Math.sin(a) * r * .66); x.lineTo(cx + Math.cos(a) * r, cx + Math.sin(a) * r); x.stroke(); }
    x.fillStyle = '#d3cdbf'; x.beginPath(); x.arc(cx, cx, r * .72, 0, 7); x.fill();
    x.strokeStyle = '#d3cdbf'; x.lineWidth = 14; x.beginPath(); x.arc(cx, cx, r * .96, 0, 7); x.stroke(); });
  const slab = new THREE.Mesh(new THREE.CylinderGeometry(RT, RT, .4, 72), [concDark, new THREE.MeshStandardMaterial({ map: lawn, roughness: .95 }), concDark]);
  slab.position.y = -.2; top.add(slab);

  // --- fuente ---
  const RB2 = 24.5;
  const parapet = new THREE.Mesh(new THREE.CylinderGeometry(RB2 + .5, RB2 + .5, .8, 72, 1, true), concrete); parapet.material.side = THREE.DoubleSide; parapet.position.y = .4; top.add(parapet);
  const cap = new THREE.Mesh(new THREE.RingGeometry(RB2, RB2 + .9, 72), concrete); cap.rotation.x = -Math.PI / 2; cap.position.y = .81; top.add(cap);
  const waterTex = api.canvasTex(512, 512, (x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, w * .1, w / 2, h / 2, w / 2); gr.addColorStop(0, '#3fa9b8'); gr.addColorStop(.75, '#63c5cc'); gr.addColorStop(1, '#87d6d6'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,.25)'; x.lineWidth = 3; for (let r = 40; r < w / 2; r += 26) { x.beginPath(); x.arc(w / 2, h / 2, r, 0, 7); x.stroke(); } });
  const water = new THREE.MeshStandardMaterial({ map: waterTex, roughness: .12, metalness: .1, emissive: 0x000000 });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(RB2, 72), water); pool.rotation.x = -Math.PI / 2; pool.position.y = .55; top.add(pool);
  // anillo intermedio (escalón del estanque) y tambor central
  const midRing = new THREE.Mesh(new THREE.CylinderGeometry(15.5, 15.5, 1.2, 64, 1, true), concrete); midRing.position.y = .6; top.add(midRing);
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(10, 10.4, 3.2, 48), [api.facade({ pared: '#8c8a84', vidrio: '#2d4b57', pisos: 1, vanos: 12, marco: .55 }), concrete, concrete]);
  drum.material[0].map.repeat.set(1, 1); drum.position.y = 1.6; top.add(drum);
  const drumWater = new THREE.Mesh(new THREE.CircleGeometry(9.6, 48), water); drumWater.rotation.x = -Math.PI / 2; drumWater.position.y = 3.22; top.add(drumWater);

  // agua: material translúcido que de noche toma colores (rojo → magenta → azul → blanco)
  const jetMat = new THREE.MeshStandardMaterial({ color: 0xf4fbff, transparent: true, opacity: .62, roughness: .2, emissive: 0xffffff, emissiveIntensity: .12, depthWrite: false, side: THREE.DoubleSide });
  const streak = api.canvasTex(256, 64, (x, w, h) => { x.clearRect(0, 0, w, h); for (let i = 0; i < 64; i++) { x.fillStyle = `rgba(255,255,255,${.35 + Math.random() * .6})`; x.fillRect(i * 4, 0, 2, h); } });
  const umbMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: streak, transparent: true, opacity: .6, roughness: .2, emissive: 0xffffff, emissiveIntensity: .12, depthWrite: false, side: THREE.DoubleSide });
  const cols = [new THREE.Color(0xff1e2d), new THREE.Color(0xff2a8a), new THREE.Color(0x2f6dff), new THREE.Color(0x19c6ff), new THREE.Color(0xff1e2d)], tmp = new THREE.Color();
  // paraguas de chorros sobre el tambor (perfil en arco desde el centro hasta el borde del estanque intermedio)
  const prof = []; for (let i = 0; i <= 14; i++) { const t = i / 14; prof.push(new THREE.Vector2(.6 + t * 14.2, 3.3 + Math.sin(Math.PI * (.12 + .88 * t)) * 5.6 - t * 1.6)); }
  const umb = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), umbMat); top.add(umb);
  umbMat.map.repeat.set(6, 1); umbMat.map.wrapS = THREE.RepeatWrapping;
  // chorro central (~22 m) y su espuma
  const jetGeo = new THREE.CylinderGeometry(.75, .3, 1, 10, 1, true);
  const cJet = new THREE.Mesh(jetGeo, jetMat); cJet.scale.set(1.3, 22, 1.3); cJet.position.y = 3.3 + 11; top.add(cJet);
  const foam = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 8), jetMat); foam.position.y = 4.3; foam.scale.y = .7; top.add(foam);
  // anillo de 12 chorros altos y 8 cortinas de agua que caen del tambor
  const ring = new THREE.InstancedMesh(jetGeo, jetMat, 12), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), Sc = new THREE.Vector3();
  const setRing = (t) => { for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, h = 11 + 3 * Math.sin(t * 1.3 + i * 1.7); V.set(Math.cos(a) * 20, .6 + h / 2, Math.sin(a) * 20); Sc.set(.7, h, .7); M.compose(V, Q, Sc); ring.setMatrixAt(i, M); } ring.instanceMatrix.needsUpdate = true; };
  setRing(0); top.add(ring);
  const curtain = new THREE.InstancedMesh(new THREE.PlaneGeometry(3.2, 2.6), umbMat, 8);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + .2; const o = new THREE.Object3D(); o.position.set(Math.cos(a) * 10.6, 1.5, Math.sin(a) * 10.6); o.rotation.y = -a + Math.PI / 2; o.updateMatrix(); curtain.setMatrixAt(i, o.matrix); }
  top.add(curtain);
  api.onFrame(st => {
    const k = (st.t * .12) % 1 * (cols.length - 1), i = Math.floor(k); tmp.copy(cols[i]).lerp(cols[i + 1], k - i);
    for (const m of [jetMat, umbMat]) { m.emissive.copy(st.noche > .05 ? tmp : m.color); m.emissiveIntensity = .3 + 1.4 * st.noche; }
    water.emissive.copy(tmp).multiplyScalar(.35 * st.noche);
    cJet.scale.y = 22 + 2 * Math.sin(st.t * 2.1); cJet.position.y = 3.3 + cJet.scale.y / 2; setRing(st.t);
  });
  // luminarias de borde (puntos de luz en el parapeto)
  const lamps = new THREE.InstancedMesh(new THREE.BoxGeometry(.5, .25, .5), api.glow(0xfff2c8, { dia: .1, noche: 2.2 }), 24);
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; M.makeTranslation(Math.cos(a) * (RB2 + .45), .95, Math.sin(a) * (RB2 + .45)); lamps.setMatrixAt(i, M); } top.add(lamps);

  // --- Abra Solar (Alejandro Otero): dos mástiles de celosía plateada con 33 aspas que giran ---
  { const A = { x: -508, z: -1241 }, yA = api.ground(A.x, A.z) - .1, ab = new THREE.Group(); ab.position.set(A.x, yA, A.z);
    const rp = api.routeAt(41.86); ab.rotation.y = Math.atan2(rp.tx, rp.tz) + Math.PI / 2; // el plano de la escultura mira a la ruta
    const steel = new THREE.MeshStandardMaterial({ color: 0xdfe3e8, metalness: .85, roughness: .28, envMapIntensity: 1.3 });
    const alu = new THREE.MeshStandardMaterial({ color: 0xe9edf2, metalness: .9, roughness: .18, envMapIntensity: 1.5, side: THREE.DoubleSide });
    const H = 42, Wd = 16;
    // dos mástiles que se separan hacia arriba (la "abra"), cada uno de 3 tubos con arriostramiento
    const tube = new THREE.CylinderGeometry(.22, .22, 1, 6), parts = [];
    const strut = (a, b, r = 1) => { const d = new THREE.Vector3().subVectors(b, a), L = d.length(), m = new THREE.Matrix4(); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.compose(a.clone().add(b).multiplyScalar(.5), q, new THREE.Vector3(r, L, r)); parts.push(m); };
    for (const s of [1, -1]) {
      const base = s * 4.6, topx = s * (Wd / 2 - 1.0), off = [[-.7, -.7], [.7, -.7], [0, .8]];
      const P = (t, o) => new THREE.Vector3(base + (topx - base) * t + o[0], t * H, o[1]);
      for (const o of off) strut(P(0, o), P(1, o), 1.2);
      for (let k = 0; k < 14; k++) { const t0 = k / 14, t1 = (k + 1) / 14; for (let j = 0; j < 3; j++) { strut(P(t0, off[j]), P(t1, off[(j + 1) % 3])); strut(P(t1, off[j]), P(t1, off[(j + 1) % 3]), .8); } }
    }
    for (const yy of [1.2, 14, 28]) { const t = yy / H, xx = 4.6 + 2.4 * t; strut(new THREE.Vector3(-xx + .7, yy, 0), new THREE.Vector3(xx - .7, yy, 0), 1.4); }
    { const xx = Wd / 2 - 1.0; strut(new THREE.Vector3(-xx, H, 0), new THREE.Vector3(xx, H, 0), 1.6); }
    const lat = new THREE.InstancedMesh(tube, steel, parts.length); parts.forEach((m, i) => lat.setMatrixAt(i, m)); ab.add(lat);
    // 33 aspas: hélices de dos palas en voladizo hacia la abra, a distintas alturas, que giran
    const bladeGeo = new THREE.BufferGeometry(); bladeGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, -.2, 0, 2.2, -.9, 0, 2.2, .9, 0, 0, .2, 0, -2.2, -.9, 0, -2.2, .9, 0], 3)); bladeGeo.setIndex([0, 1, 2, 0, 2, 3, 0, 5, 4, 0, 3, 5]); bladeGeo.computeVertexNormals();
    const blades = new THREE.InstancedMesh(bladeGeo, alu, 33), hubs = [];
    for (let i = 0; i < 33; i++) { const t = .08 + .88 * i / 32, a = i * .78, half = 4.6 + 2.4 * t - 2.6; hubs.push({ x: Math.cos(a) * half, z: Math.sin(a) * 1.6, y: t * H, ry: a, ph: i * .7, sp: .6 + (i % 5) * .15 }); } // hélice de 33 aspas en la abra
    const O = new THREE.Object3D();
    const spin = (t) => { hubs.forEach((h, i) => { O.position.set(h.x, h.y, h.z); O.rotation.set(0, h.ry, h.ph + t * h.sp); O.updateMatrix(); blades.setMatrixAt(i, O.matrix); }); blades.instanceMatrix.needsUpdate = true; };
    spin(0); ab.add(blades); api.onFrame(st => spin(st.t));
    // pedestal
    const ped = new THREE.Mesh(new THREE.BoxGeometry(6, .8, 3.5), api.concrete(0xb9b4a8)); ped.position.y = .4; ab.add(ped);
    // reflectores de noche al pie
    const spot = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 30, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xbfd8ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    spot.position.y = 15; ab.add(spot); api.onFrame(st => { spot.material.opacity = .05 * st.noche; });
    root.add(ab);
  }
  api.sombras(root); root.traverse(o => { if (o.isMesh && [].concat(o.material).some(m => m.transparent)) o.castShadow = false; });
  return root;
}
