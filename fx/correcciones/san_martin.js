// Correcciones de la zona san_martin (km 3,1–6,2): El Silencio → Av. San Martín → Artigas. Contrato en fx/correcciones/LEEME.md
// 18-nov: el trazado de 3,30–7,16 se rehízo sobre el eje de la calzada suroeste (build/02_build.py); antes zigzagueaba hasta 11 m.
// Referencia: video en carro, fotogramas f_0033–f_0064 (s 80–158) y cuadros extra del video.
// Desfase del índice de fotogramas: va POR DELANTE del km del juego, y crece a lo largo de la avenida:
//   Plaza O'Leary 3,06 ↔ s 80 (índice 3,07, +0,0) · Iglesia de Lourdes 4,38 ↔ s 117,5 (índice 4,49, +0,11)
//   viaducto de La Araña 4,95 ↔ s 134,3 (índice 5,12, +0,17) · pasarela OSM 5,277 ↔ s 142,5 (índice 5,51, +0,23)
//   C.C. San Martín 5,60 ↔ s 148 (índice 5,75, +0,15) · C.C. Los Molinos 5,85 ↔ s 152,5 (índice 5,95, +0,10).
// Lo singular (Elevado San Martín, Iglesia N. S. de Lourdes y Plaza Italia, columnas y murales del viaducto, pasarela tricolor,
// letreros de Híper Líder / C.C. San Martín / Lotería de Caracas / Los Molinos, marquesinas del Metro) está a mano en landmarks/zona_san_martin.js.
const BL = '#efece4', BL2 = '#e7e3d8';   // blanco de los bloques de El Silencio
export default {
  edif: [
    // ── El Silencio (km 3,1–3,45; f_0033–0037): bloques blancos de 4–6 pisos con balcones y arcadas en planta baja
    { ll: [10.503649, -66.920357], a: 'RES', pisos: 6, col: BL, shop: 1, old: 1, alt: 0, nota: 'Bloque 1 de El Silencio, km 3,10 der. (f_0033)' },
    // km 3,13: la esquina redondeada del Bloque 1 (huella con la arcada) se metía en el borde derecho; recortada a 7,5 m del eje
    { ll: [10.502943, -66.920025], quitar: true, nota: 'esquina del Bloque 1 metida en la calzada, km 3,13 der.' },
    { poly: [[10.503414, -66.919864], [10.504, -66.919731], [10.504312, -66.91973], [10.504798, -66.919835], [10.504738, -66.91993], [10.504181, -66.920125], [10.503564, -66.920294], [10.503184, -66.92037], [10.502778, -66.920481], [10.503301, -66.920674], [10.503611, -66.920702], [10.503809, -66.920442], [10.504062, -66.920689], [10.50413, -66.921038], [10.503793, -66.920921], [10.503143, -66.920794], [10.502941, -66.9207], [10.502615, -66.920467], [10.502685, -66.920371], [10.502745, -66.920297], [10.502803, -66.920227], [10.50286, -66.920159], [10.502918, -66.920096], [10.50298, -66.920042], [10.503046, -66.919996], [10.503118, -66.919958], [10.503176, -66.919934]],
      a: 'RES', pisos: 6, col: BL, shop: 1, old: 1, alt: 0, nota: 'Bloque 1 recortado a 7,5 m del eje' },
    { ll: [10.502934, -66.918753], a: 'RES', pisos: 5, col: BL, shop: 1, old: 1, alt: 0, nota: 'Bloque 2' },
    { ll: [10.502443, -66.920033], a: 'RES', pisos: 5, col: BL2, shop: 1, old: 1, alt: 0, nota: 'bloque blanco tras la plaza, km 3,18 izq.' },
    { ll: [10.502666, -66.920969], a: 'RES', pisos: 6, col: BL, shop: 1, old: 1, alt: 0, nota: 'Bloque 5 de El Silencio: arcada con portada ornamentada, km 3,24 der. (f_0033–0035)' },
    { ll: [10.501318, -66.920809], a: 'RES', pisos: 4, col: BL, shop: 1, old: 1, alt: 0, nota: 'bloque blanco de 4 pisos con arcada gris, km 3,32 izq. (f_0036)' },
    { ll: [10.501170, -66.921651], a: 'RES', pisos: 4, col: BL2, shop: 1, old: 1, alt: 0, nota: 'km 3,40 izq. (f_0037)' },
    { ll: [10.501331, -66.922843], a: 'RES', pisos: 5, col: BL, shop: 1, old: 1, alt: 0, nota: 'bloque de esquina con arcada y balcones, km 3,50 der. (f_0037–0038)' },
    { ll: [10.501742, -66.920872], a: 'RES', pisos: 4, col: BL, shop: 1, old: 1, alt: 0, nota: 'huella dentro del bloque de 4 pisos del km 3,32 izq. (auditoría 19-nov: con 10 pisos su ll le subía el bloque entero a 10)' },
    { ll: [10.501542, -66.921271], a: 'COM', h: 5, col: BL2, shop: 1 },
    { ll: [10.502309, -66.921585], a: 'COM', h: 5, col: BL2, shop: 1 },
    { ll: [10.502367, -66.921670], a: 'COM', h: 5, col: BL2, shop: 1 },
    // torres de ladrillo de fondo (f_0036–0038)
    { ll: [10.500985, -66.921210], a: 'RES', pisos: 28, col: '#b8603e', shop: 0, alt: 1, nota: 'torre de ladrillo al fondo izq. (f_0037)' },
    // ── Inicio de la Av. San Martín (km 3,45–3,7; f_0038–0039)
    { ll: [10.500644, -66.921921], a: 'RES', pisos: 7, col: '#bc6640', shop: 1, alt: 1, nota: 'edificio de ladrillo naranja con locales, km 3,46 izq. (f_0038)' },
    { ll: [10.499953, -66.922441], a: 'RES', pisos: 4, col: '#7e4c38', alt: 1, shop: 1, nota: 'comercial marrón de franja roja, km 3,55 izq. (f_0039)' },
    { ll: [10.500751, -66.923823], a: 'COM', pisos: 3, col: '#8f979e', shop: 1, nota: 'locales grises con santamarías (Belikard), km 3,62 der. (f_0039)' },
    // km 3,58: la huella de los locales Belikard invadía el borde derecho; recortada a 7,5 m del eje (la fachada sigue en la acera)
    { ll: [10.500519, -66.923221], quitar: true, nota: 'esquina de la huella de Belikard metida en la calzada, km 3,58 der.' },
    { poly: [[10.500583, -66.923234], [10.500697, -66.923327], [10.500728, -66.923269], [10.500774, -66.923358], [10.501138, -66.923561], [10.500987, -66.923841], [10.50102, -66.92386], [10.501152, -66.923616], [10.501247, -66.923669], [10.50125, -66.923664], [10.501315, -66.923792], [10.501195, -66.924015], [10.500711, -66.923745], [10.500681, -66.923801], [10.500556, -66.923731], [10.500598, -66.923813], [10.500564, -66.923831], [10.50044, -66.923762], [10.50059, -66.924055], [10.50072, -66.923815], [10.501111, -66.924033], [10.50107, -66.924109], [10.500781, -66.923948], [10.500771, -66.92393], [10.500605, -66.924238], [10.500345, -66.924092], [10.500316, -66.924153], [10.499955, -66.924344], [10.49993, -66.924295], [10.500241, -66.923724]],
      a: 'COM', pisos: 3, col: '#8f979e', shop: 1, nota: 'Belikard recortado a 7,5 m del eje' },
    { ll: [10.499838, -66.923242], a: 'COM', pisos: 2, col: '#e6e4dc', shop: 1, nota: 'local blanco entre árboles, km 3,63 izq.' },
    // ── Primer km de la avenida (km 3,7–3,95; f_0040–0042): comercio popular de 3–7 pisos, torre turquesa
    { ll: [10.499947, -66.924550], a: 'RES', pisos: 11, col: '#34ac98', shop: 1, alt: 1, nota: 'torre turquesa, km 3,74 der. (f_0040)' },
    { ll: [10.499685, -66.924657], a: 'RES', pisos: 5, col: '#e2b84c', alt: 1, shop: 1, nota: 'edificio amarillo ocre de locales, km 3,77 der. (f_0040)' },
    { ll: [10.499780, -66.924773], a: 'RES', pisos: 7, col: '#ecebe5', shop: 1, alt: 1 },
    { ll: [10.500067, -66.924720], a: 'RES', pisos: 6, col: '#e9e1cf', shop: 0, rail: 1 },
    { ll: [10.499473, -66.925115], a: 'RES', pisos: 5, col: '#efefeb', alt: 1, shop: 1, nota: 'edificio blanco de ventanas con marco azul (Nofa), km 3,82 der. (f_0041)' },
    { ll: [10.499414, -66.924971], a: 'COM', pisos: 2, col: '#d8d2c4', shop: 1 },
    { ll: [10.499131, -66.924788], a: 'RES', pisos: 8, col: '#4572b8', shop: 1, alt: 1, nota: 'edificio azul y blanco con mural, km 3,81 izq. (f_0041)' },
    { ll: [10.499132, -66.925851], a: 'COM', pisos: 3, col: '#bf573d', shop: 1, nota: 'locales de ladrillo rojo (China Car, Tecno Farma, Todo Hogar), km 3,91 der. (f_0042)' },
    { ll: [10.498540, -66.926182], a: 'COM', pisos: 2, col: '#f1f0ec', shop: 1 },
    // ── Torres de Capuchinos a la izquierda (km 3,95–4,15; f_0043–0045): blancas y verde-turquesa de 20–30 pisos
    { ll: [10.498107, -66.925969], a: 'RES', pisos: 18, col: '#dce9e2', shop: 1, alt: 1, nota: 'torre de franjas verde-turquesa, km 3,97 izq. (f_0043–0044)' },
    { ll: [10.497748, -66.926659], a: 'RES', pisos: 26, col: '#d9cdb2', shop: 0, alt: 1, nota: 'torre beige esbelta (f_0044)' },
    { ll: [10.497639, -66.926835], a: 'RES', pisos: 26, col: '#efeee9', shop: 0, alt: 1 },
    { ll: [10.497519, -66.926521], a: 'RES', pisos: 24, col: '#e4e6e0', shop: 0, alt: 1 },
    { ll: [10.497393, -66.926703], a: 'RES', pisos: 28, col: '#e8e4da', shop: 0, alt: 1 },
    { ll: [10.497625, -66.925993], a: 'RES', pisos: 22, col: '#ecefea', shop: 0, alt: 1, nota: 'torre blanca de ventanas verdes (f_0044)' },
    { ll: [10.497871, -66.925841], a: 'RES', pisos: 26, col: '#ecebe4', shop: 0, alt: 1 },
    // auditoría 19-nov: la huella grande (7.030 m²) es la parcela de las torres de Capuchinos; los ll de tres torres caen dentro y la
    // subían a 84 m (un muro de 90 m de largo). Va de basamento comercial de 2 pisos y DESPUÉS de las torres para que mande sobre ellas
    { ll: [10.497748, -66.926100], a: 'COM', pisos: 2, col: '#d9d6cc', shop: 1, nota: 'basamento de las torres de Capuchinos, km 4,04 izq.' },
    { ll: [10.497030, -66.927268], a: 'RES', pisos: 9, col: '#e9e6dd', shop: 1, alt: 1 },
    // derecha (f_0044–0045): torre rosada, edificio gris de lámina y uno azul de planta baja
    { ll: [10.498546, -66.926814], a: 'RES', pisos: 5, col: '#8e959a', alt: 1, shop: 1, nota: 'edificio gris de lámina, km 4,02 der. (f_0045)' },
    // km 4,16–4,2: con el trazado sobre la calzada real (18-nov) la huella del edificio azul quedaba a 1,8 m del eje y el build la
    // descartaba; se repone recortada a 7,5 m del eje
    { poly: [[10.497571, -66.927763], [10.497561, -66.927826], [10.497733, -66.927854], [10.497751, -66.927747], [10.497805, -66.927756], [10.497812, -66.927709], [10.497802, -66.927708], [10.497825, -66.927567], [10.497966, -66.92759], [10.497957, -66.927647], [10.497913, -66.927639], [10.497903, -66.9277], [10.497875, -66.927696], [10.497843, -66.927894], [10.497763, -66.927881], [10.497751, -66.927957], [10.497434, -66.927904], [10.497499, -66.927751]],
      a: 'COM', pisos: 3, col: '#3b6fb4', shop: 1, nota: 'edificio azul de 3 pisos, km 4,16 der. (f_0045), recortado a 7,5 m' },
    { ll: [10.498258, -66.927571], a: 'RES', pisos: 15, col: '#e1a1ac', shop: 0, alt: 1, nota: 'torre rosada al fondo der. (f_0044)' },
    // ── Elevado San Martín y Plaza Italia (km 4,15–4,5; s 112–121)
    { ll: [10.496735, -66.928016], a: 'RES', pisos: 20, col: '#d8a5b3', shop: 1, alt: 1, nota: 'torre rosada con mural, km 4,23 izq. (s 114)' },
    { ll: [10.496821, -66.928504], a: 'RES', pisos: 22, col: '#ecebe6', shop: 0, alt: 1, nota: 'torre blanca de mural verde-azul (s 114)' },
    // auditoría 19-nov: el Pacífico va ANTES del recorte gris (su ll cae dentro del recorte; el recorte, que va después, manda sobre sí mismo)
    { ll: [10.497263, -66.928687], a: 'BRI', pisos: 9, col: '#d6c18e', shop: 1, nota: 'Edificio Pacífico (INCES): oficinas beige de ventanas corridas, km 4,28 der. (s 116)' },
    // km 4,26: la huella del edificio gris cruza el eje nuevo (una esquina empujada por el build al otro lado): fuera y recortada a 7,5 m
    { ll: [10.497309, -66.928178], quitar: true, nota: 'huella del edificio gris atravesada en la calzada, km 4,26 (auditoría 19-nov: el ll anterior caía dentro del recorte y lo borraba también)' },
    { poly: [[10.497393, -66.928359], [10.497374, -66.928354], [10.49724, -66.928585], [10.4972, -66.928576], [10.49724, -66.928429], [10.49739, -66.928015], [10.497936, -66.927909], [10.497913, -66.927994], [10.497748, -66.928016], [10.497705, -66.928177], [10.497736, -66.928185], [10.497646, -66.928522], [10.497727, -66.928703], [10.497624, -66.928675], [10.497572, -66.928765], [10.497465, -66.928736], [10.497437, -66.928839], [10.497312, -66.928805], [10.4973, -66.928851], [10.497502, -66.928907], [10.497511, -66.928973], [10.497567, -66.928876], [10.497532, -66.929005], [10.497471, -66.928988], [10.497462, -66.929022], [10.497133, -66.928931], [10.497113, -66.928771], [10.497185, -66.928579], [10.497322, -66.928626]],
      a: 'RES', pisos: 5, col: '#c9c9c4', alt: 1, shop: 1, nota: 'edificio gris claro de 5 pisos, km 4,26 der. (s 112–114), recortado a 7,5 m' },
    { ll: [10.495923, -66.929395], a: 'RES', pisos: 18, col: '#e6e2d6', shop: 1, alt: 1, nota: 'detrás del elevado, km 4,41 izq.' },
    // la iglesia y la plaza van a mano: fuera las huellas genéricas de la manzana
    { ll: [10.496962, -66.929781], quitar: true, nota: 'torrecita de 38 m sobre la iglesia (la iglesia va en zona_san_martin)' },
    { ll: [10.497479, -66.929539], quitar: true },
    { ll: [10.497448, -66.929327], quitar: true },
    { ll: [10.497345, -66.929078], quitar: true, nota: 'Plaza Italia' },
    // ── Maternidad (km 4,45–4,8; f_0049–0052)
    // km 4,44: igual que el edificio azul (su huella cruzaba el eje nuevo): repuesta recortada a 7,5 m
    { poly: [[10.496596, -66.930107], [10.496601, -66.930077], [10.496762, -66.929696], [10.496776, -66.929698], [10.49675, -66.929836], [10.496868, -66.929859], [10.496884, -66.929828], [10.496946, -66.92984], [10.496933, -66.929908], [10.497029, -66.929958], [10.496984, -66.930199], [10.496901, -66.930183], [10.496891, -66.930202], [10.496987, -66.930228], [10.496995, -66.930188], [10.497076, -66.930204], [10.497087, -66.930145], [10.497164, -66.930159], [10.497137, -66.930302], [10.497095, -66.930294], [10.497102, -66.930257], [10.49705, -66.930247], [10.49704, -66.930301], [10.496924, -66.930242], [10.49679, -66.930215], [10.496759, -66.930302], [10.496527, -66.930257], [10.49659, -66.930105]],
      a: 'COM', pisos: 3, col: '#efede6', shop: 1, nota: 'casa blanca de friso verde y zócalo amarillo, km 4,44 der. (f_0049), recortada a 7,5 m' },
    { ll: [10.496779, -66.930464], a: 'RES', pisos: 4, col: '#b8603f', alt: 1, shop: 0, nota: 'ladrillo, km 4,49 der. (f_0049)' },
    { ll: [10.496998, -66.930425], a: 'RES', pisos: 4, col: '#c46a44', shop: 0, rail: 1 },
    { ll: [10.495593, -66.931089], a: 'RES', pisos: 3, col: '#e2b23a', shop: 0, old: 1, alt: 1, nota: 'Maternidad Concepción Palacios: amarillo con molduras blancas, km 4,59 izq. (f_0050)' },
    { ll: [10.495241, -66.931683], a: 'RES', pisos: 9, col: '#ebe8dd', shop: 0, alt: 1, nota: 'Maternidad, cuerpo alto' },
    { ll: [10.495842, -66.930006], a: 'RES', pisos: 4, col: '#e3b53e', shop: 0, rail: 1, old: 1 },
    { ll: [10.496539, -66.932043], a: 'RES', pisos: 9, col: '#e2a24e', shop: 1, alt: 1, nota: 'edificio ocre-naranja de aires acondicionados, km 4,66 der. (f_0050)' },
    { ll: [10.495829, -66.932584], a: 'RES', pisos: 24, col: '#efeee8', shop: 1, alt: 1, nota: 'Torre A: blanca de 24 pisos, km 4,74 der. (f_0051)' },
    { ll: [10.495869, -66.932832], a: 'RES', pisos: 18, col: '#e6e3da', shop: 0, alt: 1 },
    // km 4,81: caseta de 5 m que entró con el trazado nuevo a 5,7 m del eje, en la acera de la boca del Metro (la marquesina va a mano)
    { ll: [10.495353, -66.933304], quitar: true, nota: 'caseta sobre la acera del Metro Maternidad, km 4,81 der.' },
    { ll: [10.495483, -66.933554], a: 'RES', pisos: 7, col: '#dcc761', shop: 0, rail: 1, alt: 0, nota: 'Bloque 1: amarillo de 7 pisos con balcones, km 4,85 der. (f_0052)' },
    { ll: [10.496076, -66.932878], a: 'RES', pisos: 7, col: '#d6c05a', shop: 0, rail: 1 },
    { ll: [10.495889, -66.932825], a: 'RES', pisos: 7, col: '#cdbd60', shop: 0, rail: 1 },
    { ll: [10.495859, -66.933635], a: 'RES', pisos: 7, col: '#c9bc5c', shop: 0, rail: 1, nota: 'Bloque 2' },
    { ll: [10.494590, -66.933619], a: 'COM', pisos: 2, col: '#2c5fa6', shop: 1, nota: 'Banco Mercantil, km 4,90 izq. (s 131)' },
    // ── Pasado el viaducto (km 5,0–5,25; s 136–140)
    { ll: [10.494754, -66.935014], a: 'COM', h: 9, col: '#e8742a', shop: 1, alt: 1, nota: 'Supermercado Día a Día: lámina naranja con base azul, km 5,02 der. (s 136; f_0055)' },
    { ll: [10.493644, -66.934766], a: 'RES', pisos: 6, col: '#d8b45e', shop: 1, alt: 1, nota: 'oficinas ocre de ventanas corridas, km 5,07 izq. (s 136)' },
    { ll: [10.493070, -66.935867], a: 'RES', pisos: 20, col: '#c4683f', shop: 0, alt: 1, nota: 'torre de ladrillo naranja, km 5,21 izq. (s 137–139)' },
    { ll: [10.493523, -66.935192], a: 'RES', pisos: 8, col: '#e0d8c6', shop: 0, alt: 1, nota: 'Conjunto Residencial Artigas' },
    // km 5,06–5,12: con el trazado nuevo entra la huella OSM de la manzana entera (antes la descartaba el build) y tapa las dos
    // huellas pequeñas de antes: la manzana lleva el galpón y la esquina beige se repone con su huella de antes
    { poly: [[10.494409, -66.935288], [10.494477, -66.935313], [10.494459, -66.935365], [10.494391, -66.93534]], a: 'RES', pisos: 4, col: '#d6c9ab', shop: 1, old: 1, nota: 'esquina beige de 4 pisos con balcones, km 5,06 der. (s 137,5)' },
    { ll: [10.494551, -66.935580], a: 'GAL', h: 7, col: '#e9e7e2', shop: 1, nota: 'galpón blanco con santamarías y grafiti (manzana OSM), km 5,12 der. (s 139)' },
    // ── Pasarela e Híper Líder (km 5,25–5,45; f_0057–0058)
    // la huella OSM de la manzana (21 vértices) cruzaba la calzada; con el trazado nuevo el build ya la descarta (un vértice a < 3,5 m
    // del eje) y aquí solo se rehace por piezas
    { poly: [[10.493209, -66.936726], [10.492958, -66.937098], [10.493205, -66.937251], [10.493437, -66.936906]], a: 'COM', h: 16, col: '#f4f3ef', shop: 1, alt: 1, detalle: 0, mural: 0, nota: 'Híper Líder San Martín: caja blanca con letras rojas (letrero a mano), km 5,27–5,32 der. (f_0058)' },
    { poly: [[10.493499, -66.936379], [10.493366, -66.93653], [10.493465, -66.936617], [10.493596, -66.936469]], a: 'COM', pisos: 3, col: '#b5532f', shop: 1, nota: 'locales de ladrillo (Reicolor), km 5,22 der. (s 141)' },
    { poly: [[10.493366, -66.93653], [10.493238, -66.936681], [10.493354, -66.936777], [10.493479, -66.936629]], a: 'RES', pisos: 8, col: '#c58b6c', shop: 1, alt: 0, nota: 'edificio salmón de balcones, km 5,25 der. (s 141; f_0057)' },
    { poly: [[10.493516, -66.936613], [10.493403, -66.936746], [10.493487, -66.936815], [10.493598, -66.936686]], a: 'RES', pisos: 13, col: '#efeee9', shop: 0, alt: 1, nota: 'torre blanca detrás, km 5,25 der. (f_0057)' },
    { ll: [10.492801, -66.937453], a: 'RES', pisos: 9, col: '#e3d6c0', shop: 1, alt: 1 },
    { ll: [10.493062, -66.937834], a: 'RES', pisos: 12, col: '#efeeea', shop: 1, alt: 1, nota: 'torre blanca, km 5,39 der. (f_0057)' },
    { ll: [10.492522, -66.938409], a: 'COM', pisos: 2, col: '#b5532f', shop: 1, nota: 'locales de ladrillo (Daka), km 5,47 der.' },
    { ll: [10.492491, -66.938813], a: 'RES', pisos: 10, col: '#e3d9c4', shop: 1, alt: 0, nota: 'Edificio Metro Palace' },
    { ll: [10.492457, -66.937101], a: 'COM', pisos: 3, col: '#c9cfcf', shop: 1 },
    // ── C.C. San Martín (izq., km 5,45–5,65; f_0059–0060): estacionamiento de concreto y bloque de ladrillo naranja sin ventanas
    { ll: [10.491493, -66.938423], a: 'BRI', pisos: 6, col: '#bdb9b0', shop: 0, detalle: 0, mural: 0, nota: 'estacionamiento del C.C. San Martín, km 5,51 izq. (s 146)' },
    { ll: [10.491774, -66.937994], a: 'BRI', pisos: 6, col: '#c2beb4', shop: 0, detalle: 0, mural: 0 },
    { ll: [10.491463, -66.939210], a: 'GAL', h: 22, col: '#b4552f', shop: 0, detalle: 0, mural: 0, nota: 'C.C. San Martín: ladrillo naranja (letras a mano), km 5,59 izq. (f_0060)' },
    { ll: [10.492208, -66.939322], a: 'COM', pisos: 2, col: '#e9e6df', shop: 1 },
    { ll: [10.492565, -66.939171], a: 'RES', pisos: 10, col: '#e4dccb', shop: 1, alt: 1 },
    // ── Lotería, Metro Artigas y Los Molinos (km 5,65–5,95; f_0061–0062)
    { ll: [10.491194, -66.940176], a: 'COM', pisos: 3, col: '#d8b45c', shop: 1, old: 1, nota: 'edificio ocre de la Lotería de Caracas (letrero a mano), km 5,72 izq. (f_0061)' },
    { ll: [10.491173, -66.940319], a: 'COM', pisos: 3, col: '#d2ad58', shop: 1, old: 1 },
    { ll: [10.491014, -66.940331], a: 'COM', pisos: 3, col: '#e8e4da', shop: 1 },
    { ll: [10.490971, -66.940515], a: 'COM', pisos: 3, col: '#ece9e1', shop: 1 },
    { ll: [10.490833, -66.940497], a: 'COM', pisos: 3, col: '#e3dccb', shop: 1 },
    { ll: [10.490945, -66.940705], a: 'COM', pisos: 3, col: '#dcd5c4', shop: 1 },
    { ll: [10.490787, -66.940658], a: 'COM', pisos: 3, col: '#e8e4da', shop: 1 },
    { ll: [10.490749, -66.940860], a: 'RES', pisos: 8, col: '#e9e6de', shop: 1, alt: 1 },
    { ll: [10.490581, -66.941143], a: 'RES', pisos: 9, col: '#ecebe5', shop: 1, alt: 1, nota: 'Teatro San Martín / torre blanca, km 5,84 izq. (f_0062)' },
    { ll: [10.491122, -66.941681], a: 'COM', h: 15, col: '#d9c28d', shop: 1, alt: 1, detalle: 0, mural: 0, nota: 'C.C. Los Molinos: caja beige con letrero (a mano), km 5,85 der. (f_0062)' },
    { ll: [10.491514, -66.941949], a: 'RES', pisos: 14, col: '#e3cf8e', shop: 0, alt: 1 },
    { ll: [10.491724, -66.940721], a: 'COM', h: 5, col: '#f0efea', shop: 1, nota: 'Granja: locales blancos con letreros rojos (s 150)' },
    { ll: [10.491860, -66.940412], a: 'COM', h: 5, col: '#c8302a', shop: 1, nota: 'KFC' },
    // ── Hasta el desvío a Bella Vista (km 5,9–6,2; f_0063)
    { ll: [10.490879, -66.942445], a: 'RES', pisos: 6, col: '#e1d4b2', shop: 1, alt: 0, nota: 'residencial beige sobre locales, km 5,93 der. (f_0063)' },
    { ll: [10.490493, -66.942482], a: 'RES', pisos: 4, col: '#a9b0b6', alt: 1, shop: 1 },
    { ll: [10.489864, -66.941414], a: 'COM', pisos: 2, col: '#eeede8', shop: 1, old: 1, nota: 'galpón viejo blanco de 2 pisos, km 5,91 izq. (f_0063)' },
    { ll: [10.489068, -66.942416], a: 'GAL', h: 9, col: '#efeee9', shop: 0, nota: 'muro blanco largo, km 6,06 izq. (f_0064)' },
    // km 6,05: la nave larga junto a la estación de servicio Artigas cruzaba la calzada porque el trazado iba 7 m a la derecha
    // del eje real. Con el trazado corregido (18-nov) su huella original queda a 8 m del eje: ya no hace falta recortarla.
    { ll: [10.489905, -66.943140], a: 'COM', h: 6.8, col: '#a99b7d', shop: 1, nota: 'nave junto a la estación Artigas, km 6,05 der.' },
  ],
  via: [
    // El Silencio: calle de un solo sentido, ancha, sin separador
    { km0: 3.10, km1: 3.40, set: { canales: 3, calzadas: 1, sep: 'ninguno', ancho: 18, 'L.col': [BL, BL2], 'R.col': [BL, BL2], 'L.tipo': 'residencial', 'R.tipo': 'residencial', 'veg.palR': .25, 'veg.R': .15, 'veg.L': .1 } },
    // Av. San Martín: baranda de malla negra sobre brocal amarillo en el separador (f_0038–0058)
    { km0: 3.42, km1: 3.62, set: { 'L.col': ['#bc6640', '#7e4c38', '#e9e4d4'], 'R.col': [BL, '#d9d4c8'] } },
    { km0: 3.62, km1: 3.95, set: { 'R.col': ['#8f979e', '#e2b84c', '#ecebe5', '#d98f9c', '#34ac98'], 'L.col': ['#e6e4dc', '#4572b8', '#e4e0d4'], 'veg.L': .35, 'veg.denL': 2, 'veg.R': .05 } },
    { km0: 3.95, km1: 4.15, set: { 'L.col': ['#ecefea', '#dce9e2', '#d9cdb2'], 'R.col': ['#3b6fb4', '#8e959a', '#efeee8', '#e1a1ac'], 'L.tipo': 'residencial', 'veg.R': .25, 'veg.L': .05 } },
    // el elevado ocupa el separador: la calzada contraria se aparta (s 112–121)
    // ancho 28: la calzada propia queda en el mínimo del motor (6,8 m a cada lado); con 34 se comía la acera de Plaza Italia, que
    // con el trazado corregido está a 7–8 m del eje
    { km0: 4.12, km1: 4.52, set: { ancho: 28, sep: 'baranda', 'L.col': ['#d8a5b3', '#ecebe6'], 'R.col': ['#c9c9c4', '#d6c18e', '#b8603f'], 'veg.R': .35, 'veg.denR': 2, 'veg.L': .05 } },
    // tras el elevado vuelve la baranda (no muro): el muro amarillo es la rampa del elevado, a mano
    { km0: 4.52, km1: 4.75, set: { sep: 'baranda', 'L.col': ['#e2b23a', '#ebe8dd'], 'R.col': ['#efede6', '#e2a24e', '#efeee8'], 'veg.L': .3, 'veg.denL': 2, 'veg.R': .15, 'veg.denR': 1 } },
    { km0: 4.75, km1: 4.92, set: { 'R.col': ['#dcc761', '#cdbd60', '#e0cd70'], 'L.col': ['#2c5fa6', '#e9e4d4'], 'R.tipo': 'residencial', 'veg.L': .5, 'veg.denL': 3, 'veg.R': .45, 'veg.denR': 2 } },
    { km0: 4.92, km1: 5.25, set: { 'L.col': ['#d8b45e', '#e0d8c6'], 'R.col': ['#e8742a', '#e9e7e2', '#d6c9ab'], 'veg.L': .05, 'veg.R': .1 } },
    { km0: 5.25, km1: 5.45, set: { 'R.col': ['#f4f3ef', '#c58b6c', '#b5532f'], 'L.col': ['#c9cfcf', '#7aa86a'], 'veg.L': .45, 'veg.denL': 2, 'veg.R': .1 } },
    // desde el estacionamiento del C.C. San Martín la baranda se acaba y queda el brocal amarillo bajo (s 146)
    { km0: 5.45, km1: 5.62, set: { sep: 'brocal amarillo', 'L.col': ['#bdb9b0', '#b4552f'], 'R.col': ['#e9e6df', '#e4dccb'], 'veg.R': .5, 'veg.denR': 2, 'veg.L': .1 } },
    { km0: 5.62, km1: 5.95, set: { 'L.col': ['#d8b45c', '#e8e4da'], 'R.col': ['#d9c28d', '#f0efea', '#c8302a'], 'veg.L': .35, 'veg.R': .15 } },
    { km0: 5.95, km1: 6.2, set: { 'L.col': ['#efeee9', '#d9d4c8'], 'R.col': ['#e1d4b2', '#a9b0b6'], 'veg.L': .3, 'veg.R': .05 } },
  ],
  relieve: [],
  estructuras: [
    // viaducto del Distribuidor La Araña / Autopista Norte-Sur: los tableros OSM cruzan la ruta entre 4,916 y 4,983 (s 133,8–135,8)
    { tipo: 'cubierta', km0: 4.913, km1: 4.987, alto: 7.5, ancho: 46, nota: 'viaducto de La Araña; columnas con murales a mano' },
  ],
  // el viaducto estaba en 4,96–5,19 (demasiado largo y corrido) y la pasarela tricolor en 5,48 (OSM: 5,277); la pasarela va a mano
  quitaEstructuras: [[4.9, 5.2], [5.4, 5.55]],
};
