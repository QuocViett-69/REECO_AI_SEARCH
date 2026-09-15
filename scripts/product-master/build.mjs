import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  buildProductMaster,
  masterPath,
  preserveGeneratedAtWhenUnchanged,
  printValidationSummary,
  readJson,
  reportPath,
  validateProductMaster,
  writeJson,
} from './lib.mjs';

const result = await buildProductMaster();
let previousReport = null;
try {
  previousReport = await readJson(reportPath);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const report = preserveGeneratedAtWhenUnchanged(
  await validateProductMaster(result.products, result),
  previousReport,
);

await mkdir(path.dirname(masterPath), { recursive: true });
await mkdir(path.dirname(reportPath), { recursive: true });
await writeJson(masterPath, result.products);
await writeJson(reportPath, report);

printValidationSummary(report);
if (report.validation_status === 'failed') process.exitCode = 1;
