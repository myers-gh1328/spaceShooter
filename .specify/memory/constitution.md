<!--
  Sync Impact Report
  ==================
  Version change: 1.0.0 → 1.1.0 (MINOR — tech stack simplified)
  Modified principles:
    - VII. Browser Performance: "TypeScript/JavaScript" → "JavaScript"
  Modified sections:
    - Technical Stack & Constraints: TypeScript + Vite replaced with
      plain HTML + JavaScript (ES2020+) + CSS; no build step required.
    - Development Workflow: Vitest replaced with lightweight testing;
      ESLint TypeScript ruleset replaced with standard ESLint.
  Added sections: none
  Removed sections: none
  Templates requiring updates:
    - .specify/templates/plan-template.md        ✅ compatible
    - .specify/templates/spec-template.md         ✅ compatible
    - .specify/templates/tasks-template.md        ✅ compatible
    - .specify/templates/checklist-template.md    ✅ compatible
  Follow-up TODOs: none
-->

# SpaceShooter Constitution

## Core Principles

### I. Game Loop Architecture

Every gameplay session MUST be driven by a fixed-timestep update loop
decoupled from the render cycle.

- The **update step** MUST run at a fixed interval (default 60 ticks/s)
  so that physics and game logic are deterministic regardless of the
  display refresh rate.
- The **render step** MUST use `requestAnimationFrame` and interpolate
  between the last two update states for smooth visuals.
- All time-dependent calculations (movement, cooldowns, spawn timers)
  MUST use the fixed delta-time value — never raw `Date.now()` diffs.
- The loop MUST support **pause**, **resume**, and **game-over** states
  without resource leaks (timers, listeners).

### II. Responsive Controls

Player input MUST feel immediate and predictable on every supported
input method.

- **Keyboard** MUST be the primary input: arrow keys or WASD for
  thrust/rotate, Space for fire, P or Escape for pause.
- **Touch** MUST be supported as a secondary input: on-screen virtual
  joystick + fire button for mobile browsers.
- Input state MUST be polled each update tick, not processed on raw
  key events, to avoid frame-skipping or double-fire bugs.
- Maximum input-to-action latency MUST stay below one update tick
  (≤16.67 ms at 60 ticks/s).

### III. Core Game Rules

SpaceShooter MUST implement a recognizable Asteroids-inspired rule set
extended with modern mechanics.

- The player controls a single ship that can **rotate**, **thrust**,
  and **fire projectiles**.
- Asteroids spawn at screen edges and drift inward; destroying a large
  asteroid MUST split it into two medium pieces, medium into two small.
- The ship MUST wrap around screen edges (toroidal topology).
- Collision between the ship and any asteroid or enemy projectile MUST
  cost one life; zero lives triggers game-over.
- The player starts with **3 lives**; extra lives are awarded by score
  thresholds (every 10 000 points).
- Levels advance when all asteroids on screen are destroyed; each new
  level MUST increase the starting asteroid count by one (minimum 4).

### IV. Scoring & Progression

Scoring MUST reward skill and encourage risk-taking.

- Point values by asteroid size: Large = 20, Medium = 50, Small = 100.
- Enemy saucers (introduced at level 3+): Small saucer = 1 000,
  Large saucer = 200.
- A **combo multiplier** (×2, ×3, ×4 … up to ×8) MUST increase when
  the player destroys objects within 2 seconds of the previous kill;
  it resets to ×1 after 2 seconds of no kills.
- High scores MUST persist across sessions using `localStorage`.
- A **leaderboard** of the top 10 local scores MUST be displayed on
  the title screen.

### V. Power-Up System

Power-ups MUST add tactical depth without unbalancing the base game.

- Power-ups spawn randomly when medium or small asteroids are
  destroyed (15 % chance per destruction).
- Each power-up MUST be visually distinct (unique colour + icon) and
  have a limited duration (default 8 seconds).
- Defined power-up types (minimum viable set):
  - **Rapid Fire** — halves the fire cooldown.
  - **Shield** — absorbs one hit without losing a life.
  - **Triple Shot** — fires three projectiles in a spread pattern.
  - **Speed Boost** — increases thrust acceleration by 50 %.
- Only one offensive power-up (Rapid Fire, Triple Shot) may be active
  at a time; collecting a new one replaces the current one.
  Shield and Speed Boost stack independently.
