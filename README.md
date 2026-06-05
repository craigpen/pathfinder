# Pathfinder Framework

A universal framework for building interactive education pathfinders. Students answer discovery questions about their motivations, constraints, and goals, then explore recommendations tailored to their choices.

**Current Pathfinders:**
- **University Pathfinder** — Explore careers, compare countries, understand costs, find universities
- **Bootcamp Pathfinder** — Discover coding bootcamps, compare costs, find your fit

## Quick Start

### Run Locally

```bash
# Clone the repo
git clone https://github.com/craigpen/pathfinder.git
cd pathfinder

# Start a local server
python -m http.server 8000
```

Then open:
- **University:** `http://localhost:8000/university/`
- **Bootcamp:** `http://localhost:8000/bootcamp/`
- **Home (redirects to University):** `http://localhost:8000/`

### Navigate Between Pathfinders

Use URL hash to navigate:
- `http://localhost:8000/#university` → University Pathfinder
- `http://localhost:8000/#bootcamp` → Bootcamp Pathfinder
- `http://localhost:8000/` (no hash) → defaults to University

## Architecture

```
pathfinder/
├── index.html              Router (redirects based on URL hash)
├── framework.js            Shared framework (CSS, loaders, state, UI builders)
├── state-names.json        US state names (shared data)
├── CLAUDE.md               Development guidelines
├── README.md               This file
│
├── university/             University Pathfinder
│   ├── index.html          (40KB, includes CSS)
│   ├── config.js           Pathfinder config (selectors, tabs, data sources)
│   ├── helpers.js          Query/format helpers for domain logic
│   ├── renderers.js        Custom rendering for complex tabs
│   └── data/               JSON data files
│       ├── careers.json
│       ├── countries.json
│       ├── universities.json
│       ├── insights.json
│       ├── header-images.json
│       └── selector-options.json
│
└── bootcamp/               Bootcamp Pathfinder (minimal example)
    ├── index.html          (1.5KB, uses framework CSS)
    ├── config.js
    ├── helpers.js
    └── data/
        ├── bootcamps.json
        ├── header-images.json
        └── selector-options.json
```

### Design Pattern

**Shared Framework (`framework.js`):**
- CSS (all styling)
- Data loaders (async, with validation)
- State management (`saveState()`, `loadState()`, localStorage)
- UI builders (`buildHeader()`, `buildSelectors()`, tab system)
- Event handlers (carousel, pill toggles, navigation)

**Pathfinder-Specific Code:**
- `config.js` — Pathfinder configuration (selectors, tabs, data sources, header settings)
- `helpers.js` — Domain-specific query/format functions
- `renderers.js` (optional) — Custom tab rendering logic
- `data/*.json` — Pathfinder data

Every pathfinder reuses 100% of framework code; only configuration and domain logic are unique.

## Creating a New Pathfinder

1. **Create directory:**
   ```bash
   mkdir {pathfinder-name}
   cd {pathfinder-name}
   ```

2. **Copy template files** (from bootcamp for minimal, or university for full):
   ```bash
   cp ../bootcamp/index.html .
   cp ../bootcamp/config.js .
   cp ../bootcamp/helpers.js .
   mkdir -p data
   ```

3. **Edit `config.js`:**
   ```javascript
   const {name}PathfinderConfig = {
     id: '{pathfinder-name}',
     name: '{Display Name}',
     header: { /* title, subtitle, imagesFile, enableMusic */ },
     selectors: [ /* discovery questions */ ],
     tabs: [ /* tab definitions */ ],
     stateFields: [ /* state to persist */ ],
     dataSources: { /* data files to load */ }
   };
   window.PATHFINDER_CONFIG = {name}PathfinderConfig;
   ```

4. **Create data files** in `data/`:
   - `header-images.json` — Image URLs for header carousel
   - `selector-options.json` — Pill options for discovery selectors
   - Other domain-specific data files

5. **Update root `index.html` router** to recognize new pathfinder (edit the hash check)

6. **Deploy:** Push to GitHub; GitHub Pages will serve it

## Features

- **Mobile-First Design:** Responsive carousels on portrait, tables on landscape
- **Persistent State:** Selections saved to localStorage; survive page refreshes
- **Dynamic UI:** Selectors, header, tabs, and insights built from config + data
- **Accessible:** Semantic HTML, keyboard navigation, contrast-compliant colors
- **Performance:** Minimal dependencies (vanilla JS), ~40KB per pathfinder

## Development

For development guidelines, workflow, state management patterns, data externalization, and contribution workflows, see [CLAUDE.md](CLAUDE.md).

**Key Resources:**
- State Management: Section 1 of CLAUDE.md
- Data Externalization: Section 7 of CLAUDE.md
- Career Database Schema: Section 9 of CLAUDE.md
- Building New Pathfinders: Section in "Building a New Pathfinder From Scratch"

## Current Version

**v1.20.0** — Framework consolidation complete. All pathfinders now use shared framework code. See [CLAUDE.md](CLAUDE.md) for detailed version history.

## License

MIT
