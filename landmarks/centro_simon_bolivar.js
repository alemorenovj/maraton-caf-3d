// Centro Simón Bolívar: Torres de El Silencio (Torre Norte y Torre Sur, 103 m, 32 pisos, 1954) + los Edificios
// Norte y Sur (12 pisos, 183 m de largo) que enmarcan la Plaza Caracas. Huellas OSM (ways 537716124 y vecinos):
// todas con el eje largo a −13° (este-sureste). Retícula de concreto claro con parasoles profundos, planta baja en
// pilotis con mosaicos de colores, y en la plaza el puente-pasarela con el friso de la Batalla de Carabobo,
// el letrero PLAZA CARACAS y el busto sobre pedestal de granito rojo.
export const meta = {
  id: 'centro_simon_bolivar',
  nombre: 'Torres de El Silencio y Plaza Caracas',
  quita: [
    [10.502518, -66.916228, 26], // Torre Sur
    [10.503015, -66.916099, 26], // Torre Norte
    [10.503409, -66.917275, 30], // Edificio Norte (centroide)
    [10.502578, -66.917481, 30], // Edificio Sur (centroide)
  ],
};

export function build(THREE, api) {
  const g = new THREE.Group(), ANG = -13 * Math.PI / 180, box = new THREE.BoxGeometry(1, 1, 1);
  const at = (lat, lon) => { const p = api.xz(lat, lon); return { x: p.x, z: p.z, y: api.ground(p.x, p.z) }; };

  // retícula de concreto con parasoles (vista de lejos: marcos claros profundos sobre vidrio en sombra)
  function reticula({ pisos, vanos, on = .3, seed = 5, fin = .16, losa = .3 }) {
    let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647, W = Math.min(1024, 48 * vanos), H = Math.min(1024, 32 * pisos);
    const map = api.canvasTex(W, H, (c, w, h) => { const cw = w / vanos, ch = h / pisos; c.fillStyle = '#3d3a35'; c.fillRect(0, 0, w, h);
      for (let r = 0; r < pisos; r++) for (let i = 0; i < vanos; i++) { c.fillStyle = 'rgba(110,120,128,.4)'; c.fillRect(i * cw + cw * fin, r * ch + ch * losa, cw * (1 - 2 * fin), ch * (1 - losa) * .55); }
      c.fillStyle = '#c9bb9a'; for (let r = 0; r <= pisos; r++) c.fillRect(0, r * ch - ch * losa / 2, w, ch * losa); // losas/parasol horizontales
      for (let i = 0; i <= vanos; i++) c.fillRect(i * cw - cw * fin / 2, 0, cw * fin, h); // aletas verticales
      c.fillStyle = 'rgba(0,0,0,.22)'; for (let r = 0; r < pisos; r++) c.fillRect(0, r * ch + ch * losa / 2, w, ch * .12); // sombra bajo el parasol
    });
    const em = api.canvasTex(W, H, (c, w, h) => { const cw = w / vanos, ch = h / pisos; c.fillStyle = '#000'; c.fillRect(0, 0, w, h); for (let r = 0; r < pisos; r++) for (let i = 0; i < vanos; i++) if (rnd() < on) { c.fillStyle = rnd() < .5 ? '#ffe3b5' : '#e6f0ff'; c.fillRect(i * cw + cw * fin, r * ch + ch * losa * .6, cw * (1 - 2 * fin), ch * (1 - losa) * .8); } });
    const m = new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 0, roughness: .85 }); api.onFrame(st => { m.emissiveIntensity = 1.05 * st.noche; }); return m;
  }
  // mosaicos de colores de la planta baja (abstracción geométrica tipo Manaure)
  const mosaico = (() => { const t = api.canvasTex(512, 64, (c, w, h) => { const cs = ['#d8402f', '#f1c232', '#2f6db5', '#1d1d1d', '#f2efe6', '#3f9a6b', '#e07b2a']; c.fillStyle = '#f2efe6'; c.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { c.fillStyle = cs[i % cs.length]; const x = (i * 37) % w, y = (i * 13) % h; c.fillRect(x, y, 14 + (i * 7) % 40, 10 + (i * 5) % 30); } }); t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1); return new THREE.MeshStandardMaterial({ map: t, roughness: .5 }); })();
  const conc = api.concrete(0xcfc7b3), concSombra = api.concrete(0x8e887c), techo = api.concrete(0x9d978b), oscuro = api.concrete(0x2c2f33);

  // ---------- torres gemelas ----------
  const torreFachada = reticula({ pisos: 32, vanos: 20, seed: 3 }), torreTestero = reticula({ pisos: 32, vanos: 6, fin: .3, on: .15, seed: 8 });
  for (const [lat, lon] of [[10.50248015, -66.91617995], [10.5029686, -66.9160692]]) {
    const p = at(lat, lon), t = new THREE.Group(), L = 60.8, W = 28.8, H = 103, PB = 9;
    const cuerpo = new THREE.Mesh(box, [torreTestero, torreTestero, techo, techo, torreFachada, torreFachada]); cuerpo.scale.set(L, H - PB, W); cuerpo.position.y = PB + (H - PB) / 2; t.add(cuerpo);
    const pb = new THREE.Mesh(box, [mosaico, mosaico, oscuro, oscuro, mosaico, mosaico]); pb.scale.set(L - 4, PB + 6, W - 4); pb.position.y = (PB - 6) / 2; t.add(pb); // planta baja retranqueada con mosaicos
    for (let i = 0; i < 7; i++) for (const sz of [-1, 1]) { const col = new THREE.Mesh(box, conc); col.scale.set(1.4, PB, 1.4); col.position.set(-L / 2 + 1 + i * (L - 2) / 6, PB / 2, sz * (W / 2 - .8)); t.add(col); }
    const maq = new THREE.Mesh(box, conc); maq.scale.set(22, 7, 14); maq.position.y = H + 3.5; t.add(maq);
    const corn = new THREE.Mesh(box, conc); corn.scale.set(L + 1, 1.4, W + 1); corn.position.y = H; t.add(corn);
    t.position.set(p.x, p.y - 3, p.z); t.rotation.y = ANG; g.add(t);
  }

  // ---------- Edificios Norte y Sur (12 pisos con pilotis) ----------
  const bloqF = reticula({ pisos: 12, vanos: 32, seed: 13 }); bloqF.map.repeat.set(2, 1); bloqF.emissiveMap.repeat.set(2, 1);
  for (const [lat, lon, L, W, side] of [[10.503389410, -66.917106953, 182.9, 22.4, -1], [10.502566365, -66.917312048, 182.8, 26.0, 1]]) {
    const p = at(lat, lon), b = new THREE.Group(), H = 42, PB = 7;
    const cu = new THREE.Mesh(box, [concSombra, concSombra, techo, techo, bloqF, bloqF]); cu.scale.set(L, H - PB, W); cu.position.y = PB + (H - PB) / 2; b.add(cu);
    const pb = new THREE.Mesh(box, oscuro); pb.scale.set(L, PB + 4, W - 7); pb.position.set(0, (PB - 4) / 2, -side * 3.5); b.add(pb);
    const colG = new THREE.CylinderGeometry(.75, .75, PB, 10); // pórtico de pilotis hacia la plaza
    for (let i = 0; i < 26; i++) { const col = new THREE.Mesh(colG, conc); col.position.set(-L / 2 + 3 + i * (L - 6) / 25, PB / 2, side * (W / 2 - 1.2)); b.add(col); }
    b.position.set(p.x, p.y - 3, p.z); b.rotation.y = ANG; g.add(b);
  }

  // ---------- Plaza Caracas ----------
  const pc = at(10.502978, -66.917209); // punto medio entre los dos edificios
  const piso = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ map: (() => { const t = api.canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#a09889'; c.fillRect(0, 0, w, h); c.strokeStyle = '#7d766a'; c.lineWidth = 3; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 4); return t; })(), roughness: .9 }));
  const plaza = new THREE.Group(); piso.scale.set(118, 1, 58); piso.position.y = .5; plaza.add(piso);
  // puente-pasarela con el friso de la batalla y el letrero
  const mural = api.canvasTex(1024, 160, (c, w, h) => {
    const sky = c.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#5fa6dd'); sky.addColorStop(.7, '#9fd0ef'); c.fillStyle = sky; c.fillRect(0, 0, w, h); c.fillStyle = '#b08a5e'; c.fillRect(0, h * .72, w, h * .28);
    const jinete = (x, col, cab) => { c.fillStyle = cab; c.beginPath(); c.ellipse(x, h * .66, 34, 16, 0, 0, 7); c.fill(); c.fillRect(x - 28, h * .66, 7, 34); c.fillRect(x + 20, h * .66, 7, 34); c.beginPath(); c.ellipse(x + 36, h * .52, 9, 18, .6, 0, 7); c.fill(); c.fillStyle = col; c.fillRect(x - 8, h * .3, 16, 34); c.beginPath(); c.arc(x, h * .26, 8, 0, 7); c.fill(); };
    jinete(250, '#c8202c', '#d9a24e'); jinete(420, '#22314f', '#f0f0f0'); jinete(560, '#f0f0f0', '#e8e8e8'); jinete(740, '#c8202c', '#efefef'); jinete(860, '#2a2a2a', '#3a2a20');
    c.fillStyle = '#3c3c3c'; c.beginPath(); c.arc(90, h * .78, 22, 0, 7); c.fill(); c.fillRect(90, h * .66, 70, 12); c.fillStyle = '#ffffff'; c.fillRect(140, h * .4, 16, 40); });
  const letrero = api.canvasTex(1024, 64, (c, w, h) => { c.fillStyle = '#ece6cf'; c.fillRect(0, 0, w, h); c.fillStyle = '#4a3a1c'; c.font = 'bold 44px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('P L A Z A     C A R A C A S', w / 2, h / 2 + 2); c.font = 'bold 26px Georgia'; c.fillStyle = '#9a7a2a'; c.fillText('2008', w * .88, h / 2 + 2); });
  const puente = new THREE.Group(), LW = 62;
  const losa = new THREE.Mesh(box, [concSombra, concSombra, techo, oscuro, new THREE.MeshStandardMaterial({ map: letrero, roughness: .6 }), new THREE.MeshStandardMaterial({ map: letrero, roughness: .6 })]); losa.scale.set(LW, 2.4, 9); losa.position.y = 8.2; puente.add(losa);
  const bar = new THREE.Mesh(box, oscuro); bar.scale.set(LW, 1.6, 8.6); bar.position.y = 10.2; puente.add(bar);
  const muralM = api.glow(0xffffff, { dia: 0, noche: .35, mat: { map: mural, color: 0xffffff } }); muralM.emissiveMap = mural;
  const panel = new THREE.Mesh(box, [concSombra, concSombra, techo, techo, muralM, muralM]); panel.scale.set(LW, 7.5, .6); panel.position.y = 14.8; puente.add(panel);
  for (const x of [-20, 0, 20]) { const col = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 7, 12), concSombra); col.position.set(x, 3.5, 0); puente.add(col); }
  puente.rotation.y = Math.PI / 2; puente.position.set(-42, 0, 0); plaza.add(puente);
  // busto (Bolívar joven) sobre pedestal de granito rojo con banco
  const granito = api.concrete(0x8e4b45, { roughness: .45 }), bronce = api.concrete(0x3b3a33, { roughness: .4, metalness: .6 });
  const ped = new THREE.Mesh(box, granito); ped.scale.set(2.2, 5.5, 2.2); ped.position.set(-26, 3.25, 6); plaza.add(ped);
  const banco = new THREE.Mesh(box, granito); banco.scale.set(9, .9, 4.5); banco.position.set(-26, .95, 6); plaza.add(banco);
  const busto = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), bronce); busto.scale.set(1.2, .8, .9); busto.position.set(-26, 6.6, 6); plaza.add(busto);
  const cab = new THREE.Mesh(new THREE.SphereGeometry(.75, 12, 10), bronce); cab.position.set(-26, 7.9, 6); plaza.add(cab);
  plaza.position.set(pc.x, pc.y - .2, pc.z); plaza.rotation.y = ANG; g.add(plaza);

  return api.sombras(g);
}
