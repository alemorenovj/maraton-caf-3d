// Puntos de animación del Maratón CAF: tarimas pequeñas con cornetas, pendón de fondo y banderas, y público de pie detrás de vallas negras bajas.
// Fuentes: build/investigacion/dia_de_carrera.md §5 (más de 50–60 puntos de animación de marcas y clubes: Cacique Runners, Calvario Runners, Peca Run…;
// público detrás de vallas metálicas negras en varias filas) y mapas/mapa_animacion_2024/2025.jpg. Aquí van 12 puntos con sentido en el recorrido.
export const meta = { id: 'animacion', nombre: 'Puntos de animación y público', quita: [] };

// km, lado (1 = izquierda, -1 = derecha), texto del pendón, color de fondo, color del texto, color de las banderas
const PUNTOS = [
  [0.10, 1, ['¡VAMOS', 'CARACAS!'], '#204DA2', '#ffffff', '#C1F938'],
  [2.95, -1, ['CALVARIO', 'RUNNERS'], '#1b1b1b', '#f5d50a', '#f5d50a'],
  [8.30, -1, ['CACIQUE', 'RUNNERS'], '#b3261e', '#ffffff', '#ffffff'],
  [12.70, -1, ['PECA', 'RUN'], '#5a2d91', '#ffffff', '#C1F938'],
  [17.25, -1, ['LOS PRÓCERES', '¡FUERZA!'], '#0f6b3a', '#ffffff', '#f5d50a'],
  [21.10, -1, ['MEDIO', 'MARATÓN'], '#47AB48', '#ffffff', '#204DA2'],
  [25.10, -1, ['LAS MERCEDES', 'TE APOYA'], '#e8448f', '#ffffff', '#ffffff'],
  [31.20, 1, ['MACARACUAY', 'RETORNO'], '#f06a1e', '#ffffff', '#1b1b1b'],
  [37.30, -1, ['ALTAMIRA', '¡YA CASI!'], '#0a4fa0', '#ffffff', '#4DC4DA'],
  [38.00, -1, ['CHACAO', 'CORRE'], '#3aa655', '#ffffff', '#ffffff'],
  [41.30, -1, ['PLAZA', 'VENEZUELA'], '#e12229', '#ffffff', '#f5d50a'],
  [41.88, -1, ['¡ÚLTIMOS', '300 m!'], '#003C60', '#C1F938', '#C1F938'],
];

