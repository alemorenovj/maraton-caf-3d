// Zona roca_victoria (km 12,2–15,3): lo que el video muestra y no sale de las huellas genéricas.
//  · km 12,25–12,42 izq.: muro blanco largo con letras rojas «Espacio recuperado…» (f_0115).
//  · km 12,70–12,80 izq.: fila de edificios estrechos de 3–5 pisos pintados de verde, morado y blanco, con santamarías (f_0118).
//  · km 12,85 izq.: estación techada en medio de la avenida, tras una baranda (f_0119).
//  · km 12,875–13,215 der.: EL CORTE DE ROCA TARPEYA — muro de concreto proyectado gris de 12–17 m, en talud, con su
//    retícula de anclajes triangulares, vegetación arriba y los ranchos asomando (f_0119–f_0122, cuadros 299–304 s).
//    El terreno de detrás lo sube fx/correcciones/roca_victoria.js (relieve +16 m); aquí va la cara del muro y su remate.
//  · km 13,34: puente del distribuidor que cruza por encima (cuadro 307 s) y la rampa que baja pegada a la izquierda
//    con su muro de paneles grafiteado (cuadros 309–311 s, f_0124).
//  · km 13,61 der.: estación de servicio PDV (cuadro 313 s, f_0126–f_0127).
//  · km 13,97–14,05 izq.: muro bajo con el mural de rostros (f_0130).
// Altura: con api.EX ≠ 0 (el juego) api.ground() y routeAt().y ya vienen en Y del mundo (exageradas y con el relieve lateral);
// en versiones viejas de la API se compensa aquí multiplicando por EX y sumando el relieve a mano.
export const meta = { id: 'zona_roca_victoria', nombre: 'Roca Tarpeya y Av. Victoria', quita: [] };

