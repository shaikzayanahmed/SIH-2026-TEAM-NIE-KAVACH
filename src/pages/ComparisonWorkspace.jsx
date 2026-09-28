import React, { useState } from 'react';
import { useAtmosphere } from '../context/AtmosphericContext';
import CesiumGlobe from '../components/CesiumGlobe';
import { 
  Columns, ArrowLeftRight, CheckCircle2, TrendingUp, Sliders, 
  Layers, MapPin, Compass, Droplets, Wind, Thermometer
} from 'lucide-react';

export default function ComparisonWorkspace() {
  const { activeLocation, liveSnapshot, models, regionalStations } = useAtmosphere();

  const [modelA, setModelA] = useState('ecmwf');
  const [modelB, setModelB] = useState('gfs');
  const [metric, setMetric] = useState('temperature');

  const selectedModelA = models.find(m => m.id === modelA) || models[0];
  const selectedModelB = models.find(m => m.id === modelB) || models[1];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans pb-24">
      {/* Header */}
      <section className="bg-white border-b border-slate-200/80 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terracotta">
              <ArrowLeftRight className="w-4 h-4" />
              <span>SIDE-BY-SIDE MODEL DIVERGENCE WORKSPACE</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Atmospheric Comparison Workspace
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Directly contrast ECMWF, GFS, ICON, and GEM physics schemes, parameterizations, and forecast delta spreads.
            </p>
          </div>

          {/* Location Indicator */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-slate-200/80">
            <MapPin className="w-4 h-4 text-terracotta" />
            <div className="text-xs">
              <div className="text-slate-500">Benchmark Site</div>
              <strong className="text-slate-900">{activeLocation.name}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Main Comparison Section */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Model Selector Ribbon */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Model A Select */}
          <div className="w-full md:w-5/12 space-y-2">
            <label className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
              Primary Model (A)
            </label>
            <select
              value={modelA}
              onChange={(e) => setModelA(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.agency} • {m.resolution})
                </option>
              ))}
            </select>
          </div>

          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0">
            VS
          </div>

          {/* Model B Select */}
          <div className="w-full md:w-5/12 space-y-2">
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              Comparison Model (B)
            </label>
            <select
              value={modelB}
              onChange={(e) => setModelB(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.agency} • {m.resolution})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Dual 3D / Side-by-Side Comparison Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Panel A */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">MODEL A</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedModelA.name}</h3>
                <p className="text-xs text-slate-500">{selectedModelA.agency} • {selectedModelA.resolution} Grid</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900">
                  {(liveSnapshot.temperature + (selectedModelA.bias || 0)).toFixed(1)}°C
                </div>
                <div className="text-xs font-semibold text-blue-600">Skill: {selectedModelA.skill}%</div>
              </div>
            </div>

            <div className="h-[280px] w-full rounded-2xl overflow-hidden bg-slate-950 relative">
              <CesiumGlobe showControls={false} showHUD={false} className="w-full h-full" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold">
                {selectedModelA.id.toUpperCase()} Surface Field
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Physics Core</span>
                <div className="font-bold text-slate-900 mt-0.5">IFS Semi-Lagr.</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Ensemble Weight</span>
                <div className="font-bold text-slate-900 mt-0.5">{(selectedModelA.weight * 100).toFixed(0)}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Convection</span>
                <div className="font-bold text-slate-900 mt-0.5">Tiedtke Param</div>
              </div>
            </div>
          </div>

          {/* Panel B */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">MODEL B</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedModelB.name}</h3>
                <p className="text-xs text-slate-500">{selectedModelB.agency} • {selectedModelB.resolution} Grid</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900">
                  {(liveSnapshot.temperature + (selectedModelB.bias || 0)).toFixed(1)}°C
                </div>
                <div className="text-xs font-semibold text-emerald-600">Skill: {selectedModelB.skill}%</div>
              </div>
            </div>

            <div className="h-[280px] w-full rounded-2xl overflow-hidden bg-slate-950 relative">
              <CesiumGlobe showControls={false} showHUD={false} className="w-full h-full" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold">
                {selectedModelB.id.toUpperCase()} Surface Field
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Physics Core</span>
                <div className="font-bold text-slate-900 mt-0.5">FV3 Non-Hydro</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Ensemble Weight</span>
                <div className="font-bold text-slate-900 mt-0.5">{(selectedModelB.weight * 100).toFixed(0)}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Convection</span>
                <div className="font-bold text-slate-900 mt-0.5">SAS Scheme</div>
              </div>
            </div>
          </div>

        </div>

        {/* Fused Consensus Delta Verdict */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-terracotta uppercase tracking-wider">SAMVAYA FUSION VERDICT</span>
            <h4 className="text-lg font-bold text-white">Dynamic Ensemble Resolution</h4>
            <p className="text-xs text-slate-300">
              Inter-model delta is currently <strong className="text-amber-400">0.4°C / 8% RH</strong>. 
              The fused super-ensemble eliminates 68% of single-model variance at this coordinate.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xs text-slate-400">Weighted Consensus</div>
              <div className="text-2xl font-black text-terracotta">{liveSnapshot.temperature.toFixed(1)}°C</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-terracotta/20 border border-terracotta/40 flex items-center justify-center text-terracotta">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
