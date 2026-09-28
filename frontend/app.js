/**
 * SAMVAYA — Master Application Entry Point (ES Module)
 * Project SIH26081 • Team NIE KAVACH
 * One Earth. Many Models. One Adaptive Forecast.
 */

import { appStore } from './src/state/store.js';
import { Actions } from './src/state/actions.js';
import { GlobeController } from './src/globe/globe-controller.js';
import { AtmosphericParticleEngine } from './src/weather/particle-engine.js';
import { HeaderController } from './src/ui/header-controller.js';
import { SearchController } from './src/ui/search-controller.js';
import { TimelineController } from './src/ui/timeline-controller.js';
import { DevInspectorController } from './src/ui/dev-inspector.js';
import { checkBackendHealth } from './src/services/api.js';

class SamvayaApplication {
  constructor() {
    this.init();
  }

  async init() {
    console.log('Initializing SAMVAYA Atmospheric Platform...');

    // 1. Initialize Atmospheric Particle Engine
    this.particleEngine = new AtmosphericParticleEngine('atmosphericOverlayCanvas');

    // 2. Initialize 3D Globe Controller
    this.globe = new GlobeController('cesiumContainer');

    // 3. Initialize UI Components
    this.header = new HeaderController();
    this.search = new SearchController();
    this.timeline = new TimelineController();
    this.devInspector = new DevInspectorController();

    // 4. Bind Secondary UI Controls
    this.bindLayerSelector();
    this.bindFloatingControls();
    this.bindTelemetryHUD();

    // 5. Connect Atmospheric Particle Engine to State
    appStore.select(state => state.atmospheric, (atmo) => {
      if (!atmo || !atmo.visualProfile) return;
      this.particleEngine.setProfile(atmo.visualProfile, atmo.weatherState);
    });

    // 6. Check Backend Health & Fetch Initial Location Data
    this.checkHealth();
    Actions.setLocation(appStore.getState().location);
  }

  async checkHealth() {
    const health = await checkBackendHealth();
    if (health.status === 'ok') {
      console.log('Backend connected:', health);
    } else {
      console.warn('Backend operating in degraded/offline mode:', health.error);
    }
  }

  bindLayerSelector() {
    const paramPills = document.querySelectorAll('.atmospheric-param-dock .param-pill');
    paramPills.forEach(pill => {
      pill.addEventListener('click', () => {
        paramPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const param = pill.getAttribute('data-param');
        Actions.setActiveLayerParam(param);
      });
    });
  }

  bindFloatingControls() {
    const homeBtn = document.getElementById('homeBtn');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const layerToggleBtn = document.getElementById('layerToggleBtn');
    const layerMenu = document.getElementById('layerMenu');

    if (homeBtn) {
      homeBtn.addEventListener('click', () => this.globe.flyHome());
    }

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => this.globe.zoomIn());
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => this.globe.zoomOut());
    }

    if (layerToggleBtn && layerMenu) {
      layerToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        layerMenu.style.display = layerMenu.style.display === 'none' ? 'flex' : 'none';
      });

      document.addEventListener('click', (e) => {
        if (!layerMenu.contains(e.target) && e.target !== layerToggleBtn) {
          layerMenu.style.display = 'none';
        }
      });
    }

    // Basemap & Shader Toggles
    document.querySelectorAll('.layer-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const basemap = btn.getAttribute('data-type');
        const shader = btn.getAttribute('data-shader');

        if (basemap) {
          document.querySelectorAll('[data-type]').forEach(el => el.classList.remove('active'));
          btn.classList.add('active');
          Actions.setBasemap(basemap);
        } else if (shader) {
          document.querySelectorAll('[data-shader]').forEach(el => el.classList.remove('active'));
          btn.classList.add('active');
          Actions.setShaderMode(shader);
        }
        if (layerMenu) layerMenu.style.display = 'none';
      });
    });
  }

  bindTelemetryHUD() {
    const coordsDisplay = document.getElementById('coordsDisplay');
    const altDisplay = document.getElementById('altDisplay');

    appStore.select(state => state.location, (loc) => {
      if (coordsDisplay && loc) {
        coordsDisplay.textContent = `${loc.latitude.toFixed(4)}° N, ${loc.longitude.toFixed(4)}° E`;
      }
    });

    appStore.select(state => state.globe.cameraAltitude, (alt) => {
      if (altDisplay && alt !== undefined) {
        if (alt > 1000) {
          altDisplay.textContent = `${(alt / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} km`;
        } else {
          altDisplay.textContent = `${alt} m`;
        }
      }
    });
  }
}

// Bootstrap Application on DOM Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SamvayaApplication());
} else {
  new SamvayaApplication();
}
