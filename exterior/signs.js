/* ============================================================
 * signs.js — 街角标识
 * 导出 M.streetSignPole(o)   路名牌（十字双面）
 * 导出 M.tramDirectionSign(o) 电车方向牌（双面）
 * 导出 M.aBoard(o)           店铺 A 字看板
 * o = { x, z, y, ry }  y 为地面高（平台 0.18 时传 0.18）
 * ============================================================ */
(function () {
  'use strict';

  M.streetSignPole = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const poleM = MTL.metal(0x3c4147, 0.5);
    const boardM = MTL.basic(0xffffff, { map: T.streetSign('駅前通り', 'EKIMAE-DORI') });
    const boardM2 = MTL.basic(0xffffff, { map: T.streetSign('駅前一丁目', 'EKIMAE-1') });
    const frameM = MTL.toon(0x2a2c31);

    g.add(S.box(0.24, 0.05, 0.24, poleM, 0, 0.025, 0, { cast: false }));
    g.add(S.cyl(0.028, 0.04, 2.15, poleM, 0, 1.1, 0));
    g.add(S.sph(0.035, frameM, 0, 2.22, 0, { cast: false }));
    /* 双面路牌 */
    [[2.0, boardM, 0], [1.76, boardM2, Math.PI / 2]].forEach(function (b) {
      g.add(S.box(0.98, 0.26, 0.035, frameM, 0, b[0], 0, { ry: b[2], cast: false }));
      g.add(S.plane(0.9, 0.225, b[1], 0, b[0], 0.02, { ry: b[2], cast: false }));
    });

    g.position.set(o.x !== undefined ? o.x : 0, o.y || 0, o.z !== undefined ? o.z : 0);
    if (o.ry) g.rotation.y = o.ry;
    return g;
  };

  M.tramDirectionSign = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const poleM = MTL.metal(0x3c4147, 0.5);
    const boardM = MTL.toon(0x2e5349);
    const t1 = MTL.basic(0xffffff, { map: T.label('市役所方面 →', { w: 512, h: 128, bg: 'transparent', fg: '#f2efe4', size: 64, border: false }), alpha: 1 });
    const t2 = MTL.basic(0xffffff, { map: T.label('← 駅前中央方面', { w: 512, h: 128, bg: 'transparent', fg: '#f2efe4', size: 64, border: false }), alpha: 1 });

    g.add(S.box(0.22, 0.05, 0.22, poleM, 0, 0.025, 0, { cast: false }));
    g.add(S.cyl(0.028, 0.038, 1.7, poleM, 0, 0.875, 0));
    g.add(S.box(1.0, 0.2, 0.04, boardM, 0, 1.55, 0, { cast: false }));
    g.add(S.plane(0.92, 0.145, t1, 0, 1.55, 0.023, { cast: false }));
    g.add(S.box(1.0, 0.2, 0.04, boardM, 0, 1.3, 0, { cast: false }));
    g.add(S.plane(0.92, 0.145, t2, 0, 1.3, -0.023, { ry: Math.PI, cast: false }));

    g.position.set(o.x !== undefined ? o.x : 0, o.y || 0, o.z !== undefined ? o.z : 0);
    if (o.ry) g.rotation.y = o.ry;
    return g;
  };

  M.aBoard = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const frameM = MTL.toon(0x3a3f45);
    const faceM = MTL.basic(0xffffff, { map: T.label('新商品入荷', { w: 256, h: 288, bg: '#fffdf5', fg: '#b03a30', size: 44, border: true }) });
    const backM = MTL.toon(0xefe9da, { emissive: 0, ei: 0 });

    /* 前板 / 后板（微开 V 形） */
    g.add(S.box(0.52, 0.64, 0.02, frameM, 0.012, 0.33, 0.03, { ry: -0.1, cast: false }));
    g.add(S.box(0.5, 0.6, 0.016, faceM, 0.012, 0.33, 0.045, { ry: -0.1, cast: false }));
    g.add(S.box(0.52, 0.64, 0.02, frameM, -0.012, 0.33, -0.03, { ry: Math.PI + 0.1, cast: false }));
    g.add(S.box(0.5, 0.6, 0.016, backM, -0.012, 0.33, -0.045, { ry: Math.PI + 0.1, cast: false }));
    /* 顶轴 + 底脚 */
    g.add(S.cyl(0.02, 0.02, 0.5, frameM, 0, 0.66, 0, { rz: Math.PI / 2, cast: false }));
    [[0.1, 0.055], [-0.1, -0.055]].forEach(function (f) {
      g.add(S.box(0.05, 0.04, 0.42, frameM, f[0], 0.02, 0, { cast: false }));
    });

    g.position.set(o.x !== undefined ? o.x : 0, o.y || 0, o.z !== undefined ? o.z : 0);
    if (o.ry) g.rotation.y = o.ry;
    return g;
  };
})();