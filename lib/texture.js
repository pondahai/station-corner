/* ============================================================
 * texture.js — 程序化 Canvas 纹理库（确定性种子，离线可用）
 * 导出 window.T
 * ============================================================ */
(function () {
  'use strict';
  const T = window.T = {};
  const FONT = '"Yu Gothic UI","Yu Gothic","Meiryo","MS Gothic",sans-serif';

  /* ---------- 基础 ---------- */
  T.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  T.canvas = function (w, h, fn, opt) {
    opt = opt || {};
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    if (opt.repeat) { ctx.globalAlpha = 1; }
    fn(ctx, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 8;
    if (opt.repeat) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      if (opt.repeat) tex.repeat.set(opt.repeat[0], opt.repeat[1]);
    }
    return tex;
  };

  function speckle(ctx, w, h, rnd, n, rmin, rmax, aBase) {
    for (let i = 0; i < n; i++) {
      const a = rnd() * aBase;
      ctx.fillStyle = 'rgba(0,0,0,' + a.toFixed(3) + ')';
      const r = rmin + rnd() * (rmax - rmin);
      ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, r, 0, 6.2832); ctx.fill();
    }
    for (let i = 0; i < n * 0.4; i++) {
      const a = rnd() * aBase * 0.7;
      ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')';
      const r = rmin + rnd() * (rmax - rmin) * 0.7;
      ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, r, 0, 6.2832); ctx.fill();
    }
  }

  /* ---------- 地面类 ---------- */
  T.asphalt = function (seed) {
    const rnd = T.rng(seed);
    return T.canvas(512, 512, function (ctx, w, h) {
      ctx.fillStyle = '#47474d'; ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, rnd, 9000, 0.5, 2.2, 0.10);
      // 细微骨料亮点
      for (let i = 0; i < 1500; i++) {
        ctx.fillStyle = 'rgba(210,208,205,' + (rnd() * 0.12).toFixed(3) + ')';
        ctx.fillRect(rnd() * w, rnd() * h, 1.4, 1.4);
      }
      // 油渍 / 修补块
      for (let i = 0; i < 4; i++) {
        const x = rnd() * w, y = rnd() * h, r = 30 + rnd() * 70;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(30,30,34,0.16)');
        g.addColorStop(1, 'rgba(30,30,34,0)');
        ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      // 车辙磨亮带
      ctx.fillStyle = 'rgba(120,118,112,0.05)';
      ctx.fillRect(0, 90, w, 26); ctx.fillRect(0, 330, w, 26);
    }, { repeat: [3, 3] });
  };

  T.paver = function (seed) {
    const rnd = T.rng(seed);
    return T.canvas(512, 512, function (ctx, w, h) {
      ctx.fillStyle = '#b7b1a3'; ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, rnd, 6000, 0.4, 1.6, 0.08);
      const tile = 128;
      for (let ty = 0; ty < 4; ty++) for (let tx = 0; tx < 4; tx++) {
        const off = (ty % 2) * 64;
        const x = tx * tile + off - (ty % 2) * 0, y = ty * tile;
        const tint = (rnd() - 0.5) * 14;
        ctx.fillStyle = 'rgba(' + Math.round(183 + tint) + ',' + Math.round(177 + tint) + ',' + Math.round(163 + tint) + ',1)';
        ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4);
        ctx.strokeStyle = 'rgba(70,66,58,0.5)'; ctx.lineWidth = 2.5;
        ctx.strokeRect(x + 1, y + 1, tile - 2, tile - 2);
        // 单砖风化
        if (rnd() < 0.3) {
          const g = ctx.createRadialGradient(x + tile / 2, y + tile / 2, 4, x + tile / 2, y + tile / 2, 70);
          g.addColorStop(0, 'rgba(90,84,70,0.10)'); g.addColorStop(1, 'rgba(90,84,70,0)');
          ctx.fillStyle = g; ctx.fillRect(x, y, tile, tile);
        }
      }
      // 接缝积尘
      ctx.fillStyle = 'rgba(60,55,45,0.28)';
      for (let i = 0; i <= 4; i++) { ctx.fillRect(0, i * tile - 1, w, 2); ctx.fillRect(i * tile - 1, 0, 2, h); }
    }, { repeat: [4, 4] });
  };

  T.concrete = function (base, seed) {
    const rnd = T.rng(seed);
    return T.canvas(512, 512, function (ctx, w, h) {
      ctx.fillStyle = base || '#c4beb0'; ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, rnd, 7000, 0.4, 1.8, 0.07);
      // 细裂纹
      ctx.strokeStyle = 'rgba(80,76,68,0.20)'; ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        let x = rnd() * w, y = rnd() * h; ctx.moveTo(x, y);
        for (let k = 0; k < 7; k++) { x += (rnd() - 0.5) * 70; y += (rnd() - 0.5) * 70; ctx.lineTo(x, y); }
        ctx.stroke();
      }
      // 水渍
      for (let i = 0; i < 3; i++) {
        const x = rnd() * w, y = rnd() * h, r = 50 + rnd() * 90;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(96,90,78,0.10)'); g.addColorStop(0.8, 'rgba(96,90,78,0.05)'); g.addColorStop(1, 'rgba(96,90,78,0)');
        ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }, { repeat: [2, 2] });
  };

  T.tactile = function () {
    return T.canvas(128, 256, function (ctx, w, h) {
      ctx.fillStyle = '#e8c53a'; ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, T.rng(3), 900, 0.4, 1.2, 0.08);
      ctx.fillStyle = 'rgba(255,235,140,0.85)';
      for (let y = 14; y < h; y += 34) for (let x = 14; x < w; x += 34) {
        ctx.beginPath(); ctx.arc(x, y, 7.5, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(210,168,20,0.9)';
        ctx.beginPath(); ctx.arc(x + 1.5, y + 2, 7.5, 0.4, 3.1); ctx.fill();
        ctx.fillStyle = 'rgba(255,235,140,0.85)';
      }
    }, { repeat: [4, 1] });
  };

  T.grate = function () {
    return T.canvas(128, 128, function (ctx, w, h) {
      ctx.fillStyle = '#57575c'; ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, T.rng(9), 500, 0.5, 1.5, 0.12);
      ctx.fillStyle = '#26262a';
      for (let y = 8; y < h; y += 16) ctx.fillRect(6, y, w - 12, 7);
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      for (let y = 8; y < h; y += 16) ctx.fillRect(6, y, w - 12, 1.5);
    });
  };

  T.manhole = function () {
    return T.canvas(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#5b5b60'; ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, T.rng(11), 1200, 0.4, 1.4, 0.1);
      const cx = 128, cy = 128;
      ctx.strokeStyle = 'rgba(40,40,44,0.9)';
      for (let r = 118; r > 30; r -= 12) { ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.stroke(); }
      ctx.fillStyle = 'rgba(200,200,190,0.14)';
      for (let a = 0; a < 12; a++) {
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(a / 12 * 6.2832) * 74, cy + Math.sin(a / 12 * 6.2832) * 74, 7, 3.5, a / 12 * 6.2832, 0, 6.2832);
        ctx.fill();
      }
    });
  };

  /* ---------- 建筑 / 木材 / 金属 ---------- */
  T.bark = function (seed) {
    const rnd = T.rng(seed);
    return T.canvas(256, 512, function (ctx, w, h) {
      ctx.fillStyle = '#5f4a38'; ctx.fillRect(0, 0, w, h);
      // 纵向深沟
      for (let i = 0; i < 46; i++) {
        const x = rnd() * w, wd = 3 + rnd() * 9;
        const g = ctx.createLinearGradient(x - wd / 2, 0, x + wd / 2, 0);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.5, 'rgba(30,20,12,' + (0.25 + rnd() * 0.3).toFixed(2) + ')');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - wd / 2, 0, wd, h);
      }
      // 亮脊
      for (let i = 0; i < 60; i++) {
        const x = rnd() * w;
        ctx.strokeStyle = 'rgba(150,124,96,' + (0.12 + rnd() * 0.2).toFixed(2) + ')';
        ctx.lineWidth = 1 + rnd() * 2;
        ctx.beginPath(); ctx.moveTo(x, 0);
        let yy = 0;
        while (yy < h) { yy += 20 + rnd() * 40; ctx.lineTo(x + (rnd() - 0.5) * 8, yy); }
        ctx.stroke();
      }
      speckle(ctx, w, h, rnd, 2500, 0.4, 1.4, 0.08);
      // 地衣斑
      for (let i = 0; i < 14; i++) {
        ctx.fillStyle = 'rgba(140,150,110,' + (0.10 + rnd() * 0.15).toFixed(2) + ')';
        ctx.beginPath(); ctx.ellipse(rnd() * w, rnd() * h, 4 + rnd() * 10, 3 + rnd() * 8, rnd(), 0, 6.2832); ctx.fill();
      }
    }, { repeat: [2, 1] });
  };

  T.wood = function (base, dark, seed, vertical) {
    const rnd = T.rng(seed);
    return T.canvas(256, 256, function (ctx, w, h) {
      ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) {
        const p = rnd() * (vertical ? w : h), wd = 1.5 + rnd() * 6;
        const a = 0.10 + rnd() * 0.22;
        ctx.fillStyle = 'rgba(60,40,24,' + a.toFixed(2) + ')';
        if (vertical) ctx.fillRect(p, 0, wd, h); else ctx.fillRect(0, p, w, wd);
      }
      for (let i = 0; i < 26; i++) {
        const p = rnd() * (vertical ? w : h);
        ctx.fillStyle = 'rgba(255,240,220,' + (0.05 + rnd() * 0.10).toFixed(2) + ')';
        if (vertical) ctx.fillRect(p, 0, 1 + rnd() * 2, h); else ctx.fillRect(0, p, w, 1 + rnd() * 2);
      }
      speckle(ctx, w, h, rnd, 1500, 0.3, 1.2, 0.05);
      // 结疤
      for (let i = 0; i < 2; i++) {
        const x = rnd() * w, y = rnd() * h;
        const g = ctx.createRadialGradient(x, y, 1, x, y, 10 + rnd() * 8);
        g.addColorStop(0, dark || 'rgba(70,48,30,0.7)'); g.addColorStop(1, 'rgba(70,48,30,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 20, y - 20, 40, 40);
      }
    }, { repeat: [2, 2] });
  };

  T.metalBrushed = function (base, seed, vertical) {
    const rnd = T.rng(seed);
    return T.canvas(256, 256, function (ctx, w, h) {
      ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        const p = rnd() * (vertical ? w : h);
        const a = rnd() * 0.10;
        ctx.fillStyle = (rnd() > 0.5 ? 'rgba(255,255,255,' : 'rgba(0,0,0,') + a.toFixed(3) + ')';
        if (vertical) ctx.fillRect(p, 0, 0.8 + rnd(), h); else ctx.fillRect(0, p, w, 0.8 + rnd());
      }
      speckle(ctx, w, h, rnd, 700, 0.3, 1, 0.05);
      // 轻微锈点
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = 'rgba(120,74,44,' + (0.05 + rnd() * 0.1).toFixed(2) + ')';
        ctx.beginPath(); ctx.ellipse(rnd() * w, rnd() * h, 1 + rnd() * 5, 1 + rnd() * 3, rnd() * 3, 0, 6.2832); ctx.fill();
      }
    }, { repeat: [2, 2] });
  };

  T.rustStreak = function (base, seed) {
    const rnd = T.rng(seed);
    return T.canvas(256, 256, function (ctx, w, h) {
      ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, rnd, 1800, 0.4, 1.4, 0.08);
      // 底部锈流
      for (let i = 0; i < 10; i++) {
        const x = rnd() * w;
        const g = ctx.createLinearGradient(0, h * 0.35, 0, h);
        g.addColorStop(0, 'rgba(112,66,38,0)');
        g.addColorStop(1, 'rgba(112,66,38,' + (0.15 + rnd() * 0.25).toFixed(2) + ')');
        ctx.fillStyle = g;
        ctx.fillRect(x, h * 0.35, 4 + rnd() * 10, h * 0.65);
      }
      // 顶部褪色
      const g2 = ctx.createLinearGradient(0, 0, 0, h);
      g2.addColorStop(0, 'rgba(255,255,255,0.10)'); g2.addColorStop(0.4, 'rgba(255,255,255,0)');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);
    }, { repeat: [1, 1] });
  };

  T.stucco = function (base, seed) {
    const rnd = T.rng(seed);
    return T.canvas(512, 512, function (ctx, w, h) {
      ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, rnd, 9000, 0.4, 1.8, 0.09);
      // 雨痕
      for (let i = 0; i < 12; i++) {
        const x = rnd() * w, wd = 2 + rnd() * 8;
        const g = ctx.createLinearGradient(0, rnd() * h * 0.4, 0, h);
        g.addColorStop(0, 'rgba(90,86,74,0)');
        g.addColorStop(1, 'rgba(90,86,74,' + (0.05 + rnd() * 0.08).toFixed(2) + ')');
        ctx.fillStyle = g; ctx.fillRect(x, 0, wd, h);
      }
    }, { repeat: [2, 2] });
  };

  T.roofTile = function (seed) {
    const rnd = T.rng(seed);
    return T.canvas(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#6a6f74'; ctx.fillRect(0, 0, w, h);
      const rowH = 32;
      for (let y = 0; y < h; y += rowH) {
        const off = ((y / rowH) % 2) * 16;
        for (let x = -16; x < w + 16; x += 32) {
          const xx = x + off;
          const g = ctx.createLinearGradient(xx, y, xx, y + rowH);
          g.addColorStop(0, 'rgba(255,255,255,0.10)');
          g.addColorStop(0.5, 'rgba(0,0,0,0.12)');
          g.addColorStop(1, 'rgba(0,0,0,0.30)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(xx, y + rowH);
          ctx.quadraticCurveTo(xx + 16, y - 4, xx + 32, y + rowH);
          ctx.fill();
          ctx.strokeStyle = 'rgba(30,32,36,0.5)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(xx, y + rowH);
          ctx.quadraticCurveTo(xx + 16, y - 4, xx + 32, y + rowH); ctx.stroke();
        }
      }
      speckle(ctx, w, h, rnd, 2000, 0.4, 1.4, 0.08);
      // 苔点
      for (let i = 0; i < 26; i++) {
        ctx.fillStyle = 'rgba(110,130,90,' + (0.08 + rnd() * 0.12).toFixed(2) + ')';
        ctx.beginPath(); ctx.ellipse(rnd() * w, rnd() * h, 2 + rnd() * 6, 1 + rnd() * 3, rnd() * 3, 0, 6.2832); ctx.fill();
      }
    }, { repeat: [3, 2] });
  };

  T.basket = function () {
    return T.canvas(128, 128, function (ctx, w, h) {
      ctx.fillStyle = '#4a4a4e'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#8f9096'; ctx.lineWidth = 2.4;
      for (let i = -h; i < w; i += 10) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i + h, 0); ctx.lineTo(i, h); ctx.stroke();
      }
    }, { repeat: [3, 3] });
  };

  /* ---------- 文字 / 标牌 ---------- */
  T.label = function (text, opt) {
    opt = opt || {};
    const w = opt.w || 256, h = opt.h || 128;
    const bg = opt.bg || 'transparent', fg = opt.fg || '#26262a',
      size = opt.size || 56, font = opt.font || FONT,
      border = opt.border !== false;
    return T.canvas(w, h, function (ctx) {
      if (bg !== 'transparent') { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
      if (border) {
        ctx.strokeStyle = opt.bc || 'rgba(38,38,42,0.8)'; ctx.lineWidth = 6;
        ctx.strokeRect(5, 5, w - 10, h - 10);
      }
      ctx.fillStyle = fg;
      ctx.font = 'bold ' + size + 'px ' + font;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, h / 2 + 2, w - 24);
    });
  };

  T.streetSign = function (name, sub) {
    return T.canvas(512, 128, function (ctx, w, h) {
      ctx.fillStyle = '#f5f2e8'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 8; ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.fillStyle = '#26262a';
      ctx.font = 'bold 62px ' + FONT;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (sub) {
        ctx.font = 'bold 54px ' + FONT;
        ctx.fillText(name, w / 2 - 50, h / 2, w - 200);
        ctx.font = '28px ' + FONT;
        ctx.fillStyle = '#5a5a60';
        ctx.fillText(sub, w - 90, h / 2 + 6, 160);
      } else {
        ctx.fillText(name, w / 2, h / 2, w - 60);
      }
    });
  };

  T.timetable = function () {
    return T.canvas(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#efe9da'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#7a4a33'; ctx.fillRect(0, 0, w, 44);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 26px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('時刻表', w / 2, 22);
      ctx.strokeStyle = 'rgba(90,80,70,0.5)'; ctx.lineWidth = 2;
      for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(16, 44 + i * 28); ctx.lineTo(w - 16, 44 + i * 28); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(w / 2, 44); ctx.lineTo(w / 2, h); ctx.stroke();
      const rnd = T.rng(21);
      ctx.fillStyle = '#4a4a50';
      ctx.font = '20px ' + FONT;
      for (let i = 0; i < 7; i++) {
        const y = 60 + i * 28;
        ctx.fillText('0' + (5 + i * 2) + ':' + (rnd() > 0.5 ? '25' : '55'), w / 2 - 60, y);
        ctx.fillStyle = '#6a6a70';
        ctx.fillText(rnd() > 0.4 ? '発' : '発車', w / 2 + 60, y);
        ctx.fillStyle = '#4a4a50';
      }
    });
  };

  T.destination = function (text, sub) {
    return T.canvas(512, 128, function (ctx, w, h) {
      ctx.fillStyle = '#f2c94c'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#3a2f18'; ctx.lineWidth = 10; ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.fillStyle = '#2a2116';
      ctx.font = 'bold 64px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, h / 2 - 4, w - 60);
      if (sub) {
        ctx.font = '26px ' + FONT; ctx.fillStyle = '#5a4a20';
        ctx.fillText(sub, w / 2, h - 26);
      }
    });
  };

  T.shopSign = function (text, sub) {
    return T.canvas(512, 160, function (ctx, w, h) {
      ctx.fillStyle = '#1f8a4d'; ctx.fillRect(0, 0, w, h);
      // 樱花图标
      ctx.fillStyle = '#f6d7dd';
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * 6.2832 - 1.57;
        ctx.beginPath(); ctx.ellipse(64 + Math.cos(a) * 22, h / 2 + Math.sin(a) * 22, 15, 10, a, 0, 6.2832); ctx.fill();
      }
      ctx.fillStyle = '#e8b7c4'; ctx.beginPath(); ctx.arc(64, h / 2, 10, 0, 6.2832); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 74px ' + FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(text, 120, h / 2 - 12, w - 160);
      ctx.font = '30px ' + FONT; ctx.fillStyle = '#cdeeda';
      ctx.fillText(sub, 122, h - 30);
    });
  };

  T.priceTagStrip = function (seed) {
    const rnd = T.rng(seed);
    return T.canvas(512, 64, function (ctx, w, h) {
      const n = 8, cw = w / n;
      for (let i = 0; i < n; i++) {
        const x = i * cw;
        ctx.fillStyle = i % 2 ? '#f7f4ea' : '#efe7d2';
        ctx.fillRect(x + 2, 4, cw - 4, h - 8);
        ctx.strokeStyle = 'rgba(120,110,90,0.6)'; ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 2, 4, cw - 4, h - 8);
        ctx.fillStyle = '#33333a';
        ctx.font = 'bold 26px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(100 + Math.floor(rnd() * 20) * 10), x + cw / 2, h / 2 + 2, cw - 10);
      }
    });
  };

  T.doorMat = function () {
    return T.canvas(128, 256, function (ctx, w, h) {
      ctx.fillStyle = '#7a3b34'; ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, T.rng(5), 3000, 0.4, 1.4, 0.14);
      ctx.strokeStyle = 'rgba(40,20,16,0.55)'; ctx.lineWidth = 10; ctx.strokeRect(8, 8, w - 16, h - 16);
      // 刷条
      for (let y = 28; y < h - 20; y += 22) {
        ctx.fillStyle = 'rgba(255,235,225,0.10)';
        ctx.fillRect(18, y, w - 36, 8);
        ctx.fillStyle = 'rgba(30,14,10,0.35)';
        ctx.fillRect(18, y + 9, w - 36, 3);
      }
    });
  };

  T.floorWelcome = function () {
    return T.canvas(256, 256, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(122,59,52,0.88)';
      ctx.beginPath();
      ctx.moveTo(20, h - 20); ctx.lineTo(w - 20, h - 20);
      ctx.lineTo(w - 40, 20); ctx.lineTo(40, 20); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(240,225,215,0.7)'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(34, h - 34); ctx.lineTo(w - 34, h - 34); ctx.lineTo(w - 52, 34); ctx.lineTo(52, 34); ctx.closePath(); ctx.stroke();
      ctx.fillStyle = 'rgba(245,235,225,0.95)';
      ctx.font = 'bold 52px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ようこそ', w / 2, h / 2 - 20, 200);
      ctx.font = '24px ' + FONT; ctx.fillStyle = 'rgba(245,235,225,0.75)';
      ctx.fillText('S A K U R A   M A R T', w / 2, h / 2 + 28, 210);
      // 花瓣
      ctx.fillStyle = 'rgba(246,215,221,0.9)';
      for (let i = 0; i < 6; i++) {
        const a = i * 1.05;
        ctx.beginPath(); ctx.ellipse(w / 2 + Math.cos(a) * 88, 60 + Math.sin(a * 2) * 16, 9, 5, a, 0, 6.2832); ctx.fill();
      }
    });
  };

  T.floorArrow = function () {
    return T.canvas(128, 256, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(31,138,77,0.55)';
      for (let i = 0; i < 4; i++) {
        const y = h - 30 - i * 58;
        ctx.beginPath();
        ctx.moveTo(w / 2, y - 34);
        ctx.lineTo(w - 14, y + 18);
        ctx.lineTo(w / 2, y);
        ctx.lineTo(14, y + 18);
        ctx.closePath(); ctx.fill();
      }
    });
  };

  /* ---------- 海报 / 杂志 ---------- */
  T.poster = function (kind, seed) {
    const rnd = T.rng(seed);
    if (kind === 'food') {
      return T.canvas(256, 384, function (ctx, w, h) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#fdf3e2'); g.addColorStop(1, '#f6d9b8');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        // 便当盒
        ctx.fillStyle = '#8a5a3a'; ctx.fillRect(40, 130, 176, 110);
        ctx.fillStyle = '#a8785a'; ctx.fillRect(40, 130, 176, 18);
        ctx.fillStyle = '#f2f0e6'; ctx.fillRect(52, 158, 70, 70);
        ctx.fillStyle = '#f2b04c'; ctx.fillRect(132, 158, 72, 32);
        ctx.fillStyle = '#d86a4a'; ctx.fillRect(132, 198, 72, 30);
        ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.arc(87, 193, 16, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#f7f3e6'; ctx.beginPath(); ctx.arc(87, 193, 11, 0, 6.2832); ctx.fill();
        // 饭团
        ctx.fillStyle = '#f7f4ea';
        ctx.beginPath(); ctx.moveTo(196, 178); ctx.lineTo(236, 226); ctx.lineTo(156, 226); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#22352a'; ctx.fillRect(170, 208, 52, 18);
        ctx.fillStyle = '#f2f4f0'; ctx.fillRect(190, 196, 12, 8);
        // 标题
        ctx.fillStyle = '#8a3a2a'; ctx.font = 'bold 44px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('旬の弁当', w / 2, 60, w - 30);
        ctx.font = '24px ' + FONT; ctx.fillStyle = '#a06a4a';
        ctx.fillText('桜の季節 限定', w / 2, 300);
        ctx.fillStyle = '#8a3a2a'; ctx.beginPath(); ctx.arc(w / 2, 344, 14, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px ' + FONT;
        ctx.fillText('10%', w / 2, 344);
      });
    }
    if (kind === 'drink') {
      return T.canvas(256, 384, function (ctx, w, h) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#bfe0f2'); g.addColorStop(1, '#7fb8d8');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        // 气泡
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = 'rgba(255,255,255,' + (0.15 + rnd() * 0.3).toFixed(2) + ')';
          ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, 2 + rnd() * 8, 0, 6.2832); ctx.fill();
        }
        // 瓶
        ctx.fillStyle = '#3a7a5a';
        ctx.fillRect(96, 120, 64, 160);
        ctx.fillRect(112, 84, 32, 40);
        ctx.fillStyle = '#f2ead8'; ctx.fillRect(96, 150, 64, 84);
        ctx.fillStyle = '#2a5a44'; ctx.font = 'bold 22px ' + FONT;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('桜', 128, 182);
        ctx.fillText('サイダー', 128, 212);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 40px ' + FONT;
        ctx.fillText('涼しいうちに', w / 2, 56, w - 20);
        ctx.font = '22px ' + FONT; ctx.fillStyle = '#eaf4f8';
        ctx.fillText('新発売', w / 2, 330);
      });
    }
    // season 樱花
    return T.canvas(256, 384, function (ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#fdeef2'); g.addColorStop(1, '#f6cdd8');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // 花枝
      ctx.strokeStyle = '#7a5a44'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(0, 120); ctx.quadraticCurveTo(w / 2, 90, w, 150); ctx.stroke();
      for (let i = 0; i < 26; i++) {
        const x = rnd() * w, y = 60 + rnd() * 130;
        ctx.fillStyle = 'rgba(246,205,216,' + (0.75 + rnd() * 0.25).toFixed(2) + ')';
        for (let k = 0; k < 5; k++) {
          const a = k / 5 * 6.2832 + rnd();
          ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 8, y + Math.sin(a) * 8, 7, 4.5, a, 0, 6.2832); ctx.fill();
        }
      }
      ctx.fillStyle = '#8a4a5a'; ctx.font = 'bold 40px ' + FONT; ctx.textAlign = 'center';
      ctx.fillText('春のまもなく', w / 2, 280, w - 30);
      ctx.font = '22px ' + FONT; ctx.fillStyle = '#a06a78';
      ctx.fillText('店内から桜が見える', w / 2, 324);
    });
  };

  T.magazine = function (seed, i) {
    const rnd = T.rng(seed * 31 + i);
    const c1 = ['#d86a5a', '#5a8ad8', '#5ab88a', '#d8a84c', '#9a6ad8', '#d87ab0'][i % 6];
    return T.canvas(128, 192, function (ctx, w, h) {
      ctx.fillStyle = '#f4f1e8'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = c1; ctx.fillRect(0, 0, w, 44);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(['月刊桜', '旅と暮ら', 'レシピ', '街歩き', '写真誌', 'サイクリング'][i % 6], w / 2, 22, w - 8);
      ctx.fillStyle = 'rgba(60,60,70,0.75)';
      for (let y = 58; y < h - 14; y += 26) {
        const n = 2 + Math.floor(rnd() * 3);
        for (let k = 0; k < n; k++) ctx.fillRect(10 + k * 40, y, 32, 10);
      }
      // 图
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(14, 62, 100, 44);
      ctx.fillStyle = 'rgba(' + Math.floor(120 + rnd() * 100) + ',' + Math.floor(120 + rnd() * 100) + ',120,0.5)';
      ctx.beginPath(); ctx.ellipse(64, 84, 34, 18, 0, 0, 6.2832); ctx.fill();
    });
  };

  /* ---------- 商品 ---------- */
  T.canLabel = function (base, seed) {
    const rnd = T.rng(seed);
    return T.canvas(128, 128, function (ctx, w, h) {
      ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(255,255,255,0.25)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.15)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.ellipse(w / 2, h / 2, 34, 40, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = base; ctx.font = 'bold 30px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String.fromCharCode(0x30E1 + Math.floor(rnd() * 100)), w / 2, h / 2);
    });
  };

  T.boxLabel = function (c1, c2, seed) {
    const rnd = T.rng(seed);
    return T.canvas(128, 192, function (ctx, w, h) {
      ctx.fillStyle = c1; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = c2; ctx.fillRect(0, h * 0.3, w, h * 0.4);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(0, 0, w, 10);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 26px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const words = ['スナック', 'ポテト', 'チョコ', 'クッキー', 'ゼリー', 'ナッツ'];
      ctx.fillText(words[Math.floor(rnd() * words.length)], w / 2, h * 0.5, w - 12);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(20, h * 0.72, w - 40, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(24 + i * 22, h * 0.85, 7, 0, 6.2832); ctx.fill(); }
    });
  };

  T.cupBand = function (c1, seed) {
    return T.canvas(64, 64, function (ctx, w, h) {
      ctx.fillStyle = c1; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(0, h * 0.35, w, h * 0.3);
      ctx.fillStyle = c1; ctx.font = 'bold 18px ' + FONT; ctx.textAlign = 'center';
      ctx.fillText('COFFEE', w / 2, h * 0.56);
    });
  };

  T.vendingPanel = function () {
    return T.canvas(256, 128, function (ctx, w, h) {
      ctx.fillStyle = '#2a2f38'; ctx.fillRect(0, 0, w, h);
      // 品牌
      ctx.fillStyle = '#e8574a';
      ctx.beginPath(); ctx.arc(44, h / 2, 34, 0, 6.2832); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 34px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('汽', 44, h / 2 + 2);
      ctx.fillStyle = '#f2ead8'; ctx.font = 'bold 30px ' + FONT; ctx.textAlign = 'left';
      ctx.fillText('SAKURA COLD', 92, 40, 160);
      ctx.fillStyle = '#9aa4b0'; ctx.font = '20px ' + FONT;
      ctx.fillText('自販機 24h', 92, 84);
      // 指示灯
      ctx.fillStyle = '#7ee0a0';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(w - 30 + (i - 1) * 0, 30 + i * 34, 6, 0, 6.2832); ctx.fill(); }
    });
  };

  /* ---------- 花瓣 / 光 ---------- */
  T.petal = function () {
    return T.canvas(64, 64, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(32, 30, 4, 32, 34, 28);
      g.addColorStop(0, '#fbe3ea');
      g.addColorStop(0.6, '#f6c3d2');
      g.addColorStop(1, '#f0a8bd');
      ctx.fillStyle = g;
      ctx.beginPath();
      // 花瓣形：上部圆弧 + 底部尖
      ctx.moveTo(32, 58);
      ctx.bezierCurveTo(8, 44, 6, 18, 24, 8);
      ctx.bezierCurveTo(30, 4, 34, 4, 40, 8);
      ctx.bezierCurveTo(58, 18, 56, 44, 32, 58);
      ctx.closePath(); ctx.fill();
      // 底部凹口
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.moveTo(28, 58); ctx.lineTo(32, 50); ctx.lineTo(36, 58); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(220,150,170,0.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(32, 56); ctx.quadraticCurveTo(30, 34, 32, 14); ctx.stroke();
    });
  };

  T.petalCarpet = function () {
    const rnd = T.rng(7);
    return T.canvas(256, 256, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(244,196,210,0.55)');
      g.addColorStop(0.7, 'rgba(244,196,210,0.28)');
      g.addColorStop(1, 'rgba(244,196,210,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 240; i++) {
        const x = rnd() * w, y = rnd() * h;
        const d = Math.hypot(x - w / 2, y - h / 2) / (w / 2);
        if (d > 1) continue;
        ctx.save();
        ctx.translate(x, y); ctx.rotate(rnd() * 6.2832);
        ctx.fillStyle = 'rgba(246,' + Math.floor(180 + rnd() * 40) + ',' + Math.floor(200 + rnd() * 40) + ',' + (0.5 * (1 - d)).toFixed(2) + ')';
        ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.8, 0, 0, 6.2832); ctx.fill();
        ctx.restore();
      }
    });
  };

  T.glow = function () {
    return T.canvas(128, 128, function (ctx, w, h) {
      const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
      g.addColorStop(0.6, 'rgba(255,255,255,0.14)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
  };

  T.steam = function () {
    return T.canvas(64, 64, function (ctx, w, h) {
      const g = ctx.createRadialGradient(32, 36, 2, 32, 32, 30);
      g.addColorStop(0, 'rgba(255,255,255,0.5)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.2)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
  };

  T.tramPaint = function (seed) {
    const rnd = T.rng(seed);
    return T.canvas(512, 256, function (ctx, w, h) {
      ctx.fillStyle = '#f3ead8'; ctx.fillRect(0, 0, w, h);
      // 茶色带
      ctx.fillStyle = '#7a4a33'; ctx.fillRect(0, h * 0.52, w, h * 0.30);
      ctx.fillStyle = '#4f9e95'; ctx.fillRect(0, h * 0.52, w, 8);
      ctx.fillRect(0, h * 0.82, w, 8);
      // 褪色
      for (let i = 0; i < 24; i++) {
        ctx.fillStyle = 'rgba(255,255,255,' + (0.02 + rnd() * 0.05).toFixed(3) + ')';
        ctx.fillRect(rnd() * w, h * 0.52, 30 + rnd() * 90, h * 0.30);
      }
      // 底部锈流
      for (let i = 0; i < 30; i++) {
        const x = rnd() * w;
        const g = ctx.createLinearGradient(0, h - 40, 0, h);
        g.addColorStop(0, 'rgba(100,64,40,0)');
        g.addColorStop(1, 'rgba(100,64,40,' + (0.10 + rnd() * 0.2).toFixed(2) + ')');
        ctx.fillStyle = g; ctx.fillRect(x, h - 40, 3 + rnd() * 8, 40);
      }
      speckle(ctx, w, h, rnd, 800, 0.4, 1.4, 0.04);
      // 小划痕
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const x = rnd() * w, y = h * 0.4 + rnd() * h * 0.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8 + rnd() * 30, y + (rnd() - 0.5) * 4); ctx.stroke();
      }
    });
  };

  T.shopFront = function (seed) {
    const rnd = T.rng(seed !== undefined ? seed : 17);
    return T.canvas(512, 256, function (ctx, w, h) {
      ctx.fillStyle = '#efece2'; ctx.fillRect(0, 0, w, h);
      // 绿色腰线
      ctx.fillStyle = '#1f8a4d'; ctx.fillRect(0, h * 0.62, w, h * 0.10);
      // 污渍
      speckle(ctx, w, h, T.rng(4), 700, 0.4, 1.4, 0.05);
      for (let i = 0; i < 8; i++) {
        const x = rnd() * w;
        ctx.fillStyle = 'rgba(120,116,100,0.06)';
        ctx.fillRect(x, 0, 10 + rnd() * 30, h);
      }
    });
  };

  T.louver = function () {
    return T.canvas(128, 128, function (ctx, w, h) {
      ctx.fillStyle = '#8a8f96'; ctx.fillRect(0, 0, w, h);
      for (let y = 4; y < h; y += 14) {
        ctx.fillStyle = '#6a6f76'; ctx.fillRect(0, y, w, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(0, y, w, 2);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, y + 6, w, 2);
      }
    }, { repeat: [2, 2] });
  };

  T.graffiti = function () {
    const rnd = T.rng(13);
    return T.canvas(256, 128, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(150,60,50,0.5)';
      ctx.font = 'bold 60px ' + FONT;
      ctx.fillText('桜', 30, 84);
      ctx.fillStyle = 'rgba(90,90,100,0.4)';
      ctx.font = 'bold 30px ' + FONT;
      ctx.fillText('2026', 130, 100);
      ctx.strokeStyle = 'rgba(150,60,50,0.4)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(190, 60, 28, 0, 5.2); ctx.stroke();
    });
  };

  T.wallPoster = function (seed) {
    const rnd = T.rng(seed);
    return T.canvas(256, 320, function (ctx, w, h) {
      ctx.fillStyle = '#e8e0cc'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#c85a4a'; ctx.fillRect(0, 0, w, 60);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 30px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('地域掲示板', w / 2, 30);
      // 贴的
      for (let i = 0; i < 5; i++) {
        const x = 20 + (i % 2) * 120, y = 84 + Math.floor(i / 2) * 86;
        ctx.save(); ctx.translate(x, y); ctx.rotate((rnd() - 0.5) * 0.08);
        ctx.fillStyle = ['#f7f3e6', '#fde8ec', '#e6f0e8', '#f4e8c8'][i % 4];
        ctx.fillRect(0, 0, 108, 74);
        ctx.fillStyle = 'rgba(70,70,80,0.7)';
        ctx.font = '18px ' + FONT; ctx.textAlign = 'left';
        ctx.fillText(['桜祭り', '地域清掃', '自転車', '新商品', '見学会'][i], 10, 30, 90);
        ctx.fillStyle = 'rgba(70,70,80,0.45)';
        ctx.fillRect(10, 44, 70, 5); ctx.fillRect(10, 54, 56, 5);
        ctx.restore();
      }
      // 折角
      ctx.fillStyle = 'rgba(120,110,90,0.4)';
      ctx.beginPath(); ctx.moveTo(w - 26, h); ctx.lineTo(w, h - 26); ctx.lineTo(w, h); ctx.fill();
    });
  };

  T.oven = function () {
    return T.canvas(128, 128, function (ctx, w, h) {
      const g = ctx.createRadialGradient(w / 2, h * 0.55, 6, w / 2, h * 0.55, w * 0.55);
      g.addColorStop(0, '#5a3a26');
      g.addColorStop(0.55, '#3a2618');
      g.addColorStop(1, '#241812');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, T.rng(6), 600, 0.4, 1.2, 0.08);
    });
  };

  T.waterTank = function () {
    return T.canvas(64, 64, function (ctx, w, h) {
      ctx.fillStyle = 'rgba(160,200,235,0.9)'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(6, 6, 10, h - 12);
    });
  };
})();