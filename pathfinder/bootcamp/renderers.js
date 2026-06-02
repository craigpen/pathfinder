// Bootcamp Pathfinder - Rendering Functions (Stub)
// Minimal renderers to prove pluggable architecture works

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

function renderInsights() {
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
  'insights': renderInsights
};

// Export for compatibility
window.renderFindBootcamp = renderFindBootcamp;
window.renderPrograms = renderPrograms;
window.renderCompare = renderCompare;
window.renderInsights = renderInsights;
