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
    { id: 'knowledge', label: 'Knowledge' },
    { id: 'pathways', label: 'Pathways' },
    { id: 'synthesis', label: 'Synthesis' },
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
    'selectedPathwayCategories',
    'selectedPathways',
    'selectedDeepDiveHustle',
    'selectedKnowledgeCategories',
    'selectedKnowledgeDomains'
  ],

  // Data sources
  dataSources: {
    'selector-options': 'selector-options.json',
    knowledge: 'knowledge.json',
    pathways: 'pathways.json',
    insights: 'insights.json'
  },

  // Tab renderers
  renderersForTab: {
    'discover': () => {
      console.log('Rendering discover tab');
      if (window.renderDiscoverySelectorOptions) window.renderDiscoverySelectorOptions();
      if (window.renderDiscoveryPills) window.renderDiscoveryPills();
    },
    'knowledge': () => {
      console.log('Rendering knowledge tab');
      if (window.renderKnowledge) window.renderKnowledge();
      else console.warn('renderKnowledge not found');
    },
    'pathways': () => {
      console.log('Rendering pathways tab');
      if (window.renderPathways) window.renderPathways();
      else console.warn('renderPathways not found');
    },
    'synthesis': () => {
      console.log('Rendering synthesis tab');
      if (window.renderSynthesis) window.renderSynthesis();
      else console.warn('renderSynthesis not found');
    },
    'hustles': () => {
      console.log('Rendering hustles tab');
      if (window.renderHustles) window.renderHustles();
      else console.warn('renderHustles not found');
    },
    'earnings': () => {
      console.log('Rendering earnings tab');
      if (window.renderEarnings) window.renderEarnings();
      else console.warn('renderEarnings not found');
    },
    'insights': () => {
      console.log('Rendering insights tab');
      if (window.renderInsights) window.renderInsights();
      else console.warn('renderInsights not found');
    },
    'deepdive': () => {
      console.log('Rendering deepdive tab');
      if (window.renderDeepDive) window.renderDeepDive();
      else console.warn('renderDeepDive not found');
    },
    'resources': () => {
      console.log('Rendering resources tab');
      if (window.renderResources) window.renderResources();
      else console.warn('renderResources not found');
    }
  }
};

window.sideHustlePathfinderConfig = sideHustlePathfinderConfig;
window.PATHFINDER_CONFIG = sideHustlePathfinderConfig;
