// ============================================================
// NOVA DRIFT — Spawner System
// Asteroid, saucer, and power-up spawn logic.
// ============================================================

import {
  ASTEROID_START_COUNT,
  SAUCER_MIN_LEVEL,
  SAUCER_SPAWN_INTERVAL,
  POWERUP_SPAWN_CHANCE,
  CANVAS_W,
  CANVAS_H,
} from '../constants.js';
import { asteroidReset } from '../entities/asteroid.js';

/**
 * @param {number} [canvasW]
 * @param {number} [canvasH]
 * @returns {{
 *   spawnLevelAsteroids(level: number, pool: object): object[],
 *   maybeSaucer(level: number, tick: number, pool: object): object|null,
 *   maybePowerUp(asteroid: object, pool: object): object|null,
 *   resetSaucerTimer(): void,
 * }}
 */
export function createSpawner(canvasW = CANVAS_W, canvasH = CANVAS_H) {
  let saucerTimer = _randomSaucerInterval();

  /**
   * Spawn large asteroids for a new level, placed at screen edges
   * well away from the centre.
   *
   * @param {number} level
   * @param {object} pool  — asteroid pool
   * @returns {object[]}
   */
  function spawnLevelAsteroids(level, pool) {
    const count = ASTEROID_START_COUNT - 1 + level; // level 1 → 4, level 2 → 5, …
    const spawned = [];
    const margin = 60; // keep away from edges a bit

    for (let i = 0; i < count; i++) {
      const pos = _edgePosition(canvasW, canvasH, margin);
      // Retry if too close to centre (safe zone = 150 px)
      const safeRadius = 150;
      const dx = pos.x - canvasW / 2;
      const dy = pos.y - canvasH / 2;
      if (dx * dx + dy * dy < safeRadius * safeRadius) {
        // Mirror position to opposite side of centre
        pos.x = canvasW - pos.x;
        pos.y = canvasH - pos.y;
      }

      const a = pool.acquire(pos.x, pos.y, 'large');
      spawned.push(a);
    }
    return spawned;
  }

  /**
   * Maybe spawn a saucer this tick.
   * Only active when level ≥ SAUCER_MIN_LEVEL.
   * Returns a Saucer object or null.
   *
   * @param {number} level
   * @param {object} pool  — saucer pool
   * @returns {object|null}
   */
  function maybeSaucer(level, pool) {
    if (level < SAUCER_MIN_LEVEL) return null;

    saucerTimer--;
    if (saucerTimer > 0) return null;

    saucerTimer = _randomSaucerInterval();

    // Bias toward small saucer at higher levels
    const smallChance = Math.min(0.3 + (level - SAUCER_MIN_LEVEL) * 0.1, 0.8);
    const size = Math.random() < smallChance ? 'small' : 'large';

    return pool.acquire(size, canvasW, canvasH);
  }

  /**
   * Maybe spawn a power-up when a medium or small asteroid is destroyed.
   * 15% chance; returns PowerUp or null.
   *
   * @param {object} asteroid
   * @param {object} pool  — power-up pool
   * @returns {object|null}
   */
  function maybePowerUp(asteroid, pool) {
    if (asteroid.size === 'large') return null;
    if (Math.random() >= POWERUP_SPAWN_CHANCE) return null;
    return pool.acquire(asteroid.x, asteroid.y);
  }

  function resetSaucerTimer() {
    saucerTimer = _randomSaucerInterval();
  }

  return { spawnLevelAsteroids, maybeSaucer, maybePowerUp, resetSaucerTimer };
}

// Helpers

function _randomSaucerInterval() {
  return SAUCER_SPAWN_INTERVAL[0] +
    Math.floor(Math.random() * (SAUCER_SPAWN_INTERVAL[1] - SAUCER_SPAWN_INTERVAL[0] + 1));
}

/**
 * Return a random position on one of the four screen edges.
 */
function _edgePosition(w, h, margin) {
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0: return { x: margin + Math.random() * (w - margin * 2), y: margin };
    case 1: return { x: margin + Math.random() * (w - margin * 2), y: h - margin };
    case 2: return { x: margin, y: margin + Math.random() * (h - margin * 2) };
    default:return { x: w - margin, y: margin + Math.random() * (h - margin * 2) };
  }
}
