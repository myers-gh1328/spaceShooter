import fs from 'node:fs';

function indexResults(results) {
  return new Map(results.map((result) => [result.scenarioId, result.status]));
}

export function compareRuns(baseline, current) {
  const base = indexResults(baseline.results ?? []);
  const next = indexResults(current.results ?? []);

  const regressions = [];
  const fixes = [];
  const unchangedFailures = [];
  const newCoverage = [];

  for (const [scenarioId, nextStatus] of next.entries()) {
    const baseStatus = base.get(scenarioId);
    if (baseStatus === undefined) {
      newCoverage.push(scenarioId);
      continue;
    }
    if (baseStatus === 'pass' && nextStatus !== 'pass') regressions.push(scenarioId);
    if (baseStatus !== 'pass' && nextStatus === 'pass') fixes.push(scenarioId);
    if (baseStatus === 'fail' && nextStatus === 'fail') unchangedFailures.push(scenarioId);
  }

  return {
    baselineRunId: baseline.runId,
    currentRunId: current.runId,
    regressions,
    fixes,
    unchangedFailures,
    newCoverage,
  };
}

function main() {
  const [baselinePath, currentPath] = process.argv.slice(2);
  if (!baselinePath || !currentPath) {
    console.error('Usage: node tests/compare-runs.js <baseline-report> <current-report>');
    process.exit(1);
  }

  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
  console.log(JSON.stringify(compareRuns(baseline, current), null, 2));
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}
