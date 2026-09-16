/* ============================================================
 * building.js — 便利店建筑外壳
 * 导出 M.building()
 * 本地坐标：x -6..6（12m），z -3.75..3.75（7.5m），正面 z=+3.75（南）
 * 世界摆放：组中心 (-3, 0, -2.75) → 正面玻璃 z=1.0，后墙 z=-6.5
 * ============================================================ */
(function () {
  'use strict';

  M.building = function () {
    const g = new THREE.Group();
    const rnd = T.rng(4242);

    /* ---------- 尺寸 ---------- */
    const W = 12, D = 7.5, HW = 6, HD = 3.75;
    const wallH = 3.4, kickH = 0.45, glassTop = 2.95;

    /* ---------- 材质 ---------- */
    const alum = MTL.toon(0xb9bdc2);
    const alumD = MTL.toon(0x83888e);
    const panel = MTL.toon(0xffffff, { map: T.stucco('#e9e5db', 51) });
    const kick = MTL.toon(0x9aa0a6);
    const concrete = MTL.toon(0xffffff, { map: T.concrete('#cfc9ba', 62) });
    const glassM = MTL.glass(0xd9edf5, 0.15);
    const glassDoorM = MTL.glass(0xdcf0f6, 0.2);
    S.addGlass({ mat: glassM, amp: 0.15, speed: 0.45, phase: 0.8 });
    S.addGlass({ mat: glassDoorM, amp: 0.18, speed: 0.6, phase: 2.4 });

    /* ---------- 楼板 ---------- */
    const slab = S.box(W + 0.3, 0.16, D + 0.3, concrete, 0, -0.06, 0);
    g.add(slab);

    /* ---------- 墙体 ---------- */
    const wallB = S.box(W, wallH, 0.18, panel, 0, wallH / 2, -HD + 0.09);
    const wallW = S.box(0.18, wallH, D, panel, -HW + 0.09, wallH / 2, 0);
    const wallE = S.box(0.18, wallH, D, panel, HW - 0.09, wallH / 2, 0);
    g.add(wallB); g.add(wallW); g.add(wallE);
    MTL.outlineAdd(wallB, 0.02); MTL.outlineAdd(wallW, 0.02); MTL.outlineAdd(wallE, 0.02);
    /* 侧墙横向铝饰带（与正面 transom 齐平） */
    g.add(S.box(0.05, 0.1, D - 0.1, alumD, -HW + 0.02, 3.0, 0, { cast: false }));
    g.add(S.box(0.05, 0.1, D - 0.1, alumD, HW - 0.02, 3.0, 0, { cast: false }));

    /* ---------- 正面：玻璃幕墙 ---------- */
    g.add(S.box(W, kickH, 0.18, kick, 0, kickH / 2, HD - 0.09));
    g.add(S.box(W, wallH - glassTop, 0.18, alum, 0, (glassTop + wallH) / 2, HD - 0.09));
    const glassH = glassTop - kickH - 0.04;
    const glassY = (kickH + glassTop) / 2;
    const glassZ = HD - 0.02;
    g.add(S.plane(3.84 - (-5.88), glassH, glassM, (-5.88 + 3.84) / 2, glassY, glassZ));
    g.add(S.plane(5.88 - 5.36, glassH, glassM, (5.36 + 5.88) / 2, glassY, glassZ));
    /* 竖梃 */
    const mullX = [-6, -4.8, -3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.8, 5.4, 6];
    mullX.forEach(function (x) {
      g.add(S.box(0.07, glassTop - kickH, 0.09, alum, x, (kickH + glassTop) / 2, HD - 0.02, { cast: false }));
    });
    g.add(S.box(W, 0.09, 0.07, alum, 0, glassTop - 0.045, HD - 0.02, { cast: false }));
    g.add(S.box(W, 0.09, 0.07, alum, 0, kickH + 0.045, HD - 0.02, { cast: false }));

    /* ---------- 自动门（xL 3.8..5.4） ---------- */
    g.add(S.box(1.6, 0.14, 0.1, alumD, 4.6, glassTop - 0.02, HD - 0.02));
    function doorLeaf(x0, x1) {
      const w = x1 - x0, cx = (x0 + x1) / 2;
      const lg = new THREE.Group();
      lg.add(S.box(w, 2.34, 0.05, alum, 0, 1.35, 0));
      lg.add(S.box(w - 0.14, 2.2, 0.02, glassDoorM, 0, 1.35, 0, { cast: false }));
      /* 推门横杆 */
      lg.add(S.box(0.05, 1.1, 0.05, alumD, 0, 1.25, 0.04));
      lg.position.set(cx, kickH + 0.06, HD - 0.02);
      g.add(lg);
      return lg;
    }
    const leaf1 = doorLeaf(3.84, 4.59);
    const leaf2 = doorLeaf(4.61, 5.36);
    const leafX1 = leaf1.position.x, leafX2 = leaf2.position.x;
    function smooth(a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
    S.addUpdate(function (t) {
      const p = (t * 0.075 + 0.3) % 1;
      const open = smooth(0.06, 0.2, p) - smooth(0.55, 0.7, p);
      leaf1.position.x = leafX1 - open * 0.9;
      leaf2.position.x = leafX2 + open * 0.9;
    });

    /* 门口地垫 + 台阶 */
    g.add(S.planeH(1.15, 0.55, MTL.toon(0xffffff, { map: T.doorMat() }), 4.6, 0.024, 3.3, { cast: false }));
    g.add(S.box(1.75, 0.06, 0.6, MTL.toon(0xb0aa9c), 4.6, 0.03, HD + 0.3));

    /* 雨棚 */
    const awn = S.box(2.1, 0.05, 0.75, MTL.toon(0x2f6a4a), 4.6, 2.56, HD + 0.36);
    g.add(awn); MTL.outlineAdd(awn, 0.018);
    const rodM = MTL.metal(0x7a7e84, 0.4);
    g.add(S.cyl(0.014, 0.014, 0.62, rodM, 3.75, 2.85, HD + 0.62, { rz: 0.6, cast: false }));
    g.add(S.cyl(0.014, 0.014, 0.62, rodM, 5.45, 2.85, HD + 0.62, { rz: -0.6, cast: false }));

    /* ---------- 招牌灯箱 ---------- */
    const fascia = S.box(W - 0.3, 0.6, 0.26, alumD, 0, 3.66, HD + 0.05);
    g.add(fascia); MTL.outlineAdd(fascia, 0.02);
    const signMat = MTL.toon(0xffffff, { map: T.shopSign('コンビニ', '24h'), emissive: 0xfff2d8, ei: 0.6 });
    const signFace = S.plane(W - 0.5, 0.46, signMat, 0, 3.66, HD + 0.185, { cast: false });
    g.add(signFace);
    S.addBreathe({ mat: signMat, amp: 0.18, speed: 0.4, phase: 0.5 });
    /* 侧面竖向 24H 灯箱 */
    const v24 = S.box(0.3, 1.9, 0.3, alumD, HW + 0.05, 3.2, HD - 0.6);
    g.add(v24); MTL.outlineAdd(v24, 0.018);
    const v24m = MTL.toon(0xffffff, { map: T.label('24時間', { w: 128, h: 384, bg: '#f5f2e8', fg: '#1f5a3a', size: 92 }), emissive: 0xfff2d8, ei: 0.5 });
    const v24f1 = S.plane(0.24, 1.76, v24m, HW + 0.2, 3.2, HD - 0.6, { ry: Math.PI / 2, cast: false });
    g.add(v24f1);
    S.addBreathe({ mat: v24m, amp: 0.2, speed: 0.55, phase: 2.0 });

    /* ---------- 屋面 / 女儿墙 ---------- */
    const roof = S.box(W + 0.35, 0.22, D + 0.35, concrete, 0, 3.51, 0);
    g.add(roof); MTL.outlineAdd(roof, 0.02);
    const paraM = panel;
    const pN = S.box(W + 0.35, 0.32, 0.1, paraM, 0, 3.78, -(D + 0.35) / 2 + 0.05);
    const pS = S.box(W + 0.35, 0.32, 0.1, paraM, 0, 3.78, (D + 0.35) / 2 - 0.05);
    const pW = S.box(0.1, 0.32, D + 0.35, paraM, -(W + 0.35) / 2 + 0.05, 3.78, 0);
    const pE = S.box(0.1, 0.32, D + 0.35, paraM, (W + 0.35) / 2 - 0.05, 3.78, 0);
    g.add(pN); g.add(pS); g.add(pW); g.add(pE);
    const capM = alumD;
    g.add(S.box(W + 0.35, 0.04, 0.12, capM, 0, 3.95, -(D + 0.35) / 2 + 0.05, { cast: false }));
    g.add(S.box(W + 0.35, 0.04, 0.12, capM, 0, 3.95, (D + 0.35) / 2 - 0.05, { cast: false }));
    g.add(S.box(0.12, 0.04, D + 0.35, capM, -(W + 0.35) / 2 + 0.05, 3.95, 0, { cast: false }));
    g.add(S.box(0.12, 0.04, D + 0.35, capM, (W + 0.35) / 2 - 0.05, 3.95, 0, { cast: false }));

    /* ---------- 后墙高窗 ---------- */
    g.add(S.box(5.3, 0.9, 0.1, alum, -2, 2.55, -HD + 0.06));
    const backGlass = S.plane(5.1, 0.74, glassM, -2, 2.55, -HD + 0.12);
    backGlass.rotation.y = Math.PI;
    g.add(backGlass);
    [-4.3, -2, 0.3].forEach(function (x) {
      g.add(S.box(0.06, 0.9, 0.05, alum, x, 2.55, -HD + 0.12, { cast: false }));
    });

    /* ---------- 东墙：空调外机 + 后场门 ---------- */
    const ac = S.box(0.95, 0.72, 0.45, MTL.toon(0xffffff, { map: T.louver() }), HW + 0.22, 0.78, -0.3);
    g.add(ac); MTL.outlineAdd(ac, 0.02);
    ac.castShadow = true;
    g.add(S.box(0.9, 0.05, 0.4, MTL.metal(0x8a8d90, 0.5), HW + 0.22, 0.4, -0.3));
    g.add(S.cyl(0.02, 0.02, 0.5, MTL.metal(0x9aa0a4, 0.45), HW + 0.05, 1.5, -0.5, { cast: false }));
    g.add(S.cyl(0.016, 0.016, 0.5, MTL.metal(0x9aa0a4, 0.45), HW + 0.05, 1.5, -0.1, { cast: false }));
    /* 后场门 */
    g.add(S.box(1.0, 1.95, 0.08, alumD, HW - 0.04, 0.97, -3.0));
    const bd = S.box(0.86, 1.84, 0.04, MTL.toon(0xffffff, { map: T.metalBrushed('#a8adb2', 3) }), HW + 0.0, 0.95, -3.0);
    g.add(bd); MTL.outlineAdd(bd, 0.016);
    g.add(S.plane(0.3, 0.36, glassM, HW + 0.025, 1.35, -3.0, { ry: Math.PI / 2, cast: false }));
    g.add(S.plane(0.42, 0.16, MTL.basic(0xffffff, { map: T.label('従業員', { w: 256, h: 100, bg: '#f2efe4', fg: '#4a4a50', size: 54 }) }), HW + 0.025, 0.7, -3.0, { ry: Math.PI / 2, cast: false }));
    g.add(S.cyl(0.02, 0.02, 0.3, MTL.metal(0x6a6e72, 0.4), HW + 0.03, 0.95, -2.72, { cast: false }));

    /* ---------- 落水管（西角） ---------- */
    g.add(S.cyl(0.035, 0.035, wallH, MTL.metal(0x8a8d90, 0.5), -HW - 0.1, wallH / 2, -HD + 0.12));
    g.add(S.cyl(0.04, 0.04, 0.18, MTL.metal(0x8a8d90, 0.5), -HW - 0.1, wallH + 0.05, -HD + 0.12, { cast: false }));

    /* ---------- 室内基础暖光（透过玻璃可见） ---------- */
    const pl1 = new THREE.PointLight(0xffe3c0, 0.7, 10, 2);
    pl1.position.set(0, 2.6, 0);
    g.add(pl1);
    const pl2 = new THREE.PointLight(0xdcefff, 0.5, 7, 2);
    pl2.position.set(4.2, 2.4, -1.5);
    g.add(pl2);

    /* ---------- 放置 ---------- */
    g.position.set(-3, 0, -2.75);
    return g;
  };
})();