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
  } else if (id === 'knowledge') {
    renderKnowledge();
  } else if (id === 'pathways') {
    renderPathways();
  } else if (id === 'synthesis') {
    renderSynthesis();
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

  // Build carousel and table using helpers
  const carouselId = containerId + '-carousel';
  html += buildCarouselHTML(rows, hustleNames, (name) => name, carouselId);

  // Desktop table version with responsive class
  html += '<div class="insights-table-display">' + buildTableHTML(rows, hustleNames, (name) => name, tableId) + '</div>';
  html += '</div>';

  // Now set the complete HTML
  container.innerHTML = html;

  // Add click handlers to table rows and carousel cards
  setTimeout(() => {
    // Table rows
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

    // Carousel cards
    const carouselCards = document.querySelectorAll(`#${containerId}-carousel .carousel-card`);
    carouselCards.forEach((card, idx) => {
      if (idx < sorted.length) {
        card.style.cursor = 'pointer';
        card.onclick = () => {
          S.selectedHustle = sorted[idx].name;
          saveState();
          showHustleDetail(sorted[idx]);
        };
      }
    });

    // Initialize carousel
    if(document.getElementById(containerId + '-carousel')) {
      initCarousel(containerId + '-carousel');
    }
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
    const navHtml = `<div class="bg"><button class="btn bs pos-left" onclick="go('synthesis')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go('earnings')">Next</button></div>`;
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
  const carouselId = 'hustles-carousel';
  const hustleNames = displayedHustles.slice(0, 20).map(h => h.name);

  // Use framework helpers (handles all CSS classes for responsive behavior)
  const t = buildTableHTML(rows, hustleNames, (name) => name, tableId);
  const carousel = buildCarouselHTML(rows, hustleNames, (name) => name, carouselId);
  html += t + carousel;
  html += '</div>';

  container.innerHTML = html;

  // Add click handlers to table rows and carousel cards
  setTimeout(() => {
    // Table rows
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

    // Carousel cards (select direct children divs)
    const carouselContainer = document.getElementById(carouselId);
    if (carouselContainer) {
      const carouselCards = carouselContainer.querySelectorAll(':scope > div');
      carouselCards.forEach((card, idx) => {
        if (idx < displayedHustles.length) {
          card.style.cursor = 'pointer';
          card.onclick = () => {
            S.selectedHustle = displayedHustles[idx].name;
            saveState();
            showHustleDetail(displayedHustles[idx]);
          };
        }
      });
    }

    // Initialize carousel
    if(document.getElementById(carouselId)) {
      initCarousel(carouselId);
    }
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
  const carouselId = 'earnings-carousel';
  const hustleNames = sorted.slice(0, 20).map(h => h.name);

  // Use framework helpers (handles all CSS classes for responsive behavior)
  const t = buildTableHTML(rows, hustleNames, (name) => name, tableId);
  const carousel = buildCarouselHTML(rows, hustleNames, (name) => name, carouselId);
  html += t + carousel;
  html += '</div>';

  container.innerHTML = html;

  // Add click handlers to table rows and carousel cards
  setTimeout(() => {
    // Table rows
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

    // Carousel cards (select direct children divs)
    const carouselContainer = document.getElementById(carouselId);
    if (carouselContainer) {
      const carouselCards = carouselContainer.querySelectorAll(':scope > div');
      carouselCards.forEach((card, idx) => {
        if (idx < sorted.length) {
          card.style.cursor = 'pointer';
          card.onclick = () => {
            S.selectedHustle = sorted[idx].name;
            saveState();
            showHustleDetail(sorted[idx]);
          };
        }
      });
    }

    // Initialize carousel
    if(document.getElementById(carouselId)) {
      initCarousel(carouselId);
    }
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

  if(hustleAnalysis.length > 0) {
    html += '<h2 style="margin:24px 0 12px 0;color:var(--dk);font-size:20px">Hustle Analysis</h2>';
    html += '<div style="font-size:13px;color:var(--tx2);margin-bottom:10px;line-height:1.5">How your selections fit your goals and constraints</div>';

    // Mobile carousel version
    html += '<div class="insights-carousel-wrap" id="insights-carousel"><div class="insights-carousel-container">';
    hustleAnalysis.forEach(hustle => {
      html += '<div class="insights-carousel-card"><div class="insights-carousel-card-header">' + hustle.name + '</div>';
      html += '<div class="insights-carousel-card-content">';
      if(hustle.pros.length > 0) {
        html += '<div class="insights-carousel-card-row"><strong style="color:var(--ok)">Strengths:</strong><br>' + hustle.pros.map(p => formatInsightItem(p, true)).join('<br>') + '</div>';
      }
      if(hustle.cons.length > 0) {
        html += '<div class="insights-carousel-card-row" style="margin-top:8px"><strong style="color:var(--warn)">Considerations:</strong><br>' + hustle.cons.map(c => formatInsightItem(c, false)).join('<br>') + '</div>';
      }
      html += '</div></div>';
    });
    html += '</div><div class="carousel-indicator">Card 1 of ' + hustleAnalysis.length + '</div></div>';

    // Desktop table version
    html += '<div class="insights-table-display"><div style="overflow-x:auto;margin-bottom:24px"><table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0">';
    html += '<thead><tr style="border-bottom:1px solid var(--bdr);background:var(--lt)"><th style="padding:8px 10px;text-align:left;color:var(--dk);font-weight:700;width:20%;white-space:nowrap">Hustle</th><th style="padding:8px 10px;text-align:left;color:var(--dk);font-weight:700;width:50%">Strengths</th><th style="padding:8px 10px;text-align:left;color:var(--dk);font-weight:700;width:30%">Considerations</th></tr></thead>';
    html += '<tbody>';
    hustleAnalysis.forEach(hustle => {
      const prosHTML = hustle.pros.length > 0 ? hustle.pros.map(p => formatInsightItem(p, true)).join('<br>') : '—';
      const consHTML = hustle.cons.length > 0 ? hustle.cons.map(c => formatInsightItem(c, false)).join('<br>') : '—';
      html += '<tr style="border-bottom:1px solid var(--bdr);background:#fff"><td style="padding:8px 10px;color:var(--tx0);font-weight:600;vertical-align:top;width:20%;line-height:1.4;background:rgba(241,245,249,.5);white-space:nowrap">' + hustle.name + '</td><td style="padding:8px 10px;vertical-align:top;width:50%;line-height:1.4">' + prosHTML + '</td><td style="padding:8px 10px;vertical-align:top;width:30%;line-height:1.4">' + consHTML + '</td></tr>';
    });
    html += '</tbody></table></div></div>';
  }

  html += '</div>';
  container.innerHTML = html;

  // Initialize all carousels with JavaScript-based snapping
  setTimeout(() => {
    if(document.getElementById('insights-carousel')) initCarousel('insights-carousel', '.insights-carousel-container');
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

// ============================================================================
// KNOWLEDGE TAB
// ============================================================================

function renderKnowledge() {
  const container = document.getElementById('knowledge');
  if (!container) return;

  if (!window.KNOWLEDGE_LOADED) {
    container.innerHTML = '<div style="padding:24px"><p>Loading knowledge domains...</p></div>';
    return;
  }

  let html = '<div style="padding:24px"><h2 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:var(--dk)">Knowledge Domains</h2>';
  html += '<p style="font-size:13px;color:var(--tx2);margin:0 0 24px 0;line-height:1.5;">Explore the skills and expertise that enable different side hustles. Select the knowledge domains you already have.</p>';

  // Category filter (always shown, multi-select)
  const categories = getAllKnowledgeCategories();
  const selectedCategories = S.selectedKnowledgeCategories || [];
  html += '<div style="margin-bottom:20px;"><div style="font-size:12px;font-weight:700;color:var(--pri);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Select One or More</div>';
  html += '<div style="font-size:18px;font-weight:700;margin-bottom:10px;color:var(--dk);">Categories</div>';
  html += '<div style="font-size:13px;color:var(--tx2);margin-bottom:10px;line-height:1.5;">Choose the knowledge areas that interest you.</div>';
  html += '<div class="pills" data-q="knowledge-category" style="margin-bottom:20px;">';
  categories.forEach(cat => {
    const isActive = selectedCategories.includes(cat.key) ? ' on' : '';
    html += '<div class="pill' + isActive + '" onclick="toggleKnowledgeCategory(\'' + cat.key + '\', this)">' + cat.label + '</div>';
  });
  html += '</div></div>';

  // Domain pills (only shown if categories selected)
  if (selectedCategories.length > 0) {
    const domainsInSelectedCats = selectedCategories.flatMap(catKey => getKnowledgeByCategory(catKey));
    // Deduplicate domains
    const uniqueDomains = [...new Map(domainsInSelectedCats.map(d => [d.name, d])).values()];
    const selectedDomains = S.selectedKnowledgeDomains || [];

    html += '<div style="margin-bottom:20px;"><div style="font-size:12px;font-weight:700;color:var(--pri);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Select One or More</div>';
    html += '<div style="font-size:18px;font-weight:700;margin-bottom:10px;color:var(--dk);">Domains</div>';
    html += '<div style="font-size:13px;color:var(--tx2);margin-bottom:10px;line-height:1.5;">Select specific skills or expertise you already have.</div>';
    html += '<div class="pills" data-q="knowledge-domain" style="margin-bottom:20px;">';
    uniqueDomains.forEach(domain => {
      const isActive = selectedDomains.includes(domain.name) ? ' on' : '';
      html += '<div class="pill' + isActive + '" onclick="toggleKnowledgeDomain(\'' + domain.name + '\', this)">' + domain.name + '</div>';
    });
    html += '</div></div>';

    // Show table/carousel only if domains selected
    if (selectedDomains.length > 0) {
      const selectedDomainObjs = uniqueDomains.filter(d => selectedDomains.includes(d.name));
      const rows = [
        ['Difficulty', (domainName) => {
          const domain = selectedDomainObjs.find(k => k.name === domainName);
          return domain ? domain.difficulty : '—';
        }],
        ['Time to Learn', (domainName) => {
          const domain = selectedDomainObjs.find(k => k.name === domainName);
          if (!domain) return '—';
          return domain.timeToLearnBasic_min + '-' + domain.timeToLearnBasic_max + ' ' + domain.timeToLearnBasic_unit;
        }],
        ['Market Demand', (domainName) => {
          const domain = selectedDomainObjs.find(k => k.name === domainName);
          return domain ? domain.marketDemand_label : '—';
        }]
      ];

      const tableId = 'knowledge-table';
      const carouselId = 'knowledge-carousel';

      // Use framework helpers (handles all CSS classes for responsive behavior)
      const t = buildTableHTML(rows, selectedDomains, (name) => name, tableId);
      const carousel = buildCarouselHTML(rows, selectedDomains, (name) => name, carouselId);
      html += t + carousel;

      // Initialize carousel after render
      setTimeout(() => {
        if(document.getElementById(carouselId)) {
          initCarousel(carouselId);
        }
      }, 50);
    }
  }

  html += '</div>';
  container.innerHTML = html;

  // Add navigation buttons
  const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'discover\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go(\'pathways\')">Next</button></div>';
  container.insertAdjacentHTML('beforeend', navHtml);
}

function toggleKnowledgeCategory(category, el) {
  // Toggle category in multi-select array
  const selected = S.selectedKnowledgeCategories || [];
  const idx = selected.indexOf(category);
  if (idx > -1) {
    selected.splice(idx, 1);
    // When deselecting category, remove domains from that category
    const domainsInCat = getKnowledgeByCategory(category).map(d => d.name);
    S.selectedKnowledgeDomains = (S.selectedKnowledgeDomains || []).filter(d => !domainsInCat.includes(d));
  } else {
    selected.push(category);
  }
  S.selectedKnowledgeCategories = selected;
  saveState();
  renderKnowledge();
}

function toggleKnowledgeDomain(domainName, el) {
  // Toggle domain in selected domains array
  const selected = S.selectedKnowledgeDomains || [];
  const idx = selected.indexOf(domainName);
  if (idx > -1) {
    selected.splice(idx, 1);
  } else {
    selected.push(domainName);
  }
  S.selectedKnowledgeDomains = selected;
  saveState();
  renderKnowledge();
}


function togglePathwayCategory(categoryName, el) {
  el.classList.toggle('on');
  const idx = S.selectedPathwayCategories.indexOf(categoryName);
  if (idx > -1) {
    S.selectedPathwayCategories.splice(idx, 1);
    // When deselecting category, remove pathways from that category
    const pathwaysInCat = getPathwaysByCategory(categoryName).map(p => p.id);
    S.selectedPathways = S.selectedPathways.filter(p => !pathwaysInCat.includes(p));
  } else {
    S.selectedPathwayCategories.push(categoryName);
  }
  saveState();
  renderPathways();
}

function togglePathway(pathwayId, el) {
  el.classList.toggle('on');
  const idx = S.selectedPathways.indexOf(pathwayId);
  if (idx > -1) {
    S.selectedPathways.splice(idx, 1);
  } else {
    S.selectedPathways.push(pathwayId);
  }
  saveState();
  renderPathways();
}

function renderPathways() {
  const container = document.getElementById('pathways');
  if (!container) return;

  let html = '<div style="padding:24px"><h2 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:var(--dk)">Monetization Pathways</h2>';
  html += '<p style="font-size:13px;color:var(--tx2);margin:0 0 24px 0;line-height:1.5;">Choose the ways you want to monetize your knowledge and skills. Each pathway has different earning potential, time requirements, and scaling possibilities.</p>';

  // Step 1: Category pills (always shown)
  const categories = getAllPathwayCategories();
  if (!categories || categories.length === 0) {
    console.warn('No categories found:', categories);
    html += '<div style="background:var(--lt);padding:24px;border-radius:6px;text-align:center;color:var(--tx2);">No pathway categories loaded. Check console for errors.</div>';
  } else {
    html += '<div style="margin-bottom:24px;"><div style="font-size:12px;font-weight:700;color:var(--pri);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Select One or More</div>';
    html += '<div style="font-size:18px;font-weight:700;margin-bottom:10px;color:var(--dk);">Pathway Categories</div>';
    html += '<div class="pills" data-q="pathway-category">';
    categories.forEach(cat => {
      const active = S.selectedPathwayCategories.includes(cat) ? ' on' : '';
      html += `<div class="pill${active}" onclick="togglePathwayCategory('${cat}', this)">${cat}</div>`;
    });
    html += '</div></div>';

    // Step 2: Pathway pills (only if categories selected)
    if (S.selectedPathwayCategories.length > 0) {
      const pathwaysInCats = S.selectedPathwayCategories.flatMap(cat => getPathwaysByCategory(cat));
      const uniquePathways = [...new Map(pathwaysInCats.map(p => [p.id, p])).values()];

      html += '<div style="margin-bottom:24px;"><div style="font-size:12px;font-weight:700;color:var(--pri);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Select One or More</div>';
      html += '<div style="font-size:18px;font-weight:700;margin-bottom:10px;color:var(--dk);">Specific Pathways</div>';
      html += '<div class="pills" data-q="pathway-specific">';
      uniquePathways.forEach(p => {
        const active = S.selectedPathways.includes(p.id) ? ' on' : '';
        html += `<div class="pill${active}" onclick="togglePathway('${p.id}', this)">${p.name}</div>`;
      });
      html += '</div></div>';

      // Step 3: Display table/carousel for selected pathways
      if (S.selectedPathways.length > 0) {
        const displayedPathways = S.selectedPathways.map(id => getPathway(id)).filter(p => p);
        if (displayedPathways.length > 0) {
          html += renderPathwayComparison(displayedPathways);
        }
      }
    }
  }

  container.innerHTML = html;

  // Add navigation buttons
  const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'knowledge\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go(\'synthesis\')">Next</button></div>';
  container.insertAdjacentHTML('beforeend', navHtml);

  // Initialize carousel if visible
  setTimeout(() => {
    if (window.initCarousel && S.selectedPathways.length > 0) {
      initCarousel('pathway-carousel');
    }
  }, 50);
}

// ============================================================================
// SYNTHESIS TAB - Explore Knowledge x Pathway combinations
// ============================================================================

function renderSynthesis() {
  const container = document.getElementById('synthesis');
  if (!container) return;

  let html = '<div style="padding:24px">';
  html += '<h2 style="margin:0 0 12px 0;font-size:22px;font-weight:700;color:var(--dk)">Synthesis: Your Opportunities</h2>';
  html += '<p style="font-size:13px;color:var(--tx2);margin:0 0 24px 0;line-height:1.5;">Explore combinations of your knowledge and pathways. Each row shows one possible side hustle.</p>';

  // Show knowledge domains from pre-selected categories
  if (S.selectedKnowledgeCategories.length > 0) {
    const knowledgeInCats = S.selectedKnowledgeCategories.flatMap(cat => getKnowledgeByCategory(cat));
    const uniqueKnowledge = [...new Map(knowledgeInCats.map(k => [k.id, k])).values()];

    if (uniqueKnowledge.length > 0) {
      html += '<div style="margin-bottom:20px;">';
      html += '<div style="font-size:12px;font-weight:700;color:var(--pri);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Select One or More</div>';
      html += '<div style="font-size:18px;font-weight:700;margin-bottom:10px;color:var(--dk);">Knowledge Domains</div>';
      html += '<div style="font-size:13px;color:var(--tx2);margin-bottom:10px;line-height:1.5;">To change knowledge categories, go back to the Knowledge tab.</div>';
      html += '<div class="pills" data-q="synthesis-knowledge">';
      uniqueKnowledge.forEach(k => {
        const active = S.selectedKnowledgeDomains.includes(k.name) ? ' on' : '';
        html += `<div class="pill${active}" onclick="toggleSynthesisKnowledge('${k.name}', this)">${k.name}</div>`;
      });
      html += '</div></div>';
    }
  } else {
    html += '<div style="padding:20px;background:var(--lt);border-radius:6px;margin-bottom:20px;"><div style="font-size:13px;color:var(--tx2);">Select knowledge categories on the Knowledge tab to begin.</div></div>';
  }

  // Show pathways from pre-selected categories
  if (S.selectedPathwayCategories.length > 0) {
    const pathwaysInCats = S.selectedPathwayCategories.flatMap(cat => getPathwaysByCategory(cat));
    const uniquePathways = [...new Map(pathwaysInCats.map(p => [p.id, p])).values()];

    if (uniquePathways.length > 0) {
      html += '<div style="margin-bottom:24px;">';
      html += '<div style="font-size:12px;font-weight:700;color:var(--pri);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Select One or More</div>';
      html += '<div style="font-size:18px;font-weight:700;margin-bottom:10px;color:var(--dk);">Pathways</div>';
      html += '<div style="font-size:13px;color:var(--tx2);margin-bottom:10px;line-height:1.5;">To change pathway categories, go back to the Pathways tab.</div>';
      html += '<div class="pills" data-q="synthesis-pathway">';
      uniquePathways.forEach(p => {
        const active = S.selectedPathways.includes(p.id) ? ' on' : '';
        html += `<div class="pill${active}" onclick="toggleSynthesisPathway('${p.id}', this)">${p.name}</div>`;
      });
      html += '</div></div>';
    }
  } else {
    html += '<div style="padding:20px;background:var(--lt);border-radius:6px;margin-bottom:20px;"><div style="font-size:13px;color:var(--tx2);">Select pathway categories on the Pathways tab to begin.</div></div>';
  }

  // Generate and display synthesis results
  if (S.selectedKnowledgeDomains.length > 0 && S.selectedPathways.length > 0) {
    const results = matchSideHustles(S.selectedKnowledgeDomains, S.selectedPathways);
    if (results.length > 0) {
      html += renderSynthesisResults(results);
    }
  }

  html += '</div>';
  container.innerHTML = html;

  // Add navigation buttons
  const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'pathways\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go(\'hustles\')">Next</button></div>';
  container.insertAdjacentHTML('beforeend', navHtml);

  // Initialize carousels if visible
  setTimeout(() => {
    if (window.initCarousel) {
      initCarousel('synthesis-carousel');
    }
  }, 50);
}

function toggleSynthesisKnowledgeCategory(catKey, el) {
  el.classList.toggle('on');
  const idx = S.selectedKnowledgeCategories.indexOf(catKey);
  if (idx > -1) {
    S.selectedKnowledgeCategories.splice(idx, 1);
  } else {
    S.selectedKnowledgeCategories.push(catKey);
  }
  saveState();
  renderSynthesis();
}

function toggleSynthesisPathwayCategory(catName, el) {
  el.classList.toggle('on');
  const idx = S.selectedPathwayCategories.indexOf(catName);
  if (idx > -1) {
    S.selectedPathwayCategories.splice(idx, 1);
  } else {
    S.selectedPathwayCategories.push(catName);
  }
  saveState();
  renderSynthesis();
}

function toggleSynthesisKnowledge(domainName, el) {
  el.classList.toggle('on');
  const idx = S.selectedKnowledgeDomains.indexOf(domainName);
  if (idx > -1) {
    S.selectedKnowledgeDomains.splice(idx, 1);
  } else {
    S.selectedKnowledgeDomains.push(domainName);
  }
  saveState();
  renderSynthesis();
}

function toggleSynthesisPathway(pathwayId, el) {
  el.classList.toggle('on');
  const idx = S.selectedPathways.indexOf(pathwayId);
  if (idx > -1) {
    S.selectedPathways.splice(idx, 1);
  } else {
    S.selectedPathways.push(pathwayId);
  }
  saveState();
  renderSynthesis();
}

function renderSynthesisResults(results) {
  if (results.length === 0) return '';

  // Flip table: combos as rows, scaffold components as columns
  const rows = results.map(result => [
    result.name,
    (colKey) => {
      if (colKey === 'What') return result.scaffold.what;
      if (colKey === 'How') return result.scaffold.how;
      if (colKey === 'Why') return result.scaffold.why;
      if (colKey === 'For You If') return result.scaffold.forYouIf;
      return '—';
    }
  ]);

  const columnKeys = ['What', 'How', 'Why', 'For You If'];
  const columnLabel = (key) => key;

  let html = '<div style="margin:24px 0 12px 0;">';
  html += '<div style="font-size:12px;font-weight:700;color:var(--pri);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Synthesis Results</div>';
  html += '<div style="font-size:18px;font-weight:700;margin-bottom:10px;color:var(--dk);">Your Opportunities</div>';
  html += '</div>';

  // Build table for desktop (combos as rows, scaffold properties as columns)
  html += buildTableHTML(rows, columnKeys, columnLabel, 'synthesis-table');

  // Build carousel for mobile (each combo as a card with scaffold properties)
  html += buildCarouselHTML(rows, columnKeys, columnLabel, 'synthesis-carousel');

  return html;
}

function renderPathwayComparison(pathways) {
  // Create a map of pathway names to pathway objects for quick lookup
  const pathwayMap = {};
  pathways.forEach(p => {
    pathwayMap[p.name] = p;
  });

  const rows = [
    ['Startup Cost', (name) => {
      const p = pathwayMap[name];
      return p ? formatMoney(p.financial.startupCost_min, p.financial.startupCost_max) : '—';
    }],
    ['Monthly Earning', (name) => {
      const p = pathwayMap[name];
      return p ? formatMoney(p.financial.monthlyEarning_min, p.financial.monthlyEarning_max) : '—';
    }],
    ['Hours/Week', (name) => {
      const p = pathwayMap[name];
      return p ? formatHours(p.effort.hoursPerWeek_min, p.effort.hoursPerWeek_max) : '—';
    }],
    ['Demand Level', (name) => {
      const p = pathwayMap[name];
      return p ? p.market.demandLevel : '—';
    }],
    ['Competition', (name) => {
      const p = pathwayMap[name];
      return p ? p.market.competitionLevel : '—';
    }],
    ['Scalability', (name) => {
      const p = pathwayMap[name];
      return p ? p.effort.scalabilityPotential : '—';
    }]
  ];

  const pathwayNames = pathways.map(p => p.name);
  const nameLabel = (name) => name;

  let html = '<div style="margin:24px 0 12px 0;"><div style="font-size:12px;font-weight:700;color:var(--pri);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Comparison</div>';
  html += '<div style="font-size:18px;font-weight:700;margin-bottom:10px;color:var(--dk);">Pathway Comparison</div></div>';

  // Build table for desktop
  html += buildTableHTML(rows, pathwayNames, nameLabel, 'pathway-table');

  // Build carousel for mobile
  html += buildCarouselHTML(rows, pathwayNames, nameLabel, 'pathway-carousel');

  return html;
}

window.renderKnowledge = renderKnowledge;
window.renderPathways = renderPathways;
window.renderSynthesis = renderSynthesis;
window.togglePathwayCategory = togglePathwayCategory;
window.togglePathway = togglePathway;
window.toggleSynthesisKnowledgeCategory = toggleSynthesisKnowledgeCategory;
window.toggleSynthesisPathwayCategory = toggleSynthesisPathwayCategory;
window.toggleSynthesisKnowledge = toggleSynthesisKnowledge;
window.toggleSynthesisPathway = toggleSynthesisPathway;
