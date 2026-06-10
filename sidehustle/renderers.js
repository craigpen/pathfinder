// ============================================================================
// SIDE HUSTLE PATHFINDER RENDERERS
// Tab-specific rendering functions using framework helpers
// ============================================================================

function renderHustles() {
  const container = document.getElementById('hustles');
  if (!container) return;

  if (!window.SIDEHUSTLES || !SIDEHUSTLES_LOADED) {
    container.innerHTML = '<div style="padding:24px"><p>Loading hustles...</p></div>';
    return;
  }

  const categories = getAllCategories();
  const selectedCats = S.selectedHustleFilterCategories || [];
  const selectedHustles = S.selectedHustleFilterHustles || [];

  // Determine which hustles to display
  let displayedHustles;
  if (selectedHustles.length > 0) {
    // Show selected hustles
    displayedHustles = selectedHustles.map(name => getHustle(name)).filter(h => h);
  } else if (selectedCats.length > 0) {
    // Show all hustles in selected categories
    displayedHustles = selectedCats.flatMap(cat => getHustlesByCategory(cat));
  } else {
    // Show matched hustles from discovery
    displayedHustles = matchHustles(S).map(m => m.hustle);
  }

  // Remove duplicates
  displayedHustles = [...new Map(displayedHustles.map(h => [h.name, h])).values()];

  if (displayedHustles.length === 0) {
    container.innerHTML = '<div style="padding:24px"><p style="color:var(--tx2)">No hustles to display.</p><div class="bg"><button class="btn bs pos-left" onclick="go(\'discover\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button></div></div>';
    return;
  }

  let html = '<div style="padding:24px"><div style="font-size:18px;font-weight:700;margin-bottom:8px;color:var(--dk)">Your Matches</div>';
  html += '<p style="font-size:13px;color:var(--tx2);margin-bottom:20px;">Filter by categories or select specific hustles:</p>';

  // Category selector pills (multi-select)
  html += '<div style="margin-bottom:20px;"><div style="font-weight:600;margin-bottom:10px;color:var(--dk);">Categories</div>';
  html += '<div class="pills" data-q="hustle-category">';
  categories.forEach(cat => {
    const active = selectedCats.includes(cat.key) ? ' on' : '';
    html += `<div class="pill${active}" onclick="toggleHustleCategory('${cat.key}', this)">${cat.label}</div>`;
  });
  html += '</div></div>';

  // Hustle selector pills (multi-select, if categories selected)
  if (selectedCats.length > 0) {
    const hustlesInSelectedCats = selectedCats.flatMap(cat => getHustlesByCategory(cat));
    html += '<div style="margin-bottom:20px;"><div style="font-weight:600;margin-bottom:10px;color:var(--dk);">Hustles</div>';
    html += '<div class="pills" data-q="hustle-specific">';
    hustlesInSelectedCats.forEach(h => {
      const active = selectedHustles.includes(h.name) ? ' on' : '';
      html += `<div class="pill${active}" onclick="toggleHustleSpecific('${h.name}', this)">${h.name}</div>`;
    });
    html += '</div></div>';
  }

  // Build table using framework helper
  const tableId = 'hustles-table';
  const rows = displayedHustles.slice(0, 50).map((h) => {
    return [h.name, (key) => {
      if (key === 'startup') return formatMoney(h.financial.startupCost_min, h.financial.startupCost_max);
      if (key === 'time') return h.financial.timeToFirstIncome;
      if (key === 'earning') return formatMonthlyRange(h.financial.monthlyEarning_min, h.financial.monthlyEarning_max);
      if (key === 'competition') return formatCompetition(h.character.competitionLevel);
      return h.name;
    }];
  });

  const columnLabel = (key) => {
    const labels = {
      'startup': 'Startup Cost',
      'time': 'Time to Income',
      'earning': 'Monthly Earning',
      'competition': 'Competition'
    };
    return labels[key] || key;
  };

  html += buildTableHTML(rows, ['startup', 'time', 'earning', 'competition'], columnLabel, tableId);
  html += '</div>';

  container.innerHTML = html;

  // Add click handlers to table rows
  setTimeout(() => {
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach((row, idx) => {
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
  const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'discover\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go(\'earnings\')">Next</button></div>';
  container.insertAdjacentHTML('beforeend', navHtml);
}

function toggleHustleCategory(catKey, el) {
  el.classList.toggle('on');
  S.selectedHustleFilterCategories = [];
  document.querySelectorAll('[data-q="hustle-category"] .pill.on').forEach(p => {
    S.selectedHustleFilterCategories.push(p.textContent);
  });
  // Reset hustle selections when categories change
  S.selectedHustleFilterHustles = [];
  saveState();
  renderHustles();
}

function toggleHustleSpecific(hustleName, el) {
  el.classList.toggle('on');
  S.selectedHustleFilterHustles = [];
  document.querySelectorAll('[data-q="hustle-specific"] .pill.on').forEach(p => {
    S.selectedHustleFilterHustles.push(p.textContent);
  });
  saveState();
  renderHustles();
}

function renderEarnings() {
  const container = document.getElementById('earnings');
  if (!container) return;

  if (!window.SIDEHUSTLES || !SIDEHUSTLES_LOADED) {
    container.innerHTML = '<div style="padding:24px"><p>Loading earnings data...</p></div>';
    return;
  }

  const categories = getAllCategories();
  const selectedCats = S.selectedEarningsFilterCategories || [];
  const selectedHustles = S.selectedEarningsFilterHustles || [];

  // Determine which hustles to display and sort
  let displayedHustles;
  if (selectedHustles.length > 0) {
    // Show selected hustles
    displayedHustles = selectedHustles.map(name => getHustle(name)).filter(h => h);
  } else if (selectedCats.length > 0) {
    // Show all hustles in selected categories
    displayedHustles = selectedCats.flatMap(cat => getHustlesByCategory(cat));
  } else {
    // Show all hustles
    const data = window.SIDEHUSTLES || {sidehustles: []};
    displayedHustles = data.sidehustles || [];
  }

  // Remove duplicates
  displayedHustles = [...new Map(displayedHustles.map(h => [h.name, h])).values()];

  // Sort by earning potential
  displayedHustles = [...displayedHustles].sort((a, b) => {
    return (b.financial.monthlyEarning_max - a.financial.monthlyEarning_max) ||
           (a.financial.startupCost_max - b.financial.startupCost_max);
  });

  let html = '<div style="padding:24px"><div style="font-size:18px;font-weight:700;margin-bottom:8px;color:var(--dk)">Earnings & ROI Comparison</div>';
  html += '<p style="font-size:13px;color:var(--tx2);margin-bottom:20px;">Ranked by monthly earning potential. Filter by categories or select specific hustles:</p>';

  // Category selector pills (multi-select)
  html += '<div style="margin-bottom:20px;"><div style="font-weight:600;margin-bottom:10px;color:var(--dk);">Categories</div>';
  html += '<div class="pills" data-q="earnings-category">';
  categories.forEach(cat => {
    const active = selectedCats.includes(cat.key) ? ' on' : '';
    html += `<div class="pill${active}" onclick="toggleEarningsCategory('${cat.key}', this)">${cat.label}</div>`;
  });
  html += '</div></div>';

  // Hustle selector pills (multi-select, if categories selected)
  if (selectedCats.length > 0) {
    const hustlesInSelectedCats = selectedCats.flatMap(cat => getHustlesByCategory(cat));
    html += '<div style="margin-bottom:20px;"><div style="font-weight:600;margin-bottom:10px;color:var(--dk);">Hustles</div>';
    html += '<div class="pills" data-q="earnings-specific">';
    hustlesInSelectedCats.forEach(h => {
      const active = selectedHustles.includes(h.name) ? ' on' : '';
      html += `<div class="pill${active}" onclick="toggleEarningsSpecific('${h.name}', this)">${h.name}</div>`;
    });
    html += '</div></div>';
  }

  // Build table using framework helper
  const tableId = 'earnings-table';
  const rows = displayedHustles.slice(0, 50).map(h => {
    return [h.name, (key) => {
      if (key === 'startup') return formatMoney(h.financial.startupCost_min, h.financial.startupCost_max);
      if (key === 'time') return h.financial.timeToFirstIncome;
      if (key === 'earning') return formatMonthlyRange(h.financial.monthlyEarning_min, h.financial.monthlyEarning_max);
      if (key === 'competition') return formatCompetition(h.character.competitionLevel);
      return h.name;
    }];
  });

  const columnLabel = (key) => {
    const labels = {
      'startup': 'Startup',
      'time': 'Time to Income',
      'earning': 'Monthly Earning',
      'competition': 'Competition'
    };
    return labels[key] || key;
  };

  html += buildTableHTML(rows, ['startup', 'time', 'earning', 'competition'], columnLabel, tableId);
  html += '</div>';

  container.innerHTML = html;

  // Add click handlers to table rows
  setTimeout(() => {
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach((row, idx) => {
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
  const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'hustles\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button><button class="btn bp pos-right" onclick="go(\'getstarted\')">Next</button></div>';
  container.insertAdjacentHTML('beforeend', navHtml);
}

function toggleEarningsCategory(catKey, el) {
  el.classList.toggle('on');
  S.selectedEarningsFilterCategories = [];
  document.querySelectorAll('[data-q="earnings-category"] .pill.on').forEach(p => {
    S.selectedEarningsFilterCategories.push(p.textContent);
  });
  // Reset hustle selections when categories change
  S.selectedEarningsFilterHustles = [];
  saveState();
  renderEarnings();
}

function toggleEarningsSpecific(hustleName, el) {
  el.classList.toggle('on');
  S.selectedEarningsFilterHustles = [];
  document.querySelectorAll('[data-q="earnings-specific"] .pill.on').forEach(p => {
    S.selectedEarningsFilterHustles.push(p.textContent);
  });
  saveState();
  renderEarnings();
}

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

function renderGetStarted() {
  const container = document.getElementById('getstarted');
  if (!container) return;

  if (!window.SIDEHUSTLES || !SIDEHUSTLES_LOADED) {
    container.innerHTML = '<div style="padding:24px"><p>Loading guides...</p></div>';
    return;
  }

  const categories = getAllCategories();
  const selectedCat = S.selectedCategory || categories[0]?.key;
  const selectedHustle = S.selectedHustle || getHustlesByCategory(selectedCat)?.[0]?.name;

  let html = '<div style="padding:24px"><div style="font-size:18px;font-weight:700;margin-bottom:8px;color:var(--dk)">Getting Started</div>';
  html += '<p style="font-size:13px;color:var(--tx2);margin-bottom:20px;">Choose a side hustle and get a step-by-step guide to launch it in 2 weeks:</p>';

  // Category selector pills
  html += '<div style="margin-bottom:20px;"><div style="font-weight:600;margin-bottom:10px;color:var(--dk);">Category</div>';
  html += '<div class="pills" data-q="gs-category">';
  categories.forEach(cat => {
    const active = selectedCat === cat.key ? ' on' : '';
    html += `<div class="pill${active}" onclick="pickCategory('${cat.key}',this)">${cat.label}</div>`;
  });
  html += '</div></div>';

  // Hustle selector pills
  html += '<div style="margin-bottom:20px;"><div style="font-weight:600;margin-bottom:10px;color:var(--dk);">Hustle</div>';
  html += '<div class="pills" data-q="gs-hustle">';
  const hustlesInCat = getHustlesByCategory(selectedCat);
  hustlesInCat.forEach(h => {
    const active = selectedHustle === h.name ? ' on' : '';
    html += `<div class="pill${active}" onclick="pickHustle('${h.name}',this)">${h.name}</div>`;
  });
  html += '</div></div>';

  html += '<div id="guide-content" style="background: #f9f9f9; padding: 20px; border-radius: 6px; margin-top: 20px;"></div>';

  container.innerHTML = html;

  setTimeout(() => {
    updateGuide();
  }, 100);

  // Add navigation buttons
  const navHtml = '<div class="bg"><button class="btn bs pos-left" onclick="go(\'earnings\')">Back</button><button class="btn br pos-center" onclick="startOver()">Reset</button></div>';
  container.insertAdjacentHTML('beforeend', navHtml);
}

function pickCategory(catKey, el) {
  document.querySelectorAll('[data-q="gs-category"] .pill').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  S.selectedCategory = catKey;
  saveState();

  // Update hustle pills
  const hustles = getHustlesByCategory(catKey);
  const selector = document.querySelector('[data-q="gs-hustle"]');
  if (selector) {
    let html = '';
    hustles.forEach(h => {
      html += `<div class="pill" onclick="pickHustle('${h.name}',this)">${h.name}</div>`;
    });
    selector.innerHTML = html;
    S.selectedHustle = hustles[0]?.name;
    saveState();
    updateGuide();
  }
}

function pickHustle(hustleName, el) {
  document.querySelectorAll('[data-q="gs-hustle"] .pill').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  S.selectedHustle = hustleName;
  saveState();
  updateGuide();
}

function updateGuide() {
  const hustleName = S.selectedHustle;
  if (!hustleName) return;

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
    ],
    'Blogging': [
      {title: 'Choose Your Topic', description: 'Pick a niche you\'re passionate about with decent search volume.'},
      {title: 'Set Up a Blog', description: 'Use WordPress, Medium, or Substack depending on your goals.'},
      {title: 'Write Consistently', description: 'Publish 2-3 high-quality posts per week to build authority.'},
      {title: 'Optimize for SEO', description: 'Learn SEO basics to rank your posts on Google.'},
      {title: 'Monetize (6+ months in)', description: 'Add ads, affiliate links, or sell products once you have traffic.'}
    ],
    'Dropshipping': [
      {title: 'Find a Niche', description: 'Research trending products using tools like Google Trends, AliExpress, or Oberlo.'},
      {title: 'Set Up Your Store', description: 'Create a Shopify store ($29/month) with product listings.'},
      {title: 'Find Suppliers', description: 'Connect with AliExpress or Printful suppliers for quality products.'},
      {title: 'Launch Your First Ads', description: 'Run $10-20/day Facebook or Google Ads to test your products.'},
      {title: 'Scale What Works', description: 'Double ad spend on winning products once you have positive ROI.'}
    ],
    'YouTube Channel': [
      {title: 'Choose Your Niche', description: 'Pick a topic you can consistently create about (tech, education, entertainment, etc).'},
      {title: 'Get Basic Equipment', description: 'Use your phone camera to start; upgrade to a real camera later ($200-1000).'},
      {title: 'Publish 10 Videos', description: 'Create your first 10 videos focusing on quality, not perfection.'},
      {title: 'Optimize for Discovery', description: 'Learn YouTube SEO (titles, tags, thumbnails) to rank videos.'},
      {title: 'Build Community (6+ months)', description: 'Engage viewers, respond to comments, and collaborate with other creators.'}
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

// Export to window
window.renderHustles = renderHustles;
window.renderEarnings = renderEarnings;
window.renderGetStarted = renderGetStarted;
window.showHustleDetail = showHustleDetail;
window.pickCategory = pickCategory;
window.pickHustle = pickHustle;
window.updateGuide = updateGuide;
window.toggleHustleCategory = toggleHustleCategory;
window.toggleHustleSpecific = toggleHustleSpecific;
window.toggleEarningsCategory = toggleEarningsCategory;
window.toggleEarningsSpecific = toggleEarningsSpecific;
