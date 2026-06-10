// ============================================================================
// SIDE HUSTLE PATHFINDER RENDERERS
// Tab-specific rendering functions using framework helpers
// ============================================================================

// ============================================================================
// PATHFINDER TAB DISPATCHER
// Framework calls this when tabs are switched
// ============================================================================

function renderPathfinderTab(id) {
  if (id === 'discover') {
    // Framework handles rendering discovery selectors
  } else if (id === 'hustles') {
    renderHustles();
  } else if (id === 'earnings') {
    renderEarnings();
  } else if (id === 'insights') {
    renderInsights();
  } else if (id === 'deepdive') {
    renderDeepDive();
  } else if (id === 'resources') {
    renderResources();
  }
}

// ============================================================================
// SHARED CATEGORY/HUSTLE SELECTOR BUILDER
// Used by Side Hustles, Earnings, Deep Dive, and Resources tabs
// ============================================================================

function buildHustleFilterSelectors() {
  const categories = getAllCategories();
  const selectedCats = S.selectedHustleFilterCategories || [];
  const selectedHustles = S.selectedHustleFilterHustles || [];

  let html = '<div style="margin-bottom:20px;"><div style="font-size:12px;font-weight:700;color:var(--pri);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Select One or More</div>';
  html += '<div style="font-size:18px;font-weight:700;margin-bottom:10px;color:var(--dk);">Categories</div>';
  html += '<div style="font-size:13px;color:var(--tx2);margin-bottom:10px;line-height:1.5;">Choose the types of side hustles that interest you:</div>';
  html += '<div class="pills" data-q="hustle-category">';
  categories.forEach(cat => {
    const active = selectedCats.includes(cat.key) ? ' on' : '';
    html += `<div class="pill${active}" onclick="toggleHustleCategory('${cat.key}', this)">${cat.label}</div>`;
  });
  html += '</div></div>';

  // Hustle pills (only if one or more categories selected)
  if (selectedCats.length > 0) {
    const hustlesInSelectedCats = selectedCats.flatMap(cat => getHustlesByCategory(cat));
    // Deduplicate hustles by name
    const uniqueHustles = [...new Map(hustlesInSelectedCats.map(h => [h.name, h])).values()];
    html += '<div style="margin-bottom:20px;"><div style="font-size:12px;font-weight:700;color:var(--pri);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Select One or More</div>';
    html += '<div style="font-size:18px;font-weight:700;margin-bottom:10px;color:var(--dk);">Specific Hustles</div>';
    html += '<div style="font-size:13px;color:var(--tx2);margin-bottom:10px;line-height:1.5;">Pick the hustles you want to explore:</div>';
    html += '<div class="pills" data-q="hustle-specific">';
    uniqueHustles.forEach(h => {
      const active = selectedHustles.includes(h.name) ? ' on' : '';
      html += `<div class="pill${active}" onclick="toggleHustleSpecific('${h.name}', this)">${h.name}</div>`;
    });
    html += '</div></div>';
  }

  return html;
}

function getDisplayedHustles(source = 'discovery') {
  const selectedCats = S.selectedHustleFilterCategories || [];
  const selectedHustles = S.selectedHustleFilterHustles || [];

  let displayedHustles;
  if (selectedHustles.length > 0) {
    displayedHustles = selectedHustles.map(name => getHustle(name)).filter(h => h);
  } else if (selectedCats.length > 0) {
    displayedHustles = selectedCats.flatMap(cat => getHustlesByCategory(cat));
  } else {
    // No selection: return empty (like university pattern)
    // User must select categories or hustles to see results
    displayedHustles = [];
  }

  return [...new Map(displayedHustles.map(h => [h.name, h])).values()];
}

// ============================================================================
// UNIFIED HUSTLE TABLE RENDERER (used by Side Hustles & Earnings tabs)
// ============================================================================

