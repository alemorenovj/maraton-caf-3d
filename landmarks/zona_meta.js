// Zona meta (km 37,3–42,2): lo singular que el video muestra y las huellas genéricas no dan.
// - «40» pintado en círculo rojo sobre los canales de la Francisco de Miranda en Chacao (f_0347, f_0351).
// - Boca del Metro Chacao: pilar oscuro con la M naranja bajo el edificio de nervios de concreto (km 37,96 der.; f_0351).
// - Paso inferior Neomar Lander (km 38,56–38,78): los canales centrales bajan a una trinchera a la IZQUIERDA y la ruta sigue
//   arriba; se ve el murete de concreto con baranda galvanizada y, al otro lado, el segundo murete (f_0355).
// - Torre Kira en obra (km 38,60 der.): esqueleto de losas y columnas sin fachada, con valla de zinc grafiteada (f_0355).
// - Mural multicolor del edificio de la esquina de la Av. W. H. Phelps (km 39,22 izq.; f_0361).
// - Boca del Metro Plaza Venezuela: pabellón gris con franja oscura y letrero (km 41,30 der.; f_0385).
// - Túnel bajo Plaza Venezuela (lo dibuja el motor, km 41,45–41,79): le pongo encima el revestimiento real — trinchera de concreto
//   gris con zócalo rojo-rosado (f_0386), mural cerámico de triángulos melocotón/blanco/azul grisáceo a la derecha y, a la izquierda,
//   el murete bajo que separa la otra calzada con el mural lejano en penumbra (f_0387).
export const meta = { id: 'zona_meta', nombre: 'Zona meta', quita: [] };

