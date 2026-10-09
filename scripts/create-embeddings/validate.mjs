import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { embeddingConfig, validateEmbeddingRows } from './lib.mjs';

const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');
assert.ok(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY, 'Supabase configuration is required');
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const config = embeddingConfig();
const { count, error } = await client.from('products').select('product_id', { count: 'exact', head: true }).eq('status', 'active').abortSignal(AbortSignal.timeout(15000));
assert.equal(error, null, 'Cannot read active products');
assert.ok(count > 0, 'No active products');
const rows = [];
for (let offset = 0; ; offset += 500) {
  const page = await client.from('product_search_index')
    .select('product_id,search_text,embedding,embedding_model,embedding_dimensions,embedding_version,embedded_at,products!inner(status)')
    .eq('products.status', 'active').order('product_id').range(offset, offset + 499).abortSignal(AbortSignal.timeout(15000));
  assert.equal(page.error, null, 'Cannot read search index');
  for (const row of page.data) {
    const vector = typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding;
    assert.ok(Array.isArray(vector) && vector.length === config.dimensions && vector.every(Number.isFinite) && vector.some(value => value !== 0), 'Missing or invalid vector: ' + row.product_id);
    rows.push({ ...row, status: row.products.status });
  }
  if (page.data.length < 500) break;
}
const report = validateEmbeddingRows(rows, config);
assert.equal(rows.length, count, 'Active products are missing search-index rows');
assert.equal(report.current_embeddings, count, 'Empty search text or stale embedding metadata');
console.log(JSON.stringify({ ...report, active_products: count, model: config.model, dimensions: config.dimensions, version: config.version, database: 'live', result: 'PASS' }, null, 2));
