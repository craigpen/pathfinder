// University Pathfinder - Rendering Functions
// All render* and format* functions for the university pathfinder

// ===== MODULE-LEVEL VARIABLES =====
let hdrIdx = 0, hdrTimer = null, hdrPaused = false, hdrPoolKey = '';
const BAD_IMG_CACHE = new Set();
// Note: UNIVERSITIES, UNIVERSITIES_LOADED, INSIGHTS, INSIGHTS_LOADED are declared in helpers.js

function formatMoneyRange(min, max) {
  if (min === null || max === null) return '—';
  const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(0) + 'k' : n.toString());
  return '$' + fmt(min) + '–$' + fmt(max);
}

function formatEducationSummary(eduObj) {
  if (!eduObj || !eduObj.degrees) return '—';
  const degreesByNorm = {};
  for (const deg of eduObj.degrees) {
    const norm = deg.norm || 'required';
    if (!degreesByNorm[norm]) degreesByNorm[norm] = [];
    degreesByNorm[norm].push(deg.names[0]);
  }
  const parts = [];
  for (const norm of ['required', 'typical', 'optional']) {
    if (degreesByNorm[norm]) {
      const degrees = degreesByNorm[norm];
      // Join multiple degrees with commas, using "and" before the last item
      let degreeStr;
      if (degrees.length === 1) {
        degreeStr = degrees[0];
      } else if (degrees.length === 2) {
        degreeStr = degrees.join(' and ');
      } else {
        degreeStr = degrees.slice(0, -1).join(', ') + ' and ' + degrees[degrees.length - 1];
      }
      parts.push(degreeStr + ' ' + norm);
    }
  }
  return parts.length > 0 ? parts.join(', ') : '—';
}

function formatGrowth(growthObj) {
  if (!growthObj || growthObj.pct === null) return '—';
  const magnitude = (growthObj.magnitude || 'moderate').replace(/_/g, ' ');
  const mag = magnitude.charAt(0).toUpperCase() + magnitude.slice(1);
  return mag + ' (' + (growthObj.pct > 0 ? '+' : '') + growthObj.pct + '%)';
}

function formatPortability(portObj) {
  if (!portObj) return '—';
  const level = portObj.level ? portObj.level.charAt(0).toUpperCase() + portObj.level.slice(1).toLowerCase() : '—';
  if (portObj.qualifier) return level + ' (' + portObj.qualifier + ')';
  return level;
}

function formatLicensing(licObj) {
  if (!licObj) return '—';
  const statusMap = { 'required': 'Required', 'optional': 'Optional', 'not_available': 'Not required' };
  const status = licObj.status ? statusMap[licObj.status] || licObj.status.charAt(0).toUpperCase() + licObj.status.slice(1) : '—';
  const parts = [status];
  if (licObj.type && licObj.type.length > 0) {
    parts.push('(' + (Array.isArray(licObj.type) ? licObj.type.join(', ') : licObj.type) + ')');
  }
  return parts.join(' ');
}

function formatDemand(demandObj) {
  if (!demandObj || demandObj.pct === null) return '—';
  return (demandObj.pct > 0 ? '+' : '') + demandObj.pct + '%';
}

function getCareersSchemaTemplate() {
  return {
    name: 'Career Name',
    education: 'Education requirement',
    costUS: 0,
    costEU: 0,
    salaryUS: 'Salary range',
    salaryEU: 'Salary range',
    growth: 'Job growth rate',
    portability: 'Portability level',
    licensing: 'Licensing info',
    typicalPostGraduateYears: 0,
    postGraduateFunded: false,
    resources: [{ title: 'Resource Title', url: 'https://example.com' }]
  };
}

function validateCareersJSON(jsonContent) {
  try {
    const data = JSON.parse(jsonContent);
    if (typeof data !== 'object' || Array.isArray(data)) {
      return { valid: false, error: 'careers.json must be an object with career fields' };
    }
    return { valid: true, total: Object.keys(data).length };
  } catch (e) {
    return { valid: false, error: `JSON parse error: ${e.message}` };
  }
}

function debugCareer(name) {
  const career = getCareerByName(name);
  if (!career) {
    console.log(`Career not found: ${name}`);
    return null;
  }
  console.group(`Career: ${name}`);
  console.log(`Category: ${career.category}`);
  console.log(`Education: ${formatEducationSummary(career.data.education)}`);
  console.log(`Cost (US): ${formatMoneyRange(career.data.costUS_min, career.data.costUS_max)}`);
  console.log(`Cost (EU): ${formatMoneyRange(career.data.costEU_min, career.data.costEU_max)}`);
  console.log(`Salary (US): ${formatMoneyRange(career.data.salaryUS_min, career.data.salaryUS_max)}`);
  console.log(`Salary (EU): ${formatMoneyRange(career.data.salaryEU_min, career.data.salaryEU_max)}`);
  console.log(`Growth: ${formatGrowth(career.data.growth)}`);
  console.log(`Portability: ${formatPortability(career.data.portability)}`);
  console.log(`Licensing: ${formatLicensing(career.data.licensing)}`);
  console.groupEnd();
  return career.data;
}

// ===== UNIVERSITIES HELPERS =====
// loadUniversitiesData is defined in helpers.js

function getUniversity(name) {
  if (!name) return null;
  return UNIVERSITIES.find(u => u.name === name) || null;
}

function getUniversitiesByCountry(countryCode) {
  if (!countryCode) return [];
  return UNIVERSITIES.filter(u => u.country === countryCode);
}

function getUniversitiesByProgram(program) {
  if (!program) return [];
  return UNIVERSITIES.filter(u => u.programs && u.programs.includes(program));
}

function getUniversitiesBySelectivity(level) {
  if (!level) return [];
  return UNIVERSITIES.filter(u => u.selectivity === level);
}

function validateUniversitySchema(uni) {
  const required = ['name', 'country', 'city', 'type', 'qs_rank', 'acceptance_rate', 'student_pop', 'tuition', 'language', 'strengths', 'selectivity', 'programs'];
  const errors = [];
  for (const field of required) {
    if (!(field in uni)) errors.push(`Missing field: ${field}`);
  }
  return errors.length === 0 ? true : errors;
}

function validateAllUniversities() {
  const invalid = [];
  UNIVERSITIES.forEach((uni, idx) => {
    const result = validateUniversitySchema(uni);
    if (result !== true) invalid.push({ index: idx, name: uni.name, errors: result });
  });
  return { total: UNIVERSITIES.length, valid: UNIVERSITIES.length - invalid.length, invalid: invalid.length, details: invalid.length > 0 ? invalid : null };
}

function debugUniversity(name) {
  const uni = getUniversity(name);
  if (!uni) {
    console.log(`University not found: ${name}`);
    return null;
  }
  console.group(`University: ${name}`);
  console.log(`Country: ${uni.country}`);
  console.log(`City: ${uni.city}`);
  console.log(`Type: ${uni.type}`);
  console.log(`QS Rank: ${uni.qs_rank}`);
  console.log(`Acceptance Rate: ${uni.acceptance_rate}%`);
  console.log(`Student Population: ${uni.student_pop}`);
  console.log(`Annual Tuition: $${uni.tuition}`);
  console.log(`Language: ${uni.language}`);
  console.log(`Selectivity: ${uni.selectivity}`);
  console.log(`Strengths:`, uni.strengths);
  console.log(`Programs:`, uni.programs);
  console.groupEnd();
  return uni;
}

function debugAllUniversities() {
  const validation = validateAllUniversities();
  console.group('All Universities Validation Summary');
  console.log(`Total: ${validation.total}`);
  console.log(`Valid: ${validation.valid}`);
  console.log(`Invalid: ${validation.invalid}`);
  if (validation.details) console.log('Invalid details:', validation.details);
  console.log('Sample universities:', UNIVERSITIES.slice(0, 3).map(u => u.name));
  console.groupEnd();
  return validation;
}

// ===== Header image carousel (dynamic by selected country) =====
// --- Image URL health check (filters 404/broken images) ---
function imgOk(url){
  return new Promise((resolve)=>{
    if(!url) return resolve(false);
    const raw = String(url).trim();
    if(!raw) return resolve(false);
    if(raw.startsWith('data:')) return resolve(true);
    if(BAD_IMG_CACHE.has(raw)) return resolve(false);
    const im = new Image();
    const done = (ok)=>{
      im.onload = im.onerror = null;
      if(!ok) BAD_IMG_CACHE.add(raw);
      resolve(ok);
    };
    im.onload = ()=>done(true);
    im.onerror = ()=>done(false);
    // use wideImg so we test the exact URL that will be rendered
    im.src = wideImg(raw);
  });
}
async function filterBroken(pool){
  const out=[];
  for(const p of (pool||[])){
    const raw = p && p.src ? String(p.src).split('?')[0].trim() : '';
    if(!raw) continue;
    if(BAD_IMG_CACHE.has(raw)) continue;
    // eslint-disable-next-line no-await-in-loop
    const ok = await imgOk(raw);
    if(ok) out.push({src: raw, cap: p.cap || ''});
  }
  return out;
}

function headerImagePool(){
 // Priority: Deep Dive selection (S.expl) -> single selected country in Countries tab -> all selected -> all countries
 const active = S.expl || ((Array.isArray(S.cc) && S.cc.length===1) ? S.cc[0] : null);
 const keys = active ? [active] : ((Array.isArray(S.cc) && S.cc.length) ? [...S.cc] : Object.keys(COUNTRIES));
 const pool=[];
 keys.forEach(k=>{
   const photos = getCountryPhotos(k) || [];
   photos.forEach(p=>{
     const raw = (p && p.src) ? String(p.src).split('?')[0] : '';
     if(!raw) return;
     pool.push({ src: raw, cap: (p.cap||'') });
   });
 });
 return pool.length ? pool : HEADER_PHOTOS;
}

// University-specific header carousel (uses country-based photos)
function startHdrCarousel(){
  if(hdrTimer) clearInterval(hdrTimer);
  bindHdrHoverPause();
  const pool = headerImagePool();
  // Filter broken/404 images before rendering
  Promise.resolve(filterBroken(pool)).then((goodPool)=>{
    const finalPool = (goodPool && goodPool.length) ? goodPool : HEADER_PHOTOS;
    const key = poolKeyFor(finalPool);
    let imgs;
    if(key !== hdrPoolKey){
      hdrPoolKey = key;
      imgs = renderHdrImages(finalPool);
    } else {
      const bg=document.getElementById('hdr-bg');
      imgs = bg ? [...bg.querySelectorAll('img')] : [];
    }
    if(!imgs || !imgs.length) return;
    imgs.forEach((im,i)=>im.classList.toggle('active', i===0));
    hdrIdx=0;
    hdrTimer=setInterval(()=>{
      if(hdrPaused) return;
      imgs[hdrIdx].classList.remove('active');
      hdrIdx=(hdrIdx+1)%imgs.length;
      imgs[hdrIdx].classList.add('active');
    }, 10000);
  }).catch(()=>{
    const bg=document.getElementById('hdr-bg');
    const imgs = bg ? [...bg.querySelectorAll('img')] : [];
    if(!imgs || !imgs.length) return;
    imgs.forEach((im,i)=>im.classList.toggle('active', i===0));
    hdrIdx=0;
    hdrTimer=setInterval(()=>{
      if(hdrPaused) return;
      imgs[hdrIdx].classList.remove('active');
      hdrIdx=(hdrIdx+1)%imgs.length;
      imgs[hdrIdx].classList.add('active');
    }, 10000);
  });
}
function updateHdrCarousel(){startHdrCarousel();}
// go() function now in framework.js; this handles university-specific tab renders
function renderPathfinderTab(id){if(id==='discover')renderDiscoveryPills();else if(id==='careers'){renderCareerView();renderSubPills();renderFilterAnalysis();renderFilterResult()}else if(id==='countries'){renderCCChips();updateHdrCarousel()}else if(id==='scholarships')renderScholar();else if(id==='universities')renderUniversities();else if(id==='costs'){S.costCC=[...S.cc];renderCostChips()}else if(id==='transition'){renderTransition()}else if(id==='insights'){renderInsights()}else if(id==='deepDive'){if(!S.expl&&S.cc&&S.cc.length)S.expl=S.cc[0];renderExChips();renderPath(S.expl);}}
function startOver(){S.cats=[];S.motivations=[];S.subCareers=[];S.prac=[];S.cc=[];S.costCC=[];S.expl=null;S.playlist=null;S.flex=null;S.cost=null;S.vision=null;S.lang=null;S.postGrad=null;S.citizen=[];S.debtYrs=null;S.languages=[];S.stateOfResidency=null;S.inStateTuitionPref=null;S.uniSelectivity=null;S.usUniversityType=null;S.inStateToggle=false;S.scholarshipAmount=null;S.collegeSavings=null;S.partTimeWork=null;S.familySupport=null;S.loanRate=null;S.loanRepaymentYears=null;document.getElementById('sl-schol').value=0;document.getElementById('sl-savings').value=0;document.getElementById('sl-work').value=0;document.getElementById('sl-parent').value=0;document.getElementById('sl-rate').value=5.5;document.getElementById('sl-yrs').value=10;localStorage.removeItem('univPathfinderState');document.querySelectorAll('.pill').forEach(o=>o.classList.remove('on'));document.querySelectorAll('.pill').forEach(p=>p.classList.remove('on'));document.getElementById('playlist-pills').classList.remove('show');document.getElementById('spotify-wrap').classList.remove('show');document.getElementById('transition-content').innerHTML='';go('discover')}
function initDiscover(){const dr=document.getElementById('motivation-opts');['Making real impact','Intellectual challenge','Creative expression','Financial security','Helping people','Independence & flexibility'].forEach(d=>{const el=document.createElement('div');el.className='pill';el.textContent=d;el.onclick=()=>{el.classList.toggle('on');if(S.motivations.includes(d)){S.motivations=S.motivations.filter(x=>x!==d)}else S.motivations.push(d);saveState()};dr.appendChild(el)})};function renderDiscoveryPills(){document.querySelectorAll('#motivation-opts .pill').forEach(p=>{if(S.motivations.includes(p.textContent))p.classList.add('on');else p.classList.remove('on')});document.querySelectorAll('[data-q="flex"] .pill').forEach(p=>{if(S.flex&&S.flex.includes(p.textContent))p.classList.add('on');else p.classList.remove('on')});document.querySelectorAll('[data-q="stateOfResidency"] .pill').forEach(p=>{if(p.textContent===S.stateOfResidency)p.classList.add('on');else p.classList.remove('on')});document.querySelectorAll('[data-q="cost"] .pill').forEach(p=>{if(p.textContent===S.cost)p.classList.add('on');else p.classList.remove('on')});document.querySelectorAll('[data-q="vision"] .pill').forEach(p=>{if(p.textContent===S.vision)p.classList.add('on');else p.classList.remove('on')});document.querySelectorAll('[data-q="lang"] .pill').forEach(p=>{if(p.textContent===S.lang)p.classList.add('on');else p.classList.remove('on')});document.querySelectorAll('[data-q="citizen"] .pill').forEach(p=>{if(S.citizen&&S.citizen.includes(p.textContent))p.classList.add('on');else p.classList.remove('on')});document.querySelectorAll('[data-q="languages"] .pill').forEach(p=>{if(S.languages&&S.languages.includes(p.textContent))p.classList.add('on');else p.classList.remove('on')});document.querySelectorAll('[data-q="postGrad"] .pill').forEach(p=>{if(p.textContent===S.postGrad)p.classList.add('on');else p.classList.remove('on')});document.querySelectorAll('[data-q="debtYrs"] .pill').forEach(p=>{if(p.textContent===S.debtYrs)p.classList.add('on');else p.classList.remove('on')});if(S.scholarshipAmount){document.getElementById('sl-schol').value=S.scholarshipAmount;document.getElementById('sl-schol-v').textContent='$'+parseInt(S.scholarshipAmount).toLocaleString()}if(S.collegeSavings){document.getElementById('sl-savings').value=S.collegeSavings;document.getElementById('sl-savings-v').textContent='$'+parseInt(S.collegeSavings).toLocaleString()}if(S.partTimeWork){document.getElementById('sl-work').value=S.partTimeWork;document.getElementById('sl-work-v').textContent='$'+parseInt(S.partTimeWork).toLocaleString()+'/yr'}if(S.familySupport){document.getElementById('sl-parent').value=S.familySupport;document.getElementById('sl-parent-v').textContent='$'+parseInt(S.familySupport).toLocaleString()+'/yr'}if(S.loanRate){document.getElementById('sl-rate').value=S.loanRate;document.getElementById('sl-rate-v').textContent=S.loanRate+'%'}if(S.loanRepaymentYears){document.getElementById('sl-yrs').value=S.loanRepaymentYears;document.getElementById('sl-yrs-v').textContent=S.loanRepaymentYears+' yrs'}renderSubPills()}
function renderCareerView(){const fc=document.getElementById('fcat-chips');if(!CAREERS_LOADED){fc.innerHTML='<p>Loading careers...</p>';setTimeout(renderCareerView,100);return}let h='';const careers=window.CAREERS||{};Object.entries(careers).forEach(([k,v])=>{h+=`<div class="pill${S.cats.includes(k)?' on':''}" onclick="togCat('${k}')">${v.name}</div>`});fc.innerHTML=h;renderCatTable();renderSubPills();renderCareerTable()}
function togCat(k){if(S.cats.includes(k)){S.cats=S.cats.filter(c=>c!==k);S.subCareers=S.subCareers.filter(f=>!Object.keys(getCategorySubjects(k)).includes(f))}else S.cats.push(k);saveState();renderCareerView();renderInsights()}

// buildCarouselHTML and initCarousel are now in framework.js (shared functions)

function buildTableHTML(rows, columnKeys, columnLabel, tableId) {
  // rows: array of [label, dataFn] where dataFn(key) returns cell content (string or {content, className})
  // columnKeys: array of country/category codes
  // columnLabel: function that returns display name for a key
  // tableId: HTML id for the table

  let html = `<table class="ct" id="${tableId || 'table-default'}"><thead><tr><th></th>`;

  // Add column headers
  columnKeys.forEach(key => {
    html += `<th class="ch">${columnLabel(key)}</th>`;
  });
  html += '</tr></thead><tbody>';

  // Add rows
  rows.forEach(row => {
    const [label, dataFn] = row;
    html += '<tr><td class="al">' + label + '</td>';

    columnKeys.forEach(key => {
      let cellData = dataFn ? dataFn(key) : '—';
      let cellClass = '';

      // If dataFn returns object with content and className, extract both
      if (typeof cellData === 'object' && cellData !== null && cellData.content !== undefined) {
        cellClass = cellData.className ? ` class="${cellData.className}"` : '';
        cellData = cellData.content;
      }

      html += `<td${cellClass}>${cellData}</td>`;
    });

    html += '</tr>';
  });

  html += '</tbody></table>';

  return html;
}

function parseSalary(salaryStr) {
  if(!salaryStr) return null;
  if(typeof salaryStr === 'number') return salaryStr;
  // Parse '$40k–$70k' format to get average: extract numbers and average them
  const matches = salaryStr.match(/\$?([\d.]+)k/g);
  if(!matches || matches.length === 0) return null;
  const nums = matches.map(m => parseInt(m.replace(/\D/g, '')) * 1000);
  return Math.round(nums.reduce((a,b) => a + b) / nums.length);
}

function getAvgSalary(min, max) {
  if(min === null || max === null) return null;
  return Math.round((min + max) / 2);
}

