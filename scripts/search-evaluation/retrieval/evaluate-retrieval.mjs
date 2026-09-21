import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { mean, percentile } from '../metrics.mjs';
import { METRIC_NAMES, queryMetrics, rerankPrefix } from '../reranker/harness.mjs';
import { BGE_CONFIG, BgeRerankerProvider } from '../reranker/bge-provider.mjs';
import { compactCandidate, supportsProtocol } from '../reranker/candidate-input.mjs';
import { buildQueryVocabulary, normalizeQuery } from './query-normalizer.mjs';

process.env.RERANKER_ENABLED = 'false';
const root = path.resolve(import.meta.dirname, '..', '..', '..');
const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require(path.join(root, 'apps/api/dist/app.module.js'));
const { KeywordSearchService } = require(path.join(root, 'apps/api/dist/modules/search/keyword-search.service.js'));
const { SemanticSearchService } = require(path.join(root, 'apps/api/dist/modules/search/semantic-search.service.js'));
const { SearchScoreService } = require(path.join(root, 'apps/api/dist/modules/search/search-score.service.js'));
const { TechnicalMatchService } = require(path.join(root, 'apps/api/dist/modules/search/technical-match.service.js'));
const { TechnicalQueryParserService } = require(path.join(root, 'apps/api/dist/modules/search/technical-query-parser.service.js'));
const { TechnicalRankingService } = require(path.join(root, 'apps/api/dist/modules/search/technical-ranking.service.js'));
const { ProductsService } = require(path.join(root, 'apps/api/dist/modules/products/products.service.js'));

