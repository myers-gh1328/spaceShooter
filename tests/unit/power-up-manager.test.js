import test from 'node:test';
import { createPowerUpManager } from '../../src/systems/power-up-manager.js';
import { assert } from '../harness.js';

test('rapidFire affects cooldown multiplier', () => {
  const manager = createPowerUpManager();
  manager.activate('rapidFire');
  assert.equal(manager.getFireCooldownMultiplier(), 0.4);
});

test('speedBoost affects thrust multiplier', () => {
  const manager = createPowerUpManager();
  manager.activate('speedBoost');
  assert.equal(manager.getThrustMultiplier(), 1.6);
});

test('shield absorbs a hit once', () => {
  const manager = createPowerUpManager();
  manager.activate('shield');
  assert.equal(manager.absorbHit(), true);
  assert.equal(manager.absorbHit(), false);
});
