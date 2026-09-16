/* ============================================================
 * shelves.js — 主货架（钢架 + 层板 + 满陈列商品 + 价签条）
 * 导出 M.shelves(o)  一组双面货架，长边沿 x，中心原点
 * o = { x, z, seed, cap }  坐标为店内本地坐标（组心即店内原点）
 * ============================================================ */
(function () {
  'use strict';

  M.shelves = function (o) {
    o = o || {};
    const g = new THREE.Group();
    const LEN = 4.4, HALF = LEN / 2;

    const steelM = MTL.toon(0x6a6f76);
    const whiteM = MTL.toon(0xf2f2ec);
    const boardM = MTL.toon(0xd8d8dc);
    const greenM = MTL.toon(0x1f8a4d);

    /* 立柱（3 列 × 2 排） */
    for (const px of [-2.14, 0, 2.14]) {
      for (const pz of [-0.4, 0.4]) {
        g.add(S.box(0.045, 2.1, 0.045, steelM, px, 1.07, pz));
      }
    }
    /* 顶部横梁 */
    for (const pz of [-0.4, 0.4]) {
      g.add(S.box(4.36, 0.05, 0.045, steelM, 0, 2.08, pz));
    }
    g.add(S.box(0.045, 0.05, 0.82, steelM, -HALF, 2.08, 0));
    g.add(S.box(0.045, 0.05, 0.82, steelM, HALF, 2.08, 0));
    /* 端板 */
    g.add(S.box(0.03, 2.06, 0.84, whiteM, -HALF - 0.015, 1.05, 0));
    g.add(S.box(0.03, 2.06, 0.84, whiteM, HALF + 0.015, 1.05, 0));
    /* 顶部品牌条 */
    g.add(S.box(4.3, 0.09, 0.06, greenM, 0, 2.14, 0.42, { cast: false }));

    /* 层板 ×5 */
    const tops = [0.24, 0.66, 1.08, 1.5, 1.92];
    tops.forEach(function (ty, i) {
      g.add(S.box(4.36, 0.03, 0.84, boardM, 0, ty - 0.015, 0));
      /* 双面价签条 */
      const stripM = MTL.toon(0xffffff, { map: T.priceTagStrip((o.seed || 1) * 7 + i) });
      g.add(S.box(4.34, 0.026, 0.012, stripM, 0, ty + 0.013, 0.424, { cast: false }));
      g.add(S.box(4.34, 0.026, 0.012, stripM, 0, ty + 0.013, -0.424, { cast: false }));
    });

    /* 商品填充（双面） */
    function fill(kind, ty, zc, seed, extra) {
      PRD.fillShelf(Object.assign({
        parent: g, kind: kind, x0: -2.08, x1: 2.08,
        z: zc, y: ty, rows: 2, rowGap: 0.075, seed: seed
      }, extra || {}));
    }
    fill('box', 0.24, 0.19, (o.seed || 1) * 100 + 1);
    fill('box', 0.24, -0.19, (o.seed || 1) * 100 + 2);
    fill('pack', 0.66, 0.19, (o.seed || 1) * 100 + 3);
    fill('pack', 0.66, -0.19, (o.seed || 1) * 100 + 4);
    fill('can', 1.08, 0.19, (o.seed || 1) * 100 + 5);
    fill('can', 1.08, -0.19, (o.seed || 1) * 100 + 6);
    fill('bottle', 1.5, 0.19, (o.seed || 1) * 100 + 7);
    fill('bottle', 1.5, -0.19, (o.seed || 1) * 100 + 8);
    fill('carton', 1.92, 0.19, (o.seed || 1) * 100 + 9);
    fill('carton', 1.92, -0.19, (o.seed || 1) * 100 + 10);

    /* 端头堆头（金字塔） */
    if (o.cap) {
      const pal = [0xd86a4a, 0x4a86c8, 0x5ab87a, 0xc84a8a, 0xe0a83a, 0x7a5ad8];
      for (const ex of [-HALF - 0.28, HALF + 0.28]) {
        let y = 0.02;
        for (let row = 0; row < 3; row++) {
          const n = 4 - row;
          for (let k = 0; k < n; k++) {
            const bx = ex + (k - (n - 1) / 2) * 0.058;
            const m = S.box(0.052, 0.17, 0.04, MTL.toon(pal[(row * 4 + k) % 6]), bx, y + 0.085, row % 2 ? 0.02 : -0.02, { rz: 0 });
            m.rotation.y = Math.PI / 2;
            y += 0.17;
          }
        }
      }
    }

    MTL.outlineAdd(g, 0.016);
    g.position.set(o.x !== undefined ? o.x : -2.7, 0, o.z !== undefined ? o.z : -0.35);
    return g;
  };
})();