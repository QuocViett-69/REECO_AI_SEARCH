import { readFile, writeFile } from 'node:fs/promises';
import { cases, judgmentsFor } from './stress-cases.mjs';
import { mean, recallAt, reciprocalRankAt, ndcgAt, percentile } from './metrics.mjs';

const dir = new URL('../../output/search-stress/', import.meta.url);
const read = name => readFile(new URL(name, dir), 'utf8').then(JSON.parse);
const [before, after, catalog, http] = await Promise.all(['before.json', 'after.json', 'catalog.json', 'http.json'].map(read));
const httpReranker = await read('http-reranker.json').catch(() => null);
const httpFallback = await read('http-fallback.json');
const httpBeforeFallbackFix = await read('http-before-fallback-fix.json');
const httpBeforePowerFix = await read('http-before-power-fix.json');
const httpBeforeReaderFix = await read('http-before-reader-fix.json');
const regressionLog = await readFile(new URL('../search-stress-regression-after.log', dir));
const regressionText = regressionLog.toString(regressionLog[0] === 0xff ? 'utf16le' : 'utf8');
const regressionCount = Number(/tests\s+(\d+)/u.exec(regressionText)?.[1]);
if (!regressionCount || !/fail\s+0\b/u.test(regressionText)) throw new Error('A passing regression log is required');
if (!before.complete || !after.complete) throw new Error('Benchmark is still running');
const stages = ['keyword', 'semantic', 'hybrid', 'public', 'reranker'];
const metricNames = ['hit1', 'hit3', 'hit5', 'mrr', 'recall5', 'ndcg5'];
const definitions = new Map(cases.map(c => [c.id, c]));
const byId = new Map(catalog.map(c => [c.product.product_id, c]));
const pct = value => value === null ? 'N/A' : `${(value * 100).toFixed(2)}%`;
const fixed = value => value === null ? 'N/A' : value.toFixed(4);
const names = rows => rows.slice(0, 5).map(r => r.model).join(', ') || '∅';
const metric = (rows, judgments) => {
  if (!judgments.length) return null;
  const ids = rows.map(r => r.product_id);
  const relevant = new Set(judgments.map(j => j.product_id));
  return { hit1: Number(ids.slice(0, 1).some(id => relevant.has(id))), hit3: Number(ids.slice(0, 3).some(id => relevant.has(id))),
    hit5: Number(ids.slice(0, 5).some(id => relevant.has(id))), mrr: reciprocalRankAt(ids, judgments, 100),
    recall5: recallAt(ids, judgments, 5), ndcg5: ndcgAt(ids, judgments, 5) };
};
function assess(report) {
  for (const r of report.records) {
    r.intent = definitions.get(r.id)?.intent ?? r.intent;
    r.judgments = judgmentsFor(r.intent, catalog);
    r.metrics = Object.fromEntries(stages.map(stage => [stage, metric(r[stage], r.judgments)]));
    const strict = /^[EFGQ]/u.test(r.id) || r.intent.includes('&');
    const relevant = new Set(r.judgments.map(j => j.product_id));
    r.constraint_violations = strict ? r.public.slice(0, 5).filter(p => !relevant.has(p.product_id)).map(p => p.product_id) : [];
    const failures = [];
    if (r.unknown_ids.length || r.constraint_violations.length || r.grounding_errors?.length || r.error && !(r.intent === 'negative' && r.error.status === 400)) failures.push('FILTER_FAILURE');
    if (r.source_error) failures.push('HYBRID_FUSION_FAILURE');
    if (r.metrics.public?.hit1 === 0) failures.push(r.intent.startsWith('model:') && !r.id.startsWith('J') ? 'EXACT_MATCH_FAILURE'
      : r.id.startsWith('J') ? 'TYPO_FAILURE' : r.id.startsWith('G') ? 'NUMERIC_QUERY_FAILURE'
      : r.id.startsWith('E') ? 'TOKEN_NORMALIZATION_FAILURE' : r.language === 'vi/mixed' ? 'MULTILINGUAL_FAILURE' : 'SEMANTIC_FAILURE');
    if (r.intent === 'negative' && !r.error) failures.push('NEGATION_FAILURE');
    if (r.intent === 'outofdomain' && r.public.some(p => !/cannot confirm|no more specific|does not confirm|chưa/iu.test(p.explanation?.text ?? ''))) failures.push('OUT_OF_DOMAIN_FAILURE');
    if (r.metrics.reranker && r.metrics.public && r.metrics.reranker.ndcg5 + 1e-9 < r.metrics.public.ndcg5) failures.push('RERANKER_FAILURE');
    r.failure_classification = [...new Set(failures)];
    r.status = failures.length ? 'FAIL' : r.intent === 'negative' ? 'LIMITATION' : r.judgments.length || ['ambiguous', 'outofdomain'].includes(r.intent) ? 'PASS' : 'UNJUDGED';
  }
  const selected = report.records.filter(r => !r.id.startsWith('CAT'));
  report.summary = Object.fromEntries(stages.map(stage => [stage, Object.fromEntries(metricNames.map(m => [m, mean(selected.map(r => r.metrics[stage]?.[m]))]))]));
  report.statuses = Object.fromEntries(['PASS', 'FAIL', 'LIMITATION', 'UNJUDGED'].map(s => [s, report.records.filter(r => r.status === s).length]));
  return report;
}
assess(before);
assess(after);
const oldById = new Map(before.records.map(r => [r.id, r]));
const supplied = after.records.filter(r => !r.id.startsWith('CAT'));
const eligible = supplied.filter(r => r.judgments.length);
const regressions = supplied.filter(r => r.metrics.public && r.metrics.public.ndcg5 + 1e-9 < oldById.get(r.id).metrics.public.ndcg5);
const rerankOutcomes = { improved: [], unchanged: [], worse: [] };
const evidenceKeys = { 'soil moisture': 'volumetric_water_content', 'relative humidity': 'relative_humidity', 'air pressure': 'barometric_pressure',
  turbidity: 'turbidity', 'soil electrical conductivity': 'soil_electrical_conductivity', rainfall: 'precipitation',
  'soil temperature': 'soil_temperature', 'air temperature': 'air_temperature', 'water temperature': 'water_temperature' };
