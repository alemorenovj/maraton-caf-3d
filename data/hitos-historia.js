// Historia y datos caraqueños para los hitos que narra el modo «Reconocer» (auditoría final, 19-nov-2026).
// Los hitos base viven en data/caf-data.js (D.hitos, lo escribe build/02_build.py). Esto los completa al arrancar, ANTES de que game.js
// arme la ruta activa y los rótulos 📍, así que vale igual para 42K y 21K y los hitos nuevos sí tienen rótulo. No hace falta regenerar datos.
// Fuentes y dudas: build/investigacion/auditoria_final_0_21.md y auditoria_final_21_42.md. Solo datos comprobados; lo dudoso no se cita.
// xz(lat, lon) → [x, z] del mundo; enRuta(km) → [x, z] del eje de la ruta en ese km del 42K.
export default function historia(D, xz, enRuta) {
  const H = D && D.hitos; if (!Array.isArray(H) || H.__historia) return; H.__historia = true;
  const de = km => H.find(h => Math.abs(h.km - km) < .011);
  const mas = (km, txt, o = {}) => { const h = de(km); if (h && !h.desc.includes(txt)) { h.desc = h.desc + ' ' + txt; Object.assign(h, o); } };
  const r = p => [Math.round(p[0]), Math.round(p[1])];
  // ── km 0–21 ──
  mas(0.24, 'El teatro se inauguró en 1983 y lleva el nombre de la pianista caraqueña Teresa Carreño.');
  mas(0.6, 'Las levantó la firma Siso, Shaw y Asociados entre 1970 y 1983; la Torre Este se incendió en 2004 y se recuperó.');
  mas(2.4, 'Las torres del Centro Simón Bolívar, de Cipriano Domínguez (1949–1954), fueron de los primeros rascacielos de Caracas.');
  mas(2.9, 'El paseo lo mandó a hacer Guzmán Blanco y se abrió en 1883; arriba está el Arco de la Federación, de 1895.');
  mas(3.06, 'Es parte de la Reurbanización El Silencio de Carlos Raúl Villanueva (1942–1945); la fuente de las Toninas es de Francisco Narváez.');
  mas(8.17, 'El monumento lo esculpió Eloy Palacios entre 1905 y 1911 para recordar la Batalla de Carabobo.');
  mas(9.2, 'Lleva el nombre del atleta venezolano que ganó el oro del pentatlón en los Juegos Bolivarianos de 1951.');
  mas(12.7, 'Se diseñó en 1956 como centro comercial con rampas para que los carros subieran en espiral; nunca abrió como tal.');
  mas(17.18, 'El Paseo Los Próceres es obra de Luis Malaussena y se inauguró en 1956.');
  mas(19.95, 'La Ciudad Universitaria de Villanueva es Patrimonio de la Humanidad de la UNESCO desde el año 2000.');
  mas(20.5, 'Se construyó para los Juegos Bolivarianos de 1951.');
  // ── km 21–42 ──
  mas(22.6, 'La estación del Metro abrió el 27 de marzo de 1983 como terminal este de la Línea 1; en la Plaza Brión está el Cubo virtual de Jesús Soto.', { lado: 'izq' });
  mas(25.14, 'La plaza lleva el nombre de Alfredo Sadel (1930–1989), «el tenor favorito de Venezuela».');
  mas(26.5, 'A la izquierda asoma el CCCT (1976), con la pirámide invertida que se diseñó así por el límite de altura del aeropuerto de La Carlota.');
  { const h = de(31.3); if (h) { h.nombre = 'Retorno de El Llanito'; h.desc = 'Extremo este: das la vuelta junto al puente de El Llanito, ya en el municipio Sucre. Te quedan 11 km y la subida larga.'; } }
  // el Parque del Este queda al SUR de la Miranda: a la IZQUIERDA de quien corre hacia el oeste (los datos decían «a tu derecha»)
  { const h = de(36.4); if (h) { h.lado = 'izq'; h.desc = 'Parque Generalísimo Francisco de Miranda. Lo diseñó el brasileño Roberto Burle Marx y abrió el 19 de enero de 1961: 64 hectáreas de jardines, lagunas y el Planetario. Queda menos de 1 km de subida.'; } }
  { const h = de(35.7); if (h) h.desc = h.desc.replace('Parque del Este a la derecha', 'Parque del Este a la izquierda y el Millennium Mall a la derecha'); }
  mas(37.27, 'Se inauguró en 1945 como Plaza Altamira, con la urbanización de Luis Roche; en 1967 pasó a llamarse Plaza Francia.');
  mas(38, 'Chacao fue tierra de haciendas: hacia 1784 el cura José Antonio García Mohedano sembró aquí miles de cafetos, de los primeros del valle de Caracas (la Calle Mohedano lo recuerda).');
  // ── hitos nuevos ──
  const nuevos = [
    { km: 4.38, nombre: 'Iglesia de Lourdes · Av. San Martín', tipo: 'zona', lado: 'der', off: 40, desc: 'Las dos agujas neogóticas sobre la Plaza Italia. Bajas hacia la Maternidad.' },
    { km: 4.6, nombre: 'Maternidad Concepción Palacios', tipo: 'zona', lado: 'izq', off: 40, desc: 'El edificio amarillo de molduras blancas; lleva el nombre de la madre de Simón Bolívar, María de la Concepción Palacios.' },
    { km: 7.3, nombre: 'Puente Los Leones', tipo: 'zona', pos: enRuta ? r(enRuta(7.35)) : undefined, lado: 'der', off: 12, desc: 'Cruzas el Guaire y la Autopista Francisco Fajardo entre los cuatro leones. Al salir, la Av. O\'Higgins.' },
    // el hotel queda casi al frente (~4° a la izquierda, 300 m) al bajar por la Av. Principal de Las Mercedes; con `pos` el aviso no dice lado
    // 20-nov (pedido del dueño): Paseo Las Mercedes; su cara NE da a la ruta a 24–27 m der. en el km 25,65–25,70 (OSM). Fuente: Wikipedia «Paseo Las Mercedes»
    { km: 25.4, nombre: 'C.C. Paseo Las Mercedes', tipo: 'zona', pos: r(xz(10.47845, -66.85805)), desc: 'Al final de la avenida, a la derecha: se terminó en 1974 junto con su hotel, proyecto del arquitecto Jimmy Alcock, y alberga el Trasnocho Cultural.' },
    { km: 25.62, nombre: 'Hotel Tamanaco', tipo: 'zona', pos: r(xz(10.477564, -66.856146)), desc: 'Al frente, en lo alto del cerro: abrió en 1953, proyecto de John Wellborn Root Jr., y fue durante décadas el hotel emblema de Caracas.' },
    { km: 41.12, nombre: 'Torre La Previsora', tipo: 'zona', lado: 'der', off: 40, desc: 'Inaugurada en 1973: 30 pisos y 117 m, con el reloj luminoso que se ve desde media Caracas. La rodeas por el este y el sur.' },
  ];
  for (const n of nuevos) if (!de(n.km)) H.push(n);
  H.sort((a, b) => a.km - b.km);
}