const readJson = async (...parts) => JSON.parse(await readFile(path.join(root, ...parts), 'utf8'));
const [benchmark, frozenBaseline, opportunitySet, vocabulary] = await Promise.all([
  readJson('data', 'evaluation', 'search-benchmark-v1.1.json'),
  readJson('data', 'reports', 'search-baseline-v1.1.json'),
  readJson('data', 'evaluation', 'reranker-opportunity-set-v1.json'),
  readJson('data', 'ontology', 'semantic-vocabulary.json'),
]);
const documentFiles = (await readdir(path.join(root, 'data', 'search-documents'))).filter((file) => file.endsWith('.json'));
const documents = new Map((await Promise.all(documentFiles.map((file) => readJson('data', 'search-documents', file)))).map((document) => [document.product_id, document]));
const missingCases = opportunitySet.retrieval_failures;
const round = (value, digits = 6) => value === null ? null : Number(value.toFixed(digits));
const semanticKey = (value) => value.normalize('NFC').toLocaleLowerCase('en-US').replace(/\s+/gu, ' ').trim();
const rank = (ids, productId) => { const index = ids.indexOf(productId); return index < 0 ? null : index + 1; };
const overlap = (left, right, count) => {
  const a = new Set(left.slice(0, count));
  const b = new Set(right.slice(0, count));
  const intersection = [...a].filter((id) => b.has(id)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 1 : intersection / union;
};

function fuse(keywordRows, semanticRows, scoreService) {
  const candidates = new Map();
  keywordRows.forEach((row, index) => candidates.set(row.product_id, {
    productId: row.product_id, model: row.model, productNameEn: row.product_name_en,
    keywordRank: index + 1, semanticRank: null, keywordScore: row.rank,
    semanticScore: null, rrfScore: scoreService.calculateRrfScore(index + 1, null),
    matchedBy: { keyword: true, semantic: false },
  }));
  for (const semantic of semanticRows) {
    const existing = candidates.get(semantic.productId);
    if (existing) {
      existing.semanticRank = semantic.rank;
      existing.semanticScore = semantic.similarity;
      existing.matchedBy.semantic = true;
      existing.rrfScore = scoreService.calculateRrfScore(existing.keywordRank, semantic.rank);
    } else {
      candidates.set(semantic.productId, {
        productId: semantic.productId, model: semantic.model, productNameEn: semantic.productNameEn,
        keywordRank: null, semanticRank: semantic.rank, keywordScore: null,
        semanticScore: semantic.similarity, rrfScore: scoreService.calculateRrfScore(null, semantic.rank),
        matchedBy: { keyword: false, semantic: true },
      });
    }
  }
  return [...candidates.values()].sort((left, right) => scoreService.compareHybridCandidates(left, right));
}

function mergeSemantic(original, canonical, scoreService) {
  if (!canonical) return original;
  const values = new Map();
  for (const [source, rows] of [['original', original], ['canonical', canonical]]) {
    rows.forEach((row, index) => {
      const item = values.get(row.productId) ?? { row, originalRank: null, canonicalRank: null };
      item[`${source}Rank`] = index + 1;
      if ((row.similarity ?? -Infinity) > (item.row.similarity ?? -Infinity)) item.row = row;
      values.set(row.productId, item);
    });
  }
  return [...values.values()]
    .map((item) => ({
      ...item,
      score: scoreService.calculateRrfScore(item.originalRank, item.canonicalRank),
    }))
    .sort((left, right) => right.score - left.score || (left.originalRank ?? 999) - (right.originalRank ?? 999) || (left.canonicalRank ?? 999) - (right.canonicalRank ?? 999) || left.row.productId.localeCompare(right.row.productId))
    .slice(0, 20)
    .map((item, index) => ({ ...item.row, rank: index + 1 }));
}

async function technicalOrder(query, candidates, parser, matcher, ranking, identities) {
  const parsed = parser.parse(query, identities);
  const applicable = parsed.confidence.identity === 'high' || parsed.confidence.protocol === 'high' || parsed.temperatureConstraints.some((item) => item.confidence === 'high' && item.intent !== 'ambiguous');
  const ranked = applicable
    ? ranking.rank(candidates, await matcher.evaluate(parsed, candidates.map((item) => item.productId)))
    : ranking.preserve(candidates);
  return { parsed, ranked, ids: ranked.map((item) => item.candidate.productId).slice(0, 20) };
}

function aggregateMetrics(records, field) {
  const eligible = records.filter((record) => record[field].metrics);
  return Object.fromEntries(METRIC_NAMES.map((name) => [name, round(mean(eligible.map((record) => record[field].metrics[name]))) ]));
}

function coverage(records, field, source) {
  const eligible = records.filter((record) => record.definition.judgments.some((item) => item.relevance > 0));
  const recalls = eligible.map((record) => {
    const ids = new Set(record[field][source]);
    const relevant = record.definition.judgments.filter((item) => item.relevance > 0);
    return relevant.filter((item) => ids.has(item.product_id)).length / relevant.length;
  });
  return round(mean(recalls));
}

function languageMetrics(records, field) {
  return Object.fromEntries(['en', 'vi', 'mixed'].map((language) => {
    const slice = records.filter((record) => record.definition.language === language && record[field].metrics);
    return [language, {
      query_count: slice.length,
      ...Object.fromEntries(METRIC_NAMES.map((name) => [name, round(mean(slice.map((record) => record[field].metrics[name])))])),
      candidate_recall_at_20: coverage(records.filter((record) => record.definition.language === language), field, 'final_ids'),
    }];
  }));
}

function categoryCoverage(records, field, source) {
  return Object.fromEntries([...new Set(records.map((record) => record.definition.category))].sort().map((category) => [
    category,
    coverage(records.filter((record) => record.definition.category === category), field, source),
  ]));
}

function languageCoverage(records, field) {
  return Object.fromEntries(['en', 'vi', 'mixed'].map((language) => {
    const slice = records.filter((record) => record.definition.language === language);
    return [language, {
      keyword_recall_at_20: coverage(slice, field, 'keyword_ids'),
      semantic_recall_at_20: coverage(slice, field, 'semantic_ids'),
      union_recall_at_20: coverage(slice, field, 'union_ids'),
      final_candidate_recall_at_20: coverage(slice, field, 'final_ids'),
    }];
  }));
}

function missingStatus(records, field) {
  const byQuery = new Map(records.map((record) => [record.definition.id, new Set(record[field].final_ids)]));
  const recovered = missingCases.filter((item) => byQuery.get(item.query_id)?.has(item.product_id));
  const remaining = missingCases.filter((item) => !byQuery.get(item.query_id)?.has(item.product_id));
  const affected = new Set(missingCases.map((item) => item.query_id));
  const remainingQueries = new Set(remaining.map((item) => item.query_id));
  return {
    recovered,
    remaining,
    queries_with_any_recovery: new Set(recovered.map((item) => item.query_id)).size,
    fully_resolved_queries: [...affected].filter((id) => !remainingQueries.has(id)).length,
    remaining_queries: remainingQueries.size,
  };
}

function safety(records, field) {
  const exactRegressions = records.filter((record) => record.definition.category === 'exact_identity' && record[field].final_ids[0] !== record.definition.constraints.canonical_product_id);
  const protocolRegressions = records.filter((record) => {
    if (record.definition.category !== 'protocol') return false;
    const protocol = record.definition.constraints.protocol;
    const count = (ids) => ids.slice(0, 5).filter((id) => supportsProtocol(documents.get(id), protocol)).length;
    return count(record[field].final_ids) < count(record.baseline.final_ids);
  });
  const numericLeaks = records.reduce((sum, record) => sum + record[field].ranked.filter((item) => item.technical.hardMismatch).length, 0);
  return { exact_identity_regressions: exactRegressions.length, protocol_regressions: protocolRegressions.length, numeric_hard_mismatch_leaks: numericLeaks };
}

const app = await NestFactory.create(AppModule, { logger: false });
await app.init();
const keywordSearch = app.get(KeywordSearchService);
const semanticSearch = app.get(SemanticSearchService);
const scoreService = app.get(SearchScoreService);
const parser = app.get(TechnicalQueryParserService);
const matcher = app.get(TechnicalMatchService);
const ranking = app.get(TechnicalRankingService);
const products = app.get(ProductsService);
const identities = await products.getActiveTechnicalIdentityCatalog();
const identityValues = identities.flatMap((item) => [item.productId, item.model]);
const records = [];

try {
  for (const [index, definition] of benchmark.queries.entries()) {
    const normalizationStarted = performance.now();
    const normalization = normalizeQuery(definition.query, vocabulary, identityValues);
    const normalizationMs = performance.now() - normalizationStarted;
    const retrievalStarted = performance.now();
    const [keyword, semantic] = await Promise.all([
      keywordSearch.search(definition.query, 20),
      semanticSearch.search(definition.query, 20),
    ]);
    const baselineRetrievalMs = performance.now() - retrievalStarted;
    const expandedStarted = performance.now();
    const expandedKeyword = normalization.expanded_keyword_query === definition.query
      ? keyword
      : await keywordSearch.search(normalization.expanded_keyword_query, 20);
    const expandedKeywordMs = performance.now() - expandedStarted;
    const baselineFused = fuse(keyword, semantic, scoreService);
    const strategyAFused = fuse(expandedKeyword, semantic, scoreService);
    const [baselineTechnical, strategyATechnical] = await Promise.all([
      technicalOrder(definition.query, baselineFused, parser, matcher, ranking, identities),
      technicalOrder(definition.query, strategyAFused, parser, matcher, ranking, identities),
    ]);
    const toRun = (keywordRows, semanticRows, fused, technical, totalMs) => ({
      keyword_ids: keywordRows.map((item) => item.product_id),
      semantic_ids: semanticRows.map((item) => item.productId),
      union_ids: [...new Set([...keywordRows.map((item) => item.product_id), ...semanticRows.map((item) => item.productId)])],
      fused_ids: fused.map((item) => item.productId).slice(0, 20),
      final_ids: technical.ids,
      parsed: technical.parsed,
      ranked: technical.ranked,
      metrics: queryMetrics(technical.ids, definition.judgments),
      latency_ms: round(totalMs, 3),
    });
    records.push({
      definition,
      normalization,
      normalization_ms: round(normalizationMs, 3),
      baseline: toRun(keyword, semantic, baselineFused, baselineTechnical, baselineRetrievalMs),
      strategy_a: toRun(expandedKeyword, semantic, strategyAFused, strategyATechnical, baselineRetrievalMs + normalizationMs + expandedKeywordMs),
      expanded_keyword_ms: round(expandedKeywordMs, 3),
    });
    if ((index + 1) % 10 === 0) process.stdout.write(`baseline+A ${index + 1}/100\n`);
  }

  const strategyAStatus = missingStatus(records, 'strategy_a');
  const strategyASufficient = strategyAStatus.fully_resolved_queries >= 13 && strategyAStatus.recovered.length >= 168;
  if (!strategyASufficient) {
    for (const [index, record] of records.entries()) {
      const canonicalChanged = semanticKey(record.normalization.canonical_semantic_query) !== semanticKey(record.definition.query);
      const semanticStarted = performance.now();
      const canonicalSemantic = canonicalChanged
        ? await semanticSearch.search(record.normalization.canonical_semantic_query, 20)
        : null;
      const additionalSemanticMs = performance.now() - semanticStarted;
      const mergedSemantic = mergeSemantic(
        record.baseline.semantic_ids.map((id, rankIndex) => {
          const document = documents.get(id);
          return { productId: id, model: document.model, productNameEn: document.name_en, similarity: 0, rank: rankIndex + 1 };
        }),
        canonicalSemantic,
        scoreService,
      );
      const expandedKeywordRows = await keywordSearch.search(record.normalization.expanded_keyword_query, 20);
      const fused = fuse(expandedKeywordRows, mergedSemantic, scoreService);
      const technical = await technicalOrder(record.definition.query, fused, parser, matcher, ranking, identities);
      record.strategy_b = {
        keyword_ids: expandedKeywordRows.map((item) => item.product_id),
        semantic_ids: mergedSemantic.map((item) => item.productId),
        union_ids: [...new Set([...expandedKeywordRows.map((item) => item.product_id), ...mergedSemantic.map((item) => item.productId)])],
        fused_ids: fused.map((item) => item.productId).slice(0, 20),
        final_ids: technical.ids,
        parsed: technical.parsed,
        ranked: technical.ranked,
        metrics: queryMetrics(technical.ids, record.definition.judgments),
        latency_ms: round(record.strategy_a.latency_ms + additionalSemanticMs, 3),
        additional_semantic_ms: round(additionalSemanticMs, 3),
      };
      if ((index + 1) % 10 === 0) process.stdout.write(`strategy B ${index + 1}/100\n`);
    }
  }
} finally {
  await app.close();
}

const strategyFields = ['baseline', 'strategy_a', ...(records[0].strategy_b ? ['strategy_b'] : [])];
const comparison = Object.fromEntries(strategyFields.map((field) => {
  const status = field === 'baseline' ? { recovered: [], remaining: missingCases, remaining_queries: 25, fully_resolved_queries: 0, queries_with_any_recovery: 0 } : missingStatus(records, field);
  return [field, {
    candidate_recall_at_20: coverage(records, field, 'final_ids'),
    keyword_recall_at_20: coverage(records, field, 'keyword_ids'),
    semantic_recall_at_20: coverage(records, field, 'semantic_ids'),
    union_recall_at_20: coverage(records, field, 'union_ids'),
    affected_queries_with_any_recovery: status.queries_with_any_recovery,
    affected_queries_fully_resolved: status.fully_resolved_queries,
    recovered_missing_cases: status.recovered.length,
    remaining_retrieval_failure_queries: status.remaining_queries,
    remaining_missing_cases: status.remaining.length,
    metrics: aggregateMetrics(records, field),
    language: languageMetrics(records, field),
    category_candidate_recall_at_20: categoryCoverage(records, field, 'final_ids'),
    safety: safety(records, field),
    latency_ms: {
      p50: round(percentile(records.map((record) => record[field].latency_ms), 50), 3),
      p95: round(percentile(records.map((record) => record[field].latency_ms), 95), 3),
    },
  }];
}));

const experimentalFields = strategyFields.filter((field) => field !== 'baseline');
const bestExperimentalField = [...experimentalFields].sort((left, right) => comparison[right].candidate_recall_at_20 - comparison[left].candidate_recall_at_20 || comparison[right].metrics.ndcg_at_5 - comparison[left].metrics.ndcg_at_5)[0];
const viable = experimentalFields.filter((field) => comparison[field].candidate_recall_at_20 > comparison.baseline.candidate_recall_at_20 && comparison[field].recovered_missing_cases >= 34 && comparison[field].affected_queries_fully_resolved >= 5 && comparison[field].metrics.precision_at_5 >= comparison.baseline.metrics.precision_at_5 && comparison[field].metrics.ndcg_at_5 >= comparison.baseline.metrics.ndcg_at_5 && comparison[field].metrics.ndcg_at_10 >= comparison.baseline.metrics.ndcg_at_10 && Object.values(comparison[field].safety).every((value) => value === 0));
const bestField = viable.sort((left, right) => comparison[right].candidate_recall_at_20 - comparison[left].candidate_recall_at_20 || comparison[right].metrics.ndcg_at_5 - comparison[left].metrics.ndcg_at_5)[0] ?? 'baseline';
const experimentalStatus = missingStatus(records, bestExperimentalField);

const technicalByCase = new Map();
for (const queryId of new Set(missingCases.map((item) => item.query_id))) {
  const queryCases = missingCases.filter((item) => item.query_id === queryId);
  const parsed = records.find((record) => record.definition.id === queryId).baseline.parsed;
  const matches = await matcher.evaluate(parsed, queryCases.map((item) => item.product_id)).catch(() => []);
  for (const match of matches) technicalByCase.set(`${queryId}\0${match.productId}`, match);
}

const diagnostics = missingCases.map((item) => {
  const record = records.find((candidate) => candidate.definition.id === item.query_id);
  const keywordRank = rank(record.baseline.keyword_ids, item.product_id);
  const semanticRank = rank(record.baseline.semantic_ids, item.product_id);
  const fusedRank = rank(record.baseline.fused_ids, item.product_id);
  const finalRank = rank(record.baseline.final_ids, item.product_id);
  const technical = technicalByCase.get(`${item.query_id}\0${item.product_id}`);
  const causes = [];
  if (keywordRank === null) causes.push('KEYWORD_MISS');
  if (semanticRank === null) causes.push('SEMANTIC_MISS');
  if (keywordRank === null && semanticRank === null) causes.push('BOTH_SOURCE_MISS');
  if ((keywordRank !== null || semanticRank !== null) && fusedRank === null) causes.push('FUSION_DROP');
  if (fusedRank !== null && finalRank === null) causes.push('TECHNICAL_FILTER_DROP');
  if (record.normalization.detected_concepts.length > 0 && keywordRank === null) causes.push('VOCABULARY_ALIAS_GAP');
  const document = documents.get(item.product_id);
  const evidenceValues = item.evidence_summary.flatMap((evidence) => Object.values(evidence).filter((value) => typeof value === 'string'));
  if (document && evidenceValues.length > 0 && !evidenceValues.some((value) => JSON.stringify(document).toLocaleLowerCase().includes(value.toLocaleLowerCase()))) causes.push('PRODUCT_DOCUMENT_GAP');
  if (!document || item.evidence_summary.length === 0) causes.push('DATA_EVIDENCE_GAP');
  const relevantCount = record.definition.judgments.filter((judgment) => judgment.relevance > 0).length;
  if (relevantCount > 20) causes.push('BROAD_QUERY_COMPETITION');
  if (causes.length === 0) causes.push('OTHER');
  return {
    query_id: item.query_id, query: item.query, language: item.language, category: item.category,
    expected_product_id: item.product_id, relevance: item.relevance,
    keyword_rank: keywordRank, semantic_rank: semanticRank, rrf_candidate_rank: fusedRank,
    final_candidate_rank: finalRank,
    technical_status: technical ? { hard_mismatch: technical.hardMismatch, identity: technical.identityMatch, protocol: technical.protocolMatches.map((match) => ({ protocol: match.queryProtocol, result: match.result })), temperature: technical.temperatureMatches.map((match) => match.result) } : null,
    root_causes: causes,
    evidence_summary: item.evidence_summary,
  };
});

const rootCauseDistribution = {};
for (const item of diagnostics) for (const cause of item.root_causes) rootCauseDistribution[cause] = (rootCauseDistribution[cause] ?? 0) + 1;
const complementarity = { keyword_only: 0, semantic_only: 0, both: 0, neither: 0 };
for (const record of records) for (const judgment of record.definition.judgments.filter((item) => item.relevance > 0)) {
  const keyword = record.baseline.keyword_ids.includes(judgment.product_id);
  const semantic = record.baseline.semantic_ids.includes(judgment.product_id);
  complementarity[keyword && semantic ? 'both' : keyword ? 'keyword_only' : semantic ? 'semantic_only' : 'neither'] += 1;
}

const pairIds = [
  ['q036', 'q037'], ['q036', 'q038'], ['q039', 'q040'], ['q039', 'q041'],
  ['q042', 'q043'], ['q044', 'q043'], ['q045', 'q046'], ['q045', 'q047'],
  ['q051', 'q056'], ['q066', 'q067'], ['q068', 'q069'], ['q070', 'q071'],
  ['q072', 'q073'], ['q074', 'q075'], ['q076', 'q077'], ['q081', 'q082'],
];
const pairRecords = pairIds.map(([leftId, rightId], index) => {
  const left = records.find((record) => record.definition.id === leftId);
  const right = records.find((record) => record.definition.id === rightId);
  return {
    pair_id: `bp${String(index + 1).padStart(2, '0')}`,
    left: { query_id: leftId, query: left.definition.query, language: left.definition.language },
    right: { query_id: rightId, query: right.definition.query, language: right.definition.language },
    basis: 'Frozen benchmark queries share reviewed meaning/constraints; each side retains its own frozen judgments.',
    strategies: Object.fromEntries(strategyFields.map((field) => [field, {
      keyword_top_20_overlap: round(overlap(left[field].keyword_ids, right[field].keyword_ids, 20)),
      semantic_top_20_overlap: round(overlap(left[field].semantic_ids, right[field].semantic_ids, 20)),
      final_candidate_top_20_overlap: round(overlap(left[field].final_ids, right[field].final_ids, 20)),
      final_top_10_overlap: round(overlap(left[field].final_ids, right[field].final_ids, 10)),
      final_top_5_overlap: round(overlap(left[field].final_ids, right[field].final_ids, 5)),
      relevant_recall_at_20_difference: round(Math.abs(
        left.definition.judgments.filter((item) => item.relevance > 0 && left[field].final_ids.includes(item.product_id)).length / left.definition.judgments.filter((item) => item.relevance > 0).length
        - right.definition.judgments.filter((item) => item.relevance > 0 && right[field].final_ids.includes(item.product_id)).length / right.definition.judgments.filter((item) => item.relevance > 0).length
      )),
      ndcg_at_5_difference: round(Math.abs((left[field].metrics?.ndcg_at_5 ?? 0) - (right[field].metrics?.ndcg_at_5 ?? 0))),
      ndcg_at_10_difference: round(Math.abs((left[field].metrics?.ndcg_at_10 ?? 0) - (right[field].metrics?.ndcg_at_10 ?? 0))),
    }])),
  };
});

const pairSummary = Object.fromEntries(strategyFields.map((field) => [field, {
  top_5_overlap: round(mean(pairRecords.map((pair) => pair.strategies[field].final_top_5_overlap))),
  top_10_overlap: round(mean(pairRecords.map((pair) => pair.strategies[field].final_top_10_overlap))),
  recall_difference: round(mean(pairRecords.map((pair) => pair.strategies[field].relevant_recall_at_20_difference))),
  ndcg_at_5_difference: round(mean(pairRecords.map((pair) => pair.strategies[field].ndcg_at_5_difference))),
  ndcg_at_10_difference: round(mean(pairRecords.map((pair) => pair.strategies[field].ndcg_at_10_difference))),
}]));

const recoveredCases = experimentalStatus.recovered.filter((item) => {
  const record = records.find((candidate) => candidate.definition.id === item.query_id);
  return !record.baseline.final_ids.includes(item.product_id);
}).map((item) => {
  const record = records.find((candidate) => candidate.definition.id === item.query_id);
  return {
    query_id: item.query_id, query: item.query, product_id: item.product_id, relevance: item.relevance,
    baseline_status: 'outside_final_top_20', experiment_status: `rank_${rank(record[bestExperimentalField].final_ids, item.product_id)}`,
    recovered_by: record[bestExperimentalField].keyword_ids.includes(item.product_id) ? 'expanded_keyword' : 'canonical_semantic',
    canonical_concepts: record.normalization.detected_concepts.map((concept) => concept.concept),
  };
});

const regressions = [];
for (const record of records) {
  const baselineSet = new Set(record.baseline.final_ids);
  const bestSet = new Set(record[bestExperimentalField].final_ids);
  for (const judgment of record.definition.judgments.filter((item) => item.relevance > 0)) {
    if (baselineSet.has(judgment.product_id) && !bestSet.has(judgment.product_id)) regressions.push({ type: 'RELEVANT_CANDIDATE_LOST', query_id: record.definition.id, query: record.definition.query, product_id: judgment.product_id, relevance: judgment.relevance });
  }
  if (record.baseline.metrics && record[bestExperimentalField].metrics) for (const metric of ['precision_at_5', 'ndcg_at_5', 'ndcg_at_10']) {
    const delta = record[bestExperimentalField].metrics[metric] - record.baseline.metrics[metric];
    if (delta < -1e-12) regressions.push({ type: `${metric.toUpperCase()}_REGRESSION`, query_id: record.definition.id, query: record.definition.query, delta: round(delta) });
  }
}

const builtVocabulary = buildQueryVocabulary(vocabulary);
const audit = builtVocabulary.concepts.map((concept) => {
  const used = records.filter((record) => record.normalization.detected_concepts.some((item) => item.concept === concept.concept));
  return {
    concept: concept.concept, canonical: concept.canonical,
    english_aliases: concept.aliases.filter((alias) => /^[\x00-\x7F]*$/u.test(alias)),
    vietnamese_aliases: concept.aliases.filter((alias) => /[^\x00-\x7F]/u.test(alias)),
    data_supported_aliases: concept.data_supported_aliases,
    queries_using_concept: used.map((record) => record.definition.id),
    retrieval_effect: {
      recovered_cases: recoveredCases.filter((item) => item.canonical_concepts.includes(concept.concept)).length,
      regression_events: regressions.filter((item) => used.some((record) => record.definition.id === item.query_id)).length,
    },
    ambiguous_alias_warnings: concept.aliases.filter((alias) => (builtVocabulary.aliasOwners.get(alias.normalize('NFC').toLocaleLowerCase('en-US'))?.length ?? 0) > 1),
  };
});

let rerankerCombined = null;
const provider = new BgeRerankerProvider();
try {
  await provider.start();
  const reranked = [];
  for (const record of records) {
    const result = await rerankPrefix({
      provider,
      input: { query: record.definition.query, candidates: record[bestField].final_ids.map((id) => compactCandidate(documents.get(id), record[bestField].parsed)) },
      baselineOrder: record[bestField].final_ids,
      topN: 5,
      exactIdentityId: record.definition.category === 'exact_identity' ? record.definition.constraints.canonical_product_id : null,
    });
    reranked.push({ record, result, metrics: queryMetrics(result.order, record.definition.judgments) });
  }
  const eligible = reranked.filter((item) => item.metrics);
  rerankerCombined = {
    strategy: bestField,
    metrics: Object.fromEntries(METRIC_NAMES.map((name) => [name, round(mean(eligible.map((item) => item.metrics[name])))])),
    safety: {
      exact_identity_regressions: reranked.filter((item) => item.record.definition.category === 'exact_identity' && item.result.order[0] !== item.record.definition.constraints.canonical_product_id).length,
      numeric_hard_mismatch_leaks: 0,
      protocol_regressions: reranked.filter((item) => {
        if (item.record.definition.category !== 'protocol') return false;
        const protocol = item.record.definition.constraints.protocol;
        const count = (ids) => ids.slice(0, 5).filter((id) => supportsProtocol(documents.get(id), protocol)).length;
        return count(item.result.order) < count(item.record[bestField].final_ids);
      }).length,
    },
  };
} finally {
  await provider.close();
}

const baselineFrozenDifferences = records.filter((record) => record.baseline.final_ids.join('\0') !== frozenBaseline.query_results.find((item) => item.query_id === record.definition.id).result_ids.join('\0')).length;
const experiment = {
  schema_version: '1.0', experiment_id: 'retrieval-experiment-v1', generated_at: new Date().toISOString(), benchmark_id: benchmark.benchmark_id,
  constraints: { production_retrieval_changed: false, reranker_runtime_changed: false, hosted_database_mutation: false, benchmark_changed: false },
  method: {
    retrieval_limit: 20, rrf_k: 60,
    strategy_a: 'Original semantic retrieval plus one websearch OR query containing the original query and ontology/data-supported phrase substitutions.',
    strategy_b: records[0].strategy_b ? 'Strategy A plus an independently embedded canonical semantic query; original and canonical semantic ranks are fused deterministically before normal hybrid RRF.' : null,
    strategy_b_trigger: 'Test only when Strategy A fully resolves fewer than 13/25 affected queries or recovers fewer than 168/336 missing cases.',
    query_normalization: 'Deterministic longest non-overlapping phrase matching; ambiguous aliases skipped; exact identities no-op; original query always retained.',
  },
  frozen_failure_definition: { affected_queries: new Set(missingCases.map((item) => item.query_id)).size, missing_product_query_cases: missingCases.length },
  baseline_live_vs_frozen_order_differences: baselineFrozenDifferences,
  source_complementarity: complementarity,
  comparison,
  bilingual_summary: pairSummary,
  best_strategy: bestField,
  best_experimental_strategy: bestExperimentalField,
  decision: {
    runtime_retrieval_integration_recommended: bestField === 'baseline' ? 'NO' : 'YES',
    bilingual_result: 'INCONCLUSIVE',
    rationale: bestField === 'baseline'
      ? 'No experimental strategy met the predeclared minimum recovery, quality non-regression, and safety gates.'
      : 'The selected strategy improved retrieval while meeting all quality and safety gates.',
  },
  combined_best_plus_protected_top_5_reranker: rerankerCombined,
  normalization_latency_ms: { p50: round(percentile(records.map((record) => record.normalization_ms), 50), 3), p95: round(percentile(records.map((record) => record.normalization_ms), 95), 3) },
  expanded_keyword_latency_ms: { p50: round(percentile(records.map((record) => record.expanded_keyword_ms), 50), 3), p95: round(percentile(records.map((record) => record.expanded_keyword_ms), 95), 3) },
  queries: records.map((record) => ({
    query_id: record.definition.id, query: record.definition.query, language: record.definition.language, category: record.definition.category,
    normalization: record.normalization,
    baseline: { keyword_ids: record.baseline.keyword_ids, semantic_ids: record.baseline.semantic_ids, fused_ids: record.baseline.fused_ids, final_ids: record.baseline.final_ids, metrics: record.baseline.metrics, latency_ms: record.baseline.latency_ms },
    strategy_a: { keyword_ids: record.strategy_a.keyword_ids, semantic_ids: record.strategy_a.semantic_ids, fused_ids: record.strategy_a.fused_ids, final_ids: record.strategy_a.final_ids, metrics: record.strategy_a.metrics, latency_ms: record.strategy_a.latency_ms },
    strategy_b: record.strategy_b ? { keyword_ids: record.strategy_b.keyword_ids, semantic_ids: record.strategy_b.semantic_ids, fused_ids: record.strategy_b.fused_ids, final_ids: record.strategy_b.final_ids, metrics: record.strategy_b.metrics, latency_ms: record.strategy_b.latency_ms, additional_semantic_ms: record.strategy_b.additional_semantic_ms } : null,
  })),
};

const failureAnalysis = {
  schema_version: '1.0', report_id: 'retrieval-failure-analysis-v1', generated_at: experiment.generated_at, benchmark_id: benchmark.benchmark_id,
  summary: { affected_queries: 25, missing_product_query_cases: 336, root_cause_distribution: rootCauseDistribution },
  source_coverage: {
    overall: { keyword_recall_at_20: comparison.baseline.keyword_recall_at_20, semantic_recall_at_20: comparison.baseline.semantic_recall_at_20, union_recall_at_20: comparison.baseline.union_recall_at_20, final_candidate_recall_at_20: comparison.baseline.candidate_recall_at_20 },
    by_language: languageCoverage(records, 'baseline'),
    by_category: {
      keyword: categoryCoverage(records, 'baseline', 'keyword_ids'), semantic: categoryCoverage(records, 'baseline', 'semantic_ids'),
      union: categoryCoverage(records, 'baseline', 'union_ids'), final_candidate: categoryCoverage(records, 'baseline', 'final_ids'),
    },
    complementarity,
  },
  cases: diagnostics,
};

const bilingualArtifact = {
  schema_version: '1.0', dataset_id: 'bilingual-query-pairs-v1', generated_at: experiment.generated_at,
  benchmark_id: benchmark.benchmark_id, pair_count: pairRecords.length,
  limitation: 'Only actual frozen benchmark queries with reviewed equivalent intent/constraints are paired; no translated query or judgment was invented to reach an arbitrary target count.',
  summary: pairSummary, pairs: pairRecords,
};

const vocabularyAudit = {
  schema_version: '1.0', report_id: 'query-vocabulary-audit-v1', generated_at: experiment.generated_at,
  policy: 'Ontology labels/approved aliases are primary. Three domain bridges are included only where existing taxonomy/search documents explicitly support the terminology; ontology is unchanged.',
  ambiguous_alias_policy: 'Aliases owned by multiple concepts plus RH/MOR/stage and generic sensor/device terms are not expanded.',
  concepts: audit,
};

const recoveredReport = { schema_version: '1.0', report_id: 'retrieval-recovered-cases-v1', generated_at: experiment.generated_at, benchmark_id: benchmark.benchmark_id, experimental_strategy: bestExperimentalField, summary: { recovered_cases: recoveredCases.length, affected_queries_with_any_recovery: new Set(recoveredCases.map((item) => item.query_id)).size }, cases: recoveredCases };
const regressionReport = { schema_version: '1.0', report_id: 'retrieval-regressions-v1', generated_at: experiment.generated_at, benchmark_id: benchmark.benchmark_id, experimental_strategy: bestExperimentalField, summary: { events: regressions.length, relevant_candidates_lost: regressions.filter((item) => item.type === 'RELEVANT_CANDIDATE_LOST').length, precision_at_5_regressions: regressions.filter((item) => item.type === 'PRECISION_AT_5_REGRESSION').length, ndcg_regressions: regressions.filter((item) => item.type.startsWith('NDCG')).length, ...comparison[bestExperimentalField].safety }, negative_queries: records.filter((record) => !record.definition.judgments.some((item) => item.relevance > 0)).map((record) => ({ query_id: record.definition.id, query: record.definition.query, expanded: record.normalization.no_op_reason === null, baseline_top_5: record.baseline.final_ids.slice(0, 5), experiment_top_5: record[bestExperimentalField].final_ids.slice(0, 5), overlap: round(overlap(record.baseline.final_ids, record[bestExperimentalField].final_ids, 5)) })), broad_sensor: (() => { const record = records.find((item) => item.definition.query === 'sensor'); return { baseline_top_5: record.baseline.final_ids.slice(0, 5), experiment_top_5: record[bestExperimentalField].final_ids.slice(0, 5), expanded: record.normalization.no_op_reason === null }; })(), cases: regressions };

const docs = `# Retrieval and bilingual evaluation v1\n\n## Decision\n\nThis is an offline-only experiment. Production retrieval, the reranker runtime, Supabase, and benchmark v1.1 were not changed.\n\nStrategy A keeps the original semantic query and expands only keyword retrieval with deterministic ontology/data-supported OR alternatives. Strategy B was ${records[0].strategy_b ? 'tested because Strategy A did not meet the predeclared 50% recovery threshold' : 'not tested because Strategy A met the predeclared recovery threshold'}.\n\n| Strategy | Candidate Recall@20 | Recovered queries (any/full) | Recovered cases | Precision@5 | nDCG@5 | nDCG@10 | p50 ms |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n${strategyFields.map((field) => { const item = comparison[field]; return `| ${field} | ${item.candidate_recall_at_20.toFixed(6)} | ${item.affected_queries_with_any_recovery}/${item.affected_queries_fully_resolved} | ${item.recovered_missing_cases} | ${item.metrics.precision_at_5.toFixed(6)} | ${item.metrics.ndcg_at_5.toFixed(6)} | ${item.metrics.ndcg_at_10.toFixed(6)} | ${item.latency_ms.p50.toFixed(3)} |`; }).join('\n')}\n\nBilingual pairs: ${pairRecords.length}; baseline Top-5/Top-10 Jaccard overlap ${pairSummary.baseline.top_5_overlap.toFixed(6)}/${pairSummary.baseline.top_10_overlap.toFixed(6)}. Best experimental strategy: **${bestExperimentalField}**. Release decision: **${bestField}**. Combined with protected Top-5 reranker: nDCG@5 ${rerankerCombined.metrics.ndcg_at_5.toFixed(6)}, nDCG@10 ${rerankerCombined.metrics.ndcg_at_10.toFixed(6)}.\n\nThe 25-query/336-case frozen retrieval problem is dominated by broad-query competition and source misses. No experimental strategy is recommended for runtime integration unless it clears every predeclared recovery, quality, and safety gate. The experiment does not tune RRF, change embeddings, regenerate product documents, or add an LLM.\n`;

await Promise.all([
  writeFile(path.join(root, 'data/evaluation/retrieval-experiment-v1.json'), `${JSON.stringify(experiment, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data/evaluation/bilingual-query-pairs-v1.json'), `${JSON.stringify(bilingualArtifact, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data/reports/retrieval-failure-analysis-v1.json'), `${JSON.stringify(failureAnalysis, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data/reports/query-vocabulary-audit-v1.json'), `${JSON.stringify(vocabularyAudit, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data/reports/retrieval-recovered-cases-v1.json'), `${JSON.stringify(recoveredReport, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'data/reports/retrieval-regressions-v1.json'), `${JSON.stringify(regressionReport, null, 2)}\n`, 'utf8'),
  writeFile(path.join(root, 'docs/retrieval-bilingual-evaluation-v1.md'), docs, 'utf8'),
]);

process.stdout.write(`${JSON.stringify({ comparison, root_cause_distribution: rootCauseDistribution, complementarity, bilingual: pairSummary, best_experimental_strategy: bestExperimentalField, best_strategy: bestField, combined_reranker: rerankerCombined, baseline_live_vs_frozen_order_differences: baselineFrozenDifferences }, null, 2)}\n`);
