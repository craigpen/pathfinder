// ============================================================================
// BOOTCAMP PATHFINDER CONFIG
// Minimal test case to verify framework is generic and reusable
// ============================================================================

const bootcampPathfinderConfig = {
  id: 'bootcamp',
  name: 'Bootcamp Pathfinder',
  description: 'Find the right coding bootcamp for you',

  // Generic header component
  header: {
    title: 'Bootcamp Pathfinder',
    subtitle: 'Discover coding bootcamps, compare costs, find your fit.',
    imagesFile: 'header-images.json',
    enableMusic: true
  },

  // Generic discovery selectors
  selectors: [
    { id: 'bootType', label: 'Select One or More', title: 'What type of bootcamp interests you?', description: 'Web development, data science, mobile, or full-stack.' },
    { id: 'pace', label: 'Select one', title: 'How fast can you learn?', description: 'Full-time immersive (12-16 weeks) or part-time (6-12 months).' },
    { id: 'budget', label: 'Select one', title: 'What is your budget?', description: 'Most bootcamps range from $10k–$25k.' }
  ],

  // Tab definitions
  tabs: [
    { id: 'discover', label: 'Discover' },
    { id: 'bootcamps', label: 'Bootcamps' }
  ],

  // State fields to persist
  stateFields: [
    'bootType',
    'pace',
    'budget'
  ],

  // Data sources
  dataSources: {
    bootcamps: 'bootcamps.json'
  },

  // Tab renderers
  renderersForTab: {
    'bootcamps': () => { if (window.renderBootcamps) window.renderBootcamps(); }
  }
};

window.bootcampPathfinderConfig = bootcampPathfinderConfig;
window.PATHFINDER_CONFIG = bootcampPathfinderConfig;
