/**
 * SAMVAYA Forecast Intelligence / Dynamic Model Fusion Lab (React JSX)
 * Authoritative Stitch Screen: samvaya_forecast_intelligence_model_lab
 * Project SIH26081 • Team NIE KAVACH
 */

import React, { useState } from 'react';
import { useAtmospheric } from '../context/AtmosphericContext';
import CesiumGlobe from '../components/CesiumGlobe';

export default function ModelLab() {
  const { location, leadTimeStep, setLeadTimeStep, snapshot } = useAtmospheric();
  const [activeVar, setActiveVar] = useState('temperature');

  const consensusTemp = snapshot?.forecast?.[0] !== undefined ? snapshot.forecast[0] : 29.2;
  const weights = snapshot?.weights || { 'ECMWF IFS': 0.35, 'GFS': 0.25, 'ICON': 0.20, 'GEM': 0.20 };
  const aifsWt = Math.round((weights['ECMWF AIFS'] || weights['AIFS'] || 0.41) * 100);
  const ecmwfWt = Math.round((weights['ECMWF IFS'] || weights['ECMWF'] || 0.32) * 100);
  const gfsWt = Math.round((weights['GFS'] || 0.18) * 100);
  const iconWt = Math.round((weights['ICON'] || weights['GEFS'] || 0.09) * 100);

  const modelPredictions = snapshot?.models_forecast || {};
  const ecmwfPred = modelPredictions['ECMWF IFS']?.[0] || (consensusTemp - 0.5);
  const aifsPred = modelPredictions['ECMWF AIFS']?.[0] || (consensusTemp + 0.2);
  const gfsPred = modelPredictions['GFS']?.[0] || (consensusTemp + 1.0);
  const iconPred = modelPredictions['ICON']?.[0] || (consensusTemp - 0.1);

  // Linear spectrum math
  const minTemp = 27.5;
  const maxTemp = 31.0;
  const range = maxTemp - minTemp;
  const calcPct = (val) => Math.max(5, Math.min(95, ((val - minTemp) / range) * 100));

  return (
    <div className="w-full flex flex-col">
      {/* Lab Sub-Bar & Status System Context */}
      <section className="w-full px-gutter py-space-sm bg-surface-container-low shadow-sm">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md flex-wrap">
            <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-lowest shadow-[0_1px_3px_rgba(74,53,37,0.05)]">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider">Forecast Engine Online</span>
              <span className="text-outline">/</span>
              <span className="font-telemetry-num text-body-sm text-primary font-medium">Adaptive Gating Synced</span>
            </div>
            <div className="flex items-center gap-space-xs text-body-sm text-on-surface-variant font-telemetry-num">
              <span className="font-label-caps text-label-caps uppercase text-outline">Pipeline:</span>
              <span>SIH26081-NWP-AI-HYBRID</span>
            </div>
            <div className="hidden sm:flex items-center gap-space-xs text-body-sm text-on-surface-variant font-telemetry-num">
              <span className="font-label-caps text-label-caps uppercase text-outline">Assimilation:</span>
              <span>4D-Var Hybrid Ensemble</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider hidden md:inline">Atmospheric Regime:</span>
            <div className="px-space-md py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed font-telemetry-num text-body-sm font-medium flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[16px]">cyclone</span>
              <span>Convective Transition (78% confidence)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Intelligence Core Body */}
      <section className="w-full px-gutter py-space-md">
        <div className="max-w-[1720px] mx-auto flex flex-col gap-space-lg">
          
          {/* Geography & Temporal Horizon Controller */}
          <div className="p-space-lg rounded-xl bg-surface-container shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest">Diagnostic Station Lab</span>
                <span className="text-outline">·</span>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Grid ID #MYQ-763M</span>
              </div>
              <div className="flex items-baseline gap-space-sm flex-wrap">
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">FORECAST INTELLIGENCE — MODEL LAB</h1>
                <span className="text-on-surface-variant font-body-md">{location.name}</span>
              </div>
              <div className="flex items-center gap-space-md text-on-surface-variant font-telemetry-num text-body-sm flex-wrap">
                <span className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[15px] text-primary">pin_drop</span>
                  <span>{Math.abs(location.latitude).toFixed(4)}° N, {Math.abs(location.longitude).toFixed(4)}° E</span>
                </span>
                <span>·</span>
                <span>Elevation: {location.elevation}</span>
                <span>·</span>
                <span className="text-secondary font-medium">Deccan Plateau Orographic Micro-basin</span>
              </div>
            </div>

            {/* Forecast Horizon Pills */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md w-full xl:w-auto">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">Forecast Horizon</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Synoptic Valid Range</span>
              </div>
              <div className="flex items-center p-space-xs bg-surface-container-high rounded-xl gap-space-xs w-full sm:w-auto overflow-x-auto">
                {[6, 12, 18, 24, 48].map((h) => (
                  <button
                    key={h}
                    onClick={() => setLeadTimeStep(h)}
                    className={`px-space-md py-space-xs rounded-lg font-telemetry-num text-body-sm transition-all ${
                      leadTimeStep === h
                        ? 'bg-primary text-on-primary font-semibold shadow-[0_2px_8px_rgba(152,67,0,0.3)]'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    T+{h < 10 ? `0${h}` : h}h {leadTimeStep === h ? '(Active)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 7-Phase Atmospheric Logic Chain Pathway Banner */}
          <div className="w-full p-space-md rounded-xl bg-surface-container-low shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between min-w-[1040px] text-center gap-space-sm px-space-sm">
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-label-caps uppercase text-outline">Phase 01</span>
                <span className="font-headline-sm text-body-md font-semibold text-on-surface">Model Inputs (4)</span>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">arrow_forward</span>
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-label-caps uppercase text-outline">Phase 02</span>
                <span className="font-headline-sm text-body-md font-semibold text-on-surface">Physical Normalization</span>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">arrow_forward</span>
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-label-caps uppercase text-outline">Phase 03</span>
                <span className="font-headline-sm text-body-md font-semibold text-primary">Weather Regime Detection</span>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">arrow_forward</span>
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-label-caps uppercase text-outline">Phase 04</span>
                <span className="font-headline-sm text-body-md font-semibold text-on-surface">Model Skill + Horizon</span>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">arrow_forward</span>
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-label-caps uppercase text-outline">Phase 05</span>
                <span className="font-headline-sm text-body-md font-semibold text-secondary">Adaptive Gating Matrix</span>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">arrow_forward</span>
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-label-caps uppercase text-outline">Phase 06</span>
                <span className="font-headline-sm text-body-md font-semibold text-primary">Dynamic Weights</span>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">arrow_forward</span>
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-label-caps uppercase text-outline">Phase 07</span>
                <span className="font-headline-sm text-body-md font-semibold text-on-surface">SAMVAYA Consensus</span>
              </div>
            </div>
          </div>

          {/* 3-Column Lab Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            
            {/* LEFT COLUMN: Model Inputs & Benchmarks (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col gap-space-lg">
              <div className="p-space-lg rounded-xl bg-surface-container shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-caps text-label-caps uppercase text-outline">Ingestion Vectors</span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">MODEL INPUTS</h2>
                  </div>
                  <span className="px-space-sm py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-caps text-label-caps">4 / 4 ONLINE</span>
                </div>

                <div className="flex flex-col gap-space-sm">
                  {/* Model 1: AIFS */}
                  <div className="p-space-md rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="font-headline-sm text-body-md font-bold text-on-surface">AIFS (ECMWF AI)</span>
                      </div>
                      <span className="px-space-xs py-0.5 rounded bg-surface-container-high font-label-caps text-label-caps text-on-surface-variant uppercase">Neural NWP</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-space-xs">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Pred: <strong className="font-telemetry-num text-headline-sm text-primary">{aifsPred.toFixed(1)}°C</strong></span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Skill: <strong className="font-telemetry-num text-on-surface">0.91</strong></span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-space-xs">
                      <div className="bg-primary h-full rounded-full" style={{ width: '91%' }}></div>
                    </div>
                  </div>

                  {/* Model 2: ECMWF IFS */}
                  <div className="p-space-md rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        <span className="font-headline-sm text-body-md font-bold text-on-surface">ECMWF IFS (9km)</span>
                      </div>
                      <span className="px-space-xs py-0.5 rounded bg-surface-container-high font-label-caps text-label-caps text-on-surface-variant uppercase">Hydrodynamic</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-space-xs">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Pred: <strong className="font-telemetry-num text-headline-sm text-secondary">{ecmwfPred.toFixed(1)}°C</strong></span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Skill: <strong className="font-telemetry-num text-on-surface">0.94</strong></span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-space-xs">
                      <div className="bg-secondary h-full rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>

                  {/* Model 3: GFS */}
                  <div className="p-space-md rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="w-2 h-2 rounded-full bg-outline"></span>
                        <span className="font-headline-sm text-body-md font-bold text-on-surface">GFS (NOAA 13km)</span>
                      </div>
                      <span className="px-space-xs py-0.5 rounded bg-surface-container-high font-label-caps text-label-caps text-on-surface-variant uppercase">Deterministic</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-space-xs">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Pred: <strong className="font-telemetry-num text-headline-sm text-on-surface">{gfsPred.toFixed(1)}°C</strong></span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Skill: <strong className="font-telemetry-num text-on-surface">0.88</strong></span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-space-xs">
                      <div className="bg-outline h-full rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>

                  {/* Model 4: ICON / GEM */}
                  <div className="p-space-md rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                        <span className="font-headline-sm text-body-md font-bold text-on-surface">ICON / GEM (Global)</span>
                      </div>
                      <span className="px-space-xs py-0.5 rounded bg-surface-container-high font-label-caps text-label-caps text-on-surface-variant uppercase">Ensemble NWP</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-space-xs">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Pred: <strong className="font-telemetry-num text-headline-sm text-tertiary">{iconPred.toFixed(1)}°C</strong></span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Skill: <strong className="font-telemetry-num text-on-surface">0.86</strong></span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-space-xs">
                      <div className="bg-tertiary h-full rounded-full" style={{ width: '86%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benchmark Table */}
              <div className="p-space-lg rounded-xl bg-surface-container shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-caps text-label-caps uppercase text-outline">Empirical Matrix</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">SKILL BENCHMARK</h3>
                  </div>
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">30-Day Rolling</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-telemetry-num text-body-sm">
                    <thead>
                      <tr className="text-outline font-label-caps text-label-caps uppercase">
                        <th className="pb-space-xs">Model</th>
                        <th className="pb-space-xs text-right">MAE</th>
                        <th className="pb-space-xs text-right">Skill</th>
                        <th className="pb-space-xs text-right text-primary">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-highest">
                      <tr>
                        <td className="py-space-xs font-semibold text-on-surface">AIFS</td>
                        <td className="py-space-xs text-right text-on-surface-variant">1.2</td>
                        <td className="py-space-xs text-right text-secondary font-medium">91%</td>
                        <td className="py-space-xs text-right text-primary font-bold">{aifsWt}%</td>
                      </tr>
                      <tr>
                        <td className="py-space-xs font-semibold text-on-surface">ECMWF</td>
                        <td className="py-space-xs text-right text-on-surface-variant">1.0</td>
                        <td className="py-space-xs text-right text-secondary font-medium">94%</td>
                        <td className="py-space-xs text-right text-primary font-bold">{ecmwfWt}%</td>
                      </tr>
                      <tr>
                        <td className="py-space-xs font-semibold text-on-surface">GFS</td>
                        <td className="py-space-xs text-right text-on-surface-variant">1.4</td>
                        <td className="py-space-xs text-right text-secondary font-medium">88%</td>
                        <td className="py-space-xs text-right text-on-surface font-semibold">{gfsWt}%</td>
                      </tr>
                      <tr>
                        <td className="py-space-xs font-semibold text-on-surface">ICON</td>
                        <td className="py-space-xs text-right text-on-surface-variant">1.5</td>
                        <td className="py-space-xs text-right text-secondary font-medium">86%</td>
                        <td className="py-space-xs text-right text-on-surface font-semibold">{iconWt}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* CENTER COLUMN: Variable HUD & Cesium Viewport (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-space-md">
              <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container-highest shadow-md p-space-md flex flex-col gap-space-md">
                <div className="flex items-center justify-between p-space-xs rounded-xl bg-surface-container-lowest/90 backdrop-blur-md shadow-sm overflow-x-auto">
                  {['temperature', 'precipitation', 'wind', 'pressure', 'trust_map'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setActiveVar(v)}
                      className={`px-space-sm py-1 rounded-lg font-label-caps text-label-caps uppercase transition-colors ${
                        activeVar === v ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {v.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <CesiumGlobe height="420px" showHud={false} />
              </div>

              {/* Stability Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                <div className="p-space-md rounded-xl bg-surface-container shadow-sm flex flex-col gap-space-xs">
                  <span className="font-label-caps text-label-caps uppercase text-outline">Consensus Spread</span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">1.5°C</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Δ</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-secondary">Tight bounds</span>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container shadow-sm flex flex-col gap-space-xs">
                  <span className="font-label-caps text-label-caps uppercase text-outline">Model Agreement</span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-headline-sm text-headline-sm font-bold text-primary">Moderate</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">74%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-primary h-full rounded-full" style={{ width: '74%' }}></div>
                  </div>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container shadow-sm flex flex-col gap-space-xs">
                  <span className="font-label-caps text-label-caps uppercase text-outline">Gating Cadence</span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">3-Hourly</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">T+18h</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Next in 42m</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Consensus Core & Weights (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-space-lg">
              <div className="p-space-lg rounded-2xl bg-surface-container shadow-md flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[22px]">auto_graph</span>
                    <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider font-bold">SAMVAYA Consensus Core</span>
                  </div>
                  <span className="px-space-md py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-telemetry-num text-body-sm font-semibold">HIGH CONFIDENCE · 87%</span>
                </div>

                <div className="flex items-baseline justify-between pt-space-xs">
                  <div>
                    <span className="font-display-lg text-display-lg font-bold text-on-surface tracking-tight">{consensusTemp.toFixed(1)}°C</span>
                    <span className="font-body-md text-body-md text-on-surface-variant ml-space-xs">Target</span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-caps text-label-caps uppercase text-outline block">Confidence Interval</span>
                    <span className="font-telemetry-num text-headline-sm text-on-surface font-semibold">28.4°C — 30.1°C</span>
                  </div>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-high flex flex-col gap-space-xs">
                  <span className="font-label-caps text-label-caps uppercase text-outline">Dynamic Synthesis</span>
                  <p className="font-telemetry-num text-body-sm text-on-surface leading-relaxed">
                    (AIFS {aifsPred.toFixed(1)}° × <strong className="text-primary">{aifsWt}%</strong>) + 
                    (ECMWF {ecmwfPred.toFixed(1)}° × <strong className="text-secondary">{ecmwfWt}%</strong>) + 
                    (GFS {gfsPred.toFixed(1)}° × <strong className="text-outline">{gfsWt}%</strong>) + 
                    (ICON {iconPred.toFixed(1)}° × <strong className="text-tertiary">{iconWt}%</strong>) 
                    <span className="font-bold text-primary block mt-1">➔ SAMVAYA Output</span>
                  </p>
                </div>
              </div>

              {/* Dynamic Adaptive Weights Breakdown */}
              <div className="p-space-lg rounded-xl bg-surface-container shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps uppercase text-outline">Influence Allocation</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">ADAPTIVE MODEL WEIGHTS</h3>
                </div>

                <div className="flex flex-col gap-space-md">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="font-semibold text-on-surface">AIFS (ECMWF Graph Neural)</span>
                      <span className="font-telemetry-num text-headline-sm text-primary font-bold">{aifsWt}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${aifsWt}%` }}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="font-semibold text-on-surface">ECMWF IFS (Deterministic 9km)</span>
                      <span className="font-telemetry-num text-headline-sm text-secondary font-bold">{ecmwfWt}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: `${ecmwfWt}%` }}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="font-semibold text-on-surface">GFS (NOAA 13km Global)</span>
                      <span className="font-telemetry-num text-headline-sm text-on-surface font-bold">{gfsWt}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                      <div className="bg-outline h-full rounded-full transition-all duration-500" style={{ width: `${gfsWt}%` }}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="font-semibold text-on-surface">ICON / GEM (Global Grid)</span>
                      <span className="font-telemetry-num text-headline-sm text-tertiary font-bold">{iconWt}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                      <div className="bg-tertiary h-full rounded-full transition-all duration-500" style={{ width: `${iconWt}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-sm mt-space-xs">
                  <span className="font-label-caps text-label-caps uppercase text-primary tracking-wide font-bold">Why These Weights? Context Signals</span>
                  <div className="grid grid-cols-2 gap-space-sm font-telemetry-num text-body-sm">
                    <div className="flex flex-col"><span className="text-outline font-label-caps text-label-caps">Weather Regime</span><span className="font-semibold text-on-surface">Convective: 80%</span></div>
                    <div className="flex flex-col"><span className="text-outline font-label-caps text-label-caps">Historical Skill</span><span className="font-semibold text-on-surface">ECMWF / AIFS: 94%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Linear Spectrum Dispersion Track */}
          <div className="p-space-lg rounded-2xl bg-surface-container shadow-sm flex flex-col justify-between gap-space-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-outline">Dispersion Analysis</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">WHAT THE MODELS PREDICT</h3>
              </div>
              <div className="flex items-center gap-space-sm font-telemetry-num text-body-sm">
                <span className="font-label-caps text-label-caps uppercase text-outline">Range Delta:</span>
                <span className="font-semibold text-primary">1.5°C</span>
              </div>
            </div>

            <div className="relative w-full py-space-xl flex flex-col justify-center">
              <div className="w-full h-3 bg-surface-container-highest rounded-full relative overflow-visible shadow-inner">
                <div className="absolute h-full bg-primary/20 rounded-full" style={{ left: '25.7%', width: '48.5%' }}></div>
              </div>

              {/* Markers */}
              <div className="absolute -top-1 flex flex-col items-center -translate-x-1/2" style={{ left: `${calcPct(ecmwfPred)}%` }}>
                <span className="px-space-xs py-0.5 rounded bg-surface-container-lowest text-secondary font-telemetry-num text-body-sm font-bold shadow-sm mb-1">{ecmwfPred.toFixed(1)}°</span>
                <div className="w-4 h-4 rounded-full bg-secondary border-2 border-surface-container-lowest shadow-sm"></div>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase mt-1">ECMWF</span>
              </div>

              <div className="absolute top-2 flex flex-col items-center -translate-x-1/2" style={{ left: `${calcPct(iconPred)}%` }}>
                <div className="w-3.5 h-3.5 rounded-full bg-tertiary border-2 border-surface-container-lowest shadow-sm"></div>
                <span className="px-space-xs py-0.5 rounded bg-surface-container-lowest text-tertiary font-telemetry-num text-[11px] font-semibold shadow-sm mt-1">{iconPred.toFixed(1)}° ICON</span>
              </div>

              <div className="absolute -top-4 flex flex-col items-center -translate-x-1/2 z-20" style={{ left: `${calcPct(consensusTemp)}%` }}>
                <span className="px-space-sm py-1 rounded-md bg-primary text-on-primary font-telemetry-num text-body-sm font-bold shadow-md mb-1 animate-bounce">{consensusTemp.toFixed(1)}° SAMVAYA</span>
                <div className="w-5 h-5 rounded-full bg-primary border-2 border-surface-container-lowest shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-on-primary"></div>
                </div>
              </div>

              <div className="absolute -top-1 flex flex-col items-center -translate-x-1/2" style={{ left: `${calcPct(aifsPred)}%` }}>
                <span className="px-space-xs py-0.5 rounded bg-surface-container-lowest text-primary font-telemetry-num text-body-sm font-bold shadow-sm mb-1">{aifsPred.toFixed(1)}°</span>
                <div className="w-4 h-4 rounded-full bg-primary border-2 border-surface-container-lowest shadow-sm"></div>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase mt-1">AIFS</span>
              </div>

              <div className="absolute -top-1 flex flex-col items-center -translate-x-1/2" style={{ left: `${calcPct(gfsPred)}%` }}>
                <span className="px-space-xs py-0.5 rounded bg-surface-container-lowest text-outline font-telemetry-num text-body-sm font-bold shadow-sm mb-1">{gfsPred.toFixed(1)}°</span>
                <div className="w-4 h-4 rounded-full bg-outline border-2 border-surface-container-lowest shadow-sm"></div>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase mt-1">GFS</span>
              </div>

              <div className="w-full flex justify-between text-outline font-telemetry-num text-body-sm pt-space-xl">
                <span>27.5°C</span>
                <span>28.5°C</span>
                <span className="text-primary font-semibold">{consensusTemp.toFixed(1)}°C (Consensus)</span>
                <span>30.0°C</span>
                <span>31.0°C</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
