// Monumento a los Símbolos Patrios (Ernesto Maragall, 1957), Plaza Los Símbolos, km 15,3 (a la izquierda).
// Pedestal alto de travertino en dos cuerpos con la dedicatoria en letras doradas y una tira de laurel de bronce,
// grupo de bronce verdoso arriba (mujer con la corona de laurel en alto, hombre arrodillado con la antorcha y
// hombre de pie con el escudo), tres mascarones que escupen agua a un estanque turquesa, y palmas washingtonia.
export const meta = {
  id: 'los_simbolos',
  nombre: 'Monumento a los Símbolos',
  quita: [],
};

export function build(THREE, api) {
  const g = new THREE.Group(), c0 = api.xz(10.483202757, -66.895463), c = { x: c0.x - 6, z: c0.z }, y0 = api.ground(c.x, c.z);
  const trav = api.concrete(0xe3dccb, { roughness: .8 }), bronce = new THREE.MeshStandardMaterial({ color: 0x4c6b5a, metalness: .6, roughness: .45 }), borde = api.concrete(0xd9d3c4);
  const agua = new THREE.MeshStandardMaterial({ color: 0x5cc7c4, roughness: .05, metalness: .25 });
  const add = (geo, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const FR = -Math.PI / 2; // el frente mira al oeste (hacia la ruta)

  // estanque octogonal turquesa
  add(new THREE.CylinderGeometry(9.5, 9.5, .9, 8), borde, 0, .45, 0, Math.PI / 8);
  add(new THREE.CylinderGeometry(8.9, 8.9, .95, 8), agua, 0, .5, 0, Math.PI / 8);
  // pedestal: dos cuerpos de travertino adosados, el delantero más bajo, con la dedicatoria
  const ded = api.canvasTex(256, 512, (k, w, h) => { k.fillStyle = '#e3dccb'; k.fillRect(0, 0, w, h); k.strokeStyle = 'rgba(140,125,100,.25)'; for (let j = 0; j < 30; j++) { k.beginPath(); k.moveTo(0, j * 17); k.lineTo(w, j * 17 + 4); k.stroke(); }
    k.fillStyle = '#7a5a1c'; k.font = 'bold 19px Georgia'; k.textAlign = 'center'; ['HOMENAJE', 'DE LOS', 'VENEZOLANOS', 'A LA', 'BANDERA', 'AL', 'ESCUDO', 'Y AL', 'HIMNO', 'NACIONALES'].forEach((t, i) => k.fillText(t, w * .4, 120 + i * 24)); k.fillStyle = '#3f5c4c'; k.fillRect(w * .78, 90, 16, h - 90); });
  const dedM = new THREE.MeshStandardMaterial({ map: ded, roughness: .8 });
  const p1 = add(new THREE.BoxGeometry(2.6, 11, 3.4), [trav, trav, trav, trav, trav, trav], .9, 5.5 + .9, 0); // cuerpo trasero (más alto)
  const p2 = add(new THREE.BoxGeometry(2.6, 10, 3.2), [trav, dedM, trav, trav, trav, trav], -1.3, 5 + .9, -.2); // delantero, con la dedicatoria al oeste
  p2.geometry.scale(1, 1, 1);
  // tres mascarones con chorros hacia el estanque
  const chM = new THREE.MeshStandardMaterial({ color: 0xeaf6ff, transparent: true, opacity: .65, roughness: .2 }), chorros = [];
  for (let i = 0; i < 3; i++) { const z = -1 + i * 1; add(new THREE.SphereGeometry(.28, 8, 6), bronce, -2.65, 2.4, z); const ch = new THREE.Mesh(new THREE.CylinderGeometry(.05, .14, 1.9, 6), chM); ch.position.set(-3.05, 1.5, z); ch.rotation.z = -.45; g.add(ch); chorros.push(ch); }
  api.onFrame(st => chorros.forEach((m, i) => { m.scale.x = m.scale.z = 1 + .15 * Math.sin(st.t * 6 + i); }));

  // grupo escultórico de bronce (~6 m) sobre el pedestal
  const G = new THREE.Group(); G.position.set(0, 10.9 + .9, 0); G.scale.set(1.7, 1.45, 1.7); g.add(G);
  const seg = (r1, r2, L, x, y, z, rx = 0, rz = 0) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, L, 8), bronce); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); G.add(m); return m; };
  const esf = (r, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), bronce); m.position.set(x, y, z); m.scale.set(sx, sy, sz); G.add(m); return m; };
  // mujer al centro: túnica, torso, cabeza, brazos en alto sosteniendo la corona de laurel y el asta
  seg(.55, .95, 2.6, 0, 1.3, 0); seg(.38, .5, 1.3, 0, 3.2, 0); esf(.3, 0, 4.15, 0);
  seg(.1, .12, 1.6, -.15, 4.7, .25, .3, .1); seg(.1, .12, 1.6, -.1, 4.7, -.3, -.2, .15);
  const corona = new THREE.Mesh(new THREE.TorusGeometry(.42, .08, 6, 14), bronce); corona.position.set(-.25, 5.75, .3); corona.rotation.y = Math.PI / 2; G.add(corona);
  seg(.04, .04, 5.5, -.25, 3.2, -.35, 0, .12); // asta de la bandera
  // hombre arrodillado a un lado con la antorcha
  seg(.35, .4, 1.1, -.4, .9, 1.25, 0, -.4); seg(.3, .36, 1.2, -.2, 1.9, 1.15, 0, -.2); esf(.24, -.1, 2.7, 1.1);
  seg(.08, .1, 1.5, -.35, 3.1, 1.1, 0, .35); seg(.05, .05, .8, -.6, 3.9, 1.1); esf(.16, -.6, 4.35, 1.1, 1, 1.6, 1);
  // hombre de pie al otro lado con el escudo
  seg(.13, .15, 1.6, .2, .8, -1.2); seg(.13, .15, 1.6, .5, .8, -1.0); seg(.36, .3, 1.4, .3, 2.3, -1.1); esf(.24, .3, 3.25, -1.1);
  const escudo = new THREE.Mesh(new THREE.BoxGeometry(.18, 1.6, 1.1), bronce); escudo.position.set(.1, 3.7, -1.5); escudo.rotation.x = .15; G.add(escudo);

  // palmas washingtonia alrededor
  const tron = new THREE.CylinderGeometry(.26, .36, 1, 7), fr = new THREE.ConeGeometry(.6, 3.8, 3, 1); fr.translate(0, 1.9, 0);
  const tM = api.concrete(0x8a7a63), fM = new THREE.MeshStandardMaterial({ color: 0x4b7438, roughness: .9, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + .3, r = 14 + (i % 2) * 4, x = Math.cos(a) * r, z = Math.sin(a) * r * 1.4, h = 12 + (i % 3) * 2;
    const t = new THREE.Mesh(tron, tM); t.scale.y = h; t.position.set(x, h / 2, z); g.add(t);
    for (let k = 0; k < 12; k++) { const f = new THREE.Mesh(fr, fM); f.position.set(x, h, z); f.rotation.set(0, k / 12 * Math.PI * 2, 1.2 + (k % 3) * .2, 'YXZ'); f.scale.set(1, 1, .18); g.add(f); }
    const falda = new THREE.Mesh(new THREE.CylinderGeometry(.6, .45, 1.8, 6), api.concrete(0x6f5a3e)); falda.position.set(x, h - .7, z); g.add(falda); }
  // reflectores (noche)
  const luz = api.glow(0xfff0c8, { dia: .05, noche: 2.4 });
  for (const [x, z] of [[-6, 0], [5, 4], [5, -4]]) add(new THREE.BoxGeometry(.6, .35, .6), luz, x, 1.1, z);

  g.position.set(c.x, y0 - .1, c.z);
  return api.sombras(g);
}
