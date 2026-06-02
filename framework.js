// ============================================================================
// FRAMEWORK.JS - Generic multi-pathfinder framework
// Handles: tab routing, state management, localStorage, initialization
// ============================================================================

let currentPathfinder = 'university';
let currentTab = 'discover';

// ============================================================================
// TAB ROUTING
// ============================================================================

function go(tabId) {
  // Hide all panels and tabs
  document.querySelectorAll('.pan').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.tb').forEach(b => b.classList.remove('on'));

  // Show active panel and tab
  const panel = document.getElementById(tabId);
  if (panel) panel.classList.add('on');

  currentTab = tabId;

  // Find and highlight the corresponding button
  const config = getCurrentPathfinderConfig();
  if (config && config.tabs) {
    const tabIndex = config.tabs.findIndex(t => t.id === tabId);
    if (tabIndex >= 0) {
      const buttons = document.querySelectorAll('.tb');
      if (buttons[tabIndex]) buttons[tabIndex].classList.add('on');
    }
  }

  // Call pathfinder-specific render function
  if (currentPathfinder === 'university') {
    renderPathfinderTab(tabId);
  }

  window.scrollTo(0, 0);
}

function switchPathfinder(pathfinderName) {
  currentPathfinder = pathfinderName;
  window.location.hash = pathfinderName;
  loadPathfinder(pathfinderName);
}

function goHome() {
  window.location.hash = '';
  showPathfinderSelector();
}

// ============================================================================
// STATE MANAGEMENT (Option A: Separate localStorage keys)
// ============================================================================

function saveState() {
  const config = getCurrentPathfinderConfig();
  if (!config) return;

  const stateToSave = {};
  config.stateFields.forEach(field => {
    stateToSave[field] = window.S[field];
  });

  const key = `pathfinder_${currentPathfinder}_state`;
  localStorage.setItem(key, JSON.stringify(stateToSave));
}

function loadState() {
  const config = getCurrentPathfinderConfig();
  if (!config) return;

  const key = `pathfinder_${currentPathfinder}_state`;
  const saved = localStorage.getItem(key);

  if (saved) {
    const state = JSON.parse(saved);
    Object.assign(window.S, state);
  }
}

function clearState() {
  const key = `pathfinder_${currentPathfinder}_state`;
  localStorage.removeItem(key);
}

// ============================================================================
// PATHFINDER MANAGEMENT
// ============================================================================

function getCurrentPathfinderConfig() {
  if (currentPathfinder === 'university') {
    return window.universityPathfinderConfig;
  }
  // Add other pathfinders here as they're built
  return null;
}

async function loadPathfinderData(config) {
  if (!config.dataSources) return true;

  const baseDir = `pathfinder/${currentPathfinder}/`;
  const loadPromises = [];

  Object.entries(config.dataSources).forEach(([name, filename]) => {
    const promise = fetch(baseDir + filename)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load ${filename}`);
        return r.json();
      })
      .then(data => {
        // Store in window[NAME_UPPERCASE]
        const varName = name.toUpperCase().replace(/_/g, '_');
        window[varName] = data;
        console.log(`✓ Loaded ${name}`);
      })
      .catch(e => console.error(`✗ Failed to load ${name}:`, e.message));

    loadPromises.push(promise);
  });

  await Promise.all(loadPromises);
  return true;
}

function initializePathfinder() {
  const config = getCurrentPathfinderConfig();
  if (!config) {
    console.error(`No config found for pathfinder: ${currentPathfinder}`);
    return false;
  }

  // S object is already defined in index.html, just load persisted state
  loadState();

  // Ensure all state fields from config are initialized
  config.stateFields.forEach(field => {
    if (!(field in window.S)) {
      window.S[field] = null;
    }
  });

  // Render initial tab
  renderPathfinderHeader(config);
  renderPathfinderTabs(config);
  generateTabPanels(config);
  go(config.tabs[0].id);

  return true;
}

function renderPathfinderHeader(config) {
  const header = document.querySelector('.hdr-content');
  if (!header) return;

  const title = header.querySelector('h1');
  const subtitle = header.querySelector('p');

  if (title) title.innerText = config.name;
  if (subtitle) subtitle.innerText = config.description;
}

function renderPathfinderTabs(config) {
  const tabsContainer = document.querySelector('.tabs');
  if (!tabsContainer) return;

  tabsContainer.innerHTML = '';

  config.tabs.forEach((tab, index) => {
    const btn = document.createElement('button');
    btn.className = 'tb';
    btn.textContent = tab.label;
    btn.onclick = () => go(tab.id);
    tabsContainer.appendChild(btn);
  });
}

function generateTabPanels(config) {
  const panelsContainer = document.querySelector('.ctr');
  if (!panelsContainer) return;

  config.tabs.forEach(tab => {
    // Check if panel already exists
    if (document.getElementById(tab.id)) return;

    const panel = document.createElement('div');
    panel.className = 'pan';
    panel.id = tab.id;
    panelsContainer.appendChild(panel);
  });
}

// ============================================================================
// ROUTE HANDLER (on page load, check URL hash)
// ============================================================================

function initRouting() {
  const hash = window.location.hash.slice(1);

  if (!hash) {
    // No pathfinder in hash, default to university (backward compatible)
    currentPathfinder = 'university';
    loadPathfinder('university');
  } else if (isValidPathfinder(hash)) {
    // Load specific pathfinder
    currentPathfinder = hash;
    loadPathfinder(hash);
  } else {
    // Invalid pathfinder, default to university
    currentPathfinder = 'university';
    loadPathfinder('university');
  }
}

function isValidPathfinder(name) {
  const validNames = ['university']; // Add more as built
  return validNames.includes(name);
}

function loadPathfinder(name) {
  currentPathfinder = name;

  // Hide home screen, show pathfinder
  const homeScreen = document.getElementById('pathfinder-home');
  const appContainer = document.querySelector('.ctr');

  if (homeScreen) homeScreen.style.display = 'none';
  if (appContainer) appContainer.style.display = 'block';

  // Initialize the pathfinder
  initializePathfinder();
}

function showPathfinderSelector() {
  const homeScreen = document.getElementById('pathfinder-home');
  const appContainer = document.querySelector('.ctr');

  if (homeScreen) homeScreen.style.display = 'block';
  if (appContainer) appContainer.style.display = 'none';
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if (hash && isValidPathfinder(hash)) {
    loadPathfinder(hash);
  } else if (!hash) {
    showPathfinderSelector();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Set version badge
  const badge = document.getElementById('version-badge');
  if (badge) badge.innerText = window.VERSION;

  // Initialize routing
  initRouting();
});

// Export for use in other modules
window.framework = {
  go,
  switchPathfinder,
  goHome,
  saveState,
  loadState,
  getCurrentPathfinder: () => currentPathfinder,
  getCurrentTab: () => currentTab
};