function buildTransitionCarousel(scenarios, workTarget) {
  const careers = window.CAREERS || {};
  const countries = window.COUNTRIES || {};
  const isUS = workTarget === 'US';

  // Group scenarios by career
  const careerGroups = {};
  Object.entries(scenarios).forEach(([idx, scenario]) => {
    const career = scenario.career;
    if(!careerGroups[career]) careerGroups[career] = [];
    careerGroups[career].push({idx, scenario});
  });

  // Build metric calculation functions
  const metrics = [
    {label: 'Annual salary', fn: (scenario) => {
      const salRange = isUS ? getCareerSalaryUS(scenario.career) : getCareerSalaryEU(scenario.career);
      return salRange ? formatMoneyRange(salRange.min, salRange.max) : '—';
    }},
    {label: 'Taxes (~20-22%)', fn: (scenario) => {
      const salRange = isUS ? getCareerSalaryUS(scenario.career) : getCareerSalaryEU(scenario.career);
      if(!salRange) return '—';
      const salary = getAvgSalary(salRange.min, salRange.max);
      if(!salary) return '—';
      const taxRate = isUS ? 0.20 : 0.22;
      return `$${Math.round(salary * taxRate).toLocaleString()}`;
    }},
    {label: 'After-tax monthly', fn: (scenario) => {
      const salRange = isUS ? getCareerSalaryUS(scenario.career) : getCareerSalaryEU(scenario.career);
      if(!salRange) return '—';
      const salary = getAvgSalary(salRange.min, salRange.max);
      if(!salary) return '—';
      const taxRate = isUS ? 0.20 : 0.22;
      const monthly = Math.round(salary * (1 - taxRate) / 12);
      return `$${monthly.toLocaleString()}`;
    }},
    {label: 'Cost of living/mo', fn: (scenario) => {
      const country = countries[scenario.studyCountry];
      if(!country || !country.costBreakdown) return '—';
      const monthly = (country.costBreakdown.room + country.costBreakdown.personal + country.costBreakdown.travel) / 12;
      return `$${Math.round(monthly).toLocaleString()}`;
    }},
    {label: 'Monthly loan payment', fn: (scenario) => `$${Math.round(scenario.monthlyDebt).toLocaleString()}`},
    {label: 'Debt-to-Income', fn: (scenario) => {
      const salRange = isUS ? getCareerSalaryUS(scenario.career) : getCareerSalaryEU(scenario.career);
      if(!salRange) return '—';
      const salary = getAvgSalary(salRange.min, salRange.max);
      if(!salary) return '—';
      const taxRate = isUS ? 0.20 : 0.22;
      const monthly = salary * (1 - taxRate) / 12;
      return `${(scenario.monthlyDebt / monthly * 100).toFixed(1)}%`;
    }},
    {label: 'Surplus/Deficit/mo', fn: (scenario) => {
      const salRange = isUS ? getCareerSalaryUS(scenario.career) : getCareerSalaryEU(scenario.career);
      if(!salRange) return '—';
      const salary = getAvgSalary(salRange.min, salRange.max);
      if(!salary) return '—';
      const taxRate = isUS ? 0.20 : 0.22;
      const monthlyIncome = salary * (1 - taxRate) / 12;
      const country = countries[scenario.studyCountry];
      if(!country || !country.costBreakdown) return '—';
      const colMonthly = (country.costBreakdown.room + country.costBreakdown.personal + country.costBreakdown.travel) / 12;
      const surplus = monthlyIncome - colMonthly - scenario.monthlyDebt;
      const color = surplus >= 500 ? 'var(--ok)' : surplus >= 0 ? 'var(--tx)' : 'var(--bad)';
      return {html: `<span style="color:${color}">$${Math.round(surplus).toLocaleString()}</span>`};
    }}
  ];

  // Custom carousel (not using .carousel-wrap/.carousel-card to avoid flex constraints)
  // Hidden on desktop, shown on mobile via media query
  let html = '<div style="display:none;overflow-x:auto;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;gap:12px;padding:0 12px;scrollbar-width:none;scroll-snap-type:x mandatory;scroll-padding:12px;margin:0 -12px" id="transition-carousel">';

  Object.entries(careerGroups).forEach(([career, items]) => {
    html += '<div style="flex:0 0 100vw;display:flex;flex-direction:column;background:#fff;border:none;border-radius:0;overflow:hidden;scroll-snap-align:start;scroll-snap-stop:always;box-shadow:none;margin:0 -12px">';

    // Blue career header
    html += `<div style="background:var(--pri);color:white;text-align:center;font-weight:600;padding:8px 16px">${career}</div>`;

    // Combined grid: labels | country1 [| country2] (includes flags and data)
    const colCount = items.length + 1;
    const gridCols = '1fr ' + Array(items.length).fill('1fr').join(' ');
    html += `<div style="font-size:12px;line-height:1.5;display:grid;grid-template-columns:${gridCols};gap:0;padding:16px;align-items:center">`;

    // Flags row
    html += '<div></div>';
    items.forEach(({scenario}) => {
      const country = countries[scenario.studyCountry];
      const flag = country ? `<img src="${country.flag}" style="height:0.9em;vertical-align:middle">` : '';
      html += `<div style="text-align:center;font-weight:500;padding:4px;border-bottom:2px solid var(--bdr)">${flag}</div>`;
    });

    // Metric rows
    metrics.forEach(({label, fn}) => {
      html += `<div style="font-weight:500;font-size:11px;padding:6px 4px;border-bottom:1px solid var(--bdr)">${label}</div>`;
      items.forEach(({scenario}) => {
        const result = fn(scenario);
        const content = result.html ? result.html : result;
        html += `<div style="text-align:center;font-size:11px;padding:6px 4px;border-bottom:1px solid var(--bdr)">${content}</div>`;
      });
    });

    html += '</div></div>';
  });

  html += '</div>';
  html += `<div style="text-align:center;padding:8px 0;font-size:12px;color:var(--tx2)">Card 1 of ${Object.keys(careerGroups).length}</div>`;

  return html;
}
function buildTransitionTable(scenarios, workTarget) {
  const careers = window.CAREERS || {};
  const countries = window.COUNTRIES || {};
  const isUS = workTarget === 'US';

  // Generate rows for metrics
  const rows = [
    ['Annual salary', (key) => {
      const scenario = scenarios[key];
      if(!scenario) return '—';
      const sub = getSub(scenario.career);
      const salRange = isUS ? getCareerSalaryUS(scenario.career) : getCareerSalaryEU(scenario.career);
      return salRange ? formatMoneyRange(salRange.min, salRange.max) : '—';
    }],
    ['Taxes (~20-22%)', (key) => {
      const scenario = scenarios[key];
      if(!scenario) return '—';
      const salRange = isUS ? getCareerSalaryUS(scenario.career) : getCareerSalaryEU(scenario.career);
      if(!salRange) return '—';
      const salary = getAvgSalary(salRange.min, salRange.max);
      if(!salary) return '—';
      const taxRate = isUS ? 0.20 : 0.22;
      const taxes = Math.round(salary * taxRate);
      return `$${taxes.toLocaleString()}`;
    }],
    ['After-tax monthly income', (key) => {
      const scenario = scenarios[key];
      if(!scenario) return '—';
      const salRange = isUS ? getCareerSalaryUS(scenario.career) : getCareerSalaryEU(scenario.career);
      if(!salRange) return '—';
      const salary = getAvgSalary(salRange.min, salRange.max);
      if(!salary) return '—';
      const taxRate = isUS ? 0.20 : 0.22;
      const afterTax = salary * (1 - taxRate);
      const monthly = Math.round(afterTax / 12);
      return `$${monthly.toLocaleString()}`;
    }],
    ['Cost of living/month', (key) => {
      const scenario = scenarios[key];
      if(!scenario) return '—';
      const cc = scenario.studyCountry;
      const country = countries[cc];
      if(!country || !country.costBreakdown) return '—';
      const col = country.costBreakdown;
      const monthly = (col.room + col.books + col.personal) / 12;
      return `$${Math.round(monthly).toLocaleString()}`;
    }],
    ['Monthly loan payment', (key) => {
      const scenario = scenarios[key];
      if(!scenario) return '—';
      const payment = scenario.monthlyDebt;
      return `$${Math.round(payment).toLocaleString()}`;
    }],
    ['Debt-to-Income Ratio', (key) => {
      const scenario = scenarios[key];
      if(!scenario) return '—';
      const salRange = isUS ? getCareerSalaryUS(scenario.career) : getCareerSalaryEU(scenario.career);
      if(!salRange) return '—';
      const salary = getAvgSalary(salRange.min, salRange.max);
      if(!salary) return '—';
      const taxRate = isUS ? 0.20 : 0.22;
      const afterTax = salary * (1 - taxRate);
      const monthly = afterTax / 12;
      const dti = (scenario.monthlyDebt / monthly * 100).toFixed(1);
      return `${dti}%`;
    }],
    ['Surplus/Deficit/month', (key) => {
      const scenario = scenarios[key];
      if(!scenario) return '—';
      const salRange = isUS ? getCareerSalaryUS(scenario.career) : getCareerSalaryEU(scenario.career);
      if(!salRange) return '—';
      const salary = getAvgSalary(salRange.min, salRange.max);
      if(!salary) return '—';
      const taxRate = isUS ? 0.20 : 0.22;
      const afterTax = salary * (1 - taxRate);
      const monthlyIncome = afterTax / 12;
      const cc = scenario.studyCountry;
      const country = countries[cc];
      if(!country || !country.costBreakdown) return '—';
      const col = country.costBreakdown;
      const colMonthly = (col.room + col.books + col.personal) / 12;
      const surplus = monthlyIncome - colMonthly - scenario.monthlyDebt;
      const color = surplus >= 500 ? 'color:var(--ok)' : surplus >= 0 ? 'color:var(--tx)' : 'color:var(--bad)';
      return { content: `$${Math.round(surplus).toLocaleString()}`, className: `style="${color}"` };
    }]
  ];

  // Column keys are the scenario indices
  const columnKeys = Object.keys(scenarios);

  // Build table with custom header (career colspan + flags)
  let html = `<table class="ct" id="transition-table"><thead>`;

  // Group scenarios by career to calculate colspan
  const careerGroups = {};
  columnKeys.forEach(key => {
    const scenario = scenarios[key];
    const career = scenario.career;
    if(!careerGroups[career]) careerGroups[career] = [];
    careerGroups[career].push(key);
  });

  // Identify last column index of each career group for border styling
  const careerLastColumnIndex = {};
  let currentIndex = 0;
  Object.entries(careerGroups).forEach(([career, keys]) => {
    careerLastColumnIndex[career] = currentIndex + keys.length - 1;
    currentIndex += keys.length;
  });

  // Header row 1: Career names with colspan
  html += '<tr><th></th>';
  let addedCareers = new Set();
  columnKeys.forEach(key => {
    const scenario = scenarios[key];
    const career = scenario.career;
    if(!addedCareers.has(career)) {
      const careerCount = careerGroups[career].length;
      const rightBorder = careerCount < columnKeys.length && careerLastColumnIndex[career] < columnKeys.length - 1 ? 'border-right:1px solid rgba(0,0,0,0.08)' : '';
      html += `<th class="ch" colspan="${careerCount}" style="vertical-align:middle;text-align:center;${rightBorder}">${career}</th>`;
      addedCareers.add(career);
    }
  });
  html += '</tr>';

  // Header row 2: Flags
  html += '<tr><th></th>';
  columnKeys.forEach((key, idx) => {
    const scenario = scenarios[key];
    const country = countries[scenario.studyCountry];
    const flag = country ? `<img src="${country.flag}" style="height:0.9em;vertical-align:middle">` : '';
    const rightBorder = idx < columnKeys.length - 1 && Object.values(careerLastColumnIndex).includes(idx) ? 'border-right:1px solid rgba(0,0,0,0.08)' : '';
    html += `<th class="ch" style="text-align:center;${rightBorder}">${flag}</th>`;
  });
  html += '</tr>';

  html += '</thead><tbody>';

  // Add data rows
  rows.forEach(row => {
    const [label, dataFn] = row;
    html += '<tr><td class="al">' + label + '</td>';

    columnKeys.forEach((key, idx) => {
      let cellData = dataFn ? dataFn(key) : '—';
      let cellClass = '';
      let cellStyle = '';

      if (typeof cellData === 'object' && cellData !== null && cellData.content !== undefined) {
        cellClass = cellData.className ? ` class="${cellData.className}"` : '';
        cellData = cellData.content;
      }

      // Add border to last column of each career group
      if(idx < columnKeys.length - 1 && Object.values(careerLastColumnIndex).includes(idx)) {
        cellStyle = ' style="border-right:1px solid rgba(0,0,0,0.08)"';
      }

      html += `<td${cellClass}${cellStyle}>${cellData}</td>`;
    });

    html += '</tr>';
  });

  html += '</tbody></table>';

  return html;
}

// ===== TABLE RENDERING =====
function renderCatTable(){
  const sel=S.cats;
  const el=document.getElementById('cat-table');
  if(sel.length<1){
    el.innerHTML='';
    return;
  }
  function derive(cat){
    const subs=(window.CAREERS)[cat]?.subjects||{};
    const vals=[];
    Object.keys(subs).forEach(f=>{const d=getDemandForCareer(f); if(d&&typeof d.pct==='number') vals.push(d.pct)});
    if(!vals.length) return null;
    const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
    return {pct:Math.round(avg)};
  }
  const attrs=[['Education','education'],['Market Demand','demand'],['Cost (US)','costUS_min'],['Cost (EU)','costEU_min'],['Salary (US)','salaryUS_min'],['Salary (EU)','salaryEU_min'],['Growth','growth'],['Portability','portability'],['Licensing','licensing']];
  const rows=attrs.map(([l,a])=>[l,(k)=>{let v='—';if(a==='demand'){let d=getDemandForCat(k);if(!d)d=derive(k);v=demandCell(d);}else{const agg=aggregateCategoryData(k, a);v=agg&&agg.display?agg.display:agg??'—';}if(a==='portability'&&typeof v==='string'&&v.toUpperCase().startsWith('HIGH')){return {content:v,className:'win'}}return v;}]);
  const t=buildTableHTML(rows,sel,(k)=>getCategoryName(k),'cat-table');
  const carouselRows=attrs.map(([l,a])=>[l,(k)=>{let v='—';if(a==='demand'){let d=getDemandForCat(k);if(!d)d=derive(k);v=demandCell(d);}else{const agg=aggregateCategoryData(k, a);v=agg&&agg.display?agg.display:agg??'—';}const cls=a==='portability'&&typeof v==='string'&&v.toUpperCase().startsWith('HIGH')?' style="background:rgba(22,163,74,.08);font-weight:600"':'';return `<div${cls}>${v}</div>`;}]);
  const carousel=buildCarouselHTML(carouselRows,sel,(k)=>getCategoryName(k),'cat-carousel');
  el.innerHTML=t+carousel;
  setTimeout(()=>initCarousel('cat-carousel'),50);
}

function renderSubPills(){const el=document.getElementById('sub-pills');if(!S.cats.length){el.innerHTML='';return}let h='';S.cats.forEach(ck=>{Object.keys(getCategorySubjects(ck)).forEach(fn=>{h+=`<div class="pill${S.subCareers.includes(fn)?' on':''}" onclick="togSub('${fn}',this)">${fn}</div>`})});el.innerHTML=h}
function togSub(fn,el){
 if(S.subCareers.includes(fn)) S.subCareers=S.subCareers.filter(f=>f!==fn);
 else S.subCareers.push(fn);
 if(el) el.classList.toggle('on');
 saveState();renderInsights();
 renderCareerTable();
 renderFilterAnalysis();
 renderFilterResult();
 renderUniversities();
 
}
function getSub(fn){const careers=window.CAREERS||{};for(const[,c]of Object.entries(careers)){if(c.subjects[fn])return c.subjects[fn]}return null}
function renderCareerTable(){
  const sel=S.subCareers;
  const el=document.getElementById('career-table');
  if(sel.length<1){el.innerHTML=guidanceMsg('Select a career to view details');return}
  const attrs=[['Education','education'],['Market Demand','dem'],['Total Cost (US)','costUS'],['Total Cost (EU)','costEU'],['Salary (US)','salaryUS'],['Salary (EU)','salaryEU'],['Growth','growth'],['Portability','portability'],['Licensing','licensing'],['Resources',null]];
  const rows=attrs.map(([l,a])=>[l,(f)=>{
    if(a===null){const d=getSub(f);return (d?.resources?.map(r=>`<a href="${r.url}" target="_blank">${r.title}</a>`).join(', ')||'—');}
    let v='—';
    if(a==='dem'){v=demandCell(getDemandForCareer(f));}
    else if(a==='education'){v=formatEducationSummary(getCareerEducation(f));}
    else if(a==='costUS'){const range=getCareerCostUS(f);v=range?'$'+(Math.round((range.min+range.max)/2)/1000).toFixed(0)+'k Average':'—';}
    else if(a==='costEU'){const range=getCareerCostEU(f);v=range?'$'+(Math.round((range.min+range.max)/2)/1000).toFixed(0)+'k Average':'—';}
    else if(a==='salaryUS'){const d=getSub(f);if(d?.salaryNote){v=d.salaryNote;}else{const range=getCareerSalaryUS(f);v=range?'$'+(Math.round((range.min+range.max)/2)/1000).toFixed(0)+'k Average':'—';}}
    else if(a==='salaryEU'){const d=getSub(f);if(d?.salaryNote){v=d.salaryNote;}else{const range=getCareerSalaryEU(f);v=range?'$'+(Math.round((range.min+range.max)/2)/1000).toFixed(0)+'k Average':'—';}}
    else if(a==='growth'){v=formatGrowth(getCareerGrowth(f));}
    else if(a==='portability'){v=formatPortability(getCareerPortability(f));if(typeof v==='string'&&v.toUpperCase().startsWith('HIGH')){return {content:v,className:'win'}}}
    else if(a==='licensing'){v=formatLicensing(getCareerLicensing(f));}
    if(v===null)v='N/A';
    return v;
  }]);
  const t=buildTableHTML(rows,sel,(f)=>`${f} <span class="xr" onclick="togSub('${f}',null);renderCareerView()">✕</span>`,'career-table');
  const carouselRows=attrs.map(([l,a])=>[l,(f)=>{
    if(a===null){const d=getSub(f);return `<div>${(d?.resources?.map(r=>`<a href="${r.url}" target="_blank">${r.title}</a>`).join(', ')||'—')}</div>`}
    let v='—';
    if(a==='dem'){v=demandCell(getDemandForCareer(f));}
    else if(a==='education'){v=formatEducationSummary(getCareerEducation(f));}
    else if(a==='costUS'){const range=getCareerCostUS(f);v=range?'$'+(Math.round((range.min+range.max)/2)/1000).toFixed(0)+'k Average':'—';}
    else if(a==='costEU'){const range=getCareerCostEU(f);v=range?'$'+(Math.round((range.min+range.max)/2)/1000).toFixed(0)+'k Average':'—';}
    else if(a==='salaryUS'){const d=getSub(f);if(d?.salaryNote){v=d.salaryNote;}else{const range=getCareerSalaryUS(f);v=range?'$'+(Math.round((range.min+range.max)/2)/1000).toFixed(0)+'k Average':'—';}}
    else if(a==='salaryEU'){const d=getSub(f);if(d?.salaryNote){v=d.salaryNote;}else{const range=getCareerSalaryEU(f);v=range?'$'+(Math.round((range.min+range.max)/2)/1000).toFixed(0)+'k Average':'—';}}
    else if(a==='growth'){v=formatGrowth(getCareerGrowth(f));}
    else if(a==='portability'){v=formatPortability(getCareerPortability(f));}
    else if(a==='licensing'){v=formatLicensing(getCareerLicensing(f));}
    if(v===null)v='N/A';
    const cls=a==='portability'&&typeof v==='string'&&v.toUpperCase().startsWith('HIGH')?' style="background:rgba(22,163,74,.08);font-weight:600"':'';
    return `<div${cls}>${v}</div>`;
  }]);
  const carousel=buildCarouselHTML(carouselRows,sel,(f)=>f,'career-carousel');
  el.innerHTML=t+carousel;
  setTimeout(()=>initCarousel('career-carousel'),50);
}
function renderFilterSubPills(){const el=document.getElementById('filter-sub-pills');if(!S.cats.length){el.innerHTML='';return}let h='';S.cats.forEach(ck=>{Object.keys(getCategorySubjects(ck)).forEach(fn=>{h+=`<div class="pill${S.subCareers.includes(fn)?' on':''}\" onclick=\"togSub('${fn}',null);renderFilterSubPills();renderFilterAnalysis()\">${fn}</div>`})});el.innerHTML=h}
function togPrac(v){
  if(S.prac[0]===v){S.prac=[]}else{S.prac=[v]}
  renderPracPills();
  renderFilterAnalysis();
  renderFilterResult();
  
}
function renderPracPills(){const el=document.querySelector('.pills[data-q="practice"]');let h='';const labels={us:'United States',eu:'Europe',oth:'Other',idk:'Not sure yet'};['us','eu','oth','idk'].forEach(v=>{h+=`<div class="pill${S.prac[0]===v?' on':''}" onclick="togPrac('${v}')">${labels[v]}</div>`});el.innerHTML=h}
function renderFilterAnalysis(){
const el=document.getElementById('filter-analysis');
if(!S.cats.length){el.innerHTML='';return}
let careers=S.subCareers.length?[...S.subCareers]:[];
if(!careers.length){el.innerHTML='';return}
let h='';
const seen=new Set();
careers.forEach(f=>{
 if(seen.has(f))return;
 seen.add(f);
 const port=getCareerPortability(f);
 if(!port)return;
 let level=port.level || 'HIGH';
 h+=`<div class="rc"><h4>${f}: ${level==='LOW'?'LOW ⚠️':level==='MEDIUM'?'MEDIUM ⚖️':'HIGH ✓'}</h4><p>${level==='LOW'?'Country-specific licensing. Study where you plan to practice.':level==='MEDIUM'?'Partially transferable. Some certifications or adjustments may be needed.':'Skills transfer globally. Study wherever fits.'}</p></div>`;
});
el.innerHTML=h
}
function renderFilterResult(){
const el=document.getElementById('filter-result');
let careers=S.subCareers.length?[...S.subCareers]:[];
if(!careers.length){el.innerHTML=guidanceMsg('Select careers above to see portability findings');return}

let hasLow=false;
let hasMedium=false;
let lowCareers=[];

careers.forEach(f=>{
 const port=getCareerPortability(f);
 if(!port) return;
 if(port.level === 'LOW'){ hasLow=true; lowCareers.push(f); }
 else if(port.level === 'MEDIUM') hasMedium=true;
});

let msg='';
if(hasLow){
 msg='<div class="rc"><div class="badge">⚠️ Lock-In</div><p>Some careers are tied to education or certification geography. Prioritize either geography or career before selecting a university.</p><p style="margin-top:6px"><b>Careers triggering this:</b> '+lowCareers.join(', ')+'</p></div>';
}
else if(hasMedium){
 msg='<div class="rc"><div class="badge">⚖️ Partial Flexibility</div><p>Some of your careers are more portable than others. You may need additional certifications, exams, or adjustments depending on where you work.</p></div>';
}
else{
 msg='<div class="rc"><div class="badge">✅ Fully Portable</div><p>All of your careers are portable. Choose a country to study in based on cost, culture, language, and fit.</p></div>';
}
el.innerHTML=msg;
}
function renderCCChips(){const el=document.getElementById('cc-chips');if(!COUNTRIES_LOADED){el.innerHTML='<p>Loading countries...</p>';setTimeout(renderCCChips,100);return;}let h='';Object.entries(COUNTRIES).forEach(([k,v])=>{h+=`<div class="pill${S.cc.includes(k)?' on':''}" onclick="togCC('${k}')"><img src="${v.flag}" style="height:0.9em;vertical-align:middle"> ${v.name}</div>`});el.innerHTML=h;renderCCTable()}
function togCC(k){if(S.cc.includes(k))S.cc=S.cc.filter(x=>x!==k);else S.cc.push(k);saveState();renderCCChips();updateHdrCarousel();renderUniversities();renderInsights()}
function renderCCTable(){const sel=S.cc;const el=document.getElementById('cc-table');if(sel.length<1){el.innerHTML=guidanceMsg('Select a country to view details');return}const attrs=[['Tuition',(k)=>{const val=getCountryTuition(k)||'—';const note=getCountryTuitionNote(k);return `${val}${note?'<div class="note">'+note+'</div>':''}`;},null],['Degree Length',(k)=>(getCountryDuration(k)||'—')+' years'],['Language',(k)=>getCountryLanguage(k)||'—'],['Change Majors?',(k)=>getCountryChangePolicy(k)||'—'],['After Graduation',(k)=>getCountryPostGradOpportunities(k)||'—'],['Financial Aid',(k)=>getCountryFinancialAid(k)||'—'],['Admissions',(k)=>getCountryAdmissions(k)||'—'],['Culture',(k)=>getCountryCulture(k)||'—'],['Apply At',(k)=>getCountryPortal(k)||'—'],['Resources',(k)=>{const resources=getCountryResources(k)||[];return resources.map(r=>`<a href="${r.u}" target="_blank">${r.t}</a>`).join(', ')||'—';}]];const columnLabel=(k)=>`${getCountryFlag(k)} ${getCountryName(k)} <span class="xr" onclick="togCC('${k}')">✕</span>`;const t=buildTableHTML(attrs,sel,columnLabel,'cc-table');el.innerHTML=t;let insights=[];const seenMsgs=new Set();if(S.vision){const eu=['sweden','uk','germany','netherlands','france','italy','spain','denmark','ireland','no','ch'];const hasUS=sel.some(k=>k==='us'||k==='canada'||k==='australia'||k==='singapore');const hasEU=sel.some(k=>eu.includes(k));let visionMsg='';if(hasUS&&hasEU){if(S.vision==='In the US'){visionMsg='You prefer staying in the US long-term, but you\'ve selected EU countries. Consider if EU study aligns with your goals.';}else if(S.vision==='In Europe'){visionMsg='Your vision to work abroad aligns well with EU country choices.';}else if(S.vision==='Anywhere globally'){visionMsg='Your flexible vision works with both US and EU options. Pick based on other factors.';}}else if(hasEU&&!hasUS){if(S.vision==='In the US'){visionMsg='You prefer staying in the US, but selected only EU countries. Reconsider your country choices.';}else if(S.vision==='In Europe'||S.vision==='Anywhere globally'){visionMsg='Studying in an EU country positions you well for European work.';}}else if(hasUS&&!hasEU){if(S.vision==='In the US'||S.vision==='Anywhere globally'){visionMsg='US study aligns with your 5-year vision.';}else if(S.vision==='In Europe'){visionMsg='You want to work abroad, but studying in the US may make it harder to build international connections.';}}if(visionMsg&&!seenMsgs.has(visionMsg)){insights.push({align:!visionMsg.includes('Reconsider'),msg:visionMsg});seenMsgs.add(visionMsg)}}if(S.cost){const costs=sel.map(k=>getCountryCostTuition(k)||0);const hasExpensive=costs.some(c=>c>30000);const hasAffordable=costs.some(c=>c<=30000);let costMsg='';let isAlign=true;if(hasExpensive&&hasAffordable){costMsg='You\'ve selected both expensive and affordable countries. Consider which best matches your '+S.cost.toLowerCase()+' priority.';isAlign=false;}else{const insight=getCostInsight(sel,S.cost);if(insight){costMsg=insight.msg;isAlign=insight.align;}}if(costMsg&&!seenMsgs.has(costMsg)){insights.push({align:isAlign,msg:costMsg});seenMsgs.add(costMsg)}}if(S.lang&&S.cc.length>0){const langInsight=getLanguageInsight(S.cc[0],S.lang);if(langInsight&&!seenMsgs.has(langInsight.msg)){insights.push(langInsight);seenMsgs.add(langInsight.msg)}}if(S.citizen&&S.citizen.length>0){const citizenInsights=[];S.citizen.forEach(cit=>{const insight=getCitizenshipInsight(S.cc[0],cit);if(insight)citizenInsights.push(insight)});if(citizenInsights.length>0){const sample=citizenInsights[0];if(!seenMsgs.has(sample.msg)){insights.push(sample);seenMsgs.add(sample.msg)}}}
const carouselRows=attrs.map(([l,a])=>[l,(k)=>{const cellData=a(k);let content=cellData;if(typeof cellData==='object'&&cellData.content!==undefined){content=cellData.content}return `<div>${content}</div>`;}]);const carousel=buildCarouselHTML(carouselRows,sel,(k)=>`${getCountryFlag(k)} ${getCountryName(k)}`,'cc-carousel');el.innerHTML=t+carousel;setTimeout(()=>initCarousel('cc-carousel'),50);
}

// DEMAND_MAP merged into careers.json — access via getSub(career)?.demand
function demandCell(d){
 if(!d) return '—';
 const v=Math.round(d.pct);
 if(v>0) return `+${v}%`;
 return `${v}%`;
}
function getDemandForCareer(name){
  const career = getSub(name);
  return career?.demand || null;
}
const HAS_US=true;
const HAS_EU=true;

function getDemandForCat(key){
  // Derive category demand from subcareers' demand percentages
  const subs = getCategorySubjects(key);
  if (!subs || Object.keys(subs).length === 0) return null;

  const demands = Object.values(subs)
    .map(subcareer => subcareer?.demand)
    .filter(d => d && typeof d.pct === 'number');

  if (demands.length === 0) return null;

  const avgPct = demands.reduce((sum, d) => sum + d.pct, 0) / demands.length;
  const labels = demands.map(d => d.label);

  // Determine overall label based on average percentage
  let label = 'Moderate';
  if (avgPct > 10) label = 'Very high';
  else if (avgPct > 7) label = 'High';
  else if (avgPct > 4) label = 'Moderate';
  else if (avgPct < 0) label = 'Declining';
  else label = 'Low';

  return {
    label: label,
    pct: Math.round(avgPct * 10) / 10,
    period: '2024-34',
    src: null
  };
}

