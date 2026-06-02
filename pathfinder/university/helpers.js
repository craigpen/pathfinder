// University Pathfinder - Helper Functions
// All get*, calculate*, compute*, update*, init*, build*, and generate* functions

function getCountryName(code) {
  const country = window.COUNTRIES?.[code];
  if (!country) return null;
  const val = country.name;
  if (typeof val !== 'string') console.warn(`getCountryName(${code}): expected string, got ${typeof val}`);
  return val;
}

function getCountryFlag(code) {
  const country = window.COUNTRIES?.[code];
  if (!country) return null;
  const val = country.flag;
  if (!val?.startsWith?.('data:image')) console.warn(`getCountryFlag(${code}): flag is not a data URI`);
  return `<img src="${val}" style="height:0.9em;vertical-align:middle">`;
}

function getCountryTuition(code) {
  const country = window.COUNTRIES?.[code];
  if (!country) return null;
  return country.tuition;
}

function getCountryDuration(code) {
  const country = window.COUNTRIES?.[code];
  if (!country) return null;
  return country.duration;
}

function getCountryLanguage(code) {
  const country = window.COUNTRIES?.[code];
  if (!country) return null;
  return country.language;
}

function getCountryDetails(code) {
  const country = window.COUNTRIES?.[code];
  if (!country) return null;

  // Return all Deep Dive fields
  return {
    tuition: country.tuition,
    tuitionNote: country.tuitionNote,
    duration: country.duration,
    language: country.language,
    changePolicy: country.changePolicy,
    postGradOpportunities: country.postGradOpportunities,
    financialAid: country.financialAid,
    admissions: country.admissions,
    culture: country.culture,
    portal: country.portal,
    costBreakdown: country.costBreakdown,
    resources: country.resources,
    photos: country.photos,
    steps: country.steps,
    faqs: country.faqs
  };
}

function getCountryFunding(code) {
  const country = window.COUNTRIES?.[code];
  if (!country) return null;

  // Return all Scholarships fields
  return {
    need: country.need,
    merit: country.merit,
    external: country.external,
    free: country.free,
    timeline: country.timeline,
    links: country.links
  };
}

function getCountryAllData(code) {
  const country = window.COUNTRIES?.[code];
  if (!country) return null;
  return JSON.parse(JSON.stringify(country)); // Deep copy
}

// Specific field accessors (for commonly-used nested data)
function getCountryChangePolicy(code) {
  const country = window.COUNTRIES?.[code];
  return country?.changePolicy || null;
}

function getCountryPostGradOpportunities(code) {
  const country = window.COUNTRIES?.[code];
  return country?.postGradOpportunities || null;
}

function getCountryFinancialAid(code) {
  const country = window.COUNTRIES?.[code];
  return country?.financialAid || null;
}

function getCountryAdmissions(code) {
  const country = window.COUNTRIES?.[code];
  return country?.admissions || null;
}

function getCountryCulture(code) {
  const country = window.COUNTRIES?.[code];
  return country?.culture || null;
}

function getCountryPortal(code) {
  const country = window.COUNTRIES?.[code];
  return country?.portal || null;
}

function getCountryTuitionNote(code) {
  const country = window.COUNTRIES?.[code];
  return country?.tuitionNote || null;
}

// Cost Breakdown accessors
function getCountryCostBreakdown(code) {
  const country = window.COUNTRIES?.[code];
  return country?.costBreakdown || null;
}

function getCountryCostTuition(code) {
  const breakdown = getCountryCostBreakdown(code);
  return breakdown?.tui || null;
}

function getCountryCostRoom(code) {
  const breakdown = getCountryCostBreakdown(code);
  return breakdown?.room || null;
}

function getCountryCostBooks(code) {
  const breakdown = getCountryCostBreakdown(code);
  return breakdown?.books || null;
}

function getCountryCostPersonal(code) {
  const breakdown = getCountryCostBreakdown(code);
  return breakdown?.personal || null;
}

function getCountryCostTravel(code) {
  const breakdown = getCountryCostBreakdown(code);
  return breakdown?.travel || null;
}

// Scholarship field accessors
function getCountryNeed(code) {
  const country = window.COUNTRIES?.[code];
  return country?.need || null;
}

function getCountryMerit(code) {
  const country = window.COUNTRIES?.[code];
  return country?.merit || null;
}

function getCountryExternal(code) {
  const country = window.COUNTRIES?.[code];
  return country?.external || null;
}

function getCountryFree(code) {
  const country = window.COUNTRIES?.[code];
  return country?.free || null;
}

function getCountryScholarshipTimeline(code) {
  const country = window.COUNTRIES?.[code];
  return country?.timeline || null;
}

function getCountryScholarshipLinks(code) {
  const country = window.COUNTRIES?.[code];
  return country?.links || null;
}

// Array accessors
function getCountryResources(code) {
  const country = window.COUNTRIES?.[code];
  return country?.resources || [];
}

function getCountryPhotos(code) {
  const country = window.COUNTRIES?.[code];
  return country?.photos || [];
}

function getCountrySteps(code) {
  const country = window.COUNTRIES?.[code];
  return country?.steps || [];
}

function getCountryFaqs(code) {
  const country = window.COUNTRIES?.[code];
  return country?.faqs || [];
}

// Update Helpers: safe setters with validation on write
function addCountry(code, data) {
  if (!code || typeof code !== 'string' || code.length !== 2) {
    return { success: false, error: 'Country code must be 2 letters' };
  }

  if (window.COUNTRIES?.[code]) {
    return { success: false, error: `Country ${code} already exists` };
  }

  const validation = validateCountrySchema(code, data);
  if (validation !== true) {
    return { success: false, error: 'Validation failed', details: validation };
  }

  window.COUNTRIES[code] = data;
  return { success: true, message: `Added country ${code}` };
}

function updateCountry(code, data) {
  if (!code || !window.COUNTRIES?.[code]) {
    return { success: false, error: `Country ${code} not found` };
  }

  const merged = { ...window.COUNTRIES[code], ...data };
  const validation = validateCountrySchema(code, merged);
  if (validation !== true) {
    return { success: false, error: 'Validation failed', details: validation };
  }

  window.COUNTRIES[code] = merged;
  return { success: true, message: `Updated country ${code}` };
}

// Debug Helpers: for console testing
function debugCountry(code) {
  if (!window.COUNTRIES?.[code]) {
    console.log(`Country ${code} not found`);
    return;
  }

  const data = window.COUNTRIES[code];
  const validation = validateCountrySchema(code, data);

  console.group(`Country: ${code}`);
  console.log('Name:', data.name);
  console.log('Flag (first 50 chars):', data.flag?.substring(0, 50) + '...');
  console.log('Tuition:', data.tuition);
  console.log('Duration:', data.duration);
  console.log('Language:', data.language);
  console.log('Cost Breakdown:', data.costBreakdown);
  console.log('Scholarships:', { need: !!data.need, merit: !!data.merit, external: !!data.external, free: !!data.free });
  console.log('Validation:', validation === true ? 'VALID' : validation);
  console.groupEnd();
}

function debugAllCountries() {
  const validation = validateAllCountries();
  console.group('All Countries Validation Summary');
  console.log(`Total: ${validation.total}`);
  console.log(`Valid: ${validation.valid}`);
  console.log(`Invalid: ${validation.invalid}`);
  if (validation.details) {
    console.error('Invalid countries:', validation.details);
  } else {
    console.log('All countries valid!');
  }
  console.groupEnd();

  // Also list all country codes
  console.log('Loaded countries:', Object.keys(window.COUNTRIES || {}).sort().join(', '));

  return validation;
}

function getCountrySchemaTemplate() {
  const template = {};
  for (const [field, rules] of Object.entries(COUNTRY_SCHEMA)) {
    if (rules.type === 'object') {
      template[field] = {};
    } else if (rules.type === 'array') {
      template[field] = [];
    } else if (Array.isArray(rules.type)) {
      template[field] = rules.type[0] === 'string' ? '' : 0;
    } else if (rules.type === 'string') {
      template[field] = '';
    } else if (rules.type === 'number') {
      template[field] = 0;
    }
  }
  return template;
}

