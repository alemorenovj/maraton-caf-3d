// fx/memoria.js — memoria del juego. No es un módulo de realismo (no está en fx/index.js): game.js lo carga solo con ?mem.
//   ?mem=1                         → contador discreto en pantalla (abajo a la izquierda), para depurar en un teléfono
//   ?mem=km0,km1[,paso[,cuadros[,vueltas]]] → recorre la ruta de km0 a km1 avanzando `paso` m (50) con `cuadros` cuadros (3) por paso
//                                    y escribe en la consola una línea «MEMORIA …» por km y una «MEMORIA FIN …» con los máximos.
//                                    vueltas = n: ida y vuelta n veces (para ver si la segunda pasada deja más memoria que la primera).
// Sin ventana: fx/memoria.sh "0,42.19,50,3" "&calidad=media". En la consola: (await import('/fx/memoria.js')).foto(window.__caf).
// Qué mide:
//   geo, tex, prog  renderer.info.memory.geometries / .textures y renderer.info.programs (lo que vive en la GPU)
//   mallas, vis     mallas en la escena y cuántas se dibujan (visibles, con capa activa)
//   tri             triángulos residentes: suma de todas las geometrías distintas que cuelgan de la escena (las de hitos con el búfer
//                   soltado, userData.gpuLibre, no cuentan); triVis, los de las mallas visibles; lejos, mallas visibles a más de 1,5 km
//   heap            performance.memory.usedJSHeapSize en MB (solo Chrome)

const bytesG = g => { let b = g.index ? g.index.array.byteLength : 0; for (const k in g.attributes) { const a = g.attributes[k]; b += a.array ? a.array.byteLength : 0; } return b; };
const bytesT = t => { const im = t.image || {}, w = im.width || (im.data && im.width) || 0, h = im.height || 0; return w * h * 4 * (t.generateMipmaps !== false && t.minFilter !== 1006 && t.minFilter !== 1003 ? 1.33 : 1); };
const triDe = g => { if (!g || !g.attributes || !g.attributes.position) return 0; return (g.index ? g.index.count : g.attributes.position.count) / 3; };

export function foto(c, o = {}) {
  const sc = c.scene, cam = c.camera, r = c.renderer, p = c.P(c.S.s), vistas = new Set(), vis = new Set(), v = new c.ctx.THREE.Vector3();
  sc.traverseVisible(n => { if ((n.isMesh || n.isLine || n.isPoints) && n.layers.test(cam.layers)) vis.add(n); });
  let mallas = 0, nVis = 0, tri = 0, triVis = 0, lejos = 0; const lista = o.lejos ? [] : null;
  sc.traverse(n => {
    if (!(n.isMesh || n.isLine || n.isPoints)) return; const g = n.geometry, t = n.isMesh ? triDe(g) : 0, es = vis.has(n);
    if (n.isMesh) mallas++;
    if (g && !vistas.has(g)) { vistas.add(g); if (!(g.userData && g.userData.gpuLibre)) tri += t; }
    if (!es) return; nVis++; triVis += n.isInstancedMesh ? t * n.count : t;
    if (g && !n.isInstancedMesh && n.frustumCulled !== false) { if (!g.boundingSphere) g.computeBoundingSphere(); v.copy(g.boundingSphere.center).applyMatrix4(n.matrixWorld);
      if (Math.hypot(v.x - p.x, v.z - p.z) > 1500 + g.boundingSphere.radius) { lejos++; if (lista) lista.push(n); } }
  });
  const m = r.info.memory, pm = performance.memory;
  const f = { geo: m.geometries, tex: m.textures, prog: (r.info.programs || []).length, mallas, vis: nVis, tri: Math.round(tri), triVis: Math.round(triVis), lejos, heap: pm ? Math.round(pm.usedJSHeapSize / 1048576) : null };
  if (lista) f.listaLejos = lista;
  return f;
}

