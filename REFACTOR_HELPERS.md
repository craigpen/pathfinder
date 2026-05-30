# Refactoring Helpers — Phase 1 Implementation

This file documents the complete helper function infrastructure created in Phase 1 for safe, validated access to consolidated country data from countries.json.

---

## Overview

All helpers are in index2.html `<script>` section, defined **before** data is loaded. They provide:
1. **Validation schema** — Define required fields and types
2. **Query helpers** — Safe getters for all country data (core + specific fields)
3. **Update helpers** — Safe setters with validation
4. **Validation helpers** — Schema and data quality checks
5. **Debug helpers** — Console testing utilities

---

## Validation Schema

```javascript
const COUNTRY_SCHEMA = {
  // Basic metadata (required)
  name: { required: true, type: 'string' },
  flag: { required: true, type: 'string', pattern: /^data:image/ },

  // Deep Dive fields
  tuition: { required: true, type: 'string' },
  tuitionNote: { required: false, type: 'string' },
  duration: { required: true, type: ['string', 'number'] },
  language: { required: false, type: 'string' },
  changePolicy: { required: false, type: 'string' },
  postGradOpportunities: { required: false, type: 'string' },
  financialAid: { required: false, type: 'string' },
  admissions: { required: false, type: 'string' },
  culture: { required: false, type: 'string' },
  portal: { required: false, type: 'string' },
  costBreakdown: { required: false, type: 'object' },
  resources: { required: false, type: 'array' },
  photos: { required: false, type: 'array' },
  steps: { required: false, type: 'array' },
  faqs: { required: false, type: 'array' },

  // Scholarships fields
  need: { required: false, type: 'object' },
  merit: { required: false, type: 'object' },
  external: { required: false, type: 'object' },
  free: { required: false, type: 'object' },
  timeline: { required: false, type: 'string' },
  links: { required: false, type: 'array' }
};
```

---

## Core Query Helpers

```javascript
// Basic fields
getCountryName(code)              // Returns: string
getCountryFlag(code)              // Returns: data URI string
getCountryTuition(code)           // Returns: tuition string (e.g., "$15k–$85k/yr")
getCountryDuration(code)          // Returns: string or number
getCountryLanguage(code)          // Returns: language string

// Grouped getters
getCountryDetails(code)           // Returns: {tuition, duration, language, changePolicy, ...}
getCountryFunding(code)           // Returns: {need, merit, external, free, timeline, links}
getCountryAllData(code)           // Returns: complete country object (deep copy)
```

---

## Specific Field Accessors

### Deep Dive Tab Fields
```javascript
getCountryChangePolicy(code)      // "Easy — switch majors freely"
getCountryPostGradOpportunities(code)  // "Strong US network; OPT..."
getCountryFinancialAid(code)      // "Merit + need-based; FAFSA..."
getCountryAdmissions(code)        // "Holistic (GPA, essays, ...)"
getCountryCulture(code)           // "Campus life, dorms..."
getCountryPortal(code)            // "commonapp.org"
getCountryTuitionNote(code)       // "In-state public ~$10k..."
```

### Cost Breakdown Fields
```javascript
getCountryCostBreakdown(code)     // Returns: {tui, room, books, personal, travel}
getCountryCostTuition(code)       // Returns: number (e.g., 35000)
getCountryCostRoom(code)          // Returns: number
getCountryCostBooks(code)         // Returns: number
getCountryCostPersonal(code)      // Returns: number
getCountryCostTravel(code)        // Returns: number
```

### Scholarships Fields
```javascript
getCountryNeed(code)              // Returns: {what, apply, notes}
getCountryMerit(code)             // Returns: {what, apply, notes}
getCountryExternal(code)          // Returns: {what, apply, notes}
getCountryFree(code)              // Returns: {what, apply, notes}
getCountryScholarshipTimeline(code)  // Returns: timeline string
getCountryScholarshipLinks(code)  // Returns: [{t, u}, ...] array
```

### Array Accessors (return empty array if missing)
```javascript
getCountryResources(code)         // Returns: [{t: 'Title', u: 'URL'}, ...]
getCountryPhotos(code)            // Returns: [{src, cap}, ...]
getCountrySteps(code)             // Returns: ['Step 1', 'Step 2', ...]
getCountryFaqs(code)              // Returns: [{q, a}, ...]
```