function fmt(n){return'$'+Math.round(n).toLocaleString()}

// Helper function to compute cost results for a country given current financing choices
function computeCountryCostResults(countryKey, scholDollars, savingsTotal, workAnnual, familyAnnual, loanRate, loanYears){
  const costBreakdown = getCountryCostBreakdown(countryKey);
  const tuitionVal = getCountryCostTuition(countryKey);
  if(!costBreakdown || tuitionVal === null) return null;

  let tui = Math.round(Math.max(0, tuitionVal - scholDollars));
  const room = getCountryCostRoom(countryKey) || 0;
  const books = getCountryCostBooks(countryKey) || 0;
  const personal = getCountryCostPersonal(countryKey) || 0;
  const travel = getCountryCostTravel(countryKey) || 0;
  const dur = parseFloat(getCountryDuration(countryKey)) || 4;
  
  const yearTotal = tui + room + books + personal + travel;
  const total4yr = yearTotal * dur;
  
  const annualSavings = savingsTotal / dur;
  const totalSupport = workAnnual + familyAnnual + annualSavings;
  const yearAfterSupport = Math.max(0, yearTotal - totalSupport);
  const yearAfterSupportTotal = yearAfterSupport * dur;
  const borrowNeeded4yr = Math.max(0, yearAfterSupportTotal);
  
  const monthlyRate = (loanRate / 100) / 12;
  const months = loanYears * 12;
  let monthlyPayment = 0;
  if(borrowNeeded4yr > 0 && monthlyRate > 0){
    monthlyPayment = (borrowNeeded4yr * monthlyRate * Math.pow(1+monthlyRate, months)) / (Math.pow(1+monthlyRate, months) - 1);
  }
  
  return {
    tuition: tui,
    total4yr: total4yr,
    yearAfterSupport: yearAfterSupport,
    yearAfterSupportTotal: yearAfterSupport * dur,
    borrowNeeded: borrowNeeded4yr,
    monthlyPayment: monthlyPayment,
    loanYears: loanYears,
    loanRate: loanRate
  };
}

function info(k){
    const funding = getCountryFunding(k);
    return funding || {
      need:{what:'Varies',apply:'Check official sources',notes:''},
      merit:{what:'Varies',apply:'Check official sources',notes:''},
      external:{what:'Varies',apply:'Check official sources',notes:''},
      free:{what:'Varies',apply:'Check official sources',notes:''},
      timeline:'Varies',
      links:[]
    };
  }

function keyLinks(k){
 const d=info(k);
 const links=[];
    (Array.isArray(d.links)?d.links:[]).forEach(x=>links.push(x));
    const res=getCountryResources(k);
    res.slice(0,3).forEach(r=>links.push({t:r.t,u:r.u}));
    const seen=new Set();
    const uniq=[];
    links.forEach(l=>{ if(!l.u || seen.has(l.u)) return; seen.add(l.u); uniq.push(l); });
    const html = uniq.slice(0,6).map(l=>'<a href="'+l.u+'" target="_blank">'+l.t+'</a>').join(', ');
    return html || 'Check university website for funding opportunities';
  }


// Map internal selectivity values to display names
// ===== CAROUSEL BUILDER FOR UNIVERSITIES BY COUNTRY =====
function buildUniversitiesCarouselByCountry(data) {
  const { country, countryCode, universities, careerUniMap } = data;
  
  let carouselHTML = `<div class="uni-country-carousel-section">
    <div class="uni-country-title"><img src="${COUNTRIES[country].flag}" style="height:0.9em;vertical-align:middle"> ${COUNTRIES[country].name} (${universities.length})</div>
    <div class="uni-country-carousel-wrap">
      <div class="uni-country-carousel">`;
  
  universities.forEach(u => {
    const locationStr = u.country === 'us'
      ? (u.city ? (u.city.includes(',') ? u.city : `${u.city}, ${u.state}`) : u.state)
      : u.city;

    // Determine tuition to display
    let tuitionDisplay = `$${parseInt(u.tuition).toLocaleString()}`;
    let tuitionNote = '';

    if(countryCode === 'us') {
      // For US universities, show tuition based on preference
      if(S.inStateTuitionPref === 'in-state-public' && u.tuition_instate) {
        tuitionDisplay = `$${parseInt(u.tuition_instate).toLocaleString()}`;
      } else if(S.inStateTuitionPref === 'out-of-state-public' && u.tuition_outofstate) {
        tuitionDisplay = `$${parseInt(u.tuition_outofstate).toLocaleString()}`;
      } else if(S.inStateTuitionPref === 'private') {
        tuitionDisplay = `$${parseInt(u.tuition).toLocaleString()}`;
      } else {
        tuitionDisplay = `$${parseInt(u.tuition).toLocaleString()}`;
      }
    } else if(u.country !== 'us' && S.citizen && S.citizen.length > 0) {
      // Prioritize EU citizenship if present
      const hasEU = S.citizen.includes('EU');
      const hasUS = S.citizen.includes('US');

      if(hasEU && u.tuition_eu !== undefined) {
        // Use EU rate from universities.json
        const euRate = parseInt(u.tuition_eu);
        if(euRate === 0) {
          tuitionDisplay = 'FREE';
        } else {
          tuitionDisplay = `$${euRate.toLocaleString()}`;
        }
        tuitionNote = ` ${u.tuition_eu_note || '(EU rate)'}`;
      } else if(hasUS) {
        tuitionNote = ' (intl)';
      }
    }

    // Find which selected careers this university offers
    const offeredCareers = [];
    S.subCareers.forEach(career => {
      const careerUnis = careerUniMap[career] || [];
      if(careerUnis.some(cu => cu.name === u.name)){
        offeredCareers.push(career);
      }
    });

    const programsStr = offeredCareers.length > 0 ? offeredCareers.join(', ') : '—';
    const selectivityColor = u.selectivity === 'Very selective' ? '#c83232' : u.selectivity === 'Selective' ? '#9664c8' : '#6496c8';
    const selectivityBg = u.selectivity === 'Very selective' ? 'rgba(200,50,50,.2)' : u.selectivity === 'Selective' ? 'rgba(150,100,200,.2)' : 'rgba(100,150,200,.2)';
    const uniType = u.country === 'us' ? (u.type === 'Public' ? 'Public' : 'Private') : null;

    carouselHTML += `<div class="uni-card">
      <div class="uni-card-header">${u.name}</div>
      <div class="uni-card-body">
        <div class="uni-card-row"><span class="uni-label">Location</span> <span class="uni-value">${locationStr}</span></div>`;
    if(countryCode === 'us'){
      carouselHTML += `<div class="uni-card-row"><span class="uni-label">Type</span> <span class="uni-value">${uniType}</span></div>`;
    }
    carouselHTML += `<div class="uni-card-row"><span class="uni-label">Admission</span> <span class="uni-value">${parseFloat(u.acceptance_rate).toFixed(1)}%</span></div>
        <div class="uni-card-row"><span class="uni-label">Students</span> <span class="uni-value">${u.student_pop ? parseInt(u.student_pop).toLocaleString() : '—'}</span></div>
        <div class="uni-card-row"><span class="uni-label">Tuition</span> <span class="uni-value"><strong>${tuitionDisplay}</strong><span style="font-size:11px">${tuitionNote}</span></span></div>
        <div class="uni-card-row"><span class="uni-label">Programs</span> <span class="uni-value">${programsStr}</span></div>
        <div class="uni-card-row"><span class="uni-label">Selectivity</span> <span class="uni-value"><span style="padding:2px 6px;border-radius:3px;font-size:11px;font-weight:600;background:${selectivityBg};color:${selectivityColor}">${SELECTIVITY_DISPLAY[u.selectivity] || u.selectivity}</span></span></div>
      </div>
    </div>`;
  });
  
  carouselHTML += `</div>
      <div class="uni-country-indicator">University 1 of ${universities.length}</div>
    </div>
  </div>`;
  
  return carouselHTML;
}

function renderUniversities(){
  const host = document.getElementById('uni-content');
  if(!host) return;
  if(!COUNTRIES_LOADED || !UNIVERSITIES_LOADED){host.innerHTML='<p>Loading universities...</p>';setTimeout(renderUniversities,100);return}
  // Render country pills
  const ccPills = document.getElementById('uni-country-pills');
  if(ccPills){
    let h = '';
    Object.entries(COUNTRIES).forEach(([k,v])=>{
      h += `<div class="pill${S.cc.includes(k)?' on':''}" onclick="togCC('${k}');renderUniversities()"><img src="${v.flag}" style="height:0.9em;vertical-align:middle"> ${v.name}</div>`;
    });
    ccPills.innerHTML = h;
  }
  
  // Mapping from country name keys to database codes
  const countryCodeMap = {
    'us': 'us',
    'uk': 'uk',
    'sweden': 'se',
    'germany': 'de',
    'netherlands': 'nl',
    'france': 'fr',
    'italy': 'it',
    'spain': 'es',
    'denmark': 'dk',
    'ireland': 'ie',
    'canada': 'ca'
  };
  
  // Render NC preference pills and show/hide selector based on state selection
  const selectorContainer = document.getElementById('uni-instate-selector');
  const ncPills = document.getElementById('uni-instate-pills');
  if(selectorContainer && ncPills){
    selectorContainer.style.display = 'block';
    if(!S.stateOfResidency){
      // Show disabled state if no state selected
      ncPills.innerHTML = '<div style="color:var(--tx2);font-size:13px;padding:8px;text-align:center">Select a state of residency on the Discovery tab to see options</div>';
      ncPills.style.pointerEvents = 'none';
      ncPills.style.opacity = '0.5';
    } else {
      // Show enabled selector if state selected
      ncPills.style.pointerEvents = 'auto';
      ncPills.style.opacity = '1';
      const stateAbbrev = S.stateOfResidency;
      let h = '<div class="pills" data-q="inStateTuitionPref">';
      h += `<div class="pill${S.inStateTuitionPref === 'in-state-public' ? ' on' : ''}\" onclick="setInStatePref('in-state-public')">In-state Public (${stateAbbrev})</div>`;
      h += `<div class="pill${S.inStateTuitionPref === 'out-of-state-public' ? ' on' : ''}\" onclick="setInStatePref('out-of-state-public')">Out-of-state Public</div>`;
      h += `<div class="pill${S.inStateTuitionPref === 'private' ? ' on' : ''}\" onclick="setInStatePref('private')">Private</div>`;
      h += '</div>';
      ncPills.innerHTML = h;
    }
  }
  
  // Render selectivity pills (in container with data-q to match Discovery page structure)
  const selPills = document.getElementById('uni-selectivity-pills');
  if(selPills){
    const selOptions = ['Very selective', 'Selective', 'Less selective'];
    let h = '<div class="pills" data-q="uniSelectivity">';
    selOptions.forEach(option => {
      const isSelected = S.uniSelectivity && S.uniSelectivity.includes(option);
      h += `<div class="pill${isSelected ? ' on' : ''}" onclick="pickN('uniSelectivity',this)">${option}</div>`;
    });
    h += '</div>';
    selPills.innerHTML = h;
  }

  if(!S.subCareers.length||!S.cc.length){
    host.innerHTML=guidanceMsg('Select careers and countries to see university recommendations');
    return;
  }
  
  // Build mapping of career -> universities for each subject
  const careerUniMap = {};
  S.subCareers.forEach(career => {
    const qsSubject = CAREER_TO_QS_SUBJECT[career];
    if(qsSubject){
      careerUniMap[career] = getUniversitiesByProgram(qsSubject);
    }
  });
  
  Object.entries(careerUniMap).forEach(([career, unis]) => {
    const nonUS = unis.filter(u => u.country !== 'us').length;
  });
  
  // Build tables for each country
  let html = '';
  
  S.cc.forEach(country => {
    // Convert country name key to database code
    const countryCode = countryCodeMap[country] || country;
    
    // Collect all universities for this country across all careers
    const allCountryUnis = new Map(); // name -> uni object

    // If no careers selected, show ALL universities for this country
    // Otherwise, only show universities offering selected careers
    let uniArrays = S.subCareers.length === 0 ? [getUniversitiesByCountry(countryCode)] : Object.values(careerUniMap);

    uniArrays.forEach(unis => {
      unis.filter(u => u.country === countryCode).forEach(u => {
        if(!allCountryUnis.has(u.name)) {
          allCountryUnis.set(u.name, u);
        }
      });
    });
    
    // Apply global filters (selectivity, NC preference)
    let filteredUnis = Array.from(allCountryUnis.values());
    
    // Apply program filter
    const selectedSubjects = new Set();
    S.subCareers.forEach(career => {
      const qsSubject = CAREER_TO_QS_SUBJECT[career];
      if(qsSubject) selectedSubjects.add(qsSubject);
    });

    // If careers are selected, filter universities to only those with matching programs
    if(selectedSubjects.size > 0) {
      filteredUnis = filteredUnis.filter(u => {
        if (!u.programs) return false;  // Exclude universities without program data when filtering by programs
        const hasProgram = u.programs.some(p => selectedSubjects.has(p));
        return hasProgram;
      });
    }
    // If no careers selected, show all universities (no program filtering)
    
    // Apply selectivity filter (multi-select)
    if(S.uniSelectivity && S.uniSelectivity.length > 0){
      filteredUnis = filteredUnis.filter(u => S.uniSelectivity.includes(u.selectivity));
    }
    
    // Apply state filter and university type filter based on preference (US only)
    if(countryCode === 'us' && S.inStateTuitionPref){
      if(S.inStateTuitionPref === 'in-state-public' && S.stateOfResidency){
        // Show only public universities in the selected state
        filteredUnis = filteredUnis.filter(u => u.state === S.stateOfResidency && u.type === 'Public');
      } else if(S.inStateTuitionPref === 'out-of-state-public' && S.stateOfResidency){
        // Show only public universities NOT in the selected state
        filteredUnis = filteredUnis.filter(u => u.state !== S.stateOfResidency && u.type === 'Public');
      } else if(S.inStateTuitionPref === 'private'){
        // Show only private universities (both not-for-profit and for-profit)
        filteredUnis = filteredUnis.filter(u => u.type !== 'Public');
      }
    }
    
    // Sort universities by selectivity (acceptance rate)
    filteredUnis.sort((a,b) => parseFloat(a.acceptance_rate) - parseFloat(b.acceptance_rate));
    
    // Build country section
    html += `<div style="margin:20px 0;padding:12px;background:rgba(100,150,200,.08);border:1px solid rgba(100,150,200,.2);border-radius:6px">
      <h3 style="margin:0 0 12px 0;font-size:18px"><img src="${COUNTRIES[country].flag}" style="height:0.9em;vertical-align:middle"> ${COUNTRIES[country].name} (${filteredUnis.length})</h3>`;
    
    if(filteredUnis.length === 0){
      html += '<p style="color:var(--tx2);margin:0">No universities match your preferences</p>';
    } else {
      // Build table: universities with their matching careers
      let tuitionLabel = 'Tuition/yr';
      if(countryCode === 'us' && S.inStateTuitionPref){
        if(S.inStateTuitionPref === 'in-state-public') tuitionLabel = 'Tuition/yr (In-state)';
        else if(S.inStateTuitionPref === 'out-of-state-public') tuitionLabel = 'Tuition/yr (Out-of-state)';
        else if(S.inStateTuitionPref === 'private') tuitionLabel = 'Tuition/yr (Private)';
      }
      html += '<table style="width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed">';
      html += '<colgroup>';
      html += '<col style="width:15%">';  // University
      html += '<col style="width:12%">';  // Location
      if(countryCode === 'us'){
        html += '<col style="width:7%">';   // Public/Private (US only)
      }
      html += '<col style="width:8%">';   // Admission %
      html += '<col style="width:10%">';  // Tuition/yr
      html += '<col style="width:8%">';   // Students
      html += '<col style="width:23%">';  // Programs
      html += '<col style="width:10%">';  // Selectivity
      html += '</colgroup>';
      html += '<thead><tr style="background:rgba(100,150,200,.1);border-bottom:2px solid rgba(100,150,200,.3)">';
      html += '<th style="padding:8px;text-align:left;font-weight:700;overflow:hidden;text-overflow:ellipsis">University</th>';
      html += '<th style="padding:8px;text-align:left;font-weight:700;overflow:hidden;text-overflow:ellipsis">Location</th>';
      if(countryCode === 'us'){
        html += '<th style="padding:8px;text-align:left;font-weight:700;overflow:hidden;text-overflow:ellipsis">Type</th>';
      }
      html += '<th style="padding:8px;text-align:center;font-weight:700;overflow:hidden;text-overflow:ellipsis">Admission %</th>';
      html += '<th style="padding:8px;text-align:right;font-weight:700;overflow:hidden;text-overflow:ellipsis">' + tuitionLabel + '</th>';
      html += '<th style="padding:8px;text-align:right;font-weight:700;overflow:hidden;text-overflow:ellipsis">Students</th>';
      html += '<th style="padding:8px;text-align:left;font-weight:700;overflow:hidden;text-overflow:ellipsis">Programs</th>';
      html += '<th style="padding:8px;text-align:center;font-weight:700;overflow:hidden;text-overflow:ellipsis;word-wrap:break-word">Selectivity</th>';
      html += '</tr></thead>';
      html += '<tbody>';
      
      filteredUnis.forEach(u => {
        const locationStr = u.country === 'us'
          ? (u.city ? (u.city.includes(',') ? u.city : `${u.city}, ${u.state}`) : u.state)
          : u.city;

        // Determine tuition to display
        let tuitionDisplay = `$${parseInt(u.tuition).toLocaleString()}`;
        let tuitionNote = '';

        if(countryCode === 'us') {
          // For US universities, show tuition based on preference
          if(S.inStateTuitionPref === 'in-state-public' && u.tuition_instate) {
            tuitionDisplay = `$${parseInt(u.tuition_instate).toLocaleString()}`;
          } else if(S.inStateTuitionPref === 'out-of-state-public' && u.tuition_outofstate) {
            tuitionDisplay = `$${parseInt(u.tuition_outofstate).toLocaleString()}`;
          } else if(S.inStateTuitionPref === 'private') {
            // For private universities, use the main tuition field
            tuitionDisplay = `$${parseInt(u.tuition).toLocaleString()}`;
          } else {
            tuitionDisplay = `$${parseInt(u.tuition).toLocaleString()}`;
          }
        } else if(u.country !== 'us' && S.citizen && S.citizen.length > 0) {
          // Prioritize EU citizenship if present
          const hasEU = S.citizen.includes('EU');
          const hasUS = S.citizen.includes('US');

          if(hasEU && u.tuition_eu !== undefined) {
            // Use EU rate from universities.json
            const euRate = parseInt(u.tuition_eu);
            if(euRate === 0) {
              tuitionDisplay = 'FREE';
            } else {
              tuitionDisplay = `$${euRate.toLocaleString()}`;
            }
            tuitionNote = ` ${u.tuition_eu_note || '(EU rate)'}`;
          } else if(hasUS) {
            // US citizens pay international rates everywhere
            tuitionNote = ' (intl)';
          }
        }

        // Find which selected careers this university offers
        const offeredCareers = [];
        S.subCareers.forEach(career => {
          const careerUnis = careerUniMap[career] || [];
          if(careerUnis.some(cu => cu.name === u.name)){
            offeredCareers.push(career);
          }
        });

        const programsStr = offeredCareers.length > 0 ? offeredCareers.join(', ') : '—';
        const selectivityColor = u.selectivity === 'Very selective' ? '#c83232' : u.selectivity === 'Selective' ? '#9664c8' : '#6496c8';
        const selectivityBg = u.selectivity === 'Very selective' ? 'rgba(200,50,50,.2)' : u.selectivity === 'Selective' ? 'rgba(150,100,200,.2)' : 'rgba(100,150,200,.2)';

        const studentPop = u.student_pop ? parseInt(u.student_pop).toLocaleString() : '—';
        const uniType = u.country === 'us' ? (u.type === 'Public' ? 'Public' : 'Private') : null;

        html += `<tr style="border-bottom:1px solid rgba(100,150,200,.15);background:#fff" onmouseover="this.style.background='rgba(100,150,200,.08)'" onmouseout="this.style.background='#fff'">
          <td style="padding:8px;background:rgba(241,245,249,.5)"><strong>${u.name}</strong></td>
          <td style="padding:8px;background:#fff">${locationStr}</td>`;
        if(countryCode === 'us'){
          html += `<td style="padding:8px;background:#fff">${uniType}</td>`;
        }
        html += `<td style="padding:8px;text-align:center;background:#fff">${parseFloat(u.acceptance_rate).toFixed(1)}%</td>
          <td style="padding:8px;text-align:right;color:var(--tx2);font-size:13px;background:#fff">${tuitionDisplay}<span style="font-size:13px;color:var(--tx2)">${tuitionNote}</span></td>
          <td style="padding:8px;text-align:right;color:var(--tx2);background:#fff">${studentPop}</td>
          <td style="padding:8px;font-size:13px;color:var(--tx1);background:#fff">${programsStr}</td>
          <td style="padding:8px;text-align:center;background:#fff"><span style="padding:2px 6px;border-radius:3px;font-size:13px;font-weight:600;background:${selectivityBg};color:${selectivityColor}">${SELECTIVITY_DISPLAY[u.selectivity] || u.selectivity}</span></td>
        </tr>`;
      });
      
      html += '</tbody></table>';
    }
    html += '</div>';
  });
  
  // Build stacked carousel sections for mobile (one section per country)
  let carouselHTML = '<div class="uni-carousel-wrap" id="uni-carousel">';
  
  S.cc.forEach(country => {
    const countryCode = countryCodeMap[country] || country;
    
    // Collect all universities for this country across all careers
    const allCountryUnis = new Map();
    
    Object.values(careerUniMap).forEach(unis => {
      unis.filter(u => u.country === countryCode).forEach(u => {
        if(!allCountryUnis.has(u.name)) {
          allCountryUnis.set(u.name, u);
        }
      });
    });
    
    // Apply filters (same as table)
    let filteredUnis = Array.from(allCountryUnis.values());
    
    const selectedSubjects = new Set();
    S.subCareers.forEach(career => {
      const qsSubject = CAREER_TO_QS_SUBJECT[career];
      if(qsSubject) selectedSubjects.add(qsSubject);
    });
    
    filteredUnis = filteredUnis.filter(u => {
      if (!u.programs) return true;
      const hasProgram = u.programs.some(p => selectedSubjects.has(p));
      return hasProgram;
    });
    
    // Apply selectivity filter (multi-select)
    if(S.uniSelectivity && S.uniSelectivity.length > 0){
      filteredUnis = filteredUnis.filter(u => S.uniSelectivity.includes(u.selectivity));
    }

    if(countryCode === 'us' && S.inStateTuitionPref){
      if(S.inStateTuitionPref === 'in-state-public' && S.stateOfResidency){
        // Show only public universities in the selected state
        filteredUnis = filteredUnis.filter(u => u.state === S.stateOfResidency && u.type === 'Public');
      } else if(S.inStateTuitionPref === 'out-of-state-public' && S.stateOfResidency){
        // Show only public universities NOT in the selected state
        filteredUnis = filteredUnis.filter(u => u.state !== S.stateOfResidency && u.type === 'Public');
      } else if(S.inStateTuitionPref === 'private'){
        // Show only private universities
        filteredUnis = filteredUnis.filter(u => u.type !== 'Public');
      }
    }
    
    filteredUnis.sort((a,b) => parseFloat(a.acceptance_rate) - parseFloat(b.acceptance_rate));
    
    // Build carousel slide for this country
    carouselHTML += buildUniversitiesCarouselByCountry({ country, countryCode, universities: filteredUnis, careerUniMap });
  });
  
  carouselHTML += '</div>';
  
  // Wrap table in container div
  const tableContainerHTML = `<div class="uni-table-container">${html}</div>`;
  
  host.innerHTML = tableContainerHTML + carouselHTML;
  
  // Initialize carousels for each country section
  setTimeout(() => {
    const countryWrappers = document.querySelectorAll('.uni-country-carousel-wrap');
    countryWrappers.forEach((wrapper, idx) => {
      const id = `uni-country-${idx}`;
      wrapper.id = id;
      initCarousel(id, '.uni-country-carousel');
    });
  }, 50);
}


