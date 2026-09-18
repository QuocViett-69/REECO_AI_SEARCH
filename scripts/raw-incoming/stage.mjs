import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptsDirectory, '..', '..');
const incomingDirectory = path.join(projectRoot, 'data', 'raw-incoming');
const stagedDirectory = path.join(projectRoot, 'data', 'raw-staged');
const masterPath = path.join(
  projectRoot,
  'data',
  'master',
  'product-master.json',
);
const curationPath = path.join(
  projectRoot,
  'data',
  'master',
  'product-family-curation.json',
);
const reportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'raw-incoming-staging-report.json',
);

const readJson = async (filePath) =>
  JSON.parse(await readFile(filePath, 'utf8'));
const writeJson = async (filePath, value) =>
  writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const jsonFiles = async (directory) =>
  (await readdir(directory))
    .filter((file) => file.toLocaleLowerCase('en-US').endsWith('.json'))
    .sort((left, right) => left.localeCompare(right, 'en-US'));
const isText = (value) => typeof value === 'string' && value.trim() !== '';
const normalizeProductId = (value) =>
  isText(value) ? value.toLocaleUpperCase('en-US') : value;

const masterProducts = await readJson(masterPath);
const productFamilyCuration = await readJson(curationPath);
const masterById = new Map(
  masterProducts.map((product, index) => [
    normalizeProductId(product.product_id),
    { ...product, master_index: index },
  ]),
);

const inputDocuments = [];
for (const [fileIndex, file] of (
  await jsonFiles(incomingDirectory)
).entries()) {
  const outerDocument = await readJson(path.join(incomingDirectory, file));
  const rawDocument = Array.isArray(outerDocument.products)
    ? outerDocument
    : outerDocument.raw_json;
  const canonicalProducts =
    outerDocument.canonical_json === undefined
      ? []
      : Array.isArray(outerDocument.canonical_json)
        ? outerDocument.canonical_json
        : [outerDocument.canonical_json];
  if (!Array.isArray(rawDocument?.products)) {
    throw new Error(`${file}: expected products array after unwrapping`);
  }
  inputDocuments.push({
    file,
    fileIndex,
    rawDocument,
    canonicalProducts,
  });
}

// Files sharing a product ID describe the same family and must be consolidated.
const parents = inputDocuments.map((_, index) => index);
const find = (index) => {
  if (parents[index] !== index) parents[index] = find(parents[index]);
  return parents[index];
};
const union = (left, right) => {
  const leftRoot = find(left);
  const rightRoot = find(right);
  if (leftRoot !== rightRoot) parents[rightRoot] = leftRoot;
};
const firstFileByProductId = new Map();
for (const document of inputDocuments) {
  for (const product of document.rawDocument.products) {
    const productId = normalizeProductId(product.product_id);
    const previous = firstFileByProductId.get(productId);
    if (previous === undefined) {
      firstFileByProductId.set(productId, document.fileIndex);
    } else {
      union(previous, document.fileIndex);
    }
  }
}

const groupedDocuments = new Map();
for (const document of inputDocuments) {
  const root = find(document.fileIndex);
  const group = groupedDocuments.get(root) ?? [];
  group.push(document);
  groupedDocuments.set(root, group);
}

const productQuality = (entry) => {
  const product = entry.product;
  const taxonomy = product.taxonomy ?? {};
  return (
    (isText(product.product_name_en) ? 100 : 0) +
    ['category', 'subcategory', 'device_type'].filter((field) =>
      isText(taxonomy[field]),
    ).length *
      100 +
    (Array.isArray(product.specifications) ? product.specifications.length : 0)
  );
};

const representativeScore = (entry) => {
  const master = masterById.get(entry.product.product_id);
  const canonical = entry.canonical;
  return (
    (master ? (master.status === 'active' ? 1_000_000 : 900_000) : 0) +
    (canonical ? 100_000 : 0) +
    10_000 -
    entry.order
  );
};