- Power-ups that are not collected MUST despawn after 6 seconds.

### VI. UI & Visual Design

The interface MUST communicate game state clearly and feel modern.

- **HUD** (always visible during gameplay): current score, high score,
  lives remaining (ship icons), active power-up indicator with
  remaining-time bar, current level number.
- **Title Screen**: game logo, "Press ENTER to Start" prompt,
  top-10 leaderboard.
- **Pause Overlay**: semi-transparent backdrop, "PAUSED" label,
  resume/quit options.
- **Game Over Screen**: final score, new-high-score callout if
  applicable, "Play Again" and "Main Menu" buttons.
- Visual effects MUST include particle explosions on asteroid/ship
  destruction and a thrust flame on the player ship.
- Art style MUST use vector/neon-glow aesthetics (bright outlines on a
  dark background) to evoke a modernised retro look.
- All UI elements MUST be rendered on the Canvas — no HTML overlays
  inside the game viewport.

### VII. Browser Performance

The game MUST run smoothly in any modern browser without plugins or
installs.

- Target frame rate: **60 fps** on mid-range hardware (2020-era
  laptop, integrated GPU).
- Total initial page load (HTML + JS + assets) MUST be under
  **500 KB** uncompressed.
- The game MUST NOT depend on any game-engine framework (Phaser,
  PixiJS, Three.js, etc.); only vanilla JavaScript and the HTML5
  Canvas 2D API are permitted.
- Memory allocation during gameplay MUST be minimised: prefer object
  pools for bullets, particles, and asteroids over per-frame `new`.
- The game MUST function correctly in the latest stable releases of
  Chrome, Firefox, Edge, and Safari (desktop + mobile).

## Technical Stack & Constraints

- **Languages**: HTML5, JavaScript (ES2020+), CSS3.
- **Build tool**: none — the project MUST run by opening
  `index.html` directly or via a simple static file server
  (e.g., `npx serve` or VS Code Live Server). No transpilation,
  bundling, or compilation step is required.
- **Rendering**: HTML5 Canvas 2D context — no WebGL unless a future
  constitution amendment explicitly approves it.
- **State management**: plain objects, classes, and ES modules; no
  external state libraries.
- **Asset pipeline**: all visual assets MUST be procedurally generated
  at runtime (vector drawing on Canvas) — no external image files
  for core gameplay sprites.
- **Audio** (stretch goal): Web Audio API for SFX; no music files
  required for MVP.
- **Styling**: CSS for page layout, title screen, and overlays
  outside the Canvas; gameplay HUD is rendered on Canvas.
- **Hosting target**: static file deployment (GitHub Pages, Netlify,
  or equivalent).
- **Browser support**: last 2 versions of Chrome, Firefox, Edge,
  Safari.

## Development Workflow

- **Branching**: trunk-based; short-lived feature branches merged via
  pull request.
- **Testing**: core game logic (collision detection, scoring, physics,
  spawn rules, power-up effects) MUST have unit tests. A lightweight
  test runner (e.g., Vitest or a simple HTML test harness) is
  acceptable.
- **Linting**: ESLint with the recommended ruleset; no warnings
  allowed in CI.
- **Formatting**: Prettier with default settings; enforced in CI.
- **Code review**: every PR MUST be reviewed against this constitution
  before merge.
- **Commits**: conventional commits format
  (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- **Definition of Done**: feature branch passes lint + tests + manual
  playtest before merge.

## Governance

This constitution is the highest-authority document for SpaceShooter
development. All design decisions, code reviews, and feature proposals
MUST be evaluated against these principles.

- **Amendments** require:
  1. A written proposal describing the change and its rationale.
  2. Review and approval by the project owner.
  3. An updated constitution version, ratification note, and migration
     plan if the change affects existing code.
- **Versioning** follows semantic versioning:
  - MAJOR — principle removed or redefined in a backward-incompatible
    way.
  - MINOR — new principle or section added, or existing guidance
    materially expanded.
  - PATCH — clarifications, typo fixes, non-semantic refinements.
- **Compliance review**: at the start of every new feature spec, the
  plan MUST include a "Constitution Check" gate verifying alignment
  with all active principles.

**Version**: 1.1.0 | **Ratified**: 2026-03-10 | **Last Amended**: 2026-03-10
