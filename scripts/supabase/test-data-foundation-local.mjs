import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..', '..');
const migrationPath = path.join(
  projectRoot,
  'supabase',
  'migrations',
  '20260915034753_data_foundation_v1.sql',
);
const hardeningMigrationPath = path.join(
  projectRoot,
  'supabase',
  'migrations',
  '20260915082000_harden_rls_auto_enable.sql',
);
const reportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'supabase-data-foundation-local-test-report.json',
);
const testQueries = [
  'CS655',
  'soil moisture',
  'cảm biến độ ẩm đất',
  'SDI-12',
  'Modbus',
  '900 MHz radio',
  'power supply',
];

const readJson = async (filePath) =>
  JSON.parse(await readFile(filePath, 'utf8'));
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
const sortedSetDifference = (left, right) =>
  [...left].filter((value) => !right.has(value)).sort();
const sortedSetIntersection = (left, right) =>
  [...left].filter((value) => right.has(value)).sort();
const duplicateValues = (values) =>
  [
    ...new Set(
      values.filter((value, index) => values.indexOf(value) !== index),
    ),
  ].sort();
const sameStringSets = (left, right) =>
  left.size === right.size && [...left].every((value) => right.has(value));

async function loadData() {
  const products = await readJson(
    path.join(projectRoot, 'data', 'master', 'product-master.json'),
  );
  const activeIds = new Set(
    products
      .filter((product) => product.status === 'active')
      .map((product) => product.product_id),
  );
  const reviewIds = new Set(
    products
      .filter((product) => product.status === 'review')
      .map((product) => product.product_id),
  );
  const documentFiles = (
    await readdir(path.join(projectRoot, 'data', 'search-documents'))
  )
    .filter((file) => file.endsWith('.json'))
    .sort();
  const specificationFiles = (
    await readdir(
      path.join(projectRoot, 'data', 'normalized', 'specifications'),
    )
  )
    .filter((file) => file.endsWith('.json'))
    .sort();
  const documents = await Promise.all(
    documentFiles.map((file) =>
      readJson(path.join(projectRoot, 'data', 'search-documents', file)),
    ),
  );
  const specificationDocuments = await Promise.all(
    specificationFiles.map((file) =>
      readJson(
        path.join(projectRoot, 'data', 'normalized', 'specifications', file),
      ),
    ),
  );
  const specifications = specificationDocuments
    .flatMap((document) => document.specifications)
    .filter(
      (specification) =>
        activeIds.has(specification.product_id) &&
        specification.normalized !== null,
    )
    .map((specification) => ({
      ...specification,
      source_key: sha256(
        canonicalJson({
          canonical_key: specification.canonical_key,
          raw_ref: specification.raw_ref,
        }),
      ),
    }));
  return {
    products,
    activeIds,
    reviewIds,
    documentIds: new Set(documents.map((document) => document.product_id)),
    documents,
    specifications,
  };
}

