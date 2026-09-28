# 🌍 3D Globe & Location Search Demo

A clean, standalone demo featuring a photorealistic 3D Globe with interactive real-time location searching.

## ✨ Features Included
- **Photorealistic 3D Globe**: Built with CesiumJS with atmospheric glow, dynamic lighting, and orbital controls.
- **Global Search & Autocomplete**: Search any city, country, landmark, or raw coordinates (`lat, lon`) using live OpenStreetMap / Nominatim geocoding.
- **Cinematic Fly-To**: Smooth camera flight animations with 3D tilt and glowing beacon pin drop at the target location.
- **Preset Chips**: One-click flight to major global hubs (New Delhi, Mumbai, Bengaluru, Tokyo, London, New York, Mt. Everest).
- **Basemap Switcher**: Toggle between ESRI Photorealistic Satellite, OpenStreetMap Standard, and CartoDB Dark Tactical basemaps.
- **Live Telemetry HUD**: Real-time cursor coordinates (Latitude / Longitude) and camera altitude readouts.

## 🚀 How to Run

### Option 1: Direct in Browser
Simply open [`index.html`](index.html) in any modern browser.

### Option 2: Using Local HTTP Server
From this `demo` directory or workspace root:
```bash
# Using Python
python3 -m http.server 8080

# Or using Node / npx
npx serve demo
```
Then navigate to `http://localhost:8080/demo/` in your browser.
