// fx/ruta21k.js — calzada de los dos tramos del 21K que el 42K no pisa (data/ruta-21k.js, compuestos en landmarks/api.js):
// el enlace del retorno entre las dos calzadas de Los Ilustres (28 m, frente al IPSFA) y la Av. Las Acacias hacia el norte desde la
// Casanova hasta la Gran Avenida, al pie de La Previsora (161 m, 5 canales en un sentido). Se dibujan siempre, con 42K o 21K: son
// parte de la calle. El separador abierto y las bocacalles de las esquinas los pone fx/calzada.js (ctx.aberturas); los árboles, el
// público y el mobiliario no se siembran encima porque los conectores marcan la rejilla de ocupación (ctx.calzadaLibre).
// Cota: la de la ruta compuesta (recta entre las cotas de sus extremos, subida al relieve donde éste queda por encima), con faldón
// hasta el terreno para que no se vea el canto flotando.
import * as THREE from 'three';

export const meta = { id: 'ruta21k' };

export function install(ctx) {
  const { scene, Y, hT } = ctx, CON = ctx.conectores || []; if (!CON.length) return;
  const asf = new THREE.MeshStandardMaterial({ color: 0x5a5d61, roughness: .94, metalness: 0, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -10, envMapIntensity: .25 });   // como la losa del 42K: por encima de los mosaicos satelitales
  const falda = new THREE.MeshStandardMaterial({ color: 0x6d6a64, roughness: 1, metalness: 0 });
  const blanco = new THREE.MeshStandardMaterial({ color: 0xe8e6de, roughness: .7, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -12 });
  const amarillo = new THREE.MeshStandardMaterial({ color: 0xe0b72a, roughness: .7, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -12 });
  const brocal = new THREE.MeshStandardMaterial({ color: 0xbdb8ad, roughness: .9 });
  const acera = new THREE.MeshStandardMaterial({ color: 0xa9a59b, roughness: .95, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 });
  for (const c of CON) {
    // puntos del eje, prolongados 6 m por cada extremo para tapar la costura con la calzada del 42K
    let L = 0; for (let i = 1; i < c.length; i++) L += Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]);
    const corto = L < 80, hw = corto ? 4.6 : 8, pts = c.map(p => ({ x: p[0], z: p[1], y: Y(p[2]) }));
    const ext = (a, b) => { const dx = a.x - b.x, dz = a.z - b.z, l = Math.hypot(dx, dz) || 1; return { x: a.x + dx / l * 6, z: a.z + dz / l * 6, y: a.y }; };
    pts.unshift(ext(pts[0], pts[1])); pts.push(ext(pts[pts.length - 1], pts[pts.length - 2]));
    // densificar cada 2 m
    const P = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 2)); for (let k = 0; k < n; k++) { const t = k / n; P.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, y: a.y + (b.y - a.y) * t }); } }
    P.push(pts[pts.length - 1]);
    P.forEach((p, i) => { const a = P[Math.max(0, i - 2)], b = P[Math.min(P.length - 1, i + 2)], dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1; p.tx = dx / l; p.tz = dz / l; p.lx = p.tz; p.lz = -p.tx; });
    let acc = 0; P.forEach((p, i) => { if (i) acc += Math.hypot(p.x - P[i - 1].x, p.z - P[i - 1].z); p.d = acc; });
    const cinta = (d0, d1, dy, mat, filtro) => { if (d0 > d1) { const t = d0; d0 = d1; d1 = t; } const pos = [], idx = []; let prev = -1;   // siempre d0 < d1: al revés la cara queda de espaldas y no se dibuja (así se perdió el asfalto)
      P.forEach((p, i) => { if (filtro && !filtro(p)) { prev = -1; return; } const k = pos.length / 3; pos.push(p.x + p.lx * d0, p.y + dy, p.z + p.lz * d0, p.x + p.lx * d1, p.y + dy, p.z + p.lz * d1); if (prev >= 0) idx.push(prev, k, prev + 1, prev + 1, k, k + 1); prev = k; });
      if (!idx.length) return null; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.userData.mem = 'ruta21k'; scene.add(m); return m; };
    // asfalto (un poco por debajo de la losa del 42K: donde se solapan, manda la del 42K) y faldones hasta el terreno a cada lado
    cinta(hw, -hw, -.025, asf);
    for (const sd of [1, -1]) { const pos = [], idx = []; P.forEach((p, i) => { const x = p.x + p.lx * hw * sd, z = p.z + p.lz * hw * sd, g = Math.min(p.y - .03, Y(hT(x, z)) - .6), k = pos.length / 3; pos.push(x, p.y - .03, z, x, g, z); if (i) idx.push(k - 2, k, k - 1, k - 1, k, k + 1); });
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setIndex(idx); ge.computeVertexNormals(); const m = new THREE.Mesh(ge, falda); m.material.side = THREE.DoubleSide; scene.add(m); }
    const lejos = p => p.d > 10 && p.d < acc - 10;   // la pintura y el brocal no entran en el cruce con la calzada del 42K
    if (corto) { cinta(-.1, .1, -.01, amarillo, lejos); continue; }   // enlace del retorno: solo la raya central
    // Av. Las Acacias: 5 canales (rayas discontinuas), bordes amarillos y brocal bajo a cada lado
    for (const d of [-4.8, -1.6, 1.6, 4.8]) cinta(d - .07, d + .07, -.01, blanco, p => lejos(p) && (p.d % 9) < 4.5);
    for (const d of [hw - .35, -hw + .35]) cinta(d - .08, d + .08, -.01, amarillo, lejos);
    for (const sd of [1, -1]) { cinta(sd * hw, sd * (hw + .22), .14, brocal, lejos); cinta(sd * (hw + .22), sd * (hw + 3.4), .14, acera, lejos); }   // brocal y acera de 3,2 m a cada lado
  }
}
