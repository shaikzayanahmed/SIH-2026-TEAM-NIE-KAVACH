import React, { useState } from 'react';
import { useAtmosphere } from '../context/AtmosphericContext';
import CesiumGlobe from '../components/CesiumGlobe';
import { 
  AlertTriangle, Flame, CloudRain, Wind, Zap, Radio, ShieldAlert,
  ArrowUpRight, Clock, MapPin, CheckCircle2, ChevronRight, Activity,
  Sliders, RefreshCw
} from 'lucide-react';

export default function ExtremeWeather() {
  const { 
    activeLocation, 
    liveSnapshot, 
    extremeEvents, 
    backendHealthy,
    activeLayer,
    setActiveLayer
  } = useAtmosphere();

  const [selectedEvent, setSelectedEvent] = useState(extremeEvents[0] || {
    id: 'cyclone-arabian-sea',
    type: 'Tropical Cyclone',
    title: 'Severe Cyclonic Storm "Tej" Reanalysis / Arabian Sea Track',
    severity: 'High Alert',
    riskScore: 88,
    affectedArea: 'West Coast / Konkan / Goa',
    windMax: '145 km/h',
    rainExpected: '210 mm/24h',
    divergence: 'ECMWF vs GFS divergence: 42 km landfall delta'
  });

  const [alertFilter, setAlertFilter] = useState('ALL');

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans pb-24">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white border-b border-slate-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
              <ShieldAlert className="w-4 h-4 text-terracotta animate-pulse" />
              <span>SAMVAYA SYNOPTIC HAZARD MONITOR</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Extreme Weather Intelligence Center
            </h1>
            <p className="text-xs text-slate-400">
              Real-time multi-model anomaly detection, convective storm tracking, and multi-agency divergence diagnostics.
            </p>
          </div>

          {/* Live Alert Status Badge */}
          <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 px-5">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Active Threat Index</div>
              <div className="text-xl font-black text-terracotta">LEVEL 3 - ELEVATED</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-terracotta/20 border border-terracotta/40 flex items-center justify-center text-terracotta font-black text-lg">
              3
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Cesium Globe Threat Map & Threat Deck */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Cols: 3D Cesium Hazard Cockpit */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <h3 className="font-bold text-sm text-slate-900">Geospatial Hazard Radar (Cesium 3D)</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Active Target:</span>
                <strong className="text-slate-800">{activeLocation.name}</strong>
              </div>
            </div>

            {/* Cesium Globe Container */}
            <div className="h-[480px] w-full rounded-2xl overflow-hidden relative shadow-inner">
              <CesiumGlobe 
                showControls={true}
                showHUD={true}
                activeLayer="radar"
                className="w-full h-full"
              />
            </div>

            {/* Anomaly Barometer */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Cape Index</div>
                <div className="text-base font-bold text-slate-900">2,450 J/kg</div>
                <span className="text-[10px] text-amber-600 font-semibold">High Convective</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Precipitable Water</div>
                <div className="text-base font-bold text-slate-900">58 mm</div>
                <span className="text-[10px] text-terracotta font-semibold">Extreme Moisture</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Wind Shear 0-6km</div>
                <div className="text-base font-bold text-slate-900">38 kts</div>
                <span className="text-[10px] text-red-600 font-semibold">Supercell Prone</span>
              </div>
            </div>
          </div>

          {/* Model Divergence Matrix */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-2">Severe Event Multi-Model Divergence</h3>
            <p className="text-xs text-slate-500 mb-4">
              Comparing peak precipitation timing and wind gust intensity between ECMWF IFS and NOAA GFS.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-700">ECMWF IFS (0.25°)</span>
                  <div className="text-xs text-slate-600 mt-0.5">Peak Gust: 112 km/h at 18:00 UTC | Landfall Delta: +14km North</div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold">96% Skill</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700">NOAA GFS (0.25°)</span>
                  <div className="text-xs text-slate-600 mt-0.5">Peak Gust: 128 km/h at 16:30 UTC | Landfall Delta: -28km South</div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">91% Skill</span>
              </div>

              <div className="p-3.5 rounded-xl bg-terracotta/5 border border-terracotta/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-terracotta">SAMVAYA Fused Ensemble</span>
                  <div className="text-xs text-slate-700 font-medium mt-0.5">Weighted Consensus: 118 km/h at 17:15 UTC | Confidence: High</div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-terracotta text-white text-xs font-bold">98.2% Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Active Hazard Feed & Diagnostic Details */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Hazards List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Active Regional Threat Cards</h3>
              <div className="flex gap-1">
                {['ALL', 'CYCLONE', 'CONVECTIVE'].map(f => (
                  <button
                    key={f}
                    onClick={() => setAlertFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      alertFilter === f 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {extremeEvents.map((evt, idx) => (
                <div
                  key={evt.id || idx}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedEvent.id === evt.id 
                      ? 'bg-amber-50/70 border-amber-400 shadow-md ring-1 ring-amber-400' 
                      : 'bg-[#FAF8F5] border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {evt.severity || 'High Alert'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">Score: {evt.riskScore || 85}/100</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{evt.title || evt.name}</h4>
                  <p className="text-xs text-slate-600 mt-1">Impact: {evt.affectedArea || 'South Asian Coast'}</p>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                    <div>Wind: <strong className="text-slate-900">{evt.windMax || '120 km/h'}</strong></div>
                    <div>Rain: <strong className="text-slate-900">{evt.rainExpected || '180 mm'}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Threat Deep Diagnostic */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-terracotta">THREAT SYNTHESIS SUMMARY</span>
              <span className="text-xs text-slate-400">Updated: Just now</span>
            </div>

            <h4 className="text-lg font-bold text-slate-100">{selectedEvent.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ensemble variance indicates high confidence in localized shear acceleration across the target corridor. 
              Automated civil warning thresholds have been triggered for civil infrastructure nodes.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Model Divergence Vector:</span>
                <strong className="text-amber-400">{selectedEvent.divergence || '±34 km trajectory envelope'}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Recommended Action:</span>
                <strong className="text-emerald-400">Dispatch Marine & Coastal Advisory</strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
