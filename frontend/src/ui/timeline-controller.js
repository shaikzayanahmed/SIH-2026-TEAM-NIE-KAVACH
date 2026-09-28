/**
 * SAMVAYA Universal Atmospheric Timeline Controller
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

import { appStore } from '../state/store.js';
import { Actions } from '../state/actions.js';

export class TimelineController {
  constructor() {
    this.playBtn = document.getElementById('timelinePlayBtn');
    this.track = document.getElementById('timelineTrack');
    this.progressFill = this.track?.querySelector('.timeline-progress-fill');
    this.thumbPin = this.track?.querySelector('.timeline-thumb-pin');
    this.timestampDisplay = document.getElementById('timelineTimestamp');

    this.isDragging = false;
    this.playbackInterval = null;

    this.initEvents();
    this.initSubscriptions();
  }

  initEvents() {
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        const isPlaying = appStore.getState().time.isPlaying;
        Actions.setPlayback(!isPlaying);
      });
    }

    if (this.track) {
      this.track.addEventListener('click', (e) => {
        this.seekFromMouseEvent(e);
      });

      this.track.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.seekFromMouseEvent(e);
      });

      window.addEventListener('mousemove', (e) => {
        if (this.isDragging) {
          this.seekFromMouseEvent(e);
        }
      });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });
    }
  }

  seekFromMouseEvent(e) {
    if (!this.track) return;
    const rect = this.track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

    // Timeline Span: -24h (0%) to 0h NOW (16.6%) to +120h (100%)
    // Total span = 144 hours. -24h is offset 0.
    const offsetHours = Math.round(ratio * 144 - 24);
    Actions.setTimeOffset(offsetHours);
  }

  initSubscriptions() {
    // Time state subscription
    appStore.select(state => state.time, (time) => {
      if (!time) return;

      // Calculate ratio: (-24h = 0%, 0h = 16.66%, +120h = 100%)
      const totalSpan = 144;
      const ratio = Math.max(0, Math.min(1, (time.relativeOffset + 24) / totalSpan));
      const pct = (ratio * 100).toFixed(1) + '%';

      if (this.progressFill) this.progressFill.style.width = pct;
      if (this.thumbPin) this.thumbPin.style.left = pct;

      // Update Play Button Icon
      if (this.playBtn) {
        const icon = this.playBtn.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.textContent = time.isPlaying ? 'pause' : 'play_arrow';
        }
      }

      // Handle Playback Interval
      if (time.isPlaying && !this.playbackInterval) {
        this.playbackInterval = setInterval(() => {
          const currentOffset = appStore.getState().time.relativeOffset;
          let nextOffset = currentOffset + 1 * (time.playbackSpeed || 1);
          if (nextOffset > 120) nextOffset = -24; // loop back
          Actions.setTimeOffset(nextOffset);
        }, 600);
      } else if (!time.isPlaying && this.playbackInterval) {
        clearInterval(this.playbackInterval);
        this.playbackInterval = null;
      }

      // Update Formatted Time Display
      if (this.timestampDisplay) {
        const date = new Date(time.timestamp);
        const hoursStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

        let modeLabel = 'NOW (T+00h)';
        if (time.relativeOffset < 0) {
          modeLabel = `T${time.relativeOffset}h (PAST)`;
        } else if (time.relativeOffset > 0) {
          modeLabel = `T+${time.relativeOffset}h (FORECAST)`;
        }

        this.timestampDisplay.textContent = `${modeLabel} · ${dateStr} ${hoursStr} UTC+05:30`;
      }
    });
  }
}
