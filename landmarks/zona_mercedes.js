// Zona mercedes (km 23,3–26,8): lo que el video muestra y las huellas genéricas no resuelven.
//  1. Torre Banfanb (El Rosal, esquina de la Av. Venezuela): cilindro de vidrio azul espejo sobre basamento blanco de arcos (s=579 del video).
//  2. Elevado de Las Mercedes (km 24,44): puente diagonal oscuro con pilas amarillas y la valla verde «Un sabor como nada» (f_0239).
//  3. Viaducto de la Autopista Prados del Este (km 25,75–26,07): la ruta gira y corre bajo su borde izquierdo; valla rosada de
//     Capsuyen Pharma en el frente, muro con el mural geométrico de rombos y el de franjas de colores, valla de Tomás Seif y la bomba (f_0251–0254).
//  4. Puente de El Ciempiés (km 26,45–26,76): parapeto de concreto a la izquierda (el video no tiene barandas amarillas) y la señal verde.
//  5. Hotel Tamanaco (cuerpo blanco doblado con terrazas por piso, testeras escalonadas, letrero verde, piscina, astas, pórtico) y
//     Eurobuilding (torre blanca de bandas horizontales, ala diagonal y ala este, testera con balcones y ranura, viga «Eurobuilding»).
//  13. Calle La Guairita (km 26,70–26,95): borde izquierdo con verja y parapeto, verja negra sobre muro blanco a la derecha, bomba de gasolina.
//  6–7. Muro con portón a la salida del viaducto; copas de lóbulos con tronco y ramas en los bordes del puente de El Ciempiés y vallas rosadas.
//  8–10. Muro de contención bajo el viaducto (der.), valla larga genérica bajo el tablero, arbolado de la ladera del Tamanaco.
//  11. CCCT (podio en terrazas y Pirámide Invertida) y Cubo Negro, sobre sus huellas OSM (Chuao, a la izquierda del puente).
//  12. Rampa (26,11–26,40): murete y muro de contención solo hasta el paso bajo la autopista, reja blanca, corte de roca, muro verde a la
//      izquierda y el paso bajo la Autopista Prados del Este (km 26,21).
//  22 (19-nov). Alcaldía de Chacao en la Torre Atrium (km 23,46–23,57 der.): letras ATRIUM, pilón con el escudo y CHACAO, pendones rojos
//      y DESPACIO / ALCALDÍA pintados en el asfalto (video t=575,5–578 s).
//  19–21 (22-nov). Estación Texaco a la derecha al entrar a Las Mercedes (24,63–24,68) con el esqueleto en obra detrás; lote arbolado
//      con lámina y reja (24,57–24,63 der.); rótulo del CVA y gálibo amarillo «ALTURA MÁXIMA 3,70 m» (24,115).
// El terreno lateral (muro de la rampa, valle bajo el puente, cerro del Tamanaco) lo ponen fx/correcciones/mercedes.js (relieve).
// Anclas del video (19-nov): t=640 s (bajo la autopista, letrero «La Huayrita») = km 26,20, no 26,36 como dice el índice; t=643,75 ≈ 26,40;
// t=650,75 ≈ 26,50. Entre t=644,25 y 649,75 el video intercala un tramo de OTRA cámara (sin capó, con zoom) girada ~35° a la
// izquierda de la marcha: ahí el Eurobuilding parece 30° a la derecha, pero respecto a la vía queda ~5° a la izquierda, igual que
// en el simulador. El trazado y el hotel están bien (fx/capturas/ciempies_fix.jpg y ciempies_esquema.png); no compares con esos cuadros.
export const meta = {
  id: 'zona_mercedes', nombre: 'Zona mercedes',
  quita: [[10.489679, -66.860998, 20], [10.478599, -66.857049, 8],   // Banfanb (se modela aquí) · techo de la bomba (se modela aquí)
    [10.485924, -66.865806, 9], [10.485675, -66.865528, 5], [10.483845, -66.863953, 9], [10.483229, -66.862546, 7], [10.483124, -66.862396, 7],   // fachadas de §18 (sin árboles adentro)
    [10.481939, -66.861167, 7],   // los Mástiles de la Plaza Alfredo Sadel (§14): sin árboles del motor bajo el mirador
    [10.484730, -66.864975, 24], [10.484640, -66.864905, 14], [10.484440, -66.864840, 18],   // patio, marquesina y tienda de la Texaco y el esqueleto (§19): sin árboles del motor dentro
    // círculos a lo largo de cada ala del Tamanaco (25) y del Eurobuilding (19): sin ellos el motor sembraba árboles que salían por la azotea
    [10.477456, -66.85705, 11], [10.477455, -66.856936, 11], [10.477453, -66.856822, 11], [10.477452, -66.856708, 11], [10.47745, -66.856594, 11], [10.477449, -66.856479, 11], [10.477447, -66.856365, 11], [10.47742, -66.85642, 11], [10.477491, -66.856324, 11], [10.477561, -66.856228, 11], [10.477631, -66.856132, 11], [10.477702, -66.856036, 11], [10.477772, -66.85594, 11], [10.477842, -66.855845, 11], [10.477869, -66.856036, 15], [10.47795, -66.85594, 15], [10.478031, -66.855845, 15], [10.478112, -66.855749, 15], [10.478193, -66.855653, 15], [10.477366, -66.856164, 10], [10.477295, -66.856106, 10], [10.477223, -66.856047, 10], [10.477151, -66.855989, 10], [10.477079, -66.85593, 10], [10.477007, -66.855872, 10],
    [10.48247, -66.851003, 12], [10.482503, -66.850884, 12], [10.482535, -66.850765, 12], [10.482567, -66.850646, 12], [10.4826, -66.850528, 12], [10.482632, -66.850409, 12], [10.482664, -66.85029, 12], [10.48269, -66.850327, 11], [10.482611, -66.85025, 11], [10.482531, -66.850173, 11], [10.482452, -66.850096, 11], [10.482373, -66.85002, 11], [10.482294, -66.849943, 11], [10.482276, -66.849961, 12], [10.482312, -66.849836, 12], [10.482347, -66.849711, 12], [10.482383, -66.849586, 12], [10.482418, -66.849461, 12], [10.482453, -66.849336, 12]],
};

