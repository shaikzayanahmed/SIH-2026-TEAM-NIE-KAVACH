from dataclasses import dataclass, field
from datetime import datetime
from typing import Mapping, Sequence


@dataclass(frozen=True)
class ForecastField:
    model: str
    variable: str
    init_time: datetime
    valid_time: datetime
    lead_hours: int
    values: Sequence[float]
    unit: str
    latitude: Sequence[float] = field(default_factory=tuple)
    longitude: Sequence[float] = field(default_factory=tuple)
    member: str | None = None
    source_version: str = "demo"


@dataclass(frozen=True)
class ObservationField:
    variable: str
    valid_time: datetime
    values: Sequence[float]
    unit: str
    source: str = "demo"


@dataclass(frozen=True)
class WeightVector:
    weights: Mapping[str, float]
    method: str
    lead_hours: int
    variable: str

    def normalized(self) -> "WeightVector":
        total = sum(max(value, 0.0) for value in self.weights.values())
        if total == 0:
            equal = 1.0 / len(self.weights) if self.weights else 0.0
            values = {model: equal for model in self.weights}
        else:
            values = {model: max(value, 0.0) / total for model, value in self.weights.items()}
        return WeightVector(values, self.method, self.lead_hours, self.variable)


@dataclass(frozen=True)
class BlendResult:
    variable: str
    valid_time: datetime
    lead_hours: int
    values: Sequence[float]
    weights: WeightVector
    uncertainty: Sequence[float]
    lineage: Mapping[str, str]
