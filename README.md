# 🛰️ Bird View — Meteorological Forecast Fusion Platform
### **Smart India Hackathon (SIH 2026) · TEAM NIE KAVACH**

> **AI-Powered Multi-Source Atmospheric Intelligence & Geospatial Fusion Engine**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20GIS%20%7C%20AI-0284c7)]()

---

## 🌟 Executive Overview

**Bird View** is an advanced next-generation meteorological decision-support and forecast fusion terminal built for **SIH 2026** by **Team NIE KAVACH**. The system synthesizes high-resolution satellite telemetry, dynamic numerical weather models (ECMWF, GFS, WRF, NCMRWF), Doppler radar sweeps, and deep learning geospatial layers to provide authoritative forecasting, extreme weather early warning, and 3D atmospheric computation.

---

## 🚀 Quick Start

### 1. Preview the UI Hub Locally
```bash
# Serve the portal and explore all screens
npm run dev
```
Then open `http://localhost:8085` in your browser.

### 2. Start the live forecast API
In a second terminal:
```bash
npm run api
```
The live API runs at `http://localhost:8000` and exposes:

```text
GET /health
GET /api/v1/snapshot
GET /api/v1/overview
GET /api/v1/forecast/blended
GET /api/v1/weights/map
```

The current live slice fetches four public model forecasts through Open-Meteo: ECMWF IFS, GFS, ICON, and GEM. It uses equal-weight blending until historical observation data is connected. NCUM, NEPS, BharatFS, and GraphCast remain separate adapter targets because their operational outputs are not exposed as one stable unauthenticated API.

See [docs/implementation-plan.md](docs/implementation-plan.md) for the phased build plan and scientific constraints.

---

## 👥 Team
- **Team**: NIE KAVACH
- **Event**: Smart India Hackathon (SIH 2026)
- **Lead / Developer**: [@shaikzayanahmed](https://github.com/shaikzayanahmed)
