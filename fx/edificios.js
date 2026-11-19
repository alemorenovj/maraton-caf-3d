// fx/edificios.js — Edificios de Caracas: sustituye la extrusión del motor.
// Cada huella real se levanta a su altura con UN solo material (MeshStandard + shader de fachada) que,
// según el arquetipo que viaja por vértice, dibuja: ventanas con cuartos falsos detrás (interior mapping),
// marcos y alféizares en relieve, reflejo del cielo, santamarías y letreros en planta baja, suciedad y
// chorreaduras, y de noche cuartos encendidos. Cerca de la ruta (< 60 m) balcones, toldos, aires y tanques
// son geometría real, construida por zonas a medida que el corredor se acerca.
//
// Arquetipos: 0 residencial (balcón corrido o ventanas punzonadas) · 1 torre de vidrio · 2 comercial bajo
// · 3 concreto con parasoles · 4 casa/quinta · 5 barrio (bloque rojo sin frisar) · 6 galpón.
// Piezas: 7 losa/concreto · 8 antepecho/baranda · 9 techo (foto satelital) · 10 tanque · 11 toldo · 12 aire acondicionado.

export const meta = { id: 'edificios', reemplaza: ['edificios'] };

const RES = 0, VID = 1, COM = 2, BRI = 3, CASA = 4, BAR = 5, GAL = 6, LOSA = 7, PAR = 8, TECHO = 9, TANQ = 10, TOLDO = 11, AC = 12, LETRERO = 13, VALLA = 14, TEJA = 15;
// tramos con murales en planta baja (Av. Bolívar, San Martín, Francisco de Miranda) y el centro viejo (El Silencio)
const MURALES = [[.5, 2.3], [3.6, 5.6], [35.8, 39.6]], SILENCIO = [2.5, 3.5];
const enKm = (k, rs) => rs.some(([a, b]) => k >= a && k <= b);
const DBG = typeof location !== 'undefined' && /edifdbg=1/.test(location.search);   // depuración: ?edifdbg=1 (expone window.__edif y las banderas edq)
const ARQ = { RES, VID, COM, BRI, CASA, BAR, GAL };
const FH = 3.2, GFH = 4.2;             // módulo de piso y altura mínima de la planta baja comercial
// ancho de vano por arquetipo (debe coincidir con el shader)
const bayW = (a, alt) => a === RES ? (alt ? 3.2 : 3.0) : a === VID ? 1.5 : a === COM ? 3.0 : a === BRI ? 1.1 : a === CASA ? 4.0 : a === BAR ? 3.0 : a === GAL ? 6.0 : 3.0;
const shopW = seed => 3.5 + 2.0 * fr(seed * 7.13);
function fr(x) { return x - Math.floor(x); }

// ───────────────────────── shader de fachada ─────────────────────────
const GLSL_PARS = /* glsl */`
uniform float uNight; uniform float uAmb; uniform sampler2D uSat; uniform vec3 uTint; uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uSunDir; uniform vec3 uSunCol;
varying vec2 vFac; varying vec4 vB; varying vec2 vG;
vec3 fEm; float fRough; float fMetal; float fH;
float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float h11(float n){ return h21(vec2(n, n * .618 + 3.1)); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + 1.), f.x), f.y); }
float fbm(vec2 p){ return vn(p) * .5 + vn(p * 2.03 + 7.1) * .3 + vn(p * 4.07 + 3.7) * .2; }
float bit(float f, float k){ return mod(floor(f / k), 2.); }
// rectángulo con antialias (w = metros por píxel)
float rectM(vec2 p, vec2 a, vec2 b, vec2 w){ vec2 s = smoothstep(a - w, a + w, p) * (1. - smoothstep(b - w, b + w, p)); return s.x * s.y; }
float band(float x, float a, float b, float w){ return smoothstep(a - w, a + w, x) * (1. - smoothstep(b - w, b + w, x)); }
vec3 lampC(float r){ return r < .45 ? vec3(1., .66, .36) : r < .75 ? vec3(1., .86, .66) : r < .93 ? vec3(.78, .9, 1.) : vec3(.55, .7, 1.); }
// Cuarto falso detrás del vidrio: p en metros dentro del vano [0,sz], rd = rayo en espacio tangente (z<0 entra)
vec3 room(vec2 p, vec2 sz, vec3 rd, float rid, float lit, vec3 lc, float deep){
#ifdef EDQ2
 return vec3(.05);
#endif
  float D = deep * (.8 + .5 * h11(rid * 3.7));
  vec3 r = vec3(rd.xy, min(rd.z, -.02)), o = vec3(clamp(p, vec2(.01), sz - .01), 0.);
  vec3 tp = (vec3(r.x > 0. ? sz.x : 0., r.y > 0. ? sz.y : 0., -D) - o) / r;
  float t = min(min(tp.x, tp.y), tp.z); vec3 h = o + r * t;
  vec3 wc = mix(vec3(.86, .82, .74), mix(vec3(.74, .8, .82), vec3(.85, .74, .66), h11(rid * 2.3)), h11(rid * 5.1)) * (.7 + .35 * h11(rid * 9.3)), c;
  if (t == tp.z) {
    c = wc;
    float fb = step(h.y, .55 + .5 * h11(rid * 2.)) * step(.35, h11(rid * 4.4)) * band(h.x, sz.x * h11(rid * 7.7) * .5, sz.x * (.5 + .5 * h11(rid * 8.1)), .02);
    c = mix(c, vec3(.22, .17, .14) * (.6 + h11(rid * 6.6)), fb);
    float pic = step(.6, h11(rid * 1.9)) * rectM(h.xy, vec2(sz.x * .3, 1.4), vec2(sz.x * .55, 2.0), vec2(.01));
    c = mix(c, vec3(.3, .35, .4) * h11(rid * 4.9) + .2, pic);
  } else if (t == tp.y) c = r.y > 0. ? vec3(.93, .91, .87) : vec3(.38, .3, .22) * (.6 + .7 * h11(rid * 8.8));
  else c = wc * .72;
  float dp = clamp(-h.z / D, 0., 1.);
  vec3 dayC = c * mix(1.1, .38, dp) * uAmb;
  float lamp = r.y > 0. && t == tp.y ? 1. + 3. * exp(-6. * dot(h.xz - vec2(sz.x * .5, -D * .5), h.xz - vec2(sz.x * .5, -D * .5)) / (D * D)) : 1.;
  vec3 nightC = c * lc * lit * lamp * (1.3 - .8 * dp) * 1.1;
  return dayC + nightC * uNight;
}
// Reflejo en el vidrio: cielo arriba, la ciudad de enfrente en una franja sobre el horizonte, la calle abajo
vec3 cityRefl(vec3 rv, float s){
#ifdef EDQ3
 return uHor;
#endif
  vec3 r = (vec4(rv, 0.) * viewMatrix).xyz;
  float e = r.y, az = atan(r.z, r.x);
  vec3 sky = mix(uHor, uTop, pow(clamp(e * 1.6, 0., 1.), .55));
  float sk = .08 + .45 * vn(vec2(az * 4. + s, 1.7)) * vn(vec2(az * 11. + s * 3., 4.1));
  float lum = dot(uHor, vec3(.3, .5, .2));
  vec3 bc = mix(vec3(.4, .37, .33), vec3(.66, .62, .56), vn(vec2(az * 50., 0.) + s)) * lum * .7;
  float wr = step(.45, fract(e * 70.)) * step(.35, fract(az * 90. + s));
  bc *= 1. - .5 * wr;
  bc += uNight * wr * step(.8, h21(floor(vec2(az * 90. + s, e * 70.)))) * vec3(1., .8, .55) * .5;
  vec3 c = mix(bc, sky, smoothstep(sk - .006, sk + .006, e));
  return mix(vec3(.16, .16, .17) * lum, c, smoothstep(-.03, .0, e));
}
vec3 gN, gV;
// rótulos: palabras reales de comercio escritas con letras de cinco trazos (palo izq., palo der., barra alta, media y baja).
// Con esos trazos salen A B C E F H I L O U; cada letra es una máscara de bits (1 izq · 2 der · 4 alta · 8 media · 16 baja).
const int PAL[72] = int[72](
  21, 15, 13, 29, 0, 0,    21, 23, 17, 15, 0, 0,    21, 19, 31, 23, 0, 0,    15, 17, 23, 29, 0, 0,
  17, 29, 21, 11, 29, 0,   11, 1, 29, 17, 23, 0,    17, 23, 21, 15, 17, 0,   17, 1, 21, 29, 23, 0,
  21, 1, 29, 17, 23, 0,    31, 29, 17, 17, 15, 0,   31, 15, 1, 17, 29, 0,    21, 15, 19, 21, 11, 23);
float letras(vec2 q, vec2 sz, float rid){
  float lh = sz.y * .52, lw = lh * .62, x0 = sz.x * .08, nl = floor((sz.x - 2. * x0) / lw), t = 0.;
  if (nl < 4.) return 0.;
  float hw = h21(vec2(rid * 13., 3.7));
  int w = nl < 5. ? int(hw * 4.) : nl < 6. ? int(hw * 11.) : int(hw * 12.); w = min(w, 11);
  int n = w < 4 ? 4 : w < 11 ? 5 : 6;
  float cx = (q.x - x0) / lw, li = floor(cx) - floor((nl - float(n)) * .5), lx = fract(cx), ly = (q.y - sz.y * .24) / lh, st = .2;
  if (li >= 0. && li < float(n) && ly > 0. && ly < 1. && lx < .82) {
    int p = PAL[w * 6 + int(li)];
    t = max(t, step(lx, st) * float(p & 1)); t = max(t, step(.82 - st, lx) * float((p >> 1) & 1));
    t = max(t, step(1. - st * .7, ly) * float((p >> 2) & 1)); t = max(t, step(.43, ly) * step(ly, .43 + st * .7) * float((p >> 3) & 1));
    t = max(t, step(ly, st * .7) * float((p >> 4) & 1));
  }
  return t;
}
// mural callejero: manchas de color planas con contorno oscuro
vec3 mural(vec2 p, float s){
  vec2 q = p * .16 + s * 3.7; q += vec2(vn(q * .6 + 3.), vn(q * .6 + 9.)) * 1.8;
  float n = vn(q) * .6 + vn(q * 2.3 + 5.) * .4, k = floor(n * 6.);
  vec3 c = .55 + .42 * cos(6.2831 * (vec3(0., .33, .67) + k * .21 + s));
  return mix(c, vec3(.07), smoothstep(.46, .5, abs(fract(n * 6.) - .5)) * .8);
}
// valla publicitaria: foto a la izquierda, marca y texto a la derecha
vec3 valla(vec2 q, vec2 sz, float r){
  vec2 t = q / sz; vec3 bg = .5 + .45 * cos(6.2831 * (vec3(0., .33, .67) + h11(r) * 3.)), c = bg;
  if (t.x < .46) { float n = vn(q * .5 + r * 7.); c = mix(vec3(.88, .72, .6), vec3(.22, .28, .38), n) * (.75 + .35 * vn(q * 1.7 + r)); c = mix(c, bg * .6, smoothstep(.3, .46, t.x)); }
  else c = mix(c, vec3(.97), letras(q - vec2(sz.x * .5, sz.y * .38), vec2(sz.x * .46, sz.y * .34), r));
  c = mix(c, h11(r * 3.) < .5 ? vec3(.97, .85, .15) : vec3(.95), step(length((t - vec2(.86, .2)) * vec2(sz.x / sz.y, 1.)), .17));
  return mix(c, vec3(.1), 1. - step(.012, t.x) * step(t.x, .988) * step(.03, t.y) * step(t.y, .97));
}
vec3 sunSpec(vec3 rv, float pw){ vec3 r = (vec4(rv, 0.) * viewMatrix).xyz; return uSunCol * pow(max(dot(r, uSunDir), 0.), pw) * 6.; }
vec3 vidrio(vec3 inn, float F0, float k){ float ct = clamp(dot(gN, -gV), 0., 1.), Fr = F0 + (1. - F0) * pow(1. - ct, 5.); vec3 rv = reflect(gV, gN); return inn * (1. - Fr) + (cityRefl(rv, 0.) * k + sunSpec(rv, 400.)) * Fr; }
vec3 perturbN(vec3 sp, vec3 sn, vec2 dH, float fd){
  vec3 sx = dFdx(sp), sy = dFdy(sp), r1 = cross(sy, sn), r2 = cross(sn, sx);
  float det = dot(sx, r1) * fd; vec3 g = sign(det) * (dH.x * r1 + dH.y * r2);
  return normalize(abs(det) * sn - g);
}
`;

