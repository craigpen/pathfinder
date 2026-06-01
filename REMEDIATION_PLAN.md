# Career Database Data Normalization & Remediation Plan

## Executive Summary
Normalize careers.json to use discrete, normalized fields while preserving contextual qualifiers. This enables consistent data storage, flexible display logic, and queryable data without losing nuance.

**Core Principle:** Store discrete facts separately; compose display text at render time.

---

## Phase 1: Schema Design

### Current → Normalized Field Mapping

#### 1. SALARY FIELDS (salaryUS / salaryEU)
**Current Format:** `"$85k–$140k"`, `"$70k-$211k"`, `"Variable"`, `"N/A"`, `"$200k–$400k+"`

**Issues Found:**
- Inconsistent separators: mix of `-` (hyphen) and `–` (en-dash) across ~50 entries
- Open-ended ranges with `+` notation (1 entry: `$200k–$400k+`)
- Non-standard text values: "Variable" (1), "N/A" (1)
- EU salary field contains USD values, not EUR (causes currency confusion across ~40 entries)

**New Schema:**
```json
"salaryUS_min": 85000,                      // numeric, in USD
"salaryUS_max": 140000,                     // numeric, in USD
"salaryUS_note": null,                      // optional: "Variable by specialization"
"salaryEU_min": 52000,                      // numeric, ALSO in USD (not EUR)
"salaryEU_max": 85000,                      // numeric, ALSO in USD (not EUR)
"salaryEU_note": null
```

**Mapping Rules:**
- Extract min/max numerically from ranges: `"$85k–$140k"` → `min: 85000, max: 140000`
- Drop open-ended `+` markers: `$400k+` → `max: 400000` (everything is open-ended in theory)
- Non-standard values: `"Variable"` or `"N/A"` → `{min: null, max: null, note: "Variable by market/specialization"}`
- ALL currency values stored as USD (salaryEU field contains USD equivalents, not EUR)
- Remove all `$`/`€` symbols from storage; add in display layer only via `formatSalary(min, max)` function
- Display formatter: `formatSalary(85000, 140000)` → `"$85k–$140k"`

---

#### 2. COST FIELDS (costUS / costEU)
**Current Format:** `150000`, `8000`, missing values

**Inconsistencies Found:**
1. Missing costEU for "US Law (JD)"
2. Missing costUS for "European Law"
3. No documented standard for what costs represent (tuition-only? includes living costs? estimated?)

**Suggested Resolution For Each:**
1. [Missing costEU for US Law] → Discover from authoritative sources (institutional data, government databases, etc.)
2. [Missing costUS for European Law] → Discover from authoritative sources (institutional data, government databases, etc.)
3. [Undocumented cost standard] → All costs represent tuition-only based on standard backend process; no qualifiers/notes needed. Sanity-check existing values against this standard.

**New Schema:**
```json
"costUS_min": 140000,                       // numeric, in USD, tuition-only
"costUS_max": 160000,                       // numeric, in USD, tuition-only
"costEU_min": 7000,                         // numeric, in USD (NOT EUR), tuition-only
"costEU_max": 9000                          // numeric, in USD (NOT EUR), tuition-only
```

**Mapping Rules:**
- All costs stored as min/max range (tuition-only, no living expenses)
- All currency in USD (costEU values are USD equivalents, not EUR amounts)
- No qualifiers or notes; present clean numbers based on standard backend discovery process
- Missing values must be filled from authoritative sources before migration

---

#### 3. EDUCATION FIELD
**Current Format:** 45 different formats (e.g., "Bachelor's (4 yr)", "Bachelor's + MBA typical", "DVM degree required (4 years)")

**Issues:**
- Inconsistent capitalization
- Inconsistent concatenation style
- Inconsistent duration notation
- Doesn't capture prerequisite chain (e.g., Bachelor → MD → Residency)
- Doesn't distinguish requirement levels (required vs typical vs optional)

**New Schema:**
```json
"education": {
  "degrees": [
    {
      "level": "graduate",              // undergraduate, graduate, professional, doctoral, postdegree
      "names": ["Master", "MBA"],       // Primary name(s) for the degree
      "prerequisite": "Bachelor",       // Explicit prerequisite (null/omitted for Bachelor)
      "us_years": 2,                    // Duration in US (number or "3-7")
      "eu_years": 2,                    // Duration in EU
      "norm": "required"                // required | typical | optional
    }
  ],
  "requirement_summary": "Bachelor, Master required"  // Compact display for tables
}
```

