import test from 'node:test';
import { compareRuns } from '../compare-runs.js';
import { assert } from '../harness.js';

test('compareRuns detects regressions and fixes', () => {
  const baseline = {
    runId: 'base',
    results: [
      { scenarioId: 'A', status: 'pass' },
      { scenarioId: 'B', status: 'fail' },
    ],
  };
  const current = {
    runId: 'current',
    results: [
      { scenarioId: 'A', status: 'fail' },
      { scenarioId: 'B', status: 'pass' },
      { scenarioId: 'C', status: 'pass' },
    ],
  };

  const comparison = compareRuns(baseline, current);
  assert.deepEqual(comparison.regressions, ['A']);
  assert.deepEqual(comparison.fixes, ['B']);
  assert.deepEqual(comparison.newCoverage, ['C']);
});