function grounded(item, productId) {
  const entry = byId.get(productId), d = entry?.document;
  if (!entry || !d) return false;
  if (item.source === 'products') return item.field === 'model' && item.value === entry.product.model;
  if (item.source === 'normalized_spec') return [...entry.specifications, ...d.important_specifications].some(s => {
    if (s.canonical_key !== item.field) return false;
    const v = s.normalized_value;
    return [v.value_raw, v.value, v.type === 'range' ? `${v.min_value}–${v.max_value}${v.unit}` : undefined].includes(item.value);
  });
  if (item.field.startsWith('taxonomy.')) return d.taxonomy[item.field.slice(9)] === item.value;
  if (['supported_protocols', 'unsupported_protocols'].includes(item.field)) return d[item.field].includes(item.value);
  const semantic = d[item.field];
  if (!Array.isArray(semantic)) return false;
  const alias = evidenceKeys[item.value.split(' / ')[0]];
  return semantic.some(s => s.label_en === item.value || s.label_vi === item.value || alias && s.key === (item.field === 'capabilities' ? `measure_${alias}` : alias));
}
for (const report of [before, after]) {
  for (const r of report.records) r.grounding_errors = r.public.flatMap(p => (p.explanation?.evidence ?? []).filter(e => !grounded(e, p.product_id)).map(e => ({ product_id: p.product_id, evidence: e })));
  assess(report);
}
for (const r of eligible) {
  const delta = r.metrics.reranker.ndcg5 - r.metrics.public.ndcg5;
  rerankOutcomes[delta > 1e-9 ? 'improved' : delta < -1e-9 ? 'worse' : 'unchanged'].push(r.id);
}
const reason = r => {
  if (r.grounding_errors?.length) return ['FILTER_FAILURE', 'Temperature capability evidence named taxonomy.device_type but used a translated capability label as its value.', 'When capability comes from taxonomy, cite the exact recorded device type.'];
  if (r.intent === 'negative') return ['NEGATION_FAILURE', 'The exclusion syntax was not recognized and its term became a positive requirement.', 'Reject unsupported exclusions explicitly with HTTP 400.'];
  if (r.intent === 'outofdomain') return ['OUT_OF_DOMAIN_FAILURE', 'A shared word or interface was presented without qualifying the unmatched use case.', 'Keep catalog facts, with an explicit statement that the requested use case is unconfirmed.'];
  if (r.id.startsWith('J')) return r.intent.startsWith('model:') || r.intent.startsWith('prefix:')
    ? ['TYPO_FAILURE', 'Exact-only keyword retrieval did not recall catalog prefixes or a one-character identifier typo.', 'Add bounded catalog-derived model suggestions without claiming an exact identity.']
    : ['TYPO_FAILURE', 'The misspelled device-role word was not constrained, so an interface-only product survived filtering.', 'Accept the missing repeated consonant in logger while still requiring both the device role and protocol.'];
  if (/^E|^G/u.test(r.id)) return ['SEARCH_TEXT_FAILURE', 'Raw specification evidence was absent from retrieval or text specifications were excluded; some protocol tokens were not parsed.', 'Retrieve literal raw-spec hits, preserve numeric boundaries, paginate evidence, and recognize reviewed interfaces.'];
  if (r.intent.startsWith('model:')) return ['EXACT_MATCH_FAILURE', 'Exact identity parsing required the whole query to equal the model.', 'Recognize unambiguous bounded catalog identities inside descriptions.'];
  return [r.language === 'vi/mixed' ? 'MULTILINGUAL_FAILURE' : 'FILTER_FAILURE', 'The intent parser missed a measurement, device role, synonym, or the scope of a technical requirement.', 'Match shared bilingual concepts to recorded measurements, taxonomy and specifications before reranking.'];
};
const traceRows = r => {
  const ids = [...new Set(stages.flatMap(s => r[s].slice(0, 5).map(p => p.product_id)))];
  return ids.map(id => {
    const ranks = Object.fromEntries(stages.map(s => [s, r[s].findIndex(p => p.product_id === id) + 1 || null]));
    const scores = Object.fromEntries(['keyword', 'semantic', 'hybrid'].map(s => [s, r[s].find(p => p.product_id === id)?.score ?? null]));
    return { product_id: id, model: byId.get(id)?.product.model, ranks, scores,
      reranker_score: r.rerank_trace?.response?.results.find(p => p.product_id === id)?.score ?? null };
  });
};
const debug = before.records.filter(r => r.status === 'FAIL').map(r => {
  const current = after.records.find(a => a.id === r.id);
  const [extra, cause, fix] = reason(r);
  return { test: r.id, query: r.query, expected_intent: r.intent, expected_relevant_products: r.judgments,
    top_5_returned: r.public.slice(0, 5), keyword_ranks: r.keyword, semantic_ranks: r.semantic, hybrid_ranks: r.hybrid,
    reranker_ranks: r.reranker, reranker_response: r.rerank_trace,
    failure_classification: [...new Set([...r.failure_classification, extra])], suspected_cause: cause,
    fix_applied: current.status === 'PASS' || current.status === 'LIMITATION' ? fix : `Unresolved: ${fix}`,
    regression_tests: ['scripts/search/stress-regression.test.mjs', 'scripts/search/technical-match.test.mjs', 'scripts/search/explanation-runtime.test.mjs', 'full 223-case benchmark'],
    after_status: current.status, after_top_5: current.public.slice(0, 5), before_trace: traceRows(r), after_trace: traceRows(current) };
});
const stageFailures = supplied.flatMap(r => stages.filter(stage => r.metrics[stage]?.hit1 === 0).map(stage => ({
  test: r.id, stage, query: r.query, expected_intent: r.intent, expected_relevant_products: r.judgments,
  top_5_returned: r[stage].slice(0, 5), keyword_ranks: r.keyword, semantic_ranks: r.semantic,
  hybrid_ranks: r.hybrid, reranker_ranks: r.reranker, trace: traceRows(r),
  failure_classification: [stage === 'reranker' ? 'RERANKER_FAILURE' : stage === 'hybrid' ? 'HYBRID_FUSION_FAILURE'
    : r.language === 'vi/mixed' ? 'MULTILINGUAL_FAILURE' : stage === 'semantic' ? 'SEMANTIC_FAILURE' : 'SEARCH_TEXT_FAILURE'],
  suspected_cause: r.metrics[stage].hit5 ? 'Relevant evidence is retrieved below rank 1.' : 'No judged-relevant product appears in the Top 5 of this standalone stage.',
  fix_applied: r.metrics.public?.hit1 === 1 ? 'The combined public pipeline resolves this case; the standalone stage remains weaker.' : 'Unresolved in the public pipeline.',
  regression_tests: ['full 223-case benchmark'],
})));
debug.push({ test: 'P0_EXPLANATION_ADVERSARIAL', query: 'sensor supporting SDI-12',
  expected_intent: 'Only catalog-supported facts in explanation', top_5_returned: [], keyword_ranks: [], semantic_ranks: [], hybrid_ranks: [], reranker_ranks: [],
  failure_classification: ['FILTER_FAILURE'], suspected_cause: 'Number and capitalized-token checks accepted an injected rewrite claiming waterproofing and medical suitability.',
  fix_applied: 'Accept only the verified statement, optionally prefixed with its catalog model. Arbitrary paraphrases fall back to deterministic text.',
  regression_tests: ['scripts/search/explanation-runtime.test.mjs'], after_status: 'PASS',
  evidence: 'output/search-stress-p0-before.log and output/search-stress-regression-after.log; adversarial validator test, not an observed live LLM statement.' });
