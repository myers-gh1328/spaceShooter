// ============================================================
// NOVA DRIFT — Asteroid Entity
// ============================================================

import {
  ASTEROID_SIZES,
  ASTEROID_VERTICES_MIN,
  ASTEROID_VERTICES_MAX,
} from '../constants.js';
import { randFloat } from '../physics.js';

/**
 * Create a new Asteroid.
 * @param {number} x
 * @param {number} y
 * @param {'large'|'medium'|'small'} size
 * @returns {object}
 */
export function createAsteroid(x, y, size) {
  const cfg = ASTEROID_SIZES[size];
  const angle = Math.random() * Math.PI * 2;
  const speed = randFloat(cfg.speed[0], cfg.speed[1]);

  return {
    x, y,
    prevX: x, prevY: y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: randFloat(-0.04, 0.04),
    radius: cfg.radius,
    size,
    points: cfg.points,
    vertices: generateVertices(cfg.radius),
    active: true,
  };
}

/**
 * Pooled asteroid factory.
 * @returns {object}
 */
export function asteroidFactory() {
  return {
    x: 0, y: 0, prevX: 0, prevY: 0,
    vx: 0, vy: 0,
    rotation: 0, rotationSpeed: 0,
    radius: 40, size: 'large', points: 20,
    vertices: [],
    active: false,
  };
}

/**
 * Pooled asteroid reset.
 */
export function asteroidReset(a, x, y, size) {
  const cfg = ASTEROID_SIZES[size];
  const angle = Math.random() * Math.PI * 2;
  const speed = randFloat(cfg.speed[0], cfg.speed[1]);
  a.x = x;         a.prevX = x;
  a.y = y;         a.prevY = y;
  a.vx = Math.cos(angle) * speed;
  a.vy = Math.sin(angle) * speed;
  a.rotation = Math.random() * Math.PI * 2;
  a.rotationSpeed = randFloat(-0.04, 0.04);
  a.radius = cfg.radius;
  a.size = size;
  a.points = cfg.points;
  a.vertices = generateVertices(cfg.radius);
  a.active = true;
}

/**
 * Update asteroid position and rotation for one tick.
 * @param {object} asteroid
 */
export function updateAsteroid(asteroid) {
  asteroid.prevX = asteroid.x;
  asteroid.prevY = asteroid.y;
  asteroid.x += asteroid.vx;
  asteroid.y += asteroid.vy;
  asteroid.rotation += asteroid.rotationSpeed;
}

/**
 * Spawn child asteroids when this one is destroyed.
 * Returns an empty array for 'small' (no children).
 *
 * @param {object} asteroid
 * @returns {{ x: number, y: number, size: string }[]}
 */
export function splitAsteroid(asteroid) {
  if (asteroid.size === 'large') {
    return [
      { x: asteroid.x, y: asteroid.y, size: 'medium' },
      { x: asteroid.x, y: asteroid.y, size: 'medium' },
    ];
  }
  if (asteroid.size === 'medium') {
    return [
      { x: asteroid.x, y: asteroid.y, size: 'small' },
      { x: asteroid.x, y: asteroid.y, size: 'small' },
    ];
  }
  return []; // small — no children
}

/**
 * Generate an irregular polygon as flat [x,y,...] array relative to origin.
 * @param {number} radius
 * @returns {number[]}
 */
function generateVertices(radius) {
  const count = ASTEROID_VERTICES_MIN +
    Math.floor(Math.random() * (ASTEROID_VERTICES_MAX - ASTEROID_VERTICES_MIN + 1));
  const verts = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = radius * (0.75 + Math.random() * 0.5); // 75–125% of base radius
    verts.push(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  return verts;
}

/**
 * Build a Path2D for the asteroid at its current position/rotation (in world space).
 * @param {object} asteroid
 * @returns {Path2D}
 */
export function asteroidPath(asteroid) {
  const path = new Path2D();
  const v = asteroid.vertices;
  const cos = Math.cos(asteroid.rotation);
  const sin = Math.sin(asteroid.rotation);

  for (let i = 0; i < v.length; i += 2) {
    const rx = v[i] * cos - v[i + 1] * sin;
    const ry = v[i] * sin + v[i + 1] * cos;
    if (i === 0) path.moveTo(asteroid.x + rx, asteroid.y + ry);
    else         path.lineTo(asteroid.x + rx, asteroid.y + ry);
  }
  path.closePath();
  return path;
}
