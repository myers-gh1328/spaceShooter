# Implementation Plan: NOVA DRIFT — MVP Core Game

**Branch**: `001-mvp-core-game` | **Date**: 2026-03-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-mvp-core-game/spec.md`

## Summary

Build the minimum viable product of NOVA DRIFT, a modernised Asteroids-style browser game. The player pilots a ship, destroys splitting asteroids, earns score with a combo multiplier, collects power-ups, and competes against a local top-10 leaderboard — all rendered with a neon-glow vector aesthetic on an HTML5 Canvas. The game uses plain HTML + JavaScript (ES modules) + CSS with zero build steps; opening `index.html` starts the game.

## Technical Context

**Language/Version**: JavaScript ES2020+ (vanilla, no transpilation)
**Primary Dependencies**: None — Canvas 2D API, Web Storage API (localStorage), and standard DOM APIs only
**Storage**: localStorage for leaderboard (top-10 scores)
**Testing**: Lightweight HTML test harness or Vitest (run via `npx`)
**Target Platform**: Modern browsers — Chrome, Firefox, Edge, Safari (desktop + mobile), last 2 versions
**Project Type**: Single-page browser game (static files)
**Performance Goals**: 60 fps on mid-range 2020-era hardware (integrated GPU); <500 KB total page weight
**Constraints**: No build step; no external frameworks or game engines; no WebGL; no external image assets; Canvas 2D only; object pooling for memory management
**Scale/Scope**: Single player, 1 HTML page, ~15 JS modules, 1 CSS file; 5 game screens (title, gameplay, pause, game-over, HUD)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Game Loop Architecture | ✅ PASS | Fixed-timestep update (60 ticks/s) + `requestAnimationFrame` render; pause/resume/game-over states specified in US1, US4, FR-015, FR-017 |
| II | Responsive Controls | ✅ PASS | Keyboard input (arrows+Space+Escape) polled per tick (FR-002). Touch controls explicitly deferred in Assumptions — constitution says "MUST" for touch, but MVP defers it with documented justification (see Complexity Tracking). |
| III | Core Game Rules | ✅ PASS | Ship rotate/thrust/fire, asteroid splitting, screen wrap, lives, level progression all specified (US1, US2, FR-003–FR-006) |
| IV | Scoring & Progression | ✅ PASS | Point values match constitution, combo multiplier ×1–×8, localStorage leaderboard, saucers at level 3+ (US2, US5, FR-007–FR-008, FR-013–FR-014) |
| V | Power-Up System | ✅ PASS | 4 types, 15% spawn chance, 8s duration, 6s despawn, offensive stacking rule (US3, FR-009–FR-010) |
| VI | UI & Visual Design | ✅ PASS | HUD, title, pause, game-over screens, particle explosions, thrust flame, neon-glow style, Canvas-only rendering (US4, FR-001, FR-011–FR-012, FR-016) |
| VII | Browser Performance | ✅ PASS | 60 fps target, <500 KB, no frameworks, object pooling, cross-browser (SC-002, SC-004, SC-005, FR-018) |

### Justified Deviations

| Constitution Rule | Deviation | Justification |
|---|---|---|
| II. Touch MUST be supported as secondary input | Deferred to post-MVP | Spec Assumptions explicitly document this. Keyboard is primary; touch adds significant complexity for virtual joystick without blocking core gameplay validation. Will be added as a follow-up feature. |

**Gate result**: ✅ PASS (1 deviation documented and justified)

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-core-game/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (game module interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
index.html                  # Entry point — loads CSS + bootstraps game via ES module
css/
└── style.css               # Page layout, Canvas centering, neon-glow font

src/
├── main.js                 # Entry: creates Game, attaches to Canvas
├── game.js                 # Game class — owns the loop, state machine, screen transitions
├── loop.js                 # Fixed-timestep loop (update + render scheduling)
├── input.js                # Keyboard state polling (keydown/keyup map)
├── physics.js              # Collision detection helpers (circle–circle, point-in-circle, wrapping)
├── pool.js                 # Generic object pool factory
├── entities/
│   ├── ship.js             # Player ship (movement, firing, invulnerability)
│   ├── asteroid.js         # Asteroid (sizes, splitting, random drift)
│   ├── projectile.js       # Bullet (player + saucer variants)
│   ├── saucer.js           # Enemy saucer (movement, AI fire)
│   ├── power-up.js         # Collectible power-up item
│   └── particle.js         # Particle effect element
├── systems/
│   ├── scoring.js          # Score tracking, combo multiplier, extra lives
│   ├── power-up-manager.js # Active power-up state, timers, stacking rules
│   ├── spawner.js          # Asteroid + saucer + power-up spawn logic
│   └── leaderboard.js      # localStorage read/write for top-10 scores
├── rendering/
│   ├── renderer.js         # Canvas context wrapper, clear, neon-glow helpers
│   ├── hud.js              # HUD drawing (score, lives, power-up bar, level)
│   ├── screens.js          # Title, pause, game-over screen drawing
│   └── effects.js          # Particle explosion + thrust flame drawing
└── constants.js            # Tuning values (speeds, sizes, point values, timers)

tests/
├── test-runner.html        # Minimal in-browser test harness
├── physics.test.js         # Collision detection unit tests
├── scoring.test.js         # Score + combo multiplier tests
├── spawner.test.js         # Asteroid spawn + split tests
├── power-up.test.js        # Power-up effect + stacking tests
└── leaderboard.test.js     # localStorage persistence tests
```

