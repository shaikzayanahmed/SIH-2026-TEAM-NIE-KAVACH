---
name: Atmospheric Intelligence Fusion
colors:
  surface: '#fff8f5'
  surface-dim: '#e2d8d2'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf2eb'
  surface-container: '#f6ece6'
  surface-container-high: '#f0e6e0'
  surface-container-highest: '#eae1da'
  on-surface: '#1f1b17'
  on-surface-variant: '#564339'
  inverse-surface: '#342f2b'
  inverse-on-surface: '#f9efe8'
  outline: '#897267'
  outline-variant: '#ddc1b3'
  surface-tint: '#9c4400'
  primary: '#984300'
  on-primary: '#ffffff'
  primary-container: '#ba5814'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb68e'
  secondary: '#5a6240'
  on-secondary: '#ffffff'
  secondary-container: '#dce4b9'
  on-secondary-container: '#5e6644'
  tertiary: '#8d4b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#b15f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb68e'
  on-primary-fixed: '#331200'
  on-primary-fixed-variant: '#773300'
  secondary-fixed: '#dee7bc'
  secondary-fixed-dim: '#c2cba1'
  on-secondary-fixed: '#181e04'
  on-secondary-fixed-variant: '#424a2a'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#fff8f5'
  on-background: '#1f1b17'
  surface-variant: '#eae1da'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 52px
    fontWeight: '600'
    lineHeight: 60px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.005em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  telemetry-num:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the warmth, discipline, and tactile precision of high-grade meteorological instrumentation merged with modern atmospheric computational science. Designed for atmospheric scientists, decision-makers, and hydrometeorological analysts, it completely abandons the generic sci-fi tropes of neon cyan grids, dark cyberpunk terminals, and harsh synthetic glows. Instead, it positions environmental computation as an organic, grounded physical discipline—evoking calibrated ivory porcelain sensor housings, natural parchment synoptic charts, terracotta earth sensors, and brushed warm-metal dials.

The visual ethos blends **restrained claymorphism** with **warm atmospheric translucency**. Interfaces feature soft, double-lit tactile extrusions with gentle top-edge ambient specular glazes, paired with low-contrast frosted glass surfaces that simulate micro-thin cloud stratification and barometric isobar layers. It conveys sovereign authority, absolute empirical trustworthiness, and an enduring sense of natural equilibrium.

## Colors

The palette is rooted strictly in natural mineral and atmospheric phenomena: sunlit aerosol layers, dry loess soils, sun-cured terracotta tiles, alpine foliage, and marine ink depths. 

- **Primary (`#C25E1A` - Raw Terracotta)**: Represents terrestrial interaction and core forecast focal points. Used for primary execution targets, high-priority isobar contours, and active operational states.
- **Secondary (`#656D4A` - Muted Olive)**: Represents ground truth observations, stable surface feedback, and verified NWP ensembles.
- **Tertiary (`#D97706` - Muted Saffron Amber)**: Expresses predictive atmospheric energy, convergence alerts, and active AI-NWP weight biases.
- **Neutral (`#78716C` - Warm Stone Slate)**: Governs structural metadata, secondary instrument readings, and perimeter coordinate ticks.

### Canvas & Surface Architecture
- **Base Canvas**: Natural unbleached linen and ivory (`#FAF8F5`).
- **Elevated Instrument Pods (Surface 1)**: Calibrated parchment cream (`#F5F1EA`).
- **Recessed Wells / Deep Slates (Surface Inset)**: Warm limestone grey (`#EFE9DF`).
- **Deep Ocean Ink (`#0F172A`)**: Reserved strictly for high-precision scientific typography, micro barometric data tables, and high-contrast vector wind barbs. Never used as an expansive background fill.

## Typography

Typography balances scientific editorial elegance with cold empirical legibility. 

- **Headlines (Plus Jakarta Sans)**: Rendered with precise kerning, subtle stroke contrast, and natural warm geometry to evoke modern research publications and academic climate treatises.
- **Body & Instrumentation (Inter)**: Deployed with open counters and balanced vertical proportions. All numerical readouts—such as coordinates, hectopascals (hPa), vorticity, and precipitation probabilities—must activate tabular figures (`font-variant-numeric: tabular-nums; lining-nums;`) to prevent dynamic jitter across real-time telemetry updates.
- **Scientific Metadata (`label-caps`)**: Used consistently across sensor tags, coordinate headers, and NWP model version badges. Always styled in uppercase with intentional, generous character spacing (`0.08em`) to guarantee immediate visual parsing under field and command center conditions.

## Layout & Spacing

The structural layout operates on an authoritative **12-column dynamic grid** configured around generous negative space. The spacious canvas mimics architectural drafting tables, giving complex synoptic overlays, thermodynamic diagrams, and satellite matrices room to breathe without sensory overload.

- **Desktop (1280px+)**: 12 columns, 2.5rem outer canvas margins, 1.5rem gutters. Floating instrument pods adhere to strict 3-col, 4-col, 6-col, or full-width spans.
- **Tablet (768px - 1279px)**: 8 columns, 1.5rem margins, 1rem gutters. Horizontal telemetry bars collapse into stacked modular rows.
- **Mobile (< 768px)**: 4 columns, 1rem margins, 0.75rem gutters. Multi-tier visualizers transition to swipeable clay cards or progressive vertical disclosure drawers.

