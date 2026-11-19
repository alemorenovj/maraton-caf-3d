// Gente: corredores y público instanciados, con esqueleto animado en el vertex shader (nada de una malla con huesos por persona).
// · Cuerpo: cortes transversales torneados (tronco que se estrecha a la cintura, glúteos, cuádriceps, gemelos, deltoides), cabeza de
//   1/7,8 de la estatura con mandíbula, orejas y nariz; normales suaves calculadas aquí. Pelo (corto, cola, moño, trenza), gorra o
//   visera, lentes, franela o esqueleto, short suelto o licra, medias de tres alturas, zapatilla con suela y franja, dorsal en el
//   pecho y en la espalda con un número distinto por corredor (los dígitos se componen en el shader desde un atlas de 512×640).
// · Zancada: curvas de cadera, rodilla y tobillo por fotogramas clave (Catmull-Rom periódica) para correr y para caminar; apoyo y
//   fase de vuelo, el pie de apoyo pegado al suelo (la pelvis baja lo que haga falta), braceo cruzado con codo a ~90°, giro de pelvis
//   y contragiro de hombros, tronco inclinado. Cadencia según la velocidad (≈170–190 pasos/min), zancada más corta en subida,
//   fatiga (encorva, baja la cadencia, braceo pesado) y paso de caminar.
// · Tres niveles de detalle por distancia a la cámara (cerca / media / lejos) con tope de instancias por calidad, descarte por
//   encuadre y una mancha de sombra de contacto bajo cada persona (una sola llamada para todas).
// Interfaz: makeGente(n, ctx) → { color(i, …), set(i, x, y, z, rumbo, fase, escala), commit(n) }; makeHero(ctx) → { group, update({ fase,
// pausado, dt, v, pendiente, fatiga?, caminando? }) }; install(ctx) pone el público. Pruebas: hero.userData.forzar = { fatiga, caminando }.
export const meta = { id: 'gente', reemplaza: [] };

const mul = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
// material por vértice
const M = { skin: 0, top: 1, shorts: 2, shoe: 3, sole: 4, hair: 6, cap: 7, bib: 8, sleeve: 9, glasses: 10, watch: 11, accent: 12, pony: 13, face: 14, bun: 15, braid: 16, hand: 17, brim: 18, bibB: 19, band: 20, flask: 22, vest: 23 };
const B = { pelvis: 0, torso: 1, head: 2, thighL: 3, shinL: 4, footL: 5, thighR: 6, shinR: 7, footR: 8, uarmL: 9, farmL: 10, uarmR: 11, farmR: 12 };

