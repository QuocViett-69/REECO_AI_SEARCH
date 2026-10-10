import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findDroppedRawContent } from './lib.mjs';

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptsDirectory, '..', '..');
const rawDirectory = path.join(projectRoot, 'data', 'raw');
const stagedDirectory = path.join(projectRoot, 'data', 'raw-staged');
const stagingReportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'raw-incoming-staging-report.json',
);
const promotionReportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'raw-incoming-promotion-report.json',
);
const masterPath = path.join(
  projectRoot,
  'data',
  'master',
  'product-master.json',
);
const sourcePath = path.join(
  projectRoot,
  'data',
  'master',
  'product-master-source.json',
);

const writeEnabled = process.argv.includes('--write');
const readJson = async (filePath) =>
  JSON.parse(await readFile(filePath, 'utf8'));
const writeJson = async (filePath, value) =>
  writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const jsonFiles = async (directory) =>
  (await readdir(directory))
    .filter((file) => file.toLocaleLowerCase('en-US').endsWith('.json'))
    .sort((left, right) => left.localeCompare(right, 'en-US'));
const normalizeId = (value) =>
  typeof value === 'string' && value.trim() !== ''
    ? value.toLocaleUpperCase('en-US')
    : null;

const stagingReport = await readJson(stagingReportPath);
const master = await readJson(masterPath);
const masterSource = await readJson(sourcePath);
const masterById = new Map(
  master.map((product) => [normalizeId(product.product_id), product]),
);
const masterModels = new Map(
  master.map((product) => [
    product.model.toLocaleLowerCase('en-US'),
    product.product_id,
  ]),
);
const sourceIds = new Set(
  masterSource.map((product) => normalizeId(product.product_id)),
);
const rawDocuments = new Map();
const rawLocationsById = new Map();

for (const file of await jsonFiles(rawDirectory)) {
  const document = await readJson(path.join(rawDirectory, file));
  rawDocuments.set(file, document);
  for (const [productIndex, product] of (document.products ?? []).entries()) {
    const productId = normalizeId(product.product_id);
    if (!productId) continue;
    const locations = rawLocationsById.get(productId) ?? [];
    locations.push({ file, product_index: productIndex });
    rawLocationsById.set(productId, locations);
  }
}

const plans = [];
const newMasterProducts = [];
const newSourceProducts = [];
const errors = [];
const plannedNewRawFiles = new Set();

for (const family of stagingReport.families) {
  // output_file comes from a report on disk and later names files written under data/raw;
  // a bare file name is the only accepted form (same rule as stage.mjs).
  if (path.basename(family.output_file ?? '') !== family.output_file) {
    throw new Error(`Unsafe staged output path: ${family.output_file}`);
  }
  const stagedDocument = await readJson(
    path.join(stagedDirectory, family.output_file),
  );
  const stagedProduct = stagedDocument.products?.[0];
  const productId = normalizeId(family.representative_product_id);
  if (!stagedProduct || normalizeId(stagedProduct.product_id) !== productId) {
    errors.push({ product_id: productId, issue: 'staged_identity_mismatch' });
    continue;
  }

  const canonical = family.canonical;
  const missingCanonicalFields = [
    'product_id',
    'model',
    'product_name_en',
    'category',
    'subcategory',
    'device_type',
  ].filter(
    (field) =>
      typeof canonical?.[field] !== 'string' || canonical[field].trim() === '',
  );
  if (missingCanonicalFields.length > 0) {
    errors.push({
      product_id: productId,
      issue: 'missing_canonical_fields',
      fields: missingCanonicalFields,
    });
    continue;
  }

  if (masterById.has(productId)) {
    const locations = rawLocationsById.get(productId) ?? [];
    if (locations.length > 1) {
      errors.push({
        product_id: productId,
        issue: 'existing_representative_raw_location_not_unique',
        locations,
      });
      continue;
    }
    if (locations.length === 0) {
      const targetFile = family.output_file;
      if (rawDocuments.has(targetFile) || plannedNewRawFiles.has(targetFile)) {
        errors.push({
          product_id: productId,
          issue: 'existing_master_raw_target_file_collision',
          target_file: targetFile,
        });
        continue;
      }
      plannedNewRawFiles.add(targetFile);
      plans.push({
        product_id: productId,
        action: 'create_raw_family_for_existing_master_product',
        target_file: targetFile,
        product_index: 0,
        variant_count: stagedProduct.variants.length,
        document: stagedDocument,
      });
      continue;
    }
    const location = locations[0];
    const document = rawDocuments.get(location.file);
    const dropped = findDroppedRawContent(
      document.products[location.product_index],
      stagedProduct,
    );
    if (dropped) {
      errors.push({
        product_id: productId,
        issue: 'staged_product_drops_existing_raw_content',
        target_file: location.file,
        ...dropped,
      });
      continue;
    }
    document.schema_version = '1.2';
    document.products[location.product_index] = stagedProduct;
    plans.push({
      product_id: productId,
      action: 'update_existing_raw_family',
      target_file: location.file,
      product_index: location.product_index,
      variant_count: stagedProduct.variants.length,
    });
    continue;
  }

  const normalizedModel = canonical.model.toLocaleLowerCase('en-US');
  if (masterModels.has(normalizedModel)) {
    errors.push({
      product_id: productId,
      issue: 'model_already_in_master',
      model: canonical.model,
      existing_product_id: masterModels.get(normalizedModel),
    });
    continue;
  }
  const existingRawLocations = rawLocationsById.get(productId) ?? [];
  if (existingRawLocations.length > 1) {
    errors.push({
      product_id: productId,
      issue: 'new_master_product_raw_location_not_unique',
      locations: existingRawLocations,
    });
    continue;
  }
  const existingRawLocation =
    existingRawLocations.length === 1 ? existingRawLocations[0] : null;
  const droppedFromExisting =
    existingRawLocation &&
    findDroppedRawContent(
      rawDocuments.get(existingRawLocation.file).products[
        existingRawLocation.product_index
      ],
      stagedProduct,
    );
  if (droppedFromExisting) {
    errors.push({
      product_id: productId,
      issue: 'staged_product_drops_existing_raw_content',
      target_file: existingRawLocation.file,
      ...droppedFromExisting,
    });
    continue;
  }
  const imageUrl = stagedProduct.media?.product_images?.[0]?.url ?? null;
  const productUrl =
    stagedProduct.documents?.product_url ??
    stagedProduct.documents?.order_form ??
    canonical.source_url ??
    null;
  newMasterProducts.push({
    product_id: productId,
    model: canonical.model,
    product_name_en: canonical.product_name_en,
    category: canonical.category,
    subcategory: canonical.subcategory,
    device_type: canonical.device_type,
    product_url: productUrl,
    image_url: imageUrl,
    status: 'review',
  });
  if (!sourceIds.has(productId)) {
    newSourceProducts.push({
      product_id: productId,
      model: canonical.model,
      product_name_en: canonical.product_name_en,
      category: canonical.category,
      subcategory: canonical.subcategory,
      device_type: canonical.device_type,
      source_url: canonical.source_url ?? productUrl,
      verified: canonical.verified ?? 'No',
    });
  }
  if (existingRawLocations.length === 1) {
    const location = existingRawLocations[0];
    const document = rawDocuments.get(location.file);
    document.schema_version = '1.2';
    document.products[location.product_index] = stagedProduct;
    plans.push({
      product_id: productId,
      action: 'update_existing_raw_and_create_master_product',
      target_file: location.file,
      product_index: location.product_index,
      variant_count: stagedProduct.variants.length,
    });
  } else {
    const targetFile = family.output_file;
    if (rawDocuments.has(targetFile) || plannedNewRawFiles.has(targetFile)) {
      errors.push({
        product_id: productId,
        issue: 'new_raw_target_file_collision',
        target_file: targetFile,
      });
      continue;
    }
    plannedNewRawFiles.add(targetFile);
    plans.push({
      product_id: productId,
      action: 'create_new_raw_family_and_master_product',
      target_file: targetFile,
      product_index: 0,
      variant_count: stagedProduct.variants.length,
      document: stagedDocument,
    });
  }
  masterById.set(productId, newMasterProducts.at(-1));
  masterModels.set(normalizedModel, productId);
}