function validateCountryCompleteness(code) {
  const country = window.COUNTRIES?.[code];
  if (!country) return { code, status: 'NOT_FOUND', errors: ['Country does not exist'] };

  const errors = [];
  const warnings = [];

  for (const [field, rules] of Object.entries(COUNTRY_SCHEMA)) {
    if (rules.required) {
      if (!(field in country)) {
        errors.push(`Missing required field: ${field}`);
      } else {
        const value = country[field];
        if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)) {
          errors.push(`Required field empty: ${field}`);
        }
      }
    } else if (field in country) {
      const value = country[field];
      if (value === '' || value === null || (Array.isArray(value) && value.length === 0)) {
        warnings.push(`Optional field empty: ${field}`);
      }
    }
  }

  return {
    code,
    status: errors.length === 0 ? 'COMPLETE' : 'INCOMPLETE',
    errors,
    warnings
  };
}

function validateCountriesJSON(jsonContent) {
  try {
    const data = JSON.parse(jsonContent);
    if (typeof data !== 'object' || Array.isArray(data)) {
      return { valid: false, error: 'countries.json must be an object with country codes as keys' };
    }

    const results = { valid: true, total: 0, valid: 0, invalid: 0, details: {} };

    for (const [code, countryData] of Object.entries(data)) {
      results.total++;
      const validation = validateCountrySchema(code, countryData);
      if (validation === true) {
        results.valid++;
      } else {
        results.invalid++;
        results.details[code] = validation;
      }
    }

    return results;
  } catch (e) {
    return { valid: false, error: `JSON parse error: ${e.message}` };
  }
}

// ============================================================================
// PHASE 2: LOAD countries.json AT STARTUP
// ============================================================================

let COUNTRIES = {}; // Initialize empty, will be populated by loadCountriesData()
let COUNTRIES_LOADED = false;

