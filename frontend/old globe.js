/**
 * 3D Globe & Location Search Demo
 * Team NIE KAVACH - SIH 2026
 */

// Initialize Cesium Viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  animation: false,
  timeline: false,
  fullscreenButton: false,
  infoBox: false,
  selectionIndicator: false,
  shadows: false,
  imageryProvider: false,
  requestRenderMode: false,
  useBrowserRecommendedResolution: true,
  skyAtmosphere: new Cesium.SkyAtmosphere(),
  terrainProvider: new Cesium.EllipsoidTerrainProvider()
});

// Configure Globe Atmosphere & Visuals
viewer.scene.globe.enableLighting = false; // Keep globe illuminated and clear
viewer.scene.globe.depthTestAgainstTerrain = false;
viewer.scene.globe.atmosphereHueShift = 0.0;
viewer.scene.globe.atmosphereSaturationShift = 0.1;
viewer.scene.globe.atmosphereBrightnessShift = 0.1;
viewer.scene.globe.maximumScreenSpaceError = 2.5;
viewer.scene.globe.preloadSiblings = false;
viewer.scene.globe.preloadAncestors = false;
viewer.scene.fog.enabled = false;
viewer.scene.screenSpaceCameraController.minimumZoomDistance = 150; // 150m
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 45000000; // 45,000km
viewer.scene.screenSpaceCameraController.inertiaSpin = 0.85;
viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.85;
viewer.scene.screenSpaceCameraController.inertiaZoom = 0.85;
viewer.scene.screenSpaceCameraController.minimumPickingTerrainHeight = 150000;

// Map Layer Management
let currentBaseLayer = null;
let currentLabelsLayer = null;
let currentRoadsLayer = null;

// Configure High-Resolution Imagery Providers
const mapConfigs = {
  'hybrid-satellite': {
    name: 'Photorealistic Satellite + Labels',
    base: new Cesium.UrlTemplateImageryProvider({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 19,
      credit: '© Esri, Maxar, Earthstar Geographics'
    }),
    labels: new Cesium.UrlTemplateImageryProvider({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 19
    }),
    roads: new Cesium.UrlTemplateImageryProvider({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 19
    })
  },
  'osm': {
    name: 'OpenStreetMap Standard',
    base: new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      maximumLevel: 19,
      credit: '© OpenStreetMap contributors'
    }),
    labels: null,
    roads: null
  },
  'carto-dark': {
    name: 'CartoDB Dark Matter',
    base: new Cesium.UrlTemplateImageryProvider({
      url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      maximumLevel: 19,
      credit: '© CARTO, © OpenStreetMap'
    }),
    labels: null,
    roads: null
  },
  'opentopo': {
    name: 'Topographic & Terrain',
    base: new Cesium.UrlTemplateImageryProvider({
      url: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
      maximumLevel: 17,
      credit: '© OpenTopoMap, © OpenStreetMap'
    }),
    labels: null,
    roads: null
  }
};

/**
 * Apply selected map style
 */
function applyMapStyle(styleKey) {
  const config = mapConfigs[styleKey] || mapConfigs['hybrid-satellite'];
  viewer.imageryLayers.removeAll();

  // Add base layer
  currentBaseLayer = viewer.imageryLayers.addImageryProvider(config.base);

  // Add reference labels and borders if satellite
  if (config.labels) {
    currentLabelsLayer = viewer.imageryLayers.addImageryProvider(config.labels);
    currentLabelsLayer.alpha = 0.95;
  }
  if (config.roads) {
    currentRoadsLayer = viewer.imageryLayers.addImageryProvider(config.roads);
    currentRoadsLayer.alpha = 0.8;
  }
}

// Set initial map style to Satellite + Labels
applyMapStyle('hybrid-satellite');

// Default Home View (Centered over India / South Asia)
const HOME_LOCATION = {
  destination: Cesium.Cartesian3.fromDegrees(78.9629, 20.5937, 7000000),
  orientation: {
    heading: Cesium.Math.toRadians(0.0),
    pitch: Cesium.Math.toRadians(-85.0),
    roll: 0.0
  },
  duration: 2.5
};

// Initial camera animation
viewer.camera.flyTo(HOME_LOCATION);