const GLSL_FACADE = /* glsl */`
  {
  float arch = floor(vB.x + .5), seed = vB.y, flags = vB.z, H = vB.w;
  float U = vFac.x, V = vFac.y, hab = V - vG.x;
  vec2 w = max(fwidth(vFac) * .7, vec2(1e-4));
  float mpp = max(w.x, w.y);                     // metros por píxel (para el LOD del dibujo)
  vec3 C = vColor.rgb * .86, col = C;
  fEm = vec3(0.); fRough = .9; fMetal = 0.; fH = 0.;
  vec3 Nv = normalize(vNormal), upV = normalize((viewMatrix * vec4(0., 1., 0., 0.)).xyz);
  vec3 Tv = cross(upV, Nv); float tl = length(Tv); Tv = tl > .01 ? Tv / tl : vec3(1., 0., 0.);
  vec3 Bv = cross(Nv, Tv), Vv = -normalize(vViewPosition);
  vec3 rd = vec3(dot(Vv, Tv), dot(Vv, Bv), dot(Vv, Nv)); gN = Nv; gV = Vv;
  float geoB = bit(flags, 1.), shop = bit(flags, 2.), alt = bit(flags, 4.), rail = bit(flags, 8.);
  if (arch == 9.) {                                // techo: foto satelital
    vec3 s = texture2D(uSat, vFac).rgb;
    col = s * .45; fEm = s * uTint * .55; fRough = .95;
  } else if (arch >= 7.) {                         // piezas sueltas: losas, antepechos, tanques, toldos, aires
    float g = fbm(vec2(U, V) * 1.3 + seed);
    if (arch == 7.) { col = C * (.82 + .25 * g); col *= 1. - .25 * smoothstep(.2, 0., V) ; }
    else if (arch == 8.) { col = C * (.85 + .22 * g); col *= .9 + .1 * smoothstep(.0, .1, V); col *= 1. - .2 * (1. - smoothstep(0., .5, V)) * vn(vec2(U * 7., 1.)); }
    else if (arch == 10.) { col = C * (.9 + .15 * sin(V * 18.)) * (.85 + .2 * g); fRough = .55; }
    else if (arch == 11.) { float st = step(.5, fract(U / .36)); col = mix(C, vec3(.93, .92, .88), st * step(.4, fract(seed * 3.3))) * (.8 + .25 * g); fRough = .8; }
    else if (arch == 13.) { float t = letras(vec2(U, V), vec2(flags, H), seed); vec3 tc = dot(C, vec3(.33)) > .6 ? vec3(.08, .08, .12) : vec3(.98); col = mix(C, tc, t); fEm = col * (.06 + uNight * 1.6); }
    else if (arch == 14.) { col = valla(vec2(U, V), vec2(flags, H), seed); fEm = col * (.04 + uNight * .7); }
    else if (arch == 15.) { vec2 tq = vec2(U / .22 + .5 * mod(floor(V / .32), 2.), V / .32); float tl = fract(tq.y);
      col = vec3(.6, .29, .17) * (.72 + .4 * h21(floor(tq) + seed)) * (.62 + .38 * smoothstep(0., .75, tl)) * (.9 + .2 * sin(fract(tq.x) * 6.2831));
      col = mix(col, vec3(.32, .33, .26), smoothstep(.55, .85, vn(vec2(U, V) * .7 + seed)) * .55); fH = .03 * tl; }
    else { col = vec3(.82, .82, .78) * (.85 + .2 * g); float gr = band(fract(V / .05), .0, .5, .1); col *= .85 + .15 * gr; col *= 1. - .25 * smoothstep(.15, .0, V); fRough = .6; }
  } else {
    // ── variación de pintura, manchas y chorreaduras generales ──
    float pv = fbm(vec2(U, V) * vec2(.11, .09) + seed * 31.);
    C *= .82 + .32 * pv;
    float runoff = smoothstep(.55, .95, vn(vec2(U * 1.7 + seed * 9., V * .045))) * smoothstep(-6., 4., V - H + 10.) ;
    float streaks = smoothstep(.5, 1., vn(vec2(U * 3.3 + seed, V * .07))) * .5 + runoff * .7;
    C *= 1. - .22 * streaks;
    C *= mix(.62, 1., smoothstep(0., 1.6, hab));    // suciedad a ras de acera
    float old = bit(flags, 128.), medi = bit(flags, 32.), mur = bit(flags, 64.);
    if (arch != 1. && arch != 6.) {
      // paños repintados de otro tono (grupos de vanos × pisos) y manchas grandes de humedad
      float pbw = 5. + 7. * h11(seed * 1.7), pfh = 3.2 * (1. + floor(3. * h11(seed * 2.9)));
      vec2 pc = floor(vec2((U + seed * 3.) / pbw, V / pfh)); float rp = h21(pc + seed * 3.3);
      if (rp < .2) C *= vec3(.9 + .2 * h21(pc + 1.), .9 + .2 * h21(pc + 2.), .88 + .2 * h21(pc + 3.)) * (rp < .07 ? 1.1 : .88);
      float hm = smoothstep(.56, .8, vn(vec2(U * .07, V * .05) + seed * 7.) * .65 + vn(vec2(U * .25, V * .13) + seed) * .35);
      hm *= .4 + .6 * max(smoothstep(6., 0., H - V), smoothstep(3.5, 0., hab));
      C = mix(C, C * vec3(.62, .64, .6), hm * .55);
      if (mur > .5) C = mix(mural(vec2(U, V), seed), C, .12 + hm * .5);
    }
    col = C;
    float lit = 0.; vec3 lc = vec3(1.);
    // zona de planta baja (comercio) — su techo cae en la primera línea de piso sobre GFH
    float gTop = ceil((vG.x + ${GFH.toFixed(1)} - .01) / ${FH.toFixed(1)}) * ${FH.toFixed(1)};
    bool ground = (old > .5 && arch == 2.) || (arch == 2. || (arch == 0. && shop > .5) || arch == 3. || arch == 1.) && V < gTop && hab > -.5;
    if (old > .5 && V > H - .75 && V < H) {          // cornisa con su sombra
      col = V > H - .45 ? C * 1.15 + .06 : C * .55; fH = V > H - .45 ? .2 : .0;
    } else if (V > H) {                                     // antepecho de azotea
      col = C * 1.04; if (V > H + .85) col = C * 1.15 + .04; fH = .02 * step(H + .85, V);
    } else if (ground && old > .5) {                 // soportales (El Silencio): arcadas con pórtico en sombra
      float aw = 4.2, ai = floor((U + 1.) / aw), ax = U + 1. - ai * aw, pw = .8, r = (aw - pw) * .5, sp = min(2.7, gTop - vG.x - r - .5);
      float inA = band(ax, pw, aw, w.x) * max(step(hab, sp), step(length(vec2(ax - pw - r, hab - sp)), r));
      col = C * (1.05 + .1 * pv);
      col = mix(col, C * 1.18 + .05, band(hab, gTop - vG.x - .45, gTop - vG.x - .15, w.y));
      if (inA > .5) { float dp = clamp(hab / 3., 0., 1.); col = mix(vec3(.05), C * .3, dp * .5); fH = -.3;
        float sh = step(hab, 2.6) * band(ax, pw + .6, aw - .6, w.x); col = mix(col, vec3(.2, .21, .2) * (.85 + .15 * sin(hab * 74.)), sh * .8); }
      else fH = .05;
    } else if (ground && arch == 1.) {               // lobby de vidrio a doble altura
      float bw = 2.2, ci = floor(U / bw), px = U - ci * bw, cj = floor(U / (bw * 3.)), pj = U - cj * bw * 3.;
      float mull = 1. - band(px, .06, bw - .06, w.x);
      vec3 inn = room(vec2(pj, hab), vec2(bw * 3., gTop - vG.x), rd, h21(vec2(cj, 7.) + seed), step(.4, h11(seed + cj)), vec3(1., .9, .75), 12.);
      col = mix(vec3(.02), vec3(.1), mull); fEm = vidrio(inn * mix(.8, .35, uNight), .08, .8) * (1. - mull); fRough = mix(.06, .4, mull); fMetal = mull * .7; fH = -.1 * (1. - mull);
    } else if (ground) {                             // comercio: santamarías, letreros, grafiti
      float bw = ${'' }3.5 + 2. * fract(seed * 7.13), ci = floor(U / bw), px = U - ci * bw, rid = h21(vec2(ci, 3.) + seed * 13.);
      float gh = gTop - vG.x, sTop = 2.85, sgn0 = 3.2, sgn1 = min(gh - .25, 4.05);
      float pil = 1. - band(px, .4, bw, w.x);
      col = C * .92;
      if (pil < .5) {
        if (hab < sTop) {
          bool vit = arch == 2. && alt > .5;        // comercio moderno (Las Mercedes): vitrina de piso a techo, sin santamaría
          if (rid < .14 || vit) {                   // local abierto: vidriera con el interior detrás y reja
            vec2 q = vec2(px - .4, hab);
            col = vec3(.03); fRough = .06;
            fEm = vidrio(room(q, vec2(bw - .4, sTop), rd, rid * 91., step(.3, rid * 7.), vec3(1., .88, .7), 6.), .06, .8);
            float bars = vit ? 1. - band(fract(q.x / 1.7), .03, 1., w.x / 1.7) : band(fract(q.x / .14), .0, .12, w.x / .14);
            col = mix(col, vec3(.12, .12, .13), bars); fEm *= 1. - bars; fH = -.12 + bars * .1;
          } else {                                  // santamaría bajada (a las 6 a.m. casi todo cerrado)
            float k = h11(rid * 5.3);
            vec3 sc = k < .45 ? vec3(.56, .57, .56) : k < .6 ? vec3(.27, .42, .33) : k < .72 ? vec3(.26, .36, .55) : k < .85 ? vec3(.8, .79, .74) : vec3(.55, .2, .16);
            float rib = sin(hab * 6.2831 / .085);
            col = sc * (.82 + .14 * rib * (1. - smoothstep(.02, .06, w.y)));
            col *= .75 + .25 * smoothstep(0., .6, hab);
            col = mix(col, vec3(.4, .26, .16), smoothstep(.55, .9, vn(vec2(px * 2., hab * 3.) + rid * 9.)) * .35 * (1. - smoothstep(0., 1.2, hab)));
            fH = .006 * rib - .05; fMetal = .35; fRough = .55;
            // grafiti: manchones de color y trazos oscuros
            if (h11(rid * 2.7) < .14) {
              float gn = fbm(vec2(px, hab) * vec2(5.5, 7.) + rid * 17.) * band(px, bw * (.2 + .3 * h11(rid)), bw * (.55 + .3 * h11(rid * 3.)), .2) * band(hab, .7, 1.7, .15) * 1.25;
              vec3 gc = h11(rid * 4.1) < .5 ? vec3(.85, .2 + .6 * h11(rid), .7) : vec3(.15 + .8 * h11(rid * 6.), .3, .85 * h11(rid * 8.));
              float gm = smoothstep(.6, .63, gn);
              col = mix(col, gc, gm * .85);
              col = mix(col, vec3(.05), smoothstep(.02, .0, abs(gn - .52)) * .85);
            }
          }
        } else if (hab < sgn0) {                    // cajón de la santamaría
          col = vec3(.5, .5, .49) * (.9 + .1 * sin(hab * 40.)); fMetal = .3; fRough = .5; fH = .06;
        } else if (hab < sgn1 && (arch == 2. ? rid < .85 : rid < .45)) {   // letrero
          float k = h11(rid * 8.7);
          vec3 sb = k < .2 ? vec3(.82, .12, .1) : k < .4 ? vec3(.95, .78, .1) : k < .55 ? vec3(.1, .3, .7) : k < .7 ? vec3(.95, .95, .92) : k < .85 ? vec3(.1, .55, .3) : vec3(.95, .45, .1);
          if (arch == 2. && alt > .5) sb = k < .55 ? vec3(.94, .94, .92) : k < .8 ? vec3(.07, .07, .08) : sb;   // rótulos sobrios
          // rótulo: una palabra real de comercio (tabla PAL de GLSL_PARS), con letras de cinco trazos
          float sh = sgn1 - sgn0, lh = sh * .52, ly = hab - sgn0 - sh * .24, lw = lh * .62;
          float x0 = .9 + (bw - 1.4) * .5 * h11(rid * 2.2), nl = floor((bw - .5 - x0) / lw);
          float li = floor((px - x0) / lw), lx = (px - x0 - li * lw) / lw, lyy = ly / lh, hw = h21(vec2(rid * 13., 3.7));
          int wI = nl < 5. ? int(hw * 4.) : nl < 6. ? int(hw * 11.) : int(hw * 12.); wI = min(wI, 11); int nW = wI < 4 ? 4 : wI < 11 ? 5 : 6, pb = 0;
          float st = .2, txt = 0.;
          if (nl >= 4. && li >= 0. && li < float(nW) && lyy > 0. && lyy < 1. && lx < .82) { pb = PAL[wI * 6 + int(li)];
            txt = max(txt, step(lx, st) * float(pb & 1));
            txt = max(txt, step(.82 - st, lx) * float((pb >> 1) & 1));
            txt = max(txt, step(1. - st * .7, lyy) * float((pb >> 2) & 1));
            txt = max(txt, band(lyy, .43, .43 + st * .7, .01) * float((pb >> 3) & 1));
            txt = max(txt, step(lyy, st * .7) * float((pb >> 4) & 1));
            txt *= 1. - smoothstep(.04, .1, mpp);
          }
          vec3 tc = dot(sb, vec3(.33)) > .6 ? vec3(.1, .1, .15) : vec3(.97);
          col = mix(sb, tc, txt) * (.85 + .15 * pv); fH = .05; fRough = .5;
          fEm = mix(sb, tc, txt) * uNight * .5 * step(.5, h11(rid * 3.9));
        }
      } else col *= .9;
    } else {
      // ── pisos con ventanas ──
      float bw = ${'' }3.0, fh = ${FH.toFixed(1)}, wx0 = .5, wx1 = 2.5, wy0 = .95, wy1 = 2.5, dep = 4., gf = 0.;
      float frameW = .06, sill = 1., bars = 0., jal = 0., recess = .14, litF = .3, ac = .12;
      if (arch == 0.) {
        if (alt > .5) { bw = 3.2; wx0 = .55; wx1 = 2.65; }
        else { wx0 = .2; wx1 = 2.8; wy0 = geoB > .5 ? .05 : 1.05; wy1 = 2.75; sill = 0.; recess = .5; }
        bars = step(hab, 7.5); jal = step(.6, h11(seed * 3.1));
      } else if (arch == 1.) { bw = 1.5; wx0 = .04; wx1 = 1.46; wy0 = alt > .5 ? 1.05 : .95; wy1 = fh - .02; frameW = .0; sill = 0.; recess = .03; litF = .2; dep = 7.; ac = 0.; }
      else if (arch == 2.) { wx0 = .6; wx1 = 2.4; wy0 = 1.0; wy1 = 2.4; bars = step(.4, h11(seed * 5.)); jal = step(.5, h11(seed * 2.2)); if (alt > .5) { wx0 = .06; wx1 = 2.94; wy0 = .75; wy1 = 2.85; bars = 0.; jal = 0.; } }
      else if (arch == 3.) { bw = 1.1; wx0 = .14; wx1 = 1.1; wy0 = .3; wy1 = fh; sill = 0.; recess = .45; frameW = .03; ac = .04; }
      else if (arch == 4.) { bw = 4.; wx0 = 1.3; wx1 = 2.7; wy0 = 1.; wy1 = 2.3; bars = 1.; litF = .4; ac = .05; }
      else if (arch == 5.) { fh = 2.7; bw = 3.0; wx0 = .9; wx1 = 2.0; wy0 = 1.0; wy1 = 2.05; bars = step(.3, h11(seed)); litF = .45; jal = 1.; ac = .02; }
      else if (arch == 6.) { bw = 6.; wx0 = 1.; wx1 = 5.; wy0 = fh * 1.6; wy1 = fh * 1.6 + .9; bars = 0.; ac = 0.; litF = .1; }
      float uMax = vG.y;
      float ci = floor(U / bw), fi = floor(V / fh);
      vec2 p = vec2(U - ci * bw, V - fi * fh);
      float rid = h21(vec2(ci, fi) + seed * 57.);
      // muro de fondo según arquetipo
      if (arch == 5.) {                              // bloque de arcilla sin frisar + vigas y columnas de concreto
        float painted = bit(flags, 16.) * step(hab, H - 2.7 * step(.5, h11(seed * 2.)));
        vec2 bq = vec2(U / .4 + .5 * mod(floor(V / .2), 2.), V / .2);
        vec3 brick = vec3(.62, .33, .22) * (.78 + .35 * h21(floor(bq) + seed));
        float mort = (1. - band(fract(bq.x), .04, .96, w.x / .4)) + (1. - band(fract(bq.y), .07, .93, w.y / .2));
        brick = mix(brick, vec3(.62, .58, .52), clamp(mort, 0., 1.) * (1. - smoothstep(.02, .05, mpp)));
        brick = mix(brick, vec3(.6, .36, .26), smoothstep(.02, .06, mpp));
        float col_ = 1. - band(mod(U + 1.75, 3.5), .25, 3.5, w.x);
        float vig = 1. - band(p.y, .22, fh, w.y);
        col = mix(brick, C, painted);
        col = mix(col, vec3(.6, .59, .56) * (.8 + .3 * pv), max(col_, vig) * (1. - painted * .7));
        fH = -.01 * clamp(mort, 0., 1.) + .03 * max(col_, vig);
        if (rid < .35) { wx0 = 9.; }              // vano sin ventana
      } else if (arch == 6.) {                       // lámina acanalada
        float rib = sin(U * 6.2831 / .2);
        col = C * (.85 + .12 * rib * (1. - smoothstep(.03, .08, w.x)));
        col = mix(col, vec3(.45, .28, .18), smoothstep(.6, .95, vn(vec2(U * 1.5, V * .3) + seed)) * .45);
        fH = .015 * rib; fMetal = .25; fRough = .6;
        float door = band(U, uMax * .5 - 3., uMax * .5 + 3., w.x) * step(hab, 5.);
        col = mix(col, vec3(.25, .27, .28), door);
      } else if (arch == 3.) {                       // parasoles: aletas verticales y losas
        float fin = 1. - band(p.x, .12, bw, w.x), slab = 1. - band(p.y, .28, fh, w.y);
        float louv = alt * band(fract(p.y / .4), .0, .2, w.y / .4) * step(.5, p.y);
        col = C * (.95 + .1 * pv);
        fH = .35 * max(fin, slab) + .1 * louv;
        if (max(fin, slab) < .5) { col *= .5; }
        if (louv > .5) { col = C * .8; }
      } else if (arch == 0. && alt < .5) {           // balcón corrido: losa, antepecho pintado y fachada retirada
        float slab = 1. - band(p.y, .22, fh, w.y), para = (1. - geoB) * band(p.y, .22, 1.05, w.y);
        col = C;
        if (slab > .5) col = C * 1.12 + .05;
        else if (para > .5) { col = C * (rail > .5 ? .6 : 1.); }
        else col = C * (geoB > .5 ? .92 : .62);           // muro de fondo en sombra del volado
        fH = .5 * slab + .4 * para - .1;
      }
      if ((arch == 0. && alt > .5) || arch == 2. || arch == 4.) {   // canto de losa entre pisos
        float sb = 1. - band(p.y, .2, fh, w.y);
        col = mix(col, C * 1.08 + .03, sb * (1. - smoothstep(.1, .3, mpp))); fH += .03 * sb;
      }
      // ventana
      // balcones corridos variados: cerrados con vidrio, con reja o con ropa tendida
      float rbal = h21(vec2(ci, fi) + seed * 5.1);
      if (arch == 0. && alt < .5) { if (rbal < .16) { wx0 = .08; wx1 = bw - .08; frameW = .04; recess = .12; } else if (rbal < .28) bars = 1.; }
      if (old > .5) { wx0 = bw * .3; wx1 = bw * .7; wy0 = .7; wy1 = 2.75; }
      bool inCell = U >= 0. && U < uMax && fi * fh + wy1 < H + .3 && wx0 < bw && medi < .5;
      if (arch == 0. && geoB > .5 && alt > .5 && mod(ci, 2.) < .5) { wy0 = .05; }   // puerta de balcón
      float win = inCell ? rectM(p, vec2(wx0, wy0), vec2(wx1, wy1), w) : 0.;
      float isSlab = (arch == 0. && alt < .5) ? 1. - band(p.y, .22, fh, w.y) : 0.;
      win *= 1. - isSlab;
      if (old > .5) { float sr = inCell ? rectM(p, vec2(wx0 - .16, wy0 - .12), vec2(wx1 + .16, wy1 + .28), w) - win : 0.; col = mix(col, vec3(.93, .91, .85), sr); fH += .06 * sr; }
      if (arch != 1. && h11(rid * 11.3) < .035) { col = mix(col, arch == 5. ? vec3(.6, .36, .26) : C * vec3(.82, .8, .78), win); win = 0.; }   // ventana tapiada
      float ww = wx1 - wx0, wh = wy1 - wy0;
      // LOD: cuando la ventana es más pequeña que ~3 px se dibuja su promedio
      float lod = smoothstep(.25, .6, mpp / max(.4, min(ww, wh)) * 2.);
      lit = step(h11(rid * 7.1), litF); lc = lampC(h11(rid * 3.3));
      if (arch == 1.) { lit = step(h21(vec2(floor(ci / 4.), fi) + seed), litF); lc = vec3(.85, .93, 1.); }
      if (inCell) {
        // el vidrio está retirado 'recess' m: el rayo lo alcanza desplazado; si cae fuera del vano se ve el derrame (jamba, dintel, alféizar)
        vec2 q0 = p - vec2(wx0, wy0);
        vec2 q = q0 + rd.xy * (recess / max(-rd.z, .08));
        float inG = rectM(q, vec2(0.), vec2(ww, wh), w);
        float inner = rectM(q, vec2(frameW), vec2(ww - frameW, wh - frameW), w);
        float mid = arch == 1. ? 0. : band(q.x, ww * .5 - .025, ww * .5 + .025, w.x);
        float glass = inner * (arch == 1. ? 1. : 1. - mid) * win;
        float frame = (inG - inner * (arch == 1. ? 1. : 1. - mid)) * win;
        float reveal = (1. - inG) * win;
        vec3 revC = C * (q.y > wh ? .32 : q.y < 0. ? .95 : .55);
        // alféizar en relieve y chorreadura bajo él
        float sl = sill * rectM(p, vec2(wx0 - .07, wy0 - .08), vec2(wx1 + .07, wy0), w);
        float below = sill * band(p.x, wx0, wx1, w.x) * step(p.y, wy0 - .08) * (1. - smoothstep(0., 1.9, wy0 - .08 - p.y));
        float drip = below * smoothstep(.45, .85, vn(vec2(U * 3.5, V * .35) + seed));
        col *= 1. - .2 * drip * (1. - win);
        col = mix(col, C * 1.12 + .05, sl);
        col = mix(col, revC, reveal);
        fH += .05 * sl - recess * win;
        // interior (solo donde hay vano)
        float gk = arch == 1. ? (alt > .5 ? .55 : .3) : .9, Fr = 0., jl = 0.; vec3 rf = vec3(0.), gE = vec3(0.);
        if (win > .002) {
        vec3 inn = lod < .98 ? room(clamp(q, vec2(0.), vec2(ww, wh)), vec2(ww, wh), rd, rid * 37. + seed, lit, lc, dep) : vec3(0.);
        // cortinas y persianas sobre el plano del vidrio
        float cr = h11(rid * 4.7);
        if (cr < .55) {
          float cw = .15 + .5 * h11(rid * 5.9), cv = 1. - band(q.x / ww, cw * .5, 1. - cw * .5 * h11(rid * 6.1), .01);
          if (cr < .12) cv = 1.;
          vec3 cc = mix(vec3(.9, .86, .76), vec3(.55, .25, .2) + vec3(0., .2, .3) * h11(rid * 2.9), step(.65, h11(rid * 7.9)));
          cc *= .9 + .1 * sin(q.x * 30.);
          inn = mix(inn, cc * uAmb * 1.4 + cc * lc * lit * uNight * .9, cv * .95);
        } else if (cr < .72) {
          float bh = wh * (.3 + .7 * h11(rid * 3.1)), bl = step(wh - bh, q.y) * (.75 + .25 * step(.5, fract(q.y / .05)));
          inn = mix(inn, vec3(.85, .83, .78) * (uAmb * 1.2 + lc * lit * uNight * .7), bl);
        }
        // romanillas (ventanas de celosía): láminas de vidrio inclinadas
        jl = jal * step(.5, h11(rid * 1.3)) * step(.5, fract(q.y / .11));
        // dintel: el vano retirado hace sombra en la parte alta del vidrio
        inn *= mix(.45, 1., smoothstep(0., .35, wh - q.y)) * mix(.7, 1., smoothstep(0., .15, min(q.x, ww - q.x)));
        float F0 = arch == 1. ? (alt > .5 ? .1 : .28) : .05;
        vec3 Np = normalize(Nv + (Tv * (h11(rid * 2.1) - .5) + Bv * (h11(rid * 6.7) - .5)) * (arch == 1. ? .05 : .02) + Bv * jl * .25);
        float ct = clamp(dot(Np, -Vv), 0., 1.); Fr = F0 + (1. - F0) * pow(1. - ct, 5.);
        vec3 rvv = reflect(Vv, Np); rf = cityRefl(rvv, seed) * (arch == 1. ? mix(vec3(1.), C * 2.2, .55) : vec3(1.)) + sunSpec(rvv, arch == 1. ? 250. : 500.);
        gE = inn * gk * (1. - Fr) + rf * Fr * (arch == 1. ? 1. : .7);
        }
        col = mix(col, vec3(.55, .56, .57) * (arch == 1. ? .3 : 1.), frame);
        fEm += gE * glass * (1. - .35 * jl);
        col = mix(col, (arch == 1. ? C : vec3(.5, .6, .62)) * .04, glass);
        if (arch == 1.) {                            // muro cortina: ligera ondulación por paño, enjuta opaca
          fH += (h11(rid * 2.1) - .5) * .02 * (p.x + p.y) * glass;
          float sp = 1. - band(p.y, wy0, fh, w.y);
          if (alt > .5) col = mix(col, C * .6 + vec3(.55, .53, .5) * .6, sp * (1. - win)); else col = mix(col, C * .25, sp);
          fMetal = mix(fMetal, alt > .5 ? 0. : .7, sp); fRough = mix(fRough, .3, sp);
          float mul = 1. - band(p.x, .022, bw - .022, w.x);
          col = mix(col, vec3(.1, .11, .12) + C * .3, mul * (1. - sp * alt)); fMetal = mix(fMetal, .6, mul); fRough = mix(fRough, .35, mul);
        }
        // rejas
        float rj = bars * step(.3, h11(rid * 6.3) + .5 * step(hab, 4.)) * win;
        if (rj > 0.) {
          float rb = max(1. - band(fract(q.x / .13), .0, .82, w.x / .13), 1. - band(fract(q.y / .9), .0, .93, w.y / .9));
          rb *= 1. - smoothstep(.02, .05, mpp);
          vec3 rcol = h11(seed * 3.) < .5 ? vec3(.08) : vec3(.85, .85, .82);
          col = mix(col, rcol, rb * rj); fEm *= 1. - rb * rj; fH += .06 * rb * rj;
        }
        // ropa tendida en el balcón
        if (arch == 0. && rbal > .3 && rbal < .42) {
          float ix = floor(p.x / .42), hr = h21(vec2(ix, rid * 3.)), L = .3 + .55 * hr;
          float on = step(.3, hr) * band(fract(p.x / .42), .1, .9, w.x / .42) * band(p.y, 2.3 - L, 2.3, w.y) * (1. - smoothstep(.04, .09, mpp));
          vec3 cc = .25 + .7 * vec3(h21(vec2(ix, 1.) + rid), h21(vec2(ix, 2.) + rid), h21(vec2(ix, 3.) + rid));
          col = mix(col, cc, on); fEm *= 1. - on;
        }
        // aire acondicionado de ventana, de tamaño variable (los cercanos son geometría)
        float acs = .6 + .5 * h11(rid * 4.4);
        float acm = (1. - geoB) * step(h11(rid * 8.3), ac) * rectM(p, vec2(wx1 - .05 - .72 * acs, wy0 - .02 - .5 * acs), vec2(wx1 - .05, wy0 - .02), w);
        col = mix(col, vec3(.8, .8, .76) * (.85 + .15 * step(.5, fract(p.y / .06))), acm); fH += .25 * acm; fEm *= 1. - acm;
        // promedio lejano
        float wa = (ww * wh) / (bw * fh);
        vec3 avgG = vec3(.03); vec3 avgE = vec3(.25, .25, .24) * uAmb * gk * (1. - Fr) + lc * lit * uNight * .8 + rf * Fr;
        col = mix(col, mix(col, avgG, win * .85), lod);
        fEm = mix(fEm, avgE * win, lod);
        fH *= 1. - lod;
      }
      // basamento de casas y galpones: zócalo
      if (arch >= 4.) col *= mix(.78, 1., smoothstep(.0, .9, hab));
    }
  }
  diffuseColor.rgb = col;
  }
`;

