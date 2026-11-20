// fx/rmedir.js — llamadas de dibujo y triángulos de un cuadro completo (todos los pases) en varios km. Lo carga game.js con ?rmedir=km1,km2,…
// Escribe en la consola «RMEDIR <calidad> km <km> calls <n> tris <n>» por km y «RMEDIR FIN». Se usa para el presupuesto del realismo
// (comparar ?realismo=0 con lo normal). Sin ventana: fx/rmedir.sh "1,9.2,17" "&calidad=media".
export default async function medir(c, kms) {
  const raf = window.requestAnimationFrame; window.requestAnimationFrame = () => 0;   // el bucle lo lleva este arnés
  const cede = () => new Promise(res => { const ch = new MessageChannel(); ch.port1.onmessage = () => res(); ch.port2.postMessage(0); });
  const espera = ms => new Promise(res => setTimeout(res, ms));
  if (!c.S.running) c.start('tour'); c.S.paused = true; c.S.dia = true; c.S.cam = +(new URLSearchParams(location.search).get('cam') || 3);
  const r = c.renderer, info = r.info; let t = performance.now() + 1000;
  for (const km of kms) {
    c.seek(c.A.sOfKm(km));
    for (let i = 0; i < 24; i++) { t += 250; c.cuadro(t); await cede(); if (i % 6 === 5) await espera(400); }   // deja cargar mosaicos, calzada y edificios de detalle
    const filas = [];
    for (let i = 0; i < 4; i++) { info.autoReset = false; info.reset(); t += 16; c.cuadro(t); filas.push([info.render.calls, info.render.triangles]); info.autoReset = true; await cede(); }
    const med = filas.sort((a, b) => a[0] - b[0])[3];   // el máximo de 4 cuadros: en alta el GTAO se recalcula un cuadro sí y otro no (ese cuadro dibuja la escena dos veces)
    if (new URLSearchParams(location.search).get('rdbg')) { const cp = c.camera.position, p = c.P(c.S.s, {}); console.info('RMEDIR cam ' + [cp.x, cp.y, cp.z].map(v => v.toFixed(1)) + ' ruta ' + [p.x, p.y, p.z, p.tx, p.tz].map(v => (+v).toFixed(2)) + ' s ' + c.S.s); }
    console.info(`RMEDIR ${c.Q.tier}${c.ctx.realismo === false ? ' realismo=0' : ''} km ${km} calls ${med[0]} tris ${med[1]}`);
  }
  console.info('RMEDIR FIN'); window.requestAnimationFrame = raf;
}

