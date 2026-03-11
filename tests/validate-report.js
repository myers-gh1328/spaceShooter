import fs from 'node:fs';

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateReportData(report) {
  const errors = [];
  const required = ['runId', 'timestamp', 'buildRef', 'environment', 'results', 'defects', 'summary', 'durationMin'];

  for (const key of required) {
    if (!(key in report)) errors.push(`Missing required field: ${key}`);
  }

  if (!isObject(report.environment)) {
    errors.push('environment must be an object');
  } else {
    if (!report.environment.os) errors.push('environment.os is required');
    if (!report.environment.browser) errors.push('environment.browser is required');
  }

  if (!Array.isArray(report.results)) {
    errors.push('results must be an array');
  }

  if (!Array.isArray(report.defects)) {
    errors.push('defects must be an array');
  }

  if (!isObject(report.summary)) {
    errors.push('summary must be an object');
  }

  const defectIds = new Set(Array.isArray(report.defects) ? report.defects.map((d) => d.id) : []);

  if (Array.isArray(report.results)) {
    report.results.forEach((result, index) => {
      if (!result.scenarioId) errors.push(`results[${index}].scenarioId is required`);
      if (!['pass', 'fail', 'blocked'].includes(result.status)) errors.push(`results[${index}].status is invalid`);
      if (typeof result.observed !== 'string') errors.push(`results[${index}].observed must be a string`);
      if (!Number.isFinite(result.durationSec) || result.durationSec < 0) errors.push(`results[${index}].durationSec must be a non-negative number`);
      if (!Number.isInteger(result.attempts) || result.attempts < 1) errors.push(`results[${index}].attempts must be an integer >= 1`);
      if (!Array.isArray(result.defectIds)) errors.push(`results[${index}].defectIds must be an array`);

      if (result.status === 'fail' && (!Array.isArray(result.defectIds) || result.defectIds.length === 0)) {
        errors.push(`results[${index}] failing scenarios must link at least one defect`);
      }
      if (result.status === 'blocked' && (!result.notes || !String(result.notes).trim())) {
        errors.push(`results[${index}] blocked scenarios must include notes`);
      }
      if (Array.isArray(result.defectIds)) {
        result.defectIds.forEach((id) => {
          if (!defectIds.has(id)) errors.push(`results[${index}] references unknown defect id: ${id}`);
        });
      }
    });
  }

  if (Array.isArray(report.defects)) {
    report.defects.forEach((defect, index) => {
      if (!defect.id) errors.push(`defects[${index}].id is required`);
      if (!defect.scenarioId) errors.push(`defects[${index}].scenarioId is required`);
      if (!['critical', 'high', 'medium', 'low'].includes(defect.severity)) errors.push(`defects[${index}].severity is invalid`);
      if (!defect.expected) errors.push(`defects[${index}].expected is required`);
      if (!defect.observed) errors.push(`defects[${index}].observed is required`);
      if (!Array.isArray(defect.reproSteps) || defect.reproSteps.length === 0) errors.push(`defects[${index}].reproSteps must contain at least one step`);
      if (!['open', 'fixed', 'verified'].includes(defect.state)) errors.push(`defects[${index}].state is invalid`);
    });
  }

  if (isObject(report.summary)) {
    const total = report.summary.pass + report.summary.fail + report.summary.blocked;
    if (report.summary.total !== total) {
      errors.push(`summary.total must equal pass + fail + blocked (${total})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node tests/validate-report.js <report-path>');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const validation = validateReportData(report);
  if (!validation.valid) {
    validation.errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  console.log('Report is valid.');
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}
