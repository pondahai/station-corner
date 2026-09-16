/* ============================================================
 * trash-bins.js — 站前垃圾桶
 * 导出 M.trashBin(o)
 * o = { x, z, y, ry, color }  y 为地面高（平台 0.18 时传 0.18）
 * ============================================================ */
(function () {
  'use strict';

  M.trashBin = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const bodyM = MTL.toon(o.color !== undefined ? o.color : 0x4a6b4f);
    const darkM = MTL.toon(0x3a3f45);
    const labelM = MTL.basic(0xffffff, { map: T.label('ゴミ', { w: 128, h: 128, bg: 'transparent', fg: '#f2f0e8', size: 72, border: false }), alpha: 1 });

    g.add(S.cyl(0.16, 0.165, 0.05, darkM, 0, 0.025, 0));                 /* 底座 */
    g.add(S.cyl(0.135, 0.155, 0.52, bodyM, 0, 0.31, 0));                 /* 桶身 */
    g.add(S.cyl(0.152, 0.156, 0.06, darkM, 0, 0.085, 0));                /* 底环 */
    g.add(S.cyl(0.145, 0.14, 0.05, bodyM, 0, 0.595, 0));                 /* 桶口 */
    g.add(S.sph(0.035, darkM, 0, 0.625, 0, { cast: false }));            /* 顶钮 */
    for (let i = 0; i < 8; i++) {                                       /* 穿孔带 */
      const a = i * Math.PI / 4;
      g.add(S.box(0.024, 0.024, 0.024, darkM, Math.sin(a) * 0.142, 0.545, Math.cos(a) * 0.142, { cast: false }));
    }
    g.add(S.plane(0.11, 0.11, labelM, 0, 0.36, 0.145, { cast: false }));

    g.position.set(o.x !== undefined ? o.x : 0, o.y || 0, o.z !== undefined ? o.z : 0);
    if (o.ry) g.rotation.y = o.ry;
    return g;
  };
})();