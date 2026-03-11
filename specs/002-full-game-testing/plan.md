# Implementation Plan: Full Game Validation Suite

**Branch**: `002-full-game-testing` | **Date**: 2026-03-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-full-game-testing/spec.md`

## Summary

Define and implement a repeatable, developer-friendly validation suite for the already-built NOVA DRIFT game. The plan combines deterministic automated checks (unit-level and data-format checks) with a structured manual gameplay validation workflow and standardized result reporting so regressions can be detected quickly between builds.

## Technical Context

**Language/Version**: JavaScript ES2020+ and Markdown documentation  
**Primary Dependencies**: Existing game modules under `src/`; lightweight JS test runner (Vitest or browser harness)  
**Storage**: Local filesystem for test reports and baselines; browser `localStorage` validation for leaderboard behavior  
**Testing**: Automated JS checks + structured manual validation checklist  
**Target Platform**: Desktop browsers (Chrome, Firefox, Edge, Safari) and local developer machine  
**Project Type**: Single-page browser game with validation assets  
**Performance Goals**: Full validation run ≤30 minutes; report generation ≤1 minute after run completion  
**Constraints**: No game-engine/framework adoption; preserve current runtime behavior while adding validation coverage; support single-developer execution  
**Scale/Scope**: Validate all currently shipped systems (core loop, advanced mechanics, persistence, state transitions) with one baseline-comparable report format

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Game Loop Architecture | ✅ PASS | Validation suite explicitly includes fixed-timestep behavior and state transition checks (play/pause/resume/game-over). |
| II | Responsive Controls | ✅ PASS | Validation includes keyboard latency and pause/control responsiveness checks; touch support verification is documented as part of coverage review. |
| III | Core Game Rules | ✅ PASS | Core gameplay validation scenarios cover movement, firing, splitting, wrap, lives, and level progression. |
| IV | Scoring & Progression | ✅ PASS | Scoring, combo, extra life, and leaderboard persistence are in test scope with explicit expected outcomes. |
| V | Power-Up System | ✅ PASS | All four power-ups, durations, replacement/stacking, and despawn rules are included in validation matrix. |
| VI | UI & Visual Design | ✅ PASS | Title/pause/game-over/HUD visibility and consistency are validated as user-facing checkpoints. |
| VII | Browser Performance | ✅ PASS | Validation includes functional pass across target browsers and performance sanity criteria from the current constitution. |

**Gate result**: ✅ PASS — no constitutional violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/002-full-game-testing/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── validation-report.schema.json
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── ...existing game modules...

tests/
├── unit/
│   ├── physics.test.js
│   ├── scoring.test.js
│   ├── spawner.test.js
│   └── power-up-manager.test.js
├── integration/
│   └── gameplay-validation.checklist.md
└── reports/
    ├── baseline/
    └── runs/
```

**Structure Decision**: Use the existing single-project layout and add validation assets under `tests/` with report schemas/contracts in the feature spec folder. This minimizes disruption while making regression outputs standardized and comparable.

## Complexity Tracking

No constitution violations requiring justification.

## Post-Design Constitution Re-Check

*Re-evaluation after Phase 1 design artifacts (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`).*

| # | Principle | Status | Design Evidence |
|---|-----------|--------|-----------------|
| I | Game Loop Architecture | ✅ PASS | Data model includes explicit validation scenarios for pause/resume/tick-stability and loop-state transitions. |
| II | Responsive Controls | ✅ PASS | Contracts include deterministic scenario result schema with control response checkpoints; quickstart defines repeatable input tests. |
| III | Core Game Rules | ✅ PASS | Validation entities map all core mechanics to pass/fail checks and defect records. |
| IV | Scoring & Progression | ✅ PASS | Report schema and run model include scoring/combo/extra-life and leaderboard persistence outcomes. |
| V | Power-Up System | ✅ PASS | Scenario catalog includes all power-up types and interactions (replace/stack/timeout/despawn). |
| VI | UI & Visual Design | ✅ PASS | Checklist requires title/pause/game-over/HUD validation under real gameplay flow. |
| VII | Browser Performance | ✅ PASS | Quickstart defines multi-browser execution and baseline comparison workflow for regression review. |

**Post-design gate result**: ✅ PASS.

## Generated Artifacts

| Artifact | Path | Phase |
|----------|------|-------|
| Research | `specs/002-full-game-testing/research.md` | Phase 0 |
| Data Model | `specs/002-full-game-testing/data-model.md` | Phase 1 |
| Contract | `specs/002-full-game-testing/contracts/validation-report.schema.json` | Phase 1 |
| Quickstart | `specs/002-full-game-testing/quickstart.md` | Phase 1 |
| Agent Context | `.github/agents/copilot-instructions.md` | Phase 1 |