function renderHustleTableView(containerId, title, subtitle, displayedHustles, sortFn, backTab, nextTab) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = '<div style="padding:24px"><h2 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:var(--dk)">' + title + '</h2>';
  html += '<p style="font-size:13px;color:var(--tx2);margin:0 0 24px 0;line-height:1.5;">' + subtitle + '</p>';

  html += buildHustleFilterSelectors();

  const selectedHustles = S.selectedHustleFilterHustles || [];

  // If no hustles selected, show guidance
  if (selectedHustles.length === 0) {
    const selectedCats = S.selectedHustleFilterCategories || [];
    let guidance = '';
    if (selectedCats.length === 0) {
      guidance = 'Select one or more categories to get started.';
    } else {
      guidance = 'Select one or more hustles to view details.';
    }
    html += `<div style="padding:20px;text-align:center;color:var(--tx2)"><p>${guidance}</p></div>`;
    html += '</div>';
    container.innerHTML = html;

    // Add navigation buttons
    const navHtml = `<div class="bg"><button class="btn bs pos-left" onclick="go('${backTab}')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go('${nextTab}')">Next</button></div>`;
    container.insertAdjacentHTML('beforeend', navHtml);
    return;
  }

  const sorted = sortFn ? [...displayedHustles].sort(sortFn) : displayedHustles;

  const tableId = containerId + '-table';
  const hustleNames = sorted.slice(0, 20).map(h => h.name);

  // Build rows/columns structure (used by both table and carousel)
  const rows = [
    ['Startup Cost', (hustleName) => {
      const h = getHustle(hustleName);
      return h ? formatMoney(h.financial.startupCost_min, h.financial.startupCost_max) : '—';
    }],
    ['Time to Income', (hustleName) => {
      const h = getHustle(hustleName);
      return h ? h.financial.timeToFirstIncome : '—';
    }],
    ['Monthly Earning', (hustleName) => {
      const h = getHustle(hustleName);
      return h ? formatMonthlyRange(h.financial.monthlyEarning_min, h.financial.monthlyEarning_max) : '—';
    }],
    ['Competition', (hustleName) => {
      const h = getHustle(hustleName);
      return h ? formatCompetition(h.character.competitionLevel) : '—';
    }],
    ['Passivity', (hustleName) => {
      const h = getHustle(hustleName);
      return h ? formatPassivity(h.character.passivityScore) : '—';
    }],
    ['Market Saturation', (hustleName) => {
      const h = getHustle(hustleName);
      return h ? h.character.marketSaturation : '—';
    }]
  ];

  // Render table only (no carousel on desktop per requirements)
  html += buildTableHTML(rows, hustleNames, (name) => name, tableId);
  html += '</div>';

  // Now set the complete HTML
  container.innerHTML = html;

  // Add click handlers to table rows
  setTimeout(() => {
    const tableRows = document.querySelectorAll(`#${tableId} tbody tr`);
    tableRows.forEach((row, idx) => {
      if (idx < sorted.length) {
        row.style.cursor = 'pointer';
        row.onclick = () => {
          S.selectedHustle = sorted[idx].name;
          saveState();
          showHustleDetail(sorted[idx]);
        };
      }
    });
  }, 50);

  // Add navigation buttons
  const navHtml = `<div class="bg"><button class="btn bs pos-left" onclick="go('${backTab}')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go('${nextTab}')">Next</button></div>`;
  container.insertAdjacentHTML('beforeend', navHtml);
}

// ============================================================================
// SIDE HUSTLES TAB
// ============================================================================

function renderHustles() {
  if (!window.SIDEHUSTLES || !window.SIDEHUSTLES_LOADED) {
    const container = document.getElementById('hustles');
    if (container) container.innerHTML = '<div style="padding:24px"><p>Loading hustles...</p></div>';
    return;
  }

  const displayedHustles = getDisplayedHustles('discovery');
  const selectedHustles = S.selectedHustleFilterHustles || [];
  const container = document.getElementById('hustles');
  if (!container) return;

  let html = '<div style="padding:24px"><h2 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:var(--dk)">Your Matches</h2>';
  html += '<p style="font-size:13px;color:var(--tx2);margin:0 0 24px 0;line-height:1.5;">Qualitative overview—explore the vibe, character, and narrative of each hustle:</p>';

  html += buildHustleFilterSelectors();

  if (selectedHustles.length === 0) {
    const selectedCats = S.selectedHustleFilterCategories || [];
    let guidance = '';
    if (selectedCats.length === 0) {
      guidance = 'Select one or more categories to get started.';
    } else {
      guidance = 'Select one or more hustles to view details.';
    }
    html += `<div style="padding:20px;text-align:center;color:var(--tx2)"><p>${guidance}</p></div>`;
    html += '</div>';
    container.innerHTML = html;
    const navHtml = `<div class="bg"><button class="btn bs pos-left" onclick="go('discover')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go('earnings')">Next</button></div>`;
    container.insertAdjacentHTML('beforeend', navHtml);
    return;
  }

  // Qualitative table: narrative, character, competition, scalability
  const rows = [
    ['Overview', (hustleName) => {
      const h = getHustle(hustleName);
      return h ? h.description : '—';
    }],
    ['Competition', (hustleName) => {
      const h = getHustle(hustleName);
      return h ? (h.character.competitionLevel || '—').toUpperCase() : '—';
    }],
    ['Scalability', (hustleName) => {
      const h = getHustle(hustleName);
      return h ? (h.effort.scalabilityPotential || '—').replace(/_/g, ' ').toUpperCase() : '—';
    }],
    ['Passivity', (hustleName) => {
      const h = getHustle(hustleName);
      if (!h) return '—';
      const score = h.character.passivityScore || 0;
      return score > 0.7 ? 'Highly Passive' : score > 0.4 ? 'Mixed' : 'Mostly Active';
    }]
  ];

  const tableId = 'hustles-table';
  const hustleNames = displayedHustles.slice(0, 20).map(h => h.name);

  html += buildTableHTML(rows, hustleNames, (name) => name, tableId);
  html += '</div>';

  container.innerHTML = html;

  // Add click handlers to table rows
  setTimeout(() => {
    const tableRows = document.querySelectorAll(`#${tableId} tbody tr`);
    tableRows.forEach((row, idx) => {
      if (idx < displayedHustles.length) {
        row.style.cursor = 'pointer';
        row.onclick = () => {
          S.selectedHustle = displayedHustles[idx].name;
          saveState();
          showHustleDetail(displayedHustles[idx]);
        };
      }
    });
  }, 50);

  // Add navigation buttons
  const navHtml = `<div class="bg"><button class="btn bs pos-left" onclick="go('discover')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go('earnings')">Next</button></div>`;
  container.insertAdjacentHTML('beforeend', navHtml);
}

// ============================================================================
// EARNINGS TAB
// ============================================================================

