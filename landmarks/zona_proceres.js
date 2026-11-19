// Zona proceres (km 15,3–19,0): lo que el video muestra y no sale de las huellas genéricas.
// Anclas y desfase del índice de fotogramas: ver la cabecera de fx/correcciones/proceres.js.
// - Isla central de Los Ilustres (ida 15,70–16,34 / vuelta 18,15–18,72): tierra seca con árboles altos de copa ancha, brocal
//   amarillo a los dos lados y bolardos-luminaria (f_0151–0155, f_0182–0186). El generador deja ahí asfalto de la calzada contraria.
// - Parque de atracciones (km 15,36–15,60 der.): muro amarillo con reja azul, torre de caída roja y blanca, valla gigante (f_0148–0149).
// - Viaducto de la Autopista Valle-Coche (OSM, layer 2) paralelo a la derecha de la ida, 25–55 m (f_0153–0154).
// - Puente de Los Ilustres sobre la rampa de la Valle-Coche (OSM bridge, ida 15,58–15,67 / vuelta 18,73–18,81): parapeto blanco calado.
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
  quita: [[10.471731, -66.896122, 18], [10.481950, -66.895576, 8]],
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

  // ═════════ 4. Puente de Los Ilustres sobre la rampa de la Valle-Coche: parapeto blanco calado ═════════
  { const calado = tex(256, 64, (k, w, h) => { k.fillStyle = '#ecebe6'; k.fillRect(0, 0, w, h); k.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 8; i++) k.fillRect(i * 32 + 7, 14, 18, 30); }, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ map: calado, transparent: true, alphaTest: .5, side: THREE.DoubleSide, roughness: .8 }), tapa = api.concrete(0xefeee9);
    const parapeto = (km0, km1, d) => { for (let km = km0; km < km1 - 1e-6; km += .01) { const a = lado(km, d), b = lado(Math.min(km1, km + .01), d), L = Math.hypot(b.x - a.x, b.z - a.z);
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(L + .05, 1.0), mat.clone()); pl.material.map = calado.clone(); pl.material.map.needsUpdate = true; pl.material.map.repeat.set(L / 8, 1);
        pl.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + .7, (a.z + b.z) / 2); pl.rotation.y = Math.atan2(-(b.z - a.z), b.x - a.x); g.add(pl);
        add(new THREE.BoxGeometry(L + .05, .16, .32), tapa, pl.position.x, pl.position.y + .58, pl.position.z).rotation.y = pl.rotation.y; } };
    parapeto(15.575, 15.675, -9.6); parapeto(15.575, 15.675, 7.3);      // ida: borde exterior y borde de la isla
    parapeto(18.725, 18.815, -7.6);                                      // vuelta: borde exterior (f_0189)
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

  if (arboles.length) plantaArboles();
  return api.sombras(g);
}
