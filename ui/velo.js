// Fundido común (#velo) de «Reconocer la ruta» y «Correr la carrera»: tapa la escena mientras carga lo cercano al corredor
// (ctx.pendientes() del motor) o vence el máximo. Antes vivía en ui/resumen.js («Lo esencial en 60 s», retirado).
const FUNDE = 240, MIN_ESPERA = 260;
const MAX_ESPERA = matchMedia('(pointer: coarse)').matches ? 4000 : 2500;

export function crearVelo(caf, ui) {
  const { S, ctx } = caf;
  const velo = document.createElement('div'); velo.id = 'velo'; velo.innerHTML = '<div class="vt"><span></span>Cargando el tramo</div>'; document.body.appendChild(velo);
  let turno = 0, cubierto = false;
  // seguro: el fundido nunca se queda puesto. Si algo falla o tarda más de 9 s, se levanta solo y el juego sigue
  let veloT = 0; new MutationObserver(() => { clearTimeout(veloT); if (velo.classList.contains('on')) veloT = setTimeout(() => { if (!velo.classList.contains('on')) return; velo.classList.remove('on', 'ya'); cubierto = false; turno++; if (S.running) S.paused = false; console.warn('velo: levantado por el seguro'); const er = window.__errs || []; if (er.length && window.__aviso) window.__aviso('Algo falló al cargar este tramo', er[er.length - 1]); }, 9000); }).observe(velo, { attributes: true, attributeFilter: ['class'] });
  const espera = ms => new Promise(r => setTimeout(r, ms)), cuadros = n => new Promise(r => { let hecho = false; const fin = () => { if (!hecho) { hecho = true; r(); } }, f = () => --n <= 0 ? fin() : requestAnimationFrame(f); requestAnimationFrame(f); setTimeout(fin, 1500); });   // con tope: sin cuadros (pestaña oculta) no se queda esperando
  // espera a que el motor no tenga nada pendiente cerca del corredor (o a que venza el máximo); devuelve los ms esperados
  async function cargado(max = MAX_ESPERA) {
    const t0 = performance.now(); await espera(MIN_ESPERA); await cuadros(2);
    while (performance.now() - t0 < max) { let n = 0; try { n = ctx.pendientes ? ctx.pendientes() : 0; } catch (e) { n = 0; } if (!n) break; await espera(100); }
    await cuadros(3); return performance.now() - t0;
  }
  // tapar, ejecutar el salto, esperar la carga y destapar
  async function cubrir(salto, max) {
    const mio = ++turno; cubierto = true; velo.classList.add('on'); await espera(FUNDE); if (mio !== turno) return false;
    const pausa = S.paused; S.paused = true; salto?.(); const ms = await cargado(max); if (mio !== turno) return false;
    S.paused = pausa; velo.classList.remove('on'); cubierto = false; ui.ultimaEspera = Math.round(ms); return true;
  }
  // primer cuadro de «Reconocer la ruta» y «Correr la carrera»: la escena no se muestra hasta que está cargada
  function cubrirInicio() { velo.classList.add('on', 'ya'); return cubrir(null).then(r => { velo.classList.remove('ya'); return r; }); }
  return { cubrir, cubrirInicio, cargado, get cubierto() { return cubierto; } };
}