function renderEarnings() {
  if (!window.SIDEHUSTLES || !window.SIDEHUSTLES_LOADED) {
    const container = document.getElementById('earnings');
    if (container) container.innerHTML = '<div style="padding:24px"><p>Loading earnings data...</p></div>';
    return;
  }

  const displayedHustles = getDisplayedHustles('earnings');
  const selectedHustles = S.selectedHustleFilterHustles || [];
  const container = document.getElementById('earnings');
  if (!container) return;

  let html = '<div style="padding:24px"><h2 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:var(--dk)">Earnings & ROI Comparison</h2>';
  html += '<p style="font-size:13px;color:var(--tx2);margin:0 0 24px 0;line-height:1.5;">Quantitative analysis—startup costs, earning potential, and profitability timelines:</p>';

  html += buildHustleFilterSelectors();

  if (selectedHustles.length === 0) {
    const selectedCats = S.selectedHustleFilterCategories || [];
    let guidance = '';
    if (selectedCats.length === 0) {
      guidance = 'Select one or more categories to get started.';
    } else {
      guidance = 'Select one or more hustles to view earnings.';
    }
    html += `<div style="padding:20px;text-align:center;color:var(--tx2)"><p>${guidance}</p></div>`;
    html += '</div>';
    container.innerHTML = html;
    const navHtml = `<div class="bg"><button class="btn bs pos-left" onclick="go('hustles')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go('insights')">Next</button></div>`;
    container.insertAdjacentHTML('beforeend', navHtml);
    return;
  }

  // Sort by earning potential (high to low)
  const sorted = [...displayedHustles].sort((a, b) => {
    return (b.financial.monthlyEarning_max - a.financial.monthlyEarning_max) ||
           (a.financial.startupCost_max - b.financial.startupCost_max);
  });

  // Quantitative table: startup cost, income potential, ROI, break-even
  const rows = [
    ['Startup Cost', (hustleName) => {
      const h = getHustle(hustleName);
      return h ? formatMoney(h.financial.startupCost_min, h.financial.startupCost_max) : '—';
    }],
    ['Monthly Earning', (hustleName) => {
      const h = getHustle(hustleName);
      return h ? formatMonthlyRange(h.financial.monthlyEarning_min, h.financial.monthlyEarning_max) : '—';
    }],
    ['Time to Income', (hustleName) => {
      const h = getHustle(hustleName);
      return h ? h.financial.timeToFirstIncome : '—';
    }],
    ['Profit Margin', (hustleName) => {
      const h = getHustle(hustleName);
      if (!h || !h.financial.profitMargin_low) return '—';
      return h.financial.profitMargin_low + '-' + h.financial.profitMargin_high + '%';
    }],
    ['Break-Even', (hustleName) => {
      const h = getHustle(hustleName);
      if (!h) return '—';
      const months = h.financial.breakEvenMonths;
      return months === 0 ? 'Immediate' : months + ' month' + (months !== 1 ? 's' : '');
    }]
  ];

  const tableId = 'earnings-table';
  const hustleNames = sorted.slice(0, 20).map(h => h.name);

  html += buildTableHTML(rows, hustleNames, (name) => name, tableId);
  html += '</div>';

  container.innerHTML = html;

  // Add click handlers to table rows
  setTimeout(() => {
    const tableRows = document.querySelectorAll(`#${tableId} tbody tr`);
    tableRows.forEach((row, idx) => {
      if (idx < sorted.length) {
        row.style.cursor = 'pointer';
        row.onclick = () => {
          S.selectedHustle = sorted[idx].name;
          saveState();
          showHustleDetail(sorted[idx]);
        };
      }
    });
  }, 50);

  // Add navigation buttons
  const navHtml = `<div class="bg"><button class="btn bs pos-left" onclick="go('hustles')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go('insights')">Next</button></div>`;
  container.insertAdjacentHTML('beforeend', navHtml);
}

// ============================================================================
// DEEP DIVE TAB
// ============================================================================

function renderDeepDive() {
  const container = document.getElementById('deepdive');
  if (!container) return;

  if (!window.SIDEHUSTLES || !window.SIDEHUSTLES_LOADED) {
    container.innerHTML = '<div style="padding:24px"><p>Loading deep dive...</p></div>';
    return;
  }

  const selectedHustles = S.selectedHustleFilterHustles || [];

  if (selectedHustles.length === 0) {
    let html = '<div style="padding:24px"><h2 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:var(--dk)">What\'s the full story for this hustle?</h2>';
    html += '<p style="font-size:13px;color:var(--tx2);margin:0 0 24px 0;line-height:1.5;">Select hustles from earlier tabs to explore in depth.</p>';
    html += '<div style="padding:20px;text-align:center;color:var(--tx2)"><p>Go back and select hustles first.</p></div>';
    html += '</div>';
    container.innerHTML = html;
    const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'insights\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go(\'resources\')">Next</button></div>';
    container.insertAdjacentHTML('beforeend', navHtml);
    return;
  }

  // Set default to first hustle on first visit
  if (!S.selectedDeepDiveHustle) {
    S.selectedDeepDiveHustle = selectedHustles[0];
    saveState();
  }

  const selectedHustle = S.selectedDeepDiveHustle;

  let html = '<div style="padding:24px"><h2 style="margin:0 0 8px 0;font-size:22px;font-weight:700;color:var(--dk)">What\'s the full story for this hustle?</h2>';
  html += '<p style="font-size:13px;color:var(--tx2);margin-bottom:20px;line-height:1.5;">Review detailed information about this hustle, including typical timelines, key decisions, market context, and resources for further learning.</p>';

  // Single-select pill selector for deep dive (deduplicated)
  const uniqueHustles = [...new Set(selectedHustles)];
  html += '<div style="margin-bottom:16px;"><div style="font-weight:700;margin-bottom:10px;color:var(--pri);text-transform:uppercase;letter-spacing:0.5px;font-size:11px;">Select One</div>';
  html += '<div class="pills" data-q="deepdive-select" style="display:flex;flex-wrap:wrap;gap:8px;">';
  uniqueHustles.forEach(name => {
    const active = (selectedHustle === name) ? ' on' : '';
    html += `<div class="pill${active}" onclick="toggleDeepDive('${name}', this)" style="cursor:pointer;">${name}</div>`;
  });
  html += '</div></div>';

  html += '<div id="deepdive-content" style="padding:20px;margin-top:20px;"></div>';

  container.innerHTML = html;

  setTimeout(() => {
    updateDeepDiveContent();
  }, 100);

  // Add navigation buttons
  const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'insights\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go(\'resources\')">Next</button></div>';
  container.insertAdjacentHTML('beforeend', navHtml);
}

