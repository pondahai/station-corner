/* ============================================================
 * snacks.js — 零食区（西墙层架 + 吊挂零食 + 盒装）
 * 导出 M.snacks(o)  靠西墙（内面 x=-5.82），长边沿 z，朝向 +x
 * o = { x, z, len }  店内本地坐标（背板贴墙，组心在地面）
 * ============================================================ */
(function () {
  'use strict';

  M.snacks = function (o) {
    o = o || {};
    const g = new THREE.Group();
    const LEN = o.len !== undefined ? o.len : 3.4;

    const steelM = MTL.toon(0x6a6f76);
    const whiteM = MTL.toon(0xf2f2ec);
    const boardM = MTL.toon(0xd8d8dc);

    /* 背板贴西墙内面（本地 x≈0） */
    g.add(S.box(0.025, 2.08, LEN + 0.04, whiteM, 0.01, 1.06, 0));
    /* 立柱 */
    for (const pz of [-LEN / 2 + 0.04, LEN / 2 - 0.04]) {
      g.add(S.box(0.04, 2.1, 0.04, steelM, 0.05, 1.07, pz));
      g.add(S.box(0.04, 2.1, 0.04, steelM, 0.41, 1.07, pz));
    }
    /* 顶部横梁 */
    g.add(S.box(0.42, 0.05, LEN - 0.06, steelM, 0.22, 2.08, 0));

    /* 层板 ×5（面宽 0.42）+ 价签条 */
    const tops = [0.24, 0.66, 1.08, 1.5, 1.92];
    tops.forEach(function (ty, i) {
      g.add(S.box(0.42, 0.03, LEN - 0.04, boardM, 0.21, ty - 0.015, 0));
      const stripM = MTL.toon(0xffffff, { map: T.priceTagStrip(40 + i) });
      g.add(S.box(0.012, 0.026, LEN - 0.06, stripM, 0.418, ty + 0.013, 0, { cast: false }));
    });

    /* 商品填充：局部 x 铺展，Ry(+90°) 后沿 z 铺展且朝向 +x */
    function fillZ(kind, ty, seed) {
      const g2 = new THREE.Group();
      g2.rotation.y = Math.PI / 2;
      PRD.fillShelf({
        parent: g2, kind: kind,
        x0: -(LEN - 0.3) / 2, x1: (LEN - 0.3) / 2,
        z: 0, y: 0, rows: 2, rowGap: 0.075, seed: seed
      });
      g2.position.set(0.2, ty, 0);
      g.add(g2);
    }
    fillZ('box', 0.24, 41);
    fillZ('pack', 0.66, 42);
    fillZ('box', 1.08, 43);
    fillZ('can', 1.5, 44);
    fillZ('carton', 1.92, 45);

    /* 吊挂零食（顶排挂条） */
    const bar = S.cyl(0.012, 0.012, LEN - 0.5, steelM, 0.28, 1.74, 0, { rx: Math.PI / 2 });
    g.add(bar);
    const pal = [0xe8b83a, 0xd85a3a, 0x5ab8a8, 0xc84a6a, 0x8a6ac8, 0x5a9ac8];
    for (let i = 0; i < 8; i++) {
      const pz = -(LEN - 1.0) / 2 + i * (LEN - 1.0) / 7;
      g.add(S.cyl(0.004, 0.004, 0.05, steelM, 0.28, 1.705, pz, { cast: false }));
      const pm = S.box(0.05, 0.15, 0.045, MTL.toon(pal[i % 6]), 0.28, 1.57, pz, { ry: (i % 2 ? 1 : -1) * 0.09 });
      g.add(pm);
    }
    /* 区名吊牌 */
    g.add(S.plane(0.34, 0.14, MTL.toon(0xffffff, {
      map: T.label('スナック', { w: 256, h: 128, bg: '#e8b83a', fg: '#3a3320', size: 64, border: false }),
      emissive: 0xe8b83a, ei: 0.25
    }), 0.43, 2.16, 0.9, { ry: Math.PI / 2, cast: false }));

    MTL.outlineAdd(g, 0.016);
    g.position.set(o.x !== undefined ? o.x : -5.8, 0, o.z !== undefined ? o.z : -0.35);
    return g;
  };
})();