// Desglose por origen: userData.mem de cada malla (mosaico18/19, calzada, edif-base, edif-det, …), «hito» si cuelga de un hito
// (ctx.HROOTS), «instanciada» u «otro:<material>». Por origen: mallas, geometrías distintas, cuántas están subidas a la GPU (gpu),
// triángulos residentes, texturas subidas (tex), visibles y visibles a > 1,5 km. «sinEscena» = lo que la GPU tiene y no cuelga de la escena
// (búferes de posproceso y sombras, entorno… o algo que se quitó sin liberar).
const enGPU = o => !!(o && o._listeners && o._listeners.dispose && o._listeners.dispose.length);   // three le pone un oyente «dispose» al subirla
export function desglose(c) {
  const sc = c.scene, cam = c.camera, p = c.P(c.S.s), roots = new Set(c.ctx.HROOTS || []), vis = new Set(), v = new c.ctx.THREE.Vector3(), out = {}, vistas = new Set(), texV = new Set();
  sc.traverseVisible(n => { if (n.layers.test(cam.layers)) vis.add(n); });
  const texs = m => { const r = []; if (!m) return r; for (const k in m) { const t = m[k]; if (t && t.isTexture) r.push(t); }
    for (const U of [m.uniforms, m.userData && m.userData.U]) if (U) for (const k in U) { const t = U[k] && U[k].value; if (t && t.isTexture) r.push(t); } return r; };
  let gGPU = 0, tGPU = 0;
  sc.traverse(n => {
    if (!n.geometry && !n.material) return; let k = n.userData.mem; if (!k) { let a = n; while (a && a !== sc && !roots.has(a)) a = a.parent; const m0 = Array.isArray(n.material) ? n.material[0] : n.material; k = a && a !== sc ? 'hito' : n.isInstancedMesh ? 'instanciada' : 'otro:' + (n.isSprite ? 'Sprite' : m0 ? m0.type.replace('Mesh', '').replace('Material', '') : n.type); }
    const o = out[k] || (out[k] = { mallas: 0, geo: 0, gpu: 0, gMB: 0, tri: 0, tex: 0, tMB: 0, vis: 0, lejos: 0, triLejos: 0 }), g = n.geometry; if (n.isMesh) o.mallas++;
    if (g && !vistas.has(g)) { vistas.add(g); if (enGPU(g)) { o.gpu++; gGPU++; o.gMB += bytesG(g) / 1048576; } if (!(g.userData && g.userData.gpuLibre)) { o.geo++; if (n.isMesh) o.tri += triDe(g); } }
    for (const m of Array.isArray(n.material) ? n.material : [n.material]) for (const t of texs(m)) if (!texV.has(t)) { texV.add(t); if (enGPU(t)) { o.tex++; tGPU++; o.tMB += bytesT(t) / 1048576; } }
    if (!n.isMesh || !vis.has(n)) return; o.vis++;
    if (g && !n.isInstancedMesh && n.frustumCulled !== false) { if (!g.boundingSphere) g.computeBoundingSphere(); v.copy(g.boundingSphere.center).applyMatrix4(n.matrixWorld);
      if (Math.hypot(v.x - p.x, v.z - p.z) > 1500 + g.boundingSphere.radius) { o.lejos++; o.triLejos += triDe(g); } }
  });
  for (const k in out) { const o = out[k]; o.tri = Math.round(o.tri); o.triLejos = Math.round(o.triLejos); o.gMB = +o.gMB.toFixed(1); o.tMB = +o.tMB.toFixed(1); }
  const mm = c.renderer.info.memory; out.sinEscena = { geo: mm.geometries - gGPU, tex: mm.textures - tGPU };
  return out;
}

const linea = f => `km=${f.km != null ? f.km.toFixed(2) : '-'} geo=${f.geo} tex=${f.tex} prog=${f.prog} mallas=${f.mallas} vis=${f.vis} tri=${f.tri} triVis=${f.triVis} lejos=${f.lejos} heap=${f.heap ?? '-'}`;
export { linea };

// Recorrido síncrono: en una página oculta los temporizadores se frenan, así que el arnés lleva el bucle (window.__caf.cuadro) y solo
// cede el turno con un MessageChannel entre pasos (para que lleguen los mosaicos que ya se pidieron).
export async function recorrer(c, o = {}) {
  const ctx = c.ctx, km0 = o.km0 ?? 0, km1 = o.km1 ?? 42.19, paso = o.paso || 50, n = o.cuadros || 3, vueltas = o.vueltas || 0, cada = o.cada || 1, log = o.log || (() => { });
  const raf = window.requestAnimationFrame; window.requestAnimationFrame = () => 0;   // el bucle lo lleva el arnés
  if (!c.S.running) c.start('tour'); c.S.paused = true; c.S.dia = true;
  const cede = () => new Promise(res => { const ch = new MessageChannel(); ch.port1.onmessage = () => res(); ch.port2.postMessage(0); });
  let t = performance.now() + 1000; const filas = [], max = {};
  const tramo = async (a, b, etiqueta) => {
    const s0 = ctx.sOfKm(a), s1 = ctx.sOfKm(b), dir = s1 >= s0 ? 1 : -1, nP = Math.max(1, Math.round(Math.abs(s1 - s0) / paso));
    let marca = null;
    for (let k = 0; k <= nP; k++) {
      const s = s0 + (s1 - s0) * k / nP; c.seek(s);
      for (let i = 0; i < n; i++) { t += 250; c.cuadro(t); }
      await cede();
      const km = ctx.kmOf(s), m = dir > 0 ? Math.floor(km / cada + 1e-6) : Math.ceil(km / cada - 1e-6);
      if (marca === null || m !== marca || k === nP) { marca = m; const f = { km, ...foto(c) }; if (etiqueta) f.vuelta = etiqueta; filas.push(f);
        for (const q of ['geo', 'tex', 'tri', 'mallas', 'heap']) if (f[q] != null) max[q] = Math.max(max[q] || 0, f[q]);
        log(f); }
    }
  };
  if (vueltas > 0) for (let v = 1; v <= vueltas; v++) { await tramo(km0, km1, v + 'i'); await tramo(km1, km0, v + 'v'); }
  else await tramo(km0, km1);
  if (o.reanudar) { window.requestAnimationFrame = raf; raf(c.cuadro); }   // por defecto el bucle queda en manos de quien llamó
  return { filas, max };
}

// Contador discreto en pantalla (?mem=1): se refresca cada segundo.
export function contador(c) {
  const d = document.createElement('div'); d.id = 'memC';
  d.style.cssText = 'position:fixed;left:6px;bottom:calc(6px + env(safe-area-inset-bottom));z-index:98;pointer-events:none;font:10px/1.3 ui-monospace,Menlo,monospace;color:#cfe;background:rgba(0,0,0,.55);padding:3px 6px;border-radius:5px;white-space:pre';
  document.body.appendChild(d);
  const tick = () => { try { const f = foto(c), km = c.ctx.kmOf(c.S.s); d.textContent = `km ${km.toFixed(1)} · ${c.Q.tier}\ngeo ${f.geo} tex ${f.tex} prog ${f.prog}\ntri ${(f.tri / 1e6).toFixed(2)}M vis ${f.vis}/${f.mallas}` + (f.heap != null ? `\nheap ${f.heap} MB` : ''); } catch (e) { d.textContent = 'mem: ' + e.message; } };
  tick(); return setInterval(tick, 1000);
}
