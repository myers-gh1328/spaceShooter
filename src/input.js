// ============================================================
// NOVA DRIFT — Keyboard Input
// Polls key state each tick; supports edge detection.
// ============================================================

/**
 * @returns {{
 *   init(): void,
 *   destroy(): void,
 *   isDown(key: string): boolean,
 *   wasPressed(key: string): boolean,
 *   update(): void,
 * }}
 */
export function createInput() {
  /** Keys that are currently held down */
  const held = new Set();
  /** Keys pressed this tick (transitioned from up → down) */
  const pressed = new Set();
  /** Keys that were down last tick (for edge detection) */
  const prevHeld = new Set();

  function onKeyDown(e) {
    if (!held.has(e.key)) {
      pressed.add(e.key);
    }
    held.add(e.key);
    // Prevent spacebar from scrolling the page
    if (e.key === ' ') e.preventDefault();
  }

  function onKeyUp(e) {
    held.delete(e.key);
  }

  function init() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }

  function destroy() {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    held.clear();
    pressed.clear();
    prevHeld.clear();
  }

  /**
   * Call once per tick to advance edge-detection state.
   * Must be called at the END of each update tick, after all
   * `wasPressed` checks have been made.
   */
  function update() {
    pressed.clear();
  }

  /** True while any given key is held. */
  function isDown(key) {
    return held.has(key);
  }

  /**
   * True only on the first tick a key transitions from up to down.
   * Resets on `update()`.
   */
  function wasPressed(key) {
    return pressed.has(key);
  }

  return { init, destroy, isDown, wasPressed, update };
}
