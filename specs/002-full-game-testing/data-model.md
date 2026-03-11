# Data Model: Full Game Validation Suite

**Feature**: `002-full-game-testing`  
**Date**: 2026-03-10

---

## Entities

### ValidationScenario

Represents one testable behavior checkpoint.

| Field | Type | Description |
|---|---|---|
| `id` | string | Stable identifier, e.g., `CORE-PAUSE-001` |
| `story` | string | Linked user story (`P1`, `P2`, `P3`) |
| `title` | string | Short scenario name |
| `preconditions` | string[] | Required setup conditions |
| `steps` | string[] | Execution steps |
| `expected` | string | Observable expected outcome |
| `priority` | string | Severity/importance of scenario |
| `tags` | string[] | Grouping labels: `core`, `powerup`, `saucer`, etc. |

**Validation rules**:
- `id` must be unique across suite.
- `expected` must be observable and testable.

---

### ScenarioResult

Outcome of one scenario in a given run.

| Field | Type | Description |
|---|---|---|
| `scenarioId` | string | Reference to `ValidationScenario.id` |
| `status` | enum | `pass` \| `fail` \| `blocked` |
| `observed` | string | What actually occurred |
| `durationSec` | number | Time spent executing scenario |
| `attempts` | number | Number of attempts used (for random-sensitive checks) |
| `notes` | string | Optional tester notes |
| `defectIds` | string[] | Linked defects for failures |

**Validation rules**:
- `status=fail` requires at least one linked defect.
- `status=blocked` requires blocking reason in `notes`.

---

### DefectRecord

Captures an actionable failure from validation.

| Field | Type | Description |
|---|---|---|
| `id` | string | Defect identifier |
| `scenarioId` | string | Scenario that failed |
| `severity` | enum | `critical` \| `high` \| `medium` \| `low` |
| `expected` | string | Expected behavior |
| `observed` | string | Observed behavior |
| `reproSteps` | string[] | Deterministic reproduction steps |
| `state` | enum | `open` \| `fixed` \| `verified` |

**Validation rules**:
- `reproSteps` must contain at least one step.
- `expected` and `observed` cannot be empty.

---

### TestRun

Top-level execution record.

| Field | Type | Description |
|---|---|---|
| `runId` | string | Unique run identifier |
| `timestamp` | string | ISO-8601 run time |
| `buildRef` | string | Git branch/commit reference |
| `environment` | object | Browser, OS, hardware notes |
| `results` | ScenarioResult[] | All scenario outcomes |
| `defects` | DefectRecord[] | Defects found in run |
| `summary` | object | Counts: total/pass/fail/blocked |
| `durationMin` | number | Total run duration |

**Validation rules**:
- `summary.total = pass + fail + blocked`.
- Every `results.scenarioId` must map to a known scenario.

---

### BaselineComparison

Diff between baseline and current run.

| Field | Type | Description |
|---|---|---|
| `baselineRunId` | string | Reference baseline run |
| `currentRunId` | string | Current run |
| `regressions` | string[] | Scenario IDs that moved pass→fail/blocked |
| `fixes` | string[] | Scenario IDs that moved fail→pass |
| `unchangedFailures` | string[] | Persistent failures |
| `newCoverage` | string[] | New scenarios not in baseline |

**Validation rules**:
- Scenario IDs in comparison lists must exist in at least one run.

---

## Relationships

- `ValidationScenario (1) -> (many) ScenarioResult`
- `ScenarioResult (0..many) -> (many) DefectRecord`
- `TestRun (1) -> (many) ScenarioResult`
- `TestRun (1) -> (many) DefectRecord`
- `BaselineComparison` references two `TestRun` records.
