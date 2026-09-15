import { printSemanticSummary, validateEnrichment } from './lib.mjs';

const validation = await validateEnrichment();
printSemanticSummary(validation.report);

if (!validation.passed) {
  console.error(JSON.stringify(validation.errors, null, 2));
  process.exitCode = 1;
}
