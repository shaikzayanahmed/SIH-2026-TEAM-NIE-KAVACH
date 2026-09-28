/**
 * Build Script: Reconcile All 35 Stitch Screens 1:1 with Dedicated Pages & Global Screen Switcher
 * Project SIH26081 • Team NIE KAVACH
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STITCH_DIR = path.join(__dirname, '../frontend/stitch_designs');
const PAGES_DIR = path.join(__dirname, '../frontend/pages');
const ROOT_INDEX = path.join(__dirname, '../frontend/index.html');

if (!fs.existsSync(PAGES_DIR)) {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
}

const screenCategories = {
  'CORE OBSERVATORIES & COMMAND': [
    { id: 'samvaya_unified_atmospheric_home', name: 'Unified Atmospheric Home (Primary)' },
    { id: 'samvaya_atmospheric_command_center_1', name: 'Atmospheric Command Center 1' },
    { id: 'samvaya_atmospheric_command_center_2', name: 'Atmospheric Command Center 2' },
    { id: 'samvaya_atmospheric_weather_exploration_workspace', name: 'Weather Exploration Workspace' },
    { id: 'samvaya_global_atmospheric_discovery', name: 'Global Atmospheric Discovery' },
    { id: 'samvaya_global_weather_discovery', name: 'Global Weather Discovery' }
  ],
  'FORECAST INTELLIGENCE & MODEL LAB': [
    { id: 'samvaya_forecast_intelligence_model_lab', name: 'Forecast Intelligence Model Lab' },
    { id: 'samvaya_model_convergence_atmospheric_insight', name: 'Model Convergence & Insight' },
    { id: 'samvaya_4d_temporal_weather_intelligence', name: '4D Temporal Weather Intelligence' },
    { id: 'samvaya_atmospheric_timeline', name: 'Atmospheric Timeline Scrubber' },
    { id: 'samvaya_atmospheric_comparison_workspace', name: 'Comparison Workspace' },
    { id: 'samvaya_atmospheric_comparison', name: 'Atmospheric Comparison' }
  ],
  'EXTREME WEATHER & ALERTS': [
    { id: 'samvaya_extreme_weather_intelligence_center_1', name: 'Extreme Weather Center 1' },
    { id: 'samvaya_extreme_weather_intelligence_center_2', name: 'Extreme Weather Center 2' },
    { id: 'samvaya_forecast_scenario_lab', name: 'Forecast Scenario Lab' }
  ],
  'LOCATION EXPLORER & BRIEFINGS': [
    { id: 'samvaya_location_forecast_explorer_mysuru', name: 'Location Explorer (Mysuru Focus)' },
    { id: 'samvaya_location_intelligence_hub', name: 'Location Intelligence Hub' },
    { id: 'samvaya_daily_atmospheric_forecast_briefing_1', name: 'Daily Forecast Briefing 1' },
    { id: 'samvaya_daily_atmospheric_forecast_briefing_2', name: 'Daily Forecast Briefing 2' },
    { id: 'samvaya_atmospheric_intelligence_assistant', name: 'Synoptic AI Assistant' }
  ],
  'VERIFICATION & TRANSPARENCY': [
    { id: 'samvaya_forecast_replay_verification_lab', name: 'Forecast Replay Verification Lab' },
    { id: 'samvaya_forecast_verification_lab', name: 'Forecast Verification Lab' },
    { id: 'samvaya_forecast_history_replay_archive', name: 'History Replay Archive' },
    { id: 'samvaya_data_model_transparency_center_1', name: 'Data & Model Transparency 1' },
    { id: 'samvaya_data_model_transparency_center_2', name: 'Data & Model Transparency 2' },
    { id: 'samvaya_forecast_operations_system_status_center', name: 'Operations System Status' }
  ],
  'LANDINGS & ATMOSPHERIC STATES': [
    { id: 'samvaya_atmospheric_intelligence_landing', name: 'Atmospheric Intelligence Landing' },
    { id: 'samvaya_atmospheric_intelligence_desktop_landing', name: 'Desktop Landing Experience' },
    { id: 'samvaya_clear_sunny_atmospheric_state', name: 'Clear / Sunny Atmospheric State' },
    { id: 'samvaya_cloudy_overcast_atmospheric_state', name: 'Cloudy / Overcast Atmospheric State' },
    { id: 'samvaya_rain_precipitation_atmospheric_state', name: 'Rain / Precipitation State' },
    { id: 'samvaya_experience_control_center', name: 'Experience Control Center' },
    { id: 'samvaya_experience_control_center_settings_personalization', name: 'Settings & Personalization' },
    { id: 'samvaya_atmospheric_convergence_mark', name: 'Atmospheric Convergence Mark' },
    { id: 'samvaya_transparency_3d_earth_scene', name: 'Transparency 3D Earth Scene' }
  ]
};

// Generate Global Screen Switcher HTML
function generateSwitcherHtml(currentScreenId, isRoot = false) {
  const prefix = isRoot ? 'pages/' : '';
  const rootLink = isRoot ? 'index.html' : '../index.html';

  let optionsHtml = '';
  for (const [catName, screens] of Object.entries(screenCategories)) {
    optionsHtml += `<optgroup label="${catName}">`;
    screens.forEach(s => {
      const selected = s.id === currentScreenId ? 'selected' : '';
      const href = s.id === 'samvaya_unified_atmospheric_home' && isRoot ? 'index.html' : `${prefix}${s.id}.html`;
      optionsHtml += `<option value="${href}" ${selected}>${s.name}</option>`;
    });
    optionsHtml += `</optgroup>`;
  }

  return `
<!-- SAMVAYA STITCH AUTHORITATIVE 35-SCREEN NAVIGATOR -->
<div id="samvaya-stitch-navigator" style="position: fixed; bottom: 16px; right: 16px; z-index: 99999; font-family: 'Inter', sans-serif;">
  <div style="background: rgba(31, 27, 23, 0.94); backdrop-filter: blur(16px); color: #fff8f5; border: 1px solid rgba(221, 193, 179, 0.35); border-radius: 9999px; padding: 6px 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.35); display: flex; items-center; gap: 10px; font-size: 12px; align-items: center;">
    <div style="display: flex; items-center; gap: 6px; align-items: center;">
      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 9999px; background: #c25e1a; animation: pulse 2s infinite;"></span>
      <strong style="color: #ffdbca; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.08em;">STITCH SCREEN:</strong>
    </div>
    <select onchange="if(this.value) window.location.href=this.value;" style="background: #342f2b; color: #fff8f5; border: 1px solid #897267; border-radius: 9999px; padding: 4px 10px; font-size: 12px; outline: none; cursor: pointer; max-width: 250px;">
      ${optionsHtml}
    </select>
    <a href="${rootLink}" title="Home" style="color: #ffdbca; text-decoration: none; font-weight: bold; font-size: 13px; display: flex; align-items: center;">
      <span class="material-symbols-outlined" style="font-size: 16px;">home</span>
    </a>
  </div>
</div>
`;
}

// Link Replacer for inter-page navigation
function replaceInterPageLinks(html, isRoot = false) {
  const p = isRoot ? 'pages/' : '';
  let updated = html;

  // Header Nav Links
  updated = updated.replace(/data-path="explore" href="#"/g, `data-path="explore" href="${isRoot ? 'index.html' : '../index.html'}"`);
  updated = updated.replace(/data-path="forecast" href="#"/g, `data-path="forecast" href="${p}samvaya_location_forecast_explorer_mysuru.html"`);
  updated = updated.replace(/data-path="(intelligence|temporal-intelligence)" href="#"/g, `data-path="intelligence" href="${p}samvaya_forecast_intelligence_model_lab.html"`);
  updated = updated.replace(/data-path="history" href="#"/g, `data-path="history" href="${p}samvaya_forecast_replay_verification_lab.html"`);

  return updated;
}

console.log('Reconciling all 35 Stitch screens into dedicated pages...');

let builtCount = 0;
for (const [catName, screens] of Object.entries(screenCategories)) {
  for (const s of screens) {
    const srcPath = path.join(STITCH_DIR, s.id, 'code.html');
    if (!fs.existsSync(srcPath)) {
      console.warn(`Missing source file for ${s.id}: ${srcPath}`);
      continue;
    }

    let codeHtml = fs.readFileSync(srcPath, 'utf8');

    // Process for standalone page in pages/
    let pageHtml = replaceInterPageLinks(codeHtml, false);
    const switcherHtml = generateSwitcherHtml(s.id, false);
    pageHtml = pageHtml.replace('</body>', `${switcherHtml}</body>`);

    const destPage = path.join(PAGES_DIR, `${s.id}.html`);
    fs.writeFileSync(destPage, pageHtml, 'utf8');
    builtCount++;

    // If this is the unified atmospheric home, also update root index.html
    if (s.id === 'samvaya_unified_atmospheric_home') {
      let rootHtml = replaceInterPageLinks(codeHtml, true);
      const rootSwitcher = generateSwitcherHtml(s.id, true);
      rootHtml = rootHtml.replace('</body>', `${rootSwitcher}</body>`);
      fs.writeFileSync(ROOT_INDEX, rootHtml, 'utf8');
      console.log('✓ Reconciled root index.html with samvaya_unified_atmospheric_home');
    }
  }
}

console.log(`Successfully built ${builtCount} dedicated Stitch pages in frontend/pages/ and updated root index.html!`);
