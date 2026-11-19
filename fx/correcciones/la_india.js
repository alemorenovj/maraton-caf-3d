// Correcciones de la zona la_india (km 6.2–8.5). Contrato en fx/correcciones/LEEME.md
// Referencia: video en carro, fotogramas f_0064–f_0087 (s 157–215). El km del índice va ~0,06 por delante del km del juego
// en este tramo (anclas: pasarela OSM 997226844 = km 7,20 ↔ s 183,6; cruce 2.ª Avenida = km 8,06 ↔ s 200; La India = km 8,25 ↔ s 207).
// Lo singular (monumento, Galerías El Paraíso, torres de Residencias Galerías Paraíso, pasarelas, bombas) está a mano en landmarks/zona_la_india.js.
// 19-nov: el PUENTE LOS LEONES está en el km 7,27–7,43 (OSM 276264345/304807717, km 7,265–7,425). No cruza una quebrada: cruza la Autopista
// Francisco Fajardo (Gran Cacique Guaicaipuro; calzadas en km 7,344 y 7,388) y el Guaire (7,364), con los ramales del Distribuidor La Paz a ras
// en los dos extremos. La carrera va por el tablero de 3 canales hacia el sur; el de 1 canal (contraflujo) corre ~9 m a la izquierda.
// Se llega por la Av. La Paz bajando del lomo de Bella Vista (el dueño: «antes del puente es más pronunciada»).
// Anclas del video (yt nc30axuNBaw, segundo): pasarela 7,20 ↔ 183,6 · leones a ambos lados 7,272 ↔ 185,0 · tablero con guardarriel amarillo
// 186–188,9 · fin del guardarriel der. 7,44 ↔ 188,9 · «AVENIDA O'HIGGINS» 7,48 ↔ 189,9 (video acelerado, ~42 m/s). Bajada franca en 182–184 s.
export default {
  edif: [
    // ── Fin de San Martín (km 6,2–6,45; f_0064–0066)
    { ll: [10.487198, -66.945125], a: 'BRI', pisos: 14, col: '#dcdad3', shop: 0, nota: 'Bloque De Armas: oficinas blanco-grises con letrero, no torre de vidrio (f_0065)' },
    { ll: [10.488412, -66.943841], a: 'COM', pisos: 3, col: '#d9d4c8', shop: 1, nota: 'comercial bajo blanco, km 6,21 izq.' },
    // km 6,25: con el trazado nuevo entra la huella OSM de la manzana de la derecha (antes la tapaban huellas sueltas) y una esquina
    // queda a 4 m del eje: fuera y recortada a 7,5 m
    { ll: [10.489051, -66.944057], quitar: true, nota: 'manzana a 4 m del eje, km 6,25 der. (auditoría 19-nov: el ll anterior caía dentro del recorte y lo borraba también)' },
    { poly: [[10.488886, -66.944965], [10.48877, -66.944984], [10.488762, -66.944928], [10.488808, -66.94492], [10.488359, -66.944687], [10.488401, -66.944609], [10.488552, -66.944396], [10.488978, -66.944582], [10.488961, -66.944475], [10.489022, -66.944355], [10.488884, -66.944284], [10.488817, -66.944417], [10.488708, -66.94436], [10.488764, -66.944249], [10.488784, -66.944246], [10.488713, -66.944209], [10.488764, -66.944122], [10.488785, -66.944096], [10.488808, -66.944097], [10.488894, -66.943975], [10.489279, -66.944177], [10.489085, -66.944562], [10.489105, -66.944691], [10.489182, -66.944731], [10.489125, -66.944845], [10.489061, -66.944812], [10.489096, -66.944743], [10.489057, -66.944723], [10.488966, -66.944903], [10.488879, -66.944917]],
      a: 'COM', h: 7.1, col: '#e1d4b2', shop: 1, nota: 'manzana de locales recortada a 7,5 m, km 6,25 der.' },
    { ll: [10.488307, -66.945178], a: 'COM', h: 6, col: '#e6dccb', shop: 1, nota: 'locales con techo de teja roja, km 6,34 der. (f_0065)' },
    { ll: [10.487965, -66.944038], a: 'COM', pisos: 2, col: '#b8433a', shop: 1, nota: 'banco rojo de 2 pisos, km 6,26 izq.' },
    // ── Calle estrecha de Bella Vista con tapias y árboles (km 6,47–6,68; f_0067–0068): a la izquierda tapia gris, no galpones azules
    // km 6,54: la tapia cruzaba la calle porque el trazado iba 4–5 m a la izquierda del eje real. Con el trazado corregido (18-nov)
    // su huella original queda a 6,3 m del eje: se quitó el recorte y se le devuelve la huella original
    { ll: [10.487133, -66.946696], a: 'GAL', h: 5, col: '#8f8c85', shop: 0, detalle: 0, nota: 'tapia gris con grafiti, km 6,54 izq.' },
    { ll: [10.487031, -66.946643], a: 'GAL', h: 5, col: '#8a877f', shop: 0, detalle: 0, nota: 'tapia gris, km 6,57 izq. (huella del build nuevo)' },
    { ll: [10.486634, -66.947319], a: 'GAL', h: 6, col: '#94918a', shop: 0, detalle: 0, nota: 'tapia/galpón gris, km 6,63 izq.' },
    { ll: [10.487083, -66.946407], a: 'GAL', h: 5, col: '#8f8c85', shop: 0, detalle: 0 },
    { ll: [10.486629, -66.947552], a: 'GAL', h: 4, col: '#8a877f', shop: 0, detalle: 0 },
    { ll: [10.487484, -66.946452], a: 'COM', h: 4, col: '#f0c419', shop: 1, nota: 'bodega amarilla, km 6,51 der. (f_0067)' },
    { ll: [10.487424, -66.946460], a: 'COM', h: 4, col: '#f2f0ea', shop: 1 },
    // ── Calles de barrio (km 6,7–7,0; f_0069–0071)
    { ll: [10.486261, -66.949300], a: 'COM', pisos: 2, col: '#e9eef2', shop: 1, nota: 'tintorería azul y blanca, km 6,84 der. (f_0069)' },
    { ll: [10.486624, -66.948679], a: 'COM', pisos: 2, col: '#d8cfc0', shop: 1 },
    { ll: [10.485275, -66.949387], a: 'COM', h: 7, col: '#c9c6bf', shop: 0, rail: 1, nota: 'detrás de la bomba PDV, km 6,92 izq.' },
    { ll: [10.485232, -66.950313], a: 'COM', pisos: 2, col: '#e3b23c', shop: 1, nota: 'local amarillo de 2 pisos frente a la bomba, km 6,99 der. (f_0071)' },
    // ── Bella Vista hacia el Pérez Carreño (km 7,0–7,2; f_0072–0073)
    { ll: [10.483988, -66.950387], a: 'RES', pisos: 6, col: '#b5452f', shop: 0, alt: 1, nota: 'edificio curvo de ladrillo rojo en la esquina, km 7,12 der. (f_0073); no vidrio' },
    { ll: [10.484337, -66.949976], a: 'RES', pisos: 10, col: '#ecebe6', shop: 0, alt: 1, nota: 'torre blanca de ventanas cuadradas, km 7,11 izq. (s 181)' },
    { ll: [10.484109, -66.949464], a: 'COM', h: 6, col: '#e4e4de', shop: 1, nota: 'locales blancos, km 7,17 izq.' },
    { ll: [10.484542, -66.950658], a: 'COM', pisos: 2, col: '#3f78b5', shop: 1, nota: 'silenciadores azul, km 7,06 der.' },
    // ── Avenida ancha de la pasarela y torre blanca de remate amarillo (km 7,2–7,35; s 184–185)
    { ll: [10.482955, -66.949816], a: 'RES', pisos: 17, col: '#f0efe9', shop: 0, alt: 1, nota: 'torre blanca con remate amarillo, km 7,25 der.' },
    { ll: [10.482346, -66.949771], a: 'RES', pisos: 12, col: '#efeee8', shop: 0, alt: 1, nota: 'bloque blanco de ventanas en retícula, km 7,32 der.' },
    // ── Salida del puente, izq. (km 7,44–7,53; s 188,4–189,4): torres de ladrillo rojo y beige de ~14 pisos, la del frente con valla en la azotea.
    //    Eran huellas «parque» de 50 m que salían como torres de vidrio verde y azul.
    { ll: [10.4817, -66.9478], r: 75, a: 'RES', alt: 1, shop: 0 },
    { ll: [10.481702, -66.947971], a: 'RES', pisos: 14, col: '#cdb48c', shop: 0, alt: 1, nota: 'torre beige detrás de la de ladrillo rojo (10.481210), km 7,45 izq. (s 188,4–189,4)' },
    { ll: [10.481301, -66.947733], a: 'RES', pisos: 14, col: '#b0634a', shop: 0, alt: 1, nota: 'ladrillo, segunda fila, km 7,50 izq. (s 189,4)' },
    { ll: [10.481791, -66.947746], a: 'RES', pisos: 13, col: '#d6c7a8', shop: 0, rail: 1 },
    { ll: [10.482023, -66.947499], a: 'RES', pisos: 13, col: '#ddd2bb', shop: 0, rail: 1 },
    { ll: [10.481056, -66.947619], a: 'RES', pisos: 12, col: '#d2c4a6', shop: 0, rail: 1 },
    // ── Av. O'Higgins (km 7,45–8,15; f_0076–0083)
    { ll: [10.481210, -66.948101], a: 'RES', pisos: 12, col: '#a8473a', shop: 0, alt: 1, nota: 'torre de ladrillo rojo, km 7,50 izq. (s 189)' },
    { ll: [10.480827, -66.947943], a: 'RES', pisos: 12, col: '#e4dcc8', shop: 0, rail: 1 },
    { ll: [10.480364, -66.947819], a: 'RES', pisos: 12, col: '#e9e3d3', shop: 0, rail: 1 },
    { ll: [10.480058, -66.947675], a: 'RES', pisos: 11, col: '#dcd0b4', shop: 0, rail: 1 },
    { ll: [10.479829, -66.947595], a: 'RES', pisos: 12, col: '#d6c9a8', shop: 0, rail: 1 },
    { ll: [10.478810, -66.947126], a: 'RES', pisos: 14, col: '#ece8de', shop: 0, rail: 1, nota: 'torre blanca al fondo izq. (f_0079)' },
    { ll: [10.478289, -66.946688], a: 'RES', pisos: 12, col: '#e2ddd2', shop: 0, rail: 1 },
    { ll: [10.477831, -66.946795], a: 'RES', pisos: 10, col: '#d9cdb5', shop: 0, rail: 1 },
    { ll: [10.477170, -66.946195], a: 'RES', pisos: 14, col: '#e4dccb', shop: 0, rail: 1, nota: 'Residencias Parque La India, km 7,99 izq.' },
    { ll: [10.478464, -66.947894], a: 'RES', pisos: 14, col: '#efeee9', shop: 0, rail: 1, nota: 'torre blanca de balcones tras la pasarela, km 7,79 der. (f_0080)' },
    { ll: [10.478242, -66.947785], a: 'RES', pisos: 14, col: '#e9e7e0', shop: 1 },
    { ll: [10.477888, -66.947586], a: 'RES', pisos: 12, col: '#e8e2d2', shop: 1 },
    { ll: [10.477549, -66.947378], a: 'RES', pisos: 11, col: '#e2c25a', shop: 1, alt: 1, nota: 'edificio amarillo al cruzar la pasarela, km 7,90 der. (s 200)' },
    { ll: [10.477149, -66.947193], a: 'RES', pisos: 12, col: '#d8b46c', shop: 1, alt: 1, nota: 'torre ocre, km 7,95 der. (f_0081)' },
    { ll: [10.476783, -66.947050], a: 'RES', pisos: 10, col: '#e3dccb', shop: 1, nota: 'Edificio Alfa' },
    { ll: [10.476426, -66.946893], a: 'RES', pisos: 10, col: '#d8c8a8', shop: 1, nota: "Residencias O'Higgins" },
    { ll: [10.476032, -66.946733], a: 'RES', pisos: 12, col: '#cbb592', shop: 1, nota: 'Edificio Virginia: beige de balcones al borde der. (f_0083)' },
    { ll: [10.475726, -66.946635], a: 'RES', pisos: 9, col: '#ecc93a', shop: 1, alt: 1, nota: 'Edificio La Paz: amarillo de 9 pisos con chaguaramos, km 8,12 der. (f_0083)' },
    { ll: [10.475831, -66.946798], a: 'RES', pisos: 7, col: '#d2c6ae', shop: 0, rail: 1 },
    { ll: [10.476493, -66.947185], a: 'RES', pisos: 7, col: '#cfc4ad', shop: 0, rail: 1 },
    // izquierda antes de la redoma: bomba y locales rojos (Gama), no bloques altos
    { ll: [10.476722, -66.946297], a: 'COM', h: 5, col: '#e7e2d8', shop: 1 },
    { ll: [10.475986, -66.946139], a: 'COM', h: 5, col: '#c7372f', shop: 1, nota: 'locales rojos, km 8,11 izq.' },
    { ll: [10.475930, -66.946106], a: 'COM', h: 4, col: '#c7372f', shop: 1 },
    { ll: [10.475790, -66.946068], a: 'COM', h: 6, col: '#e9e6df', shop: 1 },
    { ll: [10.476159, -66.945971], a: 'COM', h: 7, col: '#d33a2c', shop: 1, nota: 'Supermercado Gama Express (letreros rojos OFERTAS / 24 HORAS)' },
    { ll: [10.476002, -66.945954], a: 'COM', h: 4, col: '#e8e4dc', shop: 1, nota: 'tienda de la bomba (Full Gas)' },
    // ── Redoma de La India y salida a Av. Páez (km 8,2–8,5; f_0084–0086)
    { ll: [10.475463, -66.945490], a: 'RES', pisos: 9, col: '#b9b3a6', shop: 1, alt: 1, nota: 'Edificio Atlas: gris viejo de 9 pisos junto a Galerías; no vidrio (s 206)' },
    { ll: [10.475970, -66.945620], a: 'RES', pisos: 14, col: '#d9b98a', shop: 1, nota: 'Edificio India Palace: beige con balcones naranja, km 8,34 izq. (f_0085)' },
    { ll: [10.476490, -66.945693], a: 'RES', pisos: 12, col: '#d4c3a2', shop: 0, rail: 1 },
    { ll: [10.475781, -66.944956], a: 'RES', pisos: 4, col: '#c86a3a', shop: 1, nota: 'locales de ladrillo naranja con santamarías, Av. Páez der. (f_0085)' },
    { ll: [10.476364, -66.944446], a: 'RES', pisos: 4, col: '#e2d3b8', shop: 1 },
    { ll: [10.476129, -66.944612], a: 'RES', pisos: 9, col: '#c7a774', shop: 1, alt: 0, nota: 'residencial de balcones, Av. Páez der. (f_0085)' },
    { ll: [10.474658, -66.945901], a: 'RES', pisos: 6, col: '#c9c3b6', shop: 1 },
    // quitar: plaza y redoma (en la realidad no hay edificios)
    { ll: [10.475110, -66.945006], quitar: true },
  ],
  via: [
    // calle estrecha en túnel de copas (f_0067–0068)
    { km0: 6.47, km1: 6.68, set: { 'veg.L': .55, 'veg.R': .7, 'veg.denL': 2, 'veg.denR': 3, 'R.tipo': 'muro/terreno', 'R.col': ['#8d7a5c', '#6f6a5c'] } },
    // avenida ancha de la pasarela con separador de grama y árboles a la derecha (s 183–185)
    { km0: 7.17, km1: 7.30, set: { sep: 'isla con grama', canales: 3, calzadas: 2, ancho: 30, 'veg.R': .6, 'veg.denR': 3, 'veg.L': .35 } },
    // Puente Los Leones (s 185–189): tablero propio de 3 canales en un sentido, sin separador; el tablero de contraflujo va a mano
    // (landmarks/zona_la_india.js) a la izquierda. Sin árboles del generador sobre el tablero.
    { km0: 7.28, km1: 7.43, set: { sep: 'ninguno', canales: 3, calzadas: 1, ancho: 13, 'veg.L': 0, 'veg.R': 0, 'veg.denL': 0, 'veg.denR': 0, 'veg.palL': 0, 'veg.palR': 0,
      'L.tipo': 'muro/terreno', 'R.tipo': 'muro/terreno', 'L.retiro': 2, 'R.retiro': 2 } },
    // Av. O'Higgins: brocal amarillo central, dos canales por sentido y franja ancha con árboles grandes a la derecha (f_0077–0083)
    { km0: 7.55, km1: 8.17, set: { sep: 'brocal amarillo', canales: 2, calzadas: 2, ancho: 26, 'veg.R': .75, 'veg.denR': 3, 'veg.L': .55, 'veg.denL': 3, 'veg.palL': 0, 'veg.palR': 0, 'R.retiro': 14, 'L.retiro': 10, 'R.tipo': 'residencial', 'L.tipo': 'residencial' } },
    { km0: 7.98, km1: 8.17, set: { 'veg.palR': .3, 'veg.R': .35, 'veg.L': .12, 'veg.denL': 1 } },
    // la redoma: cruce abierto, sin separador, para que el asfalto no se coma la isla del monumento
    { km0: 8.18, km1: 8.31, set: { sep: 'ninguno', calzadas: 1, canales: 3, ancho: 18, 'veg.L': .05, 'veg.R': .1, 'veg.palL': 0, 'veg.palR': 0 } },
    // Av. Páez: isla de grama con brocal amarillo, pinos a la derecha (f_0085)
    { km0: 8.32, km1: 8.48, set: { sep: 'isla con grama', calzadas: 2, canales: 2, ancho: 24, 'veg.palL': 0, 'veg.palR': 0, 'veg.R': .35, 'veg.L': .2 } },
  ],
  relieve: [
    // Puente Los Leones: bajo el vano (7,318–7,410) van la autopista (gálibo 5 m + losa) y el Guaire. Derecha desde el borde del tablero (8,9 m);
    // izquierda, pasado el tablero de contraflujo (15,4 m). Ancho lateral limitado a 60 m: la autopista cruza oblicua (63–80°).
    // Debe coincidir con KT0/KT1/DHT de landmarks/zona_la_india.js.
    { km0: 7.318, km1: 7.410, lado: 'R', d0: 9.2, d1: 13, dh: -7, d2: 45, d3: 60, rampa: 10, nota: 'Puente Los Leones: autopista y Guaire abajo (der.)' },
    { km0: 7.318, km1: 7.410, lado: 'L', d0: 15.8, d1: 19.5, dh: -7, d2: 45, d3: 60, rampa: 10, nota: 'Puente Los Leones: autopista y Guaire abajo (izq.)' },
  ],
  // el guardarriel genérico del motor se quita: el del módulo es de doble onda sobre parales, como en el video
  estructuras: [],
  sinBaranda: [[7.26, 7.44]],
  sinCebra: [[7.26, 7.44]],
  // copas que asoman por encima del tablero desde las orillas del Guaire (s 187,5–188,4, der.)
  arboles: [{ ll: [10.482507, -66.948823], especie: 'saman', alto: 16 }, { ll: [10.482271, -66.948630], especie: 'mango', alto: 14 },
    { ll: [10.482052, -66.948410], especie: 'saman', alto: 15 }, { ll: [10.482690, -66.949675], especie: 'mango', alto: 13 }],
  // Perfil 19-nov (cota de la vía, m). Medido — km: juego · SRTM 30 m crudo · Copernicus GLO-30 (mín. en ±30 m, sin techos):
  // 6,80: 904,1 · 910 · 899 | 7,04: 908,1 · 917 · 914,6 | 7,12: 905,7 · 913 · 911,7 | 7,20: 903,3 · 906 · 900,2 | 7,28: 901,1 · 902 · 896,2 |
  // 7,36: 899,0 · 900 · 896,3 | 7,44: 897,4 · 902 · 897,2. Las dos fuentes dan un lomo de 911–915 m en el 7,0–7,1 y una caída de 10–15 m
  // hasta el tablero en ~150 m (el DSM la exagera con techos); el juego tenía 2,9 % de bajada y el tablero inclinado 2,6 %. El video muestra la
  // bajada franca en 182–184 s. Queda (arranca en 6,86 para que el suavizado no toque el 6,8): subida ~3 % (6,86→7,03), bajada media 6,1 % (máx. 6,3 %) 7,11→7,27, tablero 898,8→896,6 m (~1,4 %).
  perfil: [{ km: 6.86, dz: 0 }, { km: 7.03, dz: 2.5 }, { km: 7.11, dz: 2.5 }, { km: 7.27, dz: -2.6 }, { km: 7.42, dz: -1.0 }, { km: 7.55, dz: 0 }],
  // las pasarelas van a mano en landmarks/zona_la_india.js (escalera de un solo lado, viga de acero rojo óxido);
  // se quitan las genéricas mal puestas (7,36 gris y 8,11) y las barandas corridas 0,15 km
  quitaEstructuras: [[7.30, 7.40], [7.45, 7.66], [8.05, 8.15]],
};
