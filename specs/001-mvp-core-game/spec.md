# Feature Specification: NOVA DRIFT — MVP Core Game

**Feature Branch**: `001-mvp-core-game`
**Created**: 2026-03-10
**Status**: Draft
**Input**: User description: "Build the MVP version of the SpaceShooter browser game with a gameplay loop, controls, rules, scoring, power-ups, UI, and technical constraints. The game should be a modernised Asteroids-style experience displayed to users under the name **NOVA DRIFT**."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Fly & Shoot (Priority: P1)

A player opens the game in their browser and immediately starts piloting a ship. They can rotate, thrust forward, and fire projectiles at asteroids. Destroying all asteroids on screen advances them to the next level, where more asteroids appear. The game feels responsive and fluid at 60 fps.

**Why this priority**: Without ship movement, firing, and asteroid destruction the game literally does not exist. This is the irreducible core loop.

**Independent Test**: Open `index.html`, press ENTER on the title screen, fly the ship with arrow keys, fire with Space, destroy all asteroids, and confirm the next level spawns with one additional asteroid.

**Acceptance Scenarios**:

1. **Given** the game is running, **When** the player presses Left/Right arrow keys, **Then** the ship rotates smoothly in the corresponding direction.
2. **Given** the game is running, **When** the player presses Up arrow, **Then** the ship accelerates in the direction it faces and a thrust flame is visible.
3. **Given** the game is running, **When** the player presses Space, **Then** a projectile fires from the ship's nose in the direction the ship faces.
4. **Given** a projectile contacts a large asteroid, **When** the collision is detected, **Then** the asteroid splits into two medium asteroids with a particle explosion effect.
5. **Given** all asteroids are destroyed, **When** the field is empty, **Then** the next level begins with one more asteroid than the previous level (minimum 4 on level 1).
6. **Given** the ship reaches a screen edge, **When** it crosses the boundary, **Then** it wraps to the opposite side seamlessly.

---

### User Story 2 — Lives, Scoring & Game Over (Priority: P2)

As a player destroys asteroids they earn points displayed on the HUD. A combo multiplier rewards fast successive kills. The player starts with 3 lives; colliding with an asteroid costs one life. Losing all lives triggers a game-over screen showing the final score and the option to play again.

**Why this priority**: Scoring and lives create stakes and motivation. Without them, flying and shooting has no purpose.

**Independent Test**: Start a game, destroy asteroids and confirm the score increments correctly (Large 20, Medium 50, Small 100). Destroy two asteroids within 2 seconds and confirm the combo multiplier increases. Intentionally collide with an asteroid and confirm a life is lost. Lose all 3 lives and confirm the game-over screen appears with the correct score.

**Acceptance Scenarios**:

1. **Given** gameplay is active, **When** the player destroys a large asteroid, **Then** 20 points (multiplied by the current combo) are added to the score displayed on the HUD.
2. **Given** the player destroys an object, **When** they destroy another within 2 seconds, **Then** the combo multiplier increases by 1 (up to ×8).
3. **Given** 2 seconds pass with no kills, **When** the timer expires, **Then** the combo multiplier resets to ×1.
4. **Given** the ship has 3 lives, **When** it collides with an asteroid, **Then** 1 life is deducted and the remaining lives display updates.
5. **Given** the player has 0 lives remaining, **When** the ship is hit, **Then** the game-over screen appears showing the final score.
6. **Given** the game-over screen is showing, **When** the player selects "Play Again", **Then** a new game begins with 3 lives and score reset to 0.
7. **Given** the player's score reaches 10 000 points, **When** the threshold is crossed, **Then** an extra life is awarded (and every subsequent 10 000 points).

---

### User Story 3 — Power-Ups (Priority: P3)

While playing, the player occasionally sees a glowing pick-up item float where a destroyed asteroid was. Flying the ship into it activates a temporary ability — rapid fire, a shield, triple shot, or speed boost. The active power-up and remaining duration are shown on the HUD.

**Why this priority**: Power-ups add variety and tactical decisions but the game is playable without them.

**Independent Test**: Destroy small/medium asteroids repeatedly until a power-up spawns. Fly into it and confirm the effect activates for 8 seconds with a visible HUD indicator. Confirm the power-up despawns after 6 seconds if not collected.

**Acceptance Scenarios**:

