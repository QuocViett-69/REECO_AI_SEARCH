import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(import.meta.dirname, '..', '..');
const { NestFactory } = require('@nestjs/core');
const { SearchResponseSchema } = require(
  path.join(projectRoot, 'packages', 'shared', 'dist', 'index.js'),
);
const { AppModule } = require(
  path.join(projectRoot, 'apps', 'api', 'dist', 'app.module.js'),
);

const queries = [
  'CS655',
  'soil moisture sensor',
  'cảm biến độ ẩm đất',
  '900 MHz radio',
  'SDI-12',
  'weather station',
];
const nonTechnicalQueries = new Set([
  'soil moisture sensor',
  'cảm biến độ ẩm đất',
  '900 MHz radio',
  'weather station',
]);

const app = await NestFactory.create(AppModule, { logger: false });
app.setGlobalPrefix('api/v1');
await app.listen(0, '127.0.0.1');

const baseUrl = await app.getUrl();
const queryResults = [];

try {
  for (const query of queries) {
    const response = await fetch(`${baseUrl}/api/v1/search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, limit: 10 }),
    });
    const body = await response.json();
    assert.equal(
      response.status,
      200,
      `public search failed for ${JSON.stringify(query)}`,
    );
    const parsed = SearchResponseSchema.parse(body);
    assert.equal(
      parsed.mode,
      'hybrid',
      `expected both retrieval sources to succeed for ${JSON.stringify(query)}`,
    );
    assert.ok(parsed.results.length <= 10);
    assert.ok(
      parsed.results.every(
        (result) =>
          result.scores.rerank === null && result.scores.hybrid !== null,
      ),
    );
    if (nonTechnicalQueries.has(query)) {
      assert.ok(
        parsed.results.every((result) => result.matched_features.length === 0),
      );
    }

    queryResults.push({
      query,
      http_status: response.status,
      mode: parsed.mode,
      result_ids: parsed.results.map((result) => result.product_id),
      top_5: parsed.results.slice(0, 5).map((result, index) => ({
        rank: index + 1,
        product_id: result.product_id,
        model: result.model,
        keyword_score: result.scores.keyword,
        semantic_score: result.scores.semantic,
        hybrid_score: result.scores.hybrid,
        matched_features: result.matched_features,
      })),
    });
  }

  const cs655 = queryResults.find((result) => result.query === 'CS655');
  assert.ok(
    cs655.top_5[0]?.product_id === 'CSI_CS655',
    'CSI_CS655 must rank first for the exact model query',
  );
  assert.ok(
    cs655.top_5[0].matched_features.includes('identity:model:CS655'),
    'CSI_CS655 must expose evidence-backed identity matched_features',
  );
  const radio = queryResults.find((result) => result.query === '900 MHz radio');
  assert.ok(
    radio.result_ids.includes('CSI_RF407'),
    `CSI_RF407 must remain in the top 10 for 900 MHz radio: ${radio.result_ids.join(', ')}`,
  );

  const report = {
    generated_at: new Date().toISOString(),
    purpose: 'Step 7.6B public technical-ranking POST /api/v1/search smoke',
    endpoint: 'POST /api/v1/search',
    request_limit: 10,
    query_results: queryResults,
    result: 'PASS',
  };
  const reportPath = path.join(
    projectRoot,
    'data',
    'reports',
    'public-hybrid-search-report.json',
  );
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
} finally {
  await app.close();
}
