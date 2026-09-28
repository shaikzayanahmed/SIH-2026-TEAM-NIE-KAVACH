/**
 * SAMVAYA Weather Condition Resolver
 * Maps multi-source atmospheric data into normalized SAMVAYA conditions.
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

export function resolveWeatherCondition(weatherData) {
  if (!weatherData) return 'CLEAR';

  const {
    temperature = 25,
    precipitationIntensity = 0,
    precipitationProbability = 0,
    windSpeed = 3,
    cloudCover = 20,
    humidity = 50,
    visibility = 10000
  } = weatherData;

  // 1. Extreme Heat check (> 38°C)
  if (temperature >= 38) {
    return 'EXTREME_HEAT';
  }

  // 2. Snow check (Precip + below freezing)
  if (precipitationIntensity > 0.2 && temperature <= 0) {
    return 'SNOW';
  }

  // 3. Cold check (< 4°C)
  if (temperature <= 4) {
    return 'COLD';
  }

  // 4. Storm (Strong Wind + Rain)
  if (precipitationIntensity >= 4.0 && windSpeed >= 12) {
    return 'STORM';
  }

  // 5. Heavy Rain (> 5.0 mm/h or 64mm/24h equivalent)
  if (precipitationIntensity >= 5.0 || precipitationProbability > 85) {
    return 'HEAVY_RAIN';
  }

  // 6. Rain
  if (precipitationIntensity > 0.4 || precipitationProbability > 50) {
    return 'RAIN';
  }

  // 7. Fog / Mist (Low visibility or High humidity + very low wind)
  if (visibility < 1200 || (humidity > 92 && windSpeed < 2 && cloudCover > 70)) {
    return 'FOG';
  }

  // 8. Strong Wind (> 10 m/s)
  if (windSpeed >= 10) {
    return 'WIND';
  }

  // 9. Overcast (> 75% clouds)
  if (cloudCover >= 75) {
    return 'OVERCAST';
  }

  // 10. Cloudy (45% - 75% clouds)
  if (cloudCover >= 45) {
    return 'CLOUDY';
  }

  // 11. Clear / Sunny
  return 'CLEAR';
}
