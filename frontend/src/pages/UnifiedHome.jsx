/**
 * SAMVAYA Unified Atmospheric Home Page (React JSX)
 * Authoritative Stitch Screen: samvaya_unified_atmospheric_home
 * Project SIH26081 • Team NIE KAVACH
 */

import React, { useState } from 'react';
import { useAtmospheric } from '../context/AtmosphericContext';
import CesiumGlobe from '../components/CesiumGlobe';

export default function UnifiedHome() {
  const { location, selectStation, snapshot, setCurrentScreen } = useAtmospheric();
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const consensusTemp = snapshot?.forecast?.[0] !== undefined ? snapshot.forecast[0] : 28.4;
  const weights = snapshot?.weights || { 'ECMWF IFS': 0.35, 'GFS': 0.25, 'ICON': 0.20, 'GEM': 0.20 };
  const aifsWt = Math.round((weights['ECMWF AIFS'] || weights['AIFS'] || 0.41) * 100);
  const ecmwfWt = Math.round((weights['ECMWF IFS'] || weights['ECMWF'] || 0.32) * 100);
  const gfsWt = Math.round((weights['GFS'] || 0.18) * 100);
  const iconWt = Math.round((weights['ICON'] || weights['GEFS'] || 0.09) * 100);

  const handleAiQuery = (query) => {
    if (!query || !query.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      let text = '';
      const q = query.toLowerCase();
      if (q.includes('rain') || q.includes('precipitation')) {
        text = `Current model consensus indicates a 64% probability of convective precipitation over ${location.name}. ECMWF IFS and AIFS neural align on boundary layer moisture convergence with estimated depths between 12mm and 28mm localized.`;
      } else if (q.includes('confidence') || q.includes('why')) {
        text = `Confidence is assessed at 91% (HIGH) due to phase-locked consensus between 3 of 4 operational engines (ECMWF IFS, AIFS, ICON). Thermodynamic 2m temperatures exhibit an exceptionally narrow spread of ±0.4°C across all ensemble members.`;
      } else if (q.includes('disagree') || q.includes('gfs')) {
        text = `NOAA GFS indicates a slight warm bias (+1.2°C) in the boundary layer and predicts convective onset 2.5 hours later than ECMWF AIFS. SAMVAYA adaptive gating automatically down-weights GFS to 18% based on rolling 30-day verified orographic skill.`;
      } else {
        text = `Atmospheric state over ${location.name} is governed by a stable convective regime with moderate moisture inflow. SAMVAYA weighted consensus projects surface temperature at ${consensusTemp.toFixed(1)}°C with steady barometric pressure at 1008.2 hPa.`;
      }
      setAiResponse(text);
      setIsAiLoading(false);
    }, 600);
  };

  return (
    <div className="relative w-full overflow-hidden px-margin-mobile md:px-margin py-space-lg flex flex-col gap-space-xl">
      {/* Ambient Gradients */}
      <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-96 right-0 w-[420px] h-[420px] bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. Master Hero & Synoptic Anchor Section */}
      <section className="relative flex flex-col gap-space-lg">
        <div className="flex items-center gap-space-sm flex-wrap">
          <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
            DIRECTORATE OF ATMOSPHERIC CONVERGENCE
          </span>
          <span className="text-on-surface-variant text-label-caps font-label-caps uppercase tracking-wider">· MESO-NUMERICAL ENGINE SIH26081</span>
          <span className="text-on-surface-variant text-label-caps font-label-caps uppercase tracking-wider">· SYNOPTIC CYCLE 12:00Z</span>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
          <div className="max-w-4xl flex flex-col gap-space-xs">
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight uppercase font-bold leading-tight">
              THE ATMOSPHERE, <br className="hidden sm:inline" />AS IT IS NOW.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Multiple atmospheric forecast sources converge into one adaptive, explainable consensus—fusing neural meso-transformers, operational numerical physics, and autonomous surface telemetry.
            </p>
          </div>

          {/* Quick Presets Mode */}
          <div className="flex items-center p-1 rounded-full bg-surface-container-high shadow-inner shrink-0 self-start xl:self-end">
            <button className="flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container-lowest text-primary font-body-sm text-body-sm font-semibold shadow-sm transition-all">
              <span className="material-symbols-outlined text-[16px]">my_location</span>
              <span>Local Synoptic</span>
            </button>
            <button 
              onClick={() => setCurrentScreen('global-discovery')}
              className="flex items-center gap-1.5 px-space-md py-1.5 rounded-full text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">public</span>
              <span>Planetary Global</span>
            </button>
          </div>
        </div>

        {/* Observatory Anchor Card */}
        <div className="rounded-xl bg-surface-container-lowest p-space-md md:p-space-lg shadow-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md min-w-0">
            <div className="w-14 h-14 rounded-xl bg-primary-fixed flex flex-col items-center justify-center text-on-primary-fixed shrink-0 shadow-sm font-bold text-[22px]">
              {consensusTemp.toFixed(0)}°
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">{location.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-label-caps uppercase">{location.awsId}</span>
                <span className="text-on-surface-variant font-label-caps text-label-caps">{Math.abs(location.latitude).toFixed(2)}° N, {Math.abs(location.longitude).toFixed(2)}° E · ELEV {location.elevation}</span>
              </div>
              <div className="flex items-center gap-space-sm text-body-sm font-body-sm text-on-surface-variant mt-1 flex-wrap">
                <span className="font-semibold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">cloud</span>
                  <span>Partly Cloudy · Inflow Banding</span>
                </span>
                <span>·</span>
                <span>Baro: 1008.2 hPa (Steady)</span>
                <span>·</span>
                <span className="text-secondary font-medium">Updated 18:42 IST · Live Synop</span>
              </div>
            </div>
          </div>

          {/* Quick Switcher Stations */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0 shrink-0">
            <button
              onClick={() => selectStation(12.2958, 76.6394, 'Mysuru, Karnataka, India', 'AWS #43285', '763M')}
              className={`px-space-md py-1.5 rounded-full font-body-sm text-body-sm font-medium shadow-sm shrink-0 flex items-center gap-1 ${
                location.name.includes('Mysuru')
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest"></span>
              <span>Mysuru</span>
            </button>
            <button
              onClick={() => selectStation(12.9716, 77.5946, 'Bengaluru, Karnataka, India', 'AWS #43290', '920M')}
              className={`px-space-md py-1.5 rounded-full font-body-sm text-body-sm transition-all shrink-0 ${
                location.name.includes('Bengaluru')
                  ? 'bg-primary text-on-primary font-medium'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
              }`}
            >
              Bengaluru 25.2°C
            </button>
            <button
              onClick={() => selectStation(12.9141, 74.8560, 'Mangaluru, Coastal Karnataka', 'AWS #43271', '22M')}
              className={`px-space-md py-1.5 rounded-full font-body-sm text-body-sm transition-all shrink-0 ${
                location.name.includes('Mangaluru')
                  ? 'bg-primary text-on-primary font-medium'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
              }`}
            >
              Mangaluru 29.1°C
            </button>
            <button
              onClick={() => selectStation(17.3850, 78.4867, 'Hyderabad, Telangana, India', 'AWS #43128', '542M')}
              className={`px-space-md py-1.5 rounded-full font-body-sm text-body-sm transition-all shrink-0 ${
                location.name.includes('Hyderabad')
                  ? 'bg-primary text-on-primary font-medium'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
              }`}
            >
              Hyderabad 31.4°C
            </button>
          </div>
        </div>
      </section>

      {/* 2. Centerpiece 3D Interactive Earth Cockpit (Cesium) */}
      <CesiumGlobe height="620px" showHud={true} />

      {/* 3. Signature SAMVAYA Adaptive Consensus Engine Card */}
      <section className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-md flex flex-col gap-space-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest font-semibold">SYNOPTIC FUSION MATRIX</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">ONE FORECAST. MANY SIGNALS.</h2>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="px-space-md py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-label-caps uppercase font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              SAMVAYA GATING: ACTIVE
            </span>
            <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">CYCLE 12Z-RUN</span>
          </div>
        </div>

        {/* Narrative Atmospheric Synthesis */}
        <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-start gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">air</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Consensus Atmospheric Synopsis</span>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Tonight: Cloud cover deepens along the Nilgiri gap, channeling moist maritime inflow with moderate convective rain developing after midnight (02:00–06:00 IST). Peak precipitation intensity expected over southern sub-basins.
            </p>
          </div>
        </div>

        {/* 5 Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-space-sm">
          <div className="p-space-md rounded-xl bg-surface-container flex flex-col justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Consensus Rain Prob</span>
            <div className="my-1"><span className="font-headline-lg text-headline-lg text-primary font-bold">64%</span></div>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Envelope: 58% – 72%</span>
          </div>
          <div className="p-space-md rounded-xl bg-surface-container flex flex-col justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Temp Corridor</span>
            <div className="my-1"><span className="font-headline-lg text-headline-lg text-on-surface font-bold">24.2° – 28.4°</span></div>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Tight 0.6°C spread</span>
          </div>
          <div className="p-space-md rounded-xl bg-surface-container flex flex-col justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Surface Wind Corridor</span>
            <div className="my-1"><span className="font-headline-lg text-headline-lg text-on-surface font-bold">14 – 22 km/h</span></div>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Vector: WSW (Gusts 34)</span>
          </div>
          <div className="p-space-md rounded-xl bg-surface-container flex flex-col justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Forecast Confidence</span>
            <div className="my-1 flex items-baseline gap-1">
              <span className="font-headline-lg text-headline-lg text-secondary font-bold">91%</span>
              <span className="font-label-caps text-label-caps font-bold text-secondary uppercase">HIGH</span>
            </div>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Bayesian Entropy: Low</span>
          </div>
          <div className="col-span-2 md:col-span-1 p-space-md rounded-xl bg-surface-container flex flex-col justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Multi-Model Agreement</span>
            <div className="my-1 flex items-center gap-1.5">
              <span className="font-headline-md text-headline-md text-on-surface font-bold">HIGH</span>
              <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
            </div>
            <span className="font-body-sm text-[11px] text-on-surface-variant">3 of 4 engines phase-locked</span>
          </div>
        </div>

        {/* Dynamic Multi-Engine Weight Distribution */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant font-semibold tracking-wider">Dynamic Multi-Engine Weight Distribution (Adaptive Gating)</span>
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">Consensus Weights Sum: 100%</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-sm">
            <div className="p-space-md rounded-xl bg-surface-container-high flex flex-col gap-space-xs relative overflow-hidden shadow-sm">
              <div className="h-1 bg-primary absolute top-0 left-0 right-0"></div>
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm font-bold text-on-surface">ECMWF AIFS Neural</span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">{aifsWt}%</span>
              </div>
              <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">0.25° Meso-Transformer · AI Hybrid</span>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${aifsWt}%` }}></div>
              </div>
              <span className="font-body-sm text-[11px] text-primary font-medium mt-1">Lead Gating Weight</span>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs relative overflow-hidden">
              <div className="h-1 bg-secondary absolute top-0 left-0 right-0"></div>
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm font-bold text-on-surface">ECMWF IFS Physics</span>
                <span className="font-headline-sm text-headline-sm font-bold text-secondary">{ecmwfWt}%</span>
              </div>
              <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">9km HRES 137-Level Hydrodynamic</span>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: `${ecmwfWt}%` }}></div>
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant mt-1">Mass Conservation Core</span>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs relative overflow-hidden">
              <div className="h-1 bg-outline-variant absolute top-0 left-0 right-0"></div>
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm font-bold text-on-surface">NOAA GFS Physics</span>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{gfsWt}%</span>
              </div>
              <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">13km Finite-Volume (FV3)</span>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-outline h-full rounded-full transition-all duration-500" style={{ width: `${gfsWt}%` }}></div>
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant mt-1">Continental Boundary Anchor</span>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs relative overflow-hidden">
              <div className="h-1 bg-outline-variant absolute top-0 left-0 right-0"></div>
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm font-bold text-on-surface">ICON / GEM Global</span>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{iconWt}%</span>
              </div>
              <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">Non-hydrostatic Triangular Grid</span>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-outline h-full rounded-full transition-all duration-500" style={{ width: `${iconWt}%` }}></div>
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant mt-1">Probabilistic Tail Enveloping</span>
            </div>
          </div>
        </div>

        {/* Explainable AI Reasoning Box */}
        <div className="p-space-md rounded-xl bg-surface-container-high shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1 max-w-4xl">
            <div className="flex items-center gap-1.5 text-primary font-bold font-label-caps text-label-caps uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              WHY THIS FORECAST? — EXPLAINABLE AI REASONING
            </div>
            <p className="font-body-sm text-body-sm text-on-surface">
              Thermodynamic surface temperatures show near-perfect agreement (±0.4°C spread). Convective initiation timing exhibits moderate spread between Neural AIFS (03:00 IST onset) and hydrodynamic GFS (05:30 IST onset). SAMVAYA Kalman gating assigns highest weight ({aifsWt}%) to AIFS due to superior recent empirical skill (0.88 POD) in orographic lee environments.
            </p>
          </div>
          <div className="flex items-center gap-space-xs shrink-0 self-stretch sm:self-auto justify-end">
            <button 
              onClick={() => setCurrentScreen('model-lab')}
              className="px-space-md py-1.5 rounded-full bg-primary text-on-primary font-body-sm text-body-sm font-medium transition-all shadow-sm flex items-center gap-1"
            >
              <span>Explore Intelligence</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Next 24 Hours & 4D Temporal Synoptic Deck */}
      <section className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-md flex flex-col gap-space-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-secondary font-bold tracking-wider">CHRONOLOGICAL DISCLOSURE</span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">NEXT 24 HOURS &amp; 4D TEMPORAL SYNOPTIC DECK</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm">
          {[
            { step: 'NOW (18:00)', temp: '28.0°C', cond: 'Partly Cloudy', rain: '32%', wind: '14 km/h', icon: 'partly_cloudy_day', alert: false },
            { step: '+3H (21:00)', temp: '26.8°C', cond: 'Thickening', rain: '44%', wind: '12 km/h', icon: 'cloud', alert: false },
            { step: 'PEAK (02-06H)', temp: '24.0°C', cond: 'Convective Rain', rain: '64%', wind: '22 km/h', icon: 'rainy', alert: true },
            { step: '+12H DAWN', temp: '24.8°C', cond: 'Stratiform Showers', rain: '52%', wind: '16 km/h', icon: 'weather_mix', alert: false },
            { step: '+18H NOON', temp: '26.5°C', cond: 'Solar Gain', rain: '28%', wind: '14 km/h', icon: 'wb_sunny', alert: false },
            { step: '+24H OUTLOOK', temp: '27.4°C', cond: 'Clearing', rain: '18%', wind: '12 km/h', icon: 'cloud_done', alert: false }
          ].map((c, i) => (
            <div 
              key={i}
              className={`p-space-md rounded-xl flex flex-col justify-between gap-space-sm shadow-sm hover:scale-[1.02] transition-transform cursor-pointer ${
                c.alert ? 'bg-primary-fixed text-on-primary-fixed shadow-md' : 'bg-surface-container'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps font-bold uppercase">{c.step}</span>
                {c.alert && <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[9px] font-bold">ALERT</span>}
              </div>
              <div className="flex flex-col items-center py-2 text-center">
                <span className="material-symbols-outlined text-[32px]">{c.icon}</span>
                <span className="font-headline-md text-headline-md font-bold mt-1">{c.temp}</span>
                <span className="font-body-sm text-[11px]">{c.cond}</span>
              </div>
              <div className="flex flex-col gap-1 text-[11px] opacity-80">
                <div className="flex items-center justify-between"><span>Rain Prob</span><span className="font-bold">{c.rain}</span></div>
                <div className="flex items-center justify-between"><span>Surface Wind</span><span className="font-bold">{c.wind}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Master Product Navigation Matrix (8 Subsystems) */}
      <section className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold tracking-widest">SAMVAYA SUITE ARCHITECTURE</span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">DISCOVER PLATFORM CAPABILITIES</h3>
          </div>
          <span className="text-on-surface-variant font-label-caps text-label-caps uppercase hidden sm:inline">8 SPECIALIZED SUBSYSTEMS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
          {[
            { id: 'location-explorer', title: 'Forecast Explorer', desc: 'Deep localized station telemetry, Skew-T soundings, and boundary layer thermodynamics.', icon: 'radar', color: 'text-primary' },
            { id: 'model-lab', title: 'Model Intelligence', desc: 'Multi-model divergence tracking, neural vs NWP hydrodynamic comparisons, and Kalman weights.', icon: 'neurology', color: 'text-primary' },
            { id: 'extreme-weather', title: 'Extreme Weather', desc: 'Severe atmospheric alerts, flash hydraulic thresholds, squall lines, and civil risk vectors.', icon: 'crisis_alert', color: 'text-error' },
            { id: 'global-discovery', title: 'Global Discovery', desc: '4D planetary Earth view, jet stream Rossby waves, teleconnections, and macro vortices.', icon: 'globe_uk', color: 'text-secondary' },
            { id: 'forecast-replay', title: 'Forecast Replay', desc: 'Historical synoptic cycle scrubber, retroactive accuracy verification, and bias scoring.', icon: 'history_toggle_off', color: 'text-on-surface-variant' },
            { id: 'comparison-workspace', title: 'Compare Locations', desc: 'Multi-observatory spatial comparison workspace with synchronized temporal scrubbing.', icon: 'compare', color: 'text-tertiary' },
            { id: 'daily-briefing', title: 'Daily Briefing', desc: 'Executive narrative synthesis prepared for hydrologic engineers, agriculture, and civic leads.', icon: 'newspaper', color: 'text-primary' },
            { id: 'transparency-center', title: 'Data Transparency', desc: 'Ingestion telemetry pipelines, telemetry node health, satellite latency, and model provenance.', icon: 'format_image_left', color: 'text-secondary' },
          ].map((card, i) => (
            <div
              key={i}
              onClick={() => setCurrentScreen(card.id)}
              className="p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-all flex flex-col justify-between gap-space-sm group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className={`w-9 h-9 rounded-lg bg-surface-container-lowest ${card.color} flex items-center justify-center shadow-sm`}>
                  <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                </span>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px] group-hover:translate-x-0.5 transition-transform">north_east</span>
              </div>
              <div>
                <h5 className="font-headline-sm text-[16px] leading-tight font-bold text-on-surface">{card.title}</h5>
                <p className="font-body-sm text-[12px] text-on-surface-variant mt-1">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Ask SAMVAYA Synoptic AI Assistant Bar */}
      <section className="rounded-2xl bg-surface-container-high p-space-md md:p-space-lg shadow-md flex flex-col gap-space-md">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Ask SAMVAYA Synoptic AI</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Natural-language meteorological reasoning over thermodynamic states and model weights</span>
          </div>
        </div>

        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-space-md text-primary text-[22px]">psychology</span>
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiQuery(aiPrompt)}
            placeholder="Query atmospheric dynamics, model consensus, or risk probability for any coordinate..."
            className="w-full pl-12 pr-28 py-3.5 rounded-full bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            type="text"
          />
          <button
            onClick={() => handleAiQuery(aiPrompt)}
            className="absolute right-1.5 px-space-md py-2 rounded-full bg-primary text-on-primary font-body-sm text-body-sm font-semibold hover:bg-primary-container transition-all flex items-center gap-1 shadow-sm"
          >
            <span>Query</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-space-xs flex-wrap">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Suggested:</span>
          {[
            'Will it rain in Mysuru tonight?',
            'Why is confidence 91%?',
            'What are GFS and AIFS disagreeing on?',
            'Is flash flood risk active in Mysore district?'
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => { setAiPrompt(prompt); handleAiQuery(prompt); }}
              className="px-3 py-1 rounded-full bg-surface-container-lowest hover:bg-surface-variant text-on-surface font-body-sm text-body-sm transition-all shadow-sm"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* AI Output */}
        {isAiLoading && (
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm mt-space-sm border-l-4 border-primary">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5 animate-spin">sync</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Synthesizing meteorological reasoning...</span>
          </div>
        )}

        {aiResponse && (
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-space-sm mt-space-sm border-l-4 border-primary">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">psychology</span>
            <div className="flex flex-col">
              <span className="font-headline-sm text-body-sm font-bold text-on-surface">SAMVAYA Synoptic AI Response</span>
              <p className="font-body-sm text-body-sm text-on-surface mt-1">{aiResponse}</p>
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider mt-2">Source: 4D-Var Hybrid Ensemble · SIH26081 Reasoning Engine</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
