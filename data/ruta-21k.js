// Media maratón (21K) del Maratón CAF como ruta compuesta sobre el trazado del 42K (data/caf-data.js), sin duplicar el mundo.
// La compone landmarks/api.js (componerRuta) al cargar, con las cotas ya corregidas por game.js. Investigación y números:
// build/investigacion/ruta_21k.md (mapas oficiales 2024 y 2026: «Retorno Medio Maratón» al final de Los Ilustres; el 21K sigue por
// Las Acacias hasta La Previsora y se une al final del 42K).
// piezas: { ref: [km0, km1], ll: [[lat, lon] del extremo 0], [lat, lon] del extremo 1] } = tramo del 42K tal cual (los extremos se buscan
// por km y se validan contra ll: si un rebuild de caf-data mueve el trazado más de 15 m, la composición falla en la consola en vez de torcerse).
// { con: [[lat, lon], …] } = conector por calles que el 42K no pisa (nodos de OpenStreetMap, build/raw/calles.json).
// { retorno: { k } } = U redondeada entre el final de la pieza anterior y el comienzo de la siguiente (tangentes del 42K).
export default {
  id: '21', KM: 21.0975, nombre: 'Medio maratón', corto: '21K',
  piezas: [
    { ref: [0, 16.4538], ll: [null, [10.473190, -66.896444]] },   // no mover sin repetir choques: 40 y 55 m más allá el carril pisa el hongo de la plaza o el cartel
    // retorno frente al IPSFA, donde Los Ilustres se abre hacia Los Próceres: U redondeada entre las dos calzadas (curva de Hermite con
    // las tangentes del 42K en sus extremos; k = largo de las tangentes / separación, 2,25 da radio mínimo ≈ 10 m y 40 m de arco),
    // como un retorno de carrera alrededor de conos. Antes era el enlace OSM de 28 m, con dos esquinas secas.
    { retorno: { k: 2.25 }, nombre: 'Retorno · Paseo Los Ilustres' },
    { ref: [17.9307, 21.0826], ll: [[10.473082, -66.896253], [10.494482, -66.881392]] },
    // Av. Las Acacias hacia el norte (un sentido, 5 canales) desde la Casanova hasta la Gran Avenida, al pie de La Previsora
    { con: [[10.4945268, -66.8814436], [10.4945659, -66.8814332], [10.4956055, -66.8812104], [10.4956785, -66.8811965], [10.4957673, -66.8811766]], nombre: 'Avenida Las Acacias' },
    { ref: [41.1939, 42.195], ll: [[10.495848, -66.881240], null] },
  ],
  // km del 21K: en el tramo compartido de ida son los del 42K (los carteles de la calle son los mismos); desde el retorno se reparte
  // linealmente hasta 21,0975 en la meta (cuadra con las marcas verdes 17K–20K del mapa oficial)
  kmModo: 'compartido',
  // llegada por el canal sur del Paseo Colón (arco verde de landmarks/salida_meta.js, LAT21 = 16,5 m a la izquierda): el corredor se cambia
  // de calzada sobre la isla de grama entre estos km del 42K
  llegada: { lat: 16.5, km0: 41.96, km1: 42.07 },
  // hitos del 42K que no aplican y los propios del 21K (km del 21K)
  quitaHitos: [17.18, 21.1],
  hitos: [
    { km: 16.47, nombre: 'Retorno del medio maratón', tipo: 'zona', lado: 'izq', off: 30, publico: true, desc: 'Frente al IPSFA, donde Los Ilustres se abre hacia Los Próceres: das la vuelta por el enlace entre las dos calzadas. El 42K sigue de largo hasta los monolitos.' },
    { km: 19.9, nombre: 'Te separas del 42K', tipo: 'zona', lado: 'der', off: 30, desc: 'El maratón dobla aquí a la derecha por la Av. Casanova. Tú sigues derecho por la Av. Las Acacias, cuesta arriba hacia La Previsora.' },
    { km: 20.02, nombre: 'Torre La Previsora', tipo: 'zona', lado: 'izq', off: 40, publico: true, desc: 'La torre del reloj marca la vuelta a la izquierda hacia la Gran Avenida. Desde aquí es el final del maratón: túnel de Plaza Venezuela y recta del Paseo Colón.' },
  ],
  // tramos del 21K: los del 42K que aplican tal cual (por nombre) y dos reescritos para lo que el 21K hace distinto
  tramos: [
    { de: 'Av. Bolívar y el casco central' }, { de: 'Av. San Martín' }, { de: "Bella Vista, O'Higgins y La India" }, { de: 'El Paraíso por la Av. Páez' }, { de: 'Roca Tarpeya y Av. Victoria' },
    { km0: 15.2, km1: 18.7, nombre: 'Los Ilustres: ida, retorno y vuelta',
      desc: 'Ida y vuelta por el Paseo Los Ilustres: llano total, a 870 m. El retorno en U es frente al IPSFA, donde las dos calzadas se abren hacia Los Próceres (km 16,5): no entras al lazo de los monolitos. Te cruzas de frente con los que van delante y detrás.',
      consejo: 'Tramo ancho, plano y con poca sombra: corre exacto a ritmo objetivo. El retorno corta el paso; sal de la U sin acelerar de golpe. Ya pasaste el gel del km 13,9 y hay isotónico en el 15,5 y en el 17,7.' },
    { km0: 18.7, km1: 21.0975, nombre: 'Las Acacias, La Previsora y meta',
      desc: 'Pasas Las Tres Gracias y la UCV, cruzas el puente sobre la autopista y el Guaire y, donde el maratón dobla a la Casanova, sigues derecho por la Av. Las Acacias hasta La Previsora. Ahí tomas la Gran Avenida, bajas al túnel de Plaza Venezuela y sales a la recta del Paseo Colón: la llegada del 21K es el arco verde del canal sur.',
      consejo: 'Los últimos 160 m de Las Acacias suben suave hasta La Previsora: es el único repecho del final, y después todo es llano o en bajada. Si te queda algo, gástalo desde la salida del túnel.' },
  ],
  aviso: 'Recorrido del 21K según los mapas oficiales 2024 y 2026 del manual del corredor de CAF, compuesto sobre el trazado GPS del 42K. Puestos de agua, isotónico y gel derivados de los del 42K que caen sobre el recorrido del 21K (confírmalos en el manual de tu edición).',
};
