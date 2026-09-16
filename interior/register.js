/* ============================================================
 * register.js — 收银台（收银机 + 客显 + 扫码器 + 纸袋架 + 抽屉）
 * 导出 M.register(o)  朝向 +z（店铺正面方向）
 * o = { x, z }  店内本地坐标
 * ============================================================ */
(function () {
  'use strict';

  M.register = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const bodyM = MTL.toon(0xe8e8e2);
    const greenM = MTL.toon(0x1f8a4d);
    const boardM = MTL.toon(0xd8d8dc);
    const darkM = MTL.toon(0x2f343a);
    const steelM = MTL.metal(0x9aa0a6, 0.35);
    const screenM = MTL.toon(0x10151a, { emissive: 0x2f8a5a, ei: 0.9 });
    S.addBreathe({ mat: screenM, amp: 0.12, speed: 0.7, phase: 1.4 });

    /* 台体 + 绿条 + 台面 */
    g.add(S.box(1.5, 0.68, 0.94, bodyM, 0, 0.34, 0));
    g.add(S.box(1.5, 0.09, 0.02, greenM, 0, 0.56, 0.48));
    g.add(S.box(1.56, 0.04, 1.0, boardM, 0, 0.70, 0));

    /* 收银机（机身 + 屏） */
    g.add(S.box(0.3, 0.16, 0.24, darkM, -0.15, 0.80, -0.12));
    g.add(S.box(0.26, 0.2, 0.02, screenM, -0.15, 0.97, -0.18, { rx: -0.3 }));

    /* 顾客显（立屏 + 支脚） */
    g.add(S.box(0.03, 0.14, 0.03, darkM, 0.08, 0.79, 0.16));
    g.add(S.box(0.18, 0.12, 0.02, screenM, 0.08, 1.05, 0.18, { rx: -0.45 }));

    /* 扫码器 */
    g.add(S.box(0.07, 0.1, 0.09, darkM, 0.34, 0.77, 0.1));
    g.add(S.box(0.05, 0.02, 0.01, MTL.toon(0x10151a, { emissive: 0xd85a4a, ei: 0.8 }), 0.34, 0.81, 0.055, { cast: false }));

    /* 纸袋架（四柱 + 横杆 + 两只纸袋） */
    [[-0.52, -0.14], [-0.52, 0.1], [-0.62, -0.14], [-0.62, 0.1]].forEach(function (p) {
      g.add(S.box(0.016, 0.28, 0.016, steelM, p[0], 0.86, p[1]));
    });
    g.add(S.box(0.12, 0.015, 0.26, steelM, -0.57, 0.9, 0, { rz: 0, rx: 0 }));
    g.add(S.box(0.13, 0.16, 0.028, MTL.toon(0xf2ead8), -0.52, 0.82, -0.04));
    g.add(S.box(0.13, 0.16, 0.028, MTL.toon(0xe8e0d0), -0.52, 0.82, 0.07));

    /* 台面小垃圾桶 + 钱箱 */
    g.add(S.cyl(0.07, 0.06, 0.15, steelM, 0.62, 0.795, 0.25));
    g.add(S.cyl(0.072, 0.072, 0.015, steelM, 0.62, 0.875, 0.25));
    g.add(S.box(0.24, 0.12, 0.2, MTL.toon(0x3a3f45), 0.28, 0.78, 0.28));
    g.add(S.box(0.08, 0.02, 0.015, steelM, 0.28, 0.78, 0.385));

    MTL.outlineAdd(g, 0.014);
    g.position.set(o.x !== undefined ? o.x : 4.15, 0, o.z !== undefined ? o.z : 2.4);
    return g;
  };
})();