async function seedDatabase(database, data) {
  await database.transaction(async (transaction) => {
    for (const product of data.products) {
      await transaction.query(
        `insert into public.products
          (product_id, model, product_name_en, category, subcategory, device_type, status)
         values ($1, $2, $3, $4, $5, $6, $7)
         on conflict (product_id) do update set
           model = excluded.model,
           product_name_en = excluded.product_name_en,
           category = excluded.category,
           subcategory = excluded.subcategory,
           device_type = excluded.device_type,
           status = excluded.status,
           updated_at = now()
         where (products.model, products.product_name_en, products.category, products.subcategory,
           products.device_type, products.status) is distinct from
           (excluded.model, excluded.product_name_en, excluded.category, excluded.subcategory,
             excluded.device_type, excluded.status)`,
        [
          product.product_id,
          product.model,
          product.product_name_en,
          product.category,
          product.subcategory,
          product.device_type,
          product.status,
        ],
      );
    }

    for (const specification of data.specifications) {
      await transaction.query(
        `insert into public.product_specifications
          (product_id, source_key, canonical_key, quantity_kind, normalized_value, raw_ref)
         values ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
         on conflict (product_id, source_key) do update set
           canonical_key = excluded.canonical_key,
           quantity_kind = excluded.quantity_kind,
           normalized_value = excluded.normalized_value,
           raw_ref = excluded.raw_ref,
           updated_at = now()
         where (product_specifications.canonical_key, product_specifications.quantity_kind,
           product_specifications.normalized_value, product_specifications.raw_ref) is distinct from
           (excluded.canonical_key, excluded.quantity_kind, excluded.normalized_value, excluded.raw_ref)`,
        [
          specification.product_id,
          specification.source_key,
          specification.canonical_key,
          specification.quantity_kind ?? null,
          JSON.stringify(specification.normalized),
          JSON.stringify(specification.raw_ref),
        ],
      );
    }

    for (const document of data.documents) {
      await transaction.query(
        `insert into public.product_documents
          (product_id, search_document, search_text_en, search_text_vi, search_text, content_hash)
         values ($1, $2::jsonb, $3, $4, $5, $6)
         on conflict (product_id) do update set
           search_document = excluded.search_document,
           search_text_en = excluded.search_text_en,
           search_text_vi = excluded.search_text_vi,
           search_text = excluded.search_text,
           content_hash = excluded.content_hash,
           updated_at = now()
         where product_documents.content_hash is distinct from excluded.content_hash`,
        [
          document.product_id,
          JSON.stringify(document),
          document.search_text_en,
          document.search_text_vi,
          document.search_text,
          document.content_hash,
        ],
      );
      await transaction.query(
        `insert into public.product_search_index
          (product_id, search_text, source_content_hash, index_version)
         values ($1, $2, $3, 'fts-v1')
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
           or product_search_index.index_version is distinct from excluded.index_version`,
        [document.product_id, document.search_text, document.content_hash],
      );
    }

    for (const product of data.products.filter(
      (item) => item.image_url || item.product_url,
    )) {
      await transaction.query(
        `insert into public.product_media
          (product_id, media_type, image_url, product_url, position, metadata)
         values ($1, 'primary', $2, $3, 0, '{}'::jsonb)
         on conflict (product_id, media_type, position) do update set
           image_url = excluded.image_url,
           product_url = excluded.product_url,
           metadata = excluded.metadata,
           updated_at = now()
         where (product_media.image_url, product_media.product_url, product_media.metadata)
           is distinct from (excluded.image_url, excluded.product_url, excluded.metadata)`,
        [
          product.product_id,
          product.image_url ?? null,
          product.product_url ?? null,
        ],
      );
    }
  });
}

async function stateSnapshot(database) {
  const tables = [
    'products',
    'product_specifications',
    'product_documents',
    'product_media',
    'product_search_index',
  ];
  const snapshot = {};
  for (const table of tables) {
    const result = await database.query(
      `select count(*)::integer as rows, max(updated_at)::text as last_update from public.${table}`,
    );
    snapshot[table] = result.rows[0];
  }
  return snapshot;
}