---

## Update Helpers

```javascript
// Add a new country with full validation
addCountry(code, data)
// Returns: {success: true, message: '...'} or {success: false, error: '...'}
// Requirements:
//   - code must be 2 letters
//   - code must not already exist
//   - data must pass full schema validation

// Update existing country with validation
updateCountry(code, data)
// Returns: {success: true, message: '...'} or {success: false, error: '...'}
// Requirements:
//   - code must exist
//   - partial updates merged with existing data
//   - merged result must pass schema validation
```

---

## Validation Helpers

```javascript
// Validate a country against schema (returns errors array or true)
validateCountrySchema(code, data)
// Returns: true (valid) or array of error strings

// Check all countries (returns summary object)
validateAllCountries()
// Returns: {total: 13, valid: 13, invalid: 0, details: null}
// or: {total: 13, valid: 10, invalid: 3, details: {us: [...], uk: [...]}}

// Type-specific validation
validateCountryDataTypes(code, data)  // Alias for validateCountrySchema
```

---

## Debug Helpers

```javascript
// Dump all data for a single country to console
debugCountry(code)
// Output:
//   Country: us
//   Name: United States
//   Flag: data:image/svg+xml;base64,...
//   Tuition: $15k–$85k/yr
//   Duration: 4
//   Language: English
//   Cost Breakdown: {tui: 35000, ...}
//   Scholarships: {need: true, merit: true, ...}
//   Validation: VALID

// Dump validation summary for all countries
debugAllCountries()
// Output:
//   All Countries Validation Summary
//   Total: 13
//   Valid: 13
//   Invalid: 0
//   Loaded countries: canada, ch, denmark, ...
```

---

## Usage Examples

### Typical Query Pattern (Phase 3+)
```javascript
// Before (direct CD access):
const tuition = CD['us'].tui;

// After (using helpers):
const tuition = getCountryTuition('us');
```

### Nested Data Access
```javascript
// Before:
const costBreakdown = CD['us'].cy;
const roomCost = costBreakdown.room;

// After:
const roomCost = getCountryCostRoom('us');
```

### Adding a New Country
```javascript
const result = addCountry('zz', {
  name: 'New Country',
  flag: 'data:image/svg+xml;base64,...',
  tuition: '$10k/yr',
  duration: '4',
  language: 'English'
});

if (result.success) {
  console.log('Added:', result.message);
  debugAllCountries();  // Verify it validated
} else {
  console.error('Failed:', result.error);
}
```

### Validating All Data
```javascript
const validation = validateAllCountries();
if (validation.invalid > 0) {
  console.error('Invalid countries:', validation.details);
} else {
  console.log('All countries valid!');
}
```

---

## Testing Checklist (Phase 1)

- [x] All query helpers return correct data
- [x] All specific field accessors work correctly
- [x] Add helper validates and rejects invalid data
- [x] Update helper validates and modifies correctly
- [x] Validation schema catches missing required fields
- [x] Validation schema catches type mismatches
- [x] Array type detection works (distinguishes array from object)
- [x] Debug helpers display data correctly
- [x] All 13 countries validate on load
- [x] New countries validate after addition
- [x] Updated countries validate after modification

---

## Phase 3 Integration

During Phase 3, replace all direct data access with these helpers:

**Search for these patterns and replace:**
- `CD[code]` → use `getCountry*()` helpers
- `FUNDING[code]` → use `getCountry*Funding()` helpers
- `COUNTRIES[code].*` → use appropriate getter
- `.tui`, `.cy`, `.dec` → use specific helpers instead of field access

**Example refactoring:**
```javascript
// Find this:
const tuition = CD[k].tui;
const costBreakdown = CD[k].cy;
const faqs = CD[k].dec;

// Replace with:
const tuition = getCountryTuition(k);
const costBreakdown = getCountryCostBreakdown(k);
const faqs = getCountryFaqs(k);
```

---

## Notes

- All helpers validate data on retrieval to catch corruption
- Helpers return `null` if country not found (safe default)
- Array accessors return `[]` if array not found (safe default)
- Update helpers ensure complete validation before writing
- Debug helpers are console-only; safe to use anytime
