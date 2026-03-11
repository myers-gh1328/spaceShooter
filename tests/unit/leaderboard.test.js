import test from 'node:test';
import { createLeaderboard } from '../../src/systems/leaderboard.js';
import { assert, createMockLocalStorage, withGlobal } from '../harness.js';

test('leaderboard saves and returns high score', () => {
  withGlobal('localStorage', createMockLocalStorage(), () => {
    const leaderboard = createLeaderboard();
    leaderboard.addScore(1000, 3);
    leaderboard.addScore(500, 2);
    assert.equal(leaderboard.getHighScore(), 1000);
    assert.equal(leaderboard.getEntries().length, 2);
  });
});