if (document.getElementById('searchInput')) {
// Active Pin Marker Entity
let activePinEntity = null;

/**
 * Drop a glowing beacon & marker on the target location
 */
function dropLocationMarker(lon, lat, name) {
  if (activePinEntity) {
    viewer.entities.remove(activePinEntity);
    activePinEntity = null;
  }

  // Add target marker with glowing point and label
  activePinEntity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat, 50),
    point: {
      pixelSize: 14,
      color: Cesium.Color.fromCssColorString('#38bdf8'),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    },
    label: {
      text: name || 'Target Location',
      font: '13px JetBrains Mono, monospace',
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.fromCssColorString('#040609'),
      outlineWidth: 4,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -18),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      backgroundColor: Cesium.Color.fromCssColorString('rgba(11, 16, 26, 0.9)'),
      showBackground: true,
      backgroundPadding: new Cesium.Cartesian2(8, 5)
    }
  });
}

/**
 * Fly camera smoothly to coordinate
 */
function flyToLocation(lon, lat, name, height = 25000) {
  const statusDisplay = document.getElementById('statusDisplay');
  statusDisplay.textContent = 'FLYING...';
  statusDisplay.className = 'value text-sky-400';

  dropLocationMarker(lon, lat, name);
  loadLocationForecast(lat, lon, name);

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-55.0), // cinematic 3D tilt
      roll: 0.0
    },
    duration: 2.2,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    complete: () => {
      statusDisplay.textContent = 'LOCKED';
      statusDisplay.className = 'value text-emerald';
    }
  });
}

