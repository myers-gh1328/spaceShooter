// ============================================================
// NOVA DRIFT — Projectile Entity
// ============================================================

import { BULLET_SPEED, BULLET_RADIUS, BULLET_LIFETIME } from '../constants.js';

/**
 * Pooled projectile factory.
 * @returns {object}
 */
export function projectileFactory() {
  return {
    x: 0, y: 0, prevX: 0, prevY: 0,
    vx: 0, vy: 0,
    radius: BULLET_RADIUS,
    owner: 'player',
    lifetime: 0,
    active: false,
  };
}

/**
 * Pooled projectile reset.
 * @param {object} p
 * @param {number} x
 * @param {number} y
 * @param {number} vx
 * @param {number} vy
 * @param {'player'|'enemy'} owner
 */
export function projectileReset(p, x, y, vx, vy, owner) {
  p.x = x;      p.prevX = x;
  p.y = y;      p.prevY = y;
  p.vx = vx;
  p.vy = vy;
  p.radius = BULLET_RADIUS;
  p.owner = owner;
  p.lifetime = BULLET_LIFETIME;
  p.active = true;
}

/**
 * Create a projectile fired from position (x,y) in direction `angle`.
 * The ship's velocity is added to the bullet velocity.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} angle    — heading angle (radians, 0 = up)
 * @param {number} shipVx   — inherited velocity
 * @param {number} shipVy
 * @param {'player'|'enemy'} owner
 * @returns {object}
 */
export function createProjectile(x, y, angle, shipVx, shipVy, owner) {
  return {
    x, y,
    prevX: x, prevY: y,
    vx: Math.sin(angle) * BULLET_SPEED + shipVx,
    vy: -Math.cos(angle) * BULLET_SPEED + shipVy,
    radius: BULLET_RADIUS,
    owner,
    lifetime: BULLET_LIFETIME,
    active: true,
  };
}

/**
 * Advance one tick.
 * @param {object} projectile
 */
export function updateProjectile(projectile) {
  projectile.prevX = projectile.x;
  projectile.prevY = projectile.y;
  projectile.x += projectile.vx;
  projectile.y += projectile.vy;
  projectile.lifetime--;
  if (projectile.lifetime <= 0) {
    projectile.active = false;
  }
}
