# Research: Full Game Validation Suite

**Feature**: `002-full-game-testing`  
**Date**: 2026-03-10

---

## 1) Validation Strategy (Automation + Manual)

**Decision**: Use a hybrid validation strategy: deterministic automated checks for stable logic and structured manual gameplay checks for end-to-end UX behavior.

**Rationale**: The current game is interactive and timing-sensitive. Full automation of all gameplay states would be costly and brittle. A hybrid approach gives fast regression confidence while preserving practical coverage for visual and interaction flows.

**Alternatives considered**:
- Fully manual only: rejected due to low repeatability and weak regression signal.
- Fully automated browser E2E only: rejected due to high maintenance and flakiness with randomness/timing.

---

## 2) Nondeterminism Handling

**Decision**: Treat randomness-sensitive checks as controlled scenarios with explicit retry policy and deterministic acceptance conditions.

**Rationale**: Power-up and saucer events depend on random timing/spawn chance. Strict single-run assertions would create false negatives. A bounded retry policy and scenario-specific pass criteria preserve reliability.

**Alternatives considered**:
- Ignore random-dependent systems: rejected because it leaves major mechanics unvalidated.
- Require hard deterministic RNG injection for all tests immediately: rejected as high refactor cost for current version.

---

## 3) Report Contract

**Decision**: Standardize test output as a JSON report schema with run metadata, per-scenario outcomes, defects, and summary metrics.

**Rationale**: Comparable, structured output is essential for regression reviews and baseline diffing. A schema also prevents missing fields and inconsistent reporting.

**Alternatives considered**:
- Free-form markdown report: rejected due to poor machine comparison.
- CSV only: rejected due to limited nested defect/run context.

---

## 4) Baseline Comparison

**Decision**: Store a baseline report and compare future runs using scenario IDs and status deltas.

**Rationale**: Baseline diffing provides immediate regression visibility without over-engineering a full analytics pipeline.

**Alternatives considered**:
- No baseline, per-run only: rejected because regressions become harder to detect quickly.
- Full dashboard system: rejected as out of scope for this feature.

---

## 5) Test Scope Prioritization

**Decision**: Prioritize coverage in this order: core loop → advanced mechanics → reporting fidelity.

**Rationale**: Failures in core loop invalidate downstream confidence; advanced mechanics then provide gameplay depth assurance; reporting quality ensures repeatability across releases.

**Alternatives considered**:
- Equal-priority all-at-once scope: rejected because it slows delivery of actionable confidence.

---

## 6) Browser Coverage Execution

**Decision**: Require at least one primary run (Chrome) for each change and periodic cross-browser validation runs (Firefox/Edge/Safari) for baseline updates.

**Rationale**: Balances speed and compatibility while honoring constitution browser requirements.

**Alternatives considered**:
- Full 4-browser run on every change: rejected for excessive cycle time.
- Single browser only forever: rejected for compatibility risk.
