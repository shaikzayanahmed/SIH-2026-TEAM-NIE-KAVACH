/**
 * SAMVAYA Atmospheric State Engine
 * Resolves presentation mood, lighting, particles, and visual profile without modifying scientific data.
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

export function resolveAtmosphericState(
  weather,
  timeOfDay = 'DAY',
  confidence = 'HIGH',
  agreement = 'HIGH',
  extremeRisk = 'NONE',
  preferences = { atmosphericIntensity: 'balanced', performanceMode: 'normal', reducedMotion: false }
) {
  let weatherState = weather?.condition || 'CLEAR';

  // High uncertainty check: if model disagreement is divergent and no severe storm
  if (agreement === 'DIVERGENT' && weatherState !== 'STORM' && weatherState !== 'HEAVY_RAIN') {
    weatherState = 'UNCERTAINTY';
  }

  const intensity = (preferences?.atmosphericIntensity || 'balanced').toUpperCase();
  const isPerformance = preferences?.performanceMode === 'performance';
  const isReducedMotion = preferences?.reducedMotion === true;

  // Particle & Haze Multipliers
  let particleType = 'none';
  let baseDensity = 0;
  let moodTint = 'rgba(244, 168, 54, 0.06)';
  let accent = '#F4A836';
  let glow = 'rgba(244, 168, 54, 0.25)';
  let hazeOpacity = 0.08;

  switch (weatherState) {
    case 'CLEAR':
    case 'SUNNY':
      moodTint = 'rgba(244, 168, 54, 0.06)';
      accent = '#F4A836';
      glow = 'rgba(244, 168, 54, 0.25)';
      hazeOpacity = 0.06;
      particleType = 'sunbeam';
      baseDensity = 15;
      break;

    case 'CLOUDY':
    case 'OVERCAST':
      moodTint = 'rgba(158, 145, 130, 0.08)';
      accent = '#C9BBA5';
      glow = 'rgba(158, 145, 130, 0.2)';
      hazeOpacity = 0.22;
      particleType = 'haze';
      baseDensity = 20;
      break;

    case 'RAIN':
      moodTint = 'rgba(93, 156, 191, 0.10)';
      accent = '#5D9CBF';
      glow = 'rgba(93, 156, 191, 0.25)';
      hazeOpacity = 0.25;
      particleType = 'rain';
      baseDensity = 45;
      break;

    case 'HEAVY_RAIN':
      moodTint = 'rgba(38, 85, 112, 0.18)';
      accent = '#3B7A9E';
      glow = 'rgba(59, 122, 158, 0.35)';
      hazeOpacity = 0.4;
      particleType = 'rain_dense';
      baseDensity = 90;
      break;

    case 'FOG':
      moodTint = 'rgba(201, 187, 165, 0.15)';
      accent = '#E2D7C5';
      glow = 'rgba(201, 187, 165, 0.2)';
      hazeOpacity = 0.55;
      particleType = 'fog';
      baseDensity = 35;
      break;

    case 'WIND':
      moodTint = 'rgba(148, 163, 184, 0.08)';
      accent = '#94A3B8';
      glow = 'rgba(148, 163, 184, 0.25)';
      hazeOpacity = 0.12;
      particleType = 'wind';
      baseDensity = 30;
      break;

    case 'STORM':
      moodTint = 'rgba(22, 26, 35, 0.32)';
      accent = '#E3785B';
      glow = 'rgba(227, 120, 91, 0.3)';
      hazeOpacity = 0.38;
      particleType = 'storm';
      baseDensity = 80;
      break;

    case 'EXTREME_HEAT':
      moodTint = 'rgba(227, 120, 91, 0.14)';
      accent = '#E3785B';
      glow = 'rgba(227, 120, 91, 0.35)';
      hazeOpacity = 0.16;
      particleType = 'shimmer';
      baseDensity = 25;
      break;

    case 'COLD':
      moodTint = 'rgba(148, 163, 184, 0.1)';
      accent = '#94A3B8';
      glow = 'rgba(148, 163, 184, 0.2)';
      hazeOpacity = 0.14;
      particleType = 'frost';
      baseDensity = 15;
      break;

    case 'SNOW':
      moodTint = 'rgba(200, 210, 225, 0.12)';
      accent = '#D8D1C5';
      glow = 'rgba(200, 210, 225, 0.25)';
      hazeOpacity = 0.3;
      particleType = 'snow';
      baseDensity = 50;
      break;

    case 'UNCERTAINTY':
      moodTint = 'rgba(100, 116, 139, 0.14)';
      accent = '#94A3B8';
      glow = 'rgba(100, 116, 139, 0.25)';
      hazeOpacity = 0.2;
      particleType = 'haze';
      baseDensity = 20;
      break;
  }

  // Adjust density by intensity preference & performance mode
  let finalDensity = baseDensity;
  if (intensity === 'MINIMAL' || isReducedMotion) {
    finalDensity = 0;
  } else if (intensity === 'IMMERSIVE' && !isPerformance) {
    finalDensity = Math.round(baseDensity * 1.6);
  }
  if (isPerformance) {
    finalDensity = Math.round(finalDensity * 0.4);
  }

  const presentationState = {
    weatherState,
    timeOfDay,
    intensity,
    confidenceState: confidence,
    agreementState: agreement,
    extremeState: extremeRisk,
    visualProfile: {
      moodTint,
      accent,
      glow,
      hazeOpacity,
      particleType,
      particleDensity: finalDensity
    }
  };

  // Synchronize DOM attributes on document.body
  if (typeof document !== 'undefined' && document.body) {
    document.body.setAttribute('data-weather', weatherState.toLowerCase());
    document.body.setAttribute('data-time', timeOfDay.toLowerCase());
    document.body.setAttribute('data-intensity', intensity.toLowerCase());
  }

  return presentationState;
}
