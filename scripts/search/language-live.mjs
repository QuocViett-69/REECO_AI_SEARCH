import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../../apps/api/dist/app.module.js');
const { SearchService } = require('../../apps/api/dist/modules/search/search.service.js');
const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
const report = [];
const english = /(?<![\p{L}\p{N}])(?:the|with|from|operating|accuracy|resolution|temperature|supports|heated|of|and|profile|cellular|logger|measurement|to)(?![\p{L}\p{N}])/iu;
const vietnamese = /[ăâđêôơư]|[\u1ea0-\u1ef9]/iu;
try {
  const service = app.get(SearchService);
  const validate = (response, language) => {
    if (response.guidance) {
      assert.equal(response.guidance.language, language);
      assert.doesNotMatch(response.guidance.text, language === 'en' ? vietnamese : english);
    }
    for (const product of response.results) {
      assert.equal(product.explanation.language, language);
      assert.doesNotMatch([product.explanation.text, ...product.explanation.requirements.map(r => r.label)].join(' '), language === 'en' ? vietnamese : english);
    }
  };
  for (const [query, language] of [
    ['Memory at least 64 MB', 'en'], ['Tôi cần memory at least 64 MB', 'vi'],
    ['Supply voltage 9 to 28 VDC', 'en'], ['Điện áp nguồn 9 to 28 VDC', 'vi'],
    ['Heated rain gauge for snow', 'en'], ['Đo mưa khi có tuyết rơi', 'vi'],
    ['Solar radiation for photovoltaic power', 'en'], ['Đo quang năng bức xạ cho điện mặt trời', 'vi'],
    ['Bộ nhớ tối thiểu 900 GB', 'vi'], ['Memory at least 900 GB', 'en'],
  ]) {
    const response = await service.search({ query, explain: true, limit: 10 });
    validate(response, language);
    report.push({ query, language, response, status: 'PASS' });
    console.log('PASS', language, query);
  }
  for (const [query, previous_query, language] of [
    ['Explain this product for my requirements', 'Tôi cần cảm biến độ ẩm đất', 'en'],
    ['Giải thích sản phẩm này', 'I need a soil moisture sensor', 'vi'],
  ]) {
    const response = await service.search({ query, explain: true, limit: 10,
      context: { base_query: previous_query, previous_query, product_ids: ['CSI_CS655'] } });
    assert.ok(response.results.length);
    validate(response, language);
    report.push({ query, language, response, status: 'PASS' });
    console.log('PASS', language, 'follow-up');
  }
} finally {
  await mkdir('output', { recursive: true });
  await writeFile('output/search-language-live.json', JSON.stringify({ generated_at: new Date().toISOString(), report }, null, 2));
  await app.close();
}
