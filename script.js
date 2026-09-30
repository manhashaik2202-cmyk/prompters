/**
 * ============================================================================
 * CrisisConnect AI - Disaster Response Coordination Prototype
 * script.js - Application Logic, State Management, and Interactivity
 * ============================================================================
 */

// Storage keys for localStorage persistence
const STORAGE_KEYS = {
  USER_SESSION: 'crisis_connect_user',
  RESOURCES: 'crisis_connect_resources',
  SHELTERS: 'crisis_connect_shelters',
  TASKS: 'crisis_connect_tasks',
  ALERTS: 'crisis_connect_alerts',
  ACTIVITY_LOG: 'crisis_connect_activity',
  AI_SCENARIO_IDX: 'crisis_connect_ai_idx'
};

/* ============================================================================
   DEFAULT SEED / DEMO DATA (Riverdale City Flooding Emergency)
   ============================================================================ */

const DEFAULT_AI_SCENARIOS = [
  {
    severity: "CRITICAL - LEVEL 4",
    riverSpeed: "+4.2 in/hr (Cresting at 14.8ft)",
    summary: "Heavy cloudburst runoff has overwhelmed the Mill Creek drainage basin. Water levels are rising rapidly along the Riverside District. 3 main arterial bridges are impassable. Secondary earthen levees in Sector 2 show seepage. Priority focus is civilian water rescues and hospital emergency power preservation.",
    urgentNeeds: [
      "High-capacity dewatering trash pumps for Central Hospital generator vault",
      "Shallow-draft inflatable evacuation boats in Riverside District (Zone A)",
      "Clean bottled drinking water and infant formula at North High Shelter"
    ],
    highRiskLocations: [
      "Riverside District: 4ft standing water, low-lying homes cut off",
      "Central Hospital: Basement utility rooms threatened by sewer backflow",
      "Highway 8 Underpass: Stranded transit bus, blocked heavy logistics corridor"
    ]
  },
  {
    severity: "CRITICAL - LEVEL 4",
    riverSpeed: "+2.8 in/hr (Crest Sustained)",
    summary: "Eastern levee berm near Industrial Park is holding but experiencing erosion sloughing on the downstream face. Sump pumps are operating at 95% capacity. Rainfall is transitioning to intermittent squalls, but runoff will maintain peak river surge for the next 4 hours.",
    urgentNeeds: [
      "5,000 sandbags and mechanical earthmovers at East Industrial Levee",
      "Emergency diesel fuel delivery for auxiliary generators at West Substation",
      "Senior citizen transport vans for Elm Street apartment complex"
    ],
    highRiskLocations: [
      "East Levee Sector: Saturated soil conditions and seepage points",
      "Mill Creek Lowland Rail Yards: Tracks submerged by 2.5ft floodwater",
      "South Sector Triage Post: Overwhelmed by minor wound treatments"
    ]
  },
  {
    severity: "HIGH - LEVEL 3",
    riverSpeed: "-1.1 in/hr (Receding Slowly)",
    summary: "Main river surge has peaked and is stabilizing. Downstream tributaries are draining at 1.1 inches per hour. Standing floodwaters remain severely contaminated with municipal runoff. Hazardous debris and downed power lines continue to restrict access across 6 primary transit corridors.",
    urgentNeeds: [
      "Industrial water purification units deployed to Valley View community",
      "Hazmat inspection team for reported chemical container drift near Pier 4",
      "Heavy tree and debris removal winches for Route 12 transit artery"
    ],
    highRiskLocations: [
      "Lower Highway 8: Multiple abandoned passenger vehicles and mud deposits",
      "Pier 4 Wharf: Loose barges secured, inspection ongoing",
      "West Municipal Water Intake: Turbidity levels exceeding safety thresholds"
    ]
  }
];

const DEFAULT_INCIDENTS = [
  {
    id: 'inc-1',
    source: 'Weather Alert',
    sourceIcon: '⛈️',
    location: 'Mill Creek Basin / Sector 1',
    time: '12 mins ago',
    severity: 'Critical',
    description: 'Flash Flood Warning escalated to Flash Flood Emergency. River has breached minor flood stage by 3.8 feet.'
  },
  {
    id: 'inc-2',
    source: 'Field Responder',
    sourceIcon: '🚒',
    location: 'Riverside District, 4th & River Rd',
    time: '18 mins ago',
    severity: 'Critical',
    description: 'Rapid water rise. 40 residents stranded in 2-story residences. Search & Rescue Boat Team Alpha deploying.'
  },
  {
    id: 'inc-3',
    source: 'Hospital',
    sourceIcon: '🏥',
    location: 'Central Hospital (Medical Zone)',
    time: '24 mins ago',
    severity: 'High',
    description: 'Basement transformer and emergency diesel backup generators threatened by 18 inches of flood seepage. Urgent pump request.'
  },
  {
    id: 'inc-4',
    source: 'Government',
    sourceIcon: '🏛️',
    location: 'Citywide Metro Area',
    time: '35 mins ago',
    severity: 'High',
    description: 'Mayor and Governor declare Municipal State of Emergency. Mandatory evacuation ordered for flood zones A and B.'
  },
  {
    id: 'inc-5',
    source: 'Citizen',
    sourceIcon: '📱',
    location: 'Elm Street & 5th Ave',
    time: '42 mins ago',
    severity: 'High',
    description: 'Elderly care group home basement flooded; water creeping up first-floor stairwell. Power offline.'
  },
  {
    id: 'inc-6',
    source: 'Field Responder',
    sourceIcon: '🚓',
    location: 'Highway 8 Underpass',
    time: '50 mins ago',
    severity: 'High',
    description: 'Major arterial road submerged under 5ft of water. 3 vehicles stranded with drivers rescued. Road closed in both directions.'
  },
  {
    id: 'inc-7',
    source: 'Weather Alert',
    sourceIcon: '🛰️',
    location: 'Metro Western Ridge',
    time: '1 hr ago',
    severity: 'Medium',
    description: 'Doppler radar indicates secondary precipitation band weakening. Expect 0.75 inches additional rainfall over next 2 hours.'
  },
  {
    id: 'inc-8',
    source: 'Citizen',
    sourceIcon: '📱',
    location: 'North Suburbs, Sector 3',
    time: '1 hr 15 mins ago',
    severity: 'Low',
    description: 'Minor street flooding on sidewalk curb; stormwater storm drains gurgling but moving water slowly.'
  }
];

