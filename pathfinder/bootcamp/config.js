// Bootcamp Pathfinder Configuration
const bootcampPathfinderConfig = {
  id: 'bootcamp',
  name: 'Bootcamp Pathfinder',
  version: 'v0.2.0',

  // Tab structure - different from university
  tabs: [
    { id: 'find', label: 'Find Bootcamp' },
    { id: 'programs', label: 'Programs' },
    { id: 'compare', label: 'Compare' },
    { id: 'insights', label: 'Insights' }
  ],

  // State fields for this pathfinder
  stateFields: [
    'selectedBootcamps',
    'focusArea',
    'budget',
    'location',
    'playlist'
  ],

  // Renderers - will be populated by renderers.js
  renderersForTab: {
    'find': () => console.log('Rendering Find Bootcamp tab'),
    'programs': () => console.log('Rendering Programs tab'),
    'compare': () => console.log('Rendering Compare tab'),
    'insights': () => console.log('Rendering Insights tab')
  },

  // Data sources (none for now - stub)
  dataSources: {},

  // Initialization hook - called by framework.js
  onInit: async function() {
    // Initialize header carousel
    if (window.initHdrCarousel) {
      window.initHdrCarousel();
    }
  }
};

window.bootcampPathfinderConfig = bootcampPathfinderConfig;
