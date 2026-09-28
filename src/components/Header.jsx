/**
 * SAMVAYA Master Double-Tier Atmospheric Header (React JSX)
 * Project SIH26081 • Team NIE KAVACH
 */

import React, { useState, useEffect } from 'react';
import { useAtmospheric } from '../context/AtmosphericContext';
import { reverseGeocode } from '../services/api';

export default function Header() {
  const { currentScreen, setCurrentScreen, location, setLocation, selectStation, backendStatus } = useAtmospheric();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // ⌘K Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('header-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search input handler
  const handleSearchChange = async (val) => {
    setSearchQuery(val);
    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(val)}&limit=5&countrycodes=in`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (e) {}
    setIsSearching(false);
  };

  const handleSelectResult = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const name = item.name || item.display_name.split(',')[0];
    selectStation(lat, lon, name);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const geo = await reverseGeocode(lat, lon);
      selectStation(lat, lon, geo.name || 'My Location');
    });
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(74,53,37,0.04)]">
      <div className="h-28 w-full flex flex-col justify-between">
        
        {/* Top Tier */}
        <div className="h-16 w-full px-gutter flex items-center justify-between gap-space-md bg-surface-container-lowest/70 backdrop-blur-md">
          {/* Brand */}
          <div 
            className="flex items-center gap-space-md shrink-0 cursor-pointer"
            onClick={() => setCurrentScreen('unified-home')}
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-sm">
              <span>सं</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface uppercase font-bold leading-none">SAMVAYA</span>
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider mt-space-xs">
                ADAPTIVE ATMOSPHERIC FORECAST ENGINE
              </span>
            </div>
          </div>

          {/* Primary Navigation */}
          <nav className="hidden xl:flex items-center gap-space-xs bg-surface-container-low p-space-xs rounded-full shadow-[inset_0_1px_2px_rgba(43,30,22,0.04)]">
            <button
              onClick={() => setCurrentScreen('unified-home')}
              className={`px-space-md py-1 rounded-full font-body-md text-body-md transition-all ${
                currentScreen === 'unified-home'
                  ? 'bg-primary text-on-primary font-medium shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setCurrentScreen('location-explorer')}
              className={`px-space-md py-1 rounded-full font-body-md text-body-md transition-all ${
                currentScreen === 'location-explorer'
                  ? 'bg-primary text-on-primary font-medium shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              Forecast
            </button>
            <button
              onClick={() => setCurrentScreen('model-lab')}
              className={`px-space-md py-1 rounded-full font-body-md text-body-md transition-all ${
                currentScreen === 'model-lab'
                  ? 'bg-primary text-on-primary font-medium shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              Intelligence
            </button>
            <button
              onClick={() => setCurrentScreen('forecast-replay')}
              className={`px-space-md py-1 rounded-full font-body-md text-body-md transition-all ${
                currentScreen === 'forecast-replay'
                  ? 'bg-primary text-on-primary font-medium shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              History
            </button>
          </nav>

          {/* Search, Location, Status */}
          <div className="flex items-center gap-space-sm shrink-0">
            <div className="relative hidden lg:flex items-center">
              <span className="material-symbols-outlined absolute left-space-sm text-on-surface-variant text-[18px]">search</span>
              <input
                id="header-search-input"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search Earth or coordinates... ⌘K"
                className="pl-8 pr-8 py-1.5 w-64 rounded-full bg-surface-container-low text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary shadow-[inset_0_1px_2px_rgba(43,30,22,0.05)] transition-all"
                type="text"
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="absolute right-2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}

              {/* Search Suggestions Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container-high overflow-hidden z-50">
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectResult(item)}
                      className="px-3 py-2 hover:bg-surface-container flex items-center gap-2 cursor-pointer transition-colors border-b border-surface-container-high last:border-0"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">pin_drop</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-on-surface truncate">{item.name || item.display_name.split(',')[0]}</span>
                        <span className="text-[11px] text-on-surface-variant truncate">{item.display_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleLocateMe}
              className="hidden md:flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-all shadow-[0_1px_3px_rgba(43,30,22,0.04)]"
            >
              <span className="material-symbols-outlined text-[16px]">my_location</span>
              <span>Use My Location</span>
            </button>

            <button
              onClick={() => setCurrentScreen('desktop-landing')}
              className="hidden sm:flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-all shadow-[0_1px_3px_rgba(43,30,22,0.04)]"
            >
              <span className="material-symbols-outlined text-[16px]">overview</span>
              <span>Overview Landing</span>
            </button>

            <div className="flex items-center gap-1.5 px-space-md py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-label-caps uppercase tracking-wider">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span>{backendStatus}</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm text-on-primary">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Tier Context Bar */}
        <div className="h-12 w-full px-gutter bg-surface-container/60 backdrop-blur-sm flex items-center justify-between text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider overflow-x-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="flex items-center gap-space-sm shrink-0">
            <span className="text-primary font-bold">ATMOSPHERIC COMMAND CENTER</span>
            <span>·</span>
            <span>FOCUS: {location.name.toUpperCase()} ({Math.abs(location.latitude).toFixed(2)}°N, {Math.abs(location.longitude).toFixed(2)}°E)</span>
            <span>·</span>
            <span className="text-tertiary font-bold">REGIME: CONVECTIVE TRANSITION (87% CONF)</span>
          </div>
          <div className="hidden md:flex items-center gap-space-md shrink-0 text-on-surface-variant">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">satellite_alt</span>INSAT-3DR VIS/IR</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">cloud_download</span>REFRESH: 120s</span>
          </div>
        </div>
      </div>
    </header>
  );
}
