/*
 * game.js — Timeline Stabilization + TVA Assessment (Tasks 2 & 3)
 * -------------------------------------------------------------
 * Orchestrates the whole experience:
 *   - Anomaly Generation (2.1): pick 5 unique random locations.
 *   - Convergence Calculation (2.2): Haversine via MR_Geo.
 *   - Scoring (3.1) & Multi-round loop + results (3.2).
 *   - Bonus (4): timer, streak multiplier, difficulty, leaderboard.
 */

(function (global) {
  'use strict';

  const Geo = global.MR_Geo;
  const Scoring = global.MR_Scoring;
  const LOCATIONS = global.MR_LOCATIONS;
  const ROUNDS_PER_GAME = 5;

  const $ = function (sel) {
    return document.querySelector(sel);
  };

  // ---- Anomaly Generation (Task 2.1) ---------------------------
  function pickRounds(n) {
    const pool = LOCATIONS.slice();
    // Fisher–Yates shuffle, then take n unique locations.
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = pool[i];
      pool[i] = pool[j];
      pool[j] = t;
    }
    return pool.slice(0, Math.min(n, pool.length)).map(function (loc) {
      return { loc: loc, guess: null, distanceKm: null, points: 0, multiplier: 1 };
    });
  }

  function Game() {
    this.viewer = new global.MR_Viewer($('.viewer'));
    this.map = new global.MR_NexusMap('nexus-map');
    this.tour = new global.MR_Tour();
    this.resultsMap = null;

    this.rounds = [];
    this.current = 0;
    this.totalScore = 0;
    this.streak = 0;
    this.difficulty = Scoring.DIFFICULTIES.medium;
    this.timer = { id: null, remaining: 0 };
    this.locked = false;

    this._wire();
    this._refreshLeaderboard();

    const self = this;
    this.map.setInteractive(true, function (lat, lng) {
      self._onGuessPlaced(lat, lng);
    });

    if (this.tour.shouldAutoStart()) {
      // Give the layout a beat to settle before spotlighting.
      setTimeout(function () {
        self.tour.start();
      }, 600);
    }
  }

  Game.prototype._wire = function () {
    const self = this;
    $('#start-btn').addEventListener('click', function () {
      self.start();
    });
    $('#lock-btn').addEventListener('click', function () {
      self.lockGuess();
    });
    $('#next-btn').addEventListener('click', function () {
      self.nextRound();
    });
    $('#play-again').addEventListener('click', function () {
      self.toStart();
    });
    $('#hint-btn').addEventListener('click', function () {
      self._revealHint();
    });
    $('#tour-btn').addEventListener('click', function () {
      self.tour.start();
    });
    $('#difficulty-select').addEventListener('change', function (e) {
      const d = Scoring.DIFFICULTIES[e.target.value];
      if (d) {
        self.difficulty = d;
        $('#difficulty-blurb').textContent = d.blurb;
      }
    });
    $('#save-btn').addEventListener('click', function () {
      self._saveScore();
    });
  };

  // ---- Screen management ---------------------------------------
  Game.prototype._show = function (id) {
    ['screen-start', 'screen-game', 'screen-results'].forEach(function (s) {
      const el = document.getElementById(s);
      el.classList.toggle('is-active', s === id);
      el.hidden = s !== id;
    });
  };

  Game.prototype.toStart = function () {
    this._clearTimer();
    this._show('screen-start');
    this._refreshLeaderboard();
  };

  // ---- Game loop (Task 3.2) ------------------------------------
  Game.prototype.start = function () {
    const sel = $('#difficulty-select').value;
    this.difficulty = Scoring.DIFFICULTIES[sel] || Scoring.DIFFICULTIES.medium;
    this.rounds = pickRounds(ROUNDS_PER_GAME);
    this.current = 0;
    this.totalScore = 0;
    this.streak = 0;
    this.locked = false;
    this._show('screen-game');
    this.map.invalidate();
    this.viewer.setZoom(this.difficulty.zoom);
    this._loadRound();
  };

  Game.prototype._loadRound = function () {
    const round = this.rounds[this.current];
    this.locked = false;
    this.map.clearGuess();
    this.map.resetView();
    this.map.setInteractive(true, this._onGuessPlaced.bind(this));
    this.viewer.show(round.loc);

    // Reset per-round UI.
    $('#lock-btn').disabled = true;
    $('#round-result').hidden = true;
    $('#round-result').classList.remove('is-visible');
    const hintWrap = $('#hint-wrap');
    const allowHints = this.difficulty.allowHints;
    hintWrap.hidden = !allowHints;
    $('#hint-btn').disabled = !allowHints;
    $('#hint-text').textContent = '';
    $('#hint-text').hidden = true;

    this._updateHud();
    this._startTimer();
  };

  Game.prototype._onGuessPlaced = function () {
    if (this.locked) return;
    $('#lock-btn').disabled = false;
  };

  Game.prototype._revealHint = function () {
    const round = this.rounds[this.current];
    $('#hint-text').textContent = round.loc.hint;
    $('#hint-text').hidden = false;
    $('#hint-btn').disabled = true;
  };

  // ---- Timer (Bonus: Time Dilation) ----------------------------
  Game.prototype._startTimer = function () {
    this._clearTimer();
    const limit = this.difficulty.timeLimit;
    const timerEl = $('#hud-timer');
    const wrap = $('#hud-timer-wrap');
    if (!limit) {
      wrap.classList.add('is-off');
      timerEl.textContent = '∞';
      timerEl.setAttribute('aria-label', 'No time limit');
      return;
    }
    wrap.classList.remove('is-off');
    this.timer.remaining = limit;
    this._renderTimer();

    const self = this;
    this.timer.id = setInterval(function () {
      self.timer.remaining -= 1;
      self._renderTimer();
      if (self.timer.remaining <= 0) {
        self._clearTimer();
        self._timeUp();
      }
    }, 1000);
  };

  Game.prototype._renderTimer = function () {
    const el = $('#hud-timer');
    const r = Math.max(0, this.timer.remaining);
    el.textContent = r + 's';
    el.setAttribute('aria-label', r + ' seconds remaining');
    const wrap = $('#hud-timer-wrap');
    wrap.classList.toggle('is-danger', r <= 10);
  };

  Game.prototype._clearTimer = function () {
    if (this.timer.id) {
      clearInterval(this.timer.id);
      this.timer.id = null;
    }
  };

  Game.prototype._timeUp = function () {
    if (this.locked) return;
    // Lock whatever guess exists; if none, it scores zero.
    this.lockGuess(true);
  };

  // ---- Convergence + scoring (Tasks 2.2 & 3.1) -----------------
  Game.prototype.lockGuess = function (fromTimeout) {
    if (this.locked) return;
    const round = this.rounds[this.current];
    const guess = this.map.getGuess();

    if (!guess && !fromTimeout) {
      // Shouldn't happen (lock disabled until a guess exists), but guard.
      return;
    }

    this.locked = true;
    this._clearTimer();
    this.map.setInteractive(false);
    $('#lock-btn').disabled = true;
    $('#hint-btn').disabled = true;

    let distanceKm;
    if (guess) {
      distanceKm = Geo.haversineKm(guess.lat, guess.lng, round.loc.lat, round.loc.lng);
    } else {
      distanceKm = Scoring.MAX_DISTANCE_KM; // no guess => zero points
    }

    const base = Scoring.scoreForDistance(distanceKm, this.difficulty.decay);

    // Nexus Streaks (bonus): accurate guesses build a multiplier.
    const wasAccurate = base >= Scoring.STREAK_ACCURATE_SCORE;
    if (wasAccurate) this.streak += 1;
    else this.streak = 0;
    const multiplier = Scoring.multiplierForStreak(this.streak);
    const points = Math.round(base * multiplier);

    round.guess = guess;
    round.distanceKm = distanceKm;
    round.basePoints = base;
    round.multiplier = multiplier;
    round.points = points;

    this.totalScore += points;
    this._updateHud();
    this.map.revealActual(round.loc.lat, round.loc.lng);
    this._showRoundResult(round, guess, fromTimeout);
  };

  Game.prototype._showRoundResult = function (round, guess, fromTimeout) {
    $('#rr-name').textContent = round.loc.name;
    $('#rr-country').textContent = round.loc.country;
    $('#rr-fact').textContent = round.loc.fact;
    $('#rr-distance').textContent = guess
      ? Geo.formatKm(round.distanceKm) + ' away'
      : (fromTimeout ? 'Out of time — no guess locked' : 'No guess');
    $('#rr-rating').textContent = Scoring.ratingForDistance(round.distanceKm);
    $('#rr-points').textContent = '+' + round.points.toLocaleString();

    const mult = $('#rr-multiplier');
    if (round.multiplier > 1) {
      mult.hidden = false;
      mult.textContent =
        '×' + round.multiplier.toFixed(1) + ' streak (' + this.streak + ')';
    } else {
      mult.hidden = true;
    }

    $('#next-btn').textContent =
      this.current >= this.rounds.length - 1 ? 'See final assessment' : 'Next anomaly';

    const panel = $('#round-result');
    panel.hidden = false;
    // Allow the browser to paint before animating in.
    requestAnimationFrame(function () {
      panel.classList.add('is-visible');
    });
    $('#next-btn').focus();
  };

  Game.prototype.nextRound = function () {
    $('#round-result').classList.remove('is-visible');
    if (this.current >= this.rounds.length - 1) {
      this._showResults();
      return;
    }
    this.current += 1;
    this._loadRound();
  };

  // ---- HUD ------------------------------------------------------
  Game.prototype._updateHud = function () {
    $('#hud-round').textContent = (this.current + 1) + ' / ' + this.rounds.length;
    $('#hud-score').textContent = this.totalScore.toLocaleString();
    const streakEl = $('#hud-streak');
    const mult = Scoring.multiplierForStreak(this.streak);
    if (this.streak > 0) {
      streakEl.hidden = false;
      streakEl.textContent = '🔥 ' + this.streak + '  ×' + mult.toFixed(1);
    } else {
      streakEl.hidden = true;
    }
  };

  // ---- Final Results (Task 3.2) --------------------------------
  Game.prototype._showResults = function () {
    this._clearTimer();
    this._show('screen-results');

    const maxTotal = Scoring.MAX_POINTS * this.rounds.length;
    $('#final-score').textContent = this.totalScore.toLocaleString();
    $('#final-max').textContent = maxTotal.toLocaleString();
    $('#final-verdict').textContent = this._verdict(this.totalScore / maxTotal);
    $('#final-difficulty').textContent = this.difficulty.label;

    // Per-round summary list.
    const list = $('#round-summary');
    list.innerHTML = '';
    this.rounds.forEach(function (r, i) {
      const li = document.createElement('li');
      li.className = 'summary-row';
      const dist = r.guess ? Geo.formatKm(r.distanceKm) : 'no guess';
      li.innerHTML =
        '<span class="summary-idx">R' + (i + 1) + '</span>' +
        '<span class="summary-name">' + escapeHtml(r.loc.name) +
        '<small>' + escapeHtml(r.loc.country) + '</small></span>' +
        '<span class="summary-dist">' + dist + '</span>' +
        '<span class="summary-pts">+' + r.points.toLocaleString() + '</span>';
      list.appendChild(li);
    });

    // Visual summary map of all guesses vs. actual locations.
    if (!this.resultsMap) {
      this.resultsMap = new global.MR_NexusMap('results-map');
      this.resultsMap.setInteractive(false);
    } else {
      this.resultsMap.clearGuess();
      // Remove any previously drawn layers by resetting the map instance.
      this.resultsMap.map.eachLayer(function (layer) {
        if (layer instanceof global.L.Marker || layer instanceof global.L.Polyline) {
          this.resultsMap.map.removeLayer(layer);
        }
      }, this);
    }
    this.resultsMap.plotSummary(this.rounds);

    // Prefill leaderboard name and update the board.
    const saved = '';
    $('#save-name').value = saved || $('#player-name').value || '';
    $('#save-status').textContent = '';
    $('#save-btn').disabled = false;
    this._refreshLeaderboard();
  };

  Game.prototype._verdict = function (ratio) {
    if (ratio >= 0.9) return 'Timeline fully stabilized. The TVA salutes you.';
    if (ratio >= 0.7) return 'Strong convergence. The Sacred Timeline holds.';
    if (ratio >= 0.45) return 'Partial stabilization. Variance detected.';
    if (ratio >= 0.2) return 'The multiverse wobbles. Recalibrate, Agent.';
    return 'Reality is fraying. More recon required.';
  };

  // ---- Leaderboard (bonus) -------------------------------------
  Game.prototype._saveScore = function () {
    const name = ($('#save-name').value || 'Agent').trim().slice(0, 20) || 'Agent';
    $('#save-btn').disabled = true;
    $('#save-status').textContent = 'Transmitting to the Nexus…';
    const self = this;
    global.MR_Leaderboard.add({
      name: name,
      score: this.totalScore,
      difficulty: this.difficulty.id
    }).then(function (board) {
      $('#save-status').textContent = global.MR_Leaderboard.isSharedEnabled()
        ? 'Logged to the shared Nexus leaderboard.'
        : 'Logged to this device’s leaderboard.';
      self._renderBoard(board);
    });
  };

  Game.prototype._refreshLeaderboard = function () {
    const self = this;
    global.MR_Leaderboard.load().then(function (board) {
      self._renderBoard(board);
    });
    const note = $('#leaderboard-note');
    if (note) {
      note.textContent = global.MR_Leaderboard.isSharedEnabled()
        ? 'Shared across all agents.'
        : 'Stored on this device. (Enable sharing in js/config.js.)';
    }
  };

  Game.prototype._renderBoard = function (board) {
    const targets = document.querySelectorAll('.leaderboard-list');
    targets.forEach(function (ul) {
      ul.innerHTML = '';
      if (!board || !board.length) {
        const li = document.createElement('li');
        li.className = 'lb-empty';
        li.textContent = 'No scores yet — be the first Agent on the board.';
        ul.appendChild(li);
        return;
      }
      board.slice(0, 10).forEach(function (e, i) {
        const li = document.createElement('li');
        li.className = 'lb-row';
        li.innerHTML =
          '<span class="lb-rank">' + (i + 1) + '</span>' +
          '<span class="lb-name">' + escapeHtml(e.name) + '</span>' +
          '<span class="lb-diff">' + escapeHtml(e.difficulty || '') + '</span>' +
          '<span class="lb-score">' + e.score.toLocaleString() + '</span>';
        ul.appendChild(li);
      });
    });
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[c];
    });
  }

  // Boot once the DOM is ready.
  function boot() {
    // Seed the difficulty blurb.
    const sel = document.getElementById('difficulty-select');
    const d = Scoring.DIFFICULTIES[sel.value] || Scoring.DIFFICULTIES.medium;
    document.getElementById('difficulty-blurb').textContent = d.blurb;
    global.MR_GAME = new Game();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