export function build(THREE, api) {
  const g = new THREE.Group();
  let EX = 1;
  try { if (!/test\.html/.test(location.pathname)) EX = (api.D.meta.exag || 1) * (+new URLSearchParams(location.search).get('relieve') || 1.5); } catch (e) { EX = 1; }
  if (api.EX) EX = 1;   // si algún día la API ya entrega la cota exagerada, no se multiplica dos veces
  const yR = km => api.routeAt(km).y * EX;
  // punto a d metros a la izquierda (d < 0: derecha) del eje en el km dado
  const at = (km, d) => { const p = api.routeAt(km); return { x: p.x + p.lx * d, z: p.z + p.lz * d, y: p.y * EX, tx: p.tx, tz: p.tz, lx: p.lx, lz: p.lz }; };
  const DKM = .001;
  const mesh = (pos, uv, idx, mat) => { const b = new THREE.BufferGeometry(); b.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); if (uv) b.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); b.setIndex(idx); b.computeVertexNormals(); const m = new THREE.Mesh(b, mat); g.add(m); return m; };
  // cinta a lo largo de la ruta: perfil(km) → lista de [d, dy, v] (dy sobre la calzada), se une fila con fila
  const cinta = (k0, k1, paso, perfil, mat, uLen = 6) => {
    const pos = [], uv = [], idx = []; let n = 0, cols = 0, s = 0, prev = null;
    for (let km = k0; km <= k1 + 1e-6; km += paso, n++) {
      const pts = perfil(km), p = api.routeAt(km); if (prev) s += Math.hypot(p.x - prev.x, p.z - prev.z); prev = p; cols = pts.length;
      for (const [d, dy, v] of pts) { pos.push(p.x + p.lx * d, p.y * EX + dy, p.z + p.lz * d); uv.push(s / uLen, v); }
      if (n) for (let c = 0; c < cols - 1; c++) { const a = (n - 1) * cols + c, b = n * cols + c; idx.push(a, b, a + 1, a + 1, b, b + 1); }
    }
    return mesh(pos, uv, idx, mat);
  };
  const box = (w, h, dpt, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, dpt), mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const rotOf = p => Math.atan2(p.tx, p.tz);   // eje +Z local = sentido de carrera; +X local = izquierda (lx, lz)

  // ───────── 1. Corte de Roca Tarpeya ─────────
  const K0 = 12.875, K1 = 13.215;
  const H = km => { const a = Math.min(1, (km - K0) / .03), b = Math.min(1, (K1 - km) / .025), mid = 15 + 2 * Math.sin((km - K0) / (K1 - K0) * Math.PI); return 2 + (mid - 2) * Math.max(0, Math.min(a, b)) ** .7; };
  const D0 = 10.6, BAT = .24;   // pie del muro a 10,6 m del eje (acera de ~3,5 m) y talud de 0,24 m por metro de alto
  const shot = api.canvasTex(512, 512, (k, w, h) => {
    // concreto proyectado: gris pardo con manchas, chorreaduras y la retícula de anclajes (triángulos invertidos, al tresbolillo)
    k.fillStyle = '#958c7e'; k.fillRect(0, 0, w, h);
    let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 3200; i++) { const v = 105 + r() * 75 | 0; k.fillStyle = `rgba(${v},${v - 5},${v - 14},${.2 + r() * .3})`; k.fillRect(r() * w, r() * h, 2 + r() * 14, 2 + r() * 10); }
    for (let i = 0; i < 40; i++) { const x = r() * w; k.fillStyle = `rgba(55,50,44,${.08 + r() * .14})`; k.fillRect(x, r() * h * .4, 3 + r() * 9, h * (.3 + r() * .7)); }
    for (let i = 0; i < 10; i++) { k.fillStyle = `rgba(${150 + r() * 30 | 0},${140 + r() * 25 | 0},${118 + r() * 20 | 0},.25)`; k.beginPath(); k.ellipse(r() * w, r() * h, 20 + r() * 50, 12 + r() * 30, 0, 0, 7); k.fill(); }
    // 3 columnas × 2 filas por tesela (tesela = 6 m × 6 m): anclaje cada 2 m en horizontal y 3 m en vertical
    const tri = (cx, cy) => { const a = 34, b = 46;
      k.fillStyle = 'rgba(190,182,166,.7)'; k.beginPath(); k.moveTo(cx - a - 4, cy - b * .5 - 4); k.lineTo(cx + a + 4, cy - b * .5 - 4); k.lineTo(cx, cy + b * .55 + 3); k.closePath(); k.fill();
      k.fillStyle = '#4a433b'; k.beginPath(); k.moveTo(cx - a, cy - b * .5); k.lineTo(cx + a, cy - b * .5); k.lineTo(cx, cy + b * .55); k.closePath(); k.fill();
      k.fillStyle = 'rgba(0,0,0,.35)'; k.fillRect(cx - 3, cy + b * .55, 6, 26);   // chorreadura bajo el anclaje
      k.fillStyle = '#6d6a64'; k.beginPath(); k.arc(cx, cy - b * .1, 4, 0, 7); k.fill(); };
    for (let row = 0; row < 2; row++) for (let c = 0; c < 3; c++) tri((c + .5 + (row ? .5 : 0)) * w / 3 % w, (row + .5) * h / 2);
  });
  shot.wrapS = shot.wrapT = THREE.RepeatWrapping;
  const muroMat = new THREE.MeshStandardMaterial({ map: shot, roughness: .95, side: THREE.DoubleSide });
  // cara del muro: v = metros de altura / 6 (la textura cubre 6 m × 6 m)
  cinta(K0, K1, .002, km => { const h = H(km); return [[-D0, -.6, -.1], [-(D0 + BAT * h), h, h / 6]]; }, muroMat, 6);
  // remate: franja de tierra y monte arriba del muro hasta empalmar con el terreno que sube el relieve
  const monte = api.canvasTex(256, 256, (k, w, h) => { k.fillStyle = '#6d6a3e'; k.fillRect(0, 0, w, h); let s = 5; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 900; i++) { const gg = 70 + r() * 70 | 0; k.fillStyle = `rgba(${gg - 20},${gg + 10},${gg - 40},.6)`; k.beginPath(); k.arc(r() * w, r() * h, 2 + r() * 7, 0, 7); k.fill(); } });
  monte.wrapS = monte.wrapT = THREE.RepeatWrapping;
  cinta(K0, K1, .004, km => { const h = H(km); return [[-(D0 + BAT * h), h, 0], [-(D0 + BAT * h + 2.5), h + .9, .4], [-30, Math.max(h, 15.5) + .3, 3]]; }, new THREE.MeshStandardMaterial({ map: monte, roughness: 1 }), 8);
  // matas y arbustos colgando del borde (instanciados)
  { const n = 150, ge = new THREE.IcosahedronGeometry(1, 1), im = new THREE.InstancedMesh(ge, new THREE.MeshStandardMaterial({ color: 0x5b7330, roughness: 1 }), n), M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(); let s = 3; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) { const km = K0 + .01 + r() * (K1 - K0 - .02), h = H(km), top = r() < .75, p = at(km, -(D0 + BAT * h * (top ? 1 : .3 + r() * .6) + (top ? 1 + r() * 3 : 0))), sz = top ? 1 + r() * 2.2 : .5 + r() * .8;
      v.set(p.x, p.y + (top ? h + .4 : h * (.3 + r() * .5)), p.z); e.set(r(), r() * 6, r()); q.setFromEuler(e); sc.set(sz, sz * (.7 + r() * .5), sz); M.compose(v, q, sc); im.setMatrixAt(i, M); }
    g.add(im); }
  // ladera vegetada de la izquierda (relieve +9 m de fx/correcciones) y monte sobre el corte: matas y copas apoyadas en el terreno del juego
  { const ss = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
    const rel = (km, d) => { const L = d > 0, a = Math.abs(d), R = L ? { k0: 12.96, k1: 13.24, d0: 19, d1: 34, dh: 9, d2: 60, d3: 90, ra: 30 } : { k0: 12.875, k1: 13.215, d0: 12, d1: 26, dh: 16, d2: 100, d3: 130, ra: 30 };
      if (km < R.k0 || km > R.k1) return 0; const k = a <= R.d0 ? 0 : a < R.d1 ? ss((a - R.d0) / (R.d1 - R.d0)) : a <= R.d2 ? 1 : a < R.d3 ? 1 - ss((a - R.d2) / (R.d3 - R.d2)) : 0;
      return R.dh * k * ss(Math.min(km - R.k0, R.k1 - km) * 1000 / R.ra); };
    const n = 1300, ge = new THREE.IcosahedronGeometry(1, 1), im = new THREE.InstancedMesh(ge, new THREE.MeshStandardMaterial({ roughness: 1 }), n), M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color(); let s = 17; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const verdes = [0x46582a, 0x55662f, 0x3a4a22, 0x62703a, 0x6f6a3e, 0x4b5e2c, 0x7a7448];
    for (let i = 0; i < n; i++) { const izq = i < 1100, km = izq ? 12.975 + r() * .26 : K0 + .015 + r() * (K1 - K0 - .03), d = izq ? 19.5 + r() * r() * 50 : -(D0 + 6 + r() * 30), p = at(km, d);
      const y = api.EX ? api.ground(p.x, p.z) : EX * api.ground(p.x, p.z) + rel(km, d), sz = (izq ? .9 + Math.min(2.6, (d - 19) * .08) : 1) + r() * (izq ? 1.8 : 1.6); const alto = izq && d > 24 && r() < .55 ? 1.6 + r() * 1.6 : .6 + r() * .6; v.set(p.x, y + sz * alto * .55, p.z); e.set(r() * .3, r() * 6, r() * .3); q.setFromEuler(e); sc.set(sz, sz * alto, sz); M.compose(v, q, sc); im.setMatrixAt(i, M); im.setColorAt(i, col.setHex(verdes[i % verdes.length]).multiplyScalar(.85 + r() * .3)); }
    g.add(im); }
  // pie del muro: zócalo y cuneta
  cinta(K0, K1, .004, km => [[-(D0 - .9), .02, 0], [-(D0 - .05), .02, .1], [-(D0 - .05), .45, .2], [-D0, .45, .25]], api.concrete(0x9e9a90), 6);

  // ───────── 2. Fila de edificios de colores (km 12,70–12,80 izq., f_0118) ─────────
  const shutters = api.canvasTex(128, 64, (k, w, h) => { k.fillStyle = '#8d9096'; k.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 3) { k.fillStyle = y % 6 ? '#a3a6ab' : '#74777c'; k.fillRect(0, y, w, 1); } k.fillStyle = '#5b5e63'; k.fillRect(0, 0, w, 6); });
  shutters.wrapS = THREE.RepeatWrapping;
  const fila = [  // [largo m, pisos, color, rejas] desde el km 12,700 hacia adelante
    [10, 3, '#69c23e', 1], [9, 5, '#7b3fa0', 1], [11, 5, '#3caf4c', 0], [8, 4, '#8a4fb0', 1], [10, 4, '#e4e0d8', 1], [9, 3, '#e86f3a', 0], [12, 5, '#4f9a3c', 1], [9, 4, '#c94fa0', 1], [10, 3, '#e8c84a', 0]];
  { let km = 12.700;
    fila.forEach(([L, pisos, col, rej], i) => {
      const kmC = km + L / 2000, p = at(kmC, 9.6 + 7), hh = pisos * 3.1 + 1.2, ry = rotOf(p);
      const fac = api.facade({ pared: col, vidrio: '#3d4652', pisos, vanos: Math.max(2, Math.round(L / 3.2)), marco: rej ? .42 : .34, seed: 31 + i });
      const lisa = api.concrete(new THREE.Color(col).multiplyScalar(.9).getHex());
      // caras: +x, -x, +y, -y, +z, -z; con rotation.y = atan2(tx, tz) el +X local apunta a la IZQUIERDA del corredor: la fachada a la calle es -X
      const mats = [lisa, fac, lisa, lisa, lisa, lisa];
      const b = box(14, hh, L - .2, mats, p.x, p.y - .5 + hh / 2, p.z, ry);
      // planta baja: santamarías y marquesina
      const pb = at(kmC, 9.55); const sm = new THREE.MeshStandardMaterial({ map: shutters.clone(), roughness: .7 }); sm.map.repeat.set(L / 3, 1); sm.map.needsUpdate = true;
      box(.15, 2.9, L - .8, sm, pb.x, pb.y + 1.45, pb.z, ry);
      box(1.1, .18, L - .4, api.concrete(new THREE.Color(col).multiplyScalar(.75).getHex()), pb.x - pb.lx * .5, pb.y + 3.15, pb.z - pb.lz * .5, ry);
      if (rej) for (let f = 1; f < pisos; f++) box(.25, .9, L * .6, api.concrete(0x55595e), pb.x - pb.lx * .3, pb.y + f * 3.1 + 1.6, pb.z - pb.lz * .3, ry);
      km += L / 1000;
    }); }
  // casa blanca con zócalo de azulejos azules (der., 12,77): el zócalo
  { const tiles = api.canvasTex(64, 64, (k, w, h) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { k.fillStyle = (x + y) % 2 ? '#e8e2c4' : '#2a7fae'; k.fillRect(x * 16, y * 16, 16, 16); } });
    tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping; tiles.repeat.set(6, 1);
    const p = at(12.772, -11.95); box(.12, 1.6, 9, new THREE.MeshStandardMaterial({ map: tiles, roughness: .4 }), p.x, p.y + .8, p.z, rotOf(p)); }

  // ───────── 3. Estación techada en medio de la avenida (12,85 izq.) y su baranda ─────────
  { const k0 = 12.842, k1 = 12.878, techo = api.concrete(0x8c4a36), acero = api.concrete(0x4a4f55), vidr = api.glass(0x9fb6c4, { transparent: true, opacity: .35 });
    for (let km = k0; km <= k1 + 1e-6; km += .006) { const p = at(km, 14); box(.25, 3.6, .25, acero, p.x + p.lx * 1.8, p.y + 1.8, p.z + p.lz * 1.8); box(.25, 3.6, .25, acero, p.x - p.lx * 1.8, p.y + 1.8, p.z - p.lz * 1.8); }
    const pm = at((k0 + k1) / 2, 14), L = (k1 - k0) * 1000 + 4;
    const roof = box(5.2, .35, L, techo, pm.x, pm.y + 3.75, pm.z, rotOf(pm)); roof.rotation.z = .06;
    box(3.6, .5, L - 2, api.concrete(0xb9b4aa), pm.x, pm.y + .25, pm.z, rotOf(pm));
    box(.08, 2.2, L - 4, vidr, pm.x - pm.lx * 1.6, pm.y + 1.6, pm.z - pm.lz * 1.6, rotOf(pm));
    // baranda metálica sobre el bordillo, entre las dos calzadas
    cinta(12.80, 12.95, .004, () => [[7.6, .2, 0], [7.6, 1.15, 1]], new THREE.MeshStandardMaterial({ color: 0x6f757c, roughness: .6, metalness: .4, side: THREE.DoubleSide, transparent: true, opacity: .75 }), 4); }

  // ───────── 4. Muro blanco «Espacio recuperado» (12,25–12,42 izq., f_0115) ─────────
  { const letras = api.canvasTex(2048, 128, (k, w, h) => { k.fillStyle = '#ece9e1'; k.fillRect(0, 0, w, h); let s = 9; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 300; i++) { k.fillStyle = `rgba(120,110,95,${r() * .12})`; k.fillRect(r() * w, r() * h, 4 + r() * 30, 2 + r() * 20); }
      k.fillStyle = '#c0392b'; k.font = 'bold 70px Arial, sans-serif'; k.textBaseline = 'middle'; k.fillText('ESPACIO RECUPERADO PARA EL PUEBLO', 60, h * .55); k.fillText('ESPACIO RECUPERADO', 1400, h * .55); });
    cinta(12.245, 12.42, .005, () => [[22, -.3, 0], [22, 3.2, 1]], new THREE.MeshStandardMaterial({ map: letras, roughness: .9, side: THREE.DoubleSide }), 175); }

  // ───────── 5. Distribuidor: puente que cruza (13,34) y rampa que baja pegada a la izquierda ─────────
  { const conc = api.concrete(0x97958f), losa = api.concrete(0x7f7e7a);
    const pc = at(13.342, 0), ry = rotOf(pc), y0 = pc.y;
    // tablero que sigue más allá de lo que dibuja la estructura "cubierta" (±13 m)
    for (const sd of [1, -1]) { const p = at(13.342, sd * 30); box(34, 1.5, 13, losa, p.x, y0 + 7.2, p.z, ry); box(34, 1, .3, conc, p.x + pc.tx * 6.4, y0 + 8.4, p.z + pc.tz * 6.4, ry); box(34, 1, .3, conc, p.x - pc.tx * 6.4, y0 + 8.4, p.z - pc.tz * 6.4, ry); }
    box(28, 1, .3, conc, pc.x + pc.tx * 6.4, y0 + 8.4, pc.z + pc.tz * 6.4, ry); box(28, 1, .3, conc, pc.x - pc.tx * 6.4, y0 + 8.4, pc.z - pc.tz * 6.4, ry);
    // columna pintada con la bandera (cuadro 308 s), a la izquierda
    { const p = at(13.348, 8.2), band = api.canvasTex(64, 128, (k, w, h) => { k.fillStyle = '#f2c230'; k.fillRect(0, 0, w, h / 3); k.fillStyle = '#1f4fa8'; k.fillRect(0, h / 3, w, h / 3); k.fillStyle = '#c8282a'; k.fillRect(0, 2 * h / 3, w, h / 3); k.fillStyle = '#fff'; for (let i = 0; i < 8; i++) { k.beginPath(); k.arc(8 + i * 7, h / 2 - Math.sin(i / 7 * Math.PI) * 8, 2.2, 0, 7); k.fill(); } });
      const m = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 6.5, 14), new THREE.MeshStandardMaterial({ map: band, roughness: .8 })); m.position.set(p.x, p.y + 3.25, p.z); g.add(m); }
    // rampa: muro de paneles grafiteado que baja de ~8 m a 1 m entre 13,350 y 13,470, con su tablero y baranda
    const panel = api.canvasTex(1024, 256, (k, w, h) => { k.fillStyle = '#9b9a95'; k.fillRect(0, 0, w, h); let s = 21; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      k.strokeStyle = 'rgba(60,60,58,.55)'; k.lineWidth = 2; for (let x = 0; x < w; x += 64) { k.beginPath(); k.moveTo(x + r() * 6, 0); k.lineTo(x + r() * 6, h); k.stroke(); } for (let y = 0; y < h; y += 64) { k.beginPath(); k.moveTo(0, y); k.lineTo(w, y + r() * 4); k.stroke(); }
      for (let i = 0; i < 400; i++) { k.fillStyle = `rgba(70,70,66,${r() * .12})`; k.fillRect(r() * w, r() * h, 3 + r() * 20, 2 + r() * 10); }
      const tags = [['SAKI', '#2a1f6e', '#d64ab0'], ['YA!', '#1b1b1b', null], ['ROSE', '#d93b2b', '#f2f2f2'], ['KRP', '#1d6fb8', '#f2e14a']];
      tags.forEach(([t, c1, c2], i) => { k.save(); k.translate(90 + i * 240 + r() * 40, h * (.62 + r() * .18)); k.rotate(-.08 + r() * .16); k.font = `bold ${46 + r() * 22 | 0}px Arial Black, sans-serif`; if (c2) { k.lineWidth = 7; k.strokeStyle = c2; k.strokeText(t, 0, 0); } k.fillStyle = c1; k.fillText(t, 0, 0); k.restore(); }); });
    panel.wrapS = THREE.RepeatWrapping;
    const hR = km => 1 + 7.6 * Math.max(0, Math.min(1, (13.500 - km) / .10)) ** .8;
    cinta(13.350, 13.500, .002, km => [[7.4, -.2, 0], [7.4, hR(km), 1]], new THREE.MeshStandardMaterial({ map: panel, roughness: .9, side: THREE.DoubleSide }), 16);
    cinta(13.350, 13.500, .004, km => [[7.4, hR(km), 0], [17, hR(km) - .1, 1]], losa, 10);
    cinta(13.350, 13.500, .004, km => [[7.5, hR(km), 0], [7.5, hR(km) + .9, 1]], conc, 10);
    // (19-nov) el ramal (Puente Guzmán Blanco en OSM, que baja pegado a la izquierda hasta el 13,46) pasa POR ENCIMA de la mitad izquierda de la calzada
    // al salir del puente (f_0124, 307,5 s: intradós sobre el canal izquierdo, muro grafiteado debajo): voladizo desde 3,5 m del eje que se aparta
    // hacia el muro mientras baja; intradós gris claro, canto de losa y parapeto. Se corta donde dejaría menos de ~6 m libres sobre la calzada.
    { const dIn = km => 3.5 + 3.9 * Math.max(0, Math.min(1, (km - 13.35) / .085)) ** 1.6, bajo = api.concrete(0xaaa9a3, { side: THREE.DoubleSide });
      cinta(13.350, 13.435, .002, km => [[dIn(km), hR(km) - 1, 0], [7.45, hR(km) - 1, 1]], bajo, 10);
      cinta(13.350, 13.435, .002, km => [[dIn(km), hR(km) - 1, 0], [dIn(km), hR(km), 1]], api.concrete(0x8d8c87, { side: THREE.DoubleSide }), 10);
      cinta(13.350, 13.435, .002, km => [[dIn(km), hR(km), 0], [7.45, hR(km), 1]], losa, 10);
      cinta(13.350, 13.435, .002, km => [[dIn(km) + .1, hR(km), 0], [dIn(km) + .1, hR(km) + .9, 1]], conc, 10); }
    // bordillo amarillo al pie
    cinta(13.350, 13.560, .004, () => [[7.2, .02, 0], [7.2, .28, 1], [7.45, .28, 1]], api.concrete(0xe2b62a), 10);
    // muro New Jersey que sigue tras la rampa (cuadro 311 s, f_0125)
    cinta(13.495, 13.70, .004, () => [[7.0, .02, 0], [7.25, .35, .3], [7.35, 1.0, 1], [7.55, 1.0, 1], [7.65, .35, .3], [7.9, .02, 0]], api.concrete(0xb5b2aa), 10);
  }

  // ───────── 5b. Centro Comercial Victoria Plaza (13,42 der.): esquina redonda, ladrillo naranja y banda crema, McDonald's ─────────
  { const poly = [[10.486417, -66.909331], [10.486368, -66.908954], [10.485974, -66.909204], [10.486078, -66.909334], [10.486372, -66.909688], [10.486408, -66.909691], [10.486431, -66.909682], [10.486446, -66.909674], [10.486462, -66.909649], [10.486464, -66.909617]];
    const sh = new THREE.Shape(poly.map(([la, lo]) => { const q = api.xz(la, lo); return new THREE.Vector2(q.x, -q.z); })), HT = 25;
    const geo = new THREE.ExtrudeGeometry(sh, { depth: HT, bevelEnabled: false, curveSegments: 4 }); geo.rotateX(-Math.PI / 2);
    const tex = api.canvasTex(256, 512, (k, w, h) => { const m = h / HT, Y = z => h - z * m;   // z en metros desde el suelo
      k.fillStyle = '#cf6a38'; k.fillRect(0, 0, w, h);
      k.fillStyle = '#e9dca2'; k.fillRect(0, Y(HT), w, (HT - 18.5) * m); k.fillStyle = 'rgba(150,130,80,.35)'; for (let z = 19.5; z < HT; z += 1.4) k.fillRect(0, Y(z), w, 2);
      k.fillStyle = '#b4572c'; for (let y = Y(18.5); y < Y(7.5); y += 6) k.fillRect(0, y, w, 1);
      k.fillStyle = '#2d2620'; for (let x = 10; x < w; x += 32) k.fillRect(x, Y(17.2), 14, 14);
      k.fillStyle = '#3a4048'; k.fillRect(0, Y(7.2), w, 7.2 * m); k.fillStyle = '#8a8f94'; for (let x = 0; x < w; x += 42) k.fillRect(x, Y(7.2), 4, 7.2 * m); k.fillRect(0, Y(3.6), w, 3); });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1 / 9, -1 / HT); tex.offset.set(0, 1 / HT);
    const y0 = yR(13.42) - .6, m = new THREE.Mesh(geo, [api.concrete(0xb9b2a4), new THREE.MeshStandardMaterial({ map: tex, roughness: .85 })]); m.position.y = y0; g.add(m);
    const logo = api.canvasTex(256, 128, (k, w, h) => { k.fillStyle = '#c8231c'; k.fillRect(0, 0, w, h); k.fillStyle = '#f6c21a'; k.font = 'bold 110px Arial Black, sans-serif'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('M', w / 2, h * .58); });
    const c = api.xz(10.486446, -66.909674), pl = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), api.glow(0xffffff, { dia: .1, noche: .9, mat: { map: logo } })); pl.position.set(c.x - 1.2, y0 + 6.2, c.z - .9); pl.rotation.y = -Math.PI * .75; g.add(pl); }

  // ───────── 6. Estación de servicio PDV (13,61 der.) ─────────
  { const c = api.xz(10.486110, -66.907798), p0 = at(13.612, 0), ry = rotOf(p0), y0 = p0.y;
    const rojo = api.concrete(0xc8231c), blanco = api.concrete(0xf0efe9), gris = api.concrete(0x8a8d90);
    const g2 = new THREE.Group(); g2.position.set(c.x, y0, c.z); g2.rotation.y = ry; g.add(g2);
    const add = (m, x, y, z) => { m.position.set(x, y, z); g2.add(m); return m; };
    add(new THREE.Mesh(new THREE.BoxGeometry(14, .6, 26), blanco), 0, 5.6, 0);                       // techo
    add(new THREE.Mesh(new THREE.BoxGeometry(14.2, .9, 26.2), rojo), 0, 5.0, 0);                        // faja roja
    const logo = api.canvasTex(512, 64, (k, w, h) => { k.fillStyle = '#c8231c'; k.fillRect(0, 0, w, h); k.fillStyle = '#fff'; k.font = 'bold 44px Arial, sans-serif'; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText('PDV', w * .25, h / 2); k.fillText('PDV', w * .75, h / 2); });
    for (const sd of [1, -1]) { const m = add(new THREE.Mesh(new THREE.PlaneGeometry(26, .9), new THREE.MeshStandardMaterial({ map: logo, roughness: .6 })), sd * 7.12, 5.0, 0); m.rotation.y = sd * Math.PI / 2; }
    for (const z of [-8, 0, 8]) for (const x of [-3.5, 3.5]) add(new THREE.Mesh(new THREE.BoxGeometry(.5, 5, .5), blanco), x, 2.5, z);
    for (const z of [-8, 0, 8]) { add(new THREE.Mesh(new THREE.BoxGeometry(1.2, .25, 4), gris), 0, .12, z); for (const x of [-.35, .35]) add(new THREE.Mesh(new THREE.BoxGeometry(.5, 1.7, .8), rojo), x, 1.1, z); }
    // tótem junto a la calle
    const t = at(13.596, -9.5); const tot = new THREE.Mesh(new THREE.BoxGeometry(1.6, 7, .5), blanco); tot.position.set(t.x, t.y + 3.5, t.z); tot.rotation.y = ry; g.add(tot);
    const cara = api.canvasTex(64, 256, (k, w, h) => { k.fillStyle = '#f0efe9'; k.fillRect(0, 0, w, h); k.fillStyle = '#c8231c'; k.fillRect(4, 6, w - 8, 52); k.fillStyle = '#fff'; k.font = 'bold 22px Arial'; k.textAlign = 'center'; k.fillText('PDV', w / 2, 40); ['#1f4fa8', '#e8b52a', '#c8231c', '#2f8f4a'].forEach((cc, i) => { k.fillStyle = cc; k.fillRect(8, 74 + i * 44, w - 16, 34); }); });
    for (const sd of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 6.6), new THREE.MeshStandardMaterial({ map: cara, roughness: .6 })); m.position.set(t.x + t.tx * .26 * sd, t.y + 3.6, t.z + t.tz * .26 * sd); m.rotation.y = ry + (sd > 0 ? 0 : Math.PI); g.add(m); } }

  // ───────── 7. Mural de rostros (13,97–14,05 izq., f_0130) ─────────
  { const mural = api.canvasTex(2048, 192, (k, w, h) => { const bg = k.createLinearGradient(0, 0, w, 0); ['#f2d23a', '#2f8fd8', '#e8505b', '#6cc04a', '#f29a2e', '#8a4fb0', '#f2d23a'].forEach((c, i, a) => bg.addColorStop(i / (a.length - 1), c)); k.fillStyle = bg; k.fillRect(0, 0, w, h);
      let s = 4; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; const piel = ['#8a5a3c', '#c48a64', '#5e3a26', '#e0b08a', '#a8724e'];
      for (let i = 0; i < 16; i++) { const x = 70 + i * 124 + r() * 20, y = h * .55, rw = 44 + r() * 10, rh = 66 + r() * 10;
        k.fillStyle = '#2a2420'; k.beginPath(); k.ellipse(x, y - 14, rw + 8, rh + 4, 0, Math.PI, 0); k.fill();
        k.fillStyle = piel[i % piel.length]; k.beginPath(); k.ellipse(x, y, rw, rh, 0, 0, 7); k.fill();
        k.fillStyle = '#1d1a18'; k.beginPath(); k.ellipse(x - rw * .38, y - 8, 7, 4, 0, 0, 7); k.ellipse(x + rw * .38, y - 8, 7, 4, 0, 0, 7); k.fill();
        k.fillStyle = '#7a2e2a'; k.fillRect(x - 12, y + rh * .45, 24, 5); }
      k.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 40; i++) k.fillRect(r() * w, r() * h, 30 + r() * 80, 3); });
    cinta(13.968, 14.048, .004, () => [[22.5, -.3, 0], [22.5, 3.6, 1]], new THREE.MeshStandardMaterial({ map: mural, roughness: .85, side: THREE.DoubleSide }), 80); }

  return api.sombras(g);
}