**Mapping Examples:**
- `"Bachelor's (4 yr)"` → `{degrees: [{level: "undergraduate", names: ["Bachelor"], us_years: 4, eu_years: 3, norm: "required"}], requirement_summary: "Bachelor required"}`
- `"Bachelor's + MBA typical"` → `{degrees: [{...Bachelor...}, {level: "graduate", names: ["MBA"], prerequisite: "Bachelor", us_years: 2, eu_years: 2, norm: "typical"}], requirement_summary: "Bachelor required, MBA typical"}`
- `"Bachelor's + Med + Residency (11–15 yr)"` → `{degrees: [{...Bachelor...}, {level: "professional", names: ["MD"], prerequisite: "Bachelor", us_years: 4, eu_years: 4, norm: "required"}, {level: "postdegree", names: ["Residency"], prerequisite: "MD", us_years: "3-7", eu_years: "3-7", norm: "required"}], requirement_summary: "Bachelor required, MD, Residency required"}`
- `"Bachelor's or Master's"` → Master with `norm: "optional"` (Bachelor always required), requirement_summary: `"Bachelor required, Master optional"`
- `"PhD for research"` → PhD degree with `norm: "optional"`, requirement_summary: `"Bachelor required, PhD for research"`

**Key Rule:** `requirement_summary` ALWAYS includes "Bachelor required" first, never omitted. Students must understand Bachelor is foundational and non-negotiable.

---

#### 4. GROWTH FIELD
**Current Format:** 27 different formats (e.g., "Very high", "Strong 15% (2024-2034)", "Positive 6% growth (2024-2034)")

**Growth Descriptor → Percentage Mapping (Non-Overlapping Ranges):**
Use midpoint of range when descriptor has no %; no period information stored.
| Descriptor | Min % | Max % | Midpoint | Direction |
|---|---|---|---|---|
| Very High | 15 | ∞ | 18% | positive |
| High | 8 | 14 | 11% | positive |
| Moderate | 4 | 7 | 6% | positive |
| Low | 1 | 3 | 2% | positive |
| Declining | -∞ | 0 | -2% | negative |

**Inconsistencies Found:**
1. Qualitative only, no percentage (3 entries) — "Moderate", "High", "Very high"
2. Inconsistent notation with percentages (21+ entries) — "Moderate 4%" vs "Moderate 4% growth" vs "Moderate 4% (2024-2034)"
3. Mixed direction/magnitude terminology — "Positive", "Strong", "Moderate", "Slow", "Declining", "Modest" conflate direction with magnitude
4. Inconsistent date ranges — Some entries have "2024-2034", others don't; period information mixed with growth data
5. Range notation (1 entry) — "Very strong 20-35% growth (2024-2034)"

**Suggested Resolution For Each:**
1. [Qualitative only] → Discover actual % values from authoritative sources (BLS, industry reports, etc.) for all 3 entries
2. [Store % + derive magnitude] → Store growth as numeric % value. Apply uniform scaling standard to derive magnitude category: Flat=0%, Low=1-2%, Moderate=3-5%, High=6-10%, Very High=11%+. (Scaling thresholds may be adjusted based on data distribution, but must be applied uniformly to all careers.)
3. [Mixed terminology] → Separate direction (positive/negative/neutral) from magnitude category. Remap all conflated terms (Strong, Modest, Slow, etc.) to consistent direction + magnitude based on % value from step 2.
4. [Discard period information] → Remove all date ranges (2024-2034, etc.) from growth data. No period stored or displayed.
5. [Range notation] → Calculate midpoint and round to nearest whole number. Example: "20-35%" → (20+35)/2 = 27.5 → 28%

**New Schema:**
```json
"growth": {
  "direction": "positive",          // positive | negative | neutral
  "magnitude": "high",              // flat, low, moderate, high, very_high (derived from pct using standard scale)
  "pct": 15                         // numeric percentage value from authoritative source
}
```

---

#### 5. LICENSING FIELD
**Current Format:** 24 different formats (e.g., "No", "Required", "PE optional", "State bar exam", "CPA (US), ACCA (intl)")

**Inconsistencies Found:**
1. Mixed yes/no/maybe terminology (40+ entries combined) — "Not required" (21x), "No" (15x), "Required" (3x), "Rarely" (4x)
2. Inconsistent scope specification — Some specify scope ("Country-specific", "State-specific", "global"), others don't
3. Specific license type details (9 entries) — Some mention license names ("PE", "CPA", "CFA", "NCLEX", "USMLE", "LCSW", "OTR/L", "RD/RDN", "Bar exam"), others generic
4. Conditional requirements (5+ entries) — "PE optional", "varies by specialty", "Required for clinical roles", "Required (some areas)"
5. Geographic/international notation inconsistency — "global", "intl", "country-specific", "(US)", "(country-specific)" used variably

