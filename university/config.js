// ============================================================================
// UNIVERSITY PATHFINDER CONFIG
// Defines tabs, state fields, data sources, and UI elements
// ============================================================================

const universityPathfinderConfig = {
  id: 'university',
  name: 'University Pathfinder',
  description: 'Find the right university and career path',

  // Header configuration
  header: {
    title: 'University Pathfinder',
    subtitle: 'Explore careers, compare countries, understand costs, find your path.',
    imagesFile: 'header-images.json',
    enableMusic: true
  },

  // Discovery selectors configuration
  selectors: [
    { id: 'motivations', label: 'Select One or More', title: 'What are your motivations?', description: 'Use this thought exercise to help you choose possible careers and surface insights.' },
    { id: 'citizen', label: 'Select One or More', title: 'Which citizenships do you hold?', description: 'Citizenship affects scholarship or grant eligibility, tuition rates, visa sponsorship, healthcare coverage, job market access, among other things.' },
    { id: 'vision', label: 'Select one', title: 'In 5 years, where do you see yourself?', description: 'This helps identify countries where you might want to live and work after graduation, and surfaces insights.' },
    { id: 'stateOfResidency', label: 'Select one', title: 'What state do you live in?', description: 'This helps identify universities in your state, and in-state tuition rates.' },
    { id: 'languages', label: 'Select One or More', title: 'What languages are you fluent or conversational in?', description: 'This helps identify countries where you can thrive academically and socially, and surfaces insights.' },
    { id: 'lang', label: 'Select one', title: 'What is your language learning aptitude?', description: 'Your language aptitude will help guide you on planning for language learning before studying in another country. Native language skills are more important in some countries than others. Some careers will benefit from language skills.' },
    { id: 'flex', label: 'Select One or More', title: 'Are you open to different university locations?', description: 'This should help inform your choices on the following pages, and surface insights.' },
    { id: 'postGrad', label: 'Select one', title: 'Are you willing to pursue a Masters or PhD where typical for your chosen careers?', description: 'PhD programs are often funded via assistantships, but this will vary by your chosen field and school.' },
    { id: 'cost', label: 'Select one', title: 'How important is total education cost?', description: 'Borrowing money will feel easy, but it will reduce your take-home pay for years after graduation. Keep this in mind on the following pages.' },
    { id: 'debtYrs', label: 'Select one', title: 'How long are you willing to make student loan payments?', description: 'Shorter terms mean higher monthly payments but you\'re debt-free sooner. Longer terms mean lower monthly payments but you\'ll be paying for longer, which could affect your ability to travel, move, buy a home, or save for other goals.' }
  ],

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
    'discover': () => { if (window.renderPathfinderTab) window.renderPathfinderTab('discover'); },
    'careers': () => { if (window.renderPathfinderTab) window.renderPathfinderTab('careers'); },
    'countries': () => { if (window.renderPathfinderTab) window.renderPathfinderTab('countries'); },
    'scholarships': () => { if (window.renderPathfinderTab) window.renderPathfinderTab('scholarships'); },
    'universities': () => { if (window.renderPathfinderTab) window.renderPathfinderTab('universities'); },
    'costs': () => { if (window.renderPathfinderTab) window.renderPathfinderTab('costs'); },
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
    // Build header from config
    if (window.buildHeader) {
      await window.buildHeader(universityPathfinderConfig.header);
    }

    // Load saved state from localStorage
    if (window.loadState) {
      window.loadState();
    }

    // Wait for selector options and careers data to load
    const maxRetries = 100;
    let retries = 0;
    while ((!window.SELECTOR_OPTIONS_LOADED || !window.CAREERS_LOADED) && retries < maxRetries) {
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
window.PATHFINDER_CONFIG = universityPathfinderConfig;  // framework.js looks for this
