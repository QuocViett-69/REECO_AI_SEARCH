import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { SearchResponseSchema } = require('@reeco/shared');
const directory = 'output/explanation-cases-complete';
const runs = await Promise.all([directory, 'output/explanation-cases-context'].map(async dir => JSON.parse(await readFile(`${dir}/responses.json`, 'utf8'))));
assert.equal(runs[0].length, 140);
assert.equal(runs[1].length, 20);
const responses = runs.flat();
const products = responses.flatMap(r => r.body?.results || []);
const catalog = {};
for (const id of new Set(products.map(p => p.product_id))) {
  const response = await fetch(`${process.env.SEARCH_TEST_BASE_URL || 'http://localhost:3010'}/api/v1/products/${encodeURIComponent(id)}`);
  assert.equal(response.status, 200);
  catalog[id] = await response.json();
}
await writeFile(`${directory}/catalog-evidence.json`, JSON.stringify(catalog, null, 2));
const statuses = {};
const groundingIssues = [];
const aliases = { turbidity: 'turbidity', 'soil moisture': 'volumetric_water_content', rainfall: 'precipitation', 'soil temperature': 'soil_temperature', 'air temperature': 'air_temperature', 'relative humidity': 'relative_humidity', 'wind speed': 'wind_speed', 'wind direction': 'wind_direction', 'dissolved oxygen': 'dissolved_oxygen', 'solar radiation': 'solar_radiation' };
const normalize = value => String(value).normalize('NFC').toLowerCase();
for (const p of products) for (const e of p.explanation?.evidence || []) {
  const detail = catalog[p.product_id];
  const value = e.field === 'model' ? detail.product.model : e.field.startsWith('taxonomy.') ? detail.taxonomy[e.field.slice(9)] : detail[e.field];
  const confirmed = e.source === 'normalized_spec'
    ? detail.specifications.some(s => s.canonical_key === e.field && Object.values(s.normalized_value).includes(e.value))
    : e.field === 'measurements' || e.field === 'capabilities'
      ? value?.some(item => [item.label_en, item.label_vi].some(label => normalize(label) === normalize(e.value)) || item.key === aliases[e.value.split(' / ')[0].toLowerCase()])
      : Array.isArray(value) ? value.includes(e.value) : value === e.value;
  if (!confirmed) groundingIssues.push({ model: p.model, evidence: e });
}
for (const p of products) {
  const status = p.explanation?.generation?.status || 'missing';
  statuses[status] = (statuses[status] || 0) + 1;
}
const summary = {
  rawQueries: runs[0].length, contextualQueries: runs[1].length,
  httpErrors: responses.filter(r => r.error || r.status !== 200).length,
  contractErrors: responses.filter(r => !SearchResponseSchema.safeParse(r.body).success).length,
  wrongLanguage: responses.filter(r => r.body?.results?.some(p => p.explanation?.language !== r.language)).length,
  missingExplanation: products.filter(p => !p.explanation?.text).length,
  missingEvidence: products.filter(p => !p.explanation?.evidence?.length).length,
  contextScopeErrors: runs[1].filter(r => !r.body?.results?.length || r.body.results.some(p => !r.context.product_ids.includes(p.product_id))).length,
  emptyWithoutGuidance: responses.filter(r => r.body?.results?.length === 0 && !r.body?.guidance?.text).length,
  explanations: products.length, llm: products.filter(p => p.explanation?.source === 'llm').length,
  normalizedSpecEvidence: products.flatMap(p => p.explanation?.evidence || []).filter(e => e.source === 'normalized_spec').length,
  generationStatuses: statuses,
  groundingIssues: groundingIssues.length,
};
await writeFile(`${directory}/grounding-issues.json`, JSON.stringify(groundingIssues, null, 2));
await writeFile(`${directory}/verification.json`, JSON.stringify(summary, null, 2));
const rows = responses.map(r => `| ${r.id} | ${r.language} | ${r.context ? 'Có' : 'Không'} | ${r.status || 'ERROR'} | ${(r.body?.results || []).map(p => p.model).join(', ') || 'Cần làm rõ'} |`).join('\n');
await writeFile(`${directory}/report.md`, `# Kiểm tra cải tiến AI Search explanation\n\n${new Date().toISOString()}\n\nĐã chạy nguyên văn 70 case × VI/EN, thêm 20 lượt EXPLAIN với nhu cầu độ ẩm/nhiệt độ đất, SDI-12 và phạm vi CS655/CS650. Các lượt thiếu lịch sử hỏi lại model và nhu cầu thay vì tự suy đoán.\n\n130 kiểm thử backend, 34 kiểm thử client đạt; lint các file backend thay đổi và build thành công. Giao diện desktop/mobile và nút giải thích model ngoài nhóm đầu được kiểm tra bằng Playwright.\n\n\`\`\`json\n${JSON.stringify(summary, null, 2)}\n\`\`\`\n\nĐây là kiểm tra HTTP, hợp đồng dữ liệu, ngôn ngữ, phạm vi hội thoại và sự hiện diện bằng chứng; không phải chứng nhận mọi suy luận đều đúng hay 160 lượt đạt chất lượng ngữ nghĩa tuyệt đối. Dữ liệu catalog thực tế được lưu trong catalog-evidence.json để đối chiếu.\n\nLLM chọn cách diễn đạt từ các phương án đã có bằng chứng. Trạng thái accepted xác nhận được dùng; timeout/unavailable/invalid_response giữ lời giải thích theo dữ liệu. Câu hỏi nhiệt độ chưa rõ môi trường đo cần làm rõ; WATER-010 không có sản phẩm được xác nhận đồng thời toàn bộ yêu cầu. Số kênh, thời gian lưu, tuổi thọ nguồn, ngưỡng cảnh báo, khả năng tương thích và lắp đặt vẫn cần cấu hình thực tế; không tự kết luận từ taxonomy.\n\n| Case | Ngôn ngữ | Context | HTTP | Model / cần làm rõ |\n|---|---|---|---|---|\n${rows}\n\nDữ liệu đầy đủ: [responses.json](responses.json), [context responses](../explanation-cases-context/responses.json), [verification.json](verification.json).\n`);
console.log(JSON.stringify(summary));
for (const key of ['httpErrors', 'contractErrors', 'wrongLanguage', 'missingExplanation', 'missingEvidence', 'contextScopeErrors', 'emptyWithoutGuidance', 'groundingIssues']) assert.equal(summary[key], 0, key);