function renderScholar(){
  const host=document.getElementById('scholar-table');
  if(!host) return;
  if(!CAREERS_LOADED){host.innerHTML='<p>Loading careers...</p>';setTimeout(renderScholar,100);return}

  // Render country pills
  const pillsHost = document.getElementById('scholar-cc-pills');
  if(pillsHost) {
    let h = '';
    Object.entries(COUNTRIES).forEach(([k,v]) => {
      h += `<div class="pill${S.cc.includes(k) ? ' on' : ''}" onclick="togCC('${k}'); renderScholar()"><img src="${v.flag}" style="height:0.9em;vertical-align:middle"> ${v.name}</div>`;
    });
    pillsHost.innerHTML = h;
  }

  // Assumption: user has BOTH US and EU citizenship.
  const sel = (Array.isArray(S.cc) && S.cc.length) ? S.cc.filter(k => COUNTRIES[k]) : [];
  if(!sel.length){
    host.innerHTML=guidanceMsg('Select a country to view details');
    return;
  }

  // This tab is intentionally about free contributions only.
  // If an item is primarily a LOAN or repayable support, we mark it N/A here.
  // We separate the main scholarship categories and embed "how to apply" in each.


  function info(k){
    // Default mapping for countries not yet fully modeled.
    return getCountryFunding(k) || {
      need:{what:'Varies',apply:'Check official sources',notes:''},
      merit:{what:'Varies',apply:'Check official sources',notes:''},
      external:{what:'Varies',apply:'Check official sources',notes:''},
      free:{what:'Varies',apply:'Check official sources',notes:''},
      timeline:'Varies',
      links:[]
    };
  }

  function keyLinks(k){
 const d=info(k);
 const links=[];
    (Array.isArray(d.links)?d.links:[]).forEach(x=>links.push(x));
    const res=getCountryResources(k) || [];
    res.slice(0,3).forEach(r=>links.push({t:r.t,u:r.u}));
    const seen=new Set();
    const uniq=[];
    links.forEach(l=>{ if(!l.u || seen.has(l.u)) return; seen.add(l.u); uniq.push(l); });
    const html = uniq.slice(0,6).map(l=>'<a href="'+l.u+'" target="_blank">'+l.t+'</a>').join(', ');
    return html || 'Check university website for funding opportunities';
  }

  // Row helpers: embed how-to in each category.
  function catCell(k, cat){
    const d=info(k);
    const c=d[cat] || {};
    const what=c.what || 'N/A';
    const apply=c.apply || '';
    const notes=c.notes || '';
    let out='<b>What:</b> '+what;
    if(apply) out+='<br><b>How:</b> '+apply;
    if(notes) out+='<br><span class="note"><b>Note:</b> '+notes+'</span>';
    return out;
  }

  const rows=[
    ['Need based aid', k => catCell(k,'need')],
    ['Merit based aid', k => catCell(k,'merit')],
    ['External aid', k => catCell(k,'external')],
    ['Other aid', k => catCell(k,'free')],
    ['Typical timeline', k => (info(k).timeline || 'Varies')],
    ['Key links', k => (keyLinks(k) || '')]
  ];

  const t = buildTableHTML(rows, sel, (k) => `<img src="${COUNTRIES[k].flag}" style="height:0.9em;vertical-align:middle"> ${COUNTRIES[k].name}`, 'scholar-table');
  let insights=[];
  // Insights are now only on Insights tab
  
  // Mobile carousel
  const carouselRows = rows.map(([label, fn]) => [
    label,
    (k) => {
      const cellHtml = fn(k);
      return `<div style="font-size:13px;line-height:1.4">${cellHtml}</div>`;
    }
  ]);
  
  const carousel = buildCarouselHTML(carouselRows, sel, (k) => `<img src="${COUNTRIES[k].flag}" style="height:0.9em;vertical-align:middle"> ${COUNTRIES[k].name}`, 'scholar-carousel');
  host.innerHTML = t + carousel;
  
  // Initialize carousel
  setTimeout(()=>initCarousel('scholar-carousel'), 50);
}
function renderCostChips(){const el=document.getElementById('cost-chips');if(!COUNTRIES_LOADED){el.innerHTML='Loading...';setTimeout(renderCostChips,100);return;}let h='';Object.entries(COUNTRIES).forEach(([k,v])=>{h+=`<div class="pill${S.costCC.includes(k)?' on':''}" onclick="togCost('${k}')"><img src="${v.flag}" style="height:0.9em;vertical-align:middle"> ${v.name}</div>`});el.innerHTML=h;const pubprivToggle=document.getElementById('pubpriv-toggle');const instateToggle=document.getElementById('instate-toggle');if(S.costCC.includes('us')){pubprivToggle.style.display='block';updatePubPrivToggleUI();if(!S.usUniversityType)S.usUniversityType='public';if(S.usUniversityType==='public'){instateToggle.style.display='block';if(S.stateOfResidency){instateToggle.style.pointerEvents='auto';instateToggle.style.opacity='1';const title=document.getElementById('instate-title');const stateInstate=TUITION_AVERAGES.instate[S.stateOfResidency]||8000;title.textContent='Tuition for '+S.stateOfResidency+' resident';document.getElementById('instate-out').textContent='Out-of-state (~$'+Math.round(TUITION_AVERAGES.outofstate/1000)+'k/yr)';document.getElementById('instate-in').textContent='In-state (~$'+Math.round(stateInstate/1000)+'k/yr)';if(S.inStateToggle===false){S.inStateToggle=true;toggleInStateTuition(true)}else{updateInStateToggleUI()}}else{instateToggle.style.pointerEvents='none';instateToggle.style.opacity='0.5';const title=document.getElementById('instate-title');title.textContent='Select a state of residency on the Discovery tab';}}else{instateToggle.style.display='none';S.inStateToggle=false}}else{pubprivToggle.style.display='none';instateToggle.style.display='none';S.usUniversityType=null;S.inStateToggle=false}renderCostTable()}
function toggleInStateTuition(isInstate){S.inStateToggle=isInstate;saveState();const instateIn=document.getElementById('instate-in');const instateOut=document.getElementById('instate-out');if(isInstate){instateIn.classList.add('on');instateOut.classList.remove('on')}else{instateOut.classList.add('on');instateIn.classList.remove('on')}}
function setUSUniversityType(type){S.usUniversityType=type;saveState();updatePubPrivToggleUI();renderCostChips()}
function updatePubPrivToggleUI(){const publicBtn=document.getElementById('pubpriv-public');const privateBtn=document.getElementById('pubpriv-private');if(S.usUniversityType==='private'){privateBtn.classList.add('on');publicBtn.classList.remove('on')}else{publicBtn.classList.add('on');privateBtn.classList.remove('on')}}
function updateInStateToggleUI(){const instateIn=document.getElementById('instate-in');const instateOut=document.getElementById('instate-out');if(S.inStateToggle){instateIn.classList.add('on');instateOut.classList.remove('on')}else{instateOut.classList.add('on');instateIn.classList.remove('on')}}
function getUSBaseTuition(){const type=S.usUniversityType||'public';if(type==='private'){return TUITION_AVERAGES.private}if(S.inStateToggle){const state=S.stateOfResidency;if(state&&TUITION_AVERAGES.instate[state]){return TUITION_AVERAGES.instate[state]}return 8000}return TUITION_AVERAGES.outofstate}
function togCost(k){if(S.costCC.includes(k))S.costCC=S.costCC.filter(x=>x!==k);else S.costCC.push(k);saveState();renderCostChips()}
// ===== COST CALCULATION HELPER =====
function calculateCostData(countryCode, scholarship, savingsTotal, workContrib, parentContrib, interestRate, loanYears) {
  const rate = interestRate / 100 / 12;
  const months = loanYears * 12;

  // Get base tuition (handles NC in-state filter for US)
  const baseTuition = (countryCode === 'us') ? getUSBaseTuition() : getCountryCostTuition(countryCode);

  const c = getCountryCostBreakdown(countryCode) || {room: 0, books: 0, personal: 0, travel: 0};
  const adjTui = Math.max(0, Math.round(baseTuition - scholarship));
  const yearTotal = adjTui + (c.room || 0) + (c.books || 0) + (c.personal || 0) + (c.travel || 0);
  const y = parseFloat(getCountryDuration(countryCode));
  const annualSavings = savingsTotal / y;
  const totalSupport = workContrib + parentContrib + annualSavings;
  const afterSupport = Math.max(0, yearTotal - totalSupport);

  const totalCost = afterSupport * y;

  let monthlyPayment = 0;
  let totalRepaid = 0;
  if (totalCost > 0 && rate > 0) {
    monthlyPayment = totalCost * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    totalRepaid = monthlyPayment * months;
  } else if (totalCost > 0) {
    totalRepaid = totalCost;
  }

  const interest = totalRepaid - totalCost;

  let tuitionDetails = getCountryTuitionNote(countryCode);
  if(countryCode === 'us'){
    const type = S.usUniversityType || 'public';
    if(type === 'private'){
      tuitionDetails = 'Private university average: $' + TUITION_AVERAGES.private.toLocaleString() + '/yr';
    } else if(S.inStateToggle && S.stateOfResidency){
      const stateAvg = TUITION_AVERAGES.instate[S.stateOfResidency] || 8000;
      tuitionDetails = S.stateOfResidency + ' public in-state average: $' + stateAvg.toLocaleString() + '/yr';
    } else {
      tuitionDetails = 'National public out-of-state average: $' + TUITION_AVERAGES.outofstate.toLocaleString() + '/yr';
    }
  }

  return {
    tuition: adjTui,
    housing: c.room,
    books: c.books,
    personal: c.personal,
    travel: c.travel,
    tuitionDetails: tuitionDetails,
    years: y,
    totalCost,
    monthlyPayment: Math.round(monthlyPayment),
    totalRepaid: Math.round(totalRepaid),
    interest: Math.round(interest)
  };
}

function renderCostTable(){
  const sel=S.costCC;
  const el=document.getElementById('cost-table');
  const sr=document.getElementById('cost-sliders');
  const pgDiscl=document.getElementById('postgrad-disclaimer');
  
  if(!sel.length){
    el.innerHTML=guidanceMsg('Select a country to view details');
    sr.style.display='none';
    pgDiscl.style.display='none';
    return;
  }
  
  sr.style.display='block';
  
  // Post-grad disclaimer - always display
  pgDiscl.style.display='block';
  let msg='The costs shown below are for undergraduate/bachelor\'s degree programs only. If you pursue graduate or postgraduate studies, plan for additional years of tuition and living costs. PhD programs are often paid for via assistantships, but this varies by field and by school.';
  document.getElementById('postgrad-message').innerHTML=msg;
  
  // Get slider values
  const scholarshipAmount=+document.getElementById('sl-schol').value;
  const savingsTotal=+(document.getElementById('sl-savings')?.value||0);
  const work=+document.getElementById('sl-work').value;
  const parent=+(document.getElementById('sl-parent')?.value||0);
  const rate=+document.getElementById('sl-rate').value/100/12;
  const yrs=+document.getElementById('sl-yrs').value;
  const months=yrs*12;

  // Store slider values in state (keep as numbers for proper restoration)
  S.scholarshipAmount = +document.getElementById('sl-schol').value;
  S.collegeSavings = savingsTotal > 0 ? savingsTotal : null;
  S.partTimeWork = work > 0 ? work : null;
  S.familySupport = parent > 0 ? parent : null;
  S.loanRate = +document.getElementById('sl-rate').value;
  S.loanRepaymentYears = yrs;

  // Update slider display values
  document.getElementById('sl-schol-v').textContent=fmt(document.getElementById('sl-schol').value);
  if(document.getElementById('sl-savings-v')){
    document.getElementById('sl-savings-v').textContent=fmt(savingsTotal);
  }
  if(document.getElementById('sl-parent-v')){
    document.getElementById('sl-parent-v').textContent=fmt(parent)+'/yr';
  }
  document.getElementById('sl-work-v').textContent=fmt(work)+'/yr';
  document.getElementById('sl-rate-v').textContent=document.getElementById('sl-rate').value+'%';
  document.getElementById('sl-yrs-v').textContent=yrs+' yrs';
  
  // Calculate data for all selected countries
  const costDataMap={};
  sel.forEach(k=>{
    costDataMap[k]=calculateCostData(k, document.getElementById('sl-schol').value, savingsTotal, work, parent, document.getElementById('sl-rate').value, yrs);
  });
  
  // Build table HTML
  const rows=[['Tuition','tui'],['Housing & Food','room'],['Books & Supplies','books'],['Personal / Living','personal'],['Travel','travel']];
  let t='<table class="ct"><thead><tr><th></th>';
  
  sel.forEach(k=>{
    t+=`<th class="ch"><img src="${COUNTRIES[k].flag}" style="height:0.9em;vertical-align:middle"> ${COUNTRIES[k].name} <span class="xr" onclick="togCost('${k}')">✕</span></th>`;
  });
  t+='</tr></thead><tbody>';
  
  // Tuition Details row
  t+='<tr class="res-row"><td class="al">Tuition Details</td>';
  sel.forEach(k=>{
    t+=`<td>${costDataMap[k].tuitionDetails}</td>`;
  });
  t+='</tr>';
  
  // Detail rows
  rows.forEach(([l,a])=>{
    t+='<tr><td class="al">'+l+'</td>';
    sel.forEach(k=>{
      const data=costDataMap[k];
      let v=0;
      if(a==='tui')v=data.tuition;
      else if(a==='room')v=data.housing;
      else if(a==='books')v=data.books;
      else if(a==='personal')v=data.personal;
      else if(a==='travel')v=data.travel;
      
      const cls=(a==='tui'&&v<=0)?' class="win"':'';
      t+=`<td${cls}>${fmt(Math.max(0,v))}/yr${a==='tui'&&scholarshipAmount>0?' <span style="color:var(--ok);font-size:12px">(−'+fmt(scholarshipAmount)+')</span>':''}</td>`;
    });
    t+='</tr>';
  });
  
  // Find max for cost bar scaling
  const mx=Math.max(1,...sel.map(k=>costDataMap[k].totalCost));
  
  // Total cost after support
  const totalSupport = scholarshipAmount + savingsTotal + (work * (sel[0] ? costDataMap[sel[0]].years : 4)) + (parent * (sel[0] ? costDataMap[sel[0]].years : 4));
  t+='<tr style="font-weight:700"><td class="al">Total cost after support</td>';
  sel.forEach(k=>{
    const data=costDataMap[k];
    const pct=Math.round(data.totalCost/mx*100);
    const col=pct<35?'var(--ok)':pct<65?'var(--warn)':'var(--bad)';
    t+=`<td>${fmt(data.totalCost)} ${totalSupport>0?'<span style="color:var(--ok);font-size:12px">(−'+fmt(totalSupport)+')</span>':''}  <span style="font-weight:400;font-size:12px">(${data.years} yr)</span><br><div class="cost-bar" style="width:${Math.max(pct,10)}%;background:${col}">${fmt(data.totalCost)}</div></td>`;
  });
  t+='</tr>';
  
  // Monthly payment
  t+='<tr style="border-top:2px solid var(--bdr);padding-top:8px"><td class="al" style="font-weight:600">Monthly loan payment</td>';
  sel.forEach(k=>{
    const data=costDataMap[k];
    t+=`<td style="font-weight:600">${fmt(data.monthlyPayment)}/mo <span style="color:var(--tx2);font-size:12px">for ${yrs} years</span></td>`;
  });
  t+='</tr>';
  
  // Total repaid
  t+='<tr><td class="al">Total repaid</td>';
  sel.forEach(k=>{
    const data=costDataMap[k];
    t+=`<td>${fmt(data.totalRepaid)} <span style="color:var(--tx2);font-size:12px">paying back over ${yrs} years at ${document.getElementById('sl-rate').value}%</span></td>`;
  });
  t+='</tr>';
  
  // Interest
  t+='<tr><td class="al">Interest beyond borrowed</td>';
  sel.forEach(k=>{
    const data=costDataMap[k];
    t+=`<td>${fmt(data.interest)} <span style="color:var(--tx2);font-size:12px">extra cost of borrowing</span></td>`;
  });
  t+='</tr>';
  
  t+='</tbody></table>';
  
  // Build carousel for mobile
  const carouselRows=[
    ['Tuition Details',k=>costDataMap[k].tuitionDetails],
    ['Tuition',k=>`${fmt(costDataMap[k].tuition)}/yr${scholarshipAmount>0?' <span style="color:var(--ok);font-size:12px">(−'+fmt(scholarshipAmount)+')</span>':''}`],
    ['Housing & Food',k=>`${fmt(costDataMap[k].housing)}/yr`],
    ['Books & Supplies',k=>`${fmt(costDataMap[k].books)}/yr`],
    ['Personal / Living',k=>`${fmt(costDataMap[k].personal)}/yr`],
    ['Travel',k=>`${fmt(costDataMap[k].travel)}/yr`],
    ['Total cost after support',k=>`${fmt(costDataMap[k].totalCost)} ${totalSupport>0?'<span style="color:var(--ok);font-size:12px">(−'+fmt(totalSupport)+')</span>':''}`],
    ['Monthly loan payment',k=>`${fmt(costDataMap[k].monthlyPayment)}/mo for ${yrs} years`],
    ['Total repaid',k=>`${fmt(costDataMap[k].totalRepaid)}`],
    ['Interest beyond borrowed',k=>`${fmt(costDataMap[k].interest)}`]
  ];

  const carousel = buildCarouselHTML(carouselRows, sel, (k) => `<img src="${COUNTRIES[k].flag}" style="height:0.9em;vertical-align:middle"> ${COUNTRIES[k].name}`, 'cost-carousel');

  el.innerHTML=t+carousel;
  initCarousel('cost-carousel');
  
  // Insights
  let insights=[];
  if(S.cost){
    const costInsight=getCostInsight(sel,S.cost);
    if(costInsight)insights.push(costInsight);
  }
  if(S.debtYrs){
    const debtInsight=getDebtInsight(sel,S.debtYrs);
    if(debtInsight)insights.push(debtInsight);
  }
  if(S.lang&&sel.length>0){
    const langInsight=getLanguageInsight(sel[0],S.lang);
    if(langInsight)insights.push(langInsight);
  }
}
// Track the selected country for transition view (local toggle, not persisted)
let transitionSelectedCountry = null;

function setTransitionCountry(cc) {
  transitionSelectedCountry = cc;
  renderTransition();
}

function renderTransition(){
  const countries = window.COUNTRIES || {};

  if(!COUNTRIES_LOADED) {
    document.getElementById('transition-content').innerHTML = '<p>Loading...</p>';
    setTimeout(renderTransition, 100);
    return;
  }

  const validCareers = (S.subCareers || []).filter(c => c);
  const validCountries = (S.cc || []).filter(c => c);

  if(validCareers.length === 0 || validCountries.length === 0) {
    document.getElementById('transition-content').innerHTML = guidanceMsg('Select at least one career on the Careers tab and one country on the Countries tab to view post-graduation scenarios');
    return;
  }

  // Initialize selected country to first in list if not set
  if(!transitionSelectedCountry || !validCountries.includes(transitionSelectedCountry)) {
    transitionSelectedCountry = validCountries[0];
  }

  const rate = +(document.getElementById('sl-rate')?.value || 5.5) / 100 / 12;
  const yrs = +(document.getElementById('sl-yrs')?.value || 10);
  const months = yrs * 12;

  let html = '';

  // Add country selector
  html += `<div class="qb"><div class="ql">Filter by university location</div><div class="qt">Select a university location to model post-graduation budgets below</div><div class="qs">The university locations and funding sources you've chosen on the <a href="javascript:void(0)" onclick="go('costs')" style="color:var(--ac);cursor:pointer;text-decoration:underline">Costs tab</a> model what your monthly loan payment would be post-graduation.   Choose one of those scenarios here to visualize.</div></div>`;
  html += `<div class="pills" style="margin-bottom:20px">`;
  validCountries.forEach(cc => {
    const country = countries[cc];
    if(!country) return;
    html += `<div class="pill${transitionSelectedCountry === cc ? ' on' : ''}" onclick="setTransitionCountry('${cc}')" style="cursor:pointer"><img src="${country.flag}" style="height:0.9em;vertical-align:middle;margin-right:6px">${country.name}</div>`;
  });
  html += `</div>`;

  // Post-grad disclaimer
  html += `<div style="background:rgba(234,179,8,.08);border:1px solid rgba(234,179,8,.2);border-radius:6px;padding:16px;margin:16px 0;font-size:13px;line-height:1.6"><div style="color:var(--warn);font-weight:600;margin-bottom:8px">⚠️ Post-graduate degree costs not estimated below</div><div style="color:var(--tx1)">The scenarios below show undergraduate/bachelor\'s degree costs only. If you pursue graduate or postgraduate studies, plan for additional years of tuition and living costs. PhD programs are often paid for via assistantships, but this varies by field and by school.</div></div>`;

  // Get the selected country data
  const selectedCountry = countries[transitionSelectedCountry];
  if(!selectedCountry) {
    document.getElementById('transition-content').innerHTML = html + '<p style="color:var(--tx2)">Country data not available</p>';
    return;
  }

  const costData = calculateCostData(transitionSelectedCountry, S.scholarshipAmount || 0, S.collegeSavings || 0, S.partTimeWork || 0, S.familySupport || 0, S.loanRate || 5.5, yrs);

  // Generate one table per career for the selected country
  validCareers.forEach(career => {
    html += `<h4 style="margin:16px 0 8px 0;color:var(--tx1);font-size:14px;font-weight:600"><b>Career:</b> ${career}</h4>`;
    html += buildTransitionCareerTable(career, transitionSelectedCountry, costData);
  });

  document.getElementById('transition-content').innerHTML = html;

  // Initialize carousels for each career
  setTimeout(() => {
    validCareers.forEach(career => {
      const carouselId = 'tc-' + career.replace(/\W+/g, '-').toLowerCase();
      if(document.getElementById(carouselId)) {
        initCarousel(carouselId);
      }
    });
  }, 50);
}

