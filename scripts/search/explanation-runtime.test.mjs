import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..', '..');
const require = createRequire(import.meta.url);
const { ExplanationService } = require(path.join(root, 'apps/api/dist/modules/search/explanation.service.js'));
const document = JSON.parse(await readFile(path.join(root, 'data/search-documents/CSI_CS655.json'), 'utf8'));
const service = new ExplanationService();

test('structured requirements keep confirmed facts, missing facts and explicit mismatches separate', () => {
  const unsupported = { ...document, unsupported_protocols: ['Modbus'] };
  const rawRef = document.important_specifications.find(item => item.canonical_key === 'operating_temperature_range').raw_ref;
  const explanation = service.explain('đo độ ẩm đất và độ ẩm không khí, Modbus, hoạt động ở 90°C', unsupported, {
    productId: document.product_id, identityMatch: 'none',
    protocolMatches: [{ queryProtocol: 'Modbus', result: 'MISMATCH', evidence: [{ source: 'product_document', canonicalProtocol: 'Modbus', relation: 'unsupported' }] }],
    temperatureMatches: [{ constraint: { kind: 'point', intent: 'operating', valueCelsius: 90, unit: '°C', confidence: 'high' }, result: 'MISMATCH',
      evidence: [{ source: 'normalized_spec', canonicalKey: 'operating_temperature_range', candidateRange: { minCelsius: -50, maxCelsius: 70, unit: '°C' }, result: 'MISMATCH', rawRef }] }],
  });
  assert.ok(explanation.requirements.some(item => item.status === 'confirmed' && item.label === 'độ ẩm đất' && item.evidence.length));
  assert.ok(explanation.requirements.some(item => item.status === 'unconfirmed' && item.label === 'độ ẩm không khí' && !item.evidence.length));
  assert.equal(explanation.requirements.find(item => item.label === 'Modbus').status, 'mismatch');
  const operating = explanation.requirements.find(item => item.label.includes('90°C'));
  assert.equal(operating.status, 'mismatch');
  assert.deepEqual(operating.evidence[0].raw_ref, rawRef);
  require('@reeco/shared').SearchResultSchema.shape.explanation.parse(explanation);
});

test('short weather queries explain documented measurements rather than only the device category', async () => {
  const weather = JSON.parse(await readFile(path.join(root, 'data/search-documents/CSI_CLIMAVUE40.json'), 'utf8'));
  const leaf = JSON.parse(await readFile(path.join(root, 'data/search-documents/CSI_LWS.json'), 'utf8'));
  for (const query of ['Cảm biến thời tiết', 'Cảm biến khí tượng', 'Khí tượng thủy văn', 'meteorological sensor']) {
    const explanation = service.explain(query, weather);
    assert.ok(explanation.evidence.some(item => item.field === 'measurements' && /wind speed|tốc độ gió/iu.test(item.value)), query);
    assert.match(explanation.text, /cấu hình lắp đặt.*chưa|chưa xác nhận cấu hình lắp đặt|installation.*unconfirmed/iu);
    assert.doesNotMatch(explanation.text, /chưa có bằng chứng cụ thể hơn/u);
    const incompatible = service.explain(query, leaf);
    assert.match(incompatible.text, /chưa có dữ liệu xác nhận|does not confirm/iu);
    assert.equal(incompatible.evidence.length, 0);
  }
});

test('use-case explanations distinguish measurements from treatment across water and soil equipment', async () => {
  const load = async model => JSON.parse(await readFile(path.join(root, `data/search-documents/CSI_${model}.json`), 'utf8'));
  const query = 'bây giờ hồ cá tôi đang bị bẩn tôi muốn cải thiện chất lượng nước nên dùng thiết bị gì';
  const turbidity = service.explain(query, await load('CLARIVUE10'));
  const oxygen = service.explain(query, await load('CS511'));
  assert.match(turbidity.text, /đo độ đục/u);
  assert.match(turbidity.text, /không lọc hoặc làm sạch/u);
  assert.doesNotMatch(turbidity.text, /đáp ứng yêu cầu về đo chất lượng nước/u);
  assert.ok(turbidity.evidence.some(item => item.field === 'measurements' && item.value === 'Độ đục'));
  assert.match(oxygen.text, /không đồng nghĩa thiếu oxy/u);
  assert.match(oxygen.text, /không làm sạch nước hoặc cấp oxy/u);
  const soil = service.explain('tôi muốn theo dõi độ ẩm đất để cải thiện tưới', document);
  assert.match(soil.text, /có số liệu để theo dõi/u);
  assert.match(soil.text, /không xác nhận thiết bị tự xử lý/u);
  assert.ok(soil.evidence.some(item => item.field === 'measurements'));
  const irrelevant = service.explain(query, document);
  assert.doesNotMatch(irrelevant.text, /trước\/sau xử lý|đo oxy hòa tan/u);
  assert.match(service.explain('I want to monitor soil moisture to improve irrigation', document).text, /does not establish automatic treatment/u);
  const logger = { ...document, measurements: [], taxonomy: { ...document.taxonomy, device_type: 'Data Logger' } };
  assert.match(service.explain('tôi cần bộ ghi dữ liệu để theo dõi', logger).text, /không thay thế cảm biến đo/u);
  const modem = { ...logger, taxonomy: { ...logger.taxonomy, device_type: 'Cellular Modem' } };
  assert.match(service.explain('tôi cần thiết bị truyền dữ liệu qua cellular', modem).text, /giao thức, mạng và thiết bị kết nối/u);
  const air = { ...document, measurements: [{ key: 'relative_humidity', label_en: 'Relative humidity', label_vi: 'Độ ẩm không khí' }] };
  assert.match(service.explain('tôi muốn theo dõi độ ẩm không khí', air).text, /có số liệu để theo dõi/u);
});

