/* ============================================================
 * magazine-rack.js — 杂志架（背板 + 三斜槽 + 九本杂志）
 * 导出 M.magazineRack(o)  靠东墙，朝向 -x
 * o = { x, z }  店内本地坐标
 * ============================================================ */
(function () {
  'use strict';

  M.magazineRack = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const bodyM = MTL.toon(0xe8e8e2);
    const steelM = MTL.metal(0x8a8f96, 0.4);
    const boardM = MTL.toon(0xcfd3d6);
    const pal = [0xd86a5a, 0x5a8ad8, 0x5ab88a, 0xd8a84c, 0x9a6ad8, 0xd87ab0];

    /* 背板 + 侧柱 */
    g.add(S.box(0.03, 1.9, 0.94, bodyM, 0.18, 1.0, 0));
    g.add(S.box(0.04, 1.9, 0.04, steelM, 0.16, 1.0, -0.45));
    g.add(S.box(0.04, 1.9, 0.04, steelM, 0.16, 1.0, 0.45));
    g.add(S.box(0.36, 0.04, 0.94, steelM, 0, 1.94, 0));

    /* 斜槽 ×3 + 杂志（每槽 3 本） */
    const tops = [1.0, 1.35, 1.7];
    tops.forEach(function (ty, row) {
      g.add(S.box(0.3, 0.02, 0.86, boardM, 0, ty, 0, { rz: 0.3 }));
      [-0.14, 0, 0.14].forEach(function (dz, col) {
        const i = row * 3 + col;
        const mag = new THREE.Group();
        mag.add(S.box(0.02, 0.19, 0.13, MTL.toon(pal[i % 6]), 0, 0, 0));
        const coverM = MTL.toon(0xffffff, { map: T.magazine(7, i) });
        mag.add(S.plane(0.126, 0.186, coverM, -0.012, 0, 0, { ry: -Math.PI / 2, cast: false }));
        mag.rotation.z = 0.3;
        mag.position.set(-0.05, ty + 0.095, dz + (col === 1 ? 0.05 : 0));
        g.add(mag);
      });
    });

    /* 「雑誌」牌 */
    const signM = MTL.toon(0xffffff, {
      map: T.label('雑誌', { w: 256, h: 128, bg: '#4a4a52', fg: '#f0ede2', size: 64, border: false }),
      emissive: 0x3a3a44, ei: 0.2
    });
    g.add(S.plane(0.3, 0.14, signM, -0.2, 2.02, 0, { ry: -Math.PI / 2, cast: false }));

    MTL.outlineAdd(g, 0.014);
    g.position.set(o.x !== undefined ? o.x : 5.62, 0, o.z !== undefined ? o.z : 1.5);
    return g;
  };
})();