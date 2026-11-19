// Gente: corredores creíbles e instanciados. Un solo draw call para todo el pelotón: el esqueleto (pelvis, tronco, cabeza,
// muslo/pierna/pie y brazo/antebrazo de cada lado) se anima en el vertex shader con un ciclo de carrera real
// (apoyo y fase de vuelo, flexión de rodilla en el recobro, braceo cruzado, giro de pelvis y hombros, tronco inclinado).
// Cuerpo de formas redondeadas con variación de estatura, complexión y género; gorra, cola de caballo, lentes, franela con
// manga o esqueleto, dorsal (blanco, diagonal turquesa #4DC4DA, número negro), shorts, medias y zapatos de color.
export const meta = { id: 'gente', reemplaza: [] };

const mul = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
// material por vértice
const M = { skin: 0, jersey: 1, shorts: 2, shoe: 3, sole: 4, sock: 5, hair: 6, cap: 7, dorsal: 8, sleeve: 9, glasses: 10, watch: 11, accent: 12, pony: 13, face: 14, bun: 15, braid: 16, hand: 17 };
const B = { pelvis: 0, torso: 1, head: 2, thighL: 3, shinL: 4, footL: 5, thighR: 6, shinR: 7, footR: 8, uarmL: 9, farmL: 10, uarmR: 11, farmR: 12 };

