/**
 * SAMVAYA Development Atmospheric Inspector & Weather Test Controls
 * For Visual QA and testing without altering scientific backend calculations.
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

import { appStore } from '../state/store.js';
import { Actions } from '../state/actions.js';

export class DevInspectorController {
  constructor() {
    this.createDevHUD();
    this.initEvents();
    this.initSubscriptions();
  }

  createDevHUD() {
    const existing = document.getElementById('samvayaDevInspector');
    if (existing) existing.remove();

    const devHUD = document.createElement('div');
    devHUD.id = 'samvayaDevInspector';
    devHUD.className = 'card-translucent';
    devHUD.style.cssText = `
      position: absolute;
      bottom: 42px;
      right: var(--space-md);
      z-index: 35;
      width: 260px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      font-family: var(--font-mono);
      font-size: 11px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      border: 1px dashed rgba(244, 168, 54, 0.4);
      background: rgba(16, 20, 27, 0.92);
      pointer-events: auto;
    `;

    devHUD.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 4px;">
        <span style="color: var(--samvaya-saffron-400); font-weight: bold;">🛠️ DEV WEATHER QA</span>
        <button id="devToggleCollapse" class="samvaya-btn btn-ghost" style="padding: 2px 5px; font-size: 10px;">HIDE</button>
      </div>

      <div id="devControlsBody" style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <span style="color: var(--samvaya-sand-400); font-size: 10px;">FORCE WEATHER STATE:</span>
          <select id="devWeatherSelect" style="background: var(--samvaya-obs-surface-3); color: var(--samvaya-ivory-100); border: 1px solid var(--color-border-medium); border-radius: var(--radius-xs); padding: 3px 6px; font-family: var(--font-mono); font-size: 11px; outline: none;">
            <option value="">⚡ Auto (Backend Live)</option>
            <option value="CLEAR">☀️ CLEAR</option>
            <option value="CLOUDY">⛅ CLOUDY</option>
            <option value="OVERCAST">☁️ OVERCAST</option>
            <option value="RAIN">🌧️ RAIN</option>
            <option value="HEAVY_RAIN">⛈️ HEAVY RAIN</option>
            <option value="STORM">🌪️ STORM</option>
            <option value="EXTREME_HEAT">🔥 EXTREME HEAT</option>
            <option value="FOG">🌫️ FOG / MIST</option>
            <option value="WIND">💨 WIND</option>
            <option value="COLD">❄️ COLD</option>
            <option value="SNOW">🌨️ SNOW</option>
            <option value="UNCERTAINTY">📊 UNCERTAINTY</option>
          </select>
        </div>

        <div style="display: flex; flex-direction: column; gap: 3px;">
          <span style="color: var(--samvaya-sand-400); font-size: 10px;">FORCE DIURNAL CYCLE:</span>
          <select id="devTimeSelect" style="background: var(--samvaya-obs-surface-3); color: var(--samvaya-ivory-100); border: 1px solid var(--color-border-medium); border-radius: var(--radius-xs); padding: 3px 6px; font-family: var(--font-mono); font-size: 11px; outline: none;">
            <option value="">🕒 Auto (Solar Position)</option>
            <option value="DAY">☀️ DAY</option>
            <option value="DAWN">🌅 DAWN</option>
            <option value="DUSK">🌆 DUSK</option>
            <option value="NIGHT">🌙 NIGHT</option>
          </select>
        </div>

        <div style="display: flex; flex-direction: column; gap: 3px;">
          <span style="color: var(--samvaya-sand-400); font-size: 10px;">MODEL AGREEMENT QA:</span>
          <select id="devAgreementSelect" style="background: var(--samvaya-obs-surface-3); color: var(--samvaya-ivory-100); border: 1px solid var(--color-border-medium); border-radius: var(--radius-xs); padding: 3px 6px; font-family: var(--font-mono); font-size: 11px; outline: none;">
            <option value="">⚡ Auto (Backend Live)</option>
            <option value="HIGH">🟢 HIGH AGREEMENT</option>
            <option value="MODERATE">🟡 MODERATE AGREEMENT</option>
            <option value="DIVERGENT">🔴 DIVERGENT SPREAD</option>
          </select>
        </div>

        <div style="display: flex; flex-direction: column; gap: 3px;">
          <span style="color: var(--samvaya-sand-400); font-size: 10px;">INTENSITY MODE:</span>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3px;">
            <button class="samvaya-btn btn-scientific dev-intensity-btn" data-int="minimal">MIN</button>
            <button class="samvaya-btn btn-scientific dev-intensity-btn" data-int="balanced">BAL</button>
            <button class="samvaya-btn btn-scientific dev-intensity-btn" data-int="immersive">IMM</button>
          </div>
        </div>

        <div id="devStateReadout" style="font-size: 10px; color: var(--samvaya-sand-400); padding: 4px; background: var(--samvaya-obs-surface-0); border-radius: var(--radius-xs); line-height: 1.4;">
          State: READY
        </div>
      </div>
    `;

    document.body.appendChild(devHUD);
  }

  initEvents() {
    const weatherSelect = document.getElementById('devWeatherSelect');
    const timeSelect = document.getElementById('devTimeSelect');
    const agreementSelect = document.getElementById('devAgreementSelect');
    const toggleBtn = document.getElementById('devToggleCollapse');
    const controlsBody = document.getElementById('devControlsBody');
    const intensityBtns = document.querySelectorAll('.dev-intensity-btn');

    if (weatherSelect) {
      weatherSelect.addEventListener('change', (e) => {
        Actions.setDevWeatherOverride(e.target.value || null);
      });
    }

    if (timeSelect) {
      timeSelect.addEventListener('change', (e) => {
        Actions.setDevTimeOfDayOverride(e.target.value || null);
      });
    }

    if (agreementSelect) {
      agreementSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          appStore.setState({
            models: {
              agreement: val,
              disagreement: val === 'DIVERGENT' ? 'HIGH' : 'LOW'
            }
          });
        }
      });
    }

    if (toggleBtn && controlsBody) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = controlsBody.style.display === 'none';
        controlsBody.style.display = isHidden ? 'flex' : 'none';
        toggleBtn.textContent = isHidden ? 'HIDE' : 'SHOW';
      });
    }

    intensityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const intVal = btn.getAttribute('data-int');
        Actions.setAtmosphericIntensity(intVal);
      });
    });
  }

  initSubscriptions() {
    const readout = document.getElementById('devStateReadout');
    appStore.subscribe((state) => {
      if (!readout) return;
      readout.innerHTML = `
        <div><b>Mood:</b> ${state.atmospheric.weatherState} | <b>Sun:</b> ${state.atmospheric.timeOfDay}</div>
        <div><b>Loc:</b> ${state.location.name}</div>
        <div><b>Particles:</b> ${state.atmospheric.visualProfile.particleDensity} (${state.atmospheric.visualProfile.particleType})</div>
        <div><b>Agreement:</b> ${state.models.agreement} | <b>Conf:</b> ${state.models.confidence}</div>
      `;
    });
  }
}
