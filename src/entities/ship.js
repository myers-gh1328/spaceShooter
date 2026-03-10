// ============================================================
// NOVA DRIFT — Ship Entity
// ============================================================

import {
  SHIP_ROTATION_SPEED,
  SHIP_THRUST,
  SHIP_MAX_SPEED,
  SHIP_DRAG,
  SHIP_RADIUS,
  SHIP_FIRE_COOLDOWN,
  SHIP_INVULNERABLE_TICKS,
  SHIP_START_LIVES,
  KEY,
} from '../constants.js';

/**
 * Create a new Ship positioned at (x, y).
 * @param {number} x
 * @param {number} y
 * @returns {object}
 */
export function createShip(x, y) {
  return {
    x, y,
    prevX: x, prevY: y,
    vx: 0, vy: 0,
    rotation: 0,          // 0 = pointing UP (negative Y axis)
    prevRotation: 0,
    radius: SHIP_RADIUS,
    lives: SHIP_START_LIVES,
    invulnerableTimer: 0,
    fireCooldown: 0,
    thrusting: false,
    active: true,
  };
}

/**
 * Reset ship state for respawn at centre.
 * @param {object} ship
 * @param {number} x
 * @param {number} y
 */
export function respawnShip(ship, x, y) {
  ship.x = x;          ship.prevX = x;
  ship.y = y;          ship.prevY = y;
  ship.vx = 0;
  ship.vy = 0;
  ship.rotation = 0;   ship.prevRotation = 0;
  ship.invulnerableTimer = SHIP_INVULNERABLE_TICKS;
  ship.fireCooldown = 0;
  ship.thrusting = false;
  ship.active = true;
}

/**
 * Apply one tick of input + physics to the ship.
 * Returns `true` if the ship wants to fire this tick.
 *
 * @param {object} ship
 * @param {object} input     — from createInput()
 * @param {object} powerUp   — from createPowerUpManager()
 * @param {number} _dt       — fixed delta (unused; all values are per-tick)
 * @returns {boolean}  fireShouldHappen
 */
export function updateShip(ship, input, powerUp, _dt) {
  if (!ship.active) return false;

  // Save previous state for interpolation
  ship.prevX = ship.x;
  ship.prevY = ship.y;
  ship.prevRotation = ship.rotation;

  // --- Rotation ---
  if (input.isDown(KEY.LEFT))  ship.rotation -= SHIP_ROTATION_SPEED;
  if (input.isDown(KEY.RIGHT)) ship.rotation += SHIP_ROTATION_SPEED;
  // Normalise to [0, 2π)
  ship.rotation = ((ship.rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  // --- Thrust ---
  ship.thrusting = input.isDown(KEY.UP);
  if (ship.thrusting) {
    const thrustMult = powerUp ? powerUp.getThrustMultiplier() : 1;
    const thrust = SHIP_THRUST * thrustMult;
    // rotation 0 = up; sin for X, -cos for Y
    ship.vx += Math.sin(ship.rotation) * thrust;
    ship.vy -= Math.cos(ship.rotation) * thrust;
  }

  // --- Drag ---
  ship.vx *= SHIP_DRAG;
  ship.vy *= SHIP_DRAG;

  // --- Speed cap ---
  const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
  if (speed > SHIP_MAX_SPEED) {
    const scale = SHIP_MAX_SPEED / speed;
    ship.vx *= scale;
    ship.vy *= scale;
  }

  // --- Move ---
  ship.x += ship.vx;
  ship.y += ship.vy;

  // --- Cooldowns ---
  if (ship.fireCooldown > 0) ship.fireCooldown--;
  if (ship.invulnerableTimer > 0) ship.invulnerableTimer--;

  // --- Fire ---
  const cooldownTicks = powerUp
    ? Math.ceil(SHIP_FIRE_COOLDOWN * powerUp.getFireCooldownMultiplier())
    : SHIP_FIRE_COOLDOWN;

  const wantsFire = input.isDown(KEY.FIRE) && ship.fireCooldown <= 0;
  if (wantsFire) {
    ship.fireCooldown = cooldownTicks;
  }

  return wantsFire;
}

/**
 * Build the ship's Path2D for rendering (centred at origin).
 * @returns {Path2D}
 */
export function shipPath() {
  const path = new Path2D();
  // Triangle pointing UP (negative Y)
  path.moveTo(0, -14);       // nose
  path.lineTo(10, 12);       // bottom-right
  path.lineTo(0, 8);         // notch
  path.lineTo(-10, 12);      // bottom-left
  path.closePath();
  return path;
}
