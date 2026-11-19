// Correcciones de la zona centro (km 0–3,1). Contrato en fx/correcciones/LEEME.md
// Referencia: video en carro (edición 2024), fotogramas f_0003–f_0034 (s 5–82). El trazado del juego (GPS 2025) y el del video
// coinciden en todo el tramo: Paseo Colón → trinchera bajo el Teresa Carreño → Av. Bolívar → giro a la derecha antes del Palacio
// de Justicia (km 1,65) → Av. Este 6/Oeste 6 frente a la Asamblea y las Torres de El Silencio → Av. Sur 8 entre los Bloques de
// El Silencio → Av. Universidad → Av. Sucre al pie de la escalinata de El Calvario → Plaza O'Leary.
// Anclas (km del juego ↔ fotograma): salida del túnel 0,50 ↔ f_0009; rótulo AV. BOLÍVAR 1,20 ↔ f_0014; giro 1,63 ↔ f_0017;
// Pasaje Zingg 1,97 ↔ f_0020; Asamblea a la derecha 2,15 ↔ f_0021; pilotis del Edificio Norte 2,45 ↔ f_0023–24;
// cruce Av. Sur 8 2,62 ↔ f_0025; cruce Av. Universidad 2,79 ↔ f_0029; escalinata 2,83 ↔ f_0030; 3K 2,87 ↔ f_0031; O'Leary 3,05 ↔ f_0033.
// Desfase del índice de fotogramas: el km del índice va 0,3–0,4 POR DETRÁS del juego entre el km 1,3 y 2,6 (f_0017: 1,33 ↔ 1,63;
// f_0025: 2,22 ↔ 2,62) y casi coincide desde el 2,8 (f_0030: 2,77 ↔ 2,83; f_0033: 3,07 ↔ 3,05). El video va acelerado y a saltos.
// Lo singular (muro de lamas del Paseo Colón, Palacio de Justicia, letrero de la Asamblea, fuente de O'Leary…) va en landmarks/zona_centro.js.
export default {
  edif: [
    // ── Salida del túnel: podio de Parque Central y Lobby Sur a la derecha (km 0,4–0,6; f_0009) — concreto gris con celosía
    { ll: [10.499538, -66.899365], a: 'BRI', pisos: 8, col: '#a29d93', shop: 0, nota: 'Lobby Sur de Parque Central, km 0,43 der.' },
    { ll: [10.499713, -66.899674], a: 'COM', h: 9, col: '#a7a298', shop: 0, rail: 1, detalle: 0, nota: 'Salón Venezuela, terraza de concreto' },
    { ll: [10.499558, -66.900193], a: 'BRI', pisos: 5, col: '#9f9a90', shop: 0, nota: 'bloque de concreto con celosía, km 0,50 der. (f_0009)' },
    { ll: [10.500306, -66.900773], a: 'BRI', pisos: 6, col: '#a39f96', shop: 0 },
    { ll: [10.500028, -66.899265], a: 'RES', h: 103, col: '#dcd6c9', shop: 0, alt: 1, nota: 'Hotel Alba Caracas (ex Hilton)' },
    // ── Av. Bolívar (km 0,6–1,65; f_0010–f_0017)
    { ll: [10.500498, -66.902028], a: 'COM', h: 13, col: '#ebe8df', shop: 0, alt: 1, nota: 'Galería de Arte Nacional: largo y blanco, km 0,72 der. (f_0010)' },
    { ll: [10.500855, -66.902678], a: 'COM', h: 13, col: '#e6e2d8', shop: 0, alt: 1 },
    { ll: [10.500466, -66.903904], a: 'VID', h: 62, col: '#2f5f9e', shop: 0, alt: 1, nota: 'CANTV: torre de bandas azules y blancas, km 0,91 der. (f_0012)' },
    { ll: [10.500529, -66.904100], a: 'VID', h: 58, col: '#35649f', shop: 0, alt: 1 },
    { ll: [10.499654, -66.904536], a: 'RES', pisos: 12, col: '#cf6f5c', shop: 0, rail: 1, alt: 0, nota: 'bloque GMVV de bandas rojas y blancas, km 0,96 izq. (f_0012)' },
    { ll: [10.500790, -66.904905], a: 'COM', pisos: 4, col: '#eeece6', shop: 0, alt: 1, nota: 'Escuela de Artes Plásticas Cristóbal Rojas, km 1,02 der. (f_0013)' },
    { ll: [10.500110, -66.906547], a: 'RES', pisos: 12, col: '#e3e5e8', shop: 0, alt: 1, nota: 'bloque GMVV de ventanas azules, km 1,18 izq. (f_0014)' },
    { ll: [10.501079, -66.906412], a: 'RES', pisos: 9, col: '#e9c64e', shop: 0, rail: 1, alt: 0, nota: 'GMVV I: bandas amarillas y blancas, km 1,19 der. (f_0014)' },
    { ll: [10.500402, -66.909184], a: 'RES', pisos: 12, col: '#d8c7a2', shop: 0, rail: 1, alt: 0, nota: 'bloque beige de balcones corridos, km 1,47 izq. (f_0015)' },
    { ll: [10.499985, -66.908555], a: 'COM', h: 7, col: '#d6cdb8', shop: 0, rail: 1, old: 0, nota: 'galpón bajo detrás de la calzada contraria, km 1,39 izq.: sin arcada' },
    { ll: [10.500513, -66.908458], a: 'COM', pisos: 4, col: '#e2ddd0', shop: 0, rail: 1, nota: 'Museo de Arquitectura' },
    { ll: [10.502150, -66.909238], a: 'COM', h: 6, col: '#d9d3c7', shop: 1, old: 0, nota: 'Mercado de La Hoyada: bajo, con mural de colores tras la baranda negra, km 1,52 der. (f_0016)' },
    { ll: [10.502041, -66.910449], a: 'COM', h: 7, col: '#e4ddd0', shop: 1 },
    { ll: [10.501200, -66.910515], a: 'COM', h: 6, col: '#d3cfc6', shop: 1 },
    // Palacio de Justicia: las dos alas beige de 10 pisos que cierran la Av. Bolívar (la puerta con el arco va en zona_centro.js)
    { ll: [10.502357, -66.913358], a: 'BRI', h: 32, col: '#d3c4a2', shop: 0, nota: 'Palacio de Justicia, ala norte (f_0017)' },
    { ll: [10.501796, -66.913485], a: 'BRI', h: 32, col: '#d3c4a2', shop: 0, nota: 'Palacio de Justicia, ala sur (f_0017)' },
    // ── Giro y Av. Este 6 (km 1,65–1,95; f_0017–f_0019): a la derecha el Hotel Caracas, el MCT y los edificios Navarro/888/Castillo
    { ll: [10.502222, -66.911199], a: 'COM', pisos: 4, col: '#e6dcc8', shop: 1, nota: 'esquina crema de 4 pisos con mural en la base (s 42)' },
    { ll: [10.502234, -66.911334], a: 'COM', pisos: 4, col: '#e6dcc8', shop: 1 },
    { ll: [10.502249, -66.911395], a: 'COM', pisos: 3, col: '#c86b45', shop: 1, nota: 'locales de ladrillo naranja (f_0018)' },
    { ll: [10.502423, -66.911187], a: 'COM', pisos: 3, col: '#c86b45', shop: 1, nota: 'Edificio Peinero' },
    { ll: [10.502533, -66.911322], a: 'RES', pisos: 5, col: '#d7cbb5', shop: 1 },
    { ll: [10.502746, -66.911337], a: 'RES', pisos: 14, col: '#ece6dc', shop: 1, alt: 1, nota: 'Hotel Caracas: blanco con bandas rojas (s 42)' },
    { ll: [10.502714, -66.911529], a: 'RES', pisos: 17, col: '#dc8a68', shop: 1, alt: 0, nota: 'Edificio 888: salmón de balcones (f_0018)' },
    { ll: [10.502842, -66.911742], a: 'RES', pisos: 15, col: '#ece8df', shop: 1, alt: 0, nota: 'Edificio Navarro: blanco de balcones (f_0018)' },
    { ll: [10.502649, -66.911959], a: 'RES', pisos: 13, col: '#e2b740', shop: 1, alt: 1, nota: 'J. A. Castillo: franja amarilla (f_0018)' },
    { ll: [10.502994, -66.911943], a: 'RES', pisos: 21, col: '#c9875c', shop: 1, alt: 1, nota: 'Torre MCT: bandas de ladrillo y beige, km 1,87 der. (s 42)' },
    // ── Av. Este 6 hacia la Asamblea (km 1,95–2,25; f_0019–f_0021): izquierda muro con mural y oficinas grises; derecha casas viejas
    { ll: [10.502851, -66.913196], a: 'BRI', pisos: 9, col: '#9ea2a4', shop: 0, nota: 'Oficentro Edal: oficinas grises tras el muro del mural, km 1,98' },
    { ll: [10.502816, -66.913363], a: 'COM', pisos: 3, col: '#efe7d6', shop: 1, old: 0 },
    { ll: [10.502945, -66.913297], a: 'COM', pisos: 3, col: '#f0e9da', shop: 1, old: 0 },
    { ll: [10.502912, -66.913383], a: 'COM', pisos: 2, col: '#f0e9da', shop: 1 },
    { ll: [10.502885, -66.913600], a: 'COM', pisos: 2, col: '#f2ede4', shop: 1, old: 0, nota: 'esquina blanca de franja roja (Pajaritos), f_0020 der.' },
    { ll: [10.502904, -66.913721], a: 'COM', pisos: 2, col: '#f2ede4', shop: 1, old: 0 },
    { ll: [10.503575, -66.913935], a: 'COM', pisos: 5, col: '#eee3c8', shop: 1, old: 1, nota: 'Pasaje Zingg: beige con letrero, f_0020' },
    { ll: [10.503118, -66.914282], a: 'RES', pisos: 6, col: '#c4643f', shop: 1, alt: 1, nota: 'edificio de ladrillo naranja con ventanas de arco arriba, al pie de la Asamblea, km 2,13 der. (f_0021–22; auditoría 19-nov: era blanco de balcones)' },
    { ll: [10.503316, -66.915158], a: 'RES', h: 96, col: '#e9e2d6', shop: 1, alt: 1, nota: 'Edificio José María Vargas (Asamblea Nacional): blanco con banda roja, la franja y el letrero en zona_centro.js' },
    { ll: [10.502600, -66.915388], quitar: true, nota: 'losa del CSB: en el video es la plaza abierta con fuentes y kioscos al pie de las torres (f_0021 izq.)' },
    { ll: [10.503913, -66.915644], a: 'COM', pisos: 2, col: '#f1ece2', shop: 0, rail: 1, old: 1, nota: 'Iglesia de San Francisco (blanca, baja)' },
    // ── Av. Oeste 6 frente al Edificio Norte (km 2,3–2,62; f_0022–f_0025): derecha casas coloniales crema de 3–5 pisos
    { ll: [10.503903, -66.916307], a: 'COM', pisos: 3, col: '#efe6cf', shop: 1, old: 1 },
    { ll: [10.503936, -66.916483], a: 'COM', pisos: 4, col: '#e9dcbc', shop: 1, old: 1 },
    { ll: [10.504037, -66.917021], a: 'RES', pisos: 5, col: '#e8dfc8', shop: 1, old: 1, nota: 'Edificio La Perla: crema con rejas en celosía (f_0023 der.)' },
    { ll: [10.503914, -66.917166], a: 'COM', pisos: 3, col: '#d9cfbd', shop: 1, old: 1, nota: 'Cine Ávila' },
    { ll: [10.504158, -66.917807], a: 'COM', pisos: 4, col: '#c9c5bc', shop: 1, old: 1 },
    { ll: [10.504273, -66.917815], a: 'COM', pisos: 4, col: '#c9c5bc', shop: 1, old: 1 },
    { ll: [10.504121, -66.918378], a: 'COM', pisos: 4, col: '#cfcac0', shop: 1, old: 1, nota: 'medianera gris con vegetación (f_0024 der.)' },
    { ll: [10.504187, -66.918496], a: 'COM', pisos: 3, col: '#d6d2c8', shop: 1, old: 1 },
    { ll: [10.504105, -66.918548], a: 'COM', pisos: 4, col: '#cfcac0', shop: 1, old: 1 },
    { ll: [10.504280, -66.918473], a: 'COM', pisos: 4, col: '#d6d2c8', shop: 1, old: 1 },
    // ── Bloques de El Silencio (Villanueva): blancos, 4 pisos sobre arcada, balcones (f_0025–f_0028, f_0033–f_0034)
    { ll: [10.503737, -66.918588], a: 'RES', pisos: 5, col: '#f0eee8', shop: 1, alt: 0, old: 1, nota: 'Bloque 3 de El Silencio, km 2,58 izq.' },
    { ll: [10.504643, -66.919349], a: 'RES', pisos: 5, col: '#f0eee8', shop: 1, alt: 0, old: 1, nota: 'Bloque 4 de El Silencio, km 2,71 izq. (f_0026–28)' },
    { ll: [10.503649, -66.920357], a: 'RES', pisos: 5, col: '#efece4', shop: 1, alt: 0, old: 1, nota: 'Bloque 1 de El Silencio, km 3,07 der. (f_0033)' },
    { ll: [10.502443, -66.920033], a: 'RES', pisos: 5, col: '#efece4', shop: 1, alt: 0, old: 1, nota: 'Bloque 2, km 3,15 izq.' },
    { ll: [10.502938, -66.918762], a: 'RES', pisos: 5, col: '#efece4', shop: 1, alt: 0, old: 1, nota: 'Bloque 2 de El Silencio' },
    { ll: [10.502684, -66.920964], a: 'RES', pisos: 5, col: '#efece4', shop: 1, alt: 0, old: 1, nota: 'Bloque 5 de El Silencio' },
    // Av. Sur 8, derecha: Teatro Junín y edificios blancos de balcones naranja (f_0026–f_0028)
    { ll: [10.504238, -66.918967], a: 'RES', pisos: 6, col: '#f1efe9', shop: 1, alt: 1, nota: 'Teatro Junín / blanco de balcones naranja, km 2,64 der. (f_0026)' },
    // km 2,63: la esquina de la huella del Junín se metía en el borde derecho de la calzada; recortada a 7,5 m del eje
    { ll: [10.504125, -66.919016], quitar: true, nota: 'esquina del Teatro Junín metida en la calzada, km 2,63 der.' },
    { poly: [[10.504129, -66.918902], [10.504202, -66.918908], [10.504353, -66.918875], [10.504387, -66.919052], [10.504239, -66.919048], [10.504193, -66.919036], [10.504165, -66.919001], [10.504139, -66.91894]],
      a: 'RES', pisos: 6, col: '#f1efe9', shop: 1, alt: 1, nota: 'Teatro Junín recortado a 7,5 m del eje' },
    { ll: [10.504745, -66.918484], a: 'RES', pisos: 13, col: '#d9c49a', shop: 1, alt: 1, nota: 'torre beige al fondo der. (f_0027–28)' },
    { ll: [10.505406, -66.918826], a: 'RES', pisos: 12, col: '#e9be45', shop: 1, alt: 0, nota: 'torre amarilla con la M del Metro El Silencio, km 2,78 der. (f_0029)' },
    { ll: [10.505415, -66.918915], a: 'COM', pisos: 2, col: '#e9be45', shop: 1 },
    // ── Av. Universidad: Liceo Fermín Toro (f_0029–f_0030)
    { ll: [10.505920, -66.919383], a: 'COM', pisos: 4, col: '#3f9fae', shop: 0, alt: 1, nota: 'Liceo Fermín Toro: paneles azules y verdes con marco blanco, km 2,83 der. (f_0030)' },
    { ll: [10.505608, -66.918230], a: 'COM', pisos: 5, col: '#f1f0eb', shop: 0, rail: 1, detalle: 0, nota: 'auditorio blanco del Liceo Fermín Toro (f_0029)' },
    { ll: [10.505853, -66.920187], a: 'COM', pisos: 4, col: '#44a0a8', shop: 0, alt: 1 },
    { ll: [10.505082, -66.919550], a: 'COM', h: 4, col: '#e9e3d6', shop: 1, nota: 'kioscos y caseta al pie de la escalinata' },
    { ll: [10.504856, -66.920298], a: 'COM', h: 4, col: '#d8d2c4', shop: 0, rail: 1 },
  ],
  via: [
    // auditoría 19-nov: salida arbolada (f_0004–f_0006)
    { km0: 0, km1: 0.22, set: { 'veg.L': .6, 'veg.R': .65, 'veg.denL': 3, 'veg.denR': 3 } },
    // Av. Bolívar: dos calzadas con brocal amarillo hasta el giro (f_0011–f_0017), 4 canales, palmas a la derecha
    { km0: 0.55, km1: 1.63, set: { canales: 4, calzadas: 2, sep: 'brocal amarillo', ancho: 30, 'veg.palR': .45, 'veg.R': .35, 'veg.L': .3 } },
    { km0: 1.2, km1: 1.63, set: { 'L.tipo': 'residencial', 'R.tipo': 'comercial bajo con santamarías', 'L.retiro': 14, 'R.retiro': 10 } },
    // Av. Este 6 tras el giro: plaza enrejada con árboles a la izquierda (f_0018)
    { km0: 1.66, km1: 1.92, set: { canales: 2, calzadas: 1, sep: 'ninguno', ancho: 15, 'veg.L': .55, 'veg.denL': 2, 'veg.palL': 0, 'veg.palR': 0, 'veg.R': 0, 'L.tipo': 'parque', 'R.tipo': 'residencial' } },
    // calles del casco: sin palmas ni árboles salvo en la plaza de la fuente (f_0019–f_0025)
    { km0: 1.92, km1: 2.62, set: { 'veg.palL': 0, 'veg.palR': 0, 'veg.R': 0, 'veg.L': .05 } },
    // Parque Carabobo a la derecha: árboles grandes y acera de ladrillo (f_0015)
    { km0: 1.25, km1: 1.45, set: { 'veg.R': .7, 'veg.denR': 3 } },
    { km0: 2.08, km1: 2.2, set: { 'veg.L': .3, 'veg.palL': .25 } },
    // Av. Sur 8 entre los bloques: dos canales y busetas a la derecha, sin árboles (f_0026–f_0028)
    { km0: 2.62, km1: 2.79, set: { canales: 2, ancho: 14, 'veg.palL': 0, 'veg.palR': 0, 'veg.L': 0, 'veg.R': 0 } },
    // Av. Sucre bajando a O'Leary: árboles grandes a la derecha, brocal bajo a la izquierda (f_0032)
    { km0: 2.88, km1: 3.0, set: { 'veg.R': .45, 'veg.palR': .1, 'veg.palL': 0, 'veg.L': .1 } },
    // O'Leary: plaza con palmas a la izquierda, bloque de arcadas a la derecha con palmas en la acera (f_0033–f_0034)
    { km0: 3.0, km1: 3.15, set: { 'veg.palL': .5, 'veg.palR': .3, 'veg.R': .05, 'veg.L': .15 } },
  ],
  relieve: [],
  estructuras: [],
  // auditoría 19-nov: la salida por el Paseo Colón (km 0–0,3) va entre árboles grandes a los dos lados (f_0004–f_0007: Los Caobos y la
  // plaza Morelos, rejas verdes); el juego la dejaba pelada. Cuatro hileras a 11 y 18 m del eje, cada 15 m, fuera de las huellas
  arboles: [
    { ll: [10.497665, -66.896315], especie: 'caobo', alto: 15 }, { ll: [10.49785, -66.896389], especie: 'saman', alto: 19 }, { ll: [10.497606, -66.896292], especie: 'caobo', alto: 13 }, { ll: [10.497909, -66.896412], especie: 'mijao', alto: 17 },
    { ll: [10.497639, -66.896381], especie: 'caobo', alto: 21 }, { ll: [10.497825, -66.896451], especie: 'saman', alto: 15 }, { ll: [10.497579, -66.896359], especie: 'caobo', alto: 19 }, { ll: [10.497885, -66.896473], especie: 'mijao', alto: 13 },
    { ll: [10.497596, -66.896492], especie: 'caobo', alto: 17 }, { ll: [10.497786, -66.896552], especie: 'saman', alto: 21 }, { ll: [10.497536, -66.896473], especie: 'caobo', alto: 15 }, { ll: [10.497847, -66.896571], especie: 'mijao', alto: 19 },
    { ll: [10.497555, -66.896625], especie: 'caobo', alto: 13 }, { ll: [10.497747, -66.896679], especie: 'saman', alto: 17 }, { ll: [10.497494, -66.896608], especie: 'caobo', alto: 21 }, { ll: [10.497808, -66.896697], especie: 'mijao', alto: 15 },
    { ll: [10.497521, -66.896765], especie: 'caobo', alto: 19 }, { ll: [10.497716, -66.896804], especie: 'saman', alto: 13 }, { ll: [10.497459, -66.896753], especie: 'caobo', alto: 17 }, { ll: [10.497779, -66.896816], especie: 'mijao', alto: 21 },
    { ll: [10.497498, -66.896902], especie: 'caobo', alto: 15 }, { ll: [10.497694, -66.896936], especie: 'saman', alto: 19 }, { ll: [10.497436, -66.896892], especie: 'caobo', alto: 13 }, { ll: [10.497757, -66.896946], especie: 'mijao', alto: 17 },
    { ll: [10.497477, -66.897044], especie: 'caobo', alto: 21 }, { ll: [10.497675, -66.897066], especie: 'saman', alto: 15 }, { ll: [10.497414, -66.897037], especie: 'caobo', alto: 19 }, { ll: [10.497738, -66.897073], especie: 'mijao', alto: 13 },
    { ll: [10.49746, -66.897183], especie: 'caobo', alto: 17 }, { ll: [10.497659, -66.897198], especie: 'saman', alto: 21 }, { ll: [10.497397, -66.897178], especie: 'caobo', alto: 15 }, { ll: [10.497722, -66.897202], especie: 'mijao', alto: 19 },
    { ll: [10.497454, -66.897331], especie: 'caobo', alto: 13 }, { ll: [10.497653, -66.897321], especie: 'saman', alto: 17 }, { ll: [10.497391, -66.897335], especie: 'caobo', alto: 21 }, { ll: [10.497716, -66.897317], especie: 'mijao', alto: 15 },
    { ll: [10.497464, -66.897474], especie: 'caobo', alto: 19 }, { ll: [10.497661, -66.897448], especie: 'saman', alto: 13 }, { ll: [10.497401, -66.897482], especie: 'caobo', alto: 17 }, { ll: [10.497724, -66.89744], especie: 'mijao', alto: 21 },
    { ll: [10.497492, -66.897622], especie: 'caobo', alto: 15 }, { ll: [10.497683, -66.897567], especie: 'saman', alto: 19 }, { ll: [10.497431, -66.89764], especie: 'caobo', alto: 13 }, { ll: [10.497744, -66.897549], especie: 'mijao', alto: 17 },
    { ll: [10.497535, -66.897758], especie: 'caobo', alto: 21 }, { ll: [10.497722, -66.897688], especie: 'saman', alto: 15 }, { ll: [10.497476, -66.89778], especie: 'caobo', alto: 19 }, { ll: [10.497781, -66.897666], especie: 'mijao', alto: 13 },
    { ll: [10.497591, -66.897892], especie: 'caobo', alto: 17 }, { ll: [10.49777, -66.897805], especie: 'saman', alto: 21 }, { ll: [10.497534, -66.89792], especie: 'caobo', alto: 15 }, { ll: [10.497827, -66.897777], especie: 'mijao', alto: 19 },
    { ll: [10.497655, -66.898018], especie: 'caobo', alto: 13 }, { ll: [10.49783, -66.897922], especie: 'saman', alto: 17 }, { ll: [10.4976, -66.898048], especie: 'caobo', alto: 21 }, { ll: [10.497886, -66.897892], especie: 'mijao', alto: 15 },
    { ll: [10.497726, -66.898144], especie: 'caobo', alto: 19 }, { ll: [10.497892, -66.898034], especie: 'saman', alto: 13 }, { ll: [10.497673, -66.898179], especie: 'caobo', alto: 17 }, { ll: [10.497945, -66.897999], especie: 'mijao', alto: 21 },
    { ll: [10.497804, -66.898261], especie: 'caobo', alto: 15 }, { ll: [10.497965, -66.898142], especie: 'saman', alto: 19 }, { ll: [10.497753, -66.898299], especie: 'caobo', alto: 13 }, { ll: [10.498016, -66.898104], especie: 'mijao', alto: 17 },
    { ll: [10.497893, -66.898374], especie: 'caobo', alto: 21 }, { ll: [10.498043, -66.898242], especie: 'saman', alto: 15 }, { ll: [10.497845, -66.898416], especie: 'caobo', alto: 19 }, { ll: [10.498091, -66.8982], especie: 'mijao', alto: 13 },
    { ll: [10.497986, -66.898476], especie: 'caobo', alto: 17 }, { ll: [10.498133, -66.89834], especie: 'saman', alto: 21 }, { ll: [10.49794, -66.898519], especie: 'caobo', alto: 15 }, { ll: [10.49818, -66.898297], especie: 'mijao', alto: 19 },
    { ll: [10.498081, -66.898576], especie: 'caobo', alto: 13 }, { ll: [10.498226, -66.898438], especie: 'saman', alto: 17 }, { ll: [10.498035, -66.89862], especie: 'caobo', alto: 21 }, { ll: [10.498272, -66.898394], especie: 'mijao', alto: 15 },
    { ll: [10.498174, -66.898675], especie: 'caobo', alto: 19 }, { ll: [10.49832, -66.898538], especie: 'saman', alto: 13 }, { ll: [10.498128, -66.898719], especie: 'caobo', alto: 17 }, { ll: [10.498366, -66.898495], especie: 'mijao', alto: 21 },
    { ll: [10.498266, -66.898773], especie: 'caobo', alto: 15 }, { ll: [10.498414, -66.89864], especie: 'saman', alto: 19 }, { ll: [10.498218, -66.898816], especie: 'caobo', alto: 13 }, { ll: [10.498461, -66.898597], especie: 'mijao', alto: 17 },
  ],
};
