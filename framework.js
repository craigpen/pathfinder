// ============================================================================
// PATHFINDER FRAMEWORK - Universal boilerplate for all pathfinders
// ============================================================================
// Contains: CSS, data loading, state management, routing, UI builders, event dispatchers
// Each pathfinder provides: config.js (path), helpers.js (domain logic), renderers.js (renders)

// ===== SHARED CONSTANTS =====
const PLAYLISTS = {
  lofi: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/dabootlegboy/sets/study-chill-lofi-hiphop&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false',
  groovy: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/wearestereofox/sets/groovy-beats&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false',
  relax: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/ambientchill-sc/sets/relaxing-ambient-music-2&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false',
  zen: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/binauralbeatsresearch/sets/theta-waves-zen-meditation&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false'
};

const FALLBACK_HDR_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='420'><rect width='1600' height='420' fill='%23667eea'/><text x='40' y='80' fill='white' font-size='28'>Pathfinder</text></svg>";
const HEADER_PHOTOS = [{src: FALLBACK_HDR_SVG}];

// Header carousel state (shared across all pathfinders)
let hdrIdx = 0, hdrTimer = null, hdrPaused = false, hdrPoolKey = '';

// ===== INJECT SHARED CSS =====
const styleElement = document.createElement('style');
styleElement.textContent = `
*{margin:0;padding:0;box-sizing:border-box}
:root{--pri:#2563eb;--sec:#0891b2;--ok:#16a34a;--warn:#ea580c;--bad:#dc2626;--dk:#1e293b;--lt:#f1f5f9;--bdr:#e2e8f0;--tx:#334155;--tx2:#64748b;--tx0:#1e293b;--tx1:#334155}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Segoe UI Emoji',Roboto,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);background-size:200% 200%;animation:gradientShift 28s ease-in-out infinite;min-height:100vh;padding:16px;color:var(--tx)}
@keyframes gradientShift{0%,100%{background-position:0% 0%}50%{background-position:100% 100%}}
.ctr{max-width:1200px;margin:0 auto;background:#fff;border-radius:14px;box-shadow:0 16px 50px rgba(0,0,0,.3);overflow:hidden}
.hdr{position:relative;height:238px;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-start}
.version-badge{position:absolute;bottom:8px;right:12px;z-index:10;font-size:10px;color:rgba(255,255,255,0.6);font-weight:500;text-shadow:0 1px 2px rgba(0,0,0,0.3)}
.hdr-bg{position:absolute;inset:0;z-index:0}
.hdr-bg img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 2.2s ease;will-change:opacity}
.hdr-bg img.active{opacity:1}
.hdr-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.35),rgba(0,0,0,.65));z-index:1}
.hdr-content{position:relative;z-index:2;padding:16px 24px;display:flex;flex-direction:column;align-items:flex-start}
.hdr-top{text-align:left;margin-bottom:8px}
.hdr h1{font-size:26px;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.4)}
.hdr p{font-size:14px;color:rgba(255,255,255,.9);font-weight:300}
.hdr-music{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px}
.music-toggle{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.35);border-radius:6px;padding:6px 12px;color:#fff;cursor:pointer;font-size:13px;font-weight:600;transition:.2s;white-space:nowrap;flex-shrink:0}
.music-toggle:hover{background:rgba(255,255,255,.3)}
.music-toggle.active{background:rgba(255,255,255,.3)}
.playlist-pills{display:none;gap:5px;align-items:center;flex-shrink:0}
.playlist-pills.show{display:flex}
.pp{padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,.35);background:transparent;color:#fff;transition:.15s;white-space:nowrap}
.pp:hover,.pp.active{background:rgba(255,255,255,.25)}
.spotify-wrap{display:block;width:320px;margin-top:2px;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.12);height:85px;visibility:hidden;pointer-events:none}
.spotify-frame{width:100%;height:85px;border:0;display:block}
.spotify-wrap.show{visibility:visible;pointer-events:auto}
.tabs{display:flex;background:var(--lt);border-bottom:2px solid var(--bdr);width:100%;overflow-x:auto;overflow-y:hidden}
.tb{flex:0 0 auto;padding:12px 8px;border:none;background:none;cursor:pointer;font-size:13px;font-weight:600;color:var(--tx2);transition:.2s;white-space:nowrap;text-align:center;min-width:90px}
@media (min-aspect-ratio: 1 / 1.2) { .tabs{overflow:hidden} .tb{flex:1} }
.tb:hover{background:rgba(37,99,235,.05);color:var(--tx)}
.tb.on{color:var(--pri);border-bottom:3px solid var(--pri);background:#fff;margin-bottom:-2px}
.pan{display:none;padding:24px;animation:fi .25s}
.pan.on{display:block}
@keyframes fi{from{opacity:1;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.qb{margin-bottom:22px}
.ql{font-size:12px;font-weight:700;color:var(--pri);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.qt{font-size:18px;font-weight:700;margin-bottom:10px;color:var(--dk)}
.qs{font-size:13px;color:var(--tx2);margin-bottom:10px;line-height:1.5}
.rc{background:linear-gradient(135deg,#f8fafc,#f1f5f9);border-left:4px solid var(--pri);padding:14px;border-radius:7px;margin:12px 0}
.rc h4{font-size:15px;font-weight:700;color:var(--dk);margin-bottom:4px}
.rc p{font-size:14px;line-height:1.5}
.badge{display:inline-block;background:var(--pri);color:#fff;padding:4px 10px;border-radius:16px;font-size:12px;font-weight:700;margin:6px 4px 6px 0}
.ib{background:rgba(37,99,235,.05);border-left:4px solid var(--pri);padding:12px;border-radius:5px;margin:12px 0;font-size:13px;line-height:1.6}
.ib b{color:var(--pri)}
.dh{background:rgba(250,204,21,.1);border-left:3px solid #fbbf24;padding:12px;border-radius:5px;margin:12px 0;font-size:13px;line-height:1.6}
.dh b{color:#d97706}
.bg{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;margin-top:20px;align-items:center}
.pos-left{justify-self:start}
.pos-center{justify-self:center}
.pos-right{justify-self:end}
.spacer{display:none}
.btn{padding:9px 16px;border:none;border-radius:5px;font-weight:600;cursor:pointer;transition:.15s;font-size:13px}
.bp{background:var(--pri);color:#fff}.bp:hover{background:#1d4ed8}
.bs{background:var(--lt);color:var(--tx);border:1px solid var(--bdr)}.bs:hover{background:var(--bdr)}
.br{background:rgba(220,38,38,.08);color:var(--bad);border:1px solid rgba(220,38,38,.2)}.br:hover{background:rgba(220,38,38,.15)}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}
.cd{background:var(--lt);padding:14px;border-radius:7px;border:1px solid var(--bdr)}
.cd h3{font-size:14px;font-weight:700;margin-bottom:6px;color:var(--dk)}
.cd p{font-size:13px;line-height:1.4;color:var(--tx)}
.ss{background:var(--lt);padding:14px;border-radius:7px;margin:12px 0}
.ss h3{font-weight:700;margin-bottom:8px;color:var(--dk);font-size:14px}
.ss ul{list-style:none;font-size:13px;line-height:1.7}
.ss li{padding:2px 0}.ss li:before{content:"→ ";color:var(--pri);font-weight:bold;margin-right:5px}
.rl{list-style:none;margin:6px 0}
.rl li{padding:6px 0;border-bottom:1px solid var(--bdr);font-size:13px}
.rl li:last-child{border-bottom:none}
.rl a{color:var(--pri);text-decoration:none;font-weight:500}.rl a:hover{text-decoration:underline}
.tli{padding:8px 0 8px 14px;border-left:3px solid var(--pri);margin-left:5px;font-size:13px;line-height:1.4}
.tli b{color:var(--dk)}
.pills{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0}
.pill{white-space:nowrap}
.highlight-tag{display:inline;background:rgba(37,99,235,.1);padding:2px 4px;border-radius:2px;color:var(--pri);font-weight:600;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.pill{padding:4px 10px;border-radius:14px;font-size:13px;font-weight:600;cursor:pointer;border:2px solid var(--bdr);transition:.15s;background:#f9fafb;user-select:none;box-shadow:0 1px 2px rgba(0,0,0,.04);line-height:1.4}
.pill:hover{border-color:var(--pri);background:#ffffff}.pill.on{border-color:var(--pri);background:rgba(37,99,235,.1);color:var(--pri)}
table.ct{width:100%;table-layout:fixed;border-collapse:collapse;font-size:13px;margin:12px 0}
.ct th,.ct td{padding:8px 10px;text-align:left;border-bottom:1px solid var(--bdr);vertical-align:top}
.ct th{background:var(--lt);font-weight:700;color:var(--dk);position:sticky;top:0;z-index:1} .ct th:first-child{width:160px}
.ct th.ch{text-align:center}
.ct td.al{font-weight:600;color:var(--dk);width:160px;background:rgba(241,245,249,.5)}
.ct td{line-height:1.4}
.ct tr:hover td:not(.al){background:rgba(37,99,235,.02)}
.ct .win{background:rgba(22,163,74,.08);font-weight:600}
.ct .res-row td{background:rgba(37,99,235,.03);font-size:12px}
.xr{cursor:pointer;font-size:11px;color:var(--bad);margin-left:5px;opacity:.7}.xr:hover{opacity:1}
.cost-bar{height:16px;border-radius:3px;margin:2px 0;font-size:11px;color:#fff;line-height:16px;padding:0 6px;font-weight:600;display:inline-block;min-width:30px;transition:width .3s}
.slider-row{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:13px}
.carousel-container,.uni-inner{display:flex;gap:6px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 0;margin:8px 0}
.carousel-card,.insights-carousel-card,.uni-country-slide,.uni-card{flex:0 0 calc(100vw - 28px);scroll-snap-align:start;border-radius:6px;border:1px solid var(--bdr);padding:12px;background:var(--lt);cursor:grab;user-select:none}
.carousel-card:active,.insights-carousel-card:active,.uni-country-slide:active,.uni-card:active{cursor:grabbing}
@media (min-aspect-ratio: 1 / 1.2) { .carousel-container,.uni-inner{flex-wrap:wrap} .carousel-card,.insights-carousel-card,.uni-country-slide,.uni-card{flex:0 1 calc(50% - 6px)} }
.carousel-indicator,.uni-inner-indicator{font-size:11px;color:var(--tx2);text-align:center;margin-top:4px}
`;
document.head.appendChild(styleElement);

