# Tasks: NOVA DRIFT — MVP Core Game

**Input**: Design documents from `/specs/001-mvp-core-game/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/modules.md, quickstart.md

**Tests**: Not included — no explicit test request in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the project skeleton — folders, entry HTML, stylesheet, and the constants module that every other module imports.

- [X] T001 Create project directory structure: `src/`, `src/entities/`, `src/systems/`, `src/rendering/`, `css/`, `tests/`
- [X] T002 [P] Create `index.html` with `<canvas id="game" width="1024" height="768">`, CSS link, and `<script type="module" src="./src/main.js">`
- [X] T003 [P] Create `css/style.css` with page layout (dark background, centred canvas, Orbitron font import, no scrollbars)
- [X] T004 [P] Create `src/constants.js` with all tuning values from contracts (canvas size, tick rate, ship/bullet/asteroid/saucer/power-up/scoring/particle constants, and colour palette)

**Checkpoint**: Folder structure exists, `index.html` loads `style.css` and references `main.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and infrastructure that MUST be complete before ANY user story can be implemented. Every module here is imported by multiple story-specific modules.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 [P] Implement `src/pool.js` — generic `createPool(factory, resetFn, initialSize)` with `acquire()`, `release()`, auto-grow, and `size`/`available` getters per contracts/modules.md
- [X] T006 [P] Implement `src/physics.js` — `collides(a, b, canvasW, canvasH)` with toroidal `wrapDelta`, `wrapPosition(entity, canvasW, canvasH)`, `lerp(a, b, t)`, and `lerpAngle(a, b, t)` per contracts/modules.md
- [X] T007 [P] Implement `src/input.js` — `createInput()` returning `init()`, `destroy()`, `isDown(key)`, `wasPressed(key)`, `update()` with keydown/keyup listeners and edge-detection per contracts/modules.md
- [X] T008 [P] Implement `src/loop.js` — `createLoop({ update, render })` returning `start()`, `stop()`, `pause()`, `resume()` with fixed-timestep accumulator (60 Hz), `requestAnimationFrame`, interpolation alpha, and 250 ms frame-delta clamp per research.md
- [X] T009 [P] Implement `src/rendering/renderer.js` — `createRenderer(canvas)` returning `clear()`, `drawGlow(path, color)`, `drawGlowText(text, x, y, color, size)`, `save()`, `restore()`, `translate()`, `rotate()`, plus `ctx`/`width`/`height` getters; use `{ alpha: false }` context and `globalCompositeOperation = 'lighter'` per research.md
- [X] T010 [P] Implement `src/entities/particle.js` — `createParticle(x, y, vx, vy, color)` and `updateParticle(particle, dt)` with linear opacity decay and lifetime countdown per data-model.md
- [X] T011 Implement `src/rendering/effects.js` — `drawParticles(renderer, particles, alpha)` with interpolated positions and `drawThrustFlame(renderer, ship, alpha)` with flickering neon glow per contracts/modules.md

**Checkpoint**: Foundation ready — all shared utilities importable; user story implementation can begin

---

## Phase 3: User Story 1 — Fly & Shoot (Priority: P1) 🎯 MVP

**Goal**: The player can fly a ship, fire projectiles, destroy splitting asteroids, wrap around screen edges, and advance through levels with increasing asteroid counts.

**Independent Test**: Open `index.html` via local server, fly the ship with arrow keys, fire with Space, destroy all asteroids, and confirm the next level spawns with one additional asteroid.

### Implementation for User Story 1

