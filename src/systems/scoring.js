// ============================================================
// NOVA DRIFT — Scoring System
// ============================================================

import {
  COMBO_WINDOW, COMBO_MAX, EXTRA_LIFE_THRESHOLD, SHIP_MAX_LIVES,
} from '../constants.js';

/**
 * @param {number} initialHighScore
 */
export function createScoring(initialHighScore) {
  let _score     = 0;
  let _highScore = initialHighScore;
  let _combo     = 1;
  let _comboTimer = 0;
  let _extraLifeThreshold = EXTRA_LIFE_THRESHOLD;

  function addKill(basePoints) {
    const points = basePoints * _combo;
    _score      += points;
    _highScore   = Math.max(_highScore, _score);

    // Reset / extend combo window
    _combo      = Math.min(_combo + 1, COMBO_MAX);
    _comboTimer = COMBO_WINDOW;

    return points;
  }

  function tick() {
    if (_comboTimer > 0) {
      _comboTimer--;
      if (_comboTimer === 0) _combo = 1;
    }
  }

  /** Awards an extra life when score crosses the threshold. */
  function checkExtraLife(ship) {
    if (_score >= _extraLifeThreshold && ship.active) {
      ship.lives = Math.min(ship.lives + 1, SHIP_MAX_LIVES);
      _extraLifeThreshold += EXTRA_LIFE_THRESHOLD;
    }
  }

  function reset() {
    _score      = 0;
    _combo      = 1;
    _comboTimer = 0;
    _extraLifeThreshold = EXTRA_LIFE_THRESHOLD;
  }

  return {
    get score()     { return _score; },
    get highScore() { return _highScore; },
    get combo()     { return _combo; },
    addKill,
    tick,
    checkExtraLife,
    reset,
  };
}
