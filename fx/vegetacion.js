// Vegetación de Caracas: samanes, caobos, mijaos, ceibas, apamates, araguaneyes, mangos y chaguaramos (palma real).
// Cada especie es una plantilla procedural (tronco con ramas visibles + racimos de hojas en tarjetas con alfa) que se instancia.
// Cerca de la cámara va el árbol completo (con sombra calada y balanceo por viento); lejos, un impostor renderizado de la misma plantilla.
// Grama y matas en islas y bordes verdes, solo alrededor del corredor.
export const meta = { id: 'vegetacion', reemplaza: ['arboles'] };
// Árboles sembrados a mano: lista `arboles: [{ ll: [lat, lon], especie?, alto? }]` de cada zona de fx/correcciones (contrato en su LEEME.md)
const ARBOLES = new URLSearchParams(location.search).get('fix') === '0' ? [] : (await Promise.all((await import('./correcciones/index.js')).default.map(id => import(`./correcciones/${id}.js${new URL(import.meta.url).search}`).then(m => m.default.arboles || []).catch(() => [])))).flat();

export function install(ctx) {
  const { THREE, scene, D, Q, P, Y, hT, clamp, ROAD_W, TOTAL, N, R } = ctx;
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const TAU = Math.PI * 2;
  const mul = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hash = (a, b) => { let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };

  // ───────── Texturas procedurales ─────────
  const leafTex = ctx.canvasTex(2048, 1024, (g, W) => {
    const T = 512;
    // racimo: hojas dispuestas a lo largo de ramitas que salen del centro-abajo, silueta irregular
    const cluster = (ox, oy, kind) => {
      const r = mul(kind * 977 + 13), cx = ox + T / 2, cy = oy + T / 2, R0 = T * .43;
      const blobs = []; for (let i = 0; i < 15; i++) { const a = r() * TAU, d = Math.sqrt(r()) * R0 * .68; blobs.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * .9, R0 * (.2 + r() * .26)]); }
      const inside = (x, y, k = 1) => blobs.some(b => (x - b[0]) ** 2 + (y - b[1]) ** 2 < (b[2] * k) ** 2) && (x - cx) ** 2 + (y - cy) ** 2 < (R0 * .98) ** 2;
      // masa de fondo (hojas interiores en sombra): borde grumoso; mantiene la cobertura en los mipmaps lejanos
      const base = kind === 1 ? ['#141f0f', '#192613', '#1e2c16'] : ['#18240f', '#1d2b13', '#223117'];
      for (let i = 0; i < 1600; i++) { const x = ox + 10 + r() * (T - 20), y = oy + 10 + r() * (T - 20); if (!inside(x, y, .86)) continue; g.fillStyle = base[(r() * 3) | 0]; g.beginPath(); g.arc(x, y, 6 + r() * 12, 0, TAU); g.fill(); }
      // ramitas
      g.lineCap = 'round';
      for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (r() - .5) * 2.4; g.strokeStyle = 'rgba(70,52,38,1)'; g.lineWidth = 2 + r() * 2; g.beginPath(); g.moveTo(cx + (r() - .5) * 20, oy + T * .93); g.quadraticCurveTo(cx + Math.cos(a) * R0 * .3, cy + 30, cx + Math.cos(a) * R0 * .8, cy + Math.sin(a) * R0 * .75); g.stroke(); }
      const greens = kind === 1 ? ['#2b3f1e', '#3a5126', '#4b6430', '#5a733a', '#6c8444', '#344a22', '#7d9450'] : ['#34491f', '#435a28', '#546c31', '#647c3a', '#768c45', '#3b5224', '#8a9c52', '#9aa860'];
      const leaf = (x, y, a, L, w, col) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = col; g.beginPath(); g.moveTo(0, -L / 2); g.quadraticCurveTo(w, 0, 0, L / 2); g.quadraticCurveTo(-w, 0, 0, -L / 2); g.fill(); if (L > 24) { g.strokeStyle = 'rgba(160,190,110,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -L / 2 + 2); g.lineTo(0, L / 2 - 2); g.stroke(); } g.restore(); };
      const nLeaf = kind === 1 ? 1500 : kind === 0 ? 7500 : 3500;
      for (let i = 0; i < nLeaf; i++) {
        const x = ox + 12 + r() * (T - 24), y = oy + 12 + r() * (T - 24); if (!inside(x, y, 1.08)) continue;
        const a = Math.atan2(y - cy, x - cx) + Math.PI / 2 + (r() - .5) * 1.4, sh = ((y - oy) / T) * .3;
        let col = greens[(r() * greens.length) | 0];
        if (r() < sh) col = greens[0];
        if (kind === 1) leaf(x, y, a, 24 + r() * 30, 7 + r() * 6, col);
        else leaf(x, y, a, 9 + r() * 8, 3 + r() * 2.2, col);
      }
      if (kind >= 2) { // flores: araguaney (amarillo) o apamate (rosado)
        const fc = kind === 2 ? ['#f2bd00', '#ffd21f', '#e2a400', '#f8dc4a', '#cf9200'] : ['#de8fc0', '#eaa9d0', '#cf74ad', '#bd5f98', '#f0bcdc'];
        for (let i = 0; i < 5200; i++) { const x = ox + 10 + r() * (T - 20), y = oy + 10 + r() * (T - 20); if (!inside(x, y, 1.04) || r() < .2) continue; g.fillStyle = fc[(r() * fc.length) | 0]; const s = 4 + r() * 6; g.beginPath(); g.ellipse(x, y, s, s * (.6 + r() * .4), r() * 3, 0, TAU); g.fill(); }
      }
    };
    cluster(0, 0, 0); cluster(T, 0, 1); cluster(2 * T, 0, 2); cluster(3 * T, 0, 3);
    // 4 casuarina: hebras colgantes finas
    { const r = mul(404), ox = 0, oy = T; g.lineCap = 'round';
      for (let i = 0; i < 420; i++) { let x = ox + 40 + r() * (T - 80), y = oy + 30 + r() * T * .35; if ((x - ox - T / 2) ** 2 / (T * T * .2) + (y - oy - T * .3) ** 2 / (T * T * .12) > 1) continue; const L = 80 + r() * 200, c = ['#2a3a22', '#33452a', '#3d5131', '#25331e', '#4a5c38'][(r() * 5) | 0]; g.strokeStyle = c; g.lineWidth = 1.6 + r() * 1.8; g.beginPath(); g.moveTo(x, y); const bx = (r() - .5) * 40; g.quadraticCurveTo(x + bx, y + L * .5, x + bx * .4 + (r() - .5) * 20, Math.min(oy + T - 8, y + L)); g.stroke(); }
      g.strokeStyle = 'rgba(70,52,38,1)'; g.lineWidth = 3; g.beginPath(); g.moveTo(ox + 40, oy + T * .25); g.quadraticCurveTo(ox + T / 2, oy + T * .12, ox + T - 40, oy + T * .3); g.stroke(); }
    // 5 croto: hojas anchas manchadas de rojo, naranja y amarillo
    { const r = mul(505), ox = T, oy = T, cx = ox + T / 2, cy = oy + T / 2; const cols = ['#b8321c', '#d8961c', '#6e2414', '#3b5f26', '#cc5a1a', '#a3263e', '#e2c24a'];
      for (let i = 0; i < 700; i++) { const a = r() * TAU, d = Math.sqrt(r()) * T * .42, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2 + (r() - .5)); const L = 40 + r() * 40, w = 9 + r() * 8; g.fillStyle = cols[(r() * cols.length) | 0]; g.beginPath(); g.moveTo(0, -L / 2); g.quadraticCurveTo(w, 0, 0, L / 2); g.quadraticCurveTo(-w, 0, 0, -L / 2); g.fill(); g.strokeStyle = 'rgba(240,210,80,.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -L / 2); g.lineTo(0, L / 2); g.stroke(); g.restore(); } }
    // 6 trinitaria: brácteas fucsia sobre hojita oscura
    { const r = mul(606), ox = 2 * T, oy = T, cx = ox + T / 2, cy = oy + T / 2;
      for (let i = 0; i < 1600; i++) { const a = r() * TAU, d = Math.sqrt(r()) * T * .44, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .85; g.fillStyle = ['#20301a', '#2b3d20', '#34492a'][(r() * 3) | 0]; g.beginPath(); g.ellipse(x, y, 7, 4, r() * 3, 0, TAU); g.fill(); }
      for (let i = 0; i < 3800; i++) { const a = r() * TAU, d = Math.sqrt(r()) * T * .43, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .85; if (r() < .3) continue; g.fillStyle = ['#d3207a', '#e8409a', '#b31a66', '#f25aa8', '#c22a86'][(r() * 5) | 0]; g.beginPath(); g.ellipse(x, y, 4 + r() * 4, 3 + r() * 3, r() * 3, 0, TAU); g.fill(); } }
    // 7 penca de agave: superficie opaca gris verdosa con estrías
    { const r = mul(707), ox = 3 * T, oy = T; const gr = g.createLinearGradient(ox, 0, ox + T, 0); gr.addColorStop(0, '#5f7a68'); gr.addColorStop(.5, '#8fa996'); gr.addColorStop(1, '#5f7a68'); g.fillStyle = gr; g.fillRect(ox + 8, oy + 8, T - 16, T - 16);
      for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(${40 + r() * 60 | 0},${70 + r() * 50 | 0},${55 + r() * 40 | 0},.25)`; g.fillRect(ox + 8 + r() * (T - 16), oy + 8, 2 + r() * 3, T - 16); } g.fillStyle = '#c9b25a'; g.fillRect(ox + 8, oy + 8, 6, T - 16); g.fillRect(ox + T - 14, oy + 8, 6, T - 16); }
  });
  leafTex.generateMipmaps = true;
  const barkTex = ctx.canvasTex(256, 512, (g, w, h) => {
    const r = mul(5); g.fillStyle = '#5d5045'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const x = r() * w, y = r() * h, l = 20 + r() * 90, c = 60 + r() * 50 | 0; g.strokeStyle = `rgba(${c + 12},${c},${c - 10},.55)`; g.lineWidth = 1 + r() * 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y + l); g.stroke(); }
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(30,24,20,${.25 + r() * .3})`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 10 + r() * 40); }
    for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(150,150,120,${.08 + r() * .12})`; g.beginPath(); g.ellipse(r() * w, r() * h, 4 + r() * 14, 3 + r() * 8, 0, 0, TAU); g.fill(); }
  });
  barkTex.wrapS = barkTex.wrapT = THREE.RepeatWrapping;
  const palmBarkTex = ctx.canvasTex(128, 512, (g, w, h) => {
    const r = mul(9); g.fillStyle = '#c3bfb5'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${150 + r() * 60 | 0},${148 + r() * 55 | 0},${140 + r() * 50 | 0},.35)`; g.fillRect(r() * w, r() * h, 1 + r() * 4, 4 + r() * 30); }
    for (let y = 0; y < h; y += 16 + r() * 10) { g.fillStyle = 'rgba(90,86,78,.35)'; g.fillRect(0, y, w, 1.5 + r() * 1.5); g.fillStyle = 'rgba(235,232,222,.25)'; g.fillRect(0, y + 2, w, 1); }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(70,80,60,${.08 + r() * .1})`; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 10, 6 + r() * 20, 0, 0, TAU); g.fill(); }
  });
  palmBarkTex.wrapS = palmBarkTex.wrapT = THREE.RepeatWrapping;
  // fronda pinnada de palma real: raquis al centro, folíolos colgantes a ambos lados (u a lo ancho, v a lo largo)
  const frondTex = ctx.canvasTex(256, 1024, (g, w, h) => {
    const r = mul(21), cx = w / 2;
    for (let i = 0; i < 230; i++) {
      const t = i / 230, y = h * (.03 + t * .95), L = w * .47 * Math.sin(Math.PI * Math.min(1, .15 + t * .95)) * (.85 + r() * .25);
      for (const sd of [-1, 1]) {
        const ang = sd * (.35 + r() * .35); const ex = cx + sd * L, ey = y - L * .55 + (r() - .5) * 20;
        const c = 45 + r() * 40 | 0; g.strokeStyle = `rgb(${c - 8},${c + 52},${c - 18})`; g.lineWidth = 2.4 + r() * 1.6 - t * 1.2; g.lineCap = 'round';
        g.beginPath(); g.moveTo(cx, y); g.quadraticCurveTo(cx + sd * L * .55, y - L * .45, ex, ey + L * .25 * (1 - Math.abs(ang))); g.stroke();
      }
    }
    g.strokeStyle = '#8a9a5a'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, h); g.stroke();
  });
  const grassTex = ctx.canvasTex(256, 128, (g, w, h) => {
    const r = mul(33);
    for (let i = 0; i < 170; i++) { const x = 10 + r() * (w - 20), hh = h * (.35 + r() * .62), lean = (r() - .5) * 40, c = r(); g.strokeStyle = c < .3 ? '#a39a58' : c < .55 ? '#5f7a34' : c < .8 ? '#4a632a' : '#7d8f46'; g.lineWidth = 2 + r() * 2.5; g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + lean * .3, h - hh * .6, x + lean, h - hh); g.stroke(); }
  });

  // ───────── Materiales (viento, translucidez, sombra calada) ─────────
  const U = { uTime: { value: 0 }, uWind: { value: .22 }, uSunV: { value: V3(0, 1, 0) }, uSunCol: { value: new THREE.Color(1, 1, 1) }, uTransl: { value: .9 } };
  const windVS = leaf => `
    #ifdef USE_INSTANCING
      vec3 ip = instanceMatrix[3].xyz;
    #else
      vec3 ip = vec3(0.0);
    #endif
    float wph = dot(ip.xz, vec2(0.071, 0.053));
    float ww = aWind * uWind;
    vec3 wo = vec3(sin(uTime * 0.83 + wph) + 0.45 * sin(uTime * 1.97 + wph * 1.7), 0.0, 0.55 * cos(uTime * 0.61 + wph * 1.3)) * ww;
    ${leaf ? 'float fl = sin(uTime * 6.3 + dot(position, vec3(3.1, 2.3, 1.7)) + wph) * 0.07 * uWind * (0.3 + aWind); wo += vec3(fl, fl * 0.7, -fl * 0.6);' : ''}
    #ifdef USE_INSTANCING
      mat3 wim = mat3(instanceMatrix); transformed += transpose(wim) * wo / dot(wim[0], wim[0]);
    #else
      transformed += wo;
    #endif`;
  function patch(mat, { leaf = false, transl = false, noFlip = false, paint = false } = {}) {
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aWind; uniform float uTime; uniform float uWind;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + windVS(leaf));
      if (paint) { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vPaint; varying float vLy;').replace('#include <color_vertex>', '#include <color_vertex>\n#ifdef USE_INSTANCING_COLOR\n vPaint = instanceColor.b > 2.0 ? 1.0 : 0.0; vColor = color;\n#endif\n vLy = position.y;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vPaint; varying float vLy;').replace('#include <color_fragment>', '#include <color_fragment>\n if (vPaint > 0.5 && vLy < 1.3 - 0.03 * sin(vLy * 40.0)) diffuseColor.rgb = vec3(0.78, 0.78, 0.74);'); }
      if (sh.fragmentShader.includes('#include <opaque_fragment>')) {
        // lo que queda pegado a la cámara de seguimiento se desvanece (tramado) en vez de taparla
        if (ctx.nearFade) { sh.uniforms.uNearFade = ctx.nearFade; sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uNearFade;').replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\n if (uNearFade > 0.0) { float cd = length(vViewPosition) / uNearFade; if (cd < 1.0 && fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) > cd * cd) discard; }'); }
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uSunV; uniform vec3 uSunCol; uniform float uTransl;');
        if (noFlip) sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', 'float faceDirection = 1.0; vec3 normal = normalize(vNormal); vec3 nonPerturbedNormal = normal;');
        if (transl) sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `{ vec3 vdir = normalize(-vViewPosition); float tr = pow(max(dot(vdir, uSunV), 0.0), 5.0); outgoingLight += diffuseColor.rgb * uSunCol * uTransl * (tr * 1.1 + 0.16 * (1.0 - max(dot(normal, uSunV), 0.0))); }\n#include <opaque_fragment>`);
      }
    };
    mat.customProgramCacheKey = () => 'veg' + (+leaf) + (+transl) + (+noFlip) + (+paint);
    return mat;
  }
  const leafMat = patch(new THREE.MeshLambertMaterial({ map: leafTex, alphaTest: .5, side: THREE.DoubleSide, vertexColors: true }), { leaf: true, transl: true, noFlip: true });
  const frondMat = patch(new THREE.MeshLambertMaterial({ map: frondTex, alphaTest: .45, side: THREE.DoubleSide, vertexColors: true }), { leaf: true, transl: true, noFlip: true });
  const barkMat = patch(new THREE.MeshLambertMaterial({ map: barkTex, vertexColors: true }), { paint: true });
  const palmMat = patch(new THREE.MeshLambertMaterial({ map: palmBarkTex, vertexColors: true }));
  const grassMat = patch(new THREE.MeshLambertMaterial({ map: grassTex, alphaTest: .45, side: THREE.DoubleSide, vertexColors: true }), { leaf: true, noFlip: true });
  const depthOf = (map, at) => patch(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: at }), { leaf: !!map });
  const leafDepth = depthOf(leafTex, .5), frondDepth = depthOf(frondTex, .45), barkDepth = depthOf(null, 0);

  // ───────── Geometría ─────────
  class Builder {
    constructor() { this.p = []; this.n = []; this.uv = []; this.c = []; this.w = []; this.i = []; }
    v(p, n, u, v, c, w) { this.p.push(p.x, p.y, p.z); this.n.push(n.x, n.y, n.z); this.uv.push(u, v); this.c.push(c[0], c[1], c[2]); this.w.push(w); return this.p.length / 3 - 1; }
    geo() { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3)); g.setAttribute('aWind', new THREE.Float32BufferAttribute(this.w, 1)); g.setIndex(this.i); g.computeBoundingSphere(); return g; }
    tris() { return this.i.length / 3; }
  }
  const bez = (a, b, c, t, o = V3()) => o.set(0, 0, 0).addScaledVector(a, (1 - t) * (1 - t)).addScaledVector(b, 2 * t * (1 - t)).addScaledVector(c, t * t);
  // tubo de corteza a lo largo de una polilínea, con marcos transportados en paralelo
  function tube(B, pts, rad, segs, H, { col = c => [1, 1, 1], mod = null, vRep = 1.6 } = {}) {
    const n = pts.length; let N0 = null, len = 0; const base = B.p.length / 3;
    for (let i = 0; i < n; i++) {
      const T = (i === 0 ? pts[1].clone().sub(pts[0]) : i === n - 1 ? pts[i].clone().sub(pts[i - 1]) : pts[i + 1].clone().sub(pts[i - 1])).normalize();
      if (!N0) { N0 = Math.abs(T.y) < .9 ? V3(0, 1, 0).cross(T).normalize() : V3(1, 0, 0).cross(T).normalize(); } else { N0.addScaledVector(T, -N0.dot(T)).normalize(); }
      const Bn = T.clone().cross(N0); if (i) len += pts[i].distanceTo(pts[i - 1]);
      for (let j = 0; j <= segs; j++) {
        const a = j / segs * TAU, d = N0.clone().multiplyScalar(Math.cos(a)).addScaledVector(Bn, Math.sin(a)), r = rad[i] * (mod ? mod(a, pts[i].y) : 1);
        const p = pts[i].clone().addScaledVector(d, r), w = Math.pow(clamp(p.y / H, 0, 1), 1.6) * .5;
        B.v(p, d, j / segs * Math.max(1, Math.round(rad[i] * 6)), len / vRep, col(p), w);
      }
    }
    for (let i = 0; i < n - 1; i++) for (let j = 0; j < segs; j++) { const a = base + i * (segs + 1) + j, b = a + segs + 1; B.i.push(a, b, a + 1, a + 1, b, b + 1); }
  }
  // tarjeta de hojas (quad) centrada en c, normal saliente desde el centro de la copa
  function card(B, c, size, ctr, tile, r, H, rh, aoBase = 1, flat = 0) {
    const out = c.clone().sub(ctr); const dist = out.length(); out.normalize();
    const nrm = out.clone().multiplyScalar(.75).add(V3((r() - .5) * 1.4, (r() - .5) * 1.0 + .35 + flat, (r() - .5) * 1.4)).normalize();
    const t1 = (Math.abs(nrm.y) < .95 ? V3(0, 1, 0) : V3(1, 0, 0)).cross(nrm).normalize(), t2 = nrm.clone().cross(t1);
    const rot = r() * TAU, cr = Math.cos(rot), sr = Math.sin(rot), a1 = t1.clone().multiplyScalar(cr).addScaledVector(t2, sr), a2 = t1.clone().multiplyScalar(-sr).addScaledVector(t2, cr);
    const tu = tile % 4, tv = tile >> 2, h = size / 2, flip = r() < .5;
    const ao = clamp(.42 + .64 * Math.pow(Math.min(1, dist / (rh * .95)), 1.3), .4, 1.05) * aoBase * (.9 + r() * .2), shade = clamp(.72 + .35 * ((c.y - (ctr.y - rh * .4)) / (rh * 1.2)), .65, 1.08);
    const k = ao * shade, col = [k, k, k * .97], base = B.p.length / 3;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const p = c.clone().addScaledVector(a1, sx * h).addScaledVector(a2, sy * h);
      const vn = p.clone().sub(ctr).normalize().multiplyScalar(.6).addScaledVector(nrm, .4).add(V3(0, .25, 0)).normalize();
      const u = (((flip ? -sx : sx) * .5 + .5) + tu) / 4;
      B.v(p, vn, u, (1 - tv) * .5 + (sy * .5 + .5) * .5, col, .25 + .75 * Math.pow(clamp(p.y / H, 0, 1), 1.4));
    }
    B.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  // Especies. H alto, tH fuste limpio, r0 radio del tronco, nP ramas madre, copa: centro cy, radio horizontal rh, vertical rv, base de follaje `bot` (≥ 5,7 m: libre ≥ 4,5 m sobre la calle aun a escala 0,8)
  const SP = {
    saman: { H: 18, tH: 3.4, r0: .58, nP: 7, arch: .1, rh: 12.5, rv: 5.6, cy: 12.8, bot: 7.4, n2: 6, cards: 12, size: 3.0, tiles: [[0, 1]], flat: .35, elev: [-.05, 1], hang: 1, tint: [.72, .8, .66] },
    caobo: { H: 17, tH: 5.5, r0: .42, nP: 5, arch: .45, rh: 6.8, rv: 5.6, cy: 11.6, bot: 6.4, n2: 4, cards: 11, size: 2.5, tiles: [[0, 1]], leader: 1, elev: [-.45, 1], hang: 1, tint: [.85, .9, .78] },
    mijao: { H: 26, tH: 10, r0: .62, nP: 5, arch: .5, rh: 8.5, rv: 6.2, cy: 19.5, bot: 13, n2: 4, cards: 10, size: 3.2, tiles: [[1, 1]], leader: 1, elev: [-.4, 1], tint: [.92, .95, .84] },
    ceiba: { H: 23, tH: 13, r0: .75, nP: 7, arch: -.05, rh: 11.5, rv: 3.4, cy: 18.5, bot: 14.5, n2: 3, cards: 8, size: 3.0, tiles: [[1, 1]], leader: 1, buttress: 1, flat: .5, elev: [-.1, 1], tint: [1, 1.02, .86] },
    apamate: { H: 14, tH: 5, r0: .3, nP: 4, arch: .5, rh: 5.2, rv: 4, cy: 10.2, bot: 6.2, n2: 4, cards: 9, size: 2.3, tiles: [[0, 1]], leader: 1, elev: [-.4, 1], tint: [1.08, 1.12, .86] },
    apamateFlor: { H: 14, tH: 5, r0: .3, nP: 4, arch: .5, rh: 5.2, rv: 4, cy: 10.2, bot: 6.2, n2: 4, cards: 9, size: 2.3, tiles: [[3, .72], [0, .28]], leader: 1, elev: [-.4, 1], tint: [1.15, 1.1, 1.12] },
    araguaney: { H: 11.5, tH: 4.4, r0: .26, nP: 4, arch: .35, rh: 4.6, rv: 3.1, cy: 8.6, bot: 5.9, n2: 4, cards: 8, size: 2.1, tiles: [[1, .6], [0, .4]], elev: [-.35, 1], tint: [1, 1.05, .84] },
    araguaneyFlor: { H: 11.5, tH: 4.4, r0: .26, nP: 4, arch: .35, rh: 4.6, rv: 3.1, cy: 8.6, bot: 5.9, n2: 4, cards: 9, size: 2.1, tiles: [[2, .88], [1, .12]], elev: [-.35, 1], tint: [1.2, 1.12, 1.1] },
    mango: { H: 11, tH: 2.3, r0: .42, nP: 5, arch: .3, rh: 6.2, rv: 4.4, cy: 6.6, bot: 2.6, n2: 5, cards: 12, size: 2.4, tiles: [[1, 1]], elev: [-.55, 1], hang: 1, tint: [.66, .74, .66] },
  };
  const NAMES = Object.keys(SP), CAS = NAMES.length, PALM0 = CAS + 1, NPALM = 3, isPalm = k => k >= PALM0; // casuarina y tres chaguaramos
  function buildTree(sp, seed) {
    const r = mul(seed), T = new Builder(), L = new Builder(), ctr = V3(0, sp.cy, 0);
    const barkCol = p => { const k = clamp(.62 + .4 * p.y / sp.H, .62, 1.05); return [k, k * .97, k * .93]; };
    const envPt = (a, el, rr) => V3(Math.cos(a) * Math.cos(el) * sp.rh * rr, sp.cy + Math.sin(el) * sp.rv * rr, Math.sin(a) * Math.cos(el) * sp.rh * rr);
    const pickTile = () => { let q = r(); for (const [t, w] of sp.tiles) { if (q < w) return t; q -= w; } return sp.tiles[0][0]; };
    // tronco (y guía central si la especie la tiene)
    const top = sp.leader ? sp.cy + sp.rv * .35 : sp.tH, lean = V3((r() - .5) * .8, 0, (r() - .5) * .8), tp = [], tr = [], nT = sp.leader ? 9 : 6;
    for (let i = 0; i < nT; i++) { const t = i / (nT - 1); tp.push(V3(lean.x * t * t + (r() - .5) * .12 * t, top * t, lean.z * t * t + (r() - .5) * .12 * t)); tr.push(sp.r0 * (1 - .55 * t) * (sp.leader && t > .6 ? 1 - (t - .6) * 1.4 : 1) + .03); }
    const mod = sp.buttress ? (a, y) => 1 + 1.9 * Math.exp(-y * .9) * Math.pow(.5 + .5 * Math.cos(a * 5 + 1), 3) : (a, y) => 1 + .55 * Math.exp(-y * 2.2) + .05 * Math.sin(a * 3);
    tube(T, tp, tr, 9, sp.H, { col: barkCol, mod, vRep: 2.2 });
    const trunkAt = h => { const t = clamp(h / top, 0, 1); return V3(lean.x * t * t, h, lean.z * t * t); };
    const a0 = r() * TAU;
    for (let k = 0; k < sp.nP; k++) {
      const a = a0 + k / sp.nP * TAU + (r() - .5) * .5;
      const h0 = sp.leader ? sp.tH + (top - sp.tH) * (k / sp.nP) * .9 + r() * .6 : sp.tH - r() * .4;
      const s = trunkAt(h0), e = envPt(a, (sp.elev[0] + .35 + r() * .3) * .9, .5 + r() * .2);
      if (e.y < sp.bot + .5) e.y = sp.bot + .5;
      const out = V3(Math.cos(a), 0, Math.sin(a)), Lm = s.distanceTo(e), c = s.clone().addScaledVector(out, Lm * (.45 - sp.arch * .2)).add(V3(0, Lm * (.18 + sp.arch * .45), 0));
      const pts = [], rad = [], rs = sp.r0 * (sp.leader ? .45 : .62); for (let i = 0; i <= 5; i++) { const t = i / 5; pts.push(bez(s, c, e, t, V3())); rad.push(rs * (1 - .7 * t) + .03); }
      tube(T, pts, rad, 6, sp.H, { col: barkCol });
      for (let j = 0; j < sp.n2; j++) {
        const t0 = .35 + .6 * (j / Math.max(1, sp.n2 - 1)) * (.8 + r() * .2), s2 = bez(s, c, e, t0, V3());
        const el = sp.elev[0] + (sp.elev[1] - sp.elev[0]) * Math.pow(r(), .8), a2 = a + (r() - .5) * (TAU / sp.nP) * 1.3, e2 = envPt(a2, el * Math.PI / 2, .82 + r() * .16);
        if (e2.y < sp.bot + sp.size * .45) e2.y = sp.bot + sp.size * .45 + r() * .5;
        const c2 = s2.clone().lerp(e2, .5).add(V3(0, .8 + r() * 1.2, 0)), p2 = [], r2 = [], rr = rs * (1 - .7 * t0) * .55;
        for (let i = 0; i <= 3; i++) { const t = i / 3; p2.push(bez(s2, c2, e2, t * .92, V3())); r2.push(rr * (1 - .8 * t) + .02); }
        tube(T, p2, r2, 4, sp.H, { col: barkCol });
        // racimo de tarjetas alrededor de la punta y a lo largo de la mitad exterior
        for (let q = 0; q < sp.cards; q++) {
          const along = q < 2 ? .55 + r() * .3 : 1, base = bez(s2, c2, e2, along * .95, V3()), cr = sp.size * (.32 + r() * .38);
          const cp = base.add(V3((r() - .5) * 2, (r() - .35) * 1.4, (r() - .5) * 2).multiplyScalar(cr));
          if (cp.y < sp.bot + sp.size * .42) cp.y = sp.bot + sp.size * .42 + r() * .3;
          card(L, cp, sp.size * (.8 + r() * .4), ctr, pickTile(), r, sp.H, sp.rh, 1, sp.flat || 0);
        }
      }
    }
    // relleno interior de la copa (evita el hueco vacío visto desde abajo)
    for (let q = 0; q < sp.nP * 3; q++) { const cp = envPt(r() * TAU, (r() * .9 - .1) * Math.PI / 2, .35 + r() * .35); if (cp.y < sp.bot + sp.size * .5) cp.y = sp.bot + sp.size * .5; card(L, cp, sp.size * 1.1, ctr, pickTile(), r, sp.H, sp.rh, .8, sp.flat || 0); }
    // ramitas colgantes en el borde de la copa (rompen la silueta; nunca bajo la altura libre)
    if (sp.hang) for (let q = 0; q < sp.nP * 4; q++) { const cp = envPt(r() * TAU, (-.15 + r() * .25), .9 + r() * .12); cp.y = Math.max(sp.bot + .2, cp.y - .6 - r() * 1.2); card(L, cp, sp.size * (.7 + r() * .3), ctr, pickTile(), r, sp.H, sp.rh, .85, -.45); }
    return { trunk: T.geo(), leaves: L.geo(), tris: T.tris() + L.tris(), w: sp.rh * 2.3, h: Math.max(sp.H, sp.cy + sp.rv * 1.15), tint: sp.tint, cy: sp.cy, rh: sp.rh };
  }
  // Casuarina (pino australiano de Los Próceres): fuste recto alto, ramas cortas en pisos y follaje de hebras colgantes, copa cónica estrecha
  function buildConifer(seed) {
    const r = mul(seed), T = new Builder(), L = new Builder(), H = 21, pts = [], rad = [];
    for (let i = 0; i <= 9; i++) { const t = i / 9; pts.push(V3(Math.sin(t * 3) * .15, H * t, Math.cos(t * 2) * .1 - .1)); rad.push(.34 * (1 - .85 * t) + .03); }
    tube(T, pts, rad, 7, H, { col: p => [.75, .7, .66], vRep: 2 });
    for (let y = 5; y < H - .5; y += .75) {
      const a = r() * TAU, len = 3.7 * Math.pow(1 - (y - 5) / (H - 5), .8) + .5, s0 = V3(0, y, 0), e = V3(Math.cos(a) * len, y - .2 - r() * .5, Math.sin(a) * len), c = s0.clone().lerp(e, .5).add(V3(0, .3, 0));
      const bp = [s0, bez(s0, c, e, .5, V3()), e]; tube(T, bp, [.06, .04, .02], 3, H, { col: () => [.6, .55, .5] });
      for (let q = 0; q < 2; q++) { const cp = bez(s0, c, e, .55 + q * .4, V3()).add(V3(0, -.6, 0)); card(L, cp, 1.7 + r() * .7, V3(0, y, 0), 4, r, H, 3.6, .9, -.45); }
    }
    for (let q = 0; q < 3; q++) card(L, V3((r() - .5) * .6, H - .3, (r() - .5) * .6), 1.6, V3(0, H - 2, 0), 4, r, H, 3, 1, -.3);
    return { trunk: T.geo(), leaves: L.geo(), tris: T.tris() + L.tris(), w: 9, h: H + 1, tint: [.82, .86, .82], cy: 13, rh: 3.6 };
  }
  // Chaguaramo (Roystonea oleracea): fuste liso gris claro muy alto, capitel verde y penacho de frondas arqueadas
  function buildPalm(seed, Ht = 19, lean = .3, curve = .2, dead = 2) {
    const r = mul(seed), T = new Builder(), F = new Builder(), pts = [], rad = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12, y = Ht * t; pts.push(V3(lean * Math.pow(t, 1.6) + Math.sin(t * 2.2) * .12 - curve * Math.sin(t * Math.PI) , y, Math.cos(t * 1.7) * .08 + curve * .4 * Math.sin(t * 2.6))); rad.push(.27 + .08 * Math.exp(-y * 1.5) + .05 * Math.sin(Math.PI * Math.min(1, t * 1.3)) - .05 * t); }
    tube(T, pts, rad, 9, Ht + 6, { col: p => { const k = .9 + .1 * p.y / Ht; return [k, k, k * .98]; }, vRep: 2.4 });
    const top = pts[12], cs = [], cr = [];
    for (let i = 0; i <= 3; i++) { const t = i / 3; cs.push(top.clone().add(V3(0, t * 2.5, 0))); cr.push(.25 - .04 * t); }
    tube(T, cs, cr, 9, Ht + 6, { col: () => [.42, .62, .3], vRep: 2.4 });
    const crown = top.clone().add(V3(0, 2.4, 0)), nF = 19 + dead;
    for (let k = 0; k < nF; k++) {
      const seca = k >= 19, a = k * 2.399 + r() * .3, el = seca ? -1.25 - r() * .2 : k < 3 ? 1.1 + r() * .25 : k < 10 ? .5 + r() * .35 : k < 16 ? .05 + r() * .3 : -.35 - r() * .5, Lf = seca ? 3.4 + r() * .6 : 4.6 + r() * 1.1;
      const dir0 = V3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)), side = V3(-Math.sin(a), 0, Math.cos(a)), seg = 7;
      let p = crown.clone(), d = dir0.clone(); const rows = [];
      for (let i = 0; i <= seg; i++) { rows.push([p.clone(), d.clone()]); p.addScaledVector(d, Lf / seg); d.y -= .2 + .045 * i; d.normalize(); }
      const base = F.p.length / 3;
      for (let i = 0; i <= seg; i++) {
        const [pp, dd] = rows[i], t = i / seg, wd = .78, up = side.clone().cross(dd).normalize().multiplyScalar(-1); if (up.y < 0) up.multiplyScalar(-1);
        const droop = up.clone().multiplyScalar(-(.55 + .35 * t) * wd), L0 = pp.clone().addScaledVector(side, -wd).add(droop), R0 = pp.clone().addScaledVector(side, wd).add(droop);
        const col = seca ? [1.25, .8, .45] : [.8 + .25 * t, .85 + .2 * t, .8 + .2 * t], w = (.45 + .55 * t) * (seca ? .4 : 1);
        F.v(L0, up, 0, 1 - t, col, w); F.v(pp, up, .5, 1 - t, col, w); F.v(R0, up, 1, 1 - t, col, w);
      }
      for (let i = 0; i < seg; i++) { const a0 = base + i * 3, b0 = a0 + 3; F.i.push(a0, b0, a0 + 1, a0 + 1, b0, b0 + 1, a0 + 1, b0 + 1, a0 + 2, a0 + 2, b0 + 1, b0 + 2); }
    }
    return { trunk: T.geo(), leaves: F.geo(), tris: T.tris() + F.tris(), w: 11 + Math.abs(lean) * 2, h: Ht + 7, tint: [.86, .9, .86], cy: Ht + 2, rh: 4 };
  }
  const TPL = NAMES.map((n, i) => buildTree(SP[n], 1000 + i * 77)); TPL.push(buildConifer(3131), buildPalm(4242, 17, .7, .3, 2), buildPalm(5151, 20.5, .2, .12, 3), buildPalm(6161, 23.5, 1.2, .45, 1));
  ctx.vegStats = { trisPorPlantilla: TPL.map(t => t.tris) };

  // ───────── Impostores: cada plantilla renderizada de lado en un atlas 4×3 ─────────
  const GX = 4, GY = 4, TS = 256, imRT = new THREE.WebGLRenderTarget(GX * TS, GY * TS, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter });
  function bakeImpostors() {
    const rn = ctx.renderer, sc = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, 0, .1, 200);
    sc.add(new THREE.AmbientLight(0xffffff, 2.5)); const dl = new THREE.DirectionalLight(0xffffff, 1.4); dl.position.set(.3, 1, .6); sc.add(dl);
    const cc = new THREE.Color(); rn.getClearColor(cc); const prev = { ca: rn.getClearAlpha(), rt: rn.getRenderTarget(), ac: rn.autoClear, w: U.uWind.value, t: U.uTransl.value, sh: rn.shadowMap.enabled }; U.uWind.value = 0; U.uTransl.value = 0; rn.shadowMap.enabled = false;
    rn.setRenderTarget(imRT); rn.setClearColor(0x000000, 0); rn.clear(); rn.autoClear = false; imRT.scissorTest = true;
    TPL.forEach((t, i) => {
      const k = isPalm(i) ? 1 : 0, g = new THREE.Group(); g.add(new THREE.Mesh(t.trunk, k ? palmMat : barkMat), new THREE.Mesh(t.leaves, k ? frondMat : leafMat)); sc.add(g);
      cam.left = -t.w / 2; cam.right = t.w / 2; cam.top = t.h; cam.bottom = 0; cam.position.set(0, 0, 100); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
      const x = (i % GX) * TS, y = Math.floor(i / GX) * TS; imRT.viewport.set(x, y, TS, TS); imRT.scissor.set(x, y, TS, TS); rn.setRenderTarget(imRT); rn.render(sc, cam); sc.remove(g);
    });
    imRT.scissorTest = false; rn.setRenderTarget(prev.rt); rn.autoClear = prev.ac; rn.setClearColor(cc, prev.ca); U.uWind.value = prev.w; U.uTransl.value = prev.t; rn.shadowMap.enabled = prev.sh;
  }
  const imMat = new THREE.MeshLambertMaterial({ map: imRT.texture, alphaTest: .5, side: THREE.DoubleSide });
  imMat.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aTile;')
      .replace('#include <uv_vertex>', `#include <uv_vertex>\n vMapUv = (vec2(mod(aTile, ${GX}.0), floor(aTile / ${GX}.0)) + uv * vec2(1.0, 1.0)) / vec2(${GX}.0, ${GY}.0);`)
      .replace('#include <defaultnormal_vertex>', 'vec3 icn = instanceMatrix[3].xyz; vec3 transformedNormal = normalize((viewMatrix * vec4(normalize(normalize(cameraPosition - icn) * vec3(1.0, 0.0, 1.0) * 0.6 + vec3(0.0, 0.8, 0.0)), 0.0)).xyz);')
      .replace('#include <project_vertex>', `vec3 icr = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]); icr = normalize(vec3(icr.x, 0.0, icr.z));
        vec3 iwp = icn + icr * position.x * length(instanceMatrix[0].xyz) + vec3(0.0, position.y * length(instanceMatrix[1].xyz), 0.0);
        vec4 mvPosition = viewMatrix * vec4(iwp, 1.0); gl_Position = projectionMatrix * mvPosition;`);
  };
  imMat.customProgramCacheKey = () => 'vegImp';

  // ───────── Instancias ─────────
  const CAPN = Q.alta ? 220 : 110, NEARTOT = Q.alta ? 300 : 140, CAPF = 14000, NEAR_R = Q.alta ? 280 : 170, FAR_R = Q.alta ? 2800 : 1800;
  const near = TPL.map((t, i) => {
    const pal = isPalm(i), tr = new THREE.InstancedMesh(t.trunk, pal ? palmMat : barkMat, CAPN), lv = new THREE.InstancedMesh(t.leaves, pal ? frondMat : leafMat, CAPN);
    tr.customDepthMaterial = barkDepth; lv.customDepthMaterial = pal ? frondDepth : leafDepth;
    for (const m of [tr, lv]) { m.frustumCulled = false; m.castShadow = m.receiveShadow = Q.alta; m.count = 0; scene.add(m); }
    lv.setColorAt(0, new THREE.Color(1, 1, 1)); tr.setColorAt(0, new THREE.Color(1, 1, 1)); return { tr, lv };
  });
  const qg = new THREE.BufferGeometry(); qg.setAttribute('position', new THREE.Float32BufferAttribute([-.5, 0, 0, .5, 0, 0, .5, 1, 0, -.5, 1, 0], 3)); qg.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 3)); qg.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2)); qg.setIndex([0, 1, 2, 0, 2, 3]);
  const tileAttr = new THREE.InstancedBufferAttribute(new Float32Array(CAPF), 1); qg.setAttribute('aTile', tileAttr);
  const imp = new THREE.InstancedMesh(qg, imMat, CAPF); imp.frustumCulled = false; imp.count = 0; scene.add(imp);
  // Sombra moteada propia bajo la copa de los árboles de calle: mancha de luz y sombra que se mueve con el viento y se suma a la
  // sombra real (el mapa de sombras del motor, 2048 px en 340 m, la deja como un borrón).
  const dapTex = ctx.canvasTex(512, 512, (g, w) => {
    const r = mul(88), c = w / 2; g.clearRect(0, 0, w, w);
    for (let i = 0; i < 7000; i++) { const a = r() * TAU, d = Math.pow(r(), .6) * c * .94, x = c + Math.cos(a) * d, y = c + Math.sin(a) * d, f = 1 - d / (c * .96); g.fillStyle = `rgba(0,0,0,${(.05 + .12 * f).toFixed(3)})`; g.beginPath(); g.ellipse(x, y, 4 + r() * 16 * (1 + f), 3 + r() * 10, r() * 3, 0, TAU); g.fill(); }
    g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 900; i++) { const a = r() * TAU, d = Math.pow(r(), .6) * c * .9, x = c + Math.cos(a) * d, y = c + Math.sin(a) * d, q = r(); g.fillStyle = `rgba(0,0,0,${(.35 + r() * .55).toFixed(2)})`; g.beginPath(); g.ellipse(x, y, 1.5 + q * q * 11, 1.5 + r() * 5, r() * 3, 0, TAU); g.fill(); }
  });
  const dapMat = new THREE.MeshBasicMaterial({ color: 0x000000, map: dapTex, transparent: true, depthWrite: false, opacity: .5, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 });
  dapMat.onBeforeCompile = sh => { sh.uniforms.uTime = U.uTime; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime;').replace('#include <uv_vertex>', '#include <uv_vertex>\n float dph = dot(instanceMatrix[3].xz, vec2(0.071, 0.053)); vMapUv += vec2(sin(uTime * 0.83 + dph) + 0.45 * sin(uTime * 1.97 + dph * 1.7), 0.55 * cos(uTime * 0.61 + dph * 1.3)) * 0.012;'); };
  dapMat.customProgramCacheKey = () => 'vegDap';
  const DCAP = 600, dap = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), dapMat, DCAP); dap.frustumCulled = false; dap.count = 0; dap.renderOrder = 2; scene.add(dap);
  const lastSun = V3();

  // árboles colocados: posición, giro, escala, plantilla, tinte
  let NT = 0, TX, TY, TZ, TR, TSc, TK, TC, TF; const TMP = [], ST = 10;
  // flags: 1 = árbol de calle (sombra moteada propia), 2 = tronco encalado
  const add = (x, y, z, k, s, r, fl = 0) => { const h = (r() - .5) * .08, l = .84 + r() * .26; TMP.push(x, y, z, r() * TAU, s, k, h, l, fl, 0); };

  // ───────── Colocación (dentro de ready: hace falta la foto base y los hitos) ─────────
  ctx.ready.push(function vegetacion() {
    const Vg = D.veg, VIA = D.via, r = mul(777), o = {};
    // rejilla de la ruta (celdas de 12 m) para no plantar sobre ninguna pasada del recorrido
    const RG = new Map(), RC = 12; for (let i = 0; i < N; i++) { const k = Math.floor(R.x[i] / RC) + ',' + Math.floor(R.z[i] / RC); let a = RG.get(k); if (!a) RG.set(k, a = []); a.push(i); }
    const routeDist = (x, z, skipI = -1) => { const cx = Math.floor(x / RC), cz = Math.floor(z / RC); let best = 1e9; for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) { const L = RG.get((cx + a) + ',' + (cz + b)); if (L) for (const i of L) { if (skipI >= 0 && Math.abs(i - skipI) < 12) continue; const d = (R.x[i] - x) ** 2 + (R.z[i] - z) ** 2; if (d < best) best = d; } } return Math.sqrt(best); };
    const occ = new Set(), cell = (x, z, c) => Math.floor(x / c) + ',' + Math.floor(z / c);
    const free = (x, z, c = 6) => { const k = c + ':' + cell(x, z, c); if (occ.has(k)) return false; occ.add(k); return true; };
    const bad = (s, x, z) => ctx.cubierto(s) || ctx.enElevado(s) || ctx.quitado(x, z);
    const ki = n => NAMES.indexOf(n), palmK = () => PALM0 + ((r() * NPALM) | 0);
    const pickSide = (dn, flor) => { const q = r(); if (dn >= 3) return q < .46 ? ki('saman') : q < .7 ? ki('caobo') : q < .8 ? ki('mijao') : q < .9 ? (flor ? ki('apamateFlor') : ki('apamate')) : (flor ? ki('araguaneyFlor') : ki('araguaney')); return q < .26 ? ki('caobo') : q < .44 ? ki('saman') : q < .62 ? (flor ? ki('apamateFlor') : ki('apamate')) : q < .82 ? (flor ? ki('araguaneyFlor') : ki('araguaney')) : q < .94 ? ki('mijao') : ki('ceiba'); };
    const pickPark = () => { const q = r(), f = r() < .06; /* en el video (marzo) casi ningún árbol está en flor */ return q < .22 ? ki('mango') : q < .4 ? ki('saman') : q < .55 ? ki('caobo') : q < .65 ? ki('mijao') : q < .74 ? ki('ceiba') : q < .87 ? (f ? ki('apamateFlor') : ki('apamate')) : (f ? ki('araguaneyFlor') : ki('araguaney')); };
    const bins = Vg ? Vg.L.length : 0, BW = Vg ? Vg.paso * 1000 : 50;
    const halfW = b => { const c = VIA.calzadas[b] || 1, a = VIA.ancho[b] || 14; return clamp(c === 2 ? a * .27 : a * .5, ROAD_W / 2, 13); };
    for (let b = 0; b < bins; b++) {
      const s0 = ctx.sOfKm(b * BW / 1000) - BW / 2, hw = halfW(b), sep = VIA.sep[b] || '', c2 = (VIA.calzadas[b] || 1) === 2;
      for (const side of [1, -1]) {
        const Lft = side === 1, vf = Lft ? Vg.L[b] : Vg.R[b], dn = Vg.denL ? (Lft ? Vg.denL[b] : Vg.denR[b]) : -1, pl = Vg.palL ? (Lft ? Vg.palL[b] : Vg.palR[b]) : 0;
        const p1 = dn >= 0 ? (clamp((vf - .1) / .38, 0, 1) + dn / 3) / 2 : clamp((vf - .1) / .38, 0, 1);
        const tipo = (Lft ? VIA.L.tipo[b] : VIA.R.tipo[b]) || '', ret = (Lft ? VIA.L.retiro[b] : VIA.R.retiro[b]) || 4;
        // a la izquierda, en avenida de dos calzadas: isla central (si tiene árboles/grama) o la acera del otro lado
        const isla = Lft && c2 && /isla/.test(sep), across = Lft && c2 && !isla;
        // borde real de la calle (módulo calzada) si existe; si no, estimación por el ancho del video
        const CZ = typeof ctx.calzada === 'function' ? ctx.calzada : null;
        const offAt = (s, j) => {
          if (CZ) { const c = CZ(s); if (Lft && c.sepAncho > 1.4 && /isla/.test(c.sep || '')) return c.izq - c.contraria.ancho - c.sepAncho / 2 + (j - .5) * Math.max(0, c.sepAncho - 1.6);
            const e = Lft ? c.izq : c.der, a = Lft ? c.aceraIzq : c.aceraDer; return e + (a > 1.6 ? clamp(.8 + j * .7, .6, a - .6) : Math.max(.5, a * .6)); }
          return (isla ? hw + 1.6 : across ? hw * 2 + 3 + clamp(ret * .4, 1.2, 3) : hw + clamp(ret * .45, 1.4, 3.2)) + (j - .3) * 1.2;
        };
        const off = offAt(s0 + BW / 2, .5);
        const palRow = pl > .45, nTrees = palRow ? Math.round(BW / (7.5 + r() * 2)) : Math.floor(p1 * (dn >= 3 ? 5.2 : 4.4) + r());
        for (let q = 0; q < nTrees; q++) {
          const s = s0 + (q + .5 + (palRow ? .05 : .35) * (r() - .5)) * BW / nTrees; if (s < 15 || s > TOTAL - 10) continue;
          P(s, o); const d = offAt(s, palRow ? .5 : r()) * side, x = o.x + o.tz * d, z = o.z - o.tx * d;
          if (bad(s, x, z) || routeDist(x, z) < ROAD_W / 2 + .6 || (ctx.calzadaLibre && !ctx.calzadaLibre(x, z)) || !free(x, z, 4)) continue;
          const palm = palRow || r() < pl, k = palm ? palmK() : pickSide(dn, r() < .05), sc = palm ? .82 + r() * .36 : .8 + r() * .42, km = ctx.kmOf(s);
          add(x, o.y - .1, z, k, sc, r, 1 | (!palm && km > 33.3 && km < 39.3 && r() < .75 ? 2 : 0));
        }
        // filas de fondo y masas de parque donde la foto es verde
        for (let f = 0; f < 9; f++) {
          const s = s0 + r() * BW; if (s < 15 || s > TOTAL - 10) continue; P(s, o);
          const dd = (off + 6 + f * 13 + r() * 9) * side, x = o.x + o.tz * dd, z = o.z - o.tx * dd;
          if (!ctx.isGreen(ctx.sample(x, z)) || bad(s, x, z)) continue;
          const gh = hT(x, z); if (Math.abs(gh - o.e) > 14 && Math.abs(dd) > 40) continue; // no subir a los cerros
          if (routeDist(x, z) < ROAD_W / 2 + 3 || (ctx.calzadaLibre && !ctx.calzadaLibre(x, z)) || !free(x, z, 7)) continue;
          const k = /parque/.test(tipo) || f > 2 ? pickPark() : pickSide(Math.max(0, dn), r() < .05);
          const kmq = ctx.kmOf(s), cas = r() < (kmq > 15.4 && kmq < 18.8 ? .38 : .06);
          add(x, Y(gh) - ctx.GAP - .2, z, r() < pl * .5 ? palmK() : cas ? CAS : k, .75 + r() * .45, r);
        }
      }
    }
    // árboles sembrados por las correcciones (después del reparto, para no alterar la semilla de los demás)
    { const rr = mul(4242), G = D.meta.geo;
      for (const a of ARBOLES) { const x = (a.ll[1] - G.lon0) * G.kx, z = -(a.ll[0] - G.lat0) * G.kz, ke = a.especie ? ki(a.especie) : -1, k = a.especie === 'palma' ? palmK() : ke >= 0 ? ke : pickPark(), H = isPalm(k) ? 19 : (SP[NAMES[k]] || { H: 15 }).H;
        add(x, Y(hT(x, z)) - ctx.GAP - .2, z, k, a.alto ? clamp(a.alto / H, .45, 1.6) : .8 + rr() * .4, rr); } }
    NT = TMP.length / ST; TX = new Float32Array(NT); TY = new Float32Array(NT); TZ = new Float32Array(NT); TR = new Float32Array(NT); TSc = new Float32Array(NT); TK = new Uint8Array(NT); TC = new Float32Array(NT * 3); TF = new Uint8Array(NT);
    // tono: verde medido en el video (≈ 46,65,37) × matiz de la especie × variación por árbol
    const G = [1.14, 1.08, 1.04];
    for (let i = 0; i < NT; i++) { const j = i * ST; TX[i] = TMP[j]; TY[i] = TMP[j + 1]; TZ[i] = TMP[j + 2]; TR[i] = TMP[j + 3]; TSc[i] = TMP[j + 4]; TK[i] = TMP[j + 5]; TF[i] = TMP[j + 8]; const tn = TPL[TK[i]].tint, L = TMP[j + 7], h = TMP[j + 6]; TC[i * 3] = G[0] * tn[0] * L * (1 + h); TC[i * 3 + 1] = G[1] * tn[1] * L; TC[i * 3 + 2] = G[2] * tn[2] * L * (1 - h); }
    TMP.length = 0; ctx.vegStats.arboles = NT;
    bakeImpostors(); placeGrass.ready = true; dirty = true;
  });

  // ───────── Reparto cerca/lejos (cada vez que la cámara se mueve o gira) ─────────
  const lastPos = V3(1e9, 0, 0), lastFwd = V3(), fwd = V3(); let dirty = true;
  const hist = new Int32Array(64), cand = new Int32Array(200000), candD = new Float32Array(200000), cnt = new Int32Array(TPL.length);
  function rebuild() {
    const cp = ctx.camera.position; ctx.camera.getWorldDirection(fwd); lastPos.copy(cp); lastFwd.copy(fwd);
    hist.fill(0); cnt.fill(0); let nc = 0, nf = 0; const F2 = FAR_R * FAR_R, BIN = NEAR_R / 63;
    const iA = imp.instanceMatrix.array, tA = tileAttr.array;
    for (let i = 0; i < NT; i++) {
      const dx = TX[i] - cp.x, dy = TY[i] + 8 - cp.y, dz = TZ[i] - cp.z, d2 = dx * dx + dy * dy + dz * dz; if (d2 > F2) continue;
      const d = Math.sqrt(d2); if (d > 70 && (dx * fwd.x + dy * fwd.y + dz * fwd.z) < .22 * d) continue;
      if (d < NEAR_R && nc < cand.length) { cand[nc] = i; candD[nc++] = d; hist[Math.min(63, (d / BIN) | 0)] += TPL[TK[i]].tris; continue; }
      if (nf >= CAPF) continue; const t = TPL[TK[i]], s = TSc[i], o = nf * 16;
      iA[o] = t.w * s; iA[o + 1] = 0; iA[o + 2] = 0; iA[o + 3] = 0; iA[o + 4] = 0; iA[o + 5] = t.h * s; iA[o + 6] = 0; iA[o + 7] = 0; iA[o + 8] = 0; iA[o + 9] = 0; iA[o + 10] = 1; iA[o + 11] = 0; iA[o + 12] = TX[i]; iA[o + 13] = TY[i]; iA[o + 14] = TZ[i]; iA[o + 15] = 1;
      tA[nf++] = TK[i];
    }
    const sd = ctx.sunDir, dA = dap.instanceMatrix.array; let nd = 0; lastSun.copy(sd);
    let thr = NEAR_R, cum = 0; for (let b = 0; b < 64; b++) { cum += hist[b]; if (cum > NEARTOT * 1100) { thr = b * BIN; break; } }
    for (let q = 0; q < nc; q++) {
      const i = cand[q], k = TK[i], s = TSc[i];
      if (candD[q] > thr || cnt[k] >= CAPN) { if (nf >= CAPF) continue; const t = TPL[k], o = nf * 16; iA.fill(0, o, o + 16); iA[o] = t.w * s; iA[o + 5] = t.h * s; iA[o + 10] = 1; iA[o + 12] = TX[i]; iA[o + 13] = TY[i]; iA[o + 14] = TZ[i]; iA[o + 15] = 1; tA[nf++] = k; continue; }
      const n = near[k], j = cnt[k]++, o = j * 16, cs = Math.cos(TR[i]) * s, sn = Math.sin(TR[i]) * s;
      for (const m of [n.tr.instanceMatrix.array, n.lv.instanceMatrix.array]) { m[o] = cs; m[o + 1] = 0; m[o + 2] = -sn; m[o + 3] = 0; m[o + 4] = 0; m[o + 5] = s; m[o + 6] = 0; m[o + 7] = 0; m[o + 8] = sn; m[o + 9] = 0; m[o + 10] = cs; m[o + 11] = 0; m[o + 12] = TX[i]; m[o + 13] = TY[i]; m[o + 14] = TZ[i]; m[o + 15] = 1; }
      const ca = n.lv.instanceColor.array; ca[j * 3] = TC[i * 3]; ca[j * 3 + 1] = TC[i * 3 + 1]; ca[j * 3 + 2] = TC[i * 3 + 2];
      const tc = n.tr.instanceColor.array; tc[j * 3] = tc[j * 3 + 1] = 1; tc[j * 3 + 2] = TF[i] & 2 ? 3 : 1;
      if ((TF[i] & 1) && nd < DCAP && sd.y > .12) { const t = TPL[k], hc = t.cy * s, D = (isPalm(k) ? 7 : t.rh * 1.85) * s, o2 = nd * 16, c2 = Math.cos(TR[i] * 1.7) * D, s2 = Math.sin(TR[i] * 1.7) * D;
        dA[o2] = c2; dA[o2 + 1] = 0; dA[o2 + 2] = -s2; dA[o2 + 3] = 0; dA[o2 + 4] = 0; dA[o2 + 5] = 1; dA[o2 + 6] = 0; dA[o2 + 7] = 0; dA[o2 + 8] = s2; dA[o2 + 9] = 0; dA[o2 + 10] = c2; dA[o2 + 11] = 0;
        dA[o2 + 12] = TX[i] - sd.x / sd.y * hc; dA[o2 + 13] = TY[i] + .13; dA[o2 + 14] = TZ[i] - sd.z / sd.y * hc; dA[o2 + 15] = 1; nd++; }
    }
    near.forEach((n, k) => { n.tr.count = n.lv.count = cnt[k]; n.tr.instanceMatrix.needsUpdate = n.lv.instanceMatrix.needsUpdate = n.lv.instanceColor.needsUpdate = n.tr.instanceColor.needsUpdate = true; });
    dap.count = nd; dap.instanceMatrix.needsUpdate = true;
    imp.count = nf; imp.instanceMatrix.needsUpdate = true; tileAttr.needsUpdate = true;
    ctx.vegStats.cerca = Array.from(cnt).reduce((a, b) => a + b, 0); ctx.vegStats.impostores = nf; ctx.vegStats.radioCerca = thr;
    ctx.vegStats.tris = near.reduce((a, n, k) => a + cnt[k] * TPL[k].tris, 0) + nf * 2 + grassN * 6 + mataN * 20;
  }

  // ───────── Grama y matas alrededor del corredor ─────────
  const GCAP = Q.alta ? 5000 : 1800, MCAP = 500;
  const tuftGeo = (() => { const B = new Builder(); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI, ca = Math.cos(a) * .4, sa = Math.sin(a) * .4, b = B.p.length / 3; for (const [u, v] of [[0, 0], [1, 0], [1, 1], [0, 1]]) { const p = V3((u * 2 - 1) * ca * .8, v * .3, (u * 2 - 1) * sa * .8), k2 = .55 + .5 * v; B.v(p, V3(0, 1, 0), u, v, [k2, k2, k2 * .95], v); } B.i.push(b, b + 1, b + 2, b, b + 2, b + 3); } return B.geo(); })();
  // matas de isla: agave (pencas rígidas), croto (hojas pintadas) y trinitaria (fucsia)
  const agaveGeo = (() => { const B = new Builder(), r = mul(71); for (let k = 0; k < 16; k++) { const a = k * 2.4 + r() * .3, el = .55 + (k / 16) * .8 + r() * .15, L = .55 + r() * .35, w = .07 + r() * .03, d = V3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)), sd = V3(-Math.sin(a), 0, Math.cos(a)), b = B.p.length / 3, tip = d.clone().multiplyScalar(L).add(V3(0, -.08 * Math.cos(el), 0));
      for (const [p, u, v] of [[sd.clone().multiplyScalar(-w), .76, 0], [sd.clone().multiplyScalar(w), .99, 0], [tip, .875, .48]]) { const k2 = .6 + .5 * v; B.v(p.add(V3(0, .05, 0)), d.clone().cross(sd).normalize().negate().add(V3(0, .5, 0)).normalize(), u, v, [k2, k2, k2], v * .3); } B.i.push(b, b + 1, b + 2, b, b + 2, b + 1); } return B.geo(); })();
  const bush = (tile, n, rad, hgt, sz, seed) => { const B = new Builder(), r = mul(seed), ctr = V3(0, hgt * .35, 0); for (let k = 0; k < n; k++) { const a = r() * TAU, d = Math.sqrt(r()) * rad, cp = V3(Math.cos(a) * d, hgt * (.35 + r() * .6), Math.sin(a) * d * .85); card(B, cp, sz * (.8 + r() * .4), ctr, tile, r, hgt * 1.4, rad + .3, .95, .1); } return B.geo(); };
  const MT = [new THREE.InstancedMesh(agaveGeo, leafMat, 200), new THREE.InstancedMesh(bush(5, 9, .45, .9, .75, 72), leafMat, 200), new THREE.InstancedMesh(bush(6, 16, .8, 1.4, .7, 73), leafMat, 200)];
  const grass = new THREE.InstancedMesh(tuftGeo, grassMat, GCAP);
  for (const m of [grass, ...MT]) { m.frustumCulled = false; m.count = 0; m.receiveShadow = Q.alta; m.setColorAt(0, new THREE.Color(1, 1, 1)); scene.add(m); }
  for (const m of MT) { m.castShadow = Q.alta; m.customDepthMaterial = leafDepth; }
  let grassN = 0, mataN = 0, lastGS = -1e9; const mN = [0, 0, 0];
  function placeGrass(sNow) {
    lastGS = sNow; grassN = mataN = 0; mN.fill(0); const o = {}, VIA = D.via, gA = grass.instanceMatrix.array, gc = grass.instanceColor.array;
    const put = (A, n, x, y, z, rot, s) => { const o2 = n * 16, c = Math.cos(rot) * s, sn = Math.sin(rot) * s; A[o2] = c; A[o2 + 1] = 0; A[o2 + 2] = -sn; A[o2 + 3] = 0; A[o2 + 4] = 0; A[o2 + 5] = s; A[o2 + 6] = 0; A[o2 + 7] = 0; A[o2 + 8] = sn; A[o2 + 9] = 0; A[o2 + 10] = c; A[o2 + 11] = 0; A[o2 + 12] = x; A[o2 + 13] = y; A[o2 + 14] = z; A[o2 + 15] = 1; };
    for (let s = Math.max(15, sNow - 110); s < Math.min(TOTAL - 5, sNow + 240); s += 1.7) {
      const si = Math.round(s / 1.7); if (ctx.cubierto(s) || ctx.enElevado(s)) continue; P(s, o);
      const b = clamp(Math.round(ctx.kmOf(s) / VIA.paso), 0, VIA.sep.length - 1), c2 = (VIA.calzadas[b] || 1) === 2, sep = VIA.sep[b] || '', hw = clamp(c2 ? (VIA.ancho[b] || 14) * .27 : (VIA.ancho[b] || 14) * .5, ROAD_W / 2, 13);
      for (const side of [1, -1]) {
        const cz = typeof ctx.calzada === 'function' ? ctx.calzada(s) : null;
        const isla = side === 1 && (cz ? cz.sepAncho > 1.2 && /isla/.test(cz.sep || '') : c2 && /isla/.test(sep)), parque = /parque/.test((side === 1 ? VIA.L.tipo[b] : VIA.R.tipo[b]) || '');
        // grama seca y rala, con calvas (ruido de baja frecuencia a lo largo de la vía)
        const calva = Math.sin(s * .093 + side) + Math.sin(s * .217 + 2) * .7;
        for (let k = 0; k < (isla ? 4 : 6); k++) {
          const h1 = hash(si * 2 + (side > 0 ? 1 : 0), k), h2 = hash(si + 31 * k, 7 + side), h3 = hash(si * 3 + k, 99);
          if (!isla && !parque) continue; if (calva > .55 && h2 > .12) continue;
          let d = isla ? (cz ? cz.izq - cz.contraria.ancho - cz.sepAncho + .3 + h1 * (cz.sepAncho - .6) : hw + .4 + h1 * 3) : (cz ? (side > 0 ? cz.izq + cz.aceraIzq : cz.der + cz.aceraDer) + .6 : hw + 2.5) + h1 * 14;
          const x = o.x + o.tz * d * side, z = o.z - o.tx * d * side;
          if (!isla && !ctx.isGreen(ctx.sample(x, z))) continue; if (ctx.quitado(x, z)) continue;
          if (!isla && ctx.calzadaLibre && !ctx.calzadaLibre(x, z)) continue;
          const y = isla ? o.y + .18 : d < 12 ? o.y + .1 : Y(hT(x, z)) - ctx.GAP + .2;
          if (h2 < (isla ? .08 : .05)) { const t = h3 < .45 ? 0 : h3 < .88 ? 1 : 2, m = MT[t]; if (mN[t] < 200) { put(m.instanceMatrix.array, mN[t], x, y, z, h1 * TAU, t === 0 ? .9 + h3 : t === 1 ? .7 + h1 * .5 : .55 + h1 * .35); const c = m.instanceColor.array, j = mN[t] * 3; c[j] = c[j + 1] = c[j + 2] = .85 + h1 * .25; mN[t]++; mataN++; } }
          else if (grassN < GCAP) { put(gA, grassN, x, y, z, h3 * TAU, .7 + h2 * .6); const L = .78 + h3 * .3, yel = .12 + h2 * .25; gc[grassN * 3] = L * (1 + yel); gc[grassN * 3 + 1] = L * (.95 + yel * .3); gc[grassN * 3 + 2] = L * (.62 - yel * .3); grassN++; }
        }
      }
    }
    grass.count = grassN; grass.instanceMatrix.needsUpdate = grass.instanceColor.needsUpdate = true; MT.forEach((m, t) => { m.count = mN[t]; m.instanceMatrix.needsUpdate = m.instanceColor.needsUpdate = true; });
  }

  // ───────── Cada cuadro: viento, luz de translucidez y reparto ─────────
  const sv = V3(), m3 = new THREE.Matrix3();
  ctx.frameHooks.push((noche, t, dt, p) => {
    U.uTime.value = t;
    sv.copy(ctx.sunDir).transformDirection(ctx.camera.matrixWorldInverse); U.uSunV.value.copy(sv);
    const k = clamp(ctx.sunDir.y * 6, 0, 1) * (1 - noche); U.uSunCol.value.copy(ctx.sun.color).multiplyScalar(ctx.sun.intensity * .35 * k);
    if (!NT) return;
    ctx.camera.getWorldDirection(fwd);
    dapMat.opacity = .36 * clamp((ctx.sunDir.y - .1) * 4, 0, 1) * (1 - noche); dap.visible = dapMat.opacity > .01;
    if (dirty || lastPos.distanceToSquared(ctx.camera.position) > 22 * 22 || fwd.dot(lastFwd) < .965 || lastSun.distanceToSquared(ctx.sunDir) > .002) { dirty = false; rebuild(); }
    const sNow = ctx.S ? ctx.S.s : 0; if (placeGrass.ready && Math.abs(sNow - lastGS) > 25) placeGrass(sNow);
  });
}
