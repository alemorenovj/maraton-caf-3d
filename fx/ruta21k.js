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
  // Retorno en U del 21K: losa del mismo concreto claro que pisa (Los Ilustres), por debajo de la del 42K donde se solapan; conos en arco por
  // el borde de adentro con cinta roja y blanca, un cartel «RETORNO 21K» en el centro de la U de cara a los que llegan y un voluntario.
  const losa = new THREE.MeshStandardMaterial({ color: 0xb4b3ad, roughness: .9, metalness: 0, polygonOffset: true, polygonOffsetFactor: -4.5, polygonOffsetUnits: -9, envMapIntensity: .25 });
  const conoTex = (() => { const c = document.createElement('canvas'); c.width = 32; c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#ff6a10'; g.fillRect(0, 0, 32, 64); g.fillStyle = '#f4f4f4'; g.fillRect(0, 20, 32, 9); g.fillRect(0, 36, 32, 6); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const conoMat = new THREE.MeshStandardMaterial({ map: conoTex, roughness: .6 }), baseMat = new THREE.MeshStandardMaterial({ color: 0xff5a00, roughness: .7 });
  const cintaMat = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 8; const g = c.getContext('2d'); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f4f4f4' : '#e2231a'; g.fillRect(i * 8, 0, 8, 8); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide, roughness: .7 }); })();
  function retorno(P, cinta, hw, acc) {
    cinta(hw + .4, -hw - .4, -.02, losa);
    // centro de la U: ajuste de círculo (Kåsa) a la parte central del arco; de ahí sale el lado de adentro
    const M = P.filter(p => p.d > 8 && p.d < acc - 8); let sx = 0, sz = 0, sxx = 0, szz = 0, sxz = 0, sxr = 0, szr = 0; const n = M.length, x0 = M[0].x, z0 = M[0].z;
    for (const p of M) { const x = p.x - x0, z = p.z - z0, r = x * x + z * z; sx += x; sz += z; sxx += x * x; szz += z * z; sxz += x * z; sxr += x * r; szr += z * r; }
    const a11 = 2 * (sxx - sx * sx / n), a12 = 2 * (sxz - sx * sz / n), a22 = 2 * (szz - sz * sz / n), b1 = sxr - sx * (sxx + szz) / n, b2 = szr - sz * (sxx + szz) / n, det = a11 * a22 - a12 * a12;
    const cx = x0 + (b1 * a22 - b2 * a12) / det, cz = z0 + (a11 * b2 - a12 * b1) / det, cy = M.reduce((s, p) => s + p.y, 0) / n;
    const lado = p => Math.sign((cx - p.x) * p.lx + (cz - p.z) * p.lz) || 1;   // +1 si el centro queda a la izquierda del corredor
    // conos cada 1,6 m por el borde de adentro, y cinta entre ellos a 0,75 m
    const cg = new THREE.ConeGeometry(.16, .7, 8, 1, true).translate(0, .37, 0), bg = new THREE.BoxGeometry(.4, .05, .4).translate(0, .025, 0), cs = [];
    for (const p of M) { if (cs.length && Math.hypot(p.x - cs[cs.length - 1].x, p.z - cs[cs.length - 1].z) < 1.6) continue; const k = lado(p) * (hw - .2); cs.push({ x: p.x + p.lx * k, z: p.z + p.lz * k, y: p.y }); }
    const im = (geo, mat) => { const m = new THREE.InstancedMesh(geo, mat, cs.length), o = new THREE.Object3D(); cs.forEach((c, i) => { o.position.set(c.x, c.y, c.z); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.castShadow = true; scene.add(m); };
    im(cg, conoMat); im(bg, baseMat);
    { const pos = [], uv = [], idx = []; let u = 0; cs.forEach((c, i) => { if (i) u += Math.hypot(c.x - cs[i - 1].x, c.z - cs[i - 1].z) / 1.2; pos.push(c.x, c.y + .62, c.z, c.x, c.y + .72, c.z); uv.push(u, 0, u, 1); if (i) { const k = i * 2; idx.push(k - 2, k, k - 1, k - 1, k, k + 1); } });
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); scene.add(new THREE.Mesh(g, cintaMat)); }
    // cartel RETORNO 21K en el centro de la U, de cara a los que llegan (perpendicular a la entrada), y un voluntario de chaleco a su lado
    const e0 = P[0], cart = new THREE.Group(), tex = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#47AB48'; g.fillRect(0, 0, 512, 256); g.fillStyle = '#fff'; g.font = '900 92px Arial'; g.textAlign = 'center'; g.fillText('RETORNO', 256, 110); g.font = 'italic 900 84px Arial'; g.fillText('21K', 256, 205);
      g.strokeStyle = '#fff'; g.lineWidth = 10; g.beginPath(); g.arc(440, 170, 34, Math.PI * .1, Math.PI * 1.3); g.stroke(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, .06), [0, 1, 2, 3].map(() => new THREE.MeshStandardMaterial({ color: 0x2f7f33 })).concat([new THREE.MeshStandardMaterial({ map: tex, roughness: .6 }), new THREE.MeshStandardMaterial({ map: tex, roughness: .6 })]));
    panel.position.y = 1.65; cart.add(panel); for (const sd of [-1, 1]) { const pt = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 1.2, 6).translate(0, .6, 0), new THREE.MeshStandardMaterial({ color: 0x8a9096, metalness: .5 })); pt.position.x = sd * .9; cart.add(pt); }
    cart.position.set(cx, cy, cz); cart.rotation.y = Math.atan2(-e0.tx, -e0.tz); scene.add(cart);
    const vol = new THREE.Group(), carne = new THREE.MeshStandardMaterial({ color: 0x9a6a46 }), chaleco = new THREE.MeshStandardMaterial({ color: 0xc6f02a, emissive: 0x2a3300, roughness: .5 }), osc = new THREE.MeshStandardMaterial({ color: 0x1d2433 });
    const pz = (g, m, x, y, z) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); vol.add(o); return o; };
    pz(new THREE.BoxGeometry(.16, .82, .18), osc, -.11, .41, 0); pz(new THREE.BoxGeometry(.16, .82, .18), osc, .11, .41, 0); pz(new THREE.BoxGeometry(.46, .6, .26), chaleco, 0, 1.12, 0); pz(new THREE.SphereGeometry(.13, 10, 8), carne, 0, 1.58, 0);
    pz(new THREE.BoxGeometry(.1, .56, .1), carne, -.3, 1.15, 0).rotation.z = -.15; const br = pz(new THREE.BoxGeometry(.1, .56, .1), carne, .32, 1.36, 0); br.rotation.z = 2.4;   // brazo arriba: señala la vuelta
    const ux = -e0.tz, uz = e0.tx; vol.position.set(cx + ux * 1.6, cy, cz + uz * 1.6); vol.rotation.y = Math.atan2(-e0.tx, -e0.tz); vol.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(vol);
    cart.traverse(o => { if (o.isMesh) o.castShadow = true; });
  }
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
    if (corto) { retorno(P, cinta, hw, acc); continue; }
    // asfalto (un poco por debajo de la losa del 42K: donde se solapan, manda la del 42K) y faldones hasta el terreno a cada lado
    cinta(hw, -hw, -.025, asf);
    for (const sd of [1, -1]) { const pos = [], idx = []; P.forEach((p, i) => { const x = p.x + p.lx * hw * sd, z = p.z + p.lz * hw * sd, g = Math.min(p.y - .03, Y(hT(x, z)) - .6), k = pos.length / 3; pos.push(x, p.y - .03, z, x, g, z); if (i) idx.push(k - 2, k, k - 1, k - 1, k, k + 1); });
      const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setIndex(idx); ge.computeVertexNormals(); const m = new THREE.Mesh(ge, falda); m.material.side = THREE.DoubleSide; scene.add(m); }
    const lejos = p => p.d > 10 && p.d < acc - 10;   // la pintura y el brocal no entran en el cruce con la calzada del 42K
    // Av. Las Acacias: 5 canales (rayas discontinuas), bordes amarillos y brocal bajo a cada lado
    for (const d of [-4.8, -1.6, 1.6, 4.8]) cinta(d - .07, d + .07, -.01, blanco, p => lejos(p) && (p.d % 9) < 4.5);
    for (const d of [hw - .35, -hw + .35]) cinta(d - .08, d + .08, -.01, amarillo, lejos);
    for (const sd of [1, -1]) { cinta(sd * hw, sd * (hw + .22), .14, brocal, lejos); cinta(sd * (hw + .22), sd * (hw + 3.4), .14, acera, lejos); }   // brocal y acera de 3,2 m a cada lado
  }
}