test('explanation contract accepts source metadata and remains compatible with older responses', () => {
  const { SearchResultSchema } = require('@reeco/shared');
  const schema = SearchResultSchema.shape.explanation;
  const explanation = service.explain('soil moisture sensor', document);
  assert.equal(schema.parse(explanation).source, 'rule');
  assert.equal(schema.parse({ ...explanation, source: 'llm' }).source, 'llm');
  const { source, ...legacy } = explanation;
  assert.equal(schema.safeParse(legacy).success, true);
  assert.equal(schema.safeParse({ ...explanation, source: 'invented' }).success, false);
});

test('water temperature explanation names the measured medium and cites catalog evidence', async () => {
  const waterSensor = JSON.parse(await readFile(path.join(root, 'data/search-documents/CSI_TEMPVUE50.json'), 'utf8'));
  const soilSensor = JSON.parse(await readFile(path.join(root, 'data/search-documents/CSI_TCAV.json'), 'utf8'));
  const query = 'tôi muốn mua một cảm biến đo nhiệt độ nước';
  const confirmed = service.explain(query, waterSensor);
  const unconfirmed = service.explain(query, soilSensor);
  assert.match(confirmed.text, /nhiệt độ nước/u);
  assert.equal(confirmed.evidence[0].field, 'measurements');
  assert.match(unconfirmed.text, /chưa có dữ liệu xác nhận/iu);
  assert.equal(unconfirmed.evidence.length, 0);
});

test('protocol confirmation requires supporting catalog evidence', () => {
  const base = { productId: document.product_id, identityMatch: 'none', protocolMatches: [], temperatureMatches: [] };
  const unknown = service.explain('sensor with SDI-12', document, {
    ...base,
    protocolMatches: [{ queryProtocol: 'SDI-12', result: 'UNKNOWN', evidence: [] }],
  });
  assert.match(unknown.text, /does not confirm support/u);
  assert.equal(unknown.evidence.length, 0);

  const supported = service.explain('cảm biến hỗ trợ SDI-12', document, {
    ...base,
    protocolMatches: [{ queryProtocol: 'SDI-12', result: 'MATCH', evidence: [{ source: 'product_document', canonicalProtocol: 'SDI-12', relation: 'supported' }] }],
  });
  assert.equal(supported.language, 'vi');
  assert.equal(supported.evidence[0].value, 'SDI-12');
});

test('numeric claim cites only a confirmed structured range', () => {
  const explanation = service.explain('operates at -40°C', document, {
    productId: document.product_id,
    identityMatch: 'none',
    protocolMatches: [],
    temperatureMatches: [{
      constraint: { kind: 'point', intent: 'operating', valueCelsius: -40, unit: '°C', confidence: 'high' },
      result: 'MATCH',
      evidence: [{ source: 'normalized_spec', canonicalKey: 'operating_temperature_range', candidateRange: { minCelsius: -50, maxCelsius: 70, unit: '°C' }, result: 'MATCH', rawRef: { file: 'data/raw/CS616_CS650_CS655.json', product_index: 2, spec_index: 1, source_rows: [4] } }],
    }],
  });
  assert.match(explanation.text, /-50–70°C.*-40°C/u);
  assert.equal(explanation.evidence.length, 1);
  assert.equal(explanation.evidence[0].field, 'operating_temperature_range');
  assert.equal(explanation.evidence[0].value, '-50–70°C');
  assert.equal(explanation.evidence[0].raw_ref.product_index, 2);
  assert.equal(explanation.requirements[0].status, 'confirmed');
});