// ───────── Geometría del cuerpo (modelo de 1,75 m, pies en y=0, mirando a +Z; +X es la izquierda del corredor) ─────────
function buildBody(THREE, q = 1, hero = false) {
  const P = [], Nn = [], UV = [], BM = [], I = [];
  const S = n => Math.max(3, Math.round(n * q));
  const v = (x, y, z, nx, ny, nz, bone, mat, side, u = 0, w = 0, mw = 0) => { P.push(x, y, z); const l = Math.hypot(nx, ny, nz) || 1; Nn.push(nx / l, ny / l, nz / l); UV.push(u, w); BM.push(bone, mat, mw, side); return P.length / 3 - 1; };
  // tubo vertical de sección elíptica; mat puede ser función de y
  function tube(bone, mat, side, cx, cz, ys, rx, rz, segs, { zOff = null, capTop = false, capBot = false, mwf = null } = {}) {
    segs = S(segs); const base = P.length / 3, n = ys.length;
    for (let i = 0; i < n; i++) for (let j = 0; j <= segs; j++) {
      const a = j / segs * Math.PI * 2, sa = Math.sin(a), ca = Math.cos(a), x = cx + sa * rx[i], z = cz + ca * rz[i] + (zOff ? zOff[i] : 0);
      const dy = i === 0 ? 0 : i === n - 1 ? 0 : 0; const slope = (rx[Math.min(n - 1, i + 1)] - rx[Math.max(0, i - 1)]) / ((ys[Math.max(0, i - 1)] - ys[Math.min(n - 1, i + 1)]) || 1);
      v(x, ys[i], z, sa / rx[i], slope * .6 + dy, ca / rz[i], bone, typeof mat === 'function' ? mat(ys[i], a) : mat, side, 0, 0, mwf ? mwf(ys[i], a) : 0);
    }
    for (let i = 0; i < n - 1; i++) for (let j = 0; j < segs; j++) { const a = base + i * (segs + 1) + j, b = a + segs + 1; if (ys[i] > ys[i + 1]) I.push(a, b, a + 1, a + 1, b, b + 1); else I.push(a, a + 1, b, a + 1, b + 1, b); }
    const cap = (i, up) => { const c = v(cx, ys[i] + (up ? .006 : -.006), cz + (zOff ? zOff[i] : 0), 0, up ? 1 : -1, 0, bone, typeof mat === 'function' ? mat(ys[i], 0) : mat, side); for (let j = 0; j < segs; j++) { const a = base + i * (segs + 1) + j; const top = ys[0] > ys[n - 1] ? i === 0 : i === n - 1; if (top === up) I.push(c, a + 1, a); else I.push(c, a, a + 1); } };
    if (capTop) cap(ys[0] > ys[n - 1] ? 0 : n - 1, true); if (capBot) cap(ys[0] > ys[n - 1] ? n - 1 : 0, false);
  }
  // elipsoide; f(x,y,z) puede deformar cada vértice y devolver [x,y,z,mat]
  function ellip(bone, mat, side, c, rx, ry, rz, ws, hs, { th0 = 0, th1 = Math.PI, f = null } = {}) {
    ws = S(ws); hs = S(hs); const base = P.length / 3;
    for (let i = 0; i <= hs; i++) { const th = th0 + (th1 - th0) * i / hs, st = Math.sin(th), ct = Math.cos(th); for (let j = 0; j <= ws; j++) { const ph = j / ws * Math.PI * 2, nx = st * Math.sin(ph), ny = ct, nz = st * Math.cos(ph); let p = [c[0] + nx * rx, c[1] + ny * ry, c[2] + nz * rz, mat]; if (f) p = f(p[0], p[1], p[2], nx, ny, nz) || p; v(p[0], p[1], p[2], nx / rx, ny / ry, nz / rz, bone, p[3] ?? mat, side); } }
    for (let i = 0; i < hs; i++) for (let j = 0; j < ws; j++) { const a = base + i * (ws + 1) + j, b = a + ws + 1; I.push(a, b, a + 1, a + 1, b, b + 1); }
  }
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const bust = (y, a) => Math.pow(Math.max(0, Math.cos(a)), 2) * Math.exp(-(((y - 1.3) / .055) ** 2));
  // pelvis (shorts)
  tube(B.pelvis, M.shorts, 0, 0, -.005, [1.045, .99, .92, .865], [.148, .158, .163, .125], [.104, .11, .112, .088], 12, { capBot: true });
  // tronco (franela) + cuello
  const TY = [.975, 1.05, 1.14, 1.23, 1.31, 1.37, 1.42, 1.455, 1.48], TRX = [.166, .152, .152, .162, .171, .177, .168, .128, .07], TRZ = [.117, .104, .105, .112, .116, .112, .099, .084, .055];
  tube(B.torso, M.jersey, 0, 0, 0, TY, TRX, TRZ, 14, { capTop: true, mwf: bust });
  tube(B.torso, M.skin, 0, 0, .006, [1.43, 1.54], [.047, .045], [.05, .046], 8);
  // dorsal sobre el pecho, curvado con la franela
  { const cols = 5, y0 = 1.085, y1 = 1.245, base = P.length / 3; for (let r = 0; r <= 1; r++) { const y = r ? y1 : y0, rx = r ? .164 : .153, rz = r ? .113 : .106; for (let c = 0; c <= cols; c++) { const u = c / cols, a = (u - .5) * 1.3; v(Math.sin(a) * rx * 1.035, y, Math.cos(a) * rz * 1.035 + .004, Math.sin(a), 0, Math.cos(a), B.torso, M.dorsal, 0, u, r, bust(y, a)); } } for (let c = 0; c < cols; c++) { const a = base + c, b = a + cols + 1; I.push(a, a + 1, b, a + 1, b + 1, b); } }
  // cabeza: cráneo, mandíbula afinada, nariz
  const headF = (x, y, z, nx, ny, nz) => { let k = 1; if (ny < 0) k = .8 + .2 * (1 + ny); const zz = (z - .012) * (ny < -.2 ? .92 : 1) + .012; return [x * k, y, zz, M.skin]; };
  ellip(B.head, M.skin, 0, [0, 1.632, .012], .079, .106, .094, 14, 10, { f: headF });
  // cara: calcomanía curva sobre la misma superficie (cejas, ojos, nariz, boca en la textura; multiplica el tono de piel)
  { const cols = 8, rows = 6, base = P.length / 3, t0 = Math.acos((1.692 - 1.632) / .106), t1 = Math.acos((1.566 - 1.632) / .106);
    for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) { const th = t1 + (t0 - t1) * r / rows, ph = -.95 + 1.9 * c / cols, st = Math.sin(th), nx = st * Math.sin(ph), ny = Math.cos(th), nz = st * Math.cos(ph);
      const p = headF(nx * .079 * 1.012, 1.632 + ny * .106 * 1.012, .012 + nz * .094 * 1.012, nx, ny, nz); v(p[0], p[1], p[2], nx, ny, nz, B.head, M.face, 0, c / cols, r / rows); }
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const a = base + r * (cols + 1) + c, b = a + cols + 1; I.push(a, a + 1, b, a + 1, b + 1, b); } }
  if (hero) { for (const s of [1, -1]) ellip(B.head, M.skin, 0, [s * .079, 1.632, .0], .012, .028, .02, 6, 5); }
  // pelo: casquete que se hunde bajo la línea de nacimiento
  ellip(B.head, M.hair, 0, [0, 1.636, .006], .0835, .111, .099, 14, 8, { th1: Math.PI * .78, f: (x, y, z, nx, ny, nz) => { const hl = 1.598 + .07 * sm(-.5, .7, nz) - .015 * Math.abs(nx); const k = .94 + .07 * sm(hl - .012, hl + .012, y); return [x * k, 1.636 + (y - 1.636) * k, .006 + (z - .006) * k, M.hair]; } });
  // gorra: copa + visera
  ellip(B.head, M.cap, 0, [0, 1.652, .004], .089, .088, .101, 12, 4, { th1: Math.PI * .5 });
  { const n = S(10), base = P.length / 3; for (let lay = 0; lay < 2; lay++) { v(0, 1.655 - lay * .006, .07, 0, lay ? -1 : 1, .2, B.head, M.cap, 0); for (let j = 0; j <= n; j++) { const a = -Math.PI / 2 + j / n * Math.PI; v(Math.sin(a) * .088, 1.654 - .014 * Math.cos(a) - lay * .006, .07 + Math.cos(a) * .088, 0, lay ? -1 : 1, .2, B.head, M.cap, 0); } } for (let j = 0; j < n; j++) { I.push(base, base + 1 + j, base + 2 + j); const b2 = base + n + 2; I.push(b2, b2 + 2 + j, b2 + 1 + j); } }
  // cola de caballo
  ellip(B.head, M.pony, 0, [0, 1.585, -.118], .033, .078, .036, 6, 5, { f: (x, y, z) => [x, y, z - (1.62 - y) * .25, M.pony] });
  // moño y trenza
  ellip(B.head, M.bun, 0, [0, 1.705, -.07], .045, .04, .045, 7, 5);
  for (let k = 0; k < 5; k++) ellip(B.head, M.braid, 0, [0, 1.6 - k * .045, -.112 - k * .006], .021 - k * .002, .028, .02, 5, 4);
  // lentes deportivos
  { const n = 10, base = P.length / 3; for (let j = 0; j <= n; j++) { const a = -1.05 + 2.1 * j / n; for (const y of [1.624, 1.652]) v(Math.sin(a) * .085, y, .012 + Math.cos(a) * .101, Math.sin(a), 0, Math.cos(a), B.head, M.glasses, 0); } for (let j = 0; j < n; j++) { const a = base + j * 2; I.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
  // piernas
  for (const s of [1, -1]) {
    const L = s > 0, x = s * .092, th = L ? B.thighL : B.thighR, sh = L ? B.shinL : B.shinR, ft = L ? B.footL : B.footR;
    tube(th, M.shorts, s, x, 0, [.95, .86, .755], [.089, .088, .085], [.092, .09, .087], 10, { capBot: true });
    tube(th, M.skin, s, x, .004, [.77, .72, .67, .62, .57, .52, .49], [.074, .071, .068, .063, .057, .051, .048], [.078, .076, .074, .069, .062, .055, .05], 9, { zOff: [0, .005, .006, .007, .008, .006, .004] });
    ellip(sh, M.skin, s, [x, .497, .006], .05, .05, .052, 7, 5);
    tube(sh, M.skin, s, x, 0, [.52, .475, .43, .385, .34, .23, .145], [.05, .053, .055, .054, .051, .039, .032], [.052, .058, .062, .061, .058, .042, .034], 9, { zOff: [0, -.008, -.012, -.012, -.012, -.005, -.003] });
    tube(sh, M.sock, s, x, -.002, [.155, .1, .075], [.035, .035, .036], [.037, .037, .04], 9);
    // zapatilla: suela plana blanca, talón redondo, puntera baja, franja de acento
    ellip(ft, M.shoe, s, [x, .052, .072], .049, .052, .142, 10, 7, { f: (px, py, pz, nx, ny, nz) => { let y = Math.max(py, .004); const t = (pz - .072) / .142; if (t > .35) y = .004 + (y - .004) * (1 - (t - .35) * .75); if (y > .085) y = .085 + (y - .085) * .4; const m = y < .024 ? M.sole : (Math.abs(nx) > .8 && y > .03 && y < .06 && t < .3) ? M.accent : M.shoe; return [px * (pz < .02 ? .92 : 1), y, pz, m]; } });
  }
  // brazos
  for (const s of [1, -1]) {
    const L = s > 0, x = s * .185, ua = L ? B.uarmL : B.uarmR, fa = L ? B.farmL : B.farmR;
    ellip(ua, M.skin, s, [x, 1.42, -.01], .054, .05, .057, 8, 5);
    ellip(ua, M.sleeve, s, [x * .95, 1.41, -.01], .055, .05, .059, 8, 5, { th1: Math.PI * .62 });
    tube(ua, M.skin, s, x, -.01, [1.43, 1.33, 1.22, 1.135], [.049, .046, .041, .036], [.05, .048, .043, .037], 8);
    tube(ua, M.sleeve, s, x, -.01, [1.43, 1.36, 1.3], [.059, .056, .053], [.06, .057, .054], 8);
    ellip(fa, M.skin, s, [x, 1.135, -.01], .037, .037, .037, 6, 4);
    tube(fa, M.skin, s, x, -.01, [1.14, 1.04, .94, .892], [.036, .034, .027, .024], [.037, .035, .029, .025], 7);
    ellip(fa, M.hand, s, [x, .848, -.002], .024, .048, .036, 7, 5, { f: (px, py, pz) => [px, py, pz + (py < .85 ? .01 : 0), M.hand] });
    if (hero && L) { tube(fa, M.watch, s, x, -.01, [.925, .9], [.03, .03], [.031, .031], 10, { capTop: false }); ellip(fa, M.watch, s, [x + .026, .913, -.01], .006, .018, .016, 8, 4); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(Nn, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setAttribute('bm', new THREE.Float32BufferAttribute(BM, 4)); g.setIndex(I);
  return g;
}

// ───────── Shader: pose de carrera por vértice ─────────
const POSE = /* glsl */`
attribute vec4 bm; attribute vec4 iP; attribute vec4 iF; attribute vec4 iC0; attribute vec4 iC1; attribute vec4 iX; uniform float uTime;
uniform float uLean; uniform float uAmp; uniform float uCad;
varying vec3 vCol; varying float vMat; varying vec2 vDuv; varying float vRough; varying vec3 vBind;
mat3 rX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,s, 0.0,-s,c); }
mat3 rY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.0,-s, 0.0,1.0,0.0, s,0.0,c); }
mat3 rZ(float a){ float c = cos(a), s = sin(a); return mat3(c,s,0.0, -s,c,0.0, 0.0,0.0,1.0); }
float wrapA(float x){ return x - 6.2831853 * floor((x + 3.14159265) / 6.2831853); }
float gbump(float x, float c, float w){ float d = wrapA(x - c) / w; return exp(-d * d); }
vec3 unpackC(float v){ float r = floor(v / 65536.0); float g = floor((v - r * 65536.0) / 256.0); float b = v - r * 65536.0 - g * 256.0; return pow(vec3(r, g, b) / 255.0, vec3(2.2)); }
void legAng(float ph, float amp, out float f, out float k, out float a){
  f = (0.17 + 0.48 * cos(ph + 0.88)) * amp;
  k = 0.28 + (0.38 * gbump(ph, 0.9, 0.55) + 1.55 * gbump(ph, 3.7, 0.95)) * mix(0.55, 1.0, amp);
  a = 0.05 + 0.25 * gbump(ph, 1.0, 0.6) - 0.5 * gbump(ph, 2.4, 0.5);
}
vec3 poseP(vec3 p, vec3 n, out vec3 nOut){
  float bone = bm.x, mat = bm.y, side = bm.w;
  float ph = iP.x * uCad, build = iP.z, gen = iP.w, amp = uAmp;
  float sx = mix(1.0, 0.89, gen), hx = mix(1.0, 1.07, gen), limb = mix(1.0, 0.88, gen);
  // morfología (en pose de reposo)
  if (bone < 0.5) { p.x *= hx * build; p.z *= build; }
  else if (bone < 1.5) {
    float wsh = smoothstep(1.22, 1.42, p.y), wlo = 1.0 - smoothstep(1.0, 1.14, p.y);
    float k = mix(mix(1.0, mix(1.0, 0.92, gen), smoothstep(1.0, 1.1, p.y) * (1.0 - wsh)), sx, wsh); k = mix(k, hx, wlo);
    if (p.y > 1.42 && abs(p.x) < 0.06) k = 1.0;
    p.x *= k * build; p.z *= mix(build, 1.0, 0.3); p.z += bm.z * 0.042 * gen;
  }
  else if (bone > 2.5 && bone < 8.5) { float cx = side * 0.092; p.x = cx * hx * mix(1.0, build, 0.5) + (p.x - cx) * build * mix(1.0, 0.95, gen); p.z *= build * mix(1.0, 0.95, gen); }
  else if (bone > 8.5) { float cx = side * 0.185; p.x = cx * sx * mix(1.0, build, 0.6) + (p.x - cx) * build * limb; p.z = -0.01 + (p.z + 0.01) * build * limb; }
  // prendas opcionales: si no van, se colapsan dentro del cuerpo
  if (abs(mat - 7.0) < 0.5 && iF.x < 0.5) p = vec3(0.0, 1.63, 0.0);
  float hs = iX.y; vec3 bind0 = p;
  if (abs(mat - 13.0) < 0.5 && abs(hs - 1.0) > 0.5) p = vec3(0.0, 1.62, -0.03);
  if (abs(mat - 15.0) < 0.5 && (abs(hs - 2.0) > 0.5 || iF.x > 0.5)) p = vec3(0.0, 1.63, -0.03);
  if (abs(mat - 16.0) < 0.5 && abs(hs - 3.0) > 0.5) p = vec3(0.0, 1.62, -0.03);
  if (abs(mat - 17.0) < 0.5 && iX.z > 0.5) { vec3 hc = vec3(side * 0.185 * sx * mix(1.0, build, 0.6), 0.85, -0.002); p = hc + (p - hc) * vec3(0.62, 1.15, 1.08) + vec3(0.0, -0.008, 0.0); }
  if (abs(mat - 9.0) < 0.5 && iF.z < 0.5) p = vec3(side * 0.17, 1.43, -0.01);
  if (abs(mat - 10.0) < 0.5 && iF.w < 0.5) p = vec3(0.0, 1.63, 0.0);
  // ciclo de carrera
  float c0 = cos(ph + 0.88);
  float mode = iX.w, run = mode < 0.5 ? 1.0 : 0.0; amp *= run;
  float tw = -0.13 * c0 * amp, lean = (0.13 + uLean) * run + 0.03 * (1.0 - run);
  vec3 pc = vec3(0.0, 0.98, 0.0);
  mat3 Rp = rY(tw), Rt = rY(-tw * 1.5) * rX(lean), R = mat3(1.0);
  vec3 q = p;
  if (bone < 0.5) { q = pc + Rp * (p - pc); R = Rp; }
  else if (bone < 2.5) {
    if (bone > 1.5) { vec3 nk = vec3(0.0, 1.5, 0.0); mat3 Rh = rY(tw * 1.1) * rX(-lean * 0.85); q = nk + Rh * (p - nk); R = Rh; }
    q = pc + Rt * (q - pc); R = Rt * R;
  }
  else if (bone < 8.5) {
    float f, k, a; legAng(side > 0.0 ? ph : ph + 3.14159265, amp, f, k, a); if (run < 0.5) { f = 0.0; k = 0.04; a = 0.0; }
    float hxp = side * 0.092 * hx * mix(1.0, build, 0.5);
    vec3 hip = vec3(hxp, 0.92, 0.0), kn0 = vec3(hxp, 0.495, 0.0), an0 = vec3(hxp, 0.08, 0.0);
    mat3 Rth = rX(-f), Rsh = rX(-(f - k)), Rft = rX(-(f - k + a));
    vec3 kn = hip + Rth * (kn0 - hip), an = kn + Rsh * (an0 - kn0);
    float seg = mod(bone - 3.0, 3.0);
    if (seg < 0.5) { q = hip + Rth * (p - hip); R = Rth; }
    else if (seg < 1.5) { q = kn + Rsh * (p - kn0); R = Rsh; }
    else { q = an + Rft * (p - an0); R = Rft; }
    q = pc + Rp * (q - pc); R = Rp * R;
  }
  else {
    float sw = (0.08 - side * 0.48 * c0) * amp, e = 1.42 + 0.1 * sw;
    vec3 S = vec3(side * 0.185 * sx * mix(1.0, build, 0.6), 1.42, -0.01), E0 = S + vec3(0.0, -0.285, 0.0);
    mat3 Rua = rZ(side * 0.13) * rX(-sw), Rfa = rZ(side * 0.13) * rY(-side * 0.35) * rX(-(sw + e));
    if (mode > 0.5) { float tt = uTime + iP.x;
      if (mode < 1.5) { float cl = 0.5 + 0.5 * sin(tt * 13.0); Rua = rY(side * 0.05) * rZ(side * 0.08) * rX(-0.55); Rfa = rY(-side * (0.75 + 0.55 * cl)) * rX(-1.55); }
      else if (mode < 2.5 && side < 0.0) { float wv = sin(tt * 8.0); Rua = rZ(side * 0.35) * rX(-2.75); Rfa = rZ(side * (0.35 + 0.45 * wv)) * rX(-2.8); }
      else { Rua = rZ(side * 0.08) * rX(-0.05); Rfa = rZ(side * 0.06) * rX(-0.25 - (mode > 2.5 ? 0.0 : 0.0)); } }
    if (bone < 10.5 && bone > 9.5 || bone > 11.5) { vec3 En = S + Rua * (E0 - S); q = En + Rfa * (p - E0); R = Rfa; }
    else { q = S + Rua * (p - S); R = Rua; }
    q = pc + Rt * (q - pc); R = Rt * R;
  }
  q.y += (-0.032 * cos(2.0 * (ph - 0.9)) + 0.012) * amp - (1.0 - run) * 0.035;
  vBind = bind0;
  nOut = R * n;
  // color por material
  vec3 col = vec3(1.0); float ro = 0.8;
  if (mat < 0.5) { col = unpackC(iC0.z); ro = 0.36; if (bone > 2.5 && bone < 7.5 && abs(mod(bone - 3.0, 3.0) - 2.0) > 0.5 && bind0.y > iX.x) { col = unpackC(iC0.y); ro = 0.55; mat = 2.0; } }
  else if (mat < 1.5) col = unpackC(iC0.x);
  else if (mat < 2.5) { col = unpackC(iC0.y); ro = 0.7; }
  else if (mat < 3.5) { col = unpackC(iC0.w); ro = 0.55; }
  else if (mat < 4.5) { col = vec3(0.82, 0.82, 0.8); ro = 0.7; }
  else if (mat < 5.5) col = unpackC(iC1.z);
  else if (mat < 6.5) { col = unpackC(iC1.x); ro = 0.6; }
  else if (mat < 7.5) { col = unpackC(iC1.y); ro = 0.75; }
  else if (mat < 8.5) col = vec3(1.0);
  else if (mat < 9.5) col = unpackC(iC0.x);
  else if (mat < 10.5) { col = vec3(0.015); ro = 0.15; }
  else if (mat < 11.5) { col = vec3(0.02, 0.025, 0.03); ro = 0.3; }
  else if (mat < 12.5) { col = mix(unpackC(iC0.w), vec3(0.9), 0.65); ro = 0.5; }
  else if (mat < 13.5) { col = unpackC(iC1.x); ro = 0.6; }
  else if (mat < 14.5) { col = unpackC(iC0.z); ro = 0.4; }
  else if (mat < 16.5) { col = unpackC(iC1.x); ro = 0.6; }
  else { col = unpackC(iC0.z); ro = 0.4; }
  vCol = col; vMat = mat; vRough = ro;
  float di = iC1.w; vDuv = mat > 13.5 ? (uv + vec2(3.0, 0.0)) / 4.0 : (vec2(uv.x, 0.13 + uv.y * 0.74) + vec2(mod(di, 4.0), 3.0 - floor(di / 4.0))) / 4.0;
  return q;
}
`;

// pliegues de tela y oclusión de contacto (axilas, entrepierna, cintura, cuello), en el espacio del cuerpo en reposo
const FOLDS = `
{ vec3 b = vBind; float ao = 1.0;
  if (vMat > 0.5 && vMat < 2.5 || abs(vMat - 9.0) < 0.5) {
    float w1 = sin(b.y * 95.0 + sin(b.x * 37.0) * 2.2 + b.z * 20.0), w2 = sin(b.y * 47.0 - b.x * 60.0);
    float fold = 0.5 + 0.5 * w1 * smoothstep(0.4, 1.0, w2 * 0.5 + 0.5);
    float zone = vMat < 1.5 ? (smoothstep(1.16, 1.0, b.y) * 0.8 + smoothstep(0.12, 0.17, abs(b.x)) * smoothstep(1.2, 1.36, b.y) * 0.9 + 0.25) : 0.8;
    ao *= 1.0 - 0.17 * fold * zone;
    if (vMat < 1.5) ao *= mix(1.0, 0.68, smoothstep(0.125, 0.17, abs(b.x)) * smoothstep(1.24, 1.38, b.y) * (1.0 - smoothstep(1.4, 1.46, b.y)));
    if (vMat > 1.5 && vMat < 2.5) ao *= mix(1.0, 0.7, (1.0 - smoothstep(0.02, 0.07, abs(b.x))) * smoothstep(0.98, 0.86, b.y));
    if (vMat > 0.5 && vMat < 1.5) ao *= mix(0.82, 1.0, smoothstep(0.975, 1.02, b.y));
  }
  if (vMat < 0.5 || vMat > 13.5) ao *= mix(0.85, 1.0, smoothstep(1.5, 1.545, b.y) + step(b.y, 1.44));
  diffuseColor.rgb *= ao; }`;

function makeMat(THREE, dorsalTex, uni) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .8, metalness: 0, envMapIntensity: .55, side: THREE.DoubleSide });
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, uni, { uDorsal: { value: dorsalTex } });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + POSE)
      .replace('#include <beginnormal_vertex>', 'vec3 objectNormal; vec3 posedP = poseP(position, normal, objectNormal);')
      .replace('#include <begin_vertex>', 'vec3 transformed = posedP;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vCol; varying float vMat; varying vec2 vDuv; varying float vRough; varying vec3 vBind; uniform sampler2D uDorsal;')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4(vCol, 1.0); if (abs(vMat - 8.0) < 0.5) diffuseColor.rgb = texture2D(uDorsal, vDuv).rgb; else if (vMat > 13.5 && vMat < 14.5) diffuseColor.rgb *= texture2D(uDorsal, vDuv).rgb;' + FOLDS)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vRough;');
  };
  mat.customProgramCacheKey = () => 'gente-cuerpo';
  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  depth.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, uni);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + POSE).replace('#include <begin_vertex>', 'vec3 dN; vec3 transformed = poseP(position, normal, dN);');
  };
  depth.customProgramCacheKey = () => 'gente-sombra';
  return { mat, depth };
}

