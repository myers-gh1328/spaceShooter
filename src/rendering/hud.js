// ============================================================
// NOVA DRIFT — HUD Drawing
// All HUD elements are rendered on Canvas (no HTML overlays).
// ============================================================

import { COLORS, CANVAS_W, CANVAS_H } from '../constants.js';

/**
 * Draw the full in-game HUD overlay.
 *
 * @param {object} renderer  — from createRenderer()
 * @param {object} gs        — game state object with:
 *   level, score, highScore, combo, lives,
 *   powerUpState: { type, remaining, total }[]
 */
export function drawHUD(renderer, gs) {
  const ctx = renderer.ctx;
  ctx.save();

  _drawScore(ctx, gs);
  _drawLevel(ctx, gs.level);
  _drawLives(ctx, gs.lives);
  if (gs.combo > 1) _drawCombo(ctx, gs.combo);
  if (gs.powerUpState && gs.powerUpState.length > 0) {
    _drawPowerUpBar(ctx, gs.powerUpState);
  }

  ctx.restore();
}

// --- Score (top-left) ---
function _drawScore(ctx, gs) {
  ctx.font = "bold 22px 'Orbitron', monospace";
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = COLORS.hudText;
  ctx.shadowColor = COLORS.hudAccent;
  ctx.shadowBlur = 8;
  ctx.fillText(String(gs.score).padStart(8, '0'), 20, 16);

  // High score centred
  ctx.textAlign = 'center';
  ctx.font = "bold 14px 'Orbitron', monospace";
  ctx.fillStyle = '#aaaaaa';
  ctx.shadowBlur = 4;
  ctx.fillText(`HI  ${String(gs.highScore).padStart(8, '0')}`, CANVAS_W / 2, 16);
}

// --- Level (top-right) ---
function _drawLevel(ctx, level) {
  ctx.font = "bold 18px 'Orbitron', monospace";
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillStyle = COLORS.hudAccent;
  ctx.shadowColor = COLORS.hudAccent;
  ctx.shadowBlur = 8;
  ctx.fillText(`LVL ${level}`, CANVAS_W - 20, 16);
}

// --- Lives as ship icons (bottom-left) ---
function _drawLives(ctx, lives) {
  ctx.save();
  const startX = 20;
  const y = CANVAS_H - 40;
  const spacing = 28;

  ctx.strokeStyle = COLORS.ship;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = COLORS.ship;
  ctx.shadowBlur = 8;
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < lives; i++) {
    const cx = startX + i * spacing;
    ctx.save();
    ctx.translate(cx, y);
    ctx.scale(0.6, 0.6);
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(10, 12);
    ctx.lineTo(0, 8);
    ctx.lineTo(-10, 12);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// --- Combo multiplier (below score) ---
function _drawCombo(ctx, combo) {
  ctx.font = "bold 16px 'Orbitron', monospace";
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffcc00';
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 10;
  ctx.fillText(`×${combo} COMBO`, 20, 46);
}

// --- Power-up bar (bottom-right) ---
function _drawPowerUpBar(ctx, powerUpState) {
  const barW = 120;
  const barH = 10;
  const margin = 20;
  let y = CANVAS_H - 40;

  for (const pu of powerUpState) {
    const x = CANVAS_W - margin - barW;
    const fraction = pu.total > 0 ? pu.remaining / pu.total : 0;
    const color = _puColor(pu.type);

    // Label
    ctx.font = "bold 11px 'Orbitron', monospace";
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillText(_puLabel(pu.type), x - 6, y + barH / 2);

    // Background
    ctx.fillStyle = '#222233';
    ctx.shadowBlur = 0;
    ctx.fillRect(x, y, barW, barH);

    // Fill
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillRect(x, y, barW * fraction, barH);

    y -= 20;
  }
}

function _puColor(type) {
  return COLORS.powerUp[type] ?? '#ffffff';
}

function _puLabel(type) {
  const labels = {
    rapidFire:  'RAPID',
    shield:     'SHIELD',
    tripleShot: 'TRIPLE',
    speedBoost: 'SPEED',
  };
  return labels[type] ?? type.toUpperCase();
}