test('local LLM selects verified wording and falls back on invented model details', async () => {
  const priorEnabled = process.env.LLM_EXPLANATION_ENABLED;
  const priorModel = process.env.LLM_MODEL;
  const priorFetch = globalThis.fetch;
  process.env.LLM_EXPLANATION_ENABLED = 'true';
  process.env.LLM_MODEL = 'test-model';
  const llmService = new ExplanationService();
  const match = { productId: document.product_id, identityMatch: 'none', protocolMatches: [{ queryProtocol: 'SDI-12', result: 'MATCH', evidence: [{ source: 'product_document', canonicalProtocol: 'SDI-12', relation: 'supported' }] }], temperatureMatches: [] };
  const input = [{ document, match }];
  try {
    let request;
    globalThis.fetch = async (_url, options) => {
      request = JSON.parse(options.body);
      return { ok: true, json: async () => ({ message: { content: JSON.stringify({ explanations: [{ index: 0, option: 1 }] }) } }) };
    };
    const [selected] = await llmService.explainMany('sensor supporting SDI-12', input);
    const offered = JSON.parse(request.messages[1].content);
    assert.equal(offered.query, 'sensor supporting SDI-12');
    assert.equal(selected.text, offered.items[0].options[1]);
    assert.equal(selected.source, 'llm');
    assert.equal(selected.generation.status, 'accepted');
    assert.ok(selected.generation.latency_ms >= 0);
    assert.notEqual(selected.text, llmService.explain('sensor supporting SDI-12', document, match).text);
    assert.match(selected.text, /SDI-12.*does not confirm suitability/u);
    assert.equal(selected.evidence.find(item => item.field === 'model').value, document.model);

    globalThis.fetch = async () => ({ ok: true, json: async () => ({ message: { content: JSON.stringify({ explanations: [{ index: 0, text: `${document.model} supports SDI-12 as confirmed by product data.` }] }) } }) });
    const [rewritten] = await llmService.explainMany('sensor supporting SDI-12', input);
    assert.equal(rewritten.text, llmService.explain('sensor supporting SDI-12', document, match).text);
    assert.equal(rewritten.evidence[0].value, 'SDI-12');
    assert.equal(rewritten.source, 'rule');
    assert.equal(rewritten.generation.status, 'invalid_response');

    globalThis.fetch = async () => ({ ok: true, json: async () => ({ message: { content: JSON.stringify({ explanations: [{ index: 0, text: `The model ${document.model} supports Modbus 999.` }] }) } }) });
    const [rejected] = await llmService.explainMany('sensor supporting SDI-12', input);
    assert.equal(rejected.text, llmService.explain('sensor supporting SDI-12', document, match).text);

    globalThis.fetch = async () => ({ ok: true, json: async () => ({ message: { content: JSON.stringify({ explanations: [{ index: 0, text: `${document.model} supports SDI-12 and is waterproof and suitable for medical diagnosis.` }] }) } }) });
    const [inventedCapability] = await llmService.explainMany('sensor supporting SDI-12', input);
    assert.equal(inventedCapability.text, llmService.explain('sensor supporting SDI-12', document, match).text);

    globalThis.fetch = async () => { throw new Error('offline'); };
    const [fallback] = await llmService.explainMany('sensor supporting SDI-12', input);
    assert.equal(fallback.text, llmService.explain('sensor supporting SDI-12', document, match).text);
    assert.equal(fallback.source, 'rule');
    assert.equal(fallback.generation.status, 'unavailable');
    globalThis.fetch = async () => { throw new DOMException('Timed out', 'TimeoutError'); };
    assert.equal((await llmService.explainMany('sensor supporting SDI-12', input))[0].generation.status, 'timeout');
  } finally {
    globalThis.fetch = priorFetch;
    if (priorEnabled === undefined) delete process.env.LLM_EXPLANATION_ENABLED;
    else process.env.LLM_EXPLANATION_ENABLED = priorEnabled;
    if (priorModel === undefined) delete process.env.LLM_MODEL;
    else process.env.LLM_MODEL = priorModel;
  }
});

test('generic temperature query explains a specific medium instead of falling back to taxonomy', async () => {
  const sensor = JSON.parse(await readFile(path.join(root, 'data/search-documents/CSI_TEMPVUE50.json'), 'utf8'));
  const explanation = service.explain('cảm biến nhiệt độ', sensor);
  assert.match(explanation.text, /nhiệt độ nước/u);
  assert.match(explanation.text, /Dải đo nhiệt độ: -40–60°C/u);
  assert.doesNotMatch(explanation.text, /chưa có bằng chứng cụ thể/iu);
  assert.equal(explanation.source, 'rule');
  assert.ok(explanation.evidence.some(item => item.field === 'measurements'));
});