// ============================================================================
// RESOURCES TAB
// ============================================================================

function renderResources() {
  const container = document.getElementById('resources');
  if (!container) return;

  if (!window.SIDEHUSTLES || !window.SIDEHUSTLES_LOADED) {
    container.innerHTML = '<div style="padding:24px"><p>Loading resources...</p></div>';
    return;
  }

  const selectedHustles = S.selectedHustleFilterHustles || [];

  let html = '<div style="padding:24px"><h2 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:var(--dk)">Resources</h2>';
  html += '<p style="font-size:13px;color:var(--tx2);margin:0 0 24px 0;line-height:1.5;">Recommended resources for your selected hustles:</p>';

  if (selectedHustles.length === 0) {
    html += '<div style="padding:20px;text-align:center;color:var(--tx2)"><p>Select one or more hustles to view resources.</p></div>';
    html += '</div>';
    container.innerHTML = html;
    const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'deepdive\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button></div>';
    container.insertAdjacentHTML('beforeend', navHtml);
    return;
  }

  html += '<div style="display:grid;gap:20px">';

  selectedHustles.forEach(hustleName => {
    const hustle = getHustle(hustleName);
    if (!hustle) return;

    html += `<div style="border:1px solid var(--bdr);padding:20px;border-radius:8px;background:var(--lt)">`;
    html += `<h3 style="margin-top:0;color:var(--dk)">${hustle.name}</h3>`;
    html += '<ul style="margin:10px 0;padding-left:20px;">';
    if (hustle.practical && hustle.practical.resources) {
      hustle.practical.resources.forEach(r => {
        html += `<li style="margin-bottom:8px;"><a href="${r.url}" target="_blank" style="color:#0066cc;text-decoration:none;">${r.title}</a></li>`;
      });
    }
    html += '</ul></div>';
  });

  html += '</div></div>';
  container.innerHTML = html;

  // Add navigation buttons
  const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'deepdive\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button></div>';
  container.insertAdjacentHTML('beforeend', navHtml);
}

// ============================================================================
// HUSTLE DETAIL MODAL
// ============================================================================

function showHustleDetail(hustle) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); z-index: 1000; display: flex;
    align-items: center; justify-content: center; overflow-y: auto;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white; border-radius: 8px; padding: 30px; max-width: 600px;
    width: 90%; margin: 20px 0;
  `;

  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">${hustle.name}</h2>
      <button onclick="this.closest('div').parentElement.parentElement.remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
    </div>

    <p style="color: #666; margin-bottom: 20px;">${hustle.description}</p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      <div style="padding: 12px; background: #f0f0f0; border-radius: 6px;">
        <div style="font-size: 12px; color: #666;">Startup Cost</div>
        <div style="font-size: 16px; font-weight: bold;">${formatMoney(hustle.financial.startupCost_min, hustle.financial.startupCost_max)}</div>
        <div style="font-size: 12px; color: #999;">${hustle.financial.startupCost_note}</div>
      </div>

      <div style="padding: 12px; background: #f0f0f0; border-radius: 6px;">
        <div style="font-size: 12px; color: #666;">Time to First Income</div>
        <div style="font-size: 16px; font-weight: bold;">${hustle.financial.timeToFirstIncome}</div>
      </div>

      <div style="padding: 12px; background: #f0f0f0; border-radius: 6px;">
        <div style="font-size: 12px; color: #666;">Monthly Earning</div>
        <div style="font-size: 16px; font-weight: bold;">${formatMonthlyRange(hustle.financial.monthlyEarning_min, hustle.financial.monthlyEarning_max)}</div>
      </div>

      <div style="padding: 12px; background: #f0f0f0; border-radius: 6px;">
        <div style="font-size: 12px; color: #666;">Time Required</div>
        <div style="font-size: 16px; font-weight: bold;">${formatHours(hustle.effort.hoursPerWeekRequired_min, hustle.effort.hoursPerWeekRequired_max)}</div>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="margin-top: 0;">Pros</h4>
      <ul style="margin: 10px 0; padding-left: 20px;">
        ${hustle.practical.pros.map(p => `<li>${p}</li>`).join('')}
      </ul>
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="margin-top: 0;">Cons</h4>
      <ul style="margin: 10px 0; padding-left: 20px;">
        ${hustle.practical.cons.map(c => `<li>${c}</li>`).join('')}
      </ul>
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="margin-top: 0;">Required Skills</h4>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${hustle.practical.requiredSkills.map(s => `<span style="background: #ddd; padding: 4px 10px; border-radius: 4px; font-size: 13px;">${s}</span>`).join('')}
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="margin-top: 0;">Resources</h4>
      <ul style="margin: 10px 0; padding-left: 20px;">
        ${hustle.practical.resources.map(r => `<li><a href="${r.url}" target="_blank" style="color: #0066cc; text-decoration: none;">${r.title}</a></li>`).join('')}
      </ul>
    </div>
  `;

  modal.appendChild(content);
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  document.body.appendChild(modal);
}

