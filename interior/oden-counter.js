/* ============================================================
 * oden-counter.js — 关东煮台（双锅 + 汤面 + 串签 + 玻璃罩 + 蒸汽）
 * 导出 M.odCounter(o)  朝向 +z
 * o = { x, z }  店内本地坐标
 * ============================================================ */
(function () {
  'use strict';

  M.odCounter = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const bodyM = MTL.toon(0xe8e8e2);
    const greenM = MTL.toon(0x1f8a4d);
    const potM = MTL.std(0x9aa0a6, { rough: 0.4, metal: 0.8, env: 0.6 });
    const soupM = MTL.toon(0x5a3a26, { map: T.oven() });
    const glassM = MTL.glass(0xd9edf5, 0.14);
    S.addGlass({ mat: glassM, amp: 0.18, speed: 0.5, phase: 3.0 });
    const ledM = MTL.toon(0xfff6e6, { emissive: 0xfff3dd, ei: 1.7 });
    S.addBreathe({ mat: ledM, amp: 0.2, speed: 0.55, phase: 0.9 });
    const stickM = MTL.toon(0xc8a878);

    /* 基座 + 绿条 + 不锈钢面 */
    g.add(S.box(1.7, 0.9, 0.92, bodyM, 0, 0.45, 0));
    g.add(S.box(1.7, 0.1, 0.02, greenM, 0, 0.8, 0.47));
    g.add(S.box(1.76, 0.05, 0.98, MTL.std(0xc8ccd0, { rough: 0.35, metal: 0.85, env: 0.5 }), 0, 0.925, 0));

    /* 锅 A（大） */
    g.add(S.cyl(0.27, 0.25, 0.22, potM, -0.4, 1.06, 0.05));
    g.add(S.torus(0.26, 0.015, potM, -0.4, 1.165, 0.05, { rx: Math.PI / 2 }));
    g.add(S.cyl(0.24, 0.24, 0.02, soupM, -0.4, 1.15, 0.05, { cast: false }));
    /* 锅 B（小） */
    g.add(S.cyl(0.24, 0.22, 0.2, potM, 0.45, 1.05, -0.05));
    g.add(S.torus(0.23, 0.014, potM, 0.45, 1.145, -0.05, { rx: Math.PI / 2 }));
    g.add(S.cyl(0.21, 0.21, 0.02, soupM, 0.45, 1.135, -0.05, { cast: false }));

    /* 锅内食材 */
    g.add(S.box(0.08, 0.045, 0.13, MTL.toon(0xf5f0e0), -0.52, 1.16, -0.05, { ry: 0.4 }));
    const egg1 = S.sph(0.03, MTL.egg, -0.35, 1.165, 0.1, { sy: 0.72 });
    g.add(egg1);
    g.add(S.box(0.05, 0.04, 0.05, MTL.toon(0x2e2a28), -0.45, 1.16, 0.15, { ry: 0.3 }));
    g.add(S.box(0.06, 0.02, 0.06, MTL.fishcake, -0.28, 1.17, -0.02));
    const dot = S.sph(0.012, MTL.toon(0xf5f2ea), -0.28, 1.185, -0.02);
    g.add(dot);
    g.add(S.cyl(0.02, 0.02, 0.13, MTL.plastic(0xf0e0d0), -0.48, 1.18, 0.12, { rx: 0.5 }));
    g.add(S.box(0.07, 0.04, 0.1, MTL.toon(0xf5f0e0), 0.55, 1.15, 0.0, { ry: -0.3 }));
    const egg2 = S.sph(0.028, MTL.egg, 0.38, 1.15, -0.12, { sy: 0.72 });
    g.add(egg2);
    const ball = S.sph(0.035, MTL.toon(0x6a4a3a), 0.5, 1.155, 0.1);
    g.add(ball);

    /* 竹签 ×4（签身 + 签头食材） */
    const sk = [[-0.5, -0.08, 0x5ab87a], [-0.3, 0.18, 0xf5f0e0], [0.38, -0.12, 0xd86a5a], [0.55, 0.08, 0x5a3a26]];
    sk.forEach(function (p, i) {
      g.add(S.cyl(0.004, 0.004, 0.32, stickM, p[0], 1.24, p[1], { rx: i % 2 ? 0.06 : -0.05 }));
      const t = S.sph(0.022, MTL.toon(p[2]), p[0] + (i % 2 ? 0.015 : -0.015), 1.41, p[1]);
      g.add(t);
    });

    /* 玻璃罩（前/后/侧 + 顶 + 立柱） */
    [[-0.83, -0.44], [0.83, -0.44], [-0.83, 0.44], [0.83, 0.44]].forEach(function (p) {
      g.add(S.box(0.03, 0.46, 0.03, potM, p[0], 1.18, p[1]));
    });
    g.add(S.plane(1.66, 0.46, glassM, 0, 1.18, 0.44, { cast: false }));
    g.add(S.plane(1.66, 0.46, glassM, 0, 1.18, -0.44, { cast: false, ry: Math.PI }));
    g.add(S.plane(0.88, 0.46, glassM, 0.83, 1.18, 0, { cast: false, ry: Math.PI / 2 }));
    g.add(S.plane(0.88, 0.46, glassM, -0.83, 1.18, 0, { cast: false, ry: -Math.PI / 2 }));
    g.add(S.planeH(1.66, 0.88, glassM, 0, 1.41, 0, { cast: false }));
    g.add(S.box(1.6, 0.025, 0.04, ledM, 0, 1.38, 0.1, { cast: false }));

    /* 蒸汽 ×5（sprite 上升 + 淡入淡出） */
    const st = [[-0.45, 0.03], [-0.32, -0.06], [0.4, 0.05], [0.5, -0.05], [0.48, 0.12]].map(function (p, i) {
      const m = new THREE.SpriteMaterial({
        map: T.steam(), transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending
      });
      const sp = new THREE.Sprite(m);
      sp.scale.set(0.3, 0.3, 1);
      sp.position.set(p[0], 1.3, p[1]);
      g.add(sp);
      return { sp: sp, m: m, bx: p[0], bz: p[1], ph: i * 1.31 };
    });
    S.addUpdate(function (t) {
      st.forEach(function (s) {
        const p = (t * 0.22 + s.ph) % 1;
        s.sp.position.y = 1.25 + p * 0.75;
        s.sp.position.x = s.bx + Math.sin(t * 1.1 + s.ph * 2.1) * 0.04;
        s.m.opacity = Math.sin(p * Math.PI) * 0.55;
      });
    });

    /* 价签 */
    const tagM = MTL.toon(0xffffff, {
      map: T.label('おでん120円', { w: 256, h: 128, bg: '#f5f2e8', fg: '#3a3a40', size: 44, border: true, bc: '#1f8a4d' }),
      emissive: 0x2a2a20, ei: 0.15
    });
    g.add(S.plane(0.3, 0.15, tagM, 0.55, 1.2, 0.46, { cast: false }));

    MTL.outlineAdd(g, 0.014);
    g.position.set(o.x !== undefined ? o.x : 4.9, 0, o.z !== undefined ? o.z : -2.7);
    return g;
  };
})();