function buildTransitionCareerTable(career, studyCountry, costData) {
  const countries = window.COUNTRIES || {};
  const sub = getSub(career);
  const country = countries[studyCountry];

  if(!sub || !country) return '—';

  const monthlyDebt = costData.monthlyPayment;

  // Cost of living varies by work location
  const usBreakdown = countries['us'].costBreakdown || {room: 0, personal: 0, travel: 0};
  const usColMonthly = Math.round((usBreakdown.room + usBreakdown.personal + usBreakdown.travel) / 12);

  // EU COL: average of selected EU countries from Costs tab
  const euCountries = (S.cc || []).filter(cc => cc !== 'us');
  let euColTotal = 0;
  euCountries.forEach(cc => {
    const breakdown = countries[cc].costBreakdown || {room: 0, personal: 0, travel: 0};
    euColTotal += (breakdown.room + breakdown.personal + breakdown.travel) / 12;
  });
  const euColMonthly = euCountries.length > 0 ? Math.round(euColTotal / euCountries.length) : 0;

  // Calculate table values once (source of truth for both table and bar chart)
  const usAvgSalary = getAvgSalary(sub.salaryUS_min, sub.salaryUS_max);
  const euAvgSalary = getAvgSalary(sub.salaryEU_min, sub.salaryEU_max);

  // Make salary values available to metrics functions (either formatted string for display, or numeric for calculations)
  const salaryDisplayUS = formatMoneyRange(sub.salaryUS_min, sub.salaryUS_max);
  const salaryDisplayEU = formatMoneyRange(sub.salaryEU_min, sub.salaryEU_max);
  const usAfterTax = usAvgSalary ? Math.round(usAvgSalary * (1 - 0.20) / 12) : 0;
  const euAfterTax = euAvgSalary ? Math.round(euAvgSalary * (1 - 0.22) / 12) : 0;
  const usSurplus = usAfterTax - usColMonthly - monthlyDebt;
  const euSurplus = euAfterTax - euColMonthly - monthlyDebt;

  // Values for bar chart (extracted from table calculations above)
  const chartData = {
    us: {income: usAfterTax, living: usColMonthly, loan: monthlyDebt, surplus: usSurplus},
    eu: {income: euAfterTax, living: euColMonthly, loan: monthlyDebt, surplus: euSurplus},
    maxIncome: Math.max(usAfterTax, euAfterTax)
  };

  const metrics = [
    {label: 'Annual salary', sublabel: 'Estimated starting salary range.  An average is used for calculations', us: salaryDisplayUS, eu: salaryDisplayEU, color: 'var(--ok)'},
    {label: 'Taxes (20% US, 22% EU)', sublabel: 'Estimated income taxes', us: usAvgSalary, eu: euAvgSalary, color: 'var(--bad)', fn: (salary, isUS) => {
      if(!salary) return '—';
      const s = parseSalary(salary);
      if(!s) return '—';
      const taxRate = isUS ? 0.20 : 0.22;
      return `$${Math.round(s * taxRate).toLocaleString()}`;
    }},
    {label: 'Monthly income after taxes', sublabel: 'Your estimated monthly take home pay after taxes', us: usAvgSalary, eu: euAvgSalary, color: 'var(--ok)', fn: (salary, isUS) => {
      if(!salary) return '—';
      const s = parseSalary(salary);
      if(!s) return '—';
      const taxRate = isUS ? 0.20 : 0.22;
      const monthly = Math.round(s * (1 - taxRate) / 12);
      return `$${monthly.toLocaleString()}`;
    }},
    {label: 'Monthly cost of living', sublabel: 'Estimate of housing, food, travel, and personal experiences', us: null, eu: null, color: 'var(--bad)', fn: (salary, isUS) => {
      const col = isUS ? usColMonthly : euColMonthly;
      return `$${col.toLocaleString()}`;
    }},
    {label: 'Monthly loan payment', sublabel: 'Amount you would owe to repay loans each month', us: null, eu: null, color: 'var(--bad)', fn: () => `$${monthlyDebt.toLocaleString()}`},
    {label: 'Debt-to-Income', sublabel: 'How much of your monthly pay goes to repaying loans?', us: usAvgSalary, eu: euAvgSalary, color: 'var(--bad)', fn: (salary, isUS) => {
      if(!salary) return '—';
      const s = parseSalary(salary);
      if(!s) return '—';
      const taxRate = isUS ? 0.20 : 0.22;
      const monthly = s * (1 - taxRate) / 12;
      return `${(monthlyDebt / monthly * 100).toFixed(1)}%`;
    }},
    {label: null, sublabel: null, us: usAvgSalary, eu: euAvgSalary, fn: (salary, isUS) => {
      if(!salary) return {label: '—', html: '—'};
      const s = parseSalary(salary);
      if(!s) return {label: '—', html: '—'};
      const taxRate = isUS ? 0.20 : 0.22;
      const monthlyIncome = s * (1 - taxRate) / 12;
      const col = isUS ? usColMonthly : euColMonthly;
      const surplus = monthlyIncome - col - monthlyDebt;
      const label = surplus >= 0 ? 'Surplus or deficit/mo' : 'Surplus or deficit/mo';
      const color = surplus >= 0 ? 'var(--ok)' : 'var(--bad)';
      return {label, sublabel: 'Money left over after expenses and loan payments each month', html: `<span style="color:${color}">$${Math.round(Math.abs(surplus)).toLocaleString()}</span>`};
    }}
  ];

  let html = '<table class="ct" style="margin-bottom:16px"><thead><tr style="background:var(--lt)"><th style="padding:8px 10px;text-align:left;width:40%">Metric</th><th style="padding:8px 10px;text-align:center">Live/Work in US</th><th style="padding:8px 10px;text-align:center">Live/Work in EU</th></tr></thead><tbody>';

  metrics.forEach(({label, sublabel, us, eu, color, fn}) => {
    let usVal = us || '';
    let euVal = eu || '';
    let rowLabel = label;
    let rowSublabel = sublabel;

    if(fn) {
      const usResult = fn(us, true);
      usVal = usResult.html ? usResult.html : usResult;
      const euResult = fn(eu, false);
      euVal = euResult.html ? euResult.html : euResult;
      // For dynamic labels, use the label from the result
      if(usResult.label && euResult.label) {
        // If both have labels, use the US label (they should be the same)
        rowLabel = usResult.label;
        rowSublabel = usResult.sublabel;
      }
    }

    if(rowLabel) {
      html += `<tr style="border-bottom:1px solid var(--bdr)">`;
      const labelHtml = rowSublabel ? `<div style="font-weight:700">${rowLabel}</div><div style="font-size:12px;color:var(--tx2);font-weight:400;margin-top:4px">${rowSublabel}</div>` : `<div style="font-weight:700">${rowLabel}</div>`;
      html += `<td style="padding:8px 10px;font-size:13px;background:rgba(241,245,249,.5)">${labelHtml}</td>`;
      const cellStyle = color ? `color:${color};font-weight:600` : '';
      html += `<td style="padding:8px 10px;text-align:center;font-size:13px;${cellStyle}">${usVal}</td>`;
      html += `<td style="padding:8px 10px;text-align:center;font-size:13px;${cellStyle}">${euVal}</td>`;
      html += `</tr>`;
    }
  });

  // Bar chart visualization row (uses values from table above)
  const maxIncome = Math.max(chartData.us.income, chartData.eu.income);

  const buildHorizontalBar = (income, living, loan, surplus) => {
    if(income <= 0) return '<div style="font-size:11px;color:var(--tx2)">No data</div>';

    const expenses = living + loan;

    // Scale bars relative to max income (max income = 100% column width)
    const incomeBarWidth = (income / maxIncome) * 100;
    const expensesBarWidth = (expenses / maxIncome) * 100;

    const surplusLabel = surplus >= 0 ? 'Surplus' : 'Deficit';

    return `<div style="display:flex;flex-direction:column;gap:20px;align-items:center;justify-content:center;width:100%">
      <div style="text-align:left;width:100%">
        <div style="width:${incomeBarWidth}%;height:28px;border:1px solid var(--bdr);border-radius:4px;background:#2563eb;display:flex;align-items:center;padding-left:8px;color:white;font-size:11px;font-weight:500">Monthly take home pay: $${income.toFixed(0)}</div>

        <div style="margin-top:12px;width:${expensesBarWidth}%;height:28px;border:1px solid var(--bdr);border-radius:4px;background:${surplus >= 0 ? '#16a34a' : '#dc2626'};display:flex;align-items:center;padding-left:8px;color:white;font-size:11px;font-weight:500">Expenses: $${expenses.toFixed(0)}/mo</div>
      </div>
    </div>`;
  };

  html += `<tr style="border-top:2px solid var(--bdr)">`;
  const monthlyBudgetLabel = `<div style="font-weight:700">Monthly budget</div><div style="font-size:12px;color:var(--tx2);font-weight:400;margin-top:4px">Income vs. expenses. Green means you can afford it, red means you may struggle.</div>`;
  html += `<td style="padding:12px 10px;background:rgba(241,245,249,.5)">${monthlyBudgetLabel}</td>`;
  html += `<td style="padding:12px 10px;text-align:center">${buildHorizontalBar(chartData.us.income, chartData.us.living, chartData.us.loan, chartData.us.surplus)}</td>`;
  html += `<td style="padding:12px 10px;text-align:center">${buildHorizontalBar(chartData.eu.income, chartData.eu.living, chartData.eu.loan, chartData.eu.surplus)}</td>`;
  html += `</tr>`;

  html += '</tbody></table>';

  // Build mobile carousel with same data
  const carouselId = 'tc-' + career.replace(/\W+/g, '-').toLowerCase();

  // Helper to format label with sublabel (10px smaller)
  const labelWithSub = (title, sub) => `<b>${title}</b><div style="font-size:10px;color:var(--tx2);font-weight:400;margin-top:4px">${sub}</div>`;

  // Helper for single-scenario bar chart
  const buildSingleBar = (data) => {
    const income = data.income;
    const expenses = data.living + data.loan;
    const incomeW = (income / chartData.maxIncome) * 100;
    const expensesW = (expenses / chartData.maxIncome) * 100;
    const surplus = data.surplus;
    return `<div style="display:flex;flex-direction:column;gap:12px">
      <div style="width:${incomeW}%;height:28px;border:1px solid var(--bdr);border-radius:4px;background:#2563eb;display:flex;align-items:center;padding-left:8px;color:white;font-size:11px;font-weight:500">Monthly take home: $${income.toFixed(0)}</div>
      <div style="width:${expensesW}%;height:28px;border:1px solid var(--bdr);border-radius:4px;background:${surplus >= 0 ? '#16a34a' : '#dc2626'};display:flex;align-items:center;padding-left:8px;color:white;font-size:11px;font-weight:500">Expenses: $${expenses.toFixed(0)}/mo</div>
    </div>`;
  };

  const carouselRows = [
    [labelWithSub('Annual salary', 'Estimated starting salary range.  An average is used for calculations'),
     (key) => {
       const min = key === 'us' ? sub.salaryUS_min : sub.salaryEU_min;
       const max = key === 'us' ? sub.salaryUS_max : sub.salaryEU_max;
       if(!min || !max) return '—';
       return `<span style="color:var(--ok);font-weight:600">${formatMoneyRange(min, max)}</span>`;
     }],
    [labelWithSub('Taxes (20% US, 22% EU)', 'Estimated income taxes'),
     (key) => {
       const min = key === 'us' ? sub.salaryUS_min : sub.salaryEU_min;
       const max = key === 'us' ? sub.salaryUS_max : sub.salaryEU_max;
       if(!min || !max) return '—';
       const s = getAvgSalary(min, max);
       if(!s) return '—';
       const taxRate = key === 'us' ? 0.20 : 0.22;
       return `<span style="color:var(--bad);font-weight:600">$${Math.round(s * taxRate).toLocaleString()}</span>`;
     }],
    [labelWithSub('Monthly income after taxes', 'Your estimated monthly take home pay after taxes'),
     (key) => {
       const min = key === 'us' ? sub.salaryUS_min : sub.salaryEU_min;
       const max = key === 'us' ? sub.salaryUS_max : sub.salaryEU_max;
       if(!min || !max) return '—';
       const s = getAvgSalary(min, max);
       if(!s) return '—';
       const taxRate = key === 'us' ? 0.20 : 0.22;
       const monthly = Math.round(s * (1 - taxRate) / 12);
       return `<span style="color:var(--ok);font-weight:600">$${monthly.toLocaleString()}</span>`;
     }],
    [labelWithSub('Monthly cost of living', 'Estimate of housing, food, travel, and personal expenses'),
     (key) => {
       const col = key === 'us' ? usColMonthly : euColMonthly;
       return `<span style="color:var(--bad);font-weight:600">$${col.toLocaleString()}</span>`;
     }],
    [labelWithSub('Monthly loan payment', 'Amount you would owe to repay loans each month'),
     (key) => {
       return `<span style="color:var(--bad);font-weight:600">$${monthlyDebt.toLocaleString()}</span>`;
     }],
    [labelWithSub('Debt-to-Income', 'How much of your monthly pay goes to repaying loans?'),
     (key) => {
       const min = key === 'us' ? sub.salaryUS_min : sub.salaryEU_min;
       const max = key === 'us' ? sub.salaryUS_max : sub.salaryEU_max;
       if(!min || !max) return '—';
       const s = getAvgSalary(min, max);
       if(!s) return '—';
       const taxRate = key === 'us' ? 0.20 : 0.22;
       const monthly = s * (1 - taxRate) / 12;
       const pct = (monthlyDebt / monthly * 100).toFixed(1);
       return `<span style="color:var(--bad);font-weight:600">${pct}%</span>`;
     }],
    [labelWithSub('Surplus or deficit/mo', 'Money left over after expenses and loan payments each month'),
     (key) => {
       const data = key === 'us' ? chartData.us : chartData.eu;
       const color = data.surplus >= 0 ? 'var(--ok)' : 'var(--bad)';
       return `<span style="color:${color};font-weight:600">$${Math.round(Math.abs(data.surplus)).toLocaleString()}</span>`;
     }],
    [labelWithSub('Monthly budget', 'Money left over after expenses and loan payments each month. Green means you can afford it, red means you can\'t.'),
     (key) => buildSingleBar(key === 'us' ? chartData.us : chartData.eu)]
  ];

  const carousel = buildCarouselHTML(carouselRows, ['us', 'eu'], (key) => key === 'us' ? 'Live/Work in US' : 'Live/Work in EU', carouselId);
  html += carousel;

  return html;
}
function renderExChips(){const el=document.getElementById('ex-chips');if(!COUNTRIES_LOADED){el.innerHTML='Loading...';setTimeout(renderExChips,100);return;}let h='';Object.entries(COUNTRIES).forEach(([k,v])=>{h+=`<div class="pill${S.expl===k?' on':''}" onclick="selEx('${k}')"><img src="${v.flag}" style="height:0.9em;vertical-align:middle"> ${v.name}</div>`});el.innerHTML=h}
function selEx(k){S.expl=k;saveState();renderExChips();updateHdrCarousel();renderPath(k)}
let carouselTimer=null;

function scholarSummaryShort(k){
 const SM={
  us:{need:"Need-based grants via FAFSA/CSS.",merit:"Merit scholarships (automatic or competitive).",ext:"External scholarships: stackable awards.",free:"Public and institutional grants; COA caps apply."},
  uk:{need:"UK universities offer bursaries/grants for international students (varies by institution); Chevening Scholarships (competitive, government-funded) cover tuition + living costs; UCAS shows aid via individual university pages.",merit:"Entrance scholarships: Russell Group universities, London School of Economics, and other top-tier institutions offer merit awards (often £3,000–£15,000/yr); check university websites for specific criteria.",ext:"Commonwealth Scholarships, British Academy awards, and subject-specific funding (e.g., AHRC for humanities). External bodies rare for undergrad; more common for postgraduate.",free:"International students rarely qualify for full tuition waivers; scholarships offset partial costs. Plan baseline of ~£15–20k/yr total cost."},
  sweden:{need:"EU/EEA tuition is typically free.",merit:"Scholarships mainly for fee-paying non-EU/EEA.",ext:"External scholarships are limited.",free:"Tuition-free status is main lever; grants only if eligible."},
  germany:{need:"No US-style need packaging.",merit:"DAAD and foundations (often graduate or research).",ext:"Foundation awards vary.",free:"Low or zero tuition is main lever; some stipends exist."},
  netherlands:{need:"Limited broad scholarships for EU/EEA.",merit:"Excellence awards often target non-EEA.",ext:"External awards are narrower.",free:"Statutory tuition; scholarships not main lever."},
  france:{need:"CROUS and housing-related supports may apply if eligible.",merit:"Institution-specific awards.",ext:"Targeted programs (Campus France/institution).",free:"Low public tuition plus possible bursary or housing aid if eligible."},
  italy:{need:"DSU/right-to-study (ISEE) is a major lever.",merit:"University merit awards vary.",ext:"External exists; DSU/region often biggest.",free:"Fee reductions plus DSU benefits can reduce costs if eligible."},
  spain:{need:"National scholarships and financial aid exist; many are means-tested.",merit:"Some merit components and university awards exist.",ext:"Regional and private scholarships vary.",free:"Tuition support is possible through official scholarship calls."},
  denmark:{need:"SU grant supports living costs when eligible.",merit:"Support is mostly structural rather than merit-based.",ext:"External awards are narrower.",free:"EU/EEA tuition is free; SU may require equal status and work."},
  ireland:{need:"SUSI grants cover fees and/or maintenance when eligible.",merit:"Merit awards exist but are not the baseline.",ext:"Other supports exist; start with SUSI.",free:"Fee grants and maintenance grants depend on eligibility."},
  canada:{need:"Need-based support varies by institution.",merit:"Entrance scholarships are common.",ext:"EduCanada lists scholarships for non-Canadians (often exchange).",free:"Do not assume broad subsidies for international degree study."},
  australia:{need:"Scholarships and bursaries vary by provider and program.",merit:"University scholarships for international students are common.",ext:"Government programs exist (e.g., Australia Awards; targeted).",free:"Plan baseline budget assuming full fees."},
  singapore:{need:"Tuition Grant is a subsidy with bond for non-citizens.",merit:"University scholarships exist for high achievers.",ext:"External awards vary; check terms.",free:"Tuition Grant reduces tuition; bond obligations apply for PR/international."}
 };
 const m=SM[k]||{};
 return {need:m.need||"N/A",merit:m.merit||"Varies by institution/program",ext:m.ext||"Varies by institution/program",free:m.free||(getCountryFinancialAid(k)||"Varies"),note:"Loans and work-study are excluded here. Eligibility is country- and program-specific."};
}
function fundingNextSteps(k){
 const s=[];
 if(k==="us"){
  s.push("Submit FAFSA (and CSS Profile if required) early to unlock need-based grants.");
  s.push("Check each school merit scholarship policy (automatic vs separate application).");
  s.push("Build an external scholarship pipeline (databases + local/community) and reuse essays.");
 } else if(k==="uk"){
  s.push("Check UCAS and each university funding page for international scholarships and bursaries.");
  s.push("Search official scholarship finders for UK government and university awards (many are postgraduate-focused).");
  s.push("Treat funding as competitive; plan baseline budget assuming full fees.");
 } else if(k==="sweden"){
  s.push("Confirm EU/EEA tuition-free status (if applicable) and treat scholarships as upside.");
  s.push("If pursuing grants, check CSN grant eligibility rules (exclude loans).");
  s.push("For fee-paying scenarios, check university scholarships and Swedish Institute constraints.");
 } else if(k==="germany"){
  s.push("Use DAAD and university pages to find competitive scholarships (often graduate/research).");
  s.push("Confirm whether any support is a grant vs repayable.");
  s.push("Plan proof-of-funds requirements even with low tuition.");
 } else if(k==="netherlands"){
  s.push("Assume limited broad scholarships for EU/EEA; verify university awards by program.");
  s.push("Plan housing early; scholarships are rarely the main lever.");
  s.push("If fee-paying/non-EEA, check NL Scholarship and university awards.");
 } else if(k==="france"){
  s.push("If eligible, apply for CROUS needs-based bursary (DSE) within deadlines.");
  s.push("Apply for housing aid (CAF/APL/ALS) early if eligible.");
  s.push("Check institution-specific scholarships (especially grandes ecoles).");
 } else if(k==="italy"){
  s.push("Start income documentation early (ISEE/ISEE-equivalent) to access DSU and fee reductions.");
  s.push("Apply to the regional DSU call linked to your university/region.");
  s.push("Check university merit scholarships as additional upside.");
 } else if(k==="spain"){
  s.push("Use the official scholarships portal to find current calls for university studies.");
  s.push("Apply within the published window and respond to document requests promptly.");
  s.push("Check regional and university scholarship pages for additional awards.");
 } else if(k==="denmark"){
  s.push("Confirm EU/EEA tuition-free status and SU eligibility if you want the state grant.");
  s.push("If applying under EU rules, maintain qualifying work status while studying.");
  s.push("Use SU.dk and Life in Denmark guidance to complete equal status steps.");
 } else if(k==="ireland"){
  s.push("Use the SUSI eligibility indicator and apply early for the Student Grant Scheme.");
  s.push("Prepare income and residency documentation for means testing.");
  s.push("Check any institutional bursaries after you have your offer.");
 } else if(k==="canada"){
  s.push("Check each university for international entrance scholarships and application steps.");
  s.push("Use EduCanada to identify government scholarship opportunities for non-Canadians.");
  s.push("Ask admissions if awards are automatic or require a separate scholarship application.");
 } else if(k==="australia"){
  s.push("Start with the Australian Government guidance on financial assistance and scholarship types.");
  s.push("Check your university scholarship pages and deadlines (many are separate from admissions).");
  s.push("If relevant, review Australia Awards and other government programs.");
 } else if(k==="singapore"){
  s.push("Review MOE Tuition Grant Scheme requirements before accepting (includes a 3-year bond for PR/international).");
  s.push("Apply via the tuition grant system during enrolment and complete agreement steps.");
  s.push("Check university scholarship pages for merit awards and note any bond obligations.");
 } else {
  s.push("Check university and government pages for scholarships, grants, and waivers (loans excluded).");
  s.push("Track deadlines early; treat awards as program-specific.");
 }
 return s;

}
function scholarCardHTML(k){
 const s=scholarSummaryShort(k);
 return '<div class="cd"><h3>Scholarships & Free Money</h3>'+
  '<p><b>Need-based:</b> '+s.need+'</p>'+
  '<p><b>Merit:</b> '+s.merit+'</p>'+
  '<p><b>External:</b> '+s.ext+'</p>'+
  '<p><b>Other free money:</b> '+s.free+'</p>'+
  '<p class="note">'+s.note+'</p>'+
  '</div>';
}

function renderPath(k){
 if(carouselTimer) clearInterval(carouselTimer);
 const c=COUNTRIES[k];
 if(!c || !getCountryName(k)){document.getElementById('path-content').innerHTML=guidanceMsg('Select a country to view the full story');return;}
  const pathCountries = [k]; // Single country for Deep Dive view
  const y=parseFloat(getCountryDuration(k)||'0')||0;
 const cy={tui:getCountryCostTuition(k)||0,room:getCountryCostRoom(k)||0,books:getCountryCostBooks(k)||0,personal:getCountryCostPersonal(k)||0,travel:getCountryCostTravel(k)||0};
 const tot=(cy.tui+cy.room+cy.books+cy.personal+cy.travel)*y;
 const photos = getCountryPhotos(k) || [];

 let h = `<div class="qb" style="margin-top:14px"><div class="badge">${getCountryFlag(k)} Studying in ${getCountryName(k)}</div></div>`;

 


 h += `<div class="g2">`+
  `<div class="cd"><h3>Quick Facts</h3>`+
   `<p><b>Tuition:</b> ${getCountryTuition(k)||''}</p>`+
   `<p class="note">${getCountryTuitionNote(k)||''}</p>`+
   `<p style="margin-top:6px"><b>Degree:</b> ${getCountryDuration(k)} years</p>`+
   `<p><b>Language:</b> ${getCountryLanguage(k)||''}</p>`+
   `<p><b>Admissions:</b> ${getCountryAdmissions(k)||''}</p>`+
   `<p style="margin-top:6px"><b>Apply at:</b> <a href="https://www.${getCountryPortal(k)||''}" target="_blank" style="color:var(--pri)">${getCountryPortal(k)||''}</a></p>`+
  `</div>`+
  `<div class="cd"><h3>Cost Snapshot (USD)</h3>`+
   `<p><b>Tuition:</b> ${fmt(cy.tui)}/yr</p>`+
   `<p><b>Housing+food:</b> ${fmt(cy.room)}/yr</p>`+
   `<p><b>Other:</b> ${fmt(cy.books+cy.personal+cy.travel)}/yr</p>`+
   `<p style="margin-top:6px;font-weight:700">Total degree: ~${fmt(Math.round(tot))}</p>`+
   `<p style="margin-top:4px"><b>Aid:</b> ${getCountryFinancialAid(k)||''}</p>`+
  `</div>`+
 `</div>`;

 h += `<div class="g2">`+
   `${scholarCardHTML(k)}`+
   `<div class="cd"><h3>Student Life</h3><p>${getCountryCulture(k)||''}</p></div>`+
   `<div class="cd"><h3>After Graduation</h3><p>${getCountryPostGradOpportunities(k)||''}</p><p style="margin-top:6px"><b>Change majors:</b> ${getCountryChangePolicy(k)||''}</p></div>`+
 `</div>`;

 const stepsHtml = (()=>{
  const base=(getCountrySteps(k)||[]);
  const extra=fundingNextSteps(k);
  const out=[]; const seen=new Set();
  const add=(x)=>{const n=(x||'').trim(); if(!n) return; const key=n.toLowerCase(); if(seen.has(key)) return; seen.add(key); out.push(n);};
  extra.forEach(add);
  base.slice(0,6).forEach(add);
  return out.slice(0,6).map((s,i)=>'<div class=\"tli\"><b>Step '+(i+1)+':</b> '+s+'</div>').join('');
})();
h += `<div class=\"ss\"><h3>Your Timeline & Next Steps</h3><div>${stepsHtml}</div></div>`;

h += `<div class="ss"><h3>Key Decisions for ${getCountryName(k)}</h3>`+
   `${(getCountryFaqs(k)||[]).map(x=>`<div style="margin-bottom:10px"><div style="font-weight:700;font-size:13px;color:var(--dk);margin-bottom:2px">${x.q}</div><div style="font-size:13px;line-height:1.4">${x.a}</div></div>`).join('')}`+
 `</div>`;

 h += `<div class="ss"><h3>Resources for ${getCountryName(k)}</h3><ul class="rl">`+
   `${(getCountryResources(k)||[]).map(r=>`<li><a href="${r.u}" target="_blank">${r.t}</a></li>`).join('')}`+
 `</ul></div>`+
 `<div class="ss"><h3>Funding & Scholarships Links</h3><ul class="rl">`+
 `<li>${keyLinks(k)}</li>`+
 `</ul></div>`+

 `${guidanceMsg('This does not lock you in. Click a different country above to explore')}`;

 document.getElementById('path-content').innerHTML = h;

 

}


// Helper: Create a styled pill span for Discovery selections
function makePill(text) {
  return '<span style="font-weight:700;color:var(--pri)">' + text + '</span>';
}