function makeMaterial(THREE, ctx, railing) {
  // Lambert por píxel: la luz difusa, sombras y niebla del motor sin el coste de PBR + PMREM; el reflejo del vidrio y el brillo del sol
  // se calculan en el propio shader (cityRefl + especular), que es lo único que necesitaba el PBR.
  const std = /edm=std/.test(location.search);
  const m = std ? new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9, metalness: 0, envMapIntensity: .3 }) : new THREE.MeshLambertMaterial({ vertexColors: true });
  const U = { uNight: { value: 0 }, uAmb: { value: .3 }, uSat: { value: ctx.baseTex }, uTint: { value: ctx.groundTint }, uTop: { value: ctx.skyU.top.value }, uHor: { value: ctx.skyU.hor.value }, uSunDir: { value: ctx.sunDir }, uSunCol: { value: new THREE.Color() } };
  m.userData.U = U;
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 aUV; attribute vec4 aB; attribute vec2 aG; varying vec2 vFac; varying vec4 vB; varying vec2 vG;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvFac = aUV; vB = aB; vG = aG;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + (DBG && location.search.match(/edq=(\d)/) ? '#define EDQ' + location.search.match(/edq=(\d)/)[1] + '\n' : '') + GLSL_PARS)
      .replace('#include <color_fragment>', (DBG && /edq=1/.test(location.search) ? 'fEm=vec3(0.);fH=0.;diffuseColor.rgb=vColor;' : GLSL_FACADE) + (railing ? '\n if (floor(vB.x+.5) == 8. && vFac.y > .1 && vFac.y < .95 && fract(vFac.x / .14) > .22) discard;' : ''))
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = fRough;')
      .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = fMetal;')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n normal = perturbN(-vViewPosition, normal, vec2(dFdx(fH), dFdy(fH)), faceDirection);')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += fEm;');
  };
  m.customProgramCacheKey = () => 'edif' + (railing ? 'R' : '') + (std ? 'S' : '');
  return m;
}

