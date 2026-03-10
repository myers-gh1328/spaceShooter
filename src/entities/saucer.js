// ============================================================
// NOVA DRIFT — Saucer Entity
// Phase 7 implementation — full logic here.
// ============================================================

import {
  SAUCER_SIZES, SAUCER_SPEED, CANVAS_W, CANVAS_H,
} from '../constants.js';
import { randFloat } from '../physics.js';

// ---- Factory / Pool interface ----

export function saucerFactory() {
  return {
    active:      false,
    x:           0,
    y:           0,
    vx:          0,
    vy:          0,
    radius:      SAUCER_SIZES.large.radius,
    points:      SAUCER_SIZES.large.points,
    size:        'large',
    fireCooldown: SAUCER_SIZES.large.fireCooldown,
    fireTimer:   0,
  };
}

/**
 * @param {object} s
 * @param {'large'|'small'} size
 * @param {number} canvasW
 * @param {number} canvasH
 */
export function saucerReset(s, size, canvasW, canvasH) {
  const def = SAUCER_SIZES[size] ?? SAUCER_SIZES.large;
  s.active       = true;
  s.size         = size;
  s.radius       = def.radius;
  s.points       = def.points;
  s.fireCooldown = def.fireCooldown;
  s.fireTimer    = def.fireCooldown;

  // Spawn on a random edge
  const side = Math.floor(Math.random() * 4);
  if (side === 0) { s.x = 0;        s.y = randFloat(0, canvasH); }
  else if (side === 1) { s.x = canvasW; s.y = randFloat(0, canvasH); }
  else if (side === 2) { s.x = randFloat(0, canvasW); s.y = 0; }
  else                 { s.x = randFloat(0, canvasW); s.y = canvasH; }

  // Move toward centre
  const angle = Math.atan2(canvasH / 2 - s.y, canvasW / 2 - s.x)
                + randFloat(-0.5, 0.5);
  s.vx = Math.cos(angle) * SAUCER_SPEED;
  s.vy = Math.sin(angle) * SAUCER_SPEED;
}

/**
 * Update saucer for one tick. Returns a fire descriptor or null.
 * @param {object}  s
 * @param {{x:number,y:number}} target  player ship position
 * @returns {{ vx: number, vy: number } | null}
 */
export function updateSaucer(s, target, _dt) {
  if (!s.active) return null;

  s.x += s.vx;
  s.y += s.vy;

  // Despawn when fully off-canvas (with margin)
  const margin = s.radius * 2;
  if (
    s.x < -margin || s.x > CANVAS_W + margin ||
    s.y < -margin || s.y > CANVAS_H + margin
  ) {
    s.active = false;
    return null;
  }

  // Firing
  s.fireTimer--;
  if (s.fireTimer <= 0) {
    s.fireTimer = s.fireCooldown;
    // Aim toward player with some inaccuracy (small: less, large: more)
    const spread = s.size === 'small' ? 0.1 : 0.5;
    const aimAngle = Math.atan2(target.y - s.y, target.x - s.x)
                   + randFloat(-spread, spread);
    return {
      vx: Math.cos(aimAngle) * 4,
      vy: Math.sin(aimAngle) * 4,
    };
  }

  return null;
}

/**
 * Returns a world-space Path2D for the saucer (classic UFO silhouette).
 * @param {object} s
 * @returns {Path2D}
 */
export function saucerPath(s) {
  const path = new Path2D();
  const r    = s.radius;

  // Saucer: an ellipse body + dome on top
  // Body ellipse
  path.ellipse(s.x, s.y, r, r * 0.35, 0, 0, Math.PI * 2);

  // Dome above
  path.ellipse(s.x, s.y - r * 0.2, r * 0.5, r * 0.4, 0, Math.PI, 0);

  return path;
}
