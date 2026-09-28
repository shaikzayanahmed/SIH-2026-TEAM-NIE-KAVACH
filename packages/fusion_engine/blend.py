from __future__ import annotations

from collections.abc import Mapping, Sequence
from math import exp

from packages.data_pipeline.contracts import BlendResult, ForecastField, WeightVector


def equal_weights(models: Sequence[str]) -> dict[str, float]:
    value = 1.0 / len(models) if models else 0.0
    return {model: value for model in models}


def skill_weights(errors: Mapping[str, float], epsilon: float = 1e-6) -> dict[str, float]:
    scores = {model: 1.0 / (max(error, 0.0) + epsilon) for model, error in errors.items()}
    total = sum(scores.values()) or 1.0
    return {model: score / total for model, score in scores.items()}


def recency_skill_weights(errors: Mapping[str, float], decay: float = 1.0) -> dict[str, float]:
    scores = {model: exp(-decay * max(error, 0.0)) for model, error in errors.items()}
    total = sum(scores.values()) or 1.0
    return {model: score / total for model, score in scores.items()}


def hybrid_weights(
    neural: Mapping[str, float] | None,
    skill: Mapping[str, float] | None,
    models: Sequence[str],
) -> WeightVector:
    neural = neural or equal_weights(models)
    skill = skill or equal_weights(models)
    equal = equal_weights(models)
    combined = {
        model: 0.50 * neural.get(model, 0.0)
        + 0.30 * skill.get(model, 0.0)
        + 0.20 * equal.get(model, 0.0)
        for model in models
    }
    return WeightVector(combined, "hybrid_production", 0, "unknown").normalized()


def blend_fields(
    fields: Sequence[ForecastField],
    weights: WeightVector,
    historical_errors: Mapping[str, float] | None = None,
) -> BlendResult:
    if not fields:
        raise ValueError("at least one forecast field is required")
    reference = fields[0]
    models = [field.model for field in fields]
    skill = skill_weights(historical_errors, epsilon=1e-6) if historical_errors else None
    resolved = hybrid_weights(weights.weights, skill, models)
    resolved = WeightVector(resolved.weights, resolved.method, reference.lead_hours, reference.variable)
    point_count = len(reference.values)
    values = []
    uncertainty = []
    for index in range(point_count):
        points = [(field.model, field.values[index]) for field in fields if index < len(field.values)]
        total = sum(resolved.weights.get(model, 0.0) for model, _ in points) or 1.0
        normalized = [(model, value, resolved.weights.get(model, 0.0) / total) for model, value in points]
        blended = sum(value * weight for _, value, weight in normalized)
        spread = sum(weight * (value - blended) ** 2 for _, value, weight in normalized) ** 0.5
        values.append(blended)
        uncertainty.append(spread)
    lineage = {field.model: field.source_version for field in fields}
    return BlendResult(reference.variable, reference.valid_time, reference.lead_hours, values, resolved, uncertainty, lineage)