export function build(THREE, api) {
  const g = new THREE.Group();
  // Escala vertical: el juego dibuja ruta y terreno a (cota − cotaMín) × EX; routeAt().y y ground() vienen sin exagerar.
  const enBanco = /test\.html/.test(location.pathname), q = new URLSearchParams(location.search);
  const EX = enBanco || api.EX ? 1 : (api.D.meta.exag || 1) * (+q.get('relieve') || 1.5);
  const RA = k => { const p = api.routeAt(k); p.y *= EX; return p; };
  const GY = (x, z) => api.ground(x, z) * EX;
  const LL = (la, lo) => api.xz(la, lo);
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1), V = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
  const add = (geo, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const ang = (tx, tz) => Math.atan2(tx, tz);   // rotation.y que lleva el +Z local a la dirección (tx, tz)
  // dos(): malla de un paño (muro, parapeto, tablero, verja) con DOS caras frontales en vez de un material DoubleSide. El pase de normales
  // de la oclusión ambiental (fx/atmosfera.js) descarta las caras traseras: un muro que mostraba a la vía su cara trasera dejaba ver la
  // AO de los árboles de detrás como manchas negras pixeladas (muro de la rampa, km 26,12–26,42). Se duplican los triángulos al revés.
  const dos = (ge, mat) => { const s0 = ge.index ? ge.toNonIndexed() : ge, p = s0.attributes.position.array, uv = s0.attributes.uv && s0.attributes.uv.array, n = p.length / 3;
    const P = new Float32Array(p.length * 2), U = uv ? new Float32Array(uv.length * 2) : null; P.set(p); if (U) U.set(uv);
    for (let t = 0; t < n; t += 3) for (let j = 0; j < 3; j++) { const a = t + 2 - j, b = n + t + j; P[b * 3] = p[a * 3]; P[b * 3 + 1] = p[a * 3 + 1]; P[b * 3 + 2] = p[a * 3 + 2]; if (U) { U[b * 2] = uv[a * 2]; U[b * 2 + 1] = uv[a * 2 + 1]; } }
    const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); if (U) o.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); o.computeVertexNormals();
    mat.side = THREE.FrontSide; return new THREE.Mesh(o, mat); };
  const concreto = api.concrete(0x9a9b97), concretoOsc = api.concrete(0x5b5c5a), amarillo = api.concrete(0xe8b923);
  // valla publicitaria: textura con texto
  const valla = (w, h, fn) => { const t = api.canvasTex(w, h, fn); const m = new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .05, roughness: .7 }); api.onFrame(st => { m.emissiveIntensity = .05 + .9 * st.noche; }); return m; };

  // ═════════ 1. Torre Banfanb ═════════
  {
    const P = [[10.489517, -66.861044], [10.489731, -66.861179], [10.489809, -66.861071], [10.489809, -66.860953], [10.489735, -66.86087], [10.489634, -66.860824]].map(([a, b]) => LL(a, b));
    const c = LL(10.489679, -66.860998), y0 = Math.min(...P.map(p => GY(p.x, p.z))) - .4;
    // basamento blanco de dos niveles con arcos corridos
    const arcos = api.canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#eeece6'; x.fillRect(0, 0, w, h); x.fillStyle = '#d9d6ce'; x.fillRect(0, 0, w, 26);
      for (let i = 0; i < 2; i++) { const a = i * w / 2 + 34, b = (i + 1) * w / 2 - 34, r = (b - a) / 2; x.fillStyle = '#3d4a55'; x.beginPath(); x.moveTo(a, h); x.lineTo(a, 120); x.arc(a + r, 120, r, Math.PI, 0); x.lineTo(b, h); x.fill();
        x.fillStyle = 'rgba(180,210,235,.35)'; x.fillRect(a + 8, 128, b - a - 16, 6); } });
    arcos.wrapS = arcos.wrapT = THREE.RepeatWrapping; arcos.repeat.set(1 / 13, -1 / 9.5);
    const bm = new THREE.MeshStandardMaterial({ map: arcos, roughness: .85 });
    const sh = new THREE.Shape(P.map(p => new THREE.Vector2(p.x - c.x, -(p.z - c.z))));
    const base = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 9.5, bevelEnabled: false }), [api.concrete(0xdedbd3), bm]);
    base.rotation.x = -Math.PI / 2; base.position.set(c.x, y0, c.z); g.add(base);
    // cornisa blanca volada sobre el basamento
    const corn = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .7, bevelEnabled: false }), api.concrete(0xf2f0ea)); corn.rotation.x = -Math.PI / 2; corn.scale.set(1.06, 1.06, 1); corn.position.set(c.x, y0 + 9.5, c.z); g.add(corn);
    // el cilindro de vidrio espejo
    const vid = api.facade({ pared: '#173f8f', vidrio: '#2f6fd6', pisos: 11, vanos: 16, marco: .1, bandas: true, encendidas: .35, seed: 31, roughness: .12, metalness: .75, env: 1.3 });
    vid.map.repeat.set(3, 1); vid.emissiveMap.repeat.set(3, 1);
    const R0 = 13.2, H0 = 35;
    add(new THREE.CylinderGeometry(R0, R0, H0, 48, 1, true), vid, c.x - 1.5, y0 + 10.2 + H0 / 2, c.z + 1);
    add(new THREE.CylinderGeometry(R0 + .25, R0 + .25, 1.2, 48), api.concrete(0xd8dde2), c.x - 1.5, y0 + 10.2 + H0 + .6, c.z + 1);
    add(new THREE.CylinderGeometry(R0 - .4, R0 - .4, .4, 48), api.concrete(0x6b7177), c.x - 1.5, y0 + 10.2 + H0 + 1.3, c.z + 1);
    // franja vertical de ventanas cuadradas (el «lomo» claro que se ve desde la calle de la Alcaldía)
    const lomo = api.facade({ pared: '#8fa7c4', vidrio: '#28456e', pisos: 11, vanos: 3, marco: .45, encendidas: .3, seed: 5, roughness: .3, metalness: .4 });
    const lm = add(new THREE.CylinderGeometry(R0 + .08, R0 + .08, H0, 10, 1, true, Math.PI * 1.15, .55), lomo, c.x - 1.5, y0 + 10.2 + H0 / 2, c.z + 1);
    lm.material.side = THREE.FrontSide;
  }

  // ═════════ 2. Elevado de Las Mercedes (km 24,44) ═════════
  {
    const A = LL(10.48622, -66.86447), B = LL(10.48689, -66.86702), p = RA(24.44);
    const dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2;
    const yD = p.y + 6.6;   // intradós del tablero sobre la calzada
    const deck = add(new THREE.BoxGeometry(11, 1.5, L), api.concrete(0x3e3630), mx, yD + .75, mz, ang(ux, uz));
    // barandas y cajón oscuro de las caras
    add(new THREE.BoxGeometry(11.6, .9, L), api.concrete(0x4a3f36), mx, yD + .25, mz, ang(ux, uz));
    add(new THREE.BoxGeometry(.25, 1, L), concreto, mx + uz * 5.4, yD + 2, mz - ux * 5.4, ang(ux, uz));
    add(new THREE.BoxGeometry(.25, 1, L), concreto, mx - uz * 5.4, yD + 2, mz + ux * 5.4, ang(ux, uz));
    // pilas amarillas (fuera de la calzada)
    for (let t = -L / 2 + 12; t < L / 2 - 5; t += 24) {
      const x = mx + ux * t, z = mz + uz * t; let dmin = 1e9; for (let k = 24.30; k <= 24.62; k += .004) { const r = RA(k); dmin = Math.min(dmin, Math.hypot(r.x - x, r.z - z)); }
      if (dmin < 13) continue; const gy = GY(x, z); add(new THREE.BoxGeometry(1.4, yD - gy + .2, 1.4), amarillo, x, (yD + gy) / 2, z, ang(ux, uz));
    }
    // valla verde en la cara que mira hacia El Rosal (de donde viene el corredor)
    const nx = uz, nz = -ux, sgn = (p.x - mx) * nx + (p.z - mz) * nz > 0 ? 1 : -1;   // normal del tablero hacia el norte (hacia la Av. Venezuela)
    const toN = (p.tx * nx + p.tz * nz) < 0 ? 1 : -1;
    const fx = nx * toN, fz = nz * toN;
    const vm = valla(1024, 256, (x, w, h) => { x.fillStyle = '#1f8a4c'; x.fillRect(0, 0, w, h); x.fillStyle = '#e9f7ee'; x.font = 'italic 64px Arial, sans-serif'; x.textBaseline = 'middle'; x.fillText('Un sabor', 70, h * .36); x.font = 'bold 120px Arial, sans-serif'; x.fillStyle = '#b8f04a'; x.fillText('como nada', 330, h * .66);
      x.fillStyle = '#e9f7ee'; x.font = '44px Arial, sans-serif'; x.fillText('como', 230, h * .7); x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 8; x.strokeRect(4, 4, w - 8, h - 8); });
    // dónde cruza el eje de la ruta: punto del tablero más cercano a la ruta en 24,44
    const tc = (p.x - mx) * ux + (p.z - mz) * uz, cx = mx + ux * tc, cz = mz + uz * tc;
    const b = add(new THREE.PlaneGeometry(17, 4.2), vm, cx + fx * 5.95, yD + 1.6, cz + fz * 5.95, ang(fx, fz)); b.rotation.y = Math.atan2(fx, fz);
    void sgn; void deck;
  }

  // ═════════ 3. Viaducto de Prados del Este, murales y vallas (km 25,75–26,07) ═════════
  {
    // ejes de trabajo: cuerda de la ruta entre 25,86 y 26,07 (a = a lo largo, l = lateral, + a la izquierda)
    const A = RA(25.86), B = RA(26.07), L0 = Math.hypot(B.x - A.x, B.z - A.z), ux = (B.x - A.x) / L0, uz = (B.z - A.z) / L0, lx = uz, lz = -ux;
    const W = (a, l) => ({ x: A.x + ux * a + lx * l, z: A.z + uz * a + lz * l });
    // eje del viaducto en esas coordenadas (las dos calzadas juntas, 26 m): recto desde el suroeste y se abre a la derecha al final
    const eje = [[-260, -10], [-60, -8], [40, -7], [120, -11], [175, -20], [215, -29]];
    const lat = a => { for (let i = 1; i < eje.length; i++) if (a <= eje[i][0]) { const [a0, l0] = eje[i - 1], [a1, l1] = eje[i], t = (a - a0) / (a1 - a0); return l0 + (l1 - l0) * t; } return eje[eje.length - 1][1]; };
    const yRuta = a => { const k = 25.86 + a / 1000 * (26.07 - 25.86) / (L0 / 1000); return RA(Math.max(25.74, Math.min(26.1, k))).y; };
    const yInt = a => a <= -40 ? RA(25.785).y + 6.3 : a >= 20 ? yRuta(a) + 7.6 : RA(25.785).y + 6.3 + (yRuta(20) + 7.6 - RA(25.785).y - 6.3) * (a + 40) / 60;   // intradós: ~6,3 m sobre la Av. Principal donde la cruza, 7,6 m sobre la calle de abajo
    // Tablero de vigas (video t=626–634 s): losa delgada sobre 11 vigas longitudinales de 1,4 m de canto, frente de borde claro con
    // New Jersey encima, cabezales transversales cada 28 m sobre pilas cuadradas. El intradós lleva una luz de rebote (emisivo) para
    // que no salga negro: en el video se lee gris medio, con el sol entrando por el lado izquierdo, que queda abierto.
    const intra = new THREE.MeshStandardMaterial({ color: 0x7b7973, roughness: .95, emissive: 0x1f1e1b, side: THREE.DoubleSide });
    const fasc = new THREE.MeshStandardMaterial({ color: 0x86847d, roughness: .9, side: THREE.DoubleSide });
    api.onFrame(st => { intra.emissiveIntensity = 1 - .85 * st.noche; });
    const HW = 14.5, AS = []; for (let a = -260; a <= 215.1; a += 5) AS.push(a);
    // barrido de una sección [l, y] (l lateral desde el eje del viaducto, y desde la cara inferior de las vigas) a lo largo del eje
    const barrido = (secs, mat) => { const ps = [], ix = []; let v = 0;
      for (const sec of secs) for (let e = 0; e < sec.length; e++) { const [l0, y0] = sec[e], [l1, y1] = sec[(e + 1) % sec.length];
        for (let i = 0; i < AS.length; i++) { const a = AS[i], lc = lat(a), y = yInt(a), p0 = W(a, lc + l0), p1 = W(a, lc + l1); ps.push(p0.x, y + y0, p0.z, p1.x, y + y1, p1.z);
          if (i) ix.push(v - 2, v, v - 1, v - 1, v, v + 1); v += 2; } }
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); ge.setIndex(ix); ge.computeVertexNormals(); g.add(dos(ge, mat)); };
    const caja = (l0, l1, y0, y1) => [[l0, y0], [l1, y0], [l1, y1], [l0, y1]];
    const vigas = [caja(-13.6, 13.6, 1.4, 2.0)]; for (let lo = -12; lo <= 12.01; lo += 2.4) vigas.push(caja(lo - .25, lo + .25, 0, 1.45));
    barrido(vigas, intra);
    barrido([caja(13.6, HW, .35, 2.7), caja(-HW, -13.6, .35, 2.7), [[13.85, 2.7], [HW, 2.7], [HW, 3.75], [14.05, 3.75], [13.85, 3.1]], [[-HW, 2.7], [-13.85, 2.7], [-13.85, 3.1], [-14.05, 3.75], [-HW, 3.75]]], fasc);
    // pilas cuadradas bajo cabezales; ninguna sobre la calzada ni la acera
    const ruta = []; for (let k = 25.55; k <= 26.2; k += .003) ruta.push(RA(k));
    const dRuta = (x, z) => { let d = 1e9; for (const r of ruta) d = Math.min(d, Math.hypot(r.x - x, r.z - z)); return d; };
    for (let a = -246; a <= 210; a += 28) { const c = W(a, lat(a)), c2 = W(a + 1, lat(a + 1)), ry = ang(c2.x - c.x, c2.z - c.z), y = yInt(a);
      add(new THREE.BoxGeometry(2 * HW - .4, 1.75, 1.7), intra, c.x, y + .55, c.z, ry);
      for (const lo of [-9.5, 0, 9.5]) { const P = W(a, lat(a) + lo); if (dRuta(P.x, P.z) < 7.2) continue; const gy = GY(P.x, P.z) - .3, h = y - .3 - gy; if (h < 2) continue;
        add(new THREE.BoxGeometry(1.6, h, 1.6), concreto, P.x, gy + h / 2, P.z, ry); } }
    // lámparas en el intradós sobre la calle y los dos letreros verdes colgados (t=630 s)
    { const lamp = api.glow(0xfff1d2, { dia: .5, noche: 2.2 });
      for (let k = 25.835; k <= 26.06; k += .016) { const r = RA(k), a = (r.x - A.x) * ux + (r.z - A.z) * uz, l = (r.x - A.x) * lx + (r.z - A.z) * lz; if (Math.abs(l - lat(a)) > 12) continue;
        add(new THREE.BoxGeometry(.7, .14, .7), lamp, r.x, yInt(a) + 1.36, r.z); }
      const verde = (lin) => valla(512, 256, (x, w, h) => { x.fillStyle = '#17794b'; x.fillRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineWidth = 7; x.strokeRect(9, 9, w - 18, h - 18); x.fillStyle = '#fff'; x.font = 'bold 54px Arial, sans-serif';
        lin.forEach((t, i) => x.fillText(t, 36, 78 + i * 70)); });
      const r = RA(25.875), a = (r.x - A.x) * ux + (r.z - A.z) * uz, yb = yInt(a), fy = Math.atan2(-r.tx, -r.tz);
      for (const [d, txt] of [[1.6, ['↖ CHUAO', 'EL CAFETAL', '← LAS MERCEDES']], [-5.5, ['CENTRO', 'CHACAO', 'PETARE ↗']]]) {
        const P = { x: r.x + r.lx * d, z: r.z + r.lz * d }, s = add(new THREE.BoxGeometry(3.4, 1.9, .12), [concreto, concreto, concreto, concreto, verde(txt), concreto], P.x, yb - .9, P.z); s.rotation.y = fy;
        add(new THREE.BoxGeometry(.1, .9, .1), concreto, P.x, yb + .1, P.z); } }
    // valla de Capsuyen Pharma en la cara noroeste, de frente a la Av. Principal de Las Mercedes
    const cap = valla(1024, 320, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#ff3d9a'); gr.addColorStop(1, '#e8217f'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      x.fillStyle = '#ffffff'; x.font = 'bold 150px Arial Black, Arial, sans-serif'; x.textBaseline = 'alphabetic'; x.fillText('Capsuyen', 40, 170); x.font = 'bold 70px Arial, sans-serif'; x.fillText('PHARMA', 700, 240);
      x.fillStyle = '#3cc45a'; x.fillRect(0, 200, 640, 26); x.fillStyle = '#2f6ee0'; x.fillRect(0, 226, 640, 16); x.fillStyle = '#ffffff'; x.font = 'italic 40px Arial, sans-serif'; x.fillText('¡Somos la Cajita Morada!', 40, 292); });
    // la valla va en el muro bajo el viaducto, a la DERECHA de la calle y de cara a ella, sobre el mural (f_0252); desde la Av. Principal se ve de frente
    { const r0 = RA(25.795), r1 = RA(25.83), mx = (r0.x + r1.x) / 2 - (r0.lx + r1.lx) / 2 * 9.35, mz = (r0.z + r1.z) / 2 - (r0.lz + r1.lz) / 2 * 9.35, len = Math.hypot(r1.x - r0.x, r1.z - r0.z);
      const fondo = add(new THREE.BoxGeometry(len + 1, 6.2, .5), concretoOsc, mx - r0.lx * .3, (r0.y + r1.y) / 2 + 6.9, mz - r0.lz * .3, ang(r0.lx, r0.lz));
      const b = add(new THREE.PlaneGeometry(len, 5.6), cap, mx, (r0.y + r1.y) / 2 + 6.9, mz); b.rotation.y = Math.atan2(r0.lx, r0.lz); void fondo; }
    // muro bajo el viaducto, a la derecha de la calle: primero rombos y triángulos, después franjas redondeadas de colores
    const murA = api.canvasTex(1024, 128, (x, w, h) => { x.fillStyle = '#f2f0ea'; x.fillRect(0, 0, w, h); const C = ['#e23b2e', '#f2b705', '#1f9e5a', '#2a6dd8', '#f07c1e', '#8e3fb8', '#111111', '#2bb6c9', '#e8467c'];
      for (let i = 0; i < 26; i++) { const x0 = i * w / 26, cw = w / 26; x.fillStyle = C[(i * 5) % C.length]; x.beginPath(); x.moveTo(x0, 0); x.lineTo(x0 + cw, 0); x.lineTo(x0 + cw * .5, h * .5); x.fill();
        x.fillStyle = C[(i * 7 + 3) % C.length]; x.beginPath(); x.moveTo(x0, h); x.lineTo(x0 + cw, h); x.lineTo(x0 + cw * .5, h * .5); x.fill();
        x.fillStyle = '#111'; x.beginPath(); x.moveTo(x0 + cw * .5, h * .5); x.lineTo(x0 + cw, h * .08); x.lineTo(x0 + cw, h * .92); x.fill(); } });
    murA.wrapS = THREE.RepeatWrapping;
    const murB = api.canvasTex(1024, 128, (x, w, h) => { x.fillStyle = '#eef0f2'; x.fillRect(0, 0, w, h); const C = ['#f2b705', '#2a6dd8', '#e23b2e', '#f07c1e', '#2bb6c9', '#ffffff', '#e8467c'];
      for (let i = 0; i < 22; i++) { const x0 = i * w / 22 + 6, cw = w / 22 - 12; const r = cw / 2; x.fillStyle = C[i % C.length]; x.beginPath(); x.moveTo(x0, h - 8); x.lineTo(x0, r + 8); x.arc(x0 + r, r + 8, r, Math.PI, 0); x.lineTo(x0 + cw, h - 8); x.fill();
        x.fillStyle = C[(i + 3) % C.length]; x.fillRect(x0, h * .55, cw, h * .18); } });
    murB.wrapS = THREE.RepeatWrapping;
    const muro = (k0, k1, tex, off, alto, rep) => { const ps = [], uv = [], ix = []; let m = 0, s = 0, prev = null;
      for (let k = k0; k <= k1 + 1e-6; k += .004, m++) { const r = RA(k), x = r.x - r.lx * off, z = r.z - r.lz * off, gy = r.y - .2; if (prev) s += Math.hypot(x - prev[0], z - prev[1]); prev = [x, z];
        ps.push(x, gy, z, x, gy + alto, z); uv.push(s / rep, 0, s / rep, 1); if (m) { const o = (m - 1) * 2; ix.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); } }
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.setIndex(ix); ge.computeVertexNormals();
      g.add(dos(ge, new THREE.MeshStandardMaterial({ map: tex, roughness: .85, side: THREE.DoubleSide })));
      // coronamiento
      const cp = [], ci = []; m = 0; for (let k = k0; k <= k1 + 1e-6; k += .004, m++) { const r = RA(k); for (const d of [off - .2, off + .2]) cp.push(r.x - r.lx * d, r.y - .2 + alto + .15, r.z - r.lz * d); if (m) { const o = (m - 1) * 2; ci.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); } }
      const gc = new THREE.BufferGeometry(); gc.setAttribute('position', new THREE.Float32BufferAttribute(cp, 3)); gc.setIndex(ci); gc.computeVertexNormals(); g.add(dos(gc, new THREE.MeshStandardMaterial({ color: 0xcfcdc6, side: THREE.DoubleSide }))); };
    muro(25.775, 25.93, murA, 9.2, 4.0, 34);
    muro(25.945, 26.07, murB, 9.2, 3.0, 36);
    // valla de Tomás Seif en poste alto, a la izquierda sobre la bomba
    { const r = RA(25.80), P = { x: r.x + r.lx * 24, z: r.z + r.lz * 24 }, gy = GY(P.x, P.z);
      add(new THREE.CylinderGeometry(.55, .65, 15, 10), concreto, P.x, gy + 7.5, P.z);
      const ts = valla(768, 320, (x, w, h) => { x.fillStyle = '#0e2f6b'; x.fillRect(0, 0, w, h); x.fillStyle = '#1b6fd1'; x.fillRect(w * .62, 0, w * .38, h); x.fillStyle = '#ffffff'; x.font = 'bold 30px Arial, sans-serif'; x.fillText('TOMÁS SEIF', 30, 52);
        x.font = 'bold 44px Arial, sans-serif'; x.fillText('MEJORAMOS TU SALUD', 30, 130); x.fillText('Y ESTÉTICA DENTAL', 30, 182); x.fillStyle = '#ffd23a'; x.font = 'bold 30px Arial, sans-serif'; x.fillText('CON RESULTADOS DURADEROS', 30, 232);
        x.fillStyle = '#f1d9c4'; x.beginPath(); x.arc(w * .8, h * .42, 62, 0, 7); x.fill(); x.fillStyle = '#123a80'; x.fillRect(w * .68, h * .62, w * .24, h * .38); });
      const fy = Math.atan2(-r.tx, -r.tz) + .5; const pa = add(new THREE.BoxGeometry(13, 5.4, .4), [concretoOsc, concretoOsc, concretoOsc, concretoOsc, ts, concretoOsc], P.x, gy + 17.2, P.z); pa.rotation.y = fy; }
    // bomba de gasolina (techo blanco con franja roja) a la izquierda en 25,79
    { const c = LL(10.478599, -66.857049), gy = GY(c.x, c.z), r = RA(25.79), ry = ang(r.tx, r.tz);
      const tech = new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: .6 }), roja = api.glow(0xd42a2a, { dia: .2, noche: .8 });
      add(new THREE.BoxGeometry(22, 1.1, 13), [roja, roja, tech, tech, roja, roja], c.x, gy + 5.6, c.z, ry);
      for (const [a, b] of [[-7, -3.5], [7, -3.5], [-7, 3.5], [7, 3.5]]) add(new THREE.BoxGeometry(.5, 5.1, .5), tech, c.x + Math.cos(ry) * a + Math.sin(ry) * b, gy + 2.55, c.z - Math.sin(ry) * a + Math.cos(ry) * b, ry);
      for (const a of [-4, 4]) add(new THREE.BoxGeometry(1.2, 1.6, .7), roja, c.x + Math.cos(ry) * a, gy + .8, c.z - Math.sin(ry) * a, ry); }
  }

  // ═════════ 4. Puente de El Ciempiés: parapeto de concreto a la izquierda y señal verde ═════════
  {
    // 20-nov: el paño amarillo del elevado se apaga (sinBaranda en mercedes.js) y el parapeto izquierdo arranca en 26,40 (t=643,75:
    // New Jersey con riel metálico y el valle abierto); el derecho en 26,45 (en 26,40–26,45 está la acera de la Cruz Roja, sin muro)
    const ps = [], ix = []; let m = 0; const k0 = 26.40, k1 = 26.765;
    for (let k = k0; k <= k1 + 1e-6; k += .003, m++) { const r = RA(k); for (const [d, h] of [[6.95, -.35], [6.95, 1.0], [7.75, 1.0], [7.75, -2.2]]) ps.push(r.x + r.lx * d, r.y + h, r.z + r.lz * d);
      if (m) { const o = (m - 1) * 4; for (const [a, b] of [[0, 1], [1, 2], [2, 3]]) ix.push(o + a, o + 4 + a, o + b, o + b, o + 4 + a, o + 4 + b); } }
    const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); ge.setIndex(ix); ge.computeVertexNormals();
    g.add(dos(ge, new THREE.MeshStandardMaterial({ color: 0xb4b2ab, roughness: .95, side: THREE.DoubleSide })));
    // la baranda amarilla del elevado genérico queda dentro del parapeto; a la derecha, bordillo y acera (no baranda)
    const ps2 = [], ix2 = []; m = 0;
    for (let k = 26.45; k <= k1 + 1e-6; k += .003, m++) { const r = RA(k); for (const [d, h] of [[-6.95, -.35], [-6.95, 1.2], [-7.7, 1.2], [-7.7, -.35]]) ps2.push(r.x + r.lx * d, r.y + h, r.z + r.lz * d);
      if (m) { const o = (m - 1) * 4; for (const [a, b] of [[0, 1], [1, 2], [2, 3]]) ix2.push(o + a, o + 4 + a, o + b, o + b, o + 4 + a, o + 4 + b); } }
    const ge2 = new THREE.BufferGeometry(); ge2.setAttribute('position', new THREE.Float32BufferAttribute(ps2, 3)); ge2.setIndex(ix2); ge2.computeVertexNormals();
    g.add(dos(ge2, new THREE.MeshStandardMaterial({ color: 0x8f8f89, roughness: .95, side: THREE.DoubleSide })));
    // señal verde DIST. EL CIEMPIÉS / LAB. MERCEDES a la derecha (f_0261)
    const r = RA(26.78), P = { x: r.x - r.lx * 9, z: r.z - r.lz * 9 }, gy = GY(P.x, P.z) - .2;
    const sm = valla(512, 256, (x, w, h) => { x.fillStyle = '#16794a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineWidth = 8; x.strokeRect(10, 10, w - 20, h - 20); x.fillStyle = '#fff'; x.font = 'bold 50px Arial, sans-serif'; x.fillText('DIST. EL CIEMPIÉS', 34, 100); x.fillText('LAB. MERCEDES', 34, 180); x.font = 'bold 64px Arial'; x.fillText('↑', w - 70, 150); });
    add(new THREE.CylinderGeometry(.14, .14, 6, 8), concreto, P.x, gy + 3, P.z);
    const s = add(new THREE.BoxGeometry(3.6, 1.8, .12), [concreto, concreto, concreto, concreto, sm, concreto], P.x + r.lx * 1.5, gy + 5.6, P.z + r.lz * 1.5); s.rotation.y = Math.atan2(-r.tx, -r.tz);
  }
  // ═════════ 5. Hotel Tamanaco y Eurobuilding (19-nov, 5ª pasada, con foto de referencia de cada uno) ═════════
  // cajaUV(): caja cuya textura de fachada se repite cada `bay` m en horizontal y cada `fh` m (un piso) en vertical, para que todas las
  // piezas compartan un solo material (el fusionador las junta) y la ventana tenga siempre el mismo tamaño.
  const cajaUV = (w, h, d, bay, fh) => { const ge = new THREE.BoxGeometry(w, h, d), uv = ge.attributes.uv;
    for (let f = 0; f < 6; f++) { if (f === 2 || f === 3) continue; const su = (f < 2 ? d : w) / bay, sv = h / fh; for (let j = 0; j < 4; j++) { const i = f * 4 + j; uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); } }
    return ge; };
  // losa(): cuerpo de hotel piso a piso. A, B = extremos del eje en metros (este, norte) desde ref; ancho en m. o: fh (alto de piso),
  // bay, frente (+1 = la cara a la izquierda de A→B es la de las terrazas), paso (retranqueo por piso del frente), cortaA / cortaB
  // ([desde piso, m por piso]: la testera baja en escalones), pisos de fachada fach/tras/test, pb (material de la planta baja), techo.
  const losa = (ref, A, B, ancho, pisos, o) => {
    const fh = o.fh || 3.3, bay = o.bay || 7.2, c = LL(ref[0], ref[1]), P0 = { x: c.x + A[0], z: c.z - A[1] }, P1 = { x: c.x + B[0], z: c.z - B[1] };
    const L = Math.hypot(P1.x - P0.x, P1.z - P0.z), ux = (P1.x - P0.x) / L, uz = (P1.z - P0.z) / L, nx = uz, nz = -ux, ry = ang(ux, uz), fr = o.frente || 1, pf = o.paso || 0;
    let gmin = 1e9, gmax = -1e9; for (let t = 0; t <= 1.001; t += .25) for (const s of [-1, 0, 1]) { const gy = GY(P0.x + (P1.x - P0.x) * t + nx * s * ancho / 2, P0.z + (P1.z - P0.z) * t + nz * s * ancho / 2); gmin = Math.min(gmin, gy); gmax = Math.max(gmax, gy); }
    const mx = (P0.x + P1.x) / 2, mz = (P0.z + P1.z) / 2, y0 = (o.y0 ?? gmax) + (o.dy || 0), techo = o.techo || blancoT;
    const mats = (fa, tr, te) => fr > 0 ? [fa, tr, techo, techo, te, te] : [tr, fa, techo, techo, te, te];
    const corta = (cc, i) => cc && i >= cc[0] ? (i - cc[0] + 1) * cc[1] : 0;
    // zócalo: de la ladera al primer piso, con la misma fachada (en la ladera asoman pisos de servicio)
    const hz = y0 - gmin + 1.5; add(cajaUV(ancho, hz, L, bay, fh), mats(o.pb || o.fach, o.pb || o.tras, o.test), mx, gmin - 1.5 + hz / 2, mz, ry);
    let prev = null, y = y0;
    for (let i = 0; i < pisos; i++) {
      const w = ancho - i * pf, off = -fr * pf * i / 2, a = corta(o.cortaA, i), b = corta(o.cortaB, i), Lr = L - a - b, cx = mx + nx * off + ux * (a - b) / 2, cz = mz + nz * off + uz * (a - b) / 2;
      if (Lr < 6 || w < 6) break;
      add(cajaUV(w, fh, Lr, bay, fh), mats(i === 0 && o.pb ? o.pb : o.fach, i === 0 && o.pb ? o.pb : o.tras, o.test), cx, y + fh / 2, cz, ry);
      // antepecho corrido de la terraza que deja el piso de abajo (el balcón que se ve desde la calle)
      if (prev && pf > 0) { const e = fr * (prev.w / 2 - .12); add(new THREE.BoxGeometry(.24, 1.05, prev.Lr), blancoT, prev.cx + nx * e, y + .52, prev.cz + nz * e, ry); }
      prev = { w, Lr, cx, cz }; y += fh;
    }
    // pretil de la azotea
    if (prev) for (const s of [-1, 1]) { const e = s * (prev.w / 2 - .1); add(new THREE.BoxGeometry(.2, .9, prev.Lr), blancoT, prev.cx + nx * e, y + .45, prev.cz + nz * e, ry); }
    return { y, y0, gmin, mx, mz, nx, nz, ux, uz, ry, L, P0, P1, top: prev };
  };
  const blancoT = api.concrete(0xe2e0d8);
  // ── Hotel Tamanaco InterContinental (1953). Referencia: foto desde Las Mercedes (Wikimedia Commons, «Tamanaco Hotel, Caracas»), el
  // sello de correo de 1953 y la imagen satelital: un solo cuerpo blanco y largo de ~10 pisos que se dobla en la ladera (ala oeste, que
  // mira al norte, y ala diagonal hacia el noreste, que mira a Las Mercedes), con terrazas corridas en cada piso por la cara del valle,
  // la testera oeste bajando en escalones, el bloque central más alto con el letrero verde «Tamanaco Inter-Continental» en la azotea,
  // la piscina en forma de riñón y la hilera de astas al pie del ala oeste, y la marquesina circular del acceso al sur. Huella OSM.
  {
    const ref = [10.477564, -66.856146];
    const tex = api.canvasTex(256, 128, (x, w, h) => { x.fillStyle = '#e6e4dc'; x.fillRect(0, 0, w, h); x.fillStyle = '#bdbab1'; x.fillRect(0, 0, w, h * .05);
      for (const a of [.07, .54]) { x.fillStyle = '#353d46'; x.fillRect(a * w, h * .2, w * .36, h * .5); x.fillStyle = 'rgba(255,255,255,.16)'; x.fillRect(a * w, h * .2, w * .36, h * .09); x.fillStyle = '#e2e0d8'; x.fillRect(a * w + w * .175, h * .2, 3, h * .5); } });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    const fach = new THREE.MeshStandardMaterial({ map: tex, roughness: .82 }), test = api.concrete(0xe0ded6);
    const base = { fh: 3.3, bay: 7.2, fach, tras: fach, test, frente: 1, techo: api.concrete(0xaeaea2) };   // azoteas y terrazas gris verdoso (satelital)
    // ala oeste (mira al norte): 10 pisos con terrazas y la testera oeste en escalones (el «zigurat» de la foto)
    const o1 = losa(ref, [-99, -12], [-24, -13], 20, 10, { ...base, paso: .85, cortaA: [3, 5.2] });
    // ala diagonal hacia el noreste (mira al noroeste, a Las Mercedes): 10 pisos; su testera noreste es la que baja en escalones a la
    // izquierda de la foto desde Las Mercedes
    losa(ref, [-30, -16], [33, 31], 21, 10, { ...base, paso: .85, cortaB: [2, 3.8], y0: o1.y0 });
    // bloque noreste (salones y habitaciones) más bajo, y ala sur detrás (no se ve desde la ruta)
    losa(ref, [12, 34], [54, 70], 30, 6, { ...base, paso: .6, y0: o1.y0 });
    losa(ref, [-2, -22], [30, -62], 20, 8, { ...base, frente: -1, paso: .5 });
    // bloque central del codo, dos pisos más alto, con el letrero verde en la azotea de cara a Las Mercedes
    { const k = LL(ref[0] - 7 / 111320, ref[1] - 24 / 109470), top = o1.y0 + 10 * 3.3, gy = GY(k.x, k.z);
      add(cajaUV(17, top + 2 * 3.3 - gy, 15, 7.2, 3.3), [fach, fach, blancoT, blancoT, fach, fach], k.x, (top + 2 * 3.3 + gy) / 2, k.z, ang(.79, -.61));
      const v = RA(25.62), dx = v.x - k.x, dz = v.z - k.z, d = Math.hypot(dx, dz), fx = dx / d, fz = dz / d;
      const tt = valla(1024, 384, (x, w, h) => { x.fillStyle = '#1f8a62'; x.fillRect(0, 0, w, h); x.fillStyle = '#f6f4ee'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 200px Georgia, serif'; x.fillText('Tamanaco', w / 2, h * .4);
        x.font = 'bold 84px Arial, sans-serif'; x.fillText('INTER·CONTINENTAL', w / 2, h * .82); });
      const verde = api.concrete(0x1d7a57), yS = top + 2 * 3.3 + 4.6;
      const s = add(new THREE.BoxGeometry(22, 8.2, .6), [verde, verde, verde, verde, tt, verde], k.x + fx * 2, yS, k.z + fz * 2); s.rotation.y = Math.atan2(fx, fz);
      for (const e of [-8, 8]) add(new THREE.BoxGeometry(.4, 4.6, .4), concretoOsc, k.x + fx * 1.6 + fz * e, top + 2 * 3.3 + .3, k.z + fz * 1.6 - fx * e); }
    // piscina en forma de riñón con su terraza, al norte del ala oeste
    { const k = LL(ref[0] + 22 / 111320, ref[1] - 76 / 109470), gy = GY(k.x, k.z);
      add(new THREE.BoxGeometry(44, .9, 26), api.concrete(0xd9d6cc), k.x, gy - .3, k.z, .05);
      const sh = new THREE.Shape(); for (let i = 0; i <= 40; i++) { const t = i / 40 * Math.PI * 2, r = 1 - .32 * Math.max(0, Math.cos(t * 2 - 1.2)) ** 3; const px = Math.cos(t) * 16 * r, pz = Math.sin(t) * 6.5 * r + Math.sin(t * 2) * 1.5; i ? sh.lineTo(px, pz) : sh.moveTo(px, pz); }
      const agua = new THREE.MeshStandardMaterial({ color: 0x35b4d8, roughness: .12, metalness: .15, emissive: 0x0c3a48, emissiveIntensity: .35 });
      const p = new THREE.Mesh(new THREE.ShapeGeometry(sh), agua); p.rotation.set(-Math.PI / 2, 0, .05); p.position.set(k.x, gy + .17, k.z); g.add(p); }
    // hilera de astas con banderas al pie del ala oeste (foto: delante del cuerpo bajo, sobre los jardines)
    { const col = [0xd12f2f, 0x1f5fbf, 0xf2c230, 0x2a9a4c, 0xffffff, 0xd12f2f, 0x1f5fbf, 0xe86a1a, 0x2a9a4c, 0xf2c230, 0x8e3fb8, 0x1f5fbf, 0xd12f2f, 0xffffff];
      const asta = api.concrete(0xf2f1ec), tela = col.map(c => api.concrete(c, { roughness: .8 }));
      for (let i = 0; i < 14; i++) { const e = -94 + i * 4.6, k = LL(ref[0] + 6.5 / 111320, ref[1] + e / 109470), gy = GY(k.x, k.z);
        add(new THREE.CylinderGeometry(.07, .09, 10, 6), asta, k.x, gy + 5, k.z);
        add(new THREE.BoxGeometry(1.7, 1.05, .04), tela[i], k.x + .9, gy + 9.3, k.z); } }
    // acceso al sur: rotonda con la fuente y la marquesina circular del pórtico
    { const k = LL(ref[0] - 54 / 111320, ref[1] - 41 / 109470), gy = GY(k.x, k.z);
      add(new THREE.CylinderGeometry(10, 10, .9, 32), blancoT, k.x, gy + 5.2, k.z);
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; add(new THREE.CylinderGeometry(.35, .35, 5, 8), blancoT, k.x + Math.cos(a) * 7, gy + 2.5, k.z + Math.sin(a) * 7); }
      add(new THREE.CylinderGeometry(6, 6.4, .5, 28), api.concrete(0x6f9e4c), k.x + 16, gy + .2, k.z - 10); }
  }
  // ── Hotel Eurobuilding (Chuao, calle La Guairita). Referencia: el video (t≈645–652 s) y la imagen satelital: torre BLANCA de 18
  // pisos (ala oeste de la huella OSM en zigzag) con fachadas de bandas horizontales —antepecho blanco y ventana corrida oscura—, la
  // testera oeste lisa con la columna de balcones apilados en el canto norte, una ranura vertical oscura y el emblema arriba; detrás,
  // el ala diagonal y el ala este de 13 pisos con las mismas bandas y torres de escalera blancas en las puntas. En la calle, la viga
  // oscura con «Eurobuilding» en letras blancas sobre la entrada (t≈651 s).
  {
    const ref = [10.482465, -66.850144];
    const tex = api.canvasTex(256, 64, (x, w, h) => { x.fillStyle = '#e8e7e2'; x.fillRect(0, 0, w, h); x.fillStyle = '#343b43'; x.fillRect(0, h * .22, w, h * .46);
      x.fillStyle = 'rgba(255,255,255,.2)'; x.fillRect(0, h * .22, w, h * .07); x.fillStyle = '#cfd2d4'; for (let i = 0; i < 4; i++) x.fillRect(i * w / 4, h * .22, 2, h * .46); x.fillStyle = '#d3d0c8'; x.fillRect(0, h * .68, w, h * .035); });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    const fach = new THREE.MeshStandardMaterial({ map: tex, roughness: .8 }), test = api.concrete(0xe3e2dc);
    const pbTex = api.canvasTex(256, 64, (x, w, h) => { x.fillStyle = '#d8d6cf'; x.fillRect(0, 0, w, h); x.fillStyle = '#20262c'; x.fillRect(w * .04, h * .12, w * .92, h * .76); x.fillStyle = '#9aa3aa'; for (let i = 0; i < 6; i++) x.fillRect(w * .04 + i * w * .184, h * .12, 3, h * .76); });
    pbTex.wrapS = pbTex.wrapT = THREE.RepeatWrapping; const pb = new THREE.MeshStandardMaterial({ map: pbTex, roughness: .4, metalness: .2 });
    const base = { fh: 3.1, bay: 8, fach, tras: fach, test, pb, frente: 1, techo: api.concrete(0xb2b3b0) };
    const t = losa(ref, [-94, .6], [-16, 22.2], 22, 18, base);
    losa(ref, [-20, 25], [22, -19], 22, 13, { ...base, y0: t.y0 });
    const e = losa(ref, [20, -21], [88.5, -1.3], 24, 13, { ...base, y0: t.y0 });
    // testera oeste: columna de balcones en el canto norte, ranura oscura, emblema y casetas
    const W0 = { x: t.P0.x - t.ux * .3, z: t.P0.z - t.uz * .3 }, oscuro = api.concrete(0x2b3036);
    for (let i = 1; i < 18; i++) { const y = t.y0 + i * 3.1, cx = W0.x + t.nx * 8 - t.ux * .8, cz = W0.z + t.nz * 8 - t.uz * .8;
      add(new THREE.BoxGeometry(5.2, .28, 1.7), blancoT, cx, y, cz, t.ry); add(new THREE.BoxGeometry(5.2, 1.0, .16), blancoT, cx - t.ux * .8, y + .6, cz - t.uz * .8, t.ry); }
    add(new THREE.BoxGeometry(2.4, 15 * 3.1, .3), oscuro, W0.x - t.nx * 3.5, t.y0 + 2 * 3.1 + 15 * 3.1 / 2, W0.z - t.nz * 3.5, t.ry);
    const emb = valla(256, 256, (x, w, h) => { x.fillStyle = '#e9e8e2'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7d848b'; x.lineWidth = 14; x.beginPath(); x.arc(w / 2, h / 2, w * .4, 0, 7); x.stroke();
      x.fillStyle = '#5d646b'; x.font = 'bold 150px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('E', w / 2, h * .54); });
    const em = add(new THREE.BoxGeometry(4.2, 4.2, .2), [test, test, test, test, emb, test], W0.x + t.nx * 1.5, t.y - 4, W0.z + t.nz * 1.5); em.rotation.y = Math.atan2(-t.ux, -t.uz);
    add(new THREE.BoxGeometry(12, 3.2, 9), test, t.mx - t.ux * 18, t.y + 1.6, t.mz - t.uz * 18, t.ry);
    add(new THREE.CylinderGeometry(1.8, .3, .9, 16), api.concrete(0xd9dbdc), t.mx - t.ux * 30, t.y + 2.2, t.mz - t.uz * 30);
    // torres de escalera blancas en las puntas del ala este (más altas que el cuerpo)
    for (const s of [-1, 1]) { const P = s < 0 ? e.P0 : e.P1, gy = GY(P.x, P.z) - 1; add(new THREE.BoxGeometry(8, e.y + 4 - gy, 7), test, P.x + e.ux * s * 2, (e.y + 4 + gy) / 2, P.z + e.uz * s * 2, e.ry); }
    // viga oscura con «Eurobuilding» sobre la entrada, a la derecha de la calle La Guairita (t≈651 s)
    { const r = RA(26.775), oscV = api.concrete(0x25292d), letras = valla(1024, 96, (x, w, h) => { x.fillStyle = '#25292d'; x.fillRect(0, 0, w, h); x.fillStyle = '#f4f4f0'; x.font = 'bold 72px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Eurobuilding', w / 2, h * .55); });
      const c0 = 10.5, c1 = 26, mx = r.x - r.lx * (c0 + c1) / 2, mz = r.z - r.lz * (c0 + c1) / 2, yb = r.y + 5.4;
      const v = add(new THREE.BoxGeometry(c1 - c0, 1.4, .9), [oscV, oscV, oscV, oscV, oscV, letras], mx, yb, mz); v.rotation.y = Math.atan2(r.tx, r.tz);
      for (const d of [c0 + .4, c1 - .4]) { const x = r.x - r.lx * d, z = r.z - r.lz * d, gy = Math.min(GY(x, z), r.y); add(new THREE.BoxGeometry(.7, yb - gy, .7), oscV, x, (yb + gy) / 2 - .3, z); } }
  }
  // ═════════ 6. Salida del viaducto, izquierda (km 25,90–26,03): muro oscuro con portón negro y árboles detrás (t=631–634 s) ═════════
  const hojaA = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true, vertexColors: true }), hojaB = hojaA, tronco = api.concrete(0x5a4a3a);
  let sem = 11; const rnd = () => (sem = (sem * 16807) % 2147483647) / 2147483647;
  // copa de follaje: esfera deformada con ruido, facetas chicas y dos tonos de verde por cara (masa de hojas, no un globo liso)
  const copaGeo = r => { const ge = new THREE.IcosahedronGeometry(r, 3), P = ge.attributes.position, n = P.count, col = new Float32Array(n * 3), h = (x, y, z) => { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return s - Math.floor(s); };
    for (let i = 0; i < n; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), kx = Math.round(x / r * 40), ky = Math.round(y / r * 40), kz = Math.round(z / r * 40), f = 1 + (h(kx, ky, kz) - .5) * .34 + Math.sin(x / r * 5 + kz) * .07; P.setXYZ(i, x * f, y * f * .8, z * f); }
    for (let i = 0; i < n; i += 3) { const u = h(i, r, 3.1), sol = .55 + .45 * Math.max(0, P.getY(i) / r), cr = (.035 + u * .03) * sol, cg = (.095 + u * .065) * sol, cb = (.02 + u * .02) * sol; for (let j = 0; j < 3; j++) { col[(i + j) * 3] = cr; col[(i + j) * 3 + 1] = cg; col[(i + j) * 3 + 2] = cb; } }
    ge.setAttribute('color', new THREE.BufferAttribute(col, 3)); ge.computeVertexNormals(); return ge; };
  const copa = (x, y, z, r, gy) => { const n = 4 + ((rnd() * 3) | 0); add(copaGeo(r * .82), hojaA, x, y, z);
    for (let i = 0; i < n; i++) { const a = i / n * 6.283 + rnd() * .8, q = r * (.42 + rnd() * .28), e = r * (.45 + rnd() * .3); add(copaGeo(q), hojaA, x + Math.cos(a) * e, y + (rnd() - .25) * r * .55, z + Math.sin(a) * e); }
    const yb = y - r * .45; if (yb - gy > .8) { add(new THREE.CylinderGeometry(.18, .32, yb - gy, 6), tronco, x, (yb + gy) / 2, z);
      for (const a of [rnd() * 6.283, rnd() * 6.283]) { const br = add(new THREE.CylinderGeometry(.08, .14, r * .8, 5), tronco, x + Math.cos(a) * r * .22, yb + r * .3, z + Math.sin(a) * r * .22); br.rotation.set(Math.sin(a) * .7, 0, -Math.cos(a) * .7); } } };
  {
    const ps = [], ix = []; let m = 0; const off = 8.6, alto = 3.3;
    for (let k = 25.90; k <= 26.03 + 1e-6; k += .004, m++) { const r = RA(k); for (const d of [off, off + .35]) for (const h of [-.3, alto]) ps.push(r.x + r.lx * d, r.y + h, r.z + r.lz * d);
      if (m) { const o = (m - 1) * 4; ix.push(o, o + 4, o + 1, o + 1, o + 4, o + 5, o + 1, o + 5, o + 3, o + 3, o + 5, o + 7, o + 2, o + 6, o + 3, o + 3, o + 6, o + 7); } }
    const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); ge.setIndex(ix); ge.computeVertexNormals();
    g.add(dos(ge, new THREE.MeshStandardMaterial({ color: 0x3e3f3c, roughness: .95, side: THREE.DoubleSide })));
    const r = RA(25.965), negro = api.concrete(0x16181a, { roughness: .6 });
    add(new THREE.BoxGeometry(5.5, 2.9, .2), negro, r.x + r.lx * (off - .15), r.y + 1.15, r.z + r.lz * (off - .15), ang(r.tx, r.tz) + Math.PI / 2);
    // los árboles detrás del muro los pone el motor (fx/correcciones/mercedes.js, veg.L)
  }
  // ═════════ 7. Puente de El Ciempiés: copas que asoman sobre el parapeto y vallas rosadas en postes a la derecha (t=642–650 s) ═════════
  {
    // las copas a los lados del puente son árboles del motor sembrados abajo (fx/correcciones/mercedes.js, arboles)
    const rosa = valla(256, 512, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f2559a'); gr.addColorStop(1, '#d92c7c'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.strokeStyle = '#ffffff'; x.lineWidth = 10; x.strokeRect(12, 12, w - 24, h - 24); });
    // 20-nov: el primero en 26,48 (el video lo pasa en t≈650,5 = km 26,48; estaba en 26,55 por el índice corrido)
    for (const k of [26.48, 26.62, 26.70]) { const q = RA(k), x =q.x - q.lx * 9.4, z = q.z - q.lz * 9.4, gy = Math.min(GY(x, z), q.y);
      add(new THREE.CylinderGeometry(.16, .2, q.y + 12.2 - gy, 8), concreto, x, (q.y + 12.2 + gy) / 2, z);
      const b = add(new THREE.BoxGeometry(3.2, 7.6, .15), [concreto, concreto, concreto, concreto, rosa, concreto], x + q.lx * .3, q.y + 8.2, z + q.lz * .3); b.rotation.y = Math.atan2(-q.tx, -q.tz); }   // pendón alto (t=645 s: llega a media torre del Eurobuilding)
  }
  // ═════════ 8. Muro de contención a la derecha bajo el viaducto (km 25,74–25,98; t=630 s): concreto claro alto junto a la vía de abajo;
  //  tapa el faldón del relieve del cerro, que quedaba como una mancha negra bajo el tablero ═════════
  { const ps = [], ix = []; let m = 0; const off = 27.5;
    for (let k = 25.74; k <= 25.98 + 1e-6; k += .004, m++) { const r = RA(k); for (const h of [-1.5, 11]) ps.push(r.x - r.lx * off, r.y + h, r.z - r.lz * off); if (m) { const o = (m - 1) * 2; ix.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); } }
    const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); ge.setIndex(ix); ge.computeVertexNormals();
    g.add(dos(ge, new THREE.MeshStandardMaterial({ color: 0xaaa79f, roughness: .95, side: THREE.DoubleSide }))); }
  // ═════════ 9. Valla larga a la derecha bajo el viaducto (t=630 s): panel morado con manchas amarillas sobre una franja oscura; genérica ═════════
  { const r = RA(25.92), P = { x: r.x - r.lx * 12.5, z: r.z - r.lz * 12.5 };
    const vm = valla(1024, 256, (x, w, h) => { x.fillStyle = '#7b2e86'; x.fillRect(0, 0, w, h * .72); x.fillStyle = '#f2c91f'; for (const [cx, cy, rr] of [[120, 90, 70], [300, 120, 44], [560, 80, 52], [800, 110, 66]]) { x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.fill(); }
      x.fillStyle = '#ffffff'; x.fillRect(380, 40, 140, 22); x.fillRect(380, 80, 100, 22); x.fillRect(650, 60, 110, 22); x.fillStyle = '#1d1e20'; x.fillRect(0, h * .72, w, h * .28); x.fillStyle = '#c9c7c0'; x.fillRect(80, h * .82, 300, 14); x.fillRect(640, h * .82, 220, 14); });
    const b = add(new THREE.BoxGeometry(16, 4.4, .3), [concretoOsc, concretoOsc, concretoOsc, concretoOsc, vm, concretoOsc], P.x, r.y + 4.6, P.z); b.rotation.y = Math.atan2(-r.tx, -r.tz) - .25; }
  // ═════════ 10. Ladera del Tamanaco: arbolado entre el viaducto y el hotel (t=622–627 s: el hotel asoma sobre copas) ═════════
  // (sembrado con árboles del motor desde fx/correcciones/mercedes.js, arboles)
  // ═════════ 11. CCCT y Cubo Negro (Chuao): fuera del cuadro del video, pero a 250–500 m a la izquierda del ramal y del puente de El Ciempiés.
  //  Ubicación y tamaño de las huellas OSM (Centro Banaven «Cubo Negro» 81×81 m, 50 m; Pirámide Invertida 85×83 m, 6 niveles; podio del CCCT
  //  284×208 m). El podio del CCCT va en terrazas de concreto con bandas de vidrio oscuro; la Pirámide Invertida crece piso a piso. ═════════
  { const vidN = api.glass(0x0e1216, { roughness: .08, metalness: .9, envMapIntensity: 1.4 }), conc = api.concrete(0x8f8c85);
    const terr = api.facade({ pared: '#9b978e', vidrio: '#1b2229', pisos: 2, vanos: 16, bandas: true, encendidas: .25, seed: 41, roughness: .8, metalness: .1 });
    const caja = (la, lo, w, d, y0, h, mat) => { const c = LL(la, lo), b = add(new THREE.BoxGeometry(w, h, d), mat, c.x, y0 + h / 2, c.z); return b; };
    const gyAt = (la, lo, w, d) => { const c = LL(la, lo); let m = 1e9; for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) m = Math.min(m, GY(c.x + a * w / 2, c.z + b * d / 2)); return m - 1; };
    // Cubo Negro: zócalo retranqueado y el cubo de vidrio negro espejo
    { const la = 10.484244, lo = -66.853311, y0 = gyAt(la, lo, 81, 81); caja(la, lo, 74, 74, y0, 5, conc); caja(la, lo, 81, 81, y0 + 5, 46, vidN); caja(la, lo, 81.6, 81.6, y0 + 51, .8, conc); }
    // podio del CCCT en cuatro terrazas
    { const la = 10.485177, lo = -66.855283; let y = gyAt(la, lo, 250, 180);
      for (const [w, d, h] of [[255, 185, 7.5], [225, 160, 6], [195, 135, 6], [165, 110, 6]]) { caja(la, lo, w, d, y, h, [terr, terr, conc, conc, terr, terr]); y += h; } }
    // Pirámide Invertida: cada piso más ancho que el de abajo, vidrio oscuro
    { const la = 10.485326, lo = -66.8555; let y = gyAt(la, lo, 60, 60); for (let i = 0; i < 6; i++) { const w = 58 + i * 5.4; caja(la, lo, w, w, y, 3.8, vidN); caja(la, lo, w + .6, w + .6, y + 3.8, .5, conc); y += 4.3; } }
  }
  // ═════════ 12. Rampa de El Ciempiés, km 26,11–26,40 (20-nov, con las anclas t=636,3 = km 26,15 · t=639,6 = 26,21 bajo la autopista ·
  //  t=643,0 = 26,34 · t=643,75 = 26,40). Hasta el 19-nov había un muro gris de 6 m a la derecha en todo el tramo (puesto con el índice
  //  corrido 0,16 km). El video muestra a la derecha: murete bajo el talud de grama de la autopista (26,11–26,165, t=636,5–637,5), el muro
  //  de contención alto solo en la llegada al paso bajo la autopista (26,165–26,20, t=638,5), acera con reja blanca y edificios después
  //  (26,215–26,265, t=640,25–641,25) y el corte de roca con matorral y edificios arriba (26,27–26,375, t=641,5–643,25); a la izquierda,
  //  el muro verde claro (26,27–26,32, t=641,5–642,25). Y el paso bajo la Autopista Prados del Este (dos calzadas sobre la ruta, 26,21). ═════════
  {
    // barrido de una sección [d, h] a lo largo de la ruta (d > 0 a la DERECHA, m desde el eje; h sobre la cota de la ruta); u = metros/rep
    const barre = (k0, k1, sec, mat, paso = .003, rep = 0) => { const ps = [], uv = [], ix = []; let m = 0, n = 0, s = 0, prev = null;
      for (let k = k0; k <= k1 + 1e-6; k += paso, m++) { const r = RA(k), S = sec(k); n = S.length; if (prev) s += Math.hypot(r.x - prev.x, r.z - prev.z); prev = r;
        S.forEach(([d, h], a) => { ps.push(r.x - r.lx * d, r.y + h, r.z - r.lz * d); uv.push(rep ? s / rep : 0, a / (n - 1)); });
        if (m) { const o = (m - 1) * n; for (let a = 0; a < n - 1; a++) ix.push(o + a, o + n + a, o + a + 1, o + a + 1, o + n + a, o + n + a + 1); } }
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.setIndex(ix); g.add(dos(ge, mat)); };
    const lin = (k, a, b) => Math.max(0, Math.min(1, (k - a) / (b - a)));
    const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide, ...o });
    // derecha: murete de 2,3 m que sube a muro de contención de 6 m, y detrás el talud de grama hasta el terreno (relieve +5 m desde 16 m)
    const hM = k => 2.3 + 3.7 * lin(k, 26.163, 26.176);
    barre(26.11, 26.199, k => [[7.4, -.4], [7.4, hM(k)], [7.9, hM(k) + .2], [9.9, hM(k) + .2]], M(0xaaa69c));
    barre(26.11, 26.199, k => [[9.8, hM(k) + .15], [13.5, Math.max(hM(k) + .3, 4.3)], [21, 5.4]], M(0x6c8a3c));
    // derecha tras el paso bajo la autopista: reja blanca sobre murete en el borde de la acera
    const rejaB = api.canvasTex(128, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#eceae4'; for (let i = 0; i < 8; i++) x.fillRect(i * w / 8 + 4, 0, 5, h); x.fillRect(0, 2, w, 8); x.fillRect(0, h - 10, w, 10); });
    rejaB.wrapS = THREE.RepeatWrapping;
    barre(26.216, 26.266, () => [[8.8, -.4], [8.8, .5]], M(0xe4e2dc));
    barre(26.216, 26.266, () => [[8.8, .5], [8.8, 1.8]], new THREE.MeshStandardMaterial({ map: rejaB, alphaTest: .5, side: THREE.DoubleSide, roughness: .6 }), .003, 1.6);
    // derecha: corte de roca de 9 m con matorral arriba (el relieve +9 m arranca detrás, a 13 m)
    const H = k => 9 * lin(k, 26.272, 26.292) * (1 - lin(k, 26.356, 26.378));
    const rr = (k, j) => Math.sin(k * 1700 + j * 2.1) * .5 + Math.sin(k * 4100 + j * 5.3) * .35;
    barre(26.268, 26.38, k => { const h = H(k); return [[7.6, -.4], [7.8 + rr(k, 1) * .4, .3 + h * .3], [8.6 + rr(k, 2), h * .62], [9.8 + rr(k, 3), h * .86]]; }, M(0x7d7466, { flatShading: true }), .0025);
    barre(26.268, 26.38, k => { const h = H(k); return [[9.7 + rr(k, 3), h * .86], [11.2 + rr(k, 4) * .6, h + .3], [14.5, h + 1.1]]; }, M(0x4e6a2e, { flatShading: true }), .0025);
    // izquierda: muro verde claro de paneles (t=641,5–642,25)
    barre(26.268, 26.322, k => [[-7.6, -.4], [-7.6, 3.6 * Math.min(1, lin(k, 26.268, 26.274) + .3)]], M(0xa8c98a, { roughness: .85 }));
    // paso bajo la Autopista Prados del Este (km 26,21; t=638,5–640): dos calzadas de tres canales (OSM) sobre pilas fuera de la vía
    const yI = RA(26.206).y + 6.8, calz = [
      [[10.480052, -66.853799], [10.48021, -66.853748], [10.480489, -66.853687], [10.480659, -66.853661], [10.480829, -66.853653]],
      [[10.480938, -66.853777], [10.480763, -66.853782], [10.480632, -66.853788], [10.480405, -66.853821], [10.480166, -66.853889], [10.479977, -66.853968]]];
    const ruta = []; for (let k = 26.09; k <= 26.33; k += .003) ruta.push(RA(k));
    const dR = (x, z) => { let d = 1e9; for (const r of ruta) d = Math.min(d, Math.hypot(r.x - x, r.z - z)); return d; };
    const tab = api.concrete(0x8d8a83), bajo = api.concrete(0x6f6d68);
    for (const C of calz) { const P = C.map(([a, b]) => LL(a, b));
      for (let i = 1; i < P.length; i++) { const A = P[i - 1], B = P[i], L = Math.hypot(B.x - A.x, B.z - A.z), mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2, ry = ang(B.x - A.x, B.z - A.z);
        add(new THREE.BoxGeometry(13, 1.7, L + .6), bajo, mx, yI + .85, mz, ry);
        for (const s of [-1, 1]) add(new THREE.BoxGeometry(.35, 1.1, L + .6), tab, mx + Math.cos(ry) * 6.3 * s, yI + 2.25, mz - Math.sin(ry) * 6.3 * s, ry); }
      for (const p of P) { if (dR(p.x, p.z) < 8.5) continue; const gy = GY(p.x, p.z) - .3; if (yI - gy < 2) continue; add(new THREE.BoxGeometry(1.8, yI - gy, 1.8), tab, p.x, (yI + gy) / 2, p.z); } }
  }
  // ═════════ 13. Calle La Guairita (km 26,70–26,95, t=651–659 s): una sola calzada de tres canales entre brocales amarillos. A la izquierda,
  //  franja de grama y parapeto de concreto (la Río de Janeiro va aparte, en puente, más allá) y luego verja negra sobre murete con árboles;
  //  a la derecha, acera y verja negra sobre muro blanco con arbolado; la bomba de gasolina de techo rojo a la izquierda en el 26,90 ═════════
  {
    const cintaV = (k0, k1, d, y0, y1, mat, rep) => { const ps = [], uv = [], ix = []; let m = 0, s = 0, prev = null;
      for (let k = k0; k <= k1 + 1e-6; k += .003, m++) { const r = RA(k), x = r.x + r.lx * d, z = r.z + r.lz * d; if (prev) s += Math.hypot(x - prev[0], z - prev[1]); prev = [x, z];
        ps.push(x, r.y + y0, z, x, r.y + y1, z); uv.push(s / rep, 0, s / rep, 1); if (m) { const o = (m - 1) * 2; ix.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); } }
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.setIndex(ix); ge.computeVertexNormals(); g.add(dos(ge, mat)); };
    const rejaT = api.canvasTex(128, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#16181a'; for (let i = 0; i < 8; i++) x.fillRect(i * w / 8 + 3, 0, 5, h); x.fillRect(0, 4, w, 7); x.fillRect(0, h - 16, w, 7); });
    rejaT.wrapS = THREE.RepeatWrapping; const reja = new THREE.MeshStandardMaterial({ map: rejaT, alphaTest: .5, side: THREE.DoubleSide, roughness: .6 });
    const muroB = new THREE.MeshStandardMaterial({ color: 0xe9e7e0, roughness: .9, side: THREE.DoubleSide }), parap = new THREE.MeshStandardMaterial({ color: 0xb9b6ae, roughness: .95, side: THREE.DoubleSide });
    // izquierda: parapeto bajo de concreto (26,70–26,80) y verja negra sobre murete (26,80–26,87)
    cintaV(26.70, 26.80, 7.7, -.4, .95, parap, 10); cintaV(26.70, 26.80, 7.95, -.4, .95, parap, 10);
    cintaV(26.80, 26.87, 7.8, -.4, .6, muroB, 10); cintaV(26.80, 26.87, 7.8, .6, 2.3, reja, 2.2);
    // derecha: muro blanco con verja negra encima, detrás de la acera (26,785–26,93)
    cintaV(26.785, 26.93, -9.3, -.5, .85, muroB, 10); cintaV(26.785, 26.93, -9.3, .85, 2.6, reja, 2.2);
    // bomba de gasolina: techo blanco de borde rojo sobre seis columnas, dos islas de surtidores
    { const r = RA(26.895), cx = r.x + r.lx * 19, cz = r.z + r.lz * 19, gy = Math.min(GY(cx, cz), r.y + .2), ry = ang(r.tx, r.tz);
      const rojo = api.concrete(0xd8462c), tech = api.concrete(0xf3f2ee), gris = api.concrete(0x9a9c9d);
      add(new THREE.BoxGeometry(14, 1.2, 26), [rojo, rojo, tech, tech, rojo, rojo], cx, gy + 5.6, cz, ry);
      for (const a of [-9, 0, 9]) for (const b of [-3.5, 3.5]) add(new THREE.BoxGeometry(.5, 5.1, .5), tech, cx + Math.sin(ry) * a + Math.cos(ry) * b, gy + 2.55, cz + Math.cos(ry) * a - Math.sin(ry) * b, ry);
      for (const b of [-3.5, 3.5]) for (const a of [-5, 5]) add(new THREE.BoxGeometry(.8, 1.7, 1.4), gris, cx + Math.sin(ry) * a + Math.cos(ry) * b, gy + .85, cz + Math.cos(ry) * a - Math.sin(ry) * b, ry);
      add(new THREE.BoxGeometry(16, .14, 30), api.concrete(0xb4b2ac), cx, gy + .05, cz, ry); }
  }
  // ═════════ 14. Plaza Alfredo Sadel (km 25,06–25,20, a la IZQUIERDA; 21-nov, 7ª pasada) ═════════
  //  Planta: polígono OSM de la plaza (way 239255209) y la planta del proyecto de W. J. Alcock (guiaccs.com, 2006): jardín elevado
  //  en cuña al noroeste con muro bajo de granito oscuro, grama y árboles (úcaros, mare mare, araguaney plateado: nodos OSM), gradas
  //  en la punta sureste, explanada abierta de baldosa terracota en retícula diagonal y los «Mástiles» de Magdalena Fernández (2008)
  //  en la esquina de la Av. La Trinidad: mirador circular sobre un tubo inclinado y astas blancas con esferas de luz.
  //  Video (cámara con capó): t=610,5 s semáforo de la Calle Londres (km 25,02) y empieza el adoquín de ladrillo de la calzada con
  //  bolardos a los dos lados; t=612,5 asoma el asta de la esfera; t≈614,7 el tubo grueso pasa por la izquierda (= km 25,166, nodo
  //  OSM de la escultura); t=616 cebra de La Trinidad (25,206). En este tramo el índice de fotogramas va ~0,1 km ADELANTADO.
  const W = (k, l) => { const r = RA(k); return { x: r.x + r.lx * l, z: r.z + r.lz * l, y: r.y, r }; };
  const dentro = (x, z, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a.z > z) !== (b.z > z) && x < (b.x - a.x) * (z - a.z) / (b.z - a.z) + a.x) c = !c; } return c; };
  const placa = (P, y0, y1, top, side) => { const cx = P.reduce((s, p) => s + p.x, 0) / P.length, cz = P.reduce((s, p) => s + p.z, 0) / P.length;
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(P.map(p => new THREE.Vector2(p.x - cx, -(p.z - cz)))), { depth: y1 - y0, bevelEnabled: false }), [top, side]);
    m.rotation.x = -Math.PI / 2; m.position.set(cx, y0, cz); g.add(m); return m; };
  const tubo = (a, b, r0, r1, mat, seg = 12) => { const d = new THREE.Vector3(b.x - a.x, b.y - a.y, b.z - a.z), L = d.length();
    const m = add(new THREE.CylinderGeometry(r1, r0, L, seg), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); m.quaternion.setFromUnitVectors(UP, d.normalize()); return m; };
  const hsh = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  {
    const PL = [[10.48244, -66.86196], [10.482538, -66.86191], [10.482475, -66.861771], [10.482051, -66.860836], [10.481915, -66.860902], [10.48161, -66.861058], [10.481952, -66.861439]].map(([a, b]) => LL(a, b));
    let gMin = 1e9, gMax = -1e9; const xs = PL.map(p => p.x), zs = PL.map(p => p.z);
    for (let x = Math.min(...xs); x <= Math.max(...xs); x += 3) for (let z = Math.min(...zs); z <= Math.max(...zs); z += 3) if (dentro(x, z, PL)) { const y = GY(x, z); gMin = Math.min(gMin, y); gMax = Math.max(gMax, y); }
    for (const p of PL) { const y = GY(p.x, p.z); gMin = Math.min(gMin, y); gMax = Math.max(gMax, y); }
    const yP = Math.max(gMax + .1, RA(25.13).y + .26);   // la explanada queda un pelo sobre la acera del motor (que se mete bajo su borde)
    const r0 = RA(25.13), giro = Math.atan2(-r0.tz, r0.tx);   // rumbo de la avenida en coordenadas de la forma (x, −z)
    // baldosa terracota en retícula diagonal con juntas claras cada 5 m (planta del proyecto y foto de la plaza)
    const pisoT = api.canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#cfc3b4'; x.fillRect(0, 0, w, h); const n = 8, c = w / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const f = hsh(i, j); x.fillStyle = `rgb(${150 + f * 24 | 0},${108 + f * 16 | 0},${94 + f * 12 | 0})`; x.fillRect(i * c + 2, j * c + 2, c - 4, c - 4); }
      x.fillStyle = '#ddd5ca'; x.fillRect(0, 0, w, 10); x.fillRect(0, 0, 10, h); });
    pisoT.wrapS = pisoT.wrapT = THREE.RepeatWrapping; pisoT.repeat.set(1 / 5, 1 / 5); pisoT.rotation = giro + Math.PI / 4;
    const piso = new THREE.MeshStandardMaterial({ map: pisoT, roughness: .88 }), bordeP = api.concrete(0x9d9790);
    placa(PL, gMin - .4, yP, piso, bordeP);
    // jardín elevado en cuña (0,9 m) con muro de granito oscuro y grama
    const GA = [W(25.062, 16.5), W(25.138, 17), W(25.151, 32), W(25.074, 23.5)];
    const gramaT = api.canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#4f6b2a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { const f = hsh(i, 3.7); x.fillStyle = f > .5 ? 'rgba(98,122,48,.55)' : 'rgba(58,78,30,.55)'; x.fillRect(hsh(i, 1.1) * w, hsh(i, 2.3) * h, 3 + f * 6, 2 + f * 4); } });
    gramaT.wrapS = gramaT.wrapT = THREE.RepeatWrapping; gramaT.repeat.set(1 / 7, 1 / 7);
    const granito = api.concrete(0x47494b, { roughness: .55 }), granitoC = api.concrete(0x8e8b86, { roughness: .7 });
    const yJ = yP + .9; placa(GA, gMin - .3, yJ, new THREE.MeshStandardMaterial({ map: gramaT, roughness: 1 }), granito);
    const cJ = { x: GA.reduce((s, p) => s + p.x, 0) / 4, z: GA.reduce((s, p) => s + p.z, 0) / 4 };
    const borde = (a, b) => { const L = Math.hypot(b.x - a.x, b.z - a.z), ex = (b.x - a.x) / L, ez = (b.z - a.z) / L; let nx = ez, nz = -ex; if ((a.x - cJ.x) * nx + (a.z - cJ.z) * nz < 0) { nx = -nx; nz = -nz; } return { L, ex, ez, nx, nz, ry: ang(ex, ez) + Math.PI / 2 }; };
    // gradas de granito claro en la punta sureste, hacia la explanada
    { const a = GA[1], b = GA[2], e = borde(a, b);
      for (let i = 0; i < 3; i++) { const d = .45 * (3 - i), hg = .3 * (i + 1); add(new THREE.BoxGeometry(e.L, hg, d), granitoC, (a.x + b.x) / 2 + e.nx * d / 2, yP + hg / 2 - .02, (a.z + b.z) / 2 + e.nz * d / 2, e.ry); } }
    // bancos de granito delante del muro, hacia la avenida (2ª pasada: sin rótulo; no hay evidencia de que exista)
    { const a = GA[0], b = GA[1], e = borde(a, b);
      for (const f of [.2, .36, .52, .68, .84]) { const x = a.x + (b.x - a.x) * f + e.nx * .9, z = a.z + (b.z - a.z) * f + e.nz * .9; add(new THREE.BoxGeometry(2.4, .45, .55), granitoC, x, yP + .22, z, e.ry); }
    }
    // arbustos bajos sobre la grama
    for (let i = 0; i < 9; i++) { const u = hsh(i, 9.1), v = hsh(i, 4.4), k = 25.07 + u * .07, l = 18.5 + v * (5 + u * 9); const p = W(k, l); if (!dentro(p.x, p.z, GA)) continue; copa(p.x, yJ + .5, p.z, .9 + v * .5, yJ); }
    // luminarias de plaza: poste fino con globo blanco
    { const poste = api.concrete(0x6d7073, { roughness: .5, metalness: .4 }), globo = api.glow(0xfdf6e6, { dia: .45, noche: 2.4 });
      for (const [k, l] of [[25.068, 12.4], [25.098, 12.6], [25.128, 12.8], [25.157, 13], [25.182, 13.5], [25.172, 36], [25.158, 24]]) { const p = W(k, l);
        add(new THREE.CylinderGeometry(.07, .1, 4.4, 8), poste, p.x, yP + 2.2, p.z); add(new THREE.SphereGeometry(.32, 12, 8), globo, p.x, yP + 4.6, p.z); } }
    // Los Mástiles: mirador circular a ~6 m sobre el tubo grueso inclinado, que sigue arriba como asta; dos astas finas cruzadas y una
    // cuarta, suelta, con la esfera (foto de referencia: el tubo baja hacia la avenida y las astas se abren hacia el Ávila)
    { const M = LL(10.481939, -66.861167), tx = r0.tx, tz = r0.tz, lx = r0.lx, lz = r0.lz;
      const P = (a, l, y) => ({ x: M.x + tx * a + lx * l, y: yP + y, z: M.z + tz * a + lz * l });
      const acero = new THREE.MeshStandardMaterial({ color: 0xf1f2f2, metalness: .25, roughness: .35 }), luz = api.glow(0xfff4dc, { dia: .7, noche: 2.6 });
      const c = P(0, 0, 6.3), b = P(1.6, -2.4, 0), dv = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
      tubo(b, c, .75, .68, acero, 16); const top = { x: c.x + dv.x * 3.1, y: c.y + dv.y * 3.1, z: c.z + dv.z * 3.1 }; tubo(c, top, .55, .26, acero, 12);
      add(new THREE.SphereGeometry(.75, 14, 10), luz, top.x, top.y + .4, top.z);
      const b2 = P(-2.2, -1.2, 0), t2 = P(3.4, 4.6, 24); tubo(b2, t2, .42, .2, acero, 10); add(new THREE.SphereGeometry(.65, 14, 10), luz, t2.x, t2.y + .4, t2.z);
      tubo(P(1.4, 2.6, 0), P(-1.6, -1.8, 15), .3, .15, acero, 8);
      const b4 = P(6.5, -5.5, 0), t4 = P(9.5, -8.5, 12.5); tubo(b4, t4, .24, .15, acero, 8); add(new THREE.SphereGeometry(.75, 14, 10), luz, t4.x, t4.y + .45, t4.z);
      // el mirador: disco de acero con faldón, baranda de dos aros y parales
      add(new THREE.CylinderGeometry(3.7, 3.3, .6, 32), acero, c.x, c.y, c.z);
      add(new THREE.CylinderGeometry(2.2, 1.2, .9, 24), acero, c.x, c.y - .7, c.z);
      for (const yy of [.55, 1.35]) { const t = add(new THREE.TorusGeometry(3.6, .045, 6, 40), acero, c.x, c.y + yy, c.z); t.rotation.x = Math.PI / 2; }
      for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; add(new THREE.BoxGeometry(.05, 1.1, .05), acero, c.x + Math.cos(a) * 3.6, c.y + .85, c.z + Math.sin(a) * 3.6); } }
  }
  // ═════════ 15. Calzada adoquinada frente a la plaza (km 25,02–25,205): adoquín de ladrillo rosado gastado y bolardos de concreto a
  //  los dos lados (t=610,5–615,5). El motor solo pinta de ladrillo las aceras: aquí va una lámina sobre el asfalto con polygonOffset. ═════════
  {
    const k0 = 25.02, k1 = 25.205, V = api.D.via;
    const hwAt = k => { const f = k / V.paso, b0 = Math.min(V.ancho.length - 1, Math.floor(f)), b1 = Math.min(V.ancho.length - 1, b0 + 1), t = f - b0, an = Math.max(8, Math.min(40, (V.ancho[b0] || 14) * (1 - t) + (V.ancho[b1] || 14) * t)); return Math.max(an / 2, 6.8) - .08; };
    const adoq = api.canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#8a7d70'; x.fillRect(0, 0, w, h); const bw = 25.6, bh = 12.8;
      for (let r = 0; r < h / bh; r++) for (let c = -1; c <= w / bw; c++) { const o = r % 2 ? bw / 2 : 0, f = hsh(r, c), q = hsh(c * .37, r * 1.9) > .93 ? .82 : 1;
        x.fillStyle = `rgb(${(132 + f * 20) * q | 0},${(100 + f * 14) * q | 0},${(84 + f * 12) * q | 0})`; x.fillRect(c * bw + o + 1.2, r * bh + 1.2, bw - 2.4, bh - 2.4); } });
    adoq.wrapS = adoq.wrapT = THREE.RepeatWrapping;
    const mat = new THREE.MeshStandardMaterial({ map: adoq, roughness: .9, polygonOffset: true, polygonOffsetFactor: -12, polygonOffsetUnits: -30 });
    const ps = [], uv = [], ix = []; let m = 0, s = 0, prev = null;
    for (let k = k0; k <= k1 + 1e-6; k += .0025, m++) { const r = RA(k), hw = hwAt(k); if (prev) s += Math.hypot(r.x - prev[0], r.z - prev[1]); prev = [r.x, r.z];
      for (const l of [hw, -hw]) { ps.push(r.x + r.lx * l, r.y + .03, r.z + r.lz * l); uv.push(l / 4, s / 4); }
      if (m) { const o = (m - 1) * 2; ix.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); } }
    const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.setIndex(ix); ge.computeVertexNormals();
    if (ge.attributes.normal.getY(0) < 0) { for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } ge.setIndex(ix); ge.computeVertexNormals(); }
    g.add(new THREE.Mesh(ge, mat));
    // bolardos: cilindros bajos de concreto cada ~2,6 m sobre el borde de las dos aceras (instanciados: una sola llamada de dibujo)
    const pts = []; for (let k = k0 + .004; k <= k1 - .003; k += .0026) { const r = RA(k), hw = hwAt(k) + .55; for (const l of [hw, -hw]) pts.push([r.x + r.lx * l, r.y + .2 + .3, r.z + r.lz * l]); }
    const bol = new THREE.InstancedMesh(new THREE.CylinderGeometry(.19, .22, .6, 10), api.concrete(0xa19d96), pts.length);
    pts.forEach((p, i) => { M4.makeTranslation(p[0], p[1], p[2]); bol.setMatrixAt(i, M4); }); bol.castShadow = true; g.add(bol);
  }
  // ═════════ 16. Cerca de obra con grafiti a la izquierda pasada La Trinidad (km 25,212–25,262, t=615–616 s): tablas de ~3,3 m pintadas de
  //  ondas verticales moradas, azules, rosadas y turquesa (obra de la estación del metro, cuya huella se quita en mercedes.js) ═════════
  {
    const grafT = api.canvasTex(1024, 128, (x, w, h) => { const C = ['#5b2a86', '#2a4fb5', '#e0408a', '#27b0b0', '#1b1f4a', '#9a3fc4', '#f07ab0', '#3a8fe0'];
      for (let i = 0; i < 64; i++) { x.fillStyle = C[(i * 3 + (i >> 2)) % C.length]; x.beginPath(); const x0 = i * w / 64; x.moveTo(x0, 0);
        for (let y = 0; y <= h; y += 8) x.lineTo(x0 + Math.sin(y / 14 + i * .7) * 6, y); for (let y = h; y >= 0; y -= 8) x.lineTo(x0 + w / 64 + 3 + Math.sin(y / 14 + i * .7 + .5) * 6, y); x.fill(); }
      x.fillStyle = 'rgba(20,20,30,.5)'; x.fillRect(0, h - 10, w, 10); });
    grafT.wrapS = THREE.RepeatWrapping;
    const ps = [], uv = [], ix = []; let m = 0, s = 0, prev = null; const off = 10.4;
    for (let k = 25.212; k <= 25.262 + 1e-6; k += .004, m++) { const r = RA(k), x = r.x + r.lx * off, z = r.z + r.lz * off; if (prev) s += Math.hypot(x - prev[0], z - prev[1]); prev = [x, z];
      ps.push(x, r.y - .3, z, x, r.y + 3.3, z); uv.push(s / 26, 0, s / 26, 1); if (m) { const o = (m - 1) * 2; ix.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); } }
    const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.setIndex(ix); ge.computeVertexNormals();
    g.add(dos(ge, new THREE.MeshStandardMaterial({ map: grafT, roughness: .85 })));
  }
  // ═════════ 17. Av. Principal de Las Mercedes (24,47–25,25): grúas de las dos obras que el video muestra (esqueleto de la derecha en el
  //  24,60, t=597–600 s, y torre de ladrillo detrás del Itaca, t=612,5–613 s) y la reja verde de la izquierda en 24,47–24,60 (t=597–598 s:
  //  barrotes verde oscuro de ~2,4 m tras la acera, árboles detrás; antes era terreno plano) ═════════
  {
    const celT = api.canvasTex(64, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#d9c23a'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); x.lineWidth = 4; x.beginPath(); x.moveTo(3, 3); x.lineTo(w - 3, h - 3); x.moveTo(w - 3, 3); x.lineTo(3, h - 3); x.stroke(); });
    celT.wrapS = celT.wrapT = THREE.RepeatWrapping;
    const celosia = (L) => { const t = celT.clone(); t.needsUpdate = true; t.repeat.set(1, L / 1.6); return new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, side: THREE.DoubleSide, roughness: .6, metalness: .3 }); };
    const lastre = api.concrete(0x8d8a85);
    const grua = (x, z, y0, H, J, a) => { const mm = celosia(H), mj = celosia(J);
      add(new THREE.BoxGeometry(1.6, H, 1.6), [mm, mm, lastre, lastre, mm, mm], x, y0 + H / 2, z);
      const c = Math.cos(a), sn = Math.sin(a), yj = y0 + H + .7;
      const jb = add(new THREE.BoxGeometry(1.2, 1.2, J), [mj, mj, mj, mj, lastre, lastre], x + sn * J / 2, yj, z + c * J / 2, a);
      add(new THREE.BoxGeometry(1.4, 1.1, 11), lastre, x - sn * 5.5, yj, z - c * 5.5, a);
      add(new THREE.BoxGeometry(2.4, 2.2, 3), lastre, x - sn * 10, yj - .4, z - c * 10, a);
      add(new THREE.BoxGeometry(1.8, 1.8, 1.8), api.concrete(0xe9e6df), x + sn * 1.4, y0 + H - .2, z + c * 1.4, a);
      add(new THREE.BoxGeometry(.9, 5, .9), [mm, mm, lastre, lastre, mm, mm], x, y0 + H + 3.2, z);
      void jb; };
    { const c = LL(10.481039, -66.861356); grua(c.x, c.z, GY(c.x, c.z) + 14 * 3.2 + 1, 13, 34, 2.2); }
    // 22-nov: la grúa del video (t=600,25: mástil pegado al esqueleto, justo pasada la estación) va en el esqueleto del 24,68–24,69 der.;
    // antes estaba en el lote arbolado del 24,57–24,63, que en el video es reja y árboles (t=598,5–599)
    { const c = LL(10.484539, -66.864755); grua(c.x, c.z, GY(c.x, c.z) - .3, 36, 40, -.9); }
    // reja verde a la izquierda (24,47–24,60)
    const rejaV = api.canvasTex(128, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#1e3a2a'; for (let i = 0; i < 9; i++) x.fillRect(i * w / 9 + 2, 0, 4, h); x.fillRect(0, 6, w, 6); x.fillRect(0, h - 22, w, 6); });
    rejaV.wrapS = THREE.RepeatWrapping;
    const ps = [], uv = [], ix = []; let m = 0, s = 0, prev = null; const off = 14.3;
    for (let k = 24.47; k <= 24.60 + 1e-6; k += .004, m++) { const r = RA(k), x = r.x + r.lx * off, z = r.z + r.lz * off; if (prev) s += Math.hypot(x - prev[0], z - prev[1]); prev = [x, z];
      ps.push(x, r.y - .2, z, x, r.y + 2.4, z); uv.push(s / 2.6, 0, s / 2.6, 1); if (m) { const o = (m - 1) * 2; ix.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); } }
    const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.setIndex(ix); ge.computeVertexNormals();
    g.add(dos(ge, new THREE.MeshStandardMaterial({ map: rejaV, alphaTest: .5, roughness: .6 })));
  }
  // ═════════ 18. Av. Principal de Las Mercedes, km 24,45–25,0 (2ª pasada, video a 2 cuadros/s con el capó: t=597–609 s) ═════════
  //  Las cuatro fachadas más reconocibles, sobre sus huellas OSM (las extrusiones del motor se quitan en fx/correcciones/mercedes.js):
  //  local blanco de dos plantas con franja azul (der., 24,50, t=597) y el cubo celeste a su lado (der., 24,54, t=597,5); la oficina
  //  blanca de bandas oscuras con el lomo negro (der., 24,80, t=602–602,5); el muro cortina azul sobre planta baja oscura (izq.,
  //  24,95–25,0, t=608,5). Más el pórtico azul «BARUTA» sobre la vía (t=597), el tótem rojo de KFC (izq., t=599,5) y las letras
  //  verdes «BARUTA» en la jardinera de la esquina (izq., t=601,5): los tres textos se leen en el video.
  {
    // cuerpo extruido de una huella con fachada pintada en metros: tex cubre wt m de ancho y la altura completa h
    const cuerpo = (ll, h, tex, wt, techo) => { const P = ll.map(([a, b]) => LL(a, b)), y0 = Math.min(...P.map(p => GY(p.x, p.z))) - .3, z0 = .3;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1 / wt, -1 / h); tex.offset.set(0, (1 - z0) / h);
      return placa(P, y0, y0 + z0 + h, techo || api.concrete(0xb9b6b0), new THREE.MeshStandardMaterial({ map: tex, roughness: .7 })); };
    // canvas de fachada: px por metro fijo; fn(x, m) dibuja con m(metros) → px
    const pinta = (wm, hm, fn) => api.canvasTex(Math.round(wm * 24), Math.round(hm * 24), (x, w, h) => { const m = v => v * 24, Y = v => h - v * 24; fn(x, m, Y, w, h); });
    // 1) local blanco de dos plantas con franja azul: vitrina oscura abajo, franja azul, cinta de ventanas arriba, antepecho blanco
    cuerpo([[10.486228, -66.865776], [10.485757, -66.865621], [10.485725, -66.865723], [10.485864, -66.865768], [10.485817, -66.865918], [10.485882, -66.865939], [10.485924, -66.865808], [10.486190, -66.865895]], 7.6,
      pinta(10, 7.6, (x, m, Y, w) => { x.fillStyle = '#f3f2ee'; x.fillRect(0, 0, w, Y(0)); x.fillStyle = '#2b333b'; x.fillRect(m(.3), Y(3.2), w - m(.6), m(3.2));
        x.fillStyle = '#e9e8e3'; for (let i = 0; i < 4; i++) x.fillRect(m(2.5 * i), Y(3.2), m(.18), m(3.2));
        x.fillStyle = '#1f5fb4'; x.fillRect(0, Y(4.3), w, m(1.0)); x.fillStyle = '#26323c'; x.fillRect(m(.4), Y(6.5), w - m(.8), m(1.5)); x.fillStyle = '#eef0f2'; for (let i = 0; i < 5; i++) x.fillRect(m(2 * i), Y(6.5), m(.12), m(1.5)); }), 10);
    // 2) cubo celeste de una planta (quiosco/local) junto al anterior
    cuerpo([[10.485764, -66.865551], [10.485754, -66.865606], [10.485574, -66.865496], [10.485606, -66.865460]], 4.2,
      pinta(6, 4.2, (x, m, Y, w) => { x.fillStyle = '#5ec3d0'; x.fillRect(0, 0, w, Y(0)); x.fillStyle = '#f4f6f6'; x.fillRect(0, 0, w, m(.45)); x.fillStyle = '#2f4f5a'; x.fillRect(m(2), Y(2.6), m(2), m(2.6)); }), 6, api.concrete(0xe9eceb));
    // 3) oficina blanca de bandas: losas blancas de 1 m y cintas de vidrio oscuro de 2,4 m, planta baja retirada oscura, lomo negro vertical
    cuerpo([[10.483826, -66.863781], [10.483678, -66.863918], [10.483864, -66.864126], [10.484013, -66.863987]], 14.6,
      pinta(26, 14.6, (x, m, Y, w) => { x.fillStyle = '#222a31'; x.fillRect(0, 0, w, Y(0));
        for (let f = 0; f < 4; f++) { const b = 3.6 + f * 2.75; x.fillStyle = '#f2f2ee'; x.fillRect(0, Y(b + 1.0), w, m(1.0)); x.fillStyle = '#3c4a55'; x.fillRect(0, Y(b + 2.75), w, m(1.75)); x.fillStyle = '#56636c'; for (let i = 0; i < 13; i++) x.fillRect(m(2 * i), Y(b + 2.75), m(.08), m(1.75)); }
        x.fillStyle = '#f2f2ee'; x.fillRect(0, 0, w, m(.6)); x.fillStyle = '#141619'; x.fillRect(m(19), 0, m(3.4), Y(0)); }), 26);
    // 4) muro cortina azul de cuatro plantas sobre planta baja oscura y retirada (dos huellas contiguas)
    const azul = () => pinta(12, 17.4, (x, m, Y, w) => { x.fillStyle = '#26292c'; x.fillRect(0, 0, w, Y(0)); x.fillStyle = '#4f7f9c'; x.fillRect(0, 0, w, Y(3.4));
      const gr = x.createLinearGradient(0, 0, 0, Y(3.4)); gr.addColorStop(0, 'rgba(190,220,240,.35)'); gr.addColorStop(1, 'rgba(20,50,80,.25)'); x.fillStyle = gr; x.fillRect(0, 0, w, Y(3.4));
      x.fillStyle = '#9bb3c4'; for (let i = 0; i <= 8; i++) x.fillRect(m(1.5 * i) - 1, 0, 3, Y(3.4)); for (let f = 0; f <= 4; f++) x.fillRect(0, Y(3.4 + f * 3.5) - 2, w, 5);
      x.fillStyle = '#d6d2ca'; for (let i = 0; i < 4; i++) x.fillRect(m(3 * i + 1.2), Y(3.4), m(.5), m(3.4)); });
    cuerpo([[10.483366, -66.862522], [10.483278, -66.862397], [10.483089, -66.862580], [10.483182, -66.862686]], 17.4, azul(), 12, api.concrete(0x6f7478));
    cuerpo([[10.483061, -66.862462], [10.482978, -66.862364], [10.483190, -66.862243], [10.483271, -66.862381], [10.483118, -66.862529]], 17.4, azul(), 12, api.concrete(0x6f7478));
    // pórtico azul «BARUTA» sobre la calzada (t=597): poste a la izquierda y brazo hasta media vía; el panel mira al corredor
    { const r = RA(24.53), hw = 11.2, pz = add(new THREE.CylinderGeometry(.22, .26, 7.6, 10), api.concrete(0x8c9196, { metalness: .4, roughness: .5 }), r.x + r.lx * (hw + 1.2), r.y + 3.8, r.z + r.lz * (hw + 1.2));
      const brazo = add(new THREE.BoxGeometry(.25, .25, hw + 1.6), api.concrete(0x8c9196, { metalness: .4, roughness: .5 }), r.x + r.lx * (hw / 2 + .6), r.y + 7.3, r.z + r.lz * (hw / 2 + .6), ang(r.lx, r.lz));
      const bt = api.canvasTex(512, 96, (x, w, h) => { x.fillStyle = '#1d5ea8'; x.fillRect(0, 0, w, h); x.strokeStyle = '#ffffff'; x.lineWidth = 4; x.strokeRect(5, 5, w - 10, h - 10); x.fillStyle = '#fff'; x.font = 'bold 56px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('BARUTA', w / 2, h / 2 + 3); });
      const pm = new THREE.MeshStandardMaterial({ map: bt, roughness: .6 }), cs = api.concrete(0x1d5ea8);
      const pan = add(new THREE.BoxGeometry(8.5, 1.6, .16), [cs, cs, cs, cs, pm, cs], r.x + r.lx * 5.2, r.y + 6.3, r.z + r.lz * 5.2); pan.rotation.y = Math.atan2(-r.tx, -r.tz); void pz; void brazo; }
    // tótem rojo de KFC (izq., t=599,5) en la acera del local
    { const r = RA(24.652), x = r.x + r.lx * 14.2, z = r.z + r.lz * 14.2, gy = Math.min(GY(x, z), r.y + .2);
      const kt = api.canvasTex(128, 512, (c, w, h) => { c.fillStyle = '#d42a2a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 64px Arial, sans-serif'; c.textAlign = 'center'; ['K', 'F', 'C'].forEach((t, i) => c.fillText(t, w / 2, 90 + i * 72)); });
      const km = new THREE.MeshStandardMaterial({ map: kt, roughness: .6 }), rr = api.concrete(0xc42424);
      const b = add(new THREE.BoxGeometry(1.4, 7.5, .7), [rr, rr, rr, rr, km, km], x, gy + 3.75, z); b.rotation.y = Math.atan2(-r.tx, -r.tz); }
    // letras verdes «BARUTA» en la jardinera de la esquina (izq., t=601,5), recortadas (alphaTest) y con las dos caras frontales
    { const r = RA(24.722), x = r.x + r.lx * 13.8, z = r.z + r.lz * 13.8, gy = Math.min(GY(x, z), r.y + .2);
      const lt = api.canvasTex(512, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#2f9b3e'; c.font = 'bold 118px Arial Black, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BARUTA', w / 2, h / 2 + 6); });
      const dx = -r.tx * .55 - r.lx * .83, dz = -r.tz * .55 - r.lz * .83, ry = Math.atan2(dx, dz);
      const pg = new THREE.PlaneGeometry(5.2, 1.3); pg.rotateY(ry); pg.translate(x, gy + .85, z);
      g.add(dos(pg, new THREE.MeshStandardMaterial({ map: lt, alphaTest: .5, roughness: .6 })));
      add(new THREE.BoxGeometry(5.8, .4, 1.4), api.concrete(0xc9c4ba), x, gy + .2, z, ry); }
  }
  // ═════════ 19. Estación de servicio Texaco, entrando a Las Mercedes (km 24,63–24,68, a la DERECHA; 22-nov) ═════════
  //  «Entrando a Las Mercedes la Texaco a la derecha» (Alejandro). Es la E/S Las Mercedes de OSM (nodo 8461974399, km 24,661, 36 m a la
  //  der.), en la esquina de la calle que cruza en el 24,63. En el video de 2024 aún llevaba los colores de PDV (t=599,25–600,0: marquesina
  //  roja larga paralela a la avenida, tótem en la esquina con «24 Horas» y Subway, el esqueleto con grúa justo después); se modela con
  //  la marca Texaco que tiene hoy. Ancla: el tótem de KFC (izq., 24,652) pasa a la par en t=599,75, como la estación.
  //  Marquesina roja con «TEXACO» y el emblema (estrella blanca con la T verde en disco rojo), dos islas con cuatro surtidores, tienda al
  //  fondo con Subway, tótem en la esquina y el patio de concreto abierto a la avenida y a la calle lateral.
  {
    const r = RA(24.655), ry = ang(r.tx, r.tz), lx = r.lx, lz = r.lz, tx = r.tx, tz = r.tz;
    const P = (a, l) => ({ x: r.x + tx * a + lx * l, z: r.z + tz * a + lz * l });   // a: m a lo largo desde el 24,655; l: + izquierda (la estación va en l < 0)
    const emblema = (x, cx, cy, R) => { x.fillStyle = '#16181a'; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill(); x.fillStyle = '#e1251b'; x.beginPath(); x.arc(cx, cy, R * .84, 0, 7); x.fill();
      x.fillStyle = '#ffffff'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? R * .31 : R * .76; x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } x.fill();
      x.fillStyle = '#1f9a4a'; x.fillRect(cx - R * .26, cy - R * .26, R * .52, R * .12); x.fillRect(cx - R * .07, cy - R * .26, R * .14, R * .58); };
    const faja = (w, h) => valla(w, h, (x, W, H) => { x.fillStyle = '#e1251b'; x.fillRect(0, 0, W, H); x.fillStyle = '#ffffff'; x.fillRect(0, 2, W, H * .06); x.fillStyle = '#2a2b2d'; x.fillRect(0, H * .9, W, H * .1);
      emblema(x, H * .62, H * .48, H * .4); x.fillStyle = '#ffffff'; x.font = `bold ${H * .58 | 0}px Arial Black, Arial, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TEXACO', W * .55, H * .5); });
    const fajaL = faja(1024, 52), fajaC = faja(512, 52), bajo = new THREE.MeshStandardMaterial({ color: 0xf1f0ec, roughness: .7 }), techoM = api.concrete(0xd8d8d4);
    const yS = Math.max(RA(24.64).y, RA(24.67).y) + .12;
    let gMin = 1e9, gMax = -1e9; for (let a = -24; a <= 24; a += 6) for (let l = -16; l >= -55; l -= 6) { const p = P(a, l), y = GY(p.x, p.z); gMin = Math.min(gMin, y); gMax = Math.max(gMax, y); }
    const y0 = Math.max(gMax, yS) + .05;
    // patio de concreto (24,632–24,678 × 15–54 m), un poco sobre la acera
    { const c = P(0, -34.5); add(new THREE.BoxGeometry(39, y0 - gMin + .6, 47), api.concrete(0x8e8c86, { roughness: .95 }), c.x, (y0 + gMin - .6) / 2, c.z, ry); }
    // esqueleto de concreto en obra pasada la estación (huella OSM 24,681–24,694; t=600,25–600,75): seis losas sobre columnas, sin
    // cerramientos, y la lámina gris de obra en la acera. La grúa es la de §17. La huella la quita fx/correcciones/mercedes.js.
    { const PE = [[10.484322, -66.865024], [10.484256, -66.864949], [10.484542, -66.864659], [10.484625, -66.864749], [10.484475, -66.864881]].map(([a, b]) => LL(a, b));
      const ge0 = Math.min(...PE.map(p => GY(p.x, p.z))) - .3, losaM = api.concrete(0xa7a49d), colM = api.concrete(0x9c9992);
      for (let i = 1; i <= 6; i++) placa(PE, ge0 + i * 3.4 - .3, ge0 + i * 3.4 + .05, losaM, losaM);
      placa(PE, ge0, ge0 + .4, losaM, losaM);
      for (let i = 0; i < PE.length; i++) { const A = PE[i], B = PE[(i + 1) % PE.length], L = Math.hypot(B.x - A.x, B.z - A.z), n = Math.max(1, Math.round(L / 6.5));
        for (let j = 0; j < n; j++) { const t = j / n, x = A.x + (B.x - A.x) * t, z = A.z + (B.z - A.z) * t; add(new THREE.BoxGeometry(.6, 6 * 3.4, .6), colM, x, ge0 + 3 * 3.4, z); } }
      // lámina de obra a la derecha de la acera (24,679–24,700)
      const lamT = api.canvasTex(128, 64, (x, w, h) => { x.fillStyle = '#9ea2a3'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 8) { x.fillStyle = i % 16 ? '#b2b5b6' : '#868a8c'; x.fillRect(i, 0, 4, h); } }); lamT.wrapS = THREE.RepeatWrapping;
      const ps = [], uv = [], ix = []; let m = 0, s = 0, prev = null;
      for (let k = 24.679; k <= 24.700 + 1e-6; k += .003, m++) { const q = RA(k), x = q.x - q.lx * 14.6, z = q.z - q.lz * 14.6; if (prev) s += Math.hypot(x - prev[0], z - prev[1]); prev = [x, z];
        ps.push(x, q.y - .4, z, x, q.y + 2.6, z); uv.push(s / 2, 0, s / 2, 1); if (m) { const o = (m - 1) * 2; ix.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); } }
      const gl = new THREE.BufferGeometry(); gl.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); gl.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); gl.setIndex(ix); gl.computeVertexNormals();
      g.add(dos(gl, new THREE.MeshStandardMaterial({ map: lamT, roughness: .6, metalness: .3 }))); }
    // marquesina: 12 m de fondo × 26 m a lo largo, borde inferior a 5,2 m
    const cM = P(0, -29), yB = y0 + 5.2;
    add(new THREE.BoxGeometry(12, 1.3, 26), [fajaL, fajaL, techoM, bajo, fajaC, fajaC], cM.x, yB + .65, cM.z, ry);
    { const luz = api.glow(0xffffff, { dia: .35, noche: 2.4 }); for (const l of [-3, 3]) for (const a of [-9, -3, 3, 9]) { const p = P(a, -29 + l); add(new THREE.BoxGeometry(1.4, .06, .7), luz, p.x, yB - .02, p.z, ry); } }
    // islas, columnas (blancas con zócalo rojo) y surtidores
    const blancoC = api.concrete(0xf3f3f0), rojoC = api.concrete(0xd42a22), isla = api.concrete(0xd9d6cc);
    const surT = api.canvasTex(128, 256, (x, w, h) => { x.fillStyle = '#f4f4f2'; x.fillRect(0, 0, w, h); x.fillStyle = '#e1251b'; x.fillRect(0, 0, w, h * .2); emblema(x, w / 2, h * .1, h * .08);
      x.fillStyle = '#1d2226'; x.fillRect(w * .18, h * .3, w * .64, h * .2); x.fillStyle = '#7fd3a0'; x.fillRect(w * .24, h * .34, w * .52, h * .05); x.fillStyle = '#3a3d40'; x.fillRect(w * .15, h * .6, w * .7, h * .12); x.fillStyle = '#2a2b2d'; x.fillRect(0, h * .92, w, h * .08); });
    const sur = new THREE.MeshStandardMaterial({ map: surT, roughness: .5 });
    for (const l of [-26, -32]) { const c = P(0, l);
      add(new THREE.BoxGeometry(1.3, .25, 12), isla, c.x, y0 + .12, c.z, ry);
      for (const a of [-5.4, 5.4]) { const p = P(a, l); add(new THREE.BoxGeometry(.5, 5.2, .5), blancoC, p.x, y0 + 2.6, p.z, ry); add(new THREE.BoxGeometry(.6, 1, .6), rojoC, p.x, y0 + .5, p.z, ry); }
      for (const a of [-2.3, 2.3]) { const p = P(a, l); add(new THREE.BoxGeometry(.62, 1.9, 1.15), [sur, sur, blancoC, blancoC, blancoC, blancoC], p.x, y0 + 1.2, p.z, ry); } }
    // tienda al fondo: fachada blanca con vidrio, faja roja y el letrero de Subway sobre la puerta
    { const tT = valla(512, 128, (x, w, h) => { x.fillStyle = '#efeeea'; x.fillRect(0, 0, w, h); x.fillStyle = '#e1251b'; x.fillRect(0, 0, w, h * .2); x.fillStyle = '#ffffff'; x.font = 'bold 18px Arial, sans-serif'; x.textAlign = 'center'; x.fillText('TEXACO', w * .5, h * .14);
        x.fillStyle = '#26323a'; x.fillRect(w * .04, h * .32, w * .92, h * .62); x.fillStyle = 'rgba(200,225,240,.22)'; x.fillRect(w * .04, h * .32, w * .92, h * .1); x.fillStyle = '#d7d6d2'; for (let i = 1; i < 8; i++) x.fillRect(w * .04 + i * w * .115, h * .32, 3, h * .62); });
      const c = P(1, -47), lado = api.concrete(0xe9e8e4);
      add(new THREE.BoxGeometry(8, 4.4, 20), [tT, lado, api.concrete(0xb8b8b4), lado, lado, lado], c.x, y0 + 2.2, c.z, ry);
      const sw = valla(512, 128, (x, w, h) => { x.fillStyle = '#0a7a3a'; x.fillRect(0, 0, w, h); x.font = 'bold italic 84px Arial Black, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ffffff'; x.fillText('SUB', w * .36, h * .54); x.fillStyle = '#ffc20e'; x.fillText('WAY', w * .7, h * .54); });
      const p = P(-3.5, -42.9); add(new THREE.BoxGeometry(.15, 1.1, 4.4), [sw, sw, lado, lado, lado, lado], p.x, y0 + 3.55, p.z, ry); }
    // tótem en la esquina (24,633, a 15,5 m): emblema, «TEXACO», «24 HORAS» y Subway; de cara a quien viene y a quien se va
    { const tt = valla(128, 512, (x, w, h) => { x.fillStyle = '#1b1c1e'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.fillRect(w * .08, h * .02, w * .84, h * .25); emblema(x, w / 2, h * .145, w * .36);
        x.fillStyle = '#e1251b'; x.fillRect(w * .08, h * .29, w * .84, h * .12); x.fillStyle = '#fff'; x.font = 'bold 24px Arial Black, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TEXACO', w / 2, h * .35);
        x.fillStyle = '#e1251b'; x.fillRect(w * .08, h * .43, w * .84, h * .1); x.fillStyle = '#fff'; x.font = 'bold 20px Arial, sans-serif'; x.fillText('24 HORAS', w / 2, h * .48);
        x.fillStyle = '#0a7a3a'; x.fillRect(w * .08, h * .55, w * .84, h * .1); x.font = 'bold italic 22px Arial, sans-serif'; x.fillStyle = '#ffc20e'; x.fillText('SUBWAY', w / 2, h * .6); });
      const p = P(-22, -15.5), gy = Math.min(GY(p.x, p.z), y0); const neg = api.concrete(0x1b1c1e);
      add(new THREE.BoxGeometry(2.0, 8.5, .6), [neg, neg, neg, neg, tt, tt], p.x, gy + 4.25, p.z, ry);
      add(new THREE.BoxGeometry(2.6, .6, 1.1), api.concrete(0x9a9892), p.x, gy + .3, p.z, ry); }
  }
  // ═════════ 20. Lote arbolado a la derecha (km 24,57–24,63; t=598,5–599 s): lámina gris de obra y luego muro blanco bajo con reja, con
  //  copas grandes detrás (los árboles, en fx/correcciones/mercedes.js). Hasta el 21-nov aquí había una huella extruida de 6 pisos.
  {
    const cinta = (k0, k1, d, h0, h1, mat, rep = 4) => { const ps = [], uv = [], ix = []; let m = 0, s = 0, prev = null;
      for (let k = k0; k <= k1 + 1e-6; k += .003, m++) { const q = RA(k), x = q.x - q.lx * d, z = q.z - q.lz * d; if (prev) s += Math.hypot(x - prev[0], z - prev[1]); prev = [x, z];
        ps.push(x, q.y + h0, z, x, q.y + h1, z); uv.push(s / rep, 0, s / rep, 1); if (m) { const o = (m - 1) * 2; ix.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); } }
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.setIndex(ix); ge.computeVertexNormals(); g.add(dos(ge, mat)); };
    const lamT = api.canvasTex(128, 64, (x, w, h) => { x.fillStyle = '#9ea2a3'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 8) { x.fillStyle = i % 16 ? '#b2b5b6' : '#868a8c'; x.fillRect(i, 0, 4, h); } });
    lamT.wrapS = THREE.RepeatWrapping;
    cinta(24.572, 24.600, 14.4, -.4, 2.8, new THREE.MeshStandardMaterial({ map: lamT, roughness: .6, metalness: .3 }), 2);
    cinta(24.600, 24.626, 14.4, -.4, .9, api.concrete(0xe8e6e0));
    const rejaT = api.canvasTex(128, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#2b2e30'; for (let i = 0; i < 8; i++) x.fillRect(i * w / 8 + 3, 0, 5, h); x.fillRect(0, 4, w, 7); });
    rejaT.wrapS = THREE.RepeatWrapping;
    cinta(24.600, 24.626, 14.4, .9, 2.4, new THREE.MeshStandardMaterial({ map: rejaT, alphaTest: .5, roughness: .6 }), 1.6);
  }
  // ═════════ 21. Rótulos que se leen en el video: «CENTRO VENEZOLANO AMERICANO» en la franja azul del local blanco (der., 24,50, t=597,5)
  //  y el gálibo amarillo «ATENCIÓN · ALTURA MÁXIMA 3,70 m» colgado sobre el canal izquierdo antes del giro a la bajada (24,115, t=591) ═════════
  {
    // tablero pegado a la cara de un polígono OSM que mira a la ruta en el km k
    const rotulo = (poly, k, w, h, yc, mat) => { const Pp = poly.map(([a, b]) => LL(a, b)), q = RA(k); let best = null;
      for (let i = 0; i < Pp.length; i++) { const A = Pp[i], B = Pp[(i + 1) % Pp.length], ex = B.x - A.x, ez = B.z - A.z, L2 = ex * ex + ez * ez, t = Math.max(0, Math.min(1, ((q.x - A.x) * ex + (q.z - A.z) * ez) / L2));
        const X = A.x + ex * t, Z = A.z + ez * t, d = Math.hypot(q.x - X, q.z - Z); if (!best || d < best.d) best = { d, X, Z, ex, ez, L: Math.sqrt(L2) }; }
      let nx = best.ez / best.L, nz = -best.ex / best.L; if ((q.x - best.X) * nx + (q.z - best.Z) * nz < 0) { nx = -nx; nz = -nz; }
      const ww = Math.min(w, best.L - .6), gy = GY(best.X, best.Z), m = add(new THREE.BoxGeometry(ww, h, .14), [concreto, concreto, concreto, concreto, mat, concreto], best.X + nx * .2, gy + yc, best.Z + nz * .2);
      m.rotation.y = Math.atan2(nx, nz); return m; };
    const cva = valla(1024, 96, (x, w, h) => { x.fillStyle = '#1f5fb4'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(52, h / 2, 30, 0, 7); x.fill(); x.fillStyle = '#1f5fb4'; x.font = 'bold 26px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('CVA', 52, h / 2 + 1);
      x.fillStyle = '#ffffff'; x.font = 'bold 50px Arial, sans-serif'; x.textAlign = 'left'; x.fillText('CENTRO VENEZOLANO AMERICANO', 104, h / 2 + 2); });
    rotulo([[10.486228, -66.865776], [10.485757, -66.865621], [10.485725, -66.865723], [10.485864, -66.865768], [10.485817, -66.865918], [10.485882, -66.865939], [10.485924, -66.865808], [10.486190, -66.865895]], 24.50, 11, 1.0, 3.75, cva);
    // gálibo: poste a la izquierda, brazo sobre el canal izquierdo y el tablero amarillo de cara al corredor
    const q = RA(24.115), amar = api.concrete(0xf2c230, { roughness: .55 }), neg = api.concrete(0x1d1e20);
    const gt = valla(512, 128, (x, w, h) => { x.fillStyle = '#f2c230'; x.fillRect(0, 0, w, h); x.strokeStyle = '#1d1e20'; x.lineWidth = 8; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = '#1d1e20'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = 'bold 40px Arial, sans-serif'; x.fillText('ATENCIÓN', w / 2, h * .32); x.font = 'bold 34px Arial, sans-serif'; x.fillText('ALTURA MÁXIMA 3,70 m', w / 2, h * .7); });
    const pp = { x: q.x + q.lx * 8.6, z: q.z + q.lz * 8.6 }, gyp = Math.min(GY(pp.x, pp.z), q.y + .2);
    add(new THREE.CylinderGeometry(.16, .18, q.y + 5.4 - gyp, 10), amar, pp.x, (q.y + 5.4 + gyp) / 2, pp.z);
    add(new THREE.BoxGeometry(.18, .18, 7.4), amar, q.x + q.lx * 5, q.y + 5.3, q.z + q.lz * 5, ang(q.lx, q.lz));
    const tb = add(new THREE.BoxGeometry(4.2, 1.05, .1), [neg, neg, neg, neg, gt, neg], q.x + q.lx * 4.4, q.y + 4.55, q.z + q.lz * 4.4); tb.rotation.y = Math.atan2(-q.tx, -q.tz);
  }
  // ═════════ 22. Alcaldía de Chacao en la Torre Atrium (calle hacia el sur, km 23,46–23,57 der.; video t=575,5–578 s) ═════════
  //  OSM node 7283228387 «Alcaldía de Chacao» cae dentro de la huella del Atrium. Lo que se ve desde la vía: el basamento de ladrillo con
  //  las letras ATRIUM, el pilón de ladrillo con el escudo blanco y «CHACAO» en la plazoleta de la acera, pendones rojos en los postes de
  //  los dos lados y «DESPACIO» / «ALCALDÍA» pintados en el asfalto al entrar a la calle. No se ven astas con banderas: no se ponen.
  {
    const lad = api.concrete(0xb8643f, { roughness: .9 }), gris = api.concrete(0x8a8d90, { roughness: .5, metalness: .4 });
    // cara del basamento que mira a la calle (borde este de la huella OSM)
    const NE = LL(10.490480, -66.860887), SE = LL(10.490056, -66.860919);
    const enFachada = (k) => { const q = RA(k), ex = SE.x - NE.x, ez = SE.z - NE.z, L = Math.hypot(ex, ez), t = Math.max(.05, Math.min(.95, ((q.x - NE.x) * ex + (q.z - NE.z) * ez) / (L * L)));
      const X = NE.x + ex * t, Z = NE.z + ez * t; let nx = ez / L, nz = -ex / L; if ((q.x - X) * nx + (q.z - Z) * nz < 0) { nx = -nx; nz = -nz; } return { X, Z, nx, nz, ry: Math.atan2(nx, nz), y: GY(X, Z) }; };
    // letras ATRIUM en relieve plateado sobre un paño de ladrillo
    { const f = enFachada(23.505), t = valla(512, 96, (x, w, h) => { x.fillStyle = '#b8643f'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(70,30,15,.2)'; for (let y = 4; y < h; y += 7) x.fillRect(0, y, w, 1);
        x.font = 'bold 76px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#3b3b3b'; x.fillText('ATRIUM', w / 2 + 3, h / 2 + 5); x.fillStyle = '#d9dcdf'; x.fillText('ATRIUM', w / 2, h / 2 + 2); });
      add(new THREE.BoxGeometry(11, 2.1, .3), [lad, lad, lad, lad, t, lad], f.X + f.nx * .2, f.y + 4.2, f.Z + f.nz * .2, f.ry); }
    // pilón con el escudo y CHACAO, en la plazoleta, de cara a quien baja por la calle
    { const q = RA(23.532), px = q.x - q.lx * 12.5, pz = q.z - q.lz * 12.5, y = GY(px, pz), dx = -q.tx + q.lx * .8, dz = -q.tz + q.lz * .8;
      const t = valla(256, 288, (x, w, h) => { x.fillStyle = '#c0673f'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(70,30,15,.18)'; for (let yy = 4; yy < h; yy += 7) x.fillRect(0, yy, w, 1);
        const cx = w / 2, top = 46, sw = 74, sh = 96; x.beginPath(); x.moveTo(cx - sw / 2, top); x.lineTo(cx + sw / 2, top); x.lineTo(cx + sw / 2, top + sh * .55); x.quadraticCurveTo(cx + sw / 2, top + sh * .9, cx, top + sh); x.quadraticCurveTo(cx - sw / 2, top + sh * .9, cx - sw / 2, top + sh * .55); x.closePath();
        x.fillStyle = '#f4f2ee'; x.fill(); x.fillStyle = '#b3262c'; x.beginPath(); x.moveTo(cx - 20, top + 22); x.lineTo(cx + 20, top + 22); x.lineTo(cx + 20, top + 52); x.quadraticCurveTo(cx + 20, top + 70, cx, top + 78); x.quadraticCurveTo(cx - 20, top + 70, cx - 20, top + 52); x.closePath(); x.fill();
        x.fillStyle = '#f4f2ee'; x.font = 'bold 50px Arial, sans-serif'; x.textAlign = 'center'; x.fillText('CHACAO', cx, 214); });
      add(new THREE.BoxGeometry(5.2, 6.4, 1.1), [lad, lad, lad, lad, t, lad], px, y + 3.2, pz, Math.atan2(dx, dz));
      add(new THREE.BoxGeometry(6.6, .5, 2.2), api.concrete(0x9c9a94), px, y + .25, pz, Math.atan2(dx, dz)); }
    // postes con pendones rojos «TODO» a los dos lados (cara roja hacia quien llega, la de atrás lisa)
    { const pend = new THREE.MeshStandardMaterial({ roughness: .8, map: api.canvasTex(64, 224, (x, w, h) => { x.fillStyle = '#c4262b'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.fillRect(6, 10, w - 12, 3); x.fillRect(6, h - 16, w - 12, 3);
        x.save(); x.translate(w / 2 + 6, h / 2); x.rotate(-Math.PI / 2); x.font = 'bold 40px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TODO', 0, 0); x.restore(); }) });
      const rojo = api.concrete(0xb0242a, { roughness: .8 });
      for (const [k, s] of [[23.468, -1], [23.494, -1], [23.52, -1], [23.546, -1], [23.48, 1], [23.51, 1], [23.54, 1]]) {
        const q = RA(k), px = q.x + q.lx * 7.3 * s, pz = q.z + q.lz * 7.3 * s, y = GY(px, pz), ry = Math.atan2(-q.tx, -q.tz);
        add(new THREE.CylinderGeometry(.09, .12, 8, 8), gris, px, y + 4, pz);
        add(new THREE.BoxGeometry(.06, .06, 1.1), gris, px - q.lx * .5 * s, y + 6.6, pz - q.lz * .5 * s, ang(q.lx, q.lz));
        add(new THREE.BoxGeometry(.8, 2.6, .04), [rojo, rojo, rojo, rojo, pend, rojo], px - q.lx * .55 * s, y + 5.25, pz - q.lz * .55 * s, ry); } }
    // DESPACIO y ALCALDÍA pintados en el asfalto (se leen al entrar a la calle)
    { const piso = (txt, k) => { const t = api.canvasTex(512, 96, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#f2f2ee'; x.font = 'bold 86px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.save(); x.scale(1, 1.15); x.fillText(txt, w / 2, h / 2 / 1.15 + 2); x.restore(); });
        const m = new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, roughness: .8, polygonOffset: true, polygonOffsetFactor: -10, polygonOffsetUnits: -20 });
        const q = RA(k), ge = new THREE.PlaneGeometry(6.4, 1.7); ge.rotateX(-Math.PI / 2);
        const me = add(ge, m, q.x, q.y + .05, q.z, Math.atan2(-q.tx, -q.tz)); me.receiveShadow = true; return me; };
      piso('DESPACIO', 23.487); piso('ALCALDÍA', 23.497); }
  }

  // ═════════ 14 (20-nov, pedido del dueño). Paseo Las Mercedes, Rampa de Las Mercedes en desuso, El Trolly y Edificio Keope ═════════
  // Posiciones: huellas y vías de OSM (build/raw/edificios.json y calles.json). Volumen y color de los tres edificios en fx/correcciones/mercedes.js;
  // aquí van los rótulos y la rampa. Lados respecto al corredor: Paseo der. (km 25,65–25,70, 24–27 m), rampa der. (25,79–26,11, de 9,5 a 34 m: pegada al muro con mural, ver abajo),
  // Trolly der. (25,92–26,00, 22–37 m, bajo el tablero de la autopista), Keope izq. (26,02–26,09, 11–39 m).
  {
    const conc = api.concrete(0xa8a59c), concOsc = api.concrete(0x7d7b75);
    // cara(poly, km): arista de la planta que mejor mira a la ruta en ese km → {x, z, len, ry} (ry gira el +Z local hacia la ruta)
    const cara = (poly, km) => { const P = poly.map(([a, b]) => LL(a, b)), r = RA(km); let best = null;
      for (let i = 0; i < P.length; i++) { const A = P[i], B = P[(i + 1) % P.length], len = Math.hypot(B.x - A.x, B.z - A.z); if (len < 6) continue;
        const mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2; let nx = (B.z - A.z) / len, nz = -(B.x - A.x) / len; if ((r.x - mx) * nx + (r.z - mz) * nz < 0) { nx = -nx; nz = -nz; }
        const d = Math.hypot(r.x - mx, r.z - mz) - len * .3; if (!best || d < best.d) best = { d, x: mx + nx * .35, z: mz + nz * .35, len, ry: Math.atan2(nx, nz) }; }
      return best; };
    const rotulo = (w, h, fn) => valla(w, h, fn);
    // letrero plano (caja delgada) con la textura solo en la cara que mira a la ruta (+Z local)
    const letrero = (c, ancho, alto, y, mat, fondo = concOsc) => add(new THREE.BoxGeometry(ancho, alto, .25), [fondo, fondo, fondo, fondo, mat, fondo], c.x, y, c.z, c.ry);

    // ── C.C. Paseo Las Mercedes: letras en la banda alta de la cara NE (la que da a la Av. Principal) ──
    { const c = cara([[10.478650, -66.858185], [10.478321, -66.857856], [10.477202, -66.858363], [10.477285, -66.859053], [10.478618, -66.858534]], 25.67);
      const t = rotulo(256, 40, (x, w, h) => { x.fillStyle = '#f3f1ec'; x.fillRect(0, 0, w, h); x.fillStyle = '#1f3a5c'; x.font = 'bold 25px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PASEO LAS MERCEDES', w / 2, h / 2 + 1); });
      if (c) letrero(c, Math.min(26, c.len * .8), 4, GY(c.x, c.z) + 15.6, t, api.concrete(0xe9e6de)); }

    // ── El Trolly: rótulo sobre el pretil del local, por encima del muro con mural (se lee desde la vía entre 25,85 y 25,95) ──
    { const c = cara([[10.478981, -66.855425], [10.478881, -66.855657], [10.478893, -66.855704], [10.478842, -66.855741], [10.478767, -66.855702], [10.478862, -66.855385], [10.478928, -66.85522], [10.478986, -66.855104], [10.47908, -66.855215]], 25.95);
      const t = rotulo(256, 64, (x, w, h) => { x.fillStyle = '#f4ead2'; x.fillRect(0, 0, w, h); x.fillStyle = '#b3241f'; x.fillRect(0, 0, w, 7); x.fillRect(0, h - 7, w, 7);
        x.font = 'italic bold 40px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('El Trolly', w / 2, h / 2 + 2); });
      if (c) { const y = GY(c.x, c.z); letrero(c, 9, 2.2, y + 5.3, t, api.concrete(0xb3241f)); for (const s of [-3.6, 3.6]) add(new THREE.BoxGeometry(.18, 1.4, .18), concOsc, c.x + Math.cos(c.ry) * s, y + 3.9, c.z - Math.sin(c.ry) * s); } }

    // ── Edificio Keope: nombre arriba, en la cara larga que da a la vía, y placa junto a la entrada ──
    { const c = cara([[10.479969, -66.854788], [10.479782, -66.854667], [10.479523, -66.85508], [10.47971, -66.855202]], 26.05);
      const t = rotulo(256, 48, (x, w, h) => { x.fillStyle = '#5a3a27'; x.fillRect(0, 0, w, h); x.fillStyle = '#f1e6d2'; x.font = 'bold 34px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('K E O P E', w / 2, h / 2 + 2); });
      const p = rotulo(128, 32, (x, w, h) => { x.fillStyle = '#e9e1d2'; x.fillRect(0, 0, w, h); x.fillStyle = '#3b2a1f'; x.font = 'bold 15px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('EDIFICIO KEOPE', w / 2, h / 2 + 1); });
      if (c) { const y = GY(c.x, c.z); letrero(c, 13, 2.4, y + 10 * 3.2 - 1.6, t, api.concrete(0x5a3a27)); letrero(c, 3.2, .8, y + 2.9, p, api.concrete(0x3b2a1f)); }
      // la cara larga queda casi paralela a la vía: el nombre también en la testera que mira a quien llega (la arista cuya normal va contra el sentido de carrera)
      { const P = [[10.479969, -66.854788], [10.479782, -66.854667], [10.479523, -66.85508], [10.47971, -66.855202]].map(([a, b]) => LL(a, b)), r = RA(26.0); let best = null;
        for (let i = 0; i < 4; i++) { const A = P[i], B = P[(i + 1) % 4], len = Math.hypot(B.x - A.x, B.z - A.z), mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2; let nx = (B.z - A.z) / len, nz = -(B.x - A.x) / len;
          let cx = 0, cz = 0; P.forEach(q => { cx += q.x / 4; cz += q.z / 4; }); if ((mx - cx) * nx + (mz - cz) * nz < 0) { nx = -nx; nz = -nz; }
          const sc = -(nx * r.tx + nz * r.tz); if (!best || sc > best.sc) best = { sc, x: mx + nx * .35, z: mz + nz * .35, len, ry: Math.atan2(nx, nz) }; }
        if (best) letrero(best, Math.min(12, best.len * .8), 2.4, GY(best.x, best.z) + 10 * 3.2 - 1.6, t, api.concrete(0x5a3a27)); } }

    // ── Rampa de Las Mercedes (sube de la calle al viaducto de la Autopista Prados del Este), en desuso ──
    // En OSM es el motorway_link «Rampa de Las Mercedes»: se separa a la DERECHA al final de la Av. Principal (25,74; el brocal amarillo del ramal,
    // f_0251) y sube hacia la calzada sur de la autopista. Su eje OSM queda 30–60 m afuera, detrás del muro con mural, y desde la vía no se veía
    // nada (el muro de 3–4 m tapa todo lo que esté por debajo de ~17 m a 60 m). En el video (f_0254) la calzada alta corre justo detrás del muro
    // con mural (se ve un autobús por encima de él), así que la trazo pegada a ese muro: a nivel en 25,79, sube a ~3,6 m en 26,04, sale de detrás
    // del muro (que termina en 26,07) y gira a la derecha hasta el tablero del viaducto (≈ 8,6 m) en 26,11. Tablero de 7,5 m con New Jersey a los
    // dos lados, terraplén lleno donde va baja, pilas donde va en el aire, asfalto viejo con monte y bloques que cierran la entrada.
    // Las caras de los muros van con dos() (dos caras de frente) por la oclusión ambiental.
    { const HWr = 3.75, PJ = .85, OF = 9.5 + HWr, S = [];
      for (let k = 25.79; k <= 26.04 + 1e-6; k += .003) { const r = RA(k), u = (k - 25.79) / .25; S.push({ x: r.x - r.lx * OF, z: r.z - r.lz * OF, y: r.y + .15 + 3.45 * u * u * (3 - 2 * u) * .6 + 3.45 * u * .4 }); }
      { const r0 = RA(26.04), r1 = RA(26.11), P0 = { x: r0.x - r0.lx * OF, z: r0.z - r0.lz * OF }, C = { x: P0.x + r0.tx * 30, z: P0.z + r0.tz * 30 }, P1 = { x: r1.x - r1.lx * 30, z: r1.z - r1.lz * 30 };
        const y0 = S[S.length - 1].y, y1 = r1.y + 8.6;
        for (let t = .05; t <= 1 + 1e-6; t += .05) { const a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t; S.push({ x: a * P0.x + b * C.x + c * P1.x, z: a * P0.z + b * C.z + c * P1.z, y: y0 + (y1 - y0) * t * t * (3 - 2 * t) }); } }
      S.forEach((p, i) => { p.s = i ? S[i - 1].s + Math.hypot(p.x - S[i - 1].x, p.z - S[i - 1].z) : 0; });
      S.forEach((p, i) => { const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)], l = Math.hypot(b.x - a.x, b.z - a.z) || 1; p.nx = -(b.z - a.z) / l; p.nz = (b.x - a.x) / l; p.gy = GY(p.x, p.z); });
      // cinta entre dos bordes (desplazamiento lateral o0/o1, alturas f0/f1 en función del punto); uv: u = metros a lo largo
      const cinta = (o0, f0, o1, f1, mat, uRep = 8) => { const ps = [], uv = [], ix = []; S.forEach((p, i) => { ps.push(p.x + p.nx * o0, f0(p), p.z + p.nz * o0, p.x + p.nx * o1, f1(p), p.z + p.nz * o1); uv.push(p.s / uRep, 0, p.s / uRep, 1);
          if (i) { const o = (i - 1) * 2; ix.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); } });
        const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.setIndex(ix); g.add(dos(ge, mat)); };
      const asfT = api.canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#5f5e5a'; x.fillRect(0, 0, w, h); let sd = 7; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
        for (let k = 0; k < 90; k++) { x.fillStyle = r() < .55 ? `rgba(${70 + r() * 40 | 0},${95 + r() * 50 | 0},${45 + r() * 25 | 0},.55)` : 'rgba(40,38,34,.35)'; x.beginPath(); x.ellipse(r() * w, r() * h, 2 + r() * 9, 1 + r() * 4, r() * 3, 0, 7); x.fill(); }
        x.strokeStyle = 'rgba(30,30,28,.5)'; x.lineWidth = 1; for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(r() * w, 0); x.lineTo(r() * w, h); x.stroke(); } });
      asfT.wrapS = asfT.wrapT = THREE.RepeatWrapping;
      const asf = new THREE.MeshStandardMaterial({ map: asfT, roughness: .95 }), muroR = api.concrete(0xb2aea4), njM = api.concrete(0xc7c3b8);
      const bajo = p => p.y - p.gy < 4.5 ? p.gy - .6 : p.y - 1.1;          // donde va baja es terraplén lleno; arriba, solo el canto del tablero
      cinta(-HWr + .5, p => p.y, HWr - .5, p => p.y, asf, 8);              // calzada
      for (const sg of [-1, 1]) {
        cinta(sg * HWr, bajo, sg * HWr, p => p.y + PJ, muroR, 6);           // cara exterior (muro de terraplén o canto) hasta el tope del New Jersey
        cinta(sg * (HWr - .5), p => p.y, sg * (HWr - .32), p => p.y + PJ, njM, 6);   // cara interior del New Jersey
        cinta(sg * (HWr - .32), p => p.y + PJ, sg * HWr, p => p.y + PJ, njM, 6); }    // tope
      cinta(-HWr, p => p.y - p.gy < 4.5 ? p.gy - .6 : p.y - 1.1, HWr, p => p.y - p.gy < 4.5 ? p.gy - .6 : p.y - 1.1, concOsc, 8);   // fondo del tablero
      // pilas cada ~18 m donde va en el aire
      let ult = -99; for (const p of S) { const hh = p.y - 1.1 - p.gy; if (hh > 2.5 && p.s - ult >= 18) { ult = p.s; add(new THREE.BoxGeometry(1.4, hh + .5, 1.4), conc, p.x, p.gy + (hh + .5) / 2 - .5, p.z); } }
      // cierre de la entrada: tres bloques de concreto atravesados con franjas rojas y blancas borrosas
      { const p = S[2], ry = Math.atan2(p.nx, p.nz), bT = api.canvasTex(64, 16, (x, w, h) => { x.fillStyle = '#c9c5ba'; x.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? 'rgba(190,60,50,.6)' : 'rgba(240,240,235,.6)'; x.fillRect(i * 8, 4, 8, 7); } });
        const bm = new THREE.MeshStandardMaterial({ map: bT, roughness: .9 });
        for (const o of [-2.3, 0, 2.3]) add(new THREE.BoxGeometry(2.1, .82, .6), [njM, njM, njM, njM, bm, bm], p.x + p.nx * o, p.y + .41, p.z + p.nz * o, ry); }
    }
  }
  return api.sombras(g);
}
