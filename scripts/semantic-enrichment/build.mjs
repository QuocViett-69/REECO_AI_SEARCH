import {
  createEnrichmentPlan,
  printSemanticSummary,
  writeEnrichmentOutputs,
} from './lib.mjs';

const plan = await createEnrichmentPlan();
await writeEnrichmentOutputs(plan);
printSemanticSummary(plan.report);

if (plan.report.validation_status === 'failed') process.exitCode = 1;
