// ============================================================
// NOVA DRIFT — Power-up Entity
// ============================================================

import {
  POWERUP_TYPES, POWERUP_RADIUS, POWERUP_DESPAWN,
} from '../constants.js';
import { randFloat as _randFloat } from '../physics.js';

/**
 * Blank instance for the pool factory.
 * @returns {object}
 */
export function powerUpFactory() {
  return {
    active:  false,
    x:       0,
    y:       0,
    vx:      0,
    vy:      0,
    radius:  POWERUP_RADIUS,
    type:    POWERUP_TYPES[0],
    timer:   0,   // despawn countdown
    // slow gentle drift
    angle:   0,
    spin:    0,
  };
}

/**
 * Pool reset — called by pool.acquire(x, y).
 * Picks a random power-up type.
 * @param {object} pu
 * @param {number} x
 * @param {number} y
 */
export function powerUpReset(pu, x, y) {
  pu.active  = true;
  pu.x       = x;
  pu.y       = y;
  pu.vx      = _randFloat(-0.4, 0.4);
  pu.vy      = _randFloat(-0.4, 0.4);
  pu.radius  = POWERUP_RADIUS;
  pu.type    = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  pu.timer   = POWERUP_DESPAWN;
  pu.angle   = 0;
  pu.spin    = _randFloat(-0.03, 0.03);

  // Attach a simple update method
  pu.update = function () {
    pu.x     += pu.vx;
    pu.y     += pu.vy;
    pu.angle += pu.spin;
    pu.timer--;
    if (pu.timer <= 0) pu.active = false;
  };
}
