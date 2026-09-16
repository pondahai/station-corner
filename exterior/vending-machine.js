/* ============================================================
 * vending-machine.js — 自动贩卖机
 * 导出 M.vendingMachine(o)
 * o = { x, z, ry, color }
 * 本地：中心 x=0，正面 +z，高 1.85
 * ============================================================ */
(function () {
  'use strict';

  M.vendingMachine = function (o) {
    o = o || {};
    const g = new THREE.Group();
    const rnd = T.rng(88);
    const bodyColor = o.color !== undefined ? o.color : 0x3a5a8a;

    /* ---------- 机身 ---------- */
    const bodyMat = MTL.toon(0xffffff, { map: T.vendingPanel() });
    /* 中空壳（正面开口，展示窗可见内部） */
    [
      S.box(0.92, 1.7, 0.04, bodyMat, 0, 0.95, -0.31),
      S.box(0.04, 1.7, 0.66, bodyMat, -0.44, 0.95, 0),
      S.box(0.04, 1.7, 0.66, bodyMat, 0.44, 0.95, 0),
      S.box(0.84, 0.06, 0.6, bodyMat, 0, 1.77, 0),
      S.box(0.92, 0.26, 0.04, bodyMat, 0, 0.35, 0.31),
      S.box(0.92, 0.1, 0.04, bodyMat, 0, 1.75, 0.31),
      S.box(0.32, 1.4, 0.04, bodyMat, 0.29, 1.05, 0.31)
    ].forEach(function (p) { g.add(p); MTL.outlineAdd(p, 0.018); });
    /* 顶部遮檐 */
    const roof = S.box(1.0, 0.1, 0.74, MTL.toon(0x2e3440), 0, 1.86, 0);
    g.add(roof); MTL.outlineAdd(roof, 0.018);
    /* 底部踢脚 + 脚轮 */
    g.add(S.box(0.88, 0.2, 0.58, MTL.toon(0x2e3440), 0, 0.1, -0.02, { cast: false }));
    [[-0.38, -0.28], [0.38, -0.28], [-0.38, 0.28], [0.38, 0.28]].forEach(function (p) {
      const wheel = S.cyl(0.05, 0.05, 0.04, MTL.toon(0x26262a), p[0], 0.05, p[1], { rz: Math.PI / 2, cast: false });
      g.add(wheel);
    });
    /* 顶部品牌带 */
    const brandM = MTL.toon(0xffffff, { map: T.label('ドリンク', { w: 512, h: 96, bg: '#f2efe6', fg: '#2a4a7a', size: 64 }), emissive: 0xfff4e0, ei: 0.35 });
    g.add(S.plane(0.86, 0.05, brandM, 0, 1.77, 0.336, { cast: false }));

    /* ---------- 正面玻璃 ---------- */
    const glassM = MTL.glass(0xd8eef5, 0.13);
    S.addGlass({ mat: glassM, amp: 0.2, speed: 0.6, phase: 0.4 });
    /* 玻璃边框（框住展示窗） */
    g.add(S.box(0.56, 0.05, 0.04, MTL.toon(0x2e3440), -0.16, 1.715, 0.34, { cast: false }));
    g.add(S.box(0.56, 0.05, 0.04, MTL.toon(0x2e3440), -0.16, 0.465, 0.34, { cast: false }));
    g.add(S.box(0.05, 1.3, 0.04, MTL.toon(0x2e3440), -0.44, 1.09, 0.34, { cast: false }));
    g.add(S.box(0.05, 1.3, 0.04, MTL.toon(0x2e3440), 0.12, 1.09, 0.34, { cast: false }));

    /* ---------- 操作面板（右侧） ---------- */
    const panelM = MTL.toon(0xd8d4c8);
    g.add(S.box(0.2, 1.3, 0.03, panelM, 0.37, 1.03, 0.335, { cast: false }));
    /* 按键 4×6 */
    const btnM = MTL.toon(0xf0ede4);
    const btnD = MTL.toon(0x3a3a40);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        const x = 0.29 + c * 0.031;
        const y = 1.5 - r * 0.13;
        g.add(S.box(0.024, 0.09, 0.012, r < 1 ? btnD : btnM, x, y, 0.35, { cast: false }));
      }
    }
    /* 投币口 / 退币口 / 找零显示 */
    g.add(S.box(0.06, 0.1, 0.012, btnD, 0.44, 1.18, 0.35, { cast: false }));
    g.add(S.box(0.1, 0.03, 0.014, MTL.toon(0x2a2a30), 0.4, 1.05, 0.35, { cast: false }));
    const dispM = MTL.emissive(0x9fe8c8, 1.6);
    S.addBreathe({ mat: dispM, amp: 0.25, speed: 0.9, phase: 2.2 });
    g.add(S.box(0.14, 0.05, 0.01, dispM, 0.4, 0.95, 0.35, { cast: false }));
    /* 价格小贴纸 */
    for (let c = 0; c < 6; c++) {
      g.add(S.plane(0.026, 0.026, MTL.basic(0xffffff, { map: T.label(String(110 + Math.floor(rnd() * 6) * 10), { w: 64, h: 64, bg: '#f6f3ea', fg: '#444', size: 40, border: false }) }), 0.29 + c * 0.031, 0.62, 0.352, { cast: false }));
    }

    /* ---------- 按钮格 ---------- */
    const btnGeo = new THREE.BoxGeometry(0.026, 0.018, 0.008);
    const btns = new THREE.InstancedMesh(btnGeo, MTL.toon(0xe8e4d8), 18);
    for (let i = 0; i < 18; i++) {
      const c = i % 3, r2 = Math.floor(i / 3);
      S.setInst(btns, i, 0.16 + c * 0.045, 1.45 - r2 * 0.075, 0.34, 0, 0, 0);
    }
    btns.castShadow = false; btns.receiveShadow = false;
    g.add(btns);

    /* ---------- 展示窗 + 内部 ---------- */
    const dispGlass = S.plane(0.5, 1.2, glassM, -0.16, 1.09, 0.336, { cast: false });
    g.add(dispGlass);
    const innerDark = MTL.toon(0x454b54);
    g.add(S.box(0.5, 1.3, 0.02, innerDark, -0.16, 1.09, -0.265, { cast: false }));
    g.add(S.box(0.02, 1.3, 0.54, innerDark, -0.405, 1.09, 0, { cast: false }));
    g.add(S.box(0.02, 1.3, 0.54, innerDark, 0.075, 1.09, 0, { cast: false }));
    /* 层板 + 饮料 + LED 灯带 */
    const shelfYs = [0.5, 0.78, 1.06, 1.34];
    const shelfMat = MTL.metal(0x8a8e94, 0.5);
    const ledMat = MTL.emissive(0xcfefff, 1.5);
    S.addBreathe({ mat: ledMat, amp: 0.2, speed: 0.7, phase: 1.1 });
    shelfYs.forEach(function (sy, i) {
      g.add(S.box(0.5, 0.014, 0.44, shelfMat, -0.16, sy, -0.03, { cast: false }));
      g.add(S.box(0.46, 0.012, 0.014, ledMat, -0.16, sy + 0.29, 0.24, { cast: false }));
      const kind = i % 2 === 0 ? 'can' : 'soda';
      PRD.fillShelf({ parent: g, kind: kind, x0: -0.38, x1: 0.05, z: -0.14, y: sy + 0.008, rows: 2, rowGap: 0.09, pitch: 0.072, seed: 90 + i });
    });
    /* 顶层（罐装） */
    g.add(S.box(0.5, 0.014, 0.44, shelfMat, -0.16, 1.6, -0.03, { cast: false }));
    PRD.fillShelf({ parent: g, kind: 'can', x0: -0.38, x1: 0.05, z: -0.14, y: 1.608, rows: 2, rowGap: 0.09, pitch: 0.072, seed: 99 });

    /* ---------- 取物口 ---------- */
    g.add(S.box(0.5, 0.24, 0.02, MTL.toon(0x2e3440), -0.1, 0.28, 0.355, { cast: false }));
    const flap = S.box(0.4, 0.04, 0.16, MTL.toon(0x8a8e94), -0.1, 0.19, 0.41, { rx: -0.5, cast: false });
    g.add(flap);
    g.add(S.box(0.36, 0.05, 0.14, MTL.toon(0x3a4148), -0.1, 0.14, 0.375, { cast: false }));

    /* ---------- 侧面旧贴纸 ---------- */
    const sideM = MTL.basic(0xffffff, { map: T.label('150円', { w: 256, h: 128, bg: '#e8e4d8', fg: '#7a3a3a', size: 64 }) });
    g.add(S.plane(0.3, 0.15, sideM, -0.466, 1.2, -0.1, { ry: -Math.PI / 2, cast: false }));
    const sideM2 = MTL.basic(0xffffff, { map: T.label('アイス', { w: 256, h: 128, bg: '#e4e8ee', fg: '#3a5a8a', size: 64 }) });
    g.add(S.plane(0.3, 0.15, sideM2, -0.466, 0.95, 0.12, { ry: -Math.PI / 2, cast: false }));

    /* ---------- 内部暖光 ---------- */
    const pl = new THREE.PointLight(0xdff0ff, 0.35, 1.2, 2);
    pl.position.set(-0.09, 1.5, 0);
    g.add(pl);

    g.position.set(o.x || 0, 0, o.z || 0);
    if (o.ry) g.rotation.y = o.ry;
    return g;
  };
})();