// ============================================================================
// DATA LOADING - Generic pattern, works for any pathfinder
// ============================================================================
async function loadDataFile(config) {
  const { name, path, onSuccess } = config;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // Store on window (convert to SCREAMING_SNAKE_CASE)
    const varName = name.toUpperCase().replace(/-/g, '_');
    window[varName] = data;
    window[`${varName}_LOADED`] = true;

    if (onSuccess) onSuccess(data);
    return true;
  } catch (error) {
    console.error(`✗ Failed to load ${name}:`, error.message);
    return false;
  }
}

// ============================================================================
// IMAGE & CAROUSEL UTILITIES
// ============================================================================
function wideImg(u) {
  try {
    u = (u || '').trim();
    if (!u) return u;
    if (u.startsWith('data:')) return u;
    const base = u.split('?')[0];
    return base + '?w=1600&h=420&fit=crop&q=80';
  } catch (e) {
    return u;
  }
}

function poolKeyFor(pool) {
  return pool.map(p => p.src).join('|');
}

async function filterBroken(pool) {
  const tested = await Promise.allSettled(
    pool.map(p => new Promise((res) => {
      const img = new Image();
      img.onload = () => res(p);
      img.onerror = () => res(null);
      img.src = wideImg(p.src);
      setTimeout(() => res(null), 2000);
    }))
  );
  return tested.map(r => r.status === 'fulfilled' ? r.value : null).filter(p => p !== null);
}

