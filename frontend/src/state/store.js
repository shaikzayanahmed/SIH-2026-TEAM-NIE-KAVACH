/**
 * SAMVAYA Central Application Store
 * Lightweight reactive state container with selector subscriptions and dispatchable actions.
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

export class Store {
  constructor(initialState) {
    this._state = Object.freeze(JSON.parse(JSON.stringify(initialState)));
    this._subscribers = new Set();
    this._selectorSubscribers = new Map();
  }

  getState() {
    return this._state;
  }

  setState(updater) {
    const prevState = this._state;
    const nextPartial = typeof updater === 'function' ? updater(prevState) : updater;
    if (!nextPartial || typeof nextPartial !== 'object') return;

    // Deep merge shallow top-level keys
    const nextState = Object.freeze({
      ...prevState,
      ...nextPartial,
      navigation: nextPartial.navigation ? { ...prevState.navigation, ...nextPartial.navigation } : prevState.navigation,
      location: nextPartial.location ? { ...prevState.location, ...nextPartial.location } : prevState.location,
      time: nextPartial.time ? { ...prevState.time, ...nextPartial.time } : prevState.time,
      weather: nextPartial.weather ? { ...prevState.weather, ...nextPartial.weather } : prevState.weather,
      forecast: nextPartial.forecast ? { ...prevState.forecast, ...nextPartial.forecast } : prevState.forecast,
      models: nextPartial.models ? { ...prevState.models, ...nextPartial.models } : prevState.models,
      extremeWeather: nextPartial.extremeWeather ? { ...prevState.extremeWeather, ...nextPartial.extremeWeather } : prevState.extremeWeather,
      globe: nextPartial.globe ? { ...prevState.globe, ...nextPartial.globe } : prevState.globe,
      atmospheric: nextPartial.atmospheric ? { ...prevState.atmospheric, ...nextPartial.atmospheric } : prevState.atmospheric,
      preferences: nextPartial.preferences ? { ...prevState.preferences, ...nextPartial.preferences } : prevState.preferences,
      system: nextPartial.system ? { ...prevState.system, ...nextPartial.system } : prevState.system,
      dev: nextPartial.dev ? { ...prevState.dev, ...nextPartial.dev } : prevState.dev
    });

    this._state = nextState;

    // Global subscribers
    for (const listener of this._subscribers) {
      try {
        listener(this._state, prevState);
      } catch (err) {
        console.error('State subscriber error:', err);
      }
    }

    // Selector-specific subscribers
    for (const [id, entry] of this._selectorSubscribers.entries()) {
      try {
        const prevVal = entry.selector(prevState);
        const nextVal = entry.selector(nextState);
        if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) {
          entry.listener(nextVal, prevVal, nextState);
        }
      } catch (err) {
        console.error(`Selector subscriber ${id} error:`, err);
      }
    }
  }

  subscribe(listener) {
    this._subscribers.add(listener);
    return () => this._subscribers.delete(listener);
  }

  select(selector, listener) {
    const id = Symbol('selector');
    this._selectorSubscribers.set(id, { selector, listener });
    // Run immediately with current value
    try {
      listener(selector(this._state), undefined, this._state);
    } catch (err) {
      console.error('Initial selector invocation error:', err);
    }
    return () => this._selectorSubscribers.delete(id);
  }
}

// Initial Standard State
export const initialApplicationState = {
  navigation: {
    activeSection: 'explore', // 'explore' | 'forecast' | 'intelligence' | 'history'
    activeView: 'explore',
    previousView: null
  },
  location: {
    latitude: 20.5937,
    longitude: 78.9629,
    name: 'Indian Subcontinent',
    region: 'South Asia Domain',
    country: 'India',
    timezone: 'Asia/Kolkata',
    source: 'DEFAULT', // 'DEFAULT' | 'SEARCH' | 'GPS' | 'GLOBE_CLICK' | 'PRESET'
    isCurrentLocation: false,
    isSaved: false
  },
  time: {
    mode: 'NOW', // 'PAST' | 'NOW' | 'FUTURE'
    timestamp: Date.now(),
    relativeOffset: 0, // In hours: -24 to +120
    isPlaying: false,
    playbackSpeed: 1, // 0.5, 1, 2, 4
    selectedForecastRun: 'live_latest'
  },
  weather: {
    temperature: 28.5,
    apparentTemperature: 31.0,
    precipitationProbability: 15,
    precipitationIntensity: 0.0,
    humidity: 60,
    cloudCover: 25,
    windSpeed: 4.2,
    windDirection: 220,
    pressure: 1012.0,
    visibility: 10000,
    condition: 'CLEAR', // CLEAR, SUNNY, CLOUDY, OVERCAST, RAIN, HEAVY_RAIN, FOG, WIND, STORM, EXTREME_HEAT, COLD, SNOW, UNCERTAINTY
    observedAt: new Date().toISOString(),
    source: 'OPEN_METEO_LIVE',
    freshness: 'LIVE'
  },
  forecast: {
    leadHours: 24,
    blendedValue: 28.5,
    uncertainty: 1.1,
    validTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    runId: 'live_init',
    variable: '2t'
  },
  models: {
    sources: ['ECMWF', 'GFS', 'ICON', 'GEM'],
    contributions: {
      'ECMWF': 0.35,
      'GFS': 0.25,
      'ICON': 0.20,
      'GEM': 0.20
    },
    agreement: 'HIGH', // 'HIGH' | 'MODERATE' | 'DIVERGENT'
    disagreement: 'LOW',
    confidence: 'HIGH', // 'HIGH' | 'MODERATE' | 'LOW' | 'UNKNOWN'
    selectedModel: 'ALL_BLEND',
    forecastHorizon: 120
  },
  extremeWeather: {
    active: false,
    type: null, // 'HEAVY_RAIN' | 'EXTREME_HEAT' | 'STRONG_WIND' | 'SEVERE_STORM' | 'EXTREME_COLD'
    probability: 0.05,
    confidence: 'HIGH',
    severity: 'NONE', // 'NONE' | 'WATCH' | 'ADVISORY' | 'WARNING'
    startTime: null,
    endTime: null,
    region: null,
    source: 'RULE_ENGINE'
  },
  globe: {
    basemap: 'hybrid-satellite', // 'hybrid-satellite' | 'osm' | 'carto-dark' | 'opentopo'
    shaderMode: 'standard', // 'standard' | 'flir' | 'nvg'
    radarActive: true,
    cameraAltitude: 7000,
    cameraPitch: -85,
    cameraHeading: 0,
    activeLayerParam: 'radar' // 'radar' | 'temperature' | 'precipitation' | 'wind' | 'pressure' | 'agreement'
  },
  atmospheric: {
    weatherState: 'CLEAR',
    timeOfDay: 'DAY', // 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT'
    intensity: 'BALANCED', // 'MINIMAL' | 'BALANCED' | 'IMMERSIVE'
    confidenceState: 'HIGH',
    agreementState: 'HIGH',
    extremeState: 'NONE',
    visualProfile: {
      moodTint: 'rgba(244, 168, 54, 0.06)',
      accent: '#F4A836',
      glow: 'rgba(244, 168, 54, 0.25)',
      hazeOpacity: 0.08,
      particleType: 'none',
      particleDensity: 0
    }
  },
  preferences: {
    units: 'metric',
    atmosphericIntensity: 'balanced',
    performanceMode: 'normal', // 'normal' | 'performance'
    reducedMotion: false,
    showConfidence: true,
    showModelAgreement: true,
    defaultLayer: 'radar'
  },
  system: {
    backendStatus: 'READY', // 'LOADING' | 'READY' | 'PARTIAL' | 'STALE' | 'DEGRADED' | 'ERROR' | 'OFFLINE'
    dataFreshness: 'LIVE',
    loading: false,
    degraded: false,
    error: null,
    lastUpdated: new Date().toISOString()
  },
  dev: {
    forcedWeather: null, // null or specific weather condition override for QA
    forcedTimeOfDay: null,
    showInspector: false
  }
};

export const appStore = new Store(initialApplicationState);
