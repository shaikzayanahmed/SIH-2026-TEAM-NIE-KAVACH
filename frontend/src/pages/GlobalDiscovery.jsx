import React, { useState } from 'react';
import { useAtmosphere } from '../context/AtmosphericContext';
import CesiumGlobe from '../components/CesiumGlobe';
import { 
  Globe, Compass, Search, MapPin, Layers, Filter, 
  ArrowUpRight, Wind, Droplets, Thermometer, ShieldAlert
} from 'lucide-react';

export default function GlobalDiscovery() {
  const { 
    activeLocation, 
    liveSnapshot, 
    activeLayer, 
    setActiveLayer, 
    regionalStations,
    selectLocation 
  } = useAtmosphere();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = regionalStations.filter(st => 
    st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans pb-24">
      {/* Header */}
      <section className="bg-white border-b border-slate-200/80 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terracotta">
              <Globe className="w-4 h-4" />
              <span>SYNOPTIC PLANETARY MESH</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Global Atmospheric Discovery
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Explore multi-layer global atmospheric variables across temperature, wind streamlines, radar, pressure, and cloud optical depth.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-slate-200/80">
            <MapPin className="w-4 h-4 text-terracotta" />
            <div className="text-xs">
              <div className="text-slate-500">Active Center</div>
              <strong className="text-slate-900">{activeLocation.name} ({activeLocation.lat.toFixed(2)}°, {activeLocation.lon.toFixed(2)}°)</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Full Width Cesium Discovery Deck */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Layer Selector Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-terracotta" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Atmospheric Layer:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'temperature', label: 'Temperature 2m', icon: Thermometer },
              { id: 'wind', label: 'Wind Vector (10m)', icon: Wind },
              { id: 'radar', label: 'Doppler Radar Reflectivity', icon: ShieldAlert },
              { id: 'clouds', label: 'Cloud Optical Depth', icon: Globe },
              { id: 'pressure', label: 'MSL Isobars', icon: Compass }
            ].map(layer => {
              const Icon = layer.icon;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeLayer === layer.id
                      ? 'bg-terracotta text-white shadow-md shadow-terracotta/25'
                      : 'bg-[#FAF8F5] border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{layer.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big 3D Cesium Discovery Globe */}
        <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative h-[560px]">
          <CesiumGlobe 
            showControls={true} 
            showHUD={true} 
            activeLayer={activeLayer}
            onLayerChange={setActiveLayer}
            className="w-full h-full"
          />
        </div>

        {/* Regional Station Directory */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Regional Synoptic Observatory Network</h3>
              <p className="text-xs text-slate-500">Click any observatory node to focus 3D Cesium camera and synchronize multi-model state.</p>
            </div>

            {/* Filter Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter stations..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStations.map(st => (
              <button
                key={st.name}
                onClick={() => selectLocation(st)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  activeLocation.name === st.name
                    ? 'bg-terracotta/10 border-terracotta/40 shadow-sm ring-1 ring-terracotta'
                    : 'bg-[#FAF8F5] border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">{st.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                    {st.state}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {st.lat.toFixed(2)}°N, {st.lon.toFixed(2)}°E
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-terracotta">
                  <span>Focus Viewport</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
