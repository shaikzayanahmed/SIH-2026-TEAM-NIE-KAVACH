/**
 * SAMVAYA Global Cesium Bootstrapper
 * Mounts Cesium 3D Globe wherever #cesiumContainer is present across all Stitch pages.
 * Project SIH26081 • Team NIE KAVACH
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cesiumContainer');
  if (!container || typeof Cesium === 'undefined') return;

  try {
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
      skyAtmosphere: new Cesium.SkyAtmosphere(),
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      imageryProvider: new Cesium.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maximumLevel: 18,
        credit: '© Esri, Maxar'
      }),
      requestRenderMode: true,
      maximumRenderTimeChange: Number.POSITIVE_INFINITY
    });

    // Add CartoDB Reference Labels Overlay
    viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        maximumLevel: 18
      })
    );

    viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.5);
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.atmosphereHueShift = 0.05;
    viewer.scene.globe.atmosphereSaturationShift = 0.12;
    viewer.scene.globe.atmosphereBrightnessShift = 0.15;

    // Add South Asia / Mysuru Synoptic Pin
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(76.6394, 12.2958, 100),
      point: {
        pixelSize: 12,
        color: Cesium.Color.fromCssColorString('#C25E1A'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2
      },
      label: {
        text: 'Mysuru Synoptic Station\nAWS #43285 (28.4°C)',
        font: '12px Inter, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString('#0F172A'),
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -12)
      }
    });

    // Add Bengaluru Observational Pin
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(77.5946, 12.9716, 100),
      point: {
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString('#656D4A'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1.5
      },
      label: {
        text: 'Bengaluru Radar (25.2°C)',
        font: '10px Inter, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString('#0F172A'),
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10)
      }
    });

    // Camera perspective over South Asia / Deccan Plateau
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(77.2, 13.8, 1600000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-75),
        roll: 0.0
      },
      duration: 1.2
    });

    window.samvayaViewer = viewer;
  } catch (err) {
    console.warn('Cesium initialization error:', err);
  }
});
