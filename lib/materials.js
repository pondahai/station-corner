/* ============================================================
 * materials.js — 三渲二材质工厂 + 轮廓描边
 * 导出 window.MTL
 * ============================================================ */
(function () {
  'use strict';
  const M = window.MTL = {};

  /* toon 分段渐变图（4 阶：暗→次暗→次亮→亮） */
  const gradData = new Uint8Array([64, 128, 189, 255]);
  const gradTex = new THREE.DataTexture(gradData, 4, 1, THREE.LuminanceFormat);
  gradTex.magFilter = THREE.NearestFilter;
  gradTex.minFilter = THREE.NearestFilter;
  gradTex.needsUpdate = true;
  M.grad = gradTex;

  /* toon 漫反射主体材质 */
  M.toon = function (color, o) {
    o = o || {};
    const m = new THREE.MeshToonMaterial({ color: color, gradientMap: gradTex });
    if (o.map) m.map = o.map;
    if (o.bump) { m.bumpMap = o.bump; m.bumpScale = o.bumpScale || 0.6; }
    if (o.emissive !== undefined) m.emissive = new THREE.Color(o.emissive);
    if (o.ei !== undefined) m.emissiveIntensity = o.ei;
    if (o.side) m.side = o.side;
    if (o.alpha !== undefined) { m.transparent = true; m.opacity = o.alpha; }
    return m;
  };

  /* 标准 PBR（金属/玻璃/湿润感） */
  M.std = function (color, o) {
    o = o || {};
    const m = new THREE.MeshStandardMaterial({ color: color });
    if (o.map) m.map = o.map;
    if (o.bump) { m.bumpMap = o.bump; m.bumpScale = o.bumpScale || 0.4; }
    m.roughness = o.rough !== undefined ? o.rough : 0.7;
    m.metalness = o.metal !== undefined ? o.metal : 0.0;
    if (o.emissive !== undefined) m.emissive = new THREE.Color(o.emissive);
    if (o.ei !== undefined) m.emissiveIntensity = o.ei;
    if (o.env !== undefined) m.envMapIntensity = o.env;
    if (o.side) m.side = o.side;
    if (o.alpha !== undefined) { m.transparent = true; m.opacity = o.alpha; }
    return m;
  };

  /* 玻璃：透明 + 环境反射（r128 无 transmission 管线，用透明度方案） */
  M.glass = function (color, opacity, o) {
    o = o || {};
    const m = new THREE.MeshPhysicalMaterial({
      color: color !== undefined ? color : 0xd9edf5,
      transparent: true,
      opacity: opacity !== undefined ? opacity : 0.14,
      roughness: 0.05,
      metalness: 0,
      clearcoat: 0.65,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.35,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    if (o.side) m.side = o.side;
    return m;
  };

  /* 金属 */
  M.metal = function (color, rough) {
    return M.std(color, { rough: rough !== undefined ? rough : 0.32, metal: 1.0, env: 1.1 });
  };

  /* 塑胶：标准 + 低金属 */
  M.plastic = function (color, o) {
    o = o || {};
    const m = M.toon(color, o);
    return m;
  };

  M.basic = function (color, o) {
    o = o || {};
    const m = new THREE.MeshBasicMaterial({ color: color });
    if (o.map) m.map = o.map;
    if (o.side) m.side = o.side;
    if (o.alpha !== undefined) { m.transparent = true; m.opacity = o.alpha; }
    return m;
  };

  /* 发光面（灯箱/灯带）：用 toon 自发光，参与呼吸动画 */
  M.emissive = function (color, ei, o) {
    o = o || {};
    return M.toon(o.base !== undefined ? o.base : color, { emissive: color, ei: ei !== undefined ? ei : 1.4 });
  };

  /* ---------- 轮廓描边（背面法线外扩） ---------- */
  const outlineCache = {};
  M.outline = function (w) {
    w = w || 0.024;
    const k = String(Math.round(w * 10000));
    if (!outlineCache[k]) {
      outlineCache[k] = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          c: { value: new THREE.Color(0x332820) },
          w: { value: w }
        },
        vertexShader: 'uniform float w; void main(){ vec3 p = position + normal * w; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
        fragmentShader: 'uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.0); }'
      });
    }
    return outlineCache[k];
  };

  /* 给物体（或物体内的所有 Mesh）添加描边子网格 */
  M.outlineAdd = function (obj, w) {
    const mat = M.outline(w);
    const list = [];
    if (obj.isMesh) list.push(obj);
    else obj.traverse(function (n) { if (n.isMesh) list.push(n); });
    list.forEach(function (mesh) {
      if (mesh.isInstancedMesh || mesh.userData.noOutline || mesh.userData.isOutline) return;
      const om = new THREE.Mesh(mesh.geometry, mat);
      om.userData.isOutline = true;
      om.castShadow = false;
      om.receiveShadow = false;
      om.raycast = function () {};
      mesh.add(om);
    });
  };

  /* 食物材质 */
  M.rice = M.toon(0xf9f5ea);
  M.nori = M.std(0x25362b, { rough: 0.5, metal: 0 });
  M.sushiTop = M.toon(0xf3efe2);
  M.egg = M.toon(0xf6f0dc);
  M.fishcake = M.toon(0xf2efe6);
})();