from __future__ import annotations

from collections.abc import Sequence


def exceedance_probability(values: Sequence[float], threshold: float) -> float:
    if not values:
        return 0.0
    return sum(value >= threshold for value in values) / len(values)


def extreme_indicators(
    precipitation_members: Sequence[float],
    temperature_values: Sequence[float],
    wind_values: Sequence[float],
    rain_threshold: float = 64.0,
    heat_threshold: float = 313.15,
    wind_threshold: float = 17.0,
) -> dict[str, dict[str, float]]:
    return {
        "heavy_rain": {"threshold": rain_threshold, "probability": exceedance_probability(precipitation_members, rain_threshold)},
        "heatwave": {"threshold": heat_threshold, "probability": exceedance_probability(temperature_values, heat_threshold)},
        "high_wind": {"threshold": wind_threshold, "probability": exceedance_probability(wind_values, wind_threshold)},
    }
