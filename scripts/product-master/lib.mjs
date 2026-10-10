import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PRODUCT_MASTER_FIELDS = [
  'product_id',
  'model',
  'product_name_en',
  'category',
  'subcategory',
  'device_type',
  'product_url',
  'image_url',
  'status',
];

const REQUIRED_CANONICAL_FIELDS = [
  'product_id',
  'model',
  'product_name_en',
  'category',
  'subcategory',
  'device_type',
];
const ALLOWED_STATUSES = ['active', 'review'];
const MEANINGFUL_SUFFIXES = new Set([
  'at',
  'cc',
  'cell',
  'cr',
  'ds',
  'g2',
  'ha',
  'in',
  'mm',
  'mm2',
  'na',
  'nc',
  'nn',
  's',
  'sc',
  'sr',
  'st',
  'wifi',
  'wn',
  'xd',
  'xt',
]);

const RAW_RECORD_ALIASES = {
  CSI_RAINVUE10_MM: {
    raw_file: 'RainVue10-20.json',
    raw_index: 1,
    raw_product_id: 'CSI_RAINVUE10',
    raw_model: 'RainVue10',
    evidence: {
      specification_name: 'Available Configuration',
      value_includes: '0.1 mm',
    },
    reason:
      'RainVue10-MM is the 0.1 mm tip record; -MM2 is the separate 0.2 mm variant.',
  },
  CSI_SOILVUE10_5: {
    raw_file: 'SoilVue10.json',
    raw_index: 0,
    raw_product_id: 'CSI_SOILVUE10_0_5_M',
    raw_model: 'SoilVue10 – 0.5 m',
    evidence: {
      specification_name: 'Product Variant',
      value_includes: '0.5 m option',
    },
    reason: 'The canonical -5 variant is the raw 0.5 m option.',
  },
};

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(scriptsDirectory, '..', '..');
export const sourcePath = path.join(
  projectRoot,
  'data',
  'master',
  'product-master-source.json',
);
export const masterPath = path.join(
  projectRoot,
  'data',
  'master',
  'product-master.json',
);
export const reportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'product-master-report.json',
);
export const rawDirectory = path.join(projectRoot, 'data', 'raw');

const cleanUnicode = (value) =>
  value
    .replace(/đ/gu, 'd').replace(/Đ/gu, 'D') // NFKD does not decompose đ
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[™®©]/g, '');

const normalizeIdentity = (value) =>
  typeof value === 'string'
    ? cleanUnicode(value)
        .toLocaleLowerCase('en-US')
        .replace(/[^a-z0-9]/g, '')
    : '';

const identityTokens = (value) =>
  typeof value === 'string'
    ? cleanUnicode(value)
        .toLocaleLowerCase('en-US')
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
    : [];

const baseModelIdentity = (value) => {
  const tokens = identityTokens(value);
  while (tokens.length > 1 && MEANINGFUL_SUFFIXES.has(tokens.at(-1)))
    tokens.pop();
  return tokens.join('');
};

const basenameIdentity = (value) =>
  normalizeIdentity(path.parse(value ?? '').name);
