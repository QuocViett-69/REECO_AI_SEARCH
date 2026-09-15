import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(scriptsDirectory, '..', '..');
const masterPath = path.join(projectRoot, 'data', 'master', 'product-master.json');
const normalizedDirectory = path.join(projectRoot, 'data', 'normalized', 'specifications');
const enrichedDirectory = path.join(projectRoot, 'data', 'enriched', 'products');
const ontologyPath = path.join(projectRoot, 'data', 'ontology', 'semantic-vocabulary.json');
const outputDirectory = path.join(projectRoot, 'data', 'search-documents');
const reportPath = path.join(projectRoot, 'data', 'reports', 'search-document-report.json');

const SOURCE_VERSIONS = Object.freeze({
  product_master: '2.0',
  technical_normalization: '1.2',
  semantic_enrichment: '1.0',
  semantic_vocabulary: '1.0',
});
const MAX_IMPORTANT_SPECIFICATIONS = 18;

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));
const normalizeWhitespace = (value) => String(value ?? '').replace(/\s+/gu, ' ').trim();
const caseKey = (value) => normalizeWhitespace(value).toLocaleLowerCase('en-US');
const uniqueStrings = (items) => {
  const seen = new Set();
  return items
    .map(normalizeWhitespace)
    .filter(Boolean)
    .filter((item) => {
      const key = caseKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};
const canonicalJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const hashDocument = (document) => {
  const { content_hash: _contentHash, ...canonicalContent } = document;
  return sha256(canonicalJson(canonicalContent));
};
const writeJsonIfChanged = async (filePath, value) => {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  try {
    if ((await readFile(filePath, 'utf8')) === content) return false;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeFile(filePath, content, 'utf8');
  return true;
};
const directoryFingerprint = async (directory) => {
  const files = (await readdir(directory)).filter((file) => file.endsWith('.json')).sort();
  const entries = [];
  for (const file of files) {
    entries.push([file, sha256(await readFile(path.join(directory, file)))]);
  }
  return sha256(canonicalJson(entries));
};
const inputFingerprints = async () => ({
  product_master: sha256(await readFile(masterPath)),
  normalized_specifications: await directoryFingerprint(normalizedDirectory),
  enriched_products: await directoryFingerprint(enrichedDirectory),
  semantic_vocabulary: sha256(await readFile(ontologyPath)),
});

const SemanticItemSchema = z.object({
  key: z.string().regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/u),
  label_en: z.string().min(1),
  label_vi: z.string().min(1),
});
const RawRefSchema = z.object({
  file: z.string().regex(/^data\/raw\/.+\.json$/u),
  product_index: z.number().int().nonnegative(),
  spec_index: z.number().int().nonnegative(),
  source_rows: z.array(z.number().int().nonnegative()),
});
const NormalizedValueSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('number'),
    value: z.number().finite(),
    unit: z.string().min(1).nullable(),
    qualifier: z.string().nullable(),
    alternate: z.object({ value: z.number().finite(), unit: z.string().min(1) }).optional(),
    condition: z.string().min(1).optional(),
    note: z.string().min(1).optional(),
  }),
  z.object({
    type: z.literal('range'),
    min_value: z.number().finite().optional(),
    max_value: z.number().finite().optional(),
    unit: z.string().min(1).nullable().optional(),
    min: z.object({ value: z.number().finite(), unit: z.string().min(1) }).optional(),
    max: z.object({ value: z.number().finite(), unit: z.string().min(1) }).optional(),
    qualifier: z.string().nullable(),
    alternate: z.object({
      min_value: z.number().finite(),
      max_value: z.number().finite(),
      unit: z.string().min(1),
    }).optional(),
    condition: z.string().min(1).optional(),
    note: z.string().min(1).optional(),
  }),
  z.object({ type: z.literal('boolean'), value: z.boolean() }),
  z.object({ type: z.literal('protocol'), values: z.array(z.string().min(1)).min(1) }),
  z.object({ type: z.literal('list'), values: z.array(z.string().min(1)).min(2) }),
]);
const SearchDocumentSchema = z.object({
  schema_version: z.literal('1.0'),
  product_id: z.string().min(1),
  model: z.string().min(1),
  name_en: z.string().min(1),
  name_vi: z.string().min(1).nullable(),
  taxonomy: z.object({
    category: z.string().min(1),
    category_key: z.string().min(1),
    subcategory: z.string().min(1),
    subcategory_key: z.string().min(1),
    device_type: z.string().min(1),
    device_type_key: z.string().min(1),
  }),
  measurements: z.array(SemanticItemSchema),
  applications: z.array(SemanticItemSchema),
  capabilities: z.array(SemanticItemSchema),
  supported_protocols: z.array(z.string().min(1)),
  unsupported_protocols: z.array(z.string().min(1)),
  aliases: z.array(z.string().min(1)),
  important_specifications: z.array(z.object({
    canonical_key: z.string().regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/u),
    name: z.string().min(1),
    quantity_kind: z.string().min(1).nullable(),
    normalized_value: NormalizedValueSchema,
    raw_ref: RawRefSchema,
  })),
  search_keywords_en: z.array(z.string().min(1)),
  search_keywords_vi: z.array(z.string().min(1)),
  search_text_en: z.string().min(1),
  search_text_vi: z.string().min(1),
  search_text: z.string().min(1),
  content_hash: z.string().regex(/^[a-f0-9]{64}$/u),
  source_versions: z.object({
    product_master: z.literal('2.0'),
    technical_normalization: z.literal('1.2'),
    semantic_enrichment: z.literal('1.0'),
    semantic_vocabulary: z.literal('1.0'),
  }),
});

