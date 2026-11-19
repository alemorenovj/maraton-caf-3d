// Torres de Parque Central (Este y Oeste, 225 m) + los 8 bloques residenciales de 44 pisos.
// Planta de las torres: huella OSM real (ways 601165340 / 601178803), 21 vértices: cuadrado de ~32 m con
// cuatro bastiones de esquina girados (planta en molinete). Bandas de vidrio azul entre pilastras de concreto,
// bastiones ciegos de concreto pardo, anillos de concreto cada ~15 pisos, corona escalonada con aletas y helipuerto.
export const meta = {
  id: 'parque_central',
  nombre: 'Torres y residencias de Parque Central',
  quita: [
    [10.497888, -66.899493, 30], // Torre Este
    [10.498775, -66.901983, 30], // Torre Oeste
    [10.497984, -66.901058, 24], // Tejar
    [10.497866, -66.900437, 24], // Mohedano
    [10.498221, -66.901978, 22], // Tajamar
    [10.498341, -66.902564, 22], // Catuche
    [10.498360, -66.903062, 22], // Caruata
    [10.498667, -66.901016, 26], // San Martín
    [10.498685, -66.900293, 24], // Anauco
    [10.498976, -66.903017, 22], // Tacagua
  ],
};

// huella OSM de la Torre Este (m, x al este, z al sur, relativos al centroide); la Oeste es idéntica
const PLANTA = [[13.0, -13.9], [17.1, -16.8], [22.8, -8.7], [17.9, -5.3], [26.8, 7.5], [16.4, 14.6], [20.1, 19.9], [11.1, 26.0], [6.9, 20.0], [-5.2, 28.4], [-15.0, 14.6], [-19.8, 17.9], [-25.1, 10.1], [-20.0, 6.5], [-28.2, -5.1], [-15.6, -13.7], [-19.3, -19.0], [-12.3, -23.9], [-8.4, -18.2], [4.0, -26.8]];

// residenciales: [lat, lon, largo, ancho, ángulo OSM (° ccw desde el este)] — losa de 44 pisos
const RESID = [
  [10.497983, -66.901050, 64, 19, -11], [10.497863, -66.900419, 64, 19, -11], [10.498174, -66.901929, 62, 19, -11],
  [10.498295, -66.902514, 62, 19, -11], [10.498406, -66.903112, 62, 19, -10], [10.498597, -66.901060, 64, 19, -100],
  [10.498641, -66.900238, 64, 19, 169], [10.498922, -66.903045, 64, 19, -101],
];

