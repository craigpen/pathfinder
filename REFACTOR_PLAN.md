# Data Refactoring Plan: index.html → index2.html

## Goal
Consolidate COUNTRIES, CD, and FUNDING into a single unified Country object loaded from countries.json, with comprehensive validation and helper functions to prevent data corruption and make future country additions safe.

## Data Flow
```
countries.json (13 countries, consolidated)
    ↓ (fetch at startup)
Unified COUNTRIES object (validated on load)
    ↓ (all access through helpers)
Query/Update/Validation Helpers
    ↓
App code (Universities, Deep Dive, Scholarships, Costs, Insights tabs)
```

## Overall Approach
Five phases, each with validation checkpoints:

1. **Phase 1: Build Helper Infrastructure** (Low risk — code only)
2. **Phase 2: Load countries.json at Startup** (Low risk — new fetch logic)
3. **Phase 3: Wire Query/Update Helpers Throughout Code** (Medium risk — code refactoring)
4. **Phase 4: Remove Old Data** (Low risk — cleanup)
5. **Phase 5: Test & Commit** (Final validation)

---

## Phase 1: Build Helper Infrastructure

### What to build:

1. **Validation Schema**
   - Define required fields, data types, structure for each country
   - Example: `name` (string), `flag` (data URI string), `tuition` (string), `duration` (number), etc.

2. **Query Helpers** (safe getters with validation on read)
   - `getCountryName(code)` — returns name
   - `getCountryTuition(code)` — returns tuition string
   - `getCountryDuration(code)` — returns duration
   - `getCountryLanguage(code)` — returns language
   - `getCountryDetails(code)` — returns all Deep Dive fields (tuition, duration, language, etc.)
   - `getCountryFunding(code)` — returns Scholarships fields (need, merit, external, free, timeline, links)
   - `getCountryAllData(code)` — returns complete country object
   - All should validate data before returning

3. **Update Helpers** (safe setters with validation on write)
   - `addCountry(code, data)` — validates complete schema, rejects incomplete data
   - `updateCountry(code, data)` — validates partial updates

4. **Validation Helpers**
   - `validateCountrySchema(code, data)` — check structure and required fields
   - `validateCountryDataTypes(code, data)` — check types are correct
   - `validateAllCountries()` — validates entire COUNTRIES object
   - Error messages should be clear and specific

5. **Debug Helpers** (for console testing)
   - `debugCountry(code)` — dump all data for a country
   - `debugAllCountries()` — dump all data, show validation results

### Location: 
Add to `<script>` section in index2.html (before countries.json is loaded)

### Validation Checklist (Phase 1):
- [ ] Validation schema defined and documented
- [ ] Query helpers retrieve correct values for all fields
- [ ] Query helpers validate on retrieval
- [ ] Update helper rejects incomplete data
- [ ] Update helper accepts valid complete data
- [ ] validateCountrySchema() passes for sample country data
- [ ] validateAllCountries() ready to test on load
- [ ] debugCountry() and debugAllCountries() work in console
- [ ] Error messages are clear and actionable

---

## Phase 2: Load countries.json at Startup

### What to do:
1. Create async startup function that:
   - Fetches countries.json
   - Parses JSON
   - Validates with validateAllCountries()
   - Populates unified COUNTRIES object
   - Reports errors with clear messages
2. Ensure COUNTRIES is ready before any code accesses it
3. Keep minified COUNTRIES, CD, FUNDING for now (will remove in Phase 4)

### Success criteria:
- [ ] countries.json fetches successfully
- [ ] JSON parses without errors
- [ ] validateAllCountries() passes on load
- [ ] COUNTRIES object has all 13 countries
- [ ] All countries have required fields
- [ ] Error handling shows clear messages if load fails
- [ ] index2.html still loads and displays correctly

---

## Phase 3: Wire Query/Update Helpers Throughout Code

### What to do:
1. Replace all `CD[k]` and `FUNDING[k]` direct access with helper calls
2. Replace all minified field access (`.tui`, `.cy`, `.dec`, etc.) with helpers
3. Update systematically by function (priority: largest first)
4. Verify each change preserves existing behavior

### Functions to update (14 total, by priority):

#### High Priority (largest refactors)
- [ ] **renderCCTable()** — 8x CD access — Universities tab country table
- [ ] **renderInsights()** — 5x CD access — Insights tab generation
- [ ] **calculateCostData()** — 4x CD access — Cost breakdown calculations

#### Medium Priority
- [ ] **scholarSummaryShort()** — 3x CD access — Scholarships summary display
- [ ] **headerImagePool()** — 3x CD access — Header carousel image loading
- [ ] **computeCountryCostResults()** — 1x CD — Cost comparison results
- [ ] **renderScholar()** — 1x CD, 1x FUNDING — Scholarships tab display
- [ ] **renderPath()** — 1x CD — Deep Dive tab
- [ ] **getCostInsight()** — 1x CD — Cost insights
- [ ] **getLanguageInsight()** — 1x CD — Language insights

#### Low Priority (utilities & exports)
- [ ] **keyLinks()** — 1x CD — Resource links accessor
- [ ] **info()** — 1x FUNDING — Funding info accessor
- [ ] **generateConflictInsights()** — 1x CD — Conflict insight generation
- [ ] **exportNewCountriesSchemaAsCode()** — 1x CD, 1x FUNDING — Export utility (low priority, used for data export only)