// ───────────────────────── geometría ─────────────────────────
class Geo {
  constructor() { this.p = []; this.n = []; this.c = []; this.uv = []; this.b = []; this.g = []; this.i = []; }
  get nv() { return this.p.length / 3; }
  vert(x, y, z, nx, ny, nz, u, v, col, B, gx, gy) { this.p.push(x, y, z); this.n.push(nx, ny, nz); this.uv.push(u, v); this.c.push(col.r, col.g, col.b); this.b.push(B[0], B[1], B[2], B[3]); this.g.push(gx, gy); }
  // cuadrilátero p0..p3 en sentido antihorario visto desde fuera; uv = coordenadas de fachada (m)
  quad(P, N, UV, col, B, G) {
    const k = this.nv; for (let j = 0; j < 4; j++) this.vert(P[j][0], P[j][1], P[j][2], N[0], N[1], N[2], UV[j][0], UV[j][1], col, B, G ? G[j] : 0, G ? 999 : 999);
    this.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
  }
  // cara de caja: centro c, ejes r (derecha) y u (arriba) con semiejes; normal = r × u
  face(c, r, u, hr, hu, col, B, u0 = 0, v0 = 0) {
    const n = [r[1] * u[2] - r[2] * u[1], r[2] * u[0] - r[0] * u[2], r[0] * u[1] - r[1] * u[0]];
    const P = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [c[0] + r[0] * hr * a + u[0] * hu * b, c[1] + r[1] * hr * a + u[1] * hu * b, c[2] + r[2] * hr * a + u[2] * hu * b]);
    this.quad(P, n, [[u0, v0], [u0 + 2 * hr, v0], [u0 + 2 * hr, v0 + 2 * hu], [u0, v0 + 2 * hu]], col, B);
  }
  // caja con ejes ex (horizontal), ey (arriba), ez (normal saliente); omite caras con skip
  box(c, ex, ez, hx, hy, hz, col, B, skip = '') {
    const ey = [0, 1, 0], add = (a, s, d) => [a[0] + d[0] * s, a[1] + d[1] * s, a[2] + d[2] * s], neg = a => [-a[0], -a[1], -a[2]];
    if (!skip.includes('f')) this.face(add(c, hz, ez), ex, ey, hx, hy, col, B, 0, 0);
    if (!skip.includes('k')) this.face(add(c, -hz, ez), neg(ex), ey, hx, hy, col, B);
    if (!skip.includes('r')) this.face(add(c, hx, ex), neg(ez), ey, hz, hy, col, B);
    if (!skip.includes('l')) this.face(add(c, -hx, ex), ez, ey, hz, hy, col, B);
    if (!skip.includes('t')) this.face(add(c, hy, ey), ex, neg(ez), hx, hz, col, B, 0, 1);
    if (!skip.includes('b')) this.face(add(c, -hy, ey), ex, ez, hx, hz, col, B);
  }
  cyl(x, y, z, r, h, seg, col, B) {
    for (let s = 0; s < seg; s++) {
      const a0 = s / seg * Math.PI * 2, a1 = (s + 1) / seg * Math.PI * 2, am = (a0 + a1) / 2;
      const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      // de fuera hacia dentro, antihorario visto desde fuera: (a1 abajo, a0 abajo, a0 arriba, a1 arriba)
      this.quad([[x + c0 * r, y, z + s0 * r], [x + c1 * r, y, z + s1 * r], [x + c1 * r, y + h, z + s1 * r], [x + c0 * r, y + h, z + s0 * r]], [Math.cos(am), 0, Math.sin(am)], [[0, 0], [1, 0], [1, h], [0, h]], col, B);
      const fixQ = this.i.length - 6; if (!this._ccw(fixQ, [Math.cos(am), 0, Math.sin(am)])) this._flip(fixQ);
      const k = this.nv; this.vert(x, y + h + .12, z, 0, 1, 0, 0, h, col, B, 0, 999); this.vert(x + c0 * r, y + h, z + s0 * r, 0, 1, 0, 0, h, col, B, 0, 999); this.vert(x + c1 * r, y + h, z + s1 * r, 0, 1, 0, 0, h, col, B, 0, 999);
      this.i.push(k, k + 2, k + 1); if (!this._ccw(this.i.length - 3, [0, 1, 0], 3)) this._flip(this.i.length - 3, 3);
    }
  }
  _ccw(at, n, cnt = 6) { const I = this.i, P = this.p, a = I[at] * 3, b = I[at + 1] * 3, c = I[at + 2] * 3; const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2]; return (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2] >= 0; }
  _flip(at, cnt = 6) { const I = this.i; for (let q = at; q < at + cnt; q += 3) { const t = I[q + 1]; I[q + 1] = I[q + 2]; I[q + 2] = t; } }
  tri(P, col, B, UV) { // triángulo con normal hacia arriba
    const k = this.nv, ux = P[1][0] - P[0][0], uy = P[1][1] - P[0][1], uz = P[1][2] - P[0][2], vx = P[2][0] - P[0][0], vy = P[2][1] - P[0][1], vz = P[2][2] - P[0][2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1, s = ny < 0 ? -1 : 1; nx *= s / l; ny *= s / l; nz *= s / l;
    for (let j = 0; j < 3; j++) this.vert(P[j][0], P[j][1], P[j][2], nx, ny, nz, UV[j][0], UV[j][1], col, B, 0, 999);
    if (s > 0) this.i.push(k, k + 1, k + 2); else this.i.push(k, k + 2, k + 1);
  }
  mesh(THREE, mat, shadows) {
    if (!this.i.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3)); g.setAttribute('aUV', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('aB', new THREE.Float32BufferAttribute(this.b, 4)); g.setAttribute('aG', new THREE.Float32BufferAttribute(this.g, 2));
    g.setIndex(this.nv > 65535 ? new THREE.Uint32BufferAttribute(this.i, 1) : new THREE.Uint16BufferAttribute(this.i, 1));
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mat); m.castShadow = shadows; m.receiveShadow = shadows; m.matrixAutoUpdate = false; return m;
  }
}