const importantSpecificationPriority = (specification) => {
  if (!specification.normalized || !specification.canonical_key) return null;
  const key = specification.canonical_key;
  if (key === 'measurement_range' || key === 'operating_temperature_range') return 10;
  if (/(?:measurement|measuring)_range$/u.test(key)) return 15;
  if (/(?:temperature|humidity|pressure|precipitation|wind_speed|wind_direction|turbidity|visibility|distance|water_content|permittivity|conductivity)_range$/u.test(key)) return 20;
  if (/(?:^|_)(?:accuracy|precision)(?:_|$)/u.test(key)) return 30;
  if (/(?:^|_)resolution(?:_|$)/u.test(key)) return 40;
  if (/(?:supply|input|operating|charge_terminal)_voltage(?:_range)?$/u.test(key)) return 50;
  if (/(?:^|_)(?:current|power|frequency|data_rate|pressure)(?:_|$)/u.test(key)) return 55;
  if (/(?:^|_)(?:dimensions?|diameter|width|height|depth)$/u.test(key)) return 60;
  if (/^(?:probe|rod|sensor|enclosure)_length$/u.test(key)) return 61;
  if (/(?:^|_)(?:weight|mass)$/u.test(key)) return 70;
  if (/(?:^|_)(?:ingress_protection|ip_rating)(?:_|$)/u.test(key)) return 80;
  return null;
};

const selectImportantSpecifications = (normalized) => normalized.specifications
  .map((specification, index) => ({
    specification,
    index,
    priority: importantSpecificationPriority(specification),
  }))
  .filter(({ priority }) => priority !== null)
  .sort((left, right) => left.priority - right.priority || left.index - right.index)
  .slice(0, MAX_IMPORTANT_SPECIFICATIONS)
  .map(({ specification }) => ({
    canonical_key: specification.canonical_key,
    name: normalizeWhitespace(specification.name_raw),
    quantity_kind: specification.quantity_kind ?? null,
    normalized_value: specification.normalized,
    raw_ref: specification.raw_ref,
  }));

