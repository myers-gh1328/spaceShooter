// ============================================================
// NOVA DRIFT — Fixed-Timestep Game Loop
// Based on "Fix Your Timestep!" (Glenn Fiedler).
// Update runs at TICK_RATE Hz; render uses rAF with interpolation.
// ============================================================

import { TICK_MS, MAX_FRAME_TIME } from './constants.js';

/**
 * @param {{ update(dt: number): void, render(alpha: number): void }} callbacks
 * @returns {{ start(): void, stop(): void, pause(): void, resume(): void }}
 */
export function createLoop(callbacks) {
  let rafId = null;
  let lastTime = 0;
  let accumulator = 0;
  let running = false;
  let paused = false;

  function tick(timestamp) {
    if (!running) return;

    if (paused) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    if (lastTime === 0) lastTime = timestamp;

    let frameTime = timestamp - lastTime;
    lastTime = timestamp;

    // Clamp to prevent spiral-of-death after tab switch / GC stall
    if (frameTime > MAX_FRAME_TIME) frameTime = MAX_FRAME_TIME;

    accumulator += frameTime;

    // Fixed-timestep updates
    while (accumulator >= TICK_MS) {
      callbacks.update(TICK_MS);
      accumulator -= TICK_MS;
    }

    // Render with interpolation alpha in [0, 1)
    const alpha = accumulator / TICK_MS;
    callbacks.render(alpha);

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    paused = false;
    lastTime = 0;
    accumulator = 0;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function pause() {
    paused = true;
  }

  function resume() {
    if (!paused) return;
    paused = false;
    // Reset lastTime so the next frame doesn't produce a huge delta
    lastTime = 0;
    accumulator = 0;
  }

  return { start, stop, pause, resume };
}
