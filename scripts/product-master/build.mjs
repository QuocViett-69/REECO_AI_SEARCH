import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  buildProductMaster,
  masterPath,
  printValidationSummary,
  reportPath,
  validateProductMaster,
  writeJson,
} from './lib.mjs';

const result = await buildProductMaster();
const report = await validateProductMaster(result.products, result);

await mkdir(path.dirname(masterPath), { recursive: true });
await mkdir(path.dirname(reportPath), { recursive: true });
await writeJson(masterPath, result.products);
await writeJson(reportPath, report);

printValidationSummary(report);
if (report.validation_status === 'failed') process.exitCode = 1;
