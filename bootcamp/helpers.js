// ============================================================================
// BOOTCAMP PATHFINDER HELPERS & INITIALIZATION
// ============================================================================

// State object
let SELECTOR_OPTIONS = {};
let SELECTOR_OPTIONS_LOADED = false;
let BOOTCAMPS = [];
let BOOTCAMPS_LOADED = false;

async function loadSelectorOptionsData() {
  try {
    const response = await fetch('./data/selector-options.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    Object.assign(SELECTOR_OPTIONS, data);
    window.SELECTOR_OPTIONS = SELECTOR_OPTIONS;
    window.SELECTOR_OPTIONS_LOADED = true;
    SELECTOR_OPTIONS_LOADED = true;
    console.log(`✓ Loaded selector-options.json: ${Object.keys(data).length} selectors`);
    return true;
  } catch (error) {
    console.error('✗ Failed to load selector-options.json:', error.message);
    return false;
  }
}

async function loadBootcampsData() {
  try {
    const response = await fetch('./data/bootcamps.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    BOOTCAMPS = data.bootcamps || [];
    BOOTCAMPS_LOADED = true;
    window.BOOTCAMPS = BOOTCAMPS;
    window.BOOTCAMPS_LOADED = true;
    console.log(`✓ Loaded bootcamps.json: ${BOOTCAMPS.length} bootcamps`);
    return true;
  } catch (error) {
    console.error('✗ Failed to load bootcamps.json:', error.message);
    return false;
  }
}

// Helper: Get bootcamp by name
function getBootcamp(name) {
  return BOOTCAMPS.find(b => b.name === name);
}

// State management
function saveState() {
  const stateToSave = {
    bootType: S.bootType || [],
    pace: S.pace || null,
    budget: S.budget || null
  };
  console.log('💾 Saving state:', stateToSave);
  localStorage.setItem('bootcampPathfinderState', JSON.stringify(stateToSave));
}

function loadState() {
  const saved = localStorage.getItem('bootcampPathfinderState');
  console.log('📂 localStorage entry exists:', !!saved);
  if (saved) {
    const state = JSON.parse(saved);
    console.log('📥 Loaded state from storage:', state);
    Object.assign(S, state);
    console.log('📌 State assigned to S object:', S);
    
    // Apply saved state to pills
    if (S.bootType && S.bootType.length) {
      document.querySelectorAll('[data-q="bootType"] .pill').forEach(p => {
        S.bootType.includes(p.textContent) ? p.classList.add('on') : p.classList.remove('on');
      });
    }
    if (S.pace) {
      document.querySelectorAll('[data-q="pace"] .pill').forEach(p => {
        S.pace === p.textContent ? p.classList.add('on') : p.classList.remove('on');
      });
    }
    if (S.budget) {
      document.querySelectorAll('[data-q="budget"] .pill').forEach(p => {
        S.budget === p.textContent ? p.classList.add('on') : p.classList.remove('on');
      });
    }
  }
}

// Initialize state
window.S = { bootType: [], pace: null, budget: null };
const S = window.S;

// Coordinate initialization with framework
const selectorOptionsPromise = loadSelectorOptionsData();
const bootcampsPromise = loadBootcampsData();

Promise.all([selectorOptionsPromise, bootcampsPromise]).then(async () => {
  console.log('✓ All bootcamp data loaded successfully');

  // Build header and selectors (generic framework functions)
  if (window.buildHeader && window.PATHFINDER_CONFIG && window.PATHFINDER_CONFIG.header) {
    await window.buildHeader(window.PATHFINDER_CONFIG.header);
  }

  if (window.buildSelectors && window.PATHFINDER_CONFIG && window.PATHFINDER_CONFIG.selectors) {
    await window.buildSelectors(window.PATHFINDER_CONFIG.selectors, 'discover');
  }

  // Render first tab and restore state
  renderPathfinderTab('discover');
  loadState();
  console.log('✅ Bootcamp initialization complete');
}).catch(err => {
  console.error('Bootcamp initialization failed:', err);
});

// Renderers
function renderBootcamps() {
  const el = document.getElementById('bootcamps-list');
  
  if (!BOOTCAMPS.length) {
    el.innerHTML = '<p>No bootcamps found. Update your preferences.</p>';
    return;
  }

  let html = '<div style="display:grid;gap:12px">';
  BOOTCAMPS.forEach(b => {
    html += `<div style="border:1px solid var(--bdr);padding:12px;border-radius:6px"><strong>${b.name}</strong><p>${b.type} | ${b.pace} | $${b.cost.toLocaleString()}</p></div>`;
  });
  html += '</div>';
  el.innerHTML = html;
}

function renderPathfinderTab(id) {
  if (id === 'bootcamps') renderBootcamps();
}

// Event handlers
function pick1(q, el) {
  document.querySelectorAll(`[data-q="${q}"] .pill`).forEach(o => o.classList.remove('on'));
  el.classList.add('on');
  if (q === 'pace') S.pace = el.textContent;
  else if (q === 'budget') S.budget = el.textContent;
  saveState();
  renderBootcamps();
}

function pickN(q, el) {
  el.classList.toggle('on');
  if (q === 'bootType') {
    S.bootType = [];
    document.querySelectorAll(`[data-q="${q}"] .pill.on`).forEach(p => S.bootType.push(p.textContent));
  }
  saveState();
  renderBootcamps();
}

function startOver() {
  S.bootType = [];
  S.pace = null;
  S.budget = null;
  localStorage.removeItem('bootcampPathfinderState');
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('on'));
  renderBootcamps();
}

// Export to window
window.getBootcamp = getBootcamp;
window.saveState = saveState;
window.loadState = loadState;
window.renderBootcamps = renderBootcamps;
window.renderPathfinderTab = renderPathfinderTab;
window.pick1 = pick1;
window.pickN = pickN;
window.startOver = startOver;
window.loadSelectorOptionsData = loadSelectorOptionsData;
window.loadBootcampsData = loadBootcampsData;

// Render discovery selector pills from SELECTOR_OPTIONS
function renderDiscoverySelectorOptions() {
  const opts = window.SELECTOR_OPTIONS || {};
  const multiSelect = ['bootType'];

  Object.entries(opts).forEach(([qKey, options]) => {
    const container = document.querySelector(`[data-q="${qKey}"]`);
    if (!container) return;

    const isMulti = multiSelect.includes(qKey);
    const pickFunc = isMulti ? 'pickN' : 'pick1';

    let html = '';
    options.forEach(value => {
      html += `<div class="pill" onclick="${pickFunc}('${qKey}',this)">${value}</div>`;
    });

    container.innerHTML = html;
  });
}

// Apply saved state to pills
function renderDiscoveryPills() {
  document.querySelectorAll('[data-q="bootType"] .pill').forEach(p => {
    if (S.bootType && S.bootType.includes(p.textContent)) p.classList.add('on');
    else p.classList.remove('on');
  });
  document.querySelectorAll('[data-q="pace"] .pill').forEach(p => {
    if (S.pace === p.textContent) p.classList.add('on');
    else p.classList.remove('on');
  });
  document.querySelectorAll('[data-q="budget"] .pill').forEach(p => {
    if (S.budget === p.textContent) p.classList.add('on');
    else p.classList.remove('on');
  });
}

// Proper renderPathfinderTab implementation
function renderPathfinderTab(id) {
  if (id === 'discover') {
    renderDiscoverySelectorOptions();
    renderDiscoveryPills();
  } else if (id === 'bootcamps') {
    renderBootcamps();
  }
}

window.renderDiscoverySelectorOptions = renderDiscoverySelectorOptions;
window.renderDiscoveryPills = renderDiscoveryPills;
