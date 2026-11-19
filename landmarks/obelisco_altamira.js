// Plaza Francia (Plaza Altamira, arq. Luis Roche, 1945) sobre la Av. Francisco de Miranda, km 37,23–37,31 a la derecha.
// Planta medida en la foto satelital Esri z19 (0,29 m/px) con el obelisco en el nodo OSM «Obelisco de la Plaza Francia»; la plaza corre
// casi norte-sur (66 × 160 m) entre la Av. San Juan Bosco (O) y la Av. Luis Roche (E). De norte a sur: espejo de agua norte de cabeceras
// lobuladas (9,5 × 26 m), rotonda con el obelisco crema (~42 m sobre la plaza, fuste de 2,5 m) en su fuente de tazas (Ø 18,6 m) y ocho
// jardineras, muro con hornacina, espejo sur (11 × 20,5 m), la cascada entre dos escaleras y la fosa semicircular donde cae el agua
// (acceso al Metro Altamira); al borde de la avenida, el frente de ladrillo rojo con kioscos blancos y los tótems de la M.
// Desde la vía: el eje de la ruta pasa ~10 m al N del centro de la calzada real (va pegado al brocal norte), así que todo lo del frente
// se recorta a ≥ 9,5 m del eje. La arboleda (caobos, mangos, apamates y chaguaramos) va en `arboles` de fx/correcciones/miranda.js.
// En el video el obelisco no entra en cuadro (lo tapa el Hotel Caracas Palace hasta la Luis Roche y luego queda a ~70° a la derecha).
export const meta = {
  id: 'obelisco_altamira',
  nombre: 'Plaza Francia y Obelisco de Altamira',
  quita: [[10.496537, -66.848911, 6]],
};