**Suggested Resolution For Each:**
1. [Mixed yes/no/maybe] → Normalize to single `status` field with standard values: required | optional | not_available
2. [Inconsistent scope] → Extract scope to discrete field with standard values: global, us, state, country_specific, varies
3. [License type details] → Extract license type names to `type` array field. Example: "CPA (US), ACCA (intl)" → `{type: ["CPA", "ACCA"]}`
4. [Conditional requirements] → Add optional `qualifier` field for conditions. Example: "PE optional, varies by specialty" → `{status: "optional", qualifier: "varies by specialty"}`
5. [Geographic notation] → Standardize to `scope` field values. Remove parenthetical notation; use consistent scope field instead.

**New Schema:**
```json
"licensing": {
  "status": "required",             // required | optional | not_available
  "type": ["PE", "CFA"],            // optional array of license type names
  "scope": "us",                    // global, us, state, country_specific, varies
  "qualifier": null                 // optional: e.g., "varies by specialty", "for clinical roles"
}
```

---

#### 6. PORTABILITY FIELD
**Current Format:** 11 different formats (e.g., "HIGH", "HIGH – CFA global", "LOW – country-specific")

**Inconsistencies Found:**
1. Clean level-only entries (59 entries) — "HIGH" (39x), "MEDIUM" (14x), "LOW" (6x)
2. Mixed qualifier notation (11 entries) — Some use em-dash: "HIGH — certs are global"; some use parentheses: "HIGH (in English)"
3. Qualifiers stored inline with level — Context text mixed with the level value ("HIGH — CFA global", "MEDIUM — CPA US-specific", "LOW — US bar only")

**Suggested Resolution For Each:**
1. [Clean entries] → Keep as-is; extract to `level` field as primary value
2. [Mixed qualifier separators] → Normalize by removing em-dash/parentheses; move all qualifier text to separate `qualifier` field
3. [Inline qualifiers] → Extract all qualifier text to optional `qualifier` field; keep `level` field clean (HIGH/MEDIUM/LOW only)

**New Schema:**
```json
"portability": {
  "level": "HIGH",                  // HIGH | MEDIUM | LOW
  "qualifier": null                 // optional: e.g., "CFA is globally recognized", "US bar only"
}
```

---

#### 7. DEMAND FIELD
**Current:** Consistent structure `{label, pct, period, src}` when present. 3 missing (Engineering, Entrepreneurship, Zoology). All entries include period field.

**Inconsistencies Found:**
1. Missing demand data for 3 careers — Engineering, Entrepreneurship, Zoology
2. Period field included in all demand entries (e.g., "2023–2033") — but user wants no periods anywhere in system

**Suggested Resolution For Each:**
1. [Missing demand] → Discover from authoritative sources (BLS Labor Outlook, WageDex, etc.) for the 3 missing careers
2. [Period field] → Remove `period` field entirely from demand schema (no periods stored or displayed anywhere)

**New Schema:**
```json
"demand": {
  "label": "Very high",             // qualitative descriptor
  "pct": 15.8,                      // numeric percentage
  "src": "https://..."              // source URL (authoritative, e.g., BLS, WageDex)
}
```

---

#### 8. RESOURCES FIELD
**Current Format:** Array of `{title, url}` objects

**Inconsistencies Found:**
1. None — All 67 careers have resources
2. Consistent structure — All use `{title, url}` format
3. Complete data — No missing URLs or titles
4. Proper hyperlinks — All URLs start with `http://` or `https://`

**Suggested Resolution For Each:**

None needed. Field is already normalized and consistent.

**Final Schema (no changes):**
```json
"resources": [
  {
    "title": "IEEE",
    "url": "https://www.ieee.org/"
  }
]
```

---

## Phase 2: Data Migration Strategy

### Step 1: Create Migration Script
- Write Python script to parse current careers.json
- Apply mapping rules from Phase 1 for each field
- Validate output (no data loss, types correct)
- Output normalized careers.json

### Step 2: Handle Edge Cases
- Missing values: Document assumptions and defaults
- Ambiguous values: Flag for manual review (e.g., "Variable", "N/A")
- Non-standard formats: Log for QA

