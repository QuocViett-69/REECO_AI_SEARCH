import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..', '..');
const masterPath = path.join(
  projectRoot,
  'data',
  'master',
  'product-master.json',
);
const specificationsDirectory = path.join(
  projectRoot,
  'data',
  'normalized',
  'specifications',
);
const documentsDirectory = path.join(projectRoot, 'data', 'search-documents');
const reportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'supabase-data-foundation-report.json',
);
const indexVersion = process.env.SEARCH_INDEX_VERSION ?? 'fts-v1';
const testQueries = [
  'CS655',
  'soil moisture',
  'cảm biến độ ẩm đất',
  'SDI-12',
  'Modbus',
  '900 MHz radio',
  'power supply',
];

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const validateOnly = args.has('--validate-only');

const readJson = async (filePath) =>
  JSON.parse(await readFile(filePath, 'utf8'));
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
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
const documentHash = (document) => {
  const { content_hash: _contentHash, ...canonicalContent } = document;
  return sha256(canonicalJson(canonicalContent));
};
const specificationSourceKey = (specification) =>
  sha256(
    canonicalJson({
      canonical_key: specification.canonical_key,
      raw_ref: specification.raw_ref,
    }),
  );

async function loadSourceData() {
  const master = await readJson(masterPath);
  const activeIds = new Set(
    master
      .filter((product) => product.status === 'active')
      .map((product) => product.product_id),
  );
  const reviewIds = new Set(
    master
      .filter((product) => product.status === 'review')
      .map((product) => product.product_id),
  );
  const documentFiles = (await readdir(documentsDirectory))
    .filter((file) => file.endsWith('.json'))
    .sort();
  const specificationFiles = (await readdir(specificationsDirectory))
    .filter((file) => file.endsWith('.json'))
    .sort();
  const documents = await Promise.all(
    documentFiles.map((file) => readJson(path.join(documentsDirectory, file))),
  );
  const specificationDocuments = await Promise.all(
    specificationFiles.map((file) =>
      readJson(path.join(specificationsDirectory, file)),
    ),
  );

  const sourceErrors = [];
  const duplicateProductIds =
    master.length - new Set(master.map((product) => product.product_id)).size;
  const duplicateModels =
    master.length - new Set(master.map((product) => product.model)).size;
  if (master.length !== 50)
    sourceErrors.push(`Expected 50 products, found ${master.length}`);
  if (activeIds.size !== 42)
    sourceErrors.push(`Expected 42 active products, found ${activeIds.size}`);
  if (reviewIds.size !== 8)
    sourceErrors.push(`Expected 8 review products, found ${reviewIds.size}`);
  if (duplicateProductIds !== 0)
    sourceErrors.push(
      `Found ${duplicateProductIds} duplicate product_id values`,
    );
  if (duplicateModels !== 0)
    sourceErrors.push(`Found ${duplicateModels} duplicate model values`);

  const activeDocuments = documents.filter((document) =>
    activeIds.has(document.product_id),
  );
  const nonActiveDocuments = documents.filter(
    (document) => !activeIds.has(document.product_id),
  );
  const hashMismatches = activeDocuments.filter(
    (document) => document.content_hash !== documentHash(document),
  );
  if (activeDocuments.length !== 42)
    sourceErrors.push(
      `Expected 42 active documents, found ${activeDocuments.length}`,
    );
  if (nonActiveDocuments.length !== 0)
    sourceErrors.push(
      `Found ${nonActiveDocuments.length} non-active documents`,
    );
  if (hashMismatches.length !== 0)
    sourceErrors.push(
      `Found ${hashMismatches.length} source document hash mismatches`,
    );

  const specifications = specificationDocuments
    .flatMap((document) => document.specifications)
    .filter(
      (specification) =>
        activeIds.has(specification.product_id) &&
        specification.normalized !== null,
    )
    .map((specification) => ({
      product_id: specification.product_id,
      source_key: specificationSourceKey(specification),
      canonical_key: specification.canonical_key,
      quantity_kind: specification.quantity_kind ?? null,
      normalized_value: specification.normalized,
      raw_ref: specification.raw_ref,
    }));

  const media = master
    .filter((product) => product.image_url || product.product_url)
    .map((product) => ({
      product_id: product.product_id,
      media_type: 'primary',
      image_url: product.image_url ?? null,
      product_url: product.product_url ?? null,
      position: 0,
      metadata: {},
    }));

  const products = master.map((product) => ({
    product_id: product.product_id,
    model: product.model,
    product_name_en: product.product_name_en,
    category: product.category ?? null,
    subcategory: product.subcategory ?? null,
    device_type: product.device_type ?? null,
    status: product.status,
  }));

  return {
    sourceErrors,
    products,
    activeIds: [...activeIds],
    reviewIds: [...reviewIds],
    specifications,
    documents: activeDocuments.map((document) => ({
      product_id: document.product_id,
      search_document: document,
      search_text_en: document.search_text_en,
      search_text_vi: document.search_text_vi,
      search_text: document.search_text,
      content_hash: document.content_hash,
    })),
    media,
    searchIndex: activeDocuments.map((document) => ({
      product_id: document.product_id,
      search_text: document.search_text,
      source_content_hash: document.content_hash,
      index_version: indexVersion,
    })),
    sourceValidation: {
      products: master.length,
      active: activeIds.size,
      review: reviewIds.size,
      product_documents: activeDocuments.length,
      product_search_index: activeDocuments.length,
      product_specifications: specifications.length,
      product_media: media.length,
      duplicate_product_id: duplicateProductIds,
      duplicate_model: duplicateModels,
      document_hash_mismatch: hashMismatches.length,
    },
  };
}

