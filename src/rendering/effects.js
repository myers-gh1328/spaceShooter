// ============================================================
// NOVA DRIFT — Visual Effects
// Particle explosions and thrust flame drawing.
// ============================================================

import { lerp } from '../physics.js';

/**
 * Draw all active particles with interpolated positions.
 *
 * @param {object} renderer  — from createRenderer()
 * @param {object[]} particles
 * @param {number} alpha     — interpolation alpha [0,1)
 */
export function drawParticles(renderer, particles, alpha) {
  const ctx = renderer.ctx;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (const p of particles) {
    if (!p.active) continue;

    const x = lerp(p.prevX, p.x, alpha);
    const y = lerp(p.prevY, p.y, alpha);

    ctx.globalAlpha = Math.max(0, p.opacity);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x, y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw the thrust flame behind the ship when thrusting.
 *
 * @param {object} renderer
 * @param {object} ship
 * @param {number} alpha   — interpolation alpha
 */
export function drawThrustFlame(renderer, ship, alpha) {
  if (!ship.active || !ship.thrusting) return;

  const ctx = renderer.ctx;
  const x = lerp(ship.prevX, ship.x, alpha);
  const y = lerp(ship.prevY, ship.y, alpha);
  const rot = lerp(ship.prevRotation, ship.rotation, alpha);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalCompositeOperation = 'lighter';

  // Flame flicker: randomise length each frame
  const flameLen = 14 + Math.random() * 10;
  const flameWidth = 5;

  const flame = new Path2D();
  flame.moveTo(-flameWidth / 2, 12); // rear of ship hull
  flame.lineTo(0, 12 + flameLen);    // flame tip
  flame.lineTo( flameWidth / 2, 12);

  // Outer glow — orange
  ctx.strokeStyle = '#ff6600';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 15;
  ctx.globalAlpha = 0.6;
  ctx.stroke(flame);

  // Core — yellow-white
  ctx.strokeStyle = '#ffffaa';
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 6;
  ctx.globalAlpha = 1.0;
  ctx.stroke(flame);

  ctx.restore();
}
