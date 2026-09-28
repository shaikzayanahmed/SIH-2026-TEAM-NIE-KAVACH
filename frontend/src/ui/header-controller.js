/**
 * SAMVAYA Header & Navigation UI Controller
 * Project SIH26081 • Adaptive Atmospheric Forecast Engine
 */

import { appStore } from '../state/store.js';
import { Actions } from '../state/actions.js';

export class HeaderController {
  constructor() {
    this.navButtons = document.querySelectorAll('.samvaya-nav .nav-item');
    this.statusPill = document.querySelector('.header-actions .status-pill');

    this.initEvents();
    this.initSubscriptions();
  }

  initEvents() {
    this.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) {
          Actions.setNavigation(tab);
        }
      });
    });
  }

  initSubscriptions() {
    // Navigation State Subscription
    appStore.select(state => state.navigation.activeSection, (section) => {
      this.navButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === section) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    });

    // System Status Subscription
    appStore.select(state => state.system, (sys) => {
      if (!this.statusPill) return;
      this.statusPill.className = 'status-pill';

      const statusText = this.statusPill.querySelector('span:last-child');
      if (sys.degraded) {
        this.statusPill.classList.add('status-degraded');
        if (statusText) statusText.textContent = 'DEGRADED';
      } else if (sys.loading) {
        this.statusPill.classList.add('status-processing');
        if (statusText) statusText.textContent = 'SYNCING';
      } else {
        this.statusPill.classList.add('status-live');
        if (statusText) statusText.textContent = 'LIVE NODE';
      }
    });
  }
}
