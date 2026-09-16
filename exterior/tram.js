/* ============================================================
 * tram.js — 复古有轨电车（单节）
 * 导出 M.tram(o)
 * o = { x, z, ry }
 * 本地：车体中心为原点，车头 -x，地面 y=0
 * 车轮着轨 y≈0.06（street.js 钢轨 z=6.45 / 7.75，轨顶 0.06）
 * 受电杆顶端 y≈3.70（架空线在 utility-span.js）
 * ============================================================ */
(function () {
  'use strict';

  M.tram = function (o) {
    o = o || {};
    const g = new THREE.Group();

    const bodyM = MTL.toon(0xffffff, { map: T.tramPaint(7) });
    const creamM = MTL.toon(0xf3ead8);
    const brownM = MTL.toon(0x7a4a33);
    const darkM = MTL.toon(0x33363b);
    const roofM = MTL.toon(0x666d5c);
    const glassM = MTL.glass(0xd9eef5, 0.3);
    S.addGlass({ mat: glassM, amp: 0.18, speed: 0.5, phase: 1.3 });
    const wheelM = MTL.metal(0x3f4247, 0.6);
    const hubM = MTL.metal(0x9a9ea4, 0.4);
    const metalM = MTL.metal(0x5a5e64, 0.7);

    /* ---------- 车体 ---------- */
    const body = S.box(6.4, 1.95, 2.5, bodyM, 0, 1.875, 0);
    g.add(body); MTL.outlineAdd(body, 0.02);
    /* 下部地板架 */
    g.add(S.box(5.9, 0.35, 2.1, darkM, 0, 0.725, 0));
    /* 车顶 + 顶帽 */
    const roof = S.box(6.2, 0.22, 2.3, roofM, 0, 2.96, 0);
    g.add(roof); MTL.outlineAdd(roof, 0.016);
    g.add(S.box(5.9, 0.05, 2.0, roofM, 0, 3.115, 0, { cast: false }));
    /* 车顶通风器 / 顶灯 */
    [-1.3, 1.3].forEach(function (x) {
      g.add(S.box(0.28, 0.1, 0.28, roofM, x, 3.16, 0, { cast: false }));
    });
    [-2.4, 2.4].forEach(function (x) {
      g.add(S.cyl(0.07, 0.07, 0.09, MTL.emissive(0xfff4d8, 0.5), x, 3.14, 0, { cast: false }));
    });

    /* ---------- 侧面车窗 + 门 ---------- */
    const sillM = creamM;
    [-2.2, -1.7, -1.2, 0, 1.2, 1.7, 2.2].forEach(function (x) {
      g.add(S.box(0.045, 0.7, 0.04, sillM, x, 2.32, -1.255, { cast: false }));
      g.add(S.box(0.045, 0.7, 0.04, sillM, x, 2.32, 1.255, { cast: false }));
    });
    /* 窗带（-z 侧 / +z 侧，分段） */
    const winSegs = [
      [-2.51, 0.58], [-0.6, 1.14], [0.6, 1.14], [2.51, 0.58]
    ];
    winSegs.forEach(function (s) {
      g.add(S.plane(s[1], 0.66, glassM, s[0], 2.32, -1.254, { ry: Math.PI, cast: false }));
      g.add(S.plane(s[1], 0.66, glassM, s[0], 2.32, 1.254, { cast: false }));
    });
    /* 门下段玻璃（车门区 ±1.2..±2.2） */
    [-1.7, 1.7].forEach(function (x) {
      g.add(S.plane(0.9, 0.44, glassM, x, 1.72, -1.254, { ry: Math.PI, cast: false }));
      g.add(S.plane(0.9, 0.44, glassM, x, 1.72, 1.254, { cast: false }));
    });
    /* 窗台 + 门把手 */
    g.add(S.box(5.7, 0.05, 0.05, sillM, 0, 1.95, -1.254, { cast: false }));
    g.add(S.box(5.7, 0.05, 0.05, sillM, 0, 1.95, 1.254, { cast: false }));
    [-1.7, 1.7].forEach(function (x) {
      [-0.25, 0.25].forEach(function (dx) {
        g.add(S.box(0.02, 0.1, 0.02, brownM, x + dx, 1.62, -1.27, { cast: false }));
        g.add(S.box(0.02, 0.1, 0.02, brownM, x + dx, 1.62, 1.27, { cast: false }));
      });
    });
    /* 车门踏步 */
    [-1.7, 1.7].forEach(function (x) {
      g.add(S.box(0.9, 0.05, 0.28, darkM, x, 0.5, -1.32, { cast: false }));
      g.add(S.box(0.9, 0.05, 0.28, darkM, x, 0.5, 1.32, { cast: false }));
    });
    /* 侧面路线号 */
    const numM = MTL.basic(0xffffff, { map: T.label('23', { w: 128, h: 128, bg: '#f3ead8', fg: '#7a4a33', size: 92, border: false }) });
    g.add(S.plane(0.32, 0.32, numM, -2.55, 1.45, -1.256, { ry: Math.PI, cast: false }));
    g.add(S.plane(0.32, 0.32, numM, -2.55, 1.45, 1.256, { cast: false }));

    /* ---------- 车头 / 车尾 ---------- */
    /* 前窗 */
    g.add(S.plane(1.9, 0.62, glassM, -3.206, 2.28, 0, { ry: -Math.PI / 2, cast: false }));
    g.add(S.box(0.05, 0.05, 2.0, sillM, -3.206, 1.95, 0, { cast: false }));
    /* 目的地幕 */
    const signF = MTL.toon(0xffffff, { map: T.destination('市役所前', '23'), emissive: 0xfff0c8, ei: 0.35 });
    const signR = MTL.toon(0xffffff, { map: T.destination('駅前中央', '23'), emissive: 0xfff0c8, ei: 0.35 });
    g.add(S.plane(1.5, 0.375, signF, -3.21, 2.64, 0, { ry: -Math.PI / 2, cast: false }));
    g.add(S.plane(1.5, 0.375, signR, 3.21, 2.64, 0, { ry: Math.PI / 2, cast: false }));
    /* 后窗 */
    g.add(S.plane(1.9, 0.62, glassM, 3.206, 2.28, 0, { ry: Math.PI / 2, cast: false }));
    /* 头灯 / 尾灯 */
    const headM = MTL.emissive(0xfff2d0, 1.0);
    const tailM = MTL.emissive(0xff6a5a, 0.9);
    [-0.9, 0.9].forEach(function (z) {
      g.add(S.cyl(0.09, 0.09, 0.06, headM, -3.22, 1.18, z, { rz: Math.PI / 2, cast: false }));
      g.add(S.cyl(0.07, 0.07, 0.06, tailM, 3.22, 1.3, z, { rz: Math.PI / 2, cast: false }));
    });
    /* 车头号牌 */
    g.add(S.plane(0.3, 0.3, numM, -3.208, 1.5, 0, { ry: -Math.PI / 2, cast: false }));
    /* 车头踏步 */
    g.add(S.box(0.3, 0.06, 1.6, darkM, -3.32, 0.62, 0, { cast: false }));
    g.add(S.box(0.2, 0.05, 1.2, darkM, -3.24, 0.42, 0, { cast: false }));

    /* ---------- 转向架 + 车轮 ---------- */
    [-1.9, 1.9].forEach(function (bx) {
      g.add(S.box(1.5, 0.5, 0.05, darkM, bx, 0.6, -1.15));
      g.add(S.box(1.5, 0.5, 0.05, darkM, bx, 0.6, 1.15));
      [bx - 0.5, bx + 0.5].forEach(function (wx) {
        [-0.65, 0.65].forEach(function (wz) {
          g.add(S.cyl(0.32, 0.32, 0.1, wheelM, wx, 0.38, wz));
          g.add(S.cyl(0.1, 0.1, 0.104, hubM, wx, 0.38, wz, { cast: false }));
        });
        g.add(S.cyl(0.035, 0.035, 1.3, metalM, wx, 0.38, 0, { rz: Math.PI / 2, cast: false }));
      });
    });

    /* ---------- 受电杆（菱形，顶 y≈3.70） ---------- */
    const px = -0.9;
    g.add(S.box(0.9, 0.05, 0.45, darkM, px, 3.16, 0, { cast: false }));
    [px - 0.25, px + 0.25].forEach(function (x) {
      g.add(S.cyl(0.05, 0.06, 0.14, metalM, x, 3.1, 0, { cast: false }));
    });
    const armM = MTL.toon(0x8a4a33);
    const lowerL = S.box(0.05, 0.38, 0.04, armM, px - 0.075, 3.32, 0, { rz: -0.73 });
    const lowerR = S.box(0.05, 0.38, 0.04, armM, px + 0.075, 3.32, 0, { rz: 0.73 });
    const upperL = S.box(0.045, 0.45, 0.035, armM, px - 0.2, 3.56, 0, { rz: 1.107 });
    const upperR = S.box(0.045, 0.45, 0.035, armM, px + 0.2, 3.56, 0, { rz: -1.107 });
    g.add(lowerL); g.add(lowerR); g.add(upperL); g.add(upperR);
    g.add(S.box(1.15, 0.04, 0.07, darkM, px, 3.68, 0, { cast: false }));

    g.position.set(o.x !== undefined ? o.x : -1.75, 0, o.z !== undefined ? o.z : 7.1);
    if (o.ry) g.rotation.y = o.ry;
    return g;
  };
})();