async function importData(sql, data) {
  return sql.begin(async (transaction) => {
    const stats = {
      products_changed: 0,
      specifications_changed: 0,
      specifications_removed: 0,
      documents_changed: 0,
      documents_removed: 0,
      media_changed: 0,
      media_removed: 0,
      search_index_changed: 0,
      search_index_removed: 0,
    };
    const specificationRows = data.specifications.map((specification) => ({
      ...specification,
      normalized_value: transaction.json(specification.normalized_value),
      raw_ref: transaction.json(specification.raw_ref),
    }));
    const documentRows = data.documents.map((document) => ({
      ...document,
      search_document: transaction.json(document.search_document),
    }));
    const mediaRows = data.media.map((media) => ({
      ...media,
      metadata: transaction.json(media.metadata),
    }));

    const productsResult = await transaction`
      insert into public.products ${transaction(
        data.products,
        'product_id',
        'model',
        'product_name_en',
        'category',
        'subcategory',
        'device_type',
        'status',
      )}
      on conflict (product_id) do update set
        model = excluded.model,
        product_name_en = excluded.product_name_en,
        category = excluded.category,
        subcategory = excluded.subcategory,
        device_type = excluded.device_type,
        status = excluded.status,
        updated_at = now()
      where (products.model, products.product_name_en, products.category, products.subcategory,
        products.device_type, products.status)
        is distinct from
        (excluded.model, excluded.product_name_en, excluded.category, excluded.subcategory,
          excluded.device_type, excluded.status)
    `;
    stats.products_changed = productsResult.count;

    for (const productId of data.activeIds) {
      const sourceKeys = data.specifications
        .filter((specification) => specification.product_id === productId)
        .map((specification) => specification.source_key);
      const removed =
        sourceKeys.length === 0
          ? await transaction`delete from public.product_specifications where product_id = ${productId}`
          : await transaction`
            delete from public.product_specifications
            where product_id = ${productId}
              and not (source_key = any(${transaction.array(sourceKeys)}::text[]))
          `;
      stats.specifications_removed += removed.count;
    }
    const removedReviewSpecs = await transaction`
      delete from public.product_specifications
      where product_id = any(${transaction.array(data.reviewIds)}::text[])
    `;
    stats.specifications_removed += removedReviewSpecs.count;

    if (specificationRows.length > 0) {
      const specificationsResult = await transaction`
        insert into public.product_specifications ${transaction(
          specificationRows,
          'product_id',
          'source_key',
          'canonical_key',
          'quantity_kind',
          'normalized_value',
          'raw_ref',
        )}
        on conflict (product_id, source_key) do update set
          canonical_key = excluded.canonical_key,
          quantity_kind = excluded.quantity_kind,
          normalized_value = excluded.normalized_value,
          raw_ref = excluded.raw_ref,
          updated_at = now()
        where (product_specifications.canonical_key, product_specifications.quantity_kind,
          product_specifications.normalized_value, product_specifications.raw_ref)
          is distinct from
          (excluded.canonical_key, excluded.quantity_kind, excluded.normalized_value, excluded.raw_ref)
      `;
      stats.specifications_changed = specificationsResult.count;
    }

    const desiredDocumentIds = data.documents.map(
      (document) => document.product_id,
    );
    const documentsRemoved = await transaction`
      delete from public.product_documents
      where product_id = any(${transaction.array([...data.activeIds, ...data.reviewIds])}::text[])
        and not (product_id = any(${transaction.array(desiredDocumentIds)}::text[]))
    `;
    stats.documents_removed = documentsRemoved.count;
    const documentsResult = await transaction`
      insert into public.product_documents ${transaction(
        documentRows,
        'product_id',
        'search_document',
        'search_text_en',
        'search_text_vi',
        'search_text',
        'content_hash',
      )}
      on conflict (product_id) do update set
        search_document = excluded.search_document,
        search_text_en = excluded.search_text_en,
        search_text_vi = excluded.search_text_vi,
        search_text = excluded.search_text,
        content_hash = excluded.content_hash,
        updated_at = now()
      where product_documents.content_hash is distinct from excluded.content_hash
    `;
    stats.documents_changed = documentsResult.count;

    const desiredMediaIds = data.media.map((item) => item.product_id);
    const mediaRemoved = await transaction`
      delete from public.product_media
      where media_type = 'primary'
        and product_id = any(${transaction.array([...data.activeIds, ...data.reviewIds])}::text[])
        and not (product_id = any(${transaction.array(desiredMediaIds)}::text[]))
    `;
    stats.media_removed = mediaRemoved.count;
    if (mediaRows.length > 0) {
      const mediaResult = await transaction`
        insert into public.product_media ${transaction(
          mediaRows,
          'product_id',
          'media_type',
          'image_url',
          'product_url',
          'position',
          'metadata',
        )}
        on conflict (product_id, media_type, position) do update set
          image_url = excluded.image_url,
          product_url = excluded.product_url,
          metadata = excluded.metadata,
          updated_at = now()
        where (product_media.image_url, product_media.product_url, product_media.metadata)
          is distinct from (excluded.image_url, excluded.product_url, excluded.metadata)
      `;
      stats.media_changed = mediaResult.count;
    }

    const desiredSearchIds = data.searchIndex.map((item) => item.product_id);
    const searchRemoved = await transaction`
      delete from public.product_search_index
      where product_id = any(${transaction.array([...data.activeIds, ...data.reviewIds])}::text[])
        and not (product_id = any(${transaction.array(desiredSearchIds)}::text[]))
    `;
    stats.search_index_removed = searchRemoved.count;
    const searchResult = await transaction`
      insert into public.product_search_index ${transaction(
        data.searchIndex,
        'product_id',
        'search_text',
        'source_content_hash',
        'index_version',
      )}
      on conflict (product_id) do update set
        search_text = excluded.search_text,
        source_content_hash = excluded.source_content_hash,
        index_version = excluded.index_version,
        embedding = null,
        embedding_model = null,
        embedding_dimensions = null,
        embedding_version = null,
        embedded_at = null,
        updated_at = now()
      where product_search_index.source_content_hash is distinct from excluded.source_content_hash
        or product_search_index.index_version is distinct from excluded.index_version
    `;
    stats.search_index_changed = searchResult.count;
    return stats;
  });
}

