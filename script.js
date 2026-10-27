// Mateusz Sal — portfolio · interactive demo widgets
// 1) Portfolio vs benchmark chart (period switch + hover tooltip)
// 2) Market sessions table (viewer time-zone switch)
// All numbers are generated demo data.

(function () {
  'use strict';

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const signed = (v, digits, unit) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(digits) + unit;
  const pad = (v) => String(v).padStart(2, '0');

  /* ---------- 1. Performance chart ---------- */

  // Deterministic demo series: 252 business days ending 06 Oct 2026.
  function buildSeries() {
    let seed = 5074;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const gauss = () => {
      let u = 0;
      while (u === 0) u = rnd();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
    };
    const N = 252;
    const bench = [100];
    const port = [100];
    for (let i = 1; i < N; i++) {
      const market = 0.00028 + 0.0068 * gauss();
      bench.push(bench[i - 1] * (1 + market));
      port.push(port[i - 1] * (1 + market + 0.0001 + 0.0024 * gauss()));
    }
    const dates = [];
    const d = new Date(Date.UTC(2026, 9, 6));
    while (dates.length < N) {
      const day = d.getUTCDay();
      if (day !== 0 && day !== 6) dates.unshift(new Date(d.getTime()));
      d.setUTCDate(d.getUTCDate() - 1);
    }
    const ytdStart = dates.findIndex((x) => x.getUTCFullYear() === 2026);
    return { bench, port, dates, ytdStart };
  }

  function initChart() {
    const root = document.getElementById('perf-chart');
    if (!root) return;

    const S = buildSeries();
    const W = 720, H = 280, L = 44, R = 92, T = 14, B = 30;
    const el = (id) => document.getElementById(id);
    const fmtDate = (dt, withYear) =>
      dt.getUTCDate() + ' ' + MONTHS[dt.getUTCMonth()] + (withYear ? ' ' + dt.getUTCFullYear() : '');

    let view = null;

    function render(range) {
      const lengths = { '1M': 21, '3M': 63, 'YTD': S.port.length - S.ytdStart, '1Y': S.port.length };
      const n = lengths[range];
      const start = S.port.length - n;
      const p = S.port.slice(start).map((v) => (v / S.port[start]) * 100);
      const b = S.bench.slice(start).map((v) => (v / S.bench[start]) * 100);
      const dts = S.dates.slice(start);

      let lo = Math.min(...p, ...b);
      let hi = Math.max(...p, ...b);
      const raw = (hi - lo) / 4;
      const mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((k) => k >= raw);
      lo = Math.floor(lo / step) * step;
      hi = Math.ceil(hi / step) * step;

      const x = (i) => L + (i / (n - 1)) * (W - L - R);
      const y = (v) => T + ((hi - v) / (hi - lo)) * (H - T - B);
      const path = (arr) => arr.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join('');

      // grid + ticks
      let grid = '';
      let ticks = '';
      for (let v = lo; v <= hi + 1e-9; v += step) {
        grid += 'M' + L + ' ' + y(v).toFixed(1) + 'H' + (W - R);
        ticks += `<span class="tick tick-y" style="top:${((y(v) / H) * 100).toFixed(2)}%">${v.toFixed(step < 1 ? 1 : 0)}</span>`;
      }
      const xi = [0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1];
      xi.forEach((i, k) => {
        const shift = k === 0 ? 0 : k === 3 ? -100 : -50;
        ticks += `<span class="tick tick-x" style="left:${((x(i) / W) * 100).toFixed(2)}%;transform:translateX(${shift}%)">${fmtDate(dts[i], range === '1Y' && k === 0)}</span>`;
      });

      el('perf-grid').setAttribute('d', grid);
      el('perf-bench').setAttribute('d', path(b));
      el('perf-port').setAttribute('d', path(p));
      el('perf-ticks').innerHTML = ticks;

      // direct end labels (nudged apart when close)
      const pR = p[n - 1] - 100;
      const bR = b[n - 1] - 100;
      let pY = y(p[n - 1]);
      let bY = y(b[n - 1]);
      if (Math.abs(pY - bY) < 30) {
        const mid = (pY + bY) / 2;
        if (pY <= bY) { pY = mid - 15; bY = mid + 15; } else { pY = mid + 15; bY = mid - 15; }
      }
      const endLeft = (((x(n - 1) + 8) / W) * 100).toFixed(2) + '%';
      Object.assign(el('perf-plab').style, { left: endLeft, top: ((pY / H) * 100).toFixed(2) + '%' });
      Object.assign(el('perf-blab').style, { left: endLeft, top: ((bY / H) * 100).toFixed(2) + '%' });
      el('perf-pret').textContent = signed(pR, 1, '%');
      el('perf-bret').textContent = signed(bR, 1, '%');
      el('perf-desc').textContent = `Portfolio ${signed(pR, 1, '%')} versus benchmark ${signed(bR, 1, '%')} over ${range}`;

      view = { n, p, b, dts, x, y };
      hideHover();
    }

    function showHover(i) {
      const { p, b, dts, x, y } = view;
      const hx = x(i);
      const frac = hx / W;
      ['perf-x', 'perf-hb', 'perf-hp'].forEach((id) => el(id).setAttribute('opacity', '1'));
      el('perf-x').setAttribute('x1', hx);
      el('perf-x').setAttribute('x2', hx);
      el('perf-hb').setAttribute('cx', hx);
      el('perf-hb').setAttribute('cy', y(b[i]));
      el('perf-hp').setAttribute('cx', hx);
      el('perf-hp').setAttribute('cy', y(p[i]));

      const tip = el('perf-tip');
      el('tip-date').textContent = fmtDate(dts[i], true);
      el('tip-p').textContent = signed(p[i] - 100, 2, '%');
      el('tip-b').textContent = signed(b[i] - 100, 2, '%');
      el('tip-d').textContent = signed(p[i] - b[i], 2, ' pp');
      const shift = frac > 0.62 ? -100 : frac < 0.3 ? 0 : -50;
      const margin = frac > 0.62 ? -12 : frac < 0.3 ? 12 : 0;
      Object.assign(tip.style, {
        left: (frac * 100).toFixed(2) + '%',
        transform: `translateX(${shift}%)`,
        marginLeft: margin + 'px',
      });
      tip.hidden = false;
    }

    function hideHover() {
      ['perf-x', 'perf-hb', 'perf-hp'].forEach((id) => el(id).setAttribute('opacity', '0'));
      el('perf-tip').hidden = true;
    }

    root.addEventListener('mousemove', (e) => {
      const rect = root.getBoundingClientRect();
      const vx = ((e.clientX - rect.left) / rect.width) * W;
      const i = Math.max(0, Math.min(view.n - 1, Math.round(((vx - L) / (W - L - R)) * (view.n - 1))));
      showHover(i);
    });
    root.addEventListener('mouseleave', hideHover);

    document.querySelectorAll('[data-range]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-range]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        render(btn.dataset.range);
      });
    });

    render('YTD');
  }

  /* ---------- 2. Market sessions ---------- */

  const REF = Date.UTC(2026, 9, 6, 14, 0); // 06 Oct 2026, 14:00 UTC
  const FX_FIX = Date.UTC(2026, 9, 6, 12, 15); // ECB reference rate time
  const MARKETS = [
    { city: 'Tokyo', ex: 'TSE', tz: 'Asia/Tokyo', ccy: 'JPY', open: 540, close: 930 },
    { city: 'London', ex: 'LSE', tz: 'Europe/London', ccy: 'GBP', open: 480, close: 990 },
    { city: 'Frankfurt', ex: 'Xetra', tz: 'Europe/Berlin', ccy: 'EUR', open: 540, close: 1050 },
    { city: 'New York', ex: 'NYSE', tz: 'America/New_York', ccy: 'USD', open: 570, close: 960 },
    { city: 'Warsaw', ex: 'GPW', tz: 'Europe/Warsaw', ccy: 'PLN', open: 540, close: 1020 },
  ];
  const TZ_SHORT = { 'Europe/Warsaw': 'Warsaw', 'Europe/London': 'London', 'America/New_York': 'NY', 'Asia/Singapore': 'SG' };

  function partsIn(ms, timeZone) {
    const f = new Intl.DateTimeFormat('en-GB', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    });
    const o = {};
    f.formatToParts(new Date(ms)).forEach((p) => { o[p.type] = p.value; });
    return { y: +o.year, mo: +o.month, d: +o.day, h: +o.hour, mi: +o.minute };
  }

  function renderSessions(viewerTz) {
    const body = document.getElementById('tz-body');
    if (!body) return;
    const viewer = partsIn(REF, viewerTz);
    const viewerDay = Date.UTC(viewer.y, viewer.mo - 1, viewer.d);

    body.innerHTML = MARKETS.map((m) => {
      const lp = partsIn(REF, m.tz);
      const localMin = lp.h * 60 + lp.mi;
      const offset = Date.UTC(lp.y, lp.mo - 1, lp.d, lp.h, lp.mi) - REF;
      const closeUtc = Date.UTC(lp.y, lp.mo - 1, lp.d + (localMin >= m.close ? 1 : 0)) + m.close * 60000 - offset;
      const cv = partsIn(closeUtc, viewerTz);
      const dayDiff = Math.round((Date.UTC(cv.y, cv.mo - 1, cv.d) - viewerDay) / 86400000);
      const isOpen = localMin >= m.open && localMin < m.close;
      const left = m.close - localMin;

      let st;
      if (isOpen && left <= 60) st = { icon: '◆', label: `Closes in ${left} min`, bg: 'rgba(250,178,25,0.12)', fg: '#FAB219' };
      else if (isOpen) st = { icon: '✓', label: 'Open', bg: 'rgba(12,163,12,0.14)', fg: '#4ADE80' };
      else st = { icon: '○', label: 'Closed', bg: 'rgba(255,255,255,0.06)', fg: '#A1A1B0' };

      const close = pad(cv.h) + ':' + pad(cv.mi) + (dayDiff ? ` ${dayDiff > 0 ? '+' : ''}${dayDiff}d` : '');
      const td = 'padding: 11px 10px; border-bottom: 1px solid rgba(255,255,255,0.06)';
      return `<tr>
        <td style="${td}; padding-left: 0"><span style="font-weight: 500">${m.city}</span> <span class="mono" style="font-size: 12px; color: #8B8B9A">${m.ex}</span></td>
        <td class="mono" style="${td}; font-size: 13px; color: #D4D4DC">${m.ccy}</td>
        <td class="mono" style="${td}; text-align: right; font-size: 13px">${pad(lp.h)}:${pad(lp.mi)}</td>
        <td class="mono" style="${td}; text-align: right; font-size: 13px">${close}</td>
        <td style="${td}; padding-right: 0"><span class="status-chip" style="background: ${st.bg}; color: ${st.fg}">${st.icon} ${st.label}</span></td>
      </tr>`;
    }).join('');

    document.querySelectorAll('[data-tz-short]').forEach((n) => { n.textContent = TZ_SHORT[viewerTz]; });
    const fx = partsIn(FX_FIX, viewerTz);
    const fxEl = document.getElementById('fx-local');
    if (fxEl) fxEl.textContent = pad(fx.h) + ':' + pad(fx.mi);
  }

  function initSessions() {
    const buttons = document.querySelectorAll('[data-tz]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        renderSessions(btn.dataset.tz);
      });
    });
    renderSessions('Europe/Warsaw');
  }

  function initMobileNavigation() {
    const toggle = document.querySelector('.mobile-nav-toggle');
    const dialog = document.getElementById('mobile-navigation');
    if (!toggle || !dialog || typeof dialog.showModal !== 'function') return;

    const mobileViewport = window.matchMedia('(max-width: 767px)');
    toggle.hidden = !mobileViewport.matches;
    document.documentElement.classList.add('nav-ready');
    toggle.addEventListener('click', () => {
      if (!mobileViewport.matches) return;
      dialog.showModal();
      toggle.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('mobile-nav-open');
    });
    dialog.querySelector('.mobile-nav-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target.closest('a[href^="#"]')) dialog.close();
      if (event.target === dialog) {
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
      }
    });
    dialog.addEventListener('close', () => {
      toggle.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('mobile-nav-open');
    });
    mobileViewport.addEventListener('change', (event) => {
      toggle.hidden = !event.matches;
      if (!event.matches && dialog.open) dialog.close();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNavigation();
    initChart();
    initSessions();
  });
})();