async function main() {
  const database = new PGlite();
  try {
    await database.exec(
      'create role anon; create role authenticated; create role service_role;',
    );
    const migration = (await readFile(migrationPath, 'utf8'))
      .replace(
        /create extension if not exists vector with schema extensions;\s*/iu,
        '',
      )
      .replace('embedding extensions.vector,', 'embedding real[],');
    await database.exec(migration);
    const hardeningMigration = await readFile(hardeningMigrationPath, 'utf8');
    await database.exec(hardeningMigration);

    const data = await loadData();
    await seedDatabase(database, data);
    const firstSnapshot = await stateSnapshot(database);
    await seedDatabase(database, data);
    const secondSnapshot = await stateSnapshot(database);

    const validationResult = await database.query(`
      select
        (select count(*)::integer from public.products) as products,
        (select count(*)::integer from public.products where status = 'active') as active,
        (select count(*)::integer from public.products where status = 'review') as review,
        (select count(*)::integer from public.product_specifications) as product_specifications,
        (select count(*)::integer from public.product_documents) as product_documents,
        (select count(*)::integer from public.product_media) as product_media,
        (select count(*)::integer from public.product_search_index) as product_search_index,
        (select count(*)::integer from public.product_search_index search_index
          join public.products products using (product_id) where products.status = 'review') as review_products_indexed,
        (select count(*)::integer from public.product_specifications specifications
          left join public.products products using (product_id) where products.product_id is null) as orphan_specifications,
        (select count(*)::integer from public.product_documents documents
          left join public.products products using (product_id) where products.product_id is null) as orphan_documents,
        (select count(*)::integer from public.product_media media
          left join public.products products using (product_id) where products.product_id is null) as orphan_media,
        (select count(*)::integer from public.product_search_index search_index
          left join public.products products using (product_id) where products.product_id is null) as orphan_search_index,
        (select count(*)::integer - count(distinct product_id)::integer from public.products) as duplicate_product_id,
        (select count(*)::integer - count(distinct model)::integer from public.products) as duplicate_model,
        (select count(*)::integer from public.product_documents
          where content_hash is distinct from search_document ->> 'content_hash') as document_hash_mismatch,
        (select count(*)::integer from public.product_search_index search_index
          left join public.product_documents documents using (product_id)
          where documents.product_id is null
            or search_index.source_content_hash is distinct from documents.content_hash) as search_index_hash_mismatch
    `);
    const validation = validationResult.rows[0];
    validation.invalid_fk =
      validation.orphan_specifications +
      validation.orphan_documents +
      validation.orphan_media +
      validation.orphan_search_index;

    const productRows = (
      await database.query(
        'select product_id, model, status from public.products order by product_id',
      )
    ).rows;
    const documentRows = (
      await database.query(
        `select product_id, content_hash, search_document ->> 'content_hash' as document_content_hash
         from public.product_documents order by product_id`,
      )
    ).rows;
    const searchIndexRows = (
      await database.query(
        'select product_id, source_content_hash from public.product_search_index order by product_id',
      )
    ).rows;

    const expectedProductIds = new Set(
      data.products.map((product) => product.product_id),
    );
    const databaseProductIds = new Set(
      productRows.map((row) => row.product_id),
    );
    const databaseActiveIds = new Set(
      productRows
        .filter((row) => row.status === 'active')
        .map((row) => row.product_id),
    );
    const databaseReviewIds = new Set(
      productRows
        .filter((row) => row.status === 'review')
        .map((row) => row.product_id),
    );
    const databaseDocumentIds = new Set(
      documentRows.map((row) => row.product_id),
    );
    const databaseSearchIndexIds = new Set(
      searchIndexRows.map((row) => row.product_id),
    );
    const expectedDocumentHashes = new Map(
      data.documents.map((document) => [
        document.product_id,
        document.content_hash,
      ]),
    );
    const databaseDocumentHashes = new Map(
      documentRows.map((row) => [row.product_id, row.content_hash]),
    );
    const staleDatabaseProductIds = sortedSetDifference(
      databaseProductIds,
      expectedProductIds,
    );
    const missingDatabaseProductIds = sortedSetDifference(
      expectedProductIds,
      databaseProductIds,
    );
    const activeWithoutSearchIndex = sortedSetDifference(
      data.activeIds,
      databaseSearchIndexIds,
    );
    const nonActiveSearchIndexIds = sortedSetDifference(
      databaseSearchIndexIds,
      data.activeIds,
    );
    const reviewProductsIndexed = sortedSetIntersection(
      databaseSearchIndexIds,
      data.reviewIds,
    );
    const sourceDocumentHashMismatchIds = documentRows
      .filter(
        (row) =>
          expectedDocumentHashes.get(row.product_id) !== row.content_hash,
      )
      .map((row) => row.product_id)
      .sort();
    const searchIndexSourceHashMismatchIds = searchIndexRows
      .filter(
        (row) =>
          expectedDocumentHashes.get(row.product_id) !==
            row.source_content_hash ||
          databaseDocumentHashes.get(row.product_id) !==
            row.source_content_hash,
      )
      .map((row) => row.product_id)
      .sort();
    const duplicateSourceDocumentIds = duplicateValues(
      data.documents.map((document) => document.product_id),
    );

    const ftsIndexResult = await database.query(`
      select indexname, indexdef
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'product_search_index'
        and indexname = 'product_search_index_search_tsv_idx'
    `);
    const keywordResults = {};
    for (const query of testQueries) {
      const result = await database.query(
        `select product_id, model, product_name_en, rank
         from public.search_products_keyword($1, 5)`,
        [query],
      );
      keywordResults[query] = result.rows;
    }

    const keywordRpcBehavior =
      keywordResults.CS655.some((row) => row.product_id === 'CSI_CS655') &&
      Object.values(keywordResults).every(
        (rows) =>
          rows.length <= 5 &&
          rows.every((row) => data.activeIds.has(row.product_id)),
      );

    const assertions = {
      source_status_partition:
        data.products.length === data.activeIds.size + data.reviewIds.size &&
        sortedSetIntersection(data.activeIds, data.reviewIds).length === 0,
      source_unique_product_ids:
        expectedProductIds.size === data.products.length,
      source_unique_document_ids: duplicateSourceDocumentIds.length === 0,
      source_document_ids_match_active_ids: sameStringSets(
        data.documentIds,
        data.activeIds,
      ),
      products: sameStringSets(databaseProductIds, expectedProductIds),
      active: sameStringSets(databaseActiveIds, data.activeIds),
      review: sameStringSets(databaseReviewIds, data.reviewIds),
      product_documents:
        sameStringSets(databaseDocumentIds, data.documentIds) &&
        documentRows.length === data.documents.length,
      product_search_index: sameStringSets(
        databaseSearchIndexIds,
        data.documentIds,
      ),
      active_products_indexed: activeWithoutSearchIndex.length === 0,
      non_active_products_not_indexed: nonActiveSearchIndexIds.length === 0,
      review_products_indexed:
        validation.review_products_indexed === 0 &&
        reviewProductsIndexed.length === 0,
      stale_database_product_ids: staleDatabaseProductIds.length === 0,
      missing_database_product_ids: missingDatabaseProductIds.length === 0,
      orphan_specifications: validation.orphan_specifications === 0,
      orphan_documents: validation.orphan_documents === 0,
      orphan_media: validation.orphan_media === 0,
      orphan_search_index: validation.orphan_search_index === 0,
      duplicate_product_id: validation.duplicate_product_id === 0,
      duplicate_model: validation.duplicate_model === 0,
      document_hash_mismatch:
        validation.document_hash_mismatch === 0 &&
        sourceDocumentHashMismatchIds.length === 0,
      search_index_hash_mismatch:
        validation.search_index_hash_mismatch === 0 &&
        searchIndexSourceHashMismatchIds.length === 0,
      invalid_fk: validation.invalid_fk === 0,
      fts_gin_index:
        ftsIndexResult.rows.length === 1 &&
        ftsIndexResult.rows[0].indexdef.toLowerCase().includes('using gin'),
      keyword_rpc_behavior: keywordRpcBehavior,
      hardening_migration_allows_missing_rls_auto_enable: true,
      idempotency:
        JSON.stringify(firstSnapshot) === JSON.stringify(secondSnapshot),
    };
    const expected = {
      products: expectedProductIds.size,
      active: data.activeIds.size,
      review: data.reviewIds.size,
      product_documents: data.documentIds.size,
      product_search_index: data.documentIds.size,
    };
    const setDiagnostics = {
      stale_database_product_ids: staleDatabaseProductIds,
      missing_database_product_ids: missingDatabaseProductIds,
      active_without_search_index: activeWithoutSearchIndex,
      non_active_search_index_ids: nonActiveSearchIndexIds,
      review_products_indexed: reviewProductsIndexed,
      duplicate_source_document_ids: duplicateSourceDocumentIds,
      source_document_hash_mismatch_ids: sourceDocumentHashMismatchIds,
      search_index_source_hash_mismatch_ids: searchIndexSourceHashMismatchIds,
    };
    const report = {
      generated_at: new Date().toISOString(),
      engine: 'PGlite/PostgreSQL local compatibility test',
      note: 'The vector extension is replaced with real[] only in this local harness; the committed Supabase migration uses extensions.vector. The conditional hardening migration is executed with rls_auto_enable absent. PGlite does not runtime-test the pending event-trigger migration.',
      status: Object.values(assertions).every(Boolean) ? 'passed' : 'failed',
      expected,
      validation,
      set_diagnostics: setDiagnostics,
      assertions,
      fts_index: ftsIndexResult.rows[0] ?? null,
      keyword_results: keywordResults,
    };
    await mkdir(path.dirname(reportPath), { recursive: true });
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify(report, null, 2));
    if (report.status !== 'passed') process.exitCode = 1;
  } finally {
    await database.close();
  }
}

await main();
