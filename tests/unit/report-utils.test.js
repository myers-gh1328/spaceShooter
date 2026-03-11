import test from 'node:test';
import { calculateSummary, linkDefects, normalizeStatus } from '../report-utils.js';
import { assert } from '../harness.js';

test('normalizeStatus lowercases valid statuses', () => {
  assert.equal(normalizeStatus('PASS'), 'pass');
});

test('calculateSummary counts statuses', () => {
  const summary = calculateSummary([
    { status: 'pass' },
    { status: 'fail' },
    { status: 'blocked' },
  ]);
  assert.deepEqual(summary, { total: 3, pass: 1, fail: 1, blocked: 1 });
});

test('linkDefects connects scenario results to defects', () => {
  const linked = linkDefects(
    [{ scenarioId: 'A', status: 'fail', defectIds: [] }],
    [{ id: 'DEF-1', scenarioId: 'A' }],
  );
  assert.deepEqual(linked[0].defectIds, ['DEF-1']);
});