const canonicalFrom = (
  entry,
  canonicalProductId = entry.product.product_id,
) => {
  const master = masterById.get(canonicalProductId);
  if (master) {
    return {
      product_id: master.product_id,
      model: master.model,
      product_name_en: master.product_name_en,
      category: master.category,
      subcategory: master.subcategory,
      device_type: master.device_type,
      source_url:
        entry.product.documents?.product_url ??
        entry.product.documents?.order_form ??
        master.product_url ??
        null,
      verified: 'Yes',
    };
  }
  if (entry.canonical) return entry.canonical;
  const product = entry.product;
  return {
    product_id: product.product_id,
    model: product.model,
    product_name_en: product.product_name_en,
    category: product.taxonomy?.category ?? null,
    subcategory: product.taxonomy?.subcategory ?? null,
    device_type: product.taxonomy?.device_type ?? null,
    source_url:
      product.documents?.product_url ?? product.documents?.order_form ?? null,
    verified: 'No',
  };
};

const configurationSpecifications = (products) => {
  const valuesByName = new Map();
  for (const product of products) {
    for (const specification of product.specifications ?? []) {
      const name = specification.name_en ?? '';
      const values = valuesByName.get(name) ?? new Set();
      values.add(JSON.stringify(specification.value_raw ?? null));
      valuesByName.set(name, values);
    }
  }
  return new Set(
    [...valuesByName.entries()]
      .filter(([, values]) => values.size > 1)
      .map(([name]) => name),
  );
};