function bindHdrHoverPause() {
  const hdr = document.querySelector('.hdr');
  if (!hdr || hdr.dataset.hoverPause === '1') return;
  hdr.dataset.hoverPause = '1';
  hdr.addEventListener('mouseenter', () => { hdrPaused = true; });
  hdr.addEventListener('mouseleave', () => { hdrPaused = false; });
}

function renderHdrImages(pool) {
  const bg = document.getElementById('hdr-bg');
  if (!bg) return [];
  bg.innerHTML = pool.map((p, i) => `<img src="${wideImg(p.src)}" alt="Header image" class="${i === 0 ? 'active' : ''}">`).join('');
  const imgs = [...bg.querySelectorAll('img')];
  imgs.forEach(im => { im.onerror = () => { im.onerror = null; im.src = FALLBACK_HDR_SVG; }; });
  return imgs;
}

function startHdrCarousel() {
  if (hdrTimer) clearInterval(hdrTimer);
  bindHdrHoverPause();
  const pool = window.HEADER_PHOTOS || [];
  Promise.resolve(filterBroken(pool)).then((goodPool) => {
    const finalPool = (goodPool && goodPool.length) ? goodPool : pool;
    const key = poolKeyFor(finalPool);
    let imgs;
    if (key !== hdrPoolKey) {
      hdrPoolKey = key;
      imgs = renderHdrImages(finalPool);
    } else {
      const bg = document.getElementById('hdr-bg');
      imgs = bg ? [...bg.querySelectorAll('img')] : [];
    }
    if (!imgs || !imgs.length) return;
    imgs.forEach((im, i) => im.classList.toggle('active', i === 0));
    hdrIdx = 0;
    hdrTimer = setInterval(() => {
      if (hdrPaused) return;
      imgs[hdrIdx].classList.remove('active');
      hdrIdx = (hdrIdx + 1) % imgs.length;
      imgs[hdrIdx].classList.add('active');
    }, 10000);
  }).catch(() => {
    const bg = document.getElementById('hdr-bg');
    const imgs = bg ? [...bg.querySelectorAll('img')] : [];
    if (!imgs || !imgs.length) return;
    imgs.forEach((im, i) => im.classList.toggle('active', i === 0));
    hdrIdx = 0;
    hdrTimer = setInterval(() => {
      if (hdrPaused) return;
      imgs[hdrIdx].classList.remove('active');
      hdrIdx = (hdrIdx + 1) % imgs.length;
      imgs[hdrIdx].classList.add('active');
    }, 10000);
  });
}

