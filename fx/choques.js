// fx/choques.js — auditoría: ¿hay algo atravesado en la calzada? (edificios, muros, terreno, piezas de hitos)
// No se carga en el juego. Se usa desde la consola del navegador con el juego abierto:
//   const m = await import('/fx/choques.js'); console.log(await m.default(window.__caf, 37.3, 42.2));
// Recorre la ruta cada 10 m y prueba segmentos horizontales de un punto al siguiente, a dos alturas (0,5 y 1,6 m) y tres carriles (eje y ±3 m). Cualquier malla que
// corte esos rayos está metida en el camino del corredor. No mira mallas instanciadas (árboles, corredores, conos).
// Devuelve un texto con los tramos agrupados: «km a–b · carriles · alturas · qué es · cuántos toques».
export default async function choques(c, km0, km1, o = {}) {
  const T3 = c.ctx.THREE, TOTAL = (c.D.ruta.x.length - 1) * c.D.ruta.step, sOf = c.ctx.sOfKm || (k => k / 42.195 * TOTAL), kmOf = c.ctx.kmOf || (s => s / TOTAL * 42.195);
  const rc = new T3.Raycaster(), a = new T3.Vector3(), b = new T3.Vector3(), d = new T3.Vector3(), sp = new T3.Sphere(), mid = new T3.Vector3();
  const pt = s => { const p = c.P(Math.max(0, Math.min(TOTAL - 1, s))); return { x: p.x, y: p.y, z: p.z, tx: p.tx, tz: p.tz }; };
  const raiz = n => { let t = n; while (t.parent && t.parent !== c.scene) t = t.parent; return t; };
  const desc = n => { const m = Array.isArray(n.material) ? n.material[0] : n.material, r = raiz(n); return [n.name || r.name || '', n.geometry.type.replace('Geometry', ''), m.type.replace('Mesh', '').replace('Material', ''), m.color ? '#' + m.color.getHexString() : '', 'r' + c.scene.children.indexOf(r)].join('/'); };
  const paso = o.paso || 80, hits = [];
  window.requestAnimationFrame = () => 0; if (!c.S.running && c.start) c.start(); c.S.paused = true;
  for (let s0 = sOf(km0); s0 < sOf(km1); s0 += paso) {
    c.seek(s0 + paso / 2); for (let i = 0; i < 8; i++) { c.cuadro(performance.now()); await new Promise(r => setTimeout(r, 25)); }
    c.scene.updateMatrixWorld(true); const pts = []; for (let s = s0; s <= s0 + paso + 10; s += 10) pts.push(pt(s));
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9; for (const p of pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); } x0 -= 6; x1 += 6; z0 -= 6; z1 += 6; y0 += .2; y1 += 2.2;
    mid.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); const R = Math.hypot(x1 - x0, y1 - y0, z1 - z0) / 2, tri = [], quien = [];
    // sopa de triángulos del corredor: solo los que caen en la caja de este tramo (así cada rayo prueba cientos, no millones)
    c.scene.traverseVisible(n => { if (!n.isMesh || n.isInstancedMesh || n.isSkinnedMesh || !n.layers.mask || !n.geometry || !n.geometry.attributes.position) return; const m = Array.isArray(n.material) ? n.material[0] : n.material; if (!m || m.isShadowMaterial || m.visible === false || (m.transparent && m.opacity < .5) || m.depthWrite === false) return;
      const ge = n.geometry; if (!ge.boundingSphere) ge.computeBoundingSphere(); sp.copy(ge.boundingSphere).applyMatrix4(n.matrixWorld); if (!(sp.radius < 1e5) || sp.center.distanceTo(mid) > sp.radius + R) return;
      const P = ge.attributes.position; if (P.isInterleavedBufferAttribute) return; const A = P.array, e = n.matrixWorld.elements, nv = P.count, W = new Float32Array(nv * 3);
      for (let i = 0; i < nv; i++) { const x = A[i * 3], y = A[i * 3 + 1], z = A[i * 3 + 2]; W[i * 3] = e[0] * x + e[4] * y + e[8] * z + e[12]; W[i * 3 + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; W[i * 3 + 2] = e[2] * x + e[6] * y + e[10] * z + e[14]; }
      const I = ge.index ? ge.index.array : null, nt = (I ? I.length : nv) / 3;
      for (let k = 0; k < nt; k++) { const i0 = (I ? I[k * 3] : k * 3) * 3, i1 = (I ? I[k * 3 + 1] : k * 3 + 1) * 3, i2 = (I ? I[k * 3 + 2] : k * 3 + 2) * 3, ax = W[i0], ay = W[i0 + 1], az = W[i0 + 2], bx = W[i1], by = W[i1 + 1], bz = W[i1 + 2], cx = W[i2], cy = W[i2 + 1], cz = W[i2 + 2];
        if (Math.max(ax, bx, cx) < x0 || Math.min(ax, bx, cx) > x1 || Math.max(az, bz, cz) < z0 || Math.min(az, bz, cz) > z1 || Math.max(ay, by, cy) < y0 || Math.min(ay, by, cy) > y1) continue; tri.push(ax, ay, az, bx, by, bz, cx, cy, cz); quien.push(n); } });
    // segmento u→v contra cada triángulo (Möller–Trumbore, por las dos caras)
    const corta = (ux, uy, uz, vx, vy, vz) => { const dx = vx - ux, dy = vy - uy, dz = vz - uz; for (let k = 0, o = 0; k < quien.length; k++, o += 9) { const e1x = tri[o + 3] - tri[o], e1y = tri[o + 4] - tri[o + 1], e1z = tri[o + 5] - tri[o + 2], e2x = tri[o + 6] - tri[o], e2y = tri[o + 7] - tri[o + 1], e2z = tri[o + 8] - tri[o + 2];
        const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz; if (det > -1e-9 && det < 1e-9) continue; const inv = 1 / det, sx = ux - tri[o], sy = uy - tri[o + 1], sz = uz - tri[o + 2], uu = (sx * px + sy * py + sz * pz) * inv; if (uu < 0 || uu > 1) continue;
        const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x, vv = (dx * qx + dy * qy + dz * qz) * inv; if (vv < 0 || uu + vv > 1) continue; const tt = (e2x * qx + e2y * qy + e2z * qz) * inv; if (tt >= 0 && tt <= 1) return quien[k]; } return null; };
    for (let i = 0; i < paso / 10 && i + 1 < pts.length && s0 + i * 10 < TOTAL - 12; i++) { const p = pts[i], q = pts[i + 1];
      for (const off of [0, 3, -3]) for (const h of [.5, 1.6]) { const n = corta(p.x + p.tz * off, p.y + h, p.z - p.tx * off, q.x + q.tz * off, q.y + h, q.z - q.tx * off); if (n) hits.push([+kmOf(s0 + i * 10).toFixed(2), off, h, desc(n)]); } }
  }
  const g = []; hits.sort((x, y) => x[3] < y[3] ? -1 : x[3] > y[3] ? 1 : x[0] - y[0]);
  for (const [k, off, h, ds] of hits) { const u = g[g.length - 1]; if (u && u.ds === ds && k - u.b <= .04) { u.b = k; u.n++; u.off.add(off); u.h.add(h); } else g.push({ a: k, b: k, ds, n: 1, off: new Set([off]), h: new Set([h]) }); }
  g.sort((x, y) => x.a - y.a);
  return g.map(u => `${u.a.toFixed(2)}–${u.b.toFixed(2)} · ${[...u.off].sort().join(',')} · h${[...u.h].sort().join(',')} · ${u.ds} · ${u.n}`).join('\n') || 'sin choques';
}
