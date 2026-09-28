/**
 * SAMVAYA Search & Geocoding UI Controller
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

import { appStore } from '../state/store.js';
import { Actions } from '../state/actions.js';

export class SearchController {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.searchResults = document.getElementById('searchResults');
    this.clearSearchBtn = document.getElementById('clearSearchBtn');
    this.presetChips = document.querySelectorAll('.preset-chip');
    this.debounceTimeout = null;

    this.initEvents();
    this.initSubscriptions();
  }

  initEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (this.clearSearchBtn) this.clearSearchBtn.style.display = query.length > 0 ? 'inline-flex' : 'none';

        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => this.executeSearch(query), 300);
      });

      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.searchResults) {
          this.searchResults.style.display = 'none';
        }
      });
    }

    if (this.clearSearchBtn) {
      this.clearSearchBtn.addEventListener('click', () => {
        if (this.searchInput) this.searchInput.value = '';
        this.clearSearchBtn.style.display = 'none';
        if (this.searchResults) this.searchResults.style.display = 'none';
      });
    }

    // Preset Chips
    this.presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const lat = parseFloat(chip.getAttribute('data-lat'));
        const lon = parseFloat(chip.getAttribute('data-lon'));
        const name = chip.getAttribute('data-name');

        Actions.setLocation({
          latitude: lat,
          longitude: lon,
          name: name,
          region: 'Preset Location',
          country: 'India',
          source: 'PRESET'
        });

        if (this.searchResults) this.searchResults.style.display = 'none';
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (this.searchResults && !e.target.closest('.search-box-card')) {
        this.searchResults.style.display = 'none';
      }
    });
  }

  async executeSearch(query) {
    if (!query || query.trim().length < 2) {
      if (this.searchResults) this.searchResults.style.display = 'none';
      return;
    }

    // Coordinates match: "28.61, 77.20"
    const coordMatch = query.match(/^([-+]?\d{1,3}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        this.renderResults([{
          name: `Lat: ${lat.toFixed(4)}°, Lon: ${lon.toFixed(4)}°`,
          display_name: `Coordinates: ${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`,
          lat,
          lon
        }]);
        return;
      }
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`);
      if (!res.ok) return;
      const items = await res.json();
      this.renderResults(items);
    } catch (err) {
      console.warn('Nominatim search failed:', err);
    }
  }

  renderResults(items) {
    if (!this.searchResults) return;
    if (!items || items.length === 0) {
      this.searchResults.innerHTML = '<div style="padding: 10px 14px; font-size: 12px; color: var(--samvaya-sand-400);">No results found.</div>';
      this.searchResults.style.display = 'block';
      return;
    }

    this.searchResults.innerHTML = items.map((item, idx) => `
      <div class="search-result-item" data-idx="${idx}">
        <span class="material-symbols-outlined" style="font-size: 16px; color: var(--samvaya-saffron-400);">location_on</span>
        <div>
          <div class="search-result-name">${item.name || item.display_name.split(',')[0]}</div>
          <div class="search-result-sub">${item.display_name}</div>
        </div>
      </div>
    `).join('');

    this.searchResults.style.display = 'block';

    this.searchResults.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        const selected = items[idx];
        if (selected) {
          const lat = parseFloat(selected.lat);
          const lon = parseFloat(selected.lon);
          const name = selected.name || selected.display_name.split(',')[0];

          Actions.setLocation({
            latitude: lat,
            longitude: lon,
            name: name,
            region: selected.display_name,
            country: 'India',
            source: 'SEARCH'
          });

          this.searchResults.style.display = 'none';
        }
      });
    });
  }

  initSubscriptions() {
    // Keep search input synced with location name
    appStore.select(state => state.location.name, (name) => {
      if (this.searchInput && name && document.activeElement !== this.searchInput) {
        this.searchInput.value = name;
        if (this.clearSearchBtn) this.clearSearchBtn.style.display = 'inline-flex';
      }
    });
  }
}
