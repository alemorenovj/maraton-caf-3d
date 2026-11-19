// Teatro Teresa Carreño (1983, brutalismo). Planta: huella OSM w231405358 + las cubiertas blancas hexagonales
// escalonadas que se ven en la foto satelital (cuatro volúmenes troncopiramidales que crecen hacia el SE: la sala
// Ríos Reyna es la mayor). Muros inclinados de concreto encofrado, cubiertas blancas, torre de vidrio negro con dos
// pilastras que la rebasan, gran voladizo sobre pilar troncocónico y escultura negra en el jardín.
export const meta = {
  id: 'teresa_carreno',
  nombre: 'Teatro Teresa Carreño',
  quita: [[10.499045, -66.897947, 45]],
};

const HUELLA = [[-8.7, -19.6], [-22.2, -14.4], [-23.9, -39.2], [-37.7, -51.0], [-24.4, -57.1], [-14.8, -53.3], [-6.8, -57.7], [15.6, -35.1], [23.3, -38.0], [39.1, -28.0], [37.0, -19.1], [51.1, -7.4], [50.0, 7.4], [42.8, 37.3], [23.9, 41.0], [15.3, 46.3], [-1.7, 52.1], [-1.9, 62.8], [-23.9, 72.1], [-39.2, 57.5], [-33.6, 33.4], [-25.1, 29.9], [-15.7, 1.7], [-9.6, -1.9]];

