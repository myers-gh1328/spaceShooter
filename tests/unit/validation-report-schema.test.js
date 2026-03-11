import test from 'node:test';
import { validateReportData } from '../validate-report.js';
import { assert } from '../harness.js';

const validReport = {
  runId: 'run-1',
  timestamp: '2026-03-10T12:00:00.000Z',
  buildRef: '002-full-game-testing',
  environment: { os: 'Windows', browser: 'Chrome' },
  results: [{ scenarioId: 'CORE-TITLE-001', status: 'pass', observed: 'ok', durationSec: 5, attempts: 1, defectIds: [] }],
  defects: [],
  summary: { total: 1, pass: 1, fail: 0, blocked: 0 },
  durationMin: 1,
};

test('validateReportData accepts valid report', () => {
  const result = validateReportData(validReport);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateReportData rejects invalid summary', () => {
  const result = validateReportData({ ...validReport, summary: { total: 2, pass: 1, fail: 0, blocked: 0 } });
  assert.equal(result.valid, false);
});