1. **Given** a medium or small asteroid is destroyed, **When** the random chance (15 %) triggers, **Then** a power-up item spawns at the destruction location with a distinct colour and icon.
2. **Given** a power-up is floating on screen, **When** the ship flies into it, **Then** the corresponding effect activates for 8 seconds and the HUD shows the active power-up with a remaining-time bar.
3. **Given** Rapid Fire is active, **When** the player fires, **Then** the fire cooldown is halved.
4. **Given** Shield is active, **When** the ship collides with an asteroid, **Then** the shield absorbs the hit, no life is lost, and the shield deactivates.
5. **Given** Triple Shot is active, **When** the player fires, **Then** three projectiles fire in a spread pattern.
6. **Given** Speed Boost is active, **When** the player thrusts, **Then** acceleration is 50 % higher than normal.
7. **Given** Rapid Fire is active, **When** the player collects Triple Shot, **Then** Triple Shot replaces Rapid Fire (only one offensive power-up at a time).
8. **Given** a power-up is uncollected on screen, **When** 6 seconds elapse, **Then** the power-up despawns.

---

### User Story 4 — Title Screen, Pause & Leaderboard (Priority: P4)

When the player first loads the page they see the NOVA DRIFT title screen with a neon-glow logo, a "Press ENTER to Start" prompt, and a top-10 leaderboard of previous high scores. During gameplay, pressing Escape pauses the game with a translucent overlay offering Resume and Quit options. The leaderboard persists between browser sessions.

**Why this priority**: Screens and pause are essential polish but the core loop functions without them (a direct-to-gameplay prototype works for testing).

**Independent Test**: Load the page — confirm the title screen, logo, and leaderboard render. Press ENTER — confirm gameplay starts. Press Escape — confirm the pause overlay appears and the game freezes. Select Resume — confirm gameplay continues. Complete a game with a top-10 worthy score — confirm it appears on the leaderboard after returning to the title screen.

**Acceptance Scenarios**:

1. **Given** the page loads, **When** all assets are ready, **Then** the title screen displays the NOVA DRIFT logo, "Press ENTER to Start", and the top-10 leaderboard.
2. **Given** the title screen is showing, **When** the player presses ENTER, **Then** gameplay begins on level 1.
3. **Given** gameplay is active, **When** the player presses Escape, **Then** a semi-transparent pause overlay appears with "PAUSED", Resume, and Quit options, and the game loop halts.
4. **Given** the pause overlay is showing, **When** the player selects Resume, **Then** gameplay continues from the exact state it was paused.
5. **Given** the game ends with a top-10 score, **When** the game-over screen is shown, **Then** the leaderboard updates and the score persists across browser sessions.
6. **Given** no previous scores exist, **When** the title screen loads, **Then** the leaderboard shows an empty state message.

---

### User Story 5 — Enemy Saucers (Priority: P5)

Starting at level 3, enemy saucers periodically appear from the screen edge, fly across the field, and fire projectiles at the player. Small saucers are worth 1 000 points and large saucers 200 points. Their presence raises difficulty and adds another threat to navigate.

**Why this priority**: Saucers add depth but are not required for the minimum viable Asteroids-style loop.

**Independent Test**: Play until level 3. Confirm a saucer spawns, moves across the screen, fires at the player, and can be destroyed for the correct point value.

**Acceptance Scenarios**:

1. **Given** the current level is 3 or higher, **When** a saucer spawn timer triggers, **Then** a saucer enters from a random screen edge.
2. **Given** a saucer is on screen, **When** it updates each tick, **Then** it moves in a direction and periodically fires a projectile toward the player's current position.
3. **Given** the player's projectile contacts a small saucer, **When** the collision is detected, **Then** the saucer is destroyed and 1 000 points (× combo) are awarded.
4. **Given** a saucer's projectile contacts the player's ship, **When** the collision is detected, **Then** the player loses one life (unless shielded).

---

### Edge Cases

