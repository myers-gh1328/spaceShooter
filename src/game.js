// ============================================================
// NOVA DRIFT — Game Orchestrator
// Owns the game loop, state machine, entity arrays and systems.
// ============================================================

import {
  CANVAS_W, CANVAS_H,
  POOL_ASTEROIDS, POOL_PROJECTILES, POOL_PARTICLES, POOL_POWERUPS, POOL_SAUCERS,
  COLORS, PARTICLE_SPEED_MIN, PARTICLE_SPEED_MAX, PARTICLE_COUNT_EXPLOSION,
  KEY,
} from './constants.js';

import { createLoop }    from './loop.js';
import { createInput }   from './input.js';
import { createPool }    from './pool.js';
import { collides, wrapPosition } from './physics.js';
import { createRenderer } from './rendering/renderer.js';
import { drawHUD }        from './rendering/hud.js';
import { drawParticles, drawThrustFlame } from './rendering/effects.js';
import { drawTitleScreen, drawPauseOverlay, drawGameOverScreen } from './rendering/screens.js';

import {
  createShip, updateShip, respawnShip, shipPath,
} from './entities/ship.js';
import {
  asteroidFactory, asteroidReset, updateAsteroid, splitAsteroid, asteroidPath,
} from './entities/asteroid.js';
import {
  projectileFactory, projectileReset, updateProjectile,
} from './entities/projectile.js';
import { particleFactory, particleReset, updateParticle } from './entities/particle.js';
import { powerUpFactory, powerUpReset }  from './entities/power-up.js';
import { saucerFactory, saucerReset, updateSaucer, saucerPath } from './entities/saucer.js';

import { createSpawner }        from './systems/spawner.js';
import { createScoring }        from './systems/scoring.js';
import { createPowerUpManager } from './systems/power-up-manager.js';
import { createLeaderboard }    from './systems/leaderboard.js';

const SCREEN = {
  TITLE:    'title',
  PLAYING:  'playing',
  PAUSED:   'paused',
  GAME_OVER: 'gameOver',
};

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {{ start(): void, destroy(): void }}
 */
