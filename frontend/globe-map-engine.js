/**
 * SAMVAYA Unified 3D Cesium Globe & 2D Map Engine
 * Team NIE KAVACH • SIH 2026
 * 
 * High-performance, robust atmospheric visualization engine.
 * Seamlessly manages photorealistic 3D Cesium Earth and 2D Leaflet map.
 */

class GlobeMapEngine {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    
    this.options = Object.assign({
      initialLat: 20.5937,
      initialLon: 78.9629,
      initialAltitude: 5200000,
      initialZoom: 5,
      initialMode: '3d', // '3d' | '2d'
      initialLocationName: 'INDIA • ATMOSPHERIC DOMAIN',
      onLocationChange: null,
      onModeChange: null
    }, options);

    this.currentMode = GlobeMapEngine.isWebGLSupported() ? this.options.initialMode : '2d';
    this.currentLat = this.options.initialLat;
    this.currentLon = this.options.initialLon;
    this.currentAltitude = this.options.initialAltitude;
    this.currentLocationName = this.options.initialLocationName;
    this.activeLayer = 'precipitation';
    this.isSpinning = false;
    this.spinRemoveListener = null;

    this.cesiumViewer = null;
    this.leafletMap = null;
    this.cesiumPin = null;
    this.leafletPin = null;

    this.setupViewports();
    
