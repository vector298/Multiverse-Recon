# 🌀 Multiverse Recon

> *The multiverse is collapsing.* Inspired by the reality‑bending events of
> **Avengers: Doomsday**, **Multiverse Recon** is a web‑based location‑guessing
> game. Each round drops you into a random anomaly somewhere across the globe —
> and the multiverse. Study the visual feed, pinpoint your coordinates on the
> interactive **Nexus Map**, and lock in your guess to stabilize the timeline.

Five rounds. One Sacred Timeline. Closer guesses = more points.

---

## ✨ Features

| Area | What's included |
| --- | --- |
| **Observation Deck** (Task 1.1) | Responsive, multiverse/TVA‑themed location viewer. Photos load from Wikimedia Commons; if a feed can't load, a hand‑drawn **SVG anomaly scene** (landmark silhouette) is shown so a round is never blank. |
| **First‑time tour** (Task 1.1) | A skippable, spotlighted walkthrough on first visit (and re‑openable via **? Walkthrough**). |
| **Nexus Map** (Task 1.2) | Clickable [Leaflet](https://leafletjs.com) world map with a single, **movable** guess marker (click to place, drag to adjust). |
| **Anomaly Generation** (Task 2.1) | Each game picks **5 unique** random locations from a predefined atlas and feeds them to the viewer. |
| **Convergence Calculation** (Task 2.2) | Great‑circle distance via the **Haversine formula** (`js/geo.js`). |
| **Scoring** (Task 3.1) | Points are **inversely proportional to distance**: up to **5,000 pts/round**, decaying exponentially, reaching **0** beyond a max‑distance threshold (~20,000 km). |
| **Multi‑round & Results** (Task 3.2) | A 5‑round loop, a live cumulative score, and a **Final Results screen** with a per‑round breakdown, a convergence map (guess vs. actual) and **Play Again**. |
| **Bonus mechanics** (Task 4) | ⏱️ **Time Dilation** (per‑round countdown), 🔥 **Nexus Streaks** (accuracy multiplier up to ×2), 🎚️ **Difficulty Levels** (Easy/Medium/Hard), 🏆 **Leaderboard** (local by default, with an optional shared backend). |

---

## 🧰 Tech stack

- **Vanilla HTML5 / CSS3 / JavaScript** — no framework, no build step.
- **[Leaflet](https://leafletjs.com) 1.9.4** — vendored locally in `vendor/leaflet/` (no CDN dependency).
- **OpenStreetMap** tiles for the map (loaded at runtime in the browser).
- **Wikimedia Commons** for location imagery (with an offline SVG fallback).
- **GitHub Actions + GitHub Pages** for deployment.

Everything is client‑side — **no backend or database required**. (The optional
shared leaderboard uses a free, keyless JSON store; see below.)

---

## 🚀 Play it online

Once GitHub Pages is enabled for this repository (see **Deployment** below), the
game is available at:

```
https://vector298.github.io/multiverse-recon/
```

---

## 🖥️ Run / test locally

No build tools are needed — it's a static site. Because the game fetches map
tiles and images over the network, serve it over HTTP (don't just open the file
with `file://`).

**Option A — Python (built‑in on most systems):**

```bash
git clone https://github.com/vector298/multiverse-recon.git
cd multiverse-recon
python3 -m http.server 8000
# then open http://localhost:8000
```

**Option B — Node:**

```bash
npx serve .          # or: npx http-server -p 8000
```

Open the printed URL in your browser and start stabilizing timelines.

> **Note:** Map tiles and landmark photos require internet access. Offline, the
> map tiles appear blank and the viewer automatically falls back to stylized
> SVG anomaly scenes — the game remains fully playable (guessing, scoring,
> rounds, leaderboard all work).

---

## 🎮 How to play

1. Enter an **agent designation** and pick a **difficulty**, then **Begin Recon**.
2. Inspect the anomaly's **visual feed** for clues.
3. **Click the Nexus Map** to drop your guess; **drag** the marker to fine‑tune.
4. **Lock convergence** to score the round — the true location and the distance
   are revealed.
5. After 5 rounds, review your **Final TVA Assessment**, log your score to the
   **Hall of Fame**, and **Play Again**.

**Difficulty levels**

| Mode | Timer | Hints | Scoring | Feed |
| --- | --- | --- | --- | --- |
| Easy | none | ✅ allowed | forgiving | normal |
| Medium | 60 s | — | standard | normal |
| Hard | 30 s | — | strict | zoomed‑in |

---

## 🧮 How scoring works

For a guess `d` kilometres from the true location:

```
score = 0                               if d ≥ 20,000 km   (max-distance threshold)
score = 5000                            if d ≤ 25 km       (perfect)
score = round(5000 · e^(-d / scale))    otherwise          (closer ⇒ higher)
```

`scale` depends on difficulty (Easy is more forgiving, Hard is stricter). A
**Nexus Streak** of consecutive accurate guesses (≥ 3,500 pts) multiplies the
round score by up to **×2**.

---

## 🌐 Deployment (GitHub Pages)

A workflow at `.github/workflows/deploy.yml` publishes the site automatically.

**One‑time setup:**
1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

Every push to `main`/`master` (or the development branch) then redeploys the
game to the URL above. You can also trigger it manually from the **Actions** tab.

Any other static host works too (Netlify, Vercel, Cloudflare Pages): just serve
the repository root.

---

## 🏆 Optional: shared leaderboard

By default the leaderboard persists **locally** (per browser) via
`localStorage`. To make it **shared across all players**, create a free, keyless
JSON blob and configure it in `js/config.js`:

```bash
# Run once, anywhere with internet. Copy the id from the Location: header.
curl -s -D - -X POST -H "Content-Type: application/json" \
  -d '{"scores":[]}' https://jsonblob.com/api/jsonBlob
```

Then set `id` in `js/config.js`:

```js
window.MR_CONFIG = {
  sharedLeaderboard: {
    base: 'https://jsonblob.com/api/jsonBlob',
    id: '<YOUR_BLOB_ID>'   // null => local-only board
  }
};
```

All shared calls are best‑effort and degrade gracefully to the local board if
the network/backend is unavailable.

---

## 📁 Project structure

```
.
├── index.html              # App shell & all three screens (start / game / results)
├── css/
│   └── styles.css          # Multiverse/TVA theme, responsive + accessible styles
├── js/
│   ├── config.js           # Optional runtime config (shared leaderboard)
│   ├── locations.js        # The Anomaly Atlas (coords, images, hints, silhouettes)
│   ├── geo.js              # Haversine great-circle distance (Task 2.2)
│   ├── scoring.js          # Inverse-distance scoring + difficulty presets (3.1 / 4)
│   ├── viewer.js           # Location viewer + SVG anomaly fallback (1.1)
│   ├── map.js              # Leaflet Nexus Map wrapper (1.2)
│   ├── leaderboard.js      # Local + optional shared high-score board (bonus)
│   ├── tour.js             # Skippable first-time walkthrough (1.1)
│   └── game.js             # Game loop, state, rounds, results (2 & 3)
├── vendor/leaflet/         # Vendored Leaflet 1.9.4 (no CDN dependency)
└── .github/workflows/
    └── deploy.yml          # GitHub Pages deployment
```

---

## 🙌 Credits

- Maps © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- Landmark photography via [Wikimedia Commons](https://commons.wikimedia.org).
- Mapping library: [Leaflet](https://leafletjs.com).
- Theme inspired by Marvel's TVA / *Avengers: Doomsday* multiverse.
