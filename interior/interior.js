/* ============================================================
 * interior.js — 店内总装配（地板/吊顶/LED/墙贴/OPEN 牌 + 15 件设备）
 * 导出 M.interior()  组心即店铺本地原点，自置 (-3, 0, -2.75)
 * ============================================================ */
(function () {
  'use strict';

  M.interior = function () {
    const g = new THREE.Group();

    /* 地板 + 吊顶 */
    g.add(S.planeH(11.94, 7.54, MTL.toon(0xffffff, { map: T.concrete(0xe9e4d6, 8) }), 0, 0.023, 0, { cast: false }));
    g.add(S.planeH(11.94, 7.54, MTL.toon(0xded9cc, { side: THREE.DoubleSide }), 0, 3.08, 0, { cast: false, recv: false }));

    /* 吊顶 LED ×8（共享材质，一次呼吸） */
    const steelM = MTL.toon(0xcfd3d6);
    const ledM = MTL.toon(0xfff6e6, { emissive: 0xfff3dd, ei: 1.6 });
    S.addBreathe({ mat: ledM, amp: 0.08, speed: 0.45, phase: 0.3 });
    for (const lx of [-3.4, 0, 3.4]) {
      for (const lz of [-1.9, 1.2]) {
        g.add(S.box(1.34, 0.03, 0.54, steelM, lx, 3.05, lz, { cast: false }));
        g.add(S.box(1.24, 0.02, 0.44, ledM, lx, 3.035, lz, { cast: false }));
      }
    }

    /* 墙面海报 ×3 */
    const wp1 = MTL.toon(0xffffff, { map: T.wallPoster(3) });
    const wp2 = MTL.toon(0xffffff, { map: T.wallPoster(7) });
    const wp3 = MTL.toon(0xffffff, { map: T.wallPoster(12) });
    g.add(S.plane(0.44, 0.62, wp1, -5.81, 1.85, -2.4, { ry: Math.PI / 2, cast: false }));
    g.add(S.plane(0.44, 0.62, wp2, 5.81, 1.85, -1.6, { ry: -Math.PI / 2, cast: false }));
    g.add(S.plane(0.44, 0.62, wp3, 1.8, 1.95, -3.56, { cast: false }));

    /* OPEN 双面牌（吊在入口，微摆 + 呼吸发光） */
    const openG = new THREE.Group();
    const openM = MTL.toon(0xffffff, {
      map: T.label('OPEN', { w: 256, h: 128, bg: '#1f8a4d', fg: '#f5f2e8', size: 72, border: false }),
      emissive: 0x8fe0a8, ei: 0.7
    });
    S.addBreathe({ mat: openM, amp: 0.15, speed: 0.6, phase: 1.1 });
    openG.add(S.box(0.56, 0.3, 0.07, MTL.toon(0x22302a), 0, 0, 0));
    openG.add(S.plane(0.5, 0.24, openM, 0, 0, 0.038, { cast: false }));
    openG.add(S.plane(0.5, 0.24, openM, 0, 0, -0.038, { ry: Math.PI, cast: false }));
    openG.add(S.box(0.02, 0.24, 0.02, steelM, -0.2, 0.27, 0, { cast: false }));
    openG.add(S.box(0.02, 0.24, 0.02, steelM, 0.2, 0.27, 0, { cast: false }));
    openG.position.set(4.6, 2.7, 3.05);
    g.add(openG);
    S.addSway({ obj: openG, axis: 'x', amp: 0.012, speed: 1.1, phase: 0.5, base: 0 });

    /* 店内设备 ×15 */
    g.add(M.shelves({ x: -2.7, z: -1.7, seed: 11 }));
    g.add(M.shelves({ x: -2.7, z: -0.35, seed: 12, cap: true }));
    g.add(M.shelves({ x: -2.7, z: 1.0, seed: 13 }));
    g.add(M.snacks({}));
    g.add(M.beverageFridge({}));
    g.add(M.standingFreezer({}));
    g.add(M.deliCounter({}));
    g.add(M.register({ x: 3.0, z: 1.5 }));
    g.add(M.coffeeMachine({}));
    g.add(M.magazineRack({}));
    g.add(M.posterLightbox({}));
    g.add(M.odCounter({}));
    g.add(M.floorSigns());
    g.add(M.lockers({}));
    g.add(M.backDoor({}));

    g.position.set(-3, 0, -2.75);
    return g;
  };
})();