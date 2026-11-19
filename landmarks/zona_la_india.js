// Zona la_india (km 6,2–8,5): lo singular que el video muestra y las huellas genéricas no dan.
// - Pasarela de acero rojo óxido sobre la avenida de Bella Vista (OSM 997226844, km 7,20; video s 183–184), escaleras en ambos extremos.
// - Pasarela de O'Higgins antes del cruce con la 2.ª Avenida (km 8,02; video s 196–199): viga de celosía roja, escalera a la derecha.
// - Bomba PDV a la izquierda (km 6,88; f_0071) y bomba con locales rojos de Gama antes de la redoma (km 8,13; s 205–206).
// - C.C. Galerías El Paraíso: tambor gris oscuro con letras amarillas detrás de la redoma (s 206–208).
// - Residencias Galerías Paraíso: dos torres gris-beige de ~25 pisos detrás de Galerías (s 204–208).
// - Puente Los Leones (km 7,27–7,43) sobre la Autopista Francisco Fajardo y el Guaire: tablero, contraflujo, guardarriel, luminarias, pilas, leones.
// El monumento está en landmarks/la_india.js.
export const meta = {
  id: 'zona_la_india', nombre: 'Zona la_india',
  quita: [[10.474912, -66.945345, 28], [10.474450, -66.945432, 22]],
};

