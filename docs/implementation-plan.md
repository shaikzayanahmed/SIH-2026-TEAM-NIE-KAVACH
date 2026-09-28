# SIH26081 Implementation Plan

## Product boundary
Bird View is an adaptive forecast-fusion and verification platform. The globe is the geospatial analysis surface; the scientific pipeline remains independent of the UI and can run in local, cloud-batch, or institutional environments.

## Build order

### Phase 0: Repository and contracts
- Define canonical forecast, observation, run, weight, uncertainty, and lineage schemas.
- Add configuration for the India prototype domain, variables, lead times, thresholds, and enabled sources.
- Add logging, environment examples, and test conventions.

### Phase 1: Local infrastructure
- Add FastAPI service, PostgreSQL/PostGIS metadata, Redis cache, and optional MinIO object storage.
- Keep a filesystem/replay mode that runs without Docker or internet access.
- Add health, readiness, and metrics endpoints.

### Phase 2: Demo and reference adapters
- Implement DemoAdapter and ERA5Adapter contracts.
- Add a controlled synthetic dataset and archived replay cases.
- Validate units, coordinates, timestamps, missingness, and physical ranges.

### Phase 3: Alignment and common cube
- Normalize UTC timestamps and calculate lead time.
- Crop to India: 5N-38N, 66E-100E, with interpolation buffer.
- Start with a 0.5 degree local grid; support 0.25 degree validation runs.
- Use float32, chunked Zarr, lazy loading, and documented regridding methods.

### Phase 4: Baselines and fusion
- Implement persistence, climatology, equal mean, inverse-error skill weighting, and recency weighting.
- Implement compact MLP gating with softmax weights after baselines are verified.
- Add hybrid production weighting only after validation.
- Mask unavailable models and renormalize remaining weights.

### Phase 5: Uncertainty and extremes
- Combine ensemble spread, model disagreement, and historical residual variance.
- Calculate configurable heavy-rain, heat, and high-wind threshold probabilities.
- Present outputs as forecast guidance, never as an official warning without an authorized source.

### Phase 6: Verification and reproducibility
- Add RMSE, MAE, bias, ACC, CSI, FAR, POD, Brier, and CRPS-compatible interfaces.
- Use leakage-safe time splits and archived run IDs.
- Store source versions, checksums, grid, regrid method, model version, and calibration metadata.

### Phase 7: Operational workflow
- Wire discover -> validate -> normalize -> regrid -> features -> regime -> weights -> blend -> calibrate -> extremes -> verify -> publish.
- Add failure states, stale detection, quarantine behavior, and structured run logs.

### Phase 8: Dashboard integration
- Keep the Cesium globe as the persistent map-first surface.
- Connect the Stitch pages to `/api/v1` data instead of hard-coded values.
- Add forecast controls, weight maps, uncertainty, location drilldown, verification charts, health, run details, and configuration.
- Label DEMO DATA, OPEN DATA, and OFFICIAL SOURCE explicitly.

### Phase 9: Deployment and demo
- Add Docker Compose profiles: core, storage, ML, research.
- Keep a complete local fallback with replay artifacts.
- Freeze rainfall, heat, wind, normal-weather, and failure/uncertainty cases.
- Run lint, unit, scientific, integration, frontend, Docker, and replay checks.

## Current implementation slice
- Canonical Python contracts.
- Equal, skill, and hybrid weight blending.
- Deterministic verification and extreme-event indicators.
- Replay/demo API endpoints.
- Frontend remains usable with demo data until API wiring is complete.

## Non-negotiable scientific rules
- Do not train or run full-resolution foundation weather models locally.
- Do not use future truth to calculate skill for the forecast being evaluated.
- Do not fabricate live government access, accuracy, official warnings, calibration, or model provenance.
- Forecast arrays belong in chunked object storage; relational databases store metadata.
