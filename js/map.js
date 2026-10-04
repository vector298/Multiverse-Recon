/*
 * map.js — The Interactive Nexus Map (Task 1.2)
 * -------------------------------------------------------------
 * A clickable Leaflet world map. The player places a single,
 * movable marker to represent their guess. The same component is
 * reused on the results screen to draw guess-vs-actual lines.
 */

(function (global) {
  'use strict';

  const L = global.L;

  // Explicit icon for the guess marker, pointing at our vendored
  // images. Defining it directly avoids Leaflet's imagePath
  // auto-detection (which would otherwise double the path).
  const GUESS_ICON = L.icon({
    iconUrl: 'vendor/leaflet/images/marker-icon.png',
    iconRetinaUrl: 'vendor/leaflet/images/marker-icon-2x.png',
    shadowUrl: 'vendor/leaflet/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
  });

  const WORLD_BOUNDS = L.latLngBounds([-85, -179], [85, 179]);

  function NexusMap(elId) {
    this.map = L.map(elId, {
      worldCopyJump: true,
      minZoom: 1,
      maxBounds: WORLD_BOUNDS,
      maxBoundsViscosity: 0.6,
      zoomControl: true,
      attributionControl: true
    });
    this.map.setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
      noWrap: false
    }).addTo(this.map);

    this.guessMarker = null;
    this.actualMarker = null;
    this.line = null;
    this._clickHandler = null;
    this._onGuess = null;

    const self = this;
    this.map.on('click', function (e) {
      if (!self._interactive) return;
      self.setGuess(e.latlng.lat, e.latlng.lng, true);
    });

    // Leaflet needs a size recalculation once its container is visible.
    setTimeout(function () {
      self.map.invalidateSize();
    }, 200);
  }

  NexusMap.prototype.setInteractive = function (on, onGuess) {
    this._interactive = on;
    this._onGuess = onGuess || null;
  };

  NexusMap.prototype.getGuess = function () {
    if (!this.guessMarker) return null;
    const ll = this.guessMarker.getLatLng();
    return { lat: ll.lat, lng: ll.lng };
  };

  NexusMap.prototype.setGuess = function (lat, lng, fromClick) {
    const self = this;
    if (!this.guessMarker) {
      this.guessMarker = L.marker([lat, lng], {
        draggable: true,
        keyboard: true,
        icon: GUESS_ICON,
        title: 'Your guess (drag to move)',
        alt: 'Your guess marker'
      }).addTo(this.map);
      this.guessMarker.bindTooltip('Your guess', { direction: 'top' });
      this.guessMarker.on('dragend', function () {
        const ll = self.guessMarker.getLatLng();
        if (self._onGuess) self._onGuess(ll.lat, ll.lng);
      });
    } else {
      this.guessMarker.setLatLng([lat, lng]);
    }
    if (fromClick && this._onGuess) this._onGuess(lat, lng);
  };

  NexusMap.prototype.clearGuess = function () {
    if (this.guessMarker) {
      this.map.removeLayer(this.guessMarker);
      this.guessMarker = null;
    }
    if (this.actualMarker) {
      this.map.removeLayer(this.actualMarker);
      this.actualMarker = null;
    }
    if (this.line) {
      this.map.removeLayer(this.line);
      this.line = null;
    }
  };

  NexusMap.prototype.resetView = function () {
    this.map.setView([20, 0], 2);
  };

  // Show the true location + a line to the guess (used after a round).
  NexusMap.prototype.revealActual = function (lat, lng) {
    const actualIcon = L.divIcon({
      className: 'actual-pin',
      html: '<span aria-hidden="true">⌖</span>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    this.actualMarker = L.marker([lat, lng], {
      icon: actualIcon,
      title: 'Actual location',
      alt: 'Actual location marker'
    }).addTo(this.map);
    this.actualMarker.bindTooltip('Actual location', { direction: 'top' });

    const guess = this.getGuess();
    if (guess) {
      this.line = L.polyline(
        [
          [guess.lat, guess.lng],
          [lat, lng]
        ],
        { color: '#ffcf6b', weight: 2, dashArray: '6 6', opacity: 0.9 }
      ).addTo(this.map);
      this.map.fitBounds(this.line.getBounds().pad(0.4));
    } else {
      this.map.setView([lat, lng], 4);
    }
  };

  // Plot every round's guess/actual pair on a non-interactive map
  // (used on the Final Results screen).
  NexusMap.prototype.plotSummary = function (rounds) {
    const self = this;
    const all = [];
    rounds.forEach(function (r, i) {
      const actualIcon = L.divIcon({
        className: 'actual-pin',
        html: '<span aria-hidden="true">⌖</span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const aM = L.marker([r.loc.lat, r.loc.lng], {
        icon: actualIcon,
        title: 'Round ' + (i + 1) + ': ' + r.loc.name
      }).addTo(self.map);
      aM.bindTooltip('R' + (i + 1) + ' ⌖ ' + r.loc.name, { direction: 'top' });
      all.push([r.loc.lat, r.loc.lng]);

      if (r.guess) {
        const gIcon = L.divIcon({
          className: 'guess-pin',
          html: '<span aria-hidden="true">' + (i + 1) + '</span>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const gM = L.marker([r.guess.lat, r.guess.lng], {
          icon: gIcon,
          title: 'Round ' + (i + 1) + ' guess'
        }).addTo(self.map);
        gM.bindTooltip('R' + (i + 1) + ' guess', { direction: 'top' });
        all.push([r.guess.lat, r.guess.lng]);
        L.polyline(
          [
            [r.guess.lat, r.guess.lng],
            [r.loc.lat, r.loc.lng]
          ],
          { color: '#ffcf6b', weight: 2, dashArray: '5 6', opacity: 0.85 }
        ).addTo(self.map);
      }
    });
    if (all.length) {
      this.map.fitBounds(L.latLngBounds(all).pad(0.25));
    }
    this.invalidate();
  };

  NexusMap.prototype.invalidate = function () {
    const self = this;
    setTimeout(function () {
      self.map.invalidateSize();
    }, 60);
  };

  global.MR_NexusMap = NexusMap;
})(window);
