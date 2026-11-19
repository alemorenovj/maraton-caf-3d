// Hito de ejemplo (plantilla): obelisco de Plaza Francia, Altamira.
export const meta = { id: '_demo', nombre: 'Obelisco de Plaza Francia (plantilla)', quita: [] };
export function build(THREE, api) {
  const g = new THREE.Group(), p = api.xz(10.49578, -66.84891), y = api.ground(p.x, p.z);
  const fuste = new THREE.Mesh(new THREE.CylinderGeometry(.5, 2.1, 33, 4), api.concrete(0xd9c9a3)); fuste.position.y = 16.5 + 2; fuste.rotation.y = Math.PI / 4;
  const base = new THREE.Mesh(new THREE.BoxGeometry(7, 2, 7), api.concrete(0xc9b995)); base.position.y = 1;
  const torre = new THREE.Mesh(new THREE.BoxGeometry(30, 80, 24), api.facade({ pared: '#b9b2a2', vidrio: '#3f566e', pisos: 25, vanos: 8 })); torre.position.set(60, 40, -30);
  g.add(fuste, base, torre); g.position.set(p.x, y, p.z); return api.sombras(g);
}
