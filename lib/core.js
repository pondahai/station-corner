/* ============================================================
 * core.js — 渲染器 / 天空 / 环境 / 灯光 / 相机 / 动画循环
 * 导出 window.S（场景状态 + 几何助手 + 动态效果注册表）
 * ============================================================ */
(function () {
  'use strict';
  const S = window.S = {
    t: 0, dt: 0,
    updates: [],   // fn(t, dt)
    sway: [],      // {obj, base, amp, speed, phase, axis}
    breathe: [],   // {mat, base, amp, speed, phase}
    glass: []      // {mat, base, amp, speed, phase}
  };
  window.M = window.M || {};

  /* ---------- 渲染器 ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const canvas = renderer.domElement;
  canvas.style.display = 'block';
  canvas.style.cursor = 'grab';
  document.body.appendChild(canvas);
  S.renderer = renderer;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe9e6d9, 46, 170);
  S.scene = scene;

  const camera = new THREE.PerspectiveCamera(41, window.innerWidth / window.innerHeight, 0.1, 400);
  S.camera = camera;

  /* ---------- 太阳 / 灯光 ---------- */
  const SUN_DIR = new THREE.Vector3(0.62, 0.72, 0.42).normalize();
  const sun = new THREE.DirectionalLight(0xfff1dc, 1.9);
  sun.position.copy(SUN_DIR).multiplyScalar(46);
  sun.target.position.set(-2, 0, -2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -24; sun.shadow.camera.right = 24;
  sun.shadow.camera.top = 24; sun.shadow.camera.bottom = -24;
  sun.shadow.camera.near = 5; sun.shadow.camera.far = 110;
  sun.shadow.bias = -0.00045;
  sun.shadow.normalBias = 0.02;
  scene.add(sun); scene.add(sun.target);
  S.sun = sun;

  const hemi = new THREE.HemisphereLight(0xbcd7f0, 0xcfc2ae, 0.62);
  scene.add(hemi);
  const amb = new THREE.AmbientLight(0xfff2e4, 0.24);
  scene.add(amb);

  /* ---------- 环境反射（程序化等距柱状环境图 → PMREM） ---------- */
  (function () {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.0, '#8fb8dd');
    g.addColorStop(0.35, '#cfe2ee');
    g.addColorStop(0.5, '#f2e8d4');
    g.addColorStop(0.55, '#e6d9bf');
    g.addColorStop(1.0, '#8f8a78');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 256);
    // 太阳亮斑
    const sg = ctx.createRadialGradient(330, 88, 4, 330, 88, 90);
    sg.addColorStop(0, 'rgba(255,244,214,0.95)');
    sg.addColorStop(0.25, 'rgba(255,240,205,0.5)');
    sg.addColorStop(1, 'rgba(255,240,205,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, 512, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.mapping = THREE.EquirectangularReflectionMapping;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromEquirectangular(tex);
    scene.environment = envRT.texture;
    pmrem.dispose();
  })();

  /* ---------- 天空穹顶（ShaderMaterial，显示空间色彩） ---------- */
  (function () {
    const geo = new THREE.SphereGeometry(180, 32, 20);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color(0x8fb6de) },
        mid: { value: new THREE.Color(0xd6e6f2) },
        bot: { value: new THREE.Color(0xf6ecdb) },
        sunDir: { value: SUN_DIR }
      },
      vertexShader: [
        'varying vec3 vDir;',
        'void main(){',
        '  vDir = normalize(position);',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vDir;',
        'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform vec3 sunDir;',
        'void main(){',
        '  float h = clamp(vDir.y, -0.12, 1.0);',
        '  vec3 col = mix(bot, mid, smoothstep(-0.03, 0.16, h));',
        '  col = mix(col, top, smoothstep(0.14, 0.72, h));',
        '  float d = max(dot(normalize(vDir), sunDir), 0.0);',
        '  col += vec3(1.0, 0.93, 0.8) * (pow(d, 420.0) * 1.1 + pow(d, 30.0) * 0.22 + pow(d, 6.0) * 0.05);',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n')
    });
    const sky = new THREE.Mesh(geo, mat);
    sky.userData.noOutline = true;
    scene.add(sky);
  })();

  /* 太阳空气光晕（加色精灵） */
  (function () {
    const mat = new THREE.SpriteMaterial({
      map: T.glow(), color: 0xfff2d8,
      blending: THREE.AdditiveBlending, transparent: true, opacity: 0.5, depthWrite: false
    });
    const sp = new THREE.Sprite(mat);
    sp.position.copy(SUN_DIR).multiplyScalar(150);
    sp.scale.set(90, 90, 1);
    sp.userData.noOutline = true;
    scene.add(sp);
  })();

  /* ---------- 动画注册 ---------- */
  S.addUpdate = function (fn) { S.updates.push(fn); };
  S.addSway = function (o) {
    o.base = o.base !== undefined ? o.base : (o.obj.rotation[o.axis || 'z']);
    o.phase = o.phase !== undefined ? o.phase : Math.random() * 6.2832;
    o.speed = o.speed !== undefined ? o.speed : 0.9;
    o.amp = o.amp !== undefined ? o.amp : 0.02;
    S.sway.push(o);
  };
  S.addBreathe = function (o) {
    o.base = o.mat.emissiveIntensity;
    o.phase = o.phase !== undefined ? o.phase : Math.random() * 6.2832;
    o.speed = o.speed !== undefined ? o.speed : 0.7;
    o.amp = o.amp !== undefined ? o.amp : 0.25;
    S.breathe.push(o);
  };
  S.addGlass = function (o) {
    o.base = o.mat.envMapIntensity;
    o.phase = o.phase !== undefined ? o.phase : Math.random() * 6.2832;
    o.speed = o.speed !== undefined ? o.speed : 0.5;
    o.amp = o.amp !== undefined ? o.amp : 0.18;
    S.glass.push(o);
  };

  /* ---------- 几何助手 ---------- */
  function base(mesh, o) {
    o = o || {};
    if (o.rx) mesh.rotation.x = o.rx;
    if (o.ry) mesh.rotation.y = o.ry;
    if (o.rz) mesh.rotation.z = o.rz;
    mesh.castShadow = o.cast !== false;
    mesh.receiveShadow = o.recv !== false;
    if (o.noOutline) mesh.userData.noOutline = true;
    return mesh;
  }
  S.box = function (w, h, d, mat, x, y, z, o) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x || 0, y || 0, z || 0);
    return base(m, o);
  };
  S.cyl = function (rt, rb, h, mat, x, y, z, o) {
    o = o || {};
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg || 24, 1, o.open || false, o.ts || 0, o.tl !== undefined ? o.tl : Math.PI * 2), mat);
    m.position.set(x || 0, y || 0, z || 0);
    return base(m, o);
  };
  S.sph = function (r, mat, x, y, z, o) {
    o = o || {};
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, o.w || 18, o.h || 12), mat);
    m.position.set(x || 0, y || 0, z || 0);
    if (o.sx || o.sy || o.sz) m.scale.set(o.sx || 1, o.sy || 1, o.sz || 1);
    return base(m, o);
  };
  S.torus = function (R, tube, mat, x, y, z, o) {
    o = o || {};
    const m = new THREE.Mesh(new THREE.TorusGeometry(R, tube, o.rseg || 8, o.tseg || 28, o.arc !== undefined ? o.arc : Math.PI * 2), mat);
    m.position.set(x || 0, y || 0, z || 0);
    return base(m, o);
  };
  S.lathe = function (pts, mat, x, y, z, o) {
    o = o || {};
    const v2 = pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); });
    const m = new THREE.Mesh(new THREE.LatheGeometry(v2, o.seg || 20), mat);
    m.position.set(x || 0, y || 0, z || 0);
    return base(m, o);
  };
  S.planeH = function (w, h, mat, x, y, z, o) {
    o = o || {};
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x || 0, y || 0, z || 0);
    if (o.ry) m.rotation.y = o.ry;
    return base(m, o);
  };
  S.plane = function (w, h, mat, x, y, z, o) {
    o = o || {};
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x || 0, y || 0, z || 0);
    return base(m, o);
  };
  /* 锥形管（树干/枝条/受电杆）：沿曲线半径渐变 */
  S.taperTube = function (pts, r0, r1, mat, x, y, z, o) {
    o = o || {};
    const seg = o.seg || 14, radial = o.radial || 9;
    const curve = new THREE.CatmullRomCurve3(pts);
    const frames = curve.computeFrenetFrames(seg, false);
    const pos = [], nor = [], idx = [];
    for (let i = 0; i <= seg; i++) {
      const t = i / seg;
      const P = curve.getPoint(t);
      const N = frames.normals[i], B = frames.binormals[i];
      const r = r0 + (r1 - r0) * t;
      for (let j = 0; j <= radial; j++) {
        const a = j / radial * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        pos.push(P.x + (N.x * ca + B.x * sa) * r, P.y + (N.y * ca + B.y * sa) * r, P.z + (N.z * ca + B.z * sa) * r);
        nor.push(N.x * ca + B.x * sa, N.y * ca + B.y * sa, N.z * ca + B.z * sa);
      }
    }
    for (let i = 0; i < seg; i++) for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setIndex(idx);
    const m = new THREE.Mesh(g, mat);
    m.position.set(x || 0, y || 0, z || 0);
    return base(m, o);
  };
  /* 圆环段（挡泥板/弯梁） */
  S.tubeAlong = function (pts, r, mat, x, y, z, o) {
    o = o || {};
    const curve = new THREE.CatmullRomCurve3(pts);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, o.seg || 20, r, 9, false), mat);
    m.position.set(x || 0, y || 0, z || 0);
    return base(m, o);
  };

  /* 描边快捷方式 */
  S.outline = function (obj, w) { MTL.outlineAdd(obj, w); };

  /* 光晕精灵 */
  S.glow = function (color, size, opacity, x, y, z) {
    const mat = new THREE.SpriteMaterial({
      map: T.glow(), color: color,
      blending: THREE.AdditiveBlending, transparent: true, opacity: opacity !== undefined ? opacity : 0.5, depthWrite: false
    });
    const sp = new THREE.Sprite(mat);
    sp.position.set(x || 0, y || 0, z || 0);
    sp.scale.set(size, size, 1);
    sp.userData.noOutline = true;
    scene.add(sp);
    return sp;
  };

  /* 实例化助手 */
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p3 = new THREE.Vector3(),
    _s3 = new THREE.Vector3(), _e = new THREE.Euler();
  S.setInst = function (im, i, x, y, z, rx, ry, rz, sx, sy, sz) {
    _p3.set(x, y, z);
    _e.set(rx || 0, ry || 0, rz || 0);
    _q.setFromEuler(_e);
    _s3.set(sx === undefined ? 1 : sx, sy === undefined ? 1 : sy, sz === undefined ? 1 : sz);
    _m4.compose(_p3, _q, _s3);
    im.setMatrixAt(i, _m4);
  };
  S.inst = function (geo, mat, count, parent) {
    const im = new THREE.InstancedMesh(geo, mat, count);
    im.castShadow = false;
    im.receiveShadow = false;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if (parent) parent.add(im);
    return im;
  };

  /* ---------- 相机控制器（拖拽旋转 / 无极缩放 / 阻尼） ---------- */
  (function () {
    const cam = {
      target: new THREE.Vector3(-0.5, -0.3, -0.4),
      theta: 0.205, phi: 0.78, radius: 46,
      gTheta: 0.205, gPhi: 0.78, gRadius: 46
    };
    S.cam = cam;
    let dragging = false, px = 0, py = 0;
    const touches = {};

    canvas.addEventListener('pointerdown', function (e) {
      if (S.fps && S.fps.on) return;
      if (e.pointerType === 'touch') {
        touches[e.pointerId] = { x: e.clientX, y: e.clientY };
        const ids = Object.keys(touches);
        if (ids.length === 2) { dragging = false; }
        return;
      }
      dragging = true; px = e.clientX; py = e.clientY;
      canvas.style.cursor = 'grabbing';
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    });
    window.addEventListener('pointermove', function (e) {
      if (S.fps && S.fps.on) return;
      if (e.pointerType === 'touch') {
        const t = touches[e.pointerId];
        if (!t) return;
        const ids = Object.keys(touches);
        if (ids.length === 1) {
          cam.gTheta -= (e.clientX - t.x) * 0.0052;
          cam.gPhi -= (e.clientY - t.y) * 0.0052;
        } else if (ids.length === 2) {
          const a = touches[ids[0]], b = touches[ids[1]];
          const d0 = Math.hypot(a.x - b.x, a.y - b.y);
          t.x = e.clientX; t.y = e.clientY;
          const p = touches[ids[0] === String(e.pointerId) ? ids[1] : ids[0]];
          const d1 = Math.hypot(t.x - p.x, t.y - p.y);
          if (d0 > 0 && d1 > 0) cam.gRadius *= d0 / d1;
        }
        t.x = e.clientX; t.y = e.clientY;
        return;
      }
      if (!dragging) return;
      cam.gTheta -= (e.clientX - px) * 0.0052;
      cam.gPhi -= (e.clientY - py) * 0.0052;
      px = e.clientX; py = e.clientY;
    });
    window.addEventListener('pointerup', function (e) {
      if (e.pointerType === 'touch') { delete touches[e.pointerId]; return; }
      dragging = false;
      canvas.style.cursor = 'grab';
    });
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (S.fps && S.fps.on) return;
      cam.gRadius *= Math.exp((e.deltaY > 0 ? 1 : -1) * Math.min(Math.abs(e.deltaY), 120) * 0.0016);
    }, { passive: false });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
    S.addUpdate(function (t, dt) {
      if (S.fps && S.fps.on) return;
      cam.gPhi = clamp(cam.gPhi, 0.17, 1.5);
      cam.gRadius = clamp(cam.gRadius, 4.5, 46);
      const k = 1 - Math.exp(-9 * dt);
      cam.theta += (cam.gTheta - cam.theta) * k;
      cam.phi += (cam.gPhi - cam.phi) * k;
      cam.radius += (cam.gRadius - cam.radius) * k;
      const sp = Math.sin(cam.phi), cp = Math.cos(cam.phi);
      camera.position.set(
        cam.target.x + cam.radius * sp * Math.sin(cam.theta),
        cam.target.y + cam.radius * cp,
        cam.target.z + cam.radius * sp * Math.cos(cam.theta)
      );
      camera.lookAt(cam.target);
    });
  })();

  /* ---------- 第一人称行走 / 跳跃（F 切换，鼠标指针锁定视角） ---------- */
  (function () {
    var EYE = 1.62, WALK = 3.4, RUN = 6.2, GRAV = 10.0, JUMP = 3.7;
    var PR = 0.34, BOUND = 12.55;
    /* 固体碰撞盒 [minX, maxX, minZ, maxZ]（可穿过则不列） */
    var SOLIDS = [
      [-9.0, 0.8, 1.0, 1.1],       // 便利店正面左段（x 0.8~2.4 留自動門缺口）
      [2.4, 3.0, 1.0, 1.1],        // 便利店正面右段
      [-9.0, 3.0, -6.6, -6.5],     // 便利店後牆
      [-9.1, -9.0, -6.5, 1.0],     // 便利店左牆
      [3.0, 3.1, -6.5, 1.0],       // 便利店右牆
      [-13.0, -10.2, -5.0, 1.0],   // 邻家独栋
      [-5.3, 1.7, 5.75, 8.45]      // 电车（停在主路）
    ];
    function groundY(x, z) {
      if (x >= -6.5 && x <= 3.0 && z >= 1.7 && z <= 4.2) return 0.18; // 站台
      return 0;
    }
    function start() {
      return { x: 1.6, z: 4.0, y: groundY(1.6, 4.0), yaw: 0, pitch: -0.05, vy: 0, grounded: true };
    }
    var fps = S.fps = start();
    var keys = {};

    function enter() {
      if (fps.on) return;
      var s = start();
      fps.x = s.x; fps.z = s.z; fps.y = s.y; fps.yaw = s.yaw; fps.pitch = s.pitch; fps.vy = s.vy; fps.grounded = s.grounded;
      fps.on = true;
      try { canvas.requestPointerLock(); } catch (e) {}
    }
    function exit() {
      if (!fps.on) return;
      fps.on = false;
      canvas.style.cursor = 'grab';
      try { if (document.pointerLockElement === canvas) document.exitPointerLock(); } catch (e) {}
    }
    S.toggleFps = function () { if (fps.on) exit(); else enter(); };

    window.addEventListener('keydown', function (e) {
      if (e.code === 'KeyF') { e.preventDefault(); S.toggleFps(); return; }
      keys[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
    });
    window.addEventListener('keyup', function (e) { keys[e.code] = false; });

    window.addEventListener('mousemove', function (e) {
      if (!fps.on || document.pointerLockElement !== canvas) return;
      fps.yaw -= e.movementX * 0.0024;
      fps.pitch = Math.max(-1.45, Math.min(1.45, fps.pitch - e.movementY * 0.0024));
    });

    document.addEventListener('pointerlockchange', function () {
      if (document.pointerLockElement !== canvas && fps.on) exit();
    });

    function collide(x, z) {
      for (var k = 0; k < SOLIDS.length; k++) {
        var a = SOLIDS[k];
        var cx = Math.max(a[0], Math.min(x, a[1]));
        var cz = Math.max(a[2], Math.min(z, a[3]));
        var dx = x - cx, dz = z - cz, d2 = dx * dx + dz * dz;
        if (d2 < PR * PR) {
          var d = Math.sqrt(d2) || 0.0001, p = (PR - d) / d;
          x += dx * p; z += dz * p;
        }
      }
      return [x, z];
    }

    S.addUpdate(function (t, dt) {
      if (!fps.on) return;
      var run = keys['ShiftLeft'] || keys['ShiftRight'];
      var sp = (run ? RUN : WALK) * dt;
      var f = (keys['KeyW'] ? 1 : 0) - (keys['KeyS'] ? 1 : 0);
      var s = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
      var sin = Math.sin(fps.yaw), cos = Math.cos(fps.yaw);
      fps.x += (-sin * f + cos * s) * sp;
      fps.z += (-cos * f - sin * s) * sp;
      fps.x = Math.max(-BOUND, Math.min(BOUND, fps.x));
      fps.z = Math.max(-BOUND, Math.min(BOUND, fps.z));
      var c = collide(fps.x, fps.z); fps.x = c[0]; fps.z = c[1];
      if (keys['Space'] && fps.grounded) { fps.vy = JUMP; fps.grounded = false; }
      fps.vy -= GRAV * dt;
      fps.y += fps.vy * dt;
      var g = groundY(fps.x, fps.z);
      if (fps.y <= g) { fps.y = g; fps.vy = 0; fps.grounded = true; }
      else if (fps.vy < 0) fps.grounded = false;
      camera.position.set(fps.x, fps.y + EYE, fps.z);
      camera.rotation.set(fps.pitch, fps.yaw, 0, 'YXZ');
    });
  })();

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------- 主循环 ---------- */
  const clock = new THREE.Clock();
  S.clock = clock;
  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    S.t += dt; S.dt = dt;
    const t = S.t;
    for (let i = 0; i < S.updates.length; i++) S.updates[i](t, dt);
    for (let i = 0; i < S.sway.length; i++) {
      const s = S.sway[i];
      s.obj.rotation[s.axis || 'z'] = s.base + Math.sin(t * s.speed + s.phase) * s.amp;
    }
    for (let i = 0; i < S.breathe.length; i++) {
      const b = S.breathe[i];
      const v = 0.5 + 0.5 * Math.sin(t * b.speed + b.phase);
      b.mat.emissiveIntensity = b.base * (1 - b.amp) + b.base * b.amp * v;
    }
    for (let i = 0; i < S.glass.length; i++) {
      const g = S.glass[i];
      g.mat.envMapIntensity = g.base + Math.sin(t * g.speed + g.phase) * g.amp;
    }
    renderer.render(scene, camera);
  }
  tick();
})();