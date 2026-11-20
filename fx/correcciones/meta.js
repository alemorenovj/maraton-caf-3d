// Correcciones de la zona meta (km 37.3–42.2). Contrato en fx/correcciones/LEEME.md
// Referencia: video en carro f_0340–f_0396. Desfase del índice de fotogramas (km índice − km del juego), anclado con:
//   cruce de Altamira (f_0340, índice 36,96 ↔ km 37,22): −0,26 · Metro Chacao (f_0351, 38,06 ↔ 37,96): +0,10 ·
//   boca del paso inferior Neomar Lander (f_0355, 38,50 ↔ 38,62): −0,12 · giro en Av. El Parque tras el pórtico «Av. W. H. Phelps»
//   (f_0362, 39,26 ↔ 39,30): −0,04 · Metro Plaza Venezuela (f_0385, 41,35 ↔ 41,23): +0,12 · túnel (f_0387, 41,62 ↔ 41,60): 0.
//   El video va acelerado y con paradas en semáforos: el desfase oscila ±0,25 km; los carteles «37K/40K/42K» del video NO son km de la ruta.
// Nombres de edificio: OSM (build/raw/edificios.json). Lo singular (esqueleto de la Torre Kira, bocas de Metro, paso inferior,
// murales del túnel, mural de Phelps, «40» pintado) está a mano en landmarks/zona_meta.js.
// Av. Francisco Solano = km 39,65–41,05 del juego (f_0365–f_0381; índice − 0,05…+0,13 aquí). Anclas: casa amarilla km 40,18 der. (f_0372),
//   torres de celosía del Centro Residencial Solano km 40,43–40,52 der. (f_0373), iglesia km 40,55 der. (f_0374), paso de colores en la
//   bocacalle del km 40,205 (f_0371). Las torres de celosía, su basamento, el letrero verde, la fachada de la iglesia y el paso de colores
//   van a mano en zona_meta.js.
// Auditoría de choques (fx/choques.js, 18-nov-2026): la zona 37,3–42,19 quedó «sin choques». Había dos huellas OSM con lengüetas sobre la
//   calzada: km 40,81 (alero/pasaje de 12 m sobre el eje y el carril derecho) y km 41,00–41,09 (cuerpo bajo de Banvenez, 5005 m², con una
//   punta que cruzaba los tres carriles). Ambas se quitaron y se rehicieron con `poly` recortado a 9,5 m del eje, conservando la fachada.
export default {
  edif: [
    // ── Altamira → La Castellana (km 37,3–37,6; f_0340–f_0343)
    { ll: [10.495552, -66.849560], a: 'VID', alt: 1, pisos: 22, col: '#8796a3', shop: 1, nota: 'Torre Adriática: retícula de vidrio gris-azul pegada a la acera der. (f_0341)' },
    { ll: [10.495509, -66.850123], a: 'BRI', h: 100, col: '#d9cfb8', shop: 1, nota: 'Torre Financiera Caracas: torre crema con remate de letrero, der. (f_0340)' },
    { ll: [10.494765, -66.849817], a: 'BRI', pisos: 25, col: '#cbbfa6', shop: 1, nota: 'Torre Delta: concreto beige de bandas horizontales y esquinas curvas, izq. (f_0341)' },
    { ll: [10.494441, -66.850980], a: 'VID', pisos: 26, col: '#3b4757', shop: 0, nota: 'Hotel ME by Meliá: vidrio oscuro, izq. (f_0342–0343)' },
    { ll: [10.494060, -66.851563], a: 'BRI', pisos: 9, col: '#8f9599', shop: 0, detalle: 0, nota: 'C.C. Recreo La Castellana (obra): paneles grises tras vallas, izq. (f_0343)' },
    { ll: [10.494820, -66.851859], a: 'RES', pisos: 10, col: '#e3d3a8', shop: 1, nota: 'bloque crema de 10 pisos tras los árboles, der.; no torre de 100 m (f_0344–0345)' },
    // ── Chacao (km 37,7–38,3; f_0344–f_0352): bloques de 6–10 pisos con locales y torres de ladrillo naranja
    { ll: [10.493652, -66.852496], a: 'COM', pisos: 4, col: '#d9d4ca', shop: 1, nota: 'locales «Martell», izq. (f_0345)' },
    { ll: [10.493419, -66.852679], a: 'RES', alt: 1, pisos: 14, col: '#ece9e2', shop: 1, nota: 'torre blanca, izq. (f_0344)' },
    { ll: [10.493036, -66.853105], a: 'COM', h: 8, col: '#ddd2bd', shop: 1, nota: 'manzana comercial baja de 2–3 pisos con locales (Edificio Caribe), izq. (f_0347)' },
    { ll: [10.493205, -66.853242], a: 'RES', alt: 1, pisos: 10, col: '#e6e2d8', shop: 1, nota: 'Hotel Chacao Suites, izq.' },
    { ll: [10.493755, -66.853544], a: 'RES', pisos: 8, col: '#e9d79a', shop: 1, nota: 'Edificio Briceño: crema-amarillo con locales, der. (f_0346)' },
    { ll: [10.492947, -66.853994], a: 'BRI', pisos: 8, col: '#ecebe5', shop: 1, nota: 'Edificio Los Llanos: comercial blanco, izq. (f_0348)' },
    { ll: [10.493333, -66.854830], a: 'RES', alt: 1, pisos: 22, col: '#bd6a45', shop: 0, nota: 'Torre Provincial Roygar: ladrillo naranja, der. (f_0349)' },
    { ll: [10.493098, -66.854851], a: 'BRI', pisos: 14, col: '#b7aa95', shop: 1, nota: 'edificio de nervios de concreto con la boca del Metro Chacao, der. (f_0351)' },
    { ll: [10.493009, -66.855608], a: 'VID', alt: 1, pisos: 18, col: '#aab7c2', shop: 1, nota: 'Edificio Valmy: oficinas blancas y vidrio, der. (f_0350)' },
    { ll: [10.492059, -66.855065], a: 'RES', alt: 1, pisos: 25, col: '#b65a3c', shop: 1, nota: 'torre de ladrillo con cuerpo de vidrio azul, izq. (f_0348–0349)' },
    { ll: [10.492317, -66.855496], a: 'BRI', pisos: 8, col: '#dcd8cf', shop: 1, nota: 'Centro Perú, izq.' },
    { ll: [10.492274, -66.856023], a: 'RES', alt: 1, pisos: 16, col: '#c46a45', shop: 1, nota: 'Torre Cemica: ladrillo, izq. (f_0351)' },
    { ll: [10.492844, -66.856196], a: 'BRI', pisos: 20, col: '#a9a397', shop: 1, nota: 'Torre MTC: concreto nervado gris con valla, der. (f_0351)' },
    { ll: [10.492725, -66.856856], a: 'BRI', pisos: 8, col: '#e8e6e0', shop: 1, nota: 'Edificio Lucerna, der.' },
    { ll: [10.492680, -66.857056], a: 'COM', alt: 1, pisos: 3, col: '#2f4f9a', shop: 1, nota: 'local azul y rojo de Gran Misión Vivienda, der. (f_0352)' },
    { ll: [10.492623, -66.857280], a: 'RES', alt: 1, pisos: 20, col: '#d9cdb3', shop: 1, nota: 'Torre INAVI: beige con bandera en la azotea, der. (f_0352)' },
    // ── El Rosal (km 38,3–38,7; f_0353–f_0356)
    { ll: [10.491655, -66.857509], a: 'RES', alt: 1, pisos: 10, col: '#e3dfd6', shop: 1, nota: 'Edificio Cosmos, izq.' },
    { ll: [10.491839, -66.857697], a: 'RES', alt: 1, pisos: 10, col: '#c9764f', shop: 1, nota: 'Edificio Tucuragua: ladrillo, izq. (f_0353)' },
    { ll: [10.491405, -66.857837], a: 'RES', alt: 1, pisos: 20, col: '#c0623f', shop: 1, nota: 'torre de ladrillo naranja con la valla Print ON, izq. (f_0354)' },
    { ll: [10.492207, -66.858691], a: 'RES', alt: 1, pisos: 18, col: '#d2b48c', shop: 1, nota: 'Edificio Saule, der.' },
    { ll: [10.491443, -66.858787], a: 'COM', pisos: 5, col: '#e2ddd3', shop: 1 },
    { ll: [10.491701, -66.859616], a: 'COM', alt: 1, h: 7, col: '#d32f2f', shop: 1, nota: "McDonald's, izq. (f_0354)" },
    { ll: [10.491607, -66.859833], a: 'RES', pisos: 10, col: '#e5e1d8', shop: 1, nota: 'Edificio Andrea, izq.' },
    { ll: [10.491793, -66.860329], a: 'BRI', pisos: 15, col: '#e9e9e6', shop: 1, nota: 'Torre KPMG: retícula blanca y negra, izq. (f_0356)' },
    { ll: [10.492309, -66.860324], quitar: true, nota: 'Torre Kira: en obra; su esqueleto de losas va a mano en zona_meta.js (f_0355)' },
    { ll: [10.492481, -66.860636], quitar: true, nota: 'resto del solar de la obra antes del cruce (f_0355)' },
    { ll: [10.492320, -66.861119], a: 'RES', alt: 1, pisos: 24, col: '#c4552f', shop: 0, nota: 'torre terracota de fachada curva con bandas de vidrio, pasado el cruce der. (f_0356)' },
    { ll: [10.492542, -66.861254], a: 'RES', alt: 1, pisos: 25, col: '#c65d36', shop: 1, nota: 'Torre Edicampo' },
    // ── Centro Lido → cruce de Phelps (km 38,75–39,3; f_0357–f_0361). El Lido es hito (centro_lido.js)
    { ll: [10.492145, -66.862025], a: 'RES', alt: 1, pisos: 18, col: '#ddd1b6', shop: 1, nota: 'Ambassador Suites: concreto crema, der. (f_0357)' },
    { ll: [10.492378, -66.862463], a: 'BRI', pisos: 14, col: '#cfc6b2', shop: 0, nota: 'Torre Credival' },
    { ll: [10.492007, -66.862496], a: 'BRI', pisos: 8, col: '#7d6a58', shop: 1, nota: 'Edificio Latino: concreto pardo con jardineras, der. (f_0358)' },
    { ll: [10.491981, -66.863079], a: 'BRI', pisos: 16, col: '#d8d2c4', shop: 1, nota: 'Torre La Primera' },
    { ll: [10.491894, -66.863435], a: 'RES', alt: 1, pisos: 12, col: '#e4dccb', shop: 1, nota: 'Edificio Roraima' },
    { ll: [10.491826, -66.863723], a: 'BRI', pisos: 14, col: '#cfc8b8', shop: 1, nota: 'Edificio Seguros Venezuela' },
    { ll: [10.491585, -66.864210], a: 'VID', pisos: 18, col: '#3f6fa3', shop: 1, nota: 'Torre Europa: vidrio azul sobre base de ladrillo, der. (f_0361)' },
    { ll: [10.490998, -66.863464], a: 'VID', pisos: 18, col: '#2f4d78', shop: 1, nota: 'Bancaribe Torre Empresarial: vidrio azul oscuro con columnas de ladrillo, izq. (f_0359)' },
    { ll: [10.490973, -66.863943], a: 'BRI', pisos: 18, col: '#d8cfbd', shop: 1 },
    { ll: [10.490826, -66.864555], a: 'VID', alt: 1, pisos: 26, col: '#5a7fa8', shop: 1, nota: 'torre de vidrio azul, izq. (f_0360)' },
    { ll: [10.490605, -66.865136], a: 'VID', pisos: 22, col: '#4b6f98', shop: 1 },
    { ll: [10.490446, -66.865808], a: 'COM', h: 16, col: '#efebe2', shop: 1, mural: 0, nota: 'edificio del mural multicolor en el cruce de Phelps (el mural va a mano), izq. (f_0361)' },
    { ll: [10.490638, -66.865563], a: 'COM', h: 12, col: '#e4e0d6', shop: 1 },
    // ── Av. El Parque / Santa Lucía (km 39,3–39,65; f_0362–f_0365)
    { ll: [10.491260, -66.866542], a: 'RES', alt: 1, pisos: 8, col: '#e6e0cf', shop: 1, nota: 'Torre Country Club: bloque crema de 8 pisos, no torre de 92 m (f_0362)' },
    { ll: [10.492197, -66.866453], a: 'RES', pisos: 8, col: '#e8ddc6', shop: 1, nota: 'beige de balcones, der. (f_0363)' },
    { ll: [10.492557, -66.866750], a: 'RES', pisos: 8, col: '#c8735a', shop: 1, nota: 'Residencias Ritz: ladrillo rojo, der. (f_0363)' },
    { ll: [10.492126, -66.867190], a: 'VID', pisos: 9, col: '#3d5161', shop: 1, nota: 'Hotel Chacao Cumberland: vidrio oscuro con locales, izq. (f_0363)' },
    { ll: [10.492153, -66.867554], a: 'VID', col: '#34495c', shop: 1, nota: 'Torre CrediCard' },
    { ll: [10.492679, -66.867829], a: 'RES', pisos: 4, col: '#e6c04a', shop: 1, old: 1, nota: 'casona amarilla de «La Posada», der. (f_0364)' },
    { ll: [10.492930, -66.867680], a: 'RES', pisos: 26, col: '#b4553a', shop: 0, nota: 'Torre C de El Bosque: ladrillo con balcones, der. (f_0364)' },
    // ── Av. Francisco Solano (km 39,65–41,1; f_0365–f_0382): calle de un sentido, bloques de 6–16 pisos, santamarías y árboles
    { ll: [10.492925, -66.868674], a: 'RES', pisos: 16, col: '#e4dfd2', shop: 0, nota: 'Edificio El Jabillo (serie de 6 torres crema de 16 pisos), der. (f_0365)' },
    { ll: [10.493067, -66.868804], a: 'RES', pisos: 16, col: '#e4dfd2', shop: 0 },
    { ll: [10.493023, -66.869040], a: 'RES', pisos: 16, col: '#e1dbcc', shop: 0 },
    { ll: [10.493084, -66.869347], a: 'RES', pisos: 16, col: '#e4dfd2', shop: 0 },
    { ll: [10.493147, -66.869654], a: 'RES', pisos: 16, col: '#e1dbcc', shop: 0 },
    { ll: [10.493223, -66.870013], a: 'RES', pisos: 16, col: '#e4dfd2', shop: 1 },
    { ll: [10.493491, -66.871759], a: 'RES', pisos: 6, col: '#d9c79a', shop: 1, old: 1, nota: 'residencial viejo beige de balcones con santamarías, der. (f_0368)' },
    { ll: [10.493115, -66.872006], a: 'RES', pisos: 7, col: '#d8cdb4', shop: 1, nota: 'beige con locales, izq. (f_0369)' },
    { ll: [10.493017, -66.872188], a: 'COM', pisos: 2, col: '#ede9e1', shop: 1 },
    { ll: [10.493472, -66.872114], a: 'COM', pisos: 3, col: '#8d8a84', shop: 1, nota: 'locales grises con grafiti en las santamarías, der. (f_0369)' },
    { ll: [10.493614, -66.872696], a: 'RES', alt: 1, pisos: 10, col: '#a8a49b', shop: 1, nota: 'bloque brutalista gris de celosías, der. (f_0370)' },
    { ll: [10.493412, -66.873569], a: 'BRI', pisos: 14, col: '#9e9b94', shop: 1, nota: 'Edificio Pasaje Concordia: concreto nervado gris, izq. (f_0371)' },
    { ll: [10.493225, -66.873773], a: 'RES', alt: 1, pisos: 18, col: '#c0623f', shop: 0, nota: 'torre de ladrillo detrás, izq. (f_0371)' },
    { ll: [10.493512, -66.874175], a: 'VID', alt: 1, col: '#2f3c4a', shop: 1, nota: 'Centro Empresarial Sabana Grande: torre de vidrio oscuro (f_0371–0372)' },
    { ll: [10.493095, -66.872663], a: 'CASA', h: 7, col: '#d7c2a0', shop: 0, old: 1, nota: 'casona vieja de techo de teja con su tapia, izq. (f_0370); no solar vacío' },
    { ll: [10.493714, -66.873194], a: 'CASA', h: 7, col: '#e7c43c', shop: 1, old: 1, nota: 'casa colonial amarilla, der. (f_0372)' },
    // Centro Residencial Solano: las tres torres de celosía de ladrillo y su basamento de bandas van a mano en zona_meta.js (f_0372–f_0373)
    { ll: [10.495021, -66.875112], quitar: true, nota: 'torre de celosía 1 (a mano)' },
    { ll: [10.495023, -66.875313], quitar: true, nota: 'torre de celosía 2 (a mano)' },
    { ll: [10.495052, -66.875532], quitar: true, nota: 'torre de celosía 3 (a mano)' },
    { ll: [10.494407, -66.874628], quitar: true, nota: 'basamento escalonado de bandas de ladrillo (a mano, en terrazas que siguen la acera)' },
    { ll: [10.494371, -66.875493], a: 'RES', pisos: 6, col: '#e3d6b8', shop: 1, old: 1, nota: 'residencial crema viejo, izq. (f_0373)' },
    // (auditoría 19-nov) la huella OSM de la iglesia va en diagonal a la calle y su arista cercana quedaba a 8–18 m del eje: en f_0374 la nave corre
    // paralela a la acera, con la portada y la escalinata a ~3 m del brocal. Se quita y se rehace alineada con la ruta (10–27 m a la derecha, 40 m de nave).
    { ll: [10.495290, -66.876064], quitar: true, nota: 'huella OSM de la iglesia, en diagonal y retirada (el punto cae en su fondo, fuera del poly nuevo)' },
    { poly: [[10.4950592, -66.8760038], [10.4952215, -66.8763346], [10.4953595, -66.8762662], [10.4951971, -66.8759349]],
      a: 'CASA', h: 12, col: '#efebe2', shop: 0, old: 1, nota: 'Iglesia de la Av. Solano: nave blanca neoclásica pegada a la acera, km 40,54–40,58 der. (f_0374)' },
    // (auditoría 19-nov) quioscos de 29 y 85 m² que OSM pone en medio de las bocacalles de San Gerónimo (km 40,67 izq.) y Los Mangos (km 40,18 der.)
    { ll: [10.495349, -66.877107], quitar: true, nota: 'quiosco sobre la Calle San Gerónimo' },
    { ll: [10.493831, -66.873061], quitar: true, nota: 'caseta sobre la Calle Los Mangos' },
    { ll: [10.494902, -66.876748], a: 'RES', alt: 1, pisos: 16, col: '#e2a065', shop: 0, nota: 'torre salmón, izq. (f_0375)' },
    { ll: [10.495129, -66.876687], a: 'COM', pisos: 2, col: '#f1efea', shop: 1, nota: 'comercio blanco bajo, izq. (f_0375)' },
    { ll: [10.495336, -66.877300], a: 'BRI', pisos: 18, col: '#d9cdb8', shop: 1, nota: 'Tesorería de Seguridad Social' },
    { ll: [10.495783, -66.877222], a: 'RES', pisos: 7, col: '#b9b84c', shop: 1, old: 1, nota: 'edificio verde-amarillo de balcones, der. (f_0375)' },
    { ll: [10.495687, -66.877195], a: 'RES', pisos: 7, col: '#c2bf55', shop: 1, old: 1 },
    { ll: [10.495685, -66.876789], a: 'RES', pisos: 5, col: '#d8cfbc', shop: 1 },
    { ll: [10.495976, -66.877639], a: 'VID', pisos: 11, col: '#2c3a48', shop: 1, nota: 'muro cortina oscuro pegado a la acera der. (f_0376)' },
    { ll: [10.495300, -66.877811], a: 'RES', pisos: 9, col: '#ede8dd', shop: 1, nota: 'blanco de balcones curvos, izq. (f_0376–0377)' },
    { ll: [10.496299, -66.878694], a: 'RES', pisos: 6, col: '#c97a55', shop: 1, nota: 'ladrillo y crema con el Castellino, der. (f_0377)' },
    { ll: [10.496403, -66.878921], a: 'BRI', pisos: 9, col: '#dcd2bc', shop: 1, nota: 'Centro Médico: concreto crema, der. (f_0378)' },
    { ll: [10.495602, -66.878423], a: 'RES', pisos: 9, col: '#e8e3d8', shop: 1 },
    { ll: [10.495566, -66.878789], a: 'RES', alt: 1, pisos: 15, col: '#ecebe6', shop: 1, nota: 'residencial blanco alto, izq. (f_0378)' },
    // huella con una lengüeta (alero o pasaje mal trazado en OSM) que atravesaba la calzada en km 40,81 (eje y carril derecho): se rehace sin ella
    { ll: [10.495915, -66.878425], quitar: true, nota: 'lengüeta sobre la calzada, km 40,81' },
    { poly: [[10.495939, -66.878317], [10.495919, -66.878245], [10.496020, -66.878216], [10.496077, -66.878417], [10.495976, -66.878447], [10.495965, -66.878408]],
      a: 'RES', pisos: 6, col: '#d8cdb4', shop: 1, old: 1, nota: 'residencial viejo de balcones con locales, der. (f_0378–0379), sin la lengüeta' },
    { ll: [10.496401, -66.879138], a: 'COM', pisos: 3, col: '#a7aaa8', shop: 1, old: 1, nota: 'viejo gris con locales, der. (f_0379)' },
    { ll: [10.496649, -66.879627], a: 'RES', alt: 1, pisos: 8, col: '#b9573d', shop: 1, nota: 'ladrillo rojo con celosía y el pendón «Calle Cerrada», der. (f_0380)' },
    { ll: [10.495908, -66.879462], a: 'VID', pisos: 9, col: '#38434d', shop: 1, nota: 'Galerías Bolívar: vidrio oscuro y concreto, izq. (f_0380)' },
    // ── Llegada a Plaza Venezuela (km 41,0–41,4; f_0381–f_0385)
    { ll: [10.496323, -66.880415], a: 'BRI', pisos: 16, col: '#b7b4aa', shop: 0, nota: 'Torre Banvenez (va ANTES del poly de abajo: su punto cae también dentro de él y el poly debe mandar)' },
    // huella OSM de 5005 m² con una lengüeta que cruzaba la calzada a la DERECHA (km 41,00–41,09, choque en los tres carriles):
    // se quita la lengüeta (el punto cae solo en ella) y se rehace la huella recortada a 9,5 m a la izquierda del eje, con la fachada larga a la vía
    { ll: [10.496486, -66.880179], quitar: true, nota: 'huella OSM del cuerpo bajo de Banvenez; cruzaba la calzada en km 41,0' },
    { poly: [[10.496438, -66.880558], [10.496424, -66.880566], [10.496456, -66.880741], [10.496449, -66.880777], [10.496410, -66.880785], [10.496273, -66.880872], [10.495895, -66.880946], [10.495827, -66.880616], [10.495804, -66.880579], [10.495773, -66.880412], [10.495795, -66.880408], [10.495862, -66.880365], [10.496176, -66.880304], [10.496183, -66.880316], [10.496223, -66.880308], [10.496206, -66.880222], [10.496342, -66.880162]],
      a: 'BRI', pisos: 5, col: '#a3a49d', shop: 0, nota: 'cuerpo bajo de concreto gris con muro largo, izq. (f_0382), recortado fuera de la calzada' },
    { ll: [10.496926, -66.880275], a: 'RES', alt: 1, pisos: 9, col: '#e3d6bd', shop: 1 },
    { ll: [10.495536, -66.881548], a: 'VID', pisos: 20, col: '#b89a5a', shop: 1, nota: 'Torre Lincoln: vidrio dorado, izq. (f_0384)' },
    { ll: [10.495603, -66.881925], a: 'VID', alt: 1, col: '#3e4f5e', shop: 1, nota: 'Torre Domus: retícula de vidrio oscuro, izq. (f_0384)' },
    { ll: [10.496532, -66.883733], a: 'BRI', pisos: 18, col: '#cfc8b6', shop: 0, nota: 'bloque de celosía de concreto sobre la trinchera, der. (f_0386)' },
    // ── Salida del túnel y Paseo Colón (km 41,8–42,2; f_0388–f_0396)
    { ll: [10.498208, -66.886334], a: 'BRI', h: 22, col: '#d6ccb6', shop: 0, nota: 'estacionamiento del Edificio Polar: caja beige de rejillas horizontales, der. (f_0389)' },
    { ll: [10.498761, -66.887726], a: 'RES', pisos: 18, col: '#c0603f', shop: 0, nota: 'torre de ladrillo naranja tras los árboles, der. (f_0390)' },
    { ll: [10.499525, -66.888904], a: 'RES', pisos: 24, col: '#c26443', shop: 0, nota: 'torre de ladrillo de la valla Daka al fondo (f_0389)' },
    // ── Huellas de la IA (manzanas fundidas) atravesadas por calles de OSM, km 37,6–39,2 (19-nov-2026). Con la foto satelital z19 las calles
    //    de OSM caen sobre la calzada real y las huellas se pasan de la acera: se quita la original (punto en la parte recortada) y se rehace
    //    con la misma corrección, recortada a la calle (media calzada: 7 m avenida principal, 5 m terciaria, 4,5 m residencial).
    { ll: [10.495404, -66.851022], quitar: true, nota: 'km 37,61 der.: huella cruzada por Avenida Eugenio Mendoza' },
    { poly: [[10.494478, -66.852298], [10.494445, -66.852285], [10.494464, -66.852269], [10.494444, -66.852244], [10.494472, -66.85217], [10.494511, -66.852138], [10.494573, -66.852163], [10.494583, -66.852033], [10.494656, -66.851971], [10.494719, -66.851809], [10.494689, -66.851806], [10.494743, -66.851668], [10.494847, -66.851677], [10.495116, -66.850989], [10.495437, -66.851086], [10.495437, -66.851093], [10.495494, -66.851116], [10.495449, -66.851232], [10.495319, -66.85118], [10.494885, -66.852289], [10.494919, -66.852303], [10.494904, -66.85234], [10.494598, -66.852315], [10.49448, -66.852267]], a: "RES", pisos: 10, col: '#e3d3a8', shop: 1, nota: 'km 37,61 der.: recortada a Avenida Eugenio Mendoza · bloque crema de 10 pisos tras los árboles, der.; no torre de 100 m (f_' },
    { ll: [10.49405, -66.852201], quitar: true, nota: 'km 37,81 izq.: huella cruzada por Avenida Principal de Bello Campo' },
    { poly: [[10.49288, -66.852848], [10.492853, -66.852824], [10.492883, -66.852789], [10.492953, -66.852372], [10.492935, -66.852356], [10.493, -66.851969], [10.493133, -66.851993], [10.493114, -66.852108], [10.493125, -66.852162], [10.493148, -66.852025], [10.493684, -66.852118], [10.494044, -66.852238], [10.49358, -66.852772], [10.493532, -66.852763], [10.493473, -66.85283], [10.493329, -66.853685], [10.493098, -66.853644], [10.493061, -66.853462], [10.493028, -66.85366], [10.493059, -66.853653], [10.493109, -66.853662], [10.493017, -66.854208], [10.492595, -66.854134], [10.492575, -66.854116], [10.492653, -66.853652], [10.492837, -66.853684], [10.492818, -66.853591], [10.492889, -66.853604], [10.492762, -66.85349], [10.49277, -66.853445], [10.492779, -66.853446]], a: "BRI", pisos: 8, col: '#ecebe5', shop: 1, alt: 1, h: 8, nota: 'km 37,81 izq.: recortada a Avenida Principal de Bello Campo · Edificio Los Llanos: comercial blanco, izq. (f_0348)' },
    { ll: [10.493752, -66.853992], quitar: true, nota: 'km 37,97 der.: huella cruzada por Calle Cecilio Acosta' },
    { poly: [[10.493096, -66.855711], [10.493097, -66.855699], [10.492837, -66.855667], [10.492877, -66.855335], [10.492985, -66.855349], [10.492993, -66.855283], [10.492985, -66.855282], [10.493026, -66.854937], [10.493216, -66.85496], [10.493317, -66.854158], [10.493436, -66.854173], [10.493458, -66.853984], [10.493722, -66.854029], [10.493879, -66.854049], [10.493867, -66.854151], [10.493677, -66.854127], [10.493616, -66.854638], [10.49347, -66.85462], [10.493447, -66.854813], [10.493338, -66.854799], [10.493281, -66.855272], [10.493267, -66.855271], [10.493213, -66.855725]], a: "VID", alt: 1, pisos: 18, col: '#aab7c2', shop: 1, nota: 'km 37,97 der.: recortada a Calle Cecilio Acosta · Edificio Valmy: oficinas blancas y vidrio, der. (f_0350)' },
    { ll: [10.491916, -66.857382], quitar: true, nota: 'km 38,34 izq.: huella cruzada por Avenida La Joya y Calle El Metro' },
    { poly: [[10.491126, -66.857277], [10.491528, -66.857363], [10.491546, -66.857443], [10.491581, -66.857375], [10.491996, -66.857467], [10.491968, -66.85786], [10.491818, -66.857849], [10.491822, -66.857865], [10.491114, -66.857821], [10.491117, -66.857774], [10.491209, -66.857781], [10.491098, -66.857721], [10.491111, -66.857542], [10.491014, -66.857535], [10.491033, -66.85727]], a: "RES", alt: 1, pisos: 20, col: '#c0623f', shop: 1, nota: 'km 38,34 izq.: recortada a Avenida La Joya y Calle El Metro · torre de ladrillo naranja con la valla Print ON, izq. (f_0354)' },
    { poly: [[10.491866, -66.858065], [10.491812, -66.858167], [10.491539, -66.858147], [10.491547, -66.85803], [10.491466, -66.858048], [10.491457, -66.858005], [10.491385, -66.858021], [10.49138, -66.858099], [10.491359, -66.858004], [10.491271, -66.857997], [10.491239, -66.858058], [10.491176, -66.858054], [10.491243, -66.858038], [10.491246, -66.858002], [10.491207, -66.85801], [10.491104, -66.857954], [10.491107, -66.857903], [10.49184, -66.857949]], a: "RES", alt: 1, pisos: 20, col: '#c0623f', shop: 1, nota: 'km 38,34 izq.: recortada a Avenida La Joya y Calle El Metro · torre de ladrillo naranja con la valla Print ON, izq. (f_0354)' },
    { ll: [10.493269, -66.857934], quitar: true, nota: 'km 38,36 der.: huella cruzada por Calle Sucre y Avenida Guaicaipuro' },
    { poly: [[10.492754, -66.857966], [10.493285, -66.857976], [10.493295, -66.858107], [10.493278, -66.858107], [10.49328, -66.858159], [10.4933, -66.858158], [10.493344, -66.858562], [10.493331, -66.858562], [10.493335, -66.858642], [10.493353, -66.858641], [10.493379, -66.858887], [10.493145, -66.858898], [10.49313, -66.858571], [10.493104, -66.858572], [10.493096, -66.858398], [10.492949, -66.858405], [10.49295, -66.858432], [10.492776, -66.85844]], h: 26.5, nota: 'km 38,36 der.: recortada a Calle Sucre y Avenida Guaicaipuro' },
    { ll: [10.492273, -66.857886], quitar: true, nota: 'km 38,42 der.: huella cruzada por Calle Urdaneta y Avenida Guaicaipuro' },
    { poly: [[10.492681, -66.858417], [10.492587, -66.858432], [10.492513, -66.858421], [10.492497, -66.858319], [10.492465, -66.85828], [10.492411, -66.858288], [10.492452, -66.85852], [10.492523, -66.858509], [10.492531, -66.858452], [10.492644, -66.858468], [10.492631, -66.858559], [10.492659, -66.858563], [10.492707, -66.858877], [10.492737, -66.859543], [10.492636, -66.859536], [10.492644, -66.859591], [10.492282, -66.859649], [10.492247, -66.859425], [10.492347, -66.859409], [10.492356, -66.85934], [10.492501, -66.859361], [10.49247, -66.859161], [10.492511, -66.859155], [10.492471, -66.858897], [10.49243, -66.859192], [10.492074, -66.859141], [10.49223, -66.857955], [10.49261, -66.857962]], a: "RES", alt: 1, pisos: 18, col: '#d2b48c', shop: 1, nota: 'km 38,42 der.: recortada a Calle Urdaneta y Avenida Guaicaipuro · Edificio Saule, der.' },
    { ll: [10.491794, -66.858285], quitar: true, nota: 'km 38,44 izq.: huella cruzada por Calle El Muñeco' },
    { poly: [[10.491648, -66.858778], [10.491639, -66.858852], [10.491818, -66.858875], [10.491785, -66.85913], [10.491755, -66.859189], [10.49164, -66.859174], [10.491584, -66.859145], [10.491515, -66.859136], [10.491524, -66.859066], [10.491438, -66.859238], [10.491297, -66.85917], [10.49134, -66.858839], [10.491202, -66.858821], [10.491216, -66.85871], [10.491271, -66.858717], [10.491282, -66.858627], [10.491226, -66.858598], [10.491248, -66.858419], [10.491176, -66.858409], [10.491178, -66.858391], [10.491126, -66.858364], [10.49115, -66.858178], [10.491243, -66.85819], [10.491814, -66.858327], [10.491754, -66.858792]], a: "COM", pisos: 5, col: '#e2ddd3', shop: 1, nota: 'km 38,44 izq.: recortada a Calle El Muñeco' },
    { ll: [10.494386, -66.852895], quitar: true, nota: 'km 37,72 der.: pieza de 24 m² sobre la Calle Bolívar (no está en la foto)' },
    // auditoría final 19-nov (afb_38.72): huella de 1.448 m² a 12 m a la izq. del eje (Microsoft/Google, sin etiqueta OSM), sobre la trinchera del paso
    // inferior Neomar Lander; salía como una pared gris acanalada de 10 m pegada a la baranda. En f_0355–f_0357 ahí solo están el murete, la otra calzada y las torres
    { ll: [10.491561, -66.861420], quitar: true, nota: 'km 38,74 izq.: losa del paso inferior tomada por edificio' },
    { ll: [10.494465, -66.852906], quitar: true, nota: 'km 37,72 der.: pieza de 29 m² sobre la Calle Bolívar' },
    { ll: [10.490657, -66.864252], quitar: true, nota: 'km 39,15 izq.: huella cruzada por Calle Mohedano' },
    { poly: [[10.490416, -66.864809], [10.490448, -66.864816], [10.490553, -66.864286], [10.490997, -66.86437], [10.490844, -66.865113], [10.490653, -66.865072], [10.49069, -66.864895], [10.490599, -66.864875], [10.490579, -66.864973], [10.490567, -66.86497], [10.490557, -66.865021], [10.490599, -66.86503], [10.490585, -66.865096], [10.490811, -66.865145], [10.490633, -66.866003], [10.490593, -66.865994], [10.490567, -66.866118], [10.490163, -66.866032]], a: "COM", pisos: 22, col: '#e4e0d6', shop: 1, alt: 1, h: 12, mural: 0, nota: 'km 39,15 izq.: recortada a Calle Mohedano · edificio del mural multicolor en el cruce de Phelps (el mural va a man' },
  ],
  via: [
    // Altamira → Chacaíto: Francisco de Miranda, 3 canales con baranda negra sobre brocal amarillo (f_0340–f_0361); copas medianas en la acera derecha
    { km0: 37.30, km1: 39.28, set: { 'veg.palL': 0, 'veg.palR': 0, 'veg.R': .35, 'veg.L': .15 } },
    // paso inferior Neomar Lander: no hay baranda central, el borde izquierdo es el murete de la trinchera (zona_meta.js)
    { km0: 38.56, km1: 38.78, set: { sep: 'ninguno', 'veg.L': 0 } },
    // Av. El Parque / Santa Lucía: un solo sentido, 2–3 canales, árboles grandes (f_0362–f_0364)
    { km0: 39.30, km1: 39.62, set: { sep: 'ninguno', calzadas: 1, canales: 3, ancho: 12, 'veg.L': .4, 'veg.R': .35, 'veg.palL': 0, 'veg.palR': 0 } },
    // Av. Francisco Solano: un solo sentido de 3 canales con carros parados, aceras angostas, árboles; palmeras solo junto a la torre de ladrillo
    // (nov-2026) el video muestra copas casi continuas en las dos aceras (f_0366–f_0380): de .4/.45 y densidad 2 a .6 y densidad 3 (≈5 árboles por 50 m y lado)
    { km0: 39.65, km1: 41.15, set: { sep: 'ninguno', calzadas: 1, canales: 3, ancho: 14, 'veg.L': .42, 'veg.R': .42, 'veg.denL': 2, 'veg.denR': 2, 'veg.palL': 0, 'veg.palR': 0, 'L.retiro': 2, 'R.retiro': 2 } },
    // tipo por tramo para las huellas sin corrección puntual: la Solano es residencial de 6–16 pisos con locales, no «casas» ni «torre de vidrio»
    { km0: 39.98, km1: 40.45, set: { 'L.tipo': 'residencial' } },
    { km0: 40.38, km1: 40.45, set: { 'R.tipo': 'residencial' } },
    { km0: 40.49, km1: 40.66, set: { 'R.tipo': 'residencial' } },
    // palmeras delante de las torres de celosía del Centro Residencial Solano (f_0373)
    { km0: 40.38, km1: 40.52, set: { 'veg.palR': .5 } },
  ],
  relieve: [],
  estructuras: [],
};
