from __future__ import annotations

from collections.abc import Mapping, Sequence
from math import exp


def softmax_weights(logits: Mapping[str, float], temperature: float = 1.0) -> dict[str, float]:
    if temperature <= 0:
        raise ValueError("temperature must be positive")
    scaled = {model: value / temperature for model, value in logits.items()}
    maximum = max(scaled.values(), default=0.0)
    exponentials = {model: exp(value - maximum) for model, value in scaled.items()}
    total = sum(exponentials.values()) or 1.0
    return {model: value / total for model, value in exponentials.items()}


def compact_gate_features(model_values: Mapping[str, Sequence[float]], lead_hours: int) -> dict[str, float]:
    flattened = [value for values in model_values.values() for value in values]
    mean = sum(flattened) / len(flattened) if flattened else 0.0
    spread = max(flattened) - min(flattened) if flattened else 0.0
    return {"lead_hours": float(lead_hours), "model_mean": mean, "model_range": spread}
