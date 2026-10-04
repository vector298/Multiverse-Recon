/*
 * geo.js — Convergence Calculation (Task 2.2)
 * -------------------------------------------------------------
 * Great-circle distance between two lat/lng points using the
 * Haversine formula.
 */

(function (global) {
  'use strict';

  const EARTH_RADIUS_KM = 6371.0088; // mean Earth radius
  const KM_PER_MILE = 1.609344;

  function toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  /**
   * Haversine great-circle distance.
   * @param {number} lat1
   * @param {number} lng1
   * @param {number} lat2
   * @param {number} lng2
   * @returns {number} distance in kilometres
   */
  function haversineKm(lat1, lng1, lat2, lng2) {
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const rLat1 = toRad(lat1);
    const rLat2 = toRad(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
  }

  function kmToMiles(km) {
    return km / KM_PER_MILE;
  }

  /** Human-readable distance string (auto km/m). */
  function formatKm(km) {
    if (km < 1) {
      return Math.round(km * 1000) + ' m';
    }
    if (km < 100) {
      return km.toFixed(1) + ' km';
    }
    return Math.round(km).toLocaleString() + ' km';
  }

  global.MR_Geo = {
    EARTH_RADIUS_KM: EARTH_RADIUS_KM,
    haversineKm: haversineKm,
    kmToMiles: kmToMiles,
    formatKm: formatKm
  };
})(window);
