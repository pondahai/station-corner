/* ============================================================
 * bicycle.js — 通勤自行车（前车篮 + 挡泥板 + 脚撑）
 * 导出 M.bicycle(o)
 * o = { x, z, ry, color }  车头朝 +x，轮径 0.6
 * ============================================================ */
(function () {
  'use strict';

  M.bicycle = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const tireM = MTL.toon(0x26282c);
    const rimM = MTL.metal(0x9aa0a6, 0.35);
    const frameM = MTL.toon(o.color !== undefined ? o.color : 0x33475e);
    const fenderM = MTL.toon(0x3a3f45);
    const blackM = MTL.toon(0x1c1e22);
    const basketM = MTL.basic(0xffffff, { map: T.basket() });

    function wheel(cx) {
      const w = new THREE.Group();
      w.add(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 10, 32), tireM));
      w.add(new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.006, 8, 32), rimM));
      const hub = S.cyl(0.02, 0.02, 0.035, rimM, 0, 0, 0, { rx: Math.PI / 2, cast: false });
      w.add(hub);
      for (let i = 0; i < 12; i++) {
        const sp = S.box(0.005, 0.26, 0.005, rimM, 0, 0.13, 0, { rz: i * Math.PI / 6, cast: false });
        w.add(sp);
      }
      w.position.set(cx, 0.3, 0);
      return w;
    }
    g.add(wheel(0.5));
    g.add(wheel(-0.5));

    /* ---------- 车架 ---------- */
    const B = S.box;
    g.add(B(0.016, 0.38, 0.016, frameM, -0.065, 0.48, 0, { rz: 0.38 }));           /* 座管 */
    g.add(B(0.016, 0.46, 0.016, frameM, 0.175, 0.47, 0, { rz: -0.86 }));          /* 下管 */
    g.add(B(0.48, 0.018, 0.018, frameM, 0.11, 0.63, 0, { rz: -0.05 }));           /* 上管 */
    g.add(B(0.5, 0.018, 0.018, frameM, -0.25, 0.32, 0.012, { rz: 0.08 }));        /* 后下叉（左右两条） */
    g.add(B(0.5, 0.018, 0.018, frameM, -0.25, 0.32, -0.012, { rz: 0.08 }));
    g.add(B(0.016, 0.455, 0.016, frameM, -0.32, 0.44, 0.012, { rz: -0.915 }));    /* 后上叉 */
    g.add(B(0.016, 0.455, 0.016, frameM, -0.32, 0.44, -0.012, { rz: -0.915 }));

    /* ---------- 前叉 + 车把 ---------- */
    g.add(B(0.016, 0.355, 0.016, frameM, 0.43, 0.44, 0, { rz: -2.7 }));
    g.add(S.cyl(0.014, 0.014, 0.12, frameM, 0.35, 0.62, 0, { cast: false }));
    g.add(S.cyl(0.01, 0.01, 0.44, frameM, 0.33, 0.66, 0, { rx: Math.PI / 2, cast: false }));
    [-0.21, 0.21].forEach(function (z) {
      g.add(S.cyl(0.014, 0.014, 0.08, blackM, 0.33, 0.66, z, { rx: Math.PI / 2, cast: false }));
    });

    /* ---------- 座垫 + 脚踏 ---------- */
    g.add(S.cyl(0.01, 0.01, 0.12, rimM, -0.115, 0.61, 0, { cast: false }));
    g.add(B(0.17, 0.03, 0.06, blackM, -0.13, 0.645, 0, { cast: false }));
    g.add(S.cyl(0.03, 0.03, 0.025, blackM, 0, 0.32, 0, { rx: Math.PI / 2, cast: false }));
    g.add(B(0.015, 0.11, 0.015, blackM, 0.02, 0.27, 0.03, { rz: 0.3, cast: false }));
    g.add(B(0.055, 0.012, 0.035, blackM, 0.045, 0.22, 0.04, { cast: false }));

    /* ---------- 挡泥板（半圆环） ---------- */
    [[0.5], [-0.5]].forEach(function (wx) {
      const f = S.torus(0.315, 0.012, fenderM, wx[0], 0.3, 0, { arc: Math.PI, rseg: 8, tseg: 24 });
      g.add(f);
    });

    /* ---------- 前车篮 ---------- */
    g.add(B(0.24, 0.015, 0.2, basketM, 0.62, 0.66, 0, { cast: false }));
    g.add(B(0.24, 0.14, 0.015, basketM, 0.62, 0.725, 0.0925, { cast: false }));
    g.add(B(0.24, 0.14, 0.015, basketM, 0.62, 0.725, -0.0925, { cast: false }));
    g.add(B(0.24, 0.015, 0.2, basketM, 0.62, 0.795, 0, { cast: false }));
    [0.06, -0.06].forEach(function (z) {
      g.add(B(0.22, 0.014, 0.014, frameM, 0.46, 0.65, z, { rz: 0.1, cast: false }));
    });

    /* ---------- 脚撑 ---------- */
    g.add(B(0.014, 0.26, 0.014, fenderM, -0.4, 0.13, 0.06, { rx: 0.35, rz: -0.25, cast: false }));

    /* 整体微倾（靠脚撑） */
    g.rotation.x = 0.045;
    g.position.set(o.x !== undefined ? o.x : 0, 0, o.z !== undefined ? o.z : 0);
    if (o.ry) g.rotation.y = o.ry;
    return g;
  };
})();