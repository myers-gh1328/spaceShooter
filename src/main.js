// ============================================================
// NOVA DRIFT — Entry Point
// ============================================================

import { createGame }          from './game.js';
import { CANVAS_W, CANVAS_H }  from './constants.js';

const canvas  = document.querySelector('#game');
const wrapper = document.querySelector('#game-wrapper') ?? document.body;
const game    = createGame(canvas);

game.start();

// --- Prevent page-scroll for game keys ---
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }
}, { passive: false });

// --- Proportional CSS-scale so the canvas fills the window
//     without changing the logical 1024×768 resolution. ---
function resizeCanvas() {
  const scaleX = window.innerWidth  / CANVAS_W;
  const scaleY = window.innerHeight / CANVAS_H;
  const scale  = Math.min(scaleX, scaleY);
  canvas.style.transform = `scale(${scale})`;
  canvas.style.transformOrigin = 'top left';
  // Centre the scaled canvas in the viewport
  const offsetX = Math.max(0, (window.innerWidth  - CANVAS_W * scale) / 2);
  const offsetY = Math.max(0, (window.innerHeight - CANVAS_H * scale) / 2);
  canvas.style.marginLeft = `${offsetX}px`;
  canvas.style.marginTop  = `${offsetY}px`;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // initial call

// --- Clean up on tab close / navigate away ---
window.addEventListener('beforeunload', () => game.destroy());
