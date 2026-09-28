from datetime import datetime, timezone

from .contracts import ForecastField, ObservationField


def demo_forecasts(variable: str = "tp", lead_hours: int = 48) -> tuple[list[ForecastField], ObservationField]:
    valid_time = datetime(2026, 9, 26, tzinfo=timezone.utc)
    values = {
        "ncum_g": [42.1, 44.0, 48.5, 51.2],
        "neps_g": [51.8, 50.1, 56.3, 59.0],
        "bharatfs": [46.7, 47.2, 49.8, 54.1],
        "graphcast": [43.5, 45.8, 47.6, 52.0],
    }
    observations = [45.0, 48.0, 51.0, 55.0]
    fields = [
        ForecastField(model, variable, valid_time, valid_time, lead_hours, points, "mm", source_version="demo_replay_04")
        for model, points in values.items()
    ]
    return fields, ObservationField(variable, valid_time, observations, "mm", source="synthetic_truth")