async function loadCountriesData() {
  try {
    const response = await fetch('./data/countries.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    // Initialize COUNTRIES from consolidated data from countries.json
    Object.assign(COUNTRIES, data);
    window.COUNTRIES = COUNTRIES;  // Also set on window for helpers to access
    COUNTRIES_LOADED = true;

    const validation = validateAllCountries();
    console.log(`✓ Loaded countries.json: ${validation.total} countries`);

    if (validation.invalid > 0) {
      console.error(`⚠ ${validation.invalid} countries failed validation:`, validation.details);
    } else {
      console.log('✓ All countries passed validation');
    }

    // Clean up state with invalid country codes
    const validCodes = Object.keys(data);
    if (S.cc) S.cc = S.cc.filter(k => validCodes.includes(k));
    if (S.costCC) S.costCC = S.costCC.filter(k => validCodes.includes(k));
    if (S.expl && !validCodes.includes(S.expl)) S.expl = null;
    saveState();

    return true;
  } catch (error) {
    console.error('✗ Failed to load countries.json:', error.message);
    return false;
  }
}

// Load countries data on page start
loadCountriesData();

let CAREERS_LOADED = false;

async function loadCareersData() {
  try {
    const response = await fetch('./data/careers.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    window.CAREERS = data;
    window.CAREERS_LOADED = true;
    CAREERS_LOADED = true;

    const total = Object.keys(data).length;
    const totalCareers = Object.values(data).reduce((sum, cat) => sum + Object.keys(cat.subjects || {}).length, 0);
    console.log(`✓ Loaded careers.json: ${total} categories, ${totalCareers} careers`);

    return true;
  } catch (error) {
    console.error('✗ Failed to load careers.json:', error.message);
    return false;
  }
}

// Load careers data on page start
loadCareersData();

// ============================================================================
// LOAD SHARED AND PATHFINDER-SPECIFIC DATA
// ============================================================================

let STATE_NAMES = {};
let CAREER_TO_QS_SUBJECT = {};
let SELECTIVITY_DISPLAY = {};
let TUITION_AVERAGES = {};
let SELECTOR_OPTIONS = {};

let STATE_NAMES_LOADED = false;
let SELECTOR_OPTIONS_LOADED = false;

async function loadStateNamesData() {
  try {
    const response = await fetch('../../state-names.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    Object.assign(STATE_NAMES, data);
    window.STATE_NAMES = STATE_NAMES;
    STATE_NAMES_LOADED = true;

    console.log(`✓ Loaded state-names.json: ${Object.keys(data).length} states`);
    return true;
  } catch (error) {
    console.error('✗ Failed to load state-names.json:', error.message);
    return false;
  }
}

async function loadSelectorOptionsData() {
  try {
    const response = await fetch('./data/selector-options.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    Object.assign(SELECTOR_OPTIONS, data);
    window.SELECTOR_OPTIONS = SELECTOR_OPTIONS;
    window.SELECTOR_OPTIONS_LOADED = true;
    SELECTOR_OPTIONS_LOADED = true;

    console.log(`✓ Loaded selector-options.json with ${Object.keys(SELECTOR_OPTIONS).length} selectors`);
    return true;
  } catch (error) {
    console.error('✗ Failed to load selector-options.json:', error.message);
    return false;
  }
}
loadSelectorOptionsData();

let PATHFINDER_DATA_LOADED = false;

async function loadPathfinderData() {
  try {
    // Load career-to-qs-subject mapping
    const careersRes = await fetch('./data/career-to-qs-subject.json');
    if (!careersRes.ok) throw new Error(`HTTP ${careersRes.status} loading career-to-qs-subject.json`);
    const careersData = await careersRes.json();
    Object.assign(CAREER_TO_QS_SUBJECT, careersData);
    window.CAREER_TO_QS_SUBJECT = CAREER_TO_QS_SUBJECT;

    // Load selectivity display mapping
    const selectivityRes = await fetch('./data/selectivity-display.json');
    if (!selectivityRes.ok) throw new Error(`HTTP ${selectivityRes.status} loading selectivity-display.json`);
    const selectivityData = await selectivityRes.json();
    Object.assign(SELECTIVITY_DISPLAY, selectivityData);
    window.SELECTIVITY_DISPLAY = SELECTIVITY_DISPLAY;

    // Load tuition averages
    const tuitionRes = await fetch('./data/tuition-averages.json');
    if (!tuitionRes.ok) throw new Error(`HTTP ${tuitionRes.status} loading tuition-averages.json`);
    const tuitionData = await tuitionRes.json();
    Object.assign(TUITION_AVERAGES, tuitionData);
    window.TUITION_AVERAGES = TUITION_AVERAGES;

    PATHFINDER_DATA_LOADED = true;
    console.log(`✓ Loaded pathfinder data: ${Object.keys(careersData).length} career-to-QS mappings, ${Object.keys(selectivityData).length} selectivity levels, tuition data for ${Object.keys(tuitionData.instate).length} states`);
    return true;
  } catch (error) {
    console.error('✗ Failed to load pathfinder data:', error.message);
    return false;
  }
}

// Load shared and pathfinder data on page start
loadStateNamesData();
loadPathfinderData();
loadUniversitiesData();
loadInsightsData();

// ============================================================================

window.S={cats:[],motivations:[],subCareers:[],prac:[],cc:[],costCC:[],expl:null,playlist:null,flex:[],cost:null,vision:null,lang:null,citizen:[],debtYrs:null,languages:[],postGrad:null,inStateTuitionPref:null,stateOfResidency:null,inStateToggle:false,usUniversityType:null,uniSelectivity:[],scholarshipAmount:null,collegeSavings:null,partTimeWork:null,familySupport:null,loanRate:null,loanRepaymentYears:null};const S=window.S;
const VERSION='v1.18.2';window.VERSION=VERSION;
document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('version-badge');if(b)b.innerText=VERSION;});
function saveState(){const stateToSave={cats:S.cats,motivations:S.motivations,subCareers:S.subCareers,flex:S.flex,cost:S.cost,vision:S.vision,lang:S.lang,citizen:S.citizen,debtYrs:S.debtYrs,languages:S.languages,postGrad:S.postGrad,inStateTuitionPref:S.inStateTuitionPref,stateOfResidency:S.stateOfResidency,cc:S.cc,costCC:S.costCC,expl:S.expl,uniSelectivity:S.uniSelectivity,scholarshipAmount:S.scholarshipAmount,collegeSavings:S.collegeSavings,partTimeWork:S.partTimeWork,familySupport:S.familySupport,loanRate:S.loanRate,loanRepaymentYears:S.loanRepaymentYears,inStateToggle:S.inStateToggle,usUniversityType:S.usUniversityType};localStorage.setItem('univPathfinderState',JSON.stringify(stateToSave));}
function loadState(){const saved=localStorage.getItem('univPathfinderState');if(saved){const state=JSON.parse(saved);Object.assign(S,state);if(state.scholarshipAmount!==undefined)document.getElementById('sl-schol').value=state.scholarshipAmount;if(state.collegeSavings!==undefined)document.getElementById('sl-savings').value=state.collegeSavings;if(state.partTimeWork!==undefined)document.getElementById('sl-work').value=state.partTimeWork;if(state.familySupport!==undefined)document.getElementById('sl-parent').value=state.familySupport;if(state.loanRate!==undefined)document.getElementById('sl-rate').value=state.loanRate;if(state.loanRepaymentYears!==undefined)document.getElementById('sl-yrs').value=state.loanRepaymentYears;if(state.inStateToggle!==undefined){const instateIn=document.getElementById('instate-in');const instateOut=document.getElementById('instate-out');if(state.inStateToggle){instateIn.classList.add('on');instateOut.classList.remove('on')}else{instateOut.classList.add('on');instateIn.classList.remove('on')}};if(S.uniSelectivity&&S.uniSelectivity.length>0)document.querySelectorAll('[data-q="uniSelectivity"] .pill').forEach(p=>{S.uniSelectivity.includes(p.textContent)?p.classList.add('on'):p.classList.remove('on')});if(S.motivations&&S.motivations.length>0)document.querySelectorAll('[data-q="motivations"] .pill').forEach(p=>{S.motivations.includes(p.textContent)?p.classList.add('on'):p.classList.remove('on')});if(S.languages&&S.languages.length>0)document.querySelectorAll('[data-q="languages"] .pill').forEach(p=>{S.languages.includes(p.textContent)?p.classList.add('on'):p.classList.remove('on')});if(S.citizen&&S.citizen.length>0)document.querySelectorAll('[data-q="citizen"] .pill').forEach(p=>{S.citizen.includes(p.textContent)?p.classList.add('on'):p.classList.remove('on')});if(S.flex&&S.flex.length>0)document.querySelectorAll('[data-q="flex"] .pill').forEach(p=>{S.flex.includes(p.textContent)?p.classList.add('on'):p.classList.remove('on')});if(S.vision)document.querySelectorAll('[data-q="vision"] .pill').forEach(p=>{S.vision===p.textContent?p.classList.add('on'):p.classList.remove('on')});if(S.lang)document.querySelectorAll('[data-q="lang"] .pill').forEach(p=>{S.lang===p.textContent?p.classList.add('on'):p.classList.remove('on')});if(S.cost)document.querySelectorAll('[data-q="cost"] .pill').forEach(p=>{S.cost===p.textContent?p.classList.add('on'):p.classList.remove('on')});if(S.debtYrs)document.querySelectorAll('[data-q="debtYrs"] .pill').forEach(p=>{S.debtYrs===p.textContent?p.classList.add('on'):p.classList.remove('on')});if(S.postGrad)document.querySelectorAll('[data-q="postGrad"] .pill').forEach(p=>{S.postGrad===p.textContent?p.classList.add('on'):p.classList.remove('on')});if(S.stateOfResidency)document.querySelectorAll('[data-q="stateOfResidency"] .pill').forEach(p=>{S.stateOfResidency===p.textContent?p.classList.add('on'):p.classList.remove('on')})}}
// PLAYLISTS, HEADER_PHOTOS, and FALLBACK_HDR_SVG are now defined in framework.js
function wideImg(u){
 try{
  u=(u||'').trim();
  if(!u) return u;
  if(u.startsWith('data:')) return u;
  const base=u.split('?')[0];
  return base + '?w=1600&h=420&fit=crop&q=80';
 }catch(e){
  return u;
 }
}
// CATS object removed — careers data now loaded from careers.json via window.CAREERS

function getCareerByName(name) {
  const careers = window.CAREERS;
  for (const catKey of Object.keys(careers)) {
    const subjects = careers[catKey].subjects || {};
    if (subjects[name]) return { category: catKey, data: subjects[name] };
  }
  return null;
}

function getCareerEducation(name) {
  const career = getCareerByName(name);
  return career ? career.data.education : null;
}

function getCareerCostUS(name) {
  const career = getCareerByName(name);
  if (!career) return null;
  const data = career.data;
  return { min: data.costUS_min, max: data.costUS_max };
}

function getCareerCostEU(name) {
  const career = getCareerByName(name);
  if (!career) return null;
  const data = career.data;
  return { min: data.costEU_min, max: data.costEU_max };
}

function getCareerSalaryUS(name) {
  const career = getCareerByName(name);
  if (!career) return null;
  const data = career.data;
  return { min: data.salaryUS_min, max: data.salaryUS_max };
}

function getCareerSalaryEU(name) {
  const career = getCareerByName(name);
  if (!career) return null;
  const data = career.data;
  return { min: data.salaryEU_min, max: data.salaryEU_max };
}

function getCareerGrowth(name) {
  const career = getCareerByName(name);
  return career ? career.data.growth : null;
}

function getCareerPortability(name) {
  const career = getCareerByName(name);
  return career ? career.data.portability : null;
}

function getCareerLicensing(name) {
  const career = getCareerByName(name);
  return career ? career.data.licensing : null;
}

function getCareerResources(name) {
  const career = getCareerByName(name);
  return career ? (career.data.resources || []) : [];
}

function getCategorySubjects(catKey) {
  const careers = window.CAREERS;
  if (!careers || !careers[catKey]) return {};
  return careers[catKey].subjects || {};
}

function getCategoryName(catKey) {
  const careers = window.CAREERS;
  if (!careers || !careers[catKey]) return '—';
  return careers[catKey].name || '—';
}

// Aggregate career data by category and format for display
function aggregateCategoryData(catKey, fieldName) {
  const careers = window.CAREERS;
  if (!careers || !careers[catKey]) return null;

  const subjects = careers[catKey].subjects || {};
  const careerList = Object.values(subjects);

  if (careerList.length === 0) return null;

  if (fieldName === 'education') {
    const educations = careerList.map(c => c.education).filter(e => e);
    if (educations.length === 0) return null;
    // Aggregate degree requirements across all careers
    const degreeNorms = { required: 0, typical: 0, optional: 0, doctorate: 0, professional: 0, residency: 0 };
    const degreeTypes = { bachelor: 0, master: 0, professional: 0, doctorate: 0, residency: 0 };
    educations.forEach(edu => {
      if (!edu.degrees) return;
      edu.degrees.forEach(deg => {
        const norm = deg.norm || 'required';
        degreeNorms[norm] = (degreeNorms[norm] || 0) + 1;
        const level = deg.level || 'undergraduate';
        if (level === 'undergraduate') degreeTypes.bachelor++;
        else if (level === 'graduate') degreeTypes.master++;
        else if (level === 'professional') degreeTypes.professional++;
        else if (level === 'doctoral') degreeTypes.doctorate++;
        else if (level === 'postdegree') degreeTypes.residency++;
      });
    });
    // Determine majority pattern
    const hasResidency = degreeTypes.residency > 0;
    const hasProfessional = degreeTypes.professional > 0;
    const hasDoctorat = degreeTypes.doctorate > 0;
    const hasMaster = degreeTypes.master > 0;

    if (hasResidency) {
      const advDegree = hasProfessional && hasDoctorat ? 'Professional or Doctorate' : hasProfessional ? 'Professional' : 'Doctorate';
      return { display: 'Bachelor and ' + advDegree + ' typical, Residency typical' };
    }
    if (hasProfessional || hasDoctorat) {
      if (hasProfessional && hasDoctorat) return { display: 'Bachelor and Professional or Doctorate typical' };
      if (hasProfessional) return { display: 'Bachelor and Professional typical' };
      return { display: 'Bachelor and Doctorate typical' };
    }
    if (hasMaster) return { display: 'Bachelor and Masters typical' };
    return { display: 'Bachelor typical' };
  }

  if (fieldName === 'costUS_min' || fieldName === 'costUS_max') {
    const minVals = careerList.map(c => c.costUS_min).filter(v => v !== null && v !== undefined);
    const maxVals = careerList.map(c => c.costUS_max).filter(v => v !== null && v !== undefined);
    if (minVals.length === 0) return null;
    const avgMin = Math.round(minVals.reduce((a, b) => a + b, 0) / minVals.length);
    const avgMax = Math.round(maxVals.reduce((a, b) => a + b, 0) / maxVals.length);
    const avg = Math.round((avgMin + avgMax) / 2);
    return { display: '$' + (avg >= 1000 ? (avg / 1000).toFixed(0) + 'k' : avg) + ' Average' };
  }

  if (fieldName === 'costEU_min' || fieldName === 'costEU_max') {
    const minVals = careerList.map(c => c.costEU_min).filter(v => v !== null && v !== undefined);
    const maxVals = careerList.map(c => c.costEU_max).filter(v => v !== null && v !== undefined);
    if (minVals.length === 0) return null;
    const avgMin = Math.round(minVals.reduce((a, b) => a + b, 0) / minVals.length);
    const avgMax = Math.round(maxVals.reduce((a, b) => a + b, 0) / maxVals.length);
    const avg = Math.round((avgMin + avgMax) / 2);
    return { display: '$' + (avg >= 1000 ? (avg / 1000).toFixed(0) + 'k' : avg) + ' Average' };
  }

  if (fieldName === 'salaryUS_min' || fieldName === 'salaryUS_max') {
    const minVals = careerList.map(c => c.salaryUS_min).filter(v => v !== null && v !== undefined);
    const maxVals = careerList.map(c => c.salaryUS_max).filter(v => v !== null && v !== undefined);
    if (minVals.length === 0) return null;
    const avgMin = Math.round(minVals.reduce((a, b) => a + b, 0) / minVals.length);
    const avgMax = Math.round(maxVals.reduce((a, b) => a + b, 0) / maxVals.length);
    const avg = Math.round((avgMin + avgMax) / 2);
    return { display: '$' + (avg >= 1000 ? (avg / 1000).toFixed(0) + 'k' : avg) + ' Average' };
  }

  if (fieldName === 'salaryEU_min' || fieldName === 'salaryEU_max') {
    const minVals = careerList.map(c => c.salaryEU_min).filter(v => v !== null && v !== undefined);
    const maxVals = careerList.map(c => c.salaryEU_max).filter(v => v !== null && v !== undefined);
    if (minVals.length === 0) return null;
    const avgMin = Math.round(minVals.reduce((a, b) => a + b, 0) / minVals.length);
    const avgMax = Math.round(maxVals.reduce((a, b) => a + b, 0) / maxVals.length);
    const avg = Math.round((avgMin + avgMax) / 2);
    return { display: '$' + (avg >= 1000 ? (avg / 1000).toFixed(0) + 'k' : avg) + ' Average' };
  }

  if (fieldName === 'growth') {
    const growths = careerList.map(c => c.growth).filter(g => g);
    if (growths.length === 0) return null;
    // Aggregate by finding most common magnitude
    const mags = {};
    growths.forEach(g => {
      const mag = g.magnitude || 'moderate';
      mags[mag] = (mags[mag] || 0) + 1;
    });
    const mostCommon = Object.keys(mags).reduce((a, b) => mags[a] > mags[b] ? a : b);
    const avgPct = Math.round(growths.reduce((sum, g) => sum + (g.pct || 0), 0) / growths.length);
    return { display: formatGrowth({ magnitude: mostCommon, pct: avgPct }) };
  }

  if (fieldName === 'portability') {
    const portabilities = careerList.map(c => c.portability).filter(p => p);
    if (portabilities.length === 0) return null;
    // Count levels and return most common
    const levels = {};
    portabilities.forEach(p => {
      const level = p.level || 'MEDIUM';
      levels[level] = (levels[level] || 0) + 1;
    });
    const mostCommon = Object.keys(levels).reduce((a, b) => levels[a] > levels[b] ? a : b);
    return { display: formatPortability({ level: mostCommon }) };
  }

  if (fieldName === 'licensing') {
    const licensings = careerList.map(c => c.licensing).filter(l => l);
    if (licensings.length === 0) return null;
    // Count statuses and return most common
    const statuses = {};
    licensings.forEach(l => {
      const status = l.status || 'not_available';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    const mostCommon = Object.keys(statuses).reduce((a, b) => statuses[a] > statuses[b] ? a : b);
    return { display: formatLicensing({ status: mostCommon }) };
  }

  return null;
}

// Display formatters for normalized schema
function setInStatePref(val){S.inStateTuitionPref=val;saveState();document.querySelectorAll('[data-q="inStateTuitionPref"] .pill').forEach(p=>{p.dataset.val===val?p.classList.add('on'):p.classList.remove('on')});if(document.getElementById('uni-content'))renderUniversities();if(document.getElementById('cost-table'))renderCostChips();renderInsights()}
function guidanceMsg(text){return `<div style="padding:12px 16px;background:rgba(59,130,246,.08);border-left:5px solid rgba(59,130,246,.9);border-top:1px solid rgba(59,130,246,.15);border-bottom:1px solid rgba(59,130,246,.15);border-radius:6px;color:var(--tx);font-size:14px;line-height:1.4"><span style="margin-right:8px">👆</span>${text}.</div>`}
function pick1(q,el){document.querySelectorAll(`[data-q="${q}"] .pill`).forEach(o=>o.classList.remove('on'));el.classList.add('on');if(q==='citizen')S.citizen=[el.textContent];else if(q==='flex')S.flex=el.textContent;else if(q==='cost')S.cost=el.textContent;else if(q==='vision')S.vision=el.textContent;else if(q==='lang')S.lang=el.textContent;else if(q==='debtYrs')S.debtYrs=el.textContent;else if(q==='postGrad')S.postGrad=el.textContent;else if(q==='inStateTuitionPref'){S.inStateTuitionPref=el.textContent;if(document.getElementById('cost-table'))renderCostChips()}else if(q==='stateOfResidency'){S.stateOfResidency=el.textContent;S.inStateTuitionPref='in-state-public';if(document.getElementById('uni-content'))renderUniversities();if(document.getElementById('cost-table'))renderCostChips()};saveState();renderInsights()}
function pickN(q,el){el.classList.toggle('on');if(q==='motivations'){S.motivations=[];document.querySelectorAll(`[data-q="${q}"] .pill.on`).forEach(p=>S.motivations.push(p.textContent))}else if(q==='citizen'){S.citizen=[];document.querySelectorAll(`[data-q="${q}"] .pill.on`).forEach(p=>S.citizen.push(p.textContent))}else if(q==='flex'){S.flex=[];document.querySelectorAll(`[data-q="${q}"] .pill.on`).forEach(p=>S.flex.push(p.textContent))}else if(q==='languages'){S.languages=[];document.querySelectorAll(`[data-q="${q}"] .pill.on`).forEach(p=>S.languages.push(p.textContent))}else if(q==='uniSelectivity'){S.uniSelectivity=[];document.querySelectorAll(`[data-q="${q}"] .pill.on`).forEach(p=>S.uniSelectivity.push(p.textContent));document.querySelectorAll(`[data-q="${q}"] .pill`).forEach(p=>{S.uniSelectivity.includes(p.textContent)?p.classList.add('on'):p.classList.remove('on')});if(document.getElementById('uni-content'))renderUniversities()};saveState();renderInsights()}
function initRes(){document.getElementById('res-content').innerHTML=`<div class="qb"><h3 style="font-weight:700;margin-bottom:8px">📚 Career Exploration</h3><ul class="rl"><li><a href="https://www.bls.gov/ooh/" target="_blank">Bureau of Labor Statistics</a> – Careers, outlook, licensing</li><li><a href="https://www.onetonline.org/" target="_blank">O*NET OnLine</a> – Detailed occupation data</li><li><a href="https://www.16personalities.com/" target="_blank">16Personalities</a> – Free assessment</li><li><a href="https://www.linkedin.com/" target="_blank">LinkedIn</a> – Professional network to explore careers and connect with professionals</li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3NDEwIDM5MDAiPjxyZWN0IHdpZHRoPSI3NDEwIiBoZWlnaHQ9IjM5MDAiIGZpbGw9IiNiMjIyMzQiLz48cGF0aCBkPSJNMCAzMDBoNzQxMG0wIDYwMEgwbTAgNjAwaDc0MTBtMCA2MDBIMG0wIDYwMGg3NDEwbTAgNjAwSDBtMCA2MDBoNzQxMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMwMCIvPjxyZWN0IHdpZHRoPSIyOTY0IiBoZWlnaHQ9IjIxMDAiIGZpbGw9IiMzYzNiNmIiLz48L3N2Zz4=" style="height:0.6em;vertical-align:middle;margin-right:6px"/> US Universities & Aid</h3><ul class="rl"><li><a href="https://www.commonapp.org/" target="_blank">Common App</a> – Central application portal</li><li><a href="https://www.niche.com/" target="_blank">Niche</a> – University profiles & rankings</li><li><a href="https://nces.ed.gov/collegenavigator/" target="_blank">College Navigator</a> – Official data on all US colleges</li><li><a href="https://bigfuture.collegeboard.org/" target="_blank">Big Future</a> – College planning guide</li><li><a href="https://studentaid.gov/" target="_blank">FAFSA</a> – US need-based grants eligibility</li><li><a href="https://studentaid.gov/complete-aid-process/how-calculated" target="_blank">How Aid is Calculated (COA/SAI)</a> – Understand financial aid packages</li><li><a href="https://www.fastweb.com/" target="_blank">Fastweb</a> – Large database of external scholarships</li><li><a href="https://www.scholarships.com/" target="_blank">Scholarships.com</a> – Search & matching engine for awards</li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px">📈 Market Demand Data</h3><ul class="rl"><li><a href="https://www.bls.gov/ooh/" target="_blank">BLS Occupational Outlook Handbook</a> – US job outlook and projections</li><li><a href="https://wagedex.com/outlook/" target="_blank">BLS 2023–2033 Projections Index</a> – Occupation growth through 2033</li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MCAzMCI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDEyMTY5Ii8+PHBhdGggZD0iTTAgMEw2MCAzME02MCAwTDAgMzAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI2Ii8+PHBhdGggZD0iTTMwIDB2MzBNMCAxNWg2MCIgc3Ryb2tlPSIjYzgxMDJlIiBzdHJva2Utd2lkdGg9IjQiLz48L3N2Zz4=" style="height:0.6em;vertical-align:middle;margin-right:6px"/> United Kingdom</h3><ul class="rl"><li><a href="https://www.ucas.com/" target="_blank">UCAS</a> – Central application portal for UK universities</li><li><a href="https://www.ucas.com/money-and-student-life/money/scholarships-grants-and-bursaries/eu-and-international-students" target="_blank">UCAS – Scholarships & Bursaries</a> – Guide to funding options for international students</li><li><a href="https://www.chevening.org/" target="_blank">Chevening Scholarships</a> – UK Government scholarship for international students (competitive, merit-based)</li><li><a href="https://study-uk.britishcouncil.org/scholarships-funding" target="_blank">UK Scholarships Finder (British Council)</a> – Database of available funding opportunities</li><li><a href="https://www.ukcisa.org.uk/student-advice/finances/funding-your-studies/" target="_blank">UKCISA – Funding Guide</a> – Comprehensive guide to financing studies in the UK</li><li><a href="https://discoveruni.gov.uk/" target="_blank">Discover Uni</a> – Official university data and comparison tool</li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNiAyMiI+PHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjIyIiBmaWxsPSIjMDA2QUE3Ii8+PHJlY3Qgd2lkdGg9IjYiIGhlaWdodD0iMjIiIHg9IjgiIGZpbGw9IiNGRkNEMDAiLz48cmVjdCB3aWR0aD0iMzYiIGhlaWdodD0iNiIgeT0iOCIgZmlsbD0iI0ZGQ0QwMCIvPjwvc3ZnPg==" style="height:0.6em;vertical-align:middle;margin-right:6px"/> Sweden</h3><ul class="rl"><li><a href="https://www.universityadmissions.se/" target="_blank">University Admissions</a> – Central application portal</li><li><a href="https://studyinsweden.se/" target="_blank">Study in Sweden</a> – Official guide for international students</li><li><a href="https://www.csn.se/languages/english/" target="_blank">CSN</a> – Student grants & loans information</li><li><a href="https://si.se/en/apply/scholarships/" target="_blank">Swedish Institute Scholarships</a> – Merit-based funding</li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPjxyZWN0IHdpZHRoPSI1IiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz48cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSIxIiB5PSIxIiBmaWxsPSIjZDAwIi8+PHJlY3Qgd2lkdGg9IjUiIGhlaWdodD0iMSIgeT0iMiIgZmlsbD0iI2ZmY2UwMCIvPjwvc3ZnPg==" style="height:0.6em;vertical-align:middle;margin-right:6px"/> Germany</h3><ul class="rl"><li><a href="https://www.daad.de/en/" target="_blank">DAAD</a> – Central portal for German universities & scholarships</li><li><a href="https://www.study-in-germany.de/en/" target="_blank">Study in Germany</a> – Official guide & program search</li><li><a href="https://uni-assist.de/" target="_blank">Uni-Assist</a> – Credential evaluation and application processing</li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5IDYiPjxyZWN0IHdpZHRoPSI5IiBoZWlnaHQ9IjIiIGZpbGw9IiNBRTFDMjgiLz48cmVjdCB3aWR0aD0iOSIgaGVpZ2h0PSIyIiB5PSIyIiBmaWxsPSJ3aGl0ZSIvPjxyZWN0IHdpZHRoPSI5IiBoZWlnaHQ9IjIiIHk9IjQiIGZpbGw9IiMyMTQ2OEIiLz48L3N2Zz4=" style="height:0.6em;vertical-align:middle;margin-right:6px"/> Netherlands</h3><ul class="rl"><li><a href="https://www.studyinholland.nl/" target="_blank">Study in Holland</a> – Program search & application info</li><li><a href="https://www.studielink.nl/" target="_blank">Studielink</a> – Central application portal</li><li><a href="https://www.studyinnl.org/finances/nl-scholarship" target="_blank">NL Scholarship</a> – Funding for non-EEA students</li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDIzOTUiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIyIiB4PSIxIiBmaWxsPSIjZmZmIi8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMiIgeD0iMiIgZmlsbD0iI2VjMTQxZSIvPjwvc3ZnPg==" style="height:0.6em;vertical-align:middle;margin-right:6px"/> France</h3><ul class="rl"><li><a href="https://www.campusfrance.org/en" target="_blank">Campus France</a> – Central portal for French universities</li><li><a href="https://www.parcoursup.fr/" target="_blank">Parcoursup</a> – Central application system (public universities)</li><li><a href="https://www.etudiant.gouv.fr/en/financial-support-and-grants-1663" target="_blank">Étudiant.gouv</a> – Financial support & grants information</li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMwMDkyNDYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIyIiB4PSIxIiBmaWxsPSIjZmZmIi8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMiIgeD0iMiIgZmlsbD0iI2NlMmIzNyIvPjwvc3ZnPg==" style="height:0.6em;vertical-align:middle;margin-right:6px"/> Italy</h3><ul class="rl"><li><a href="https://www.universitaly.it/" target="_blank">Universitaly</a> – Central portal for Italian universities</li><li><a href="https://www.polimi.it/en/students/tuition-fees-scholarships-and-financial-aid/" target="_blank">Politecnico di Milano – Financial Aid</a> – Example of Italian university funding</li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMiA4Ij48cmVjdCB3aWR0aD0iMTIiIGhlaWdodD0iMiIgZmlsbD0iI0M2MEIxRSIvPjxyZWN0IHdpZHRoPSIxMiIgaGVpZ2h0PSI0IiB5PSIyIiBmaWxsPSIjRkZDNDAwIi8+PHJlY3Qgd2lkdGg9IjEyIiBoZWlnaHQ9IjIiIHk9IjYiIGZpbGw9IiNDNjBCMUUiLz48L3N2Zz4=" style="height:0.6em;vertical-align:middle;margin-right:6px"/> Spain</h3><ul class="rl"><li><a href="https://www.studyinspain.info/en/" target="_blank">Study in Spain</a> – Official guide & program search</li><li><a href="https://www.becaseducacion.gob.es/" target="_blank">Becas Portal</a> – Scholarships & grants</li><li><a href="https://www.educacionfpydeportes.gob.es/en/servicios-al-ciudadano/catalogo/estudiantes/becas-ayudas/" target="_blank">Ministry of Education – Scholarships & Aid</a></li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNyAyMiI+PHJlY3Qgd2lkdGg9IjM3IiBoZWlnaHQ9IjIyIiBmaWxsPSIjYzgxMDJlIi8+PHJlY3Qgd2lkdGg9IjYiIGhlaWdodD0iMjIiIHg9IjEyIiBmaWxsPSIjZmZmIi8+PHJlY3Qgd2lkdGg9IjM3IiBoZWlnaHQ9IjYiIHk9IjgiIGZpbGw9IiNmZmYiLz48L3N2Zz4=" style="height:0.6em;vertical-align:middle;margin-right:6px"/> Denmark</h3><ul class="rl"><li><a href="https://studyindenmark.dk/" target="_blank">Study in Denmark</a> – Official guide & program search</li><li><a href="https://optagelse.dk/" target="_blank">Optagelse.dk</a> – Central application system</li><li><a href="https://www.su.dk/english/" target="_blank">SU – State Educational Grant</a> – Grants & loans for students</li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjIiIGZpbGw9IiMxNjliNjIiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIyIiB4PSIxIiBmaWxsPSIjZmZmIi8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMiIgeD0iMiIgZmlsbD0iI2ZmODgwMCIvPjwvc3ZnPg==" style="height:0.6em;vertical-align:middle;margin-right:6px"/> Ireland</h3><ul class="rl"><li><a href="https://www.cao.ie/" target="_blank">CAO</a> – Central application system</li><li><a href="https://www.educationinireland.com/" target="_blank">Education in Ireland</a> – Official guide & program search</li><li><a href="https://www.susi.ie/" target="_blank">SUSI</a> – Student grants for eligible students</li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPjxyZWN0IHdpZHRoPSI1IiBoZWlnaHQ9IjMiIGZpbGw9IiNmZjAwMDAiLz48cmVjdCB3aWR0aD0iMyIgaGVpZ2h0PSIzIiB4PSIxIiBmaWxsPSIjZmZmIi8+PHBvbHlnb24gcG9pbnRzPSIyLjUsMC43NSAyLjksMS45NSA0LjEsMS45NSAzLjIsMi42NSAzLjYsMy44NSAyLjUsMy4xNSAxLjQsMy44NSAxLjgsMi42NSAwLjksMS45NSAyLjEsMS45NSIgZmlsbD0iI2ZmMDAwMCIvPjwvc3ZnPg==" style="height:0.6em;vertical-align:middle;margin-right:6px"/> Canada</h3><ul class="rl"><li><a href="https://www.universitystudy.ca/" target="_blank">Universities Canada</a> – University information & rankings</li><li><a href="https://www.educanada.ca/" target="_blank">EduCanada</a> – Official guide for international students</li><li><a href="https://www.canada.ca/en/services/finance/educationfunding/scholarships.html" target="_blank">Canada.ca Scholarships</a> – Federal scholarship overview</li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px">🎯 Standardized Testing</h3><ul class="rl"><li><a href="https://satsuite.collegeboard.org/" target="_blank">SAT</a> – US university entrance exam</li><li><a href="https://www.act.org/" target="_blank">ACT</a> – Alternative US entrance exam</li><li><a href="https://www.khanacademy.org/" target="_blank">Khan Academy</a> – Free SAT/ACT prep</li></ul></div><div class="qb"><h3 style="font-weight:700;margin-bottom:8px">📋 Credential Evaluation</h3><ul class="rl"><li><a href="https://www.wes.org/" target="_blank">World Education Services (WES)</a> – US credential evaluation</li><li><a href="https://www.enic-naric.net/" target="_blank">ENIC-NARIC</a> – European credential recognition</li></ul></div>`}
// ===== UNIVERSITIES HELPERS (loaded from universities.json) =====
let UNIVERSITIES = [];
let UNIVERSITIES_LOADED = false;

async function loadUniversitiesData() {
  try {
    const response = await fetch('./data/universities.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    UNIVERSITIES = data;
    UNIVERSITIES_LOADED = true;
    const total = UNIVERSITIES.length;
    console.log(`✓ Loaded universities.json: ${total} universities`);
    return true;
  } catch (error) {
    console.error('✗ Failed to load universities.json:', error.message);
    return false;
  }
}

// ===== INSIGHTS ENGINE =====
// INSIGHTS moved to insights.json
let INSIGHTS = {};
let INSIGHTS_LOADED = false;

async function loadInsightsData() {
  try {
    const response = await fetch('./data/insights.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    INSIGHTS = data;
    INSIGHTS_LOADED = true;
    console.log('✓ Loaded insights.json');
    return true;
  } catch (error) {
    console.error('✗ Failed to load insights.json:', error.message);
    return false;
  }
}

function getCareerInsight(career, motivation) {
  if (!motivation || !INSIGHTS.careersDrives[motivation]) {
return null;
  }
  
  // Map specific careers to categories
  const careerMap = {
    'Accounting': 'Business/Finance',
    'Economics': 'Business/Finance',
    'Entrepreneurship': 'Business/Finance',
    'Nursing': 'Science/Research',
    'Pharmacy': 'Science/Research',
    'Chemistry': 'Science/Research',
    'Physics': 'Science/Research',
    'Cybersecurity': 'Tech/Engineering',
    'Architecture': 'Tech/Engineering'
  };
  
  const category = careerMap[career] || career;
  const result = INSIGHTS.careersDrives[motivation][category];
return result;
}

function getCountryInsight(country, vision) {
  if (!vision) return null;
  if (!INSIGHTS.countriesVision[vision]) return null;
  return INSIGHTS.countriesVision[vision][country];
}

function getCostInsight(selectedCountries, cost) {
  if (!cost || !selectedCountries || selectedCountries.length === 0) return null;
  const avgCost = selectedCountries.reduce((sum, k) => sum + (getCountryCostTuition(k) || 0), 0) / selectedCountries.length;
  const isExpensive = avgCost > 30000;
  const key = isExpensive ? 'expensive' : 'affordable';
  return INSIGHTS.costPriority[cost]?.[key];
}

function getLanguageInsight(country, aptitude) {
  if (!country || !aptitude) return null;
  const isEnglish = (getCountryLanguage(country) || '').toLowerCase().includes('english');
  const key = isEnglish ? 'english' : 'non_english';
  return INSIGHTS.languageAptitude[aptitude]?.[key];
}

function getCitizenshipInsight(country, citizenship) {
  if (!country || !citizenship) return null;
  const countryKey = ['sweden', 'uk', 'germany', 'netherlands', 'france', 'italy', 'spain', 'denmark', 'ireland', 'no', 'ch'].includes(country) ? 'eu' : 'us';
  const dualKey = 'dual_us_eu';
  const key = countryKey === 'eu' ? dualKey : countryKey;
  return INSIGHTS.citizenship[citizenship]?.[key];
}

function getDebtInsight(selectedCountries, debtYears) {
  if (!debtYears || !selectedCountries || selectedCountries.length === 0) return null;
  // Placeholder - can add debt-based insights if needed
  return null;
}


// ===== NARRATIVE-AWARE INSIGHTS =====
// These functions ONLY return insights when there's a real data match


// ===== END NARRATIVE-AWARE INSIGHTS =====

function buildNarrative() {
  let parts = [];

  // Helper to wrap text in highlight tag
  const hl = (text) => `<span class="highlight-tag">${text}</span>`;

  // Citizenship
  let hasCitizen = false;
  if (S.citizen && S.citizen.length > 0) {
    const citizenText = S.citizen.join('/');
    // Use "an" for vowel sounds: EU, Dual. Use "a" for consonants: US, US/EU
    const article = citizenText.startsWith('E') || citizenText.startsWith('D') ? 'an' : 'a';
    parts.push(`You are ${article} ${hl(citizenText)} citizen`);
    hasCitizen = true;
  }

  // Categories and careers
  let careerPart = '';
  if (S.cats && S.cats.length > 0) {
    const catNames = S.cats.map(c => hl(getCategoryName(c))).join(', ');
    careerPart = `interested in ${catNames}`;
    if (S.subCareers && S.subCareers.length > 0) {
      const careers = S.subCareers.map(c => hl(c));
      if (careers.length === 1) {
        careerPart += ` — in particular ${careers[0]}`;
      } else {
        careerPart += ` — in particular ${careers.slice(0, -1).join(', ')}, and ${careers[careers.length - 1]}`;
      }
    }
  }
  if (careerPart) {
    // If we have citizenship, connect with space. If not, start with "You're"
    if (hasCitizen) {
      parts.push(` ${careerPart}`);
    } else {
      parts.push(`You're ${careerPart}`);
    }
  }

  // Motivations
  if (S.motivations && S.motivations.length > 0) {
    const motivations = S.motivations.map(m => hl(m)).join(', ');
    parts.push(`. You're driven by ${motivations}`);
  }

  // Flexibility + Vision combined
  let studyVisionPart = '';
  if (S.flex || S.vision) {
    studyVisionPart = '. You envision ';

    // Flexibility (where to study)
    if (S.flex && S.flex.length > 0) {
      const flexMap = {
        "Study in the US": "studying in the US",
        "Study in Europe": "studying in Europe"
      };
      const flexTexts = S.flex.map(f => hl(flexMap[f] || f.toLowerCase()));
      studyVisionPart += flexTexts.join(" and ");
    }

    // Vision (where living/working in 5 years)
    if (S.vision) {
      const visionMap = {
        'In the US': 'living and working in the US in 5 years',
        'Abroad': 'living and working abroad in 5 years',
        'Anywhere globally': 'living and working anywhere in 5 years'
      };
      const visionText = visionMap[S.vision] || '';
      const highlightedVision = hl(visionText);
      // Add "and" only if flex exists, otherwise just start with "living"
      if (S.flex) {
        studyVisionPart += ' and ' + highlightedVision;
      } else {
        studyVisionPart += highlightedVision;
      }
    }

    parts.push(studyVisionPart);
  }

  // Language - comes after vision with comma
  if (S.lang) {
    const langMap = {
      'Slower language learner': 'slower language learner',
      'Normal language learner': 'average language learner',
      'Natural linguist': 'natural linguist'
    };

    const langText = hl(langMap[S.lang] || S.lang.toLowerCase());
    // If there's a vision sentence, add with comma. Otherwise start new sentence.
    if (S.vision || S.flex) {
      parts.push(`, as a ${langText}`);
    } else {
      parts.push(`. You are a ${langText}`);
    }
  }

  // Cost sensitivity
  if (S.cost) {
    const costMap = {
      "Not critical": "manageable",
      "Balanced with other factors": "matters a lot",
      "Critical": "critical"
    };
    const costText = costMap[S.cost] || S.cost.toLowerCase();
    const highlightedCost = hl(costText);
    // Use "is" for single words (manageable, critical), omit for phrases (matters a lot)
    const costSentence = costText.includes(' ')
      ? `. Cost ${highlightedCost} for you`
      : `. Cost is ${highlightedCost} for you`;
    parts.push(costSentence);
  }

  // Debt tolerance
  if (S.debtYrs) {
    const highlightedDebt = hl(S.debtYrs);
    if (S.cost) {
      // Comma conjunction if cost exists
      parts.push(`, and you're willing to carry loan debt for ${highlightedDebt}`);
    } else {
      // New sentence if no cost
      parts.push(`. You're willing to carry loan debt for ${highlightedDebt}`);
    }
  }
  
  const narrative = parts.join('');
  if (narrative && narrative !== 'You are a' && narrative !== 'You are an') {
    return narrative + '.';
  } else {
    return 'Build your profile by making selections on Discovery tab.';
  }
}

function updateNarrative() {
  const narrative = buildNarrative();
  const narrativeEl = document.getElementById('narrative-summary');
  if (narrativeEl) {
    narrativeEl.innerHTML = '👍 ' + narrative;
  }
}

function validateSelections(){const issues=[];if(!S.cats||S.cats.length===0)issues.push('No careers selected');if(!S.cc||S.cc.length===0)issues.push('No countries selected');if(S.cost===null)issues.push('Cost preference not set');return issues;}
function generateCareersInsights(){const insights=[];if(!S.cats||S.cats.length===0)return insights;if(S.motivations&&S.motivations.length>0){if(S.motivations.includes('Making real impact'))insights.push({align:true,msg:'💡 Jobs in social good, healthcare, education align with your impact motivation.'});if(S.motivations.includes('Financial security'))insights.push({align:true,msg:'💰 Tech, finance, engineering offer strong earning potential.'});if(S.motivations.includes('Creative expression'))insights.push({align:true,msg:'🎨 Creative/Arts careers support your expression needs.'});if(S.motivations.includes('Intellectual challenge'))insights.push({align:true,msg:'🧠 Research, science, advanced tech provide intellectual challenge.'})}if(S.vision==='In Europe'&&S.cats.some(c=>['tech','eng','sci'].includes(c)))insights.push({align:true,msg:'🌍 Tech/science careers are globally portable for working abroad.'});if(S.lang==='Slower language learner')insights.push({align:false,msg:'⚠️ Many international careers need multilingual skills. Consider this.'});if(S.lang==='Slower language learner'&&S.cc.some(c=>['france','spain','germany'].includes(c)))insights.push({align:false,msg:'⚠️ France/Spain/Germany often require native language skills'});return insights}function generateCountriesInsights(){const insights=[];if(!S.cc||S.cc.length===0)return insights;const eu=['sweden','uk','germany','netherlands','france','italy','spain','denmark','ireland','no','ch'];const hasEU=S.cc.some(c=>eu.includes(c));const hasUS=S.cc.some(c=>c==='us');if(S.vision==='In Europe'&&hasEU)insights.push({align:true,msg:'✅ EU countries align with your vision to work abroad in 5 years.'});if(S.vision==='In the US'&&hasEU)insights.push({align:false,msg:'⚠️ You prefer staying in the US, but selected EU countries. Reconsider alignment.'});if(S.vision==='In the US'&&!hasUS)insights.push({align:false,msg:'⚠️ You want to stay in US but haven\'t selected US universities'});if(S.cost==='Critical')insights.push({align:false,msg:'💡 Cost is critical. Compare tuition carefully across countries.'});if(S.lang==='Slower language learner'&&S.cc.some(c=>['sweden','netherlands'].includes(c)))insights.push({align:true,msg:'✅ Sweden & Netherlands offer English-taught programs.'});return insights}function generateCostsInsights(){const insights=[];if(!S.cost)return insights;if(S.cost==='Critical')insights.push({align:false,msg:'🎯 Cost is critical. Focus on scholarships and financial aid.'});else if(S.cost==='Not critical')insights.push({align:true,msg:'✅ With flexibility on cost, you have more university options'});else if(S.cost==='Balanced with other factors')insights.push({align:true,msg:'💰 Balance cost with program quality and career outcomes.'});if(S.debtYrs==='5 years')insights.push({align:true,msg:'💡 With 5-year debt tolerance, prioritize scholarships and lower-cost programs.'});return insights}function generateFilterInsights(){const insights=[];if(!S.prac||S.prac.length===0)return insights;const practiceLocation=S.prac;const careerPortability=S.subCareers.length>0;if(S.vision==='In Europe'&&careerPortability)insights.push({align:true,msg:'✅ Your portable careers support working in '+practiceLocation+' long-term.'});if(S.motivations.includes('Independence & flexibility'))insights.push({align:true,msg:'✅ Portable credentials give you the flexibility and independence you seek.'});return insights}function generateScholarshipInsights(){const insights=[];if(!S.cc||S.cc.length===0)return insights;if(S.citizen&&S.citizen.length>0){const hasEU=S.citizen.includes('EU');const hasUS=S.citizen.includes('US');if(hasEU)insights.push({align:true,msg:'✅ EU citizens often qualify for tuition-free or reduced programs in European universities.'});if(hasUS)insights.push({align:false,msg:'⚠️ As a US citizen, you typically pay international rates. Focus on merit scholarships.'})}if(S.cost==='Critical')insights.push({align:false,msg:'🎯 Cost is critical for you. Maximize scholarships and financial aid to reduce out-of-pocket costs.'});return insights}

function displayTabInsights(tabName){
// Removed - insights now shown in table columns
}

function updateInsights(tabName) {
  // Removed - insights now shown in table columns
}
// ===== END INSIGHTS ENGINE =====

// ===== MOBILE CAROUSEL HANDLER =====
function initCarousel(wrapperId, containerSelector = '.carousel-container') {
  const wrap = document.getElementById(wrapperId);
  if (!wrap) return;
  
  const container = wrap.querySelector(containerSelector);
  if (!container) return;
  
  // Sync label heights to content row heights (for scholarship-style carousels)
  function syncLabelHeights() {
    const cards = container.querySelectorAll('.carousel-card');
    cards.forEach(card => {
      const labels = card.querySelectorAll('.carousel-card-label');
      const rows = card.querySelectorAll('.carousel-card-row');
      
      labels.forEach((label, idx) => {
        if (rows[idx]) {
          const rowHeight = rows[idx].offsetHeight;
          label.style.minHeight = rowHeight + 'px';
        }
      });
    });
  }
  
  // Sync after a short delay to allow content to render
  setTimeout(syncLabelHeights, 50);
  // Also sync on window resize
  window.addEventListener('resize', syncLabelHeights);
  
  let isDown = false;
  let startX;
  let scrollLeft;
  let lastX;
  let lastTime;
  let velocity = 0;
  const GAP = 6; // all carousels have 6px gap
  
  // Get cards - handle .carousel-card, .insights-carousel-card, and .uni-* types
  let cards = container.querySelectorAll('.carousel-card');
  if (cards.length === 0) {
    cards = container.querySelectorAll('.insights-carousel-card');
  }
  if (cards.length === 0) {
    cards = container.querySelectorAll('.uni-country-slide, .uni-card');
  }
  if (cards.length === 0) return;
  
  const cardWidth = cards[0].offsetWidth;
  const cardWithGap = cardWidth + GAP;
  
  function updateIndicator() {
    const scrollPos = container.scrollLeft;
    const cardNum = Math.round(scrollPos / cardWithGap) + 1;
    const total = cards.length;
    const indicator = wrap.querySelector('.carousel-indicator, .uni-inner-indicator');
    if (indicator) {
      indicator.textContent = containerSelector.includes('uni-inner') 
        ? `University ${Math.min(cardNum, total)} of ${total}`
        : `Card ${Math.min(cardNum, total)} of ${total}`;
    }
  }
  
  function snapToCard(useVelocity = false) {
    const scrollPos = container.scrollLeft;
    let nearestCard = Math.round(scrollPos / cardWithGap);
    
    // If swiping with momentum, check velocity to flip to next/prev card
    if (useVelocity && Math.abs(velocity) > 0.3) {
      if (velocity > 0) {
        // Swiping right (scrolling left), go to next card
        nearestCard = Math.ceil(scrollPos / cardWithGap);
      } else {
        // Swiping left (scrolling right), go to previous card
        nearestCard = Math.floor(scrollPos / cardWithGap);
      }
    }
    
    const targetScroll = Math.max(0, nearestCard * cardWithGap);
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
    setTimeout(updateIndicator, 50);
  }
  
  container.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    lastX = startX;
    lastTime = Date.now();
    velocity = 0;
    container.style.cursor = 'grabbing';
  });
  
  container.addEventListener('mouseleave', () => {
    if (isDown) {
      isDown = false;
      container.style.cursor = 'grab';
      snapToCard(true);
    }
  });
  
  container.addEventListener('mouseup', () => {
    isDown = false;
    container.style.cursor = 'grab';
    snapToCard(true);
  });
  
  container.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = x - startX;
    container.scrollLeft = scrollLeft - walk;
    
    const now = Date.now();
    const dt = Math.max(now - lastTime, 1);
    velocity = (lastX - x) / dt;
    lastX = x;
    lastTime = now;
  });
  
  // Touch support with momentum detection
  container.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    lastX = startX;
    lastTime = Date.now();
    velocity = 0;
  }, { passive: true });
  
  container.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = x - startX;
    container.scrollLeft = scrollLeft - walk;
    
    const now = Date.now();
    const dt = Math.max(now - lastTime, 1);
    velocity = (lastX - x) / dt;
    lastX = x;
    lastTime = now;
  }, { passive: true });
  
  container.addEventListener('touchend', () => {
    isDown = false;
    snapToCard(true);
  }, { passive: true });
  
  container.addEventListener('scroll', updateIndicator);
  
  // Initial indicator update
  setTimeout(updateIndicator, 100);
}


