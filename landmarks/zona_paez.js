// Zona paez (km 8,5–12,2): lo singular de la Av. Páez que el video muestra y las huellas genéricas no dan.
//  · km 8,6–11,5: pendones rojos «AV. PÁEZ · EL PARAÍSO» en postes de la acera derecha (f_0090, f_0092, f_0108).
//  · km 9,30 izq.: parque infantil de Plaza Washington con el techito rojo y los toboganes de colores (f_0092).
//  · km 9,79 izq.: McDonald's (franja roja y letrero de arcos en poste) (f_0097).
//  · km 10,46–10,50: el elevado — Autopista Norte-Sur (dos calzadas) y dos ramales del Distribuidor La Araña cruzan por encima,
//    trazados con su geometría OSM, losa gruesa de concreto con barandas New Jersey y columnas fuera de la calzada (f_0103).
//    Sustituye al «tablero de autopista» de los datos, que estaba mal puesto en el 10,31 (lo quita fx/correcciones/paez.js).
//  · km 11,22–11,27 der.: concesionario con la franja de cuadros blanco y negro y el estacionamiento de 6 pisos abiertos (f_0108).
//  · km 11,62–11,80: muros pintados de la Guardia Nacional (azul, blanco y rojo con reja roja) a la izq. y el muro largo
//    azul/blanco/naranja a la der. (f_0111, cuadro 276 s).
//  · km 11,65–12,19: rampas del Distribuidor Baralt que suben a la izq. y pasan por encima (trazado OSM; f_0111, f_0113, cuadro 281 s).
//    La zona roca_victoria pone la cubierta de 12,195–12,235 (alto 8): la rampa de aquí llega a esa misma altura y se corta en el 12,19.
//  · km 12,07–12,19 der.: muro blanco viejo de la calle Las Flores al pie del cerro (cuadro 281 s).
export const meta = { id: 'zona_paez', nombre: 'Zona paez', quita: [] };

