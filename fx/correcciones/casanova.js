// Correcciones de la zona casanova (km 20.8–23.3). Contrato en fx/correcciones/LEEME.md
// Referencia: video en carro, fotogramas f_0206–f_0228 (s 512–567). Desfase del índice de fotogramas: ~0 entre 20,8 y 21,9
// (anclas: Torre Banhorient a la izq. en el giro a la derecha = km 21,05 ↔ f_0209 s 520; Edificio Adriatica der. = 21,88 ↔ f_0216),
// y crece a +0,10 en Chacaíto (Firestone der. = 22,60 ↔ f_0222, índice 22,68) y a +0,17 en El Rosal (Centro Cultural Chacao der.
// = 23,17 ↔ f_0228, índice 23,35). El tramo 20,8–21,05 (salida del puente de Las Acacias) lo dejó ucv_acacias; aquí se valida.
// Lo singular (letrero de Banco Plaza, bóvedas del C.C. del Este, Firestone, Metropark con su noria, fachada naranja del
// Centro Cultural Chacao) está a mano en landmarks/zona_casanova.js.
const COM = 'comercial bajo con santamarías';
export default {
  edif: [
    // ── Av. Las Acacias, salida del puente (20,8–21,05; f_0206–0209)
    { ll: [10.494822, -66.881687], a: 'BRI', pisos: 22, col: '#cfd1d0', shop: 1, nota: 'Torre Banhorient: gris claro de bandas horizontales blancas, esquina izq. del giro (f_0209)' },
    { ll: [10.492889, -66.882103], a: 'RES', pisos: 8, col: '#c9a878', shop: 1, alt: 1, nota: 'edificio canela con valla en la azotea, esquina der. del cruce de los charcos, km 20,88 (f_0207)' },
    { ll: [10.493646, -66.881602], a: 'RES', pisos: 6, col: '#c4c6c2', shop: 1, alt: 1, nota: 'bloque gris de concreto con vitrina verde, km 20,98 der. (f_0208)' },
    // ── Primera cuadra tras el giro, calle estrecha en subida (21,08–21,2; f_0210)
    { ll: [10.494898, -66.880811], a: 'RES', pisos: 4, col: '#e6e2d6', shop: 0, alt: 1, nota: 'edificio blanco viejo de ventanas con rejas, sobre muro con baranda, km 21,13 izq. (f_0210)' },
    { ll: [10.494197, -66.880988], a: 'COM', pisos: 2, col: '#ddd6c6', shop: 1, nota: 'locales bajos, km 21,14 der.' },
    // km 21,12: el frente de los locales invadía el borde derecho de la calle estrecha; recortado a 7,5 m del eje
    { ll: [10.494389, -66.881012], quitar: true, nota: 'frente de los locales metido en la calzada, km 21,12 der.' },
    { poly: [[10.494034, -66.880825], [10.49415, -66.880851], [10.494135, -66.88092], [10.494264, -66.880948], [10.494252, -66.881007], [10.494333, -66.881006], [10.494361, -66.881102], [10.494381, -66.881173], [10.494376, -66.881218], [10.493969, -66.881129]],
      a: 'COM', pisos: 2, col: '#ddd6c6', shop: 1, nota: 'locales bajos recortados a 7,5 m del eje' },
    // ── Av. Casanova: C.C. del Este y Daka (21,2–21,3; f_0211)
    { ll: [10.494366, -66.880482], a: 'COM', h: 7, col: '#5d636b', shop: 1, alt: 1, nota: 'tiendas oscuras de Smart, km 21,19 izq.' },
    { ll: [10.494513, -66.879966], a: 'COM', h: 8, col: '#626a73', shop: 1, alt: 1, nota: 'C.C. del Este: fachada gris oscura con bóvedas blancas (bóvedas en el módulo), km 21,24 izq. (f_0211)' },
    { ll: [10.493607, -66.880665], a: 'COM', h: 9, col: '#d7b136', shop: 1, alt: 1, nota: 'Daka: caja amarilla y marrón, km 21,2 der. (f_0211)' },
    { ll: [10.494103, -66.880565], a: 'RES', pisos: 8, col: '#cfa392', shop: 0, alt: 1, nota: 'clínica de ladrillo rosado, km 21,18 der.' },
    { ll: [10.493793, -66.879755], a: 'RES', pisos: 14, col: '#e9e7e0', shop: 1, alt: 1, nota: 'torre blanca, km 21,28 der. (f_0211)' },
    { ll: [10.493344, -66.879616], a: 'RES', pisos: 9, col: '#b8643f', shop: 0, alt: 1, nota: 'ladrillo naranja de 9 pisos, km 21,31 der. (f_0211)' },
    // ── Hacia Banco Plaza (21,3–21,5; f_0212–0213)
    { ll: [10.494588, -66.879066], a: 'COM', h: 8, col: '#d8d3c8', shop: 1, alt: 1, nota: 'Continental’s: alero con letrero amarillo, km 21,33 izq. (f_0212)' },
    { ll: [10.493879, -66.878548], a: 'RES', pisos: 9, col: '#c0653e', shop: 1, alt: 1, nota: 'Edificio Boreal: ladrillo naranja con bandas blancas, km 21,40 izq. (f_0212)' },
    { ll: [10.493691, -66.879191], a: 'COM', h: 9, col: '#b5643c', shop: 0, mural: 0, detalle: 0, nota: 'Restaurant El Arabito (OSM node 2434567512): ladrillo naranja de 2 pisos, km 21,32–21,36 der.; fachada, medallones y rótulo en el módulo' },
    // km 21,33: su huella cruzaba la Casanova de lado a lado (la calle dobla y el trazado va pegado a la acera sur); recortada a 7,5 m del eje
    { ll: [10.493885, -66.879023], quitar: true, nota: 'punta del edificio de ladrillo atravesada en la calzada, km 21,33' },
    { poly: [[10.493873, -66.879302], [10.49387, -66.879341], [10.493465, -66.879366], [10.493446, -66.879137], [10.493669, -66.879118], [10.493681, -66.879273], [10.493761, -66.879267], [10.493741, -66.879005], [10.493768, -66.879008], [10.4938, -66.879086], [10.49383, -66.87917], [10.493859, -66.879255]],
      a: 'COM', h: 9, col: '#b5643c', shop: 0, mural: 0, detalle: 0, nota: 'El Arabito recortado a 7,5 m del eje (fachada en landmarks/zona_casanova.js)' },
    { ll: [10.493397, -66.879057], a: 'COM', h: 6, col: '#c9c4ba', shop: 0, nota: 'reja negra y estacionamiento, km 21,37 der.' },
    { ll: [10.493741, -66.877974], a: 'VID', h: 85, col: '#3f74b0', nota: 'Torre Banco Plaza: vidrio azul, corona gris con letrero verde (letrero en el módulo; f_0211–0212)' },
    { ll: [10.493181, -66.878266], a: 'BRI', pisos: 10, col: '#d9dadb', shop: 1, nota: 'C.C. Cediaz, km 21,46 der.' },
    { ll: [10.493354, -66.877765], a: 'RES', pisos: 7, col: '#cdb99a', shop: 1, nota: 'beige viejo de 7 pisos, km 21,50 izq. (f_0213)' },
    { ll: [10.493456, -66.877741], a: 'RES', pisos: 8, col: '#a85a43', shop: 1, alt: 1, nota: 'ladrillo rojo con franjas, km 21,50 izq. (f_0213)' },
    { ll: [10.493579, -66.876949], a: 'RES', pisos: 5, col: '#d3c4a6', shop: 1, alt: 1, nota: 'manzana de Sabana Grande, km 21,57 izq.' },
    { ll: [10.492700, -66.877417], a: 'COM', pisos: 5, col: '#eeeeec', shop: 1, alt: 1, nota: 'Traki: blanco con letrero rojo, km 21,57 der. (f_0213)' },
    // ── El Recreo (21,6–21,7; f_0214)
    { ll: [10.492421, -66.876963], a: 'VID', h: 86, col: '#3d5f86', nota: 'Torre Norte de El Recreo' },
    { ll: [10.492312, -66.876309], a: 'BRI', pisos: 22, col: '#8fa6bf', shop: 1, nota: 'torre de bandas de vidrio azul y marco gris con Ferretería en PB, km 21,69 der. (f_0214)' },
    { ll: [10.492214, -66.876468], a: 'BRI', h: 72, col: '#8fa6bf' },
    { ll: [10.492743, -66.876338], a: 'RES', pisos: 14, col: '#d9bf9a', shop: 1, nota: 'Edificio Rupi: beige de balcones curvos sobre Farmatodo, km 21,67 izq. (f_0214)' },
    // ── Casanova hacia Bello Monte (21,7–21,9; f_0215–0216)
    { ll: [10.492651, -66.876027], a: 'COM', pisos: 2, col: '#b5c93a', shop: 1, nota: 'local verde limón, km 21,71 izq. (f_0215)' },
    { ll: [10.492705, -66.876051], a: 'COM', pisos: 4, col: '#a86a4c', shop: 1, nota: 'ladrillo sin frisar, km 21,71 izq. (f_0215)' },
    { ll: [10.491705, -66.875974], a: 'COM', pisos: 3, col: '#c8643e', shop: 1, nota: 'esquina terracota con terraza, km 21,75 der. (f_0215)' },
    { ll: [10.492395, -66.875686], a: 'RES', pisos: 14, col: '#e6e3dc', shop: 1, nota: 'Edificio Don Fernando' },
    { ll: [10.491908, -66.875667], a: 'RES', pisos: 18, col: '#ecebe5', shop: 0, alt: 1, nota: 'Hotel Coliseo: torre blanca, km 21,78 der. (f_0215)' },
    { ll: [10.491928, -66.875472], a: 'RES', pisos: 10, col: '#c46a45', shop: 1, alt: 1, nota: 'Edificio Doru: ladrillo naranja, km 21,80 der. (f_0215)' },
    { ll: [10.491733, -66.875053], a: 'RES', pisos: 21, col: '#d9cbb0', shop: 1, nota: 'Torre Falcón' },
    { ll: [10.492196, -66.874658], a: 'COM', pisos: 4, col: '#d9b24a', shop: 1, nota: 'ocre con alero de madera, km 21,87 izq. (f_0216)' },
    { ll: [10.491419, -66.874901], a: 'RES', pisos: 6, col: '#e2d6bc', shop: 1 },
    { ll: [10.491695, -66.874770], a: 'RES', pisos: 7, col: '#e7dcc2', shop: 1, nota: 'Edificio Adriatica: crema de balcones, km 21,88 der. (f_0216)' },
    // ── Casanova, túnel de copas (21,9–22,2; f_0217–0218)
    { ll: [10.491949, -66.874421], a: 'COM', pisos: 4, col: '#c99a4e', shop: 1, nota: 'Unidad Médica: ocre con alero, km 21,90 izq. (f_0216)' },
    { ll: [10.491794, -66.874089], a: 'COM', pisos: 4, col: '#4e8f86', shop: 1, alt: 1, nota: 'vidrio verde con pilares marrones, km 21,94 izq. (f_0217)' },
    { ll: [10.491492, -66.874254], a: 'RES', pisos: 6, col: '#e0d2b8', shop: 1, nota: 'Edificio Josvolpe con la Colchonería, km 21,94 der. (f_0217)' },
    { ll: [10.491384, -66.874067], a: 'BRI', pisos: 7, col: '#d8d6cf', shop: 1, nota: 'Hidrocapital' },
    { ll: [10.491723, -66.873796], a: 'RES', pisos: 12, col: '#a65a40', shop: 1, alt: 1, nota: 'torre de ladrillo rojo, km 21,97 izq. (f_0217)' },
    { ll: [10.491599, -66.873444], a: 'RES', pisos: 12, col: '#cdb89a', shop: 1, nota: 'Edificio Anzoátegui: beige de balcones, km 22,01 izq. (f_0218)' },
    { ll: [10.490961, -66.873321], a: 'COM', pisos: 2, col: '#ecebe7', shop: 1, nota: 'blanco bajo, km 22,04 der. (f_0218)' },
    { ll: [10.491640, -66.872707], a: 'RES', pisos: 6, col: '#d9d6cf', shop: 1 },
    { ll: [10.491053, -66.872973], a: 'RES', pisos: 8, col: '#e2d9c3', shop: 1 },
    { ll: [10.490872, -66.872652], a: 'RES', pisos: 9, col: '#e2d9c3', shop: 1, nota: 'crema de balcones con santamarías azules, km 22,11 der. (f_0219)' },
    { ll: [10.490810, -66.872347], a: 'RES', pisos: 6, col: '#ddd0b5', shop: 1 },
    { ll: [10.490802, -66.872217], a: 'RES', pisos: 6, col: '#ddd0b5', shop: 1 },
    { ll: [10.491332, -66.872474], a: 'COM', pisos: 4, col: '#b5583a', shop: 1, nota: 'ladrillo terracota, km 22,12 izq. (f_0219)' },
    { ll: [10.491075, -66.871793], a: 'RES', pisos: 14, col: '#e9e7e2', shop: 1, alt: 1, nota: 'torre blanca, km 22,19 izq. (f_0219)' },
    // ── Llegada a Chacaíto (22,2–22,5; f_0220–0221)
    { ll: [10.490381, -66.871420], a: 'RES', pisos: 9, col: '#d5d3cc', shop: 1, nota: 'gris claro con celosías y letrero naranja en PB, km 22,26 der. (f_0220)' },
    { ll: [10.490133, -66.870943], a: 'RES', pisos: 9, col: '#d7d2c6', shop: 1 },
    { ll: [10.490516, -66.870449], a: 'RES', pisos: 10, col: '#cfcac0', shop: 1 },
    { ll: [10.490442, -66.869720], a: 'RES', pisos: 6, col: '#d9d5cc', shop: 1, nota: 'km 22,44 izq. (f_0221)' },
    { ll: [10.489813, -66.869937], a: 'RES', pisos: 6, col: '#b8613f', shop: 1, alt: 1, nota: 'Centro Torre Nova: ladrillo naranja, km 22,44 der. (f_0221)' },
    { ll: [10.490232, -66.869425], a: 'COM', pisos: 3, col: '#d8cfc0', shop: 1 },
    { ll: [10.490046, -66.869366], a: 'COM', pisos: 3, col: '#d2c8b6', shop: 1, nota: 'C.C. 777' },
    { ll: [10.490079, -66.868957], a: 'BRI', pisos: 7, col: '#cfc9bd', shop: 1, nota: 'Edificio Blandín' },
    { ll: [10.489456, -66.868939], a: 'COM', pisos: 4, col: '#e2b39a', shop: 1, nota: 'salmón con letrero amarillo, km 22,54 der. (f_0221)' },
    // ── Av. Tamanaco (22,55–23,3; f_0222–0227)
    { ll: [10.490263, -66.868293], a: 'GAL', h: 6, col: '#4a4a48', shop: 0, nota: 'estacionamiento techado con mural, km 22,61 izq. (f_0222)' },
    { ll: [10.489648, -66.867588], a: 'RES', pisos: 12, col: '#e0874a', shop: 0, alt: 1, nota: 'Torre Tamanaco: naranja y gris al frente der. (f_0222)' },
    { ll: [10.489679, -66.867243], a: 'VID', h: 70, col: '#3d86a0', nota: 'CANTV: vidrio azul verdoso, km 22,72 der. (f_0223)' },
    { ll: [10.489690, -66.866956], a: 'VID', h: 66, col: '#3b6fa8', nota: 'Torre La Unión' },
    // Metropark (izq., 22,68–22,82): explanada con la noria; los kioscos de la huella se quitan y el muro de colores va en el módulo
    { ll: [10.490132, -66.867523], quitar: true }, { ll: [10.490013, -66.867459], quitar: true },
    { ll: [10.490060, -66.867275], quitar: true }, { ll: [10.490050, -66.867165], quitar: true },
    { ll: [10.490109, -66.866933], quitar: true }, { ll: [10.490050, -66.866813], quitar: true },
    { ll: [10.490081, -66.866566], quitar: true }, { ll: [10.490153, -66.866584], quitar: true },
    { ll: [10.490366, -66.867000], quitar: true }, { ll: [10.490377, -66.866817], quitar: true },
    { ll: [10.490446, -66.865808], a: 'RES', pisos: 12, col: '#9a9f94', shop: 0, alt: 1, nota: 'torre gris moteada detrás de la noria, km 22,89 izq. (f_0224)' },
    { ll: [10.490397, -66.865422], a: 'VID', pisos: 7, col: '#9fb4c4', shop: 1, nota: '100% Banco: vidrio claro con pendones rojos, km 22,93 izq. (f_0225)' },
    { ll: [10.490475, -66.865081], a: 'VID', pisos: 7, col: '#9fb4c4', shop: 1, nota: 'sigue el bloque de vidrio claro, km 22,97 izq. (f_0225)' },
    { ll: [10.490605, -66.865136], a: 'RES', pisos: 8, col: '#cfc6b4', shop: 0, alt: 1, nota: 'manzana de 1 ha que en origen sale de 80 m; detrás del bloque de vidrio, km 22,96 izq.' },
    { ll: [10.490826, -66.864555], a: 'RES', pisos: 22, col: '#e4dece', shop: 0, alt: 1, nota: 'torre beige clara detrás, km 23,03 izq. (f_0225)' },
    { ll: [10.490021, -66.864360], a: 'RES', h: 84, col: '#9b5a45', shop: 1, alt: 1, nota: 'Torre Marriott Norte: ladrillo, con el Arizona en la base, km 23,04 der. (f_0226)' },
    { ll: [10.489719, -66.864574], a: 'RES', h: 82, col: '#a0614a', shop: 0, alt: 1, nota: 'JW Marriott: ladrillo pardo' },
    { ll: [10.490017, -66.865023], a: 'GAL', h: 4, col: '#cbc5ba', shop: 0, detalle: 0, nota: 'muro con portón, km 22,97 der. (f_0225)' },
    { ll: [10.490045, -66.864835], a: 'GAL', h: 4, col: '#cbc5ba', shop: 0, detalle: 0 },
    { ll: [10.490182, -66.863925], a: 'VID', h: 70, col: '#5d7fa0', nota: 'Torre Atlantic sobre basamento de ladrillo (Arizona), km 23,08 der. (f_0226)' },
    { ll: [10.490973, -66.863943], a: 'RES', pisos: 20, col: '#9a6b58', shop: 0, alt: 1, nota: 'torre parda, km 23,09 izq. (f_0226)' },
    { ll: [10.490578, -66.863705], a: 'VID', h: 72, col: '#3a6fc0', nota: 'Centro Empresarial Galipán: vidrio azul curvo, km 23,11 izq. (f_0226–0227)' },
    { ll: [10.490998, -66.863464], a: 'VID', col: '#3a6fc0', nota: 'Bancaribe' },
    // 19-nov: huellas de manzana entera (Google/Microsoft) que contienen el punto de una torre heredaban su altura y su color: dos cajas
    // iguales metidas una en otra, con techos y fachadas parpadeando. Van al final para que manden sobre la torre; la torre conserva la suya.
    { ll: [10.492532, -66.875468], a: 'RES', pisos: 5, col: '#d9d1c0', shop: 1, alt: 1, nota: 'manzana alrededor del Edificio Don Fernando, km 21,76 izq.' },
    { ll: [10.492196, -66.874658], a: 'COM', pisos: 3, col: '#d9b24a', shop: 1, nota: 'ocre con alero: 3 pisos para no coincidir con la Unidad Médica (4), km 21,87 izq. (f_0216)' },
    { ll: [10.491419, -66.874901], a: 'RES', pisos: 5, col: '#e2d6bc', shop: 1, nota: 'manzana de la Adriatica y la Torre Falcón, km 21,88 der.' },
    { ll: [10.492081, -66.873658], a: 'RES', pisos: 5, col: '#d8cfbd', shop: 1, alt: 1, nota: 'manzana del Edificio Anzoátegui, km 22,01 izq.' },
    { ll: [10.490232, -66.869425], a: 'COM', pisos: 4, col: '#d8cfc0', shop: 1, nota: 'manzana del C.C. 777, km 22,49 izq.' },
  ],
  via: [
    // primera cuadra tras el giro: calle estrecha de dos canales (f_0210)
    { km0: 21.08, km1: 21.2, set: { 'veg.L': .05, 'veg.R': .1, 'L.tipo': 'residencial', 'L.col': ['#e6e2d6', '#d8d2c4'] } },
    // Av. Casanova: tres canales en un sentido, comercio con santamarías bajo edificios de 6–14 pisos crema, beige y ladrillo
    { km0: 21.2, km1: 22.45, set: { canales: 3, calzadas: 1, ancho: 14, sep: 'ninguno',
      'L.col': ['#d9cdb4', '#c0653e', '#e6e2d8', '#cdb89a', '#b8643f'], 'R.col': ['#e2d9c3', '#c46a45', '#ecebe5', '#d7cbb2', '#a85a43'],
      'veg.L': .35, 'veg.R': .35, 'veg.palL': 0, 'veg.palR': 0 } },
    // túnel de copas cerradas (f_0216–0219)
    { km0: 21.8, km1: 22.3, set: { 'veg.L': .5, 'veg.R': .5, 'veg.denL': 2, 'veg.denR': 2 } },
    // Av. Tamanaco: cuatro canales, aceras con palmas y torres de oficinas (f_0222–0227)
    { km0: 22.6, km1: 22.85, set: { 'veg.L': .1, 'veg.R': .15, 'veg.palL': 0, 'veg.palR': .1 } },
    { km0: 22.85, km1: 23.3, set: { 'veg.L': .3, 'veg.R': .35, 'veg.palL': .45, 'veg.palR': .5, 'L.tipo': 'torre de vidrio', 'R.tipo': 'torre de vidrio',
      'L.col': ['#d6c3a0', '#9fb4c4', '#e3e0d8'], 'R.col': ['#5d7fa0', '#d9d6cf', '#3b6fa8'] } },
  ],
  relieve: [],
  estructuras: [],
};
