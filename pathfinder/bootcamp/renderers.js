// Bootcamp Pathfinder - Rendering Functions
// Tab-specific renderers (shared header functions are in framework.js)

// Define header images for bootcamp (used by framework.js carousel)
window.HEADER_PHOTOS = [
  { src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97', cap: 'Bootcamp coding session' },
  { src: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db', cap: 'Students collaborating' }
];

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