export function build(THREE, api) {
  const root = new THREE.Group();
  const O = (() => { const p = api.xz(10.496534, -66.848908); return { x: p.x, z: p.z }; })(), ROT = -.04, cR = Math.cos(ROT), sR = Math.sin(ROT);
  const W = (lx, lz) => ({ x: O.x + lx * cR + lz * sR, z: O.z - lx * sR + lz * cR });   // local (x este, z sur) → mundo
  const gL = (lx, lz) => { const p = W(lx, lz); return api.ground(p.x, p.z); };
  const mk = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };
  const cream = api.concrete(0xd8c7a0), creamD = api.concrete(0xbca97f), stone = api.concrete(0xb3a68f), pave = api.concrete(0xcdbfa6);
  const waterTex = api.canvasTex(64, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#1f5fb8'); gr.addColorStop(.5, '#2f7fd6'); gr.addColorStop(1, '#1f5fb8'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 30; i++) x.fillRect(Math.random() * w, Math.random() * h, 10, 1.5); });
  const water = new THREE.MeshStandardMaterial({ map: waterTex, roughness: .08, metalness: .2, emissive: 0x2f7fd6, emissiveIntensity: 0 });
  api.onFrame(st => { water.emissiveIntensity = .45 * st.noche; });
  // pieza en coordenadas locales apoyada en el terreno (o a la cota y dada)
  const put = (mesh, lx, lz, dy = 0, y = null) => { const p = W(lx, lz); mesh.position.set(p.x, (y ?? api.ground(p.x, p.z)) + dy, p.z); mesh.rotation.y += ROT; root.add(mesh); return mesh; };
  // capa pegada al terreno sobre un rectángulo local (la cara de arriba mira al cielo); `cerca(x, z)` puede recortar los vértices
  const capa = (x0, z0, x1, z1, mat, dy = .07, paso = 3, rep = null) => { const nx = Math.max(1, Math.round((x1 - x0) / paso)), nz = Math.max(1, Math.round((z1 - z0) / paso));
    const ge = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); ge.rotateX(-Math.PI / 2); const p = ge.attributes.position, uv = ge.attributes.uv;
    for (let i = 0; i < p.count; i++) { let lx = p.getX(i) + (x0 + x1) / 2, lz = p.getZ(i) + (z0 + z1) / 2; lz = Math.min(lz, zMax(lx)); const w = W(lx, lz); p.setXYZ(i, w.x, api.ground(w.x, w.z) + dy, w.z); if (rep) uv.setXY(i, lx / rep, -lz / rep); }
    ge.computeVertexNormals(); const m = new THREE.Mesh(ge, mat); root.add(m); return m; };
  // borde sur utilizable: a 9,5 m del eje de la ruta (recta ajustada entre km 37,20 y 37,34, en coordenadas locales)
  const loc = (x, z) => { const dx = x - O.x, dz = z - O.z; return { x: dx * cR - dz * sR, z: dx * sR + dz * cR }; };
  const rA = api.routeAt(37.20), rB = api.routeAt(37.34), la = loc(rA.x, rA.z), lb = loc(rB.x, rB.z);
  const zRuta = lx => la.z + (lb.z - la.z) * (lx - la.x) / (lb.x - la.x), zMax = lx => zRuta(lx) - 9.5 / Math.cos(Math.atan2(lb.z - la.z, lb.x - la.x));

  // --- obelisco y su fuente de tazas ---
  const ob = new THREE.Group();
  ob.add(mk(new THREE.CylinderGeometry(9.3, 9.4, .9, 56), cream, 0, .45, 0));
  const bw = new THREE.Mesh(new THREE.CircleGeometry(8.8, 56), water); bw.rotation.x = -Math.PI / 2; bw.position.y = .93; ob.add(bw);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(9.15, .28, 6, 56), creamD); rim.rotation.x = Math.PI / 2; rim.position.y = .95; ob.add(rim);
  // tazas: perfil torneado (pie, copa ancha, segundo cuerpo, copa menor)
  const prof = [[0, 0], [3.4, 0], [3.0, .4], [2.2, .9], [2.0, 1.6], [4.6, 2.1], [4.8, 2.5], [2.6, 2.7], [2.2, 3.3], [3.3, 3.8], [3.4, 4.1], [2.4, 4.3], [2.2, 4.6], [0, 4.6]].map(([r, y]) => new THREE.Vector2(r, y));
  const tz = new THREE.Mesh(new THREE.LatheGeometry(prof, 40), cream); tz.position.y = .4; ob.add(tz);
  // pedestal ornamentado (escalones + dado con relieves)
  const ped = [[3.6, .5], [3.1, .5], [2.7, 2.6], [3.0, .4], [2.5, .9]]; let y = 5.0;
  for (const [w, h] of ped) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), h > 2 ? creamD : cream); b.position.y = y + h / 2; ob.add(b); y += h; }
  const reliefTex = api.canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#cdb98e'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8e7a52'; x.lineWidth = 5; x.strokeRect(14, 14, w - 28, h - 28); x.beginPath(); x.arc(w / 2, h / 2, 26, 0, 7); x.stroke(); x.fillStyle = '#9d8a60'; x.fillRect(w / 2 - 4, 30, 8, h - 60); });
  const rel = new THREE.MeshStandardMaterial({ map: reliefTex, roughness: .9 });
  for (let k = 0; k < 4; k++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), rel), a = k * Math.PI / 2; p.position.set(Math.sin(a) * 1.36, 5.0 + 1 + 1.3, Math.cos(a) * 1.36); p.rotation.y = a; ob.add(p); }
  // fuste de base cuadrada (2,5 m) que se afina al 62 % + piramidión: ~42 m sobre la plaza
  const shaftH = 30, base = y;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.25 * Math.SQRT2 * .62, 1.25 * Math.SQRT2, shaftH, 4, 1), cream); shaft.rotation.y = Math.PI / 4; shaft.position.y = base + shaftH / 2; ob.add(shaft);
  const pyr = new THREE.Mesh(new THREE.ConeGeometry(1.25 * Math.SQRT2 * .62, 2.6, 4), creamD); pyr.rotation.y = Math.PI / 4; pyr.position.y = base + shaftH + 1.3; ob.add(pyr);
  // placa con inscripción en la cara sur (hacia la avenida)
  const plq = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.4), api.concrete(0x8f7b55)); plq.position.set(0, base + 2.5, 1.26 * .98); ob.add(plq);
  // luz de piso que baña el obelisco de noche (cono aditivo, animado)
  const wash = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 3.2, shaftH, 4, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); wash.rotation.y = Math.PI / 4; wash.position.y = base + shaftH / 2; wash.userData.noFusion = true; ob.add(wash);
  api.onFrame(st => { wash.material.opacity = .22 * st.noche; });
  put(ob, 0, 0, -.1);

  // --- pisos: rotonda de anillos y radios, ejes peatonales N-S y frente de ladrillo rojo sobre la avenida ---
  const ringTex = api.canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#cbbb9f'; x.fillRect(0, 0, w, h); x.strokeStyle = '#a99579'; x.lineWidth = 3; for (let r = 60; r < 256; r += 28) { x.beginPath(); x.arc(256, 256, r, 0, 7); x.stroke(); } for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; x.beginPath(); x.moveTo(256 + Math.cos(a) * 60, 256 + Math.sin(a) * 60); x.lineTo(256 + Math.cos(a) * 256, 256 + Math.sin(a) * 256); x.stroke(); } });
  { const ge = new THREE.RingGeometry(9.5, 21, 64, 4); ge.rotateX(-Math.PI / 2); const p = ge.attributes.position, uv = ge.attributes.uv;
    for (let i = 0; i < p.count; i++) { const lx = p.getX(i), lz = p.getZ(i), w = W(lx, lz); uv.setXY(i, .5 + lx / 42, .5 - lz / 42); p.setXYZ(i, w.x, api.ground(w.x, w.z) + .08, w.z); }
    ge.computeVertexNormals(); root.add(new THREE.Mesh(ge, new THREE.MeshStandardMaterial({ map: ringTex, roughness: .95 }))); }
  const losaTex = api.canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#d2c5ab'; x.fillRect(0, 0, w, h); x.strokeStyle = '#b3a385'; x.lineWidth = 2; for (let i = 0; i <= w; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } });
  losaTex.wrapS = losaTex.wrapT = THREE.RepeatWrapping; const losa = new THREE.MeshStandardMaterial({ map: losaTex, roughness: .95 });
  capa(-9, -58, 8, -20, losa, .07, 3, 4); capa(-3.5, 20.5, 3.5, 44, losa, .07, 3, 4); capa(-7, 44, 13.5, 66, losa, .07, 3, 4);
  const ladTex = api.canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#a5503b'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(60,20,10,.35)'; for (let j = 0; j < h; j += 8) { x.fillRect(0, j, w, 1); for (let i = (j / 8 % 2) * 8; i < w; i += 16) x.fillRect(i, j, 1, 8); } });
  ladTex.wrapS = ladTex.wrapT = THREE.RepeatWrapping;
  capa(-32, 97, 32.5, 116, new THREE.MeshStandardMaterial({ map: ladTex, roughness: .95 }), .08, 3, 4);

  // --- ocho jardineras de la rotonda: brocal de piedra, grama y seto bajo ---
  { const grama = api.concrete(0x55803d), seto = api.concrete(0x2f5626, { roughness: 1 });
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8, lx = Math.sin(a) * 15.5, lz = Math.cos(a) * 15.5, g = new THREE.Group();
      g.add(mk(new THREE.BoxGeometry(6.6, .45, 4.2), stone, 0, .1, 0));
      g.add(mk(new THREE.BoxGeometry(6.0, .1, 3.6), grama, 0, .36, 0));
      g.add(mk(new THREE.BoxGeometry(5.4, .75, .7), seto, 0, .7, 1.3));
      g.rotation.y = a; put(g, lx, lz); } }

  // --- espejos de agua: brocal macizo a la cota más alta de su huella (el terreno de la plaza cae ~1,5 m hacia el S) ---
  const nivel = (lx, lz, w, L) => Math.max(gL(lx - w / 2, lz - L / 2), gL(lx + w / 2, lz - L / 2), gL(lx - w / 2, lz + L / 2), gL(lx + w / 2, lz + L / 2));
  const fondo = (lx, lz, w, L) => Math.min(gL(lx - w / 2, lz - L / 2), gL(lx + w / 2, lz - L / 2), gL(lx - w / 2, lz + L / 2), gL(lx + w / 2, lz + L / 2));
  const espejo = (lx, lz, w, L, lobulo) => { const y0 = nivel(lx, lz, w + 2, L + 2) + .35, yb = fondo(lx, lz, w + 2, L + 2) - .4, H = y0 + .3 - yb, g = new THREE.Group();
    const sh = (ww, LL, r) => { const s = new THREE.Shape(); if (r) { s.moveTo(-ww / 2, -LL / 2 + r); s.absarc(0, -LL / 2 + r, ww / 2, Math.PI, 0, true); s.lineTo(ww / 2, LL / 2 - r); s.absarc(0, LL / 2 - r, ww / 2, 0, Math.PI, true); s.closePath(); } else { s.moveTo(-ww / 2, -LL / 2); s.lineTo(ww / 2, -LL / 2); s.lineTo(ww / 2, LL / 2); s.lineTo(-ww / 2, LL / 2); s.closePath(); } return s; };
    const cu = new THREE.ExtrudeGeometry(sh(w + 1.4, L + 1.4, lobulo ? (w + 1.4) / 2 : 0), { depth: H, bevelEnabled: false, curveSegments: 10 }); cu.rotateX(-Math.PI / 2); g.add(mk(cu, stone, 0, yb, 0));
    const wt = new THREE.ShapeGeometry(sh(w, L, lobulo ? w / 2 : 0), 10); wt.rotateX(-Math.PI / 2); g.add(mk(wt, water, 0, y0 + .33, 0));
    put(g, lx, lz, 0, 0); return y0; };
  espejo(-1.5, -27.9, 9.5, 26.4, true);
  const ySur = espejo(3.2, 57.2, 11, 20.5, false);

  // --- muro con hornacina entre la rotonda y el espejo sur (frente hacia la avenida: cara frontal al S) ---
  { const g = new THREE.Group(), H = 3.4, Wm = 30;
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(Wm / 2 - 3, H, 1.2), creamD); w.position.set(s * (Wm / 4 + 1.5), H / 2, 0); g.add(w); }
    const arch = new THREE.Mesh(new THREE.BoxGeometry(6, H + 1.6, 1.6), cream); arch.position.y = (H + 1.6) / 2; g.add(arch);
    const niche = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, .3, 16, 1, false, -Math.PI / 2, Math.PI), api.concrete(0x6e6250)); niche.rotation.x = Math.PI / 2; niche.rotation.z = Math.PI; niche.position.set(0, 2.6, .72); g.add(niche);
    const nicheB = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.6), api.concrete(0x6e6250)); nicheB.position.set(0, 1.3, .81); g.add(nicheB);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(Wm, .35, 1.6), cream); cap.position.y = H + .17; g.add(cap);
    put(g, 1.5, 34, -.2); }

  // --- cascada: siete peldaños de agua del espejo sur a la fosa, con escaleras y antepechos a ambos lados ---
  { const g = new THREE.Group(), z0 = 67.6, n = 7, paso = 2.0, yTop = ySur + .3, yFin = gL(3.2, 82) + .15, dz = (yTop - yFin) / n;
    for (let i = 0; i < n; i++) { const yy = yTop - i * dz, s = new THREE.Mesh(new THREE.BoxGeometry(11, yy - yFin + .6, paso), stone); s.position.set(0, (yy + yFin - .6) / 2, z0 + paso * (i + .5)); g.add(s);
      const wt = new THREE.Mesh(new THREE.PlaneGeometry(10.4, paso * 1.02), water); wt.rotation.x = -Math.PI / 2 + .12; wt.position.set(0, yy + .02, z0 + paso * (i + .5)); g.add(wt); }
    const p = W(3.2, 0); g.position.set(p.x, 0, p.z); g.rotation.y = ROT; root.add(g);
    // escaleras: peldaños claros y oscuros alternados bajando hacia la fosa, entre antepechos de piedra
    const escTex = api.canvasTex(64, 128, (x, w, h) => { for (let j = 0; j < h; j += 16) { x.fillStyle = '#d6cbb5'; x.fillRect(0, j, w, 10); x.fillStyle = '#8f8573'; x.fillRect(0, j + 10, w, 6); } });
    escTex.wrapS = escTex.wrapT = THREE.RepeatWrapping; const esc = new THREE.MeshStandardMaterial({ map: escTex, roughness: .9 });
    for (const sx of [-1, 1]) { capa(3.2 + sx * 8.5 - 2, 66, 3.2 + sx * 8.5 + 2, 84, esc, .09, 2, 4);
      for (const ox of [6.2, 10.8]) put(new THREE.Mesh(new THREE.BoxGeometry(.45, 1.0, 18), stone), 3.2 + sx * ox, 75, .5); } }

  // --- fosa semicircular del Metro Altamira: fondo oscuro, antepecho en U abierta al N y surtidores ---
  { const g = new THREE.Group(), R = 6.4, cz = 90;
    const fondoM = api.concrete(0x1f2123, { roughness: 1 }); const fs = new THREE.Shape(); fs.moveTo(-R, 8); fs.lineTo(R, 8); fs.lineTo(R, 0); fs.absarc(0, 0, R, 0, Math.PI, false); fs.closePath();
    const fg = new THREE.ShapeGeometry(fs, 16); fg.rotateX(-Math.PI / 2); g.add(mk(fg, fondoM, 0, .06, 0));
    for (let k = 0; k <= 10; k++) { const a = k / 10 * Math.PI, b = new THREE.Mesh(new THREE.BoxGeometry(.45, 1.05, 2.1), stone); b.position.set(Math.cos(a) * (R + .2), .52, Math.sin(a) * (R + .2)); b.rotation.y = -a; g.add(b); }
    for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(.45, 1.05, 8), stone); b.position.set(s * (R + .2), .52, -4); g.add(b); }
    const jm = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .6, emissive: 0xffffff, emissiveIntensity: .3, depthWrite: false });
    for (let k = 0; k < 5; k++) { const a = (k + .5) / 5 * Math.PI, j = new THREE.Mesh(new THREE.CylinderGeometry(.35, .15, 3, 6, 1, true), jm); j.position.set(Math.cos(a) * 3.2, 1.6, Math.sin(a) * 3.2); j.userData.noFusion = true; g.add(j); }
    put(g, 3.2, cz); }

  // --- frente sobre la avenida: kioscos blancos y tótems de la M (solo donde quedan a ≥ 9,5 m del eje) ---
  { const blanco = api.concrete(0xf2f1ec), lona = api.concrete(0xf7f7f4, { roughness: .7 }), az = api.concrete(0x2c5aa0);
    for (const [lx, lz, s] of [[-5, 99.5, 5], [1.2, 99.5, 5], [7.4, 100.5, 3.6]]) { if (lz + s / 2 > zMax(lx)) continue; const g = new THREE.Group();
      g.add(mk(new THREE.BoxGeometry(s, 2.4, s), blanco, 0, 1.2, 0));
      g.add(mk(new THREE.BoxGeometry(s + .1, .5, s + .1), az, 0, 2.2, 0));
      const t = new THREE.Mesh(new THREE.ConeGeometry(s * .78, 1.3, 4), lona); t.rotation.y = Math.PI / 4; t.position.y = 3.05; g.add(t); put(g, lx, lz); }
    const mT = api.canvasTex(128, 160, (c, w, h) => { c.fillStyle = '#f26a1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 100px sans-serif'; c.textAlign = 'center'; c.fillText('M', w / 2, 100); c.font = 'bold 22px sans-serif'; c.fillText('Altamira', w / 2, 145); });
    const mM = new THREE.MeshStandardMaterial({ map: mT, roughness: .5, emissive: 0xffffff, emissiveMap: mT, emissiveIntensity: .1 }); api.onFrame(st => { mM.emissiveIntensity = .1 + .9 * st.noche; });
    const gris = api.concrete(0x3a3d42);
    for (const [lx, lz] of [[-12, 97], [17.5, 97]]) { if (lz > zMax(lx)) continue; const g = new THREE.Group(); g.add(mk(new THREE.BoxGeometry(.25, 4.6, .25), gris, 0, 2.3, 0));
      g.add(mk(new THREE.BoxGeometry(1.5, 1.9, .3), [gris, gris, gris, gris, mM, mM], 0, 5.2, 0)); put(g, lx, lz); } }

  // --- faroles de la plaza (fuste negro y globo que se enciende de noche), en un solo InstancedMesh por pieza ---
  { const pts = []; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; pts.push([Math.sin(a) * 22.5, Math.cos(a) * 22.5]); }
    for (const z of [-50, -38, 46, 62]) pts.push([-10.5, z], [12.5, z]); for (const x of [-26, -16, 18, 28]) if (95 < zMax(x)) pts.push([x, 95]);
    const fuste = new THREE.InstancedMesh(new THREE.CylinderGeometry(.09, .13, 4.2, 6), api.concrete(0x1d1e20, { roughness: .5, metalness: .4 }), pts.length);
    const globo = new THREE.InstancedMesh(new THREE.SphereGeometry(.32, 10, 8), api.glow(0xfff1d0, { dia: .15, noche: 2.2 }), pts.length), o = new THREE.Object3D();
    pts.forEach(([lx, lz], i) => { const p = W(lx, lz), yy = api.ground(p.x, p.z); o.position.set(p.x, yy + 2.1, p.z); o.updateMatrix(); fuste.setMatrixAt(i, o.matrix); o.position.y = yy + 4.4; o.updateMatrix(); globo.setMatrixAt(i, o.matrix); });
    root.add(fuste, globo); }

  // --- brocal bajo con antepecho que cierra la plaza hacia la San Juan Bosco y la Luis Roche (con pasos) ---
  for (const lx of [-32.5, 32.5]) for (const [z0, z1] of [[-58, -6], [6, 40], [50, 92]]) put(new THREE.Mesh(new THREE.BoxGeometry(.5, .7, z1 - z0), stone), lx, (z0 + z1) / 2, .25);
  return api.sombras(root);
}
