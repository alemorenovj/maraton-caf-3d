// fx/urbano.js — desorden urbano caraqueño (realismo, ronda 2): postes de concreto con cableado aéreo que sigue la calle y la cruza,
// señales de tránsito y vallas. Lo que ya pone fx/calzada.js (faroles cada 36 m junto al brocal, semáforos de brazo, pórticos verdes,
// paradas, kioscos, bolardos, hidrantes) NO se repite: los postes de cables van al borde de fuera de la acera y a media distancia entre faroles.
//
// Costo fijo: DOS llamadas de dibujo en total (no proyectan sombra ni entran al pase de oclusión ambiental).
//  · «kit»: una sola malla instanciada con las tres piezas (poste, señal, valla); cada instancia muestra una y colapsa las otras en el
//    vértice (atributo aKit.x). Un atlas de canvas de 512² (señales y anuncios inventados, sin marcas reales).
//  · «cables»: tramo unitario con tres hilos combados (cintas en cruz), estirado por instancia de un poste al siguiente.
// Colocación por regla (no a mano): cada 36 m desfasado 18 m de los faroles, a ambos lados en calles con fachada residencial, comercial,
// casas, barrio o galpón; fuera de toda calzada (ctx.calzadaLibre), lejos de los conectores del 21K y de los hitos (ctx.quitado), nunca en
// túneles, bajo viaductos ni en elevados. Solo se llenan las instancias a menos de R m de la cámara (se rehace al moverse 20 m).
// ?realismo=0 lo apaga. Media: radio menor, sin cables cruzando la calle.
export const meta = { id: 'urbano', reemplaza: [] };

