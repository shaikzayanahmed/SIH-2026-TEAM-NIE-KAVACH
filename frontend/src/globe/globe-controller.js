/**
 * SAMVAYA Cesium 3D Globe Controller
 * Centralized, reactive wrapper for the CesiumJS Atmospheric Globe.
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

import { appStore } from '../state/store.js';
import { Actions } from '../state/actions.js';
import { reverseGeocodeApi } from '../services/api.js';

export class GlobeController {
  constructor(containerId = 'cesiumContainer') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.viewer = new Cesium.Viewer(containerId, {
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
      requestRenderMode: true,
      maximumRenderTimeChange: Number.POSITIVE_INFINITY
    });

    this.initVisuals();
    this.initLayers();
    this.initShaders();
    this.initInteractions();
    this.initSubscriptions();
  }

  initVisuals() {
    const v = this.viewer;
    const pixelRatioLimit = Math.min(window.devicePixelRatio || 1, 1.5);
    v.resolutionScale = pixelRatioLimit;
    v.scene.globe.tileCacheSize = 180;
    v.scene.globe.preloadSiblings = true;
    v.scene.globe.maximumScreenSpaceError = 2.0;
    v.scene.globe.depthTestAgainstTerrain = false;
    v.scene.fog.enabled = false;
    v.scene.backgroundColor = Cesium.Color.fromCssColorString('#0C0E12');

    // Warm Atmospheric Shifts
    v.scene.globe.enableLighting = false;
    v.scene.globe.atmosphereHueShift = 0.05;
    v.scene.globe.atmosphereSaturationShift = 0.12;
    v.scene.globe.atmosphereBrightnessShift = 0.15;

    // Camera inertia
    v.scene.screenSpaceCameraController.minimumZoomDistance = 150;
    v.scene.screenSpaceCameraController.maximumZoomDistance = 45000000;
    v.scene.screenSpaceCameraController.enableCollisionDetection = false;
    v.scene.screenSpaceCameraController.inertiaSpin = 0.4;
    v.scene.screenSpaceCameraController.inertiaTranslation = 0.4;
    v.scene.camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;

    window.addEventListener('resize', () => {
      v.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.5);
    });
  }

  initLayers() {
    this.mapConfigs = {
      'hybrid-satellite': {
        name: 'Photorealistic Satellite + Labels',
        base: new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 18,
          tileWidth: 256,
          tileHeight: 256,
          credit: '© Esri, Maxar, Earthstar Geographics'
        }),
        labels: new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 18,
          tileWidth: 256,
          tileHeight: 256
        }),
        roads: new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 18,
          tileWidth: 256,
          tileHeight: 256
        })
      },
      'osm': {
        name: 'OpenStreetMap Standard',
        base: new Cesium.UrlTemplateImageryProvider({
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          maximumLevel: 18,
          tileWidth: 256,
          tileHeight: 256,
          credit: '© OpenStreetMap contributors'
        }),
        labels: null,
        roads: null
      },
      'carto-dark': {
        name: 'CartoDB Dark Matter',
        base: new Cesium.UrlTemplateImageryProvider({
          url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          maximumLevel: 18,
          tileWidth: 256,
          tileHeight: 256,
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
          tileWidth: 256,
          tileHeight: 256,
          credit: '© OpenTopoMap, © OpenStreetMap'
        }),
        labels: null,
        roads: null
      }
    };

    this.radarLayer = null;
    this.activePinEntity = null;
    this.applyMapStyle(appStore.getState().globe.basemap);
    this.initRadar();
  }

  async initRadar() {
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!res.ok) return;
      const data = await res.json();
      const frames = data.radar?.past || [];
      if (!frames.length) return;
      const latest = frames[frames.length - 1];

      const radarProvider = new Cesium.UrlTemplateImageryProvider({
        url: `https://tilecache.rainviewer.com${latest.path}/256/{z}/{x}/{y}/2/1_1.png`,
        maximumLevel: 10,
        credit: '© RainViewer Radar Telemetry'
      });

      this.radarLayer = this.viewer.imageryLayers.addImageryProvider(radarProvider);
      this.radarLayer.alpha = 0.75;
      this.viewer.scene.requestRender();
    } catch (err) {
      console.info('RainViewer radar stream fallback:', err);
    }
  }

  applyMapStyle(styleKey) {
    const config = this.mapConfigs[styleKey] || this.mapConfigs['hybrid-satellite'];
    this.viewer.imageryLayers.removeAll();

    this.viewer.imageryLayers.addImageryProvider(config.base);

    if (config.labels) {
      const l = this.viewer.imageryLayers.addImageryProvider(config.labels);
      l.alpha = 0.95;
    }
    if (config.roads) {
      const r = this.viewer.imageryLayers.addImageryProvider(config.roads);
      r.alpha = 0.8;
    }
    if (this.radarLayer) {
      this.viewer.imageryLayers.add(this.radarLayer);
    }
    this.viewer.scene.requestRender();
  }

  initShaders() {
    this.shaderStages = {
      flir: new Cesium.PostProcessStage({
        name: 'samvaya_flir',
        fragmentShader: `
          uniform sampler2D colorTexture;
          in vec2 v_textureCoordinates;
          void main() {
            vec4 color = texture(colorTexture, v_textureCoordinates);
            float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
            vec3 heatColor;
            if (lum < 0.25) {
              heatColor = mix(vec3(0.05, 0.05, 0.25), vec3(0.1, 0.35, 0.8), lum * 4.0);
            } else if (lum < 0.5) {
              heatColor = mix(vec3(0.1, 0.35, 0.8), vec3(0.85, 0.5, 0.1), (lum - 0.25) * 4.0);
            } else if (lum < 0.75) {
              heatColor = mix(vec3(0.85, 0.5, 0.1), vec3(0.95, 0.2, 0.1), (lum - 0.5) * 4.0);
            } else {
              heatColor = mix(vec3(0.95, 0.2, 0.1), vec3(1.0, 0.95, 0.8), (lum - 0.75) * 4.0);
            }
            out_FragColor = vec4(heatColor, color.a);
          }
        `
      }),
      nvg: new Cesium.PostProcessStage({
        name: 'samvaya_nvg',
        fragmentShader: `
          uniform sampler2D colorTexture;
          in vec2 v_textureCoordinates;
          void main() {
            vec4 color = texture(colorTexture, v_textureCoordinates);
            float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
            out_FragColor = vec4(vec3(0.1, lum * 1.35, 0.25), color.a);
          }
        `
      })
    };
    this.activeShaderStage = null;
  }

  setShader(mode) {
    if (this.activeShaderStage) {
      this.viewer.scene.postProcessStages.remove(this.activeShaderStage);
      this.activeShaderStage = null;
    }
    if (mode === 'flir') {
      this.activeShaderStage = this.shaderStages.flir;
      this.viewer.scene.postProcessStages.add(this.activeShaderStage);
    } else if (mode === 'nvg') {
      this.activeShaderStage = this.shaderStages.nvg;
      this.viewer.scene.postProcessStages.add(this.activeShaderStage);
    }
    this.viewer.scene.requestRender();
  }

  dropMarker(lon, lat, name) {
    if (this.activePinEntity) {
      this.viewer.entities.remove(this.activePinEntity);
      this.activePinEntity = null;
    }

    this.activePinEntity = this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat, 60),
      point: {
        pixelSize: 12,
        color: Cesium.Color.fromCssColorString('#F4A836'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2.5,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      label: {
        text: name || 'Observatory Target',
        font: '13px JetBrains Mono, monospace',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.fromCssColorString('#FAF8F5'),
        outlineColor: Cesium.Color.fromCssColorString('#0C0E12'),
        outlineWidth: 3.5,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -16),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        backgroundColor: Cesium.Color.fromCssColorString('rgba(16, 20, 27, 0.92)'),
        showBackground: true,
        backgroundPadding: new Cesium.Cartesian2(8, 5)
      }
    });
    this.viewer.scene.requestRender();
  }

  flyTo(lon, lat, height = 30000, pitch = -55.0) {
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(pitch),
        roll: 0.0
      },
      duration: 2.2,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
    });
  }

  flyHome() {
    this.flyTo(78.9629, 20.5937, 7000000, -85.0);
  }

  zoomIn() {
    this.viewer.camera.zoomIn(this.viewer.camera.positionCartographic.height * 0.35);
  }

  zoomOut() {
    this.viewer.camera.zoomOut(this.viewer.camera.positionCartographic.height * 0.35);
  }

  initInteractions() {
    // Coordinate Picking
    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction(async (movement) => {
      const cartesian = this.viewer.camera.pickEllipsoid(movement.position, this.viewer.scene.globe.ellipsoid);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);

        const geo = await reverseGeocodeApi(lat, lon);
        Actions.setLocation({
          latitude: lat,
          longitude: lon,
          name: geo.name || `Target (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          region: geo.region || 'Indian Subcontinent',
          country: 'India',
          source: 'GLOBE_CLICK'
        });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Altitude Telemetry Listener
    this.viewer.camera.changed.addEventListener(() => {
      const heightM = this.viewer.camera.positionCartographic.height;
      Actions.setCameraTelemetry({
        cameraAltitude: Math.round(heightM)
      });
    });
  }

  initSubscriptions() {
    // Subscribe to Location changes
    appStore.select(state => state.location, (loc, prevLoc) => {
      if (!loc) return;
      this.dropMarker(loc.longitude, loc.latitude, loc.name);
      if (!prevLoc || prevLoc.latitude !== loc.latitude || prevLoc.longitude !== loc.longitude) {
        const targetHeight = loc.source === 'DEFAULT' ? 7000000 : 35000;
        const targetPitch = loc.source === 'DEFAULT' ? -85.0 : -55.0;
        this.flyTo(loc.longitude, loc.latitude, targetHeight, targetPitch);
      }
    });

    // Subscribe to Basemap changes
    appStore.select(state => state.globe.basemap, (basemap) => {
      if (basemap) this.applyMapStyle(basemap);
    });

    // Subscribe to Shader changes
    appStore.select(state => state.globe.shaderMode, (shader) => {
      if (shader) this.setShader(shader);
    });
  }
}