// Generate narrative paragraph from Discovery selections
function generateNarrativeParagraph(monthlyPaymentMin = null, monthlyPaymentMax = null) {
  const discoveryParts = [];
  const financialParts = [];

  // ===== DISCOVERY NARRATIVE =====
  // Careers & Motivations
  if(S.cats.length > 0 && S.subCareers.length > 0 && S.motivations.length > 0) {
    const catNames = S.cats.map(k => getCategoryName(k)).join(', ');
    const careerNames = S.subCareers.join(', ');
    discoveryParts.push('You\'re broadly interested in ' + makePill(catNames) + ', more specifically ' + makePill(careerNames) + ', and motivated by ' + makePill(S.motivations.map(m => m.toLowerCase()).join(', ')) + '.');
  } else if(S.cats.length > 0 && S.subCareers.length > 0) {
    const catNames = S.cats.map(k => getCategoryName(k)).join(', ');
    const careerNames = S.subCareers.join(', ');
    discoveryParts.push('You\'re broadly interested in ' + makePill(catNames) + ', more specifically ' + makePill(careerNames) + '.');
  } else if(S.cats.length > 0 && S.motivations.length > 0) {
    const catNames = S.cats.map(k => getCategoryName(k)).join(', ');
    discoveryParts.push('You\'re interested in ' + makePill(catNames) + ', motivated by ' + makePill(S.motivations.map(m => m.toLowerCase()).join(', ')) + '.');
  } else if(S.cats.length > 0) {
    const catNames = S.cats.map(k => getCategoryName(k)).join(', ');
    discoveryParts.push('You\'re interested in ' + makePill(catNames) + '.');
  }
  // University location preferences (focus on US context)
  if(S.inStateTuitionPref) {
    const prefMap={'in-state-public':'in-state public','out-of-state-public':'out-of-state public','private':'private'};
    const prefText=prefMap[S.inStateTuitionPref]||S.inStateTuitionPref;
    discoveryParts.push('For US university selections, you favor ' + makePill(prefText) + ' universities.');
  }
  // Cost & Selectivity
  if(S.cost || (S.uniSelectivity && S.uniSelectivity.length > 0) || S.cc.length > 0) {
    let costParts = [];
    if(S.cost) costParts.push('Your view of total education cost suggests it is ' + makePill(S.cost.toLowerCase()));
    const countryList = S.cc.length > 0 && COUNTRIES_LOADED ? Object.entries(COUNTRIES).filter(([k,v]) => S.cc.includes(k)).map(([k,v]) => v.name).join(', ') : '';
    const selectivityText = S.uniSelectivity && S.uniSelectivity.length > 0 ? S.uniSelectivity.map(s => s.toLowerCase()).join(' and ') : '';
    if(selectivityText && countryList) costParts.push('and you\'re considering universities in ' + makePill(countryList) + ' that are ' + makePill(selectivityText) + ' in their admission process');
    else if(selectivityText) costParts.push('and you\'re considering universities that are ' + makePill(selectivityText) + ' in their admission process');
    if(costParts.length > 0) discoveryParts.push(costParts.join(', ') + '.');
  }
  // Vision
  if(S.vision) {
    const visionMap = {'In the US': 'in the US', 'In Europe': 'in Europe', 'Anywhere globally': 'anywhere globally'};
    const visionText = visionMap[S.vision] || S.vision;
    discoveryParts.push('In 5 years, you are considering living and working ' + makePill(visionText) + '.');
  }
  // Languages
  if(S.lang || (S.languages && S.languages.length > 0)) {
    let langParts = [];
    if(S.lang) langParts.push('You\'re a ' + makePill(S.lang.toLowerCase()) + ' with fluent or conversational proficiency in');
    if(S.languages && S.languages.length > 0) langParts.push(makePill(S.languages.join(', ')));
    if(langParts.length > 0) discoveryParts.push(langParts.join(' ') + '.');
  }
  // Citizenship
  if(S.citizen && S.citizen.length > 0) {
    discoveryParts.push('As a citizen of ' + makePill(S.citizen.join(' and ')) + ', you may be eligible for financial aid, reduced tuition costs, healthcare coverage, or other benefits in applicable countries.');
  }
  // Post-grad
  if(S.postGrad) {
    discoveryParts.push('Some jobs typically expect more schooling after completing an undergraduate degree — like a master\'s, PhD, medical degree, or law degree.  For these career options, you\'re ' + makePill(S.postGrad.toLowerCase()) + ' degree programs.');
  }

  // ===== FINANCIAL NARRATIVE =====
  if(S.scholarshipAmount || S.collegeSavings) {
    let scholarshipParts = [];
    if(S.scholarshipAmount) scholarshipParts.push('You anticipate scholarships or grants will reduce your tuition by ' + makePill(fmt(S.scholarshipAmount)));
    if(S.collegeSavings) scholarshipParts.push('and you have college savings of ' + makePill('$' + S.collegeSavings.toLocaleString()) + ' to contribute to the total cost of your education');
    if(scholarshipParts.length > 0) financialParts.push(scholarshipParts.join(', ') + '.');
  }

  if(S.partTimeWork || S.familySupport) {
    let fundingParts = [];
    if(S.partTimeWork) fundingParts.push('You are considering a part-time job while in school, and expect to contribute ' + makePill('$' + S.partTimeWork.toLocaleString() + '/yr') + ' to your tuition');
    if(S.familySupport) fundingParts.push('You anticipate family contributions of about ' + makePill('$' + S.familySupport.toLocaleString() + '/yr') + ' to help pay for your living expenses or tuition');
    if(fundingParts.length > 0) financialParts.push(fundingParts.join('.  ') + '.');
  }

  if(S.scholarshipAmount || S.collegeSavings || S.partTimeWork || S.familySupport) {
    financialParts.push('You will likely take loans to cover the remaining cost after scholarships, grants, college savings, part-time work, and family support.');
  }

  if(S.loanRate || S.loanRepaymentYears) {
    let loanParts = [];
    if(S.loanRate) loanParts.push('You are estimating a loan rate of ' + makePill(S.loanRate + '%'));
    if(S.loanRepaymentYears) loanParts.push('to be repaid monthly over ' + makePill(S.loanRepaymentYears + ' years'));
    if(loanParts.length > 0) financialParts.push('Once you start working after graduation, you will  make payments on these loans every month until they are paid off.  ' + loanParts.join(', ') + '.');
  }

  // Monthly payment range
  if(monthlyPaymentMin !== null && monthlyPaymentMax !== null && S.loanRepaymentYears) {
    const formattedMin = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(monthlyPaymentMin);
    const formattedMax = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(monthlyPaymentMax);
    financialParts.push('With these loan terms, selected countries, and your cost projections, you should expect to pay between ' + makePill(formattedMin) + ' and ' + makePill(formattedMax) + ' monthly over ' + makePill(S.loanRepaymentYears + ' years') + '.');
  }

  // Build HTML
  let html = '';
  if(discoveryParts.length > 0) {
    html += '<p style="line-height:1.6;color:var(--tx1);margin:12px 0;font-size:13px">' + discoveryParts.join(' ') + '</p>';
  }
  if(financialParts.length > 0) {
    html += '<p style="line-height:1.6;color:var(--tx1);margin:12px 0;font-size:13px">' + financialParts.join('  ') + '</p>';
  }

  return html;
}

// Detect conflicts and generate conflict-based insights
function generateConflictInsights() {
  const insights = [];
  if(S.inStateTuitionPref && S.inStateTuitionPref === 'Out-of-State' && S.flex && S.flex.includes('Study in the US')) {
    insights.push({type: 'conflict', title: 'Location Awareness', msg: '💥 You want to leave NC but prefer studying in the US. Keep in mind that out-of-state universities will cost more regardless of their quality.'});
  }
  if((S.cost === 'Critical' || S.cost === 'Balanced with other factors') && S.uniSelectivity && S.uniSelectivity.includes('Very selective')) {
    insights.push({type: 'conflict', title: 'Cost & Selectivity Tension', msg: '💥 Cost is a priority and you are targeting selective schools. Cost can offset by scholarships (need-based, merit-based, external). Focus on schools with strong aid packages.'});
  }

  // Rigorous career course requirements check
  if(S.subCareers && S.subCareers.length > 0 && S.cc.length > 0){
    const rigorousCareerTypes = ['Medicine', 'Engineering', 'Law', 'Architecture', 'Pharmacy'];
    const hasRigorousCareer = S.subCareers.some(c => rigorousCareerTypes.some(t => c.includes(t)));

    if(hasRigorousCareer){
      const flexibleCountries = [];
      S.cc.forEach(countryKey => {
        const changePolicy = getCountryChangePolicy(countryKey);
        if(changePolicy && changePolicy.toLowerCase().includes('easy')){
          flexibleCountries.push(getCountryName(countryKey));
        }
      });
      if(flexibleCountries.length > 0){
        insights.push({
          type: 'info',
          title: 'Course Requirements',
          msg: 'ℹ️ Jobs in your chosen careers (' + S.subCareers.slice(0,2).join(', ') + ') may require specific courses taken during your studies.'
        });
      }
    }
  }

  // Bachelor-only study in expensive countries
  if(S.cc.length > 0 && S.uniSelectivity && S.uniSelectivity.length > 0 && !S.uniSelectivity.includes('Very selective')){
    if(S.postGrad === 'Only willing to pursue bachelor'){
      const expensiveCountries = [];
      const expensiveMap = {'us': true, 'uk': true, 'canada': true, 'australia': true};
      S.cc.forEach(c => {
        if(expensiveMap[c]) expensiveCountries.push(COUNTRIES[c].name);
      });
      if(expensiveCountries.length > 0 && S.cc.length > 0){
        const affordableInSelection = S.cc.some(c => !expensiveMap[c]);
        if(!affordableInSelection){
          insights.push({
            type: 'conflict',
            title: 'Cost & Undergraduate Degree focus',
            msg: '💥 You\'re planning undergraduate-only study in expensive countries (' + expensiveCountries.join(', ') + '). Consider: Germany/Sweden for cost-effective undergraduate programs ($0–$3,300/yr), or plan flexible financing.'
          });
        }
      }
    }
  }

  if(S.vision === 'In the US' && (S.cc.includes('sweden') || S.cc.includes('germany') || S.cc.includes('france') || S.cc.includes('italy') || S.cc.includes('spain') || S.cc.includes('netherlands') || S.cc.includes('denmark') || S.cc.includes('ireland'))) {
    insights.push({type: 'info', title: 'Bridging Vision & Location', msg: 'ℹ️ You want to work in the US but are exploring European universities. This may be a very cost effective path.'});
  }
  if(S.lang === 'Slower language learner' && S.languages && S.languages.length >= 2) {
    insights.push({type: 'info', title: 'Language Capability', msg: 'ℹ️ You\'ve selected multiple languages despite finding languages challenging. This shows determination—consider studying abroad where you can immerse in new languages.'});
  }
  return insights;
}

// Generate independent insights for individual Discovery selections
function generateSelectionInsights() {
  const insights = [];
  if(S.lang === 'Normal language learner') insights.push({type: 'neutral', title: 'Language Planning', msg: 'ℹ️ Plan 1-2 years to reach conversational fluency in a new language.'});
  else if(S.lang === 'Slower language learner') insights.push({type: 'con', title: 'Language Strategy', msg: '⚠️ You may encounter a language barrier in non-English programs. Look for English-taught options or plan intensive language prep. Some EU countries are much stronger than others for English degree programs.'});

  if(S.citizen && S.citizen.includes('US')) {
    if(S.citizen.includes('EU')) insights.push({type: 'pro', title: 'US + EU Citizenship', msg: '✅ Free/low tuition in Sweden, Germany, Denmark. Work rights across EU.'});
  } else if(S.citizen && S.citizen.includes('EU')) {
    if(!S.citizen.includes('US')) insights.push({type: 'pro', title: 'EU Citizenship Advantage', msg: '✅ Tuition-free/low-cost in EU. Work rights across 27 countries.'});
  }

  if(S.cost === 'Critical') insights.push({type: 'pro', title: 'Cost-Conscious Strategy', msg: '✅ European public universities ($0–$3,300/yr) vs US private schools ($50,000+/yr)—significant savings possible.'});



  if(S.vision === 'In the US') {
    const isUSCitizen = S.citizen && S.citizen.includes('US');
    const msg = isUSCitizen ? 'ℹ️ US universities are strongest for US employment—as a US citizen, you have full work authorization.' : 'ℹ️ US universities strongest for US employment; consider visa logistics and work authorization as a non-US citizen.';
    insights.push({type: 'neutral', title: 'US Career Path', msg: msg});
  }


  // Check for insufficient funding sources (only if user has interacted with costs)
  if(S.scholarshipAmount || S.collegeSavings || S.partTimeWork || S.familySupport) {
    const schol = Math.min(100, Math.max(0, S.scholarshipAmount || 0));
    const savings = Math.max(0, S.collegeSavings || 0);
    const work = Math.max(0, S.partTimeWork || 0);
    const family = Math.max(0, S.familySupport || 0);
    const totalNonScholarship = savings + work + family;

    if(schol < 20 && totalNonScholarship < 50000) {
      insights.push({type: 'con', title: 'Insufficient Funding Sources', msg: '⚠️ Your current funding plan (scholarships, savings, work, family support) may be insufficient.'});
    }
  }

  // Check for loan repayment timeline mismatch between Discovery and Costs tabs
  if(S.debtYrs && S.loanRepaymentYears && parseInt(S.debtYrs) !== parseInt(S.loanRepaymentYears)) {
    insights.push({type: 'con', title: 'Loan Repayment Mismatch', msg: '⚠️ You indicated comfort with ' + S.debtYrs + ' years of loan repayment, but your financing plan forecasts ' + S.loanRepaymentYears + ' years. Adjust your loan term to align with your goals.'});
  }

  // ENHANCED: Add context from other selections where relevant
  // Career and Country Context insights are now added directly to careerFits and countryFits arrays
  // in the renderInsights() function, not as separate narrative insights

  return insights;
}
// Helper function to format pros/cons with proper emoji and color
function formatInsightItem(text, isProItem) {
  if(!text) return '';
  // Check if text already starts with an emoji (ℹ️, ✅, ⚠️, 💥, etc.)
  if(text.startsWith('ℹ️')) {
    // Info item - use neutral color
    return '<span style="color:var(--tx2);">' + text + '</span>';
  } else if(text.startsWith('✅')) {
    // Already has success emoji
    return '<span style="color:var(--ok);">' + text + '</span>';
  } else if(text.startsWith('⚠️')) {
    // Con/warning emoji - use orange
    return '<span style="color:var(--warn);">' + text + '</span>';
  } else if(text.startsWith('💥')) {
    // Conflict emoji - use red
    return '<span style="color:var(--bad);">' + text + '</span>';
  }
  // No emoji - add the appropriate one
  if(isProItem) {
    return '<span style="color:var(--ok);">✅ ' + text + '</span>';
  } else {
    return '<span style="color:var(--warn);">⚠️ ' + text + '</span>';
  }
}

// Helper function to render insights tables with consistent styling
// Enforces consistent column widths: 20% / 40% / 40%
function renderInsightsTable(titleText, subtitleText, firstColHeader, items, carouselId) {
  let html = '';
  const col1Width = '20%';
  const col2Width = '50%';
  const col3Width = '30%';

  // Section title and subtitle
  html += '<h2 style="margin:24px 0 12px 0;color:var(--dk);font-size:20px">' + titleText + '</h2>';
  html += '<div style="font-size:13px;color:var(--tx2);margin-bottom:10px;line-height:1.5">' + subtitleText + '</div>';

  // Mobile: Card layout (carousel)
  html += buildInsightCarouselHTML(items, carouselId);

  // Desktop: Table layout
  html += '<div class="insights-table-display"><div style="overflow-x:auto;margin-bottom:24px"><table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0">';
  html += '<thead><tr style="border-bottom:1px solid var(--bdr);background:var(--lt)"><th style="padding:8px 10px;text-align:left;color:var(--dk);font-weight:700;width:' + col1Width + ';white-space:nowrap">' + firstColHeader + '</th><th style="padding:8px 10px;text-align:left;color:var(--dk);font-weight:700;width:' + col2Width + '">Strengths</th><th style="padding:8px 10px;text-align:left;color:var(--dk);font-weight:700;width:' + col3Width + '">Considerations</th></tr></thead>';
  html += '<tbody>';
  items.forEach(item => {
    const prosHTML = item.pros.length > 0 ? item.pros.map(p => formatInsightItem(p, true)).join('<br>') : '—';
    const consHTML = item.cons.length > 0 ? item.cons.map(c => formatInsightItem(c, false)).join('<br>') : '—';
    html += '<tr style="border-bottom:1px solid var(--bdr);background:#fff"><td style="padding:8px 10px;color:var(--tx0);font-weight:600;vertical-align:top;width:' + col1Width + ';line-height:1.4;background:rgba(241,245,249,.5);white-space:nowrap">' + (item.title || item.name) + '</td><td style="padding:8px 10px;vertical-align:top;width:' + col2Width + ';line-height:1.4">' + prosHTML + '</td><td style="padding:8px 10px;vertical-align:top;width:' + col3Width + ';line-height:1.4">' + consHTML + '</td></tr>';
  });
  html += '</tbody></table></div></div>';

  return html;
}

function buildInsightCarouselHTML(items, carouselId) {
  // Create a carousel that fills the viewport width properly
  // Uses same pattern as buildCarouselHTML with JavaScript-based snapping via initCarousel()
  let html = `<div class="insights-carousel-wrap" id="${carouselId}"><div class="insights-carousel-container">`;

  items.forEach(item => {
    let contentHTML = '';
    if(item.pros || item.msg) {
      const mainContent = item.msg || item.pros.map(p => formatInsightItem(p, true)).join('<br>');
      contentHTML = `<div class="insights-carousel-card-row">${mainContent}</div>`;
      if(item.cons) {
        contentHTML += `<div class="insights-carousel-card-row" style="margin-top:8px">${item.cons.map(c => formatInsightItem(c, false)).join('<br>')}</div>`;
      }
    }
    html += `<div class="insights-carousel-card">
      <div class="insights-carousel-card-header">${item.title || item.name}</div>
      <div class="insights-carousel-card-content">${contentHTML || '<div class="insights-carousel-card-row">—</div>'}</div>
    </div>`;
  });

  html += '</div>'; // insights-carousel-container
  html += '<div class="carousel-indicator">Card 1 of ' + items.length + '</div>';
  html += '</div>'; // insights-carousel-wrap
  return html;
}

