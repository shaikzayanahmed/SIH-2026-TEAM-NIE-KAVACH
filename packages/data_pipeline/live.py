from __future__ import annotations

import json
from datetime import datetime, timezone
from math import ceil
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .contracts import ForecastField

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
LIVE_MODELS = {
    "ecmwf_ifs025": "ECMWF IFS",
    "gfs_seamless": "GFS",
    "icon_seamless": "ICON",
    "gem_global": "GEM",
}


def fetch_live_forecasts(
    latitude: float = 20.5937,
    longitude: float = 78.9629,
    variable: str = "tp",
    forecast_days: int = 3,
) -> list[ForecastField]:
    if variable not in {"tp", "2t", "10w"}:
        raise ValueError("live adapter supports tp, 2t, and 10w")
    hourly_variables = {
        "tp": "precipitation",
        "2t": "temperature_2m",
        "10w": "wind_speed_10m",
    }
    query = urlencode(
        {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": hourly_variables[variable],
            "forecast_days": forecast_days,
            "timezone": "UTC",
            "models": ",".join(LIVE_MODELS),
        }
    )
    request = Request(f"{OPEN_METEO_URL}?{query}", headers={"User-Agent": "BirdView-SIH26081/1.0"})
    with urlopen(request, timeout=20) as response:
        payload = json.load(response)
    hourly = payload.get("hourly", {})
    raw_timestamps = hourly.get("time", [])
    if not raw_timestamps:
        raise RuntimeError("live provider returned no hourly timestamps")
    init_time = datetime.now(timezone.utc)
    parsed_times = [datetime.fromisoformat(value).replace(tzinfo=timezone.utc) for value in raw_timestamps]
    start_index = next((index for index, value in enumerate(parsed_times) if value >= init_time), 0)
    timestamps = raw_timestamps[start_index : start_index + 24]
    valid_time = parsed_times[start_index]
    fields = []
    for provider_model, display_name in LIVE_MODELS.items():
        key = f"{hourly_variables[variable]}_{provider_model}"
        values = hourly.get(key)
        if not values:
            continue
        values = values[start_index : start_index + len(timestamps)]
        if variable == "2t":
            values = [value + 273.15 if value is not None else 0.0 for value in values]
            unit = "K"
        elif variable == "10w":
            values = [value / 3.6 if value is not None else 0.0 for value in values]
            unit = "m/s"
        else:
            values = [value if value is not None else 0.0 for value in values]
            unit = "mm"
        fields.append(
            ForecastField(
                model=display_name,
                variable=variable,
                init_time=init_time,
                valid_time=valid_time,
                lead_hours=max(1, ceil((valid_time - init_time).total_seconds() / 3600)),
                values=values,
                unit=unit,
                latitude=(latitude,),
                longitude=(longitude,),
                source_version=f"open-meteo/{provider_model}",
            )
        )
    if len(fields) < 2:
        raise RuntimeError("live provider returned fewer than two model forecasts")
    return fields
