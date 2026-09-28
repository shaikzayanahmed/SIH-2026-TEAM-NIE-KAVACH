/**
 * SAMVAYA Dynamic Atmospheric Legend & Opacity Controller
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

import { appStore } from '../state/store.js';
import { Actions } from '../state/actions.js';

export class LegendController {
  constructor(layerManager, globeController) {
    this.layerManager = layerManager;
    this.globe = globeController;

    this.createLegendContainer();
    this.initEvents();
    this.initSubscriptions();
  }

  createLegendContainer() {
    let container = document.getElementById('samvayaDynamicLegend');
    if (container) container.remove();

    container = document.createElement('div');
    container.id = 'samvayaDynamicLegend';
    container.className = 'card-translucent';
    container.style.cssText = `
      position: absolute;
      bottom: 42px;
      left: var(--space-md);
      z-index: 30;
      width: 290px;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-clay-lg);
      font-family: var(--font-sans);
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: auto;
    `;

    document.body.appendChild(container);
    this.container = container;
  }

  render(layerConfig) {
    if (!this.container || !layerConfig) return;

    const legend = layerConfig.legend || {
      title: layerConfig.name,
      min: 'Min',
      max: 'Max',
      unit: layerConfig.unit || '',
      gradient: 'linear-gradient(90deg, #5D9CBF 0%, #F4A836 100%)',
      ticks: ['Min', 'Mid', 'Max']
    };

    const typeBadgeClass = layerConfig.type === 'OBSERVED' ? 'status-live' : (layerConfig.type === 'EARLY WARNING' ? 'status-uncertain' : 'status-synced');

    this.container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
        <div>
          <div style="font-size: 13px; font-weight: 600; color: var(--samvaya-ivory-100); line-height: 1.2;">${legend.title}</div>
          <div style="font-family: var(--font-mono); font-size: 10px; color: var(--samvaya-sand-400); margin-top: 2px;">
            ${layerConfig.source}
          </div>
        </div>
        <span class="status-pill ${typeBadgeClass}" style="font-size: 9px; padding: 2px 6px; flex-shrink: 0;">
          ${layerConfig.type}
        </span>
      </div>

      <!-- Color Gradient Bar with Ticks -->
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="height: 8px; width: 100%; border-radius: var(--radius-pill); background: ${legend.gradient}; border: 1px solid var(--color-border-subtle);"></div>
        <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 10px; color: var(--samvaya-sand-400);">
          ${legend.ticks.map(t => `<span>${t}</span>`).join('')}
        </div>
      </div>

      <!-- Layer Opacity & Globe Mode Controls -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--color-border-subtle); padding-top: 8px; font-family: var(--font-mono); font-size: 11px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="color: var(--samvaya-warmgrey-500);">OPACITY:</span>
          <input 
            type="range" 
            id="layerOpacitySlider" 
            min="0" 
            max="100" 
            value="${Math.round(this.layerManager.layerOpacity * 100)}" 
            style="width: 75px; accent-color: var(--samvaya-saffron-400); cursor: pointer;"
          />
          <span id="layerOpacityVal" style="color: var(--samvaya-ivory-100);">${Math.round(this.layerManager.layerOpacity * 100)}%</span>
        </div>

        <div style="display: flex; gap: 3px;">
          <button class="samvaya-btn btn-scientific globe-mode-btn" data-mode="global" title="Global Earth View">GLOBAL</button>
          <button class="samvaya-btn btn-scientific globe-mode-btn active" data-mode="regional" title="Indian Subcontinent Domain">INDIA</button>
          <button class="samvaya-btn btn-scientific globe-mode-btn" data-mode="local" title="Focus Local Target">LOCAL</button>
        </div>
      </div>
    `;

    this.bindControls();
  }

  bindControls() {
    const slider = document.getElementById('layerOpacitySlider');
    const valText = document.getElementById('layerOpacityVal');

    if (slider) {
      slider.addEventListener('input', (e) => {
        const opacity = parseFloat(e.target.value) / 100;
        this.layerManager.setOpacity(opacity);
        if (valText) valText.textContent = `${e.target.value}%`;
      });
    }

    const modeBtns = document.querySelectorAll('.globe-mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.getAttribute('data-mode');
        const state = appStore.getState();

        if (mode === 'global') {
          this.globe.flyTo(78.9629, 20.5937, 12000000, -85.0);
        } else if (mode === 'regional') {
          this.globe.flyHome();
        } else if (mode === 'local') {
          this.globe.flyTo(state.location.longitude, state.location.latitude, 35000, -55.0);
        }
      });
    });
  }

  initEvents() {
    // Events bound during render
  }

  initSubscriptions() {
    appStore.select(state => state.globe.activeLayerParam, (paramId) => {
      const layerConfig = this.layerManager.getLayer(paramId || 'radar');
      if (layerConfig) {
        this.layerManager.setActiveLayer(layerConfig.id);
        this.render(layerConfig);
      }
    });
  }
}
