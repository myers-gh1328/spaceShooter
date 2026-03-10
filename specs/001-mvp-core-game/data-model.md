# Data Model: NOVA DRIFT — MVP Core Game

**Feature**: `001-mvp-core-game`
**Date**: 2026-03-10

---

## Entity Relationship Diagram

```
┌──────────┐       fires        ┌─────────────┐
│   Ship   │───────────────────▶│  Projectile  │
└────┬─────┘                    └──────────────┘
     │ collects                        ▲
     ▼                                 │ fires
┌──────────┐                    ┌──────┴───────┐
│ Power-Up │                    │    Saucer    │
└──────────┘                    └──────────────┘
                                       
┌──────────┐    splits into     ┌──────────────┐
│ Asteroid │───────────────────▶│   Asteroid   │
└────┬─────┘                    └──────────────┘
     │ destroyed
     ▼
┌──────────┐
│ Particle │  (visual effect only — no game-logic relationships)
└──────────┘

┌──────────────┐
│ Score Entry  │  (persisted to localStorage — no runtime entity relationships)
└──────────────┘
```

---

## Entities

### Ship

The player-controlled vessel. Exactly one exists during gameplay.

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | Horizontal position (logical pixels) |
| `y` | number | Vertical position (logical pixels) |
| `prevX` | number | Previous-tick x (for interpolation) |
| `prevY` | number | Previous-tick y (for interpolation) |
| `vx` | number | Horizontal velocity (px/tick) |
| `vy` | number | Vertical velocity (px/tick) |
| `rotation` | number | Current facing angle (radians, 0 = up) |
| `prevRotation` | number | Previous-tick rotation (for interpolation) |
| `radius` | number | Collision radius (~12 px) |
| `lives` | number | Remaining lives (starts at 3) |
| `invulnerableTimer` | number | Ticks remaining of post-death invulnerability (0 = vulnerable) |
| `fireCooldown` | number | Ticks until next shot allowed |
| `thrusting` | boolean | Whether thrust is currently applied (drives flame VFX) |
| `active` | boolean | Whether ship is alive on screen |

**Validation rules**:
- `lives` ≥ 0; when decremented to 0 the next hit triggers game-over.
- `invulnerableTimer` starts at ~120 ticks (2 seconds) after losing a life.
- `rotation` wraps to [0, 2π).

**State transitions**:
- `ALIVE` → `EXPLODING` (on collision) → `RESPAWNING` (invulnerable, 2 s) → `ALIVE`
- `ALIVE` → `EXPLODING` → `DEAD` (if lives = 0 → triggers GAME_OVER)

---

### Asteroid

A destructible obstacle that splits on destruction.

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | Horizontal position |
| `y` | number | Vertical position |
| `prevX` | number | Previous-tick x |
| `prevY` | number | Previous-tick y |
| `vx` | number | Horizontal velocity |
| `vy` | number | Vertical velocity |
| `rotation` | number | Current rotation (visual only) |
| `rotationSpeed` | number | Radians per tick (visual spin) |
| `radius` | number | Collision radius (Large ~40, Medium ~20, Small ~10) |
| `size` | string | `'large'` \| `'medium'` \| `'small'` |
| `points` | number | Score value: Large=20, Medium=50, Small=100 |
| `vertices` | number[] | Pre-generated irregular polygon vertices for rendering |
| `active` | boolean | Whether asteroid is alive |

**Validation rules**:
- `size` must be one of the three enum values.
- `points` must match size (enforced at creation).
- `radius` must match size category.

**State transitions**:
- `ACTIVE` → `DESTROYED`:
  - If `large` → spawn 2 `medium` at same position ± random offset.
  - If `medium` → spawn 2 `small` at same position ± random offset.
  - If `small` → no children; may spawn a power-up (15 % chance).
  - Always spawns particles at destruction point.

---

### Projectile

A bullet fired by the player ship or an enemy saucer.

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | Horizontal position |
| `y` | number | Vertical position |
| `prevX` | number | Previous-tick x |
| `prevY` | number | Previous-tick y |
| `vx` | number | Horizontal velocity |
| `vy` | number | Vertical velocity |
| `radius` | number | Collision radius (~3 px) |
| `owner` | string | `'player'` \| `'enemy'` |
| `lifetime` | number | Ticks remaining before despawn (~90 ticks = 1.5 s) |
| `active` | boolean | Whether projectile is alive |

**Validation rules**:
- `lifetime` decrements each tick; projectile deactivates at 0.
- `owner` determines collision targeting: player bullets hit asteroids + saucers; enemy bullets hit ship only.

---

### Saucer

