import {
  createNormalizationPlan,
  printReportSummary,
  validateNormalization,
  writeNormalizationOutputs,
} from './lib.mjs';

const plan = await createNormalizationPlan();
await writeNormalizationOutputs(plan);
const validation = await validateNormalization();
printReportSummary(validation.report);

if (!validation.passed) {
  console.error(JSON.stringify(validation.errors, null, 2));
  process.exitCode = 1;
}
