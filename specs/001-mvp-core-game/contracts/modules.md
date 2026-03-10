# Module Contracts: NOVA DRIFT — MVP Core Game

**Feature**: `001-mvp-core-game`
**Date**: 2026-03-10

This document defines the public interfaces (exports) of each ES module
in the game. Implementation details are intentionally omitted — only the
contract that other modules depend on is specified.

---

## `src/constants.js`

Exports all tuning values as named constants. Single source of truth for
game balance, sizes, and timing.

```js
// Canvas
export const CANVAS_W = 1024;
export const CANVAS_H = 768;

// Physics
export const TICK_RATE = 60;
export const TICK_MS = 1000 / TICK_RATE;
export const MAX_FRAME_TIME = 250;            // spiral-of-death clamp (ms)

// Ship
export const SHIP_ROTATION_SPEED = 0.07;      // radians per tick
export const SHIP_THRUST = 0.12;              // px per tick²
export const SHIP_MAX_SPEED = 6;              // px per tick
export const SHIP_DRAG = 0.99;                // velocity multiplier per tick
export const SHIP_RADIUS = 12;
export const SHIP_FIRE_COOLDOWN = 10;         // ticks (~167 ms)
export const SHIP_INVULNERABLE_TICKS = 120;   // ~2 seconds

// Projectile
export const BULLET_SPEED = 8;                // px per tick
export const BULLET_RADIUS = 3;
export const BULLET_LIFETIME = 90;            // ticks (~1.5 s)

// Asteroids
export const ASTEROID_SIZES = {
  large:  { radius: 40, points: 20,  speed: [0.5, 1.5] },
  medium: { radius: 20, points: 50,  speed: [1.0, 2.5] },
  small:  { radius: 10, points: 100, speed: [1.5, 3.0] },
};
export const ASTEROID_START_COUNT = 4;        // level 1
export const ASTEROID_VERTICES_MIN = 8;
export const ASTEROID_VERTICES_MAX = 12;

// Saucer
export const SAUCER_SIZES = {
  large: { radius: 20, points: 200, fireCooldown: 90 },
  small: { radius: 12, points: 1000, fireCooldown: 45 },
};
export const SAUCER_SPEED = 2;
export const SAUCER_MIN_LEVEL = 3;
export const SAUCER_SPAWN_INTERVAL = [600, 1200]; // ticks

// Power-ups
export const POWERUP_TYPES = ['rapidFire', 'shield', 'tripleShot', 'speedBoost'];
export const POWERUP_SPAWN_CHANCE = 0.15;
export const POWERUP_DURATION = 480;          // ticks (~8 s)
export const POWERUP_DESPAWN = 360;           // ticks (~6 s)
export const POWERUP_RADIUS = 10;

// Scoring
export const COMBO_WINDOW = 120;              // ticks (~2 s)
export const COMBO_MAX = 8;
export const EXTRA_LIFE_THRESHOLD = 10000;

// Particles
export const PARTICLE_COUNT_EXPLOSION = 12;
export const PARTICLE_LIFETIME = [20, 50];    // ticks range

// Colours
export const COLORS = {
  bg:              '#0a0a1a',
  ship:            '#00ffff',
  asteroid:        '#4d8bff',
  bulletPlayer:    '#ff2975',
  bulletEnemy:     '#ff6600',
  powerUp:         '#39ff14',
  saucer:          '#ffff00',
  hudText:         '#ffffff',
  hudAccent:       '#00ffff',
};
```

---

## `src/loop.js`

Manages the fixed-timestep game loop.

```js
/**
 * @param {object} callbacks
 * @param {(dt: number) => void} callbacks.update  — called at fixed TICK_RATE
 * @param {(alpha: number) => void} callbacks.render — called each rAF with interpolation alpha
 * @returns {{ start(): void, stop(): void, pause(): void, resume(): void }}
 */
export function createLoop(callbacks) { /* … */ }
```

---

## `src/input.js`

