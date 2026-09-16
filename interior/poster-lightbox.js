/* ============================================================
 * poster-lightbox.js — 灯箱海报（两张发光海报 + 呼吸微亮）
 * 导出 M.posterLightbox(o)  独立式，靠东墙，朝向 -x
 * o = { x, z }  店内本地坐标
 * ============================================================ */
(function () {
  'use strict';

  M.posterLightbox = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const frameM = MTL.toon(0xcfd3d6);
    const darkM = MTL.toon(0x2a2f35);
    const pM1 = MTL.toon(0xffffff, { map: T.poster('food', 3), emissive: 0xfff2d8, ei: 0.85 });
    S.addBreathe({ mat: pM1, amp: 0.12, speed: 0.5, phase: 0 });
    const pM2 = MTL.toon(0xffffff, { map: T.poster('drink', 8), emissive: 0xfff2d8, ei: 0.85 });
    S.addBreathe({ mat: pM2, amp: 0.12, speed: 0.5, phase: 1.7 });

    /* 底座 + 背板 + 顶盖 */
    g.add(S.box(0.5, 0.08, 1.0, frameM, 0, 0.04, 0));
    g.add(S.box(0.04, 1.9, 1.0, MTL.toon(0xe8e8e2), 0.12, 1.03, 0));
    g.add(S.box(0.5, 0.06, 1.0, frameM, 0, 2.01, 0));

    /* 两张海报（深框 + 发光面） */
    [1.35, 0.62].forEach(function (py, i) {
      g.add(S.box(0.02, 0.7, 0.52, darkM, -0.12, py, 0));
      const pm = i === 0 ? pM1 : pM2;
      g.add(S.plane(0.46, 0.64, pm, -0.125, py, 0, { ry: -Math.PI / 2, cast: false }));
    });

    MTL.outlineAdd(g, 0.014);
    g.position.set(o.x !== undefined ? o.x : 5.3, 0, o.z !== undefined ? o.z : 2.9);
    return g;
  };
})();