// ============================================================
// NOVA DRIFT — Particle Entity
// Short-lived visual effect. No gameplay logic.
// ============================================================

import {
  PARTICLE_LIFETIME_MIN,
  PARTICLE_LIFETIME_MAX,
  COLORS,
} from '../constants.js';

/**
 * Create a blank Particle (used by pool factory).
 * @returns {object}
 */
function makeParticle() {
  return {
    x: 0, y: 0,
    prevX: 0, prevY: 0,
    vx: 0, vy: 0,
    radius: 2,
    color: COLORS.ship,
    opacity: 1,
    lifetime: 0,
    initialLifetime: 0,
    active: false,
  };
}

/**
 * Reset a pooled Particle for reuse.
 * @param {object} p
 * @param {number} x
 * @param {number} y
 * @param {number} vx
 * @param {number} vy
 * @param {string} color
 * @param {number} [lifetime]
 */
function resetParticle(p, x, y, vx, vy, color, lifetime) {
  const lt = lifetime ?? (
    PARTICLE_LIFETIME_MIN +
    Math.floor(Math.random() * (PARTICLE_LIFETIME_MAX - PARTICLE_LIFETIME_MIN + 1))
  );
  p.x = x;      p.prevX = x;
  p.y = y;      p.prevY = y;
  p.vx = vx;
  p.vy = vy;
  p.radius = 1 + Math.random() * 2; // 1–3 px
  p.color = color;
  p.opacity = 1;
  p.lifetime = lt;
  p.initialLifetime = lt;
  p.active = true;
}

/**
 * Factory for the pool — creates a blank instance.
 */
export function particleFactory() {
  return makeParticle();
}

/**
 * Reset function for the pool — re-initialises for reuse.
 */
export function particleReset(p, x, y, vx, vy, color, lifetime) {
  resetParticle(p, x, y, vx, vy, color, lifetime);
}

/**
 * Advance one tick.
 * @param {object} particle
 * @param {number} _dt  — fixed delta (unused; particle uses tick count)
 */
export function updateParticle(particle, _dt) {
  particle.prevX = particle.x;
  particle.prevY = particle.y;

  particle.x += particle.vx;
  particle.y += particle.vy;

  // Slight velocity decay
  particle.vx *= 0.97;
  particle.vy *= 0.97;

  particle.lifetime--;
  particle.opacity = particle.lifetime / particle.initialLifetime;

  if (particle.lifetime <= 0) {
    particle.active = false;
  }
}
