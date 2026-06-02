// Bootcamp Pathfinder - Rendering Functions
// Stub renderers + shared header functions (music, carousel)

// ===== SHARED HEADER SUPPORT (music player, carousel) =====
let hdrIdx = 0, hdrTimer = null, hdrPaused = false, hdrPoolKey = '';

const PLAYLISTS = {
  lofi: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/dabootlegboy/sets/study-chill-lofi-hiphop&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false',
  groovy: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/wearestereofox/sets/groovy-beats&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false',
  relax: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/ambientchill-sc/sets/relaxing-ambient-music-2&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false',
  zen: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/binauralbeatsresearch/sets/theta-waves-zen-meditation&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false'
};

const HEADER_PHOTOS = [
  { src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97', cap: 'Bootcamp coding session' },
  { src: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db', cap: 'Students collaborating' }
];

const FALLBACK_HDR_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='420'><rect width='1600' height='420' fill='%23667eea'/><text x='40' y='80' fill='white' font-size='28'>Bootcamp Pathfinder</text></svg>";

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

function poolKeyFor(pool) {
  return pool.map(p => p.src).join('|');
}

function startHdrCarousel() {
  if (hdrTimer) clearInterval(hdrTimer);
  bindHdrHoverPause();
  const pool = HEADER_PHOTOS;
  Promise.resolve(filterBroken(pool)).then((goodPool) => {
    const finalPool = (goodPool && goodPool.length) ? goodPool : HEADER_PHOTOS;
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

function initHdrCarousel() { startHdrCarousel(); }
function updateHdrCarousel() { startHdrCarousel(); }

function toggleMusic() {
  const pills = document.getElementById('playlist-pills');
  const sw = document.getElementById('spotify-wrap');
  const on = pills.classList.toggle('show');
  const btn = document.getElementById('music-btn');
  btn.classList.toggle('active', on);
  if (!on) {
    sw.classList.remove('show');
    document.querySelectorAll('.pp').forEach(b => b.classList.remove('active'));
    window.S.playlist = null;
    document.getElementById('spotify-frame').src = 'about:blank';
  }
}

function selPlaylist(playlist, el) {
  if (!document.getElementById('playlist-pills').classList.contains('show')) return;
  window.S.playlist = playlist;
  document.querySelectorAll('.pp').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const sw = document.getElementById('spotify-wrap');
  sw.classList.add('show');
  const frame = document.getElementById('spotify-frame');
  frame.src = PLAYLISTS[playlist];
}

// ===== TAB RENDERERS (bootcamp-specific) =====
function renderFindBootcamp() {
  const container = document.getElementById('find');
  if (!container) return;
  container.innerHTML = `
    <div class="qb">
      <h3>Find Your Bootcamp</h3>
      <p>Coming soon: bootcamp discovery tool</p>
    </div>
  `;
}

function renderPrograms() {
  const container = document.getElementById('programs');
  if (!container) return;
  container.innerHTML = `
    <div class="qb">
      <h3>Popular Programs</h3>
      <p>Coming soon: program directory</p>
    </div>
  `;
}

function renderCompare() {
  const container = document.getElementById('compare');
  if (!container) return;
  container.innerHTML = `
    <div class="qb">
      <h3>Compare Bootcamps</h3>
      <p>Coming soon: comparison tool</p>
    </div>
  `;
}

function renderInsightsBootcamp() {
  const container = document.getElementById('insights');
  if (!container) return;
  container.innerHTML = `
    <div class="qb">
      <h3>Bootcamp Insights</h3>
      <p>Coming soon: personalized recommendations</p>
    </div>
  `;
}

// Update config with actual renderer functions
window.bootcampPathfinderConfig.renderersForTab = {
  'find': renderFindBootcamp,
  'programs': renderPrograms,
  'compare': renderCompare,
  'insights': renderInsightsBootcamp
};

// Export functions to global scope
window.renderFindBootcamp = renderFindBootcamp;
window.renderPrograms = renderPrograms;
window.renderCompare = renderCompare;
window.renderInsightsBootcamp = renderInsightsBootcamp;
window.toggleMusic = toggleMusic;
window.selPlaylist = selPlaylist;
window.initHdrCarousel = initHdrCarousel;
window.updateHdrCarousel = updateHdrCarousel;