const formatNumber = (value) => Number.isInteger(value) ? String(value) : String(value);
const formatNormalizedValue = (normalized) => {
  if (normalized.type === 'number') {
    const qualifier = normalized.qualifier ? `${normalized.qualifier} ` : '';
    const unit = normalized.unit ? ` ${normalized.unit}` : '';
    return normalizeWhitespace(`${qualifier}${formatNumber(normalized.value)}${unit}`);
  }
  if (normalized.type === 'range') {
    if (normalized.min && normalized.max) {
      return `${formatNumber(normalized.min.value)} ${normalized.min.unit} to ${formatNumber(normalized.max.value)} ${normalized.max.unit}`;
    }
    const unit = normalized.unit ? ` ${normalized.unit}` : '';
    return normalizeWhitespace(`${formatNumber(normalized.min_value)} to ${formatNumber(normalized.max_value)}${unit}`);
  }
  if (normalized.type === 'boolean') return normalized.value ? 'true' : 'false';
  return normalized.values.join(', ');
};
const compactSemanticItems = (items) => items.map(({ key, label_en, label_vi }) => ({
  key,
  label_en: normalizeWhitespace(label_en),
  label_vi: normalizeWhitespace(label_vi),
}));
const ontologyLabelMap = (ontology, group) => new Map(
  ontology.taxonomy[group].map((item) => [item.key, item.label_vi]),
);
const taxonomyPhrases = (taxonomy, ontology, language) => {
  if (language === 'en') return [taxonomy.category, taxonomy.subcategory, taxonomy.device_type];
  const categories = ontologyLabelMap(ontology, 'categories');
  const subcategories = ontologyLabelMap(ontology, 'subcategories');
  const deviceTypes = ontologyLabelMap(ontology, 'device_types');
  return [
    categories.get(taxonomy.category_key),
    subcategories.get(taxonomy.subcategory_key),
    deviceTypes.get(taxonomy.device_type_key),
  ];
};
const filterPositiveKeywords = (keywords, supported, unsupported) => {
  const supportedKeys = new Set(supported.map(caseKey));
  const unsupportedOnly = new Set(
    unsupported.map(caseKey).filter((name) => !supportedKeys.has(name)),
  );
  return uniqueStrings(keywords).filter((keyword) => !unsupportedOnly.has(caseKey(keyword)));
};
const buildSearchText = ({ document, ontology, language }) => {
  const labelKey = language === 'en' ? 'label_en' : 'label_vi';
  const names = language === 'en' ? [document.name_en] : [document.name_vi];
  const keywordList = language === 'en' ? document.search_keywords_en : document.search_keywords_vi;
  const specificationPhrases = document.important_specifications.map(
    (specification) => `${specification.name}: ${formatNormalizedValue(specification.normalized_value)}`,
  );
  return uniqueStrings([
    document.model,
    ...names,
    ...document.aliases,
    ...taxonomyPhrases(document.taxonomy, ontology, language),
    ...document.measurements.map((item) => item[labelKey]),
    ...document.capabilities.map((item) => item[labelKey]),
    ...document.applications.map((item) => item[labelKey]),
    ...document.supported_protocols,
    ...specificationPhrases,
    ...keywordList,
  ]).join(' | ');
};

