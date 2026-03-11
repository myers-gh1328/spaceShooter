import test from 'node:test';
import { collides, wrapPosition } from '../../src/physics.js';
import { assert } from '../harness.js';

test('collides detects direct overlap', () => {
  assert.equal(collides({ x: 10, y: 10, radius: 5 }, { x: 14, y: 10, radius: 5 }, 100, 100), true);
});

test('collides detects overlap across wrapped boundary', () => {
  assert.equal(collides({ x: 2, y: 50, radius: 5 }, { x: 98, y: 50, radius: 5 }, 100, 100), true);
});

test('wrapPosition wraps coordinates into bounds', () => {
  const entity = { x: -1, y: 101 };
  wrapPosition(entity, 100, 100);
  assert.deepEqual(entity, { x: 99, y: 1 });
});
