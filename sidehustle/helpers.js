// ============================================================================
// SIDE HUSTLE PATHFINDER HELPERS
// Query, format, validate, and debug functions for side hustle data
// ============================================================================

// State object
let SELECTOR_OPTIONS = {};
let SELECTOR_OPTIONS_LOADED = false;
let SIDEHUSTLES_LOADED = false;
let INSIGHTS_LOADED = false;
let KNOWLEDGE_LOADED = false;

// Initialize state
window.S = {
  timeCommitment: null,
  startupBudget: null,
  incomeType: null,
  incomeGoal: null,
  strengths: [],
  scalability: null,
  selectedCategory: null,
  selectedHustle: null,
  selectedHustleFilterCategories: [],
  selectedHustleFilterHustles: [],
  selectedDeepDiveHustle: null,
  selectedKnowledgeCategories: [],
  selectedKnowledgeDomains: []
};
const S = window.S;

// ============================================================================
// QUERY HELPERS - Safe getters with null checks (CLAUDE.md pattern)
// ============================================================================

function getHustle(name) {
  const data = window.SIDEHUSTLES || {sidehustles: []};
  if (!name || !Array.isArray(data.sidehustles)) return null;
  return data.sidehustles.find(h => h.name === name) || null;
}

function getHustlesByCategory(categoryKey) {
  const data = window.SIDEHUSTLES || {sidehustles: []};
  if (!categoryKey || !Array.isArray(data.sidehustles)) return [];
  return data.sidehustles.filter(h => h.category === categoryKey);
}

function getAllCategories() {
  const data = window.SIDEHUSTLES || {sidehustles: []};
  if (!Array.isArray(data.sidehustles)) return [];
  const categories = new Map();
  data.sidehustles.forEach(h => {
    if (!categories.has(h.category)) {
      categories.set(h.category, h.categoryLabel);
    }
  });
  return Array.from(categories.entries()).map(([key, label]) => ({key, label}));
}

// ============================================================================
// FIELD-SPECIFIC QUERY HELPERS (CLAUDE.md pattern - like university)
// ============================================================================

function getHustleStartupCost(name) {
  const hustle = getHustle(name);
  if (!hustle || !hustle.financial) return {min: 0, max: 0};
  return {
    min: hustle.financial.startupCost_min || 0,
    max: hustle.financial.startupCost_max || 0,
    note: hustle.financial.startupCost_note || null
  };
}

function getHustleEarningPotential(name) {
  const hustle = getHustle(name);
  if (!hustle || !hustle.financial) return {min: 0, max: 0};
  return {
    min: hustle.financial.monthlyEarning_min || 0,
    max: hustle.financial.monthlyEarning_max || 0
  };
}

function getHustleTimeToIncome(name) {
  const hustle = getHustle(name);
  if (!hustle || !hustle.financial) return null;
  return hustle.financial.timeToFirstIncome || null;
}

function getHustleEffort(name) {
  const hustle = getHustle(name);
  if (!hustle || !hustle.effort) return {min: 0, max: 0};
  return {
    min: hustle.effort.hoursPerWeekRequired_min || 0,
    max: hustle.effort.hoursPerWeekRequired_max || 0
  };
}

function getHustleCompetition(name) {
  const hustle = getHustle(name);
  if (!hustle || !hustle.character) return null;
  return hustle.character.competitionLevel || null;
}

function getHustlePassivity(name) {
  const hustle = getHustle(name);
  if (!hustle || !hustle.character) return 0;
  return hustle.character.passivityScore || 0;
}

function getHustleScalability(name) {
  const hustle = getHustle(name);
  if (!hustle || !hustle.effort) return null;
  return hustle.effort.scalabilityPotential || null;
}

function getHustleSkills(name) {
  const hustle = getHustle(name);
  if (!hustle || !hustle.practical) return [];
  return hustle.practical.requiredSkills || [];
}

function getHustlePlatforms(name) {
  const hustle = getHustle(name);
  if (!hustle || !hustle.practical) return [];
  return hustle.practical.recommendedPlatforms || [];
}

function getHustleResources(name) {
  const hustle = getHustle(name);
  if (!hustle || !hustle.practical) return [];
  return hustle.practical.resources || [];
}