const report = {
  schema_version: '1.0',
  generated_at: new Date().toISOString(),
  mode: writeEnabled ? 'write' : 'dry-run',
  validation_status: errors.length === 0 ? 'passed' : 'failed',
  summary: {
    staged_family_count: stagingReport.families.length,
    update_existing_family_count: plans.filter(
      (plan) => plan.action === 'update_existing_raw_family',
    ).length,
    create_new_family_count: plans.filter(
      (plan) => plan.action === 'create_new_raw_family_and_master_product',
    ).length,
    update_raw_and_create_master_count: plans.filter(
      (plan) => plan.action === 'update_existing_raw_and_create_master_product',
    ).length,
    create_raw_for_existing_master_count: plans.filter(
      (plan) => plan.action === 'create_raw_family_for_existing_master_product',
    ).length,
    new_master_product_count: newMasterProducts.length,
    new_master_source_count: newSourceProducts.length,
    preserved_variant_count: plans.reduce(
      (sum, plan) => sum + plan.variant_count,
      0,
    ),
    error_count: errors.length,
  },
  errors,
  plans: plans.map(({ document, ...plan }) => plan),
};

if (writeEnabled && errors.length === 0) {
  const updatedExistingFiles = new Set(
    plans
      .filter((plan) => plan.action.startsWith('update_existing_raw'))
      .map((plan) => plan.target_file),
  );
  for (const file of updatedExistingFiles) {
    await writeJson(path.join(rawDirectory, file), rawDocuments.get(file));
  }
  for (const plan of plans.filter((item) => item.document)) {
    await writeJson(path.join(rawDirectory, plan.target_file), plan.document);
  }
  await writeJson(masterPath, [...master, ...newMasterProducts]);
  await writeJson(sourcePath, [...masterSource, ...newSourceProducts]);
}

await mkdir(path.dirname(promotionReportPath), { recursive: true });
await writeJson(promotionReportPath, report);

console.log(`mode=${report.mode}`);
console.log(`validation=${report.validation_status}`);
console.log(`update_existing=${report.summary.update_existing_family_count}`);
console.log(
  `create_raw_for_existing_master=${report.summary.create_raw_for_existing_master_count}`,
);
console.log(`create_new=${report.summary.create_new_family_count}`);
console.log(
  `update_raw_and_create_master=${report.summary.update_raw_and_create_master_count}`,
);
console.log(`preserved_variants=${report.summary.preserved_variant_count}`);
console.log(`errors=${report.summary.error_count}`);
console.log(`report=${path.relative(projectRoot, promotionReportPath)}`);

if (errors.length > 0) process.exitCode = 1;
