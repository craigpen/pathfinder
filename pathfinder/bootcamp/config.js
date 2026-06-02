// Bootcamp Pathfinder Configuration
const bootcampPathfinderConfig = {
  id: 'bootcamp',
  name: 'Bootcamp Pathfinder',
  version: 'v0.1.0',

  // Tab structure - different from university
  tabs: [
    { id: 'find', label: 'Find Bootcamp', icon: '🔍' },
    { id: 'programs', label: 'Programs', icon: '📚' },
    { id: 'compare', label: 'Compare', icon: '⚖️' },
    { id: 'insights', label: 'Insights', icon: '💡' }
  ],

  // State fields for this pathfinder
  stateFields: [
    'selectedBootcamps',
    'focusArea',
    'budget',
    'location'
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

  // Header configuration
  headerTitle: 'Bootcamp Pathfinder',
  headerSubtitle: 'Find the right coding bootcamp for you',

  // Resources
  playlistUrls: {}
};

window.bootcampPathfinderConfig = bootcampPathfinderConfig;
