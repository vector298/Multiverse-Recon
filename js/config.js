/*
 * config.js — optional runtime configuration
 * -------------------------------------------------------------
 * Everything here is OPTIONAL. The game is fully playable with the
 * defaults below and no configuration at all.
 *
 * Shared leaderboard (bonus): to turn the local leaderboard into a
 * cross-player one, create a free, keyless JSON blob and paste its id.
 *
 *   1. Run (once, anywhere with internet):
 *        curl -s -D - -X POST \
 *          -H "Content-Type: application/json" \
 *          -d '{"scores":[]}' \
 *          https://jsonblob.com/api/jsonBlob
 *      Copy the id at the end of the returned `Location:` header
 *      (e.g. https://jsonblob.com/api/jsonBlob/<THIS_ID>).
 *   2. Set `id` below to that value.
 *
 * Left as null, the leaderboard persists locally (per browser) only.
 */

window.MR_CONFIG = {
  sharedLeaderboard: {
    base: 'https://jsonblob.com/api/jsonBlob',
    id: null // e.g. '1301234567890123456' — null => local-only board
  }
};