- [X] T012 [P] [US1] Implement `src/entities/ship.js` — `createShip(x, y)` with all data-model fields (position, velocity, rotation, radius, lives, invulnerableTimer, fireCooldown, thrusting, active) and `updateShip(ship, input, powerUpState, dt)` handling rotation, thrust, drag, speed cap, and cooldown decrement
- [X] T013 [P] [US1] Implement `src/entities/asteroid.js` — `createAsteroid(x, y, size)` with random velocity within speed range, random rotation speed, pre-generated irregular polygon vertices (8–12 verts), `splitAsteroid(asteroid)` returning 2 children (or empty for small), and `updateAsteroid(asteroid, dt)`
- [X] T014 [P] [US1] Implement `src/entities/projectile.js` — `createProjectile(x, y, vx, vy, owner)` and `updateProjectile(projectile, dt)` with lifetime countdown and deactivation at 0
- [X] T015 [US1] Implement `src/systems/spawner.js` — `createSpawner(canvasW, canvasH)` with `spawnLevelAsteroids(level, pool)` placing `3 + level` large asteroids at random screen edges away from centre; stub `maybeSaucer()` and `maybePowerUp()` for later stories
- [X] T016 [P] [US1] Implement `src/rendering/hud.js` — `drawHUD(renderer, gameState)` rendering current level number in top-right corner; leave score/lives/power-up placeholders for US2/US3
- [X] T017 [US1] Implement `src/game.js` — `createGame(canvas)` owning entity arrays (ship, asteroids, projectiles, particles), pools for each, renderer, input, loop, and spawner; wire update callback: poll input → update ship → update projectiles → update asteroids → check bullet↔asteroid collisions (split + particles + release) → check all wrapping → detect level-clear → spawn next level; wire render callback: clear → draw asteroids → draw projectiles → draw ship → draw thrust flame → draw particles → draw HUD
- [X] T018 [US1] Implement `src/main.js` — find `<canvas id="game">`, call `createGame(canvas)`, call `game.start()`; add `window.addEventListener('beforeunload', () => game.destroy())`

**Checkpoint**: Core gameplay loop functional — ship flies, fires, destroys asteroids, levels advance. No scoring, lives, or game-over yet.

---

## Phase 4: User Story 2 — Lives, Scoring & Game Over (Priority: P2)

**Goal**: Destroying asteroids awards points with a combo multiplier. The ship has 3 lives; collisions cost a life. Zero lives triggers a game-over screen with the final score and a play-again option. Extra lives are awarded every 10,000 points.

**Independent Test**: Start a game, destroy asteroids and confirm correct point values. Destroy two within 2 seconds and confirm combo. Collide with an asteroid — confirm life lost. Lose all 3 lives — confirm game-over screen with correct score and play-again.

### Implementation for User Story 2

- [X] T019 [P] [US2] Implement `src/systems/scoring.js` — `createScoring(initialHighScore)` returning `score`, `combo`, `highScore` getters, `addKill(points)` (awards `points × combo`, increments combo, resets combo timer), `tick()` (decrements combo timer, resets to ×1 after COMBO_WINDOW ticks), `checkExtraLife(ship)` (awards life at next 10k threshold), `reset()`
- [X] T020 [P] [US2] Add `drawGameOverScreen(renderer, score, isNewHigh)` to `src/rendering/screens.js` — display "GAME OVER", final score with neon glow, new-high-score callout if applicable, "Press ENTER to Play Again" prompt
- [X] T021 [US2] Extend `src/rendering/hud.js` — add current score (top-left), high score (top-centre), lives remaining as ship icons (bottom-left), and combo multiplier indicator (below score)
- [X] T022 [US2] Extend `src/game.js` — integrate scoring system (addKill on asteroid destruction, tick each update, checkExtraLife), add ship↔asteroid and ship↔enemy-projectile collision with life loss, trigger 2-second invulnerability + respawn at centre on death, transition to GAME_OVER screen when lives reach 0, handle ENTER on game-over to restart with fresh state

**Checkpoint**: Score, combo, lives, extra lives, and game-over all functional. Each kill shows correct points; game-over screen appears and play-again works.

---

## Phase 5: User Story 3 — Power-Ups (Priority: P3)

**Goal**: Power-ups spawn when medium/small asteroids are destroyed (15% chance). Collecting one activates a temporary ability (Rapid Fire, Shield, Triple Shot, Speed Boost) for 8 seconds. The HUD shows the active power-up and remaining time. Uncollected power-ups despawn after 6 seconds.