const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isValidUrl = (value) => {
  if (value === null) return true;
  if (!isNonEmptyString(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const groupBy = (items, getKey) => {
  const result = new Map();
  for (const item of items) {
    const key = getKey(item);
    const group = result.get(key) ?? [];
    group.push(item);
    result.set(key, group);
  }
  return result;
};

const duplicateGroups = (items, field) =>
  [...groupBy(items, (item) => item[field]).entries()]
    .filter(([key, group]) => isNonEmptyString(key) && group.length > 1)
    .map(([value, group]) => ({
      value,
      count: group.length,
      product_ids: group.map((item) => item.product_id),
    }));

const rawLocation = (rawProduct) => ({
  raw_file: rawProduct.raw_file,
  raw_index: rawProduct.raw_index,
  raw_record_key: rawProduct.raw_record_key,
  raw_product_id: rawProduct.product_id ?? null,
  raw_model: rawProduct.model ?? null,
});

const candidateLocations = (rawProducts) => rawProducts.map(rawLocation);

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

export async function writeJson(filePath, value) {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  try {
    if ((await readFile(filePath, 'utf8')) === content) return false;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeFile(filePath, content, 'utf8');
  return true;
}

export const preserveGeneratedAtWhenUnchanged = (report, previousReport) => {
  if (!previousReport?.generated_at) return report;
  const currentComparable = { ...report, generated_at: null };
  const previousComparable = { ...previousReport, generated_at: null };
  return JSON.stringify(currentComparable) ===
    JSON.stringify(previousComparable)
    ? { ...report, generated_at: previousReport.generated_at }
    : report;
};

export async function loadRawProducts() {
  const fileNames = (await readdir(rawDirectory))
    .filter((fileName) => fileName.toLocaleLowerCase('en-US').endsWith('.json'))
    .sort((a, b) => a.localeCompare(b, 'en-US'));
  const rawProducts = [];
  const rawFileErrors = [];

  for (const fileName of fileNames) {
    const filePath = path.join(rawDirectory, fileName);
    try {
      const document = await readJson(filePath);
      if (!Array.isArray(document.products)) {
        rawFileErrors.push({
          file: fileName,
          message: 'Expected a products array.',
        });
        continue;
      }
      document.products.forEach((product, rawIndex) => {
        rawProducts.push({
          ...product,
          raw_file: fileName,
          raw_index: rawIndex,
          raw_record_key: `${fileName}#${rawIndex}`,
          raw_source_file: document.source?.file ?? null,
        });
      });
    } catch (error) {
      rawFileErrors.push({
        file: fileName,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return { fileNames, rawProducts, rawFileErrors };
}

const getSpecification = (rawProduct, name) =>
  rawProduct.specifications?.find(
    (specification) =>
      normalizeIdentity(specification.name_en) === normalizeIdentity(name),
  );

function explicitAliasMatch(sourceProduct, rawProducts) {
  const alias = RAW_RECORD_ALIASES[sourceProduct.product_id];
  if (!alias) return null;
  const candidate = rawProducts.find(
    (rawProduct) =>
      rawProduct.raw_file === alias.raw_file &&
      rawProduct.raw_index === alias.raw_index &&
      rawProduct.product_id === alias.raw_product_id &&
      rawProduct.model === alias.raw_model,
  );
  if (!candidate) {
    return {
      product: null,
      method: 'explicit_alias',
      candidate_count: 0,
      candidates: [],
      unresolved_reason: 'configured_alias_record_not_found',
      evidence: alias,
    };
  }
  const specification = getSpecification(
    candidate,
    alias.evidence.specification_name,
  );
  if (
    !isNonEmptyString(specification?.value_raw) ||
    !specification.value_raw
      .toLocaleLowerCase('en-US')
      .includes(alias.evidence.value_includes.toLocaleLowerCase('en-US'))
  ) {
    return {
      product: null,
      method: 'explicit_alias',
      candidate_count: 0,
      candidates: [rawLocation(candidate)],
      unresolved_reason: 'configured_alias_evidence_not_found',
      evidence: alias,
    };
  }
  return {
    product: candidate,
    method: 'explicit_alias',
    candidate_count: 1,
    candidates: [rawLocation(candidate)],
    unresolved_reason: null,
    evidence: {
      reason: alias.reason,
      specification_name: specification.name_en,
      specification_value: specification.value_raw,
    },
  };
}

const resolveCandidateGroup = (sourceProduct, candidates, method) => {
  if (candidates.length === 1) {
    return {
      product: candidates[0],
      method,
      candidate_count: 1,
      candidates: candidateLocations(candidates),
      unresolved_reason: null,
      evidence: null,
    };
  }
  const modelMatches = candidates.filter(
    (candidate) =>
      normalizeIdentity(candidate.model) ===
      normalizeIdentity(sourceProduct.model),
  );
  if (modelMatches.length === 1) {
    return {
      product: modelMatches[0],
      method: `${method}_model_disambiguated`,
      candidate_count: 1,
      candidates: candidateLocations(modelMatches),
      unresolved_reason: null,
      evidence: null,
    };
  }
  const nameMatches = candidates.filter(
    (candidate) =>
      isNonEmptyString(candidate.product_name_en) &&
      normalizeIdentity(candidate.product_name_en) ===
        normalizeIdentity(sourceProduct.product_name_en),
  );
  if (nameMatches.length === 1) {
    return {
      product: nameMatches[0],
      method: `${method}_name_disambiguated`,
      candidate_count: 1,
      candidates: candidateLocations(nameMatches),
      unresolved_reason: null,
      evidence: null,
    };
  }
  return {
    product: null,
    method,
    candidate_count: candidates.length,
    candidates: candidateLocations(candidates),
    unresolved_reason: 'multiple_raw_records_match_without_variant_evidence',
    evidence: null,
  };
};

export function createRawMatcher(rawProducts) {
  const byProductId = groupBy(rawProducts, (product) => product.product_id);
  const byModel = groupBy(rawProducts, (product) =>
    normalizeIdentity(product.model),
  );
  const byProductName = groupBy(rawProducts, (product) =>
    normalizeIdentity(product.product_name_en),
  );

  return (sourceProduct) => {
    const idMatches = byProductId.get(sourceProduct.product_id) ?? [];
    if (idMatches.length > 0)
      return resolveCandidateGroup(
        sourceProduct,
        idMatches,
        'exact_product_id',
      );
    const modelMatches =
      byModel.get(normalizeIdentity(sourceProduct.model)) ?? [];
    if (modelMatches.length > 0)
      return resolveCandidateGroup(
        sourceProduct,
        modelMatches,
        'normalized_model',
      );
    const aliasMatch = explicitAliasMatch(sourceProduct, rawProducts);
    if (aliasMatch) return aliasMatch;

    const sourceModel = normalizeIdentity(sourceProduct.model);
    const filenameMatches = rawProducts.filter(
      (rawProduct) =>
        basenameIdentity(rawProduct.raw_file) === sourceModel ||
        basenameIdentity(rawProduct.raw_source_file) === sourceModel,
    );
    if (filenameMatches.length > 0) {
      const result = resolveCandidateGroup(
        sourceProduct,
        filenameMatches,
        'filename_alias',
      );
      if (result.product) {
        result.evidence = {
          canonical_model: sourceProduct.model,
          raw_json_file: result.product.raw_file,
          raw_source_file: result.product.raw_source_file,
        };
      }
      return result;
    }

    const nameMatches =
      byProductName.get(normalizeIdentity(sourceProduct.product_name_en)) ?? [];
    if (nameMatches.length > 0)
      return resolveCandidateGroup(
        sourceProduct,
        nameMatches,
        'normalized_product_name',
      );

    const sourceBase = baseModelIdentity(sourceProduct.model);
    const familyCandidates = rawProducts.filter(
      (rawProduct) =>
        sourceBase !== '' && baseModelIdentity(rawProduct.model) === sourceBase,
    );
    const hasMeaningfulSuffixMismatch = familyCandidates.some(
      (rawProduct) =>
        normalizeIdentity(rawProduct.model) !==
        normalizeIdentity(sourceProduct.model),
    );
    return {
      product: null,
      method: null,
      candidate_count: 0,
      candidates: candidateLocations(familyCandidates),
      unresolved_reason:
        familyCandidates.length > 0 && hasMeaningfulSuffixMismatch
          ? 'meaningful_model_suffix_mismatch'
          : 'raw_record_not_found',
      evidence: null,
    };
  };
}

const getRawWarnings = (rawProduct) =>
  Array.isArray(rawProduct?.validation?.warnings)
    ? rawProduct.validation.warnings.filter(isNonEmptyString)
    : [];

const hasDocumentConflict = (rawProduct) =>
  getRawWarnings(rawProduct).some((warning) =>
    /document fields|references/i.test(warning),
  );

const getProductUrl = (rawProduct) => {
  if (!rawProduct || hasDocumentConflict(rawProduct)) return null;
  const candidate =
    rawProduct.documents?.product_url ??
    rawProduct.documents?.order_form ??
    null;
  return isValidUrl(candidate) ? candidate : null;
};

const getImageUrl = (rawProduct) => {
  const candidate = rawProduct?.media?.product_images?.[0]?.url ?? null;
  return isValidUrl(candidate) ? candidate : null;
};

function compareIdentity(sourceProduct, match) {
  if (!match.product) return [];
  const rawWarnings = getRawWarnings(match.product);
  const rawIdentityRequiresReview =
    match.product.identity_source?.model === 'manual_review' ||
    rawWarnings.some((warning) =>
      /model identity|model number.*while|identity conflict/iu.test(warning),
    );
  if (rawIdentityRequiresReview) {
    const declaredModel = getSpecification(match.product, 'Model Number');
    return [
      {
        field: 'model',
        master_value: sourceProduct.model,
        raw_value: declaredModel?.value_raw ?? match.product.model ?? null,
        raw_record_key: match.product.raw_record_key,
        reason: 'raw_identity_requires_review',
      },
    ];
  }
  const modelMatches =
    normalizeIdentity(sourceProduct.model) ===
    normalizeIdentity(match.product.model);
  const aliasProvesIdentity = ['explicit_alias', 'filename_alias'].includes(
    match.method,
  );
  if (modelMatches || aliasProvesIdentity) return [];
  return [
    {
      field: 'model',
      master_value: sourceProduct.model,
      raw_value: match.product.model ?? null,
      raw_record_key: match.product.raw_record_key,
    },
  ];
}

function compareTaxonomy(masterProduct, rawProduct) {
  if (!rawProduct) return [];
  const rawTaxonomy = rawProduct.taxonomy ?? {};
  return ['category', 'subcategory', 'device_type'].flatMap((field) => {
    const rawValue = rawTaxonomy[field];
    if (rawValue === null || rawValue === undefined || rawValue === '')
      return [];
    if (normalizeIdentity(masterProduct[field]) === normalizeIdentity(rawValue))
      return [];
    return [
      {
        field,
        master_value: masterProduct[field],
        raw_value: rawValue,
        raw_record_key: rawProduct.raw_record_key,
      },
    ];
  });
}

const getRawNameAlias = (sourceProduct, rawProduct) => {
  if (
    !rawProduct ||
    !isNonEmptyString(sourceProduct.product_name_en) ||
    !isNonEmptyString(rawProduct.product_name_en) ||
    normalizeIdentity(sourceProduct.product_name_en) ===
      normalizeIdentity(rawProduct.product_name_en)
  )
    return null;
  return {
    canonical_name: sourceProduct.product_name_en,
    raw_alias: rawProduct.product_name_en,
    raw_record_key: rawProduct.raw_record_key,
  };
};

const hasCanonicalTaxonomy = (product) =>
  REQUIRED_CANONICAL_FIELDS.every((field) => isNonEmptyString(product[field]));

function createBuildMetadata(
  canonicalProduct,
  match,
  product,
  sourceMetadata = canonicalProduct,
) {
  const rawProduct = match.product;
  const identityConflicts = compareIdentity(canonicalProduct, match);
  const taxonomyConflicts = compareTaxonomy(product, rawProduct);
  return {
    product_id: product.product_id,
    ...rawLocation(
      rawProduct ?? {
        raw_file: null,
        raw_index: null,
        raw_record_key: null,
        product_id: null,
        model: null,
      },
    ),
    match_method: match.method,
    match_candidate_count: match.candidate_count,
    match_candidates: match.candidates,
    match_evidence: match.evidence,
    unresolved_reason:
      match.unresolved_reason ??
      (identityConflicts.length > 0
        ? 'raw_identity_conflict'
        : taxonomyConflicts.length > 0
          ? 'raw_taxonomy_conflict'
          : null),
    source_verified: sourceMetadata.verified ?? null,
    identity_conflicts: identityConflicts,
    taxonomy_conflicts: taxonomyConflicts,
    raw_name_alias: getRawNameAlias(canonicalProduct, rawProduct),
    raw_warnings: getRawWarnings(rawProduct),
  };
}

const mappingIsActive = (product, metadata) =>
  metadata.raw_record_key !== null &&
  metadata.match_candidate_count === 1 &&
  metadata.identity_conflicts.length === 0 &&
  metadata.taxonomy_conflicts.length === 0 &&
  hasCanonicalTaxonomy(product);

export async function buildProductMaster() {
  const canonicalProducts = await readJson(masterPath);
  const sourceProducts = await readJson(sourcePath);
  const rawInventory = await loadRawProducts();
  const findRawProduct = createRawMatcher(rawInventory.rawProducts);
  const buildMetadata = [];
  const products = canonicalProducts.map((canonicalProduct) => {
    const sourceMetadata = sourceProducts.find(
      (item) => item.product_id === canonicalProduct.product_id,
    );
    const match = findRawProduct(canonicalProduct);
    const product = {
      product_id: canonicalProduct.product_id ?? null,
      model: canonicalProduct.model ?? null,
      product_name_en: canonicalProduct.product_name_en ?? null,
      category: canonicalProduct.category ?? null,
      subcategory: canonicalProduct.subcategory ?? null,
      device_type: canonicalProduct.device_type ?? null,
      product_url: getProductUrl(match.product),
      image_url: getImageUrl(match.product),
      status: 'review',
    };
    const metadata = createBuildMetadata(
      canonicalProduct,
      match,
      product,
      sourceMetadata,
    );
    if (mappingIsActive(product, metadata)) product.status = 'active';
    buildMetadata.push(metadata);
    return product;
  });
  return { products, sourceProducts, rawInventory, buildMetadata };
}

export async function validateProductMaster(products, context = {}) {
  const sourceProducts = context.sourceProducts ?? (await readJson(sourcePath));
  const rawInventory = context.rawInventory ?? (await loadRawProducts());
  const findRawProduct = createRawMatcher(rawInventory.rawProducts);
  const buildMetadata =
    context.buildMetadata ??
    products.map((product) => {
      const sourceMetadata = sourceProducts.find(
        (item) => item.product_id === product.product_id,
      );
      return createBuildMetadata(
        product,
        findRawProduct(product),
        product,
        sourceMetadata,
      );
    });

  const duplicateProductIds = duplicateGroups(products, 'product_id');
  const duplicateModels = duplicateGroups(products, 'model');
  const missingKeys = products.flatMap((product, index) => {
    const fields = PRODUCT_MASTER_FIELDS.filter(
      (field) => !Object.hasOwn(product, field),
    );
    return fields.length === 0
      ? []
      : [{ index, product_id: product.product_id ?? null, fields }];
  });
  const unexpectedKeys = products.flatMap((product, index) => {
    const fields = Object.keys(product).filter(
      (field) => !PRODUCT_MASTER_FIELDS.includes(field),
    );
    return fields.length === 0
      ? []
      : [{ index, product_id: product.product_id ?? null, fields }];
  });
  const missingRequiredValues = products.flatMap((product) => {
    const fields = REQUIRED_CANONICAL_FIELDS.filter(
      (field) => !isNonEmptyString(product[field]),
    );
    return fields.length === 0
      ? []
      : [{ product_id: product.product_id ?? null, fields }];
  });
  const optionalNullFields = products.flatMap((product) => {
    const fields = ['product_url', 'image_url'].filter(
      (field) => product[field] === null,
    );
    return fields.length === 0
      ? []
      : [{ product_id: product.product_id ?? null, fields }];
  });
  const invalidStatuses = products
    .filter((product) => !ALLOWED_STATUSES.includes(product.status))
    .map((product) => ({
      product_id: product.product_id ?? null,
      value: product.status ?? null,
    }));
  const invalidUrls = products.flatMap((product) =>
    ['product_url', 'image_url'].flatMap((field) =>
      isValidUrl(product[field])
        ? []
        : [
            {
              product_id: product.product_id ?? null,
              field,
              value: product[field],
            },
          ],
    ),
  );
  const sourceMetadataDifferences = sourceProducts.flatMap((sourceProduct) => {
    const product = products.find(
      (item) => item.product_id === sourceProduct.product_id,
    );
    if (!product)
      return [
        { product_id: sourceProduct.product_id, issue: 'missing_from_master' },
      ];
    return [
      'model',
      'product_name_en',
      'category',
      'subcategory',
      'device_type',
    ].flatMap((field) =>
      product[field] === sourceProduct[field]
        ? []
        : [
            {
              product_id: sourceProduct.product_id,
              field,
              source_value: sourceProduct[field] ?? null,
              master_value: product[field] ?? null,
            },
          ],
    );
  });
  const taxonomyConflicts = buildMetadata.flatMap((metadata) =>
    metadata.taxonomy_conflicts.map((conflict) => ({
      product_id: metadata.product_id,
      ...conflict,
    })),
  );
  const trueIdentityConflicts = buildMetadata.flatMap((metadata) =>
    metadata.identity_conflicts.map((conflict) => ({
      product_id: metadata.product_id,
      ...conflict,
    })),
  );
  const productsNotMatchingRaw = buildMetadata
    .filter((metadata) => metadata.raw_record_key === null)
    .map((metadata) => ({
      product_id: metadata.product_id,
      reason: metadata.unresolved_reason,
      candidates: metadata.match_candidates,
    }));
  const ambiguousRawMatches = buildMetadata
    .filter(
      (metadata) =>
        metadata.raw_record_key === null && metadata.match_candidate_count > 1,
    )
    .map((metadata) => ({
      product_id: metadata.product_id,
      candidate_count: metadata.match_candidate_count,
      match_method: metadata.match_method,
      candidates: metadata.match_candidates,
    }));
  const duplicateRawTargets = [
    ...groupBy(
      buildMetadata.filter((metadata) => metadata.raw_record_key !== null),
      (metadata) => metadata.raw_record_key,
    ).entries(),
  ]
    .filter(([, group]) => group.length > 1)
    .map(([rawRecordKey, group]) => ({
      raw_record_key: rawRecordKey,
      product_ids: group.map((metadata) => metadata.product_id),
    }));
  const statusMismatches = products.flatMap((product) => {
    const metadata = buildMetadata.find(
      (item) => item.product_id === product.product_id,
    );
    const expected =
      metadata && mappingIsActive(product, metadata) ? 'active' : 'review';
    return product.status === expected
      ? []
      : [
          {
            product_id: product.product_id ?? null,
            expected,
            actual: product.status ?? null,
          },
        ];
  });
  const rawDuplicateProductIds = [
    ...groupBy(rawInventory.rawProducts, (item) => item.product_id).entries(),
  ]
    .filter(
      ([productId, group]) => isNonEmptyString(productId) && group.length > 1,
    )
    .map(([productId, group]) => ({
      product_id: productId,
      count: group.length,
      locations: candidateLocations(group),
    }));
  const rawNameAliases = buildMetadata
    .filter((metadata) => metadata.raw_name_alias !== null)
    .map((metadata) => ({
      product_id: metadata.product_id,
      ...metadata.raw_name_alias,
    }));
  const rawSourceWarnings = buildMetadata
    .filter((metadata) => metadata.raw_warnings.length > 0)
    .map((metadata) => ({
      product_id: metadata.product_id,
      raw_record_key: metadata.raw_record_key,
      warnings: metadata.raw_warnings,
    }));
  const sourceVerificationMetadata = sourceProducts.map((sourceProduct) => ({
    product_id: sourceProduct.product_id,
    verified: sourceProduct.verified ?? null,
  }));

  const blockingErrors =
    duplicateProductIds.length +
    duplicateModels.length +
    missingKeys.length +
    unexpectedKeys.length +
    missingRequiredValues.length +
    invalidStatuses.length +
    invalidUrls.length +
    taxonomyConflicts.length +
    trueIdentityConflicts.length +
    productsNotMatchingRaw.length +
    duplicateRawTargets.length +
    statusMismatches.length +
    rawInventory.rawFileErrors.length;
  const statusCounts = Object.fromEntries(
    [...groupBy(products, (product) => product.status).entries()].map(
      ([status, group]) => [status, group.length],
    ),
  );

  return {
    schema_version: '2.0',
    generated_at: new Date().toISOString(),
    validation_status: blockingErrors === 0 ? 'passed' : 'failed',
    summary: {
      actual_product_count: products.length,
      unique_product_id_count: new Set(
        products.map((product) => product.product_id),
      ).size,
      unique_model_count: new Set(products.map((product) => product.model))
        .size,
      active_count: statusCounts.active ?? 0,
      review_count: statusCounts.review ?? 0,
      raw_file_count: rawInventory.fileNames.length,
      raw_product_record_count: rawInventory.rawProducts.length,
      raw_unique_product_id_count: new Set(
        rawInventory.rawProducts.map((item) => item.product_id),
      ).size,
      matched_raw_count: products.length - productsNotMatchingRaw.length,
      unmatched_raw_count: productsNotMatchingRaw.length,
      taxonomy_conflict_count: taxonomyConflicts.length,
      true_identity_conflict_count: trueIdentityConflicts.length,
      ambiguous_raw_match_count: ambiguousRawMatches.length,
      blocking_errors: blockingErrors,
    },
    checks: {
      duplicate_product_ids: {
        passed: duplicateProductIds.length === 0,
        items: duplicateProductIds,
      },
      duplicate_models: {
        passed: duplicateModels.length === 0,
        items: duplicateModels,
      },
      missing_keys: { passed: missingKeys.length === 0, items: missingKeys },
      unexpected_keys: {
        passed: unexpectedKeys.length === 0,
        items: unexpectedKeys,
      },
      missing_required_values: {
        passed: missingRequiredValues.length === 0,
        items: missingRequiredValues,
      },
      optional_null_fields: {
        passed: true,
        allowed: true,
        items: optionalNullFields,
      },
      invalid_statuses: {
        passed: invalidStatuses.length === 0,
        items: invalidStatuses,
      },
      invalid_urls: { passed: invalidUrls.length === 0, items: invalidUrls },
      taxonomy_conflicts: {
        passed: taxonomyConflicts.length === 0,
        items: taxonomyConflicts,
      },
      true_identity_conflicts: {
        passed: trueIdentityConflicts.length === 0,
        items: trueIdentityConflicts,
      },
      products_not_matching_raw: {
        passed: productsNotMatchingRaw.length === 0,
        items: productsNotMatchingRaw,
      },
      ambiguous_raw_matches: {
        passed: ambiguousRawMatches.length === 0,
        items: ambiguousRawMatches,
      },
      duplicate_raw_targets: {
        passed: duplicateRawTargets.length === 0,
        items: duplicateRawTargets,
      },
      status_consistency: {
        passed: statusMismatches.length === 0,
        items: statusMismatches,
      },
      raw_file_errors: {
        passed: rawInventory.rawFileErrors.length === 0,
        items: rawInventory.rawFileErrors,
      },
      raw_duplicate_product_ids: {
        passed: true,
        handled_by: 'raw_file + raw_index + raw_record_key',
        items: rawDuplicateProductIds,
      },
    },
    informational: {
      raw_name_aliases: rawNameAliases,
      raw_source_warnings: rawSourceWarnings,
      source_verification_metadata: sourceVerificationMetadata,
      source_metadata_differences: sourceMetadataDifferences,
    },
    mappings: buildMetadata.map((metadata) => ({
      product_id: metadata.product_id,
      raw_file: metadata.raw_file,
      raw_index: metadata.raw_index,
      raw_record_key: metadata.raw_record_key,
      raw_product_id: metadata.raw_product_id,
      raw_model: metadata.raw_model,
      match_method: metadata.match_method,
      match_evidence: metadata.match_evidence,
      unresolved_reason: metadata.unresolved_reason,
    })),
  };
}

export function printValidationSummary(report) {
  const { summary } = report;
  console.log(`Product Master validation: ${report.validation_status}`);
  console.log(`Products: ${summary.actual_product_count}`);
  console.log(
    `Unique: ${summary.unique_product_id_count} product_id, ${summary.unique_model_count} model`,
  );
  console.log(
    `Status: ${summary.active_count} active, ${summary.review_count} review`,
  );
  console.log(
    `Raw match: ${summary.matched_raw_count} matched, ${summary.unmatched_raw_count} unmatched`,
  );
  console.log(`Blocking errors: ${summary.blocking_errors}`);
}