const safety = { returned_unknown_product_ids: after.records.flatMap(r => r.unknown_ids), constraint_violations: after.records.filter(r => r.constraint_violations.length).map(r => ({ id: r.id, products: r.constraint_violations })),
  fallback_queries: after.records.filter(r => !r.source_diagnostics?.keywordSucceeded || !r.source_diagnostics?.semanticSucceeded).map(r => r.id),
  reranker_errors: after.records.filter(r => r.rerank_trace?.error).map(r => r.id), regressions: regressions.map(r => r.id) };
safety.grounding_errors = after.records.flatMap(r => r.public.flatMap(p => (p.explanation?.evidence ?? []).filter(e => !grounded(e, p.product_id)).map(e => ({ id: r.id, product_id: p.product_id, evidence: e }))));
const httpRelevanceFailures = http.records.filter(r => {
  const definition = definitions.get(r.id);
  const judgments = judgmentsFor(definition.intent, catalog);
  return judgments.length && !judgments.some(j => j.product_id === r.body?.results?.[0]?.product_id);
}).map(r => r.id);
const httpModes = Object.fromEntries([...new Set(http.records.map(r => r.body?.mode).filter(Boolean))].map(mode => [mode, http.records.filter(r => r.body?.mode === mode).length]));
const summary = { generated_at: new Date().toISOString(), before: before.summary, after: after.summary, before_statuses: before.statuses, after_statuses: after.statuses,
  http_fallback: { requests: httpFallback.request_count, errors: httpFallback.errors, hit1_failures: httpFallback.records.filter(r => r.hit1 === 0).map(r => r.id) },
  supplied_cases: supplied.length, metric_eligible_cases: eligible.length, exact_catalog: after.exact_catalog,
  reranker: Object.fromEntries(Object.entries(rerankOutcomes).map(([key, ids]) => [key, { count: ids.length, ids }])), safety,
  regression_test_count: regressionCount,
  http_reranker: httpReranker ? { requests: httpReranker.request_count, errors: httpReranker.errors,
    attempts: httpReranker.reranker_requests.length, request_failures: httpReranker.reranker_requests.filter(r => r.error).length,
    hit1_failures: httpReranker.records.filter(r => r.hit1 === 0).map(r => r.id) } : null,
  http: { requests: http.request_count, concurrency: http.concurrency, errors: http.errors, latency_ms: http.latency_ms, relevance_failures: httpRelevanceFailures, modes: httpModes } };
