import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import {
  embeddingConfig,
  emptyBackfillStats,
  runEmbeddingBackfill,
} from './lib.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..', '..');
const reportPath = path.join(
  projectRoot,
  'data',
  'reports',
  'embedding-backfill-report.json',
);
const args = new Set(process.argv.slice(2));
const execute = args.has('--execute');
if (execute && args.has('--dry-run')) {
  throw new Error('Choose either --execute or --dry-run');
}

const config = embeddingConfig();
const reportBase = {
  generated_at: new Date().toISOString(),
  provider: config.provider,
  model: config.model,
  dimensions: config.dimensions,
  embedding_version: config.version,
  mode: execute ? 'execute' : 'dry-run',
};

async function writeReport(report) {
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
}

if (!execute) {
  await writeReport({
    ...reportBase,
    ...emptyBackfillStats(),
    database_status: 'not-run',
    ollama_status: 'not-run',
  });
} else {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required with --execute');

  const require = createRequire(import.meta.url);
  const { OllamaEmbeddingProvider } = require(
    path.join(
      projectRoot,
      'apps',
      'api',
      'dist',
      'ai',
      'ollama-embedding.provider.js',
    ),
  );
  const provider = new OllamaEmbeddingProvider(config);
  const sql = postgres(databaseUrl, { max: 1, prepare: false });
  const repository = {
    findSearchableRows: () => sql`
      select
        search_index.product_id,
        search_index.search_text,
        search_index.source_content_hash,
        search_index.index_version,
        search_index.embedding is not null as embedding_present,
        search_index.embedding_model,
        search_index.embedding_dimensions,
        search_index.embedding_version,
        search_index.embedded_at
      from public.product_search_index as search_index
      join public.products as products using (product_id)
      where products.status = 'active'
        and search_index.search_text is not null
        and btrim(search_index.search_text) <> ''
      order by search_index.product_id
    `,
    async updateEmbeddingIfSourceCurrent(update) {
      const vectorLiteral = `[${update.vector.join(',')}]`;
      const result = await sql`
        update public.product_search_index as search_index
        set
          embedding = ${vectorLiteral}::extensions.vector(1536),
          embedding_model = ${update.model},
          embedding_dimensions = ${update.dimensions},
          embedding_version = ${update.version},
          embedded_at = now(),
          updated_at = now()
        where search_index.product_id = ${update.productId}
          and search_index.source_content_hash is not distinct from ${update.sourceContentHash}
          and search_index.index_version is not distinct from ${update.indexVersion}
          and exists (
            select 1 from public.products as products
            where products.product_id = search_index.product_id
              and products.status = 'active'
          )
      `;
      return result.count === 1;
    },
  };

  try {
    const stats = await runEmbeddingBackfill({ repository, provider, config });
    await writeReport({ ...reportBase, ...stats });
  } finally {
    await sql.end();
  }
}