// ───────── Geometría (modelo de 1,75 m, pies en y=0, mirando a +Z; +X es la izquierda del corredor) ─────────
// det: 0 lejos (silueta), 1 media, 2 cerca, 3 héroe. q multiplica los segmentos.
const TORSO = [[.99, .152, .098, .104], [1.06, .142, .093, .1], [1.14, .145, .099, .1], [1.22, .155, .11, .104], [1.29, .165, .119, .108], [1.35, .171, .114, .106], [1.40, .167, .1, .098], [1.435, .138, .082, .085], [1.46, .092, .064, .07]];
const TSQ = .88;
export function buildBody(THREE, { q = 1, det = 2 } = {}) {
  const P = [], UV = [], BM = [], I = [];
  const near = det >= 2, mid = det >= 1, hero = det >= 3;
  const S = n => Math.max(4, Math.round(n * q));
  const v = (x, y, z, bone, mat, side, u = 0, w = 0, mw = 0) => { P.push(x, y, z); UV.push(u, w); BM.push(bone, mat, mw, side); return P.length / 3 - 1; };
  const se = (s, p) => Math.sign(s) * Math.pow(Math.abs(s), p);
  // sólido torneado: secciones [y, rx, rz delante, rz detrás, dx, dz]
  function loft(bone, mat, side, cx, cz, secs, segs, { top = false, bot = false, sq = 1, mw = null } = {}) {
    secs = secs.slice().sort((a, b) => a[0] - b[0]); if (!mid && secs.length > 4) secs = secs.filter((s, i) => i % 2 === 0 || i === secs.length - 1);
    const n = S(segs), base = P.length / 3, R = secs.length;
    for (const s of secs) for (let j = 0; j < n; j++) {
      const a = j / n * Math.PI * 2, sa = Math.sin(a), ca = Math.cos(a), x = cx + (s[4] || 0) + se(sa, sq) * s[1], z = cz + (s[5] || 0) + se(ca, sq) * (ca > 0 ? s[2] : s[3]);
      v(x, s[0], z, bone, typeof mat === 'function' ? mat(s[0], a) : mat, side, 0, 0, mw ? mw(s[0], a) : 0);
    }
    for (let i = 0; i < R - 1; i++) for (let j = 0; j < n; j++) { const a = base + i * n + j, b = base + i * n + (j + 1) % n; I.push(a, b, a + n, b, b + n, a + n); }
    const cap = (i, up) => { const s = secs[i], c = v(cx + (s[4] || 0), s[0] + (up ? 1 : -1) * Math.min(s[1], s[2]) * .3, cz + (s[5] || 0) + (s[2] - s[3]) * .5, bone, typeof mat === 'function' ? mat(s[0], 0) : mat, side);
      for (let j = 0; j < n; j++) { const a = base + i * n + j, b = base + i * n + (j + 1) % n; if (up) I.push(c, a, b); else I.push(c, b, a); } };
    if (top) cap(R - 1, true); if (bot) cap(0, false);
  }
  // elipsoide (o casquete); f(x,y,z,nx,ny,nz) puede deformar y devolver [x,y,z,mat]
  function ellip(bone, mat, side, c, rx, ry, rz, ws, hs, { th0 = 0, th1 = Math.PI, f = null } = {}) {
    ws = S(ws); hs = Math.max(3, Math.round(hs * q)); const base = P.length / 3;
    for (let i = 0; i <= hs; i++) { const th = th0 + (th1 - th0) * i / hs, st = Math.sin(th), ct = Math.cos(th);
      for (let j = 0; j < ws; j++) { const ph = j / ws * Math.PI * 2, nx = st * Math.sin(ph), ny = ct, nz = st * Math.cos(ph); let p = [c[0] + nx * rx, c[1] + ny * ry, c[2] + nz * rz, mat]; if (f) p = f(p[0], p[1], p[2], nx, ny, nz) || p; v(p[0], p[1], p[2], bone, p[3] ?? mat, side); } }
    for (let i = 0; i < hs; i++) for (let j = 0; j < ws; j++) { const a = base + i * ws + j, b = base + i * ws + (j + 1) % ws; I.push(a, a + ws, b, b, a + ws, b + ws); }
  }
  // parche curvo con UV sobre una superficie (dorsales, cara): fn(u,w) → [x,y,z]
  function patch(bone, mat, cols, rows, fn, mw = null) {
    const base = P.length / 3; for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) { const u = c / cols, w = r / rows, p = fn(u, w); v(p[0], p[1], p[2], bone, mat, 0, u, w, mw ? mw(p[1], p[3] || 0) : 0); }
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const a = base + r * (cols + 1) + c, b = a + cols + 1; I.push(a, a + 1, b, a + 1, b + 1, b); }
  }
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const bust = (y, a) => Math.pow(Math.max(0, Math.cos(a)), 2) * Math.exp(-(((y - 1.285) / .06) ** 2));
  // superficie del tronco a una altura y ángulo (para pegar los dorsales)
  const torsoAt = (y, a, k = 1.012) => { let i = 0; while (i < TORSO.length - 2 && TORSO[i + 1][0] < y) i++; const A = TORSO[i], Bq = TORSO[i + 1], t = (y - A[0]) / (Bq[0] - A[0]), L = (m) => A[m] + (Bq[m] - A[m]) * t, ca = Math.cos(a);
    return [se(Math.sin(a), TSQ) * L(1) * k, y, se(ca, TSQ) * (ca > 0 ? L(2) : L(3)) * k + (ca > 0 ? .002 : -.002), a]; };

  // pelvis (short)
  loft(B.pelvis, M.shorts, 0, 0, 0, [[.835, .12, .07, .086], [.88, .158, .088, .11], [.94, .168, .098, .12], [1.0, .162, .098, .108], [1.05, .153, .097, .101]], 16, { bot: true, sq: .9 });
  // tronco (franela) y cuello
  loft(B.torso, M.top, 0, 0, 0, TORSO, 18, { top: true, sq: TSQ, mw: bust });
  loft(B.torso, M.skin, 0, 0, .006, [[1.42, .05, .052, .054], [1.5, .046, .047, .049], [1.565, .047, .046, .05]], 10);
  // dorsales (pecho y espalda); el número lo pone el shader
  if (mid) {
    patch(B.torso, M.bib, near ? 6 : 3, 1, (u, w) => torsoAt(1.1 + w * .15, (u - .5) * 1.25), bust);
    patch(B.torso, M.bibB, near ? 6 : 3, 1, (u, w) => torsoAt(1.12 + w * .15, Math.PI + (u - .5) * 1.25));
  }
  // cabeza: cráneo con mandíbula afinada, occipucio y mentón
  const HY = 1.636, HC = [0, HY, .012], HR = [.076, .108, .093];
  const headF = (x, y, z, nx, ny, nz) => { let kx = 1, zz = z; if (ny < -.05) kx = 1 - .3 * sm(-.05, -.95, ny); if (nz < 0) zz = HC[2] + (z - HC[2]) * 1.05; if (ny < -.35 && nz > .2) zz += .008 * sm(.2, .8, nz); return [x * kx, y, zz, M.skin]; };
  ellip(B.head, M.skin, 0, HC, HR[0], HR[1], HR[2], 16, 12, { f: headF });
  if (mid) for (const s of [1, -1]) ellip(B.head, M.skin, 0, [s * .074, 1.628, .002], .011, .026, .018, 6, 4);
  if (near) ellip(B.head, M.skin, 0, [0, 1.62, .101], .012, .021, .017, 6, 5);
  // cara: calcomanía curva sobre el cráneo (cejas, ojos, nariz, boca; multiplica el tono de piel)
  if (mid) { const t0 = Math.acos((1.70 - HY) / HR[1]), t1 = Math.acos((1.555 - HY) / HR[1]);
    patch(B.head, M.face, near ? 8 : 4, near ? 6 : 3, (u, w) => { const th = t1 + (t0 - t1) * w, ph = -.95 + 1.9 * u, st = Math.sin(th), nx = st * Math.sin(ph), ny = Math.cos(th), nz = st * Math.cos(ph);
      return headF(nx * HR[0] * 1.012, HY + ny * HR[1] * 1.012, HC[2] + nz * HR[2] * 1.012, nx, ny, nz); }); }
  // pelo: casquete que se hunde bajo la línea de nacimiento
  ellip(B.head, M.hair, 0, [0, HY + .004, .006], .0815, .1135, .0995, 16, 9, { th1: Math.PI * .8, f: (x, y, z, nx, ny, nz) => { const hl = 1.60 + .07 * sm(-.5, .7, nz) - .015 * Math.abs(nx); const k = .935 + .075 * sm(hl - .012, hl + .012, y); return [x * k, HY + .004 + (y - HY - .004) * k, .006 + (z - .006) * k, M.hair]; } });
  // gorra (copa + visera), visera sola (cinta + visera)
  ellip(B.head, M.cap, 0, [0, HY + .018, .004], .0875, .09, .1005, 14, 5, { th1: Math.PI * .5 });
  if (mid) {
    const n = S(10), y0 = HY + .02; for (let lay = 0; lay < 2; lay++) { const base = P.length / 3; v(0, y0 - lay * .005, .06, B.head, M.brim, 0); for (let j = 0; j <= n; j++) { const a = -Math.PI / 2 + j / n * Math.PI; v(Math.sin(a) * .09, y0 - .016 * Math.cos(a) - lay * .005, .06 + Math.cos(a) * .1, B.head, M.brim, 0); }
      for (let j = 0; j < n; j++) { if (!lay) I.push(base, base + 1 + j, base + 2 + j); else I.push(base, base + 2 + j, base + 1 + j); } }
    loft(B.head, M.band, 0, 0, .006, [[HY + .015, .085, .1, .097], [HY + .045, .085, .1, .097]], 14);
  }
  // cola de caballo, moño y trenza
  if (mid) {
    ellip(B.head, M.pony, 0, [0, 1.6, -.112], .03, .075, .034, 7, 5, { f: (x, y, z) => [x * (y < 1.58 ? .8 : 1), y, z - (1.635 - y) * .3, M.pony] });
    ellip(B.head, M.bun, 0, [0, 1.71, -.072], .043, .039, .043, 8, 5);
    for (let k = 0; k < (near ? 5 : 3); k++) { const kk = near ? k : k * 1.6; ellip(B.head, M.braid, 0, [0, 1.6 - kk * .045, -.11 - kk * .007], .02 - kk * .002, .029, .019, 5, 4); }
    // lentes deportivos envolventes
    const n = S(10), base = P.length / 3; for (let j = 0; j <= n; j++) { const a = -1.05 + 2.1 * j / n; for (const y of [1.624, 1.653]) v(Math.sin(a) * .0835, y, .014 + Math.cos(a) * .1, B.head, M.glasses, 0); }
    for (let j = 0; j < n; j++) { const a = base + j * 2; I.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  // piernas: muslo con cuádriceps, rodilla, pierna con gemelo, tobillo; zapatilla
  for (const s of [1, -1]) {
    const L = s > 0, x = s * .09, th = L ? B.thighL : B.thighR, sh = L ? B.shinL : B.shinR, ft = L ? B.footL : B.footR;
    if (mid) loft(th, M.shorts, s, x, -.004, [[.765, .088, .091, .094], [.84, .093, .096, .1], [.93, .094, .097, .104]], 12);
    loft(th, M.skin, s, x, 0, [[.49, .05, .054, .05], [.55, .055, .062, .054], [.62, .062, .072, .062], [.70, .07, .08, .07], [.78, .077, .086, .078], [.86, .083, .088, .084], [.95, .085, .087, .086]], 12);
    if (mid) ellip(sh, M.skin, s, [x, .5, .008], .05, .05, .052, 9, 6);
    loft(sh, M.skin, s, x, 0, [[.072, .03, .032, .034], [.12, .03, .028, .034], [.18, .033, .03, .04], [.25, .04, .034, .05], [.32, .047, .038, .063], [.38, .05, .042, .066], [.44, .05, .046, .058], [.505, .049, .05, .05]], 12, { bot: !mid });
    // zapatilla: suela plana, talón redondo, puntera baja y levantada, franja lateral
    ellip(ft, M.shoe, s, [x, .046, .068], .043, .047, .13, 12, 8, { f: (px, py, pz, nx, ny, nz) => {
      let y = Math.max(py, .004); const t = (pz - .07) / .138; if (t > .3) y = .004 + (y - .004) * (1 - (t - .3) * .8); if (y > .076) y = .076 + (y - .076) * .4; if (t > .8 && ny < 0) y += (t - .8) * .05;
      const m = y < .022 ? M.sole : (mid && Math.abs(nx) > .75 && y > .028 && y < .056 && t < .45 && t > -.6) ? M.accent : M.shoe; return [x + (px - x) * (t < -.5 ? .9 : 1), y, pz, m]; } });
  }
  // brazos: deltoides, brazo, codo, antebrazo que se afina a la muñeca, mano recogida
  for (const s of [1, -1]) {
    const L = s > 0, x = s * .185, ua = L ? B.uarmL : B.uarmR, fa = L ? B.farmL : B.farmR;
    ellip(ua, M.skin, s, [x * .96, 1.41, -.008], .049, .054, .054, mid ? 10 : 5, mid ? 6 : 3);
    loft(ua, M.skin, s, x, -.01, [[1.125, .036, .037, .037], [1.2, .039, .042, .04], [1.28, .044, .048, .045], [1.36, .048, .051, .05], [1.42, .05, .052, .052]], 10);
    if (mid) { ellip(ua, M.sleeve, s, [x * .95, 1.405, -.008], .055, .058, .059, 10, 5, { th1: Math.PI * .6 }); loft(ua, M.sleeve, s, x, -.01, [[1.29, .052, .055, .054], [1.36, .055, .058, .057], [1.42, .056, .059, .058]], 10); }
    if (mid) ellip(fa, M.skin, s, [x, 1.13, -.01], .036, .038, .037, 8, 5);
    loft(fa, M.skin, s, x, -.01, [[.875, .024, .022, .026], [.92, .027, .026, .029], [.99, .034, .034, .036], [1.06, .038, .038, .04], [1.13, .036, .037, .037]], 10, { top: !mid });
    ellip(fa, M.hand, s, [x - s * .004, .835, .002], .022, .042, .033, 8, 6);
    if (near) ellip(fa, M.hand, s, [x - s * .014, .857, .024], .009, .021, .01, 5, 4);
    if (hero && L) { loft(fa, M.watch, s, x, -.01, [[.9, .029, .028, .031], [.925, .03, .029, .032]], 12); ellip(fa, M.watch, s, [x + .027, .913, -.01], .006, .017, .016, 8, 4); }
  }
  // chaleco de hidratación del héroe: dos frascos al pecho y el bolsillo de la espalda
  if (hero) { for (const s of [1, -1]) ellip(B.torso, M.flask, 0, [s * .068, 1.262, .121], .027, .052, .024, 10, 7); ellip(B.torso, M.vest, 0, [0, 1.25, -.105], .098, .11, .03, 14, 8); }

  // normales suaves (promedio ponderado por área)
  const Nn = new Float32Array(P.length);
  for (let t = 0; t < I.length; t += 3) { const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3, ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], wx = P[c] - P[a], wy = P[c + 1] - P[a + 1], wz = P[c + 2] - P[a + 2];
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx; for (const k of [a, b, c]) { Nn[k] += nx; Nn[k + 1] += ny; Nn[k + 2] += nz; } }
  for (let k = 0; k < Nn.length; k += 3) { const l = Math.hypot(Nn[k], Nn[k + 1], Nn[k + 2]) || 1; Nn[k] /= l; Nn[k + 1] /= l; Nn[k + 2] /= l; }
  if (!THREE) return { tris: I.length / 3, verts: P.length / 3, P, I, Nn };
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(Nn, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setAttribute('bm', new THREE.Float32BufferAttribute(BM, 4));
  g.setIndex(P.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(I, 1) : new THREE.Uint16BufferAttribute(I, 1));
  return g;
}

// ───────── Shader: pose por vértice ─────────
// iA: fase (rad), caminar 0–1, fatiga 0–1, amplitud de zancada · iB: complexión, mujer, gesto (0 corre, 1 aplaude, 2 saluda, 3 quieto, 4 brazos arriba), inclinación por pendiente
// iC0: franela, short, piel, zapato · iC1: pelo, gorra, medias, franja · iD: peinado, gorra(1)/visera(2), franela(0)/esqueleto(1)/top(2), lentes · iE: ruedo, alto de media, dorsal (<0 sin), bits (1 reloj, 2 chaleco)
const POSE = /* glsl */`
attribute vec4 bm; attribute vec4 iA; attribute vec4 iB; attribute vec4 iC0; attribute vec4 iC1; attribute vec4 iD; attribute vec4 iE; uniform float uTime;
varying vec3 vCol; varying float vMat; varying vec2 vTex; varying float vRough; varying vec3 vBind; varying float vNum;
#define DEG 0.01745329
mat3 rX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,s, 0.0,-s,c); }
mat3 rY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.0,-s, 0.0,1.0,0.0, s,0.0,c); }
mat3 rZ(float a){ float c = cos(a), s = sin(a); return mat3(c,s,0.0, -s,c,0.0, 0.0,0.0,1.0); }
vec3 unpackC(float v){ float r = floor(v / 65536.0); float g = floor((v - r * 65536.0) / 256.0); float b = v - r * 65536.0 - g * 256.0; return pow(vec3(r, g, b) / 255.0, vec3(2.2)); }
const float HR[8] = float[8](26.0, 12.0, -2.0, -13.0, -6.0, 14.0, 33.0, 38.0);
const float KR[8] = float[8](16.0, 42.0, 30.0, 16.0, 62.0, 102.0, 76.0, 32.0);
const float AR[8] = float[8](4.0, 18.0, 6.0, -22.0, -14.0, -2.0, 2.0, 6.0);
const float HW[8] = float[8](22.0, 14.0, 4.0, -6.0, -12.0, 0.0, 18.0, 24.0);
const float KW[8] = float[8](3.0, 16.0, 6.0, 4.0, 32.0, 58.0, 30.0, 4.0);
const float AW[8] = float[8](2.0, 6.0, 10.0, 2.0, -16.0, -6.0, 2.0, 2.0);
float cr8(float k[8], float t){ float x = fract(t) * 8.0; int i = int(x); float f = x - float(i);
  float p0 = k[(i + 7) % 8], p1 = k[i], p2 = k[(i + 1) % 8], p3 = k[(i + 2) % 8];
  return p1 + 0.5 * f * (p2 - p0 + f * (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3 + f * (3.0 * (p1 - p2) + p3 - p0))); }
void legA(float t, float walk, float amp, float fat, out float h, out float k, out float a){
  h = 12.0 + (cr8(HR, t) - 12.0) * amp * (1.0 - 0.2 * fat); k = cr8(KR, t) * (0.8 + 0.2 * amp) * (1.0 - 0.4 * fat) + 10.0 * fat; a = cr8(AR, t) * (1.0 - 0.3 * fat);
  if (walk > 0.001) { h = mix(h, 5.0 + (cr8(HW, t) - 5.0) * amp, walk); k = mix(k, cr8(KW, t), walk); a = mix(a, cr8(AW, t), walk); }
  h *= DEG; k *= DEG; a *= DEG;
}
float footLow(float h, float k, float a){ float s = h - k, f = s + a; return -0.42 * cos(h) - 0.42 * cos(s) + min(-0.075 * cos(f) - 0.065 * sin(f), -0.07 * cos(f) + 0.2 * sin(f)); }
vec3 poseP(vec3 p, vec3 n, out vec3 nOut){
  float bone = bm.x, mat = bm.y, side = bm.w;
  float ph = iA.x, walk = iA.y, fat = iA.z, amp = iA.w, build = iB.x, fem = iB.y, mode = iB.z;
  float hipW = mix(1.0, 1.07, fem) * mix(1.0, build, 0.5), shW = mix(1.0, 0.88, fem) * mix(1.0, build, 0.4), limb = build * mix(1.0, 0.9, fem);
  vec3 bind0 = p;
  // prendas y peinados que no lleva: se colapsan a un punto (triángulos de área cero)
  float hs = iD.x, hw = iD.y, top = iD.z; bool hide = false;
  if (abs(mat - 7.0) < 0.5) hide = abs(hw - 1.0) > 0.5;
  else if (abs(mat - 18.0) < 0.5) hide = hw < 0.5;
  else if (abs(mat - 20.0) < 0.5) hide = abs(hw - 2.0) > 0.5;
  else if (abs(mat - 13.0) < 0.5) hide = abs(hs - 1.0) > 0.5;
  else if (abs(mat - 15.0) < 0.5) hide = abs(hs - 2.0) > 0.5 || abs(hw - 1.0) < 0.5;
  else if (abs(mat - 16.0) < 0.5) hide = abs(hs - 3.0) > 0.5;
  else if (abs(mat - 9.0) < 0.5) hide = top > 0.5;
  else if (abs(mat - 10.0) < 0.5) hide = iD.w < 0.5;
  else if (abs(mat - 11.0) < 0.5) hide = mod(iE.w, 2.0) < 0.5;
  else if (mat > 21.5) hide = mod(floor(iE.w / 2.0), 2.0) < 0.5;
  else if (abs(mat - 8.0) < 0.5 || abs(mat - 19.0) < 0.5) hide = iE.z < 0.0 || (mat > 18.5 && mod(floor(iE.w / 2.0), 2.0) > 0.5);
  else if (abs(mat - 2.0) < 0.5 && bone > 2.5) hide = iE.x < 0.7;
  if (hide) { nOut = n; vCol = vec3(0.0); vMat = mat; vRough = 1.0; vBind = p; vNum = 0.0; vTex = vec2(0.0); return vec3(0.0, 1.62, 0.0); }
  // morfología (en reposo)
  if (bone < 0.5) { p.x *= hipW * mix(1.0, build, 0.3); p.z *= mix(1.0, build, 0.6); if (p.z < 0.0) p.z *= mix(1.0, 1.08, fem); }
  else if (bone < 1.5) {
    float wsh = smoothstep(1.2, 1.4, p.y), wlo = 1.0 - smoothstep(1.02, 1.16, p.y), wnk = smoothstep(1.43, 1.47, p.y);
    float kx = mix(mix(1.0, mix(1.0, 0.9, fem), smoothstep(1.04, 1.18, p.y)), shW, wsh); kx = mix(kx, hipW, wlo);
    p.x *= mix(kx * mix(1.0, build, 0.7), 1.0, wnk); p.z *= mix(mix(1.0, build, 0.6), 1.0, wnk); p.z += bm.z * 0.046 * fem;
  }
  else if (bone > 2.5 && bone < 8.5) { float cx = side * 0.09; p.x = cx * hipW + (p.x - cx) * limb; p.z *= mix(limb, 1.0, step(5.0, mod(bone - 3.0, 3.0) + 3.0) * 0.8); }
  else if (bone > 8.5) { float cx = side * 0.185; p.x = cx * shW + (p.x - cx) * limb; p.z = -0.01 + (p.z + 0.01) * limb; }
  // ciclo
  float t = fract(ph / 6.2831853), run = mode < 0.5 ? 1.0 : 0.0;
  float hL = 0.02, kL = 0.05, aL = 0.0, hR = 0.02, kR = 0.05, aR = 0.0, dy = -0.003;
  if (run > 0.5) {
    legA(t, walk, amp, fat, hL, kL, aL); legA(fract(t + 0.5), walk, amp, fat, hR, kR, aR);
    dy = -0.915 - min(footLow(hL, kL, aL), footLow(hR, kR, aR));
    float u = fract(2.0 * t); dy += 0.034 * amp * (1.0 - walk) * (1.0 - 0.5 * fat) * sin(3.14159 * clamp((u - 0.72) / 0.28, 0.0, 1.0));
  }
  float dh = hL - hR;
  float tw = -0.13 * dh * (1.0 - 0.5 * walk) * run, twT = 0.17 * dh * (1.0 - 0.4 * walk) * (1.0 - 0.3 * fat) * run;
  float lean = run * (mix(0.12, 0.04, walk) + iB.w + 0.24 * fat) + (1.0 - run) * 0.015;
  if (run < 0.5) { tw = 0.05 * sin(uTime * 0.7 + ph); twT = -tw * 0.6; }
  vec3 pc = vec3(0.0, 0.98, 0.0);
  mat3 Rp = rY(tw), Rt = rX(lean) * rY(twT), R = mat3(1.0);
  vec3 q = p;
  if (bone < 0.5) { q = pc + Rp * (p - pc); R = Rp; }
  else if (bone < 2.5) {
    if (bone > 1.5) { vec3 nk = vec3(0.0, 1.5, 0.0); mat3 Rh = rY(-twT * 0.85) * rX(-lean * 0.8 + 0.3 * fat * run);
      if (run < 0.5) Rh = rY(0.35 * sin(uTime * 0.31 + ph * 3.0)) * rX(-0.06);
      if (abs(mat - 13.0) < 0.5 || abs(mat - 16.0) < 0.5) { vec3 pv = vec3(0.0, 1.66, -0.1); p = pv + rZ(0.22 * sin(ph * 2.0) * run) * rX(0.12 * cos(ph * 2.0) * run) * (p - pv); }
      q = nk + Rh * (p - nk); R = Rh; }
    q = pc + Rt * (q - pc); R = Rt * R;
  }
  else if (bone < 8.5) {
    float h = side > 0.0 ? hL : hR, k = side > 0.0 ? kL : kR, a = side > 0.0 ? aL : aR;
    float hx = side * 0.09 * hipW;
    vec3 hip = vec3(hx, 0.92, 0.0), kn0 = vec3(hx, 0.5, 0.0), an0 = vec3(hx, 0.08, 0.0);
    mat3 Ra = rZ(-side * 0.03 * run), Rth = Ra * rX(-h), Rsh = Ra * rX(-(h - k)), Rft = Ra * rX(-(h - k + a));
    vec3 kn = hip + Rth * (kn0 - hip), an = kn + Rsh * (an0 - kn0);
    float seg = mod(bone - 3.0, 3.0);
    if (seg < 0.5) { q = hip + Rth * (p - hip); R = Rth; }
    else if (seg < 1.5) { q = kn + Rsh * (p - kn0); R = Rsh; }
    else { q = an + Rft * (p - an0); R = Rft; }
    q = pc + Rp * (q - pc); R = Rp * R;
  }
  else {
    // braceo: cada brazo va con la pierna contraria; codo a ~90° que se cierra al ir adelante; fatiga: más bajo, más abierto y más corto
    float hO = side > 0.0 ? hR : hL, aAmp = (1.0 - 0.35 * fat) * mix(1.0, 0.6, walk);
    float sw = run * aAmp * (hO - 0.21), sh = sw - 0.05 * run;
    float el = run * mix(1.5 + 0.3 * sw - 0.55 * fat, 0.3 + 0.12 * sw, walk) + (1.0 - run) * 0.12;
    vec3 S = vec3(side * 0.185 * shW, 1.42, -0.01), E0 = S + vec3(0.0, -0.285, 0.0);
    mat3 Rua = rZ(side * (0.1 + 0.05 * fat)) * rX(-sh), Rfa = rZ(side * 0.1) * rY(-side * 0.3 * run) * rX(-(sh + el));
    if (mode > 0.5) { float tt = uTime + ph;
      if (mode < 1.5) { float cl = 0.5 + 0.5 * sin(tt * 12.0); Rua = rZ(side * 0.05) * rY(side * 0.15) * rX(-0.6); Rfa = rY(-side * (0.55 + 0.5 * cl)) * rX(-1.7); }
      else if (mode < 2.5) { if (side < 0.0) { float wv = sin(tt * 7.0); Rua = rZ(-side * 0.4) * rX(-2.7); Rfa = rZ(-side * (0.3 + 0.45 * wv)) * rX(-2.75); } else { Rua = rZ(side * 0.08); Rfa = rZ(side * 0.06) * rX(-0.2); } }
      else if (mode < 3.5) { Rua = rZ(side * 0.07) * rX(-0.04); Rfa = rZ(side * 0.05) * rY(-side * 0.4) * rX(-0.25 - 0.9 * step(0.5, fract(ph * 7.3)) * step(side, 0.0)); }
      else { float wv = sin(tt * 5.0 + side); Rua = rZ(-side * (0.35 + 0.1 * wv)) * rX(-2.6); Rfa = rZ(-side * 0.2) * rX(-2.75 - 0.15 * wv); }
    }
    if (bone > 9.5 && bone < 10.5 || bone > 11.5) { vec3 En = S + Rua * (E0 - S); q = En + Rfa * (p - E0); R = Rfa; }
    else { q = S + Rua * (p - S); R = Rua; }
    q = pc + Rt * (q - pc); R = Rt * R;
  }
  q.y += dy;
  vBind = bind0; nOut = R * n;
  // color por material
  vec3 col = vec3(1.0); float ro = 0.8;
  if (mat < 0.5 || abs(mat - 17.0) < 0.5) { col = unpackC(iC0.z); ro = 0.42;
    if (bone > 2.5 && bone < 8.5) { if (bind0.y > iE.x) { col = unpackC(iC0.y); ro = 0.62; mat = 2.0; } else if (bind0.y < iE.y) { col = unpackC(iC1.z); ro = 0.75; mat = 5.0; } } }
  else if (mat < 1.5) { col = unpackC(iC0.x); ro = 0.72;
    bool piel = (abs(top - 1.0) < 0.5 && abs(bind0.x) > 0.112 && bind0.y > 1.31) || (abs(top - 1.0) < 0.5 && bind0.z > 0.0 && bind0.y > 1.38 && abs(bind0.x) < 0.07) || (abs(top - 2.0) < 0.5 && bind0.y < 1.2);
    if (piel) { col = unpackC(iC0.z); ro = 0.42; mat = 0.0; }
    if (mod(floor(iE.w / 2.0), 2.0) > 0.5) { float ax = abs(bind0.x); bool v = (bind0.z < 0.0 && ax < 0.115 && bind0.y > 1.12 && bind0.y < 1.40) || (ax > 0.055 && ax < 0.105 && bind0.y > 1.2) || (bind0.z > 0.0 && ax > 0.04 && ax < 0.12 && bind0.y > 1.14 && bind0.y < 1.32);
      if (v) { col = vec3(0.022, 0.03, 0.05); ro = 0.6; } } }
  else if (mat < 2.5) { col = unpackC(iC0.y); ro = 0.7; }
  else if (mat < 3.5) { col = unpackC(iC0.w); ro = 0.55; }
  else if (mat < 4.5) { col = vec3(0.8, 0.8, 0.78); ro = 0.7; }
  else if (mat < 6.5) { col = unpackC(iC1.x); ro = 0.55; }
  else if (mat < 7.5) { col = unpackC(iC1.y); ro = 0.75; }
  else if (mat < 8.5) col = vec3(1.0);
  else if (mat < 9.5) { col = unpackC(iC0.x); ro = 0.72; }
  else if (mat < 10.5) { col = vec3(0.012, 0.014, 0.02); ro = 0.12; }
  else if (mat < 11.5) { col = vec3(0.015, 0.018, 0.022); ro = 0.3; }
  else if (mat < 12.5) { col = unpackC(iC1.w); ro = 0.5; }
  else if (mat < 13.5) { col = unpackC(iC1.x); ro = 0.55; }
  else if (mat < 14.5) { col = unpackC(iC0.z); ro = 0.42; }
  else if (mat < 16.5) { col = unpackC(iC1.x); ro = 0.55; }
  else if (mat < 18.5) { col = unpackC(iC1.y); ro = 0.75; }
  else if (mat < 19.5) col = vec3(1.0);
  else if (mat < 20.5) { col = unpackC(iC1.y); ro = 0.75; }
  else if (mat < 22.5) { col = vec3(0.55, 0.62, 0.66); ro = 0.25; }
  else { col = vec3(0.022, 0.03, 0.05); ro = 0.6; }
  vCol = col; vMat = mat; vRough = ro; vNum = iE.z; vTex = uv;
  return q;
}
`;

// pliegues de tela y oclusión de contacto (axilas, entrepierna, cintura, cuello), en el espacio del cuerpo en reposo
const FRAG = /* glsl */`
vec4 diffuseColor = vec4(vCol, 1.0);
if (abs(vMat - 8.0) < 0.5 || abs(vMat - 19.0) < 0.5) {
  diffuseColor.rgb = texture2D(uAtlas, vec2(vTex.x, 0.6 + vTex.y * 0.4)).rgb;
  vec2 b = (vTex - vec2(0.1, 0.1)) / vec2(0.8, 0.55);
  if (b.x > 0.0 && b.x < 1.0 && b.y > 0.0 && b.y < 1.0) { float k = floor(b.x * 4.0); float d = mod(floor(vNum / pow(10.0, 3.0 - k) + 0.001), 10.0);
    vec2 du = vec2((d + fract(b.x * 4.0)) * 0.1, 0.4 + b.y * 0.2);
    diffuseColor.rgb *= textureGrad(uAtlas, du, dFdx(vTex) * vec2(0.5, 0.36), dFdy(vTex) * vec2(0.5, 0.36)).rgb; }
} else if (abs(vMat - 14.0) < 0.5) diffuseColor.rgb *= texture2D(uAtlas, vTex * vec2(0.5, 0.4)).rgb;
{ vec3 b = vBind; float ao = 1.0;
  if (vMat > 0.5 && vMat < 2.5 || abs(vMat - 9.0) < 0.5) {
    float w1 = sin(b.y * 90.0 + sin(b.x * 37.0) * 2.2 + b.z * 20.0), w2 = sin(b.y * 45.0 - b.x * 60.0);
    ao *= 1.0 - 0.13 * (0.5 + 0.5 * w1) * smoothstep(0.4, 1.0, w2 * 0.5 + 0.5);
    if (vMat < 1.5) { ao *= mix(1.0, 0.7, smoothstep(0.125, 0.17, abs(b.x)) * smoothstep(1.24, 1.36, b.y) * (1.0 - smoothstep(1.4, 1.45, b.y))); ao *= mix(0.8, 1.0, smoothstep(0.99, 1.03, b.y)); }
    if (vMat > 1.5 && vMat < 2.5) ao *= mix(1.0, 0.72, (1.0 - smoothstep(0.02, 0.07, abs(b.x))) * smoothstep(0.98, 0.86, b.y));
  }
  if (vMat < 0.5) ao *= mix(0.84, 1.0, smoothstep(1.49, 1.54, b.y) + step(b.y, 1.44));
  diffuseColor.rgb *= ao; }`;

function makeMat(THREE, atlas, uni) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .8, metalness: 0, envMapIntensity: .55 });
  mat.shadowSide = THREE.DoubleSide;
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, uni, { uAtlas: { value: atlas } });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + POSE)
      .replace('#include <beginnormal_vertex>', 'vec3 objectNormal; vec3 posedP = poseP(position, normal, objectNormal);')
      .replace('#include <begin_vertex>', 'vec3 transformed = posedP;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vCol; varying float vMat; varying vec2 vTex; varying float vRough; varying vec3 vBind; varying float vNum; uniform sampler2D uAtlas;')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', FRAG)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vRough;');
  };
  mat.customProgramCacheKey = () => 'gente-cuerpo-2';
  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  depth.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, uni);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + POSE).replace('#include <begin_vertex>', 'vec3 dN; vec3 transformed = poseP(position, normal, dN);');
  };
  depth.customProgramCacheKey = () => 'gente-sombra-2';
  return { mat, depth };
}

