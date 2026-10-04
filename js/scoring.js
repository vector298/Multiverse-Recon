/*
 * scoring.js — The TVA Assessment (Task 3.1) + difficulty config (Task 4)
 * -------------------------------------------------------------
 * Points are awarded inversely to the distance of the guess:
 *   - A perfect / near-perfect guess yields the round maximum.
 *   - Points decay exponentially with distance (closer = far more).
 *   - Beyond a maximum-distance threshold, zero points are awarded.
 *
 *   score(d) = 0                              if d >= MAX_DISTANCE_KM
 *            = MAX_POINTS                      if d <= PERFECT_KM
 *            = round(MAX_POINTS * e^(-d/scale)) otherwise
 *
 * The decay `scale` is set per difficulty level, so harder modes
 * punish imprecision more aggressively.
 */

(function (global) {
  'use strict';

  const MAX_POINTS = 5000; // max points per round
  const MAX_DISTANCE_KM = 20000; // ~half Earth circumference => 0 points
  const PERFECT_KM = 25; // within this, a perfect score is granted

  // Difficulty presets (Task 4.1 – Difficulty Levels).
  const DIFFICULTIES = {
    easy: {
      id: 'easy',
      label: 'Easy',
      blurb: 'Hints allowed · generous timer · forgiving scoring',
      decay: 2600, // larger scale => more forgiving falloff
      timeLimit: 0, // 0 = no timer
      allowHints: true,
      zoom: 1
    },
    medium: {
      id: 'medium',
      label: 'Medium',
      blurb: '60s per round · standard scoring',
      decay: 2000,
      timeLimit: 60,
      allowHints: false,
      zoom: 1
    },
    hard: {
      id: 'hard',
      label: 'Hard',
      blurb: '30s per round · strict scoring · zoomed-in feed',
      decay: 1400, // steeper falloff
      timeLimit: 30,
      allowHints: false,
      zoom: 1.6 // zoomed-in image (CSS)
    }
  };

  /**
   * Compute round score from distance.
   * @param {number} distanceKm
   * @param {number} [decay] decay scale (defaults to medium)
   * @returns {number} integer score in [0, MAX_POINTS]
   */
  function scoreForDistance(distanceKm, decay) {
    const scale = decay || DIFFICULTIES.medium.decay;
    if (!isFinite(distanceKm) || distanceKm >= MAX_DISTANCE_KM) return 0;
    if (distanceKm <= PERFECT_KM) return MAX_POINTS;
    const raw = MAX_POINTS * Math.exp(-distanceKm / scale);
    return Math.max(0, Math.round(raw));
  }

  /**
   * Nexus Streaks (Task 4.1): a guess scoring at/above the accuracy
   * threshold extends the streak; the multiplier grows with it.
   */
  const STREAK_ACCURATE_SCORE = 3500; // score needed to keep a streak alive
  const STREAK_STEP = 0.1; // +10% per consecutive accurate guess
  const STREAK_MAX_MULTIPLIER = 2.0;

  function multiplierForStreak(streak) {
    const m = 1 + STREAK_STEP * Math.max(0, streak);
    return Math.min(STREAK_MAX_MULTIPLIER, m);
  }

  /** A short qualitative rating for flavour. */
  function ratingForDistance(km) {
    if (km <= PERFECT_KM) return 'Timeline locked';
    if (km <= 150) return 'Pinpoint';
    if (km <= 600) return 'Close convergence';
    if (km <= 2000) return 'Right region';
    if (km <= 6000) return 'Drifting';
    return 'Lost in the multiverse';
  }

  global.MR_Scoring = {
    MAX_POINTS: MAX_POINTS,
    MAX_DISTANCE_KM: MAX_DISTANCE_KM,
    PERFECT_KM: PERFECT_KM,
    DIFFICULTIES: DIFFICULTIES,
    STREAK_ACCURATE_SCORE: STREAK_ACCURATE_SCORE,
    STREAK_MAX_MULTIPLIER: STREAK_MAX_MULTIPLIER,
    scoreForDistance: scoreForDistance,
    multiplierForStreak: multiplierForStreak,
    ratingForDistance: ratingForDistance
  };
})(window);
