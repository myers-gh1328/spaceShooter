export function normalizeStatus(status) {
  const normalized = String(status).trim().toLowerCase();
  if (!['pass', 'fail', 'blocked'].includes(normalized)) {
    throw new Error(`Unsupported status: ${status}`);
  }
  return normalized;
}

export function calculateSummary(results) {
  return results.reduce((summary, result) => {
    const status = normalizeStatus(result.status);
    summary[status] += 1;
    summary.total += 1;
    return summary;
  }, { total: 0, pass: 0, fail: 0, blocked: 0 });
}

export function linkDefects(results, defects) {
  const byScenario = defects.reduce((map, defect) => {
    if (!map.has(defect.scenarioId)) map.set(defect.scenarioId, []);
    map.get(defect.scenarioId).push(defect.id);
    return map;
  }, new Map());

  return results.map((result) => ({
    ...result,
    status: normalizeStatus(result.status),
    defectIds: result.defectIds?.length ? result.defectIds : (byScenario.get(result.scenarioId) ?? []),
  }));
}

export function createRunMetadata({ buildRef, os, browser, notes = '' }) {
  return {
    runId: `run-${Date.now()}`,
    timestamp: new Date().toISOString(),
    buildRef,
    environment: { os, browser, notes },
  };
}
