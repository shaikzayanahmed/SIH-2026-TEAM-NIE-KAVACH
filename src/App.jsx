import React from 'react';
import { useAtmosphere } from './context/AtmosphericContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScreenSwitcher from './components/ScreenSwitcher';

// Pages
import UnifiedHome from './pages/UnifiedHome';
import ModelLab from './pages/ModelLab';
import DesktopLanding from './pages/DesktopLanding';
import ExtremeWeather from './pages/ExtremeWeather';
import LocationExplorer from './pages/LocationExplorer';
import ForecastReplay from './pages/ForecastReplay';
import ComparisonWorkspace from './pages/ComparisonWorkspace';
import DailyBriefing from './pages/DailyBriefing';
import GlobalDiscovery from './pages/GlobalDiscovery';
import TransparencyCenter from './pages/TransparencyCenter';

export default function App() {
  const { currentScreen, loading } = useAtmosphere();

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'unified_home':
        return <UnifiedHome />;
      case 'model_lab':
        return <ModelLab />;
      case 'desktop_landing':
        return <DesktopLanding />;
      case 'extreme_weather':
        return <ExtremeWeather />;
      case 'location_explorer':
        return <LocationExplorer />;
      case 'forecast_replay':
        return <ForecastReplay />;
      case 'comparison_workspace':
        return <ComparisonWorkspace />;
      case 'daily_briefing':
        return <DailyBriefing />;
      case 'global_discovery':
        return <GlobalDiscovery />;
      case 'transparency_center':
        return <TransparencyCenter />;
      default:
        return <UnifiedHome />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col font-sans selection:bg-terracotta selection:text-white">
      {/* Top Universal Stitch Navigation */}
      <Header />

      {/* Dynamic Active Screen */}
      <main className="flex-1">
        {renderActiveScreen()}
      </main>

      {/* Floating Screen Switcher for seamless Stitch Screen navigation */}
      <ScreenSwitcher />

      {/* Bottom Global Footer */}
      <Footer />
    </div>
  );
}