export function build(THREE, api) {
  const g = new THREE.Group();
  const suelo = (x, z) => api.ground(x, z);
  const add = (geo, mat, x, y, z, p = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); return m; };
  // grupo en la ruta (lado > 0 = izquierda del corredor, < 0 = derecha)
  const enRuta = (km, lado = 0, dy = 0) => { const r = api.routeAt(km), x = r.x + r.lx * lado, z = r.z + r.lz * lado, G = new THREE.Group();
    G.position.set(x, Math.max(suelo(x, z), r.y) + dy, z); G.rotation.y = Math.atan2(r.tx, r.tz) - Math.PI / 2; g.add(G); return G; };   // la acera va a cota de calzada (el terreno queda ~0,9 m abajo)
  // con rotation.y = atan2(tx,tz) − π/2 el +X local apunta en el sentido de carrera y el +Z local hacia la DERECHA del corredor
  const conc = api.concrete(0xa3a29c), concClaro = api.concrete(0xb9b6ad), galv = api.concrete(0x9ea3a6, { metalness: .5, roughness: .45 });

  // ───────── «40» pintado en la calzada (Chacao) ─────────
  { const t = api.canvasTex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#c8282c'; c.beginPath(); c.arc(w / 2, h / 2, w * .48, 0, 7); c.fill();
      c.fillStyle = '#ece9e2'; c.beginPath(); c.arc(w / 2, h / 2, w * .36, 0, 7); c.fill(); c.fillStyle = '#3b3b3b'; c.font = 'bold 120px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('40', w / 2, h / 2 + 6); });
    const m = new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, roughness: .9, polygonOffset: true, polygonOffsetFactor: -10, polygonOffsetUnits: -24 });
    const geo = new THREE.PlaneGeometry(2.6, 2.6);
    for (const [km, lados] of [[37.885, [-4.1, 0, 4.1]], [37.99, [4.1, 0]]]) for (const l of lados) {
      const r = api.routeAt(km), x = r.x + r.lx * l, z = r.z + r.lz * l, p = add(geo, m, x, Math.max(r.y, suelo(x, z)) + .1, z);
      p.rotation.order = 'YXZ'; p.rotation.y = Math.atan2(r.tx, r.tz) + Math.PI; p.rotation.x = -Math.PI / 2; p.renderOrder = 5; } }

  // ───────── Boca del Metro Chacao ─────────
  { const P = enRuta(37.965, -(api.ROAD_W / 2 + 3.2));
    const lt = api.canvasTex(128, 512, (c, w, h) => { c.fillStyle = '#34363a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8641e'; c.fillRect(14, 30, 100, 100); c.fillStyle = '#fff'; c.font = 'bold 88px sans-serif'; c.textAlign = 'center'; c.fillText('M', w / 2, 112);
      c.font = 'bold 22px sans-serif'; c.fillText('Chacao', w / 2, 168); c.fillStyle = '#d8d8d8'; c.fillRect(20, 190, 88, 3); });
    const lm = new THREE.MeshStandardMaterial({ map: lt, roughness: .6 }), osc = api.concrete(0x34363a);
    add(new THREE.BoxGeometry(.7, 5.2, 1.3), [lm, lm, osc, osc, osc, osc], 0, 2.6, 0, P);   // tótem: la M mira a quien llega
    // escalera: antepecho de concreto alrededor del hueco oscuro
    add(new THREE.BoxGeometry(7, .05, 2.6), api.concrete(0x15171a), -4.5, .03, .3, P);
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(7, 1.05, .25), concClaro, -4.5, .52, .3 + s * 1.4, P);
    add(new THREE.BoxGeometry(.25, 1.05, 3), concClaro, -1, .52, .3, P);
  }

  // ───────── Paso inferior Neomar Lander: murete con baranda y trinchera a la izquierda ─────────
  { const k0 = 38.56, k1 = 38.78, n = Math.round((k1 - k0) * 1000 / 3), l1 = api.ROAD_W / 2 + .5, l2 = l1 + 8.5;
    const muro = new THREE.InstancedMesh(new THREE.BoxGeometry(3.05, 1.0, .35), conc, n * 2), post = new THREE.InstancedMesh(new THREE.BoxGeometry(.12, 1.0, .12), galv, n * 2),
      riel = new THREE.InstancedMesh(new THREE.BoxGeometry(3.05, .09, .09), galv, n * 4), fondo = new THREE.InstancedMesh(new THREE.BoxGeometry(3.05, .04, l2 - l1 - .4), api.concrete(0x2b2e31), n);
    const q = new THREE.Object3D(); let a = 0, b = 0, c = 0;
    for (let i = 0; i < n; i++) { const km = k0 + (i + .5) * (k1 - k0) / n, r = api.routeAt(km), yaw = Math.atan2(r.tx, r.tz) - Math.PI / 2;
      for (const L of [l1, l2]) { const x = r.x + r.lx * L, z = r.z + r.lz * L, y = Math.max(suelo(x, z), r.y);
        q.position.set(x, y + .5, z); q.rotation.set(0, yaw, 0); q.updateMatrix(); muro.setMatrixAt(a, q.matrix);
        q.position.set(x, y + 1.5, z); q.updateMatrix(); post.setMatrixAt(a++, q.matrix);
        for (const dy of [1.55, 1.95]) { q.position.set(x, y + dy, z); q.updateMatrix(); riel.setMatrixAt(b++, q.matrix); } }
      const L = (l1 + l2) / 2, x = r.x + r.lx * L, z = r.z + r.lz * L; q.position.set(x, r.y + .03, z); q.rotation.set(0, yaw, 0); q.updateMatrix(); fondo.setMatrixAt(c++, q.matrix); }
    g.add(muro, post, riel, fondo);
    // emblema redondo en el murete (f_0355)
    { const r = api.routeAt(38.60), x = r.x + r.lx * (l1 - .2), z = r.z + r.lz * (l1 - .2), e = add(new THREE.CircleGeometry(.4, 24), api.concrete(0x2f8f6a), x, r.y + .55, z); e.rotation.y = Math.atan2(-r.tz, r.tx); }
  }

  // ───────── Torre Kira en obra: esqueleto de losas y columnas ─────────
  { const c = api.xz(10.492309, -66.860324), r = api.routeAt(38.60), y0 = suelo(c.x, c.z), G = new THREE.Group();
    G.position.set(c.x, y0, c.z); G.rotation.y = Math.atan2(r.tx, r.tz) - Math.PI / 2; g.add(G);
    const W = 27, Dd = 24, P = 15, FH = 3.6, losa = api.concrete(0xb3afa6), col = api.concrete(0xa8a49b);
    const ls = new THREE.InstancedMesh(new THREE.BoxGeometry(W, .4, Dd), losa, P), q = new THREE.Object3D();
    for (let i = 0; i < P; i++) { q.position.set((i % 3 ? 0 : .8), FH * (i + 1), 0); q.updateMatrix(); ls.setMatrixAt(i, q.matrix); } G.add(ls);
    const cg = new THREE.InstancedMesh(new THREE.BoxGeometry(.8, FH * P, .8), col, 16); let k = 0;
    for (const x of [-11.5, -4, 4, 11.5]) for (const z of [-10, -3.5, 3.5, 10]) { q.position.set(x, FH * P / 2, z); q.updateMatrix(); cg.setMatrixAt(k++, q.matrix); } G.add(cg);
    add(new THREE.BoxGeometry(6, FH * P + 4, 6), api.concrete(0x9d998f), 0, (FH * P + 4) / 2, 0, G);   // núcleo de ascensores
    // valla de zinc con grafiti a lo largo de la acera
    const vt = api.canvasTex(512, 64, (cc, w, h) => { cc.fillStyle = '#a9aca8'; cc.fillRect(0, 0, w, h); cc.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 0; x < w; x += 8) cc.fillRect(x, 0, 3, h);
      const gc = ['#d94f7a', '#3d8fd1', '#e8a23c', '#4aa36b']; for (let i = 0; i < 9; i++) { cc.fillStyle = gc[i % 4]; cc.font = 'bold 30px sans-serif'; cc.fillText(['NO', 'ARS', 'KZ', '∞'][i % 4], 20 + i * 55, 44 + (i % 2) * 8); } });
    const vm = new THREE.MeshStandardMaterial({ map: vt, roughness: .7, metalness: .3 });
    add(new THREE.BoxGeometry(W + 2, 3, .1), vm, 0, 1.5, -Dd / 2 - 1, G); add(new THREE.BoxGeometry(.1, 3, Dd), vm, -W / 2 - 1, 1.5, 0, G);
  }

  // ───────── Mural multicolor de la esquina de Phelps ─────────
  { const f = fachada(10.490446, -66.865808, 39.22);
    if (f) { const t = api.canvasTex(512, 256, (c, w, h) => { const cs = ['#f2c81e', '#e9437a', '#2f8fd8', '#ef6a2a', '#5bbf5a', '#8a5cc4', '#26b5b0', '#e8312f'];
        c.fillStyle = '#f4efe6'; c.fillRect(0, 0, w, h); for (let i = 0; i < 22; i++) { c.fillStyle = cs[i % cs.length]; const x = (i * 37) % w, y = (i * 53) % h; c.fillRect(x - 10, y - 30, 40 + (i % 3) * 30, 70 + (i % 4) * 25); }
        c.fillStyle = '#ffffff'; for (let i = 0; i < 6; i++) c.fillRect(i * 90 + 10, 0, 6, h); });
      const L = Math.min(f.len, 34), H = 13, m = add(new THREE.PlaneGeometry(L, H), new THREE.MeshStandardMaterial({ map: t, roughness: .8 }), f.x, f.y + H / 2 + .3, f.z); m.rotation.y = f.ang; }
  }

  // ───────── Boca del Metro Plaza Venezuela ─────────
  { const P = enRuta(41.30, -(api.ROAD_W / 2 + 2.2)), Lb = 15, Hb = 4.4, Db = 5;
    const fas = api.canvasTex(512, 64, (c, w, h) => { c.fillStyle = '#2a2b2e'; c.fillRect(0, 0, w, h); c.fillStyle = '#d42b2b'; c.fillRect(18, 14, 36, 36); c.fillStyle = '#fff'; c.font = 'bold 30px sans-serif'; c.fillText('M', 23, 44);
      c.font = 'bold 30px sans-serif'; c.fillText('Plaza Venezuela', 70, 43); });
    const fm = new THREE.MeshStandardMaterial({ map: fas, roughness: .6 }), gr = api.concrete(0xc9c6bf);
    add(new THREE.BoxGeometry(Lb, Hb, Db), gr, 0, Hb / 2, Db / 2, P);
    const banda = add(new THREE.PlaneGeometry(Lb * .7, 1), fm, -1, Hb - .7, -.02, P); banda.rotation.y = Math.PI;
    const hueco = api.concrete(0x1c1d20); add(new THREE.BoxGeometry(Lb * .6, 2.6, .1), hueco, 0, 1.3, -.03, P);
    const st = api.canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#7d7f80'; c.fillRect(0, 0, w, h); c.fillStyle = '#5d5f60'; for (let y = 0; y < h; y += 6) c.fillRect(0, y, w, 2); });
    add(new THREE.PlaneGeometry(3, 2.6), new THREE.MeshStandardMaterial({ map: st, roughness: .5, metalness: .4 }), Lb / 2 - 2.2, 1.3, -.1, P).rotation.y = Math.PI;
  }

  // ───────── Revestimiento del túnel de Plaza Venezuela ─────────
  { const T = (api.D.tuneles || []).find(t => t.km0 > 41 && t.km0 < 42); if (T) {
    const H = T.alto || 5.4, hw = api.ROAD_W / 2 + .7 - .1, base = 0xcfcfcf;
    const der = api.canvasTex(1024, 128, (c, w, h) => { c.fillStyle = '#eae4da'; c.fillRect(0, 0, w, h); const cs = ['#e9a27a', '#f0b791', '#9fb3c4', '#ffffff', '#d98a5f', '#b8c6d1'];
      for (let i = 0; i < 18; i++) { c.fillStyle = cs[i % cs.length]; const x = i * 60 - 20, up = i % 2; c.beginPath(); c.moveTo(x, up ? h : 0); c.lineTo(x + 110, up ? h : 0); c.lineTo(x + 55 + (i % 3) * 8, up ? h * .15 : h * .85); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.25)'; for (let x = 0; x < w; x += 16) c.fillRect(x, 0, 1, h); for (let y = 0; y < h; y += 16) c.fillRect(0, y, w, 1);
      c.fillStyle = '#6f6d69'; c.fillRect(0, h * .9, w, h * .1); });
    const izq = api.canvasTex(1024, 128, (c, w, h) => { c.fillStyle = '#5b6066'; c.fillRect(0, 0, w, h); const cs = ['#6f93c4', '#e0956a', '#f1f2ef', '#5679ad'];
      for (let i = 0; i < 26; i++) { c.fillStyle = cs[i % 4]; c.globalAlpha = .8; const x = i * 40, y = 18 + (i % 3) * 10; c.fillRect(x, y, 26 + (i % 2) * 14, 50); } c.globalAlpha = 1;
      c.fillStyle = '#8f8e89'; c.fillRect(0, h * .78, w, h * .22); });
    const trin = api.canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#a6a5a0'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < w; x += 64) c.fillRect(x, 0, 2, h);
      c.fillStyle = '#c95a63'; c.fillRect(0, h * .78, w, h * .22); });
    for (const t of [der, izq, trin]) t.wrapS = THREE.RepeatWrapping;
    const mk = (tex, col) => new THREE.MeshBasicMaterial({ map: tex, color: col, side: THREE.DoubleSide });
    const mDer = mk(der, base), mIzq = mk(izq, 0xe6e6e6), mTrin = mk(trin, 0xd6d6d6);
    // banda de pared entre km a y b, a un lado (sd = +1 izquierda, −1 derecha); altura como la del motor (rampa en las trincheras)
    const pared = (a, b, sd, mat, uLen) => { const p = [], uv = [], ix = []; const n = Math.max(2, Math.round((b - a) * 1000 / 2)); for (let i = 0; i <= n; i++) {
        const km = a + (b - a) * i / n, r = api.routeAt(km), hh = km < T.km1 ? H * (km - T.km0) / (T.km1 - T.km0) : km > T.km2 ? H * (T.km3 - km) / (T.km3 - T.km2) : H;
        const x = r.x + r.lx * hw * sd, z = r.z + r.lz * hw * sd, u = (km - a) * 1000 / uLen; p.push(x, r.y - .3, z, x, r.y + Math.max(.4, hh) - .02, z); uv.push(u, 0, u, 1);
        if (i) { const k = (i - 1) * 2; ix.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); } }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(ix);
      const m = new THREE.Mesh(geo, mat); m.castShadow = false; m.receiveShadow = false; g.add(m); };
    pared(T.km0 + .002, T.km1, 1, mTrin, 12); pared(T.km0 + .002, T.km1, -1, mTrin, 12);
    pared(T.km1, T.km2, -1, mDer, 22); pared(T.km1, T.km2, 1, mIzq, 22);
    pared(T.km2, T.km3 - .002, 1, mTrin, 12); pared(T.km2, T.km3 - .002, -1, mTrin, 12);
    // (auditoría 19-nov) cielo raso reticulado claro bajo el techo oscuro del motor (f_0387: retícula gris clara bien iluminada, no un hueco negro)
    { const ret = api.canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#c9c8c2'; c.fillRect(0, 0, w, h); c.fillStyle = '#8d8c87'; c.fillRect(0, 0, w, 10); c.fillRect(0, 0, 10, h); c.fillStyle = '#e4e3dd'; c.fillRect(20, 20, w - 30, h - 30); });
      ret.wrapS = ret.wrapT = THREE.RepeatWrapping; const mR = new THREE.MeshBasicMaterial({ map: ret, side: THREE.DoubleSide, color: 0xd8d8d8 });
      api.onFrame(st => { mR.color.setScalar(.85 - .45 * st.noche); });
      const p = [], uv = [], ix = []; const n = Math.max(2, Math.round((T.km2 - T.km1) * 1000 / 3)); for (let i = 0; i <= n; i++) { const km = T.km1 + (T.km2 - T.km1) * i / n, r = api.routeAt(km), u = (km - T.km1) * 1000 / 2.4;
        for (const sd of [1, -1]) p.push(r.x + r.lx * hw * sd, r.y + H - .12, r.z + r.lz * hw * sd); uv.push(0, u, hw * 2 / 2.4, u); if (i) { const k = (i - 1) * 2; ix.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); } }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(ix);
      const m = new THREE.Mesh(geo, mR); m.castShadow = m.receiveShadow = false; g.add(m); }
    // lámparas colgadas del reticulado (f_0387)
    const lamp = api.glow(0xfff4dc, { dia: 1.2, noche: 1.6 }); for (let km = T.km1 + .02; km < T.km2; km += .04) { const r = api.routeAt(km); add(new THREE.SphereGeometry(.28, 10, 8), lamp, r.x, r.y + H - .6, r.z); }
  } }

  // ───────── Av. Francisco Solano: Centro Residencial Solano (km 40,38–40,52 der.; f_0372–f_0373) ─────────
  // Tres torres de ladrillo naranja con celosía de huecos cuadrados muy tupida y, delante, el basamento escalonado de bandas
  // de ladrillo con jardineras y palmeras. Las huellas genéricas se quitan en fx/correcciones/meta.js y aquí se levantan
  // sobre la misma planta, con la textura de celosía repartida por metro (no se estira).
  { const lad = '#b9694c';
    const celo = (emis) => (c, w, h) => { c.fillStyle = emis ? '#000' : lad; c.fillRect(0, 0, w, h); const n = 4, cw = w / n, ch = h / 2;
      for (let r = 0; r < 2; r++) for (let k = 0; k < n; k++) { const x = k * cw + cw * .2, y = r * ch + ch * .2, s = cw * .6;
        if (emis) { if ((r * 7 + k * 3) % 5 === 0) { c.fillStyle = '#ffd9a0'; c.fillRect(x, y, s, s); } }
        else { c.fillStyle = '#3a1f16'; c.fillRect(x, y, s, s); c.fillStyle = 'rgba(255,220,190,.18)'; c.fillRect(x - 2, y + s, s + 4, 3); } } };
    const tC = api.canvasTex(128, 64, celo(false)), tE = api.canvasTex(128, 64, celo(true));
    for (const t of [tC, tE]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    const mCelo = new THREE.MeshStandardMaterial({ map: tC, emissiveMap: tE, emissive: 0xffffff, emissiveIntensity: 0, roughness: .9 });
    api.onFrame(st => { mCelo.emissiveIntensity = 1.1 * st.noche; });
    const bandas = api.canvasTex(64, 128, (c, w, h) => { c.fillStyle = '#a8644a'; c.fillRect(0, 0, w, h); c.fillStyle = '#4a3a33'; for (let y = 0; y < h; y += 32) c.fillRect(0, y + 22, w, 6);
      c.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < h; y += 4) c.fillRect(0, y, w, 1); });
    bandas.wrapS = bandas.wrapT = THREE.RepeatWrapping;
    const mBand = new THREE.MeshStandardMaterial({ map: bandas, roughness: .9 }), techo = api.concrete(0x8a6a5a);
    // tile: metros que cubre la textura una vez (ancho, alto)
    extruir(10.495021, -66.875112, 62, mCelo, techo, 4.8, 6.4);   // la torre más cercana a la acera
    extruir(10.495023, -66.875313, 85, mCelo, techo, 4.8, 6.4);
    extruir(10.495052, -66.875532, 85, mCelo, techo, 4.8, 6.4);
    // basamento escalonado (auditoría 19-nov: antes era la huella OSM extruida como una caja de 12 m). En f_0373 son tres terrazas de ladrillo
    // que retroceden hacia las torres, cada una con su banda oscura bajo la losa y una jardinera corrida en el borde; sigue la acera de 40,385 a 40,515.
    { const tierTex = api.canvasTex(64, 128, (c, w, h) => { c.fillStyle = '#ad674b'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(60,25,15,.22)'; for (let y = 0; y < h; y += 6) c.fillRect(0, y, w, 1);
        c.fillStyle = '#3f312b'; c.fillRect(0, 0, w, 22); c.fillStyle = '#c99a7c'; c.fillRect(0, 22, w, 4); });
      const mT = new THREE.MeshStandardMaterial({ map: tierTex, roughness: .9 }), mL = api.concrete(0xa8644a), mTop = api.concrete(0x8f8a80), mJ = api.concrete(0x7a5a48), mVerde = api.concrete(0x4f7a3a, { roughness: 1 });
      const tiers = [[10, 15, 3.6], [15, 20.5, 7.2], [20.5, 27, 10.8]];   // [lat0, lat1, alto]: lat en m a la derecha del eje
      const kA = 40.385, kB = 40.515, n = Math.round((kB - kA) * 1000 / 4.2);
      for (let i = 0; i < n; i++) { const km = kA + (i + .5) * (kB - kA) / n, P = enRuta(km, 0, -.9), L = (kB - kA) * 1000 / n + .35;
        for (const [a, b, H] of tiers) { const hh = H + .9;
          add(new THREE.BoxGeometry(L, hh, b - a), [mL, mL, mTop, mTop, mL, mT], 0, hh / 2, (a + b) / 2, P);   // la cara −Z (hacia la calle) lleva las bandas
          add(new THREE.BoxGeometry(L, .7, .9), [mJ, mJ, mVerde, mJ, mJ, mJ], 0, hh + .35, a + .45, P); } }   // jardinera en el borde de la terraza
    }
    // letrero verde «Pza. Venezuela / Av. Casanova / Bello Monte» en su poste, frente a las torres (f_0373)
    { const P = enRuta(40.43, -(api.ROAD_W / 2 + 1.2)), t = api.canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#1f7a4a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12);
        c.fillStyle = '#fff'; c.font = 'bold 26px sans-serif'; c.fillText('↑ Pza. Venezuela', 18, 42); c.fillText('↑ Av. Casanova', 18, 76); c.fillText('← Bello Monte', 18, 110); });
      add(new THREE.CylinderGeometry(.07, .07, 4.4, 8), galv, 0, 2.2, 0, P);
      const s = add(new THREE.BoxGeometry(.06, 1.1, 2.2), [new THREE.MeshStandardMaterial({ map: t, roughness: .5 }), galv, galv, galv, galv, galv], 0, 4.2, -1, P); s.rotation.y = Math.PI / 2; }
  }

  // ───────── Av. Solano: paso peatonal de colores en la bocacalle del km 40,205 (f_0371) ─────────
  // barras amarillas, azules y blancas sobre el cruce que el motor ya pone en esa bocacalle (se le monta encima)
  { const t = api.canvasTex(512, 128, (c, w, h) => { c.clearRect(0, 0, w, h); const cs = ['#f2c21b', '#2f6fc4', '#f4f2ec']; const n = 21, bw = w / n;
      for (let i = 0; i < n; i += 2) { c.fillStyle = cs[(i / 2) % 3]; c.fillRect(i * bw + 1, 4, bw - 2, h - 8); } });
    const m = new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, roughness: .85, polygonOffset: true, polygonOffsetFactor: -12, polygonOffsetUnits: -28 });
    const r = api.routeAt(40.205), p = add(new THREE.PlaneGeometry(14, 4.2), m, r.x, r.y + .11, r.z);
    p.rotation.order = 'YXZ'; p.rotation.y = Math.atan2(r.tx, r.tz) + Math.PI; p.rotation.x = -Math.PI / 2; p.renderOrder = 5; }

  // ───────── Av. Solano: fachada neoclásica de la iglesia (km 40,55 der.; f_0374) ─────────
  // la huella genérica da el volumen blanco; aquí van el relieve que la distingue: zócalo, pilastras, cornisa, frontón, portada en arco y ventanas en arco
  { const f = fachada(10.4950878, -66.8760309, 40.56);   // punto dentro del poly alineado con la acera (fx/correcciones/meta.js) y fuera de la huella OSM vieja
    if (f) { const G = new THREE.Group(); G.position.set(f.x, f.y, f.z); G.rotation.y = f.ang; g.add(G);
      const W = Math.min(f.len, 20), H = 11, bl = api.concrete(0xf1eee6), cr = api.concrete(0xd9cdb4), osc = api.concrete(0x2b2622);
      add(new THREE.BoxGeometry(W, 1.1, .35), cr, 0, .55, .17, G);                                   // zócalo
      for (const u of [-.48, -.17, .17, .48]) add(new THREE.BoxGeometry(.7, H - 1.1, .3), bl, u * W, 1.1 + (H - 1.1) / 2, .15, G);   // pilastras
      add(new THREE.BoxGeometry(W + .6, .55, .7), cr, 0, H, .35, G);                                 // cornisa
      const fr = new THREE.Shape(); fr.moveTo(-W * .36, 0); fr.lineTo(W * .36, 0); fr.lineTo(0, 3.2); fr.lineTo(-W * .36, 0);
      add(new THREE.ExtrudeGeometry(fr, { depth: .5, bevelEnabled: false }), bl, 0, H + .27, .05, G);   // frontón
      const arco = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.lineTo(-w / 2, 0); return new THREE.ShapeGeometry(s, 12); };
      add(arco(3.2, 5.6), osc, 0, 0, .04, G);                                                        // portada
      const marco = new THREE.Shape(); marco.moveTo(-2.3, 0); marco.lineTo(2.3, 0); marco.lineTo(2.3, 4.0); marco.absarc(0, 4.0, 2.3, 0, Math.PI, false); marco.lineTo(-2.3, 0);
      marco.holes.push(new THREE.Path().moveTo(-1.6, 0).lineTo(1.6, 0).lineTo(1.6, 4.0).absarc(0, 4.0, 1.6, 0, Math.PI, false).lineTo(-1.6, 0));
      add(new THREE.ExtrudeGeometry(marco, { depth: .35, bevelEnabled: false, curveSegments: 12 }), cr, 0, 0, 0, G);   // jambas y arquivolta
      for (const u of [-.32, .32]) for (const y of [1.8, 6.4]) add(arco(1.3, 2.6), osc, u * W, y, .04, G);   // ventanas en arco
    } }

  // extruye la huella del generador que contiene (lat, lon) hasta h m con paredes de UV por metro; techo plano
  function extruir(lat, lon, h, mPared, mTecho, tw, th) {
    const p = api.xz(lat, lon); let f = null;
    for (const e of api.D.edif || []) { const q = e[2], n = q.length / 2; if (n < 3 || Math.abs(q[0] - p.x) > 200 || Math.abs(q[1] - p.z) > 200) continue; let ins = false;
      for (let i = 0, j = n - 1; i < n; j = i++) { const xi = q[i * 2], zi = q[i * 2 + 1], xj = q[j * 2], zj = q[j * 2 + 1]; if ((zi > p.z) !== (zj > p.z) && p.x < (xj - xi) * (p.z - zi) / (zj - zi) + xi) ins = !ins; }
      if (ins) { f = q; break; } }
    if (!f) { console.error('zona_meta: sin huella en', lat, lon); return; }
    const n = f.length / 2; let lo = Infinity, cx = 0, cz = 0; for (let i = 0; i < n; i++) { lo = Math.min(lo, suelo(f[i * 2], f[i * 2 + 1])); cx += f[i * 2]; cz += f[i * 2 + 1]; }
    cx /= n; cz /= n; const y0 = lo - 1.5, y1 = suelo(cx, cz) + h, pos = [], uv = [], ix = []; let u = 0;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n, ax = f[i * 2], az = f[i * 2 + 1], bx = f[j * 2], bz = f[j * 2 + 1], L = Math.hypot(bx - ax, bz - az), k = pos.length / 3;
      pos.push(ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y1, az); uv.push(u / tw, 0, (u + L) / tw, 0, (u + L) / tw, (y1 - y0) / th, u / tw, (y1 - y0) / th); u += L;
      ix.push(k, k + 1, k + 2, k, k + 2, k + 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(ix); geo.computeVertexNormals();
    mPared.side = THREE.DoubleSide; mTecho.side = THREE.DoubleSide;   // la planta OSM no trae un sentido de giro fijo
    const pared = new THREE.Mesh(geo, mPared); g.add(pared);
    const sh = new THREE.Shape(); for (let i = 0; i < n; i++) (i ? sh.lineTo : sh.moveTo).call(sh, f[i * 2], f[i * 2 + 1]);
    const tg = new THREE.ShapeGeometry(sh); tg.rotateX(Math.PI / 2); const t = new THREE.Mesh(tg, mTecho); t.position.y = y1; g.add(t);
    return pared;
  }

  // fachada(lat, lon, km): la arista de la huella (D.edif) que contiene el punto y mira hacia la ruta; el plano queda 0,2 m por fuera
  function fachada(lat, lon, km) {
    const p = api.xz(lat, lon), r = api.routeAt(km); let best = null;
    for (const e of api.D.edif || []) { const f = e[2], n = f.length / 2; if (n < 3) continue; let inside = false;
      for (let i = 0, j = n - 1; i < n; j = i++) { const xi = f[i * 2], zi = f[i * 2 + 1], xj = f[j * 2], zj = f[j * 2 + 1]; if ((zi > p.z) !== (zj > p.z) && p.x < (xj - xi) * (p.z - zi) / (zj - zi) + xi) inside = !inside; }
      if (!inside) continue;
      for (let i = 0; i < n; i++) { const j = (i + 1) % n, ax = f[i * 2], az = f[i * 2 + 1], bx = f[j * 2], bz = f[j * 2 + 1], mx = (ax + bx) / 2, mz = (az + bz) / 2, d = Math.hypot(mx - r.x, mz - r.z), len = Math.hypot(bx - ax, bz - az);
        if (len > 8 && (!best || d < best.d)) { let nx = -(bz - az) / len, nz = (bx - ax) / len; if ((r.x - mx) * nx + (r.z - mz) * nz < 0) { nx = -nx; nz = -nz; }
          best = { d, len, x: mx + nx * .2, z: mz + nz * .2, ang: Math.atan2(nx, nz) }; } }
      break; }
    if (best) best.y = suelo(best.x, best.z);
    return best;
  }
  return api.sombras(g);
}