### Refactoring Pattern:

For each function, replace patterns like:
```javascript
// BEFORE
const tuition = CD[k].tui;
const costBreakdown = CD[k].cy;
const faqs = CD[k].dec;
const need = FUNDING[k]?.need;

// AFTER
const tuition = getCountryTuition(k);
const costBreakdown = getCountryCostBreakdown(k);
const faqs = getCountryFaqs(k);
const need = getCountryNeed(k);
```

### Success criteria:
- [ ] All 14 functions updated with helper calls
- [ ] No direct `CD[k]` or `FUNDING[k]` access remaining
- [ ] No minified field access (`.tui`, `.cy`, `.dec`, etc.) remaining
- [ ] Universities tab displays all countries correctly
- [ ] Deep Dive tab shows all data correctly
- [ ] Scholarships tab shows funding data correctly
- [ ] Costs tab calculates correctly
- [ ] Insights tab generates insights correctly
- [ ] No console errors
- [ ] All validations pass

---

## Phase 4: Remove Old Data

### What to do:
1. Delete minified COUNTRIES, CD, FUNDING objects from index2.html
2. Delete old Proxy field-mapping code (if any)
3. Keep countries.json as single source of truth
4. Verify unified COUNTRIES loads from countries.json only

### Success criteria:
- [ ] Minified data objects removed
- [ ] Old code removed
- [ ] index2.html still loads without errors
- [ ] COUNTRIES populated only from countries.json
- [ ] File size reduced significantly
- [ ] No references to old CD, FUNDING objects remain

---

## Phase 5: Test & Commit

### What to do:
1. Open index2.html in browser (with Live Server)
2. Test all tabs thoroughly:
   - **Universities**: country table displays all 13 countries
   - **Deep Dive**: select countries, verify all fields (tuition, duration, language, etc.)
   - **Scholarships**: verify need/merit/external/free data loads
   - **Costs**: verify cost breakdown displays correctly
   - **Insights**: verify insights fire correctly
3. Run validation in console: `debugAllCountries()`
4. Check browser console for any errors
5. Version bump (MINOR — significant refactor)
6. Commit with message

### Success criteria:
- [ ] All tabs load without errors
- [ ] All countries display correctly
- [ ] All data fields accessible and validated
- [ ] console.log(debugAllCountries()) shows all countries valid
- [ ] No console errors
- [ ] Ready to merge back to index.html

---

## Testing at Each Phase

### Phase 1 Testing (Helper Infrastructure):
```javascript
// In browser console, verify helpers work:
debugCountry('us')  // Dump US data, should show validation status
debugAllCountries()  // Dump all countries, validation summary

validateCountrySchema('us', COUNTRIES.us)  // Should return true or clear error
getCountryName('us')  // 'United States'
getCountryTuition('us')  // '$15k–$85k/yr'
getCountryFunding('us')  // {need: {...}, merit: {...}, ...}
```

### Phase 2 Testing (Load countries.json):
- Open index2.html with Live Server
- Check browser console for load success message
- Verify `debugAllCountries()` shows all 13 countries
- Verify `validateAllCountries()` passes
- Check no fetch/parse errors

### Phase 3 Testing (Wire Helpers Throughout Code):
- After each function updated, test that feature
- Verify data displays correctly
- No change in user-facing behavior
- Run `debugAllCountries()` to ensure validation still passes
- Check for console errors

### Phase 4 Testing (Remove Old Data):
- Load index2.html
- Verify file size reduced
- Run `debugAllCountries()` again
- Ensure COUNTRIES populated only from countries.json

### Phase 5 Testing (Final):
- Test all tabs thoroughly (see Phase 5 section)
- Browser console clean
- All validations pass

---

## Rollback Plan

If anything breaks at any phase:
1. Delete index2.html
2. Start fresh copy from index.html
3. Add helpers code again
4. Restart from the failing phase with adjusted approach
5. Keep countries.json and export.txt as backups

---

## Expected Outcomes

### After Phase 1:
- All helpers defined, documented, and tested
- Validation schema in place
- Can validate sample country data
- Safe infrastructure ready

### After Phase 2:
- countries.json loads successfully
- Unified COUNTRIES object created
- All validation passes on load
- No functional changes to app yet

### After Phase 3:
- All code uses helpers for data access
- No direct CD/FUNDING access remaining
- All tabs display data correctly
- Validation runs on every access
- Single point of change for data access

### After Phase 4:
- Minified data objects removed
- countries.json is single source of truth
- Clean, maintainable codebase
- Significantly smaller file size

### After Phase 5:
- All tabs fully tested and working
- All validations passing
- Ready to merge back to index.html
- Future country additions safe and validated

---

## Notes

- Keep validation **strict** — errors are better than silent failures
- All validators should have **clear, actionable error messages**
- Query helpers should validate on **every read** to catch corruption
- Update helpers should validate **everything before insertion**
- Aim for 100% of data access going through helpers (no exceptions)

---

## Current Status

- [x] countries.json created and validated (13 countries)
- [x] export.txt created (backup of consolidated data)
- [x] Refactor plan updated for new workflow
- [ ] Phase 1: Build helper infrastructure (NEXT)
- [ ] Phase 2: Load countries.json at startup
- [ ] Phase 3: Wire helpers throughout code
- [ ] Phase 4: Remove old data
- [ ] Phase 5: Test and commit