function renderInsights(){
  const el = document.getElementById('insights-container');
  if(!el) return;
  if(!INSIGHTS_LOADED){el.innerHTML='<p>Loading insights...</p>';setTimeout(renderInsights,100);return}
  const narr = document.getElementById('narrative-display');

  // Sync costCC with cc if not already set, so cost insights use current country selections
  if(S.cc.length > 0 && S.costCC.length === 0) {
    S.costCC = [...S.cc];
  } else if(S.cc.length === 0) {
    S.costCC = [];
  }

  // Get slider values
  const schol = parseFloat(document.getElementById('sl-schol').value) || 0;
  const savings = parseFloat(document.getElementById('sl-savings').value) || 0;
  const work = parseFloat(document.getElementById('sl-work').value) || 0;
  const family = parseFloat(document.getElementById('sl-parent').value) || 0;
  const rate = parseFloat(document.getElementById('sl-rate').value) || 5.5;
  const years = parseFloat(document.getElementById('sl-yrs').value) || 10;
  const isUSCitizen = S.citizen && S.citizen.includes('US');

  // Calculate monthly loan payments for each selected country to get min/max
  let monthlyPaymentMin = null;
  let monthlyPaymentMax = null;
  if(S.cc.length > 0) {
    const monthlyPayments = [];
    S.cc.forEach(countryKey => {
      const costData = calculateCostData(countryKey, schol, savings, work, family, rate, years);
      monthlyPayments.push(costData.monthlyPayment);
    });
    if(monthlyPayments.length > 0) {
      monthlyPaymentMin = Math.min(...monthlyPayments);
      monthlyPaymentMax = Math.max(...monthlyPayments);
    }
  }

  // Display narrative paragraph from Discovery selections
  narr.innerHTML = generateNarrativeParagraph(monthlyPaymentMin, monthlyPaymentMax);
  
  let careerFits = [];
  let countryFits = [];
  let costAnalysis = [];
  
  // CAREER ANALYSIS
  if(S.subCareers.length > 0){
    S.subCareers.forEach(f => {
      const d = getSub(f);
      const pros = [];
      const cons = [];
      
      // Salary - consistent tiers (from Bureau of Labor Statistics and O*NET data, illustrative estimates)
      const salRange = getCareerSalaryUS(f);
      if(salRange) {
        const maxSalary = salRange.max;
        const formattedRange = formatMoneyRange(salRange.min, salRange.max);
        if(maxSalary >= 120000){
          pros.push('High earning potential (illustrative: ' + formattedRange + ', entry to mid-career range)');
          if(S.motivations && S.motivations.includes('Financial security')) pros.push('Matches your financial security goal');
        }
        else if(maxSalary >= 80000){
          pros.push('Solid earning potential (illustrative: ' + formattedRange + ' range)');
        }
        else if(maxSalary < 80000){
          cons.push('Typically lower salary range (illustrative: ' + formattedRange + ')');
          if(S.motivations && S.motivations.includes('Financial security')) cons.push('May not match financial security goal');
        }
      }
      
      // Portability
      const portability = getCareerPortability(f);
      if(portability && S.vision === 'In Europe'){
        if(portability.level === 'HIGH') pros.push('High portability abroad');
        else if(portability.level === 'LOW') cons.push('Limited portability abroad');
        else if(portability.level === 'MEDIUM') pros.push('Moderate portability abroad');
      } else if(portability && S.vision === 'Anywhere globally'){
        if(portability.level === 'HIGH') pros.push('High global portability matches your flexible vision');
        else if(portability.level === 'LOW') cons.push('Limited international portability — focused on home country');
        else if(portability.level === 'MEDIUM') pros.push('Moderate global portability supports international options');
      } else if(portability && !S.vision){
        if(portability.level === 'HIGH') pros.push('HIGH international portability');
        else if(portability.level === 'LOW') cons.push('LOW international portability');
      }

      // Growth
      const growth = getCareerGrowth(f);
      if(growth){
        if(growth.magnitude === 'very_high'){
          pros.push('Very high job growth');
          const salRange = getCareerSalaryUS(f);
          if(salRange && salRange.max >= 120000) pros.push('Entry-level typically $60-80K, advancing to $120K+ with experience');
        }
        else if(growth.magnitude === 'high'){
          pros.push('High job growth');
          const salRange = getCareerSalaryUS(f);
          if(salRange && salRange.max >= 100000) pros.push('Career progression from entry-level roles to $100K+ range');
        }
        else if(growth.magnitude === 'moderate'){
          pros.push('Stable, steady growth');
        }
      }
      
      // Licensing - parse actual licensing requirements from data
      const licensing = getCareerLicensing(f);
      if(licensing) {
        // Check if licensing is required
        if(licensing.status === 'required') {
          cons.push('Requires professional licensing/certification');
          if(licensing.scope === 'country_specific') cons.push('Requirements vary by country');
        }
        // Check if licensing is optional but helpful
        else if(licensing.status === 'optional') {
          pros.push('Professional certification available');
          if(S.cc && S.cc.length > 0) pros.push('Pursuing credentials in your target countries improves competitiveness');
        }
        // If not available, don't add pro - it's expected
      }
      
      // Motivations
      if(S.motivations && S.motivations.includes('Creative expression')){
        if(f.includes('Creative') || f.includes('Design') || f.includes('Arts') || f.includes('Theater') || f.includes('Music') || f.includes('Film') || f.includes('Writing') || f.includes('Photo') || f.includes('Animation') || f.includes('Architecture')){
          pros.push('Matches creative expression goal');
        }
      }
      
      if(S.motivations && S.motivations.includes('Making real impact')){
        if(f.includes('Medicine') || f.includes('Psychology') || f.includes('Science') || f.includes('Research') || f.includes('Social') || f.includes('Environmental')){
          pros.push('Matches impact goal');
        }
      }
      
      // Cost - remove dollar amounts, just show tier
      const costRange = getCareerCostUS(f);
      if(costRange) {
        const cost = costRange.max;
        if(cost < 50000){
          pros.push('Inexpensive education');
        }
        else if(cost < 100000){
          pros.push('Affordable education');
        }
        else if(cost <= 150000){
          // Moderate cost - neutral, don't add
        }
        else if(cost <= 250000){
          cons.push('Typically expensive education, depending on country and financing');
          // Add ROI context if salary data exists
          const salRange = getCareerSalaryUS(f);
          if(salRange && salRange.max >= 150000){
            pros.push('However, graduates typically earn $150K+, with education investment paid off in ~5-7 years');
          } else if(salRange && salRange.max >= 120000){
            pros.push('However, graduates typically earn $120-140K, with education investment paid off in ~8-12 years');
          }
        }
        else {
          cons.push('Very expensive education');
          // Add ROI context if salary data exists
          const salRange = getCareerSalaryUS(f);
          if(salRange && salRange.max >= 200000){
            pros.push('However, high-earning field with salaries exceeding $200K can justify the investment over time');
          } else if(salRange && salRange.max >= 140000){
            pros.push('However, strong earning potential ($140K+) provides pathway to ROI, though payoff takes time');
          }
        }
      }
      
      // Post-graduate requirements - add as CON if significant
      if(d.typicalPostGradYears && d.typicalPostGradYears > 0){
        if(d.typicalPostGradYears >= 5){
          cons.push('Requires ' + d.typicalPostGradYears + '+ years post-grad study/training');
        } else if(d.typicalPostGradYears >= 3){
          cons.push('Typically requires ' + d.typicalPostGradYears + ' years additional post-grad training');
        }
      }
      
      // Market demand
      const demand = getDemandForCareer(f);
      if(demand && demand.pct){
        if(demand.pct > 15) pros.push('Very strong market demand (' + demand.pct + '% growth)');
        else if(demand.pct > 7) pros.push('Strong market demand (' + demand.pct + '% growth)');
        else if(demand.pct > 0) pros.push('Positive job growth (' + demand.pct + '%)');
        else cons.push('Flat or declining job market');
      }
      
      if(pros.length > 0 || cons.length > 0) careerFits.push({name: f, pros: pros, cons: cons});
    });
  }

  // ADD CAREER CONTEXT INSIGHTS
  // These provide context about how each selected career fits with selected countries
  if(careerFits.length > 0 && S.cc.length > 0) {
    careerFits.forEach(careerFit => {
      const careerName = careerFit.name;

      // Check which selected countries have strong programs in this career field
      const countryPrograms = [];
      S.cc.forEach(countryKey => {
        const country = COUNTRIES[countryKey];
        if(country && country.n) {
          // Only add countries that have explicitly strong programs in this field
          if(countryKey === 'us' || countryKey === 'uk') {
            // US and UK have strong programs in most fields
            countryPrograms.push(country.n);
          } else if(careerName.includes('Engineering') && (countryKey === 'germany' || countryKey === 'netherlands' || countryKey === 'sweden')) {
            countryPrograms.push(country.n);
          } else if(careerName.includes('Science') && (countryKey === 'germany' || countryKey === 'netherlands')) {
            countryPrograms.push(country.n);
          } else if(careerName.includes('Law') && (countryKey === 'uk' || countryKey === 'france')) {
            countryPrograms.push(country.n);
          } else if(careerName.includes('Medicine') && (countryKey === 'germany' || countryKey === 'netherlands' || countryKey === 'italy')) {
            countryPrograms.push(country.n);
          } else if(careerName.includes('Business') && (countryKey === 'us' || countryKey === 'uk' || countryKey === 'netherlands')) {
            countryPrograms.push(country.n);
          } else if(careerName.includes('Computer') && (countryKey === 'us' || countryKey === 'uk' || countryKey === 'sweden' || countryKey === 'germany')) {
            countryPrograms.push(country.n);
          }
        }
      });

      // Only add context if we found countries with strong programs
      if(countryPrograms.length > 0) {
        const countryContext = 'Your selected countries include ' + (countryPrograms.length === 1 ? countryPrograms[0] + ', which has' : countryPrograms.join(', ') + ', which have') + ' strong programs in this field';
        careerFit.pros.push('ℹ️ ' + countryContext);
      }
    });
  }

  // COUNTRY ANALYSIS (NO COST INFO - moved to cost-specific table)
  if(S.cc.length > 0){
    S.cc.forEach(k => {
      const countryName = getCountryName(k);
      const pros = [];
      const cons = [];

      const post = getCountryPostGradOpportunities(k) || '';
      const lang = getCountryLanguage(k) || '';
      const chg = getCountryChangePolicy(k) || '';
      const dur = parseFloat(getCountryDuration(k)) || 4;
      
      // Post-study work - ONLY for non-US citizens, and only if country has work visa or EU mobility
      if(!isUSCitizen && post && (post.includes('visa') || post.includes('work') || post.includes('Work') || post.includes('mobility') || post.includes('Mobility'))){
        // Provide detailed post-study work information based on country
        const postStudyMap = {
          'uk': 'Graduate visa allows 2 years of work; pathway to skilled worker visa after securing sponsorship',
          'canada': 'Post-graduation work permit up to 3 years; pathway to permanent residency with work experience',
          'australia': 'Graduate visa allows 1.5-3 years depending on field; strong pathway to permanent residency',
          'sweden': 'EU mobility allows work across 27 countries; permanent residency possible after 4 years',
          'germany': 'EU mobility allows work across 27 countries; permanent residency eligible after 5 years',
          'netherlands': 'EU mobility allows work across 27 countries; pathway to permanent residency',
          'france': 'EU mobility allows work across 27 countries; permanent residency eligible after 5 years',
          'ireland': 'Graduate visa allows 2 years of work; skilled migration pathway available',
          'spain': 'EU mobility allows work across 27 countries; permanent residency possible',
          'italy': 'EU mobility allows work across 27 countries; permanent residency eligible after 4 years',
          'denmark': 'EU mobility allows work across 27 countries; permanent residency possible after residence period'
        };

        const postInfo = postStudyMap[k];
        if(postInfo){
          pros.push('Post-study work: ' + postInfo);
        } else {
          pros.push('Post-study work visa available');
        }

        if(S.vision === 'In Europe' && (k === 'sweden' || k === 'germany' || k === 'netherlands' || k === 'france' || k === 'ireland' || k === 'spain' || k === 'italy' || k === 'denmark')){
          pros.push('EU mobility supports your abroad vision directly');
        } else if(S.vision === 'In the US' || S.vision === 'Anywhere globally'){
          pros.push('Gain international work experience before transitioning to your target location');
        }
      }
      
      // Flexibility - only add if explicitly Easy or Difficult
      if(chg && (chg.toLowerCase().includes('difficult'))){
        cons.push('Difficult to change majors — locked into program choice');

        // Add career-specific context if relevant
        if(S.subCareers && S.subCareers.length > 0){
          const rigorousFields = ['Medicine', 'Engineering', 'Law', 'Architecture'];
          const hasRigorousCareer = S.subCareers.some(c => rigorousFields.some(f => c.includes(f)));
          if(hasRigorousCareer){
            cons.push('Your selected fields require structured prerequisites — verify program covers necessary coursework');
          } else {
            cons.push('Consider whether your career fields require specific foundational courses upfront');
          }
        }

        if(S.motivations && S.motivations.includes('Independence & flexibility')) cons.push('Conflicts with flexibility motivation');
      } else if(chg && chg.includes('Easy')){
        pros.push('Easy to change majors — flexibility to explore and adjust');

        // Add career-specific context
        if(S.subCareers && S.subCareers.length > 0){
          pros.push('Can combine your career interests with complementary electives and cross-disciplinary skills');
        }

        if(S.motivations && S.motivations.includes('Independence & flexibility')) pros.push('Aligns with flexibility motivation');
      }
      
      // Language - provide nuanced feedback based on actual options AND user language proficiency
      if(lang){
        const langLower = lang.toLowerCase();
        // Map country keys to language names for proficiency check
        const countryLangMap = {'sweden': 'Swedish', 'germany': 'German', 'france': 'French', 'spain': 'Spanish', 'italy': 'Italian', 'denmark': 'Danish', 'netherlands': 'Dutch'};
        const userHasLanguage = S.languages && S.languages.length > 0 && countryLangMap[k] && S.languages.includes(countryLangMap[k]);

        // Full English instruction
        if(k === 'us' || k === 'uk' || k === 'ireland' || k === 'canada'){
          pros.push('All instruction in English — no language barrier for studies');
        }
        // Many/substantial English options
        else if(langLower.includes('many') || langLower.includes('several')){
          pros.push('80+ English-taught programs available; electives can be in local language');
          if(S.lang === 'Slower language learner') {
            pros.push('Wide English availability reduces language pressure — can focus on local language skills gradually');
          } else {
            pros.push('Prepare with A2-B1 local language proficiency for daily life and some coursework');
          }
        }
        // Growing/some English options
        else if(langLower.includes('growing') || langLower.includes('some')){
          pros.push('30-50 English-taught programs; most require B1-B2 local language proficiency');
          if(S.lang === 'Slower language learner' && !userHasLanguage) {
            cons.push('Limited English programs require significant local language study (B1-B2 level = 6-12 months intensive)');
          }
          else if(userHasLanguage) {
            pros.push('Your conversational proficiency gives advantage; can strengthen to B1-B2 during studies');
          }
        }
        // Primarily local language
        else if(langLower.includes('typical') || langLower.includes('primary')){
          cons.push('B2-C1 local language proficiency required for most programs (12-18 months intensive study)');
          if(S.lang === 'Slower language learner' && !userHasLanguage) {
            cons.push('Significant language barrier — require dedicated 1-2 years language prep before university');
          }
          else if(userHasLanguage) {
            pros.push('Your conversational foundation helpful; strengthen to B2 for academic success');
          }
          pros.push('Universities typically offer language support and prep courses for international students');
        }
      }
      
      // Scholarships - add availability info for all countries
      const scholMap = {
        'us': {info: 'Merit + need-based scholarships', pct: '80% of international undergrads receive aid', coverage: 'typically 10-40% of tuition'},
        'uk': {info: 'Limited merit scholarships for internationals', pct: '5-15% of intl undergrads', coverage: 'typically 25-50% of tuition'},
        'sweden': {info: 'Tuition-free for all; limited merit scholarships', pct: '~3% receive additional merit aid', coverage: 'living expenses only (~$12K/yr)'},
        'germany': {info: 'DAAD + foundation scholarships', pct: '10-20% of intl undergrads', coverage: 'typically 50-100% of tuition + living'},
        'netherlands': {info: 'Limited merit; low tuition main advantage', pct: '5-10% receive scholarships', coverage: 'living expenses + tuition support'},
        'france': {info: 'CROUS + housing aid; limited merit scholarships', pct: '8-12% of intl undergrads', coverage: 'typically housing/living (~$6-8K/yr)'},
        'italy': {info: 'Regional scholarships + housing aid; means-tested', pct: '5-8% of intl undergrads', coverage: 'typically $3.3-5.5K annually'},
        'spain': {info: 'National + regional scholarships; merit + need', pct: '10-15% of intl undergrads', coverage: 'typically $3.3-6.6K annually'},
        'denmark': {info: 'Tuition-free; SU grants if work 10-12 hrs/week', pct: '~100% can access via work', coverage: 'living expenses (~$1K/month)'},
        'ireland': {info: 'SUSI grants + merit scholarships', pct: '20-30% of intl undergrads', coverage: 'typically 25-75% of tuition'},
        'canada': {info: 'Merit scholarships common; co-op work earnings', pct: '30-50% receive merit aid', coverage: 'typically 15-50% of tuition; co-op adds $8-12K/yr'},
        'no': {info: 'Tuition-free for all; limited merit scholarships', pct: '~5% receive merit aid', coverage: 'living expenses only (~$13K/yr)'},
        'ch': {info: 'Low tuition (~$1K/yr); Swiss Excellence + merit scholarships', pct: '~8-12% receive merit aid', coverage: 'CHF 5K-25K/yr tuition + living support'}
      };
      const scholInfo = scholMap[k];
      if(scholInfo){
        pros.push('Scholarships: ' + scholInfo.info);
        // Only show international-specific percentage for non-US countries or non-US citizens
        const isUSCitizen = S.citizen && S.citizen.includes('US');
        if(k !== 'us' || !isUSCitizen) {
          pros.push('Realistic availability: ' + scholInfo.pct + ' — typically covers ' + scholInfo.coverage);
        } else {
          // For US citizens in US - show domestic context
          pros.push('As a US citizen: Federal aid, state aid, institutional aid available based on FAFSA');
        }
      }
      
      // Only add degree length if it differs from standard 4 years
      if(dur !== 4){
        pros.push(dur + '-year undergraduate degree program');
      }
      
      // Only add debt concern if relevant
      if(S.debtYrs === '5 years' && dur > 5) cons.push('Program exceeds your 5-year debt comfort');
      
      // Only add to list if there are actual insights to show
      if(pros.length > 0 || cons.length > 0) countryFits.push({name: countryName, pros: pros, cons: cons});
    });
  }

  // ADD COUNTRY CONTEXT INSIGHTS
  // These provide context about how each selected country fits with selected careers and user priorities
  if(countryFits.length > 0 && S.subCareers.length > 0) {
    countryFits.forEach(countryFit => {
      const countryKey = Object.keys(COUNTRIES).find(k => COUNTRIES[k].name === countryFit.name);

      if(countryKey) {
        // Check which selected careers have strong representation in this country
        const careerContext = [];
        S.subCareers.forEach(careerName => {
          // Only match careers that explicitly align with this country's strengths
          if(countryKey === 'us' || countryKey === 'uk') {
            careerContext.push(careerName);
          } else if(careerName.includes('Engineering') && (countryKey === 'germany' || countryKey === 'netherlands' || countryKey === 'sweden' || countryKey === 'no')) {
            careerContext.push(careerName);
          } else if(careerName.includes('Science') && (countryKey === 'germany' || countryKey === 'netherlands' || countryKey === 'ch')) {
            careerContext.push(careerName);
          } else if(careerName.includes('Law') && (countryKey === 'uk' || countryKey === 'france')) {
            careerContext.push(careerName);
          } else if(careerName.includes('Medicine') && (countryKey === 'germany' || countryKey === 'netherlands' || countryKey === 'italy')) {
            careerContext.push(careerName);
          } else if(careerName.includes('Business') && (countryKey === 'us' || countryKey === 'uk' || countryKey === 'netherlands' || countryKey === 'ch')) {
            careerContext.push(careerName);
          } else if(careerName.includes('Computer') && (countryKey === 'us' || countryKey === 'uk' || countryKey === 'sweden' || countryKey === 'germany' || countryKey === 'no')) {
            careerContext.push(careerName);
          }
        });

        // Add context about career-country fit (only if careers align)
        if(careerContext.length > 0) {
          const uniqueCareers = [...new Set(careerContext)];
          const careerStr = uniqueCareers.length === 1 ? uniqueCareers[0] : uniqueCareers.join(', ');
          countryFit.pros.push('ℹ️ Strong program options for your selected ' + (uniqueCareers.length === 1 ? 'career' : 'careers') + ': ' + careerStr);
        }

        // Add context about cost fit
        if(S.cost === 'Critical') {
          if(countryKey === 'sweden' || countryKey === 'germany' || countryKey === 'denmark' || countryKey === 'france') {
            countryFit.pros.push('ℹ️ Aligns with cost-critical priority: low/free tuition and low cost of living');
          } else if(countryKey === 'us' || countryKey === 'uk') {
            countryFit.cons.push('ℹ️ Cost higher than EU options, but strong scholarship availability may help');
          }
        }

        // Add context about vision fit
        if(S.vision === 'In Europe' && (countryKey === 'sweden' || countryKey === 'germany' || countryKey === 'netherlands' || countryKey === 'france' || countryKey === 'italy' || countryKey === 'spain' || countryKey === 'denmark' || countryKey === 'ireland')) {
          countryFit.pros.push('ℹ️ Supports your Europe-focused vision with EU work rights and career mobility');
        } else if(S.vision === 'In the US' && (countryKey === 'us' || countryKey === 'canada')) {
          countryFit.pros.push('ℹ️ Supports your US-focused vision with strong US employment pathway');
        }
      }
    });
  }

  // COST ANALYSIS - includes tuition & total cost, single repayment term
  if(S.costCC.length > 0){
    S.costCC.forEach(k => {
      const countryName = COUNTRIES[k].name;
      const pros = [];
      const cons = [];
      
      const costResults = computeCountryCostResults(k, schol, savings, work, family, rate, years);
      if(costResults){
        const progDuration = parseFloat(getCountryDuration(k)) || 4;
        const {tuition, total4yr, yearAfterSupportTotal, borrowNeeded, monthlyPayment} = costResults;
        const yearlyTotal = costResults.yearAfterSupport;

        // Tuition - aligned tiers: Free, Inexpensive (<5k), Affordable (5-15k), Moderate (15-35k), Expensive to Very Expensive (35k+)
        const yearlyTuition = Math.round(tuition / progDuration);
        const tuitionContext = k !== 'us' ? ' — similar to public universities in US' : '';
        if(tuition === 0){
          pros.push('Tuition-free — eliminates largest cost barrier');
        } else if(yearlyTuition < 5000){
          pros.push('Inexpensive tuition ($' + yearlyTuition.toLocaleString() + '/yr)' + tuitionContext);
        } else if(yearlyTuition < 15000){
          pros.push('Affordable tuition ($' + yearlyTuition.toLocaleString() + '/yr)' + tuitionContext);
        } else if(yearlyTuition < 35000){
          pros.push('Moderate tuition ($' + yearlyTuition.toLocaleString() + '/yr)' + tuitionContext);
        } else {
          cons.push('Expensive tuition ($' + yearlyTuition.toLocaleString() + '/yr)' + tuitionContext);
        }

        // Total cost - expanded tiers: inexpensive (<50k), affordable (50-100k), moderate (100-150k), expensive (150-250k), very expensive (>250k)
        // Use yearAfterSupportTotal (cost after scholarships/savings/work applied) for consistency with Costs tab
        const adjustedCost = yearAfterSupportTotal;
        const costLabel = progDuration !== 4 ? progDuration + '-year' : '4-year';
        if(adjustedCost < 50000){
          pros.push('Total ' + costLabel + ' cost: inexpensive ($' + Math.round(adjustedCost/progDuration).toLocaleString() + '/yr average)');
        } else if(adjustedCost < 100000){
          pros.push('Total ' + costLabel + ' cost: affordable ($' + Math.round(adjustedCost/progDuration).toLocaleString() + '/yr average)');
        } else if(adjustedCost < 150000){
          pros.push('Total ' + costLabel + ' cost: moderate ($' + Math.round(adjustedCost/progDuration).toLocaleString() + '/yr average)');
        } else if(adjustedCost < 250000){
          cons.push('Total ' + costLabel + ' cost: expensive ($' + Math.round(adjustedCost/progDuration).toLocaleString() + '/yr average)');
        } else {
          cons.push('Total ' + costLabel + ' cost: very expensive ($' + Math.round(adjustedCost/progDuration).toLocaleString() + '/yr average)');
        }

        // Cost breakdown removed - detailed breakdown available in Costs tab

        // Financing with current plan - account for actual program duration
        if(borrowNeeded > 0){
          if(monthlyPayment <= 300){
            pros.push('Monthly payment (~$' + Math.round(monthlyPayment) + '/mo for ' + years + ' years) — manageable with your plan');
          } else if(monthlyPayment <= 500){
            pros.push('Monthly payment (~$' + Math.round(monthlyPayment) + '/mo for ' + years + ' years) — moderate debt load');
          } else if(monthlyPayment <= 800){
            cons.push('Monthly payment (~$' + Math.round(monthlyPayment) + '/mo for ' + years + ' years) — challenging; review budget');
          } else {
            cons.push('Monthly payment (~$' + Math.round(monthlyPayment) + '/mo for ' + years + ' years) — significant debt burden');
          }

          // Additional context if program is longer than expected
          if(progDuration > 4){
            cons.push('Note: ' + progDuration + '-year program increases total cost; verify program length matches your career field');
          }
        } else {
          // Only show if actually fully covered (borrowNeeded = 0)
          if(borrowNeeded === 0){
            pros.push('Your financing covers all costs — no borrowing needed');
          }
        }

        if(S.debtYrs === '5 years' && years > 5) cons.push('Your ' + years + '-year repayment exceeds 5-year debt comfort goal');

        // Scholarship adequacy check
        const baseTui = (k === 'us') ? getUSBaseTuition() : getCountryCostTuition(k);
        if(baseTui > 0 && S.scholarshipAmount && S.scholarshipAmount < baseTui * 0.3) {
          cons.push('Your scholarship estimate ($' + S.scholarshipAmount.toLocaleString() + ') covers less than 30% of tuition ($' + baseTui.toLocaleString() + '/yr) — consider researching additional scholarships to reduce loans');
        } else if(baseTui > 0 && !S.scholarshipAmount) {
          cons.push('No scholarships or grants estimated yet — consider researching funding opportunities to reduce tuition costs');
        }

        // Add dorm living tip if living expenses are significant AND dorms are typical in that country
        const room = getCountryCostRoom(k) || 0;
        const personal = getCountryCostPersonal(k) || 0;
        const livingCosts = room + personal;
        const dormTypicalCountries = ['us', 'uk', 'canada', 'ireland']; // Countries where dorms are common for undergrads
        if(livingCosts > 8000 && dormTypicalCountries.includes(k)) {
          pros.push('Living in university dorms can reduce housing costs by 20-40% compared to private rentals');
        }
      }

      if(pros.length > 0 || cons.length > 0) costAnalysis.push({name: countryName, pros: pros, cons: cons});
    });
  }
  
  // CROSS-TAB INSIGHTS - Compound insights comparing multiple tabs
  let crossTabInsights = [];

  // Fallback: Basic cross-tab context if user has made selections but no specific insights triggered
  // This ensures the section always appears when relevant selections are made
  const hasCrossTabSelections = (S.subCareers.length > 0 && S.cc.length > 0) ||
                                 (S.subCareers.length > 0 && S.costCC.length > 0) ||
                                 (S.cc.length > 0 && S.costCC.length > 0);

  // 1. CAREER-COUNTRY MATCH ANALYSIS
  if(S.subCareers.length > 0 && S.cc.length > 0) {
    const careerCountryMatches = [];
    const careerSalaryMap = {
      'Computer Science': '$120-150K', 'Engineering': '$100-140K', 'Medicine': '$150K+',
      'Business': '$80-120K', 'Data Science': '$130K+', 'Finance': '$100-150K',
      'Law': '$120-180K', 'Psychology': '$60-90K', 'Environmental Science': '$50-80K'
    };

    S.subCareers.forEach(career => {
      const careerShort = career.split(' - ')[0];
      const salary = careerSalaryMap[careerShort] || 'varies';

      S.cc.forEach(country => {
        const countryName = COUNTRIES[country].name;
        // Check if country has strong market for this career
        const strongMarkets = {
          'us': ['Engineering', 'Computer Science', 'Finance', 'Business', 'Law'],
          'uk': ['Finance', 'Business', 'Law', 'Medicine'],
          'germany': ['Engineering', 'Computer Science', 'Environmental Science'],
          'canada': ['Engineering', 'Computer Science', 'Business'],
          'netherlands': ['Engineering', 'Computer Science'],
          'sweden': ['Engineering', 'Technology', 'Environmental Science']
        };

        const isStrong = strongMarkets[country] && strongMarkets[country].some(m => careerShort.includes(m) || m.includes(careerShort));
        if(isStrong) {
          careerCountryMatches.push({
            career: careerShort,
            country: countryName,
            salary: salary
          });
        }
      });
    });

    if(careerCountryMatches.length > 0) {
      const match = careerCountryMatches[0];
      crossTabInsights.push({
        type: 'career-country',
        title: 'Career-Country Match',
        pros: [match.career + ' is in strong demand in ' + match.country + ', with typical salaries around ' + match.salary + '. This country is well-suited for your career choice.'],
        cons: []
      });
    }
  }

  // 2. COST-CAREER ROI ANALYSIS
  if(S.subCareers.length > 0 && S.costCC.length > 0) {
    const careerEarningsMap = {
      'Computer Science': 130000, 'Engineering': 110000, 'Medicine': 180000,
      'Business': 100000, 'Data Science': 140000, 'Finance': 125000,
      'Law': 150000, 'Psychology': 70000, 'Environmental Science': 65000
    };

    S.costCC.forEach(country => {
      const costResults = computeCountryCostResults(country, schol, savings, work, family, rate, years);
      if(costResults && S.subCareers.length > 0) {
        const careerShort = S.subCareers[0].split(' - ')[0];
        const avgEarnings = careerEarningsMap[careerShort] || 100000;
        const totalCost = costResults.yearAfterSupportTotal || costResults.total4yr;
        const yearlyNet = avgEarnings - (totalCost / (parseFloat(getCountryDuration(country)) || 4));
        const payoffYears = totalCost > 0 ? Math.round(totalCost / (avgEarnings * 0.6)) : 0; // Rough estimate accounting for taxes/living

        if(payoffYears > 0 && payoffYears < 20) {
          const countryName = getCountryName(country);
          crossTabInsights.push({
            type: 'cost-career-roi',
            title: 'Career ROI Analysis',
            pros: [careerShort + ' degree costs ~$' + Math.round(totalCost).toLocaleString() + ' in ' + countryName + ' (with your plan). Typical graduate earnings: $' + avgEarnings.toLocaleString() + '/yr. Net ROI timeline: approximately ' + payoffYears + ' years. Based on your current financial inputs.'],
            cons: []
          });
        }
      }
    });
  }

  // 3. PROGRAM STRUCTURE-CAREER ALIGNMENT
  if(S.subCareers.length > 0 && S.cc.length > 0) {
    const rigorousCareerTypes = ['Medicine', 'Engineering', 'Law', 'Architecture', 'Pharmacy'];
    const hasRigorousCareer = S.subCareers.some(c => rigorousCareerTypes.some(t => c.includes(t)));

    if(hasRigorousCareer) {
      S.cc.forEach(country => {
        const changePolicy = getCountryChangePolicy(country);
        if(changePolicy) {
          const countryName = getCountryName(country);
          const programStructure = changePolicy.toLowerCase().includes('easy') ? 'flexible' : 'structured/rigid';
          const alignment = programStructure === 'flexible' ? 'allows electives alongside required coursework' : 'ensures all prerequisites are covered';

          crossTabInsights.push({
            type: 'program-structure',
            title: 'Course Requirements',
            pros: [],
            cons: ['Jobs in ' + S.subCareers[0].split(' - ')[0] + ' may require specific courses. ' + countryName + ' offers ' + programStructure + ' programs. Verify your chosen university offers the courses or specializations needed for your career.']
          });
        }
      });
    }
  }

  // 4. FINANCIAL PATHWAY PLANNING
  if(S.cc.length > 0 && S.costCC.length > 0) {
    S.cc.forEach(country => {
      const costResults = computeCountryCostResults(country, schol, savings, work, family, rate, years);
      if(costResults) {
        const countryName = getCountryName(country);
        const totalCost = costResults.yearAfterSupportTotal;

        // Estimate post-study work income
        const postStudyEarnings = {
          'us': 0, 'uk': 3000, 'canada': 2500, 'ireland': 2800,
          'germany': 2200, 'netherlands': 2400, 'sweden': 2600,
          'france': 2000, 'spain': 1800, 'italy': 1600, 'denmark': 2800
        };

        const monthlyPostStudyIncome = postStudyEarnings[country] || 2000;
        const yearsOfWork = 2; // Typical post-study work period
        const incomeFromWork = monthlyPostStudyIncome * 12 * yearsOfWork;
        const percentageCovered = totalCost > 0 ? Math.round((incomeFromWork / totalCost) * 100) : 0;

        if(percentageCovered > 0 && percentageCovered < 100) {
          crossTabInsights.push({
            type: 'financial-pathway',
            title: 'Financial Pathway',
            pros: ['In ' + countryName + ', total cost is ~$' + Math.round(totalCost).toLocaleString() + '. Post-study work typically pays ~$' + monthlyPostStudyIncome.toLocaleString() + '/month. Working 2 years covers ~' + percentageCovered + '% of costs while building professional experience. Your scholarships/savings/work plan covers the remaining balance.'],
            cons: []
          });
        } else if(percentageCovered >= 100) {
          crossTabInsights.push({
            type: 'financial-pathway',
            title: 'Financial Pathway',
            pros: ['In ' + countryName + ', post-study work earnings (~$' + monthlyPostStudyIncome.toLocaleString() + '/month for 2 years) can fully offset your education costs. Combined with your current plan, you\'ll have financial flexibility after graduation.'],
            cons: []
          });
        }
      }
    });
  }

  // FALLBACK: If no cross-tab insights generated but user made relevant selections, add a general insight
  if(crossTabInsights.length === 0 && hasCrossTabSelections) {
    let fallbackTitle = 'Your Selections';
    let fallbackMessage = 'You\'ve selected careers, countries, and financial parameters. Review each section carefully to ensure they align with your priorities.';

    if(S.subCareers.length > 0 && S.cc.length > 0 && S.cost) {
      fallbackMessage = 'You\'ve selected ' + S.subCareers.length + ' career(s) and ' + S.cc.length + ' countr' + (S.cc.length === 1 ? 'y' : 'ies') + ' with a ' + S.cost.toLowerCase() + ' cost priority. Use these insights to evaluate how your selections work together.';
    }

    crossTabInsights.push({
      type: 'general-guidance',
      title: fallbackTitle,
      pros: [fallbackMessage],
      cons: []
    });
  }

  // UNIVERSITY INSIGHTS - based on selections
  let universityInsights = [];

  // Map country names to codes for database lookup
  const countryCodeMap = {
    'us': 'us',
    'uk': 'uk',
    'sweden': 'se',
    'germany': 'de',
    'netherlands': 'nl',
    'france': 'fr',
    'italy': 'it',
    'spain': 'es',
    'denmark': 'dk',
    'ireland': 'ie',
    'canada': 'ca'
  };
  
  // 1. Program availability gaps
  if(S.cc.length > 0 && S.subCareers.length > 0) {
    const programCounts = {};
    S.cc.forEach(country => {
      const code = countryCodeMap[country] || country;
      programCounts[country] = 0;
      S.subCareers.forEach(career => {
        const qsSubject = CAREER_TO_QS_SUBJECT[career];
        const unis = qsSubject ? getUniversitiesByProgram(qsSubject) : [];
        const countryUnis = unis.filter(u => u.country === code);
        if(countryUnis.length > 0) programCounts[country]++;
      });
    });
    
    const countriesWithGaps = Object.entries(programCounts).filter(([c, count]) => count === 0);
    if(countriesWithGaps.length > 0) {
      const gapCountries = countriesWithGaps.map(([c]) => COUNTRIES[c].name).join(', ');
      universityInsights.push({
        type: 'country',
        country: gapCountries,
        pro: false,
        msg: `Your selected careers aren't offered at many universities here. Consider expanding your career or country selection.`
      });
    }
  }
  
  // 2. Citizenship advantage calculation
  if(S.citizen && S.citizen.length > 0 && S.cc.length > 0) {
    const isEU = S.citizen.includes('EU');
    
    if(isEU && S.cc.includes('sweden')) {
      const intlRate = 14000;
      const savings = intlRate * 3;
      universityInsights.push({
        type: 'country',
        country: 'Sweden',
        pro: true,
        msg: `FREE tuition as EU citizen (vs $${intlRate}/yr international)—saving ~$${savings.toLocaleString()}.`
      });
    }
    
    if(isEU && S.cc.includes('germany')) {
      const intlRate = 8000;
      const savings = intlRate * 3;
      universityInsights.push({
        type: 'country',
        country: 'Germany',
        pro: true,
        msg: `~$350/semester vs $${intlRate}/yr international—saving ~$${savings.toLocaleString()}.`
      });
    }
    
    if(isEU && S.cc.includes('denmark')) {
      const savings = 6000 * 3 + 1050 * 12;
      universityInsights.push({
        type: 'country',
        country: 'Denmark',
        pro: true,
        msg: `FREE tuition + $1,050/mo SU grant if you work 10-12 hrs/wk.`
      });
    }
  }
  
  // 3. Selectivity-cost tradeoff
  if(S.cc.length >= 2 && S.subCareers.length > 0) {
    const firstCareer = S.subCareers[0];
    const qsSubject = CAREER_TO_QS_SUBJECT[firstCareer];
    const careerUnis = qsSubject ? getUniversitiesByProgram(qsSubject) : [];
    const usElite = careerUnis.filter(u => u.country === 'us' && u.selectivity === 'Very selective');
    const euElite = [];

    S.cc.forEach(country => {
      const code = countryCodeMap[country] || country;
      const unis = careerUnis;
      unis.filter(u => u.country === code && u.selectivity === 'Very selective').forEach(u => euElite.push(u));
    });
    
    if(usElite.length > 0 && euElite.length > 0) {
      const usAvgTuition = usElite.reduce((sum, u) => sum + parseInt(u.tuition || 0), 0) / usElite.length;
      const euAvgTuition = euElite.reduce((sum, u) => sum + parseInt(u.tuition || 0), 0) / euElite.length;
      
      if(usAvgTuition > euAvgTuition * 3) {
        const ratio = Math.round(usAvgTuition / euAvgTuition);
        universityInsights.push({
          type: 'cost',
          country: 'General',
          pro: true,
          msg: `Elite EU universities cost ~${ratio}x less than US elite schools.`
        });
      }
    }
  }
  
  // 4. NC preference impact
  if(S.inStateTuitionPref === 'In-State' && S.stateOfResidency && S.subCareers.length > 0) {
    const firstCareer = S.subCareers[0];
    const qsSubject = CAREER_TO_QS_SUBJECT[firstCareer];
    const careerUnis = qsSubject ? getUniversitiesByProgram(qsSubject) : [];
    const ncUnis = careerUnis.filter(u => u.country === 'us' && u.state === S.stateOfResidency);
    const usUnis = careerUnis.filter(u => u.country === 'us');
    
    if(ncUnis.length < 20 && usUnis.length > ncUnis.length * 2) {
      universityInsights.push({
        type: 'country',
        country: 'United States',
        pro: false,
        msg: `Your preference for North Carolina limits you to only ${ncUnis.length} universities. Expanding to "Any US state" would give you ${usUnis.length}+ options.`
      });
    }
  }
  
  // 5. Language readiness
  if(S.lang && (S.cc.includes('germany') || S.cc.includes('france') || S.cc.includes('spain') || S.cc.includes('italy'))) {
    if(S.lang === 'Normal language learner' || S.lang === 'Just starting') {
      const countries = [];
      if(S.cc.includes('germany')) countries.push('Germany');
      if(S.cc.includes('france')) countries.push('France');
      if(S.cc.includes('spain')) countries.push('Spain');
      if(S.cc.includes('italy')) countries.push('Italy');
      
      countries.forEach(country => {
        universityInsights.push({
          type: 'country',
          country: country,
          pro: false,
          msg: `B2+ language proficiency typical. Plan 1-2 years language prep as "${S.lang}".`
        });
      });
    }
  }
  
  // 6. Work-after-graduation prospects
  if(S.cc.length > 0) {
    const euCountries = ['sweden', 'germany', 'netherlands', 'france', 'italy', 'spain', 'denmark', 'ireland', 'uk', 'no', 'ch'];
    const hasEU = S.cc.some(c => euCountries.includes(c));
    const hasUS = S.cc.includes('us');
    
    if(hasEU && !hasUS) {
      S.cc.forEach(country => {
        if(euCountries.includes(country)) {
          universityInsights.push({
            type: 'country',
            country: COUNTRIES[country].name,
            pro: true,
            msg: `EU work rights across 9 countries + job-seeker visas (12-18 mo).`
          });
        }
      });
    } else if(hasEU && hasUS) {
      // For dual US+EU strategy, add to each EU country
      S.cc.forEach(country => {
        if(euCountries.includes(country)) {
          universityInsights.push({
            type: 'country',
            country: COUNTRIES[country].name,
            pro: true,
            msg: `EU degree gives work rights across 9 countries—broader than US degree.`
          });
        }
      });
    }
  }
  
  // BUILD TABLES
  let html = '';
  
  // Collect conflict and selection insights
  // NEW STRUCTURE: Conflicts First → Career+Country Combined → Financial Impact
  let allConflicts = [];
  let allDiscoveryInsights = [];
  allDiscoveryInsights = allDiscoveryInsights.concat(generateConflictInsights());
  allDiscoveryInsights = allDiscoveryInsights.concat(generateSelectionInsights());

  // Separate conflicts from other insights
  const discoveryConflicts = allDiscoveryInsights.filter(i => i.type === 'conflict' || i.type === 'con' || i.type === 'info');
  const discoveryOpportunities = allDiscoveryInsights.filter(i => i.type === 'pro' || i.type === 'neutral');
  allConflicts = allConflicts.concat(discoveryConflicts);
  // Only add crossTabInsights that have actual concerns (cons), not purely informational/positive ones
  allConflicts = allConflicts.concat(crossTabInsights.filter(cti => cti.cons && cti.cons.length > 0).map(cti => ({
    type: 'con',
    title: cti.title,
    msg: cti.cons[0]
  })));

  if(careerFits.length === 0 && countryFits.length === 0 && costAnalysis.length === 0 && allDiscoveryInsights.length === 0){
    html = guidanceMsg('Make selections across tabs to see personalized insights');
  } else {
    // SECTION 1: THINGS TO CHECK (impact table format)
    if(allConflicts.length > 0){
      // Deduplicate by title, keep first occurrence
      const deduped = [];
      const seen = new Set();
      allConflicts.forEach(c => {
        if(!seen.has(c.title)){
          seen.add(c.title);
          deduped.push(c);
        }
      });

      html += '<h2 style="margin:24px 0 12px 0;color:var(--dk);font-size:20px">Interest Alignment</h2>';
      html += '<div style="font-size:13px;color:var(--tx2);margin-bottom:10px;line-height:1.5">Review these to see how well your choices work together. Adjust your choices on the various tabs to refine or surface new insights.</div>';

      // Mobile carousel version
      html += '<div class="insights-carousel-wrap" id="conflicts-carousel"><div class="insights-carousel-container">';
      deduped.forEach(conflict => {
        const severity = conflict.type === 'conflict' ? '💥' : '⚠️';
        let meaning = conflict.msg.replace(/^[💥⚠️ℹ️]+\s*/, '').trim();
        const color = conflict.type === 'conflict' ? 'var(--bad)' : 'var(--warn)';

        let action = '';
        if(conflict.title.includes('Course Requirements')) {
          action = 'Verify your chosen universities offer those courses or specializations based on the career you are targeting.';
        } else if(conflict.title.includes('Bridging')) {
          action = 'Ensure the EU degree you are pursuing will be marketable in the US for the career you are targeting.';
        } else if(conflict.title.includes('Cost') || conflict.title.includes('Selectivity')) {
          action = 'Research scholarship options and affordability factors';
        } else if(conflict.title.includes('Language')) {
          action = 'Plan language prep or seek English-taught programs';
        } else if(conflict.title.includes('Location') || conflict.title.includes('Vision')) {
          action = 'Verify alignment with your post-graduation plans';
        } else if(conflict.title.includes('Program')) {
          action = 'Compare curriculum with your prerequisites';
        } else if(conflict.title.includes('Career') || conflict.title.includes('ROI')) {
          action = 'Evaluate financial sustainability';
        } else if(conflict.title.includes('Loan Repayment')) {
          action = 'Adjust your loan term on the Costs tab';
        } else if(conflict.title.includes('Funding')) {
          action = 'Consider merit scholarships, employer sponsorship, additional savings, or more part-time work during studies.';
        } else if(conflict.title.includes('Financial')) {
          action = 'Refine financial planning strategy';
        } else {
          action = 'Review details carefully';
        }

        html += '<div class="insights-carousel-card"><div class="insights-carousel-card-header">' + conflict.title + '</div>';
        html += '<div class="insights-carousel-card-content">';
        html += '<div class="insights-carousel-card-row"><strong style="color:' + color + '">⚠️ What it means:</strong><br>' + meaning + '</div>';
        html += '<div class="insights-carousel-card-row" style="margin-top:8px"><strong>What to do:</strong><br>' + action + '</div>';
        html += '</div></div>';
      });
      html += '</div><div class="carousel-indicator">Check 1 of ' + deduped.length + '</div></div>';

      // Desktop table version
      html += '<div class="insights-table-display"><div style="overflow-x:auto;margin-bottom:24px"><table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0">';
      html += '<thead><tr style="border-bottom:1px solid var(--bdr);background:var(--lt)"><th style="padding:8px 10px;text-align:left;color:var(--dk);font-weight:700;width:20%;white-space:nowrap">Issue</th><th style="padding:8px 10px;text-align:left;color:var(--dk);font-weight:700;width:50%">What it means</th><th style="padding:8px 10px;text-align:left;color:var(--dk);font-weight:700;width:30%">What to do</th></tr></thead>';
      html += '<tbody>';
      deduped.forEach(conflict => {
        const color = conflict.type === 'conflict' ? 'var(--bad)' : 'var(--warn)';
        const severity = conflict.type === 'conflict' ? '💥' : '⚠️';
        let meaning = conflict.msg.replace(/^[💥⚠️ℹ️]+\s*/, '').trim();
        meaning = severity + ' ' + meaning;

        let action = '';
        if(conflict.title.includes('Course Requirements')) {
          action = 'Verify your chosen universities offer those courses or specializations based on the career you are targeting.';
        } else if(conflict.title.includes('Bridging')) {
          action = 'Ensure the EU degree you are pursuing will be marketable in the US for the career you are targeting.';
        } else if(conflict.title.includes('Cost') || conflict.title.includes('Selectivity')) {
          action = 'Research scholarship options and affordability factors';
        } else if(conflict.title.includes('Language')) {
          action = 'Plan language prep or seek English-taught programs';
        } else if(conflict.title.includes('Location') || conflict.title.includes('Vision')) {
          action = 'Verify alignment with your post-graduation plans';
        } else if(conflict.title.includes('Program')) {
          action = 'Compare curriculum with your prerequisites';
        } else if(conflict.title.includes('Career') || conflict.title.includes('ROI')) {
          action = 'Evaluate financial sustainability';
        } else if(conflict.title.includes('Loan Repayment')) {
          action = 'Adjust your loan term on the Costs tab';
        } else if(conflict.title.includes('Funding')) {
          action = 'Consider merit scholarships, employer sponsorship, additional savings, or more part-time work during studies.';
        } else if(conflict.title.includes('Financial')) {
          action = 'Refine financial planning strategy';
        } else {
          action = 'Review details carefully';
        }

        html += '<tr style="border-bottom:1px solid var(--bdr);background:#fff"><td style="padding:8px 10px;color:var(--tx0);font-weight:600;vertical-align:top;width:20%;line-height:1.4;background:rgba(241,245,249,.5);white-space:nowrap">' + conflict.title + '</td><td style="padding:8px 10px;vertical-align:top;color:' + color + ';line-height:1.4;width:50%">' + meaning + '</td><td style="padding:8px 10px;vertical-align:top;color:var(--tx);line-height:1.4;width:30%">' + action + '</td></tr>';
      });
      html += '</tbody></table></div></div>';
    }

    // SECTION 2: YOUR BEST FITS (combined career+country with countries as columns)
    if(careerFits.length > 0 && S.cc.length > 0){
      html += '<h2 style="margin:24px 0 12px 0;color:var(--dk);font-size:20px">Career Fit</h2>';
      html += '<div style="font-size:13px;color:var(--tx2);margin-bottom:10px;line-height:1.5">Review alignment of selected careers with your choices. Adjust your choices on the various tabs to refine or surface new insights.</div>';

      html += '<div class="insights-carousel-wrap" id="bestfits-carousel"><div class="insights-carousel-container">';
      careerFits.forEach(cf => {
        html += '<div class="insights-carousel-card"><div class="insights-carousel-card-header">' + cf.name + '</div>';
        html += '<div class="insights-carousel-card-content">';
        if(cf.pros.length > 0) {
          html += '<div class="insights-carousel-card-row"><strong style="color:var(--ok)">✅ Strengths:</strong><br>' + cf.pros.map(p => formatInsightItem(p, true)).join('<br>') + '</div>';
        }
        if(cf.cons.length > 0) {
          html += '<div class="insights-carousel-card-row" style="margin-top:8px"><strong style="color:var(--warn)">⚠️ Considerations:</strong><br>' + cf.cons.map(c => formatInsightItem(c, false)).join('<br>') + '</div>';
        }
        html += '</div></div>';
      });
      html += '</div><div class="carousel-indicator">Career 1 of ' + careerFits.length + '</div></div>';

      html += '<div class="insights-table-display"><div style="overflow-x:auto;margin-bottom:24px"><table style="width:100%;border-collapse:collapse;font-size:13px;margin:12px 0">';
      html += '<thead><tr style="border-bottom:1px solid var(--bdr);background:var(--lt)"><th style="padding:8px 10px;text-align:left;color:var(--dk);font-weight:700;width:20%;white-space:nowrap">Career</th><th style="padding:8px 10px;text-align:left;color:var(--dk);font-weight:700;width:50%">Strengths</th><th style="padding:8px 10px;text-align:left;color:var(--dk);font-weight:700;width:30%">Considerations</th></tr></thead>';
      html += '<tbody>';
      careerFits.forEach(cf => {
        const prosHTML = cf.pros.length > 0 ? cf.pros.map(p => formatInsightItem(p, true)).join('<br>') : '—';
        const consHTML = cf.cons.length > 0 ? cf.cons.map(c => formatInsightItem(c, false)).join('<br>') : '—';
        html += '<tr style="border-bottom:1px solid var(--bdr);background:#fff"><td style="padding:8px 10px;color:var(--tx0);font-weight:600;vertical-align:top;width:20%;line-height:1.4;background:rgba(241,245,249,.5);white-space:nowrap">' + cf.name + '</td><td style="padding:8px 10px;vertical-align:top;width:50%;line-height:1.4">' + prosHTML + '</td><td style="padding:8px 10px;vertical-align:top;width:30%;line-height:1.4">' + consHTML + '</td></tr>';
      });
      html += '</tbody></table></div></div>';
    }

    // SECTION 3: FINANCIAL IMPACT
    if(costAnalysis.length > 0){
      html += '<h2 style="margin:24px 0 12px 0;color:var(--dk);font-size:20px">Financial Fit</h2>';
      html += '<div style="font-size:13px;color:var(--tx2);margin-bottom:10px;line-height:1.5">Review the financial insights based on your selected countries and cost inputs. Adjust your choices on the various tabs to refine or surface new insights.</div>';

      const costInsightsByCountry = {};
      universityInsights.filter(u => u.type === 'cost').forEach(insight => {
        const country = insight.country;
        if(!costInsightsByCountry[country]) costInsightsByCountry[country] = {pros: [], cons: []};
        if(insight.pro) costInsightsByCountry[country].pros.push(insight.msg);
        else costInsightsByCountry[country].cons.push(insight.msg);
      });

      const costItemsWithInsights = costAnalysis.map(cf => {
        let pros = [...cf.pros];
        let cons = [...cf.cons];
        if(costInsightsByCountry[cf.name]) {
          pros = pros.concat(costInsightsByCountry[cf.name].pros);
          cons = cons.concat(costInsightsByCountry[cf.name].cons);
        }
        return { name: cf.name, pros, cons };
      });

      html += renderInsightsTable(
        '',
        '',
        'Category',
        costItemsWithInsights,
        'cost-carousel'
      );
    }

    html += '<div style="margin-top:32px">' + guidanceMsg('Adjust selections across tabs to refine these insights') + '</div>';
  }

  el.innerHTML = html;

  // Initialize all carousels with JavaScript-based snapping
  setTimeout(() => {
    if(document.getElementById('conflicts-carousel')) initCarousel('conflicts-carousel', '.insights-carousel-container');
    if(document.getElementById('bestfits-carousel')) initCarousel('bestfits-carousel', '.insights-carousel-container');
    if(document.getElementById('cost-carousel')) initCarousel('cost-carousel', '.insights-carousel-container');
  }, 50);
}