// Atlas 512×640: dorsal sin número (arriba), dígitos 0–9 (franja), cara (abajo a la izquierda)
function atlas(ctx) {
  const tex = ctx.canvasTex(512, 640, g => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 512, 640);
    // dorsal: blanco, diagonal turquesa, encabezado y marcas de chip
    g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#4DC4DA'; g.beginPath(); g.moveTo(0, 210); g.lineTo(512, 40); g.lineTo(512, 112); g.lineTo(0, 282); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(40, 72, 432, 150);
    g.fillStyle = '#1d3f8f'; g.font = '700 30px Arial, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('MARATÓN CAF', 22, 14);
    g.fillStyle = '#e4002b'; g.fillRect(438, 16, 52, 26);
    g.fillStyle = '#6b6b6b'; for (let k = 0; k < 4; k++) g.fillRect(28 + k * 120, 236, 80, 10);
    g.strokeStyle = '#c9c9c4'; g.lineWidth = 6; g.strokeRect(3, 3, 506, 250);
    // dígitos
    g.fillStyle = '#0a0a0a'; g.font = '900 112px "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let d = 0; d < 10; d++) { g.save(); g.translate(d * 51.2 + 25.6, 322); g.scale(.62, 1); g.fillText(String(d), 0, 2); g.restore(); }
    // cara (multiplica el tono de piel): cuencas, cejas, ojos, nariz, labios, mejillas
    const T = 256, X = u => u * T, Yv = w => 384 + w * T;
    const blob = (u, w, rx, ry, col) => { const gr = g.createRadialGradient(X(u), Yv(w), 1, X(u), Yv(w), rx * T); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.save(); g.translate(X(u), Yv(w)); g.scale(1, ry / rx); g.translate(-X(u), -Yv(w)); g.fillStyle = gr; g.fillRect(X(u - rx), Yv(w - rx), rx * 2 * T, rx * 2 * T); g.restore(); };
    for (const u of [.36, .64]) { blob(u, .37, .1, .06, 'rgba(150,110,95,.75)'); g.fillStyle = '#2a1a14'; g.beginPath(); g.ellipse(X(u), Yv(.375), T * .045, T * .017, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#e8e0d8'; g.beginPath(); g.ellipse(X(u + (u < .5 ? -.016 : .016)), Yv(.374), T * .014, T * .01, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#3a2418'; g.lineWidth = T * .02; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(u - .065), Yv(.31)); g.quadraticCurveTo(X(u), Yv(.285), X(u + .065), Yv(.31)); g.stroke(); }
    blob(.5, .6, .05, .07, 'rgba(170,125,105,.6)'); blob(.5, .645, .045, .02, 'rgba(120,80,65,.8)');
    g.fillStyle = 'rgba(165,95,90,.9)'; g.beginPath(); g.ellipse(X(.5), Yv(.765), T * .07, T * .022, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(90,45,40,.9)'; g.lineWidth = T * .008; g.beginPath(); g.moveTo(X(.435), Yv(.765)); g.lineTo(X(.565), Yv(.765)); g.stroke();
    blob(.14, .55, .1, .2, 'rgba(200,170,155,.55)'); blob(.86, .55, .1, .2, 'rgba(200,170,155,.55)');
  });
  tex.anisotropy = 4; return tex;
}

// sombra de contacto: mancha radial
function blobTex(THREE) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.45, 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); return t;
}

