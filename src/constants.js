// ============================================================
// NOVA DRIFT — Constants
// Single source of truth for all tuning values.
// ============================================================

// --- Canvas ---
export const CANVAS_W = 1024;
export const CANVAS_H = 768;

// --- Physics / Loop ---
export const TICK_RATE = 60;
export const TICK_MS = 1000 / TICK_RATE;
export const MAX_FRAME_TIME = 250; // clamp to prevent spiral-of-death (ms)

// --- Ship ---
export const SHIP_ROTATION_SPEED = 0.07;   // radians per tick
export const SHIP_THRUST = 0.12;           // px per tick²
export const SHIP_MAX_SPEED = 6;           // px per tick
export const SHIP_DRAG = 0.99;             // velocity multiplier per tick
export const SHIP_RADIUS = 12;             // collision radius (px)
export const SHIP_FIRE_COOLDOWN = 10;      // ticks (~167 ms)
export const SHIP_INVULNERABLE_TICKS = 120; // ~2 seconds after losing a life
export const SHIP_START_LIVES = 3;
export const SHIP_MAX_LIVES   = 5;

// --- Projectile ---
export const BULLET_SPEED = 8;             // px per tick
export const BULLET_RADIUS = 3;
export const BULLET_LIFETIME = 90;         // ticks (~1.5 s)

// --- Asteroids ---
export const ASTEROID_SIZES = {
  large:  { radius: 40, points: 20,  speed: [0.5, 1.5] },
  medium: { radius: 20, points: 50,  speed: [1.0, 2.5] },
  small:  { radius: 10, points: 100, speed: [1.5, 3.0] },
};
export const ASTEROID_START_COUNT = 4;     // large asteroids on level 1
export const ASTEROID_VERTICES_MIN = 8;
export const ASTEROID_VERTICES_MAX = 12;

// --- Saucer ---
export const SAUCER_SIZES = {
  large: { radius: 20, points: 200,  fireCooldown: 90 },
  small: { radius: 12, points: 1000, fireCooldown: 45 },
};
export const SAUCER_SPEED = 2;             // px per tick
export const SAUCER_MIN_LEVEL = 3;
export const SAUCER_SPAWN_INTERVAL = [600, 1200]; // ticks range

// --- Power-ups ---
export const POWERUP_TYPES = ['rapidFire', 'shield', 'tripleShot', 'speedBoost'];
export const POWERUP_SPAWN_CHANCE = 0.15;  // 15%
export const POWERUP_DURATION = 480;       // ticks (~8 s) when collected
export const POWERUP_DESPAWN = 360;        // ticks (~6 s) if uncollected
export const POWERUP_RADIUS = 10;

// --- Scoring ---
export const COMBO_WINDOW = 120;           // ticks (~2 s) to maintain combo
export const COMBO_MAX = 8;
export const EXTRA_LIFE_THRESHOLD = 10000; // points per extra life

// --- Particles ---
export const PARTICLE_COUNT_EXPLOSION = 12;
export const PARTICLE_LIFETIME_MIN = 20;   // ticks
export const PARTICLE_LIFETIME_MAX = 50;   // ticks
export const PARTICLE_SPEED_MIN = 0.5;
export const PARTICLE_SPEED_MAX = 3.0;

// --- Colours ---
export const COLORS = {
  bg:           '#0a0a1a',
  ship:         '#00ffff',
  asteroid:     '#4d8bff',
  bulletPlayer: '#ff2975',
  bulletEnemy:  '#ff6600',
  powerUp: {
    rapidFire:  '#ff9900',
    shield:     '#00ccff',
    tripleShot: '#cc00ff',
    speedBoost: '#39ff14',
  },
  saucer:       '#ffff00',
  hudText:      '#ffffff',
  hudAccent:    '#00ffff',
  star:         '#ffffff',
};

// --- Pool pre-allocation sizes ---
export const POOL_ASTEROIDS = 30;
export const POOL_PROJECTILES = 15;
export const POOL_PARTICLES = 80;
export const POOL_POWERUPS = 5;
export const POOL_SAUCERS = 2;

// --- Input keys ---
export const KEY = {
  LEFT:   'ArrowLeft',
  RIGHT:  'ArrowRight',
  UP:     'ArrowUp',
  FIRE:   ' ',            // Space
  PAUSE:  'Escape',
  START:  'Enter',
  QUIT:   'q',
};