**Independent Test**: Destroy small/medium asteroids until a power-up spawns. Fly into it and confirm the effect activates for 8 seconds with a visible HUD indicator. Confirm an uncollected power-up despawns after 6 seconds.

### Implementation for User Story 3

- [X] T023 [P] [US3] Implement `src/entities/power-up.js` — `createPowerUp(x, y, type)` with position, radius, despawnTimer, active flag and distinct colour per type; `updatePowerUp(powerUp, dt)` decrementing despawnTimer and deactivating at 0
- [X] T024 [US3] Implement `src/systems/power-up-manager.js` — `createPowerUpManager()` with `activate(type)` (offensive replaces current, shield/speedBoost stack independently), `tick()` (decrement all active timers), `getFireCooldownMultiplier()` (0.5 if rapidFire), `getThrustMultiplier()` (1.5 if speedBoost), `absorbHit()` (true + deactivate if shield active), `getRenderState()` returning active power-ups with remaining/total ticks, `reset()`
- [X] T025 [US3] Extend `src/systems/spawner.js` — implement `maybePowerUp(asteroid, pool)` returning a random-type PowerUp at asteroid position with 15% probability when asteroid size is `'medium'` or `'small'`
- [X] T026 [US3] Extend `src/rendering/hud.js` — add active power-up indicator with icon, label, and remaining-time bar (positioned below lives or bottom-right)
- [X] T027 [US3] Extend `src/game.js` — add power-up pool (5 pre-alloc), call `maybePowerUp` on asteroid destruction, check ship↔power-up collision to activate via power-up-manager, pass `powerUpState` to `updateShip` for fire-cooldown and thrust multipliers, call `absorbHit()` before deducting a life, tick power-up-manager each update, pass render state to HUD

**Checkpoint**: All 4 power-up types work correctly — Rapid Fire halves cooldown, Shield absorbs one hit, Triple Shot fires spread, Speed Boost increases thrust. HUD shows active power-up with timer. Uncollected power-ups despawn.

---

## Phase 6: User Story 4 — Title Screen, Pause & Leaderboard (Priority: P4)

**Goal**: A title screen shows the NOVA DRIFT logo, start prompt, and top-10 leaderboard. Pressing ENTER starts the game. Escape pauses with a translucent overlay. Scores persist across sessions via localStorage.

**Independent Test**: Load the page — confirm title screen with logo and leaderboard. Press ENTER — confirm gameplay starts. Press Escape — confirm pause overlay and game freezes. Resume — confirm gameplay continues. Complete a game with a top-10 score — confirm it appears on the leaderboard after returning to the title screen.

### Implementation for User Story 4

- [X] T028 [P] [US4] Implement `src/systems/leaderboard.js` — `createLeaderboard()` with `getScores()` (reads/parses `localStorage` key `novadrift_leaderboard`), `addScore(score, level)` (inserts if top-10, ties go below older entry, returns boolean), `getHighScore()` (returns top entry score or 0)
- [X] T029 [US4] Implement title screen and pause overlay in `src/rendering/screens.js` — `drawTitleScreen(renderer, leaderboard)` with neon-glow "NOVA DRIFT" logo, "Press ENTER to Start", and top-10 score table (or empty-state message); `drawPauseOverlay(renderer)` with semi-transparent backdrop, "PAUSED" label, "Press ESC to Resume" and "Press Q to Quit" prompts
- [X] T030 [US4] Extend `src/game.js` — implement full screen state machine: TITLE (render title, ENTER → PLAYING), PLAYING (game loop, ESC → PAUSED), PAUSED (render overlay, ESC → PLAYING, Q → TITLE), GAME_OVER (render game over, ENTER → PLAYING, ESC → TITLE); initialise scoring with `leaderboard.getHighScore()`; call `leaderboard.addScore()` on game-over
- [X] T031 [US4] Add tab-visibility auto-pause — listen for `document.visibilitychange`; if `document.hidden` and screen is PLAYING, transition to PAUSED and call `loop.pause()`; on resume, reset loop timing to avoid catch-up ticks (in `src/game.js` or `src/loop.js`)

