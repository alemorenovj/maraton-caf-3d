// fx/atmosfera.js — luz, atmósfera y color de la imagen.
// Cielo físico (Rayleigh + Mie, tabla precalculada en GPU), perspectiva aérea con altura (bruma del valle), sombras de nubes,
// cúmulos con volumen y el «gorro» del Ávila, guacamayas y zamuros, y posproceso de cámara de acción
// (rayos de luz, destello, oclusión ambiental GTAO, desenfoque de movimiento, curva de color, aberración y grano).
//
// Parámetros de URL: &sinfx=rayos,destello,ao,grano,ca,mb,nubes,sombranube,bruma,aves,estrellas,curva  (apaga cada pase)
//                    &atmdbg=1  (escribe en consola qué pases quedaron activos)
// En consola: __atm.TG (interruptores en vivo), __atm.medir() (ms por pase, render real con GPU), __atm.COLOR (constantes).
export const meta = { id: 'atmosfera', reemplaza: ['nubes'] };

// ───────── Lo que se midió en el video (12 fotogramas: f_0020, 036, 071, 106, 150, 176, 211, 246, 281, 316, 351, 386) ─────────
// sRGB 0–255, recortando el capó (16 % inferior) y el logo (6 % superior). Script: medir.py (ver informe).
//   cielo (píxeles con b > r+35 en la mitad superior) ........ (103, 153, 215)
//   asfalto al sol (gris, sat < 0,13, mitad inferior) .......... (152, 146, 141)  ← levemente cálido
//   asfalto a la sombra .......................................... ( 60,  61,  59)  ← relación sol/sombra ≈ 6,5:1 en lineal
//   follaje (g > r+8, g > b+8) ................................... ( 46,  65,  37)
//   luminancia p2/p10/p25/p50/p75/p90/p98 ........................ 5 / 19 / 42 / 87 / 135 / 165 / 194
//   saturación mediana / p90 ..................................... 0,32 / 0,77      píxeles quemados (≥250): 2,4 %
export const REF = { cielo: [103, 153, 215], asfSol: [152, 146, 141], asfSombra: [60, 61, 59], follaje: [46, 65, 37], Lp: [5, 19, 42, 87, 135, 165, 194], sat: .32 };

// Gradación «cámara de acción» (valores elegidos comparando capturas con REF; ver informe)
export const COLOR = {
  expo: 1.04,         // exposición ACES (pleno día)
  expoNoche: 1.25,   // exposición ACES de noche (la cámara abre)
  preSat: 1.0,        // saturación antes del ACES (el ACES lava los colores intensos)
  blk: 0.0,           // negro: lo que está por debajo se aplasta (el video tiene p2 ≈ 5/255)
  wht: 0.90,          // blanco
  con: 0.24,          // (era 0,30) curva en S (contraste de cámara de acción, sombras duras)
  gam: 1.3,          // (era 1,7: aplastaba a negro copas, vidrio y piel en sombra) gamma de salida: baja medios y sombras (sombras duras y oscuras del video); de noche se suaviza
  gamNoche: 1.15,
  lente: 0.11,        // barril del gran angular (solo cámara a bordo)
  sat: 1.06,          // saturación de salida
  vib: 0.16,          // vibrancia (sube lo poco saturado: verdes y cielo)
  cieloAzul: 0.50,    // «polarizador»: oscurece y satura el azul del cielo
  wb: [1.0, 0.995, 0.985], // balance de blancos (el asfalto al sol del video es levemente cálido)
  verde: 0.10,        // empuja el follaje hacia un verde más vivo
  vig: 0.20,          // viñeta del lente gran angular
  sombra: 0.54,
  ambiente: 1.75,      // relleno de luz ambiente a pleno día (rebote del mediodía tropical: las caras a la sombra del video están en 55–80/255)       // opacidad del receptor de sombras (motor: 0,46): sol/sombra ≈ 152/60 como en el video
};
const GAIN = 1.07;      // escala de radiancia del cielo físico → unidades de la escena
const TINTE_CIELO = [0.92, 0.98, 1.42]; // el cielo del video es más denso y azul que el de Rayleigh puro (polarización / cámara de acción); no se aplica en el horizonte
const SUELO_DIA = 0.58; // la foto satelital ya trae luz: a pleno día se baja para que el asfalto al sol dé ≈150/255 como en el video
const SUELO_WB = [0.93, 0.985, 1.13]; // y se neutraliza su tono pardo-amarillento (asfalto del video: 152,146,141)
// adaptación de la cámara al cielo: fracción de la luminancia del cénit de pleno día que se ve según la altura del sol (sen el)
const ADAPT = [[-0.25, 0.004], [-0.16, 0.012], [-0.10, 0.13], [-0.05, 0.36], [0.0, 0.5], [0.1, 0.7], [0.3, 0.92], [0.5, 1.0]];
const SOL_DIA = { el: 60, az: 150 }; // pleno día: sol de media mañana, alto al sur-sureste (el video es cerca del mediodía)

