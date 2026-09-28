import React, { useState } from 'react';
import { useAtmosphere } from '../context/AtmosphericContext';
import CesiumGlobe from '../components/CesiumGlobe';
import { 
  Globe, Shield, Cpu, Activity, Compass, Wind, Droplets, Zap, 
  ArrowRight, Search, Play, CheckCircle2, ChevronRight, BarChart3,
  Layers, Database, Sparkles, TrendingUp, AlertTriangle
} from 'lucide-react';

export default function DesktopLanding() {
  const { 
    activeLocation, 
    liveSnapshot, 
    backendHealthy,
    setCurrentScreen,
    models,
    activeLayer,
    setActiveLayer
  } = useAtmosphere();

  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans selection:bg-terracotta selection:text-white pb-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Ensemble Fusion v3.2</span>
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-ping"></span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Atmospheric <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta via-amber-600 to-terracotta">
                Certainty
              </span> Through Physics & Fusion.
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              SAMVAYA combines ECMWF IFS, NOAA GFS, DWD ICON, and CMC GEM into a verified, 
              bias-corrected super-ensemble delivering real-time synoptic intelligence for mission-critical operations.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={() => setCurrentScreen('unified_home')}
                className="px-6 py-3.5 rounded-xl bg-terracotta text-white font-semibold shadow-lg shadow-terracotta/25 hover:bg-terracotta-dark transition-all flex items-center gap-2 group"
              >
                <span>Launch Unified Cockpit</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => setCurrentScreen('model_lab')}
                className="px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm hover:border-terracotta/40 hover:text-terracotta transition-all flex items-center gap-2"
              >
                <Cpu className="w-4 h-4 text-terracotta" />
                <span>Explore Model Lab</span>
              </button>
            </div>

            {/* Key Metrics Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
              <div>
                <div className="text-2xl font-black text-slate-900">4 Core</div>
                <div className="text-xs text-slate-500 font-medium">NWP Super-Models</div>
              </div>
              <div>
                <div className="text-2xl font-black text-terracotta">94.8%</div>
                <div className="text-xs text-slate-500 font-medium">Historical Reliability</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">0.05°</div>
                <div className="text-xs text-slate-500 font-medium">Global Mesh Resolution</div>
              </div>
            </div>
          </div>

          {/* Right Hero Cesium 3D Globe Viewport */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-950 p-2">
              <div className="h-[460px] w-full rounded-2xl overflow-hidden relative">
                <CesiumGlobe 
                  showControls={false} 
                  showHUD={true} 
                  activeLayer={activeLayer}
                  onLayerChange={setActiveLayer}
                  className="w-full h-full"
                />
              </div>

              {/* Floating Overlay Badge */}
              <div className="absolute top-6 left-6 bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl text-white max-w-xs pointer-events-none">
                <div className="flex items-center gap-2 text-xs font-semibold text-terracotta">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>SYNOPTIC REALTIME STREAM</span>
                </div>
                <div className="text-sm font-bold mt-1 text-slate-100">
                  {activeLocation.name} ({activeLocation.lat.toFixed(2)}°, {activeLocation.lon.toFixed(2)}°)
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                  <span>Temp: <strong className="text-white">{liveSnapshot.temperature.toFixed(1)}°C</strong></span>
                  <span>Wind: <strong className="text-white">{liveSnapshot.wind_speed.toFixed(1)} km/h</strong></span>
                  <span>Spread: <strong className="text-amber-400">±0.4°C</strong></span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4 Super Model Consensus Engine Showcase */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-terracotta mb-2">Multi-Agency Synthesis</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Fused from Global Operational Meteorological Leaders</h3>
            <p className="text-slate-600 text-sm mt-2">
              Every prediction is dynamically weighted against satellite sounding telemetry and localized ground truth stations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {models.map(m => (
              <div key={m.id} className="p-6 rounded-2xl bg-[#FAF8F5] border border-slate-200/80 hover:border-terracotta/50 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
                    {m.id.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>ONLINE</span>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-terracotta transition-colors">{m.name}</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">{m.agency} • {m.resolution} Grid</p>
                
                <div className="space-y-2 pt-3 border-t border-slate-200/60 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Ensemble Weight:</span>
                    <strong className="text-slate-900">{(m.weight * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Skill Score:</span>
                    <strong className="text-emerald-600">{m.skill}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Forecast Horizon:</span>
                    <strong className="text-slate-900">{m.horizon}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid & Capability Architecture */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-terracotta mb-2">Platform Capabilities</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Engineered for Meteorologists & Civil Defense</h3>
          </div>
          <button 
            onClick={() => setCurrentScreen('transparency_center')}
            className="mt-4 md:mt-0 text-sm font-semibold text-terracotta hover:underline inline-flex items-center gap-1"
          >
            <span>Inspect Transparency & Verification Protocols</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Extreme Weather Intelligence */}
          <div 
            onClick={() => setCurrentScreen('extreme_weather')}
            className="p-8 rounded-3xl bg-white border border-slate-200/80 hover:shadow-xl hover:border-terracotta/40 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-terracotta transition-colors">
              Extreme Weather Radar
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Instant convective storm detection, tropical cyclone trajectory tracking, and flash flood multi-model divergence alerts.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-terracotta">
              Open Severe Weather Deck <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Card 2: Replay & Verification Lab */}
          <div 
            onClick={() => setCurrentScreen('forecast_replay')}
            className="p-8 rounded-3xl bg-white border border-slate-200/80 hover:shadow-xl hover:border-terracotta/40 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-center text-terracotta mb-6 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-terracotta transition-colors">
              Replay & Verification Lab
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Historical reanalysis verification. Compare model predictions against actual IMD radar and automated weather stations.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-terracotta">
              Run Replay Simulation <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Card 3: Location Explorer */}
          <div 
            onClick={() => setCurrentScreen('location_explorer')}
            className="p-8 rounded-3xl bg-white border border-slate-200/80 hover:shadow-xl hover:border-terracotta/40 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-olive/10 border border-olive/20 flex items-center justify-center text-olive mb-6 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-terracotta transition-colors">
              Micro-Climate Explorer
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Deep dive into hyper-local atmospheric soundings, skew-T thermodynamic profiles, and multi-model variance spreads.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-terracotta">
              Explore Mysuru & Regional Stations <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

        </div>
      </section>

      {/* Newsletter / Institutional Access Callout */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 lg:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              Ready for Operational Grade Atmospheric Certainty?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Subscribe for institutional updates, automated synoptic alerts, and API key access to the multi-model fusion pipeline.
            </p>

            <form 
              onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}
              className="flex flex-col sm:flex-row gap-3 pt-4"
            >
              <input 
                type="email" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter institutional email..."
                required
                className="px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta flex-1"
              />
              <button 
                type="submit"
                className="px-6 py-3.5 rounded-xl bg-terracotta text-white font-semibold hover:bg-terracotta-dark transition-all shrink-0"
              >
                {subscribed ? 'Access Granted ✓' : 'Request Enterprise Access'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