async function buildSelectors(selectorsConfig, containerId = 'discover') {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    let html = '';
    selectorsConfig.forEach(selector => {
      html += `
        <div class="qb">
          <div class="ql">${selector.label}</div>
          <div class="qt">${selector.title}</div>
          <div class="qs">${selector.description}</div>
          <div class="pills" data-q="${selector.id}"></div>
        </div>
      `;
    });

    // Insert selectors into discover tab, preserving button bar
    const buttonBar = container.querySelector('.bg');
    if (buttonBar) {
      // Insert selectors before the button bar
      buttonBar.insertAdjacentHTML('beforebegin', html);
    } else {
      // No button bar, just add selectors
      container.innerHTML = html;
    }

    console.log(`✓ Built ${selectorsConfig.length} discovery selectors`);
  } catch (error) {
    console.error('✗ Failed to build selectors:', error.message);
  }
}

async function buildHeader(config) {
  const container = document.getElementById('header-container');
  if (!container) return;

  try {
    // Load header images from JSON
    const imagesRes = await fetch(`data/${config.imagesFile}`);
    if (!imagesRes.ok) throw new Error(`HTTP ${imagesRes.status}`);
    const imagesData = await imagesRes.json();
    const imageUrls = imagesData.images || [];

    // Build image carousel HTML
    let imagesHtml = imageUrls
      .map((url, i) => `<img alt="Header image" class="${i === 0 ? 'active' : ''}" src="${url}"/>`)
      .join('');

    // Build music controls HTML
    let musicHtml = '';
    if (config.enableMusic) {
      musicHtml = `
        <div class="hdr-music">
          <button class="music-toggle" id="music-btn" onclick="toggleMusic()">🎵 Tunes</button>
          <div class="playlist-pills" id="playlist-pills">
            <button class="pp" onclick="selPlaylist('lofi', this)">LoFi</button>
            <button class="pp" onclick="selPlaylist('groovy', this)">Groovy</button>
            <button class="pp" onclick="selPlaylist('relax', this)">Relax</button>
            <button class="pp" onclick="selPlaylist('zen', this)">Zen</button>
          </div>
        </div>
        <div class="spotify-wrap" id="spotify-wrap">
          <iframe allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" class="spotify-frame" frameborder="0" id="spotify-frame" loading="lazy" src="about:blank"></iframe>
        </div>
      `;
    }

    // Build complete header HTML
    const headerHtml = `
      <div class="hdr">
        <div class="version-badge" id="version-badge"></div>
        <div class="hdr-bg" id="hdr-bg">${imagesHtml}</div>
        <div class="hdr-content">
          <div class="hdr-top">
            <h1>${config.title}</h1>
            <p>${config.subtitle}</p>
          </div>
          ${musicHtml}
        </div>
      </div>
    `;

    container.innerHTML = headerHtml;

    // Set version badge if available
    if (window.VERSION) {
      const badge = document.getElementById('version-badge');
      if (badge) badge.innerText = window.VERSION;
    }

    // Initialize carousel
    setTimeout(() => initHdrCarousel(), 100);

    console.log(`✓ Built header: "${config.title}"`);
  } catch (error) {
    console.error('✗ Failed to build header:', error.message);
  }
}