const pack = c => typeof c === 'number' ? c : c.getHex();
const pick = (r, a) => a[(r() * a.length) | 0];
const PIEL = [0xf1d0b5, 0xe6bb98, 0xdcab84, 0xd29f78, 0xc68e63, 0xc68e63, 0xb88058, 0xb07850, 0x9e6c48, 0x9a6a46, 0x86593a, 0x7a5236, 0x6e4a30, 0x5a3b26, 0x47301f];
const PELO = [0x141010, 0x141010, 0x1e1510, 0x2a1d14, 0x3b2a1d, 0x1e1510, 0x5a4330, 0x9a7a52, 0x8a8a88, 0x2a1d14];
const GORRA = [0xf4f4f2, 0x1a1a1c, 0xf4f4f2, 0x2f8cff, 0xe83a3a, 0xc6e832, 0xff8a1f, 0x1f4fbf, 0x7a7f86, 0xf4f4f2];
const SHORT = [0x141416, 0x141416, 0x141416, 0x1b1d22, 0x1c2a4a, 0x2c2f36, 0x3a3f48, 0x0f3d5c, 0x5a2a5c, 0x8a8f96];
const ZAP = [[0xf2f2ef, 0x2c6cf0], [0x1b1b1d, 0xf2f2ef], [0xff6a2a, 0x1b1b1d], [0x2c6cf0, 0xf2f2ef], [0xff3d7f, 0xf2f2ef], [0x8a8f96, 0xff6a2a], [0xe8ff3a, 0x1b1b1d], [0x16b8a6, 0xf2f2ef], [0xf2f2ef, 0xff3d7f], [0x1b1b1d, 0xe8ff3a], [0xd8d8d0, 0x16b8a6], [0xf2f2ef, 0x1b1b1d]];
const MEDIA = [0xf0f0ec, 0xf0f0ec, 0xf0f0ec, 0x1c1c1e, 0x1c1c1e, 0xff6a2a, 0x2c6cf0, 0xe8ff3a, 0xff3d7f];

