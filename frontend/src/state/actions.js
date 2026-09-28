/**
 * SAMVAYA State Actions & Dispatchers
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

import { appStore } from './store.js';
import { resolveWeatherCondition } from '../weather/condition-resolver.js';
import { resolveTimeOfDay } from '../weather/time-of-day.js';
import { resolveAtmosphericState } from '../weather/atmospheric-resolver.js';
import { fetchLocationSnapshot } from '../services/api.js';

export const Actions = {
  // Navigation
  setNavigation(section, view = null) {
    const current = appStore.getState().navigation;
    appStore.setState({
      navigation: {
        activeSection: section,
        activeView: view || section,
        previousView: current.activeView
      }
    });
  },

  // Location & Weather Synchronization
  async setLocation(locationData) {
    appStore.setState({
      location: {
        ...locationData
      },
      system: {
        loading: true
      }
    });

    try {
      // Trigger Weather Fetch
      const data = await fetchLocationSnapshot(locationData.latitude, locationData.longitude, locationData.name);
      if (data) {
        this.updateWeatherData(data);
      }
    } catch (err) {
      console.warn('Location forecast fetch fallback:', err);
      appStore.setState({
        system: {
          backendStatus: 'DEGRADED',
          degraded: true,
          loading: false,
          error: err.message
        }
      });
    }
  },

  // Weather update from Backend Snapshot or API
  updateWeatherData(snapshot) {
    const currentState = appStore.getState();
    const weatherRaw = snapshot.weather || {
      temperature: snapshot.forecast?.[0] !== undefined ? snapshot.forecast[0] : currentState.weather.temperature,
      precipitationIntensity: snapshot.variable === 'tp' ? (snapshot.forecast?.[0] || 0) : 0,
      windSpeed: snapshot.variable === '10u' || snapshot.variable === '10v' ? 5.5 : currentState.weather.windSpeed,
      pressure: 1012.0,
      cloudCover: 25,
      humidity: 60
    };

    const resolvedCondition = resolveWeatherCondition(weatherRaw);
    const resolvedTime = resolveTimeOfDay(Date.now(), currentState.location);

    const weights = snapshot.weights || {};
    const sources = Object.keys(weights).length ? Object.keys(weights) : currentState.models.sources;
    const contributions = Object.keys(weights).length ? weights : currentState.models.contributions;

    // Resolve agreement from spread/uncertainty
    const uncertainty = snapshot.uncertainty?.[0] || 1.0;
    const agreement = uncertainty < 1.5 ? 'HIGH' : (uncertainty < 3.0 ? 'MODERATE' : 'DIVERGENT');
    const confidence = uncertainty < 2.0 ? 'HIGH' : (uncertainty < 4.0 ? 'MODERATE' : 'LOW');

    const updatedWeather = {
      ...currentState.weather,
      ...weatherRaw,
      condition: currentState.dev.forcedWeather || resolvedCondition,
      observedAt: snapshot.valid_time || new Date().toISOString()
    };

    const updatedAtmospheric = resolveAtmosphericState(
      updatedWeather,
      currentState.dev.forcedTimeOfDay || resolvedTime,
      confidence,
      agreement,
      snapshot.extremes ? (snapshot.extremes.heavy_rain ? 'HEAVY_RAIN' : (snapshot.extremes.heatwave ? 'EXTREME_HEAT' : 'NONE')) : 'NONE',
      currentState.preferences
    );

    appStore.setState({
      weather: updatedWeather,
      forecast: {
        leadHours: snapshot.lead_hours || 24,
        blendedValue: snapshot.forecast?.[0] || updatedWeather.temperature,
        uncertainty: uncertainty,
        validTime: snapshot.valid_time || new Date().toISOString(),
        runId: snapshot.run_id || 'live_snapshot',
        variable: snapshot.variable || '2t'
      },
      models: {
        sources,
        contributions,
        agreement,
        confidence,
        disagreement: agreement === 'DIVERGENT' ? 'HIGH' : 'LOW',
        selectedModel: 'ALL_BLEND',
        forecastHorizon: 120
      },
      atmospheric: updatedAtmospheric,
      system: {
        backendStatus: 'READY',
        dataFreshness: snapshot.mode || 'LIVE',
        loading: false,
        degraded: false,
        error: null,
        lastUpdated: new Date().toISOString()
      }
    });
  },

  // Time & Timeline Playback
  setTimeOffset(offsetHours) {
    const baseTime = Date.now();
    const targetTimestamp = baseTime + offsetHours * 3600 * 1000;
    const mode = offsetHours < 0 ? 'PAST' : (offsetHours === 0 ? 'NOW' : 'FUTURE');

    const state = appStore.getState();
    const resolvedTime = resolveTimeOfDay(targetTimestamp, state.location);
    const updatedAtmospheric = resolveAtmosphericState(
      state.weather,
      state.dev.forcedTimeOfDay || resolvedTime,
      state.models.confidence,
      state.models.agreement,
      state.extremeWeather.severity,
      state.preferences
    );

    appStore.setState({
      time: {
        timestamp: targetTimestamp,
        relativeOffset: offsetHours,
        mode
      },
      atmospheric: updatedAtmospheric
    });
  },

  setPlayback(isPlaying) {
    appStore.setState({
      time: {
        isPlaying
      }
    });
  },

  setPlaybackSpeed(speed) {
    appStore.setState({
      time: {
        playbackSpeed: speed
      }
    });
  },

  // Globe Display & Sensor Modes
  setBasemap(basemapKey) {
    appStore.setState({
      globe: {
        basemap: basemapKey
      }
    });
  },

  setShaderMode(shaderKey) {
    appStore.setState({
      globe: {
        shaderMode: shaderKey
      }
    });
  },

  setActiveLayerParam(paramKey) {
    appStore.setState({
      globe: {
        activeLayerParam: paramKey
      }
    });
  },

  setCameraTelemetry(telemetry) {
    appStore.setState({
      globe: {
        ...telemetry
      }
    });
  },

  // User Preferences
  setAtmosphericIntensity(intensity) {
    appStore.setState({
      preferences: {
        atmosphericIntensity: intensity
      }
    });
    const state = appStore.getState();
    const updated = resolveAtmosphericState(
      state.weather,
      state.atmospheric.timeOfDay,
      state.models.confidence,
      state.models.agreement,
      state.extremeWeather.severity,
      { ...state.preferences, atmosphericIntensity: intensity }
    );
    appStore.setState({ atmospheric: updated });
  },

  setPerformanceMode(mode) {
    appStore.setState({
      preferences: {
        performanceMode: mode
      }
    });
  },

  // Development QA Overrides
  setDevWeatherOverride(condition) {
    appStore.setState({
      dev: {
        forcedWeather: condition
      }
    });
    const state = appStore.getState();
    const weather = { ...state.weather, condition: condition || resolveWeatherCondition(state.weather) };
    const updated = resolveAtmosphericState(
      weather,
      state.dev.forcedTimeOfDay || state.atmospheric.timeOfDay,
      state.models.confidence,
      state.models.agreement,
      state.extremeWeather.severity,
      state.preferences
    );
    appStore.setState({ weather, atmospheric: updated });
  },

  setDevTimeOfDayOverride(timeOfDay) {
    appStore.setState({
      dev: {
        forcedTimeOfDay: timeOfDay
      }
    });
    const state = appStore.getState();
    const updated = resolveAtmosphericState(
      state.weather,
      timeOfDay || resolveTimeOfDay(state.time.timestamp, state.location),
      state.models.confidence,
      state.models.agreement,
      state.extremeWeather.severity,
      state.preferences
    );
    appStore.setState({ atmospheric: updated });
  }
};