// ───────────────────────── instalación ─────────────────────────
export function install(ctx) {
  const { THREE, D } = ctx;
  ctx.ready.push(() => build(ctx, THREE, D));
}

function build(ctx, THREE, D) {
  const E = D.edif; if (!E || !E.length) return;
  const { hT, Y, R, N, STEP, kmOf, quitado, sample, scene, Q } = ctx, V = D.via;
  const shadows = !!Q.alta;
  const mat = makeMaterial(THREE, ctx, false), matR = makeMaterial(THREE, ctx, true);
  // hash de la ruta para distancia y lado
  const CR = 25, rh = new Map();
  for (let i = 0; i < N; i++) { const k = Math.floor(R.x[i] / CR) + ',' + Math.floor(R.z[i] / CR); let l = rh.get(k); if (!l) rh.set(k, l = []); l.push(i); }
  const nearest = (x, z, r) => { const c = Math.ceil(r / CR), cx = Math.floor(x / CR), cz = Math.floor(z / CR); let b = r * r, bi = -1; for (let a = -c; a <= c; a++) for (let d = -c; d <= c; d++) { const l = rh.get((cx + a) + ',' + (cz + d)); if (l) for (const i of l) { const q = (R.x[i] - x) ** 2 + (R.z[i] - z) ** 2; if (q < b) { b = q; bi = i; } } } return [bi, Math.sqrt(b)]; };
  const col = new THREE.Color(), hsl = {};
  const PAL = {
    [RES]: [0xe3d9c6, 0xd8c9a8, 0xcfb58a, 0xe8e2d6, 0xc99a74, 0xb8b2a6, 0xd6c3a0, 0xe0cfa8, 0xa9b7a5, 0xc4cdd0, 0xd9a47a, 0xece4cf],
    [COM]: [0xe8d9b0, 0x7fb069, 0x4f86c6, 0xe2c044, 0xd96c4b, 0xf1efe8, 0xb0c4de, 0x9a6fb0, 0x5bc0be, 0xe9e4d4, 0xc9b27a],
    [CASA]: [0xf0ead6, 0xe9c46a, 0xf4a261, 0x8ecae6, 0xe6e6e0, 0xd4e09b, 0xe07a5f, 0xf2e3c6],
    [BAR]: [0xf0ece0, 0x7fbfb0, 0xe9c46a, 0x8ecae6, 0xd96c9b, 0x9ccc65],
    [GAL]: [0xd9d9d4, 0xbfc5c9, 0xe6e2d8, 0xb7bfc4],
    [BRI]: [0xb9b4a8, 0xc8c0ae, 0xa8a59c, 0xd2c6ae, 0xbdb3a0],
    [VID]: [0x2e5e8e, 0x23415e, 0x5a4a38, 0x1d2226, 0x3f6f73, 0x6f7f8e, 0x31527a],
  };
  const pick = (a, r) => PAL[a][Math.floor(r * PAL[a].length) % PAL[a].length];
  let sd = 1234567; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const CH = 1750, CHD = 350, base = new Map(), det = new Map();   // zonas base grandes (pocas llamadas) y zonas de detalle pequeñas
  const getB = k => { let g = base.get(k); if (!g) base.set(k, g = new Geo()); return g; };
  const inPoly = (x, z, f, n) => { let c = false; for (let i = 0, j = n - 1; i < n; j = i++) { const xi = f[i * 2], zi = f[i * 2 + 1], xj = f[j * 2], zj = f[j * 2 + 1]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
  const stats = { arch: [0, 0, 0, 0, 0, 0, 0], near: 0 }, vallas = new Set();
  const DUP = duplicadas(E, D.nOsm || 0, ctx, quitado, inPoly); stats.dup = DUP.size;

  for (let bi = 0; bi < E.length; bi++) {
    const [h0, , f, vc] = E[bi], n = f.length / 2; if (n < 3) continue;
    let cx = 0, cz = 0, lo = Infinity, A2 = 0, minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity;
    for (let i = 0; i < n; i++) { const x = f[i * 2], z = f[i * 2 + 1], j = (i + 1) % n; cx += x; cz += z; lo = Math.min(lo, hT(x, z)); A2 += x * f[j * 2 + 1] - f[j * 2] * z; minx = Math.min(minx, x); maxx = Math.max(maxx, x); minz = Math.min(minz, z); maxz = Math.max(maxz, z); }
    cx /= n; cz /= n; if (quitado(cx, cz)) continue;
    // corrección validada contra el video para esta huella (fx/correcciones): manda sobre todo lo que sigue
    if (DUP.has(bi)) continue;   // huella duplicada (OSM + IA, o dos mapas de IA): se dibuja solo la que gana en duplicadas()
    const fx0 = ctx.edifFix ? ctx.edifFix(cx, cz, f, n) : null; if (fx0 && fx0.quitar) continue;
    const area = Math.abs(A2) / 2, sgn = A2 > 0 ? 1 : -1, h = Math.max(3, fx0 && fx0.h ? fx0.h : fx0 && fx0.pisos ? fx0.pisos * FH + 1 : h0);
    // la base baja hasta el suelo más bajo que se dibuja bajo el perímetro (ctx.sueloMin: malla base hundida junto al relieve lateral, o retícula de las capas finas
    // que no sigue un escalón brusco); con solo hT en los vértices quedaban edificios en el aire junto a puentes y taludes
    let sMin = Infinity; if (ctx.sueloMin) for (let i = 0; i < n; i++) { const j = (i + 1) % n, x1 = f[i * 2], z1 = f[i * 2 + 1], x2 = f[j * 2], z2 = f[j * 2 + 1], m = Math.max(1, Math.ceil(Math.hypot(x2 - x1, z2 - z1) / 3)); for (let k = 0; k < m; k++) sMin = Math.min(sMin, ctx.sueloMin(x1 + (x2 - x1) * k / m, z1 + (z2 - z1) * k / m)); }
    const datum = Y(hT(cx, cz)), baseY = Math.min(Y(lo) - 1.5, sMin - .4), top = datum + h;
    const seed = fr(bi * .61803 + .137) * 97 + 1;
    sd = 1 + (bi * 7919) % 2147483646; rnd(); rnd();
    // tramo del video más cercano (para tipo y color)
    let tipo = '', cols = null; const [ri, dist] = nearest(cx, cz, 160);
    let dEdge = dist; if (ri >= 0) { for (let i = 0; i < n; i++) dEdge = Math.min(dEdge, Math.hypot(f[i * 2] - R.x[ri], f[i * 2 + 1] - R.z[ri])); }
    if (ri >= 0 && dist < 130) {
      const a = Math.max(0, ri - 2), b = Math.min(N - 1, ri + 2), tx = R.x[b] - R.x[a], tz = R.z[b] - R.z[a];
      const side = (cx - R.x[ri]) * tz - (cz - R.z[ri]) * tx > 0 ? 'L' : 'R';   // izquierda del corredor = (tz, -tx)
      const vi = Math.min(V.L.tipo.length - 1, Math.round(kmOf(ri * STEP) / V.paso));
      tipo = V[side].tipo[vi] || ''; cols = V[side].col[vi];
    }
    const sc = sample(cx, cz), red = sc && sc[0] > sc[1] * 1.12 && sc[0] > sc[2] * 1.25;
    const sl = Math.hypot(hT(cx + 12, cz) - hT(cx - 12, cz), hT(cx, cz + 12) - hT(cx, cz - 12)) / 24;
    // el color medio del video sale lavado (mezcla muro, ventanas y sombra): se le devuelve saturación y se cruza con los colores vistos en el tramo
    const vCol = cols && cols.length ? new THREE.Color(cols[Math.floor(rnd() * cols.length) % cols.length]) : null;
    if (vc) { col.setHex(vc); col.getHSL(hsl); col.setHSL(hsl.h, Math.min(.45, hsl.s * 1.7 + .04), Math.min(.82, hsl.l * 1.1 + .04)); if (vCol && rnd() < .45) col.lerp(vCol, .45); }
    else if (vCol) col.copy(vCol); else col.setHex(0xd8d0c0);
    col.getHSL(hsl); const azul = hsl.h > .5 && hsl.h < .72 && hsl.s > .15, oscuro = hsl.l < .3;
    // arquetipo
    let a, r = rnd(), pint = 0;
    if (tipo === 'torre de vidrio' && (h >= 40 || (h >= 24 && r < .5))) a = VID;
    else if (tipo === 'galpón' && h < 14) a = GAL;
    else if (tipo === 'barrio en ladera' && h < 18) a = BAR;
    else if (tipo === 'casas' && h < 11) a = CASA;
    else if (tipo.startsWith('comercial') && h < 17) a = COM;
    else if (h >= 55 && (azul || oscuro || r < .35)) a = VID;
    else if (h >= 40 && r < .18) a = VID;
    else if (h >= 14) a = r < .2 ? BRI : RES;
    else if (area > 1400 && h < 13) a = GAL;
    else if ((red && area < 240 && sl > .1) || (sl > .2 && area < 180)) a = BAR;
    else if (red && area < 450) a = CASA;
    else a = (h < 8 && area < 320 && r < .5) ? CASA : COM;
    const kmB = ri >= 0 ? kmOf(ri * STEP) : -1;
    if (fx0 && fx0.a && ARQ[fx0.a] !== undefined) a = ARQ[fx0.a];
    const frente = !(fx0 && fx0.a) && a === BAR && dEdge < 35 && h >= 7;            // primera fila del barrio: edificios frisados y pintados con balcones
    if (frente) a = RES;
    let old = 0;
    if (dist < 170 && kmB >= SILENCIO[0] && kmB <= SILENCIO[1] && h < 40 && a !== VID && !(fx0 && fx0.a)) { old = 1; a = h < 22 ? COM : RES; }
    else if (kmB > 0 && kmB < 8 && (a === COM || a === RES) && h < 26 && r < .3) old = 1;   // edificios viejos del centro: cornisa y molduras
    if (fx0 && fx0.old != null) old = fx0.old ? 1 : 0;
    stats.arch[a]++;
    // color de fachada
    const r2 = rnd();
    if (a === VID) { if (!(azul || oscuro) || !vc) col.setHex(pick(VID, r2)); col.multiplyScalar(.9 + .2 * rnd()); }
    else if (a === BAR) { pint = r2 < (vCol && dEdge < 60 ? .85 : .25) ? 1 : 0; if (pint) { if (vCol && dEdge < 60) col.copy(vCol); else col.setHex(pick(BAR, rnd())); col.getHSL(hsl); col.setHSL(hsl.h, hsl.s * .75, Math.min(.75, hsl.l)); } else col.setHex(0xb0603f); }
    else if (a === GAL) col.setHex(pick(GAL, r2));
    else if (a === BRI) { col.setHex(pick(BRI, r2)); if (vc) col.lerp(new THREE.Color(vc), .3); }
    else if (!vc && !(cols && cols.length)) col.setHex(pick(a, r2));
    else if (r2 < .25) col.lerp(new THREE.Color(pick(a === RES ? RES : a === CASA ? CASA : COM, rnd())), .5);
    if (old && kmB >= SILENCIO[0] && kmB <= SILENCIO[1]) col.setHex([0xe4b94a, 0xe9c35a, 0xdcae45, 0xefd9a0][Math.floor(r2 * 4) % 4]);
    if (frente) { if (vCol) col.copy(vCol); else col.setHex(pick(BAR, rnd())); col.lerp(new THREE.Color(pick(BAR, rnd())), rnd() * .5); }
    else if (a !== VID) { col.getHSL(hsl); if (hsl.l < .35) col.setHSL(hsl.h, hsl.s * .8, .35 + .1 * rnd()); if (hsl.s > .55 && a === RES) col.setHSL(hsl.h, .45, hsl.l); }
    if (fx0 && fx0.col != null) { col.setHex(fx0.col); if (a === BAR) pint = 1; }
    // banderas
    const near = dEdge < 60, alt = frente ? 1 : a === RES ? (rnd() < .5 ? 1 : 0) : a === VID ? (rnd() < .35 ? 1 : 0) : a === BRI ? (rnd() < .4 ? 1 : 0) : 0;
    const shop = (a === RES && ((tipo.startsWith('comercial') && rnd() < .85) || (near && rnd() < .35) || rnd() < .18)) || a === COM ? 1 : 0;
    const geoB = near && (a !== RES || h >= 9) ? 1 : 0;
    let rail = rnd() < .4 ? 1 : 0, alt2 = alt, shop2 = shop, geo2 = geoB;
    if (fx0) { if (fx0.alt != null) alt2 = fx0.alt ? 1 : 0; if (fx0.shop != null) shop2 = fx0.shop ? 1 : 0; if (fx0.rail != null) rail = fx0.rail ? 1 : 0; if (fx0.detalle != null) geo2 = fx0.detalle ? 1 : 0; if (fx0.pint != null) pint = fx0.pint ? 1 : 0; }
    const flags = geo2 + 2 * shop2 + 4 * alt2 + 8 * rail + 16 * pint + 128 * old;
    const B = [a, seed, flags, h];
    const key = Math.floor(cx / CH) + ',' + Math.floor(cz / CH), G = getB(key);
    const bw = bayW(a, alt), hip = (a === CASA || (a === BAR && rnd() < .25)) && n <= 10 && convex(f, n) && area < 600;
    const parH = (a === VID || hip || a === GAL) ? .4 : a === BAR ? .6 : 1.05;
    const tTop = top + parH, cIn = col.clone().multiplyScalar(.8);
    // muros (y cara interior del antepecho)
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, x1 = f[i * 2], z1 = f[i * 2 + 1], x2 = f[j * 2], z2 = f[j * 2 + 1], dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz); if (len < .3) continue;
      const nx = dz / len * sgn, nz = -dx / len * sgn;          // normal saliente
      const Tx = nz, Tz = -nx;                                   // derecha mirando la fachada = up × n
      let ax = x1, az = z1, bx = x2, bz = z2; if (dx * Tx + dz * Tz < 0) { ax = x2; az = z2; bx = x1; bz = z1; }
      const nC = Math.floor(len / bw), m = len - nC * bw, u0 = -m / 2, u1 = len - m / 2, uMax = nC * bw;
      const ga = Y(hT(ax, az)) - datum, gb = Y(hT(bx, bz)) - datum;
      // la planta baja comercial va en las fachadas que dan a la calle (cerca de la ruta: la cara que mira al corredor)
      let fl = flags, fc = 0; const colF = col.clone().multiplyScalar(.93 + .12 * rnd());   // cada cara con su tono
      if (ri >= 0) { const mx = (ax + bx) / 2 - R.x[ri], mz = (az + bz) / 2 - R.z[ri]; fc = -(mx * nx + mz * nz) / (Math.hypot(mx, mz) || 1); }
      if (shop2 && ri >= 0 && dEdge < 60 && fc < -.2) fl -= 2;
      // medianera ciega (cara lateral de una torre) y, a veces, un mural o una valla pegada
      if (dEdge < 160 && (a === RES || a === BRI || a === COM) && h >= 12 && Math.abs(fc) < .4 && len < 28 && rnd() < .6) {
        fl += 32; const rm = rnd();   // mural en la medianera solo en los tramos donde el video los muestra
        if (rm < .3) { if (enKm(kmB, MURALES) && !(fx0 && fx0.mural === 0)) fl += 64; }
        else if (rnd() < .35 && len >= 8) { const vw = Math.min(len - 2, 12), vh = Math.min(5, h * .3), yc = top - vh * .5 - 2 - rnd() * Math.max(0, h * .4); const xm = (ax + bx) / 2 + nx * .2, zm = (az + bz) / 2 + nz * .2;
          G.box([xm, yc, zm], [Tx, 0, Tz], [nx, 0, nz], vw / 2, vh / 2, .15, new THREE.Color(.3, .3, .32), [VALLA, rnd() * 50, vw, vh], ''); }
      } else if (dEdge < 40 && h < 10 && fc > .3 && enKm(kmB, MURALES) && rnd() < .3) { fl = (fl & ~2) + 32 + 64; }
      const Bw = [a, seed, fl, h];
      const k = G.nv;
      G.vert(ax, baseY, az, nx, 0, nz, u0, baseY - datum, colF, Bw, ga, uMax); G.vert(bx, baseY, bz, nx, 0, nz, u1, baseY - datum, colF, Bw, gb, uMax);
      G.vert(bx, tTop, bz, nx, 0, nz, u1, tTop - datum, colF, Bw, gb, uMax); G.vert(ax, tTop, az, nx, 0, nz, u0, tTop - datum, colF, Bw, ga, uMax);
      G.i.push(k, k + 1, k + 2, k, k + 2, k + 3);
      if (parH > .5) G.quad([[bx, top, bz], [ax, top, az], [ax, tTop, az], [bx, tTop, bz]], [-nx, 0, -nz], [[0, 0], [len, 0], [len, parH], [0, parH]], cIn, [LOSA, seed, 0, h]);
    }
    // techo (foto satelital), a dos aguas aproximado en casas
    const uvB = ctx.uvBase, Bt = [TECHO, seed, 0, h];
    if (hip) {
      const rise = Math.min(2.2, .35 * Math.min(maxx - minx, maxz - minz)), ap = [cx, top + rise, cz], ua = uvB(cx, cz);
      const teja = a === CASA, Bj = teja ? [TEJA, seed, 0, h] : Bt;
      for (let i = 0; i < n; i++) { const j = (i + 1) % n, p1 = [f[i * 2], top + parH, f[i * 2 + 1]], p2 = [f[j * 2], top + parH, f[j * 2 + 1]], A3 = [ap[0], ap[1] + parH, ap[2]];
        if (teja) { const el = Math.hypot(p2[0] - p1[0], p2[2] - p1[2]), ex = (p2[0] - p1[0]) / el, ez = (p2[2] - p1[2]) / el, ua2 = (A3[0] - p1[0]) * ex + (A3[2] - p1[2]) * ez, hd = Math.hypot(A3[0] - p1[0] - ex * ua2, A3[2] - p1[2] - ez * ua2), sl = Math.hypot(hd, rise);
          G.tri([[p1[0] - (A3[0] - p1[0] - ex * ua2) / hd * .45, p1[1] - .15, p1[2] - (A3[2] - p1[2] - ez * ua2) / hd * .45], [p2[0] - (A3[0] - p1[0] - ex * ua2) / hd * .45, p2[1] - .15, p2[2] - (A3[2] - p1[2] - ez * ua2) / hd * .45], A3], col, Bj, [[0, 0], [el, 0], [ua2, sl + .45]]); }
        else G.tri([p1, p2, A3], col, Bt, [uvB(p1[0], p1[2]), uvB(p2[0], p2[2]), ua]); }
    } else {
      const cont = []; for (let i = 0; i < n; i++) cont.push(new THREE.Vector2(f[i * 2], f[i * 2 + 1]));
      const tris = THREE.ShapeUtils.triangulateShape(cont, []);
      for (const t of tris) G.tri(t.map(q => [f[q * 2], top, f[q * 2 + 1]]), col, Bt, t.map(q => uvB(f[q * 2], f[q * 2 + 1])));
    }
    // azotea de torres: cuarto de máquinas, tanque elevado y antenas (silueta de la ciudad)
    if (h > 16 && area > 140 && a !== BAR) {
      const s = Math.min(5, Math.sqrt(area) * .22), mh = 2.8 + rnd() * 1.5, ok = [[-s, -s], [s, -s], [s, s], [-s, s]].every(([u, v]) => inPoly(cx + u, cz + v, f, n));
      if (ok) {
        const cm = col.clone().multiplyScalar(.92);
        G.box([cx, top + mh / 2, cz], [1, 0, 0], [0, 0, 1], s, mh / 2, s * .8, cm, [LOSA, seed, 0, h], 'b');
        if (rnd() < .5) G.box([cx + s * .3, top + mh + .9, cz], [1, 0, 0], [0, 0, 1], s * .55, .9, s * .55, cm, [LOSA, seed, 0, h], 'b');
        if (h > 35 && rnd() < .55) { const ah = 4 + rnd() * 9; G.box([cx - s * .6, top + mh + ah / 2, cz - s * .5], [1, 0, 0], [0, 0, 1], .09, ah / 2, .09, new THREE.Color(.55, .55, .55), [TANQ, seed, 0, h], 'b'); }
      }
    }
    // valla publicitaria sobre la azotea, de cara a la ruta (una por tramo de ~120 m y lado)
    if (ri >= 0 && dEdge > 12 && dEdge < 220 && h >= 6 && h <= 45 && !hip && a !== VID && a !== GAL && a !== BAR && !quitado(cx, cz)) {
      const bk = Math.floor(ri / 12) + ((cx - R.x[ri]) * (R.z[Math.min(N - 1, ri + 1)] - R.z[ri]) - (cz - R.z[ri]) * (R.x[Math.min(N - 1, ri + 1)] - R.x[ri]) > 0 ? 'L' : 'R');
      if (!vallas.has(bk) && rnd() < .3) {
        let best = null; for (let i = 0; i < n; i++) { const j = (i + 1) % n, x1 = f[i * 2], z1 = f[i * 2 + 1], x2 = f[j * 2], z2 = f[j * 2 + 1], len = Math.hypot(x2 - x1, z2 - z1); if (len < 7) continue;
          const nx = (z2 - z1) / len * sgn, nz = -(x2 - x1) / len * sgn, mx = (x1 + x2) / 2, mz = (z1 + z2) / 2, fc = ((R.x[ri] - mx) * nx + (R.z[ri] - mz) * nz) / (Math.hypot(R.x[ri] - mx, R.z[ri] - mz) || 1);
          if (fc > .6 && (!best || len > best.len)) best = { mx, mz, nx, nz, len }; }
        if (best) {
          vallas.add(bk);
          const vw = Math.min(best.len - 1, 6 + rnd() * 8), vh = vw * (.32 + rnd() * .1), Tx = best.nz, Tz = -best.nx, y0 = top + parH + 1.2;
          const cxv = best.mx - best.nx * 1.2, czv = best.mz - best.nz * 1.2, gris = new THREE.Color(.32, .32, .33), Bl = [LOSA, seed, 0, h];
          G.box([cxv, y0 + vh / 2, czv], [Tx, 0, Tz], [best.nx, 0, best.nz], vw / 2, vh / 2, .12, gris, Bl, 'f');
          G.face([cxv + best.nx * .121, y0 + vh / 2, czv + best.nz * .121], [Tx, 0, Tz], [0, 1, 0], vw / 2, vh / 2, gris, [VALLA, rnd() * 50, vw, vh]);
          for (const sx of [-.35, .35]) G.box([cxv + Tx * vw * sx - best.nx * .5, (top + y0 + vh * .6) / 2, czv + Tz * vw * sx - best.nz * .5], [Tx, 0, Tz], [best.nx, 0, best.nz], .1, (y0 + vh * .6 - top) / 2, .1, gris, Bl, 'b');
          G.box([cxv + best.nx * .45, y0 - .05, czv + best.nz * .45], [Tx, 0, Tz], [best.nx, 0, best.nz], vw / 2, .05, .35, gris, Bl, '');
        }
      }
    }
    if (dEdge < 150) {
      const kd = Math.floor(cx / CHD) + ',' + Math.floor(cz / CHD); let d = det.get(kd); if (!d) det.set(kd, d = { list: [], cx: 0, cz: 0, n: 0, mesh: null, meshR: null, st: 0 });
      d.list.push({ bi, a, B, col: col.clone(), datum, top, h, f, n, sgn, near, alt, shop, rail, geoB, cx, cz, area, seed, hip, old, parH });
      d.cx += cx; d.cz += cz; d.n++; if (near) stats.near++;
    }
  }
  // mallas base, una por zona
  const meshes = [];
  for (const G of base.values()) { const m = G.mesh(THREE, mat, shadows); if (m) { m.frustumCulled = true; m.userData.mem = 'edif-base'; scene.add(m); meshes.push(m); } }
  for (const d of det.values()) { d.cx /= d.n; d.cz /= d.n; }
  const detList = [...det.values()];
  let tris = 0; for (const m of meshes) tris += m.geometry.index.count / 3;
  console.info(`edificios: ${meshes.length} zonas, ${Math.round(tris / 1000)}k triángulos base, arquetipos`, stats.arch.join("/"), "cerca", stats.near, "duplicadas", stats.dup);
  ctx.edificios = { mat, matR, meshes, det: detList, stats, DUP }; if (DBG) { window.__edif = ctx.edificios; ctx.edificios.ctx = ctx; }

  tendido(ctx, THREE, mat, shadows);
  // detalle cerca de la ruta, construido por zonas según avanza el corredor
  const buildDet = d => {
    const G = new Geo(), GR = new Geo();
    for (const b of d.list) detail(b, G, GR, ctx, THREE, hT, Y, inPoly, R, nearest);
    d.mesh = G.mesh(THREE, mat, shadows); d.meshR = GR.mesh(THREE, matR, shadows);
    for (const m of [d.mesh, d.meshR]) if (m) { m.userData.mem = 'edif-det'; scene.add(m); } d.st = 1;
    d.tris = (d.mesh ? d.mesh.geometry.index.count / 3 : 0) + (d.meshR ? d.meshR.geometry.index.count / 3 : 0);
  };
  // Memoria acotada: una zona de detalle se construye a menos de `carga` m, se ve a menos de `vis` y se suelta de verdad (fuera de la escena,
  // geometría liberada, referencias soltadas) a más de `suelta` m; si vuelve a quedar cerca (ida y vuelta) se reconstruye igual. Además hay un
  // tope de triángulos de detalle residentes: si se pasa, se sueltan primero las zonas más lejanas que no se están viendo. Radios en ctx.Q.mem.
  const MB = ctx.Q.mem || {}, R_CARGA = MB.detCarga || 1000, R_VIS = MB.detVis || 620, R_SUELTA = Math.max(R_CARGA + 150, MB.detSuelta || 1400), TOPE = MB.detTri || Infinity;
  const freeDet = d => { for (const m of [d.mesh, d.meshR]) if (m) { scene.remove(m); m.geometry.dispose(); } d.mesh = d.meshR = null; d.st = 0; detTri -= d.tris || 0; d.tris = 0; };
  let detTri = 0; ctx.edificios.detTri = () => detTri;
  const U = [mat.userData.U, matR.userData.U]; let lx = 1e9, lz = 1e9;
  ctx.frameHooks.push((noche, t, dt, p) => {
    const amb = .05 + .11 * (1 - noche);
    for (const u of U) { u.uNight.value = noche; u.uAmb.value = amb; u.uSunCol.value.copy(ctx.sun.color).multiplyScalar(ctx.sun.intensity * (ctx.sun.castShadow || !ctx.Q.alta ? 1 : .3)); }
    let built = 0, pend = 0, freed = 0; const first = Math.hypot(p.x - lx, p.z - lz) > 250; lx = p.x; lz = p.z;   // salto (inicio o teletransporte): construye todo lo cercano ya
    for (const d of detList) {
      const dd = d.dd = Math.hypot(d.cx - p.x, d.cz - p.z);
      if (d.st === 1 && dd > R_SUELTA && (freed < 3 || first)) { freeDet(d); freed++; }   // se suelta lo que quedó atrás (pocas por cuadro, salvo tras un salto)
      if (d.st === 0 && dd < R_CARGA && (dd < R_VIS || detTri < TOPE * .9) && (built < 1 || first)) { buildDet(d); detTri += d.tris; built++; }   // el primer cuadro construye todo lo cercano
      if (d.st === 0 && dd < R_VIS) pend++;
      const vis = dd < R_VIS; if (d.mesh) d.mesh.visible = vis; if (d.meshR) d.meshR.visible = vis;
    }
    if (detTri > TOPE) { const vivas = detList.filter(d => d.st === 1 && d.dd > R_VIS).sort((a, b) => b.dd - a.dd); for (const d of vivas) { if (detTri <= TOPE) break; freeDet(d); } }   // tope duro: primero lo más lejano
    (ctx.pend || (ctx.pend = {})).edificios = pend;   // solo lectura: zonas de detalle visibles aún sin construir (ctx.pendientes)
  });
}

