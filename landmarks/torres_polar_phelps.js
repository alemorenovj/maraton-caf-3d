// Torres de Plaza Venezuela, al norte de la fuente: Torre Polar I (con el letrero POLAR) y Torre Polar II (prismas de
// vidrio casi negro), Torre Phelps (concreto beige con la taza roja de NESCAFÉ en la azotea) y Torre Capriles / SENIAT
// (rejilla clara con el letrero SENIAT y la franja tricolor). Plantas y orientación tomadas de las huellas OSM.
export const meta = {
  id: 'torres_polar_phelps',
  nombre: 'Torres Polar, Phelps y SENIAT (Plaza Venezuela)',
  quita: [
    [10.497740, -66.885929, 30],   // Torre Polar I
    [10.497952, -66.886492, 24],   // Torre Polar II
    [10.498088, -66.885433, 21],   // Torre Phelps
    [10.497678, -66.884640, 33],   // Torre Capriles / SENIAT
  ],
};

export function build(THREE, api) {
  const root = new THREE.Group();
  // caja con fachada; w = ancho (eje X local), d = fondo (eje Z local); la textura se repite por módulos reales
  const slab = (mat, w, h, d, matTop) => {
    const geo = new THREE.BoxGeometry(w, h, d); const uv = geo.attributes.uv;
    // UV en metros/escala: caras ±X usan d, caras ±Z usan w (cada cara: 4 vértices en orden +X, −X, +Y, −Y, +Z, −Z)
    const sz = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * sz[f][0] / mat.userData.mw, uv.getY(i) * sz[f][1] / mat.userData.mh); }
    const top = matTop || api.concrete(0x55585c); return new THREE.Mesh(geo, [mat, mat, top, top, mat, mat]);
  };
  const fac = (o, mw, mh) => { const m = api.facade(o); m.userData.mw = mw; m.userData.mh = mh; return m; };
  const place = (lat, lon, ang) => { const p = api.xz(lat, lon), g = new THREE.Group(); g.position.set(p.x, api.ground(p.x, p.z) - .3, p.z); g.rotation.y = ang; root.add(g); return g; };
  const ANG = -26 * Math.PI / 180; // retícula de calles de Plaza Venezuela: el eje largo de las torres va 26° al sur del este

  // --- Torre Polar I (letrero POLAR) — huella 64 × 25 m: torre de 44 × 24 sobre podio ---
  const polarMat = fac({ pared: '#151a20', vidrio: '#07090c', pisos: 8, vanos: 8, marco: .12, encendidas: .14, seed: 3, roughness: .3, metalness: .45, env: .45 }, 12, 28);
  {
    const g = place(10.497740, -66.885929, ANG);
    const podium = slab(fac({ pared: '#6d6a63', vidrio: '#20262c', pisos: 2, vanos: 8, marco: .3 }, 20, 8), 62, 8, 24); podium.position.y = 4; g.add(podium);
    const t = slab(polarMat, 44, 62, 22); t.position.set(-6, 31, 0); g.add(t);
    const mech = slab(polarMat, 30, 4, 16); mech.position.set(-6, 64, 0); g.add(mech);
    // letrero POLAR: letras blancas sobre bastidor, en las dos caras largas
    const tex = api.canvasTex(1024, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.font = 'bold 210px "Arial Black", Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 14; x.strokeStyle = '#1d3f8f'; x.strokeText('POLAR', w / 2, h / 2 + 8); x.fillStyle = '#ffffff'; x.fillText('POLAR', w / 2, h / 2 + 8); });
    const sm = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: .05, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: .25, side: THREE.DoubleSide, roughness: .5 });
    api.onFrame(st => { sm.emissiveIntensity = .25 + 1.6 * st.noche; });
    for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(30, 7.5), sm); p.position.set(-6, 66 + 3.9, s * 1.2); g.add(p); }
    const frame = new THREE.Mesh(new THREE.BoxGeometry(30, .4, 2.6), api.concrete(0x777b80)); frame.position.set(-6, 66, 0); g.add(frame);
  }
  // --- Torre Polar II — 86 m, vidrio negro, esquinas de la cima escalonadas ---
  {
    const g = place(10.497952, -66.886492, ANG);
    const t = slab(polarMat, 44, 76, 21); t.position.y = 38; g.add(t);
    const t2 = slab(polarMat, 36, 6, 17); t2.position.y = 79; g.add(t2);
    const t3 = slab(polarMat, 26, 4, 13); t3.position.y = 84; g.add(t3);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(27, 1.2, 14), new THREE.MeshStandardMaterial({ color: 0x30353b, metalness: .6, roughness: .4, wireframe: false })); crown.position.y = 86.6; g.add(crown);
  }

  // --- Torre Phelps: 92 m de torre beige + taza NESCAFÉ roja de ~13 m ---
  {
    const g = place(10.498088, -66.885433, -8.5 * Math.PI / 180);
    const m = fac({ pared: '#94815e', vidrio: '#34322d', pisos: 10, vanos: 6, marco: .42, encendidas: .3, seed: 5 }, 14, 31);
    const H = 90, W = 24, Dp = 30;
    const t = slab(m, W, H, Dp); t.position.y = H / 2; g.add(t);
    // franja superior con aristas achaflanadas (las esquinas del remate)
    const band = new THREE.Mesh(new THREE.CylinderGeometry(Math.hypot(W, Dp) / 2 * .97, Math.hypot(W, Dp) / 2 * .97, 4, 4, 1), api.concrete(0x9b8a64));
    band.scale.set(W / Math.hypot(W, Dp) * 1.414, 1, Dp / Math.hypot(W, Dp) * 1.414); band.rotation.y = Math.PI / 4; band.position.y = H + 2; g.add(band);
    const nTex = api.canvasTex(1024, 128, (x, w, h) => { x.fillStyle = '#1b1712'; x.fillRect(0, 0, w, h); x.font = 'bold 100px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ffffff'; x.fillText('NESCAFÉ', w / 2, h / 2 + 6); });
    const nm = new THREE.MeshStandardMaterial({ map: nTex, emissive: 0xffffff, emissiveMap: nTex, emissiveIntensity: .2, roughness: .6 }); api.onFrame(st => { nm.emissiveIntensity = .2 + 1.4 * st.noche; });
    for (const [px, pz, ry, ww] of [[0, Dp / 2 + .05, 0, W * .8], [0, -Dp / 2 - .05, Math.PI, W * .8], [W / 2 + .05, 0, Math.PI / 2, Dp * .7], [-W / 2 - .05, 0, -Math.PI / 2, Dp * .7]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(ww, 3.2), nm); p.position.set(px, H - 2.2, pz); p.rotation.y = ry; g.add(p); }
    // la taza: cuerpo rojo algo cónico, borde blanco, asa, y "NESCAFÉ" en blanco
    const cupTex = api.canvasTex(1024, 256, (x, w, h) => { x.fillStyle = '#c8202b'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.font = 'bold 120px Georgia, serif'; x.textBaseline = 'middle'; x.textAlign = 'center'; x.fillText('NESCAFÉ', w * .25, h * .55); x.fillText('NESCAFÉ', w * .75, h * .55); });
    const cupM = new THREE.MeshStandardMaterial({ map: cupTex, roughness: .35, metalness: .05, emissive: 0xffffff, emissiveMap: cupTex, emissiveIntensity: .05 }); api.onFrame(st => { cupM.emissiveIntensity = .05 + .9 * st.noche; });
    const red = new THREE.MeshStandardMaterial({ color: 0xc8202b, roughness: .35 });
    const cup = new THREE.Group(); cup.position.y = H + 4;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 5.2, 10, 32, 1, true), cupM); body.position.y = 5; cup.add(body);
    const bottom = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, .4, 32), red); bottom.position.y = .2; cup.add(bottom);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(6.2, .35, 6, 32), api.concrete(0xf2f0ea)); rim.rotation.x = Math.PI / 2; rim.position.y = 10; cup.add(rim);
    const coffee = new THREE.Mesh(new THREE.CircleGeometry(6, 32), api.concrete(0x3a2414)); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 9.4; cup.add(coffee);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(2.6, .7, 8, 16, Math.PI * 1.15), red); handle.position.set(6.4, 5.4, 0); handle.rotation.z = -Math.PI * .57; cup.add(handle);
    cup.rotation.y = Math.PI * .5; // asa hacia el norte (la cara de la plaza ve el rótulo)
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7, .6, 32), api.concrete(0xe8e6e0)); plate.position.y = H + 4.3 - 4.3 + 4; g.add(plate);
    g.add(cup);
  }

  // --- Torre Capriles / SENIAT: losa de 103 m, rejilla clara, eje verde y letrero SENIAT con franja tricolor ---
  {
    const g = place(10.497610, -66.884580, ANG);
    const W = 54, Dp = 22, H = 98;
    const m = fac({ pared: '#d3cfc4', vidrio: '#365472', pisos: 8, vanos: 8, marco: .34, encendidas: .3, seed: 9 }, 13, 26);
    const t = slab(m, W, H, Dp); t.position.y = H / 2; g.add(t);
    // eje central de paneles verdes en las dos caras largas
    const gm = fac({ pared: '#c2c0b6', vidrio: '#56704c', pisos: 8, vanos: 2, marco: .3, seed: 2 }, 6, 26);
    for (const s of [1, -1]) { const st = slab(gm, 6, H - 4, .6); st.position.set(0, H / 2, s * (Dp / 2 + .3)); g.add(st); }
    const mech = slab(fac({ pared: '#bdb9ae', vidrio: '#4a5059', pisos: 1, vanos: 4, marco: .5 }, 20, 5), 30, 5, 14); mech.position.y = H + 2.5; g.add(mech);
    const sTex = api.canvasTex(1024, 256, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      x.font = 'bold 170px "Arial Black", Arial, sans-serif'; x.textBaseline = 'middle'; x.textAlign = 'left'; x.fillStyle = '#1b2a6b'; x.fillText('SEN', 20, h * .55);
      const t0 = 20 + x.measureText('SEN').width; x.fillStyle = '#d42a2a'; x.fillText('I', t0, h * .55); const t1 = t0 + x.measureText('I').width; x.fillStyle = '#1b2a6b'; x.fillText('AT', t1, h * .55);
      const fx = w * .66; x.fillStyle = '#f7d117'; x.fillRect(fx, h * .22, w * .32, h * .19); x.fillStyle = '#1e3f9e'; x.fillRect(fx, h * .41, w * .32, h * .19); x.fillStyle = '#d42a2a'; x.fillRect(fx, h * .60, w * .32, h * .19);
      x.fillStyle = '#ffffff'; for (let i = 0; i < 8; i++) { const a = Math.PI * (.15 + .7 * i / 7); x.beginPath(); x.arc(fx + w * .16 - Math.cos(a) * 34, h * .56 - Math.sin(a) * 20, 4, 0, 7); x.fill(); } });
    const smat = new THREE.MeshStandardMaterial({ map: sTex, emissive: 0xffffff, emissiveMap: sTex, emissiveIntensity: .2, roughness: .6 }); api.onFrame(st => { smat.emissiveIntensity = .2 + 1.2 * st.noche; });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(34, 8.5, .6), [api.concrete(0x777777), api.concrete(0x777777), api.concrete(0x777777), api.concrete(0x777777), smat, smat]); sign.position.set(0, H + 5 + 4.25, 0); g.add(sign);
    const legs = new THREE.InstancedMesh(new THREE.BoxGeometry(.4, 5, .4), api.concrete(0x5a5a5a), 6); const M = new THREE.Matrix4();
    for (let i = 0; i < 6; i++) { M.makeTranslation(-15 + i * 6, H + 2.5, 0); legs.setMatrixAt(i, M); } g.add(legs);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(.15, .2, 14, 6), api.concrete(0x999999)); mast.position.set(14, H + 12, -5); g.add(mast);
  }
  return api.sombras(root);
}
