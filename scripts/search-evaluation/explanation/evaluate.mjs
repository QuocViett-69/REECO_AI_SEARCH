import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { mean, percentile } from '../metrics.mjs';
import {
  DeterministicTemplateExplanationProvider,
  EVIDENCE_VERSION,
  FUTURE_PROMPT_VERSION,
  GroundedEvidenceBuilder,
  TEMPLATE_VERSION,
  matchedFeatures,
  validateExplanation,
} from './grounded-explanation.mjs';

process.env.RERANKER_ENABLED = 'false';
const root = path.resolve(import.meta.dirname, '..', '..', '..');
const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require(path.join(root, 'apps/api/dist/app.module.js'));
const { ProductsService } = require(path.join(root, 'apps/api/dist/modules/products/products.service.js'));
const { TechnicalMatchService } = require(path.join(root, 'apps/api/dist/modules/search/technical-match.service.js'));
const { TechnicalQueryParserService } = require(path.join(root, 'apps/api/dist/modules/search/technical-query-parser.service.js'));

const readJson = async (...parts) => JSON.parse(await readFile(path.join(root, ...parts), 'utf8'));
const [benchmark, baseline, vocabulary] = await Promise.all([
  readJson('data', 'evaluation', 'search-benchmark-v1.1.json'),
  readJson('data', 'reports', 'search-baseline-v1.1.json'),
  readJson('data', 'ontology', 'semantic-vocabulary.json'),
]);
const documentFiles = (await readdir(path.join(root, 'data/search-documents'))).filter((file) => file.endsWith('.json'));
const documents = new Map((await Promise.all(documentFiles.map((file) => readJson('data', 'search-documents', file)))).map((document) => [document.product_id, document]));
const queryById = new Map(benchmark.queries.map((query) => [query.id, query]));
const resultsById = new Map(baseline.query_results.map((item) => [item.query_id, item.result_ids]));

const normalIds = [
  'q001', 'q003', 'q004', 'q005', 'q011',
  'q021', 'q022', 'q024', 'q028',
  'q036', 'q037', 'q039', 'q042', 'q045', 'q046',
  'q051', 'q052', 'q054', 'q056', 'q060', 'q062',
  'q066', 'q067', 'q068', 'q069', 'q070', 'q071',
  'q081', 'q082', 'q083', 'q085', 'q088',
  'q091', 'q096', 'q097', 'q098',
];
const pairSpecs = [
  ...normalIds.map((queryId) => ({ queryId, selection: 'top_result' })),
  ...['q045', 'q051', 'q060', 'q100'].map((queryId) => ({ queryId, selection: 'unknown_evidence' })),
];

const round = (value, digits = 6) => Number(value.toFixed(digits));
const hash = (value) => createHash('sha256').update(value).digest('hex');
const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
const products = app.get(ProductsService);
const parser = app.get(TechnicalQueryParserService);
const matcher = app.get(TechnicalMatchService);
const identities = await products.getActiveTechnicalIdentityCatalog();
const builder = new GroundedEvidenceBuilder(vocabulary);
const provider = new DeterministicTemplateExplanationProvider();
const cases = [];

try {
  for (const [index, pairSpec] of pairSpecs.entries()) {
    const definition = queryById.get(pairSpec.queryId);
    const resultIds = resultsById.get(pairSpec.queryId) ?? [];
    const parsed = parser.parse(definition.query, identities);
    const technicalMatches = await matcher.evaluate(parsed, resultIds);
    let selectedIndex = 0;
    if (pairSpec.selection === 'unknown_evidence') {
      selectedIndex = technicalMatches.findIndex((item) =>
        [...item.protocolMatches, ...item.temperatureMatches].some((evaluation) => evaluation.result === 'UNKNOWN'));
      if (selectedIndex < 0) throw new Error(`No UNKNOWN search result found for ${pairSpec.queryId}`);
    }
    const productId = resultIds[selectedIndex];
    const technical = technicalMatches[selectedIndex];
    const document = documents.get(productId);
    const evidence = builder.build({
      query: definition.query,
      declaredLanguage: definition.language,
      document,
      technical,
      retrievalContext: true,
    });
    const started = performance.now();
    const generated = provider.generate({ query: definition.query, product: evidence.product, evidence, language: evidence.language });
    const latencyMs = performance.now() - started;
    const validation = validateExplanation(evidence, generated);
    cases.push({
      case_id: `ex${String(index + 1).padStart(3, '0')}`,
      query_id: definition.id,
      query: definition.query,
      category: definition.category,
      language: evidence.language,
      selection: pairSpec.selection,
      search_result_rank: selectedIndex + 1,
      product_id: productId,
      model: document.model,
      evidence,
      template_explanation: generated.explanation,
      template_latency_ms: round(latencyMs, 4),
      automatic_validation: validation,
      human_review: { grounded: null, correct: null, useful: null, concise: null, review_notes: '' },
    });
  }
} finally {
  await app.close();
}