const buildDocument = ({ product, normalized, enriched, ontology }) => {
  const supported = uniqueStrings(enriched.protocols
    .filter((protocol) => protocol.relation === 'supported')
    .map((protocol) => protocol.name));
  const unsupported = uniqueStrings(enriched.protocols
    .filter((protocol) => protocol.relation === 'unsupported')
    .map((protocol) => protocol.name));
  const aliases = uniqueStrings(enriched.aliases.map((alias) => alias.value));
  const base = {
    schema_version: '1.0',
    product_id: product.product_id,
    model: normalizeWhitespace(product.model),
    name_en: normalizeWhitespace(enriched.name_en),
    name_vi: enriched.name_vi ? normalizeWhitespace(enriched.name_vi) : null,
    taxonomy: { ...enriched.taxonomy },
    measurements: compactSemanticItems(enriched.measurements),
    applications: compactSemanticItems(enriched.applications),
    capabilities: compactSemanticItems(enriched.capabilities),
    supported_protocols: supported,
    unsupported_protocols: unsupported,
    aliases,
    important_specifications: selectImportantSpecifications(normalized),
    search_keywords_en: filterPositiveKeywords(enriched.search_keywords.en, supported, unsupported),
    search_keywords_vi: filterPositiveKeywords(enriched.search_keywords.vi, supported, unsupported),
    search_text_en: '',
    search_text_vi: '',
    search_text: '',
    source_versions: { ...SOURCE_VERSIONS },
  };
  base.search_text_en = buildSearchText({ document: base, ontology, language: 'en' });
  base.search_text_vi = buildSearchText({ document: base, ontology, language: 'vi' });
  base.search_text = uniqueStrings([
    ...base.search_text_en.split(' | '),
    ...base.search_text_vi.split(' | '),
  ]).join(' | ');
  const content_hash = hashDocument(base);
  return {
    ...base,
    content_hash,
    source_versions: base.source_versions,
  };
};

const average = (values) => values.length === 0 ? 0 : Number(
  (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2),
);
const findInvalidReferences = (documents, normalizedById) => documents.flatMap((document) => {
  const normalized = normalizedById.get(document.product_id);
  return document.important_specifications
    .filter((important) => !normalized?.specifications.some((specification) =>
      specification.canonical_key === important.canonical_key &&
      JSON.stringify(specification.raw_ref) === JSON.stringify(important.raw_ref) &&
      JSON.stringify(specification.normalized) === JSON.stringify(important.normalized_value)))
    .map((important) => ({ product_id: document.product_id, raw_ref: important.raw_ref }));
});
const unsupportedProtocolViolations = (documents, enrichedById) => documents.flatMap((document) => {
  const enriched = enrichedById.get(document.product_id);
  if (!enriched) return [];
  const supported = new Set(enriched.protocols.filter((item) => item.relation === 'supported').map((item) => caseKey(item.name)));
  const unsupportedOnly = enriched.protocols
    .filter((item) => item.relation === 'unsupported' && !supported.has(caseKey(item.name)))
    .map((item) => caseKey(item.name));
  const positivePhrases = new Set([
    ...document.supported_protocols,
    ...document.search_keywords_en,
    ...document.search_keywords_vi,
    ...document.search_text_en.split(' | '),
    ...document.search_text_vi.split(' | '),
  ].map(caseKey));
  const invalidSupported = document.supported_protocols
    .filter((name) => !supported.has(caseKey(name)))
    .map((name) => ({ product_id: document.product_id, protocol: name, reason: 'not_supported_upstream' }));
  const promotedUnsupported = unsupportedOnly
    .filter((name) => positivePhrases.has(name))
    .map((name) => ({ product_id: document.product_id, protocol: name, reason: 'unsupported_promoted_to_positive' }));
  return [...invalidSupported, ...promotedUnsupported];
});

