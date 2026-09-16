/* ============================================================
 * deli-counter.js — 鲜食柜台（饭团 / 便当 / 握寿司 + 玻璃罩）
 * 导出 M.deliCounter(o)  朝向 +z（店铺正面方向）
 * o = { x, z }  店内本地坐标
 * ============================================================ */
(function () {
  'use strict';

  M.deliCounter = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const bodyM = MTL.toon(0xe8e8e2);
    const greenM = MTL.toon(0x1f8a4d);
    const boardM = MTL.toon(0xd8d8dc);
    const steelM2 = MTL.std(0xc8ccd0, { rough: 0.35, metal: 0.85, env: 0.5 });
    const glassM = MTL.glass(0xd9edf5, 0.14);
    S.addGlass({ mat: glassM, amp: 0.18, speed: 0.5, phase: 2.1 });
    const ledM = MTL.toon(0xfff6e6, { emissive: 0xfff3dd, ei: 1.7 });
    S.addBreathe({ mat: ledM, amp: 0.2, speed: 0.55, phase: 0.4 });

    /* 基座 + 绿条 + 台面 */
    g.add(S.box(2.2, 0.72, 0.92, bodyM, 0, 0.36, 0));
    g.add(S.box(2.2, 0.09, 0.02, greenM, 0, 0.62, 0.47));
    g.add(S.box(2.3, 0.05, 1.0, boardM, 0, 0.745, 0));

    /* 玻璃罩（前/后/侧 + 顶 + 立柱） */
    [[-1.06, -0.44], [1.06, -0.44], [-1.06, 0.44], [1.06, 0.44]].forEach(function (p) {
      g.add(S.box(0.035, 0.68, 0.035, steelM2, p[0], 1.11, p[1]));
    });
    g.add(S.plane(2.1, 0.66, glassM, 0, 1.11, 0.44, { cast: false }));
    g.add(S.plane(2.1, 0.66, glassM, 0, 1.11, -0.44, { cast: false, ry: Math.PI }));
    g.add(S.plane(0.88, 0.66, glassM, 1.06, 1.11, 0, { cast: false, ry: Math.PI / 2 }));
    g.add(S.plane(0.88, 0.66, glassM, -1.06, 1.11, 0, { cast: false, ry: -Math.PI / 2 }));
    g.add(S.planeH(2.1, 0.88, glassM, 0, 1.45, 0, { cast: false }));
    g.add(S.box(2.0, 0.025, 0.04, ledM, 0, 1.42, 0.1, { cast: false }));

    /* 不锈钢托盘 ×3 */
    [-0.7, 0.02, 0.72].forEach(function (tx) {
      g.add(S.box(0.62, 0.03, 0.72, steelM2, tx, 0.785, 0));
    });

    /* —— 饭团（托盘 1） —— */
    const onig = [[-0.82, -0.16], [-0.58, -0.16], [-0.75, 0.05], [-0.55, 0.05], [-0.68, 0.22]];
    onig.forEach(function (p) {
      g.add(S.box(0.075, 0.05, 0.155, MTL.nori, p[0], 0.82, p[1]));
      const b = S.cyl(0.055, 0.055, 0.15, MTL.rice, p[0], 0.855, p[1], { seg: 3, rx: Math.PI / 2, ry: Math.PI / 6 });
      g.add(b);
    });

    /* —— 便当（托盘 2） —— */
    [[-0.06, -0.16], [0.1, 0], [-0.05, 0.16]].forEach(function (p, i) {
      g.add(S.box(0.17, 0.05, 0.12, MTL.toon(0x8a5a3a), p[0], 0.82, p[1]));
      g.add(S.box(0.1, 0.045, 0.1, MTL.rice, p[0] - 0.03, 0.85, p[1]));
      const e = S.sph(0.016, MTL.egg, p[0] + 0.055, 0.855, p[1] - 0.02);
      g.add(e);
      g.add(S.box(0.04, 0.02, 0.05, MTL.toon(i === 1 ? 0xd86a5a : 0xe8956a), p[0] + 0.055, 0.855, p[1] + 0.025));
    });

    /* —— 握寿司（托盘 3） —— */
    const topC = [0xe8956a, 0xd86a5a, 0xf2d8a0];
    [[0.66, -0.2], [0.78, -0.08], [0.66, 0.06], [0.78, 0.18], [0.66, 0.3], [0.78, -0.3]].forEach(function (p, i) {
      g.add(S.box(0.055, 0.012, 0.055, MTL.nori, p[0], 0.801, p[1]));
      g.add(S.box(0.045, 0.025, 0.045, MTL.rice, p[0], 0.819, p[1]));
      const tm = i % 4 === 0 ? MTL.sushiTop : MTL.toon(topC[i % 3]);
      g.add(S.box(0.04, 0.02, 0.04, tm, p[0], 0.84, p[1]));
    });

    /* 价签 ×3 */
    const tags = ['120円', '480円', '280円'];
    [-0.7, 0.02, 0.72].forEach(function (tx, i) {
      const tagM = MTL.toon(0xffffff, {
        map: T.label(tags[i], { w: 128, h: 96, bg: '#f5f2e8', fg: '#3a3a40', size: 48, border: true, bc: '#1f8a4d' }),
        emissive: 0x2a2a20, ei: 0.15
      });
      g.add(S.plane(0.16, 0.1, tagM, tx, 1.06, 0.45, { cast: false }));
    });

    MTL.outlineAdd(g, 0.014);
    g.position.set(o.x !== undefined ? o.x : 1.3, 0, o.z !== undefined ? o.z : 2.85);
    return g;
  };
})();