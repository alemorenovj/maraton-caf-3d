// Señalización de la ruta del Maratón CAF: carteles de km 1–42, pendones "CALLE CERRADA" en postes y conos en los giros cerrados.
// Fuentes: build/investigacion/dia_de_carrera.md §3 y fotos/mapas/senalizacion_km_y_servicios_2024.jpg (cartel vertical 1:1,5, azul #204DA2,
// logo 42KCAF arriba, número blanco, triángulos verde lima y turquesa abajo a la izquierda, franja blanca con CAF y la estrella de la Alcaldía).
// Altura y lado no están documentados: poste a la DERECHA, ~3 m de alto (decisión del encargo).
export const meta = { id: 'senalizacion', nombre: 'Señalización: km, calle cerrada y conos', quita: [] };

export function build(THREE, api) {
  const g = new THREE.Group(), RW = api.ROAD_W, HW = RW / 2, KM = api.KM, D = api.D;
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
  const M = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) => { _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); return _m.compose(_v.set(x, y, z), _q, _s.set(sx, sy, sz)); };
  const inst = (geo, mat, list) => { const im = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((t, i) => im.setMatrixAt(i, M(...t))); im.instanceMatrix.needsUpdate = true; im.computeBoundingBox?.(); im.computeBoundingSphere?.(); return im; };
  const at = (p, lat) => [p.x + p.lx * lat, p.z + p.lz * lat], yaw = p => Math.atan2(p.tx, p.tz);
  const tun = D.tuneles || [], enTunel = km => tun.some(t => km > t.km0 - .02 && km < t.km3 + .02);
  let seed = 913; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // nada sobre la franja de 13 m de otra pasada de la ruta (retorno en U, vuelta por la otra calzada de la misma avenida)
  const RR = D.ruta, otra0 = (x, z, km, m = HW + .3) => { const s0 = api.sOfKm(km); for (let i = 0; i < RR.x.length - 1; i++) { if (Math.abs(i * RR.step - s0) < 15 || Math.abs((i + 1) * RR.step - s0) < 15) continue; const ax = RR.x[i], az = RR.z[i]; if (Math.abs(ax - x) > m + 10 || Math.abs(az - z) > m + 10) continue;
    const ux = RR.x[i + 1] - ax, uz = RR.z[i + 1] - az, t = Math.max(0, Math.min(1, ((x - ax) * ux + (z - az) * uz) / (ux * ux + uz * uz || 1))); if (Math.hypot(ax + ux * t - x, az + uz * t - z) < m) return true; } return false; };
  // ni sobre los tramos del 21K que el 42K no pisa (el retorno de Los Ilustres y Las Acacias hasta La Previsora: api.distConector, de game.js)
  const otra = (x, z, km, m = HW + .3) => otra0(x, z, km, m) || (api.distConector ? api.distConector(x, z) < m + 4.5 : false);

  // material con atlas: cada instancia elige su celda con el atributo aOff (esquina inferior izquierda de la celda en UV)
  const atlas = (mat, cols, rows) => { const sx = (1 / cols).toFixed(6), sy = (1 / rows).toFixed(6);
    mat.onBeforeCompile = sh => { sh.vertexShader = 'attribute vec2 aOff;\n' + sh.vertexShader.replace('#include <uv_vertex>', `#include <uv_vertex>
      #ifdef USE_MAP
        vMapUv = vMapUv * vec2(${sx}, ${sy}) + aOff;
      #endif
      #ifdef USE_EMISSIVEMAP
        vEmissiveMapUv = vEmissiveMapUv * vec2(${sx}, ${sy}) + aOff;
      #endif`); };
    mat.customProgramCacheKey = () => `atlas${cols}x${rows}`; return mat; };

  // ── 1. carteles de km: un atlas de 8×6 celdas con los 42 números ──
  const COLS = 8, ROWS = 6, CW = 192, CH = 288;
  const texKm = api.canvasTex(COLS * CW, ROWS * CH, (c) => {
    for (let k = 1; k <= 42; k++) { const i = k - 1, x0 = (i % COLS) * CW, y0 = Math.floor(i / COLS) * CH;
      c.save(); c.translate(x0, y0); c.fillStyle = '#204DA2'; c.fillRect(0, 0, CW, CH);
      // logo 42KCAF con la línea de El Ávila
      c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(56, 34); c.lineTo(78, 20); c.lineTo(90, 30); c.lineTo(106, 14); c.lineTo(122, 28); c.lineTo(138, 22); c.stroke();
      c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = 'italic 900 26px Arial'; c.fillText('42KCAF', CW / 2, 58); c.font = '700 10px Arial'; c.fillText('CARACAS', CW / 2, 71);
      // número + K
      const big = k < 10 ? 122 : 104; c.font = `900 ${big}px Arial`; c.textBaseline = 'alphabetic'; const nw = c.measureText(String(k)).width; c.font = '900 46px Arial'; const kw = c.measureText('K').width;
      const xs = CW / 2 - (nw + kw + 4) / 2; c.textAlign = 'left'; c.font = `900 ${big}px Arial`; c.fillText(String(k), xs, 186); c.font = '900 46px Arial'; c.fillText('K', xs + nw + 4, 186);
      // triángulos decorativos abajo a la izquierda
      c.fillStyle = '#C1F938'; c.beginPath(); c.moveTo(0, 214); c.lineTo(34, 248); c.lineTo(0, 248); c.fill(); c.fillStyle = '#4DC4DA'; c.beginPath(); c.moveTo(14, 248); c.lineTo(46, 216); c.lineTo(58, 248); c.fill();
      c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(24, 206, 10, 0, 6.3); c.fill();
      // franja blanca de patrocinantes: CAF y la estrella roja
      c.fillStyle = '#fff'; c.fillRect(0, 248, CW, 40); c.font = '900 22px Arial'; c.fillStyle = '#0a4fa0'; c.fillText('C', 44, 276); c.fillStyle = '#3aaa35'; c.fillText('AF', 60, 276);
      c.fillStyle = '#ccc'; c.fillRect(CW / 2 + 4, 254, 2, 28); c.fillStyle = '#e12229'; c.beginPath(); for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? 5 : 11; c.lineTo(140 + Math.cos(a) * r, 268 + Math.sin(a) * r); } c.fill();
      c.restore(); }
  });
  { const SW = 1.2, SH = 1.8, Y0 = 1.25, signs = [], posts = [];
    for (let k = 1; k <= 42; k++) { const p = api.routeAt(k), [x, z] = at(p, -(HW + 1.3)); signs.push([x, p.y + Y0 + SH / 2, z, yaw(p) + Math.PI]);
      for (const s of [-1, 1]) { const ox = x + p.tx * 0 + p.lx * s * (SW / 2 - .08), oz = z + p.lz * s * (SW / 2 - .08); posts.push([ox, p.y, oz, 0]); } }
    const geo = new THREE.BoxGeometry(SW, SH, .05), off = new Float32Array(42 * 2);
    for (let i = 0; i < 42; i++) { off[i * 2] = (i % COLS) / COLS; off[i * 2 + 1] = 1 - (Math.floor(i / COLS) + 1) / ROWS; }
    geo.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 2));
    const mat = api.glow(0xffffff, { dia: 0, noche: .55, mat: { roughness: .55 } }); mat.map = texKm; mat.emissiveMap = texKm; mat.needsUpdate = true; atlas(mat, COLS, ROWS);
    g.add(inst(geo, mat, signs));
    g.add(inst(new THREE.CylinderGeometry(.04, .04, Y0 + SH + .05, 6).translate(0, (Y0 + SH + .05) / 2, 0), api.concrete(0x9aa1a8, { metalness: .6, roughness: .4 }), posts));
  }

  // ── 1b. carteles verdes del 21K (#47AB48, logo 21KCAF) donde el medio maratón ya no comparte el km con el 42K: del 17 a la meta.
  // Están siempre en la calle, como en la carrera real (sobre la ruta compuesta api.ruta21; su P devuelve la Y del mundo)
  { const R21 = api.ruta21; if (R21) { const SW = 1.2, SH = 1.8, Y0 = 1.25, poste = new THREE.CylinderGeometry(.04, .04, Y0 + SH + .05, 6).translate(0, (Y0 + SH + .05) / 2, 0), pm = api.concrete(0x9aa1a8, { metalness: .6, roughness: .4 }), posts = [];
    for (let k = 17; k <= 21; k++) { const p = R21.P(R21.sOfKm(k), {}), q = { x: p.x, y: p.y, z: p.z, tx: p.tx, tz: p.tz, lx: p.tz, lz: -p.tx }, [x, z] = at(q, -(HW + 1.3));
      const tx = api.canvasTex(CW, CH, c => { c.fillStyle = '#47AB48'; c.fillRect(0, 0, CW, CH); c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(56, 34); c.lineTo(78, 20); c.lineTo(90, 30); c.lineTo(106, 14); c.lineTo(122, 28); c.lineTo(138, 22); c.stroke();
        c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = 'italic 900 26px Arial'; c.fillText('21KCAF', CW / 2, 58); c.font = '700 10px Arial'; c.fillText('CARACAS', CW / 2, 71);
        c.font = '900 104px Arial'; const nw = c.measureText(String(k)).width; c.font = '900 46px Arial'; const kw = c.measureText('K').width, xs = CW / 2 - (nw + kw + 4) / 2; c.textAlign = 'left'; c.font = '900 104px Arial'; c.fillText(String(k), xs, 186); c.font = '900 46px Arial'; c.fillText('K', xs + nw + 4, 186);
        c.fillStyle = '#C1F938'; c.beginPath(); c.moveTo(0, 214); c.lineTo(34, 248); c.lineTo(0, 248); c.fill(); c.fillStyle = '#4DC4DA'; c.beginPath(); c.moveTo(14, 248); c.lineTo(46, 216); c.lineTo(58, 248); c.fill();
        c.fillStyle = '#fff'; c.fillRect(0, 248, CW, 40); c.font = '900 22px Arial'; c.fillStyle = '#0a4fa0'; c.fillText('C', 44, 276); c.fillStyle = '#3aaa35'; c.fillText('AF', 60, 276); });
      const m = api.glow(0xffffff, { dia: 0, noche: .55, mat: { roughness: .55 } }); m.map = tx; m.emissiveMap = tx; m.needsUpdate = true;
      const s = new THREE.Mesh(new THREE.BoxGeometry(SW, SH, .05), m); s.position.set(x, p.y + Y0 + SH / 2, z); s.rotation.y = yaw(q) + Math.PI; g.add(s);
      for (const sd of [-1, 1]) posts.push([x + q.lx * sd * (SW / 2 - .08), p.y, z + q.lz * sd * (SW / 2 - .08), 0]); }
    g.add(inst(poste, pm, posts)); } }

  // ── 2. pendones "MARATÓN CAF · CALLE CERRADA" en postes, cada ~150 m, alternando lados ──
  const texPend = api.canvasTex(128, 384, (c, w, h) => { c.fillStyle = '#1b3f95'; c.fillRect(0, 0, w, h); c.fillStyle = '#C1F938'; c.fillRect(0, 0, w, 8); c.fillRect(0, h - 8, w, 8);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '800 17px Arial'; c.fillText('MARATÓN', w / 2, 38); c.font = 'italic 900 30px Arial'; c.fillText('CAF', w / 2, 70);
    c.fillStyle = '#e12229'; c.fillRect(10, 96, w - 20, 104); c.fillStyle = '#fff'; c.font = '900 26px Arial'; c.fillText('CALLE', w / 2, 140); c.fillText('CERRADA', w / 2, 174);
    c.font = '700 15px Arial'; c.fillText('DOMINGO', w / 2, 236); c.font = '900 30px Arial'; c.fillText('8 FEB', w / 2, 270); c.font = '700 14px Arial'; c.fillText('5:00 a 12:30', w / 2, 300);
    c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(34, 340); c.lineTo(52, 326); c.lineTo(62, 336); c.lineTo(76, 322); c.lineTo(94, 338); c.stroke(); c.font = 'italic 900 13px Arial'; c.fillText('42KCAF', w / 2, 360); });
  { const poles = [], arms = [], bans = [], PH = 7, BW = .62, BH = 1.85;
    let k = 0; for (let km = .15; km < KM - .4; km += .15, k++) { if (enTunel(km)) continue; const p = api.routeAt(km); let side = k % 2 ? 1 : -1; if (otra(...at(p, side * (HW + 1.9)), km)) side = -side; const lat = side * (HW + 1.9), [x, z] = at(p, lat); if (otra(x, z, km)) continue;
      poles.push([x, p.y, z, 0]); const [bx, bz] = at(p, lat - side * .42); for (const r of [0, Math.PI]) bans.push([bx, p.y + 3.4 + BH / 2, bz, yaw(p) + r]);
      for (const hy of [3.4 + BH]) arms.push([x - p.lx * side * .21, p.y + hy, z - p.lz * side * .21, yaw(p) + Math.PI / 2]); }
    g.add(inst(new THREE.CylinderGeometry(.075, .11, PH, 6, 1, true).translate(0, PH / 2, 0), api.concrete(0x8c9196, { metalness: .5, roughness: .45, side: THREE.DoubleSide }), poles));
    g.add(inst(new THREE.BoxGeometry(.42, .035, .035), api.concrete(0x5f6469), arms));
    g.add(inst(new THREE.PlaneGeometry(BW, BH).translate(0, 0, .005), new THREE.MeshStandardMaterial({ map: texPend, roughness: .85 }), bans));
  }

  // ── 3. conos naranja en los giros cerrados (lado interior, al borde de la calzada) ──
  { const turns = []; let cur = null;
    for (let km = .12; km < KM - .45; km += .005) { if (enTunel(km)) { cur = null; continue; } const a = api.routeAt(km - .02), b = api.routeAt(km + .02); let d = Math.atan2(b.tz, b.tx) - Math.atan2(a.tz, a.tx); d = Math.atan2(Math.sin(d), Math.cos(d));
      if (Math.abs(d) > .6) { if (!cur || km - cur.k1 > .03) { cur = { k0: km, k1: km, max: 0, apex: km }; turns.push(cur); } cur.k1 = km; if (Math.abs(d) > cur.max) { cur.max = Math.abs(d); cur.apex = km; } } }
    const texCono = api.canvasTex(64, 128, (c, w, h) => { c.fillStyle = '#ff6a10'; c.fillRect(0, 0, w, h); c.fillStyle = '#f4f4f4'; c.fillRect(0, h * .3, w, h * .14); c.fillRect(0, h * .55, w, h * .1); });
    const cone = new THREE.ConeGeometry(.16, .7, 7, 1, true).translate(0, .37, 0), base = new THREE.PlaneGeometry(.4, .4).rotateX(-Math.PI / 2).translate(0, .025, 0), C1 = [], C2 = [];
    for (const t of turns) { const p = api.routeAt(t.apex), q = api.routeAt(t.apex + .02), side = (q.tx * p.lx + q.tz * p.lz) > 0 ? 1 : -1; // hacia dónde gira: lado interior
      const half = Math.min(.03, Math.max(.018, (t.k1 - t.k0) / 2 + .01));
      for (let km = t.apex - half; km <= t.apex + half + 1e-6; km += .004) { const r = api.routeAt(km), [x, z] = at(r, side * (HW + .25)), c1 = [x, r.y, z, rnd() * 3], c2 = [x, r.y, z, rnd() * 3]; if (otra(x, z, km)) continue; C1.push(c1); C2.push(c2); } }
    g.add(inst(cone, new THREE.MeshStandardMaterial({ map: texCono, roughness: .6 }), C1), inst(base, api.concrete(0xff5a00), C2));
  }
  return api.sombras(g);
}
