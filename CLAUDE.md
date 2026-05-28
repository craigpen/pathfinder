# Claude Code Guidelines for University Pathfinder

## Git Workflow (Safety First)

### Before Making Changes
- Always run `git status` to confirm working tree state
- Review `git log --oneline -5` to understand recent changes
- If making risky edits, create a feature branch first

### After Completing Work
- Show the diff before committing: `git diff [files]`
- Report file size in the commit message: include `index.html` size so you can quickly spot bloat
- Create a commit with a clear, descriptive message
- Never use `--force` or `--no-verify` without explicit user approval
- Confirm branch before pushing (never push to main without asking)

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
- Open `index.html` directly in a browser to test changes
- Only commit after verifying changes work locally
- Use git diff to visually confirm changes match intent

## Project Workflow
- **Development**: Edit `index.html`, test locally in browser
- **Commit**: After testing passes, create a commit with a clear message
- **Deploy**: Push to GitHub (syncs to your github.io page)
- **Sharing**: Test on mobile device via github.io before finalizing

## Versioning (Semantic)

I'll automatically determine and increment the version based on your request:
- **PATCH** (v1.0.1, v1.0.2, etc.) — Bug fixes, styling tweaks, mobile responsiveness fixes, carousel adjustments, copy corrections
- **MINOR** (v1.1.0, v1.2.0, etc.) — New features or content sections (new career, country, tab, slider), structural changes, UI enhancements
- **MAJOR** (v2.0.0, etc.) — Complete redesign, major architecture changes, significant user flow changes

**After each commit**, I will tell you what version to expect to see. Check the version badge (bottom right of header) when you refresh your github.io page to confirm you're seeing the latest version. GitHub Pages can take 30–60 seconds to update, so if you see the old version, wait and refresh again.

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

## Key Files & Functions
- `index.html` — Single-page app with embedded CSS/JS (1.3MB)
  - This is your main deliverable; treat edits carefully
  - Always test in browser before committing
  - Data: `UNIVERSITIES_BY_SUBJECT`, `CATS`, `COUNTRIES`, etc. defined in `<script>`
- Carousel helpers:
  - `buildCarouselHTML()` — Creates carousel container and cards
  - `initCarousel(carouselId)` — Initializes drag/touch/snap behavior for a carousel
  - Never forget to call `initCarousel()` after dynamically rendering carousels
- Insight helpers:
  - `formatInsightItem(text, isProItem)` — Applies emoji and color based on sentiment
  - `renderInsightsTable()` — Renders standardized insight table with carousel
  - Always add insights to existing `careerFits`, `countryFits`, `costAnalysis`, or `crossTabInsights` arrays

---

**Last Updated:** 2026-05-28
