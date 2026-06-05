# Claude Code Guidelines for Pathfinder Framework

A universal framework for building interactive education pathfinders. Currently includes University and Bootcamp pathfinders.

## Architecture Overview

```
pathfinder/
├── index.html              Router (redirects to pathfinder subdirectories)
├── framework.js            Shared framework (CSS, loaders, state, UI builders)
├── state-names.json        Shared: US state abbreviations → full names
├── university/             University Pathfinder (full-featured)
│   ├── index.html
│   ├── config.js
│   ├── helpers.js
│   ├── renderers.js
│   └── data/ (careers, countries, universities, insights, etc.)
└── bootcamp/              Bootcamp Pathfinder (minimal test case)
    ├── index.html
    ├── config.js
    ├── helpers.js
    └── data/ (bootcamps, selector options, etc.)
```

**Design Pattern:** Each pathfinder is independent but shares the framework. The root index.html router uses URL hash to navigate between them.

## Git Workflow (Safety First)

### Before Making Changes
- Always run `git status` to confirm working tree state
- Review `git log --oneline -5` to understand recent changes
- If making risky edits, create a feature branch first

### After Completing Work
- Test the code to ensure syntax is valid and nothing is broken (no need to open in browser)
- Increment `const VERSION` in index.html (PATCH for bugs, MINOR for features, MAJOR for redesigns)
- Commit with message that includes: version number and file size
- **Tell the user: the new version number and file size** so they can test locally
- **Update documentation:** After each action, evaluate what was learned and what patterns need documenting:
  - Add/update CLAUDE.md sections if new patterns emerged or existing patterns proved valuable
  - Create/update memory files for feedback, patterns, or project state that will be relevant in future conversations
  - Always commit documentation updates atomically with the work they document
- DO NOT push to GitHub unless user explicitly asks — keep it clean for testing

Never use `--force` or `--no-verify` without explicit user approval

### Protecting Against Data Loss
- Always commit atomically: one logical change per commit
- Keep commits small enough to review and understand
- If uncertain about a file's state, read it first before editing
- When editing files previously modified in this session, check git status first
- Tag important milestones with `git tag` if needed for recovery

### Dangerous Operations (Ask Before Doing)
- Force push (`git push --force`)
- Hard reset (`git reset --hard`)
- Rebase on main
- Amending published commits
- Destructive file operations (`rm -rf`, etc.)

## State Management & Local Storage (Critical for Multi-Tab Apps)

**When adding a new selector, input field, or user choice to any tab, follow these 3 steps or selections won't persist:**

1. **Add to `saveState()` function** — Include new field in the stateToSave object that gets saved to localStorage
   ```javascript
   const stateToSave = {
     cats: S.cats,
     cost: S.cost,
     pgPriority: S.pgPriority,  // ← Add any new selector here
     // ... rest of fields
   };
   localStorage.setItem('univPathfinderState', JSON.stringify(stateToSave));
   ```

2. **Add to `loadState()` function** — Restore from localStorage on page load (add special handling if needed)
   ```javascript
   if(saved) {
     const state = JSON.parse(saved);
     Object.assign(S, state);  // Copies all fields including pgPriority
   }
   ```

3. **Add to `renderDiscoveryPills()` function** — Sync visual state (pill active state, selector value, etc.) with S after load
   ```javascript
   // For selector: restore which option is selected
   document.querySelectorAll('[data-q="pgPriority"] .pill').forEach(p => {
     if(S.pgPriority === p.textContent) p.classList.add('on');
     else p.classList.remove('on');
   });
   ```

**Navigation between tabs:**
- Use `go('tabName')` function to navigate: `go('discover')`, `go('costs')`, `go('postgad')`
- Next/Back buttons should call `go()` with the next tab name
- Tab names in HTML: `<div id="discover">`, `<div id="costs">`, `<div id="postgad">`
- Current active tab is tracked in `currentTab` variable

**Checklist for new selectors/inputs:**
- ✅ Added to S object initialization
- ✅ Added to saveState()
- ✅ Added to loadState() (if special handling needed)
- ✅ Added to renderDiscoveryPills() or equivalent sync function
- ✅ Toggle/click handlers call saveState()
- ✅ Next/Back buttons route to correct tabs via go()

## Documentation as First-Class Work

**Documentation updates are not optional cleanup — they are part of the workflow.** After every significant action or learning, update CLAUDE.md and memory files immediately:

**When to update CLAUDE.md:**
- New patterns discovered that will recur (e.g., data externalization, carousel behavior, character encoding)
- Existing patterns proved valuable and need emphasizing
- Lessons learned from failures or unexpected behavior
- New helper functions or code structures that others need to know about
- File size, architecture, or project state changes worth preserving

**When to create/update memory files:**
- **Feedback:** User corrects or confirms an approach — save what worked and why
- **Patterns:** Reusable solution discovered (e.g., "5-step data externalization process")
- **Project state:** Current known-good version, pending features, architecture milestones
- **Reference:** Where to find information in external systems (Linear, Grafana, docs, etc.)

