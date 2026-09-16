/* ============================================================
 * flower-pot.js — 店门口花盆
 * 导出 M.flowerPot(o)
 * o = { x, z, y, ry, color }  color 为花色（默认粉）
 * ============================================================ */
(function () {
  'use strict';

  M.flowerPot = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const potM = MTL.toon(0x9c6b50);
    const leafM = MTL.toon(0x5d8a52);
    const leafM2 = MTL.toon(0x527d4a);
    const soilM = MTL.toon(0x3d2f26);
    const flowerM = MTL.toon(o.color !== undefined ? o.color : 0xe8a0b0);

    g.add(S.cyl(0.14, 0.1, 0.16, potM, 0, 0.08, 0));
    g.add(S.cyl(0.148, 0.148, 0.03, potM, 0, 0.165, 0));
    g.add(S.cyl(0.128, 0.128, 0.02, soilM, 0, 0.175, 0, { cast: false }));
    g.add(S.sph(0.07, leafM, 0.03, 0.235, 0.02, { cast: false }));
    g.add(S.sph(0.06, leafM2, -0.04, 0.245, -0.02, { cast: false }));
    g.add(S.sph(0.055, leafM, 0.01, 0.225, -0.05, { cast: false }));
    [[0.05, 0.28, 0.03], [-0.035, 0.3, 0.01], [0.01, 0.27, -0.05], [-0.05, 0.26, -0.025], [0.035, 0.315, -0.005]].forEach(function (p) {
      g.add(S.sph(0.021, flowerM, p[0], p[1], p[2], { cast: false }));
    });

    g.position.set(o.x !== undefined ? o.x : 0, o.y || 0, o.z !== undefined ? o.z : 0);
    if (o.ry) g.rotation.y = o.ry;
    return g;
  };
})();