// Monumento a La India (Plaza La India, El Paraíso). Columna alta de piedra gris con una corona de palmas de bronce
// cerca de la punta y, arriba, la figura de bronce de la india de pie con el brazo en alto; al pie, un pedestal de rocas
// con un grupo de figuras de bronce, en una redoma con grama y brocal frente a C.C. Galerías El Paraíso
// (video: s 206–208, la columna se recorta contra el tambor oscuro de Galerías; foto 24_monumento_la_india.jpg).
// Posición: el nodo OSM 2187673065 (artwork «La India», 10.475313,-66.945952) cae justo sobre la línea de la ruta del juego,
// porque la ruta recorta la redoma por dentro. En el video el monumento queda a la IZQUIERDA del carro al llegar a la redoma
// (el carro la rodea por el sur antes de subir a Av. Páez), así que se pone a la izquierda de la ruta en km 8,258, a 17 m del eje
// (≈10 m del nodo), fuera del asfalto (la corrección de vía deja la redoma en 18 m de ancho sin separador).
export const meta = {
  id: 'la_india',
  nombre: 'Monumento a La India',
  quita: [[10.475313, -66.945952, 8], [10.475644, -66.945967, 6]],
};

export function build(THREE, api) {
  const g = new THREE.Group();
  // api.ground ya devuelve la Y del mundo dibujado (exageración vertical y relieve incluidos)
  const suelo = (x, z) => api.ground(x, z);
  const r = api.routeAt(8.258), D0 = 17, cx = r.x + r.lx * D0, cz = r.z + r.lz * D0, y0 = suelo(cx, cz);
  const bronce = new THREE.MeshStandardMaterial({ color: 0x3b332b, metalness: .65, roughness: .5 });
  const piedra = api.concrete(0x847e73), roca = api.concrete(0x8e877b, { flatShading: true }), rocaC = api.concrete(0xb3aa98, { flatShading: true });
  const cesped = api.concrete(0x5f7d3c, { roughness: 1 }), brocalA = api.concrete(0xe2b62a), brocalB = api.concrete(0xd9d5cb);
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, p = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); p.add(m); return m; };

  // redoma: brocal amarillo y blanco, grama, matas bajas
  add(new THREE.CylinderGeometry(7.4, 7.6, 1.6, 36), brocalB, 0, -.45, 0);
  add(new THREE.CylinderGeometry(7.45, 7.45, .22, 36, 1, true), brocalA, 0, .3, 0);
  add(new THREE.CylinderGeometry(7.2, 7.2, .5, 36), cesped, 0, .2, 0);
  const mata = new THREE.SphereGeometry(.6, 6, 4), mataM = api.concrete(0x3f6b2c, { roughness: 1 });
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, m = add(mata, mataM, Math.cos(a) * 6.2, .55, Math.sin(a) * 6.2); m.scale.set(1.2, .7, 1.2); }

  // pedestal de rocas apiladas (claro arriba, oscuro abajo)
  const rk = new THREE.DodecahedronGeometry(1, 0); let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + rnd() * .3, d = 2.6 + rnd() * 1.1, m = add(rk, i % 3 ? roca : rocaC, Math.cos(a) * d, .9 + rnd() * .5, Math.sin(a) * d, rnd() * 3, rnd() * 3, 0); m.scale.set(1.3 + rnd() * .6, 1 + rnd() * .5, 1.2 + rnd() * .6); }
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + rnd(), d = 1.5 + rnd() * .6, m = add(rk, i % 2 ? rocaC : roca, Math.cos(a) * d, 2.5 + rnd() * .6, Math.sin(a) * d, rnd() * 3, rnd() * 3, 0); m.scale.set(1.2 + rnd() * .4, 1 + rnd() * .5, 1.1 + rnd() * .4); }
  add(new THREE.CylinderGeometry(1.6, 2.4, 2.4, 7), rocaC, 0, 3.4, 0, 0, .3, 0);
  // grupo de bronce al pie: figuras agazapadas sobre las rocas, mirando hacia afuera
  const fig = (a, d, y, sc) => { const F = new THREE.Group(); F.position.set(Math.cos(a) * d, y, Math.sin(a) * d); F.rotation.y = -a + Math.PI / 2; F.scale.setScalar(sc); g.add(F);
    add(new THREE.SphereGeometry(.55, 8, 6), bronce, 0, .6, 0, 0, 0, 0, F).scale.set(1, 1.3, .8);
    add(new THREE.SphereGeometry(.3, 8, 6), bronce, 0, 1.45, .12, 0, 0, 0, F);
    add(new THREE.CylinderGeometry(.12, .14, .9, 6), bronce, .45, .55, .25, .9, 0, .3, F); add(new THREE.CylinderGeometry(.12, .14, .9, 6), bronce, -.45, .55, .25, .9, 0, -.3, F); };
  fig(0.4, 2.2, 3.1, 1.1); fig(2.5, 2.1, 2.9, 1); fig(4.4, 2.3, 3.0, 1.05);
  add(new THREE.SphereGeometry(.7, 8, 6), bronce, 0, 4.9, 0).scale.set(1.2, .8, 1.2);

  // columna de piedra gris (fuste con anillos) que sube hasta la corona de palmas
  add(new THREE.CylinderGeometry(.95, 1.15, 1.2, 14), piedra, 0, 5.2, 0);
  add(new THREE.CylinderGeometry(.62, .78, 11.5, 14), piedra, 0, 11.4, 0);
  for (const y of [6.2, 9.5, 13.2]) add(new THREE.CylinderGeometry(.82, .82, .35, 14), piedra, 0, y, 0);
  add(new THREE.CylinderGeometry(.5, .62, 2.6, 12), bronce, 0, 18.4, 0);
  // corona de palmas de bronce: hojas largas que se abren y cuelgan
  const hoja = new THREE.PlaneGeometry(1.4, 4.6, 1, 5); hoja.translate(0, 2.1, 0);
  { const p = hoja.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, -y * y * .09); } hoja.computeVertexNormals(); }
  const hojaM = new THREE.MeshStandardMaterial({ color: 0x3a3a2a, metalness: .55, roughness: .55, side: THREE.DoubleSide });
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, h = new THREE.Mesh(hoja, hojaM); h.position.set(0, 17.1, 0); h.rotation.set(0, a, .95 + (i % 2) * .35, 'YXZ'); g.add(h); }
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + .2, h = new THREE.Mesh(hoja, hojaM); h.position.set(0, 17.5, 0); h.rotation.set(0, a, .5, 'YXZ'); h.scale.set(.8, .75, 1); g.add(h); }
  // capitel y figura de la india (≈2,9 m) con el brazo derecho en alto y el arco en la izquierda
  add(new THREE.CylinderGeometry(.85, .5, .55, 12), bronce, 0, 19.95, 0);
  const F = new THREE.Group(); F.position.set(0, 20.2, 0); F.scale.setScalar(1.75); g.add(F);
  const seg = (r1, r2, L, x, y, z, rx = 0, rz = 0) => add(new THREE.CylinderGeometry(r1, r2, L, 8), bronce, x, y, z, rx, 0, rz, F);
  seg(.1, .13, 1.0, -.12, .5, 0, 0, .05); seg(.1, .13, 1.0, .12, .5, .04, -.1, -.05);
  seg(.19, .22, .45, 0, 1.18, 0); seg(.24, .18, .62, 0, 1.6, 0);
  add(new THREE.SphereGeometry(.14, 10, 8), bronce, 0, 2.05, 0, 0, 0, 0, F);
  add(new THREE.SphereGeometry(.16, 8, 6), bronce, 0, 2.0, -.06, 0, 0, 0, F).scale.set(1, 1.5, .8);
  seg(.055, .065, .85, .24, 2.25, 0, 0, -.18);   // brazo alzado
  seg(.055, .065, .8, -.3, 1.5, .05, 0, .3);     // brazo bajo
  seg(.015, .015, 1.4, .33, 2.95, 0, 0, -.18);   // flecha alzada
  { const arco = new THREE.TorusGeometry(.55, .02, 4, 12, Math.PI); const m = add(arco, bronce, -.45, 1.25, .1, 0, Math.PI / 2, Math.PI / 2, F); m.scale.set(1, 1.3, 1); }
  // la figura y el grupo miran hacia la Av. O'Higgins (por donde llega la carrera)
  const v = api.routeAt(8.1); F.rotation.y = Math.atan2(v.x - cx, v.z - cz);

  // un chaguaramo en la redoma (video s 207: palma alta junto a la columna)
  const tron = new THREE.CylinderGeometry(.2, .28, 1, 8), tronM = api.concrete(0xb9b2a4), fr = new THREE.ConeGeometry(.5, 3.4, 4, 1); fr.translate(0, 1.7, 0);
  const frM = new THREE.MeshStandardMaterial({ color: 0x3f6a32, roughness: .9, side: THREE.DoubleSide });
  const palma = (x, z, h) => { const t = add(tron, tronM, x, h / 2, z); t.scale.y = h; for (let i = 0; i < 10; i++) { const f = new THREE.Mesh(fr, frM); f.position.set(x, h, z); f.rotation.set(0, i / 10 * Math.PI * 2, 1.2 + (i % 3) * .2, 'YXZ'); f.scale.set(1, 1, .15); g.add(f); } };
  palma(4.6, -3.2, 11);
  // reflectores (de noche)
  const luz = api.glow(0xffe6b0, { dia: .05, noche: 2.5 });
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + Math.PI / 4; add(new THREE.BoxGeometry(.5, .3, .5), luz, Math.cos(a) * 5, .6, Math.sin(a) * 5); }

  g.position.set(cx, y0 - .05, cz);
  return api.sombras(g);
}