const DEFAULT_PRIORITY_AREAS = [
  {
    name: "Riverside District (Zone A)",
    riskLevel: "Critical",
    peopleAffected: "1,850",
    requirement: "Evacuation boats, flotation vests, dry shelter transport",
    team: "Search & Rescue Alpha-1",
    status: "Active Boat Extraction"
  },
  {
    name: "Central Medical Complex",
    riskLevel: "High",
    peopleAffected: "410 Patients",
    requirement: "Dewatering pumps, backup power feed, sterile supplies",
    team: "Utility Battalion 4 & EMT Triage",
    status: "Active Dewatering"
  },
  {
    name: "East Levee Sector",
    riskLevel: "Critical",
    peopleAffected: "1,250",
    requirement: "Sandbag reinforcement, earthmovers, seepage berms",
    team: "National Guard Detachment B",
    status: "Sandbagging Active"
  },
  {
    name: "Highway 8 Logistics Corridor",
    riskLevel: "High",
    peopleAffected: "620 Commuters",
    requirement: "Heavy tow clearance, detour barricades, hazard signage",
    team: "State Highway Patrol & DOT",
    status: "Route Closed / Diverted"
  },
  {
    name: "North Hills Residential",
    riskLevel: "Stable",
    peopleAffected: "120",
    requirement: "Clean bottled water, dry blanket kits, basic medical check",
    team: "Volunteer Unit 2",
    status: "Monitoring / Safe"
  }
];

const DEFAULT_RESOURCES = [
  {
    id: 'res-responders',
    name: 'Responders',
    icon: '🛡️',
    unit: 'Personnel',
    available: 38,
    deployed: 142,
    required: 200
  },
  {
    id: 'res-med',
    name: 'Medical supplies',
    icon: '🩹',
    unit: 'Trauma & Triage Kits',
    available: 450,
    deployed: 820,
    required: 1500
  },
  {
    id: 'res-food',
    name: 'Food and water',
    icon: '🍞',
    unit: 'MRE & Water Packs',
    available: 1200,
    deployed: 3400,
    required: 5000
  },
  {
    id: 'res-vehicles',
    name: 'Rescue vehicles',
    icon: '🚤',
    unit: 'Boats & High-Water Trucks',
    available: 6,
    deployed: 22,
    required: 35
  },
  {
    id: 'res-shelters',
    name: 'Temporary shelters',
    icon: '⛺',
    unit: 'Deployable Units',
    available: 4,
    deployed: 8,
    required: 14
  }
];

const DEFAULT_SHELTERS = [
  {
    id: 'she-1',
    name: 'North High School Gymnasium',
    location: '1200 Northridge Way, North Sector',
    occupancy: 380,
    capacity: 450,
    contact: '(555) 019-2831',
    status: 'Near Capacity'
  },
  {
    id: 'she-2',
    name: 'Civic Community Recreation Center',
    location: '450 Civic Center Blvd, West Sector',
    occupancy: 210,
    capacity: 500,
    contact: '(555) 014-9922',
    status: 'Accepting Evacuees'
  },
  {
    id: 'she-3',
    name: 'St. Jude Community Hall',
    location: '88 Faith Ave, Central District',
    occupancy: 290,
    capacity: 300,
    contact: '(555) 018-4411',
    status: 'Full'
  },
  {
    id: 'she-4',
    name: 'Westside Sports Fieldhouse',
    location: '300 Stadium Road, Outer West',
    occupancy: 150,
    capacity: 600,
    contact: '(555) 012-7744',
    status: 'Accepting Evacuees'
  }
];

