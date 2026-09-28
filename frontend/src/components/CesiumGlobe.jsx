/**
 * SAMVAYA Cesium 3D Globe Component (React JSX)
 * Embedded directly inside Stitch Cockpit viewports.
 * Project SIH26081 • Team NIE KAVACH
 */

import React, { useEffect, useRef } from 'react';
import { useAtmospheric } from '../context/AtmosphericContext';

export default function CesiumGlobe({ height = '620px', showHud = true }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const { location, activeLayer, setActiveLayer } = useAtmospheric();

  useEffect(() => {
    if (!containerRef.current || viewerRef.current || typeof Cesium === 'undefined') return;

    try {
      const viewer = new Cesium.Viewer(containerRef.current, {
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

      // Boundaries & Labels
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

      viewerRef.current = viewer;

      // Initial Fly to South Asia
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude, 650000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-75),
          roll: 0.0
        },
        duration: 1.5
      });
    } catch (err) {
      console.warn('Cesium initialization warning:', err);
    }

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Update pin and fly to on location change
  useEffect(() => {
    if (!viewerRef.current) return;
    const v = viewerRef.current;
    v.entities.removeAll();

    // Active Station Pin
    v.entities.add({
      position: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude, 100),
      point: {
        pixelSize: 14,
        color: Cesium.Color.fromCssColorString('#C25E1A'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2
      },
      label: {
        text: `${location.name}\n${location.awsId || 'AWS STATION'} (28.4°C)`,
        font: '12px Inter, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString('#0F172A'),
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -14)
      }
    });

    v.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude, 450000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-75),
        roll: 0.0
      },
      duration: 1.2
    });
  }, [location]);

  // Camera Actions
  const handleZoomIn = () => {
    if (viewerRef.current) viewerRef.current.camera.zoomIn(150000);
  };
  const handleZoomOut = () => {
    if (viewerRef.current) viewerRef.current.camera.zoomOut(150000);
  };
  const handleReset = () => {
    if (viewerRef.current) {
      viewerRef.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude, 450000),
        duration: 1.0
      });
    }
  };

  return (
    <div className="relative w-full rounded-2xl bg-surface-container-high p-2 shadow-lg">
      <div 
        className="relative w-full rounded-xl overflow-hidden bg-inverse-surface flex items-center justify-center"
        style={{ height }}
      >
        <div ref={containerRef} className="w-full h-full rounded-3xl overflow-hidden relative shadow-inner" />

        {showHud && (
          <div className="absolute inset-0 p-space-md md:p-space-lg flex flex-col justify-between pointer-events-none">
            {/* HUD Top Row: Layer Pills */}
            <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm pointer-events-auto">
              <div className="flex items-center gap-1.5 bg-inverse-surface/85 backdrop-blur-md p-1.5 rounded-full shadow-md overflow-x-auto max-w-full">
                {['precipitation', 'temperature', 'wind', 'pressure', 'radar', 'confidence'].map((lyr) => (
                  <button
                    key={lyr}
                    onClick={() => setActiveLayer(lyr)}
                    className={`px-3 py-1 rounded-full font-label-caps text-label-caps uppercase transition-all flex items-center gap-1 ${
                      activeLayer === lyr
                        ? 'bg-primary text-on-primary font-semibold shadow-sm'
                        : 'text-inverse-on-surface hover:bg-surface-container-highest/20'
                    }`}
                  >
                    {lyr === 'precipitation' && <span className="material-symbols-outlined text-[14px]">water_drop</span>}
                    {lyr === 'temperature' && <span className="material-symbols-outlined text-[14px]">thermostat</span>}
                    {lyr === 'wind' && <span className="material-symbols-outlined text-[14px]">air</span>}
                    <span>{lyr}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-space-xs self-end md:self-auto">
                <span className="px-3 py-1 rounded-full bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-label-caps text-label-caps uppercase flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span>Cesium 3D Engine · 60 FPS</span>
                </span>
              </div>
            </div>

            {/* HUD Bottom Row: Live Telemetry & Camera Controls */}
            <div className="w-full flex flex-col md:flex-row items-end justify-between gap-space-md pointer-events-auto">
              <div className="bg-surface-container-lowest/90 backdrop-blur-lg p-space-md rounded-xl shadow-lg max-w-xl text-on-surface">
                <div className="flex items-center justify-between gap-space-sm mb-1">
                  <span className="font-label-caps text-label-caps uppercase text-primary font-bold tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">sensors</span>
                    GROUND TRUTH SYNOP TELEMETRY (LIVE)
                  </span>
                  <span className="text-on-surface-variant font-label-caps text-[10px] uppercase">{location.awsId}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm font-telemetry-num text-telemetry-num mt-2">
                  <div className="flex flex-col">
                    <span className="text-on-surface-variant font-label-caps text-[10px] uppercase">Barometric</span>
                    <span className="font-bold text-on-surface">1008.2 hPa</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-on-surface-variant font-label-caps text-[10px] uppercase">Wind Vector</span>
                    <span className="font-bold text-on-surface">14 km/h WSW</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-on-surface-variant font-label-caps text-[10px] uppercase">Dew Point</span>
                    <span className="font-bold text-on-surface">24.2°C (86%)</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-on-surface-variant font-label-caps text-[10px] uppercase">CAPE Index</span>
                    <span className="font-bold text-tertiary">1,480 J/kg</span>
                  </div>
                </div>
              </div>

              {/* Camera Controls */}
              <div className="flex items-center gap-1.5 bg-inverse-surface/85 backdrop-blur-md p-1.5 rounded-full shadow-lg">
                <button onClick={handleZoomIn} className="w-8 h-8 rounded-full bg-surface-container-highest/20 hover:bg-surface-container-highest/40 text-inverse-on-surface flex items-center justify-center transition-all" title="Zoom In">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
                <button onClick={handleZoomOut} className="w-8 h-8 rounded-full bg-surface-container-highest/20 hover:bg-surface-container-highest/40 text-inverse-on-surface flex items-center justify-center transition-all" title="Zoom Out">
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <button onClick={handleReset} className="px-3 h-8 rounded-full bg-primary text-on-primary font-body-sm text-body-sm font-medium flex items-center gap-1 transition-all" title="Reset View">
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span className="hidden sm:inline">Reset Station</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
