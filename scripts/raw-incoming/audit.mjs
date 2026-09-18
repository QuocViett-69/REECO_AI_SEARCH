import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptsDirectory, '..', '..');
const incomingDirectory = path.join(projectRoot, 'data', 'raw-incoming');
const rawDirectory = path.join(projectRoot, 'data', 'raw');
const masterPath = path.join(
  projectRoot,
  'data',
  'master',
  'product-master.json',
);
const reportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'raw-incoming-audit.json',
);

const readJson = async (filePath) =>
  JSON.parse(await readFile(filePath, 'utf8'));

const jsonFiles = async (directory) =>
  (await readdir(directory))
    .filter((file) => file.toLocaleLowerCase('en-US').endsWith('.json'))
    .sort((left, right) => left.localeCompare(right, 'en-US'));

const addLocation = (map, key, location) => {
  if (!key) return;
  const locations = map.get(key) ?? [];
  locations.push(location);
  map.set(key, locations);
};
const normalizeProductId = (value) =>
  typeof value === 'string' && value.trim() !== ''
    ? value.toLocaleUpperCase('en-US')
    : value;

const existingRawById = new Map();
for (const file of await jsonFiles(rawDirectory)) {
  const document = await readJson(path.join(rawDirectory, file));
  for (const [productIndex, product] of (document.products ?? []).entries()) {
    addLocation(existingRawById, normalizeProductId(product.product_id), {
      file,
      product_index: productIndex,
    });
  }
}

const masterIds = new Set(
  (await readJson(masterPath)).map((product) =>
    normalizeProductId(product.product_id),
  ),
);
const incomingById = new Map();
const canonicalById = new Map();
const files = [];
const structuralErrors = [];

for (const file of await jsonFiles(incomingDirectory)) {
  const outerDocument = await readJson(path.join(incomingDirectory, file));
  const wrapped = !Array.isArray(outerDocument.products);
  const rawDocument = wrapped ? outerDocument.raw_json : outerDocument;
  const products = Array.isArray(rawDocument?.products)
    ? rawDocument.products
    : [];
  const canonicalProducts =
    outerDocument.canonical_json === undefined
      ? []
      : Array.isArray(outerDocument.canonical_json)
        ? outerDocument.canonical_json
        : [outerDocument.canonical_json];

  if (!Array.isArray(rawDocument?.products)) {
    structuralErrors.push({ file, issue: 'missing_products_array' });
  }

  let productsMissingCoreFields = 0;
  products.forEach((product, productIndex) => {
    const missingFields = ['product_id', 'model', 'specifications'].filter(
      (field) =>
        product[field] === undefined ||
        product[field] === null ||
        (field === 'specifications' && !Array.isArray(product[field])),
    );
    if (missingFields.length > 0) productsMissingCoreFields += 1;
    addLocation(incomingById, normalizeProductId(product.product_id), {
      file,
      product_index: productIndex,
      source_product_id: product.product_id,
      model: product.model ?? null,
      missing_fields: missingFields,
    });
  });

  canonicalProducts.forEach((product, canonicalIndex) => {
    addLocation(canonicalById, normalizeProductId(product?.product_id), {
      file,
      canonical_index: canonicalIndex,
    });
  });

  files.push({
    file,
    input_shape: wrapped ? 'wrapped' : 'raw_document',
    schema_version: rawDocument?.schema_version ?? null,
    product_record_count: products.length,
    canonical_record_count: canonicalProducts.length,
    products_missing_core_fields: productsMissingCoreFields,
  });
}

const duplicateIncomingIds = [...incomingById.entries()]
  .filter(([, locations]) => locations.length > 1)
  .map(([productId, locations]) => ({ product_id: productId, locations }));
const existingRawOverlaps = [...incomingById.entries()]
  .filter(([productId]) => existingRawById.has(productId))
  .map(([productId, incomingLocations]) => ({
    product_id: productId,
    incoming_locations: incomingLocations,
    existing_locations: existingRawById.get(productId),
  }));
const incomingIds = [...incomingById.keys()];
const idsWithoutCanonical = incomingIds.filter(
  (productId) => !canonicalById.has(productId),
);

const report = {
  schema_version: '1.0',
  generated_at: new Date().toISOString(),
  source_directory: 'data/raw-incoming',
  summary: {
    file_count: files.length,
    direct_raw_file_count: files.filter(
      (file) => file.input_shape === 'raw_document',
    ).length,
    wrapped_file_count: files.filter((file) => file.input_shape === 'wrapped')
      .length,
    raw_product_record_count: files.reduce(
      (sum, file) => sum + file.product_record_count,
      0,
    ),
    unique_product_id_count: incomingById.size,
    duplicate_product_id_group_count: duplicateIncomingIds.length,
    existing_raw_overlap_count: existingRawOverlaps.length,
    existing_master_overlap_count: incomingIds.filter((productId) =>
      masterIds.has(productId),
    ).length,
    embedded_canonical_record_count: files.reduce(
      (sum, file) => sum + file.canonical_record_count,
      0,
    ),
    unique_embedded_canonical_id_count: canonicalById.size,
    product_ids_without_embedded_canonical_count: idsWithoutCanonical.length,
    structural_error_count: structuralErrors.length,
    products_missing_core_fields_count: files.reduce(
      (sum, file) => sum + file.products_missing_core_fields,
      0,
    ),
  },
  checks: {
    structural_errors: structuralErrors,
    duplicate_incoming_product_ids: duplicateIncomingIds,
    existing_raw_overlaps: existingRawOverlaps,
    product_ids_without_embedded_canonical: idsWithoutCanonical,
  },
  files,
};

await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`files=${report.summary.file_count}`);
console.log(`raw_records=${report.summary.raw_product_record_count}`);
console.log(`unique_product_ids=${report.summary.unique_product_id_count}`);
console.log(
  `duplicate_id_groups=${report.summary.duplicate_product_id_group_count}`,
);
console.log(
  `existing_raw_overlaps=${report.summary.existing_raw_overlap_count}`,
);
console.log(
  `ids_without_canonical=${report.summary.product_ids_without_embedded_canonical_count}`,
);
console.log(`report=${path.relative(projectRoot, reportPath)}`);
