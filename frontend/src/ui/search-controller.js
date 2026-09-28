/**
 * SAMVAYA Search & Geocoding UI Controller
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

import { appStore } from '../state/store.js';
import { Actions } from '../state/actions.js';
import { reverseGeocodeApi } from '../services/api.js';

export class SearchController {
  constructor(globeController) {
    this.globe = globeController;
    this.searchInput = document.getElementById('searchInput');
    this.searchResults = document.getElementById('searchResults');
    this.clearSearchBtn = document.getElementById('clearSearchBtn');
    this.btnMyLocation = document.getElementById('btnMyLocation');
    this.debounceTimeout = null;

    this.initEvents();
    this.initSubscriptions();
  }

  initEvents() {
    // ⌘K / Ctrl+K Shortcut to focus search
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (this.searchInput) {
          this.searchInput.focus();
          this.searchInput.select();
        }
      }
    });

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (this.clearSearchBtn) {
          if (query.length > 0) this.clearSearchBtn.classList.remove('hidden');
          else this.clearSearchBtn.classList.add('hidden');
        }

        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => this.executeSearch(query), 300);
      });

      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.searchResults) {
          this.searchResults.classList.add('hidden');
        }
      });
    }

    if (this.clearSearchBtn) {
      this.clearSearchBtn.addEventListener('click', () => {
        if (this.searchInput) this.searchInput.value = '';
        this.clearSearchBtn.classList.add('hidden');
        if (this.searchResults) this.searchResults.classList.add('hidden');
      });
    }

    if (this.btnMyLocation) {
      this.btnMyLocation.addEventListener('click', () => this.handleUseMyLocation());
    }

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
      if (this.searchResults && !e.target.closest('#searchInput') && !e.target.closest('#searchResults')) {
        this.searchResults.classList.add('hidden');
      }
    });
  }

  async handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    this.btnMyLocation.innerHTML = `
      <span class="material-symbols-outlined text-[16px] animate-spin">sync</span>
      <span>Locating...</span>
    `;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const geoInfo = await reverseGeocodeApi(lat, lon);

        Actions.setLocation({
          latitude: lat,
          longitude: lon,
          name: geoInfo.name || 'My Location',
          region: geoInfo.region || 'Local Domain',
          country: 'India',
          source: 'GPS'
        });

        if (this.globe) {
          this.globe.flyToLocation(lat, lon, 350000);
        }

        this.btnMyLocation.innerHTML = `
          <span class="material-symbols-outlined text-[16px]">my_location</span>
          <span>Use My Location</span>
        `;
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        this.btnMyLocation.innerHTML = `
          <span class="material-symbols-outlined text-[16px]">my_location</span>
          <span>Use My Location</span>
        `;
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  async executeSearch(query) {
    if (!query || query.trim().length < 2) {
      if (this.searchResults) this.searchResults.classList.add('hidden');
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
      this.searchResults.innerHTML = '<div class="p-3 text-xs text-on-surface-variant font-body-sm">No observatory locations found.</div>';
      this.searchResults.classList.remove('hidden');
      return;
    }

    this.searchResults.innerHTML = items.map((item, idx) => `
      <div class="search-item px-3 py-2 hover:bg-surface-container flex items-center gap-2 cursor-pointer transition-colors border-b border-surface-container-high last:border-0" data-idx="${idx}">
        <span class="material-symbols-outlined text-[18px] text-primary">pin_drop</span>
        <div class="flex flex-col min-w-0">
          <span class="font-bold text-sm text-on-surface truncate">${item.name || item.display_name.split(',')[0]}</span>
          <span class="text-[11px] text-on-surface-variant truncate">${item.display_name}</span>
        </div>
      </div>
    `).join('');

    this.searchResults.classList.remove('hidden');

    this.searchResults.querySelectorAll('.search-item').forEach(el => {
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

          if (this.globe) {
            this.globe.flyToLocation(lat, lon, 400000);
          }

          this.searchResults.classList.add('hidden');
          if (this.searchInput) this.searchInput.value = name;
        }
      });
    });
  }

  initSubscriptions() {
    appStore.select(state => state.location, (loc) => {
      if (loc && loc.source === 'GLOBE_CLICK' && this.searchInput) {
        this.searchInput.value = loc.name;
      }
    });
  }
}