function initHdrCarousel() { startHdrCarousel(); }
function updateHdrCarousel() { startHdrCarousel(); }

// ============================================================================
// MUSIC PLAYER
// ============================================================================
function toggleMusic() {
  const pills = document.getElementById('playlist-pills');
  const sw = document.getElementById('spotify-wrap');
  const on = pills.classList.toggle('show');
  const btn = document.getElementById('music-btn');
  btn.classList.toggle('active', on);
  if (!on) {
    sw.classList.remove('show');
    document.querySelectorAll('.pp').forEach(b => b.classList.remove('active'));
    if (window.S) window.S.playlist = null;
    const frame = document.getElementById('spotify-frame');
    if (frame) frame.src = 'about:blank';
  }
}

function selPlaylist(playlist, el) {
  if (!document.getElementById('playlist-pills').classList.contains('show')) return;
  if (window.S) window.S.playlist = playlist;
  document.querySelectorAll('.pp').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const sw = document.getElementById('spotify-wrap');
  if (sw) sw.classList.add('show');
  const frame = document.getElementById('spotify-frame');
  if (frame && window.PLAYLISTS) frame.src = window.PLAYLISTS[playlist];
}

// ============================================================================
// TABLE & CAROUSEL BUILDERS
// ============================================================================
function buildTableHTML(rows, columnKeys, columnLabel, tableId) {
  let html = `<table class="ct" id="${tableId || 'table-default'}"><thead><tr><th></th>`;
  columnKeys.forEach(key => {
    html += `<th class="ch">${columnLabel(key)}</th>`;
  });
  html += '</tr></thead><tbody>';
  rows.forEach(row => {
    const [label, dataFn] = row;
    html += '<tr><td class="al">' + label + '</td>';
    columnKeys.forEach(key => {
      let cellData = dataFn ? dataFn(key) : '—';
      let cellClass = '';
      if (typeof cellData === 'object' && cellData !== null && cellData.content !== undefined) {
        cellClass = cellData.className ? ` class="${cellData.className}"` : '';
        cellData = cellData.content;
      }
      html += `<td${cellClass}>${cellData}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function buildCarouselHTML(rows, columnKeys, columnLabel, carouselId) {
  let html = `<div class="carousel-wrap" id="${carouselId || 'carousel-default'}"><div class="carousel-container">`;
  columnKeys.forEach((key, idx) => {
    html += '<div class="carousel-card">';
    html += `<div class="carousel-card-header">${columnLabel(key)}</div>`;
    rows.forEach(row => {
      const [label, dataFn] = row;
      const cellData = dataFn ? dataFn(key) : '—';
      html += `<div class="carousel-card-label">${label}</div>`;
      html += `<div class="carousel-card-row">${cellData}</div>`;
    });
    html += '</div>';
  });
  html += '</div>';
  html += '<div class="carousel-indicator">Card 1 of ' + columnKeys.length + '</div>';
  html += '</div>';
  return html;
}

function initCarousel(carouselId, containerSelector) {
  const selector = containerSelector || '.carousel-container';
  const container = document.querySelector(`#${carouselId} ${selector}`);
  if (!container) return;
  let isDown = false, startX, scrollLeft, momentum = 0, lastX = 0, lastTime = 0;
  container.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - container.offsetLeft; scrollLeft = container.scrollLeft; lastX = e.pageX; lastTime = Date.now(); momentum = 0; });
  document.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - container.offsetLeft;
    const walk = x - startX;
    container.scrollLeft = scrollLeft - walk;
    const dt = Date.now() - lastTime;
    if (dt > 0) momentum = (e.pageX - lastX) / dt;
    lastX = e.pageX;
    lastTime = Date.now();
  });
  document.addEventListener('mouseup', () => { isDown = false; });
  container.addEventListener('touchstart', (e) => { startX = e.touches[0].pageX - container.offsetLeft; scrollLeft = container.scrollLeft; lastX = e.touches[0].pageX; lastTime = Date.now(); momentum = 0; });
  container.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = x - startX;
    container.scrollLeft = scrollLeft - walk;
    const dt = Date.now() - lastTime;
    if (dt > 0) momentum = (e.touches[0].pageX - lastX) / dt;
    lastX = e.touches[0].pageX;
    lastTime = Date.now();
  });
  container.addEventListener('touchend', () => {
    let frame = momentum > 0 ? 1 : -1;
    let steps = 0;
    const ticker = setInterval(() => {
      if (Math.abs(momentum) < 0.01 || steps > 20) { clearInterval(ticker); return; }
      container.scrollLeft += momentum * 30;
      momentum *= 0.9;
      steps++;
    }, 16);
  });
}