// dorsales: 16 números en un atlas 4×4
function dorsalAtlas(ctx) {
  const r = mul(2026);
  return ctx.canvasTex(1024, 1024, (g, W) => {
    const T = W / 4; g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, W);
    for (let i = 0; i < 15; i++) {
      const x0 = (i % 4) * T, y0 = Math.floor(i / 4) * T, h = T * .74, y1 = y0 + (T - h) / 2; g.save(); g.beginPath(); g.rect(x0 + 6, y1, T - 12, h); g.clip();
      g.fillStyle = '#fbfbf8'; g.fillRect(x0, y1, T, h);
      g.fillStyle = '#4DC4DA'; g.beginPath(); g.moveTo(x0, y1 + h * .78); g.lineTo(x0 + T, y1 + h * .12); g.lineTo(x0 + T, y1 + h * .42); g.lineTo(x0, y1 + h * 1.08); g.closePath(); g.fill();
      g.fillStyle = '#1d3f8f'; g.font = `700 ${T * .085}px Arial, sans-serif`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('MARATÓN CAF', x0 + 14, y1 + 8);
      g.fillStyle = '#e4002b'; g.fillRect(x0 + T - 44, y1 + 9, 28, 14);
      const num = i === 0 ? '1726' : String(100 + Math.floor(r() * 9800)); g.fillStyle = '#0a0a0a'; g.font = `900 ${T * (num.length > 3 ? .3 : .36)}px "Arial Black", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(num, x0 + T / 2, y1 + h * .55);
      g.fillStyle = '#6b6b6b'; for (let k = 0; k < 3; k++) g.fillRect(x0 + 18 + k * 60, y1 + h - 20, 44, 10);
      g.restore();
    }
    // cara (multiplica el tono de piel): sombras de cuencas, cejas, ojos, nariz y labios
    const fx = 3 * T, fy = 3 * T, X = u => fx + u * T, Yv = v => fy + v * T;
    const blob = (u, v, rx, ry, col) => { const gr = g.createRadialGradient(X(u), Yv(v), 1, X(u), Yv(v), rx * T); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.save(); g.translate(X(u), Yv(v)); g.scale(1, ry / rx); g.translate(-X(u), -Yv(v)); g.fillStyle = gr; g.fillRect(X(u - rx), Yv(v - rx), rx * 2 * T, rx * 2 * T); g.restore(); };
    for (const u of [.36, .64]) { blob(u, .37, .1, .06, 'rgba(150,110,95,.75)'); g.fillStyle = '#2a1a14'; g.beginPath(); g.ellipse(X(u), Yv(.375), T * .045, T * .017, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#e8e0d8'; g.beginPath(); g.ellipse(X(u + (u < .5 ? -.016 : .016)), Yv(.374), T * .014, T * .01, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#3a2418'; g.lineWidth = T * .02; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(u - .065), Yv(.31)); g.quadraticCurveTo(X(u), Yv(u < .5 ? .285 : .285), X(u + .065), Yv(.31)); g.stroke(); }
    blob(.5, .6, .05, .07, 'rgba(170,125,105,.6)'); blob(.5, .645, .045, .02, 'rgba(120,80,65,.8)');
    g.fillStyle = 'rgba(165,95,90,.9)'; g.beginPath(); g.ellipse(X(.5), Yv(.765), T * .07, T * .022, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(90,45,40,.9)'; g.lineWidth = T * .008; g.beginPath(); g.moveTo(X(.435), Yv(.765)); g.lineTo(X(.565), Yv(.765)); g.stroke();
    blob(.14, .55, .1, .2, 'rgba(200,170,155,.55)'); blob(.86, .55, .1, .2, 'rgba(200,170,155,.55)');
  });
}

// colores empaquetados (sRGB 24 bits en un float)
const pack = c => typeof c === 'number' ? c : c.getHex();
const SHOES = [0xf2f2ef, 0x1b1b1d, 0xff6a2a, 0x2c6cf0, 0xff3d7f, 0x8a8f96, 0xe8ff3a, 0x16b8a6, 0xf2f2ef, 0x1b1b1d, 0xd8d8d0];
const HAIR = [0x141010, 0x1e1510, 0x2a1d14, 0x3b2a1d, 0x141010, 0x5a4330, 0x9a7a52, 0x8a8a88];
const CAPS = [0xf4f4f2, 0x1a1a1c, 0xf4f4f2, 0x2f8cff, 0xe83a3a, 0xc6e832, 0xff8a1f, 0x1f4fbf, 0x7a7f86];

function makeInstanced(THREE, ctx, n, geo, uni) {
  const tex = dorsalAtlas(ctx), { mat, depth } = makeMat(THREE, tex, uni);
  const iX = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4), iP = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4), iF = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4), iC0 = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4), iC1 = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4);
  iP.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('iX', iX); geo.setAttribute('iP', iP); geo.setAttribute('iF', iF); geo.setAttribute('iC0', iC0); geo.setAttribute('iC1', iC1);
  const mesh = new THREE.InstancedMesh(geo, mat, n); mesh.customDepthMaterial = depth; mesh.frustumCulled = false; mesh.castShadow = mesh.receiveShadow = !!ctx.Q.alta;
  return { mesh, iP, iF, iC0, iC1, iX };
}

export function makeGente(n, ctx) {
  const { THREE, scene } = ctx, r = mul(160);
  const uni = { uLean: { value: 0 }, uAmp: { value: 1 }, uCad: { value: .86 }, uTime: { value: 0 } };
  // dos niveles de detalle: cerca de la cámara (≤ 60) el cuerpo fino; el resto, uno más simple. Los datos de cada corredor viven aquí y se copian al nivel que le toque.
  const NEAR = 60, LOD = [makeInstanced(THREE, ctx, NEAR, buildBody(THREE, .68, false), uni), makeInstanced(THREE, ctx, n, buildBody(THREE, .3, false), uni)];
  const mk = () => ({ array: new Float32Array(n * 4), setXYZW(i, a, b, c, d) { this.array.set([a, b, c, d], i * 4); }, setX(i, v) { this.array[i * 4] = v; }, setY(i, v) { this.array[i * 4 + 1] = v; }, setZ(i, v) { this.array[i * 4 + 2] = v; }, setW(i, v) { this.array[i * 4 + 3] = v; } });
  const iP = mk(), iF = mk(), iC0 = mk(), iC1 = mk(), iX = mk(), cnt = [0, 0], cp = ctx.camera.position;
  const H = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const fem = r() < .38, h = fem ? .925 + (r() - .5) * .07 : 1.0 + (r() - .5) * .08;
    H[i] = h; iP.setXYZW(i, 0, h, .92 + r() * .18 + (fem ? -.02 : 0), fem ? 1 : 0);
    const cap = r() < .55, hs = fem ? [1, 1, 1, 2, 2, 3, 0][(r() * 7) | 0] : (r() < .05 ? 1 : 0);
    iF.setXYZW(i, cap ? 1 : 0, 0, r() < .72 ? 1 : 0, r() < .3 ? 1 : 0);
    // short normal, licra corta o licra 3/4 (más frecuentes en mujeres)
    const q = r(), hem = q < (fem ? .45 : .75) ? .755 : q < (fem ? .78 : .92) ? .6 : .4;
    iX.setXYZW(i, hem, hs, r() < .35 ? 1 : 0, 0);
    const shoe = SHOES[(r() * SHOES.length) | 0], sock = r() < .62 ? 0xf0f0ec : r() < .75 ? 0x1c1c1e : [0xff6a2a, 0x2c6cf0, 0xe8ff3a][(r() * 3) | 0];
    iC0.setW(i, shoe); iC1.setXYZW(i, HAIR[(r() * HAIR.length) | 0], CAPS[(r() * CAPS.length) | 0], sock, 1 + ((r() * 15) | 0));
  }
  // Formación propia del pelotón: grupos (parejas, combos de club, "trenes") en vez de una lluvia uniforme; más apretado los primeros km
  const G = { off: [], lat: [], v: [] }, sG = new Int16Array(n), sOff = new Float32Array(n), sLat = new Float32Array(n), sPh = new Float32Array(n);
  for (let i = 0; i < n;) { const g = G.off.length, size = 2 + Math.floor(Math.pow(r(), 1.4) * 13); G.off.push(-70 + 320 * Math.pow(r(), 1.35)); G.lat.push((r() - .5) * 1.6); G.v.push((r() - .5) * .45);
    for (let k = 0; k < size && i < n; k++, i++) { sG[i] = g; sOff[i] = (r() - .5) * (1.6 + size * .55); sLat[i] = (r() - .5) * (.9 + size * .2); sPh[i] = r() * 6.283; } }
  let tPrev = performance.now(), tAcc = 0; const q = {};
  for (const L of LOD) scene.add(L.mesh);
  return {
    color(i, franela, short, piel) { iC0.setX(i, pack(franela)); iC0.setY(i, pack(short)); iC0.setZ(i, pack(piel)); },
    set(i, x, y, z, rumbo, fase, escala) {
      if (i === 0) cnt[0] = cnt[1] = 0;
      const S = ctx.S;
      if (S && ctx.P) {
        if (i === 0) { const now = performance.now(), dt = Math.min(.1, (now - tPrev) / 1000); tPrev = now; if (!S.paused) { tAcc += dt; for (let g = 0; g < G.off.length; g++) { G.off[g] += G.v[g] * dt * 2; if (G.off[g] > 250) G.off[g] = -70; if (G.off[g] < -70) G.off[g] = 250; } } }
        const km = ctx.kmOf(S.s), kd = .45 + .55 * Math.min(1, km / 9), g = sG[i];
        let off = (G.off[g] + sOff[i] + Math.sin(tAcc * .3 + sPh[i]) * .5) * kd;
        const s1 = Math.max(0, Math.min(ctx.TOTAL, S.s + off)); ctx.P(s1, q);
        let L = ctx.ROAD_W / 2 - .8, Rr = L; if (ctx.calzada) { const c = ctx.calzada(s1); L = Math.max(2, c.izq - c.sepAncho - c.contraria.ancho - .7); Rr = Math.max(2, c.der - .7);
          // otra pasada cerca (la otra pierna de un retorno, la vuelta por la otra calzada): cada pelotón se queda en su mitad
          if (c.libreIzq < 99) L = Math.min(L, Math.max(.5, c.libreIzq - .5)); if (c.libreDer < 99) Rr = Math.min(Rr, Math.max(.5, c.libreDer - .5)); }
        let lat = (L - Rr) / 2 + G.lat[g] * (L + Rr) * .38 + sLat[i] + Math.sin(tAcc * .21 + sPh[i] * 1.7) * .25; lat = Math.max(-Rr, Math.min(L, lat));
        if (S.cam === 3 && off > -6 && off < 5 && Math.abs(lat) < 1.6) { off += 9; ctx.P(Math.min(ctx.TOTAL, S.s + off), q); }
        else if (S.cam !== 3 && Math.abs(off) < 1.3 && Math.abs(lat) < .8) lat += lat < 0 ? -.9 : .9;
        x = q.x + q.tz * lat; z = q.z - q.tx * lat; y = q.y + Math.abs(Math.cos(fase)) * .07; rumbo = Math.atan2(q.tx, q.tz);
      }
      const dd = (x - cp.x) ** 2 + (z - cp.z) ** 2, lv = dd < 45 * 45 && cnt[0] < NEAR ? 0 : 1, L = LOD[lv], j = cnt[lv]++, A = L.mesh.instanceMatrix.array;
      for (const [src, dst] of [[iP, L.iP], [iF, L.iF], [iC0, L.iC0], [iC1, L.iC1], [iX, L.iX]]) for (let k = 0; k < 4; k++) dst.array[j * 4 + k] = src.array[i * 4 + k];
      const sc = escala / 1.12 * H[i], c = Math.cos(rumbo) * sc, sn = Math.sin(rumbo) * sc, o = j * 16;
      A[o] = c; A[o + 1] = 0; A[o + 2] = -sn; A[o + 3] = 0; A[o + 4] = 0; A[o + 5] = sc; A[o + 6] = 0; A[o + 7] = 0; A[o + 8] = sn; A[o + 9] = 0; A[o + 10] = c; A[o + 11] = 0;
      A[o + 12] = x; A[o + 13] = y - Math.abs(Math.cos(fase)) * .07; A[o + 14] = z; A[o + 15] = 1;   // el motor suma su propio rebote; el ciclo ya trae el suyo
      L.iP.array[j * 4] = fase;
    },
    commit(count) { LOD.forEach((L, k) => { L.mesh.count = count ? cnt[k] : 0; L.mesh.instanceMatrix.needsUpdate = L.iP.needsUpdate = L.iF.needsUpdate = L.iC0.needsUpdate = L.iC1.needsUpdate = L.iX.needsUpdate = true; }); },
  };
}

export function makeHero(ctx) {
  const { THREE } = ctx;
  const uni = { uLean: { value: 0 }, uAmp: { value: 1 }, uCad: { value: .86 }, uTime: { value: 0 } };
  const { mesh, iP, iF, iC0, iC1, iX } = makeInstanced(THREE, ctx, 1, buildBody(THREE, 1.6, true), uni);
  iP.setXYZW(0, 0, 1, 1, 0); iF.setXYZW(0, 1, 0, 1, 1); iX.setXYZW(0, .755, 0, 0, 0);
  iC0.setXYZW(0, 0xc6e832, 0x14161c, 0xc68e63, 0xff5a1f); iC1.setXYZW(0, 0x1e1510, 0xf4f4f2, 0xf0f0ec, 0);
  mesh.instanceMatrix.array.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); mesh.count = 1;
  const group = new THREE.Group(); group.add(mesh);
  let lean = 0;
  return {
    group,
    update({ fase, pausado, dt, v, pendiente }) {
      iP.array[0] = fase; iP.needsUpdate = true;
      const want = Math.max(-.08, Math.min(.12, (pendiente || 0) * .012)); lean += (want - lean) * Math.min(1, (dt || .016) * 3); uni.uLean.value = lean;
      uni.uAmp.value = v > 0 ? Math.max(.75, Math.min(1.15, .75 + v * .1)) : 1;
    },
  };
}

// Público y voluntarios quietos sobre la acera (aplauden, saludan, miran), alrededor del corredor.
// No se ponen a menos de 120 m de los puntos de animación de landmarks/animacion.js, que ya traen su público.
const ANIM_KM = [0.10, 2.95, 8.30, 12.70, 17.25, 21.10, 25.10, 31.20, 37.30, 38.00, 41.30, 41.88];
const ROPA = [0xf2f2ee, 0x1b1b1d, 0xc23b32, 0x2a5aa8, 0x8a8f96, 0x2f7a4a, 0xe8c547, 0x5b3a7a, 0xd96b2b, 0x7fb3d9];
export function install(ctx) {
  const { THREE } = ctx, NS = ctx.Q.alta ? 110 : 60, uni = { uLean: { value: 0 }, uAmp: { value: 0 }, uCad: { value: 1 }, uTime: { value: 0 } };
  const { mesh, iP, iF, iC0, iC1, iX } = makeInstanced(THREE, ctx, NS, buildBody(THREE, .3, false), uni), r = mul(77), H = new Float32Array(NS);
  for (let i = 0; i < NS; i++) { const fem = r() < .5, h = fem ? .93 + (r() - .5) * .07 : 1 + (r() - .5) * .08; H[i] = h; iP.setXYZW(i, r() * 50, h, .95 + r() * .2, fem ? 1 : 0); iF.setXYZW(i, r() < .35 ? 1 : 0, 0, 1, r() < .2 ? 1 : 0);
    iX.setXYZW(i, r() < .5 ? .5 : .755, fem ? [0, 1, 2][(r() * 3) | 0] : 0, 1, 0); iC0.setXYZW(i, ROPA[(r() * ROPA.length) | 0], [0x2b3a55, 0x1b1b1d, 0x4a4036, 0x6c7a8a][(r() * 4) | 0], [0xc68e63, 0x9a6a46, 0xe0b08a, 0x7a5236][(r() * 4) | 0], [0xf2f2ef, 0x1b1b1d, 0x8a8f96][(r() * 3) | 0]);
    iC1.setXYZW(i, HAIR[(r() * HAIR.length) | 0], CAPS[(r() * CAPS.length) | 0], 0xf0f0ec, 0); }
  mesh.count = 0; ctx.scene.add(mesh);
  const hash = (a, b) => { let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
  let lastS = -1e9; const o = {}, A = mesh.instanceMatrix.array, D = ctx.D, HID = (D.hidratacion || []).map(Number);
  function place(sNow) {
    lastS = sNow; let n = 0; const km0 = ctx.kmOf(sNow);
    for (let s = Math.max(20, sNow - 120); s < Math.min(ctx.TOTAL - 20, sNow + 320) && n < NS; s += 6) {
      const si = Math.round(s / 6), km = ctx.kmOf(s); if (ANIM_KM.some(k => Math.abs(k - km) < .12) || ctx.cubierto(s) || ctx.enElevado(s)) continue;
      const vol = HID.some(k => Math.abs(k - km) < .05), dens = vol ? .8 : km < 3 || km > 39 ? .3 : .14;
      for (const side of [1, -1]) {
        if (hash(si, side + 5) > dens || !ctx.calzada) continue; const c = ctx.calzada(s), ac = side > 0 ? c.aceraIzq : c.aceraDer; if (ac < 1.2) continue;
        ctx.P(s, o); const grp = 1 + Math.floor(hash(si, side + 9) * 3);
        for (let k = 0; k < grp && n < NS; k++) {
          const d = (side > 0 ? c.izq : c.der) + .7 + hash(si * 7 + k, 3) * Math.min(1.6, ac - 1), along = (k - (grp - 1) / 2) * .7, x = o.x + o.tz * d * side + o.tx * along, z = o.z - o.tx * d * side + o.tz * along;
          if ((ctx.calzadaLibre && !ctx.calzadaLibre(x, z)) || ctx.quitado(x, z)) continue;
          const ry = Math.atan2(-o.tz * side, o.tx * side) + (hash(si, k + 11) - .5) * .8 - side * .35, sc = H[n], cs = Math.cos(ry) * sc, sn = Math.sin(ry) * sc, b = n * 16;
          A.set([cs, 0, -sn, 0, 0, sc, 0, 0, sn, 0, cs, 0, x, o.y + .16, z, 1], b);
          const hm = hash(si * 3 + k, 21), mode = hm < .38 ? 1 : hm < .58 ? 2 : 3; iX.array[n * 4 + 3] = mode;
          if (vol) { iC0.array[n * 4] = hash(si, k) < .5 ? 0x2f8cff : 0xff7a1a; iF.array[n * 4] = 1; }
          n++;
        }
      }
    }
    mesh.count = n; mesh.instanceMatrix.needsUpdate = iX.needsUpdate = iC0.needsUpdate = iF.needsUpdate = true;
  }
  ctx.frameHooks.push((noche, t) => { uni.uTime.value = t; const s = ctx.S ? ctx.S.s : 0; if (Math.abs(s - lastS) > 40) place(s); });
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
