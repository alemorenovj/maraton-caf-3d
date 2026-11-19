// Correcciones de la zona mercedes (km 23.3–26.8). Contrato en fx/correcciones/LEEME.md
// Validado contra el video del recorrido (f_0227–f_0261 y cuadros intermedios). El km del índice del video va ~0,15–0,2 km
// adelantado en El Rosal (Seguros Horizonte, s=573, cae en el km 23,35) y casi exacto en Las Mercedes (Tolón en f_0247 = 25,29).
// Tramos: El Rosal hacia el este (23,30–23,45) · calle de la Alcaldía de Chacao hacia el sur (23,45–23,58) · Av. Venezuela
// hacia el oeste (23,58–24,15) · bajada al elevado de la autopista (24,15–24,45) · Av. Principal de Las Mercedes (24,45–25,75) ·
// bajo el viaducto de Prados del Este con el mural (25,78–26,05) · rampa con muro de contención (26,1–26,42) · puente de El Ciempiés (26,45–26,76).
// 17-nov (km 25,4–27), con cuadros del video a 1 s (t=615–661 s; t≈627 = km 25,74, t≈630 = 25,86, t≈642,5 = 26,45): el viaducto pasa a
// tablero de 11 vigas + cabezales cada 28 m + pilas cuadradas + frente con New Jersey, intradós con luz de rebote, lámparas y los dos
// letreros verdes colgados (landmarks/zona_mercedes.js); Hotel Tamanaco escalonado de tres alas sobre su huella OSM y el rótulo del
// juego bajado a su azotea; Eurobuilding como torre de 19 pisos (ala O) + ala E de 12 + podio, con franja oscura y letrero; se quitan
// las dos huellas extruidas; relieve +16 m del cerro del Tamanaco (el DEM lo dejaba tapado por el tablero); izquierda de 25,95–26,1
// con árboles. Hoja: fx/capturas/chuao_cmp.jpg.
// 2ª pasada: Eurobuilding en concreto beige con retícula de balcones y letrero arriba en la testera; su huella OSM arranca a 7 m a la
// DERECHA de la ruta en el 26,59 (se deja ahí: el video lo pasa en t≈650 s, así que en el puente el km del video va ~0,1 km adelantado:
// t=645 ≈ 26,47 y t=647,5 ≈ 26,53). Izquierda 25,90–26,03: sin las dos torres de ladrillo, muro oscuro con portón y árboles (módulo).
// Puente de El Ciempiés: copas que asoman sobre el parapeto y tres vallas rosadas en poste a la derecha (módulo). Se borraron los
// rótulos del Tamanaco y del Eurobuilding en data/caf-data.js y se excluyen en build/02_build.py.
// 3ª pasada: árboles del motor (veg.L .95) a la salida del viaducto en vez de copas a mano; relieve del cerro desde d0 29 y muro de
// contención claro a 27,5 m a la derecha (landmarks) que tapa el faldón negro bajo el tablero (t=630 s); intradós más oscuro y valla
// larga genérica a la derecha bajo el viaducto; Tamanaco con cantos de losa por piso y arbolado en la ladera.
// 4ª pasada: CCCT (podio en terrazas, Pirámide Invertida, torres A–C oscuras), Cubo Negro y torre IBM con sus huellas OSM (los dos
// grandes se modelan en landmarks; aquí se quitan sus extrusiones); lista `arboles` (árboles del motor sembrados) a los dos lados del
// puente, en la ladera del Tamanaco y en el talud de la rampa; el relieve de la rampa arranca en d0 16 tras el muro de contención.
// 6ª pasada (20-nov), con anclas nuevas del video (t=636,3 = km 26,15 · t=639,6 = 26,21 bajo la autopista · t=643,0 = 26,34 ·
// t=643,75 = 26,40 · t=650,75 = 26,50; el índice iba 0,16 km adelantado desde t≈638): fuera el muro gris continuo de la rampa
// (ahora murete, muro de contención solo antes del paso bajo la autopista, reja, corte de roca y muro verde a la izquierda, en el
// módulo) con su relieve partido; paso bajo la Autopista Prados del Este; bloque de ventanas corridas a la izquierda; sin paño
// amarillo en el puente; copas bajas a la derecha del puente para que se vean las alas del Eurobuilding. De t=628 a 636 las anclas
// viejas (t≈627 = 25,74, t≈630 = 25,86) siguen valiendo.
// 5ª pasada (19-nov), tras «el Tamanaco y el Eurobuilding no se reconocen»: los dos hoteles rehechos con foto de referencia (ver
// landmarks/zona_mercedes.js §5) y la calle La Guairita sin la isla ni la calzada contraria inventadas (fx/correcciones/rio_janeiro.js).
// 7ª pasada (21-nov), Av. Principal y Plaza Alfredo Sadel (24,45–25,30), con el video a 2 cuadros/s (t=596–624 s) y anclas nuevas:
// t=610,5 semáforo de la Calle Londres = km 25,02 · t≈614,7 el tubo de los Mástiles por la izquierda = 25,166 · t=616 cebra de
// La Trinidad = 25,206 (el índice de fotogramas va ~0,1 km ADELANTADO aquí: f_0247 cae en 25,18, no en 25,29). La plaza, la
// calzada adoquinada con bolardos, la cerca con grafiti, las grúas y la reja verde van en landmarks/zona_mercedes.js §14–17; el
// frente del Tolón en landmarks/tolon_las_mercedes.js. Aquí: árboles de la plaza (nodos OSM), la sección angosta desde 25,00 y
// los edificios de la derecha frente a la plaza (esqueleto, locales, Itaca, torre de ladrillo en obra) y dos oficinas blancas.
const COM = 'comercial bajo con santamarías';
export default {
  edif: [
    // Av. Principal de Las Mercedes (24,47–25,62): el comercio es de vitrina y fachada lisa, no de santamarías de colores
    { ll: [10.486306, -66.865691], r: 75, alt: 1 },
    { ll: [10.485500, -66.865288], r: 75, alt: 1 },
    { ll: [10.484842, -66.864662], r: 75, alt: 1 },
    { ll: [10.484221, -66.863999], r: 75, alt: 1 },
    { ll: [10.483613, -66.863323], r: 75, alt: 1 },
    { ll: [10.482997, -66.862654], r: 75, alt: 1 },
    { ll: [10.482372, -66.861994], r: 75, alt: 1 },
    { ll: [10.481750, -66.861330], r: 75, alt: 1 },
    { ll: [10.481140, -66.860655], r: 75, alt: 1 },
    { ll: [10.480461, -66.859920], r: 75, alt: 1 },
    { ll: [10.479842, -66.859254], r: 75, alt: 1 },
    { ll: [10.479240, -66.858575], r: 75, alt: 1 },
    // ───── El Rosal, hacia el este (23,30–23,45)
    { ll: [10.490477, -66.862214], a: 'BRI', col: '#cdbfa6', nota: 'Edificio Impres, torre beige tras los árboles (der.)' },
    { ll: [10.490401, -66.861729], a: 'BRI', col: '#d6cebd', nota: 'bloque de oficinas claro (der.)' },
    { ll: [10.491111, -66.861581], a: 'VID', pisos: 7, col: '#4f7fae', nota: 'Seguros Horizonte, vidrio azul curvo (izq., s=573)' },
    { ll: [10.490610, -66.861425], a: 'BRI', col: '#e3e0d8', nota: 'Torre Bayer, blanca con retícula (der.)' },
    { ll: [10.491202, -66.860907], a: 'VID', pisos: 7, col: '#5b88b0', nota: 'Torre 3M (izq.)' },
    { ll: [10.491024, -66.860374], a: 'BRI', pisos: 8, col: '#cdbfa4', nota: 'Torre Edifica' },
    { ll: [10.490648, -66.860462], a: 'RES', pisos: 12, alt: 1, col: '#d8c6a5', shop: 1, nota: 'Residencias VVZ, esquina del giro' },
    { ll: [10.490405, -66.861036], a: 'RES', pisos: 17, alt: 1, col: '#a8705a', shop: 0, nota: 'Edificio Atrium: torre de ladrillo rojizo con ventanas en retícula (der. en el giro)' },
    // ───── calle de la Alcaldía (sur) y Av. Venezuela (oeste)
    { ll: [10.489593, -66.861201], a: 'BRI', pisos: 17, col: '#c4c6c4', nota: 'torre gris de retícula a la der. de la cilíndrica' },
    { ll: [10.489350, -66.861209], a: 'BRI', pisos: 17, col: '#b9b7ae', nota: 'torre detrás' },
    { ll: [10.489444, -66.860448], a: 'COM', pisos: 3, col: '#d9d1c2', nota: 'bajos con árboles (izq. de la calle de la Alcaldía)' },
    { ll: [10.490220, -66.860509], a: 'COM', pisos: 2, col: '#c2683f', nota: 'edificio de ladrillo con letrero CHACAO' },
    { ll: [10.490091, -66.861498], a: 'COM', pisos: 2, col: '#efeeea', shop: 1, nota: 'Traki' },
    { ll: [10.490061, -66.862160], a: 'BRI', pisos: 16, col: '#ddd5c3', nota: 'torre clara tras los árboles (der., f_0233)' },
    { ll: [10.489449, -66.862215], a: 'VID', pisos: 12, col: '#7392ad', nota: 'Rosal Premium, vidrio espejo curvo (izq., f_0233)' },
    { ll: [10.490005, -66.862593], a: 'VID', col: '#3d566e', nota: 'Torre Mariana, vidrio oscuro (der.)' },
    { ll: [10.489909, -66.862962], a: 'VID', col: '#4a6278', nota: 'Torre Asociación Bancaria' },
    { ll: [10.489439, -66.862785], a: 'BRI', pisos: 20, col: '#d2c9b6', nota: 'Torre Bicentenario' },
    { ll: [10.489321, -66.863265], a: 'BRI', col: '#c9c4ba', nota: 'Torre Clement' },
    { ll: [10.489226, -66.863717], a: 'BRI', pisos: 16, col: '#ece9e2', nota: 'Torre BOD, blanca (izq., f_0235)' },
    { ll: [10.489247, -66.864237], a: 'COM', pisos: 2, col: '#a85a3a', shop: 1, nota: 'bajo de ladrillo (Juan Sebastián Bar)' },
    { ll: [10.489842, -66.863864], a: 'RES', pisos: 16, alt: 1, col: '#a8705a', shop: 0, nota: 'Torre JWM, ladrillo con palmas y jardineras (der., f_0235)' },
    { ll: [10.490021, -66.864360], a: 'RES', alt: 1, col: '#ad735c', shop: 0, nota: 'Torre Marriott Norte, ladrillo' },
    { ll: [10.489719, -66.864574], a: 'RES', pisos: 18, alt: 1, col: '#ad735c', shop: 0, nota: 'JW Marriott, ladrillo' },
    { ll: [10.489203, -66.864692], a: 'VID', col: '#7c8c96', nota: 'torre de granito gris y vidrio (izq., f_0236)' },
    { ll: [10.488859, -66.864702], a: 'VID', pisos: 10, col: '#5d7f99', nota: 'Torre Banco del Tesoro' },
    { ll: [10.489590, -66.865043], a: 'RES', pisos: 9, alt: 1, col: '#e6e0d2', shop: 0, nota: 'Policlínica Americana' },
    { ll: [10.489086, -66.865047], a: 'BRI', pisos: 10, col: '#d8d2c6', nota: 'Torre Lamaletto' },
    { ll: [10.489059, -66.865303], a: 'COM', pisos: 3, col: '#d5cfc3', nota: 'Edificio Provincial' },
    { ll: [10.489519, -66.865428], a: 'BRI', pisos: 12, col: '#cfc6b4', nota: 'Torre Constitución' },
    { ll: [10.489006, -66.865663], a: 'VID', pisos: 10, col: '#5a6f7f', nota: 'Edificio Platinium, redondo de vidrio (esquina del giro, f_0237)' },
    { ll: [10.489530, -66.865889], a: 'COM', pisos: 4, col: '#d8d2c4', nota: 'ONA' },
    { ll: [10.489548, -66.866562], a: 'BRI', pisos: 15, col: '#d9c9a8', nota: 'Centro Financiero Internacional, beige (der., f_0237)' },
    { ll: [10.488742, -66.866306], a: 'BRI', pisos: 7, col: '#e2ddd5', nota: 'Torre BFC' },
    { ll: [10.488596, -66.865736], a: 'COM', pisos: 2, col: '#e0d9cc', nota: 'Gourmet Market' },
    { ll: [10.488051, -66.865563], a: 'RES', pisos: 10, alt: 1, col: '#c2643c', shop: 1, nota: 'Edificio Forum, ladrillo naranja (izq., f_0237)' },
    { ll: [10.487902, -66.866175], a: 'VID', col: '#2f8a8c', nota: 'Torre Banesco, vidrio verde azulado (der., f_0238)' },
    { ll: [10.487557, -66.865572], a: 'COM', pisos: 3, col: '#d6d0c4' },
    // ───── Las Mercedes: entrada bajo la autopista y cruce (24,40–24,62). 2ª pasada: las huellas del local blanco con franja azul, el cubo
    // celeste, la oficina de bandas y los dos del muro cortina azul las quitan los círculos `quita` de landmarks/zona_mercedes.js (§18)
    { ll: [10.486540, -66.866348], a: 'COM', pisos: 3, col: '#ecebe6', shop: 0, nota: 'blanco con franja azul tras el elevado' },
    { ll: [10.486348, -66.866175], a: 'COM', pisos: 3, col: '#e4e2dc', shop: 0 },
    { ll: [10.485467, -66.865920], a: 'COM', pisos: 1, col: '#e0dbd0' },
    { ll: [10.485835, -66.864995], a: 'COM', pisos: 3, col: '#d6c7a6', shop: 0, nota: 'beige de 3 pisos con muro blanco (izq., s=600)' },
    { ll: [10.485076, -66.865329], a: 'COM', pisos: 6, col: '#a39f97', shop: 0, detalle: 0, nota: 'esqueleto de concreto en construcción con andamios (der., s=600)' },
    { ll: [10.485199, -66.864521], a: 'COM', pisos: 1, col: '#c8352e', shop: 1, nota: 'KFC, rojo (izq.)' },
    { ll: [10.484937, -66.864370], a: 'COM', pisos: 2, col: '#d9cfc0', nota: 'Pizza Hut' },
    { ll: [10.484444, -66.864852], a: 'VID', pisos: 2, alt: 1, col: '#8cc2d6', nota: 'local de vidrio celeste con letrero azul (der., t=600,5–601; 2ª pasada)' },
    { ll: [10.484375, -66.864533], a: 'COM', pisos: 2, col: '#e9e7e2' },
    { ll: [10.484285, -66.864393], a: 'RES', alt: 1, pisos: 3, col: '#f2f1ed', shop: 1, nota: 'Supermercado Yeet: blanco de 3 plantas con logo azul (der., t=601,5; 2ª pasada: era caja gris)' },
    { ll: [10.484861, -66.864180], a: 'RES', pisos: 4, alt: 1, col: '#e2d9c8', nota: 'Residencias La Joya' },
    { ll: [10.484677, -66.863972], a: 'BRI', pisos: 6, col: '#d9d6cf', nota: 'Centro Bancaribe' },
    // ───── Av. Principal (24,75–25,05): concesionarios, oficinas blancas de 3–4 pisos, quintas
    { ll: [10.483994, -66.864147], a: 'COM', pisos: 1, alt: 1, col: '#e9eef1', nota: 'Multimarca: vitrina baja (der., t=601,8); 2ª pasada: de 2 a 1 planta, tapaba la oficina de bandas que en el video se ve entera (t=602)' },
    { ll: [10.483699, -66.864131], a: 'COM', pisos: 3, col: '#e0ddd5' },
    { ll: [10.483536, -66.863588], a: 'RES', alt: 1, pisos: 3, col: '#efeeea', shop: 1, nota: 'blanco con letrero Frigorífico Trébol (der., f_0243; 2ª pasada: RES de retícula, el COM salía gris)' },
    { ll: [10.483307, -66.863455], a: 'RES', alt: 1, pisos: 4, col: '#ecebe6', shop: 1, nota: 'Centro Belsu, blanco (der., t=607)' },
    { ll: [10.483187, -66.863316], a: 'VID', pisos: 4, alt: 1, col: '#ecebe6', nota: 'oficina blanca de ventanas corridas (der., s=607)' },
    { ll: [10.483036, -66.863103], a: 'RES', alt: 1, pisos: 3, col: '#f0efe9', shop: 1, nota: 'Multicentro Las Mercedes, blanco' },
    { ll: [10.482865, -66.862893], a: 'RES', alt: 1, pisos: 3, col: '#f2f1ec', shop: 1, nota: 'blanco moderno con palmas y toldos (der., t=608–608,5)' },
    { ll: [10.482686, -66.862679], a: 'VID', pisos: 3, alt: 1, col: '#a9bfcf', nota: 'Parcela 340, vidrio claro' },
    { ll: [10.482345, -66.862327], a: 'VID', pisos: 4, col: '#34414c', nota: 'Centro Profesional Las Mercedes: vidrio oscuro con rampa (der., t=611 s; 21-nov)' },
    { ll: [10.482079, -66.862060], a: 'COM', pisos: 5, col: '#a39f97', shop: 0, detalle: 0, nota: 'esqueleto de concreto de 5 losas con lámina gris abajo y la señal verde Valle Arriba (der., t=611,5–612 s; 21-nov)' },
    { ll: [10.484550, -66.863606], a: 'CASA', pisos: 2, col: '#f1eee6' },
    { ll: [10.484254, -66.863244], a: 'COM', pisos: 2, col: '#e9e4d9', nota: 'Edificio Banesco' },
    { ll: [10.483903, -66.863246], a: 'RES', pisos: 3, col: '#f1efe9', old: 1, shop: 0, nota: 'casa vieja blanca de 3 plantas con balcones en la esquina (izq., t=606,5–607; 2ª pasada)' },
    { ll: [10.483760, -66.863074], a: 'CASA', pisos: 2, col: '#f3efe4', nota: 'Quinta Las Gracielas' },
    { ll: [10.483441, -66.862942], a: 'COM', pisos: 1, col: '#e6dfd2' },
    { ll: [10.483658, -66.862793], a: 'COM', pisos: 2, col: '#e6dfd2' },
    { ll: [10.483345, -66.862658], a: 'COM', pisos: 2, col: '#dad3c6', nota: 'Casino Humboldt' },
    { ll: [10.483413, -66.862378], a: 'VID', pisos: 4, col: '#3f7f86' },
    { ll: [10.482849, -66.862022], a: 'VID', pisos: 4, col: '#3f8088', nota: 'Centro Summum: muro cortina verde azulado sobre planta baja retirada, cerca de láminas (izq., f_0244)' },
    // ───── Plaza Alfredo Sadel y Tolón (25,05–25,45)
    { ll: [10.482692, -66.861700], a: 'COM', pisos: 3, col: '#b5654a', shop: 0, nota: 'ladrillo rojizo de 3 pisos tras el de vidrio (izq., f_0244)' },
    { ll: [10.482572, -66.861467], a: 'COM', pisos: 2, col: '#e5ddcf', nota: 'Edificio BVC' },
    { ll: [10.481773, -66.861691], a: 'COM', pisos: 2, col: '#bf9a80', shop: 1, alt: 1, nota: 'locales de santamarías grises con franja terracota (der., t=612,5 s; 21-nov: era un galpón gris de 8 m)' },
    { ll: [10.481438, -66.861767], a: 'CASA', pisos: 2, col: '#e8dcc4' },
    { ll: [10.481501, -66.861349], a: 'RES', pisos: 5, col: '#ecebe5', nota: 'Edificio Itaca, blanco, frente a la plaza (der., t=613 s)' },
    { ll: [10.481212, -66.861319], a: 'RES', pisos: 6, alt: 1, col: '#d8cdb8' },
    { ll: [10.481039, -66.861356], a: 'RES', alt: 1, pisos: 14, col: '#b3644a', shop: 0, nota: 'torre de ladrillo en obra con grúa en la azotea (der., t=612,5–613 s; la grúa va en landmarks/zona_mercedes.js §17)' },
    { ll: [10.481744, -66.860674], a: 'RES', pisos: 6, col: '#e2d6c0', nota: 'Maracapana' },
    { ll: [10.481546, -66.860777], quitar: true, nota: 'obra de la estación: en el video es la plaza arbolada (f_0245)' },
    { ll: [10.481289, -66.860509], a: 'BRI', pisos: 4, alt: 1, col: '#e2ddd2', nota: 'Goizalde: blanco de bandas con vidrio y escalinata (izq., f_0247)' },
    { ll: [10.481241, -66.860047], a: 'BRI', col: '#e8e6e0', nota: 'bloque blanco tras los árboles' },
    { ll: [10.481040, -66.860182], a: 'COM', pisos: 2, col: '#e4ddd0' },
    { ll: [10.480871, -66.859922], a: 'COM', pisos: 2, col: '#d9cfbe', nota: 'Barsa' },
    { ll: [10.480488, -66.859468], a: 'COM', pisos: 4, col: '#d0743a', shop: 1, nota: 'naranja de 4 pisos (izq., f_0248)' },
    { ll: [10.480099, -66.859950], a: 'COM', pisos: 2, col: '#e9e4da', shop: 1, nota: 'locales con toldos (der., f_0248)' },
    { ll: [10.479906, -66.859745], a: 'RES', pisos: 5, alt: 1, col: '#e8e4da', nota: 'Dautar' },
    { ll: [10.479600, -66.859886], a: 'COM', pisos: 3, col: '#ece8de', shop: 1, nota: 'la huella trae 110 m; en el video hay una casa vieja blanca y locales (der., f_0249)' },
    { ll: [10.479703, -66.859510], a: 'COM', pisos: 3, col: '#c8c2b5', nota: 'Centro Guayana (obra)' },
    { ll: [10.479403, -66.859752], a: 'BRI', pisos: 4, col: '#e6e2d8' },
    { ll: [10.480202, -66.859059], a: 'RES', pisos: 18, alt: 1, col: '#e9e7e1', shop: 1, nota: 'torre blanca alta de retícula (izq., f_0249)' },
    // ───── 25,48–25,75: oficinas públicas, SAIME, Paseo Las Mercedes
    { ll: [10.479939, -66.858835], a: 'COM', pisos: 2, col: '#d9d4c9', nota: 'muro con grafitis (izq., f_0249)' },
    { ll: [10.479802, -66.858689], a: 'COM', pisos: 2, col: '#e0dbd0' },
    { ll: [10.479645, -66.858585], a: 'COM', pisos: 2, col: '#d4d0c6' },
    { ll: [10.479518, -66.858428], a: 'BRI', pisos: 6, col: '#dcd7cc', nota: 'Tierras Urbanas' },
    { ll: [10.479182, -66.858168], a: 'BRI', pisos: 7, col: '#d7d9db', shop: 0, nota: 'Sunavi: columnas, bandera y reja negra (izq., f_0250)' },
    { ll: [10.479049, -66.857952], a: 'COM', pisos: 3, col: '#ddd6c8' },
    { ll: [10.478763, -66.858796], a: 'BRI', pisos: 16, col: '#c9b48e', nota: 'SAIME: torre beige de pilastras verticales (der., f_0250)' },
    { ll: [10.479148, -66.857251], a: 'RES', pisos: 5, col: '#d9cbb0', nota: 'Residencias La Hacienda' },
    { ll: [10.479014, -66.856529], a: 'BRI', pisos: 14, col: '#e6e3da', nota: 'Torreón: losa blanca de retícula (izq., f_0252)' },
    { ll: [10.479284, -66.856211], a: 'RES', pisos: 13, alt: 1, col: '#b77a55', shop: 0, nota: 'Torre ABA, ladrillo y beige (al fondo en f_0250)' },
    // ───── bajo el viaducto: el muro con mural ocupa la derecha
    { ll: [10.478913, -66.855461], quitar: true, nota: 'El Trolly: bajo el viaducto, en el video es el muro con mural' },
    { ll: [10.479136, -66.855190], quitar: true },
    { ll: [10.479330, -66.854611], quitar: true },
    { ll: [10.479725, -66.854392], quitar: true },
    { ll: [10.479269, -66.855655], a: 'COM', pisos: 3, col: '#cfc8bb', nota: 'muro con grafiti y casa blanca (izq., f_0253)' },
    { ll: [10.479453, -66.855429], quitar: true, nota: 'salida del viaducto, izq.: en el video hay muro oscuro con portón y árboles (t=631–634 s); el muro va en el módulo' },
    { ll: [10.479530, -66.855283], quitar: true },
    // ───── Chuao: CCCT, Cubo Negro y torres vecinas (huellas OSM; el podio y el cubo se modelan en landmarks/zona_mercedes.js)
    { ll: [10.484957, -66.855087], quitar: true, nota: 'podio del CCCT extruido entero a 57 m' },
    { ll: [10.484316, -66.853386], quitar: true, nota: 'Cubo Negro (Centro Banaven)' },
    { ll: [10.484163, -66.855175], a: 'VID', pisos: 12, col: '#27333c', nota: 'CCCT Torre C' },
    { ll: [10.484352, -66.855483], a: 'VID', pisos: 12, col: '#27333c', nota: 'CCCT Torre B' },
    { ll: [10.484515, -66.855687], a: 'VID', pisos: 12, col: '#27333c', nota: 'CCCT Torre A' },
    { ll: [10.484195, -66.85465], a: 'BRI', pisos: 10, col: '#cfc6b4', nota: 'Hotel Best Western CCCT' },
    { ll: [10.483168, -66.854377], a: 'VID', pisos: 13, col: '#3a4651', nota: 'Torre IBM' },
    { ll: [10.482984, -66.853279], a: 'VID', alt: 1, pisos: 15, col: '#d6d3cb', shop: 0, nota: 'bloque gris claro de ventanas corridas a la izq. de la rampa (t=642,5–643,0 s = km 26,31–26,34; 20-nov: era RES beige de balcones)' },
    // ───── rampa y puente de El Ciempiés
    { ll: [10.480286, -66.854341], a: 'RES', pisos: 4, col: '#e3d8c2', shop: 1, nota: 'Più mobili: beige de 4 pisos con planta baja naranja (izq., f_0255)' },
    { ll: [10.480095, -66.854612], a: 'RES', pisos: 9, alt: 1, col: '#a85d3d', shop: 0, nota: 'torre de ladrillo detrás de Più' },
    { ll: [10.479746, -66.854934], a: 'RES', pisos: 4, alt: 1, col: '#9a948a', shop: 0, nota: 'tras el muro y los árboles: bajo y gris, no torre de ladrillo (t=633 s)' },
    { ll: [10.480384, -66.853466], quitar: true, nota: 'sobre el muro de contención no hay edificio (f_0256)' },
    { ll: [10.480676, -66.853196], a: 'RES', pisos: 5, col: '#d8d0c0', old: 1, shop: 0, nota: 'edificio viejo abandonado entre árboles (der., f_0257)' },
    { ll: [10.481424, -66.853429], a: 'GAL', pisos: 3, col: '#e3c23a', nota: 'estructura amarilla (izq., f_0257)' },
    { ll: [10.481486, -66.852307], a: 'COM', pisos: 2, col: '#b5553a', shop: 0, nota: 'la huella trae 56 m; en el video, la Cruz Roja de ladrillo de 2 pisos (der., f_0258)' },
    { ll: [10.481740, -66.851844], a: 'COM', pisos: 2, col: '#b8664a', shop: 0 },
    // Tamanaco y Eurobuilding: sus huellas las quitan los círculos `quita` de landmarks/zona_mercedes.js (que también apartan los árboles)
    // calle La Guairita, derecha (26,73–26,76): en el video, oficinas claras bajas tras árboles y muro (t=651–653 s), no bloques grises de 7–9 pisos
    { ll: [10.482934, -66.849789], a: 'BRI', pisos: 5, col: '#e6e3da', nota: 'Edificio Los Frailes, km 26,75 der.' },
    { ll: [10.482936, -66.849922], a: 'COM', pisos: 3, col: '#e2dfd7', nota: 'km 26,73 der.' },
    // 19-nov: huellas de manzana que heredaban la altura de un edificio de dentro (mismo techo, parpadeo): van al final para que manden
    { ll: [10.490401, -66.861729], a: 'BRI', pisos: 3, col: '#d6cebd', nota: 'manzana del Traki y las torres de El Rosal, km 23,3–23,6 der.' },
    { ll: [10.481241, -66.860047], a: 'BRI', pisos: 3, col: '#e8e6e0', nota: 'bloque blanco tras los árboles, km 25,3 izq.: 3 pisos para no coincidir con Barsa y Goizalde' },
    { ll: [10.4796, -66.859886], a: 'COM', h: 12, col: '#ece8de', shop: 1, nota: 'casa vieja blanca y locales (der., f_0249): la manzana heredaba los 4 pisos del vecino' },
  ],
  via: [
    { km0: 23.30, km1: 23.44, set: { canales: 4, calzadas: 1, sep: 'ninguno', ancho: 16 } },
    { km0: 23.45, km1: 23.57, set: { canales: 2, calzadas: 1, sep: 'ninguno', ancho: 12, 'veg.L': .45, 'veg.R': .35, 'veg.palL': 0, 'veg.palR': 0 } },
    // Av. Venezuela: tres canales, brocal amarillo y copas grandes de sombra a los dos lados
    { km0: 23.58, km1: 24.14, set: { canales: 3, calzadas: 1, sep: 'ninguno', ancho: 16, 'L.tipo': 'torre de vidrio', 'R.tipo': 'torre de vidrio', 'veg.L': .55, 'veg.R': .55, 'veg.denL': 3, 'veg.denR': 3, 'veg.palL': .2, 'veg.palR': .2 } },
    { km0: 23.85, km1: 23.95, set: { 'veg.palR': 1 } },
    { km0: 24.15, km1: 24.28, set: { canales: 4, calzadas: 1, sep: 'ninguno', ancho: 18 } },
    // Av. Principal de Las Mercedes: muy ancha, sin isla, comercio bajo
    { km0: 24.45, km1: 24.99, set: { canales: 6, calzadas: 1, sep: 'ninguno', ancho: 22, 'L.tipo': COM, 'R.tipo': COM, 'L.col': ['#ecebe6', '#e2dccf', '#d8d4cb', '#cfc6b2'], 'R.col': ['#efeee9', '#e4e0d6', '#d9d3c5', '#c9ccce'], 'veg.palL': .6, 'veg.palR': .6, 'veg.L': .3, 'veg.R': .3 } },
    // 19-nov: entre 24,45 y 24,6 el video no tiene palmas (reja y copas anchas, f_0240); empiezan en f_0241
    { km0: 24.45, km1: 24.60, set: { 'veg.palL': 0, 'veg.palR': 0, 'veg.L': .4, 'veg.R': .4 } },
    // 2ª pasada (t=601–609): palmas reales altas a la izquierda y casi ninguna a la derecha frente a la oficina de bandas; palmas de dátil a los dos lados al final
    { km0: 24.61, km1: 24.85, set: { 'veg.palL': .75, 'veg.palR': .12, 'veg.R': .25 } },
    { km0: 24.86, km1: 24.99, set: { 'veg.palL': .6, 'veg.palR': .6 } },
    { km0: 25.00, km1: 25.22, set: { canales: 3, calzadas: 1, sep: 'ninguno', ancho: 15, 'L.tipo': COM, 'R.tipo': COM, 'veg.L': .55, 'veg.R': .5, 'veg.palL': 0, 'veg.palR': 0, 'veg.denL': 3 } },
    { km0: 25.10, km1: 25.21, set: { 'veg.L': .2 } },   // 21-nov: que los Mástiles se lean desde la vía (t=612,5–614,5 s)
    { km0: 25.23, km1: 25.64, set: { canales: 5, calzadas: 1, sep: 'ninguno', ancho: 20, 'L.tipo': COM, 'R.tipo': COM, 'L.col': ['#ecebe6', '#e2dccf', '#d8d4cb'], 'R.col': ['#efeee9', '#e4e0d6', '#d9d3c5'] } },
    { km0: 25.23, km1: 25.64, set: { 'veg.L': .5, 'veg.R': .45, 'veg.denL': 3, 'veg.denR': 3, 'veg.palL': .3 } },
    { km0: 25.25, km1: 25.40, set: { 'veg.palR': 1 } },
    { km0: 25.65, km1: 25.77, set: { canales: 5, calzadas: 1, sep: 'ninguno', ancho: 22 } },   // en el video el brocal amarillo separa un ramal a la DERECHA; el motor solo pone la contraria a la izquierda
    { km0: 25.78, km1: 26.42, set: { canales: 2, calzadas: 1, sep: 'ninguno', ancho: 11 } },
    { km0: 25.90, km1: 26.10, set: { 'veg.L': .95, 'veg.denL': 3, 'veg.palL': 0 } },   // izquierda bajo el viaducto: reja negra y árboles de copa ancha (t=631–634 s)
    // puente de El Ciempiés: cuatro canales en un solo sentido, parapeto de concreto a la izquierda
    { km0: 26.45, km1: 26.74, set: { canales: 4, calzadas: 1, sep: 'ninguno', ancho: 16, 'L.tipo': 'muro/terreno', 'veg.palL': 0, 'veg.palR': 0 } },
  ],
  // árboles del motor sembrados abajo a los dos lados del puente de El Ciempiés (las copas asoman sobre el parapeto, t=642–650 s)
  // y en la ladera del Tamanaco (el hotel asoma sobre copas, t=622–627 s)
  arboles: [
    // Plaza Alfredo Sadel (25,10–25,16 izq.): los árboles inventariados en OSM (úcaros, mare mare, un araguaney plateado; 2023)
    { ll: [10.482117, -66.861295], especie: 'caobo', alto: 11.5 }, { ll: [10.482178, -66.861271], especie: 'caobo', alto: 10.5 },
    { ll: [10.482178, -66.861206], especie: 'caobo', alto: 12.0 },
    { ll: [10.482102, -66.861234], especie: 'caobo', alto: 11.0 },
    { ll: [10.482135, -66.861358], especie: 'apamate', alto: 10.5 }, { ll: [10.482206, -66.861345], especie: 'apamate', alto: 9.5 },
    { ll: [10.482302, -66.861531], especie: 'apamate', alto: 10.0 }, { ll: [10.482274, -66.86148], especie: 'apamate', alto: 11.0 },
    { ll: [10.482268, -66.861537], especie: 'apamate', alto: 9.0 }, { ll: [10.482341, -66.861532], especie: 'apamate', alto: 10.5 },
    { ll: [10.48225, -66.861306], especie: 'araguaney', alto: 9.0 },
    // talud arbolado sobre el muro de contención de la rampa, a la derecha (t=636–638 s): antes era foto plana en sombra
    { ll: [10.479538, -66.854451], especie: 'mijao', alto: 15.6 },
    { ll: [10.479462, -66.854371], especie: 'caobo', alto: 13.5 },
    { ll: [10.479657, -66.854322], especie: 'caobo', alto: 12.8 },
    { ll: [10.479695, -66.854365], especie: 'saman', alto: 16.3 },
    { ll: [10.47973, -66.854133], especie: 'saman', alto: 16.8 },
    { ll: [10.479814, -66.854238], especie: 'mijao', alto: 17.2 },
    { ll: [10.4799, -66.854094], especie: 'caobo', alto: 17.0 },
    { ll: [10.479861, -66.854049], especie: 'saman', alto: 12.5 },
    { ll: [10.480085, -66.854081], especie: 'caobo', alto: 16.8 },
    { ll: [10.479971, -66.853968], especie: 'mango', alto: 15.5 },
    { ll: [10.480046, -66.853858], especie: 'caobo', alto: 17.1 },
    { ll: [10.480118, -66.853917], especie: 'saman', alto: 15.7 },
    { ll: [10.480256, -66.853829], especie: 'saman', alto: 17.7 },
    { ll: [10.480248, -66.853824], especie: 'caobo', alto: 16.1 },
    { ll: [10.480403, -66.853733], especie: 'saman', alto: 15.2 },
    { ll: [10.480221, -66.853605], especie: 'mijao', alto: 12.5 },
    { ll: [10.480499, -66.853597], especie: 'saman', alto: 13.7 },
    { ll: [10.480297, -66.853455], especie: 'saman', alto: 15.8 },
    { ll: [10.48039, -66.853298], especie: 'mijao', alto: 15.4 },
    { ll: [10.480479, -66.853367], especie: 'caobo', alto: 18.2 },
    { ll: [10.480655, -66.853279], especie: 'saman', alto: 14.5 },
    { ll: [10.480706, -66.853326], especie: 'mijao', alto: 18.1 },
    { ll: [10.480804, -66.85318], especie: 'caobo', alto: 17.7 },
    { ll: [10.480824, -66.853201], especie: 'mijao', alto: 18.4 },
    { ll: [10.480916, -66.853052], especie: 'caobo', alto: 15.6 },
    { ll: [10.480913, -66.85305], especie: 'caobo', alto: 15.4 },
    { ll: [10.481012, -66.852896], especie: 'mijao', alto: 15.4 },
    { ll: [10.481041, -66.852932], especie: 'mango', alto: 18.9 },
    { ll: [10.481054, -66.852659], especie: 'mango', alto: 20.0 },
    { ll: [10.481208, -66.852869], especie: 'caobo', alto: 15.2 },
    { ll: [10.481203, -66.852595], especie: 'saman', alto: 12.3 },
    { ll: [10.481321, -66.852748], especie: 'mijao', alto: 14.1 },
    { ll: [10.481317, -66.852534], especie: 'mango', alto: 18.6 },
    { ll: [10.48139, -66.85261], especie: 'saman', alto: 12.7 },
    { ll: [10.481434, -66.852486], especie: 'caobo', alto: 12.1 },
    { ll: [10.481481, -66.85252], especie: 'mijao', alto: 13.0 },
    { ll: [10.482022, -66.85221], especie: 'caobo', alto: 17.4 },
    { ll: [10.48176, -66.852112], especie: 'mijao', alto: 8.5 },
    { ll: [10.482083, -66.852094], especie: 'mijao', alto: 16.3 },
    { ll: [10.4818, -66.851988], especie: 'saman', alto: 8.5 },
    { ll: [10.482092, -66.851962], especie: 'saman', alto: 15.4 },
    { ll: [10.481811, -66.851852], especie: 'caobo', alto: 8.5 },
    { ll: [10.48217, -66.851868], especie: 'saman', alto: 18.5 },
    { ll: [10.481877, -66.851728], especie: 'caobo', alto: 8.5 },
    { ll: [10.482238, -66.851771], especie: 'mango', alto: 17.5 },
    { ll: [10.481927, -66.851599], especie: 'mijao', alto: 8.5 },
    { ll: [10.482289, -66.851678], especie: 'caobo', alto: 15.6 },
    { ll: [10.482001, -66.851471], especie: 'caobo', alto: 8.5 },
    { ll: [10.482343, -66.851574], especie: 'saman', alto: 18.4 },
    { ll: [10.482082, -66.851357], especie: 'saman', alto: 8.5 },
    { ll: [10.482414, -66.85148], especie: 'mango', alto: 17.8 },
    { ll: [10.482156, -66.851239], especie: 'mango', alto: 8.5 },
    { ll: [10.482514, -66.851423], especie: 'caobo', alto: 19.7 },
    { ll: [10.482303, -66.851184], especie: 'mango', alto: 8.5 },
    { ll: [10.482612, -66.851346], especie: 'caobo', alto: 17.7 },
    { ll: [10.482378, -66.851069], especie: 'saman', alto: 8.5 },
    { ll: [10.482688, -66.851241], especie: 'mango', alto: 15.9 },
    { ll: [10.482773, -66.851139], especie: 'mijao', alto: 18.4 },
    { ll: [10.482885, -66.851067], especie: 'saman', alto: 18.5 },
    { ll: [10.482676, -66.850834], especie: 'saman', alto: 20.7 },
    { ll: [10.48299, -66.850975], especie: 'caobo', alto: 15.4 },
    { ll: [10.483094, -66.850887], especie: 'mango', alto: 18.9 },
    { ll: [10.483199, -66.850788], especie: 'saman', alto: 16.7 },
    { ll: [10.483243, -66.850653], especie: 'caobo', alto: 17.1 },
    { ll: [10.483354, -66.85055], especie: 'mango', alto: 16.0 },
    { ll: [10.483364, -66.850401], especie: 'saman', alto: 16.3 },
    { ll: [10.483429, -66.85028], especie: 'caobo', alto: 16.5 },
    { ll: [10.483483, -66.850144], especie: 'saman', alto: 15.5 },
    { ll: [10.483519, -66.85001], especie: 'mijao', alto: 16.7 },
    { ll: [10.483517, -66.849863], especie: 'saman', alto: 20.2 },
    { ll: [10.47797, -66.856387], especie: 'caobo', alto: 17.8 },
    { ll: [10.477977, -66.856293], especie: 'saman', alto: 14.2 },
    { ll: [10.477906, -66.856374], especie: 'ceiba', alto: 18.8 },
    { ll: [10.477893, -66.856411], especie: 'mango', alto: 15.9 },
    { ll: [10.478048, -66.856369], especie: 'mango', alto: 17.8 },
    { ll: [10.478131, -66.856301], especie: 'saman', alto: 16.2 },
    { ll: [10.478379, -66.856178], especie: 'ceiba', alto: 15.8 },
    { ll: [10.478041, -66.856338], especie: 'ceiba', alto: 13.4 },
    { ll: [10.47782, -66.856458], especie: 'mango', alto: 13.8 },
    { ll: [10.478055, -66.856148], especie: 'mango', alto: 16.8 },
    { ll: [10.47834, -66.856066], especie: 'saman', alto: 19.1 },
    { ll: [10.478072, -66.85615], especie: 'caobo', alto: 19.7 },
    { ll: [10.47814, -66.856224], especie: 'saman', alto: 18.9 },
    { ll: [10.478328, -66.856011], especie: 'ceiba', alto: 15.2 },
    { ll: [10.477981, -66.856529], especie: 'caobo', alto: 16.4 },
    { ll: [10.478193, -66.856184], especie: 'mango', alto: 19.7 },
    { ll: [10.47803, -66.856196], especie: 'saman', alto: 18.3 },
    { ll: [10.478031, -66.856424], especie: 'saman', alto: 17.9 },
    { ll: [10.47795, -66.856386], especie: 'mango', alto: 15.5 },
    { ll: [10.477972, -66.856443], especie: 'caobo', alto: 17.5 },
    { ll: [10.478217, -66.856284], especie: 'mango', alto: 18.6 },
    { ll: [10.478305, -66.856163], especie: 'mango', alto: 14.4 },
    // calle La Guairita, izquierda (26,75–26,88, t=653–657 s): copas tras el parapeto y la verja, entre la calle y el puente de la Río de Janeiro
    { ll: [10.483491, -66.849871], especie: 'caobo', alto: 14.6 },
    { ll: [10.483506, -66.849773], especie: 'caobo', alto: 11.3 },
    { ll: [10.483506, -66.849677], especie: 'mango', alto: 15.0 },
    { ll: [10.483515, -66.849581], especie: 'saman', alto: 13.6 },
    { ll: [10.483497, -66.849486], especie: 'saman', alto: 15.1 },
    { ll: [10.483476, -66.849300], especie: 'caobo', alto: 15.1 },
    { ll: [10.483482, -66.849204], especie: 'mango', alto: 12.0 },
    { ll: [10.483451, -66.849115], especie: 'mango', alto: 11.4 },
    { ll: [10.483443, -66.849021], especie: 'mijao', alto: 13.5 },
    { ll: [10.483411, -66.848933], especie: 'mijao', alto: 12.4 },
    { ll: [10.483412, -66.848837], especie: 'apamate', alto: 15.2 },
    { ll: [10.483361, -66.848755], especie: 'mango', alto: 13.9 },
  ],
  relieve: [
    { km0: 25.76, km1: 25.98, lado: 'R', d0: 29, d1: 70, dh: 16, d2: 125, d3: 140, rampa: 40, nota: 'cerro del Hotel Tamanaco detrás del viaducto: en el video el hotel asoma por encima del tablero (t=622–627 s); el DEM lo deja bajo' },
    // 20-nov: el talud de la autopista solo hasta el paso bajo ella (detrás del murete y del muro de contención del módulo), terreno a nivel
    // con edificios en 26,21–26,27 y el cerro del corte de roca (26,275–26,37) detrás de la cara de roca del módulo
    { km0: 26.12, km1: 26.20, lado: 'R', d0: 16, d1: 20, dh: 5, d2: 45, d3: 70, rampa: 12, nota: 'talud de grama de la autopista tras el murete (t=636,5–638,5)' },
    { km0: 26.28, km1: 26.365, lado: 'R', d0: 13, d1: 18, dh: 9, d2: 60, d3: 90, rampa: 12, nota: 'cerro del corte de roca a la derecha (t=641,5–643,25)' },
    { km0: 26.45, km1: 26.76, lado: 'L', d0: 9, d1: 18, dh: -10, d2: 110, d3: 135, rampa: 25, nota: 'el valle del Guaire y la autopista bajo el puente de El Ciempiés (f_0258–0260)' },
  ],
  // la cubierta genérica de 24,36–24,44 juntaba la autopista y el Elevado de Las Mercedes; la de 25,74–25,90 era un tablero
  // centrado de 50 m donde el viaducto real corre a la derecha y en diagonal: ambos se rehacen (el viaducto, en landmarks/zona_mercedes.js)
  quitaEstructuras: [[24.30, 24.45], [25.70, 25.95]],
  sinBaranda: [[26.40, 26.76]],   // 20-nov: sin el paño amarillo del elevado; el parapeto real va en landmarks/zona_mercedes.js §4
  estructuras: [
    { tipo: 'cubierta', km0: 24.345, km1: 24.395, alto: 7, ancho: 52, nota: 'Autopista Francisco Fajardo (Gran Cacique Guaicaipuro) sobre la Av. Venezuela' },
  ],
};