test('partial matches keep verified requirements and name the missing requirement', async () => {
  const sensor = JSON.parse(await readFile(path.join(root, 'data/search-documents/CSI_TEMPVUE50.json'), 'utf8'));
  const explanation = service.explain('cảm biến nhiệt độ nước và độ ẩm không khí', sensor);
  assert.match(explanation.text, /dữ liệu xác nhận nhiệt độ nước/u);
  assert.match(explanation.text, /Chưa có dữ liệu xác nhận độ ẩm không khí/u);
  assert.match(explanation.text, /chưa thể kết luận đáp ứng toàn bộ yêu cầu/u);
  assert.ok(explanation.evidence.some(item => item.value.includes('water temperature')));
  assert.ok(!explanation.evidence.some(item => item.value.includes('relative humidity')));
});

test('operating limits never imply a measurement range or hide a mismatch', () => {
  const base = { productId: document.product_id, identityMatch: 'none', protocolMatches: [] };
  const constraint = { kind: 'point', intent: 'operating', valueCelsius: -200, unit: '°C', confidence: 'high' };
  const explanation = service.explain('hoạt động ở -200°C', document, { ...base, temperatureMatches: [{ constraint, result: 'MISMATCH', evidence: [{ source: 'normalized_spec', canonicalKey: 'operating_temperature_range', candidateRange: { minCelsius: -50, maxCelsius: 70, unit: '°C' }, result: 'MISMATCH' }] }] });
  assert.match(explanation.text, /Dải hoạt động -50–70°C không đáp ứng -200°C/u);
  assert.doesNotMatch(explanation.text, /Dải đo/u);
  const ambiguous = service.explain('nhiệt độ -40°C', document, { ...base, temperatureMatches: [{ constraint: { ...constraint, intent: 'ambiguous', valueCelsius: -40 }, result: 'UNKNOWN', evidence: [] }] });
  assert.match(ambiguous.text, /chưa rõ dải đo hay hoạt động/u);
});

test('LLM wording retains all matched facts, numbers and uncertainty, with a three-result budget', async () => {
  const priorEnabled = process.env.LLM_EXPLANATION_ENABLED;
  const priorModel = process.env.LLM_MODEL;
  const priorFetch = globalThis.fetch;
  process.env.LLM_EXPLANATION_ENABLED = 'true';
  process.env.LLM_MODEL = 'test-model';
  const llmService = new ExplanationService();
  const constraint = { kind: 'point', intent: 'operating', valueCelsius: -40, unit: '°C', confidence: 'high' };
  const match = { productId: document.product_id, identityMatch: 'none', protocolMatches: [], temperatureMatches: [{ constraint, result: 'MATCH', evidence: [{ source: 'normalized_spec', canonicalKey: 'operating_temperature_range', candidateRange: { minCelsius: -50, maxCelsius: 70, unit: '°C' }, result: 'MATCH' }] }] };
  try {
    globalThis.fetch = async (_url, options) => {
      const request = JSON.parse(options.body);
      const { items } = JSON.parse(request.messages[1].content);
      assert.equal(items.length, 3);
      for (const item of items) for (const text of item.options) {
        assert.match(text, /soil moisture|độ ẩm đất/u);
        assert.match(text, /does not confirm air temperature/u);
        assert.match(text, /-50–70°C.*-40°C/u);
      }
      return { ok: true, json: async () => ({ message: { content: JSON.stringify({ explanations: items.map(item => ({ index: item.index, option: 1 })) }) } }) };
    };
    const input = Array.from({ length: 4 }, () => ({ document, match }));
    const outputs = await llmService.explainMany('soil moisture and air temperature, operates at -40°C', input);
    assert.deepEqual(outputs.map(item => item.source), ['llm', 'llm', 'llm', 'rule']);

    for (const option of [-1, 99, 0.5, '1']) {
      globalThis.fetch = async () => ({ ok: true, json: async () => ({ message: { content: JSON.stringify({ explanations: [{ index: 0, option }] }) } }) });
      const [fallback] = await llmService.explainMany('soil moisture and air temperature, operates at -40°C', input);
      assert.equal(fallback.source, 'rule');
    }
  } finally {
    globalThis.fetch = priorFetch;
    if (priorEnabled === undefined) delete process.env.LLM_EXPLANATION_ENABLED;
    else process.env.LLM_EXPLANATION_ENABLED = priorEnabled;
    if (priorModel === undefined) delete process.env.LLM_MODEL;
    else process.env.LLM_MODEL = priorModel;
  }
});
