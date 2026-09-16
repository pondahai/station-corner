/* ============================================================
 * petals.js — 樱花飘落 / 地面花瓣系统
 * 导出 window.P
 * 约定：樱花树工厂调用 P.canopy(x,y,z,r) 注册树冠中心（世界坐标），
 *       场景装配末尾调用 P.init() 生成飘落花瓣、地面花瓣与花瓣地毯
 * ============================================================ */
(function () {
  'use strict';
  const P = window.P = { canopies: [], inited: false };

  /* 注册树冠（x,y 为冠心世界坐标，r 为冠半径） */
  P.canopy = function (x, y, z, r) { P.canopies.push({ x: x, y: y, z: z, r: r }); };

  /* 花瓣形状（平片，长约 3.4cm，尖端朝 -y） */
  function petalGeo() {
    const s = new THREE.Shape();
    s.moveTo(0, -0.017);
    s.bezierCurveTo(-0.0115, -0.009, -0.0135, 0.007, -0.0072, 0.016);
    s.quadraticCurveTo(0, 0.0215, 0.0072, 0.016);
    s.bezierCurveTo(0.0135, 0.007, 0.0115, -0.009, 0, -0.017);
    const g = new THREE.ShapeGeometry(s, 6);
    const pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i), y = pa.getY(i);
      pa.setZ(i, -(x * x + y * y) * 2.2);
    }
    g.computeVertexNormals();
    return g;
  }

  function pickCanopy(rnd) {
    if (!P.canopies.length) return { x: -2, y: 4.2, z: 9, r: 1.6 };
    return P.canopies[Math.floor(rnd() * P.canopies.length)];
  }

  function spawn(rnd) {
    const c = pickCanopy(rnd);
    const a = rnd() * Math.PI * 2;
    const rr = Math.sqrt(rnd()) * c.r;
    return {
      x: c.x + Math.cos(a) * rr,
      y: c.y + (rnd() - 0.25) * c.r * 0.9,
      z: c.z + Math.sin(a) * rr,
      vy: 0.15 + rnd() * 0.2,
      drift: 0.15 + rnd() * 0.45,
      ph: rnd() * 6.2832,
      f: 0.5 + rnd() * 1.3,
      rx: rnd() * 6.2832, ry: rnd() * 6.2832, rz: rnd() * 6.2832,
      sx: (rnd() - 0.5) * 2.6, sy: (rnd() - 0.5) * 2.6, sz: (rnd() - 0.5) * 2.6,
      s: 0.85 + rnd() * 0.7
    };
  }

  function groundSpawn(rnd) {
    const c = pickCanopy(rnd);
    const a = rnd() * Math.PI * 2;
    const rr = Math.sqrt(rnd()) * c.r * 1.55;
    return {
      bx: c.x + Math.cos(a) * rr,
      bz: c.z + Math.sin(a) * rr,
      y: 0.012 + rnd() * 0.006,
      rx: -Math.PI / 2 + (rnd() - 0.5) * 0.55,
      rz: rnd() * 6.2832,
      s: 0.65 + rnd() * 0.8,
      ph: rnd() * 6.2832, f: 0.25 + rnd() * 0.5, amp: 0.006 + rnd() * 0.014
    };
  }

  P.init = function () {
    if (P.inited) return;
    P.inited = true;
    const rnd = T.rng(20260409);
    const geo = petalGeo();
    const tones = [0xfdeef3, 0xf9dbe4, 0xf6c9d6, 0xf2bac9, 0xfbd3de];
    const col = new THREE.Color();

    /* ---- 飘落花瓣 ---- */
    const N = 330;
    const im = new THREE.InstancedMesh(geo, MTL.toon(0xffffff, { side: THREE.DoubleSide }), N);
    im.castShadow = false; im.receiveShadow = false;
    P.fallSt = [];
    for (let i = 0; i < N; i++) {
      P.fallSt.push(spawn(rnd));
      col.setHex(tones[i % tones.length]);
      im.setColorAt(i, col);
    }
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    S.scene.add(im);
    P.fall = im;

    /* ---- 地面散落花瓣 ---- */
    const NG = 640;
    const gim = new THREE.InstancedMesh(geo, MTL.toon(0xffffff, { side: THREE.DoubleSide }), NG);
    gim.castShadow = false; gim.receiveShadow = false;
    P.groundSt = [];
    for (let i = 0; i < NG; i++) {
      P.groundSt.push(groundSpawn(rnd));
      col.setHex(tones[Math.floor(rnd() * tones.length)]);
      col.multiplyScalar(0.88 + rnd() * 0.16);
      gim.setColorAt(i, col);
    }
    if (gim.instanceColor) gim.instanceColor.needsUpdate = true;
    S.scene.add(gim);
    P.ground = gim;

    /* ---- 树冠下花瓣地毯 ---- */
    P.canopies.forEach(function (c, i) {
      const m = new THREE.MeshBasicMaterial({
        map: T.petalCarpet(), transparent: true, depthWrite: false, side: THREE.DoubleSide
      });
      const carpet = S.planeH(c.r * 2.6, c.r * 2.6, m, c.x, 0.016 + (i % 3) * 0.0015, c.z, {
        ry: T.rng(100 + i)() * 6.2832, cast: false, recv: false
      });
      carpet.renderOrder = 2;
      carpet.userData.noOutline = true;
      S.scene.add(carpet);
    });

    S.addUpdate(update);
  };

  function update(t, dt) {
    /* 全局风场：缓慢 gust */
    const wx = 0.34 + 0.24 * Math.sin(t * 0.11) + 0.09 * Math.sin(t * 0.53 + 1.4);
    const wz = 0.13 + 0.17 * Math.sin(t * 0.07 + 2.1);

    const im = P.fall, st = P.fallSt;
    for (let i = 0; i < st.length; i++) {
      let p = st[i];
      p.x += (wx + Math.sin(t * p.f + p.ph) * p.drift) * dt;
      p.z += (wz + Math.cos(t * p.f * 0.8 + p.ph) * p.drift * 0.8) * dt;
      p.y -= p.vy * dt;
      if (p.y < 0.014 || Math.abs(p.x) > 13.2 || Math.abs(p.z) > 13.2) {
        p = spawn(Math.random);
        p.y = 2.4 + Math.random() * 4.6;
        st[i] = p;
      }
      S.setInst(im, i, p.x, p.y, p.z,
        p.rx + Math.sin(t * p.f * 0.9 + p.ph) * 0.8 + t * p.sx,
        p.ry + t * p.sy,
        p.rz + Math.cos(t * p.f * 0.7 + p.ph) * 0.7 + t * p.sz,
        p.s, p.s, p.s);
    }
    im.instanceMatrix.needsUpdate = true;

    const gim = P.ground, gst = P.groundSt;
    for (let i = 0; i < gst.length; i++) {
      const g = gst[i];
      const ox = Math.sin(t * g.f + g.ph) * g.amp + wx * 0.012 * Math.sin(t * 0.31 + g.ph);
      const oz = Math.cos(t * g.f * 0.8 + g.ph) * g.amp + wz * 0.012 * Math.sin(t * 0.27 + g.ph);
      S.setInst(gim, i, g.bx + ox, g.y, g.bz + oz, g.rx, 0, g.rz, g.s, g.s, g.s);
    }
    gim.instanceMatrix.needsUpdate = true;
  }
})();