**Checkpoint**: Full screen flow works — title screen → gameplay → pause → resume → game-over → leaderboard persists across browser sessions.

---

## Phase 7: User Story 5 — Enemy Saucers (Priority: P5)

**Goal**: Starting at level 3, enemy saucers periodically spawn from a screen edge, fly across the field, and fire projectiles at the player. Small saucers award 1,000 points; large saucers 200 points.

**Independent Test**: Play until level 3. Confirm a saucer spawns from a screen edge, moves across, fires at the player, and can be destroyed for the correct point value.

### Implementation for User Story 5

- [X] T032 [P] [US5] Implement `src/entities/saucer.js` — `createSaucer(size, canvasW, canvasH)` spawning at random edge with horizontal drift and periodic direction changes; `updateSaucer(saucer, shipPos, dt)` returning `{ fire: true, vx, vy }` when fire cooldown expires (aimed at ship position) or `null`; deactivate when exiting opposite edge (saucers do NOT wrap)
- [X] T033 [US5] Extend `src/systems/spawner.js` — implement `maybeSaucer(level, tick, pool)` returning a Saucer when level ≥ 3 and spawn timer (random 600–1200 ticks) expires; alternate large/small sizes biased toward small at higher levels
- [X] T034 [US5] Extend `src/game.js` — add saucer to entity arrays and pool (pre-alloc 2), call `maybeSaucer` each tick, process `updateSaucer` return to spawn enemy projectiles, add player-bullet↔saucer collision (award points via scoring), add saucer-bullet↔ship collision (lose life), add ship↔saucer collision (lose life), draw saucer with neon-glow yellow outline

**Checkpoint**: Saucers appear at level 3+, fire at the player, can be destroyed for correct points. All collision cases handled.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, resilience, and final validation across all user stories.

- [X] T035 [P] Handle simultaneous collision priority in `src/game.js` — process bullet↔asteroid collisions before ship↔asteroid so if both events trigger on the same tick, asteroid destruction takes priority and ship is unharmed (per edge case spec)
- [X] T036 [P] Ensure power-up timers persist across level transitions in `src/game.js` — do not reset power-up-manager state when advancing to a new level
- [X] T037 [P] Handle rapid pause/unpause in `src/game.js` — debounce or use `wasPressed` for Escape key so repeated presses toggle cleanly without breaking the loop
- [X] T038 Add window resize handler in `src/main.js` — scale Canvas proportionally with `CSS transform: scale()` preserving 1024×768 logical resolution; recalculate on `window.resize` event
- [X] T039 Run quickstart.md validation — serve the project with `npx serve`, walk through all acceptance scenarios from spec.md, verify 60 fps, confirm leaderboard persistence, and check <500 KB page weight
- [X] T040 Code cleanup — verify ESLint compliance, confirm all imports use relative `.js` paths, remove console.log debug statements, review against constitution principles

**Checkpoint**: All edge cases handled, page weight under 500 KB, 60 fps confirmed, quickstart validation passed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001–T004) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on US1 (Phase 3) — scoring and lives build on the core loop
- **User Story 3 (Phase 5)**: Depends on US2 (Phase 4) — power-ups interact with lives (shield absorbs hit)
- **User Story 4 (Phase 6)**: Depends on US2 (Phase 4) — title/game-over screens need scoring + leaderboard
- **User Story 5 (Phase 7)**: Depends on US2 (Phase 4) — saucer scoring and collisions need lives system
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup)
  └─▶ Phase 2 (Foundational)
        └─▶ Phase 3 (US1: Fly & Shoot)
              └─▶ Phase 4 (US2: Lives, Scoring & Game Over)
                    ├─▶ Phase 5 (US3: Power-Ups)
                    ├─▶ Phase 6 (US4: Title, Pause, Leaderboard)
                    └─▶ Phase 7 (US5: Enemy Saucers)
                          └─▶ Phase 8 (Polish)
