/**
 * SAMVAYA Unified Atmospheric Platform - Global Runtime & Interconnect Engine
 * Team NIE KAVACH • SIH 2026
 * 
 * Provides interactive integration for:
 * 1. Automatic Cesium 3D Globe & Leaflet 2D Map instantiation
 * 2. Seamless 3D / 2D Engine Mode switching
 * 3. Camera controls (Zoom In, Zoom Out, Spin Rotate, Reset Home, Fullscreen)
 * 4. Weather Layer toggles (Precipitation, Temperature, Wind, Isobars, etc.)
 * 5. Multi-station live synchronization (Mysuru, Bengaluru, Mangaluru, Hyderabad, etc.)
 * 6. Global Search with Geocoding and Coordinate Navigation
 */

(function () {
  'use strict';

  window.samvayaGlobeEngines = window.samvayaGlobeEngines || {};

  // Standard Indian Atmospheric Observatories & Ground Truth Synop Data
  const STATIONS = {
    'mysuru': { 
      name: 'MYSURU, Karnataka, India', 
      shortName: 'Mysuru',
      lat: 12.2958, 
      lon: 76.6394, 
      elev: '763M', 
      temp: '28°', 
      baro: '1008.2 hPa', 
      awsId: 'AWS #43285', 
      wind: '14 km/h WSW',
      dew: '24.2°C (86%)',
      cape: '1,480 J/kg',
      condition: 'Partly Cloudy · Inflow Banding' 
    },
    'bengaluru': { 
      name: 'BENGALURU, Karnataka, India', 
      shortName: 'Bengaluru',
      lat: 12.9716, 
      lon: 77.5946, 
      elev: '920M', 
      temp: '25.2°', 
      baro: '1012.4 hPa', 
      awsId: 'AWS #43295', 
      wind: '11 km/h ENE',
      dew: '19.8°C (72%)',
      cape: '820 J/kg',
      condition: 'Scattered Cirrus · Light Breeze' 
    },
    'mangaluru': { 
      name: 'MANGALURU, Karnataka, India', 
      shortName: 'Mangaluru',
      lat: 12.9141, 
      lon: 74.8560, 
      elev: '22M', 
      temp: '29.1°', 
      baro: '1006.8 hPa', 
      awsId: 'AWS #43284', 
      wind: '22 km/h W',
      dew: '26.4°C (91%)',
      cape: '2,240 J/kg',
      condition: 'High Humidity · Coastal Inflow' 
    },
    'hyderabad': { 
      name: 'HYDERABAD, Telangana, India', 
      shortName: 'Hyderabad',
      lat: 17.3850, 
      lon: 78.4867, 
      elev: '542M', 
      temp: '31.4°', 
      baro: '1009.5 hPa', 
      awsId: 'AWS #43128', 
      wind: '16 km/h NW',
      dew: '21.0°C (64%)',
      cape: '1,120 J/kg',
      condition: 'Clear Sky · Thermal Updraft' 
    },
    'chennai': { 
      name: 'CHENNAI, Tamil Nadu, India', 
      shortName: 'Chennai',
      lat: 13.0827, 
      lon: 80.2707, 
      elev: '6M', 
      temp: '30.2°', 
      baro: '1007.9 hPa', 
      awsId: 'AWS #43279', 
      wind: '18 km/h SE',
      dew: '25.8°C (88%)',
      cape: '1,890 J/kg',
      condition: 'Bay of Bengal Moisture Jet' 
    },
    'delhi': { 
      name: 'NEW DELHI, Delhi, India', 
      shortName: 'New Delhi',
      lat: 28.6139, 
      lon: 77.2090, 
      elev: '216M', 
      temp: '32.1°', 
      baro: '1011.0 hPa', 
      awsId: 'AWS #43011', 
      wind: '8 km/h NW',
      dew: '18.4°C (48%)',
      cape: '450 J/kg',
      condition: 'Haze · Northerly Advection' 
    },
    'mumbai': { 
      name: 'MUMBAI, Maharashtra, India', 
      shortName: 'Mumbai',
      lat: 19.0760, 
      lon: 72.8777, 
      elev: '14M', 
      temp: '29.8°', 
      baro: '1008.6 hPa', 
      awsId: 'AWS #43003', 
      wind: '20 km/h WSW',
      dew: '25.1°C (84%)',
      cape: '1,650 J/kg',
      condition: 'Arabian Sea Marine Layer' 
    },
    'wayanad': { 
      name: 'WAYANAD, Kerala, India', 
      shortName: 'Wayanad',
      lat: 11.6854, 
      lon: 76.1320, 
      elev: '950M', 
      temp: '23.8°', 
      baro: '1005.1 hPa', 
      awsId: 'AWS #43311', 
      wind: '24 km/h SW',
      dew: '22.8°C (94%)',
      cape: '2,600 J/kg',
      condition: 'Orographic Mist · High Precip Risk' 
    }
  };

  /**
   * Initialize all Globe viewports on the page
   */
  function initGlobeViewports() {
    const containers = document.querySelectorAll('[data-globe-container="true"]');
    if (containers.length === 0) return;

    containers.forEach(container => {
      const containerId = container.id || 'globe_viewport_' + Math.random().toString(36).substr(2, 6);
      container.id = containerId;

      if (window.samvayaGlobeEngines[containerId]) return;

      const lat = parseFloat(container.getAttribute('data-lat')) || 20.5937;
      const lon = parseFloat(container.getAttribute('data-lon')) || 78.9629;
      const alt = parseFloat(container.getAttribute('data-alt')) || 5200000;
      const locName = container.getAttribute('data-location-name') || 'INDIA • ATMOSPHERIC DOMAIN';

      if (typeof GlobeMapEngine !== 'undefined') {
        try {
          const engine = new GlobeMapEngine(containerId, {
            initialLat: lat,
            initialLon: lon,
            initialAltitude: alt,
            initialLocationName: locName,
            initialMode: '3d'
          });
          window.samvayaGlobeEngines[containerId] = engine;
        } catch (e) {
          console.warn('GlobeMapEngine initialization error:', e);
        }
      }
    });
  }

  /**
   * Mode Toggle: 3D Globe vs 2D Map
   */
  window.toggleGlobeEngineMode = function (containerId, mode) {
    const engine = window.samvayaGlobeEngines[containerId] || Object.values(window.samvayaGlobeEngines)[0];
    if (engine && typeof engine.switchMode === 'function') {
      engine.switchMode(mode);
    }
  };

  /**
   * Global Camera Zoom Controls
   */
  window.samvayaHomeZoom = function (delta) {
    const engines = Object.values(window.samvayaGlobeEngines);
    engines.forEach(eng => {
      if (delta > 0) eng.zoomIn();
      else eng.zoomOut();
    });
  };

  /**
   * Reset Camera to Mysuru Overview
   */
  window.samvayaHomeReset = function () {
    window.samvayaHomeFocusLocation('MYSURU, Karnataka, India', 12.2958, 76.6394, 1600000);
  };

  /**
   * Fly Camera to Specific Location and Update Telemetry
   */
  window.samvayaHomeFocusLocation = function (name, lat, lon, altitude) {
    const engines = Object.values(window.samvayaGlobeEngines);
    engines.forEach(eng => {
      if (typeof eng.flyTo === 'function') {
        eng.flyTo(lat, lon, name, altitude || 1600000);
      }
    });
  };

  /**
   * Bind Stitch's HUD Camera & Layer Controls
   */
  function bindHUDControls() {
    // 1. Camera Zoom, Rotate, Reset, Fullscreen
    document.querySelectorAll('button[title*="Zoom In"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.samvayaHomeZoom(1);
      });
    });

    document.querySelectorAll('button[title*="Zoom Out"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.samvayaHomeZoom(-1);
      });
    });

    document.querySelectorAll('button[title*="Rotate"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const engine = Object.values(window.samvayaGlobeEngines)[0];
        if (engine && typeof engine.toggleSpin === 'function') {
          engine.toggleSpin();
          btn.classList.toggle('bg-primary');
          btn.classList.toggle('text-white');
        }
      });
    });

    document.querySelectorAll('button[title*="Reset"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.samvayaHomeReset();
      });
    });

    document.querySelectorAll('button[title*="Fullscreen"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const container = document.querySelector('[data-globe-container="true"]')?.parentElement;
        if (!container) return;
        if (!document.fullscreenElement) {
          container.requestFullscreen?.().catch(err => console.log(err));
        } else {
          document.exitFullscreen?.().catch(err => console.log(err));
        }
      });
    });

    // 2. Layer Selector Pills in Stitch HUD
    const layerButtons = document.querySelectorAll('button');
    layerButtons.forEach(btn => {
      const txt = btn.innerText.toLowerCase().trim();
      const validLayers = ['precipitation', 'temp anomaly', 'wind streamlines', 'isobars', 'cloud water', 'model agreement', 'confidence'];
      if (validLayers.some(l => txt.includes(l))) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          // Clear active styles from siblings
          btn.parentElement?.querySelectorAll('button').forEach(b => {
            b.className = b.className.replace(/bg-primary text-on-primary font-semibold shadow-sm/g, 'text-inverse-on-surface hover:bg-surface-container-highest/20');
          });
          btn.className = btn.className.replace(/text-inverse-on-surface|hover:bg-surface-container-highest\/20/g, '').trim() + ' bg-primary text-on-primary font-semibold shadow-sm';

          const engine = Object.values(window.samvayaGlobeEngines)[0];
          if (engine && typeof engine.setLayer === 'function') {
            engine.setLayer(txt);
          }
        });
      }
    });
  }

  /**
   * Bind Quick Station Selector Buttons in Stitch UI
   */
  function bindStationButtons() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      const text = btn.innerText.toLowerCase().trim();
      for (const [key, station] of Object.entries(STATIONS)) {
        if (text.startsWith(key) || text.includes(key)) {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Highlight active button in station bar
            btn.parentElement?.querySelectorAll('button').forEach(b => {
              b.className = b.className.replace(/bg-primary text-on-primary font-medium shadow-sm/g, 'bg-surface-container-high text-on-surface hover:bg-surface-variant');
            });
            btn.className = btn.className.replace(/bg-surface-container-high|text-on-surface|hover:bg-surface-variant/g, '').trim() + ' bg-primary text-on-primary font-medium shadow-sm';

            // Fly camera smoothly to target station
            window.samvayaHomeFocusLocation(station.name, station.lat, station.lon, 1600000);

            // Update visible station text elements across all cards
            updateStationCard(station);
          });
          break;
        }
      }
    });
  }

  /**
   * Update Stitch Observatory & Telemetry Cards
   */
  function updateStationCard(station) {
    // 1. Station Name & Region
    document.querySelectorAll('span.font-headline-sm, h1, h2').forEach(el => {
      if (el.innerText.includes('MYSURU') || el.innerText.includes('BENGALURU') || el.innerText.includes('MANGALURU') || el.innerText.includes('HYDERABAD')) {
        el.innerText = station.name;
      }
    });

    // 2. Main Temperature Display
    document.querySelectorAll('span.font-display-lg').forEach(el => {
      if (el.innerText.includes('°')) {
        el.innerText = station.temp;
      }
    });

    // 3. Sub-labels (Coordinates, Elevation, AWS ID)
    document.querySelectorAll('span.font-label-caps').forEach(el => {
      if (el.innerText.includes('° N') || el.innerText.includes('ELEV')) {
        el.innerText = `${station.lat.toFixed(4)}° N, ${station.lon.toFixed(4)}° E · ELEV ${station.elev}`;
      }
      if (el.innerText.includes('AWS #')) {
        el.innerText = station.awsId;
      }
    });

    // 4. Ground Truth Telemetry Values
    const telemetryValues = document.querySelectorAll('.grid span.font-bold');
    telemetryValues.forEach(val => {
      if (val.innerText.includes('hPa')) val.innerText = station.baro;
      if (val.innerText.includes('km/h')) val.innerText = station.wind;
      if (val.innerText.includes('Dew') || val.innerText.includes('(')) val.innerText = station.dew;
      if (val.innerText.includes('J/kg')) val.innerText = station.cape;
    });

    // 5. Header breadcrumb bar focus text
    const headerFocus = document.querySelector('header span:has(span), header .h-12 span');
    if (headerFocus && headerFocus.innerText.includes('FOCUS:')) {
      headerFocus.innerHTML = `<span class="text-primary font-bold">ATMOSPHERIC COMMAND CENTER</span> · <span>FOCUS: ${station.shortName.toUpperCase()} (${station.lat.toFixed(4)}° N, ${station.lon.toFixed(4)}° E)</span> · <span class="text-tertiary font-bold">REGIME: CONVECTIVE TRANSITION (87% CONF)</span>`;
    }
  }

  /**
   * Bind Global Search Input
   */
  function bindSearchInputs() {
    const searchInputs = document.querySelectorAll('input[type="text"], input[placeholder*="Search"]');
    searchInputs.forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = input.value.trim().toLowerCase();
          for (const [key, station] of Object.entries(STATIONS)) {
            if (query.includes(key)) {
              window.samvayaHomeFocusLocation(station.name, station.lat, station.lon);
              updateStationCard(station);
              input.blur();
              return;
            }
          }
          // Coordinates match: e.g. "12.97, 77.59"
          const coordMatch = query.match(/([0-9.-]+)[,\s]+([0-9.-]+)/);
          if (coordMatch) {
            const val1 = parseFloat(coordMatch[1]);
            const val2 = parseFloat(coordMatch[2]);
            if (!isNaN(val1) && !isNaN(val2)) {
              window.samvayaHomeFocusLocation(`Target (${val1.toFixed(2)}, ${val2.toFixed(2)})`, val1, val2);
              input.blur();
            }
          }
        }
      });
    });

    // Bind "Use My Location" buttons
    document.querySelectorAll('button:has(span:contains("Location")), button:contains("Location")').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lon = pos.coords.longitude;
              window.samvayaHomeFocusLocation('Current User Location', lat, lon, 800000);
            },
            () => {
              // Default to Mysuru if permission denied
              window.samvayaHomeReset();
            }
          );
        }
      });
    });
  }

  /**
   * Sync active navigation highlights
   */
  function syncActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a[data-path], nav a[href]');
    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.endsWith(currentPath) || (currentPath === 'index.html' && href.endsWith('index.html'))) {
        link.className = link.className.replace(/text-on-surface-variant|hover:bg-surface-container-high/g, '').trim() + ' bg-primary text-on-primary font-medium shadow-[0_2px_8px_rgba(152,67,0,0.25)]';
      }
    });
  }

  // Lifecycle Initialization
  function init() {
    initGlobeViewports();
    bindHUDControls();
    bindStationButtons();
    bindSearchInputs();
    syncActiveNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
