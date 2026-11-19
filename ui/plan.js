// «Mi plan de carrera»: ritmo por km a esfuerzo parejo según la pendiente real (mismo gradeSpeed que el motor),
// parciales, subidas, puestos, consejos por tramo e imagen 1080×1920 para el teléfono. Nada corre por cuadro.
const KM = 42.195, SALIDA_MIN = 6 * 60 + 5, KEY = 'caf3d-objetivo', KEYU = 'caf3d-objetivo-u';
const RAPIDOS = [3.25, 3.5, 4, 4.5, 5];
// una línea por tramo (si cambia el nombre de un tramo, se usa la primera frase de su consejo)
const UNO = {
  'Av. Bolívar y el casco central': 'Lo que más sube de la carrera: sal 10–15 s/km más lento que tu ritmo.',
  'Av. San Martín': 'Deja que la bajada te lleve y asienta el ritmo en el llano.',
  "Bella Vista, O'Higgins y La India": 'Último repecho en 5 km; en La India das la vuelta y empieza a bajar.',
  'El Paraíso por la Av. Páez': 'Kilómetros gratis: mantén el esfuerzo, no aproveches para apretar.',
  'Roca Tarpeya y Av. Victoria': 'Sube por esfuerzo y acepta perder segundos: se recuperan bajando la Victoria.',
  'Los Ilustres y Los Próceres': 'Ancho, plano y sin sombra: aquí se corre exacto a tu ritmo.',
  'UCV, Casanova, El Rosal y Las Mercedes': 'En el 21,1 mira el reloj: más de 1 min adelantado es ir demasiado rápido.',
  'Chuao y la Av. Río de Janeiro': 'Llano y con sol: toma el gel del puesto y no te saltes ninguno.',
  'La Francisco de Miranda: la subida larga': 'Aquí se decide: subida larga con el muro encima; corre por sensaciones.',
  'Altamira, Chacao, Solano y meta': 'Quedan 5 km favorables: si te queda algo, gástalo desde Chacao.',
};
const pad = n => String(n).padStart(2, '0');
export const fT = t => { t = Math.round(t); return Math.floor(t / 3600) + ':' + pad(Math.floor(t % 3600 / 60)) + ':' + pad(t % 60); };
export const fHM = t => { t = Math.round(t); const s = t % 60; return Math.floor(t / 3600) + ':' + pad(Math.floor(t % 3600 / 60)) + (s ? ':' + pad(s) : ''); };
export const fP = spk => { const p = Math.round(spk); return Math.floor(p / 60) + ':' + pad(p % 60); };
export const fH = t => { const m = Math.round(SALIDA_MIN + t / 60), h = Math.floor(m / 60) % 24, h12 = h > 12 ? h - 12 : h; return h12 + ':' + pad(m % 60) + (h < 12 ? ' a.m.' : ' p.m.'); };
export const fK = k => (Math.round(k * 10) / 10).toLocaleString('es');
const sg = (v, d = 0) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function crearPlan(caf) {
  const { ctx, D, S } = caf, { sOfKm, R, STEP, N } = ctx, gradeAt = caf.gradeAt, gradeSpeed = caf.gradeSpeed;
  // fracción del tiempo total gastada hasta cada km oficial (integrada sobre el km oficial, no sobre la distancia del GPS:
  // así el tramo comprimido del km 32 no aparece como un km «rapidísimo»)
  const M = 4220, DK = KM / M, F = new Float64Array(M + 1);
  { let t = 0; for (let j = 1; j <= M; j++) { t += DK / gradeSpeed(gradeAt(sOfKm((j - .5) * DK))); F[j] = t; } for (let j = 0; j <= M; j++) F[j] /= t; }
  const frac = km => { const f = Math.max(0, Math.min(M, km / DK)), i = Math.min(M - 1, Math.floor(f)); return F[i] + (F[i + 1] - F[i]) * (f - i); };
  const eleKm = km => R.e[Math.max(0, Math.min(N - 1, Math.round(sOfKm(km) / STEP)))];

  function calc(T = S.target) {
    const at = km => frac(km) * T, mean = T / KM;
    const kms = []; for (let k = 1; k <= 42; k++) kms.push({ k, p: at(k) - at(k - 1) });
    const ord = kms.slice().sort((a, b) => b.p - a.p), lentos = ord.slice(0, 3).map(x => x.k), rapidos = ord.slice(-3).reverse().map(x => x.k);
    let prev = 0; const parciales = [5, 10, 15, 20, 21.0975, 25, 30, 35, 40, KM].map(m => { const r = { km: m, desde: prev, p: (at(m) - at(prev)) / (m - prev), t: at(m) }; prev = m; return r; });
    const subidas = (D.subidas || []).map(c => {
      const d = c.km1 - c.km0, cost = at(c.km1) - at(c.km0) - d * mean; let best = 0, kb = c.km1;
      for (let k = c.km1 + .05; k <= Math.min(KM, c.km1 + 4); k += .05) { const sv = (k - c.km1) * mean - (at(k) - at(c.km1)); if (sv > best) { best = sv; kb = k; } }
      return { n: c.nombre, km0: c.km0, km1: c.km1, gain: c.gain, pend: c.gain / (d * 1000) * 100, cost, rec: best >= 2 ? { k1: kb, drop: eleKm(c.km1) - eleKm(kb), s: best } : null };
    }).sort((a, b) => b.cost - a.cost);
    const iso = new Set(D.gatorade || []), gel = new Set(D.geles || []);
    const puestos = D.hidratacion.map(k => ({ km: k, iso: iso.has(k), gel: gel.has(k), t: at(k) }));
    const propios = []; for (let m = 45 * 60; m < T - 15 * 60; m += 45 * 60) { let b = null; for (const p of puestos) if (!b || Math.abs(p.t - m) < Math.abs(b.t - m)) b = p; if (b && !propios.includes(b.km)) propios.push(b.km); }
    const tramos = D.tramos.map(t => ({ n: t.nombre, km0: t.km0, km1: t.km1, p: (at(t.km1) - at(t.km0)) / (t.km1 - t.km0), linea: UNO[t.nombre] || String(t.consejo).split(/(?<=\.)\s/)[0] }));
    return { T, mean, at, kms, lentos, rapidos, parciales, subidas, puestos, propios, tramos };
  }

  // ───── objetivo (se recuerda) ─────
  let U = 't'; try { U = localStorage.getItem(KEYU) === 'p' ? 'p' : 't'; const v = +localStorage.getItem(KEY); if (v >= 7200 && v <= 27000) S.target = v; } catch (e) { }
  const widgets = [], cambios = [];   // cambios: avisos a otros módulos (la estrategia de carrera) cuando cambia el objetivo
  function setObjetivo(t, guardar = true) {
    S.target = Math.max(7200, Math.min(27000, Math.round(t)));
    if (guardar) try { localStorage.setItem(KEY, S.target); } catch (e) { }
    sync(); if (abierto) render(); cambios.forEach(f => f(S.target));
  }
  function parse(txt, u) {
    const m = String(txt).trim().replace(/\s*(h|\/km|min)\s*/gi, ':').replace(/:$/, '').match(/^(\d{1,2})(?:[:.,'](\d{1,2}))?(?:[:.,'](\d{1,2}))?$/); if (!m) return null;
    const a = +m[1], b = m[2] != null ? +(m[2].length === 1 ? m[2] + '0' : m[2]) : 0, c = m[3] != null ? +m[3] : 0; if (b > 59 || c > 59) return null;
    if (u === 't') { const t = a * 3600 + b * 60 + c; return t >= 7200 && t <= 27000 ? t : null; }
    const spk = a * 60 + b; return spk >= 170 && spk <= 640 ? spk * KM : null;
  }
  function widget(el, conRapidos) {
    el.innerHTML = (conRapidos ? `<div class="seg" data-rap>${RAPIDOS.map(h => `<button data-t="${h}">${fHM(h * 3600)}</button>`).join('')}</div>` : '') +
      `<div class="obj"><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Tu tiempo objetivo"><div class="seg u"><button data-u="t">Tiempo final</button><button data-u="p">Ritmo /km</button></div><span class="eq"></span></div>`;
    const inp = el.querySelector('input'), eq = el.querySelector('.eq');
    el.querySelectorAll('[data-rap] button').forEach(b => b.onclick = () => setObjetivo(+b.dataset.t * 3600));
    el.querySelectorAll('.u button').forEach(b => b.onclick = () => { U = b.dataset.u; try { localStorage.setItem(KEYU, U); } catch (e) { } sync(); });
    inp.addEventListener('input', () => { const t = Math.round(parse(inp.value, U) || 0); if (t) { S.target = t; try { localStorage.setItem(KEY, t); } catch (e) { } sync(inp); if (abierto) render(); cambios.forEach(f => f(t)); } else { eq.textContent = U === 't' ? 'Escribe h:mm, por ejemplo 4:15' : 'Escribe min:seg por km, por ejemplo 5:50'; eq.classList.add('mal'); } });
    inp.addEventListener('change', () => sync());
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); e.stopPropagation(); });
    widgets.push({ el, inp, eq }); sync();
  }
  function sync(salvo) {
    const T = S.target, mean = T / KM;
    document.querySelectorAll('#segT button, [data-rap] button').forEach(b => b.classList.toggle('on', Math.abs(+b.dataset.t * 3600 - T) < 1));
    for (const w of widgets) {
      w.el.querySelectorAll('.u button').forEach(b => b.classList.toggle('on', b.dataset.u === U)); w.inp.placeholder = U === 't' ? 'h:mm' : 'm:ss';
      if (w.inp !== salvo && document.activeElement !== w.inp) w.inp.value = U === 't' ? fHM(T) : fP(mean);
      w.eq.classList.remove('mal'); w.eq.textContent = U === 't' ? `= ${fP(mean)}/km de media` : `= ${fT(T)} en meta`;
    }
  }
  // los botones rápidos de la portada (#segT) también guardan
  document.querySelectorAll('#segT button').forEach(b => b.addEventListener('click', () => setObjetivo(+b.dataset.t * 3600)));
  const enStart = document.getElementById('objStart'); if (enStart) widget(enStart, false);

  // ───── panel ─────
  const el = document.createElement('div'); el.id = 'plan'; el.className = 'screen'; el.style.display = 'none';
  el.innerHTML = `<div class="card panel pcard"><button class="px" aria-label="Cerrar">×</button><div class="tag">Mi plan de carrera</div><h1 id="plH"></h1><p class="sub" id="plSub"></p><div id="plObj"></div><div id="plBody"></div>
    <div class="pbar"><button class="go" data-a="img">Guardar imagen</button><button class="go alt" data-a="share">Compartir</button><button class="go alt" data-a="close">Cerrar</button></div></div>`;
  document.body.appendChild(el); widget(el.querySelector('#plObj'), true);
  let abierto = false, pausaPrev = null;
  el.querySelector('.px').onclick = () => cerrar();
  el.querySelector('.pbar').onclick = e => { const a = e.target.closest('button')?.dataset.a; if (a === 'img') guardar(); else if (a === 'share') compartir(); else if (a === 'close') cerrar(); };
  el.addEventListener('click', e => { if (e.target === el) cerrar(); });
  addEventListener('keydown', e => { if (abierto && e.key === 'Escape') { e.stopImmediatePropagation(); cerrar(); } }, true);

  function render() {
    const P = calc(), mx = Math.max(...P.kms.map(k => Math.abs(k.p - P.mean))) || 1;
    el.querySelector('#plH').innerHTML = `${fT(P.T)} <em>a esfuerzo parejo</em>`;
    el.querySelector('#plSub').textContent = `Ritmo medio ${fP(P.mean)}/km. Sales a las 6:05 a.m. y llegas hacia las ${fH(P.T)} El ritmo de cada kilómetro cambia con la pendiente para que el esfuerzo sea el mismo de principio a fin.`;
    const tr = P.parciales.map(x => `<tr${x.km === 21.0975 || x.km === KM ? ' class="hl"' : ''}><td>${x.km === KM ? 'Meta' : x.km === 21.0975 ? 'Media (21,1)' : fK(x.km) + ' km'}</td><td>${fP(x.p)}/km</td><td>${fT(x.t)}</td><td>${fH(x.t)}</td></tr>`).join('');
    const cells = P.kms.map(k => { const d = k.p - P.mean, a = Math.min(.6, Math.abs(d) / mx * .6), cls = P.lentos.includes(k.k) ? ' lento' : P.rapidos.includes(k.k) ? ' rapido' : '';
      return `<div class="kc${cls}" style="background:${d > 0 ? `rgba(255,107,74,${a.toFixed(2)})` : `rgba(62,207,142,${a.toFixed(2)})`}"><span>km ${k.k}</span><b>${fP(k.p)}</b></div>`; }).join('');
    const nomKm = k => { const t = D.tramos.find(t => k - .5 < t.km1) || D.tramos[D.tramos.length - 1]; return t.nombre.split(/[,:]/)[0]; };
    const sub = P.subidas.map(c => `<tr><td><b>${esc(c.n)}</b><span>km ${fK(c.km0)}–${fK(c.km1)}</span></td><td>+${c.gain} m · ${c.pend.toFixed(1).replace('.', ',')} %</td><td class="up">${sg(c.cost)} s</td><td>${c.rec ? `bajando hasta el km ${fK(c.rec.k1)} (−${Math.max(1, Math.round(c.rec.drop))} m): <b class="dn">−${Math.round(c.rec.s)} s</b>` : 'no hay bajada cerca: no intentes recuperarlo'}</td></tr>`).join('');
    const pts = P.puestos.map(p => `<div class="pt${p.gel ? ' gel' : p.iso ? ' iso' : ''}"><b>km ${fK(p.km)}</b><span>${fH(p.t)}</span><i>${p.gel ? 'agua + gel' : p.iso ? 'agua + isotónico' : 'agua'}</i></div>`).join('');
    const tram = P.tramos.map(t => `<li><b>km ${fK(t.km0)}–${fK(t.km1)} · ${esc(t.n)}</b> <span class="pc">${fP(t.p)}/km</span><br>${esc(t.linea)}</li>`).join('');
    el.querySelector('#plBody').innerHTML = `
      <section><h2>Parciales</h2><table class="pt-t"><tr><th>Punto</th><th>Ritmo del tramo</th><th>Acumulado</th><th>Hora</th></tr>${tr}</table></section>
      <section><h2>Kilómetro a kilómetro</h2><p class="nt">Rojo: más lento que tu media. Verde: más rápido. Los más lentos son el ${P.lentos.join(', ')} (${[...new Set(P.lentos.map(nomKm))].join(', ')}); los más rápidos, el ${P.rapidos.join(', ')}.</p><div class="kms">${cells}</div></section>
      <section><h2>Las subidas que más cuestan</h2><p class="nt">Segundos que cuesta cada una frente a tu ritmo medio, y dónde se recuperan solos sin apretar.</p><table class="sb-t">${sub}</table></section>
      <section><h2>Dónde beber</h2><p class="nt">${P.puestos.length} puestos con agua, ${P.puestos.filter(p => p.iso).length} con isotónico y gel en los km ${(D.geles || []).map(fK).join(' y ')}. La hora es la de paso con tu objetivo.${P.propios.length ? ` Si llevas tus geles, una pauta habitual es uno cada 45 min con agua: te tocan cerca de los km ${P.propios.map(fK).join(', ')}. Usa solo lo que hayas probado entrenando.` : ''}</p><div class="pts">${pts}</div></section>
      <section><h2>Lo que hay que saber de cada tramo</h2><ul class="tr-l">${tram}</ul></section>
      <p class="fine">Los ritmos son una estimación hecha solo con la pendiente del trazado GPS, para repartir el esfuerzo de forma pareja: no cuentan calor, viento, giros ni aglomeración. Puestos de agua, isotónico y gel según los manuales del corredor CAF 2024–2026: confírmalos en el de tu edición.</p>`;
  }
  function abrir() {
    abierto = true; render(); el.style.display = 'flex'; el.scrollTop = 0; document.body.classList.add('plan-on');
    if (S.running) { pausaPrev = S.paused; S.paused = true; }
  }
  function cerrar() { if (!abierto) return; abierto = false; el.style.display = 'none'; document.body.classList.remove('plan-on'); if (pausaPrev !== null && S.running) S.paused = pausaPrev; pausaPrev = null; }

  // ───── imagen 1080×1920 ─────
  async function lienzo(T = S.target) {
    try { await Promise.all(['400 190px "Instrument Serif"', 'italic 400 60px "Instrument Serif"', '600 36px Inter', '400 30px Inter', '700 30px Inter'].map(f => document.fonts.load(f))); } catch (e) { }
    const P = calc(T), W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const SER = '"Instrument Serif", Georgia, serif', INT = 'Inter, system-ui, sans-serif', BONE = '#f4efe6', MUTE = '#8b8f9a', ACC = '#ffd23f';
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#1c2238'); bg.addColorStop(.42, '#10131d'); bg.addColorStop(1, '#0a0c12'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // silueta de la ruta (norte arriba)
    { let a = Infinity, b = -Infinity, cz = Infinity, d = -Infinity; for (let i = 0; i < N; i++) { a = Math.min(a, R.x[i]); b = Math.max(b, R.x[i]); cz = Math.min(cz, R.z[i]); d = Math.max(d, R.z[i]); }
      const bx = 90, by = 230, bw = 900, bh = 250, sc = Math.min(bw / (b - a), bh / (d - cz)), ox = bx + (bw - (b - a) * sc) / 2, oy = by + (bh - (d - cz) * sc) / 2;
      const X = i => ox + (R.x[i] - a) * sc, Z = i => oy + (R.z[i] - cz) * sc;
      g.lineJoin = g.lineCap = 'round'; g.strokeStyle = 'rgba(255,210,63,.16)'; g.lineWidth = 16; g.beginPath(); for (let i = 0; i < N; i += 3) i ? g.lineTo(X(i), Z(i)) : g.moveTo(X(i), Z(i)); g.stroke();
      g.strokeStyle = 'rgba(255,210,63,.75)'; g.lineWidth = 5; g.stroke();
      g.fillStyle = BONE; g.beginPath(); g.arc(X(0), Z(0), 9, 0, 6.3); g.fill(); }
    const txt = (s, x, y, font, col, al = 'left', maxW = 0) => { g.font = font; if (maxW) { let px = +font.match(/(\d+)px/)[1]; while (px > 14 && g.measureText(s).width > maxW) { px--; g.font = font.replace(/\d+px/, px + 'px'); } } g.fillStyle = col; g.textAlign = al; g.fillText(s, x, y); };
    const spaced = (s, x, y, font, col, sp) => { g.font = font; g.fillStyle = col; g.textAlign = 'left'; let cx = x; for (const ch of s) { g.fillText(ch, cx, y); cx += g.measureText(ch).width + sp; } };
    spaced('MARATÓN CAF · CARACAS', 90, 170, `600 30px ${INT}`, ACC, 5);
    txt('Mi plan a esfuerzo parejo', 90, 585, `italic 400 58px ${SER}`, MUTE);
    txt(fT(P.T), 84, 760, `400 190px ${SER}`, BONE);
    txt(`${fP(P.mean)}/km de media · salida 6:05 · meta ${fH(P.T)}`, 90, 822, `400 31px ${INT}`, '#cfccc4');
    // perfil
    { const x0 = 90, x1 = 990, y0 = 870, y1 = 990; let lo = Infinity, hi = -Infinity; for (const e of R.e) { lo = Math.min(lo, e); hi = Math.max(hi, e); }
      const tot = (N - 1) * STEP, px = s => x0 + s / tot * (x1 - x0);
      for (let x = x0; x < x1; x += 2) { const s = (x - x0) / (x1 - x0) * tot, gr = gradeAt(s), e = R.e[Math.round(s / STEP)], y = y1 - (e - lo + 3) / (hi - lo + 6) * (y1 - y0 - 18);
        g.fillStyle = gr > 1.2 ? (gr > 3 ? '#ff4a2a' : '#ff8a5c') : gr < -1.2 ? '#3ecf8e' : '#f2c94c'; g.globalAlpha = .9; g.fillRect(x, y, 2, y1 - y); }
      g.globalAlpha = 1; for (const p of P.puestos) { g.fillStyle = p.gel ? BONE : p.iso ? '#ff9a3c' : '#4aa8ff'; g.beginPath(); g.arc(px(sOfKm(p.km)), y0 - 4, p.gel ? 7 : 5, 0, 6.3); g.fill(); }
      g.fillStyle = 'rgba(244,239,230,.5)'; for (let k = 5; k <= 40; k += 5) { const x = px(sOfKm(k)); g.fillRect(x, y1 + 4, 2, 8); txt(String(k), x, y1 + 38, `400 22px ${INT}`, 'rgba(244,239,230,.55)', 'center'); } }
    // parciales
    { const cx = [90, 600, 820, 990], y0 = 1090, dy = 52;
      g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(90, y0 + 14, 900, 2);
      [['PUNTO', 'left'], ['RITMO', 'right'], ['ACUMULADO', 'right'], ['HORA', 'right']].forEach(([s, al], i) => txt(s, cx[i], y0, `600 22px ${INT}`, MUTE, al));
      P.parciales.forEach((x, i) => { const y = y0 + 62 + i * dy, hl = x.km === 21.0975 || x.km === KM;
        if (hl) { g.fillStyle = 'rgba(255,210,63,.09)'; g.fillRect(74, y - 38, 932, 50); }
        txt(x.km === KM ? 'Meta' : x.km === 21.0975 ? 'Media 21,1' : fK(x.km) + ' km', cx[0], y, `600 34px ${INT}`, hl ? ACC : BONE);
        txt(fP(x.p) + '/km', cx[1], y, `400 34px ${INT}`, BONE, 'right'); txt(fT(x.t), cx[2], y, `700 34px ${INT}`, BONE, 'right'); txt(fH(x.t), cx[3], y, `400 28px ${INT}`, '#cfccc4', 'right'); }); }
    // subidas y puestos
    { const y = 1690, cl = P.subidas.filter(c => c.cost >= 10).sort((a, b) => a.km0 - b.km0);
      txt('SUBE', 90, y, `600 22px ${INT}`, '#ff8a5c'); txt('km ' + cl.map(c => `${fK(c.km0)}–${fK(c.km1)}`).join(' · '), 210, y, `400 28px ${INT}`, BONE, 'left', 780);
      txt('GEL', 90, y + 46, `600 22px ${INT}`, BONE); txt('km ' + (D.geles || []).map(fK).join(' y '), 210, y + 46, `400 28px ${INT}`, BONE);
      txt('ISOTÓNICO', 420, y + 46, `600 22px ${INT}`, '#ff9a3c'); txt((D.gatorade || []).map(fK).join(' · '), 575, y + 46, `400 26px ${INT}`, BONE, 'left', 415);
      txt('AGUA', 90, y + 92, `600 22px ${INT}`, '#4aa8ff'); txt(`${P.puestos.length} puestos, cada 1–2 km`, 210, y + 92, `400 28px ${INT}`, BONE); }
    txt('Ritmo estimado por la pendiente del trazado. Puestos: manuales del corredor CAF 2024–2026.', 540, 1855, `400 21px ${INT}`, 'rgba(244,239,230,.45)', 'center');
    return c;
  }
  const nombreImg = () => `plan-maraton-caf-${fHM(S.target).replace(/:/g, 'h').replace(/h(\d\d)h/, 'h$1m')}.png`;
  const blob = c => new Promise(r => c.toBlob(r, 'image/png'));
  function descargar(b, n) { const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = n; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
  function aviso(t) { let n = document.getElementById('aviso'); if (!n) { n = document.createElement('div'); n.id = 'aviso'; n.className = 'panel'; document.body.appendChild(n); } n.textContent = t; n.classList.add('on'); clearTimeout(aviso.t); aviso.t = setTimeout(() => n.classList.remove('on'), 3200); }
  async function guardar() { const b = await blob(await lienzo()); descargar(b, nombreImg()); aviso('Imagen guardada. Ponla de fondo de pantalla o súbela a tu historia.'); }
  async function compartir(extra = '') {
    const url = location.origin + location.pathname, text = `${extra ? extra + ' ' : ''}Mi plan para el Maratón CAF: ${fT(S.target)}, ${fP(S.target / KM)}/km de media, con el ritmo de cada km según las subidas reales. Arma el tuyo: ${url}`;
    let c = null; try { c = await lienzo(); } catch (e) { }
    return compartirLienzo(c, nombreImg(), text, 'Mi plan · Maratón CAF');
  }
  // comparte un lienzo ya dibujado (lo usa también el resultado de «Correr la carrera»); sin Web Share, lo descarga y copia el texto
  async function compartirLienzo(c, nombre, text, title) {
    const url = location.origin + location.pathname; let b = null; try { if (c) b = await blob(c); } catch (e) { }
    const file = b && typeof File === 'function' ? new File([b], nombre, { type: 'image/png' }) : null;
    try {
      if (file && navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title, text }); return; }
      if (navigator.share) { await navigator.share({ title, text, url }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    if (b) descargar(b, nombre); try { await navigator.clipboard.writeText(text); aviso('Imagen descargada y texto con el enlace copiado.'); } catch (e) { aviso('Imagen descargada.'); }
  }
  return { fmt: { fT, fHM, fP, fH, fK }, abrir, cerrar, calc, setObjetivo, lienzo, guardar, compartir, compartirLienzo, aviso, widget, alCambiar: f => cambios.push(f), get abierto() { return abierto; } };
}