const DEFAULT_TASKS = [
  {
    id: 'tsk-1',
    title: 'Deliver 500 emergency rations to Sector 4 Hub',
    status: 'pending',
    priority: 'High',
    assigned: 'Volunteer Logistics',
    time: '15m ago'
  },
  {
    id: 'tsk-2',
    title: 'Inspect structural stability of Mill Creek Bridge',
    status: 'pending',
    priority: 'Critical',
    assigned: 'Civil Engineering Unit',
    time: '30m ago'
  },
  {
    id: 'tsk-3',
    title: 'Distribute water purification tablets to North Shelter',
    status: 'pending',
    priority: 'Medium',
    assigned: 'Public Health Team',
    time: '45m ago'
  },
  {
    id: 'tsk-4',
    title: 'Evacuate 35 residents from Riverside Senior Living',
    status: 'in-progress',
    priority: 'Critical',
    assigned: 'Search & Rescue Alpha-1',
    time: '25m ago'
  },
  {
    id: 'tsk-5',
    title: 'Install 3 high-capacity submersible pumps at Central Hospital',
    status: 'in-progress',
    priority: 'Critical',
    assigned: 'Utility Battalion 4',
    time: '40m ago'
  },
  {
    id: 'tsk-6',
    title: 'Operate mobile triage tent at North High School',
    status: 'in-progress',
    priority: 'High',
    assigned: 'Red Cross Medical Team',
    time: '1h ago'
  },
  {
    id: 'tsk-7',
    title: 'Establish Incident Command Post at City Hall',
    status: 'completed',
    priority: 'High',
    assigned: 'Emergency Management Lead',
    time: '2h ago'
  },
  {
    id: 'tsk-8',
    title: 'Broadcast Zone A mandatory evacuation alert sirens',
    status: 'completed',
    priority: 'Critical',
    assigned: 'Dispatch Communications',
    time: '2h ago'
  },
  {
    id: 'tsk-9',
    title: 'Close Highway 8 low-water crossing and set detour signs',
    status: 'completed',
    priority: 'Medium',
    assigned: 'State Highway Patrol',
    time: '3h ago'
  }
];

const DEFAULT_ALERTS = [
  {
    id: 'alt-1',
    severity: 'Critical',
    area: 'Riverside District / Lowland Basin',
    message: 'MANDATORY EVACUATION: Flash flood waters rising rapidly. Evacuate immediately to North High School or Civic Center.',
    time: '15 mins ago'
  },
  {
    id: 'alt-2',
    severity: 'High',
    area: 'Highway 8 Corridor',
    message: 'ROAD CLOSURE: Highway 8 inundated between Exit 14 and Exit 18. Emergency vehicles only.',
    time: '45 mins ago'
  },
  {
    id: 'alt-3',
    severity: 'Medium',
    area: 'Citywide Metro',
    message: 'BOIL WATER ADVISORY: Water treatment plant #2 experiencing high turbidity. Boil tap water for 1 full minute before consumption.',
    time: '1 hr ago'
  }
];

const DEFAULT_ACTIVITY_LOG = [
  {
    id: 'act-1',
    icon: '🚨',
    text: 'Mandatory Evacuation broadcasted for Riverside District.',
    time: '15m ago'
  },
  {
    id: 'act-2',
    icon: '📦',
    text: 'Allocated 25 Responders to Riverside District (Search & Rescue Alpha-1).',
    time: '28m ago'
  },
  {
    id: 'act-3',
    icon: '🏠',
    text: 'Registered Westside Sports Fieldhouse as active shelter (Cap: 600).',
    time: '50m ago'
  },
  {
    id: 'act-4',
    icon: '📋',
    text: 'Task "Establish Incident Command Post" transitioned to Completed.',
    time: '2h ago'
  }
];

/* ============================================================================
   STATE CONTAINER (Loaded from LocalStorage or Defaults)
   ============================================================================ */

let appState = {
  currentUser: null,
  aiScenarioIndex: 0,
  resources: [],
  shelters: [],
  tasks: [],
  alerts: [],
  activityLog: [],
  incidents: DEFAULT_INCIDENTS,
  priorityAreas: DEFAULT_PRIORITY_AREAS
};

/* ============================================================================
   INITIALIZATION
   ============================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initClock();
  checkAuth();
  renderAll();
  setupKeyboardAccessibility();
});

/**
 * Initializes state from localStorage or defaults
 */
function initStorage() {
  try {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    appState.currentUser = savedUser ? JSON.parse(savedUser) : null;

    const savedAiIdx = localStorage.getItem(STORAGE_KEYS.AI_SCENARIO_IDX);
    appState.aiScenarioIndex = savedAiIdx !== null ? parseInt(savedAiIdx, 10) : 0;

    const savedResources = localStorage.getItem(STORAGE_KEYS.RESOURCES);
    appState.resources = savedResources ? JSON.parse(savedResources) : JSON.parse(JSON.stringify(DEFAULT_RESOURCES));

    const savedShelters = localStorage.getItem(STORAGE_KEYS.SHELTERS);
    appState.shelters = savedShelters ? JSON.parse(savedShelters) : JSON.parse(JSON.stringify(DEFAULT_SHELTERS));

    const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    appState.tasks = savedTasks ? JSON.parse(savedTasks) : JSON.parse(JSON.stringify(DEFAULT_TASKS));

    const savedAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
    appState.alerts = savedAlerts ? JSON.parse(savedAlerts) : JSON.parse(JSON.stringify(DEFAULT_ALERTS));

    const savedActivity = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);
    appState.activityLog = savedActivity ? JSON.parse(savedActivity) : JSON.parse(JSON.stringify(DEFAULT_ACTIVITY_LOG));
  } catch (err) {
    console.warn("Storage reading error, falling back to in-memory defaults:", err);
    appState.resources = JSON.parse(JSON.stringify(DEFAULT_RESOURCES));
    appState.shelters = JSON.parse(JSON.stringify(DEFAULT_SHELTERS));
    appState.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    appState.alerts = JSON.parse(JSON.stringify(DEFAULT_ALERTS));
    appState.activityLog = JSON.parse(JSON.stringify(DEFAULT_ACTIVITY_LOG));
  }
}

