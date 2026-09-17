/* 原型公共脚本
   职责：注入统一外壳（提示条 / 导航 / 页脚）、主题切换、动效编排、演示交互。
   约定：没有任何真实后端调用；所有"请求"都是本地定时器模拟。

   动效原则（来自 rauno.me《Designing Depth》与 Apple 的流体界面讲座）：
   - 同组元素错峰出现，不要一起跳；错峰本身就是"深度"。
   - 只动 transform / opacity，动画短且可被随时打断。
   - prefers-reduced-motion 下全部退化为直接显示。 */

(function () {
  'use strict';

  var NAV = [
    { href: 'index.html', text: '首页' },
    { href: 'about.html', text: '经历' },
    { href: 'projects.html', text: '项目' },
    { href: 'notes.html', text: '见解' },
    { href: 'ask.html', text: '问答', later: true },
    { href: 'resources.html', text: '资料与服务', later: true },
    { href: 'contact.html', text: '联系' }
  ];

  var UTIL_LINKS = [
    { href: 'admin.html', text: '站长管理端' },
    { href: 'insights.html', text: '访客洞察' },
    { href: 'booking.html', text: '预约与订单' },
    { href: 'states.html', text: '状态与异常清单' },
    { href: 'mobile.html', text: '移动端预览' },
    { href: 'README.md', text: '原型说明' }
  ];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* 嵌入模式：页面被工作台 OS 装进窗口时，隐藏自己的顶部条、导航和页脚，
     因为窗口标题栏和桌面已经承担了这些职责。单独打开时一切照旧。 */
  var embedded = (function () {
    try { return window.self !== window.top; } catch (e) { return true; }
  })();

  function currentFile() {
    var parts = location.pathname.split('/');
    return parts[parts.length - 1] || 'index.html';
  }

  /* ---------- 字体：网络可用时加载，离线自动回退系统字体 ---------- */
  function mountFonts() {
    var pre1 = document.createElement('link');
    pre1.rel = 'preconnect';
    pre1.href = 'https://fonts.googleapis.com';
    var pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://fonts.gstatic.com';
    pre2.crossOrigin = 'anonymous';
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(pre1);
    document.head.appendChild(pre2);
    document.head.appendChild(css);
  }

  /* ---------- 主题 ---------- */
  var THEME_KEY = 'proto-theme';

  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function storedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0b0b0d' : '#fbfbfc';
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? '切换到浅色主题' : '切换到深色主题');
      btn.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
    }
  }

  var ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

  /* ---------- 外壳 ---------- */

  function buildHeader() {
    var here = currentFile();
    var links = NAV.map(function (item) {
      var active = item.href === here ? ' aria-current="page"' : '';
      var cls = item.later ? ' class="nav-later"' : '';
      return '<a href="' + item.href + '"' + cls + active + '>' + item.text + '</a>';
    }).join('');

    return '' +
      '<a class="skip-link" href="#main">跳到主内容</a>' +
      '<div class="proto-bar"><div class="wrap">' +
      '<span>原型演示 v0.1 · 全部个人信息与数据均为示例，未连接任何真实服务</span>' +
      '<span class="proto-actions">' +
      '<button class="mini-btn" type="button" data-annotations-toggle aria-pressed="true">评审标注：开</button>' +
      '<a href="states.html">状态清单</a>' +
      '</span>' +
      '</div></div>' +
      '<header class="site-header"><div class="wrap">' +
      '<a class="brand" href="index.html">' +
      '<span class="brand-name">你的名字</span>' +
      '<span class="brand-sub">示例站点</span>' +
      '</a>' +
      '<div class="nav-zone">' +
      '<nav class="nav" id="main-nav" aria-label="主导航"><span class="nav-indicator" aria-hidden="true"></span>' + links + '</nav>' +
      '<button class="icon-btn theme-toggle" type="button" aria-label="切换主题"></button>' +
      '<button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="打开菜单">' + ICON_MENU + '</button>' +
      '</div>' +
      '</div></header>';
  }

  function buildFooter() {
    var links = UTIL_LINKS.map(function (item) {
      return '<a href="' + item.href + '">' + item.text + '</a>';
    }).join('');
    return '<footer class="site-footer"><div class="wrap">' +
      '<div><span class="eyebrow">原型入口</span><div class="footer-links">' + links + '</div></div>' +
      '<p style="max-width:30em;margin:0">用于评审的静态原型：没有数据库、没有模型调用、没有真实写入。评审通过后才进入实现方案阶段。</p>' +
      '</div></footer>';
  }

  /* 导航滑块：跟随指针在菜单项之间移动，离开时回到当前页 */
  function mountNavIndicator(nav) {
    var indicator = nav.querySelector('.nav-indicator');
    if (!indicator) return;
    var current = nav.querySelector('[aria-current="page"]');

    function moveTo(el, pinned) {
      if (!el) { indicator.removeAttribute('data-pinned'); return; }
      indicator.style.width = el.offsetWidth + 'px';
      indicator.style.transform = 'translateX(' + el.offsetLeft + 'px)';
      indicator.setAttribute('data-pinned', pinned ? 'true' : 'false');
    }

    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (link) {
      link.addEventListener('pointerenter', function () { moveTo(link, true); });
      link.addEventListener('focus', function () { moveTo(link, true); });
    });
    nav.addEventListener('pointerleave', function () { moveTo(current, !!current); });
    // 初始停在当前页上；用 rAF 等布局稳定后再量尺寸
    requestAnimationFrame(function () { moveTo(current, !!current); });
    window.addEventListener('resize', function () { moveTo(current, !!current); });
  }

  function mountChrome() {
    if (embedded) {
      document.documentElement.setAttribute('data-embedded', 'true');
      var hSlot = document.querySelector('[data-slot="header"]');
      if (hSlot) hSlot.remove();
      var fSlot = document.querySelector('[data-slot="footer"]');
      if (fSlot) fSlot.remove();
      var m = document.querySelector('main');
      if (m && !m.id) m.id = 'main';
      // 评审标注开关由外壳统一控制，嵌入时沿用上次选择
      var annState = null;
      try { annState = localStorage.getItem('proto-annotations'); } catch (e) { /* 忽略 */ }
      document.documentElement.setAttribute('data-annotations', annState === 'off' ? 'off' : 'on');
      return;
    }

    var headSlot = document.querySelector('[data-slot="header"]');
    if (headSlot) headSlot.outerHTML = buildHeader();
    var footSlot = document.querySelector('[data-slot="footer"]');
    if (footSlot) footSlot.outerHTML = buildFooter();

    var main = document.querySelector('main');
    if (main) {
      if (!main.id) main.id = 'main';
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
    }

    if (!document.querySelector('meta[name="theme-color"]')) {
      var meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    applyTheme(document.documentElement.getAttribute('data-theme') || storedTheme() || systemTheme());

    var themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* 隐私模式下忽略 */ }
      });
    }

    var nav = document.getElementById('main-nav');
    var navToggle = document.querySelector('.nav-toggle');
    if (nav && navToggle) {
      navToggle.addEventListener('click', function () {
        var open = nav.getAttribute('data-open') === 'true';
        nav.setAttribute('data-open', String(!open));
        navToggle.setAttribute('aria-expanded', String(!open));
        navToggle.setAttribute('aria-label', open ? '打开菜单' : '关闭菜单');
      });
    }
    if (nav) mountNavIndicator(nav);

    // 滚动后头部才出现分隔线，未滚动时保持干净
    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () {
        header.setAttribute('data-scrolled', String(window.scrollY > 4));
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // 评审标注开关
    var annBtn = document.querySelector('[data-annotations-toggle]');
    if (annBtn) {
      var stored = null;
      try { stored = localStorage.getItem('proto-annotations'); } catch (e) { /* 忽略 */ }
      var setAnn = function (on) {
        document.documentElement.setAttribute('data-annotations', on ? 'on' : 'off');
        annBtn.textContent = '评审标注：' + (on ? '开' : '关');
        annBtn.setAttribute('aria-pressed', String(on));
        try { localStorage.setItem('proto-annotations', on ? 'on' : 'off'); } catch (e) { /* 忽略 */ }
      };
      setAnn(stored !== 'off');
      annBtn.addEventListener('click', function () {
        setAnn(document.documentElement.getAttribute('data-annotations') !== 'on');
      });
    }
  }

  /* ---------- 入场编排 ----------
     首屏元素按顺序错峰淡入；屏幕外的内容滚动到视口时再出现。
     同一组的兄弟元素依次延迟 55ms——这是"深度"的来源。 */
  function mountReveal() {
    if (reduceMotion.matches) return;

    var groups = document.querySelectorAll('[data-reveal]');
    var items = [];
    Array.prototype.forEach.call(groups, function (group) {
      var children = group.children.length ? Array.prototype.slice.call(group.children) : [group];
      children.forEach(function (child, i) {
        child.classList.add('reveal');
        child.style.setProperty('--reveal-delay', (i * 55) + 'ms');
        items.push(child);
      });
    });

    // 没有显式标注的页面：按小节自动编排，保证全站动效一致
    if (!items.length) {
      Array.prototype.forEach.call(document.querySelectorAll('main .section > .wrap, main .section > .wrap-narrow'), function (block) {
        Array.prototype.slice.call(block.children).forEach(function (child, i) {
          child.classList.add('reveal');
          child.style.setProperty('--reveal-delay', (Math.min(i, 6) * 45) + 'ms');
          items.push(child);
        });
      });
    }
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 证据标记 ---------- */
  function mountRefTokens() {
    var tokens = document.querySelectorAll('.ref-token[data-ref]');
    Array.prototype.forEach.call(tokens, function (token) {
      var id = token.getAttribute('data-ref');
      var source = document.getElementById('src-' + id);
      if (!source) return;
      function mark(on) {
        source.classList.toggle('is-marked', on);
        token.classList.toggle('is-active', on);
      }
      token.addEventListener('pointerenter', function () { mark(true); });
      token.addEventListener('pointerleave', function () { mark(false); });
      token.addEventListener('focus', function () { mark(true); });
      token.addEventListener('blur', function () { mark(false); });
      token.addEventListener('click', function () {
        source.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        mark(true);
      });
    });
  }

  function mountStateSwitches() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-state-switch]'), function (select) {
      var group = select.getAttribute('data-state-switch');
      function apply() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-state-group="' + group + '"]'), function (panel) {
          panel.hidden = panel.getAttribute('data-state') !== select.value;
        });
      }
      select.addEventListener('change', apply);
      apply();
    });
  }

  function mountTabs() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-tab-target]'), function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.getAttribute('data-tab-group');
        Array.prototype.forEach.call(document.querySelectorAll('[data-tab-group="' + group + '"]'), function (peer) {
          var panel = document.getElementById(peer.getAttribute('data-tab-target'));
          var selected = peer === btn;
          peer.setAttribute('aria-selected', String(selected));
          if (panel) panel.hidden = !selected;
        });
      });
    });
  }

  /* 主按钮轻微跟手：按下之前就有反应，比单纯 hover 抬起更像一个物件。 */
  function mountMagnetic() {
    if (reduceMotion.matches || window.matchMedia('(hover: none)').matches) return;
    Array.prototype.forEach.call(document.querySelectorAll('.btn-primary'), function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.18;
        var y = (e.clientY - (r.top + r.height / 2)) * 0.22;
        btn.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transform = '';
      });
    });
  }

  window.Proto = {
    fakeRequest: function (loadingEl, done, delay) {
      if (loadingEl) loadingEl.hidden = false;
      window.setTimeout(function () {
        if (loadingEl) loadingEl.hidden = true;
        done();
      }, delay || 900);
    },
    escape: function (text) {
      return String(text).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
      });
    },
    now: function () {
      return new Intl.DateTimeFormat('zh-CN', {
        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
      }).format(new Date());
    }
  };

  // 主题尽早应用，避免深色偏好下先闪一下白底
  applyTheme(storedTheme() || systemTheme());
  mountFonts();

  document.addEventListener('DOMContentLoaded', function () {
    mountChrome();
    mountStateSwitches();
    mountTabs();
    mountRefTokens();
    mountReveal();
    mountMagnetic();
  });
})();