**Structure Decision**: Single-project flat layout. All game source lives under `src/` with sub-folders for entities, systems, and rendering. Tests are in a top-level `tests/` folder with a browser-based test harness. No build tool, no `node_modules` in production — just static files served from the repo root.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Touch controls deferred | MVP targets keyboard-only desktop play for fastest validation | Adding virtual joystick increases scope by ~2 modules + extensive mobile testing; will ship as follow-up feature `002-touch-controls` |
## Post-Design Constitution Re-Check

*Re-evaluation after Phase 1 design artifacts (data-model.md, contracts/modules.md, quickstart.md).*

| # | Principle | Status | Design Evidence |
|---|-----------|--------|-----------------|
| I | Game Loop Architecture | ✅ PASS | `loop.js` contract provides `createLoop({ update, render })` with start/stop/pause/resume. Constants define `TICK_RATE=60`, `TICK_MS`, and `MAX_FRAME_TIME=250`. Data model's `GameState.screen` enum supports TITLE/PLAYING/PAUSED/GAME_OVER states. |
| II | Responsive Controls | ✅ PASS | `input.js` contract exposes `isDown(key)` / `wasPressed(key)` / per-tick `update()`. Constants list key bindings. Touch deferred (same justified deviation as pre-design check). |
| III | Core Game Rules | ✅ PASS | Entity contracts: `createShip`, `createAsteroid` with large/medium/small sizes, `splitAsteroid` returning children. Data model defines all fields (hp, lives, radius, vertices). Physics module handles toroidal collision + wrapping. |
| IV | Scoring & Progression | ✅ PASS | `scoring.js` contract: `addKill(points)` with combo, `tick()` for combo decay, `checkExtraLife()`. Constants match constitution values exactly (20/50/100/200/1000, combo max 8, window 2s, 10k extra-life). `leaderboard.js` uses localStorage top-10. |
| V | Power-Up System | ✅ PASS | `power-up-manager.js` contract: `activate(type)` with offensive-replaces-current rule, `absorbHit()` for shield, `getFireCooldownMultiplier()` + `getThrustMultiplier()`. Constants: 4 types, 15% chance, 480-tick duration (~8s), 360-tick despawn (~6s). |
| VI | UI & Visual Design | ✅ PASS | Rendering contracts: `hud.js` draws score/lives/power-up bar/level, `screens.js` draws title/pause/game-over, `effects.js` draws particles + thrust flame. `renderer.js` wraps Canvas 2D with `drawGlow()`. All rendering on Canvas — no HTML overlays. |
| VII | Browser Performance | ✅ PASS | `pool.js` contract provides generic acquire/release. Constants pre-allocate fixed pool sizes. No frameworks/engines. ES modules with zero build step. Quickstart documents local-server requirement and 60fps target. |

**Post-design gate result**: ✅ PASS — All 7 principles confirmed. Same 1 justified deviation (touch controls deferred).

## Generated Artifacts

| Artifact | Path | Phase |
|----------|------|-------|
| Research | `specs/001-mvp-core-game/research.md` | Phase 0 |
| Data Model | `specs/001-mvp-core-game/data-model.md` | Phase 1 |
| Module Contracts | `specs/001-mvp-core-game/contracts/modules.md` | Phase 1 |
| Quickstart | `specs/001-mvp-core-game/quickstart.md` | Phase 1 |
| Agent Context | `.github/agents/copilot-instructions.md` | Phase 1 |