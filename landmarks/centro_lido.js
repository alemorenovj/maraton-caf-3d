// Centro Lido, El Rosal (Av. Francisco de Miranda): podio comercial de 7 niveles sobre toda la manzana (huella OSM)
// y dos torres de muro cortina azul (90 y 78 m); la más alta con el remate escalonado que se ve desde la avenida.
// Se ve dos veces: en la ida (km 23,2, Av. Libertador al sur) y en la vuelta (km 38,9, Francisco de Miranda al norte).
export const meta = {
  id: 'centro_lido',
  nombre: 'Centro Lido',
  quita: [[10.491248, -66.862563, 62]],
};

export function build(THREE, api) {
  const root = new THREE.Group();
  // huella OSM del Centro Comercial Lido, en metros del mundo
  const P = [[2255.3, -587.9], [2248.5, -489.1], [2238.4, -487.6], [2115.9, -464.1], [2108.5, -535.1], [2110.0, -537.5], [2114.2, -543.4], [2121.0, -555.3]];
  const cx = P.reduce((s, p) => s + p[0], 0) / P.length, cz = P.reduce((s, p) => s + p[1], 0) / P.length;
  const y0 = Math.min(...P.map(([x, z]) => api.ground(x, z))) - .3;
  const fac = (o, mw, mh) => { const m = api.facade(o); m.userData.mw = mw; m.userData.mh = mh; return m; };

  // --- podio: extrusión de la huella, 24 m, bandas de concreto claro y vidrio ---
  const podM = fac({ pared: '#a99f8c', vidrio: '#2a3a4a', pisos: 6, vanos: 8, bandas: true, encendidas: .3, seed: 12 }, 24, 24);
  podM.map.repeat.set(1 / 24, 1 / 24); podM.emissiveMap.repeat.set(1 / 24, 1 / 24);
  const shape = new THREE.Shape(P.map(([x, z]) => new THREE.Vector2(x - cx, -(z - cz))));
  const pod = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 24, bevelEnabled: false }), [api.concrete(0x6f7a5a), podM]);
  pod.rotation.x = -Math.PI / 2; pod.position.set(cx, y0, cz); root.add(pod);

  // --- torres de vidrio azul ---
  const glass = fac({ pared: '#31527a', vidrio: '#1f3f6b', pisos: 8, vanos: 8, marco: .1, encendidas: .2, seed: 6, roughness: .14, metalness: .7, env: 1.3 }, 12, 30);
  const box = (w, h, d, x, y, z, g) => { const geo = new THREE.BoxGeometry(w, h, d), uv = geo.attributes.uv, sz = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * sz[f][0] / 12, uv.getY(i) * sz[f][1] / 30); }
    const top = api.concrete(0x5b6066), m = new THREE.Mesh(geo, [glass, glass, top, top, glass, glass]); m.position.set(x, y, z); g.add(m); return m; };
  const ROT = .19; // retícula de la manzana (el borde largo va 11° al norte del este)
  const tower = (x, z, w, d, h, steps) => {
    const g = new THREE.Group(); g.position.set(x, y0, z); g.rotation.y = ROT; root.add(g);
    box(w, h - 24, d, 0, 24 + (h - 24) / 2, 0, g);
    // remate escalonado: cada escalón recorta el lado este
    let ww = w, yy = h; for (let i = 0; i < steps; i++) { const nw = ww - w * .2, sh = 6; box(nw, sh, d * (1 - .08 * (i + 1)), -(w - nw) / 2, yy + sh / 2, 0, g); ww = nw; yy += sh; }
    // aristas verticales claras (montantes de esquina)
    const fin = new THREE.InstancedMesh(new THREE.BoxGeometry(.6, 1, .6), new THREE.MeshStandardMaterial({ color: 0xc9d6e2, metalness: .8, roughness: .3 }), 4), M = new THREE.Matrix4();
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz], i) => { M.compose(new THREE.Vector3(sx * w / 2, 24 + (h - 24) / 2, sz * d / 2), new THREE.Quaternion(), new THREE.Vector3(1, h - 24, 1)); fin.setMatrixAt(i, M); }); g.add(fin);
    return g;
  };
  tower(2198, -553, 34, 22, 72, 3);   // torre este, la alta: 72 + 18 de escalones = 90 m
  tower(2146, -541, 30, 22, 74, 1);   // torre oeste: 80 m
  return api.sombras(root);
}
