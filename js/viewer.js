/*
 * viewer.js — The Observation Deck / Location Viewer (Task 1.1)
 * -------------------------------------------------------------
 * Displays the current anomaly as a high-quality photo. Photos load
 * at runtime from Wikimedia Commons. If every candidate URL fails,
 * the viewer renders a hand-drawn SVG "anomaly scene" with a
 * recognizable landmark silhouette, so a round is NEVER blank.
 */

(function (global) {
  'use strict';

  // --- SVG landmark silhouettes (fallback only) -----------------
  // Each returns an SVG fragment drawn against a shared horizon
  // around y=360 in a 640x400 viewBox.
  const SIL = {
    eiffel:
      '<path d="M320 90 L332 200 L352 300 L372 360 L268 360 L288 300 L308 200 Z" fill="#1b2330" opacity=".9"/>' +
      '<path d="M300 230 H340 M292 280 H348 M284 330 H356" stroke="#1b2330" stroke-width="6"/>' +
      '<rect x="316" y="70" width="8" height="24" fill="#1b2330"/>',
    colosseum:
      '<path d="M210 360 Q210 250 320 250 Q430 250 430 360 Z" fill="#1b2330"/>' +
      '<g fill="#3a475c"><rect x="235" y="275" width="14" height="30" rx="7"/><rect x="270" y="268" width="14" height="36" rx="7"/><rect x="313" y="265" width="14" height="40" rx="7"/><rect x="356" y="268" width="14" height="36" rx="7"/><rect x="391" y="275" width="14" height="30" rx="7"/></g>',
    liberty:
      '<circle cx="320" cy="150" r="22" fill="#1b2330"/>' +
      '<path d="M305 170 L335 170 L344 360 L296 360 Z" fill="#1b2330"/>' +
      '<path d="M333 150 L352 96" stroke="#1b2330" stroke-width="8"/>' +
      '<circle cx="354" cy="92" r="9" fill="#ffcf6b"/>' +
      '<path d="M320 128 l10 -22 l-20 0 Z M308 132 l-6 -16 M332 132 l6 -16" stroke="#1b2330" stroke-width="4" fill="#1b2330"/>',
    taj:
      '<rect x="250" y="250" width="140" height="110" fill="#1b2330"/>' +
      '<path d="M320 160 Q290 250 250 250 L390 250 Q350 250 320 160 Z" fill="#1b2330"/>' +
      '<rect x="314" y="135" width="12" height="30" fill="#1b2330"/>' +
      '<rect x="214" y="250" width="12" height="110" fill="#2a3550"/><rect x="414" y="250" width="12" height="110" fill="#2a3550"/>',
    opera:
      '<g fill="#1b2330"><path d="M210 360 Q240 270 300 310 Z"/><path d="M280 360 Q310 250 370 300 Z"/><path d="M350 360 Q380 265 440 305 Z"/></g>',
    redeemer:
      '<path d="M316 150 h8 v70 h70 v8 h-70 v132 h-8 V228 h-70 v-8 h70 Z" fill="#1b2330"/>' +
      '<circle cx="320" cy="135" r="12" fill="#1b2330"/>',
    pyramid:
      '<path d="M200 360 L300 210 L400 360 Z" fill="#1b2330"/>' +
      '<path d="M370 360 L430 270 L490 360 Z" fill="#2a3550"/>',
    bigben:
      '<rect x="300" y="120" width="40" height="240" fill="#1b2330"/>' +
      '<circle cx="320" cy="160" r="13" fill="#ffcf6b"/>' +
      '<path d="M300 120 L320 92 L340 120 Z" fill="#1b2330"/>',
    goldengate:
      '<path d="M120 360 V170 M520 360 V170" stroke="#c0392b" stroke-width="10"/>' +
      '<path d="M60 230 Q320 120 580 230" stroke="#c0392b" stroke-width="6" fill="none"/>' +
      '<path d="M60 300 L580 300" stroke="#c0392b" stroke-width="5"/>',
    tokyotower:
      '<path d="M320 100 L300 230 L285 360 L355 360 L340 230 Z" fill="#c0392b"/>' +
      '<path d="M295 260 H345 M288 320 H352" stroke="#ecf0f1" stroke-width="5"/>',
    burj:
      '<path d="M316 70 L326 70 L336 360 L306 360 Z" fill="#1b2330"/>' +
      '<path d="M321 40 L321 70" stroke="#1b2330" stroke-width="4"/>',
    gate:
      '<rect x="250" y="210" width="140" height="150" fill="#1b2330"/>' +
      '<g fill="#0d1017"><rect x="262" y="250" width="16" height="110"/><rect x="292" y="250" width="16" height="110"/><rect x="322" y="250" width="16" height="110"/><rect x="352" y="250" width="16" height="110"/></g>' +
      '<rect x="300" y="185" width="40" height="22" fill="#1b2330"/>',
    moai:
      '<path d="M280 360 Q275 200 320 200 Q365 200 360 360 Z" fill="#1b2330"/>' +
      '<path d="M300 250 q10 15 40 0" stroke="#0d1017" stroke-width="5" fill="none"/>',
    tablemtn:
      '<path d="M120 360 L120 250 L520 250 L520 360 Z" fill="#1b2330"/>' +
      '<path d="M120 250 Q320 235 520 250" stroke="#2a3550" stroke-width="4" fill="none"/>',
    castle:
      '<rect x="270" y="210" width="100" height="150" fill="#1b2330"/>' +
      '<path d="M290 210 L290 160 L310 160 L310 210 Z M330 210 L330 140 L350 140 L350 210 Z" fill="#1b2330"/>' +
      '<path d="M290 160 L300 140 L310 160 Z M330 140 L340 118 L350 140 Z" fill="#2a3550"/>',
    cntower:
      '<rect x="314" y="80" width="12" height="280" fill="#1b2330"/>' +
      '<ellipse cx="320" cy="150" rx="26" ry="12" fill="#1b2330"/>' +
      '<path d="M320 40 L320 80" stroke="#1b2330" stroke-width="4"/>',
    stbasil:
      '<g fill="#1b2330"><rect x="300" y="240" width="40" height="120"/></g>' +
      '<path d="M320 150 q-26 50 -20 90 h40 q6 -40 -20 -90 Z" fill="#c0392b"/>' +
      '<circle cx="270" cy="250" r="18" fill="#2a8" /><rect x="262" y="250" width="16" height="110" fill="#1b2330"/>' +
      '<circle cx="370" cy="250" r="18" fill="#e1b12c"/><rect x="362" y="250" width="16" height="110" fill="#1b2330"/>',
    santorini:
      '<g fill="#ecf0f1"><rect x="220" y="300" width="60" height="60"/><rect x="300" y="285" width="70" height="75"/><rect x="390" y="305" width="55" height="55"/></g>' +
      '<circle cx="335" cy="285" r="18" fill="#2980b9"/>',
    petronas:
      '<path d="M285 110 l16 0 l8 250 l-32 0 Z" fill="#1b2330"/>' +
      '<path d="M339 110 l16 0 l8 250 l-32 0 Z" fill="#1b2330"/>' +
      '<rect x="300" y="210" width="40" height="10" fill="#2a3550"/>' +
      '<path d="M293 110 l0 -26 M347 110 l0 -26" stroke="#1b2330" stroke-width="4"/>'
  };

  function skyFor(loc) {
    // Deterministic-ish palette variety based on latitude.
    const abs = Math.abs(loc.lat);
    if (abs > 50) return ['#2c3e66', '#8e6c88', '#d98c6a']; // high-lat dusk
    if (abs < 15) return ['#1b6ca8', '#48b1bf', '#f0cf65']; // tropical
    return ['#1a2a6c', '#5a4e8c', '#e39a5b']; // temperate sunset
  }

  function buildFallbackSVG(loc) {
    const sky = skyFor(loc);
    const sil = SIL[loc.silhouette] || '';
    return (
      '<svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Stylized anomaly scene">' +
      '<defs>' +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + sky[0] + '"/>' +
      '<stop offset="55%" stop-color="' + sky[1] + '"/>' +
      '<stop offset="100%" stop-color="' + sky[2] + '"/>' +
      '</linearGradient>' +
      '<radialGradient id="rift" cx="78%" cy="26%" r="40%">' +
      '<stop offset="0%" stop-color="#ffd86b" stop-opacity=".9"/>' +
      '<stop offset="100%" stop-color="#ffd86b" stop-opacity="0"/>' +
      '</radialGradient>' +
      '</defs>' +
      '<rect width="640" height="400" fill="url(#sky)"/>' +
      '<circle cx="500" cy="105" r="120" fill="url(#rift)"/>' +
      '<g opacity=".25" stroke="#fff" stroke-width="1">' +
      '<path d="M430 20 L470 110 L560 130 L470 150 L430 240 L390 150 L300 130 L390 110 Z" fill="none"/>' +
      '</g>' +
      '<rect y="360" width="640" height="40" fill="#0d1017"/>' +
      sil +
      '</svg>'
    );
  }

  function Viewer(rootEl) {
    this.root = rootEl;
    this.imgEl = rootEl.querySelector('.viewer-photo');
    this.fallbackEl = rootEl.querySelector('.viewer-fallback');
    this.creditEl = rootEl.querySelector('.viewer-credit');
    this._candidates = [];
    this._idx = 0;
    this._loc = null;

    const self = this;
    this.imgEl.addEventListener('error', function () {
      self._tryNext();
    });
    this.imgEl.addEventListener('load', function () {
      self.imgEl.classList.add('is-loaded');
      self.fallbackEl.hidden = true;
      self.imgEl.hidden = false;
    });
  }

  Viewer.prototype.show = function (loc) {
    this._loc = loc;
    this._candidates = (loc.images || []).slice();
    this._idx = -1;
    this.imgEl.classList.remove('is-loaded');
    this.creditEl.textContent = '';
    // Prepare the fallback now so there is never a blank frame.
    this.fallbackEl.innerHTML = buildFallbackSVG(loc);
    this._tryNext();
  };

  Viewer.prototype._tryNext = function () {
    this._idx += 1;
    if (this._idx < this._candidates.length) {
      this.imgEl.hidden = false;
      this.fallbackEl.hidden = true;
      this.imgEl.src = this._candidates[this._idx];
      this.creditEl.textContent = 'Live visual feed · Wikimedia Commons';
    } else {
      // Exhausted all photo candidates -> show the SVG anomaly scene.
      this.imgEl.hidden = true;
      this.imgEl.removeAttribute('src');
      this.fallbackEl.hidden = false;
      this.creditEl.textContent = 'Visual feed degraded — reconstructed anomaly signature';
    }
  };

  Viewer.prototype.setZoom = function (zoom) {
    this.root.style.setProperty('--viewer-zoom', zoom || 1);
  };

  global.MR_Viewer = Viewer;
})(window);
