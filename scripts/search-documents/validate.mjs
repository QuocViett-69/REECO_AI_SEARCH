import {
  printSearchDocumentSummary,
  validateSearchDocuments,
} from './lib.mjs';

const validation = await validateSearchDocuments();
printSearchDocumentSummary(validation.report);

if (!validation.passed) {
  console.error(JSON.stringify(validation.errors, null, 2));
  process.exitCode = 1;
}
