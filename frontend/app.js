/**
 * SAMVAYA — Master Application Entry Point (ES Module)
 * Project SIH26081 • Team NIE KAVACH
 * One Earth. Many Models. One Adaptive Forecast.
 */

import { appStore } from './src/state/store.js';
import { Actions } from './src/state/actions.js';
import { GlobeController } from './src/globe/globe-controller.js';
import { HeaderController } from './src/ui/header-controller.js';
import { SearchController } from './src/ui/search-controller.js';
import { UnifiedViewController } from './src/ui/unified-view-controller.js';
import { checkBackendHealth } from './src/services/api.js';

class SamvayaApplication {
  constructor() {
    this.init();
  }

  async init() {
    console.log('Initializing SAMVAYA Atmospheric Platform...');

    // 1. Initialize 3D Globe Controller (Cesium)
    this.globe = new GlobeController('cesiumContainer');

    // 2. Initialize UI Controllers
    this.header = new HeaderController();
    this.search = new SearchController(this.globe);
    this.unifiedView = new UnifiedViewController(this.globe);

    // 3. Handle Hash Routing
    this.initRouting();

    // 4. Check Backend Health & Fetch Initial Location Data
    this.checkHealth();
    Actions.setLocation(appStore.getState().location);
  }

  initRouting() {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (['explore', 'forecast', 'intelligence', 'history'].includes(hash)) {
        Actions.setNavigation(hash);
      }
    };

    window.addEventListener('hashchange', handleHash);
    if (window.location.hash) {
      handleHash();
    }
  }

  async checkHealth() {
    const health = await checkBackendHealth();
    const statusText = document.getElementById('headerEngineStatus');
    if (health.status === 'ok') {
      console.log('Backend connected:', health);
      if (statusText) statusText.textContent = 'ENGINE READY';
    } else {
      console.warn('Backend operating in offline fallback mode:', health.error);
      if (statusText) statusText.textContent = 'OFFLINE CACHE';
    }
  }
}

// Bootstrap on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  window.samvayaApp = new SamvayaApplication();
});
