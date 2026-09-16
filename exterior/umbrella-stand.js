/* ============================================================
 * umbrella-stand.js — 店门口雨棚伞架
 * 导出 M.umbrellaStand(o)
 * o = { x, z, ry }  地面 y=0（店门前坪地）
 * 顶棚朝 +z 外挑，宽 0.9
 * ============================================================ */
(function () {
  'use strict';

  M.umbrellaStand = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const metalM = MTL.metal(0x5a5e64, 0.5);
    const clothM = MTL.toon(0xf3ead8);
    const redM = MTL.toon(0xc05a4a);

    /* 底座 + 立柱 */
    g.add(S.box(0.4, 0.07, 0.3, metalM, 0, 0.035, 0, { cast: false }));
    g.add(S.cyl(0.025, 0.03, 1.0, metalM, 0, 0.57, 0));
    /* 侧撑 */
    g.add(S.cyl(0.015, 0.015, 0.5, metalM, 0, 1.0, -0.18, { rx: 0.85, cast: false }));

    /* 顶棚（朝 +z 微坡） */
    const top = S.box(0.92, 0.035, 0.52, clothM, 0, 1.16, 0.16, { rx: 0.1 });
    g.add(top); MTL.outlineAdd(top, 0.01);
    /* 前缘红色垂边（波浪形） */
    g.add(S.box(0.92, 0.09, 0.03, redM, 0, 1.09, 0.42, { cast: false }));
    for (let i = 0; i < 8; i++) {
      g.add(S.cyl(0.0575, 0.0575, 0.032, redM, -0.46 + i * 0.115, 1.045, 0.42, { ry: -Math.PI / 2, rz: -Math.PI / 2, tl: Math.PI, open: true, cast: false }));
    }
    /* 侧缘 */
    g.add(S.box(0.03, 0.09, 0.36, redM, -0.445, 1.1, 0.2, { cast: false }));
    g.add(S.box(0.03, 0.09, 0.36, redM, 0.445, 1.1, 0.2, { cast: false }));
    /* 前缘斜撑（立柱 → 棚底） */
    g.add(S.cyl(0.012, 0.012, 0.3, metalM, 0, 1.035, 0.125, { rx: 0.972, cast: false }));

    g.position.set(o.x !== undefined ? o.x : 0, 0, o.z !== undefined ? o.z : 0);
    if (o.ry) g.rotation.y = o.ry;
    return g;
  };
})();