### Step 3: Validation Checklist
- [ ] All 67 careers have valid normalized schema
- [ ] No fields are lost (compare field count before/after)
- [ ] Type validation passes (numbers are numbers, etc.)
- [ ] Missing values handled consistently
- [ ] Spot-check 10 careers for accuracy

---

## Phase 3: Helper Functions

Create query/display helpers that normalize the schema:

### Query Helpers (for UI logic)
```javascript
getSalaryRange(career, region) → {min, max, display: "$85k–$140k"}
getEducationSummary(career) → "Bachelor's (4 yr) + CPA"
getGrowthDescription(career) → "Strong growth (15%, 2024-2034)"
getPortabilityLevel(career) → "HIGH"
getPortabilityNote(career) → "CFA is globally recognized" or null
getLicensingRequirement(career) → {required, type, scope}
```

### Display Helpers (for rendering)
```javascript
formatSalary(min, max, currency) → "$85k–$140k"
formatEducation(primary, duration, additional, notes) → formatted string
formatGrowth(magnitude, pct, direction, period) → formatted string
formatPortability(level, qualifier, appliesTo) → formatted string
formatLicensing(required, type, scope, notes) → formatted string
```

### Validation Helpers
```javascript
validateCareerSchema(career) → {valid: true/false, errors: []}
validateAllCareers() → {total: 67, valid: X, invalid: Y, errors: [...]}
```

### Debug Helpers
```javascript
debugCareer(name) → console output of all fields (normalized + raw)
debugCategory(catKey) → console output of all careers in category
```

---

## Phase 4: Code Refactoring

### Update Display Logic
- Replace inline field access (e.g., `career.salaryUS`) with helper functions
- Update all rendering functions (tables, carousels, insights) to use formatters
- Update insights generation to work with normalized schema

### Files to Update
1. **index.html** — Update all references to salary/cost/growth/licensing/portability/education
2. **CLAUDE.md** — Document new schema in Section 7 (Data Externalization) and add Section 10 (Career Database Schema)

### Search & Replace Areas
- Rendering functions that display career data
- Insights generation that analyzes career attributes
- Filter/analysis functions that evaluate career data
- Debug functions that output career info

---

## Phase 5: Testing & Validation

### Unit Tests (Helper Functions)
- [ ] `getSalaryRange("Software Engineering", "us")` returns correct structure
- [ ] Display formatters produce expected strings
- [ ] Edge cases (null values, "Variable", etc.) handled gracefully
- [ ] Before/after display comparison: old string format == new format display

### Integration Tests
- [ ] Careers tab displays all 67 careers correctly
- [ ] Insights tab generates insights without errors
- [ ] Cost calculations use correct data
- [ ] Category summaries aggregate correctly

### Manual Testing
- [ ] Desktop: View 5 random careers (verify all fields display correctly)
- [ ] Mobile: Carousel view (verify formatting in compact mode)
- [ ] Insights: Select careers and verify insights reference normalized data
- [ ] Search/filter: If any filtering code exists, verify it still works

---

## Phase 6: Documentation

### Update CLAUDE.md
Add Section 10: **Career Database Schema**

Document:
- Normalized schema for each field (salary, education, growth, licensing, portability, etc.)
- Mapping rules from old → new format
- Helper function signatures
- When to use query vs display helpers
- Example: how to add a new career with normalized data

---

## Phase 7: Rollout Checklist

- [ ] Migration script tested on copy of careers.json
- [ ] Normalized schema validated (0 errors)
- [ ] All helper functions implemented
- [ ] All rendering code updated to use helpers
- [ ] Unit tests pass
- [ ] Manual testing passes (desktop + mobile)
- [ ] CLAUDE.md updated with new schema
- [ ] Commit with version bump (MINOR: v1.17.0)
- [ ] Local testing complete
- [ ] Ready for push to GitHub

---

## Success Metrics

✅ **Data Consistency**: All careers use same schema
✅ **Context Preserved**: All qualifiers and notes retained
✅ **Display Quality**: UI looks identical before/after normalization
✅ **Queryability**: Can filter by education_level, growth_magnitude, licensing_required, etc.
✅ **Maintainability**: Adding new careers is straightforward with documented schema
✅ **No Data Loss**: Every piece of information in old format recoverable in new format

---

## Timeline Estimate
- Phase 1 (Schema): 2 hours
- Phase 2 (Migration): 3 hours
- Phase 3 (Helpers): 4 hours
- Phase 4 (Refactoring): 5 hours
- Phase 5 (Testing): 3 hours
- Phase 6 (Docs): 1 hour
- Phase 7 (Rollout): 1 hour

**Total: ~19 hours**

