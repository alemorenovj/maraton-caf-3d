// Zona centro (km 0–3,1): lo singular que el video muestra y las huellas genéricas no dan.
// - Puerta del Palacio de Justicia al final de la Av. Bolívar (f_0016–f_0017, s 37–40): las dos alas son huellas OSM; aquí van el
//   puente superior, el gran arco de celosía oscura, el arco de remate, los dos retratos gigantes y las bocas de los túneles.
// - Letrero rojo ASAMBLEA NACIONAL en la cara este del Edificio José María Vargas (f_0019–f_0021).
// - Baranda negra sobre murete con mural en la acera derecha de la Av. Bolívar (f_0009–f_0016).
// - Muros con murales a la izquierda de la Av. Este 6 (f_0019–f_0020: "Poder Ciudadano" y el rostro gigante).
// - Tótem del Metro El Silencio con la M roja y marquesina (f_0029).
// - Fuente de las Toninas en la Plaza O'Leary (f_0033).
export const meta = { id: 'zona_centro', nombre: 'Zona centro', quita: [] };

export function build(THREE, api) {
  const g = new THREE.Group();
  const add = (geo, mat, x, y, z, p = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };
  const P = (lat, lon) => { const p = api.xz(lat, lon); return { x: p.x, z: p.z, y: api.ground(p.x, p.z) }; };
  // grupo con +Z local = sentido de carrera y +X local = IZQUIERDA del corredor, en un km y a un desplazamiento lateral (+ izquierda)
  const enRuta = (km, lado = 0) => { const r = api.routeAt(km), x = r.x + r.lx * lado, z = r.z + r.lz * lado, G = new THREE.Group();
    G.position.set(x, api.ground(x, z), z); G.rotation.y = Math.atan2(r.tx, r.tz); g.add(G); return G; };
  // grupo con +X local de A hacia B (en planta) y +Z local saliendo hacia la derecha de AB; origen en A
  const enLinea = (A, B, y) => { const G = new THREE.Group(), dx = B.x - A.x, dz = B.z - A.z; G.position.set(A.x, y ?? A.y, A.z); G.rotation.y = -Math.atan2(dz, dx); g.add(G); return { G, L: Math.hypot(dx, dz) }; };
  const box = new THREE.BoxGeometry(1, 1, 1);
  const caja = (mat, x, y, z, sx, sy, sz, p) => { const m = add(box, mat, x, y, z, p); m.scale.set(sx, sy, sz); return m; };

  // ───────── Palacio de Justicia: puerta monumental sobre los túneles de la Av. Bolívar ─────────
  {
    // caras este de las dos alas (huellas OSM): ala norte (derecha del corredor) y ala sur (izquierda)
    const nA = P(10.502368, -66.912576), nB = P(10.502024, -66.912653), sA = P(10.501828, -66.912665), sB = P(10.501485, -66.912744);
    const { G, L } = enLinea(sB, nA, Math.min(nA.y, sB.y));   // +X: de sur a norte por la fachada; +Z: hacia el este (la Av. Bolívar)
    const xS = Math.hypot(sA.x - sB.x, sA.z - sB.z), xN = Math.hypot(nB.x - sB.x, nB.z - sB.z), xc = (xN + xS) / 2, gap = xN - xS;
    const beige = api.concrete(0xd3c4a2), beigeOsc = api.concrete(0xb9aa88), acero = api.concrete(0x3d4146, { roughness: .6, metalness: .4 }), gris = api.concrete(0x9a958b);
    const H = 32;   // altura de las alas en el juego (10 pisos)
    // puente superior entre las alas, con franja de ventanas
    const vent = api.facade({ pared: '#d3c4a2', vidrio: '#3c4651', pisos: 2, vanos: 8, marco: .35, seed: 11 });
    const puente = caja([beige, beige, beige, beige, vent, vent], xc, H - 4, -4, gap + 6, 8, 9, G);
    // pilastras salientes de las alas junto al vano (dan el ritmo vertical de la foto)
    for (const s of [-1, 1]) for (const k of [1, 2]) caja(beigeOsc, xc + s * (gap / 2 + k * 3.2), H / 2, .6, 1.4, H + .5, 1.2, G);
    // gran arco de celosía oscura bajo el puente
    const R = gap / 2 - .4;
    const arco = add(new THREE.TorusGeometry(R, .55, 8, 40, Math.PI), acero, xc, H - 8 - R, .3, G);
    const celos = api.canvasTex(256, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#2f3338'; c.lineWidth = 3; for (let i = 0; i <= 16; i++) { c.beginPath(); c.moveTo(i * w / 16, 0); c.lineTo(i * w / 16, h); c.stroke(); } for (let j = 0; j <= 8; j++) { c.beginPath(); c.moveTo(0, j * h / 8); c.lineTo(w, j * h / 8); c.stroke(); } });
    const mCel = new THREE.MeshStandardMaterial({ map: celos, transparent: true, alphaTest: .3, side: THREE.DoubleSide, roughness: .6 });
    const semi = new THREE.Mesh(new THREE.CircleGeometry(R, 32, 0, Math.PI), mCel); semi.position.set(xc, H - 8 - R, .2); G.add(semi);
    // dintel bajo el puente y arco de remate encima (armadura blanca)
    caja(acero, xc, H - 8.4, .4, gap, .9, 1, G);
    add(new THREE.TorusGeometry(7, .35, 6, 32, Math.PI), api.concrete(0xd9dcdc), xc, H, -4, G);
    const cup = new THREE.Mesh(new THREE.CircleGeometry(7, 32, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0xbcd0dc, roughness: .2, metalness: .5, transparent: true, opacity: .55, side: THREE.DoubleSide })); cup.position.set(xc, H, -4); G.add(cup);
    // retratos gigantes en las caras este (lona colgada): izquierda del corredor = ala sur, derecha = ala norte
    const retrato = (fondo, boina) => api.canvasTex(256, 384, (c, w, h) => {
      c.fillStyle = fondo; c.fillRect(0, 0, w, h);
      c.fillStyle = '#7a4a32'; c.beginPath(); c.ellipse(w * .5, h * .42, w * .26, h * .22, 0, 0, 7); c.fill();          // rostro
      c.fillStyle = '#2a1d17'; c.fillRect(w * .36, h * .38, w * .09, h * .025); c.fillRect(w * .55, h * .38, w * .09, h * .025); c.fillRect(w * .42, h * .52, w * .16, h * .018);
      if (boina) { c.fillStyle = '#c4161c'; c.beginPath(); c.ellipse(w * .5, h * .22, w * .3, h * .08, -.15, 0, 7); c.fill(); }
      else { c.fillStyle = '#2b2420'; c.beginPath(); c.ellipse(w * .5, h * .25, w * .3, h * .1, 0, Math.PI, 0); c.fill(); c.fillRect(w * .22, h * .25, w * .1, h * .3); c.fillRect(w * .68, h * .25, w * .1, h * .3); }
      c.fillStyle = '#3b3a3f'; c.fillRect(w * .15, h * .64, w * .7, h * .2);                                                  // hombros
      if (boina) { const f = ['#f7d117', '#1d3f9a', '#cf2027']; f.forEach((k, i) => { c.fillStyle = k; c.fillRect(0, h * (.84 + i * .053), w, h * .053); }); }
    });
    const lona = (tex, x) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(11, 16), new THREE.MeshStandardMaterial({ map: tex, roughness: .85 })); m.position.set(x, H - 11, .35); G.add(m); };
    lona(retrato('#d7cfc0', false), xN + (L - xN) / 2);      // ala norte (derecha del corredor)
    lona(retrato('#c9c2b4', true), xS / 2);                  // ala sur (izquierda)
    // bocas de los túneles de la Av. Bolívar al pie de la puerta, con el pedestal central
    const boca = api.concrete(0x14171a, { roughness: 1 });
    caja(gris, xc, 3.4, 3, gap + 26, 1.4, 1.6, G);
    for (const s of [-1, 1]) { caja(boca, xc + s * 8.5, 1.4, 3.05, 12, 2.8, 1.5, G); caja(gris, xc + s * 15.2, 1.4, 3, 1.4, 2.8, 1.6, G); }
    caja(api.concrete(0x8a5b45), xc, 1.6, 4.5, 3.2, 3.2, 3.2, G);   // pedestal de ladrillo
  }

  // ───────── Asamblea Nacional: banda roja con letras verticales en la cara este del Edificio José María Vargas ─────────
  {
    const A = P(10.503171, -66.914893), B = P(10.50337, -66.914846), yb = Math.min(A.y, B.y);
    const { G, L } = enLinea(A, B, yb);   // de sur a norte: +Z local hacia el este (afuera de la fachada)
    const HT = 96, letras = api.canvasTex(256, 1024, (c, w, h) => {
      c.fillStyle = '#b8231f'; c.fillRect(0, 0, w, h); c.fillStyle = '#f4f1ea'; c.font = 'bold 66px sans-serif'; c.textAlign = 'center';
      'ASAMBLEA'.split('').forEach((ch, i) => c.fillText(ch, w * .3, 110 + i * 92));
      'NACIONAL'.split('').forEach((ch, i) => c.fillText(ch, w * .72, 110 + i * 92));
      c.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 26; i++) c.fillRect(0, i * h / 26, w, 2);
    });
    const banda = new THREE.Mesh(new THREE.PlaneGeometry(L * .62, HT - 22), new THREE.MeshStandardMaterial({ map: letras, roughness: .8 }));
    banda.position.set(L * .36, 8 + (HT - 22) / 2, .4); G.add(banda);
    const rojo = api.concrete(0xb8231f); caja(rojo, L * .36, 8 + (HT - 22) / 2, -.2, L * .64, HT - 21, .9, G);
    caja(api.concrete(0xf0ece4), L / 2, HT - 7, -2, L + .6, 2, 4.6, G);   // remate blanco
  }

  // ───────── Baranda negra de la acera derecha de la Av. Bolívar ─────────
  {
    const negro = api.concrete(0x1d1f22, { roughness: .55, metalness: .5 });
    const mural = api.canvasTex(512, 32, (c, w, h) => { c.fillStyle = '#d9d6cf'; c.fillRect(0, 0, w, h); const k = ['#2d6fb5', '#5aa3d8', '#1d4f8f', '#e8e4dc']; for (let i = 0; i < 40; i++) { c.fillStyle = k[i % 4]; c.fillRect(i * w / 40, h * .2, w / 55, h * .7); } });
    mural.wrapS = THREE.RepeatWrapping;
    const tramo = (k0, k1, lado) => {
      const n = Math.round((k1 - k0) * 1000 / 2.5), post = new THREE.InstancedMesh(box, negro, n), bar = new THREE.InstancedMesh(box, negro, n * 2), q = new THREE.Object3D();
      const mm = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({ map: mural, roughness: .9 }), n);
      for (let i = 0; i < n; i++) { const r = api.routeAt(k0 + (k1 - k0) * (i + .5) / n), x = r.x + r.lx * lado, z = r.z + r.lz * lado, y = api.ground(x, z), rot = Math.atan2(r.tx, r.tz);
        q.rotation.set(0, rot, 0); q.position.set(x, y + .35, z); q.scale.set(.3, .7, 2.55); q.updateMatrix(); mm.setMatrixAt(i, q.matrix);
        q.position.set(x, y + 1.05, z); q.scale.set(.08, 1.4, .08); q.updateMatrix(); post.setMatrixAt(i, q.matrix);
        for (const [j, hy] of [[0, 1.72], [1, .95]]) { q.position.set(x, y + hy, z); q.scale.set(.06, .06, 2.55); q.updateMatrix(); bar.setMatrixAt(i * 2 + j, q.matrix); } }
      g.add(post, bar, mm);
      // balaustres verticales finos (instanciados): 8 por vano
      const nb = n * 8, bal = new THREE.InstancedMesh(box, negro, nb);
      for (let i = 0; i < nb; i++) { const r = api.routeAt(k0 + (k1 - k0) * (i + .5) / nb), x = r.x + r.lx * lado, z = r.z + r.lz * lado, y = api.ground(x, z);
        q.rotation.set(0, Math.atan2(r.tx, r.tz), 0); q.position.set(x, y + 1.32, z); q.scale.set(.025, .8, .025); q.updateMatrix(); bal.setMatrixAt(i, q.matrix); }
      g.add(bal);
    };
    tramo(0.53, 1.58, -8.2);
  }

  // ───────── Muros con mural a la izquierda de la Av. Este 6 (km 1,9–2,0) ─────────
  {
    const pinta = (txt, cara) => api.canvasTex(2048, 128, (c, w, h) => {
      c.fillStyle = '#ece6d8'; c.fillRect(0, 0, w, h);
      const k = ['#d32f2f', '#f2c230', '#1f4fa3'];
      k.forEach((q, i) => { c.fillStyle = q; c.fillRect(i * w * .012, 0, w * .012, h); });
      if (cara) { c.fillStyle = '#6b4632'; c.beginPath(); c.ellipse(w * .12, h * .58, w * .022, h * .36, 0, 0, 7); c.fill(); c.fillStyle = '#1e1a18'; c.beginPath(); c.ellipse(w * .12, h * .36, w * .028, h * .3, 0, Math.PI, 0); c.fill();
        c.fillStyle = '#e0c6a0'; c.fillRect(w * .15, h * .2, w * .1, h * .6); }
      c.fillStyle = '#2b2b2b'; c.font = 'italic 15px serif';
      for (let i = 0; i < 3; i++) c.fillText('“Para afirmar esta moral es indispensable un cuarto poder que cree a los hombres en la virtud…” Simón Bolívar 1819', w * .3, 30 + i * 18);
      c.font = 'bold 30px sans-serif'; c.fillStyle = '#c62828'; c.fillText(txt, w * .3, h - 16);
      for (let i = 0; i < 14; i++) { c.fillStyle = 'rgba(40,40,40,.75)'; c.fillRect(w * (.8 + i * .013), h * (.3 + (i % 3) * .05), w * .006, h * .6); }
    });
    const muro = (k0, k1, lado, h, tex) => { const a = api.routeAt(k0), b = api.routeAt(k1), A = { x: a.x + a.lx * lado, z: a.z + a.lz * lado }, B = { x: b.x + b.lx * lado, z: b.z + b.lz * lado };
      A.y = api.ground(A.x, A.z); B.y = api.ground(B.x, B.z); const { G, L } = enLinea(A, B, Math.min(A.y, B.y));
      const m = new THREE.MeshStandardMaterial({ map: tex, roughness: .9 }), base = api.concrete(0xd8d2c6);
      caja([base, base, base, base, base, base], L / 2, h / 2, 0, L, h, .35, G);
      for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(L, h - .3), m); p.position.set(L / 2, h / 2, s * .19); if (s < 0) p.rotation.y = Math.PI; G.add(p); }
      caja(api.concrete(0xb5432f), L / 2, h + .06, 0, L + .2, .14, .5, G);   // remate de teja roja
    };
    muro(1.905, 1.965, 9.5, 4.2, pinta('VENEZUELA', true));
    muro(1.97, 2.03, 9.5, 3.6, pinta('PODER CIUDADANO', false));
  }

  // ───────── Metro El Silencio: tótem con la M y marquesina (km 2,78, derecha) ─────────
  {
    const T = enRuta(2.772, -8.6);
    const m = api.canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#d8231e'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 104px sans-serif'; c.textAlign = 'center'; c.fillText('M', w / 2, h * .82); });
    const mm = api.glow(0xffffff, { dia: .15, noche: 1 }); mm.map = m; mm.emissiveMap = m; mm.needsUpdate = true;
    const negro = api.concrete(0x202225);
    caja(negro, 0, 2.6, 0, .9, 5.2, .9, T);
    caja([mm, mm, negro, negro, mm, mm], 0, 4.6, 0, 1.3, 1.3, 1.3, T);
    const vid = new THREE.MeshStandardMaterial({ color: 0xcfe3ea, roughness: .15, metalness: .3, transparent: true, opacity: .5 });
    caja(api.concrete(0xe8e8e4), -3, 3.4, 9, 6, .25, 14, T);                        // marquesina blanca de la parada
    for (const z of [3, 9, 15]) for (const x of [-5.6, -.4]) caja(api.concrete(0xcfcfcb), x, 1.7, z, .15, 3.4, .15, T);
    caja(vid, -5.7, 1.6, 9, .05, 2.4, 12, T);
  }

  // ───────── Fuente de las Toninas, Plaza O'Leary (km 3,06, izquierda) ─────────
  {
    const c = P(10.503555, -66.919531), F = new THREE.Group(); F.position.set(c.x, c.y, c.z); g.add(F);
    const piedra = api.concrete(0xd8cdb4), bronce = api.concrete(0x5b4a32, { roughness: .45, metalness: .6 });
    const agua = new THREE.MeshStandardMaterial({ color: 0x3d7f9b, roughness: .08, metalness: .4, transparent: true, opacity: .9 });
    add(new THREE.CylinderGeometry(9, 9.4, .7, 48, 1, true), piedra, 0, .35, 0, F);
    add(new THREE.TorusGeometry(9.2, .35, 6, 48), piedra, 0, .72, 0, F).rotation.x = Math.PI / 2;
    add(new THREE.CircleGeometry(9, 48), agua, 0, .45, 0, F).rotation.x = -Math.PI / 2;
    add(new THREE.CylinderGeometry(1.8, 2.4, 1.6, 20), piedra, 0, .8, 0, F);
    add(new THREE.CylinderGeometry(2.8, 2.8, .25, 24), piedra, 0, 1.7, 0, F);
    add(new THREE.CylinderGeometry(.7, 1, 2.4, 14), piedra, 0, 2.9, 0, F);
    // toninas (delfines) de bronce saltando en corona
    const cuerpo = new THREE.SphereGeometry(1, 12, 8); cuerpo.scale(.45, .45, 1.5);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, d = add(cuerpo, bronce, Math.cos(a) * 3.6, 1.6, Math.sin(a) * 3.6, F); d.rotation.set(-.9, -a + Math.PI / 2, 0);
      const cola = add(new THREE.ConeGeometry(.5, .9, 4), bronce, Math.cos(a) * 4.5, .9, Math.sin(a) * 4.5, F); cola.rotation.set(.5, -a, 0); }
    // chorros animados
    const jm = new THREE.MeshStandardMaterial({ color: 0xe8f4fa, transparent: true, opacity: .55, roughness: .1, emissive: 0x99bbcc, emissiveIntensity: .1 });
    const chorro = add(new THREE.CylinderGeometry(.12, .35, 4, 8, 1, true), jm, 0, 6, 0, F);
    const lat = []; for (let i = 0; i < 6; i++) { const a = (i + .5) / 6 * Math.PI * 2, j = add(new THREE.CylinderGeometry(.06, .16, 3, 6, 1, true), jm, Math.cos(a) * 5.5, 1.8, Math.sin(a) * 5.5, F); j.rotation.set(Math.sin(a) * .6, 0, -Math.cos(a) * .6); lat.push(j); }
    api.onFrame(st => { const k = 1 + .08 * Math.sin(st.t * 6); chorro.scale.y = k; for (const j of lat) j.scale.y = 1 + .1 * Math.sin(st.t * 5 + j.position.x); });
    // canteros de flores alrededor (f_0033: rojo y amarillo)
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, b = add(new THREE.BoxGeometry(5, .5, 1.6), api.concrete(i % 2 ? 0xc0392b : 0xe5b72a, { roughness: 1 }), Math.cos(a) * 13, .25, Math.sin(a) * 13, F); b.rotation.y = -a + Math.PI / 2; }
  }

  // ───────── Bloques de El Silencio: fachada de balcones sobre la arcada ─────────
  // Entre el km 2,5 y 3,5 el generador fuerza un arquetipo "viejo" con arcada y muro ciego (manda sobre la `a` de la corrección).
  // Aquí se le pone encima, en las caras que miran a la ruta, la fachada real: 4 pisos blancos con ventanas y balcones.
  {
    const E = api.D.edif || [], G0 = api.D.meta.geo;
    const bloques = [[10.503737, -66.918588, 5], [10.504643, -66.919349, 5], [10.503649, -66.920357, 5], [10.502443, -66.920033, 5],
      [10.504238, -66.918967, 6], [10.504121, -66.918378, 4], [10.504105, -66.918548, 4], [10.504187, -66.918496, 3], [10.504158, -66.917807, 4], [10.505082, -66.919550, 2]];
    const fach = api.facade({ pared: '#f1efe9', vidrio: '#56606a', pisos: 4, vanos: 4, marco: .5, seed: 23 });
    const balc = api.concrete(0xf4f2ec), rejas = api.concrete(0x3a3d40, { roughness: .6 });
    const ruta = []; for (let k = 2.45; k <= 3.25; k += .01) ruta.push(api.routeAt(k));
    const dRuta = (x, z) => { let m = 1e9; for (const r of ruta) m = Math.min(m, Math.hypot(r.x - x, r.z - z)); return m; };
    for (const [la, lo, pisos] of bloques) {
      const c = api.xz(la, lo); let best = null, bd = 1e9;
      for (const e of E) { const f = e[2], n = f.length / 2; let cx = 0, cz = 0; for (let i = 0; i < n; i++) { cx += f[i * 2]; cz += f[i * 2 + 1]; } cx /= n; cz /= n; const d = Math.hypot(cx - c.x, cz - c.z); if (d < bd) { bd = d; best = { f, n, cx, cz }; } }
      if (!best || bd > 12) continue;
      const { f, n, cx, cz } = best, y0 = api.ground(cx, cz), H = pisos * 3.2 + 1, y1 = pisos > 2 ? 4.6 : 3.2; if (pisos < 3) continue;
      for (let i = 0; i < n; i++) {
        const ax = f[i * 2], az = f[i * 2 + 1], bx = f[((i + 1) % n) * 2], bz = f[((i + 1) % n) * 2 + 1], L = Math.hypot(bx - ax, bz - az);
        if (L < 8) continue; const mx = (ax + bx) / 2, mz = (az + bz) / 2; if (dRuta(mx, mz) > 34) continue;
        let nx = -(bz - az) / L, nz = (bx - ax) / L; if ((mx - cx) * nx + (mz - cz) * nz < 0) { nx = -nx; nz = -nz; }   // normal hacia afuera
        const yaw = Math.atan2(nx, nz), m = fach.clone(); m.map = fach.map.clone(); m.map.repeat.set(L / 14, Math.max(1, (pisos - 1) / 4)); m.map.needsUpdate = true;
        const p = new THREE.Mesh(new THREE.PlaneGeometry(L - 1, H - y1 - 1), m); p.position.set(mx + nx * .25, y0 + y1 + (H - y1 - 1) / 2, mz + nz * .25); p.rotation.y = yaw; g.add(p);
        // balcones corridos cada 3,5 m, en los pisos 2 a 4, y cornisa
        const nb = Math.floor((L - 2) / 3.5);
        for (let piso = 1; piso < pisos - 1; piso++) for (let j = 0; j < nb; j++) { if ((j + piso) % 2) continue; const t = (j + .5) / nb - .5, x = mx + (bx - ax) * t + nx * .8, z = mz + (bz - az) * t + nz * .8, y = y0 + y1 + piso * 3.1;
          const b = add(box, balc, x, y, z); b.scale.set(2.6, .18, 1.1); b.rotation.y = yaw; const r = add(box, rejas, x + nx * .5, y + .55, z + nz * .5); r.scale.set(2.6, .9, .05); r.rotation.y = yaw; }
        const co = add(box, balc, mx + nx * .4, y0 + H - .3, mz + nz * .4); co.scale.set(L, .5, .9); co.rotation.y = yaw;
      }
    }
  }

  return api.sombras(g);
}