// ───────── Fondo común: los tres niveles de detalle, las sombras y las fuentes (pelotón + público) ─────────
let POOL = null; const KEYS = ['iA', 'iB', 'iC0', 'iC1', 'iD', 'iE'];
function getPool(ctx) {
  if (POOL && POOL.ctx === ctx) return POOL;
  const { THREE, Q } = ctx, tier = !Q.alta ? 'ligera' : Q.media ? 'media' : 'alta';
  // topes: instancias cerca / media / lejos y radios (m) de cada nivel
  const CAP = { alta: [36, 110, 260, 24, 60, 320], media: [16, 60, 140, 20, 65, 220], ligera: [8, 36, 90, 16, 48, 160] }[tier];
  const uni = { uTime: { value: 0 } }, { mat, depth } = makeMat(THREE, atlas(ctx), uni);
  const sombras = Q.alta && !Q.media;
  const mk = (geo, n, name, cast) => {
    const a = {}; for (const k of ['iA', 'iB', 'iC0', 'iC1', 'iD', 'iE']) { a[k] = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4); a[k].setUsage(THREE.DynamicDrawUsage); geo.setAttribute(k, a[k]); }
    const mesh = new THREE.InstancedMesh(geo, mat, n); mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.customDepthMaterial = depth; mesh.frustumCulled = false; mesh.castShadow = cast; mesh.receiveShadow = sombras; mesh.name = name; mesh.count = 0; mesh.userData.noFusion = true;
    return { mesh, a, n };
  };
  const LOD = [mk(buildBody(THREE, { q: 1, det: 2 }), CAP[0], 'gente-cerca', sombras), mk(buildBody(THREE, { q: .5, det: 1 }), CAP[1], 'gente-media', sombras), mk(buildBody(THREE, { q: .3, det: 0 }), CAP[2], 'gente-lejos', false)];
  for (const L of LOD) ctx.scene.add(L.mesh);
  // sombras de contacto: una llamada para todos
  const NB = CAP[0] + CAP[1] + CAP[2] + 1, bg = new THREE.PlaneGeometry(1, 1); bg.rotateX(-Math.PI / 2);
  const bmat = new THREE.MeshBasicMaterial({ color: 0x000000, map: blobTex(THREE), transparent: true, opacity: sombras ? .34 : .5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 });
  const blobs = new THREE.InstancedMesh(bg, bmat, NB); blobs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); blobs.frustumCulled = false; blobs.name = 'gente-sombras'; blobs.count = 0; blobs.renderOrder = 1; blobs.userData.noFusion = true; ctx.scene.add(blobs);
  POOL = { ctx, THREE, CAP, uni, mat, depth, LOD, blobs, NB, src: null, nSrc: 0, nPack: 0, packCount: 0, pubBase: 0, pubCount: 0, hero: null, stats: {}, frustum: new THREE.Frustum(), m4: new THREE.Matrix4(), sph: new THREE.Sphere(), keys: null, tier };
  POOL.reserve = (nPack, nPub) => { // fuentes: matriz (16) + 6 atributos (24) por persona
    const n = nPack + nPub, old = POOL.src; POOL.src = { M: new Float32Array(n * 16), A: new Float32Array(n * 24), kind: new Uint8Array(n) }; POOL.nSrc = n; POOL.keys = new Float64Array(n);
    if (old) { POOL.src.M.set(old.M.subarray(0, Math.min(old.M.length, POOL.nPack * 16))); POOL.src.A.set(old.A.subarray(0, Math.min(old.A.length, POOL.nPack * 24))); }
    POOL.nPack = nPack; POOL.pubBase = nPack; for (let i = nPack; i < n; i++) POOL.src.kind[i] = 1;
  };
  POOL.reserve(0, 0);
  // reparte las personas visibles en los tres niveles (las más cercanas primero) y pone las sombras
  POOL.commit = () => {
    const { src, LOD, keys, CAP } = POOL, cam = ctx.camera, cp = cam.position; uni.uTime.value = performance.now() / 1000;
    POOL.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); POOL.frustum.setFromProjectionMatrix(POOL.m4);
    const rad = sombras ? 3 : 1.3; let k = 0;
    const consider = i => { const o = i * 16, x = src.M[o + 12], y = src.M[o + 13], z = src.M[o + 14], d2 = (x - cp.x) ** 2 + (y - cp.y) ** 2 + (z - cp.z) ** 2; if (d2 > CAP[5] * CAP[5]) return;
      POOL.sph.center.set(x, y + .9, z); POOL.sph.radius = rad; if (!POOL.frustum.intersectsSphere(POOL.sph)) return; keys[k++] = Math.floor(d2 * 4) * 1024 + i; };
    for (let i = 0; i < POOL.packCount; i++) consider(i);
    for (let i = 0; i < POOL.pubCount; i++) consider(POOL.pubBase + i);
    const ks = keys.subarray(0, k).sort(); const cnt = [0, 0, 0], BA = POOL.blobs.instanceMatrix.array; let nb = 0;
    for (let s = 0; s < k; s++) {
      const i = ks[s] % 1024, d = Math.sqrt(Math.floor(ks[s] / 1024) / 4);
      const lv = cnt[0] < CAP[0] && d < CAP[3] ? 0 : cnt[1] < CAP[1] && d < CAP[4] ? 1 : cnt[2] < CAP[2] ? 2 : -1; if (lv < 0) continue;
      const L = LOD[lv], j = cnt[lv]++; L.mesh.instanceMatrix.array.set(src.M.subarray(i * 16, i * 16 + 16), j * 16);
      let o = i * 24; for (const key of KEYS) { L.a[key].array.set(src.A.subarray(o, o + 4), j * 4); o += 4; }
      // mancha: alargada en el sentido de la marcha si corre
      const m = i * 16, pub = src.kind[i] === 1, wx = pub ? .62 : .6, wz = pub ? .62 : .95, b = nb++ * 16;
      BA[b] = src.M[m] * wx; BA[b + 1] = 0; BA[b + 2] = src.M[m + 2] * wx; BA[b + 3] = 0; BA[b + 4] = 0; BA[b + 5] = 1; BA[b + 6] = 0; BA[b + 7] = 0; BA[b + 8] = src.M[m + 8] * wz; BA[b + 9] = 0; BA[b + 10] = src.M[m + 10] * wz; BA[b + 11] = 0;
      BA[b + 12] = src.M[m + 12]; BA[b + 13] = src.M[m + 13] + .03; BA[b + 14] = src.M[m + 14]; BA[b + 15] = 1;
    }
    const h = POOL.hero; if (h && h.group.visible && h.group.parent) { const p = h.group.position, ry = h.group.rotation.y, c = Math.cos(ry), sn = Math.sin(ry), b = nb++ * 16;
      BA.set([c * .62, 0, -sn * .62, 0, 0, 1, 0, 0, sn * .95, 0, c * .95, 0, p.x, p.y + .03, p.z, 1], b); }
    LOD.forEach((L, lv) => { L.mesh.count = cnt[lv]; L.mesh.instanceMatrix.needsUpdate = true; for (const key in L.a) L.a[key].needsUpdate = true; });
    POOL.blobs.count = nb; POOL.blobs.instanceMatrix.needsUpdate = true;
    POOL.stats = { cerca: cnt[0], media: cnt[1], lejos: cnt[2], sombras: nb, candidatos: k };
  };
  // si el motor no llama a commit (sin pelotón), el público se reparte solo
  ctx.frameHooks.push(() => { if (!POOL.commited) POOL.commit(); POOL.commited = false; });
  window.__gente = POOL;
  return POOL;
}
// escribe una persona en las fuentes
function putSrc(i, A) { const o = i * 24; POOL.src.A.set(A, o); }

