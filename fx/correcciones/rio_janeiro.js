// Correcciones de la zona rio_janeiro (km 26.8–32.6). Contrato en fx/correcciones/LEEME.md
// 17-nov (calle La Guairita, 26,77–26,95, t=651–658 s; rehecha el 19-nov: una sola calzada de 3 canales, sin isla ni contraria), arbolado
// denso tras reja negra a la derecha, torre beige de 9 pisos a la izq. en el 26,96. CCCT y Cubo Negro no se distinguen en el video.
// Anclas (foto satelital Esri z18 + video): el canal del Guaire corre pegado a la IZQUIERDA (norte) desde el km 27,9 hasta el 30,8;
// paso superior de la Rampa de Caurimare en el km 28,74; intersección con semáforo y pasarela en el 30,17; puente de balaustres
// blancos de la Río de Janeiro sobre la Av. Principal de Macaracuay en el 30,51 (t=727 s del video). Retorno en el 31,3.
// Vuelta (corregida el 18-nov contra el video t=747–757 s y OSM): la ruta NO cruza el puente. Gira a la IZQUIERDA en el 31,95, ~100 m
// antes de él, por la Calle Santa Margarita (bajada corta y cruce en T con bolardos amarillos, 32,06: a la DERECHA); sigue 200 m al
// oeste por esa calle arbolada de 2 canales; a la DERECHA a la Av. Principal de Macaracuay en el 32,27; pasa POR DEBAJO del puente de
// la Río de Janeiro (32,30–32,36, carteles «Centro / California Norte» y «Dist. Boyacá / Valles del Tuy / Guarenas»), cruza el Guaire
// (32,375–32,44) y pasa bajo la autopista (32,60–32,68, túnel del t=757 s).
// NUDO DE KM: entre el 31,923 y el 32,608 el km del simulador va comprimido (D.meta.kmNudos): 0,685 km de contador cubren los ~400 m
// reales del trazado nuevo. Los km de este tramo están escritos con ese km nuevo del simulador, NO con distancias en metros; fuera del
// tramo los km no cambiaron.
// TRAZADO 2 (19-nov-2026, build/investigacion/auditoria_trazado.md): el eje de 28,79–31,61 se rehízo sobre la calzada real. La ida va
// por la calzada SUR (sentido este, separador a la izquierda, f_0278–0293) hasta el retorno, que se hace donde acaba el separador junto
// al Puente de El Llanito (km ~31,3); la vuelta va por la calzada NORTE, ~8–11 m a la IZQUIERDA de la ida (f_0296–0298: autopista
// abajo a la derecha, guardarriel). Antes la ida iba por la calzada de vuelta y por el talud. El km dentro del tramo lleva nudos cada
// 100 m (D.meta.kmNudos) para que cada lugar conserve su km; en el vértice (31,22–31,32) el contador va comprimido. Las distancias
// laterales del relieve de este tramo se recalcularon para el eje nuevo (d0 de la izquierda de la ida siempre más allá de la vuelta).
// El relieve se define una sola vez, con la ida.
export default {
  edif: [
    // filas de 25 m² en el borde del canal (km 29,98–30,04 izq.) y un kiosco en medio del cruce del 30,54: en el video no hay nada
    { ll: [10.474302, -66.822191], r: 30, quitar: true, nota: 'filas de huellas diminutas en el borde del Guaire' },
    { ll: [10.474780, -66.817471], quitar: true, nota: 'kiosco en el cruce de Macaracuay' },
    // giro a Santa Margarita (km 31,95, t=747,5 s): en el video solo hay defensa metálica y vegetación baja; fuera los locales pegados a la esquina
    { ll: [10.474347, -66.816139], quitar: true, nota: 'local bajo en la esquina del giro, km 31,96 izq.' },
    { ll: [10.474338, -66.816220], quitar: true, nota: 'local bajo en la esquina del giro, km 31,97 izq.' },
    { ll: [10.474513, -66.815886], quitar: true, nota: 'local con toldo pegado a la vuelta, km 31,94 izq.' },
    { ll: [10.474474, -66.816079], quitar: true, nota: 'edificio de 4 pisos con toldo rosado pegado a la esquina del giro, km 31,95 izq.' },
    // ── Chuao / Av. Araure (f_0262–f_0273). La ruta va por la Av. Araure; la Río de Janeiro corre paralela al norte, junto al canal.
    { ll: [10.483095, -66.849322], a: 'VID', alt: 1, pisos: 4, col: '#e9e8e3', shop: 0, nota: 'base blanca con banda de vidrio negro tras reja negra, km 26,81 der.' },
    { ll: [10.483166, -66.849551], a: 'VID', alt: 1, pisos: 6, col: '#e4e3de', shop: 0, nota: 'km 26,80 der.' },
    { ll: [10.483109, -66.848896], a: 'RES', alt: 1, pisos: 6, col: '#e6dfcf', shop: 0, nota: 'km 26,86 der.' },
    // 19-nov: la huella es la clínica Rescarven Chuao (OSM); el «toldo rojo» de f_0264 es el techo de la bomba de gasolina (landmarks/zona_mercedes.js);
    // como local de 1 piso con santamarías salía una tira de cortinas metálicas detrás de la isla
    { ll: [10.483578, -66.848937], a: 'RES', alt: 1, pisos: 4, col: '#ecebe5', shop: 0, nota: 'clínica Rescarven, blanca tras la verja, km 26,85 izq. (t=657 s)' },
    { ll: [10.483406, -66.848537], quitar: true, nota: 'bomba de gasolina km 26,89 izq.: el techo y los surtidores van en el módulo' },
    { ll: [10.483546, -66.848479], quitar: true, nota: 'bomba de gasolina' },
    { ll: [10.483533, -66.848652], a: 'COM', pisos: 1, col: '#efeee9', shop: 0, nota: 'tienda de la bomba' },
    { ll: [10.482986, -66.848503], a: 'RES', pisos: 8, col: '#e2d8c2', shop: 0, nota: 'torres crema tras muro, km 26,91 der. (f_0264)' },
    { ll: [10.482873, -66.848006], a: 'RES', pisos: 16, col: '#e7dcc4', shop: 0, nota: 'torre crema, km 26,96 der.' },
    { ll: [10.482759, -66.847661], a: 'RES', pisos: 10, col: '#ddd2bb', shop: 0, nota: 'km 27,00 der.' },
    { ll: [10.482709, -66.847393], a: 'RES', pisos: 18, col: '#e9e1cd', shop: 0, nota: 'torre crema alta, km 27,03 der.' },
    { ll: [10.482585, -66.846957], a: 'RES', pisos: 10, col: '#e3d9c4', shop: 0, nota: 'km 27,08 der. (f_0265)' },
    { ll: [10.483338, -66.847921], a: 'RES', alt: 1, pisos: 9, col: '#d4c19e', shop: 0, nota: 'torre beige de ventanas azuladas tras palmas, km 26,96 izq. (t=658 s)' },
    { ll: [10.483238, -66.847398], a: 'RES', alt: 1, pisos: 7, col: '#a8694a', shop: 0, nota: 'edificio de ladrillo con bandas crema, km 27,02 izq. (f_0265)' },
    { ll: [10.483115, -66.847083], a: 'RES', alt: 1, pisos: 6, col: '#b07a58', shop: 0, nota: 'km 27,05 izq.' },
    { ll: [10.483022, -66.846724], a: 'RES', pisos: 9, col: '#dcd3c3', shop: 0, nota: 'km 27,09 izq.' },
    { ll: [10.482894, -66.846278], a: 'VID', pisos: 3, col: '#1f2529', shop: 0, nota: 'edificio negro de vidrio con base de concreto, km 27,14 izq. (f_0266)' },
    { ll: [10.481972, -66.844163], a: 'COM', pisos: 2, col: '#7ccfc2', shop: 1, nota: 'local verde agua con letrero, km 27,39 der. (f_0268)' },
    // 22-nov, «en Chuao hay como un supermercado antes de entrar a la Río» (Alejandro): Supermercado Gama Express (OSM way 713231141,
    // km 27,64 der.), visto en el video t=676,25–677,75 (faja roja «Gama», vidrio, «Farmacia 24» y «Bodegón»; el índice va ~0,4 km
    // ADELANTADO aquí: t=677,5 marca 28,06). Se modela en landmarks/zona_rio_janeiro.js; aquí se quita su extrusión genérica.
    { ll: [10.481364, -66.841955], quitar: true, nota: 'Gama Express: cuerpo, faja y vidriera en el módulo' },
    { ll: [10.481332, -66.841621], a: 'VID', alt: 1, pisos: 4, col: '#6f95c8', shop: 0, nota: 'Panadería Laedy (OSM): blanco con ventanales azules y la panadería y la barbería abajo, km 27,67 der. (t=677,75)' },
    { ll: [10.482024, -66.844410], a: 'COM', alt: 1, pisos: 2, col: '#eeeeeb', shop: 0, nota: 'Bicimanía (OSM; letrero «Bike» en el video t=668–670), blanco, km 27,37 der.' },
    { ll: [10.482265, -66.845792], a: 'COM', alt: 1, pisos: 2, col: '#f3f3f1', shop: 0, nota: 'Farmatodo (OSM), km 27,21 der.; el letrero va en el módulo' },
    { ll: [10.481705, -66.840689], a: 'RES', alt: 1, pisos: 8, col: '#a56a4c', shop: 0, nota: 'torre de ladrillo, km 27,78 izq. (f_0273)' },
    { ll: [10.481873, -66.840130], a: 'RES', alt: 1, pisos: 9, col: '#a8704f', shop: 0, nota: 'km 27,85 izq.' },
    { ll: [10.482050, -66.839923], a: 'RES', pisos: 11, col: '#ddd0b6', shop: 0, nota: 'km 27,88 izq.' },
    { ll: [10.481620, -66.839756], a: 'RES', pisos: 14, col: '#e6dcc6', shop: 0, nota: 'torre crema tras reja negra, km 27,87 der. (f_0273)' },
    { ll: [10.481562, -66.839046], a: 'RES', pisos: 16, col: '#e3d7bf', shop: 0, nota: 'km 27,98 der.' },
    { ll: [10.481262, -66.838847], a: 'RES', pisos: 18, col: '#ece4d2', shop: 0, nota: 'km 28,01 der.' },
    { ll: [10.480760, -66.837102], a: 'RES', pisos: 14, col: '#e8e0cf', shop: 0, nota: 'km 28,21 der.' },
    // galpón gris largo con santamarías y letrero «SERV…», valla rosada encima (f_0278)
    { ll: [10.480295, -66.836031], a: 'GAL', h: 9, col: '#c4c9cc', shop: 0, nota: 'galpón gris largo, km 28,34 der.; sin santamarías de colores (f_0278: una sola santamaría gris)' },
    // auditoría 19-nov: torre de 30 m detrás del galpón salía morada (color medio del video saturado); en f_0278 las torres del fondo son crema
    { ll: [10.479814, -66.835162], a: 'RES', pisos: 10, col: '#e6dfcf', shop: 0, nota: 'torre crema tras el galpón, km 28,44 der. (f_0278)' },
    // auditoría 19-nov: Av. Araure 27,1–27,45, quintas y edificios bajos tras muros; el generador mezclaba verdes y azules de la paleta de casas (f_0266–f_0268: blancos y cremas)
    { ll: [10.482300, -66.846200], r: 70, col: '#e8e3d8' },
    { ll: [10.482150, -66.845300], r: 45, col: '#ddd5c4' },
    { ll: [10.483050, -66.845700], r: 70, col: '#ece8df' },
    // auditoría final 19-nov (afb_27.48 / afb_28.08 contra f_0268 y f_0273): de 27,44 a 28,15 seguían saliendo bloques celeste y azul intenso
    // (el color medio del video a la sombra es gris azulado: #82989e, #dcfeff, #878ba3, #8d9299). En el video son quintas y torres blancas y crema
    // tras muros y rejas negras, con mucho árbol; el ladrillo de la izquierda en 27,78–27,88 (#9a8984) no se toca.
    { ll: [10.481800, -66.842800], r: 75, col: '#e6e1d6' },
    { ll: [10.481200, -66.840400], r: 45, col: '#e3dccd' },
    { ll: [10.481100, -66.838000], r: 55, col: '#ebe6da' },
    // auditoría 19-nov: en la Calle Santa Margarita las torres de la izquierda son de ladrillo (t=750–752 s); el color medio del video las pintaba verde oliva y rosado
    { ll: [10.473994, -66.816714], a: 'RES', alt: 1, col: '#a8694a', shop: 0, nota: 'torre de ladrillo, Santa Margarita izq. (km 32,12)' },
    { ll: [10.473990, -66.817275], a: 'RES', alt: 1, col: '#b07a58', shop: 0, nota: 'torre de ladrillo alta, Santa Margarita izq. (km 32,22)' },
    // auditoría 19-nov: dos bloques azules a la der. en el 29,2; en f_0282 solo hay torres blancas tras los árboles
    { ll: [10.476713, -66.828854], a: 'RES', col: '#e7e2d6', shop: 0, nota: 'bloque blanco, km 29,22 der. (f_0282)' },
    { ll: [10.476786, -66.828447], a: 'RES', col: '#ded7c8', shop: 0, nota: 'km 29,26 der.' },
    // torre de 81 m detrás del bosque del talud (km 30,0 der.)
    { ll: [10.473757, -66.822372], a: 'RES', pisos: 22, col: '#d9cdb5', shop: 0, nota: 'torre residencial sobre el talud, km 30,0 der.' },
    // ── Macaracuay, km 30,2–30,6 der. (23-nov, «en Macaracuay no hay un edificio tan grande como ese; hay uno que dice Parmalat», Alejandro).
    //  Video t=719–723 s (descarga a 2 cps; el f_0290 del índice, t=722,5, ya trae la bomba al lado: índice ≈ +0,05 km aquí). En orden:
    //  muro gris oscuro con malla alta de cancha (30,22–30,28), la bomba de techo rojo (Full Gas en OSM, 30,30–30,35, va en el módulo),
    //  detrás la Torre Parmalat (OSM way «Torre Parmalat», office): bloque de concreto gris claro de ~8 pisos y 61 m de largo con ventanas
    //  en bandas, y más allá la Torre California (OSM, office, 8 niveles) con testeros de ladrillo, y dos torres grises al fondo.
    //  La torre «oscura de vidrio muy grande» era la huella del Edificio Margarita (63 m de Google Open Buildings, sin altura en OSM): a 63 m el
    //  generador la hace torre de vidrio; en el video las torres del fondo son residenciales grises de ~16 pisos. Los «locales COLA» eran las
    //  huellas de la bomba (tienda, autolavado, casetas) dibujadas como comercio de santamarías.
    { ll: [10.473398, -66.818676], a: 'RES', alt: 1, pisos: 8, col: '#c4c3bd', shop: 0, mural: 0, nota: 'Torre Parmalat: bloque gris de oficinas, el letrero va en el módulo (km 30,37 der.)' },
    { ll: [10.473810, -66.818160], a: 'RES', alt: 1, pisos: 10, col: '#a9634a', shop: 0, mural: 0, nota: 'Torre California: oficinas con testeros de ladrillo (km 30,44 der., t=721)' },
    { ll: [10.473993, -66.817274], a: 'RES', alt: 1, pisos: 16, col: '#c3c1ba', shop: 0, mural: 0, nota: 'Edificio Margarita: torre residencial gris, no de vidrio (km 30,54 der.; la vuelta lo ve a 35 m en el 31,95)' },
    // vistas en la captura de comprobación (km 30,30): la torre oscura que sobresalía era otra huella de Google, 102 m a 160 m de la vía
    // (km 30,51 der.); en la satelital ahí hay bloques residenciales de sombra corta, y en el video solo asoman torres grises de ~15 pisos
    { ll: [10.473108, -66.817287], a: 'RES', alt: 1, pisos: 12, col: '#d3cec2', shop: 0, mural: 0, nota: 'bloque residencial en la ladera, km 30,51 der. (era una torre de vidrio de 102 m)' },
    { ll: [10.474391, -66.815744], a: 'RES', alt: 1, pisos: 13, col: '#a8694a', shop: 0, mural: 0, nota: 'Edificio Planilunio (OSM): torre de ladrillo de la esquina de Santa Margarita, km 30,74 der. (f_0293)' },
    { ll: [10.474219, -66.813838], a: 'RES', col: '#cdbb97', shop: 0, mural: 0, nota: 'torres beige de balcones sobre la autopista, km 30,94 der. (en la vuelta, f_0296); residenciales, no de vidrio' },
    { ll: [10.473764, -66.819238], quitar: true, nota: 'tienda Full Gas: va en el módulo con la marquesina' },
    { ll: [10.473769, -66.819043], quitar: true, nota: 'techo rojo del autolavado de la bomba: va en el módulo' },
    { ll: [10.473725, -66.818966], quitar: true, nota: 'caseta del fondo de la bomba' },
    { ll: [10.473730, -66.819472], quitar: true, nota: 'caseta en el patio de la bomba' },
    { ll: [10.473844, -66.819699], quitar: true, nota: 'caseta de 14 m² a 9 m del eje, sobre la acera (en el video no hay nada)' },
    { ll: [10.473704, -66.819627], a: 'COM', h: 3.6, col: '#56595b', shop: 0, mural: 0, detalle: 0, nota: 'muro gris oscuro de la cancha, km 30,29 der. (t=719,5); la malla alta va en el módulo' },
  ],
  via: [
    // Av. Araure: calle de 2 canales, quintas y residencias tras rejas negras y muros, árboles grandes; paleta crema/blanco/ladrillo
    { km0: 26.75, km1: 27.1, set: { canales: 3, calzadas: 1, sep: 'ninguno', ancho: 12, 'L.tipo': 'residencial', 'R.tipo': 'residencial', 'L.col': ['#e6dccb', '#a8694a', '#ece8de'], 'R.col': ['#e7dcc4', '#e9e8e3', '#ddd2bb'], 'veg.palL': .5 } },
    // calle La Guairita (bajada del puente por el costado del Eurobuilding, t=651–657 s). 19-nov: UNA sola calzada de tres canales entre
    // brocales amarillos (OSM: Av. La Guairita y Av. Araure, sentido único de 3 canales). La isla de grama con flores y la calzada contraria
    // del 17-nov eran inventadas: la Río de Janeiro va aparte, en puente, 15–55 m a la izquierda, y el ancho caía de 24 a 11 m de golpe en
    // el 26,87. Los bordes (parapeto y verja a la izq., verja negra sobre muro blanco a la der.) y la bomba van en landmarks/zona_mercedes.js.
    { km0: 26.75, km1: 26.88, set: { 'L.tipo': 'muro/terreno', 'veg.L': .6, 'veg.denL': 3, 'veg.R': .7, 'veg.denR': 3, 'veg.palL': 0, 'veg.palR': 0 } },
    { km0: 26.88, km1: 26.95, set: { 'veg.L': .3, 'veg.R': .6, 'veg.palL': .4 } },
    { km0: 27.1, km1: 27.45, set: { 'L.tipo': 'casas', 'R.tipo': 'casas', 'L.col': ['#ece6da', '#d9cfbd', '#f1efe8'], 'R.col': ['#e9e5dc', '#d8d0c0', '#c9c2b4'], 'veg.L': .45, 'veg.R': .5 } },
    { km0: 27.45, km1: 27.8, set: { 'L.col': ['#ece6da', '#d9cfbd', '#e2b9a0'], 'R.col': ['#e9e5dc', '#d8d0c0', '#c9c2b4'], 'veg.palR': .5 } },
    // 22-nov: a la izquierda, frente al Gama, el video muestra quintas, muros blancos y oficinas bajas (t=673–676,5), no locales de
    // santamarías de colores (salían «CAF», «CUBO», «CAUCHO» en azul, rojo y amarillo)
    { km0: 27.45, km1: 27.72, set: { 'L.tipo': 'casas' } },
    { km0: 27.8, km1: 28.2, set: { 'L.col': ['#a56a4c', '#ddd0b6'], 'R.col': ['#e6dcc6', '#e3d7bf'], 'veg.L': .5, 'veg.R': .45 } },
    // Av. Río de Janeiro, tramo con barrera New Jersey amarilla: canal a la izquierda (sin edificios), talud con bosque a la derecha
    // (auditoría 19-nov) a la izquierda, tras la barrera, van la calzada contraria y el canal: copas sueltas y bajas, no un túnel de samanes (f_0275)
    { km0: 27.95, km1: 28.7, set: { sep: 'muro', 'L.tipo': 'parque', 'veg.L': .22, 'veg.palL': 0, 'veg.denL': 1, 'veg.palR': 0, 'veg.R': .45, 'veg.denR': 2 } },
    { km0: 28.75, km1: 30.45, set: { 'L.tipo': 'parque', 'veg.L': .5, 'veg.palL': 0 } },
    { km0: 28.75, km1: 28.98, set: { 'R.tipo': 'muro/terreno', 'veg.R': .85, 'veg.palR': 0, 'veg.denR': 3 } },
    { km0: 29.3, km1: 29.75, set: { 'veg.palR': 0 } },
    { km0: 29.78, km1: 29.98, set: { sep: 'isla con árboles' } },
    { km0: 29.78, km1: 30.12, set: { 'R.tipo': 'muro/terreno', 'veg.R': .8, 'veg.denR': 3, 'veg.palR': 0 } },
    // Calle Santa Margarita (km nuevo 31,95–32,27, t=749–753 s): bajada corta, T con bolardos, calle de 2 canales arbolada con torres de
    // ladrillo a la izquierda y muro bajo con árboles a la derecha; luego la Av. Principal de Macaracuay (32,27–32,6), 2 canales por sentido
    // (auditoría 19-nov) retorno y vuelta hasta el giro: samanes y monte, ningún chaguaramo (t=740–747 s)
    { km0: 30.6, km1: 31.95, set: { 'veg.palL': 0, 'veg.palR': 0 } },
    // trazado 2: ida (30,3–31,3) y vuelta (31,3–31,75) por su calzada real, dos canales cada una con isla de grama entre las dos
    // (f_0292–0293, f_0296–0298); antes el ancho de 26–40 m respondía al eje viejo, que iba por el talud
    { km0: 30.3, km1: 31.75, set: { calzadas: 2, canales: 2, ancho: 20 } },
    { km0: 30.75, km1: 31.75, set: { sep: 'isla con grama' } },
    { km0: 31.95, km1: 32.27, set: { canales: 2, calzadas: 1, sep: 'ninguno', ancho: 11, 'L.tipo': 'residencial', 'R.tipo': 'muro/terreno', 'L.col': ['#a8694a', '#b07a58', '#e3d9c4'], 'veg.L': .3, 'veg.R': .35, 'veg.denL': 1, 'veg.denR': 1, 'veg.palL': 0, 'veg.palR': 0 } },
    { km0: 32.27, km1: 32.6, set: { canales: 2, calzadas: 2, sep: 'brocal amarillo', ancho: 18, 'L.tipo': 'parque', 'R.tipo': 'parque', 'veg.L': .5, 'veg.R': .5, 'veg.palL': 0, 'veg.palR': 0 } },
  ],
  relieve: [
    // ── canal del Guaire a la izquierda (norte). Medidas en la foto satelital, desde el eje de la ida. El fondo del canal ~7 m abajo.
    { km0: 27.93, km1: 28.56, lado: 'L', d0: 19, d1: 25, dh: -7, d2: 48, d3: 58, rampa: 30, nota: 'canal del Guaire, tramo de la barrera amarilla' },
    { km0: 28.56, km1: 28.78, lado: 'L', d0: 28, d1: 34, dh: -7, d2: 62, d3: 72, rampa: 20, nota: 'canal del Guaire en la curva de Caurimare' },
    // (trazado 2, 19-nov) desde el 28,79 las distancias van desde el eje nuevo, que está 4–17 m más al sur que el viejo
    { km0: 28.78, km1: 29.45, lado: 'L', d0: 25, d1: 31, dh: -7, d2: 54, d3: 66, rampa: 20, nota: 'canal del Guaire, isla con grama' },
    { km0: 29.45, km1: 30.14, lado: 'L', d0: 27, d1: 35, dh: -7, d2: 59, d3: 72, rampa: 25, nota: 'canal del Guaire tras la fila de árboles' },
    { km0: 30.21, km1: 30.34, lado: 'L', d0: 21, d1: 27, dh: -7, d2: 50, d3: 62, rampa: 15, nota: 'canal del Guaire antes del cruce de Macaracuay' },
    { km0: 30.34, km1: 30.47, lado: 'L', d0: 32, d1: 38, dh: -7, d2: 61, d3: 73, rampa: 15, nota: 'canal del Guaire antes del cruce de Macaracuay (ida ya en la calzada sur)' },
    { km0: 30.55, km1: 30.8, lado: 'L', d0: 35, d1: 41, dh: -7, d2: 64, d3: 76, rampa: 15, nota: 'canal del Guaire hasta que lo cubre la autopista' },
    // a la izquierda de la ida (derecha de la vuelta, que va 8–11 m a la izquierda): la Autopista Gran Cacique Guaicaipuro más abajo, tras el guardarriel
    { km0: 30.8, km1: 31.28, lado: 'L', d0: 34, d1: 43, dh: -4.5, d2: 125, d3: 140, rampa: 25, nota: 'autopista más abajo (vista desde la vuelta)' },
    // ── a la derecha (sur): las faldas de Chuao/Caurimare
    { km0: 27.95, km1: 28.66, lado: 'R', d0: 32, d1: 75, dh: 14, d2: 120, d3: 140, rampa: 40, nota: 'cerro con bosque detrás de las torres' },
    { km0: 28.76, km1: 29.06, lado: 'R', d0: 11, d1: 27, dh: 13, d2: 110, d3: 135, rampa: 25, nota: 'talud de monte pegado a la acera (f_0281)' },
    { km0: 29.12, km1: 29.42, lado: 'R', d0: 13, d1: 35, dh: 8, d2: 110, d3: 135, rampa: 25, nota: 'ladera con residencias' },
    { km0: 29.42, km1: 29.76, lado: 'R', d0: 15, d1: 21, dh: 4, d2: 105, d3: 125, rampa: 12, nota: 'patio de camiones y galpón sobre muro de piedra y muro acanalado' },
    { km0: 29.8, km1: 30.12, lado: 'R', d0: 11, d1: 28, dh: 9, d2: 110, d3: 135, rampa: 25, nota: 'talud con bosque antes del 30K' },
    // barrio en ladera al sur de la avenida, frente a la autopista (a la derecha de la ida, que ahora va pegada a ella por la calzada sur)
    { km0: 30.82, km1: 31.25, lado: 'R', d0: 12, d1: 34, dh: 10, d2: 110, d3: 135, rampa: 30, nota: 'ladera con barrio y samanes' },
    // ── vuelta por la Av. Principal de Macaracuay: puente sobre el Guaire (km nuevo 32,375–32,44, t=755 s)
    { km0: 32.375, km1: 32.44, lado: 'LR', d0: 9, d1: 12, dh: -6, d2: 26, d3: 34, rampa: 6, nota: 'puente de la Av. Ppal. de Macaracuay sobre el Guaire' },
  ],
  // copas grandes que hacen túnel sobre la Calle Santa Margarita (t=751–752,5 s)
  // árboles sueltos a los lados de la Calle Santa Margarita, separados del eje: la calle es soleada con cielo abierto (t=751–752,5 s)
  arboles: [
    { ll: [10.474330, -66.816180], especie: 'mango', alto: 10 }, { ll: [10.474320, -66.816950], especie: 'caobo', alto: 11 },
    { ll: [10.474010, -66.816600], especie: 'mango', alto: 9 }, { ll: [10.474015, -66.817150], especie: 'caobo', alto: 10 },
  ],
  quitaEstructuras: [[28.95, 29.01], [29.79, 29.81], [30.24, 30.26]],
  estructuras: [
    { tipo: 'cubierta', km0: 28.725, km1: 28.75, alto: 7, ancho: 46, nota: 'paso superior de la Rampa de Caurimare (f_0280)' },
    { tipo: 'pasarela', km: 30.17, color: '#d9542b', nota: 'pasarela naranja del semáforo del 30K' },
    // trazado 2: la vuelta tras el retorno lleva a la derecha el guardarriel galvanizado que la separa del talud de la autopista (f_0296–0300)
    { tipo: 'barandas', km0: 31.36, km1: 31.9, color: '#a9aeb3', lado: 'R', nota: 'guardarriel de la vuelta del retorno de Petare' },
    { tipo: 'cubierta', km0: 32.30, km1: 32.36, alto: 4.85, ancho: 14, nota: 'la vuelta pasa bajo los tableros de la Río de Janeiro (t=754,5 s); a la cota del tablero de la ida, que queda ~4,9 m sobre la vuelta' },
    { tipo: 'barandas', km0: 32.375, km1: 32.44, color: '#f2c230', macizo: true, nota: 'barreras amarillas del puente sobre el Guaire (t=755,5 s)' },
  ],
  // la Río de Janeiro cruza en puente sobre la Av. Principal de Macaracuay. Solo la ida sube al tablero; la vuelta pasa por debajo.
  elevados: [
    { km0: 30.43, km1: 30.6, alto: 6.2, nombre: 'Puente de la Río de Janeiro sobre Macaracuay (ida); alto 6,2 deja ~4,9 m de gálibo a la vuelta que pasa por debajo (32,33)' },
  ],
};