function matchHustles(state) {
  const data = window.SIDEHUSTLES || {sidehustles: []};
  if (!Array.isArray(data.sidehustles) || data.sidehustles.length === 0) return [];
  const S = state || {};

  const timeHours = {
    '5-10 hrs/week': {min: 5, max: 10},
    '10-20 hrs/week': {min: 10, max: 20},
    '20-30 hrs/week': {min: 20, max: 30},
    '30+ hrs/week': {min: 30, max: 999}
  };

  const budgets = {
    '$0-50': {min: 0, max: 50},
    '$50-250': {min: 50, max: 250},
    '$250-1,000': {min: 250, max: 1000},
    '$1,000+': {min: 1000, max: 999999}
  };

  const incomeGoals = {
    '$100-500/month': {min: 100, max: 500},
    '$500-2,000/month': {min: 500, max: 2000},
    '$2,000-5,000/month': {min: 2000, max: 5000},
    '$5,000+/month': {min: 5000, max: 999999}
  };

  const timeRange = timeHours[S.timeCommitment] || {min: 0, max: 999};
  const budgetRange = budgets[S.startupBudget] || {min: 0, max: 999999};
  const incomeRange = incomeGoals[S.incomeGoal] || {min: 0, max: 999999};
  const strengths = Array.isArray(S.strengths) ? S.strengths : [];

  const results = data.sidehustles.map(hustle => {
    let score = 100;

    // Time commitment score
    const effortMid = (hustle.effort.hoursPerWeekRequired_min + hustle.effort.hoursPerWeekRequired_max) / 2;
    if (effortMid > timeRange.max) score -= 30;
    else if (effortMid < timeRange.min) score -= 10;

    // Startup cost score
    const costMid = (hustle.financial.startupCost_min + hustle.financial.startupCost_max) / 2;
    if (costMid > budgetRange.max) score -= 25;

    // Income goal score
    const earningMid = (hustle.financial.monthlyEarning_min + hustle.financial.monthlyEarning_max) / 2;
    if (earningMid < incomeRange.min) score -= 20;
    else if (earningMid >= incomeRange.min) score += 15;

    // Income type score (passivity)
    if (state.incomeType === 'Mostly passive' && hustle.character.passivityScore < 0.4) score -= 20;
    else if (state.incomeType === 'Mostly active' && hustle.character.passivityScore > 0.6) score -= 15;

    // Strengths match score
    if (strengths.length > 0) {
      const matchedSkills = hustle.practical.requiredSkills.filter(s => strengths.includes(s)).length;
      const skillMatchPercent = matchedSkills / Math.max(1, hustle.practical.requiredSkills.length);
      score += (skillMatchPercent * 20);
    }

    // Scalability preference score
    if (state.scalability === 'Aim to scale' && hustle.effort.scalabilityPotential === 'low') score -= 15;
    else if (state.scalability === 'Side income only' && hustle.effort.scalabilityPotential === 'very_high') score -= 5;

    return {
      hustle,
      score: Math.max(0, score),
      matchReasons: generateMatchReasons(hustle, state, timeRange, budgetRange, incomeRange, strengths)
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

function generateMatchReasons(hustle, state, timeRange, budgetRange, incomeRange, strengths) {
  const reasons = [];
  const effortMid = (hustle.effort.hoursPerWeekRequired_min + hustle.effort.hoursPerWeekRequired_max) / 2;
  const costMid = (hustle.financial.startupCost_min + hustle.financial.startupCost_max) / 2;
  const earningMid = (hustle.financial.monthlyEarning_min + hustle.financial.monthlyEarning_max) / 2;

  if (effortMid >= timeRange.min && effortMid <= timeRange.max) {
    reasons.push(`✅ Fits your ${state.timeCommitment} time commitment`);
  }
  if (costMid <= budgetRange.max) {
    reasons.push(`✅ Within your ${state.startupBudget} budget`);
  }
  if (earningMid >= incomeRange.min) {
    reasons.push(`✅ Can reach your ${state.incomeGoal} income goal`);
  }
  if (hustle.character.passivityScore >= 0.5 && state.incomeType === 'Mostly passive') {
    reasons.push(`✅ Offers passive income as you prefer`);
  }
  if (hustle.character.demandTrend === 'growing') {
    reasons.push(`✅ Growing demand in this field`);
  }

  return reasons.slice(0, 3);
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

function formatMoney(min, max) {
  if (!min && !max) return '—';
  if (min === max) return `$${min.toLocaleString()}`;
  return `$${min.toLocaleString()}–$${max.toLocaleString()}`;
}

function formatMonthlyRange(min, max) {
  return formatMoney(min, max) + '/month';
}

function formatHours(min, max) {
  if (!min && !max) return '—';
  if (min === max) return `${min} hrs/week`;
  return `${min}–${max} hrs/week`;
}

function formatCompetition(level) {
  const icons = {
    'low': '🟢 Low',
    'medium': '🟡 Medium',
    'high': '🔴 High',
    'very_high': '🔴 Very High'
  };
  return icons[level] || level;
}

function formatPassivity(score) {
  if (score >= 0.7) return 'High (mostly passive)';
  if (score >= 0.4) return 'Medium (mixed)';
  return 'Low (mostly active)';
}

function formatScalability(level) {
  const labels = {
    'low': 'Limited',
    'medium': 'Moderate',
    'high': 'High',
    'very_high': 'Very High'
  };
  return labels[level] || level;
}

function formatDemand(trend) {
  const icons = {
    'growing': '📈 Growing',
    'stable': '➡️ Stable',
    'declining': '📉 Declining'
  };
  return icons[trend] || trend;
}

function formatSeasonality(seasonality) {
  const labels = {
    'steady': 'Steady year-round',
    'seasonal': 'Seasonal peaks',
    'holiday': 'Holiday-driven'
  };
  return labels[seasonality] || seasonality;
}

function formatTimeToIncome(time) {
  return time;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateHustleSchema(hustle) {
  const required = [
    'name', 'category', 'categoryLabel', 'description',
    'financial', 'effort', 'character', 'practical', 'imageUrls'
  ];

  const errors = [];
  required.forEach(field => {
    if (!hustle[field]) errors.push(`Missing field: ${field}`);
  });

  if (hustle.financial) {
    if (typeof hustle.financial.startupCost_min !== 'number') errors.push('financial.startupCost_min must be numeric');
    if (typeof hustle.financial.monthlyEarning_max !== 'number') errors.push('financial.monthlyEarning_max must be numeric');
  }

  if (hustle.effort) {
    if (typeof hustle.effort.hoursPerWeekRequired_min !== 'number') errors.push('effort.hoursPerWeekRequired_min must be numeric');
  }

  if (hustle.imageUrls && !Array.isArray(hustle.imageUrls)) {
    errors.push('imageUrls must be an array');
  }

  return {valid: errors.length === 0, errors};
}

function validateAllHustles() {
  const data = window.SIDEHUSTLES || {sidehustles: []};
  if (!Array.isArray(data.sidehustles)) {
    return {total: 0, valid: 0, invalid: 0, errors: ['SIDEHUSTLES data not loaded']};
  }

  let valid = 0, invalid = 0;
  const errors = [];

  data.sidehustles.forEach((h, i) => {
    const result = validateHustleSchema(h);
    if (result.valid) {
      valid++;
    } else {
      invalid++;
      errors.push(`${h.name}: ${result.errors.join('; ')}`);
    }
  });

  return {
    total: data.sidehustles.length,
    valid,
    invalid,
    errors: errors.slice(0, 5)
  };
}

// ============================================================================
// KNOWLEDGE DOMAIN HELPERS (CLAUDE.md pattern)
// ============================================================================

function getKnowledgeDomain(name) {
  const data = window.KNOWLEDGE || {knowledge_domains: []};
  if (!name || !Array.isArray(data.knowledge_domains)) return null;
  return data.knowledge_domains.find(d => d.name === name) || null;
}

function getKnowledgeByCategory(categoryKey) {
  const data = window.KNOWLEDGE || {knowledge_domains: []};
  if (!categoryKey || !Array.isArray(data.knowledge_domains)) return [];
  return data.knowledge_domains.filter(d => d.category === categoryKey);
}

function getAllKnowledgeCategories() {
  const data = window.KNOWLEDGE || {knowledge_domains: []};
  if (!Array.isArray(data.knowledge_domains)) return [];
  const categories = new Map();
  data.knowledge_domains.forEach(d => {
    if (!categories.has(d.category)) {
      categories.set(d.category, d.categoryLabel || d.category);
    }
  });
  return Array.from(categories.entries()).map(([key, label]) => ({key, label}));
}

function getAllKnowledgeDomains() {
  const data = window.KNOWLEDGE || {knowledge_domains: []};
  return Array.isArray(data.knowledge_domains) ? data.knowledge_domains : [];
}

function validateKnowledgeSchema(domain) {
  const errors = [];
  if (!domain.name) errors.push('Missing name');
  if (!domain.category) errors.push('Missing category');
  if (!domain.difficulty || !['Low', 'Medium', 'High'].includes(domain.difficulty)) {
    errors.push('Invalid difficulty (must be Low, Medium, or High)');
  }
  if (!domain.marketDemand_score || typeof domain.marketDemand_score !== 'number') {
    errors.push('Missing or invalid marketDemand_score (must be number)');
  }
  if (!domain.timeToLearnBasic_min || typeof domain.timeToLearnBasic_min !== 'number') {
    errors.push('Missing or invalid timeToLearnBasic_min');
  }
  return {valid: errors.length === 0, errors};
}

function validateAllKnowledgeDomains() {
  const data = window.KNOWLEDGE || {knowledge_domains: []};
  if (!Array.isArray(data.knowledge_domains)) {
    return {total: 0, valid: 0, invalid: 0, errors: ['KNOWLEDGE data not loaded']};
  }

  let valid = 0, invalid = 0;
  const errors = [];

  data.knowledge_domains.forEach((d, i) => {
    const result = validateKnowledgeSchema(d);
    if (result.valid) {
      valid++;
    } else {
      invalid++;
      errors.push(`${d.name}: ${result.errors.join('; ')}`);
    }
  });

  return {
    total: data.knowledge_domains.length,
    valid,
    invalid,
    errors: errors.slice(0, 5)
  };
}

// ============================================================================
// DEBUG HELPERS
// ============================================================================

function debugHustle(name) {
  const h = getHustle(name);
  if (!h) {
    console.log(`Hustle not found: ${name}`);
    return;
  }
  console.log('=== HUSTLE:', h.name, '===');
  console.log('Category:', h.category, '(' + h.categoryLabel + ')');
  console.log('Financial:', h.financial);
  console.log('Effort:', h.effort);
  console.log('Character:', h.character);
  console.log('Practical:', h.practical);
  console.log('Images:', h.imageUrls.length, 'images');
}

function debugAllHustles() {
  console.log('=== ALL HUSTLES ===');
  const validation = validateAllHustles();
  console.log(`Total: ${validation.total} | Valid: ${validation.valid} | Invalid: ${validation.invalid}`);
  if (validation.errors.length > 0) {
    console.log('Errors:', validation.errors);
  }

  const categories = getAllCategories();
  console.log('Categories:', categories.map(c => `${c.key} (${c.label})`).join(', '));

  const data = window.SIDEHUSTLES || {sidehustles: []};
  if (Array.isArray(data.sidehustles)) {
    const earning = data.sidehustles.map(h => ({
      name: h.name,
      earning: (h.financial && h.financial.monthlyEarning_max) || 0
    })).sort((a, b) => b.earning - a.earning).slice(0, 5);
    console.log('Top earning potential:', earning.map(e => `${e.name} ($${e.earning}/mo)`).join(', '));
  }
}

function debugMatch(state) {
  console.log('=== MATCH DEBUG ===');
  console.log('Input state:', state);
  const results = matchHustles(state);
  console.log('Top 5 matches:');
  results.slice(0, 5).forEach((r, i) => {
    console.log(`${i + 1}. ${r.hustle.name} (score: ${r.score.toFixed(0)})`);
    console.log('   ', r.matchReasons.join(' | '));
  });
}

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadSelectorOptionsData() {
  try {
    const response = await fetch('./data/selector-options.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    Object.assign(SELECTOR_OPTIONS, data);
    window.SELECTOR_OPTIONS = SELECTOR_OPTIONS;
    window.SELECTOR_OPTIONS_LOADED = true;
    SELECTOR_OPTIONS_LOADED = true;
    console.log('✓ Loaded selector-options.json');
    return true;
  } catch (e) {
    console.error('Failed to load selector-options.json:', e);
    return false;
  }
}

async function loadSideHustlesData() {
  try {
    const response = await fetch('./data/sidehustles.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    window.SIDEHUSTLES = data;
    SIDEHUSTLES_LOADED = true;
    window.SIDEHUSTLES_LOADED = true;
    console.log('✓ Loaded sidehustles.json');
    return true;
  } catch (e) {
    console.error('Failed to load sidehustles.json:', e);
    window.SIDEHUSTLES = {sidehustles: []};
    return false;
  }
}

async function loadInsightsData() {
  try {
    const response = await fetch('./data/insights.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    window.INSIGHTS = data;
    INSIGHTS_LOADED = true;
    window.INSIGHTS_LOADED = true;
    console.log('✓ Loaded insights.json');
    return true;
  } catch (e) {
    console.error('Failed to load insights.json:', e);
    window.INSIGHTS = {insights: []};
    return false;
  }
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

function saveState() {
  const stateToSave = {
    timeCommitment: S.timeCommitment || null,
    startupBudget: S.startupBudget || null,
    incomeType: S.incomeType || null,
    incomeGoal: S.incomeGoal || null,
    strengths: S.strengths || [],
    scalability: S.scalability || null,
    selectedCategory: S.selectedCategory || null,
    selectedHustle: S.selectedHustle || null,
    selectedHustleFilterCategories: S.selectedHustleFilterCategories || [],
    selectedHustleFilterHustles: S.selectedHustleFilterHustles || []
  };
  localStorage.setItem('sideHustlePathfinderState', JSON.stringify(stateToSave));
}

function loadState() {
  const saved = localStorage.getItem('sideHustlePathfinderState');
  if (saved) {
    const state = JSON.parse(saved);
    Object.assign(S, state);
    renderDiscoveryPills();
  }
}

function startOver() {
  S.timeCommitment = null;
  S.startupBudget = null;
  S.incomeType = null;
  S.incomeGoal = null;
  S.strengths = [];
  S.scalability = null;
  S.selectedCategory = null;
  S.selectedHustle = null;
  S.selectedHustleFilterCategories = [];
  S.selectedHustleFilterHustles = [];
  localStorage.removeItem('sideHustlePathfinderState');
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('on'));

  // Re-render current tab to reflect reset state
  const currentTab = sessionStorage.getItem('currentTab') || 'discover';
  if (window.PATHFINDER_CONFIG && window.PATHFINDER_CONFIG.renderersForTab && window.PATHFINDER_CONFIG.renderersForTab[currentTab]) {
    window.PATHFINDER_CONFIG.renderersForTab[currentTab]();
  }
}

// ============================================================================
// PILL RENDERING & HANDLERS
// ============================================================================

function renderDiscoverySelectorOptions() {
  const opts = window.SELECTOR_OPTIONS || {};
  const multiSelect = ['strengths'];

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

function renderDiscoveryPills() {
  document.querySelectorAll('[data-q="timeCommitment"] .pill').forEach(p => {
    if (S.timeCommitment === p.textContent) p.classList.add('on');
    else p.classList.remove('on');
  });
  document.querySelectorAll('[data-q="startupBudget"] .pill').forEach(p => {
    if (S.startupBudget === p.textContent) p.classList.add('on');
    else p.classList.remove('on');
  });
  document.querySelectorAll('[data-q="incomeType"] .pill').forEach(p => {
    if (S.incomeType === p.textContent) p.classList.add('on');
    else p.classList.remove('on');
  });
  document.querySelectorAll('[data-q="incomeGoal"] .pill').forEach(p => {
    if (S.incomeGoal === p.textContent) p.classList.add('on');
    else p.classList.remove('on');
  });
  document.querySelectorAll('[data-q="strengths"] .pill').forEach(p => {
    if (S.strengths && S.strengths.includes(p.textContent)) p.classList.add('on');
    else p.classList.remove('on');
  });
  document.querySelectorAll('[data-q="scalability"] .pill').forEach(p => {
    if (S.scalability === p.textContent) p.classList.add('on');
    else p.classList.remove('on');
  });
}

function pick1(q, el) {
  document.querySelectorAll(`[data-q="${q}"] .pill`).forEach(o => o.classList.remove('on'));
  el.classList.add('on');
  if (q === 'timeCommitment') S.timeCommitment = el.textContent;
  else if (q === 'startupBudget') S.startupBudget = el.textContent;
  else if (q === 'incomeType') S.incomeType = el.textContent;
  else if (q === 'incomeGoal') S.incomeGoal = el.textContent;
  else if (q === 'scalability') S.scalability = el.textContent;
  saveState();
}

function pickN(q, el) {
  el.classList.toggle('on');
  if (q === 'strengths') {
    S.strengths = [];
    document.querySelectorAll(`[data-q="${q}"] .pill.on`).forEach(p => S.strengths.push(p.textContent));
  }
  saveState();
}

function renderHustleFilterPills() {
  // Sync category pill states across all tabs
  document.querySelectorAll('[data-q="hustle-category"] .pill').forEach(p => {
    const catLabel = p.textContent;
    const catKey = getAllCategories().find(c => c.label === catLabel)?.key;
    if (catKey && S.selectedHustleFilterCategories.includes(catKey)) {
      p.classList.add('on');
    } else {
      p.classList.remove('on');
    }
  });

  // Sync hustle pill states across all tabs
  document.querySelectorAll('[data-q="hustle-specific"] .pill').forEach(p => {
    if (S.selectedHustleFilterHustles.includes(p.textContent)) {
      p.classList.add('on');
    } else {
      p.classList.remove('on');
    }
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initializePathfinder() {
  const config = window.PATHFINDER_CONFIG;
  if (!config) return;

  try {
    // Load data files from config
    console.log('Loading data files:', Object.keys(config.dataSources));
    for (const [key, file] of Object.entries(config.dataSources)) {
      console.log(`  Loading ${key} from ${file}...`);
      await loadDataFile({
        name: key,
        path: `data/${file}`,
        onSuccess: null
      });
      console.log(`  ✓ ${key} loaded, flag:`, window[key.toUpperCase().replace(/-/g, '_') + '_LOADED']);
    }

    console.log('Data check:', {
      SELECTOR_OPTIONS: !!window.SELECTOR_OPTIONS,
      KNOWLEDGE: !!window.KNOWLEDGE,
      SIDEHUSTLES: !!window.SIDEHUSTLES,
      INSIGHTS: !!window.INSIGHTS,
      SIDEHUSTLES_LOADED: window.SIDEHUSTLES_LOADED,
      KNOWLEDGE_LOADED: window.KNOWLEDGE_LOADED,
      SELECTOR_OPTIONS_LOADED: window.SELECTOR_OPTIONS_LOADED
    });

    // Build header
    if (config.header && window.buildHeader) {
      await buildHeader(config.header);
      if (window.initHdrCarousel) {
        initHdrCarousel();
      }
    }

    // Build selectors
    if (config.selectors && window.buildSelectors) {
      await buildSelectors(config.selectors, 'discover');
      await new Promise(r => setTimeout(r, 50));
    }

    // Populate selector pills
    if (window.renderDiscoverySelectorOptions) {
      renderDiscoverySelectorOptions();
    }
    if (window.renderDiscoveryPills) {
      renderDiscoveryPills();
    }

    // Restore saved state
    if (window.loadState) {
      loadState();
    }

    console.log('✓ Side Hustle Pathfinder initialized');
  } catch (error) {
    console.error('Side Hustle Pathfinder initialization failed:', error);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePathfinder);
} else {
  initializePathfinder();
}

window.initializePathfinder = initializePathfinder;

// Export to window
window.S = S;
window.saveState = saveState;
window.loadState = loadState;
window.startOver = startOver;
window.pick1 = pick1;
window.pickN = pickN;
window.renderDiscoverySelectorOptions = renderDiscoverySelectorOptions;
window.renderDiscoveryPills = renderDiscoveryPills;
window.renderHustleFilterPills = renderHustleFilterPills;
window.loadInsightsData = loadInsightsData;

// Export query helpers
window.getHustle = getHustle;
window.getHustlesByCategory = getHustlesByCategory;
window.getAllCategories = getAllCategories;
window.getHustleStartupCost = getHustleStartupCost;
window.getHustleEarningPotential = getHustleEarningPotential;
window.getHustleTimeToIncome = getHustleTimeToIncome;
window.getHustleEffort = getHustleEffort;
window.getHustleCompetition = getHustleCompetition;
window.getHustlePassivity = getHustlePassivity;
window.getHustleScalability = getHustleScalability;
window.getHustleSkills = getHustleSkills;
window.getHustlePlatforms = getHustlePlatforms;
window.getHustleResources = getHustleResources;
window.matchHustles = matchHustles;

// Export knowledge helpers
window.getKnowledgeDomain = getKnowledgeDomain;
window.getKnowledgeByCategory = getKnowledgeByCategory;
window.getAllKnowledgeCategories = getAllKnowledgeCategories;
window.getAllKnowledgeDomains = getAllKnowledgeDomains;
window.validateKnowledgeSchema = validateKnowledgeSchema;
window.validateAllKnowledgeDomains = validateAllKnowledgeDomains;

// Export formatting helpers
window.formatMoney = formatMoney;
window.formatMonthlyRange = formatMonthlyRange;
window.formatHours = formatHours;
window.formatCompetition = formatCompetition;
window.formatPassivity = formatPassivity;
window.formatScalability = formatScalability;
window.formatDemand = formatDemand;
window.formatSeasonality = formatSeasonality;
window.formatTimeToIncome = formatTimeToIncome;

// Export validation and debug helpers
window.validateHustleSchema = validateHustleSchema;
window.validateAllHustles = validateAllHustles;
window.debugHustle = debugHustle;
window.debugAllHustles = debugAllHustles;
window.debugMatch = debugMatch;
