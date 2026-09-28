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
  shadows: true,
  skyAtmosphere: new Cesium.SkyAtmosphere(),
  terrainProvider: new Cesium.EllipsoidTerrainProvider()
});

// Configure Globe Atmosphere & Visuals
viewer.scene.globe.enableLighting = false; // Keep globe illuminated and clear
viewer.scene.globe.depthTestAgainstTerrain = false;
viewer.scene.globe.atmosphereHueShift = 0.0;
viewer.scene.globe.atmosphereSaturationShift = 0.1;
viewer.scene.globe.atmosphereBrightnessShift = 0.1;
viewer.scene.screenSpaceCameraController.minimumZoomDistance = 150; // 150m
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 45000000; // 45,000km

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
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// Camera change listener for altitude readout
viewer.camera.changed.addEventListener(() => {
  const heightMeters = viewer.camera.positionCartographic.height;
  if (heightMeters > 1000) {
    altDisplay.textContent = `${(heightMeters / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
  } else {
    altDisplay.textContent = `${Math.round(heightMeters)} m`;
  }
});

console.log('🌐 3D Globe & Location Search Demo Loaded with Full Imagery & Labels.');