// Huellas duplicadas: OSM y los mapas de IA (Microsoft, Google) traen a menudo el mismo edificio dos veces, y dos cajas casi iguales parpadean.
// Si dos huellas se solapan en más de la mitad del área de la menor se dibuja una sola. No cuenta una huella metida en otra más de tres veces
// mayor (torre sobre su parcela o edificio dentro de una manzana entera de la IA): eso se lee como podio y no parpadea. Gana, por orden: la que tiene corrección de zona,
// la de OSM, la de altura mejor conocida (E[1]: 3 investigada, 2 etiqueta OSM, 1 estimada) y la mayor. Dos huellas con correcciones distintas
// se dejan las dos (podio + torre corregidos a mano); si las dos heredan la MISMA corrección puntual (el punto cae en ambas), vale para la menor.
// Devuelve el conjunto de índices que no se dibujan. Las correcciones se siguen buscando sobre los datos completos.
function duplicadas(E, nOsm, ctx, quitado, inPoly) {
  const B = [];
  for (let bi = 0; bi < E.length; bi++) {
    const f = E[bi][2], n = f.length / 2; if (n < 3) continue;
    let cx = 0, cz = 0, A2 = 0, x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let i = 0; i < n; i++) { const x = f[i * 2], z = f[i * 2 + 1], j = (i + 1) % n; cx += x; cz += z; A2 += x * f[j * 2 + 1] - f[j * 2] * z; x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    cx /= n; cz /= n; if (quitado(cx, cz)) continue;
    const fx = ctx.edifFix ? ctx.edifFix(cx, cz, f, n) : null; if (fx && fx.quitar) continue;
    B.push({ bi, f, n, A: Math.abs(A2) / 2, x0, x1, z0, z1, fx, osm: bi < nOsm ? 1 : 0, k: E[bi][1] || 0 });
  }
  B.sort((a, b) => (!!b.fx - !!a.fx) || (a.fx ? a.A - b.A : (b.osm - a.osm) || (b.k - a.k) || (b.A - a.A)));
  const C = 40, grid = new Map(), out = new Set();
  const solapa = (s, l) => {   // fracción de la huella menor s que cae dentro de l (muestreo en retícula)
    const st = Math.max(.5, Math.sqrt(s.A) / 10); let a = 0, b = 0;
    for (let x = s.x0 + st / 2; x < s.x1; x += st) for (let z = s.z0 + st / 2; z < s.z1; z += st) if (inPoly(x, z, s.f, s.n)) { a++; if (inPoly(x, z, l.f, l.n)) b++; }
    return a ? b / a : 0; };
  for (const o of B) {
    let dup = false;
    for (let gx = Math.floor(o.x0 / C); gx <= Math.floor(o.x1 / C) && !dup; gx++) for (let gz = Math.floor(o.z0 / C); gz <= Math.floor(o.z1 / C) && !dup; gz++) for (const k of grid.get(gx + ',' + gz) || []) {
      if (k.x1 < o.x0 || o.x1 < k.x0 || k.z1 < o.z0 || o.z1 < k.z0) continue;
      if (o.fx && k.fx && !(o.fx.x === k.fx.x && o.fx.z === k.fx.z && o.fx.nota === k.fx.nota && !o.fx.nuevo)) continue;
      const s = o.A < k.A ? o : k, l = s === o ? k : o; if (s.A >= .3 * l.A && solapa(s, l) > .5) { dup = true; break; } }
    if (dup) { out.add(o.bi); continue; }
    for (let gx = Math.floor(o.x0 / C); gx <= Math.floor(o.x1 / C); gx++) for (let gz = Math.floor(o.z0 / C); gz <= Math.floor(o.z1 / C); gz++) { const key = gx + ',' + gz; let l = grid.get(key); if (!l) grid.set(key, l = []); l.push(o); }
  }
  return out;
}