```

### Within Each User Story

- Entity modules before systems that use them
- Systems before game.js integration
- game.js integration is always the final task in a story phase
- Rendering extensions can parallelize with entity/system work when they consume data passed by game.js

### Parallel Opportunities

**Phase 1**: T002, T003, T004 can all run in parallel after T001 creates folders.

**Phase 2**: T005–T010 can all run in parallel (independent utility modules); T011 follows after T009 + T010.

**Phase 3 (US1)**: T012, T013, T014 (entities) and T016 (HUD) can run in parallel; T015 (spawner) follows T013; T017 (game.js) follows all; T018 follows T017.

**Phase 4 (US2)**: T019 (scoring) and T020 (game-over screen) can run in parallel; T021 (HUD extension) and T022 (game.js) are sequential after those.

**Phase 5 (US3)**: T023 (power-up entity) can start immediately; T024–T027 are sequential.

**Phase 6 (US4)**: T028 (leaderboard) can start immediately; T029–T031 are sequential.

**Phase 7 (US5)**: T032 (saucer entity) can start immediately; T033–T034 are sequential.

**Phase 8**: T035, T036, T037 can run in parallel (different edge cases, same file but independent logic blocks); T038–T040 are sequential.

---

## Parallel Examples

### Phase 2 — All foundations at once

```
Parallel batch 1:
  T005  src/pool.js
  T006  src/physics.js
  T007  src/input.js
  T008  src/loop.js
  T009  src/rendering/renderer.js
  T010  src/entities/particle.js

Sequential after batch 1:
  T011  src/rendering/effects.js
```

### Phase 3 — US1 entity parallelism

```
Parallel batch 1:
  T012  src/entities/ship.js
  T013  src/entities/asteroid.js
  T014  src/entities/projectile.js
  T016  src/rendering/hud.js

Sequential after batch 1:
  T015  src/systems/spawner.js
  T017  src/game.js
  T018  src/main.js
```

### Phases 5+6+7 — Stories after US2 can parallelize

```
With multiple developers after Phase 4 completes:
  Developer A: Phase 5 (US3: Power-Ups)       T023–T027
  Developer B: Phase 6 (US4: Screens/Pause)   T028–T031
  Developer C: Phase 7 (US5: Saucers)         T032–T034
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T011)
3. Complete Phase 3: User Story 1 (T012–T018)
4. **STOP and VALIDATE**: Open `index.html`, fly, shoot, destroy asteroids, advance levels
5. Ship, asteroids, projectiles, and levels all function — MVP is playable

### Incremental Delivery

1. Setup + Foundational → Skeleton loads in browser
2. Add US1 → **Playable core** (fly, shoot, asteroids, levels)
3. Add US2 → **Stakes added** (scoring, lives, game-over, combo)
4. Add US3 → **Variety added** (4 power-up types, tactical choices)
5. Add US4 → **Polish layer** (title screen, pause, leaderboard persistence)
6. Add US5 → **Depth added** (enemy saucers from level 3+)
7. Polish → **Ship-ready** (edge cases, resize, lint, validation)
8. Each story adds value without breaking previous stories

---

## Notes

- **No tests generated** — the spec did not explicitly request TDD or unit tests. Test tasks can be added later.
- **[P] tasks** = different files with no dependencies on incomplete tasks in the same batch.
- **[Story] label** maps each task to its user story for traceability.
- **game.js is the integration point** — each story extends it; tasks are sequenced so game.js is always last in a phase.
- **Commit after each task** or logical group for clean history.
- **Stop at any checkpoint** to validate the story independently before proceeding.
- All rendering uses Canvas 2D only — no HTML overlays inside the game viewport (per constitution VI).
- All imports must use relative paths with `.js` extension — no bare specifiers, no import maps.
