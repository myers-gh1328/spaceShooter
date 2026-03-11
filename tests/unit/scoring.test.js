import test from 'node:test';
import { createScoring } from '../../src/systems/scoring.js';
import { assert } from '../harness.js';

test('scoring adds kills and increments combo', () => {
  const scoring = createScoring(0);
  assert.equal(scoring.addKill(20), 20);
  assert.equal(scoring.score, 20);
  assert.equal(scoring.combo, 2);
});

test('combo resets after window expires', () => {
  const scoring = createScoring(0);
  scoring.addKill(20);
  for (let i = 0; i < 120; i += 1) scoring.tick();
  assert.equal(scoring.combo, 1);
});

test('extra life is awarded at threshold', () => {
  const scoring = createScoring(0);
  const ship = { lives: 3, active: true };
  for (let i = 0; i < 500; i += 1) scoring.addKill(20);
  scoring.checkExtraLife(ship);
  assert.equal(ship.lives > 3, true);
});