An enemy entity that appears from level 3 onward.

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | Horizontal position |
| `y` | number | Vertical position |
| `prevX` | number | Previous-tick x |
| `prevY` | number | Previous-tick y |
| `vx` | number | Horizontal velocity |
| `vy` | number | Vertical velocity |
| `radius` | number | Collision radius (Large ~20, Small ~12) |
| `size` | string | `'large'` \| `'small'` |
| `points` | number | Score value: Large=200, Small=1000 |
| `fireCooldown` | number | Ticks until next shot |
| `directionTimer` | number | Ticks until random direction change |
| `active` | boolean | Whether saucer is alive |

**Validation rules**:
- `size` must be `'large'` or `'small'`.
- `points` must match size.
- `fireCooldown` resets after firing (Large: ~90 ticks, Small: ~45 ticks).
- Saucer deactivates if it exits the screen without wrapping (saucers do NOT wrap — they enter from one edge and leave via the opposite).

---

### Power-Up

A collectible item spawned on asteroid destruction.

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | Horizontal position |
| `y` | number | Vertical position |
| `prevX` | number | Previous-tick x |
| `prevY` | number | Previous-tick y |
| `radius` | number | Collision radius (~10 px) |
| `type` | string | `'rapidFire'` \| `'shield'` \| `'tripleShot'` \| `'speedBoost'` |
| `despawnTimer` | number | Ticks remaining before auto-despawn (~360 ticks = 6 s) |
| `active` | boolean | Whether power-up is on screen |

**Validation rules**:
- `type` must be one of the four enum values.
- `despawnTimer` decrements each tick; power-up deactivates at 0.
- Power-ups do NOT move (float stationary where spawned).
- Power-ups do NOT wrap (they remain at spawn position).

**Categories**:
- **Offensive** (mutually exclusive when active): `rapidFire`, `tripleShot`
- **Defensive / utility** (stack independently): `shield`, `speedBoost`

---

### Particle

A short-lived visual effect element. No gameplay impact.

| Field | Type | Description |
|-------|------|-------------|
| `x` | number | Horizontal position |
| `y` | number | Vertical position |
| `vx` | number | Horizontal velocity (decays) |
| `vy` | number | Vertical velocity (decays) |
| `radius` | number | Draw radius (1–3 px) |
| `color` | string | Hex colour matching source entity |
| `opacity` | number | Current opacity (1.0 → 0.0 over lifetime) |
| `lifetime` | number | Ticks remaining (~30–60 ticks) |
| `active` | boolean | Whether particle is alive |

**Validation rules**:
- `opacity` decreases linearly each tick: `opacity = lifetime / initialLifetime`.
- Deactivates when `lifetime` reaches 0.
- Particles do NOT collide with anything.
- Particles do NOT wrap — they fade out naturally.

---

### Score Entry

A leaderboard record persisted to `localStorage`.

| Field | Type | Description |
|-------|------|-------------|
| `score` | number | Final score achieved |
| `level` | number | Highest level reached |
| `date` | string | ISO 8601 date string (`YYYY-MM-DD`) |

**Validation rules**:
- Leaderboard stores at most 10 entries, sorted descending by `score`.
- If `score` ties an existing entry, the newer entry is placed below the older one (stable sort).
- Stored as JSON array in `localStorage` key `novadrift_leaderboard`.

---

## Game State

Global state that is not an entity but governs the session.

| Field | Type | Description |
|-------|------|-------------|
| `screen` | string | `'title'` \| `'playing'` \| `'paused'` \| `'gameOver'` |
| `level` | number | Current level (starts at 1) |
| `score` | number | Current session score |
| `highScore` | number | All-time high score (from leaderboard) |
| `combo` | number | Current combo multiplier (1–8) |
| `comboTimer` | number | Ticks since last kill (resets combo at ~120 ticks = 2 s) |
| `nextExtraLife` | number | Score threshold for next extra life (starts at 10 000, increments by 10 000) |
| `activePowerUp` | object \| null | `{ type, remainingTicks }` for the current offensive power-up |
| `shieldActive` | boolean | Whether the shield power-up is active |
| `shieldTimer` | number | Ticks remaining on shield |
| `speedBoostActive` | boolean | Whether the speed boost power-up is active |
| `speedBoostTimer` | number | Ticks remaining on speed boost |

**State machine (screen transitions)**:
```
         ENTER
TITLE ──────────▶ PLAYING
                   │    ▲
              ESC  │    │ Resume
                   ▼    │
                  PAUSED
                   │
              Quit │
                   ▼
                  TITLE

PLAYING ──────────▶ GAME_OVER
  (0 lives)           │
                      │ Play Again
                      ▼
                   PLAYING

GAME_OVER ─────────▶ TITLE
  (Main Menu)
```
