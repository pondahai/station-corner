/* ============================================================
 * products.js — 商品原型 + 货架实例化填充
 * 导出 window.PRD
 * 约定：所有坐标为调用方传入的局部坐标（相对货架组），y 为层板面高度（商品落点）
 * ============================================================ */
(function () {
  'use strict';
  const PRD = window.PRD = {};

  /* ---------- 色板 ---------- */
  const PAL = {
    bottle: [0x2f6e4e, 0x7a2f2f, 0x2a4a8f, 0xc99a3f, 0x3f8f88, 0xb05a78, 0x4a6a3a, 0x8a4a2f],
    soda:   [0x2f6e4e, 0x2a4a8f, 0x3f8f88, 0x8a2f3f, 0xb8a23f],
    juice:  [0xe8862f, 0xd85a5a, 0x8fae3a, 0xd8a84c, 0x9a5ac8],
    can:    [0xc23a3a, 0x3a86c8, 0xd8c44c, 0x4aa86a, 0x8a5ac8, 0xe87a3a, 0x3aa8b8, 0xb84a7a],
    boxA:   [0xd86a4a, 0x4a86c8, 0x5ab87a, 0xc84a8a, 0xe0a83a, 0x7a5ad8],
    pack:   [0xe8b83a, 0xd85a3a, 0x5ab8a8, 0xc84a6a, 0x8a6ac8, 0x5a9ac8],
    cup:    [0xf2ece0, 0xf2ece0, 0xd8e4ec, 0xe8d8d0, 0xf2e8dc],
    mag:    [0xd86a5a, 0x5a8ad8, 0x5ab88a, 0xd8a84c, 0x9a6ad8, 0xd87ab0]
  };

  /* ---------- 几何原型（原点在地面，+y 向上） ---------- */
  function bottleGeo() {
    // 瓶身 lathe：底 -> 身 -> 肩 -> 颈
    const pts = [
      [0.000, 0.000], [0.026, 0.000], [0.030, 0.008], [0.031, 0.05],
      [0.030, 0.145], [0.024, 0.175], [0.0155, 0.19], [0.0145, 0.215],
      [0.0165, 0.225], [0.0165, 0.245], [0.000, 0.245]
    ];
    return new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), 14);
  }
  function canGeo() {
    // 罐身：微鼓 + 顶底收口
    const pts = [
      [0.0, 0.0], [0.030, 0.002], [0.0335, 0.012], [0.0345, 0.06],
      [0.0335, 0.108], [0.030, 0.118], [0.0, 0.12]
    ];
    return new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), 18);
  }
  function boxGeo() {
    const g = new THREE.BoxGeometry(0.052, 0.17, 0.04);
    g.translate(0, 0.085, 0);
    return g;
  }
  function packGeo() {
    const g = new THREE.BoxGeometry(0.056, 0.05, 0.155);
    g.translate(0, 0.025, 0);
    return g;
  }
  function cupGeo() {
    const g = new THREE.CylinderGeometry(0.034, 0.027, 0.095, 14, 1, true);
    g.translate(0, 0.0475, 0);
    // 封口顶
    const top = new THREE.CircleGeometry(0.034, 14);
    top.rotateX(-Math.PI / 2); top.translate(0, 0.095, 0);
    return merge2(g, top);
  }
  function magGeo() {
    const g = new THREE.BoxGeometry(0.016, 0.2, 0.145);
    g.translate(0, 0.1, 0);
    return g;
  }
  function cartonGeo() { // 牛奶纸盒
    const g = new THREE.BoxGeometry(0.046, 0.2, 0.06);
    g.translate(0, 0.1, 0);
    return g;
  }
  function tubeGeo() { // 冰淇淋棒/冰品条
    const g = new THREE.BoxGeometry(0.03, 0.045, 0.14);
    g.translate(0, 0.0225, 0);
    return g;
  }
  /* 简易合并两个 BufferGeometry（r128 无 BufferGeometryUtils，手动拼） */
  function merge2(ga, gb) {
    const pa = ga.attributes.position, pb = gb.attributes.position;
    const pos = new Float32Array(pa.count * 3 + pb.count * 3);
    pos.set(pa.array, 0); pos.set(pb.array, pa.count * 3);
    const na = ga.attributes.normal, nb = gb.attributes.normal;
    const nor = new Float32Array(na.count * 3 + nb.count * 3);
    nor.set(na.array, 0); nor.set(nb.array, na.count * 3);
    const idx = [];
    const ia = ga.index, ib = gb.index;
    if (ia) {
      for (let i = 0; i < ia.count; i++) idx.push(ia.getX(i));
      for (let i = 0; i < ib.count; i++) idx.push(pb.count + ib.getX(i));
    } else {
      for (let i = 0; i < pa.count; i++) idx.push(i);
      for (let i = 0; i < pb.count; i++) idx.push(pa.count + i);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setIndex(idx);
    return g;
  }
  PRD.geo = {
    bottle: bottleGeo(), can: canGeo(), box: boxGeo(), pack: packGeo(),
    cup: cupGeo(), mag: magGeo(), carton: cartonGeo(), tube: tubeGeo()
  };

  /* ---------- 材质（基底白色，实例色相乘） ---------- */
  const MATS = {
    bottle: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.14, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.2, transparent: true, opacity: 0.92, envMapIntensity: 0.9 }),
    soda: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.12, metalness: 0, clearcoat: 0.7, transparent: true, opacity: 0.9, envMapIntensity: 1.0 }),
    juice: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0, clearcoat: 0.4, transparent: true, opacity: 0.94, envMapIntensity: 0.8 }),
    can: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.28, metalness: 0.85, envMapIntensity: 1.0 }),
    box: MTL.toon(0xffffff),
    pack: MTL.toon(0xffffff),
    cup: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0 }),
    mag: MTL.toon(0xffffff),
    carton: MTL.toon(0xffffff),
    tube: MTL.toon(0xffffff),
    cap: MTL.toon(0x2a2a30, { rough: undefined }),
    lid: new THREE.MeshStandardMaterial({ color: 0xd8d8dc, roughness: 0.3, metalness: 0.9 }),
    ice: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, clearcoat: 0.8, transparent: true, opacity: 0.96 })
  };
  PRD.mats = MATS;

  /* ---------- 主填充函数 ----------
   * o = { parent, kind, x0, x1, z, y, rows, rowGap, pitch, seed, palette, ry, lean }
   * kind: bottle|soda|juice|can|box|pack|cup|mag|carton|tube
   */
  PRD.fillShelf = function (o) {
    const rnd = T.rng((o.seed !== undefined ? o.seed : 1) * 7919);
    const kind = o.kind;
    const geo = PRD.geo[kind];
    if (!geo) return;
    const mat = MATS[kind] || MATS.box;
    const pal = o.palette || PAL[kind] || PAL.boxA;
    const pitch = o.pitch || 0.072;
    const rows = o.rows || 1;
    const rowGap = o.rowGap || 0.06;
    const n = Math.max(0, Math.floor((o.x1 - o.x0 + pitch * 0.8) / pitch));
    if (n <= 0) return;
    const im = new THREE.InstancedMesh(geo, mat, n * rows);
    im.castShadow = false; im.receiveShadow = false;
    const col = new THREE.Color();
    let i = 0;
    const h = kindHeight(kind);
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < n; k++) {
        const x = o.x0 + k * pitch + (rnd() - 0.5) * 0.006;
        const z = o.z + (r - (rows - 1) / 2) * rowGap + (rnd() - 0.5) * 0.004;
        const ry = (o.ry || 0) + (rnd() - 0.5) * (kind === 'mag' ? 0.5 : 0.14);
        const y = o.y + (rnd() - 0.5) * 0.002;
        S.setInst(im, i, x, y, z, 0, ry, 0, 1, 1, 1);
        col.setHex(pal[Math.floor(rnd() * pal.length)]);
        // 轻微明度抖动
        const j = 0.92 + rnd() * 0.12;
        col.multiplyScalar(j);
        im.setColorAt(i, col);
        i++;
      }
    }
    im.count = i;
    if (im.instanceColor) im.instanceColor.needsUpdate = true;
    o.parent.add(im);
    // 瓶盖（瓶类）
    if (kind === 'bottle' || kind === 'soda' || kind === 'juice' || kind === 'carton') {
      const capG = kind === 'carton' ? new THREE.CylinderGeometry(0.014, 0.014, 0.012, 10) : new THREE.CylinderGeometry(0.0125, 0.0135, 0.016, 10);
      capG.translate(0, h - 0.004, 0);
      const capM = kind === 'carton' ? MATS.lid : MATS.cap;
      const cim = new THREE.InstancedMesh(capG, capM, i);
      cim.castShadow = false; cim.receiveShadow = false;
      // 复用同样的变换：重建一遍
      const rnd2 = T.rng((o.seed !== undefined ? o.seed : 1) * 7919);
      let j2 = 0;
      for (let r = 0; r < rows; r++) {
        for (let k = 0; k < n; k++) {
          const x = o.x0 + k * pitch + (rnd2() - 0.5) * 0.006;
          const z = o.z + (r - (rows - 1) / 2) * rowGap + (rnd2() - 0.5) * 0.004;
          const ry = (o.ry || 0) + (rnd2() - 0.5) * 0.14;
          S.setInst(cim, j2, x, o.y, z, 0, ry, 0, 1, 1, 1);
          j2++;
        }
      }
      o.parent.add(cim);
    }
    return im;
  };

  function kindHeight(kind) {
    switch (kind) {
      case 'bottle': case 'soda': case 'juice': return 0.245;
      case 'can': return 0.12;
      case 'box': return 0.17;
      case 'pack': return 0.05;
      case 'cup': return 0.095;
      case 'mag': return 0.2;
      case 'carton': return 0.2;
      case 'tube': return 0.045;
      default: return 0.15;
    }
  }
  PRD.height = kindHeight;

  /* ---------- 单件精品商品（带标签纹理，非实例化） ---------- */
  PRD.heroBottle = function (parent, o) {
    o = o || {};
    const g = new THREE.Group();
    const c = o.color || 0x2f6e4e;
    const body = new THREE.Mesh(PRD.geo.bottle, MTL.toon(c, {
      map: T.canLabel(o.mapColor || '#' + c.toString(16).padStart(6, '0'), o.seed || 1)
    }));
    body.castShadow = true;
    g.add(body);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0135, 0.018, 10), MATS.cap);
    cap.position.y = 0.238;
    g.add(cap);
    g.position.set(o.x || 0, o.y || 0, o.z || 0);
    if (o.ry) g.rotation.y = o.ry;
    parent.add(g);
    return g;
  };
})();