/**
 * Persists a key to localStorage safely
 */
function saveStateKey(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

/**
 * Reset all persistent demo data back to clean defaults
 */
function resetToDemoData() {
  if (confirm("Reset all operational data, shelters, tasks, and allocations back to the initial demo scenario?")) {
    appState.aiScenarioIndex = 0;
    appState.resources = JSON.parse(JSON.stringify(DEFAULT_RESOURCES));
    appState.shelters = JSON.parse(JSON.stringify(DEFAULT_SHELTERS));
    appState.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    appState.alerts = JSON.parse(JSON.stringify(DEFAULT_ALERTS));
    appState.activityLog = JSON.parse(JSON.stringify(DEFAULT_ACTIVITY_LOG));

    saveStateKey(STORAGE_KEYS.AI_SCENARIO_IDX, appState.aiScenarioIndex);
    saveStateKey(STORAGE_KEYS.RESOURCES, appState.resources);
    saveStateKey(STORAGE_KEYS.SHELTERS, appState.shelters);
    saveStateKey(STORAGE_KEYS.TASKS, appState.tasks);
    saveStateKey(STORAGE_KEYS.ALERTS, appState.alerts);
    saveStateKey(STORAGE_KEYS.ACTIVITY_LOG, appState.activityLog);

    renderAll();
    showToast("System reset to default demo scenario.", "info");
  }
}

/* ============================================================================
   1. AUTHENTICATION & LOGIN/LOGOUT
   ============================================================================ */

function handleLogin() {
  const emailInput = document.getElementById('login-email');
  const roleSelect = document.getElementById('login-role');

  const email = emailInput.value.trim() || 'responder@crisisconnect.local';
  const role = roleSelect.value;

  appState.currentUser = {
    email: email,
    role: role,
    isLoggedIn: true,
    loginTime: new Date().toLocaleTimeString()
  };

  saveStateKey(STORAGE_KEYS.USER_SESSION, appState.currentUser);

  checkAuth();
  showToast(`Welcome back, ${role}. Emergency mode active.`, 'success');
}

function handleLogout() {
  appState.currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
  checkAuth();
  showToast("Logged out of coordination terminal.", "info");
}

function checkAuth() {
  const loginScreen = document.getElementById('login-screen');
  const dashboardContainer = document.getElementById('dashboard-container');
  const headerRole = document.getElementById('header-user-role');
  const headerEmail = document.getElementById('header-user-email');
  const headerAvatar = document.getElementById('header-avatar');

  if (appState.currentUser && appState.currentUser.isLoggedIn) {
    loginScreen.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');

    if (headerRole) headerRole.textContent = appState.currentUser.role;
    if (headerEmail) headerEmail.textContent = appState.currentUser.email;

    if (headerAvatar) {
      // Create a 2-letter monogram for role
      const initials = appState.currentUser.role.split(' ').map(w => w[0]).join('').substring(0, 2);
      headerAvatar.textContent = initials || 'OP';
    }
  } else {
    loginScreen.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
  }
}

/* ============================================================================
   2. LIVE DATE & TIME
   ============================================================================ */

function initClock() {
  const clockEl = document.getElementById('live-clock');

  function update() {
    if (!clockEl) return;
    const now = new Date();
    const options = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    clockEl.textContent = now.toLocaleString('en-US', options);
  }

  update();
  setInterval(update, 1000);
}

/* ============================================================================
   3. OVERVIEW CARDS (KPIs)
   ============================================================================ */

function updateKpis() {
  const kpiIncidents = document.getElementById('kpi-incidents');
  const kpiPeople = document.getElementById('kpi-people');
  const kpiResponders = document.getElementById('kpi-responders');
  const kpiShelters = document.getElementById('kpi-shelters');
  const kpiShelterOccupancy = document.getElementById('kpi-shelter-occupancy');

  if (kpiIncidents) {
    kpiIncidents.textContent = appState.incidents.length;
  }

  if (kpiResponders) {
    const resData = appState.resources.find(r => r.id === 'res-responders');
    kpiResponders.textContent = resData ? resData.deployed : '142';
  }

  if (kpiShelters && kpiShelterOccupancy) {
    let totalCap = 0;
    let totalOcc = 0;
    let openCount = 0;

    appState.shelters.forEach(s => {
      totalCap += Number(s.capacity);
      totalOcc += Number(s.occupancy);
      if (s.status !== 'Full') openCount++;
    });

    const availSpaces = Math.max(0, totalCap - totalOcc);
    const pct = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 0;

    kpiShelters.textContent = `${availSpaces} Beds`;
    kpiShelterOccupancy.textContent = `${totalOcc} of ${totalCap} occupied (${pct}%) • ${openCount} open facilities`;
  }
}

/* ============================================================================
   4. AI SITUATION ANALYSIS
   ============================================================================ */

function renderAiAnalysis() {
  const scenario = DEFAULT_AI_SCENARIOS[appState.aiScenarioIndex % DEFAULT_AI_SCENARIOS.length];
  if (!scenario) return;

  const sevEl = document.getElementById('ai-severity');
  const riverEl = document.getElementById('ai-river-speed');
  const timeEl = document.getElementById('ai-updated-time');
  const sumEl = document.getElementById('ai-summary-text');
  const urgentList = document.getElementById('ai-urgent-needs');
  const riskList = document.getElementById('ai-high-risk-locations');

  if (sevEl) {
    sevEl.textContent = scenario.severity;
    sevEl.className = 'meta-badge ' + (scenario.severity.includes('CRITICAL') ? 'badge-critical' : 'badge-warning');
  }

  if (riverEl) riverEl.textContent = scenario.riverSpeed;
  if (timeEl) timeEl.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (sumEl) sumEl.textContent = scenario.summary;

  if (urgentList) {
    urgentList.innerHTML = scenario.urgentNeeds.map(item => `<li>${item}</li>`).join('');
  }

  if (riskList) {
    riskList.innerHTML = scenario.highRiskLocations.map(item => `<li>${item}</li>`).join('');
  }
}

function refreshAiAnalysis() {
  const btn = document.getElementById('btn-refresh-ai');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="refresh-icon">⏳</span> <span>Synthesizing...</span>`;
  }

  setTimeout(() => {
    // Advance scenario to simulate new dynamic data
    appState.aiScenarioIndex = (appState.aiScenarioIndex + 1) % DEFAULT_AI_SCENARIOS.length;
    saveStateKey(STORAGE_KEYS.AI_SCENARIO_IDX, appState.aiScenarioIndex);
    renderAiAnalysis();

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span class="refresh-icon">🔄</span> <span>Refresh AI Analysis</span>`;
    }

    addActivityLog('✨', 'Refreshed simulated AI situation analysis model.');
    showToast("AI Situation Analysis updated with latest intelligence feed.", "info");
  }, 600);
}

