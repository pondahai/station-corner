/* ============================================================
 * floor-signs.js — 地面贴花（欢迎贴花 / 引导箭头 / 触感铺面）
 * 导出 M.floorSigns()  店内本地坐标
 * ============================================================ */
(function () {
  'use strict';

  M.floorSigns = function () {
    const g = new THREE.Group();

    /* 欢迎贴花（门口内侧） */
    g.add(S.planeH(0.85, 0.85, MTL.basic(0xffffff, { map: T.floorWelcome(), alpha: 1 }), 5.35, 0.0245, 2.2, { cast: false }));
    /* 引导箭头 ×2（指向店内） */
    g.add(S.planeH(0.36, 0.6, MTL.basic(0xffffff, { map: T.floorArrow(), alpha: 1 }), 0.4, 0.0245, 0.9, { cast: false }));
    g.add(S.planeH(0.36, 0.6, MTL.basic(0xffffff, { map: T.floorArrow(), alpha: 1 }), 2.2, 0.0245, 0.6, { ry: -0.35, cast: false }));
    /* 触感铺面（收银台前，避开门垫） */
    g.add(S.box(0.7, 0.014, 0.16, MTL.toon(0xffffff, { map: T.tactile() }), 5.45, 0.026, 2.9, { cast: false }));

    return g;
  };
})();