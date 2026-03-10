# Research: NOVA DRIFT — MVP Core Game

**Feature**: `001-mvp-core-game`
**Date**: 2026-03-10

---

## 1. Fixed-Timestep Game Loop

**Decision**: Accumulator-based fixed-timestep loop at 60 Hz, with
`requestAnimationFrame` driving the render cycle.

**Rationale**: This is the canonical pattern for deterministic game
physics in the browser (Glenn Fiedler's "Fix Your Timestep!"). It
decouples update rate from display refresh rate, making physics
behave identically on 60 Hz and 144 Hz monitors.

**Key design choices**:

| Choice | Value | Why |
|--------|-------|-----|
| Timer source | rAF timestamp argument (backed by `performance.now()`) | Microsecond precision, monotonic, already passed by the browser |
| Tick rate | 60 Hz (16.667 ms per tick) | Matches most displays; gives a comfortable budget for update + render |
| Frame-delta clamp | 250 ms max | Prevents spiral-of-death after GC stalls or tab switch; game slows rather than freezes |
| Interpolation | Always — store `prev` + `current` positions, lerp by `alpha` | Eliminates visible stuttering when render rate ≠ update rate |
| Pause handling | Reset `lastTime = performance.now()` on resume; zero accumulator | Prevents burst of catch-up ticks after unpause |
| Tab visibility | Auto-pause via `document.visibilitychange` | Required by FR-017; prevents background drift and battery drain |
| Spiral guard | Clamp `frameTime` to 250 ms; optionally cap iterations to 5 | Never skip updates silently — avoids physics tunneling |

**Alternatives considered**:
- Variable-timestep (`dt = frameTime`) — rejected: physics becomes non-deterministic, faster machines see different behaviour.
- setInterval for updates — rejected: not synced to display, unreliable timing, cannot interpolate.

---

## 2. Collision Detection

**Decision**: Circle-circle collision using squared-distance comparison
with toroidal wrap correction.

**Rationale**: All entities (ship, asteroids, projectiles, power-ups,
saucers) are well-approximated by circles. With fewer than 100 active
entities, brute-force categorised pair-checks are fast enough — no
spatial partitioning needed.

**Key design choices**:

| Choice | Value | Why |
|--------|-------|-----|
| Primitives | Circle-circle (squared distance vs squared sum-of-radii) | Avoids `Math.sqrt`; O(1) per pair |
| Wrap handling | `wrapDelta` approach: remap axis delta when > half the canvas dimension | Cheaper than ghost-copy approach; single check per pair |
| Broad phase | None (categorised pair-checks only) | At <100 entities, spatial hashing adds complexity for negligible gain |
| Check ordering | Bullet→asteroid first, then ship→asteroid | Gives player benefit of doubt on simultaneous-tick collisions (FR edge case) |
| Removal strategy | Flag `active = false` during collision pass; sweep dead entities after all checks | Avoids index bugs from mid-iteration splicing |
| Hit radii | ~70–80 % of visual size | Perceived as fair; near-misses feel intentional |

**Alternatives considered**:
- Polygon-based SAT collision — rejected: over-engineered for circle-approximable shapes.
- Spatial hash grid — rejected: worth adding only if entity count exceeds ~200.

---

## 3. Object Pooling

**Decision**: Generic pool class with factory + reset function pattern.
Pre-allocate pools at game start; grow on demand.

**Rationale**: At 60 fps, rapid fire + particle bursts create ~1 800
short-lived allocations per second without pooling, causing GC
micro-stutters. Pooling drops runtime allocations to near-zero.

**Pool sizing**:

| Entity | Peak Active | Pre-alloc | Notes |
|--------|------------|-----------|-------|
| Asteroids | ~20 | 30 | Covers cascading splits |
| Projectiles | ~10 | 15 | Covers rapid-fire power-up overlap |
| Particles | ~50 | 80 | Covers 2 near-simultaneous explosions |
| Power-ups | ~3 | 5 | Rare spawns |

**Key patterns**:
- Factory creates objects with all properties pre-declared (stable V8 hidden class).
- Reset function re-initialises on acquire — no property add/delete.
- Sweep uses swap-and-pop for unordered entity arrays (O(1) removal).
- Pools grow if exhausted (allocate one more) rather than hard-capping.

**Alternatives considered**:
- No pooling (allocate/GC freely) — rejected: measurable micro-stutter at 60 fps.
- Fixed-size ring buffers — rejected: hard caps cause invisible bugs when pool empties.

---

## 4. Neon-Glow Rendering

**Decision**: Multi-pass stroked `Path2D` with `shadowBlur` for glow,
cached to offscreen canvases for expensive static elements.

**Rationale**: Canvas 2D `shadowBlur` produces a convincing neon effect
with zero external assets. Performance is acceptable when glow is
cached for static shapes and limited to key entities at runtime.

**Key design choices**:

| Choice | Value | Why |
|--------|-------|-----|
| Glow technique | 2–3 layered strokes with decreasing `shadowBlur` + white-hot core | Rich glow; single technique for all entities |
| Static caching | Offscreen `<canvas>` per asteroid shape, per title text, per digit | shadowBlur is the most expensive Canvas 2D op; cache amortises cost |
| Composite mode | `ctx.globalCompositeOperation = 'lighter'` for overlapping glows | Additive blending intensifies naturally; true neon look |
| Canvas alpha | `getContext('2d', { alpha: false })` on main canvas | GPU optimisation: browser skips alpha compositing with page |
| Shape definition | `Path2D` objects defined once at entity creation | Reusable; GPU-cacheable in some implementations |
| Font | `'Orbitron'` (Google Fonts) or system `monospace` fallback | Sci-fi aesthetic; loads fast; degrades gracefully |
| Layered canvases | Starfield (static) + gameplay (dynamic) + HUD (semi-static) | Avoids re-clearing/re-drawing the starfield every frame |

**Colour palette**:

| Role | Colour | Hex |
|------|--------|-----|
| Background | Near-black navy | `#0a0a1a` |
| Ship | Cyan | `#00ffff` |
| Asteroids | Electric blue | `#4d8bff` |
| Projectiles (player) | Hot pink | `#ff2975` |
| Projectiles (enemy) | Neon orange | `#ff6600` |
| Power-ups | Electric green | `#39ff14` |
| Saucers | Yellow | `#ffff00` |
| HUD text | White / Cyan | `#ffffff` / `#00ffff` |
| Particle sparks | Match destroyed entity colour | varies |

**Alternatives considered**:
- WebGL shaders for glow — rejected: constitution forbids WebGL.
- Pre-rendered sprite sheets (PNG) — rejected: constitution requires procedural vector assets.
- Single canvas (no layers) — rejected: re-drawing starfield every frame wastes cycles.

---

## 5. ES Modules without a Build Step

**Decision**: Use `<script type="module">` with relative `.js` imports.
Require a local static file server (VS Code Live Server / `npx serve`)
for development — document in quickstart.

**Rationale**: ES modules are natively supported in all target browsers
(Chrome 61+, Firefox 60+, Safari 11+, Edge 79+). With ~15 modules the
HTTP waterfall is negligible in development.

**Key design choices**:

| Choice | Value | Why |
|--------|-------|-----|
| Import style | Named exports; relative paths with `.js` extension | Bare specifiers don't work without import maps; named exports are easier to refactor |
| Barrel modules | Avoid | Prevent accidental circular dependencies |
| Import maps | Not used | Safari 16.4+ requirement is too new; not needed with ~15 modules |
| `modulepreload` | Optional `<link rel="modulepreload">` for critical-path modules | Flattens waterfall for faster cold-start |
| `file://` workaround | Document "use a local server" in quickstart; constitution says `index.html` opens directly | Small friction; note in quickstart that a server is recommended for development, while production static hosting works out of the box |
| Top-level await | Avoid | Not supported in Safari <15; unnecessary for game initialisation |

**Gotchas documented**:
- `file://` triggers CORS errors for module `import` — a local server is needed.
- `.mjs` extension can cause MIME issues — use `.js` throughout.
- `OffscreenCanvas` requires Safari 16.4+ — use `document.createElement('canvas')` for caching instead.
- Keep dependency graph acyclic; extract shared types into a utility module.

**Alternatives considered**:
- Single monolithic `<script>` tag — rejected: unmaintainable at ~15 logical modules.
- Import maps for bare specifiers — rejected: insufficient Safari support.
- Vite/esbuild bundling — rejected: constitution mandates no build step.
