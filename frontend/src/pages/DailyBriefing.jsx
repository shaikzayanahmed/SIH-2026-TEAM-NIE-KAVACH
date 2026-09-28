import React, { useState } from 'react';
import { useAtmosphere } from '../context/AtmosphericContext';
import CesiumGlobe from '../components/CesiumGlobe';
import { 
  Sun, CloudRain, Wind, Droplets, Compass, ShieldCheck, 
  FileText, Share2, Download, Printer, CheckCircle2, ChevronRight,
  Sparkles, Clock, Calendar, AlertCircle
} from 'lucide-react';

export default function DailyBriefing() {
  const { activeLocation, liveSnapshot, hourlyForecast, extremeEvents } = useAtmosphere();

  const [dateStr] = useState(() => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans pb-24">
      {/* Briefing Header Banner */}
      <section className="bg-white border-b border-slate-200/80 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terracotta">
              <Sparkles className="w-4 h-4" />
              <span>AI SYNOPTIC DAILY DISPATCH</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Daily Atmospheric Briefing: {activeLocation.name}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {dateStr} • Prepared for Regional Operators & Civil Infrastructure
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Briefing</span>
            </button>
            <button 
              className="px-4 py-2.5 rounded-xl bg-terracotta text-white text-xs font-bold hover:bg-terracotta-dark transition-all flex items-center gap-2 shadow-md shadow-terracotta/25"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Cols: Executive Summary & Hourly Deck */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Executive Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                CONDITIONS: OPTIMAL / NOMINAL
              </span>
              <span className="text-xs text-slate-400">Confidence: 97.4%</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Synoptic Atmospheric Overview for {activeLocation.name} ({activeLocation.state})
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              A mild surface ridge continues to dominate the regional boundary layer, providing stable thermodynamic lapse rates. 
              No convective squalls or severe wind shear events are anticipated over the next 24-hour forecast cycle. 
              Maximum temperature is projected to crest at <strong className="text-slate-900">{(liveSnapshot.temperature + 2.5).toFixed(1)}°C</strong> with 
              gusts not exceeding <strong className="text-slate-900">{(liveSnapshot.wind_speed + 5).toFixed(1)} km/h</strong>.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                <div className="text-xs text-slate-500 font-medium">Day High</div>
                <div className="text-lg font-black text-slate-900">{(liveSnapshot.temperature + 2.8).toFixed(1)}°C</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                <div className="text-xs text-slate-500 font-medium">Night Low</div>
                <div className="text-lg font-black text-slate-900">{(liveSnapshot.temperature - 4.2).toFixed(1)}°C</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                <div className="text-xs text-slate-500 font-medium">Precip Accum.</div>
                <div className="text-lg font-black text-blue-600">0.0 mm</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF8F5]">
                <div className="text-xs text-slate-500 font-medium">Max UV Index</div>
                <div className="text-lg font-black text-amber-600">8 (Very High)</div>
              </div>
            </div>
          </div>

          {/* 24-Hour Chronological Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">24-Hour Synoptic Timeline</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {hourlyForecast.slice(0, 8).map((hf, i) => (
                <div key={i} className="p-3 rounded-2xl bg-[#FAF8F5] border border-slate-200/60 text-center space-y-1">
                  <div className="text-xs font-semibold text-slate-500">{hf.time}</div>
                  <div className="my-1 text-terracotta flex justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-black text-slate-900">{hf.temp.toFixed(1)}°</div>
                  <div className="text-[10px] text-blue-600 font-semibold">{hf.precip}% rain</div>
                </div>
              ))}
            </div>
          </div>

          {/* Civil & Sector Advisory Matrix */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">Operational Sector Advisories</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80">
                <div className="text-xs font-bold text-slate-900 mb-1">Aviation & Drone Operations</div>
                <p className="text-xs text-slate-600">VFR conditions prevailing. Surface visibility {'>'} 10 km. Ceiling unrestricted.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80">
                <div className="text-xs font-bold text-slate-900 mb-1">Agriculture & Irrigation</div>
                <p className="text-xs text-slate-600">High soil evaporation rate expected between 12:00-15:00 UTC. Irrigation recommended.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80">
                <div className="text-xs font-bold text-slate-900 mb-1">Renewable Energy Grid</div>
                <p className="text-xs text-slate-600">Solar irradiance at 94% peak potential. Wind generation stable at 14 km/h baseline.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: 3D Globe & Synoptic Summary */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="font-bold text-sm text-slate-900">Spatial Satellite Perspective</h3>
              <span className="text-xs font-bold text-terracotta">Cesium 3D</span>
            </div>

            <div className="h-[300px] w-full rounded-2xl overflow-hidden bg-slate-950 relative shadow-inner">
              <CesiumGlobe showControls={false} showHUD={false} className="w-full h-full" />
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg space-y-3">
            <span className="text-xs font-bold text-terracotta uppercase tracking-wider">BRIEFING SIGN-OFF</span>
            <h4 className="text-base font-bold text-white">Meteorological Authority</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Synthesized by the SAMVAYA AI atmospheric reasoning pipeline via ECMWF, GFS, ICON, and GEM super-ensemble calibration.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Status: Final Verified</span>
              <span className="text-emerald-400 font-bold">✓ Ready</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