Spacing rhythm enforces a strict 4px/8px modular base. Elements maintain distinct separation zones to prevent tactile overlap between interactive knobs, toggles, and data-dense GIS canvases.

## Elevation & Depth

Visual hierarchy uses a calibrated blend of **soft claymorphic extrusion** and **thin-film atmospheric translucency**, avoiding harsh drop shadows or neon lighting artifacts:

- **Level 0 (Atmospheric Bed)**: Background `#FAF8F5`. Flat matte canvas with optional macro atmospheric particle gradients (5% opacity saffron/olive mist).
- **Level 1 (Recessed Wells / Insets)**: `#EFE9DF` with an internal directional shadow (`inset 0 2px 4px rgba(43, 30, 22, 0.06), inset 0 -1px 2px rgba(255, 255, 255, 0.8)`). Used for slider tracks, input channels, and inactive toggles.
- **Level 2 (Tactile Clay Pods)**: Surfaces in `#F5F1EA`. Extruded via layered dual shadows: a crisp top specular rim (`inset 0 1px 0 rgba(255, 255, 255, 0.9)`) combined with a diffuse warm earth base shadow (`0 4px 16px -2px rgba(74, 53, 37, 0.05), 0 1px 3px rgba(43, 30, 22, 0.04)`).
- **Level 3 (Floating Atmospheric Glass Heads)**: Translucent cream surfaces (`rgba(245, 241, 234, 0.82)`) with backdrop blur filter (`blur(16px) saturate(140%)`), bounded by an ultra-fine mineral border (`1px solid rgba(255, 255, 255, 0.65)`).
- **Level 4 (Modals & Critical Synoptic Overlays)**: Crisp elevation with deep warm diffusion (`0 16px 36px -4px rgba(43, 30, 22, 0.09), 0 4px 12px rgba(74, 53, 37, 0.04)`).

## Shapes

The geometric architecture relies on **calibrated soft curvature**. Standard interactive elements and sensor cards share a baseline radius of `0.5rem` (`roundedness: 2`), reflecting the smooth ergonomic contours of field-grade barographs and weather radar consoles. 

Larger visualizer pods, map frames, and synoptic modals scale to `1rem` (`rounded-lg`), while floating operational pills, telemetry chips, and model switchers employ smooth, continuous concentric curves up to `1.5rem` (`rounded-xl`). Shapes must feel sculpted rather than sharp or aggressively machined.

## Components

### Buttons & Interactive Controls
- **Primary Forecast Trigger**: Rendered in rich Terracotta (`#C25E1A`) with white typography. Features a soft inner highlight on top (`inset 0 1px 1px rgba(255, 255, 255, 0.35)`) and an exterior warm glow (`0 4px 12px rgba(194, 94, 26, 0.25)`). Hovering gently deepens the warm undertone to `#8C4A26`.
- **Secondary Instrument Control**: Claymorphic ivory pod (`#F5F1EA`) with deep ocean ink text (`#0F172A`). Bounded by an ultra-subtle warm grey border (`#EFE9DF`), depressing slightly on interaction via internal inset shading.
- **Ghost/Utility Button**: Transparent base with warm stone slate text (`#475569`) and subtle micro-borders, expanding to faint ivory glass upon hover.

### Atmospheric Telemetry Chips & Pills
Pill-shaped, floating indicators (`rounded-xl`) with frosted ivory backing (`rgba(245, 241, 234, 0.88)`). Telemetry chips feature an embossed status bead:
- **Verified Ground Observation**: Solid muted olive (`#656D4A`).
- **AI Neural NWP Divergence**: Soft saffron amber (`#D97706`).
- **Alert / Anomaly**: Terracotta (`#C25E1A`).
Each chip presents uppercase label metadata alongside high-contrast tabular values.

### Input Fields & Sliders
- **Numeric & Coordinate Input**: Housed inside slightly recessed parchment wells (`#EFE9DF`). Features deep ocean ink text with slate label caps anchored directly above the well. Active focus states emit a precise, restrained warm amber focus ring (`2px solid rgba(217, 119, 6, 0.4)`).
- **Forecast Horizon Sliders**: Recessed linear track with a sculpted circular clay thumb (`#FAF8F5`) crowned by an amber micro-pip, offering tactile feedback during temporal scrubbing.

### Checkboxes & Segmented Matrix Selectors
Custom tactile switches with physical-feeling toggle wells. When engaged, segmented selectors rise out of their background cavity as an extruded, cream-colored active tab, accented by crisp charcoal typography.

### Scientific Data Cards & Synoptic Pods
Encased in Level 2 elevation cards with ivory surface fills (`#F5F1EA`). The card header includes a slim horizontal divider in `#EFE9DF`, upper-right coordinate breadcrumbs in `label-caps`, and generous internal padding (`space-lg`) to preserve visual tranquility even under dense meteorological data streams.