// ───────── Tiempos reales (con GPU: panel del navegador, no swiftshader). Uso en la consola:
//   const m = await import('/fx/rmedir.js'); m.gpu(__caf, [1, 9.2, 22, 31, 36.3]).then(r => window.__rm = r);   // ms por cuadro, GPU forzada (pixel ratio 4 + readPixels)
//   m.cpu(__caf, [1, 9.2, 22, 31, 36.3]).then(r => window.__rm = r);   // ms de cuadro() sin esperar a la GPU + reparto por subsistema
//   m.recorrido(__caf, 0, 42.19).then(r => window.__rm = r);           // tirones: recorrido continuo a ~1,5 m por cuadro
const _med = a => { const b = a.slice().sort((x, y) => x - y); return b[b.length >> 1]; };
// espera sin setTimeout (en una pestaña oculta Chrome lo frena a 1 s o más): cede con MessageChannel hasta que pase el tiempo
const _cede = () => new Promise(res => { const ch = new MessageChannel(); ch.port1.onmessage = () => res(); ch.port2.postMessage(0); });
const _esp = async ms => { const fin = performance.now() + ms; do await _cede(); while (performance.now() < fin); };
function _arnes(c) { window.requestAnimationFrame = () => 0; if (!c.S.running && c.start) c.start('tour'); c.S.paused = true; return c.renderer || c.ctx.renderer; }
async function _calienta(c, km, t) { c.seek(c.ctx.A.sOfKm(km)); for (let i = 0; i < 25; i++) { t.v += 33; c.cuadro(t.v); await _esp(30); } }
export async function gpu(c, kms, { pr = 4, n = 20 } = {}) {
  const r = _arnes(c), gl = r.getContext(), px = new Uint8Array(4), pr0 = r.getPixelRatio(), out = {}, t = { v: performance.now() };
  r.setPixelRatio(pr); dispatchEvent(new Event('resize'));
  for (const km of kms) { await _calienta(c, km, t); const ms = [];
    for (let i = 0; i < n; i++) { gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const t0 = performance.now(); t.v += 33; c.cuadro(t.v); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); ms.push(performance.now() - t0); await _esp(5); }
    out[km] = +_med(ms).toFixed(1); }
  r.setPixelRatio(pr0); dispatchEvent(new Event('resize')); return out;
}
export async function cpu(c, kms, { n = 30 } = {}) {
  _arnes(c); const out = {}, t = { v: performance.now() };
  for (const km of kms) { await _calienta(c, km, t); const ms = []; const acc = {}; window.__cafPerf = acc;
    for (let i = 0; i < n; i++) { const t0 = performance.now(); t.v += 33; c.cuadro(t.v); ms.push(performance.now() - t0); await _esp(5); }
    window.__cafPerf = null; for (const k in acc) acc[k] = +(acc[k] / n).toFixed(2); out[km] = { med: +_med(ms).toFixed(2), sub: acc }; }
  return out;
}
export async function recorrido(c, km0, km1, { paso = 1.5, cede = 4 } = {}) {
  const r = _arnes(c), S = c.S, A = c.ctx.A, s1 = A.sOfKm(km1), t = { v: performance.now() }, lentos = [], durs = [];
  c.seek(A.sOfKm(km0)); for (let i = 0; i < 30; i++) { t.v += 33; c.cuadro(t.v); await _esp(20); }
  // espía de llamadas de GL caras (subida de texturas, mipmaps, búferes, compilación) para saber QUÉ causa cada tirón
  const gl = r.getContext(), GLT = {}, espia = n => { const f = gl[n]; if (!f || f.__esp) return; gl[n] = function (...a) { const t0 = performance.now(), v = f.apply(gl, a); const d = performance.now() - t0; const k = n === 'texImage2D' || n === 'texSubImage2D' ? n + (a.length > 6 ? ' ' + a[3] + 'x' + a[4] : (a[5] && a[5].width ? ' ' + a[5].width + 'x' + a[5].height : '')) : n; GLT[k] = (GLT[k] || 0) + d; return v; }; gl[n].__esp = 1; };
  ['texImage2D', 'texSubImage2D', 'texStorage2D', 'generateMipmap', 'bufferData', 'bufferSubData', 'linkProgram', 'getProgramParameter', 'compileShader', 'drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced', 'useProgram', 'bindVertexArray'].forEach(espia);
  const heap = () => performance.memory ? performance.memory.usedJSHeapSize / 1048576 : 0;
  let progs = (r.info.programs || []).length, geos = r.info.memory.geometries, texs = r.info.memory.textures, k = 0;
  while (S.s < s1) { S.s += paso; const acc = {}; window.__cafPerf = acc; for (const q in GLT) delete GLT[q]; const h0 = heap(), t0 = performance.now(); t.v += 16.7; c.cuadro(t.v); const d = performance.now() - t0, h1 = heap(); window.__cafPerf = null; durs.push(d);
    const pg = (r.info.programs || []).length, ge = r.info.memory.geometries;
    if (d > 33) { const top = Object.entries(acc).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([a, b]) => a + ' ' + b.toFixed(0)); const tx = r.info.memory.textures, gls = Object.entries(GLT).filter(e => e[1] > 2).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([a, b]) => a + ' ' + b.toFixed(0)); lentos.push({ km: +A.kmOf(S.s).toFixed(2), ms: +d.toFixed(0), heapMB: +(h1 - h0).toFixed(1), heap: +h1.toFixed(0), programas: pg - progs, geometrias: ge - geos, texturas: tx - texs, top, gl: gls }); }
    progs = pg; geos = ge; texs = r.info.memory.textures; if (++k % cede === 0) await _esp(0); }
  return { cuadros: durs.length, med: +_med(durs).toFixed(2), sobre33: durs.filter(x => x > 33).length, sobre100: durs.filter(x => x > 100).length, lentos: lentos.filter(l => l.ms > 60).slice(0, 150) };
}
// Lote automático en el navegador: localStorage['caf-rauto-cola'] = JSON [{q: '&calidad=media&rx=lean', modo: 'gpu'|'cpu', kms: [...]}, …];
// cada página (?rauto=1&…) mide, guarda en localStorage['caf-rauto'] y salta a la siguiente. Leer: JSON.parse(localStorage['caf-rauto']).
export async function autolote(c) {
  let cola = []; try { cola = JSON.parse(localStorage.getItem('caf-rauto-cola') || '[]'); } catch (e) { }
  const yo = cola.shift(); if (!yo) return;
  let res; try { res = yo.modo === 'recorrido' ? await recorrido(c, ...(yo.kms || [0, 42.19])) : await ({ cpu, gpu, piezas, capas }[yo.modo] || gpu)(c, yo.kms || [1, 9.2, 22, 31, 36.3], yo.op || {}); } catch (e) { res = 'ERR ' + e; }
  const todo = JSON.parse(localStorage.getItem('caf-rauto') || '[]'); todo.push({ q: yo.q, modo: yo.modo, res }); localStorage.setItem('caf-rauto', JSON.stringify(todo));
  localStorage.setItem('caf-rauto-cola', JSON.stringify(cola));
  if (cola.length) location.href = '/?rauto=1&hud=0&t=' + Date.now() + cola[0].q; else localStorage.setItem('caf-rauto-fin', '1');
}
// Costo de GPU por pieza del realismo en la misma página, intercalado (A/B/C… por rondas) para que la deriva térmica no engañe.
// Usa los interruptores en vivo ctx.rxt (cola, suelo, mip, lean, luzhoja, dap, urb). Lo que se fija al cargar (tarjetas más grandes,
// lejanía) no entra: eso se mide recargando con ?rx=.
export async function piezas(c, kms, { pr = 4, rondas = 3, n = 8 } = {}) {
  const r = _arnes(c), gl = r.getContext(), px = new Uint8Array(4), pr0 = r.getPixelRatio(), T = c.ctx.rxt, P = Object.keys(T), out = {}, t = { v: performance.now() };
  const pon = v => P.forEach(k => T[k](v)), cfg = ['todo', ...P.map(k => 'sin ' + k), 'nada'];
  r.setPixelRatio(pr); dispatchEvent(new Event('resize'));
  for (const km of kms) { await _calienta(c, km, t); const acc = {}; cfg.forEach(k => acc[k] = []);
    for (let ro = 0; ro < rondas; ro++) for (const k of cfg) {
      pon(k === 'nada' ? 0 : 1); if (k.startsWith('sin ')) T[k.slice(4)](0);
      for (let i = 0; i < 3; i++) { t.v += 33; c.cuadro(t.v); } const ms = [];
      for (let i = 0; i < n; i++) { gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const t0 = performance.now(); t.v += 33; c.cuadro(t.v); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); ms.push(performance.now() - t0); }
      acc[k].push(_med(ms)); await _esp(2); }
    pon(1); out[km] = {}; for (const k of cfg) out[km][k] = +_med(acc[k]).toFixed(1); }
  r.setPixelRatio(pr0); dispatchEvent(new Event('resize')); return out;
}
// GPU por capa (qué cuesta la imagen): apaga una capa entera cada vez, intercalado. Capas por userData.mem / material.
export async function capas(c, kms, { pr = 4, rondas = 3, n = 8 } = {}) {
  const r = _arnes(c), gl = r.getContext(), px = new Uint8Array(4), pr0 = r.getPixelRatio(), out = {}, t = { v: performance.now() }, sc = c.scene, H = new Set(c.ctx.HROOTS || []);
  const capaDe = o => { const m = o.userData.mem || ''; if (o === c.ctx.skyDome) return 'cielo'; if (/mosaico|suelo/.test(m)) return 'suelo'; if (/^edif/.test(m)) return 'edificios'; if (/calzada|ruta21k/.test(m)) return 'calzada'; if (/gente/.test(m)) return 'gente'; if (m === 'urbano') return 'urbano';
    const k = o.material && o.material.customProgramCacheKey ? o.material.customProgramCacheKey() : ''; if (/^vegDap/.test(k)) return 'sombra moteada'; if (/^vegImp/.test(k)) return 'árboles lejanos'; if (/^veg/.test(k)) return 'árboles cerca'; if (/sueloDet/.test(k) || (o.material && o.material.map === c.ctx.baseTex && o.isMesh && !o.parent?.isGroup)) return 'suelo';
    let p = o; while (p && p.parent && p.parent !== sc) p = p.parent; if (H.has(p)) return 'hitos'; return 'otros'; };
  const G = {}; sc.traverse(o => { if (!(o.isMesh || o.isSprite || o.isPoints || o.isLine)) return; const k = capaDe(o); (G[k] || (G[k] = [])).push(o); });
  const cfg = ['todo', ...Object.keys(G).map(k => 'sin ' + k)];
  r.setPixelRatio(pr); dispatchEvent(new Event('resize'));
  for (const km of kms) { await _calienta(c, km, t); const acc = {}; cfg.forEach(k => acc[k] = []);
    for (let ro = 0; ro < rondas; ro++) for (const k of cfg) {
      const off = k.startsWith('sin ') ? G[k.slice(4)] : [], prev = off.map(o => o.visible); off.forEach(o => o.visible = false);
      for (let i = 0; i < 2; i++) { t.v += 33; c.cuadro(t.v); off.forEach(o => o.visible = false); } const ms = [];
      for (let i = 0; i < n; i++) { off.forEach(o => o.visible = false); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const t0 = performance.now(); r.render(sc, c.camera); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); ms.push(performance.now() - t0); }
      off.forEach((o, i) => o.visible = prev[i]); acc[k].push(_med(ms)); await _esp(2); }
    out[km] = {}; for (const k of cfg) out[km][k] = +_med(acc[k]).toFixed(1); }
  r.setPixelRatio(pr0); dispatchEvent(new Event('resize')); return out;
}