export function build(THREE, api) {
  const g = new THREE.Group(), RW = api.ROAD_W, HW = RW / 2, tun = api.D.tuneles || [];
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
  const M = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1) => { _e.set(0, ry, 0); _q.setFromEuler(_e); return _m.compose(_v.set(x, y, z), _q, _s.set(sx, sy, sz)); };
  const inst = (geo, mat, list, colors) => { const im = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((t, i) => { im.setMatrixAt(i, M(...t)); if (colors) im.setColorAt(i, colors[i]); }); im.instanceMatrix.needsUpdate = true; im.computeBoundingBox?.(); im.computeBoundingSphere?.(); return im; };
  const at = (p, lat) => [p.x + p.lx * lat, p.z + p.lz * lat], yaw = p => Math.atan2(p.tx, p.tz), R = km => api.routeAt(km);
  let seed = 3131; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const atlas = (mat, cols, rows, extra = '') => { const sx = (1 / cols).toFixed(6), sy = (1 / rows).toFixed(6);
    mat.onBeforeCompile = sh => { sh.vertexShader = 'attribute vec2 aOff;\n' + sh.vertexShader.replace('#include <uv_vertex>', `#include <uv_vertex>
      #ifdef USE_MAP
        vMapUv = vMapUv * vec2(${sx}, ${sy}) + aOff;
      #endif
      #ifdef USE_EMISSIVEMAP
        vEmissiveMapUv = vEmissiveMapUv * vec2(${sx}, ${sy}) + aOff;
      #endif`); };
    mat.customProgramCacheKey = () => `anim-atlas${cols}x${rows}${extra}`; return mat; };
  const offAttr = (geo, n, cols, rows, cellOf) => { const a = new Float32Array(n * 2); for (let i = 0; i < n; i++) { const k = cellOf(i); a[i * 2] = (k % cols) / cols; a[i * 2 + 1] = 1 - (Math.floor(k / cols) + 1) / rows; } geo.setAttribute('aOff', new THREE.InstancedBufferAttribute(a, 2)); return geo; };

  // atlas de los 12 pendones de fondo (4×3 celdas)
  const AC = 4, AR = 3, PW = 512, PH = 256;
  const texBan = api.canvasTex(AC * PW, AR * PH, c => PUNTOS.forEach((pt, i) => { const x0 = (i % AC) * PW, y0 = Math.floor(i / AC) * PH; c.save(); c.translate(x0, y0);
    c.fillStyle = pt[3]; c.fillRect(0, 0, PW, PH); c.fillStyle = pt[5]; c.fillRect(0, PH - 26, PW, 12); c.fillRect(0, 12, PW, 6);
    c.fillStyle = pt[4]; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'italic 900 70px Arial'; c.fillText(pt[2][0], PW / 2, 84); c.font = 'italic 900 64px Arial'; c.fillText(pt[2][1], PW / 2, 160);
    c.font = 'italic 900 22px Arial'; c.fillText('42KCAF · MARATÓN CAF', PW / 2, 210); c.restore(); }));
  // atlas de banderas tipo pluma (una por punto)
  const FC = 12, FW = 64, FH = 256;
  const texFlag = api.canvasTex(FC * FW, FH, c => PUNTOS.forEach((pt, i) => { c.save(); c.translate(i * FW, 0); c.fillStyle = pt[5]; c.beginPath(); c.moveTo(FW - 2, FH); c.lineTo(FW - 2, 20); c.quadraticCurveTo(FW - 6, 2, 30, 3); c.quadraticCurveTo(2, 14, 2, 60); c.lineTo(9, FH - 30); c.closePath(); c.fill();
    c.fillStyle = pt[3]; c.save(); c.translate(FW / 2, FH / 2 + 14); c.rotate(-Math.PI / 2); c.font = 'italic 900 22px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('42KCAF', 0, 0); c.restore(); c.restore(); }));
  const texSpk = api.canvasTex(64, 96, (c, w, h) => { c.fillStyle = '#151515'; c.fillRect(0, 0, w, h); c.fillStyle = '#2c2c2c'; c.beginPath(); c.arc(w / 2, h * .66, 22, 0, 6.3); c.fill(); c.fillStyle = '#090909'; c.beginPath(); c.arc(w / 2, h * .66, 9, 0, 6.3); c.fill(); c.fillStyle = '#2c2c2c'; c.beginPath(); c.arc(w / 2, h * .2, 10, 0, 6.3); c.fill(); });
  const texValla = api.canvasTex(128, 64, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#16181b'; c.fillRect(0, 0, w, 6); c.fillRect(0, h - 6, w, 6); c.fillRect(0, 0, 6, h); c.fillRect(w - 6, 0, 6, h); for (let x = 12; x < w - 6; x += 9) c.fillRect(x, 0, 3, h); });

  const plat = [], banners = [], banIdx = [], posts = [], truss = [], leds = [], spk = [], flags = [], flagIdx = [], fpole = [], vallas = [], ppl = [];
  // nada sobre la franja de 13 m de otra pasada de la ruta (retorno en U, vuelta por la otra calzada de la misma avenida): a menos de
  // HW + 0,5 m de su eje no van vallas, público ni banderas, y la tarima se pasa al otro lado si el suyo cae sobre la otra pasada
  const RR = api.D.ruta, otra = (x, z, km) => { const s0 = api.sOfKm(km), m = HW + .5; for (let i = 0; i < RR.x.length - 1; i++) { if (Math.abs(i * RR.step - s0) < 40) continue; const ax = RR.x[i], az = RR.z[i]; if (Math.abs(ax - x) > m + 10 || Math.abs(az - z) > m + 10) continue;
    const ux = RR.x[i + 1] - ax, uz = RR.z[i + 1] - az, t = Math.max(0, Math.min(1, ((x - ax) * ux + (z - az) * uz) / (ux * ux + uz * uz || 1))); if (Math.hypot(ax + ux * t - x, az + uz * t - z) < m) return true; } return false; };
  PUNTOS.forEach((pt, i) => {
    const K = pt[0]; let s = pt[1]; if (tun.some(t => K > t.km0 - .06 && K < t.km3 + .03)) return;
    { const p0 = R(K); if (otra(...at(p0, s * (HW + 5.6)), K) && !otra(...at(p0, -s * (HW + 5.6)), K)) s = -s; }
    const reja = K > 41.8, p = R(K), LS = s * (HW + (reja ? 8 : 5.6)), // en la recta final la tarima va detrás de la reja del parque (la pone salida_meta)
      [x, z] = at(p, LS), face = yaw(p) + (s > 0 ? -Math.PI / 2 : Math.PI / 2); // tarima de frente a la calzada
    // tarima 5 × 3,5 m, 0,8 m de alto
    plat.push([x, p.y, z, yaw(p)]);
    const [bx, bz] = at(p, LS + s * 1.6); banners.push([bx, p.y + .8 + 1.55, bz, face]); banIdx.push(i);
    for (const d of [-2.55, 2.55]) { posts.push([bx + p.tx * d, p.y, bz + p.tz * d, 0]); }
    truss.push([bx, p.y + 3.25, bz, yaw(p)]); leds.push([bx - p.lx * s * .25, p.y + 3.05, bz - p.lz * s * .25, yaw(p)]);
    // cornetas apiladas en las esquinas delanteras
    for (const d of [-2.2, 2.2]) for (const h of [0, .82]) { const [sx, sz] = at(p, LS - s * 1.3); spk.push([sx + p.tx * d, p.y + .8 + h, sz + p.tz * d, face + (d > 0 ? -.25 : .25) * s]); }
    // animadores sobre la tarima
    for (let k = 0; k < 2; k++) { const [ax, az] = at(p, LS - s * .2); ppl.push([ax + p.tx * (k ? 1 : -1.1), p.y + .8, az + p.tz * (k ? 1 : -1.1), face, k ? 0x1b1b1b : 0xf8e100]); }
    // banderas tipo pluma a los lados de la tarima
    for (const d of [-.004, .0045, .009]) { const q = R(K + d), [fx, fz] = at(q, s * (HW + (reja ? 2.7 : 1.2))); if (otra(fx, fz, K + d)) continue; fpole.push([fx, q.y, fz, 0]); flags.push([fx, q.y, fz, yaw(q) + Math.PI]); flagIdx.push(i); }
    // vallas negras y público: lado de la tarima (≈44 m) y lado opuesto (≈22 m)
    for (const [side, k0, k1, n] of [[s, -.026, .022, 2.3], [-s, -.014, .012, 1.6]]) {
      for (let km = K + k0; km < K + k1; km += .0024) { const q = R(km), [vx, vz] = at(q, side * (HW + .7)), tras = reja && side === s; if (!tras && !otra(vx, vz, km)) vallas.push([vx, q.y, vz, yaw(q) + Math.PI / 2]);
        // detrás de la tarima no hay público
        let c = n * (1 + (rnd() - .5) * .6); while (c > 0) { if (rnd() < c) { const lat = side * (HW + (tras ? 2.7 : 1.25) + rnd() * 2.6), q2 = R(km + rnd() * .0024); if (!(side === s && Math.abs(km - K) < .0035 && Math.abs(lat) > HW + (tras ? 4.6 : 2.5))) { const [px, pz] = at(q2, lat), pr = [px, q2.y, pz, yaw(q2) + (side > 0 ? -Math.PI / 2 : Math.PI / 2) + (rnd() - .5) * .9]; if (!otra(px, pz, km)) ppl.push(pr); } } c -= 1; } } }
  });

  const dark = api.concrete(0x24272b), metal = api.concrete(0x9aa0a6, { metalness: .6, roughness: .4 });
  g.add(inst(new THREE.BoxGeometry(3.5, .8, 5.2).translate(0, .4, 0), dark, plat));
  const banGeo = offAttr(new THREE.PlaneGeometry(5, 2.5), banners.length, AC, AR, k => banIdx[k]);
  const banMat = atlas(api.glow(0xffffff, { dia: .12, noche: .9, mat: { roughness: .8, side: THREE.DoubleSide } }), AC, AR, 'ban'); banMat.map = texBan; banMat.emissiveMap = texBan; banMat.needsUpdate = true;
  g.add(inst(banGeo, banMat, banners));
  g.add(inst(new THREE.CylinderGeometry(.06, .06, 3.4, 5, 1, true).translate(0, 1.7, 0), metal, posts));
  g.add(inst(new THREE.BoxGeometry(.3, .3, 5.4), metal, truss));
  g.add(inst(new THREE.BoxGeometry(.08, .08, 5), api.glow(0x8fd8ff, { dia: .4, noche: 2.4 }), leds));
  g.add(inst(new THREE.BoxGeometry(.55, .8, .5).translate(0, .4, 0), [dark, dark, dark, dark, new THREE.MeshStandardMaterial({ map: texSpk, roughness: .7 }), dark], spk));
  const flagGeo = offAttr(new THREE.PlaneGeometry(.75, 3).translate(-.4, 1.9, 0), flags.length, FC, 1, k => flagIdx[k]);
  const flagMat = atlas(new THREE.MeshStandardMaterial({ map: texFlag, transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .8 }), FC, 1, 'flag');
  g.add(inst(flagGeo, flagMat, flags), inst(new THREE.CylinderGeometry(.025, .03, 3.5, 4, 1, true).translate(0, 1.75, 0), api.concrete(0x2b2b2b), fpole));
  g.add(inst(new THREE.PlaneGeometry(2.3, 1.0).translate(0, .62, 0), new THREE.MeshStandardMaterial({ map: texValla, transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .5, metalness: .6 }), vallas));

  // público: piernas oscuras + torso de color (por instancia) y cabeza aparte
  { const shirts = [0xC6E832, 0xffffff, 0xe12229, 0x1f4fbf, 0x1a1a1a, 0xf8e100, 0xf0501e, 0xe8448f, 0x4dc4da, 0x7b3fa0, 0x3aa655, 0x8a8f96], skins = [0x8d5a3b, 0xc68863, 0xe0ac85, 0x6b4128, 0xa86f4c];
    const body = mergeColored(THREE, [[new THREE.BoxGeometry(.34, .84, .2).translate(0, .42, 0), .22], [new THREE.BoxGeometry(.42, .62, .24).translate(0, 1.15, 0), 1]]);
    const head = new THREE.OctahedronGeometry(.13).scale(1, 1.2, 1).translate(0, 1.62, 0);
    const list = ppl.map(t => { const sc = .9 + rnd() * .18; return [t[0], t[1], t[2], t[3], sc, sc, sc]; });
    const cols = ppl.map(t => new THREE.Color(t[4] ?? shirts[Math.floor(rnd() * shirts.length)]));
    const bodyM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85 }), headM = new THREE.MeshStandardMaterial({ roughness: .8 });
    const bm = inst(body, bodyM, list, cols), hm = inst(head, headM, list, ppl.map(() => new THREE.Color(skins[Math.floor(rnd() * skins.length)])));
    g.add(bm, hm);
    // el público salta un poco (rebote barato: solo se mueve la malla entera por grupos de fase)
    const base = list.map(t => t[1]), ph = list.map(() => rnd() * 6.28), amp = list.map(() => rnd() < .35 ? .12 : 0), mtx = new THREE.Matrix4(); let acc = 0;
    api.onFrame(st => { acc += st.dt; if (acc < .08) return; acc = 0; for (let i = 0; i < list.length; i++) { if (!amp[i]) continue; const t = list[i], y = base[i] + Math.max(0, Math.sin(st.t * 7 + ph[i])) * amp[i]; mtx.copy(M(t[0], y, t[2], t[3], t[4], t[5], t[6])); bm.setMatrixAt(i, mtx); hm.setMatrixAt(i, mtx); } bm.instanceMatrix.needsUpdate = true; hm.instanceMatrix.needsUpdate = true; });
  }
  return api.sombras(g);
}

function mergeColored(THREE, parts) {
  const pos = [], nor = [], col = [];
  for (const [geo, v] of parts) { const gg = geo.index ? geo.toNonIndexed() : geo, p = gg.attributes.position, n = gg.attributes.normal; for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(v, v, v); } }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return out;
}