// ============================================================================
// STATE MANAGEMENT - Works with any pathfinder's state object
// ============================================================================
function getStateKey() {
  const pathfinderId = window.PATHFINDER_CONFIG?.id || 'default';
  return `pathfinderState_${pathfinderId}`;
}

function frameworkSaveState(stateObject) {
  localStorage.setItem(getStateKey(), JSON.stringify(stateObject));
}

function frameworkLoadState() {
  const saved = localStorage.getItem(getStateKey());
  return saved ? JSON.parse(saved) : null;
}

// ============================================================================
// EVENT DISPATCHERS - Generic patterns for selection handlers
// ============================================================================
// Pathfinders call these with domain-specific callbacks
function dispatchTogglePill(containerSelector, value, stateField, onToggle) {
  const pills = document.querySelectorAll(`${containerSelector} .pill`);
  let newState = value;

  pills.forEach(p => {
    if (p.textContent === value) {
      p.classList.toggle('on');
      if (!p.classList.contains('on')) newState = null;
    } else {
      p.classList.remove('on');
    }
  });

  if (onToggle) onToggle(newState);
}

function dispatchMultiTogglePill(containerSelector, value, stateArray, onToggle) {
  const pills = document.querySelectorAll(`${containerSelector} .pill`);
  let newState = [...stateArray];

  pills.forEach(p => {
    if (p.textContent === value) {
      p.classList.toggle('on');
      if (p.classList.contains('on') && !newState.includes(value)) {
        newState.push(value);
      } else if (!p.classList.contains('on')) {
        newState = newState.filter(v => v !== value);
      }
    }
  });

  if (onToggle) onToggle(newState);
}

// ============================================================================
// ROUTING - Works for any pathfinder
// ============================================================================
function go(tabId) {
  document.querySelectorAll('.pan').forEach(p => p.classList.remove('on'));
  const tab = document.getElementById(tabId);
  if (tab) tab.classList.add('on');

  document.querySelectorAll('.tb').forEach(b => b.classList.remove('on'));
  const btns = document.querySelectorAll('.tb');
  for (let btn of btns) {
    if (btn.onclick && btn.onclick.toString().includes(`go('${tabId}')`)) {
      btn.classList.add('on');
      break;
    }
  }

  // Call pathfinder's render function if available
  if (window.PATHFINDER_CONFIG && window.PATHFINDER_CONFIG.renderersForTab && window.PATHFINDER_CONFIG.renderersForTab[tabId]) {
    window.PATHFINDER_CONFIG.renderersForTab[tabId]();
  }

  sessionStorage.setItem('currentTab', tabId);
}

// ============================================================================
// EXPORTS - Make everything available globally
// ============================================================================
window.loadDataFile = loadDataFile;
window.frameworkSaveState = frameworkSaveState;
window.frameworkLoadState = frameworkLoadState;
window.buildTableHTML = buildTableHTML;
window.buildCarouselHTML = buildCarouselHTML;
window.initCarousel = initCarousel;
window.buildSelectors = buildSelectors;
window.buildHeader = buildHeader;
window.initHdrCarousel = initHdrCarousel;
window.updateHdrCarousel = updateHdrCarousel;
window.toggleMusic = toggleMusic;
window.selPlaylist = selPlaylist;
window.dispatchTogglePill = dispatchTogglePill;
window.dispatchMultiTogglePill = dispatchMultiTogglePill;
window.go = go;
window.PLAYLISTS = PLAYLISTS;
window.HEADER_PHOTOS = HEADER_PHOTOS;
