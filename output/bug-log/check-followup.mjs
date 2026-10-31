import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../../apps/api/dist/app.module.js');
const { SearchService } = require('../../apps/api/dist/modules/search/search.service.js');
const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
try {
  const service = app.get(SearchService);
  const cases = JSON.parse(await readFile('scripts/search/bug-log-cases.json', 'utf8'));
  const query = cases[0].query;
  const first = await service.search({ query, limit: 10, explain: true });
  const best = await service.search({ query: 'cái nào phù hợp nhất?', limit: 10, explain: true,
    context: { base_query: query, previous_query: query, product_ids: first.results.map(p => p.product_id) } });
  assert.deepEqual(first.results.map(p => p.model), ['RangeVue30']);
  assert.deepEqual(best.results.map(p => p.model), ['RangeVue30']);
  assert.match(best.results[0].explanation.text, /không nhúng/u);
  await writeFile('output/bug-log/retest-followup.json', JSON.stringify({ first, best, status: 'PASS' }, null, 2));
  console.log('TC08 live follow-up: PASS');
} finally { await app.close(); }
