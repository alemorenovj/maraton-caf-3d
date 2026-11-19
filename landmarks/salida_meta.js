// Zona de salida y llegada del Maratón CAF en el Paseo Colón (Paseo de la Resistencia Indígena), junto al Parque Los Caobos.
// Fuentes: build/investigacion/dia_de_carrera.md (§0, §1, §2), fotos/mapas/mapa_parque_caobos_2026.jpg, fotos/carrera/yt26_arco_salida_amarillo.jpg,
// yt23_arco_llegada_reloj.jpg y los fotogramas video/fotogramas/f_0390–f_0396 (recta final: jersey + reja verde-turquesa a la derecha).
// La ruta sale hacia el oeste (km 0) y termina ~750 m al este de la salida, en la misma vía. Los corrales van detrás del arco de salida,
// sobre el tramo de vía que une la salida con la meta (el track GPS no lo cubre: lo trazo con una curva que sigue la calle de la foto satelital).
export const meta = { id: 'salida_meta', nombre: 'Salida y llegada · Paseo Colón, Los Caobos', quita: [] };

export function build(THREE, api) {
  const g = new THREE.Group(), RW = api.ROAD_W, HW = RW / 2, KM = api.KM;
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
  const M = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0) => { _e.set(rx, ry, 0, 'YXZ'); _q.setFromEuler(_e); return _m.compose(_v.set(x, y, z), _q, _s.set(sx, sy, sz)); };
  const inst = (geo, mat, list, colors) => { const im = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((t, i) => { im.setMatrixAt(i, M(...t)); if (colors) im.setColorAt(i, colors[i]); }); im.instanceMatrix.needsUpdate = true; im.computeBoundingBox?.(); im.computeBoundingSphere?.(); return im; };
  let seed = 4242; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const paint = (o) => { const m = new THREE.MeshStandardMaterial({ roughness: .85, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, ...o }); return m; };
  const led = (tex, dia = .3, noche = 1.0) => { const m = api.glow(0xffffff, { dia, noche }); m.map = tex; m.emissiveMap = tex; m.needsUpdate = true; return m; };

  // ── tramo salida→meta: curva de Bézier sobre la calle (d = metros detrás del arco de salida, hacia el este) ──
  const A = api.routeAt(0), B = api.routeAt(KM), dx = B.x - A.x, dz = B.z - A.z, L0 = Math.hypot(dx, dz);
  // Bézier cúbica: sale del arco hacia el este siguiendo la tangente de la salida y entra a la meta prolongando la tangente de la llegada
  const H0 = 110, H1 = 260, P1 = { x: A.x - A.tx * H0, z: A.z - A.tz * H0 }, P2 = { x: B.x + B.tx * H1, z: B.z + B.tz * H1 };
  const bz = f => { const a = (1 - f) ** 3, b = 3 * (1 - f) ** 2 * f, c = 3 * (1 - f) * f * f, d = f ** 3; return [a * A.x + b * P1.x + c * P2.x + d * B.x, a * A.z + b * P1.z + c * P2.z + d * B.z]; };
  const TAB = [[0, 0]]; { let acc = 0, [px, pz] = bz(0); for (let i = 1; i <= 400; i++) { const [x, z] = bz(i / 400); acc += Math.hypot(x - px, z - pz); px = x; pz = z; TAB.push([i / 400, acc]); } }
  const LB = TAB[400][1];
  const fOf = d => { if (d <= 0) return 0; if (d >= LB) return 1; let lo = 0, hi = 400; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (TAB[m][1] < d) lo = m; else hi = m; } const t = (d - TAB[lo][1]) / (TAB[hi][1] - TAB[lo][1]); return TAB[lo][0] + (TAB[hi][0] - TAB[lo][0]) * t; };
  const cp = d => { const f = fOf(d), [x, z] = bz(f), [x1, z1] = bz(Math.max(0, f - .004)), [x2, z2] = bz(Math.min(1, f + .004)); let tx = x1 - x2, tz = z1 - z2; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    return { x, z, y: Math.max(api.ground(x, z) + .06, A.y + (B.y - A.y) * f), tx, tz, lx: tz, lz: -tx }; };
  const rt = km => api.routeAt(km);
  const at = (p, lat) => [p.x + p.lx * lat, p.z + p.lz * lat];
  const yaw = p => Math.atan2(p.tx, p.tz);

  // cinta de geometría a lo largo de una lista de puntos {x,y,z,lx,lz}, entre dos desplazamientos laterales
  function ribbon(pts, lat0, lat1, yoff, colorOf) {
    const pos = [], uv = [], col = [], idx = []; let dist = 0;
    pts.forEach((p, i) => { if (i) dist += Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z);
      for (const [lat, u] of [[lat0, 0], [lat1, 1]]) { pos.push(p.x + p.lx * lat, p.y + yoff, p.z + p.lz * lat); uv.push(u, dist); if (colorOf) { const c = colorOf(p, i); col.push(c.r, c.g, c.b); } }
      if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); if (colorOf) geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals(); return geo;
  }
  // pared vertical (reja) a lo largo de puntos, a un lateral dado
  function wall(pts, lat, y0, h, uScale) {
    const pos = [], uv = [], idx = []; let dist = 0;
    pts.forEach((p, i) => { if (i) dist += Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z); const x = p.x + p.lx * lat, z = p.z + p.lz * lat;
      pos.push(x, p.y + y0, z, x, p.y + y0 + h, z); uv.push(dist / uScale, 0, dist / uScale, 1); if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals(); return geo;
  }

  // ── logos dibujados (simplificados) ──
  const logoCAF = (c, x, y, s, sub = true, fg = '#0a4fa0', fg2 = '#3aaa35') => { c.save(); c.font = `900 ${s}px Arial`; c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.fillStyle = fg; c.fillText('C', x, y); const w = c.measureText('C').width; c.fillStyle = fg2; c.fillText('AF', x + w * .95, y);
    if (sub) { c.font = `600 ${s * .16}px Arial`; c.fillStyle = fg; c.fillText('BANCO DE DESARROLLO', x, y + s * .24); c.fillText('DE AMÉRICA LATINA Y EL CARIBE', x, y + s * .42); } c.restore(); };
  const logo42 = (c, x, y, s, fg, line = '#C1F938') => { c.save(); c.textAlign = 'center'; c.strokeStyle = line; c.lineWidth = s * .07; c.beginPath(); const w = s * 2.2; c.moveTo(x - w / 2, y - s * .95); c.lineTo(x - w * .25, y - s * 1.35); c.lineTo(x - w * .1, y - s * 1.1); c.lineTo(x + w * .12, y - s * 1.5); c.lineTo(x + w * .3, y - s * 1.15); c.lineTo(x + w / 2, y - s * 1.3); c.stroke();
    c.fillStyle = fg; c.font = `italic 900 ${s}px Arial`; c.fillText('42KCAF', x, y); c.font = `700 ${s * .3}px Arial`; c.fillText('CARACAS', x, y + s * .38); c.restore(); };
  const star = (c, x, y, r, col = '#e12229') => { c.save(); c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.fill(); c.restore(); };
  const ledDots = (c, w, h, col, step = 8) => { c.fillStyle = col; for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) c.fillRect(x - 1.2, y - 1.2, 2.4, 2.4); };

  // ── arco tipo pórtico de pantallas LED (eje +Z local = sentido de carrera) ──
  const SPAN = RW + 1.2, CLEAR = 5.7, BH = 2.1, CW = 1.4, DEP = 1.0;
  function arco(beamTex, colTex, hex) {
    const a = new THREE.Group(), side = api.concrete(hex, { roughness: .5 }), dark = api.concrete(0x25282c);
    const lb = led(beamTex), lc = led(colTex);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(SPAN + 2 * CW, BH, DEP), [side, side, dark, dark, lb, lb]); beam.position.y = CLEAR + BH / 2; a.add(beam);
    for (const k of [1, -1]) { const col = new THREE.Mesh(new THREE.BoxGeometry(CW, CLEAR, DEP), [lc, lc, side, side, lc, lc]); col.position.set(k * (SPAN / 2 + CW / 2), CLEAR / 2, 0); a.add(col);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(CW + .5, .25, DEP + .8), dark); foot.position.set(k * (SPAN / 2 + CW / 2), .12, 0); a.add(foot); }
    // truss trasero que sostiene las pantallas
    const truss = new THREE.Mesh(new THREE.BoxGeometry(SPAN + 2 * CW, .45, .45), dark); truss.position.set(0, CLEAR + BH + .25, -.2); a.add(truss);
    return a;
  }
  // SALIDA 2026: amarillo #FFFF01, "SALIDA" gris oscuro, CAF a la izquierda, 42KCAF a la derecha, banda de puntos LED
  const texSalida = api.canvasTex(1536, 192, (c, w, h) => { c.fillStyle = '#FFFF01'; c.fillRect(0, 0, w, h); ledDots(c, w, h, 'rgba(200,190,0,.35)', 9);
    c.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(0, h * (.7 + i * .07)); for (let x = 0; x <= w; x += 32) c.lineTo(x, h * (.7 + i * .07) + Math.sin(x / 90 + i) * 9); c.lineTo(w, h); c.lineTo(0, h); c.fill(); }
    c.fillStyle = '#3b3b3b'; c.font = '900 118px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SALIDA', w / 2, h * .45);
    logoCAF(c, 50, 105, 80, true, '#3b3b3b', '#3b3b3b'); logo42(c, w - 190, 120, 62, '#3b3b3b', '#3b3b3b'); });
  const texColSalida = api.canvasTex(128, 512, (c, w, h) => { c.fillStyle = '#FFFF01'; c.fillRect(0, 0, w, h); ledDots(c, w, h, 'rgba(200,190,0,.35)', 9);
    c.fillStyle = 'rgba(255,255,255,.5)'; for (let y = 0; y < h; y += 96) { c.beginPath(); c.ellipse(w / 2, y + 40, 70, 18, 0, 0, 6.3); c.fill(); }
    logoCAF(c, 22, 90, 48, false, '#3b3b3b', '#3b3b3b'); star(c, w / 2, 170, 26, '#e12229'); c.fillStyle = '#3b3b3b'; c.font = '800 20px Arial'; c.textAlign = 'center'; c.fillText('CARACAS', w / 2, 215);
    c.save(); c.translate(w / 2, 360); c.rotate(-Math.PI / 2); c.font = 'italic 900 44px Arial'; c.fillText('42KCAF', 0, 14); c.restore(); });
  // LLEGADA 42K: azul oscuro #003C60 (mapa 2026). Columnas con cuadrícula roja/azul (arco 2023).
  const texLleg = (bg, dist, acc) => api.canvasTex(1536, 192, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); ledDots(c, w, h, 'rgba(255,255,255,.07)', 9);
    c.fillStyle = acc; c.fillRect(0, h - 22, w, 10); c.fillStyle = '#fff'; c.font = '900 112px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LLEGADA', w / 2 - 130, h * .46);
    c.fillStyle = acc; c.font = 'italic 900 112px Arial'; c.fillText(dist, w / 2 + 230, h * .46); logoCAF(c, 50, 105, 80, true, '#ffffff', acc); logo42(c, w - 190, 120, 62, '#ffffff', acc); });
  const texColLleg = (bg, acc) => api.canvasTex(128, 512, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { c.fillStyle = ((x + y) / 32) % 2 ? 'rgba(225,34,41,.75)' : 'rgba(40,80,200,.55)'; c.fillRect(x + 2, y + 2, 28, 28); }
    c.fillStyle = bg; c.fillRect(8, 150, w - 16, 210); c.save(); c.translate(w / 2, 255); c.rotate(-Math.PI / 2); c.fillStyle = '#fff'; c.font = 'italic 900 46px Arial'; c.textAlign = 'center'; c.fillText('42KCAF', 0, 16); c.restore(); c.fillStyle = acc; c.fillRect(8, 150, w - 16, 6); });

  const placeOn = (obj, p, lat = 0, dy = 0) => { const [x, z] = at(p, lat); obj.position.set(x, p.y + dy, z); obj.rotation.y = yaw(p); g.add(obj); return obj; };

  // arco de SALIDA en el km 0,02
  const pS = rt(.02); placeOn(arco(texSalida, texColSalida, 0xFFFF01), pS);
  // arcos de LLEGADA: 42K sobre la ruta (canal norte, lado del parque) y 21K en el canal sur (izquierda del corredor)
  const pL = rt(KM - .01), LAT21 = RW + 3.5;
  placeOn(arco(texLleg('#003C60', '42K', '#C1F938'), texColLleg('#003C60', '#C1F938'), 0x003C60), pL);
  placeOn(arco(texLleg('#47AB48', '21K', '#FFFFFF'), texColLleg('#2f7f33', '#ffffff'), 0x47AB48), pL, LAT21);

  // reloj digital rojo de meta (encima de cada arco de llegada): cuenta el tiempo de carrera
  const clocks = [];
  for (const lat of [0, LAT21]) {
    const tex = api.canvasTex(512, 128, () => { }), m = api.glow(0xffffff, { dia: .9, noche: 1.8 }); m.map = tex; m.emissiveMap = tex; m.needsUpdate = true;
    const box = new THREE.Mesh(new THREE.BoxGeometry(3.6, .9, .35), [api.concrete(0x111111), api.concrete(0x111111), api.concrete(0x111111), api.concrete(0x111111), m, m]);
    placeOn(box, pL, lat, CLEAR + BH + .95); clocks.push({ tex, base: lat ? 1 * 3600 + 32 * 60 + 5 : 2 * 3600 + 14 * 60 + 41 });
  }
  const drawClock = (k, secs) => { const c = k.tex.image.getContext('2d'), w = 512, h = 128; c.fillStyle = '#060606'; c.fillRect(0, 0, w, h); const s = Math.floor(secs), t = `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    c.font = '700 100px "Courier New", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(255,40,30,.12)'; c.fillText('8:88:88', w / 2, h / 2 + 4); c.fillStyle = '#ff2a1e'; c.fillText(t, w / 2, h / 2 + 4); k.tex.needsUpdate = true; };
  clocks.forEach(k => drawClock(k, k.base)); let lastS = -1;
  api.onFrame(st => { const s = Math.floor(st.t); if (s !== lastS) { lastS = s; clocks.forEach(k => drawClock(k, k.base + s)); } });

  // ── piso: alfombras azules de cronometraje, línea de salida, "42.195" pintado ──
  const texMat = api.canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#1d3f93'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.12)'; for (let x = 0; x < w; x += 16) c.fillRect(x, 0, 6, h);
    c.fillStyle = '#e9eef8'; c.font = 'italic 900 46px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('42KCAF', w * .27, h / 2); c.fillText('42KCAF', w * .75, h / 2); });
  const matPaint = paint({ map: texMat }), flat = (w, l) => new THREE.PlaneGeometry(w, l).rotateX(-Math.PI / 2).rotateY(Math.PI);
  placeOn(new THREE.Mesh(flat(RW - .2, 2.6), matPaint), rt(KM - .01), 0, .05);
  placeOn(new THREE.Mesh(flat(RW - .2, 2.6), matPaint), rt(KM - .01), LAT21, .05);
  placeOn(new THREE.Mesh(flat(RW - .2, 2.6), matPaint), rt(.02), 0, .05);
  const white = paint({ color: 0xf4f4f0 });
  placeOn(new THREE.Mesh(flat(RW - .2, .4), white), rt(.02 + .0018), 0, .055);
  const tex42 = api.canvasTex(1024, 320, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.font = 'italic 900 270px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('42.195', w / 2, h / 2 + 10); });
  placeOn(new THREE.Mesh(flat(9.5, 3.2), paint({ map: tex42, transparent: true, depthWrite: false })), rt(KM - .022), 0, .05);
  const tex21 = api.canvasTex(1024, 320, (c, w, h) => { c.fillStyle = '#ffffff'; c.font = 'italic 900 270px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('21.097', w / 2, h / 2 + 10); });
  placeOn(new THREE.Mesh(flat(9.5, 3.2), paint({ map: tex21, transparent: true, depthWrite: false })), rt(KM - .022), LAT21, .05);

  // canal sur (21K): un trozo de calzada propio junto a la meta, para que el arco verde no quede sobre tierra
  { const pts = []; for (let km = KM - .12; km <= KM; km += .005) pts.push(rt(km)); for (let d = 5; d <= 60; d += 5) pts.push(cp(LB - d));
    g.add(new THREE.Mesh(ribbon(pts, LAT21 - HW, LAT21 + HW, .03), paint({ color: 0x55575a, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })));
    const dash = []; for (let i = 0; i < pts.length; i += 2) dash.push(pts[i]); }

  // ── corrales por color detrás del arco de salida (sobre el tramo salida→meta) ──
  const CORR = [['', '#3aa655', 26, 'MOV.'], ['', '#3b3f46', 26, 'ÉLITE'], ['A', '#7b3fa0', 58], ['B', '#e8448f', 58], ['C', '#5bc0e8', 58], ['D', '#e12229', 58], ['E', '#f5d50a', 58]];
  const D0 = 6; let dEnd = D0; CORR.forEach(c => { c.d0 = dEnd; dEnd += c[2]; c.d1 = dEnd; });
  { // asfalto del tramo salida→meta completo (el juego solo pinta calzada sobre la ruta)
    const pts = []; for (let d = 0; d <= LB; d += 6) pts.push(cp(d));
    g.add(new THREE.Mesh(ribbon(pts, -HW, HW, .02), paint({ color: 0x5a5c5f, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })));
    const dash = new THREE.Group(), dm = paint({ color: 0xf0efe6 }); const dg = new THREE.PlaneGeometry(.15, 3).rotateX(-Math.PI / 2), list = [];
    for (let d = dEnd + 4; d < LB - 8; d += 9) { const p = cp(d); for (const lat of [-2.2, 2.2]) { const [x, z] = at(p, lat); list.push([x, p.y + .06, z, yaw(p)]); } }
    g.add(inst(dg, dm, list));
    // bordes amarillos (bordillo pintado)
    const ym = paint({ color: 0xf2c400 }); g.add(new THREE.Mesh(ribbon(pts, HW, HW + .35, .1), ym), new THREE.Mesh(ribbon(pts, -HW - .35, -HW, .1), ym));
  }
  { // piso de color por corral
    const pts = [], cols = [], col = new THREE.Color();
    for (const c of CORR) for (let d = c.d0; d <= c.d1 + .01; d += 4) { const p = cp(Math.min(d, c.d1)); p.c = c[1]; pts.push(p); if (d + 4 > c.d1 && d < c.d1) { const q = cp(c.d1); q.c = c[1]; pts.push(q); } }
    // cinta discontinua por corral: una por color para que no se mezclen
    for (const c of CORR) { const seg = pts.filter(p => p.c === c[1]); g.add(new THREE.Mesh(ribbon(seg, -HW + .3, HW - .3, .05), paint({ color: new THREE.Color(c[1]), roughness: .7 }))); }
    // círculo con la letra pintado al inicio de cada corral + rótulo en poste a ambos lados
    const pole = new THREE.CylinderGeometry(.05, .05, 3.2, 6).translate(0, 1.6, 0), pm = api.concrete(0x2a2d31), poles = [];
    for (const c of CORR) {
      const tex = api.canvasTex(256, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(w / 2, h / 2, 124, 0, 6.3); x.fill(); x.fillStyle = c[1]; x.beginPath(); x.arc(w / 2, h / 2, 110, 0, 6.3); x.fill();
        x.fillStyle = '#fff'; x.font = `900 ${c[0] ? 170 : 62}px Arial`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(c[0] || c[3], w / 2, h / 2 + 8); });
      const p = cp(c.d0 + 7); placeOn(new THREE.Mesh(flat(5, 5), paint({ map: tex, transparent: true, depthWrite: false, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })), p, 0, .07);
      const sm = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: .5, side: THREE.FrontSide, roughness: .6 });
      const q = cp(c.d0 + 1); for (const s of [1, -1]) { const [x, z] = at(q, s * (HW + .9)); poles.push([x, q.y, z, 0]); for (const r of [0, Math.PI]) { const disc = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), sm); disc.position.set(x, q.y + 3.55, z); disc.rotation.y = yaw(q) + r; disc.translateZ(.02); g.add(disc); } }
      // línea transversal blanca entre corrales
      placeOn(new THREE.Mesh(flat(RW - .6, .3), white), cp(c.d0), 0, .075);
    }
    g.add(inst(pole, pm, poles));
  }
  // vallas con lona blanca y logo CAF a los dos lados de los corrales (y de la zona previa al arco)
  const texLona = api.canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#f4f4f2'; c.fillRect(0, 0, w, h); logoCAF(c, 22, 72, 58, true); c.fillStyle = '#0a4fa0'; c.fillRect(0, h - 10, w, 10); logo42(c, 200, 80, 22, '#0a4fa0', '#3aaa35'); });
  const lonaMat = new THREE.MeshStandardMaterial({ map: texLona, roughness: .8 }), lonaGeo = new THREE.BoxGeometry(2.35, 1.0, .05).translate(0, .62, 0);
  const legGeo = new THREE.BoxGeometry(.06, .12, .7).translate(0, .06, 0), legMat = api.concrete(0x30343a);
  { const L = [], LG = []; for (let d = 1.3; d < dEnd; d += 2.4) { const p = cp(d); for (const s of [1, -1]) { const [x, z] = at(p, s * (HW + .4)); L.push([x, p.y, z, yaw(p) + Math.PI / 2]); LG.push([x, p.y, z, yaw(p)]); } }
    // vallas en los primeros metros después del arco (público a la derecha, lado del parque)
    for (let km = .028; km < .075; km += .0024) { const p = rt(km); for (const s of [1, -1]) { const [x, z] = at(p, s * (HW + .4)); L.push([x, p.y, z, yaw(p) + Math.PI / 2]); LG.push([x, p.y, z, yaw(p)]); } }
    g.add(inst(lonaGeo, lonaMat, L), inst(legGeo, legMat, LG)); }

  // ── recta final: separador amarillo desde el km 41,815; jersey de concreto + reja verde-turquesa del parque a la DERECHA desde el 41,955; pendones morados a la izquierda desde el 41,985 ──
  const recta = []; for (let km = 41.815; km <= KM + 1e-6; km += .001) recta.push(rt(Math.min(km, KM)));
  for (let d = 4; d <= 120; d += 4) recta.push(cp(LB - d)); // sigue después de la meta hasta la zona de medallas
  // (19-nov) en el video la New Jersey y la reja arrancan junto a la cámara en f_0392 (índice 41,95) y no hay nada en f_0391 (41,88); el primer pendón asoma
  // unos 30 m más allá. El separador amarillo sí viene de antes (f_0390–f_0391).
  const RJ = 41.955, rectaJ = recta.slice(Math.round((RJ - 41.815) / .001));
  { const shape = new THREE.Shape(); shape.moveTo(-.3, 0); shape.lineTo(.3, 0); shape.lineTo(.3, .08); shape.lineTo(.12, .3); shape.lineTo(.08, .81); shape.lineTo(-.08, .81); shape.lineTo(-.12, .3); shape.lineTo(-.3, .08); shape.closePath();
    const jg = new THREE.ExtrudeGeometry(shape, { depth: 2.95, bevelEnabled: false }).translate(0, 0, -1.475), jm = api.concrete(0xa7a8a2, { roughness: .95 }), J = [];
    let acc = 0; for (let i = 1; i < rectaJ.length; i++) { acc += Math.hypot(rectaJ[i].x - rectaJ[i - 1].x, rectaJ[i].z - rectaJ[i - 1].z); if (acc >= 3) { acc = 0; const p = rectaJ[i]; const [x, z] = at(p, -(HW + .55)); J.push([x, p.y, z, yaw(p)]); } }
    g.add(inst(jg, jm, J));
    // murete + reja de malla verde-turquesa con postes
    const texReja = api.canvasTex(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#1f8a7c'; c.lineWidth = 3; for (let x = 0; x <= w; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y <= h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } c.lineWidth = 8; c.beginPath(); c.moveTo(0, 2); c.lineTo(w, 2); c.stroke(); });
    texReja.wrapS = THREE.RepeatWrapping; const rm = new THREE.MeshStandardMaterial({ map: texReja, transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .6, metalness: .3 });
    g.add(new THREE.Mesh(wall(rectaJ, -(HW + 2.2), .45, 2.3, 1.2), rm), new THREE.Mesh(wall(rectaJ, -(HW + 2.2), 0, .45, 3), api.concrete(0xc8c4b8, { side: THREE.DoubleSide })));
    const pg = new THREE.BoxGeometry(.08, 2.8, .08).translate(0, 1.4, 0), pmat = api.concrete(0x1f8a7c, { roughness: .5 }), PP = []; acc = 0;
    for (let i = 1; i < rectaJ.length; i++) { acc += Math.hypot(rectaJ[i].x - rectaJ[i - 1].x, rectaJ[i].z - rectaJ[i - 1].z); if (acc >= 2.5) { acc = 0; const p = rectaJ[i], [x, z] = at(p, -(HW + 2.2)); PP.push([x, p.y, z, yaw(p)]); } }
    g.add(inst(pg, pmat, PP));
    // separador amarillo a la izquierda + postes de alumbrado con pendones morados (como en el video del recorrido)
    g.add(new THREE.Mesh(ribbon(recta, HW, HW + .5, .12), paint({ color: 0xf2c400 })));
    const texPend = api.canvasTex(128, 384, (c, w, h) => { c.fillStyle = '#5a2d91'; c.fillRect(0, 0, w, h); c.fillStyle = '#C1F938'; c.fillRect(0, h - 40, w, 12); c.fillStyle = '#fff'; c.save(); c.translate(w / 2, h * .42); c.rotate(-Math.PI / 2); c.font = 'italic 900 52px Arial'; c.textAlign = 'center'; c.fillText('42KCAF', 0, 18); c.restore(); c.font = '800 18px Arial'; c.textAlign = 'center'; c.fillText('CARACAS', w / 2, h - 56); });
    const pendM = new THREE.MeshStandardMaterial({ map: texPend, side: THREE.DoubleSide, roughness: .8 }), pendG = new THREE.PlaneGeometry(.75, 2.2), postG = new THREE.CylinderGeometry(.09, .13, 8, 6).translate(0, 4, 0), postM = api.concrete(0x6d7277, { roughness: .5, metalness: .4 });
    const PO = [], PE = []; for (let km = 41.985; km < KM; km += .036) { const p = rt(km), [x, z] = at(p, HW + 1.1); PO.push([x, p.y, z, 0]); const [x2, z2] = at(p, HW + 1.1 - .45); PE.push([x2, p.y + 5.2, z2, yaw(p)]); }
    g.add(inst(postG, postM, PO), inst(pendG, pendM, PE));
  }

  // ── público y personas (figuras de baja resolución instanciadas: cuerpo + cabeza) ──
  const people = [];
  const crowd = (p, lat0, lat1, n) => { for (let i = 0; i < n; i++) { const lat = lat0 + (lat1 - lat0) * rnd(), [x, z] = at(p, lat); people.push([x, p.y, z, yaw(p) + (lat > 0 ? -Math.PI / 2 : Math.PI / 2) + (rnd() - .5) * .8]); } };
  // vallas negras bajas a la izquierda de la recta (últimos ~170 m) con público detrás
  { const texV = api.canvasTex(128, 64, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#16181b'; c.fillRect(0, 0, w, 6); c.fillRect(0, h - 6, w, 6); c.fillRect(0, 0, 6, h); c.fillRect(w - 6, 0, 6, h); for (let x = 12; x < w - 6; x += 9) c.fillRect(x, 0, 3, h); });
    const vg = new THREE.PlaneGeometry(2.3, 1.0).translate(0, .62, 0), vm = new THREE.MeshStandardMaterial({ map: texV, transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .5, metalness: .6 }), V = [];
    for (let km = 42.02; km < KM - .004; km += .0024) { const p = rt(km), [x, z] = at(p, HW + .75); V.push([x, p.y, z, yaw(p) + Math.PI / 2]); if (rnd() < .85) crowd(p, HW + 1.3, HW + 3.8, 2); }
    g.add(inst(vg, vm, V)); }
  // público del lado del parque, detrás de la reja verde
  for (let km = 41.96; km < KM; km += .003) crowd(rt(km), -(HW + 2.7), -(HW + 5.5), rnd() < .6 ? 2 : 1);
  // público frente al arco de salida (a la derecha) y de noche junto a los corrales
  for (let km = .03; km < .075; km += .003) crowd(rt(km), -(HW + 1.0), -(HW + 3.5), 2);
  for (let d = D0; d < 80; d += 3) crowd(cp(d), -(HW + 1.0), -(HW + 3), 1);

  // ── tarima de premiación con telón de patrocinantes (zona de llegada, lado del parque) ──
  { const p = cp(LB - 70), t = new THREE.Group(), dark = api.concrete(0x23262a);
    const texTelon = api.canvasTex(1024, 512, (c, w, h) => { c.fillStyle = '#123a8c'; c.fillRect(0, 0, w, h); const items = ['CAF', '42KCAF', 'MERCANTIL', 'NESTLÉ', 'MOVISTAR', 'GATORADE', 'adidas', '★'];
      for (let r = 0; r < 6; r++) for (let k = 0; k < 5; k++) { const s = items[(r * 3 + k) % items.length], x = 110 + k * 200 + (r % 2) * 50, y = 50 + r * 82; if (s === 'CAF') logoCAF(c, x - 50, y + 22, 52, false, '#fff', '#7fd36b'); else if (s === '★') star(c, x, y + 4, 28); else if (s === '42KCAF') logo42(c, x, y + 20, 30, '#fff', '#C1F938'); else { c.fillStyle = '#fff'; c.font = '800 30px Arial'; c.textAlign = 'center'; c.fillText(s, x, y + 14); } } });
    const plat = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 5), dark); plat.position.y = .6; t.add(plat);
    const tel = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, .2), [dark, dark, dark, dark, dark, led(texTelon, .25, .9)]); tel.position.set(0, 1.2 + 2.25, 2.4); t.add(tel);
    for (const k of [-1, 1]) { const tr = new THREE.Mesh(new THREE.BoxGeometry(.4, 6.6, .4), api.concrete(0x9aa0a6, { metalness: .6, roughness: .4 })); tr.position.set(k * 5.2, 3.3, 2.4); t.add(tr); }
    const top = new THREE.Mesh(new THREE.BoxGeometry(10.8, .4, .4), api.concrete(0x9aa0a6, { metalness: .6, roughness: .4 })); top.position.set(0, 6.5, 2.4); t.add(top);
    const podM = api.concrete(0xf2f2f2); [[0, 1.0], [-1.6, .7], [1.6, .5]].forEach(([x, h]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.5, h, 1.2), podM); b.position.set(x, 1.2 + h / 2, .6); t.add(b); });
    const [x, z] = at(p, -(HW + 9)); t.position.set(x, p.y, z); t.rotation.y = yaw(p) - Math.PI / 2; g.add(t);
    for (let i = 0; i < 4; i++) crowd(cp(LB - 70 + (i - 1.5) * 4), -(HW + 2.5), -(HW + 5), 6);
  }
  // carpas blancas de servicios (guardarropa, hidratación, primeros auxilios) entre los corrales y la meta, del lado del río
  { const cg = new THREE.ConeGeometry(2.4, 1.3, 4).rotateY(Math.PI / 4).translate(0, 3.05, 0), lg = new THREE.CylinderGeometry(.05, .05, 2.4, 4).translate(0, 1.2, 0), cm = api.concrete(0xf6f6f4), C1 = [], C2 = [];
    for (let d = dEnd + 30; d < LB - 140; d += 22) { const p = cp(d), [x, z] = at(p, HW + 5); C1.push([x, p.y, z, yaw(p)]); for (const [a, b] of [[1.6, 1.6], [-1.6, 1.6], [1.6, -1.6], [-1.6, -1.6]]) C2.push([x + a, p.y, z + b, 0]); }
    g.add(inst(cg, cm, C1), inst(lg, api.concrete(0xcfd2d6), C2)); }

  // figuras: piernas oscuras + torso (color por instancia) y cabeza aparte
  { const legs = new THREE.BoxGeometry(.34, .84, .2).translate(0, .42, 0), torso = new THREE.BoxGeometry(.42, .62, .24).translate(0, 1.15, 0);
    const body = mergeColored(THREE, [[legs, .22], [torso, 1]]), head = new THREE.OctahedronGeometry(.13).scale(1, 1.2, 1).translate(0, 1.62, 0);
    const shirts = [0xC6E832, 0xffffff, 0xe12229, 0x1f4fbf, 0x1a1a1a, 0xf8e100, 0xf0501e, 0xe8448f, 0x4dc4da, 0x7b3fa0, 0x3aa655], skins = [0x8d5a3b, 0xc68863, 0xe0ac85, 0x6b4128, 0xa86f4c];
    const list = people.map(t => { const s = .92 + rnd() * .16; return [t[0], t[1], t[2], t[3], s, s, s]; });
    const c1 = list.map(() => new THREE.Color(shirts[Math.floor(rnd() * shirts.length)])), c2 = list.map(() => new THREE.Color(skins[Math.floor(rnd() * skins.length)]));
    g.add(inst(body, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85 }), list, c1), inst(head, new THREE.MeshStandardMaterial({ roughness: .8 }), list, c2)); }

  return api.sombras(g);
}

// une geometrías con un color de vértice gris (0..1) por pieza: el color de instancia lo multiplica (torso = color de franela, piernas oscuras)
function mergeColored(THREE, parts) {
  const pos = [], nor = [], col = [];
  for (const [geo, v] of parts) { const gg = geo.index ? geo.toNonIndexed() : geo, p = gg.attributes.position, n = gg.attributes.normal; for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(v, v, v); } }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return out;
}