// ============================================================================
// UNIFIED CATEGORY/HUSTLE TOGGLE (Multi-select, synced across all tabs)
// ============================================================================

function toggleHustleCategory(catKey, el) {
  el.classList.toggle('on');
  // Toggle category directly in state
  const idx = S.selectedHustleFilterCategories.indexOf(catKey);
  if (idx > -1) {
    // Deselecting category: remove selected hustles from this category
    S.selectedHustleFilterCategories.splice(idx, 1);
    const hustlesInCat = getHustlesByCategory(catKey).map(h => h.name);
    S.selectedHustleFilterHustles = S.selectedHustleFilterHustles.filter(h => !hustlesInCat.includes(h));
  } else {
    // Selecting category: keep existing hustle selections
    S.selectedHustleFilterCategories.push(catKey);
  }
  saveState();
  // Re-render all tabs to show updated filters
  renderHustles();
  renderEarnings();
  renderDeepDive();
  // Sync pills across all tabs
  setTimeout(() => renderHustleFilterPills(), 50);
}

function toggleHustleSpecific(hustleName, el) {
  el.classList.toggle('on');
  // Update S state from all selected hustle pills
  S.selectedHustleFilterHustles = [];
  document.querySelectorAll('[data-q="hustle-specific"] .pill.on').forEach(p => {
    S.selectedHustleFilterHustles.push(p.textContent);
  });
  saveState();
  // Re-render all tabs to show updated filters
  renderHustles();
  renderEarnings();
  renderDeepDive();
  // Sync pills across all tabs
  setTimeout(() => renderHustleFilterPills(), 50);
}

// ============================================================================
// GETTING STARTED GUIDE
// ============================================================================

function updateGuide() {
  const selectedHustles = S.selectedHustleFilterHustles;
  let hustleName;

  if (selectedHustles && selectedHustles.length > 0) {
    hustleName = selectedHustles[0];
  } else {
    const displayed = getDisplayedHustles('discovery');
    hustleName = displayed[0]?.name;
  }

  if (!hustleName) {
    const guideContent = document.getElementById('guide-content');
    if (guideContent) guideContent.innerHTML = '<p style="color: var(--tx2);">Select a hustle from the categories above to see the getting started guide.</p>';
    return;
  }

  const hustle = getHustle(hustleName);
  if (!hustle) return;

  const guideContent = document.getElementById('guide-content');
  if (!guideContent) return;

  let html = `<h3>${hustle.name}</h3>`;
  html += `<p>${hustle.description}</p>`;

  html += '<div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">';
  html += '<h4 style="margin-top: 0;">Quick Facts</h4>';
  html += `<ul style="margin: 10px 0; padding-left: 20px;">
    <li><strong>Startup Cost:</strong> ${formatMoney(hustle.financial.startupCost_min, hustle.financial.startupCost_max)}</li>
    <li><strong>Time to First Income:</strong> ${hustle.financial.timeToFirstIncome}</li>
    <li><strong>Monthly Earning:</strong> ${formatMonthlyRange(hustle.financial.monthlyEarning_min, hustle.financial.monthlyEarning_max)}</li>
    <li><strong>Time Needed:</strong> ${formatHours(hustle.effort.hoursPerWeekRequired_min, hustle.effort.hoursPerWeekRequired_max)}</li>
  </ul>`;
  html += '</div>';

  html += '<div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">';
  html += '<h4 style="margin-top: 0;">5 Steps to Get Started</h4>';
  const steps = generateGetStartedSteps(hustle);
  html += '<ol style="margin: 10px 0; padding-left: 20px;">';
  steps.forEach(step => {
    html += `<li style="margin-bottom: 10px;"><strong>${step.title}:</strong> ${step.description}</li>`;
  });
  html += '</ol>';
  html += '</div>';

  html += '<div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">';
  html += '<h4 style="margin-top: 0;">Resources</h4>';
  html += '<ul style="margin: 10px 0; padding-left: 20px;">';
  hustle.practical.resources.forEach(r => {
    html += `<li><a href="${r.url}" target="_blank" style="color: #0066cc; text-decoration: none;">${r.title}</a></li>`;
  });
  html += '</ul>';
  html += '</div>';

  guideContent.innerHTML = html;
}

