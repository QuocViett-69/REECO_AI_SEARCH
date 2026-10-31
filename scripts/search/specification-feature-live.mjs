import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../../apps/api/dist/app.module.js');
const { SearchService } = require('../../apps/api/dist/modules/search/search.service.js');
const { specificationConstraints, specificationRequirementLabel } = require('../../apps/api/dist/modules/search/specification-query.js');
const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
const report = [];
try {
  const service = app.get(SearchService);
  for (const [query, expected] of [
    ['Điện áp nguồn 9 to 28 VDC', 'BaroVue10'],
    ['Điện áp nguồn 9000 đến 28000 mVDC', 'BaroVue10'],
    ['Dải áp suất 500 to 1100 hPa', 'BaroVue10'],
    ['Dải tốc độ gió 0 to 60 m/s', 'WindSonic1'],
    ['Tần số 300 to 6500 Hz', 'VWANALYZER'],
    ['Độ phân giải 0.001 Hz', 'VWANALYZER'],
    ['Độ chính xác ±0.005%', 'VWANALYZER'],
    ['Bộ nhớ 80 MB', 'VWANALYZER'],
    ['Bộ nhớ tối thiểu 64 MB', 'VWANALYZER'],
    ['Cấp bảo vệ IP68', 'CS655'],
    ['Dòng tiêu thụ 14 mA', 'CELL210-V'],
    ['Điện áp đầu ra 5 V', 'AVW200-ST'],
    ['Khối lượng 770 g', 'TX325'],
    ['Đầu vào dòng 4 to 20 mA', 'CR310-NA'],
    ['Điện áp nguồn 6 to 18 VDC và cấp bảo vệ IP68', 'CS655'],
    ['Bộ nhớ tối thiểu 900 GB', null],
    ['Dải nhiệt độ hoạt động -35 to +70°C', 'WindSonic1'],
  ]) {
    const response = await service.search({ query, limit: 20, explain: true });
    const constraints = specificationConstraints(query);
    if (expected) assert.ok(response.results.some(p => p.model === expected), `${query}: missing ${expected}`);
    else assert.deepEqual(response.results, []);
    for (const product of response.results) {
      for (const constraint of constraints) assert.ok(product.explanation.requirements.some(r => r.label === specificationRequirementLabel(constraint, product.explanation.language === 'vi') && r.status === 'confirmed'), `${product.model}: missing ${constraint.fragment}`);
      assert.ok(product.explanation.evidence.some(e => e.source === 'normalized_spec' && e.raw_ref));
      if (constraints.length) assert.ok(product.matched_features.some(f => f.startsWith('specification:')));
    }
    report.push({ query, response, status: 'PASS' });
    console.log('PASS', query, response.results.map(p => p.model).join(', ') || 'EMPTY');
  }
} finally {
  await mkdir('output', { recursive: true });
  await writeFile('output/specification-feature-live.json', JSON.stringify({ generated_at: new Date().toISOString(), report }, null, 2));
  await app.close();
}
