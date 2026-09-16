/* ============================================================
 * lockers.js — 投币寄物柜（2×3 柜门 + 通风格栅 + 号牌 + 墙牌）
 * 导出 M.lockers(o)  靠东墙，朝向 -x
 * o = { x, z }  店内本地坐标
 * ============================================================ */
(function () {
  'use strict';

  M.lockers = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const bodyM = MTL.toon(0xe8e8e2);
    const greenM = MTL.toon(0x1f8a4d);
    const ventM = MTL.toon(0x0f3a22);
    const steelM = MTL.metal(0x8a8f96, 0.4);

    /* 柜体 + 顶板 */
    g.add(S.box(0.42, 1.5, 1.0, bodyM, 0, 0.75, 0));
    g.add(S.box(0.46, 0.04, 1.04, steelM, 0, 1.52, 0));

    /* 柜门 2×3（门板 + 格栅 + 把手 + 号牌） */
    [0.31, 0.75, 1.19].forEach(function (y) {
      [-0.26, 0.26].forEach(function (z) {
        g.add(S.box(0.025, 0.42, 0.3, greenM, -0.22, y, z));
        for (let k = 0; k < 3; k++) {
          g.add(S.box(0.008, 0.015, 0.16, ventM, -0.237, y + 0.08 + k * 0.035, z, { cast: false }));
        }
        g.add(S.box(0.012, 0.08, 0.02, steelM, -0.242, y, z + 0.12));
        g.add(S.box(0.01, 0.03, 0.05, MTL.toon(0xf2ead8), -0.238, y - 0.14, z - 0.1, { cast: false }));
      });
    });

    /* 「コインロッカー」墙牌 */
    const signM = MTL.toon(0xffffff, {
      map: T.label('コインロッカー', { w: 256, h: 128, bg: '#1f8a4d', fg: '#f5f2e8', size: 52, border: false }),
      emissive: 0x1f8a4d, ei: 0.2
    });
    g.add(S.plane(0.5, 0.18, signM, 0.195, 1.72, 0, { ry: -Math.PI / 2, cast: false }));

    MTL.outlineAdd(g, 0.014);
    g.position.set(o.x !== undefined ? o.x : 5.6, 0, o.z !== undefined ? o.z : 0.35);
    return g;
  };
})();