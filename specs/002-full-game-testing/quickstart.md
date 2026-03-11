# Quickstart: Full Game Validation Suite

**Feature**: `002-full-game-testing`

---

## Purpose

Run a complete validation pass against the current NOVA DRIFT build and produce a baseline-comparable report.

---

## Prerequisites

- Local repo checked out on branch `002-full-game-testing`
- Node.js installed (for local static serving)
- At least one supported browser (Chrome recommended for primary run)

---

## 1) Start the game locally

From repo root:

```bash
npx serve -l 5000 .
```

Open `http://localhost:5000`.

---

## 2) Execute validation flow

Run scenarios in this order:

1. Core loop checks (title → start → play → pause/resume → game-over)
2. Core mechanics checks (movement, shooting, asteroid splitting, level progression)
3. Advanced checks (power-ups, saucers, combo/extra-life, visibility pause)
4. Persistence checks (`localStorage` leaderboard behavior)

Record each scenario as `pass`, `fail`, or `blocked` with notes.

---

## 3) Capture defects for failures

For each failing scenario, include:

- reproduction steps,
- expected behavior,
- observed behavior,
- severity.

---

## 4) Produce run report

Create a run artifact in JSON format conforming to:

- `specs/002-full-game-testing/contracts/validation-report.schema.json`

Recommended output location:

- `tests/reports/runs/<timestamp>-report.json`

---

## 5) Compare with baseline

Compare current run with baseline and classify:

- regressions,
- fixes,
- unchanged failures,
- new coverage.

Recommended baseline location:

- `tests/reports/baseline/latest.json`

---

## 6) Completion criteria

A run is considered complete when:

- all planned scenarios have a final status,
- all failures include a defect record,
- summary counts are internally consistent,
- baseline comparison is recorded.