export function makeGente(n, ctx) {
  const { THREE } = ctx, r = mul(160), pool = getPool(ctx);
  pool.reserve(n, pool.nSrc - pool.nPack);
  // datos fijos de cada corredor
  const H = new Float32Array(n), CAD = new Float32Array(n), AMP = new Float32Array(n), PH = new Float32Array(n), CAM = new Float32Array(n), FATK = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const fem = r() < .4, h = fem ? .925 + (r() - .5) * .07 : 1.0 + (r() - .5) * .09; H[i] = h;
    const build = .92 + r() * .17 - (fem ? .03 : 0);
    const hs = fem ? [1, 1, 1, 1, 2, 2, 2, 3, 3, 0][(r() * 10) | 0] : (r() < .04 ? 1 : 0);
    const hw = r() < (fem ? .3 : .38) ? 1 : r() < (fem ? .22 : .08) ? 2 : 0;
    const topS = fem && r() < .07 ? 2 : r() < .27 ? 1 : 0;
    const qb = r(), hem = qb < (fem ? .4 : .74) ? .765 : qb < (fem ? .76 : .9) ? .62 : .42;
    const qs = r(), sock = qs < .4 ? .1 : qs < .86 ? .17 : .4;
    const [shoe, acc] = pick(r, ZAP), sk = pick(r, PIEL);
    const top = pick(r, [0xc6e832, 0xc6e832, 0xf8e100, 0x1f4fbf]), bot = pick(r, SHORT);
    const num = 1000 + ((r() * 8999) | 0);
    // iA iB iC0 iC1 iD iE
    putSrc(i, [r() * 6.283, 0, 0, 1, build, fem ? 1 : 0, 0, 0, top, bot, sk, shoe, pick(r, PELO), pick(r, GORRA), pick(r, MEDIA), acc, hs, hw, topS, r() < .22 ? 1 : 0, hem, sock, num, r() < .3 ? 1 : 0]);
    CAD[i] = 166 + r() * 20 + (fem ? 4 : 0); AMP[i] = .9 + r() * .18; PH[i] = r() * 6.283; CAM[i] = r() < .06 ? 26 + r() * 16 : 99; FATK[i] = .3 + r() * .7;
  }
  // Formación propia del pelotón: grupos (parejas, combos de club, "trenes") en vez de una lluvia uniforme; más apretado los primeros km
  // (misma semilla y mismo orden de sorteos que la versión anterior: la formación del pelotón no cambia)
  const rf = mul(160); for (let i = 0; i < n; i++) { const fem = rf() < .38; rf(); rf(); rf(); if (fem) rf(); else rf(); rf(); rf(); rf(); rf(); rf(); if (!(rf() < .62)) { if (!(rf() < .75)) rf(); } rf(); rf(); rf(); }
  const G = { off: [], lat: [], v: [] }, sG = new Int16Array(n), sOff = new Float32Array(n), sLat = new Float32Array(n), sPh = new Float32Array(n);
  { const r = rf; for (let i = 0; i < n;) { const g = G.off.length, size = 2 + Math.floor(Math.pow(r(), 1.4) * 13); G.off.push(-70 + 320 * Math.pow(r(), 1.35)); G.lat.push((r() - .5) * 1.6); G.v.push((r() - .5) * .45);
    for (let k = 0; k < size && i < n; k++, i++) { sG[i] = g; sOff[i] = (r() - .5) * (1.6 + size * .55); sLat[i] = (r() - .5) * (.9 + size * .2); sPh[i] = r() * 6.283; } } }
  let tPrev = performance.now(), tAcc = 0, dtF = 0, maxI = 0; const q = {};
  return {
    color(i, franela) { if (i < n) pool.src.A[i * 24 + 8] = pack(franela); },
    set(i, x, y, z, rumbo, fase, escala) {
      if (i >= n) return; const S = ctx.S, o = i * 24, SA = pool.src.A, SM = pool.src.M;
      if (i === 0) { const now = performance.now(); dtF = Math.min(.1, (now - tPrev) / 1000); tPrev = now; maxI = 0; }
      maxI = Math.max(maxI, i + 1);
      let grade = 0, km = 0;
      if (S && ctx.P) {
        if (i === 0 && !S.paused) { tAcc += dtF; for (let g = 0; g < G.off.length; g++) { G.off[g] += G.v[g] * dtF * 2; if (G.off[g] > 250) G.off[g] = -70; if (G.off[g] < -70) G.off[g] = 250; } }
        km = ctx.kmOf(S.s); const kd = .45 + .55 * Math.min(1, km / 9), g = sG[i];
        let off = (G.off[g] + sOff[i] + Math.sin(tAcc * .3 + sPh[i]) * .5) * kd;
        const s1 = Math.max(0, Math.min(ctx.TOTAL, S.s + off)); ctx.P(s1, q);
        let L = ctx.ROAD_W / 2 - .8, Rr = L; if (ctx.calzada) { const c = ctx.calzada(s1); L = Math.max(2, c.izq - c.sepAncho - c.contraria.ancho - .7); Rr = Math.max(2, c.der - .7);
          // otra pasada cerca (la otra pierna de un retorno, la vuelta por la otra calzada): cada pelotón se queda en su mitad
          if (c.libreIzq < 99) L = Math.min(L, Math.max(.5, c.libreIzq - .5)); if (c.libreDer < 99) Rr = Math.min(Rr, Math.max(.5, c.libreDer - .5)); }
        let lat = (L - Rr) / 2 + G.lat[g] * (L + Rr) * .38 + sLat[i] + Math.sin(tAcc * .21 + sPh[i] * 1.7) * .25; lat = Math.max(-Rr, Math.min(L, lat));
        if (S.cam === 3 && off > -6 && off < 5 && Math.abs(lat) < 1.6) { off += 9; ctx.P(Math.min(ctx.TOTAL, S.s + off), q); }
        else if (S.cam !== 3 && Math.abs(off) < 1.3 && Math.abs(lat) < .8) lat += lat < 0 ? -.9 : .9;
        x = q.x + q.tz * lat; z = q.z - q.tx * lat; y = q.y; rumbo = Math.atan2(q.tx, q.tz); grade = q.grade || 0;
      }
      // zancada propia: cadencia según la velocidad y la pendiente; algunos caminan al final; la fatiga crece después del km 30
      const walk = km > CAM[i] ? 1 : 0, fat = clamp((km - 28) / 14, 0, .55) * FATK[i], v = S && S.v > .3 ? S.v : 3.1;
      const spm = walk ? 108 + CAD[i] * .05 : (CAD[i] + (v - 3.1) * 7) * (1 + .004 * clamp(grade, 0, 10)) * (1 - .06 * fat);
      if (!S || !S.paused) PH[i] = (PH[i] + dtF * Math.PI * spm / 60) % 6.2832;
      if (!(S && ctx.P)) PH[i] = fase;
      SA[o] = PH[i]; SA[o + 1] = walk; SA[o + 2] = fat; SA[o + 3] = AMP[i] * (grade > 0 ? 1 - .02 * Math.min(grade, 10) : 1 + .01 * Math.min(-grade, 8));
      SA[o + 7] = walk ? 0 : clamp(grade * .011, -.05, .1);
      const sc = (escala || 1.12) / 1.12 * H[i], c = Math.cos(rumbo) * sc, sn = Math.sin(rumbo) * sc, m = i * 16;
      SM[m] = c; SM[m + 1] = 0; SM[m + 2] = -sn; SM[m + 3] = 0; SM[m + 4] = 0; SM[m + 5] = sc; SM[m + 6] = 0; SM[m + 7] = 0; SM[m + 8] = sn; SM[m + 9] = 0; SM[m + 10] = c; SM[m + 11] = 0;
      SM[m + 12] = x; SM[m + 13] = (S && ctx.P) ? y : y - Math.abs(Math.cos(fase)) * .07; SM[m + 14] = z; SM[m + 15] = 1;
    },
    commit(count) { pool.packCount = count ? Math.min(count, maxI) : 0; pool.commit(); pool.commited = true; },
  };
}