/* ============================================================================
   5. INCIDENT REPORTS & FILTERS
   ============================================================================ */

function renderIncidents() {
  const container = document.getElementById('incidents-container');
  const emptyState = document.getElementById('incidents-empty');
  const filterSeverity = document.getElementById('filter-severity')?.value || 'All';
  const filterSource = document.getElementById('filter-source')?.value || 'All';

  if (!container) return;

  const filtered = appState.incidents.filter(inc => {
    const matchSev = (filterSeverity === 'All' || inc.severity === filterSeverity);
    const matchSource = (filterSource === 'All' || inc.source === filterSource);
    return matchSev && matchSource;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = filtered.map(inc => {
    const sevClass = `sev-${inc.severity.toLowerCase()}`;
    const badgeClass = inc.severity === 'Critical' ? 'badge-danger' :
                       inc.severity === 'High' ? 'badge-warning' :
                       inc.severity === 'Medium' ? 'badge-info' : 'badge-success';

    return `
      <article class="incident-card ${sevClass}" tabindex="0">
        <div class="incident-card-top">
          <span class="incident-source">${inc.sourceIcon} ${escapeHtml(inc.source)}</span>
          <span class="badge ${badgeClass}">${escapeHtml(inc.severity)}</span>
        </div>
        <h4 class="incident-location">📍 ${escapeHtml(inc.location)}</h4>
        <p class="incident-desc">${escapeHtml(inc.description)}</p>
        <div class="incident-card-bottom">
          <span>🕒 Reported: ${escapeHtml(inc.time)}</span>
          <a href="hub.html" target="_blank" rel="noopener noreferrer" class="badge badge-info" style="text-decoration:none; cursor:pointer;" title="Open in another tab">
            Open Source ↗
          </a>
        </div>
      </article>
    `;
  }).join('');
}

function resetIncidentFilters() {
  const filterSeverity = document.getElementById('filter-severity');
  const filterSource = document.getElementById('filter-source');

  if (filterSeverity) filterSeverity.value = 'All';
  if (filterSource) filterSource.value = 'All';

  renderIncidents();
  showToast("Incident filters reset.", "info");
}

/* ============================================================================
   6. PRIORITY AREAS TABLE
   ============================================================================ */

function renderPriorityAreas() {
  const tbody = document.getElementById('priority-areas-body');
  const countBadge = document.getElementById('priority-area-count');
  if (!tbody) return;

  if (countBadge) {
    countBadge.textContent = `${appState.priorityAreas.length} Monitored Sectors`;
  }

  tbody.innerHTML = appState.priorityAreas.map(area => {
    let riskBadge = '';
    if (area.riskLevel === 'Critical') {
      riskBadge = '<span class="badge badge-danger">🔴 Critical</span>';
    } else if (area.riskLevel === 'High') {
      riskBadge = '<span class="badge badge-warning">🟠 High Priority</span>';
    } else {
      riskBadge = '<span class="badge badge-success">🟢 Stable / Safe</span>';
    }

    return `
      <tr>
        <td class="area-name-cell">
          <strong>${escapeHtml(area.name)}</strong>
        </td>
        <td>${riskBadge}</td>
        <td><strong>${escapeHtml(area.peopleAffected)}</strong></td>
        <td>${escapeHtml(area.requirement)}</td>
        <td><span class="badge badge-info">${escapeHtml(area.team)}</span></td>
        <td><em>${escapeHtml(area.status)}</em></td>
      </tr>
    `;
  }).join('');
}

/* ============================================================================
   7. RESOURCE COORDINATION
   ============================================================================ */

function renderResources() {
  const container = document.getElementById('resource-cards-container');
  if (!container) return;

  container.innerHTML = appState.resources.map(res => {
    return `
      <div class="resource-card">
        <div>
          <div class="res-header">
            <span class="res-icon">${res.icon}</span>
            <h4 class="res-title">${escapeHtml(res.name)}</h4>
          </div>
          <div class="res-stats-list">
            <div class="res-stat-row">
              <span class="stat-label">Available:</span>
              <span class="stat-num avail">${res.available.toLocaleString()}</span>
            </div>
            <div class="res-stat-row">
              <span class="stat-label">Deployed:</span>
              <span class="stat-num">${res.deployed.toLocaleString()}</span>
            </div>
            <div class="res-stat-row">
              <span class="stat-label">Required:</span>
              <span class="stat-num req">${res.required.toLocaleString()}</span>
            </div>
            <div class="res-stat-row">
              <span class="stat-label">Unit:</span>
              <span class="stat-num" style="font-size:0.75rem; color:#64748b;">${escapeHtml(res.unit)}</span>
            </div>
          </div>
        </div>
        <button class="btn btn-outline btn-sm res-card-btn" onclick="openResourceModalPrefilled('${escapeHtml(res.name)}')">
          <span>Deploy / Allocate</span>
        </button>
      </div>
    `;
  }).join('');
}

function openResourceModalPrefilled(resourceName) {
  openModal('resource-modal');
  const typeSelect = document.getElementById('res-type');
  if (typeSelect && resourceName) {
    typeSelect.value = resourceName;
  }
}

function submitResourceAllocation() {
  const typeEl = document.getElementById('res-type');
  const qtyEl = document.getElementById('res-quantity');
  const destEl = document.getElementById('res-destination');
  const teamEl = document.getElementById('res-team');

  const type = typeEl.value;
  const qty = parseInt(qtyEl.value, 10);
  const destination = destEl.value;
  const team = teamEl.value.trim();

  if (isNaN(qty) || qty <= 0) {
    showToast("Please enter a valid allocation quantity greater than zero.", "error");
    return;
  }

  // Find matching resource in state
  const res = appState.resources.find(r => r.name.toLowerCase() === type.toLowerCase());
  if (!res) {
    showToast("Resource type not found.", "error");
    return;
  }

  if (qty > res.available) {
    showToast(`Requested quantity (${qty}) exceeds available reserve (${res.available}). Deploying maximum available.`, "error");
  }

  const allocatedQty = Math.min(qty, res.available);
  res.available = Math.max(0, res.available - allocatedQty);
  res.deployed += allocatedQty;

  saveStateKey(STORAGE_KEYS.RESOURCES, appState.resources);
  renderResources();
  updateKpis();

  // Log to Activity Log
  const logMsg = `Allocated ${allocatedQty} ${res.unit} of ${res.name} to ${destination} (Unit: ${team}).`;
  addActivityLog('📦', logMsg);

  closeModal('resource-modal');
  document.getElementById('resource-form').reset();
  showToast(`Successfully allocated ${allocatedQty} units to ${destination}!`, "success");
}

/* ============================================================================
   8. SHELTER MANAGEMENT
   ============================================================================ */

function renderShelters() {
  const container = document.getElementById('shelters-container');
  if (!container) return;

  container.innerHTML = appState.shelters.map(shelter => {
    const occ = Number(shelter.occupancy);
    const cap = Number(shelter.capacity);
    const avail = Math.max(0, cap - occ);
    const pct = cap > 0 ? Math.min(100, Math.round((occ / cap) * 100)) : 0;

    let fillClass = 'fill-safe';
    let statusBadge = 'badge-success';

    if (pct >= 95 || shelter.status === 'Full') {
      fillClass = 'fill-critical';
      statusBadge = 'badge-danger';
    } else if (pct >= 75 || shelter.status === 'Near Capacity') {
      fillClass = 'fill-warning';
      statusBadge = 'badge-warning';
    }

    return `
      <div class="shelter-card">
        <div class="shelter-top">
          <h4 class="shelter-name">🏠 ${escapeHtml(shelter.name)}</h4>
          <span class="badge ${statusBadge}">${escapeHtml(shelter.status)}</span>
        </div>
        <span class="shelter-loc">📍 ${escapeHtml(shelter.location)}</span>

        <div class="progress-wrap">
          <div class="progress-header">
            <span>Occupancy Rate</span>
            <strong>${occ} / ${cap} (${pct}%)</strong>
          </div>
          <div class="progress-bar-bg" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" title="${pct}% Occupancy">
            <div class="progress-bar-fill ${fillClass}" style="width: ${pct}%;"></div>
          </div>
        </div>

        <div class="shelter-details">
          <div class="shelter-detail-row">
            <span class="detail-label">Available Spaces:</span>
            <span class="detail-val" style="color: ${avail === 0 ? '#dc2626' : '#16a34a'}">
              ${avail} Beds
            </span>
          </div>
          <div class="shelter-detail-row">
            <span class="detail-label">Emergency Contact:</span>
            <span class="detail-val">${escapeHtml(shelter.contact)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function submitNewShelter() {
  const name = document.getElementById('she-name').value.trim();
  const location = document.getElementById('she-location').value.trim();
  const cap = parseInt(document.getElementById('she-capacity').value, 10);
  const occ = parseInt(document.getElementById('she-occupancy').value, 10);
  const contact = document.getElementById('she-contact').value.trim();

  if (!name || !location || isNaN(cap) || isNaN(occ) || !contact) {
    showToast("Please fill in all shelter details.", "error");
    return;
  }

  if (cap <= 0) {
    showToast("Capacity must be greater than zero.", "error");
    return;
  }

  if (occ > cap) {
    showToast("Initial occupancy cannot exceed maximum capacity.", "error");
    return;
  }

  let status = 'Accepting Evacuees';
  const pct = (occ / cap) * 100;
  if (pct >= 95) {
    status = 'Full';
  } else if (pct >= 75) {
    status = 'Near Capacity';
  }

  const newShelter = {
    id: 'she-' + Date.now(),
    name: name,
    location: location,
    capacity: cap,
    occupancy: occ,
    contact: contact,
    status: status
  };

  appState.shelters.push(newShelter);
  saveStateKey(STORAGE_KEYS.SHELTERS, appState.shelters);

  renderShelters();
  updateKpis();

  addActivityLog('🏠', `Registered new emergency shelter: ${name} (Cap: ${cap}).`);
  closeModal('shelter-modal');
  document.getElementById('shelter-form').reset();
  showToast(`Emergency shelter registered: ${name}!`, "success");
}

/* ============================================================================
   9. RESPONSE ACTIVITY BOARD (KANBAN TASKS)
   ============================================================================ */

function renderTasks() {
  const pendingContainer = document.getElementById('tasks-pending');
  const progressContainer = document.getElementById('tasks-in-progress');
  const completedContainer = document.getElementById('tasks-completed');

  const countPending = document.getElementById('count-pending');
  const countProgress = document.getElementById('count-in-progress');
  const countCompleted = document.getElementById('count-completed');

  if (!pendingContainer || !progressContainer || !completedContainer) return;

  const pendingTasks = appState.tasks.filter(t => t.status === 'pending');
  const progressTasks = appState.tasks.filter(t => t.status === 'in-progress');
  const completedTasks = appState.tasks.filter(t => t.status === 'completed');

  if (countPending) countPending.textContent = pendingTasks.length;
  if (countProgress) countProgress.textContent = progressTasks.length;
  if (countCompleted) countCompleted.textContent = completedTasks.length;

  const renderTaskCard = (task) => {
    const priBadge = task.priority === 'Critical' ? 'badge-danger' :
                     task.priority === 'High' ? 'badge-warning' : 'badge-info';

    let actionBtn = '';
    if (task.status === 'pending') {
      actionBtn = `<button class="btn btn-outline btn-sm" onclick="advanceTask('${task.id}')">Start Task ➔</button>`;
    } else if (task.status === 'in-progress') {
      actionBtn = `<button class="btn btn-primary btn-sm" onclick="advanceTask('${task.id}')">Mark Complete ✓</button>`;
    } else {
      actionBtn = `<span class="badge badge-success">✓ Done</span>`;
    }

    return `
      <div class="task-card">
        <div class="task-card-header">
          <span class="badge ${priBadge}">${escapeHtml(task.priority)}</span>
          <span style="font-size:0.7rem; color:#94a3b8;">${escapeHtml(task.time)}</span>
        </div>
        <h4 class="task-card-title">${escapeHtml(task.title)}</h4>
        <div class="task-card-meta">
          <span>👤 ${escapeHtml(task.assigned)}</span>
        </div>
        <div class="task-actions">
          ${actionBtn}
        </div>
      </div>
    `;
  };

  pendingContainer.innerHTML = pendingTasks.map(renderTaskCard).join('') || `<div style="padding:1rem; text-align:center; color:#94a3b8; font-size:0.8rem;">No pending tasks</div>`;
  progressContainer.innerHTML = progressTasks.map(renderTaskCard).join('') || `<div style="padding:1rem; text-align:center; color:#94a3b8; font-size:0.8rem;">No tasks in progress</div>`;
  completedContainer.innerHTML = completedTasks.map(renderTaskCard).join('') || `<div style="padding:1rem; text-align:center; color:#94a3b8; font-size:0.8rem;">No completed tasks</div>`;
}

function advanceTask(taskId) {
  const task = appState.tasks.find(t => t.id === taskId);
  if (!task) return;

  let newStatus = '';
  let logText = '';

  if (task.status === 'pending') {
    task.status = 'in-progress';
    newStatus = 'In Progress';
    logText = `Task "${task.title}" started by ${task.assigned}.`;
  } else if (task.status === 'in-progress') {
    task.status = 'completed';
    newStatus = 'Completed';
    logText = `Task "${task.title}" marked as Completed.`;
  }

  saveStateKey(STORAGE_KEYS.TASKS, appState.tasks);
  renderTasks();

  if (logText) {
    addActivityLog('📋', logText);
    showToast(`Task status updated: ${newStatus}`, "info");
  }
}

/* ============================================================================
   10. MAP INSPECTOR
   ============================================================================ */

function showMarkerInfo(title, subtitle, description, color) {
  const inspector = document.getElementById('map-inspector');
  const titleEl = document.getElementById('inspector-title');
  const descEl = document.getElementById('inspector-desc');

  if (!inspector || !titleEl || !descEl) return;

  titleEl.textContent = `📍 ${title} — ${subtitle}`;
  descEl.textContent = description;
  inspector.style.display = 'block';

  showToast(`Selected Map Point: ${title}`, "info");
}

function closeMapInspector() {
  const inspector = document.getElementById('map-inspector');
  if (inspector) {
    inspector.style.display = 'none';
  }
}

/* ============================================================================
   11. ALERTS & ACTIVITY LOG
   ============================================================================ */

function renderAlerts() {
  const container = document.getElementById('alerts-list');
  if (!container) return;

  if (appState.alerts.length === 0) {
    container.innerHTML = `<div style="padding:1.5rem; text-align:center; color:#94a3b8; font-size:0.85rem;">No active broadcast alerts.</div>`;
    return;
  }

  container.innerHTML = appState.alerts.map(alt => {
    const sevClass = `alert-${alt.severity.toLowerCase()}`;
    const badgeClass = alt.severity === 'Critical' ? 'badge-danger' :
                       alt.severity === 'High' ? 'badge-warning' : 'badge-info';

    return `
      <div class="alert-feed-item ${sevClass}">
        <div class="alert-item-header">
          <span class="alert-item-area">📍 ${escapeHtml(alt.area)}</span>
          <span class="badge ${badgeClass}">${escapeHtml(alt.severity)}</span>
        </div>
        <p class="alert-item-msg">${escapeHtml(alt.message)}</p>
        <span class="alert-item-time">🕒 Dispatched: ${escapeHtml(alt.time)}</span>
      </div>
    `;
  }).join('');
}

function submitEmergencyAlert() {
  const sevEl = document.getElementById('alt-severity');
  const areaEl = document.getElementById('alt-area');
  const msgEl = document.getElementById('alt-message');

  const severity = sevEl.value;
  const area = areaEl.value.trim();
  const message = msgEl.value.trim();

  if (!area || !message) {
    showToast("Please enter target area and message.", "error");
    return;
  }

  const newAlert = {
    id: 'alt-' + Date.now(),
    severity: severity,
    area: area,
    message: message,
    time: 'Just now'
  };

  // Add to beginning of array
  appState.alerts.unshift(newAlert);
  saveStateKey(STORAGE_KEYS.ALERTS, appState.alerts);

  renderAlerts();

  addActivityLog('🚨', `Dispatched ${severity} Alert to ${area}: "${message.substring(0, 40)}..."`);
  closeModal('alert-modal');
  document.getElementById('alert-form').reset();
  showToast("Emergency alert dispatched across responder channels!", "success");
}

function renderActivityLog() {
  const container = document.getElementById('activity-log');
  if (!container) return;

  if (appState.activityLog.length === 0) {
    container.innerHTML = `<div style="padding:1.5rem; text-align:center; color:#94a3b8; font-size:0.85rem;">No recent activities logged.</div>`;
    return;
  }

  container.innerHTML = appState.activityLog.map(act => {
    return `
      <div class="activity-item">
        <span class="activity-icon">${act.icon}</span>
        <div class="activity-content">
          <p class="activity-text">${escapeHtml(act.text)}</p>
          <span class="activity-time">🕒 ${escapeHtml(act.time)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function addActivityLog(icon, text) {
  const newEntry = {
    id: 'act-' + Date.now(),
    icon: icon,
    text: text,
    time: 'Just now'
  };

  appState.activityLog.unshift(newEntry);
  // Keep up to 25 entries
  if (appState.activityLog.length > 25) {
    appState.activityLog = appState.activityLog.slice(0, 25);
  }

  saveStateKey(STORAGE_KEYS.ACTIVITY_LOG, appState.activityLog);
  renderActivityLog();
}

function clearActivityLog() {
  if (confirm("Clear current operations activity log history?")) {
    appState.activityLog = [];
    saveStateKey(STORAGE_KEYS.ACTIVITY_LOG, []);
    renderActivityLog();
    showToast("Activity log cleared.", "info");
  }
}

/* ============================================================================
   MODALS & UI HELPERS
   ============================================================================ */

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    // Set focus to first input
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
  }
}

function handleBackdropClick(event, modalId) {
  if (event.target && event.target.id === modalId) {
    closeModal(modalId);
  }
}

function setupKeyboardAccessibility() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      ['resource-modal', 'shelter-modal', 'alert-modal'].forEach(closeModal);
      closeMapInspector();
    }
  });
}

/* ============================================================================
   TOAST NOTIFICATION ENGINE
   ============================================================================ */

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✓' :
               type === 'error' ? '⚠️' : 'ℹ️';

  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3500);
}

/* ============================================================================
   RENDER ALL VIEWS
   ============================================================================ */

function renderAll() {
  updateKpis();
  renderAiAnalysis();
  renderIncidents();
  renderPriorityAreas();
  renderResources();
  renderShelters();
  renderTasks();
  renderAlerts();
  renderActivityLog();
}

/**
 * Basic HTML sanitizer to prevent XSS in dynamic templates
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