Polls keyboard state each tick.

```js
/**
 * @returns {{
 *   init(): void,
 *   destroy(): void,
 *   isDown(key: string): boolean,
 *   wasPressed(key: string): boolean,
 *   update(): void,
 * }}
 */
export function createInput() { /* … */ }
```

- `isDown(key)` — true while a key is held.
- `wasPressed(key)` — true only on the tick the key transitioned from up to down.
- `update()` — call once per tick to advance pressed/released edge detection.

---

## `src/pool.js`

Generic object pool factory.

```js
/**
 * @template T
 * @param {() => T} factory        — creates a blank instance
 * @param {(obj: T, ...args) => void} resetFn — re-initialises for reuse
 * @param {number} initialSize     — pre-allocation count
 * @returns {{
 *   acquire(...args): T,
 *   release(obj: T): void,
 *   readonly size: number,
 *   readonly available: number,
 * }}
 */
export function createPool(factory, resetFn, initialSize) { /* … */ }
```

---

## `src/physics.js`

Pure collision-detection helpers. No side effects.

```js
/**
 * Circle-circle collision test (toroidal wrapping).
 * @returns {boolean}
 */
export function collides(a, b, canvasW, canvasH) { /* … */ }

/**
 * Wrap a position to stay within [0, max).
 * Mutates the entity's x/y in place.
 */
export function wrapPosition(entity, canvasW, canvasH) { /* … */ }

/**
 * Linear interpolation helper.
 * @returns {number}
 */
export function lerp(a, b, t) { /* … */ }

/**
 * Shortest-angle interpolation (handles 2π wraparound).
 * @returns {number}
 */
export function lerpAngle(a, b, t) { /* … */ }
```

---

## `src/entities/ship.js`

```js
/**
 * @returns {Ship}  (see data-model.md for fields)
 */
export function createShip(x, y) { /* … */ }

/**
 * Apply one tick of input + physics to the ship.
 */
export function updateShip(ship, input, powerUpState, dt) { /* … */ }
```

---

## `src/entities/asteroid.js`

```js
/**
 * @param {'large'|'medium'|'small'} size
 * @returns {Asteroid}
 */
export function createAsteroid(x, y, size) { /* … */ }

/**
 * Spawn children on destruction.
 * @returns {Asteroid[]}  (empty for small)
 */
export function splitAsteroid(asteroid) { /* … */ }

export function updateAsteroid(asteroid, dt) { /* … */ }
```

---

## `src/entities/projectile.js`

```js
/**
 * @param {'player'|'enemy'} owner
 * @returns {Projectile}
 */
export function createProjectile(x, y, vx, vy, owner) { /* … */ }

export function updateProjectile(projectile, dt) { /* … */ }
```

---

## `src/entities/saucer.js`

```js
/**
 * @param {'large'|'small'} size
 * @returns {Saucer}
 */
export function createSaucer(size, canvasW, canvasH) { /* … */ }

/**
 * @returns {{ fire: boolean, vx: number, vy: number } | null}
 *   Returns projectile velocity if saucer fires this tick, else null.
 */
export function updateSaucer(saucer, shipPos, dt) { /* … */ }
```

---

## `src/entities/power-up.js`

```js
/**
 * @param {'rapidFire'|'shield'|'tripleShot'|'speedBoost'} type
 * @returns {PowerUp}
 */
export function createPowerUp(x, y, type) { /* … */ }

export function updatePowerUp(powerUp, dt) { /* … */ }
```

---

## `src/entities/particle.js`

```js
/**
 * @returns {Particle}
 */
export function createParticle(x, y, vx, vy, color) { /* … */ }

export function updateParticle(particle, dt) { /* … */ }
```

---

## `src/systems/scoring.js`

```js
/**
 * @returns {{
 *   readonly score: number,
 *   readonly combo: number,
 *   readonly highScore: number,
 *   addKill(points: number): void,
 *   tick(): void,
 *   checkExtraLife(ship: Ship): void,
 *   reset(): void,
 * }}
 */
export function createScoring(initialHighScore) { /* … */ }
```

