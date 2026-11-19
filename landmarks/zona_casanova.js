// Zona casanova (km 20,8–23,3): lo singular que el video muestra y las huellas genéricas no dan.
// - Muro con baranda de la acera alzada en la primera cuadra tras el giro (km 21,09–21,17 izq.; f_0210).
// - C.C. del Este: tres bóvedas blancas de medio cañón sobre la fachada gris de Smart (km 21,20–21,25 izq.; f_0211).
// - Torre Banco Plaza: corona gris y letrero verde «BANCO PLAZA» en la cara que mira a quien llega por Casanova (f_0211–0212).
// - Firestone: franja roja con el logo en la nave blanca de la Av. Tamanaco (km 22,60–22,66 der.; f_0222).
// - Metropark: muro de colores con círculos y letras, y la noria de cabinas rojas, azules y amarillas (km 22,68–22,84 izq.; f_0223–0224).
// - Centro Cultural Chacao: caja naranja con el plano inclinado sobre la acera y basamento gris (km 23,14–23,19 der.; f_0228).
export const meta = { id: 'zona_casanova', nombre: 'Zona casanova', quita: [[10.490251, -66.863182, 16], [10.489482, -66.868013, 12]] };   // Centro Cultural Chacao y la nave de Firestone (se modelan aquí)

