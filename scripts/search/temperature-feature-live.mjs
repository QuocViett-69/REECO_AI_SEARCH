import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../../apps/api/dist/app.module.js');
const { SearchService } = require('../../apps/api/dist/modules/search/search.service.js');
const { TechnicalQueryParserService } = require('../../apps/api/dist/modules/search/technical-query-parser.service.js');
const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
const report = [];
try {
  const service = app.get(SearchService);
  for (const query of [
    'Dải nhiệt độ hoạt động\t-35 to +70 °C',
    'Nhiệt độ vận hành -35 đến +70°C',
    'Nhiệt độ làm việc −35 – +70 °C',
    'Operating temperature range -31 to 158°F',
    'Cảm biến đo tốc độ gió dải nhiệt độ hoạt động -35 to +70°C',
    'Dải đo nhiệt độ -35 to +70°C',
    'Dải nhiệt độ hoạt động -200 to +300°C',
  ]) {
    const parsed = new TechnicalQueryParserService().parse(query);
    const response = await service.search({ query, limit: 10, explain: true });
    if (query.includes('-200')) assert.deepEqual(response.results, []);
    else {
      assert.ok(response.results.length, query);
      if (parsed.temperatureConstraints[0].intent === 'operating') {
        assert.equal(response.results[0].model, 'WindSonic1');
        assert.match(response.results[0].explanation.text, /khớp đúng dải|exactly matches/u);
      }
      for (const result of response.results) {
        assert.ok(result.matched_features.some(f => f.startsWith(`${parsed.temperatureConstraints[0].intent}-temperature:`)));
        assert.ok(result.explanation.requirements.some(r => r.status === 'confirmed' && r.label.includes('°C')));
        assert.ok(result.explanation.evidence.some(e => e.source === 'normalized_spec' && e.raw_ref));
      }
    }
    report.push({ query, parsed, response, status: 'PASS' });
    console.log('PASS', query, response.results.map(p => p.model).join(', ') || 'EMPTY');
  }
} finally {
  await mkdir('output', { recursive: true });
  await writeFile('output/temperature-feature-live.json', JSON.stringify({ generated_at: new Date().toISOString(), report }, null, 2));
  await app.close();
}