    // Defer engine init to ensure container dimensions are ready
    setTimeout(() => {
      if (this.currentMode === '3d') {
        this.initCesium();
      } else {
        this.initLeaflet();
      }
    }, 60);
  }

  static isWebGLSupported() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!(window.WebGLRenderingContext && gl);
    } catch (e) {
      return false;
    }
  }

  setupViewports() {
    if (!this.container) return;
    
    // Ensure container has absolute/relative positioning and dark background
    this.container.classList.add('relative', 'w-full', 'h-full', 'overflow-hidden', 'bg-[#040609]', 'select-none');

    // Create 3D Cesium viewport element if not exists
    let cesiumEl = document.getElementById(`${this.containerId}-cesium`);
    if (!cesiumEl) {
      cesiumEl = document.createElement('div');
      cesiumEl.id = `${this.containerId}-cesium`;
      cesiumEl.className = 'absolute inset-0 w-full h-full';
      cesiumEl.style.display = this.currentMode === '3d' ? 'block' : 'none';
      cesiumEl.style.zIndex = '1';
      this.container.appendChild(cesiumEl);
    }

    // Create 2D Leaflet viewport element if not exists
    let leafletEl = document.getElementById(`${this.containerId}-leaflet`);
    if (!leafletEl) {
      leafletEl = document.createElement('div');
      leafletEl.id = `${this.containerId}-leaflet`;
      leafletEl.className = 'absolute inset-0 w-full h-full';
      leafletEl.style.display = this.currentMode === '2d' ? 'block' : 'none';
      leafletEl.style.zIndex = '1';
      this.container.appendChild(leafletEl);
    }

    // Ensure mode switcher pill exists
    let modeToggle = document.getElementById(`${this.containerId}-mode-pill`);
    if (!modeToggle) {
      modeToggle = document.createElement('div');
      modeToggle.id = `${this.containerId}-mode-pill`;
      modeToggle.className = 'absolute top-4 left-4 z-40 flex items-center bg-[#0B111B]/95 backdrop-blur-2xl border border-[#C25E1A]/40 p-1 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto';
      modeToggle.innerHTML = `
        <button id="${this.containerId}-toggle-3d" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${this.currentMode === '3d' ? 'bg-[#C25E1A] text-white shadow-md' : 'text-slate-300 hover:text-white'}">
          <span>🌐</span><span>3D GLOBE</span>
        </button>
        <button id="${this.containerId}-toggle-2d" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${this.currentMode === '2d' ? 'bg-[#C25E1A] text-white shadow-md' : 'text-slate-300 hover:text-white'}">
          <span>🗺️</span><span>2D MAP</span>
        </button>
      `;
      this.container.appendChild(modeToggle);

      document.getElementById(`${this.containerId}-toggle-3d`).addEventListener('click', (e) => {
        e.stopPropagation();
        this.switchMode('3d');
      });
      document.getElementById(`${this.containerId}-toggle-2d`).addEventListener('click', (e) => {
        e.stopPropagation();
        this.switchMode('2d');
      });
    }
  }

  initCesium() {
    if (this.cesiumViewer || typeof Cesium === 'undefined') return;
    const cesiumEl = document.getElementById(`${this.containerId}-cesium`);
    if (!cesiumEl) return;

    try {
      this.cesiumViewer = new Cesium.Viewer(cesiumEl, {
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
        skyAtmosphere: new Cesium.SkyAtmosphere(),
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        imageryProvider: false,
        requestRenderMode: false // 60 FPS smooth rendering
      });

      this.cesiumViewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.5);
      this.cesiumViewer.scene.globe.enableLighting = false;
      this.cesiumViewer.scene.globe.atmosphereHueShift = 0.02;
      this.cesiumViewer.scene.globe.atmosphereSaturationShift = 0.1;
      this.cesiumViewer.scene.globe.atmosphereBrightnessShift = 0.12;
      this.cesiumViewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#040609');

      // Base Imagery: Photorealistic High-Res Satellite
      this.cesiumViewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 18,
          tileWidth: 256,
          tileHeight: 256,
          credit: '© Esri, Maxar, Earthstar Geographics'
        })
      );

      // Boundaries & Place Labels
      this.cesiumViewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 18,
          tileWidth: 256,
          tileHeight: 256
        })
      );

      // Transportation & Highways
      this.cesiumViewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 18,
          tileWidth: 256,
          tileHeight: 256,
          alpha: 0.65
        })
      );

      // Add Glowing Station Marker
      this.addCesiumMarker(this.currentLon, this.currentLat, this.currentLocationName);

      // Position Camera Directly Over Target (India)
      this.cesiumViewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(this.currentLon, this.currentLat, this.currentAltitude),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-75),
          roll: 0.0
        }
      });

      // Handle window resize
      window.addEventListener('resize', () => {
        if (this.cesiumViewer && !this.cesiumViewer.isDestroyed()) {
          this.cesiumViewer.resize();
        }
      });

    } catch (err) {
      console.warn('Cesium initialization failed, falling back to 2D Leaflet:', err);
      this.switchMode('2d');
    }
  }

  initLeaflet() {
    if (this.leafletMap || typeof L === 'undefined') return;
    const leafletEl = document.getElementById(`${this.containerId}-leaflet`);
    if (!leafletEl) return;

    try {
      this.leafletMap = L.map(leafletEl, {
        center: [this.currentLat, this.currentLon],
        zoom: this.options.initialZoom,
        zoomControl: false,
        attributionControl: false
      });

      // Satellite Layer
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      }).addTo(this.leafletMap);

      // Boundaries & Labels
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 0.9
      }).addTo(this.leafletMap);

      this.addLeafletMarker(this.currentLat, this.currentLon, this.currentLocationName);

      setTimeout(() => {
        if (this.leafletMap) this.leafletMap.invalidateSize();
      }, 200);

    } catch (err) {
      console.warn('Leaflet initialization failed:', err);
    }
  }

  switchMode(mode) {
    if (this.currentMode === mode) return;
    this.currentMode = mode;

    const cesiumEl = document.getElementById(`${this.containerId}-cesium`);
    const leafletEl = document.getElementById(`${this.containerId}-leaflet`);
    const toggle3d = document.getElementById(`${this.containerId}-toggle-3d`);
    const toggle2d = document.getElementById(`${this.containerId}-toggle-2d`);

    if (mode === '3d') {
      if (leafletEl) leafletEl.style.display = 'none';
      if (cesiumEl) cesiumEl.style.display = 'block';

      if (toggle3d) toggle3d.className = 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all bg-[#C25E1A] text-white shadow-md';
      if (toggle2d) toggle2d.className = 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all text-slate-300 hover:text-white';

      if (!this.cesiumViewer) {
        this.initCesium();
      } else {
        this.cesiumViewer.resize();
        this.flyTo(this.currentLat, this.currentLon, this.currentLocationName, this.currentAltitude);
      }
    } else {
      if (cesiumEl) cesiumEl.style.display = 'none';
      if (leafletEl) leafletEl.style.display = 'block';

      if (toggle2d) toggle2d.className = 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all bg-[#C25E1A] text-white shadow-md';
      if (toggle3d) toggle3d.className = 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all text-slate-300 hover:text-white';

      if (!this.leafletMap) {
        this.initLeaflet();
      } else {
        this.leafletMap.invalidateSize();
        this.leafletMap.setView([this.currentLat, this.currentLon], 8);
      }
    }

    if (typeof this.options.onModeChange === 'function') {
      this.options.onModeChange(mode);
    }
  }

  addCesiumMarker(lon, lat, name) {
    if (!this.cesiumViewer) return;
    if (this.cesiumPin) {
      this.cesiumViewer.entities.remove(this.cesiumPin);
      this.cesiumPin = null;
    }

    this.cesiumPin = this.cesiumViewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat, 200),
      point: {
        pixelSize: 14,
        color: Cesium.Color.fromCssColorString('#C25E1A'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      label: {
        text: `${name.toUpperCase()}\nAWS GROUND TRUTH`,
        font: 'bold 12px Inter, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString('#0B111B'),
        outlineWidth: 4,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -18),
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    });
  }

  addLeafletMarker(lat, lon, name) {
    if (!this.leafletMap || typeof L === 'undefined') return;
    if (this.leafletPin) {
      this.leafletMap.removeLayer(this.leafletPin);
      this.leafletPin = null;
    }

    const icon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="relative flex items-center justify-center pointer-events-none">
          <div class="w-6 h-6 rounded-full bg-[#C25E1A]/40 border border-[#C25E1A] animate-ping absolute"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-[#C25E1A] border-2 border-white shadow-xl relative"></div>
          <div class="absolute top-6 bg-[#0B111B]/95 text-white font-mono px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap border border-[#C25E1A]/40 shadow-xl">
            ${name}
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    this.leafletPin = L.marker([lat, lon], { icon }).addTo(this.leafletMap);
  }

  /**
   * Fly to target location - accepts (lat, lon) or (lon, lat) intelligently
   */
  flyTo(arg1, arg2, name = 'Target Location', altitude = 1500000) {
    let lat, lon;
    // Disambiguate lat and lon (India latitudes are ~8-37, longitudes are ~68-98)
    if (Math.abs(arg1) <= 40 && Math.abs(arg2) > 40) {
      lat = arg1;
      lon = arg2;
    } else if (Math.abs(arg2) <= 40 && Math.abs(arg1) > 40) {
      lat = arg2;
      lon = arg1;
    } else {
      lat = arg1;
      lon = arg2;
    }

    this.currentLat = lat;
    this.currentLon = lon;
    this.currentLocationName = name;
    this.currentAltitude = altitude;

    if (this.currentMode === '3d' && this.cesiumViewer) {
      this.addCesiumMarker(lon, lat, name);
      this.cesiumViewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, altitude),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-72),
          roll: 0.0
        },
        duration: 1.8
      });
    } else if (this.leafletMap) {
      this.addLeafletMarker(lat, lon, name);
      this.leafletMap.flyTo([lat, lon], 9, { duration: 1.5 });
    }
  }

  zoomIn() {
    if (this.currentMode === '3d' && this.cesiumViewer) {
      const h = this.cesiumViewer.camera.positionCartographic.height;
      this.cesiumViewer.camera.zoomIn(h * 0.35);
    } else if (this.leafletMap) {
      this.leafletMap.zoomIn();
    }
  }

  zoomOut() {
    if (this.currentMode === '3d' && this.cesiumViewer) {
      const h = this.cesiumViewer.camera.positionCartographic.height;
      this.cesiumViewer.camera.zoomOut(h * 0.45);
    } else if (this.leafletMap) {
      this.leafletMap.zoomOut();
    }
  }

  toggleSpin() {
    if (this.currentMode !== '3d' || !this.cesiumViewer) return;
    this.isSpinning = !this.isSpinning;
    if (this.isSpinning) {
      const rotateSpeed = 0.0015;
      this.spinRemoveListener = this.cesiumViewer.clock.onTick.addEventListener(() => {
        this.cesiumViewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, rotateSpeed);
      });
    } else if (this.spinRemoveListener) {
      this.spinRemoveListener();
      this.spinRemoveListener = null;
    }
  }

  setLayer(layerKey) {
    this.activeLayer = layerKey;
    // Visual feedback for layer switches
    console.log(`[GlobeEngine] Switched active layer to ${layerKey}`);
  }
}

window.GlobeMapEngine = GlobeMapEngine;
