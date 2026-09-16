/* ============================================================
 * beverage-fridge.js — 饮料冰箱（绿色外壳 + 三片玻璃门 + 内 LED + 五层）
 * 导出 M.beverageFridge(o)  组心在地面，背板贴后墙内面
 * o = { x, z }  店内本地坐标
 * ============================================================ */
(function () {
  'use strict';

  M.beverageFridge = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const greenM = MTL.toon(0x1f8a4d);
    const steelM = MTL.metal(0x8a8f96, 0.4);
    const linerM = MTL.toon(0xf4f6f7);
    const boardM = MTL.toon(0xe4e8ea);
    const glassM = MTL.glass(0xd9edf5, 0.18);
    S.addGlass({ mat: glassM, amp: 0.18, speed: 0.5, phase: 1.2 });
    const ledM = MTL.toon(0xfff6e6, { emissive: 0xfff3dd, ei: 1.8 });
    S.addBreathe({ mat: ledM, amp: 0.22, speed: 0.5, phase: 0.7 });

    /* 外壳（绿色钣金） */
    g.add(S.box(2.04, 0.12, 0.64, steelM, 0, 0.06, 0));
    g.add(S.box(2.0, 0.04, 0.6, greenM, 0, 0.14, 0));
    g.add(S.box(0.04, 2.2, 0.6, greenM, -0.98, 1.24, 0));
    g.add(S.box(0.04, 2.2, 0.6, greenM, 0.98, 1.24, 0));
    g.add(S.box(2.0, 0.04, 0.6, greenM, 0, 2.34, 0));
    g.add(S.box(2.0, 2.2, 0.04, greenM, 0, 1.24, -0.28));
    g.add(S.box(2.0, 0.24, 0.04, greenM, 0, 2.2, 0.28));
    /* 白色内胆 */
    g.add(S.box(1.9, 2.05, 0.015, linerM, 0, 1.21, -0.25));
    g.add(S.box(0.015, 2.05, 0.5, linerM, -0.955, 1.21, 0));
    g.add(S.box(0.015, 2.05, 0.5, linerM, 0.955, 1.21, 0));

    /* 层板 ×5 + 商品 */
    const tops = [0.25, 0.62, 0.99, 1.36, 1.73];
    const kinds = ['soda', 'can', 'juice', 'carton', 'can'];
    tops.forEach(function (ty, i) {
      g.add(S.box(1.88, 0.025, 0.52, boardM, 0, ty - 0.0125, 0));
      PRD.fillShelf({ parent: g, kind: kinds[i], x0: -0.85, x1: 0.85, z: 0.02, y: ty, rows: 1, seed: 300 + i * 7 });
    });

    /* 内 LED 灯带 */
    g.add(S.box(1.86, 0.03, 0.045, ledM, 0, 2.16, 0.02, { cast: false }));

    /* 门间隔条 + 三片玻璃门 + 把手 */
    g.add(S.box(0.05, 2.05, 0.02, greenM, -0.33, 1.21, -0.27));
    g.add(S.box(0.05, 2.05, 0.02, greenM, 0.33, 1.21, -0.27));
    [-0.66, 0, 0.66].forEach(function (dx) {
      g.add(S.plane(0.6, 1.9, glassM, dx, 1.13, 0.29, { cast: false }));
      g.add(S.box(0.025, 0.5, 0.025, steelM, dx - 0.26, 1.0, 0.31));
    });

    /* 温度显示 + 顶部标识 */
    const tempM = MTL.toon(0xffffff, {
      map: T.label('7.0°C', { w: 192, h: 96, bg: '#1a1f26', fg: '#7ee0a0', size: 56, border: false }),
      emissive: 0x2a4030, ei: 0.5
    });
    g.add(S.plane(0.24, 0.12, tempM, 0.72, 1.9, 0.315, { cast: false }));
    const signM = MTL.toon(0xffffff, {
      map: T.label('ドリンク', { w: 256, h: 128, bg: '#1f8a4d', fg: '#f5f2e8', size: 64, border: false }),
      emissive: 0x1f8a4d, ei: 0.2
    });
    g.add(S.plane(0.56, 0.22, signM, 0, 2.2, 0.305, { cast: false }));

    MTL.outlineAdd(g, 0.016);
    g.position.set(o.x !== undefined ? o.x : -4.6, 0, o.z !== undefined ? o.z : -3.28);
    return g;
  };
})();