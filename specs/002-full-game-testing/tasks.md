# Tasks: Full Game Validation Suite

**Input**: Design documents from `/specs/002-full-game-testing/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included — this feature explicitly exists to create full test coverage and repeatable validation for the current game version.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the test-suite skeleton, execution entry points, and shared helpers used by all validation work.

- [X] T001 Create test/report directory structure: `tests/unit/`, `tests/integration/`, `tests/reports/baseline/`, and `tests/reports/runs/`
- [X] T002 Create `package.json` with scripts for unit tests, report validation, and baseline comparison
- [X] T003 [P] Create `tests/harness.js` with shared assertion, fixture, and stub helpers for validation utilities and unit tests

**Checkpoint**: The repository has a runnable validation skeleton with shared test utilities and output folders.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core validation infrastructure that MUST exist before any user-story-specific testing work can be completed.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Create `tests/integration/validation-scenarios.json` mapping all current game systems to stable scenario IDs and expected outcomes
- [X] T005 [P] Implement `tests/validate-report.js` to validate run artifacts against `specs/002-full-game-testing/contracts/validation-report.schema.json`
- [X] T006 [P] Implement `tests/report-utils.js` for run metadata, summary calculation, defect linking, and status normalization
- [X] T007 [P] Implement `tests/compare-runs.js` to diff `tests/reports/runs/*.json` against `tests/reports/baseline/latest.json`
- [X] T008 Create `tests/integration/defect-template.md` for standardized failure capture with repro steps, expected behavior, and observed behavior

**Checkpoint**: Validation scenarios, report validation, baseline comparison, and defect recording infrastructure are ready.

---

## Phase 3: User Story 1 - Validate Core Gameplay Loop (Priority: P1) 🎯 MVP

**Goal**: A developer can verify the full core gameplay loop with deterministic automated checks plus a repeatable manual checklist.

**Independent Test**: Run the unit checks for collision/wrapping and loop timing, then execute the core gameplay checklist and generate a core-loop report showing title, play, pause, level progression, life loss, and game-over outcomes.

### Tests for User Story 1

- [ ] T009 [P] [US1] Add collision and wrapping regression tests in `tests/unit/physics.test.js`
- [ ] T010 [P] [US1] Add fixed-timestep and pause/resume regression tests in `tests/unit/loop.test.js`
- [ ] T011 [P] [US1] Add input edge-detection regression tests in `tests/unit/input.test.js`

### Implementation for User Story 1

- [ ] T012 [US1] Create `tests/integration/core-gameplay.checklist.md` covering title, start, move, shoot, asteroid split, level clear, life loss, pause, and game-over
- [ ] T013 [US1] Add core gameplay scenario entries to `tests/integration/validation-scenarios.json`
- [ ] T014 [US1] Create `tests/reports/baseline/core-gameplay-baseline.json` with baseline scenario statuses for core loop checks
- [ ] T015 [US1] Create `tests/reports/runs/core-gameplay-report.example.json` as a canonical completed run example for core-loop validation

**Checkpoint**: The core game loop can be validated independently with repeatable automated checks and a documented manual runbook.

---

## Phase 4: User Story 2 - Validate Advanced Mechanics (Priority: P2)

**Goal**: A developer can verify advanced systems — scoring, power-ups, saucers, persistence, and pause/visibility behavior — without relying on ad hoc playtesting.

**Independent Test**: Run the advanced unit tests and execute the advanced mechanics checklist to verify combo rules, extra lives, power-up behavior, saucer behavior, visibility pause, and leaderboard persistence.

### Tests for User Story 2

- [ ] T016 [P] [US2] Add scoring and extra-life regression tests in `tests/unit/scoring.test.js`
- [ ] T017 [P] [US2] Add power-up activation, replacement, and expiry tests in `tests/unit/power-up-manager.test.js`
- [ ] T018 [P] [US2] Add saucer/power-up spawn rule tests in `tests/unit/spawner.test.js`
- [ ] T019 [P] [US2] Add leaderboard persistence tests in `tests/unit/leaderboard.test.js`

### Implementation for User Story 2

- [ ] T020 [US2] Create `tests/integration/advanced-mechanics.checklist.md` for combo, extra life, power-ups, saucers, visibility pause, and localStorage validation
- [ ] T021 [US2] Add advanced mechanic scenario entries to `tests/integration/validation-scenarios.json`
- [ ] T022 [US2] Create `tests/reports/baseline/advanced-mechanics-baseline.json` with baseline expectations for advanced systems
- [ ] T023 [US2] Create `tests/reports/runs/advanced-mechanics-report.example.json` as a canonical completed run example for advanced validation

**Checkpoint**: Advanced gameplay systems can be validated independently with explicit expected outcomes and baseline fixtures.

---

## Phase 5: User Story 3 - Produce a Repeatable Test Report (Priority: P3)

**Goal**: A developer can generate, validate, compare, and archive structured run reports for the current build and future regression checks.

**Independent Test**: Generate a full validation report, validate it against the schema, compare it to the baseline, and confirm the report includes summary counts and defect links.

### Tests for User Story 3

- [ ] T024 [P] [US3] Add schema contract tests for report structure in `tests/unit/validation-report-schema.test.js`
- [ ] T025 [P] [US3] Add baseline diff classification tests in `tests/unit/compare-runs.test.js`
- [ ] T026 [P] [US3] Add summary/defect-linking utility tests in `tests/unit/report-utils.test.js`

### Implementation for User Story 3

- [ ] T027 [US3] Create `tests/reports/runs/validation-report.template.json` with all required fields and placeholder scenario results
- [ ] T028 [US3] Create `tests/reports/baseline/latest.json` as the aggregate baseline reference for comparison runs
- [ ] T029 [US3] Create `tests/integration/reporting-workflow.md` documenting run creation, schema validation, baseline comparison, and defect logging
- [ ] T030 [US3] Create `tests/reports/runs/sample-validation-report.json` as a complete end-to-end sample report exercising pass, fail, and blocked states

**Checkpoint**: Validation reporting is repeatable, schema-backed, and comparable against a stable baseline.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize usability, documentation, and end-to-end validation across the entire suite.

- [ ] T031 [P] Create `tests/README.md` with suite layout, command usage, and report file conventions
- [ ] T032 [P] Update `specs/002-full-game-testing/quickstart.md` with final commands, report locations, and baseline comparison workflow
- [ ] T033 Run the full validation workflow and save the final verified output in `tests/reports/runs/final-dry-run.json`
- [ ] T034 Verify scenario IDs, schema requirements, baseline files, and documentation are consistent across `tests/` and `specs/002-full-game-testing/`

**Checkpoint**: The validation suite is executable, documented, and ready for ongoing regression use.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) and reuses the shared scenario/report infrastructure
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) and consumes scenario IDs plus baseline artifacts from US1/US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

```text
Phase 1 (Setup)
  └─▶ Phase 2 (Foundational)
        ├─▶ Phase 3 (US1: Core Gameplay Validation)
        ├─▶ Phase 4 (US2: Advanced Mechanics Validation)
        └─▶ Phase 5 (US3: Repeatable Reporting)
              └─▶ Phase 6 (Polish)
```

### Within Each User Story

- Tests are written before supporting implementation artifacts in the same story
- Scenario/checklist files are authored before baseline/example reports
- Baseline artifacts are created before final comparison and dry-run tasks

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel after T001
- **Phase 2**: T005, T006, and T007 can run in parallel after T004 defines scenario IDs
- **Phase 3**: T009, T010, and T011 can run in parallel; T012 and T013 follow; T014 and T015 are sequential after scenario/checklist completion
- **Phase 4**: T016–T019 can run in parallel; T020 and T021 follow; T022 and T023 follow those
- **Phase 5**: T024–T026 can run in parallel; T027 and T028 can run in parallel after the tests; T029 and T030 follow
- **Phase 6**: T031 and T032 can run in parallel; T033 and T034 follow

---

## Parallel Example: User Story 2

```text
Parallel batch:
  T016  tests/unit/scoring.test.js
  T017  tests/unit/power-up-manager.test.js
  T018  tests/unit/spawner.test.js
  T019  tests/unit/leaderboard.test.js

Sequential after batch:
  T020  tests/integration/advanced-mechanics.checklist.md
  T021  tests/integration/validation-scenarios.json
  T022  tests/reports/baseline/advanced-mechanics-baseline.json
  T023  tests/reports/runs/advanced-mechanics-report.example.json
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run the core gameplay checklist and unit tests only
5. Use the core gameplay report as the first confidence baseline

### Incremental Delivery

1. Setup + Foundational → validation infrastructure ready
2. Add US1 → core gameplay verification available
3. Add US2 → advanced systems verification available
4. Add US3 → repeatable report generation and baseline diffing available
5. Finish Polish → suite is documented and ready for regular use

### Parallel Team Strategy

With multiple developers after Phase 2:

1. Developer A: Phase 3 (US1)
2. Developer B: Phase 4 (US2)
3. Developer C: Phase 5 (US3)
4. Merge in Phase 6 for final dry run and consistency checks

---

## Notes

- [P] tasks = different files with no dependency conflicts
- This feature explicitly requests testing work, so test tasks are included by design
- `tests/integration/validation-scenarios.json` is the central traceability file for the suite
- Baseline files are split by concern first, then aggregated into `tests/reports/baseline/latest.json`
- Final dry-run execution is deferred to Phase 6 so all report and comparison tools are available