- **Rapid fire at screen edge**: When the player fires near a screen boundary, projectiles MUST wrap to the opposite side rather than disappearing.
- **Simultaneous collision**: If the ship and an asteroid collide on the same tick as a projectile destroys that asteroid, the asteroid destruction takes priority and the ship is unharmed.
- **Level transition during active power-up**: Power-up timers MUST continue counting down across level transitions; they do not reset.
- **Full leaderboard replacement**: If the player's score ties an existing leaderboard entry, the newer score MUST be placed below the older one.
- **Browser tab hidden**: When the browser tab loses visibility, the game loop MUST auto-pause to prevent background drift and battery drain.
- **Window resize**: If the browser window is resized during gameplay, the Canvas MUST scale proportionally without distorting the play field or repositioning entities incorrectly.
- **Rapid pause/unpause**: Pressing Escape repeatedly in quick succession MUST toggle pause state cleanly without breaking the game loop.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST present a title screen showing the "NOVA DRIFT" logo, a start prompt, and a top-10 leaderboard before gameplay begins.
- **FR-002**: The player MUST control a ship that can rotate left/right, thrust forward, and fire projectiles using keyboard input (arrow keys + Space).
- **FR-003**: Asteroids MUST spawn at screen edges, drift inward, and split on destruction (large → 2 medium, medium → 2 small, small → destroyed).
- **FR-004**: The ship and all entities MUST wrap seamlessly around screen edges (toroidal topology).
- **FR-005**: Collision between the ship and an asteroid or enemy projectile MUST deduct one life; zero lives MUST trigger game over.
- **FR-006**: The player MUST start with 3 lives and earn an extra life every 10 000 points.
- **FR-007**: Scoring MUST follow defined point values (Large 20, Medium 50, Small 100, Large saucer 200, Small saucer 1 000) and apply the current combo multiplier.
- **FR-008**: A combo multiplier (×1 to ×8) MUST increase on kills within 2 seconds and reset after 2 seconds of no kills.
- **FR-009**: Power-ups MUST spawn with a 15 % chance when medium or small asteroids are destroyed, last 8 seconds when collected, and despawn after 6 seconds if uncollected.
- **FR-010**: The game MUST support four power-up types: Rapid Fire, Shield, Triple Shot, and Speed Boost, with only one offensive type active at a time.
- **FR-011**: The HUD MUST display current score, high score, lives remaining, active power-up with timer bar, and current level number.
- **FR-012**: The game MUST support pause (Escape key) with a translucent overlay showing Resume and Quit options.
- **FR-013**: High scores MUST persist across browser sessions and populate a top-10 leaderboard on the title screen.
- **FR-014**: Enemy saucers MUST appear starting at level 3, move across the screen, and fire projectiles toward the player.
- **FR-015**: The game loop MUST use a fixed-timestep update (60 ticks/s) decoupled from the render cycle via `requestAnimationFrame`.
- **FR-016**: All visuals MUST use a neon-glow vector aesthetic with particle explosions and thrust flame effects on a dark background.
- **FR-017**: The game MUST auto-pause when the browser tab loses visibility.
- **FR-018**: The game MUST run without any build step — opening `index.html` in a browser starts the game.

### Key Entities

- **Ship**: The player's vessel; attributes include position, velocity, rotation, lives remaining, active power-ups, and invulnerability timer (brief grace period after losing a life).
- **Asteroid**: A destructible obstacle; attributes include position, velocity, rotation speed, size category (large/medium/small), and point value.
- **Projectile**: A bullet fired by the ship or a saucer; attributes include position, velocity, owner (player or enemy), and lifespan.
- **Power-Up**: A collectible item; attributes include position, type (Rapid Fire / Shield / Triple Shot / Speed Boost), remaining time-to-despawn, and visual identifier.
- **Saucer**: An enemy entity; attributes include position, velocity, size (large/small), point value, and fire cooldown timer.
- **Particle**: A short-lived visual effect element; attributes include position, velocity, colour, opacity, and remaining lifespan.
- **Score Entry**: A leaderboard record; attributes include player score, level reached, and date achieved.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new player can start a game within 3 seconds of the page finishing loading.
- **SC-002**: The game maintains 60 fps with no visible frame drops during gameplay with up to 20 asteroids, 10 projectiles, and 50 particles on screen simultaneously.
- **SC-003**: 90 % of first-time players can figure out controls and destroy at least one asteroid within 30 seconds without external instructions.
- **SC-004**: The complete page load (HTML + JS + CSS) is under 500 KB uncompressed.
- **SC-005**: The game functions identically in the latest stable releases of Chrome, Firefox, Edge, and Safari on both desktop and mobile.
- **SC-006**: High scores persist correctly across at least 10 consecutive browser sessions (close tab, reopen, verify leaderboard).
- **SC-007**: All four power-up types activate correctly with their described effects and last the specified duration (8 seconds ±0.5 s).
- **SC-008**: The combo multiplier correctly escalates through ×2 … ×8 on rapid kills and resets to ×1 after a 2-second idle window.
- **SC-009**: Enemy saucers first appear at level 3 and fire projectiles that can damage the player.
- **SC-010**: The pause overlay halts all game state updates and resumes without any state corruption or entity teleportation.

## Assumptions

- **Game name**: The in-game display name is **NOVA DRIFT**. The repository/project folder remains `spaceShooter` for internal use.
- **Single player only**: No multiplayer, networking, or online leaderboard in the MVP.
- **No audio in MVP**: Sound effects via Web Audio API are a stretch goal; the MVP ships silent.
- **No mobile-optimised touch controls in MVP**: Touch input (virtual joystick) is deferred; keyboard controls are sufficient for the first release.
- **No gamepad support in MVP**: Gamepad API integration is deferred to a future feature.
- **Saucer AI is simple**: Saucers fly in a straight line with periodic random direction changes and fire toward the player's last known position — no pathfinding.
- **Leaderboard is local only**: Scores are stored in `localStorage`; no server-side persistence.
- **Canvas sizing**: The game Canvas defaults to 1024 × 768 logical pixels, scaled to fit the browser window while maintaining aspect ratio.
