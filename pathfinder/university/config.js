// ============================================================================
// UNIVERSITY PATHFINDER CONFIG
// Defines tabs, state fields, data sources, and UI elements
// ============================================================================

const universityPathfinderConfig = {
  id: 'university',
  name: 'University Pathfinder',
  description: 'Find the right university and career path',

  // Tab definitions (order matters for rendering)
  tabs: [
    { id: 'discover', label: 'Discover' },
    { id: 'careers', label: 'Careers' },
    { id: 'countries', label: 'Countries' },
    { id: 'scholarships', label: 'Scholarships' },
    { id: 'universities', label: 'Universities' },
    { id: 'costs', label: 'Costs' },
    { id: 'transition', label: 'Transition' },
    { id: 'insights', label: 'Insights' },
    { id: 'deepDive', label: 'Deep Dive' },
    { id: 'resources', label: 'Resources' }
  ],

  // State fields that are persisted to localStorage
  stateFields: [
    'cats',
    'motivations',
    'subCareers',
    'flex',
    'cost',
    'vision',
    'lang',
    'citizen',
    'debtYrs',
    'languages',
    'postGrad',
    'inStateTuitionPref',
    'stateOfResidency',
    'cc',
    'costCC',
    'expl',
    'uniSelectivity',
    'scholarshipAmount',
    'collegeSavings',
    'partTimeWork',
    'familySupport',
    'loanRate',
    'loanRepaymentYears',
    'inStateToggle',
    'usUniversityType'
  ],

  // Tab renderers - optional, for specific tabs that need rendering
  renderersForTab: {
    'resources': () => { if (window.renderResources) window.renderResources(); }
  },

  // Data sources to load
  dataSources: {
    careers: 'careers.json',
    universities: 'universities.json',
    countries: 'countries.json',
    insights: 'insights.json',
    careerToQsSubject: 'career-to-qs-subject.json',
    selectivityDisplay: 'selectivity-display.json',
    tuitionAverages: 'tuition-averages.json'
  },

  // UI constants for this pathfinder
  constants: {
    headerPhotos: [
      { src: 'https://images.unsplash.com/photo-1441260038675-7329ab4cc264', cap: 'University campus quad' },
      { src: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a', cap: 'Students studying together' },
      { src: 'https://images.unsplash.com/photo-1441260038675-7329ab4cc264', cap: 'Graduation day' },
      { src: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad', cap: 'Historic university architecture' },
      { src: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4', cap: 'European city streets' }
    ],

    playlists: {
      lofi: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/dabootlegboy/sets/study-chill-lofi-hiphop&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false',
      groovy: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/wearestereofox/sets/groovy-beats&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false',
      relax: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/ambientchill-sc/sets/relaxing-ambient-music-2&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false',
      zen: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/binauralbeatsresearch/sets/theta-waves-zen-meditation&color=%23ff5500&auto_play=false&hide_related=false&show_teaser=false&show_artwork=false'
    }
  },

  // Initialization hook - called by framework.js on DOMContentLoaded
  onInit: async function() {
    // Load saved state from localStorage
    if (window.loadState) {
      window.loadState();
    }

    // Load selector options and CAREERS data
    if (window.loadSelectorOptionsData) {
      await window.loadSelectorOptionsData();
    }

    const maxRetries = 100;
    let retries = 0;
    while (!window.CAREERS_LOADED && retries < maxRetries) {
      await new Promise(r => setTimeout(r, 10));
      retries++;
    }

    // Note: renderDiscoveryPills will be called automatically by renderPathfinderTab('discover')
    // when the discover tab is shown, so we don't need to call it here

    // Initialize resources
    if (window.initRes) {
      window.initRes();
    }

    // Initialize header carousel
    if (window.initHdrCarousel) {
      window.initHdrCarousel();
    }

    // Initialize carousels after render
    setTimeout(() => {
      if (window.initCarousel) {
        window.initCarousel('cc-carousel');
        window.initCarousel('cat-carousel');
        window.initCarousel('career-carousel');
        window.initCarousel('scholar-carousel');
      }
    }, 100);
  }
};

// Export for use in index.html
window.universityPathfinderConfig = universityPathfinderConfig;
