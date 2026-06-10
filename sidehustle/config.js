// ============================================================================
// SIDE HUSTLE PATHFINDER CONFIG
// Helps users find side hustles that match their constraints
// ============================================================================

const sideHustlePathfinderConfig = {
  id: 'sidehustle',
  name: 'Side Hustle Pathfinder',
  description: 'Find the perfect side hustle that matches your time, budget, and goals.',

  // Generic header component
  header: {
    title: 'Side Hustle Pathfinder',
    subtitle: 'Discover side hustles, explore earning potential, get started today.',
    imagesFile: 'header-images.json',
    enableMusic: true
  },

  // Discovery selectors
  selectors: [
    { id: 'timeCommitment', label: 'Select one', title: 'How much time can you commit?', description: 'Realistically, how many hours per week?' },
    { id: 'startupBudget', label: 'Select one', title: 'What is your startup budget?', description: 'How much can you invest upfront?' },
    { id: 'incomeType', label: 'Select one', title: 'What type of income appeals to you?', description: 'Do you want passive recurring income, or are you OK with active work?' },
    { id: 'incomeGoal', label: 'Select one', title: 'What is your monthly income target?', description: 'How much do you want to earn per month?' },
    { id: 'strengths', label: 'Select One or More', title: 'What are your strengths?', description: 'Pick the skills or interests you already have.' },
    { id: 'scalability', label: 'Select one', title: 'Do you want to scale it?', description: 'Should this stay a side hustle or could it become your main business?' }
  ],

  // Tab definitions
  tabs: [
    { id: 'discover', label: 'Discover' },
    { id: 'hustles', label: 'Side Hustles' },
    { id: 'earnings', label: 'Earnings Breakdown' },
    { id: 'insights', label: 'Insights' },
    { id: 'deepdive', label: 'Deep Dive' },
    { id: 'resources', label: 'Resources' }
  ],

  // State fields to persist
  stateFields: [
    'timeCommitment',
    'startupBudget',
    'incomeType',
    'incomeGoal',
    'strengths',
    'scalability',
    'selectedCategory',
    'selectedHustle',
    'selectedHustleFilterCategories',
    'selectedHustleFilterHustles'
  ],

  // Data sources
  dataSources: {
    sidehustles: 'sidehustles.json',
    insights: 'insights.json'
  },

  // Tab renderers
  renderersForTab: {
    'hustles': () => { if (window.renderHustles) window.renderHustles(); },
    'earnings': () => { if (window.renderEarnings) window.renderEarnings(); },
    'insights': () => { if (window.renderInsights) window.renderInsights(); },
    'deepdive': () => { if (window.renderDeepDive) window.renderDeepDive(); },
    'resources': () => { if (window.renderResources) window.renderResources(); }
  }
};

window.sideHustlePathfinderConfig = sideHustlePathfinderConfig;
window.PATHFINDER_CONFIG = sideHustlePathfinderConfig;
