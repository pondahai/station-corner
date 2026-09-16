/* ============================================================
 * traffic-light.js — 信号灯
 * 导出 M.trafficLight(o)  车行信号（竖直三色，红上绿下，日系）
 * 导出 M.pedSignal(o)     人行信号（红灯掌 / 绿灯小人位）
 * o = { x, z, ry }  正面朝 +z
 * ============================================================ */
(function () {
  'use strict';

  M.trafficLight = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const poleM = MTL.metal(0x3c4147, 0.5);
    const headM = MTL.toon(0x1d1f24);
    const faceM = MTL.toon(0x111318);
    const redM = MTL.glass(0xa0342b, 0.9);
    const yelM = MTL.glass(0xc08a2e, 0.9);
    const grnM = MTL.glass(0x2f8a4c, 0.9);

    /* 立杆 */
    g.add(S.cyl(0.15, 0.18, 0.22, poleM, 0, 0.11, 0, { cast: false }));
    g.add(S.cyl(0.05, 0.062, 3.3, poleM, 0, 1.78, 0));
    /* 信号头 */
    const head = S.box(0.44, 1.02, 0.2, headM, 0, 3.85, 0);
    g.add(head); MTL.outlineAdd(head, 0.012);
    g.add(S.box(0.38, 0.94, 0.025, faceM, 0, 3.85, 0.095, { cast: false }));
    g.add(S.box(0.5, 0.05, 0.24, headM, 0, 4.39, 0, { cast: false }));
    /* 三灯（红上 / 黄中 / 绿下） */
    [[3.55, redM], [3.85, yelM], [4.15, grnM]].forEach(function (it) {
      g.add(S.cyl(0.09, 0.09, 0.04, it[1], 0, it[0], 0.1, { rx: Math.PI / 2, cast: false }));
      g.add(S.cyl(0.1, 0.1, 0.13, headM, 0, it[0] + 0.1, 0.08, { rx: 1.92, cast: false }));
    });
    /* 挂臂 */
    g.add(S.cyl(0.04, 0.04, 0.2, poleM, 0, 3.36, 0, { cast: false }));

    g.position.set(o.x !== undefined ? o.x : 0, 0, o.z !== undefined ? o.z : 0);
    if (o.ry) g.rotation.y = o.ry;
    return g;
  };

  M.pedSignal = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const poleM = MTL.metal(0x3c4147, 0.5);
    const headM = MTL.toon(0x1d1f24);
    const redM = MTL.toon(0xc04038, { emissive: 0xff5040, ei: 0.55 });
    const grnM = MTL.glass(0x2f8a4c, 0.9);

    g.add(S.box(0.26, 0.05, 0.26, poleM, 0, 0.025, 0, { cast: false }));
    g.add(S.cyl(0.035, 0.045, 1.85, poleM, 0, 0.95, 0));
    const head = S.box(0.28, 0.34, 0.13, headM, 0, 2.0, 0);
    g.add(head); MTL.outlineAdd(head, 0.01);
    g.add(S.box(0.32, 0.04, 0.16, headM, 0, 2.19, 0, { cast: false }));
    /* 红灯掌（上，亮）/ 绿灯（下，灭） */
    g.add(S.cyl(0.075, 0.075, 0.03, redM, 0, 2.09, 0.06, { rx: Math.PI / 2, cast: false }));
    g.add(S.cyl(0.075, 0.075, 0.03, grnM, 0, 1.9, 0.06, { rx: Math.PI / 2, cast: false }));

    g.position.set(o.x !== undefined ? o.x : 0, 0, o.z !== undefined ? o.z : 0);
    if (o.ry) g.rotation.y = o.ry;
    return g;
  };
})();