export function install(ctx) {
  if (ctx.realismo === false || (ctx.rx && !ctx.rx('urb'))) return;
  const { THREE, scene, D, Q, P, hT, Y } = ctx;
  const MEDIA = !!Q.media || !Q.alta, RAD = MEDIA ? 380 : 700, KCAP = MEDIA ? 160 : 320, CCAP = MEDIA ? 90 : 220;
  const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  // ───────── atlas 512²: fila 0 = tres señales + celda blanca; filas 1–3 = anuncios de valla (4:1) ─────────
  const atlas = ctx.canvasTex(512, 512, (g, w) => {
    const C = 128; g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, w);
    const disco = (cx, cy, r, f) => { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = f; g.fill(); };
    g.fillStyle = '#9a9c9a'; g.fillRect(0, 0, 3 * C, C);
    // PARE (octógono rojo)
    g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k + .5) / 8 * Math.PI * 2; g.lineTo(64 + Math.cos(a) * 60, 64 + Math.sin(a) * 60); } g.closePath(); g.fillStyle = '#f2f2f2'; g.fill();
    g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k + .5) / 8 * Math.PI * 2; g.lineTo(64 + Math.cos(a) * 54, 64 + Math.sin(a) * 54); } g.closePath(); g.fillStyle = '#c8191e'; g.fill();
    g.fillStyle = '#fff'; g.font = 'bold 34px Arial,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PARE', 64, 66);
    // prohibido estacionar
    disco(C + 64, 64, 60, '#c8191e'); disco(C + 64, 64, 49, '#1f4fa0'); g.strokeStyle = '#c8191e'; g.lineWidth = 11; g.beginPath(); g.moveTo(C + 30, 30); g.lineTo(C + 98, 98); g.stroke();
    g.fillStyle = '#fff'; g.font = 'bold 44px Arial,sans-serif'; g.fillText('E', C + 64, 66);
    // velocidad máxima
    disco(2 * C + 64, 64, 60, '#c8191e'); disco(2 * C + 64, 64, 47, '#f4f4f0'); g.fillStyle = '#111'; g.font = 'bold 50px Arial,sans-serif'; g.fillText('40', 2 * C + 64, 68);
    // anuncios (inventados)
    const ads = [['#0f6fb3', '#53b6e8', 'CLÍNICA 24 H', 'Emergencias · 0212-555-0000', '#fff'], ['#f2b705', '#f27d16', 'DELIVERY YA', 'Pide por WhatsApp', '#2a1600'], ['#1b7f4a', '#7cc46a', 'VIVE CARACAS', 'Tu ciudad, tu ritmo', '#fff']];
    ads.forEach(([a, b, t, s, fc], i) => { const y = (i + 1) * C, gr = g.createLinearGradient(0, y, w, y + C); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, y, w, C);
      g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(w * .82, y + C * .5, C * .55, 0, Math.PI * 2); g.fill();
      g.fillStyle = fc; g.textAlign = 'left'; g.font = 'bold 50px Arial,sans-serif'; g.fillText(t, 24, y + 52); g.font = '26px Arial,sans-serif'; g.fillText(s, 26, y + 98);
      g.strokeStyle = '#e8e8e8'; g.lineWidth = 6; g.strokeRect(3, y + 3, w - 6, C - 6); });
  });

  // ───────── geometría del kit (local: x a lo largo de la calle, z hacia la calzada, y arriba) ─────────
  const pos = [], nor = [], uv = [], col = [], kp = [], kf = [], idx = [];
  const vtx = (p, n, u, v, c, part, face) => { pos.push(...p); nor.push(...n); uv.push(u, v); col.push(...c); kp.push(part); kf.push(face); return pos.length / 3 - 1; };
  const quad = (a, b, c, d, n, cl, part, face = 0) => { const i0 = vtx(a, n, 0, 0, cl, part, face), i1 = vtx(b, n, 1, 0, cl, part, face), i2 = vtx(c, n, 1, 1, cl, part, face), i3 = vtx(d, n, 0, 1, cl, part, face); idx.push(i0, i1, i2, i0, i2, i3); };
  const box = (cx, cy, cz, hx, hy, hz, cl, part) => {
    const X0 = cx - hx, X1 = cx + hx, Y0 = cy - hy, Y1 = cy + hy, Z0 = cz - hz, Z1 = cz + hz;
    quad([X0, Y0, Z1], [X1, Y0, Z1], [X1, Y1, Z1], [X0, Y1, Z1], [0, 0, 1], cl, part); quad([X1, Y0, Z0], [X0, Y0, Z0], [X0, Y1, Z0], [X1, Y1, Z0], [0, 0, -1], cl, part);
    quad([X1, Y0, Z1], [X1, Y0, Z0], [X1, Y1, Z0], [X1, Y1, Z1], [1, 0, 0], cl, part); quad([X0, Y0, Z0], [X0, Y0, Z1], [X0, Y1, Z1], [X0, Y1, Z0], [-1, 0, 0], cl, part);
    quad([X0, Y1, Z1], [X1, Y1, Z1], [X1, Y1, Z0], [X0, Y1, Z0], [0, 1, 0], cl, part);
  };
  const cyl = (r0, r1, h, seg, cl, part) => { for (let s = 0; s < seg; s++) { const a0 = s / seg * Math.PI * 2, a1 = (s + 1) / seg * Math.PI * 2, n = [Math.cos((a0 + a1) / 2), 0, Math.sin((a0 + a1) / 2)];
    quad([Math.cos(a1) * r0, 0, Math.sin(a1) * r0], [Math.cos(a0) * r0, 0, Math.sin(a0) * r0], [Math.cos(a0) * r1, h, Math.sin(a0) * r1], [Math.cos(a1) * r1, h, Math.sin(a1) * r1], n, cl, part); } };
  const conc = [.66, .64, .6], metal = [.5, .52, .54], osc = [.22, .22, .23];
  // 0 · poste de concreto de 9,5 m con dos crucetas (perpendiculares a la calle) y un transformador gris
  cyl(.17, .1, 9.5, 6, conc, 0); box(0, 8.75, 0, .07, .07, .95, osc, 0); box(0, 8.05, 0, .06, .06, .7, osc, 0); box(0, 7.0, -.28, .2, .42, .2, metal, 0);
  // 1 · señal: tubo de 2,9 m y placa de 0,75 m mirando hacia quien viene (−x); el dorso gris
  cyl(.035, .035, 2.95, 5, metal, 1);
  quad([-.05, 2.15, -.375], [-.05, 2.15, .375], [-.05, 2.9, .375], [-.05, 2.9, -.375], [-1, 0, 0], [1, 1, 1], 1, 1);
  quad([-.035, 2.15, .375], [-.035, 2.15, -.375], [-.035, 2.9, -.375], [-.035, 2.9, .375], [1, 0, 0], metal, 1);
  // 2 · valla de 9 × 3 m sobre dos patas, la cara hacia la calzada (+z)
  box(-2.8, 3.1, 0, .16, 3.1, .16, metal, 2); box(2.8, 3.1, 0, .16, 3.1, .16, metal, 2); box(0, 7.7, -.12, 4.6, 1.6, .1, osc, 2);
  quad([-4.5, 6.2, 0], [4.5, 6.2, 0], [4.5, 9.2, 0], [-4.5, 9.2, 0], [0, 0, 1], [1, 1, 1], 2, 1);
  const kg = new THREE.BufferGeometry();
  kg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); kg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); kg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  kg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); kg.setAttribute('kp', new THREE.Float32BufferAttribute(kp, 1)); kg.setAttribute('kf', new THREE.Float32BufferAttribute(kf, 1)); kg.setIndex(idx);
  const aKit = new THREE.InstancedBufferAttribute(new Float32Array(KCAP * 4), 4); kg.setAttribute('aKit', aKit);
  const kitMat = new THREE.MeshLambertMaterial({ map: atlas, vertexColors: true });
  kitMat.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float kp; attribute float kf; attribute vec4 aKit;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\n vMapUv = kf > 0.5 ? aKit.yz + uv * vec2(aKit.w, 0.25) : vec2(0.875, 0.875);')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n if (abs(kp - aKit.x) > 0.5) transformed = vec3(0.0);');   // pieza que no toca: colapsada (triángulos degenerados)
  };
  kitMat.customProgramCacheKey = () => 'urbKit';
  const kit = new THREE.InstancedMesh(kg, kitMat, KCAP); kit.count = 0; kit.frustumCulled = false; kit.userData.noAO = true; kit.userData.mem = 'urbano'; scene.add(kit);

  // ───────── cables: tres hilos combados de x=0 a x=1 (cada uno, dos cintas en cruz de 3 cm) ─────────
  const cp = [], ci = [], SEG = 8;
  for (const [dz, dy] of [[-.8, 0], [0, -.05], [.8, 0]]) for (const cross of [0, 1]) {
    const b = cp.length / 3; for (let i = 0; i <= SEG; i++) { const t = i / SEG, sag = -.65 * 4 * t * (1 - t);
      if (cross) cp.push(t, dy + sag + .016, dz, t, dy + sag - .016, dz); else cp.push(t, dy + sag, dz - .016, t, dy + sag, dz + .016); }
    for (let i = 0; i < SEG; i++) { const a = b + i * 2; ci.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3)); cg.setIndex(ci);
  const cab = new THREE.InstancedMesh(cg, new THREE.MeshBasicMaterial({ color: 0x18191a, side: THREE.DoubleSide }), CCAP); cab.count = 0; cab.frustumCulled = false; cab.userData.noAO = true; cab.userData.mem = 'urbano'; scene.add(cab);

  // ───────── colocación (cuando ya existen calzada, foto base e hitos) ─────────
  const IT = [], SP = [];   // IT: [x, y, z, rot, parte, u0, v0, du]; SP: cables [ax, ay, az, bx, by, bz]
  const CELL = 100, grid = new Map(), gridC = new Map();
  const add = (map, k, i) => { let a = map.get(k); if (!a) map.set(k, a = []); a.push(i); };
  ctx.ready.push(() => {
    const V = D.via, paso = V.paso || .05, o = {}, r = mul(4711), CZ = typeof ctx.calzada === 'function' ? ctx.calzada : null;
    const libre = (x, z) => (!ctx.calzadaLibre || ctx.calzadaLibre(x, z)) && !(ctx.quitado && ctx.quitado(x, z)) && (!ctx.distConector || ctx.distConector(x, z) > 9);
    const urb = t => /residencial|comercial|casas|barrio|galp/.test(t || '');
    const malo = s => ctx.cubierto(s) || ctx.enElevado(s) || ctx.inTunnel(s);
    const prev = { 1: null, '-1': null };
    for (let s = 18; s < ctx.TOTAL - 18; s += 36) {
      const b = Math.max(0, Math.min(V.sep.length - 1, Math.round(ctx.kmOf(s) / paso)));
      if (malo(s) || !CZ) { prev[1] = prev[-1] = null; continue; }
      const c = CZ(s); P(s, o);
      for (const sd of [-1, 1]) {
        const tipo = sd < 0 ? V.R.tipo[b] : V.L.tipo[b], ac = sd < 0 ? c.aceraDer : c.aceraIzq;
        if (!urb(tipo) || (sd > 0 && MEDIA)) { prev[sd] = null; continue; }
        const d = sd < 0 ? -(c.der + Math.max(ac, .6) - .35) : (c.izq + Math.max(ac, .6) - .35), x = o.x + o.tz * d, z = o.z - o.tx * d;
        if (!libre(x, z)) { prev[sd] = null; continue; }
        const y = Math.min(o.y + .1, Y(hT(x, z)) - (ctx.GAP || .3) + .2) - .15, rot = Math.atan2(o.tx, o.tz) - Math.PI / 2;
        add(grid, Math.floor(x / CELL) + ',' + Math.floor(z / CELL), IT.length); IT.push([x, y, z, rot, 0, 0, 0, 0]);
        const p = [x, y + 8.75, z];
        if (prev[sd] && Math.hypot(p[0] - prev[sd][0], p[2] - prev[sd][2]) < 48) { add(gridC, Math.floor(x / CELL) + ',' + Math.floor(z / CELL), SP.length); SP.push([...prev[sd], ...p]); }
        prev[sd] = p;
      }
      // cable que cruza la calle cada ~4 postes (si hay poste a los dos lados)
      if (!MEDIA && prev[1] && prev[-1] && r() < .28 && Math.hypot(prev[1][0] - prev[-1][0], prev[1][2] - prev[-1][2]) < 46) { add(gridC, Math.floor(prev[1][0] / CELL) + ',' + Math.floor(prev[1][2] / CELL), SP.length); SP.push([...prev[-1], ...prev[1]]); }
      // señal de tránsito junto al brocal derecho, a media distancia entre faroles (cada ~150–250 m)
      if (r() < .18) { const ss = s - 9, cc = CZ(ss); P(ss, o); const d = -(cc.der + .55), x = o.x + o.tz * d, z = o.z - o.tx * d;
        if (!malo(ss) && libre(x, z)) { const t = (r() * 3) | 0; add(grid, Math.floor(x / CELL) + ',' + Math.floor(z / CELL), IT.length); IT.push([x, o.y + .12, z, Math.atan2(o.tx, o.tz) - Math.PI / 2, 1, t * .25, .75, .25]); } }
      // valla en terreno abierto (parque, muro/terreno, galpón), retirada de la vía y girada hacia quien viene, cada ~600 m
      if (r() < .06) { const tipo = V.R.tipo[b] || ''; if (/parque|muro|galp/.test(tipo)) { const d = -(c.der + Math.max(c.aceraDer, .6) + 7), x = o.x + o.tz * d, z = o.z - o.tx * d, ex = o.tx * 5, ez = o.tz * 5;
        if (libre(x, z) && libre(x + ex, z + ez) && libre(x - ex, z - ez) && ctx.nearRoute && !ctx.nearRoute(x, z, 9)) { const t = (r() * 3) | 0; add(grid, Math.floor(x / CELL) + ',' + Math.floor(z / CELL), IT.length); IT.push([x, Y(hT(x, z)) - (ctx.GAP || .3), z, Math.atan2(o.tx, o.tz) + Math.PI / 2 - .45, 2, 0, .5 - t * .25, 1]); } } }
    }
    ctx.urbStats = { piezas: IT.length, cables: SP.length };
    listo = true;
  });

  // ───────── reparto cerca de la cámara ─────────
  let listo = false; const last = new THREE.Vector3(1e9, 0, 0), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), vs = new THREE.Vector3(1, 1, 1), vp = new THREE.Vector3();
  function rebuild(cp) {
    last.copy(cp); const cx = Math.floor(cp.x / CELL), cz = Math.floor(cp.z / CELL), R2 = RAD * RAD, n = Math.ceil(RAD / CELL); let nk = 0, nc = 0;
    const kA = kit.instanceMatrix.array, aA = aKit.array, cA = cab.instanceMatrix.array;
    for (let a = -n; a <= n; a++) for (let b = -n; b <= n; b++) {
      const L = grid.get((cx + a) + ',' + (cz + b)); if (L) for (const i of L) { if (nk >= KCAP) break; const t = IT[i]; if ((t[0] - cp.x) ** 2 + (t[2] - cp.z) ** 2 > R2) continue;
        vp.set(t[0], t[1], t[2]); q.setFromEuler(e.set(0, t[3], 0)); m4.compose(vp, q, vs); m4.toArray(kA, nk * 16); aA.set([t[4], t[5], t[6], t[7]], nk * 4); nk++; }
      const C = gridC.get((cx + a) + ',' + (cz + b)); if (C) for (const i of C) { if (nc >= CCAP) break; const c = SP[i]; if ((c[3] - cp.x) ** 2 + (c[5] - cp.z) ** 2 > R2) continue;
        const dx = c[3] - c[0], dy = c[4] - c[1], dz = c[5] - c[2], h = Math.hypot(dx, dz) || 1, o = nc * 16;   // columnas: x = A→B (con la diferencia de altura), y = arriba, z = horizontal perpendicular
        cA[o] = dx; cA[o + 1] = dy; cA[o + 2] = dz; cA[o + 3] = 0; cA[o + 4] = 0; cA[o + 5] = 1; cA[o + 6] = 0; cA[o + 7] = 0; cA[o + 8] = -dz / h; cA[o + 9] = 0; cA[o + 10] = dx / h; cA[o + 11] = 0; cA[o + 12] = c[0]; cA[o + 13] = c[1]; cA[o + 14] = c[2]; cA[o + 15] = 1; nc++; }
    }
    kit.count = nk; cab.count = nc; kit.instanceMatrix.needsUpdate = cab.instanceMatrix.needsUpdate = aKit.needsUpdate = true;
  }
  if (ctx.rxt) ctx.rxt.urb = v => kit.visible = cab.visible = !!v;
  ctx.frameHooks.push(() => { if (!listo) return; const cp = ctx.camera.position; if (last.distanceToSquared(cp) > 400) rebuild(cp); });
}