await mkdir(stagedDirectory, { recursive: true });
try {
  const previousReport = await readJson(reportPath);
  for (const family of previousReport.families ?? []) {
    if (path.basename(family.output_file ?? '') !== family.output_file) {
      throw new Error(`Unsafe staged output path: ${family.output_file}`);
    }
    try {
      await unlink(path.join(stagedDirectory, family.output_file));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const stagedFamilies = [];
for (const documents of groupedDocuments.values()) {
  const entriesById = new Map();
  let order = 0;
  for (const document of documents) {
    const canonicalById = new Map(
      document.canonicalProducts.map((product) => [
        normalizeProductId(product.product_id),
        { ...product, product_id: normalizeProductId(product.product_id) },
      ]),
    );
    for (const [
      productIndex,
      product,
    ] of document.rawDocument.products.entries()) {
      const normalizedProduct = {
        ...product,
        product_id: normalizeProductId(product.product_id),
      };
      const entry = {
        product: normalizedProduct,
        canonical: canonicalById.get(normalizedProduct.product_id) ?? null,
        sourceFile: document.file,
        sourceProductIndex: productIndex,
        order: order++,
      };
      const previous = entriesById.get(normalizedProduct.product_id);
      if (!previous || productQuality(entry) > productQuality(previous)) {
        entriesById.set(normalizedProduct.product_id, entry);
      }
    }
  }

  const entries = [...entriesById.values()];
  const representative = [...entries].sort(
    (left, right) => representativeScore(right) - representativeScore(left),
  )[0];
  const differingSpecificationNames = configurationSpecifications(
    entries.map((entry) => entry.product),
  );
  const variants = entries.map((entry) => ({
    product_id: entry.product.product_id,
    model: entry.product.model,
    product_name_en: entry.product.product_name_en,
    is_representative:
      entry.product.product_id === representative.product.product_id,
    distinguishing_specifications: (entry.product.specifications ?? []).filter(
      (specification) =>
        differingSpecificationNames.has(specification.name_en ?? '') ||
        /config|variant|option/iu.test(specification.section ?? '') ||
        /config|variant|option/iu.test(specification.name_en ?? ''),
    ),
    documents: entry.product.documents ?? {},
    media: entry.product.media ?? { product_images: [] },
    source: {
      file: entry.sourceFile,
      product_index: entry.sourceProductIndex,
    },
  }));
  const curation =
    productFamilyCuration[representative.product.product_id] ?? {};
  const canonicalProductId = normalizeProductId(
    curation.product_id ?? representative.product.product_id,
  );
  const canonical = {
    ...canonicalFrom(representative, canonicalProductId),
    ...curation,
    product_id: canonicalProductId,
  };
  const representativeProduct = {
    ...representative.product,
    product_id: canonical.product_id,
    model: canonical.model,
    product_name_en: canonical.product_name_en,
    taxonomy: {
      category: canonical.category,
      subcategory: canonical.subcategory,
      device_type: canonical.device_type,
    },
    variant_group: {
      representative_product_id: canonical.product_id,
      variant_count: variants.length,
      source_files: documents.map((document) => document.file),
    },
    variants,
  };
  const missingCanonicalFields = [
    'product_name_en',
    'category',
    'subcategory',
    'device_type',
  ].filter((field) => !isText(canonical[field]));
  const outputFile = `${canonical.product_id}.json`;
  const outputDocument = {
    schema_version: '1.2',
    source: {
      type: 'consolidated_product_family',
      files: documents.map((document) => ({
        incoming_file: document.file,
        original_source: document.rawDocument.source ?? null,
      })),
    },
    products: [representativeProduct],
  };
  await writeJson(path.join(stagedDirectory, outputFile), outputDocument);
  stagedFamilies.push({
    output_file: outputFile,
    representative_product_id: canonical.product_id,
    representative_source_product_id: representative.product.product_id,
    representative_model: canonical.model,
    representative_already_in_master: masterById.has(canonical.product_id),
    variant_count: variants.length,
    variant_product_ids: variants.map((variant) => variant.product_id),
    source_files: documents.map((document) => document.file),
    canonical,
    missing_canonical_fields: missingCanonicalFields,
  });
}

stagedFamilies.sort((left, right) =>
  left.representative_product_id.localeCompare(
    right.representative_product_id,
    'en-US',
  ),
);
const report = {
  schema_version: '1.0',
  generated_at: new Date().toISOString(),
  source_directory: 'data/raw-incoming',
  staged_directory: 'data/raw-staged',
  strategy: {
    unit: 'product_family',
    grouping: 'Files sharing a product_id are consolidated.',
    representative_selection:
      'Prefer an active/current master product, then an embedded canonical product, then the highest-quality raw record.',
    variant_preservation:
      'All unique product IDs are retained in products[0].variants with distinguishing specifications and source provenance.',
  },
  summary: {
    incoming_file_count: inputDocuments.length,
    staged_family_count: stagedFamilies.length,
    consolidated_source_file_count: stagedFamilies
      .filter((family) => family.source_files.length > 1)
      .reduce((sum, family) => sum + family.source_files.length, 0),
    representative_already_in_master_count: stagedFamilies.filter(
      (family) => family.representative_already_in_master,
    ).length,
    new_representative_count: stagedFamilies.filter(
      (family) => !family.representative_already_in_master,
    ).length,
    total_preserved_variant_count: stagedFamilies.reduce(
      (sum, family) => sum + family.variant_count,
      0,
    ),
    families_missing_canonical_fields_count: stagedFamilies.filter(
      (family) => family.missing_canonical_fields.length > 0,
    ).length,
  },
  families: stagedFamilies,
};

await mkdir(path.dirname(reportPath), { recursive: true });
await writeJson(reportPath, report);

console.log(`incoming_files=${report.summary.incoming_file_count}`);
console.log(`staged_families=${report.summary.staged_family_count}`);
console.log(`new_representatives=${report.summary.new_representative_count}`);
console.log(
  `existing_representatives=${report.summary.representative_already_in_master_count}`,
);
console.log(
  `preserved_variants=${report.summary.total_preserved_variant_count}`,
);
console.log(
  `families_missing_canonical=${report.summary.families_missing_canonical_fields_count}`,
);
console.log(`report=${path.relative(projectRoot, reportPath)}`);
