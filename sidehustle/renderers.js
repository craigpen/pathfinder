// ============================================================================
// SIDE HUSTLE PATHFINDER RENDERERS
// Tab-specific rendering functions using framework helpers
// ============================================================================

// ============================================================================
// SHARED CATEGORY/HUSTLE SELECTOR BUILDER
// Used by Side Hustles, Earnings, and Getting Started tabs
// ============================================================================

function buildHustleFilterSelectors() {
  const categories = getAllCategories();
  const selectedCats = S.selectedHustleFilterCategories || [];
  const selectedHustles = S.selectedHustleFilterHustles || [];

  let html = '<div style="margin-bottom:20px;"><div style="font-weight:600;margin-bottom:10px;color:var(--dk);">Categories</div>';
  html += '<div class="pills" data-q="hustle-category">';
  categories.forEach(cat => {
    const active = selectedCats.includes(cat.key) ? ' on' : '';
    html += `<div class="pill${active}" onclick="toggleHustleCategory('${cat.key}', this)">${cat.label}</div>`;
  });
  html += '</div></div>';

  // Hustle pills (only if categories selected)
  if (selectedCats.length > 0) {
    const hustlesInSelectedCats = selectedCats.flatMap(cat => getHustlesByCategory(cat));
    // Deduplicate hustles by name (in case hustle appears in multiple selected categories)
    const uniqueHustles = [...new Map(hustlesInSelectedCats.map(h => [h.name, h])).values()];
    html += '<div style="margin-bottom:20px;"><div style="font-weight:600;margin-bottom:10px;color:var(--dk);">Hustles</div>';
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
    if (source === 'earnings') {
      // Show all hustles for earnings
      const data = window.SIDEHUSTLES || {sidehustles: []};
      displayedHustles = data.sidehustles || [];
    } else {
      // Show matched hustles for side hustles
      displayedHustles = matchHustles(S).map(m => m.hustle);
    }
  }

  return [...new Map(displayedHustles.map(h => [h.name, h])).values()];
}

// ============================================================================
// UNIFIED HUSTLE TABLE RENDERER (used by Side Hustles & Earnings tabs)
// ============================================================================

function renderHustleTableView(containerId, title, subtitle, displayedHustles, sortFn, backTab, nextTab) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (displayedHustles.length === 0) {
    container.innerHTML = '<div style="padding:24px"><p style="color:var(--tx2)">No hustles to display.</p><div class="bg"><button class="btn bs pos-left" onclick="go(\'discover\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button></div></div>';
    return;
  }

  const sorted = sortFn ? [...displayedHustles].sort(sortFn) : displayedHustles;

  let html = '<div style="padding:24px"><div style="font-size:18px;font-weight:700;margin-bottom:8px;color:var(--dk)">' + title + '</div>';
  html += '<p style="font-size:13px;color:var(--tx2);margin-bottom:20px;">' + subtitle + '</p>';

  html += buildHustleFilterSelectors();

  // Build carousel with hustles as columns (cards)
  const carouselId = containerId + '-carousel';
  const hustleNames = sorted.slice(0, 20).map(h => h.name);

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

  html += buildCarouselHTML(rows, hustleNames, (name) => name, carouselId);
  html += '</div>';

  container.innerHTML = html;

  // Add click handlers to carousel cards
  setTimeout(() => {
    const cards = document.querySelectorAll(`#${carouselId} .carousel-card`);
    cards.forEach((card, idx) => {
      if (idx < sorted.length) {
        card.style.cursor = 'pointer';
        card.onclick = () => {
          S.selectedHustle = sorted[idx].name;
          saveState();
          showHustleDetail(sorted[idx]);
        };
      }
    });
    initCarousel(carouselId);
  }, 50);

  // Add navigation buttons
  const navHtml = `<div class="bg"><button class="btn bs pos-left" onclick="go('${backTab}')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go('${nextTab}')">Next</button></div>`;
  container.insertAdjacentHTML('beforeend', navHtml);
}

// ============================================================================
// SIDE HUSTLES TAB
// ============================================================================

function renderHustles() {
  if (!window.SIDEHUSTLES || !SIDEHUSTLES_LOADED) {
    const container = document.getElementById('hustles');
    if (container) container.innerHTML = '<div style="padding:24px"><p>Loading hustles...</p></div>';
    return;
  }

  const displayedHustles = getDisplayedHustles('discovery');
  renderHustleTableView(
    'hustles',
    'Your Matches',
    'Filter by categories or select specific hustles:',
    displayedHustles,
    null,  // no sorting
    'discover',
    'earnings'
  );
}