async function validateDatabase(sql) {
  const [counts, checks, indexes, extensions] = await Promise.all([
    sql`
      select 'products' as table_name, count(*)::integer as row_count from public.products
      union all select 'product_specifications', count(*)::integer from public.product_specifications
      union all select 'product_documents', count(*)::integer from public.product_documents
      union all select 'product_media', count(*)::integer from public.product_media
      union all select 'product_search_index', count(*)::integer from public.product_search_index
      order by table_name
    `,
    sql`
      select
        (select count(*)::integer from public.products where status = 'active') as active,
        (select count(*)::integer from public.products where status = 'review') as review,
        (select count(*)::integer
          from public.product_search_index search_index
          join public.products products using (product_id)
          where products.status = 'review') as review_products_indexed,
        (select count(*)::integer from public.product_specifications specifications
          left join public.products products using (product_id)
          where products.product_id is null) as orphan_specifications,
        (select count(*)::integer from public.product_documents documents
          left join public.products products using (product_id)
          where products.product_id is null) as orphan_documents,
        (select count(*)::integer from public.product_search_index search_index
          left join public.products products using (product_id)
          where products.product_id is null) as orphan_search_index,
        (select count(*)::integer - count(distinct product_id)::integer from public.products) as duplicate_product_id,
        (select count(*)::integer - count(distinct model)::integer from public.products) as duplicate_model,
        (select count(*)::integer from public.product_documents
          where content_hash is distinct from search_document ->> 'content_hash') as document_hash_mismatch,
        (select count(*)::integer from public.product_search_index search_index
          left join public.product_documents documents using (product_id)
          where documents.product_id is null
            or search_index.source_content_hash is distinct from documents.content_hash) as search_index_hash_mismatch
    `,
    sql`
      select indexname, indexdef
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'product_search_index'
        and indexname = 'product_search_index_search_tsv_idx'
    `,
    sql`select exists(select 1 from pg_extension where extname = 'vector') as vector_enabled`,
  ]);

  const check = checks[0];
  const invalidFk =
    check.orphan_specifications +
    check.orphan_documents +
    check.orphan_search_index;
  const tableCounts = Object.fromEntries(
    counts.map((row) => [row.table_name, row.row_count]),
  );
  const expectedChecks = {
    products: tableCounts.products === 50,
    active: check.active === 42,
    review: check.review === 8,
    product_documents: tableCounts.product_documents === 42,
    product_search_index: tableCounts.product_search_index === 42,
    review_products_indexed: check.review_products_indexed === 0,
    orphan_specifications: check.orphan_specifications === 0,
    orphan_documents: check.orphan_documents === 0,
    orphan_search_index: check.orphan_search_index === 0,
    duplicate_product_id: check.duplicate_product_id === 0,
    duplicate_model: check.duplicate_model === 0,
    document_hash_mismatch: check.document_hash_mismatch === 0,
    search_index_hash_mismatch: check.search_index_hash_mismatch === 0,
    invalid_fk: invalidFk === 0,
    fts_gin_index:
      indexes.length === 1 &&
      indexes[0].indexdef.toLowerCase().includes('using gin'),
  };

  return {
    status: Object.values(expectedChecks).every(Boolean) ? 'passed' : 'failed',
    rows_per_table: tableCounts,
    checks: { ...check, invalid_fk: invalidFk },
    assertions: expectedChecks,
    fts_index: indexes[0] ?? null,
    vector_enabled: extensions[0]?.vector_enabled ?? false,
  };
}

