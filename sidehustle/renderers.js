// ============================================================================
// SIDE HUSTLE PATHFINDER RENDERERS
// Tab-specific rendering functions for hustles, earnings, and getting started
// ============================================================================

function renderHustles() {
  const container = document.getElementById('hustles');
  if (!container) return;

  if (!window.SIDEHUSTLES || !SIDEHUSTLES_LOADED) {
    container.innerHTML = '<div class="pan-content"><p>Loading hustles...</p></div>';
    return;
  }

  const matches = matchHustles(S);

  let html = '<div class="pan-content"><div class="sec-title">Your Matches</div>';
  html += '<p class="sec-desc">Based on your time, budget, and income goals, here are the best side hustles for you:</p>';

  const carouselId = 'hustles-carousel';
  const rows = matches.slice(0, 15).map(m => m.hustle);
  const cols = ['name', 'financial.timeToFirstIncome', 'effort.hoursPerWeekRequired_min', 'financial.monthlyEarning_max', 'character.competitionLevel'];
  const colLabel = 'Side Hustles';

  html += buildCarouselHTML(rows, cols, colLabel, carouselId);
  html += '</div>';

  container.innerHTML = html;
  initCarousel(carouselId);

  setTimeout(() => {
    syncHustleCarouselFormatting();
  }, 100);
}

