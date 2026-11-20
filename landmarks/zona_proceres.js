// Zona proceres (km 15,3–19,0): lo que el video muestra y no sale de las huellas genéricas.
// Anclas y desfase del índice de fotogramas: ver la cabecera de fx/correcciones/proceres.js.
// - Isla central de Los Ilustres (ida 15,70–16,34 / vuelta 18,15–18,72): tierra seca con árboles altos de copa ancha, brocal
//   amarillo a los dos lados y bolardos-luminaria (f_0151–0155, f_0182–0186). El generador deja ahí asfalto de la calzada contraria.
// - Parque de atracciones (km 15,36–15,60 der.): muro amarillo con reja azul, torre de caída roja y blanca, valla gigante (f_0148–0149).
// - Viaducto de la Autopista Valle-Coche (OSM, layer 2) paralelo a la derecha de la ida, 25–55 m (f_0153–0154).
// - Puente de Los Ilustres sobre la Autopista Valle-Coche (OSM bridge layer 3, ida 15,572–15,6415 / vuelta 18,7645–18,837): tablero,
//   trinchera con la autopista y sus carros, pérgola de vigas, parapeto blanco calado y baranda verde (§4; relieve en fx/correcciones/proceres.js).
// - Paseo Los Próceres (ida 16,62–17,12 / vuelta 17,28–17,86, siempre a la izquierda): acera de adoquín rosado, brocal amarillo
//   grueso, urnas blancas sobre pedestal cada 25 m y farolas verdes de dos globos (f_0159–0177).
// - Vuelta por Los Próceres, derecha: isla de palmas reales y ciclovía verde-celeste (f_0163–0172); muro de piedra con el
//   edificio blanco en terraza (17,28–17,50; f_0163); estacionamiento EPA de 6 niveles (f_0178); letrero BDV (f_0180).
// - Hongos decorativos: rojo de lunares, amarillo y el turquesa gigante de la redoma (f_0167–0182).
// - Salida del puente de Los Ilustres, derecha (18,84–18,95; video de YouTube t=471–472,5 s): nave de techo de tejas en dientes de
//   sierra tras una reja gris y una valla alta de cara oscura (§11).
// Los monolitos, el óvalo, el espejo de agua y el obelisco son del hito landmarks/los_proceres.js; el monumento, de los_simbolos.js.
export const meta = {
  id: 'zona_proceres', nombre: 'Zona proceres',
  // + trinchera de la Valle-Coche bajo el puente (km 18,81): círculos de 15 m a lo largo del eje de la autopista, cada 16 m (sin árboles ni huellas genéricas)
  quita: [[10.471731, -66.896122, 18], [10.481950, -66.895576, 8],
    [10.480161, -66.894974, 15], [10.480262, -66.894869, 15], [10.480362, -66.894763, 15], [10.480463, -66.894658, 15], [10.480563, -66.894553, 15], [10.480663, -66.894447, 15],
    [10.480764, -66.894342, 15], [10.480864, -66.894237, 15], [10.480965, -66.894131, 15], [10.481065, -66.894026, 15], [10.481165, -66.893921, 15]],
};

