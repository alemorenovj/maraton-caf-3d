// Puestos de hidratación del Maratón CAF: agua (toldos azules, mesas blancas largas, botellas de 355 cc, voluntarios de chaleco),
// Gatorade (bandera vertical naranja #F0501E, voluntarios de franela naranja, cavas naranja y rojas, sin toldo) y gel GU en los km de api.D.geles.
// Fuentes: build/investigacion/dia_de_carrera.md §4 y fotos/carrera/caf26_manual_gatorade_pelotón_amarillo.jpg (piso mojado y lleno de vasos después del puesto).
// Mesas a la DERECHA de la calzada, a ~1,5 m del borde, alineadas con la ruta. Baños portátiles en los puestos de km par (manual: baños cada 2 km junto al agua).
export const meta = { id: 'hidratacion', nombre: 'Puestos de hidratación (agua, Gatorade y gel GU)', quita: [] };

export function build(THREE, api) {
  const g = new THREE.Group(), RW = api.ROAD_W, HW = RW / 2, D = api.D, GA = D.gatorade || [], GE = D.geles || [], tun = D.tuneles || [];
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
  const M = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) => { _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e); return _m.compose(_v.set(x, y, z), _q, _s.set(sx, sy, sz)); };
  const inst = (geo, mat, list, colors) => { const im = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((t, i) => { im.setMatrixAt(i, M(...t)); if (colors) im.setColorAt(i, colors[i]); }); im.instanceMatrix.needsUpdate = true; im.computeBoundingBox?.(); im.computeBoundingSphere?.(); return im; };
  const at = (p, lat) => [p.x + p.lx * lat, p.z + p.lz * lat], yaw = p => Math.atan2(p.tx, p.tz), R = km => api.routeAt(km);
  let seed = 1717; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const C = h => new THREE.Color(h);

  // listas de instancias
  const tables = [], tablesG = [], cups = [], cupCol = [], canop = [], val = [], legs = [], ppl = [], pplCol = [], cool = [], coolCol = [], flagPole = [], flagG = [], flagGU = [], litter = [], litCol = [], wc = [], guBox = [], puddles = [];
  const LAT_T = -(HW + 1.5 + .35); // centro de las mesas (borde de la mesa a 1,5 m de la calzada)
  const person = (p, lat, shirt, face = 1) => { const [x, z] = at(p, lat); const s = .93 + rnd() * .14; ppl.push([x, p.y, z, yaw(p) + face * Math.PI / 2 + (rnd() - .5) * .6, s, s, s]); pplCol.push(C(shirt)); };

  for (const K of D.hidratacion) {
    if (tun.some(t => K > t.km0 - .05 && K < t.km3 + .05)) continue; // nada dentro de túneles
    const isG = GA.includes(K), hasGel = GE.includes(K), NT = isG ? 5 : 4, TL = 2.4;
    // mesas alineadas con la ruta
    for (let i = 0; i < NT; i++) { const km = K + (i - (NT - 1) / 2) * (TL + .2) / 1000, p = R(km), [x, z] = at(p, LAT_T); (isG ? tablesG : tables).push([x, p.y, z, yaw(p)]);
      // botellas (agua) o vasos (Gatorade) sobre la mesa: dos filas
      for (let j = 0; j < 4; j++) { const q = R(km + (j % 2 - .5) * .9 / 1000), [cx, cz] = at(q, LAT_T + (j < 2 ? .17 : -.17)); cups.push([cx, p.y + .76, cz, 0, 1, isG ? .55 : 1, 1]); cupCol.push(isG ? (rnd() < .6 ? C(0xff9a3c) : C(0xf4f4f4)) : C(0xbfe3ff)); }
      // voluntarios detrás de la mesa, mirando a la calzada
      person(R(km + (rnd() - .5) * .0015), LAT_T - .9 - rnd() * .5, isG ? 0xf06a1e : 0xc8f03c, 1);
      if (rnd() < .5) person(R(km + (rnd() - .5) * .0015), LAT_T - 1.6 - rnd() * .8, isG ? 0xf06a1e : (rnd() < .5 ? 0xc8f03c : 0x1d2a44), 1);
    }
    // dos voluntarios adelantados, al borde de la calzada, ofreciendo
    for (let i = 0; i < 2; i++) person(R(K + (i ? .006 : -.002)), -(HW + .6), isG ? 0xf06a1e : 0xc8f03c, 1);
    const half = NT * (TL + .2) / 2000;
    if (!isG) { // toldos azules 3×3 sobre las mesas
      for (const dk of [-.0016, .0016]) { const p = R(K + dk), [x, z] = at(p, LAT_T - .9); canop.push([x, p.y + 2.5, z, yaw(p) + Math.PI / 4]); val.push([x, p.y + 2.42, z, yaw(p)]);
        for (const [a, b] of [[1.45, 1.45], [-1.45, 1.45], [1.45, -1.45], [-1.45, -1.45]]) legs.push([x + p.lx * a + p.tx * b, p.y, z + p.lz * a + p.tz * b, 0]); }
    } else { // Gatorade: bandera vertical al inicio y al final del puesto, cavas naranjas y rojas
      for (const dk of [-half - .002, half + .002]) { const p = R(K + dk), [x, z] = at(p, -(HW + 1.1)); flagPole.push([x, p.y, z, 0]); flagG.push([x, p.y, z, yaw(p) + Math.PI]); }
      for (let i = 0; i < 4; i++) { const p = R(K + (rnd() - .5) * half * 2), [x, z] = at(p, LAT_T - .7 - rnd() * .6); cool.push([x, p.y, z, yaw(p) + rnd() * .4, 1, i % 3 ? 1 : 1.5, 1]); coolCol.push(C(i % 2 ? 0xd8262e : 0xf06a1e)); }
    }
    if (hasGel) { // punto de gel GU: mesa aparte después del agua, bandera negra, cajas de geles, voluntarios de negro
      const p = R(K + half + .009), [x, z] = at(p, LAT_T); tables.push([x, p.y, z, yaw(p)]); for (let j = 0; j < 4; j++) { const q = R(K + half + .009 + (j - 1.5) * .5 / 1000), [bx, bz] = at(q, LAT_T); guBox.push([bx, p.y + .76, bz, yaw(p) + rnd() * .3]); }
      const pf = R(K + half + .012), [fx, fz] = at(pf, -(HW + 1.1)); flagPole.push([fx, pf.y, fz, 0]); flagGU.push([fx, pf.y, fz, yaw(pf) + Math.PI]);
      for (let i = 0; i < 3; i++) person(R(K + half + .008 + i * .0012), LAT_T - .9, 0x1a1a1a, 1);
    }
    // baños portátiles en los puestos de km par, detrás del puesto
    if (Math.abs(K - Math.round(K)) < .01 && Math.round(K) % 2 === 0) for (let i = 0; i < 3; i++) { const p = R(K - half - .004 - i * .0013), [x, z] = at(p, -(HW + 4.2)); wc.push([x, p.y, z, yaw(p) + Math.PI / 2]); }
    // después del puesto: charco y botellas/vasos tirados sobre la calzada (mitad derecha)
    { const p = R(K + half + .016), [x, z] = at(p, -(HW - 3.2)); puddles.push([x, p.y + .05, z, yaw(p)]); }
    for (let i = 0; i < 20; i++) { const p = R(K + half + .002 + rnd() * .04), [x, z] = at(p, -(HW - .3 - rnd() * rnd() * 7)); litter.push([x, p.y + .035, z, rnd() * 6.28, 1, isG ? .55 : 1, 1, Math.PI / 2]); litCol.push(isG ? (rnd() < .5 ? C(0xff9a3c) : C(0xf2f2f2)) : C(0xd5ecff)); }
  }

  // ── geometrías y materiales ──
  const tableGeo = new THREE.BoxGeometry(.7, .74, 2.4).translate(0, .37, 0);
  const texMantel = api.canvasTex(64, 32, (c, w, h) => { c.fillStyle = '#f4f4f2'; c.fillRect(0, 0, w, h); c.fillStyle = '#204DA2'; c.fillRect(0, 0, w, 4); });
  const texMantelG = api.canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#f4f4f2'; c.fillRect(0, 0, w, h); c.fillStyle = '#F0501E'; c.fillRect(0, 0, w, 10); c.font = 'italic 900 30px Arial'; c.textAlign = 'center'; c.fillText('GATORADE', w / 2, 46); });
  g.add(inst(tableGeo, new THREE.MeshStandardMaterial({ map: texMantel, roughness: .9 }), tables), inst(tableGeo, new THREE.MeshStandardMaterial({ map: texMantelG, roughness: .9 }), tablesG));
  const cupGeo = new THREE.CylinderGeometry(.035, .03, .2, 4, 1, true).translate(0, .1, 0);
  g.add(inst(cupGeo, new THREE.MeshStandardMaterial({ roughness: .35, metalness: 0 }), cups, cupCol));
  g.add(inst(cupGeo, new THREE.MeshStandardMaterial({ roughness: .4 }), litter, litCol));
  // toldo: techo piramidal azul + faldón con texto + patas
  const texFaldon = api.canvasTex(256, 32, (c, w, h) => { c.fillStyle = '#1f5fbf'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = '900 22px Arial'; c.textAlign = 'center'; c.fillText('HIDRATACIÓN · 42KCAF', w / 2, 24); });
  g.add(inst(new THREE.ConeGeometry(2.12, .75, 4, 1, true).translate(0, .37, 0), api.concrete(0x2667c9, { roughness: .7, side: THREE.DoubleSide }), canop));
  g.add(inst(new THREE.BoxGeometry(3, .28, 3), new THREE.MeshStandardMaterial({ map: texFaldon, roughness: .8 }), val));
  g.add(inst(new THREE.CylinderGeometry(.03, .03, 2.45, 4, 1, true).translate(0, 1.22, 0), api.concrete(0xb8bcc0, { metalness: .6, roughness: .4 }), legs));
  // bandera vertical tipo pluma: GATORADE (#F0501E) y GU (negro)
  const feather = (bg, fg, txt, sz) => api.canvasTex(128, 512, (c, w, h) => { c.clearRect(0, 0, w, h); c.save(); c.translate(w, 0); c.scale(-1, 1); c.fillStyle = bg; c.beginPath(); c.moveTo(4, h); c.lineTo(4, 40); c.quadraticCurveTo(10, 4, 70, 6); c.quadraticCurveTo(124, 30, 124, 120); c.lineTo(110, h - 60); c.lineTo(4, h); c.fill(); c.restore();
    c.save(); c.translate(w / 2 + 2, h / 2 + 30); c.rotate(-Math.PI / 2); c.fillStyle = fg; c.font = `italic 900 ${sz}px Arial`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 0, 0); c.restore(); });
  const flagGeo = new THREE.PlaneGeometry(.8, 3.2).translate(-.42, 1.9, .01);
  g.add(inst(flagGeo, new THREE.MeshStandardMaterial({ map: feather('#F0501E', '#ffffff', 'GATORADE', 58), transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .8 }), flagG));
  g.add(inst(flagGeo, new THREE.MeshStandardMaterial({ map: feather('#141414', '#ffffff', 'GU ENERGY', 54), transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .8 }), flagGU));
  g.add(inst(new THREE.CylinderGeometry(.025, .03, 3.6, 4, 1, true).translate(0, 1.8, 0), api.concrete(0x2b2b2b), flagPole));
  g.add(inst(new THREE.BoxGeometry(.55, .42, .4).translate(0, .21, 0), new THREE.MeshStandardMaterial({ roughness: .5 }), cool, coolCol));
  // cajas de gel GU
  g.add(inst(new THREE.BoxGeometry(.32, .12, .22).translate(0, .06, 0), api.concrete(0x111111, { roughness: .6 }), guBox));
  // baños portátiles azules
  const texWC = api.canvasTex(64, 128, (c, w, h) => { c.fillStyle = '#1f62b5'; c.fillRect(0, 0, w, h); c.fillStyle = '#174d8f'; c.fillRect(8, 22, w - 16, h - 26); c.fillStyle = '#e8e8e8'; c.fillRect(8, 6, w - 16, 12); });
  g.add(inst(new THREE.BoxGeometry(1.15, 2.3, 1.15).translate(0, 1.15, 0), new THREE.MeshStandardMaterial({ map: texWC, roughness: .6 }), wc));
  // charco: manchas oscuras y brillantes sobre el asfalto
  const texCharco = api.canvasTex(256, 512, (c, w, h) => { c.clearRect(0, 0, w, h); let s = 31; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 70; i++) { const x = w * (.15 + r() * .7), y = h * (.05 + r() * .9), rr = 14 + r() * 46, gr = c.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(28,36,46,.55)'); gr.addColorStop(1, 'rgba(28,36,46,0)'); c.fillStyle = gr; c.beginPath(); c.arc(x, y, rr, 0, 6.3); c.fill(); } });
  g.add(inst(new THREE.PlaneGeometry(7, 26).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: texCharco, transparent: true, depthWrite: false, roughness: .08, metalness: .2, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), puddles));

  // voluntarios: piernas oscuras + torso del color del uniforme, cabeza aparte
  { const body = mergeColored(THREE, [[new THREE.BoxGeometry(.34, .84, .2).translate(0, .42, 0), .2], [new THREE.BoxGeometry(.42, .62, .24).translate(0, 1.15, 0), 1]]);
    const head = new THREE.OctahedronGeometry(.13).scale(1, 1.2, 1).translate(0, 1.62, 0), skins = [0x8d5a3b, 0xc68863, 0xe0ac85, 0x6b4128, 0xa86f4c];
    g.add(inst(body, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85 }), ppl, pplCol), inst(head, new THREE.MeshStandardMaterial({ roughness: .8 }), ppl, ppl.map(() => C(skins[Math.floor(rnd() * skins.length)])))); }

  return api.sombras(g);
}

function mergeColored(THREE, parts) {
  const pos = [], nor = [], col = [];
  for (const [geo, v] of parts) { const gg = geo.index ? geo.toNonIndexed() : geo, p = gg.attributes.position, n = gg.attributes.normal; for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(v, v, v); } }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return out;
}