// Export all functions to window for global access
window.getCountryName = getCountryName;
window.getCountryFlag = getCountryFlag;
window.getCountryTuition = getCountryTuition;
window.getCountryDuration = getCountryDuration;
window.getCountryLanguage = getCountryLanguage;
window.getCountryDetails = getCountryDetails;
window.getCountryFunding = getCountryFunding;
window.getCountryAllData = getCountryAllData;
window.getCountryChangePolicy = getCountryChangePolicy;
window.getCountryPostGradOpportunities = getCountryPostGradOpportunities;
window.getCountryFinancialAid = getCountryFinancialAid;
window.getCountryAdmissions = getCountryAdmissions;
window.getCountryCulture = getCountryCulture;
window.getCountryPortal = getCountryPortal;
window.getCountryTuitionNote = getCountryTuitionNote;
window.getCountryCostBreakdown = getCountryCostBreakdown;
window.getCountryCostTuition = getCountryCostTuition;
window.getCountryCostRoom = getCountryCostRoom;
window.getCountryCostBooks = getCountryCostBooks;
window.getCountryCostPersonal = getCountryCostPersonal;
window.getCountryCostTravel = getCountryCostTravel;
window.getCountryNeed = getCountryNeed;
window.getCountryMerit = getCountryMerit;
window.getCountryExternal = getCountryExternal;
window.getCountryFree = getCountryFree;
window.getCountryScholarshipTimeline = getCountryScholarshipTimeline;
window.getCountryScholarshipLinks = getCountryScholarshipLinks;
window.getCountryResources = getCountryResources;
window.getCountryPhotos = getCountryPhotos;
window.getCountrySteps = getCountrySteps;
window.getCountryFaqs = getCountryFaqs;
window.updateCountry = updateCountry;
window.getCountrySchemaTemplate = getCountrySchemaTemplate;
window.getCareerByName = getCareerByName;
window.getCareerEducation = getCareerEducation;
window.getCareerCostUS = getCareerCostUS;
window.getCareerCostEU = getCareerCostEU;
window.getCareerSalaryUS = getCareerSalaryUS;
window.getCareerSalaryEU = getCareerSalaryEU;
window.getCareerGrowth = getCareerGrowth;
window.getCareerPortability = getCareerPortability;
window.getCareerLicensing = getCareerLicensing;
window.getCareerResources = getCareerResources;
window.getCategorySubjects = getCategorySubjects;
window.getCategoryName = getCategoryName;
window.initRes = initRes;
window.getCareerInsight = getCareerInsight;
window.getCountryInsight = getCountryInsight;
window.getCostInsight = getCostInsight;
window.getLanguageInsight = getLanguageInsight;
window.getCitizenshipInsight = getCitizenshipInsight;
window.getDebtInsight = getDebtInsight;
window.generateCareersInsights = generateCareersInsights;
window.generateCountriesInsights = generateCountriesInsights;
window.generateCostsInsights = generateCostsInsights;
window.generateFilterInsights = generateFilterInsights;
window.generateScholarshipInsights = generateScholarshipInsights;
window.updateInsights = updateInsights;
window.saveState = saveState;
window.loadState = loadState;
window.loadCountriesData = loadCountriesData;
window.loadCareersData = loadCareersData;
window.loadPathfinderData = loadPathfinderData;
window.loadStateNamesData = loadStateNamesData;
window.loadSelectorOptionsData = loadSelectorOptionsData;
window.loadUniversitiesData = loadUniversitiesData;
window.loadInsightsData = loadInsightsData;
