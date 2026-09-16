/* ============================================================
 * street.js — 街道系统：底座台座 / 道路 / 铁轨 / 斑马线 / 标线 /
 *            排水 / 井盖 / 护栏 / 小巷 / 绿化带 / 自行车架
 * 导出 M.street()
 * 布局（世界坐标，底座顶 y=0，底座 26.4×26.4）：
 *   主路 东西向 z∈[4.2,10.8]（轨距两轨 z=6.45/7.75）
 *   次路 南北向 x∈[4.2,10.8], z∈[-13.2,4.2]
 *   站台 x∈[-6.5,3.0], z∈[1.7,4.2]（tram-stop.js）
 * ============================================================ */
(function () {
  'use strict';
  const B = S.box, P = S.planeH, C = S.cyl;

  function texRepeat(tex, rx, ry) {
    const t = tex.clone();
    t.repeat.set(rx, ry);
    t.needsUpdate = true;
    return t;
  }

  M.street = function () {
    const g = new THREE.Group();
    const rnd = T.rng(777);

    /* ================= 底座台座 ================= */
    const rr = function (w, d, r) {
      const s = new THREE.Shape();
      const x = -w / 2, y = -d / 2;
      s.moveTo(x + r, y);
      s.lineTo(x + w - r, y);
      s.quadraticCurveTo(x + w, y, x + w, y + r);
      s.lineTo(x + w, y + d - r);
      s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
      s.lineTo(x + r, y + d);
      s.quadraticCurveTo(x, y + d, x, y + d - r);
      s.lineTo(x, y + r);
      s.quadraticCurveTo(x, y, x + r, y);
      return s;
    };
    const plinth = new THREE.Mesh(
      new THREE.ExtrudeGeometry(rr(26.4, 26.4, 0.55), { depth: 1.5, bevelEnabled: false, curveSegments: 5 }),
      MTL.toon(0x9d978b)
    );
    plinth.rotation.x = Math.PI / 2;
    plinth.receiveShadow = true;
    g.add(plinth);
    MTL.outlineAdd(plinth, 0.03);
    /* 顶缘压条 */
    const trimMat = MTL.toon(0x87816f);
    const trimN = B(26.44, 0.07, 0.22, trimMat, 0, 0.02, 13.2, { cast: false }); g.add(trimN);
    const trimS = B(26.44, 0.07, 0.22, trimMat, 0, 0.02, -13.2, { cast: false }); g.add(trimS);
    const trimE = B(0.22, 0.07, 26.44, trimMat, 13.2, 0.02, 0, { cast: false }); g.add(trimE);
    const trimW = B(0.22, 0.07, 26.44, trimMat, -13.2, 0.02, 0, { cast: false }); g.add(trimW);

    /* ================= 铺装 ================= */
    const paver = MTL.toon(0xffffff, { map: T.paver(3) });
    const paverT = function (w, d, x, z, rx, ry) {
      const m = P(w, d, MTL.toon(0xffffff, { map: texRepeat(T.paver(3), rx, ry) }), x, 0.006, z, { cast: false });
      g.add(m); return m;
    };
    // 西区块（便利店/邻屋/站台周边人行道）
    paverT(17.4, 17.4, -4.5, -4.5, 7, 7);
    // 北种植带外侧人行道
    paverT(26.4, 2.4, 0, 12.0, 9, 1);
    // 东南人行道
    paverT(2.4, 17.4, 12.0, -4.5, 1, 7);

    /* ================= 道路 ================= */
    const asphaltM = MTL.std(0xffffff, { map: T.asphalt(7), rough: 0.85, metal: 0, env: 0.25 });
    const roadM = function (w, d, x, z, rx, ry) {
      const m = P(w, d, MTL.std(0xffffff, { map: texRepeat(T.asphalt(7), rx, ry), rough: 0.85, metal: 0, env: 0.25 }), x, 0.003, z, { cast: false });
      g.add(m); return m;
    };
    roadM(26.4, 6.6, 0, 7.5, 9, 2.2);      // 主路
    roadM(6.6, 17.4, 7.5, -4.5, 2.2, 6);   // 次路

    /* ================= 站台 ================= */
    const platMat = MTL.toon(0xffffff, { map: T.concrete('#cfc9bb', 12) });
    const plat = B(9.5, 0.18, 2.5, platMat, -1.75, 0.09, 2.95);
    g.add(plat); MTL.outlineAdd(plat, 0.018);
    // 台面
    const topMat = MTL.toon(0xffffff, { map: texRepeat(T.concrete('#d3ccbd', 13), 4, 1) });
    g.add(P(9.44, 2.44, topMat, -1.75, 0.181, 2.95, { cast: false }));
    // 盲道黄条（临街边）
    const tact = MTL.toon(0xffffff, { map: T.tactile() });
    g.add(P(9.44, 0.3, tact, -1.75, 0.184, 4.02, { cast: false }));

    /* ================= 铁轨 ================= */
    // 枕木（实例化）
    const sleeperGeo = new THREE.BoxGeometry(0.15, 0.05, 1.62);
    const sleeperMat = MTL.toon(0x6a5138, { map: T.wood('#7a6248', 'rgba(50,34,18,0.8)', 31) });
    const sn = 44;
    const sleepers = S.inst(sleeperGeo, sleeperMat, sn, g);
    for (let i = 0; i < sn; i++) {
      S.setInst(sleepers, i, -13.15 + i * 0.6, 0.028, 7.1, 0, 0, 0);
    }
    sleepers.instanceMatrix.needsUpdate = true;
    // 钢轨
    const railMat = MTL.metal(0xb8bcc2, 0.4);
    const rail1 = B(26.4, 0.035, 0.055, railMat, 0, 0.042, 6.45);
    const rail2 = B(26.4, 0.035, 0.055, railMat, 0, 0.042, 7.75);
    g.add(rail1); g.add(rail2);
    // 轨顶高光条
    const railHi = MTL.basic(0xe8ecef);
    g.add(B(26.4, 0.006, 0.02, railHi, 0, 0.061, 6.45, { cast: false }));
    g.add(B(26.4, 0.006, 0.02, railHi, 0, 0.061, 7.75, { cast: false }));

    /* ================= 斑马线 / 标线 ================= */
    const paint = MTL.basic(0xe8e6dc);
    const zebra = function (w, d, x, z) { g.add(B(w, 0.012, d, paint, x, 0.01, z, { cast: false, recv: false })); };
    // 次路斑马线（5 条）
    for (let i = 0; i < 5; i++) zebra(1.0, 0.36, 7.5, 1.95 + i * 0.42);
    // 主路斑马线（6 条）
    for (let i = 0; i < 6; i++) zebra(0.36, 6.0, 7.95 + i * 0.44, 7.5);
    // 停止线
    zebra(0.22, 6.0, 7.55, 7.5);
    zebra(6.0, 0.22, 7.5, 1.7);
    // 停车格（次路东侧，4 格）
    const pl = function (w, d, x, z) { g.add(B(w, 0.008, d, paint, x, 0.008, z, { cast: false, recv: false })); };
    pl(0.1, 12.4, 9.4, -5.4);
    pl(0.1, 12.4, 10.55, -5.4);
    for (let i = 0; i < 5; i++) pl(1.15, 0.1, 9.97, -11.6 + i * 3.1);

    /* ================= 路缘石 ================= */
    const curbMat = MTL.toon(0xb5afa2);
    function curb(w, d, x, z) { const c = B(w, 0.07, d, curbMat, x, 0.035, z); g.add(c); }
    curb(26.4, 0.14, 0, 10.85);
    curb(17.4, 0.14, -4.5, 4.15);
    curb(2.4, 0.14, 12.0, 4.15);
    curb(0.14, 17.4, 4.15, -4.5);
    curb(0.14, 17.4, 10.85, -4.5);

    /* ================= 排水沟 / 篦子 ================= */
    const drainMat = MTL.toon(0x3a3a40);
    const grateMat = MTL.metal(0x6a6e74, 0.5);
    const grateGeo = new THREE.BoxGeometry(0.5, 0.02, 0.24);
    const gd1 = S.inst(grateGeo, grateMat, 8, g);
    for (let i = 0; i < 8; i++) S.setInst(gd1, i, -12.4 + i * 3.3, 0.012, 4.42, 0, 0, 0);
    gd1.instanceMatrix.needsUpdate = true;
    const gd2 = S.inst(new THREE.BoxGeometry(0.24, 0.02, 0.5), grateMat, 5, g);
    for (let i = 0; i < 5; i++) S.setInst(gd2, i, 4.42, 0.012, -11.8 + i * 4.2, 0, 0, 0);
    gd2.instanceMatrix.needsUpdate = true;
    g.add(B(26.4, 0.006, 0.16, drainMat, 0, 0.005, 4.5, { cast: false, recv: false }));
    g.add(B(0.16, 0.006, 17.4, drainMat, 4.5, 0.005, -4.5, { cast: false, recv: false }));

    /* ================= 井盖 ================= */
    const manGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.014, 26);
    const manBase = MTL.toon(0x55555c);
    const manTex = T.manhole();
    const manTop = MTL.basic(0xffffff, { map: manTex });
    [[6.6, 9.5], [7.5, -12.4], [-2.2, 12.4]].forEach(function (p, i) {
      const m = new THREE.Mesh(manGeo, manBase);
      m.position.set(p[0], 0.008, p[1]);
      m.receiveShadow = true;
      g.add(m);
      g.add(P(0.62, 0.62, manTop, p[0], 0.017, p[1], { cast: false, recv: false }));
    });

    /* ================= 护栏（次路东侧） ================= */
    const railPoleMat = MTL.metal(0x7a7e84, 0.45);
    const nPost = 7;
    const posts = S.inst(new THREE.BoxGeometry(0.05, 0.78, 0.05), railPoleMat, nPost, g);
    for (let i = 0; i < nPost; i++) S.setInst(posts, i, 10.78, 0.39, -11.4 + i * 1.58, 0, 0, 0);
    posts.instanceMatrix.needsUpdate = true;
    const barT = B(0.035, 0.05, 9.7, MTL.metal(0x8a8e94, 0.4), 10.78, 0.72, -7.0);
    const barB = B(0.035, 0.05, 9.7, MTL.metal(0x8a8e94, 0.4), 10.78, 0.3, -7.0);
    g.add(barT); g.add(barB);

    /* ================= 小巷 ================= */
    // 巷内铺装（略深）
    g.add(P(1.16, 5.9, MTL.toon(0xffffff, { map: texRepeat(T.paver(9), 1, 3) }), -9.6, 0.007, -2.0, { cast: false }));
    // 西侧矮墙（邻屋附属）
    const wallMat = MTL.toon(0xffffff, { map: T.stucco('#d8d2c4', 21) });
    const aw = B(0.16, 1.1, 4.6, wallMat, -10.08, 0.55, -2.9);
    g.add(aw); MTL.outlineAdd(aw, 0.016);
    const awTop = B(0.24, 0.06, 4.7, MTL.toon(0xa8a294), -10.08, 1.12, -2.9);
    g.add(awTop);
    // 巷口木门框
    const woodD = MTL.toon(0xffffff, { map: T.wood('#8a6a4a', 'rgba(60,40,20,0.8)', 44) });
    g.add(B(0.09, 1.7, 0.09, woodD, -10.05, 0.85, 0.85));
    g.add(B(0.09, 1.7, 0.09, woodD, -9.18, 0.85, 0.85));
    g.add(B(1.0, 0.09, 0.09, woodD, -9.6, 1.72, 0.85));
    // 门板
    const doorM = MTL.toon(0xffffff, { map: T.wood('#7a5a3c', 'rgba(50,32,16,0.8)', 45) });
    g.add(B(0.8, 1.58, 0.05, doorM, -9.6, 0.8, 0.85, { ry: Math.PI / 2 }));
    // 落水管
    g.add(C(0.03, 0.03, 3.0, MTL.metal(0x8a8d90, 0.5), -10.13, 1.5, -4.6));
    g.add(B(0.03, 3.4, 0.03, MTL.metal(0x8a8d90, 0.5), -10.1, 0.17, -2.4, { rz: Math.PI / 2 }));
    // 公告贴纸
    const ap = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.62), MTL.basic(0xffffff, { map: T.wallPoster(5) }));
    ap.position.set(-10.185, 0.72, -1.4);
    ap.rotation.y = Math.PI / 2;
    g.add(ap);

    /* ================= 绿化带 ================= */
    const green = MTL.toon(0x7a9464);
    const greenD = MTL.toon(0x6a8456);
    // 北侧种植带（3 株吉野樱）
    const ng = B(26.4, 0.045, 1.9, greenD, 0, 0.02, 12.0, { cast: false });
    g.add(ng);
    // 东侧绿带（晚樱 ×2）
    g.add(B(2.4, 0.045, 8.4, greenD, 12.0, 0.02, -8.8, { cast: false }));
    // 街角小圆绿（小吉野）
    const cp = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.02, 0.05, 24), green);
    cp.position.set(11.9, 0.02, 3.5);
    cp.receiveShadow = true;
    g.add(cp);

    /* ================= 自行车 U 型架 ================= */
    const rackMat = MTL.metal(0x4a4d52, 0.4);
    [-8.7, -7.85, -7.0].forEach(function (x) {
      const u = new THREE.Group();
      u.add(B(0.045, 0.78, 0.045, rackMat, -0.34, 0.39, 0));
      u.add(B(0.045, 0.78, 0.045, rackMat, 0.34, 0.39, 0));
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.023, 8, 20, Math.PI), rackMat);
      arc.position.y = 0.78;
      arc.rotation.y = Math.PI / 2;
      u.add(arc);
      u.position.set(x, 0, 2.3);
      g.add(u);
    });

    return g;
  };
})();