import React, { useState } from 'react';
import { useAtmosphere } from '../context/AtmosphericContext';
import CesiumGlobe from '../components/CesiumGlobe';
import { 
  MapPin, Compass, Thermometer, Wind, Droplets, CloudRain, Sun, 
  Activity, ArrowUpRight, CheckCircle2, ChevronRight, BarChart2,
  Layers, Sliders, Calendar, Clock
} from 'lucide-react';

export default function LocationExplorer() {
  const { 
    activeLocation, 
    liveSnapshot, 
    leadTimeHours, 
    setLeadTimeHours,
    backendHealthy,
    models,
    regionalStations,
    selectLocation
  } = useAtmosphere();

  const [activeTab, setActiveTab] = useState('meteogram');

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans pb-24">
      {/* Top Location Header */}
      <section className="bg-white border-b border-slate-200/80 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terracotta">
              <Compass className="w-4 h-4" />
              <span>HIGH-RESOLUTION POINT FORECAST EXPLORER</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                {activeLocation.name}
              </h1>
              <span className="px-3 py-1 rounded-full bg-terracotta/10 text-terracotta border border-terracotta/20 text-xs font-bold">
                {activeLocation.state || 'Karnataka'}, {activeLocation.country || 'IN'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Coordinates: {activeLocation.lat.toFixed(4)}°N, {activeLocation.lon.toFixed(4)}°E • Elevation: 763m MSL • Synoptic WMO Index #43285
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80">
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Ensemble Temp</div>
              <div className="text-2xl font-black text-slate-900">{liveSnapshot.temperature.toFixed(1)}°C</div>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Precip Prob</div>
              <div className="text-2xl font-black text-blue-600">{liveSnapshot.precipitation_prob}%</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-slate-500 font-medium">Wind Gust</div>
              <div className="text-2xl font-black text-slate-900">{liveSnapshot.wind_speed.toFixed(1)} <span className="text-xs font-normal">km/h</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: 3D Cesium View & Regional Network */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Cesium 3D Local Orb */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-terracotta" />
                <h3 className="font-bold text-sm text-slate-900">Topographic 3D Viewport</h3>
              </div>
              <span className="text-xs font-bold text-emerald-600">LIVE FEED</span>
            </div>

            <div className="h-[340px] w-full rounded-2xl overflow-hidden relative shadow-inner bg-slate-950">
              <CesiumGlobe 
                showControls={false} 
                showHUD={true} 
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Regional Station Switcher */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-2">Regional Sensor Network</h3>
            <p className="text-xs text-slate-500 mb-4">Select station to recalibrate ensemble baseline weighting.</p>

            <div className="space-y-2.5">
              {regionalStations.map(st => (
                <button
                  key={st.name}
                  onClick={() => selectLocation(st)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    activeLocation.name === st.name
                      ? 'bg-terracotta/10 border-terracotta/40 text-slate-900 shadow-sm'
                      : 'bg-[#FAF8F5] border-slate-200/80 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900">{st.name}</div>
                    <div className="text-xs text-slate-500">{st.lat.toFixed(2)}°N, {st.lon.toFixed(2)}°E • {st.state}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeLocation.name === st.name ? 'text-terracotta' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Multi-Model Meteograms & Diagnostics */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Horizon Selector */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Lead-Time Forecast Window</h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-terracotta/10 text-terracotta">
                +{leadTimeHours}h Active Horizon
              </span>
            </div>

            <div className="flex gap-2">
              {[0, 6, 12, 24, 48, 72, 120, 168].map(hr => (
                <button
                  key={hr}
                  onClick={() => setLeadTimeHours(hr)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    leadTimeHours === hr
                      ? 'bg-terracotta text-white shadow-md shadow-terracotta/25'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  +{hr}h
                </button>
              ))}
            </div>
          </div>

          {/* Model Breakdown at Point */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">Individual Model Predictions for {activeLocation.name}</h3>
            
            <div className="space-y-3">
              {models.map(m => (
                <div key={m.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{m.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {m.agency}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Grid: {m.resolution} • Horizon: {m.horizon}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-slate-900">
                      {(liveSnapshot.temperature + (m.bias || 0)).toFixed(1)}°C
                    </div>
                    <div className="text-xs font-semibold text-emerald-600">Skill: {m.skill}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Micro-Climate Atmospheric Profile */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md">
            <h4 className="text-sm font-bold uppercase tracking-wider text-terracotta mb-2">
              Thermodynamic Boundary Layer Summary
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Surface inversion layer stable up to 850 hPa. Lifting Condensation Level (LCL) estimated at 1,120m AGL. 
              No severe convective initiation expected during the immediate 6-hour forecast cycle.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-800">
              <div>
                <span className="text-slate-400">Relative Humidity</span>
                <div className="text-sm font-bold text-white mt-0.5">{liveSnapshot.humidity || 68}%</div>
              </div>
              <div>
                <span className="text-slate-400">Surface Pressure</span>
                <div className="text-sm font-bold text-white mt-0.5">{liveSnapshot.pressure || 1012.4} hPa</div>
              </div>
              <div>
                <span className="text-slate-400">UV Index</span>
                <div className="text-sm font-bold text-white mt-0.5">{liveSnapshot.uv_index || 7} (High)</div>
              </div>
              <div>
                <span className="text-slate-400">Cloud Fraction</span>
                <div className="text-sm font-bold text-white mt-0.5">{liveSnapshot.cloud_cover || 24}%</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