const latencySamples = cases.map((item) => item.template_latency_ms);
const groupedLatency = (count) => {
  const samples = [];
  for (let iteration = 0; iteration < 100; iteration += 1) {
    const started = performance.now();
    for (const item of cases.slice(0, count)) provider.generate({ evidence: item.evidence });
    samples.push(performance.now() - started);
  }
  return { p50: round(percentile(samples, 50), 4), p95: round(percentile(samples, 95), 4), max: round(Math.max(...samples), 4) };
};
const violationTotals = Object.fromEntries(Object.keys(cases[0].automatic_validation.violations).map((key) => [key, cases.reduce((sum, item) => sum + item.automatic_validation.violations[key], 0)]));
const count = (predicate) => cases.filter(predicate).length;
const summary = {
  pair_count: cases.length,
  english_cases: count((item) => item.language === 'en'),
  vietnamese_cases: count((item) => item.language === 'vi'),
  exact_identity_cases: count((item) => item.evidence.identity.exact_match),
  protocol_cases: count((item) => item.evidence.protocols.length > 0),
  numeric_cases: count((item) => item.evidence.technical_constraints.length > 0),
  unknown_cases: count((item) => [...item.evidence.protocols, ...item.evidence.technical_constraints].some((evidence) => evidence.status === 'UNKNOWN')),
  semantic_context_cases: count((item) => item.evidence.semantic_context !== null),
  automatic_safety_passes: count((item) => item.automatic_validation.pass),
  automatic_safety_failures: count((item) => !item.automatic_validation.pass),
};
const searchOrderHash = hash(JSON.stringify(baseline.query_results.map((item) => ({ query_id: item.query_id, result_ids: item.result_ids }))));
const generatedAt = new Date().toISOString();
const evaluation = {
  schema_version: '1.0',
  evaluation_id: 'explanation-evaluation-v1',
  generated_at: generatedAt,
  benchmark_id: benchmark.benchmark_id,
  evidence_version: EVIDENCE_VERSION,
  template_version: TEMPLATE_VERSION,
  future_prompt_version: FUTURE_PROMPT_VERSION,
  model_discovery: {
    installed_ollama_models: [{ name: 'qwen3-embedding:4b', type: 'embedding', suitable_for_generation: false }],
    suitable_local_generative_model_available: false,
    llm_evaluation_run: false,
  },
  selection_policy: 'Deterministic 40-pair category/language sample from frozen real baseline results; four technical cases select the first retrieved result with UNKNOWN evidence. No relevance labels enter providers.',
  frozen_search_result_order_sha256: searchOrderHash,
  summary,
  latency_ms: {
    one_explanation: { p50: round(percentile(latencySamples, 50), 4), p95: round(percentile(latencySamples, 95), 4), max: round(Math.max(...latencySamples), 4), mean: round(mean(latencySamples), 4) },
    top_3_sequential_template: groupedLatency(3),
    top_5_sequential_template: groupedLatency(5),
  },
  cases,
};
const groundingReport = {
  schema_version: '1.0',
  report_id: 'explanation-grounding-v1',
  generated_at: generatedAt,
  evidence_version: EVIDENCE_VERSION,
  template_version: TEMPLATE_VERSION,
  summary,
  violations: violationTotals,
  provider_input_policy: 'Only the grounded evidence pack is passed to the provider; benchmark relevance, judgments, reviewer notes, scores, vectors, and database internals are excluded.',
  semantic_context_policy: 'CONTEXT_ONLY may describe contextual relation and taxonomy, but cannot assert protocol, numeric, identity, or compatibility facts.',
  mismatch_policy: 'MISMATCH is retained as negative evidence and can never be rendered as MATCH.',
  cases: cases.map((item) => ({ case_id: item.case_id, query_id: item.query_id, product_id: item.product_id, validation: item.automatic_validation })),
};
const docs = `# Grounded explanation design\n\n## Status\n\nSTEP 9.4A is an offline foundation. Search ranking, retrieval, reranking, SearchResponse, frontend, and Supabase data remain unchanged.\n\n## Contract\n\n\`${EVIDENCE_VERSION}\` contains only query-relevant product identity, taxonomy, measurements, matched features, requested protocol states, requested numeric constraint states, capabilities, applications, supporting specifications, and a bounded semantic context. It excludes vectors, benchmark labels, reviewer notes, secrets, full database rows, and ranking internals.\n\nThe deterministic builder preserves MATCH, UNKNOWN, and MISMATCH. A protocol or numeric MATCH is rejected by schema validation unless supporting structured evidence is present. Semantic context never establishes a technical fact.\n\n## Providers\n\n\`ExplanationProvider.generate({ query, product, evidence, language })\` is the boundary. \`DeterministicTemplateExplanationProvider\` (${TEMPLATE_VERSION}) is the evaluated fallback and safety reference. \`LLMGroundedExplanationProvider\` exists as an unconfigured boundary; it fails closed without an approved generator.\n\nNo suitable local generative model is installed. \`qwen3-embedding:4b\` is embedding-only, and the BGE reranker is not a generator. No model was downloaded.\n\n## Language and style\n\nEnglish and Vietnamese are selected deterministically from the benchmark language, with a deterministic mixed-query fallback. Model and protocol identifiers remain unchanged. Output is limited to one to three factual sentences and does not expose ranks, RRF, or similarity.\n\n## Evaluation\n\nThe frozen real search output supplies ${summary.pair_count} query/product pairs: ${summary.english_cases} English and ${summary.vietnamese_cases} Vietnamese. It includes ${summary.exact_identity_cases} exact identity, ${summary.protocol_cases} protocol, ${summary.numeric_cases} numeric, and ${summary.unknown_cases} UNKNOWN cases. Automatic safety violations: ${Object.values(violationTotals).reduce((sum, value) => sum + value, 0)}. Template p50/p95: ${evaluation.latency_ms.one_explanation.p50}/${evaluation.latency_ms.one_explanation.p95} ms.\n\n## Future runtime design (not implemented)\n\nGenerate explanations only when requested. For Top-N, prefer one bounded batch or controlled concurrency after measuring a future approved generator; do not assume five sequential generations are acceptable. The persistent cache is deliberately deferred. A future cache key must include normalized query/version, product ID, evidence content/version, model revision, and prompt/template version—never product ID alone.\n\nSuggested local models for a later approved experiment: Qwen2.5 3B Instruct (about 2–3 GB quantized, practical on 8 GB RAM) or Qwen2.5 7B Instruct (about 5–6 GB quantized, preferably 8 GB+ VRAM or 16 GB system RAM). Model choice and download require explicit approval.\n`;
const finalizedDocs = docs.replace(
  /Suggested local models[^\n]+/u,
  'Suggested local models for a later approved experiment: `qwen3:4b` (official Ollama artifact 2.5 GB; estimated practical budget 6–8 GB RAM/VRAM) or `qwen3:8b` (official artifact 5.2 GB; estimated practical budget 10–12 GB RAM/VRAM). `gemma3:4b` is a 3.3 GB multilingual alternative. These memory budgets are planning estimates, not vendor guarantees. Model choice and download require explicit approval. Sources: https://ollama.com/library/qwen3/tags and https://ollama.com/library/gemma3.',
);

await Promise.all([
  writeFile(path.join(root, 'data/evaluation/explanation-evaluation-v1.json'), `${JSON.stringify(evaluation, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data/reports/explanation-grounding-v1.json'), `${JSON.stringify(groundingReport, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'docs/grounded-explanation-design.md'), finalizedDocs, 'utf8'),
]);

process.stdout.write(`${JSON.stringify({ summary, violations: violationTotals, latency_ms: evaluation.latency_ms, frozen_search_result_order_sha256: searchOrderHash }, null, 2)}\n`);
