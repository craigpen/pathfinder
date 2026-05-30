# Claude Code Guidelines for University Pathfinder

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
- **Development**: Edit `index.html`, test locally in browser
- **Commit**: After testing passes, create a commit with a clear message
- **Deploy**: Push to GitHub (syncs to your github.io page)
- **Sharing**: Test on mobile device via github.io before finalizing

## Versioning (Semantic)

**Increment the version in `const VERSION='...'` with every commit using these rules:**
- **PATCH** (v1.5.0 → v1.5.99) — Bug fixes, text updates, UI tweaks, small improvements, insight refinements
- **MINOR** (v1.5.99 → v1.6.0) — New features, meaningful functionality additions, significant structural changes, new content sections
- **MAJOR** (v2.0.0) — Complete redesign, major architecture changes, significant user flow changes

Patch version can increment up to 99 before moving to the next minor version. This keeps version history granular without jumping too quickly.

Check the version badge (bottom right of header) after refresh to confirm the latest version is loaded. GitHub Pages can take 30–60 seconds to update.

## index.html Specific Guidelines

### 1. Syntax Correctness (Critical)
- Before committing, verify the code is syntactically valid (no missing braces, quotes, brackets)
- Test thoroughly in browser—don't leave syntax errors for manual fixing
- When adding JavaScript, validate object literals and function syntax carefully
- If uncertain, run through a JS linter mentally or test in browser console

### 2. Data Integrity & Bloat Prevention
- Avoid duplicate data structures; check existing data before adding new entries
- When adding countries, regions, or similar lists, scan the file for existing references
- Reuse existing data objects instead of creating parallel structures
- Previous issue: Added countries caused 10x file growth due to unintended duplication

### 3. Content for 17-Year-Olds
- Target audience: high school students with no career, finance, or university experience
- **Avoid jargon**. Explain complex terms simply (e.g., "scholarship = free money" not "grant eligibility matrices")
- **Be encouraging & realistic**. Don't overwhelm with options; guide with clear comparisons
- Every heading, explanation, and tooltip should be understood by someone with zero background knowledge
- Test content clarity: would a 17-year-old understand this without Googling?

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
- Minimize file size: single-page app means every KB counts

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

## Key Files & Functions
- `index.html` — Single-page app with embedded CSS/JS (originally 776KB, now **269KB** with all data externalized)
  - This is your main deliverable; treat edits carefully
  - Always test in browser before committing
  - **Note:** index2.html is the working file; copy over index.html when deploying
- External data files (loaded asynchronously at startup):
  - `countries.json` (66KB) — Consolidated country data (13 countries with CD/FUNDING merged); loaded by `loadCountriesData()`. Access via helpers: `getCountryName()`, `getCountryTuition()`, etc.
  - `careers.json` (24KB) — Career categories and subcareers (33 total) with merged DEMAND_MAP data; loaded by `loadCareersData()`. Access via helpers: `getSub()`, `getCategorySubjects()`, etc. Each subcareer has `demand` field with {label, pct, period, src}
  - `universities.json` (587 universities) — External university database; loaded by `loadUniversitiesData()`. Access via helpers: `getUniversity()`, `getUniversitiesByCountry()`, `getUniversitiesByProgram()`, etc.
  - `insights.json` (5 categories) — Career/country/cost/language/citizenship alignment data; loaded by `loadInsightsData()`. Access only via insight functions `getCareerInsight()`, `getCountryInsight()`, `getCostInsight()`, `getLanguageInsight()`, `getCitizenshipInsight()`.
  - **Always access via helpers**, never direct property access
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

## 8. Code Cleanup & Deduplication

**Completed as of v1.8.15:** All four major data structures have been successfully externalized and cleaned of duplicate functions:

✅ **Externalized Data:**
- COUNTRIES → countries.json (13 countries, 66KB)
- CAREERS → careers.json (33 subcareers, 24KB)
- UNIVERSITIES → universities.json (587 universities)
- INSIGHTS → insights.json (5 categories: careers, countries, cost, language, citizenship)

✅ **Removed Duplicate Functions:**
- Duplicate render functions (renderCCChips, renderFilterSubPills, renderPracPills, renderFilterAnalysis)
- Old hardcoded insight functions with different signatures (getCareerInsight, getCountryInsight, getCostInsight, getLanguageInsight, getCitizenshipInsight)
- All remaining insight functions now exclusively use externalized INSIGHTS JSON data

**File Size Reduction: 776KB → 269KB** (65% reduction achieved through data externalization)

**Key Principle:** Never embed multiple versions of the same function or data. Always delete the old version after refactoring to prevent confusion and silent bugs where old code is accidentally used.

---

**Last Updated:** 2026-05-30
