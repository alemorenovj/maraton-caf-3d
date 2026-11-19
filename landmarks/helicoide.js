// El Helicoide (Roca Tarpeya, 1956-61, inconcluso). Planta: huella OSM w226465759 suavizada (gota con el lado oeste
// recto, 190 × 260 m). Rampa helicoidal CONTINUA de 6,5 vueltas que se estrecha hacia la cima: cada vuelta es una
// losa de concreto claro con su frente de dos niveles (losa blanca, piso abierto oscuro con pilares, ventanas),
// cubierta plana arriba con la cúpula geodésica plateada y la caja de vidrio, y el barrio de casas de colores
// trepando por el norte y el este (posiciones precalculadas fuera de las huellas OSM y de la ruta).
export const meta = {
  id: 'helicoide',
  nombre: 'El Helicoide',
  quita: [[10.489176, -66.909924, 70], [10.489397, -66.910055, 20]],
};
const CASAS = [[-102.4,-214.9,1,0,0.63],[-18.0,-163.8,2,1,0.41],[44.4,-170.7,2,3,0.26],[-137.6,-117.1,2,2,0.39],[-222.9,-102.0,2,6,0.71],[-200.1,-170.9,4,0,0.13],[-75.3,-202.8,2,5,1.0],[-220.8,-144.1,4,0,1.11],[-324.6,-130.0,1,4,1.15],[-225.2,-93.5,2,4,0.6],[-238.3,49.2,2,4,0.9],[-76.4,-193.0,2,1,0.09],[-306.8,-209.2,3,2,0.95],[-219.8,-195.3,2,6,0.77],[-208.6,-93.7,3,6,1.3],[-215.2,-182.8,4,4,0.22],[-309.2,109.8,3,1,1.56],[106.8,-72.4,1,6,0.33],[184.3,97.9,2,5,0.47],[-210.9,56.6,4,4,0.53],[72.7,-84.9,2,6,1.46],[-208.9,-278.6,2,0,0.96],[-292.6,12.1,1,7,0.88],[-295.2,123.1,2,6,0.32],[-100.0,-247.6,3,5,0.8],[-239.6,87.2,2,2,0.51],[-238.8,-7.8,1,1,0.76],[89.4,-76.6,1,3,0.65],[-231.8,82.9,1,0,0.96],[132.1,-22.5,2,6,0.22],[-290.5,-219.5,4,2,0.45],[136.3,3.5,1,1,0.63],[52.6,-142.8,2,0,0.95],[-286.8,-129.2,4,1,0.25],[-269.9,-6.3,3,3,0.97],[-201.8,-142.8,3,7,1.41],[-229.7,-53.1,3,5,0.63],[-300.2,108.1,1,4,0.21],[-311.9,-112.9,3,4,0.03],[-216.7,118.7,1,1,0.42],[-236.6,-217.3,2,2,1.38],[91.7,-44.8,3,0,1.14],[-247.5,74.6,2,1,0.59],[-242.0,93.7,3,6,0.84],[65.7,-152.3,4,2,0.13],[-270.4,-24.1,1,3,0.36],[-334.8,102.6,3,2,1.39],[-236.5,-57.3,2,1,0.75],[-277.9,129.7,1,5,0.83],[-291.1,19.7,2,3,0.06],[65.6,-138.7,3,2,1.09],[-269.9,131.0,4,0,0.11],[-204.3,-164.8,1,0,0.02],[-98.4,-207.4,2,1,1.18],[82.7,-96.3,2,3,0.03],[32.1,-172.5,3,1,0.05],[-284.7,-191.1,2,3,1.4],[-40.5,-232.1,2,0,0.72],[-294.6,75.7,2,0,1.19],[122.0,74.4,2,2,1.19],[-243.7,114.7,1,4,1.11],[-277.5,-196.2,2,6,0.75],[163.1,38.6,1,2,0.24],[-208.5,-179.9,3,3,1.47],[66.5,-118.8,3,1,1.48],[-225.6,-133.7,3,3,0.03],[-269.3,-155.3,3,5,1.47],[-104.3,-221.4,2,7,0.55],[-336.5,13.2,2,0,1.17],[-213.1,-141.2,3,0,1.4],[-23.8,-203.9,3,3,0.94],[-326.3,-96.5,4,2,0.98],[-259.6,-25.8,2,6,1.16],[162.1,-3.1,3,5,0.41],[-57.3,-229.8,3,3,1.55],[-254.0,18.7,3,0,0.85],[-234.4,-17.5,2,7,1.39],[116.2,-57.6,4,0,1.39],[-338.4,-57.7,4,5,0.11],[-80.0,-246.4,2,0,0.45],[-337.8,-157.6,3,6,0.1],[-238.9,-196.0,3,0,1.08],[-301.3,-96.8,2,1,1.52],[124.6,-31.0,4,2,0.82],[-18.2,-176.0,3,7,0.27],[2.1,-198.6,3,7,1.48],[-242.8,-212.6,2,5,1.11],[-200.2,96.9,3,3,0.28],[-282.5,137.8,1,0,0.07],[46.8,-117.7,3,7,1.49],[-229.2,-109.3,2,2,0.68],[102.4,-45.8,2,5,0.8],[-132.2,-239.4,2,3,0.77],[-288.1,-117.2,2,0,0.14],[-279.7,-226.7,2,5,1.19],[-278.3,106.7,2,1,1.12],[-318.7,88.7,3,3,0.96],[189.4,34.7,2,2,0.52],[-248.3,-52.7,3,7,1.21],[-329.4,121.3,4,4,0.21],[-338.8,-182.3,2,2,0.5],[-201.6,53.6,3,1,0.06],[-273.3,29.3,2,3,0.74],[-225.7,121.2,3,7,0.51],[-261.0,36.7,2,1,0.97],[-306.0,47.5,1,3,1.12],[-309.6,28.0,2,1,1.48],[99.7,-64.6,2,1,0.27],[-319.2,-15.2,3,7,1.34],[-245.5,47.0,2,6,1.04],[-262.5,-202.8,4,3,0.88],[-296.9,32.1,4,4,0.05],[-278.8,-127.7,4,2,1.16],[-239.2,27.7,2,3,1.14],[-245.0,-66.5,2,6,0.76],[-320.2,-187.7,2,6,0.84],[-225.3,20.3,2,4,0.61],[-139.7,-193.0,3,0,1.16],[-95.8,-174.6,2,7,0.83],[-219.4,41.9,2,6,0.42],[-239.9,69.2,1,1,0.21],[133.8,-46.6,4,1,1.0],[-135.3,-172.5,2,5,0.09],[-139.2,-143.0,3,7,0.59],[-207.9,-23.9,3,1,1.55],[-43.1,-213.6,2,0,0.23],[-101.3,-126.0,2,1,0.93],[-303.3,-124.4,3,5,1.17],[-288.3,-66.5,1,7,1.05],[-228.6,33.7,2,6,1.36],[134.3,71.3,2,7,0.99],[150.8,-7.2,3,2,1.46],[-204.3,138.2,2,3,0.99],[-247.1,-1.6,2,6,1.45],[154.3,80.3,1,5,0.8],[-217.5,-208.2,1,5,0.14],[-258.0,-222.2,4,1,0.28],[-311.3,86.2,2,4,0.74],[-250.5,96.8,3,5,1.54],[-337.2,136.7,3,4,1.24],[-303.9,-53.7,4,7,1.24],[-299.8,-105.6,3,7,0.87],[-102.7,-160.0,4,5,0.77],[-321.1,-217.8,2,3,0.84],[-212.1,-103.4,3,3,0.91],[-300.1,-227.3,3,4,0.33],[-291.7,84.4,3,1,0.67],[-108.0,-88.7,4,7,1.1],[-146.7,-220.1,2,7,0.34],[18.3,-180.2,3,0,0.98],[-84.3,-211.1,2,1,0.74],[-214.3,21.4,3,6,0.43],[-267.9,88.2,2,1,0.41],[-299.9,-172.2,3,0,1.3],[93.4,-115.7,3,4,1.48],[152.7,-15.0,4,0,1.22],[-263.1,68.6,3,5,0.51],[-208.2,-128.1,3,3,1.26],[-220.0,-46.7,3,4,0.15],[-53.1,-237.3,3,0,0.16],[-262.2,78.3,2,1,1.08],[-262.4,-1.0,2,7,0.04],[130.6,84.2,2,3,1.23],[-255.0,-93.7,3,6,1.38],[-22.1,-237.5,2,7,1.05],[68.0,-93.0,3,2,0.34],[83.8,-127.9,2,3,1.19],[-112.7,-152.5,2,0,1.36],[-24.6,-224.4,4,1,0.92],[-197.1,-34.6,2,2,0.76],[-1.7,-187.8,1,0,0.38],[-203.7,88.1,3,2,1.19],[-326.6,63.9,3,2,1.33],[-128.8,-203.6,3,2,0.77],[-99.2,-230.8,4,0,0.83],[-226.8,-198.9,3,0,0.75],[-80.3,-178.1,2,1,0.58],[-300.5,-85.4,4,2,0.16],[-327.8,2.6,3,3,0.9],[-233.0,-160.9,2,2,1.34],[-310.7,-37.0,3,4,1.11],[-85.0,-203.8,3,5,0.74],[-109.9,-230.6,2,6,0.96],[150.5,-50.3,2,2,0.84],[-248.5,-78.8,2,0,1.22],[-256.7,-83.1,3,2,1.47],[-317.0,-68.0,3,3,1.04],[-262.4,97.3,3,3,0.95],[-139.3,-105.4,2,1,0.87],[-335.4,-63.5,2,2,0.48],[-259.0,59.8,4,1,0.95],[-331.3,42.1,4,0,0.42],[120.4,-44.8,2,5,0.16],[-200.0,67.1,4,7,0.02],[32.8,-183.3,3,7,0.16],[-104.6,-186.7,3,6,0.71],[-226.6,66.3,3,3,0.44],[-338.3,-135.5,3,1,0.32],[-208.2,25.8,4,3,0.48],[-312.5,-217.9,3,2,0.58],[12.9,-166.9,1,2,0.36],[126.5,-65.4,1,7,0.2],[-1.9,-144.7,3,0,0.26],[-285.6,61.0,2,3,0.48],[-286.7,-140.8,3,0,0.16],[-314.2,-2.9,4,1,0.1],[-222.2,-25.2,2,0,0.65],[-287.6,-13.9,4,7,0.58],[-330.8,-10.0,3,0,0.13],[-206.7,63.2,2,0,0.84],[-323.8,-67.7,1,3,0.48],[-316.4,-171.3,3,4,1.56],[-240.6,-86.1,4,2,0.94],[34.6,-153.9,1,2,1.25],[74.3,-63.4,3,6,1.1],[-323.3,-166.2,4,6,0.92],[-117.2,-91.5,2,1,0.8],[-8.2,-180.8,2,3,1.11],[-276.5,-151.2,3,3,0.69],[-274.6,20.0,2,7,0.87],[55.3,-112.4,2,6,0.25],[-40.8,-240.2,1,5,1.48],[-240.8,132.9,3,5,0.04],[-241.7,-171.9,4,1,1.16],[-253.6,54.7,2,6,1.08],[-257.0,-165.0,2,4,0.82],[-294.6,135.9,2,2,0.92],[-200.0,-107.4,1,0,0.15],[-307.4,-147.7,2,5,1.45],[-53.0,-186.1,3,3,0.68],[-222.6,-189.0,3,2,1.04],[-326.1,-122.7,1,1,1.34],[-264.1,53.2,4,5,1.55],[-303.5,-242.0,1,5,1.56],[-253.8,-183.3,2,6,0.9],[-270.2,-234.7,3,0,1.38],[-286.9,-82.0,3,7,1.12],[-259.3,113.2,2,4,0.76],[42.8,-137.3,2,6,0.11],[180.2,26.9,3,1,0.23],[-197.2,77.7,4,7,0.41],[-101.3,-137.3,2,4,0.98],[-300.0,52.4,2,4,0.5],[80.1,-121.8,4,2,1.47],[-324.2,-140.6,3,4,1.22],[-232.3,-100.6,1,6,0.42],[176.3,1.5,2,6,0.0],[-220.1,57.0,2,6,0.3],[-19.6,-229.4,2,5,0.71],[-335.3,-117.6,3,4,0.66],[-282.1,-167.1,3,3,0.24],[-311.8,-53.7,2,6,1.23],[-329.4,71.9,2,6,0.62],[-281.0,-8.5,2,2,0.74],[-43.9,-197.5,3,0,0.84],[-273.1,40.0,2,6,0.87],[162.0,72.1,1,7,0.45],[-295.0,5.2,2,5,1.02],[21.2,-165.1,3,4,1.39],[4.2,-178.5,3,3,0.63],[-232.6,22.5,4,4,0.53],[-232.9,112.6,3,2,0.13],[-8.3,-206.3,2,0,0.28],[-299.9,89.5,2,6,0.25],[-250.0,-62.0,4,2,0.4],[-134.9,-208.2,2,4,1.13],[-223.1,78.1,3,0,0.67],[-251.8,-72.0,1,7,1.0],[-275.7,-39.5,2,1,1.43],[-294.1,-58.1,2,7,1.16],[-227.4,-178.5,3,4,0.5],[-114.7,-114.1,1,1,1.51],[-324.0,-157.7,2,5,0.27],[-308.6,-95.7,3,2,0.19],[150.5,-28.6,2,2,0.04],[-292.4,50.5,2,1,0.38],[-114.1,-193.2,2,2,1.1],[-288.0,-89.5,1,7,0.9],[145.2,-11.7,3,6,1.2],[144.9,-60.0,2,6,1.51],[137.0,61.5,3,3,0.01],[-272.5,-63.5,2,7,1.18],[-239.7,-125.0,3,6,0.49],[-291.1,-107.4,3,4,1.42],[143.7,27.0,2,3,0.21],[-257.4,-99.9,1,0,1.08],[-197.8,122.3,4,4,0.02],[-296.1,-179.0,2,1,1.13],[-85.9,-223.8,4,0,1.36],[-269.9,112.4,1,4,0.14],[138.2,-13.0,2,4,1.33],[-248.5,109.0,2,4,1.5],[-318.5,131.8,2,1,0.01],[-322.6,-202.7,1,1,1.03],[-327.9,9.7,3,5,0.82],[-56.5,-250.5,3,1,1.28],[-271.6,138.4,4,0,1.32],[-307.2,38.1,2,3,1.3],[21.1,-199.3,2,3,1.25],[-285.5,-237.0,2,7,1.46],[-207.3,96.6,2,2,0.54],[-296.3,115.7,1,6,0.56],[173.3,7.3,4,6,0.52],[-131.9,-103.8,4,5,0.91],[-263.1,-149.8,2,6,0.56],[-266.8,124.1,3,3,0.66],[-261.4,17.2,3,1,0.91],[112.0,-32.7,2,4,0.76],[-315.4,-209.6,2,0,1.03],[-218.7,105.4,4,3,0.09],[192.6,90.5,2,1,1.0],[-336.0,23.8,3,4,0.1],[10.1,-174.7,2,4,1.49],[-256.7,94.0,2,2,0.49],[-11.3,-218.0,3,6,1.08],[-317.2,82.3,2,5,0.04],[-92.0,-193.7,4,5,1.48],[-296.3,-1.9,4,7,1.05],[-293.5,-74.3,2,2,1.27],[-327.1,-88.3,2,2,1.36],[-212.3,-62.0,3,3,1.3],[-317.8,-196.7,2,2,0.36],[15.8,-153.4,2,1,0.35],[-281.9,-105.9,1,7,1.06],[-129.6,-189.4,2,6,0.97],[-257.3,-172.5,2,6,1.04],[55.5,-90.4,1,2,0.83],[37.1,-133.1,3,0,1.16],[-226.7,41.2,2,1,0.27],[-220.1,-152.0,4,5,0.56],[-280.2,85.6,4,4,0.37],[-145.9,-202.9,3,6,0.25],[-339.5,4.5,2,5,0.53],[-317.5,-126.7,4,4,1.12],[-121.5,-98.7,2,4,0.8],[-94.2,-164.9,4,5,0.16],[-86.2,-167.3,2,0,1.17],[-61.9,-209.4,3,7,1.0],[-331.1,-204.9,2,5,0.95],[-226.6,-66.3,1,3,1.0],[-272.8,119.6,2,1,0.81],[-249.2,126.1,3,0,0.24],[-197.8,-127.9,2,6,0.78],[-65.3,-220.0,1,4,1.41],[-300.7,-23.8,3,6,0.56],[128.3,41.3,3,1,0.57],[-321.5,-104.6,2,4,0.25],[-212.2,-189.2,4,5,1.15],[-245.2,-25.1,4,1,1.04],[-262.2,-190.5,2,1,0.77],[16.1,-209.4,2,7,1.49],[155.2,71.8,2,4,0.55],[-197.1,58.9,4,1,0.39],[-37.8,-190.6,3,5,1.38],[-15.0,-201.1,3,0,0.61],[17.3,-133.4,4,6,0.62],[-112.6,-100.1,2,2,1.0],[-290.5,-33.5,1,7,0.62],[-85.3,-154.8,2,1,0.22],[158.9,91.7,4,6,0.5]]; // [dx, dz, pisos, color, giro] relativos al centroide OSM
const HUELLA = [[-47.5, 108.8], [-62.1, 99.1], [-77.9, 79.6], [-86.2, 53.3], [-87.4, 31.4], [-82.4, -94.5], [-79.5, -106.7], [-73.8, -117.1], [-63.7, -127.7], [-42.9, -136.6], [-27.8, -140.5], [-6.0, -124.2], [10.0, -113.7], [81.6, -30.4], [90.2, -8.9], [102.3, 16.4], [101.4, 41.9], [95.0, 60.4], [85.1, 77.1], [72.0, 91.4], [52.1, 105.4], [36.4, 113.3], [17.1, 118.4], [-1.8, 119.9], [-16.7, 118.5], [-33.0, 114.5]];