function syncHustleCarouselFormatting() {
  const carousel = document.getElementById('hustles-carousel');
  if (!carousel) return;

  const rows = carousel.querySelectorAll('tbody tr');
  rows.forEach((row, idx) => {
    const match = matchHustles(S)[idx];
    if (!match) return;

    const h = match.hustle;
    const cells = row.querySelectorAll('td');

    if (cells[0]) cells[0].textContent = h.name;
    if (cells[1]) cells[1].textContent = formatTimeToIncome(h.financial.timeToFirstIncome);
    if (cells[2]) cells[2].textContent = `${h.effort.hoursPerWeekRequired_min}-${h.effort.hoursPerWeekRequired_max}`;
    if (cells[3]) cells[3].textContent = formatMoney(h.financial.monthlyEarning_min, h.financial.monthlyEarning_max);
    if (cells[4]) cells[4].textContent = formatCompetition(h.character.competitionLevel);

    row.onclick = () => {
      S.selectedHustle = h.name;
      saveState();
      showHustleDetail(h);
    };
    row.style.cursor = 'pointer';
  });
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

function renderEarnings() {
  const container = document.getElementById('earnings');
  if (!container) return;

  if (!window.SIDEHUSTLES || !SIDEHUSTLES_LOADED) {
    container.innerHTML = '<div class="pan-content"><p>Loading earnings data...</p></div>';
    return;
  }

  let html = '<div class="pan-content"><div class="sec-title">Earnings & ROI Comparison</div>';
  html += '<p class="sec-desc">All side hustles ranked by monthly earning potential and time to profitability:</p>';

  const sorted = window.SIDEHUSTLES.sidehustles.sort((a, b) => {
    return (b.financial.monthlyEarning_max - a.financial.monthlyEarning_max) ||
           (a.financial.startupCost_max - b.financial.startupCost_max);
  });

  const carouselId = 'earnings-carousel';
  const rows = sorted;
  const cols = ['name', 'financial.startupCost_min', 'financial.timeToFirstIncome', 'financial.monthlyEarning_max', 'character.competitionLevel'];
  const colLabel = 'Earnings Analysis';

  html += buildCarouselHTML(rows, cols, colLabel, carouselId);
  html += '</div>';

  container.innerHTML = html;
  initCarousel(carouselId);

  setTimeout(() => {
    syncEarningsCarouselFormatting();
  }, 100);
}

function syncEarningsCarouselFormatting() {
  const carousel = document.getElementById('earnings-carousel');
  if (!carousel) return;

  const sorted = window.SIDEHUSTLES.sidehustles.sort((a, b) => {
    return (b.financial.monthlyEarning_max - a.financial.monthlyEarning_max) ||
           (a.financial.startupCost_max - b.financial.startupCost_max);
  });

  const rows = carousel.querySelectorAll('tbody tr');
  rows.forEach((row, idx) => {
    if (idx >= sorted.length) return;
    const h = sorted[idx];
    const cells = row.querySelectorAll('td');

    if (cells[0]) cells[0].textContent = h.name;
    if (cells[1]) cells[1].textContent = formatMoney(h.financial.startupCost_min, h.financial.startupCost_max);
    if (cells[2]) cells[2].textContent = h.financial.timeToFirstIncome;
    if (cells[3]) cells[3].textContent = formatMonthlyRange(h.financial.monthlyEarning_min, h.financial.monthlyEarning_max);
    if (cells[4]) cells[4].textContent = formatCompetition(h.character.competitionLevel);
  });
}

function renderGetStarted() {
  const container = document.getElementById('getstarted');
  if (!container) return;

  if (!window.SIDEHUSTLES || !SIDEHUSTLES_LOADED) {
    container.innerHTML = '<div class="pan-content"><p>Loading guides...</p></div>';
    return;
  }

  const categories = getAllCategories();
  const selectedCat = S.selectedCategory || categories[0]?.key;
  const selectedHustle = S.selectedHustle || getHustlesByCategory(selectedCat)?.[0]?.name;

  let html = '<div class="pan-content"><div class="sec-title">Getting Started</div>';
  html += '<p class="sec-desc">Choose a side hustle and get a step-by-step guide to launch it in 2 weeks:</p>';

  html += '<div style="margin-bottom: 20px;">';
  html += '<label style="display: block; font-weight: bold; margin-bottom: 8px;">Category:</label>';
  html += '<select id="category-select" onchange="updateHustleSelector()" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">';
  categories.forEach(cat => {
    html += `<option value="${cat.key}" ${selectedCat === cat.key ? 'selected' : ''}>${cat.label}</option>`;
  });
  html += '</select>';
  html += '</div>';

  html += '<div style="margin-bottom: 20px;">';
  html += '<label style="display: block; font-weight: bold; margin-bottom: 8px;">Hustle:</label>';
  html += '<select id="hustle-select" onchange="updateGuide()" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">';
  const hustlesInCat = getHustlesByCategory(selectedCat);
  hustlesInCat.forEach(h => {
    html += `<option value="${h.name}" ${selectedHustle === h.name ? 'selected' : ''}>${h.name}</option>`;
  });
  html += '</select>';
  html += '</div>';

  html += '<div id="guide-content" style="background: #f9f9f9; padding: 20px; border-radius: 6px; margin-top: 20px;"></div>';

  container.innerHTML = html;

  setTimeout(() => {
    updateGuide();
  }, 100);
}

function updateHustleSelector() {
  const cat = document.getElementById('category-select')?.value;
  if (!cat) return;

  S.selectedCategory = cat;
  const hustles = getHustlesByCategory(cat);
  const selector = document.getElementById('hustle-select');

  if (selector) {
    selector.innerHTML = hustles.map(h => `<option value="${h.name}">${h.name}</option>`).join('');
    S.selectedHustle = hustles[0]?.name;
    selector.value = S.selectedHustle;
  }

  saveState();
  updateGuide();
}

function updateGuide() {
  const hustleName = document.getElementById('hustle-select')?.value || S.selectedHustle;
  if (!hustleName) return;

  const hustle = getHustle(hustleName);
  if (!hustle) return;

  S.selectedHustle = hustleName;
  saveState();

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

function renderPathfinderTab(id) {
  if (id === 'discover') {
    // Framework handles this automatically
  } else if (id === 'hustles') {
    renderHustles();
  } else if (id === 'earnings') {
    renderEarnings();
  } else if (id === 'getstarted') {
    renderGetStarted();
  }
}