export function createGame(canvas) {
  // Core infrastructure
  const renderer   = createRenderer(canvas);
  const input      = createInput();
  const leaderboard = createLeaderboard();
  const scoring    = createScoring(leaderboard.getHighScore());
  const powerUpMgr = createPowerUpManager();
  const spawner    = createSpawner(CANVAS_W, CANVAS_H);

  // Object pools
  const asteroidPool   = createPool(asteroidFactory, asteroidReset, POOL_ASTEROIDS);
  const bulletPool     = createPool(projectileFactory, projectileReset, POOL_PROJECTILES);
  const particlePool   = createPool(particleFactory, particleReset, POOL_PARTICLES);
  const powerUpPool    = createPool(powerUpFactory, powerUpReset, POOL_POWERUPS);
  const saucerPool     = createPool(saucerFactory, saucerReset, POOL_SAUCERS);

  // Entity arrays
  let ship = createShip(CANVAS_W / 2, CANVAS_H / 2);
  let asteroids = [];
  let bullets   = [];
  let particles = [];
  let powerUps  = [];
  let saucers   = [];

  // State
  let screen     = SCREEN.TITLE;
  let level      = 1;
  let newHighScore = false;
  let tick       = 0;

  // Game loop
  const loop = createLoop({ update, render });

  // ---- Lifecycle ----

  function start() {
    input.init();
    _setupVisibilityPause();
    loop.start();
  }

  function destroy() {
    loop.stop();
    input.destroy();
  }

  // ---- Game Start / Restart ----

  function _startGame() {
    level = 1;
    tick  = 0;
    newHighScore = false;
    ship  = createShip(CANVAS_W / 2, CANVAS_H / 2);
    asteroids = [];
    bullets   = [];
    particles = [];
    powerUps  = [];
    saucers   = [];
    scoring.reset();
    powerUpMgr.reset();
    spawner.resetSaucerTimer();

    // Spawn first level
    const newRocks = spawner.spawnLevelAsteroids(level, asteroidPool);
    asteroids.push(...newRocks);

    screen = SCREEN.PLAYING;
  }

  function _nextLevel() {
    level++;
    bullets   = [];
    powerUps  = [];
    saucers   = [];
    // Power-up effects persist (FR edge case)
    // Ship stays in current position

    const newRocks = spawner.spawnLevelAsteroids(level, asteroidPool);
    asteroids.push(...newRocks);
  }

  // ---- Update ----

  function update(_dt) {
    tick++;

    switch (screen) {
      case SCREEN.TITLE:    _updateTitle();    break;
      case SCREEN.PLAYING:  _updatePlaying();  break;
      case SCREEN.PAUSED:   _updatePaused();   break;
      case SCREEN.GAME_OVER: _updateGameOver(); break;
    }

    input.update(); // must be last — clears wasPressed
  }

  function _updateTitle() {
    if (input.wasPressed(KEY.START)) _startGame();
  }

  function _updatePaused() {
    if (input.wasPressed(KEY.PAUSE)) _resumeGame();
    if (input.wasPressed(KEY.QUIT))  { screen = SCREEN.TITLE; }
  }

  function _resumeGame() {
    screen = SCREEN.PLAYING;
  }

  function _updateGameOver() {
    if (input.wasPressed(KEY.START)) _startGame();
    if (input.wasPressed(KEY.PAUSE)) screen = SCREEN.TITLE;
  }

  function _updatePlaying() {
    // --- Input → Pause ---
    if (input.wasPressed(KEY.PAUSE)) {
      screen = SCREEN.PAUSED;
      return;
    }

    // --- Ship ---
    const wantsFire = updateShip(ship, input, powerUpMgr, 0);

    // --- Triple shot or single ---
    if (wantsFire && ship.active) {
      _firePlayer();
    }

    // --- Projectiles ---
    for (let i = bullets.length - 1; i >= 0; i--) {
      updateProjectile(bullets[i]);
      wrapPosition(bullets[i], CANVAS_W, CANVAS_H);
      if (!bullets[i].active) {
        bulletPool.release(bullets[i]);
        bullets.splice(i, 1);
      }
    }

    // --- Asteroids ---
    for (const a of asteroids) {
      updateAsteroid(a);
      wrapPosition(a, CANVAS_W, CANVAS_H);
    }

    // --- Power-ups ---
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const pu = powerUps[i];
      if (pu.update) pu.update(); // entity has own tick
      if (!pu.active) {
        powerUpPool.release(pu);
        powerUps.splice(i, 1);
      }
    }

    // --- Saucers ---
    for (let i = saucers.length - 1; i >= 0; i--) {
      const s = saucers[i];
      const fireResult = updateSaucer(s, { x: ship.x, y: ship.y }, 0);
      if (fireResult) {
        const b = bulletPool.acquire(
          s.x, s.y, fireResult.vx, fireResult.vy, 'enemy',
        );
        bullets.push(b);
      }
      if (!s.active) {
        saucerPool.release(s);
        saucers.splice(i, 1);
      }
    }

    // --- Spawn saucer ---
    const newSaucer = spawner.maybeSaucer(level, saucerPool);
    if (newSaucer) saucers.push(newSaucer);

    // --- Particles ---
    for (let i = particles.length - 1; i >= 0; i--) {
      updateParticle(particles[i]);
      if (!particles[i].active) {
        particlePool.release(particles[i]);
        particles.splice(i, 1);
      }
    }

    // --- Scoring tick (combo timer) ---
    scoring.tick();
    powerUpMgr.tick();

    // ========================
    // COLLISION DETECTION
    // ========================
    // Order: bullet→asteroid first (priority rule), then ship collisions

    // -- Player bullet ↔ asteroid --
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      if (!b.active || b.owner !== 'player') continue;
      for (let ai = asteroids.length - 1; ai >= 0; ai--) {
        const a = asteroids[ai];
        if (!a.active) continue;
        if (collides(b, a, CANVAS_W, CANVAS_H)) {
          // Destroy bullet
          b.active = false;
          bulletPool.release(b);
          bullets.splice(bi, 1);
          // Destroy asteroid
          _destroyAsteroid(ai);
          break; // one bullet hits one asteroid
        }
      }
    }

    // -- Player bullet ↔ saucer --
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      if (!b.active || b.owner !== 'player') continue;
      for (let si = saucers.length - 1; si >= 0; si--) {
        const s = saucers[si];
        if (!s.active) continue;
        if (collides(b, s, CANVAS_W, CANVAS_H)) {
          b.active = false;
          bulletPool.release(b);
          bullets.splice(bi, 1);
          _destroySaucer(si);
          break;
        }
      }
    }

    // -- Ship ↔ asteroid (only if ship is active and not invulnerable) --
    if (ship.active && ship.invulnerableTimer <= 0) {
      for (let ai = asteroids.length - 1; ai >= 0; ai--) {
        if (!asteroids[ai].active) continue;
        if (collides(ship, asteroids[ai], CANVAS_W, CANVAS_H)) {
          _hitShip();
          break;
        }
      }
    }

    // -- Enemy bullet ↔ ship --
    if (ship.active && ship.invulnerableTimer <= 0) {
      for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];
        if (!b.active || b.owner !== 'enemy') continue;
        if (collides(b, ship, CANVAS_W, CANVAS_H)) {
          b.active = false;
          bulletPool.release(b);
          bullets.splice(bi, 1);
          _hitShip();
          break;
        }
      }
    }

    // -- Ship ↔ saucer --
    if (ship.active && ship.invulnerableTimer <= 0) {
      for (let si = saucers.length - 1; si >= 0; si--) {
        if (!saucers[si].active) continue;
        if (collides(ship, saucers[si], CANVAS_W, CANVAS_H)) {
          _hitShip();
          _destroySaucer(si);
          break;
        }
      }
    }

    // -- Ship ↔ power-up --
    if (ship.active) {
      for (let pi = powerUps.length - 1; pi >= 0; pi--) {
        const pu = powerUps[pi];
        if (!pu.active) continue;
        if (collides(ship, pu, CANVAS_W, CANVAS_H)) {
          powerUpMgr.activate(pu.type);
          pu.active = false;
          powerUpPool.release(pu);
          powerUps.splice(pi, 1);
        }
      }
    }

    // --- Wrap ship ---
    if (ship.active) wrapPosition(ship, CANVAS_W, CANVAS_H);

    // --- Level clear ---
    if (asteroids.length === 0 && saucers.length === 0) {
      _nextLevel();
    }

    // --- Extra life check ---
    scoring.checkExtraLife(ship);
  }

  // ---- Actions ----

  function _firePlayer() {
    const tripleActive = powerUpMgr.offensiveType === 'tripleShot';
    const angles = tripleActive
      ? [ship.rotation - 0.2, ship.rotation, ship.rotation + 0.2]
      : [ship.rotation];

    for (const angle of angles) {
      const nx = ship.x + Math.sin(angle) * 16;
      const ny = ship.y - Math.cos(angle) * 16;
      const b = bulletPool.acquire(nx, ny,
        Math.sin(angle) * 8 + ship.vx,
        -Math.cos(angle) * 8 + ship.vy,
        'player',
      );
      bullets.push(b);
    }
  }

  function _destroyAsteroid(ai) {
    const a = asteroids[ai];
    _spawnExplosion(a.x, a.y, COLORS.asteroid, PARTICLE_COUNT_EXPLOSION);

    // Score
    scoring.addKill(a.points);

    // Split
    const children = splitAsteroid(a);
    for (const c of children) {
      const child = asteroidPool.acquire(c.x, c.y, c.size);
      asteroids.push(child);
    }

    // Maybe spawn power-up
    const pu = spawner.maybePowerUp(a, powerUpPool);
    if (pu) powerUps.push(pu);

    // Release original
    asteroidPool.release(a);
    asteroids.splice(ai, 1);
  }

  function _destroySaucer(si) {
    const s = saucers[si];
    scoring.addKill(s.points);
    _spawnExplosion(s.x, s.y, COLORS.saucer, PARTICLE_COUNT_EXPLOSION + 4);
    saucerPool.release(s);
    saucers.splice(si, 1);
  }

  function _hitShip() {
    // Shield absorbs one hit
    if (powerUpMgr.absorbHit()) return;

    ship.lives--;
    _spawnExplosion(ship.x, ship.y, COLORS.ship, PARTICLE_COUNT_EXPLOSION + 8);

    if (ship.lives <= 0) {
      ship.active = false;
      newHighScore = leaderboard.addScore(scoring.score, level);
      screen = SCREEN.GAME_OVER;
    } else {
      respawnShip(ship, CANVAS_W / 2, CANVAS_H / 2);
    }
  }

  function _spawnExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = PARTICLE_SPEED_MIN + Math.random() * (PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN);
      const p = particlePool.acquire(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
      );
      particles.push(p);
    }
  }

  // ---- Render ----

  function render(alpha) {
    renderer.clear();

    switch (screen) {
      case SCREEN.TITLE:
        drawTitleScreen(renderer, leaderboard);
        break;

      case SCREEN.PLAYING:
      case SCREEN.PAUSED:
        _renderGame(alpha);
        if (screen === SCREEN.PAUSED) drawPauseOverlay(renderer);
        break;

      case SCREEN.GAME_OVER:
        _renderGame(alpha);
        drawGameOverScreen(renderer, scoring.score, newHighScore);
        break;
    }
  }

  function _renderGame(alpha) {
    // Asteroids
    for (const a of asteroids) {
      if (!a.active) continue;
      const path = asteroidPath(a);
      renderer.drawGlow(path, COLORS.asteroid, 2);
    }

    // Player bullets (hot pink)
    for (const b of bullets) {
      if (!b.active) continue;
      const color = b.owner === 'player' ? COLORS.bulletPlayer : COLORS.bulletEnemy;
      const path = new Path2D();
      path.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      renderer.drawGlow(path, color, 1.5);
    }

    // Saucers
    for (const s of saucers) {
      if (!s.active) continue;
      renderer.drawGlow(saucerPath(s), COLORS.saucer, 2);
    }

    // Power-ups
    for (const pu of powerUps) {
      if (!pu.active) continue;
      const color = COLORS.powerUp[pu.type] ?? COLORS.hudAccent;
      const path = new Path2D();
      path.arc(pu.x, pu.y, pu.radius, 0, Math.PI * 2);
      renderer.drawGlow(path, color, 2);
      // Inner X mark
      const x = new Path2D();
      x.moveTo(pu.x - 5, pu.y - 5); x.lineTo(pu.x + 5, pu.y + 5);
      x.moveTo(pu.x + 5, pu.y - 5); x.lineTo(pu.x - 5, pu.y + 5);
      renderer.drawGlow(x, color, 1);
    }

    // Ship
    if (ship.active) {
      // Blink during invulnerability (every 6 ticks)
      const blink = ship.invulnerableTimer > 0 && Math.floor(tick / 6) % 2 === 0;
      if (!blink) {
        renderer.save();
        renderer.translate(ship.x, ship.y);
        renderer.rotate(ship.rotation);
        const path = shipPath();
        renderer.drawGlow(path, COLORS.ship, 2);
        renderer.restore();
      }
      drawThrustFlame(renderer, ship, alpha);
    }

    // Particles
    drawParticles(renderer, particles, alpha);

    // HUD
    drawHUD(renderer, {
      score: scoring.score,
      highScore: scoring.highScore,
      combo: scoring.combo,
      level,
      lives: ship.lives,
      powerUpState: powerUpMgr.getRenderState(),
    });
  }

  // ---- Visibility (tab switch auto-pause) ----

  function _setupVisibilityPause() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && screen === SCREEN.PLAYING) {
        screen = SCREEN.PAUSED;
      }
    });
  }

  return { start, destroy };
}
