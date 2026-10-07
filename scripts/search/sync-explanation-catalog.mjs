import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { isDeepStrictEqual } from 'node:util';
import { createClient } from '@supabase/supabase-js';
import { embeddingConfig, classifyEmbedding, runEmbeddingBackfill } from '../create-embeddings/lib.mjs';

const require = createRequire(import.meta.url);
const { ProductSearchDocumentSchema } = require('@reeco/shared');
const { OllamaEmbeddingProvider } = require('../../apps/api/dist/ai/ollama-embedding.provider.js');
const root = new URL('../../', import.meta.url);
const execute = process.argv.includes('--execute');
const config = embeddingConfig();
assert.ok(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY, 'Supabase service configuration is required');
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
async function result(request) {
  const { data, error } = await request;
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data;
}
const remoteDocuments = await result(client.from('product_documents').select('*'));
const remoteIndex = await result(client.from('product_search_index').select('*'));
const active = new Set((await result(client.from('products').select('product_id').eq('status', 'active'))).map(item => item.product_id));
let lastSynced = [];
try { lastSynced = JSON.parse(await readFile(new URL('output/explanation-sync-baseline.json', root), 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const plan = [];
for (const file of (await readdir(new URL('data/search-documents/', root))).sort()) {
  if (!file.endsWith('.json')) continue;
  const document = ProductSearchDocumentSchema.parse(JSON.parse(await readFile(new URL(`data/search-documents/${file}`, root), 'utf8')));
  assert.ok(active.has(document.product_id), `${document.model}: product is not active`);
  const existing = remoteDocuments.find(item => item.product_id === document.product_id);
  const index = remoteIndex.find(item => item.product_id === document.product_id);
  assert.ok(existing && index, `${document.model}: missing hosted document/index`);
  const baseline = lastSynced.find(item => item.product_id === document.product_id)
    ?? JSON.parse(execFileSync('git', ['show', `HEAD:data/search-documents/${file}`], { cwd: root, encoding: 'utf8' }));
  assert.ok(isDeepStrictEqual(existing.search_document, baseline) || isDeepStrictEqual(existing.search_document, document), `${document.model}: hosted catalog changed independently; refusing overwrite`);
  const reusable = index.search_text === document.search_text && classifyEmbedding(index, config).current;
  plan.push({ document, existing, index, reusable });
}
assert.equal(plan.length, active.size, 'Active catalog coverage differs');
const pending = plan.filter(row => row.existing.content_hash !== row.document.content_hash || row.index.source_content_hash !== row.document.content_hash || !classifyEmbedding(row.index, config).current);
console.log(JSON.stringify({ mode: execute ? 'execute' : 'dry-run', models: plan.length, pending: pending.length, reuse_embeddings: pending.filter(row => row.reusable).length, generate_embeddings: pending.filter(row => !row.reusable).length }));
if (execute) {
  await mkdir(new URL('output/', root), { recursive: true });
  try {
    await writeFile(new URL('output/explanation-sync-backup.json', root), JSON.stringify({ documents: remoteDocuments, index: remoteIndex }), { flag: 'wx' });
  } catch (error) { if (error.code !== 'EEXIST') throw error; }
  let updated = 0;
  async function persist(row, vector) {
    const { document, existing, index } = row;
    if (existing.content_hash !== document.content_hash) {
      // Guard the fields editable by the admin API, which currently does not
      // regenerate content_hash on those edits.
      let update = client.from('product_documents').update({
        search_document: document, content_hash: document.content_hash,
        search_text: document.search_text, search_text_en: document.search_text_en, search_text_vi: document.search_text_vi, updated_at: new Date().toISOString(),
      }).eq('product_id', document.product_id).eq('content_hash', existing.content_hash)
        .eq('search_document->taxonomy', JSON.stringify(existing.search_document.taxonomy))
        .eq('search_document->supported_protocols', JSON.stringify(existing.search_document.supported_protocols));
      update = existing.search_document.name_vi === null ? update.is('search_document->>name_vi', null) : update.eq('search_document->>name_vi', existing.search_document.name_vi);
      assert.equal((await result(update.select('product_id'))).length, 1, `${document.model}: document changed during sync`);
    }
    const patch = { search_text: document.search_text, source_content_hash: document.content_hash, updated_at: new Date().toISOString() };
    if (vector) Object.assign(patch, { embedding: JSON.stringify(vector), embedding_model: config.model, embedding_dimensions: config.dimensions, embedding_version: config.version, embedded_at: new Date().toISOString() });
    // ponytail: REST cannot transact across both tables. Generate vectors before
    // writing, use source guards, and resume this idempotent script after failure.
    const changed = await result(client.from('product_search_index').update(patch).eq('product_id', document.product_id).eq('source_content_hash', index.source_content_hash).eq('index_version', index.index_version).select('product_id'));
    assert.equal(changed.length, 1, `${document.model}: index changed during sync`);
    console.log(JSON.stringify({ synced: ++updated, model: document.model, embedding: vector ? 'generated' : 'reused' }));
    return true;
  }
  for (const row of pending.filter(row => row.reusable)) await persist(row);
  const regenerate = pending.filter(row => !row.reusable);
  const backfill = await runEmbeddingBackfill({ config, provider: new OllamaEmbeddingProvider(config), repository: {
    findSearchableRows: async () => regenerate.map(row => ({ ...row.index, model: row.document.model, search_text: row.document.search_text, source_content_hash: row.document.content_hash, embedding_present: false })),
    updateEmbeddingIfSourceCurrent: async ({ productId, vector }) => persist(regenerate.find(row => row.document.product_id === productId), vector),
  } });
  assert.equal(backfill.failed, 0, 'Embedding generation failed; rerun to resume');
  const [docs, indexes] = await Promise.all([
    result(client.from('product_documents').select('product_id,content_hash')),
    result(client.from('product_search_index').select('product_id,source_content_hash,embedding_model,embedding_dimensions,embedding_version,embedded_at')),
  ]);
  for (const row of plan) {
    assert.equal(docs.find(item => item.product_id === row.document.product_id).content_hash, row.document.content_hash);
    const index = indexes.find(item => item.product_id === row.document.product_id);
    assert.equal(index.source_content_hash, row.document.content_hash);
    assert.equal(index.embedding_model, config.model);
    assert.equal(index.embedding_dimensions, config.dimensions);
    assert.equal(index.embedding_version, config.version);
    assert.ok(index.embedded_at);
  }
  await writeFile(new URL('data/reports/catalog-explanation-sync.json', root), `${JSON.stringify({ models: plan.length, updated, verified: true, backfill }, null, 2)}\n`);
  await writeFile(new URL('output/explanation-sync-baseline.json', root), JSON.stringify(plan.map(row => row.document)));
  console.log(JSON.stringify({ verified: plan.length, updated, embedded: backfill.embedded }));
}
