// Zona la_india (km 6,2–8,5): lo singular que el video muestra y las huellas genéricas no dan.
// - Pasarela de acero rojo óxido sobre la avenida de Bella Vista (OSM 997226844, km 7,20; video s 183–184), escaleras en ambos extremos.
// - Pasarela de O'Higgins antes del cruce con la 2.ª Avenida (km 8,02; video s 196–199): viga de celosía roja, escalera a la derecha.
// - Bomba PDV a la izquierda (km 6,88; f_0071) y bomba con locales rojos de Gama antes de la redoma (km 8,13; s 205–206).
// - C.C. Galerías El Paraíso: tambor gris oscuro con letras amarillas detrás de la redoma (s 206–208).
// - Residencias Galerías Paraíso: dos torres gris-beige de ~25 pisos detrás de Galerías (s 204–208).
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
  return api.sombras(g);
}