function generateGetStartedSteps(hustle) {
  const stepTemplates = {
    'Freelance Writing': [
      {title: 'Set Up Your Portfolio', description: 'Create a simple portfolio site or use Medium to showcase writing samples.'},
      {title: 'Choose Your Niche', description: 'Pick a specific type of writing (tech, business, lifestyle) to stand out.'},
      {title: 'Join Freelance Platforms', description: 'Sign up on Upwork, Fiverr, or LinkedIn to find clients.'},
      {title: 'Write Your First Pitch', description: 'Craft 5 personalized pitches to potential clients explaining your value.'},
      {title: 'Deliver & Get Reviews', description: 'Complete your first project with high quality to build 5-star reviews.'}
    ],
    'Web Development': [
      {title: 'Learn the Basics', description: 'Refresh HTML/CSS/JavaScript or learn React/Vue for modern web development.'},
      {title: 'Build Portfolio Projects', description: 'Create 3-5 sample websites to showcase your skills.'},
      {title: 'Set Competitive Rates', description: 'Research freelance rates ($50-150/hr depending on experience) and set your rate.'},
      {title: 'Join Freelance Platforms', description: 'Post profiles on Upwork, Toptal, or Gun.io with your portfolio.'},
      {title: 'Land Your First Client', description: 'Pitch 10-15 potential clients and close your first project.'}
    ]
  };

  return stepTemplates[hustle.name] || [
    {title: 'Research the Market', description: 'Learn what customers want and identify your competitive advantage.'},
    {title: 'Set Up Your Infrastructure', description: 'Create the tools/platform/presence needed to offer this service.'},
    {title: 'Create Your Offering', description: 'Define what you\'re selling and at what price.'},
    {title: 'Land Your First Customer', description: 'Use free marketing, networking, or inexpensive ads to land 1 paying customer.'},
    {title: 'Deliver & Iterate', description: 'Over-deliver on your first project, get testimonials, and improve based on feedback.'}
  ];
}

// ============================================================================
// DEEP DIVE HELPERS
// ============================================================================

function toggleDeepDive(hustleName, el) {
  // Single-select: remove 'on' from all pills, add to clicked
  document.querySelectorAll('[data-q="deepdive-select"] .pill').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  S.selectedDeepDiveHustle = hustleName;
  saveState();
  updateDeepDiveContent();
}

