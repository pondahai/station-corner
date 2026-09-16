/* ============================================================
 * back-door.js — 员工门室内侧（滑动门叶 + 吊轨 + 上亮窗 + 牌）
 * 导出 M.backDoor(o)  组心在地面，贴东墙内面
 * o = { x, z }  店内本地坐标
 * ============================================================ */
(function () {
  'use strict';

  M.backDoor = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const bodyM = MTL.toon(0xd8d8d8);
    const steelM = MTL.metal(0x8a8f96, 0.4);
    const glassM = MTL.glass(0xd9edf5, 0.2);

    /* 门叶 */
    g.add(S.box(0.05, 1.88, 0.98, bodyM, 0, 0.99, 0));
    g.add(S.box(0.02, 0.3, 0.03, steelM, -0.035, 0.99, -0.4));
    /* 吊轨 + 吊件 */
    g.add(S.box(0.04, 0.04, 1.24, steelM, 0.03, 2.0, 0));
    g.add(S.box(0.05, 0.06, 0.05, steelM, 0.03, 1.95, -0.35));
    g.add(S.box(0.05, 0.06, 0.05, steelM, 0.03, 1.95, 0.35));
    /* 上亮窗（磨砂玻璃） */
    g.add(S.box(0.05, 0.5, 1.0, bodyM, 0.01, 2.32, 0));
    g.add(S.plane(0.92, 0.4, glassM, -0.025, 2.32, 0, { ry: -Math.PI / 2, cast: false }));
    /* 「従業員」牌 */
    const signM = MTL.toon(0xffffff, {
      map: T.label('従業員', { w: 256, h: 128, bg: '#f2ead8', fg: '#3a3a40', size: 72, border: true, bc: '#8a5a3a' }),
      emissive: 0x3a2a1a, ei: 0.15
    });
    g.add(S.plane(0.34, 0.17, signM, -0.032, 1.35, -0.1, { ry: -Math.PI / 2, cast: false }));

    MTL.outlineAdd(g, 0.014);
    g.position.set(o.x !== undefined ? o.x : 5.79, 0, o.z !== undefined ? o.z : -3.0);
    return g;
  };
})();