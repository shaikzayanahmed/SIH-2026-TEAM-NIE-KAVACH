/**
 * SAMVAYA Stitch 35-Screen Navigator & Selector (React JSX)
 * Project SIH26081 • Team NIE KAVACH
 */

import React from 'react';
import { useAtmospheric } from '../context/AtmosphericContext';

const SCREEN_CATEGORIES = {
  'CORE OBSERVATORIES & COMMAND': [
    { id: 'unified-home', name: 'Unified Atmospheric Home (Primary)' },
    { id: 'desktop-landing', name: 'Desktop Landing Experience' },
    { id: 'global-discovery', name: 'Global Atmospheric Discovery' },
    { id: 'comparison-workspace', name: 'Comparison Workspace' },
  ],
  'FORECAST INTELLIGENCE & MODEL LAB': [
    { id: 'model-lab', name: 'Forecast Intelligence Model Lab' },
    { id: 'location-explorer', name: 'Location Explorer (Mysuru Focus)' },
    { id: 'forecast-replay', name: 'Forecast Replay & Verification' },
  ],
  'EXTREME WEATHER & BRIEFINGS': [
    { id: 'extreme-weather', name: 'Extreme Weather Risk Center' },
    { id: 'daily-briefing', name: 'Daily Synoptic Forecast Briefing' },
    { id: 'transparency-center', name: 'Data & Model Transparency' },
  ]
};

export default function ScreenSwitcher() {
  const { currentScreen, setCurrentScreen } = useAtmospheric();

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      <div className="bg-inverse-surface/95 backdrop-blur-xl text-inverse-on-surface border border-outline-variant/40 rounded-full px-3.5 py-1.5 shadow-2xl flex items-center gap-2.5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <strong className="text-primary-fixed uppercase font-semibold text-[10px] tracking-wider">
            STITCH SCREEN:
          </strong>
        </div>
        <select
          value={currentScreen}
          onChange={(e) => setCurrentScreen(e.target.value)}
          className="bg-surface-container-high/90 text-on-surface rounded-full px-2.5 py-1 text-xs outline-none cursor-pointer border border-outline/40 max-w-[220px]"
        >
          {Object.entries(SCREEN_CATEGORIES).map(([cat, list]) => (
            <optgroup key={cat} label={cat}>
              {list.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button
          onClick={() => setCurrentScreen('unified-home')}
          title="Return to Home"
          className="text-primary-fixed hover:text-on-primary transition-colors flex items-center"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
        </button>
      </div>
    </div>
  );
}