export function build(THREE, api) {
  const g = new THREE.Group();
  const add = (geo, mat, x, y, z, p = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };
  // punto en la ruta: km, desplazamiento lateral (+ izquierda, − derecha); devuelve {x, y, z, r}
  const P = (km, lado = 0) => { const r = api.routeAt(km), x = r.x + r.lx * lado, z = r.z + r.lz * lado; return { x, z, y: api.ground(x, z), r }; };
  // ángulos para que la cara +Z de un plano mire: a la izquierda del corredor, a la derecha, o hacia quien llega
  const mira = (r, hacia) => hacia === 'L' ? Math.atan2(r.lx, r.lz) : hacia === 'R' ? Math.atan2(-r.lx, -r.lz) : Math.atan2(-r.tx, -r.tz);
  const mat = (tex, o = {}) => new THREE.MeshStandardMaterial({ map: tex, roughness: .7, ...o });

  // ───────── Acera alzada con muro y baranda (f_0210) ─────────
  { const gris = api.concrete(0xb9b7b0), tubo = api.concrete(0xa7a9a8, { roughness: .4, metalness: .5 });
    for (let k = 21.092; k < 21.17; k += 0.008) {
      const a = P(k, 8.2), b = P(k + 0.008, 8.2), len = Math.hypot(b.x - a.x, b.z - a.z), th = Math.atan2(b.x - a.x, b.z - a.z), y = Math.min(a.y, b.y);
      const w = add(new THREE.BoxGeometry(.35, 1.3, len + .05), gris, (a.x + b.x) / 2, y + .65, (a.z + b.z) / 2); w.rotation.y = th;
      for (const h of [1.75, 2.25]) { const t = add(new THREE.BoxGeometry(.07, .07, len + .05), tubo, (a.x + b.x) / 2, y + h, (a.z + b.z) / 2); t.rotation.y = th; }
      add(new THREE.BoxGeometry(.07, 1, .07), tubo, a.x, y + 1.8, a.z);
    } }

  // ───────── C.C. del Este: bóvedas blancas sobre la fachada de Smart (f_0211) ─────────
  { const blanco = api.concrete(0xeeeeea), frente = api.concrete(0x4e555d);
    for (let i = 0; i < 3; i++) { const p = P(21.229 + i * 0.0135, 10.4 + i * .6), th = mira(p.r, 'R');
      const G = new THREE.Group(); G.position.set(p.x, p.y + 7.3, p.z); G.rotation.y = th; g.add(G);
      // medio cilindro con el eje perpendicular a la calle (la boca mira a la vía)
      const v = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 16, 24, 1, false, -Math.PI / 2, Math.PI), blanco); v.rotation.x = -Math.PI / 2; v.position.z = -8; G.add(v);
      const tapa = new THREE.Mesh(new THREE.CircleGeometry(5, 24, 0, Math.PI), frente); tapa.position.z = .05; G.add(tapa);
      add(new THREE.TorusGeometry(5.2, .28, 6, 24, Math.PI), blanco, 0, 0, .15, G);
    } }

  // ───────── Torre Banco Plaza: corona y letrero verde (f_0212) ─────────
  { const V = [[10.493658, -66.878253], [10.493522, -66.87779], [10.493826, -66.877698], [10.493958, -66.878156]].map(([a, b]) => api.xz(a, b));
    const cx = V.reduce((s, v) => s + v.x, 0) / 4, cz = V.reduce((s, v) => s + v.z, 0) / 4, y0 = api.ground(cx, cz), H = 85;
    const lx = Math.hypot(V[1].x - V[0].x, V[1].z - V[0].z), lz = Math.hypot(V[3].x - V[0].x, V[3].z - V[0].z), th = Math.atan2(V[1].z - V[0].z, V[1].x - V[0].x);
    const G = new THREE.Group(); G.position.set(cx, y0, cz); G.rotation.y = -th; g.add(G);   // +X local a lo largo de la fachada larga
    add(new THREE.BoxGeometry(lx * .92, 6, lz * .9), api.concrete(0xa9adb0), 0, H + 3, 0, G);
    add(new THREE.BoxGeometry(lx * .96, .8, lz * .94), api.concrete(0xc4c7c9), 0, H + .4, 0, G);
    // letrero en la cara corta del oeste (por donde se llega)
    const tx = api.canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#1f8a4c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e8f3ea'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12);
      c.fillStyle = '#ffffff'; c.font = 'bold 54px sans-serif'; c.textAlign = 'center'; c.fillText('BANCO PLAZA', w / 2, h * .7); });
    const s = add(new THREE.PlaneGeometry(lz * .7, 4.4), mat(tx, { emissive: 0x0d3a20, emissiveIntensity: .4 }), -lx * .46 - .3, H + 3.2, 0, G); s.rotation.y = -Math.PI / 2;
    add(new THREE.PlaneGeometry(lz * .7, .25), api.glow(0x2bd16a, { dia: .05, noche: 1.4 }), -lx * .46 - .35, H + .7, 0, G).rotation.y = -Math.PI / 2;
  }

  // ───────── Firestone (f_0222) ─────────
  { const dk = 0.014;
    const tx = api.canvasTex(1024, 96, (c, w, h) => { c.fillStyle = '#d8232a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'italic bold 66px serif'; c.textAlign = 'center'; c.fillText('Firestone', w * .55, h * .72);
      c.beginPath(); c.moveTo(w * .14, h * .2); c.lineTo(w * .2, h * .2); c.lineTo(w * .17, h * .85); c.closePath(); c.fill(); });
    // la fachada de la huella está a 11,6–12,9 m del eje entre 22,605 y 22,675
    // fachada blanca lisa por delante de la nave (la huella sale como galpón) y la franja roja encima
    const bl = api.concrete(0xeeeeec, { roughness: .8 }), vid = api.glass(0x6f8796);
    [[22.612, 11.8], [22.626, 12.7], [22.640, 12.8], [22.654, 12.6], [22.668, 12.0]].forEach(([k, d], i) => { const p = P(k, -(d - .9)), th = mira(p.r, 'L');
      const f = add(new THREE.BoxGeometry(dk * 1000 + .3, 9.2, 26), bl, p.x - p.r.lx * 13.02, p.y + 4.6, p.z - p.r.lz * 13.02); f.rotation.y = th;   // nave blanca (la huella se quita)
      if (i > 0) { const v = add(new THREE.PlaneGeometry(dk * 1000 - 3, 3.2), vid, p.x + p.r.lx * .05, p.y + 1.8, p.z + p.r.lz * .05); v.rotation.y = th; }
      const m = add(new THREE.PlaneGeometry(dk * 1000 + .3, 2.2), mat(tx), p.x + p.r.lx * .08, p.y + 6.6, p.z + p.r.lz * .08); m.rotation.y = th; });
    // marquesina de lona transparente sobre la entrada
    const p = P(22.655, -9.5), m = add(new THREE.BoxGeometry(14, .15, 4), api.concrete(0xd6dadd, { roughness: .3 }), p.x, p.y + 4.2, p.z); m.rotation.y = mira(p.r, 'L');
  }

  // ───────── Estacionamiento techado de la izquierda con su letrero negro y amarillo (f_0222) ─────────
  { const tx = api.canvasTex(1024, 128, (c, w, h) => { c.fillStyle = '#151515'; c.fillRect(0, 0, w, h); c.fillStyle = '#c62828'; c.fillRect(0, h * .82, w, h * .18);
      c.fillStyle = '#f2c230'; c.font = 'bold 76px sans-serif'; c.textAlign = 'center'; c.fillText('← ESTACIONAMIENTO', w / 2, h * .66); });
    const p = P(22.588, 13.4), m = add(new THREE.PlaneGeometry(13, 1.8), mat(tx), p.x, p.y + 1.6, p.z); m.rotation.y = mira(p.r, 'R');
    const tb = api.canvasTex(1024, 128, (c, w, h) => { c.fillStyle = '#2b2b2b'; c.fillRect(0, 0, w, h); c.fillStyle = '#d0d0d0'; c.font = 'italic bold 70px sans-serif'; c.fillText('UNICOR', 60, 90); c.fillStyle = '#b71c1c'; c.fillRect(w * .6, 20, w * .3, 88); });
    const q = P(22.598, 13.6), b = add(new THREE.PlaneGeometry(14, 2.6), mat(tb), q.x, q.y + 5.4, q.z); b.rotation.y = mira(q.r, 'R'); }

  // ───────── Metropark (f_0223–0224) ─────────
  { const dibuja = (c, w, h) => {
      const fr = ['#f4d35e', '#f28fa6', '#9fd3e8', '#f6a04d', '#b7e07a', '#e86a8f', '#f7e4a1', '#6ec1e4'];
      for (let i = 0; i < 26; i++) { c.fillStyle = fr[i % fr.length]; c.fillRect(i * w / 26, 0, w / 26 + 1, h); }
      for (let i = 0; i < 22; i++) { c.fillStyle = fr[(i * 3 + 1) % fr.length]; c.beginPath(); c.arc((i * 97) % w, 40 + (i * 53) % 170, 18 + (i * 7) % 26, 0, 7); c.fill(); }
      c.fillStyle = '#4a4f55'; c.fillRect(0, h * .78, w, h * .22);
      const L = 'METROPARK', cols = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#457b9d', '#e76f51', '#8ab17d', '#d62828', '#1d3557'];
      for (let i = 0; i < L.length; i++) { const x = w * .12 + i * 46; c.fillStyle = cols[i]; c.beginPath(); c.arc(x, h * .62, 21, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = 'bold 28px sans-serif'; c.textAlign = 'center'; c.fillText(L[i], x, h * .62 + 10); }
      c.fillStyle = '#ffffff'; c.font = 'bold 18px sans-serif'; c.fillText('ACCESO LIBRE', w * .3, h * .74); };
    const k0 = 22.672, k1 = 22.82, n = 8, dk = (k1 - k0) / n, gris = api.concrete(0x8a8d90), osc = api.concrete(0x2e3236);
    for (let i = 0; i < n; i++) { const a = P(k0 + i * dk, 11.5), b = P(k0 + (i + 1) * dk, 11.5), len = Math.hypot(b.x - a.x, b.z - a.z), r = api.routeAt(k0 + (i + .5) * dk);
      const t = api.canvasTex(256, 256, (c) => { c.scale(256 * n / 1024, 1); c.translate(-i * 1024 / n, 0); dibuja(c, 1024, 256); });   // un tramo del mural por segmento
      const y0 = Math.min(a.y, b.y), mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
      const m = add(new THREE.PlaneGeometry(len + .05, 10), mat(t), mx, y0 + 9.2, mz); m.rotation.y = mira(r, 'R');
      // volumen detrás del mural, soportal oscuro en planta baja y columnas
      const v = add(new THREE.BoxGeometry(len, 10, 7), gris, mx + r.lx * 3.55, y0 + 9.2, mz + r.lz * 3.55); v.rotation.y = m.rotation.y;
      const s = add(new THREE.BoxGeometry(len, 4.2, 4), osc, mx + r.lx * 5, y0 + 2.1, mz + r.lz * 5); s.rotation.y = m.rotation.y;
      const c = add(new THREE.BoxGeometry(.7, 4.2, .7), api.concrete(0xd7d2c8), a.x + r.lx * .4, a.y + 2.1, a.z + r.lz * .4); c.rotation.y = m.rotation.y; }
    // baranda metálica de la acera
    { const tubo = api.concrete(0xb5b8ba, { roughness: .4, metalness: .5 });
      for (let k = k0; k < k1; k += 0.006) { const p = P(k, 8.8); add(new THREE.BoxGeometry(.06, 1.1, .06), tubo, p.x, p.y + .55, p.z); const q = P(k + .006, 8.8), t = add(new THREE.BoxGeometry(.05, .05, 6.05), tubo, (p.x + q.x) / 2, p.y + 1.05, (p.z + q.z) / 2); t.rotation.y = Math.atan2(q.x - p.x, q.z - p.z); } }
    // la noria: aro blanco, rayos, caballete en A y 18 cabinas de colores
    const c = P(22.815, 27), R = 15, Hc = R + 6, blanco = api.concrete(0xf2f2ef, { roughness: .5 });
    const W = new THREE.Group(); W.position.set(c.x, c.y + Hc, c.z); W.rotation.y = mira(c.r, 'R') + 0.9; g.add(W);
    for (const dz of [-.9, .9]) { add(new THREE.TorusGeometry(R, .22, 6, 64), blanco, 0, 0, dz, W); add(new THREE.TorusGeometry(R * .55, .12, 5, 40), blanco, 0, 0, dz, W); }
    const nR = 18;
    for (let i = 0; i < nR; i++) { const a = i / nR * Math.PI * 2, s = add(new THREE.CylinderGeometry(.07, .07, R, 4), blanco, Math.cos(a) * R / 2, Math.sin(a) * R / 2, 0, W); s.rotation.z = a - Math.PI / 2; }
    add(new THREE.CylinderGeometry(.9, .9, 2.4, 12), blanco, 0, 0, 0, W).rotation.x = Math.PI / 2;
    for (const dz of [-2.2, 2.2]) for (const sx of [-1, 1]) { const len = Math.hypot(Hc, 7), l = add(new THREE.CylinderGeometry(.35, .45, len, 8), blanco, sx * 3.5, -Hc / 2, dz, W); l.rotation.z = sx * Math.atan2(7, Hc); }
    const cab = [0xd62828, 0x1f6fd1, 0xf2c230, 0x2a9d8f, 0xe76f51, 0x6a4c93];
    for (let i = 0; i < nR; i++) { const a = i / nR * Math.PI * 2, x = Math.cos(a) * R, y = Math.sin(a) * R;
      const b = add(new THREE.CylinderGeometry(1.15, 1.15, 1.9, 12), api.concrete(cab[i % cab.length], { roughness: .4 }), x, y - 1.6, 0, W); b.rotation.x = Math.PI / 2;
      add(new THREE.SphereGeometry(1.1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), api.concrete(0xf4f4f0), x, y - 1.6 + .35, 0, W); }
    // luces de noche en el aro
    add(new THREE.TorusGeometry(R + .25, .09, 4, 64), api.glow(0xffd36b, { dia: 0, noche: 1.5 }), 0, 0, 0, W);
  }

  // ───────── Centro Cultural Chacao: caja naranja con el gran plano inclinado hacia la calle (f_0228) ─────────
  { const V = [[10.490441, -66.863376], [10.490209, -66.863303], [10.490227, -66.863269], [10.490146, -66.863276], [10.490154, -66.863184], [10.490107, -66.862894], [10.490509, -66.862981]].map(([a, b]) => api.xz(a, b));
    const cx = V.reduce((s, v) => s + v.x, 0) / V.length, cz = V.reduce((s, v) => s + v.z, 0) / V.length, y0 = Math.min(...V.map(v => api.ground(v.x, v.z)));
    const sh = new THREE.Shape(V.map(v => new THREE.Vector2(v.x - cx, -(v.z - cz))));
    const caja = (h, m, y) => { const e = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }); e.rotateX(-Math.PI / 2); return add(e, m, cx, y, cz); };
    caja(4, api.concrete(0x8d9192), y0 - 1);
    { const c = caja(15, api.concrete(0xb85a38, { roughness: .9 }), y0 + 3); c.scale.set(.82, 1, .82); }   // volumen retranqueado tras el plano
    // plano inclinado: sube desde el basamento y se vuelca hacia la acera, más alto que la caja
    const r = api.routeAt(23.165), a = P(23.142, -9.4), b = P(23.19, -9.4), len = Math.hypot(b.x - a.x, b.z - a.z), th = mira(r, 'L');
    const G = new THREE.Group(); G.position.set((a.x + b.x) / 2, y0 + 3, (a.z + b.z) / 2); G.rotation.y = th; g.add(G);   // +Z local = hacia la vía
    // el plano arranca en el borde de la huella (~8,4 m del eje) y se vuelca apenas 1,5 m sobre la acera; nunca invade la calzada
    const nar = api.concrete(0xe07a45, { roughness: .85 }), nar2 = api.concrete(0xd06a3a, { roughness: .85 });
    const s1 = add(new THREE.BoxGeometry(len * .62, 19, .6), nar, len * .19, 9.5, -.9, G); s1.rotation.x = .06;
    const s2 = add(new THREE.BoxGeometry(len * .42, 16, .6), nar2, -len * .3, 8, -1.4, G); s2.rotation.x = .05; s2.rotation.y = -.15;
  }

  return api.sombras(g);
}
