import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ExplanationService } = require('../../apps/api/dist/modules/search/explanation.service.js');
const { parseSearchIntent, matchSearchIntent } = require('../../apps/api/dist/modules/search/search-intent.js');
const { TechnicalQueryParserService } = require('../../apps/api/dist/modules/search/technical-query-parser.service.js');
const { TechnicalMatchService } = require('../../apps/api/dist/modules/search/technical-match.service.js');
const { ProductSearchDocumentSchema, SearchResultSchema } = require('@reeco/shared');
const root = new URL('../../', import.meta.url);
const json = async file => JSON.parse(await readFile(new URL(file, root), 'utf8'));
const master = await json('data/master/product-master.json');
const service = new ExplanationService();
const parser = new TechnicalQueryParserService();
const rows = [];
const expected = {
  CSI_LWS: ['leaf_wetness'], CSI_CS310: ['photosynthetic_photon_flux_density'],
  CSI_HFP01: ['soil_heat_flux'], CSI_CS140: ['background_luminance'],
  CSI_CS506: ['fuel_moisture'], CSI_CS451: ['water_level'], CSI_CS456: ['water_level'],
  CSI_TE525: ['precipitation'], CSI_WINDSONIC1: ['wind_speed', 'wind_direction'],
  CSI_HMP60: ['air_temperature', 'relative_humidity'], CSI_SOILVUE10_5: ['soil_electrical_conductivity'],
  CSI_SKYVUE8: ['cloud_base_height'],
};
let checked = 0;
for (const file of (await readdir(new URL('data/search-documents/', root))).sort()) {
  if (!file.endsWith('.json')) continue;
  const doc = ProductSearchDocumentSchema.parse(await json(`data/search-documents/${file}`));
  const normalized = await json(`data/normalized/specifications/${file}`);
  const enriched = await json(`data/enriched/products/${file}`);
  const specs = normalized.specifications.map((s, i) => ({
    specification_id: i + 1, canonical_key: s.canonical_key, quantity_kind: s.quantity_kind ?? null,
    normalized_value: { ...(s.normalized ?? { type: 'text', value: s.value_raw }), value_raw: s.value_raw }, raw_ref: s.raw_ref,
  }));
  const technical = new TechnicalMatchService({ getTechnicalEvidenceByIds: async () => new Map([[doc.product_id, { product: doc, document: doc, specifications: specs }]]) });
  for (const key of expected[doc.product_id] || []) assert.ok(doc.measurements.some(item => item.key === key), `${doc.model}: ${key}`);
  if (doc.model === 'ClimaVue40') assert.ok(!doc.measurements.some(item => /lightning|barometric/.test(item.key)), 'Do not merge the family specification table into ClimaVue40 measurements');
  for (const group of ['measurements', 'capabilities', 'applications']) {
    for (const item of doc[group]) {
      assert.ok(item.evidence?.length, `${doc.model}: missing provenance for ${item.key}`);
      for (const evidence of item.evidence) {
        if (evidence.source === 'normalized_spec') assert.ok(normalized.specifications.some(spec =>
          spec.canonical_key === evidence.canonical_key && JSON.stringify(spec.raw_ref) === JSON.stringify(evidence.raw_ref)), `${doc.model}: invalid reference`);
      }
    }
  }
  const examples = {};
  for (const [language, query] of [['vi', `Giải thích sản phẩm ${doc.model}`], ['en', `Describe product ${doc.model}`]]) {
    const match = (await technical.evaluate(parser.parse(doc.model, [{ productId: doc.product_id, model: doc.model }]), [doc.product_id]))[0];
    const explanation = service.explain(query, doc, match, specs);
    SearchResultSchema.shape.explanation.parse(explanation);
    assert.equal(explanation.language, language);
    assert.ok(explanation.text.includes(doc.model));
    assert.ok(explanation.evidence.length > 0);
    assert.ok(explanation.requirements.some(item => item.status === 'unconfirmed'), `${doc.model}: missing caveat for ${query}`);
    examples[language] = explanation;
    checked++;
  }
  for (const measurement of doc.measurements) {
    for (const language of ['vi', 'en']) {
      const label = measurement[`label_${language}`];
      const query = language === 'vi' ? `Tôi cần đo ${label}` : `I need to measure ${label}`;
      const intent = parseSearchIntent(query);
      if (measurement.key !== 'temperature') assert.ok(intent.measurements.length || intent.target, `${doc.model}: unrecognized ${label}`);
      assert.notEqual(matchSearchIntent(intent, doc, specs), null, `${doc.model}: own measurement rejected: ${label}`);
      const explanation = service.explain(query, doc, undefined, specs);
      SearchResultSchema.shape.explanation.parse(explanation);
      assert.ok(explanation.evidence.some(item => item.field === 'measurements' || item.field === 'capabilities'), `${doc.model}: measurement evidence missing`);
      checked++;
    }
  }
  const gaps = [];
  if (doc.taxonomy.category_key === 'sensors' && !doc.measurements.length && !/module|multiplexer|analyzer|measurement device/iu.test(doc.taxonomy.device_type)) gaps.push('Chưa xác nhận đại lượng đo trong nguồn; không tự suy ra từ tên nhóm.');
  if (!doc.supported_protocols.length) gaps.push('Chưa ghi nhận giao thức số; kiểm tra loại tín hiệu/đấu dây trong thông số nguồn.');
  if (doc.name_vi === null) gaps.push('Chưa có tên sản phẩm tiếng Việt đã duyệt.');
  if (doc.model === 'ClimaVue40') gaps.push('Bảng thông số nguồn có áp suất/sét nhưng danh sách Measurements Made không xác nhận các đại lượng này. Giữ ở trạng thái cần đối chiếu theo đúng model.');
  rows.push({ product_id: doc.product_id, model: doc.model, device_type: doc.taxonomy.device_type,
    source_url: master.find(item => item.product_id === doc.product_id)?.product_url,
    measurements: doc.measurements, capabilities: doc.capabilities, applications: doc.applications,
    protocols: enriched.protocols, variants: doc.variants.filter(item => item.model === doc.model),
    specifications: normalized.specifications, examples, gaps });
}
assert.equal(rows.length, master.filter(item => item.status === 'active').length);
const report = { models: rows.length, checks: checked, measurement_assignments: rows.reduce((count, row) => count + row.measurements.length, 0), products: rows };
if (process.argv.includes('--write')) {
  await writeFile(new URL('data/reports/catalog-explanation-audit.json', root), `${JSON.stringify(report, null, 2)}\n`);
  const reference = ref => `${ref.file} · record ${ref.product_index} · spec ${ref.spec_index} · dòng ${ref.source_rows.join(', ')}`;
  const sections = rows.map(row => `## ${row.model}\n\n${row.device_type} · ${row.product_id}\n\nNguồn catalog: ${row.source_url || 'chưa có URL'}\n\nĐại lượng có bằng chứng: ${row.measurements.map(item => item.label_vi).join(', ') || 'chưa xác nhận'}.\n\nGiao thức được ghi nhận: ${row.protocols.map(item => `${item.name} (${item.relation})`).join(', ') || 'chưa ghi nhận'}.\n\n${row.variants.map(item => `Cấu hình model: ${item.distinguishing_specifications.map(spec => `${spec.name_en}: ${spec.value_raw}`).join('; ')}`).join('\n')}\n\n**Ví dụ explanation tiếng Việt**\n\n${row.examples.vi.text}\n\n**Ví dụ explanation tiếng Anh**\n\n${row.examples.en.text}\n\n**Thông số nguồn để đối chiếu**\n\n${row.specifications.map(spec => `- **${spec.name_raw}**: ${String(spec.value_raw).replace(/\n/gu, ' / ')} — ${reference(spec.raw_ref)}`).join('\n')}\n\n**Cần kiểm tra tiếp**\n\n${row.gaps.length ? row.gaps.map(gap => `- ${gap}`).join('\n') : '- Cấu hình lắp đặt, thiết bị kết nối và các yêu cầu chưa có trong truy vấn vẫn cần xác nhận.'}\n`);
  await writeFile(new URL('docs/ai-search-explainable-theo-model.md', root), `# Nền tảng explanation theo từng model\n\nĐối chiếu ${rows.length} model active với dữ liệu local, ${checked} kiểm tra VI/EN. Đây là kiểm tra dữ liệu và quy tắc, không phải xác nhận độc lập toàn bộ datasheet của nhà sản xuất.\n\nAPI đọc dữ liệu Supabase; cần import search documents và backfill embedding khi search text thay đổi.\n\nTái tạo: \`npm run search:catalog:audit\`.\n\n${sections.join('\n')}`);
}
console.log(JSON.stringify({ models: report.models, checks: checked, measurements: report.measurement_assignments, sensors_without_measurements: rows.filter(row => row.gaps.some(gap => gap.startsWith('Chưa xác nhận đại lượng'))).map(row => row.model) }));