// Export all functions to window for global access
window.formatMoneyRange = formatMoneyRange;
window.formatEducationSummary = formatEducationSummary;
window.formatGrowth = formatGrowth;
window.formatPortability = formatPortability;
window.formatLicensing = formatLicensing;
window.formatDemand = formatDemand;
window.renderHdrImages = renderHdrImages;
window.renderPathfinderTab = renderPathfinderTab;
window.renderCareerView = renderCareerView;
window.renderCatTable = renderCatTable;
window.renderSubPills = renderSubPills;
window.renderCareerTable = renderCareerTable;
window.renderFilterSubPills = renderFilterSubPills;
window.renderPracPills = renderPracPills;
window.renderFilterAnalysis = renderFilterAnalysis;
window.renderFilterResult = renderFilterResult;
window.renderCCChips = renderCCChips;
window.renderCCTable = renderCCTable;
window.renderUniversities = renderUniversities;
window.renderScholar = renderScholar;
window.renderCostChips = renderCostChips;
window.renderCostTable = renderCostTable;
window.renderTransition = renderTransition;
window.renderExChips = renderExChips;
window.renderPath = renderPath;
window.formatInsightItem = formatInsightItem;
window.renderInsightsTable = renderInsightsTable;
window.renderInsights = renderInsights;