function convex(f, n) { let s = 0; for (let i = 0; i < n; i++) { const a = i * 2, b = ((i + 1) % n) * 2, c = ((i + 2) % n) * 2; const cr = (f[b] - f[a]) * (f[c + 1] - f[b + 1]) - (f[b + 1] - f[a + 1]) * (f[c] - f[b]); if (Math.abs(cr) < 1e-3) continue; const sg = Math.sign(cr); if (s && sg !== s) return false; s = sg; } return true; }

// Detalle de un edificio cercano: balcones en volado, toldos, aires, tanques
function detail(b, G, GR, ctx, THREE, hT, Y, inPoly, R, nearest) {
  const { a, B, col, datum, top, h, f, n, sgn, near, alt, shop, rail, geoB, cx, cz, seed } = b;
  let sd = 1 + (b.bi * 4271) % 2147483646; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const slabC = col.clone().multiplyScalar(1.1).addScalar(.04), parC = rail ? new THREE.Color(.16, .16, .17) : col;
  const bw = bayW(a, alt);
  // ¿está libre ese punto? (fx/calzada expone ctx.calzadaLibre; respaldo: fuera de la franja del pelotón + 1,5 m)
  const libre = (x, z) => { if (typeof ctx.calzadaLibre === 'function') return !!ctx.calzadaLibre(x, z); const [i, d] = nearest(x, z, 20); return i < 0 || d > ctx.ROAD_W / 2 + 1.5; };
  // ¿hacia dónde está la ruta?
  const [ri] = nearest(cx, cz, 160); const rx = ri >= 0 ? R.x[ri] : cx, rz = ri >= 0 ? R.z[ri] : cz;
  for (let i = 0; i < n && near; i++) {
    const j = (i + 1) % n, x1 = f[i * 2], z1 = f[i * 2 + 1], x2 = f[j * 2], z2 = f[j * 2 + 1], dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz); if (len < 2.5) continue;
    const nx = dz / len * sgn, nz = -dx / len * sgn, Tx = nz, Tz = -nx;
    let ax = x1, az = z1; if (dx * Tx + dz * Tz < 0) { ax = x2; az = z2; }
    const ex = [Tx, 0, Tz], ez = [nx, 0, nz];
    const nC = Math.floor(len / bw), m = len - nC * bw, uMax = nC * bw;
    const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2, gMid = Y(hT(mx, mz)) - datum;
    const facing = ((rx - mx) * nx + (rz - mz) * nz) / (Math.hypot(rx - mx, rz - mz) || 1);
    const fi0 = Math.ceil((gMid + (shop ? 4.2 : 2.6) - .01) / FH);
    const at = (u, y, out) => [ax + Tx * (u + m / 2) + nx * out, datum + y, az + Tz * (u + m / 2) + nz * out];
    // balcones (residencial)
    if (geoB && a === RES && h >= 9 && len >= 5 && facing > -.3) {
      for (let fi = fi0; (fi + 1) * FH <= h + .1; fi++) {
        const y = fi * FH;
        if (!alt) {                                       // balcón corrido en volado
          const u0 = Math.max(.3 - m / 2, -m / 2 + .3), u1 = len - m / 2 - .3, L = u1 - u0; if (L < 2) continue;
          const c = at(u0 + L / 2, y - .1, .55);
          G.box(c, ex, ez, L / 2, .11, .55, slabC, [LOSA, seed, 0, h], 'k');
          const pc = at(u0 + L / 2, y + .52, 1.04), Bp = [PAR, seed, 0, h];
          (rail ? GR : G).box(pc, ex, ez, L / 2, .52, .06, parC, Bp, 'kb');
          if (!rail) { G.box(at(u0 + .03, y + .52, .55), ex, ez, .04, .52, .5, parC, Bp, 'bk'); G.box(at(u1 - .03, y + .52, .55), ex, ez, .04, .52, .5, parC, Bp, 'bk'); }
        } else {                                          // balcones sueltos en vanos pares
          for (let ci = 0; ci < nC; ci += 2) {
            const uc = ci * bw + bw / 2, c = at(uc - m / 2 + m / 2, y - .1, .5);
            G.box(c, ex, ez, bw * .45, .1, .5, slabC, [LOSA, seed, 0, h], 'k');
            const Bp = [PAR, seed, 0, h];
            (rail ? GR : G).box(at(uc, y + .5, .97), ex, ez, bw * .45, .5, .05, parC, Bp, 'kb');
          }
        }
      }
    }
    // aires acondicionados de ventana
    if (((a === RES && alt) || a === COM || a === CASA || a === BRI) && facing > -.3) {
      const acC = new THREE.Color(.84, .84, .8);
      for (let fi = Math.max(fi0, 1); (fi + 1) * FH <= h + .1 && fi < 14; fi++) for (let ci = 0; ci < nC; ci++) {
        if (rnd() > .1 || (a === RES && geoB && ci % 2 === 0)) continue;
        const wx1 = a === RES ? 2.65 : a === CASA ? 2.7 : a === BRI ? 1.0 : 2.4;
        { const sz = .7 + .6 * rnd(); G.box(at(ci * bw + wx1 - .05 - .36 * sz, fi * FH + .95 - .24 * sz, .27 * sz), ex, ez, .36 * sz, .24 * sz, .27 * sz, acC, [AC, seed, 0, h], 'k'); }
      }
    }
    // letreros en bandera, perpendiculares a la fachada (luminosos de noche)
    if (shop && facing > .25 && len > 4) {
      const sw = shopW(seed), nb = Math.floor((len + m / 2) / sw);
      for (let k = 0; k <= nb; k++) {
        if (rnd() > .3) continue;
        const u = k * sw - m / 2 + .2, out = .75 + .4 * rnd(), sh = .9 + .7 * rnd(), y = gMid + 3.3 + rnd() * 1.2, tip = at(u, y, out + .1);
        if (u < -m / 2 || u > len - m / 2 || !libre(tip[0], tip[2])) continue;
        const tc = new THREE.Color().setHSL(rnd(), .6 + .3 * rnd(), .3 + .3 * rnd());
        G.box(at(u, y, .05 + out / 2), ez, [-Tx, 0, -Tz], out / 2, sh / 2, .07, tc, [LETRERO, rnd() * 40, out, sh], '');
        G.box(at(u, y + sh / 2 + .05, .1 + out / 2), ez, [-Tx, 0, -Tz], out / 2 + .05, .03, .03, new THREE.Color(.15, .15, .15), [LOSA, seed, 0, h], '');
      }
    }
    // cornisa en volado de los edificios viejos (silueta)
    if (b.old && len > 2) {
      const cc = col.clone().multiplyScalar(1.15).addScalar(.05), Bc = [LOSA, seed, 0, h];
      G.box(at(len / 2 - m / 2, h - .25, .2), ex, ez, len / 2 + .2, .22, .2, cc, Bc, 'k');
      if (shop) G.box(at(len / 2 - m / 2, Math.ceil((gMid + 4.2 - .01) / FH) * FH - .2, .12), ex, ez, len / 2, .13, .12, cc, Bc, 'k');
    }
    // toldos sobre los locales que dan a la ruta
    if (shop && facing > .25 && len > 3) {
      const sw = shopW(seed), nb = Math.floor((len + m / 2) / sw);
      for (let k = 0; k < nb; k++) {
        if (rnd() > .42) continue;
        const u0 = k * sw + .45 - m / 2 - 0, u1 = (k + 1) * sw - .05 - m / 2; if (u1 - u0 < 1) continue;
        const tc = new THREE.Color().setHSL(rnd(), .55 + .3 * rnd(), .35 + .2 * rnd()), Bt = [TOLDO, rnd() * 9, 0, h];
        const gy = gMid, y0 = gy + 3.05, y1 = gy + 2.55, dep = 1.1 + .4 * rnd();
        const p0 = at(u0, y0, .02), p1 = at(u1, y0, .02), p2 = at(u1, y1, dep), p3 = at(u0, y1, dep);
        if (!libre(p2[0], p2[2]) || !libre(p3[0], p3[2])) continue;   // el toldo no puede volar sobre la calzada
        const ny = dep, nn = .5; const nl = Math.hypot(ny, nn);
        // superficie inclinada (cara superior) y faldón
        G.quad([p3, p2, p1, p0], [nx * nn / nl, ny / nl, nz * nn / nl], [[0, 0], [u1 - u0, 0], [u1 - u0, dep], [0, dep]], tc, Bt);
        if (!G._ccw(G.i.length - 6, [nx, 1, nz])) G._flip(G.i.length - 6);
        G.quad([[p3[0], p3[1] - .28, p3[2]], [p2[0], p2[1] - .28, p2[2]], p2, p3], [nx, 0, nz], [[0, 0], [u1 - u0, 0], [u1 - u0, .28], [0, .28]], tc, Bt);
        if (!G._ccw(G.i.length - 6, [nx, 0, nz])) G._flip(G.i.length - 6);
        G.quad([p0, p1, [p2[0], p2[1] - .28, p2[2]], [p3[0], p3[1] - .28, p3[2]]], [0, -1, 0], [[0, 0], [1, 0], [1, 1], [0, 1]], tc.clone().multiplyScalar(.6), Bt);
        if (!G._ccw(G.i.length - 6, [-nx * .2, -1, -nz * .2])) G._flip(G.i.length - 6);
      }
    }
  }
  // tanques de agua en la azotea
  if (a !== VID && a !== GAL && h > 4.5 && !b.hip) {
    const nt = a === BAR ? 1 : 1 + Math.floor(rnd() * (b.area > 300 ? 3 : 1.6));
    for (let t = 0; t < nt; t++) {
      for (let tries = 0; tries < 6; tries++) {
        const rr = Math.sqrt(b.area) * .3, x = cx + (rnd() - .5) * 2 * rr, z = cz + (rnd() - .5) * 2 * rr, r = .55 + rnd() * .45;
        if (!inPoly(x, z, f, n) || !inPoly(x + r, z, f, n) || !inPoly(x - r, z, f, n) || !inPoly(x, z + r, f, n) || !inPoly(x, z - r, f, n)) continue;
        const k = a === BAR ? rnd() * .55 + .45 : rnd(), tc = k < .5 ? new THREE.Color(.07, .07, .08) : k < .7 ? new THREE.Color(.16, .3, .58) : k < .85 ? new THREE.Color(.78, .74, .64) : new THREE.Color(.6, .62, .62);
        const hh = r * 2.1, y = top + (a === BAR ? 0 : rnd() < .4 ? 1.4 : 0);
        if (y > top) G.box([x, top + .7, z], [1, 0, 0], [0, 0, 1], r * .9, .7, r * .9, col.clone().multiplyScalar(.85), [LOSA, seed, 0, h], 'b');
        G.cyl(x, y, z, r, hh, 8, tc, [TANQ, seed, 0, h]);
        break;
      }
    }
  }
}

