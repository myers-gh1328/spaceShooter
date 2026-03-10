// ============================================================
// NOVA DRIFT — Screen Overlays (Title / Pause / Game Over)
// ============================================================

import { CANVAS_W, CANVAS_H, COLORS } from '../constants.js';

// ---- Title Screen ----

/**
 * @param {import('./renderer.js').Renderer} renderer
 * @param {import('../systems/leaderboard.js').Leaderboard} leaderboard
 */
export function drawTitleScreen(renderer, leaderboard) {
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;

  _dimBackground(renderer, 0.85);

  // Title
  renderer.drawGlowText('NOVA DRIFT', cx, cy - 120, COLORS.ship, 72);

  // Sub-title
  renderer.drawGlowText('DEFEND THE VOID', cx, cy - 60, COLORS.hudAccent, 22);

  // Controls
  renderer.drawGlowText('SPACE / ENTER — START', cx, cy + 20, '#ffffff', 18);
  renderer.drawGlowText('← → ROTATE   ↑ THRUST   SPACE FIRE', cx, cy + 55, '#aaaaaa', 15);
  renderer.drawGlowText('ESC / P — PAUSE   Q — QUIT', cx, cy + 85, '#aaaaaa', 15);

  // High score
  const hi = leaderboard.getHighScore();
  if (hi > 0) {
    renderer.drawGlowText(`BEST  ${hi.toLocaleString()}`, cx, cy + 140, COLORS.hudAccent, 18);
  }

  // Leaderboard top-5
  const entries = leaderboard.getEntries().slice(0, 5);
  if (entries.length > 0) {
    renderer.drawGlowText('TOP SCORES', cx, cy + 195, COLORS.asteroidFill ?? '#44ffaa', 16);
    entries.forEach((e, i) => {
      renderer.drawGlowText(
        `${i + 1}.  ${e.score.toLocaleString()}   LV ${e.level}`,
        cx, cy + 220 + i * 26, '#ffffff', 14,
      );
    });
  }
}

// ---- Pause Overlay ----

/**
 * @param {import('./renderer.js').Renderer} renderer
 */
export function drawPauseOverlay(renderer) {
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;

  _dimBackground(renderer, 0.55);

  renderer.drawGlowText('PAUSED', cx, cy - 30, COLORS.ship, 56);
  renderer.drawGlowText('P / ESC — RESUME   Q — QUIT', cx, cy + 30, '#aaaaaa', 16);
}

// ---- Game Over ----

/**
 * @param {import('./renderer.js').Renderer} renderer
 * @param {number} finalScore
 * @param {boolean} isNewHighScore
 */
export function drawGameOverScreen(renderer, finalScore, isNewHighScore) {
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;

  _dimBackground(renderer, 0.6);

  renderer.drawGlowText('GAME OVER', cx, cy - 90, '#ff4444', 64);

  renderer.drawGlowText(
    `SCORE  ${finalScore.toLocaleString()}`,
    cx, cy - 10,
    isNewHighScore ? COLORS.hudAccent : '#ffffff',
    30,
  );

  if (isNewHighScore) {
    renderer.drawGlowText('NEW HIGH SCORE!', cx, cy + 34, COLORS.hudAccent, 24);
  }

  renderer.drawGlowText('SPACE / ENTER — PLAY AGAIN', cx, cy + 90,  '#ffffff', 18);
  renderer.drawGlowText('P / ESC — TITLE SCREEN',     cx, cy + 122, '#aaaaaa', 14);
}

// ---- Helpers ----

function _dimBackground(renderer, opacity) {
  const ctx = renderer.ctx;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle   = '#000000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();
}