function updateDeepDiveContent() {
  const container = document.getElementById('deepdive-content');
  if (!container) return;

  const hustleName = S.selectedDeepDiveHustle || (S.selectedHustleFilterHustles && S.selectedHustleFilterHustles[0]);
  if (!hustleName) {
    container.innerHTML = '<p style="color:var(--tx2);">Select a hustle to view details.</p>';
    return;
  }

  const hustle = getHustle(hustleName);
  if (!hustle) return;

  let html = '<div>';
  html += '<h3 style="margin:0 0 16px 0;font-size:20px;font-weight:700;color:var(--dk)">' + hustle.name + '</h3>';

  // Narrative / Overview
  html += '<div style="margin-bottom:24px;">';
  html += '<h4 style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:var(--dk)">Overview</h4>';
  html += '<p style="margin:0;font-size:13px;color:var(--tx);line-height:1.6;">' + hustle.narrative + '</p>';
  html += '</div>';

  // Why might you like it
  if (hustle.whyMightLikeIt && hustle.whyMightLikeIt.length > 0) {
    html += '<div style="margin-bottom:24px;">';
    html += '<h4 style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:var(--dk)">Why It Might Appeal to You</h4>';
    html += '<ul style="margin:0;padding-left:20px;font-size:13px;">';
    hustle.whyMightLikeIt.forEach(item => {
      html += '<li style="margin-bottom:6px;color:var(--tx)">' + item + '</li>';
    });
    html += '</ul></div>';
  }

  // Typical Timeline
  if (hustle.typicalTimeline) {
    html += '<div style="margin-bottom:24px;">';
    html += '<h4 style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:var(--dk)">Typical Timeline to Profitability</h4>';
    html += '<p style="margin:0;font-size:13px;color:var(--tx);line-height:1.6;">' + hustle.typicalTimeline + '</p>';
    html += '</div>';
  }

  // Key Decision Points
  if (hustle.keyDecisionPoints && hustle.keyDecisionPoints.length > 0) {
    html += '<div style="margin-bottom:24px;">';
    html += '<h4 style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:var(--dk)">Critical Decision Points</h4>';
    html += '<ol style="margin:0;padding-left:20px;font-size:13px;">';
    hustle.keyDecisionPoints.forEach(point => {
      html += '<li style="margin-bottom:8px;color:var(--tx)">' + point + '</li>';
    });
    html += '</ol></div>';
  }

  // Risks
  if (hustle.risks && hustle.risks.length > 0) {
    html += '<div style="margin-bottom:24px;">';
    html += '<h4 style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:var(--warn)">Risks & Challenges</h4>';
    html += '<ul style="margin:0;padding-left:20px;font-size:13px;">';
    hustle.risks.forEach(risk => {
      html += '<li style="margin-bottom:6px;color:var(--tx)">' + risk + '</li>';
    });
    html += '</ul></div>';
  }

  // Market Context
  if (hustle.marketContext) {
    html += '<div style="margin-bottom:24px;">';
    html += '<h4 style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:var(--dk)">Market Context</h4>';
    html += '<p style="margin:0;font-size:13px;color:var(--tx);line-height:1.6;">' + hustle.marketContext + '</p>';
    html += '</div>';
  }

  // Tax Considerations
  if (hustle.taxConsiderations) {
    html += '<div style="margin-bottom:24px;">';
    html += '<h4 style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:var(--dk)">Tax Considerations</h4>';
    html += '<p style="margin:0;font-size:13px;color:var(--tx);line-height:1.6;">' + hustle.taxConsiderations + '</p>';
    html += '</div>';
  }

  // Resources
  if (hustle.practical && hustle.practical.resources && hustle.practical.resources.length > 0) {
    html += '<div style="margin-bottom:20px;">';
    html += '<h4 style="margin-top:0;margin-bottom:8px;color:var(--dk)">Resources to Get Started</h4>';
    html += '<ul style="margin:0;padding-left:20px;font-size:13px;">';
    hustle.practical.resources.forEach(r => {
      html += '<li style="margin-bottom:6px;"><a href="' + r.url + '" target="_blank" style="color:#0066cc;text-decoration:none;">' + r.title + '</a></li>';
    });
    html += '</ul></div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

// ============================================================================
// INSIGHTS TAB
// ============================================================================

function renderInsights() {
  const container = document.getElementById('insights');
  if (!container) return;

  if (!window.SIDEHUSTLES || !window.SIDEHUSTLES_LOADED) {
    container.innerHTML = '<div style="padding:24px"><p>Loading insights...</p></div>';
    return;
  }

  const selectedHustles = S.selectedHustleFilterHustles || [];

  let html = '<div style="padding:24px">';

  if (selectedHustles.length === 0) {
    html += '<h2 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:var(--dk)">Your Insights</h2>';
    html += '<p style="font-size:13px;color:var(--tx2);margin:0;line-height:1.5;">Select one or more hustles to view insights and recommendations.</p>';
    html += '</div>';
    container.innerHTML = html;
    const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'earnings\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go(\'deepdive\')">Next</button></div>';
    container.insertAdjacentHTML('beforeend', navHtml);
    return;
  }

  // Generate narrative paragraph from discovery selections
  html += generateInsightNarrativeParagraph(selectedHustles);

  // Build insights with pros/cons structure
  const hustleAnalysis = generateHustleInsightsWithProsCons(selectedHustles);

  // Render insights table with proper spacing
  html += '<div style="margin-top:32px">';
  html += renderInsightsTable('Hustle Analysis', 'How your selections fit your goals and constraints', 'Hustle', hustleAnalysis, 'insights-carousel');
  html += '</div>';

  html += '</div>';
  container.innerHTML = html;

  // Initialize carousel for mobile view
  setTimeout(() => {
    if (document.getElementById('insights-carousel')) {
      initCarousel('insights-carousel');
    }
  }, 50);

  // Add navigation buttons
  const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'earnings\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go(\'deepdive\')">Next</button></div>';
  container.insertAdjacentHTML('beforeend', navHtml);
}

function generateInsightNarrativeParagraph(selectedHustles) {
  let html = '';
  const narrativeParts = [];

  // Time commitment
  if (S.timeCommitment) {
    narrativeParts.push('You\'re looking for a side hustle that fits <strong style="color:var(--pri)">' + S.timeCommitment + '</strong> of your time.');
  }

  // Startup budget
  if (S.startupBudget) {
    narrativeParts.push('Your startup budget is <strong style="color:var(--pri)">' + S.startupBudget + '</strong>.');
  }

  // Income preferences
  if (S.incomeGoal) {
    narrativeParts.push('You\'re aiming for <strong style="color:var(--pri)">' + S.incomeGoal + '</strong>.');
  }

  // Income type (active vs passive)
  if (S.incomeType) {
    narrativeParts.push('You prefer <strong style="color:var(--pri)">' + S.incomeType + '</strong>.');
  }

  // Strengths
  if (S.strengths && S.strengths.length > 0) {
    const strengthList = S.strengths.map(s => '<strong style="color:var(--pri)">' + s + '</strong>').join(', ');
    narrativeParts.push('Your strengths include ' + strengthList + '.');
  }

  // Scalability goals
  if (S.scalability) {
    narrativeParts.push('You\'re interested in hustles that are <strong style="color:var(--pri)">' + S.scalability + '</strong>.');
  }

  if (narrativeParts.length > 0) {
    html += '<h2 style="margin:0 0 12px 0;color:var(--dk);font-size:22px;font-weight:700">Your Narrative</h2>';
    html += '<p style="line-height:1.6;color:var(--tx1);margin:0 0 20px 0;font-size:13px">' + narrativeParts.join(' ') + '</p>';
  }

  return html;
}

function generateHustleInsightsWithProsCons(selectedHustles) {
  const hustles = selectedHustles.map(name => getHustle(name)).filter(h => h);
  if (hustles.length === 0) return [];

  const insights = [];

  hustles.forEach(hustle => {
    const pros = [];
    const cons = [];

    // Time alignment
    const timeRange = hustle.effort.hoursPerWeekRequired_min + '-' + hustle.effort.hoursPerWeekRequired_max;
    if (S.timeCommitment) {
      const timeMap = {
        '5-10 hours/week': 10,
        '10-20 hours/week': 20,
        '20+ hours/week': 40
      };
      const availableHours = timeMap[S.timeCommitment] || 20;
      const requiredMax = hustle.effort.hoursPerWeekRequired_max;

      if (requiredMax <= availableHours * 0.6) {
        pros.push('✅ Time commitment (' + timeRange + ' hrs/week) fits comfortably within your availability');
      } else if (requiredMax <= availableHours) {
        pros.push('✅ Time commitment (' + timeRange + ' hrs/week) aligns with your availability');
      } else {
        cons.push('⚠️ Requires ' + timeRange + ' hrs/week, but you have ' + availableHours + ' hours available');
      }
    }

    // Startup cost alignment
    if (S.startupBudget) {
      const budgetMap = {
        'No money ($0)': 0,
        'Very low ($0-100)': 100,
        'Low ($100-500)': 500,
        'Moderate ($500-2K)': 2000,
        'High ($2K+)': 5000
      };
      const budget = budgetMap[S.startupBudget] || 500;
      const costRange = hustle.financial.startupCost_min + '-$' + hustle.financial.startupCost_max;

      if (hustle.financial.startupCost_max <= budget) {
        pros.push('✅ Startup cost ($' + costRange + ') fits your budget');
      } else if (hustle.financial.startupCost_min <= budget) {
        pros.push('ℹ️ Can start low ($' + hustle.financial.startupCost_min + '), but full setup costs up to $' + hustle.financial.startupCost_max);
      } else {
        cons.push('⚠️ Startup cost ($' + costRange + ') exceeds your budget of $' + budget);
      }
    }

    // Income goal alignment
    if (S.incomeGoal) {
      const goalMap = {
        'Just spending money ($500-1K/month)': 500,
        'Meaningful supplement ($1K-2K/month)': 1000,
        'Replace part-time job ($2K-4K/month)': 2000,
        'Full-time replacement ($4K+/month)': 4000
      };
      const goalAmount = goalMap[S.incomeGoal] || 1000;
      const earnRange = '$' + hustle.financial.monthlyEarning_min + '-$' + hustle.financial.monthlyEarning_max + '/month';

      if (hustle.financial.monthlyEarning_max >= goalAmount) {
        pros.push('✅ Earning potential (' + earnRange + ') can meet your income goal');
      } else if (hustle.financial.monthlyEarning_max >= goalAmount * 0.7) {
        pros.push('ℹ️ Can earn ' + earnRange + ', getting close to your goal');
      } else {
        cons.push('⚠️ Max earnings (' + earnRange + ') fall short of your goal ($' + goalAmount + '/month)');
      }
    }

    // Income type alignment (active vs passive)
    if (S.incomeType === 'Mostly passive income' && hustle.character.passivityScore < 0.4) {
      cons.push('⚠️ This is mostly active work (' + (hustle.character.passivityScore * 100).toFixed(0) + '% passive)—requires ongoing effort');
    } else if (S.incomeType === 'Active work, higher income' && hustle.character.passivityScore > 0.6) {
      cons.push('⚠️ This is mostly passive (' + (hustle.character.passivityScore * 100).toFixed(0) + '% passive)—may require less ongoing attention');
    }

    // Scalability
    if (S.scalability === 'Yes, scale it into a business') {
      if (hustle.effort.scalabilityPotential === 'high' || hustle.effort.scalabilityPotential === 'very_high') {
        pros.push('✅ High scalability potential—can grow into a full business');
      } else {
        cons.push('⚠️ Limited scalability—stays a side hustle due to time constraints');
      }
    } else if (S.scalability === 'Keep it small and simple') {
      if (hustle.effort.scalabilityPotential === 'low' || hustle.effort.scalabilityPotential === 'medium') {
        pros.push('✅ Low overhead and complexity—easy to keep as a side hustle');
      }
    }

    // Strengths alignment
    if (S.strengths && S.strengths.length > 0 && hustle.practical.requiredSkills) {
      const requiredSkills = hustle.practical.requiredSkills.map(s => s.toLowerCase());
      const userStrengths = S.strengths.map(s => s.toLowerCase());
      const matches = requiredSkills.filter(skill => userStrengths.some(us => us.includes(skill) || skill.includes(us)));

      if (matches.length > 0) {
        pros.push('✅ Aligns with your strengths: ' + matches.join(', '));
      } else if (hustle.practical.requiredSkills.length <= 2) {
        pros.push('ℹ️ Requires skills you can learn: ' + hustle.practical.requiredSkills.join(', '));
      } else {
        cons.push('⚠️ Requires skills you may need to develop: ' + hustle.practical.requiredSkills.join(', '));
      }
    }

    // Market insights
    if (hustle.character.demandTrend === 'growing') {
      pros.push('✅ Growing market demand—good timing to enter');
    } else if (hustle.character.demandTrend === 'declining') {
      cons.push('⚠️ Market demand is declining—consider other options');
    }

    if (hustle.character.competitionLevel === 'very_high') {
      cons.push('⚠️ Very high competition—success requires differentiation');
    } else if (hustle.character.competitionLevel === 'low') {
      pros.push('✅ Low competition—easier to establish yourself');
    }

    insights.push({
      title: hustle.name,
      name: hustle.name,
      pros: pros.length > 0 ? pros : ['—'],
      cons: cons.length > 0 ? cons : ['—']
    });
  });

  return insights;
}

// Export to window
window.renderPathfinderTab = renderPathfinderTab;
window.renderHustles = renderHustles;
window.renderEarnings = renderEarnings;
window.renderInsights = renderInsights;
window.renderDeepDive = renderDeepDive;
window.renderResources = renderResources;
window.showHustleDetail = showHustleDetail;
window.toggleHustleCategory = toggleHustleCategory;
window.toggleHustleSpecific = toggleHustleSpecific;
window.toggleDeepDive = toggleDeepDive;
window.updateDeepDiveContent = updateDeepDiveContent;
window.updateGuide = updateGuide;
