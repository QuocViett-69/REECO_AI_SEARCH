import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { cases } from './stress-cases.mjs';
import { percentile } from './metrics.mjs';

process.env.RERANKER_ENABLED = 'false';
process.env.LLM_EXPLANATION_ENABLED = 'false';
const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../../apps/api/dist/app.module.js');
const { SearchResponseSchema } = require('../../packages/shared/dist/index.js');
const app = await NestFactory.create(AppModule, { logger: ['error'] });
app.setGlobalPrefix('api/v1');
await app.listen(0, '127.0.0.1');
const url = `${await app.getUrl()}/api/v1/search`;
const catalog = JSON.parse(await readFile(new URL('../../output/search-stress/catalog.json', import.meta.url)));
const ids = new Set(catalog.map(row => row.product.product_id));
const records = [];
try {
  for (let offset = 0; offset < cases.length; offset += 4) {
    await Promise.all(cases.slice(offset, offset + 4).map(async c => {
      const started = performance.now();
      try {
        const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ query: c.query, limit: 5, explain: true }), signal: AbortSignal.timeout(120000) });
        const body = await response.json();
        assert.equal(response.status, c.intent === 'negative' ? 400 : 200);
        if (response.ok) {
          SearchResponseSchema.parse(body);
          assert.ok(body.results.every(r => ids.has(r.product_id)));
          assert.equal(new Set(body.results.map(r => r.product_id)).size, body.results.length);
        }
        records.push({ id: c.id, query: c.query, status: response.status, elapsed_ms: performance.now() - started, body });
      } catch (error) { records.push({ id: c.id, query: c.query, error: error.message, elapsed_ms: performance.now() - started }); }
    }));
    if (offset % 20 === 0) console.log(`HTTP ${Math.min(offset + 4, cases.length)}/${cases.length}`);
  }
} finally { await app.close(); }
const report = { concurrency: 4, request_count: records.length, reranker_enabled: false, llm_rewrite: false,
  errors: records.filter(r => r.error).length, latency_ms: { p50: percentile(records.map(r => r.elapsed_ms), 50), p95: percentile(records.map(r => r.elapsed_ms), 95) }, records };
await writeFile(new URL('../../output/search-stress/http.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, records: undefined }, null, 2));
if (report.errors) process.exitCode = 1;
