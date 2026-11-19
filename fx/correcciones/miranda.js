// Correcciones de la zona miranda (km 32,6–37,3). Contrato en fx/correcciones/LEEME.md
// Referencia: video en carro, fotogramas f_0304–f_0341 (s 757–850).
// Desfase del índice de fotogramas (km índice − km juego): ≈ 0 de 32,6 a 35,4 y crece hacia atrás hasta ≈ −0,25 en Altamira.
// Anclas: bajo el Distribuidor Macaracuay = km 32,62 ↔ f_0304 (32,61); entrada a la Av. Fco. de Miranda = 33,02 ↔ f_0307/0308;
// Damasco (DA+CO, izq.) = 33,31 ↔ f_0309 (33,34); McDonald's AutoMac + C.C. Líder (der.) = 33,84 ↔ f_0313 (33,88);
// elevado de Los Ruices (OSM 34,82–35,09) ↔ f_0322–0323 (34,93–35,05); Metro Los Dos Caminos / Av. La Carlota = 35,40 ↔ f_0326 (35,40);
// Av. Rómulo Gallegos frente a Parque Cristal = 36,57 ↔ f_0336 (36,57); Av. Luis Roche (Altamira) = 37,23 ↔ f_0340 (36,96).
// Lo singular (baranda negra sobre el muro central, Líder y su AutoMac, torre en construcción, murales de Boleíta y Tocomé,
// parapetos de concreto del elevado de Los Dos Caminos, Metro Los Dos Caminos, pasarela de Parque del Este, letras de Sucre,
// marquesina azul de la estación Miranda) va a mano en landmarks/zona_miranda.js.
// ── Parque del Este (Parque Generalísimo Francisco de Miranda), km 35,72–36,65 a la IZQUIERDA (23-nov). Datos de OpenStreetMap
//    (relación 13279347 «Parque del Este», way 988453461): contorno del parque, caminerías de concreto y lagunas. El arbolado del interior
//    se siembra aquí con `arboles` (mismo motor), de 9 a 140 m del lindero que da a la avenida; la reja, los accesos, las caminerías, las
//    lagunas y el Planetario van en landmarks/zona_miranda.js (copia de estos mismos datos).
const PQ_POLY = [[10.488714,-66.840866],[10.488957,-66.842585],[10.489302,-66.842652],[10.489241,-66.842840],[10.490571,-66.843143],[10.490592,-66.843328],[10.492024,-66.843181],[10.492127,-66.843052],[10.492377,-66.842969],[10.493284,-66.842861],[10.493532,-66.842921],[10.494432,-66.843317],[10.494788,-66.843081],[10.494970,-66.843012],[10.495160,-66.842998],[10.496280,-66.843167],[10.496785,-66.843287],[10.496932,-66.842762],[10.496969,-66.842537],[10.496801,-66.842478],[10.496784,-66.840633],[10.496515,-66.840641],[10.496505,-66.839342],[10.496679,-66.839292],[10.495028,-66.835260],[10.494938,-66.835194],[10.494569,-66.835104],[10.493799,-66.835113],[10.493332,-66.835177],[10.492410,-66.835430],[10.491513,-66.835850],[10.490505,-66.836112],[10.489895,-66.836417],[10.489535,-66.836711],[10.488819,-66.837194],[10.488407,-66.837532],[10.488181,-66.837812],[10.488088,-66.838028],[10.488028,-66.838565],[10.488308,-66.839726],[10.488432,-66.840801],[10.488677,-66.840820]];
const PQ_FRENTE = [[10.4967855,-66.8432866],[10.4969015,-66.8428923],[10.4969653,-66.8425606],[10.4968013,-66.8424779],[10.4967934,-66.8419026],[10.4967861,-66.8410508],[10.4967842,-66.8406326],[10.4965152,-66.8406406],[10.4965046,-66.8393424],[10.4966787,-66.8392915],[10.4962435,-66.8382615],[10.4959824,-66.8376258],[10.4956818,-66.8368372],[10.4953152,-66.8359655],[10.4950277,-66.8352601]];
const PQ_CAM = [[[10.494240,-66.836862],[10.494422,-66.836817],[10.494854,-66.836817],[10.494928,-66.836768],[10.495057,-66.836642],[10.495052,-66.836506],[10.495065,-66.836395],[10.495100,-66.836277],[10.495152,-66.836197],[10.495218,-66.836135],[10.495287,-66.836141]],[[10.495603,-66.836959],[10.495688,-66.837053],[10.495746,-66.837181],[10.495759,-66.837334],[10.495735,-66.837648],[10.495574,-66.838228],[10.495540,-66.838348],[10.495443,-66.838470],[10.495450,-66.838555],[10.495538,-66.838919]],[[10.495443,-66.838470],[10.495332,-66.838330],[10.495192,-66.838239],[10.494983,-66.838172],[10.494910,-66.838175]],[[10.495073,-66.838957],[10.495102,-66.838903],[10.495155,-66.838863],[10.495197,-66.838842],[10.495279,-66.838839],[10.495456,-66.838874],[10.495556,-66.838930],[10.495619,-66.838989],[10.495798,-66.839064],[10.495878,-66.839052],[10.496350,-66.838871],[10.496294,-66.839123],[10.496289,-66.839886],[10.496171,-66.839889],[10.496184,-66.840402],[10.496128,-66.840668],[10.496099,-66.841323],[10.496137,-66.841463],[10.496174,-66.841485],[10.496322,-66.841490],[10.496388,-66.841525],[10.496428,-66.841566],[10.496450,-66.841635],[10.496438,-66.841728],[10.496308,-66.841867]],[[10.495588,-66.841303],[10.495652,-66.841292]],[[10.496308,-66.841867],[10.495754,-66.841867],[10.495703,-66.841586],[10.495679,-66.841541],[10.495571,-66.841504]],[[10.495652,-66.841292],[10.495656,-66.841229],[10.495672,-66.841202],[10.495714,-66.841179],[10.495787,-66.841163],[10.496110,-66.841158]],[[10.495679,-66.841541],[10.495652,-66.841292]],[[10.496443,-66.841693],[10.496682,-66.841760]],[[10.495450,-66.838555],[10.495411,-66.838671],[10.495342,-66.838755],[10.495197,-66.838842]],[[10.496138,-66.842248],[10.496174,-66.842176],[10.496280,-66.842110],[10.496294,-66.842088],[10.496308,-66.841867]],[[10.496350,-66.838871],[10.496365,-66.838708]],[[10.496569,-66.841172],[10.496569,-66.841172]],[[10.496110,-66.841158],[10.496236,-66.841094],[10.496381,-66.841065],[10.496504,-66.841093],[10.496786,-66.841051]],[[10.495986,-66.839684],[10.496135,-66.839685]],[[10.495986,-66.839684],[10.495934,-66.839686],[10.495933,-66.839437],[10.495828,-66.839436]],[[10.496135,-66.839685],[10.496285,-66.839683]],[[10.496285,-66.839683],[10.496420,-66.839687],[10.496449,-66.841080]]];
const PQ_LAGUNA = [[10.494827,-66.838934],[10.494843,-66.838859],[10.494829,-66.838832],[10.494782,-66.838800],[10.494711,-66.838691],[10.494724,-66.838639],[10.494771,-66.838599],[10.494798,-66.838594],[10.494890,-66.838620],[10.494932,-66.838604],[10.494969,-66.838561],[10.495001,-66.838451],[10.494977,-66.838374],[10.494945,-66.838347],[10.494929,-66.838304],[10.494956,-66.838229],[10.495001,-66.838210],[10.495059,-66.838221],[10.495083,-66.838245],[10.495098,-66.838387],[10.495154,-66.838425],[10.495185,-66.838435],[10.495230,-66.838419],[10.495309,-66.838360],[10.495357,-66.838368],[10.495380,-66.838387],[10.495373,-66.838449],[10.495288,-66.838500],[10.495301,-66.838577],[10.495286,-66.838615],[10.495257,-66.838637],[10.495207,-66.838626],[10.495146,-66.838588],[10.495064,-66.838580],[10.495035,-66.838591],[10.494953,-66.838693],[10.494949,-66.838769],[10.495007,-66.838909],[10.495001,-66.838936],[10.494908,-66.839023],[10.494890,-66.839100],[10.494896,-66.839136],[10.494948,-66.839205],[10.494961,-66.839245],[10.494951,-66.839284],[10.494862,-66.839323],[10.494858,-66.839288],[10.494840,-66.839271],[10.494782,-66.839267],[10.494740,-66.839304],[10.494746,-66.839361],[10.494702,-66.839404],[10.494641,-66.839410],[10.494595,-66.839367],[10.494666,-66.839253],[10.494644,-66.839107],[10.494675,-66.839060],[10.494754,-66.839053],[10.494792,-66.839031]];
const PQ_ACUAT = [[10.493872,-66.839927],[10.493968,-66.839886],[10.494008,-66.839883],[10.494073,-66.839928],[10.494099,-66.839903],[10.494115,-66.839850],[10.494117,-66.839818],[10.494063,-66.839727],[10.494034,-66.839601],[10.493990,-66.839577],[10.493975,-66.839534],[10.494009,-66.839394],[10.494007,-66.839354],[10.494046,-66.839303],[10.494023,-66.839190],[10.493992,-66.839193],[10.493954,-66.839222],[10.493901,-66.839298],[10.493728,-66.839433],[10.493631,-66.839490],[10.493650,-66.839517],[10.493831,-66.839581],[10.493865,-66.839619],[10.493874,-66.839688],[10.493860,-66.839734],[10.493787,-66.839762],[10.493751,-66.839792],[10.493740,-66.839837],[10.493748,-66.839879],[10.493783,-66.839912]];
const PQ_ARBOLES = (() => {
  const K = 111320, KX = K * Math.cos(10.495 * Math.PI / 180), m = ([a, b]) => [b * KX, a * K];
  const dentro = (q, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const A = P[i], B = P[j]; if ((A[1] > q[1]) !== (B[1] > q[1]) && q[0] < (B[0] - A[0]) * (q[1] - A[1]) / (B[1] - A[1]) + A[0]) c = !c; } return c; };
  const dSeg = (q, A, B) => { const ex = B[0] - A[0], ey = B[1] - A[1], t = Math.max(0, Math.min(1, ((q[0] - A[0]) * ex + (q[1] - A[1]) * ey) / (ex * ex + ey * ey || 1))); return Math.hypot(q[0] - A[0] - ex * t, q[1] - A[1] - ey * t); };
  const dLin = (q, L) => { let d = 1e9; for (let i = 1; i < L.length; i++) d = Math.min(d, dSeg(q, L[i - 1], L[i])); return d; };
  const poly = PQ_POLY.map(m), frente = PQ_FRENTE.map(m), cams = PQ_CAM.map(c => c.map(m)), aguas = [PQ_LAGUNA.map(m), PQ_ACUAT.map(m)];
  const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]), out = []; let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const esp = ['saman', 'saman', 'saman', 'caobo', 'caobo', 'mijao', 'mango', 'mango', 'apamate', 'ceiba', 'araguaney', 'palma'];
  for (const [d0, d1, paso] of [[9, 60, 12.5], [60, 140, 18]])
    for (let x = Math.min(...xs); x < Math.max(...xs); x += paso) for (let y = Math.min(...ys); y < Math.max(...ys); y += paso) {
      const q = [x + (r() - .5) * paso * .8, y + (r() - .5) * paso * .8], df = dLin(q, frente);
      if (df < d0 || df >= d1 || !dentro(q, poly) || aguas.some(a => dentro(q, a) || dLin(q, a.concat([a[0]])) < 4) || cams.some(c => dLin(q, c) < 3.5)) continue;
      const e = esp[Math.floor(r() * esp.length)], al = e === 'palma' ? 15 + r() * 6 : e === 'mango' ? 11 + r() * 4 : e === 'mijao' || e === 'ceiba' ? 20 + r() * 8 : 14 + r() * 8;
      out.push({ ll: [+(q[1] / K).toFixed(6), +(q[0] / KX).toFixed(6)], especie: e, alto: +al.toFixed(1) });
    }
  return out;
})();
export default {
  edif: [
    // ── Av. San Francisco (km 32,6–33,02; f_0304–0307): tapia de piedra y quintas viejas a la izq., galpón y comercio a la der.
    { ll: [10.477263, -66.817768], a: 'CASA', pisos: 2, col: '#ece9e1', old: 1, nota: 'quinta blanca de techo de teja tras la tapia de piedra, km 32,75 izq. (f_0305)' },
    { ll: [10.477810, -66.817650], a: 'CASA', pisos: 2, col: '#e6e1d4', old: 1 },
    { ll: [10.477212, -66.818051], a: 'CASA', pisos: 2, col: '#e2dccd', old: 1 },
    { ll: [10.477481, -66.817643], a: 'CASA', pisos: 1, col: '#ddd6c6' },
    { ll: [10.477537, -66.817674], a: 'CASA', pisos: 1, col: '#ddd6c6' },
    { ll: [10.478029, -66.817593], a: 'CASA', pisos: 2, col: '#e8e2d4', old: 1 },
    { ll: [10.478275, -66.817554], a: 'CASA', pisos: 2, col: '#d9cdb6', old: 1 },
    { ll: [10.476855, -66.818073], a: 'CASA', pisos: 2, col: '#e5dfd2', old: 1 },
    { ll: [10.477428, -66.817332], quitar: true },   // en su lugar va el galpón «NO PARE» a mano
    { ll: [10.478535, -66.817432], a: 'RES', pisos: 3, col: '#d8cdb8', shop: 1 },
    { ll: [10.478983, -66.817645], a: 'RES', pisos: 14, col: '#d6d2c8', shop: 1, alt: 1, nota: 'torre gris-beige con valla, km 32,93 izq. (f_0306)' },
    { ll: [10.479230, -66.817308], a: 'RES', pisos: 16, col: '#c2522f', alt: 1, nota: 'Edificio B: torre estrecha de ladrillo naranja (f_0305–0306)' },
    { ll: [10.478691, -66.816955], a: 'COM', pisos: 2, col: '#a8a7a1', shop: 1, nota: 'Cauchos California: comercio gris de 2 pisos, km 32,93 der. (f_0306)' },
    { ll: [10.478772, -66.816821], a: 'COM', pisos: 2, col: '#b9b6ae', shop: 1 },
    { ll: [10.478986, -66.816582], a: 'COM', pisos: 2, col: '#b04a35', shop: 1, nota: 'esquina de ladrillo con vallas (JDR), km 33,0 der. (f_0307)' },
    { ll: [10.478857, -66.816216], a: 'COM', pisos: 2, col: '#d2cbbd', shop: 1 },
    // ── Inicio de la Miranda, La California (km 33,02–33,45; f_0308–0310)
    { ll: [10.479569, -66.817271], a: 'RES', pisos: 14, col: '#d9b54a', shop: 1, nota: 'Edificio A: torre ocre de 14 pisos, km 33,09 izq. (f_0307)' },
    { ll: [10.479772, -66.817462], a: 'RES', pisos: 18, col: '#e6dcc6', shop: 1, nota: 'Res. Goncalves Zarco: torre beige alta (f_0308)' },
    { ll: [10.479972, -66.817684], a: 'RES', pisos: 16, col: '#c9c2b4', shop: 0 },
    { ll: [10.480144, -66.817953], a: 'RES', pisos: 12, col: '#d8cfbd', shop: 0 },
    { ll: [10.480319, -66.817744], a: 'RES', pisos: 18, col: '#e2d8c2', shop: 1, nota: 'Edificio Miranda' },
    { ll: [10.480514, -66.818016], a: 'BRI', pisos: 15, col: '#bfc0bb', shop: 1, nota: 'Torre Profesional La California' },
    { ll: [10.480868, -66.818186], a: 'RES', pisos: 18, col: '#d7cdb9', shop: 0 },
    { ll: [10.481386, -66.818514], a: 'COM', pisos: 3, col: '#2a2b2e', shop: 1, alt: 1, nota: 'Damasco (DA+CO): local negro con letrero rojo, km 33,31 izq. (f_0309)' },
    { ll: [10.479999, -66.816303], a: 'COM', pisos: 3, col: '#e1c64a', shop: 1, nota: 'tapia amarilla y comercio bajo, km 33,05 der. (f_0308)' },
    { ll: [10.480245, -66.816904], a: 'RES', pisos: 12, col: '#e4e0d6', shop: 1, nota: 'Residencias Fulvia' },
    { ll: [10.480616, -66.817120], a: 'RES', pisos: 14, col: '#ece9e2', shop: 1, nota: 'Residencias El Lago: torre blanca' },
    { ll: [10.480287, -66.817151], a: 'COM', pisos: 1, col: '#c9c6bf', shop: 1 },
    { ll: [10.480363, -66.817164], a: 'COM', pisos: 2, col: '#c9c6bf', shop: 1 },
    { ll: [10.481000, -66.817450], r: 45, a: 'COM', pisos: 2, col: '#cfc9bd', shop: 1, nota: 'comercio bajo entre Calle El Lago y Av. Santiago de León, der.' },
    { ll: [10.482035, -66.819014], a: 'VID', pisos: 9, col: '#4f7f86', shop: 0, nota: 'INTT: vidrio verdoso con asta de bandera, km 33,41 izq. (f_0310)' },
    { ll: [10.482508, -66.819198], a: 'BRI', pisos: 9, col: '#dcd3be', shop: 1, nota: 'Edificio Irene: oficinas beige, km 33,46 izq. (f_0310)' },
    { ll: [10.482148, -66.819188], a: 'COM', pisos: 1, col: '#c8c6c0', shop: 1 },
    { ll: [10.482199, -66.819365], a: 'COM', pisos: 1, col: '#c8c6c0', shop: 1 },
    // ── El Marqués: Unicentro amarillo, torres de 10–20 pisos (km 33,45–33,8; f_0310–0312)
    { ll: [10.482971, -66.818463], a: 'COM', h: 15, col: '#e2c13c', shop: 1, alt: 1, nota: 'C.C. Unicentro El Marqués: amarillo con franja gris, km 33,45 der. (f_0310)' },
    { ll: [10.483824, -66.819267], a: 'COM', h: 16, col: '#9d9c96', shop: 0, detalle: 0, nota: 'estacionamiento del Unicentro (B), gris de celosía (f_0311)' },
    { ll: [10.484370, -66.819726], a: 'COM', h: 22, col: '#bf6a40', shop: 1, nota: 'cuerpo de ladrillo naranja con valla grande, km 33,66 der. (f_0311)' },
    { ll: [10.484379, -66.819450], a: 'RES', pisos: 18, col: '#d9a87e', shop: 0, nota: 'Torre 1 (Capitolio)' },
    { ll: [10.484650, -66.819820], a: 'RES', pisos: 18, col: '#e1cdb0', shop: 0, nota: 'Torre 2 (Capitolio)' },
    { ll: [10.484507, -66.819612], a: 'RES', pisos: 10, col: '#d8c49f', shop: 0 },
    { ll: [10.484657, -66.820009], quitar: true },   // el cerro con árboles: no hay torre de 105 m pegada a la acera (s 778)
    { ll: [10.484795, -66.820188], quitar: true },
    { ll: [10.485031, -66.820413], quitar: true },
    { ll: [10.485072, -66.820648], quitar: true },   // en la ladera junto a la acera solo hay árboles y una tapia con grafiti (s 778)
    { ll: [10.485366, -66.820557], a: 'BRI', pisos: 6, col: '#a8573a', shop: 0, nota: 'Torre Bazar Bolívar: ladrillo con letrero «Tramas», arriba del cerro (s 778)' },
    { ll: [10.482853, -66.819584], a: 'RES', pisos: 12, col: '#e5dcc9', shop: 1, nota: 'Edificio Mónaco' },
    { ll: [10.483282, -66.819831], a: 'RES', pisos: 10, col: '#ece4d2', shop: 1, nota: 'Edificio Sara' },
    { ll: [10.483538, -66.820105], a: 'RES', pisos: 12, col: '#d8c08e', shop: 1, nota: 'Edificio Metropol' },
    { ll: [10.482631, -66.819590], a: 'RES', pisos: 10, col: '#e0d6c0', shop: 0 },
    { ll: [10.483162, -66.820006], a: 'RES', pisos: 10, col: '#e7dfcf', shop: 0 },
    { ll: [10.483362, -66.819988], a: 'RES', pisos: 18, col: '#c8a372', shop: 0 },
    { ll: [10.483648, -66.820294], a: 'RES', pisos: 10, col: '#d9cfb9', shop: 0 },
    { ll: [10.483993, -66.820564], a: 'RES', pisos: 12, col: '#e9dfc7', shop: 1, nota: 'Edificio Miravila' },
    // Edificios 1–9 de la Miranda: torres de 20 pisos crema con balcones, km 33,72–33,92 izq. (f_0312–0314)
    { ll: [10.484600, -66.821300], r: 140, a: 'RES', pisos: 20, col: '#e4d6b8', shop: 0, alt: 0 },
    { ll: [10.484173, -66.820915], a: 'RES', pisos: 20, col: '#e8dcc0', shop: 1, nota: 'Edificio 7' },
    { ll: [10.484366, -66.820891], a: 'RES', pisos: 20, col: '#ddcfb1', shop: 0 },
    { ll: [10.484579, -66.821138], a: 'RES', pisos: 20, col: '#e6d9bd', shop: 0, nota: 'Edificio 8' },
    { ll: [10.484782, -66.821515], a: 'RES', pisos: 20, col: '#dfd0b0', shop: 0, nota: 'Edificio 9' },
    { ll: [10.485187, -66.822053], a: 'RES', pisos: 20, col: '#e3d4b6', shop: 1, nota: 'Edificio 1 (f_0314)' },
    // ── Líder y Los Cortijos (km 33,8–34,1; f_0313–0315)
    { ll: [10.485426, -66.821088], a: 'COM', pisos: 2, col: '#d5cfc4', shop: 1, alt: 1, nota: "McDonald's AutoMac: el poste y las velas van a mano" },
    { ll: [10.486026, -66.820956], a: 'COM', h: 30, col: '#cfc9bf', shop: 1, alt: 1, detalle: 0, nota: 'C.C. Líder: caja gris claro con pendones, km 33,86 der. (f_0313)' },
    { ll: [10.485475, -66.822612], a: 'COM', pisos: 3, col: '#c8c0b0', shop: 1, nota: 'C.C. Puerta del Este, km 33,98 izq.' },
    { ll: [10.486868, -66.822671], a: 'VID', pisos: 8, col: '#4c5a66', shop: 1, nota: 'Centro Seguros La Paz: vidrio oscuro con alero, km 34,07 der. (f_0316)' },
    { ll: [10.486882, -66.823288], a: 'COM', pisos: 2, col: '#cfc9be', shop: 1 },
    { ll: [10.487412, -66.822895], a: 'COM', pisos: 2, col: '#d7d2c8', shop: 1, nota: 'Viva Supercentro' },
    // ── Boleíta (km 34,08–34,45; f_0316–0318): bloques blancos de 5 pisos con mural, estación de servicio, Tocomé
    { ll: [10.486249, -66.823323], a: 'RES', pisos: 5, col: '#f0ebdf', shop: 1, alt: 0, nota: 'bloque blanco de balcones amarillos con mural en la medianera, km 34,09 izq. (f_0316)' },
    { ll: [10.486000, -66.823345], a: 'RES', pisos: 5, col: '#efe9dc', shop: 0, alt: 0 },
    { ll: [10.486262, -66.823828], a: 'RES', pisos: 5, col: '#ede6d6', shop: 1, alt: 0, nota: 'Hotel Premier' },
    { ll: [10.486715, -66.824092], a: 'COM', pisos: 1, col: '#e4e1da', shop: 1, nota: 'tienda de la estación de servicio Boleíta' },
    { ll: [10.486863, -66.824638], a: 'COM', pisos: 2, col: '#cfc8ba', shop: 1 },
    { ll: [10.487843, -66.825645], quitar: true },   // Tocomé: desde la vía solo se ve su tapia con murales de caras (a mano, f_0318)
    { ll: [10.487594, -66.824931], quitar: true },
    { ll: [10.487532, -66.823823], a: 'COM', pisos: 2, col: '#c63a2f', shop: 1, nota: 'locales rojos, km 34,22 der. (f_0317)' },
    { ll: [10.487411, -66.824102], a: 'COM', pisos: 2, col: '#dad5ca', shop: 1 },
    { ll: [10.488116, -66.824254], a: 'COM', pisos: 2, col: '#d8cfbe', shop: 1 },
    { ll: [10.488608, -66.824985], a: 'COM', pisos: 2, col: '#e2c544', shop: 1, nota: 'Multimax: locales con letreros amarillos (f_0318)' },
    // ── Los Cortijos hacia Los Ruices (km 34,45–34,82; f_0318–0321)
    { ll: [10.488911, -66.825444], a: 'BRI', pisos: 6, col: '#dcd9d1', shop: 1, nota: 'Centro Empresarial Don Bosco' },
    { ll: [10.489085, -66.825695], a: 'RES', pisos: 12, col: '#e3d9c4', shop: 1 },
    { ll: [10.489138, -66.826014], a: 'RES', pisos: 12, col: '#dccfb6', shop: 1 },
    { ll: [10.489286, -66.825848], a: 'RES', pisos: 12, col: '#e3d9c4', shop: 0, nota: 'Edificio Don Manuel' },
    { ll: [10.489406, -66.826245], a: 'RES', pisos: 20, col: '#c4623c', shop: 1, alt: 1, nota: 'Edificio Sandra: torre de ladrillo naranja, km 34,55 der. (f_0318–0319)' },
    { ll: [10.489636, -66.826138], a: 'RES', pisos: 10, col: '#e3d9c4', shop: 0 },
    { ll: [10.489596, -66.826450], a: 'RES', pisos: 20, col: '#e8dfcc', shop: 1, nota: 'Edificio Samson: torre beige (f_0319)' },
    { ll: [10.489884, -66.826328], a: 'RES', pisos: 20, col: '#e2d6bf', shop: 0 },
    { ll: [10.489910, -66.826699], a: 'RES', pisos: 20, col: '#cf8a63', shop: 1, alt: 1, nota: 'Edificio Ilse' },
    { ll: [10.489971, -66.826988], a: 'COM', pisos: 3, col: '#d9d4c9', shop: 1 },
    { ll: [10.490252, -66.826877], a: 'RES', pisos: 20, col: '#e5dccb', shop: 0, nota: 'Edificio Irene' },
    { ll: [10.490089, -66.827144], a: 'COM', pisos: 2, col: '#d9d4c9', shop: 1 },
    { ll: [10.490816, -66.827186], a: 'VID', h: 62, col: '#34567d', shop: 0, nota: 'Torre Cinética: vidrio azul en retícula, km 34,73 der. (f_0320–0321); la huella traía 150 m' },
    { ll: [10.490871, -66.827796], a: 'RES', pisos: 18, col: '#d9cfbd', shop: 1, nota: 'Edificio Los Cortijos A' },
    { ll: [10.488854, -66.826449], a: 'COM', pisos: 2, col: '#bfc0a2', shop: 1 },
    { ll: [10.488992, -66.826884], a: 'COM', pisos: 3, col: '#9fb34e', shop: 1, nota: 'galpón verde y amarillo con grafiti, km 34,57 izq. (f_0319)' },
    { ll: [10.489327, -66.827126], a: 'COM', pisos: 1, col: '#c9c2ae', shop: 1 },
    { ll: [10.489530, -66.827115], a: 'COM', pisos: 1, col: '#c9c2ae', shop: 1 },
    { ll: [10.489378, -66.827362], a: 'BRI', pisos: 4, col: '#b9643f', shop: 1, nota: 'INCE: ladrillo naranja de bandas horizontales, km 34,64 izq. (f_0320)' },
    { ll: [10.489842, -66.827377], a: 'COM', pisos: 1, col: '#b8332b', shop: 1, nota: 'KFC: el poste rojo va a mano' },
    { ll: [10.489569, -66.827609], a: 'BRI', pisos: 7, col: '#c46a45', shop: 1, nota: 'Torre Panalpina, ladrillo (f_0320)' },
    { ll: [10.489734, -66.827827], a: 'COM', pisos: 3, col: '#d8d0c0', shop: 1 },
    { ll: [10.490023, -66.827789], a: 'COM', h: 9, col: '#c8ced3', shop: 1, alt: 1, nota: 'Noel Motors (Ford): vitrina curva de vidrio, km 34,72 izq. (f_0321)' },
    { ll: [10.490151, -66.828232], a: 'BRI', pisos: 6, col: '#d8ccb4', shop: 1, nota: 'Centro Empresarial Quorum: oficinas beige (f_0321)' },
    { ll: [10.490266, -66.828425], a: 'COM', pisos: 4, col: '#e2ddd2', shop: 1 },
    { ll: [10.490361, -66.828697], a: 'BRI', pisos: 4, col: '#dedbd3', shop: 1, nota: 'Edificio Regional: oficinas blancas con valla en la azotea (f_0322)' },
    // ── Elevado de Los Ruices (km 34,82–35,1; f_0322–0323)
    { ll: [10.491014, -66.828017], a: 'RES', pisos: 21, col: '#e3dccd', shop: 0, nota: 'Res. Jardín Los Ruices B' },
    { ll: [10.491237, -66.828140], a: 'RES', pisos: 13, col: '#c8beb0', shop: 1, nota: 'Edificio Los Ruices' },
    { ll: [10.491356, -66.828321], a: 'RES', pisos: 12, col: '#b4563a', shop: 1, alt: 1, nota: 'Edificio Libremar: ladrillo rojo, km 34,86 der. (f_0322)' },
    { ll: [10.491533, -66.828454], a: 'RES', pisos: 10, col: '#dad3c6', shop: 1 },
    { ll: [10.491685, -66.828644], a: 'RES', pisos: 18, col: '#cdc9bf', shop: 1, nota: 'Torre A: gris-beige de 18 pisos junto al elevado (f_0322)' },
    { ll: [10.491891, -66.828455], a: 'RES', pisos: 18, col: '#d6d0c4', shop: 0 },
    { ll: [10.491847, -66.828810], a: 'RES', pisos: 13, col: '#d8cfc0', shop: 1, nota: 'Residencias Icoa (la huella traía 12 m)' },
    { ll: [10.492030, -66.828633], a: 'RES', pisos: 13, col: '#cfc6b6', shop: 0 },
    { ll: [10.491037, -66.828916], a: 'COM', pisos: 2, col: '#d84a2c', shop: 1, nota: "Arturo's" },
    { ll: [10.491513, -66.829457], a: 'BRI', pisos: 4, col: '#d9d6cf', shop: 1, nota: 'Centro Empresarial Miranda' },
    { ll: [10.491873, -66.829847], a: 'COM', h: 8, col: '#5d6164', shop: 1, alt: 1, nota: '«Punto de Fábrica»: gris oscuro con letrero rojo, km 35,02 izq. (f_0323)' },
    { ll: [10.492028, -66.830095], a: 'COM', h: 5, col: '#3e9a7c', shop: 0, detalle: 0, nota: 'lote con malla verde (f_0323)' },
    { ll: [10.492206, -66.830109], a: 'COM', h: 5, col: '#3e9a7c', shop: 0, detalle: 0 },
    { ll: [10.492603, -66.829092], a: 'COM', pisos: 3, col: '#d6d1c7', shop: 1 },
    // ── Los Dos Caminos a nivel (km 35,1–35,55; f_0324–0326)
    { ll: [10.492928, -66.830922], quitar: true },   // la tienda de la bomba Tauro: la bomba va a mano
    { ll: [10.493112, -66.830923], quitar: true },
    { ll: [10.492966, -66.831214], a: 'COM', pisos: 2, col: '#e09a6e', shop: 1, nota: 'locales color salmón con arcos, km 35,22 izq. (f_0324)' },
    { ll: [10.492749, -66.831010], a: 'RES', pisos: 3, col: '#d9cdb8', shop: 0, nota: 'Edificio Bélgica' },
    { ll: [10.493455, -66.830698], a: 'COM', pisos: 2, col: '#9e3a2c', shop: 1, nota: 'restaurante de ladrillo rojo, km 35,21 der. (f_0324)' },
    { ll: [10.493697, -66.830575], a: 'RES', pisos: 10, col: '#e0d6c2', shop: 0, nota: 'Edificio Valencia II' },
    { ll: [10.493672, -66.830802], a: 'RES', pisos: 18, col: '#e8e0cb', shop: 1, nota: 'Edificio Valencia I: torre beige de 18 pisos (f_0324)' },
    { ll: [10.493902, -66.831076], a: 'COM', pisos: 4, col: '#2f62b0', shop: 1, alt: 1, nota: 'Banco Provincial: azul y blanco (f_0325)' },
    { ll: [10.494023, -66.831208], a: 'RES', pisos: 7, col: '#e9e4da', shop: 1, nota: 'Hotel Viana' },
    { ll: [10.493853, -66.831718], a: 'COM', pisos: 1, col: '#2b5fae', shop: 1, nota: 'kiosco y local azul, km 35,32 der. (f_0325)' },
    { ll: [10.493819, -66.831824], a: 'COM', pisos: 1, col: '#e8e6e0', shop: 1 },
    { ll: [10.493991, -66.832205], a: 'COM', pisos: 2, col: '#e6e3dc', shop: 1, alt: 1, nota: 'Farmatodo' },
    { ll: [10.494144, -66.831619], a: 'RES', pisos: 14, col: '#c4643a', shop: 0, nota: 'torre de ladrillo naranja de 14 pisos, der. (f_0325)' },
    { ll: [10.493319, -66.831553], a: 'RES', pisos: 8, col: '#c9c6bd', shop: 1, nota: 'Edificio Sucre: gris de balcones, km 35,29 izq. (f_0325–0326)' },
    { ll: [10.493107, -66.831515], a: 'COM', pisos: 2, col: '#d8d2c6', shop: 1 },
    { ll: [10.493368, -66.831816], a: 'COM', pisos: 1, col: '#d8d2c6', shop: 1 },
    { ll: [10.493583, -66.832201], a: 'COM', pisos: 2, col: '#c9302a', shop: 1, nota: 'Banco de Venezuela' },
    { ll: [10.493389, -66.832252], a: 'COM', pisos: 2, col: '#e3dfd6', shop: 1 },
    { ll: [10.493503, -66.832849], a: 'RES', pisos: 12, col: '#d3d0c9', shop: 1 },
    { ll: [10.493702, -66.832930], a: 'RES', pisos: 12, col: '#cfcbc3', shop: 1, alt: 0, nota: 'Edificio Internacional: gris claro de balcones, km 35,44 izq. (f_0326)' },
    { ll: [10.493873, -66.833351], a: 'VID', h: 95, col: '#aebccb', shop: 0, nota: 'torre esbelta de vidrio plateado, km 35,48 izq. (f_0326–0327)' },
    // 10.494351,-66.832695 (esquina de la Av. La Carlota, der.): el edificio de retícula blanca con cuadros azules sobre el Metro va a mano
    { ll: [10.494459, -66.832948], a: 'COM', pisos: 3, col: '#d9d6cf', shop: 1, nota: 'Edificio Miranda (comercial)' },
    // (19-nov, Millennium) esta huella es el bloque alto de retícula en damero (crema y verde gris, ~14 pisos, locales abajo) que sigue al edificio del
    // Metro (video s 813–815; su sombra en la satelital mide ~31 m); antes quedaba como muro de 5 m. El muro blanco con el grafiti ROSE es la cabecera
    // sur del edificio comunal de la Plaza Miranda (abajo).
    { ll: [10.494706, -66.833293], a: 'RES', pisos: 14, col: '#d6d0bf', shop: 1, alt: 1, mural: 0, nota: 'Edificio Guarimba: bloque en damero, km 35,52 der. (s 813–815)' },
    // ── C.C. Millennium Mall y Plaza Miranda (km 35,45–35,75 der.): el centro comercial, su ala y la plaza van a mano en zona_miranda.js
    { ll: [10.495347, -66.833031], quitar: true, nota: 'caja genérica de 22 m del Millennium (se dibuja a mano)' },
    { ll: [10.495212, -66.833881], a: 'COM', h: 16, col: '#e4e1d8', shop: 0, mural: 0, detalle: 0, nota: 'edificio comunal de la Plaza Miranda: cabecera blanca con grafiti ROSE junto al elevado (f_0327)' },
    { ll: [10.496218, -66.834021], a: 'VID', col: '#2f6fb3', shop: 0, mural: 0, nota: 'torre cilíndrica de vidrio azul al N de la Rómulo Gallegos (huella de 24 lados), asoma tras el elevado (f_0327)' },
    // ── Elevado de Los Dos Caminos (km 35,55–35,95; f_0327–0329)
    // (auditoría 19-nov) la huella OSM llegaba a 12 m del eje: se montaba sobre la calzada lateral izquierda de la Miranda, bajo el elevado
    // (en f_0327–f_0328 la torre queda tras la calzada y la acera). Se quita y se rehace recortada a 22 m del eje.
    { ll: [10.4946134, -66.8342814], quitar: true, nota: 'franja de la huella sobre la calzada lateral, km 35,61 izq.' },
    { poly: [[10.4943829, -66.8344688], [10.4942834, -66.8342678], [10.4943169, -66.8342513], [10.4942626, -66.8341417], [10.4944256, -66.8340591], [10.494631, -66.8344508], [10.4944851, -66.8345263], [10.4944417, -66.8344386]],
      a: 'RES', pisos: 22, col: '#bdb9b0', shop: 0, nota: 'torre residencial gris alta a la izq. del elevado (f_0327), recortada fuera de la calzada' },
    { ll: [10.494165, -66.833722], a: 'COM', pisos: 1, col: '#c9c6bf', shop: 0 },
    { ll: [10.493963, -66.834016], a: 'RES', pisos: 12, col: '#c7c3b9', shop: 0, nota: 'Residencias El Parque' },
    { ll: [10.495212, -66.833881], a: 'COM', pisos: 3, col: '#e5e0cd', shop: 1 },
    { ll: [10.495604, -66.835171], a: 'COM', pisos: 2, col: '#d6d1c7', shop: 1, mural: 0 },
    { ll: [10.495555, -66.835437], a: 'CASA', h: 5, col: '#c75b3a', mural: 0, nota: 'galpón de techo rojo (paintball), km 35,77 der. (f_0328)' },
    { ll: [10.496019, -66.835872], a: 'GAL', h: 8, col: '#d8d6d0', shop: 0, mural: 0, nota: 'Gimnasio Papá Carrillo' },
    { ll: [10.496206, -66.836339], a: 'COM', h: 6, col: '#e9e8e3', shop: 0, mural: 0, nota: 'muro blanco largo con reja azul (f_0329)' },
    { ll: [10.495940, -66.836521], a: 'COM', h: 3, col: '#e9e8e3', shop: 0, mural: 0 },
    // ── Parque del Este (km 35,95–36,55; f_0330–0335): sin murales a la derecha, solo tapias blancas, preescolar y la estación Miranda
    { ll: [10.496850, -66.838300], r: 160, a: 'COM', h: 4, col: '#e6e4de', shop: 0, mural: 0, detalle: 0 },
    { ll: [10.497274, -66.839558], a: 'COM', pisos: 2, col: '#e7e4dd', shop: 0, mural: 0 },
    { ll: [10.497683, -66.840117], a: 'COM', pisos: 2, col: '#d8d2c4', shop: 1, mural: 0 },
    { ll: [10.497242, -66.840220], quitar: true },   // bajo la marquesina azul (va a mano)
    { ll: [10.497262, -66.840456], quitar: true },
    { ll: [10.497337, -66.841144], a: 'COM', pisos: 2, col: '#2f7f5c', shop: 0, mural: 0, detalle: 0, nota: 'muro de celosía verde de la estación Miranda (f_0334)' },
    { ll: [10.497592, -66.841639], a: 'COM', pisos: 1, col: '#d9d6cf', mural: 0 },
    { ll: [10.497705, -66.842097], a: 'RES', pisos: 24, col: '#efefec', shop: 0, alt: 1, mural: 0, nota: 'torre blanca de ventanas corridas, km 36,52 der. (f_0335)' },
    { ll: [10.497802, -66.842433], a: 'VID', pisos: 16, col: '#2f5fa8', shop: 0, mural: 0, nota: 'torre de vidrio azul con logo, km 36,56 der. (f_0335)' },
    { ll: [10.497538, -66.842538], a: 'VID', pisos: 8, col: '#6d8399', shop: 1, mural: 0, nota: 'Seguros Qualitas' },
    // 23-nov (captura en dron): las huellas sueltas de dentro del Parque del Este y de la plaza del Metro salían como casas de teja;
    // son kioscos, baños, la lunchería y pabellones bajos del parque: losa clara de una planta, sin comercio ni murales
    { ll: [10.496600, -66.839700], r: 40, a: 'COM', h: 3, col: '#dcd8cc', shop: 0, mural: 0, detalle: 0 },
    { ll: [10.496654, -66.839393], quitar: true, nota: 'caseta sobre la acera, 36,22 izq. (20 m del eje)' },
    { ll: [10.496672, -66.839588], quitar: true, nota: 'caseta sobre la acera, 36,24 izq. (23 m del eje)' },
    ...[[10.496116, -66.839373], [10.495970, -66.839557], [10.496075, -66.839659], [10.496231, -66.839827], [10.496232, -66.840139], [10.495745, -66.840283],
      [10.496022, -66.840314], [10.495886, -66.840829], [10.496092, -66.841023], [10.496045, -66.841361], [10.495357, -66.840151]]
      .map(ll => ({ ll, a: 'COM', h: 4, col: '#e4e0d4', shop: 0, mural: 0, detalle: 0, nota: 'pabellón del Parque del Este' })),
    { ll: [10.496483, -66.841052], quitar: true },   // dentro del parque: no se ve edificio
    { ll: [10.496482, -66.842081], quitar: true },
    { ll: [10.496747, -66.842371], a: 'COM', pisos: 2, col: '#d8312c', shop: 1, mural: 0, nota: 'local rojo y blanco en la esquina de la Rómulo Gallegos, izq. (f_0336)' },
    // ── Los Palos Grandes (km 36,6–37,0; f_0336–0339)
    { ll: [10.496518, -66.843370], a: 'RES', pisos: 18, col: '#8a5c46', shop: 1, alt: 1, mural: 0, nota: 'Edificio Tecoteca: torre de ladrillo marrón, km 36,67 izq. (f_0336–0337)' },
    { ll: [10.496441, -66.843618], a: 'COM', h: 6, col: '#ecebe8', shop: 1, alt: 1, mural: 0, nota: 'concesionario BAIC' },
    { ll: [10.496262, -66.844054], a: 'COM', pisos: 2, col: '#2563b0', shop: 1, alt: 1, mural: 0, nota: 'fachada azul de tienda, km 36,75 izq. (f_0337)' },
    { ll: [10.496448, -66.844130], a: 'COM', pisos: 2, col: '#e3e1dc', shop: 1, alt: 1, mural: 0, nota: 'Changan' },
    { ll: [10.496185, -66.844442], a: 'COM', pisos: 2, col: '#d3cfc6', shop: 1, mural: 0 },
    { ll: [10.496037, -66.844949], a: 'BRI', pisos: 18, col: '#8d6a55', shop: 1, mural: 0, nota: 'Edificio Banco del Orinoco: torre marrón (f_0336)' },
    { ll: [10.496071, -66.845195], a: 'COM', pisos: 1, col: '#b8322a', shop: 1, nota: 'contenedores rojos con murales, km 36,87 izq. (f_0339)' },
    { ll: [10.496060, -66.845310], a: 'COM', pisos: 1, col: '#c23a2e', shop: 1 },
    { ll: [10.496153, -66.845482], a: 'COM', pisos: 1, col: '#b8322a', shop: 1 },
    { ll: [10.496122, -66.845583], a: 'COM', pisos: 1, col: '#c23a2e', shop: 1 },
    { ll: [10.497437, -66.844142], a: 'VID', pisos: 6, col: '#5a7790', shop: 1, mural: 0, nota: 'Bancrecer / Parque Canaima: vidrio con alero blanco, km 36,72 der. (f_0337)' },
    { ll: [10.496974, -66.843780], a: 'COM', pisos: 1, col: '#e9e8e4', shop: 1, mural: 0 },
    { ll: [10.496953, -66.843869], a: 'COM', pisos: 1, col: '#e9e8e4', shop: 1, mural: 0 },
    { ll: [10.497030, -66.844379], a: 'VID', pisos: 15, col: '#5e7891', shop: 1, mural: 0, nota: 'Torre Movistar' },
    { ll: [10.496986, -66.845000], a: 'BRI', pisos: 20, col: '#d9cbb0', shop: 1, mural: 0, nota: 'Torre Parque Ávila (ex HP): bandas beige (f_0337)' },
    { ll: [10.496595, -66.845132], a: 'COM', pisos: 1, col: '#d8d3c9', shop: 1, mural: 0 },
    { ll: [10.496717, -66.845595], a: 'BRI', pisos: 10, col: '#d1c7b5', shop: 1, mural: 0, nota: 'Torre A' },
    { ll: [10.496576, -66.845685], a: 'RES', pisos: 22, col: '#d9c6a0', shop: 1, mural: 0, nota: 'torre residencial beige de balcones, km 36,91 der. (f_0339)' },
    // sin murales en Los Palos Grandes ni Altamira (el generador los pinta de 35,8 a 39,6; el video no muestra ninguno aquí)
    { ll: [10.496000, -66.846800], r: 260, mural: 0 },
    // ── Llegada a Altamira (km 37,0–37,3; f_0340–0341)
    { ll: [10.496725, -66.846363], a: 'BRI', h: 85, col: '#b7a585', shop: 1, mural: 0, nota: 'Torre Mene Grande' },
    { ll: [10.496489, -66.846664], a: 'VID', h: 80, col: '#5b7591', shop: 1, mural: 0 },
    { ll: [10.496311, -66.847066], a: 'BRI', h: 75, col: '#cdbf9f', shop: 1, mural: 0, nota: 'Torre Cavendes' },
    { ll: [10.496166, -66.847587], a: 'RES', pisos: 16, col: '#d8cbb1', shop: 1, mural: 0, nota: 'Edificio Roxul' },
    // (19-nov, Altamira) la huella OSM del Hotel Caracas Palace abarca toda la manzana (82 × 67 m) y salía un bloque macizo de 110 m pegado a la plaza.
    // En la satelital son tres cuerpos: la torre (≈25 × 38 m), un cuerpo bajo al N y el podio blanco sobre la Miranda (recortado a ≥ 9,5 m del eje).
    { ll: [10.496195, -66.848133], quitar: true },
    { poly: [[10.496327, -66.848022], [10.496327, -66.847794], [10.495988, -66.847794], [10.495988, -66.848022]], a: 'BRI', h: 110, col: '#d8cdb0', shop: 0, mural: 0, nota: 'Hotel Caracas Palace: torre beige (f_0340)' },
    { poly: [[10.496545, -66.848250], [10.496545, -66.847914], [10.496333, -66.847914], [10.496253, -66.848250]], a: 'BRI', h: 22, col: '#d8cdb0', shop: 0, mural: 0 },
    { poly: [[10.495993, -66.848392], [10.495993, -66.847745], [10.495807, -66.847745], [10.495706, -66.848371]], a: 'COM', h: 12, col: '#e8e5dd', shop: 1, alt: 1, mural: 0, nota: 'podio blanco del Palace en la esquina de la Av. Luis Roche' },
    { ll: [10.495770, -66.848119], quitar: true, nota: 'pieza suelta del podio (salía una casa de teja)' },
    { ll: [10.495669, -66.848282], quitar: true, nota: 'caseta de 13 m² en la acera de la esquina de la Luis Roche: salía una casa de teja de 8 m sobre la acera' },
    { ll: [10.495404, -66.846252], a: 'BRI', pisos: 10, col: '#d6d0c2', shop: 0, mural: 0, nota: 'Ministerio de Turismo' },
    { ll: [10.495227, -66.848221], a: 'RES', pisos: 14, col: '#d7c8a8', shop: 1, mural: 0, nota: 'Edificio Humboldt' },
    { ll: [10.495578, -66.847521], a: 'COM', pisos: 1, col: '#d6d2c8', shop: 1, mural: 0 },
    { ll: [10.495494, -66.847758], a: 'COM', pisos: 1, col: '#d6d2c8', shop: 1, mural: 0 },
    { ll: [10.495552, -66.849560], a: 'BRI', h: 74, col: '#cfc2a6', shop: 1, mural: 0, nota: 'Torre Adriática' },
  ],
  via: [
    // en toda la zona no hay chaguaramos ni palmeras en las aceras: árboles de copa (samanes, acacias, apamates)
    { km0: 32.6, km1: 37.3, set: { 'veg.palL': 0, 'veg.palR': 0 } },
    // Av. San Francisco: 2 + 2 canales con doble raya amarilla, tapia de piedra a la izq. y galpón a la der. (f_0305)
    { km0: 32.70, km1: 32.99, set: { calzadas: 2, canales: 2, sep: 'ninguno', ancho: 15, 'L.tipo': 'muro/terreno', 'R.tipo': 'galpón', 'veg.L': .35, 'veg.R': .12, 'veg.denL': 2, 'veg.denR': 1 } },
    // Av. Francisco de Miranda: 3 + 3 canales con muro central de concreto (la baranda negra va a mano)
    { km0: 33.05, km1: 34.68, set: { calzadas: 2, canales: 3, sep: 'muro', ancho: 28, 'veg.L': .22, 'veg.R': .3, 'veg.denL': 1, 'veg.denR': 2 } },
    { km0: 33.66, km1: 33.84, set: { 'veg.R': .8, 'veg.denR': 3, 'R.tipo': 'muro/terreno' } },
    // antes del elevado de Los Ruices: separador bajo de brocal amarillo y cebra (f_0320–0321)
    { km0: 34.69, km1: 34.80, set: { sep: 'brocal amarillo', canales: 3, calzadas: 2, ancho: 28 } },
    // Los Dos Caminos a nivel: brocal amarillo, avenida ancha (f_0324–0326)
    { km0: 35.12, km1: 35.52, set: { sep: 'brocal amarillo', canales: 3, calzadas: 2, ancho: 30, 'veg.L': .12, 'veg.R': .25 } },
    // Parque del Este: isla ancha de grama con árboles de tronco pintado, parque a la izq. (f_0330–0335)
    // 23-nov: ancho 34 → 28. Con 34 la calzada contraria llegaba a 26,8 m del eje y la acera a 29 m, por encima del lindero real del parque
    // (OSM: 16,5–21,6 m; la calzada contraria va 11–17,6 m a la izquierda). Con 28 el motor da su mínimo (13,6 + isla 5 + 9,4 = borde a 21,2 m)
    // y la reja del parque (landmarks/zona_miranda.js) queda a 24,2 m, tras la acera.
    { km0: 35.96, km1: 36.55, set: { sep: 'isla con árboles', canales: 3, calzadas: 2, ancho: 28, 'L.tipo': 'parque', 'veg.L': .75, 'veg.denL': 3, 'veg.R': .5, 'veg.denR': 2 } },
    { km0: 36.55, km1: 36.62, set: { sep: 'ninguno' } },
    // Los Palos Grandes y Altamira: baranda negra sobre brocal amarillo (f_0338–0341)
    { km0: 36.63, km1: 37.3, set: { sep: 'baranda', canales: 3, calzadas: 2, ancho: 30, 'veg.L': .4, 'veg.R': .45 } },
  ],
  relieve: [
    // el cerro arbolado de El Marqués a la derecha, con la Torre Bazar Bolívar arriba (s 778, f_0312)
    // (trazado 2, 19-nov) el eje de 33,53–33,95 dejó de salirse 6–10 m a la acera norte: el cerro queda ~7 m más lejos del eje nuevo
    { km0: 33.66, km1: 33.84, lado: 'R', d0: 23, d1: 41, dh: 11, d2: 97, d3: 132, rampa: 30, nota: 'cerro de El Marqués' },
  ],
  // Plaza Miranda (Millennium): chaguaramos junto a los espejos de agua (satelital); al final, el arbolado del Parque del Este (PQ_ARBOLES)
  arboles: [
    { ll: [10.495572, -66.834523], especie: 'palma', alto: 16 }, { ll: [10.495505, -66.834539], especie: 'palma', alto: 16 }, { ll: [10.495439, -66.834555], especie: 'palma', alto: 16 },
    { ll: [10.495373, -66.834572], especie: 'palma', alto: 16 }, { ll: [10.495306, -66.834588], especie: 'palma', alto: 16 }, { ll: [10.495240, -66.834604], especie: 'palma', alto: 16 },
    { ll: [10.495797, -66.834464], especie: 'palma', alto: 16 }, { ll: [10.495678, -66.834440], especie: 'palma', alto: 16 }, { ll: [10.495797, -66.834720], especie: 'palma', alto: 16 },
    { ll: [10.495797, -66.834298], especie: 'palma', alto: 16 }, { ll: [10.495797, -66.834164], especie: 'palma', alto: 16 }, { ll: [10.495718, -66.834056], especie: 'palma', alto: 16 },
    // Plaza Francia (Altamira): arboleda a los lados de los espejos, chaguaramos en la rotonda del obelisco y en las cabeceras, apamates en el frente
    { ll: [10.496995, -66.849127], especie: 'caobo', alto: 13 }, { ll: [10.496884, -66.849068], especie: 'caobo', alto: 13 }, { ll: [10.496778, -66.849136], especie: 'caobo', alto: 13 },
    { ll: [10.496667, -66.849076], especie: 'caobo', alto: 13 }, { ll: [10.496561, -66.849145], especie: 'caobo', alto: 13 }, { ll: [10.496450, -66.849085], especie: 'caobo', alto: 13 },
    { ll: [10.496345, -66.849153], especie: 'caobo', alto: 13 }, { ll: [10.496128, -66.849162], especie: 'caobo', alto: 13 }, { ll: [10.496035, -66.849102], especie: 'apamate', alto: 13 },
    { ll: [10.495947, -66.849169], especie: 'caobo', alto: 13 }, { ll: [10.495854, -66.849109], especie: 'apamate', alto: 13 }, { ll: [10.495748, -66.849177], especie: 'apamate', alto: 13 },
    { ll: [10.496961, -66.848717], especie: 'mango', alto: 10 }, { ll: [10.496850, -66.848648], especie: 'mango', alto: 10 }, { ll: [10.496744, -66.848726], especie: 'mango', alto: 10 },
    { ll: [10.496633, -66.848657], especie: 'mango', alto: 10 }, { ll: [10.496437, -66.848738], especie: 'caobo', alto: 13 }, { ll: [10.496325, -66.848670], especie: 'caobo', alto: 13 },
    { ll: [10.496108, -66.848678], especie: 'caobo', alto: 13 }, { ll: [10.496021, -66.848755], especie: 'mango', alto: 10 }, { ll: [10.495928, -66.848686], especie: 'caobo', alto: 13 },
    { ll: [10.495840, -66.848762], especie: 'mango', alto: 10 }, { ll: [10.495729, -66.848694], especie: 'mango', alto: 10 },
    { ll: [10.496638, -66.849032], especie: 'palma', alto: 14 }, { ll: [10.496637, -66.848776], especie: 'palma', alto: 14 }, { ll: [10.496431, -66.849049], especie: 'palma', alto: 14 },
    { ll: [10.496411, -66.848776], especie: 'palma', alto: 14 }, { ll: [10.496988, -66.848954], especie: 'palma', alto: 14 }, { ll: [10.496984, -66.848835], especie: 'palma', alto: 14 },
    { ll: [10.496113, -66.849026], especie: 'palma', alto: 14 }, { ll: [10.496103, -66.848779], especie: 'palma', alto: 14 },
    { ll: [10.495704, -66.849216], especie: 'apamate', alto: 11 }, { ll: [10.495691, -66.848659], especie: 'apamate', alto: 11 },
    { ll: [10.495656, -66.849135], especie: 'apamate', alto: 11 }, { ll: [10.495649, -66.848724], especie: 'apamate', alto: 11 },
    ...PQ_ARBOLES,
  ],
  estructuras: [],
  // la pasarela de Parque del Este va a mano (columnas amarillo y negro, cajón de acero gris)
  quitaEstructuras: [[36.10, 36.25]],
  // el elevado de Los Ruices no lleva el paño amarillo lleno del motor: su guardarriel abierto va a mano en zona_miranda.js (f_0322–0323)
  sinBaranda: [[34.82, 35.10]],
};