export function build(THREE, api) {
  const g = new THREE.Group();
  const add = (geo, mat, x, y, z, p = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };
  const LL = (la, lo) => api.xz(la, lo);

  // muestras de la ruta para medir distancias (columnas fuera de la calzada, recortes por km)
  const RS = []; for (let km = 8.4; km <= 12.3; km += .003) { const r = api.routeAt(km); RS.push([r.x, r.z, km, r.y]); }
  const near = (x, z) => { let b = null, bd = Infinity; for (const s of RS) { const d = (s[0] - x) ** 2 + (s[1] - z) ** 2; if (d < bd) { bd = d; b = s; } } return { d: Math.sqrt(bd), km: b[2], y: b[3] }; };
  // cinta vertical que sigue la ruta a `lat` m (positivo = izquierda), de km0 a km1, con altura h; u en metros / rep
  const cinta = (km0, km1, lat, y0, h, mat, rep = 1) => { const p = [], uv = [], ix = []; let k = 0, acc = 0, px = null, pz = null;
    for (let km = km0; km <= km1 + 1e-6; km += .004, k++) { const r = api.routeAt(km), x = r.x + r.lx * lat, z = r.z + r.lz * lat, gy = api.ground(x, z);
      if (px !== null) acc += Math.hypot(x - px, z - pz); px = x; pz = z;
      p.push(x, gy + y0, z, x, gy + y0 + h, z); uv.push(acc / rep, 0, acc / rep, 1);
      if (k) { const a = (k - 1) * 2; ix.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(ix); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat); g.add(m); return m; };
  const rep = t => { t.wrapS = THREE.RepeatWrapping; return t; };

  // ───────── Viaductos (elevado de 10,47 y rampas del Distribuidor Baralt) ─────────
  const fascia = api.concrete(0x8f8a80), sofito = api.concrete(0x55524d), asfalto = api.concrete(0x4a4b4d), njersey = api.concrete(0xa6a197), colMat = api.concrete(0x8a867d);
  // polilínea lat/lon → muestras cada 5 m con la altura del intradós dada por fh(s, x, z, largo)
  const viaducto = (ll, ancho, fh, keep, colCada = 34) => {
    const P = ll.map(([a, b]) => LL(a, b)); const S = []; let tot = 0;
    for (let i = 0; i < P.length - 1; i++) { const L = Math.hypot(P[i + 1].x - P[i].x, P[i + 1].z - P[i].z), n = Math.max(1, Math.round(L / 5));
      for (let j = 0; j < n; j++) { const t = j / n; S.push({ x: P[i].x + (P[i + 1].x - P[i].x) * t, z: P[i].z + (P[i + 1].z - P[i].z) * t, s: tot + L * t }); } tot += L; }
    S.push({ x: P[P.length - 1].x, z: P[P.length - 1].z, s: tot });
    for (const q of S) { q.n = near(q.x, q.z); q.y = fh(q.s, q.x, q.z, tot, q.n); q.alto = q.y > api.ground(q.x, q.z) + 1.2; q.ok = keep(q) && q.alto; }
    let lastCol = -1e9;
    for (let i = 0; i < S.length - 1; i++) { const a = S[i], b = S[i + 1]; if (!a.ok || !b.ok) continue;
      const L = Math.hypot(b.x - a.x, b.z - a.z), ang = Math.atan2(b.z - a.z, b.x - a.x), pitch = Math.atan2(b.y - a.y, L), cx = (a.x + b.x) / 2, cz = (a.z + b.z) / 2, cy = (a.y + b.y) / 2;
      const G = new THREE.Group(); G.position.set(cx, cy, cz); G.rotation.order = 'YZX'; G.rotation.y = -ang; G.rotation.z = pitch; g.add(G);
      add(new THREE.BoxGeometry(L + .25, 2.0, ancho), [fascia, fascia, asfalto, sofito, fascia, fascia], 0, 1.0, 0, G);
      for (const sd of [1, -1]) add(new THREE.BoxGeometry(L + .25, 1.0, .45), njersey, 0, 2.5, sd * (ancho / 2 - .22), G);
      // columnas: fuera de la calzada del juego (≥ 10 m del eje)
      if (a.s - lastCol >= colCada && a.n.d > 10) { const gy = api.ground(a.x, a.z), h = a.y - gy + .2; if (h > 2) { add(new THREE.CylinderGeometry(.75, .75, h, 12), colMat, a.x, gy + h / 2 - .1, a.z); add(new THREE.BoxGeometry(1.4, .9, ancho * .7), colMat, a.x, a.y - .45, a.z).rotation.y = -ang; lastCol = a.s; } }
    }
    // estribos en los extremos cortados: muro desde el suelo hasta el tablero
    for (let i = 0; i < S.length; i++) { const q = S[i]; if (!q.ok) continue; const prev = S[i - 1], nxt = S[i + 1];
      if ((prev && prev.ok) && (nxt && nxt.ok)) continue; const o = prev && prev.ok ? prev : nxt; if (!o) continue; const fuera = o === prev ? nxt : prev; if (!fuera || fuera.alto) continue; const gy = api.ground(q.x, q.z), h = q.y - gy + 1.6;
      if (h > 1.5 && q.n.d > 9) add(new THREE.BoxGeometry(1.2, h, ancho), fascia, q.x, gy + h / 2, q.z).rotation.y = -Math.atan2(o.z - q.z, o.x - q.x); }
  };

  // Elevado de 10,46–10,50 (f_0103): calzadas de la Autopista Norte-Sur y ramales de La Araña; intradós a 7,3 m de la vía
  { const c = api.routeAt(10.477), Y0 = c.y + 7.3, cx = c.x, cz = c.z, flat = () => Y0, cerca = q => Math.hypot(q.x - cx, q.z - cz) < 170;
    viaducto([[10.48816, -66.929994], [10.488961, -66.930799], [10.48923, -66.931006], [10.489636, -66.931271], [10.490048, -66.931518]], 9.5, flat, cerca);
    viaducto([[10.489974, -66.931604], [10.489373, -66.931239], [10.488898, -66.930906], [10.488444, -66.930509], [10.488138, -66.930177], [10.487783, -66.929789]], 9.5, flat, cerca);
    viaducto([[10.48816, -66.929994], [10.488258, -66.930028], [10.488353, -66.930092], [10.488536, -66.93027], [10.488909, -66.930627], [10.489352, -66.930928], [10.4899, -66.931217]], 11.5, () => Y0 + .2, cerca);
    viaducto([[10.489658, -66.931625], [10.489183, -66.931292], [10.488835, -66.931024], [10.48856, -66.930767], [10.488244, -66.930423], [10.487959, -66.930069], [10.487783, -66.929789]], 11.5, () => Y0 + .2, cerca);
    // sombra de las losas sobre el asfalto (la luz del juego no siempre la proyecta tan oscura como en el video)
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(24, 40), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .38, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -16 }));
    sh.rotation.order = 'YXZ'; sh.rotation.y = Math.atan2(c.tx, c.tz); sh.rotation.x = -Math.PI / 2; sh.position.set(cx, c.y + .08, cz); sh.renderOrder = 6; g.add(sh);
  }

  // Distribuidor Baralt (11,65–12,19): rampas que nacen de la Páez a la izquierda y suben (11 % de pendiente) hasta 9,5 m (capa 2) u 8 m
  { const rampa = (hmax, desdeFin = false) => (s, x, z, tot, n) => n.y + Math.min(hmax, -1.4 + .11 * (desdeFin ? tot - s : s));
    const hasta1219 = q => q.n.km < 12.19 && q.n.d < 125;
    viaducto([[10.490927, -66.921631], [10.491015, -66.920961], [10.491102, -66.920287], [10.49113, -66.920042], [10.49117, -66.919807], [10.491221, -66.919526], [10.491291, -66.919257], [10.491336, -66.919081], [10.491393, -66.918886], [10.49146, -66.91868], [10.491533, -66.918472], [10.49162, -66.91824], [10.491716, -66.917993]], 8.5, rampa(9.5), hasta1219);
    viaducto([[10.490984, -66.921604], [10.491044, -66.921332], [10.491088, -66.921197], [10.491151, -66.921057], [10.49126, -66.920913], [10.491372, -66.920789], [10.491435, -66.920747], [10.491513, -66.920708], [10.491586, -66.920677], [10.491661, -66.920644], [10.491827, -66.920601], [10.491945, -66.920571], [10.491991, -66.920559], [10.492169, -66.920517], [10.492265, -66.920491], [10.492482, -66.920432]], 8, rampa(7.5), hasta1219);
    viaducto([[10.492482, -66.920432], [10.492135, -66.920438], [10.491962, -66.920422], [10.491796, -66.920384], [10.491672, -66.920344], [10.491566, -66.920309], [10.491418, -66.920234], [10.491202, -66.92007], [10.491118, -66.919971], [10.491086, -66.91992], [10.491003, -66.919775], [10.490933, -66.919625], [10.490872, -66.919435]], 8, rampa(7.5, true), hasta1219);
    viaducto([[10.490506, -66.918059], [10.490529, -66.917797], [10.490582, -66.917648], [10.490651, -66.917504], [10.490761, -66.917337], [10.490862, -66.917184], [10.490983, -66.917055], [10.491175, -66.916897], [10.491726, -66.916447]], 8.5, rampa(8), hasta1219, 20);
  }

  // ───────── Pendones rojos de la avenida (8,6–11,5, acera derecha) ─────────
  { const ban = api.canvasTex(64, 192, (c, w, h) => { c.fillStyle = '#d3242b'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 15px sans-serif'; c.textAlign = 'center';
      c.save(); c.translate(w / 2, h / 2); c.rotate(-Math.PI / 2); c.fillText('AV. PÁEZ', 0, -4); c.font = '11px sans-serif'; c.fillText('EL PARAÍSO', 0, 14); c.restore(); c.fillStyle = '#f2c230'; c.fillRect(0, h - 10, w, 10); });
    const kms = []; for (let km = 8.62; km <= 11.48; km += .072) if (!(km > 10.40 && km < 10.56) && !(km > 9.86 && km < 10.22)) kms.push(km);
    const poste = new THREE.InstancedMesh(new THREE.CylinderGeometry(.07, .09, 6.2, 6), api.concrete(0x6e7175), kms.length);
    const tela = new THREE.InstancedMesh(new THREE.PlaneGeometry(.75, 2.1), new THREE.MeshStandardMaterial({ map: ban, side: THREE.DoubleSide, roughness: .8 }), kms.length);
    const q = new THREE.Object3D();
    kms.forEach((km, i) => { const r = api.routeAt(km), lat = -9.3, x = r.x + r.lx * lat, z = r.z + r.lz * lat, gy = api.ground(x, z);
      q.position.set(x, gy + 3.1, z); q.rotation.set(0, 0, 0); q.updateMatrix(); poste.setMatrixAt(i, q.matrix);
      q.position.set(x + r.lx * .45, gy + 4.4, z + r.lz * .45); q.rotation.set(0, Math.atan2(r.tx, r.tz) + Math.PI, 0); q.updateMatrix(); tela.setMatrixAt(i, q.matrix); });
    g.add(poste, tela);
  }

  // ───────── Parque infantil de Plaza Washington (9,28–9,33 izq., f_0092) ─────────
  { const r = api.routeAt(9.30), P = new THREE.Group(), x = r.x + r.lx * 17, z = r.z + r.lz * 17; P.position.set(x, api.ground(x, z), z); P.rotation.y = Math.atan2(r.tx, r.tz); g.add(P);
    const rojo = api.concrete(0xd8352a), azul = api.concrete(0x2f6fc0), verde = api.concrete(0x3fa34d), amar = api.concrete(0xf0c419), piso = api.concrete(0xc9a77c);
    add(new THREE.BoxGeometry(14, .06, 22), piso, 0, .03, 0, P);
    for (const [px, pz] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) add(new THREE.CylinderGeometry(.09, .09, 3.6, 6), amar, px, 1.8, pz, P);
    const techo = add(new THREE.ConeGeometry(2.6, 1.6, 4), rojo, 0, 4.4, 0, P); techo.rotation.y = Math.PI / 4;
    add(new THREE.BoxGeometry(3.2, .2, 3.2), azul, 0, 1.6, 0, P);
    const tob = (m, px, pz, ry) => { const t = add(new THREE.BoxGeometry(.9, .12, 4.2), m, px, .9, pz, P); t.rotation.set(-.42, ry, 0); };
    tob(azul, 0, 3.4, 0); tob(verde, 3.2, 0, Math.PI / 2); tob(rojo, -2.2, -6, 0);
    add(new THREE.BoxGeometry(2.4, 1.6, 2.4), verde, -2.2, .8, -8.5, P); add(new THREE.BoxGeometry(1.4, 2.4, 1.4), amar, 3, 1.2, -6, P);
    for (const pz of [6, 9]) { add(new THREE.BoxGeometry(3, .1, .1), rojo, 0, 2.2, pz, P); for (const sx of [-1.5, 1.5]) add(new THREE.CylinderGeometry(.06, .06, 2.2, 5), rojo, sx, 1.1, pz, P); }
  }

  // ───────── McDonald's (9,79 izq., f_0097): franja roja y letrero de arcos en poste ─────────
  { const c = LL(10.485053, -66.935808), gy = api.ground(c.x, c.z), M = new THREE.Group(); M.position.set(c.x, gy, c.z); M.rotation.y = 2.344; g.add(M);
    add(new THREE.BoxGeometry(31.8, 1.5, 20.2), api.concrete(0xd52b1e), 0, 5.6, 0, M);
    add(new THREE.BoxGeometry(32, .25, 20.4), api.concrete(0xf2f0ea), 0, 6.45, 0, M);
    const r = api.routeAt(9.775), px = r.x + r.lx * 9.8, pz = r.z + r.lz * 9.8, pg = api.ground(px, pz);
    add(new THREE.CylinderGeometry(.18, .22, 9, 8), api.concrete(0x8d8f92), px, pg + 4.5, pz);
    const logo = api.canvasTex(128, 112, (k, w, h) => { k.fillStyle = '#d52b1e'; k.fillRect(0, 0, w, h); k.strokeStyle = '#ffc72c'; k.lineWidth = 14; k.beginPath(); k.moveTo(14, h - 12); k.quadraticCurveTo(28, 6, 64, h - 30); k.quadraticCurveTo(100, 6, 114, h - 12); k.stroke(); });
    const s = add(new THREE.BoxGeometry(2.8, 2.5, .35), [api.concrete(0xd52b1e), api.concrete(0xd52b1e), api.concrete(0xd52b1e), api.concrete(0xd52b1e), new THREE.MeshStandardMaterial({ map: logo, emissive: 0x331100, roughness: .5 }), new THREE.MeshStandardMaterial({ map: logo, emissive: 0x331100, roughness: .5 })], px, pg + 9.8, pz);
    s.rotation.y = Math.atan2(r.tx, r.tz);
  }

  // ───────── Estacionamiento de pisos abiertos y concesionario de cuadros (11,22–11,32 der., f_0108) ─────────
  { const c = LL(10.489323, -66.924), gy = api.ground(c.x, c.z), E = new THREE.Group(); E.position.set(c.x, gy, c.z); E.rotation.y = -0.549; g.add(E);
    const W = 61, Dd = 23, NIV = 6, HN = 3.1, beige = api.concrete(0xdcd2b6), losa = api.concrete(0xb9b3a4), oscuro = api.concrete(0x2e2f31);
    add(new THREE.BoxGeometry(W - 3, NIV * HN, Dd - 3), oscuro, 0, NIV * HN / 2, 0, E);       // interior en sombra
    for (let k = 1; k <= NIV; k++) { const y = k * HN; add(new THREE.BoxGeometry(W, .32, Dd), losa, 0, y - .16, 0, E);
      add(new THREE.BoxGeometry(W + .3, 1.05, .3), beige, 0, y + .5, Dd / 2, E); add(new THREE.BoxGeometry(W + .3, 1.05, .3), beige, 0, y + .5, -Dd / 2, E);
      add(new THREE.BoxGeometry(.3, 1.05, Dd), beige, W / 2, y + .5, 0, E); add(new THREE.BoxGeometry(.3, 1.05, Dd), beige, -W / 2, y + .5, 0, E); }
    const ncol = 8, col = new THREE.InstancedMesh(new THREE.BoxGeometry(.7, NIV * HN + 1, .7), beige, ncol * 2), q = new THREE.Object3D();
    for (let i = 0; i < ncol; i++) for (const sd of [0, 1]) { q.position.set(-W / 2 + .4 + i * (W - .8) / (ncol - 1), (NIV * HN + 1) / 2, sd ? Dd / 2 - .2 : -Dd / 2 + .2); q.updateMatrix(); col.setMatrixAt(i * 2 + sd, q.matrix); }
    E.add(col);
    add(new THREE.BoxGeometry(6, NIV * HN + 3.5, 6), beige, -W / 2 + 3, (NIV * HN + 3.5) / 2, -Dd / 2 + 3, E);   // torre de escaleras
    // concesionario: franja de cuadros sobre vidrio oscuro, frente a la acera derecha
    const cuadros = api.canvasTex(512, 64, (k, w, h) => { const n = 4, s = h / n; for (let i = 0; i < w / s; i++) for (let j = 0; j < n; j++) { k.fillStyle = (i + j) % 2 ? '#111' : '#f4f4f2'; k.fillRect(i * s, j * s, s, s); } });
    rep(cuadros); const cm = new THREE.MeshStandardMaterial({ map: cuadros, roughness: .6, side: THREE.DoubleSide });
    const vid = api.glass(0x2c3a44, { side: THREE.DoubleSide });
    cinta(11.222, 11.272, -13.2, .2, 4.6, vid, 30);
    cinta(11.222, 11.272, -13.2, 4.8, 2.8, cm, 22.4);
    cinta(11.222, 11.272, -13.4, 7.6, .4, api.concrete(0x1f2022, { side: THREE.DoubleSide }), 30);
  }

  // ───────── Guardia Nacional (11,62–11,80 izq.) y muro azul/blanco/naranja (11,645–11,80 der.) ─────────
  { const gn = rep(api.canvasTex(256, 64, (k, w, h) => { k.fillStyle = '#f3f2ee'; k.fillRect(0, 0, w, h); k.fillStyle = '#1f4fa6'; k.fillRect(0, h * .5, w, h * .5); k.fillStyle = '#c62a28'; k.fillRect(0, h * .4, w, h * .1); k.fillRect(0, 0, w, h * .08);
      k.fillStyle = '#c62a28'; for (let i = 0; i < 4; i++) k.fillRect(i * w / 4, 0, 10, h); }));
    cinta(11.62, 11.80, 8.4, -.3, 2.7, new THREE.MeshStandardMaterial({ map: gn, roughness: .85, side: THREE.DoubleSide }), 18);
    const malla = rep(api.canvasTex(64, 64, (k, w, h) => { k.clearRect(0, 0, w, h); k.strokeStyle = 'rgba(178,40,36,.95)'; k.lineWidth = 2; for (let i = -w; i < w * 2; i += 10) { k.beginPath(); k.moveTo(i, 0); k.lineTo(i + h, h); k.stroke(); k.beginPath(); k.moveTo(i + h, 0); k.lineTo(i, h); k.stroke(); } k.fillStyle = '#b52824'; k.fillRect(0, 0, w, 4); }));
    cinta(11.62, 11.80, 8.4, 2.4, 1.9, new THREE.MeshStandardMaterial({ map: malla, transparent: true, alphaTest: .3, side: THREE.DoubleSide, roughness: .8 }), 2.2);
    const n = 46, pil = new THREE.InstancedMesh(new THREE.BoxGeometry(.35, 4.5, .35), api.concrete(0xc62a28), n), q = new THREE.Object3D();
    for (let i = 0; i < n; i++) { const r = api.routeAt(11.62 + i * .004), x = r.x + r.lx * 8.4, z = r.z + r.lz * 8.4; q.position.set(x, api.ground(x, z) + 2, z); q.updateMatrix(); pil.setMatrixAt(i, q.matrix); } g.add(pil);
    const der = rep(api.canvasTex(256, 128, (k, w, h) => { k.fillStyle = '#f1f1ee'; k.fillRect(0, 0, w, h); k.fillStyle = '#1d4fb0'; k.fillRect(0, h * .58, w, h * .42); k.fillRect(0, 0, w, h * .12); k.fillStyle = '#e2622b'; k.fillRect(0, h * .5, w, h * .08); }));
    cinta(11.645, 11.80, -9.2, -.3, 6.2, new THREE.MeshStandardMaterial({ map: der, roughness: .85, side: THREE.DoubleSide }), 26);
    { const r = api.routeAt(11.735), x = r.x - r.lx * 9.05, z = r.z - r.lz * 9.05; add(new THREE.BoxGeometry(4.2, 3.6, .2), api.concrete(0x2a9a86), x, api.ground(x, z) + 1.8, z).rotation.y = Math.atan2(r.tx, r.tz) + Math.PI / 2; }
  }

  // ───────── Muro blanco de la calle Las Flores (12,07–12,19 der.) ─────────
  { const t = rep(api.canvasTex(256, 64, (k, w, h) => { k.fillStyle = '#e6e3da'; k.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { k.fillStyle = `rgba(${90 + i % 3 * 20},${85 + i % 4 * 10},70,${.05 + (i % 5) * .02})`; k.fillRect((i * 53) % w, h * .3 + (i * 17) % (h * .7), 12 + (i * 7) % 30, h); } k.fillStyle = '#d9d6cc'; k.fillRect(0, 0, w, 5); }));
    cinta(12.07, 12.19, -8.8, -.3, 3.1, new THREE.MeshStandardMaterial({ map: t, roughness: .95, side: THREE.DoubleSide }), 20);
    const pl = api.canvasTex(256, 48, (k, w, h) => { k.fillStyle = '#fff'; k.fillRect(0, 0, w, h); k.fillStyle = '#1b2a6b'; k.font = 'bold 28px sans-serif'; k.fillText('Calle LAS FLORES', 10, 34); });
    const r = api.routeAt(12.165), x = r.x - r.lx * 8.6, z = r.z - r.lz * 8.6; const m = add(new THREE.PlaneGeometry(2.4, .45), new THREE.MeshStandardMaterial({ map: pl, side: THREE.DoubleSide }), x, api.ground(x, z) + 2.2, z); m.rotation.y = Math.atan2(r.tx, r.tz) + Math.PI / 2;
  }
  return api.sombras(g);
}
