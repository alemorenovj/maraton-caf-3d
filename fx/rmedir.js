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
