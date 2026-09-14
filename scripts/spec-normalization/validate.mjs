import { printReportSummary, validateNormalization } from './lib.mjs';

const validation = await validateNormalization();
printReportSummary(validation.report);

if (!validation.passed) {
  console.error(JSON.stringify(validation.errors, null, 2));
  process.exitCode = 1;
}
