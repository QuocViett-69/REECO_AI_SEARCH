import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  masterPath,
  printValidationSummary,
  readJson,
  reportPath,
  validateProductMaster,
  writeJson,
} from './lib.mjs';

const products = await readJson(masterPath);
if (!Array.isArray(products))
  throw new TypeError(
    'data/master/product-master.json must contain a JSON array.',
  );

const report = await validateProductMaster(products);
await mkdir(path.dirname(reportPath), { recursive: true });
await writeJson(reportPath, report);

printValidationSummary(report);
if (report.validation_status === 'failed') process.exitCode = 1;