**How to do it:**
- After completing work, spend 2-3 minutes asking: "Did we learn anything? Do any existing patterns need updating? Is there state future-me should know?"
- If yes, update CLAUDE.md and/or memory files
- Commit documentation changes atomically: `git add CLAUDE.md memory/*.md && git commit -m "..."`
- This takes ~5 minutes per session and saves hours in future conversations

**Why this matters:** Each time you return to the codebase, memory files bootstrap context in seconds instead of re-deriving patterns from scratch. CLAUDE.md accumulates institutional knowledge so the same lessons don't get re-learned.

## Code Changes
- Default to small, focused edits over large refactors
- Prefer editing existing files to creating new ones
- No unnecessary comments—only when the "why" is non-obvious
- Don't add error handling for impossible scenarios

## Testing & Verification
- Verify code syntax is valid (no JSON errors, missing brackets, etc.)
- Test changes to ensure nothing is broken (validate with linters, parsers, etc.)
- Only commit after verification passes
- No need to open in browser unless diagnosing a visual issue

## Project Workflow

**Development Cycle:**
1. Edit pathfinder files (`config.js`, `helpers.js`, `renderers.js`, `data/*.json`, or framework-shared files)
2. Test in browser: navigate to `localhost:8000/university/` or `localhost:8000/bootcamp/`
3. Verify syntax is valid (JSON files parse, no JS errors in console)
4. Commit with semantic version in message (if version is tracked)
5. Push to GitHub when ready to deploy

**Adding a New Pathfinder:**
- Create new directory: `mkdir {name}`
- Copy structure from bootcamp (minimal) or university (full-featured)
- Update root `index.html` router to recognize new pathfinder hash
- Deploy

## Versioning (Semantic)

**Include version number in commit messages using these rules:**
- **PATCH** (v1.5.0 → v1.5.1) — Bug fixes, text updates, UI tweaks, small improvements
- **MINOR** (v1.5.x → v1.6.0) — New features, meaningful functionality additions, new content sections
- **MAJOR** (v1.x.x → v2.0.0) — Complete redesign, major architecture changes

The version badge (bottom right of header) is displayed if `window.VERSION` is set by the pathfinder. GitHub Pages can take 30–60 seconds to update.

## Code Quality Guidelines

### 1. Syntax Correctness (Critical)
- Before committing, verify the code is syntactically valid (no missing braces, quotes, brackets, JSON errors)
- Test thoroughly in browser—don't leave syntax errors for manual fixing
- Validate JSON files before committing: `cat data/*.json | jq . >/dev/null`
- When adding JavaScript, validate object literals and function syntax carefully
- If uncertain, run through a JS linter mentally or test in browser console

### 2. Data Integrity & Bloat Prevention
- Avoid duplicate data structures; check existing data before adding new entries
- When adding countries, regions, or similar lists, scan the file for existing references
- Reuse existing data objects instead of creating parallel structures
- Previous issue: Added countries caused 10x file growth due to unintended duplication

### 3. Content for Students
- Target audience: students with no career, finance, or university experience
- **Avoid jargon**. Explain complex terms simply (e.g., "scholarship = free money" not "grant eligibility matrices")
- **Be encouraging & realistic**. Don't overwhelm with options; guide with clear comparisons
- Every heading, explanation, and tooltip should be understood by someone with zero background knowledge
- Test content clarity: would a first-time reader understand this without Googling?

### 4. Mobile Responsiveness (Non-Negotiable)
- **Desktop/Landscape** (min-aspect-ratio: 1/1.2): Display tables
- **Mobile Portrait** (max-aspect-ratio: 1/1.2): Display carousel cards
- Carousels use **CSS scroll-snap** with **JavaScript enhancement** for drag/touch/momentum behavior
  - CSS: `scroll-snap-type: x mandatory` on container, `scroll-snap-align: start` on cards
  - JS: Handles mouse drag, touch swipe, momentum detection, and snap-to-card (see `initCarousel()`)
  - **Do not remove or disable the JavaScript carousel logic**—it fixes poor native scroll-snap behavior
- Cards must be exactly `100vw - 24px` width (or `100vw - 4px` for narrow cards)
- Test on actual mobile device (portrait & landscape) before committing
- **Never sacrifice mobile experience for desktop convenience**

### 5. Code Reuse & Helper Functions
- `buildCarouselHTML(rows, columnKeys, columnLabel, carouselId)` — Use this to build carousel HTML
- `initCarousel(carouselId)` — Must be called after rendering to enable drag/touch/snap behavior
- Look for existing helpers before creating new table/carousel code
- **Don't repeat code patterns**—factor out into helper functions
- When creating UI for similar data, check what rendering functions already exist
- Minimize file size: every KB counts in the final deliverable

### 6. Insights System (Emoji, Colors, and Tables)

Insights are categorized by type and displayed in standardized tables. Follow this system strictly for all new insights.

