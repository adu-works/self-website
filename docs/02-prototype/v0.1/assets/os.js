/* 「个人工作台 OS」外壳逻辑
   ------------------------------------------------------------------
   职责：开机序列、桌面图标、窗口管理（打开/聚焦/拖动/缩放/最小化/关闭）、
         程序坞、聚光灯搜索、主题同步。
   窗口内容用 iframe 装载既有页面：这样问答五态、提案确认流程等
   已经验证过的演示一行都不用改，站点也仍可单页直接打开。
   ------------------------------------------------------------------ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var isMobile = function () { return window.matchMedia('(max-width: 760px)').matches; };

  /* 应用清单：桌面图标、程序坞、聚光灯共用这一份 */
  var APPS = [
    { id: 'home', title: '首页', glyph: '⌂', file: 'home.html', w: 860, h: 620, keywords: '首页 定位 概览 index' },
    { id: 'about', title: '经历', glyph: 'CV', file: 'about.html', w: 760, h: 640, keywords: '经历 简历 技能 时间线 about' },
    { id: 'projects', title: '项目', glyph: '▦', file: 'projects.html', w: 900, h: 640, keywords: '项目 作品 证据 projects' },
    { id: 'notes', title: '见解', glyph: '✎', file: 'notes.html', w: 760, h: 600, keywords: '见解 文章 博客 notes' },
    { id: 'ask', title: '问答', glyph: '?', file: 'ask.html', w: 720, h: 660, keywords: '问答 提问 引用 ask 无资料 服务异常' },
    { id: 'contact', title: '联系', glyph: '✉', file: 'contact.html', w: 680, h: 580, keywords: '联系 邮箱 表单 contact' },
    { id: 'resources', title: '资料与服务', glyph: '¥', file: 'resources.html', w: 820, h: 600, keywords: '资料 课程 顾问 商品 resources' },
    { id: 'booking', title: '预约与订单', glyph: '⌚', file: 'booking.html', w: 900, h: 620, keywords: '预约 订单 时区 冲突 booking' },
    { id: 'admin', title: '站长管理端', glyph: '⚙', file: 'admin.html', w: 960, h: 680, locked: true, keywords: '管理端 提案 确认 差异 回滚 admin agent' },
    { id: 'insights', title: '访客洞察', glyph: '◷', file: 'insights.html', w: 900, h: 640, locked: true, keywords: '洞察 访客 主题 缺口 脱敏 insights' },
    { id: 'states', title: '状态与异常', glyph: '!', file: 'states.html', w: 880, h: 660, keywords: '状态 异常 空状态 失败 404 states' },
    { id: 'readme', title: '原型说明', glyph: 'i', file: 'README.md', w: 720, h: 620, keywords: '说明 评审 readme 设计方向' }
  ];

  /* 聚光灯里除了应用，还能直接搜到具体内容 */
  var DEEP_LINKS = [
    { title: '示例项目 A · 内容问答系统', kind: '项目', file: 'project-detail.html', w: 780, h: 660 },
    { title: '示例文章 · 我怎么用 Agent 做需求评审', kind: '见解', file: 'note-detail.html', w: 720, h: 620 },
    { title: '移动端预览', kind: '工具', file: 'mobile.html', w: 940, h: 680 }
  ];

  var desktop, dock, menubarTitle;
  var windows = {};
  var zTop = 10;
  var openOrder = [];

  /* ---------- 主题 ---------- */

  var THEME_KEY = 'proto-theme';
  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0a0908' : '#e7dcc6';
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) btn.textContent = theme === 'dark' ? '浅色' : '深色';
    // 同步到所有已打开窗口（同源，可直接改）
    Object.keys(windows).forEach(function (id) {
      var frame = windows[id].querySelector('iframe');
      try {
        if (frame && frame.contentDocument) {
          frame.contentDocument.documentElement.setAttribute('data-theme', theme);
        }
      } catch (e) { /* 跨源时忽略 */ }
    });
  }

  /* ---------- 窗口 ---------- */

  function bringToFront(win) {
    zTop += 1;
    win.style.zIndex = zTop;
    Object.keys(windows).forEach(function (id) {
      windows[id].setAttribute('data-focused', String(windows[id] === win));
    });
    menubarTitle.textContent = win.getAttribute('data-title') || '';
    renderDock();
  }

  function placeWindow(win, app, originRect) {
    var barH = 34;
    var maxW = window.innerWidth - 40;
    var maxH = window.innerHeight - barH - 100;
    var w = Math.min(app.w || 800, maxW);
    var h = Math.min(app.h || 600, maxH);

    // 层叠摆放：每多开一个窗口就向右下错开，避免完全重合
    var step = (openOrder.length % 6) * 26;
    var left = Math.max(20, Math.min((window.innerWidth - w) / 2 + step - 60, window.innerWidth - w - 20));
    var top = Math.max(barH + 20, Math.min((window.innerHeight - h) / 2 + step - 40, window.innerHeight - h - 80));

    win.style.width = w + 'px';
    win.style.height = h + 'px';
    win.style.left = left + 'px';
    win.style.top = top + 'px';

    // 从图标位置展开：锚定来源是 Apple 那条"从哪来回哪去"的原则
    if (originRect) {
      var ox = ((originRect.left + originRect.width / 2) - left) / w * 100;
      var oy = ((originRect.top + originRect.height / 2) - top) / h * 100;
      win.style.setProperty('--origin-x', Math.max(-20, Math.min(120, ox)) + '%');
      win.style.setProperty('--origin-y', Math.max(-20, Math.min(120, oy)) + '%');
    }
  }

  function openWindow(app, originRect) {
    var id = app.id || app.file;
    if (windows[id]) {
      var existing = windows[id];
      existing.setAttribute('data-min', 'false');
      bringToFront(existing);
      return existing;
    }

    var win = document.createElement('section');
    win.className = 'window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', app.title);
    win.setAttribute('data-win', id);
    win.setAttribute('data-title', app.title);
    win.innerHTML =
      '<header class="titlebar">' +
      '<span class="win-dots">' +
      '<button class="win-dot" type="button" data-act="close" aria-label="关闭 ' + app.title + '"></button>' +
      '<button class="win-dot" type="button" data-act="min" aria-label="最小化 ' + app.title + '"></button>' +
      '</span>' +
      '<span class="win-title">' + app.title + (app.locked ? ' · 仅管理员' : '') + '</span>' +
      '<a class="win-open-link" href="' + app.file + '" target="_blank" rel="noopener">单独打开 ↗</a>' +
      '</header>' +
      '<div class="win-body"><iframe title="' + app.title + '" src="' + app.file + '" loading="lazy"></iframe></div>' +
      '<span class="win-resize" aria-hidden="true"></span>';

    placeWindow(win, app, originRect);
    desktop.appendChild(win);
    windows[id] = win;
    openOrder.push(id);
    bringToFront(win);

    var frame = win.querySelector('iframe');
    frame.addEventListener('load', function () {
      try {
        var doc = frame.contentDocument;
        if (!doc) return;
        doc.documentElement.setAttribute('data-theme', currentTheme());
        // 窗口内的页面点击时，让该窗口获得焦点
        doc.addEventListener('pointerdown', function () { bringToFront(win); });
      } catch (e) { /* 忽略 */ }
    });

    win.addEventListener('pointerdown', function () { bringToFront(win); });
    win.querySelector('[data-act="close"]').addEventListener('click', function (e) {
      e.stopPropagation();
      closeWindow(id);
    });
    win.querySelector('[data-act="min"]').addEventListener('click', function (e) {
      e.stopPropagation();
      win.setAttribute('data-min', 'true');
      renderDock();
    });

    mountDrag(win);
    mountResize(win);
    renderDock();
    // 手机上窗口是整屏面板，首次提示会压住内容
    var hintEl = document.querySelector('.hint');
    if (hintEl && isMobile()) hintEl.remove();
    return win;
  }

  function closeWindow(id) {
    var win = windows[id];
    if (!win) return;
    win.classList.add('is-closing');
    var remove = function () {
      win.remove();
      delete windows[id];
      openOrder = openOrder.filter(function (x) { return x !== id; });
      var last = openOrder[openOrder.length - 1];
      if (last && windows[last]) bringToFront(windows[last]);
      else menubarTitle.textContent = '桌面';
      renderDock();
    };
    if (reduceMotion.matches) remove();
    else win.addEventListener('animationend', remove, { once: true });
  }

  /* 1:1 拖动：用指针捕获，保证指针移出标题栏也不断连
     手机上标题栏改为"下拉关闭"，和整屏面板的形态一致 */
  function mountDrag(win) {
    var bar = win.querySelector('.titlebar');
    var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;

    bar.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button, a')) return;
      if (isMobile()) { startSheetDrag(win, bar, e); return; }
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = win.offsetLeft; oy = win.offsetTop;
      try { bar.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件无有效指针时忽略 */ }
      win.style.animation = 'none';
    });
    bar.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var nx = ox + (e.clientX - sx);
      var ny = oy + (e.clientY - sy);
      // 边界内吸住：不让标题栏被拖到菜单栏后面或完全移出视口
      nx = Math.max(-win.offsetWidth + 120, Math.min(nx, window.innerWidth - 120));
      ny = Math.max(34, Math.min(ny, window.innerHeight - 60));
      win.style.left = nx + 'px';
      win.style.top = ny + 'px';
    });
    var stop = function (e) {
      if (!dragging) return;
      dragging = false;
      try { bar.releasePointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
    };
    bar.addEventListener('pointerup', stop);
    bar.addEventListener('pointercancel', stop);
  }

  /* 手机端：按住标题栏下拉，超过 110px 就关闭，否则弹回。
     跟随手指 1:1，松手才决定去留——和系统面板的手感一致。 */
  function startSheetDrag(win, bar, downEvent) {
    var startY = downEvent.clientY;
    var moved = 0;
    try { bar.setPointerCapture(downEvent.pointerId); } catch (e) { /* 忽略 */ }
    win.style.animation = 'none';
    win.style.transition = 'none';

    function onMove(e) {
      moved = Math.max(0, e.clientY - startY);
      win.style.transform = 'translateY(' + moved + 'px)';
    }
    function onUp() {
      bar.removeEventListener('pointermove', onMove);
      bar.removeEventListener('pointerup', onUp);
      bar.removeEventListener('pointercancel', onUp);
      if (moved > 110) {
        closeWindow(win.getAttribute('data-win'));
        return;
      }
      win.style.transition = 'transform 320ms var(--ease-spring)';
      win.style.transform = '';
    }
    bar.addEventListener('pointermove', onMove);
    bar.addEventListener('pointerup', onUp);
    bar.addEventListener('pointercancel', onUp);
  }

  function mountResize(win) {
    var handle = win.querySelector('.win-resize');
    var resizing = false, sx = 0, sy = 0, sw = 0, sh = 0;
    handle.addEventListener('pointerdown', function (e) {
      if (isMobile()) return;
      resizing = true;
      sx = e.clientX; sy = e.clientY;
      sw = win.offsetWidth; sh = win.offsetHeight;
      try { handle.setPointerCapture(e.pointerId); } catch (err) { /* 同上 */ }
      e.stopPropagation();
    });
    handle.addEventListener('pointermove', function (e) {
      if (!resizing) return;
      win.style.width = Math.max(320, sw + (e.clientX - sx)) + 'px';
      win.style.height = Math.max(220, sh + (e.clientY - sy)) + 'px';
    });
    var stop = function (e) {
      if (!resizing) return;
      resizing = false;
      try { handle.releasePointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
    };
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
  }

  /* ---------- 程序坞 ---------- */

  function renderDock() {
    if (!dock) return;
    dock.innerHTML = openOrder.map(function (id) {
      var win = windows[id];
      if (!win) return '';
      var minimized = win.getAttribute('data-min') === 'true';
      var focused = win.getAttribute('data-focused') === 'true' && !minimized;
      return '<button class="dock-item" type="button" data-dock="' + id + '" data-active="' + focused + '">' +
        (minimized ? '▫ ' : '') + win.getAttribute('data-title') + '</button>';
    }).join('');
  }

  /* 程序坞磁吸：指针靠近的图标放大，远处的几乎不动。
     只改 transform，避免重排。触控设备跳过。 */
  function mountDockMagnet() {
    if (!dock || window.matchMedia('(hover: none)').matches) return;
    dock.addEventListener('pointermove', function (e) {
      var items = dock.querySelectorAll('.dock-item');
      Array.prototype.forEach.call(items, function (item) {
        var r = item.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var dist = Math.sqrt(dx * dx + dy * dy);
        var t = Math.max(0, 1 - dist / 120);
        var s = 1 + t * t * 0.42;
        item.style.setProperty('--s', s.toFixed(3));
        item.style.setProperty('--lift', (-t * 10).toFixed(1) + 'px');
      });
    });
    dock.addEventListener('pointerleave', function () {
      Array.prototype.forEach.call(dock.querySelectorAll('.dock-item'), function (item) {
        item.style.setProperty('--s', '1');
        item.style.setProperty('--lift', '0px');
      });
    });
  }

  /* ---------- 聚光灯 ---------- */

  var spotIndex = APPS.map(function (a) {
    return { title: a.title, kind: a.locked ? '仅管理员' : '应用', app: a, keywords: a.keywords };
  }).concat(DEEP_LINKS.map(function (d) {
    return { title: d.title, kind: d.kind, app: { id: d.file, title: d.title, file: d.file, w: d.w, h: d.h }, keywords: d.title };
  }));

  function openSpotlight() {
    if (document.querySelector('.spotlight-scrim')) return;
    var scrim = document.createElement('div');
    scrim.className = 'spotlight-scrim';
    scrim.innerHTML =
      '<div class="spotlight" role="dialog" aria-label="搜索">' +
      '<input type="text" autocomplete="off" spellcheck="false" placeholder="搜索页面、项目、文章…" aria-label="搜索内容">' +
      '<ul class="spot-results" role="listbox"></ul>' +
      '</div>';
    document.body.appendChild(scrim);

    var input = scrim.querySelector('input');
    var list = scrim.querySelector('.spot-results');
    var active = 0;
    var matches = [];

    function render(q) {
      var query = q.trim().toLowerCase();
      matches = query
        ? spotIndex.filter(function (item) {
            return (item.title + ' ' + (item.keywords || '')).toLowerCase().indexOf(query) >= 0;
          })
        : spotIndex.slice(0, 6);
      active = 0;
      list.innerHTML = matches.map(function (m, i) {
        return '<li role="option" aria-selected="' + (i === 0) + '" data-i="' + i + '">' +
          '<span>' + m.title + '</span><span class="spot-kind">' + m.kind + '</span></li>';
      }).join('');
      var empty = scrim.querySelector('.spot-empty');
      if (empty) empty.remove();
      if (query && !matches.length) {
        list.insertAdjacentHTML('afterend', '<p class="spot-empty">没有匹配的内容。原型只包含示例数据。</p>');
      }
    }

    function choose(i) {
      var m = matches[i];
      if (!m) return;
      close();
      openWindow(m.app);
    }
    function close() {
      scrim.remove();
      document.removeEventListener('keydown', onKey, true);
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!matches.length) return;
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length;
        Array.prototype.forEach.call(list.children, function (li, i) {
          li.setAttribute('aria-selected', String(i === active));
        });
        list.children[active].scrollIntoView({ block: 'nearest' });
        return;
      }
      if (e.key === 'Enter') { e.preventDefault(); choose(active); }
    }

    input.addEventListener('input', function () { render(input.value); });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('li[data-i]');
      if (li) choose(Number(li.getAttribute('data-i')));
    });
    scrim.addEventListener('pointerdown', function (e) { if (e.target === scrim) close(); });
    document.addEventListener('keydown', onKey, true);
    render('');
    input.focus();
  }

  /* ---------- 开机序列 ---------- */

  function boot(done) {
    var el = document.querySelector('.boot');
    if (!el || reduceMotion.matches) {
      if (el) el.remove();
      done();
      return;
    }

    /* 开场问候的错峰由 CSS --i 负责，这里只处理超时与跳过 */

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      el.setAttribute('data-done', 'true');
      window.setTimeout(function () { el.remove(); }, 640);
      done();
    }
    el.querySelector('.boot-skip').addEventListener('click', finish);
    document.addEventListener('keydown', function onk(e) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { finish(); document.removeEventListener('keydown', onk); }
    });
    window.setTimeout(finish, 2600);
  }

  /* 自定义光标 + 桌面指针追踪：光晕和纸条跟手，但不 1:1，
     否则会像特效演示而不是一张桌子。 */
  function mountAtmosphere() {
    var cursor = document.querySelector('.cursor');
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (fine && cursor && !reduceMotion.matches) {
      document.body.classList.add('has-cursor');
    }

    document.addEventListener('pointerover', function (e) {
      if (e.target.closest('button, a, .slip, .icon, input, [role="option"]')) {
        document.body.classList.add('is-hovering');
      }
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest('button, a, .slip, .icon, input, [role="option"]')) {
        document.body.classList.remove('is-hovering');
      }
    });

    document.addEventListener('pointermove', function (e) {
      if (!desktop) return;
      var x = e.clientX / window.innerWidth;
      var y = e.clientY / window.innerHeight;
      desktop.style.setProperty('--mx', x.toFixed(3));
      desktop.style.setProperty('--my', y.toFixed(3));
      if (cursor && document.body.classList.contains('has-cursor')) {
        var overChrome = e.target.closest('.window, .spotlight-scrim');
        cursor.style.opacity = overChrome ? '0' : '1';
        cursor.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
      }
    }, { passive: true });
  }

  function mountSlips() {
    var box = document.querySelector('.slips');
    if (!box) return;
    box.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-app]');
      if (!btn) return;
      var app = APPS.filter(function (a) { return a.id === btn.getAttribute('data-app'); })[0];
      if (app) openWindow(app, btn.getBoundingClientRect());
    });
  }

  /* ---------- 启动 ---------- */

  function revealIcons() {
    var icons = document.querySelectorAll('.icon');
    Array.prototype.forEach.call(icons, function (icon, i) {
      icon.style.setProperty('--d', (i * 45) + 'ms');
      icon.classList.add('is-in');
    });
  }

  function mountIcons() {
    var box = document.querySelector('.icons');
    box.innerHTML = APPS.map(function (app) {
      return '<button class="icon" type="button" data-app="' + app.id + '">' +
        '<span class="icon-glyph" aria-hidden="true">' + app.glyph + '</span>' +
        '<span class="icon-label">' + app.title +
        (app.locked ? '<span class="icon-lock"> · 锁</span>' : '') + '</span>' +
        '</button>';
    }).join('');

    box.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-app]');
      if (!btn) return;
      var app = APPS.filter(function (a) { return a.id === btn.getAttribute('data-app'); })[0];
      if (app) openWindow(app, btn.getBoundingClientRect());
    });
  }

  function mountClock() {
    var clock = document.querySelector('.menubar-clock');
    if (!clock) return;
    var fmt = new Intl.DateTimeFormat('zh-CN', { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
    var tick = function () { clock.textContent = fmt.format(new Date()); };
    tick();
    window.setInterval(tick, 20000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    desktop = document.querySelector('.desktop');
    dock = document.querySelector('.dock');
    menubarTitle = document.querySelector('.menubar-title');

    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) { /* 忽略 */ }
    applyTheme(stored || 'dark');

    mountIcons();
    mountClock();
    mountAtmosphere();
    mountSlips();
    mountDockMagnet();

    document.querySelector('[data-theme-toggle]').addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* 忽略 */ }
    });
    document.querySelector('[data-spotlight]').addEventListener('click', openSpotlight);

    dock.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-dock]');
      if (!btn) return;
      var win = windows[btn.getAttribute('data-dock')];
      if (!win) return;
      if (win.getAttribute('data-min') === 'true') {
        win.setAttribute('data-min', 'false');
        bringToFront(win);
      } else if (win.getAttribute('data-focused') === 'true') {
        win.setAttribute('data-min', 'true');
        renderDock();
      } else {
        bringToFront(win);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (document.body.getAttribute('data-phase') !== 'desk') return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSpotlight();
      }
    });

    var hint = document.querySelector('.hint');
    if (hint) {
      hint.querySelector('button').addEventListener('click', function () { hint.remove(); });
    }

    window.addEventListener('proto:enter-desk', revealDesk);
    if (window.__protoIntroDone || reduceMotion.matches || !document.querySelector('.intro')) {
      revealDesk();
    }
  });

  function revealDesk() {
    if (document.body.getAttribute('data-phase') === 'desk') return;
    document.body.setAttribute('data-phase', 'desk');
    var bootEl = document.querySelector('.boot');
    if (bootEl) bootEl.remove();
    revealIcons();
  }
})();
