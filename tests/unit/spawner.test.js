import test from 'node:test';
import { createSpawner } from '../../src/systems/spawner.js';
import { assert, withMockedRandom } from '../harness.js';

test('maybePowerUp does not spawn for large asteroids', () => {
  const spawner = createSpawner(100, 100);
  const pool = { acquire() { return { spawned: true }; } };
  assert.equal(spawner.maybePowerUp({ size: 'large', x: 10, y: 20 }, pool), null);
});

test('maybePowerUp can spawn for small asteroids', () => {
  const spawner = createSpawner(100, 100);
  const pool = { acquire(x, y) { return { x, y, spawned: true }; } };
  const powerUp = withMockedRandom([0], () => spawner.maybePowerUp({ size: 'small', x: 10, y: 20 }, pool));
  assert.deepEqual(powerUp, { x: 10, y: 20, spawned: true });
});

test('maybeSaucer eventually spawns at level 3+', () => {
  const spawner = createSpawner(100, 100);
  const pool = { acquire(size, w, h) { return { size, w, h }; } };
  const saucer = withMockedRandom([0, 0, 0, 0], () => {
    let result = null;
    for (let i = 0; i < 1300 && !result; i += 1) {
      result = spawner.maybeSaucer(3, pool);
    }
    return result;
  });
  assert.equal(Boolean(saucer), true);
});
