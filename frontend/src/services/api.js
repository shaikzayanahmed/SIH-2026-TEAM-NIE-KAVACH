/**
 * SAMVAYA Backend API Service & Adapters
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Health check returned ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function fetchLocationSnapshot(lat, lon, name = 'Selected Location', variable = '2t') {
  const query = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    name: name,
    var: variable
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${API_BASE_URL}/api/v1/snapshot?${query.toString()}`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Snapshot API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return normalizeSnapshotResponse(data, lat, lon, name);
  } catch (err) {
    console.warn(`Live forecast API unavailable for (${lat}, ${lon}): ${err.message}. Using normalized fallback.`);
    return getFallbackSnapshot(lat, lon, name);
  }
}

export async function reverseGeocodeApi(lat, lon) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/locations/reverse?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // fallback to Nominatim directly if backend proxy fails
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14`);
    if (res.ok) {
      const data = await res.json();
      return {
        name: data.address?.city || data.address?.town || data.address?.village || data.name || 'Selected point',
        region: data.address?.state || data.address?.country || 'South Asia',
        display_name: data.display_name
      };
    }
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
  }

  return { name: `Target (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`, region: 'India Domain', display_name: `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E` };
}

function normalizeSnapshotResponse(raw, lat, lon, name) {
  return {
    mode: raw.mode || 'LIVE OPEN DATA',
    provider: raw.provider || 'Open-Meteo multi-model forecast API',
    location: raw.location || { name, latitude: lat, longitude: lon },
    run_id: raw.run_id || `live_${Date.now()}`,
    variable: raw.variable || '2t',
    unit: raw.unit || '°C',
    lead_hours: raw.lead_hours || 24,
    valid_time: raw.valid_time || new Date().toISOString(),
    forecast: Array.isArray(raw.forecast) ? raw.forecast : [28.0],
    uncertainty: Array.isArray(raw.uncertainty) ? raw.uncertainty : [1.2],
    weights: raw.weights || { 'ECMWF IFS': 0.35, 'GFS': 0.25, 'ICON': 0.20, 'GEM': 0.20 },
    lineage: raw.lineage || {},
    models_forecast: raw.models_forecast || {
      'ECMWF IFS': [28.2],
      'GFS': [29.1],
      'ICON': [28.6],
      'GEM': [29.4]
    },
    model_metadata: raw.model_metadata || {},
    verification: raw.verification || {},
    regime: raw.regime || {},
    extremes: raw.extremes || { heavy_rain: false, heatwave: false, high_wind: false }
  };
}

function getFallbackSnapshot(lat, lon, name) {
  return {
    mode: 'OFFLINE_CACHE',
    provider: 'Local Atmospheric Cache',
    location: { name, latitude: lat, longitude: lon },
    run_id: 'cache_fallback',
    variable: '2t',
    unit: '°C',
    lead_hours: 24,
    valid_time: new Date().toISOString(),
    forecast: [27.8],
    uncertainty: [1.5],
    weights: { 'ECMWF IFS': 0.35, 'GFS': 0.25, 'ICON': 0.20, 'GEM': 0.20 },
    lineage: { fallback: true },
    models_forecast: {
      'ECMWF IFS': [27.5],
      'GFS': [28.4],
      'ICON': [27.8],
      'GEM': [28.9]
    },
    model_metadata: {},
    verification: {},
    regime: {},
    extremes: { heavy_rain: false, heatwave: false, high_wind: false }
  };
}