export function install(ctx) {
  const { THREE, scene, camera, renderer, composer, sun, hemi, sunDir, skyU, skyMat, Q, S, D } = ctx;
  const q = new URLSearchParams(location.search), OFF = new Set((q.get('sinfx') || '').split(',')), DBG = !!q.get('atmdbg');
  const TG = { tunel: 1, lente: 1, bruma: 1, sombranube: 1, nubes: 1, aves: 1, estrellas: 1, rayos: 1, destello: 1, ao: 1, mb: 1, grano: 1, ca: 1, curva: 1 };
  for (const k in TG) TG[k] = !OFF.has(k);
  TG.ao = TG.ao && q.get('ao') !== '0'; // GTAO a 1/4 de resolución, 8 muestras, recalculada cada 2 cuadros (~1–2,5 ms); &ao=0 o &sinfx=ao la apagan
  if (!Q.alta) TG.ao = TG.rayos = TG.destello = TG.mb = false;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  // ═════════ 1. Perspectiva aérea + sombras de nubes en TODOS los materiales (parche del trozo de niebla de three) ═════════
  // Uniformes compartidos por referencia: three clona los uniformes de ShaderLib, pero un objeto plano {x,y,z,w} o un Float32Array
  // no se clonan (solo se copian por referencia), así que un único objeto alimenta a todos los programas.
  const U = {
    aerSun: { x: 0, y: 1, z: 0, w: 1 },   // xyz dirección del sol, w intensidad del brillo de Mie en la bruma
    aerMie: { x: 0, y: 0, z: 0, w: 0 },   // color de la bruma iluminada por el sol
    aerP: { x: 0, y: 1 / 700, z: 0, w: .9 }, // x extinción al nivel del valle (1/m), y caída con la altura (1/m), z altura del valle, w tope
    aerCs: { x: 1550, y: 0, z: 0, w: 0 }, // x altura de la capa de nubes, y fuerza de la sombra, z nº de nubes
    aerCl: new Float32Array(48),          // 12 nubes cercanas: x, z, radio, densidad
    aerT: new Float32Array(20),           // estructura cubierta más cercana: 4 puntos del eje (x, z, y del techo, s) + 1 (medio ancho, luz mínima, nº puntos, 0)
  };
  for (const id in THREE.ShaderLib) { const u = THREE.ShaderLib[id].uniforms; if (u && u.fogColor) { u.aerSun = { value: U.aerSun }; u.aerMie = { value: U.aerMie }; u.aerP = { value: U.aerP }; u.aerCs = { value: U.aerCs }; u.aerCl = { value: U.aerCl }; u.aerT = { value: U.aerT }; } }
  const C = THREE.ShaderChunk;
  C.fog_pars_vertex = '#ifdef USE_FOG\n varying float vFogDepth; varying vec3 vAerW;\n#endif';
  C.fog_vertex = '#ifdef USE_FOG\n vFogDepth = - mvPosition.z; vAerW = cameraPosition + transpose( mat3( viewMatrix ) ) * mvPosition.xyz;\n#endif';
  C.fog_pars_fragment = `#ifdef USE_FOG
 uniform vec3 fogColor; varying float vFogDepth; varying vec3 vAerW;
 #ifdef FOG_EXP2
  uniform float fogDensity;
 #else
  uniform float fogNear; uniform float fogFar;
 #endif
 uniform vec4 aerSun; uniform vec4 aerMie; uniform vec4 aerP; uniform vec4 aerCs; uniform vec4 aerCl[ 12 ]; uniform vec4 aerT[ 5 ];
#endif`;
  C.fog_fragment = `#ifdef USE_FOG
 if ( aerP.x > 0.0 ) {
  vec3 aRay = vAerW - cameraPosition; float aD = length( aRay ); vec3 aRd = aRay / max( aD, 1e-3 );
  float aRy = aRd.y * aerP.y * aD, aK = abs( aRy ) > 1e-4 ? ( 1.0 - exp( - aRy ) ) / aRy : 1.0;
  float aTau = aerP.x * exp( - aerP.y * max( cameraPosition.y - aerP.z, - 300.0 ) ) * aD * aK;
  float aF = min( 1.0 - exp( - aTau ), aerP.w );
  if ( aerCs.y > 0.0 && aerSun.y > 0.05 ) {
   vec2 pc = vAerW.xz + aerSun.xz * ( aerCs.x - vAerW.y ) / aerSun.y; float sh = 0.0;
   for ( int i = 0; i < 12; i ++ ) { if ( float( i ) >= aerCs.z ) break; vec4 c = aerCl[ i ]; vec2 dd = pc - c.xy;
    float w = 1.0 + 0.18 * sin( dd.x * 0.011 + c.w * 9.0 ) * sin( dd.y * 0.013 - c.w * 5.0 );
    sh = max( sh, c.w * ( 1.0 - smoothstep( 0.25, 1.0, dot( dd, dd ) / ( c.z * c.z ) * w ) ) ); }
   gl_FragColor.rgb *= 1.0 - aerCs.y * sh;
  }
  if ( aerT[ 4 ].z > 1.5 ) {   // dentro de un túnel o bajo un viaducto: solo la luz que entra por las bocas y la de las luminarias
   float bd = 1e9, bs = 0.0, by = 0.0;
   for ( int i = 0; i < 3; i ++ ) { if ( float( i + 2 ) > aerT[ 4 ].z ) break; vec2 a = aerT[ i ].xy, b = aerT[ i + 1 ].xy, ab = b - a; float h = clamp( dot( vAerW.xz - a, ab ) / max( dot( ab, ab ), 1e-3 ), 0.0, 1.0 ); float d = length( vAerW.xz - a - ab * h );
    if ( d < bd ) { bd = d; bs = mix( aerT[ i ].w, aerT[ i + 1 ].w, h ); by = mix( aerT[ i ].z, aerT[ i + 1 ].z, h ); } }
   float s0 = aerT[ 0 ].w, s1 = aerT[ int( aerT[ 4 ].z ) - 1 ].w, dm = min( bs - s0, s1 - bs );
   float inn = ( 1.0 - smoothstep( aerT[ 4 ].x + 0.8, aerT[ 4 ].x + 2.0, bd ) ) * ( 1.0 - step( by + 0.3, vAerW.y ) ) * step( 0.0, dm );
   float lamp = aerT[ 4 ].w < 0.2 ? 0.22 * pow( 0.5 + 0.5 * cos( bs * 0.785 ), 6.0 ) : 0.0;
   float L = mix( 1.0, aerT[ 4 ].w + lamp, smoothstep( 0.0, 28.0, dm ) );
   gl_FragColor.rgb *= mix( 1.0, L, inn );
  }
  float aMu = max( dot( aRd, aerSun.xyz ), 0.0 );
  vec3 aHz = fogColor + aerMie.rgb * ( pow( aMu, 6.0 ) * 0.55 + pow( aMu, 48.0 ) * 1.4 ) * aerSun.w;
  gl_FragColor.rgb = mix( gl_FragColor.rgb, aHz, aF );
 } else {
 #ifdef FOG_EXP2
  float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
 #else
  float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
 #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
 }
#endif`;

  // ═════════ 2. Cielo físico ═════════
  // Dispersión simple (Nishita) Rayleigh + Mie con sombra del planeta (crepúsculo correcto), en km. Se precalcula en una tabla 192×96
  // (acimut × elevación con más resolución en el horizonte) solo cuando el sol se mueve; la cúpula y el entorno de reflejos la leen.
  const ATM = `
 #define RP 6371.0
 #define RA 6471.0
 #define HR 8.0
 #define HM 1.2
 const vec3 KR = vec3( 5.8e-3, 13.5e-3, 33.1e-3 ), KO = vec3( 0.65e-3, 1.881e-3, 0.085e-3 ); // Rayleigh y ozono (capa a 25 km: deja azul el cénit en el crepúsculo)
 float oz( float h ) { return max( 0.0, 1.0 - abs( h - 25.0 ) / 15.0 ); }
 vec2 rsi( vec3 o, vec3 d, float r ) { float b = dot( d, o ), c = dot( o, o ) - r * r, h = b * b - c; if ( h < 0.0 ) return vec2( 1e5, -1e5 ); h = sqrt( h ); return vec2( - b - h, - b + h ); }
 vec3 scatter( vec3 rd, vec3 sd, float kM, float g ) {
  vec3 o = vec3( 0.0, RP + 0.9, 0.0 ); vec2 p = rsi( o, rd, RA ); p.x = max( p.x, 0.0 );
  vec2 pg = rsi( o, rd, RP ); if ( pg.x > 0.0 && pg.x < p.y ) p.y = pg.x;
  float st = ( p.y - p.x ) / 16.0, odR = 0.0, odM = 0.0, odO = 0.0; vec3 tR = vec3( 0.0 ), tM = vec3( 0.0 );
  for ( int i = 0; i < 16; i ++ ) {
   vec3 x = o + rd * ( p.x + st * ( float( i ) + 0.5 ) ); float h = length( x ) - RP;
   float dR = exp( - h / HR ) * st, dM = exp( - h / HM ) * st; odR += dR; odM += dM; odO += oz( h ) * st;
   vec2 ps = rsi( x, sd, RP ); if ( ps.x > 0.0 && ps.x < ps.y ) continue;   // ese punto está a la sombra de la Tierra
   float ls = rsi( x, sd, RA ).y / 6.0, lR = 0.0, lM = 0.0, lO = 0.0;
   for ( int j = 0; j < 6; j ++ ) { float hj = length( x + sd * ls * ( float( j ) + 0.5 ) ) - RP; lR += exp( - hj / HR ) * ls; lM += exp( - hj / HM ) * ls; lO += oz( hj ) * ls; }
   vec3 at = exp( - ( KR * ( odR + lR ) + KO * ( odO + lO ) + kM * 1.1 * ( odM + lM ) ) ); tR += dR * at; tM += dM * at;
  }
  float mu = dot( rd, sd ), gg = g * g;
  float pR = 3.0 / ( 16.0 * 3.14159 ) * ( 1.0 + mu * mu ), pM = 3.0 / ( 8.0 * 3.14159 ) * ( ( 1.0 - gg ) * ( mu * mu + 1.0 ) ) / ( pow( 1.0 + gg - 2.0 * mu * g, 1.5 ) * ( 2.0 + gg ) );
  return 22.0 * ( pR * KR * tR + pM * kM * tM );
 }`;
  const lutRT = new THREE.WebGLRenderTarget(192, 96, { type: THREE.HalfFloatType, depthBuffer: false, wrapS: THREE.RepeatWrapping, wrapT: THREE.ClampToEdgeWrapping, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter });
  lutRT.texture.wrapS = THREE.RepeatWrapping;
  const lutU = { sd: { value: new THREE.Vector3(0, 1, 0) }, kM: { value: 21e-3 } };
  const lutMat = new THREE.ShaderMaterial({ uniforms: lutU, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: ATM + `uniform vec3 sd; uniform float kM; varying vec2 vUv;
 void main(){ float az = ( vUv.x - 0.5 ) * 6.2831853, s = ( vUv.y - 0.5 ) * 2.0, el = sign( s ) * s * s * 1.5707963;
  vec3 rd = vec3( cos( el ) * sin( az ), sin( el ), - cos( el ) * cos( az ) ); rd.y = max( rd.y, -0.25 );
  gl_FragColor = vec4( scatter( normalize( rd ), sd, kM, 0.76 ), 1.0 ); }` });
  const lutScene = new THREE.Scene(), lutCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); lutScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lutMat));

  // la cúpula: mismo objeto de uniformes que usa el motor (skyU) + los nuestros
  Object.assign(skyU, { lut: { value: lutRT.texture }, gain: { value: GAIN }, sunTr: { value: new THREE.Color(1, 1, 1) }, sunDisc: { value: 1 }, noche: { value: 0 },
    moonDir: { value: new THREE.Vector3(.35, .8, .3).normalize() }, tiempo: { value: 0 }, hazeCol: { value: new THREE.Color(.5, .6, .7) }, tinte: { value: new THREE.Vector3(...TINTE_CIELO) }, estrellas: { value: 1 }, suelo: { value: new THREE.Color(.05, .05, .045) } });
  const SKY_FRAG = `uniform sampler2D lut; uniform vec3 sunDir; uniform float gain; uniform vec3 sunTr; uniform float sunDisc; uniform float noche; uniform vec3 moonDir; uniform float tiempo; uniform vec3 hazeCol; uniform float estrellas; uniform vec3 suelo; uniform vec3 tinte; varying vec3 d;
 float h13( vec3 p ) { p = fract( p * 0.1031 ); p += dot( p, p.zyx + 31.32 ); return fract( ( p.x + p.y ) * p.z ); }
 vec2 lutUV( vec3 n ) { float el = asin( clamp( n.y, -1.0, 1.0 ) ); return vec2( atan( n.x, - n.z ) / 6.2831853 + 0.5, 0.5 + 0.5 * sign( el ) * sqrt( abs( el ) / 1.5707963 ) ); }
 void main(){
  vec3 n = normalize( d ); float up = max( n.y, 0.0 );
  vec3 c = texture2D( lut, lutUV( vec3( n.x, max( n.y, 0.004 ), n.z ) ) ).rgb * gain * mix( vec3( 1.0 ), tinte, smoothstep( 0.03, 0.35, n.y ) );
  // noche: cielo de luna muy tenue + resplandor anaranjado de la ciudad en el horizonte
  c += noche * ( vec3( 0.02, 0.032, 0.07 ) * ( 0.35 + 0.65 * up ) + vec3( 0.09, 0.05, 0.022 ) * exp( - up * 9.0 ) );
  if ( estrellas > 0.5 && noche > 0.01 && n.y > 0.0 ) {
   vec3 p = n * 230.0, id = floor( p ); float h = h13( id );
   if ( h > 0.9955 ) { vec3 f = fract( p ) - 0.5 - ( vec3( h13( id + 7.1 ), h13( id + 3.3 ), h13( id + 9.7 ) ) - 0.5 ) * 0.5; float s = exp( - dot( f, f ) * 70.0 ) * ( h - 0.9955 ) / 0.0045;
    c += vec3( 1.0, 0.94, 0.86 ) * s * ( 0.75 + 0.25 * sin( tiempo * 2.7 + h * 811.0 ) ) * noche * smoothstep( 0.02, 0.3, n.y ) * 0.9; } }
  float md = dot( n, moonDir );
  c += noche * ( vec3( 0.85, 0.87, 0.92 ) * smoothstep( 0.999955, 0.99998, md ) * 0.9 + vec3( 0.022, 0.028, 0.042 ) * pow( max( md, 0.0 ), 240.0 ) );
  float sd = dot( n, sunDir ), lim = smoothstep( 0.999985, 0.999995, sd );
  c += sunTr * sunDisc * ( lim * 60.0 + smoothstep( 0.9998, 0.99999, sd ) * 4.0 );
  float bajo = smoothstep( 0.0, -0.06, n.y );
  #ifdef ENV
   c = mix( c, suelo, smoothstep( 0.0, -0.15, n.y ) );
  #else
   c = mix( c, hazeCol, bajo );
  #endif
  gl_FragColor = vec4( max( c, 0.0 ), 0.0 );   // alfa 0 = cielo (lo usan los rayos de luz y el destello)
 }`;
  skyMat.fragmentShader = SKY_FRAG; skyMat.needsUpdate = true;
  // entorno de reflejos: el mismo cielo, con suelo oscuro abajo (el vidrio de las torres refleja calle, no cielo)
  const envMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: skyU, defines: { ENV: 1 }, vertexShader: skyMat.vertexShader, fragmentShader: SKY_FRAG });
  const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100, 48, 24), envMat));
  const pmrem = new THREE.PMREMGenerator(renderer); let envRT = null;

  // gemelo en JS de la misma dispersión (para el color de la bruma, el color del sol, la luz ambiente y las nubes)
  const KR = [5.8e-3, 13.5e-3, 33.1e-3], KO = [.65e-3, 1.881e-3, .085e-3], RP = 6371, RA = 6471;
  function rsi(o, d, r) { const b = d[0] * o[0] + d[1] * o[1] + d[2] * o[2], c = o[0] * o[0] + o[1] * o[1] + o[2] * o[2] - r * r, h = b * b - c; if (h < 0) return null; const s = Math.sqrt(h); return [-b - s, -b + s]; }
  const _x = [0, 0, 0], oz = h => Math.max(0, 1 - Math.abs(h - 25) / 15);
  function scatterJS(rd, sd, kM, out) {
    const o = [0, RP + .9, 0], p = rsi(o, rd, RA); out[0] = out[1] = out[2] = 0; if (!p) return out; p[0] = Math.max(p[0], 0); const pg = rsi(o, rd, RP); if (pg && pg[0] > 0 && pg[0] < p[1]) p[1] = pg[0];
    const st = (p[1] - p[0]) / 16; let odR = 0, odM = 0, odO = 0; const tR = [0, 0, 0], tM = [0, 0, 0];
    for (let i = 0; i < 16; i++) {
      const t = p[0] + st * (i + .5); _x[0] = o[0] + rd[0] * t; _x[1] = o[1] + rd[1] * t; _x[2] = o[2] + rd[2] * t; const h = Math.hypot(_x[0], _x[1], _x[2]) - RP, dR = Math.exp(-h / 8) * st, dM = Math.exp(-h / 1.2) * st; odR += dR; odM += dM; odO += oz(h) * st;
      const ps = rsi(_x, sd, RP); if (ps && ps[0] > 0) continue; const ls = rsi(_x, sd, RA)[1] / 6; let lR = 0, lM = 0, lO = 0;
      for (let j = 0; j < 6; j++) { const tj = ls * (j + .5), hj = Math.hypot(_x[0] + sd[0] * tj, _x[1] + sd[1] * tj, _x[2] + sd[2] * tj) - RP; lR += Math.exp(-hj / 8) * ls; lM += Math.exp(-hj / 1.2) * ls; lO += oz(hj) * ls; }
      for (let k = 0; k < 3; k++) { const at = Math.exp(-(KR[k] * (odR + lR) + KO[k] * (odO + lO) + kM * 1.1 * (odM + lM))); tR[k] += dR * at; tM[k] += dM * at; }
    }
    const mu = rd[0] * sd[0] + rd[1] * sd[1] + rd[2] * sd[2], g = .76, gg = g * g, pR = 3 / (16 * Math.PI) * (1 + mu * mu), pM = 3 / (8 * Math.PI) * ((1 - gg) * (mu * mu + 1)) / (Math.pow(1 + gg - 2 * mu * g, 1.5) * (2 + gg));
    for (let k = 0; k < 3; k++) out[k] = 22 * (pR * KR[k] * tR[k] + pM * kM * tM[k]); return out;
  }
  function transJS(sd, kM, out) { // transmitancia del sol hasta el observador
    const o = [0, RP + .9, 0]; if (sd[1] < -.02) { out[0] = out[1] = out[2] = 0; return out; } const L = rsi(o, sd, RA)[1] / 24; let lR = 0, lM = 0, lO = 0;
    for (let j = 0; j < 24; j++) { const t = L * (j + .5), h = Math.hypot(sd[0] * t, o[1] + sd[1] * t, sd[2] * t) - RP; lR += Math.exp(-h / 8) * L; lM += Math.exp(-h / 1.2) * L; lO += oz(h) * L; }
    for (let k = 0; k < 3; k++) out[k] = Math.exp(-(KR[k] * lR + KO[k] * lO + kM * 1.1 * lM)); return out;
  }
  const A = { adapt: 1, hz: [0, 0, 0], hzS: [0, 0, 0], zen: [0, 0, 0], tr: [0, 0, 0], tmp: [0, 0, 0], sd: [0, 1, 0], key: '' };

  const L_DIA = (() => { const el = SOL_DIA.el * Math.PI / 180, z = scatterJS([0, 1, 0], [Math.cos(el) * .5, Math.sin(el), Math.cos(el) * .866], 21e-3, [0, 0, 0]); return (z[0] * .2126 + z[1] * .7152 + z[2] * .0722) * GAIN; })();

  // ═════════ 3. Nubes: cúmulos con volumen (impostores esféricos iluminados) + el gorro del Ávila ═════════
  let cloudMesh = null, cloudMat = null; const CL = []; // cúmulos: {x, z, base, r, dens}
  const NUBE_U = { sunDir: { value: sunDir }, cSun: { value: new THREE.Color() }, cAmb: { value: new THREE.Color() }, cBase: { value: new THREE.Color() }, viento: { value: 0 }, wrapL: { value: 34000 },
    camXZ: { value: new THREE.Vector2() }, fogColor: { value: new THREE.Color() }, aerP: { value: U.aerP }, aerSun: { value: U.aerSun }, aerMie: { value: U.aerMie }, noche: { value: 0 }, opac: { value: 1 } };
  (function nubes() {
    if (!TG.nubes) return;
    let sd = 1234567; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const P = []; // por cada bocanada (12 valores): x y z radio | base tipo semilla — | centro del cúmulo x y z, radio del cúmulo
    // cúmulos sueltos sobre el valle y alrededor (base ~2.200 m s. n. m. = Y 1.370), algunos grandes y la mayoría pequeños, como en el video
    for (let k = 0; k < 34; k++) {
      const cx = (r() - .5) * 32000, cz = -9500 + r() * 19000, base = 1300 + r() * 220, W = 220 + Math.pow(r(), 1.6) * 760, n = 12 + Math.floor(W / 28), dens = .6 + r() * .35, top = W * (.45 + r() * .3);
      CL.push({ x: cx, z: cz, base, r: W * .8, dens });
      for (let i = 0; i < n; i++) { const a = r() * 6.283, rr = Math.sqrt(r()) * W * .55, rad = (W * .12 + r() * W * .13) * (1 - rr / W * .5), x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr * .75, y = base + rad * .45 + r() * (1 - rr / (W * .6)) * top;
        P.push(x, y, z, rad, base, 0, r(), 0, cx, base + top * .35, cz, W * .6); }
    }
    // el gorro de nubes pegado a la fila del Ávila: se busca la cresta en el relieve real (al norte, z < −3.000) y se envuelve con bancos chatos
    const T = D.terreno, Y = ctx.Y;
    for (let x = T.x0 + 600; x < T.x0 + (T.nx - 1) * T.dx - 600; x += 210) {
      let best = -1, bz = 0; for (let z = T.z0; z < -3000; z += 60) { const h = ctx.hT(x, z); if (h > best) { best = h; bz = z; } }
      if (best < 1700) continue; const yR = Y(best), on = Math.sin(x * .00037 + 1.3) + Math.sin(x * .0009 + .4) * .7 + (best - 2000) / 900; if (on < -.15) continue;
      const m = 3 + Math.floor(r() * 3 + on * 1.5), cy = yR + 60;
      for (let i = 0; i < m; i++) { const rad = 240 + r() * 260; P.push(x + (r() - .5) * 340, yR - 140 + r() * 300, bz + (r() - .55) * 900, rad, yR - 330, 1, r(), 0, x, cy, bz, 700); }
    }
    const NV = 12, n = P.length / NV, g = new THREE.InstancedBufferGeometry(); g.setIndex([0, 1, 2, 0, 2, 3]); g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
    const src = new Float32Array(P), at = ['iC', 'iB', 'iD'].map(nm => { const a = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4); a.setUsage(THREE.DynamicDrawUsage); g.setAttribute(nm, a); return a; }); g.instanceCount = n;
    cloudMat = new THREE.ShaderMaterial({ uniforms: NUBE_U, transparent: true, depthWrite: false, fog: false,
      vertexShader: `attribute vec4 iC; attribute vec4 iB; attribute vec4 iD; uniform float viento; uniform float wrapL; uniform vec2 camXZ; varying vec2 vQ; varying vec3 vW; varying vec4 vB; varying float vR; varying vec4 vD;
 void main(){ vec3 c = iC.xyz; vec4 dd = iD; if ( iB.y < 0.5 ) { float cx = iD.x + viento; float wx = camXZ.x + mod( cx - camXZ.x + wrapL * 0.5, wrapL ) - wrapL * 0.5; c.x += wx - iD.x; dd.x = wx; }
  vec3 R = vec3( viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0] ), Up = vec3( viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1] );
  float sq = iB.y > 0.5 ? 0.5 : 0.85; vec3 w = c + ( R * position.x + Up * position.y * sq ) * iC.w * 1.15;
  vQ = position.xy; vW = w; vB = iB; vR = iC.w; vD = dd; gl_Position = projectionMatrix * viewMatrix * vec4( w, 1.0 ); }`,
      fragmentShader: `uniform vec3 sunDir; uniform vec3 cSun; uniform vec3 cAmb; uniform vec3 cBase; uniform vec3 fogColor; uniform vec4 aerP; uniform vec4 aerSun; uniform vec4 aerMie; uniform float noche; uniform float opac;
 varying vec2 vQ; varying vec3 vW; varying vec4 vB; varying float vR; varying vec4 vD;
 float hh( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
 float vn( vec2 p ) { vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f ); return mix( mix( hh( i ), hh( i + vec2( 1, 0 ) ), f.x ), mix( hh( i + vec2( 0, 1 ) ), hh( i + 1.0 ), f.x ), f.y ); }
 void main(){
  vec2 q = vQ * 1.15; float r2 = dot( q, q ); if ( r2 > 1.0 ) discard;
  float sd = vB.z * 37.0, nz = vn( q * 2.3 + sd ) * 0.5 + vn( q * 5.1 - sd ) * 0.3 + vn( q * 11.0 + sd * 1.7 ) * 0.2;
  float ed = vB.y > 0.5 ? 0.9 : 0.75;                                       // el gorro del Ávila es más deshilachado
  float z = sqrt( 1.0 - r2 ), dens = smoothstep( 0.12, 0.62, ( 1.0 - r2 ) * 0.85 + ( nz - 0.5 ) * ed );
  dens *= smoothstep( vB.x - 10.0, vB.x + 60.0, vW.y );                     // base plana
  if ( vB.y > 0.5 ) dens *= 0.82;
  if ( dens < 0.01 ) discard;
  vec3 R = vec3( viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0] ), Up = vec3( viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1] ), F = cross( Up, R );
  vec3 nP = normalize( R * q.x + Up * q.y + F * z );                        // normal de la bocanada
  vec3 nC = ( vW - vD.xyz ) / vD.w;                                          // posición dentro del cúmulo entero
  vec3 nW = normalize( normalize( nC + vec3( 0.0, 0.25, 0.0 ) ) * 0.75 + nP * 0.45 );
  float hgt = clamp( ( vW.y - vB.x ) / max( vD.y - vB.x, 50.0 ) * 0.5, 0.0, 1.0 );
  float ndl = dot( nW, sunDir ), dif = smoothstep( -0.55, 0.85, ndl );
  float occ = mix( 0.5, 1.0, smoothstep( 0.0, 0.9, hgt ) ) * mix( 0.7, 1.0, clamp( length( nC ), 0.0, 1.0 ) ) * mix( 0.82, 1.0, nz );
  vec3 V = normalize( vW - cameraPosition ); float mu = max( dot( V, sunDir ), 0.0 );
  vec3 col = cAmb * occ * mix( 0.75, 1.05, hgt ) + cSun * dif * occ + cSun * pow( mu, 8.0 ) * ( 1.0 - dens ) * 1.8;
  col += cBase * ( 1.0 - hgt ) * noche;                                     // de noche, la ciudad ilumina la panza de las nubes
  float D = length( vW - cameraPosition ), ry = V.y * aerP.y * D, k = abs( ry ) > 1e-4 ? ( 1.0 - exp( - ry ) ) / ry : 1.0;
  float aF = min( 1.0 - exp( - aerP.x * exp( - aerP.y * max( cameraPosition.y - aerP.z, -300.0 ) ) * D * k ), aerP.w );
  col = mix( col, fogColor + aerMie.rgb * pow( mu, 6.0 ) * 0.55 * aerSun.w, aF * 0.85 );
  gl_FragColor = vec4( col, dens * opac );
 }` });
    cloudMesh = new THREE.Mesh(g, cloudMat); cloudMesh.frustumCulled = false; cloudMesh.renderOrder = -5; cloudMesh.userData.noAO = true; scene.add(cloudMesh);
    // orden de atrás hacia adelante (cada ~0,4 s), sin crear memoria
    const ord = new Uint32Array(n), dist = new Float32Array(n), cmp = (a, b) => dist[b] - dist[a];
    for (let i = 0; i < n; i++) ord[i] = i;
    cloudMesh.userData.sort = (cx, cz, cy, wind) => {
      const L = 34000;
      for (let i = 0; i < n; i++) { const o = i * NV; let x = src[o]; if (src[o + 5] < .5) { const c0 = src[o + 8] + wind, wx = cx + ((((c0 - cx + L / 2) % L) + L) % L) - L / 2; x += wx - src[o + 8]; } dist[i] = (x - cx) ** 2 + (src[o + 1] - cy) ** 2 + (src[o + 2] - cz) ** 2; }
      ord.sort(cmp);
      for (let k = 0; k < n; k++) { const o = ord[k] * NV; for (let a = 0; a < 3; a++) for (let j = 0; j < 4; j++) at[a].array[k * 4 + j] = src[o + a * 4 + j]; }
      at[0].needsUpdate = at[1].needsUpdate = at[2].needsUpdate = true;
    };
  })();

  // ═════════ 4. Vida en el cielo: guacamayas azul y amarillo (parejas y bandadas) y zamuros planeando ═════════
  const AV = (function aves() {
    if (!TG.aves) return null;
    const mk = (pos, col) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); const c = []; for (let i = 0; i < pos.length / 3; i++) c.push(...col[Math.floor(i / 3) % col.length]); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); g.computeVertexNormals(); return g; };
    const az = [.07, .25, .72], am = [.92, .62, .06], vd = [.12, .45, .25], ro = [.5, .06, .05];
    // guacamaya: cuerpo (rombo alargado, lomo azul y pecho amarillo) + cola larga azul; +z = adelante
    const body = mk([0, .07, .24, -.08, 0, 0, 0, .06, -.2, /**/ 0, .07, .24, 0, .06, -.2, .08, 0, 0, /**/ 0, -.07, .2, 0, -.05, -.18, -.08, 0, 0, /**/ 0, -.07, .2, .08, 0, 0, 0, -.05, -.18,
      /*cola*/ -.03, .02, -.18, 0, 0, -.62, .03, .02, -.18, /**/ .03, .02, -.18, 0, 0, -.62, -.03, .02, -.18, /*cabeza*/ 0, .07, .24, -.04, .02, .36, .04, .02, .36],
      [az, az, am, am, az, ro, vd]);
    const ala = s => mk([0, 0, .1, s * .55, 0, -.02, 0, 0, -.12, /**/ s * .55, 0, -.02, s * .48, 0, -.16, 0, 0, -.12, /* revés */ 0, -.004, .1, 0, -.004, -.12, s * .55, -.004, -.02, s * .55, -.004, -.02, 0, -.004, -.12, s * .48, -.004, -.16],
      s > 0 ? [az, az, am, am] : [az, az, am, am]);
    const alaL = ala(-1), alaR = ala(1);
    // las alas derechas tienen el orden de vértices invertido para que la cara de arriba mire arriba
    { const p = alaR.attributes.position.array; for (let i = 0; i < p.length; i += 9) for (let k = 0; k < 3; k++) { const t = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = t; } alaR.computeVertexNormals(); }
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true }), NM = 26;
    const mB = new THREE.InstancedMesh(body, mat, NM), mL = new THREE.InstancedMesh(alaL, mat, NM), mR = new THREE.InstancedMesh(alaR, mat, NM);
    // zamuro: alas largas y rectas con «dedos», casi negro; planea en círculos en las térmicas
    const zp = [0, .05, .3, -.1, 0, 0, .1, 0, 0, /**/ 0, .05, .3, .1, 0, 0, -.1, 0, 0, /**/ -.1, 0, 0, -.78, .1, .05, -.75, .1, -.2, /**/ -.1, 0, 0, -.75, .1, -.2, -.05, 0, -.2, /**/ .1, 0, 0, .75, .1, -.2, .78, .1, .05, /**/ .1, 0, 0, .05, 0, -.2, .75, .1, -.2,
      /*cola*/ -.08, 0, -.15, 0, 0, -.42, .08, 0, -.15, /*cabeza*/ 0, .03, .3, -.03, .01, .42, .03, .01, .42];
    const zg = mk(zp, [[.06, .06, .065]]), zMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), NZ = 9, mZ = new THREE.InstancedMesh(zg, zMat, NZ);
    for (const m of [mB, mL, mR, mZ]) { m.frustumCulled = false; m.castShadow = false; m.userData.noAO = true; m.count = 0; scene.add(m); }
    const bird = Array.from({ length: NM }, () => ({ on: false, x: 0, y: 0, z: 0, h: 0, v: 13, ph: Math.random() * 6, f: 4.6 + Math.random() * .8, wob: Math.random() * 6, life: 0 }));
    const zam = Array.from({ length: NZ }, (_, i) => ({ on: false, cx: 0, cz: 0, y: 0, r: 60, a: Math.random() * 6.28, w: .14, ph: i }));
    const o = new THREE.Object3D(); let sd = 99; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    function flock(p, east) {
      const free = bird.filter(b => !b.on); if (free.length < 2) return; const size = r() < .6 ? 2 : Math.min(free.length, 3 + Math.floor(r() * 4));
      const fwd = Math.atan2(p.tx, p.tz), ahead = 140 + r() * 380, lat = (r() - .5) * 420, bx = p.x + p.tx * ahead + p.tz * lat + (east ? 120 : 0), bz = p.z + p.tz * ahead - p.tx * lat;
      const h = (r() < .5 ? fwd + Math.PI / 2 : fwd - Math.PI / 2) + (r() - .5) * 1.4, y = ctx.Y(ctx.hT(bx, bz)) + 28 + r() * 55;
      for (let i = 0; i < size; i++) { const b = free[i], pair = Math.floor(i / 2), side = i % 2 ? 1 : -1; Object.assign(b, { on: true, x: bx - Math.sin(h) * pair * 7 + Math.cos(h) * side * 1.6, z: bz - Math.cos(h) * pair * 7 - Math.sin(h) * side * 1.6, y: y + (r() - .5) * 3, h, v: 12 + r() * 3, life: 0 }); }
    }
    let tSpawn = 0;
    update.mallas = { guacamayas: mB, zamuros: mZ };
    return update;
    function update(t, dt, p, sunUp, noche) {
      // guacamayas: de día; más al amanecer y hacia el este (salen de los dormideros al alba)
      const alba = sstep(-.06, .02, sunUp) * (1 - sstep(.25, .6, sunUp)), want = noche > .65 ? 0 : 4 + Math.round(10 * alba);
      tSpawn -= dt; const act = bird.reduce((a, b) => a + b.on, 0);
      if (tSpawn <= 0 && act < want) { flock(p, r() < .35 + alba * .4); tSpawn = 2.5 + r() * 6; }
      let n = 0; const cx = camera.position.x, cz = camera.position.z;
      for (const b of bird) { if (!b.on) continue; b.life += dt; b.h += Math.sin(t * .4 + b.wob) * .08 * dt; b.x += Math.sin(b.h) * b.v * dt; b.z += Math.cos(b.h) * b.v * dt; b.y += Math.sin(t * .9 + b.wob) * .4 * dt;
        if (Math.hypot(b.x - cx, b.z - cz) > 900 || b.life > 90) { b.on = false; continue; }
        const fl = Math.sin(t * b.f * 6.283 + b.ph), bob = fl * .05;
        o.position.set(b.x, b.y + bob, b.z); o.rotation.set(-.05, b.h, Math.sin(t * .4 + b.wob) * .12, 'YXZ'); o.scale.setScalar(1); o.updateMatrix(); mB.setMatrixAt(n, o.matrix);
        o.rotation.z += -fl * .55; o.updateMatrix(); mL.setMatrixAt(n, o.matrix); o.rotation.z += fl * 1.1; o.updateMatrix(); mR.setMatrixAt(n, o.matrix); n++; }
      mB.count = mL.count = mR.count = n; mB.instanceMatrix.needsUpdate = mL.instanceMatrix.needsUpdate = mR.instanceMatrix.needsUpdate = true;
      // zamuros: solo con sol (térmicas), en 3 corrientes alrededor del corredor
      const day = sstep(.12, .3, sunUp); let m = 0;
      if (day > 0) for (const z of zam) {
        if (!z.on || Math.hypot(z.cx - cx, z.cz - cz) > 1400) { const th = Math.floor(z.ph / 3), a = r() * 6.28, dd = 250 + r() * 700; z.cx = p.x + p.tx * dd * (th === 0 ? 1 : .5) + Math.cos(a) * 200 * th; z.cz = p.z + p.tz * dd + Math.sin(a) * 200 * th; z.y = ctx.Y(ctx.hT(z.cx, z.cz)) + 140 + r() * 230; z.r = 45 + r() * 60; z.w = (9 + r() * 3) / z.r; z.on = true; }
        z.a += z.w * dt; const x = z.cx + Math.cos(z.a) * z.r, zz = z.cz + Math.sin(z.a) * z.r, h = Math.atan2(-Math.sin(z.a), Math.cos(z.a));
        o.position.set(x, z.y + Math.sin(z.a * .5) * 8, zz); o.rotation.set(0, h, -.32, 'YXZ'); o.scale.setScalar(1.05); o.updateMatrix(); mZ.setMatrixAt(m++, o.matrix);
      }
      mZ.count = m; mZ.instanceMatrix.needsUpdate = true;
    };
  })();

  // ═════════ 5. Posproceso ═════════
  const SP = ctx.ShaderPass || ctx.grade.constructor;
  const quad = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
  // 5a. «luz»: desenfoque de movimiento radial + rayos de luz (máscara de cielo en el alfa) + destello de lente. Va justo después del render.
  const luzU = { tDiffuse: { value: null }, sunUV: { value: new THREE.Vector2() }, rays: { value: 0 }, rayCol: { value: new THREE.Color() }, flare: { value: 0 }, aspect: { value: 1.7 }, mb: { value: 0 }, mbC: { value: new THREE.Vector2(.5, .5) }, t: { value: 0 } };
  const luz = new SP({ uniforms: luzU, vertexShader: quad, fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 sunUV; uniform float rays; uniform vec3 rayCol; uniform float flare; uniform float aspect; uniform float mb; uniform vec2 mbC; uniform float t; varying vec2 vUv;
 float h12( vec2 p ) { vec3 p3 = fract( vec3( p.xyx ) * 0.1031 ); p3 += dot( p3, p3.yzx + 33.33 ); return fract( ( p3.x + p3.y ) * p3.z ); }
 void main(){
  vec4 base = texture2D( tDiffuse, vUv ); vec3 c = base.rgb; float jit = h12( gl_FragCoord.xy + t );
  if ( mb > 0.0005 ) { vec2 dv = ( vUv - mbC ) * mb; vec3 acc = c; float w = 1.0;
   for ( int i = 1; i < 8; i ++ ) { float k = ( float( i ) - jit ) / 7.0, wi = 1.0 - k * 0.5; acc += texture2D( tDiffuse, vUv - dv * k ).rgb * wi; w += wi; } c = acc / w; }
  if ( rays > 0.0005 ) { vec2 st = ( sunUV - vUv ) / 30.0 * 0.92; vec2 uv = vUv + st * jit; float dec = 1.0, acc = 0.0;
   for ( int i = 0; i < 30; i ++ ) { uv += st; vec2 cu = clamp( uv, 0.0, 1.0 ); float m = 1.0 - texture2D( tDiffuse, cu ).a; vec2 e = ( cu - sunUV ) * vec2( aspect, 1.0 ); acc += m * exp( - dot( e, e ) * 9.0 ) * dec; dec *= 0.955; }
   c += rayCol * rays * acc / 30.0; }
  if ( flare > 0.0005 ) { vec2 sc = sunUV - 0.5; float vis = 0.0;
   for ( int i = 0; i < 5; i ++ ) { vec2 o = vec2( i == 1 ? 0.004 : i == 2 ? -0.004 : 0.0, i == 3 ? 0.006 : i == 4 ? -0.006 : 0.0 ); vis += 1.0 - texture2D( tDiffuse, clamp( sunUV + o, 0.001, 0.999 ) ).a; }
   vis *= 0.2 * flare; vec3 f = vec3( 0.0 );
   for ( int i = 0; i < 5; i ++ ) { float k = i == 0 ? -0.35 : i == 1 ? -0.7 : i == 2 ? -1.15 : i == 3 ? -1.5 : -2.1, rad = i == 0 ? 0.03 : i == 1 ? 0.06 : i == 2 ? 0.022 : i == 3 ? 0.11 : 0.05;
    vec2 g = 0.5 + sc * k; vec2 e = ( vUv - g ) * vec2( aspect, 1.0 ); float d = length( e ) / rad;
    vec3 tint = i == 0 ? vec3( 0.4, 0.8, 1.0 ) : i == 1 ? vec3( 1.0, 0.6, 0.3 ) : i == 2 ? vec3( 0.5, 1.0, 0.6 ) : i == 3 ? vec3( 0.35, 0.45, 1.0 ) : vec3( 1.0, 0.4, 0.8 );
    f += tint * smoothstep( 1.0, 0.75, d ) * ( 0.35 + 0.65 * d * d ) * 0.05; }
   vec2 e = ( vUv - sunUV ) * vec2( aspect, 1.0 ); float an = atan( e.y, e.x );
   f += rayCol * ( exp( - length( e ) * 7.0 ) * 0.25 + pow( abs( cos( an * 3.0 ) ), 40.0 ) * exp( - length( e ) * 12.0 ) * 0.5 );
   c += f * vis + rayCol * vis * 0.025; }
  gl_FragColor = vec4( c, base.a );
 }` });
  // 5b. «cámara»: va al final (después del ACES), en espacio de pantalla: balance, niveles, curva en S, saturación/vibrancia,
  //     polarizador del cielo, verdes, viñeta, aberración cromática y grano.
  const camU = { tDiffuse: { value: null }, t: { value: 0 }, wb: { value: new THREE.Vector3(...COLOR.wb) }, blk: { value: COLOR.blk }, wht: { value: COLOR.wht }, con: { value: COLOR.con }, sat: { value: COLOR.sat }, vib: { value: COLOR.vib },
    cielo: { value: COLOR.cieloAzul }, verde: { value: COLOR.verde }, vig: { value: COLOR.vig }, ca: { value: .0016 }, grano: { value: .022 }, res: { value: new THREE.Vector2(1280, 720) }, curva: { value: 1 }, gam: { value: COLOR.gam }, lente: { value: 0 } };
  const cam = new SP({ uniforms: camU, vertexShader: quad, fragmentShader: `uniform sampler2D tDiffuse; uniform float t; uniform vec3 wb; uniform float blk; uniform float wht; uniform float con; uniform float sat; uniform float vib; uniform float cielo; uniform float verde; uniform float vig; uniform float ca; uniform float grano; uniform vec2 res; uniform float curva; uniform float gam; uniform float lente; varying vec2 vUv;
 float h12( vec2 p ) { vec3 p3 = fract( vec3( p.xyx ) * 0.1031 ); p3 += dot( p3, p3.yzx + 33.33 ); return fract( ( p3.x + p3.y ) * p3.z ); }
 void main(){
  vec2 qv = vUv - 0.5; float r2 = dot( qv, qv );
  // gran angular de cámara de acción: barril (los bordes se curvan hacia adentro); se acerca un poco para no mostrar el borde
  vec2 qa = qv * vec2( res.x / res.y, 1.0 ); float ra = dot( qa, qa );
  vec2 uv = 0.5 + qv * ( 1.0 + lente * ra ) / ( 1.0 + lente * 0.42 );
  vec2 off = qv * ca * ( 0.4 + r2 * 4.0 );
  vec3 c = vec3( texture2D( tDiffuse, uv - off ).r, texture2D( tDiffuse, uv ).g, texture2D( tDiffuse, uv + off ).b );
  if ( curva > 0.5 ) {
   c *= wb; c = clamp( ( c - blk ) / ( wht - blk ), 0.0, 1.0 );
   c = pow( c, vec3( gam ) ); vec3 s = c * c * ( 3.0 - 2.0 * c ); c = mix( c, s, con );
   float mx = max( c.r, max( c.g, c.b ) ), mn = min( c.r, min( c.g, c.b ) ), st = mx - mn, l = dot( c, vec3( 0.2126, 0.7152, 0.0722 ) );
   c = mix( vec3( l ), c, sat + vib * ( 1.0 - st ) * ( 1.0 - st ) );
   float azul = clamp( ( c.b - max( c.r, c.g ) ) * 4.0, 0.0, 1.0 ) * smoothstep( 0.25, 0.6, c.b );   // cielo: más profundo y denso
   c = mix( c, c * vec3( 0.78, 0.9, 1.0 ) * ( 0.95 + 0.05 * c.b ), azul * cielo );
   float vrd = clamp( ( c.g - max( c.r, c.b ) ) * 5.0, 0.0, 1.0 ); c = mix( c, c * vec3( 0.88, 1.06, 0.82 ), vrd * verde );
  }
  c *= 1.0 - ( vig + lente * 0.9 ) * smoothstep( 0.05, 0.55, r2 * 1.6 );
  float gr = h12( gl_FragCoord.xy + fract( t * 7.13 ) * 517.0 ) - 0.5; c += gr * grano * ( 0.35 + 0.65 * ( 1.0 - abs( dot( c, vec3( 0.33 ) ) * 2.0 - 1.0 ) ) );
  gl_FragColor = vec4( clamp( c, 0.0, 1.0 ), 1.0 );
 }` });
  let gtao = null;
  if (Q.alta) {
    const rp = composer.passes.find(p => p.scene === scene && !p.isGTAO) || composer.passes[0];
    composer.insertPass(luz, composer.passes.indexOf(rp) + 1);
    composer.addPass(cam);
    ctx.grade.uniforms.sat.value = COLOR.preSat; ctx.grade.uniforms.con.value = 1; ctx.grade.uniforms.vig.value = 0;
    import('three/addons/postprocessing/GTAOPass.js').then(({ GTAOPass }) => {
      const sz = new THREE.Vector2(); renderer.getDrawingBufferSize(sz);
      gtao = new GTAOPass(scene, camera, sz.x >> 2, sz.y >> 2); gtao.isGTAO = true;
      gtao.updateGtaoMaterial({ radius: 2.6, distanceExponent: 1.6, thickness: 2.5, scale: 1.15, samples: 8, distanceFallOff: 1, screenSpaceRadius: false });
      gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 4, radiusExponent: 1, rings: 2, samples: 8 });
      gtao.blendIntensity = .7;
      const ss = gtao.setSize.bind(gtao); gtao.setSize = (w, h) => ss(Math.max(1, w >> 2), Math.max(1, h >> 2));
      // nubes y aves fuera del pase de normales (sus impostores no tienen profundidad real)
      const ov = gtao.overrideVisibility.bind(gtao); gtao.overrideVisibility = () => { ov(); scene.traverse(o => { if (o.userData.noAO || o === ctx.skyDome) o.visible = false; }); };
      // se recalcula un cuadro sí y otro no (normales + AO + filtro); en el otro solo se mezcla el resultado anterior: la mitad de costo
      const full = gtao.render.bind(gtao); let fr = 0;
      gtao.render = (r, w, rb, dt, m) => { if ((fr++ & 1) === 0) return full(r, w, rb, dt, m); const out = gtao.renderToScreen ? null : w;
        gtao.copyMaterial.uniforms.tDiffuse.value = rb.texture; gtao.copyMaterial.blending = THREE.NoBlending; gtao.renderPass(r, gtao.copyMaterial, out);
        gtao.blendMaterial.uniforms.intensity.value = gtao.blendIntensity; gtao.blendMaterial.uniforms.tDiffuse.value = gtao.pdRenderTarget.texture; gtao.renderPass(r, gtao.blendMaterial, out); };
      composer.insertPass(gtao, composer.passes.indexOf(luz) + 1); gtao.enabled = TG.ao;
    }).catch(e => console.warn('atmosfera: sin GTAO', e));
  }

  // ═════════ 6. Cada cuadro ═════════
  const v3 = new THREE.Vector3(), v3b = new THREE.Vector3(), cTmp = new THREE.Color(), pAhead = {};
  let lastSun = new THREE.Vector3(9, 9, 9), lastNoche = -1, envT = -99, sortT = 0, wind = 0, shadowMat = null, catcherHook = false;
  const CLs = CL.slice(), cmpCL = (a, b) => a.d - b.d;
  // ═════════ Túneles y viaductos: estructuras cubiertas, luminarias y adaptación del ojo ═════════
  const { sOfKm, ROAD_W } = ctx, CUB = [];
  for (const t of D.tuneles || []) CUB.push({ s0: sOfKm(t.km1), s1: sOfKm(t.km2), H: t.alto || 5.4, hw: ROAD_W / 2 + .7, min: .1, tunel: true });
  for (const e of D.estructuras || []) if (e.tipo === 'cubierta') CUB.push({ s0: sOfKm(e.km0), s1: sOfKm(e.km1), H: e.alto || 7, hw: (e.ancho || ROAD_W + 10) / 2, min: .4, tunel: false });
  const _o = {};
  for (const c of CUB) { c.pts = []; for (let k = 0; k < 4; k++) { const ss = c.s0 + (c.s1 - c.s0) * k / 3; ctx.P(ss, _o); c.pts.push(_o.x, _o.z, _o.y + c.H, ss); } }
  // luminarias de túnel: regletas cálidas en lo alto de ambas paredes, cada 8 m (el sombreado del parche usa la misma fase)
  (function luminarias() {
    const lp = []; for (const c of CUB) if (c.tunel) for (let ss = Math.ceil(c.s0 / 8) * 8; ss < c.s1; ss += 8) { ctx.P(ss, _o); for (const sd of [1, -1]) lp.push([_o.x + _o.tz * (c.hw - .2) * sd, _o.y + c.H - .45, _o.z - _o.tx * (c.hw - .2) * sd, Math.atan2(_o.tx, _o.tz)]); }
    if (!lp.length) return; const m = new THREE.InstancedMesh(new THREE.BoxGeometry(.22, .12, 1.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.6, 1.8), fog: false }), lp.length), d = new THREE.Object3D();
    lp.forEach((l, i) => { d.position.set(l[0], l[1], l[2]); d.rotation.set(0, l[3], 0); d.updateMatrix(); m.setMatrixAt(i, d.matrix); }); m.userData.noAO = true; scene.add(m);
  })();
  let expoAd = 1, cubAct = null, lastS = -1e9;
  function cubiertas(s, dt) {
    let best = null, bd = 1e9; for (const c of CUB) { const d = s < c.s0 ? c.s0 - s : s > c.s1 ? s - c.s1 : 0; if (d < bd) { bd = d; best = c; } }
    if (best && bd < 400) { if (best !== cubAct) { for (let i = 0; i < 16; i++) U.aerT[i] = best.pts[i]; U.aerT[16] = best.hw; U.aerT[17] = 0; U.aerT[18] = 4; U.aerT[19] = best.min; cubAct = best; } } else { U.aerT[18] = 0; cubAct = null; }
    // luz en la cámara y exposición que se adapta: al entrar el ojo tarda en abrirse; al salir, la boca deslumbra unos instantes
    let L = 1; if (cubAct) { const dm = Math.min(s - cubAct.s0, cubAct.s1 - s); if (dm > 0) L = 1 + (cubAct.min - 1) * sstep(0, 28, dm); }
    const tgt = Math.min(2.4, Math.pow(1 / L, .5)), k = Math.abs(s - lastS) > 40 ? 1 : 1 - Math.exp(-dt / (tgt > expoAd ? .9 : .45)); expoAd += (tgt - expoAd) * k; lastS = s; // un salto de km (seek) adapta de golpe
  }
  const camDbg = (q.get('atmcam') || '').split(',').map(Number); // depuración: &atmcam=x,y,z,mirax,miray,miraz (cámara fija)
  function hook(noche, t, dt, p) {
    if (camDbg.length === 6) { camera.position.set(camDbg[0], camDbg[1], camDbg[2]); camera.lookAt(camDbg[3], camDbg[4], camDbg[5]); camera.updateMatrixWorld(); }
    // pleno día: el sol del video (alto, media mañana); hora real: el recorrido del motor
    if (S.dia) { const el = SOL_DIA.el * Math.PI / 180, az = SOL_DIA.az * Math.PI / 180; sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az)); sun.position.copy(sun.target.position).addScaledVector(sunDir, 700); sun.castShadow = Q.alta && Q.sombras !== false; }
    const sy = sunDir.y, alba = sstep(-.14, .0, sy) * (1 - sstep(.08, .4, sy));
    // 1) tabla del cielo, colores de bruma/sol/ambiente: solo si el sol se movió
    if (sunDir.distanceToSquared(lastSun) > 2e-6 || Math.abs(noche - lastNoche) > .01) {
      lastSun.copy(sunDir); lastNoche = noche; const kM = (21 + 12 * alba) * 1e-3; lutU.sd.value.copy(sunDir); lutU.kM.value = kM;
      const rt = renderer.getRenderTarget(); renderer.setRenderTarget(lutRT); renderer.render(lutScene, lutCam); renderer.setRenderTarget(rt);
      A.sd[0] = sunDir.x; A.sd[1] = sunDir.y; A.sd[2] = sunDir.z; A.hz[0] = A.hz[1] = A.hz[2] = 0;
      // bruma = horizonte de lado y de espaldas al sol (el brillo hacia el sol entra aparte, direccional, como «aerMie»)
      const sAz = Math.atan2(sunDir.x, -sunDir.z); for (let k = 0; k < 5; k++) { const a = sAz + (k + 2) / 8 * 6.283; scatterJS([Math.sin(a) * .9994, .035, -Math.cos(a) * .9994], A.sd, kM, A.tmp); for (let j = 0; j < 3; j++) A.hz[j] += A.tmp[j] / 5; }
      const hl = Math.hypot(sunDir.x, sunDir.z) || 1; scatterJS([sunDir.x / hl * .9994, .035, sunDir.z / hl * .9994], A.sd, kM, A.hzS); scatterJS([0, 1, 0], A.sd, kM, A.zen); transJS(A.sd, kM, A.tr);
      const nb = [.02 * .4 + .09, .032 * .4 + .05, .07 * .4 + .022];
      const Lz = (A.zen[0] * .2126 + A.zen[1] * .7152 + A.zen[2] * .0722) * GAIN; let ai = 0; while (ai < ADAPT.length - 2 && sy > ADAPT[ai + 1][0]) ai++;
      const a0 = ADAPT[ai], a1 = ADAPT[ai + 1], fr = Math.exp(Math.log(a0[1]) + (Math.log(a1[1]) - Math.log(a0[1])) * clamp((sy - a0[0]) / (a1[0] - a0[0]), 0, 1)); A.adapt = clamp(fr * L_DIA / Math.max(Lz, 1e-9), 1, 3000); const G = GAIN * A.adapt; skyU.gain.value = G;
      for (let j = 0; j < 3; j++) { A.hz[j] = A.hz[j] * G + noche * nb[j]; A.hzS[j] = Math.max(0, A.hzS[j] * G + noche * nb[j] - A.hz[j]); }
      skyU.hazeCol.value.setRGB(A.hz[0], A.hz[1], A.hz[2]); scene.fog.color.setRGB(A.hz[0], A.hz[1], A.hz[2]);
      U.aerMie.x = A.hzS[0]; U.aerMie.y = A.hzS[1]; U.aerMie.z = A.hzS[2];
      skyU.sunTr.value.setRGB(A.tr[0], A.tr[1], A.tr[2]);
      // luz del sol del color que deja pasar la atmósfera; luz ambiente del color del cénit
      const tl = Math.max(A.tr[0], A.tr[1], A.tr[2]) || 1; cTmp.setRGB(A.tr[0] / tl, A.tr[1] / tl, A.tr[2] / tl); if (sy > -.02) sun.color.lerp(cTmp, .85);
      const zl = Math.max(A.zen[0], A.zen[1], A.zen[2]); if (zl > 1e-4 && noche < .9) { cTmp.setRGB(A.zen[0] / zl, A.zen[1] / zl, A.zen[2] / zl).lerp(hemi.color.setHex(0xf2f5f8), .7 + .25 * noche); hemi.color.copy(cTmp); }
      // nubes
      const lit = sstep(-.12, -.02, sy);
      transJS([A.sd[0], Math.max(A.sd[1], .004), A.sd[2]], kM, A.tmp); // las nubes (a 1.400 m) ven el sol antes que la calle: se tiñen de rosado y naranja al alba
      { const l = A.tmp[0] * .3 + A.tmp[1] * .6 + A.tmp[2] * .1, w = .45 * (1 - sstep(.05, .25, sy)); NUBE_U.cSun.value.setRGB(A.tmp[0] + (l - A.tmp[0]) * w + .015, A.tmp[1] + (l - A.tmp[1]) * w + .01, A.tmp[2] + (l - A.tmp[2]) * w + .02).multiplyScalar(2.4 * lit * (sy < 0 ? Math.min(A.adapt, 8) * .13 : 1)); } // salmón y rosado al alba, no rojo puro
      NUBE_U.cAmb.value.setRGB(A.zen[0] * G * 1.5 + A.hz[0] * .9, A.zen[1] * G * 1.5 + A.hz[1] * .9, A.zen[2] * G * 1.5 + A.hz[2] * .9).addScalar(noche * .012);
      NUBE_U.cBase.value.setRGB(.026, .016, .009); NUBE_U.fogColor.value.copy(scene.fog.color); NUBE_U.noche.value = noche; NUBE_U.opac.value = 1 - noche * .35;
      // entorno de reflejos (como mucho cada 1,5 s)
      if (t - envT > 1.5 || !envRT) { envT = t; const e = pmrem.fromScene(envScene, 0, 1, 500); if (envRT) envRT.dispose(); envRT = e; }
    }
    if (envRT && scene.environment !== envRT.texture) scene.environment = envRT.texture;
    { const tw = 1 - sstep(-.02, .12, sy); skyU.tinte.value.set(TINTE_CIELO[0] + (.42 - TINTE_CIELO[0]) * tw, TINTE_CIELO[1] + (.78 - TINTE_CIELO[1]) * tw, TINTE_CIELO[2] + (1.75 - TINTE_CIELO[2]) * tw); } // crepúsculo: cénit azul profundo, no violeta
    skyU.noche.value = noche; skyU.tiempo.value = t; skyU.estrellas.value = TG.estrellas ? 1 : 0; skyU.sunDisc.value = sstep(-.02, .01, sy);
    // 2) bruma del valle (perspectiva aérea): más densa al amanecer y de noche
    if (TG.bruma) { U.aerP.x = (6.2e-5 + 1.05e-4 * alba + 3.5e-5 * noche) * 1; U.aerP.y = 1 / (700 - 260 * alba); U.aerP.z = 0; U.aerP.w = .92; } else U.aerP.x = 0;
    U.aerSun.x = sunDir.x; U.aerSun.y = sunDir.y; U.aerSun.z = sunDir.z; U.aerSun.w = (.6 + 1.6 * alba) * sstep(-.1, .02, sy);
    { const k = S.dia ? 1 : sstep(.05, .5, sy), g = ctx.groundTint; g.setRGB(g.r * (1 - (1 - SUELO_DIA * SUELO_WB[0]) * k), g.g * (1 - (1 - SUELO_DIA * SUELO_WB[1]) * k), g.b * (1 - (1 - SUELO_DIA * SUELO_WB[2]) * k)); }
    // hora real: la foto satelital trae luz de mediodía; con el sol bajo o de noche la calle queda en penumbra (solo los faroles la alumbran)
    if (!S.dia) ctx.groundTint.multiplyScalar((.3 + .7 * sstep(-.1, .2, sy)) * (1 - .55 * noche));
    hemi.intensity *= (1 + (COLOR.ambiente - 1) * sstep(.1, .5, sy)) * (1 - .5 * noche);
    if (TG.tunel) cubiertas(S.sr ?? S.s, Math.min(dt, .1)); else { U.aerT[18] = 0; expoAd = 1; }
    ctx.renderer.toneMappingExposure = (COLOR.expo + (COLOR.expoNoche - COLOR.expo) * noche) * expoAd;
    // 3) nubes: viento alisio del este (despacio), orden, sombras de las 12 más cercanas
    wind -= dt * 5; NUBE_U.viento.value = wind; NUBE_U.camXZ.value.set(camera.position.x, camera.position.z);
    if (cloudMesh) { cloudMesh.visible = TG.nubes; if ((sortT -= dt) <= 0) { sortT = .4; cloudMesh.userData.sort(camera.position.x, camera.position.z, camera.position.y, wind); } }
    if (cloudMesh && TG.sombranube && sy > .05) {
      const L = 34000, cx = camera.position.x, cz = camera.position.z, H = U.aerCs.x, k = (H - p.y) / sy, px = p.x + sunDir.x * k, pz = p.z + sunDir.z * k; let m = 0;
      // las 12 nubes cuya sombra cae más cerca del corredor
      for (let i = 0; i < CL.length; i++) { const c = CL[i], wx = cx + ((((c.x + wind - cx + L / 2) % L) + L) % L) - L / 2; c.wx = wx; c.d = (wx - px) ** 2 + (c.z - pz) ** 2; }
      CLs.sort(cmpCL);
      for (; m < 12 && m < CLs.length; m++) { const c = CLs[m]; U.aerCl[m * 4] = c.wx; U.aerCl[m * 4 + 1] = c.z; U.aerCl[m * 4 + 2] = c.r; U.aerCl[m * 4 + 3] = c.dens; }
      U.aerCs.y = .42 * sstep(.05, .2, sy); U.aerCs.z = m;
    } else U.aerCs.y = 0;
    // 4) aves
    if (AV) AV(t, dt, p, sy, noche);
    if (DBG && (hook.n = (hook.n || 0) + 1) % 150 === 0) { hook.dbg = 1; console.info('atmosfera aves', JSON.stringify(window.__atm.aves), 'expoAd', expoAd.toFixed(2), 'cub', cubAct && cubAct.min, 's', S.s.toFixed(0), 'expo', renderer.toneMappingExposure.toFixed(2), 'sol', sy.toFixed(2), 'noche', noche.toFixed(2)); }
    // 5) posproceso
    if (Q.alta) {
      const run = S.running && !S.paused, spd = run ? S.v * S.scale : 0;
      v3.copy(camera.position).addScaledVector(sunDir, 5000).project(camera); camera.getWorldDirection(v3b); const facing = v3b.dot(sunDir);
      const onScr = facing > .05 && Math.abs(v3.x) < 1.6 && Math.abs(v3.y) < 1.6 && v3.z < 1;
      luzU.sunUV.value.set(v3.x * .5 + .5, v3.y * .5 + .5); luzU.aspect.value = camera.aspect; luzU.t.value = (t * 60) % 997;
      const low = 1 - sstep(.06, .5, sy);
      luzU.rays.value = TG.rayos && onScr && sy > -.03 ? (.18 + .9 * low) * sstep(.05, .3, facing) * sstep(-.03, .02, sy) : 0;
      luzU.rayCol.value.copy(sun.color).multiplyScalar(.9 + 1.3 * low);
      luzU.flare.value = TG.destello && onScr && sy > 0 ? .55 * sstep(.2, .6, facing) : 0;
      luzU.mb.value = TG.mb ? clamp((spd - 9) / 140, 0, 1) * (S.cam === 3 ? .07 : .035) : 0;
      if (luzU.mb.value > 0) { (ctx.A || ctx).P(S.s + 70, pAhead); v3.set(pAhead.x, pAhead.y + 1.5, pAhead.z).project(camera); luzU.mbC.value.set(clamp(v3.x * .5 + .5, 0, 1), clamp(v3.y * .5 + .5, 0, 1)); }
      luz.enabled = luzU.rays.value > 0 || luzU.flare.value > 0 || luzU.mb.value > 0;
      camU.t.value = t; camU.grano.value = TG.grano ? .022 + .02 * noche : 0; camU.ca.value = TG.ca ? .0016 : 0; camU.curva.value = TG.curva ? 1 : 0; camU.gam.value = COLOR.gam + (COLOR.gamNoche - COLOR.gam) * noche; camU.lente.value = TG.lente && S.cam === 3 ? COLOR.lente : 0; { const sz = renderer.getDrawingBufferSize(v3b); camU.res.value.set(sz.x, sz.y); }
      if (gtao) gtao.enabled = TG.ao && !(Q.post === false);
    }
  }
  ctx.frameHooks.push(hook);
  // el receptor de sombras del motor fija su opacidad en su propio gancho (registrado en «ready»): este se registra después y la sube
  ctx.ready.push(() => { shadowMat = ctx.shadowMat || null; if (!shadowMat) scene.traverse(o => { if (o.material && o.material.isShadowMaterial) shadowMat = o.material; });
    ctx.frameHooks.push(() => { if (shadowMat) shadowMat.opacity = COLOR.sombra * clamp((sunDir.y - .03) * 9, 0, 1); }); });

  // ═════════ 7. Depuración y medición ═════════
  window.__atm = { TG, COLOR, U, A, skyU, NUBE_U, get aves() { return AV ? { guacamayas: AV.mallas.guacamayas.count, zamuros: AV.mallas.zamuros.count } : null; }, get gtao() { return gtao; },
    lut() { const b = new Uint16Array(192 * 96 * 4); renderer.readRenderTargetPixels(lutRT, 0, 0, 192, 96, b); const f = THREE.DataUtils.fromHalfFloat, px = (u, v) => [0, 1, 2].map(k => +f(b[(v * 192 + u) * 4 + k]).toFixed(5)); return { horizonte: px(96, 48), alto: px(96, 80), cenit: px(96, 95), bajo: px(96, 30) }; },
    // ms de GPU de cada pase aislado (n repeticiones y una lectura de 1 píxel para esperar a la GPU). Úsalo en un navegador con GPU.
    medir(n = 60) {
      const gl = renderer.getContext(), px = new Uint8Array(4), rt = composer.readBuffer, wt = composer.writeBuffer;
      const t = fn => { renderer.setRenderTarget(null); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const t0 = performance.now(); for (let i = 0; i < n; i++) fn(); renderer.setRenderTarget(null); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return +((performance.now() - t0) / n).toFixed(3); };
      const res = {}, keep = { r: luzU.rays.value, f: luzU.flare.value, m: luzU.mb.value };
      res.vacio = t(() => { });
      luzU.rays.value = 1; luzU.flare.value = 0; luzU.mb.value = 0; res.rayos = t(() => luz.render(renderer, wt, rt));
      luzU.rays.value = 0; luzU.flare.value = .5; res.destello = t(() => luz.render(renderer, wt, rt));
      luzU.flare.value = 0; luzU.mb.value = .05; res.desenfoque = t(() => luz.render(renderer, wt, rt));
      luzU.rays.value = 1; luzU.flare.value = .5; res.luz_todo = t(() => luz.render(renderer, wt, rt)); Object.assign(luzU, {}); luzU.rays.value = keep.r; luzU.flare.value = keep.f; luzU.mb.value = keep.m;
      if (gtao) res.ao_gtao = t(() => gtao.render(renderer, wt, rt));
      res.camara = t(() => cam.render(renderer, wt, rt));
      res.bloom_motor = t(() => ctx.bloom.render(renderer, wt, rt, 0, false));
      if (cloudMesh) { renderer.autoClear = false; res.nubes = t(() => { renderer.setRenderTarget(rt); renderer.render(cloudMesh, camera); }); renderer.autoClear = true; }
      res.tabla_cielo = t(() => { renderer.setRenderTarget(lutRT); renderer.render(lutScene, lutCam); });
      res.cielo_cupula = t(() => { renderer.setRenderTarget(rt); renderer.render(ctx.skyDome, camera); });
      res.escena_completa = t(() => composer.render());
      for (const k in res) if (k !== 'vacio') res[k] = +(res[k] - res.vacio).toFixed(3);
      console.table(res); return res;
    } };
  if (DBG) console.info('atmosfera', JSON.stringify(TG), 'Q.alta', Q.alta);
}