export function build(THREE, api) {
  const g = new THREE.Group();
  // api.ground ya devuelve la Y del mundo dibujado (exageración vertical y relieve incluidos)
  const suelo = (x, z) => api.ground(x, z);
  const add = (geo, mat, x, y, z, p = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };
  // grupo alineado con la ruta en un km: +Z local = sentido de carrera, +X local = izquierda del corredor
  const enRuta = (km, lado = 0, dy = 0) => { const r = api.routeAt(km), x = r.x + r.lx * lado, z = r.z + r.lz * lado, G = new THREE.Group();
    G.position.set(x, suelo(x, z) + dy, z); G.rotation.y = Math.atan2(r.tx, r.tz) + Math.PI; g.add(G); return G; };
  // ojo: con rotation.y = atan2(tx,tz)+π, +Z local apunta hacia ATRÁS y +X local hacia la DERECHA; se usa (-x, -z) abajo
  const enLL = (lat, lon) => { const p = api.xz(lat, lon); return { x: p.x, z: p.z, y: suelo(p.x, p.z) }; };

  // ───────── Pasarelas peatonales de acero rojo óxido ─────────
  const oxido = api.concrete(0x93432f, { roughness: .7 }), oxidoOsc = api.concrete(0x6e3324, { roughness: .75 }), gris = api.concrete(0x9a9892);
  const pasarela = (km, izq, der, escIzq, escDer, celosia) => {
    const P = enRuta(km); const H = 5.6, L = izq + der, cxL = -(izq - der) / 2;   // en local: x negativo = izquierda del corredor
    const viga = add(new THREE.BoxGeometry(L, celosia ? .45 : 1.35, 2.2), oxido, cxL, H + (celosia ? 0 : -.45), 0, P);
    add(new THREE.BoxGeometry(L, .12, 2.3), oxidoOsc, cxL, H + .3, 0, P);
    // baranda: pasamanos + balaustres (celosía de barrotes)
    for (const sz of [1, -1]) { add(new THREE.BoxGeometry(L, .08, .08), oxido, cxL, H + 1.45, sz * 1.05, P); add(new THREE.BoxGeometry(L, .06, .06), oxido, cxL, H + .85, sz * 1.05, P);
      const n = Math.floor(L / .6), bar = new THREE.InstancedMesh(new THREE.BoxGeometry(.05, 1.15, .05), oxido, n), m = new THREE.Matrix4();
      for (let i = 0; i < n; i++) { m.makeTranslation(cxL - L / 2 + (i + .5) * L / n, H + .9, sz * 1.05); bar.setMatrixAt(i, m); } P.add(bar);
      if (celosia) { const k = Math.floor(L / 2.2), dg = new THREE.InstancedMesh(new THREE.BoxGeometry(.09, 1.5, .09), oxido, k), q = new THREE.Object3D();
        for (let i = 0; i < k; i++) { q.position.set(cxL - L / 2 + (i + .5) * L / k, H - .5, sz * 1.1); q.rotation.set(0, 0, i % 2 ? .75 : -.75); q.updateMatrix(); dg.setMatrixAt(i, q.matrix); } P.add(dg);
        add(new THREE.BoxGeometry(L, .14, .14), oxido, cxL, H - 1.2, sz * 1.1, P); } }
    // columnas en los extremos y en el separador
    for (const x of [-izq + .4, der - .4, 0]) if (x !== 0 || !celosia) add(new THREE.BoxGeometry(.45, H, .45), x === 0 ? gris : oxido, x === 0 ? -9 : x, H / 2, 0, P);
    // escaleras: dos tramos con descanso, paralelas a la vía, subiendo hacia la pasarela desde atrás (lado de donde viene la carrera)
    const escalera = (x) => { const tramo = (y0, y1, z0, z1) => { const len = Math.hypot(y1 - y0, z1 - z0), m = add(new THREE.BoxGeometry(1.5, .25, len), oxido, x, (y0 + y1) / 2, (z0 + z1) / 2, P); m.rotation.x = Math.atan2(y1 - y0, z1 - z0);
        const st = Math.floor(len / .32), ins = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, .06, .3), oxidoOsc, st), q = new THREE.Object3D();
        for (let i = 0; i < st; i++) { const t = (i + .5) / st; q.position.set(x, y0 + (y1 - y0) * t + .14, z0 + (z1 - z0) * t); q.rotation.set(0, 0, 0); q.updateMatrix(); ins.setMatrixAt(i, q.matrix); } P.add(ins);
        for (const s of [-.75, .75]) { const r = add(new THREE.BoxGeometry(.05, .05, len), oxido, x + s, (y0 + y1) / 2 + 1, (z0 + z1) / 2, P); r.rotation.x = m.rotation.x;
          const pb = new THREE.InstancedMesh(new THREE.BoxGeometry(.04, 1, .04), oxido, 8), q2 = new THREE.Object3D(); for (let i = 0; i < 8; i++) { const t = (i + .5) / 8; q2.position.set(x + s, y0 + (y1 - y0) * t + .5, z0 + (z1 - z0) * t); q2.updateMatrix(); pb.setMatrixAt(i, q2.matrix); } P.add(pb); } };
      // +Z local = atrás: el pie de la escalera queda antes de la pasarela, mirando a quien llega
      tramo(H, H / 2, 1.4, 8.8); add(new THREE.BoxGeometry(1.6, .25, 1.8), oxido, x, H / 2, 9.6, P); tramo(H / 2, 0, 10.4, 17.8);
      for (const z of [8.8, 10.4]) add(new THREE.BoxGeometry(.2, H / 2, .2), oxido, x, H / 4, z, P); };
    if (escIzq) escalera(-izq + .9); if (escDer) escalera(der - .9);
  };
  pasarela(7.20, 25, 10.5, true, true, false);
  pasarela(8.02, 22, 11.5, false, true, true);

  // ───────── Bombas de gasolina ─────────
  const bomba = (P, ancho, fondo, franja, letrero, rotulo) => {
    const H = 5.2; add(new THREE.BoxGeometry(ancho, .35, fondo), api.concrete(0xf1f0ec), 0, H, 0, P);
    const fas = api.canvasTex(512, 64, (c, w, h) => { c.fillStyle = franja; c.fillRect(0, 0, w, h); c.fillStyle = letrero; c.fillRect(0, h * .72, w, h * .28); if (rotulo) { c.fillStyle = '#ffd21f'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.fillText(rotulo, w / 2, h * .62); } });
    const fm = new THREE.MeshStandardMaterial({ map: fas, roughness: .6 });
    for (const sz of [1, -1]) { add(new THREE.BoxGeometry(ancho + .3, 1.1, .15), fm, 0, H + .55, sz * (fondo / 2 + .08), P); add(new THREE.BoxGeometry(.15, 1.1, fondo + .3), fm, sz * (ancho / 2 + .08), H + .55, 0, P); }
    const col = api.concrete(0xc0302a); for (const x of [-ancho / 3, ancho / 3]) for (const z of [-fondo / 4, fondo / 4]) add(new THREE.BoxGeometry(.5, H, .5), col, x, H / 2, z, P);
    const isla = api.concrete(0xd8d4ca), surt = api.concrete(0xd9d9d6); for (const x of [-ancho / 3, ancho / 3]) { add(new THREE.BoxGeometry(1.2, .25, fondo * .7), isla, x, .12, 0, P); for (const z of [-fondo / 6, fondo / 6]) add(new THREE.BoxGeometry(.7, 1.7, .5), surt, x, 1.1, z, P); }
    add(new THREE.BoxGeometry(ancho + 4, .06, fondo + 4), api.concrete(0x7e7c78), 0, .03, 0, P);
  };
  { const P = enRuta(6.885, 14.5); bomba(P, 15, 11, '#d52b1e', '#f2b705', 'PDV'); }
  { // bomba y letreros rojos de Gama antes de la redoma (izquierda, detrás de la calzada contraria)
    const p = enLL(10.475905, -66.946150), P = new THREE.Group(); P.position.set(p.x, p.y, p.z); const r = api.routeAt(8.12); P.rotation.y = Math.atan2(r.tx, r.tz); g.add(P);
    bomba(P, 12, 16, '#e1251b', '#ffffff', '');
    const cartel = (x, z, h, txt) => { const t = api.canvasTex(64, 256, (c, w, hh) => { c.fillStyle = '#d6201c'; c.fillRect(0, 0, w, hh); c.fillStyle = '#fff'; c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.save(); c.translate(w / 2, hh / 2); c.rotate(-Math.PI / 2); c.fillText(txt, 0, 8); c.restore(); });
      const m = new THREE.MeshStandardMaterial({ map: t, roughness: .6 }); add(new THREE.BoxGeometry(1.8, h, .5), m, x, h / 2, z, P); };
    cartel(-8.5, 9, 8, 'OFERTAS'); cartel(-5, 10, 4.5, '24 HORAS');
  }

  // ───────── C.C. Galerías El Paraíso ─────────
  { const c = enLL(10.474912, -66.945345), mon = api.routeAt(8.258), mx = mon.x + mon.lx * 17, mz = mon.z + mon.lz * 17;
    const th = Math.atan2(mx - c.x, mz - c.z);   // ángulo (convención de CylinderGeometry) hacia la redoma
    const G = new THREE.Group(); G.position.set(c.x, c.y, c.z); g.add(G);
    const R = 24, Hd = 17, fx = Math.sin(th), fz = Math.cos(th), dx = fx * 7, dz = fz * 7;   // el tambor se adelanta hacia la redoma
    const oscuro = api.concrete(0x55595c), oscuro2 = api.concrete(0x45494c);
    add(new THREE.CylinderGeometry(R, R, Hd, 48), oscuro, dx, Hd / 2, dz, G);
    add(new THREE.CylinderGeometry(R + .6, R + .6, .7, 48), api.concrete(0x6c7073), dx, Hd + .35, dz, G);
    // caja de atrás, más alta
    const caja = add(new THREE.BoxGeometry(46, 21, 40), oscuro2, -fx * 12, 10.5, -fz * 12, G); caja.rotation.y = th;
    // banda de letras amarillas arriba del tambor y franja de ventanas
    const T0 = th - .85, TL = 1.7;
    const letras = api.canvasTex(2048, 128, (k, w, h) => { k.fillStyle = '#3d4043'; k.fillRect(0, 0, w, h); k.fillStyle = '#e8c52e'; k.font = 'bold 84px sans-serif'; k.textAlign = 'center'; k.fillText('C.C. GALERÍAS EL PARAÍSO', w * .55, h * .72);
      k.fillStyle = '#7cc242'; k.beginPath(); k.arc(w * .2, h * .5, 34, 0, 7); k.fill(); });
    const band = (y, h, mat, rr = R + .08) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, h, 40, 1, true, T0, TL), mat); m.position.set(dx, y, dz); G.add(m); return m; };
    band(14.6, 2.6, new THREE.MeshStandardMaterial({ map: letras, roughness: .6 }), R + .12);
    const vent = api.canvasTex(1024, 64, (k, w, h) => { k.fillStyle = '#2e3a44'; k.fillRect(0, 0, w, h); k.fillStyle = '#7f97a8'; for (let i = 0; i < 40; i++) k.fillRect(i * w / 40 + 2, 6, w / 40 - 4, h - 12); });
    band(9.2, 1.8, new THREE.MeshStandardMaterial({ map: vent, roughness: .3, metalness: .3 }));
    const pb = api.canvasTex(1024, 64, (k, w, h) => { k.fillStyle = '#9fb3bf'; k.fillRect(0, 0, w, h); k.fillStyle = '#5d6a72'; for (let i = 0; i < 30; i++) k.fillRect(i * w / 30, 0, 3, h); k.fillStyle = '#c0392b'; k.fillRect(w * .3, 0, w * .05, h * .4); k.fillStyle = '#2f7fc1'; k.fillRect(w * .62, 0, w * .12, h * .35); });
    band(2.2, 4.2, new THREE.MeshStandardMaterial({ map: pb, roughness: .3 }), R + .1);
    // panel de retícula blanca a la izquierda del tambor
    const ret = api.canvasTex(128, 256, (k, w, h) => { k.fillStyle = '#d9dcdd'; k.fillRect(0, 0, w, h); k.fillStyle = '#8b9196'; for (let i = 0; i < 16; i++) k.fillRect(0, i * h / 16, w, 3); for (let j = 0; j < 8; j++) k.fillRect(j * w / 8, 0, 3, h); });
    const tp = th - 1.15, pnl = add(new THREE.PlaneGeometry(9, 16), new THREE.MeshStandardMaterial({ map: ret, roughness: .5 }), dx + Math.sin(tp) * (R + .3), 9, dz + Math.cos(tp) * (R + .3), G); pnl.rotation.y = tp;
    // letrero vertical rojo y el de Locatel
    const rojo = api.concrete(0xc8241f); const lx = dx + Math.sin(th - .35) * (R + 1.2), lz = dz + Math.cos(th - .35) * (R + 1.2); add(new THREE.BoxGeometry(1.2, 6, .4), rojo, lx, 5, lz, G).rotation.y = th - .35;
    const loc = api.canvasTex(256, 64, (k, w, h) => { k.fillStyle = '#ffffff'; k.fillRect(0, 0, w, h); k.fillStyle = '#1b7b3a'; k.font = 'bold 40px sans-serif'; k.fillText('Locatel', 40, 46); });
    const lt = th + .55, lm = add(new THREE.PlaneGeometry(7, 1.8), new THREE.MeshStandardMaterial({ map: loc }), dx + Math.sin(lt) * (R + .25), 11.2, dz + Math.cos(lt) * (R + .25), G); lm.rotation.y = lt;
    // de noche
    const glow = api.glow(0xe8c52e, { dia: .15, noche: 1.6 }); band(14.6, .25, glow, R + .2);
  }

  // ───────── Residencias Galerías Paraíso: dos torres gris-beige de ~25 pisos ─────────
  { const c = enLL(10.474450, -66.945432), r = api.routeAt(8.12), ax = -r.tz, az = r.tx;   // eje perpendicular a la mirada desde O'Higgins
    const torre = (off, w, d, h, seed) => { const f = api.facade({ pared: '#a89e8c', vidrio: '#3f454b', pisos: Math.round(h / 3.1), vanos: 8, marco: .42, seed });
      const fb = api.facade({ pared: '#9d9381', vidrio: '#3f454b', pisos: Math.round(h / 3.1), vanos: 6, marco: .5, seed: seed + 3 });
      const m = add(new THREE.BoxGeometry(w, h, d), [fb, fb, api.concrete(0xa9a08f), api.concrete(0xa9a08f), f, f], c.x + ax * off, c.y + h / 2, c.z + az * off); m.rotation.y = Math.atan2(r.tx, r.tz);
      // franjas verticales oscuras (cajas de escalera) y remate
      for (const s of [-1, 1]) { const b = add(new THREE.BoxGeometry(2.2, h + 2, 1.2), api.concrete(0x8e877a), 0, 0, 0); b.position.set(c.x + ax * (off + s * w * .22) - r.tx * (d / 2 + .5), c.y + h / 2 + 1, c.z + az * (off + s * w * .22) - r.tz * (d / 2 + .5)); b.rotation.y = m.rotation.y; }
      const t = add(new THREE.BoxGeometry(w * .4, 4, d * .5), api.concrete(0xb0a796), c.x + ax * off, c.y + h + 2, c.z + az * off); t.rotation.y = m.rotation.y; };
    torre(-13, 22, 19, 80, 21); torre(12, 20, 19, 76, 37);
  }
  // ───────── Puente Los Leones (km 7,27–7,43) sobre la Autopista Francisco Fajardo y el Guaire ─────────
  // Vano: 7,318–7,410 (el terreno lo baja fx/correcciones/la_india.js, dh −7). Abajo, a lo largo de la ruta: calzada de 4 canales (7,330–7,348),
  // canal del Guaire (7,356–7,370) y calzada de 3 canales (7,378–7,396). Sección (lat: + izquierda): calzada de la ruta ±6,8 (motor), acera der.
  // hasta −8,9 con guardarriel en −8,5; guardarriel izq. en +7,5; tablero de contraflujo +8,3…+15,4 (canal de 4,9 m y acera) con guardarriel
  // interior y baranda tubular blanca. Leones (Ángel Cabré i Magriñà, 1933; piedra artificial): los dos del extremo norte están en el video
  // (s 185); los dos del extremo sur no se ven en el video y van por las fuentes («cuatro leones flanquean el puente»).
  {
    const KT0 = 7.318, KT1 = 7.410, DHT = -7, KB0 = 7.268, KB1 = 7.432;
    const RA = k => api.routeAt(k), EXv = api.EX || 1;
    const lado = (p, l) => ({ x: p.x + p.lx * l, z: p.z + p.lz * l });
    const fondoK = k => { const p = RA(k); let y = Infinity; for (const l of [-16, -24, 22, 30]) { const q = lado(p, l); y = Math.min(y, api.ground(q.x, q.z)); } return Math.min(y, p.y + DHT * EXv * .9); };
    // tira de doble cara (las dos caras frontales: la oclusión ambiental descarta las traseras)
    const tira = (filas, mat) => { const pos = [], uv = []; let u = 0;
      for (let i = 0; i < filas.length - 1; i++) { const A = filas[i], B = filas[i + 1]; const du = Math.hypot(B[0][0] - A[0][0], B[0][2] - A[0][2]);
        for (let j = 0; j < A.length - 1; j++) { const a = A[j], b = B[j], c = A[j + 1], d = B[j + 1], v0 = j, v1 = j + 1;
          pos.push(...a, ...b, ...c, ...c, ...b, ...d, ...a, ...c, ...b, ...c, ...d, ...b); uv.push(u, v0, u + du, v0, u, v1, u, v1, u + du, v0, u + du, v1, u, v0, u, v1, u + du, v0, u, v1, u + du, v1, u + du, v0); }
        u += du; }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, mat); g.add(m); return m; };
    // a lo largo de la ruta: sección = lista de [lat, dy] (dy sobre la calzada, o función)
    const largo = (k0, k1, sec, mat, paso = .004) => { const F = []; for (let k = k0; k <= k1 + 1e-6; k += paso) { const p = RA(Math.min(k, k1)); F.push(sec.map(([l, dy]) => { const q = lado(p, l); return [q.x, typeof dy === 'function' ? dy(p, q, k) : p.y + dy, q.z]; })); } return tira(F, mat); };
    // a lo ancho (perpendicular a la ruta), pegada al suelo: franja de k0 a k1 entre lat l0 y l1
    const ancho = (k0, k1, l0, l1, dy, mat, nl = 8) => { const F = []; for (let i = 0; i <= nl; i++) { const l = l0 + (l1 - l0) * i / nl; F.push([k0, k1].map(k => { const q = lado(RA(k), l); return [q.x, api.ground(q.x, q.z) + dy, q.z]; })); } return tira(F, mat); };

    const conc = api.concrete(0xb3afa6), concOsc = api.concrete(0x6f6d68), sombra = api.concrete(0x3b3c3e), asfalto = api.concrete(0x4e4f52, { roughness: .95 });
    const acera = api.concrete(0xb9b4a8), amarillo = api.concrete(0xe3b51f, { roughness: .6, metalness: .2 }), paral = api.concrete(0x5e6064, { metalness: .3, roughness: .6 });
    const blanco = api.concrete(0xe4e4df, { metalness: .2, roughness: .5 }), agua = new THREE.MeshStandardMaterial({ color: 0x4f5338, roughness: .3, metalness: .15 });
    const ESP = 1.8;

    // ── tablero de contraflujo (izquierda) y remate de acera derecha
    largo(KB0, KB1, [[8.3, .08], [13.2, .08]], asfalto);
    largo(KB0, KB1, [[13.2, .22], [15.4, .22]], acera);
    largo(KB0, KB1, [[8.3, .22], [8.9, .22]], acera);
    largo(KB0 + .02, KB1, [[-8.1, .17], [-8.95, .17]], acera);
    // raya del canal de contraflujo
    largo(KB0, KB1, [[13.05, .1], [13.15, .1]], api.concrete(0xdcdcd6));
    // losa: cantos, cara inferior, vigas (solo en el vano y sus apoyos)
    const v0 = KT0 - .006, v1 = KT1 + .006;
    largo(v0, v1, [[-8.95, .2], [-8.95, -ESP]], conc);
    largo(v0, v1, [[15.45, .25], [15.45, -ESP]], conc);
    largo(v0, v1, [[-8.95, -ESP], [15.45, -ESP]], concOsc);
    for (const l of [-6.5, -2, 2.5, 7, 11, 14.5]) largo(v0, v1, [[l - .3, -ESP], [l - .3, -ESP - 1.2], [l + .3, -ESP - 1.2], [l + .3, -ESP]], concOsc);
    // debajo del tablero el terreno sigue a la cota de la vía (terraplén): se tapa con un paño en sombra a cada lado
    largo(KT0, KT1, [[-8.9, -ESP - 1.2], [-8.9, (p, q, k) => fondoK(k) - .3]], sombra);
    largo(KT0, KT1, [[15.4, -ESP - 1.2], [15.4, (p, q, k) => fondoK(k) - .3]], sombra);
    // estribos en los dos extremos del vano
    for (const [k, s] of [[KT0 + .001, 1], [KT1 - .001, -1]]) { const p = RA(k), yb = fondoK(k) - .5, F = [];
      for (const l of [-14, -8.9, 15.4, 21]) { const q = lado(p, l); F.push([[q.x, yb, q.z], [q.x, p.y - .2, q.z]]); }
      tira(F, conc); }
    // pilas: viga cabezal + tres columnas entre la autopista y el canal
    const colG = new THREE.CylinderGeometry(.6, .6, 1, 14);
    for (const k of [7.352, 7.374]) { const p = RA(k), yb = fondoK(k), r = Math.atan2(p.tx, p.tz), c = lado(p, 3.25);
      const viga = new THREE.Mesh(new THREE.BoxGeometry(24.6, 1.1, 1.6), conc); viga.position.set(c.x, p.y - ESP - 1.2 - .55, c.z); viga.rotation.y = r + Math.PI / 2; g.add(viga);
      for (const l of [-6.5, 3, 12]) { const q = lado(p, l), h = p.y - ESP - 2.3 - yb; if (h < .5) continue; const m = new THREE.Mesh(colG, conc); m.position.set(q.x, yb + h / 2, q.z); m.scale.y = h; g.add(m); } }

    // ── la autopista y el Guaire, abajo (a ambos lados del terraplén)
    const rayas = api.canvasTex(64, 256, (c, w, h) => { c.fillStyle = '#4b4c4f'; c.fillRect(0, 0, w, h); c.fillStyle = '#dcdcd4'; for (let y = 0; y < h; y += 64) c.fillRect(w / 2 - 2, y, 4, 34); c.fillStyle = '#e2b62a'; c.fillRect(0, 0, 3, h); c.fillStyle = '#e4e4de'; c.fillRect(w - 3, 0, 3, h); });
    rayas.wrapS = rayas.wrapT = THREE.RepeatWrapping; const pista = new THREE.MeshStandardMaterial({ map: rayas, roughness: .9 });
    for (const [l0, l1] of [[-13, -46], [19.5, 46]]) {
      ancho(7.330, 7.348, l0, l1, .06, pista); ancho(7.378, 7.396, l0, l1, .06, pista);
      ancho(7.3575, 7.3685, l0, l1, .08, agua);
      for (const k of [7.3565, 7.3695]) ancho(k - .0005, k + .0005, l0, l1, 1.2, conc, 6);   // muros del canal
      ancho(7.3485, 7.3555, l0, l1, .12, api.concrete(0x8e8a7c), 6); ancho(7.3705, 7.3775, l0, l1, .12, api.concrete(0x8e8a7c), 6);   // bermas
    }

    // ── guardarriel amarillo de doble onda sobre parales (y baranda tubular blanca del tablero de contraflujo)
    const onda = (k0, k1, l, s) => { largo(k0, k1, [[l + s * .06, .5], [l - s * .02, .6], [l + s * .06, .68], [l - s * .02, .78], [l + s * .06, .86]], amarillo);
      const n = Math.floor((k1 - k0) * 1000 / 2), im = new THREE.InstancedMesh(new THREE.BoxGeometry(.15, .9, .12), paral, n), q = new THREE.Object3D();
      for (let i = 0; i < n; i++) { const p = RA(k0 + (i + .5) * (k1 - k0) / n), v = lado(p, l - s * .12); q.position.set(v.x, p.y + .45, v.z); q.rotation.set(0, Math.atan2(p.tx, p.tz), 0); q.updateMatrix(); im.setMatrixAt(i, q.matrix); }
      g.add(im); };
    onda(7.300, KB1, -8.5, 1); onda(7.280, KB1, 7.5, -1); onda(7.280, KB1, 8.6, 1);
    largo(7.300, KB1, [[15.15, 1.05], [15.15, 1.12]], blanco); largo(7.300, KB1, [[15.15, .55], [15.15, .6]], blanco);
    { const n = Math.floor((KB1 - 7.3) * 1000 / 2.4), im = new THREE.InstancedMesh(new THREE.BoxGeometry(.06, 1.1, .06), blanco, n), q = new THREE.Object3D();
      for (let i = 0; i < n; i++) { const p = RA(7.3 + (i + .5) * (KB1 - 7.3) / n), v = lado(p, 15.15); q.position.set(v.x, p.y + .77, v.z); q.updateMatrix(); im.setMatrixAt(i, q.matrix); } g.add(im); }

    // ── luminarias de un brazo (der. sobre la acera; las del contraflujo en su borde exterior)
    const poste = new THREE.CylinderGeometry(.09, .14, 10, 8), brazo = new THREE.BoxGeometry(.1, .1, 2.6), cab = new THREE.BoxGeometry(.38, .16, .75);
    const gris = api.concrete(0x8c9094, { metalness: .4, roughness: .5 }), luz = api.glow(0xfff0c8, { dia: .05, noche: 2.2 });
    for (const [k, l, s] of [[7.305, -8.8, 1], [7.345, -8.8, 1], [7.385, -8.8, 1], [7.425, -8.8, 1], [7.325, 15.25, -1], [7.365, 15.25, -1], [7.405, 15.25, -1]]) {
      const p = RA(k), G = new THREE.Group(), v = lado(p, l); G.position.set(v.x, p.y + .2, v.z); G.rotation.y = Math.atan2(p.tx, p.tz); g.add(G);
      add(poste, gris, 0, 5, 0, G); const b = add(brazo, gris, s * 1.2, 9.9, 0, G); b.rotation.y = Math.PI / 2; b.rotation.z = s * .12; add(cab, luz, s * 2.4, 10.05, 0, G).rotation.y = Math.PI / 2; }

    // ── los cuatro leones sobre sus pedestales
    const piedra = api.concrete(0xa49c8c, { roughness: .95 }), ped = api.concrete(0x97948c);
    const grafiti = api.canvasTex(256, 96, (c, w, h) => { c.fillStyle = '#aaa79e'; c.fillRect(0, 0, w, h); c.lineWidth = 3;
      for (let i = 0; i < 14; i++) { c.strokeStyle = ['#3a3a40', '#5b4a7a', '#7a3b2a', '#2b5b8a', '#6a6a66'][i % 5]; c.beginPath(); let x = Math.random() * w, y = h * (.35 + Math.random() * .5); c.moveTo(x, y);
        for (let j = 0; j < 5; j++) { x += 6 + Math.random() * 14; y += (Math.random() - .5) * 22; c.lineTo(x, y); } c.stroke(); }
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, h - 10, w, 10); });
    const pedM = new THREE.MeshStandardMaterial({ map: grafiti, roughness: .9 });
    const esf = new THREE.SphereGeometry(1, 14, 10), cil = new THREE.CylinderGeometry(1, 1, 1, 10), cubo = new THREE.BoxGeometry(1, 1, 1);
    const pieza = (P, geo, mat, x, y, z, sx, sy, sz, rx = 0) => { const m = add(geo, mat, x, y, z, P); m.scale.set(sx, sy, sz); m.rotation.x = rx; return m; };
    const leon = (k, l, mira) => { const p = RA(k), v = lado(p, l), G = new THREE.Group(); G.position.set(v.x, Math.max(p.y, api.ground(v.x, v.z)), v.z); G.rotation.y = Math.atan2(p.tx, p.tz) + (mira < 0 ? Math.PI : 0); g.add(G);
      // pedestal: zócalo, dado con grafitis y cornisa
      pieza(G, cubo, ped, 0, .12, 0, 2.0, .24, 3.8); pieza(G, cubo, pedM, 0, .78, 0, 1.7, 1.1, 3.4); pieza(G, cubo, ped, 0, 1.4, 0, 1.95, .16, 3.7);
      // león sentado, de pose casi egipcia, mirando hacia +Z del grupo
      const L = new THREE.Group(); L.position.set(0, 1.48, -.1); L.scale.setScalar(1.15); G.add(L);
      pieza(L, cubo, piedra, 0, .06, .1, 1.1, .12, 2.5);
      pieza(L, esf, piedra, 0, .6, -.4, .55, .52, .75); pieza(L, esf, piedra, 0, 1.0, .3, .5, .66, .5, -.35);
      pieza(L, esf, piedra, 0, 1.45, .5, .56, .6, .48); pieza(L, esf, piedra, 0, 1.58, .78, .3, .32, .3);
      pieza(L, cubo, piedra, 0, 1.5, 1.02, .26, .22, .28); pieza(L, esf, piedra, 0, 1.86, .62, .34, .16, .26);
      for (const s of [-1, 1]) { pieza(L, cil, piedra, s * .22, .55, .72, .12, .95, .12); pieza(L, cubo, piedra, s * .22, .1, .86, .25, .14, .38);
        pieza(L, esf, piedra, s * .4, .3, -.25, .22, .3, .55); pieza(L, esf, piedra, s * .16, 1.75, .66, .08, .1, .08); }
      pieza(L, cil, piedra, .45, .2, -1.0, .05, .9, .05, 1.3); };
    leon(7.262, -10.4, -1); leon(7.262, 9.9, -1);      // extremo norte (video s 185)
    leon(7.439, -10.4, 1); leon(7.439, 16.8, 1);       // extremo sur (por las fuentes; no visibles en el video)
  }

  return api.sombras(g);
}