export function makeHero(ctx) {
  const { THREE } = ctx, pool = getPool(ctx);
  const geo = buildBody(THREE, { q: 1.35, det: 3 }), a = {};
  for (const k of ['iA', 'iB', 'iC0', 'iC1', 'iD', 'iE']) { a[k] = new THREE.InstancedBufferAttribute(new Float32Array(4), 4); geo.setAttribute(k, a[k]); }
  const mesh = new THREE.InstancedMesh(geo, pool.mat, 1); mesh.customDepthMaterial = pool.depth; mesh.frustumCulled = false; mesh.name = 'gente-heroe'; mesh.userData.noFusion = true;
  mesh.castShadow = ctx.Q.alta; mesh.receiveShadow = ctx.Q.alta && !ctx.Q.media;
  // el héroe: franela oficial, chaleco de hidratación azul noche con dos frascos, licra corta negra, visera blanca, lentes, reloj, zapatillas blancas con franja turquesa, dorsal 1726
  a.iB.array.set([1, 0, 0, 0]); a.iC0.array.set([0xc6e832, 0x121316, 0xc68e63, 0xf2f2ef]); a.iC1.array.set([0x1e1510, 0xf4f4f2, 0xf0f0ec, 0x16b8a6]);
  a.iD.array.set([0, 2, 0, 1]); a.iE.array.set([.62, .17, 1726, 3]); a.iA.array.set([0, 0, 0, 1]);
  mesh.instanceMatrix.array.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); mesh.count = 1;
  const group = new THREE.Group(); group.add(mesh);
  pool.hero = { group };
  let ph = 0, lean = 0, walkS = 0, fatS = 0, ampS = 1;
  const api = {
    group,
    update({ fase, pausado, dt, v, pendiente, fatiga = 0, caminando = false } = {}) {
      const f = group.userData.forzar; if (f) { if (f.fatiga != null) fatiga = f.fatiga; if (f.caminando != null) caminando = f.caminando; }
      dt = Math.min(.1, dt || .016); const g = pendiente || 0, vv = v > .3 ? v : 3.1;
      fatS += (clamp(fatiga, 0, 1) - fatS) * Math.min(1, dt * 1.5); walkS += ((caminando ? 1 : 0) - walkS) * Math.min(1, dt * 2.5);
      const spmRun = clamp(150 + 10 * vv, 160, 194) * (1 + .004 * clamp(g, 0, 10)) * (1 - .07 * fatS), spm = spmRun + (110 - spmRun) * walkS;
      if (!pausado) ph = (ph + dt * Math.PI * spm / 60) % 6.2832;
      const ampT = clamp(.78 + .08 * vv, .84, 1.12) * (g > 0 ? 1 - .02 * Math.min(g, 10) : 1 + .012 * Math.min(-g, 8)); ampS += (ampT - ampS) * Math.min(1, dt * 2);
      const want = clamp(g * .012, -.05, .12) * (1 - walkS); lean += (want - lean) * Math.min(1, dt * 3);
      a.iA.array.set([ph, walkS, fatS, ampS * (1 - .15 * fatS)]); a.iB.array[3] = lean; a.iA.needsUpdate = a.iB.needsUpdate = true;
    },
  };
  group.userData.fx = api;
  return api;
}