export function build(THREE, api) {
  const g = new THREE.Group();
  const add = (geo, mat, x, y, z, p = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };
  const R = km => api.routeAt(km);
  // punto a `d` m de la ruta (d > 0 izquierda, d < 0 derecha) a la altura de la calzada
  const lado = (km, d, dy = 0) => { const r = R(km); return { x: r.x + r.lx * d, y: r.y + dy, z: r.z + r.lz * d, r }; };
  const box = new THREE.BoxGeometry(1, 1, 1);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3(), E = new THREE.Euler();
  // caja unitaria tendida de a a b (puntos {x,y,z}) con ancho w y alto h: matriz para InstancedMesh
  const tramo = (a, b, w, h, dy = 0) => { const dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz); E.set(0, Math.atan2(-dz, dx), 0); Q.setFromEuler(E);
    return M.compose(P.set((a.x + b.x) / 2, (a.y + b.y) / 2 + h / 2 + dy, (a.z + b.z) / 2), Q, S.set(L + .05, h, w)).clone(); };
  const inst = (geo, mat, mats) => { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, mats.length)); mats.forEach((mm, i) => m.setMatrixAt(i, mm)); m.count = mats.length; g.add(m); return m; };
  // cinta horizontal entre dos bordes laterales a lo largo de la ruta: f(km) → [a, b] (m a la izquierda) y la altura
  const cinta = (km0, km1, paso, f, mat, dy, rep = 6) => { const pos = [], uv = [], idx = []; let n = 0, s = 0, prev = null;
    for (let km = km0; km <= km1 + 1e-6; km += paso) { const ab = f(km); if (!ab) { prev = null; continue; } const [a, b, y] = ab, r = R(km), yy = (y ?? r.y) + dy;
      if (prev) s += Math.hypot(r.x - prev.x, r.z - prev.z); prev = r;
      pos.push(r.x + r.lx * a, yy, r.z + r.lz * a, r.x + r.lx * b, yy, r.z + r.lz * b); uv.push(0, s / rep, (b - a) / rep, s / rep);
      if (n && ab.cont !== false) idx.push(n * 2 - 2, n * 2, n * 2 - 1, n * 2 - 1, n * 2, n * 2 + 1); n++; }
    const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.setIndex(idx); ge.computeVertexNormals();
    const m = new THREE.Mesh(ge, mat); m.receiveShadow = true; g.add(m); return m; };
  const tex = (w, h, draw, rx = 1, ry = 1) => { const t = api.canvasTex(w, h, draw); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
  const merge = (geos) => { const pos = [], nor = []; for (const ge of geos) { const n = ge.index ? ge.toNonIndexed() : ge; n.computeVertexNormals(); pos.push(...n.attributes.position.array); nor.push(...n.attributes.normal.array); }
    const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); r.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return r; };

  // ───────── materiales comunes ─────────
  const amarillo = api.concrete(0xe9b51f, { roughness: .8 });
  const tierra = new THREE.MeshStandardMaterial({ roughness: 1, map: tex(256, 256, (k, w, h) => { k.fillStyle = '#9d8a66'; k.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { k.fillStyle = Math.random() < .35 ? 'rgba(96,110,52,.55)' : `rgba(${120 + Math.random() * 50},${100 + Math.random() * 40},${70 + Math.random() * 30},.5)`; k.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 7, 2 + Math.random() * 5); } }) });
  const grama = new THREE.MeshStandardMaterial({ roughness: 1, map: tex(128, 128, (k, w, h) => { k.fillStyle = '#6f8d42'; k.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { k.fillStyle = `rgba(${80 + Math.random() * 60},${110 + Math.random() * 50},50,.6)`; k.fillRect(Math.random() * w, Math.random() * h, 2, 3); } }) });
  const tronco = api.concrete(0x4f4740), copaM = new THREE.MeshStandardMaterial({ color: 0x567a3a, roughness: .95 });   // copas lisas: las facetadas se veían de caricatura
  const copaG = new THREE.IcosahedronGeometry(1, 2);
  const troncoG = new THREE.CylinderGeometry(.22, .38, 1, 6); troncoG.translate(0, .5, 0);

  // árboles de copa ancha (samán, caobo): tronco alto y desnudo, copa aplastada en 3 masas
  const arboles = [];
  const arbol = (x, y, z, h, rc, seed) => arboles.push([x, y, z, h, rc, seed]);
  const plantaArboles = () => { const tm = [], cm = [];
    for (const [x, y, z, h, rc, s] of arboles) { M.compose(P.set(x, y, z), Q.identity(), S.set(.8 + (s % 3) * .12, h * .66, .8 + (s % 3) * .12)); tm.push(M.clone());
      for (let j = 0; j < 4; j++) { const a = s * 2.4 + j * 1.7, d = rc * (j === 3 ? .1 : .5); E.set(0, a, 0); Q.setFromEuler(E);
        M.compose(P.set(x + Math.cos(a) * d, y + h * (j === 3 ? .82 : .7), z + Math.sin(a) * d), Q, S.set(rc * (.7 + .08 * j), h * .17, rc * (.62 + .08 * j))); cm.push(M.clone()); } }
    Q.identity(); inst(troncoG, tronco, tm); inst(copaG, copaM, cm); };

  // ═════════ 1. Isla central de Los Ilustres ═════════
  // la vuelta corre a 25–33 m a la izquierda de la ida; la isla va del brocal de la ida (7,3 m) al de la vuelta (par − 7 m)
  const vuelta = []; for (let k = 17.95; k <= 18.86; k += .005) vuelta.push([k, R(k)]);
  const par = km => { const r = R(km); let best = null, bd = 1e9; for (const [k, q] of vuelta) { const d = Math.hypot(q.x - r.x, q.z - r.z); if (d < bd) { bd = d; best = q; } }
    return { lat: (best.x - r.x) * r.lx + (best.z - r.z) * r.lz, y: best.y }; };
  // (la isla de 5 m que dibuja el generador junto al brocal de la ida se conserva; esta cubre el resto hasta la vuelta)
  { const I0 = 15.70, I1 = 16.34, A = 11.8;
    const borde = km => { const p = par(km), r = R(km); return [A, p.lat - 7.1, Math.max(r.y, p.y)]; };
    cinta(I0, I1, .01, km => { const [a, b, y] = borde(km); return b - a > 3 ? [a, b, y] : null; }, tierra, .2, 8);
    // brocales amarillos a los dos lados
    const bm = []; for (let km = I0; km < I1 - 1e-6; km += .01) { const [a0, b0, y0] = borde(km), [a1, b1, y1] = borde(km + .01), r0 = R(km), r1 = R(km + .01);
      for (const [d0, d1] of [[a0, a1], [b0, b1]]) bm.push(tramo({ x: r0.x + r0.lx * d0, y: y0, z: r0.z + r0.lz * d0 }, { x: r1.x + r1.lx * d1, y: y1, z: r1.z + r1.lz * d1 }, .45, .32)); }
    inst(box, amarillo, bm);
    // árboles altos en dos hileras alternas y bolardos-luminaria con rejilla junto a los brocales
    const bol = []; let i = 0;
    for (let km = I0 + .006; km < I1; km += .0095, i++) { const [a, b, y] = borde(km), r = R(km), w = b - a, d = a + w * (i % 2 ? .3 : .7) + Math.sin(i * 2.3); if (w < 4) continue;
      // (19-nov) los árboles de la isla los siembra ahora el motor: lista `arboles` de fx/correcciones/proceres.js
      for (const db of [a + .9, b - .9]) bol.push(M.compose(P.set(r.x + r.lx * db, y + .2 + .45, r.z + r.lz * db), Q.identity(), S.set(1, 1, 1)).clone()); }
    const bolG = new THREE.CylinderGeometry(.14, .14, .9, 8), bolTop = new THREE.CylinderGeometry(.19, .16, .18, 8);
    inst(bolG, api.concrete(0x6b6e70), bol);
    inst(bolTop, api.glow(0xf3eedf, { dia: .2, noche: 1.6 }), bol.map(m => m.clone().multiply(new THREE.Matrix4().makeTranslation(0, .5, 0))));
  }

  // ═════════ 2. Parque de atracciones de Los Ilustres (derecha de la ida) ═════════
  { const muroM = api.concrete(0xe4b62a, { roughness: .85 }), azul = api.concrete(0x2459a8, { roughness: .6 });
    const mm = [], rejas = [], post = [];
    for (let km = 15.36; km < 15.595; km += .01) { const a = lado(km, -10.6), b = lado(km + .01, -10.6); mm.push(tramo(a, b, .3, 2.0)); rejas.push(tramo(a, b, .08, .08, 3.2));
      for (let t = 0; t < 1; t += .25) post.push(M.compose(P.set(a.x + (b.x - a.x) * t, a.y + 2.6, a.z + (b.z - a.z) * t), Q.identity(), S.set(.06, 1.2, .06)).clone()); }
    inst(box, muroM, mm); inst(box, azul, rejas); inst(box, azul, post);
    // torre de caída: mástil de celosía rojo y blanco de ~45 m con la góndola y la corona de focos
    const t0 = api.xz(10.481950, -66.895576), y0 = R(15.43).y, Ht = 45;
    const celosia = tex(64, 512, (k, w, h) => { k.clearRect(0, 0, w, h); for (let j = 0; j < 16; j++) { k.fillStyle = j % 2 ? '#f2f2ee' : '#d22a22'; k.fillRect(0, j * h / 16, w, h / 16); }
      k.globalCompositeOperation = 'destination-out'; for (let j = 0; j < 32; j++) { k.beginPath(); k.moveTo(8, j * 16 + 3); k.lineTo(w - 8, j * 16 + 3); k.lineTo(w / 2, j * 16 + 13); k.fill(); } });
    const latM = new THREE.MeshStandardMaterial({ map: celosia, transparent: true, alphaTest: .5, side: THREE.DoubleSide, roughness: .6 });
    add(new THREE.BoxGeometry(2.2, Ht, 2.2), latM, t0.x, y0 + Ht / 2, t0.z);
    add(new THREE.BoxGeometry(.5, Ht, .5), api.concrete(0xb8b8b4), t0.x, y0 + Ht / 2, t0.z);
    add(new THREE.CylinderGeometry(3.2, 3.2, 1.6, 16), api.concrete(0xd8352b), t0.x, y0 + 31, t0.z);
    add(new THREE.CylinderGeometry(2.2, 1.4, 1.8, 10), api.concrete(0xe9e6df), t0.x, y0 + Ht + .9, t0.z);
    add(new THREE.SphereGeometry(.9, 10, 8), api.glow(0xff3b2a, { dia: .5, noche: 2 }), t0.x, y0 + Ht + 2.4, t0.z);
    // valla gigante gris sobre su mástil, de cara a la avenida
    const v0 = api.xz(10.48122, -66.89598), rv = R(15.50), ang = Math.atan2(rv.x - v0.x, rv.z - v0.z);
    const V = new THREE.Group(); V.position.set(v0.x, y0, v0.z); V.rotation.y = ang; g.add(V);
    add(new THREE.CylinderGeometry(.7, .9, 18, 10), api.concrete(0x8f9193), 0, 9, 0, V);
    add(new THREE.BoxGeometry(14, 8, .5), api.concrete(0xc9cbcc), 0, 22, 0, V);
    add(new THREE.BoxGeometry(14.6, .4, 1.4), api.concrete(0x6f7173), 0, 17.9, .4, V);
    const tejas = [0xd84a3a, 0xf0c33c, 0x2f86d0, 0x3fae5a];   // techos de colores tras el muro (f_0148)
    for (let j = 0; j < 4; j++) { const p = lado(15.38 + j * .055, -19 - (j % 2) * 5), T = new THREE.Group(); T.position.set(p.x, p.y, p.z); T.rotation.y = Math.atan2(p.r.tx, p.r.tz); g.add(T);
      add(new THREE.BoxGeometry(12, .5, 9), api.concrete(tejas[j]), 0, 5.4, 0, T); for (const sx of [-5.5, 5.5]) for (const sz of [-4, 4]) add(new THREE.BoxGeometry(.3, 5.2, .3), api.concrete(0xe8e6e0), sx, 2.6, sz, T); }
  }

  // ═════════ 3. Viaducto de la Autopista Valle-Coche (paralelo a la derecha de la ida) ═════════
  { const vc = [[10.47436, -66.89661], [10.47454, -66.89647], [10.47472, -66.89634], [10.47489, -66.89623], [10.47506, -66.89613], [10.47529, -66.89601], [10.47551, -66.89592], [10.47573, -66.89584],
      [10.47594, -66.89579], [10.47622, -66.89572], [10.47638, -66.8957], [10.47662, -66.89568], [10.4775, -66.89559], [10.4784, -66.8955], [10.47906, -66.89538], [10.47961, -66.89516]].map(([a, b]) => api.xz(a, b));
    const ida = []; for (let k = 15.6; k <= 16.5; k += .01) ida.push(R(k));
    const cota = p => { let bd = 1e9, y = 0; for (const r of ida) { const d = Math.hypot(r.x - p.x, r.z - p.z); if (d < bd) { bd = d; y = r.y; } } return y; };
    const H = 8.6, losa = [], prp = [], pil = [], cab = []; let acc = 0;
    for (let i = 0; i < vc.length - 1; i++) { const a = { ...vc[i], y: cota(vc[i]) + H }, b = { ...vc[i + 1], y: cota(vc[i + 1]) + H }, L = Math.hypot(b.x - a.x, b.z - a.z);
      losa.push(tramo(a, b, 12, 1.7));
      const nx = -(b.z - a.z) / L, nz = (b.x - a.x) / L;   // normal horizontal: un parapeto en cada borde del tablero
      for (const s of [-5.8, 5.8]) prp.push(tramo({ x: a.x + nx * s, y: a.y, z: a.z + nz * s }, { x: b.x + nx * s, y: b.y, z: b.z + nz * s }, .35, .95, 1.7));
      for (; acc < L; acc += 30) { const t = acc / L, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t, yt = a.y + (b.y - a.y) * t, yb = api.ground(x, z) - 1, ang = Math.atan2(-(b.z - a.z), b.x - a.x);
        E.set(0, ang, 0); Q.setFromEuler(E); pil.push(M.compose(P.set(x, (yt + yb) / 2, z), Q, S.set(1.6, yt - yb, 3.2)).clone()); cab.push(M.compose(P.set(x, yt - .7, z), Q, S.set(2.4, 1.4, 10.5)).clone()); }
      acc -= L; }
    const hormigon = api.concrete(0xaaa79f), hormOsc = api.concrete(0x8f8c85);
    inst(box, hormigon, losa); inst(box, api.concrete(0xc4c1b8), prp); inst(box, hormOsc, pil); inst(box, hormigon, cab);
  }

  // ═════════ 4. Puente de Los Ilustres sobre la Autopista Valle-Coche (vuelta 18,7645–18,837 / ida 15,572–15,6415; OSM layer 3) ═════════
  // El dueño: «en esa parte también pasamos por arriba de la autopista». Por debajo, a ~60° de la ruta: calzada norte de la Valle-Coche, Rampa de
  // La Bandera y calzada sur (OSM). En la foto satelital la trinchera de la autopista está cubierta, fuera de los tableros, por una pérgola de
  // vigas de concreto perpendiculares a ella. El terreno lo baja fx/correcciones/proceres.js (relieve −8 m, km PU0–PU1 de la vuelta, también bajo
  // las calzadas); aquí: losa a nivel de calle fuera de la trinchera, muros, vigas de la pérgola, tableros (canto, losa inferior, pilas),
  // parapeto blanco calado (video t=470,4–471,4 s, der.), baranda verde de tubo (izq.), la autopista con sus carros y los taludes de salida.
  { const PU0 = 18.748, PU1 = 18.862, XZ = (la, lo) => api.xz(la, lo);
    const sv = [], si = []; for (let k = PU0 - .03; k <= PU1 + .03; k += .002) sv.push([k, R(k)]); for (let k = 15.52; k <= 15.70; k += .002) si.push([k, R(k)]);
    // marco de una pasada: km, punto, lateral (+ izquierda) y distancia a lo largo desde el punto más cercano
    const marco = (S, x, z) => { let b = S[0], bd = 1e18; for (const s of S) { const d = (s[1].x - x) ** 2 + (s[1].z - z) ** 2; if (d < bd) { bd = d; b = s; } } const r = b[1]; return { k: b[0], r, y: r.y, lat: (x - r.x) * r.lx + (z - r.z) * r.lz }; };
    // bajo el puente: a la izquierda del borde derecho de la vuelta y a la izquierda del borde exterior (derecho) de la ida
    const bajoPuente = (x, z) => { const v = marco(sv, x, z), i = marco(si, x, z); return v.k > PU0 - .002 && v.k < PU1 + .002 && v.lat > -8.7 && i.lat > -10.4; };
    // ejes de la autopista: u a lo largo (hacia el NE), v a lo ancho; origen en la vuelta entre las dos calzadas
    const O = R(18.809), A1 = XZ(10.480044, -66.894894), A2 = XZ(10.480964, -66.893929), aL = Math.hypot(A2.x - A1.x, A2.z - A1.z), ax = (A2.x - A1.x) / aL, az = (A2.z - A1.z) / aL, nx = -az, nz = ax;
    const UV = (u, v) => ({ x: O.x + ax * u + nx * v, z: O.z + az * u + nz * v }), WC = 18.6;   // media trinchera (calzada sur −18,1 … calzada norte +17,4)
    const yCalle = (x, z) => marco(sv, x, z).y, G = api.ground;
    // dentro del rectángulo del relieve (fuera de él la cota natural manda: nada de losas ni muros sobre suelo que ya era bajo)
    const enHoyo = (x, z) => { const v = marco(sv, x, z); return v.k > PU0 + .001 && v.k < PU1 - .001 && v.lat > -70 && v.lat < 85; };
    const conc = api.concrete(0xb1ada3), concOsc = api.concrete(0x77746d), muroM = api.concrete(0xa49f94, { roughness: .95 });
    // malla de cuadros en (u, v) con la cara hacia arriba; f(x, z) → y o null
    const losa = (u0, u1, v0, v1, paso, f, mat) => { const pos = [], uv = [];
      for (let u = u0; u < u1 - 1e-6; u += paso) for (let v = v0; v < v1 - 1e-6; v += paso) { const c = UV(u + paso / 2, v + paso / 2); if (f(c.x, c.z, true) == null) continue;
        const q = [[u, v], [u + paso, v], [u + paso, v + paso], [u, v + paso]].map(([a, b]) => { const p = UV(a, b); return [p.x, f(p.x, p.z, false), p.z]; });
        for (const t of [[0, 1, 2], [0, 2, 3]]) { const A = q[t[0]], B = q[t[1]], C = q[t[2]], ny = (B[2] - A[2]) * (C[0] - A[0]) - (B[0] - A[0]) * (C[2] - A[2]);
          for (const P3 of ny >= 0 ? [A, B, C] : [A, C, B]) { pos.push(...P3); uv.push(P3[0] / 6, P3[2] / 6); } } }
      if (!pos.length) return null; const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.computeVertexNormals();
      const m = new THREE.Mesh(ge, mat); m.receiveShadow = true; g.add(m); return m; };
    // 4a. losa a nivel de calle sobre el hoyo FUERA de la trinchera (el relieve es un rectángulo a lo largo de la ruta; la autopista va en diagonal)
    const tierraCalle = new THREE.MeshStandardMaterial({ roughness: 1, map: tex(256, 256, (k, w, h) => { k.fillStyle = '#434a33'; k.fillRect(0, 0, w, h);
      for (let i = 0; i < 1400; i++) { const q = Math.random(); k.fillStyle = q < .5 ? `rgba(${45 + Math.random() * 30},${70 + Math.random() * 35},35,.7)` : `rgba(${110 + Math.random() * 30},${95 + Math.random() * 25},${65 + Math.random() * 20},.45)`; k.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 9, 2 + Math.random() * 6); } }) });
    for (const [v0, v1] of [[-125, -WC - .3], [WC + .3, 125]]) losa(-150, 150, v0, v1, 2.5, (x, z, cen) => { const y = yCalle(x, z); if (cen && (y - G(x, z) < .7 || !enHoyo(x, z))) return null; return y - .3; }, tierraCalle);
    // 4b. piso de la trinchera (berma) y la autopista: calzadas de OSM pegadas al suelo
    losa(-150, 150, -WC - .3, WC + .3, 3, (x, z, cen) => { if (cen && (yCalle(x, z) - G(x, z) < .5 || !enHoyo(x, z))) return null; return G(x, z) + .04; }, api.concrete(0x8f8b7d, { roughness: 1 }));
    const rayas = tex(96, 256, (c, w, h) => { c.fillStyle = '#4c4d50'; c.fillRect(0, 0, w, h); c.fillStyle = '#dcdcd4'; for (const xx of [w / 3, w * 2 / 3]) for (let y = 0; y < h; y += 64) c.fillRect(xx - 1.5, y, 3, 30);
      c.fillStyle = '#e2b62a'; c.fillRect(1, 0, 3, h); c.fillStyle = '#e4e4de'; c.fillRect(w - 4, 0, 3, h); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(20,20,20,${Math.random() * .12})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } });
    const pista = new THREE.MeshStandardMaterial({ map: rayas, roughness: .9 });
    const VIAS = {
      norte: { w: 11, dy: .12, ll: [[10.479058, -66.895382], [10.479609, -66.89516], [10.480044, -66.894894], [10.480298, -66.89469], [10.480405, -66.894593], [10.480964, -66.893929], [10.481284, -66.893399], [10.481461, -66.893006], [10.481572, -66.89272]] },
      sur: { w: 10, dy: .1, ll: [[10.481975, -66.892156], [10.481628, -66.892989], [10.481151, -66.894005], [10.480898, -66.894366], [10.480721, -66.894595], [10.480463, -66.894818], [10.480261, -66.89498], [10.480049, -66.895135], [10.479676, -66.89535], [10.479291, -66.89551]] },
      rampa: { w: 6.5, dy: .08, ll: [[10.479042, -66.895478], [10.479429, -66.895343], [10.47986, -66.895159], [10.480141, -66.894973], [10.480344, -66.894826], [10.480555, -66.894663], [10.480724, -66.89448], [10.480908, -66.894223], [10.481177, -66.893748], [10.481284, -66.893399]] } };
    const linea = ll => { const p = ll.map(([a, b]) => XZ(a, b)), out = []; for (let i = 0; i < p.length - 1; i++) { const L = Math.hypot(p[i + 1].x - p[i].x, p[i + 1].z - p[i].z), n = Math.max(1, Math.round(L / 3)); for (let j = 0; j < n; j++) out.push({ x: p[i].x + (p[i + 1].x - p[i].x) * j / n, z: p[i].z + (p[i + 1].z - p[i].z) * j / n }); } out.push(p[p.length - 1]);
      let s = 0; out.forEach((q, i) => { if (i) s += Math.hypot(q.x - out[i - 1].x, q.z - out[i - 1].z); q.s = s; const a = out[Math.max(0, i - 1)], b = out[Math.min(out.length - 1, i + 1)], l = Math.hypot(b.x - a.x, b.z - a.z) || 1; q.tx = (b.x - a.x) / l; q.tz = (b.z - a.z) / l; q.y = G(q.x, q.z); }); return out; };
    for (const V of Object.values(VIAS)) { V.p = linea(V.ll); const pos = [], uv = [], idx = [];
      V.p.forEach((q, i) => { for (const sd of [-1, 1]) { const x = q.x - q.tz * sd * V.w / 2, z = q.z + q.tx * sd * V.w / 2; pos.push(x, G(x, z) + V.dy, z); uv.push(sd < 0 ? 0 : (V.w > 8 ? 1 : .67), q.s / 22); }
        if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } });
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.setIndex(idx); ge.computeVertexNormals();
      if (ge.attributes.normal.getY(0) < 0) { const I = ge.index.array; for (let t = 0; t < I.length; t += 3) { const q = I[t + 1]; I[t + 1] = I[t + 2]; I[t + 2] = q; } ge.computeVertexNormals(); }
      const m = new THREE.Mesh(ge, pista); m.receiveShadow = true; g.add(m); }
    // 4c. muros de la trinchera (cara hacia la autopista y hacia afuera: dos caras frontales) con remate, solo donde hay hondura
    { const pos = [], rem = [];
      for (const sd of [-1, 1]) for (let u = -150; u < 150; u += 3) { const a = UV(u, sd * (WC + .3)), b = UV(u + 3, sd * (WC + .3)), ya = yCalle(a.x, a.z) - .3, yb = yCalle(b.x, b.z) - .3, ga = G(a.x, a.z) - .3, gb = G(b.x, b.z) - .3;
        if ((ya - ga < 1 && yb - gb < 1) || !enHoyo(a.x, a.z)) continue; const q = [[a.x, ga, a.z], [b.x, gb, b.z], [b.x, yb, b.z], [a.x, ya, a.z]];
        pos.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3], ...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]); rem.push(tramo({ x: a.x, y: ya, z: a.z }, { x: b.x, y: yb, z: b.z }, .7, .35)); }
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.computeVertexNormals(); g.add(new THREE.Mesh(ge, muroM)); inst(box, conc, rem); }
    // 4d. pérgola: vigas a lo ancho de la trinchera cada 2,4 m, fuera de los tableros y solo donde hay hueco debajo
    { const vg = []; for (let u = -150; u < 150; u += 2.4) { let run = null;
        for (let v = -WC; v <= WC + 1e-6; v += 1) { const p = UV(u, v), y = yCalle(p.x, p.z), ok = y - G(p.x, p.z) > 3 && enHoyo(p.x, p.z) && !bajoPuente(p.x, p.z);
          if (ok) { if (!run) run = { a: { ...p, y: y - 1.05 } }; run.b = { ...p, y: y - 1.05 }; } if ((!ok || v + 1 > WC + 1e-6) && run) { if (run.b !== run.a) vg.push(tramo(run.a, run.b, .32, .8)); run = null; } } }
      inst(box, conc, vg); }
    // 4e. tableros: losa inferior y canto exterior de la vuelta (der.) y de la ida (der., hacia afuera), pilas sobre la isla entre la calzada norte y la rampa
    const ESP = 1.7, parI = km => { const r = R(km); let b = null, bd = 1e18; for (const [, q] of si) { const d = (q.x - r.x) ** 2 + (q.z - r.z) ** 2; if (d < bd) { bd = d; b = q; } } return (b.x - r.x) * r.lx + (b.z - r.z) * r.lz; };
    const cintaDos = (k0, k1, f, mat) => { const pos = []; let prev = null;
      for (let k = k0; k <= k1 + 1e-6; k += .004) { const cur = f(k); if (prev && cur) { const [a, b] = prev, [c, d] = cur; pos.push(...a, ...c, ...b, ...b, ...c, ...d, ...a, ...b, ...c, ...b, ...d, ...c); } prev = cur; }
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.computeVertexNormals(); const m = new THREE.Mesh(ge, mat); g.add(m); return m; };
    const P3 = (r, l, y) => [r.x + r.lx * l, y, r.z + r.lz * l];
    cintaDos(PU0, PU1, k => { const r = R(k); return [P3(r, -8.7, r.y - ESP), P3(r, parI(k) + 10.4, r.y - ESP)]; }, concOsc);                 // losa inferior de los dos tableros y la isla
    cintaDos(PU0, PU1, k => { const r = R(k); return [P3(r, -8.7, r.y + .22), P3(r, -8.7, r.y - ESP)]; }, conc);                              // canto der. de la vuelta
    cintaDos(15.555, 15.66, k => { const r = R(k); return [P3(r, -10.4, r.y + .22), P3(r, -10.4, r.y - ESP)]; }, conc);                        // canto der. de la ida
    { const vi = []; for (let k = PU0; k < PU1 - 1e-6; k += .006) { const r0 = R(k), r1 = R(k + .006), pi = parI(k + .003);   // vigas longitudinales bajo la losa
        for (const l of [-6.5, -1.5, 3.5, 8.5, pi - 5, pi + .5, pi + 6]) vi.push(tramo({ x: r0.x + r0.lx * l, y: r0.y - ESP - 1.1, z: r0.z + r0.lz * l }, { x: r1.x + r1.lx * l, y: r1.y - ESP - 1.1, z: r1.z + r1.lz * l }, .5, 1.1)); }
      inst(box, concOsc, vi); }
    { const colG = new THREE.CylinderGeometry(.55, .55, 1, 12), cols = [], cabs = [];
      for (let u = -150; u < 150; u += 4.5) { const p = UV(u, 3), y = yCalle(p.x, p.z) - ESP - 1.1, gy = G(p.x, p.z) - .4; if (!bajoPuente(p.x, p.z) || y - gy < 2) continue;
        cols.push(M.compose(P.set(p.x, (y + gy) / 2, p.z), Q.identity(), S.set(1, y - gy, 1)).clone()); }
      { for (let u = -150; u < 150; u += 3) { const p = UV(u, 3), q = UV(u + 3, 3); if (!bajoPuente(p.x, p.z) || !bajoPuente(q.x, q.z)) continue;
          cabs.push(tramo({ x: p.x, y: yCalle(p.x, p.z) - ESP - 2.2, z: p.z }, { x: q.x, y: yCalle(q.x, q.z) - ESP - 2.2, z: q.z }, 1.6, 1.1)); }}
      inst(colG, conc, cols); inst(box, conc, cabs); }
    // 4f. parapeto blanco calado (una cinta con UV en metros, material único y recorte alfa, sin transparencia) y su tapa
    { const calado = tex(256, 64, (k, w, h) => { k.fillStyle = '#ecebe6'; k.fillRect(0, 0, w, h); k.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 8; i++) k.fillRect(i * 32 + 7, 14, 18, 30); }, 1, 1);
      const mat = new THREE.MeshStandardMaterial({ map: calado, alphaTest: .5, side: THREE.DoubleSide, roughness: .8 }), tapa = api.concrete(0xefeee9), tps = [];
      const parapeto = (km0, km1, d) => { const pos = [], uv = [], idx = []; let s = 0, prev = null, n = 0;
        for (let km = km0; km <= km1 + 1e-6; km += .004, n++) { const p = lado(km, d); if (prev) { s += Math.hypot(p.x - prev.x, p.z - prev.z); tps.push(tramo(prev, p, .3, .16, 1.12)); } prev = p;
          pos.push(p.x, p.y + .2, p.z, p.x, p.y + 1.2, p.z); uv.push(s / 8, 0, s / 8, 1); if (n) { const a = (n - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
        const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.setIndex(idx); ge.computeVertexNormals(); g.add(new THREE.Mesh(ge, mat)); };
      parapeto(15.566, 15.652, -9.6); parapeto(15.566, 15.652, 7.3);       // ida: borde exterior y borde de la isla
      parapeto(18.758, 18.846, -7.6);                                        // vuelta: borde exterior (video t=470,4–471,4)
      inst(box, tapa, tps); }
    // 4g. vuelta, izquierda: baranda verde oscuro de tubo sobre la acera (video t=470,4–471,4) y franja verde-celeste junto al parapeto (der.)
    { const verde = api.concrete(0x1f3a2c, { roughness: .5, metalness: .35 }), pts = [], rl = [];
      for (let km = 18.758; km < 18.846 - 1e-6; km += .002) { const a = lado(km, 8.4), b = lado(km + .002, 8.4); pts.push(M.compose(P.set(a.x, a.y + .72, a.z), Q.identity(), S.set(.07, 1.1, .07)).clone());
        rl.push(tramo(a, b, .06, .06, .55)); rl.push(tramo(a, b, .07, .07, 1.22)); }
      inst(box, verde, pts); inst(box, verde, rl);
      cinta(18.758, 18.846, .004, () => [-7.45, -6.95], api.concrete(0x7fc3ad, { roughness: .9 }), .2, 6);
      // farolas verdes de dos globos en el borde derecho
      const globo = api.glow(0xf6f3e8, { dia: .25, noche: 2 }), fp = [], fb = [], fg = [];
      for (const km of [18.772, 18.83]) { const f = lado(km, -7.9); fp.push(M.compose(P.set(f.x, f.y + 2.4, f.z), Q.identity(), S.set(.16, 4.8, .16)).clone());
        const ry = Math.atan2(f.r.tx, f.r.tz); fb.push(M.compose(P.set(f.x, f.y + 4.6, f.z), Q.setFromEuler(E.set(0, ry, 0)), S.set(1.3, .08, .08)).clone());
        for (const s of [-.62, .62]) fg.push(M.compose(P.set(f.x + f.r.lx * s, f.y + 4.95, f.z + f.r.lz * s), Q.identity(), S.set(1, 1, 1)).clone()); Q.identity(); }
      inst(box, verde, fp); inst(box, verde, fb); inst(new THREE.SphereGeometry(.3, 10, 8), globo, fg); }
    // 4h. carros en la autopista (animados: fuera de la fusión)
    { const cols = [0xe8e8e8, 0x2b2d33, 0x9aa3ad, 0xa31d22, 0x1f3b6e, 0xd8d2c0, 0x55595e, 0xf2f2f0], carro = new THREE.BoxGeometry(1.8, 1.45, 4.3); carro.translate(0, .72, 0);
      const lista = [], vs = Object.values(VIAS); for (let i = 0; i < 30; i++) { const V = vs[i % 3], nl = V.w > 8 ? 3 : 2; lista.push({ V, off: ((i % nl) - (nl - 1) / 2) * 3.3, s: Math.random() * V.p[V.p.length - 1].s, v: 15 + Math.random() * 9 }); }
      const im = new THREE.InstancedMesh(carro, new THREE.MeshStandardMaterial({ roughness: .4, metalness: .5 }), lista.length); im.userData.noFusion = true; lista.forEach((c, i) => im.setColorAt(i, new THREE.Color(cols[i % cols.length])));
      const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), ee = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1), VV = new THREE.Vector3();
      const pon = () => lista.forEach((c, i) => { const p = c.V.p; let j = 0; while (j < p.length - 2 && p[j + 1].s < c.s) j++; const a = p[j], b = p[j + 1], t = Math.min(1, Math.max(0, (c.s - a.s) / ((b.s - a.s) || 1)));
        const x = a.x + (b.x - a.x) * t - a.tz * c.off, z = a.z + (b.z - a.z) * t + a.tx * c.off; qq.setFromEuler(ee.set(0, Math.atan2(a.tx, a.tz), 0)); m4.compose(VV.set(x, a.y + (b.y - a.y) * t + c.V.dy, z), qq, one); im.setMatrixAt(i, m4); });
      pon(); api.onFrame(st => { lista.forEach(c => { const L = c.V.p[c.V.p.length - 1].s; c.s = (c.s + c.v * Math.min(st.dt || 0, .1)) % L; }); pon(); im.instanceMatrix.needsUpdate = true; }); g.add(im); }
  }

  // ═════════ 5. Paseo Los Próceres: acera rosada, brocal grueso, urnas y farolas (siempre a la izquierda) ═════════
  { const rosa = new THREE.MeshStandardMaterial({ roughness: .95, map: tex(128, 128, (k, w, h) => { k.fillStyle = '#c99482'; k.fillRect(0, 0, w, h); k.strokeStyle = 'rgba(120,80,70,.35)'; k.lineWidth = 2;
      for (let i = 0; i <= 8; i++) { k.beginPath(); k.moveTo(0, i * 16); k.lineTo(w, i * 16); k.stroke(); } for (let i = 0; i < 64; i++) { const r = Math.floor(i / 8), c = i % 8; k.beginPath(); k.moveTo(c * 16 + (r % 2) * 8, r * 16); k.lineTo(c * 16 + (r % 2) * 8, r * 16 + 16); k.stroke(); } }) });
    const blanco = api.concrete(0xf1f0ea, { roughness: .7 }), verde = api.concrete(0x1f4b35, { roughness: .5, metalness: .3 }), globo = api.glow(0xf6f3e8, { dia: .25, noche: 2 });
    // urna: copa de piedra blanca (torno) sobre pedestal cuadrado con cornisa
    const perfil = [[0, 0], [.42, 0], [.3, .12], [.24, .3], [.36, .42], [.62, .62], [.7, .95], [.66, 1.25], [.78, 1.32], [.74, 1.42], [0, 1.42]].map(([x, y]) => new THREE.Vector2(x, y));
    const urnaG = new THREE.LatheGeometry(perfil, 14), pedG = new THREE.BoxGeometry(1.25, 2.1, 1.25), corG = new THREE.BoxGeometry(1.5, .2, 1.5); urnaG.scale(1.3, 1.3, 1.3);
    const ur = [], pd = [], co = [], fp = [], fb = [], fg = [];
    const paseo = (km0, km1) => {
      cinta(km0, km1, .01, () => [7.1, 12.6], rosa, .2, 6);
      const bm = []; for (let km = km0; km < km1 - 1e-6; km += .01) bm.push(tramo(lado(km, 6.95), lado(Math.min(km1, km + .01), 6.95), .55, .34));
      inst(box, amarillo, bm);
      for (let km = km0 + .012; km < km1; km += .025) { const p = lado(km, 11.2, .2), ry = Math.atan2(p.r.tx, p.r.tz);
        pd.push(M.compose(P.set(p.x, p.y + 1.05, p.z), Q.setFromEuler(E.set(0, ry, 0)), S.set(1, 1, 1)).clone()); co.push(M.compose(P.set(p.x, p.y + 2.15, p.z), Q, S.set(1, 1, 1)).clone());
        ur.push(M.compose(P.set(p.x, p.y + 2.25, p.z), Q, S.set(1, 1, 1)).clone());
        const f = lado(km + .0125, 8.2, .2), fy = Math.atan2(f.r.tx, f.r.tz);   // farola de dos globos entre urna y urna
        fp.push(M.compose(P.set(f.x, f.y + 2.3, f.z), Q.setFromEuler(E.set(0, fy, 0)), S.set(.16, 4.6, .16)).clone()); fb.push(M.compose(P.set(f.x, f.y + 4.4, f.z), Q, S.set(.08, .08, 1.3)).clone());
        for (const s of [-.62, .62]) fg.push(M.compose(P.set(f.x + f.r.tx * s, f.y + 4.75, f.z + f.r.tz * s), Q, S.set(1, 1, 1)).clone()); }
      Q.identity(); };
    paseo(16.62, 17.12); paseo(17.28, 17.86);
    inst(pedG, blanco, pd); inst(corG, blanco, co); inst(urnaG, blanco, ur); inst(box, verde, fp); inst(box, verde, fb); inst(new THREE.SphereGeometry(.3, 10, 8), globo, fg);
  }

  // ═════════ 6. Vuelta por Los Próceres, derecha: isla de palmas reales y ciclovía verde-celeste ═════════
  const palmasReales = [];
  { cinta(17.28, 17.86, .01, () => [-9.9, -7.1], grama, .19, 6);
    cinta(17.28, 17.86, .01, () => [-13.1, -9.9], api.concrete(0x86c7b2, { roughness: .9 }), .21, 6);
    for (let km = 17.29, i = 0; km < 17.86; km += .011, i++) { const p = lado(km, -8.5, .2); palmasReales.push([p.x, p.y, p.z, 15 + (i * 5) % 5, i]); }
  }
  // también en el paseo (lado izquierdo de la vuelta y de la ida) hay palmas reales altas sueltas (f_0163–0170, f_0157–0161)
  for (const [k0, k1, d] of [[16.63, 17.1, 13.4], [17.3, 17.84, 13.4]]) for (let km = k0, i = 0; km < k1; km += .037, i++) { const p = lado(km, d + (i % 2) * 1.5, .2); palmasReales.push([p.x, p.y, p.z, 17 + (i * 3) % 5, i + 40]); }
  { const fr = []; for (let i = 0; i < 16; i++) { const f = new THREE.ConeGeometry(.75, 4.8, 3, 1); f.rotateX(Math.PI / 2); f.scale(1, .18, 1); f.translate(0, 0, 2.4); f.rotateX(i % 4 === 0 ? -.35 : .15 + (i % 3) * .3); f.rotateY(i / 16 * Math.PI * 2 + (i % 2) * .2); fr.push(f); }
    const coronaG = merge(fr), estipeG = new THREE.CylinderGeometry(.27, .36, 1, 8); estipeG.translate(0, .5, 0); const capitelG = new THREE.CylinderGeometry(.3, .3, 1, 8); capitelG.translate(0, .5, 0);
    const te = [], tc = [], tf = [];
    for (const [x, y, z, h, s] of palmasReales) { te.push(M.compose(P.set(x, y, z), Q.identity(), S.set(1, h, 1)).clone()); tc.push(M.compose(P.set(x, y + h, z), Q, S.set(1, 2.3, 1)).clone());
      Q.setFromAxisAngle(P.set(0, 1, 0), s * 1.3); tf.push(M.compose(P.set(x, y + h + 2.3, z), Q, S.set(1, 1, 1)).clone()); }
    Q.identity(); inst(estipeG, api.concrete(0xb9b4a6), te); inst(capitelG, api.concrete(0x6f8c3c), tc); inst(coronaG, new THREE.MeshStandardMaterial({ color: 0x4f7a34, roughness: .9, side: THREE.DoubleSide }), tf);
  }

  // ═════════ 7. Muro de piedra de la terraza del edificio blanco (17,28–17,50 der.; f_0163) ═════════
  { const piedra = new THREE.MeshStandardMaterial({ roughness: .95, map: tex(256, 128, (k, w, h) => { k.fillStyle = '#8d8a80'; k.fillRect(0, 0, w, h);
      for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) { { const v = 105 + Math.random() * 35; k.fillStyle = `rgb(${v + 6},${v + 2},${v - 6})`; } k.fillRect(c * 29 + (r % 2) * 14 + 2, r * 21 + 2, 25, 17); } }) });
    for (let km = 17.28; km < 17.5 - 1e-6; km += .01) { const a = lado(km, -15.8), b = lado(km + .01, -15.8), top = Math.max(api.ground(a.x - a.r.lx * 4, a.z - a.r.lz * 4), a.y + 2.2) + .3, L = Math.hypot(b.x - a.x, b.z - a.z);
      const m = add(new THREE.BoxGeometry(L + .05, top - a.y + .6, .6), piedra, (a.x + b.x) / 2, (a.y + top - .6) / 2, (a.z + b.z) / 2); m.rotation.y = Math.atan2(-(b.z - a.z), b.x - a.x);
      m.material = piedra; }
  }

  // ═════════ 8. Estacionamiento EPA de 6 niveles (OSM, en construcción; f_0178) ═════════
  { const poly = [[10.471932, -66.896262], [10.471703, -66.896436], [10.471405, -66.896107], [10.471461, -66.896053], [10.471593, -66.89594], [10.471718, -66.895814], [10.472036, -66.896174]].map(([a, b]) => api.xz(a, b));
    const cx = poly.reduce((s, p) => s + p.x, 0) / poly.length, cz = poly.reduce((s, p) => s + p.z, 0) / poly.length, y0 = api.ground(cx, cz);
    const forma = (k) => { const sh = new THREE.Shape(poly.map(p => new THREE.Vector2((p.x - cx) * k, -(p.z - cz) * k))); return sh; };
    const ext = (k, h) => { const ge = new THREE.ExtrudeGeometry(forma(k), { depth: h, bevelEnabled: false }); ge.rotateX(-Math.PI / 2); return ge; };
    const nucleo = add(ext(.96, 18.6), api.concrete(0x3c3e40), cx, y0, cz);
    const banda = ext(1, 1.05), losaC = api.concrete(0xc9c6bd);
    for (let n = 0; n < 6; n++) add(banda, losaC, cx, y0 + 1.9 + n * 3.1, cz);
    add(ext(1, .5), losaC, cx, y0 + 18.6, cz);
    nucleo.castShadow = true;
  }

  // ═════════ 9. Letrero BDV a la derecha (17,95; f_0180) ═════════
  { const p = lado(17.95, -11), T = new THREE.Group(); T.position.set(p.x, p.y, p.z); T.rotation.y = Math.atan2(p.r.tx, p.r.tz) + Math.PI; g.add(T);
    const cara = api.canvasTex(128, 512, (k, w, h) => { k.fillStyle = '#f4f4f2'; k.fillRect(0, 0, w, h * .32); k.fillStyle = '#d42a2a'; k.font = 'bold 54px sans-serif'; k.textAlign = 'center'; k.fillText('BDV', w / 2 + 6, h * .2);
      k.fillStyle = '#d42a2a'; k.beginPath(); k.moveTo(12, h * .12); k.lineTo(26, h * .2); k.lineTo(12, h * .2); k.fill();
      const cs = ['#f2c21b', '#1f4ea8', '#d42a2a']; for (let i = 0; i < 3; i++) { k.fillStyle = cs[i]; k.fillRect(0, h * (.32 + i * .06), w, h * .06); } k.fillStyle = '#2f3540'; k.fillRect(0, h * .5, w, h * .5); });
    const mat = new THREE.MeshStandardMaterial({ map: cara, roughness: .5 });
    add(new THREE.BoxGeometry(3, 11, .7), [api.concrete(0x2f3540), api.concrete(0x2f3540), api.concrete(0xf4f4f2), api.concrete(0x2f3540), mat, mat], 0, 5.5, 0, T);
  }

  // ═════════ 10. Hongos decorativos ═════════
  { const lunares = api.canvasTex(256, 128, (k, w, h) => { k.fillStyle = '#d0201c'; k.fillRect(0, 0, w, h); k.fillStyle = '#fbf7ee'; for (let i = 0; i < 26; i++) { k.beginPath(); k.arc((i * 53) % w, 10 + (i * 37) % (h - 30), 9 + (i % 3) * 3, 0, 7); k.fill(); } });
    const hongo = (km, d, alto, rc, mat) => { const p = lado(km, d, .2); add(new THREE.CylinderGeometry(rc * .28, rc * .36, alto, 12), api.concrete(0xf3efe2), p.x, p.y + alto / 2, p.z);
      add(new THREE.SphereGeometry(rc, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat, p.x, p.y + alto - .1, p.z).scale.y = .7;
      add(new THREE.CylinderGeometry(rc, rc * .92, .25, 18), mat, p.x, p.y + alto - .1, p.z); };
    const rojo = new THREE.MeshStandardMaterial({ map: lunares, roughness: .5 }), turq = api.concrete(0x2cb8c9, { roughness: .35, metalness: .2 }), amar = api.concrete(0xf1c62a, { roughness: .45 });
    hongo(17.44, 10.4, 1.9, .9, amar); hongo(17.57, 10.4, 2.4, 1.2, rojo); hongo(17.73, 10.4, 2.4, 1.2, rojo); hongo(17.66, 10.6, 1.8, .8, turq);
    hongo(17.88, 15, 4.6, 3.4, turq);                   // el turquesa gigante de la redoma (f_0181)
    hongo(18.17, 13, 2.2, 1.5, turq);                   // en la isla de Los Ilustres de vuelta (f_0182)
    hongo(16.98, 10.4, 2.2, 1.1, rojo);
  }

  // ═════════ 11. Salida del puente de Los Ilustres, derecha (km 18,84–18,95; video t=471–472,5 s) ═════════
  // Nave de un piso con techo de tejas naranja en dientes de sierra (la huella la baja fx/correcciones/proceres.js a 3,4 m), reja gris
  // corrida en el borde de la acera y una valla alta de cara oscura al pie de las torres crema.
  { const XZ = (la, lo) => api.xz(la, lo);
    // borde de la nave que da a la ruta (huella OSM, de sur a norte) y fondo del techo hacia dentro
    const A = XZ(10.481385, -66.894284), B = XZ(10.481858, -66.894529), ux = B.x - A.x, uz = B.z - A.z, L = Math.hypot(ux, uz), u = [ux / L, uz / L];
    let v = [-u[1], u[0]]; const cen = XZ(10.481711, -66.894375); if ((cen.x - A.x) * v[0] + (cen.z - A.z) * v[1] < 0) v = [-v[0], -v[1]];   // v: hacia dentro
    const teja = new THREE.MeshStandardMaterial({ map: tex(128, 64, (k, w, h) => { k.fillStyle = '#c4572d'; k.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) { k.fillStyle = 'rgba(80,25,10,.35)'; k.fillRect(0, y, w, 2); }
      for (let x = 0; x < w; x += 6) { k.fillStyle = 'rgba(255,190,140,.12)'; k.fillRect(x, 0, 2, h); } }), roughness: .85 });
    const H0 = 3.4, RISE = 1.5, D = 7, N = Math.round(L / 4.2), w = L / N, pos = [], uvs = [];
    const P3 = (s, d, y) => { const x = A.x + u[0] * s + v[0] * d, z = A.z + u[1] * s + v[1] * d; return [x, y, z]; };
    const yb = Math.min(api.ground(A.x, A.z), api.ground(B.x, B.z), api.ground(A.x + v[0] * D, A.z + v[1] * D)) + H0;
    const tri = (a, b, c, ua, ub, uc) => { pos.push(...a, ...b, ...c); uvs.push(...ua, ...ub, ...uc); };
    for (let i = 0; i < N; i++) { const s0 = i * w, s1 = s0 + w, sm = s0 + w / 2;
      // cada diente: dos aguas con la cumbrera perpendicular a la calle (los hastiales miran a la vía), de 0 a D m hacia dentro
      const a0 = P3(s0, -.4, yb), a1 = P3(sm, -.4, yb + RISE), a2 = P3(s1, -.4, yb), b0 = P3(s0, D, yb), b1 = P3(sm, D, yb + RISE), b2 = P3(s1, D, yb);
      tri(a0, b0, a1, [0, 0], [D / 2, 0], [0, 1]); tri(a1, b0, b1, [0, 1], [D / 2, 0], [D / 2, 1]); tri(a1, b1, a2, [0, 1], [D / 2, 1], [0, 0]); tri(a2, b1, b2, [0, 0], [D / 2, 1], [D / 2, 0]);
      tri(a0, a1, a2, [0, 0], [.5, .5], [1, 0]); }   // hastial del lado de la calle
    const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    const P0 = ge.attributes.position.array, U0 = ge.attributes.uv.array, n = P0.length / 3, PP = new Float32Array(P0.length * 2), UU = new Float32Array(U0.length * 2); PP.set(P0); UU.set(U0);
    for (let t = 0; t < n; t += 3) for (let j = 0; j < 3; j++) { const a = t + 2 - j, b = n + t + j; PP.set(P0.subarray(a * 3, a * 3 + 3), b * 3); UU.set(U0.subarray(a * 2, a * 2 + 2), b * 2); }   // dos caras frontales (oclusión ambiental)
    const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute(PP, 3)); g2.setAttribute('uv', new THREE.Float32BufferAttribute(UU, 2)); g2.computeVertexNormals();
    g.add(new THREE.Mesh(g2, teja));
    // reja gris del borde de la acera (barrotes instanciados + pasamanos), 18,845–18,955 a 9,6 m del eje
    const barro = new THREE.BoxGeometry(.05, 1, .05), gris = api.concrete(0x8d9194, { metalness: .5, roughness: .5 }), mats = [];
    for (let km = 18.845; km <= 18.955; km += .00016) { const p = lado(km, -9.6); M.compose(P.set(p.x, p.y + 1.15, p.z), Q.identity(), S.set(1, 2.1, 1)); mats.push(M.clone()); }
    inst(barro, gris, mats);
    for (const hy of [.25, 2.1]) cinta(18.845, 18.955, .005, () => [-9.62, -9.58], gris, hy, 1);
    const poste = new THREE.BoxGeometry(.12, 2.3, .12); for (let km = 18.845; km <= 18.956; km += .0025) { const p = lado(km, -9.6); add(poste, gris, p.x, p.y + 1.15, p.z); }
    // valla alta de cara oscura (la vemos por detrás, enrejado de perfiles) a la derecha del final del puente
    { const p = lado(18.842, -13.5), T = new THREE.Group(); T.position.set(p.x, p.y, p.z); T.rotation.y = Math.atan2(p.r.tx, p.r.tz) + Math.PI; g.add(T);
      const reja = api.canvasTex(64, 128, (k, w, h) => { k.fillStyle = '#2d3133'; k.fillRect(0, 0, w, h); k.strokeStyle = '#4a4f52'; k.lineWidth = 2; for (let x = 0; x <= w; x += 16) { k.beginPath(); k.moveTo(x, 0); k.lineTo(x, h); k.stroke(); } for (let y = 0; y <= h; y += 16) { k.beginPath(); k.moveTo(0, y); k.lineTo(w, y); k.stroke(); } });
      const mr = new THREE.MeshStandardMaterial({ map: reja, roughness: .7, metalness: .3 }), mo = api.concrete(0x2d3133);
      add(new THREE.BoxGeometry(4.6, 9, .5), [mo, mo, mo, mo, mr, mr], 0, 6, 0, T);
      for (const x of [-1.4, 1.4]) add(new THREE.BoxGeometry(.4, 1.6, .4), mo, x, .8, 0, T); }
  }

  // ═════════ 12. C.C. Los Ilustres (km 15,33 der.): letrero de McDonald's y franja de rótulos oscuros en la fachada blanca (f_0147) ═════════
  // auditoría final 19-nov: la huella (OSM, 15 m, blanca en fx/correcciones/proceres.js) salía lisa. Cara este, la que mira a la avenida:
  // esquina norte (10.482893, −66.895924) → esquina sur (10.482457, −66.895639); el McDonald's queda en la punta norte, la que se ve primero desde la redoma.
  { const A = api.xz(10.482893, -66.895924), B = api.xz(10.482457, -66.895639), C = api.xz(10.482572, -66.896120);
    const dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L; let nx = -uz, nz = ux;
    if ((A.x + B.x) / 2 * nx + (A.z + B.z) / 2 * nz < C.x * nx + C.z * nz) { nx = -nx; nz = -nz; }   // normal hacia afuera (la avenida)
    const yaw = Math.atan2(nx, nz), y0 = Math.min(api.ground(A.x, A.z), api.ground(B.x, B.z));
    const pon = (t, h, w, alto, mat, sal = .35) => { const m = add(new THREE.BoxGeometry(w, alto, .3), mat, A.x + dx * t + nx * sal, y0 + h, A.z + dz * t + nz * sal); m.rotation.y = yaw; return m; };
    const mc = api.canvasTex(512, 96, (k, w, h) => { k.fillStyle = '#d52b1e'; k.fillRect(0, 0, w, h); k.fillStyle = '#ffc72c'; k.font = 'bold 84px Arial'; k.textBaseline = 'middle'; k.fillText('M', 380, h / 2 + 4);
      k.fillStyle = '#fff'; k.font = 'bold 50px Arial'; k.fillText("McDonald's", 40, h / 2 + 2); });
    const mcM = api.glow(0xffffff, { dia: .12, noche: .9 }); mcM.map = mcM.emissiveMap = mc; mcM.needsUpdate = true; const rojo = api.concrete(0xd52b1e), negro = api.concrete(0x1e1f22);
    pon(.16, 8.4, 8, 1.5, [rojo, rojo, rojo, rojo, mcM, rojo]);
    pon(.16, 6.6, 8, .6, api.concrete(0xe0582a));                        // franja naranja bajo el letrero
    pon(.5, 6.9, 22, 1.1, negro, .25);                                  // franja de rótulos oscuros (tiendas y cine)
    pon(.5, 1.1, L * .9, 2.2, api.concrete(0x7d7a73), .6); }            // muro bajo de piedra gris con reja (planta baja, f_0147)

  if (arboles.length) plantaArboles();
  return api.sombras(g);
}
