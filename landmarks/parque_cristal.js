// Parque Cristal (Los Palos Grandes, 1980, Jimmy Alcock): cubo de muro cortina azul plateado de ~80 m con el gran hueco
// cuadrado en el centro de la fachada sur (hacia la Av. Francisco de Miranda), que deja ver vidrio azul oscuro.
// Debajo, planta baja retranqueada sobre pilotes y la escalinata hacia la avenida; detrás, el cuerpo semicircular bajo.
// Planta y posición medidas sobre la foto satelital (azotea de 66 × 47 m).
export const meta = {
  id: 'parque_cristal',
  nombre: 'Parque Cristal',
  quita: [[10.497567, -66.843173, 38], [10.497780, -66.843137, 30]],
};

export function build(THREE, api) {
  const C = { x: 4296.5, z: -1230.5 }, y0 = api.ground(C.x, C.z + 20) - .3;
  const g = new THREE.Group(); g.position.set(C.x, y0, C.z);
  const W = 66, D = 47, H = 80, P = 9;           // ancho, fondo, alto, altura de los pilotes
  const VW = 26, VD = 20, V0 = 30, V1 = 73;      // el hueco: ancho, profundidad, de 30 a 73 m

  const fac = (o, mw, mh) => { const m = api.facade(o); m.userData.mw = mw; m.userData.mh = mh; return m; };
  const skin = fac({ pared: '#a9bccd', vidrio: '#5f84ad', pisos: 6, vanos: 6, marco: .1, encendidas: .14, seed: 4, roughness: .18, metalness: .65, env: 1.25 }, 12, 24);
  const deep = fac({ pared: '#1d3557', vidrio: '#16325f', pisos: 6, vanos: 6, marco: .08, encendidas: .25, seed: 8, roughness: .2, metalness: .5, env: .9 }, 12, 24);
  const roof = api.concrete(0x8f8c84), concrete = api.concrete(0xbdb8ac);
  // caja con materiales por cara [+X, −X, +Y, −Y, +Z, −Z] y UV en metros
  const box = (w, h, d, x, y, z, mats) => {
    const geo = new THREE.BoxGeometry(w, h, d), uv = geo.attributes.uv, sz = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) { const m = mats[f]; if (!m.userData.mw) continue; for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * sz[f][0] / m.userData.mw, uv.getY(i) * sz[f][1] / m.userData.mh); } }
    const mesh = new THREE.Mesh(geo, mats); mesh.position.set(x, y, z); g.add(mesh); return mesh;
  };
  const S = skin, R = roof, Dp = deep;
  const zf = D / 2;                                        // cara sur (+Z)
  box(W, V0 - P, D, 0, (P + V0) / 2, 0, [S, S, R, R, S, S]);                                   // franja baja del cubo
  const sideW = (W - VW) / 2;
  box(sideW, V1 - V0, D, -(VW / 2 + sideW / 2), (V0 + V1) / 2, 0, [Dp, S, R, R, S, S]);        // lado oeste del hueco
  box(sideW, V1 - V0, D, (VW / 2 + sideW / 2), (V0 + V1) / 2, 0, [S, Dp, R, R, S, S]);         // lado este del hueco
  box(VW, V1 - V0, D - VD, 0, (V0 + V1) / 2, -VD / 2, [S, S, R, R, Dp, S]);                    // fondo del hueco
  box(W, H - V1, D, 0, (V1 + H) / 2, 0, [S, S, R, Dp, S, S]);                                  // dintel superior
  // piso del hueco (terraza con algo de verde)
  const terr = new THREE.Mesh(new THREE.PlaneGeometry(VW - .4, VD - .4), api.concrete(0x6f8a5a)); terr.rotation.x = -Math.PI / 2; terr.position.set(0, V0 + .05, zf - VD / 2); g.add(terr);
  // aristas plateadas del cubo (resaltan el volumen)
  const edgeM = new THREE.MeshStandardMaterial({ color: 0xd9e2ea, metalness: .8, roughness: .25 });
  const edges = new THREE.InstancedMesh(new THREE.BoxGeometry(.9, 1, .9), edgeM, 4), M = new THREE.Matrix4();
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz], i) => { M.compose(new THREE.Vector3(sx * W / 2, (P + H) / 2, sz * D / 2), new THREE.Quaternion(), new THREE.Vector3(1, H - P, 1)); edges.setMatrixAt(i, M); }); g.add(edges);
  // planta baja retranqueada y pilotes cilíndricos
  const lobby = fac({ pared: '#7d8a96', vidrio: '#2c3c4d', pisos: 2, vanos: 8, marco: .12, encendidas: .6 }, 16, 9);
  box(W - 12, P, D - 10, 0, P / 2, 0, [lobby, lobby, R, R, lobby, lobby]);
  const cols = new THREE.InstancedMesh(new THREE.CylinderGeometry(.9, .9, P, 12), concrete, 12); let k = 0;
  for (let i = 0; i < 6; i++) for (const sz of [1, -1]) { M.makeTranslation(-W / 2 + 5 + i * (W - 10) / 5, P / 2, sz * (D / 2 - 2)); cols.setMatrixAt(k++, M); } g.add(cols);
  // escalinata hacia la avenida (sur)
  for (let i = 0; i < 6; i++) { const st = new THREE.Mesh(new THREE.BoxGeometry(W + 4, .35, 2.2), concrete); st.position.set(0, -.15 - i * .35 + 2.1, zf + 1.1 + i * 2.2); g.add(st); }
  const plaza = new THREE.Mesh(new THREE.BoxGeometry(W + 4, 2.2, 4), concrete); plaza.position.set(0, 1.1, zf - 1); g.add(plaza);
  // cuerpo semicircular bajo al norte (centro comercial, azotea verde)
  const semi = new THREE.Mesh(new THREE.CylinderGeometry(29, 29, 20, 40, 1, false, Math.PI / 2, Math.PI), [fac({ pared: '#8ea3b8', vidrio: '#47648a', pisos: 5, vanos: 10, marco: .1, roughness: .2, metalness: .6, env: 1.1 }, 1, 1), api.concrete(0x6f8f55), api.concrete(0x6f8f55)]);
  semi.material[0].map.repeat.set(5, 1); semi.material[0].emissiveMap.repeat.set(5, 1);
  semi.position.set(4, 10, -D / 2); g.add(semi);
  return api.sombras(g);
}