async function loadLocationForecast(lat, lon, name) {
  const encodedName = encodeURIComponent(name || 'Selected location');
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/v1/forecast/blended?lat=${lat}&lon=${lon}&name=${encodedName}`);
    if (!response.ok) throw new Error(`location forecast request failed: ${response.status}`);
    const snapshot = await response.json();
    const blendValue = snapshot.forecast?.[0];
    const spreadValue = snapshot.uncertainty?.[0];
    const location = snapshot.location || { name, latitude: lat, longitude: lon };
    pageData.location.metrics = [
      ['LOCATION', location.name || name || 'SELECTED PLACE'],
      ['BLENDED VALUE', `${Number(blendValue || 0).toFixed(1)} ${snapshot.variable === 'tp' ? 'mm' : ''}`, 'accent'],
      ['UNCERTAINTY', `${Number(spreadValue || 0).toFixed(1)} ${snapshot.variable === 'tp' ? 'mm' : ''}`],
      ['LEAD TIME', `+${snapshot.lead_hours}h`]
    ];
    pageData.location.cards = [
      ['Live forecast context', [['Valid time', snapshot.valid_time], ['Variable', snapshot.variable], ['Provider', snapshot.provider]]],
      ['Model contribution', Object.entries(snapshot.weights || {}).map(([model, weight]) => [model, `${(weight * 100).toFixed(1)}%`])],
      ['Lineage and limitations', [['Data mode', snapshot.mode], ['Sources', Object.keys(snapshot.lineage || {}).join(' / ')], ['Verification', snapshot.verification?.status || 'PENDING OBSERVATIONS']]]
    ];
    renderPage('location');
  } catch (error) {
    console.info('Selected-location live forecast unavailable.', error);
    pageData.location.metrics = [
      ['LOCATION', name || 'SELECTED PLACE'],
      ['LIVE DATA', 'UNAVAILABLE', 'accent'],
      ['LATITUDE', `${lat.toFixed(4)}°`],
      ['LONGITUDE', `${lon.toFixed(4)}°`]
    ];
    pageData.location.cards = [['Source status', [['Provider', 'UNAVAILABLE'], ['Action', 'RETRY REQUEST'], ['ML comparison', 'NOT RUN']]]];
    renderPage('location');
  }
}

// 2. Search & Geocoding Logic
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const searchSpinner = document.getElementById('searchSpinner');

let searchDebounceTimeout = null;
let currentResults = [];
let selectedIndex = -1;

/**
 * Check if query is latitude/longitude coordinates (e.g. "28.6139, 77.2090")
 */
function parseCoordinateQuery(query) {
  const clean = query.trim();
  const match = clean.match(/^([-+]?\d{1,3}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { lat, lon };
    }
  }
  return null;
}

/**
 * Perform Search with Nominatim OpenStreetMap API
 */
async function executeSearch(query) {
  if (!query || query.trim().length < 2) {
    searchResults.style.display = 'none';
    currentResults = [];
    searchSpinner.style.display = 'none';
    return;
  }

  // Check if query is direct coordinates
  const coords = parseCoordinateQuery(query);
  if (coords) {
    currentResults = [{
      display_name: `Coordinates: ${coords.lat.toFixed(4)}°, ${coords.lon.toFixed(4)}°`,
      name: `Lat: ${coords.lat.toFixed(4)}, Lon: ${coords.lon.toFixed(4)}`,
      lat: coords.lat.toString(),
      lon: coords.lon.toString(),
      type: 'coordinate'
    }];
    renderSearchResults(currentResults);
    searchSpinner.style.display = 'none';
    return;
  }

  searchSpinner.style.display = 'block';

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();

    currentResults = data;
    renderSearchResults(data);
  } catch (err) {
    console.error('Geocoding error:', err);
    searchResults.innerHTML = '<div class="no-results">Error fetching locations. Try typing coordinates.</div>';
    searchResults.style.display = 'block';
  } finally {
    searchSpinner.style.display = 'none';
  }
}

/**
 * Render Search Results Dropdown
 */
function renderSearchResults(items) {
  selectedIndex = -1;
  if (!items || items.length === 0) {
    searchResults.innerHTML = '<div class="no-results">No matching locations found</div>';
    searchResults.style.display = 'block';
    return;
  }

  searchResults.innerHTML = items.map((item, idx) => {
    const title = item.name || item.display_name.split(',')[0];
    const sub = item.display_name;
    const icon = item.type === 'coordinate' ? 'explore' : 'location_on';

    return `
      <div class="result-item" data-index="${idx}">
        <span class="material-symbols-outlined item-icon">${icon}</span>
        <div class="item-text">
          <span class="item-name">${title}</span>
          <span class="item-sub">${sub}</span>
        </div>
      </div>
    `;
  }).join('');

  searchResults.style.display = 'block';

  // Attach click events
  searchResults.querySelectorAll('.result-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.getAttribute('data-index'), 10);
      selectResultItem(idx);
    });
  });
}

/**
 * Select result item by index
 */
function selectResultItem(idx) {
  const item = currentResults[idx];
  if (!item) return;

  const lat = parseFloat(item.lat);
  const lon = parseFloat(item.lon);
  const title = item.name || item.display_name.split(',')[0];

  searchInput.value = title;
  searchResults.style.display = 'none';
  clearSearchBtn.style.display = 'flex';

  flyToLocation(lon, lat, title);
}

// Search Input Listeners
searchInput.addEventListener('input', (e) => {
  const val = e.target.value;
  clearSearchBtn.style.display = val.length > 0 ? 'flex' : 'none';

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    executeSearch(val);
  }, 350);
});

searchInput.addEventListener('keydown', (e) => {
  if (searchResults.style.display === 'none') return;

  const items = searchResults.querySelectorAll('.result-item');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex = (selectedIndex + 1) % items.length;
    updateSelectedHighlight(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
    updateSelectedHighlight(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < items.length) {
      selectResultItem(selectedIndex);
    } else if (currentResults.length > 0) {
      selectResultItem(0);
    }
  } else if (e.key === 'Escape') {
    searchResults.style.display = 'none';
  }
});

function updateSelectedHighlight(items) {
  items.forEach((item, idx) => {
    if (idx === selectedIndex) {
      item.classList.add('selected');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('selected');
    }
  });
}

// Clear Search Button
clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.style.display = 'none';
  searchResults.style.display = 'none';
  if (activePinEntity) {
    viewer.entities.remove(activePinEntity);
    activePinEntity = null;
  }
  searchInput.focus();
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!document.querySelector('.search-card').contains(e.target)) {
    searchResults.style.display = 'none';
  }
  if (!document.querySelector('.floating-controls').contains(e.target) && !layerMenu.contains(e.target)) {
    layerMenu.style.display = 'none';
  }
});

// 3. Preset Location Chips
document.querySelectorAll('.preset-chips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const lat = parseFloat(chip.getAttribute('data-lat'));
    const lon = parseFloat(chip.getAttribute('data-lon'));
    const name = chip.getAttribute('data-name');
    searchInput.value = name;
    clearSearchBtn.style.display = 'flex';
    searchResults.style.display = 'none';
    flyToLocation(lon, lat, name);
  });
});

// 4. Floating Navigation & Zoom Controls
const homeBtn = document.getElementById('homeBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const layerToggleBtn = document.getElementById('layerToggleBtn');
const layerMenu = document.getElementById('layerMenu');

homeBtn.addEventListener('click', () => {
  viewer.camera.flyTo(HOME_LOCATION);
  const statusDisplay = document.getElementById('statusDisplay');
  statusDisplay.textContent = 'HOME VIEW';
  statusDisplay.className = 'value text-sky-400';
});

zoomInBtn.addEventListener('click', () => {
  viewer.camera.zoomIn(viewer.camera.positionCartographic.height * 0.4);
});

zoomOutBtn.addEventListener('click', () => {
  viewer.camera.zoomOut(viewer.camera.positionCartographic.height * 0.4);
});

layerToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  layerMenu.style.display = layerMenu.style.display === 'none' ? 'flex' : 'none';
});

// Basemap Layer Selection
document.querySelectorAll('.layer-option').forEach(option => {
  option.addEventListener('click', () => {
    const type = option.getAttribute('data-type');
    
    // Update active class
    document.querySelectorAll('.layer-option').forEach(el => el.classList.remove('active'));
    option.classList.add('active');

    // Apply selected map style
    applyMapStyle(type);

    layerMenu.style.display = 'none';
  });
});

// 5. Live Telemetry HUD (Mouse Coordinate & Altitude Tracking)
const coordsDisplay = document.getElementById('coordsDisplay');
const altDisplay = document.getElementById('altDisplay');
const cursorCoordinates = document.getElementById('cursorCoordinates');
const cursorPlace = document.getElementById('cursorPlace');
const cursorDomain = document.getElementById('cursorDomain');
const cursorGrid = document.getElementById('cursorGrid');
let reverseGeocodeTimeout = null;
let lastReverseGeocodeKey = '';
const reverseGeocodeCache = new Map();

function formatCoordinate(value, positive, negative) {
  return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;
}

function updateCursorReadout(lat, lon) {
  const insideIndiaDomain = lat >= 5 && lat <= 38 && lon >= 66 && lon <= 100;
  const gridLat = Math.round(lat * 2) / 2;
  const gridLon = Math.round(lon * 2) / 2;
  cursorCoordinates.textContent = `${formatCoordinate(lat, 'N', 'S')}  ${formatCoordinate(lon, 'E', 'W')}`;
  cursorDomain.textContent = insideIndiaDomain ? 'INDIA ANALYSIS DOMAIN' : 'OUTSIDE INDIA DOMAIN';
  cursorDomain.className = insideIndiaDomain ? 'domain-active' : 'domain-outside';
  cursorGrid.textContent = `GRID ${gridLat.toFixed(1)} / ${gridLon.toFixed(1)}°`;

  const geocodeLat = Math.round(lat * 100) / 100;
  const geocodeLon = Math.round(lon * 100) / 100;
  const geocodeKey = `${geocodeLat.toFixed(2)},${geocodeLon.toFixed(2)}`;
  if (geocodeKey === lastReverseGeocodeKey) return;
  lastReverseGeocodeKey = geocodeKey;
  clearTimeout(reverseGeocodeTimeout);
  reverseGeocodeTimeout = setTimeout(async () => {
    if (reverseGeocodeCache.has(geocodeKey)) {
      applyReversePlace(reverseGeocodeCache.get(geocodeKey));
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/locations/reverse?lat=${geocodeLat}&lon=${geocodeLon}`);
      if (!response.ok) throw new Error(`reverse geocoder returned ${response.status}`);
      const place = await response.json();
      reverseGeocodeCache.set(geocodeKey, place);
      applyReversePlace(place);
    } catch (error) {
      cursorPlace.textContent = 'PLACE LOOKUP UNAVAILABLE';
      console.info('Reverse geocoding unavailable.', error);
    }
  }, 900);
}

