/**
 * SAMVAYA Global Atmospheric Context & State Store
 * Project SIH26081 • Team NIE KAVACH
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchLocationSnapshot, checkBackendHealth, reverseGeocode } from '../services/api';

const AtmosphericContext = createContext(null);

const DEFAULT_MODELS = [
  { id: 'ecmwf', name: 'ECMWF IFS', agency: 'European Centre (ECMWF)', resolution: '0.25° (9km)', horizon: '10 Days', skill: 96.4, weight: 0.38, bias: 0.2 },
  { id: 'gfs', name: 'NOAA GFS', agency: 'NCEP / NOAA (USA)', resolution: '0.25° (13km)', horizon: '16 Days', skill: 92.1, weight: 0.27, bias: -0.4 },
  { id: 'icon', name: 'DWD ICON', agency: 'Deutscher Wetterdienst (Germany)', resolution: '13km Global', horizon: '7 Days', skill: 93.8, weight: 0.22, bias: 0.1 },
  { id: 'gem', name: 'CMC GEM', agency: 'Canadian Met Centre (Canada)', resolution: '15km Global', horizon: '10 Days', skill: 90.5, weight: 0.13, bias: -0.2 }
];

const DEFAULT_STATIONS = [
  { name: 'Mysuru (Agromet Obs)', lat: 12.2958, lon: 76.6394, state: 'Karnataka', country: 'India', elevation: '763M', awsId: 'AWS #43285' },
  { name: 'Bengaluru (IMD City)', lat: 12.9716, lon: 77.5946, state: 'Karnataka', country: 'India', elevation: '920M', awsId: 'AWS #43295' },
  { name: 'Mangaluru (Panambur Coast)', lat: 12.9141, lon: 74.8560, state: 'Karnataka', country: 'India', elevation: '22M', awsId: 'AWS #43284' },
  { name: 'Wayanad (Ambalavayal)', lat: 11.6854, lon: 76.1320, state: 'Kerala', country: 'India', elevation: '974M', awsId: 'AWS #43311' },
  { name: 'Coimbatore (TNAU)', lat: 11.0168, lon: 76.9558, state: 'Tamil Nadu', country: 'India', elevation: '411M', awsId: 'AWS #43329' },
  { name: 'Hyderabad (Begumpet)', lat: 17.3850, lon: 78.4867, state: 'Telangana', country: 'India', elevation: '542M', awsId: 'AWS #43128' },
  { name: 'Chennai (Meenambakkam)', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu', country: 'India', elevation: '16M', awsId: 'AWS #43279' },
  { name: 'Kochi (CIAL Marine)', lat: 9.9312, lon: 76.2673, state: 'Kerala', country: 'India', elevation: '5M', awsId: 'AWS #43353' }
];

const DEFAULT_EXTREME_EVENTS = [
  {
    id: 'cyclone-arabian-sea',
    type: 'Tropical Cyclone',
    title: 'Severe Cyclonic Storm "Tej" Reanalysis / Arabian Sea Track',
    severity: 'High Alert',
    riskScore: 88,
    affectedArea: 'West Coast / Konkan / Goa',
    windMax: '145 km/h',
    rainExpected: '210 mm/24h',
    divergence: 'ECMWF vs GFS divergence: 42 km landfall delta'
  },
  {
    id: 'ghats-cloudburst',
    type: 'Heavy Orographic Precipitation',
    title: 'Western Ghats Cloudburst Threat (Wayanad / Kodagu Escarpment)',
    severity: 'Severe Watch',
    riskScore: 82,
    affectedArea: 'Kodagu / Wayanad Ridge',
    windMax: '68 km/h',
    rainExpected: '185 mm/24h',
    divergence: 'ICON shows higher precipitation rate than ECMWF (+24mm)'
  },
  {
    id: 'urban-flood-bangalore',
    type: 'Urban Convective Torrent',
    title: 'Urban Heat Island & Squall Warning (Bengaluru Urban Basin)',
    severity: 'Moderate Advisory',
    riskScore: 64,
    affectedArea: 'Bengaluru Met Area',
    windMax: '55 km/h',
    rainExpected: '65 mm/3h',
    divergence: 'GFS convective timing delayed by 45 mins'
  }
];

export function AtmosphericProvider({ children }) {
  const [currentScreen, setCurrentScreen] = useState('unified_home');
  const [location, setLocation] = useState({
    latitude: 12.2958,
    longitude: 76.6394,
    name: 'Mysuru, Karnataka, India',
    lat: 12.2958,
    lon: 76.6394,
    state: 'Karnataka',
    region: 'South Asia Domain',
    country: 'India',
    elevation: '763M',
    awsId: 'AWS #43285'
  });

  const [leadTimeHours, setLeadTimeHours] = useState(18); // Default T+18h
  const [activeLayer, setActiveLayer] = useState('precipitation');
  const [snapshot, setSnapshot] = useState(null);
  const [backendStatus, setBackendStatus] = useState('SYNCING');
  const [isLoading, setIsLoading] = useState(false);

  // Check health and load snapshot
  useEffect(() => {
    async function init() {
      const health = await checkBackendHealth();
      setBackendStatus(health.status === 'ok' ? 'ENGINE READY' : 'OFFLINE CACHE');
      loadSnapshot(location.latitude, location.longitude, location.name);
    }
    init();
  }, []);

  const loadSnapshot = async (lat, lon, name) => {
    setIsLoading(true);
    const data = await fetchLocationSnapshot(lat, lon, name);
    setSnapshot(data);
    setIsLoading(false);
  };

  const selectStation = async (lat, lon, name, awsId = 'AWS #43285', elevation = '763M') => {
    const nextLoc = {
      latitude: lat,
      longitude: lon,
      lat,
      lon,
      name,
      region: 'South Asia Domain',
      country: 'India',
      elevation,
      awsId
    };
    setLocation(nextLoc);
    await loadSnapshot(lat, lon, name);
  };

  const selectLocation = async (locObj) => {
    const lat = locObj.lat || locObj.latitude;
    const lon = locObj.lon || locObj.longitude;
    const name = locObj.name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    const updated = {
      ...locObj,
      latitude: lat,
      longitude: lon,
      lat,
      lon,
      name
    };
    setLocation(updated);
    await loadSnapshot(lat, lon, name);
  };

  // Helper getters for components
  const liveSnapshot = snapshot?.fusion_forecast || {
    temperature: 26.4,
    humidity: 68,
    wind_speed: 12.8,
    pressure: 1012.4,
    precipitation_prob: 18,
    uv_index: 7,
    cloud_cover: 24,
    ensemble_spread: '±0.4°C',
    divergence_score: 'LOW (0.12)'
  };

  const hourlyForecast = [
    { time: '12:00', temp: 26.4, precip: 15, wind: 12 },
    { time: '14:00', temp: 28.1, precip: 20, wind: 14 },
    { time: '16:00', temp: 29.0, precip: 25, wind: 15 },
    { time: '18:00', temp: 27.2, precip: 30, wind: 11 },
    { time: '20:00', temp: 25.5, precip: 10, wind: 9 },
    { time: '22:00', temp: 24.1, precip: 5, wind: 8 },
    { time: '00:00', temp: 23.0, precip: 0, wind: 7 },
    { time: '02:00', temp: 22.4, precip: 0, wind: 6 }
  ];

  const value = {
    currentScreen,
    setCurrentScreen,
    location,
    activeLocation: location,
    setLocation,
    selectStation,
    selectLocation,
    leadTimeStep: leadTimeHours,
    setLeadTimeStep: setLeadTimeHours,
    leadTimeHours,
    setLeadTimeHours,
    activeLayer,
    setActiveLayer,
    snapshot,
    liveSnapshot,
    backendStatus,
    backendHealthy: backendStatus === 'ENGINE READY',
    isLoading,
    loading: isLoading,
    models: DEFAULT_MODELS,
    regionalStations: DEFAULT_STATIONS,
    extremeEvents: DEFAULT_EXTREME_EVENTS,
    hourlyForecast
  };

  return (
    <AtmosphericContext.Provider value={value}>
      {children}
    </AtmosphericContext.Provider>
  );
}

export function useAtmospheric() {
  const ctx = useContext(AtmosphericContext);
  if (!ctx) throw new Error('useAtmospheric must be used within AtmosphericProvider');
  return ctx;
}

export function useAtmosphere() {
  const ctx = useContext(AtmosphericContext);
  if (!ctx) throw new Error('useAtmosphere must be used within AtmosphericProvider');
  return ctx;
}

export default AtmosphericContext;
