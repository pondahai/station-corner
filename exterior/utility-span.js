/* ============================================================
 * utility-span.js — 架空线门型架 + 承力索/接触线
 * 导出 M.utilitySpan()
 * 钢轨 z=6.45 / 7.75（street.js），接触线跨轨中心 z=7.1
 * 接触线 y≈3.71（tram.js 受电杆滑靴顶 3.70，轻触）
 * 门型架 x = -9.5 / 0 / 9.5，立柱 z=5.9（平台侧）与 z=9.0（路侧）
 * ============================================================ */
(function () {
  'use strict';

  M.utilitySpan = function () {
    const g = new THREE.Group();

    const steelM = MTL.metal(0x6d747c, 0.55);
    const beamM = MTL.toon(0x565c63);
    const wireM = MTL.metal(0xa9aeb4, 0.6);
    const insM = MTL.toon(0x7d6b58);

    const GANTRIES = [-9.5, 0, 9.5];
    const Z_A = 5.9, Z_B = 9.0;
    const ZC = 7.1;

    /* ---------- 门型架 ---------- */
    GANTRIES.forEach(function (gx) {
      [Z_A, Z_B].forEach(function (pz) {
        g.add(S.box(0.22, 0.04, 0.22, beamM, gx, 0.02, pz, { cast: false }));
        g.add(S.box(0.12, 4.24, 0.12, steelM, gx, 2.16, pz));
      });
      const beam = S.box(0.15, 0.17, Z_B - Z_A + 0.15, beamM, gx, 4.29, (Z_A + Z_B) / 2);
      g.add(beam); MTL.outlineAdd(beam, 0.012);
      /* 梁下悬吊绝缘子 → 承力索 */
      [4.185, 4.15].forEach(function (iy) {
        g.add(S.cyl(0.028, 0.028, 0.026, insM, gx, iy, ZC, { cast: false }));
      });
      g.add(S.cyl(0.012, 0.012, 0.06, wireM, gx, 4.1, ZC, { cast: false }));
    });

    /* ---------- 接触线（近直，y≈3.71） ---------- */
    function curveY(ys) {
      const pts = ys.map(function (p) { return new THREE.Vector3(p[0], p[1], ZC); });
      return new THREE.CatmullRomCurve3(pts);
    }
    const contact = curveY([
      [-13.2, 3.752], [-9.5, 3.718], [-4.75, 3.708], [0, 3.718],
      [4.75, 3.708], [9.5, 3.718], [13.2, 3.752]
    ]);
    const contactMesh = new THREE.Mesh(
      new THREE.TubeGeometry(contact, 32, 0.012, 6, false), wireM);
    contactMesh.castShadow = false;
    g.add(contactMesh);

    /* ---------- 承力索（下垂明显，门架处 4.12 / 跨中 4.02） ---------- */
    const messenger = curveY([
      [-13.2, 4.16], [-9.5, 4.12], [-4.75, 4.02], [0, 4.12],
      [4.75, 4.02], [9.5, 4.12], [13.2, 4.16]
    ]);
    const msgMesh = new THREE.Mesh(
      new THREE.TubeGeometry(messenger, 32, 0.014, 6, false), wireM);
    msgMesh.castShadow = false;
    g.add(msgMesh);

    /* ---------- 吊弦（跨中，承力索 → 接触线） ---------- */
    [[-4.75, 4.02, 3.708], [4.75, 4.02, 3.708], [-12.35, 4.148, 3.744], [12.35, 4.148, 3.744]].forEach(function (d) {
      const len = d[1] - d[2];
      g.add(S.cyl(0.008, 0.008, len, wireM, d[0], d[2] + len / 2, ZC, { cast: false }));
    });

    return g;
  };
})();