// fx/fusion.js — rendimiento: fusiona las piezas ESTÁTICAS de los hitos y zonas en pocas mallas por material y celda.
// Un hito hecho a mano son cientos de cajas sueltas: cada una es una llamada de dibujo, y se repite en la pasada de sombras
// y en la de oclusión ambiental. Aquí se cosen en una sola malla por (material, celda de 96 m), sin cambiar cómo se ve.
//
// Qué NO se toca (queda como estaba):
//  · lo que se mueve o se enciende: se detecta sacando una foto, llamando a los «onFrame» de los módulos con dos estados
//    distintos (día/noche, otro tiempo) y comparando posición, giro, escala, visibilidad y material de cada objeto;
//  · mallas instanciadas, con esqueleto, con morph, con onBeforeRender propio o con matrixAutoUpdate apagado;
//  · materiales transparentes (dependen del orden de dibujo), ShaderMaterial y los que traen su propio onBeforeCompile
//    (pueden depender de la posición local del objeto);
//  · cualquier objeto con userData.noFusion = true (y todo lo que cuelga de él).
// Se apaga con ?fusion=0.

const ATR = ['position', 'normal', 'uv', 'uv1', 'uv2', 'color', 'tangent'];

export function fusionar(THREE, roots, tick, o = {}) {
  const CELDA = o.celda || 96, t0 = performance.now();
  const st = { mallasAntes: 0, mallasDespues: 0, fusionadas: 0, creadas: 0, dinamicos: 0, exc: {} };
  const exc = k => { st.exc[k] = (st.exc[k] || 0) + 1; return false; };
  const OBR = THREE.Object3D.prototype.onBeforeRender, OAR = THREE.Object3D.prototype.onAfterRender;

  // ── 1. qué se mueve ──
  const snap = new Map(), dyn = new Set();
  const lee = n => [n.position.x, n.position.y, n.position.z, n.quaternion.x, n.quaternion.y, n.quaternion.z, n.quaternion.w, n.scale.x, n.scale.y, n.scale.z, n.visible ? 1 : 0];
  for (const r of roots) r.traverse(n => { snap.set(n, { v: lee(n), m: n.material }); if (n.isMesh) st.mallasAntes++; });
  const compara = () => { for (const r of roots) r.traverse(n => { const a = snap.get(n); if (!a) { dyn.add(n); return; } const b = lee(n); for (let i = 0; i < 11; i++) if (Math.abs(a.v[i] - b[i]) > 1e-7) { dyn.add(n); break; } if (a.m !== n.material) dyn.add(n); }); };
  try { tick({ noche: 1, t: 3.7, dt: .037 }); compara(); tick({ noche: 0, t: 12.9, dt: .041 }); compara(); tick({ noche: .5, t: 31.4, dt: .029 }); compara(); } catch (e) { console.warn('fusion: sin detección de movimiento', e); return st; }
  st.dinamicos = dyn.size;

  const matOk = m => m && !m.transparent && !m.isShaderMaterial && !Object.prototype.hasOwnProperty.call(m, 'onBeforeCompile') && !m.userData.noFusion;
  const geoOk = g => { if (!g || !g.attributes || !g.attributes.position) return exc('sinGeo'); if (Object.keys(g.morphAttributes || {}).length) return exc('morph'); if (g.drawRange.start !== 0 || g.drawRange.count !== Infinity) return exc('drawRange');
    for (const k in g.attributes) { const a = g.attributes[k]; if (!ATR.includes(k)) return exc('atributo:' + k); if (a.isInterleavedBufferAttribute || a.normalized || !(a.array instanceof Float32Array)) return exc('formato'); } return true; };
  const firma = g => ATR.filter(k => g.attributes[k]).map(k => k + g.attributes[k].itemSize).join(',');

  const M = new THREE.Matrix4(), N3 = new THREE.Matrix3(), v = new THREE.Vector3(), c = new THREE.Vector3(), vacias = new Set(), vivas = new Set();
  for (const root of roots) {
    if (dyn.has(root) || !root.visible || root.userData.noFusion) continue;
    root.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), cubos = new Map(), cand = [];
    const baja = n => { if (n !== root && (dyn.has(n) || !n.visible || n.userData.noFusion)) return; if (!n.matrixAutoUpdate) { exc('matrizManual'); return; }
      if (n.isMesh) { if (n.isInstancedMesh || n.isSkinnedMesh || n.isBatchedMesh) exc('instanciada'); else if (n.onBeforeRender !== OBR || n.onAfterRender !== OAR || n.customDepthMaterial) exc('gancho'); else if (geoOk(n.geometry)) cand.push(n); }
      for (const h of n.children) baja(h); };
    baja(root);
    for (const n of cand) {
      const g = n.geometry, multi = Array.isArray(n.material), nIdx = g.index ? g.index.count : g.attributes.position.count;
      const partes = multi ? g.groups.map(q => ({ mat: n.material[q.materialIndex], a: q.start, b: Math.min(nIdx, q.start + q.count) })) : [{ mat: n.material, a: 0, b: nIdx }];
      if (!partes.length) { exc('sinGrupos'); continue; } if (!partes.every(p => matOk(p.mat))) { exc('material'); continue; }
      if (!g.boundingBox) g.computeBoundingBox(); const L = new THREE.Matrix4().multiplyMatrices(inv, n.matrixWorld); g.boundingBox.getCenter(c).applyMatrix4(L);
      const ix = Math.floor(c.x / CELDA), iz = Math.floor(c.z / CELDA), f = firma(g); if (!g.boundingSphere) g.computeBoundingSphere();
      // pieza chica / mediana / grande en cubos aparte: así el detalle se puede dejar de dibujar de lejos sin apagar el volumen
      const rp = g.boundingSphere.radius * L.getMaxScaleOnAxis(), talla = rp < 4 ? 0 : rp < 16 ? 1 : 2;
      for (const p of partes) { const k = [p.mat.uuid, n.castShadow ? 1 : 0, n.receiveShadow ? 1 : 0, n.renderOrder, n.layers.mask, f, ix, iz, talla].join('|'); let q = cubos.get(k); if (!q) cubos.set(k, q = { mat: p.mat, n, ix, iz, rp: 0, partes: [] }); q.rp = Math.max(q.rp, rp); q.partes.push({ n, g, L, a: p.a, b: p.b, multi }); }
    }
    const quitar = new Set();
    for (const q of cubos.values()) {
      if (q.partes.length < 2 && !q.partes[0].multi) continue;
      let nv = 0, ni = 0; for (const p of q.partes) { nv += p.g.attributes.position.count; ni += p.b - p.a; }
      const g0 = q.partes[0].g, nombres = ATR.filter(k => g0.attributes[k]), arr = {}; for (const k of nombres) arr[k] = new Float32Array(nv * g0.attributes[k].itemSize);
      const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni), cx = (q.ix + .5) * CELDA, cz = (q.iz + .5) * CELDA; let ov = 0, oi = 0;
      for (const p of q.partes) {
        const A = p.g.attributes, n = A.position.count, flip = p.L.determinant() < 0; N3.getNormalMatrix(p.L);
        for (const k of nombres) { const src = A[k].array, is = A[k].itemSize, dst = arr[k], o0 = ov * is;
          if (k === 'position') for (let i = 0; i < n; i++) { v.fromArray(src, i * 3).applyMatrix4(p.L); dst[o0 + i * 3] = v.x - cx; dst[o0 + i * 3 + 1] = v.y; dst[o0 + i * 3 + 2] = v.z - cz; }
          else if (k === 'normal') for (let i = 0; i < n; i++) { v.fromArray(src, i * 3).applyMatrix3(N3).normalize(); if (flip) v.negate(); v.toArray(dst, o0 + i * 3); }
          else if (k === 'tangent') for (let i = 0; i < n; i++) { v.fromArray(src, i * 4).transformDirection(p.L); v.toArray(dst, o0 + i * 4); dst[o0 + i * 4 + 3] = src[i * 4 + 3] * (flip ? -1 : 1); }
          else dst.set(src.subarray(0, n * is), o0); }
        const I = p.g.index ? p.g.index.array : null;
        for (let i = p.a; i + 2 < p.b; i += 3) { const a = (I ? I[i] : i) + ov, b = (I ? I[i + 1] : i + 1) + ov, d = (I ? I[i + 2] : i + 2) + ov; idx[oi++] = a; idx[oi++] = flip ? d : b; idx[oi++] = flip ? b : d; }
        ov += n; quitar.add(p.n);
      }
      const G = new THREE.BufferGeometry(); for (const k of nombres) G.setAttribute(k, new THREE.BufferAttribute(arr[k], g0.attributes[k].itemSize)); G.setIndex(new THREE.BufferAttribute(oi === ni ? idx : idx.subarray(0, oi), 1)); G.computeBoundingBox(); G.computeBoundingSphere();
      const m = new THREE.Mesh(G, q.mat); m.name = 'fusion'; m.userData.radPieza = q.rp; m.position.set(cx, 0, cz); m.castShadow = q.n.castShadow; m.receiveShadow = q.n.receiveShadow; m.renderOrder = q.n.renderOrder; m.layers.mask = q.n.layers.mask; root.add(m); m.updateMatrix(); m.matrixAutoUpdate = false; m.updateMatrixWorld(true); st.creadas++;
    }
    for (const n of quitar) { vacias.add(n.geometry); st.fusionadas++; if (n.children.length) { n.layers.mask = 0; n.castShadow = false; } else if (n.parent) n.parent.remove(n); }
    root.traverse(n => { if (n.isMesh) { st.mallasDespues++; if (n.layers.mask) vivas.add(n.geometry); } });
  }
  for (const g of vacias) if (!vivas.has(g)) g.dispose();

  // ── 3. descarte por distancia ──
  // La cámara ve hasta 40 km: sin esto, cada cajita de un hito a 6 km (medio píxel) sigue costando una llamada de dibujo.
  // Cada pieza estática se apaga cuando queda más lejos que K veces su tamaño (mínimo MIN metros). El Ávila y las torres
  // grandes no se apagan nunca. Se apaga con layers (no con visible) para no tocar a los hijos ni chocar con los módulos.
  const LISTA = [], K = o.k || 220, MIN = o.min || 1000, s = new THREE.Sphere();
  for (const root of roots) { if (dyn.has(root) || !root.visible || root.userData.noFusion) continue; root.updateMatrixWorld(true);
    const baja = n => { if (n !== root && (dyn.has(n) || !n.visible || n.userData.noFusion)) return; if (!n.matrixAutoUpdate && n.name !== 'fusion') return;
      if (n.isMesh && n.layers.mask && n.geometry && n.geometry.attributes && n.geometry.attributes.position) {
        if (n.isInstancedMesh) { if (!n.boundingSphere) n.computeBoundingSphere(); s.copy(n.boundingSphere); } else { if (!n.geometry.boundingSphere) n.geometry.computeBoundingSphere(); s.copy(n.geometry.boundingSphere); }
        s.applyMatrix4(n.matrixWorld); const lim = Math.max(MIN, (n.userData.radPieza || s.radius) * K) + s.radius; if (isFinite(lim) && lim < 30000) LISTA.push({ n, x: s.center.x, z: s.center.z, l2: lim * lim, m: n.layers.mask, on: true }); }
      for (const h of n.children) baja(h); };
    baja(root); }
  st.descartables = LISTA.length;
  // rendimiento (CPU): las piezas estáticas no recalculan su matriz cada cuadro (three recorre y compone miles de matrices por cuadro)
  st.congelar = () => { let n = 0; for (const e of LISTA) { const o = e.n; o.updateMatrixWorld(true); o.matrixAutoUpdate = false; o.matrixWorldAutoUpdate = false; n++; } st.congeladas = n; };
  // ── 4. memoria: lo apagado suelta la GPU ──
  // Una pieza apagada sigue ocupando la GPU: three sube su geometría y sus texturas la primera vez que la dibuja y no las suelta (los hitos
  // traen ~260 texturas de canvas, ~200 MB). Cuando TODAS las piezas que usan una geometría o una textura quedan más lejos que lim · K2 + M2
  // (mem.hitoK / mem.hitoM en cull; lim = distancia a la que se apagan), se libera (dispose(): los datos siguen en JavaScript y three los vuelve
  // a subir al dibujarlos de nuevo). Solo recursos que no usa ningún objeto fuera de LISTA (lo que no se apaga nunca no debe re-subirse en
  // cada vuelta). Las geometrías soltadas llevan userData.gpuLibre (lo lee el arnés fx/memoria.js).
  const texDe = m => { const r = []; for (const mm of Array.isArray(m) ? m : [m]) { if (!mm) continue; for (const k in mm) { const t = mm[k]; if (t && t.isTexture && !t.isRenderTargetTexture) r.push(t); }
    if (mm.uniforms) for (const k in mm.uniforms) { const t = mm.uniforms[k] && mm.uniforms[k].value; if (t && t.isTexture && !t.isRenderTargetTexture) r.push(t); } } return [...new Set(r)]; };
  const usos = new Map(), suma = r => usos.set(r, (usos.get(r) || 0) + 1);
  for (const root of roots) root.traverse(n => { if (n.geometry) suma(n.geometry); if (n.material) texDe(n.material).forEach(suma); });
  const porR = new Map(), qDe = (r, tex) => { let q = porR.get(r); if (!q) porR.set(r, q = { r, tex, es: 0, lejos: 0, libre: false }); return q; };
  for (const e of LISTA) { e.qs = [qDe(e.n.geometry, false), ...texDe(e.n.material).map(t => qDe(t, true))]; for (const q of e.qs) q.es++; }
  const LIB = [...porR.values()].filter(q => q.es === usos.get(q.r)), enLIB = new Set(LIB); for (const e of LISTA) e.qs = e.qs.filter(q => enLIB.has(q));
  st.liberables = LIB.length; st.liberadas = 0;
  st.cull = (x, z, mem) => { let v = 0; const K2 = mem && mem.hitoK || 0, M2 = mem && mem.hitoM || 0, D2 = (mem && mem.hitoD || 1) ** 2;   // hitoD: fracción de la distancia de apagado (media/ligera la acortan: menos llamadas)
    for (const e of LISTA) { const dx = e.x - x, dz = e.z - z, d2 = dx * dx + dz * dz, on = d2 < e.l2 * D2;
      if (on !== e.on) { e.on = on; e.n.layers.mask = on ? e.m : 0; if (on) for (const q of e.qs) if (q.libre) { q.libre = false; if (!q.tex) q.r.userData.gpuLibre = false; } } if (on) v++;
      if (K2 && e.qs.length) { const r = Math.sqrt(e.l2) * K2 + M2, lejos = d2 > r * r; if (lejos !== !!e.lejos) { e.lejos = lejos; for (const q of e.qs) q.lejos += lejos ? 1 : -1; } } }
    if (K2) for (const q of LIB) if (!q.libre && q.lejos === q.es) { q.libre = true; q.r.dispose(); if (!q.tex) q.r.userData.gpuLibre = true; st.liberadas++; }
    // tirones: la textura de un hito se sube a la GPU el primer cuadro en que se ve, y una de canvas grande congela ese cuadro. Se sube antes,
    // de a UNA por llamada (cada 200 ms), cuando la pieza está a menos de 1,5 veces su distancia de encendido y aún no se ve.
    if (st.renderer && st.subeAntes) { const R = st.renderer, pr = R.properties;
      for (const e of LISTA) { if (e.on) continue; const dx = e.x - x, dz = e.z - z; if (dx * dx + dz * dz > e.l2 * D2 * 2.25) continue;
        const q = e.qs.find(q => q.tex && !(pr.get(q.r).__webglTexture)); if (q) { R.initTexture(q.r); q.libre = false; break; } } }
    return v; };
  st.ms = Math.round(performance.now() - t0);
  return st;
}
