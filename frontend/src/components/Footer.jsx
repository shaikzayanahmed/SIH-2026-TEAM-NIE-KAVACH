/**
 * SAMVAYA Master Stitch Footer (React JSX)
 * Project SIH26081 • Team NIE KAVACH
 */

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low/95 backdrop-blur-md shadow-[0_-1px_6px_rgba(74,53,37,0.03)] mt-auto">
      <div className="h-14 w-full px-gutter flex flex-col sm:flex-row items-center justify-between gap-space-xs font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant text-center sm:text-left">
        <div className="flex items-center gap-space-sm flex-wrap justify-center sm:justify-start">
          <span>GRID MESH: 0.05° EPS Res (WGS-84)</span>
          <span className="hidden sm:inline">·</span>
          <span>CADENCE: T+03h Synoptic Cycle</span>
          <span className="hidden sm:inline">·</span>
          <span className="text-secondary font-semibold">HYDROMETEOROLOGICAL STREAM: Online (14.2k active nodes)</span>
        </div>
        <div className="shrink-0 font-body-sm text-body-sm text-on-surface-variant">
          © 2025 SAMVAYA SIH26081. EARTH OBSERVATION DIRECTORATE.
        </div>
      </div>
    </footer>
  );
}
