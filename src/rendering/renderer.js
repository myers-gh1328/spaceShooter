// ============================================================
// NOVA DRIFT — Canvas Renderer
// Wraps Canvas 2D context; provides neon-glow drawing helpers.
// ============================================================

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {{
 *   clear(): void,
 *   drawGlow(path: Path2D, color: string, lineWidth?: number): void,
 *   drawGlowText(text: string, x: number, y: number, color: string, size: number): void,
 *   save(): void,
 *   restore(): void,
 *   translate(x: number, y: number): void,
 *   rotate(angle: number): void,
 *   readonly ctx: CanvasRenderingContext2D,
 *   readonly width: number,
 *   readonly height: number,
 * }}
 */
export function createRenderer(canvas) {
  // alpha:false lets the browser skip blending with the page background
  const ctx = canvas.getContext('2d', { alpha: false });
  const { width, height } = canvas;

  function clear() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw a Path2D with a multi-pass neon glow effect.
   * @param {Path2D} path
   * @param {string} color
   * @param {number} [lineWidth=2]
   */
  function drawGlow(path, color, lineWidth = 2) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer glow — wide, dim
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.globalAlpha = 0.4;
    ctx.stroke(path);

    // Mid glow
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 0.7;
    ctx.stroke(path);

    // Core — solid, bright
    ctx.shadowBlur = 4;
    ctx.globalAlpha = 1.0;
    ctx.stroke(path);

    ctx.restore();
  }

  /**
   * Draw text with a neon glow effect.
   * @param {string} text
   * @param {number} x      — centre x
   * @param {number} y      — centre y
   * @param {string} color
   * @param {number} size   — font size in px
   * @param {string} [align='center']
   */
  function drawGlowText(text, x, y, color, size, align = 'center') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.font = `bold ${size}px 'Orbitron', monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;

    // Outer glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.globalAlpha = 0.3;
    ctx.fillText(text, x, y);

    // Mid glow
    ctx.shadowBlur = 15;
    ctx.globalAlpha = 0.6;
    ctx.fillText(text, x, y);

    // Core
    ctx.shadowBlur = 5;
    ctx.globalAlpha = 1.0;
    ctx.fillText(text, x, y);

    ctx.restore();
  }

  function save()                { ctx.save(); }
  function restore()             { ctx.restore(); }
  function translate(x, y)      { ctx.translate(x, y); }
  function rotate(angle)         { ctx.rotate(angle); }

  return {
    clear,
    drawGlow,
    drawGlowText,
    save,
    restore,
    translate,
    rotate,
    get ctx()    { return ctx; },
    get width()  { return width; },
    get height() { return height; },
  };
}
