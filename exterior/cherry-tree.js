/* ============================================================
 * cherry-tree.js — 樱花树（染井吉野 / 晚樱 / 街角小樱）
 * 导出 M.cherryTree(o)
 * o = { x, z, kind: 'yoshino'|'ozaki'|'small', scale, seed, ry }
 * 工厂直接放在世界坐标 (x,0,z)；树冠注册 P.canopy 供花瓣系统使用
 * ============================================================ */
(function () {
  'use strict';

  M.cherryTree = function (o) {
    o = o || {};
    const kind = o.kind || 'yoshino';
    const seed = o.seed !== undefined ? o.seed : 11;
    const scale = o.scale !== undefined ? o.scale : 1;
    const rnd = T.rng(9000 + seed * 131 + (kind === 'ozaki' ? 77 : kind === 'small' ? 41 : 0));
    const g = new THREE.Group();

    /* ---------- 尺寸 ---------- */
    let H, R;
    if (kind === 'small') { H = 2.5 + rnd() * 0.3; R = 1.0 + rnd() * 0.15; }
    else if (kind === 'ozaki') { H = 4.3 + rnd() * 0.5; R = 1.4 + rnd() * 0.15; }
    else { H = 5.1 + rnd() * 0.5; R = 1.7 + rnd() * 0.2; }
    H *= scale; R *= scale;
    const canY = H * 0.82;
    const bark = MTL.toon(0xffffff, { map: T.bark(seed * 7 + 3) });

    /* ---------- 树干（微 S 弯） ---------- */
    const tx = (rnd() - 0.5) * 0.2 * scale, tz = (rnd() - 0.5) * 0.2 * scale;
    const trunkPts = [
      new THREE.Vector3(0, -0.02, 0),
      new THREE.Vector3(tx * 0.5, H * 0.24, tz * 0.5),
      new THREE.Vector3(tx * 1.6 + (rnd() - 0.5) * 0.35 * scale, H * 0.55, tz * 1.8),
      new THREE.Vector3(tx * 0.6, H * 0.72, tz * 0.6),
      new THREE.Vector3(0, H * 0.8, 0)
    ];
    const trunk = S.taperTube(trunkPts, H * 0.017, H * 0.006, bark, 0, 0, 0, { seg: 16, radial: 10 });
    g.add(trunk);
    const flare = S.cyl(H * 0.013, H * 0.03, H * 0.042, bark, 0, H * 0.02, 0, { seg: 12 });
    g.add(flare);
    /* 根部小凸 */
    for (let i = 0; i < 4; i++) {
      const a = rnd() * 6.2832;
      g.add(S.sph(0.05 * scale, bark, Math.cos(a) * 0.1 * scale, 0.02 * scale, Math.sin(a) * 0.1 * scale, { sx: 1.5, sy: 0.5, sz: 1.5 }));
    }
    MTL.outlineAdd(trunk, 0.02 * scale);
    MTL.outlineAdd(flare, 0.018 * scale);

    /* ---------- 分枝 ---------- */
    const nb = kind === 'small' ? 5 : 7;
    for (let i = 0; i < nb; i++) {
      const a = rnd() * Math.PI * 2;
      const up = 0.5 + rnd() * 0.35;
      const len = (0.7 + rnd() * 0.8) * scale;
      const p0 = trunkPts[2].clone().lerp(trunkPts[4], rnd() * 0.8);
      const p1 = p0.clone().add(new THREE.Vector3(
        Math.cos(a) * len * (0.6 + rnd() * 0.5),
        up * len,
        Math.sin(a) * len * (0.6 + rnd() * 0.5)
      ));
      const pm = p0.clone().lerp(p1, 0.5).add(new THREE.Vector3(
        (rnd() - 0.5) * 0.25 * scale, len * 0.4, (rnd() - 0.5) * 0.25 * scale
      ));
      const br = S.taperTube([p0, pm, p1], H * 0.0065, H * 0.0016, bark, 0, 0, 0, { seg: 10, radial: 7 });
      g.add(br);
      MTL.outlineAdd(br, 0.015 * scale);
      /* 二次细枝 */
      if (rnd() < 0.8) {
        const p2 = pm.clone().add(new THREE.Vector3(
          (rnd() - 0.5) * 0.5 * scale, len * 0.4, (rnd() - 0.5) * 0.5 * scale
        ));
        g.add(S.taperTube([pm, p2], H * 0.0035, H * 0.0012, bark, 0, 0, 0, { seg: 8, radial: 6 }));
      }
    }

    /* ---------- 花团（两子群、相位错开 → 层叠微风） ---------- */
    const tones = kind === 'ozaki'
      ? [0xf6bccd, 0xefa4bb, 0xe895ab, 0xf3c3d4, 0xe38ba3]
      : [0xfdeff4, 0xfae0e9, 0xf6ccd9, 0xfbe2ea, 0xf3c1d1];
    const emiss = kind === 'ozaki' ? 0xff9ec0 : 0xffc8da;
    const canA = new THREE.Group(), canB = new THREE.Group();
    canA.position.y = canY; canB.position.y = canY;
    g.add(canA); g.add(canB);

    const blobInfo = [];
    const nblob = kind === 'small' ? 8 : 12;
    for (let i = 0; i < nblob; i++) {
      const a = i / nblob * Math.PI * 2 + rnd() * 0.9;
      const rr = Math.sqrt(rnd()) * R * 0.6;
      const cx = Math.cos(a) * rr, cz = Math.sin(a) * rr;
      const cy = (rnd() - 0.42) * R * 0.6;
      const r = R * (0.42 + rnd() * 0.4);
      const c = tones[Math.floor(rnd() * tones.length)];
      const m = MTL.toon(c, { emissive: emiss, ei: 0.13 });
      const blob = S.sph(r, m, cx, cy, cz, {
        w: 20, h: 14,
        sx: 0.88 + rnd() * 0.45, sy: 0.7 + rnd() * 0.35, sz: 0.88 + rnd() * 0.45
      });
      (i % 2 === 0 ? canA : canB).add(blob);
      MTL.outlineAdd(blob, 0.02 * scale);
      blobInfo.push({ x: cx, y: cy, z: cz, r: r * (0.95 + rnd() * 0.25) });
    }
    /* 内侧亮团（透光感） */
    for (let i = 0; i < 3; i++) {
      const a = rnd() * 6.2832, rr = rnd() * R * 0.3;
      const m = MTL.toon(kind === 'ozaki' ? 0xfbd9e4 : 0xfff7f9, { emissive: emiss, ei: 0.18 });
      (i % 2 === 0 ? canA : canB).add(
        S.sph(R * (0.3 + rnd() * 0.22), m, Math.cos(a) * rr, R * 0.24, Math.sin(a) * rr, { w: 16, h: 12 })
      );
    }
    /* 冠层轻摆 */
    S.addSway({ obj: canA, axis: 'z', amp: 0.011 * scale, speed: 0.62, phase: rnd() * 6.2832, base: 0 });
    S.addSway({ obj: canB, axis: 'z', amp: 0.014 * scale, speed: 0.51, phase: rnd() * 6.2832, base: 0 });
    S.addSway({ obj: canA, axis: 'x', amp: 0.007 * scale, speed: 0.44, phase: rnd() * 6.2832, base: 0 });
    S.addSway({ obj: canB, axis: 'x', amp: 0.009 * scale, speed: 0.37, phase: rnd() * 6.2832, base: 0 });

    /* ---------- 树上花瓣（附着花团表面，随冠摆动） ---------- */
    const npet = kind === 'small' ? 34 : 52;
    const pgeo = new THREE.PlaneGeometry(0.055, 0.055);
    const pmat = new THREE.MeshBasicMaterial({
      map: T.petal(), transparent: true, alphaTest: 0.08,
      side: THREE.DoubleSide, depthWrite: false
    });
    const pim = new THREE.InstancedMesh(pgeo, pmat, npet);
    pim.castShadow = false; pim.receiveShadow = false;
    for (let i = 0; i < npet; i++) {
      const b = blobInfo[Math.floor(rnd() * blobInfo.length)];
      const a = rnd() * 6.2832, el = (rnd() - 0.3) * Math.PI;
      const ce = Math.cos(el);
      S.setInst(pim, i,
        b.x + Math.cos(a) * ce * b.r * 1.03,
        b.y + Math.sin(el) * b.r * 0.85,
        b.z + Math.sin(a) * ce * b.r * 1.03,
        rnd() * 6.2832, rnd() * 6.2832, rnd() * 6.2832,
        0.7 + rnd() * 0.9, 0.7 + rnd() * 0.9, 1
      );
    }
    pim.instanceMatrix.needsUpdate = true;
    canA.add(pim);

    /* ---------- 放置 & 注册树冠 ---------- */
    g.position.set(o.x || 0, 0, o.z || 0);
    if (o.ry) g.rotation.y = o.ry;
    P.canopy(o.x || 0, canY, o.z || 0, R * 1.15);
    return g;
  };
})();