export function build(THREE, api) {
  const g = new THREE.Group();

  // ---------- utilidades ----------
  const inside = (pts, x, z) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, zi] = pts[i], [xj, zj] = pts[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
  // muros extruidos de las aristas elegidas; u = metros recorridos / pw, v = altura / ph
  function walls(pts, y0, y1, pick, pw, ph) {
    const P = [], N = [], U = [], I = []; let run = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
      if (!pick(L, i)) { run += L; continue; }
      let nx = dz / L, nz = -dx / L; const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2; if (inside(pts, mx + nx * .2, mz + nz * .2)) { nx = -nx; nz = -nz; }
      const k = P.length / 3; P.push(a[0], y0, a[1], b[0], y0, b[1], b[0], y1, b[1], a[0], y1, a[1]);
      for (let q = 0; q < 4; q++) N.push(nx, 0, nz);
      U.push(run / pw, y0 / ph, (run + L) / pw, y0 / ph, (run + L) / pw, y1 / ph, run / pw, y1 / ph); run += L;
      const ok = (-dz * nx + dx * nz) > 0; if (ok) I.push(k, k + 1, k + 2, k, k + 2, k + 3); else I.push(k, k + 2, k + 1, k, k + 3, k + 2);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); geo.setIndex(I); return geo;
  }
  const shapeOf = (pts, s = 1) => new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x * s, -z * s)));
  const slab = (pts, y, h, s, mat) => { const geo = new THREE.ExtrudeGeometry(shapeOf(pts, s), { depth: h, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); geo.translate(0, y, 0); return new THREE.Mesh(geo, mat); };

  // ---------- materiales ----------
  const conc = api.concrete(0x8f8a82), concOsc = api.concrete(0x7d7871), concClaro = api.concrete(0xa49e94);
  // vidrio azul reflectante entre pilastras finas de concreto (módulo 15 pisos de 3,6 m × 5 vanos de 3 m)
  // muro cortina propio: franjas verticales de vidrio continuas entre pilastras (como en la foto), antepechos también de vidrio
  function muro({ pisos = 15, vanos = 5, pil = .2, vid = '#1f3f5e', par = '#8c877f', on = .3, seed = 9 }) {
    let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647, W = 64 * vanos, Hh = 32 * pisos;
    const map = api.canvasTex(W, Hh, (c, w, h) => { const cw = w / vanos, ch = h / pisos; c.fillStyle = par; c.fillRect(0, 0, w, h);
      for (let i = 0; i < vanos; i++) { const x = i * cw + cw * pil / 2, ww = cw * (1 - pil), gr = c.createLinearGradient(x, 0, x + ww, 0); gr.addColorStop(0, vid); gr.addColorStop(.5, '#3a6a93'); gr.addColorStop(1, vid); c.fillStyle = gr; c.fillRect(x, 0, ww, h);
        c.fillStyle = 'rgba(10,25,40,.35)'; for (let r = 0; r < pisos; r++) c.fillRect(x, r * ch, ww, 2); c.fillStyle = 'rgba(200,215,225,.5)'; c.fillRect(x + ww / 2 - 1, 0, 2, h); } });
    const em = api.canvasTex(W, Hh, (c, w, h) => { const cw = w / vanos, ch = h / pisos; c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
      for (let r = 0; r < pisos; r++) for (let i = 0; i < vanos; i++) if (rnd() < on) { c.fillStyle = rnd() < .6 ? '#ffe2b0' : '#d6e8ff'; c.fillRect(i * cw + cw * pil / 2 + 2, r * ch + 6, cw * (1 - pil) - 4, ch - 10); } });
    map.wrapS = map.wrapT = em.wrapS = em.wrapT = THREE.RepeatWrapping;
    const m = new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 0, roughness: .22, metalness: .55, envMapIntensity: 1.1 });
    api.onFrame(st => { m.emissiveIntensity = 1.1 * st.noche; }); return m;
  }
  const vidrio = muro({ pisos: 15, vanos: 5, seed: 11 });
  // bastiones ciegos: paneles de concreto con ranuras pequeñas
  const ciego = api.facade({ pared: '#8e8980', vidrio: '#4a4f55', pisos: 15, vanos: 3, marco: .78, encendidas: .08, seed: 5 });
  const corona = muro({ pisos: 4, vanos: 5, pil: .12, on: .5, seed: 3 });
  const heliMat = new THREE.MeshStandardMaterial({ map: api.canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#5f6366'; c.fillRect(0, 0, w, h); c.strokeStyle = '#f2f2f2'; c.lineWidth = 10; c.beginPath(); c.arc(w / 2, h / 2, w * .4, 0, 7); c.stroke(); c.fillStyle = '#f2f2f2'; c.font = 'bold 150px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('H', w / 2, h / 2 + 8); }), roughness: .9 });
  const rojo = api.glow(0xff2a1a, { dia: .4, noche: 3 });

  // ---------- torres ----------
  const BODY = 203, RINGS = [55, 108, 158];
  function torre(lat, lon, mastil) {
    const p = api.xz(lat, lon), y0 = api.ground(p.x, p.z) - 6, t = new THREE.Group();
    const glassE = (L) => L > 13, solidE = (L) => L <= 13;
    t.add(new THREE.Mesh(walls(PLANTA, 0, BODY, glassE, 15, 54), vidrio));
    t.add(new THREE.Mesh(walls(PLANTA, 0, BODY, solidE, 9, 54), ciego));
    for (const y of RINGS) t.add(slab(PLANTA, y, 2.6, 1.025, concOsc)); // anillos de concreto
    t.add(slab(PLANTA, BODY, 1.2, 1.02, concClaro));
    // corona: cuerpo de vidrio retranqueado + bastiones que siguen subiendo como aletas
    const inner = PLANTA.map(([x, z]) => [x * .8, z * .8]);
    t.add(new THREE.Mesh(walls(inner, BODY, BODY + 12, () => true, 15, 14.4), corona));
    t.add(slab(inner, BODY + 12, 1.5, 1.04, concClaro));
    const box = new THREE.BoxGeometry(1, 1, 1);
    for (let i = 0; i < PLANTA.length; i++) { // aletas sobre las caras exteriores de los bastiones (aristas de 8–11 m)
      const a = PLANTA[i], b = PLANTA[(i + 1) % PLANTA.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 8 || L > 11.5) continue;
      const f = new THREE.Mesh(box, conc); f.scale.set(L, 20, 2.2); f.position.set((a[0] + b[0]) / 2, BODY + 10, (a[1] + b[1]) / 2); f.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]); t.add(f);
      const f2 = new THREE.Mesh(box, concOsc); f2.scale.set(2.4, 26, 2.4); f2.position.set(a[0] * .97, BODY + 13, a[1] * .97); t.add(f2);
    }
    // azotea técnica: cuarto de máquinas + helipuerto
    const cm = new THREE.Mesh(box, concOsc); cm.scale.set(16, 6, 12); cm.position.set(0, BODY + 16.5, 0); t.add(cm);
    const heli = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, .8, 24), [concOsc, heliMat, concOsc]); heli.position.set(0, BODY + 20, 0); t.add(heli);
    for (let k = 0; k < 4; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(.7, 6, 4), rojo); const an = k * Math.PI / 2 + .4; l.position.set(Math.cos(an) * 10, BODY + 21, Math.sin(an) * 10); t.add(l); }
    if (mastil) { // Torre Este: mástil de antena hasta ~255 m, a un lado de la azotea
      const m = new THREE.Mesh(new THREE.CylinderGeometry(.35, 1.6, 40, 8), concClaro); m.position.set(14, BODY + 34, -6); t.add(m);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(.9, 6, 4), rojo); tip.position.set(14, BODY + 54.5, -6); t.add(tip);
    }
    // grúa abandonada de la Torre Este no se modela (temporal)
    t.position.set(p.x, y0, p.z); return t;
  }
  g.add(torre(10.497888, -66.899493, true), torre(10.498775, -66.901983, false));

  // ---------- bloques residenciales (44 pisos, 120 m) ----------
  const resF = api.facade({ pared: '#8e8176', vidrio: '#3b3d40', pisos: 22, vanos: 12, marco: .2, bandas: true, encendidas: .35, seed: 21 });
  resF.map.repeat.set(1, 2); resF.emissiveMap.repeat.set(1, 2);
  const resL = api.facade({ pared: '#8e8176', vidrio: '#3b3d40', pisos: 22, vanos: 4, marco: .55, bandas: false, encendidas: .2, seed: 23 });
  resL.map.repeat.set(1, 2); resL.emissiveMap.repeat.set(1, 2);
  const techo = api.concrete(0x8a5a48), H = 120, bgeo = new THREE.BoxGeometry(1, 1, 1);
  for (const [lat, lon, L, W, ang] of RESID) {
    const p = api.xz(lat, lon), y0 = api.ground(p.x, p.z) - 6, hh = H + 6;
    // caras largas (±z local) con ventanas corridas, testeros (±x local) casi ciegos
    const m = new THREE.Mesh(bgeo, [resL, resL, techo, techo, resF, resF]); m.scale.set(L, hh, W); m.position.set(p.x, y0 + hh / 2, p.z); m.rotation.y = ang * Math.PI / 180; g.add(m);
    // núcleos de escalera en los testeros
    for (const s of [-1, 1]) { const c = new THREE.Mesh(bgeo, concOsc); c.scale.set(4, hh + 4, 9); c.position.set(s * (L / 2 + 1.5), 0, 0); c.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), ang * Math.PI / 180); c.position.add(new THREE.Vector3(p.x, y0 + (hh + 4) / 2, p.z)); c.rotation.y = ang * Math.PI / 180; g.add(c); }
  }
  return api.sombras(g);
}