- `addKill(points)` — awards `points × combo`, increments combo, resets combo timer.
- `tick()` — decrements combo timer; resets combo to 1 if window expires.
- `checkExtraLife(ship)` — awards a life when score crosses the next 10 000 threshold.

---

## `src/systems/power-up-manager.js`

```js
/**
 * @returns {{
 *   readonly offensiveType: string | null,
 *   readonly shieldActive: boolean,
 *   readonly speedBoostActive: boolean,
 *   activate(type: string): void,
 *   tick(): void,
 *   getFireCooldownMultiplier(): number,
 *   getThrustMultiplier(): number,
 *   absorbHit(): boolean,
 *   reset(): void,
 *   getRenderState(): { type: string, remaining: number, total: number }[],
 * }}
 */
export function createPowerUpManager() { /* … */ }
```

- `activate(type)` — if offensive, replaces current offensive; if shield/speedBoost, starts/restarts timer.
- `absorbHit()` — returns `true` and deactivates shield if shield is active; else `false`.
- `getRenderState()` — returns array of active power-ups for HUD rendering.

---

## `src/systems/spawner.js`

```js
/**
 * @returns {{
 *   spawnLevelAsteroids(level: number, pool): Asteroid[],
 *   maybeSaucer(level: number, tick: number, pool): Saucer | null,
 *   maybePowerUp(asteroid: Asteroid, pool): PowerUp | null,
 * }}
 */
export function createSpawner(canvasW, canvasH) { /* … */ }
```

---

## `src/systems/leaderboard.js`

```js
/**
 * @returns {{
 *   getScores(): ScoreEntry[],
 *   addScore(score: number, level: number): boolean,
 *   getHighScore(): number,
 * }}
 */
export function createLeaderboard() { /* … */ }
```

- `addScore()` — inserts if top-10; returns `true` if new entry made the board.
- Uses `localStorage` key `novadrift_leaderboard`.

---

## `src/rendering/renderer.js`

```js
/**
 * @returns {{
 *   clear(): void,
 *   drawGlow(path: Path2D, color: string): void,
 *   drawGlowText(text: string, x: number, y: number, color: string, size: number): void,
 *   save(): void,
 *   restore(): void,
 *   translate(x: number, y: number): void,
 *   rotate(angle: number): void,
 *   readonly ctx: CanvasRenderingContext2D,
 *   readonly width: number,
 *   readonly height: number,
 * }}
 */
export function createRenderer(canvas) { /* … */ }
```

---

## `src/rendering/hud.js`

```js
/**
 * Draw the in-game HUD (score, high score, lives, power-up bar, level).
 */
export function drawHUD(renderer, gameState) { /* … */ }
```

---

## `src/rendering/screens.js`

```js
export function drawTitleScreen(renderer, leaderboard) { /* … */ }
export function drawPauseOverlay(renderer) { /* … */ }
export function drawGameOverScreen(renderer, score, isNewHigh) { /* … */ }
```

---

## `src/rendering/effects.js`

```js
/**
 * Draw all active particles.
 */
export function drawParticles(renderer, particles, alpha) { /* … */ }

/**
 * Draw the thrust flame behind the ship.
 */
export function drawThrustFlame(renderer, ship, alpha) { /* … */ }
```

---

## `src/game.js`

Top-level game orchestrator. Owns the state machine, entity arrays,
pools, systems, and delegates to the loop.

```js
/**
 * @param {HTMLCanvasElement} canvas
 * @returns {{
 *   start(): void,
 *   destroy(): void,
 * }}
 */
export function createGame(canvas) { /* … */ }
```

---

## `src/main.js`

Entry point. Finds the `<canvas>` element, creates the game, and starts it.

```js
// No exports — side-effect module.
// Imported by index.html via <script type="module" src="./src/main.js">
```
