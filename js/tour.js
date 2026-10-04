/*
 * tour.js — First-time walkthrough (Task 1.1)
 * -------------------------------------------------------------
 * A lightweight, skippable guided tour that spotlights the main
 * interface elements. Shown automatically on first visit (tracked in
 * localStorage) and re-openable from the header "?" button.
 */

(function (global) {
  'use strict';

  const SEEN_KEY = 'mr_tour_seen_v1';

  const STEPS = [
    {
      sel: '.viewer',
      title: 'The Observation Deck',
      body: 'Each round drops you into a mysterious location across the multiverse. Study the visual feed for clues.'
    },
    {
      sel: '.map-panel',
      title: 'The Nexus Map',
      body: 'Click anywhere on the world map to drop your guess marker. Drag it to fine-tune — you can also zoom and pan.'
    },
    {
      sel: '.hud',
      title: 'Timeline Status',
      body: 'Track the round, your cumulative score, any streak multiplier, and the countdown timer here.'
    },
    {
      sel: '#lock-btn',
      title: 'Lock the Convergence',
      body: 'Happy with your guess? Lock it in. We compute the great-circle distance to the true location and award points — closer is better.'
    },
    {
      sel: '#difficulty-select',
      title: 'Choose Your Reality',
      body: 'Easy allows hints and no timer; Hard adds a strict countdown and a zoomed-in feed. Pick your challenge, Agent.'
    }
  ];

  function Tour() {
    this.overlay = null;
    this.i = 0;
  }

  Tour.prototype.shouldAutoStart = function () {
    try {
      return !localStorage.getItem(SEEN_KEY);
    } catch (e) {
      return true;
    }
  };

  Tour.prototype.markSeen = function () {
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch (e) {}
  };

  Tour.prototype.start = function () {
    this.i = 0;
    this._build();
    this._render();
  };

  Tour.prototype._build = function () {
    if (this.overlay) return;
    const o = document.createElement('div');
    o.className = 'tour-overlay';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.setAttribute('aria-label', 'Game walkthrough');
    o.innerHTML =
      '<div class="tour-spot" aria-hidden="true"></div>' +
      '<div class="tour-card">' +
      '<p class="tour-step" id="tour-step"></p>' +
      '<h3 class="tour-title" id="tour-title"></h3>' +
      '<p class="tour-body" id="tour-body"></p>' +
      '<div class="tour-actions">' +
      '<button type="button" class="btn btn-ghost" id="tour-skip">Skip tour</button>' +
      '<div class="tour-nav">' +
      '<button type="button" class="btn btn-ghost" id="tour-prev">Back</button>' +
      '<button type="button" class="btn btn-primary" id="tour-next">Next</button>' +
      '</div></div></div>';
    document.body.appendChild(o);
    this.overlay = o;

    const self = this;
    o.querySelector('#tour-skip').addEventListener('click', function () {
      self.end();
    });
    o.querySelector('#tour-prev').addEventListener('click', function () {
      self.i = Math.max(0, self.i - 1);
      self._render();
    });
    o.querySelector('#tour-next').addEventListener('click', function () {
      if (self.i >= STEPS.length - 1) {
        self.end();
      } else {
        self.i += 1;
        self._render();
      }
    });
    o.addEventListener('click', function (e) {
      if (e.target === o) self.end();
    });
    this._keyHandler = function (e) {
      if (e.key === 'Escape') self.end();
      else if (e.key === 'ArrowRight') o.querySelector('#tour-next').click();
      else if (e.key === 'ArrowLeft') o.querySelector('#tour-prev').click();
    };
    document.addEventListener('keydown', this._keyHandler);
  };

  Tour.prototype._render = function () {
    const step = STEPS[this.i];
    const target = document.querySelector(step.sel);
    const spot = this.overlay.querySelector('.tour-spot');
    const card = this.overlay.querySelector('.tour-card');

    this.overlay.querySelector('#tour-step').textContent =
      'Step ' + (this.i + 1) + ' of ' + STEPS.length;
    this.overlay.querySelector('#tour-title').textContent = step.title;
    this.overlay.querySelector('#tour-body').textContent = step.body;
    this.overlay.querySelector('#tour-prev').disabled = this.i === 0;
    this.overlay.querySelector('#tour-next').textContent =
      this.i >= STEPS.length - 1 ? 'Start playing' : 'Next';

    if (target) {
      const r = target.getBoundingClientRect();
      const pad = 8;
      spot.style.display = 'block';
      spot.style.top = r.top - pad + 'px';
      spot.style.left = r.left - pad + 'px';
      spot.style.width = r.width + pad * 2 + 'px';
      spot.style.height = r.height + pad * 2 + 'px';

      // Position the card near the target but keep it on-screen.
      const cardTop = Math.min(
        window.innerHeight - 220,
        Math.max(16, r.bottom + 12)
      );
      card.style.top = cardTop + 'px';
      card.style.left =
        Math.min(window.innerWidth - 360, Math.max(16, r.left)) + 'px';
      target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      spot.style.display = 'none';
      card.style.top = '50%';
      card.style.left = '50%';
      card.style.transform = 'translate(-50%, -50%)';
    }
  };

  Tour.prototype.end = function () {
    this.markSeen();
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
  };

  global.MR_Tour = Tour;
})(window);