// ============================================================================
// EARNINGS TAB
// ============================================================================

function renderEarnings() {
  if (!window.SIDEHUSTLES || !SIDEHUSTLES_LOADED) {
    const container = document.getElementById('earnings');
    if (container) container.innerHTML = '<div style="padding:24px"><p>Loading earnings data...</p></div>';
    return;
  }

  const displayedHustles = getDisplayedHustles('earnings');

  // Sort by earning potential
  const sortFn = (a, b) => {
    return (b.financial.monthlyEarning_max - a.financial.monthlyEarning_max) ||
           (a.financial.startupCost_max - b.financial.startupCost_max);
  };

  renderHustleTableView(
    'earnings',
    'Earnings & ROI Comparison',
    'Ranked by monthly earning potential. Filter by categories or select specific hustles:',
    displayedHustles,
    sortFn,
    'hustles',
    'insights'
  );
}

// ============================================================================
// GETTING STARTED TAB
// ============================================================================

function renderGetStarted() {
  const container = document.getElementById('getstarted');
  if (!container) return;

  if (!window.SIDEHUSTLES || !SIDEHUSTLES_LOADED) {
    container.innerHTML = '<div style="padding:24px"><p>Loading guides...</p></div>';
    return;
  }

  const selectedHustle = S.selectedHustle || getDisplayedHustles('discovery')[0]?.name;

  let html = '<div style="padding:24px"><div style="font-size:18px;font-weight:700;margin-bottom:8px;color:var(--dk)">Getting Started</div>';
  html += '<p style="font-size:13px;color:var(--tx2);margin-bottom:20px;">Use category and hustle filters to select a side hustle, then follow the step-by-step guide:</p>';

  html += buildHustleFilterSelectors();

  html += '<div id="guide-content" style="background: #f9f9f9; padding: 20px; border-radius: 6px; margin-top: 20px;"></div>';

  container.innerHTML = html;

  setTimeout(() => {
    updateGuide();
  }, 100);

  // Add navigation buttons
  const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'earnings\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button></div>';
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
  renderGetStarted();
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
  renderGetStarted();
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
// INSIGHTS TAB
// ============================================================================

function renderInsights() {
  const container = document.getElementById('insights');
  if (!container) return;

  if (!window.INSIGHTS || !INSIGHTS_LOADED) {
    container.innerHTML = '<div style="padding:24px"><p>Loading insights...</p></div>';
    return;
  }

  const insights = (window.INSIGHTS && window.INSIGHTS.insights) || [];

  let html = '<div style="padding:24px"><div style="font-size:18px;font-weight:700;margin-bottom:8px;color:var(--dk)">Insights & Analysis</div>';
  html += '<p style="font-size:13px;color:var(--tx2);margin-bottom:20px;">General patterns from your selections:</p>';

  const typeIcons = {
    'pro': '✅',
    'neutral': 'ℹ️',
    'con': '⚠️',
    'conflict': '💥'
  };

  const typeColors = {
    'pro': 'color:var(--ok)',
    'neutral': 'color:var(--tx2)',
    'con': 'color:var(--warn)',
    'conflict': 'color:var(--bad)'
  };

  html += '<div style="display:grid;gap:12px">';
  insights.forEach(insight => {
    const icon = typeIcons[insight.type] || '•';
    const color = typeColors[insight.type] || '';
    html += `
      <div style="border:1px solid var(--bdr);padding:12px;border-radius:6px;background:var(--lt)">
        <div style="font-weight:600;margin-bottom:4px;${color}">${icon} ${insight.title}</div>
        <div style="font-size:13px;line-height:1.5;color:var(--tx)">${insight.msg}</div>
      </div>
    `;
  });
  html += '</div></div>';

  container.innerHTML = html;

  // Add navigation buttons
  const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'earnings\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go(\'getstarted\')">Next</button></div>';
  container.insertAdjacentHTML('beforeend', navHtml);
}

// Export to window
window.renderHustles = renderHustles;
window.renderEarnings = renderEarnings;
window.renderInsights = renderInsights;
window.renderGetStarted = renderGetStarted;
window.showHustleDetail = showHustleDetail;
window.toggleHustleCategory = toggleHustleCategory;
window.toggleHustleSpecific = toggleHustleSpecific;
window.updateGuide = updateGuide;
