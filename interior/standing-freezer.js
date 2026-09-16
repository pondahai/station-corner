/* ============================================================
 * standing-freezer.js — 立式冷冻柜（白色单门 + 冰品五层）
 * 导出 M.standingFreezer(o)  背板贴后墙内面
 * o = { x, z }  店内本地坐标
 * ============================================================ */
(function () {
  'use strict';

  M.standingFreezer = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const whiteM = MTL.toon(0xe4e8ec);
    const steelM = MTL.metal(0x8a8f96, 0.4);
    const boardM = MTL.toon(0xdfe4e8);
    const glassM = MTL.glass(0xdcf0f6, 0.2);
    S.addGlass({ mat: glassM, amp: 0.18, speed: 0.5, phase: 2.6 });
    const ledM = MTL.toon(0xf2f8ff, { emissive: 0xcfeaff, ei: 1.6 });
    S.addBreathe({ mat: ledM, amp: 0.2, speed: 0.5, phase: 1.9 });

    /* 白色外壳 */
    g.add(S.box(0.94, 0.14, 0.6, steelM, 0, 0.07, 0));
    g.add(S.box(0.9, 0.04, 0.6, whiteM, 0, 0.16, 0));
    g.add(S.box(0.04, 1.9, 0.6, whiteM, -0.43, 1.09, 0));
    g.add(S.box(0.04, 1.9, 0.6, whiteM, 0.43, 1.09, 0));
    g.add(S.box(0.9, 0.04, 0.6, whiteM, 0, 2.06, 0));
    g.add(S.box(0.9, 1.9, 0.04, whiteM, 0, 1.09, -0.28));
    /* 门框（四面，中央留空给玻璃） */
    g.add(S.box(0.86, 0.06, 0.04, whiteM, 0, 1.99, 0.28));
    g.add(S.box(0.86, 0.06, 0.04, whiteM, 0, 0.19, 0.28));
    g.add(S.box(0.06, 1.76, 0.04, whiteM, -0.4, 1.09, 0.28));
    g.add(S.box(0.06, 1.76, 0.04, whiteM, 0.4, 1.09, 0.28));

    /* 层板 ×5 + 冰品 */
    const tops = [0.28, 0.62, 0.96, 1.3, 1.64];
    const kinds = ['cup', 'tube', 'box', 'carton', 'tube'];
    tops.forEach(function (ty, i) {
      g.add(S.box(0.8, 0.025, 0.46, boardM, 0, ty - 0.0125, 0));
      PRD.fillShelf({ parent: g, kind: kinds[i], x0: -0.34, x1: 0.34, z: 0.02, y: ty, rows: 1, seed: 400 + i * 7 });
    });

    /* 蓝色 LED + 玻璃门 + 把手 */
    g.add(S.box(0.78, 0.03, 0.04, ledM, 0, 1.92, 0.02, { cast: false }));
    g.add(S.plane(0.72, 1.74, glassM, 0, 1.09, 0.295, { cast: false }));
    g.add(S.box(0.025, 0.5, 0.025, steelM, -0.34, 1.0, 0.315));

    const signM = MTL.toon(0xffffff, {
      map: T.label('ICE', { w: 256, h: 128, bg: '#4a90c8', fg: '#f5f2e8', size: 64, border: false }),
      emissive: 0x4a90c8, ei: 0.25
    });
    g.add(S.plane(0.34, 0.14, signM, 0, 2.16, 0.06, { cast: false }));

    MTL.outlineAdd(g, 0.016);
    g.position.set(o.x !== undefined ? o.x : -2.85, 0, o.z !== undefined ? o.z : -3.28);
    return g;
  };
})();