**Insight Types & Emoji:**
- `type: 'pro'` — Positive/aligned insight → **✅ (green)** — Use when selection aligns well with goals
- `type: 'neutral'` — Informational/balanced → **ℹ️ (gray)** — Use for general advice, context, or neutral tradeoffs
- `type: 'con'` — Negative/misaligned insight → **⚠️ (orange)** — Use when one selection is problematic
- `type: 'conflict'` — Contradiction between selections → **💥 (red)** — Use when two selections directly contradict each other

**Color Mapping (via CSS variables):**
- Green: `var(--ok)` (#16a34a) for pro/positive insights (✅)
- Orange: `var(--warn)` (#ea580c) for con/warning insights (⚠️) — less severe
- Red: `var(--bad)` (#dc2626) for conflict insights (💥) — most severe
- Gray: `var(--tx2)` (#64748b) for neutral insights (ℹ️)

**Emoji Placement:**
- Emoji **must** be at the start of the insight message (the `msg` field)
- Emoji are automatically formatted with color by `formatInsightItem()` function
- **Do NOT** add emoji to insight titles/labels—only to the message text

**Example Insight Format:**
```javascript
insights.push({
  type: 'pro',
  title: 'EU Citizenship Advantage',  // NO emoji here
  msg: '✅ Tuition-free in Sweden, Germany, Denmark. Work rights across 27 countries.'  // emoji at start
});
```

**Existing Insight Tables (Add all new insights to one of these):**
1. **Career Insights** — Career matches based on motivations, language skills, etc.
   - Use when insight relates to career fields, motivations, or career-specific constraints
   - Function: `careerFits` array → `renderInsightsTable('Career Insights', ...)`
   
2. **Country Insights** — Location/citizenship recommendations
   - Use when insight relates to specific countries, tuition, visa policy, language requirements
   - Function: `countryFits` array + `countryInsightsByCountry` (country-specific nested insights)
   
3. **Cost Insights** — Financial and affordability analysis
   - Use when insight relates to tuition costs, scholarships, debt, financial aid
   - Function: `costAnalysis` array + `costInsightsByCountry` (cost category analysis)
   
4. **Cross-Tab Insights** — Compound insights connecting career + location + cost
   - Use for insights that compare selections across multiple tabs (e.g., "You want EU work + chose low-cost countries")
   - Function: `crossTabInsights` array
   - Most complex insights go here

**Rules for New Insights:**
- ✅ All new insights must be added to one of the four tables above
- ✅ Each insight must have a clear title (no emoji) and message (with emoji at start)
- ✅ Use appropriate type ('pro', 'neutral', 'con', 'conflict') based on alignment
- ✅ Start message text with correct emoji: ✅ for pro, ℹ️ for neutral, ⚠️ for con, 💥 for conflict
- ❌ Do NOT create new insight tables or display insights outside these four tables
- ❌ Do NOT add emoji to titles—only to message text
- ❌ Do NOT mix types inconsistently (e.g., don't use 'pro' for a negative insight)
- ❌ Do NOT confuse 'con' (warning about one selection) with 'conflict' (two selections contradict)

## 7. Data Externalization & Field Naming

**Lessons from COUNTRIES and CAREERS migrations:**

When externalizing data structures into external JSON files (countries.json, careers.json), follow these patterns to prevent data corruption and maintain consistency:

**Field Naming Rules:**
- ✅ Use **full, human-readable field names** in external JSON: `salaryUS`, `portability`, `licensing`, `costUS`, not `sUS`, `port`, `lic`, `cUS`
- ✅ Keep abbreviated names ONLY for nested cost-breakdown objects (e.g., `costBreakdown.tui`, `costBreakdown.room`) where they're documented and stable
- ⚠️ **Rename all field references in code** — don't just update the data file. Search for all abbreviated field names in: rendering functions, insights generation, debug functions, filter/analysis code

**Helper Function Pattern (Required for all external data):**
Each externalized data source needs these function types:
1. **Query helpers** — `getCountryName(code)`, `getSub(careerName)` — safe getters with null checks
2. **Category helpers** — `getCategorySubjects(catKey)`, `getCategoryField(catKey, fieldName)` — for grouped data
3. **Validation helpers** — `validateCountrySchema()`, `validateAllCountries()` — ensure data integrity on load
4. **Debug helpers** — `debugCountry(code)`, `debugCareer(name)` — console output for testing

**Async Loading Safety:**
- Declare `let DATA_LOADED = false` at module scope
- Set to `true` in the async loader after successful fetch and Object.assign()
- Add null-safe fallbacks in all entry functions: `const data = window.CAREERS || {};` (prevents crashes before load completes)
- Never rely on `window.OBJECTNAME` without a fallback — async load may not be complete yet
- **Race condition warning:** Initialization that depends on async data (e.g., `initDiscover()` needs CAREERS) must wait for `_LOADED` flag. Wrap in async function with polling loop: `while (!CAREERS_LOADED) await new Promise(r => setTimeout(r, 10));` before calling dependent code

**Field Name Audit Checklist (Before shipping):**
1. Search code for all abbreviated field names used in your data (e.g., `\.sUS`, `\.port`, `\.lic`)
2. Check **rendering functions** — especially table/carousel builders (they access fields from database)
3. Check **insights generation** — insights may use fields for analysis (e.g., salary-based pros/cons)
4. Check **debug functions** — console output functions might use old field names
5. Check **filter/analysis functions** — any code that evaluates career/country data
6. Verify all field accesses go through **helpers**, not inline data access (except nested cost-breakdown)
7. Test actual UI to ensure no "—" (missing value) placeholders

**Derived/Computed Data (Reference data keyed by primary data):**
When externalizing reference data that's keyed by external data (e.g., DEMAND_MAP keyed by career names):
- ✅ **Merge into the parent structure** if the reference is always accessed through the parent (e.g., DEMAND_MAP → careers.json as `demand` field per career)
- ✅ **Write helper function to derive** if the data is sparse or needs computation (e.g., `getDemandForCat(key)` averages subcareers' demand percentages)
- ✅ **Handle missing data gracefully** — use null checks and fallback display values (e.g., demandCell(d) returns '—' if d is null)
- ❌ Don't create separate JSON files for lookup tables that are always accessed via primary keys — merge them instead

**Common Pitfalls:**
- ❌ Keeping fallback to embedded data (`window.CAREERS || CATS`) — masks incomplete refactoring
- ❌ Mixing abbreviated and full field names in same codebase — causes silent failures
- ❌ Leaving `const CATS = {...}` embedded "just in case" — defeats purpose of externalization
- ❌ Forgetting `Object.assign(COUNTRIES, data)` in async loader — data loads but isn't accessible
- ❌ Creating separate reference JSON files instead of merging into parent structure — bloats file count and complicates async loading

## Building a New Pathfinder From Scratch

**Use this checklist to create a new pathfinder (e.g., bootcamp, internship) with minimal boilerplate:**

### Step 1: Create Directory Structure
```
pathfinder/{name}/
├── index.html          (minimal wrapper, loads framework)
├── config.js           (pathfinder config with header + selectors + tabs)
├── renderers.js        (tab-specific render functions)
├── helpers.js          (data query, formatting, validation functions)
└── data/
    ├── header-images.json
    ├── selector-options.json
    └── {other-data}.json
```

### Step 2: Create config.js
```javascript
const {name}PathfinderConfig = {
  id: '{name}',
  name: '{Display Name}',
  description: '...',

  // Generic header component
  header: {
    title: '{title}',
    subtitle: '{subtitle}',
    imagesFile: 'header-images.json',
    enableMusic: true
  },

  // Generic discovery selectors
  selectors: [
    { id: 'selector1', label: 'Select one', title: '...', description: '...' },
    { id: 'selector2', label: 'Select One or More', title: '...', description: '...' },
    // ...define all discovery questions
  ],

  // Tab definitions
  tabs: [
    { id: 'discover', label: 'Discover' },
    { id: 'results', label: 'Results' },
    // ...define tabs specific to this pathfinder
  ],

  // State fields to persist
  stateFields: [
    'selector1', 'selector2', // discovery selectors
    'tab1Field', 'tab2Field', // other state
    // ...all fields that should persist in localStorage
  ],

  // Data sources (loaded async before rendering)
  dataSources: {
    data1: 'data1.json',
    data2: 'data2.json',
    // ...all JSON files needed by this pathfinder
  },

  // Tab renderers (optional, for tabs that render dynamically)
  renderersForTab: {
    'results': () => { if (window.renderResults) window.renderResults(); }
  }
};

window.{name}PathfinderConfig = {name}PathfinderConfig;
window.PATHFINDER_CONFIG = {name}PathfinderConfig;
```

### Step 3: Create index.html
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{Display Name}</title>
  <script src="../../framework.js"></script>
  <style>
    /* Framework CSS is injected by framework.js */
    /* Add pathfinder-specific styles here */
  </style>
</head>
<body>
  <div class="ctr">
    <!-- Header is built dynamically by buildHeader() -->
    <div id="header-container"></div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tb on" onclick="go('discover')">Discover</button>
      <button class="tb" onclick="go('results')">Results</button>
      <!-- ...one button per tab -->
    </div>

    <!-- Tab panels -->
    <div class="pan on" id="discover">
      <!-- Discovery selectors are built dynamically by buildSelectors() -->
      <div class="bg">
        <button class="btn br pos-center" onclick="startOver()">Reset</button>
        <button class="btn bp pos-right" onclick="go('results')">Next</button>
      </div>
    </div>

    <div class="pan" id="results">
      <!-- Results tab content -->
      <div id="results-content"></div>
      <div class="bg">
        <button class="btn bs pos-left" onclick="go('discover')">Back</button>
        <button class="btn br pos-center" onclick="startOver()">Reset</button>
      </div>
    </div>
  </div>

  <script src="config.js"></script>
  <script src="renderers.js"></script>
  <script src="helpers.js"></script>
  <script>
    // Framework.js handles initialization:
    // 1. Loads all data files (async)
    // 2. Calls buildHeader(config.header)
    // 3. Calls buildSelectors(config.selectors)
    // 4. Calls renderPathfinderTab('discover')
    // 5. Calls loadState()
  </script>
</body>
</html>
```

### Step 4: Create data/header-images.json
```json
{
  "images": [
    "https://images.unsplash.com/...",
    "https://images.unsplash.com/...",
    // ...14 image URLs
  ]
}
```

### Step 5: Create data/selector-options.json
```json
{
  "selector1": ["Option A", "Option B", "Option C"],
  "selector2": ["Choice 1", "Choice 2", "Choice 3"],
  // ...all selectors and their options
}
```

### Step 6: Create renderers.js
```javascript
function renderResults() {
  // Render results based on S (state object)
  // Called when 'results' tab is shown
}

// Add renderPathfinderTab override if tabs differ from default
function renderPathfinderTab(id) {
  if (id === 'discover') {
    // Nothing needed—framework handles it
  } else if (id === 'results') {
    renderResults();
  }
}
```

### Step 7: Create helpers.js
```javascript
// Query helpers
function getDataById(id) {
  // Return data from window.DATA_1, window.DATA_2, etc.
}

// Formatting helpers
function formatData(value) {
  // Convert value to display format
}

// State management (framework provides saveState/loadState)
```

### Checklist Before Launch
- ✅ config.js defines header, selectors, tabs, stateFields, dataSources
- ✅ index.html has `<div id="header-container"></div>` and tab structure
- ✅ data/header-images.json has 14 images
- ✅ data/selector-options.json has options for all selectors
- ✅ renderers.js implements tab-specific rendering
- ✅ helpers.js provides query/format functions
- ✅ All data files are listed in config.dataSources
- ✅ All state fields are listed in config.stateFields
- ✅ Tested in browser: header renders, selectors render, state persists

---

## Key Files & Functions

### Framework Files (Shared)
- `framework.js` — Universal boilerplate: CSS, data loaders, state management, UI builders
  - Contains: header carousel, tab system, pill selectors, table rendering, carousel initialization, async data coordination
  - Each pathfinder loads this once via `<script src="../framework.js"></script>`
  - Provides: `buildHeader()`, `buildSelectors()`, `go()`, `saveState()`, `loadState()`, `initCarousel()`, etc.

- `index.html` (root) — Router that redirects based on URL hash
  - `localhost` → redirects to `/university/` (default)
  - `localhost#bootcamp` → redirects to `/bootcamp/`
  - Simple: just 16 lines of HTML

### Pathfinder Files (Per Pathfinder)
Each pathfinder (university, bootcamp) contains:
- `config.js` — Pathfinder configuration: header settings, selectors, tabs, state fields, data sources
  - Defines: `selectors` array, `tabs` array, `stateFields`, `dataSources` mapping
  - Framework uses this to build the UI dynamically

- `helpers.js` — Domain-specific functions: data queries, formatting, validation
  - Query helpers (e.g., `getSub()`, `getCountryName()`)
  - Formatting helpers (e.g., `formatMoneyRange()`, `formatEducationSummary()`)
  - Validation & debug helpers

- `renderers.js` (optional) — Tab-specific rendering logic
  - Only needed for tabs that require custom rendering (not generated by framework)
  - Provides: `renderResults()`, `renderInsights()`, etc.

- `index.html` — Minimal template that loads framework + config
  - Contains: tab buttons, tab panels (div containers)
  - Framework dynamically builds: header, selectors, content
  - Size: ~40KB (university), ~1.5KB (bootcamp)

- `data/*.json` — Pathfinder-specific data files
  - **University pathfinder:**
    - `careers.json` — Career categories and 66 subcareers with normalized schema
    - `countries.json` — Country data (13 countries)
    - `universities.json` — 587 universities with dual tuition rates (international + EU)
    - `insights.json` — Career/country/cost/language/citizenship insights
    - `career-to-qs-subject.json` — Maps career names to QS rankings subjects
    - `selectivity-display.json` — University selectivity tier display names
    - `tuition-averages.json` — US state tuition averages by institution type
    - `header-images.json` — Image URLs for header carousel
    - `selector-options.json` — Discovery selector pill options
  - **Bootcamp pathfinder:**
    - `bootcamps.json` — Bootcamp data
    - `header-images.json`, `selector-options.json`

### Data Loading & Access Patterns
- **Shared data** (`state-names.json`): Loaded at root level via framework
- **Pathfinder data**: Each pathfinder loads its own data files listed in `config.dataSources`
- **Access pattern**: Always use helper functions, never direct property access
- **Async safety**: Framework ensures data loads before rendering; no race conditions
- Carousel helpers:
  - `buildCarouselHTML()` — Creates carousel container and cards
  - `initCarousel(carouselId)` — Initializes drag/touch/snap behavior for a carousel
  - Never forget to call `initCarousel()` after dynamically rendering carousels
- University helpers:
  - `getUniversity(name)` — Query single university by name
  - `getUniversitiesByCountry(countryCode)` — Filter universities by country code
  - `getUniversitiesByProgram(program)` — Filter universities offering a specific program
  - `getUniversitiesBySelectivity(level)` — Filter by selectivity tier
  - `validateUniversitySchema(uni)` — Validate single university object
  - `validateAllUniversities()` — Validate entire dataset on load
  - `debugUniversity(name)` and `debugAllUniversities()` — Console output for testing
- Insight helpers:
  - `formatInsightItem(text, isProItem)` — Applies emoji and color based on sentiment
  - `renderInsightsTable()` — Renders standardized insight table with carousel
  - Always add insights to existing `careerFits`, `countryFits`, `costAnalysis`, or `crossTabInsights` arrays
- Career demand helpers (merged from DEMAND_MAP):
  - `getDemandForCareer(name)` — Get BLS demand data for a specific career; returns {label, pct, period, src} or null
  - `getDemandForCat(key)` — Derive category-level demand by averaging subcareers' percentages
  - `demandCell(d)` — Format demand data for display; returns "—" if null

## 8. Citizenship-Aware Data: Dual Rates Pattern

**When data varies by user selection, implement dual values in the data schema:**

Example: University tuition varies for EU vs international students.

**Data Schema:**
```json
{
  "name": "Cambridge",
  "tuition": 38000,              // International rate (primary/default)
  "tuition_eu": 24000,           // EU citizen rate
  "tuition_eu_note": "(post-Brexit: same as intl)"  // Transparency note
}
```

**Display Logic:**
```javascript
if(isEU && uni.tuition_eu !== undefined) {
  show tuition_eu + tuition_eu_note
} else {
  show tuition (international default)
}
```

**Key Principles:**
- Primary field (`tuition`) = international/default rate (always populated)
- Secondary field (`tuition_eu`) = EU citizen rate (only if different)
- Always include `*_note` field to explain the rate and its limitations
- If data is incomplete/estimated, document it in the note: "(est. EU rate)", "(income-based)"
- Display note transparently in UI so users know the data quality

**When to use this pattern:**
- Program costs vary by citizenship/residency (tuition, scholarships, work authorization)
- Living costs vary by visa status
- School availability changes by student nationality

**Avoid:**
- Hidden rate calculations based on citizenship (confusing)
- Silently showing different numbers without explaining why
- Hard-coding per-school rates (use data fields instead)

## 9. Career Database Normalized Schema

**All 66 careers use a normalized, queryable schema with discrete fields for salary, cost, education, growth, licensing, and portability.**

### Field Reference

#### Salary Fields (numeric, USD)
```json
{
  "salaryUS_min": 85000,      // minimum US salary, numeric USD
  "salaryUS_max": 140000,     // maximum US salary, numeric USD
  "salaryEU_min": 52000,      // minimum EU salary, numeric USD (not EUR!)
  "salaryEU_max": 85000,      // maximum EU salary, numeric USD
  "salaryNote": null          // optional: "Variable, tied to business success" for non-standard cases
}
```
- All values stored as numeric USD (even EU salaries use USD for consistency)
- Display via `formatMoneyRange(min, max)` → `"$85k–$140k"`
- For missing US data (e.g., European Law), use EU data as fallback

#### Cost Fields (numeric, USD, tuition-only)
```json
{
  "costUS_min": 140000,       // minimum 4-year US cost (tuition), numeric USD
  "costUS_max": 160000,       // maximum 4-year US cost (tuition), numeric USD
  "costEU_min": 8000,         // minimum 4-year EU cost (tuition), numeric USD
  "costEU_max": 8000          // maximum 4-year EU cost (tuition), numeric USD
}
```
- All values represent tuition-only (no living expenses)
- All stored as numeric USD
- Display via `formatMoneyRange(min, max)` → `"$140k–$160k"`
- Use min/max to show range; average for category summaries

#### Education Field (structured, prerequisite-aware)
```json
{
  "education": {
    "degrees": [
      {
        "level": "undergraduate",         // undergraduate | graduate | professional | doctoral | postdegree
        "names": ["Bachelor"],            // array of degree names
        "us_years": 4,                    // duration in US (number or "3-7" for range)
        "eu_years": 3,                    // duration in EU
        "norm": "required",               // required | typical | optional
        "prerequisite": null              // prerequisite degree name, or null for first degree
      },
      {
        "level": "professional",
        "names": ["MD", "DO"],
        "us_years": 4,
        "eu_years": 4,
        "norm": "required",
        "prerequisite": "Bachelor"
      }
    ],
    "requirement_summary": "Bachelor and Professional required"  // for compact display
  }
}
```
- **Always includes Bachelor as the first degree** (foundational requirement)
- Prerequisites form a chain: Bachelor → Professional → Residency
- Display via `formatEducationSummary(eduObj)` → `"Bachelor, MD and Residency required"`
- Use `requirement_summary` for quick category-level display

#### Growth Field (structured, percentage-based)
```json
{
  "growth": {
    "direction": "positive",      // positive | negative | neutral
    "magnitude": "very_high",     // flat | low | moderate | high | very_high
    "pct": 15                     // numeric percentage (BLS/authoritative source)
  }
}
```
- Magnitude derives from pct using standard scale: Flat=0%, Low=1-3%, Moderate=4-7%, High=8-14%, Very high=15%+
- Display via `formatGrowth(growthObj)` → `"Very high (+15%)"`
- No period information stored (e.g., no "2024-2034")

#### Licensing Field (structured, scope-aware)
```json
{
  "licensing": {
    "status": "required",         // required | optional | not_available
    "type": ["PE", "CFA"],        // optional array of license abbreviations
    "scope": "state",             // global | us | state | country_specific | varies
    "qualifier": null             // optional: e.g., "varies by specialty", "for clinical roles"
  }
}
```
- Status must be one of the three standard values
- Type array lists all relevant certifications
- Scope describes geographic applicability
- Display via `formatLicensing(licObj)` → `"Required (PE, state-level)"`

#### Portability Field (structured, global context)
```json
{
  "portability": {
    "level": "HIGH",              // HIGH | MEDIUM | LOW
    "qualifier": null             // optional: e.g., "CFA globally recognized", "US bar only"
  }
}
```
- Level is always uppercase
- Qualifier provides context for international mobility
- Display via `formatPortability(portObj)` → `"High (CFA globally recognized)"`

#### Demand Field (consistent, authoritative)
```json
{
  "demand": {
    "label": "Very high",         // qualitative descriptor
    "pct": 15.8,                  // numeric percentage from BLS or authoritative source
    "src": "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm"  // source URL
  }
}
```
- Label should match growth magnitude terminology for consistency
- Pct is numeric percentage from authoritative source (BLS preferred)
- Src provides traceability and allows users to verify data
- Display via `demandCell(demand)` → `"+15%"`

### Helper Functions

#### Query Helpers (retrieve normalized data)
```javascript
getCareerSalaryUS(name)         // → {min, max} numeric object
getCareerCostUS(name)           // → {min, max} numeric object
getCareerEducation(name)        // → {degrees[], requirement_summary}
getCareerGrowth(name)           // → {direction, magnitude, pct}
getCareerLicensing(name)        // → {status, type, scope, qualifier}
getCareerPortability(name)      // → {level, qualifier}
getDemandForCareer(name)        // → {label, pct, src}
getSub(name)                    // → full career object
getCategorySubjects(catKey)     // → {careerName: careerObj, ...}
```

#### Display Formatters (convert to readable strings)
```javascript
formatMoneyRange(min, max)      // "$85k–$140k" (used for salary and cost)
formatEducationSummary(eduObj)  // "Bachelor, MD and Residency required" (serial comma format)
formatGrowth(growthObj)         // "Very high (+15%)" (magnitude with percentage)
formatPortability(portObj)      // "High" or "High (CFA globally recognized)"
formatLicensing(licObj)         // "Required (PE, state-level)"
```

#### Validation & Debug Helpers
```javascript
validateAllCareers()            // → {total: 66, valid: X, invalid: Y, errors: [...]}
debugCareer(name)               // → console output of all career fields
```

### Category-Level Aggregation

Use `aggregateCategoryData(catKey, fieldName)` to compute category summaries:

```javascript
aggregateCategoryData('tech', 'education')    // → {display: "Bachelor and Professional typical"}
aggregateCategoryData('tech', 'salaryUS_min') // → {display: "$85k Average"}
aggregateCategoryData('tech', 'growth')       // → {display: "Very high (+15%)"}
```

**Logic:**
- **Education:** Analyzes degree patterns across all careers in category, returns intelligent summary ("Bachelor and Professional typical")
- **Salary/Cost:** Averages min/max values, formats as single average figure
- **Growth:** Finds most common magnitude, averages percentages
- **Portability/Licensing:** Finds most common status

### Adding a New Career

**Step 1: Gather Data**
- Salary (US & EU): numeric min/max from BLS or O*NET
- Cost (US & EU): tuition-only 4-year estimates
- Education: degrees with levels, prerequisites, and durations
- Growth: direction, magnitude, percentage from BLS Labor Outlook
- Licensing: status, types, scope, and qualifiers
- Portability: level and context qualifiers
- Demand: label, percentage, and authoritative source

**Step 2: Create Career Object**
```json
{
  "growth": {"direction": "positive", "magnitude": "high", "pct": 11},
  "education": {
    "degrees": [
      {"level": "undergraduate", "names": ["Bachelor"], "us_years": 4, "eu_years": 3, "norm": "required"}
    ],
    "requirement_summary": "Bachelor required"
  },
  "portability": {"level": "HIGH", "qualifier": null},
  "licensing": {"status": "optional", "type": ["CPA"], "scope": "us", "qualifier": null},
  "resources": [{"title": "AICPA", "url": "https://www.aicpa.org/"}],
  "postGraduateFunded": false,
  "typicalPostGraduateYears": 0,
  "demand": {"label": "Moderate", "pct": 6, "src": "https://www.bls.gov/ooh/..."},
  "salaryUS_min": 70000,
  "salaryUS_max": 120000,
  "salaryEU_min": 35000,
  "salaryEU_max": 64000,
  "costUS_min": 180000,
  "costUS_max": 180000,
  "costEU_min": 12000,
  "costEU_max": 12000
}
```

**Step 3: Add to careers.json**
1. Find the appropriate category (or create new one)
2. Add career object to category.subjects with career name as key
3. Validate JSON (no syntax errors)
4. Test in browser to verify display

**Step 4: Update Insights (if needed)**
- Check if career needs custom insights in `renderInsights()` function
- Add any career-specific conditions (motivation matching, country-specific notes, etc.)

---

## 10. Framework Architecture & Reusability

**Completed as of v1.20.0:** Framework consolidation achieved—all pathfinders now use shared framework code.

✅ **Shared Framework (framework.js):**
- CSS (all styling for all pathfinders)
- Data loaders (async coordination, validation)
- State management (localStorage, `saveState()`, `loadState()`)
- UI builders (`buildHeader()`, `buildSelectors()`, etc.)
- Event dispatchers (`go()`, carousel interactions, pill toggles)

✅ **Pathfinder-Specific Code:**
- `config.js` — Pathfinder configuration (no code duplication)
- `helpers.js` — Domain-specific query/format helpers (unique per pathfinder)
- `renderers.js` — Custom rendering logic (optional, only if needed)

**File Structure Benefits:**
- **Bootcamp** (minimal): 1.5KB index + small data files (validates framework is truly generic)
- **University** (full): 40KB index + large data files (complex, real-world example)
- Both reuse 100% of framework code and CSS

**Key Principle:** Never duplicate code. Framework handles all boilerplate; pathfinders only define configuration and domain logic.

## Generic Discovery Selectors Pattern

**Discovery selectors are built dynamically from config.js, not hardcoded HTML.**

**Implementation (framework.js):**
1. `buildSelectors(config, containerId)` — Generates selector HTML from config array
2. `renderDiscoverySelectorOptions(selectors)` — Populates pill options from `SELECTOR_OPTIONS` (loaded from data)
3. `renderDiscoveryPills()` — Applies saved state "on" class to pills
4. State management: Pills call `saveState()` on click; `loadState()` restores them on page load

**Config format (in pathfinder/config.js):**
```javascript
selectors: [
  { id: 'motivations', label: 'Select One or More', title: 'What are your motivations?', description: '...' },
  { id: 'cost', label: 'Select one', title: 'How important is cost?', description: '...' },
  // ... define all discovery questions
]
```

**Data format (in pathfinder/data/selector-options.json):**
```json
{
  "motivations": ["Career growth", "Work-life balance", "Salary"],
  "cost": ["Very important", "Important", "Not important"]
}
```

**To customize selectors:** Edit `config.js` and `data/selector-options.json`. Framework handles rendering and state automatically.

---

## Generic Header Component Pattern

**Header is built dynamically from config + data files, not hardcoded HTML.**

**Implementation (framework.js):**
1. `buildHeader(config)` — Takes config object and:
   - Loads header images from JSON file
   - Builds header HTML with carousel
   - Initializes image rotation (2.2s transitions)
   - Sets up music toggle and playlist selectors

2. `initHeaderCarousel()` — Handles image transitions and carousel behavior

**Config format (in pathfinder/config.js):**
```javascript
header: {
  title: 'University Pathfinder',
  subtitle: 'Explore careers, compare countries...',
  imagesFile: 'header-images.json',
  enableMusic: true
}
```

**Data format (in pathfinder/data/header-images.json):**
```json
{
  "images": [
    "https://images.unsplash.com/...",
    "https://images.unsplash.com/...",
    // ... image URLs
  ]
}
```

**Template (in pathfinder/index.html):**
```html
<div id="header-container"></div>
<!-- Framework injects header HTML here -->
```

**To customize header:** Edit `config.js` header section and `data/header-images.json`. Framework handles carousel, music, and rendering.

---

## Framework Async Coordination Pattern

**When using Promise.all() to coordinate loaders + state restoration:**

1. **Never call saveState() during loader execution** — Loaders run before loadState() completes. Any saveState() call in a loader overwrites localStorage, erasing previously saved user state. Example culprit: validation code that calls saveState() after filtering invalid entries.

2. **Render first, then restore state** — In Promise.all().then() block:
   ```javascript
   Promise.all([...loaders...]).then(() => {
     renderPathfinderTab('discover');  // Creates DOM elements first
     loadState();                       // Then applies saved state to them
   });
   ```
   Pills must exist before loadState() tries to apply "on" class.
   
3. **Catch duplicate loader calls** — When refactoring async loaders into Promise.all(), check for and remove redundant calls elsewhere (e.g., lines that call `loaderFunc()` after already adding it to the promise list). Each loader should execute exactly once.

4. **Console logs confirm execution** — Single console line per loader (e.g., "✓ Loaded countries.json") means once. Duplicate lines mean loaders are running twice.

---

**Last Updated:** 2026-06-05 (v1.20.0 — Framework consolidation complete; architecture refactored from monolithic app to reusable framework + multiple pathfinders)