export function build(THREE, api) {
  const g = new THREE.Group(), c = api.xz(10.499045, -66.897947), y0 = api.ground(c.x, c.z) - 4;
  // concreto encofrado: paños con juntas horizontales y verticales
  const encof = (rep) => { const t = api.canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#8e887d'; x.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '60,55,50' : '230,225,215'},${Math.random() * .06})`; x.fillRect(Math.random() * w, Math.random() * h, 30 + Math.random() * 60, 4 + Math.random() * 10); } x.fillStyle = 'rgba(40,38,35,.35)'; for (let j = 0; j < 8; j++) x.fillRect(0, j * 32, w, 2); for (let j = 0; j < 4; j++) x.fillRect(j * 64, 0, 2, h); x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(0, h * .75, w, h * .25); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return new THREE.MeshStandardMaterial({ map: t, roughness: .95 }); };
  const muroInc = encof([6, 3]), muroBajo = encof([10, 1]), blanco = api.concrete(0xeeeeea, { roughness: .8 }), conc = api.concrete(0x8f897e), oscuro = api.concrete(0x6d6860);
  const negro = api.glass(0x15181c, { roughness: .12, metalness: .9 });
  const negroLuz = api.facade({ pared: '#1a1c20', vidrio: '#0e1013', pisos: 12, vanos: 3, marco: .12, encendidas: .45, seed: 4, metalness: .85, roughness: .15 });

  // 1. basamento: la huella real extruida a 9 m
  const shape = new THREE.Shape(HUELLA.map(([x, z]) => new THREE.Vector2(x, -z)));
  const base = new THREE.ExtrudeGeometry(shape, { depth: 13, bevelEnabled: false }); base.rotateX(-Math.PI / 2);
  g.add(new THREE.Mesh(base, [conc, muroBajo]));
  // franja de vidrio ahumado corrida en el basamento (vestíbulos)
  const franja = new THREE.ExtrudeGeometry(new THREE.Shape(HUELLA.map(([x, z]) => new THREE.Vector2(x * 1.006, -z * 1.006))), { depth: 3, bevelEnabled: false }); franja.rotateX(-Math.PI / 2); franja.translate(0, 5, 0);
  const lobby = api.glow(0x4a3420, { dia: .05, noche: 1.4 }); g.add(new THREE.Mesh(franja, [negro, lobby]));

  // 2. volúmenes troncopiramidales hexagonales con cubierta blanca, escalonados hacia el SE (de la foto satelital)
  //    [x, z, radio base, radio arriba, alto, alargamiento]
  const VOL = [[-14, -46, 17, 12, 24, 1.15], [3, -29, 25, 17, 33, 1.2], [33, -6, 34, 23, 44, 1.25], [27, 22, 34, 24, 37, 1.25]];
  for (const [x, z, rb, rt, h, k] of VOL) {
    const geo = new THREE.CylinderGeometry(rt, rb, h, 6, 1); geo.rotateY(Math.PI / 6); geo.scale(k, 1, 1 / k * 1.05); geo.rotateY(-Math.PI / 4);
    const m = new THREE.Mesh(geo, [muroInc, blanco, oscuro]); m.position.set(x, 13 + h / 2, z); g.add(m);
    // pretil del techo blanco
    const pr = new THREE.Mesh(new THREE.CylinderGeometry(rt * 1.01, rt * 1.01, 1.6, 6, 1, true), conc); pr.geometry.rotateY(Math.PI / 6); pr.geometry.scale(k, 1, 1 / k * 1.05); pr.geometry.rotateY(-Math.PI / 4); pr.position.set(x, 13 + h + .8, z); g.add(pr);
  }
  // contrafuertes inclinados (los grandes planos en talud de la foto) en la cara SO de la sala mayor
  const talud = new THREE.BufferGeometry(); { const w = 30, d = 18, h = 44; talud.setAttribute('position', new THREE.Float32BufferAttribute([-w / 2, 0, 0, w / 2, 0, 0, w / 2, 0, d, -w / 2, 0, d, -w / 2 + 4, h, 0, w / 2 - 4, h, 0], 3)); talud.setIndex([0, 4, 1, 1, 4, 5, 3, 2, 4, 2, 5, 4, 1, 5, 2, 0, 3, 4, 0, 1, 2, 0, 2, 3]); talud.computeVertexNormals(); }
  const tal = new THREE.Mesh(talud, muroInc); tal.position.set(12, 13, 30); tal.rotation.y = -Math.PI / 4 + Math.PI; g.add(tal);

  // 3. torre de ascensores de vidrio negro con dos pilastras de concreto que la rebasan y caja de máquinas arriba
  const tv = new THREE.Mesh(new THREE.BoxGeometry(8, 46, 8), negroLuz); tv.position.set(-12, 13 + 23 - 13, 6); tv.rotation.y = Math.PI / 4; g.add(tv);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(2.2, 58, 2.2), conc); p.position.set(-12 + s * 5.5 * .707 + 6 * .707 * .5, 29 - 13 + 13, 6 + s * 5.5 * .707 - 3 * .707); g.add(p); }
  const caja = new THREE.Mesh(new THREE.BoxGeometry(9, 9, 6), conc); caja.position.set(-9, 13 + 46 + 4, 6); caja.rotation.y = Math.PI / 4; g.add(caja);

  // 4. gran voladizo inclinado sobre pilar troncocónico (fachada de la plaza, al oeste)
  const vol = new THREE.Mesh(new THREE.BoxGeometry(34, 3, 26), conc); vol.position.set(-36, 17, 34); vol.rotation.set(0, -Math.PI / 4, .08); g.add(vol);
  const pil = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.9, 16, 10), conc); pil.position.set(-44, 8, 40); g.add(pil);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 1.2, 2.5, 10), conc); cap.position.set(-44, 15, 40); g.add(cap);

  // 5. escultura negra del jardín (formas abstractas)
  const esc = new THREE.Group(), negroM = api.concrete(0x161616, { roughness: .5, metalness: .3 });
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5 + i, 1.6), negroM); b.position.set(i * 1.8, (5 + i) / 2, (i % 2) * 1.2); b.rotation.set(.15 * (i - 1.5), i * .5, .1); esc.add(b); }
  esc.position.set(-52, 4, 18); g.add(esc);

  g.position.set(c.x, y0, c.z);
  return api.sombras(g);
}
