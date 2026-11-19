// Correcciones de la zona ucv_acacias (km 19.0–21.4). Contrato en fx/correcciones/LEEME.md
// Anclas del video (ruta.mp4, t = segundo): rótulo AVENIDA LAS ACACIAS t=500–503,5; paso bajo las gradas del estadio t=504,5–508;
// rampa con muro gris alto a la derecha t=508,5–509,5; tablero con barandas amarillas t=509,8–514; cruce con charcos (Oropeza Castillo,
// OSM km 20,87) t=516. Puente de Las Acacias en OSM: km 20,577–20,785; bajo él, de SO a NE: el Guaire (~20,59), la rampa del
// Distribuidor El Pulpo (20,627), la Autopista Francisco Fajardo (20,637–20,67) y los ramales de El Pulpo (20,706–20,716).
export default {
  sinCebra: [[20.30, 20.82]],   // el motor pintaba pasos de cebra bajo las rampas (20,42) y en la entrada del puente que el video no tiene
  edif: [
    // en el cauce del Guaire / bajo el puente no hay edificios (huellas que quedaban flotando sobre el terreno hundido)
    { ll: [10.491822, -66.885202], quitar: true, nota: 'caja gris junto al Guaire, km 20,58 izq.' },
    { ll: [10.492242, -66.883940], quitar: true, nota: 'caseta en la isla de la autopista, km 20,70 izq.' },
    // km 19,2–19,6: torres crema de Residencias detrás de las casas (f_0189–0191), Farmatodo de techo azul y la torre parda (f_0193)
    // 19-nov: km 19,12–19,19 der., frente de casas de colores de 2–4 pisos con santamarías (f_0190–0192); sustituyen la losa gris de 2.917 m²
    // (quitada en proceres.js) y la casita de teja que quedaba dentro
    { ll: [10.48359, -66.894828], quitar: true, nota: 'casita de teja dentro del frente de casas, km 19,16 der.' },
    { poly: [[10.483361, -66.89502], [10.483471, -66.894958], [10.483419, -66.894867], [10.483322, -66.894923]], a: 'COM', pisos: 2, col: '#efece4', shop: 1, nota: 'casa blanca con portón, km 19,12 der. (f_0190)' },
    { poly: [[10.483486, -66.894949], [10.483579, -66.894891], [10.483524, -66.894813], [10.483439, -66.894866]], a: 'RES', pisos: 3, col: '#d9773f', shop: 1, alt: 1, nota: 'casa naranja de 3 pisos, km 19,14 der. (f_0190)' },
    { poly: [[10.483594, -66.894881], [10.483708, -66.894797], [10.483638, -66.894707], [10.483528, -66.894788]], a: 'RES', pisos: 3, col: '#7fc4c6', shop: 1, alt: 1, nota: 'casa turquesa, km 19,16 der. (f_0192)' },
    { poly: [[10.483719, -66.894788], [10.483814, -66.894696], [10.483754, -66.894634], [10.483662, -66.894723]], a: 'RES', pisos: 4, col: '#b25a3c', shop: 1, alt: 1, nota: 'ladrillo de 4 pisos en la esquina, km 19,18 der. (f_0191–0192)' },
    // la torre que asoma detrás de las casas es verde pálido y de ~17 pisos (f_0191–0192), no crema de 20
    { ll: [10.483944, -66.894277], a: 'RES', pisos: 17, col: '#d2d5bb', alt: 1, shop: 0, nota: 'torre verde pálido tras las casas, km 19,23 der.' },
    { ll: [10.484042, -66.893841], a: 'RES', pisos: 16, col: '#dcc39b', nota: 'torre crema, km 19,27 der.' },
    // 19-nov: el Farmatodo (OSM way 1547479272, brand Farmatodo, 24 h, drive-through) se modela entero en landmarks/zona_ucv_acacias.js:
    // caja blanca, techo azul a cuatro aguas, rótulo FARMATODO y estacionamiento al frente (video t=481–482)
    { ll: [10.484592, -66.893520], quitar: true, nota: 'Farmatodo, km 19,34 der.: va a mano' },
    { ll: [10.484248, -66.893155], a: 'RES', pisos: 11, col: '#a89084', alt: 1, nota: 'torre parda detrás de Farmatodo (f_0193)' },
    { ll: [10.485300, -66.892790], a: 'RES', pisos: 7, col: '#cfc7ba', shop: 1, nota: 'edificio con locales y toldos naranja, km 19,45 der. (f_0194)' },
    { ll: [10.485551, -66.892478], a: 'RES', pisos: 6, col: '#d9d4c8', shop: 1, nota: 'km 19,50 der.' },
    { ll: [10.485745, -66.892080], a: 'RES', pisos: 7, col: '#d6d2c9', shop: 1, nota: 'Edificio Macu, km 19,55 der.' },
    // 19-nov: E/S Ciudad Universitaria (PDV, OSM node 2408097116): la huella de 98 m² a 9 m del eje es la marquesina (va a mano); la de 190 m², la tienda
    { ll: [10.486040, -66.891837], quitar: true, nota: 'marquesina de la bomba PDV, km 19,59 der.: va a mano' },
    { ll: [10.485901, -66.891785], a: 'COM', h: 4.2, col: '#eeede8', shop: 0, detalle: 0, nota: 'tienda de la bomba PDV, km 19,58 der.; antes salía como casa de techo de teja' },
    // km 19,64–19,73 der. (video t=486,5–487,5): bloque crema con locales y el letrero verde de Farmacia Universitaria, el quiosco del mural,
    // un edificio de ladrillo naranja de 6 pisos y uno crema de 5
    { ll: [10.486321, -66.891212], a: 'RES', pisos: 5, col: '#e8e1cf', shop: 1, alt: 1, nota: 'Farmacia Universitaria y El Mundo del Libro en planta baja (OSM), km 19,66 der.' },
    { ll: [10.486593, -66.890877], a: 'RES', pisos: 6, col: '#c8673d', shop: 1, alt: 1, nota: 'ladrillo naranja de 6 pisos tras el quiosco del mural, km 19,70 der.' },
    { ll: [10.486698, -66.890687], a: 'RES', pisos: 5, col: '#e2d5b6', shop: 1, alt: 0, nota: 'crema de 5 pisos con balcones, km 19,72 der.' },
    { ll: [10.486862, -66.890496], a: 'RES', pisos: 12, col: '#ecebe6', alt: 1, nota: 'edificio blanco alto, km 19,75 der. (f_0196)' },
    { ll: [10.486968, -66.890025], a: 'RES', pisos: 8, col: '#c8724e', alt: 1, nota: 'edificios de ladrillo naranja, km 19,80 der. (f_0197)' },
    // 19-nov: va antes que Cars porque su punto cae también dentro de la huella grande de Cars y la teñía de ladrillo
    { ll: [10.487452, -66.889231], a: 'COM', h: 8, col: '#d27a52', shop: 0, nota: 'cuerpo de ladrillo naranja del concesionario, km 19,90 der.' },
    { ll: [10.487163, -66.889324], a: 'COM', h: 9, col: '#efeeea', shop: 1, nota: 'Edificio Cars, concesionario Toyota, km 19,88 der. (f_0198)' },
    { ll: [10.4880, -66.8883], r: 55, a: 'COM', col: '#e9e7e1', shop: 0, nota: 'frente derecho de la plaza: rejas, lotes y galpones blancos, sin santamarías' },
    // Plaza Las Tres Gracias (km 19,95 izq.): en el video es grama abierta con hongos y banderas, sin quioscos
    { ll: [10.488036, -66.889165], quitar: true, nota: 'quiosco en la plaza' },
    { ll: [10.488091, -66.889216], quitar: true, nota: 'quiosco en la plaza' },
    { ll: [10.488077, -66.889078], quitar: true, nota: 'quiosco en la plaza' },
    // km 20,27: la caseta junto al pozo circular de la plaza invadía el borde derecho; recortada a 7,5 m del eje
    { ll: [10.489343, -66.886491], quitar: true, nota: 'punta de la caseta metida en la calzada, km 20,27 der.' },
    { poly: [[10.489263, -66.88654], [10.489279, -66.886258], [10.489346, -66.886262], [10.489345, -66.886288], [10.489363, -66.886283], [10.489325, -66.886398], [10.489329, -66.886418], [10.489311, -66.886467], [10.489284, -66.886529]],
      h: 7.9, col: '#dfe0e4', nota: 'caseta recortada a 7,5 m del eje, km 20,27 der.' },
    // Estadio Universitario: la huella de 25.619 m² salía como una caja maciza de 15,6 m; el estadio (gradas, grama, torres) va en landmarks/zona_ucv_acacias.js
    { ll: [10.489585, -66.883639], quitar: true, nota: 'caja del Estadio Universitario, km 20,49 der.' },
    // casetas en la trinchera bajo la Plaza de los Estadios (quedaban metidas bajo la losa)
    { ll: [10.489679, -66.885421], quitar: true, nota: 'caseta bajo la plaza, km 20,39 der.' },
    { ll: [10.489752, -66.885287], quitar: true, nota: 'caseta bajo la plaza, km 20,41 der.' },
    { ll: [10.489921, -66.885128], quitar: true, nota: 'caseta bajo la plaza, km 20,43 der.' },
    // salida del puente y Av. Casanova
    { ll: [10.492259, -66.882491], quitar: true, nota: 'aguja de 60 m en una huella de 50 m², km 20,81 der.' },
    { ll: [10.492596, -66.882552], a: 'RES', pisos: 12, col: '#dcdcd6', alt: 1, nota: 'Edificio Olimpo, km 20,83 der.' },
    { ll: [10.493097, -66.881436], a: 'COM', pisos: 2, col: '#cfc8bb', shop: 1, nota: 'estacionamiento con reja y autolavado, km 20,95 der.' },
    { ll: [10.493868, -66.882027], a: 'RES', pisos: 14, col: '#b65b3e', alt: 1, nota: 'Las Acacias A, ladrillo rojo (f_0207–0208)' },
    { ll: [10.494098, -66.881849], a: 'RES', pisos: 14, col: '#b65b3e', alt: 1, nota: 'Las Acacias B, ladrillo rojo' },
    { ll: [10.493983, -66.881456], a: 'COM', pisos: 3, col: '#ecebe6', shop: 1, nota: 'casa blanca con valla en la azotea antes del cruce a Casanova (f_0209)' },
    { ll: [10.494822, -66.881687], a: 'VID', alt: 1, col: '#c3c8cc', nota: 'Torre Banhorient, km 21,07 izq.' },
    { ll: [10.493741, -66.877974], a: 'VID', col: '#2f62a0', nota: 'Torre Banco Plaza, vidrio azul (f_0212)' },
  ],
  via: [
    // puente: calzada de la ruta + isla con grama y brocal amarillo + calzada contraria de 2 canales; sin árboles sobre el tablero
    { km0: 20.56, km1: 20.79, set: { canales: 2, calzadas: 2, sep: 'isla con grama', ancho: 23, 'L.tipo': 'muro/terreno', 'R.tipo': 'muro/terreno', 'L.retiro': 2, 'R.retiro': 2,
      'veg.L': 0, 'veg.R': 0, 'veg.palL': 0, 'veg.palR': 0, 'veg.denL': 0, 'veg.denR': 0 } },
    // trinchera bajo la Plaza de los Estadios: isla baja sin árboles (atravesarían la losa) y sin arbolado a los lados
    { km0: 20.25, km1: 20.55, set: { sep: 'isla con grama', 'veg.L': 0, 'veg.R': 0, 'veg.palL': 0, 'veg.palR': 0, 'veg.denL': 0, 'veg.denR': 0 } },
  ],
  relieve: [
    // el tablero va a la cota de la calle y todo lo de abajo (Guaire, autopista, ramales) baja ~9 m. Asimétrico: la ruta va por la
    // calzada derecha (SE) del puente; la otra calzada y la isla quedan a la izquierda, hasta +18 m del eje.
    { km0: 20.568, km1: 20.772, lado: 'R', d0: 8.7, d1: 12.5, dh: -9, d2: 110, d3: 135, rampa: 12, nota: 'puente de Las Acacias: autopista y Guaire abajo (lado derecho)' },
    { km0: 20.568, km1: 20.772, lado: 'L', d0: 18.3, d1: 22, dh: -9, d2: 100, d3: 125, rampa: 12, nota: 'puente de Las Acacias: autopista y Guaire abajo (lado izquierdo)' },
  ],
  // 19-nov: perfil entre los estadios y el puente. El SRTM del juego lo dejaba casi llano (860,3–861 m del km 20,15 al 20,8); en la calle la avenida
  // BAJA ~4,5 m para pasar bajo la Plaza de los Estadios (losa con tres patios circulares; OSM: tramos layer −1 en 20,306–20,481) y SUBE por la rampa
  // del muro gris al tablero (20,575). La bajada termina antes del 20,30 para que quepa la losa de la plaza (gálibo ≥ 4,5 m). Video: muros con murales
  // t=502–503,5; bajo la plaza t=504–508; rampa t=508,5–509,5; tablero t=510; al salir del puente baja a la calle de charcos (t=514–516).
  // Cotas: SRTM 30 m crudo y Copernicus GLO-30 (relativas, sin los árboles del km 20,07–20,22).
  perfil: [
    { km: 19.95, dz: 0 }, { km: 20.12, dz: .5 }, { km: 20.17, dz: .5 },     // Av. Las Acacias casi llana bajo los árboles
    { km: 20.29, dz: -3.0 }, { km: 20.34, dz: -4.3 }, { km: 20.46, dz: -4.3 }, // bajada entre los murales y punto bajo bajo la plaza
    { km: 20.565, dz: 0 }, { km: 20.76, dz: 0 },                            // rampa con el muro gris y tablero del puente (cota del juego)
    { km: 20.83, dz: -1.5 }, { km: 20.95, dz: 0 },                          // bajada del puente a la calle de charcos y subida hacia Casanova
  ],
  // el terreno baja con la vía solo dentro de la trinchera (muros en −8,45 y +17,6, landmarks/zona_ucv_acacias.js); la losa y los remates la tapan
  perfilAncho: { R: [16, 22], L: [18.5, 26] },
  // árboles de los patios circulares de la plaza (crecen desde abajo, a la cota de la vía)
  arboles: [{ ll: [10.489665, -66.885501], especie: 'mango', alto: 13 }, { ll: [10.489742, -66.885385], especie: 'caobo', alto: 15 },
    { ll: [10.489962, -66.885633], especie: 'mango', alto: 12 }, { ll: [10.489893, -66.885729], especie: 'saman', alto: 14 }],
  // la baranda genérica del puente (D.estructuras 20,65–20,9) se sustituye por el tablero modelado en landmarks/zona_ucv_acacias.js
  // y la «cubierta» genérica de 20,48–20,55 (viaducto plano mal ubicado: lo que se ve en el video es la losa de la plaza, en el módulo de zona)
  quitaEstructuras: [[20.6, 20.95], [20.47, 20.56]],
  estructuras: [],
};
