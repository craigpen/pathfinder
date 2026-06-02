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

## Framework Improvements (Completed in Refactor)

- [x] Extract generic framework.js for multi-pathfinder support
- [x] Create pluggable pathfinder config system
- [x] Reorganize data files by pathfinder
- [x] Generate state/tabs dynamically from config
- [x] Implement generic data loader
