// ============================================================================
// SIDE HUSTLE PATHFINDER HELPERS
// Query, format, validate, and debug functions for side hustle data
// ============================================================================

let SIDEHUSTLES_LOADED = false;

// ============================================================================
// QUERY HELPERS
// ============================================================================

function getHustle(name) {
  if (!window.SIDEHUSTLES) return null;
  return window.SIDEHUSTLES.sidehustles.find(h => h.name === name) || null;
}

function getHustlesByCategory(categoryKey) {
  if (!window.SIDEHUSTLES) return [];
  return window.SIDEHUSTLES.sidehustles.filter(h => h.category === categoryKey);
}

function getAllCategories() {
  if (!window.SIDEHUSTLES) return [];
  const categories = new Map();
  window.SIDEHUSTLES.sidehustles.forEach(h => {
    if (!categories.has(h.category)) {
      categories.set(h.category, h.categoryLabel);
    }
  });
  return Array.from(categories.entries()).map(([key, label]) => ({key, label}));
}

function matchHustles(state) {
  if (!window.SIDEHUSTLES) return [];

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

  const timeRange = timeHours[state.timeCommitment] || {min: 0, max: 999};
  const budgetRange = budgets[state.startupBudget] || {min: 0, max: 999999};
  const incomeRange = incomeGoals[state.incomeGoal] || {min: 0, max: 999999};
  const strengths = Array.isArray(state.strengths) ? state.strengths : [];

  const results = window.SIDEHUSTLES.sidehustles.map(hustle => {
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
  if (!window.SIDEHUSTLES || !window.SIDEHUSTLES.sidehustles) {
    return {total: 0, valid: 0, invalid: 0, errors: ['SIDEHUSTLES data not loaded']};
  }

  let valid = 0, invalid = 0;
  const errors = [];

  window.SIDEHUSTLES.sidehustles.forEach((h, i) => {
    const result = validateHustleSchema(h);
    if (result.valid) {
      valid++;
    } else {
      invalid++;
      errors.push(`${h.name}: ${result.errors.join('; ')}`);
    }
  });

  return {
    total: window.SIDEHUSTLES.sidehustles.length,
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

  const earning = window.SIDEHUSTLES.sidehustles.map(h => ({
    name: h.name,
    earning: h.financial.monthlyEarning_max
  })).sort((a, b) => b.earning - a.earning).slice(0, 5);
  console.log('Top earning potential:', earning.map(e => `${e.name} ($${e.earning}/mo)`).join(', '));
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

async function loadSideHustlesData() {
  try {
    const response = await fetch('data/sidehustles.json');
    const data = await response.json();
    window.SIDEHUSTLES = data;
    SIDEHUSTLES_LOADED = true;
    console.log('✓ Loaded sidehustles.json');
    return true;
  } catch (e) {
    console.error('Failed to load sidehustles.json:', e);
    window.SIDEHUSTLES = {sidehustles: []};
    return false;
  }
}
