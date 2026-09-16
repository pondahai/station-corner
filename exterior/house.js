/* ============================================================
 * house.js — 邻家两层独栋（山墙朝东西，正面朝主路）
 * 导出 M.house()
 * 自置 (-11.6, 0, -2.0)：世界 x -13..-10.2, z -5..1.0
 * 局部坐标：x -1.4..1.4（+x 朝小巷），z -3..3（+z 朝主路）
 * ============================================================ */
(function () {
  'use strict';

  M.house = function () {
    const g = new THREE.Group();

    const stuccoM = MTL.toon(0xffffff, { map: T.stucco('#e3dccb', 7) });
    const concreteM = MTL.toon(0xffffff, { map: T.concrete('#c8c2b4', 14) });
    const roofM = MTL.toon(0xffffff, { map: T.roofTile(4) });
    const roofDarkM = MTL.toon(0x5a5148);
    const woodM = MTL.toon(0xffffff, { map: T.wood('#8a6a4a', 'rgba(60,40,20,0.8)', 19) });
    const doorM = MTL.toon(0xffffff, { map: T.wood('#6a4a30', 'rgba(40,26,14,0.85)', 23) });
    const whiteM = MTL.toon(0xe8e6de);
    const glassM = MTL.toon(0x3a4a55);
    const louverM = MTL.toon(0xffffff, { map: T.louver() });
    const tankM = MTL.toon(0xffffff, { map: T.waterTank() });

    /* ---------- 主体 ---------- */
    g.add(S.box(2.86, 0.18, 6.06, concreteM, 0, 0.09, 0));              /* 基座 */
    g.add(S.box(2.8, 2.72, 6.0, stuccoM, 0, 1.52, 0));                  /* 一层 */
    g.add(S.box(2.2, 2.2, 5.4, stuccoM, 0, 3.98, 0));                   /* 二层（内收） */

    /* ---------- 屋顶（山墙沿 z） ---------- */
    g.add(S.box(2.0, 0.07, 6.7, roofM, 0.9, 5.55, 0, { rz: -0.41 }));
    g.add(S.box(2.0, 0.07, 6.7, roofM, -0.9, 5.55, 0, { rz: 0.41 }));
    g.add(S.box(0.12, 0.09, 6.75, roofDarkM, 0, 5.98, 0));              /* 屋脊 */
    g.add(S.box(0.16, 0.08, 6.72, woodM, 1.8, 5.17, 0));                /* 檐口（东） */
    g.add(S.box(0.16, 0.08, 6.72, woodM, -1.8, 5.17, 0));               /* 檐口（西） */

    const gableM = stuccoM.clone();
    gableM.side = THREE.DoubleSide;
    function gable(z) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute([
        -1.1, 5.08, z, 1.1, 5.08, z, 0, 5.95, z
      ], 3));
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, gableM);
      m.castShadow = true;
      return m;
    }
    g.add(gable(2.72));
    g.add(gable(-2.72));

    /* ---------- 屋顶水箱 ---------- */
    g.add(S.cyl(0.42, 0.42, 0.9, tankM, -0.853, 6.118, -1.9, { rz: 0.41 }));
    g.add(S.cyl(0.43, 0.43, 0.06, MTL.toon(0xe8e8e0), -1.068, 6.602, -1.9, { rz: 0.41, cast: false }));

    /* ---------- 门（+z 正面） ---------- */
    g.add(S.box(1.0, 2.1, 0.12, woodM, 0.9, 1.23, 3.06));
    g.add(S.box(0.84, 1.94, 0.06, doorM, 0.9, 1.15, 3.05));
    g.add(S.sph(0.028, MTL.toon(0x9a958a), 0.55, 1.1, 3.09, { cast: false }));
    g.add(S.box(1.2, 0.1, 0.7, concreteM, 0.9, 0.05, 3.35));
    g.add(S.box(0.75, 0.06, 1.35, roofDarkM, 0.9, 2.36, 3.28));
    g.add(S.plane(0.12, 0.12, MTL.basic(0xffffff, { map: T.label('23', { w: 64, h: 64, bg: '#f2efe4', fg: '#3a3a40', size: 40, border: false }) }), 0.35, 1.7, 3.115, { cast: false }));

    /* ---------- 一层窗 ---------- */
    function win1fZ(x) {
      g.add(S.box(1.0, 1.05, 0.1, whiteM, x, 1.55, 3.05));
      g.add(S.box(0.86, 0.9, 0.05, glassM, x, 1.55, 3.045, { cast: false }));
      g.add(S.box(0.045, 0.9, 0.06, whiteM, x, 1.55, 3.05, { cast: false }));
      g.add(S.box(0.86, 0.045, 0.06, whiteM, x, 1.55, 3.05, { cast: false }));
      g.add(S.box(1.06, 0.06, 0.14, whiteM, x, 0.98, 3.07, { cast: false }));
    }
    win1fZ(-0.75);
    function win1fX(z) {
      g.add(S.box(0.1, 1.05, 1.0, whiteM, 1.45, 1.55, z));
      g.add(S.box(0.05, 0.9, 0.86, glassM, 1.445, 1.55, z, { cast: false }));
      g.add(S.box(0.06, 0.9, 0.045, whiteM, 1.45, 1.55, z, { cast: false }));
      g.add(S.box(0.06, 0.045, 0.86, whiteM, 1.45, 1.55, z, { cast: false }));
      g.add(S.box(0.14, 0.06, 1.06, whiteM, 1.47, 0.98, z, { cast: false }));
    }
    win1fX(-1.1);
    win1fX(1.1);

    /* ---------- 二层窗 + 阳台 ---------- */
    [-0.65, 0, 0.65].forEach(function (x) {
      g.add(S.box(0.72, 0.85, 0.08, whiteM, x, 3.95, 2.74));
      g.add(S.box(0.6, 0.72, 0.04, glassM, x, 3.95, 2.735, { cast: false }));
      g.add(S.box(0.6, 0.04, 0.05, whiteM, x, 3.95, 2.74, { cast: false }));
    });
    g.add(S.box(0.08, 0.85, 0.72, whiteM, 1.14, 3.95, -0.9));
    g.add(S.box(0.04, 0.72, 0.6, glassM, 1.135, 3.95, -0.9, { cast: false }));

    g.add(S.box(1.4, 1.7, 0.06, whiteM, 0, 3.69, 2.71));                /* 推拉门框 */
    g.add(S.box(1.3, 1.6, 0.05, glassM, 0, 3.68, 2.72, { cast: false }));
    g.add(S.box(1.7, 0.06, 0.55, concreteM, 0, 2.91, 2.975));           /* 阳台板 */
    [[-0.78, 3.22], [0.78, 3.22], [-0.26, 3.22], [0.26, 3.22]].forEach(function (p) {
      g.add(S.cyl(0.013, 0.013, 0.38, roofDarkM, p[0], 3.16, p[1], { cast: false }));
    });
    g.add(S.box(1.7, 0.05, 0.05, roofDarkM, 0, 3.36, 3.22, { cast: false }));
    g.add(S.box(0.05, 0.05, 0.55, roofDarkM, -0.85, 3.36, 2.975, { cast: false }));
    g.add(S.box(0.05, 0.05, 0.55, roofDarkM, 0.85, 3.36, 2.975, { cast: false }));

    /* ---------- 外墙设备 ---------- */
    g.add(S.box(0.26, 0.42, 0.55, louverM, -1.53, 0.37, -2.2));         /* 空调外机 */
    g.add(S.box(0.06, 4.7, 0.06, MTL.toon(0x9a958a), -1.37, 2.5, 3.03, { cast: false })); /* 落水管 */

    g.position.set(-11.6, 0, -2.0);
    return g;
  };
})();