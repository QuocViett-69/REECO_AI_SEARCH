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

async function loadData() {
  const products = await readJson(
    path.join(projectRoot, 'data', 'master', 'product-master.json'),
  );
  const activeIds = new Set(
    products
      .filter((product) => product.status === 'active')
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
  return { products, documents, specifications };
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
      validation.orphan_search_index;

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

    const assertions = {
      products: validation.products === 50,
      active: validation.active === 42,
      review: validation.review === 8,
      product_documents: validation.product_documents === 42,
      product_search_index: validation.product_search_index === 42,
      review_products_indexed: validation.review_products_indexed === 0,
      orphan_specifications: validation.orphan_specifications === 0,
      orphan_documents: validation.orphan_documents === 0,
      orphan_search_index: validation.orphan_search_index === 0,
      duplicate_product_id: validation.duplicate_product_id === 0,
      duplicate_model: validation.duplicate_model === 0,
      document_hash_mismatch: validation.document_hash_mismatch === 0,
      search_index_hash_mismatch: validation.search_index_hash_mismatch === 0,
      invalid_fk: validation.invalid_fk === 0,
      fts_gin_index:
        ftsIndexResult.rows.length === 1 &&
        ftsIndexResult.rows[0].indexdef.toLowerCase().includes('using gin'),
      idempotency:
        JSON.stringify(firstSnapshot) === JSON.stringify(secondSnapshot),
    };
    const report = {
      generated_at: new Date().toISOString(),
      engine: 'PGlite/PostgreSQL local compatibility test',
      note: 'The vector extension is replaced with real[] only in this local harness; the committed Supabase migration uses extensions.vector.',
      status: Object.values(assertions).every(Boolean) ? 'passed' : 'failed',
      validation,
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