// Tendido eléctrico: postes de concreto en la acera y cables entre ellos (centro, Bella Vista, Roca Tarpeya, Solano).
// Un poste cada ~32 m del lado derecho; cuatro fases en la cruceta, dos de teléfono/cable más abajo, alguna acometida a las fachadas.
const TENDIDO = [[1.3, 2.4], [3.4, 5.6], [6.3, 7.5], [12.2, 13.1], [39.8, 41.6]];
function tendido(ctx, THREE, mat, shadows) {
  const { P, sOfKm, hT, Y, quitado, scene } = ctx; let sd = 777; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const lineMat = new THREE.LineBasicMaterial({ color: 0x141414, transparent: true, opacity: .85 }), o = {};
  const gris = new THREE.Color(.6, .59, .56), osc = new THREE.Color(.3, .3, .3), Bp = [LOSA, 3, 0, 10], Bt = [TANQ, 3, 0, 10];
  const libre = (x, z) => typeof ctx.calzadaLibre !== 'function' || ctx.calzadaLibre(x, z);
  for (const [k0, k1] of TENDIDO) {
    const G = new Geo(), L = []; let prev = null, np = 0, why = [0, 0, 0, 0];
    for (let s = sOfKm(k0); s < sOfKm(k1); s += 30 + rnd() * 6) {
      if (ctx.inTunnel(s) || ctx.enElevado(s) || ctx.cubierto(s)) { prev = null; why[0]++; continue; }
      P(s, o); const c = typeof ctx.calzada === 'function' ? ctx.calzada(s) : null;
      const der = c ? c.der : ctx.ROAD_W / 2 + 1, ac = c ? c.aceraDer : 2.5; if (c && c.contraria && c.contraria.ancho > 0 && der > 9) { prev = null; why[1]++; continue; }   // avenidas anchas: sin tendido
      const d = der + Math.max(.45, Math.min(ac * .7, ac - .35)), rx = -o.tz, rz = o.tx, x = o.x + rx * d, z = o.z + rz * d;
      if (!libre(x, z) || quitado(x, z)) { prev = null; why[2]++; continue; }
      np++;
      const y = Math.max(o.y, Y(hT(x, z))) + .1, H = 9.5 + rnd() * 1.5, ex = [o.tx, 0, o.tz], ez = [rx, 0, rz];
      G.box([x, y + H * .3, z], ex, ez, .17, H * .3, .17, gris, Bp, 'b'); G.box([x, y + H * .8, z], ex, ez, .12, H * .2, .12, gris, Bp, 'b');
      G.box([x, y + H - .45, z], ex, ez, 1.15, .06, .06, osc, Bp, '');
      if (rnd() < .3) G.cyl(x + rx * .45, y + H - 3.2, z + rz * .45, .3, 1.1, 8, osc, Bt);
      const pts = [-1.05, -.35, .35, 1.05].map(t => [x + o.tx * t, y + H - .38, z + o.tz * t]).concat([[x - rx * .15, y + H - 2.6, z - rz * .15], [x - rx * .15, y + H - 3.1, z - rz * .15]]);
      if (prev && Math.hypot(prev.x - x, prev.z - z) < 50) for (let w = 0; w < pts.length; w++) {
        const a = prev.pts[w], b = pts[w], sag = (w < 4 ? .5 : .9) + rnd() * (w < 4 ? .5 : 1.4);
        for (let t = 0; t < 10; t++) { const t0 = t / 10, t1 = (t + 1) / 10; for (const tt of [t0, t1]) L.push(a[0] + (b[0] - a[0]) * tt, a[1] + (b[1] - a[1]) * tt - sag * 4 * tt * (1 - tt), a[2] + (b[2] - a[2]) * tt); }
      }
      // acometidas hacia las fachadas
      for (let k = 0; k < 1 + (rnd() < .5); k++) { const e = [x + rx * (5 + rnd() * 7) + o.tx * (rnd() - .5) * 14, y + 4 + rnd() * 2.5, z + rz * (5 + rnd() * 7) + o.tz * (rnd() - .5) * 14], a = pts[4];
        for (let t = 0; t < 6; t++) { for (const tt of [t / 6, (t + 1) / 6]) L.push(a[0] + (e[0] - a[0]) * tt, a[1] + (e[1] - a[1]) * tt - .5 * 4 * tt * (1 - tt), a[2] + (e[2] - a[2]) * tt); } }
      prev = { x, z, pts };
    }
    if (DBG) console.info('tendido', k0, k1, np, why.join('/'));
    const m = G.mesh(THREE, mat, shadows); if (m) { m.userData.mem = 'edif-tendido'; scene.add(m); }
    if (L.length) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(L, 3)); g.computeBoundingSphere(); scene.add(new THREE.LineSegments(g, lineMat)); }
  }
}
