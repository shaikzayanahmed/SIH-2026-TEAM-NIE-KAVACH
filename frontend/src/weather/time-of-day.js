/**
 * SAMVAYA Diurnal Cycle / Time-of-Day Resolver
 * Resolves solar diurnal state (DAWN, DAY, DUSK, NIGHT) for selected geographic coordinates.
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

export function resolveTimeOfDay(timestamp, location) {
  const date = new Date(timestamp || Date.now());
  const lon = location?.longitude !== undefined ? location.longitude : 78.9629;

  // Approximate Local Solar Time: UTC Hour + (Longitude / 15)
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  let solarHour = (utcHours + lon / 15) % 24;
  if (solarHour < 0) solarHour += 24;

  // Diurnal Phase Definitions (Solar Time):
  // Dawn / Sunrise: 05:30 to 07:00
  // Day: 07:00 to 17:30
  // Dusk / Sunset: 17:30 to 19:00
  // Night: 19:00 to 05:30
  if (solarHour >= 5.5 && solarHour < 7.0) {
    return 'DAWN';
  } else if (solarHour >= 7.0 && solarHour < 17.5) {
    return 'DAY';
  } else if (solarHour >= 17.5 && solarHour < 19.0) {
    return 'DUSK';
  } else {
    return 'NIGHT';
  }
}