// Público y voluntarios quietos sobre la acera (aplauden, saludan, levantan los brazos, miran), alrededor del corredor.
// No se ponen a menos de 120 m de los puntos de animación de landmarks/animacion.js, que ya traen su público.
const ANIM_KM = [0.10, 2.95, 8.30, 12.70, 17.25, 21.10, 25.10, 31.20, 37.30, 38.00, 41.30, 41.88];
const ROPA = [0xf2f2ee, 0x1b1b1d, 0xc23b32, 0x2a5aa8, 0x8a8f96, 0x2f7a4a, 0xe8c547, 0x5b3a7a, 0xd96b2b, 0x7fb3d9, 0xf2f2ee, 0x3a4a6a];
const PANT = [0x2b3a55, 0x1b1b1d, 0x4a4036, 0x6c7a8a, 0x2b3a55, 0x3b4a66, 0xb8ab90];
export function install(ctx) {
  const pool = getPool(ctx), NS = ctx.Q.alta && !ctx.Q.media ? 110 : 60, r = mul(77);
  pool.reserve(pool.nPack, NS);
  const base = pool.pubBase, H = new Float32Array(NS), A0 = [];
  for (let i = 0; i < NS; i++) {
    const fem = r() < .5, h = fem ? .93 + (r() - .5) * .07 : 1 + (r() - .5) * .08; H[i] = h;
    const pants = r() < .6, A = [r() * 50, 0, 0, 1, .92 + r() * .22, fem ? 1 : 0, 3, 0, pick(r, ROPA), pick(r, PANT), pick(r, PIEL), pick(r, [0xf2f2ef, 0x1b1b1d, 0x8a8f96, 0x6a4a30]), pick(r, PELO), pick(r, GORRA), 0xf0f0ec, 0xf2f2ef,
      fem ? [1, 2, 0, 1][(r() * 4) | 0] : 0, r() < .3 ? 1 : 0, 0, r() < .2 ? 1 : 0, pants ? .085 : .58, .085, -1, 0];
    A0.push(A); putSrc(base + i, A);
  }
  const hash = (a, b) => { let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
  let lastS = -1e9; const o = {}, D = ctx.D, HID = (D.hidratacion || []).map(Number);
  function place(sNow) {
    lastS = sNow; let n = 0; const SM = pool.src.M;
    for (let s = Math.max(20, sNow - 120); s < Math.min(ctx.TOTAL - 20, sNow + 320) && n < NS; s += 6) {
      const si = Math.round(s / 6), km = ctx.kmOf(s); if (ANIM_KM.some(k => Math.abs(k - km) < .12) || ctx.cubierto(s) || ctx.enElevado(s)) continue;
      const vol = HID.some(k => Math.abs(k - km) < .05), dens = vol ? .8 : km < 3 || km > 39 ? .3 : .14;
      for (const side of [1, -1]) {
        if (hash(si, side + 5) > dens || !ctx.calzada) continue; const c = ctx.calzada(s), ac = side > 0 ? c.aceraIzq : c.aceraDer; if (ac < 1.2) continue;
        ctx.P(s, o); const grp = 1 + Math.floor(hash(si, side + 9) * 3);
        for (let k = 0; k < grp && n < NS; k++) {
          const d = (side > 0 ? c.izq : c.der) + .7 + hash(si * 7 + k, 3) * Math.min(1.6, ac - 1), along = (k - (grp - 1) / 2) * .7, x = o.x + o.tz * d * side + o.tx * along, z = o.z - o.tx * d * side + o.tz * along;
          if ((ctx.calzadaLibre && !ctx.calzadaLibre(x, z)) || ctx.quitado(x, z)) continue;
          const ry = Math.atan2(-o.tz * side, o.tx * side) + (hash(si, k + 11) - .5) * .8 - side * .35, sc = H[n], cs = Math.cos(ry) * sc, sn = Math.sin(ry) * sc;
          SM.set([cs, 0, -sn, 0, 0, sc, 0, 0, sn, 0, cs, 0, x, o.y + .16, z, 1], (base + n) * 16);
          const A = A0[n].slice(), hm = hash(si * 3 + k, 21); A[6] = hm < .34 ? 1 : hm < .5 ? 2 : hm < .62 ? 4 : 3;
          if (vol) { A[8] = hash(si, k) < .5 ? 0x2f8cff : 0xff7a1a; A[17] = 1; A[6] = hm < .5 ? 1 : 3; }
          putSrc(base + n, A); n++;
        }
      }
    }
    pool.pubCount = n;
  }
  ctx.frameHooks.push(() => { const s = ctx.S ? ctx.S.s : 0; if (Math.abs(s - lastS) > 40) place(s); });
  // Solo para pruebas: ?fxcam=dist,alto,ángulo(grados),fov,mirar pone una cámara de retrato alrededor del protagonista
  const m = /[?&]fxcam=([-\d.,]+)/.exec(location.search); if (!m) return;
  const [d, h, ang, fov, lk] = m[1].split(',').map(Number), cam = ctx.camera;
  ctx.frameHooks.push((n, t, dt, p) => {
    const a = Math.atan2(p.tx, p.tz) + (ang || 0) * Math.PI / 180;
    cam.position.set(p.x + Math.sin(a) * d, p.y + h, p.z + Math.cos(a) * d); cam.lookAt(p.x, p.y + (lk || Math.min(h, 1.0)), p.z); cam.updateMatrixWorld();
    if (fov && cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    if (ctx.hero) ctx.hero.visible = true;
  });
}
