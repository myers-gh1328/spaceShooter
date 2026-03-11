# Reporting Workflow

1. Execute the relevant checklist and collect scenario outcomes.
2. Record each scenario as `pass`, `fail`, or `blocked`.
3. For failures, create one or more defect records from `tests/integration/defect-template.md`.
4. Save a JSON report in `tests/reports/runs/`.
5. Validate it with:
   - `npm run validate:report -- tests/reports/runs/<report>.json`
6. Compare it to baseline with:
   - `npm run compare:runs -- tests/reports/baseline/latest.json tests/reports/runs/<report>.json`
7. Review regressions, fixes, and unchanged failures.