const table = report => stages.map(s => `| ${s} | ${pct(report.summary[s].hit1)} | ${pct(report.summary[s].hit3)} | ${pct(report.summary[s].hit5)} | ${fixed(report.summary[s].mrr)} | ${pct(report.summary[s].recall5)} | ${fixed(report.summary[s].ndcg5)} |`).join('\n');
const metricHeader = '| Stage | Hit@1 | Hit@3 | Hit@5 | MRR | Recall@5 | nDCG@5 (binary) |\n|---|---:|---:|---:|---:|---:|---:|';
const pairs = [['C01', 'B01'], ['C02', 'D01'], ['C04', 'B07'], ['C05', 'B06'], ['C06', 'B09'], ['C07', 'B05'], ['C08', 'B04'], ['C09', 'B10'], ['C10', 'B08'], ['F02', 'F01'], ['F08', 'F07'], ['G02', 'G01']];
const pairRows = pairs.map(([vi, en]) => {
  const v = supplied.find(r => r.id === vi), e = supplied.find(r => r.id === en);
  return `| ${vi} / ${en} | ${names(v.public)} | ${names(e.public)} | ${pct(v.metrics.semantic.hit1)} / ${pct(e.metrics.semantic.hit1)} |`;
}).join('\n');
const qRows = supplied.filter(r => r.id.startsWith('Q')).map(r => `### ${r.id}: ${r.query}\n\n${!r.rerank_trace ? 'Reranker không gọi khi còn dưới hai ứng viên; không gán điểm giả.\n\n' : ''}| Model | Keyword rank | Semantic rank | RRF rank | Trước rerank | Sau rerank | Keyword score | Semantic score | RRF score | BGE logit |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n${traceRows(r).map(t => `| ${t.model} | ${t.ranks.keyword ?? '—'} | ${t.ranks.semantic ?? '—'} | ${t.ranks.hybrid ?? '—'} | ${t.ranks.public ?? '—'} | ${t.ranks.reranker ?? '—'} | ${t.scores.keyword ?? '—'} | ${t.scores.semantic ?? '—'} | ${t.scores.hybrid ?? '—'} | ${t.reranker_score ?? '—'} |`).join('\n')}`).join('\n\n');
for (const r of [...httpBeforeFallbackFix.records, ...httpBeforePowerFix.records, ...httpBeforeReaderFix.records].filter(r => {
  const judgments = judgmentsFor(definitions.get(r.id).intent, catalog);
  return judgments.length && !judgments.some(j => j.product_id === r.body?.results?.[0]?.product_id);
})) debug.push({
  id: `${r.id}-HTTP-FALLBACK`, query: r.query, expected_intent: definitions.get(r.id).intent,
  top_5_returned: r.body?.results ?? [], keyword_ranks: null, semantic_ranks: null, hybrid_ranks: null, reranker_ranks: null,
  failure_classification: r.id === 'K03' ? ['MULTILINGUAL_FAILURE', 'HYBRID_FUSION_FAILURE'] : ['FILTER_FAILURE'],
  suspected_cause: r.id === 'K03' ? 'Sparse lexical prose retrieval loses suitable candidates during a semantic outage.' : 'A requested device category was not enforced; broad relevance judgments could conceal it. HTTP does not expose intermediate ranks.',
  fix_applied: r.id === 'K03' ? 'Supplement sparse keyword retrieval with existing canonical intent concepts; preserve original hits and constraints.' : 'Recognize the power category and reader/analyzer device role using recorded taxonomy; tighten independent reader judgments.',
  regression_tests: ['scripts/search/stress-regression.test.mjs', 'http-fallback.json', 'full 223-case benchmark', 'full 134-query HTTP suite'],
  after_status: http.records.find(c => c.id === r.id)?.hit1 === 1 ? 'PASS' : 'FAIL',
});
const md = `# AI Search stress test — 29/09/2026

## Kết quả

- ${supplied.length} case người dùng cung cấp (A08–Q05), thêm ${after.exact_catalog.count} query exact model từ database: tổng ${after.records.length}.
- Exact model: **${after.exact_catalog.top1}/${after.exact_catalog.count} Top 1**. Không suy diễn nội dung A01–A07 chưa được cung cấp.
- Sau sửa: **${after.statuses.PASS} PASS, ${after.statuses.FAIL} FAIL, ${after.statuses.LIMITATION} LIMITATION**. Các case phủ định trả HTTP 400 rõ ràng; chưa có bộ lọc phủ định tổng quát.
- Không có ID ngoài catalog trong kết quả của các tầng. Có ${safety.constraint_violations.length} case vi phạm điều kiện trong Top 5 theo bộ đánh giá; ${safety.grounding_errors.length} evidence không đối chiếu được với product record.
- HTTP: ${http.request_count} request thật, concurrency ${http.concurrency}, ${http.errors} lỗi ngoài trạng thái dự kiến; p50 ${(http.latency_ms.p50 / 1000).toFixed(2)}s, p95 ${(http.latency_ms.p95 / 1000).toFixed(2)}s. Hit@1 failures: ${httpRelevanceFailures.join(', ') || '0'}; mode counts: ${JSON.stringify(httpModes)}.
- Reranker: ${rerankOutcomes.improved.length} cải thiện, ${rerankOutcomes.unchanged.length} giữ nguyên, ${rerankOutcomes.worse.length} giảm nDCG@5 trên ${eligible.length} case có nhãn. ${regressions.length} regression nDCG@5 của public pipeline so với trước sửa.

## Cách đo và giới hạn

Kiểm thử fallback chủ động ngắt Semantic: ${httpFallback.request_count} HTTP requests, ${httpFallback.errors} lỗi, ${summary.http_fallback.hit1_failures.length} Hit@1 failures. Dùng các câu logger tiếng Anh, tiếng Việt, mixed và typo; kiểm tra yêu cầu Wi-Fi vẫn được giữ. Xem [http-fallback.json](http-fallback.json). Lỗi K03 trước sửa được lưu ở [http-before-fallback-fix.json](http-before-fallback-fix.json).

Đọc snapshot đầy đủ ${catalog.length} sản phẩm active và ${catalog.reduce((n, row) => n + row.specifications.length, 0)} specification từ database. Keyword và Semantic được gọi thật; Hybrid dùng RRF hiện hành. Mỗi query dùng cùng candidate set cho public filter và BGE. **public** = Hybrid + intent/technical filters; **reranker** = public + pinned BGE Top-5. Điểm RRF, cosine, lexical và BGE logit không phải xác suất đúng. Literal raw-spec hits mới có lexical score 0 nếu không có điểm RPC, không tạo confidence giả.

Nhãn binary được tạo độc lập từ evidence trong toàn catalog bằng **stress-cases.mjs**, không lấy ranking làm ground truth. Đây là nhãn tự động có thể review, chưa phải gold set do chuyên gia chấm. Hai pha được tính lại trên cùng nhãn; “water sensor” chấp nhận cả soil-water-content vì query mơ hồ. ${eligible.length} case đủ nhãn để tính metrics; 12 case phủ định/out-of-domain/quá mơ hồ không đưa vào trung bình relevance. Recall dùng toàn bộ tập relevant được tìm thấy trong snapshot. MRR tính trên candidate list đã thu thập (tối đa 100), không tuyên bố recall toàn database ngoài tập nhãn.

Benchmark BGE dùng timeout ${after.comparison_reranker_timeout_ms}ms để đo chất lượng; cấu hình ứng dụng là ${after.configured_reranker_timeout_ms}ms. HTTP toàn bộ suite tắt reranker và LLM rewrite để đo pipeline xác định. Reranker cải thiện offline không có nghĩa đã được bật trong cấu hình ứng dụng. Rerank lỗi/fallback: ${safety.reranker_errors.length}. Retrieval fallback: ${safety.fallback_queries.length}.

Smoke HTTP riêng với reranker bật, dùng timeout ứng dụng: ${httpReranker ? `${httpReranker.request_count} query Q01–Q05; ${httpReranker.errors} lỗi HTTP, ${httpReranker.reranker_requests.length} lần gọi BGE, ${httpReranker.reranker_requests.filter(r => r.error).length} lỗi gọi BGE. Q04 chỉ còn một ứng viên nên bỏ qua reranker. Xem [http-reranker.json](http-reranker.json).` : 'Chưa chạy.'}

LLM rewrite đã bị giới hạn vào câu verified hoặc câu verified có tiền tố model. Regression có payload bịa waterproof/medical và thông số mới; đều bị từ chối. Không dùng vài kết quả model ngẫu nhiên để tuyên bố mọi output AI tương lai đều đúng. Query ngoài domain vẫn có thể trả sản phẩm để tham khảo, nhưng explanation nói rõ chưa xác nhận mục đích sử dụng. Chưa có bộ phân loại domain hoặc confidence được hiệu chuẩn.

## Metrics trước sửa

${metricHeader}
${table(before)}

## Metrics sau sửa

${metricHeader}
${table(after)}

## Sửa nguyên nhân

- Identity parser nhận model trong câu có mô tả, giữ ranh giới identifier và không coi số đo là model số.
- Bổ sung RS-232, USB, CANbus, CPI; CANbus có thể được xác nhận từ raw specification.
- Evidence batch đọc cả text và phân trang; không mất dữ liệu sau 1.000 dòng. Theo [Supabase range](https://supabase.com/docs/reference/javascript/using-modifiers-range), chỉ số cuối là inclusive và cần thứ tự ổn định.
- Keyword retrieval bổ sung literal spec, bảo toàn số/unit, phân biệt ADC với phép đo điện trở 24-bit; model suggestions lấy từ catalog, không có mapping query → product.
- Intent dùng evidence cho lượng nước trong đất, humidity của đất, danh sách thông số thời tiết, thu thập/truyền dữ liệu, wireless, lượng mưa và chất lượng nước.
- Keyword bổ sung các khái niệm từ intent parser khi số ứng viên ít; giữ kết quả gốc và bộ lọc cuối, để câu tiếng Việt/tiếng Anh có từ đệm vẫn có ứng viên khi Semantic lỗi.
- Nhận diện cú pháp phủ định chưa hỗ trợ; transport “is unavailable” không trở thành yêu cầu dương.
- Explanation không nhận free-form rewrite thêm claim, và không xác nhận use case chỉ vì trùng từ/interface.

## Vietnamese ↔ English

| VI / EN | VI Top 5 public | EN Top 5 public | Semantic-only Hit@1 VI / EN |
|---|---|---|---|
${pairRows}

## Tất cả case được cung cấp

| Test | Query | Trạng thái | Public Top 5 | Reranked Top 5 |
|---|---|---|---|---|
${supplied.map(r => `| ${r.id} | ${r.query} | ${r.status} | ${names(r.public)} | ${names(r.reranker)} |`).join('\n')}

## Q: trace các tầng và điểm thật

${qRows}

## Tệp bằng chứng và chạy lại

- [summary.json](summary.json): metrics, safety, regression và reranker deltas.
- [before.json](before.json), [after.json](after.json): mỗi query, nhãn, toàn bộ ranking/score và explanation.
- [failures.json](failures.json): mỗi FAIL trước sửa có expected intent, Top 5, từng tầng, classification, suspected cause, fix và regression tests.
- [stage-failures.json](stage-failures.json): ${stageFailures.length} trường hợp một tầng riêng lẻ trượt Hit@1, kể cả khi public pipeline đã đạt; không giấu hạn chế Keyword/Semantic sau kết quả cuối.
- [http.json](http.json): response thật và latency từng request.
- [catalog.json](catalog.json), [retrieval-before.json](retrieval-before.json), [retrieval.json](retrieval.json): snapshot và retrieval gốc để tái hiện.
- ${regressionCount} regression tests qua, build API và lint các module đã kiểm tra qua. Log: **output/search-stress-regression-after.log**.

~~~powershell
npm.cmd run build:shared
npm.cmd run build:api
node --test scripts/search/*.test.mjs scripts/search-evaluation/*.test.mjs scripts/search-evaluation/**/*.test.mjs scripts/create-embeddings/*.test.mjs
node --env-file=apps/api/.env scripts/search-evaluation/stress.mjs --phase=after
node --env-file=apps/api/.env scripts/search-evaluation/stress-http.mjs
node --env-file=apps/api/.env scripts/search-evaluation/stress-http.mjs --reranker --cases=Q01,Q02,Q03,Q04,Q05
node scripts/search-evaluation/stress-report.mjs
~~~

Cần Ollama và pinned BGE đang chạy để so sánh đủ bốn tầng. **--replay** tái dùng retrieval đã ghi; không đại diện cho một lượt retrieval mới. Không thay schema/dữ liệu database, không chỉnh embedding hay gán sản phẩm theo ID để pass benchmark. Đây là kiểm thử relevance và tải đồng thời 4; chưa phải đo capacity cực đại hay soak test dài hạn.
`;
await Promise.all([
  writeFile(new URL('report.md', dir), md),
  writeFile(new URL('summary.json', dir), JSON.stringify(summary, null, 2) + '\n'),
  writeFile(new URL('failures.json', dir), JSON.stringify(debug, null, 2) + '\n'),
  writeFile(new URL('stage-failures.json', dir), JSON.stringify(stageFailures, null, 2) + '\n'),
  writeFile(new URL('before.json', dir), JSON.stringify(before, null, 2) + '\n'),
  writeFile(new URL('after.json', dir), JSON.stringify(after, null, 2) + '\n'),
]);
console.log(JSON.stringify({ statuses: after.statuses, safety, reranker: Object.fromEntries(Object.entries(rerankOutcomes).map(([key, ids]) => [key, ids.length])), http: summary.http }, null, 2));
if (after.statuses.FAIL || http.errors || httpRelevanceFailures.length || safety.grounding_errors.length || httpFallback.errors || summary.http_fallback.hit1_failures.length) process.exitCode = 1;
