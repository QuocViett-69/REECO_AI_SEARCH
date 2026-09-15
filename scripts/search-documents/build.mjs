import {
  createSearchDocumentPlan,
  printSearchDocumentSummary,
  writeSearchDocumentOutputs,
} from './lib.mjs';

const plan = await createSearchDocumentPlan();
await writeSearchDocumentOutputs(plan);
printSearchDocumentSummary(plan.report);

if (plan.report.validation_status === 'failed') process.exitCode = 1;
