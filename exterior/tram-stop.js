/* ============================================================
 * tram-stop.js — 电车候车亭
 * 导出 M.tramStop(o)
 * o = { x, z, y, ry }  y = 站台面高度（默认 0.18，street.js 站台顶）
 * 本地：亭中心为原点，y=0 为所立地面，正面 +z（朝轨道）
 * 默认世界位 (-0.05, 0.18, 3.4)，对齐电车中门 (world x≈-0.05)
 * ============================================================ */
(function () {
  'use strict';

  M.tramStop = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const postM = MTL.metal(0x3e4a44, 0.6);
    const steelM = MTL.metal(0x3a3f45, 0.5);
    const woodM = MTL.toon(0xc09a6a);
    const woodDark = MTL.toon(0xa8845a);
    const roofM = MTL.toon(0x3d5245);
    const rimM = MTL.toon(0x2e3b34);

    /* ---------- 立柱（2 根，前缘 z+0.55） ---------- */
    [-1.0, 1.0].forEach(function (x) {
      g.add(S.cyl(0.09, 0.1, 0.05, steelM, x, 0.025, 0.55, { cast: false }));
      g.add(S.cyl(0.045, 0.045, 2.45, postM, x, 1.275, 0.55));
      g.add(S.cyl(0.055, 0.055, 0.05, postM, x, 2.5, 0.55, { cast: false }));
    });

    /* ---------- 顶棚（前缘微抬，雨水落向轨道侧） ---------- */
    const roof = S.box(2.7, 0.08, 1.7, roofM, 0, 2.55, 0.25, { rx: -0.055 });
    g.add(roof); MTL.outlineAdd(roof, 0.015);
    g.add(S.box(2.78, 0.045, 1.78, rimM, 0, 2.485, 0.25, { rx: -0.055, cast: false }));
    /* 斜撑 */
    [-1.0, 1.0].forEach(function (x) {
      g.add(S.cyl(0.02, 0.02, 1.0, steelM, x, 2.31, 0.06, { rx: -1.34, cast: false }));
    });
    /* 顶棚下小灯 */
    g.add(S.cyl(0.09, 0.09, 0.035, MTL.emissive(0xffe9c0, 0.9), 0, 2.42, 0.25, { cast: false }));

    /* ---------- 长椅（木条座面 + 钢架 + 靠背） ---------- */
    for (let i = 0; i < 4; i++) {
      const z = 0.03 + i * 0.105;
      g.add(S.box(1.7, 0.035, 0.085, woodM, 0, 0.44, z, { cast: false }));
    }
    [-0.75, 0, 0.75].forEach(function (x) {
      g.add(S.box(0.04, 0.42, 0.42, steelM, x, 0.21, 0.165));
    });
    /* 靠背 */
    [-0.7, 0.7].forEach(function (x) {
      g.add(S.box(0.03, 0.3, 0.03, steelM, x, 0.68, 0.36, { cast: false }));
    });
    g.add(S.box(1.5, 0.045, 0.04, woodDark, 0, 0.82, 0.36, { cast: false }));

    /* ---------- 时刻表（左柱，朝 -z 迎候客） ---------- */
    const ttM = MTL.basic(0xffffff, { map: T.timetable() });
    g.add(S.box(0.46, 0.56, 0.03, rimM, -1.0, 1.55, 0.44, { cast: false }));
    g.add(S.plane(0.42, 0.52, ttM, -1.0, 1.55, 0.42, { ry: Math.PI, cast: false }));

    /* ---------- 站名牌（右柱，朝 -z） ---------- */
    const signM = MTL.basic(0xffffff, { map: T.streetSign('緑町', 'MIDORICHO') });
    g.add(S.box(0.94, 0.27, 0.03, rimM, 1.0, 2.05, 0.44, { cast: false }));
    g.add(S.plane(0.88, 0.22, signM, 1.0, 2.05, 0.42, { ry: Math.PI, cast: false }));

    g.position.set(o.x !== undefined ? o.x : -0.05, o.y !== undefined ? o.y : 0.18, o.z !== undefined ? o.z : 3.4);
    if (o.ry) g.rotation.y = o.ry;
    return g;
  };
})();