export const createSearchDocumentPlan = async () => {
  const [master, ontology, fingerprints] = await Promise.all([
    readJson(masterPath),
    readJson(ontologyPath),
    inputFingerprints(),
  ]);
  const activeProducts = master.filter((product) => product.status === 'active');
  const reviewProducts = master.filter((product) => product.status === 'review');
  const normalizedById = new Map();
  const enrichedById = new Map();
  for (const product of activeProducts) {
    const normalizedFile = path.join(normalizedDirectory, `${product.product_id}.json`);
    const enrichedFile = path.join(enrichedDirectory, `${product.product_id}.json`);
    try { normalizedById.set(product.product_id, await readJson(normalizedFile)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    try { enrichedById.set(product.product_id, await readJson(enrichedFile)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const documents = activeProducts
    .filter((product) => normalizedById.has(product.product_id) && enrichedById.has(product.product_id))
    .map((product) => buildDocument({
      product,
      normalized: normalizedById.get(product.product_id),
      enriched: enrichedById.get(product.product_id),
      ontology,
    }));
  const fingerprintsAfterBuild = await inputFingerprints();
  const mutatedUpstreamInputs = Object.keys(fingerprints).filter(
    (key) => fingerprints[key] !== fingerprintsAfterBuild[key],
  );
  const duplicateProductIds = documents.length - new Set(documents.map((document) => document.product_id)).size;
  const documentsWithoutEnrichment = activeProducts.filter((product) => !enrichedById.has(product.product_id));
  const documentsWithoutNormalization = activeProducts.filter((product) => !normalizedById.has(product.product_id));
  const invalidReferences = findInvalidReferences(documents, normalizedById);
  const protocolViolations = unsupportedProtocolViolations(documents, enrichedById);
  const zodFailures = documents.flatMap((document) => {
    const result = SearchDocumentSchema.safeParse(document);
    return result.success ? [] : [{ product_id: document.product_id, issues: result.error.issues }];
  });
  const hashMismatches = documents.filter((document) => document.content_hash !== hashDocument(document));
  const textLengths = documents.map((document) => document.search_text.length);
  const searchTextDuplicateRatios = documents.map((document) => {
    const phrases = document.search_text.split(' | ').map(caseKey).filter(Boolean);
    return phrases.length === 0
      ? 0
      : (phrases.length - new Set(phrases).size) / phrases.length;
  });
  const productIds = (predicate) => documents.filter(predicate).map((document) => document.product_id);
  const checks = {
    master_products: master.length,
    active_products: activeProducts.length,
    search_documents: documents.length,
    skipped_review_products: reviewProducts.length,
    duplicate_product_id: duplicateProductIds,
    document_without_enrichment: documentsWithoutEnrichment.length,
    document_without_normalization: documentsWithoutNormalization.length,
    invalid_normalized_reference: invalidReferences.length,
    unsupported_protocol_as_supported: protocolViolations.length,
    search_text_empty: documents.filter((document) => !document.search_text_en || !document.search_text_vi || !document.search_text).length,
    search_text_duplicate_ratio: Number(average(searchTextDuplicateRatios).toFixed(4)),
    missing_content_hash: documents.filter((document) => !document.content_hash).length,
    hash_mismatch: hashMismatches.length,
    upstream_mutation: mutatedUpstreamInputs.length,
    zod_validation_passed: documents.length - zodFailures.length,
    zod_validation_failed: zodFailures.length,
  };
  const blockingCount = duplicateProductIds + documentsWithoutEnrichment.length +
    documentsWithoutNormalization.length + invalidReferences.length + protocolViolations.length +
    checks.search_text_empty + checks.missing_content_hash + hashMismatches.length + zodFailures.length +
    mutatedUpstreamInputs.length +
    Math.abs(master.length - 50) + Math.abs(activeProducts.length - 42) +
    Math.abs(reviewProducts.length - 8) + Math.abs(documents.length - 42);
  const report = {
    schema_version: '1.0',
    validation_status: blockingCount === 0 ? 'passed' : 'failed',
    blockers: blockingCount,
    input_fingerprints: fingerprints,
    checks,
    metrics: {
      average_search_text_length: average(textLengths),
      min_search_text_length: textLengths.length ? Math.min(...textLengths) : 0,
      max_search_text_length: textLengths.length ? Math.max(...textLengths) : 0,
      average_measurements_per_product: average(documents.map((document) => document.measurements.length)),
      average_capabilities_per_product: average(documents.map((document) => document.capabilities.length)),
      average_aliases_per_product: average(documents.map((document) => document.aliases.length)),
      products_without_applications: productIds((document) => document.applications.length === 0).length,
      products_without_measurements: productIds((document) => document.measurements.length === 0).length,
      products_without_protocols: productIds((document) => document.supported_protocols.length === 0 && document.unsupported_protocols.length === 0).length,
      important_specification_count: documents.reduce((sum, document) => sum + document.important_specifications.length, 0),
      en_keyword_count: documents.reduce((sum, document) => sum + document.search_keywords_en.length, 0),
      vi_keyword_count: documents.reduce((sum, document) => sum + document.search_keywords_vi.length, 0),
    },
    skipped_review_products: reviewProducts.map(({ product_id, model }) => ({ product_id, model })),
    coverage_details: {
      product_ids_without_applications: productIds((document) => document.applications.length === 0),
      product_ids_without_measurements: productIds((document) => document.measurements.length === 0),
      product_ids_without_protocols: productIds((document) => document.supported_protocols.length === 0 && document.unsupported_protocols.length === 0),
    },
    diagnostics: {
      invalid_references: invalidReferences,
      protocol_violations: protocolViolations,
      zod_failures: zodFailures,
      mutated_upstream_inputs: mutatedUpstreamInputs,
    },
  };
  return { documents, report };
};

export const writeSearchDocumentOutputs = async ({ documents, report }) => {
  await mkdir(outputDirectory, { recursive: true });
  const expectedFiles = new Set(documents.map((document) => `${document.product_id}.json`));
  for (const file of (await readdir(outputDirectory)).filter((item) => item.endsWith('.json'))) {
    if (!expectedFiles.has(file)) await unlink(path.join(outputDirectory, file));
  }
  for (const document of documents) {
    await writeJsonIfChanged(path.join(outputDirectory, `${document.product_id}.json`), document);
  }
  await writeJsonIfChanged(reportPath, report);
};

export const validateSearchDocuments = async () => {
  const expected = await createSearchDocumentPlan();
  const errors = [];
  const files = await readdir(outputDirectory).catch((error) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  const jsonFiles = files.filter((file) => file.endsWith('.json')).sort();
  const expectedByFile = new Map(expected.documents.map((document) => [`${document.product_id}.json`, document]));
  for (const file of jsonFiles) {
    if (!expectedByFile.has(file)) errors.push({ code: 'unexpected_search_document', file });
    else if (JSON.stringify(await readJson(path.join(outputDirectory, file))) !== JSON.stringify(expectedByFile.get(file))) {
      errors.push({ code: 'stale_or_modified_search_document', file });
    }
  }
  for (const file of expectedByFile.keys()) {
    if (!jsonFiles.includes(file)) errors.push({ code: 'missing_search_document', file });
  }
  let actualReport = null;
  try { actualReport = await readJson(reportPath); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (JSON.stringify(actualReport) !== JSON.stringify(expected.report)) errors.push({ code: 'stale_or_modified_search_document_report' });
  const passed = errors.length === 0 && expected.report.validation_status === 'passed';
  return {
    passed,
    errors,
    report: passed ? expected.report : { ...expected.report, validation_status: 'failed' },
  };
};

export const printSearchDocumentSummary = (report) => {
  const { checks, metrics } = report;
  console.log(`search_document_status=${report.validation_status}`);
  console.log(`master_products=${checks.master_products}`);
  console.log(`active_products=${checks.active_products}`);
  console.log(`search_documents=${checks.search_documents}`);
  console.log(`skipped_review_products=${checks.skipped_review_products}`);
  console.log(`duplicate_product_id=${checks.duplicate_product_id}`);
  console.log(`document_without_enrichment=${checks.document_without_enrichment}`);
  console.log(`invalid_normalized_reference=${checks.invalid_normalized_reference}`);
  console.log(`unsupported_protocol_as_supported=${checks.unsupported_protocol_as_supported}`);
  console.log(`search_text_empty=${checks.search_text_empty}`);
  console.log(`missing_content_hash=${checks.missing_content_hash}`);
  console.log(`hash_mismatch=${checks.hash_mismatch}`);
  console.log(`zod_validation=${checks.zod_validation_passed}/${checks.search_documents}`);
  console.log(`average_search_text_length=${metrics.average_search_text_length}`);
  console.log(`important_specification_count=${metrics.important_specification_count}`);
  console.log(`blockers=${report.blockers}`);
};
