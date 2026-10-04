/*
 * leaderboard.js — Nexus Hall of Fame (Task 4.1 bonus)
 * -------------------------------------------------------------
 * A high-score table. Scores always persist locally (localStorage).
 * If a shared backend is configured (see js/config.js), scores are
 * additionally synced to a shared JSON blob so the board spans
 * multiple players/devices. All shared calls are best-effort and
 * degrade gracefully to the local board if the network/backend is
 * unavailable.
 *
 * Shared backend contract (default provider: jsonblob.com):
 *   GET  {base}/{id}         -> { scores: [...] }
 *   PUT  {base}/{id}  (JSON) -> replaces the blob
 * Configure window.MR_CONFIG.sharedLeaderboard = { base, id } to enable.
 */

(function (global) {
  'use strict';

  const LOCAL_KEY = 'mr_leaderboard_v1';
  const MAX_ENTRIES = 25;

  function cfg() {
    return (global.MR_CONFIG && global.MR_CONFIG.sharedLeaderboard) || null;
  }

  function readLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeLocal(list) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
    } catch (e) {
      /* storage unavailable (private mode) — ignore */
    }
  }

  function normalize(list) {
    const seen = {};
    const out = [];
    (list || []).forEach(function (e) {
      if (!e || typeof e.score !== 'number') return;
      const key = (e.name || '') + '|' + e.score + '|' + (e.at || '');
      if (seen[key]) return;
      seen[key] = true;
      out.push({
        name: String(e.name || 'Agent').slice(0, 20),
        score: Math.max(0, Math.round(e.score)),
        difficulty: e.difficulty || 'medium',
        at: e.at || new Date().toISOString()
      });
    });
    out.sort(function (a, b) {
      return b.score - a.score;
    });
    return out.slice(0, MAX_ENTRIES);
  }

  function sharedUrl() {
    const c = cfg();
    if (!c || !c.base || !c.id) return null;
    return c.base.replace(/\/$/, '') + '/' + c.id;
  }

  function fetchShared() {
    const url = sharedUrl();
    if (!url || !global.fetch) return Promise.resolve(null);
    return fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (data) {
        if (!data) return null;
        return Array.isArray(data) ? data : data.scores || [];
      })
      .catch(function () {
        return null;
      });
  }

  function putShared(list) {
    const url = sharedUrl();
    if (!url || !global.fetch) return Promise.resolve(false);
    return fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ scores: list })
    })
      .then(function (r) {
        return r.ok;
      })
      .catch(function () {
        return false;
      });
  }

  const Leaderboard = {
    isSharedEnabled: function () {
      return !!sharedUrl();
    },

    // Returns a promise resolving to the merged, sorted board.
    load: function () {
      const local = readLocal();
      return fetchShared().then(function (remote) {
        if (!remote) return normalize(local);
        const merged = normalize(local.concat(remote));
        writeLocal(merged);
        return merged;
      });
    },

    // Add a score; returns a promise resolving to the updated board.
    add: function (entry) {
      const e = {
        name: String((entry && entry.name) || 'Agent').slice(0, 20) || 'Agent',
        score: Math.max(0, Math.round((entry && entry.score) || 0)),
        difficulty: (entry && entry.difficulty) || 'medium',
        at: new Date().toISOString()
      };
      const local = normalize(readLocal().concat([e]));
      writeLocal(local);

      if (!sharedUrl()) return Promise.resolve(local);

      return fetchShared().then(function (remote) {
        const merged = normalize((remote || []).concat(local));
        writeLocal(merged);
        return putShared(merged).then(function () {
          return merged;
        });
      });
    }
  };

  global.MR_Leaderboard = Leaderboard;
})(window);
