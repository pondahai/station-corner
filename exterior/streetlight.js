/* ============================================================
 * streetlight.js — 铸铁路灯
 * 导出 M.streetlight(o)
 * o = { x, z, ry }
 * 本地：地面 y=0，灯臂朝 +x，整体高约 4.6
 * 白天场景，灯不点亮
 * ============================================================ */
(function () {
  'use strict';

  M.streetlight = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const ironM = MTL.metal(0x2f3438, 0.55);
    const ironDark = MTL.metal(0x262a2e, 0.5);
    const glassM = MTL.glass(0xf5ead2, 0.5);
    const bulbM = MTL.toon(0xffe9c8, { emissive: 0xffd9a0, ei: 0.18 });

    /* ---------- 底座 ---------- */
    g.add(S.box(0.42, 0.06, 0.42, ironDark, 0, 0.03, 0, { cast: false }));
    g.add(S.cyl(0.13, 0.19, 0.45, ironM, 0, 0.285, 0));
    g.add(S.cyl(0.14, 0.14, 0.05, ironDark, 0, 0.5, 0, { cast: false }));

    /* ---------- 立杆 ---------- */
    g.add(S.cyl(0.055, 0.08, 4.05, ironM, 0, 2.525, 0));
    g.add(S.cyl(0.075, 0.075, 0.06, ironDark, 0, 2.2, 0, { cast: false }));
    g.add(S.cyl(0.08, 0.08, 0.07, ironDark, 0, 4.585, 0, { cast: false }));

    /* ---------- 弯臂 ---------- */
    const pts = [
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(0.45, 0.14, 0),
      new THREE.Vector3(0.9, 0.1, 0)
    ];
    g.add(S.taperTube(pts, 0.05, 0.035, ironM, 0, 4.5, 0));

    /* ---------- 灯头 ---------- */
    g.add(S.cyl(0.02, 0.02, 0.1, ironDark, 0.9, 4.55, 0, { cast: false }));
    g.add(S.cyl(0.07, 0.07, 0.05, ironM, 0.9, 4.49, 0, { cast: false }));
    const glass = S.cyl(0.115, 0.15, 0.2, glassM, 0.9, 4.38, 0, { cast: false });
    g.add(glass);
    g.add(S.sph(0.045, bulbM, 0.9, 4.38, 0, { cast: false }));
    g.add(S.cyl(0.012, 0.155, 0.08, ironM, 0.9, 4.51, 0));
    g.add(S.sph(0.025, ironDark, 0.9, 4.565, 0, { cast: false }));
    MTL.outlineAdd(glass, 0.01);

    g.position.set(o.x !== undefined ? o.x : 0, 0, o.z !== undefined ? o.z : 0);
    if (o.ry) g.rotation.y = o.ry;
    return g;
  };
})();