function applyReversePlace(place) {
  cursorPlace.textContent = place.region ? `${place.name}, ${place.region}` : place.name;
}

// Mouse move handler on canvas
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction((movement) => {
  const cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
  if (cartesian) {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const lon = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
    
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    
    coordsDisplay.textContent = `${Math.abs(lat).toFixed(3)}° ${latDir}, ${Math.abs(lon).toFixed(3)}° ${lonDir}`;
    updateCursorReadout(lat, lon);
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

let clickInspectionTimeout = null;

async function inspectGlobeLocation(screenPosition) {
  const cartesian = viewer.camera.pickEllipsoid(screenPosition, viewer.scene.globe.ellipsoid);
  if (!cartesian) return;
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  const lon = Cesium.Math.toDegrees(cartographic.longitude);
  const lat = Cesium.Math.toDegrees(cartographic.latitude);
  const placeKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  cursorPlace.textContent = 'LOADING SELECTED LOCATION...';
  dropLocationMarker(lon, lat, 'Selected forecast point');
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/v1/locations/reverse?lat=${lat}&lon=${lon}`);
    const place = response.ok ? await response.json() : { name: 'Selected location', region: '' };
    applyReversePlace(place);
    await loadLocationForecast(lat, lon, place.name || placeKey);
  } catch (error) {
    cursorPlace.textContent = 'SELECTED LOCATION LOOKUP FAILED';
    console.info('Double-click location inspection unavailable.', error);
  }
}

handler.setInputAction((movement) => {
  clearTimeout(clickInspectionTimeout);
  clickInspectionTimeout = setTimeout(() => inspectGlobeLocation(movement.position), 260);
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

handler.setInputAction(() => {
  clearTimeout(clickInspectionTimeout);
}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

// Camera change listener for altitude readout
viewer.camera.changed.addEventListener(() => {
  const heightMeters = viewer.camera.positionCartographic.height;
  if (heightMeters > 1000) {
    altDisplay.textContent = `${(heightMeters / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
  } else {
    altDisplay.textContent = `${Math.round(heightMeters)} m`;
  }
});

// Stitch operations pages: one persistent globe, multiple analysis surfaces.
const pageData = {
  command: {
    eyebrow: 'OPERATIONS OVERVIEW',
    title: 'Orbital Weather Command',
    metrics: [['LATEST RUN', 'CONNECTING'], ['VERIFICATION', 'PENDING OBS', 'accent'], ['ACTIVE SOURCES', 'WAITING'], ['DATA MODE', 'LIVE OPEN DATA']],
    cards: [
      ['System health', [['API gateway', 'OPERATIONAL'], ['Fusion engine', 'READY'], ['Verification queue', '3 JOBS']]],
      ['Active weather regime', [['Primary', 'MONSOON ACTIVE'], ['India domain', '5N-38N / 66E-100E'], ['Lead time', '+48 HOURS']]],
      ['Extreme-event guidance', [['Heavy rainfall', 'MODERATE SIGNAL'], ['Heat anomaly', 'LOW SIGNAL'], ['High wind', 'WATCH']]]
    ]
  },
  intelligence: {
    eyebrow: 'EXTREME WEATHER', title: 'Weather Intelligence',
    metrics: [['THRESHOLD', 'LIVE API REQUIRED'], ['EXCEEDANCE', 'PENDING', 'accent'], ['MODEL AGREEMENT', 'PENDING'], ['LEAD TIME', 'PENDING']],
    cards: [['Decision support', [['Event', 'SELECT A LOCATION'], ['Affected region', 'PENDING LIVE DATA'], ['Guidance status', 'FORECAST GUIDANCE ONLY']]], ['Signal lineage', [['Sources', 'LIVE PROVIDER RESPONSE'], ['Calibration', 'OBSERVATIONS REQUIRED'], ['Uncertainty', 'PENDING']]]]
  },
  forecast: {
    eyebrow: 'FORECAST EXPLORER', title: 'Hybrid Model Comparison',
    metrics: [['VARIABLE', 'PRECIPITATION'], ['RUN', 'SELECT A LOCATION'], ['VALID TIME', 'PENDING'], ['GRID', 'LIVE POINT', 'accent']],
    cards: [['Available forecasts', [['Status', 'DOUBLE-CLICK THE GLOBE'], ['Models', 'LIVE PROVIDER RESPONSE'], ['ML comparison', 'PLANNED LATER']]], ['Blend output', [['Value', 'PENDING'], ['Uncertainty', 'PENDING'], ['Method', 'EQUAL WEIGHT UNTIL ML']]]]
  },
  location: {
    eyebrow: 'LOCATION DRILLDOWN', title: 'Double-click a point on the globe',
    metrics: [['LOCATION', 'NO POINT SELECTED'], ['LIVE DATA', 'WAITING'], ['UNCERTAINTY', 'WAITING'], ['LEAD TIME', 'WAITING']],
    cards: [['Point forecast', [['Status', 'DOUBLE-CLICK THE GLOBE'], ['Provider', 'LIVE OPEN DATA'], ['Variable', 'PRECIPITATION']]], ['Model lineage', [['Status', 'NO MOCK VALUES'], ['Sources', 'LIVE PROVIDER RESPONSE'], ['ML comparison', 'PLANNED LATER']]]]
  },
  layers: {
    eyebrow: 'GEOSPATIAL LAYERS', title: 'Atmospheric Stack Manager',
    metrics: [['ACTIVE LAYERS', '3'], ['OPACITY', '82%'], ['BASEMAP', 'SATELLITE'], ['DOMAIN', 'INDIA', 'accent']],
    cards: [['Layer registry', [['Blended precipitation', 'VISIBLE'], ['Model disagreement', 'VISIBLE'], ['Weight map', 'AVAILABLE'], ['Extreme thresholds', 'HIDDEN']]], ['Map product', [['Resolution', '0.25 DEG'], ['Projection', 'WGS84'], ['Tile status', 'CACHED']]]]
  },
  weights: {
    eyebrow: 'ADAPTIVE FUSION', title: 'Model Contribution Weights',
    metrics: [['MODE', 'EQUAL WEIGHT LIVE'], ['MODEL 1', 'PENDING', 'accent'], ['MODEL 2', 'PENDING'], ['MODEL 3', 'PENDING']],
    cards: [['Weight vector', [['Status', 'SELECT A LOCATION'], ['Source weights', 'LIVE RESPONSE'], ['ML gating', 'PLANNED LATER']]], ['Context features', [['Regime', 'PENDING OBSERVATIONS'], ['Lead time', 'PENDING'], ['Skill window', 'NOT CONNECTED']]]]
  },
  health: {
    eyebrow: 'PIPELINE TELEMETRY', title: 'Data & Model Health',
    metrics: [['SOURCES READY', 'LIVE API'], ['INGESTION', 'REQUEST TIME', 'accent'], ['VALIDATION', 'PENDING'], ['QUEUE', 'NOT CONNECTED']],
    cards: [['Source availability', [['Live models', 'ECMWF / GFS / ICON / GEM'], ['NCUM / NEPS', 'ADAPTER REQUIRED'], ['BharatFS / GraphCast', 'ADAPTER REQUIRED']]], ['Quality checks', [['Schema validation', 'LIVE RESPONSE'], ['Missingness', 'PROVIDER DATA'], ['Last failure', 'NOT AVAILABLE']]]]
  },
  archive: {
    eyebrow: 'RUN ARCHIVE', title: 'Forecast Execution History',
    metrics: [['LATEST RUN', 'LIVE REQUEST'], ['STATUS', 'ON DEMAND', 'accent'], ['DURATION', 'PROVIDER LATENCY'], ['ARTIFACTS', 'NOT STORED']],
    cards: [['Run provenance', [['Pipeline', 'FETCH > NORMALIZE > BLEND'], ['Blend version', 'EQUAL WEIGHT'], ['Data version', 'LIVE PROVIDER']]], ['Archive status', [['Historical replay', 'NOT CONNECTED'], ['Observations', 'NOT CONNECTED'], ['ML artifacts', 'PLANNED LATER']]]]
  },
  verification: {
    eyebrow: 'VERIFICATION LAB', title: 'Multi-Model Skill Evaluation',
    metrics: [['METRIC', 'OBSERVATIONS REQUIRED'], ['ADAPTIVE BLEND', 'PLANNED', 'accent'], ['EQUAL BLEND', 'LIVE CURRENT'], ['VALIDATION', 'NOT CONNECTED']],
    cards: [['Comparative evidence', [['Adaptive blend', 'ML MODEL PLANNED'], ['Skill-weighted', 'OBSERVATIONS REQUIRED'], ['Persistence', 'BASELINE PLANNED']]], ['Coverage', [['Variables', 'LIVE PRECIPITATION'], ['Regions', 'SELECTED POINT'], ['Lead times', 'PROVIDER HORIZON']]]]
  },
  configuration: {
    eyebrow: 'SYSTEM CONFIGURATION', title: 'Fusion Runtime Controls',
    metrics: [['FUSION MODE', 'EQUAL WEIGHT LIVE'], ['GRID', 'SELECTED POINT'], ['CADENCE', 'HOURLY'], ['LIVE MODE', 'ENABLED', 'accent']],
    cards: [['Active variables', [['2m temperature', 'ENABLED'], ['Precipitation', 'ENABLED'], ['10m wind U/V', 'ENABLED'], ['Mean sea-level pressure', 'STAGED']]], ['Threshold policy', [['Heavy rainfall', 'CONFIGURED'], ['Heatwave', 'CONFIGURED'], ['High wind', 'CONFIGURED']]]]
  }
};

let activePageKey = 'command';

function renderPage(pageKey) {
  activePageKey = pageKey;
  const page = pageData[pageKey] || pageData.command;
  document.getElementById('pageEyebrow').textContent = page.eyebrow;
  document.getElementById('pageTitle').textContent = page.title;
  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="metric-grid">${page.metrics.map(([label, value, tone]) => `<div class="metric-card"><div class="metric-label">${label}</div><div class="metric-value ${tone || ''}">${value}</div></div>`).join('')}</div>
    ${page.cards.map(([title, rows]) => `<section class="data-card"><h2>${title}</h2>${rows.map(([label, value]) => `<div class="data-row"><span>${label}</span><strong>${value}</strong></div>`).join('')}</section>`).join('')}
    <div class="panel-note"><span class="material-symbols-outlined">cloud_done</span> LIVE OPEN DATA. Forecast values carry provider and model lineage; verification requires separate observations.</div>`;
}

document.querySelectorAll('.page-nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.page-nav-item').forEach((navItem) => navItem.classList.remove('active'));
    item.classList.add('active');
    renderPage(item.dataset.page);
  });
});

document.getElementById('closePanelBtn').addEventListener('click', () => {
  document.querySelector('.intel-panel').classList.toggle('hidden');
});

renderPage('command');

async function loadFusionSnapshot() {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/v1/snapshot');
    if (!response.ok) return;
    const snapshot = await response.json();
    const verification = snapshot.verification || {};
    const liveVerification = verification.status || 'NOT AVAILABLE';
    pageData.command.metrics = [
      ['LATEST RUN', snapshot.run_id || 'REPLAY'],
      ['VERIFICATION', liveVerification.includes('UNAVAILABLE') ? 'PENDING OBS' : 'AVAILABLE', 'accent'],
      ['ACTIVE SOURCES', `${Object.keys(snapshot.weights || {}).length} / 6`],
      ['DATA MODE', snapshot.mode || 'LIVE OPEN DATA']
    ];
    pageData.weights.metrics = [
      ['MODE', 'SKILL WEIGHTED'],
      ...Object.entries(snapshot.weights || {}).slice(0, 3).map(([model, weight], index) => [model.toUpperCase(), `${(weight * 100).toFixed(1)}%`, index === 0 ? 'accent' : ''])
    ];
    pageData.weights.cards[0][1] = Object.entries(snapshot.weights || {}).map(([model, weight]) => [model.toUpperCase(), weight.toFixed(3)]);
    if (activePageKey === 'command' || activePageKey === 'weights') renderPage(activePageKey);
  } catch (error) {
    console.info('Live API unavailable; waiting for a live connection.', error);
  }
}

loadFusionSnapshot();

console.log('🌐 3D Globe & Location Search Demo Loaded with Full Imagery & Labels.');
}
