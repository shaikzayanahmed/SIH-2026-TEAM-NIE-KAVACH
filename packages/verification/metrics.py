from __future__ import annotations

from collections.abc import Sequence
from math import sqrt


def _pairs(predicted: Sequence[float], observed: Sequence[float]) -> list[tuple[float, float]]:
    if len(predicted) != len(observed):
        raise ValueError("predicted and observed lengths must match")
    return list(zip(predicted, observed))


def mae(predicted: Sequence[float], observed: Sequence[float]) -> float:
    pairs = _pairs(predicted, observed)
    return sum(abs(prediction - truth) for prediction, truth in pairs) / len(pairs) if pairs else 0.0


def rmse(predicted: Sequence[float], observed: Sequence[float]) -> float:
    pairs = _pairs(predicted, observed)
    return sqrt(sum((prediction - truth) ** 2 for prediction, truth in pairs) / len(pairs)) if pairs else 0.0


def bias(predicted: Sequence[float], observed: Sequence[float]) -> float:
    pairs = _pairs(predicted, observed)
    return sum(prediction - truth for prediction, truth in pairs) / len(pairs) if pairs else 0.0


def threshold_scores(probabilities: Sequence[float], observed: Sequence[float], threshold: float) -> dict[str, float]:
    if len(probabilities) != len(observed):
        raise ValueError("probabilities and observed lengths must match")
    actual = [value >= threshold for value in observed]
    predicted = [probability >= 0.5 for probability in probabilities]
    hits = sum(item and guess for item, guess in zip(actual, predicted))
    false_alarms = sum(not item and guess for item, guess in zip(actual, predicted))
    misses = sum(item and not guess for item, guess in zip(actual, predicted))
    pod = hits / (hits + misses) if hits + misses else 0.0
    far = false_alarms / (hits + false_alarms) if hits + false_alarms else 0.0
    csi = hits / (hits + false_alarms + misses) if hits + false_alarms + misses else 0.0
    return {"pod": pod, "far": far, "csi": csi}
