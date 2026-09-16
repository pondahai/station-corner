/* ============================================================
 * scene.js — 场景装配
 * 街道 → 建筑 → 内部 → 外设 → 樱花 → 花瓣系统
 * 世界坐标见 street.js 布局注释（底座顶 y=0，底座 26.4×26.4）
 * ============================================================ */
(function () {
  'use strict';
  var scene = S.scene;

  /* ---------- 街道 / 建筑 / 内部 ---------- */
  scene.add(M.street());
  scene.add(M.building());
  scene.add(M.interior());
  scene.add(M.house());
  scene.add(M.utilitySpan());

  /* ---------- 电车 + 候车亭 ---------- */
  scene.add(M.tram({ x: -1.75, z: 7.1 }));
  scene.add(M.tramStop());

  /* ---------- 自动贩卖机（站台内，入口左侧） ---------- */
  var vm = M.vendingMachine({ x: -2.4, z: 2.6 });
  vm.position.y = 0.18;
  scene.add(vm);

  /* ---------- 路灯 ×3 ---------- */
  scene.add(M.streetlight({ x: 11.6, z: 11.6, ry: Math.PI / 2 }));  // 东北角，灯臂朝主路
  scene.add(M.streetlight({ x: 11.9, z: -4.9, ry: Math.PI }));      // 东侧，灯臂朝次路
  scene.add(M.streetlight({ x: -12.4, z: -6.0 }));                  // 西侧，灯臂朝店前

  /* ---------- 信号灯 ---------- */
  scene.add(M.trafficLight({ x: 11.6, z: 1.4, ry: -Math.PI / 2 })); // 车行，朝西迎次路南进口
  scene.add(M.pedSignal({ x: 11.2, z: 3.6, ry: -Math.PI / 2 }));    // 人行，次路斑马线东端

  /* ---------- 标识 ---------- */
  scene.add(M.streetSignPole({ x: 3.6, z: 3.8 }));                  // 路口西南角路名牌
  scene.add(M.tramDirectionSign({ x: -5.5, y: 0.18, z: 3.8 }));     // 站台西端方向牌
  scene.add(M.aBoard({ x: 2.7, y: 0.18, z: 2.0 }));                 // 入口右侧 A 字板

  /* ---------- 店前 ---------- */
  scene.add(M.umbrellaStand({ x: -0.15, z: 1.3 }));                 // 入口左侧伞架
  scene.add(M.trashBin({ x: 1.15, y: 0.18, z: 3.75 }));
  scene.add(M.trashBin({ x: 1.6, y: 0.18, z: 3.6, color: 0x5a6470 }));
  scene.add(M.flowerPot({ x: -1.1, z: 1.35 }));
  scene.add(M.flowerPot({ x: 3.4, z: 1.35, color: 0xf2c94c }));

  /* ---------- 自行车架 ---------- */
  scene.add(M.bicycle({ x: -7.85, z: 2.3, ry: 0.35, color: 0x8a4a5a }));

  /* ---------- 樱花 ---------- */
  scene.add(M.cherryTree({ x: -8.5, z: 12.0, kind: 'yoshino', seed: 21 }));
  scene.add(M.cherryTree({ x: -3.5, z: 12.0, kind: 'yoshino', seed: 22 }));
  scene.add(M.cherryTree({ x: 1.5, z: 12.0, kind: 'yoshino', seed: 23 }));
  scene.add(M.cherryTree({ x: 12.0, z: -7.5, kind: 'ozaki', seed: 24 }));
  scene.add(M.cherryTree({ x: 12.0, z: -10.3, kind: 'ozaki', seed: 25 }));
  scene.add(M.cherryTree({ x: 11.9, z: 3.5, kind: 'small', seed: 26 }));

  /* ---------- 花瓣系统 ---------- */
  P.init();
})();