async function runKeywordTests(sql) {
  const results = {};
  for (const query of testQueries) {
    results[query] = await sql`
      select product_id, model, product_name_en, rank
      from public.search_products_keyword(${query}, 5)
    `;
  }
  return results;
}

async function writeReport(report) {
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

async function main() {
  const data = await loadSourceData();
  if (data.sourceErrors.length > 0) {
    throw new Error(
      `Source validation failed:\n- ${data.sourceErrors.join('\n- ')}`,
    );
  }

  if (dryRun) {
    const report = {
      generated_at: new Date().toISOString(),
      mode: 'dry-run',
      index_version: indexVersion,
      source_validation: data.sourceValidation,
      source_status: 'passed',
      database_status: 'not-run',
    };
    await writeReport(report);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl)
    throw new Error('DATABASE_URL is required unless --dry-run is used');
  const sql = postgres(databaseUrl, { max: 1, prepare: false });
  try {
    const importStats = validateOnly ? null : await importData(sql, data);
    const validation = await validateDatabase(sql);
    const keywordResults = await runKeywordTests(sql);
    const report = {
      generated_at: new Date().toISOString(),
      mode: validateOnly ? 'validate-only' : 'import',
      index_version: indexVersion,
      source_validation: data.sourceValidation,
      source_status: 'passed',
      import_status: validateOnly ? 'not-run' : 'completed',
      import_stats: importStats,
      validation,
      keyword_results: keywordResults,
    };
    await writeReport(report);
    console.log(JSON.stringify(report, null, 2));
    if (validation.status !== 'passed') process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

await main();
