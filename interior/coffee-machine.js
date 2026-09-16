/* ============================================================
 * coffee-machine.js — 自动咖啡机（机身 + 三出口 + 杯塔 + COFFEE 牌）
 * 导出 M.coffeeMachine(o)  靠东墙，朝向 -x
 * o = { x, z }  店内本地坐标
 * ============================================================ */
(function () {
  'use strict';

  M.coffeeMachine = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const bodyM = MTL.toon(0xe8e8e2);
    const greenM = MTL.toon(0x1f8a4d);
    const boardM = MTL.toon(0xd8d8dc);
    const darkM = MTL.toon(0x5a3a26);
    const steelM = MTL.metal(0x9aa0a6, 0.35);
    const cupM = MTL.plastic(0xf5f2ea);

    /* 台面基座 + 绿条 + 台面 */
    g.add(S.box(0.55, 0.5, 0.94, bodyM, 0, 0.25, 0));
    g.add(S.box(0.02, 0.09, 0.94, greenM, -0.275, 0.42, 0));
    g.add(S.box(0.59, 0.04, 0.98, boardM, 0, 0.52, 0));

    /* 机身（深棕）+ 前面板 */
    g.add(S.box(0.3, 0.72, 0.42, darkM, 0.05, 0.9, 0));
    const panelM = MTL.toon(0xffffff, { map: T.cupBand('#5a3a26', 3) });
    g.add(S.plane(0.4, 0.5, panelM, -0.105, 0.88, 0, { ry: -Math.PI / 2, cast: false }));

    /* 三出口 + 滴水盘 + 两只纸杯 */
    [-0.11, 0, 0.11].forEach(function (dz) {
      g.add(S.cyl(0.015, 0.02, 0.06, steelM, -0.135, 1.18, dz, { rz: Math.PI / 2 }));
    });
    g.add(S.box(0.16, 0.02, 0.5, steelM, -0.16, 0.55, 0));
    g.add(S.cyl(0.028, 0.022, 0.06, cupM, -0.16, 0.595, -0.08));
    g.add(S.cyl(0.028, 0.022, 0.06, cupM, -0.16, 0.595, 0.08));

    /* 杯塔（5 + 3） */
    for (let i = 0; i < 5; i++) {
      g.add(S.cyl(0.03, 0.024, 0.055, cupM, 0.19, 0.575 + i * 0.055, 0.28));
    }
    for (let i = 0; i < 3; i++) {
      g.add(S.cyl(0.03, 0.024, 0.055, cupM, 0.19, 0.575 + i * 0.055, -0.28));
    }

    /* COFFEE 挂牌 */
    const signM = MTL.toon(0xffffff, {
      map: T.label('COFFEE', { w: 256, h: 128, bg: '#5a3a26', fg: '#f2e8d8', size: 64, border: false }),
      emissive: 0x3a2a1a, ei: 0.2
    });
    g.add(S.plane(0.4, 0.2, signM, -0.3, 1.5, 0, { ry: -Math.PI / 2, cast: false }));

    MTL.outlineAdd(g, 0.014);
    g.position.set(o.x !== undefined ? o.x : 5.38, 0, o.z !== undefined ? o.z : -0.7);
    return g;
  };
})();