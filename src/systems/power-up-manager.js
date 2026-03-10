// ============================================================
// NOVA DRIFT — Power-up Manager
// Tracks active power-up effects and their durations.
// ============================================================

import { POWERUP_DURATION } from '../constants.js';

/**
 * Manages the currently active power-up effects.
 */
export function createPowerUpManager() {
  // Active slots: offensive (one at a time) + defensive
  /** @type {{ type: string, remaining: number, total: number } | null} */
  let _offense = null;
  /** @type {{ type: string, remaining: number, total: number } | null} */
  let _defense = null;

  const DEFENSE_TYPES  = new Set(['shield']);
  const OFFENSE_TYPES  = new Set(['rapidFire', 'tripleShot', 'speedBoost']);

  function activate(type) {
    const slot = { type, remaining: POWERUP_DURATION, total: POWERUP_DURATION };
    if (DEFENSE_TYPES.has(type)) {
      _defense = slot;
    } else {
      _offense = slot;
    }
  }

  function tick() {
    if (_offense) {
      _offense.remaining--;
      if (_offense.remaining <= 0) _offense = null;
    }
    if (_defense) {
      _defense.remaining--;
      if (_defense.remaining <= 0) _defense = null;
    }
  }

  /**
   * Called when the ship takes a hit.
   * If shield is active it absorbs the hit (destroys itself) and returns true.
   * @returns {boolean}
   */
  function absorbHit() {
    if (_defense && _defense.type === 'shield') {
      _defense = null;
      return true;
    }
    return false;
  }

  /** Returns state array for `drawHUD`. */
  function getRenderState() {
    const result = [];
    if (_offense) result.push({ ..._offense });
    if (_defense) result.push({ ..._defense });
    return result;
  }

  function reset() {
    _offense = null;
    _defense = null;
  }

  function getThrustMultiplier() {
    return _offense?.type === 'speedBoost' ? 1.6 : 1;
  }

  function getFireCooldownMultiplier() {
    return _offense?.type === 'rapidFire' ? 0.4 : 1;
  }

  return {
    get offensiveType() { return _offense?.type ?? null; },
    get hasShield()     { return _defense?.type === 'shield'; },
    activate,
    tick,
    absorbHit,
    getRenderState,
    getThrustMultiplier,
    getFireCooldownMultiplier,
    reset,
  };
}
