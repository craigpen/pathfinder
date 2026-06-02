# Technical Debt

## Known Issues

### 1. Universities Database — Incomplete Program Coverage
**Severity:** Medium  
**Description:** The `universities.json` database is missing program offerings for certain disciplines:
- Pharmacy programs absent for major universities (e.g., UNC Chapel Hill, NC State)
- Environmental Sciences programs missing for NC and other states
- Likely affects other program types and regions as well

**Impact:** Users selecting Environmental Sciences or Pharmacy careers see no university recommendations for states that actually have these programs.

**Effort to Fix:** Medium
- Requires audit of which programs are missing by state/university
- Would need to backfill `universities.json` with missing programs
- Should validate against real university catalogs (QS World University Rankings database)

**Next Steps:** Consider a data audit and enrichment phase to improve coverage across all program types and regions.

---

### 2. Codebase Minification — Readability & Maintainability
**Severity:** High  
**Description:** Core files are heavily minified (single-line functions):
- `renderers.js` — functions like `renderDiscoveryPills()` are 1000+ characters on single lines
- `helpers.js` — `loadState()` is 2000+ characters minified
- `index.html` — all discovery pill HTML is inline, unreadable
- `config.js`, `framework.js` — partially minified

**Impact:** 
- Very difficult to debug and maintain
- High risk of introducing bugs during edits
- Makes code reviews nearly impossible
- Prevents use of prettified code going forward

**Effort to Fix:** Medium-High
- ~4-6 hours to unminify all JavaScript and HTML
- Requires careful parsing to restore readability without changing functionality
- Should use a tool (e.g., prettier, js-beautify) plus manual cleanup
- Need to verify functionality after unminification

**Next Steps:** Schedule unminification as a dedicated refactoring task before major feature work. Will significantly improve code quality and developer experience.

---

## Framework Improvements (Completed in Refactor)

- [x] Extract generic framework.js for multi-pathfinder support
- [x] Create pluggable pathfinder config system
- [x] Reorganize data files by pathfinder
- [x] Generate state/tabs dynamically from config
- [x] Implement generic data loader
