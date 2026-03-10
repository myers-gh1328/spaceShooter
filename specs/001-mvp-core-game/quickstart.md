# Quickstart — NOVA DRIFT (MVP)

**Feature**: `001-mvp-core-game`

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Modern browser | Chrome 90+ / Firefox 90+ / Edge 90+ | ES2020 modules, Canvas 2D |
| Local static server | Any | ES modules require HTTP (not `file://`) |

No Node.js, npm, or build step required.

---

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url> spaceShooter
cd spaceShooter
git checkout 001-mvp-core-game
```

### 2. Start a local server

**Option A — VS Code Live Server extension** (recommended for dev):
1. Install the **Live Server** extension.
2. Right-click `index.html` → *Open with Live Server*.

**Option B — npx (no install)**:
```bash
npx serve .
```
Then open `http://localhost:3000` in your browser.

**Option C — Python (if available)**:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

### 3. Play

- **Arrow keys** — Rotate left/right, thrust forward
- **Space** — Fire
- **P** — Pause / resume
- **Enter** — Start game (title screen) / Restart (game over)

---

## Project Structure

```
spaceShooter/
├── index.html              ← Entry point (loads main.js as module)
├── style.css               ← Page-level styles (centred canvas, overlays)
├── src/
│   ├── main.js             ← Bootstrap: finds <canvas>, creates game
│   ├── game.js             ← Game orchestrator, state machine
│   ├── loop.js             ← Fixed-timestep loop (60 Hz)
│   ├── input.js            ← Keyboard polling
│   ├── physics.js          ← Collision & wrap helpers
│   ├── pool.js             ← Generic object pool
│   ├── constants.js        ← All tuning values
│   ├── entities/
│   │   ├── ship.js
│   │   ├── asteroid.js
│   │   ├── projectile.js
│   │   ├── saucer.js
│   │   ├── power-up.js
│   │   └── particle.js
│   ├── systems/
│   │   ├── scoring.js
│   │   ├── power-up-manager.js
│   │   ├── spawner.js
│   │   └── leaderboard.js
│   └── rendering/
│       ├── renderer.js
│       ├── hud.js
│       ├── screens.js
│       └── effects.js
└── tests/
    ├── harness.html        ← Browser-based test runner
    ├── harness.js          ← Minimal assert lib
    ├── physics.test.js
    ├── pool.test.js
    ├── scoring.test.js
    └── leaderboard.test.js
```

---

## Key Files to Start With

| Order | File | Why |
|-------|------|-----|
| 1 | `src/constants.js` | All magic numbers live here — tune first |
| 2 | `src/pool.js` | Generic utility used everywhere |
| 3 | `src/physics.js` | Pure math — easy to test in isolation |
| 4 | `src/loop.js` | Core game loop — must be correct before anything renders |
| 5 | `src/input.js` | Independent of game logic — can test standalone |
| 6 | `src/entities/*` | One entity at a time (ship → asteroid → projectile → others) |
| 7 | `src/systems/*` | Scoring, power-ups, spawner, leaderboard |
| 8 | `src/rendering/*` | Draw everything; layer: starfield → entities → HUD |
| 9 | `src/game.js` | Wire it all together |
| 10 | `src/main.js` | Thin bootstrap — last to implement |

---

## Running Tests

Open `tests/harness.html` in a browser (via the local server). Test results
are displayed in the page. Example:

```
http://localhost:3000/tests/harness.html
```

Alternatively, run tests headlessly with:

```bash
npx vitest run --environment jsdom
```

(This requires a one-time `npx vitest` install but does not add a permanent
dependency.)

---

## Development Workflow

1. Edit a module in `src/`.
2. Refresh the browser (Live Server auto-reloads).
3. Open DevTools → Console for errors / logging.
4. Tuning? Change values in `constants.js` and reload.
5. Commit atomic changes (one entity / system per commit).

---

## Notes

- **No build step.** Every `.js` file is an ES module loaded natively by the browser.
- **No `file://`** — ES modules require CORS headers, so always use a local HTTP server.
- **localStorage** — The leaderboard persists across sessions under the key `novadrift_leaderboard`. Clear it in DevTools → Application → Local Storage if needed.
- **Performance target**: 60 fps on mid-range hardware. If frame time exceeds 250 ms the loop clamps to prevent spiral-of-death.