export function build(THREE, api) {
  const g = new THREE.Group(), c = api.xz(10.489176, -66.909924), base = api.ground(c.x, c.z + 120) - 1.5;
  const S = new THREE.Vector2(10, -30);            // centro de la espiral (bajo la cúpula)
  const NT = 6.5, DH = 8.6, Y0 = 9, M = 180;      // vueltas, altura por vuelta, primera losa, muestras por vuelta
  const sc = t => 1 - .088 * t;                   // la planta se encoge en cada vuelta
  const Yt = t => Y0 + t * DH;
  // contorno suave, muestreado a paso constante (sentido antihorario visto desde arriba)
  const curve = new THREE.CatmullRomCurve3(HUELLA.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal', .5);
  const P = curve.getSpacedPoints(M).slice(0, M).map(v => new THREE.Vector2(v.x, v.z));
  let area = 0; for (let i = 0; i < M; i++) { const a = P[i], b = P[(i + 1) % M]; area += a.x * b.y - b.x * a.y; } if (area < 0) P.reverse();
  const at = (j, s) => new THREE.Vector2(S.x + (P[j].x - S.x) * s, S.y + (P[j].y - S.y) * s);

  // frente de cada vuelta: losa blanca + piso abierto oscuro con pilares + franja de ventanas (una banda = DH)
  const bandaTex = (emis) => api.canvasTex(256, 128, (k, w, h) => {
    if (emis) { k.fillStyle = '#000'; k.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) if ((i * 7) % 5 < 2) { k.fillStyle = '#ffdca0'; k.fillRect(i * 16 + 2, h * .62, 12, h * .14); } k.fillStyle = 'rgba(255,230,180,.55)'; k.fillRect(0, h * .2, w, h * .03); return; }
    k.fillStyle = '#d9d6cf'; k.fillRect(0, 0, w, h);                     // concreto claro
    k.fillStyle = '#efede8'; k.fillRect(0, 0, w, h * .14);               // borde de losa / baranda
    k.fillStyle = '#2d2f31'; k.fillRect(0, h * .18, w, h * .34);         // piso abierto en sombra
    k.fillStyle = '#c9c5bd'; for (let i = 0; i < 4; i++) k.fillRect(i * 64 + 28, h * .18, 7, h * .34); // pilares
    k.fillStyle = '#bdb9b0'; k.fillRect(0, h * .52, w, h * .08);
    k.fillStyle = '#5c6670'; for (let i = 0; i < 16; i++) k.fillRect(i * 16 + 2, h * .62, 12, h * .14); // ventanas
    k.fillStyle = 'rgba(0,0,0,.12)'; k.fillRect(0, h * .9, w, h * .1);
  });
  const bMap = bandaTex(false), bEm = bandaTex(true); bMap.wrapS = bEm.wrapS = THREE.RepeatWrapping;
  const frente = new THREE.MeshStandardMaterial({ map: bMap, emissiveMap: bEm, emissive: 0xffffff, emissiveIntensity: 0, roughness: .9 });
  api.onFrame(st => { frente.emissiveIntensity = 1.2 * st.noche; });
  const losa = api.concrete(0x8f8c86), losaClara = api.concrete(0xb9b6ae);

  // rampa helicoidal continua: losa (tira radial) + frente vertical en su borde exterior
  const NS = Math.floor(NT * M) + 1, dp = [], di = [], wp = [], wu = [], wi = []; let run = 0;
  for (let i = 0; i < NS; i++) {
    const t = i / M, j = i % M, o = at(j, sc(t)), n = at(j, sc(t + 1)), y = Yt(t);
    dp.push(o.x, y, o.y, n.x, y, n.y);
    const yb = i < M ? -6 : y - DH + .2; // la primera vuelta baja hasta el suelo
    if (i > 0) { const pj = (i - 1) % M, po = at(pj, sc((i - 1) / M)); run += Math.hypot(o.x - po.x, o.y - po.y); }
    wp.push(o.x, y + 1.1, o.y, o.x, yb, o.y); wu.push(run / 48, 1, run / 48, (y + 1.1 - yb) > DH + 2 ? -((y + 1.1 - yb) / DH - 1) : 0);
    if (i > 0) { const a = (i - 1) * 2, b = i * 2; di.push(a, a + 1, b, b, a + 1, b + 1); wi.push(a, b, a + 1, b, b + 1, a + 1); }
  }
  const deck = new THREE.BufferGeometry(); deck.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3)); deck.setIndex(di); deck.computeVertexNormals();
  // asegura normales hacia arriba
  { const nr = deck.attributes.normal; let up = 0; for (let i = 0; i < nr.count; i++) up += nr.getY(i); if (up < 0) { const idx = deck.index.array; for (let i = 0; i < idx.length; i += 3) { const tmp = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = tmp; } deck.computeVertexNormals(); } }
  g.add(new THREE.Mesh(deck, losa));
  const wall = new THREE.BufferGeometry(); wall.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3)); wall.setAttribute('uv', new THREE.Float32BufferAttribute(wu, 2)); wall.setIndex(wi); wall.computeVertexNormals();
  { const nr = wall.attributes.normal, pos = wall.attributes.position; let out = 0; for (let i = 0; i < nr.count; i += 2) out += nr.getX(i) * (pos.getX(i) - S.x) + nr.getZ(i) * (pos.getZ(i) - S.y); if (out < 0) { const idx = wall.index.array; for (let i = 0; i < idx.length; i += 3) { const tmp = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = tmp; } wall.computeVertexNormals(); } }
  frente.map.wrapT = frente.emissiveMap.wrapT = THREE.RepeatWrapping;
  g.add(new THREE.Mesh(wall, frente));
  // canto inicial de la rampa (cierra el arranque)
  // azotea: muro del último giro y losa de cubierta
  const tTop = NT, yTop = Yt(tTop) + 1.2, sTop = sc(tTop);
  const capS = new THREE.Shape(P.map(p => new THREE.Vector2(S.x + (p.x - S.x) * sTop, -(S.y + (p.y - S.y) * sTop))));
  const cap = new THREE.ExtrudeGeometry(capS, { depth: DH + 1.2, bevelEnabled: false }); cap.rotateX(-Math.PI / 2); cap.translate(0, yTop - DH - 1.2, 0);
  g.add(new THREE.Mesh(cap, [losaClara, frente]));
  // azotea verde (jardín) alrededor de la cúpula
  const verde = new THREE.Mesh(new THREE.CircleGeometry(1, 40), api.concrete(0x6f8a4a)); verde.rotation.x = -Math.PI / 2; verde.scale.set(46, 38, 1); verde.position.set(S.x, yTop + .05, S.y); g.add(verde);

  // cúpula geodésica plateada (facetada) sobre un tambor, y la caja de vidrio a su lado
  const R = 27, plata = new THREE.MeshStandardMaterial({ color: 0xd4d7da, metalness: .85, roughness: .32, flatShading: true });
  const domo = new THREE.Mesh(new THREE.IcosahedronGeometry(R, 3), plata); domo.scale.y = .82; domo.position.set(S.x + 2, yTop + 6 - R * .82 * .35, S.y + 4); g.add(domo);
  const tambor = new THREE.Mesh(new THREE.CylinderGeometry(R * .97, R * .97, 6, 40), losaClara); tambor.position.set(S.x + 2, yTop + 3, S.y + 4); g.add(tambor);
  const red = new THREE.Mesh(new THREE.IcosahedronGeometry(R + .15, 3), new THREE.MeshBasicMaterial({ color: 0x8d9296, wireframe: true })); red.scale.y = .82; red.position.copy(domo.position); g.add(red);
  const vidrio = api.facade({ pared: '#2a3138', vidrio: '#1b2229', pisos: 3, vanos: 4, marco: .08, encendidas: .5, seed: 2, metalness: .8, roughness: .15 });
  const caja = new THREE.Mesh(new THREE.BoxGeometry(18, 13, 14), vidrio); caja.position.set(S.x + 30, yTop + 6.5, S.y - 4); g.add(caja);
  const luzRoja = api.glow(0xff3020, { dia: .3, noche: 2.5 }); const ap = new THREE.Mesh(new THREE.SphereGeometry(.8, 6, 4), luzRoja); ap.position.set(S.x + 2, yTop + 6 + R * .82 * .65 + 1, S.y + 4); g.add(ap);

  // barrio: casas de bloque y ladrillo de colores, 1–4 pisos (InstancedMesh)
  const COL = [0xa95a36, 0xb8693f, 0xd8cdb8, 0xd29a46, 0x8e4f33, 0xc4b9a2, 0x6f93a8, 0xb5524c], TCOL = [0x8c8a84, 0x9b4a32, 0x7f8285, 0xa65a3a];
  const casas = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: .95, color: 0xffffff }), CASAS.length);
  const techos = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .25, 1), new THREE.MeshStandardMaterial({ roughness: .9, color: 0xffffff }), CASAS.length);
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), Sv = new THREE.Vector3(), col = new THREE.Color();
  CASAS.forEach(([dx, dz, pisos, ci, giro], i) => { const gx = c.x + dx, gz = c.z + dz, gy = api.ground(gx, gz) - 1, h = pisos * 2.9 + 1, w = 5.5 + (i % 3) * 1.2, d = 6 + (i % 4);
    Q.setFromAxisAngle(V.set(0, 1, 0), giro); M4.compose(V.set(dx, gy - base + h / 2, dz), Q, Sv.set(w, h, d)); casas.setMatrixAt(i, M4); casas.setColorAt(i, col.setHex(COL[ci]));
    M4.compose(V.set(dx, gy - base + h + .1, dz), Q, Sv.set(w + .3, 1, d + .3)); techos.setMatrixAt(i, M4); techos.setColorAt(i, col.setHex(TCOL[(i * 7) % 4])); });
  g.add(casas, techos);

  g.position.set(c.x, base, c.z);
  return api.sombras(g);
}
