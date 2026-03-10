// ============================================================
// NOVA DRIFT — Physics Helpers
// Pure functions — no side effects except wrapPosition.
// ============================================================

/**
 * Circle–circle collision test with toroidal (wrap-around) correction.
 * Considers both the direct distance and the shortest path across edges.
 *
 * @param {{ x: number, y: number, radius: number }} a
 * @param {{ x: number, y: number, radius: number }} b
 * @param {number} canvasW
 * @param {number} canvasH
 * @returns {boolean}
 */
export function collides(a, b, canvasW, canvasH) {
  let dx = b.x - a.x;
  let dy = b.y - a.y;

  // Toroidal shortest-path correction
  if (Math.abs(dx) > canvasW / 2) dx -= Math.sign(dx) * canvasW;
  if (Math.abs(dy) > canvasH / 2) dy -= Math.sign(dy) * canvasH;

  const distSq = dx * dx + dy * dy;
  const radSum = a.radius + b.radius;
  return distSq < radSum * radSum;
}

/**
 * Wrap an entity's position to stay within [0, canvasW) × [0, canvasH).
 * Mutates entity.x and entity.y in place.
 *
 * @param {{ x: number, y: number }} entity
 * @param {number} canvasW
 * @param {number} canvasH
 */
export function wrapPosition(entity, canvasW, canvasH) {
  if (entity.x < 0)        entity.x += canvasW;
  if (entity.x >= canvasW) entity.x -= canvasW;
  if (entity.y < 0)        entity.y += canvasH;
  if (entity.y >= canvasH) entity.y -= canvasH;
}

/**
 * Linear interpolation.
 * @param {number} a
 * @param {number} b
 * @param {number} t  — [0, 1]
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Shortest-angle linear interpolation (handles 2π wraparound).
 * @param {number} a  — start angle (radians)
 * @param {number} b  — end angle (radians)
 * @param {number} t  — [0, 1]
 * @returns {number}
 */
export function lerpAngle(a, b, t) {
  let diff = b - a;
  // Normalise diff to [-π, π]
  while (diff >  Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return a + diff * t;
}

/**
 * Random float in [min, max).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randFloat(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Random integer in [min, max].
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}
