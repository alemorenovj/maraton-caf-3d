// Correcciones de la zona proceres (km 15,3–19,0). Contrato en fx/correcciones/LEEME.md
// Referencia: video en carro, fotogramas f_0146–f_0189. El video está CORTADO en este tramo (f_0156 y f_0163 abren tomas nuevas),
// así que el km del índice no sirve: se ancló cada cuadro por contenido. Desfase índice → km del juego:
//   f_0146 Redoma de Los Símbolos = 15,25 (≈0) · f_0148–0149 rótulo AVENIDA LOS ILUSTRES y parque de atracciones = 15,45–15,55 (+0,05)
//   f_0153 viaducto de la Valle-Coche a la derecha = 16,05 (+0,33) · f_0157 curva a la izquierda con palmas = 16,58 (+0,6)
//   f_0161 monolitos al frente = 16,95 (+0,7) · f_0162 giro de retorno = 17,18 (+0,9)
//   f_0163 edificio blanco sobre muro a la derecha = 17,30 (+0,9) · f_0178 estacionamiento de varios niveles = 17,82 (−0,08)
//   f_0180 «18K» y letrero BDV = 17,95 (−0,15) · f_0182 Residencias Mayoral Plaza = 18,12 (−0,19) · f_0189 puente = 18,78 (−0,26).
// La ruta va por Los Ilustres/Las Acacias (ida por la calzada oeste, vuelta por la este, ejes a 25–33 m) y da la vuelta por el
// Paseo Los Próceres (ida por la calzada NO, vuelta por la SE, a ±33 m del eje del paseo). En ambos sentidos el parque queda a la izquierda.
// Lo singular (isla central de Los Ilustres, parque de atracciones, viaducto de la Valle-Coche, barandas del puente, urnas, farolas,
// palmas reales, ciclovía, muro de piedra, estacionamiento EPA, hongos, letrero BDV) va a mano en landmarks/zona_proceres.js.
export default {
  edif: [
    // ── Redoma de Los Símbolos (km 15,2–15,35; f_0146–0147)
    { ll: [10.483254, -66.895457], quitar: true, nota: 'la huella OSM del Monumento a los Símbolos salía como bloque residencial de 22 m y tapaba el hito (km 15,24 izq.)' },
    // 19-nov: esta huella de 2.917 m² (casas fundidas en un bloque) salía como una losa gris lisa de 6 m pegada a la derecha de la vuelta
    // en el km 19,12–19,22; en el video son casas de colores de 2–4 pisos (f_0190–0192). Se quita y las casas van como poly en ucv_acacias.js
    { ll: [10.483449, -66.894760], quitar: true, nota: 'bloque de casas fundidas tras la redoma (km 15,25 der. / 19,15 der.)' },
    { ll: [10.483712, -66.896072], a: 'RES', pisos: 11, col: '#e2b98c', shop: 0, alt: 1, nota: 'torre durazno de 11 pisos con base azul, km 15,25 der. (f_0146)' },
    { ll: [10.483492, -66.896125], a: 'RES', pisos: 8, col: '#d9cdb6', shop: 1, alt: 1, nota: 'bloque beige de 8 pisos, km 15,25 der. (f_0146)' },
    { ll: [10.483626, -66.895875], a: 'COM', h: 4, col: '#e6e1d6', shop: 1 },
    { ll: [10.483293, -66.896479], a: 'RES', pisos: 7, col: '#d4c6ad', shop: 0, alt: 1 },
    { ll: [10.482582, -66.896094], a: 'COM', h: 15, col: '#ecebe7', shop: 1, alt: 1, nota: "C.C. Los Ilustres: fachada larga blanca con McDonald's, km 15,33 der. (f_0147)" },
    // ── Parque de atracciones de Los Ilustres (km 15,35–15,6 der.; f_0148–0149): la torre de caída (62 m de oficinas en la huella) y la valla van a mano;
    //    su huella y la del estacionamiento EPA las quita meta.quita de landmarks/zona_proceres.js
    { ll: [10.481879, -66.896099], a: 'GAL', h: 7, col: '#2f6fb8', shop: 0, detalle: 0, nota: 'nave azul del parque' },
    { ll: [10.481154, -66.895042], a: 'GAL', h: 6, col: '#d4473a', shop: 0, detalle: 0, nota: 'casetas rojas del parque tras el muro amarillo; no bloque de 30 m (f_0149)' },
    { ll: [10.481230, -66.895434], a: 'GAL', h: 7, col: '#e8b13a', shop: 0, detalle: 0, nota: 'techo amarillo del parque (f_0148)' },
    { ll: [10.481825, -66.895190], a: 'COM', h: 4, col: '#2b8fd0', shop: 0, detalle: 0 },
    { ll: [10.481710, -66.895331], a: 'COM', h: 6, col: '#e04a3c', shop: 0, detalle: 0 },
    { ll: [10.482063, -66.895463], a: 'COM', h: 4, col: '#f0c43a', shop: 0, detalle: 0 },
    { ll: [10.482027, -66.895327], a: 'COM', h: 5, col: '#3aa0d8', shop: 0, detalle: 0 },
    { ll: [10.481550, -66.895160], a: 'COM', h: 5, col: '#e86a9a', shop: 0, detalle: 0 },
    { ll: [10.481429, -66.895569], a: 'COM', h: 6, col: '#f2f0ea', shop: 0, detalle: 0 },
    // ── Retorno y paseo central (km 17,15–17,5): en el video es plaza y paseo abierto con urnas, sin casetas (f_0162–0164)
    { ll: [10.469146, -66.899323], quitar: true, nota: 'caseta beige con techo de teja dentro del paseo, km 17,33 izq.' },
    { ll: [10.470425, -66.897691], quitar: true, nota: 'caseta de 72 m² en el borde derecho de la vuelta, km 17,54: en el video solo hay palmas y grama (f_0168–0172)' },
    { ll: [10.469299, -66.899224], quitar: true, nota: 'caseta en el paseo, km 17,35 izq.' },
    { ll: [10.470306, -66.898467], quitar: true, nota: 'caseta en el paseo, km 17,48 izq.' },
    { ll: [10.467937, -66.900036], quitar: true, nota: 'caseta en la plaza del retorno' },
    { ll: [10.468318, -66.899318], quitar: true, nota: 'caseta en la plaza del retorno' },
    { ll: [10.468424, -66.899300], quitar: true, nota: 'caseta en la plaza del retorno' },
    // ── Paseo Los Próceres, vuelta (km 17,27–17,9; f_0163–0178)
    { ll: [10.468779, -66.898325], a: 'BRI', pisos: 4, col: '#eef0ef', shop: 0, nota: 'edificio blanco largo de 4 pisos sobre el muro de piedra, km 17,32 der. (f_0163)' },
    { ll: [10.469418, -66.898499], a: 'COM', h: 5, col: '#e9ebe8', shop: 0, detalle: 0 },
    { ll: [10.470752, -66.896617], a: 'COM', h: 6, col: '#9ea7ad', shop: 0, detalle: 0, nota: 'nave gris-azul tras los árboles (f_0176)' },
    { ll: [10.470450, -66.897086], a: 'COM', h: 5, col: '#c9c7c0', shop: 0, detalle: 0 },
    { ll: [10.471708, -66.897396], a: 'COM', h: 4, col: '#d9d6cf', shop: 0, detalle: 0 },
    { ll: [10.472960, -66.895041], a: 'COM', h: 16, col: '#d7d3c9', shop: 1, alt: 1, nota: 'C.C. Los Próceres, km 17,95 der.' },
    // ── Los Ilustres, vuelta (km 18,0–18,8; f_0181–0189), lado derecho = Las Acacias
    { ll: [10.474139, -66.894788], a: 'RES', pisos: 25, col: '#c9765c', shop: 0, alt: 1, nota: 'Residencias Mayoral Plaza: torre doble de ladrillo naranja, km 18,1 der. (f_0182); no vidrio azul' },
    { ll: [10.474641, -66.895134], a: 'BRI', pisos: 11, col: '#e8e5dd', shop: 0, nota: 'Procuraduría General: oficinas blancas de ventanas corridas con reja roja, km 18,15 der. (f_0183)' },
    { ll: [10.474945, -66.894483], a: 'BRI', pisos: 15, col: '#e2ded5', shop: 0, nota: 'oficinas blanco-grises detrás, km 18,15 der. (f_0182)' },
    { ll: [10.475155, -66.894850], a: 'COM', pisos: 4, col: '#e6e2da', shop: 0 },
    { ll: [10.476922, -66.894698], a: 'RES', pisos: 8, col: '#d8c9ad', shop: 0, alt: 1, nota: 'Residencias Los Ilustres, km 18,38 der.' },
    { ll: [10.481894, -66.893556], a: 'RES', pisos: 22, col: '#e2cea6', shop: 0, alt: 1, nota: 'Edificio Carolina: torre crema tras el puente (f_0189)' },
    { ll: [10.481711, -66.894375], a: 'RES', pisos: 4, col: '#e6dfcf', shop: 1 },
  ],
  via: [
    // Los Ilustres de ida: parque de atracciones a la derecha con muro amarillo, isla central ancha a la izquierda (a mano)
    { km0: 15.32, km1: 15.62, set: { canales: 2, 'R.tipo': 'parque', 'veg.R': .2, 'veg.palR': 0, 'veg.L': .5, 'veg.denL': 2 } },
    { km0: 15.62, km1: 16.38, set: { sep: 'isla con árboles', canales: 3, 'R.tipo': 'parque', 'veg.R': .45, 'veg.denR': 2, 'veg.palR': 0, 'veg.L': .45, 'veg.palL': 0 } },    // Paseo Los Próceres de ida: una sola calzada de 3 canales (el paseo queda a la izquierda), bosque cerrado a la derecha (Fuerte Tiuna)
    { km0: 16.42, km1: 17.15, set: { calzadas: 1, sep: 'ninguno', canales: 3, ancho: 13, 'L.tipo': 'parque', 'R.tipo': 'parque', 'R.retiro': 16, 'L.retiro': 12, 'veg.R': .85, 'veg.denR': 3, 'veg.palR': 0, 'veg.L': .2, 'veg.palL': .15 } },
    // retorno frente a los monolitos
    { km0: 17.15, km1: 17.27, set: { calzadas: 1, sep: 'ninguno', canales: 3, ancho: 16, 'veg.L': .1, 'veg.R': .5, 'veg.palL': 0, 'veg.palR': 0 } },
    // Paseo Los Próceres de vuelta: paseo a la izquierda, isla de palmas reales y ciclovía a la derecha (a mano)
    { km0: 17.27, km1: 17.88, set: { calzadas: 1, sep: 'ninguno', canales: 3, ancho: 13, 'L.tipo': 'parque', 'R.tipo': 'parque', 'R.retiro': 14, 'veg.R': .35, 'veg.denR': 2, 'veg.palR': .25, 'veg.L': .2, 'veg.palL': .1 } },
    // redoma del hongo turquesa y Los Ilustres de vuelta: edificios de Las Acacias a la derecha detrás de árboles
    // 19-nov: a la derecha de la vuelta (17,88–18,3) el video abre la vista a la ciclovía, el toldo azul y la Mayoral Plaza naranja (f_0181–0183);
    // con copa .45 la torre quedaba tapada desde la ruta
    { km0: 17.88, km1: 18.30, set: { 'R.tipo': 'residencial', 'veg.R': .12, 'veg.denR': 1, 'veg.palR': .15 } },
    { km0: 18.30, km1: 18.75, set: { 'R.tipo': 'residencial', 'veg.R': .45, 'veg.denR': 2, 'veg.palR': 0 } },
  ],
  relieve: [
    // el edificio blanco del km 17,3 está en una terraza: muro de piedra de ~2,6 m (a mano) y el terreno arriba
    { km0: 17.28, km1: 17.50, lado: 'R', d0: 16, d1: 18, dh: 2.6, d2: 75, d3: 95, rampa: 20, nota: 'terraza del edificio blanco tras el muro de piedra (f_0163)' },
  ],
  estructuras: [],
  // 19-nov: árboles de la isla central de Los Ilustres (ida 15,70–16,34, se ven también desde la vuelta 18,1–18,7). Antes eran copas a mano
  // de elipsoides lisos verde claro que de lejos parecían globos; ahora son árboles del motor en las mismas posiciones (f_0151–0155, f_0182–0186)
  arboles: [
    { ll: [10.479679, -66.894534], especie: 'saman', alto: 14 }, { ll: [10.479597, -66.89457], especie: 'caobo', alto: 15 }, { ll: [10.479511, -66.894592], especie: 'mijao', alto: 16 },
    { ll: [10.479428, -66.894621], especie: 'saman', alto: 17 }, { ll: [10.47934, -66.894632], especie: 'caobo', alto: 18 }, { ll: [10.479265, -66.894686], especie: 'saman', alto: 19 },
    { ll: [10.479171, -66.894677], especie: 'caobo', alto: 14 }, { ll: [10.479098, -66.894732], especie: 'mijao', alto: 15 }, { ll: [10.479009, -66.89474], especie: 'saman', alto: 16 },
    { ll: [10.478928, -66.894772], especie: 'caobo', alto: 17 }, { ll: [10.478844, -66.894795], especie: 'saman', alto: 18 }, { ll: [10.478764, -66.89483], especie: 'caobo', alto: 19 },
    { ll: [10.478674, -66.894833], especie: 'mijao', alto: 14 }, { ll: [10.478602, -66.894892], especie: 'saman', alto: 15 }, { ll: [10.478508, -66.894883], especie: 'caobo', alto: 16 },
    { ll: [10.478433, -66.894934], especie: 'saman', alto: 17 }, { ll: [10.478347, -66.894947], especie: 'caobo', alto: 18 }, { ll: [10.478266, -66.894976], especie: 'mijao', alto: 19 },
    { ll: [10.478181, -66.894995], especie: 'saman', alto: 14 }, { ll: [10.478104, -66.895036], especie: 'caobo', alto: 15 }, { ll: [10.478014, -66.895031], especie: 'saman', alto: 16 },
    { ll: [10.47794, -66.895089], especie: 'caobo', alto: 17 }, { ll: [10.477851, -66.895083], especie: 'mijao', alto: 18 }, { ll: [10.477773, -66.89512], especie: 'saman', alto: 19 },
    { ll: [10.477689, -66.895136], especie: 'caobo', alto: 14 }, { ll: [10.477606, -66.895156], especie: 'saman', alto: 15 }, { ll: [10.477521, -66.895162], especie: 'caobo', alto: 16 },
    { ll: [10.477442, -66.895201], especie: 'mijao', alto: 17 }, { ll: [10.477352, -66.895179], especie: 'saman', alto: 18 }, { ll: [10.477273, -66.895228], especie: 'caobo', alto: 19 },
    { ll: [10.477184, -66.895214], especie: 'saman', alto: 14 }, { ll: [10.477101, -66.89524], especie: 'caobo', alto: 15 }, { ll: [10.477014, -66.895246], especie: 'mijao', alto: 16 },
    { ll: [10.47693, -66.895268], especie: 'saman', alto: 17 }, { ll: [10.476842, -66.895258], especie: 'caobo', alto: 18 }, { ll: [10.476762, -66.895305], especie: 'saman', alto: 19 },
    { ll: [10.476671, -66.895276], especie: 'caobo', alto: 14 }, { ll: [10.47659, -66.895322], especie: 'mijao', alto: 15 }, { ll: [10.476501, -66.895311], especie: 'saman', alto: 16 },
    { ll: [10.476416, -66.895332], especie: 'caobo', alto: 17 }, { ll: [10.476329, -66.895335], especie: 'saman', alto: 18 }, { ll: [10.476246, -66.895362], especie: 'caobo', alto: 19 },
    { ll: [10.476156, -66.89534], especie: 'mijao', alto: 14 }, { ll: [10.476075, -66.895392], especie: 'saman', alto: 15 }, { ll: [10.475985, -66.895361], especie: 'caobo', alto: 16 },
    { ll: [10.475903, -66.895401], especie: 'saman', alto: 17 }, { ll: [10.475816, -66.895393], especie: 'caobo', alto: 18 }, { ll: [10.475731, -66.895413], especie: 'mijao', alto: 19 },
    { ll: [10.475644, -66.895408], especie: 'saman', alto: 14 }, { ll: [10.47556, -66.895442], especie: 'caobo', alto: 15 }, { ll: [10.47547, -66.895413], especie: 'saman', alto: 16 },
    { ll: [10.475387, -66.895464], especie: 'caobo', alto: 17 }, { ll: [10.475296, -66.895439], especie: 'mijao', alto: 18 }, { ll: [10.475211, -66.89547], especie: 'saman', alto: 19 },
    { ll: [10.475122, -66.895472], especie: 'caobo', alto: 14 }, { ll: [10.475035, -66.895493], especie: 'saman', alto: 15 }, { ll: [10.474943, -66.895493], especie: 'caobo', alto: 16 },
    { ll: [10.474861, -66.895538], especie: 'mijao', alto: 17 }, { ll: [10.474764, -66.895522], especie: 'saman', alto: 18 }, { ll: [10.474685, -66.895577], especie: 'caobo', alto: 19 },
    { ll: [10.474592, -66.895574], especie: 'saman', alto: 14 }, { ll: [10.47451, -66.895612], especie: 'caobo', alto: 15 }, { ll: [10.474424, -66.895631], especie: 'mijao', alto: 16 },
    { ll: [10.474342, -66.895671], especie: 'saman', alto: 17 }, { ll: [10.47425, -66.895681], especie: 'caobo', alto: 18 }, { ll: [10.474179, -66.895749], especie: 'saman', alto: 19 },
    { ll: [10.474081, -66.895749], especie: 'caobo', alto: 14 },
  ],
};
